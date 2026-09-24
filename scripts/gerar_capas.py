# -*- coding: utf-8 -*-
import math
from PIL import Image, ImageDraw, ImageFont, ImageOps

BASE = "public/marca/capa.jpg"
FONTE_BOLD = r"C:\Windows\Fonts\arialbd.ttf"

CORES = {
    "pink": (239, 0, 145, 255),
    "pink_dark": (182, 3, 107, 255),
    "yellow": (255, 242, 0, 255),
    "blue": (0, 161, 215, 255),
    "white": (255, 255, 255, 255),
}


def estrela(cx, cy, raio_ext, raio_int, pontas):
    pontos = []
    passo = math.pi / pontas
    for i in range(pontas * 2):
        raio = raio_ext if i % 2 == 0 else raio_int
        angulo = i * passo - math.pi / 2
        x = cx + raio * math.cos(angulo)
        y = cy + raio * math.sin(angulo)
        pontos.append((x, y))
    return pontos


def ajustar_fonte(draw, texto, tamanho_inicial, largura_max):
    tamanho = tamanho_inicial
    while tamanho > 8:
        fonte = ImageFont.truetype(FONTE_BOLD, tamanho)
        bbox = draw.textbbox((0, 0), texto, font=fonte)
        if (bbox[2] - bbox[0]) <= largura_max:
            return fonte
        tamanho -= 2
    return ImageFont.truetype(FONTE_BOLD, 8)


def texto_centralizado(draw, texto, fonte, cx, cy, cor):
    bbox = draw.textbbox((0, 0), texto, font=fonte)
    largura = bbox[2] - bbox[0]
    altura = bbox[3] - bbox[1]
    draw.text((cx - largura / 2 - bbox[0], cy - altura / 2 - bbox[1]), texto, font=fonte, fill=cor)


def criar_selo(linha1, linha2, tamanho=440, cor_principal=CORES["pink"]):
    selo = Image.new("RGBA", (tamanho, tamanho), (0, 0, 0, 0))
    draw = ImageDraw.Draw(selo)
    cx = cy = tamanho / 2

    # Camada de fora (amarela) um pouco maior, depois a estrela principal por cima
    pontos_fora = estrela(cx, cy, tamanho * 0.47, tamanho * 0.36, 10)
    draw.polygon(pontos_fora, fill=CORES["yellow"])

    pontos = estrela(cx, cy, tamanho * 0.41, tamanho * 0.31, 10)
    draw.polygon(pontos, fill=cor_principal)

    circulo_r = tamanho * 0.30
    draw.ellipse(
        [cx - circulo_r, cy - circulo_r, cx + circulo_r, cy + circulo_r],
        fill=cor_principal,
        outline=CORES["white"],
        width=6,
    )

    largura_max = circulo_r * 1.62

    if linha2:
        fonte1 = ajustar_fonte(draw, linha1, int(tamanho * 0.135), largura_max)
        fonte2 = ajustar_fonte(draw, linha2, int(tamanho * 0.075), largura_max)
        texto_centralizado(draw, linha1, fonte1, cx, cy - tamanho * 0.06, CORES["white"])
        texto_centralizado(draw, linha2, fonte2, cx, cy + tamanho * 0.09, CORES["white"])
    else:
        fonte1 = ajustar_fonte(draw, linha1, int(tamanho * 0.135), largura_max)
        texto_centralizado(draw, linha1, fonte1, cx, cy, CORES["white"])

    return selo


def gerar_capa(nome_arquivo, linha1, linha2, cor_principal, posicao):
    base = Image.open(BASE).convert("RGBA")
    selo = criar_selo(linha1, linha2, tamanho=int(base.height * 0.62), cor_principal=cor_principal)
    selo = selo.rotate(-10, expand=True, resample=Image.BICUBIC)

    x, y = posicao
    base.alpha_composite(selo, (x, y))

    base.convert("RGB").save(f"public/marca/{nome_arquivo}", quality=95)
    print(f"Gerado: {nome_arquivo}")


if __name__ == "__main__":
    base_ref = Image.open(BASE)
    w, h = base_ref.size

    # Canto superior esquerdo (céu, sem sobrepor bebê nem logo)
    pos_esquerda = (int(w * 0.005), int(h * -0.10))

    gerar_capa("capa-ofertas.jpg", "OFERTAS", "imperdíveis", CORES["pink"], pos_esquerda)
    gerar_capa("capa-promocoes.jpg", "PROMOÇÕES", "por tempo limitado", CORES["blue"], pos_esquerda)
    gerar_capa("capa-envio-rapido.jpg", "ENVIO", "rápido p/ todo Brasil", CORES["pink_dark"], pos_esquerda)

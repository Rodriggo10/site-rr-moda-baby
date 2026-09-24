"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ShoppingBag,
  Search,
  MessageCircle,
  Sparkles,
  User,
  Home,
  Menu,
  X,
  CreditCard,
  Truck,
  Info,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatarMoeda } from "@/lib/pricing";
import { NUMERO_WHATSAPP_LOJA } from "@/lib/whatsapp";
import { useConta } from "@/lib/useConta";
import { ModalFormasPagamento } from "./ModalFormasPagamento";

function IconeInstagram({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconeFacebook({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path
        d="M14 8.5h-1.2c-.9 0-1.3.5-1.3 1.4V11h2.4l-.3 2.4h-2.1V19h-2.4v-5.6H7v-2.4h2.1V9.6c0-2 1.2-3.1 3-3.1h1.9v2Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

const LINK_FACEBOOK = "https://www.facebook.com/share/1H6QJ9hfWn/?mibextid=wwXIfr";

function BotaoIconeMobile({
  href,
  onClick,
  label,
  children,
  contador,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  contador?: number;
}) {
  const classe =
    "relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white transition active:scale-95";

  const conteudo = (
    <>
      {children}
      {typeof contador === "number" && contador > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-yellow px-1 text-[10px] font-extrabold text-brand-pink-dark">
          {contador}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={classe}>
        {conteudo}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} className={classe}>
      {conteudo}
    </button>
  );
}

export function Header() {
  const { totalItens, itens } = useCart();
  const { cliente, carregando } = useConta();
  const [busca, setBusca] = useState("");
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const router = useRouter();

  const totalCarrinho = itens.reduce((soma, i) => soma + i.precoUnitario * i.quantidade, 0);
  const linkConta = carregando ? "#" : cliente ? "/conta" : "/conta/entrar";

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    router.push(busca.trim() ? `/?busca=${encodeURIComponent(busca.trim())}` : "/");
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="overflow-hidden bg-brand-pink-dark py-1.5 text-xs font-semibold text-white sm:text-sm">
        <div className="faixa-promocional inline-flex w-max whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="mx-6 inline-flex items-center gap-2">
              <Sparkles size={14} /> RR Moda Baby e Infantil — Varejo e Atacado! Chame no
              WhatsApp e garanta o seu.
            </span>
          ))}
        </div>
      </div>

      {/* ===== MOBILE (abaixo de sm) ===== */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between bg-brand-pink px-4 py-2.5">
          <Link href="/" aria-label="Início">
            <span className="relative block h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/60">
              <Image
                src="/marca/logo-cropped.png"
                alt="R&R Moda Baby e Infantil"
                fill
                priority
                sizes="40px"
                className="object-cover"
              />
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <BotaoIconeMobile href="/" label="Início">
              <Home size={17} />
            </BotaoIconeMobile>
            <BotaoIconeMobile href={linkConta} label="Minha conta">
              <User size={17} />
            </BotaoIconeMobile>
            <BotaoIconeMobile href="/carrinho" label="Carrinho" contador={totalItens}>
              <ShoppingBag size={17} />
            </BotaoIconeMobile>
            <BotaoIconeMobile
              onClick={() => setMenuMobileAberto((v) => !v)}
              label="Menu"
            >
              {menuMobileAberto ? <X size={17} /> : <Menu size={17} />}
            </BotaoIconeMobile>
          </div>
        </div>

        {menuMobileAberto && (
          <div className="border-b border-black/5 bg-white px-4 py-3 shadow-sm">
            <div className="flex flex-col gap-1 text-sm font-semibold text-foreground/80">
              <a
                href="#rodape"
                onClick={() => setMenuMobileAberto(false)}
                className="flex items-center gap-2 rounded-xl px-2 py-2 active:bg-brand-pink/5"
              >
                <Info size={16} className="text-brand-pink" /> Informações da Loja
              </a>
              <button
                type="button"
                onClick={() => {
                  setModalPagamentoAberto(true);
                  setMenuMobileAberto(false);
                }}
                className="flex items-center gap-2 rounded-xl px-2 py-2 text-left active:bg-brand-pink/5"
              >
                <CreditCard size={16} className="text-brand-pink" /> Formas de Pagamento
              </button>
              <a
                href="#rodape"
                onClick={() => setMenuMobileAberto(false)}
                className="flex items-center gap-2 rounded-xl px-2 py-2 active:bg-brand-pink/5"
              >
                <Truck size={16} className="text-brand-pink" /> Formas de Entrega
              </a>
            </div>

            <div className="mt-3 flex items-center gap-4 border-t border-black/5 pt-3">
              <a
                href={`https://wa.me/${NUMERO_WHATSAPP_LOJA}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-brand-pink"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href="https://www.instagram.com/rr_modababyeinfantil"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-brand-pink"
              >
                <IconeInstagram size={20} />
              </a>
              <a
                href={LINK_FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-brand-pink"
              >
                <IconeFacebook size={20} />
              </a>
            </div>
          </div>
        )}

        <form onSubmit={buscar} className="flex items-center gap-2 bg-white/95 px-4 py-3 shadow-sm">
          <div className="flex flex-1 items-center rounded-full border-2 border-foreground/10 px-4 py-2">
            <Search size={16} className="text-foreground/40" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar Produtos"
              className="w-full bg-transparent px-2 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-brand-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-blue-dark"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* ===== DESKTOP (sm e acima) ===== */}
      <div className="hidden sm:block">
        {/* Barra superior: redes sociais, links institucionais e carrinho */}
        <div className="bg-brand-pink px-4 py-2 text-white sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 text-xs font-semibold sm:text-sm">
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${NUMERO_WHATSAPP_LOJA}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="opacity-90 transition hover:opacity-100"
              >
                <MessageCircle size={16} />
              </a>
              <a
                href="https://www.instagram.com/rr_modababyeinfantil"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="opacity-90 transition hover:opacity-100"
              >
                <IconeInstagram size={16} />
              </a>
              <a
                href={LINK_FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="opacity-90 transition hover:opacity-100"
              >
                <IconeFacebook size={16} />
              </a>
            </div>

            <div className="hidden items-center gap-5 sm:flex">
              <a href="#rodape" className="opacity-90 transition hover:opacity-100">
                Informações da Loja
              </a>
              <button
                type="button"
                onClick={() => setModalPagamentoAberto(true)}
                className="opacity-90 transition hover:opacity-100"
              >
                Formas de Pagamento
              </button>
              <a href="#rodape" className="opacity-90 transition hover:opacity-100">
                Formas de Entrega
              </a>
            </div>

            <Link
              href="/carrinho"
              className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 transition hover:bg-white/25"
            >
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">Seu carrinho</span>
              <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-[11px] font-extrabold text-brand-pink-dark">
                {totalItens}
              </span>
              <span className="hidden font-extrabold sm:inline">{formatarMoeda(totalCarrinho)}</span>
            </Link>
          </div>
        </div>

        {/* Barra branca: busca, logo e minha conta */}
        <div className="bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-3 px-4 py-3 sm:grid-cols-3 sm:px-6">
            <form onSubmit={buscar} className="order-2 flex items-center gap-2 justify-self-center sm:order-1 sm:justify-self-start">
              <div className="flex items-center rounded-full border-2 border-foreground/10 px-4 py-1.5">
                <Search size={16} className="text-foreground/40" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar produtos"
                  className="w-36 bg-transparent px-2 text-sm outline-none sm:w-44"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-brand-blue px-4 py-1.5 text-sm font-bold text-white transition hover:bg-brand-blue-dark"
              >
                Buscar
              </button>
            </form>

            <Link href="/" className="order-1 justify-self-center sm:order-2">
              <span className="relative block h-16 w-16 overflow-hidden rounded-full ring-2 ring-brand-pink/30 sm:h-20 sm:w-20">
                <Image
                  src="/marca/logo-cropped.png"
                  alt="R&R Moda Baby e Infantil"
                  fill
                  priority
                  sizes="80px"
                  className="object-cover"
                />
              </span>
            </Link>

            <Link
              href={linkConta}
              className="order-3 flex items-center gap-2 justify-self-center text-sm font-bold text-brand-blue-dark transition hover:text-brand-pink-dark sm:justify-self-end"
            >
              <User size={18} />
              {cliente ? cliente.nome.split(" ")[0] : "Minha Conta"}
            </Link>
          </div>
        </div>
      </div>

      <ModalFormasPagamento
        aberto={modalPagamentoAberto}
        onFechar={() => setModalPagamentoAberto(false)}
      />
    </header>
  );
}

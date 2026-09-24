import { MapPin, Phone } from "lucide-react";

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

export function Footer() {
  return (
    <footer id="rodape" className="mt-16 bg-brand-pink-dark py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3 sm:px-6">
        <div>
          <h3 className="mb-2 text-lg font-extrabold">R&R Moda Baby e Infantil</h3>
          <p className="text-sm text-white/80">Enxoval para o bebê, kids e teen. Varejo e atacado.</p>
        </div>

        <div className="space-y-2 text-sm text-white/90">
          <p className="flex items-center gap-2">
            <Phone size={16} /> (91) 98490-5919 / 98496-2634
          </p>
          <p className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            Rua Francisco Pereira da Silva, 534 — Jaderlândia, Castanhal/PA
          </p>
          <a
            href="https://www.instagram.com/rr_modababyeinfantil"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <IconeInstagram size={16} /> @rr_modababyeinfantil
          </a>
          <a
            href={LINK_FACEBOOK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <IconeFacebook size={16} /> Facebook
          </a>
        </div>

        <div className="text-sm text-white/80">
          <h4 className="mb-2 font-bold text-white">Políticas da loja</h4>
          <p>Trocas e devoluções: consulte diretamente pelo WhatsApp.</p>
          <p className="mt-1">Frete calculado no carrinho, por CEP.</p>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-white/60">
        © {new Date().getFullYear()} R&amp;R Moda Baby e Infantil. Todos os direitos reservados.
      </p>
    </footer>
  );
}

export interface Promocao {
  precoDe: number;
  precoPor: number;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  novidade: boolean;
  destaque: boolean; // aparece em "Mais vendidos"
  esgotado: boolean;
  promocao: Promocao | null;
  precoVarejo: number;
  tamanhos: string[];
  cores: string[];
  fotos: string[];
  videos: string[];
  criadoEm: string;
}

export interface ItemCarrinho {
  produtoId: string;
  nome: string;
  tamanho: string;
  cor: string;
  quantidade: number;
  precoUnitario: number;
}

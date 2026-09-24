import { supabaseAdmin } from "./supabaseAdmin";

export interface EnderecoSalvo {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  senhaHash: string;
  endereco: EnderecoSalvo | null;
  criadoEm: string;
}

export type ClientePublico = Omit<Cliente, "senhaHash">;

interface LinhaCliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  senha_hash: string;
  endereco: EnderecoSalvo | null;
  criado_em: string;
}

function paraCliente(linha: LinhaCliente): Cliente {
  return {
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    telefone: linha.telefone,
    senhaHash: linha.senha_hash,
    endereco: linha.endereco,
    criadoEm: linha.criado_em,
  };
}

export function paraPublico(cliente: Cliente): ClientePublico {
  const { senhaHash: _senhaHash, ...publico } = cliente;
  return publico;
}

export async function buscarClientePorEmail(email: string): Promise<Cliente | null> {
  const { data, error } = await supabaseAdmin
    .from("clientes")
    .select("*")
    .ilike("email", email.trim())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? paraCliente(data as LinhaCliente) : null;
}

export async function buscarClientePorId(id: string): Promise<Cliente | null> {
  const { data, error } = await supabaseAdmin
    .from("clientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? paraCliente(data as LinhaCliente) : null;
}

export async function criarCliente(dados: {
  nome: string;
  email: string;
  telefone: string;
  senhaHash: string;
}): Promise<Cliente> {
  const { data, error } = await supabaseAdmin
    .from("clientes")
    .insert({
      nome: dados.nome,
      email: dados.email.trim().toLowerCase(),
      telefone: dados.telefone,
      senha_hash: dados.senhaHash,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return paraCliente(data as LinhaCliente);
}

export async function atualizarEnderecoCliente(
  id: string,
  endereco: EnderecoSalvo
): Promise<Cliente | null> {
  const { data, error } = await supabaseAdmin
    .from("clientes")
    .update({ endereco })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? paraCliente(data as LinhaCliente) : null;
}

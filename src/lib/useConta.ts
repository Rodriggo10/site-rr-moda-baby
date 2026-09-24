"use client";

import { useEffect, useState } from "react";
import type { EnderecoSalvo } from "./clientes";

export interface ClientePublico {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: EnderecoSalvo | null;
  criadoEm: string;
}

export function useConta() {
  const [cliente, setCliente] = useState<ClientePublico | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    fetch("/api/conta/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((dados) => {
        if (ativo) setCliente(dados?.cliente ?? null);
      })
      .catch(() => {
        if (ativo) setCliente(null);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return { cliente, carregando, setCliente };
}

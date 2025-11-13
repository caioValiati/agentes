import api from "./api";
import { Classificacao, Movimento, Pessoa } from "../types/typ";

export const getPessoas = async () => {
  const response = await api.get("/pessoas");
  return response.data;
};

export const createPessoa = async (pessoaData: Pessoa) => {
  const response = await api.post("/pessoas", pessoaData);
  return response.data;
};

export const getClassificacoes = async () => {
  const response = await api.get("/classificacoes");
  return response.data;
};

export const createClassificacao = async (classificacaoData: Classificacao) => {
  const response = await api.post("/classificacoes", classificacaoData);
  return response.data;
};

export const getMovimentos = async () => {
  const response = await api.get("/movimentos");
  return response.data;
};

export const createMovimentos = async (movimento: Movimento) => {
  const response = await api.post("/movimentos", movimento);
  return response.data;
};

export const getParcelas = async (idMovimento: number) => {
  const response = await api.get(`/movimentos/${idMovimento}/parcelas`);
  return response.data;
};

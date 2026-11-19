// Só no navegador. Foto de celular passa de 4 MB; para reconhecer um rosto basta ~800 px.
const LADO_MAXIMO = 800;
const QUALIDADE_JPEG = 0.85;

// Erro com mensagem já em português, segura para mostrar ao usuário.
export class ErroFoto extends Error {}

// Reduz e converte para JPEG, respeitando a orientação do aparelho. Lança Error com mensagem para o usuário.
export async function reduzirFoto(arquivo: Blob): Promise<Blob> {
  let imagem: ImageBitmap;
  try {
    imagem = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  } catch {
    throw new ErroFoto("Não foi possível abrir essa foto. Tente outra imagem em JPEG, PNG ou WebP.");
  }
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.width, imagem.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(imagem.width * escala);
  canvas.height = Math.round(imagem.height * escala);
  const contexto = canvas.getContext("2d");
  if (!contexto) throw new ErroFoto("Seu navegador não conseguiu preparar a foto. Tente em outro aparelho.");
  contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
  imagem.close();

  const blob = await new Promise<Blob | null>((resolver) => canvas.toBlob(resolver, "image/jpeg", QUALIDADE_JPEG));
  if (!blob) throw new ErroFoto("Não foi possível preparar a foto. Tente outra imagem.");
  return blob;
}

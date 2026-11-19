"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CameraIcon, Loader2Icon, VideoIcon } from "lucide-react";
import { Botao } from "@/components/comum/Botao";

// Webcam só faz sentido em computador (mouse/trackpad). No celular, o botão "Tirar foto" já abre a câmera.
const consulta = "(pointer: fine)";
function assinar(aviso: () => void) {
  const mq = window.matchMedia(consulta);
  mq.addEventListener("change", aviso);
  return () => mq.removeEventListener("change", aviso);
}
const temWebcamPossivel = () => window.matchMedia(consulta).matches && !!navigator.mediaDevices?.getUserMedia;

function mensagemDeErro(erro: unknown): string {
  const nome = erro instanceof DOMException ? erro.name : "";
  if (nome === "NotAllowedError") return "O navegador bloqueou a câmera. Clique no ícone de câmera na barra de endereço, permita e tente de novo.";
  if (nome === "NotFoundError" || nome === "OverconstrainedError") return "Nenhuma câmera encontrada neste computador. Use “Da galeria”.";
  if (nome === "NotReadableError") return "A câmera está em uso por outro programa. Feche-o e tente de novo.";
  return "Não foi possível abrir a câmera. Use “Da galeria” ou tente em outro aparelho.";
}

interface Props {
  desabilitado: boolean;
  aoCapturar: (foto: Blob) => void;
}

export function CapturaWebcam({ desabilitado, aoCapturar }: Props) {
  const disponivel = useSyncExternalStore(assinar, temWebcamPossivel, () => false);
  const [aberta, setAberta] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const fluxo = useRef<MediaStream | null>(null);

  function parar() {
    fluxo.current?.getTracks().forEach((t) => t.stop());
    fluxo.current = null;
  }

  // Desliga a câmera ao sair da tela (a luz da webcam não pode ficar acesa).
  useEffect(() => parar, []);

  async function abrir() {
    setErro(null);
    setCarregando(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      fluxo.current = stream;
      setAberta(true);
      requestAnimationFrame(() => {
        if (video.current) {
          video.current.srcObject = stream;
          void video.current.play();
        }
      });
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  function fechar() {
    parar();
    setAberta(false);
  }

  function capturar() {
    const v = video.current;
    if (!v || v.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) {
        setErro("Não foi possível capturar a foto. Tente de novo.");
        return;
      }
      fechar();
      aoCapturar(blob);
    }, "image/jpeg", 0.92);
  }

  if (!disponivel) return null;

  return (
    <div className="flex w-full flex-col gap-2">
      {!aberta && (
        <Botao type="button" variant="outline" onClick={() => void abrir()} disabled={desabilitado} carregando={carregando} textoCarregando="Abrindo câmera…">
          <VideoIcon className="size-5" aria-hidden="true" /> Usar webcam
        </Botao>
      )}
      {aberta && (
        <div role="group" aria-label="Câmera do computador" className="flex flex-col gap-2">
          {/* Espelhado na tela (como um espelho); a foto salva sai na orientação real. */}
          <video ref={video} muted playsInline aria-label="Imagem ao vivo da webcam" className="aspect-[4/3] w-full -scale-x-100 rounded-xl bg-muted object-cover" />
          <p className="text-sm text-muted-foreground">Centralize o rosto e clique em “Capturar foto”.</p>
          <Botao type="button" onClick={capturar}>
            <CameraIcon className="size-5" aria-hidden="true" /> Capturar foto
          </Botao>
          <Botao type="button" variant="ghost" onClick={fechar}>
            Cancelar
          </Botao>
        </div>
      )}
      {carregando && <span className="sr-only" role="status"><Loader2Icon aria-hidden="true" />Abrindo câmera</span>}
      {erro && <p role="alert" className="text-sm font-medium text-destructive">{erro}</p>}
    </div>
  );
}

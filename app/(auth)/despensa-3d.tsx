"use client";

import { useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial } from "three";

// Demonstração 3D da despensa na tela de acesso: armário de 3 prateleiras e uma funcionária
// que guarda, retira e confere itens. Cena ilustrativa (dados fictícios), sem texto técnico.
const ETAPAS_CENA = 4;
const DURACAO_ETAPA = 3.6; // segundos
const CICLO = DURACAO_ETAPA * ETAPAS_CENA;

const MADEIRA = "#9A6B45";
const MADEIRA_ESCURA = "#6E4A2F";
const PRATELEIRAS_Y = [0.12, 0.92, 1.72]; // base de cada prateleira
const VAOS_X = [-0.84, -0.28, 0.28, 0.84];

type Vetor = [number, number, number];
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(Math.max(t, 0), 1);
const suave = (t: number) => {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
};
const mistura = (a: Vetor, b: Vetor, t: number): Vetor => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

interface Produto {
  cor: string;
  tamanho: Vetor;
}
const LEITE: Produto = { cor: "#BFD9F2", tamanho: [0.3, 0.46, 0.3] };
const ARROZ: Produto = { cor: "#F1D98B", tamanho: [0.42, 0.32, 0.28] };
const FEIJAO: Produto = { cor: "#C98C62", tamanho: [0.4, 0.3, 0.28] };
const OLEO: Produto = { cor: "#F3E27A", tamanho: [0.22, 0.48, 0.22] };
const MASSA: Produto = { cor: "#F5C46A", tamanho: [0.42, 0.24, 0.26] };

const noVao = (prateleira: number, vao: number, p: Produto): Vetor => [VAOS_X[vao], PRATELEIRAS_Y[prateleira] + 0.04 + p.tamanho[1] / 2, 0];

const FIXOS: { produto: Produto; prateleira: number; vao: number }[] = [
  { produto: LEITE, prateleira: 2, vao: 0 },
  { produto: LEITE, prateleira: 2, vao: 2 },
  { produto: FEIJAO, prateleira: 1, vao: 1 },
  { produto: FEIJAO, prateleira: 1, vao: 2 },
  { produto: OLEO, prateleira: 1, vao: 3 },
  { produto: ARROZ, prateleira: 0, vao: 0 },
  { produto: MASSA, prateleira: 0, vao: 2 },
  { produto: ARROZ, prateleira: 0, vao: 3 },
];

function Caixa({ produto, posicao, children }: { produto: Produto; posicao: Vetor; children?: ReactNode }) {
  return (
    <RoundedBox args={produto.tamanho} radius={0.03} smoothness={3} position={posicao} castShadow receiveShadow>
      <meshStandardMaterial color={produto.cor} roughness={0.7} />
      {children}
    </RoundedBox>
  );
}

function Armario() {
  return (
    <group>
      <mesh position={[0, 1.3, -0.32]} receiveShadow>
        <boxGeometry args={[2.36, 2.6, 0.04]} />
        <meshStandardMaterial color={MADEIRA_ESCURA} roughness={0.9} />
      </mesh>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 1.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.06, 2.6, 0.68]} />
          <meshStandardMaterial color={MADEIRA} roughness={0.8} />
        </mesh>
      ))}
      {[...PRATELEIRAS_Y, 2.58].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.46, 0.06, 0.7]} />
          <meshStandardMaterial color={MADEIRA} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// Funcionária: corpo com avental, cabeça e touca; pernas balançam quando anda.
function Funcionaria({ grupo, pernaA, pernaB }: { grupo: React.RefObject<Group | null>; pernaA: React.RefObject<Mesh | null>; pernaB: React.RefObject<Mesh | null> }) {
  return (
    <group ref={grupo} scale={0.78}>
      <mesh ref={pernaA} position={[-0.09, 0.28, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.36, 4, 8]} />
        <meshStandardMaterial color="#2F3A33" />
      </mesh>
      <mesh ref={pernaB} position={[0.09, 0.28, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.36, 4, 8]} />
        <meshStandardMaterial color="#2F3A33" />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.42, 6, 16]} />
        <meshStandardMaterial color="#2F6B4F" />
      </mesh>
      <mesh position={[0, 0.78, 0.17]}>
        <boxGeometry args={[0.26, 0.42, 0.04]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 1.32, 0]} castShadow>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial color="#E9B48A" />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <cylinderGeometry args={[0.15, 0.17, 0.14, 24]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

const MAOS: Vetor = [0, 0.75, 0.26];

function Cena({ pausado, aoMudarEtapa }: { pausado: boolean; aoMudarEtapa: (etapa: number) => void }) {
  const tempo = useRef(0);
  const etapaAnterior = useRef(-1);
  const xAnterior = useRef(2.9);
  const pessoa = useRef<Group>(null);
  const pernaA = useRef<Mesh>(null);
  const pernaB = useRef<Mesh>(null);
  const caixaNova = useRef<Group>(null);
  const caixaSai = useRef<Group>(null);
  const leiteAlerta = useRef<MeshStandardMaterial>(null);
  const vaoVazio = useRef<MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    if (!pausado) tempo.current = (tempo.current + Math.min(delta, 0.1)) % CICLO;
    const t = tempo.current;
    const etapa = Math.floor(t / DURACAO_ETAPA);
    const u = (t % DURACAO_ETAPA) / DURACAO_ETAPA;
    if (etapa !== etapaAnterior.current) {
      etapaAnterior.current = etapa;
      aoMudarEtapa(etapa);
    }

    // posição da funcionária ao longo do ciclo
    let x = 1.9;
    let andando = false;
    if (etapa === 0) {
      x = lerp(2.9, 1.55, suave(u / 0.45));
      andando = u < 0.45;
    } else if (etapa === 1) {
      x = u < 0.4 ? lerp(1.55, -1.5, suave(u / 0.4)) : u < 0.6 ? -1.5 : lerp(-1.5, -2.9, suave((u - 0.6) / 0.4));
      andando = u < 0.4 || u > 0.6;
    } else if (etapa === 2) {
      x = lerp(-2.9, 1.9, suave(u / 0.6));
      andando = u < 0.6;
    } else {
      x = lerp(1.9, 2.9, suave((u - 0.7) / 0.3));
      andando = u > 0.7;
    }
    const pos: Vetor = [x, 0, 0.75];
    if (pessoa.current) {
      pessoa.current.position.set(...pos);
      // vira para o lado em que anda; parada, fica de frente
      const dx = x - xAnterior.current;
      xAnterior.current = x;
      pessoa.current.rotation.y = andando && Math.abs(dx) > 1e-4 ? Math.sign(dx) * Math.PI * 0.4 : 0;
      pessoa.current.position.y = andando ? Math.abs(Math.sin(t * 9)) * 0.03 : 0;
    }
    const balanço = andando ? Math.sin(t * 9) * 0.5 : 0;
    pernaA.current?.rotation.set(balanço, 0, 0);
    pernaB.current?.rotation.set(-balanço, 0, 0);
    const maos: Vetor = [pos[0] + MAOS[0], MAOS[1], pos[2] + MAOS[2]];

    // Entrada: leve leite novo para o vão vazio da prateleira de cima
    if (caixaNova.current) {
      const destino = noVao(2, 3, LEITE);
      const p = etapa === 0 ? (u < 0.5 ? maos : mistura(maos, destino, suave((u - 0.5) / 0.35))) : destino;
      if (etapa === 0 && u >= 0.5 && u < 0.85) p[1] += Math.sin(((u - 0.5) / 0.35) * Math.PI) * 0.35;
      caixaNova.current.position.set(...p);
    }

    // Saída (FEFO): o feijão que vence antes desliza para frente e vai com ela
    if (caixaSai.current) {
      const origem = noVao(1, 0, FEIJAO);
      const frente: Vetor = [origem[0], origem[1], 0.5];
      let p: Vetor = origem;
      if (etapa === 1) p = u < 0.4 ? mistura(origem, frente, suave(u / 0.3)) : u < 0.6 ? mistura(frente, maos, suave((u - 0.4) / 0.2)) : maos;
      caixaSai.current.position.set(...p);
      caixaSai.current.visible = etapa <= 1;
    }

    // Validade: um leite pulsa em âmbar
    const pulso = (Math.sin(t * 6) + 1) / 2;
    if (leiteAlerta.current) leiteAlerta.current.emissiveIntensity = etapa === 2 ? 0.25 + pulso * 0.6 : 0;

    // Compras: vão vazio fica vermelho
    if (vaoVazio.current) vaoVazio.current.opacity = etapa === 3 ? 0.25 + pulso * 0.35 : 0;
  });

  return (
    <>
      <hemisphereLight args={["#FFF7E8", "#2F6B4F", 0.9]} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <Armario />
      {FIXOS.map((f, i) => (
        <Caixa key={i} produto={f.produto} posicao={noVao(f.prateleira, f.vao, f.produto)} />
      ))}

      <RoundedBox args={LEITE.tamanho} radius={0.03} position={noVao(2, 1, LEITE)} castShadow>
        <meshStandardMaterial ref={leiteAlerta} color={LEITE.cor} emissive="#F2A93B" emissiveIntensity={0} />
      </RoundedBox>

      <group ref={caixaNova}>
        <Caixa produto={LEITE} posicao={[0, 0, 0]} />
      </group>
      <group ref={caixaSai}>
        <Caixa produto={FEIJAO} posicao={[0, 0, 0]} />
      </group>

      <mesh position={noVao(0, 1, ARROZ)}>
        <boxGeometry args={ARROZ.tamanho} />
        <meshStandardMaterial ref={vaoVazio} color="#E5484D" transparent opacity={0} />
      </mesh>

      <Funcionaria grupo={pessoa} pernaA={pernaA} pernaB={pernaB} />
      <ContactShadows position={[0, 0.001, 0.3]} opacity={0.45} scale={8} blur={2.4} far={3} />
    </>
  );
}

export default function Despensa3D({ pausado, aoMudarEtapa }: { pausado: boolean; aoMudarEtapa: (etapa: number) => void }) {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [2.9, 2.3, 4.6], fov: 36 }} aria-hidden="true">
      <Cena pausado={pausado} aoMudarEtapa={aoMudarEtapa} />
      <OrbitControls
        target={[0, 1.15, 0]}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.1}
        minAzimuthAngle={-0.2}
        maxAzimuthAngle={1.1}
      />
    </Canvas>
  );
}

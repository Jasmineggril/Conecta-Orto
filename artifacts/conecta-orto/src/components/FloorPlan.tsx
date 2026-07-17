/**
 * Planta baixa SVG do Campus UnDF — Conecta Orto 2026.
 * Renderizada inline para preencher o container 100%×100%,
 * garantindo que os marcadores se alinhem com os ambientes.
 */
export default function FloorPlan() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 700"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      style={{ display: "block", background: "#f5f5f0" }}
    >
      <defs>
        {/* subtle grid */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ccc" strokeWidth="0.4" />
        </pattern>
        {/* hatch for thick walls */}
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#aaa" strokeWidth="2" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect width="1000" height="700" fill="url(#grid)" />

      {/* ── OUTER BUILDING (diamond / losango) ───────────────────────── */}
      <polygon
        points="500,18 975,350 500,682 25,350"
        fill="#efefea"
        stroke="#555"
        strokeWidth="3"
      />

      {/* ── INNER COURTYARD (Jardim Central) ─────────────────────────── */}
      <polygon
        points="500,258 628,350 500,442 372,350"
        fill="#c8e6c9"
        stroke="#388e3c"
        strokeWidth="2"
      />
      {/* garden texture lines */}
      <line x1="436" y1="350" x2="564" y2="350" stroke="#66bb6a" strokeWidth="1" strokeDasharray="4,4" />
      <line x1="500" y1="294" x2="500" y2="406" stroke="#66bb6a" strokeWidth="1" strokeDasharray="4,4" />
      <ellipse cx="500" cy="350" rx="34" ry="24" fill="#a5d6a7" stroke="#388e3c" strokeWidth="1" />
      <text x="500" y="346" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1b5e20">JARDIM</text>
      <text x="500" y="360" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1b5e20">CENTRAL</text>

      {/* ── CORRIDORS (dashed diagonal) ───────────────────────────────── */}
      {/* top-left to center */}
      <line x1="350" y1="220" x2="372" y2="350" stroke="#999" strokeWidth="1.5" strokeDasharray="8,5" />
      {/* top-right to center */}
      <line x1="650" y1="220" x2="628" y2="350" stroke="#999" strokeWidth="1.5" strokeDasharray="8,5" />
      {/* bottom-left to center */}
      <line x1="350" y1="480" x2="372" y2="350" stroke="#999" strokeWidth="1.5" strokeDasharray="8,5" />
      {/* bottom-right to center */}
      <line x1="650" y1="480" x2="628" y2="350" stroke="#999" strokeWidth="1.5" strokeDasharray="8,5" />

      {/* ── NORTH ZONE — Banheiros (50%, 21%) ────────────────────────── */}
      <polygon points="500,18 575,130 500,175 425,130" fill="#fff8e1" stroke="#777" strokeWidth="1.5" />
      <text x="500" y="100" textAnchor="middle" fontSize="10" fill="#555">BANHEIROS</text>
      <text x="500" y="113" textAnchor="middle" fontSize="8" fill="#888">M / F / Acess.</text>

      {/* ── UPPER-RIGHT — Sala de Treinamento (61%, 27%) ─────────────── */}
      <polygon points="575,130 760,215 700,290 610,240 610,190" fill="#fce4ec" stroke="#777" strokeWidth="1.5" />
      <text x="670" y="200" textAnchor="middle" fontSize="10" fill="#555">SALA DE</text>
      <text x="670" y="214" textAnchor="middle" fontSize="10" fill="#555">TREINAMENTO</text>

      {/* ── LEFT UPPER — Biblioteca (28%, 37%) ───────────────────────── */}
      <polygon points="425,130 240,215 270,310 390,260 425,175" fill="#e3f2fd" stroke="#777" strokeWidth="1.5" />
      <text x="302" y="248" textAnchor="middle" fontSize="10" fill="#555">BIBLIOTECA</text>

      {/* ── RIGHT UPPER — Laboratório 01 (67%, 42%) ──────────────────── */}
      <polygon points="760,215 975,350 870,350 700,290" fill="#f3e5f5" stroke="#777" strokeWidth="1.5" />
      <text x="820" y="308" textAnchor="middle" fontSize="10" fill="#555">LABORATÓRIO</text>
      <text x="820" y="322" textAnchor="middle" fontSize="10" fill="#555">01</text>

      {/* ── LEFT LOWER — Laboratório 04 (30%, 52%) ───────────────────── */}
      <polygon points="25,350 240,485 270,390 130,350" fill="#f3e5f5" stroke="#777" strokeWidth="1.5" />
      <text x="158" y="397" textAnchor="middle" fontSize="10" fill="#555">LABORATÓRIO</text>
      <text x="158" y="411" textAnchor="middle" fontSize="10" fill="#555">04</text>

      {/* ── LEFT-MID — Laboratório 05 extra fill */}
      <polygon points="270,310 390,260 372,350 270,390" fill="#e8eaf6" stroke="#777" strokeWidth="1" />
      <text x="315" y="334" textAnchor="middle" fontSize="9" fill="#777">LAB 05</text>

      {/* ── RIGHT LOWER — Laboratório 03 (64%, 57%) ──────────────────── */}
      <polygon points="975,350 760,485 700,410 870,350" fill="#f3e5f5" stroke="#777" strokeWidth="1.5" />
      <text x="828" y="410" textAnchor="middle" fontSize="10" fill="#555">LABORATÓRIO</text>
      <text x="828" y="424" textAnchor="middle" fontSize="10" fill="#555">03</text>

      {/* ── RIGHT-MID — Laboratório extra */}
      <polygon points="700,290 628,350 700,410 780,350" fill="#ede7f6" stroke="#777" strokeWidth="1" />
      <text x="720" y="354" textAnchor="middle" fontSize="9" fill="#777">LAB 07</text>

      {/* ── LEFT-MID lower — Laboratório 06 */}
      <polygon points="372,350 270,390 310,445 390,430" fill="#e8eaf6" stroke="#777" strokeWidth="1" />
      <text x="345" y="407" textAnchor="middle" fontSize="9" fill="#777">LAB 06</text>

      {/* ── LOWER-LEFT — Sala de Aula 01 (38%, 67%) ──────────────────── */}
      <polygon points="240,485 390,580 440,510 310,445" fill="#e0f2f1" stroke="#777" strokeWidth="1.5" />
      <text x="352" y="508" textAnchor="middle" fontSize="10" fill="#555">SALA DE</text>
      <text x="352" y="522" textAnchor="middle" fontSize="10" fill="#555">AULA</text>

      {/* ── LOWER-CENTER — Sala de Aula 02 (53%, 65%) ────────────────── */}
      <polygon points="440,510 570,510 540,570 390,580" fill="#e0f7fa" stroke="#777" strokeWidth="1.5" />
      <text x="482" y="543" textAnchor="middle" fontSize="10" fill="#555">SALA AULA 02</text>

      {/* ── LOWER-RIGHT — Laboratório 07 area */}
      <polygon points="570,510 700,410 760,485 540,570" fill="#f1f8e9" stroke="#777" strokeWidth="1" />
      <text x="640" y="488" textAnchor="middle" fontSize="9" fill="#777">LAB 06</text>

      {/* ── SOUTH — Entrada Principal (51%, 78%) ─────────────────────── */}
      <polygon points="390,580 540,570 500,640 500,682 450,650" fill="#ffebee" stroke="#777" strokeWidth="1.5" />
      <rect x="462" y="590" width="76" height="22" rx="3" fill="#e53935" opacity="0.15" stroke="#e53935" strokeWidth="1" />
      <text x="500" y="606" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#c62828">ENTRADA</text>
      <text x="500" y="620" textAnchor="middle" fontSize="9" fill="#c62828">PRINCIPAL</text>

      {/* ── ARCHITECTURAL NOTATION ────────────────────────────────────── */}
      {/* compass / directions */}
      {[
        { x: 500, y: 680, label: "D" }, { x: 500, y: 12, label: "D" },
        { x: 25, y: 350, label: "A" }, { x: 975, y: 350, label: "A" },
      ].map(({ x, y, label }) => (
        <g key={`${x}-${y}`}>
          <line x1={x === 500 ? x - 14 : x} y1={x === 500 ? y : y - 14}
            x2={x === 500 ? x + 14 : x} y2={x === 500 ? y : y + 14}
            stroke="#888" strokeWidth="1.5" />
          <text x={x === 500 ? x + 18 : (x < 500 ? x - 18 : x + 18)} y={y + 4}
            textAnchor="middle" fontSize="11" fill="#666" fontStyle="italic">{label}</text>
        </g>
      ))}

      {/* Section arrows */}
      <text x="50" y="30" textAnchor="start" fontSize="12" fill="#444">B</text>
      <text x="950" y="30" textAnchor="end" fontSize="12" fill="#444">G</text>
      <text x="50" y="690" textAnchor="start" fontSize="12" fill="#444">B</text>
      <text x="950" y="690" textAnchor="end" fontSize="12" fill="#444">C</text>

      {/* Scale bar */}
      <g transform="translate(820,660)">
        <rect x="0" y="0" width="60" height="7" fill="#555" />
        <rect x="0" y="0" width="30" height="7" fill="white" />
        <text x="0" y="20" fontSize="8" fill="#555">0</text>
        <text x="25" y="20" fontSize="8" fill="#555">10m</text>
        <text x="52" y="20" fontSize="8" fill="#555">20m</text>
      </g>

      {/* Title block */}
      <rect x="10" y="10" width="200" height="36" fill="white" stroke="#bbb" strokeWidth="1" />
      <text x="18" y="25" fontSize="10" fontWeight="bold" fill="#333">PLANTA BAIXA — TÉRREO</text>
      <text x="18" y="38" fontSize="9" fill="#666">UnDF Campus Norte — Conecta Orto 2026</text>
    </svg>
  );
}

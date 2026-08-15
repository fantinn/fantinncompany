/* O F da marca: haste reta, braços cortados em diagonal — as pontas
   apontam para a direita, como as setas usadas no resto do material. */
export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 85 100"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 0 H85 L62 28 H26 V40 H62 L44 66 H26 V100 H0 Z" />
    </svg>
  );
}

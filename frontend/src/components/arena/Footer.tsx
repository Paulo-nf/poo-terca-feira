export function Footer() {
  return (
    <footer className="bg-blue-dark px-12 py-8 flex items-center justify-between flex-wrap gap-4 max-md:px-5 max-md:py-7">
      <span className="text-[13px] text-primary-foreground/45">
        © 2026 Arena de Pernambuco · Squad 19
      </span>
      <div className="flex gap-6">
        {["Sobre nós", "Contato", "Política de Privacidade", "Termos de Serviço"].map((text) => (
          <a key={text} href="#" className="text-[13px] text-primary-foreground/55 hover:text-primary-foreground transition-colors no-underline">
            {text}
          </a>
        ))}
      </div>
    </footer>
  );
}

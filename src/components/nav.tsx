import { Link, useLocation } from "@tanstack/react-router";

export const Nav = () => {
  const { pathname } = useLocation();
  const uri = pathname === "/history" ? "/" : "/history";

  return (
    <div className="flex flex-col absolute top-12 w-full text-center">
      <p className="text-xl font-medium">kanji</p>

      <Link
        to={uri}
        className="underline text-muted-foreground hover:text-white transition-all duration-75"
      >
        /{pathname === "/history" ? "index" : "history"}
      </Link>

      <a
        href="https://github.com/anuraglol/kanji"
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-muted-foreground hover:text-white transition-all duration-75"
      >
        source-code
      </a>
    </div>
  );
};

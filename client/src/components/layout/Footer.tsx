

export const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-1 md:py-6 w-full ">
      <div className="mx-auto container flex flex-col items-center justify-center  md:flex-row md:gap-8">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by {" "}
          <a
            href="https://www.linkedin.com/in/mayank-tomar-10a049233/"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Mayank Tomar
          </a>
          .
        </p>
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-right">
          The source code is available on {" "}
          <a
            href="https://github.com/htomar6397/AuthFlow"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
};

export default Footer;

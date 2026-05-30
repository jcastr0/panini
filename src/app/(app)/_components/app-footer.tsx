import { SupportButton } from "./support-button";

/** Footer global discreto. En el layout móvil queda escondido detrás del MobileTabBar; en desktop se ve normal. */
export function AppFooter() {
  return (
    <footer className="border-t mt-12 py-5 px-6 hidden md:block">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap text-xs text-muted-foreground">
        <p>
          Panini·JD · Proyecto independiente, no afiliado a Panini Group
        </p>
        <SupportButton />
      </div>
    </footer>
  );
}

/** Versión móvil: queda dentro del scroll de la página antes del padding del tab bar */
export function AppFooterMobile() {
  return (
    <div className="md:hidden flex items-center justify-center gap-4 py-4 text-xs text-muted-foreground border-t mt-8">
      <SupportButton />
    </div>
  );
}

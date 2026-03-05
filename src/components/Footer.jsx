import { Link, Divider } from "@heroui/react";

/**
 * Professional footer component to display credit and developer information.
 * 
 * @returns {JSX.Element}
 */
function Footer() {
    return (
        <footer className="w-full py-8 px-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-default-500 text-sm">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <p className="font-bold text-white tracking-tighter text-lg">
                        <span className="text-primary">TRIP</span>PLANNER
                    </p>
                    <p>© 2026 Developed by <span className="text-white font-medium">Stefano D'Annunzio</span></p>
                </div>
                
                <div className="flex items-center gap-4">
                    <Divider orientation="vertical" className="h-10 hidden md:block" />
                    <Link 
                        isExternal 
                        href="https://github.com/stefano-dannunzio" 
                        className="flex items-center gap-3 text-default-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 hover:border-white/20"
                    >
                        <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                        <span className="font-semibold">GitHub Profile</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
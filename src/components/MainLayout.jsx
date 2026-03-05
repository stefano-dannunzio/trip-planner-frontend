import Footer from './Footer';

/**
 * Shared layout component that wraps every page with a consistent structure and a global footer.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
function MainLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
                {children}
            </div>
            <Footer />
        </div>
    );
}

export default MainLayout;
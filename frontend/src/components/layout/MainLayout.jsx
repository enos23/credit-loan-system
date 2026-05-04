import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#e6eeff] to-[#f0ebf8]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 pt-6 relative">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
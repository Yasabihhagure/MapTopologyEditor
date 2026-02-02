import type { ReactNode } from 'react';


interface MainLayoutProps {
    header: ReactNode;
    toolbar: ReactNode;
    rightSidebar?: ReactNode; // Added rightSidebar prop for Beta 1
    canvas: ReactNode;
    statusbar: ReactNode;
}

export const MainLayout = ({ header, toolbar, rightSidebar, canvas, statusbar }: MainLayoutProps) => {
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
            {/* Header */}
            <header className="h-12 border-b flex items-center px-4 bg-background z-10 shrink-0">
                {header}
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Toolbar */}
                <aside className="w-64 border-r bg-muted/30 p-4 overflow-y-auto shrink-0 z-10">
                    {toolbar}
                </aside>

                {/* Canvas Area */}
                <main className="flex-1 relative bg-slate-100 overflow-hidden">
                    {canvas}
                </main>

                {/* Right Sidebar - Beta Feature */}
                {rightSidebar && (
                    <aside className="w-64 border-l bg-muted/30 p-4 overflow-y-auto shrink-0 z-10">
                        {rightSidebar}
                    </aside>
                )}
            </div>

            {/* Status Bar */}
            <footer className="h-8 border-t bg-muted/50 flex items-center px-4 z-10 shrink-0 text-xs text-muted-foreground">
                {statusbar}
            </footer>
        </div>
    );
};

import React from "react"

export const BottomMobileNav: React.FC = () => {
    return (
        <>
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-3 z-40">
                <div className="flex justify-around items-center">
                    <button className="flex flex-col items-center space-y-1 text-orange-500">
                        <div className="w-6 h-6 bg-orange-500 rounded"></div>
                        <span className="text-xs">Browse</span>
                    </button>
                    
                    <button className="flex flex-col items-center space-y-1 text-gray-400">
                        <div className="w-6 h-6 bg-gray-600 rounded"></div>
                        <span className="text-xs">My List</span>
                    </button>

                    <button className="flex flex-col items-center space-y-1 text-gray-400">
                        <div className="w-6 h-6 bg-gray-600 rounded"></div>
                        <span className="text-xs">New</span>
                    </button>
                    
                    <button className="flex flex-col items-center space-y-1 text-gray-400">
                        <div className="w-6 h-6 bg-gray-600 rounded"></div>
                        <span className="text-xs">Profile</span>
                    </button>
                </div>
            </nav>

            {/* bottom padding mobile */}
            <div className="lg:hidden h-20" />
        </>
    )
}
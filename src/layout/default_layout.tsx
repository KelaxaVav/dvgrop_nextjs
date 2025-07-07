import { useState } from "react";
import { Outlet } from "react-router-dom";
import Layout from "../components/Layout";

function DefaultLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };
    const [currentPage, setCurrentPage] = useState('dashboard');

    return (
        <>
            <div className="m-5">
                {/* <TopMenu onMenuClick={toggleSidebar} /> */}
                <div className="wrapper mt-10" >
                    <div className="wrapper-box">
                        {/* <Layout currentPage={currentPage} onPageChange={setCurrentPage} /> */}
                        <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
                            <Outlet />
                        </Layout>
                        <div className="content">
                            <Outlet />
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default DefaultLayout;

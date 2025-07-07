import { useState } from "react";
import { Outlet } from "react-router-dom";
import Layout from "../components/Layout";

function DefaultLayout() {
    const [currentPage, setCurrentPage] = useState('dashboard');

    return (
        <>
            <div className="m-5">
                <div className="wrapper mt-10" >
                    <div className="wrapper-box">
                        <Layout currentPage={currentPage} onPageChange={setCurrentPage} >
                            <Outlet />
                        </Layout>
                    </div>
                </div>

            </div>
        </>
    );
}

export default DefaultLayout;

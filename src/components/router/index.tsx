import { BrowserRouter, Route, Routes } from "react-router-dom";
import Diccionary from "../../pages/Diccionary";
import { UserProvider } from "../../contexts/UserContext";
import ExpresionsListPage from "../../pages/expresionsList";

const MysiteRouter = () => {

    return (

        <UserProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Diccionary/>}/>
                    <Route path="/test" element={<>test2</>}/>
                    <Route path="/list/:lang" element={<ExpresionsListPage/>}/>
                </Routes>
            </BrowserRouter>
        </UserProvider>
    )
}

export default MysiteRouter
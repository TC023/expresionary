import { BrowserRouter, Route, Routes } from "react-router-dom";
import Diccionary from "../../pages/Diccionary";
import { UserProvider } from "../../contexts/UserContext";

const MysiteRouter = () => {

    return (

        <UserProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Diccionary/>}/>
                    <Route path="/test" element={<>test2</>}/>
                </Routes>
            </BrowserRouter>
        </UserProvider>
    )
}

export default MysiteRouter
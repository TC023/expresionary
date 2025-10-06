import { BrowserRouter, Route, Routes } from "react-router-dom";
import Diccionary from "../../pages/Diccionary";

const MysiteRouter = () => {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/diccionary" element={<Diccionary/>}/>
                <Route path="/test" element={<>test2</>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default MysiteRouter
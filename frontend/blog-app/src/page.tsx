import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"


//import { ProtectedRoute, AdminRoute } from "./service/guard.tsx";
import Navbar from "./components/navigation.tsx";
import Footer from "./components/footer.tsx";
import Home from "./components/home.tsx";


export const PagesRoute = () => {

    return (
        <BrowserRouter>
            <div >
                <main >
                    <Routes>
                        {/* Default redirect */}
                        <Route path="/" element={<>     <Navigate to="/home" replace /></>} />

                        {/* Guest routes */}
                        <Route path="/home" element={<>
                            <Navbar />
                            <Home />
                            <Footer/>
                        </>} />
                        {/*<Route path="/forget-password" element={<ForgetPassword/>}/>*/}
                        {/*<Route path="/available-rooms" element={<AvailableRooms/>}/>*/}

                        {/*<Route path="/roomPage" element={<><Navbar /><RoomPage roomSearchResult={[]} />*/}
                        {/*    <Footer/></>} />*/}
                        {/*<Route path="/rooms" element={<><Navbar /><AllRooms /> <Footer/> </>} />*/}
                        {/*<Route path="/find-bookings" element={<><Navbar /><FindBookingPage /> <Footer/> </>} />*/}
                        {/*<Route path="/login" element={<><Login /> <Footer/></>} />*/}
                        {/*<Route path="/signup" element={<><Signup /> <Footer/></>} />*/}
                        {/*<Route path="/terms" element={<Terms />} />*/}
                        {/*<Route path="/privacy" element={<PrivacyPolicy />} />*/}

                        {/*/!* Protected (User) routes *!/*/}
                        {/*<Route*/}
                        {/*    path="/room-details-booking/:roomId"*/}
                        {/*    element={<ProtectedRoute element={<><Navbar/><RoomBookingDetails /><Footer/></>} />}*/}
                        {/*/>*/}
                        {/*<Route*/}
                        {/*    path="/profile"*/}
                        {/*    element={<ProtectedRoute element={<><Navbar/><Profile /><Footer/></>} />}*/}
                        {/*/>*/}
                        {/*<Route*/}
                        {/*    path="/edit-profile"*/}
                        {/*    element={<ProtectedRoute element={<EditProfile />} />}*/}
                        {/*/>*/}

                        {/*/!* Admin route *!/*/}
                        {/*<Route path="/admin" element={<AdminRoute element={<AdminPage />} />} />*/}
                        {/*<Route path="/admin-manage-users"  element={<ProtectedRoute element={<><Navbar /><ManageUsers /> <Footer/></>}/>} />*/}
                        {/*<Route path="/admin-manage-bookings"  element={<ProtectedRoute element={<><Navbar /><ManageBookings /><Footer/></>}/>} />*/}

                        {/*<Route path="/manager" element={<ManagerRoute element={<><ManagerDashboard /></>} />} />*/}

                        {/*/!*<Route path="/admin"  element={<AdminPage />}  />*!/*/}

                        {/*/!* Catch-all for 404s *!/*/}
                        {/*<Route path="*" element={<NotFound/>} />*/}
                    </Routes>
                </main>

                {/* Footer */}
            </div>
        </BrowserRouter>
    );
};

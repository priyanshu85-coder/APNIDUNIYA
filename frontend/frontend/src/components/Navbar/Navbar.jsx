import { useState } from "react";
import { FaHome, FaPlus, FaSignInAlt, FaSignOutAlt, FaUserAstronaut, FaUserPlus } from "react-icons/fa";
import "./Navbar.css";

function Navbar({ variant = "studio", user, onLogin, onSignup, onHome, onCreate, onLogout }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    

    // Public navbar shows Home/Login/Signup; studio navbar shows Create/Profile.
    const isPublic = variant === "public";
    const displayName = user?.name || "Guest";

    return (
        <header className={`navbar ${isPublic ? "publicNavbar" : ""}`}>
            <button type="button" className="brandButton" onClick={onHome}>
                <span className="brandMark">
                    <FaUserAstronaut />
                </span>
                <span>Apni Duniya</span>
            </button>

            <nav className="navActions">
                {isPublic ? (
                    <>
                        {/* Buttons used on landing and auth pages. */}
                        <button type="button" className="navGhostButton" onClick={onHome}>
                            <FaHome />
                            Home
                        </button>
                        <button type="button" className="navGhostButton" onClick={onLogin}>
                            <FaSignInAlt />
                            Login
                        </button>
                        <button type="button" className="navPrimaryButton" onClick={onSignup}>
                            <FaUserPlus />
                            Signup
                        </button>
                    </>
                ) : (
                    <>
                        {/* Buttons used inside the character studio. */}
                        <button type="button" className="navPrimaryButton" onClick={onCreate}>
                            <FaPlus />
                            <span className="createLabelFull">Create Character</span>
                            <span className="createLabelShort">Create</span>
                        </button>

                        <div className="profileMenu">
                            {/* Profile button opens dropdown with user info and logout/login action. */}
                            <button
                                type="button"
                                className="profileButton"
                                onClick={() => setIsProfileOpen((prev) => !prev)}
                            >
                                <span>{displayName.slice(0, 1).toUpperCase()}</span>
                                <strong>{displayName}</strong>
                            </button>

                            {isProfileOpen && (
                                <div className="profileDropdown">
                                    <div>
                                        <strong>{displayName}</strong>
                                        <span>{user?.email || "Visitor mode"}</span>
                                    </div>
                                    {user ? (
                                        <button type="button" onClick={onLogout}>
                                            <FaSignOutAlt />
                                            Logout
                                        </button>
                                    ) : (
                                        <button type="button" onClick={onLogin}>
                                            <FaSignInAlt />
                                            Login
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </nav>
        </header>
    );
}

export default Navbar;

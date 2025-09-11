import { Link } from "react-router-dom";
function Navbar(){
    return(
       <div className="nav-bar">
      <div className="container-fluid">
        <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
          <a href="#" className="navbar-brand">MENU</a>
          <button type="button" className="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-between" id="navbarCollapse">
            <div className="navbar-nav mr-auto">
              <a href="/" className="nav-item nav-link active">Home</a>
              <a href="/about" className="nav-item nav-link">About</a>
              <a href="/service" className="nav-item nav-link">Job</a>
              <a href="/team" className="nav-item nav-link">Forums</a>
              <a href="/contact" className="nav-item nav-link">Contact</a>
              <Link to="/login" className="nav-item nav-link">LogIn</Link>
            </div>
            <div className="ml-auto">
              <a className="btn" href="#">Get A Quote</a>
            </div>
          </div>
        </nav>
      </div>
    </div>
    )
}
export default Navbar;

// ... existing code ...

function Header() {
  // ... existing code ...

  return (
    <div className="flex justify-between p-5 shadow-sm">
      <Link to="/">
        <img src="/logo.svg" alt="logo" width="180px" />
      </Link>
      <div className="flex gap-5 items-center">
        <Link to="/" className="hover:text-primary">Home</Link>
        <Link to="/create-trip" className="hover:text-primary">Create Trip</Link>
        <Link to="/public-trips" className="hover:text-primary">Public Trips</Link>
        {user ? (
          <div className="flex gap-5 items-center">
            <Link to="/my-trips" className="hover:text-primary">My Trips</Link>
            <img src={user.picture} alt="user" className="h-10 w-10 rounded-full" />
          </div>
        ) : (
          <Button onClick={login}>Sign In</Button>
        )}
      </div>
    </div>
  );
}

export default Header;
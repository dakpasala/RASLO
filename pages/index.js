import { useState } from 'react'; // Import React's useState hook to manage component state
import { signIn } from './api/supabaseClient'; // Import the signIn function from the Supabase client
import { useRouter } from 'next/router'; // Import Next.js router to navigate between pages
import { signOut } from './api/supabaseClient'; // Import the signOut function from the Supabase client

export default function Home() {
  // State variables to store user input, errors, and loading state
  const [email, setEmail] = useState(''); // Stores the email input
  const [password, setPassword] = useState(''); // Stores the password input
  const [errorMessage, setErrorMessage] = useState(''); // Stores any error messages for display
  const [isLoading, setIsLoading] = useState(false); // Indicates whether the login process is in progress
  const router = useRouter(); // Initialize Next.js router for navigation

  // Function to handle login process
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setIsLoading(true); // Set loading state to true while logging in
    setErrorMessage(''); // Clear any previous error messages
  
    try {
      await signOut(); // Ensure any previous session is cleared before logging in
  
      const { data, error } = await signIn(email, password); // Attempt to sign in with the provided credentials
  
      if (error) { // Check if there's an error from Supabase
        setErrorMessage(error.message); // Display error message
        setIsLoading(false); // Stop loading
        return; // Exit function early
      }
  
      if (data?.user) { // If login is successful and user data is returned
        // Set a temporary cookie to allow session verification
        document.cookie = 'x-allow-login=true; path=/; max-age=100'; // Valid for 100 seconds
        router.push('/stats'); // Redirect user to the statistics page
      } else {
        setErrorMessage('Login failed. Please try again.'); // Display login failure message
        setIsLoading(false); // Stop loading
      }
    } catch (err) {
      console.error('Login error:', err); // Log error to console
      setErrorMessage('An unexpected error occurred. Please try again.'); // Display a generic error message
      setIsLoading(false); // Stop loading
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100"> {/* Full page container with centered content */}
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow"> {/* Login box with styling */}
        <h1 className="text-2xl font-bold text-center">Welcome to the RASLO Project</h1> {/* Page title */}
        <p className="text-center text-gray-600">Please log in to access RASLO's WiFi statistics.</p> {/* Instructions */}
        
        <form onSubmit={handleLogin} className="mt-8 space-y-6"> {/* Form submission handling login */}
          <div className="space-y-4"> {/* Input fields container */}
            <input
              type="email"
              required
              placeholder="Email"
              value={email} // Bind input value to email state
              onChange={(e) => setEmail(e.target.value)} // Update email state on change
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isLoading} // Disable input while loading
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password} // Bind input value to password state
              onChange={(e) => setPassword(e.target.value)} // Update password state on change
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isLoading} // Disable input while loading
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading} // Disable button while loading
            className={`w-full py-2 px-4 rounded-md transition-colors ${
              isLoading 
                ? 'bg-blue-400 cursor-not-allowed' // If loading, use lighter blue and disable cursor
                : 'bg-blue-600 hover:bg-blue-700' // Normal state with hover effect
            } text-white`}
          >
            {isLoading ? 'Logging in...' : 'Login'} {/* Show loading text while logging in */}
          </button>
          
          {errorMessage && (
            <p className="text-red-500 text-center mt-2">{errorMessage}</p> // Display error message if present
          )}
        </form>
      </div>
    </div>
  );
}
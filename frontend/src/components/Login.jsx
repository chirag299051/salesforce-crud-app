import { login } from "../services/api";

function Login() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Salesforce CRUD Manager</h1>

        <p>
          Connect your Salesforce account to manage
          records.
        </p>

        <button onClick={login}>
          Login with Salesforce
        </button>
      </div>
    </div>
  );
}

export default Login;
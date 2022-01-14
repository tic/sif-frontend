import React, { useState } from 'react';
import {
    MDBBtn,
    MDBContainer,
    MDBInput,
    MDBSpinner
} from 'mdb-react-ui-kit';
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import Interface from './Interface';

function App() {

    const [idToken, setIdToken] = useState(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [refreshTimeout, setRefreshTimeout] = useState(null);

    function login() {

        setIdToken("pending");

        // Create the object to user the user's credentials
        const authDetails = new AuthenticationDetails({
            Username: username,
            Password: password
        });

        // Establish a reference to the SIF user pool
        const pool = new CognitoUserPool({
            UserPoolId: 'us-east-1_yfAGwxbYW',
            ClientId: '4bfuvavalple0k8k6lj4oln5ne'
        });

        // Create the cognito user reference object
        const user = new CognitoUser({
            Username: username,
            Pool: pool
        });

        // Authenticate the user object
        user.authenticateUser(
            authDetails,
            {
                onSuccess: function (result) {
                    // Parse out the id token
                    const idToken = result
                        .getIdToken()
                        .getJwtToken();

                    // Clear any previous error
                    setError(null);

                    // Store the token
                    setIdToken(idToken);

                    // The token should be refreshed every hour.
                    const timeout = setTimeout(login.bind(this), 60 * 60 * 1000);
                    setRefreshTimeout(timeout);
                },
                onFailure: function (error) {
                    console.error(error);
                    setError(error.toString());
                    clearTimeout(refreshTimeout);
                    setRefreshTimeout(null);
                    setTimeout(() => {
                        setIdToken(null);
                    }, 250);
                }
            }
        );
    }


    function logout() {

        // Clear token refresh timeout
        clearTimeout(refreshTimeout);
        setRefreshTimeout(null);

        // Clear any previous error
        setError(null);

        // Set token to null
        setIdToken(null);
    }


    if (idToken === null) {
        return (
            <MDBContainer fluid>
                <div
                    className='d-flex justify-content-center align-items-center'
                    style={{ height: '100vh' }}
                >
                    <div className='text-center'>
                        <h5 className='mb-3'>
                            Enter your API access credentials.
                        </h5>
                        <p className='mb-3'>Re-entering your credentials here allows you to change API access permissions without logging out of the website.</p>
                        <div
                            style={{
                                margin: 25
                            }}
                        >
                            <MDBInput
                                label="Username"
                                value={username}
                                onChange={(event) => {
                                    setUsername(event.target.value);
                                }}
                                style={{
                                    marginBottom: 10
                                }}
                            />
                            <MDBInput
                                label="Password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                }}
                                type="password"
                            />
                        </div>
                        <MDBBtn
                            tag='a'
                            role='button'
                            onClick={login}
                        >
                            Authorize
                        </MDBBtn>

                        {error ? (
                            <div
                                style={{
                                    height: 30,
                                    paddingTop: 10
                                }}
                            >
                                <span
                                    style={{
                                        color: "#ff2222"
                                    }}
                                >
                                    {error}
                                </span>
                            </div>
                        ) : (
                            <div
                                style={{
                                    height: 30
                                }}
                            />
                        )}
                    </div>
                </div>
            </MDBContainer>
        );
    }


    if (idToken === "pending") {
        return (
            <MDBContainer fluid>
                <div
                    className='d-flex justify-content-center align-items-center'
                    style={{ height: '100vh' }}
                >
                    <div className='text-center'>
                        <h5 className='mb-3'>
                            Enter your API access credentials.
                        </h5>
                        <p className='mb-3'>Re-entering your credentials here allows you to change API access permissions without logging out of the website.</p>
                        <div
                            style={{
                                margin: 25
                            }}
                        >
                            <MDBInput
                                label="Username"
                                value={username}
                                disabled
                                style={{
                                    marginBottom: 10
                                }}
                            />
                            <MDBInput
                                label="Password"
                                value={password}
                                type="password"
                                disabled
                            />
                        </div>
                        <MDBBtn
                            tag='a'
                            role='button'
                            onClick
                            disabled
                        >
                            <MDBSpinner
                                size='sm'
                                role='status'
                                tag='span'
                                className='me-2'
                            />
                            Authorizing
                        </MDBBtn>

                        <div
                            style={{
                                height: 30
                            }}
                        />
                    </div>
                </div>
            </MDBContainer>
        );
    }


    return (
        <MDBContainer fluid>
            <div
                style={{
                    margin: 15,
                    display: 'flex',
                    flexDirection: 'row'
                }}
            >
                <MDBBtn
                    color='warning'
                    onClick={logout}
                >
                    Switch User
                </MDBBtn>
                <h6
                    style={{
                        marginTop: 10,
                        marginLeft: 10
                    }}
                >
                    Current user: {username}
                </h6>
            </div>
            <div
                style={{
                    width: '100%',
                    height: 2,
                    background: '#000000'
                }}
            />
            <Interface idToken={idToken} />
        </MDBContainer>
    );
}


export default App;

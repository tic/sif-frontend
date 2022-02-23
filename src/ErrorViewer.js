import React, { useState, useEffect } from 'react';
import {
    MDBBtn,
    MDBContainer,
    MDBInput,
    MDBSpinner,
    MDBTable,
    MDBTableHead,
    MDBTableBody
} from 'mdb-react-ui-kit';
import { IconButton } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';


const axios = require('axios').default;
var api = null;

function ErrorList(props) {
    return (
        <div
            style={{
                width: '100%'
            }}
        >
            If a device name is available for a given error, it will be shown in (parentheses) next to the app.
            <MDBTable striped hover responsive>
                <MDBTableHead>
                    <tr>
                        <th scope='col'>ID</th>
                        <th scope='col'>UTC Timestamp</th>
                        <th scope='col'>App (device)</th>
                        <th scope='col'>Error</th>
                    </tr>
                </MDBTableHead>
                <MDBTableBody>
                    {
                        props.errorList.map(error => (
                            <tr key={error.errorId}>
                                <td>{error.errorId}</td>
                                <td>{error.timestamp}</td>
                                <td>{error.appName} {error.device ? `(${error.device})` : ''}</td>
                                <td>{error.error}</td>
                            </tr>
                        ))
                    }
                </MDBTableBody>
            </MDBTable>
        </div>
    );
}

export default function ErrorViewer(props) {

    const [errorList, setErrorList] = useState(null);
    const [error, setError] = useState(null);


    // When the id token changes, create a new
    // Axios object that uses the new header.
    // There are other ways of doing this, but
    // this one is so easy!
    useEffect(() => {
        api = axios.create({
            baseURL: 'https://api.uvasif.org/v2',
            timeout: 2000,
            headers: {
                Authorization: props.idToken
            }
        });
    }, [props.idToken]);


    function apiCall() {
        api.get("/errors")
            .then(({ data }) => {
                if (data.code !== 200) {
                    throw "Server reported incorrect status code";
                } else {
                    setErrorList(data.errors);
                }
            })
            .catch(err => {
                console.error(err);
                setError("Unable to load app list :(");
            });
    }


    // Retrieve the list of apps for the current
    // user, after axios is ready.
    useEffect(() => {
        while (api === null) { }
        apiCall();
    }, []);

    return (
        <MDBContainer fluid>
            <div
                style={{
                    minWidth: 500
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <h3
                        className='mb-3'
                        style={{
                            margin: 25
                        }}
                    >
                        Recent Errors (last 3h)
                    </h3>
                    <IconButton
                        onClick={() => {
                            setErrorList(null)
                            apiCall();
                        }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </div>
                {errorList === null ? error === null ? (
                    <MDBSpinner
                        size='md'
                        role='status'
                        tag='span'
                        className='me-2'
                    />
                ) : (
                    <p>
                        {error}
                    </p>
                ) : (
                    <ErrorList errorList={errorList} />
                )}
            </div>
        </MDBContainer>
    );

}
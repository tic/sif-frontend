import { useState, useEffect } from 'react';
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

// ==================================================================
// Adapted from https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time
const units = {
    year  : 24 * 60 * 60 * 1000 * 365,
    month : 24 * 60 * 60 * 1000 * 365/12,
    day   : 24 * 60 * 60 * 1000,
    hour  : 60 * 60 * 1000,
    minute: 60 * 1000
};

const rtf = new Intl.RelativeTimeFormat(
    "en",
    {
        numeric: "auto"
    }
);

const getRelativeTime = (d1, d2 = new Date()) => {
    const elapsed = d1 - d2;

    // "Math.abs" accounts for both "past" & "future" scenarios
    for(const u in units) {
        if(Math.abs(elapsed) > units[u]) {
            return rtf.format(Math.round(elapsed/units[u]), u);
        }
    }

    return rtf.format(Math.round(elapsed/1000), "second");
}
// ==================================================================

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
                        <th scope='col'>Timestamp (Local)</th>
                        <th scope='col'>App (device)</th>
                        <th scope='col'>Error</th>
                    </tr>
                </MDBTableHead>
                <MDBTableBody>
                    {
                        props.errorList.map(error => (
                            <tr key={error.errorId}>
                                <td>{error.errorId}</td>
                                <td>
                                    <b>{new Date(error.timestamp).toLocaleString()}</b>
                                    <br/>
                                    {getRelativeTime(new Date(error.timestamp))}
                                </td>
                                <td>{error.appName} <b>{error.device ? `(${error.device})` : ''}</b></td>
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
                        Recent Errors
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
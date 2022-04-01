import { useState, useEffect } from "react";
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

export default function SourceRegistration(props) {

    const [error, setError] = useState(null);
    const [sourceList, setSourceList] = useState(null);

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
        api.get("/sources")
            .then(({ data }) => {
                if (data.code !== 200) {
                    throw "Server reported incorrect status code";
                } else {
                    setSourceList(data.sources);
                }
            })
            .catch(err => {
                console.error(err);
                setError("Unable to load source list :(");
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
                        Existing custom sources
                    </h3>
                    <IconButton
                        onClick={() => {
                            setSourceList(null)
                            apiCall();
                        }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </div>
                {sourceList === null ? error === null ? (
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
                    <div>the thing</div>
                )}
            </div>
        </MDBContainer>
    )
}

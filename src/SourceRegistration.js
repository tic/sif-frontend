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
                    <MDBTable striped hover responsive>
                        <MDBTableHead>
                            <tr>
                                <th scope='col'>ID</th>
                                <th scope='col'>Type</th>
                                <th scope='col'>Metadata</th>
                            </tr>
                        </MDBTableHead>
                        <MDBTableBody>
                            {
                                sourceList.map(source => {
                                    switch(source.type) {
                                        case "ttn-mqtt":
                                            return (
                                                <tr key={source.sourceId}>
                                                    <td>{source.sourceId}</td>
                                                    <td>TTN MQTT</td>
                                                    <td>
                                                        <MDBTable>
                                                            <MDBTableBody>
                                                                <tr>
                                                                    <td>Broker URL</td>
                                                                    <td>{source.metadata.brokerURL}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Broker Port</td>
                                                                    <td>{source.metadata.port}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Username</td>
                                                                    <td>{source.metadata.username}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Password</td>
                                                                    <td>{source.metadata.password}</td>
                                                                </tr>
                                                            </MDBTableBody>
                                                        </MDBTable>
                                                        {
                                                            
                                                        }
                                                    </td>
                                                </tr>
                                            );
                                        
                                        default:
                                            return (
                                                <tr key={source.sourceId}>
                                                    <td>{source.sourceId}</td>
                                                    <td>Unsupported Source Type</td>
                                                    <td>Unknown</td>
                                                </tr>
                                            )
                                    }
                                })
                            }
                        </MDBTableBody>
                    </MDBTable>
                )}
            </div>
        </MDBContainer>
    )
}

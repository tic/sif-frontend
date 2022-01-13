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
import { TextField } from '@material-ui/core';
import { DateTime } from 'luxon';
import { saveAs } from 'file-saver';


const axios = require("axios").default;
var api = null;
var dlApi = null;

function RevealingButton(props) {

    const { appName, endpoint } = props;

    const [revealed, setRevealed] = useState(false);
    const [revealPending, setRevealPending] = useState(false);
    const [content, setContent] = useState((<></>));

    // Runs when the reveal button is clicked
    function clickHandler() {
        setRevealPending(true);
        api.get(`/apps/app/${appName}/${endpoint}`)
            .then(resp => {
                if (resp?.data?.code !== 200) {
                    throw "Server reported incorrect status code";
                }

                let parsedContent;
                if (endpoint === "schema") {
                    parsedContent = (
                        <MDBTable>
                            <MDBTableHead>
                                <tr>
                                    <th scope='col'>Metadata</th>
                                    <th scope='col'>Data Type</th>
                                </tr>
                            </MDBTableHead>
                            <MDBTableBody>
                                {
                                    resp.data.schema.map(scheme => (
                                        <tr
                                            key={scheme.column}
                                        >
                                            <td>{scheme.column}</td>
                                            <td>{scheme.datatype}</td>
                                        </tr>
                                    ))
                                }
                            </MDBTableBody>
                        </MDBTable>
                    );
                } else {
                    parsedContent = (
                        <MDBTable borderless>
                            <MDBTableBody>
                                {
                                    resp.data.metrics.map(metric => (
                                        <tr
                                            key={metric}
                                        >
                                            <td>{metric}</td>
                                        </tr>
                                    ))
                                }
                            </MDBTableBody>
                        </MDBTable>
                    );
                }
                setContent(parsedContent);
                setRevealed(true);
            })
            .catch(err => {
                setContent("Unable to load data");
                setRevealed(true);
            });
    }

    // If the content has not been revealed
    // yet, then either the reveal button
    // or a spinner should be displayed.
    if (!revealed) {

        // If the reveal is not pending, just
        // show the reveal button itself
        if (!revealPending) {
            return (
                <MDBBtn
                    outline
                    onClick={clickHandler}
                >
                    Click to reveal
                </MDBBtn>
            );
        }

        // If the reveal is pending, then the
        // spinner should be displayed
        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <MDBSpinner
                    color='primary'
                    size='md'
                    role='status'
                    tag='span'
                    className='me-2'
                />
            </div>
        );
    }

    // Content is ready to be revealed
    return (
        <>
            {content}
        </>
    );
}


function DownloadButton(props) {

    const [downloadPending, setDownloadPending] = useState(false);


    function handleDownload(appName) {

        setDownloadPending(true);

        const startTime = DateTime.fromFormat(props.rangeStart, "yyyy-MM-dd'T'TT").toSeconds();
        const endTime = DateTime.fromFormat(props.rangeEnd, "yyyy-MM-dd'T'TT").toSeconds();

        dlApi.get(
            `${appName}/all`,
            {
                params: {
                    start: startTime,
                    end: endTime
                }
            }
        )
            .then(resp => {
                saveAs(
                    new Blob(
                        resp.data.split(/.{10000}/g).filter(s => s),
                        {
                            type: 'text/csv;charset=utf-8'
                        }
                    ),
                    `${appName}.${startTime}-${endTime}.csv`
                );
                setTimeout(() => {
                    setDownloadPending(false);
                }, 250);
            })
            .catch(err => {
                console.log(err);
                setDownloadPending(false);
                window.alert('Unable to download data :(');
                console.error('download failed');
            });
    }

    return (
        <MDBBtn
            outline
            className='mx-2'
            color='info'
            disabled={downloadPending}
            onClick={() => handleDownload(props.appName)}
            style={{
                flexDirection: 'row',
                alignItems: 'center'
            }}
        >
            {downloadPending ? (
                <MDBSpinner
                    color='primary'
                    size='sm'
                    role='status'
                    tag='span'
                    className='me-2'
                />
            ) : (
                    <></>
            )}
            Download
        </MDBBtn>
    );
}


function AppsList(props) {

    const [rangeStart, setRangeStart] = useState(
        DateTime.local()
            .minus({
                hours: 6
            })
            .toFormat("yyyy-MM-dd'T'TT")
    );
    const [rangeEnd, setRangeEnd] = useState(
        DateTime.local()
            .toFormat("yyyy-MM-dd'T'TT")
    );


    if (props.appsList.length === 0) {
        return (
            <div>
                <p className='mb-3'>
                    There's nothing here. Create apps by sending data into the SIF ingest system.
                </p>
            </div>
        );
    }


    return (
        <div>
            <div>
                <p>
                    The download button in each row of the apps table,
                    below, will start a download for that app's data
                    across a particular time range. Set the bounds of
                    that range here.
                </p>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                        marginLeft: 10
                    }}
                >
                    <span
                        style={{
                            width: 125
                        }}
                    >
                        Range Start
                    </span>
                    <TextField
                        name="rangeStart"
                        type="datetime-local"
                        value={rangeStart}
                        onChange={event => setRangeStart(event.target.value)}
                    />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                        marginLeft: 10
                    }}
                >
                    <span
                        style={{
                            width: 125
                        }}
                    >
                        Range End
                    </span>
                    <TextField
                        name="rangeEnd"
                        type="datetime-local"
                        value={rangeEnd}
                        onChange={event => setRangeEnd(event.target.value)}
                    />
                </div>
            </div>
            <MDBTable striped hover responsive>
                <MDBTableHead>
                    <tr>
                        <th scope='col'>Name</th>
                        <th scope='col'>Schema</th>
                        <th scope='col'>Metrics</th>
                        <th scope='col'>Download</th>
                        <th scope='col'>Delete</th>
                    </tr>
                </MDBTableHead>
                <MDBTableBody>
                    {
                        props.appsList.map(appName => (
                            <tr
                                key={appName}
                                scope='row'
                            >
                                <td>{appName}</td>
                                <td>
                                    <RevealingButton
                                        appName={appName}
                                        endpoint="schema"
                                    />
                                </td>
                                <td>
                                    <RevealingButton
                                        appName={appName}
                                        endpoint="metrics"
                                    />
                                </td>
                                <td>
                                    <DownloadButton
                                        appName={appName}
                                        rangeStart={rangeStart}
                                        rangeEnd={rangeEnd}
                                    />
                                </td>
                                <td>
                                    <MDBBtn
                                        className='mx-2'
                                        color='danger'
                                        outline
                                    >
                                        Delete
                                    </MDBBtn>
                                </td>
                            </tr>
                        ))
                    }
                </MDBTableBody>
            </MDBTable>
        </div>
    );
}


export default function Interface(props) {

    const [myApps, setMyApps] = useState(null);
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

        dlApi = axios.create({
            baseURL: 'https://download.uvasif.org/v1',
            timeout: 0,
            headers: {
                Authorization: props.idToken
            }
        })
    }, [props.idToken]);

    // Retrieve the list of apps for the current
    // user, after axios is ready.
    useEffect(() => {
        while (api === null) { }
        api.get("/apps/list")
            .then(({ data }) => {
                if (data.code !== 200) {
                    throw "Server reported incorrect status code";
                } else {
                    setMyApps(data.apps);
                }
            })
            .catch(err => {
                console.error(err);
                setError("Unable to load app list :(");
            });
    }, []);

    return (
        <MDBContainer fluid>
            <div
                className='d-flex'
                style={{
                    height: '100vh'
                }}
            >
                <div>
                    <h3
                        className='mb-3'
                        style={{
                            margin: 25
                        }}
                    >
                        My Apps
                    </h3>
                    {myApps === null ? (
                        <MDBSpinner
                            size='md'
                            role='status'
                            tag='span'
                            className='me-2'
                        />
                    ) : (
                        <AppsList appsList={myApps} />
                    )}
                </div>
            </div>
        </MDBContainer>
    );
}
















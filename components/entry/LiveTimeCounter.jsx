"use client";
import React, { useState, useEffect } from 'react';
import moment from 'moment';

export default function LiveTimeCounter({ startTime, muted }) {
    const [timeDiff, setTimeDiff] = useState(moment().diff(startTime));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeDiff(moment().diff(startTime));
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [startTime]);

    const duration = moment.duration(timeDiff);
    const formattedTimeDiff = `${String(duration.hours()).padStart(2, '0')}:${String(duration.minutes()).padStart(2, '0')}:${String(duration.seconds()).padStart(2, '0')}`;

    return (
        <div>
            <h2 className={muted ? 'text-muted' : ''}> {formattedTimeDiff}</h2>
        </div>
    );
}

import React from "react";
import {useAppSelector} from "@store/hooks";
import {mainState} from "@/store/slices/mainSlice";

import ChessGame from "@page/ChessGame/ChessGame";
import Loading from "@parts/Loading/Loading";

import "./App.scss";

const App: React.FC = () => {
    // Use the typed version of useAppSelector create in hooks.ts
    const loading = useAppSelector(mainState.Loading);

    const LoadingAnimation: React.FC<{loading: boolean}> = ({loading}) => {
        if (loading) return <Loading />;
        return null;
    };

    return (
        <>
            <LoadingAnimation loading={loading} />
            <ChessGame />
        </>
    );
};

export default App;

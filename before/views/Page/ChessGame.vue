<script setup>
import { onMounted, reactive, ref } from "vue";

import PieceBishop from "@svgs/PieceBishop.vue";
import PieceKing from "@svgs/PieceKing.vue";
import PieceKnight from "@svgs/PieceKnight.vue";
import PiecePawn from "@svgs/PiecePawn.vue";
import PieceQueen from "@svgs/PieceQueen.vue";
import PieceRook from "@svgs/PieceRook.vue";

import { useMainStore } from "@store/Main";
const MainStore = useMainStore();
const { loading } = MainStore;

const API_URL = process.env.API_URL;

const pieceSVGComponent = {
    bishop: PieceBishop,
    king: PieceKing,
    knight: PieceKnight,
    pawn: PiecePawn,
    queen: PieceQueen,
    rook: PieceRook,
};

const pawnModalData = [
    {
        key: 1,
        coin: "tl",
        piece: "knight",
    },
    {
        key: 2,
        coin: "tr",
        piece: "bishop",
    },
    {
        key: 3,
        coin: "bl",
        piece: "rook",
    },
    {
        key: 4,
        coin: "br",
        piece: "queen",
    },
];

const lettersStock = ["A", "B", "C", "D", "E", "F", "G", "H"];
const numbersStock = [8, 7, 6, 5, 4, 3, 2, 1];

let gameData = reactive({});
let gameDataReady = ref(false);
let componentReady = ref(false);

onMounted(async () => {
    await updateData();
    if (gameDataReady.value) {
        caseSelectionAndMoves.movesAndEventHandling();
        componentReady.value = true;
    }
});

const updateData = async () => {
    loading.loading = true;
    const result = await updateGameData();
    loading.loading = false;
    if (result.ready) {
        Object.assign(gameData, result.gameData);
        gameDataReady.value = true;
    } else {
        gameDataReady.value = false;
    }
    if (gameDataReady.value && componentReady.value) {
        caseSelectionAndMoves.movesAndEventHandling();
    }
};

const updateGameData = async () => {
    try {
        return await (await fetch(API_URL + "/chess/game/data")).json();
    } catch (error) {
        console.trace(error);
    }
};

const resetGame = async () => {
    loading.loading = true;
    try {
        await fetch(API_URL + "/chess/board/reset");
        await updateData();
    } catch (error) {
        console.trace(error);
    }
    loading.loading = false;
};

const caseSelectionAndMoves = {
    isSelectedCase: false,
    move: {},

    movesAndEventHandling: () => {
        caseSelectionAndMoves.isSelectedCase = false;
        caseSelectionAndMoves.resetAll();
        caseSelectionAndMoves.highlightPiecesCanMove();
        caseSelectionAndMoves.enableSelectPiece();
    },

    resetAll: () => {
        document.querySelectorAll(".case").forEach((element) => {
            element.classList.remove("piece-can-moves");
            element.removeEventListener(
                "click",
                caseSelectionAndMoves.selection,
                false
            );
            element.classList.remove("possible-move");
            element.removeEventListener(
                "click",
                caseSelectionAndMoves.testBeforeSendMove,
                false
            );
            element.classList.remove("selectedCase");
            element.removeEventListener(
                "click",
                caseSelectionAndMoves.deselectPiece,
                false
            );
            document
                .querySelector("#pawnTransformationModal")
                .classList.add("invisible");
        });
    },

    getCaseWithCurrentColorPieces: () => {
        return document.querySelectorAll(`.pc--${gameData.currentPlayerColor}`);
    },

    enableSelectPiece: () => {
        caseSelectionAndMoves
            .getCaseWithCurrentColorPieces()
            .forEach((element) =>
                element.addEventListener(
                    "click",
                    caseSelectionAndMoves.selection,
                    false
                )
            );
    },

    selection: (event) => {
        const selectedCase = event.target;
        caseSelectionAndMoves.isSelectedCase = true;
        caseSelectionAndMoves.highlightPiecesCanMove();
        selectedCase.classList.add("selectedCase");
        caseSelectionAndMoves
            .getCaseWithCurrentColorPieces()
            .forEach((element) =>
                element.removeEventListener(
                    "click",
                    caseSelectionAndMoves.selection,
                    false
                )
            );
        caseSelectionAndMoves.showPossibleMoves(selectedCase);
        selectedCase.addEventListener(
            "click",
            caseSelectionAndMoves.deselectPiece,
            false
        );
    },

    deselectPiece: (event) => {
        const deselectedCase = event.target;
        deselectedCase.classList.remove("selectedCase");
        caseSelectionAndMoves.isSelectedCase = false;
        caseSelectionAndMoves.highlightPiecesCanMove();
        deselectedCase.removeEventListener(
            "click",
            caseSelectionAndMoves.deselectPiece,
            false
        );
        const showMove = document.querySelectorAll(".possible-move");
        if (showMove) {
            showMove.forEach((element) => {
                element.classList.remove("possible-move");
                element.removeEventListener(
                    "click",
                    caseSelectionAndMoves.testBeforeSendMove,
                    false
                );
            });
        }
        caseSelectionAndMoves.enableSelectPiece();
    },

    highlightPiecesCanMove: () => {
        for (let [key, value] of Object.entries(
            gameData.currentColorMovesData.moves
        )) {
            if (value !== null) {
                const x = document.querySelector(`[piece_id=${key}]`);
                if (
                    caseSelectionAndMoves.isSelectedCase === false &&
                    document.querySelector(".check-shows-input").checked ===
                    true
                ) {
                    x.classList.add("piece-can-moves");
                } else {
                    x.classList.remove("piece-can-moves");
                }
            }
        }
    },

    showPossibleMoves: (selectedCase) => {
        const piece_id = selectedCase.getAttribute("piece_id");
        const selectedCasePossiblesMoves =
            gameData.currentColorMovesData.moves[piece_id];
        if (selectedCasePossiblesMoves) {
            for (let [, value] of Object.entries(selectedCasePossiblesMoves)) {
                const oneMove = document.querySelector(
                    `[case_name=${value.destinationCase}]`
                );
                oneMove.classList.add("possible-move");
                oneMove.addEventListener(
                    "click",
                    caseSelectionAndMoves.testBeforeSendMove,
                    false
                );
            }
        }
    },

    testBeforeSendMove: (event) => {
        if (
            ["knight", "bishop", "rook", "queen"].indexOf(
                event.target.getAttribute("pieceType")
            ) >= 0
        ) {
            caseSelectionAndMoves.move = {
                ...caseSelectionAndMoves.move,
                pawnTransformationPieceType:
                    event.target.getAttribute("pieceType"),
            };
            sendMoveToVerif(caseSelectionAndMoves.move);
        } else {
            const piece_id = document
                .querySelector(".selectedCase")
                .getAttribute("piece_id");
            const ourMove =
                gameData.currentColorMovesData.moves[piece_id][
                    event.target.getAttribute("case_name")
                ];
            caseSelectionAndMoves.move = {};

            const destinationCase = document
                .querySelector(`[case_name="${ourMove.destinationCase}"]`)
                .getAttribute("case_name");
            const isPawn =
                Object.values(
                    document.querySelector(".selectedCase").classList
                ).indexOf("pawn") >= 0
                    ? true
                    : false;
            const pieceColor =
                Object.values(
                    document
                        .querySelector(".selectedCase")
                        .getAttribute("piece_id")
                )[2] === "w"
                    ? "white"
                    : "black";

            caseSelectionAndMoves.move = {
                piece_id: piece_id,
                originCase: ourMove.originCase,
                destinationCase: ourMove.destinationCase,
                killingMove: ourMove.killingMove,
                killCase: ourMove.killCase,
            };

            if (
                isPawn === true &&
                ((destinationCase.charAt(1) === "8" &&
                    pieceColor === "white") ||
                    (destinationCase.charAt(1) === "1" &&
                        pieceColor === "black"))
            ) {
                document
                    .querySelector("#pawnTransformationModal")
                    .classList.remove("invisible");
            } else {
                sendMoveToVerif(caseSelectionAndMoves.move);
            }
        }
    },
};

const sendMoveToVerif = async (move) => {
    loading.loading = true;
    try {
        const response = await fetch(API_URL + "/chess/move/verif", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(move),
        });
        if (response.ok) {
            updateData();
        }
    } catch (error) {
        console.trace(error);
    }
    loading.loading = false;
};
</script>

<template>
    <button v-if="!gameDataReady" class="reset-button" @click="resetGame">
        Cliquer pour reset
    </button>
    <div v-if="gameDataReady" id="chessGame">
        <div class="settings-box">
            <button class="reset-button" @click="resetGame">
                Cliquer pour reset
            </button>
            <p class="moves-counter">
                {{
                    `Tour des ${
                        gameData.currentPlayerColor === "white"
                            ? "blancs"
                            : "noirs"
                    } : ${
                        gameData.currentColorMovesData.totalNumberPossibleMoves
                    } coups possibles`
                }}
            </p>
            <div class="checked-box-input">
                <input
                    id="showsMovesInput"
                    name="showsMovesInput"
                    class="check-shows-input"
                    type="checkbox"
                    checked
                    @change="caseSelectionAndMoves.highlightPiecesCanMove"
                >
                <label for="showsMovesInput" class="check-shows-label">Surligner les pièces pouvant bouger</label>
            </div>
        </div>

        <div class="board-container">
            <div class="corner" />
            <div class="letters-box">
                <div
                    v-for="letter in lettersStock"
                    :key="letter"
                    class="letter"
                >
                    <p class="board-text">{{ letter }}</p>
                </div>
            </div>
            <div class="corner" />
            <div id="numbers-box1" class="numbers-box">
                <div
                    v-for="number in numbersStock"
                    :key="number"
                    class="number"
                >
                    <p class="board-text">{{ number }}</p>
                </div>
            </div>

            <div class="pieces-box">
                <div id="pawnTransformationModal" class="invisible">
                    <div
                        v-for="choice in pawnModalData"
                        :key="choice.key"
                        :class="`piecechoice-box pawn-choice-box-${choice.coin}`"
                        :pieceType="choice.piece"
                        @click="caseSelectionAndMoves.testBeforeSendMove"
                    >
                        <component :is="pieceSVGComponent[choice.piece]" />
                    </div>
                </div>
                <div
                    v-for="currentCase in gameData.boardData"
                    :id="`${currentCase.x}${currentCase.y}`"
                    :key="currentCase.id"
                    :class="`case case--${currentCase.case_color} ${
                        currentCase.piece_name !== null
                            ? `pc--${currentCase.piece_color}`
                            : `${currentCase.piece_name}`
                    }`"
                    :case_name="currentCase.case_name"
                    :piece_id="currentCase.piece_id"
                >
                    <component
                        :is="pieceSVGComponent[currentCase.piece_name]"
                    />
                </div>
            </div>

            <div id="numbers-box2" class="numbers-box">
                <div
                    v-for="number in numbersStock"
                    :key="number"
                    class="number"
                >
                    <p class="board-text">{{ number }}</p>
                </div>
            </div>
            <div class="corner" />
            <div class="letters-box">
                <div
                    v-for="letter in lettersStock"
                    :key="letter"
                    class="letter"
                >
                    <p class="board-text">{{ letter }}</p>
                </div>
            </div>
            <div class="corner" />
        </div>

        <div class="table-box">
            <thead>
                <tr>
                    <th
                        v-for="(value, key) in gameData.boardData[0]"
                        :key="key"
                    >
                        {{ key }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="line in gameData.boardData" :key="line.id">
                    <td
                        v-for="(value, key) in line"
                        :key="key"
                        :class="value === null ? 'emptyTD' : ''"
                    >
                        {{ value }}
                    </td>
                </tr>
            </tbody>
        </div>
        <p class="temporay-explanation">
            Pour le moment, le jeu d'échec n'a pas de session. Cela signifie
            qu'il n'y pas encore de système de partie qu'on peut commencer,
            finir et enregistrer seul ou avec un autre joueur. Mais c'est dans
            la RoadMap. Il n'est donc dans l'état présent qu'un simple plateau
            sur lequel on peut déplacer les pièces en suivant les règles et
            reset l'état des pièces.
        </p>
    </div>
</template>

<style lang="scss">
@import "@styles/variables.scss";

.board-container {
    position: relative;
    height: $board-container-size;
    width: $board-container-size;
    background-color: $first-color;
    display: flex;
    flex-wrap: wrap;
    margin: 10px auto;
    border: solid $external-border-size $second-color;
    transition: all 0.2s;

    .board-text {
        font-weight: 500;
        font-size: $text-size;
        color: $second-color;
        user-select: none;
    }

    .corner {
        width: $external-layout-size + $internal-border-size;
        height: $external-layout-size;
    }

    .letters-box {
        height: $external-layout-size;
        width: calc(8 * $size-case);
        display: flex;
        flex-wrap: wrap;

        .letter {
            width: $size-case;
            height: $external-layout-size;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .numbers-box {
        width: $external-layout-size;
        height: calc(8 * $size-case) + 2 * $internal-border-size;

        .number {
            height: $size-case;
            width: $external-layout-size;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        [y="8"],
        [y="1"] {
            height: $size-case + $internal-border-size;
        }
    }

    .pieces-box {
        width: calc(8 * $size-case + 2 * $internal-border-size);
        height: calc(8 * $size-case + 2 * $internal-border-size);
        border: solid $internal-border-size $second-color;
        display: flex;
        flex-wrap: wrap;

        .case {
            width: $size-case;
            height: $size-case;
            display: flex;
            justify-content: center;
            align-items: flex-end;

            &--white {
                background-color: $second-color;

                &.piece-can-moves {
                    background: radial-gradient(
                        circle,
                        $second-color 26%,
                        $second-color-highlight 38%,
                        $second-color 100%
                    );
                    cursor: pointer;
                }
            }

            &--black {
                background-color: $first-color;

                &.piece-can-moves {
                    background: radial-gradient(
                        circle,
                        $first-color 26%,
                        $first-color-highlight 38%,
                        $first-color 100%
                    );
                    cursor: pointer;
                }
            }

            svg {
                margin-bottom: 4%;
                height: 94%;
                stroke-width: $piece-stroke-width;
                stroke-width: max(25px);
            }

            .unclickable {
                pointer-events: none;
            }

            .pawn {
                height: 82%;
            }
        }

        .pc--white {
            color: $white-piece-color;
            stroke: $white-piece-border-color;
            cursor: pointer;
        }

        .pc--black {
            cursor: pointer;
            color: $black-piece-color;
            stroke: $black-piece-border-color;
        }

        .selectedCase {
            background-color: $selected-case-color;
            border: $border-size-enabled-case solid $selected-case-border;
            border-radius: calc(0.1 * $size-case);
            cursor: pointer;
        }

        .possible-move {
            background-color: $possible-moves-color;
            border: $border-size-enabled-case solid $possible-moves-border;
            border-radius: calc(0.1 * $size-case);
            cursor: pointer;
        }
    }
}

#pawnTransformationModal {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-content: space-between;
    position: absolute;
    z-index: $z-index-one;

    width: $pawn-modal-size;
    height: $pawn-modal-size;
    border: solid $pawn-modal-border-size $pawn-modal-border-color;
    border-radius: calc(
        ($pawn-modal-size - $pawn-modal-internal-space-size) / 2
    );
    top: calc(($board-container-size - $pawn-modal-size) / 2 - 3px);
    left: calc(($board-container-size - $pawn-modal-size) / 2 - 3px);
    background: radial-gradient(
        circle,
        $pawn-modal-border-color 0%,
        $pawn-modal-border-color 20%,
        $pawn-modal-color 70%
    );

    .piecechoice-box {
        height: $pawn-piece-choice-size;
        width: $pawn-piece-choice-size;
        background-color: $pawn-modal-color;
        cursor: pointer;

        &:hover {
            background-color: $pawn-modal-hover-color;
        }

        svg {
            height: 70%;
            pointer-events: none;
            margin: 10px 35px;
            color: $piece-choice-SVG-color;
            stroke: $piece-choice-SVG-border-color;
            stroke-width: $piece-choice-SVG-stroke-width;
            pointer-events: none;
        }
    }

    .pawn-choice-box-tl {
        border-top-left-radius: $pawn-piece-choice-size;
        display: flex;
        align-items: flex-end;
        justify-content: end;
    }

    .pawn-choice-box-tr {
        border-top-right-radius: $pawn-piece-choice-size;
        display: flex;
        align-items: flex-end;
        justify-content: start;
    }

    .pawn-choice-box-bl {
        border-bottom-left-radius: $pawn-piece-choice-size;
        display: flex;
        align-items: flex-start;
        justify-content: end;
    }

    .pawn-choice-box-br {
        border-bottom-right-radius: $pawn-piece-choice-size;
        display: flex;
        align-items: flex-start;
        justify-content: start;
    }
}

.invisible {
    visibility: hidden;
}

.reset-button {
    margin: 8px;
    background-color: #ffffff;
    color: #000000;
    height: 40px;
    padding: 5px;
    display: flex;
    align-items: center;
}

.settings-box {
    display: flex;
    justify-content: center;
    align-items: center;

    .reset-button,
    .moves-counter,
    .checked-box-input {
        margin: 8px;
    }

    .reset-button,
    .moves-counter,
    .checked-box-input,
    .check-shows-label {
        background-color: #ffffff;
        color: #000000;
        height: 40px;
        padding: 5px;
        display: flex;
        align-items: center;

        .check-shows-input:not(:checked) + .check-shows-label::after,
        .check-shows-input:checked + .check-shows-label::after {
            margin-left: 10px;
            font-weight: 600;
            font-size: 20px;
            text-align: center;
            padding: 2px 8px;
            border-radius: 12px;
        }

        .check-shows-input:not(:checked) + .check-shows-label::after {
            content: "✔";
            color: #9c9c9c;
            background-color: #9c9c9c;
        }

        .check-shows-input:checked + .check-shows-label::after {
            content: "✔";
            color: #000000;
            background-color: #6a3425;
        }
    }

    .checked-box-input {
        padding: 0;
    }
}

.table-box {
    width: fit-content;
    margin: 10px auto;
    overflow: scroll;
    max-width: 100%;

    th,
    td {
        font-family: Arial, Helvetica, sans-serif;
        font-weight: 300;
        text-align: center;
        padding: 5px;
        border: 1px solid black;
    }

    th {
        font-weight: 700;
        background-color: lightskyblue;
    }

    tr:nth-child(2n) {
        background-color: lightpink;
    }

    tr:nth-child(2n + 1) {
        background-color: lightgrey;
    }

    .emptyTD {
        background-color: #242424;
    }
}

.temporay-explanation {
    color: $color14;
    text-align: justify;
}

.test {
    color: #ffffff;
}
</style>

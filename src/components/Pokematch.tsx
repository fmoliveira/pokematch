import { useEffect, useState } from "preact/hooks";
import { usePokemon, shuffle } from "../utils";
import PokeCard from "./PokeCard";
import { Pokemon, PokemonGeneration } from "../types/pokemon";
import { UseQueryResult, useQueryClient } from "@tanstack/react-query";
import { pewpewpew } from "../utils";
import Loader from "./Loader";

type PokemonData = UseQueryResult<Pokemon[], Error>;

export default function Pokematch() {
	// usePokemon(gen number)
	const [gen, setGen] = useState<PokemonGeneration>(1);
	const queryClient = useQueryClient();
	const { data, isInitialLoading, error, refetch }: PokemonData = usePokemon(gen);
	const [turns, setTurns] = useState<number>(0);
	const [gameWin, setGameWin] = useState<boolean>(false);

	// deck is an array of objects
	const [deck, setDeck] = useState<Pokemon[]>([]);

	// grab 8 random unique pokemon from data to be used in card match game
	const randomUniquePokemon = (): Pokemon[] => {
		if (data && !isInitialLoading) {
			const randomPokemon: Pokemon[] = [];
			while (randomPokemon.length < 6) {
				const randomIndex = Math.floor(Math.random() * data.length);
				// ensure there are no duplicates
				if (!randomPokemon.includes(data[randomIndex])) {
					randomPokemon.push(data[randomIndex]);
				}
			}
			//  duplicate randomPokemon array and shuffle
			return shuffle([...randomPokemon, ...randomPokemon]);
		}
		return [];
	};

	// set deck state to randomUniquePokemon
	if (data && !isInitialLoading && deck.length === 0) {
		setDeck(randomUniquePokemon());
	}

	const handleReset = () => {
		const nextGen = (gen + 1) as PokemonGeneration;
		setGen(nextGen);
		setTimeout(() => {
			queryClient.clear();
			refetch();
			setDeck(randomUniquePokemon());
			setTurns(0);
			setGameWin(false);
			const cards = document.querySelectorAll(".card-btn");
			cards.forEach((card) => card.classList.remove("flipped"));
		}, 500);
	};

	const scoringMessages = () => {
		if (turns <= 9) {
			return "You're a Pokematch Master!";
		} else if (turns > 9 && turns <= 13) {
			return "You're a Pokematch Trainer!";
		} else if (turns > 13 && turns <= 18) {
			return "You're a Pokematch Rookie!";
		} else {
			return "You're a Pokematch Noob!";
		}
	};

	return (
		<>
			<h1>
				Pokematch <i>GEN {gen}</i>
			</h1>
			{isInitialLoading ? (
				<Loader pokeball={true} />
			) : error ? (
				<div>
					Uh oh
					<br /> {error}
				</div>
			) : (
				<>
					<div className={"card-container"}>
						{deck && (
							<PokeCard
								pokemons={deck}
								turns={turns}
								setTurns={setTurns}
								setGameWin={setGameWin}
								gameWin={gameWin}
							/>
						)}
					</div>
					<p className={"turns"}>Turns: {turns}</p>
					{gameWin && pewpewpew()}
					{gameWin && (
						<div className="gameOvered ">
							<h2>You won!</h2>
							{/* <p>You completed the game in {turns} turns</p> */}
							<p>{scoringMessages()}</p>
							<button className={"restartBtn"} onClick={handleReset}>
								New Game?
							</button>
						</div>
					)}
				</>
			)}
		</>
	);
}

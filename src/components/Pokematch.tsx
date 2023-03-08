import { useEffect, useState } from "preact/hooks";
import { usePokemon, shuffle } from "../utils";
import PokeCard from "./PokeCard";
import { Pokemon, PokemonGeneration } from "../types/pokemon";
import { UseQueryResult, useQueryClient } from "@tanstack/react-query";
import { pewpewpew } from "../utils";
import Loader from "./Loader";
import GameOvered from "./GameOvered";

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
		setDeck(randomUniquePokemon());
		setTurns(0);
		setGameWin(false);
		const cards = document.querySelectorAll(".card-btn");
		cards.forEach((card) => card.classList.remove("flipped"));
	};

	useEffect(() => {
		const refetchData = async () => {
			await queryClient.clear();
			await refetch();
		};
		refetchData();
	}, [gen, refetch, queryClient]);

	// toggle game-over class to body
	useEffect(() => {
		const body = document.querySelector("body");
		gameWin ? body?.classList.add("game-over") : body?.classList.remove("game-over");
	}, [gameWin]);

	return (
		<>
			<h1>
				Pokematch{" "}
				<i>
					GEN <span>{gen}</span>
				</i>
			</h1>
			<p className={"instructions"}>
				Match the Pokemon, complete all 9 generations to win! (in progress)
			</p>
			{isInitialLoading ? (
				<Loader pokeball={true} />
			) : error ? (
				<p className={"error"}>
					Oh dang, something went wrong <br /> {error}
				</p>
			) : (
				<>
					<div className={`card-container deckgen-${gen}`}>
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
					<GameOvered
						gameWin={gameWin}
						deck={deck}
						handleReset={handleReset}
						turns={turns}
						gen={gen}
					/>
				</>
			)}
		</>
	);
}

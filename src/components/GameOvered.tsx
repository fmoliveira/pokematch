import { scoringMessages, pewpewpew } from "../utils";
import { Pokemon, PokemonGeneration } from "../types/pokemon";
import { useEffect, useState } from "preact/hooks";

const GameOvered = ({
	gameWin,
	deck,
	handleReset,
	turns,
	gen,
	mute,
}: {
	gameWin: boolean;
	deck: Pokemon[];
	handleReset: () => void;
	turns: number;
	gen: PokemonGeneration;
	mute: boolean;
}) => {
	const [activeIndex, setActiveIndex] = useState(-1);

	useEffect(() => {
		if (gameWin && !mute) {
			const audio = new Audio("/success.mp3");
			audio.play();
		}
		{
			gen === 9 && pewpewpew();
		}
		const lis = document.querySelectorAll(".pokeCaught");
		let i = 0;
		const intervalId = setInterval(() => {
			if (i >= lis.length) {
				clearInterval(intervalId);
				return;
			}
			lis[i].classList.add("active");
			setActiveIndex((prevIndex) => i);
			i++;
		}, 500);
		return () => clearInterval(intervalId);
	}, [deck, gameWin]);

	return (
		<>
			<div className="gameOvered">
				<h2>
					You caught <span>em</span> all!
				</h2>
				<div className="pokemonList">
					<h3>Pokemon's Caught: </h3>
					<ul className="pokesCaught">
						{deck &&
							[...new Set(deck)].map((pokemon) => (
								<li
									key={pokemon.id}
									className={`pokeCaught${activeIndex === pokemon.id ? " active" : ""}`}
								>
									<img
										src={pokemon.sprites.front_default}
										alt={pokemon.name}
										width="96"
										height="96"
									/>
									<p>{pokemon.name}</p>
								</li>
							))}
					</ul>
				</div>
				<p className="scoringMessage">{scoringMessages(turns)}</p>

				{gen === 9 ? (
					<p className="gameOveredMessage">
						You have completed all 9 generations of Pokemon! Congratulations!
					</p>
				) : (
					<>
						<button className={"restartBtn"} onClick={handleReset}>
							Play Again?
						</button>
						<p className="upNext">
							Generation <strong>{gen + 1}</strong> is up next!
						</p>
					</>
				)}
			</div>
		</>
	);
};

export default GameOvered;
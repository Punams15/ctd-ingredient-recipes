import { useEffect, useState, useMemo } from 'react';
import './App.css';
import IngredientForm from './components/IngredientForm';
import RecipeList from './components/RecipeList';

const KEY = import.meta.env.VITE__API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

function App() {
  const [term, setTerm] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [searchCache, setSearchCache] = useState({});
  const [currentOffset, setCurrentOffset] = useState(0);
  const [nextOffset, setNextOffset] = useState(0);
  const [resultsCount, setResultsCount] = useState(0);
  const [isPaginationDisabled, setIsPaginationDisabled] = useState(false);
  const paginationSize = 10;

  const pendingQuery = useMemo(
    () => `${term} offset ${nextOffset}`,
    [term, nextOffset]
  );

  const paginationInfo = useMemo(
    () => ({
      currentPage: Math.floor(currentOffset / paginationSize) + 1,
      totalPages: Math.ceil(resultsCount / paginationSize),
    }),
    [currentOffset, resultsCount, paginationSize]
  );

  useEffect(() => {
    if (!term) {
      return;
    }
    if (nextOffset > 0 && nextOffset === currentOffset) {
      return;
    }
    if (searchCache[pendingQuery]) {
      console.log('setting from cache: ', searchCache[pendingQuery]);
      setCurrentOffset(nextOffset);
      setRecipes([...searchCache[pendingQuery]]);
      return;
    }
    async function getRecipes() {
      console.log('fetching from api...');
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': `${KEY}`,
        },
      };
      const params = [
        `includeIngredients=${term}`,
        `addRecipeInformation=true`,
        `offset=${nextOffset}`,
        `number=${paginationSize}`,
      ];
      const queryString = params.join('&');
      try {
        const resp = await fetch(
          `${BASE_URL}/complexSearch?${queryString}`,
          options
        );
        if (resp.ok) {
          const data = await resp.json();
          setRecipes(data.results);
          setResultsCount(data.totalResults);
          setSearchCache((prevCache) => ({
            ...prevCache,
            [pendingQuery]: data.results,
          }));
          setCurrentOffset(nextOffset);
        }
      } catch (e) {
        console.log(e);
      }
    }
    getRecipes();
  }, [term, nextOffset, currentOffset, searchCache, pendingQuery]);

  const pageBack = () => {
    setIsPaginationDisabled(true);
    setNextOffset((prevOffset) => Math.max(prevOffset - paginationSize, 0));
    setTimeout(() => setIsPaginationDisabled(false), 650);
  };

  const pageForward = () => {
    setIsPaginationDisabled(true);
    setNextOffset((prevOffset) => prevOffset + paginationSize);
    setTimeout(() => setIsPaginationDisabled(false), 650);
  };

  useEffect(() => {
    setNextOffset(0);
  }, [term]);

  return (
    <>
      <main>
        <h1>Find Recipes by Ingredient</h1>
        <IngredientForm term={term} setTerm={setTerm} />
        <RecipeList results={recipes} />
        {recipes.length > 0 && (
          <div className="paginate">
            <button
              disabled={isPaginationDisabled || currentOffset === 0}
              onClick={pageBack}
            >
              Previous
            </button>
            <span>
              Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
            </span>
            <button
              onClick={pageForward}
              disabled={
                isPaginationDisabled ||
                currentOffset + paginationSize >= resultsCount
              }
            >
              Next
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export default App;


//https://github.com/Code-the-Dream-School/ctd-ingredient-recipes

//https://spoonacular.com/food-api

//https://spoonacular.com/food-api/pricing



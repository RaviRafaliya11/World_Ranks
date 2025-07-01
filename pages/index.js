import Layout from "./../components/Layout/Layout";
import SearchInput from "./../components/SearchInput/SearchInput";
import CountriesTable from "./../components/CountriesTable/CountriesTable";
import { useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home({ countries }) {
  const [keyword, setKeyword] = useState("");
  const filteredCountries = countries.filter(
    (country) =>
      country.name.common.toLowerCase().includes(keyword) ||
      country.region.toLowerCase().includes(keyword) ||
      country.subregion?.toLowerCase().includes(keyword) ||
      country.capital?.[0]?.toLowerCase().includes(keyword) // Handle capital being an array
  );

  const onInputChange = (e) => {
    e.preventDefault();
    setKeyword(e.target.value.toLowerCase());
  };
  return (
    <Layout>
      <div className={styles.inputContainer}>
        <div className={styles.counts}>Found {countries.length} countries</div>

        <div className={styles.input}>
          <SearchInput
            placeholder="Filter by Name, Region, Subregion, or Capital"
            onChange={onInputChange}
          />
        </div>
      </div>

      <CountriesTable countries={filteredCountries} />
    </Layout>
  );
}

export const getStaticProps = async () => {
  // Specify all fields needed for the CountriesTable and filtering
  const fields =
    "name,population,area,gini,flags,region,subregion,capital,cca3,ccn3";
  const res = await fetch(
    `https://restcountries.com/v3.1/all?fields=${fields}`
  );

  if (!res.ok) {
    console.error(
      `Failed to fetch all countries for index page: ${res.status} ${res.statusText}`
    );
    return {
      props: {
        countries: [],
      },
    };
  }

  const countries = await res.json();

  if (!Array.isArray(countries)) {
    console.error(
      "API did not return an array for all countries on index page. Received:",
      countries
    );
    return {
      props: {
        countries: [],
      },
    };
  }

  return {
    props: {
      countries,
    },
  };
};

import { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import styles from "./Country.module.css";
import Link from "next/link";
import Image from "next/image"; // Import Next.js Image component for optimization

// Function to fetch a single country by its Alpha-3 code (cca3)
const getCountry = async (id) => {
  const res = await fetch(`https://restcountries.com/v3.1/alpha/${id}`);

  if (!res.ok) {
    console.error(
      `Failed to fetch country with ID ${id}: ${res.status} ${res.statusText}`
    );
    return null;
  }

  const data = await res.json();
  return data[0]; // /alpha endpoint in v3.1 returns an array of one country object
};

const Country = ({ country }) => {
  const [borders, setBorders] = useState([]);

  useEffect(() => {
    if (country?.borders) {
      getBorders();
    }
  }, [country?.borders]);

  if (!country) {
    return (
      <Layout title="Country Not Found">
        <div className={styles.container}>
          <p>
            Country data could not be loaded. This might be due to an invalid
            country ID or an API issue.
          </p>
          <Link href="/" passHref>
            <a>Go back to home</a>
          </Link>
        </div>
      </Layout>
    );
  }

  const getBorders = async () => {
    if (country.borders && country.borders.length > 0) {
      const borderCountries = await Promise.all(
        country.borders.map((borderAlpha3Code) => getCountry(borderAlpha3Code))
      );
      setBorders(borderCountries.filter((b) => b !== null));
    } else {
      setBorders([]);
    }
  };

  // Helper to format population for readability
  const formatPopulation = (pop) => {
    return pop ? pop.toLocaleString() : "N/A";
  };

  // Helper to get Capital (now an array)
  const getCapital = (capitals) => {
    return capitals && capitals.length > 0 ? capitals[0] : "N/A";
  };

  // Helper to get Languages (now an object)
  const getLanguages = (langs) => {
    return langs ? Object.values(langs).join(", ") : "N/A";
  };

  // Helper to get Currencies (now an object)
  const getCurrencies = (currs) => {
    return currs
      ? Object.values(currs)
          .map((c) => c.name)
          .join(", ")
      : "N/A";
  };

  // Helper to get Native Name (now a complex object)
  const getNativeName = (nativeNames) => {
    if (!nativeNames) return "N/A";
    // Prioritize English native name if available, otherwise take the first available
    if (nativeNames.eng && nativeNames.eng.common) {
      return nativeNames.eng.common;
    }
    const firstLanguageCode = Object.keys(nativeNames)[0];
    return firstLanguageCode ? nativeNames[firstLanguageCode].common : "N/A";
  };

  // Helper to get Gini value (now an object {year: value})
  const getGini = (giniData) => {
    if (!giniData || Object.keys(giniData).length === 0) return "N/A";
    // Get the most recent Gini value (assuming year keys are numbers or sortable)
    const years = Object.keys(giniData).sort(
      (a, b) => parseInt(b) - parseInt(a)
    );
    if (years.length > 0) {
      return `${giniData[years[0]]} %`;
    }
    return "N/A";
  };

  return (
    <Layout title={country.name.common}>
      <div className={styles.container}>
        <div className={styles.container_left}>
          <div className={styles.overview_panel}>
            <Image
              layout="responsive"
              width={280}
              height={187}
              src={country.flags.svg}
              alt={country.name.common}
            />
            <h1 className={styles.overview_name}>{country.name.common}</h1>
            <div className={styles.overview_region}>{country.region}</div>

            <div className={styles.overview_numbers}>
              <div className={styles.overview_population}>
                <div className={styles.overview_value}>
                  {formatPopulation(country.population)}
                </div>
                <div className={styles.overview_label}>Population</div>
              </div>

              <div className={styles.overview_area}>
                <div className={styles.overview_value}>
                  {country.area?.toLocaleString() || "N/A"}
                </div>
                <div className={styles.overview_label}>Area (km²)</div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.container_right}>
          <div className={styles.details_panel}>
            <h4 className={styles.details_panel_heading}>Details</h4>

            <div className={styles.details_panel_row}>
              <div className={styles.details_panel_label}>Capital</div>
              <div className={styles.details_panel_value}>
                {getCapital(country.capital)}
              </div>
            </div>

            <div className={styles.details_panel_row}>
              <div className={styles.details_panel_label}>Languages</div>
              <div className={styles.details_panel_value}>
                {getLanguages(country.languages)}
              </div>
            </div>

            <div className={styles.details_panel_row}>
              <div className={styles.details_panel_label}>Currencies</div>
              <div className={styles.details_panel_value}>
                {getCurrencies(country.currencies)}
              </div>
            </div>

            <div className={styles.details_panel_row}>
              <div className={styles.details_panel_label}>Native name</div>
              <div className={styles.details_panel_value}>
                {getNativeName(country.name.nativeName)}
              </div>
            </div>

            <div className={styles.details_panel_row}>
              <div className={styles.details_panel_label}>Gini</div>
              <div className={styles.details_panel_value}>
                {getGini(country.gini)}
              </div>
            </div>

            <div className={styles.details_panel_borders}>
              <div className={styles.details_panel_borders_label}>
                Neighbouring Countries
              </div>

              <div className={styles.details_panel_borders_container}>
                {borders.length > 0 ? (
                  borders.map((borderCountry) => (
                    <Link
                      href={`/country/${borderCountry.cca3}`}
                      key={borderCountry.cca3}
                      passHref
                    >
                      <a className={styles.details_panel_borders_country}>
                        <Image
                          src={borderCountry.flags.svg}
                          alt={borderCountry.name.common}
                          width={145}
                          height={83}
                          objectFit="cover"
                        />
                        <div className={styles.details_panel_borders_name}>
                          {borderCountry.name.common}
                        </div>
                      </a>
                    </Link>
                  ))
                ) : (
                  <p>No neighbouring countries</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Country;

export const getStaticPaths = async () => {
  // Specify only the fields necessary for building the paths (cca3)
  // This is already well-optimized.
  const fields = "cca3";
  const res = await fetch(
    `https://restcountries.com/v3.1/all?fields=${fields}`
  );

  if (!res.ok) {
    console.error(
      `Failed to fetch all countries for getStaticPaths: ${res.status} ${res.statusText}`
    );
    return {
      paths: [],
      fallback: false,
    };
  }

  const countries = await res.json();

  if (!Array.isArray(countries)) {
    console.error(
      "API did not return an array for all countries. Received:",
      countries
    );
    return {
      paths: [],
      fallback: false,
    };
  }

  const paths = countries.map((country) => ({
    params: { id: country.cca3 },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async ({ params }) => {
  const country = await getCountry(params.id);

  return {
    props: {
      country,
    },
  };
};

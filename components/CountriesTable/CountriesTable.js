import {
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
} from "@material-ui/icons";
import { useState } from "react";
import styles from "./CountriesTable.module.css";
import Link from "next/link";
import Image from "next/image"; // Import Next.js Image component

// Helper function to get nested property value
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;

  const value = path.split(".").reduce((acc, part) => {
    if (acc === null || acc === undefined) {
      return undefined;
    }
    return acc[part];
  }, obj);

  // Special handling for Gini: if it's an object, get the value of the first key
  if (path === "gini" && typeof value === "object" && value !== null) {
    const keys = Object.keys(value);
    if (keys.length > 0) {
      return value[keys[0]];
    }
    return undefined;
  }

  return value;
};

const orderBy = (countries, value, direction) => {
  if (!value) return countries;

  const sortedCountries = [...countries].sort((a, b) => {
    const valA = getNestedValue(a, value);
    const valB = getNestedValue(b, value);

    // Handle different types for comparison
    if (typeof valA === "string" && typeof valB === "string") {
      return direction === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    // Handle cases where values might be undefined/null for consistent sorting
    if (valA === undefined || valA === null)
      return direction === "asc" ? 1 : -1;
    if (valB === undefined || valB === null)
      return direction === "asc" ? -1 : 1;

    // For numbers or other comparable types
    if (direction === "asc") {
      return valA > valB ? 1 : -1;
    } else {
      return valA > valB ? -1 : 1;
    }
  });

  return sortedCountries;
};

const SortArrow = ({ direction }) => {
  if (!direction) {
    return <></>;
  }

  if (direction === "desc") {
    return (
      <div className={styles.heading_arrow}>
        <KeyboardArrowDownRounded color="inherit" />
      </div>
    );
  } else {
    return (
      <div className={styles.heading_arrow}>
        <KeyboardArrowUpRounded color="inherit" />
      </div>
    );
  }
};

const CountriesTable = ({ countries }) => {
  // Set initial state for sorting: by 'name.common' in 'asc' direction
  const [direction, setDirection] = useState("asc");
  const [value, setValue] = useState("name.common");

  const orderedCountries = orderBy(countries, value, direction);

  const switchDirection = () => {
    if (!direction) {
      setDirection("desc");
    } else if (direction === "desc") {
      setDirection("asc");
    } else {
      setDirection(null); // Reset sorting if cycled through both directions
    }
  };

  const setValueAndDirection = (newValue) => {
    if (newValue !== value) {
      setDirection("desc"); // Default to 'desc' when switching to a new column
    } else {
      switchDirection(); // Cycle direction if clicking the same column
    }
    setValue(newValue);
  };

  return (
    <div>
      <div className={styles.heading}>
        <div className={styles.heading_flag}></div>

        <button
          className={styles.heading_name}
          onClick={() => setValueAndDirection("name.common")}
        >
          <div>Name</div>
          {value === "name.common" && <SortArrow direction={direction} />}
        </button>

        <button
          className={styles.heading_population}
          onClick={() => setValueAndDirection("population")}
        >
          <div>Population</div>
          {value === "population" && <SortArrow direction={direction} />}
        </button>

        <button
          className={styles.heading_area}
          onClick={() => setValueAndDirection("area")}
        >
          <div>
            Area (km<sup style={{ fontSize: "0.5rem" }}>2</sup>)
          </div>
          {value === "area" && <SortArrow direction={direction} />}
        </button>

        <button
          className={styles.heading_gini}
          onClick={() => setValueAndDirection("gini")}
        >
          <div>Gini</div>
          {value === "gini" && <SortArrow direction={direction} />}
        </button>
      </div>

      {orderedCountries.map((country) => {
        // Use cca3 for unique ID in URL (most reliable)
        const countryId =
          country.cca3 ||
          country.ccn3 ||
          country.name.common.replace(/\s/g, "-").toLowerCase();

        return (
          <Link
            href={`/country/${countryId}`}
            key={country.name.official || country.name.common} // Use official or common name as key
            passHref
          >
            <a className={styles.row}>
              <div className={styles.flag}>
                <Image
                  src={country.flags.svg}
                  alt={country.name.common}
                  width={59}
                  height={39}
                  objectFit="cover"
                  className={styles.Image}
                />
              </div>
              <div className={styles.name}>{country.name.common}</div>
              <div className={styles.population}>
                {country.population?.toLocaleString() || 0}
              </div>
              <div className={styles.area}>
                {country.area?.toLocaleString() || 0}
              </div>
              <div className={styles.gini}>
                {getNestedValue(country, "gini") || 0}%
              </div>
            </a>
          </Link>
        );
      })}
    </div>
  );
};

export default CountriesTable;

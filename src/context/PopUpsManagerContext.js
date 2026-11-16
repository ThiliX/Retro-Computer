import { createContext, useCallback, useContext, useState } from "react";

const PopUpsManagerContext = createContext();

export const usePopUpsManager = () => {
	return useContext(PopUpsManagerContext);
};

export function PopUpsManagerContextProvider({ children }) {
	const [openedPopUps, setOpenedPopUps] = useState([]);

	const getPopUpFromId = useCallback((id) => openedPopUps.find((popUp) => popUp[0] === id), [openedPopUps]);

	function openPopUp(id, popUp) {
		setOpenedPopUps((previousPopUps) => {
			if (previousPopUps.some((existing) => existing[0] === id)) {
				return previousPopUps;
			}
			return [...previousPopUps, [id, popUp]];
		});
	}

	function closePopUp(id) {
		setOpenedPopUps((previousPopUps) => previousPopUps.filter((popUp) => popUp[0] !== id));
	}

	return <PopUpsManagerContext.Provider value={{ getPopUpFromId, openPopUp, closePopUp, openedPopUps }}>{children}</PopUpsManagerContext.Provider>;
}

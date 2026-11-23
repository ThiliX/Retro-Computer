import "./AppDisplay.css";

import React, { useEffect, useRef } from "react";

import PageWithOptions from "./PageWithOptions";

import { useAppsManager } from "../context/AppsManagerContext";

export const TITLE_BAR_HEIGHT = 30;

/** A Luna-style window: blue title bar, minimize / maximize / close, beige frame. */
const AppDisplay = React.forwardRef(
	(
		{
			appCoreRef,
			AppRenderer,
			title,
			icon,
			width,
			height,
			x,
			y,
			backgroundColor,
			onClick,
			onMinimizeButtonClick,
			onCloseButtonClick,
			onTopBarDragStart,
			onTopBarDragEnd,
			onTopBarDrag,
			setDisplayRef,
			overflowY,
			options,
			initialOption,
			isMinimized,
		},
		ref
	) => {
		const { focusedApp } = useAppsManager();

		const appDisplayRef = useRef(null);
		const isActive = focusedApp?.current === appDisplayRef?.current;

		useEffect(() => {
			setDisplayRef(appDisplayRef);
		}, [appDisplayRef, setDisplayRef]);

		function handleMinimizeClick(e) {
			e.stopPropagation();
			onMinimizeButtonClick();
		}

		function handleCloseClick(e) {
			e.stopPropagation();
			onCloseButtonClick();
		}

		const contentHeight = height - TITLE_BAR_HEIGHT;

		return (
			<div
				className={`xp-window ${isActive ? "active" : "inactive"}`}
				style={{
					left: `${x}px`,
					top: `${y}px`,
					// +3 for the bottom frame edge, so the content keeps its full height
					height: height + 3,
					width: width + 6,
					zIndex: isActive ? 10000 : 9990,
					display: isMinimized ? "none" : "flex",
				}}
				ref={appDisplayRef}
				onMouseDown={onClick}
			>
				<div draggable className="xp-titlebar" onDragStart={onTopBarDragStart} onDragEnd={onTopBarDragEnd} onDrag={onTopBarDrag}>
					<img src={icon} className="xp-titlebar-icon" alt="" draggable={false} />
					<div className="xp-titlebar-title">{title}</div>
					<div className="xp-titlebar-buttons">
						<button className="xp-caption-btn minimize" onMouseDown={(e) => e.stopPropagation()} onClick={handleMinimizeClick} title="Minimize" aria-label="Minimize" />
						<button className="xp-caption-btn maximize" disabled title="Maximize" aria-label="Maximize" />
						<button className="xp-caption-btn close" onMouseDown={(e) => e.stopPropagation()} onClick={handleCloseClick} title="Close" aria-label="Close" />
					</div>
				</div>

				<div className="xp-window-body" style={{ height: `${contentHeight}px`, overflowY, backgroundColor }}>
					{options ? (
						<PageWithOptions appCoreRef={appCoreRef} AppRenderer={AppRenderer} options={options} initialOption={initialOption} appDisplayRef={ref} />
					) : (
						<AppRenderer appCoreRef={appCoreRef} />
					)}
				</div>
			</div>
		);
	}
);

export default AppDisplay;

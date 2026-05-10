import "./AppDisplay.css";

import React, { useEffect, useRef } from "react";

import PageWithOptions from "./PageWithOptions";

import { useAppsManager } from "../context/AppsManagerContext";

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
			topBarColor,
			titleColor,
			children,
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

		return (
			<div
				className="app-interface-container"
				style={{
					left: `${x}px`,
					top: `${y}px`,
					height: height,
					width: width,
					position: "absolute",
					backgroundColor: backgroundColor,
					zIndex: focusedApp?.current === appDisplayRef?.current ? 10000 : 9990,
					display: isMinimized ? "none" : "block",
				}}
				ref={appDisplayRef}
				onClick={onClick}
			>
				<div
					draggable
					className="app-interface-top-bar-container"
					style={{ backgroundColor: topBarColor, width: "100%", height: "30px" }}
					onDragStart={onTopBarDragStart}
					onDragEnd={onTopBarDragEnd}
					onDrag={onTopBarDrag}
				>
					<div className="app-interface-top-bar-left-icons-container">
						<img src={icon} className="app-interface-top-bar-icon" alt="" />
						<div className="app-interface-top-bar-title" style={{ color: titleColor }}>
							{title}
						</div>
					</div>
					<div className="app-interface-right-icons-container">
						<div className="app-interface-top-bar-min-btn" onClick={handleMinimizeClick} title="Minimize" />
						<div className="app-interface-top-bar-close-btn" onClick={handleCloseClick} title="Close" />
					</div>
				</div>

				{options ? (
					<div className="app-interface-content-container" style={{ width: "100%", height: `${height - 30}px`, overflow: `${overflowY}` }}>
						<PageWithOptions appCoreRef={appCoreRef} AppRenderer={AppRenderer} options={options} initialOption={initialOption} appDisplayRef={ref} />
					</div>
				) : (
					<div className="app-interface-content-container" style={{ width: "100%", height: `${height - 30 - (options ? 30 : 0)}px`, overflow: `${overflowY}` }}>
						<AppRenderer appCoreRef={appCoreRef} />
					</div>
				)}
			</div>
		);
	}
);

export default AppDisplay;

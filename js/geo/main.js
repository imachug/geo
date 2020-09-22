(() => {
	const canvas = document.querySelector("canvas");
	const ctx = canvas.getContext("2d");
	ctx.translate(0.5, 0.5);

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	Geo.render(PLOT, ctx);

	window.addEventListener("resize", () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		Geo.render(PLOT, ctx);
	});
})();
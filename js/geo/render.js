Geo.render = (plotFunction, ctx) => {
	let currentProperties = {};
	let functionNestingLevel = 0;

	const renderObjects = [];

	// Create scope object
	const scope = new Proxy({}, {
		// Allows 'with' statement to capture new variables and
		// Func[key=value] to capture 'key' access
		has(target, name) {
			return true;
		},

		get(target, name) {
			if(name in Geo.functions) {
				const func = (...args) => {
					functionNestingLevel--;
					const obj = Geo.functions[name](...args);
					if(functionNestingLevel === 0) {
						renderObjects.push(obj);
					}
					return obj;
				};

				const funcProxy = new Proxy(func, {
					// Handle Func[key=value]
					has(target, name) {
						return true;
					},
					get(target, name) {
						const properties = currentProperties;
						currentProperties = {};
						return (...args) => target(properties, ...args);
					},
					apply(target, thisValue, args) {
						return target({}, ...args);
					}
				});
				functionNestingLevel++;

				return funcProxy;
			} else if(!(name in target) && functionNestingLevel > 0 && typeof name !== "symbol") {
				currentProperties[name] = true;
			}

			return target[name];
		},

		set(target, name, value) {
			if(functionNestingLevel > 0) {
				currentProperties[name] = value;
			} else {
				target[name] = value;
			}
			return true;
		}
	});

	// Add constants to scope
	for(const name of Object.keys(Geo.constants)) {
		Object.defineProperty(scope, name, {
			value: Geo.constants[name],
			writable: false,
			enumerable: false
		});
	}

	// Call plot function
	(new Function(
		"scope",
		`with(scope) { (${plotFunction})(); }`
	))(scope);

	renderObjects.sort((a, b) => Geo.functionRenderOrder.indexOf(a.type) - Geo.functionRenderOrder.indexOf(b.type));

	for(const obj of renderObjects) {
		obj.render(ctx);
	}
};


Geo.render.toScreenLength = length => {
	return length * Math.min(window.innerWidth, window.innerHeight) / 3;
};

Geo.render.toScreenCoordX = x => {
	return Geo.render.toScreenLength(x) + window.innerWidth / 2;
};
Geo.render.toScreenCoordY = y => {
	return Geo.render.toScreenLength(-y) + window.innerHeight / 2;
};
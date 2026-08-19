# twanghcmut/bridgequant-async-libero-unified-95

## Resumen

BridgeQuant-Async es una familia de modelos vision-language-action (VLA) para manipulacion robotica, desarrollada por twanghcmut y publicada bajo licencia Apache 2.0. Este repositorio concreto, `bridgequant-async-libero-unified-95`, contiene cuatro checkpoints (uno por cada suite del benchmark LIBERO: Object, Spatial, Goal y Long) entrenados con una receta unica e identica, sin ajuste por suite. El objetivo es demostrar que una sola arquitectura y un unico protocolo de entrenamiento pueden alcanzar un rendimiento medio del 95.0 % en modo sincrono y 93.5 % en modo asincrono sobre las cuatro suites de LIBERO.

La arquitectura combina un backbone vision-language LFM2.5-VL-450M (finetune completo) con un BridgeConnector y un BridgeActionHead basado en flow matching con chunk de 16 pasos, totalizando aproximadamente 480 millones de parametros. La innovacion principal reside en el balanceo adaptativo de tareas (GroupDRO-lite con α=0.25) que pondera cada tarea segun su loss EMA sin codificar identidades de tarea, junto con un controlador asincrono que refresca la vision en momentos criticos en lugar de seguir un reloj fijo.

El repositorio tiene un tamano de 4.1 GB y fue creado en agosto de 2026. Es relevante porque aborda dos problemas clave en robotica: la generalizacion entre tareas con una receta unica (sin tuning por suite) y el despliegue asincrono con replanificacion rapida (~5 ms) para entornos dinamicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5-VL-450M (backbone VL) + BridgeConnector + BridgeActionHead (flow matching, chunk 16) |
| Parametros totales | ~480M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) + norm_stats.json + config.json + metadata.json |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura VLA (vision-language-action) de tres componentes: un backbone LFM2.5-VL-450M preentrenado en vision-lenguaje que se finetunea por completo, un BridgeConnector que proyecta las representaciones del backbone hacia el espacio de acciones, y un BridgeActionHead que genera acciones mediante flow matching con un chunk de 16 pasos. El flujo de datos es: imagen + instruccion en lenguaje natural → backbone VL → conector → cabeza de acciones → secuencia de 16 acciones de manipulacion.

El entrenamiento usa una receta identica para las cuatro suites: learning rate 5e-5, 30.000 pasos, batch size 16, seed 42, suavizado 0.05, oversampling de transiciones 1.25/12, loss de NCE de lenguaje 0.01, y un balanceo adaptativo de tareas con GroupDRO-lite (α=0.25). Este balanceo pondera cada tarea segun la razon (loss EMA de la tarea / media)^0.25, recortado a 4x y con conservacion de masa, agrupando por cadena de instruccion sin codificar identidades de tarea. Los datos de entrenamiento son exclusivamente las demostraciones originales de cada suite de LIBERO, sin datos aumentados ni mezclas entre suites.

El protocolo de inferencia usa K=8 pasos de accion (n_action_steps) con seed 42 y 200 episodios por suite. El modo asincrono emplea un controlador con refresco de contexto cada 2 pasos, refresco de precision en aproximacion y refresco por incertidumbre, sin RTC (runtime control). El chunk de 16 esta integrado en los pesos, pero K es ajustable hasta 16.

## Capacidades

- Manipulacion robotica condicionada por instrucciones en lenguaje natural sobre el benchmark LIBERO (tareas de sobremesa con un brazo robotico).
- Ejecucion de tareas de largo horizonte: la suite Long alcanza un 89.0 % en modo sincrono y 85.5 % en asincrono, lo que implica razonamiento multi-paso y planificacion secuencial.
- Razonamiento espacial: la suite Spatial logra 96.0 % sincrono, lo que indica capacidad para comprender relaciones de posicion entre objetos.
- Razonamiento orientado a objetivos: la suite Goal alcanza 96.5 % sincrono, el mejor resultado medido por los autores bajo cualquier receta, incluida la especifica por suite.
- Generacion de acciones por flow matching: la cabeza de acciones produce trayectorias suaves de 16 pasos sin necesidad de autoregresion paso a paso.
- Despliegue asincrono: el controlador asincrono refresca la vision en momentos criticos (aproximacion, desacuerdo entre muestreadores) en lugar de usar un reloj fijo, con un coste de replanificacion de ~5 ms gracias al cache del latent del bridge.
- Sin codificacion de identidad de tarea: el balanceo adaptativo agrupa por cadena de instruccion, lo que permite generalizar a instrucciones nuevas sin reentrenar.

## Casos de uso

- Investigacion en robotica de manipulacion: el modelo sirve como baseline reproducible para estudiar transferencia multitarea y aprendizaje lifelong en LIBERO, con configuraciones YAML autocontenidas que facilitan la replicacion exacta.
- Desarrollo de politicas VLA generalistas: la receta unica (sin tuning por suite) permite entrenar un unico pipeline para multiples entornos, reduciendo el coste de ingenieria por tarea.
- Evaluacion de controladores asincronos: el modo asincrono con refresco adaptativo es util para estudiar el equilibrio entre latencia y precision en entornos dinamicos donde la observacion cambia durante la ejecucion.
- Prototipado de sistemas de replanificacion rapida: el cache del latent del bridge (~5 ms de replan) permite experimentar con bucles de control de alta frecuencia sobre politicas VLA.
- Benchmarking de arquitecturas flow matching para robotica: el BridgeActionHead con chunk 16 puede compararse contra cabezas autoregresivas o de diffusion para medir trade-offs de suavidad y latencia.
- Formacion de politicas condicionadas por lenguaje: la suite Goal (96.5 %) demuestra que el modelo puede seguir instrucciones abstractas orientadas a resultados, util para sistemas de tareas definidas por el usuario.
- Integracion en pipelines de robotica educativa: al ser Apache 2.0 y pesar ~480M de parametros, es viable para laboratorios con recursos moderados que necesiten un VLA funcional sin restricciones de licencia.

## Benchmarks y rendimiento

Resultados publicados por el autor en LIBERO (seed 42, 200 episodios por suite, K=8):

| Modo | Object | Spatial | Goal | Long | Media |
|---|---|---|---|---|---|
| Sincrono K=8 | 98.5 | 96.0 | 96.5 | 89.0 | 95.0 |
| Asincrono K=8 | 98.0 | 95.0 | 95.5 | 85.5 | 93.5 |

Resultados adicionales de los repositorios por suite:

| Suite | Configuracion | Tasa de exito |
|---|---|---|
| Object | Asincrono, context-refresh-every 4 | 100.0 |
| Object | Asincrono, controlador unificado K=8 | 99.0 |
| Long | Asincrono, K=16, RTC-freeze 4 + refresco por incertidumbre | 93.0 |
| Long | Asincrono, controlador unificado K=8 | 90.0 |

El autor indica que los checkpoints ajustados por suite alcanzan una media de 96.75, frente al 95.0 de la receta unificada, una diferencia de solo 1.75 puntos porcentuales. No se han publicado resultados en benchmarks generales de VLM (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 4.1 GB y el modelo tiene ~480M de parametros, por lo que en FP32 ocuparia aproximadamente 1.9 GB de VRAM solo en pesos; con safetensors y posibles cuantizaciones cabria en GPUs de consumo como RTX 3060 (12 GB) o superiores.
- No se especifican en la informacion disponible los requisitos exactos de VRAM, GPU recomendadas, latencia ni throughput.
- El coste de replanificacion asincrona se cita como ~5 ms gracias al cache del latent del bridge, lo que sugiere que el modelo puede operar en bucles de control de alta frecuencia en hardware moderado.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI; el flujo de uso documentado es via scripts Python del repositorio del proyecto (`scripts/eval_libero_*.py`).
- El pipeline declarado en HuggingFace es `robotics`, lo que indica que no es un modelo de lenguaje generico sino una politica de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Resultado medio LIBERO | Licencia |
|---|---|---|---|---|---|
| BridgeQuant-Async Unified (este) | ~480M | no disponible | LIBERO (4 suites) | 95.0 sync / 93.5 async | Apache 2.0 |
| BridgeQuant-Async per-suite (object-100, spatial-98, goal-95, long-94) | ~480M | no disponible | LIBERO (4 suites) | 96.75 | Apache 2.0 |
| OpenVLA (referencia de la categoria) | 7B | no disponible | LIBERO | no disponible en la informacion | no disponible |
| RT-2 (referencia de la categoria) | 55B | no disponible | LIBERO | no disponible en la informacion | no disponible |

La comparacion directa con OpenVLA o RT-2 no es posible con los datos disponibles, ya que no se aportan resultados de estos modelos en LIBERO en la informacion proporcionada. La comparacion mas relevante es interna: la receta unificada (95.0) frente a los checkpoints ajustados por suite (96.75), una diferencia de 1.75 puntos que el autor presenta como evidencia de que el ajuste por suite aporta poco cuando la receta base es solida.

## Limitaciones y advertencias

- El modelo esta evaluado exclusivamente en LIBERO, un benchmark de simulacion de sobremesa; no hay evidencia publicada de despliegue en robots fisicos.
- El modo asincrono degrada el rendimiento en la suite Long (85.5 frente a 89.0 sincrono), lo que sugiere que las tareas de largo horizonte son sensibles a la frecuencia de refresco de vision.
- No se especifican los idiomas soportados para las instrucciones; la informacion disponible no aclara si el backbone LFM2.5-VL maneja solo ingles o multiples idiomas.
- No hay datos sobre cuantizacion, por lo que se desconoce el impacto de reducir precision en el rendimiento de manipulacion.
- La latencia de ~5 ms del modo asincrono corresponde solo al replan del latent del bridge; no se aporta la latencia completa de inferencia incluyendo el backbone VL.
- Los resultados dependen de la seed 42 y de 200 episodios por suite; la varianza entre semillas no se ha publicado.
- No se documentan sesgos conocidos, pero al tratarse de un modelo entrenado en demostraciones de simulacion, puede heredar sesgos de los datos de LIBERO (configuraciones de mesa, objetos, estilos de demostracion).
- Riesgo de alucinacion en instrucciones: no se evalua la robustez ante instrucciones ambiguas o contradictorias, un aspecto critico para despliegue real.
- La licencia Apache 2.0 permite uso comercial, pero el codigo del proyecto se referencia como un repositorio de GitHub no especificado en la informacion disponible, por lo que hay que verificar la licencia del codigo de evaluacion por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/twanghcmut/bridgequant-async-libero-unified-95
- Checkpoint Object (100): https://huggingface.co/twanghcmut/bridgequant-async-libero-object-100
- Checkpoint Long (94): https://huggingface.co/twanghcmut/bridgequant-async-libero-long-94
- Referencia LIBERO (GitHub): https://github.com/Geeksongs/LIBERO_async
- Codigo del proyecto: no disponible (referenciado como `https://github.com/<repo>/bridgequant-async` en la model card, sin URL concreta)

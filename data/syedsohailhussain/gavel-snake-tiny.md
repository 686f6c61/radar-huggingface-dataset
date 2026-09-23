# syedsohailhussain/gavel-snake-tiny

## Resumen

Gavel Snake Tiny es un conjunto de tres clasificadores supervisados de muy pequeño tamaño (4,4 M, 11 M y 66 M parámetros) entrenados localmente para jugar al juego Snake en la demo en vivo del proyecto Gavel. No es un modelo de lenguaje generativo: cada movimiento del juego se modela como una decisión tipada (`up | down | left | right`) que el clasificador selecciona a partir de un texto de estado estructurado. Los pesos se distribuyen en formato ONNX y se ejecutan sin API en la nube.

El modelo lo publica el usuario syedsohailhussain como demostración de capacidad ("capability demo") de Gavel, definido por su autor como una capa abierta de decisiones tipadas para agentes de IA: preguntas tipadas de entrada, decisiones calibradas de salida, usando modelos supervisados pequeños en lugar de llamadas a un LLM cuando la tarea no es generativa. La relevancia práctica está en el eje latencia/coste: el variante `gtiny-4m` resuelve una decisión en 0,7 ms en CPU (unas 1.400 decisiones por segundo) con coste marginal cero, frente a los 436 ms p50 y 0,042 USD por millón de tokens de entrada de una API de decisión zero-shot alojada que el autor usa como referencia.

El repositorio, de 0,3 GB, contiene las tres variantes, el tokenizador y gráficos comparativos. La licencia es MIT y la longitud máxima de entrada es de 96 tokens. Se trata de un artefacto de demostración con métricas medidas por el propio autor, sin evaluación independiente ni resultados en benchmarks estándar de NLP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. Clasificadores supervisados exportados a ONNX; los nombres de carpeta sugieren familias tipo GPT diminuto (`gtiny-4m`), BERT (`bert-11m`) y posiblemente DistilBERT (`distil-66m`), sin confirmar en la model card |
| Parámetros totales | 4,4 M (`gtiny-4m`), 11 M (`bert-11m`), 66 M (`distil-66m`) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 96 tokens como máximo |
| Tipos de cuantización | No disponible (se distribuyen ficheros `model.onnx`; no se especifica la precisión) |
| Idiomas soportados | No disponible. La entrada es texto de estado estructurado, no lenguaje natural |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) junto con tokenizador compatible con Hugging Face Transformers |

## Arquitectura y entrenamiento

La información publicada describe tres clasificadores supervisados pequeños entrenados localmente y exportados a ONNX para inferencia con ONNX Runtime. La salida es un vector de logits sobre cuatro clases, correspondientes a los índices `[up, down, left, right]`. La entrada es un texto de estado estructurado con un formato propio del juego, por ejemplo `head(2,2) apple(9,5) len12 heading right || up:free f8 s90 | down:body f0 s0 | left:free f12 s30 | right:tail f6 s100`, truncado a 96 tokens.

Existen dos versiones del formato de estado: `gtiny-4m` usa el formato v1 (sin prefijo de fase), mientras que `bert-11m` y `distil-66m` usan el formato v2, que incluye el prefijo `phase hunt|survive`. Esta diferencia es relevante en la práctica porque determina los argumentos de ejecución de la demo. El autor indica que los scripts de entrenamiento, el método completo y las cifras medidas están en el "Snake cookbook" del repositorio de Gavel, pero no se detallan en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo ajuste por RLHF o DPO (en este caso, por tratarse de clasificadores supervisados, lo esperable sería aprendizaje supervisado a partir de una política maestra o "teacher policy", ya que la validación se define como el acuerdo con dicha política, aunque esto no se explicita como procedimiento).

Como innovación técnica destacable, el proyecto plantea un patrón de decisión tipada de vocabulario cerrado: en lugar de invocar un LLM para una decisión discreta y repetitiva, se emplea un clasificador minúsculo que se ejecuta en CPU. Los gráficos incluidos (`acc_vs_latency.png`, `cost_per_1k.png`, `train_vs_acc.png`) comparan precisión frente a latencia, coste por 1.000 decisiones y coste de entrenamiento frente a precisión.

## Capacidades

- Clasificación de decisiones discretas en un espacio cerrado de cuatro acciones: `up`, `down`, `left`, `right`.
- Inferencia en tiempo real dentro de un bucle de juego cerrado (hasta 1.400 decisiones por segundo en CPU con la variante de 4,4 M).
- Procesamiento de entradas de estado estructurado de hasta 96 tokens con un tokenizador de Hugging Face Transformers.
- Ejecución local sin API en la nube, mediante ONNX Runtime con `CPUExecutionProvider`.
- Tres perfiles distintos de compromiso precisión/latencia: 4,4 M, 11 M y 66 M parámetros.
- Soporte de dos formatos de estado: v1 sin fase (`gtiny-4m`) y v2 con fase `hunt|survive` (`bert-11m` y `distil-66m`).
- No dispone de generación de texto, razonamiento abierto, código, matemáticas, visión, audio, tool calling, function calling ni capacidades multilingües: la información disponible no menciona ninguna de ellas y el diseño del modelo apunta a lo contrario.

## Casos de uso

- Demo interactiva en tiempo real: el clasificador `gtiny-4m` puede alimentar un bucle de juego a 12 fps o más en CPU pura, con 0,7 ms por decisión, lo que permite ejecutar la demo de Gavel sin GPU ni conexión a internet.
- Sustitución de llamadas a un LLM en decisiones cerradas: para tareas donde la salida es una etiqueta de un conjunto fijo, un clasificador de 4,4 M parámetros evita el coste por token y la latencia de red de una API alojada (referencia del autor: 436 ms p50 y 0,042 USD por millón de tokens de entrada en una API zero-shot).
- Estudio comparativo de coste y latencia: los tres puntos de la familia (4,4 M, 11 M y 66 M) permiten medir cómo escala la precisión de validación (95,1 %, 99,5 % y 96,8 %) frente al coste computacional por decisión.
- Prototipado de la capa de decisión tipada de Gavel: sirve como ejemplo reproducible de cómo integrar clasificadores pequeños en un agente que emite decisiones calibradas en lugar de texto libre.
- Control reactivo en entornos simulados con presupuesto de CPU: útil cuando el entorno exige bucles de baja latencia y no hay acelerador disponible, por ejemplo planificación discreta en simuladores educativos.
- Docencia y aprendizaje sobre destilación y clasificación supervisada: el repositorio incluye tres escalas distintas del mismo problema, lo que facilita ilustrar el compromiso entre tamaño, precisión y latencia.
- Pruebas de integración de ONNX Runtime en pipelines de CI: el modelo es lo bastante pequeño (17,6 MB en fp32 para la variante de 4,4 M) como para incluirlo en tests automatizados sin dependencias de hardware especializado.
- Investigación sobre robustez en bucles cerrados: la métrica de "closed-loop play" y el recuento de vetos del escudo de seguridad permiten estudiar la diferencia entre precisión de validación y comportamiento real en un sistema dinámico.

## Benchmarks y rendimiento

El autor publica métricas medidas por él mismo. La precisión de validación se define como el acuerdo con la política maestra sobre estados no vistos; la latencia es por lote de 1, sincronizada; y "Play" son partidas en bucle cerrado con un escudo de seguridad declarado cuyos vetos se contabilizan.

| Variante | Parámetros | Precisión de validación | Decisión en CPU | Decisión en GPU | Partida en bucle cerrado |
|---|---|---|---|---|---|
| `gtiny-4m` | 4,4 M | 95,1 % | 0,7 ms (~1.400/s) | 2,1 ms | Tablero completado, 141 puntos, 0 muertes |
| `bert-11m` | 11 M | 99,5 % | 8,3 ms (~120/s) | 3,6 ms (~280/s) | ~47 puntos de media, muertes raras en el endgame |
| `distil-66m` | 66 M | 96,8 % (régimen) | 20 ms (~50/s) | 4,6 ms (~220/s) | ~47 puntos de media, caza de forma agresiva |

Referencia medida en el mismo equipo por el autor: una API de decisión zero-shot alojada, con 436 ms de p50 y 0,042 USD por millón de tokens de entrada. El modelo de 4,4 M sería unas 600 veces más rápido solo en CPU y con coste marginal cero.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores son específicas del juego Snake y no son extrapolables a tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 0,3 GB. La variante de 4,4 M ocupa aproximadamente 17,6 MB en fp32 y unos 8,8 MB en fp16; la de 11 M, unos 44 MB en fp32; y la de 66 M, unos 264 MB en fp32. Son estimaciones aritméticas a partir del número de parámetros, ya que la precisión real de los ficheros ONNX no se especifica.
- GPU recomendadas: no se indican modelos concretos. Dado el tamaño, cualquier GPU, incluida una integrada, es suficiente; el autor solo reporta cifras de GPU sin especificar el equipo.
- Compatibilidad con GPU de consumo: sí, con margen amplio. Incluso la variante de 66 M cabe en cualquier GPU de consumo actual y en la mayoría de iGPU.
- Ejecución sin GPU: viable y es el modo principal de la demo. `gtiny-4m` alcanza 0,7 ms por decisión en CPU (~1.400/s) y `bert-11m`, 8,3 ms (~120/s).
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` (o proveedor CUDA), tokenizador de Hugging Face Transformers, descarga con `huggingface-cli download` y CLI de la demo de Gavel (`python models/training_state/gavel_snake.py play --brain onnx ...`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y por el tipo de modelo (clasificador, no generativo) no serían las vías habituales.
- Latencia y throughput: 0,7 ms/1.400 por segundo (4,4 M en CPU), 8,3 ms/120 por segundo (11 M en CPU), 20 ms/50 por segundo (66 M en CPU), 2,1 ms (4,4 M en GPU), 3,6 ms/280 por segundo (11 M en GPU) y 4,6 ms/220 por segundo (66 M en GPU), todas medidas con lote de 1.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada. La comparación más útil es interna, entre las tres variantes de la propia familia, además de la referencia de la API alojada citada por el autor.

| Opción | Parámetros | Precisión de validación | Latencia en CPU | Partida en bucle cerrado | Formato de estado | Licencia |
|---|---|---|---|---|---|---|
| `gtiny-4m` | 4,4 M | 95,1 % | 0,7 ms | 141 puntos, 0 muertes | v1 (sin fase) | MIT |
| `bert-11m` | 11 M | 99,5 % | 8,3 ms | ~47 puntos, muertes raras | v2 (`hunt|survive`) | MIT |
| `distil-66m` | 66 M | 96,8 % (régimen) | 20 ms | ~47 puntos, caza agresiva | v2 (`hunt|survive`) | MIT |
| API zero-shot alojada (referencia del autor) | No disponible | No disponible | 436 ms p50 | No aplicable | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje general: no genera texto ni mantiene conversaciones. Es un clasificador de cuatro clases sobre un vocabulario de estado cerrado.
- La precisión de validación no equivale a calidad de juego. El propio autor advierte que cada variante "se ganó su puesto" en partidas en bucle cerrado y que la validación solo mide acuerdo con la política maestra.
- Se producen muertes en el endgame: la persecución voraz se encierra alrededor del 25-30 % de ocupación del tablero. Las rondas se reinician automáticamente con puntuación acumulada.
- La demo incorpora un escudo de seguridad que puede vetar decisiones, y los vetos se contabilizan en pantalla. Los resultados de juego no son, por tanto, puramente del modelo.
- El autor es explícito: el modelo demuestra que decisiones tipadas baratas pueden sostener un bucle en tiempo real, no que los modelos pequeños "entiendan" nada.
- Incompatibilidad de formatos: `gtiny-4m` usa el formato v1 y requiere el argumento `--phased 0`; `bert-11m` y `distil-66m` usan v2. Mezclar formatos y pesos produce resultados incorrectos.
- Longitud de entrada limitada a 96 tokens, suficiente para el estado del juego pero no para contextos largos.
- No hay información sobre sesgos, composición del dataset de entrenamiento, número de tokens vistos ni procesos de alineación. Tampoco hay datos sobre idiomas, ya que la entrada no es lenguaje natural.
- Sin evaluación independiente: el repositorio registra 0 descargas y 0 me gusta, y todas las métricas proceden del autor.
- La licencia MIT permite uso comercial del artefacto, pero el propio autor lo describe como vehículo de demostración y no como producto; no hay garantías de soporte ni de mantenimiento.
- Para producción real habría que auditar el formato de estado, el escudo de seguridad y el comportamiento en bucles cerrados distintos del juego original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syedsohailhussain/gavel-snake-tiny
- Repositorio de Gavel: https://github.com/syedsohailhussain1/gavel
- Cookbook de decisiones tipadas para Snake: https://github.com/syedsohailhussain1/gavel/blob/main/docs/cookbooks/snake-typed-decisions.md
- Gráfico de precisión frente a latencia: https://huggingface.co/syedsohailhussain/gavel-snake-tiny/resolve/main/assets/acc_vs_latency.png
- Gráfico de coste por 1.000 decisiones: https://huggingface.co/syedsohailhussain/gavel-snake-tiny/resolve/main/assets/cost_per_1k.png
- Gráfico de coste de entrenamiento frente a precisión: https://huggingface.co/syedsohailhussain/gavel-snake-tiny/resolve/main/assets/train_vs_acc.png

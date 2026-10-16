# tomzv1/truco-cfr

## Resumen

Truco CFR es un bot de truco argentino para partidas heads-up (uno contra uno) desarrollado por tomzv1 (tomzvilla). No es un modelo de lenguaje: es una red neuronal pequena entrenada con Deep CFR (Counterfactual Regret Minimization profundo, Brown et al., 2019) mediante self-play, sin partidas humanas, sin LLM y sin fine-tuning. Resuelve un problema concreto de IA para juegos de informacion imperfecta: aproximar una estrategia cercana al equilibrio de Nash en un juego de cartas con apuestas, faroles y decisiones secuenciales.

Tecnicamente es un perceptron multicapa (MLP) con arquitectura 304 → 256 → 256 → 256 → 12, con 213.052 parametros totales y un peso en disco de unos 850 KB. La entrada es un vector fijo de 304 caracteristicas codificadas en uint8 y la salida son 12 logits correspondientes a las acciones legales del juego. La politica aplicada es un softmax restringido unicamente a las acciones legales en cada estado.

Su relevancia practica esta en que demuestra que un modelo minusculo entrenado desde cero puede superar a heuristicas escritas a mano y a un LLM de referencia (Claude Haiku) jugando leyendo la mesa como texto, ademas de ejecutarse integramente en el navegador mediante WebAssembly y ONNX Runtime. La variante implementada es truco a 30 puntos, sin flor, con envido y truco, y reglas de bar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) 304 → 256 → 256 → 256 → 12 |
| Parametros totales | 213.052 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada de vector fijo de 304 caracteristicas) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se publican versiones cuantizadas) |
| Idiomas soportados | es (etiqueta de idioma del repositorio; el modelo no genera texto) |
| Licencia | MIT (codigo y pesos); el arte de las cartas usado por la aplicacion web no es MIT |
| Formato de pesos | safetensors, ONNX y `.tcfrw` (formato propio del motor en Rust) |
| Entrada | `features`: uint8[batch, 304] |
| Salida | `logits`: float32[batch, 12] |
| Espacio de acciones | `jugar0, jugar1, jugar2, envido, realEnvido, faltaEnvido, truco, retruco, valeCuatro, quiero, noQuiero, mazo` |
| Politica de decision | softmax de los logits restringido a las acciones legales |
| Tamano del repositorio | 0,0 GB (pesos de aproximadamente 850 KB) |
| Variante de juego | truco argentino heads-up a 30 puntos, sin flor, con envido y truco |

## Arquitectura y entrenamiento

La red es un MLP de cuatro capas densas (304 → 256 → 256 → 256 → 12) con activaciones no especificadas en la model card. La entrada es una codificacion de 304 caracteristicas definida en `engine/src/truco/encode.rs`, que representa el estado observable del juego: mano propia, cartas jugadas, marcador, historial de apuestas y estado de la mano. La salida son 12 logits que se normalizan con softmax unicamente sobre las acciones legales, lo que garantiza que el bot nunca emita una accion invalida. El campo `jugar{i}` significa jugar la i-esima carta de la mano ordenada de mas fuerte a mas debil, un detalle de diseno que reduce drasticamente la dimensionalidad del espacio de acciones frente a indexar cartas concretas.

El entrenamiento se hizo desde cero con Deep CFR (Brown et al., 2019) en self-play, es decir, el bot jugo contra copias de si mismo sin datos humanos y sin inicializacion a partir de un LLM. Todo el entrenamiento cupo en una unica RTX 5070 Ti. No se documenta en la informacion disponible el numero de iteraciones, el numero de manos jugadas, la composicion exacta del dataset de regret ni si se uso RLHF o DPO (tecnicas que no aplican a este paradigma). La innovacion destacable no es arquitectonica sino de ingenieria: los mismos pesos se exportan a cuatro runtimes distintos (PyTorch, Rust, ONNX Runtime y WebAssembly) con paridad verificada por tests dentro de 1e-4, lo que permite que el bot corra en el navegador sin backend.

## Capacidades

- Juego de truco argentino heads-up completo a 30 puntos, variante sin flor, con envido (envido, real envido, falta envido) y truco (truco, retruco, vale cuatro), incluyendo respuestas de quiero, no quiero y mazo.
- Seleccion de carta dentro de la mano ordenada por fuerza, con gestion de las tres cartas de la mano.
- Decisiones de apuesta con farol aprendido: llama envido con 7 puntos o menos en el 38 % de esas manos, y el 17 % de sus cantos de truco corresponden a manos en el 30 % mas debil.
- Inferencia determinista y reproducible por softmax sobre acciones legales; no hay muestreo estocastico documentado.
- Ejecucion sin GPU y sin servidor: el modelo corre en navegador via WebAssembly y ONNX Runtime Web.
- No soporta tool calling ni function calling: no es un modelo de lenguaje ni un agente basado en texto.
- No tiene capacidades de generacion de texto, codigo, matematicas, vision ni audio.
- No tiene modo thinking ni razonamiento explicito en lenguaje natural; la estrategia esta codificada en los pesos.
- Multilingue: no aplica. La etiqueta de idioma `es` refleja el dominio del juego, no capacidades linguisticas.

## Casos de uso

- Implementacion de un oponente en aplicaciones de truco online: el modelo se integra como un motor de decision con un forward pass de 213.052 parametros, sin coste de GPU, lo que permite rellenar mesas vacias o servir de rival practicado en partidas heads-up a 30 puntos.
- Sparring para jugadores humanos: al ejecutarse en el navegador con WebAssembly, cualquier usuario puede enfrentarse a un rival que explota el farol de forma estadisticamente medible (38 % de envidos con 7 puntos o menos), algo que las heuristicas escritas a mano no hacen en absoluto.
- Investigacion en Deep CFR y juegos de informacion imperfecta: el repositorio sirve como referencia reproducible y de bajo coste (entrenamiento en una sola GPU de consumo) para comparar variantes de CFR tabular, CFR profundo y optimizacion por valor de partida.
- Evaluacion de LLMs como agentes de juego: el modelo se uso como linea base contra Claude Haiku, que leia la mesa como texto y jugaba mediante prompting. Con 100 partidas, el bot gano el 59,0 % de los encuentros, lo que ofrece una referencia cuantitativa para medir la capacidad de un LLM en juegos de cartas con informacion oculta.
- Auditoria y analisis de estrategia: al exponer logits sobre 12 acciones, se puede instrumentar el bot para estudiar en que estados decide arriesgar, ceder o cantar, y usar esos datos para comparar con el comportamiento de jugadores humanos.
- Generacion de datos sinteticos de self-play: el bot puede generar trayectorias de partidas completas (estado, accion, resultado) para entrenar o validar otros agentes de truco, incluidos modelos mas grandes o enfoques de aprendizaje por imitacion.
- Testing de motores de juego: el repositorio incluye comprobaciones de paridad entre PyTorch, Rust, ONNX Runtime y WebAssembly dentro de 1e-4, por lo que el modelo sirve como caso de prueba para validar la implementacion de un motor de reglas de truco en distintos lenguajes.
- Despliegue en entornos sin conectividad o de bajos recursos: con aproximadamente 850 KB de pesos y sin dependencia de GPU, es viable en dispositivos moviles, navegadores o sistemas embebidos.

## Benchmarks y rendimiento

Partidas completas a 30 puntos en formato duplicado (cada reparto se juega dos veces con los asientos intercambiados), segun los resultados publicados en la model card:

| Oponente | Partidas | Victorias del bot | IC 95 % (Wilson) |
|---|---|---|---|
| Movimientos legales aleatorios | 2000 | 90,9 % | [89,6; 92,1] |
| Heuristica escrita a mano | 2000 | 63,4 % | [61,3; 65,5] |
| Claude Haiku (LLM leyendo la mesa como texto) | 100 | 59,0 % | [49,2; 68,1] |

No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K) en la informacion disponible, ya que no aplican a este tipo de modelo. Los detalles completos del protocolo de evaluacion estan en `docs/eval-report.md` del repositorio.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB. Los pesos ocupan aproximadamente 850 KB, de modo que el modelo cabe holgadamente en cualquier GPU, en CPU e incluso en memoria de un navegador.
- GPU recomendadas: cualquier GPU moderna sirve; no hay minimo practico. Para entrenamiento, el autor uso una unica RTX 5070 Ti.
- GPU de consumo: si, cabe en cualquier GPU de consumo, incluidas integradas y aceleradores de gama baja. Tambien funciona sin GPU.
- Opciones de despliegue: ONNX Runtime (archivo `model.onnx`), PyTorch (`model.safetensors`), motor propio en Rust y compilacion a WebAssembly para navegador (`.tcfrw`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada. Dado el tamano del modelo (213.052 parametros, 12 salidas), el forward pass es del orden de microsegundos en CPU moderna, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Juego | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Truco CFR (tomzv1) | MLP entrenado con Deep CFR | 213.052 | Truco argentino heads-up a 30, sin flor | 90,9 % vs aleatorio; 63,4 % vs heuristica; 59,0 % vs Claude Haiku | MIT (pesos y codigo) | Pesos en HuggingFace, codigo en GitHub, demo web |
| TruckAgent (KeshavVarad) | CFR tabular, port a Rust y variante Deep CFR con explotacion | no disponible | Truco a 2 jugadores | no disponible | no disponible | Repositorio en GitHub |
| Claude Haiku | LLM generalista usado como agente via prompting | no disponible | Truco, leyendo la mesa como texto | 41,0 % de victorias contra Truco CFR en 100 partidas | propietaria | API de Anthropic |

La comparacion con TruckAgent es la mas directa en cuanto a dominio (truco a dos jugadores), pero la informacion disponible no incluye sus parametros, licencia ni resultados de evaluacion, por lo que la comparacion cuantitativa no es posible. Claude Haiku no es un modelo de juego especializado: actua como agente de lenguaje y su muestra de evaluacion es pequena.

## Limitaciones y advertencias

- Solo soporta partidas heads-up (uno contra uno). No cubre truco de cuatro jugadores en parejas, que es la modalidad mas extendida.
- No implementa la flor ni sus variantes, y usa reglas de bar, por lo que la estrategia aprendida no es directamente transferible a otros reglamentos.
- La evaluacion se hizo contra una heuristica escrita a mano y un LLM, no contra jugadores humanos fuertes. El nivel real frente a expertos es desconocido.
- La muestra contra Claude Haiku es pequena (100 partidas) y su intervalo de confianza del 95 % es amplio ([49,2; 68,1]), por lo que la ventaja reportada no es concluyente.
- Sesgos conocidos: no hay estudios de sesgo en el sentido habitual, pero la estrategia esta sesgada hacia el farol agresivo (38 % de envidos con 7 puntos o menos), un comportamiento calibrado contra los oponentes de entrenamiento y evaluacion, no contra el meta humano actual.
- Riesgo de alucinacion: no aplica. El modelo no genera texto y su salida esta restringida por softmax a las acciones legales, por lo que no puede emitir jugadas invalidas.
- Restricciones de licencia: el codigo y los pesos son MIT y permiten uso comercial. Sin embargo, el arte de las cartas que usa la aplicacion web es obra de Jose Angel Canabal y no esta bajo MIT, por lo que ese material no puede reutilizarse comercialmente sin permiso.
- La fecha de creacion del repositorio registrada en HuggingFace (2026-10-15) es posterior a la fecha actual, un dato anomalo que conviene verificar antes de citarlo.
- Caveat de produccion: el modelo es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento continuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tomzv1/truco-cfr
- Codigo fuente en GitHub: https://github.com/tomzvilla/truco-cfr
- Demo jugable en el navegador: https://truco-cfr.netlify.app/
- Paper de referencia de Deep CFR (Brown et al., 2019), citado en la model card: no disponible como enlace directo en la informacion proporcionada
- Proyecto comparable TruckAgent: https://github.com/KeshavVarad/TruckAgent
- Paquete DeepCFR Poker en PyPI (proyecto relacionado de otro autor): https://pypi.org/project/deepcfr-poker/
- Coleccion de modelos del autor en HuggingFace: https://huggingface.co/collections/tomz23/model

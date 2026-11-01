# yimingzhang/allie-2.1

## Resumen

Allie 2.1 es un modelo de prediccion de comportamiento humano en ajedrez desarrollado por Yiming Zhang (Carnegie Mellon University). No es un motor de ajedrez convencional: no busca la mejor jugada, sino que estima la distribucion de probabilidad sobre la proxima jugada que hara un jugador humano dadas sus caracteristicas (rating de ambos jugadores, control de tiempo, relojes y desarrollo de la partida). Ademas predice el tiempo de reflexion y el resultado final de la partida.

Tecnicamente es un transformer de mezcla de expertos (MoE) con 9.186.664.608 parametros totales y 1.23B parametros activos por token, construido sobre la arquitectura modded-nanoGPT medium track. Sucesor de Allie 2.0 y del Allie original, se entreno con 112B tokens (1.5 veces mas que su predecesor) sobre partidas de Lichess de mayo de 2017 a agosto de 2026, y obtiene menor entropia cruzada en todos los controles de tiempo y bandas de rating evaluadas.

Su relevancia actual radica en que modela explicitamente la racionalidad limitada humana, lo que lo hace util para investigacion en ciencia cognitiva, calibracion de dificultad en plataformas de ajedrez, generacion de oponentes sinteticos realistas y analisis de sesgos humanos en la toma de decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modded-nanoGPT medium track), 24 bloques, ancho 2048, 32 cabezas de 64 |
| Parametros totales | 9.186.664.608 |
| Parametros activos | 1.23B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (por defecto en CPU), BF16 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje natural; entrada en PGN/UCI/SAN) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 18.4 GB), con `custom_code` y `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 24 bloques de ancho 2048 (32 cabezas de 64 dimensiones). Los tres primeros bloques usan MLPs densos; los 21 restantes enrutan cada token a 16 de 256 expertos pequenos mas un experto compartido. Los cuatro primeros bloques enrutados centran la entrada del router. La atencion es self-attention exclusiva (XSA): la salida de cada cabeza pierde una proporcion aprendida de su proyeccion sobre el value del propio token. La entrada consta de una cabecera de 11 tokens (control de tiempo y ratings de ambos jugadores) seguida de un token por jugada; en cada posicion se anaden tres caracteristicas de reloj (tiempo restante del que mueve, del oponente y tiempo de reflexion previo del que mueve) y la lectura del tablero de una pequena CNN. Una unica cabeza produce la siguiente jugada, su tiempo de reflexion (63 bins) y el resultado de la partida para el que mueve. El coste es de 2.45 GFLOPs por jugada con la partida cacheada (Allie 2.0: 1.39).

El entrenamiento uso todos los meses de Lichess con relojes desde mayo de 2017 hasta agosto de 2026 (excepto julio de 2026, reservado como test), mas partidas over-the-board y de motor. El sampler duplica el peso de una partida por cada 200 puntos de rating del jugador mas fuerte. La ejecucion consumio 112B tokens en 213.623 pasos de 524.288 tokens, sobre 8 GPU NVIDIA L40S durante 14.9 dias. Los learning rates hacen warm-up durante 2.013 pasos hasta 0.35 veces las tasas base de Allie 2.0 y luego decaen linealmente hasta el 0.1% del pico. Los pesos liberados promedian los pesos finales con una media movil exponencial (horizonte de 17.090 pasos, 8% del run, actualizada cada 64 pasos). La model card indica que el codigo y la propia card fueron producidos por agentes de IA (Claude Code y OpenAI Codex) bajo direccion de Yiming Zhang.

## Capacidades

- Prediccion de la siguiente jugada humana como distribucion de probabilidad (UCI) dado el estado de la partida, ratings de ambos jugadores y control de tiempo.
- Prediccion del tiempo de reflexion del jugador (63 bins) y de las probabilidades de victoria, tablas y derrota para el que mueve.
- Muestreo de jugadas calibrado a un rating concreto (`model.play(..., elo=1200)`), imitando el nivel de un jugador humano.
- Procesamiento de partidas en PGN (con comentarios `[%clk]`) o listas de jugadas en UCI o SAN.
- Manejo de relojes opcionales: si no se proporcionan, el modelo trata el reloj como desconocido, igual que en sus partidas de entrenamiento sin reloj.
- Cache de key-value entre llamadas que extienden la misma partida, con coste de un token nuevo por llamada.
- Integracion como bot de Lichess con modo `calibrated` (busqueda y muestreo para acercarse a la fuerza humana del rating).
- Enrutamiento configurable de expertos (`active_experts=8` de 16) para acelerar a costa de algo de precision.
- No soporta tool calling, agentes, vision general ni audio; es un modelo de dominio especifico.

## Casos de uso

- Investigacion en ciencia cognitiva del ajedrez: comparar la distribucion del modelo con la de jugadores reales por banda de rating permite estudiar heuristicas, errores tipicos y sesgos humanos en la toma de decisiones.
- Oponentes sinteticos realistas en plataformas de ajedrez: el modo `calibrated` del paquete `allie` juega como un humano del rating objetivo, con tiempos de reflexion plausibles, lo que mejora la experiencia frente a motores tradicionales.
- Calibracion de dificultad en apps de entrenamiento: dado el rating del usuario y el control de tiempo, el modelo puede generar ejercicios y posiciones con la tasa de error esperada para ese nivel.
- Analisis de partidas y deteccion de anomalias: comparar las jugadas reales con la distribucion predicha permite identificar jugadas atipicas, posible uso de asistencia externa o cambios de estilo.
- Modelado de gestion del tiempo: la prediccion del tiempo de reflexion por jugada sirve para estudiar y simular el uso del reloj en distintos controles de tiempo (`"180+2"`).
- Simulacion de torneos y estudios estadisticos: generar partidas entre poblaciones sinteticas con ratings y controles de tiempo definidos para estimar resultados esperados sin datos reales.
- Educacion y narracion automatica: explicar por que un humano de cierto nivel elegiria una jugada concreta a partir de las probabilidades del modelo.
- Desarrollo de bots de Lichess: el paquete incluye `allie-bot`, que gestiona desafios, tablas, abandono y reconexiones, con reglas de comportamiento (`behaviour.json`) ajustadas para Allie 2.1.

## Benchmarks y rendimiento

La model card no publica tablas numericas de benchmarks estandar (MMLU, HumanEval, etc.), que no aplican a este dominio. El autor reporta como metrica principal la entropia cruzada: Allie 2.1 obtiene menor entropia cruzada que Allie 2.0 en todos los controles de tiempo y bandas de rating evaluados, aunque no se proporcionan los valores concretos en la informacion disponible.

Datos de rendimiento de inferencia publicados:

| Dispositivo | Pesos | ms por jugada | Memoria |
|---|---|---:|---:|
| CPU, 12 hilos (AMD EPYC 7763) | int8 (por defecto en CPU) | 14.3 | 9.8 GB |
| CPU, 12 hilos (AMD EPYC 7763) | BF16 | 25.4 | 18.3 GB |
| CPU, 12 hilos, 16 partidas en un paso | int8 | 80.2 por paso | 9.8 GB |

Coste computacional: 2.45 GFLOPs por jugada con la partida cacheada (Allie 2.0: 1.39).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18.3 GB en BF16 y 9.8 GB en int8 (cifras de memoria reportadas por el autor en CPU; en GPU el consumo de pesos es equivalente, mas el overhead de activaciones y cache KV).
- GPU recomendadas: el entrenamiento se realizo en 8 NVIDIA L40S; para inferencia, cualquier GPU con 24 GB o mas (RTX 3090, RTX 4090, L40S, A100, H100) permite BF16; con 10-12 GB (RTX 3080 12GB, RTX 4070 Ti) cabe en int8.
- Cabe en GPU de consumo: si, en RTX 3090/4090 en BF16 e int8, y en GPUs de 12 GB en int8.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (backend PyTorch de referencia), motor Rust `allie-fast` (Linux x86-64, aproximadamente 3 veces mas rapido que el backend PyTorch en CPU), CUDA graphs replicados en GPU, y el paquete `allie` para CLI y bot de Lichess. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 14.3 ms por jugada en CPU int8 con 12 hilos y 25.4 ms en BF16; 80.2 ms por paso procesando 16 partidas simultaneas en int8. No se publican cifras de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Allie 2.1 | 9.19B totales / 1.23B activos | no disponible | Prediccion de comportamiento humano en ajedrez (MoE) | MIT | HuggingFace, bot de Lichess |
| Allie 2.0 | no disponible en la informacion | no disponible | Prediccion de comportamiento humano en ajedrez | no disponible | HuggingFace (`yimingzhang/allie-2.0`) |
| Allie (original) | no disponible en la informacion | no disponible | Prediccion de comportamiento humano en ajedrez | no disponible | Paper arXiv:2410.03893 y codigo en GitHub |
| Motores de ajedrez clasicos (Stockfish, Leela Chess Zero) | no disponible | no disponible | Busqueda de la mejor jugada, no modelado humano | GPL / varias | Ampliamente disponibles |

La comparacion con motores clasicos es cualitativa: Stockfish y Leela optimizan fuerza de juego, mientras que Allie 2.1 modela la distribucion de jugadas humanas, por lo que no son sustitutos directos. No se dispone de datos numericos comparativos de benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de dominio especifico: no es un modelo de lenguaje general ni soporta vision, audio, tool calling ni tareas fuera del ajedrez.
- Riesgo de alucinacion en sentido amplio: al ser un modelo probabilistico, puede asignar probabilidad a jugadas ilegales o poco plausibles en posiciones atipicas; conviene validar la legalidad de las jugadas muestreadas con `python-chess`.
- Dependencia de la calidad de los metadatos: ratings, control de tiempo y relojes condicionan fuertemente la prediccion; sin relojes, el modelo asume el caso "desconocido" de su entrenamiento.
- Sesgo de datos: entrenado principalmente con partidas de Lichess (2017-2026) mas partidas over-the-board y de motor; el comportamiento puede desviarse para poblaciones, formatos o plataformas poco representadas.
- La model card advierte que el codigo y la propia card fueron generados por agentes de IA, lo que aconseja revision independiente antes de usos criticos.
- Licencia MIT: permite uso comercial, pero se recomienda citar el paper original y verificar las dependencias (`python-chess`, motor Rust `allie-fast`).
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor; auditar antes de desplegar en produccion.
- No se documentan limitaciones de longitud de contexto; el modelo procesa la partida completa token a token, con cache KV incremental.
- No hay datos publicados de benchmarks estandar ni de latencia en GPU, lo que dificulta estimar costes de despliegue a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yimingzhang/allie-2.1
- Modelo predecesor Allie 2.0: https://huggingface.co/yimingzhang/allie-2.0
- Paper original de Allie: https://arxiv.org/abs/2410.03893
- Segundo paper referenciado en los tags: https://arxiv.org/abs/2605.19091
- Codigo original (CMU): https://github.com/ippolito-cmu/allie
- Paquete `allie` (CLI y bot de Lichess): https://github.com/y0mingzhang/allie
- Motor Rust `allie-fast`: https://github.com/y0mingzhang/allie#subdirectory=rust/allie-fast
- Version anterior de reglas de Lichess de Allie 2.0: https://github.com/y0mingzhang/allie/tree/cad41559/src/allie/lichess
- Bot en Lichess: https://lichess.org/@/AllieTheChessBot
- Rustup (requisito del motor Rust): https://rustup.rs

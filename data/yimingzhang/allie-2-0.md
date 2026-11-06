# yimingzhang/allie-2.0

## Resumen

Allie 2.0 es un modelo de predicción de comportamiento humano en ajedrez desarrollado por Yiming Zhang. A diferencia de los motores de ajedrez tradicionales, que buscan la mejor jugada, Allie 2.0 predice qué movimiento hará un jugador humano concreto a partir de su historial de partida, su nivel de Elo, el control de tiempo y el reloj. El modelo también estima el tiempo de reflexión del jugador y el resultado final de la partida.

Técnicamente es un transformer con mezcla de expertos (MoE) de 5.600 millones de parámetros totales y aproximadamente 690 millones activos, con 24 bloques de anchura 1536. Se entrenó sobre 7.900 millones de partidas de Lichess (mayo de 2017 a agosto de 2026) y un total de 75.000 millones de tokens en la ejecución principal, más un segundo pase de ajuste (annealing) de 1.000 millones de tokens. Su relevancia radica en que modela el error y el estilo humanos, lo que lo hace útil para investigación en ciencias del comportamiento, para el entrenamiento de jugadores y para bots que imitan a humanos en plataformas como Lichess.

La versión actual recomendada por el autor es Allie 2.1; esta ficha describe Allie 2.0, la versión anterior, que sigue disponible en Hugging Face con licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 24 bloques de anchura 1536 (modded-nanoGPT medium track) |
| Parámetros totales | 5.603.225.760 (5,6 B) |
| Parámetros activos | ~0,69 B |
| Longitud de contexto | No disponible (una entrada por jugada más cabecera de 11 tokens; no se especifica límite máximo de jugadas) |
| Tipos de cuantización | int8 (por defecto en CPU) y BF16; no se documentan GGUF ni otras |
| Idiomas soportados | No disponible (el modelo opera sobre notación de ajedrez, no sobre lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, con `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 24 bloques de anchura 1536. El primer bloque usa una MLP densa; los otros 23 enrutan cada token a 16 de 256 expertos pequeños, además de un experto compartido. La entrada consiste en una cabecera de 11 tokens con el control de tiempo y los Elos de ambos jugadores, seguida de un token por jugada. En cada posición se añaden tres características de reloj (tiempo restante del jugador que mueve, del oponente y tiempo de reflexión previo del que mueve) y la lectura del tablero mediante una pequeña CNN. La salida es una única cabeza que predice la siguiente jugada, el tiempo de reflexión en 63 bins y el resultado de la partida para el jugador que mueve. El coste computacional es de 1,39 GFLOPs por jugada con la partida en caché.

El entrenamiento usó todos los meses de Lichess con relojes entre mayo de 2017 y agosto de 2026, excluyendo julio de 2026 como mes de test: 7.900 millones de partidas, más partidas presenciales y de motor. El muestreador duplica el peso de una partida por cada 200 puntos de Elo del jugador más fuerte. La ejecución principal consumió 75.000 millones de tokens (143.051 pasos de 524.288 tokens) en 8 GPU NVIDIA L40S durante 6,6 días. Después se aplicó un segundo pase de annealing desde el checkpoint final con un optimizador nuevo: 1.000 millones de tokens (1.907 pasos) de partidas de Lichess de enero de 2024 a agosto de 2026, con un pico de learning rate de 0,05 y decaimiento en el último 30% de los pasos, durante 2,1 horas en las mismas GPU. El cómputo total de entrenamiento fue de 3,2e20 FLOPs. El checkpoint previo al annealing se conserva en el repositorio bajo la revisión `pre-anneal`.

## Capacidades

- Predicción de la siguiente jugada humana: devuelve una distribución de probabilidad sobre jugadas legales (en UCI) para un jugador con un Elo y control de tiempo dados.
- Muestreo de jugadas con estilo humano: `model.play(...)` genera una jugada muestreada como la haría un jugador de un Elo concreto.
- Predicción del tiempo de reflexión: estima los segundos que el jugador pensará, en 63 bins.
- Predicción del resultado de la partida: probabilidades de victoria, tablas y derrota para el jugador que mueve.
- Procesamiento de partidas en formato PGN (con comentarios `[%clk]`) o como listas de jugadas UCI o SAN.
- Uso de información de reloj: acepta los segundos restantes tras cada jugada; si no se aportan, trata el reloj como desconocido.
- Integración como bot de Lichess: el paquete `allie` permite jugar como cuenta BOT, gestionando retos, tablas, abandono y reconexiones.
- Caché de clave-valor entre llamadas sucesivas sobre la misma partida: seguir una partida jugada a jugada cuesta un token nuevo por llamada.
- No dispone de generación de texto, razonamiento general, código, matemáticas ni capacidades multilingües; su dominio es exclusivamente el ajedrez.

## Casos de uso

- Investigación en ciencias del comportamiento: analizar cómo varían las decisiones y los tiempos de reflexión según Elo, control de tiempo y fase de la partida, usando las distribuciones de probabilidad y los 63 bins de tiempo de pensamiento.
- Entrenamiento de jugadores: generar las jugadas más probables de un rival de un Elo concreto para preparar aperturas y estudiar los errores típicos de cada nivel.
- Bots de ajedrez con comportamiento humano en Lichess: el paquete `allie-bot` juega como cuenta BOT muestreando jugadas al nivel del oponente y esperando tiempos de reflexión realistas, lo que evita el comportamiento de motor.
- Análisis post-partida: estimar la probabilidad de victoria, tablas o derrota en cada posición y comparar la jugada humana real con la distribución predicha para detectar errores.
- Detección de trampas y anomalías: comparar las jugadas de un jugador con la distribución esperada para su Elo y comparar los tiempos de reflexión observados con los predichos; desviaciones sistemáticas pueden indicar asistencia externa.
- Simulación de partidas entre perfiles de jugador: encadenar `model.play` con distintos Elos y controles de tiempo para generar datos sintéticos de partidas con estilos humanos, útil para aumentar datasets de investigación.
- Evaluación de modelos de ajedrez: usar la entropía cruzada frente a jugadas humanas como métrica de «humanidad» de un motor, comparando motores con este modelo como referencia.

## Benchmarks y rendimiento

Evaluación sobre 80.000 posiciones de partidas de Lichess de julio de 2026 (20.000 por banda de Elo del jugador que mueve: <1400, 1400-2000, 2000-2400 y ≥2400), con probabilidades renormalizadas sobre las jugadas legales. La entropía cruzada (CE) es la log-probabilidad negativa, en nats, de la jugada humana; menor es mejor.

| Modelo | Parámetros | GFLOPs por jugada | CE | Top-1 (%) |
|---|---|---:|---:|---:|
| Maia-3 5M | 5,2 M | 0,60 | 1,295 | no disponible en la información proporcionada |

No se han publicado en la información disponible los resultados completos de la tabla de benchmarks (resto de modelos comparados, CE y Top-1 de Allie 2.0 y de Maia-3 en otras escalas). No se inventan cifras adicionales.

## Requisitos de hardware

- VRAM estimada: 11 GB en BF16; 6,4 GB con pesos int8 (opción por defecto en CPU).
- GPU: el autor reporta mediciones en NVIDIA RTX A6000 (7,3 ms por jugada en BF16 con una partida; 1,5 ms por jugada procesando 16 partidas en un paso). El entrenamiento se hizo en 8 NVIDIA L40S. No se documentan requisitos para A100 o H100.
- CPU: AMD EPYC 9755 con 8 hilos, 6,3 ms por jugada en int8; con 32 hilos, 4,6 ms; con solo AVX2 y 8 hilos, 6,7 ms; con 16 hilos en BF16, 7,8 ms.
- Cabe en GPU de consumo: con 11 GB en BF16 o 6,4 GB en int8, es viable en tarjetas con al menos 12 GB de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090); el autor no confirma pruebas en estas tarjetas.
- Opciones de despliegue: transformers con `trust_remote_code=True`; backend PyTorch de referencia (`backend="torch"`); en CPU, kernels C++ compilados en el primer uso (requiere compilador de C++, si no se usa PyTorch puro); en GPU, CUDA graphs reproducidos. El paquete `allie` incluye CLI (`allie-predict`) y bot de Lichess (`allie-bot`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 6,3 ms por jugada en CPU int8 con 8 hilos; 7,3 ms por jugada en GPU con una partida y 1,5 ms por jugada con 16 partidas en un paso. El parámetro `active_experts=8` enruta cada token por 8 de los 16 expertos, lo que acelera la inferencia con una ligera pérdida de precisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | CE (blitz, julio 2026) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Allie 2.0 | 5,6 B totales, ~0,69 B activos | Partida completa con relojes y Elos | no disponible en la información proporcionada | MIT | Hugging Face, GitHub |
| Maia-3 5M | 5,2 M | Posición de tablero | 1,295 | no disponible | no disponible |
| Allie (original) | no disponible | Partida completa | no disponible | no disponible | GitHub (ippolito-cmu/allie), paper arXiv:2410.03893 |
| Allie 2.1 | no disponible | Partida completa | no disponible | no disponible | Hugging Face (yimingzhang/allie-2.1) |

La información proporcionada solo incluye la métrica de Maia-3 5M; no hay datos suficientes para comparar el rendimiento del resto de modelos de forma cuantitativa.

## Limitaciones y advertencias

- Dominio restringido: el modelo solo predice jugadas, tiempos y resultados de ajedrez; no es un modelo de lenguaje y no debe usarse para tareas generales.
- Sesgo de datos: entrenado con partidas de Lichess, con ponderación hacia jugadores de mayor Elo (duplicación de peso por cada 200 puntos del jugador más fuerte); el comportamiento en niveles muy bajos o en modalidades poco representadas puede ser menos fiable.
- Dependencia del reloj: si no se aportan los tiempos restantes, el modelo trata el reloj como desconocido, lo que degrada la predicción del tiempo de reflexión y posiblemente de la jugada.
- Riesgo de calibración: las probabilidades se renormalizan sobre jugadas legales en la evaluación; fuera de ese régimen la calibración no está garantizada.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías; la model card advierte que el código, la investigación y la propia card fueron producidos por agentes de IA (Claude Code y OpenAI Codex) bajo dirección humana, lo que conviene tener en cuenta en auditorías.
- Versión obsoleta: el autor recomienda Allie 2.1 como versión actual; para reproducir Allie 2.0 con el bot hay que usar el commit `cad41559` del repositorio.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene revisarlo en entornos de producción.
- En CPU, el primer uso compila kernels C++ específicos de la máquina; sin compilador disponible se recurre a PyTorch puro, con menor rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yimingzhang/allie-2.0
- Versión actual Allie 2.1: https://huggingface.co/yimingzhang/allie-2.1
- Repositorio del paquete y bot: https://github.com/y0mingzhang/allie
- Commit de Allie 2.0 en el repositorio: https://github.com/y0mingzhang/allie/tree/cad41559
- Paper original de Allie: https://arxiv.org/abs/2410.03893
- Código original de Allie: https://github.com/ippolito-cmu/allie
- Paper referenciado en los tags (arXiv:2605.19091): https://arxiv.org/abs/2605.19091

# strategic-mas/rqe-sft-qwen3-4b-lora

## Resumen

El modelo `strategic-mas/rqe-sft-qwen3-4b-lora` es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen3-4B, desarrollado por el equipo `strategic-mas`. Su proposito es muy especifico: calcular el equilibrio de respuesta cuantal con aversion al riesgo (risk-averse quantal response equilibrium, RQE) en juegos de N jugadores descritos en texto, desde la perspectiva de su propia posicion. El modelo no es un asistente general, sino un artefacto de investigacion orientado a teoria de juegos y sistemas multiagente.

El adaptador se entrena para generar la traza de iteracion del solver de RQE (una linea cada 25 pasos del solver, con la estrategia propia, la de cada rival y la conjetura pesimista sobre cada rival) y finaliza con una linea `Final: A p, B q, ...` que contiene la estrategia resultante. Los juegos cubiertos incluyen tablas de pagos en palabras con 2-6 jugadores, 2-5 opciones y juegos de suma por pares, en nueve clases de juego (adopcion de 3/4/5 opciones, consenso de 3/4/5, hawk-dove, matching pennies y stag hunt).

La relevancia del modelo reside en que demuestra que un modelo de 4 mil millones de parametros con un adaptador LoRA puede aproximar la salida de un algoritmo numerico de equilibrio de teoria de juegos con alta fidelidad en la distribucion entrenada, aunque con limitaciones claras en tipos de juego no vistos. Es un artefacto de investigacion sin garantia, publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con adaptador LoRA (PEFT) |
| Parametros totales | 4B (modelo base) + adaptador LoRA (r=32, alpha=64) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 12.288 tokens (longitud maxima de entrenamiento, sin truncamiento) |
| Tipos de cuantizacion | no disponible (el autor indica que fusionar el adaptador en bf16 es valido) |
| Idiomas soportados | no disponible (el entrenamiento se centra en tablas de pagos en texto, presumiblemente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, repo de 2,1 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3-4B, un transformer decoder-only de 4 mil millones de parametros. Sobre el se aplica un adaptador LoRA con rango r=32, alpha=64 y dropout de 0,05 en todas las capas lineales. El entrenamiento usa AdamW con learning rate 1e-4, 400 pasos de warm-up seguidos de decaimiento coseno hasta 0, batch de 16 (8 GPU x 2 filas) y 8.000 pasos, equivalentes a una pasada completa sobre los datos. La longitud maxima de secuencia es de 12.288 tokens y ninguna fila fue truncada. El entrenamiento se ejecuto en 8 x NVIDIA L40S durante 17,3 horas (7,8 s/paso).

El dataset consta de 128.000 problemas de 9 clases de juego (adopcion 3/4/5 opciones, consenso 3/4/5, hawk-dove, matching pennies, stag hunt), con aversion al riesgo tau y ruido de decision eps por problema que satisfacen la condicion de N jugadores tau * eps >= N - 1 (Mazumdar et al. 2024). Las etiquetas provienen del algoritmo de gradiente RQE de los autores (forma por oponente), con un gap exacto de cada jugador inferior a 0,05. La innovacion tecnica principal es el formato de traza de solver: el modelo aprende a reproducir el proceso iterativo del solver de RQE, no solo la respuesta final.

## Capacidades

- Calculo del equilibrio de respuesta cuantal con aversion al riesgo (RQE) en juegos de N jugadores descritos en texto.
- Generacion de la traza de iteracion del solver de RQE (una linea cada 25 pasos), incluyendo estrategia propia, estrategias rivales y conjeturas pesimistas.
- Emision de la estrategia final en formato `Final: A p, B q, ...`.
- Manejo de juegos con 2-6 jugadores y 2-5 opciones en la distribucion entrenada.
- Generalizacion parcial a tamanos no vistos (7-10 jugadores) y a tipos de juego no vistos.
- No dispone de tool calling, function calling, capacidades de agente general, vision ni audio.
- Capacidades multilingues no documentadas.

## Casos de uso

- Investigacion en teoria de juegos: simular el comportamiento de un solver de RQE sobre tablas de pagos en texto para comparar con soluciones analiticas o numericas en estudios de equilibrio.
- Generacion de datos sinteticos de RQE: usar el modelo para producir trazas de solver etiquetadas que sirvan como datos de entrenamiento o validacion de otros modelos.
- Analisis de aversion al riesgo en mercados simulados: introducir juegos de adopcion o consenso y obtener estrategias con aversion al riesgo parametrizada (tau) y ruido de decision (eps).
- Evaluacion de modelos multiagente: emplear el adaptador como jugador sintetico en entornos de N jugadores donde se requiera una politica de equilibrio aproximada.
- Docencia y divulgacion: ilustrar como se comporta un equilibrio de respuesta cuantal en juegos clasicos (matching pennies, stag hunt, hawk-dove) con ejemplos textuales.
- Estudio de generalizacion: medir la degradacion del modelo en tipos de juego no vistos (55-68% de acierto) para investigar transferencia en modelos pequenos.

## Benchmarks y rendimiento

Evaluacion sobre 2.414 items de examen; un item se considera superado cuando el gap exacto de RQE de cada asiento es inferior a 0,05 frente a las respuestas de los demas asientos. Puntuacion con la regla de suma corregida (probabilidades que suman 1 con margen de 0,002 y 1e-9 de tolerancia float).

| Paso SFT | Todos los items | Juegos entrenados 2-6 jugadores | Juegos entrenados 4-5 opciones | 7-10 jugadores (tamano no visto) | Tipos de juego no vistos |
|---|---|---|---|---|---|
| 1.000 | 85,3% | 93,4% | 87,1% | 99,5% | 55,4% |
| 2.000 | 88,6% | 98,4% | 97,7% | 95,0% | 59,4% |
| 3.000 | 90,0% | 99,2% | 95,3% | 99,2% | 67,0% |
| 5.000 | 91,3% | 99,6% | 99,3% | 96,0% | 68,2% |
| 8.000 | 89,9% | 99,6% | 99,3% | 91,2% | 67,4% |

Baselines sobre los mismos items: Qwen3-30B-A3B sin entrenar 5,2%; respuesta uniforme 40,2%.

Capacidad general del paso 3.000: GPQA 27,3%, GSM8K 88,6%, LiveCodeBench 31,1%, MATH-500 70,0%, MMLU 68,4%.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B en bf16 requiere aproximadamente 8 GB; el adaptador LoRA anade una fraccion minima. En cuantizacion de 4 bits, el modelo base puede ocupar alrededor de 2,5-3 GB, aunque el autor no documenta cuantizaciones especificas.
- GPU recomendadas: el entrenamiento se realizo en 8 x NVIDIA L40S (48 GB). Para inferencia es suficiente una GPU consumer con al menos 8-10 GB de VRAM en bf16.
- Cabe en GPU consumer: si, en tarjetas como RTX 3090, RTX 4090 (24 GB) o RTX 4070 Ti (12 GB) en bf16, y en GPUs de 8 GB con cuantizacion de 4 bits.
- Opciones de despliegue: el autor documenta la carga mediante `PeftModel.from_pretrained` con `AutoModelForCausalLM` de Hugging Face Transformers, fusionando el adaptador en pesos bf16. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en RQE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rqe-sft-qwen3-4b-lora (paso 3.000) | 4B + LoRA | 12.288 | 90,0% en examen RQE | apache-2.0 | Hugging Face |
| Qwen3-30B-A3B sin entrenar | 30B (MoE) | no disponible | 5,2% en examen RQE | no disponible | Hugging Face |
| Respuesta uniforme (baseline) | n/a | n/a | 40,2% en examen RQE | n/a | n/a |

No se dispone de otros modelos especializados en RQE para comparar directamente. La comparativa se limita a los baselines reportados por el autor.

## Limitaciones y advertencias

- Los tipos de juego no vistos alcanzan solo un 55-68% de acierto, lo que indica una generalizacion limitada fuera de la distribucion de entrenamiento.
- En la distribucion actual de juegos y parametros, una regla no estrategica (respuesta con aversion al riesgo frente a oponentes uniformemente aleatorios) tambien supera el 99,9% del examen, por lo que el examen no separa aun la aversion al riesgo estrategica de la de un solo agente.
- El modelo es un artefacto de investigacion sin garantia; no esta pensado para produccion.
- No se documentan sesgos conocidos ni tasas de alucinacion especificas.
- El modelo no es un asistente general: no soporta tool calling, agentes ni tareas fuera del calculo de RQE.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/strategic-mas/rqe-sft-qwen3-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Referencia citada: Mazumdar et al. 2024 (condicion de N jugadores para RQE), sin enlace disponible en la informacion proporcionada.
- Codigo: pendiente de publicacion junto con el repositorio del entorno, segun el autor.

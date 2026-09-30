# sthanika-ai/Sieve-4B

## Resumen

Sieve-4B es un modelo de decisión de 4B desarrollado por Sthānika AI, un laboratorio independiente de investigación y benchmarking. No es un modelo generativo: recibe un estado (texto o JSON) junto con preguntas tipadas y devuelve una probabilidad calibrada para cada opción de cada pregunta. Lee el estado una sola vez, puntúa las opciones directamente y nunca produce texto, por lo que su pipeline declarado en HuggingFace es `text-classification`.

Técnicamente es un adaptador LoRA de rango 32 acompañado de una cabeza de respuesta de 255 vías, montado sobre `Qwen/Qwen3.5-4B`. Forma parte de la familia Sieve junto a Sieve-9B y Sieve-2B, aunque su construcción interna difiere de la de sus hermanos y por eso incluye su propio código de inferencia (`sieve4b/`). El repositorio pesa 0,3 GB, se distribuye bajo licencia Apache 2.0 y solo declara inglés como idioma.

Su relevancia actual es doble. Por un lado, ocupa la primera posición entre las 18 entradas con backbone de clase 4B del board de Decision Index del 28 de septiembre de 2026, con una puntuación de 43,82 (índice bruto 57,65), por delante de JPT-4B (43,04) y Jet v6.2 (42,60), y el puesto 15 de 72 en la clasificación global. Por otro, es un ejemplo de modelo especializado y pequeño orientado a sustituir generación de texto por clasificación calibrada, con latencias de milisegundos en lugar de segundos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) mas cabeza de respuesta de 255 vias sobre Qwen/Qwen3.5-4B; el backbone se describe en la model card como "post-trained Qwen3.5-4B, a hybrid of Gated Del..." (texto truncado en la informacion disponible) |
| Parametros totales | no disponible; adaptador LoRA sobre un backbone de 4B (el repositorio pesa 0,3 GB) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la evaluacion de latencia se ejecuto en bf16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Sieve-4B se construye como un adaptador LoRA de rango 32 sobre el backbone post-entrenado `Qwen/Qwen3.5-4B`, al que se añade una cabeza de respuesta de 255 vías. La model card describe ese backbone como un híbrido, pero el texto disponible se corta en "a hybrid of Gated Del...", por lo que no se puede confirmar la arquitectura exacta del backbone a partir de la información proporcionada. A diferencia de Sieve-9B y Sieve-2B, Sieve-4B está construido de forma distinta, hasta el punto de que el autor publica código de inferencia propio en el directorio `sieve4b/` del repositorio.

El modelo no genera texto en ningún caso: consume el estado una vez y emite directamente probabilidades por opción. Según el autor, el índice de decisión está corregido por azar (0 equivale a adivinar al azar y 100 a acierto perfecto), lo que implica una fase de calibración explícita. Se declaran métricas de calibración (Brier, ECE y MAE de puntuaciones) además de exactitud. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación.

Sí se documenta una cifra de higiene de datos: 76 filas de test (el 0,05 %) tenían su ítem en los datos de entrenamiento. Recontando todas ellas como falladas, el índice baja de 43,82 a 43,69, y el modelo seguiría siendo primero entre las entradas de clase 4B.

## Capacidades

- Decisiones tipadas calibradas: dado un estado (texto o JSON) y preguntas tipadas, devuelve una probabilidad calibrada para cada opción, con tres formatos de respuesta: elección (`choice`), sí/no (`noul`) y puntuación (`score`).
- Clasificación de texto: es la tarea declarada del pipeline, con resultados en 44 benchmarks de clasificación, recuperación y comprensión del lenguaje.
- Recuperación y ranking: nDCG@10 de 0,445 en BRIGHT, 0,655 en ToolRet y 0,797 de calidad seleccionada en RouterBench (objetivo de calidad, fuera del índice).
- Herramientas y automatización: 0,934 de exactitud por caso en BFCL, 0,825 en API-Bank y 0,607 en When2Call MCQ; el área de Tools & Automation del índice es la más alta del modelo (62,02).
- Verificación y detección: 0,650 en verificación de afirmaciones HoVer, 0,668 de F1 en la clase alucinada de RAGTruth y 0,595 en decisiones de phishing de PhishNChips.
- Selección múltiple y razonamiento de opciones fijas: 0,654 en tareas de opción fija de BBH, 0,544 en MMLU-Pro y 0,444 en GPQA Diamond.
- Predicción probabilística: Brier de 0,206 en ForecastBench (10.139 peticiones), la métrica de calibración propia de esa tarea.
- Multilingüismo: no disponible; solo se declara inglés.
- Generación de texto, tool calling generativo, agentes, visión o audio: no disponibles; el modelo nunca genera texto por diseño.
- Modo de pensamiento o razonamiento explícito: no disponible.

## Casos de uso

- Enrutado de peticiones entre modelos: dado un prompt y un conjunto de candidatos, Sieve-4B devuelve la probabilidad de que cada uno sea la mejor opción. Su resultado de 0,797 en RouterBench (10.000 peticiones) y su latencia mediana de 155 ms lo hacen apto para colocarlo delante de un enrutador de producción.
- Moderación y decisión de cumplimiento normativo: clasificar contenido o transacciones en categorías mutuamente excluyentes con una probabilidad calibrada, de modo que se pueda fijar un umbral de confianza y derivar los casos dudosos a revisión humana.
- Clasificación de intenciones en atención al cliente: 0,814 de macro-F1 en CLINC150+OOS y 0,766 en BANKING77, útil para etiquetar tickets entrantes y enrutarlos al equipo correcto sin generar respuesta alguna.
- Verificación de respuestas en pipelines RAG: con 0,668 de F1 en la clase alucinada de RAGTruth y 0,650 en HoVer, puede actuar como filtro posterior que descarte respuestas no sustentadas por el contexto recuperado.
- Selección de herramientas en agentes: con 0,934 de exactitud por caso en BFCL y 0,655 de nDCG@10 en ToolRet, puede elegir qué herramienta invocar antes de que un modelo mayor genere la llamada.
- Triage de documentos legales y financieros: 0,717 de macro-F1 en ContractNLI, 0,783 en NLI4CT y 0,839 en FinEntity, aplicable a la clasificación de cláusulas y entidades en revisión documental.
- Predicción y estimación de probabilidades: Brier de 0,206 en ForecastBench, aprovechable en tareas donde se necesita una probabilidad explícita y no una respuesta textual.
- Filtrado de correo malicioso: 0,595 de exactitud en decisiones de phishing de PhishNChips, como capa de señal adicional en un sistema antiphishing.

## Benchmarks y rendimiento

Resultados declarados por el autor. El índice y las puntuaciones por área están corregidos por azar: 0 es adivinar al azar y 100 es acierto perfecto. Per-benchmark se usa la métrica propia de cada benchmark.

Índice de decisión 0.2.1 (150.317 peticiones sobre 44 benchmarks, todas respondidas, 0 errores; el índice promedia 38 de los benchmarks):

| | Decision Index | Knowledge & Reasoning | Language Understanding | Retrieval & Classification | Tools & Automation | Arts & Human Taste |
|---|---:|---:|---:|---:|---:|---:|
| Tal como se ejecuto | 43,82 | 29,56 | 49,28 | 46,19 | 62,02 | 28,56 |
| Filas solapadas contadas como fallo | 43,69 | 29,54 | 49,28 | 46,08 | 61,48 | 28,56 |

Posición: primero de las 18 entradas con backbone de clase 4B y decimoquinto de 72 en el board del 28 de septiembre de 2026. La puntuación es autodeclarada y no está verificada ni publicada en el leaderboard.

Test de typed-decisions (LocalLLaMA/typed-decisions, 400 casos y 2.000 decisiones, zero-shot):

| Metrica | Valor |
|---|---:|
| Exactitud global | 0,677 |
| Exactitud en si/no | 0,773 |
| Exactitud en eleccion | 0,650 |
| Exactitud en puntuacion | 0,625 |
| Brier (frente al gold suave) | 0,178 |
| ECE | 0,075 |
| MAE de puntuacion | 0,362 |

Los 44 benchmarks del indice:

| Benchmark | Metrica | Puntuacion | Peticiones |
|---|---|---:|---:|
| ACOS | F1 por resena | 0,175 | 1.565 |
| Amazon ESCI | macro-F1 | 0,380 | 5.000 |
| ANLI | macro-F1 | 0,607 | 3.200 |
| API-Bank | exactitud | 0,825 | 508 |
| BANKING77 | macro-F1 | 0,766 | 3.080 |
| BBH fixed-option tasks | exactitud | 0,654 | 5.507 |
| BFCL | exactitud por caso | 0,934 | 1.694 |
| BPoMP | exactitud | 0,800 | 5.000 |
| BRIGHT | nDCG@10 | 0,445 | 220 |
| cfcolor | exactitud | 0,628 | 5.000 |
| ChessBench | exactitud | 0,124 | 5.000 |
| CLadder | exactitud | 0,654 | 5.000 |
| CLINC150+OOS | macro-F1 | 0,814 | 5.500 |
| ContractNLI | macro-F1 | 0,717 | 123 |
| CRUXEval | exactitud | 0,530 | 570 |
| FinEntity | macro-F1 | 0,839 | 979 |
| ForecastBench | Brier (menor es mejor) | 0,206 | 10.139 |
| GPQA Diamond | exactitud | 0,444 | 196 |
| GSM8K | exactitud | 0,669 | 2.638 |
| Habermas Machine | exactitud | 0,465 | 1.676 |
| HellaSwag | exactitud | 0,918 | 10.042 |
| HLE | exactitud | 0,118 | 501 |
| Home appliance simulator | exactitud por caso | 0,193 | 88 |
| HoVer claim verification | exactitud | 0,650 | 4.000 |
| Humicroedit | exactitud | 0,585 | 2.628 |
| iSarcasmEval | F1 de sarcasmo, track A, ingles | 0,553 | 4.600 |
| MMLU-Pro | exactitud | 0,544 | 12.032 |
| MuSR | exactitud | 0,561 | 752 |
| New Yorker caption matching | exactitud | 0,648 | 528 |
| NLI4CT | macro-F1 | 0,783 | 5.500 |
| PhishNChips phishing decisions | exactitud | 0,595 | 2.000 |
| POP909-CL | exactitud | 0,066 | 2.000 |
| RAGTruth response-level hallucination | F1 en la clase alucinada | 0,668 | 2.700 |
| SATA-Bench | exactitud por caso | 0,202 | 1.650 |
| ToolRet | nDCG@10 | 0,655 | 685 |
| VAST | macro-F1 | 0,464 | 3.006 |
| When2Call MCQ | exactitud | 0,607 | 3.652 |
| WinoGrande | exactitud | 0,770 | 1.267 |
| ARC-Challenge (fuera del indice) | exactitud | 0,942 | 1.172 |
| ARC-Easy (fuera del indice) | exactitud | 0,980 | 2.376 |
| MMLU (fuera del indice) | exactitud | 0,758 | 14.033 |
| RouterBench (fuera del indice) | calidad seleccionada (objetivo de calidad) | 0,797 | 10.000 |
| SGD/SGD-X (fuera del indice) | macro-F1 | 0,442 | 2.500 |
| SimpleBench (fuera del indice) | exactitud | 0,200 | 10 |

## Requisitos de hardware

- VRAM para inferencia: no disponible como cifra publicada. La evaluación se ejecutó en una única A100 de 80 GB en bf16, con tres procesos de servidor compartiendo la GPU.
- GPU recomendadas: no hay una lista publicada. El único entorno documentado es A100 80GB. Cualquier GPU capaz de alojar un backbone de 4B en bf16 junto con el adaptador LoRA y la cabeza debería ser suficiente, pero no se especifica.
- GPU de consumo: no disponible. No se publican pesos GGUF ni cuantizaciones, por lo que no se puede confirmar el comportamiento en GPUs de gama de consumo.
- Opciones de despliegue: el modelo incluye su propio código de inferencia en `sieve4b/` dentro del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia: mediana de 155 ms y percentil 95 de 734 ms por petición, incluyendo la construcción del prompt y el HTTP, medidas en la ejecución del Decision Index sobre A100 80GB en bf16 con tres procesos de servidor compartiendo GPU.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sieve-4B | 4B (LoRA rango 32 + cabeza de 255 vias) | no disponible | 43,82 (autodeclarado) | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| JPT-4B | clase 4B | no disponible | 43,04 | no disponible | entrada del board del 28-09-2026 |
| Jet v6.2 | no disponible | no disponible | 42,60 | no disponible | entrada del board del 28-09-2026 |
| Sieve-9B | 9B | no disponible | no disponible | no disponible | familia Sieve, construccion distinta |
| Sieve-2B | 2B | no disponible | no disponible | no disponible | familia Sieve, construccion distinta |
| Qwen/Qwen3.5-4B | 4B | no disponible | no aplica (modelo generativo base, no un decisor) | no disponible | HuggingFace, es el backbone de Sieve-4B |

## Limitaciones y advertencias

- No es un modelo generativo. No produce texto en ningún caso, por lo que no sirve para chat, redacción, resumen ni generación de código. Cualquier uso que espere salida textual requiere un modelo distinto.
- Idiomas: solo se declara inglés. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Puntuación autodeclarada: el Decision Index de 43,82 procede de una ejecución propia del autor, no ha sido verificado por los mantenedores y no está en el leaderboard. Debe tratarse como resultado no confirmado de forma independiente.
- Solapamiento con el test: 76 filas (0,05 %) del conjunto de evaluación estaban presentes en los datos de entrenamiento. Contadas todas como fallo, el índice cae a 43,69.
- Cobertura del índice: el índice promedia 38 de los 44 benchmarks, no los 44.
- Rendimiento bajo en varias tareas: 0,066 en POP909-CL, 0,118 en HLE, 0,124 en ChessBench, 0,175 en ACOS, 0,193 en el simulador de electrodomésticos, 0,200 en SimpleBench y 0,202 en SATA-Bench. No es un modelo de razonamiento general.
- Calibración: ECE de 0,075 y Brier de 0,178 frente al gold suave en typed-decisions; MAE de puntuación de 0,362. Las probabilidades son utilizables pero no perfectamente calibradas, algo crítico si se fijan umbrales automáticos.
- Riesgo de probabilidades mal calibradas fuera de distribución: al no generar texto, no hay riesgo de alucinación en el sentido generativo, pero sí de emitir una probabilidad alta e incorrecta ante estados o tipos de pregunta alejados de los datos de entrenamiento.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, con fecha de creación y actualización del 30 de septiembre de 2026. No hay validación de terceros.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con la obligación habitual de conservar avisos de licencia y atribución.
- Aviso de afiliación: el autor declara explícitamente que no está afiliado a TypeSafe AI ni a Jev, y que Jev y la forma de su API se citan únicamente como punto de referencia público.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sthanika-ai/Sieve-4B
- Colección de la familia Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Repositorio en GitHub: https://github.com/sthanika-ai/sieve/tree/main/
- Organizacion en GitHub: https://github.com/sthanika-ai
- Sitio web de Sthanika AI: https://sthanika.ai/
- Dataset de resultados del Decision Index: https://huggingface.co/datasets/sthanika-ai/Sieve-4B-decision-index-results
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Space del Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit oficial del Decision Index: https://github.com/apolinario/decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo hermano Sieve-2B: https://huggingface.co/sthanika-ai/sieve-2b
- Perfil de datasets de la organizacion: https://huggingface.co/sthanika-ai/datasets

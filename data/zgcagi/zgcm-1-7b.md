# zgcagi/ZGCM-1-7B

## Resumen

ZGCM-1-7B es un modelo de lenguaje denso de 7.390 millones de parámetros (7,39B) entrenado desde cero por el Zhongguancun Academy y el Zhongguancun Institute of Artificial Intelligence. Está diseñado específicamente para razonamiento matemático y búsqueda asistida por herramientas, combinando pensamiento interno deliberado con recogida activa de información. Soporta una ventana de contexto de 256K tokens y ofrece modos de pensamiento y de respuesta directa en un único modelo.

La arquitectura es un transformer decoder-only con atención híbrida: 27 capas con sliding-window attention con compuerta (gated) y 5 capas de atención global, con GQA de 32 cabezas de consulta y 8 de clave/valor. El entrenamiento combina precisión FP8 con el optimizador Muon, un mid-training progresivo de contexto largo y un SFT supervisado de tipo agéntico. El modelo se distribuye con licencia MIT y código de modelado propio, lo que exige `trust_remote_code=True`.

Su relevancia actual radica en que ofrece receta de entrenamiento abierta (datos, código y logs de entrenamiento publicados) y resultados competitivos frente a modelos de 7B-8B consolidados en matemáticas y búsqueda agéntica, con un contexto de 256K poco habitual en esta escala de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atención híbrida (27 capas gated sliding-window + 5 capas globales), GQA |
| Parametros totales | 7.394.832.384 (7,39B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas / tamano oculto | 32 / 4.096 |
| Ventana local / cabezas GQA | 128 tokens / 32 cabezas de consulta, 8 de clave-valor |
| Libreria | transformers (con `trust_remote_code=True`) |
| Tamano del repo | 16,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 32 capas con tamaño oculto de 4.096. La innovación arquitectónica principal es la atención híbrida: 27 capas usan sliding-window attention con compuerta sobre una ventana local de 128 tokens, mientras que 5 capas emplean atención global. Según el informe técnico, esta combinación proporciona 3,94 veces más throughput de entrenamiento a 256K tokens en comparación con atención completa.

El entrenamiento se estructura en tres fases. La fase de preentrenamiento consume aproximadamente 4,19 billones (T) de tokens, con mezcla de datos basada en currículum, precisión híbrida FP8 y el optimizador Muon. El mid-training añade unos 600.000 millones (B) de tokens con extensión progresiva de contexto de 16K a 64K y finalmente 256K; en esta fase las trazas de interacción se reformulan como transiciones estado-acción de un proceso de decisión de Markov (MDP) para supervisar decisiones individuales. La fase final es un SFT conjunto de datos generales y agénticos. El informe estima una mejora de aproximadamente 4,2 veces en tiempo hasta alcanzar una pérdida dada en preentrenamiento a 16K, atribuible a la combinación de arquitectura, precisión, optimizador y normalización.

## Capacidades

- Generación de texto y razonamiento matemático de alto nivel, con modo de pensamiento explícito (`enable_thinking=True`) y modo de respuesta directa en el mismo modelo.
- Razonamiento multi-paso con cadenas de pensamiento largas (hasta 4.096 tokens nuevos en el ejemplo de generación).
- Uso de herramientas y búsqueda agéntica: búsqueda web, lectura de páginas y hasta 64 pasos de búsqueda y lectura en las evaluaciones.
- Búsqueda de funciones binarias mediante herramientas de Ghidra (protocolo específico del informe).
- Contexto largo de 256K tokens para manejar documentos extensos o historiales de interacción prolongados.
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizer.
- No se mencionan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos en producción educativa: el modelo alcanza 97,13% en MATH-500 y 75,00% en AIME 2026, por lo que puede emplearse en tutores automáticos o generadores de soluciones paso a paso con verificación.
- Investigación web automatizada: con 63,09% en WebWalkerQA y capacidad de hasta 64 pasos de búsqueda y lectura, es adecuado para agentes que recopilan y sintetizan información de múltiples páginas.
- Análisis de documentos largos: la ventana de 256K tokens permite procesar informes, expedientes o bases de código extensas en una sola pasada sin truncamiento.
- Ingeniería inversa asistida: el soporte de herramientas de Ghidra y su resultado de 62,00% en Binary Function Search lo hacen útil para tareas de identificación de funciones en binarios.
- Asistentes de razonamiento con tool calling: puede integrarse en pipelines donde el modelo decide cuándo invocar una herramienta externa y cómo encadenar varias llamadas en un flujo multi-paso.
- Evaluación comparativa de recetas de entrenamiento: al publicarse datos, código y logs, sirve como base reproducible para investigar atención híbrida, FP8 con Muon y extensión de contexto.
- Generación de código y conocimiento general: el informe cubre 20 benchmarks, incluidos código, conocimiento y seguimiento de instrucciones, aunque los resultados concretos de esas categorías no se detallan en la información disponible.

## Benchmarks y rendimiento

Resultados del checkpoint SFT de 256K en modo thinking, con temperatura 1,0, top-p 1,0 y media de pass@1 sobre 32 ejecuciones salvo indicación contraria.

| Benchmark (%) | ZGCM-1 | DeepSeek-R1-0528-Qwen3-8B | MiniCPM4.1-8B | Qwen3-8B | Olmo 3 7B Think |
|---|---:|---:|---:|---:|---:|
| MATH-500 | **97,13** | 96,32 | 95,60 | 96,20 | 95,10 |
| AIME 2024 | 80,62 | **83,33** | **83,33** | 80,00 | 71,60 |
| AIME 2025 | 73,33 | **75,21** | 73,33 | 63,33 | 64,60 |
| AIME 2026 | **75,00** | 69,17 | 71,67 | 66,67 | 66,16 |
| HMMT 2025 | **70,42** | 61,50 | 52,50 | 43,33 | 43,89 |
| HMMT 2026 | **59,48** | 51,52 | 46,21 | 45,45 | 43,94 |

Búsqueda agéntica:

| Benchmark | ZGCM-1 (%) | Configuracion |
|---|---:|---|
| WebWalkerQA | 63,09 | Búsqueda web y lectura de páginas |
| BrowseComp | 19,43 | Búsqueda web y lectura de páginas |
| GAIA (solo texto) | 42,52 | Búsqueda web y lectura de páginas |
| Binary Function Search | 62,00 | 31/50 coincidencias exactas de entrada de función con herramientas Ghidra |

La búsqueda web permite hasta 64 pasos de búsqueda y lectura. Binary Function Search usa un protocolo separado sobre 50 tareas de 10 proyectos reservados. El informe completo cubre 20 benchmarks e incluye código, conocimiento y seguimiento de instrucciones, pero los valores de esas categorías no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 15-16 GB solo para pesos, más memoria para KV cache; con contexto de 256K el KV cache crece de forma considerable y exige GPUs de 40-80 GB o más para secuencias muy largas.
- GPU recomendadas: A100 80GB o H100 para contexto completo de 256K; A100 40GB para contextos moderados en bf16.
- GPU de consumo: el modelo en bf16 no cabe en GPUs de 24 GB como la RTX 4090; requeriría cuantización, cuyos formatos no se detallan en la información disponible.
- Opciones de despliegue: transformers con `trust_remote_code=True` es el método documentado; al incluir código de modelado propio, la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: no se publican cifras de inferencia; el informe solo aporta el dato de 3,94 veces más throughput de entrenamiento a 256K frente a atención completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ZGCM-1-7B | 7,39B denso | 256K | MIT | Hugging Face, código y datos abiertos | Mejor media de ranking en 14 benchmarks de razonamiento entre los 7 modelos comparados |
| DeepSeek-R1-0528-Qwen3-8B | 8B | No disponible | No disponible | Hugging Face | Gana en AIME 2024 y 2025; pierde en MATH-500, AIME 2026 y HMMT |
| MiniCPM4.1-8B | 8B | No disponible | No disponible | Hugging Face | Empata en AIME 2024 y 2025; peor en HMMT |
| Qwen3-8B | 8B | No disponible | No disponible | Hugging Face | Inferior en todos los benchmarks matemáticos mostrados salvo MATH-500, donde queda cerca |

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de búsqueda donde BrowseComp solo alcanza 19,43%.
- El contexto de 256K exige hardware de gama alta; el KV cache a esa longitud puede superar la VRAM de GPUs de consumo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el código de modelado antes de desplegarlo en producción.
- La licencia MIT permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre las herramientas externas (búsqueda web, Ghidra) que el modelo invoca.
- Los resultados de benchmarks provienen del informe técnico del propio autor; no se han verificado de forma independiente en la información disponible.
- No se detallan los formatos de cuantización soportados, lo que limita la planificación de despliegues con recursos reducidos.
- El modelo está especializado en matemáticas y búsqueda agéntica; su rendimiento en otras tareas (código, conocimiento general) no se detalla con cifras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zgcagi/ZGCM-1-7B
- Informe técnico (arXiv): https://arxiv.org/abs/2609.13356
- Dataset de entrenamiento: https://huggingface.co/datasets/zgcagi/ZGCM-1-Data
- Código de entrenamiento: https://github.com/zgcagi/ZGCM-1
- Log de entrenamiento (Weights & Biases): https://wandb.ai/zgcagi/zgcm-1-reports/reports/ZGCM-1-Training-and-Evaluation--VmlldzoxNzk1OTMxMg

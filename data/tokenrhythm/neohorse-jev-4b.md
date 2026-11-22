# TokenRhythm/NeoHorse-Jev-4B

## Resumen

NeoHorse-Jev-4B es un modelo de decisión estructurada de 4.000 millones de parámetros desarrollado por TokenRhythm, construido como ajuste fino del modelo base NeoHorse-1-4B. A diferencia de los modelos generativos convencionales, no produce texto autoregresivo: dada una serie de preguntas definidas por la aplicación (opciones candidatas, preguntas de sí/no o niveles de valoración ordenados), predice directamente la decisión y su distribución de probabilidad. Está diseñado específicamente para flujos de trabajo agénticos: enrutamiento de peticiones, selección de herramientas, verificación de condiciones y puntuación de resultados.

La innovación principal es la inferencia *prefill-only*: el modelo procesa el estado y las preguntas en una sola pasada y emite decisiones tipadas (Choice, Noul y Score) sin generar tokens de texto. Esto reduce la latencia y hace que las salidas sean directamente consumibles por lógica de aplicación, con probabilidades calibradas para aplicar umbrales y reglas de enrutamiento. Admite además entradas multimodales, combinando una única imagen con texto en la misma petición.

Su relevancia actual radica en que ofrece una alternativa ligera y desplegable localmente frente a los modelos generativos de gran tamaño en tareas de decisión dentro de pipelines agénticos. Con licencia Apache 2.0 y soporte para vLLM, SGLang y un runtime nativo en Python, CLI y HTTP, se posiciona como una pieza de infraestructura para sistemas que necesitan decisiones rápidas y deterministas más que texto libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de NeoHorse-1-4B), inferencia prefill-only, no generativa |
| Parámetros totales | 4B (según nombre del modelo; no se detalla desglose) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB, librería PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en NeoHorse-1-4B, un transformer de 4.000 millones de parámetros, y se ha ajustado como *finetune* para realizar predicciones estructuradas sobre un conjunto de decisiones definido por la aplicación. La inferencia es *prefill-only*: el modelo no decodifica texto token a token, sino que proyecta directamente sobre las respuestas candidatas suministradas en la petición. Soporta tres tipos de decisión: Choice (selección entre opciones candidatas con distribución de probabilidad), Noul (probabilidad de sí/no) y Score (valoración esperada sobre niveles ordenados).

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La evaluación publicada el 24 de septiembre de 2026 indica que el ajuste sobre NeoHorse-1-4B aporta una mejora media de 11,50 puntos porcentuales en los conjuntos Nimble, VitaminC y MASSIVE (83,26 % de precisión media frente a la línea base). El modelo también admite peticiones multimodales que combinan una imagen con texto, aunque no se especifica la arquitectura de fusión visión-lenguaje.

## Capacidades

- Predicción de decisiones estructuradas tipadas: Choice (distribución sobre candidatos), Noul (probabilidad binaria sí/no) y Score (valoración esperada sobre escalas ordenadas).
- Definición de decisiones por parte de la aplicación: acciones candidatas, preguntas de sí/no y niveles de valoración configurables por el desarrollador.
- Soporte de múltiples preguntas en una misma petición de texto.
- Salidas probabilísticas utilizables directamente en lógica de enrutamiento, umbrales y reglas de negocio.
- Capacidad multimodal visión-lenguaje: una imagen combinada con texto por petición.
- Inferencia prefill-only sin generación autoregresiva de texto.
- Integración con vLLM, SGLang y runtime nativo (Python, CLI, HTTP).
- No es un modelo conversacional ni de generación de texto libre.

## Casos de uso

- Enrutamiento de peticiones en agentes: el modelo recibe el estado de la conversación y una lista de rutas candidatas, y devuelve la distribución de probabilidad sobre ellas para que el orquestador seleccione el flujo adecuado con umbrales configurables.
- Selección de herramientas (*tool calling*): dada una petición del usuario y el catálogo de herramientas disponibles, predice qué herramienta invocar mediante una decisión de tipo Choice, sin necesidad de generar texto intermedio.
- Verificación de condiciones en pipelines: preguntas de sí/no (Noul) para comprobar precondiciones, validar estados o decidir si continuar un flujo multi-paso.
- Puntuación de resultados y respuestas: decisión de tipo Score para valorar la calidad de una salida, priorizar candidatos o clasificar por relevancia sobre escalas ordenadas definidas por la aplicación.
- Control de agentes en entornos interactivos: los demos publicados (Tetris, Snake, manipulación robótica, Mahjong, arena de bombas a cuatro jugadores y conducción autónoma) muestran su uso para seleccionar acciones en cada paso a partir del estado del entorno.
- Clasificación multimodal asistida: combinación de una imagen con texto para decidir entre categorías o verificar condiciones que dependen de contenido visual, como inspección o triaje de imágenes.
- Moderación y filtrado determinista: decisiones binarias o multietiqueta con probabilidades para aplicar políticas de contenido en producción, con latencia baja gracias a la inferencia prefill-only.

## Benchmarks y rendimiento

Resultados publicados por el autor (24 de septiembre de 2026), escala 0–100, mayor es mejor. NeoHorse-Jev-4B usa resultados con vLLM para JevBench, Kev y OpenJev; Nimble, VitaminC y MASSIVE mantienen la evaluación original sobre subconjunto fijo.

| Modelo | JevBench | Kev | OpenJev text | Nimble | VitaminC | MASSIVE | AVG |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Open-Jev-9B | **77,13** | 77,87 | **65,39** | 80,50 | 68,28 | 84,86 | 75,67 |
| Kev-4B | 73,71 | 81,47 | 54,75 | 73,40 | 76,46 | **85,71** | 74,25 |
| Laya English | 55,82 | 61,30 | 40,07 | 45,04 | **78,63** | 68,57 | 58,24 |
| Laya Typed Decisions | -- | -- | -- | 48,94 | 78,30 | 65,43 | -- |
| NeoHorse-1-4B (base) | -- | -- | -- | 69,15 | 63,27 | 82,86 | -- |
| **NeoHorse-Jev-4B** | 75,73 | **81,92** | 58,74 | **87,23** | 77,13 | 85,43 | **77,70** |

El AVG es la media de igual peso de los seis grupos, calculada antes del redondeo; no es precisión agrupada por ejemplo ni un leaderboard oficial combinado. Solo se clasifican los modelos con los seis grupos completos. NeoHorse-Jev-4B lidera en Kev (81,92) y Nimble (87,23); Open-Jev-9B es superior en JevBench y OpenJev, Kev-4B en MASSIVE y Laya en VitaminC. La ventaja agregada refleja el equilibrio entre tareas, no una victoria en cada benchmark.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 4B parámetros y pesos safetensors en FP16/BF16, el repo de 9,1 GB sugiere aproximadamente 8–9 GB de VRAM para inferencia en precisión completa; en cuantizaciones de 8 bits o 4 bits podría reducirse, aunque el autor no publica cuantizaciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) cubre la inferencia en precisión completa; GPUs consumer de 12 GB podrían requerir cuantización.
- Cabe en GPU consumer: previsiblemente sí en RTX 4090 (24 GB) y modelos con 16 GB o más; no confirmado para 8–12 GB sin cuantización.
- Opciones de despliegue: vLLM, SGLang y runtime nativo de TokenRhythm (Python, CLI, HTTP). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La inferencia prefill-only elimina la decodificación autoregresiva, lo que en principio reduce la latencia frente a modelos generativos del mismo tamaño, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AVG (6 grupos) | Licencia | Disponibilidad |
| --- | --- | --- | ---: | --- | --- |
| NeoHorse-Jev-4B | 4B | no disponible | **77,70** | Apache 2.0 | Hugging Face, ModelScope |
| Open-Jev-9B | 9B | no disponible | 75,67 | no disponible | Hugging Face |
| Kev-4B | 4B | no disponible | 74,25 | no disponible | Hugging Face |
| Laya English | no disponible | no disponible | 58,24 | no disponible | Hugging Face |

NeoHorse-Jev-4B obtiene el mejor agregado entre los modelos de decisión de pesos abiertos con resultados completos, con un tamaño menor que Open-Jev-9B. La comparación se limita a los benchmarks publicados por el autor; no hay datos independientes.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo emite decisiones sobre las opciones que define la aplicación.
- La model card no detalla sesgos conocidos, composición del dataset ni procesos de alineación, por lo que el riesgo de sesgo no está caracterizado.
- Riesgo de calibración deficiente de las probabilidades en dominios alejados de los datos de entrenamiento; los umbrales deben validarse con datos propios.
- Idiomas soportados no disponibles: no se confirma el rendimiento multilingüe, y los benchmarks publicados están en inglés.
- Longitud de contexto no disponible, lo que impide planificar su uso con estados muy largos.
- Capacidad multimodal limitada a una única imagen por petición según la información disponible.
- Los benchmarks son autoinformados por el autor y con protocolos propios (subconjuntos fijos, media de igual peso); no hay validación independiente.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base NeoHorse-1-4B y las dependencias del runtime.
- El AVG agregado no equivale a precisión por ejemplo ni a un leaderboard oficial; no debe citarse como métrica única de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TokenRhythm/NeoHorse-Jev-4B
- Modelo base NeoHorse-1-4B: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Repositorio GitHub: https://github.com/TokenRhythm/NeoHorse
- Colección NeoHorse Jev en Hugging Face: https://huggingface.co/collections/TokenRhythm/neohorse-jev
- Modelo en ModelScope: https://www.modelscope.cn/models/TokenRhythm/NeoHorse-Jev-4B
- Guía de despliegue: https://huggingface.co/TokenRhythm/NeoHorse-Jev-4B/blob/main/DEPLOYMENT.md
- Licencia en GitHub: https://github.com/TokenRhythm/NeoHorse/blob/main/jev/LICENSE
- Sitio de la empresa: https://tokenrhythm.ai/
- Twitter / X: https://x.com/opensquilla
- Open-Jev-9B: https://huggingface.co/ZefanCai/Open-Jev-9B
- Kev-4B: https://huggingface.co/jaredpalmer/kev-4b
- Laya English: https://huggingface.co/convaiinnovations/laya
- Laya Typed Decisions: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Paper referenciado (arXiv:2609.08183): https://arxiv.org/abs/2609.08183

# zen-E/PLatour-SC-Qwen3.5-4B-DAPO

## Resumen

PLatour-SC-Qwen3.5-4B-DAPO es un checkpoint de puentes de proyección lineales (bridges) entrenados sobre el modelo Qwen/Qwen3.5-4B, publicado por zen-E dentro del proyecto PLatour. No es un modelo de lenguaje completo: es un conjunto de pesos auxiliares que se cargan junto con el backbone Qwen3.5-4B para habilitar el modo de comunicación denominado Self-Communication, en el que el mismo backbone de 4B actúa simultáneamente como emisor y receptor. El checkpoint corresponde al experimento 21 del proyecto y se entrenó sobre el dataset zen-E/PLatour-DAPO-Data.

El proyecto PLatour investiga la transferencia entre modelos (PACT, Prefill-to-Autoregressive Cross-model Transfer): un emisor de mayor tamaño codifica el prompt y entrega representaciones ocultas, mientras un receptor más pequeño genera la respuesta de forma independiente. El método entrena puentes lineales ligeros entre backbones congelados usando recompensas de tarea, partiendo de proyecciones inicializadas a cero, y da soporte a modelos con atención híbrida. El paper asociado (arXiv 2611.06976) introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar que las mejoras provienen de información útil del emisor y no de la mera adaptación del receptor.

La relevancia de esta ficha radica en su naturaleza experimental: el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark, y el propio autor advierte de que no se hace ninguna afirmación sobre el protocolo de selección del checkpoint ni sobre rendimiento imparcial en datos reservados. Es, por tanto, un artefacto de investigación reproducible, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes de proyección lineales (bridges) sobre backbone transformer Qwen3.5-4B con atención híbrida; modo Self-Communication (emisor y receptor comparten el mismo backbone) |
| Parametros totales | No disponible (el checkpoint de puentes ocupa 0.8 GB; el backbone Qwen3.5-4B se descarga por separado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; el protocolo de evaluación publicado usa un límite de respuesta de 32K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con loader personalizado (custom-loader) y verificación de hashes contra el manifiesto de release |

## Arquitectura y entrenamiento

El checkpoint no contiene un transformer completo, sino puentes de proyección lineales entrenados entre backbones congelados. En el experimento 21 (Self-Communication sobre la tarea dapo), el mismo backbone público Qwen3.5-4B se usa como emisor y como receptor, y el puente entrenado conecta las representaciones internas de ambos roles. El método parte de proyecciones inicializadas a cero y se optimiza mediante recompensas de tarea, lo que permite entrenar la comunicación sin modificar los pesos del backbone. El soporte declarado incluye modelos con atención híbrida, categoría a la que pertenece Qwen3.5.

Los datos de entrenamiento provienen del dataset zen-E/PLatour-DAPO-Data. No se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si se emplearon RLHF o DPO; el método se describe como entrenamiento guiado por recompensas de tarea. La innovación técnica central es el propio paradigma PACT y su batería de controles PACT-Check, que distingue entre mejoras genuinas por transferencia de información y mejoras atribuibles a la adaptación del receptor. El release incluye verificación de configuración y hashes de pesos mediante el loader del proyecto.

## Capacidades

- Generación de texto condicionada por el puente entrenado, en el modo Self-Communication sobre Qwen3.5-4B.
- Razonamiento matemático y de competición: el protocolo de evaluación publicado cubre AIME, HMMT e IMO con un límite de respuesta de 32K tokens, e incluye el subconjunto AIME-135 y Clean80.
- Modo de comunicación cruzada: el diseño PACT permite, en su configuración general, que un emisor de mayor tamaño alimente a un receptor menor mediante representaciones ocultas.
- Soporte de atención híbrida en el backbone subyacente.
- Generación de código: el ejemplo de la model card advierte explícitamente de que la generación devuelve texto y no ejecuta el código generado.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Investigación en transferencia entre modelos: el checkpoint sirve para reproducir el experimento 21 del proyecto PLatour y estudiar si la comunicación emisor-receptor aporta información útil frente a los controles PACT-Check. Es su uso principal y el único documentado.
- Reproducción de resultados del paper: mediante `platour-exps evaluate --experiment 21` se ejecuta la evaluación sobre las entradas TEST publicadas con los ajustes de muestreo y puntuación del experimento, sin entrenamiento adicional.
- Auditoría de protocolos de evaluación: los controles Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver permiten diseñar experimentos que aíslen el efecto de la adaptación del receptor del de la transferencia real de información.
- Evaluación de razonamiento matemático: el protocolo por defecto sobre AIME, HMMT e IMO con tope de 32K tokens permite medir el rendimiento del sistema completo en problemas de competición.
- Desarrollo de infraestructura de serving: la integración con backend vLLM y la API `load_session`/`generate` permiten construir y validar pipelines de inferencia con puentes cargados dinámicamente.
- Estudio de eficiencia en despliegue: al reutilizar un único backbone de 4B para ambos roles, el modo Self-Communication evita la necesidad de un emisor externo de mayor tamaño, lo que simplifica los requisitos de memoria frente a configuraciones PACT con emisor grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio distribuye explícitamente los pesos de inferencia sin puntuaciones, y el autor indica que se requiere evaluación independiente y revisión de procedencia antes de usar estos artefactos para respaldar nuevas afirmaciones comparativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint de puentes ocupa 0.8 GB; a ello se suma el backbone Qwen3.5-4B, que debe residir en memoria junto con el puente.
- GPU recomendadas: no se especifican modelos concretos. El proyecto requiere Linux con CUDA, Python 3.11 y memoria GPU suficiente para los modelos seleccionados.
- Configuración por defecto del evaluador: 1 GPU por réplica; `--n-gpu 1` es válido si la carga completa cabe en una sola GPU. Con `--n-gpu 8` se lanzan 8 réplicas independientes, cada una en una GPU, con particionado disjunto de preguntas. La combinación `--n-gpu N --gpus-per-replica G` reparte N GPUs en N/G réplicas.
- Despliegue: backend vLLM para generación (`backend="vllm"` en la API) y el evaluador propio `platour-exps`. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El ejemplo de generación usa `max_new_tokens=256` como demostración de prompt personalizado, no como protocolo de benchmark.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de lenguaje autónomo sino un checkpoint de puentes para un backbone concreto (Qwen3.5-4B) dentro de un marco de investigación específico (PACT), por lo que no existen alternativas directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar el backbone Qwen/Qwen3.5-4B por separado y cargar el puente mediante el loader del proyecto; no funciona con pipelines estándar de transformers sin la API de PLatour.
- Sin benchmarks publicados: el autor declara que el repositorio distribuye pesos de inferencia históricos sin puntuaciones y no formula afirmaciones sobre el protocolo de selección del checkpoint ni sobre rendimiento imparcial en datos reservados.
- El ejemplo de la model card es una demostración de prompt personalizado, no el protocolo de benchmark publicado; los resultados de una ejecución ad hoc no son comparables con los del paper.
- La generación devuelve texto y no ejecuta el código generado, lo que limita su uso en pipelines que requieran ejecución automática.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable al backbone subyacente en tareas de razonamiento y matemáticas.
- Sesgos: no documentados en la información disponible.
- Idiomas soportados: no especificados; la cobertura multilingüe depende del backbone Qwen3.5-4B y no está verificada para este checkpoint.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso de los artefactos para respaldar nuevas afirmaciones comparativas requiere evaluación independiente y revisión de procedencia según el propio autor.
- Entorno obligatorio: Linux con CUDA y Python 3.11; el proyecto debe ejecutarse desde un checkout editable para que los manifiestos de release y los ficheros de tarea estén disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-SC-Qwen3.5-4B-DAPO
- Paper: https://arxiv.org/html/2611.06976
- Código del proyecto: https://github.com/zhenyi4/platour
- Colección de modelos PLatour: https://huggingface.co/collections/zen-E/platour
- Guía de agente/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Guía de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen35/README.md
- Índice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Valores por defecto de GPU en evaluación: https://github.com/zhenyi4/platour#gpu-defaults-for-standalone-evaluation
- Dataset de entrenamiento: https://huggingface.co/datasets/zen-E/PLatour-DAPO-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B

# spade-rl/SPADE-Qwen3-8B-Games

## Resumen

SPADE-Qwen3-8B-Games es un checkpoint del proyecto SPADE (Self-Play in Adaptive Synthetic Executable Environments), desarrollado por el equipo de spade-rl (afiliado a la Universidad de Washington y otros centros). El modelo se entrena a partir de Qwen/Qwen3-8B mediante un esquema de self-play en el que una misma red actúa como *proposer* (diseñador de entornos ejecutables) y como *actor* (jugador que resuelve dichos entornos). El proposer recibe recompensa por generar entornos que están en la frontera de lo que el actor puede resolver, lo que produce un currículo adaptativo que evoluciona con la política en lugar de fijarse a priori.

Este checkpoint concreto corresponde al ajuste para el escenario de juegos (*games*), entrenado sobre un corpus de grounding de 15 000 juegos sintéticos. La relevancia actual del modelo radica en que demuestra que el entrenamiento con entornos generados sintéticamente y adaptativos mejora capacidades de razonamiento científico, generación de código y razonamiento procedural en benchmarks held-out, sin necesidad de datos reales de esos dominios. El modelo tiene 8 190 735 360 parámetros (8B) y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) |
| Parametros totales | 8 190 735 360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 32 768 tokens, pero no se especifica en esta ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Qwen3-8B es multilingue, pero no se detalla en la informacion del checkpoint) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso con 8B parámetros y soporte nativo de *thinking mode* (razonamiento multi-paso) y *non-thinking mode* (respuesta rapida). Sobre esta base, SPADE aplica un esquema de entrenamiento por refuerzo con self-play: el modelo en su rol de proposer genera entornos ejecutables (juegos) que se validan contra un corpus de grounding de 15 000 juegos sintéticos; el actor intenta resolverlos y recibe recompensa por completarlos. El proposer es recompensado por generar entornos que el actor aún no domina, lo que fuerza una progresión de dificultad adaptativa.

El entrenamiento se realizó en el escenario *games* y el checkpoint liberado corresponde a la iteración 399 (iter399), siendo el checkpoint final de la ejecución sin barrido de evaluación offline. No se han publicado detalles sobre el algoritmo de RL exacto (PPO, GRPO, etc.) ni sobre la composición del corpus de grounding más allá de su tamaño. El artículo técnico (arXiv:2608.19197) describe el método completo, incluyendo la evaluación en dos escenarios (juegos y tool use) sobre tres tamaños de Qwen3 (4B, 8B y 30B-A3B).

## Capacidades

- Generacion de texto y razonamiento multi-paso: hereda las capacidades de Qwen3-8B, incluyendo modo pensante para problemas complejos.
- Generacion de entornos ejecutables: el modelo puede escribir juegos o simulaciones en formato ejecutable (probablemente codigo) que otros agentes pueden resolver.
- Razonamiento procedural y cientifico: el entrenamiento con juegos sinteticos mejora el rendimiento en tareas de razonamiento cientifico y procedural en benchmarks held-out.
- Generacion de codigo: el ajuste con entornos sinteticos preserva y mejora la capacidad de generacion de codigo, segun los resultados del proyecto.
- Razonamiento matematico: se preserva el rendimiento en matematicas de competicion, aunque no se mejora significativamente.
- Interaccion conversacional: al estar basado en Qwen3-8B, mantiene capacidades de dialogo y seguimiento de instrucciones.
- No se especifica soporte explicito de tool calling en este checkpoint, aunque el modelo base lo incluye; el escenario de tool use se entrena en otro checkpoint del proyecto.

## Casos de uso

- Generacion de entornos de entrenamiento para agentes de refuerzo: el modelo puede crear juegos o simulaciones con dificultad calibrada, utiles para entrenar politicas de RL en entornos sinteticos sin necesidad de diseno manual.
- Evaluacion de razonamiento procedural en modelos de lenguaje: al generar entornos que requieren pasos logicos y manipulacion de estado, sirve como banco de pruebas para medir capacidades de razonamiento paso a paso.
- Creacion de contenido procedural para videojuegos: el modelo puede generar niveles, puzzles o reglas de juego adaptativas, integrable en pipelines de desarrollo de juegos independientes.
- Generacion de codigo para simulaciones cientificas: dado su entrenamiento en entornos ejecutables, puede producir codigo de simulacion para experimentos o modelos simples.
- Benchmarking de agentes conversacionales: al poder generar dialogos o tareas interactivas, se puede usar para construir conjuntos de evaluacion dinamicos que se adaptan al rendimiento del agente evaluado.
- Investigacion en curriculos adaptativos: el modelo sirve como herramienta para estudiar como el self-play genera curriculos de dificultad creciente, aplicable a otros dominios de IA.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. El sitio del proyecto y el articulo mencionan cualitativamente que el entrenamiento con SPADE mejora el rendimiento en razonamiento cientifico, generacion de codigo y razonamiento procedural en benchmarks held-out, mientras que preserva el rendimiento en matematicas de competicion, comparado con el modelo base Qwen3-8B y con baselines de entornos fijos. Sin embargo, no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) en los materiales accesibles.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8B parametros. En precision fp16 (32 GB de pesos) se necesitan aproximadamente 16-18 GB de VRAM. Con cuantizacion int8, unos 8-10 GB; con int4, unos 4-6 GB.
- GPU recomendadas: para fp16, una GPU con 24 GB (RTX 3090, RTX 4090, A10G) o superior. Para cuantizacion int4, una GPU consumer de 8 GB (RTX 3060, RTX 4060) puede ser suficiente.
- Cabe en GPUs consumer: si, especialmente con cuantizacion. Una RTX 4090 (24 GB) puede ejecutar el modelo en fp16 sin problemas.
- Opciones de despliegue: compatible con transformers (carga directa), vLLM, TGI (text-generation-inference), llama.cpp y Ollama (si se convierte a GGUF). El tag `endpoints_compatible` sugiere compatibilidad con soluciones de despliegue gestionado.
- Latencia y throughput: no disponibles. Dependen del hardware y la cuantizacion; en una RTX 4090 con fp16 se espera una generacion de 20-40 tokens/s para modelos de 8B, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SPADE-Qwen3-8B-Games | 8B | no disponible (base: 32k) | Apache-2.0 | Self-play con generacion de entornos |
| Qwen3-8B (base) | 8B | 32 768 | Apache-2.0 | Modelo generalista con thinking mode |
| Llama-3.1-8B | 8B | 128 000 | Llama 3.1 Community License | Modelo generalista |
| Mistral-7B v0.3 | 7B | 32 768 | Apache-2.0 | Modelo generalista |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. La comparativa se limita a caracteristicas arquitectonicas y de licencia. El valor diferencial de SPADE-Qwen3-8B-Games es su entrenamiento especifico para generacion de entornos y razonamiento procedural, no su rendimiento generalista.

## Limitaciones y advertencias

- El modelo es un checkpoint experimental de investigacion; no se ha validado para uso en produccion y puede presentar comportamientos impredecibles en tareas fuera de su dominio de entrenamiento.
- No se han publicado evaluaciones de sesgos o toxicidad. Al derivar de Qwen3-8B, puede heredar sesgos presentes en los datos de preentrenamiento del modelo base.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar entornos o codigo incorrecto o no ejecutable. La validacion de los entornos generados es responsabilidad del usuario.
- Limitaciones de contexto: aunque el modelo base soporta 32k tokens, no se ha confirmado que el fine-tune mantenga esa longitud de contexto efectiva.
- Idiomas: no se especifican los idiomas soportados tras el ajuste; el modelo base es multilingue, pero el entrenamiento con juegos sinteticos podria haber afectado al rendimiento en idiomas distintos del ingles.
- Licencia Apache-2.0 permite uso comercial y modificacion, pero el modelo se ofrece sin garantias. Se recomienda revisar los terminos del proyecto SPADE y del modelo base Qwen3-8B.
- El checkpoint liberado (iter399) es el final de la ejecucion sin seleccion por evaluacion offline, por lo que podria no ser el mejor punto de la curva de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spade-rl/SPADE-Qwen3-8B-Games
- Sitio del proyecto: https://spade-rl.github.io/
- Repositorio GitHub: https://github.com/spade-rl/spade
- Articulo arXiv: https://arxiv.org/html/2608.19197v1
- Corpus de grounding (games): https://huggingface.co/datasets/spare-rl/spade-grounding-corpus-games-15k
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1

# TheHuggerFacer/Aran

## Resumen

Aran es un modelo de decisión de 395,5 millones de parámetros desarrollado por el usuario TheHuggerFacer. No es un modelo generativo al uso: su tarea es seleccionar una respuesta entre un conjunto de opciones suministradas (multiple-choice), combinando un encoder bidireccional con una cabeza de flujo (flow head) inicializada gaussianamente. El modelo parte de los pesos de tardellirs/crivo-400m, que a su vez deriva de Ettin reranker 400M.

La arquitectura retiene 24 capas de encoder con anchura oculta de 1.024, a las que se añaden unos 49,7 millones de parámetros correspondientes al módulo de flujo y condicionamiento (anchura 704, pirámide de slots 1 → 2 → 4). El contexto de empaquetado está limitado a 4.096 tokens, incluidos los marcadores internos, con 4 marcadores por opción candidata.

Es relevante como ejemplo de modelo especializado en toma de decisiones estructurada (clasificación zero-shot y selección entre alternativas) con un esquema de muestreo por flow matching y poda de candidatos. La model card advierte que los resultados publicados son autoevaluados sobre el propio checkpoint y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (24 capas, anchura 1.024) con cabeza de flujo gaussiana (anchura 704, pirámide de slots 1 → 2 → 4); mezcla nativa de atención global y deslizante |
| Parametros totales | 395.497.964 (395.497.921 según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens incluyendo marcadores internos (límite de empaquetado) |
| Tipos de cuantizacion | No disponible (pesos almacenados en FP32; inferencia en CUDA con autocast BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible; la model card indica que no se concede licencia independiente y que los derechos upstream no se renuncian |
| Formato de pesos | Safetensors (repo de 1,6 GB), con código de inferencia personalizado |

## Arquitectura y entrenamiento

Aran es un encoder transformer bidireccional derivado de tardellirs/crivo-400m (a su vez basado en Ettin reranker 400M). Conserva 24 capas de encoder con anchura oculta de 1.024 y mantiene la mezcla original de capas de atención global y deslizante. Sobre el encoder se añade un módulo de decisión de unos 49,7 millones de parámetros: una cabeza de flujo con anchura 704 y una pirámide de slots de 1 → 2 → 4, inicializada con una gaussiana. Los marcadores de cada opción candidata (4 por opción) atienden de forma bidireccional y se centran entre las opciones válidas.

El mecanismo de decisión funciona por actualizaciones de flujo: el modelo parte de ruido gaussiano y aplica un número configurable de pasos (uno u ocho en la evaluación publicada), con una variante de poda que elimina las opciones débiles, re-codifica las supervivientes y reinicia el proceso desde ruido, usando un margen coseno de 0,15. El contexto se empaqueta con `input_ids`, `attention_mask`, `marker_positions` y `choice_mask`. No se ha divulgado la receta de entrenamiento ni el corpus utilizado; tampoco se documenta si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Selección entre opciones suministradas (multiple-choice) mediante puntuaciones de selección sobre las alternativas retenidas.
- Clasificación zero-shot y clasificación de texto en sentido amplio (pipeline `text-classification`).
- Extracción de características (tag `feature-extraction`).
- Decisión condicionada por un estado o contexto textual junto a una pregunta y un conjunto de acciones candidatas.
- Muestreo configurable: un paso de flujo o rollout fijo de ocho pasos, con o sin poda de candidatos.
- Inferencia en CUDA con autocast BF16 (manteniendo pesos FP32) y en CPU mediante operaciones PyTorch estándar.
- Soporte de `AutoModelForSequenceClassification` a través de la misma clase personalizada.
- No dispone de generación de texto libre, tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido (el checkpoint publicado es el original, previo a la extensión experimental de "reasoning slots").
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Enrutamiento de acciones en sistemas de reglas: dado un estado (por ejemplo, verificaciones de identidad y pago) y un conjunto de acciones posibles, el modelo selecciona la acción que satisface la regla, como muestra el ejemplo de `predict` de la model card.
- Clasificación zero-shot de tickets o documentos: se suministran las etiquetas candidatas como opciones y el modelo puntúa cada una, sin necesidad de entrenamiento específico por tarea.
- Moderación y triaje de contenido: selección entre categorías predefinidas de decisión (aprobar, revisar, rechazar) condicionada por el texto del caso.
- Evaluación automática de respuestas: comparar respuestas candidatas a una pregunta y seleccionar la más adecuada, útil en pipelines de control de calidad de datos.
- Selección de candidatos en sistemas de recuperación: reordenar o elegir entre fragmentos recuperados por un buscador, aprovechando su origen en un reranker.
- Asistencia a la decisión en flujos de aprobación: integrado en un backend que construye el estado y las opciones y consume la puntuación de selección (con la advertencia de que no son probabilidades calibradas).
- Experimentación en investigación sobre flow matching aplicado a decisión: la variante de poda y el rollout de ocho pasos permiten estudiar el efecto del número de pasos en la precisión.

## Benchmarks y rendimiento

Resultados autoevaluados por el autor sobre este checkpoint exacto, no verificados de forma independiente. JevBench se usó repetidamente durante el desarrollo y no debe interpretarse como un test final intacto.

| Evaluación | Preguntas | Un paso | Ocho pasos | Poda |
|---|---:|---:|---:|---:|
| jevbench easy | 48 | 97,92% | 97,92% | 97,92% |
| jevbench standard | 72 | 88,89% | 88,89% | 90,28% |
| jevbench hard | 111 | 54,05% | 54,95% | 53,15% |
| jevbench overall | 231 | 74,03% | 74,46% | 74,03% |
| decidebench v1 | 400 | 85,50% | 85,00% | 83,50% |
| decidebench v2 | 450 | 65,33% | 65,11% | 64,67% |

| DecideBench (ambas respuestas del par correctas) | Un paso | Ocho pasos | Poda |
|---|---:|---:|---:|
| v1 | 72,50% | 71,50% | 68,50% |
| v2 | 36,00% | 36,00% | 36,00% |

DecideBench v1 contiene 400 preguntas / 200 pares; v2 contiene 450 preguntas / 225 pares. Los resultados corresponden a DecideBench, no al Decision Index. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 395,5 millones de parámetros en FP32, los pesos ocupan aproximadamente 1,6 GB; con autocast BF16 en CUDA, el consumo efectivo de pesos ronda los 0,8 GB, más memoria para activaciones y el empaquetado de hasta 4.096 tokens.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder alojar el modelo, aunque no hay datos oficiales de latencia ni throughput.
- Cabe en GPU de consumo: sí, por el tamaño de parámetros (el repo ocupa 1,6 GB); no se confirman modelos concretos ni cifras de rendimiento.
- Opciones de despliegue: `transformers` (versión 5.22.1 según la model card) con `trust_remote_code=True`, PyTorch ≥ 2.6 y safetensors ≥ 0.4. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Aran | 395,5 M | 4.096 tokens | Decisión multiple-choice, clasificación | No disponible | Hugging Face (TheHuggerFacer/Aran) |
| tardellirs/crivo-400m | ~400 M | No disponible | Modelo base del que deriva Aran | No disponible | Hugging Face |
| Ettin reranker 400M | ~400 M | No disponible | Reranking | No disponible | Hugging Face (cross-encoder/ettin-reranker-400m-v1) |

No se dispone de datos de rendimiento comparables de los modelos upstream en la información proporcionada, por lo que la comparación se limita a parámetros, tarea y procedencia.

## Limitaciones y advertencias

- Los resultados de benchmarks son autoevaluados sobre el propio checkpoint y no han sido verificados de forma independiente.
- JevBench se utilizó repetidamente durante el desarrollo, por lo que puede estar sobreajustado a esa evaluación.
- Las puntuaciones softmax no garantizan calibración ni corrección; las salidas de poda son puntuaciones de selección, no probabilidades calibradas.
- El desbordamiento de tokens se señala mediante el campo `truncated`, pero el contexto está limitado a 4.096 tokens incluyendo marcadores internos.
- Solo soporta inglés.
- La licencia no está disponible y la model card indica que no se concede licencia independiente ni se renuncian los derechos upstream, lo que genera incertidumbre para uso comercial.
- Requiere `trust_remote_code=True`, con ejecución de código personalizado; la model card recomienda revisar el código de inferencia antes de usarlo.
- No se ha divulgado la receta de entrenamiento ni el corpus, lo que dificulta evaluar sesgos y riesgos de alucinación en la selección.
- No es un modelo generativo: no puede producir texto libre, usar herramientas ni razonar en múltiples pasos más allá del mecanismo de flujo.
- El checkpoint publicado es el original, previo a la extensión experimental de "reasoning slots", por lo que no incorpora esas capacidades.

## Enlaces

- Hugging Face: https://huggingface.co/TheHuggerFacer/Aran
- Modelo base: https://huggingface.co/tardellirs/crivo-400m
- Modelo upstream del base: https://huggingface.co/cross-encoder/ettin-reranker-400m-v1
- JevBench (subconjunto público): https://github.com/fstandhartinger/jevbench/tree/24b9b5c1609a7a9e8fa14f49e5985a836c9dc842
- DecideBench: https://huggingface.co/datasets/choyiny/decidebench

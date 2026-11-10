# tensor-tailor/zils-mini-body-22

## Resumen

zils-mini-body-22 es un ajuste fino mediante LoRA de un modelo de decisión de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) construido sobre el chasis d3-mini, que emplea la arquitectura Qwen3.5-4B con tensores de lenguaje y visión en bf16. Lo desarrolla el usuario tensor-tailor como "cuerpo de decisión" para el pool de modelos d3-mini de la subred 127 de Bittensor, un ecosistema de modelos colaborativos donde distintos participantes aportan pesos que se combinan. El modelo parte de una media ponderada uniforme de cuatro modelos públicos del pool, construida con la herramienta oficial `zils.soup.build`.

El problema que aborda es la especialización en tareas de razonamiento y uso de herramientas (tool calling) dentro de un modelo base pequeño y eficiente. Para ello se aplica un LoRA de rango 32 sobre las proyecciones de atención, Gated-DeltaNet y MLP de todas las capas de lenguaje, con una función de pérdida que combina entropía cruzada, puntuación de Brier y una divergencia KL que ancla el modelo a sus pesos de partida. El resultado se fusiona en bf16.

Es relevante ahora porque ejemplifica una tendencia creciente: la creación de modelos especializados de decisión (decision models) de tamaño reducido, orientados a tareas de clasificación y selección estructurada, que pueden desplegarse en hardware modesto. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni model card completa, lo que limita seriamente su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-4B (chasis d3-mini), con capas de atención, Gated-DeltaNet y MLP; tensores de lenguaje y visión |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el entrenamiento usó un máximo de 2.048 tokens, pero no se especifica la ventana de inferencia) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 y safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura sigue el chasis d3-mini, descrito como un layout con tensores de lenguaje y visión de Qwen3.5-4B en bf16. Incluye capas de atención estándar, capas Gated-DeltaNet (un mecanismo de atención lineal o de estado recurrente) y proyecciones MLP (gate, up, down). El modelo parte de una media ponderada uniforme de cuatro ingredientes públicos del pool: vllm-sr/d3-mini, perplexity-ai/pplx-decider-flash-v1.2, torchcast-ai/torchcast-decision-4b y Maincode/Matilda-Decision-v1-Mini, combinados con `zils.soup.build` y con un digest de partida documentado.

El entrenamiento consistió en un LoRA de rango 32, alpha 64 y dropout 0,05 aplicado a las proyecciones de atención, Gated-DeltaNet y MLP de todas las capas de lenguaje. Se usó una tasa de aprendizaje de 5e-5, AdamW con decaimiento de peso 1,0 solo sobre los pesos LoRA, batch 8 con acumulación 2, calentamiento de 50 pasos seguido de coseno, 2 épocas, máximo 2.048 tokens y semilla 4350. La función de pérdida por fila combina entropía cruzada sobre la etiqueta, 1,0 × puntuación de Brier y 0,1 × divergencia KL entre el modelo de partida y el modelo actual, calculada en vivo con el adaptador desactivado, sin profesor ni filas extra. El adaptador se fusionó en bf16. Los datos de entrenamiento son 2.001 filas ponderadas hacia razonamiento (40,1%) y herramientas (29,9%), con 13,0% de lenguaje, 12,0% de recuperación y 5,0% de artes; las etiquetas provienen de anotadores humanos o generadores de los propios conjuntos de datos, con 599 filas derivadas del dataset Schema-Guided Dialogue (CC BY-SA 4.0). La regla de dificultad exige que el modelo de partida asigne entre 0,30 y 0,80 de probabilidad a la respuesta correcta.

## Capacidades

- Generación de texto y razonamiento: el modelo está entrenado específicamente con un 40,1% de filas de razonamiento, incluyendo tareas de lógica proposicional (RuleTaker) y entailment lógico (Logical Entailment de DeepMind).
- Uso de herramientas (tool calling): un 29,9% de las filas corresponden a tareas de selección y validación de llamadas a funciones, con datos de diálogos reales del dataset Schema-Guided Dialogue.
- Decisión estructurada: el modelo está diseñado como "decision body", es decir, para elegir entre opciones (sí/no, selección múltiple, selección de función) más que para generación abierta.
- Recuperación (retrieval): un 12,0% de las filas corresponden a esta categoría, aunque no se detalla el formato exacto.
- Capacidades de visión: el chasis incluye tensores de visión de Qwen3.5-4B, pero no se documenta si el ajuste LoRA preserva o entrena dichas capacidades.
- Capacidades multilingües: no disponible; no se especifican idiomas soportados.
- Modo de pensamiento (thinking mode): no disponible.
- Soporte de agentes multi-paso: no documentado explícitamente, aunque la orientación a herramientas y decisiones sugiere uso en pipelines de agentes.

## Casos de uso

- Clasificación y enrutamiento de consultas en atención al cliente: el modelo puede decidir si una consulta requiere una llamada a función, una respuesta directa o una escalada, gracias a su entrenamiento con el 29,9% de filas de herramientas y diálogos reales de Schema-Guided Dialogue.
- Selección de funciones en asistentes conversacionales: dado un listado de funciones disponibles y el estado del diálogo, el modelo evalúa qué función y qué argumentos son correctos, una tarea directamente representada en los datos de entrenamiento (200 filas de selección de función y 139 de relleno de argumentos requeridos).
- Verificación de llamadas a herramientas en pipelines de agentes: el modelo puede actuar como validador (sí/no) de si una llamada propuesta honra la petición del usuario, útil como paso de control en sistemas multi-agente.
- Razonamiento lógico en entornos de bajos recursos: con 4,54 mil millones de parámetros, puede desplegarse en una GPU de consumo para tareas de entailment y lógica proposicional, aunque su rendimiento real no está benchmarkeado.
- Filtrado y puntuación de respuestas en sistemas RAG: la categoría de recuperación (12,0% de filas) sugiere uso en la selección de pasajes o respuestas relevantes, aunque no se detalla el formato.
- Prototipado de modelos de decisión para investigación: sirve como ejemplo reproducible de ajuste LoRA con anclaje KL sobre un modelo base combinado, útil para estudiar técnicas de especialización sin catástrofe de olvido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos (4,54 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 12-16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, alrededor de 2,3-3 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: para bf16, una RTX 4090 (24 GB), A100 (40/80 GB) o H100; para cuantización, una RTX 3060 (12 GB) o RTX 4070 (12 GB) podría ser suficiente.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas con 16 GB o más (RTX 4080, 4090); en cuantización, en tarjetas de 8-12 GB.
- Opciones de despliegue: al usar arquitectura Qwen3.5 con código personalizado (`custom_code`), requiere confiar en el código del repositorio; es compatible potencialmente con vLLM, llama.cpp u Ollama si se generan pesos GGUF, pero no se ha verificado ni documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-22 | 4,54 mil millones | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Ajuste LoRA de decisión, sin benchmarks |
| Maincode/Matilda-Decision-v1-Mini | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Uno de los ingredientes del pool |
| torchcast-ai/torchcast-decision-4b | aproximadamente 4 mil millones | no disponible | no disponible | Hugging Face (modelo base) | Otro ingrediente del pool |
| perplexity-ai/pplx-decider-flash-v1.2 | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Otro ingrediente del pool |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia objetiva de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas estándar, lo que impide validar las afirmaciones de especialización.
- Cero adopción: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- Model card incompleta: la información proporcionada se corta en la sección de datos de entrenamiento, por lo que faltan detalles sobre evaluación, limitaciones declaradas y uso previsto.
- Riesgo de alucinación: al ser un modelo de decisión entrenado con etiquetas de conjuntos de datos específicos, puede fallar en dominios fuera de distribución (lógica proposicional, entailment, diálogos Schema-Guided).
- Sesgos: los datos de entrenamiento provienen de conjuntos académicos (RuleTaker, Logical Entailment, Schema-Guided Dialogue) con posibles sesgos de dominio y de anotación; no se documenta ningún análisis de sesgo.
- Restricciones de licencia: aunque el modelo es Apache-2.0, 599 filas de entrenamiento derivan de Schema-Guided Dialogue (CC BY-SA 4.0); el autor advierte revisar los términos de ese dataset antes de reutilizar el cuerpo. La licencia Apache-2.0 del modelo no elimina las obligaciones de atribución y compartir igual que puedan derivarse del dataset.
- Código personalizado: el repositorio incluye `custom_code`, lo que implica ejecutar código no auditado al cargar el modelo; conviene revisarlo antes de usarlo en producción.
- Contexto limitado en entrenamiento: el ajuste se realizó con un máximo de 2.048 tokens, lo que puede limitar el rendimiento en conversaciones o documentos más largos aunque la ventana nativa sea mayor.
- Idiomas no especificados: no se declara soporte multilingüe, por lo que su uso en castellano u otros idiomas distintos del inglés no está garantizado.
- Naturaleza experimental: forma parte de un pool de Bittensor (subred 127) con reglas específicas de competición; su utilidad fuera de ese contexto no está demostrada.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-22
- Modelo base vllm-sr/d3-mini: https://huggingface.co/vllm-sr/d3-mini
- Modelo base perplexity-ai/pplx-decider-flash-v1.2: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Modelo base torchcast-ai/torchcast-decision-4b: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Modelo base Maincode/Matilda-Decision-v1-Mini: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Dataset RuleTaker: https://github.com/allenai/ruletaker
- Dataset Logical Entailment (DeepMind): https://github.com/google-deepmind/logical-entailment-dataset
- Dataset Schema-Guided Dialogue (DSTC8): https://github.com/google-research-datasets/dstc8-schema-guided-dialogue
- Subred 127 de Bittensor (d3-mini): no disponible en la información proporcionada

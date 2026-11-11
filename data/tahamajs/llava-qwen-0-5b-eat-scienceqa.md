# tahamajs/llava-qwen-0.5b-eat-scienceqa

## Resumen

`llava-qwen-0.5b-eat-scienceqa` es un checkpoint multimodal de tipo vision-language publicado por el usuario tahamajs dentro del ecosistema NeuralOps, una librería experimental orientada a la cirugía de mecanismos de atención y a la compresión de modelos. El modelo parte del VLM `llava-hf/llava-interleave-qwen-0.5b-hf` (torre de visión SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024) y sustituye el mecanismo de auto-atención en 18 de sus 24 capas por un operador adaptativo denominado `EATBlock` (Efficient Attention Transformer con poda progresiva de tokens).

El objetivo declarado no es superar al modelo base en capacidades generales, sino demostrar que es posible reemplazar la atención cuadrática por un operador eficiente y recuperar buena parte del rendimiento mediante destilación de conocimiento. Según la model card, la precisión en el subconjunto de ScienceQA con imágenes cae del 63,75 % del profesor al 32,50 % tras la cirugía sin reentrenamiento, y se recupera hasta el 61,25 % después de la destilación, con una perplejidad de 2,56 frente a 2,45 del profesor.

Es relevante ahora como artefacto de investigación reproducible: el delta de pesos serializado ocupa 147,61 MB frente a los 1,66 GB del base en FP16 (una reducción del 91,3 %), y todo el proceso de destilación se ejecutó en una única RTX 3090 en 120,6 segundos. No obstante, se trata de un modelo de 0,5 mil millones de parámetros, solo en inglés y entrenado exclusivamente sobre ScienceQA, por lo que su utilidad práctica en producción es muy acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre de visión SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); atención sustituida por `EATBlock` en 18/24 capas |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirúrgico en FP16); requiere la librería `neuralops` para cargar |

## Arquitectura y entrenamiento

El modelo hereda la topología LLaVA interleaved: un codificador visual SigLIP congelado de 27 capas, un proyector multimodal de dos capas que alinea los embeddings de imagen con el espacio del lenguaje, y un decodificador tipo Qwen2 de 24 capas. La intervención quirúrgica reemplaza la auto-atención en 18 de las 24 capas (esquema `hybrid_3_1`) por el operador `EATBlock`, definido en `neuralops/layers/adaptive/eat.py`, que implementa atención eficiente con poda progresiva de tokens. Se conservan seis capas de anclaje con atención cuadrática estándar en los índices `[3, 7, 11, 15, 19, 23]`. Permanecen congelados la torre de visión, el proyector, los MLP del decodificador y los embeddings; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento consistió en una destilación de conocimiento en dos etapas (76 pasos en la etapa 1 y 129 en la etapa 2, 205 en total) sobre el dataset `derek-thomas/ScienceQA`, usando una NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 20.325 MB y una duración total de 120,6 segundos. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es precisamente el pipeline de "cirugía de atención" con recuperación por destilación, no el modelo en sí.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): responde preguntas sobre figuras y diagramas científicos.
- Razonamiento visual sobre contenido STEM: el checkpoint está especializado en el subconjunto de ScienceQA con imágenes (preguntas de ciencia, opción múltiple).
- Conversación multi-turno: incluye plantilla de chat (`chat_template.json`) y pipeline `conversational`.
- Formato de respuesta con letra de opción: el ejemplo de la model card solicita respuestas del tipo "Answer with the option letter", lo que sugiere uso como clasificador de opción múltiple.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: no se documentan modos de pensamiento, audio ni vídeo; la única capacidad diferencial es la atención eficiente con poda de tokens.

## Casos de uso

- Investigación en eficiencia de atención: sirve como banco de pruebas reproducible para medir cuánto rendimiento se pierde al sustituir la atención cuadrática por `EATBlock` y cuánto se recupera con destilación, gracias a los artefactos de telemetría incluidos (`training_metrics.json`, `surgical_manifest.json`).
- Evaluación de pipelines de destilación de conocimiento: el delta documentado (32,50 % → 61,25 % de precisión) permite comparar estrategias de KD sobre un VLM pequeño con un coste de cómputo de dos minutos en una RTX 3090.
- Clasificación de preguntas de ciencia con imagen en entornos educativos experimentales: el modelo puede recibir una figura y una pregunta de opción múltiple y devolver la letra de la opción, siempre que el dominio se mantenga cercano a ScienceQA.
- Prototipado de asistentes de estudio STEM: con la plantilla de chat incluida se puede montar un demo conversacional que explique diagramas sencillos, aceptando la tasa de error esperada del ~39 % en el benchmark.
- Estudio de compresión de artefactos: el delta de 147,61 MB frente a 1,66 GB del base permite analizar el ahorro de almacenamiento y su impacto en la calidad, útil para investigar distribución de checkpoints quirúrgicos.
- Validación de la librería NeuralOps: el checkpoint es un ejemplo funcional de `load_surgeried_model` y del registro de operadores adaptativos, útil para desarrolladores que quieran extender la librería con nuevos operadores.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imágenes, split de validación:

| Metrica | Profesor (base) | Pre-destilacion | Post-destilacion (final) | Delta |
|---|---:|---:|---:|---:|
| Precision (%) | 63,75 | 32,50 | 61,25 | +28,75 |
| Perplejidad | 2,45 | 5,12 | 2,56 | -2,56 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 20.325 MB en una RTX 3090, pero la inferencia de un modelo de 0,5 B en FP16 debería caber holgadamente en GPUs de consumo, aunque esta cifra no está confirmada en la documentación.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB) es la única GPU documentada, usada para el entrenamiento. Para inferencia se espera que cualquier GPU con al menos 4-8 GB sea suficiente, pero no se aporta medición.
- Cabe en GPU de consumo: previsiblemente sí (el artefacto pesa 147,61 MB), aunque no hay cifras oficiales de VRAM en inferencia.
- Opciones de despliegue: la model card solo documenta la carga mediante `neuralops.hub.load_surgeried_model` con PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un delta quirúrgico con operadores personalizados es improbable que funcione sin la librería NeuralOps.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceQA (img) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-eat-scienceqa` | 0,5 B | no disponible | 61,25 % acc / 2,56 PPL | MIT | Hugging Face (librería `neuralops`) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5 B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la información | Hugging Face (transformers) |
| Otros VLM pequeños de la familia LLaVA | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base porque la información proporcionada no incluye datos de alternativas equivalentes. La diferencia clave frente al profesor es una pérdida de 2,5 puntos de precisión y un aumento de 0,11 en perplejidad, a cambio de un artefacto 11,53 veces más pequeño.

## Limitaciones y advertencias

- Especialización extrema: entrenado únicamente sobre ScienceQA, por lo que el rendimiento fuera de ese dominio (preguntas STEM con imagen) es desconocido y probablemente pobre.
- Pérdida de calidad respecto al profesor: 2,5 puntos de precisión y 0,11 de perplejidad, además de una caída drástica sin destilación (32,50 %), lo que indica fragilidad del operador `EATBlock`.
- Solo inglés: no hay soporte multilingüe documentado.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas de opción múltiple el modelo puede emitir respuestas fuera del conjunto de opciones.
- Dependencia de la librería `neuralops`: los pesos son un delta quirúrgico que requiere el código de la librería y los operadores personalizados; no es un checkpoint estándar de `transformers`.
- Resultados no verificados: las métricas del model-index tienen `verified: false` y proceden del propio autor.
- Licencia MIT: permite uso comercial, pero el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` puede tener condiciones propias que conviene revisar antes de un despliegue comercial.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente.
- Sin datos de contexto máximo, cuantizaciones ni latencia, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-eat-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador EAT: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/eat.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE

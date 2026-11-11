# tahamajs/llava-qwen-0.5b-gdn2-attention-scienceqa

## Resumen

`llava-qwen-0.5b-gdn2-attention-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un "attention surgery zoo" que sustituye mecanismos de atención estándar por variantes alternativas en modelos preentrenados. En este caso, se parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (un VLM LLaVA con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas y 0,5 mil millones de parámetros) y se reemplaza la atención cuadrática en 18 de sus 24 capas por el operador propietario `GDN2Attention` (Gated DeltaNet 2 con recurrencia lineal desacoplada de borrado y escritura).

El modelo resuelve un problema de investigación más que de producto: evaluar si un mecanismo de atención lineal con compuertas puede sustituir a la atención cuadrática en un VLM pequeño mediante destilación de conocimiento, manteniendo un rendimiento razonable en razonamiento visual STEM. Se entrena y evalúa sobre el subconjunto con imagen de ScienceQA (validación), alcanzando un 31,25 % de accuracy y una perplejidad de 3,69 tras la destilación.

Es relevante ahora como artefacto reproducible de investigación en eficiencia de atención: el delta de pesos serializado ocupa solo 182 MB frente a los 1,66 GB del modelo base completo (un 89,3 % menos), y todo el proceso de "cirugía" y destilación se ejecutó en una única RTX 3090 en 120,3 segundos y 93 pasos de optimización. No obstante, el rendimiento final está muy por debajo del profesor original (63,75 % de accuracy), por lo que debe tratarse como una prueba de concepto, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA multimodal: torre visual SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas; atención sustituida por `GDN2Attention` (Gated DeltaNet 2, familia `gated`) en 18/24 capas con esquema híbrido `hybrid_3_1` |
| Parametros totales | 0,5 mil millones (modelo base LLaVA-Qwen-0.5B); delta quirúrgico serializado de 190.841.096 bytes (182 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirúrgico en FP16) + `surgical_manifest.json`, `config.json`, tokenizer BPE completo |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: un codificador visual SigLIP de 27 capas completamente congelado, un proyector MLP de dos capas que alinea el espacio visual con el textual, y un decodificador Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas de atención y dimensión de cabeza 64. Sobre esta base, la "cirugía" reemplaza la self-attention en 18 de las 24 capas del decodificador por `GDN2Attention`, un mecanismo de recurrencia lineal con compuertas cuya formulación es S_t = S_{t-1} · α_t · (I − β_erase_t · k_t k_t^T) + β_write_t · k_t v_t^T, es decir, un DeltaNet con tasas de borrado y escritura desacopladas. Se conservan 6 capas de atención cuadrática como anclas en los índices [3, 7, 11, 15, 19, 23], siguiendo el patrón híbrido `hybrid_3_1`. Permanecen congelados la torre visual, el proyector multimodal, los MLP del decodificador y los embeddings; solo se entrenan las atenciones sustituidas y los layernorms del decodificador.

El entrenamiento consiste en una destilación de conocimiento en dos etapas (31 + 62 pasos, 93 en total) ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB con un pico de 17.349 MB de VRAM y una duración de 120,3 segundos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de ScienceQA, ni si se aplicaron RLHF o DPO. La innovación técnica principal es la propia sustitución de atención con preservación de anclas cuadráticas, junto con la serialización del cambio como delta modular en lugar de pesos completos.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`), orientada a respuesta a preguntas visuales.
- Razonamiento visual sobre figuras STEM (el checkpoint se evalúa específicamente en el subconjunto con imagen de ScienceQA).
- Conversación multimodal con plantilla de chat incluida (`chat_template.json`).
- Respuesta en formato de opción múltiple (el ejemplo de la model card pide "Answer with the option letter").
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está entrenado para respuesta directa de VQA.
- Capacidades multilingües: limitadas al inglés según la metadata del repositorio.
- Capacidades especiales (thinking mode, audio, vídeo): no disponibles.
- Carga mediante API propia de NeuralOps (`load_surgeried_model`), no mediante `transformers` estándar.

## Casos de uso

- Investigación en eficiencia de atención: servir como punto de partida reproducible para estudiar la sustitución de atención cuadrática por variantes lineales con compuertas en modelos vision-language pequeños, comparando el delta de pesos y las métricas de destilación.
- Evaluación de técnicas de destilación de conocimiento: el par profesor (63,75 % de accuracy) y alumno (31,25 %) permite medir la brecha de rendimiento al comprimir la atención, con telemetría de pasos y VRAM ya publicada.
- Prototipado de VQA educativa de bajo coste: con solo 182 MB de delta sobre un base de 0,5B, puede desplegarse en entornos con recursos muy limitados para experimentar con preguntas sobre figuras de ciencias, asumiendo la baja precisión.
- Benchmarking de operadores de atención: el zoo NeuralOps permite comparar `gdn2_attention` frente a otros operadores sobre la misma base y dataset, usando ScienceQA como vara de medir común.
- Docencia y divulgación: ejemplo didáctico completo de "attention surgery" con manifiesto quirúrgico, configuración y métricas legibles por máquina.
- Pruebas de integración de pipelines multimodales: validar el flujo imagen → proyector → decodificador con atención híbrida en entornos de CI antes de escalar a modelos mayores.
- No recomendado para atención al cliente, generación de código en producción ni asistentes generales: el rendimiento y el alcance del entrenamiento no lo justifican.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen STEM, split de validación:

| Métrica | Profesor (base) | Alumno pre-destilación | Alumno final (post-KD) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 31,87 | 31,25 | −0,62 |
| Perplejidad | 2,45 | 1.711.610,08 | 3,69 | −1.711.606,39 |

La destilación reduce la perplejidad en más de seis órdenes de magnitud respecto al estado pre-KD, pero la accuracy final queda aproximadamente a la mitad de la del profesor. No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió un pico de 17.349 MB en FP16 sobre una RTX 3090, por lo que la inferencia en FP16 debería caber holgadamente en GPUs de 8-12 GB, aunque el dato no está confirmado.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; el autor usó una RTX 3090 (24 GB) para el proceso completo de cirugía y destilación.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores, dado el tamaño de 0,5B parámetros y el delta de 182 MB.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al tratarse de pesos delta sobre una base LLaVA probablemente requiera el runtime de NeuralOps.
- Latencia y throughput: no disponibles. Solo se conoce la telemetría de entrenamiento (120,3 s, 93 pasos, 17.349 MB de pico de VRAM).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento ScienceQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-gdn2-attention-scienceqa | 0,5B | no disponible | 31,25 % accuracy (validación, subconjunto con imagen) | MIT | Hugging Face (delta 182 MB) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75 % accuracy (misma evaluación, según el autor) | no disponible en la información | Hugging Face |
| Otros VLM pequeños comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa solo es posible con el modelo base del que deriva; no se dispone de datos de otros VLM de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Brecha de rendimiento severa: la accuracy final (31,25 %) es aproximadamente la mitad de la del profesor (63,75 %), lo que indica que la sustitución de atención degrada sustancialmente el razonamiento visual.
- Entrenamiento muy corto: 93 pasos y 120,3 segundos sobre un único dataset; no hay evidencia de generalización más allá de ScienceQA.
- Sesgos conocidos: no documentados; al derivar de Qwen2 y ScienceQA, hereda los sesgos del corpus original y del dataset educativo, no analizados por el autor.
- Riesgo de alucinación: alto en la práctica por la baja accuracy y la perplejidad elevada en comparación con el profesor, aunque el valor final de 3,69 es razonable.
- Limitación de idioma: solo inglés según la metadata; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto: no documentada; la atención lineal con recurrencia puede comportarse de forma distinta a la cuadrática en secuencias largas, sin datos que lo respalden.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base y la torre SigLIP pueden tener condiciones propias que conviene revisar antes de explotarlo.
- Dependencia de runtime: requiere la librería `neuralops` y los pesos delta, no es un checkpoint autónomo cargable con `transformers` estándar.
- Métricas no verificadas: la model card marca explícitamente `verified: false` en accuracy y perplejidad.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-gdn2-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `gdn2_attention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/flagship_fla.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE

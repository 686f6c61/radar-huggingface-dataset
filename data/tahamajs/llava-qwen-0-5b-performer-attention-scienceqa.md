# tahamajs/llava-qwen-0.5b-performer-attention-scienceqa

## Resumen

`llava-qwen-0.5b-performer-attention-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un marco de "cirugía de atención" que sustituye mecanismos de atención cuadrática por operadores lineales en modelos transformer ya entrenados. En concreto, parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (un VLM multimodal de 0,5 mil millones de parámetros con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas) y reemplaza la atención de 18 de sus 24 capas por atención Performer (FAVOR+, atención lineal con características ortogonales positivas aleatorias), manteniendo 6 capas cuadráticas como anclas.

El objetivo declarado no es producir un modelo de producción, sino servir como artefacto de investigación reproducible dentro de un "attention zoo": un catálogo de variantes quirúrgicas que permite comparar operadores de atención alternativos bajo un mismo protocolo de evaluación. El checkpoint se afina sobre ScienceQA (subconjunto STEM con imágenes, split de validación) mediante destilación de conocimiento en dos etapas, y se publica únicamente el delta de pesos de atención modificados (259,26 MB en FP16), no el modelo completo.

Su relevancia es metodológica: demuestra el coste real en calidad de sustituir atención cuadrática por lineal en un VLM pequeño, con una caída de exactitud del 63,75 % (profesor) al 31,25 % (final) y una perplejidad que baja de 242,44 a 4,08 tras la destilación. Es un dato útil para quien evalúe operadores lineales en visión-lenguaje, no un modelo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas), con atención Performer lineal (FAVOR+) en 18 de 24 capas |
| Parametros totales | No disponible de forma explícita; el modelo base es de 0,5 mil millones de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados están en FP16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (delta de atención parcial, `attention_only_fp16`, 516 tensores) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura LLaVA Interleave: torre visual SigLIP de 27 capas congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión de cabeza 64. La intervención quirúrgica (`hybrid_3_1`) sustituye la self-attention de 18 de las 24 capas del decodificador por `PerformerAttention`, un operador de la familia lineal basado en FAVOR+ (Fast Attention Via Positive Orthogonal Random Features). Se conservan 6 capas con atención cuadrática como anclas en los índices `[3, 7, 11, 15, 19, 23]`, y se mantienen congelados la torre visual, el proyector multimodal, los MLP del decodificador y los embeddings. Solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El ajuste se realiza en dos etapas de destilación de conocimiento desde el modelo profesor original, con 151 pasos totales (53 en la etapa 1 y 98 en la etapa 2), sobre una NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 13.612 MB y una duración de 120,5 segundos. El conjunto de evaluación es ScienceQA (subconjunto STEM con imágenes, validación). El paquete incluye un manifiesto quirúrgico (`surgical_manifest.json`, esquema `neuralops.surgery/v2`) que documenta la topología de la intervención y los prefijos modificados.

## Capacidades

- Generación de texto e imagen-texto a texto (pipeline `image-text-to-text`), con soporte de razonamiento visual básico sobre figuras y diagramas STEM.
- Respuesta a preguntas de opción múltiple sobre imágenes en dominios de ciencias (física, química, biología), limitada al formato de ScienceQA.
- Conversación multi-turno mediante plantilla de chat incluida (`chat_template.json`).
- Procesamiento de imagen con preprocesador propio (`preprocessor_config.json`), con resolución de entrada de 384×384 según el ejemplo de la model card.
- Capacidad multilingüe: solo inglés.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni vídeo.
- No se documenta decodificación especulativa ni optimizaciones de inferencia adicionales.

## Casos de uso

- Investigación sobre atención lineal en VLMs: el checkpoint sirve como punto de comparación reproducible frente al profesor cuadrático y a otras variantes del "attention zoo" de NeuralOps, con métricas declaradas de exactitud y perplejidad sobre el mismo split.
- Estudio de destilación de conocimiento post-cirugía: permite analizar cómo la KD recupera perplejidad (de 242,44 a 4,08) sin recuperar exactitud (de 39,38 % a 31,25 %), un fenómeno relevante para quien diseñe pipelines de compresión.
- Benchmarking de operadores FAVOR+: útil para medir el coste de calidad de Performer Attention en tareas visión-lenguaje frente a atención cuadrática, con un protocolo y dataset fijos.
- Reproducción de experimentos de "attention surgery": el manifiesto quirúrgico y los scripts del proyecto NeuralOps permiten replicar la sustitución de capas y verificar la topología `hybrid_3_1`.
- Docencia y divulgación: ejemplo didáctico de cómo se audita un artefacto de pesos parcial (259,26 MB frente a 1,66 GB del base, un 84,8 % menos) y de cómo se interpreta un delta de atención.
- Pruebas de integración del runtime NeuralOps: el checkpoint valida la API `load_surgeried_model` y el formato `attention_only_fp16` en un caso multimodal real.
- No se recomienda su uso en atención al cliente, generación de código en producción ni pipelines comerciales, dado su rendimiento degradado y su naturaleza experimental.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre ScienceQA (subconjunto STEM con imágenes, validación):

| Métrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Exactitud (%) | 63,75 | 39,38 | 31,25 | -8,13 |
| Perplejidad (PPL) | 2,45 | 242,44 | 4,08 | -238,36 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- El autor entrenó y evaluó en una NVIDIA GeForce RTX 3090 (24 GB), con un pico de 13.612 MB de VRAM durante el ajuste.
- El modelo base completo pesa 1,66 GB en FP16; el artefacto publicado es un delta de 259,26 MB que requiere el modelo base para reconstruirse.
- Inferencia en FP16: cabe holgadamente en GPUs de consumo con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4090); también en GPUs de datacenter (A100, H100) sin problema de memoria.
- Despliegue: la model card documenta únicamente la API `neuralops.hub.load_surgeried_model` con PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al publicarse solo el delta de atención, estos runtimes estándar no podrían cargarlo sin materializar antes el modelo completo.
- Latencia y throughput: no disponibles. La atención lineal en 18 de 24 capas debería reducir el coste computacional teórico frente a atención cuadrática, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-performer-attention-scienceqa` | ~0,5 B (base) | No disponible | 31,25 % exactitud / 4,08 PPL en ScienceQA (STEM, val) | MIT | Delta de atención en HF; requiere runtime NeuralOps |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5 B | No disponible | 63,75 % exactitud / 2,45 PPL en el mismo split (según el autor) | No disponible en la información | Pesos completos en HF |
| Otras variantes del Attention Surgery Zoo de NeuralOps | ~0,5 B | No disponible | No disponible | MIT (según el proyecto) | Deltas de atención en HF |
| Otros VLMs pequeños de ~0,5 B (p. ej., familia SmolVLM) | ~0,5 B | No disponible | No disponible en esta información | No disponible | Pesos completos en HF |

## Limitaciones y advertencias

- Degradación severa de calidad: la exactitud cae del 63,75 % del profesor al 31,25 % final, aproximadamente la mitad, lo que lo inutiliza para uso en producción.
- La destilación recupera perplejidad pero no exactitud: el modelo se vuelve más fluido sin volverse más correcto, un patrón que puede enmascarar errores en evaluaciones basadas solo en PPL.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni robustez; al entrenarse solo sobre ScienceQA, el dominio y la distribución están muy acotados.
- Riesgo de alucinación: alto en preguntas abiertas fuera del formato de opción múltiple de ScienceQA; no se aportan datos al respecto.
- Idiomas: solo inglés; no hay soporte multilingüe.
- Longitud de contexto: no documentada; no debe asumirse la del modelo base sin verificación.
- Licencia MIT, pero el uso comercial no está recomendado por el rendimiento; además, el artefacto es un delta parcial que depende del modelo base y del runtime NeuralOps, lo que añade dependencias de licencia y técnicas.
- Los pesos publicados no son autocontenidos: requieren reconstruir el modelo completo con `neuralops.hub.load_surgeried_model`, una librería no estándar.
- Los resultados de benchmarks están marcados como no verificados por el propio autor; no han pasado auditoría independiente.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-performer-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de Performer Attention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/performer_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA

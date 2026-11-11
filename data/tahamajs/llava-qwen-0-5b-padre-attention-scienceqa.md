# tahamajs/llava-qwen-0.5b-padre-attention-scienceqa

## Resumen

`llava-qwen-0.5b-padre-attention-scienceqa` es un checkpoint experimental publicado por el usuario `tahamajs` dentro del ecosistema NeuralOps, un proyecto de "cirugía de atención" (attention surgery) que sustituye mecanismos estándar de atención por operadores alternativos en modelos preentrenados. En este caso, el modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM compacto de LLaVA con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64), y reemplaza la atención softmax por PADReAttention (Polynomial Attention with Dropout Regularization) en 18 de las 24 capas.

El objetivo declarado no es producir un modelo de propósito general, sino demostrar que una operación de sustitución de atención combinada con destilación de conocimiento desde el modelo profesor puede recuperar e incluso superar ligeramente el rendimiento del original en una tarea concreta: ScienceQA en su subconjunto con imágenes de validación. El autor reporta 65,62 % de accuracy y perplejidad 2,16 tras la destilación, frente a 63,75 % y 2,45 del profesor, partiendo de un 43,12 % en zero-shot antes de la destilación.

La relevancia es por tanto metodológica y de investigación: muestra un pipeline reproducible de "attention zoo" con artefactos quirúrgicos de solo 259,12 MB (frente a 1,66 GB del base en FP16, un 84,8 % menos), entrenado en una única RTX 3090 en 120 segundos y 250 pasos. No es un modelo listo para producción general, sino una pieza de evaluación para estudiar variantes de atención eficientes en VLMs pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower congelada + proyector MLP 2 capas + decodificador Qwen2 de 24 capas, D=1024, H=16, head_dim=64) con atencion PADRe en 18/24 capas |
| Parametros totales | Aproximadamente 0,5B (heredados del base `llava-interleave-qwen-0.5b-hf`); el checkpoint quirurgico guarda 498 tensores de atencion, 271.703.152 bytes en FP16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en FP16 safetensors; el autor no documenta GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, solo atencion y layernorms entrenados) + `surgical_manifest.json` (schema `neuralops.surgery/v2`) |

## Arquitectura y entrenamiento

El modelo es un VLM tipo LLaVA interleaved: una torre visual SigLIP de 27 capas permanece completamente congelada, un proyector multimodal MLP de dos capas conecta vision y lenguaje, y el decodificador Qwen2 de 24 capas procesa la secuencia multimodal. La intervención quirúrgica sustituye la atención softmax por PADReAttention (Polynomial Attention with Dropout Regularization), que reemplaza el softmax por un kernel polinómico centrado y numéricamente estable de la forma `(1 + S/order)^order`, clasificado por el autor en la familia `sparse`. La sustitución se aplica en 18 de las 24 capas (esquema `hybrid_3_1`), manteniendo 6 capas ancla con atención cuadrática estándar en los índices `[3, 7, 11, 15, 19, 23]`.

El entrenamiento se limita a las atenciones modificadas y a los layernorms del decodificador; MLPs, embeddings, proyector y torre visual quedan congelados. Se usa destilación de conocimiento desde el modelo profesor en dos etapas (106 + 144 pasos, 250 en total) sobre ScienceQA, con una RTX 3090 (24 GB), 18.520 MB de VRAM pico y 120,2 segundos de duración total. El resultado es un delta de pesos de 259,12 MB que debe combinarse con el modelo base para su uso, no un modelo autónomo completo.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imágenes con contenido STEM (ciencias, matemáticas, tecnología).
- Razonamiento multimodal de una sola imagen con pregunta y opciones de respuesta múltiple (formato ScienceQA).
- Generación de texto conversacional en inglés con plantilla de chat incluida (`chat_template.json`).
- Procesamiento de imagen y texto de forma intercalada, heredado de LLaVA Interleave.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la respuesta directa.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documenta modo thinking, audio ni vídeo.

## Casos de uso

- Investigación en eficiencia de atención: comparar PADReAttention frente a softmax en un VLM pequeño con un pipeline reproducible, usando el checkpoint como variante controlada del base.
- Evaluación de destilación de conocimiento: reproducir el experimento de recuperar accuracy tras sustituir atención (43,12 % → 65,62 %) y medir la contribución de cada etapa (106 + 144 pasos).
- Benchmark de VQA científico en inglés: usar el modelo como baseline de 0,5B en ScienceQA con imágenes, útil para calibrar modelos mayores en la misma tarea.
- Estudio de compresión de artefactos: analizar cómo un delta de 259,12 MB (frente a 1,66 GB del base) preserva el comportamiento del profesor, relevante para despliegues con almacenamiento restringido.
- Reproducibilidad en hardware de consumo: validar pipelines de entrenamiento multimodal en una única RTX 3090 con 18,5 GB de VRAM pico, como referencia para laboratorios con recursos limitados.
- Docencia y prototipado de "attention surgery": servir de ejemplo didáctico de sustitución de operadores en transformers multimodales con manifiesto quirúrgico verificable (`surgical_manifest.json`).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`). Evaluación sobre ScienceQA, subconjunto con imágenes STEM, split de validación.

| Metrica | Profesor (base) | Zero-shot pre-KD | Final post-KD | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 43,12 | 65,62 | +22,50 |
| Perplejidad | 2,45 | 2,96 | 2,16 | -0,80 |

Telemetría de entrenamiento declarada: 250 pasos totales (106 etapa 1, 144 etapa 2), 120,2 s, RTX 3090, 18.520 MB de VRAM pico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint quirúrgico (259,12 MB) debe combinarse con el base `llava-interleave-qwen-0.5b-hf` (1,66 GB en FP16), por lo que el requisito real ronda el del modelo base completo más overhead del framework NeuralOps.
- GPU recomendadas: RTX 3090 (24 GB) es la GPU usada por el autor para entrenamiento; para inferencia del base de 0,5B en FP16 cualquier GPU con 8 GB o más debería ser suficiente, aunque no se documenta.
- Cabe en GPU de consumo: sí, el entrenamiento se realizó íntegramente en una RTX 3090; el modelo base en FP16 ocupa 1,66 GB.
- Opciones de despliegue: el autor solo documenta `neuralops.hub.load_surgeried_model` desde el Hub de NeuralOps; no se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-padre-attention-scienceqa` | ~0,5B | No disponible | 65,62 % accuracy / 2,16 PPL (declarado) | MIT | Hugging Face (repo 0,3 GB) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | No disponible | 63,75 % accuracy / 2,45 PPL (declarado por el autor) | No disponible en esta ficha | Hugging Face |
| Otros VLM de ~0,5B (p. ej. variantes Qwen-VL pequeñas) | ~0,5B | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al modelo base porque la información proporcionada no incluye resultados de terceros en el mismo split. No se han publicado en esta ficha resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) para este checkpoint.

## Limitaciones y advertencias

- Modelo experimental de investigación: no es un modelo de propósito general y su uso previsto es el estudio de variantes de atención y destilación.
- Solo se evalúa en ScienceQA (subconjunto con imágenes STEM, validación); no hay evidencia de generalización a otras tareas o dominios.
- Los resultados (65,62 % accuracy, 2,16 PPL) están declarados por el autor y marcados como `verified: false`; no han sido reproducidos de forma independiente.
- Idioma limitado al inglés; no se documenta rendimiento en castellano ni en otros idiomas.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas.
- Dependencia del framework NeuralOps y del modelo base: el checkpoint no es autónomo y requiere `load_surgeried_model` para reconstruirse.
- Riesgo de alucinación inherente a un VLM de 0,5B, agravado por el dominio científico donde las respuestas incorrectas pueden parecer plausibles.
- Sesgos no documentados por el autor; al entrenarse sobre ScienceQA, puede heredar sesgos del dataset y del profesor.
- Licencia MIT permite uso comercial, pero la ausencia de benchmarks fuera de ScienceQA desaconseja su uso en producción sin validación adicional.
- Sin soporte documentado de tool calling, agentes o cuantización, lo que limita su integración en pipelines estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-padre-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de PADReAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/padre_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA

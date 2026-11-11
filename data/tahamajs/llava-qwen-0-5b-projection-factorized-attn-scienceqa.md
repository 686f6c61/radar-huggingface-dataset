# tahamajs/llava-qwen-0.5b-projection-factorized-attn-scienceqa

## Resumen

`llava-qwen-0.5b-projection-factorized-attn-scienceqa` es un checkpoint derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, un modelo vision-lenguaje (VLM) de 0,5 mil millones de parametros en el decodificador, publicado por el autor `tahamajs` dentro del marco NeuralOps "Attention Surgery Zoo". El modelo aplica una cirugia de atencion basada en descomposicion SVD (`projection_factorized_attn`) sobre 18 de las 24 capas del decodificador Qwen2, sustituyendo la atencion cuadratica estandar por una variante lineal factorizada, y entrena posteriormente esos modulos mediante destilacion de conocimiento sobre ScienceQA.

El proposito del checkpoint no es tanto servir como VLM de proposito general, sino documentar y validar empiricamente el operador `ProjectionFactorizedAttention` dentro de una familia de experimentos de compresion de atencion. El artefacto resultante pesa 80,71 MB en safetensors FP16 (frente a 1,66 GB del base completo), lo que supone una reduccion del 95,3 % en el delta de pesos guardado.

Es relevante ahora porque demuestra que es posible destilar parcialmente un VLM pequeno tras cirugia de atencion, recuperando 20,63 puntos de exactitud sobre el estado zero-shot (31,87 % → 52,50 %) con solo 293 pasos de optimizacion y 120,5 segundos en una RTX 3090, manteniendo una perplejidad cercana a la del profesor (2,64 frente a 2,45).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower congelado + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas, D=1024, H=16, head_dim=64), con atencion factorizada SVD en 18/24 capas |
| Parametros totales | no disponible (el decodificador base Qwen2-0.5B ronda 0,5 B; el repo solo publica el delta de atencion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, formato `attention_only_fp16`, 426 tensores) |

## Arquitectura y entrenamiento

La base es LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP congelada de 27 capas, un proyector multi-modal MLP de 2 capas y un decodificador Qwen2 de 24 capas con dimension oculta 1024, 16 cabezas y head_dim 64. Sobre esa base, NeuralOps sustituye la auto-atencion en 18 de las 24 capas del decodificador por `ProjectionFactorizedAttention`, un operador de la familia SVD que factoriza las proyecciones Q/K/V mediante descomposicion en valores singulares para aproximar la atencion con coste lineal. Se conservan seis capas "ancla" cuadraticas en los indices `[3, 7, 11, 15, 19, 23]` bajo una politica `hybrid_3_1`, y se congelan la torre visual, el proyector, los MLP y los embeddings del decodificador.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas (132 + 161 pasos, 293 en total) ejecutada con la arquitectura de cache offline de representaciones de NeuralOps, que permite mantener al profesor fuera de la VRAM de la GPU (0 MB de VRAM de profesor). Solo se entrenan los modulos de atencion modificados y los layernorms del decodificador. La ejecucion completa dura 120,5 s en una RTX 3090 con un pico de 16 226 MB de VRAM. El resultado se serializa de forma determinista como delta de atencion FP16 con manifiesto `neuralops.surgery/v2`.

## Capacidades

- Generacion de texto condicionada por imagen (pipeline `image-text-to-text`) orientada a razonamiento visual sobre contenido STEM.
- Respuesta a preguntas visuales de opcion multiple y formato conversacional, tal como se evalua en ScienceQA.
- Razonamiento multimodal basico sobre diagramas y figuras cientificas del subconjunto con imagen de ScienceQA.
- Soporte de plantilla de chat (`chat_template.json`) para interaccion multi-turno.
- Capacidades multilingues limitadas al ingles (`language: en`).
- No se documentan tool calling, function calling, modo thinking, audio ni capacidades de agente multi-paso en la informacion disponible.
- Al ser un delta de atencion, requiere cargarse junto al checkpoint base mediante la API `neuralops.hub.load_surgeried_model`; no es un modelo autonomo completo.

## Casos de uso

- Investigacion en compresion de atencion: sirve como referencia reproducible para medir el coste en calidad de sustituir atencion cuadratica por variantes SVD lineal en un VLM pequeno, con metricas de exactitud y perplejidad ya registradas.
- Experimentos de destilacion de bajo presupuesto: el flujo de 293 pasos en 120,5 s sobre una RTX 3090 permite iterar rapidamente sobre politicas de capas ancla (`hybrid_3_1`) sin necesidad de GPUs de datacenter.
- Evaluacion comparativa de operadores de atencion: al publicarse como delta con manifiesto `surgical_manifest.json`, se puede emparejar con otros checkpoints del zoo para comparar familias de operadores sobre el mismo base.
- Docencia y demos de cirugia de modelos: la separacion explicita entre componentes congelados y modificados facilita explicar que partes de un VLM contribuyen a la calidad final.
- Benchmarking de VQA cientifica: util para reproducir la evaluacion sobre el subconjunto con imagen de ScienceQA (validation) y contrastar con el profesor (63,75 % de exactitud).
- Prototipado de pipelines multimodales ligeros: el delta de 80,71 MB reduce el almacenamiento y la transferencia en entornos con recursos limitados, siempre que se disponga del base de 1,66 GB para la carga completa.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`), sobre ScienceQA (Image-Bearing STEM Subset, validation):

| Metrica | Profesor (base) | Zero-shot tras cirugia | Final tras destilacion | Delta |
|---|---:|---:|---:|---:|
| Exactitud (%) | 63,75 | 31,87 | 52,50 | +20,63 |
| Perplejidad (PPL) | 2,45 | 583,14 | 2,64 | -580,50 |

Telemetria de entrenamiento declarada: 293 pasos (etapa 1: 132, etapa 2: 161), 120,5 s de duracion, pico de 16 226 MB de VRAM en una RTX 3090 (24 GB), 0 MB de VRAM de profesor.

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el delta de atencion pesa 80,71 MB en FP16, pero la carga completa requiere el base `llava-interleave-qwen-0.5b-hf` (1,66 GB en FP16) mas la torre SigLIP y el proyector.
- GPU recomendadas: no disponible; el autor documenta entrenamiento en NVIDIA GeForce RTX 3090 (24 GB) con 16 226 MB de pico.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con al menos 8-12 GB para el modelo completo en FP16, aunque no se publican cifras de inferencia medidas.
- Opciones de despliegue: la via documentada es `neuralops.hub.load_surgeried_model` con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-projection-factorized-attn-scienceqa` | ~0,5 B (decodificador) | no disponible | 52,50 % exactitud, PPL 2,64 | MIT | Hugging Face, delta de atencion |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5 B | no disponible | 63,75 % exactitud, PPL 2,45 | no disponible en la informacion | Hugging Face, checkpoint completo |
| Otros checkpoints del Attention Surgery Zoo de NeuralOps | no disponible | no disponible | no disponible | MIT (segun repo) | Hugging Face |

La comparativa con alternativas externas de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint es un delta de atencion parcial: no funciona de forma autonoma y exige el base `llava-hf/llava-interleave-qwen-0.5b-hf` y la libreria `neuralops`.
- La exactitud final (52,50 %) queda 11,25 puntos por debajo del profesor (63,75 %), por lo que la cirugia de atencion introduce una perdida de calidad no despreciable.
- Los resultados de benchmarks estan marcados como no verificados (`verified: false`); proceden del autor y no de una evaluacion independiente.
- El modelo esta entrenado y evaluado solo sobre ScienceQA en ingles; no hay evidencia de generalizacion a otras tareas visuales ni a otros idiomas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero inherentes a un VLM pequeno destilado sobre un unico dataset STEM.
- La licencia MIT se declara en la model card con enlace al LICENSE del repositorio NeuralOps; conviene verificar los terminos del modelo base antes de uso comercial.
- No se documentan longitudes de contexto, cuantizaciones ni opciones de despliegue en produccion; cualquier uso en produccion requeriria validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-projection-factorized-attn-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/projection_factorized_attn.py
- Licencia MIT del repositorio: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA

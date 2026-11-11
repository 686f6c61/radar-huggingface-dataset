# tahamajs/llava-qwen-0.5b-compressed-mha-attention-scienceqa

## Resumen

`llava-qwen-0.5b-compressed-mha-attention-scienceqa` es un modelo visión-lenguaje (VLM) publicado por Taha Majlesi (usuario `tahamajs`) dentro del proyecto NeuralOps, un "attention surgery zoo" que experimenta con la sustitución de mecanismos de atención en modelos existentes. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (codificador visual SigLIP + proyector MLP + decodificador Qwen2 de 24 capas con dimensión 1024 y 16 cabezas) y reemplaza 18 de sus 24 bloques de atención por un operador denominado `compressed_mha_attention` (`CompressedDistilBertAttention`), basado en descomposición SVD truncada conjunta.

El objetivo no es tanto ofrecer un VLM de propósito general como demostrar que es posible transplantar mecanismos de atención subcuadráticos en un VLM multimodal y recuperar calidad mediante destilación de conocimiento. Tras un proceso de destilación en dos etapas sobre el subconjunto con imagen de ScienceQA, el modelo pasa de un 33,79 % de precisión visual en zero-shot a un 44,83 %, frente al 46,90 % del modelo profesor original.

Es relevante ahora porque documenta de forma reproducible (pesos de atención de 405,22 MB en FP16, telemetría de entrenamiento y código de "cirugía") cómo aislar el efecto de un cambio arquitectónico en la atención manteniendo congelados el torreón visual y el proyector multimodal. El repositorio es pequeño (0,4 GB) y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo LLaVA: codificador visual SigLIP congelado + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, d_h=64) con 18/24 bloques de atención sustituidos por `compressed_mha_attention` (SVD) y 6 capas ancla cuadráticas [3, 7, 11, 15, 19, 23] |
| Parametros totales | no disponible (el modelo base es de 0,5B; el repo solo publica pesos de atención de 405,22 MB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16) + configs de processor y tokenizer |

## Arquitectura y entrenamiento

El modelo es un `LlavaForConditionalGeneration` en el que los tokens de parche visual extraídos por el torreón SigLIP se intercalan con tokens de texto dentro de `language_model.model.layers`. La "cirugía" sustituye 18 de las 24 capas de atención del decodificador por `CompressedDistilBertAttention`, un operador de atención multi-cabeza comprimida mediante SVD truncada conjunta (familia `svd` del registro `ATTENTION_REGISTRY` de NeuralOps, clave `compressed_mha_attention`). El patrón `hybrid_3_1` mantiene seis capas con atención cuadrática estándar como anclas. El torreón visual y el proyector multimodal permanecen completamente congelados, de modo que el experimento aísla la capacidad del mecanismo subcuadrático para manejar el enrutamiento denso visión-texto.

El entrenamiento es una destilación de conocimiento en dos etapas (55 + 100 pasos, 155 en total) sobre las preguntas con imagen de `derek-thomas/ScienceQA`. La ejecución completa duró 120,4 s con un pico de 17 376 MB de VRAM en una NVIDIA RTX 3090 de 24 GB. No se detalla la composición exacta del dataset ni si hubo RLHF o DPO; el proceso descrito es exclusivamente destilación supervisada sobre el profesor.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) y respuesta a preguntas visuales.
- Razonamiento multimodal básico sobre diagramas y figuras científicas del dominio ScienceQA.
- Conversación multi-turno en formato LLaVA (pipeline `conversational`).
- Capacidad multilingüe limitada al inglés (`en`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No dispone de modo "thinking", audio ni vídeo; solo imagen y texto.
- El modelo se distribuye como parche de atención sobre el base: requiere aplicar la cirugía y cargar los pesos con `strict=False`.

## Casos de uso

- Investigación sobre atención eficiente en VLMs: sirve como banco de pruebas reproducible para medir el impacto de sustituir atención cuadrática por SVD comprimida manteniendo congelado el torreón visual, con métricas de precisión y perplejidad ya publicadas.
- Evaluación comparativa de mecanismos de atención: al publicar pesos de atención aislados (405,22 MB) y el script `apply_qwen_attention_surgery`, permite a un equipo reproducir el experimento y comparar `compressed_mha_attention` con otras variantes del zoo sobre el mismo base.
- Docencia y divulgación sobre destilación de conocimiento: el delta documentado (33,79 % → 44,83 % en precisión visual tras 155 pasos de KD) es un ejemplo concreto y de bajo coste (120,4 s en una RTX 3090) para explicar KD en modelos multimodales.
- Prototipado rápido de VQA educativa: con 0,5B de parámetros y un repo de 0,4 GB, se puede desplegar en una GPU de consumo para experimentar con preguntas sobre imágenes de ciencias, asumiendo la precisión limitada (~45 % en ScienceQA).
- Validación de pipelines de "attention surgery": útil para verificar que un flujo de carga de pesos parciales (`strict=False`), aplicación de cirugía y evaluación funciona antes de escalar a modelos mayores del mismo zoo.
- Baseline para experimentos de compresión: la perplejidad de 2,90 y la precisión de 44,83 % sirven como referencia frente a la que medir variantes con más o menos capas comprimidas o distintos patrones híbridos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre `derek-thomas/ScienceQA`, split de validación, subconjunto con imagen:

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Zero-shot pre-KD | Post-KD destilado | Delta |
|---|---:|---:|---:|---:|
| Precision visual ScienceQA (%) | 46,90 | 33,79 | 44,83 | +11,04 |
| Perplejidad de respuesta condicionada por imagen | 3,85 | 3246,29 | 2,90 | -3243,39 |

Telemetría del entrenamiento: 155 pasos de optimización (etapa 1: 55; etapa 2: 100), 120,4 s de duración total, pico de 17 376 MB de VRAM en una NVIDIA RTX 3090 de 24 GB, marca temporal 2026-11-11T03:16:57Z.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el pico durante el entrenamiento fue de 17 376 MB en una RTX 3090, por lo que la inferencia en FP16 debería caber holgadamente en 24 GB y probablemente en GPUs de 16 GB.
- GPU recomendadas: NVIDIA RTX 3090 (usada en el entrenamiento), A100, H100 para despliegues con mayor concurrencia; RTX 4090 como opción de consumo de gama alta.
- Cabe en GPU de consumo: sí, con toda probabilidad en RTX 3090/4090 y posiblemente en GPUs de 16 GB en FP16; no se confirman requisitos para 8 GB.
- Opciones de despliegue: el repo usa la librería `neuralops` junto con `transformers` (`LlavaForConditionalGeneration`, `AutoProcessor`) y `safetensors`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA visual (acc.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-compressed-mha-attention-scienceqa` | ~0,5B (base) | no disponible | 44,83 % (post-KD, no verificado) | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 46,90 % | no disponible en la informacion | Hugging Face |
| Otras variantes del zoo NeuralOps | no disponible | no disponible | no disponible | MIT (repo NeuralOps) | Hugging Face / GitHub |

No se dispone de datos de otros VLMs comparables (por ejemplo, variantes LLaVA de mayor tamaño o modelos como Qwen2-VL) en la información proporcionada, por lo que la comparativa se limita al modelo base y a las variantes del mismo zoo.

## Limitaciones y advertencias

- Precisión limitada: 44,83 % en ScienceQA visual, por debajo del profesor (46,90 %) y lejos de VLMs de mayor tamaño; no es adecuado para producción de alta exigencia.
- Dominio restringido: entrenado solo sobre el subconjunto con imagen de ScienceQA; el rendimiento fuera de ese dominio no está evaluado.
- Idioma: únicamente inglés.
- Los resultados del model-index están marcados como `verified: false`; son cifras declaradas por el autor y no reproducidas de forma independiente.
- El modelo no se distribuye como pesos completos: requiere el base `llava-hf/llava-interleave-qwen-0.5b-hf` y la aplicación de la cirugía de atención mediante código de NeuralOps, lo que añade dependencias y complejidad de despliegue.
- Riesgo de alucinación inherente a los VLMs de pequeño tamaño, especialmente en preguntas que requieren razonamiento visual fino.
- No se documentan sesgos específicos ni evaluaciones de seguridad.
- Licencia MIT, que permite uso comercial, pero el modelo base y el código de NeuralOps deben verificarse por separado antes de un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-compressed-mha-attention-scienceqa
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación de `compressed_mha_attention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/compressed_mha_attention.py
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset: https://huggingface.co/datasets/derek-thomas/ScienceQA

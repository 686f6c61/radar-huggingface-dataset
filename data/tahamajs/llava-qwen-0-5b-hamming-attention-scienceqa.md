# tahamajs/llava-qwen-0.5b-hamming-attention-scienceqa

## Resumen

`tahamajs/llava-qwen-0.5b-hamming-attention-scienceqa` es un checkpoint experimental de visión-lenguaje publicado por el desarrollador tahamajs dentro de su proyecto NeuralOps. No es un modelo entrenado desde cero, sino el resultado de una "cirugía de atención" sobre `llava-hf/llava-interleave-qwen-0.5b-hf`: se sustituye el mecanismo de self-attention cuadrático en 18 de las 24 capas del decoder Qwen2 por un operador disperso denominado HammingAttention, manteniendo seis capas ancla con atención cuadrática estándar (esquema `hybrid_3_1`). El objetivo declarado es la compresión y el estudio de operadores de atención alternativos, no la obtención de un modelo de propósito general.

El modelo conserva la torre visual SigLIP congelada (27 capas) y el proyector MLP de dos capas del LLaVA original, y solo se serializan los pesos modificados de atención más las layernorms del decoder entrenadas. El artefacto en disco ocupa 147,62 MB frente a los 1,66 GB del base en FP16, una reducción del 91,3 %. La evaluación se limita a ScienceQA (subconjunto con imagen, validación), donde alcanza un 41,88 % de accuracy y una perplejidad de 3,16 tras destilación de conocimiento.

Su relevancia es acotada pero clara: sirve como referencia reproducible para investigadores que estudian atención dispersa, destilación de operadores y técnicas de compresión de VLMs pequeños. No está pensado para despliegue en producción ni para tareas fuera del dominio STEM con imagen, y su licencia MIT facilita la reutilización del código y los pesos quirúrgicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decoder Qwen2 de 24 capas) con atencion dispersa HammingAttention en 18/24 capas |
| Parametros totales | no disponible (el base LLaVA-Qwen-0.5B ronda los 0,5B; el checkpoint solo serializa 147,62 MB de pesos quirurgicos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 en los pesos serializados; no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`) + manifiesto quirurgico JSON |

## Arquitectura y entrenamiento

La arquitectura parte de `llava-hf/llava-interleave-qwen-0.5b-hf`: torre visual SigLIP de 27 capas congelada, proyector MLP de dos capas y decoder Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y `head_dim` de 64. Sobre esta base se aplica una sustitución selectiva: 18 de las 24 capas del decoder (y del encoder visual, según el manifiesto) pasan a usar HammingAttention, un operador de la familia `sparse` registrado en NeuralOps como `neuralops/layers/sparse/hamming_attention.py`. Las seis capas restantes `[3, 7, 11, 15, 19, 23]` se mantienen como anclas cuadráticas, configurando un patrón híbrido 3:1. Solo se entrenan y guardan las self-attentions modificadas y las layernorms del decoder; los MLP, embeddings, proyector y torre visual permanecen congelados y no se incluyen en el artefacto.

El entrenamiento consiste en una destilación de conocimiento en dos etapas (80 + 133 pasos, 213 en total) ejecutada en una única RTX 3090 de 24 GB durante 120,4 segundos, con un pico de VRAM de 19.877 MB. El profesor es el modelo base sin modificar. Los resultados reportados muestran que la perplejidad pasa de 170,75 en zero-shot a 3,16 tras la destilación, mientras que la accuracy en ScienceQA se mantiene en 41,88 % (idéntica al valor pre-KD), frente al 63,75 % del profesor. No se documentan detalles sobre el dataset de destilación más allá de `derek-thomas/ScienceQA`, ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en inglés.
- Respuesta a preguntas visuales de tipo STEM con selección de opción múltiple (formato ScienceQA).
- Razonamiento visual básico sobre figuras y diagramas científicos.
- Conversación multi-turno mediante plantilla de chat incluida (`chat_template.json`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documentan capacidades de audio, vídeo ni thinking mode.
- Capacidad multilingüe limitada al inglés según el campo `language`.

## Casos de uso

- Investigación en atención dispersa: el checkpoint permite reproducir el experimento de sustituir atención cuadrática por HammingAttention en un VLM pequeño y comparar perplejidad y accuracy frente al profesor, usando el manifiesto quirúrgico para auditar qué capas se modificaron.
- Estudio de destilación de operadores: sirve como caso de referencia para medir cuánto se recupera de perplejidad (de 170,75 a 3,16) con solo 213 pasos de KD en una GPU de consumo.
- Benchmark de compresión de artefactos: útil para evaluar técnicas de serialización selectiva que reducen el peso en disco un 91,3 % respecto al base, relevante en entornos con almacenamiento o ancho de banda restringidos.
- Pruebas de pipelines NeuralOps: el `Quick Start` con `neuralops.hub.load_surgeried_model` permite validar la API pública del hub y la carga de pesos quirúrgicos en integraciones CI.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención en un VLM de 0,5B que cabe en una RTX 3090 y se entrena en dos minutos.
- Evaluación comparativa en ScienceQA: sirve como baseline de un modelo con atención dispersa frente al LLaVA-Qwen-0.5B original en el subconjunto con imagen, para estudiar la brecha de accuracy (41,88 % vs 63,75 %).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados por un tercero):

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (image-bearing STEM, validation) | 63,75 | 41,88 | 41,88 | +0,00 |
| Perplejidad en ScienceQA (image-bearing STEM, validation) | 2,45 | 170,75 | 3,16 | -167,59 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el autor reporta un pico de 19.877 MB durante el entrenamiento en una RTX 3090 de 24 GB; la inferencia con el modelo completo (base + pesos quirúrgicos) debería caber holgadamente en 24 GB en FP16, aunque no se publica una medición específica de inferencia.
- GPU recomendadas: RTX 3090 (la usada en el entrenamiento), A100, H100 para despliegues con mayor concurrencia; cualquier GPU con al menos 24 GB para FP16.
- Cabe en GPU de consumo: sí, al menos en RTX 3090; no se documenta comportamiento en GPUs de 16 GB o menos.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos quirúrgicos probablemente no sea compatible directamente con esos motores sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, image-bearing) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-hamming-attention-scienceqa` | ~0,5B (solo 147,62 MB serializados) | no disponible | 41,88 % accuracy / 3,16 PPL | MIT | Hugging Face, requiere `neuralops` |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 63,75 % accuracy / 2,45 PPL | no disponible en la informacion | Hugging Face, `transformers` |
| Otros VLMs de ~0,5B (p. ej. SmolVLM, Qwen2-VL-2B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al par profesor-alumno porque la información proporcionada no incluye datos de benchmarks de otros VLMs pequeños. La diferencia principal es la reducción de tamaño del artefacto (11,53x menor) a costa de una caída de 21,87 puntos de accuracy.

## Limitaciones y advertencias

- La accuracy final (41,88 %) es idéntica a la pre-KD, lo que sugiere que la destilación solo corrigió la perplejidad y no mejoró la capacidad de razonamiento visual; la brecha con el profesor es de 21,87 puntos.
- El modelo solo se ha evaluado en ScienceQA (subconjunto con imagen, validación); no hay evidencia de generalización a otras tareas visuales.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Longitud de contexto no documentada, lo que impide planificar usos con entradas largas.
- Riesgo de alucinación no cuantificado; el modelo es un VLM de 0,5B con atención dispersa y no se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles; al derivar de LLaVA-Qwen hereda los sesgos del dataset de instrucciones original, no auditados aquí.
- La licencia MIT permite uso comercial, pero la model card no incluye garantías ni evaluación de seguridad; no se recomienda su uso en producción sin validación adicional.
- Requiere la librería `neuralops` y su API `load_surgeried_model`; no es cargable directamente con `transformers` estándar.
- El checkpoint solo contiene los pesos quirúrgicos (147,62 MB); es necesario descargar el modelo base para reconstruir el modelo completo.
- El tamaño del repo (0,2 GB) y las 0 descargas indican que es un artefacto de investigación reciente, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-hamming-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de HammingAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/hamming_attention.py
- Licencia MIT: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA

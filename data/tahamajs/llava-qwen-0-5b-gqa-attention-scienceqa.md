# tahamajs/llava-qwen-0.5b-gqa-attention-scienceqa

## Resumen

llava-qwen-0.5b-gqa-attention-scienceqa es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una tecnica de "attention surgery" implementada en la libreria NeuralOps. El autor, tahamajs, sustituye el mecanismo de atencion en 18 de las 24 capas del decoder Qwen2 por un operador Grouped-Query Attention (GQA) propio, manteniendo congelados el vision tower SigLIP, el proyector MLP y seis capas de atencion cuadratica que actuan como anclas. El resultado se afina por destilacion de conocimiento sobre el subconjunto con imagenes de ScienceQA.

El modelo resuelve un problema acotado: demostrar que es posible reemplazar la atencion estandar de un VLM compacto por una variante GQA optimizada en memoria (KV-cache aware, acelerada con SDPA) sin degradar el rendimiento en razonamiento visual STEM, e incluso mejorandolo tras la destilacion. Con unos 0,5 mil millones de parametros en el decoder y un artefacto de pesos de solo 147,61 MB (frente a 1,66 GB del base completo en FP16), esta pensado como banco de pruebas para investigacion en eficiencia de atencion y compresion de modelos.

Es relevante ahora porque los VLM pequenos con atencion eficiente son candidatos naturales para despliegue en el borde y para experimentacion reproducible en una sola GPU de consumo. No obstante, se trata de un checkpoint de investigacion con cero descargas y sin verificar, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (vision tower SigLIP congelado + proyector MLP de 2 capas + decoder Qwen2 de 24 capas con atencion GQA quirurgica) |
| Parametros totales | no disponible (decoder de ~0,5B segun el modelo base; el artefacto guardado es un delta de 147,61 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirurgico en FP16) |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: un vision tower SigLIP congelado de 27 capas, un proyector MLP de 2 capas y un decoder Qwen2 de 24 capas con dimension oculta D=1024, 16 cabezas y head_dim=64. La intervencion quirurgica reemplaza el modulo `self_attn` en 18 de las 24 capas del decoder por el operador `GroupedQueryAttention` de NeuralOps (familia "modern", con soporte de KV-cache y SDPA). Las seis capas restantes, en los indices [3, 7, 11, 15, 19, 23], conservan atencion cuadratica como anclas (esquema `hybrid_3_1`). Tambien se entrenan las layernorms del decoder; quedan congelados el vision tower, el proyector, los MLP y los embeddings.

El ajuste se realizo mediante destilacion de conocimiento en dos etapas (84 + 140 pasos, 224 en total) sobre el subconjunto con imagenes de ScienceQA, en una unica RTX 3090 de 24 GB, con 120,6 segundos de entrenamiento y un pico de VRAM de 17.886 MB. El punto de partida zero-shot tras la cirugia caia a 32,50% de accuracy y perplejidad 5,12; tras la destilacion alcanza 65,00% de accuracy y 2,14 de perplejidad, superando al profesor original (63,75% y 2,45). No se documentan detalles sobre el volumen total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto e image-text-to-text: responde preguntas en formato conversacional dado un par imagen-texto.
- Razonamiento visual STEM: entrenado y evaluado especificamente en preguntas de ciencia con soporte de imagen (ScienceQA), incluyendo seleccion de respuesta por letra de opcion.
- Comprension de figuras y diagramas cientificos en el dominio cubierto por ScienceQA.
- Formato de chat mediante plantilla conversacional incluida (`chat_template.json`).
- Capacidad multilingue limitada al ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision avanzada, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion en eficiencia de atencion: sirve como referencia reproducible para comparar GQA quirurgico frente a atencion cuadratica en un VLM pequeno, con manifiesto de topologia (`surgical_manifest.json`) y metricas de entrenamiento incluidas.
- Destilacion de conocimiento sobre VLMs compactos: el par de etapas (pre-KD y post-KD) documentado permite replicar el protocolo en otros dominios o datasets.
- Evaluacion de compresion de artefactos: con 147,61 MB de delta frente a 1,66 GB del base en FP16 (reduccion del 91,3%), es util para estudiar tecnicas de empaquetado selectivo de pesos.
- Prototipado de asistentes educativos en ciencias: puede responder preguntas de opcion multiple sobre figuras STEM en ingles, como base para demos de tutoria automatica.
- Despliegue en hardware de consumo para pruebas: el pico de 17,9 GB de VRAM durante el entrenamiento en una RTX 3090 sugiere que la inferencia de un modelo de 0,5B es viable en GPUs consumer, aunque no se publican cifras de latencia.
- Benchmarking de pipelines NeuralOps: el ejemplo de carga via `neuralops.hub.load_surgeried_model` permite integrar el checkpoint en pruebas de humo de la libreria.
- Ablacion de capas ancla: la seleccion de seis capas cuadraticas permite experimentar con el equilibrio entre eficiencia y calidad de atencion.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagenes STEM, split de validacion:

| Metrica | Profesor (base) | Zero-shot tras cirugia | Final tras destilacion |
|---|---:|---:|---:|
| Accuracy (%) | 63,75 | 32,50 | 65,00 |
| Perplejidad | 2,45 | 5,12 | 2,14 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento completo cupo en una RTX 3090 con un pico de 17.886 MB, por lo que la inferencia de un decoder de 0,5B deberia ser muy inferior.
- GPU recomendadas: RTX 3090 (validada por el autor para el ajuste); GPUs consumer de gama media-alta son plausibles para inferencia, aunque no se documentan pruebas.
- Cabe en GPU consumer: si, segun el hardware de entrenamiento reportado; no hay cifras de inferencia publicadas.
- Opciones de despliegue: carga via `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-gqa-attention-scienceqa | ~0,5B (decoder) | no disponible | 65,00% accuracy en ScienceQA (no verificado) | MIT | Hugging Face, 0 descargas |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | ~0,5B | no disponible | 63,75% accuracy en el mismo protocolo (segun el autor) | no disponible en la informacion | Hugging Face |
| Otros VLM compactos (p. ej. familia SmolVLM) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas adicionales de la misma categoria.

## Limitaciones y advertencias

- Checkpoint de investigacion con cero descargas y metricas marcadas como no verificadas (`verified: false`); no debe tratarse como modelo listo para produccion.
- Entrenado y evaluado unicamente en ScienceQA (subconjunto STEM con imagenes), por lo que su rendimiento fuera de ese dominio es desconocido y probablemente pobre.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Riesgo de alucinacion no cuantificado; al ser un modelo de 0,5B, la fiabilidad en razonamiento abierto es limitada.
- Longitud de contexto no documentada, lo que impide planificar conversaciones largas o documentos extensos.
- El artefacto publicado es un delta quirurgico, no un modelo autonomo: requiere la libreria NeuralOps y el modelo base para cargarse.
- Sesgos conocidos: no documentados por el autor.
- Licencia MIT permite uso comercial, pero la ausencia de evaluacion fuera del benchmark y de garantias de calidad desaconseja su uso en produccion sin validacion propia.
- No se documenta soporte de tool calling, agentes ni cuantizacion, lo que limita su integracion en pipelines estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-gqa-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador GQA: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/gqa_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA

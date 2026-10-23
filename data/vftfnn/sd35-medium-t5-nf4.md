# vftfnn/sd35-medium-t5-nf4

## Resumen

`vftfnn/sd35-medium-t5-nf4` es un artefacto de pesos, no un modelo generativo de texto: se trata del codificador T5 v1.1 XXL (`text_encoder_3`) que Stable Diffusion 3.5 Medium utiliza para procesar el prompt, cuantizado a 4 bits con el esquema NF4 de bitsandbytes. Lo publica el usuario `vftfnn` partiendo de los pesos originales de Google (`google/t5-v1_1-xxl`, licencia Apache-2.0) y mantiene el cómputo en fp16, con la proyección de salida `wo` en fp32 para limitar la degradación numérica.

El problema que resuelve es de huella de memoria: el codificador T5 XXL en bf16 ocupa del orden de 9-10 GB, lo que lo convierte en el componente más pesado del pipeline de SD 3.5 Medium y bloquea su ejecución en GPUs de consumo. Con NF4, los pesos bajan a unos 2,4 GB teóricos, de modo que el pipeline completo (T5 + CLIP-L + OpenCLIP bigG + el transformer MMDiT) puede caber en tarjetas de 12-16 GB. El repo ocupa 6,3 GB en disco y declara 4.762.310.656 parámetros en safetensors.

Es relevante ahora porque SD 3.5 Medium es una de las bases abiertas más usadas para generación de imagen local y cualquier recorte de VRAM en su codificador de texto amplía el parque de hardware compatible. Conviene subrayar que el repositorio no documenta benchmarks, idiomas soportados ni el impacto cualitativo de la cuantización en la adherencia al prompt.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer T5 v1.1 en variante solo-codificador (`T5EncoderModel`), usado como `text_encoder_3` de Stable Diffusion 3.5 Medium |
| Parámetros totales | 4.762.310.656 (según safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NF4 4 bits con bitsandbytes; cómputo en fp16; proyección `wo` mantenida en fp32 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 6,3 GB) |
| Modelo base | google/t5-v1_1-xxl |
| Librería | transformers |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura es la del codificador de T5 v1.1, un transformer con atención completa y sesgo posicional relativo en lugar de embeddings posicionales absolutos. En este repo se han eliminado el decodificador y la cabeza de generación: el objeto cargable es `T5EncoderModel`, que devuelve estados ocultos por token para condicionar el transformer de difusión. Por tanto no hay decodificación autorregresiva ni `lm_head`, y el modelo no puede generar texto pese a la etiqueta `text-generation-inference` que aparece en los tags del repo.

No se ha realizado entrenamiento nuevo: los pesos son los de Google T5 v1.1 XXL y la única transformación es la cuantización NF4 de bitsandbytes a 4 bits, con activaciones y cómputo en fp16 y la proyección `wo` preservada en fp32. La model card no documenta el número de tokens, la composición del dataset ni si hubo RLHF/DPO, y tampoco detalla si se aplicó doble cuantización de los escalares. El uso previsto, según el autor, es cargarlo con `T5EncoderModel.from_pretrained(repo, device_map={'': 'cuda:0'})` y pasarlo como `text_encoder_3` a `StableDiffusion3Pipeline`.

## Capacidades

- Codificación de prompts de texto a embeddings condicionantes para Stable Diffusion 3.5 Medium (sustituye al `text_encoder_3` original).
- Producción de `last_hidden_state` por token, consumible por el pipeline de Diffusers tal cual.
- Reducción de huella de memoria frente al codificador en bf16 (pesos ~2,4 GB teóricos frente a ~9-10 GB).
- Carga con `device_map` de transformers, incluida la posibilidad de fijar dispositivo explícito.
- No genera texto: carece de decodificador y de cabeza de lenguaje.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un LLM conversacional.
- No tiene modo thinking, visión ni audio.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Generación de imagen en GPUs de consumo: al sustituir el codificador T5 en bf16 por esta versión NF4, el pipeline SD 3.5 Medium libera varios GB de VRAM y puede ejecutarse en tarjetas de 12-16 GB junto a CLIP-L y OpenCLIP bigG.
- Prototipado en cuadernos y entornos de investigación: cargar el codificador cuantizado con `device_map` permite iterar sobre prompts y seeds en máquinas de un solo GPU sin recurrir a offloading a CPU.
- Servicios de generación de imágenes autoalojados: el ahorro de VRAM permite aumentar el número de réplicas por nodo o mantener el modelo residente mientras se ejecutan otras tareas.
- Integración en ComfyUI o Diffusers: se puede registrar como encoder alternativo en flujos que ya usan SD 3.5 Medium y comparar resultados frente al encoder bf16.
- Evaluación del impacto de la cuantización: útil como vara de medir para estudiar cuánto degrada NF4 la adherencia al prompt, el renderizado de texto en imagen o la fidelidad en prompts largos.
- Precomputación de embeddings de prompt: generar y cachear condicionantes T5 para lotes grandes de prompts en pipelines por etapas, reduciendo el coste de memoria de la fase de encoding.
- Experimentos de destilación o ajuste fino con el codificador congelado: los pesos NF4 permiten mantener el encoder en memoria junto al modelo de difusión durante el entrenamiento de adaptadores.
- Despliegue en estaciones de trabajo con una sola GPU para demos internas de generación de imagen, donde el coste de calidad frente a bf16 es aceptable a cambio de no comprar hardware de 24 GB o más.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score, adherencia al prompt) ni comparaciones frente al codificador en bf16, y tampoco se han encontrado en la búsqueda web datos específicos de esta cuantización.

## Requisitos de hardware

- VRAM estimada para el codificador: ~2,4 GB solo de pesos NF4 (4,76 B × 0,5 bytes) más escalas de cuantización, la copia fp32 de `wo` y activaciones; en la práctica, una estimación de 3-4 GB con lotes pequeños. Cálculo propio a partir del número de parámetros, no publicado por el autor.
- Espacio en disco: 6,3 GB de repositorio.
- El pipeline completo de SD 3.5 Medium requiere además OpenAI CLIP-L, OpenCLIP bigG y el transformer de difusión, por lo que la VRAM total del sistema es sensiblemente mayor que la del encoder.
- GPU recomendadas para el pipeline completo (estimación): RTX 4090 / RTX 3090 (24 GB) para trabajo cómodo; RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB) como objetivo realista de esta cuantización; A100/H100 para serving por lotes.
- En GPUs de 8-12 GB el encoder cabe, pero el transformer de difusión puede requerir offloading secuencial o fp8.
- Opciones de despliegue: transformers + bitsandbytes (CUDA) y Diffusers con `StableDiffusion3Pipeline`; también integrable en ComfyUI. No hay conversión GGUF publicada, por lo que llama.cpp u Ollama no son aplicables directamente a este repo; TGI no es un backend válido para un codificador sin decodificador.
- Latencia y throughput: no disponibles. La cuantización reduce el coste de memoria y el ancho de banda de lectura de pesos, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión | VRAM aproximada de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vftfnn/sd35-medium-t5-nf4 (este repo) | 4,76 B (encoder) | NF4 4 bits, cómputo fp16 | ~2,4 GB (estimado) | Apache-2.0 | HuggingFace, 0 descargas |
| google/t5-v1_1-xxl (original) | No disponible (encoder + decoder completo) | fp32 | Muy superior a la versión 4 bits | Apache-2.0 | HuggingFace |
| `text_encoder_3` de stabilityai/stable-diffusion-3.5-medium | 4,76 B (mismo encoder T5 XXL) | bf16 | ~9-10 GB (estimado) | Sujeta a la licencia de SD 3.5 Medium | HuggingFace |
| Codificador T5 XXL de Stability AI SD3.5 Large | No disponible | bf16 | No disponible | Sujeta a la licencia de SD 3.5 Large | HuggingFace |

## Limitaciones y advertencias

- No es un modelo de generación de texto: no tiene decodificador ni `lm_head`; la etiqueta `text-generation-inference` del repo es engañosa para este uso.
- Requiere emparejarse obligatoriamente con Stable Diffusion 3.5 Medium (o un pipeline que espere exactamente este formato de salida); no es un componente autónomo.
- La cuantización NF4 es intrínsecamente con pérdida: cabe esperar degradación en matices finos del prompt, en la representación de texto dentro de la imagen y en prompts muy largos o con vocabulario poco frecuente. No se han publicado mediciones de esa degradación.
- Requiere bitsandbytes y GPU NVIDIA con CUDA; no hay ruta CPU documentada ni conversión GGUF.
- Idiomas soportados no documentados: verificar el comportamiento multilingüe contra `google/t5-v1_1-xxl` antes de usar prompts en castellano en producción.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de que el codificador produzca condicionantes poco alineados con el prompt y la imagen final ignore instrucciones.
- La licencia Apache-2.0 cubre los pesos T5 de Google, pero el uso conjunto con SD 3.5 Medium queda sujeto a la licencia de Stability AI para ese modelo; revisar ambos términos antes de un uso comercial.
- Repositorio sin adopción (0 descargas, 0 likes) y sin benchmarks: no hay validación externa de que la cuantización funcione correctamente en todos los entornos.
- La model card no detalla la versión de bitsandbytes necesaria ni si se aplicó doble cuantización, lo que puede provocar diferencias de VRAM entre entornos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vftfnn/sd35-medium-t5-nf4
- Modelo base: https://huggingface.co/google/t5-v1_1-xxl
- Stable Diffusion 3.5 Medium: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Repositorio oficial de inferencia SD 3.5: https://github.com/Stability-AI/sd3.5
- README de inferencia SD 3.5: https://github.com/Stability-AI/sd3.5/blob/main/README.md
- Empaquetado alternativo de SD 3.5: https://huggingface.co/cocktailpeanut/sd35
- Ficha de Venice SD35 (despliegue sobre SD 3.5): https://venicestats.com/venice-models/venice-sd35

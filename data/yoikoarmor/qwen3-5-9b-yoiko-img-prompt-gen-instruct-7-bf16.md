# yoikoarmor/Qwen3.5-9B-yoiko-img-prompt-gen-instruct-7-bf16

## Resumen

Qwen3.5-9B-Instruct-7-merged-bf16 es un ajuste fino derivado del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario yoikoarmor y publicado en Hugging Face. No se trata de un lanzamiento oficial de Alibaba Cloud ni del equipo Qwen: es un derivado comunitario que fusiona un adaptador LoRA (identificado como "7", rango 16 y alpha 32) sobre los pesos originales en BF16 sin cuantizar. Su propósito es muy concreto: reescribir peticiones cortas de generación de imágenes en prompts positivos en inglés para Stable Diffusion, controlando de forma deliberada los pesos de atención sintácticos del tipo `(concepto:peso)`.

El modelo conserva la arquitectura del transformer Qwen3.5 de 9B, con 8.953.803.264 parámetros totales según los safetensors del repositorio. Sin embargo, el export elimina el codificador de visión y los componentes multimodales del modelo original: se trata de un modelo estrictamente de texto. El repositorio ocupa 17,9 GB y los pesos BF16 solos rondan los 18 GB, lo que condiciona su despliegue en hardware.

Su relevancia es acotada pero clara para un nicho: ofrece una alternativa abierta (Apache-2.0) y reproducible para la generación de prompts de Stable Diffusion, con un adaptador fusionado que no requiere PEFT en inferencia y con procedencia documentada (SHA-256 del adaptador, revisión exacta del modelo base y registro de validación numérica). Existe además una versión cuantizada Q4_K_M en GGUF publicada por el mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), exportado como `Qwen3_5ForCausalLM`; sin componentes multimodales |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (repositorio principal); GGUF Q4_K_M en repositorio complementario |
| Idiomas soportados | en, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16); GGUF en el repositorio cuantizado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B en la revisión exacta `c202236235762e1c871ad0ccb60c8ee5ba337b9a` y aplica un adaptador LoRA denominado "7" (`07_changed_only_regenerated_user`), seleccionado como el mejor adaptador de evaluación de la época 3, checkpoint 546, con rango 16 y alpha 32. La fusión se realizó con PEFT usando `safe_merge=True` directamente sobre los pesos base en BF16 sin cuantizar, no sobre una versión dequantizada en NF4. El resultado se exportó como `Qwen3_5ForCausalLM` omitiendo el codificador de visión y los componentes multimodales.

La validación documentada es fundamentalmente numérica, no de calidad. Se comprobó que la fusión terminó sin pesos no finitos, que todos los parámetros guardados son BF16 sin módulos LoRA residuales y que la recarga del modelo produce logits y una salida greedy de 128 tokens bit-exactos respecto al modelo fusionado en memoria. También se documenta que la inferencia con el adaptador antes de la fusión y la inferencia fusionada en BF16 no son idénticas: la diferencia máxima absoluta en los logits del siguiente token fue de 0,12890625, con diferencia media de 0,0210571103 y RMSE de 0,0270430148, lo que en ese caso concreto cambió el token top-1. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y soporte de modo thinking desactivable (`enable_thinking=False`).
- Reescritura de peticiones breves de imágenes en prompts positivos en inglés para Stable Diffusion.
- Control deliberado de pesos de atención de Stable Diffusion mediante sintaxis `(frase:peso)`, con instrucciones explícitas sobre rangos (0,8-0,95 para detalles secundarios, 1,1-1,2 para énfasis moderado, 1,25-1,4 para el sujeto central).
- Comprensión de entradas en inglés y japonés (etiquetas de idioma en y ja).
- Generación determinista con decodificación greedy cuando se configura `do_sample=False`.
- No soporta tool calling ni function calling según la información disponible.
- No soporta agentes, razonamiento multi-paso ni capacidades especiales de visión, audio o vídeo: el export elimina explícitamente los componentes multimodales.

## Casos de uso

- Generación de prompts para Stable Diffusion: el modelo recibe una petición corta (por ejemplo, `少年の旅立ち`) y devuelve un prompt positivo en inglés con pesos de atención calibrados según la importancia de cada concepto, listo para pegarse en la interfaz o en un pipeline de `diffusers`.
- Automatización de pipelines de generación de imágenes por lotes: integrado en un script que traduzca y enriquezca descripciones de usuario antes de invocar el modelo de difusión, reduciendo la escritura manual de prompts y manteniendo un estilo consistente.
- Herramienta interna para equipos de diseño: interfaz donde el diseñador escribe una idea breve en japonés o inglés y el modelo produce un prompt estructurado con énfasis controlado, revisable antes de su uso.
- Enseñanza y demostración de técnicas de prompting: sirve como ejemplo práctico de cómo se aplican pesos de atención `(concepto:peso)` y de por qué no conviene asignar un peso constante a todos los conceptos.
- Experimentación con ajuste fino de modelos Qwen3.5: el repositorio documenta la fusión de LoRA con `safe_merge=True` y la validación numérica, lo que lo convierte en una referencia reproducible para quien quiera replicar el proceso.
- Despliegue en entornos con recursos limitados mediante la versión GGUF Q4_K_M: permite ejecutar el modelo con llama.cpp u Ollama en equipos que no pueden alojar los 18 GB de pesos BF16.
- Investigación sobre prompts de difusión: permite comparar sistemáticamente variaciones de peso generadas por el modelo frente a prompts escritos a mano en estudios controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna mejora general de calidad ni puntuación de benchmark; la validación se limita a pruebas numéricas de fusión y a una comprobación de salida greedy con 128 tokens sobre una única entrada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para los pesos, más memoria adicional para el contexto y las activaciones; en la práctica se recomienda al menos 24 GB.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) con margen ajustado.
- En GPU de consumo: cabe en RTX 4090 en BF16 con contexto moderado; para tarjetas de 8-16 GB es necesario recurrir a la versión GGUF Q4_K_M.
- Opciones de despliegue: Transformers 5.3.0 o superior con soporte de `qwen3_5_text` (probado con PyTorch 2.10.0, PEFT 0.18.1 y Accelerate 1.13.0); para el GGUF, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Instruct-7-merged-bf16 | 8.953.803.264 | no disponible | Prompts para Stable Diffusion (ajuste comunitario) | Apache-2.0 | Hugging Face, BF16 y GGUF Q4_K_M |
| Qwen/Qwen3.5-9B (base) | no disponible en la información | no disponible | Modelo generalista multimodal | Apache-2.0 | Hugging Face |
| Versión Q4_K_M del mismo ajuste | no disponible | no disponible | Prompts para Stable Diffusion, cuantizada | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo puede repetir conceptos, reutilizar un peso constante como 1,2 pese a las instrucciones, producir salidas incompletas al alcanzar el límite de tokens o añadir detalles no solicitados; se recomienda revisar los prompts generados antes de usarlos.
- El prompt de sistema es obligatorio en inferencia y no está embebido en los pesos; sin él, el comportamiento esperado no está garantizado.
- La fusión LoRA introduce diferencias numéricas respecto a la inferencia con el adaptador sin fusionar: se documenta una diferencia máxima de logits de 0,12890625 y un cambio en el token top-1 en la validación.
- No se garantiza equivalencia con configuraciones anteriores basadas en NF4 más adaptador; la cuantización y la fusión pueden alterar las salidas.
- El modelo es estrictamente de texto: no admite entradas de imagen o vídeo.
- Los idiomas soportados son inglés y japonés; no se documenta soporte para castellano.
- La procedencia, derechos y composición de los datos de entrenamiento no están establecidos según la model card.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo base es Copyright 2026 Alibaba Cloud y no existe respaldo implícito por parte de Alibaba Cloud ni del equipo Qwen.
- No se han publicado benchmarks de calidad; la validación se limita a pruebas numéricas y a una única entrada de prueba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yoikoarmor/Qwen3.5-9B-yoiko-img-prompt-gen-instruct-7-bf16
- Versión GGUF Q4_K_M: https://huggingface.co/yoikoarmor/Qwen3.5-9B-Instruct-7-GGUF/tree/b34bc0c3e42d9ad91b19f4755b9039c5ec987fbd
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B

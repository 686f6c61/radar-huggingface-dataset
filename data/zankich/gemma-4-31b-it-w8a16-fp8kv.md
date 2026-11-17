# zankich/gemma-4-31B-it-W8A16-FP8KV

## Resumen

`zankich/gemma-4-31B-it-W8A16-FP8KV` es una cuantización del modelo multimodal `google/gemma-4-31B-it` de Google, publicada por el usuario zankich. El checkpoint reduce el peso de ~60 GB en bfloat16 a 33,7 GB mediante pesos INT8 (group size 128, simétrico, weight-only GPTQ) con activaciones en bfloat16 y una caché KV calibrada en FP8 E4M3. Está empaquetado en formato `compressed-tensors` y pensado para servirse con vLLM.

El interés principal de esta ficha es práctico: permite ejecutar un modelo de la familia Gemma 4 con torre de visión en GPUs Ampere (y anteriores a SM100) mediante un fork específico de vLLM que corrige dos problemas de servicio (atención FlashInfer con KV de un byte y atención multimodal). No es un modelo nuevo, sino un artefacto de despliegue: las capacidades, benchmarks y comportamiento general remiten a la model card del modelo base.

La información disponible sobre el modelo base es limitada en esta ficha (no se detallan arquitectura interna, número de tokens de entrenamiento ni resultados de benchmarks), por lo que varios campos se marcan como no disponibles. Los parámetros totales reportados en safetensors son 9.536.844.252, un dato que no coincide con la denominación comercial "31B" y que se reproduce tal cual figura en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión + audio según módulos preservados); detalles internos no disponibles |
| Parametros totales | 9.536.844.252 según safetensors (la denominación del modelo indica 31B; discrepancia no aclarada en la información) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos INT8 W8A16 (group size 128, simétrico, weight-only GPTQ); activaciones bfloat16; KV cache FP8 E4M3 con escalas estáticas por tensor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors en formato `compressed-tensors` (`pack-quantized`), 17 shards, 33,7 GB |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del modelo base `google/gemma-4-31B-it`. Se cuantizaron 410 GEMMs correspondientes a todas las proyecciones de atención y FFN, cubriendo las dos geometrías de atención de Gemma 4: 50 capas de ventana deslizante con 16 cabezas KV y `head_dim` 256, y 10 capas de atención completa con 4 cabezas KV y `head_dim` 512. Se mantienen en bfloat16 el `lm_head`, la torre de visión completa, la proyección de embeddings de visión, los módulos de audio y todos los embeddings de texto, siguiendo la receta oficial de llm-compressor para Gemma 4. La torre de visión también se excluye por una razón de divisibilidad: su MLP tiene 4304 columnas intermedias, no divisible por el group size 128.

La cuantización se generó con llm-compressor 0.13.0 (con un parche propio de `compressed_tensors` 0.18.0) usando `GPTQModifier` con esquema W8A16, `dampening_frac: 0.2` y `actorder: static`. La caché KV se calibró en las mismas pasadas hacia delante mediante `kv_cache_scheme`, generando 120 tensores `k_scale`/`v_scale` (un par por capa, dimensionado según su geometría). El conjunto de calibración consistió en 512 muestras de longitud máxima 2048, con mezcla de turnos de codificación interactiva y código público a nivel de función en Python, TypeScript, Go y shell; el conjunto es privado y no se publica. No se ha publicado ninguna comparación de precisión frente al modelo base en bfloat16.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo base `gemma-4-31B-it`.
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de visión preservada en bfloat16.
- Módulos de audio preservados en bfloat16 en el checkpoint, aunque la información no detalla su funcionamiento en esta cuantización.
- Capacidades de razonamiento y código: el conjunto de calibración se centró en código y agentes, lo que sugiere uso previsto en tareas de programación, aunque no se publican métricas.
- Soporte de tool calling y function calling: no disponible explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el conjunto de calibración incluye turnos de agente de codificación.
- Capacidades multilingües: no disponibles.
- Modos especiales (thinking, visión, audio): visión confirmada por el pipeline; audio y thinking no confirmados para esta cuantización.

## Casos de uso

- Despliegue de un VLM de gran tamaño en GPUs Ampere: el checkpoint permite servir texto e imagen en A100, A10G o RTX 30/40 con vLLM y el fork indicado, reduciendo el peso de ~60 GB a 33,7 GB y evitando la necesidad de GPUs SM100 o superiores.
- Asistentes de codificación con contexto de repositorio: el conjunto de calibración está compuesto de turnos de codificación interactiva y código en Python, TypeScript, Go y shell, por lo que el checkpoint está calibrado para ese dominio; se usaría con vLLM en modo texto (`--language-model-only`) para maximizar memoria disponible para la caché KV.
- Análisis de imágenes en pipelines documentales: en modo multimodal con backend Triton, el servidor acepta imágenes y puede integrarse en flujos de extracción de información de capturas, diagramas o documentación técnica.
- Atención al cliente con entrada multimodal: permite conversaciones multi-turno con imágenes adjuntas (capturas de error, productos), siempre que la longitud de contexto del modelo base sea suficiente (dato no disponible en esta ficha).
- Evaluación comparativa de cuantizaciones: útil como referencia para medir el impacto de W8A16 + FP8 KV frente al modelo en bfloat16 en tareas de código y agentes, dado que el autor no publica deltas de precisión.
- Servicio en infraestructura con Docker: la imagen `zankich/vllm-openai:latest` permite levantar un endpoint compatible con OpenAI en un solo contenedor, adecuado para prototipos y entornos de investigación con GPUs Ampere.
- Investigación sobre cuantización de caché KV: el checkpoint incluye escalas calibradas por capa y geometría, lo que lo convierte en un caso de estudio para evaluar FP8 KV en arquitecturas con atención de ventana deslizante y atención completa mixtas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se publica ningún delta de precisión frente al modelo base en bfloat16, y que la calidad en modo E5M2 se verificó con pruebas greedy, estructuradas y una prueba exacta de contenido de imagen, sin comparación a nivel de logprob contra E4M3.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 33,7 GB en disco; en bfloat16 el modelo base ocupa ~60 GB. La VRAM adicional depende de la caché KV y del contexto, no disponible en la información.
- GPUs objetivo: Ampere (A100, A10G, RTX 3090) y anteriores a SM100, con el fork de vLLM y la imagen Docker indicados. En SM100 o superior, vLLM estándar sirve texto y multimodal sin parches.
- Cabe en GPU de consumo: el peso de 33,7 GB no cabe en GPUs de 24 GB; requiere al menos ~40 GB de VRAM para pesos, por lo que encaja en A100 40/80 GB, A10G 48 GB no existe (A10G tiene 24 GB, no válida) y configuraciones multi-GPU. No se confirma compatibilidad con RTX 4090 de 24 GB.
- Opciones de despliegue: vLLM con el fork `zankich/vllm` o la imagen `zankich/vllm-openai:latest`. No se mencionan llama.cpp, Ollama ni TGI; el formato `compressed-tensors` está orientado a vLLM.
- Modos de servicio: texto con backend FlashInfer y `--language-model-only` (obligatorio, ya que FlashInfer no soporta la atención multimodal de este modelo); multimodal con backend Triton y KV en `fp8_e5m2`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| zankich/gemma-4-31B-it-W8A16-FP8KV | 9.536.844.252 según safetensors (denominado 31B) | no disponible | Sí | apache-2.0 | compressed-tensors, vLLM (fork para Ampere) |
| google/gemma-4-31B-it (base) | 31B (denominación) | no disponible | Sí | licencia Gemma 4 | safetensors bf16, ~60 GB |
| Otras cuantizaciones del mismo base | no disponible | no disponible | Sí | según autor | no disponible |

No se dispone de datos de benchmarks ni de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- Nunca servir con caché KV en bfloat16: no falla al arrancar, pero corrompe la generación de forma silenciosa (salida greedy degradada a basura CJK, todas las pruebas estructuradas fallan) mientras el servidor reporta estado saludable. Las escalas FP8 calibradas forman parte del contrato del checkpoint.
- En GPUs anteriores a SM100 es obligatorio usar el fork de vLLM o la imagen Docker del autor; vLLM estándar no sirve correctamente este checkpoint en esas GPUs.
- El modo texto con FlashInfer requiere `--language-model-only`; sin él, la torre de visión no puede servirse y consume memoria innecesariamente.
- El modo multimodal con Triton usa KV en E5M2, con aproximadamente el doble de ruido de cuantización por elemento que E4M3; no se ha realizado comparación a nivel de logprob entre ambos modos.
- No se publica ningún delta de precisión frente al modelo base en bfloat16, por lo que el impacto de la cuantización en tareas reales es desconocido.
- El conjunto de calibración es privado y está sesgado hacia código y agentes de codificación (Python, TypeScript, Go, shell); el rendimiento en otros dominios o idiomas puede degradarse.
- La discrepancia entre el nombre "31B" y los 9.536.844.252 parámetros reportados en safetensors no se aclara en la información; conviene verificarla antes de dimensionar infraestructura.
- Idiomas soportados, longitud de contexto, sesgos y riesgo de alucinación no están documentados en la información disponible; deben consultarse en la model card del modelo base.
- La licencia del checkpoint es apache-2.0, pero el modelo base remite a la licencia de Gemma 4 de Google; es necesario revisar las condiciones de uso comercial de dicha licencia antes de producción.
- El checkpoint tiene 46 descargas y 0 likes en el momento de la consulta, lo que indica validación comunitaria muy limitada.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/zankich/gemma-4-31B-it-W8A16-FP8KV
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Fork de vLLM del autor: https://github.com/zankich/vllm
- Imagen Docker: https://hub.docker.com/r/zankich/vllm-openai/tags
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Receta de cuantización: `recipe.yaml` en el repositorio del checkpoint

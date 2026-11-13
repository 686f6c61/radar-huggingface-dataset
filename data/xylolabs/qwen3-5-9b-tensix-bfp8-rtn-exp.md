# Xylolabs/Qwen3.5-9B-Tensix-BFP8-RTN-Exp

## Resumen

Qwen3.5-9B-Tensix-BFP8-RTN-Exp es una exportación cuantizada del modelo multimodal Qwen/Qwen3.5-9B, publicada por Xylolabs y orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original de Qwen3.5-9B, un transformer híbrido que combina capas de atención clásica con capas de Gated DeltaNet (atención lineal), y añade una cabeza MTP (multi-token prediction) y un codificador visual. El resultado es un checkpoint de 9.653.104.368 parámetros totales que mantiene capacidades de texto e imagen-texto.

La particularidad de esta versión es el esquema de cuantización: las capas lineales (atención q/k/v/o en 8 capas, Gated DeltaNet en 24 capas y MLP en 32 capas) se almacenan en formato `bfloat8_b` (BFP8, block floating point de 8 bits con exponente compartido por bloques de 16), mientras que embeddings, LM head, normas y tensores auxiliares permanecen en bf16. El resultado es un peso medio de 10,21 bits por parámetro y un empaquetado de 11,42 GB para los pesos del modelo de lenguaje.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización RTN (round-to-nearest) sin calibración pensada para que TT-NN empaquete los pesos sin alterar sus valores; por otro, sirve como referencia práctica para quienes despliegan modelos Qwen3.5 en hardware no convencional. El autor advierte que solo se cuantizó y evaluó el modelo de lenguaje, y que no se ejecutaron tt-transformers ni tt-forge con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención clásica + Gated DeltaNet (atención lineal) + cabeza MTP + codificador visual |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en capas lineales; bf16 en embeddings, LM head y normas; float32 en `linear_attn.A_log` y `linear_attn.norm`; media de 10,21 bits por peso |
| Idiomas soportados | no disponible (evaluación parcial sobre inglés y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 19,3 GB), con `quant4.json` e índice de shards |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida en la que conviven capas de atención estándar (8 capas con proyecciones q, k, v, o) y capas de Gated DeltaNet (24 capas con proyecciones q, k, v, z, a, b y output), una variante de atención lineal con estado recurrente. A esto se suman 32 capas de MLP con proyecciones gate, up y down, una cabeza MTP (multi-token prediction) y un módulo visual, ambos preservados en bf16. El checkpoint incluye además tensores en float32 sin modificar (`linear_attn.A_log` y `linear_attn.norm`).

El proceso de cuantización es RTN (round to nearest) sobre la rejilla `bfloat8_b`, sin calibración: cada bloque de 16 valores comparte el exponente del mayor valor del bloque o uno inferior, el que minimice el error. Las matrices cuantizadas se almacenan como valores bf16 situados exactamente sobre la rejilla BFP8, de modo que TT-NN las empaqueta sin cambiar sus valores. Según el autor, la comparación de referencia en host reporta una KL media de 0,001096 frente a BF16 sobre 16.312 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), tanto en texto plano como con plantilla de chat. No se retuvieron veredictos de comprobación de respuestas ni se ejecutó la verificación en dispositivo sobre estos pesos exactos.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat y modo `enable_thinking` configurable.
- Procesamiento image-text-to-text: el pipeline declarado es `image-text-to-text` y el módulo visual se conserva en bf16.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3.5-9B (no se aportan benchmarks en esta exportación).
- Generación de código: no se documenta explícitamente en la model card, pero es una capacidad esperable del base; no verificada en esta exportación.
- Tool calling / function calling: no documentado en la información disponible para esta exportación.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; la evaluación de KL cubre inglés y coreano.
- Capacidad especial: cabeza MTP (multi-token prediction) preservada en bf16, potencialmente útil para decodificación especulativa, aunque no se documenta su uso en esta exportación.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole o Blackhole: el checkpoint está empaquetado para que TT-NN lo cargue directamente como `bfloat8_b`, con 11,42 GB de memoria de dispositivo para los pesos del modelo de lenguaje más KV cache y buffers. Es el caso de uso principal y el único validado por el autor (mediante `pack_tensix.py` y `verify_grid.py`).
- Prototipado de inferencia multimodal en hardware no GPU: el pipeline `image-text-to-text` y el módulo visual en bf16 permiten probar tareas de descripción de imágenes o VQA sobre Tensix, siempre que se valide la precisión real en dispositivo.
- Evaluación de técnicas de cuantización BFP8 sin calibración: el repo incluye `quant4.json` con el formato de cada proyección, lo que facilita estudios comparativos de RTN frente a GPTQ u otros esquemas en el mismo modelo base.
- Integración en pipelines de transformers en host: el ejemplo de quickstart con `AutoModelForCausalLM` y `dtype="bfloat16"` permite usar el checkpoint como referencia de pesos cuantizados en CPU o GPU antes de portarlo a Tensix.
- Investigación sobre atención lineal y Gated DeltaNet: al preservar las 24 capas de Gated DeltaNet con sus tensores float32 originales, el checkpoint sirve para analizar el comportamiento de esta arquitectura híbrida en tareas de contexto largo (siempre que se determine la longitud de contexto real del base).
- Base para despliegues experimentales con decodificación multi-token: la cabeza MTP en bf16 abre la puerta a implementar decodificación especulativa sobre Tensix, aunque el autor no reporta latencia ni throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una comparación de referencia en host: KL media de 0,001096 frente a BF16 sobre 16.312 posiciones de texto en inglés y coreano. No se aportan datos de MMLU, HumanEval, GSM8K ni métricas de velocidad.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: 11,42 GB solo para los pesos del modelo de lenguaje empaquetados en BFP8, más espacio para KV cache y buffers. El repo completo ocupa 19,3 GB en disco.
- GPU recomendadas: no aplica como destino principal; el checkpoint está pensado para NPUs Tenstorrent Tensix (Wormhole, Blackhole). Para uso en host con transformers se sugiere `dtype="bfloat16"` y `device_map="auto"`, lo que requiere del orden de 19 GB de memoria en bf16 para los pesos completos.
- ¿Cabe en GPU consumer? En bf16, un modelo de ~9,65 mil millones de parámetros ocupa aproximadamente 19,3 GB, por lo que cabría en GPUs con 24 GB o más (por ejemplo, RTX 4090) usando `device_map="auto"`; en Tensix, la memoria requerida es de 11,42 GB para los pesos del LM.
- Opciones de despliegue: `transformers` en host (con fallbacks de PyTorch en CPU, evitando flash-linear-attention y causal-conv1d), y TT-NN/tt-metal en dispositivo. El autor indica que tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no reportados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-9B-Tensix-BFP8-RTN-Exp | 9,65 B | no disponible | BFP8 + bf16 + fp32 | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9,65 B | no disponible | bf16 (original) | apache-2.0 | Hugging Face |
| Otras exportaciones Tensix de Qwen3.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas equivalentes cuantizadas para Tensix ni sobre resultados comparativos de rendimiento entre estas opciones.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el módulo visual y la cabeza MTP se preservan sin evaluación específica.
- No se ha ejecutado la verificación de respuestas en dispositivo sobre estos pesos exactos; las comprobaciones de empaquetado no garantizan la precisión completa de inferencia.
- tt-transformers y tt-forge no se probaron con este checkpoint.
- La evaluación de KL (0,001096) mide cercanía de distribución, no calidad de respuestas; no sustituye a benchmarks de tarea.
- No se reportan latencia ni throughput, por lo que no hay datos de rendimiento en producción.
- Idiomas soportados no documentados; la evaluación cubre solo inglés y coreano.
- Riesgo de sesgos y alucinaciones heredado del modelo base Qwen3.5-9B, no evaluado en esta exportación.
- Licencia Apache 2.0 permite uso comercial, pero el autor distribuye el modelo "as is" y sin garantía; los cambios se documentan en `NOTICE`.
- El autor no está afiliado ni respaldado por Tenstorrent.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-Tensix-BFP8-RTN-Exp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5

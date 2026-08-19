# useful-quants/LFM2.5-VL-3B-NVFP4-FP8-Mixed

## Resumen

LFM2.5-VL-3B es un modelo vision-language (VLM) desarrollado por Liquid AI, diseñado específicamente para ejecutarse en dispositivos de borde (edge) y entornos con recursos limitados. Combina un backbone de texto ligero basado en una arquitectura híbrida de atención lineal con un codificador de imágenes SigLIP2, logrando capacidades multimodales de alto nivel como grounding visual, comprensión de pantallas y function calling, con una latencia lo suficientemente baja para inferencia en tiempo real.

Esta ficha se centra en la versión cuantizada `useful-quants/LFM2.5-VL-3B-NVFP4-FP8-Mixed`, publicada por el usuario useful-quants. Se trata de una cuantización mixta de precisión que asigna NVFP4 a los MLPs del decoder, FP8 a las capas de atención y a los MLPs del vision tower, y mantiene BF16 en las capas de convolución corta, el proyector multimodal y las embeddings. El resultado es una reducción del 51,2% en el peso del checkpoint (de 5,82 GiB a 2,84 GiB) y una liberación de 2,87 GiB de VRAM, lo que permite ampliar significativamente la capacidad de KV-cache para conversaciones largas y alta concurrencia.

El modelo base tiene 2.132.579.568 parámetros (aproximadamente 2,13B) y soporta 18 idiomas. La versión cuantizada está pensada para GPUs NVIDIA con arquitectura Blackwell SM120 (serie RTX 50) y se sirve mediante un contenedor Docker validado con vLLM 0.26.0 y FlashInfer 0.6.14. Es una opción relevante para desarrolladores que necesitan desplegar un VLM compacto con buen rendimiento en tareas de OCR, VQA y razonamiento visual en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida linear-attention con 30 capas decoder (8 full-attention, 22 short-conv) + vision tower SigLIP2 |
| Parametros totales | 2.132.579.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4 E2M1 block-scaled) en MLPs del decoder; FP8 (W8A8 E4M3 static) en atención y vision MLPs; BF16 en Short-Conv, proyector, embeddings y LM head |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | lfm1.0 (licencia propia de Liquid AI, no OSI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LFM2.5-VL-3B emplea una arquitectura de decoder híbrido que combina 8 capas de atención completa (full-attention) con 22 capas de convolución corta (short-convolution), una variante de atención lineal que reduce el coste computacional y la memoria necesaria para contextos largos. El codificador visual es un SigLIP2 de 27 capas, cuyos MLPs se cuantizan a FP8 en esta versión. El proyector multimodal y las capas de embedding se mantienen en BF16 para preservar la estabilidad numérica.

No se dispone de información pública detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card de la versión cuantizada indica que se mantiene una "paridad determinista exacta" con el modelo original en tareas de VQA, OCR de facturas y razonamiento visual de alta resolución, lo que sugiere que la cuantización no introduce pérdida de precisión en estas tareas. La cuantización se realizó con NVIDIA ModelOpt y se validó con vLLM 0.26.0.

## Capacidades

- Comprensión de imágenes y texto: responde preguntas sobre imágenes, extrae información de documentos y reconoce objetos, escenas y texto en imágenes.
- Grounding visual: localiza objetos o regiones específicas en una imagen a partir de descripciones textuales.
- Comprensión de pantallas (screen understanding): interpreta capturas de pantalla de aplicaciones, webs o interfaces, útil para agentes autónomos.
- Function calling: puede invocar herramientas externas mediante llamadas a funciones, lo que lo hace apto para integrarse en pipelines de agentes.
- Razonamiento multi-step: capaz de encadenar pasos de razonamiento sobre información visual y textual.
- Multilingüe: soporta 18 idiomas, incluyendo español, inglés, francés, alemán, árabe, chino, japonés, coreano, etc.
- OCR de documentos: extrae texto de facturas, recibos y documentos escaneados con alta precisión.
- Alta resolución multi-tile: procesa imágenes de alta resolución dividiéndolas en tiles, manteniendo el rendimiento en tareas de detalle fino.

## Casos de uso

- Atención al cliente automatizada con soporte visual: el modelo puede analizar capturas de pantalla que el usuario envía (errores de app, configuraciones) y responder con instrucciones paso a paso, gracias a su capacidad de comprensión de pantallas y su ventana de contexto ampliable por la cuantización.
- OCR y extracción de datos de facturas y recibos: en entornos de contabilidad o gestión documental, LFM2.5-VL-3B puede procesar imágenes de documentos, extraer campos clave (importes, fechas, proveedores) y estructurarlos en JSON para su integración en ERPs.
- Agentes autónomos de navegación web: con su capacidad de function calling y comprensión de pantallas, puede actuar como agente que interactúa con interfaces web, rellenando formularios o extrayendo información, ejecutándose en un dispositivo local sin depender de la nube.
- Asistentes de accesibilidad: ayuda a personas con discapacidad visual describiendo el entorno a partir de imágenes capturadas por la cámara del dispositivo, con respuesta en tiempo real gracias a su bajo consumo de recursos.
- Moderación de contenido visual: análisis de imágenes en redes sociales o plataformas para detectar contenido inapropiado, combinando clasificación visual y razonamiento textual.
- Automatización de QA visual en desarrollo de software: verificación de capturas de pantalla de aplicaciones en pipelines de CI/CD, comparando el estado esperado con el real y generando informes de error.
- Asistente de documentación técnica: a partir de diagramas, esquemas o capturas de herramientas, genera explicaciones o documentación, aprovechando el razonamiento visual y multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card de la versión cuantizada proporciona métricas de rendimiento de inferencia en hardware SM120 (RTX 5060 Ti 16GB), que se resumen a continuación:

| Métrica / Carga de trabajo | BF16 Referencia (Q0) | Mezcla NVFP4/FP8 (este repo) |
|---|---|---|
| Peso de pesos en VRAM | 5,82 GiB | 2,95 GiB |
| KV-cache disponible (util 0,75) | 5,81 GiB | 8,68 GiB |
| Concurrencia teórica máxima KV-cache (reqs de 4096 tokens) | 84,8× | 126,7× |
| Decode-heavy (128 in / 256 out) | 60,48 tok/s | 29,20 tok/s |
| Balanceado (1024 in / 128 out) | 57,62 tok/s | 29,53 tok/s |
| Prefill-heavy (3840 in / 32 out) | 32,61 tok/s | 25,79 tok/s |
| VQA imagen única (576 tokens visuales) | 55,07 tok/s | 26,81 tok/s |
| Multi-tile alta resolución (5120 tokens visuales) | 35,52 tok/s | 26,51 tok/s |
| Throughput agregado concurrencia-4 | 212,82 tok/s | 115,13 tok/s |

La cuantización reduce el rendimiento de generación a aproximadamente la mitad en cargas de decode, pero mantiene una paridad determinista exacta en tareas de VQA y OCR, y ofrece una ventaja significativa en capacidad de KV-cache y concurrencia.

## Requisitos de hardware

- VRAM estimada: 2,95 GiB para los pesos del modelo (frente a 5,82 GiB en BF16). Con KV-cache adicional, se recomienda al menos 8 GiB para uso interactivo y 16 GiB para alta concurrencia.
- GPU recomendadas: NVIDIA GeForce RTX 50-series (Blackwell SM120), validado en RTX 5060 Ti 16GB. También compatible con otras GPUs con soporte FP8/NVFP4, aunque no se han publicado pruebas en otras arquitecturas.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más, siempre que se ajuste la longitud de contexto y la concurrencia.
- Opciones de despliegue: contenedor Docker proporcionado con vLLM 0.26.0 y FlashInfer 0.6.14. Se requieren cuatro parches específicos para la integración con vLLM (detallados en la model card). También es posible usar llama.cpp u otros runners si se convierten los pesos a GGUF, aunque no se ha validado.
- Latencia y throughput: los valores de la tabla de rendimiento se obtuvieron con `--enforce-eager` en vLLM. En cargas balanceadas se observan ~29 tok/s en single-stream, y ~115 tok/s agregados con concurrencia 4.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (VLMs de ~3B) en la información proporcionada. La arquitectura híbrida linear-attention de Liquid AI es distintiva frente a transformers densos convencionales, pero no se han publicado resultados de benchmarks estandarizados que permitan una comparación cuantitativa con alternativas como Qwen2-VL-2B, Phi-3.5-vision o MiniCPM-V 2.6. Se recomienda consultar la documentación oficial de Liquid AI para futuras actualizaciones.

## Limitaciones y advertencias

- La licencia lfm1.0 es una licencia propia de Liquid AI, no OSI. Debe revisarse si permite uso comercial y redistribución, especialmente en productos cerrados.
- La cuantización NVFP4/FP8 requiere hardware con soporte para estas precisiones (Blackwell SM120). En GPUs más antiguas, el modelo no funcionará o requerirá una conversión a otra precisión.
- El despliegue con vLLM exige aplicar parches específicos; usar una versión de vLLM distinta a la validada (0.26.0) puede provocar fallos de compatibilidad.
- El rendimiento de generación single-stream es aproximadamente la mitad que el modelo BF16 original, lo que puede afectar a aplicaciones de baja latencia.
- No se ha publicado información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas específicas. Como modelo multimodal, puede generar descripciones incorrectas de imágenes ambiguas o de baja calidad.
- La longitud de contexto no está documentada en la información disponible; se recomienda probar con casos de uso reales para determinar los límites prácticos.
- El modelo está pensado para edge, pero tareas de razonamiento complejo o imágenes de muy alta resolución pueden degradar el rendimiento o requerir más memoria de la estimada.

## Enlaces

- Repositorio HuggingFace de la versión cuantizada: https://huggingface.co/useful-quants/LFM2.5-VL-3B-NVFP4-FP8-Mixed
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Blog oficial de Liquid AI sobre LFM2.5-VL-3B: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Documentación de modelos de visión de Liquid AI: https://docs.liquid.ai/lfm/models/vision-models
- Página de modelos de Liquid AI: https://www.liquid.ai/models
- Noticia sobre el lanzamiento: https://emergent.sh/news/lfm-25-vl-3b-officially-launched

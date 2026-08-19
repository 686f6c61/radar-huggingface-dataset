# underlotus/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-oQ4e-mtp

## Resumen

El modelo `underlotus/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-oQ4e-mtp` es una cuantización mixta de precisión (oQ4e, ~4,6 bits por peso) en formato MLX, creada por el usuario underlotus a partir del modelo `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved`. Este último es una versión "abliterada" (sin censura) del modelo Qwen3.6-35B-A3B de Alibaba, que utiliza una arquitectura de mezcla de expertos (MoE) con 256 expertos, 35 mil millones de parámetros totales y 3 mil millones activos por token, con una ventana de contexto nativa de 262 144 tokens.

La característica distintiva de esta cuantización es que preserva los 19 tensores del módulo de predicción multi-token (MTP), lo que permite activar la funcionalidad Lightning MTP en oMLX. Sin embargo, el autor advierte que en este modelo concreto, activar Lightning MTP reduce la velocidad de generación en lugar de mejorarla, debido a la naturaleza de los MoE de grano fino. El modelo también conserva la torre de visión de Qwen3.6 VL, por lo que admite entrada de imágenes y vídeo.

Este lanzamiento es relevante para desarrolladores que trabajan con Apple Silicon y necesitan ejecutar localmente un modelo MoE de gran tamaño con capacidades multimodales y sin restricciones de contenido, así como para investigadores interesados en el comportamiento de MTP en arquitecturas MoE. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 256 expertos (8 ruteados + 1 compartido), basada en Qwen3.6 |
| Parametros totales | 35B (modelo base) |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | 262 144 tokens (nativa) |
| Tipos de cuantizacion | oQ4e (mixed-precision, ~4,6 bits/peso); existen variantes GGUF (APEX, NVFP4) de otros autores |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer MoE de grano fino con 256 expertos, de los cuales 8 se activan por token junto con un experto compartido. Incorpora un módulo de predicción multi-token (MTP) nativo compuesto por 19 tensores, que permite especular sobre varios tokens futuros durante la generación. Sobre esta base, el autor `llmfan46` aplicó el proceso de abliteración "Heretic" (v1.3.0) combinado con MPOA (Model-Preserving Output Alignment), que reduce los rechazos de 83/100 en el modelo original a 10/100, manteniendo una divergencia KL de 0,0015 respecto al modelo sin modificar. La cuantización oQ4e, producida con la herramienta oMLX (v0.6.1), asigna bits de forma dinámica según la sensibilidad de cada capa, promoviendo capas críticas (embeddings, cabeza de salida, capas sensibles) a 8 bits y dejando el resto en 4 bits, con un resultado típico de ~4,6 bits por peso. No se dispone de información detallada sobre el entrenamiento original de Qwen3.6 (número de tokens, composición del dataset, fases de RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento en inglés y chino.
- Entrada multimodal: procesamiento de imágenes y vídeo mediante la torre VL de Qwen3.6 (requiere `vlm_mtp_enabled` para MTP en tareas de visión).
- Predicción multi-token (MTP) nativa, con los 19 tensores preservados para experimentación en oMLX.
- Comportamiento "uncensored" (abliterado): responde sin rechazos a solicitudes que el modelo original rechazaría, con una degradación mínima de la calidad (KL 0,0015).
- Compatible con el ecosistema oMLX para Apple Silicon, incluyendo servidor de inferencia y herramientas de benchmark.

## Casos de uso

- Despliegue local en Mac: al ser un cuant MLX, se puede ejecutar en Macs con Apple Silicon (M4, M3, etc.) usando `omlx serve`. Es adecuado para aplicaciones de escritorio que requieren procesamiento de lenguaje natural sin conexión.
- Experimentación con MTP en MoE: investigadores pueden estudiar el comportamiento de Lightning MTP en arquitecturas de 256 expertos, comparando velocidad y memoria con MTP desactivado, gracias a que los tensores MTP están intactos.
- Generación de texto sin censura: para proyectos de escritura creativa, roleplay o generación de contenido que requieren respuestas sin restricciones temáticas, aprovechando la abliteración con baja pérdida de calidad.
- Análisis de imágenes y vídeo en local: la torre VL permite tareas de descripción de imágenes, respuesta a preguntas visuales y análisis de vídeo, todo en el mismo modelo sin necesidad de un modelo separado.
- Prototipado de asistentes multilingües: con soporte para inglés y chino, puede servir como base para asistentes conversacionales bilingües en entornos locales.
- Benchmarking de cuantización mixta: desarrolladores pueden evaluar el impacto de oQ4e frente a cuantizaciones uniformes de 4 bits en tareas como MMLU, TruthfulQA o HumanEval, usando los datos publicados como referencia.

## Benchmarks y rendimiento

El autor proporciona dos conjuntos de mediciones. El primero compara la cuantización oQ4 con una cuantización uniforme de 4 bits de mlx-lm en el modelo Qwen3.5-35B-A3B (misma familia, no exactamente este modelo):

| Benchmark | mlx-lm 4-bit | oQ4 |
|---|---|---|
| MMLU (300) | 79,7 % | 83,3 % |
| TruthfulQA (300) | 87,7 % | 88,0 % |
| HumanEval (completo) | 87,2 % | 85,4 % |
| MBPP (300) | 71,7 % | 74,3 % |

El segundo conjunto mide la velocidad de generación en una Mac M4 de 10 núcleos con 32 GB, con y sin Lightning MTP activado:

| Configuración | 1k TG tok/s | 4k TG tok/s | TTFT (4k) | Pico de memoria (4k) |
|---|---|---|---|---|
| Lightning MTP activado | 41,2 | 35,1 | 8 879 ms | 22,1 GB |
| MTP desactivado | 39,2 | 37,6 | 8 817 ms | 20,7 GB |

Estos datos indican que con contextos largos, MTP desactivado es ~7 % más rápido y consume ~1,4 GB menos de memoria. No se han publicado resultados de benchmarks específicos para este modelo cuantizado en otras tareas.

## Requisitos de hardware

- VRAM estimada: ~20,7 GB con MTP desactivado y ~22,1 GB con MTP activado (medido en Mac M4 10-core, 32 GB).
- GPU recomendadas: exclusivo para Apple Silicon (M3, M4, M5 y superiores). No es compatible con GPU NVIDIA o AMD.
- Cabe en Macs con 32 GB de RAM unificada; con 24 GB podría funcionar con MTP desactivado, pero no está verificado.
- Opciones de despliegue: oMLX (servidor `omlx serve`), que soporta cuantización mixta y MTP. También hay versiones GGUF de otros autores para usar con llama.cpp, Ollama o vLLM.
- Latencia y throughput: los benchmarks del autor muestran ~37-41 tok/s a 1k de contexto y ~35-38 tok/s a 4k en M4 10-core, con TTFT de ~8,8 s a 4k.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | 35B totales / 3B activos | 262 144 | FP16/BF16 | Apache 2.0 | HuggingFace |
| Este modelo (oQ4e MLX) | 35B totales / 3B activos | 262 144 | oQ4e (~4,6 bits) | Apache 2.0 | HuggingFace |
| SC117/Qwen3.6-35B-A3B-...-APEX-GGUF | 35B totales / 3B activos | 262 144 | GGUF (APEX) | Apache 2.0 | HuggingFace |

La comparativa directa con otros modelos MoE de tamaño similar (p. ej., Mixtral 8x7B, DeepSeek-V2) no está disponible en la información proporcionada. Este modelo se distingue por su abliteración, la preservación del MTP y su formato MLX optimizado para Apple Silicon.

## Limitaciones y advertencias

- Lightning MTP es más lento que MTP desactivado en este modelo, según mediciones del autor. No debe activarse en producción si se prioriza la velocidad.
- El modelo es "uncensored" (abliterado): puede generar contenido inapropiado, ofensivo o dañino. No es adecuado para aplicaciones que requieran moderación de contenido.
- Solo soporta inglés y chino; no se garantiza un rendimiento fiable en otros idiomas.
- La cuantización oQ4e introduce una ligera degradación frente al modelo original, especialmente en tareas de código (HumanEval desciende de 87,2 % a 85,4 % en las pruebas del autor).
- El formato MLX limita el despliegue a hardware Apple Silicon; para otros entornos se deben usar las variantes GGUF.
- No se dispone de información sobre sesgos específicos del modelo o riesgos de alucinación más allá de los generales de los modelos de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/underlotus/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-oQ4e-mtp
- Modelo base (llmfan46): https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved
- Modelo original Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio oMLX (oQ): https://github.com/jundot/omlx
- Issue sobre Lightning MTP en MoE: https://github.com/jundot/omlx/issues/2150
- Benchmark con MTP activado: https://omlx.ai/benchmarks/performance/1vndj5wh
- Benchmark con MTP desactivado: https://omlx.ai/benchmarks/performance/yeojsx92
- Variante GGUF APEX: https://huggingface.co/SC117/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-APEX-GGUF
- Variante GGUF NVFP4: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-NVFP4-Experts-Only-GGUF
- Artículo sobre el lanzamiento de Heretic: https://baguaai.com/qwen3-6-35b-a3b-uncensored-heretic-released-native-mtp-preservation-sets-new-standard-for-local-llm-performance/

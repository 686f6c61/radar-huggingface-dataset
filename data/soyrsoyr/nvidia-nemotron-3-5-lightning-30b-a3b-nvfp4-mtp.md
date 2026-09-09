# soyrsoyr/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-MTP

## Resumen

El checkpoint `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-MTP` es una cuantización del modelo de NVIDIA Nemotron 3.5 Lightning 30B A3B, realizada por el usuario `soyrsoyr` con la librería LLM Compressor. Se trata de un artefacto de validación técnica, no de una versión calibrada para calidad: su propósito es probar el empaquetado NVFP4 en una arquitectura con bloques MTP (multi-token prediction) y evaluar la ruta de servicio con decodificación especulativa en GPUs Blackwell y H100.

El modelo base tiene 31.577.940.288 parámetros totales y, según la nomenclatura A3B, aproximadamente 3 mil millones de parámetros activos. La arquitectura combina un backbone de 52 capas con bloques de mezcla de expertos (MoE) y dos módulos MTP físicos (atención completa y MoE). Esta cuantización reduce el tamaño del repo a 19,6 GB mediante pesos y activaciones NVFP4 en el backbone, y pesos NVFP4 en los módulos MTP. La longitud de contexto no se ha publicado en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con backbone de 52 capas, bloques MoE y módulos MTP para decodificación especulativa |
| Parámetros totales | 31.577.940.288 (≈31,6 mil millones) |
| Parámetros activos | ≈3 mil millones (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 en pesos y activaciones del backbone (W4A4); NVFP4 solo en pesos de los módulos MTP; capas no cuantizadas (normas, router MoE, embeddings, lm_head) en BF16 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors con shards separados (incluye `model_mtp.safetensors`) y configuración `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo parte del checkpoint **BF16** de NVIDIA. No ha habido preentrenamiento ni RLHF; el proceso ha sido una cuantización post-entrenamiento con LLM Compressor, aplicando una receta `QuantizationModifier` sobre el objetivo `Linear` con esquema `NVFP4`. La calibración es deliberadamente reducida: usa 8 muestras del dataset `perfectblend`, con una longitud máxima de secuencia de 256 tokens. El backbone de 52 capas mantiene una configuración W4A4 (pesos y activaciones de 4 bits) con escalas de activación calibradas.

Los dos bloques MTP, uno de atención completa y otro de MoE, se empaquetan también a NVFP4, pero solo en pesos, ya que Transformers no construye los módulos MTP al cargar el modelo causal y no se pueden calibrar escalas de activación ejecutables para ellos. Las capas ignoradas (normas, router MoE, embeddings, lm_head) permanecen en BF16. La validación confirma que todos los 25.051 tensores indexados están presentes, que los 796 tensores MTP están aislados en `model_mtp.safetensors`, y que los 263 pesos MTP elegibles tienen valores empaquetados NVFP4, escalas de bloque y globales.

## Capacidades

- Generación de texto con soporte de decodificación especulativa mediante MTP (1 token especulativo).
- Compatibilidad con el framework `compressed-tensors` para cargar y verificar la cuantización.
- Despliegue documentado en vLLM con `--tensor-parallel-size 2` y configuración especulativa MTP.
- Validación de la ruta NemotronH MTP con una prueba proxy en H100 usando FP8 dinámico.
- No se documentan capacidades de tool calling, visión, audio, razonamiento multi-paso ni soporte de agentes.

## Casos de uso

- Validación de compresión NVFP4 en modelos MoE: usar este checkpoint para probar el flujo de LLM Compressor en arquitecturas con MTP y comparar la pérdida de calidad frente al modelo BF16 original.
- Pruebas de decodificación especulativa con MTP: desplegar con el comando vLLM documentado y medir la velocidad de generación en GPUs H100 o Blackwell, comparando con un modelo sin módulos MTP.
- Investigación de cuantización de pesos en bloques MTP: analizar los shards de safetensors para estudiar cómo se empaquetan los parámetros MTP y desarrollar mejoras de calibración para escalas de activación estáticas.
- Evaluación de integridad de checkpoints cuantizados: usar las comprobaciones de tensores (25.051 tensores indexados, 796 tensores MTP aislados) para verificar la compatibilidad de herramientas de carga como Transformers, vLLM y `compressed-tensors`.
- Benchmark de huella de memoria: medir el ahorro de VRAM frente al modelo BF16 original, dado que el checkpoint ocupa 19,6 GB en disco, para planificar despliegues en clústeres con GPUs Blackwell.
- Referencia para investigación en post-entrenamiento: servir como ejemplo de artefacto de cuantización con calibración mínima para desarrollar métodos de calibración eficiente y pruebas de humo de arquitecturas experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas validaciones documentadas son de integridad de tensores y una prueba proxy de servicio en H100 con FP8 para la ruta MTP; no se dispone de métricas de calidad como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no se publica un valor oficial. El peso de los shards es de 19,6 GB, por lo que se necesita al menos esa capacidad para cargar los pesos en memoria, más memoria para activaciones y caché. El ejemplo de vLLM usa `--tensor-parallel-size 2`, lo que sugiere que el despliegue está pensado para al menos dos GPUs.
- GPU recomendadas: GPUs Blackwell para el servicio nativo NVFP4 (pendiente de prueba de humo) y H100 para la prueba proxy FP8 con decodificación especulativa.
- ¿Cabe en GPU de consumo? No se puede garantizar en una GPU de consumo de 24 GB, dado que el tamaño de los pesos es 19,6 GB y se suma el overhead de activaciones y KV cache.
- Opciones de despliegue: vLLM (documentado), Transformers y LLM Compressor para verificación. No hay documentación de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA Nemotron 3.5 Lightning 30B A3B BF16 | 31.577.940.288 | BF16 | no disponible | openmdw-1.1 | HuggingFace (nvidia) |
| Este checkpoint (NVFP4-MTP) | 31.577.940.288 | NVFP4 | no disponible | openmdw-1.1 | HuggingFace (soyrsoyr) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación consultada.

## Limitaciones y advertencias

- Es un artefacto de validación de arquitectura, no una versión calibrada para calidad. El autor indica explícitamente que no es un lanzamiento de calidad.
- La calibración con solo 8 muestras puede degradar la calidad de salida en comparación con el modelo BF16 original.
- Los módulos MTP no tienen escalas de activación calibradas, por lo que la decodificación especulativa puede presentar pérdidas de fidelidad.
- El servicio nativo NVFP4 para el checkpoint completo está pendiente de la prueba de humo en Blackwell; solo se ha validado la ruta proxy FP8 en H100.
- No hay benchmarks públicos de calidad en la información disponible.
- No hay información sobre idiomas, sesgos ni riesgos de alucinación.
- La licencia openmdw-1.1 debe revisarse antes de cualquier uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/soyrsoyr/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-MTP
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/

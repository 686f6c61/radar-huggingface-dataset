# TizzyT566/Ornith-1.5-35B-A3B-NVFP4-512K-GGUF

## Resumen

Ornith-1.5-35B-A3B-NVFP4-512K-GGUF es una conversión al formato GGUF del checkpoint NVFP4 de Ornith AI, un modelo de lenguaje de arquitectura Qwen3.5 MoE con 35.500 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos. El modelo original, desarrollado por Ornith AI, forma parte de una familia de modelos open source orientados a tareas agénticas y auto-mejora, donde el propio modelo propone nuevas tareas, genera scaffolds específicos y produce soluciones para entrenamiento por refuerzo.

Esta conversión, realizada por TizzyT566, preserva la representación nativa NVFP4 en lugar de requantizar a otros formatos, y extiende la longitud de contexto original hasta 524.288 tokens (512K) mediante YaRN con un factor de escala ROPE de 2. El resultado es un archivo GGUF de 24,8 GB pensado para ejecutarse en llama.cpp y motores compatibles, lo que permite desplegar el modelo en hardware de consumo con una ventana de contexto extremadamente larga.

La relevancia de este modelo radica en su combinación de eficiencia (MoE con pocos parámetros activos), contexto ultralargo y licencia MIT, lo que lo convierte en una opción atractiva para desarrolladores que necesitan procesar documentos extensos o construir agentes autónomos sin depender de APIs propietarias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE |
| Parametros totales | 35.505.282.297 (~35,5B) |
| Parametros activos | ~3B (MoE) |
| Longitud de contexto | 524.288 tokens (512K) con YaRN, ROPE scaling factor 2 |
| Tipos de cuantizacion | NVFP4 (nativa en GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (tensores NVFP4) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) basada en Qwen3.5, con 35,5B parámetros totales y solo ~3B activos por token, lo que reduce significativamente el coste computacional en inferencia. La conversión a GGUF se realizó con la herramienta `convert_hf_to_gguf.py` de llama.cpp, preservando los tensores NVFP4 del checkpoint original en lugar de convertirlos a FP16/BF16 y requantizarlos, manteniendo así la fidelidad de la cuantización original.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). Sin embargo, según la documentación oficial de Ornith AI, la familia Ornith-1.5 se basa en un framework de auto-mejora que extiende el concepto de self-scaffolding: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones para entrenamiento por refuerzo, creando un bucle continuo de mejora. Esta característica es distintiva y orienta el modelo hacia capacidades agénticas y de razonamiento autónomo.

La extensión de contexto a 512K se aplicó mediante YaRN con un factor de escala ROPE de 2, lo que permite manejar secuencias mucho más largas que el checkpoint original sin necesidad de reentrenamiento.

## Capacidades

- Generación de texto y razonamiento: el modelo es capaz de producir texto coherente y resolver tareas de razonamiento complejo, como lo sugiere la opción `reasoning-preserve` habilitada en las pruebas.
- Tareas agénticas: diseñado para actuar como agente autónomo, proponiendo tareas, generando scaffolds y produciendo soluciones, según la filosofía de auto-mejora de Ornith.
- Contexto ultralargo: con 512K tokens de ventana, puede procesar documentos completos, libros o conversaciones de muchas horas sin perder información.
- Conversación multi-turno: etiquetado como `conversational`, es adecuado para asistentes y chatbots.
- Posible soporte multimodal: la configuración de prueba incluye `image-min-tokens: 1024`, lo que sugiere que el modelo puede procesar imágenes, aunque esta capacidad no está confirmada explícitamente en la documentación disponible.
- Compatibilidad con llama.cpp: al ser GGUF, se integra con ecosistemas como Ollama, LM Studio y otros motores basados en GGML.

## Casos de uso

- Análisis de documentos legales y contractuales extensos: la ventana de 512K permite cargar contratos completos, cláusulas y anexos en una sola pasada, facilitando la extracción de información y la detección de inconsistencias.
- Agente de investigación autónoma: el modelo puede planificar búsquedas, resumir artículos y generar informes estructurados a partir de grandes volúmenes de texto, gracias a su capacidad de razonamiento y contexto largo.
- Asistente de atención al cliente con historial completo: puede mantener conversaciones con usuarios durante horas o días, recordando todos los detalles previos sin perder el hilo.
- Generación de informes técnicos a partir de logs o datos extensos: procesa registros de sistemas, logs de servidores o datos de telemetría para producir resúmenes ejecutivos.
- Experimentación en auto-mejora de modelos: investigadores pueden usar el modelo para generar nuevas tareas y soluciones que alimenten pipelines de RL, aprovechando su diseño orientado a este fin.
- Chat conversacional de largo alcance: para aplicaciones de compañía o tutoría, donde se requiere mantener contexto sobre las interacciones previas durante sesiones prolongadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o su conversión GGUF.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 24,8 GB, por lo que se necesitan al menos 24 GB de VRAM para cargar los pesos. Con contexto 512K, la caché KV adicional puede requerir más de 32 GB, como se probó en una RTX 5090.
- GPU recomendadas: RTX 5090 (32 GB) para contexto completo; RTX 4090 (24 GB) o A100 40 GB para contextos moderados; GPUs con menos de 24 GB no son viables para este modelo.
- Compatibilidad con consumer GPU: sí, en GPUs de 24 GB o más, aunque con limitaciones de contexto.
- Opciones de despliegue: llama.cpp (probado), Ollama, LM Studio y otros motores que soporten GGUF con tensores NVFP4.
- Latencia y throughput: no disponibles. La configuración de prueba usó `flash-attn: on` y caché KV en q8_0, lo que sugiere un rendimiento optimizado, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (MoE de ~35B con contexto ultralargo). No hay datos de modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han documentado sesgos específicos, pero como todo modelo generativo, existe riesgo de alucinación, especialmente con contextos muy largos donde la información puede distorsionarse.
- Dependencia del runtime: la cuantización NVFP4 en GGUF requiere una versión reciente de llama.cpp que soporte este tipo de tensor; motores más antiguos pueden no ser compatibles.
- Conversión no oficial: este repositorio es una conversión de un tercero, no el checkpoint original de Ornith AI. Aunque la conversión preserva los tensores, puede haber diferencias sutiles en el comportamiento.
- Contexto extendido: la extensión a 512K mediante YaRN puede degradar ligeramente la calidad en secuencias muy largas o en tareas que requieren precisión posicional extrema.
- Idiomas: no se especifican los idiomas soportados; el modelo base probablemente esté entrenado principalmente en inglés, pero no hay confirmación.
- Licencia: MIT permite uso comercial sin restricciones, pero se recomienda revisar la licencia del modelo base original para asegurar el cumplimiento.

## Enlaces

- Repositorio HuggingFace de la conversión GGUF: https://huggingface.co/TizzyT566/Ornith-1.5-35B-A3B-NVFP4-512K-GGUF
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1

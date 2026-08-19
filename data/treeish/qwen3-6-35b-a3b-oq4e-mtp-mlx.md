# treeish/Qwen3.6-35B-A3B-oQ4e-MTP-MLX

## Resumen

El modelo `treeish/Qwen3.6-35B-A3B-oQ4e-MTP-MLX` es una distribución cuantizada en formato MLX del modelo base Qwen/Qwen3.6-35B-A3B, preparada específicamente para el agente de codificación Sprig de Treeish. Combina una cuantización mixta de precisión oQ4e (4-bit por defecto con overrides de 5, 6 y 8 bits) con una capa embebida de Multi-Token Prediction (MTP) que acelera la generación mediante decodificación especulativa. El paquete incluye un template de chat personalizado (Froggeric v21.3) validado para flujos de trabajo de agente de codificación.

El modelo base es un transformer MoE con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, con una ventana de contexto de 262.144 tokens. La cuantización reduce el tamaño del archivo a 21,6 GB, lo que permite ejecutarlo en equipos Apple Silicon con 24-32 GB de memoria unificada. La distribución está anclada a un commit exacto del repositorio fuente, garantizando reproducibilidad de los pesos, aunque no del proceso de conversión.

La relevancia de este modelo radica en su optimización para tareas de agente de codificación en entornos locales: el MTP integrado mejora el throughput de generación (hasta 110,4 tokens/s en pruebas con MTP block size 4 en un M4 Max), y el template de chat está ajustado para formatos de edición exacta de código. Es una opción práctica para desarrolladores que necesitan un modelo de razonamiento y código con tool calling en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) |
| Parametros totales | 35B (modelo base); 6.190.670.768 parámetros almacenados en safetensors cuantizado |
| Parametros activos | ~3B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ4e (4-bit affine, group size 64) con overrides por tensor de 5, 6 y 8 bits, group sizes 64 y 128; calibrado con imatrix |
| Idiomas soportados | no disponible (el modelo base Qwen3.6 es multilingüe, pero no se especifican idiomas concretos en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (5 shards, 2.052 tensores indexados) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de arquitectura MoE con 35B parámetros totales y ~3B activos por token. La versión cuantizada utiliza oQ4e, una cuantización mixta de precisión que asigna 4 bits por defecto (affine, group size 64) y aplica overrides de 5, 6 y 8 bits a tensores específicos según un reporte de calibración imatrix. El imatrix se generó con 128 muestras de 512 tokens del dataset `oqe_code_multilingual`, aplicando 470 de 510 entradas del reporte.

El paquete incluye una capa MTP embebida bajo `language_model.mtp.*` (42 tensores), que permite decodificación especulativa con bloques de 2 a 4 tokens. El template de chat es el Froggeric Qwen3.6 v21.3, byte-idéntico al archivo `archive/v21_chat_template.jinja` del repositorio `froggeric/Qwen-Fixed-Chat-Templates`. No se modificaron tensores del modelo, tokenizador ni configuración; solo se reemplazó el template y se añadieron licencia, manifiesto y metadatos.

No se dispone de información sobre el entrenamiento original del modelo base (datos, número de tokens, RLHF/DPO). La cuantización es un post-proceso sobre los pesos ya entrenados.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas de lenguaje general, aunque la model card no detalla capacidades específicas más allá de codificación.
- Tool calling / function calling: validado en el flujo de trabajo de Sprig, con soporte para llamadas a herramientas como `search_text` (probado con MTP block size 2).
- Soporte de agentes y multi-step reasoning: orientado a agentes de codificación, con formato de edición exacta de código (exact-string edit) que produce ediciones estructuralmente válidas.
- Multi-Token Prediction (MTP): decodificación especulativa integrada que acelera la generación (hasta 110,4 tokens/s en pruebas con block size 4 en M4 Max).
- Capacidades multimodales: el pipeline declarado es `image-text-to-text`, lo que sugiere soporte de entrada de imágenes, aunque no se proporcionan detalles ni ejemplos en la model card.
- Multilingüismo: no especificado, pero el modelo base Qwen3.6 es conocido por soportar múltiples idiomas.

## Casos de uso

- Agente de codificación autónomo: el modelo está diseñado para el agente Sprig de Treeish, que realiza tareas de edición de código en repositorios. Su formato de edición exacta y tool calling permiten generar parches estructuralmente válidos.
- Asistente de programación en IDE: con su contexto de 262K tokens, puede analizar proyectos completos y sugerir refactorizaciones o correcciones. La cuantización 4-bit permite ejecutarlo localmente en un Mac con 24-32 GB de RAM.
- Generación de código con decodificación especulativa: el MTP integrado acelera la generación de código en pipelines de CI/CD o en entornos de desarrollo, reduciendo la latencia percibida.
- Razonamiento sobre código legacy: la ventana de contexto larga permite cargar archivos extensos o múltiples módulos para tareas de comprensión y documentación.
- Automatización de tareas de mantenimiento: puede generar tests, corregir bugs o actualizar dependencias mediante tool calling, integrándose en flujos de trabajo de integración continua.
- Prototipado rápido de aplicaciones: su capacidad de generar código y razonar sobre requisitos en lenguaje natural lo hace útil para generar esqueletos de aplicaciones o scripts de automatización.

## Benchmarks y rendimiento

La model card reporta que el modelo fuente (Jundot/Qwen3.6-35B-A3B-oQ4e-mtp) obtuvo una media del 83,88% en un conjunto de evaluación compuesto por MMLU, Winogrande, HumanEval y MBPP, con un 93,90% en HumanEval. No se proporciona la tabla completa de comparación ni la metodología detallada; se remite a la model card del modelo fuente.

En cuanto a rendimiento de generación, las pruebas de Treeish en un M4 Max de 36 GB con un fixture de 1.066 tokens arrojaron:

| Configuracion | Tokens/s |
|---|---|
| Sin MTP | 96,8 |
| MTP block size 2 | 100,9 |
| MTP block size 3 | 109,6 |
| MTP block size 4 | 110,4 |

Con MTP block size 4, se aceptaron 61 de 84 tokens de borrador propuestos. Estos datos corresponden a una máquina concreta y un fixture pequeño; no son benchmarks generales del modelo.

## Requisitos de hardware

- Memoria: Treeish utiliza el modelo desde 24 GB de memoria unificada y recomienda 32 GB. El margen depende de la longitud de contexto, la configuración de caché y otras aplicaciones en ejecución.
- GPU: validado en Apple Silicon (M4 Max de 36 GB). Al ser formato MLX, está orientado a hardware Apple; no se proporcionan requisitos para GPUs NVIDIA o AMD.
- Despliegue: compatible con el runtime MLX Swift de Treeish. Se requiere soporte para overrides de cuantización por tensor en `config.json` y el layout MTP embebido. No se mencionan vLLM, llama.cpp u otros runners.
- Latencia y throughput: en el M4 Max de 36 GB, se observaron entre 96,8 y 110,4 tokens/s según la configuración de MTP, con un fixture de 1.066 tokens.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (mismo tamaño o misma tarea) en la documentación proporcionada. La model card no incluye tablas comparativas con otros modelos cuantizados o MoE. Se puede considerar que es una variante cuantizada del Qwen3.6-35B-A3B, pero no hay datos de rendimiento relativo frente a otros modelos.

## Limitaciones y advertencias

- La cuantización oQ4e sacrifica algo de calidad del modelo a cambio de menor uso de memoria y mayor velocidad de generación local. Se recomienda validar el modelo con los prompts y formatos de herramienta propios antes de usarlo en producción.
- El paquete es una distribución curada y anclada a un commit, pero no es una receta de conversión reproducible byte a byte: no se identifica el commit exacto del modelo base utilizado para la conversión.
- No se especifican sesgos conocidos ni riesgos de alucinación específicos de esta versión. Como modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- El soporte de idiomas no está documentado; aunque el modelo base es multilingüe, no hay garantía de rendimiento uniforme en todos los idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base y el template de chat (también Apache 2.0) cumplan con los requisitos de atribución.
- El runtime debe soportar los overrides de cuantización por tensor y el layout MTP; no todos los runners MLX pueden cargar este paquete correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/treeish/Qwen3.6-35B-A3B-oQ4e-MTP-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo fuente (Jundot): https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ4e-mtp
- Repositorio de templates de chat (Froggeric): https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates

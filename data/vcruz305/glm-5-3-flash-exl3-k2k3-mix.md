# vcruz305/GLM-5.3-Flash-EXL3-K2K3-mix

## Resumen

GLM-5.3-Flash-EXL3-K2K3-mix es un paquete de cuantizacion de precision mixta en formato EXL3, construido por el ingeniero independiente vcruz305 sobre el modelo base [zai-org/GLM-5.3-Flash-BF16](https://huggingface.co/zai-org/GLM-5.3-Flash-BF16) de Z.AI. Se trata de un modelo de arquitectura MoE (mixture of experts) con 320.000 millones de parametros totales y 18.000 millones activos, disenado para ejecutarse en un unico NVIDIA DGX Spark (GB10, SM121) mediante vLLM con cuantizacion EXL3.

La propuesta tecnica consiste en tomar el paquete K2 base (cuantizacion de 2 bits en los expertos enrutados) y promover seis capas de expertos enrutados a una precision K3 (3 bits), seleccionadas por su reduccion de error proxy EXL3. El resultado es un modelo con una precision efectiva de 2,14 bpw en los expertos enrutados, manteniendo atencion, expertos compartidos, embeddings, cabeza y vision en BF16 nativo. Es relevante porque demuestra una estrategia de cuantizacion selectiva por capas que mejora la fidelidad sin aumentar significativamente el uso de memoria, orientada a hardware de consumo profesional como el DGX Spark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` (MoE hibrida con atencion sparse-MLA) |
| Parametros totales | 320.000 millones (320B) |
| Parametros activos | 18.000 millones (18B) |
| Longitud de contexto | 65.536 tokens (64k, segun script de servicio) |
| Tipos de cuantizacion | EXL3 K2/K3 mixto: 37 capas de expertos enrutados a K2 (2 bits) + 6 capas a K3 (3 bits); atencion, expertos compartidos, embeddings, cabeza y vision en BF16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | EXL3 (safetensors en 120 shards; 98 identicos al base, 22 reescritos) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es el primer modelo multimodal nativo de la serie GLM-5, con arquitectura hibrida que combina atencion sparse-MLA (multi-head latent attention) con capas de expertos enrutados. Este paquete concreto no modifica la arquitectura subyacente: es una cuantizacion EXL3 de precision mixta aplicada exclusivamente a los expertos enrutados de 43 capas (de la 3 a la 45). Los tensores de atencion, expertos compartidos, embeddings, cabeza de salida y vision se mantienen en BF16 original.

La cuantizacion utiliza el esquema MCG trellis de ExLlamaV3. El proceso de construccion (`merge_delta.py`) superpone tensores K3 validados sobre el base K2 en un directorio separado, sin modificar el base (verificado por mtime). Las capas promovidas a K3 son las numeros 24, 27, 35, 37, 42 y 45, seleccionadas por su reduccion de error proxy EXL3 (aproximadamente 77% de mejora relativa en todas ellas). Cada capa promovida mantiene `gate_proj`, `up_proj` y `down_proj` al mismo nivel K, requisito del kernel MoE fusionado. No se dispone de informacion sobre el entrenamiento original del modelo base (datos, tokens, RLHF/DPO).

## Capacidades

- Generacion de texto y razonamiento en ingles y chino, con ventana de contexto de 64k tokens.
- Capacidades multimodales nativas (vision) heredadas del modelo base GLM-5.3-Flash, con tensores de vision en BF16 sin cuantizar.
- Soporte de prediccion multi-token (MTP) con `SPEC_METHOD=mtp` y `MTP_TOKENS=2` en el script de servicio.
- Inferencia eficiente en un unico DGX Spark gracias a la cuantizacion EXL3 con kernel MoE fusionado (`fused_moe=exl3_moe`).
- Cuantizacion de precision mixta por capas, con soporte de override por capa (`layer_bits`) en el plugin EXL3 modificado.
- Compatible con vLLM para despliegue en produccion con `--quantization exl3`.

## Casos de uso

- Despliegue local de un modelo de 320B en un unico DGX Spark: el paquete esta disenado especificamente para caber en la memoria de un GB10 (128 GB unificados), permitiendo ejecutar un modelo de nivel frontier en hardware de escritorio profesional.
- Servicio de chat y asistencia en ingles y chino con contexto largo: la ventana de 64k tokens permite mantener conversaciones extensas o procesar documentos largos en una sola pasada.
- Razonamiento multimodal con vision: al mantener los tensores de vision en BF16, el modelo conserva las capacidades de comprension de imagenes del GLM-5.3-Flash original.
- Generacion de codigo y analisis tecnico: con 18B parametros activos y soporte de MTP, puede integrarse en flujos de trabajo de desarrollo asistido por IA en entornos con recursos limitados.
- Investigacion en cuantizacion de precision mixta: el paquete incluye `research/sensitivity.json` con la tabla de sensibilidad por capa, util para estudiar el impacto de la cuantizacion selectiva en modelos MoE.
- Evaluacion de fidelidad de cuantizacion: el repositorio de receta incluye una suite de fidelidad (KLD vs BF16 teacher) para comparar el rendimiento del paquete mixto frente al base K2 y al BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tabla de estado del modelo indica que las pruebas de carga, memoria a 64k, dispatch fusionado, velocidad y KLD vs BF16 estan pendientes. El modelo se presenta como un registro de construccion, no como una version cualificada.

## Requisitos de hardware

- VRAM estimada: no disponible; el objetivo declarado es un NVIDIA DGX Spark (GB10, SM121) con 128 GB de memoria unificada.
- GPU recomendada: NVIDIA DGX Spark (GB10); no se indica compatibilidad con otras GPUs.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) dado el tamano total de 320B parametros, aunque la cuantizacion EXL3 reduce significativamente el peso en memoria.
- Opciones de despliegue: vLLM con `--quantization exl3` y el plugin EXL3 modificado del repositorio de receta; requiere wheels precompilados para GB10 (`vcruz305/GLM-5.3-Flash-EXL3-K2-spark-vllm`).
- Latencia y throughput: no disponibles; las pruebas de velocidad comparativas frente al base K2 estan pendientes.
- Requisito critico: el plugin EXL3 debe soportar `layer_bits` (K por capa); un plugin K2 estandar falla con `EXL3 load shape mismatch`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-K2K3-mix (este) | 320B total / 18B activo | 64k | EXL3 K2/K3 mixto (2,14 bpw efectivo) | MIT | HuggingFace |
| GLM-5.3-Flash-EXL3-K2 (base) | 320B total / 18B activo | 64k | EXL3 K2 (2 bits, expertos enrutados) | MIT | HuggingFace |
| GLM-5.3-Flash-NVFP4 | 320B total / 18B activo | no disponible | NVFP4 | MIT | HuggingFace |
| GLM-5.3-Flash-BF16 (original) | 320B total / 18B activo | no disponible | BF16 | MIT | HuggingFace |

La diferencia principal entre este paquete y el base K2 es la promocion de seis capas a K3, que reduce el error proxy EXL3 en aproximadamente un 77% en esas capas a costa de un ligero aumento de memoria. Frente al NVFP4, la comparativa no es posible sin datos de rendimiento publicados.

## Limitaciones y advertencias

- Estado de desarrollo: el modelo se presenta como un registro de construccion; las puertas de carga, memoria, dispatch y velocidad estan pendientes de validacion. No es una version cualificada para produccion.
- Bug conocido en runtime: el runtime vLLM `glm5next` tiene un error de escritura fuera de limites (out-of-bounds write) en la cola del K-pool de sparse-MLA en modelos hibridos. No es especifico de EXL3 y afecta a K2, este mix y los paquetes TR3. Se documenta en `docs/KPOOL_TAIL_BUG.md`.
- Requisito de plugin especifico: el paquete no carga con un plugin EXL3 estandar K2; requiere el plugin modificado del repositorio de receta que soporte `layer_bits`.
- Cuantizacion agresiva: la precision efectiva de 2,14 bpw en expertos enrutados puede introducir degradacion de calidad frente al BF16 original; las pruebas de fidelidad KLD estan pendientes.
- No es un lanzamiento oficial: es una cuantizacion comunitaria, no una publicacion de Z.AI. Los tensores delta K3 provienen de un artefacto de investigacion privado.
- Idiomas limitados: solo ingles y chino declarados; no se garantiza rendimiento en otros idiomas.
- Sesgos y alucinaciones: no se dispone de evaluaciones especificas de sesgos o tasas de alucinacion para este paquete cuantizado.

## Enlaces

- [HuggingFace: vcruz305/GLM-5.3-Flash-EXL3-K2K3-mix](https://huggingface.co/vcruz305/GLM-5.3-Flash-EXL3-K2K3-mix)
- [HuggingFace: vcruz305/GLM-5.3-Flash-EXL3-K2 (base)](https://huggingface.co/vcruz305/GLM-5.3-Flash-EXL3-K2)
- [HuggingFace: vcruz305/GLM-5.3-Flash-EXL3-K2-spark-vllm (wheels)](https://huggingface.co/vcruz305/GLM-5.3-Flash-EXL3-K2-spark-vllm)
- [HuggingFace: vcruz305/GLM-5.3-Flash-NVFP4](https://huggingface.co/vcruz305/GLM-5.3-Flash-NVFP4)
- [HuggingFace: zai-org/GLM-5.3-Flash-BF16 (modelo original)](https://huggingface.co/zai-org/GLM-5.3-Flash-BF16)
- [GitHub: GLM-5.3-Flash-EXL3-K2-DGX-Spark-recipe](https://github.com/vcruz305/GLM-5.3-Flash-EXL3-K2-DGX-Spark-recipe)
- [Documentacion Z.AI: GLM-5.3-Flash](https://docs.z.ai/guides/vlm/glm-5.3-flash)

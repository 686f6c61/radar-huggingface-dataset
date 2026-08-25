# zrlu/OBLITERATUS-Qwen3.8-27B-OBLITERATED-GPTQ-Int4-sym-G128-MTP-BF16-B70

## Resumen

Este repositorio contiene una cuantización GPTQ de 4 bits del modelo OBLITERATUS/Qwen3.8-27B-OBLITERATED, un derivado del Qwen3.8-27B que ha sido sometido a un proceso de "abliteración" mediante el toolkit OBLITERATUS. La abliteración elimina quirúrgicamente las representaciones internas responsables del rechazo de contenidos, sin reentrenar el modelo, lo que resulta en un modelo que responde a prácticamente cualquier solicitud (tasa de rechazo cercana a 0 % en pruebas de 842 prompts). El modelo original es de 27 781 427 952 parámetros, con arquitectura Qwen3.5 (config `Qwen3_5ForConditionalGeneration`), soporte de visión y cabezas de predicción multitoken (MTP) para decodificación especulativa.

La cuantización, realizada por `zrlu`, está optimizada para su ejecución en una única GPU Intel Arc Pro B70 (Xe2) mediante vLLM XPU, con los pesos en INT4 (grupo 128, simétrico) y las cabezas MTP conservadas en BF16. El resultado es un checkpoint de aproximadamente 18.2 GB en 5 shards, pensado para cargas de trabajo de agentes (pi/opencode) y despliegue local en entornos con restricciones de VRAM. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (config `Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no especificado en la informacion) |
| Tipos de cuantizacion | GPTQ-INT4 (bits=4, group_size=128, desc_act=false, sym=true) con MTP en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (5 shards) |

## Arquitectura y entrenamiento

El modelo base `OBLITERATUS/Qwen3.8-27B-OBLITERATED` es una versión del Qwen3.8-27B que ha sido "abliterada" mediante técnicas de intervención de activaciones (abliteración) implementadas en el toolkit OBLITERATUS. Este proceso identifica y elimina las direcciones internas asociadas al rechazo de contenido, sin reentrenamiento ni ajuste fino, preservando el resto de capacidades del modelo. La arquitectura mantiene las cabezas de predicción multitoken (MTP) y el token de imagen (`image_token_id 248056`), lo que permite decodificación especulativa y procesamiento de entradas visuales.

La cuantización se realizó con `gptqmodel==7.3.2` sobre CUDA (RTX 5090), con calibración sobre wikitext-2. Los pesos se cuantizaron a 4 bits con grupo de 128 y simetría activa, mientras que los tensores MTP se mantuvieron en BF16 para cumplir con el requisito del recetario de vLLM para la GPU Intel Arc Pro B70. El proceso es reproducible y está documentado en el repositorio GitHub asociado.

## Capacidades

- Generación de texto conversacional y de razonamiento en inglés y chino.
- Procesamiento de imágenes (entrada visual) gracias a la arquitectura multimodal.
- Soporte de tool calling mediante el parser `qwen3_xml` integrado en vLLM.
- Capacidad de agentes autónomos, optimizado para cargas de trabajo de pi/opencode.
- Decodificación especulativa con MTP (predicción multitoken) para reducir latencia en inferencia.
- Compatibilidad con el ecosistema vLLM (XPU) y Transformers para integración en pipelines.

## Casos de uso

- **Despliegue de agentes de codigo en hardware Intel Arc Pro B70**: el modelo está específicamente diseñado para ejecutarse en una sola GPU Intel Arc Pro B70 (24 GB) con vLLM XPU, permitiendo agentes de codificacion como pi/opencode en entornos sin GPUs NVIDIA de alto rendimiento.
- **Inferencia con restricciones de VRAM**: al pesar solo ~18.2 GB, puede ejecutarse en GPUs de 24 GB o menos, lo que lo hace adecuado para estaciones de trabajo con tarjetas graficas de consumo o profesionales de gama media.
- **Investigacion de seguridad y alineacion de modelos**: al tener una tasa de rechazo de 0 %, permite estudiar comportamientos de modelos sin censura, util para red-team y evaluacion de riesgos de seguridad.
- **Procesamiento de documentos mixtos (texto e imagen)**: gracias al soporte de vision, puede analizar imagenes y generar texto asociado, por ejemplo para extraer informacion de capturas o diagramas.
- **Integracion en pipelines de vLLM con decodificacion especulativa**: la conservacion de MTP en BF16 permite reducir la latencia de generacion, util en sistemas de respuesta en tiempo real como chatbots o asistentes.
- **Creacion de herramientas de generacion de contenido en chino e ingles**: adecuado para aplicaciones de redaccion, traduccion o resumen en ambos idiomas, con la ventaja de no rechazar prompts creativos o de rol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion proporcionada. La model card menciona que los benchmarks estan incluidos en el repositorio GitHub asociado, pero no se detallan numeros en la documentacion accesible.

## Requisitos de hardware

- VRAM estimada: el checkpoint cuantizado pesa ~18.2 GB, por lo que se recomienda al menos 24 GB de VRAM para inferencia con margen para KV cache y overhead.
- GPU recomendadas: Intel Arc Pro B70 (Xe2, 24 GB) es la plataforma objetivo, con soporte via vLLM XPU. Tambien se ha verificado la cuantizacion en RTX 5090 (para el proceso de cuantizacion, no para inferencia).
- Compatibilidad con consumer GPU: podria ejecutarse en GPUs NVIDIA con 24 GB (p.ej., RTX 4090) usando vLLM o Transformers, aunque no esta optimizado para ellas.
- Opciones de despliegue: vLLM (con XPU para Intel, o CUDA para NVIDIA), Transformers (con `device_map="auto"`), y contenedores Docker especificos (imagen `zrlu/qwen38-27b-arc-pro-b70:2026.08.24`).
- Latencia y throughput: no se han proporcionado valores concretos; se espera que la decodificacion especulativa (MTP) reduzca la latencia respecto a generacion autoregresiva estandar.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos en la documentacion proporcionada. El modelo base `OBLITERATUS/Qwen3.8-27B-OBLITERATED` es una variante abliterada del Qwen3.8-27B, y existen otras cuantizaciones de este modelo (p.ej., MLX para Apple Silicon, GGUF), pero no se incluyen datos de comparacion en las fuentes consultadas.

## Limitaciones y advertencias

- **Idiomas limitados**: el modelo solo soporta ingles y chino; no se ha entrenado para otros idiomas.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede generar informacion falsa o no verificada, especialmente en prompts abiertos.
- **Abliteracion**: la eliminacion de comportamientos de rechazo puede reducir las salvaguardas de seguridad, lo que puede generar respuestas inapropiadas o peligrosas en contextos sensibles.
- **Degradacion por cuantizacion**: la cuantizacion INT4 puede producir una perdida de calidad en comparacion con el modelo en fp16, aunque la conservacion de MTP en BF16 mitiga parte de la degradacion.
- **Dependencia de hardware**: el rendimiento optimo se logra en Intel Arc Pro B70 con vLLM XPU; en otras GPUs puede requerir adaptaciones y no se garantiza el mismo comportamiento.
- **Licencia**: Apache-2.0 permite uso comercial y modificacion, pero no se amplian derechos sobre el modelo base (que tambien es Apache-2.0).

## Enlaces

- [HuggingFace - Repositorio del modelo](https://huggingface.co/zrlu/OBLITERATUS-Qwen3.8-27B-OBLITERATED-GPTQ-Int4-sym-G128-MTP-BF16-B70)
- [HuggingFace - Modelo base OBLITERATUS/Qwen3.8-27B-OBLITERATED](https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED)
- [GitHub - Repositorio OBLITERATUS (toolkit de abliteracion)](https://github.com/elder-plinius/OBLITERATUS)
- [Blog explainx.ai - articulo sobre Qwen3.8-27B OBLITERATED](https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026)
- [Blog explainx.ai - articulo sobre MLX y cuantizacion del mismo modelo](https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026)

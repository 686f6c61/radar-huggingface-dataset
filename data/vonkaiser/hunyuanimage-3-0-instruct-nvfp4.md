# vonkaiser/HunyuanImage-3.0-Instruct-NVFP4

## Resumen

HunyuanImage-3.0-Instruct-NVFP4 es un checkpoint cuantizado del modelo de generación y edición de imágenes HunyuanImage-3.0-Instruct desarrollado por Tencent, publicado por el usuario vonkaiser. El modelo original es un transformer de tipo Mixture-of-Experts (MoE) con 49.186.336.227 parámetros totales, y esta versión aplica una cuantización mixta NVFP4/FP8 pensada para ejecutarse en una única GPU NVIDIA RTX PRO 6000 Blackwell (arquitectura SM120, 96 GB de VRAM). El objetivo es hacer viable la inferencia de un modelo de imagen de gran tamaño en hardware profesional de una sola tarjeta, reduciendo los pesos residentes a 51,1 GB.

La cuantización afecta selectivamente a las capas más costosas: los 4096 tensores de las proyecciones `gate_and_up_proj` y `down_proj` de los expertos enrutados se almacenan en NVFP4 (formato E2M1 de NVIDIA, con escala dinámica por tensor y kernel MSLK), mientras que las 128 proyecciones de atención `qkv_proj`/`o_proj` del backbone y el MLP compartido se guardan en FP8 con activación dinámica. Embeddings, normas, router, cabeza de salida, torre de visión, VAE y capas pequeñas se copian en su dtype original.

El modelo cubre tanto generación texto-a-imagen como edición por instrucciones (image-to-image) en un único checkpoint, y hereda la licencia Tencent Hunyuan Community del modelo base. Es relevante para quienes necesitan desplegar generación y edición de imágenes de alta calidad en infraestructura local sin recurrir a clústeres multi-GPU, a costa de un proceso de carga no estándar que requiere reconstruir manualmente los tensores empaquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con torre de visión y VAE; tag `hunyuan_image_3_moe` |
| Parametros totales | 49.186.336.227 (49,19 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1, escala dinámica por tensor, kernel MSLK) + FP8 (activación dinámica FP8, peso FP8); resto en dtype original |
| Idiomas soportados | no disponible |
| Licencia | tencent-hunyuan-community (Tencent Hunyuan Community License) |
| Formato de pesos | safetensors empaquetados (`.qdata`, `.scale`, `.per_tensor_scale`), con `quantization_schema.json`; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base HunyuanImage-3.0-Instruct es una arquitectura Mixture-of-Experts orientada a generación y edición de imágenes, que combina un backbone transformer con expertos enrutados, un MLP compartido, una torre de visión y un VAE. Esta versión cuantizada no reentrena el modelo: parte de los pesos BF16 originales de `tencent/HunyuanImage-3.0-Instruct` (aproximadamente 169 GB) y los cuantiza shard a shard con TorchAO y MSLK. Los tensores BF16 originales no se incluyen en el repositorio.

La innovación técnica principal reside en el esquema de cuantización mixta: los expertos enrutados (los tensores de mayor volumen) pasan a NVFP4 para maximizar la compresión, mientras que las capas de atención y el MLP compartido, más sensibles a la precisión, se mantienen en FP8. El `config.json` marca `already_quantized: true` y `do_not_requantize: true`, de modo que los pesos no deben recuantizarse. La carga requiere construir el modelo en el dispositivo meta, con `moe_impl="eager"` y atención SDPA, y reconstruir cada parámetro cuantizado: las claves NVFP4 mediante `torchao.prototype.mx_formats.nvfp4_tensor.NVFP4Tensor` con `use_dynamic_per_tensor_scale=True` y `use_triton_kernel=True`, y las claves FP8 mediante `torchao.quantization.Float8Tensor`. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en un único modelo.
- Edición de imágenes guiada por instrucciones (instruction-based editing).
- Pipeline image-to-image, según el `pipeline_tag` del repositorio.
- Integración de torre de visión para el procesamiento de imágenes de entrada en tareas de edición.
- Cuantización NVFP4/FP8 con reconstrucción de tensores empaquetados mediante TorchAO.
- Ejecución verificada en una sola GPU RTX PRO 6000 Blackwell con atención SDPA.
- Soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos de pensamiento: no disponible en la información proporcionada.

## Casos de uso

- Generación de imágenes en local con una sola GPU profesional: el checkpoint permite producir imágenes de 1024×1024 en 30 pasos con un pico de 60,5 GB de memoria asignada, lo que encaja en los 96 GB de una RTX PRO 6000 Blackwell sin necesidad de multi-GPU.
- Edición de imágenes por instrucciones en estudio: el modelo mantiene generación y edición en un mismo checkpoint, con un pico medido de 62,0 GB asignados (64,2 GB reservados) para una edición de 1024×1024, adecuado para flujos de retoque y variaciones controladas por texto.
- Prototipado de pipelines image-to-image: al declarar `pipeline_tag: image-to-image`, se puede integrar en aplicaciones que reciben una imagen y una instrucción y devuelven una versión editada, sin cambiar de modelo entre generación y edición.
- Investigación en cuantización de modelos de difusión/MoE: el repositorio documenta el esquema NVFP4/FP8, el layout empaquetado y los kernels empleados, lo que lo convierte en referencia para estudiar el impacto de la cuantización mixta en modelos de imagen de gran tamaño.
- Despliegue en estaciones de trabajo con Blackwell: al requerir SM120 y 96 GB, encaja en entornos de laboratorio o estudio con RTX PRO 6000, evitando costes de clúster.
- Evaluación comparativa de calidad frente al modelo BF16 original: al conservar la licencia y el pipeline del modelo base, permite medir la degradación introducida por la cuantización en tareas concretas de generación y edición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento documentados son de memoria: 51,1 GB de pesos residentes, 60,5 GB de pico asignado en una generación de 1024×1024 a 30 pasos y 62,0 GB de pico asignado (64,2 GB reservados) en la edición correspondiente.

## Requisitos de hardware

- VRAM estimada: 51,1 GB de pesos residentes; pico de 60,5 GB en generación 1024×1024 a 30 pasos y 62,0 GB (64,2 GB reservados) en edición.
- GPU recomendada: NVIDIA RTX PRO 6000 Blackwell (SM120, 96 GB), único hardware verificado por el autor.
- No cabe en GPU de consumo convencional (RTX 4090 de 24 GB, RTX 5090 de 32 GB) según los requisitos de memoria documentados.
- Despliegue: carga mediante `from_pretrained` con `trust_remote_code=True`, construcción en dispositivo meta, `moe_impl="eager"` y atención SDPA; reconstrucción de tensores NVFP4 con TorchAO (`NVFP4Tensor`, `use_dynamic_per_tensor_scale=True`, `use_triton_kernel=True`) y FP8 con `Float8Tensor`.
- El módulo FlashAttention-4 para SM120 puede cargarse para atención sin máscara, pero la ruta de imagen de este checkpoint pasa una máscara explícita, por lo que la ejecución verificada usó SDPA. No se debe aplicar `torch.compile` hasta que un forward en modo eager haya producido una imagen.
- La ruta de FlashInfer fused-MoE no es compatible con estos expertos empaquetados; es necesario saltar los expertos vacíos, ya que un linear NVFP4 rechaza un lote de cero tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HunyuanImage-3.0-Instruct-NVFP4 (este) | 49,19 mil millones | no disponible | tencent-hunyuan-community | Hugging Face, 220,3 GB de repo | Cuantizado NVFP4/FP8, ~51,1 GB residentes, requiere SM120 |
| tencent/HunyuanImage-3.0-Instruct (base) | 49,19 mil millones | no disponible | tencent-hunyuan-community | Hugging Face | Pesos BF16 (~169 GB), sin cuantizar |
| Otros modelos de generación/edición de imagen de gran tamaño | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La licencia Tencent Hunyuan Community puede imponer restricciones al uso comercial; debe revisarse el archivo `LICENSE` antes de desplegar en producción.
- El proceso de carga no es estándar: un `from_pretrained` convencional no reconstruye los tensores empaquetados y es necesario reconstruir manualmente NVFP4 y FP8 con TorchAO.
- El directorio local de descarga no debe contener puntos en el nombre, ya que Transformers gestiona mal rutas locales con puntos.
- Los pesos ya están cuantizados (`already_quantized: true`, `do_not_requantize: true`); recuantizarlos puede degradar o romper el modelo.
- La ruta FlashInfer fused-MoE no funciona con estos expertos empaquetados; hay que usar `moe_impl="eager"`.
- No se debe aplicar `torch.compile` antes de verificar un forward en eager que produzca una imagen.
- Solo se ha verificado en RTX PRO 6000 Blackwell (SM120, 96 GB); no hay datos de compatibilidad con otras GPU.
- No se han publicado datos de sesgos, tasa de alucinación visual, idiomas soportados ni calidad comparativa frente al modelo BF16 original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- El slug del repositorio dice `NFVP4`, pero el formato numérico real es NVFP4 (NVIDIA FP4, E2M1); conviene tenerlo en cuenta al automatizar descargas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vonkaiser/HunyuanImage-3.0-Instruct-NVFP4
- Modelo base: https://huggingface.co/tencent/HunyuanImage-3.0-Instruct
- Licencia Tencent Hunyuan Community: incluida como `LICENSE` en el repositorio
- TorchAO (repositorio): no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible en la información proporcionada

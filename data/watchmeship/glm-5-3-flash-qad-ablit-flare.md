# watchmeship/GLM-5.3-Flash-QAD-ablit-FLARE

## Resumen

GLM-5.3-Flash-QAD-ablit-FLARE es una variante "abliterated" (dirección de rechazo eliminada) del checkpoint GLM-5.3-Flash-NVFP4-MXFP8-CSF-QAD publicado por Local Inference Lab, Inc., que a su vez es una destilación con cuantización consciente (QAD) del modelo GLM-5.3-Flash de Z.ai. El autor de esta ficha en Hugging Face es el usuario watchmeship, y el modelo se distribuye bajo la licencia LIL-1.0 (Local Inference Lab License 1.0), derivada de Apache-2.0 con términos adicionales.

La relevancia de esta variante es doble: por un lado, mantiene el esquema de cuantización mixta NVFP4/MXFP8 con compresión CSF de los expertos enrutados, lo que permite servir un modelo de aproximadamente 341 000 millones de parámetros en dos GPU de 96 GB; por otro, aplica una eliminación de la dirección de rechazo sobre 60 módulos de atención y MLP en MXFP8, dando lugar a un modelo "sin censura" orientado a despliegues donde se requiere minimizar los rechazos del modelo.

El modelo es multimodal (pipeline image-text-to-text), con una torre de visión preservada byte a byte respecto al checkpoint base, y está pensado para despliegues tensor-parallel TP2 sobre dos NVIDIA RTX PRO 6000 Blackwell (GB202). No se han publicado datos de benchmarks ni de idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (GLM-5.3-Flash), con expertos enrutados (MoE) segun los tags y la estructura de pesos; detalles exactos no disponibles |
| Parametros totales | 340 973 184 454 (~341 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), MXFP8 (proyecciones de atencion y MLP, F8_E4M3 con weight_scale E8M0, grupo 32), escalas de bloque comprimidas con CSF; cuantizacion mixta gestionada por NVIDIA ModelOpt |
| Idiomas soportados | no disponible |
| Licencia | LIL-1.0 (Local Inference Lab License 1.0; Apache-2.0 con terminos adicionales) |
| Formato de pesos | safetensors (36 shards bajo `tensors/`), `quant_method: modelopt`, `quant_algo: MIXED_PRECISION` |

## Arquitectura y entrenamiento

El checkpoint base es una destilacion con cuantizacion consciente (QAD) del GLM-5.3-Flash, con un esquema de precision mixta: los expertos enrutados se almacenan en NVFP4 con escalas de bloque comprimidas mediante CSF, mientras que las proyecciones de atencion y MLP se guardan en MXFP8 (F8_E4M3 con escala E8M0 por grupo de 32 a lo largo de la dimension de entrada). El modelo incluye una torre de vision y un decodificador de lenguaje, y el repositorio mantiene el layout de 36 shards del checkpoint original.

La modificacion "abliterated" se realizo calculando deltas de direccion de rechazo a partir de dos fuentes fijadas por commit: `dealignai/GLM-5.3-Flash-UNCENSORED-FP8` @ `d5822b06` y `zai-org/GLM-5.3-Flash` @ `eb9eb208`. El delta (uncensored − stock) se aplico sobre el checkpoint base, tocando unicamente 60 tensores MXFP8 (atencion y MLP), requantizados con escalado `ceil448` y realimentacion de error de subespacio sobre 24 iteraciones. El resto de tensores —expertos NVFP4, escalas CSF, torre de vision y normalizaciones— son byte-identicos al base. Una compuerta no convergio completamente: `model.language_model.layers.42.self_attn.o_proj`, que debe tratarse como la capa menos modificada al comparar comportamientos.

## Capacidades

- Generacion de texto conversacional y multimodal (image-text-to-text).
- Procesamiento de imagenes mediante torre de vision preservada del checkpoint base.
- Razonamiento y generacion de codigo heredados del modelo GLM-5.3-Flash subyacente (sin datos especificos publicados).
- Comportamiento "sin censura": la direccion de rechazo ha sido eliminada en 60 modulos de atencion y MLP, reduciendo las negativas del modelo ante solicitudes que el modelo stock rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue tensor-parallel en dos GPU: el checkpoint esta disenado y validado para TP2 sobre dos RTX PRO 6000 Blackwell (GB202) de 96 GB cada una, con ~170 GB de pesos residentes y ~175 GB de VRAM libre recomendados por pareja. Encaja en entornos de laboratorio con este hardware concreto.
- Investigacion sobre alineacion y rechazo: al modificar solo 60 tensores MXFP8 y preservar el resto byte a byte, permite estudiar el efecto de la eliminacion de la direccion de rechazo con un control preciso de que pesos cambiaron.
- Evaluacion de cuantizacion QAD: sirve como caso de estudio de un pipeline NVFP4/MXFP8 con escalas CSF y realimentacion de error de subespacio, comparando comportamiento frente al checkpoint base.
- Servicio conversacional multimodal en produccion interna: con `flare run` y `--max-concurrency=8` y cache de prefijos de 64 GB, puede atender conversaciones multi-turno con entrada de imagen en infraestructura controlada.
- Generacion de contenido sin filtros de rechazo: util en entornos editoriales o de creacion donde los rechazos del modelo stock interrumpen el flujo, siempre que se apliquen salvaguardas externas.
- Comparacion de capas: la capa 42 (`self_attn.o_proj`) permite analizar el impacto de una ablacion parcialmente convergida frente al resto de modulos modificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~170 GB de pesos residentes; se recomienda disponer de ~175 GB libres por pareja de GPU para cache KV y activaciones.
- Configuracion validada: 2 × NVIDIA RTX PRO 6000 Blackwell (GB202), 96 GB cada una, 192 GB totales, en tensor-parallel TP2.
- No cabe en una unica GPU de 96 GB; se requiere multi-GPU.
- No cabe en GPU de consumo (RTX 4090, 5090, etc.) por el tamano del checkpoint.
- Despliegue: FLARE (runtime de NVIDIA, `flare run <pkg> --gpus=0,1 --max-concurrency=8 --served-model-name=GLM-5.3-Flash-Ablit --prefix-cache-memory=64G`); vLLM mediante la ruta estandar `modelopt` de precision mixta descrita en la model card del base.
- Latencia y throughput: no disponibles; solo se documenta `--max-concurrency=8` como valor validado en FLARE.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-QAD-ablit-FLARE (este) | ~341 B | no disponible | NVFP4 + MXFP8 + CSF | LIL-1.0 | Abliterated, TP2 en 2× GB202 |
| local-inference-lab/GLM-5.3-Flash-NVFP4-MXFP8-CSF-QAD | ~341 B (mismo layout) | no disponible | NVFP4 + MXFP8 + CSF | LIL-1.0 | Checkpoint base, con rechazos intactos |
| dealignai/GLM-5.3-Flash-UNCENSORED-FP8 | no disponible | no disponible | FP8 | no disponible | Fuente del delta de abliteracion |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | original (stock) | no disponible | Modelo original de referencia |

## Limitaciones y advertencias

- La abliteracion elimina la direccion de rechazo, lo que puede aumentar la probabilidad de generar contenido danino, sesgado o inapropiado; requiere salvaguardas externas en produccion.
- La capa `model.language_model.layers.42.self_attn.o_proj` no convergio completamente en el proceso de merge; su comportamiento puede diferir del resto de modulos modificados.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones especificas para esta variante.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Longitud de contexto no disponible en la informacion proporcionada.
- Licencia LIL-1.0: Apache-2.0 con terminos adicionales de Local Inference Lab; es una obra derivada y los archivos `LICENSE`, `NOTICE` y `LICENSES/` deben conservarse. Verificar compatibilidad antes de uso comercial.
- El repositorio contiene el checkpoint estandar de 36 shards, no un bundle runtime de Flare; para paquetes listos para ejecutar hay que buscar los repos etiquetados FLARE del ecosistema.
- Requiere hardware especifico (2× RTX PRO 6000 Blackwell); no es desplegable en GPU de consumo ni en una sola GPU de 96 GB.
- Sin descargas ni likes en el momento de la consulta; madurez y validacion comunitaria practicamente nulas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/watchmeship/GLM-5.3-Flash-QAD-ablit-FLARE
- Modelo base (QAD): https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4-MXFP8-CSF-QAD
- Fuente del delta uncensored: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Runtime FLARE: https://github.com/NVIDIA/hyperflare-inference

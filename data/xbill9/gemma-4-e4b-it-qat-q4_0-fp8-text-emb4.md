# xbill9/gemma-4-E4B-it-qat-q4_0-fp8-text-emb4

## Resumen

Este repositorio contiene una reconstruccion no oficial de los pesos del modelo Gemma 4 E4B-it entrenado con cuantizacion consciente (QAT), publicada por el usuario xbill9 de forma independiente a Google. Se parte de `google/gemma-4-E4B-it-qat-q4_0-unquantized` (revision `476025a`) y se reempaqueta unicamente la rama de texto: cada capa lineal se almacena en FP8 E4M3 con una escala float32 por canal de salida, mientras que las activaciones se cuantizan a FP8 por token en tiempo de ejecucion mediante `compressed-tensors`. Las embeddings, las embeddings por capa y el `lm_head` se heredan sin cambios de otro build intermedio en int4.

El checkpoint final ocupa 5,89 GiB frente a los 8.134.102.058 parametros totales del modelo safetensors, lo que lo situa en la gama de ~8 mil millones de parametros con un peso en disco muy contenido. La relevancia de esta ficha es doble: por un lado ilustra el flujo de trabajo de re-cuantizacion QAT->FP8 W8A8 sobre la familia Gemma 4; por otro, advierte de que se trata de un artefacto construido y verificado en offline pero **todavia no servido ni evaluado**, por lo que no hay garantias publicadas de calidad de generacion.

No debe confundirse con los pesos originales de Google: es una redistribucion en un formato de almacenamiento distinto, mantenida bajo el mismo regimen de licencia (Apache 2.0) y sin afiliacion con Google DeepMind. La model card es explicita al respecto y remite los informes de errores al propio repositorio, no al autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (build de solo texto de la familia Gemma 4, segun los tags del repositorio) |
| Parametros totales | 8.134.102.058 (8,13 mil millones, safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 (W8A8) en capas lineales; embeddings y `lm_head` en int4; origen QAT q4_0 (escala por grupo de 32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con referencia al texto de licencia de Gemma 4) |
| Formato de pesos | safetensors con `compressed-tensors` (`float-quantized`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base (atencion, MoE, hibridez, etc.), solo su naturaleza: una variante de **texto** de la familia Gemma 4 con 8,13 mil millones de parametros totales. Los pesos originales fueron entrenados por Google con QAT sobre una rejilla de 4 bits con una escala por grupo de 32 valores. Este build no reentrena nada: reempaqueta esos pesos a un formato de servicio.

El proceso de construccion es el siguiente. Se parte del checkpoint QAT sin cuantizar y se convierten **343 modulos lineales** a FP8 E4M3, con una escala float32 por canal de salida y cuantizacion de activaciones a FP8 por token. En total se recuantizan **3.972.792.320 valores**. Debido a que FP8 con una escala por canal no puede representar las escalas por grupo del QAT, el autor vuelve a redondear los pesos: el error RMS relativo medido es del **2,63 %** y el error maximo, como fraccion del valor mayor de su fila, del **3,57 %**. Los otros **320 tensores** (embeddings, embeddings por capa y `lm_head`) se copian byte a byte desde `xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text-emb4` (revision `2c02a2c`); el `lm_head` esta desligado (untied). No se emplean datos de calibracion. Las herramientas de construccion son `fp8_text.py` y `repack_q4_0.py`, incluidas en el propio repositorio.

Para quienes necesiten la rejilla QAT exacta, la model card remite explicitamente al build `xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text`, ya que esta variante FP8 introduce un error de redondeo adicional.

## Capacidades

- Generacion de texto y uso conversacional, segun los tags `text-generation` y `conversational`.
- Modelo **solo texto**: no procesa imagenes, audio ni video.
- Capacidad de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Cobertura multilingue: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Estado de evaluacion: **no evaluado ni servido** en el momento de publicacion de los datos; el autor indica que esta en cola para una tanda de servicio sobre una AMD Instinct MI300X.

## Casos de uso

- **Asistente conversacional autoalojado de bajo consumo:** con un checkpoint de 5,89 GiB, el modelo cabe en una sola GPU de gama consumer y permite desplegar un chatbot interno sin depender de APIs externas, con la ventaja de que todo el texto queda dentro de la infraestructura propia.
- **Servicio de alto rendimiento con vLLM:** el repositorio declara `library_name: vllm` y formato `compressed-tensors`, por lo que el camino natural de despliegue es vLLM con batching continuo sobre hardware que soporte FP8. Resulta adecuado para endpoints con muchas peticiones concurrentes de longitud media.
- **Investigacion en cuantizacion:** sirve como material de comparacion directa entre tres formatos de los mismos pesos (FP8 W8A8, w4a16 y QAT sin cuantizar), lo que permite medir el impacto real del re-redondeo en la perplejidad y en tareas generativas.
- **Aprovechamiento de aceleradores AMD Instinct:** dado que el autor planifica la tanda de servicio en una MI300X, es un candidato para validar el soporte de FP8 de esa plataforma en cargas de generacion de texto.
- **Prototipado rapido en una unica GPU:** al ocupar poco espacio en disco y memoria, se puede levantar un entorno de pruebas en una workstation con una GPU Ada (por ejemplo, una RTX 4090) sin necesidad de multi-GPU ni sharding.
- **Generacion masiva de texto en pipelines internos:** resumen, reformulacion o clasificacion generativa de documentos donde el requisito principal sea coste por token bajo y disponibilidad local, siempre que se acepte la ausencia de evaluacion publicada.
- **Banco de pruebas de formatos `compressed-tensors`:** util para validar que una version concreta de vLLM o de las librerias de cuantizacion carga correctamente un checkpoint FP8 mixto con embeddings int4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que el modelo no ha sido servido ni evaluado, y solo aporta metricas internas de fidelidad de la cuantizacion frente a los pesos QAT de origen:

| Metrica de construccion (verify_report.json) | Valor |
|---|---:|
| Modulos lineales en FP8 | 343 |
| Valores cuantizados | 3.972.792.320 |
| Error RMS relativo | 2,63 % |
| Error maximo (fraccion del mayor valor de su fila) | 3,57 % |
| Otros tensores identicos byte a byte | 320 de 320 |
| Tamano del checkpoint | 5,89 GiB |

## Requisitos de hardware

- **VRAM estimada:** los pesos ocupan 5,89 GiB; sumando cache KV, buffers de activacion en FP8 y overhead del runtime, un presupuesto realista de 8-10 GiB de VRAM es suficiente para inferencia en una unica GPU.
- **GPU de datacenter compatibles:** AMD Instinct MI300X (plataforma elegida por el autor para la fase de servicio), NVIDIA H100 y otras GPU Hopper que soportan FP8 de forma nativa.
- **GPU profesionales/consumer con FP8:** arquitecturas Ada como L40S, RTX 6000 Ada y RTX 4090 pueden ejecutar FP8; en GPUs sin soporte nativo de FP8 el runtime tendria que emularlo o descomprimir, con penalizacion de rendimiento.
- **Cabe en GPU consumer:** si, con margen amplio. Una RTX 4090 (24 GB), una RTX 4080 (16 GB) o incluso tarjetas de 12-16 GB deberian alojar el modelo, aunque la viabilidad depende del soporte FP8 del runtime.
- **Opciones de despliegue:** vLLM es la via declarada por el autor y la mejor soportada por el formato `compressed-tensors`. Ollama y llama.cpp no son compatibles directamente con este formato y requeririan convertir a GGUF (no disponible). El soporte en TGI u otros servidores no esta confirmado en la informacion proporcionada.
- **Latencia y throughput:** no disponible. No se han publicado mediciones de tokens por segundo, TTFT ni curvas de escalado con tamano de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `xbill9/gemma-4-E4B-it-qat-q4_0-fp8-text-emb4` (este) | 8,13 mil millones | safetensors, FP8 W8A8 + embeddings int4 | no disponible | Apache 2.0 | No servido ni evaluado |
| `google/gemma-4-E4B-it-qat-q4_0-unquantized` (origen) | 8,13 mil millones | safetensors QAT sin cuantizar | no disponible | Apache 2.0 | Pesos oficiales de Google |
| `xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text-emb4` | 8,13 mil millones | int4 w4a16, embeddings int4 | no disponible | Apache 2.0 | Build intermedio del mismo autor |
| `xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text` | 8,13 mil millones | int4 w4a16, rejilla QAT exacta | no disponible | Apache 2.0 | Alternativa recomendada para fidelidad QAT |

No se dispone de datos de contexto, idiomas ni rendimiento de modelos externos de la misma categoria, por lo que la comparacion se limita a las variantes del propio linaje Gemma 4 E4B-it.

## Limitaciones y advertencias

- **Sin evaluacion publicada:** el propio autor indica que el modelo no ha sido servido ni evaluado; cualquier uso en produccion requiere una validacion propia previa.
- **Solo texto:** no admite entradas multimodales.
- **Build no oficial:** no esta afiliado ni respaldado por Google; los problemas deben reportarse en el repositorio del autor y no a Google DeepMind.
- **Error de cuantizacion acumulado:** el re-redondeo desde la rejilla QAT a FP8 introduce un error RMS relativo del 2,63 % y un error maximo del 3,57 % respecto a los pesos de origen, lo que puede degradar la calidad frente a la variante `w4a16-ct-text`.
- **Requisito de hardware FP8:** el rendimiento optimo depende de GPU Ada, Hopper o MI300X; en hardware sin FP8 nativo el despliegue puede ser inviable o lento.
- **Idiomas no documentados:** no se especifica que lenguas estan cubiertas ni con que calidad, lo que es un riesgo para aplicaciones en castellano.
- **Riesgo de alucinacion:** no disponible; no se han publicado evaluaciones de veracidad o fidelidad.
- **Sesgos:** no disponible; no hay analisis de sesgos en la informacion proporcionada.
- **Licencia:** Apache 2.0, con enlace al texto de licencia de Gemma 4. Conviene revisar los terminos especificos de uso comercial de la familia Gemma antes de desplegar en producto.
- **Formatos alternativos:** no hay version GGUF ni cuantizaciones listas para llama.cpp u Ollama, lo que limita el despliegue en entornos sin vLLM.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-fp8-text-emb4
- Modelo base (QAT sin cuantizar): https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Build intermedio con embeddings int4: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text-emb4
- Build recomendado para la rejilla QAT exacta: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Script de construccion `fp8_text.py` y utilidad `repack_q4_0.py`: incluidos en el propio repositorio
- Documento original de Google conservado en el repo: `ORIGINAL_README.md`

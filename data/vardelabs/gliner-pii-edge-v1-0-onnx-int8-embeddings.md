# vardelabs/gliner-pii-edge-v1.0-onnx-int8-embeddings

## Resumen

Este repositorio contiene una versión optimizada del modelo `knowledgator/gliner-pii-edge-v1.0`, publicada por Varde Labs. Se trata de un export a ONNX del modelo original en fp32 al que se le ha aplicado cuantización dinámica int8 exclusivamente sobre la tabla de embeddings de tokens (los pesos de la operación `Gather`), manteniendo en fp32 todas las capas que realizan cómputo. El objetivo es reducir el tamano del artefacto sin degradar de forma apreciable la calidad de detección.

El modelo pertenece a la familia GLiNER (Generalist and Lightweight model for Named Entity Recognition), disenada para reconocimiento de entidades nombradas, y en este caso esta especializado en la deteccion de informacion personal identificable (PII). La modificacion introducida por Varde Labs reduce el peso del fichero de 181 MB a 123 MB, con una caida de recall de nombres completos de solo medio punto en los umbrales evaluados.

Es relevante porque permite ejecutar un detector de PII en entornos con recursos limitados (edge, CPU, contenedores ligeros) manteniendo una precision cercana a la del modelo fp32. La licencia Apache-2.0 facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (transformer encoder para NER); export ONNX con embeddings cuantizados a int8 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamico solo en la tabla de embeddings de tokens (`Gather`); resto de capas en fp32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

El modelo base es un GLiNER, una arquitectura de reconocimiento de entidades orientada a detectar tipos de entidad definidos por etiquetas en texto. El repositorio de Varde Labs no reentrena ni modifica la arquitectura: parte del export ONNX fp32 del modelo upstream `knowledgator/gliner-pii-edge-v1.0` (correspondiente al commit `9b7f39b0a2da971a5beea78d35f1539d4009c891`) y le aplica una cuantizacion dinamica int8 mediante `onnxruntime.quantization.quantize_dynamic`.

La unica transformacion es la cuantizacion de los pesos de la operacion `Gather`, es decir, la tabla de embeddings de tokens de 77 MB. Todas las capas que realizan calculos permanecen en fp32. El tokenizer y el fichero `gliner_config.json` son los del modelo upstream, sin cambios. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

El repositorio incluye un script `build.py` que reconstruye el fichero a partir del modelo upstream. Con `onnx==1.23.2` y `onnxruntime==1.31.0`, el SHA-256 de la salida es `906defc49c7c97aa05842f5c6bca51d3a6f4d0e17e8c73e334ebd834d7f7d472`.

## Capacidades

- Reconocimiento de entidades nombradas orientado a PII, con etiquetas como `person` y `name` empleadas en la evaluacion del autor.
- Deteccion y extraccion de spans de nombres completos de personas en texto.
- Inferencia sobre CPU: el modelo corre en ONNX Runtime sin necesidad de GPU.
- Carga rapida: el autor reporta que el modelo carga aproximadamente 0,1 s mas rapido que la version fp32 en CPU Apple Silicon.
- Misma velocidad por texto que la version fp32 en CPU Apple Silicon (sin penalizacion de latencia por la cuantizacion de embeddings).
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modos de razonamiento explicito en la informacion disponible.

## Casos de uso

- Redaccion de PII en pipelines de datos: integrado como paso previo al almacenamiento o al envio de texto a un LLM, el modelo detecta y permite enmascarar nombres y otras entidades personales antes de que el contenido salga del perimetro de la organizacion.
- Cumplimiento del RGPD en procesamiento de documentos: aplicar el modelo sobre formularios, correos o tickets para localizar datos personales y anonimizarlos antes de archivarlos, aprovechando la licencia Apache-2.0 para uso comercial.
- Preprocesado en entornos edge o sin GPU: al ser un artefacto ONNX de 123 MB, puede desplegarse en dispositivos con recursos limitados, contenedores ligeros o funciones serverless que solo disponen de CPU.
- Filtrado en tiempo real de logs y trazas: insertar el detector en el flujo de ingesta para marcar registros que contengan nombres antes de persistirlos en sistemas de observabilidad.
- Anonimizacion de datasets para entrenamiento: limpiar corpus de texto de identificadores personales antes de usarlos para ajustar otros modelos, reduciendo el riesgo de memorizacion de datos sensibles.
- Enmascarado previo en aplicaciones de atencion al cliente: procesar conversaciones multi-turno para ocultar nombres de clientes antes de reenviar el historial a sistemas de analitica o a terceros.
- Cumplimiento en herramientas de auditoria interna: escanear repositorios documentales en busca de PII y generar informes de exposicion, ejecutando el modelo en local sin depender de servicios externos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible provienen de una evaluacion interna de Varde Labs sobre un conjunto sintetico de 1.680 prompts que mencionan 240 personas inventadas procedentes de 30 origenes de nombre, usando las etiquetas `person` y `name`. Se mide el recall de nombres completos.

| Variante | Tamano | Recall de nombres completos (umbral 0,5) |
|---|---|---|
| fp32 (upstream) | 181 MB | 97,6% |
| int8 solo embeddings (esta version) | 123 MB | 97,1% |
| int8 en todas las capas (no publicada) | 46 MB | 91,1% |

Segun el autor, el recall de nombres completos cambia como maximo medio punto en los umbrales 0,6, 0,5, 0,4 y 0,3 respecto al modelo fp32. Los spans que no son nombres caen ligeramente en cada umbral. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar, ya que no aplican a un modelo de NER.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para inferencia en CPU mediante ONNX Runtime.
- Memoria: el fichero de pesos ocupa 123 MB, por lo que el consumo de RAM en inferencia es muy bajo y compatible con dispositivos de recursos limitados.
- GPU recomendadas: no aplica; no se documentan requisitos de GPU. Puede ejecutarse en CPU de portatiles y servidores modestos.
- Cabe en cualquier consumer GPU o incluso en despliegue puramente CPU; no se especifica soporte GPU particular.
- Opciones de despliegue: ONNX Runtime (`onnxruntime`), con soporte directo del formato `onnx/model.onnx`. El autor referencia `onnx==1.23.2` y `onnxruntime==1.31.0` para reconstruir el artefacto.
- Latencia y throughput: no se publican cifras absolutas. El autor indica que el tiempo por texto es identico al de la version fp32 en CPU Apple Silicon y que la carga es aproximadamente 0,1 s mas rapida.

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion | Recall (umbral 0,5) | Licencia |
|---|---|---|---|---|
| vardelabs/gliner-pii-edge-v1.0-onnx-int8-embeddings | 123 MB | int8 solo embeddings | 97,1% | Apache-2.0 |
| knowledgator/gliner-pii-edge-v1.0 (upstream fp32 ONNX) | 181 MB | ninguna (fp32) | 97,6% | Apache-2.0 |
| Variante int8 total (mencionada pero no publicada) | 46 MB | int8 todas las capas | 91,1% | Apache-2.0 |

No se dispone de comparaciones con otros modelos de deteccion de PII en la informacion proporcionada.

## Limitaciones y advertencias

- Los datos de evaluacion proceden de un conjunto sintetico de nombres inventados, no de texto real ni de PII autentica, por lo que el rendimiento en produccion puede diferir.
- La cuantizacion int8 de los embeddings reduce ligeramente el recall (97,1% frente a 97,6% al umbral 0,5) y el autor senala que los spans que no son nombres caen en todos los umbrales evaluados.
- No hay informacion publica sobre sesgos por origen, genero o etnia mas alla del uso de 30 origenes de nombre en la evaluacion sintetica.
- Riesgo de alucinacion o de falsos positivos/negativos inherente a cualquier modelo de NER; no se documentan tasas de precision sobre clases distintas de `person` y `name`.
- Idiomas soportados: no disponibles. No se especifica la cobertura multilingue del modelo base.
- Longitud de contexto y numero de parametros: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0, que permite uso comercial; el propio repositorio indica que esta copia esta modificada respecto al original, por lo que conviene conservar los avisos de licencia correspondientes.
- Modelo con 0 descargas y 1 like en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vardelabs/gliner-pii-edge-v1.0-onnx-int8-embeddings
- Modelo base: https://huggingface.co/knowledgator/gliner-pii-edge-v1.0
- Commit del export fp32 upstream referenciado por el autor: `9b7f39b0a2da971a5beea78d35f1539d4009c891`

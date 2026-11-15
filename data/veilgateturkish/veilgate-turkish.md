# VEILGATETURKISH/veilgate-turkish

## Resumen

VeilGate High v1 es un modelo de reconocimiento de entidades nombradas (NER) especializado en turco, desarrollado por el usuario VEILGATETURKISH. Se trata de un ajuste fino de XLM-RoBERTa-large orientado a la deteccion local de cuatro tipos de entidad: PERSON, ORGANIZATION, LOCATION y ADDRESS, con devolucion de offsets exactos a nivel de caracter. El modelo esta disenado para ejecutarse en local sobre CPU con PyTorch, sin llamadas a servicios remotos, lo que lo hace adecuado para pipelines de privacidad y anonimizacion de datos.

La arquitectura parte del encoder XLM-RoBERTa-large (561.102.427 parametros en el pipeline completo) e incorpora cabezas adicionales de secuencia y fusion contextual de dos vistas, junto con una capa CRF para el decodificado de etiquetas BIO9. El modelo se distribuye en FP32 como formato de referencia y con un paquete opcional INT8 de solo pesos (almacenamiento INT8, computo FP32). La ventana de entrada esta limitada a 512 subtokens por vista.

El modelo es relevante en el contexto actual de tratamiento de datos personales: ofrece una alternativa offline y auditable para detectar informacion identificativa en texto turco, un idioma habitualmente poco cubierto por los modelos NER multilingues genericos. La model card advierte explicitamente de que "High" describe capacidad y requisitos de recursos, no un grado de garantia de privacidad, y de que el modelo no es generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabezas de secuencia y fusion contextual de dos vistas, y capa CRF |
| Parametros totales | 561.102.427 (pipeline completo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 subtokens por vista (dos vistas; incluye tokens especiales) |
| Tipos de cuantizacion | FP32 (referencia) e INT8 solo pesos (almacenamiento INT8, computo FP32) |
| Idiomas soportados | Turco (principal), ingles, aleman, frances, espanol e italiano |
| Licencia | other (`upstream-and-source-notices`, ver LICENSE.md) |
| Formato de pesos | safetensors |
| Tarea | Token classification (NER, esquema BIO9) |
| Etiquetas | O, B-/I- para PERSON, ORGANIZATION, LOCATION y ADDRESS |
| Tamano del repositorio | 7,4 GB |
| Revision fijada | `3fa63b25f9403316373f2f24e4da5fd2015fd96d` |
| Dependencias de referencia | PyTorch 2.8.0, Transformers 4.57.6 |

## Arquitectura y entrenamiento

El modelo se construye sobre el encoder de `FacebookAI/xlm-roberta-large`, al que se anaden cabezas aprendidas de secuencia y de fusion contextual de dos vistas, mas una capa CRF para la decodificacion de la secuencia de etiquetas. La inferencia se realiza mediante un adaptador propio (`inference.py` y `runtime/`) que expone la funcion `load_model` y `recognize`; la model card advierte de que el `transformers.pipeline("ner")` generico no reproduce el comportamiento del modelo porque omite las cabezas de secuencia y fusion y la CRF.

El entrenamiento se realizo principalmente en turco, con datos adicionales en ingles, aleman, frances, espanol e italiano. La ultima pasada de entrenamiento proceso 102.464 vistas unicas, con 109.856 muestras y 27.464 actualizaciones del optimizador. La entrada se procesa en dos vistas (cruda y canonica) que deben caber cada una en el presupuesto de 512 subtokens, incluidos los tokens especiales; si se excede, el adaptador lanza `BioInputTooLong` y el gateway asociado devuelve HTTP 422, sin truncado ni troceado silencioso. No se detalla en la informacion disponible si se aplicaron tecnicas de RLHF o DPO; al ser un modelo discriminativo de etiquetado, no procede un ajuste conversacional.

## Capacidades

- Reconocimiento de entidades nombradas de cuatro tipos: PERSON, ORGANIZATION, LOCATION y ADDRESS.
- Devolucion de offsets exactos de caracter en el texto original, con semantica `[start, end)` sobre indices Unicode de Python (no bytes ni UTF-16).
- Distincion contextual entre organizacion y lugar fisico (por ejemplo, una universidad como institucion frente a su campus como ubicacion).
- Manejo del esquema BIO9 con etiquetas `B-`/`I-` para cada tipo de entidad.
- Tratamiento de direcciones como un unico span contiguo que incluye separadores internos, sin anidar la ciudad como LOCATION.
- Soporte de sufijos turcos, grafias ASCII, apostrofes ausentes y variantes coloquiales en la deteccion de entidades.
- Inferencia local offline en CPU tras la instalacion, sin descargas ni llamadas a modelos remotos durante el uso normal.
- Capacidad multilingue limitada a los seis idiomas declarados, con el turco como idioma principal de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo discriminativo de etiquetado.

## Casos de uso

- Anonimizacion de datos personales en textos turcos: el modelo detecta nombres, organizaciones, ubicaciones y direcciones con offsets exactos, lo que permite sustituir o enmascarar cada mencion en el texto original sin reconstruir manualmente las posiciones.
- Cumplimiento de proteccion de datos (KVKK/GDPR) en pipelines de ingestion: al ejecutarse en local y sin red, puede integrarse en procesos de preprocesado de documentos para marcar informacion identificativa antes de almacenarla o enviarla a otros sistemas.
- Preprocesado de tickets de soporte y correos de atencion al cliente: la deteccion de direcciones y nombres permite redactar automaticamente datos sensibles en conversaciones multi-turno antes de su analisis o archivado.
- Enriquecimiento de datos estructurados a partir de texto libre: los offsets y tipos de entidad permiten extraer campos de direccion, organizacion o persona para alimentar bases de datos o formularios, respetando la regla de que una direccion contigua es un unico span.
- Moderacion y revision de contenido en foros o plataformas: la deteccion de organizaciones y personas facilita la revision de menciones institucionales o de actores concretos, con distincion entre institucion y lugar fisico.
- Construccion de gateways de privacidad: el modelo se disena como componente de un gateway que valida la longitud de entrada y devuelve errores controlados (HTTP 422) cuando el texto excede el presupuesto de 512 subtokens por vista.
- Investigacion en NER multilingue: sirve como referencia para evaluar el rendimiento en turco frente a modelos multilingues genericos, con paquetes FP32 e INT8 comparables sobre los mismos pesos.

## Benchmarks y rendimiento

La model card referencia un fichero `evaluation.json` con mediciones agregadas, por tipo de entidad, por idioma, por escenario, de direcciones y de recursos, pero en la informacion proporcionada no se incluyen los valores numericos. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo de referencia esta pensado para ejecutarse en CPU con PyTorch, y el repositorio ocupa 7,4 GB (incluye FP32 e INT8).
- GPU recomendadas: no disponibles en la informacion proporcionada; el diseno prioriza CPU local.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el paquete INT8 reduce el almacenamiento de pesos pero mantiene el computo en FP32.
- Opciones de despliegue: adaptador propio (`inference.py` y `runtime/`) con PyTorch 2.8.0 y Transformers 4.57.6; se requieren wheels de CPU Torch (Linux/Windows) o el wheel estandar de PyPI en macOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card menciona mediciones de recursos en `evaluation.json`, pero no se incluyen sus valores.
- Parametro de configuracion: `load_model(..., threads=2)` permite fijar el numero de hilos de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VeilGate High v1 | 561.102.427 | 512 subtokens por vista (dos vistas) | NER de 4 tipos en turco y 5 idiomas adicionales | other (`upstream-and-source-notices`) | Hugging Face, inferencia local CPU |
| XLM-RoBERTa-large (base) | no disponible en la informacion | no disponible en la informacion | Encoder multilingue generico | no disponible en la informacion | Hugging Face |
| Alternativas NER multilingues | no disponible | no disponible | NER generico | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables concretos en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- "High" describe capacidad y requisitos de recursos, no un grado de garantia de privacidad; la aceptacion independiente del producto sigue abierta segun la model card.
- Es un modelo NER discriminativo, no un modelo generativo de chat; no debe usarse para generacion de texto, razonamiento ni agentes.
- La entrada esta limitada a 512 subtokens por vista, incluidos tokens especiales; el texto que excede el limite lanza `BioInputTooLong` y el gateway devuelve HTTP 422, sin truncado ni troceado automatico.
- El adaptador propio es obligatorio: `transformers.pipeline("ner")` generico no reproduce el comportamiento del modelo al omitir las cabezas de secuencia y fusion y la CRF.
- Los offsets son indices Unicode de Python `[start, end)`, no offsets de bytes ni UTF-16; su uso incorrecto puede corromper la anonimizacion.
- El modelo no reconstruye campos de direccion ausentes; los fragmentos en mensajes separados permanecen como menciones separadas.
- Los limites de anotacion son sutiles: la distincion ORGANIZATION/LOCATION depende del contexto, los encabezados de identidad (TC/T.C./TCKN) se etiquetan como `O` y los numeros de identidad no forman parte de este conjunto de etiquetas.
- El rendimiento fuera del turco (ingles, aleman, frances, espanol, italiano) es secundario y no se detalla en la informacion disponible.
- La licencia es `other` con nombre `upstream-and-source-notices`; es necesario revisar `LICENSE.md` antes de cualquier uso comercial, ya que las condiciones no se detallan en la informacion proporcionada.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; al ser un modelo de etiquetado, el riesgo principal es la clasificacion erronea de menciones, no la generacion de contenido falso.
- El modelo se distribuye con pesos fijados a una revision concreta; las commits posteriores solo de documentacion no requieren sustituir los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VEILGATETURKISH/veilgate-turkish
- Model card en turco: https://huggingface.co/VEILGATETURKISH/veilgate-turkish/blob/main/README.tr.md
- Licencia: https://huggingface.co/VEILGATETURKISH/veilgate-turkish/blob/main/LICENSE.md
- Articulo de referencia: arXiv:2506.20920
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large

# WindstormLabs/translate-yap-fr

## Resumen

WindstormLabs/translate-yap-fr es un modelo de traduccion automatica entrenado especificamente para el par de idiomas yap (yapese, lengua micronesia de la isla de Yap) → frances. Lo publica Windstorm Labs como parte de su catalogo abierto WindyWord/WindyTranslate, y se distribuye como un ajuste fino sobre el modelo OPUS-MT de Helsinki-NLP (Helsinki-NLP/opus-mt-yap-fr). La arquitectura es Marian, la misma familia de modelos encoder-decoder de traduccion que usa OPUS-MT, dentro de la libreria transformers.

El interes del modelo es la cobertura de un par de bajos recursos: el yapese tiene muy pocos hablantes y practicamente no existen sistemas de traduccion comercial para el. Este ajuste busca producir traducciones yap → fr desplegables tanto en GPU (formato Transformers) como en CPU con cuantizacion INT8 mediante CTranslate2, lo que lo hace util para integrarse en aplicaciones de traduccion con recursos limitados.

El repositorio no publica una puntuacion de calidad ni resultados de benchmarks; el autor remite a la pagina de catalogo para las metricas de cribado. Ademas, en octubre de 2026 se retiraron temporalmente las variantes WindyScripture por una revision de licencias de los textos fuente de eBible, manteniendo intactas las variantes estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion) |
| Parametros totales | no disponible (el repositorio ocupa 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (variante CTranslate2); FP32/FP16 en el formato Transformers |
| Idiomas soportados | yap (yapese) como origen, fr (frances) como destino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato Transformers) y CTranslate2 |
| Tamano del repositorio | 0,3 GB |
| Modelo base | Helsinki-NLP/opus-mt-yap-fr |
| Libreria | transformers |
| Pipeline | translation |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Helsinki-NLP/opus-mt-yap-fr, perteneciente a la familia OPUS-MT de la Universidad de Helsinki. La arquitectura subyacente es Marian, un transformer secuencial (encoder-decoder) con atencion estandar, disenado originalmente para traduccion automatica neuronal y optimizado para entrenamiento e inferencia eficientes. El ajuste fino se distribuye en dos subcarpetas dentro del repositorio: `lora/`, etiquetada como WindyStandard y pensada para inferencia en GPU con transformers, y `lora-ct2-int8/`, una conversion a CTranslate2 con cuantizacion INT8 para inferencia en CPU.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco describe innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Lo unico documentado sobre el proceso es la procedencia de los pesos: derivan del modelo OPUS-MT original y se liberan bajo la misma licencia Apache-2.0. Existe una nota de octubre de 2026 que indica que las variantes WindyScripture (`herm0-scripture/` y `scripture-ct2-int8/`) fueron retiradas del repositorio mientras se revisan las licencias de sus textos fuente de eBible, medida descrita por el autor como precaucion y no como conclusion legal.

## Capacidades

- Traduccion de texto de yapese a frances, tarea unica para la que fue entrenado.
- Inferencia en GPU mediante el formato Transformers (subcarpeta `lora/`).
- Inferencia rapida en CPU mediante CTranslate2 con cuantizacion INT8 (subcarpeta `lora-ct2-int8/`).
- Integracion en la familia de aplicaciones Windy Word.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No se documentan capacidades multilingues mas alla del par yap → fr.

## Casos de uso

- Traduccion de documentacion y materiales escritos en yapese al frances para administraciones, ONG o investigadores que trabajan con comunidades de la isla de Yap.
- Preservacion linguistica: digitalizacion y traduccion de textos yapese a una lengua de mayor difusion para catalogacion y estudio academico.
- Aplicaciones de traduccion en movil o escritorio con la variante INT8, ya que CTranslate2 permite ejecutar el modelo en CPU sin GPU dedicada.
- Integracion en pipelines de traduccion por lotes en servidores sin acelerador, usando `lora-ct2-int8/` para reducir coste computacional.
- Herramienta de apoyo para traductores humanos que trabajen con yapese, generando un borrador en frances que despues se revisa.
- Servicios dentro del ecosistema Windy Word, donde el modelo actua como backend de traduccion para usuarios finales.
- Prototipado rapido de interfaces de traduccion gracias al pequeno tamano del repositorio (0,3 GB) y a la API estandar de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se publica ninguna puntuacion de calidad en el repositorio y que las puntuaciones de cribado, cuando se han medido, figuran en la pagina de catalogo del proyecto.

## Requisitos de hardware

- El repositorio ocupa 0,3 GB, lo que sugiere un modelo pequeno tipo OPUS-MT (del orden de decenas de millones de parametros); el numero exacto no esta disponible.
- VRAM de inferencia estimada: inferior a 1 GB en FP32 para el conjunto de pesos segun el tamano del repositorio, aunque el dato oficial no esta publicado.
- Cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), e incluso en GPUs de gama baja.
- La variante `lora-ct2-int8/` esta disenada para ejecucion en CPU, por lo que no requiere GPU.
- Opciones de despliegue documentadas: transformers (PyTorch) y CTranslate2. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| WindstormLabs/translate-yap-fr | Marian (fine-tune) | yap → fr | Apache-2.0 | HuggingFace |
| Helsinki-NLP/opus-mt-yap-fr | Marian | yap → fr | Apache-2.0 | HuggingFace |
| Otros modelos OPUS-MT para pares de bajos recursos | Marian | multiples | Apache-2.0 | HuggingFace |

No se dispone de datos de parametros, contexto ni rendimiento comparados para estos modelos en la informacion proporcionada; el modelo base directo y su version ajustada comparten arquitectura y licencia.

## Limitaciones y advertencias

- No hay benchmarks ni puntuacion de calidad publicados, por lo que el rendimiento real del ajuste no esta verificado de forma independiente.
- El modelo solo traduce en la direccion yap → fr; no soporta la direccion inversa ni otros idiomas.
- Al ser un ajuste sobre un modelo OPUS-MT de bajos recursos, es esperable una calidad limitada y posible alucinacion en textos largos o poco representados, aunque no se han publicado cifras al respecto.
- Riesgo de sesgo derivado de los corpus de entrenamiento del modelo base, no documentados en esta ficha.
- Longitud de contexto no especificada; se desconoce el limite practico para entradas largas.
- Las variantes WindyScripture fueron retiradas temporalmente por una revision de licencias de textos fuente de eBible; conviene verificar el estado legal de esas variantes antes de usarlas.
- El modelo registra 0 descargas y 0 likes en HuggingFace en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribucion indicada en `NOTICE.md` y respetar la licencia del modelo base OPUS-MT.

## Enlaces

- HuggingFace: https://huggingface.co/WindstormLabs/translate-yap-fr
- Copia canonica: https://huggingface.co/WindyTranslate/translate-yap-fr
- Pagina de catalogo: https://windytranslate.com/models/translate-yap-fr
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-yap-fr
- Aplicaciones Windy Word: https://windyword.ai
- Licencia del repositorio: `LICENSE`
- Atribucion: `NOTICE.md`

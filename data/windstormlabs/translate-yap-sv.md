# WindstormLabs/translate-yap-sv

## Resumen

translate-yap-sv es un modelo de traduccion automatica especializado en un unico par de idiomas: yapese (yap) a sueco (sv). Lo publica WindstormLabs dentro de su catalogo abierto WindyWord, y se distribuye como un ajuste fino del modelo Helsinki-NLP/opus-mt-yap-sv del grupo OPUS-MT de la Universidad de Helsinki. Su proposito es cubrir una combinacion linguistica de muy bajos recursos, para la que existen poquisimas alternativas publicas: el yapese es una lengua austronesia hablada en los Estados Federados de Micronesia, con del orden de unos pocos miles de hablantes, y el sueco es una lengua germánica con millones de hablantes, de modo que el par es altamente asimetrico en disponibilidad de datos.

Tecnicamente se trata de un modelo MarianMT, es decir, un transformer seq2seq encoder-decoder entrenado para traduccion, la misma familia que emplea OPUS-MT. El repositorio ocupa 0,3 GB e incluye dos variantes de despliegue: WindyStandard, en formato Transformers para inferencia en GPU, y una conversion INT8 a CTranslate2 pensada para inferencia rapida en CPU. Los pesos derivan del modelo Apache-2.0 de Helsinki-NLP y se liberan bajo la misma licencia.

La relevancia del modelo es doble. Por un lado, da acceso practico a un par de traduccion practicamente ausente en los grandes modelos multilingues. Por otro, su propia model card documenta un episodio de gobernanza relevante: en octubre de 2026 se retiraron temporalmente las variantes WindyScripture (herm0-scripture y scripture-ct2-int8) mientras se revisaban las licencias de los textos fuente eBible, como medida de precaucion y no como conclusion legal. Para un desarrollador que necesite evaluar el modelo, esto implica que el repositorio actual es mas reducido que su historico y que conviene verificar la disponibilidad de variantes antes de disenar un pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer seq2seq encoder-decoder) para traduccion automatica |
| Parametros totales | no disponible (el repositorio ocupa 0,3 GB; no se declara el recuento en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (variante lora-ct2-int8 via CTranslate2); el formato Transformers se distribuye sin cuantizar |
| Idiomas soportados | origen: yapese (yap); destino: sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) y CTranslate2 INT8 |
| Tarea | translation (traduccion yap → sv) |
| Modelo base | Helsinki-NLP/opus-mt-yap-sv (OPUS-MT, Universidad de Helsinki) |
| Tipo de ajuste | fine-tune sobre el modelo base (etiquetado como `base_model:finetune`) |
| Variantes en el repositorio | `lora/` (WindyStandard, Transformers/GPU) y `lora-ct2-int8/` (WindyStandard CPU INT8) |
| Variantes retiradas | `herm0-scripture/` y `scripture-ct2-int8/`, retiradas el 2026-10-04 a la espera de revision de licencias |
| Tamano del repositorio | 0,3 GB |
| Descargas | 0 |
| Likes | 0 |
| Autor | WindstormLabs |

## Arquitectura y entrenamiento

La arquitectura es MarianMT, un transformer encoder-decoder con atencion estandar disenado especificamente para traduccion automatica neuronal y popularizado por el proyecto OPUS-MT de la Universidad de Helsinki. En esta familia, cada par de idiomas suele entrenarse como un modelo independiente y compacto, lo que da lugar a checkpoints de tamano reducido en comparacion con los modelos multilingues masivos. El modelo aqui descrito es un ajuste fino del checkpoint Helsinki-NLP/opus-mt-yap-sv, que a su vez se apoya en los corpus paralelos recopilados en el ecosistema OPUS.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset utilizado en el ajuste fino, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card tampoco detalla hiperparametros, esquema de aprendizaje ni si el ajuste se realizo sobre los pesos completos o mediante adaptadores: la variante principal se llama `lora/`, pero la propia descripcion la presenta como la linea base de produccion en formato Transformers para GPU, por lo que la nomenclatura no permite concluir de forma fiable si se trata de un LoRA fusionado o de un fine-tune completo. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion, etc.).

El unico elemento de proceso documentado es la retirada temporal de las variantes WindyScripture en octubre de 2026 mientras se revisaban las licencias de los textos eBible empleados como fuente, lo que sugiere que parte del entrenamiento o de las variantes derivadas se apoyo en corpus biblicos.

## Capacidades

- Traduccion unidireccional de yapese a sueco, en modo texto.
- Traduccion de segmentos u oraciones cortas, propio de la arquitectura MarianMT.
- Inferencia en GPU mediante Transformers y en CPU mediante CTranslate2 INT8.
- Ejecucion compatible con los endpoints de HuggingFace (etiqueta `endpoints_compatible`).
- Base del ecosistema WindyWord (aplicaciones en windyword.ai).

No se documentan en la informacion disponible las siguientes capacidades: tool calling o function calling, comportamiento agentico o razonamiento multi-paso, generacion de codigo, matematicas, vision, audio, modo de razonamiento explicito, ni traduccion en la direccion inversa (sueco a yapese). Tampoco se declara capacidad multilingue mas alla del par yap → sv.

## Casos de uso

- Traduccion de documentacion administrativa o civica para comunidades yapenses: el modelo permite convertir textos de referencia al sueco para hablantes de yapese residentes en Suecia o en contextos academicos nordicos, sin depender de modelos multilingues que no cubren el par.
- Preservacion y difusion de material linguistico: investigacion en linguistica austronesia que necesite cotejar textos en yapese con traducciones al sueco como lengua puente hacia el ingles o el aleman.
- Integracion en pipelines de traduccion asistida por ordenador: al exponerse via CTranslate2 INT8, puede desplegarse como servicio de CPU de bajo coste para pretraducir y dejar la postedicion a revisores humanos.
- Traduccion de contenido web o comunitario: webs de organizaciones con publico yapese que quieran ofrecer una version en sueco generada automaticamente y revisada despues.
- Procesamiento por lotes de corpus paralelos: generacion de traducciones sinteticas yap → sv para aumentar datos de entrenamiento de modelos mayores o para mineria de corpus.
- Prototipado de aplicaciones de traduccion de bajo recursos: sirve como referencia para medir si un modelo dedicado y pequeno supera a un modelo multilingue grande en un par concreto, con coste de inferencia minimo.
- Investigacion sobre calidad en pares de bajos recursos: util como punto de partida reproducible (parte de OPUS-MT, Apache-2.0) para estudiar tecnicas de aumento de datos o ajuste fino en lenguas con pocos hablantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se publica ninguna puntuacion de calidad en el repositorio y que las puntuaciones de cribado, cuando se han medido, figuran en la pagina del catalogo del autor. Por tanto, no se dispone de valores de BLEU, chrF, COMET, MMLU, HumanEval ni de cualquier otra metrica para este modelo, ni tampoco de comparaciones numericas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma declarada. Como referencia de orden de magnitud, el repositorio completo ocupa 0,3 GB, cifra coherente con un modelo Marian compacto en precision de 32 bits; con esa base, la inferencia cabria en cualquier GPU con 2 GB o mas de VRAM. Se trata de una estimacion derivada del tamano del repositorio, no de un dato publicado.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU moderna de consumo seria sobradamente suficiente; no se justifica el uso de A100 o H100 salvo para servir muchas peticiones concurrentes.
- GPU de consumo: si, previsiblemente cabe en practicamente cualquier GPU de consumo actual (serie RTX 30/40, e incluso integradas con soporte de inferencia), dado el reducido tamano del modelo. No confirmado por el autor.
- Despliegue en CPU: variante especifica `lora-ct2-int8` para CTranslate2 en INT8, pensada explicitamente para inferencia en CPU.
- Opciones de despliegue documentadas: Transformers (PyTorch) con MarianMTModel y MarianTokenizer, y CTranslate2. La etiqueta `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints. No se documentan soportes para vLLM, TGI, Ollama ni llama.cpp, y no se ofrece formato GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| WindstormLabs/translate-yap-sv | no disponible (repo de 0,3 GB) | no disponible | yap → sv | Apache-2.0 | sin benchmarks publicados | HuggingFace (este repositorio) |
| Helsinki-NLP/opus-mt-yap-sv | no disponible | no disponible | yap → sv | Apache-2.0 | sin datos en la informacion disponible | HuggingFace (modelo base del anterior) |
| NLLB-200 (Meta) | 600 M a 54 000 M segun variante | 512 tokens (variante destilada de 600 M) | 200 idiomas; cobertura de yap no confirmada en la informacion disponible | CC-BY-NC-4.0 en las variantes de investigacion | sin datos para este par en la informacion disponible | HuggingFace |

La comparacion mas directa es con el propio modelo base de Helsinki-NLP, del que este checkpoint deriva y con el que comparte licencia. Frente a un modelo multilingue como NLLB-200, la ventaja de un Marian dedicado es el coste de inferencia muy inferior y la posibilidad de ejecucion en CPU, a cambio de cubrir un unico par y direccion de traduccion.

## Limitaciones y advertencias

- Ausencia total de metricas de calidad publicadas: no hay BLEU, chrF ni COMET, y la propia model card remite a una pagina externa de catalogo. Evaluar el modelo en produccion sin una validacion propia es arriesgado.
- Direccionalidad unica: traduce solo yap → sv. La direccion inversa no esta soportada segun la informacion disponible.
- Par de muy bajos recursos: la disponibilidad de corpus paralelos yapese-sueco es limitada, lo que se traduce previsiblemente en menor robustez ante dominio, registro y vocabulario especializado. No hay datos publicados que cuantifiquen este efecto.
- Riesgo de alucinacion y de omisiones o repeticiones: inherente a los modelos seq2seq de traduccion entrenados con datos escasos. No se documenta ningun mecanismo de mitigacion ni de puntuacion de confianza.
- Sin informacion sobre sesgos: no se documentan evaluaciones de sesgo, genero, religion o terminologia culturalmente sensible.
- Limitaciones de contexto: se desconoce la longitud maxima de secuencia soportada. Los modelos Marian de OPUS-MT suelen operar con segmentos cortos, por lo que no es recomendable usarlo con documentos largos sin segmentacion previa; este dato no esta confirmado para este checkpoint.
- Historial de variantes retiradas: las variantes WindyScripture (`herm0-scripture/`, `scripture-ct2-int8/`) fueron retiradas el 2026-10-04 mientras se revisan las licencias de los textos eBible de origen. Si un pipeline dependia de ellas, ya no estan disponibles en los archivos actuales del repositorio.
- Ambiguedad sobre el tipo de ajuste: la variante principal se denomina `lora/` pero se describe como linea base de produccion en formato Transformers. Conviene verificar si se trata de adaptadores LoRA o de pesos completos antes de integrarla.
- Copia canonica duplicada: la model card indica que la copia canonica esta en `WindyTranslate/translate-yap-sv`, lo que puede generar confusion sobre cual es el repositorio mantenido.
- Licencia permisiva: Apache-2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de atribucion (el repositorio incluye `NOTICE.md`). No se han identificado restricciones adicionales, aunque la revision de licencias de los corpus biblicos sigue abierta.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WindstormLabs/translate-yap-sv
- Copia canonica indicada por el autor: https://huggingface.co/WindyTranslate/translate-yap-sv
- Pagina de catalogo y puntuaciones del autor: https://windytranslate.com/models/translate-yap-sv
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-yap-sv
- Proyecto OPUS-MT (Helsinki-NLP): no disponible en la informacion proporcionada
- Aplicaciones Windy Word: https://windyword.ai
- Ficheros de licencia y atribucion del repositorio: `LICENSE` y `NOTICE.md` en https://huggingface.co/WindstormLabs/translate-yap-sv
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.

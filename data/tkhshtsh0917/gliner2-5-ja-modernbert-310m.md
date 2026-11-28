# tkhshtsh0917/gliner2.5-ja-modernbert-310m

## Resumen

gliner2.5-ja-modernbert-310m es un modelo especializado en extraccion de informacion sobre texto en japones, construido sobre la arquitectura GLiNER2.5 (de tipo *boundary*) y publicado por el usuario tkhshtsh0917. Se trata de un modelo de la comunidad, no oficial, que no esta afiliado ni respaldado por fastino-ai, la organizacion autora de GLiNER2. Con un unico modelo se realizan tareas de reconocimiento de entidades nombradas (NER), clasificacion de texto, extraccion de relaciones y extraccion estructurada en formato JSON.

La particularidad tecnica del modelo es que sustituye el codificador original de GLiNER2.5 por ModernBERT-Ja-310m de SB Intuitions, de modo que ninguno de los pesos publicados por fastino-ai se reutiliza: el codificador parte de los pesos preentrenados de ModernBERT-Ja y todas las cabeceras de tarea de GLiNER2 se inicializan de forma aleatoria y se entrenan desde cero. El modelo tiene 321.919.955 parametros y un repositorio de 3,9 GB.

Es relevante porque cubre un hueco concreto: la extraccion de informacion estructurada en japones con un modelo compacto (310M) que puede ejecutarse en CPU, con licencia Apache 2.0 y una segmentacion de palabras adaptada al japones mediante Sudachi (SplitMode.C, diccionario core). Forma parte de una familia que incluye una variante de 130M orientada a CPU y dispositivos edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2.5 (boundary) con codificador ModernBERT-Ja |
| Parametros totales | 321.919.955 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GLiNER2.5 de tipo *boundary*: el esquema de extraccion se serializa como un prompt con tokens marcadores (`[P]`, `[E]`, `[L]`, `[R]`, `[C]`) que se concatena con el texto de entrada y se procesa en una unica pasada del codificador. La cadena completa queda separada por `[SEP_STRUCT]` y `[SEP_TEXT]`. Cada marcador de etiqueta genera una consulta (query) y cada palabra se representa por el vector de su primer subword. Una cabecera de fronteras puntua cada hueco entre palabras como posible inicio o fin de span, y se conservan hasta 128 spans por etiqueta, re-puntuados por compatibilidad de extremos, contenido y longitud, con umbral sigmoide por defecto de 0,5. La clasificacion usa un MLP sobre el vector del marcador `[L]` (softmax para etiqueta unica, sigmoide por etiqueta para multietiqueta, con `cls_threshold` por defecto de 0,5). Las relaciones y estructuras reutilizan la misma maquinaria de spans, con modos de asignacion como `mode="natural"` para registros estructurados.

El entrenamiento usa el trainer del repositorio publico GLiNER2 (`gliner2==2.1.0`) sin modificar la libreria, con un pequeno wrapper que anade ajustes especificos para japones: el segmentador Sudachi, configuracion de aumentacion de esquemas y un mecanismo de respaldo para alinear los spans gold con los tokens de Sudachi. El codificador parte de los pesos preentrenados de ModernBERT-Ja-310m y todas las cabeceras de tarea se entrenan desde cero. Los datos de entrenamiento son un dataset sintetico en japones de caracter propietario, no publicado. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en japones con etiquetas definidas por el usuario en tiempo de inferencia.
- Clasificacion de texto, tanto de etiqueta unica como multietiqueta, mediante etiquetas `[L]`.
- Extraccion de relaciones entre entidades mediante consultas de span de cabeza y cola y una cabecera de relacion.
- Extraccion estructurada en JSON con campos definidos por esquema, incluyendo modo natural para agrupar registros.
- Extraccion en una sola pasada del codificador, con esquema y texto atendiendo conjuntamente.
- Mecanismo de "sin respuesta" por etiqueta, que permite devolver vacio cuando la entidad no aparece en el texto.
- Preservacion de la forma original del texto: los resultados se recortan del texto original (`Pythonエンジニア`, no `pythonエンジニア`).
- Segmentacion de palabras especifica para japones mediante Sudachi (SplitMode.C, diccionario core).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Extraccion de entidades en curriculums y ofertas de empleo: el modelo puede extraer campos como cargo, ubicacion o modalidad de trabajo a partir de texto libre en japones, tal como ilustra el ejemplo de inferencia de la model card (`渋谷でリモート可のPythonエンジニア正社員`).
- Clasificacion de documentos y tickets: con etiquetas `[L]` definidas por el usuario, permite categorizar consultas o incidencias en japones en una sola pasada, sin necesidad de un modelo de clasificacion separado.
- Extraccion de relaciones en dominios como contratos o noticias: la cabecera de relacion permite vincular pares de entidades (por ejemplo, organizacion y persona) dentro del mismo texto.
- Construccion de pipelines de informacion estructurada: la extraccion JSON con esquema permite convertir texto no estructurado en registros listos para bases de datos o APIs, con campos definidos en tiempo de ejecucion.
- Procesamiento en CPU y entornos sin GPU: el tamano de 310M y la existencia de una variante de 130M para CPU/edge lo hacen adecuado para despliegues ligeros o procesamiento por lotes en servidores sin acelerador.
- Anonimizacion y enmascarado de datos personales: la deteccion de entidades configurables permite localizar nombres, direcciones u organizaciones en texto japones antes de almacenarlo o compartirlo.
- Demos y prototipado rapido: el Space oficial permite probar ambos modelos en el navegador sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 321.919.955 parametros, los pesos en precision completa ocupan aproximadamente 1,3 GB en fp32 y unos 0,64 GB en fp16, sin contar activaciones ni el repositorio completo de 3,9 GB.
- El modelo se ha verificado en CPU con gliner2 2.1.0 sobre Python 3.10, 3.12 y 3.13, segun la model card.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, aunque no se confirma con datos de la model card.
- Despliegue: la via documentada es la libreria `gliner2` (extra `[local]`, version 2.1.x) con `transformers>=5`, `sudachipy==0.7.0` y `sudachidict-core==20261015`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| gliner2.5-ja-modernbert-310m | 321.919.955 | no disponible | ja | Apache 2.0 | Variante de mayor precision de la familia |
| gliner2.5-ja-modernbert-130m | no disponible | no disponible | ja | no disponible en la informacion | Variante menor y mas rapida para CPU/edge |
| fastino/gliner2.5-multi-v1 | no disponible | no disponible | multi | no disponible en la informacion | Modelo oficial de fastino-ai; este modelo no reutiliza sus pesos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no oficial de la comunidad: no esta afiliado ni respaldado por fastino-ai.
- Solo soporta japones; no se documenta capacidad multilingue.
- El dataset de entrenamiento es sintetico y propietario, no publicado, lo que dificulta auditar sesgos o cobertura.
- Riesgo de alucinacion y de extraccion de spans incorrectos en textos fuera de dominio; el mecanismo de "sin respuesta" mitiga parcialmente este riesgo, pero no lo elimina.
- Requiere `transformers>=5` porque los ficheros del tokenizer se guardaron con esa version; Transformers 4 no puede leerlos.
- Dependencia estricta de versiones: gliner2 2.1.x (con 2.2.0 los resultados de extraccion estructurada cambian ligeramente) y versiones fijas de Sudachi.
- La longitud de contexto no esta documentada, lo que limita la planificacion de despliegues con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de la comunidad conviene verificar la procedencia de los datos de entrenamiento antes de usarlo en produccion.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tkhshtsh0917/gliner2.5-ja-modernbert-310m
- README en japones: https://huggingface.co/tkhshtsh0917/gliner2.5-ja-modernbert-310m/blob/main/README.ja.md
- Variante de 130M: https://huggingface.co/tkhshtsh0917/gliner2.5-ja-modernbert-130m
- Coleccion GLiNER2.5 Japanese: https://huggingface.co/collections/tkhshtsh0917/gliner25-japanese
- Demo Space: https://huggingface.co/spaces/tkhshtsh0917/gliner2.5-japanese-demo
- Repositorio GLiNER2: https://github.com/fastino-ai/GLiNER2
- Modelo base ModernBERT-Ja-310m: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Sudachi: https://github.com/WorksApplications/sudachi.rs

# VAGOsolutions/SauerkrautLM-GLiNEREL-72m

## Resumen

SauerkrautLM-GLiNEREL-72m es un modelo encoder especializado en extraccion conjunta de entidades nombradas (NER), deteccion de informacion personal identificable (PII) y extraccion de relaciones en una sola pasada. Lo desarrolla VAGOsolutions y deriva de SauerkrautLM-GLiNEREL-314m mediante poda estructurada y destilacion de conocimiento, conservando el 23 % de los parametros y aproximadamente el 93 % de la puntuacion global. Con 72,5 millones de parametros (146 MB), esta disenado para inferencia de bajisima latencia en CPU y GPU.

La propuesta central es sustituir pipelines generativos costosos por un encoder compacto que acepta etiquetas en texto libre elegidas en tiempo de inferencia. Segun la model card, procesa un PDF de 33 paginas en 0,34 s en GPU ZeroGPU y 2,67 ms por texto en una NVIDIA H100 en fp16, frente a los 17,6 s que necesita un modelo generativo de 4B para un solo parrafo. En CPU (Apple M3 Pro) la latencia es de 26,7 ms por texto.

Es relevante ahora porque cubre cinco idiomas (ingles, aleman, frances, italiano y espanol) con una licencia LFM Open License v1.0 y una libreria de inferencia propia (`glinerel-fast`) escrita en PyTorch puro, sin dependencia de `transformers`, orientada a despliegues en produccion con requisitos estrictos de latencia y coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer con convoluciones cortas LFM2 (arquitectura GLiNERel), 14 capas |
| Parametros totales | 72.555.544 (72,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (referencia), fp16 y bf16 en GPU; no se documentan cuantizaciones de enteros |
| Idiomas soportados | en, de, fr, it, es |
| Licencia | LFM Open License v1.0 (identificador `other` en HuggingFace) |
| Formato de pesos | safetensors |
| Libreria de inferencia | `glinerel-fast` (PyTorch puro, sin `transformers`) |
| Tarea | token-classification (NER, PII, extraccion de relaciones) |
| Modelo base | VAGOsolutions/SauerkrautLM-GLiNEREL-314m |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un encoder de 14 capas con atencion multi-cabeza completa (se conservan todas las cabezas) y convoluciones cortas del tipo LFM2. Se obtuvo mediante poda estructurada de anchura sobre SauerkrautLM-GLiNEREL-314m: se redujo el flujo residual y las capas feed-forward, y se factorizo el embedding de tokens, manteniendo intactas las 14 capas y todas las cabezas de atencion. Posteriormente se aplico destilacion de conocimiento desde el modelo de 314M.

La innovacion tecnica principal esta en la libreria de inferencia `glinerel-fast`, no en el entrenamiento: empaquetado de lotes sin padding (solo la atencion ve una vista con padding), fusion de las proyecciones q/k/v y de las compuertas SwiGLU en un unico producto matricial, ejecucion de las convoluciones cortas como tres sumas desplazadas que no cruzan fronteras entre textos, reescritura algebraica de la capa FiLM para evitar el tensor de cuatro dimensiones en el scoring de spans, lotes de CPU dimensionados a cache (maximo aproximado de 2.048 tokens por lote) y eliminacion de las cabezas de entrenamiento en tiempo de carga. En fp32 la salida coincide exactamente con la implementacion de referencia (F1 de concordancia 1.000). No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot con etiquetas en texto libre definidas en tiempo de inferencia.
- Extraccion de relaciones entre entidades en la misma pasada del encoder, con etiquetas tambien libres.
- Deteccion y redaccion de PII: el metodo `redact` sustituye entidades por marcadores como `[FIRST_NAME]`, `[LAST_NAME]` o `[PHONE_NUMBER]`.
- Procesamiento multilingue en ingles, aleman, frances, italiano y espanol.
- Salida estructurada con etiqueta, texto, posicion (`start`, `end`) y puntuacion de confianza tanto para entidades como para relaciones.
- Extraccion de grafos de conocimiento a partir de documentos largos, con exportacion a JSON, CSV, GraphML y Cypher (Neo4j) en la demo.
- Inferencia en CPU, GPU NVIDIA y GPU Apple.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso; es un modelo exclusivamente extractivo.

## Casos de uso

- Construccion de grafos de conocimiento desde documentacion corporativa: el modelo procesa PDFs completos y devuelve entidades y relaciones listas para cargar en Neo4j mediante exportacion Cypher, con latencias de milisegundos por texto que hacen viable el procesamiento por lotes de corpus grandes.
- Redaccion de PII en flujos de cumplimiento (RGPD): la funcion `redact` permite anonimizar nombres, telefonos y otras categorias antes de almacenar o enviar texto a servicios externos, con etiquetas configurables segun la politica de cada organizacion.
- Enriquecimiento de bases de datos y CRM: extraccion de personas, organizaciones, ubicaciones y relaciones como "spouse" o "works for" para poblar registros estructurados a partir de correos, notas o contratos.
- Analisis documental en atencion al cliente o back office: clasificacion y extraccion de campos clave en tickets y formularios multilingues, aprovechando el soporte de cinco idiomas sin necesidad de modelos separados por lengua.
- Indexacion semantica y busqueda sobre archivos historicos: generacion de metadatos estructurados (entidades y relaciones) que alimentan indices de busqueda o sistemas RAG sin depender de un LLM generativo.
- Procesamiento en el borde o en portatiles: al ocupar 146 MB y ejecutarse en CPU con 26,7 ms por texto en un Apple M3 Pro, es adecuado para aplicaciones de escritorio, entornos sin GPU o despliegues con presupuesto de computo muy limitado.
- Moderacion y auditoria de contenido: deteccion de entidades sensibles en grandes volumenes de texto donde el coste por token de un modelo generativo seria prohibitivo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Puntuacion global (4 benchmarks de relaciones) | 61,8 |
| Latencia por texto en NVIDIA H100 (fp16) | 2,67 ms |
| Latencia por texto en CPU Apple M3 Pro | 26,7 ms (3,8x mas rapido que la implementacion de referencia) |
| Documento aleman de 1.065 caracteres, CPU de portatil | 258 ms (frente a 1,3 s de gliner2.5-multi-v1 y 13,5-14,5 minutos de modelos generativos de 4B) |
| PDF de 33 paginas en demo ZeroGPU | 0,34 s |

En las particiones de desarrollo de CoNLL04, CrossRE, DocRED y FewRel, la model card indica que el modelo obtiene el mejor valor en 10 de 11 filas; Qwen3.8-27B lidera en NER de CrossRE (77,7 frente a 76,1). Su F1 medio en relaciones (48,0) es 1,7 veces el de Qwen3.8-27B sin razonamiento. No se proporcionan en la informacion disponible los valores desglosados por benchmark mas alla de estas cifras agregadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 146 MB en fp32 para los pesos; en fp16 o bf16, alrededor de 73 MB, mas activaciones y cache de etiquetas.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- GPU recomendadas para maximo rendimiento: NVIDIA H100 (unos 3 ms por texto con CUDA graphs y pipeline asincrono en `glinerel-fast` 0.1.1); tambien soporta GPUs Apple.
- Despliegue: libreria `glinerel-fast` (PyTorch puro, sin `transformers`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Throughput: la model card menciona lotes de CPU dimensionados a cache y pruebas con lotes de 32 en Apple M3 Pro, pero no se publican cifras absolutas de tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Latencia (documento de 1.065 caracteres, CPU portatil) | Licencia | Notas |
|---|---|---|---|---|---|
| SauerkrautLM-GLiNEREL-72m | 72,5 M | en, de, fr, it, es | 258 ms | LFM Open License v1.0 | Mejor valor en 10 de 11 filas de NER y relaciones segun la model card |
| SauerkrautLM-GLiNEREL-314m | 314 M (no confirmado en la informacion) | en, de, fr, it, es | no disponible | LFM Open License v1.0 (no confirmado) | Modelo base; el 72m conserva el 93 % de la puntuacion con el 23 % de los parametros |
| gliner2.5-multi-v1 | no disponible | multilingue | 1,3 s | no disponible | Referencia externa citada en la model card |
| Modelos generativos de 4B | 4.000 M | no disponible | 13,5-14,5 minutos | no disponible | Usados como contraste de coste en la model card |

## Limitaciones y advertencias

- Es un modelo puramente extractivo: no genera texto, no razona de forma multi-paso y no soporta tool calling ni agentes.
- El rendimiento en relaciones es moderado en terminos absolutos (F1 medio de 48,0), por debajo del rendimiento en NER; conviene validar el umbral de confianza en cada dominio.
- La licencia LFM Open License v1.0 es distinta de las licencias permisivas habituales; es imprescindible revisar el archivo LICENSE antes de un uso comercial.
- No se documentan sesgos conocidos, pero al ser un modelo multilingue entrenado sobre corpus no especificados, puede heredar sesgos de esos datos; la informacion disponible no detalla la composicion del dataset.
- La longitud de contexto no esta publicada; para documentos muy largos habra que segmentar y agregar resultados.
- Las etiquetas son texto libre, lo que aporta flexibilidad pero puede producir extracciones inconsistentes si las etiquetas son ambiguas o se solapan.
- La libreria `glinerel-fast` se distribuye desde un repositorio privado que requiere autenticacion con HuggingFace (`hf auth login`), lo que anade un paso de configuracion en produccion.
- Riesgo de alucinacion estructural bajo por ser extractivo, pero puede generar falsos positivos en entidades y relaciones con puntuaciones de confianza bajas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VAGOsolutions/SauerkrautLM-GLiNEREL-72m
- Modelo base: https://huggingface.co/VAGOsolutions/SauerkrautLM-GLiNEREL-314m
- Demo interactiva (PDF a grafo de conocimiento): https://huggingface.co/spaces/VAGOsolutions/SauerkrautLM-GLiNEREL-Knowledge-Graph
- Libreria de inferencia en PyPI: https://pypi.org/project/glinerel-fast/
- Licencia: archivo LICENSE en el repositorio del modelo

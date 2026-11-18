# SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-GGUF

## Resumen

Suri Qwen 3.8 27B Uncensored es un modelo de lenguaje de 27.320 millones de parametros derivado de Qwen3.8 27B y sometido a un proceso de "desalineacion" (uncensoring) por el desarrollador independiente SpaceTimee (Space Time). Se distribuye como cuantizacion GGUF del modelo base original, con el objetivo explicito de eliminar las capas de rechazo y alineacion de seguridad del modelo de origen, de ahi el lema "Uncensor Is All You Need". La model card esta redactada en chino y el autor se identifica a traves de un grupo de QQ y una direccion de correo.

El modelo se publica bajo la etiqueta `image-text-to-text` y declara soporte de los idiomas chino e ingles, ademas de un pipeline compatible con endpoints de inferencia. El repositorio GGUF acumula 23.303 descargas y 9 likes desde su creacion en septiembre de 2026, con un tamano total de 2.259,1 GB, lo que refleja la presencia de multiples niveles de cuantizacion. No se dispone de informacion sobre la licencia, la composicion del dataset de entrenamiento ni resultados de benchmarks.

La relevancia de esta ficha radica en documentar un caso tipico de modelo "uncensored" de gran tamano distribuido en formato GGUF: util para investigacion sobre robustez de alineacion, pero con riesgos considerables para produccion y con una ausencia casi total de documentacion tecnica verificable por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.8 27B; presumiblemente transformer, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples niveles; el repo ocupa 2.259,1 GB en total, niveles concretos no especificados) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors no se detalla aqui |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Modelo base | SpaceTimee/Suri-Qwen-3.8-27B-Uncensored |
| Etiquetas | suri, qwen, 27B, uncensored, unaligned, text-generation-inference, qwen3.8, imatrix, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

No se dispone de informacion publicada por el autor sobre la arquitectura interna del modelo. Por el nombre y el modelo base declarado (Qwen3.8 27B), se trata presumiblemente de un transformer decoder-only de aproximadamente 27.300 millones de parametros, pero la model card no confirma ni la arquitectura exacta, ni el numero de capas, ni la dimension oculta, ni el mecanismo de atencion. Tampoco se documenta la longitud de contexto nativa.

Respecto al entrenamiento, la unica informacion disponible es que el modelo ha sido sometido a un proceso de "desalineacion" (uncensoring) a partir del modelo base Suri-Qwen-3.8-27B-Uncensored, y que las cuantizaciones GGUF se han generado con imatrix (la etiqueta `imatrix` aparece en el repositorio). No hay datos sobre el volumen de tokens utilizados, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO, abliteration u otras. La model card unicamente incluye parametros de muestreo recomendados: temperatura 0,7-1,0, top_p 0,8-0,95 y repetition penalty 1-1,1.

## Capacidades

- Generacion de texto conversacional en chino e ingles, segun los idiomas declarados.
- El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales de entrada imagen + texto, aunque no se detalla el soporte real ni la arquitectura de vision.
- Etiqueta `conversational`: orientado a dialogos multi-turno.
- Etiqueta `endpoints_compatible`: compatible con endpoints de inferencia estandar (por ejemplo, TGI).
- Comportamiento "uncensored/unaligned": el modelo esta disenado para no aplicar rechazos de seguridad, lo que afecta a su comportamiento en consultas sensibles.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como objeto de estudio para analizar como se comporta un modelo de 27 B tras eliminar las capas de rechazo, comparandolo con el modelo base original en pruebas de robustez y red teaming controlado.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, aprovechando la ausencia de rechazos; requiere revision humana obligatoria antes de cualquier publicacion.
- Experimentacion con cuantizaciones GGUF: el repositorio ofrece multiples niveles de cuantizacion generados con imatrix, lo que permite estudiar el impacto de la cuantizacion en la calidad de un modelo de 27 B en hardware de consumo.
- Despliegue local en entornos de laboratorio: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en estaciones de trabajo con GPU consumer, sin depender de APIs externas, para pruebas internas de conversacion en chino e ingles.
- Analisis de sesgos y toxicidad: util como caso extremo para evaluar clasificadores de contenido y sistemas de moderacion, ya que produce respuestas que los modelos alineados rechazarian.
- Prototipado de asistentes conversacionales bilingues zh/en en contextos donde el contenido sensible no sea un problema, como demos internas o herramientas de escritura asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 27,3 B en GGUF, las cuantizaciones de 4 bits requeririan del orden de 15-18 GB de memoria, y las de 8 bits en torno a 28-30 GB; estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Para cuantizaciones bajas, una RTX 4090 (24 GB) podria ser suficiente; para cuantizaciones mas altas, se necesitarian A100 40/80 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU consumer: probablemente en RTX 4090 y GPUs con 24 GB o mas para cuantizaciones de 4 bits; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repositorio declara compatibilidad con endpoints y text-generation-inference.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Suri Qwen 3.8 27B Uncensored GGUF | 27,3 B | no disponible | no disponible | GGUF | Variante uncensored de Qwen3.8 27B |
| Qwen3.8 27B (modelo de origen) | ~27 B | no disponible | no disponible | safetensors/GGUF | Modelo alineado original; referencia de comparacion |
| Otros modelos uncensored de ~27-32 B | variable | variable | variable | GGUF | Categoria generica; no se dispone de datos concretos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican arquitectura, contexto, dataset, proceso de uncensoring ni benchmarks, lo que impide evaluar su calidad de forma rigurosa.
- Licencia no disponible: sin licencia explicita no se puede asumir permiso para uso comercial; ademas, la licencia del modelo base Qwen3.8 27B podria imponer restricciones adicionales que el autor no detalla.
- Modelo deliberadamente desalineado: no aplica rechazos de seguridad, por lo que puede generar contenido danino, ilegal o sexualmente explicito; no es apto para produccion orientada al publico sin moderacion externa.
- Riesgo elevado de alucinacion: no hay evaluaciones publicadas que cuantifiquen la fiabilidad factual.
- Cobertura limitada de idiomas: solo se declaran chino e ingles; el rendimiento en castellano no esta documentado.
- El pipeline declarado (`image-text-to-text`) no esta respaldado por documentacion sobre el codificador de vision ni sobre el formato de entrada multimodal.
- Repositorio de gran tamano (2.259,1 GB): la descarga completa de todas las cuantizaciones es costosa en almacenamiento y ancho de banda.
- Autor individual sin trazabilidad institucional: el soporte y las actualizaciones dependen de un unico desarrollador.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Perfil del autor en linux.do: https://linux.do/u/spacetime
- Contacto del autor: Zeus6_6@163.com (grupo QQ: 902575634)

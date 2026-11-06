# webbrain-one/ling3-tr-tiny-pruned-hukuk-v2-GGUF

## Resumen

Ling3-TR-Tiny-Pruned-Hukuk v2 es un modelo de lenguaje especializado en derecho turco, desarrollado por el usuario `webbrain-one` de Hugging Face. Se trata de la cuantización en formato GGUF de un modelo base previamente podado (`webbrain-one/ling3-turkish-tiny-pruned`), derivado a su vez de `inclusionAI/Ling-3.0-tiny`, un modelo de arquitectura MoE híbrida (bailing_hybrid) al que se aplicó un proceso de poda orientado al turco, dejándolo en 5.287 millones de parámetros totales con aproximadamente 1.300 millones de parámetros activos por token.

El modelo está diseñado como el componente jurídico de bajo consumo de memoria de la aplicación de escritorio PekBilen. Su ajuste fino (v2) se realizó con el dataset `webbrain-one/hukuk-dataset-v2` (6.013 ejemplos), con LoRA por experto y eliminación de las líneas de razonamiento, ya que la aplicación ejecuta el modelo sin modo thinking. Incluye una matriz de importancia (imatrix) calculada con prompts en el formato propio de la aplicación.

Su relevancia radica en que ofrece, en unos 2,9 GB de disco, un rendimiento en tareas jurídicas turcas comparable a Qwen 3.5 9B (con thinking desactivado) en los flujos de trabajo de la aplicación, a costa de cierta pérdida de conocimiento memorizado en preguntas de libro cerrado respecto a la versión v1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (bailing_hybrid), podada para turco, 80 expertos por capa |
| Parametros totales | 5.287.033.168 (≈5,3 B) |
| Parametros activos | ≈1,3 B por token (MoE) |
| Longitud de contexto | no disponible (entrenamiento con máximo 12.288 tokens) |
| Tipos de cuantizacion | IQ4_XS (2,90 GB), IQ4_NL (3,05 GB) |
| Idiomas soportados | Turco (tr) |
| Licencia | proprietary-private (license: other, todos los derechos reservados) |
| Formato de pesos | GGUF (con imatrix de 28 MB incluida) |

## Arquitectura y entrenamiento

El modelo parte de `inclusionAI/Ling-3.0-tiny`, una arquitectura MoE con diseño híbrido (tag `bailing_hybrid`). El autor realizó una poda específica para turco ("Türkçe budama") manteniendo 80 expertos por capa, seguida de una fase de "heal" en turco para recuperar la capacidad del modelo tras la poda. El resultado es un modelo de 5,3 B de parámetros totales con ~1,3 B activos por token, lo que reduce drásticamente el coste de inferencia.

El ajuste fino v2 utilizó el dataset `webbrain-one/hukuk-dataset-v2` (6.013 ejemplos) con el formato de prompt propio de la aplicación PekBilen, y cada ejemplo objetivo pasó previamente por los verificadores de la propia aplicación. Se aplicó LoRA por experto (r 32, α 32) en todas las capas lineales, con pérdida calculada únicamente sobre los tokens del asistente, learning rate 1e-4, 1 epoch y una longitud máxima de 12.288 tokens. Dado que la aplicación ejecuta Ling sin modo de razonamiento, las líneas de planificación (thinking) fueron eliminadas del entrenamiento. La cuantización IQ4_XS/IQ4_NL se calibró con una importance matrix generada a partir de prompts en el formato de la aplicación.

## Capacidades

- Generacion de texto conversacional en turco, orientada al dominio juridico (hukuk).
- Resolucion de tareas juridicas operativas ("uygulama işleri") definidas por la aplicacion PekBilen, con respuestas que pasan los verificadores de citas y de tareas de la aplicacion.
- Preguntas y respuestas sobre legislacion turca (mevzuat).
- Ejecucion sin modo de razonamiento (thinking desactivado por diseño en la aplicacion).
- Formato conversacional (tag `conversational`), compatible con el ecosistema llama.cpp/GGUF.
- No hay indicios de capacidades de vision, audio, tool calling ni agentes en la informacion disponible.

## Casos de uso

- Asistente juridico de escritorio en turco: es el modelo integrado en la aplicacion PekBilen para tareas de derecho turco, con respuestas verificadas por los controladores de citas de la aplicacion; adecuado por su bajo consumo de memoria en equipos de escritorio.
- Consulta de legislacion turca (mevzuat): responde preguntas sobre normativa vigente; logro 33/40 en la evaluacion interna de preguntas de mevzuat.
- Automatizacion de tareas juridicas repetitivas: en la evaluacion interna completo 99 de 139 tareas de la aplicacion, lo que lo hace util para redaccion y tramitacion de documentos legales estandarizados.
- Despliegue en hardware modesto: con 2,90 GB en IQ4_XS, puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp, util para despachos pequenos que no quieren enviar datos a la nube.
- Prototipado de asistentes legales locales: la disponibilidad de imatrix y dos cuantizaciones facilita pruebas de calidad/latencia en pipelines locales basados en GGUF.
- Generacion de borradores juridicos con citas: el entrenamiento con verificadores de citas lo orienta a producir respuestas con referencias normativas, aunque siempre deben verificarse contra la fuente primaria.

## Benchmarks y rendimiento

Evaluacion interna del autor (20 decisiones recientes no vistas en entrenamiento; 139 tareas de la aplicacion y 40 preguntas de mevzuat; respuestas puntuadas con los verificadores de citas y tareas de la aplicacion; IQ4_XS, llama.cpp b11724, thinking desactivado; v1 evaluada con el mismo montaje):

| Benchmark | Ling v1 | Ling v2 | Qwen 3.5 9B v2.1 (thinking off) |
|---|---:|---:|---:|
| Tareas de la aplicacion (139) | 67 | 99 | 97 |
| Preguntas de mevzuat (40) | 36 | 33 | 38 |
| TRLawBench (97 preguntas OSYM) | 30 | 23 | 47 |
| HukukBERT cloze (acc / acc_norm / MCQ conversacion) | 50,8 / 49,3 / 62,7 | 40,8 / 42,5 / 56,3 | 73,6 / 71,1 / – |

La v2 supera claramente a la v1 en las tareas de la aplicacion y se situa al nivel de Qwen 3.5 9B v2.1 con thinking desactivado, pero pierde parte del conocimiento memorizado de la v1 en evaluaciones de libro cerrado (cloze y TRLawBench). No hay benchmarks estandarizados generales (MMLU, HumanEval, GSM8K) publicados.

## Requisitos de hardware

- VRAM/almacenamiento para inferencia: 2,90 GB en IQ4_XS y 3,05 GB en IQ4_NL; al ser un modelo MoE con ~1,3 B de parametros activos por token, la inferencia es viable en CPUs de escritorio y GPUs modestas.
- GPU recomendadas: no disponible explicitamente; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo RTX 3060 o superior) deberia ejecutarlo con holgura, y tambien es viable en CPU pura.
- Consumer GPUs: si cabe con facilidad; incluso integradas con memoria compartida pueden manejar los ~3 GB del archivo GGUF.
- Despliegue: llama.cpp (evaluado por el autor con build b11724); al ser GGUF es compatible con Ollama, LM Studio y otros runtimes que soporten el formato; no hay informacion sobre vLLM o TGI para esta variante.
- Latencia y throughput: no disponibles; el bajo numero de parametros activos (~1,3 B/token) sugiere latencias bajas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| Ling3-TR-Tiny-Pruned-Hukuk v2 (este modelo) | 5,3 B | ~1,3 B | no disponible (entrenado a 12.288) | proprietary-private | 99/139 tareas internas; 33/40 mevzuat |
| Ling v1 (misma linea) | 5,3 B | ~1,3 B | no disponible | proprietary-private | 67/139 tareas internas; 36/40 mevzuat; mejor cloze (50,8) |
| Qwen 3.5 9B v2.1 (thinking off) | no disponible | no disponible | no disponible | no disponible | 97/139 tareas internas; 38/40 mevzuat; 47 en TRLawBench |

Frente a Qwen 3.5 9B, el modelo de webbrain-one ofrece un rendimiento equivalente en las tareas de la aplicacion con aproximadamente la mitad del tamano de archivo, a costa de un rendimiento inferior en TRLawBench (23 frente a 47) y en evaluaciones de libro cerrado.

## Limitaciones y advertencias

- Restriccion de licencia severa: licencia proprietary-private con todos los derechos reservados; queda prohibido copiar, distribuir, compartir con terceros o redistribuir el modelo o derivados sin permiso escrito y explicito del propietario, tanto en entornos comerciales como open source.
- El propio autor advierte que, por su tamano (~1,3 B de parametros activos por token), sus salidas no constituyen asesoramiento juridico y deben verificarse contra la fuente primaria.
- Riesgo de alucinacion en citas normativas: aunque el entrenamiento uso verificadores de citas, no hay garantia de exactitud juridica; la perdida de conocimiento de libro cerrado respecto a v1 (cloze 40,8 frente a 50,8; TRLawBench 23 frente a 30) indica menor memorizacion de la normativa.
- Limitado al turco: no hay soporte declarado para otros idiomas.
- Longitud de contexto no declarada para inferencia; el entrenamiento se limito a 12.288 tokens, por lo que documentos juridicos muy largos podrian exceder su capacidad util.
- Evaluaciones basadas en benchmarks internos del autor y en su propia aplicacion; no hay validacion independiente ni benchmarks estandarizados generales.
- Solo 301 descargas y sin likes en el momento de la ficha: adopcion comunitaria minima y sin historial de auditoria publica.

## Enlaces

- Modelo GGUF (esta ficha): https://huggingface.co/webbrain-one/ling3-tr-tiny-pruned-hukuk-v2-GGUF
- Modelo base: https://huggingface.co/webbrain-one/ling3-turkish-tiny-pruned
- Modelo original de referencia: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/webbrain-one/hukuk-dataset-v2
- No se han encontrado enlaces a papers, blogs, repositorios de codigo ni demos en la informacion disponible.

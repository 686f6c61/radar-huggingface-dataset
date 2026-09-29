# yava-code/Tessera-1B-Nano-Base

## Resumen

Tessera-1B-Nano-Base es un modelo de lenguaje causal de tipo decoder-only publicado por el usuario yava-code, descrito en su model card como la rama de control (baseline NTP-only) de la comparativa Tessera-1B-Nano de Paragon Intelligence Labs. No es un modelo entrenado desde cero: es el backbone `HuggingFaceTB/SmolLM2-360M` sin modificar, sometido a un continued-pretraining sobre el mismo corpus empaquetado que su rama experimental (la rama con "ruta de concepto"), con los mismos tokens, en el mismo orden y desde la misma inicializacion. Su funcion es servir de referencia para que el resultado de la rama de concepto sea interpretable.

El dato de parametros reales extraido de los safetensors es de 361.821.120 parametros, coherente con el backbone SmolLM2-360M del que deriva, pese al "1B" del nombre comercial. El repositorio ocupa 1,4 GB y se distribuye en formato safetensors bajo licencia Apache-2.0, con pipeline `text-generation` y compatibilidad declarada con `text-generation-inference` y endpoints.

Su relevancia es metodologica mas que de producto: se trata de un artefacto de investigacion reproducible (hashes SHA256 del corpus empaquetado, log completo de metricas, estado del trainer y JSON de evaluacion de intervenciones incluidos en el repo) que permite auditar una comparacion token-matched entre prediccion de siguiente token y prediccion de siguiente concepto. La model card advierte explicitamente de que se trata de una implementacion compacta estilo ConceptLM, no de una replica del NCP-ArchPreview de 8.9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (backbone Llama/SmolLM2); la model card describe ademas 2 bloques de concepto causales con punto de inyeccion antes del bloque decodificador de tokens 2, pero esta variante es la rama de control sin ruta de concepto |
| Parametros totales | 361.821.120 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales; al publicarse en safetensors es convertible a GGUF, GPTQ o AWQ con herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | HuggingFaceTB/SmolLM2-360M |
| Tamano del repositorio | 1,4 GB |
| Pipeline | text-generation |
| Autoria | yava-code (Paragon Intelligence Labs, segun la model card) |
| Fecha de creacion / actualizacion | 2026-09-28 / 2026-09-29 |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del backbone SmolLM2-360M, un transformer causal decoder-only, y anade, segun la configuracion descrita en la model card, un conjunto de componentes de concepto: chunk size de 4, codigo de producto de 15 segmentos x 64 entradas, 2 bloques de concepto causales, punto de inyeccion antes del bloque decodificador de tokens 2, objetivo NCP (siguiente concepto continuo) y una perdida compuesta `L_ntp + 1 L_ncp + 1 L_vq`. La model card indica que se trata de una implementacion compacta estilo ConceptLM y que omite codificacion residual iterativa, conexiones residuales entre escalas y la receta de entrenamiento a gran escala. Conviene subir con cautela esta seccion: la propia ficha define esta variante como la rama de control "sin ruta de concepto", por lo que la descripcion de bloques de concepto puede corresponder a la configuracion compartida del experimento y no a los pesos efectivamente activos en este checkpoint.

En cuanto al entrenamiento, la model card documenta una comparacion token-matched: esta rama consumio los mismos tokens del mismo corpus empaquetado, en el mismo orden y desde la misma inicializacion que la rama de concepto, sin reinicios y sin valores NaN. El volumen total de tokens de entrenamiento reportado es de 999.948.288 y el coste de computo estimado y registrado es de 24,88 USD. No se documentan en la informacion disponible fases de RLHF, DPO u otro ajuste por preferencias, ni la composicion detallada del dataset mas alla de la existencia del corpus empaquetado con hashes SHA256 fijados en el repositorio `ncp-smol`.

## Capacidades

- Generacion de texto autoregresiva basica (modelo causal de 361,8 M de parametros), sin capacidades de razonamiento avanzado documentadas.
- Prediccion de siguiente token (NTP) como objetivo unico de esta variante; es la referencia frente a la que se mide la rama de concepto.
- Actua como baseline de perplejidad: la model card publica perdida NTP en held-out de 2,5135 y perplejidad de 12,3485.
- Reproducibilidad de experimentos: el repositorio incluye `eval.json` y `metrics.jsonl`, ademas del registro de estado del trainer y los hashes del corpus en el repositorio `ncp-smol`.
- Tool calling / function calling: no documentado; no se declara soporte.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles (el campo de idiomas del modelo esta vacio).
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): ninguna documentada.
- Ajuste posterior: al ser un checkpoint base, esta pensado para servir de punto de partida a fine-tuning supervisado o a comparaciones controladas.

## Casos de uso

- Baseline de ablacion en investigacion: usar este checkpoint como rama de control frente a la rama con ruta de concepto, replicando la comparacion token-matched descrita, para aislar el efecto de la prediccion de siguiente concepto frente a la prediccion de siguiente token.
- Referencia de perplejidad en evaluaciones de corpus: al tener fijados el corpus empaquetado y la perdida held-out (2,5135 / perplejidad 12,3485), sirve como punto de comparacion estable cuando se evalua el impacto de cambios en tokenizacion, empaquetado o filtrado de datos.
- Fine-tuning academico de bajo coste: con 361,8 M de parametros y Apache-2.0, es viable ajustarlo en una unica GPU de consumo para tareas concretas de clasificacion de texto, resumen extractivo o generacion de plantillas donde no se requiera un modelo grande.
- Validacion de pipelines de entrenamiento y reproducibilidad: los hashes SHA256, el log de metricas y el estado del trainer permiten comprobar que un entorno de entrenamiento reproduce la misma perdida antes de lanzar experimentos mas caros.
- Pruebas de infraestructura de despliegue: por su tamano reducido es util para validar integraciones con transformers, text-generation-inference o endpoints compatibles antes de migrar a modelos mayores.
- Experimentos de compresion y cuantizacion: sirve para medir la degradacion de perplejidad al aplicar cuantizaciones de 8 y 4 bits sobre un modelo pequeno con una referencia NTP conocida.
- Docencia y prototipado rapido: permite ilustrar el ciclo completo de continued-pretraining y evaluacion en un presupuesto minimo (24,88 USD de computo registrado).

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son los de la evaluacion del propio autor. No hay resultados de MMLU, HumanEval, GSM8K ni comparativas estandar en la documentacion facilitada.

| Metrica | Valor |
|---|---:|
| Perdida NTP en held-out | 2,5135 |
| Perplejidad en held-out | 12,3485 |
| Tokens de entrenamiento | 999.948.288 |
| Estimacion de computo registrada | 24,88 USD |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento real de parametros (361,8 M) y no datos publicados por el autor:

- Pesos en fp32: aproximadamente 1,45 GB; en fp16/bf16: aproximadamente 0,72 GB; en int8: aproximadamente 0,36 GB; en 4 bits: aproximadamente 0,2 GB.
- VRAM total para inferencia: con overhead de activaciones, cache KV y runtime, en torno a 1-2 GB en fp16 para contextos cortos, y por debajo de 1 GB con cuantizacion de 4 bits.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU y en dispositivos integrados.
- GPU de datacenter (A100, H100) sobredimensionadas para inferencia; pueden tener sentido para entrenamiento o para servir muchas replicas en paralelo.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference y endpoints compatibles segun los tags del repositorio; llama.cpp, Ollama o vLLM requeririan conversion previa a GGUF o a los formatos que soportan, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de parametros y licencia de los modelos comparados proceden de conocimiento general sobre sus fichas publicas, no de la informacion proporcionada en esta busqueda; conviene verificarlos antes de citarlos. No hay datos de rendimiento comparables publicados para Tessera-1B-Nano-Base.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| Tessera-1B-Nano-Base | 361.821.120 | no disponible | Apache-2.0 | Perplejidad 12,3485 en held-out (evaluacion propia) |
| SmolLM2-360M (modelo base) | ~362 M | no disponible en esta ficha | Apache-2.0 | No disponible en la informacion proporcionada |
| Qwen2.5-0.5B | ~494 M | no disponible en esta ficha | Apache-2.0 | No disponible en la informacion proporcionada |
| TinyLlama-1.1B | ~1,1 B | no disponible en esta ficha | Apache-2.0 | No disponible en la informacion proporcionada |

La diferencia sustantiva de Tessera-1B-Nano-Base frente a esos modelos no es de capacidad, sino de proposito: es un checkpoint de investigacion con trazabilidad completa del corpus y del entrenamiento, no un modelo orientado a producto con benchmarks publicos.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni por preferencias: no cabe esperar comportamiento conversacional fiable ni seguimiento de instrucciones.
- El nombre "1B" no se corresponde con el tamano real (361,8 M de parametros); puede inducir a error al compararlo con modelos de mil millones de parametros.
- No hay informacion sobre sesgos, composicion del dataset ni filtrado de datos mas alla de la procedencia del corpus empaquetado, por lo que el riesgo de sesgos y de contenido problematico es desconocido.
- Riesgo de alucinacion alto y esperable en un modelo de este tamano y entrenamiento puramente NTP.
- Idiomas soportados no declarados; no hay garantia de cobertura multilingue.
- Longitud de contexto no disponible en la ficha; no debe asumirse ninguna ventana concreta sin verificarla en la configuracion del modelo.
- La seccion de arquitectura de la model card describe componentes de concepto que, segun la propia definicion de esta variante como rama de control "sin ruta de concepto", podrian no estar activos en estos pesos; hay que tratarlo como una ambiguedad documental a resolver.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo deriva de SmolLM2-360M y de un corpus cuyo origen y licencias subyacentes no se detallan en la informacion disponible; conviene auditar la procedencia de los datos antes de un uso en produccion.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni de mantenimiento por parte de terceros.
- Los identificadores arXiv citados (2602.08984 y 2609.10715) no han podido verificarse con la busqueda realizada; los resultados web devueltos corresponden a un restaurante homonimo en Nanterre y no guardan relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yava-code/Tessera-1B-Nano-Base
- Modelo base SmolLM2-360M: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- ConceptLM (paper citado en la model card): https://arxiv.org/abs/2602.08984
- NCP-ArchPreview (paper citado en la model card): https://arxiv.org/abs/2609.10715
- Repositorio ncp-smol (mencionado en la model card como contenedor del whitepaper, hashes del corpus y registros de entrenamiento): URL no disponible en la informacion proporcionada
- Whitepaper (`docs/whitepaper.md` dentro del repositorio ncp-smol): URL no disponible en la informacion proporcionada
- Artefactos de evaluacion incluidos en el repositorio del modelo: `eval.json` y `metrics.jsonl` (accesibles desde la pestana de archivos del modelo en HuggingFace)

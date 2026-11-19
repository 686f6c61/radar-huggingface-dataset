# sweetprincessluna/gpt-oss-20b-heretic-v2-Q4_K_M-GGUF

## Resumen

`gpt-oss-20b-heretic-v2-Q4_K_M-GGUF` es una cuantizacion en formato GGUF (tipo Q4_K_M) del modelo `kmnstudio101/gpt-oss-20b-heretic-v2`, un derivado "abliterated" o "decensored" del modelo GPT-OSS de 20B parametros de OpenAI. El autor de esta conversion es el usuario de Hugging Face `sweetprincessluna`, que ha utilizado el espacio GGUF-my-repo de ggml.ai y llama.cpp para generar los pesos cuantizados a partir del checkpoint original en safetensors.

El modelo base pertenece a la familia GPT-OSS, una arquitectura transformer de tipo Mixture-of-Experts (MoE) publicada por OpenAI con licencia Apache 2.0. La variante "heretic" implica que se ha aplicado una tecnica de abliteration (ablacion de direcciones de rechazo en el espacio de activaciones) para reducir los comportamientos de negativa del modelo ante peticiones consideradas sensibles, dando lugar a un modelo "uncensored" o "decensored".

Esta ficha es relevante porque documenta una de las primeras cuantizaciones comunitarias de un derivado abliterated de GPT-OSS-20B, lo que permite ejecutar un modelo de 20.9 mil millones de parametros en hardware de consumo mediante llama.cpp. No obstante, la informacion publicada por el autor es extremadamente escasa: la model card es practicamente un volcado automatico de la herramienta de conversion y no incluye detalles sobre el proceso de abliteration, los datos de entrenamiento ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) segun el modelo base GPT-OSS de OpenAI; detalles exactos no disponibles en la informacion proporcionada |
| Parametros totales | 20.914.757.184 (20,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card solo muestra `-c 2048` como ejemplo de invocacion en llama-server, no como limite del modelo) |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `gpt-oss-20b-heretic-v2-q4_k_m.gguf`); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo GPT-OSS-20B de OpenAI, un transformer con capas de mezcla de expertos (MoE). No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones ocultas, numero de expertos, atencion utilizada (completa, sliding window, etc.) ni sobre la composicion del dataset de preentrenamiento. Tampoco se documenta si el modelo base original fue sometido a RLHF, DPO u otras tecnicas de alineacion posteriores al preentrenamiento.

La innovacion tecnica principal de esta variante es la aplicacion de abliteration sobre el checkpoint GPT-OSS-20B: se identifican direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y se proyectan fuera de los pesos, de modo que el modelo deja de generar negativas sistematicas. El autor del modelo base (`kmnstudio101`) no documenta en la informacion disponible la metodologia exacta, el numero de capas intervenidas ni el impacto sobre capacidades generales. La conversion a GGUF se realizo con llama.cpp mediante el espacio GGUF-my-repo de ggml.ai, aplicando cuantizacion Q4_K_M (bloques de 4 bits con escalas de 6 bits para pesos seleccionados).

## Capacidades

- Generacion de texto autoregresiva en formato conversacional y de completado.
- Razonamiento y respuesta a instrucciones, heredado del modelo GPT-OSS-20B base.
- Generacion de codigo y matematicas (capacidad esperable del modelo base, no verificada en esta variante).
- Comportamiento "uncensored": menor probabilidad de rechazar peticiones que el modelo original rechazaria, segun la etiqueta `abliterated`/`decensored`.
- Compatibilidad con llama.cpp (CLI y servidor) y, por extension, con las herramientas que consumen GGUF (Ollama, LM Studio, etc., aunque no se documenta explicitamente).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion con modelos abliterated en local: el formato GGUF Q4_K_M permite cargar el modelo en llama.cpp y comparar su comportamiento frente al GPT-OSS-20B original en tareas de rechazo/aceptacion, util para investigacion sobre alineacion y seguridad.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que aborde temas que el modelo base rechazaria, ejecutandose en una estacion de trabajo con GPU de consumo.
- Prototipado de asistentes conversacionales en local: el servidor `llama-server` expone una API compatible con OpenAI, lo que permite integrar el modelo en aplicaciones de chat sin depender de la nube.
- Evaluacion de cuantizacion: comparar la calidad de Q4_K_M frente al checkpoint original en safetensors para medir la degradacion introducida por la cuantizacion de 4 bits en un modelo de 20,9B parametros.
- Investigacion sobre sesgos y robustez: al ser un modelo decensored, sirve como caso de estudio para analizar como la abliteration afecta a la tasa de alucinacion, la utilidad general y la coherencia en tareas largas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse totalmente en local, es adecuado para procesar texto sensible sin enviar datos a servicios externos, siempre que se acepten las limitaciones de calidad de la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repo GGUF ni los metadatos proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo cuantizado ni para el modelo base `kmnstudio101/gpt-oss-20b-heretic-v2`.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 12-13 GB (el repo completo pesa 15,8 GB, incluyendo posibles archivos adicionales); se recomienda al menos 14-16 GB de VRAM para cargar el modelo con contexto moderado.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100; tambien cabe en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) con contexto reducido.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM; en GPUs de 8-12 GB requeriria offloading parcial a CPU/RAM.
- Opciones de despliegue: llama.cpp (CLI y `llama-server`), y por compatibilidad de formato GGUF, herramientas derivadas como Ollama o LM Studio (no verificado explicitamente por el autor). El tag `vllm` aparece en los metadatos, pero vLLM no consume GGUF de forma nativa estandar, por lo que su uso requeriria conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sweetprincessluna/gpt-oss-20b-heretic-v2-Q4_K_M-GGUF | 20,9B | no disponible | GGUF Q4_K_M | Apache 2.0 | Variante abliterated cuantizada; sin benchmarks publicados |
| kmnstudio101/gpt-oss-20b-heretic-v2 | 20,9B | no disponible | safetensors | Apache 2.0 | Modelo base de esta conversion; sin benchmarks publicados |
| GPT-OSS-20B (OpenAI) | 20,9B (MoE) | no disponible en la informacion proporcionada | safetensors | Apache 2.0 | Modelo original alineado; referencia de comportamiento censurado |
| Otras cuantizaciones GGUF de GPT-OSS-20B | 20,9B | no disponible | GGUF (Q4, Q5, Q8, etc.) | Apache 2.0 | Alternativas de cuantizacion con distintos equilibrios calidad/tamano |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni comparaciones publicadas; se desconoce el impacto de la abliteration sobre el rendimiento general, el razonamiento y la coherencia.
- Riesgo elevado de contenido nocivo: al ser un modelo decensored/abliterated, puede generar contenido que el modelo original rechazaria; no es adecuado para aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo de alucinacion: no cuantificado en esta variante; la cuantizacion Q4_K_M puede incrementar ligeramente los errores respecto al checkpoint en precision completa.
- Sesgos: no documentados; el modelo base GPT-OSS puede heredar sesgos de sus datos de entrenamiento, y la abliteration puede alterar el comportamiento en dominios sensibles de forma impredecible.
- Idiomas: no se especifican los idiomas soportados; se desconoce la calidad en castellano.
- Contexto: no se documenta la longitud de contexto soportada; el ejemplo de la model card usa `-c 2048`, que es solo un parametro de invocacion, no el limite del modelo.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad sobre el contenido generado recae en el desplegador.
- Madurez: el repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (19 de noviembre de 2026); no hay evidencia de validacion por la comunidad.
- Procedencia de la abliteration: no se documenta que capas o direcciones se modificaron, lo que dificulta reproducir o auditar el proceso.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/sweetprincessluna/gpt-oss-20b-heretic-v2-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/kmnstudio101/gpt-oss-20b-heretic-v2
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage

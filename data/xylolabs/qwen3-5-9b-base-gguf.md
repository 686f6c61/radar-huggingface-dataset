# Xylolabs/Qwen3.5-9B-Base-GGUF

## Resumen

Xylolabs/Qwen3.5-9B-Base-GGUF es una cuantizacion en formato GGUF del modelo base Qwen/Qwen3.5-9B-Base, publicada por Xylolabs para su uso con llama.cpp y otros runners compatibles. El repositorio contiene un unico archivo, `Qwen3.5-9B-Base-Q4_K_M.gguf`, de 5,780 GB, que reproduce el modelo de texto original (9.197.093.888 parametros, aproximadamente 9,2 mil millones) en cuantizacion de 4 bits tipo K. El modelo base procede de la familia Qwen3.5 de Alibaba y se distribuye bajo licencia Apache 2.0.

Se trata de un modelo base, no de un modelo instruido ni alineado: no incorpora plantilla de chat ni formato conversacional, y su uso previsto es la continuacion de texto a partir de un prefijo. La model card indica explicitamente el uso de `llama-completion` con `-no-cnv`, es decir, sin modo conversacional. Esto lo hace adecuado para tareas de generacion pura, evaluacion de la calidad de la cuantizacion y como punto de partida para ajuste fino, pero no para asistentes conversacionales directos.

La relevancia de esta publicacion es doble: por un lado, ofrece una version ejecutable en hardware de consumo (cabe en una RTX 4090 de 24 GB con contexto de hasta 256K segun la tabla del autor); por otro, incluye una tabla de precision frente a BF16 con divergencia KL y top-1 en WikiText-2 y en un conjunto held-out, lo que permite evaluar el coste real de la cuantizacion Q4_K_M con datos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de la familia Qwen3.5; la model card no detalla la arquitectura interna) |
| Parametros totales | 9.197.093.888 (9,2 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 256K (segun la tabla de recomendacion de hardware del autor) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado); la tabla de precision incluye ademas Q8_0, Q6_K, Q5_K_M y Q3_K_M de llama.cpp como referencia comparativa |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 5,8 GB |
| Archivo publicado | `Qwen3.5-9B-Base-Q4_K_M.gguf` (5,780 GB) |
| Modelo base | Qwen/Qwen3.5-9B-Base |
| Libreria | gguf / llama.cpp |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-15 |
| Ultima actualizacion | 2026-11-27 |
| Descargas | 576 |

## Arquitectura y entrenamiento

La model card no proporciona informacion sobre la arquitectura interna del modelo base Qwen3.5-9B-Base (tipo de transformer, atencion, posibles innovaciones como atencion lineal o decodificacion especulativa), ni sobre el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF, DPO u otra alineacion. Tampoco se detalla si el modelo base incorpora modulos multimodales; el repositorio indica que contiene "the text model" del modelo original, lo que sugiere que el modelo base podria tener componentes adicionales no incluidos en esta conversion.

Respecto al proceso de cuantizacion, el autor indica que convirtio los pesos a GGUF y los cuantizo, y que la build de llama.cpp de referencia es el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior. La model card incluye una tabla de precision frente a BF16 que mide divergencia KL y top-1 tanto en WikiText-2 como en un conjunto held-out; estos datos se reproducen en la seccion de benchmarks. No se documenta el metodo de calibracion empleado para generar el archivo Q4_K_M.

## Capacidades

- Generacion de texto por continuacion de prefijo: el uso previsto es `llama-completion` con `-no-cnv`, sin plantilla conversacional.
- Modelo base sin alineacion: no incorpora instrucciones, formato de chat ni rechazo de peticiones; no es un asistente.
- Idiomas: ingles (en) y coreano (ko) declarados en la model card.
- Contexto largo: la tabla de hardware del autor indica soporte de hasta 256K tokens con el archivo Q4_K_M.
- Ejecucion local: compatible con llama.cpp y, por extension, con runners que consumen GGUF (segun la libreria declarada).
- Punto de partida para ajuste fino o para evaluacion de la calidad de la cuantizacion Q4_K_M.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking) en la informacion disponible.

## Casos de uso

- Continuacion de texto y generacion de documentos largos: el modelo puede continuar prefijos extensos gracias a la ventana de 256K indicada por el autor, lo que permite generar articulos, informes o documentacion tecnica manteniendo coherencia sobre contextos muy largos.
- Evaluacion de cuantizaciones: la tabla de precision frente a BF16 (KL y top-1) permite usar este archivo como referencia para medir el impacto de Q4_K_M en tareas de generacion, comparandolo con las variantes Q3_K_M, Q5_K_M, Q6_K y Q8_0 de llama.cpp.
- Despliegue en hardware de consumo: con 5,8 GB de pesos, cabe en una RTX 4090 o RTX 3090 de 24 GB con contexto de 256K segun la tabla del autor, lo que habilita experimentacion local con un modelo de 9,2 mil millones de parametros.
- Generacion aumentada por recuperacion (RAG) en modo de continuacion: se puede concatenar el contexto recuperado y un prefijo de pregunta para que el modelo complete la respuesta, aunque al ser un modelo base requiere ingenieria de prompt cuidadosa y no garantiza seguir instrucciones.
- Ajuste fino supervisado sobre el modelo base: al ser un modelo base sin alinear, es un punto de partida habitual para fine-tuning con datos propios en ingles o coreano, antes de cuantizar de nuevo.
- Generacion de datos sinteticos y aumentacion de corpus: el modelo puede producir continuaciones de texto a escala para aumentar datasets de entrenamiento o evaluacion en ingles y coreano.
- Prototipado de pipelines de generacion en llama.cpp: sirve para validar integraciones con llama.cpp y runners compatibles antes de migrar a un modelo instruido o de mayor tamano.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Si incluye una tabla de precision de la cuantizacion frente a BF16, con divergencia KL y top-1 en WikiText-2 y en un conjunto held-out:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 9,786 GB | 0,000625 | 98,578% | 0,000815 | 98,500% |
| llama.cpp Q6_K | 7,559 GB | 0,002685 | 97,147% | 0,003170 | 97,147% |
| llama.cpp Q5_K_M | 6,643 GB | 0,006598 | 95,755% | 0,008458 | 95,824% |
| Q4_K_M (este repo) | 5,780 GB | 0,024531 | 92,309% | 0,027924 | 92,255% |
| llama.cpp Q4_K_M | 5,780 GB | 0,024531 | 92,309% | 0,027924 | 92,255% |
| llama.cpp Q3_K_M | 4,738 GB | 0,078980 | 86,701% | 0,094162 | 86,127% |

El archivo Q4_K_M de este repositorio presenta los mismos valores que la cuantizacion Q4_K_M de llama.cpp en la tabla, con un top-1 de 92,309% en WikiText-2 y 92,255% en held-out, y una KL de 0,024531 y 0,027924 respectivamente. No se han publicado resultados de benchmarks de capacidad (razonamiento, codigo, matematicas) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,8 GB solo para los pesos en Q4_K_M; el consumo total depende del contexto configurado (la cache KV para 256K tokens anade una cantidad no especificada en la model card).
- GPU recomendadas segun el autor: RTX 4090 / RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB).
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 de 24 GB con contexto de 256K segun la tabla del autor; tambien en RTX 5090 de 32 GB.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256 GB y 512 GB).
- Opciones de despliegue: llama.cpp (build `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque la model card no lo detalla. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Xylolabs/Qwen3.5-9B-Base-GGUF (este) | 9,2 B | 256K (segun autor) | GGUF Q4_K_M | Apache 2.0 | Cuantizacion Q4_K_M de 5,78 GB con tabla de precision KL/top-1 |
| Qwen/Qwen3.5-9B-Base | 9,2 B | no disponible en la informacion | safetensors (presumiblemente) | Apache 2.0 | Modelo base original en BF16; referencia de precision |
| Cuantizaciones Q3_K_M / Q5_K_M / Q6_K / Q8_0 de llama.cpp | 9,2 B | no disponible | GGUF | Apache 2.0 | Alternativas de compromiso tamano/precision segun la tabla del autor |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (por ejemplo, otros modelos base de ~9B) en la informacion proporcionada; por tanto, la comparativa se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Modelo base sin alinear: no sigue instrucciones ni mantiene formato conversacional; usarlo como asistente requiere ajuste fino o ingenieria de prompt especifica.
- Riesgo de alucinacion: al ser un modelo de continuacion de texto, puede generar contenido plausible pero incorrecto sin senal de incertidumbre.
- Idiomas limitados: solo se declaran ingles y coreano; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Perdida de precision por cuantizacion: Q4_K_M reduce el top-1 a 92,309% en WikiText-2 frente al 98,578% de Q8_0; para tareas sensibles a la precision conviene usar cuantizaciones mayores.
- Consumo de memoria con contexto largo: la ventana de 256K implica una cache KV considerable cuyo tamano no se detalla; en GPU de 24 GB puede requerir ajustes.
- Solo se publica un archivo (Q4_K_M): no hay variantes Q5, Q6 u Q8 en este repositorio, aunque la tabla de precision las menciona como referencia de llama.cpp.
- Licencia Apache 2.0 permite uso comercial, pero se debe citar la release original de Qwen3.5-9B-Base y conservar el aviso de licencia incluido en el repositorio.
- No se documentan sesgos especificos, pero al ser un modelo base entrenado con datos web es esperable que los reproduzca.
- La model card no detalla la arquitectura ni el entrenamiento, lo que limita la evaluacion tecnica independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-GGUF/blob/main/LICENSE
- Build de llama.cpp referenciada: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs (assets): https://github.com/XylolabsInc/tensix-bfp-gptq

# Xylolabs/Qwen3-8B-GGUF

## Resumen

Xylolabs/Qwen3-8B-GGUF es una coleccion de cuantizaciones GGUF del modelo Qwen3-8B de Alibaba Qwen, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. No se trata de un modelo nuevo, sino de una redistribucion optimizada del modelo base: el repositorio incluye tres ficheros cuantizados (Q5_K_M, IQ4_XS e IQ4_XS con importance matrix) junto con el tokenizer y la plantilla de chat originales. El modelo base cuenta con 8.190.735.360 parametros y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta publicacion radica en la trazabilidad de la cuantizacion: el autor documenta metricas objetivas de degradacion frente a BF16 (divergencia KL media y porcentaje de coincidencia top-1 sobre 16.240 posiciones de texto en ingles y coreano), algo que no es habitual en la mayoria de repositorios GGUF. Esto permite elegir el fichero en funcion del compromiso entre tamano y fidelidad de forma informada, en lugar de estimar la perdida de calidad a ojo.

El repositorio ocupa 15,0 GB e incluye una tabla de recomendacion de hardware que cubre desde una RTX 4090 de 24 GB hasta aceleradores B300 de 288 GB, siempre con una ventana de contexto de 32K tokens. La cuantizacion Q5_K_M es la recomendada por el autor para todos los perfiles de hardware listados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-8B; detalles de atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32K tokens (segun la tabla de hardware del autor; contexto nativo del modelo base no confirmado en la informacion disponible) |
| Tipos de cuantizacion | Q5_K_M (5,85 GB), IQ4_XS (4,59 GB), IQ4_XS-imat (4,56 GB) |
| Idiomas soportados | en, ko (segun tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero por cuantizacion, con tokenizer y chat template incluidos) |

## Arquitectura y entrenamiento

Esta publicacion no entrena ningun modelo: es una conversion y cuantizacion del checkpoint Qwen/Qwen3-8B. La arquitectura subyacente es la del Qwen3-8B original (transformer decoder-only con 8.190.735.360 parametros), pero la model card de este repositorio no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO. Esa informacion debe consultarse en la model card del modelo base y en el informe tecnico de Qwen3.

La innovacion tecnica destacable de este repositorio es el uso de una importance matrix (imatrix) para generar la cuantizacion IQ4_XS-imat. Segun las metricas del autor, el uso de imatrix reduce la divergencia KL media frente a BF16 de 0,0461 (IQ4_XS estandar) a 0,0302, y eleva la coincidencia top-1 del 90,31% al 92,13%, con un coste de apenas 0,03 GB adicionales. Las metricas se calcularon sobre 16.240 posiciones de texto en ingles y coreano, comparando contra una pasada BF16 en transformers. La cuantizacion Q5_K_M alcanza 0,0126 de KL media y 94,72% de top-1, siendo la opcion de mayor fidelidad.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye la plantilla de chat original de Qwen3, por lo que el modelo funciona directamente en llama-cli y llama-server con el flag `--jinja`.
- Razonamiento y conocimiento general: hereda las capacidades del Qwen3-8B base (no detalladas en esta model card).
- Capacidades multilingues limitadas a ingles y coreano segun los tags del repositorio; el resto de idiomas del modelo base no se documentan aqui.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con infraestructura de inferencia tipo API.
- Inferencia en CPU, CUDA y Metal: los GGUF permiten ejecucion en hardware sin GPU dedicada.
- No se documentan en esta model card capacidades de tool calling, agentes, vision, audio ni modo thinking; deben verificarse en el modelo base.

## Casos de uso

- Despliegue en estaciones de trabajo con una sola GPU consumer: con Q5_K_M (5,9 GB) cabe holgadamente en una RTX 4090 o RTX 3090 de 24 GB con contexto de 32K, segun la tabla del autor, lo que permite ejecutar un asistente conversacional local sin infraestructura cloud.
- Prototipado rapido en portatiles o equipos sin GPU: la cuantizacion IQ4_XS (4,59 GB) permite ejecutar el modelo en CPU con llama.cpp, util para pruebas de integracion antes de escalar a produccion.
- Servicio de inferencia HTTP: llama-server acepta los mismos flags que llama-cli, de modo que el modelo puede exponerse como endpoint compatible con clientes OpenAI en una maquina con DGX Spark o Mac Studio con memoria unificada.
- Aplicaciones en coreano e ingles: el autor valido las cuantizaciones sobre texto en ambos idiomas, lo que respalda su uso en productos dirigidos a esos mercados.
- Evaluacion de cuantizaciones en pipelines de investigacion: las metricas KL y top-1 publicadas permiten usar este repositorio como referencia para estudiar el impacto de imatrix frente a cuantizacion estandar.
- Despliegue en hardware de memoria unificada de gran capacidad: la tabla cubre Mac Studio M5 Ultra (hasta 512 GB) y DGX Spark (128 GB), escenarios donde el modelo puede convivir con otros servicios en la misma maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo publica metricas de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | KL media vs BF16 | Coincidencia top-1 vs BF16 |
|---|---:|---:|---:|
| Q5_K_M | 5,85 GB | 0,0126 | 94,72% |
| IQ4_XS | 4,59 GB | 0,0461 | 90,31% |
| IQ4_XS-imat | 4,56 GB | 0,0302 | 92,13% |

Las metricas cubren 16.240 posiciones de texto en ingles y coreano, comparadas contra una pasada BF16 en transformers.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,9 GB (Q5_K_M), 4,6 GB (IQ4_XS e IQ4_XS-imat) solo para los pesos; hay que sumar la cache KV en f16 para el contexto deseado y unos 2 GB de runtime.
- Regla del autor para que un fichero quepa: tamano del fichero + cache KV al contexto + 2 GB de runtime debe quedar por debajo del 90% de la memoria disponible.
- GPU recomendadas segun el autor: RTX 4090, RTX 3090, RTX 5090, RTX 6000 Ada, H100, H200, B200, B300 y RTX PRO 6000 Blackwell, todas con Q5_K_M y contexto de 32K.
- Cabe en GPU consumer: si, en RTX 4090 y RTX 3090 (24 GB) con Q5_K_M y 32K de contexto.
- Memoria unificada: Mac Studio M5 Max y M5 Ultra, DGX Spark (128 GB), todos con Q5_K_M a 32K.
- Opciones de despliegue: llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior), con llama-cli y llama-server; requiere el flag `--jinja` para la plantilla de chat.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---:|---|---|---|---|
| Xylolabs/Qwen3-8B-GGUF | 8,19B | 32K (segun tabla del autor) | Q5_K_M, IQ4_XS, IQ4_XS-imat | Apache 2.0 | Metricas KL y top-1 publicadas frente a BF16 |
| Qwen/Qwen3-8B (base) | 8,19B | no disponible en esta ficha | safetensors (formato original) | Apache 2.0 | Fuente de la cuantizacion; incluye informe tecnico |
| Otras cuantizaciones GGUF de Qwen3-8B | 8,19B | depende del empaquetado | variable | Apache 2.0 | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion sobre modelos alternativos de otros autores con la que comparar rendimiento de tareas en esta ficha.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: cualquier degradacion respecto al Qwen3-8B original (especialmente en IQ4_XS, con 90,31% de top-1 frente a BF16) se acumula sobre las limitaciones del modelo base.
- La validacion de fidelidad cubre solo ingles y coreano; el comportamiento en otros idiomas no esta documentado en este repositorio.
- Los tags de idioma del repositorio solo listan en y ko, aunque el modelo base pueda soportar mas idiomas; no se garantiza su calidad en esta publicacion.
- Riesgo de alucinacion: inherente al modelo base; no se documentan mitigaciones especificas en esta model card.
- Sesgos conocidos: no documentados en la informacion proporcionada; deben consultarse en la model card de Qwen3-8B.
- Licencia Apache 2.0 permite uso comercial, pero el fichero NOTICE del repositorio atribuye la autoria del modelo original; Xylolabs declara no estar afiliado ni respaldado por los autores de Qwen.
- Requiere una version concreta de llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior); versiones anteriores pueden no cargar correctamente los ficheros.
- El contexto de 32K indicado en la tabla de hardware corresponde a la configuracion recomendada por el autor, no necesariamente al maximo nativo del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Qwen3-8B-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq

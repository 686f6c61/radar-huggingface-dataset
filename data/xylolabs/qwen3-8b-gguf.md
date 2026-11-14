# Xylolabs/Qwen3-8B-GGUF

## Resumen

Xylolabs/Qwen3-8B-GGUF es una redistribucion en formato GGUF del modelo Qwen3-8B de Alibaba Qwen, convertida y cuantizada por Xylolabs mediante llama.cpp. No introduce entrenamiento ni cuantizacion nueva: empaqueta el checkpoint original en tres variantes de cuantizacion (IQ4_XS, IQ4_XS con importance matrix y Q5_K_M) pensadas para inferencia local con llama.cpp y entornos compatibles con GGUF.

El modelo base es un transformer denso de 8.190.735.360 parametros (aproximadamente 8,2 mil millones), publicado originalmente bajo licencia Apache 2.0. Esta exportacion conserva los 399 tensores del modelo de lenguaje, el tokenizer y la plantilla de chat originales, y esta etiquetada para los idiomas ingles y coreano.

Su relevancia practica es que permite ejecutar Qwen3-8B en hardware de consumo con un peso maximo de unos 5,85 GB para la variante Q5_K_M, manteniendo una fidelidad verificada frente a la referencia BF16 mediante metricas de divergencia KL. Es una opcion util para desarrolladores que quieren desplegar el modelo en local sin depender de infraestructura GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso fija 2.048 tokens) |
| Tipos de cuantizacion | IQ4_XS, IQ4_XS-imat, Q5_K_M |
| Idiomas soportados | en, ko (segun etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Detalle de las variantes publicadas:

| Fichero | Descarga (GB) | Bits medios por peso | KL media | Tipos de tensor |
|---|---:|---:|---:|---|
| `Qwen3-8B-IQ4_XS.gguf` | 4,593 | 4,481 | 0,046152 | F32: 145, IQ4_XS: 213, Q5_K: 40, Q6_K: 1 |
| `Qwen3-8B-IQ4_XS-imat.gguf` | 4,562 | 4,450 | 0,030178 | F32: 145, IQ4_XS: 217, Q5_K: 36, Q6_K: 1 |
| `Qwen3-8B-Q5_K_M.gguf` | 5,851 | 5,709 | 0,012599 | F32: 145, Q5_K: 217, Q6_K: 37 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-8B original: un transformer denso de aproximadamente 8,2 mil millones de parametros. Esta publicacion no incluye entrenamiento adicional ni un nuevo proceso de cuantizacion: los tres ficheros son conversiones y cuantizaciones realizadas con llama.cpp a partir del checkpoint Qwen/Qwen3-8B, y cada uno contiene los 399 tensores del modelo de lenguaje junto con el tokenizer y la plantilla de chat originales.

Como innovacion destacable de esta exportacion, la variante `IQ4_XS-imat` incorpora una importance matrix preexistente, lo que reduce la divergencia respecto a la referencia BF16 (KL media de 0,030178 frente a 0,046152 de la IQ4_XS plana). La model card indica que los nombres de fichero de calibracion historicos son solo etiquetas de metadatos y que no se incluyen datos de calibracion. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni sobre procesos de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con plantilla de chat Jinja incluida.
- Modo de razonamiento ("thinking") activable o desactivable mediante `--chat-template-kwargs '{"enable_thinking":false}'`.
- Soporte de los idiomas ingles y coreano segun las etiquetas del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema llama.cpp.
- Inferencia local en CPU y GPU mediante llama.cpp.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling ni agentes multi-paso para esta exportacion.

## Casos de uso

- Inferencia local en estaciones de trabajo: con la variante IQ4_XS (4,593 GB de descarga) el modelo cabe en GPUs de consumo de 8 GB o mas, permitiendo prototipado sin conexion a servicios en la nube.
- Despliegue en portatiles con GPU discreta: la Q5_K_M (5,851 GB) ofrece la mayor fidelidad frente a BF16 y puede ejecutarse en equipos con 8-12 GB de VRAM sumando el KV cache, segun la longitud de contexto configurada.
- Asistentes conversacionales de un solo turno o multi-turno corto: la plantilla de chat incluida y el soporte de `--jinja` facilitan integrar el modelo en aplicaciones de chat con llama.cpp.
- Generacion de texto en ingles y coreano: util para aplicaciones bilingues que necesiten un modelo unico con pesos ligeros.
- Evaluacion y benchmarking de cuantizaciones: las tres variantes permiten comparar el impacto de IQ4_XS, IQ4_XS-imat y Q5_K_M sobre la misma base, con metricas KL publicadas.
- Entornos con requisitos de licencia permisiva: al conservar Apache 2.0, puede integrarse en productos comerciales sin las restricciones de licencias copyleft.
- Pruebas de integracion con llama.cpp y pipelines GGUF: sirve como checkpoint de referencia para validar toolchains de conversion y cuantizacion.

## Benchmarks y rendimiento

La model card publica una evaluacion de fidelidad relativa frente a la referencia BF16, no benchmarks de tareas estandar como MMLU o HumanEval. Los datos disponibles son:

| Metrica | IQ4_XS | IQ4_XS-imat | Q5_K_M | Referencia Q4_K_M | Referencia BF16 |
|---|---:|---:|---:|---:|---:|
| KL media | 0,046152 | 0,030178 | 0,012599 | 0,042356 | no disponible |
| Ratio KL vs Q4_K_M | 1,090x | 0,712x | 0,297x | 1,000x | no disponible |
| Respuestas correctas (33 prompts) | 30/33 | 29/33 | 32/33 | 31/33 | 31/33 |
| Rechecks thinking-on (7) | 7/7 | 7/7 | 7/7 | 7/7 | 7/7 |
| Perdidas contadas | 1 | 0 | 0 | 0 | 0 |

La evaluacion usa 16 secuencias almacenadas, 16.240 posiciones puntuadas y cuatro grupos de texto en ingles y coreano (plano y chat). El suelo de referencia BF16 en llama.cpp es 0,000315. La model card no reporta velocidad ni throughput.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 5,85 GB solo para el fichero de pesos mas grande (Q5_K_M), mas espacio para KV cache y buffers. La IQ4_XS requiere 4,593 GB de pesos.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, caben en GPUs de consumo con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti/4060 Ti de 8 GB) usando IQ4_XS, y en GPUs de 12 GB o mas para Q5_K_M con contexto moderado.
- Cabe en GPU de consumo: si, en modelos con 8-12 GB de VRAM segun variante y longitud de contexto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama cli`), con soporte de GGUF; tambien compatible con el ecosistema de endpoints indicado en las etiquetas.
- Latencia y throughput: no reportados en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Xylolabs/Qwen3-8B-GGUF | 8,19 B | no disponible | GGUF | Apache 2.0 | Tres cuantizaciones, evaluacion KL publicada |
| Qwen/Qwen3-8B | 8,19 B | no disponible | safetensors | Apache 2.0 | Modelo base original en BF16 |
| Cuantizaciones GGUF de terceros de Qwen3-8B | 8,19 B | no disponible | GGUF | Apache 2.0 | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser una cuantizacion del Qwen3-8B original, hereda los sesgos del modelo base, no evaluados en esta publicacion.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de veracidad para esta exportacion.
- La cuantizacion introduce perdida de fidelidad: IQ4_XS plana pierde un item contado (`en-arith-add`) frente a BF16; IQ4_XS-imat y Q5_K_M no pierden ninguno en la evaluacion realizada.
- Idiomas soportados limitados a ingles y coreano segun las etiquetas; el rendimiento en castellano no esta documentado.
- La longitud de contexto no se especifica en la informacion disponible; el ejemplo de la model card fija 2.048 tokens.
- Licencia Apache 2.0 permite uso comercial, pero se entrega "as is", sin garantia ni respaldo del autor original.
- No se reportan datos de velocidad ni throughput, por lo que el rendimiento en produccion debe medirse en el entorno objetivo.
- Los ficheros son checkpoints alternativos: deben usarse de uno en uno, no combinados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Licencia: https://huggingface.co/Xylolabs/Qwen3-8B-GGUF/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentacion GGUF en llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio de la herramienta de cuantizacion de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq

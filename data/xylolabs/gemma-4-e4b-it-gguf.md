# Xylolabs/gemma-4-E4B-it-GGUF

## Resumen

Gemma 4 E4B IT GGUF es la distribucion cuantizada en formato GGUF del modelo google/gemma-4-E4B-it, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo base es la variante instruct de la familia Gemma 4 de Google, con 7.518.069.290 parametros totales segun los pesos en safetensors del modelo original. Esta ficha describe la version cuantizada, no el modelo base.

El repositorio ofrece ocho niveles de cuantizacion (Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M y Q2_K), cada uno en un unico fichero GGUF que incluye tokenizer y plantilla de chat. Xylolabs documenta metricas de divergencia (KL) y de coincidencia top-1 frente al modelo BF16 sobre tres conjuntos de texto, lo que permite elegir el nivel de cuantizacion con criterios cuantitativos en lugar de heuristicas.

La relevancia de esta publicacion radica en la calidad de las cuantizaciones de baja y media profundidad: sus ficheros Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M e IQ3_M presentan divergencias muy inferiores a las de alternativas populares (bartowski, Unsloth) del mismo tamano, lo que hace viable desplegar un modelo de 7.500 millones de parametros en hardware de consumo con perdida de fidelidad acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base google/gemma-4-E4B-it; no se detalla en la informacion proporcionada) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M, Q2_K |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero por cuantizacion, con tokenizer y plantilla de chat incluidos) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base google/gemma-4-E4B-it, ni los datos de entrenamiento (numero de tokens, composicion del corpus, fases de RLHF/DPO). Lo unico documentado es que se trata de un modelo instruct de la familia Gemma 4 y que la version de Xylolabs es una cuantizacion del mismo, no un ajuste adicional.

La innovacion tecnica de esta publicacion reside en el proceso de cuantizacion. Xylolabs emplea imatrix (segun los tags del repositorio) y evalua cada fichero frente a los logits del modelo BF16 en tres regimenes: wikitext-2, texto con formato de chat en ingles, coreano, codigo y matematicas, y un texto crudo reservado (held-out). Las metricas reportadas son la divergencia KL y el porcentaje de coincidencia top-1, lo que permite comparar cuantizaciones de forma objetiva.

## Capacidades

- Generacion de texto conversacional en ingles y coreano, con plantilla de chat incluida en el fichero GGUF.
- Inferencia en llama.cpp sobre CUDA, Metal y CPU, lo que cubre GPU dedicadas, Apple Silicon y despliegues sin acelerador.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su integracion en servicios de inferencia.
- Capacidades del modelo base (razonamiento, codigo, matematicas, tool calling, agentes): no disponibles en la informacion proporcionada; deben consultarse en la model card de google/gemma-4-E4B-it.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito para esta version.

## Casos de uso

- Despliegue local en estaciones de trabajo: el fichero Q4_K_M (4,98 GB) o IQ4_XS (4,72 GB) cabe en GPU de consumo con 8 GB de VRAM, lo que permite ejecutar un modelo instruct de 7.500 millones de parametros sin conexion a servicios externos.
- Servicios de inferencia en CPU: con Q2_K (3,64 GB) o IQ3_M (3,72 GB) se puede servir generacion de texto en servidores sin GPU, manteniendo una coincidencia top-1 superior al 86 % frente al BF16 en wikitext-2.
- Aplicaciones en coreano e ingles: el modelo base declara soporte para ambos idiomas y las cuantizaciones se evaluan especificamente sobre texto coreano en el conjunto de chat, por lo que es adecuado para asistentes bilingues en ese par de idiomas.
- Prototipado rapido con llama.cpp: al incluir tokenizer y plantilla de chat en un unico fichero, se puede arrancar un chat funcional con un solo comando, sin pasos de conversion adicionales.
- Evaluacion comparativa de cuantizaciones: las tablas de KL y top-1 permiten seleccionar el nivel de cuantizacion segun el presupuesto de memoria y la tolerancia a la perdida de fidelidad, por ejemplo Q6_K (KL 0,0056 en wikitext-2) frente a Q2_K (KL 0,1169).
- Integracion en pipelines de CI/CD o herramientas de desarrollo: si el modelo base soporta tool calling (no confirmado en la informacion disponible), la version GGUF puede ejecutarse en el mismo entorno que el resto del pipeline sin depender de APIs externas.
- Educacion e investigacion: el formato GGUF y la licencia Apache 2.0 facilitan su uso en entornos academicos y en experimentos reproducibles sobre hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas de fidelidad de cuantizacion frente al modelo BF16.

| Cuantizacion | Tamano | KL wikitext-2 | KL chat | KL held-out | Top-1 wikitext-2 | Top-1 chat | Top-1 held-out |
|---|---|---|---|---|---|---|---|
| Q6_K | 7,07 GB | 0,0056 | 0,0043 | 0,0045 | 96,96 % | 98,11 % | 97,55 % |
| Q5_K_M | 5,48 GB | 0,0132 | 0,0107 | 0,0114 | 95,32 % | 96,58 % | 96,25 % |
| Q4_K_M | 4,98 GB | 0,0228 | 0,0201 | 0,0200 | 94,02 % | 95,41 % | 95,02 % |
| Q4_K_S | 4,84 GB | 0,0277 | 0,0234 | 0,0247 | 93,28 % | 95,08 % | 94,63 % |
| IQ4_XS | 4,72 GB | 0,0276 | 0,0277 | 0,0264 | 93,30 % | 94,68 % | 94,30 % |
| Q3_K_M | 4,06 GB | 0,0645 | 0,0611 | 0,0620 | 89,75 % | 91,86 % | 91,38 % |
| IQ3_M | 3,72 GB | 0,1015 | 0,0868 | 0,1040 | 87,42 % | 90,87 % | 89,15 % |
| Q2_K | 3,64 GB | 0,1169 | 0,0980 | 0,1149 | 86,63 % | 90,28 % | 88,62 % |

Comparativa de fidelidad con cuantizaciones de terceros del mismo tamano aproximado:

| Fichero | Tamano | KL wikitext-2 | KL chat | Top-1 wikitext-2 | Top-1 chat |
|---|---|---|---|---|---|
| Xylolabs Q6_K | 7,07 GB | 0,0056 | 0,0043 | 96,96 % | 98,11 % |
| Unsloth Q6_K | 7,07 GB | 0,0106 | 0,0067 | 95,88 % | 97,05 % |
| Xylolabs Q5_K_M | 5,48 GB | 0,0132 | 0,0107 | 95,32 % | 96,58 % |
| Unsloth Q5_K_M | 5,48 GB | 0,0321 | 0,0190 | 92,71 % | 95,29 % |
| Xylolabs Q4_K_M | 4,98 GB | 0,0228 | 0,0201 | 94,02 % | 95,41 % |
| Unsloth Q4_K_M | 4,98 GB | 0,0990 | 0,0625 | 87,04 % | 91,38 % |
| bartowski Q4_K_M | 5,41 GB | 0,0805 | 0,0551 | 88,54 % | 92,58 % |
| Xylolabs Q3_K_M | 4,06 GB | 0,0645 | 0,0611 | 89,75 % | 91,86 % |
| Unsloth Q3_K_M | 4,06 GB | 0,2690 | 0,1857 | 79,14 % | 85,34 % |
| bartowski Q3_K_M | 4,90 GB | 0,7254 | 0,4603 | 68,22 % | 78,34 % |

En Q8_0, las cuantizaciones de terceros alcanzan mayor fidelidad que cualquier fichero de Xylolabs (Unsloth UD-Q8_K_XL: KL 0,0023 en wikitext-2, top-1 98,13 %), pero ese nivel de cuantizacion no se ofrece en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas el contexto y los buffers de llama.cpp. Q6_K: ~7,1 GB; Q5_K_M: ~5,5 GB; Q4_K_M: ~5,0 GB; IQ4_XS: ~4,7 GB; Q3_K_M: ~4,1 GB; IQ3_M: ~3,7 GB; Q2_K: ~3,6 GB.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, tarjetas con 8 GB o mas de VRAM pueden alojar las cuantizaciones Q4 e inferiores; las de 12 GB o mas admiten Q6_K con contexto amplio.
- GPU de consumo: las cuantizaciones Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M y Q2_K caben en tarjetas de 8 GB; Q5_K_M y Q6_K requieren 8-12 GB segun la longitud de contexto.
- Opciones de despliegue: llama.cpp (referencia explicita de la model card, con build concreto enlazado), y por extension cualquier herramienta basada en llama.cpp. El tag `endpoints_compatible` sugiere compatibilidad con servicios de endpoints, aunque no se detalla cual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs gemma-4-E4B-it-GGUF | 7.518.069.290 | no disponible | Apache 2.0 | GGUF | Cuantizaciones con KL muy baja en Q4/Q3; 8 niveles disponibles |
| google/gemma-4-E4B-it | 7.518.069.290 | no disponible | no disponible | safetensors (segun parametros reportados) | Modelo base instruct; referencia BF16 para las metricas |
| Cuantizaciones Unsloth del mismo base | mismo base | no disponible | no disponible | GGUF | Mayor fidelidad en Q8_0; peor KL en Q3-Q5 que Xylolabs |
| Cuantizaciones bartowski del mismo base | mismo base | no disponible | no disponible | GGUF | KL notablemente superior en Q3 y Q2; Q8_0 mejor que Xylolabs |

No se dispone de informacion sobre modelos alternativos de otros desarrolladores con los que comparar rendimiento de tareas.

## Limitaciones y advertencias

- Solo se declaran los idiomas ingles y coreano; el rendimiento en castellano no esta documentado y no deberia asumirse.
- No hay resultados de benchmarks de tareas, por lo que no se puede evaluar la calidad del modelo base en razonamiento, codigo o matematicas a partir de esta ficha.
- Las cuantizaciones de baja profundidad (Q3_K_M, IQ3_M, Q2_K) degradan la fidelidad de forma apreciable: Q2_K presenta KL de 0,1169 en wikitext-2 y una coincidencia top-1 de 86,63 %, frente al 96,96 % de Q6_K.
- El repositorio no ofrece Q8_0; si se requiere la maxima fidelidad, las cuantizaciones de terceros (Unsloth UD-Q8_K_XL, Unsloth Q8_0) superan a cualquier fichero de este repositorio.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en la informacion proporcionada; deben consultarse en la model card de google/gemma-4-E4B-it.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base, cuya licencia no se detalla en la informacion disponible.
- El repositorio tiene 0 likes y 1.305 descargas en el momento de la consulta; es una publicacion reciente (creada el 14 de noviembre de 2026) sin validacion comunitaria amplia.
- La longitud de contexto no esta especificada; el consumo de VRAM crecera con el contexto y puede superar las estimaciones basadas solo en el tamano del fichero.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E4B-it-GGUF/blob/main/LICENSE
- llama.cpp (build referenciado): https://github.com/ggml-org/llama.cpp/tree/e4b620af19f02960dea7a3a81de7c5805aa3a333
- Paper referenciado en los tags (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Repositorio de Xylolabs (assets): https://github.com/XylolabsInc/tensix-bfp-gptq

# zanezhang666/Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF

## Resumen

Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF es una distribucion cuantizada en formato GGUF del modelo DeepSeek-V4-Flash de DeepSeek, publicada por el usuario zanezhang666 y derivada del trabajo de cuantizacion de antirez y huihui.ai. Se trata de una version "abliterated", es decir, con el filtrado de seguridad reducido mediante tecnicas de abliteration, orientada a entornos de investigacion y experimentacion controlada. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 284.334.567.511 parametros totales, segun los datos de safetensors del repositorio.

La relevancia de esta publicacion reside en que permite ejecutar un modelo MoE de gran tamano en hardware de consumo y estaciones de trabajo mediante cuantizaciones extremas (IQ2_XXS, Q2_K, Q4_K), con soporte especifico para los motores DS4 de antirez y las bifurcaciones de llama.cpp adaptadas a DeepSeek-V4-Flash. Incluye ademas un modulo MTP (multi-token prediction) opcional para decodificacion especulativa y parches de aceleracion multi-GPU mediante Unix Domain Sockets y tensor parallelism.

El repositorio ocupa 354,9 GB e incluye variantes desde 74,7 GiB (IQ2_XXS) hasta 153 GiB (Q4_K), pensadas para Mac con 128 GB o 256 GB de RAM y para GPUs profesionales como la RTX 6000 Pro. La licencia declarada es MIT, aunque el modelo base conserva sus propias condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), segun tags del repositorio |
| Parametros totales | 284.334.567.511 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (valor de `--ctx` en el ejemplo de servidor DS4) |
| Tipos de cuantizacion | IQ2_XXS, Q2_K, Q4_K (expertos enrutados); Q8_0 en proyecciones de atencion, expertos compartidos y salida; F16 en router, embeddings, indexer, compressor y HC; F32 en norms, sinks y bias |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (variantes Q2, IQ2_XXS, Q2_K, Q4_K y MTP Q4K-Q8_0-F32) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash es un transformer de tipo mixture-of-experts, segun los tags del repositorio (`moe`, `mixture-of-experts`). Los archivos GGUF distinguen explicitamente entre expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`), expertos compartidos, router, embeddings, indexer, compressor y capas de normalizacion, lo que confirma una topologia MoE con expertos compartidos y componentes auxiliares propios de la familia DeepSeek. No se dispone de informacion sobre el numero de expertos, el numero de expertos activos por token ni la dimension oculta.

En cuanto al entrenamiento, no se han publicado en la informacion disponible datos sobre volumen de tokens, composicion del dataset, fases de RLHF o DPO, ni innovaciones de entrenamiento del modelo base. La unica informacion tecnica adicional es la relativa al proceso de cuantizacion: los expertos enrutados se cuantizan de forma agresiva (IQ2_XXS, Q2_K o Q4_K) mientras que el resto de componentes se mantiene en Q8_0, F16 o F32 para preservar calidad. El modulo MTP (`DeepSeek-V4-Flash-MTP-Q4K-Q8_0-F32.gguf`, 3,6 GiB) habilita decodificacion especulativa opcional y requiere un loader especifico.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` y el ejemplo de chat del repositorio.
- Razonamiento y generacion de codigo: la model card indica que la variante Q2 "should be fine for writing code".
- Soporte de decodificacion especulativa mediante el modulo MTP opcional.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio, tool calling y agentes: no disponible en la informacion proporcionada.
- Modo "uncensored": el filtrado de seguridad ha sido reducido mediante abliteration, lo que cambia el perfil de respuestas del modelo.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un MoE de gran escala tras aplicar abliteration, comparando tasas de rechazo y calidad entre las variantes Q2, IQ2_XXS, Q2_K y Q4_K en entornos controlados.
- Generacion de codigo en local: con la variante Q2 en una maquina con 128 GB de RAM, el modelo puede asistir en tareas de programacion sin depender de APIs externas, segun la indicacion del autor de que Q2 es adecuada para escribir codigo.
- Despliegue en estaciones de trabajo con GPU profesional: el autor reporta mas de 35 tokens por segundo con una RTX 6000 Pro (96 GB) en WSL2 con CUDA 13.0, lo que hace viable servir el modelo mediante `ds4-server` con contexto de 131.072 tokens para aplicaciones internas.
- Experimentacion con decodificacion especulativa: el modulo MTP permite medir el impacto del speculative decoding en latencia y throughput sobre el mismo modelo, util para investigacion de sistemas de inferencia.
- Pruebas de inferencia multi-GPU en hardware de consumo: los parches de Unix Domain Sockets y tensor parallelism del fork de ds4 permiten evaluar el reparto de capas entre varias GPUs consumer en una misma maquina.
- Evaluacion de cuantizaciones extremas: comparar IQ2_XXS (74,7 GiB) frente a Q4_K (153 GiB) en tareas de codigo y conversacion permite caracterizar la perdida de calidad de las cuantizaciones de 2 bits en un MoE de 284.000 millones de parametros.
- Entornos de investigacion con requisitos de contenido sin filtro: el autor recomienda uso en investigacion, testing o entornos controlados, no en produccion ni en aplicaciones publicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es el reportado por el autor: mas de 35 tokens por segundo con una RTX 6000 Pro (96 GB) bajo Windows/WSL2, Ubuntu 24.04 y CUDA 13.0, usando el motor DS4. No se han publicado mediciones en Apple Silicon ni en otras GPU.

## Requisitos de hardware

- VRAM/RAM estimada segun variante: IQ2_XXS 74,7 GiB; Q2 80,8 GiB; Q2_K 92,8 GiB; Q4_K 153 GiB. El modulo MTP anade 3,6 GiB adicionales.
- Recomendacion del autor: Q2 en Mac con 128 GB de memoria unificada; Q4 en maquinas con 256 GB de RAM o mas.
- GPU probada: RTX 6000 Pro (96 GB) con CUDA 13.0; el autor menciona tambien DGX Spark como hardware soportado, aunque no probado.
- Apple Silicon: soporte Metal para MacBook con 96 GB de RAM y equipos clase Mac Studio; no probado por el autor.
- Multi-GPU: soportado por `ds4` y por `Fringe210/llama.cpp-deepseek-v4-flash-cuda`, con parches de UDS y tensor parallelism.
- Opciones de despliegue: motor DS4 (`ds4`, `ds4-server`) y la bifurcacion de llama.cpp para DeepSeek-V4-Flash CUDA. El servidor DS4 admite cache KV en disco (`--kv-disk-dir`, `--kv-disk-space-mb`) y precalentado de pesos (`--warm-weights`).
- Throughput: mas de 35 tokens por segundo en RTX 6000 Pro con la variante Q2. Latencia no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF | 284,3 mil millones (MoE) | 131.072 tokens | GGUF IQ2_XXS, Q2_K, Q4_K | MIT | Hugging Face |
| deepseek-ai/DeepSeek-V4-Flash (base) | 284,3 mil millones (MoE) | no disponible | safetensors (original) | no disponible | Hugging Face |
| antirez/deepseek-v4-gguf (plantilla de cuantizacion) | 284,3 mil millones (MoE) | no disponible | GGUF IQ2XXS con Q8/F16/F32 mixtos | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El filtrado de seguridad ha sido reducido mediante abliteration: el modelo puede generar contenido sensible, controvertido o inapropiado. El autor desaconseja su uso en produccion, aplicaciones publicas, entornos con menores o contextos que exijan alta seguridad.
- La variante Q2 presenta "cierto indice de rechazo" segun el autor; el resto de variantes estaban en pruebas en el momento de la publicacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo de este tipo sin datos de evaluacion publicados.
- Idiomas soportados no documentados; no hay garantia de calidad fuera de los idiomas del modelo base.
- Las cuantizaciones de 2 bits (IQ2_XXS, Q2_K) degradan la calidad respecto a Q4_K; el autor no publica metricas de la perdida.
- El modulo MTP requiere un loader especifico y no es un modelo autonomo.
- El autor declara no asumir responsabilidad por las consecuencias del uso y recomienda monitorizacion y revision manual de las salidas.
- Solo se ha probado el motor DS4 en RTX 6000 Pro; otros entornos (Apple Silicon, DGX Spark) no estan verificados.
- La licencia MIT se declara en el repositorio, pero el modelo base puede tener condiciones adicionales que conviene revisar antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zanezhang666/Huihui-DeepSeek-V4-Flash-abliterated-ds4-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Cuantizaciones de referencia de antirez: https://huggingface.co/antirez/deepseek-v4-gguf/tree/main
- Motor DS4: https://github.com/antirez/ds4
- Parche UDS de ds4: https://github.com/huihui-support/ds4/tree/uds
- Parche tensor-parallel de ds4: https://github.com/huihui-support/ds4/tree/tp
- llama.cpp adaptado con CUDA: https://github.com/Fringe210/llama.cpp-deepseek-v4-flash-cuda
- Cuenta de soporte del autor: https://x.com/support_huihui

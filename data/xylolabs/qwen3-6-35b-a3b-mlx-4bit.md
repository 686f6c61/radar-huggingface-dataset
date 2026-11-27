# Xylolabs/Qwen3.6-35B-A3B-MLX-4bit

## Resumen

Qwen3.6-35B-A3B-MLX-4bit es una cuantizacion en formato MLX de 4 bits del modelo Qwen/Qwen3.6-35B-A3B, publicada por Xylolabs. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 34.660.608.768 parametros totales (segun los safetensors del repo) y aproximadamente 3.000 millones de parametros activos por token, segun indica el sufijo A3B de su denominacion. La version publicada por Xylolabs esta pensada exclusivamente para `mlx-lm` sobre hardware Apple Silicon y es solo texto: se han eliminado la torre de vision y la capa MTP (multi-token prediction) del modelo original.

La relevancia de esta ficha es practica: permite ejecutar un MoE de aproximadamente 35.000 millones de parametros en un Mac con memoria unificada de 32 GB, algo imposible con los pesos en BF16 (que rondarian los 70 GB). El repo ocupa 20,7 GB y la cuantizacion es afin con grupo de 64 y escalas y sesgos en float16, con los expertos enrutados en 4 bits y el resto de capas lineales, el embedding de tokens y el LM head en 8 bits. La licencia es Apache 2.0, lo que facilita su uso comercial.

El modelo conserva el modo de razonamiento (thinking) activado por defecto del modelo base y admite desactivarlo mediante configuracion de la plantilla de chat. Se trata de una publicacion reciente (27 de noviembre de 2026) sin descargas ni likes registrados en el momento de la consulta, por lo que no hay validacion comunitaria independiente del resultado de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), solo texto en esta conversion |
| Parametros totales | 34.660.608.768 |
| Parametros activos | Aproximadamente 3.000 millones (denominacion A3B del modelo base) |
| Longitud de contexto | Hasta 256K tokens (203K en configuracion de 32 GB) |
| Tipos de cuantizacion | 4 bits (afin, grupo 64); expertos enrutados 4 bits, resto de lineales, embedding y LM head 8 bits; normas en float16 y `A_log` en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (libreria `mlx-lm` 0.32.2) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: un total de 34.660.608.768 parametros de los que solo se activa un subconjunto por token (aproximadamente 3.000 millones, segun la nomenclatura A3B). La conversion de Xylolabs mantiene la estructura MoE pero elimina dos componentes del original: la torre de vision y la capa MTP (multi-token prediction), de modo que esta version es estrictamente de texto. La cuantizacion es afin con grupo de 64, con escalas y sesgos en float16; los expertos enrutados se cuantizan a 4 bits y el resto de capas lineales, el embedding de tokens y el LM head a 8 bits. Las normas y el resto de tensores no cuantizados quedan en float16, salvo `A_log`, que se conserva en bfloat16.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados, la composicion de los datos ni si hubo etapas de RLHF o DPO. Tampoco se documenta en la informacion proporcionada ninguna innovacion adicional del modelo original mas alla de la propia arquitectura MoE y de la capa MTP omitida en esta conversion. La model card de Xylolabs se limita a describir el proceso de cuantizacion y a reportar metricas de fidelidad respecto a BF16.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat compatible con `mlx_lm.chat`.
- Razonamiento en modo thinking activado por defecto; se puede desactivar con `--chat-template-config '{"enable_thinking": false}'`.
- Capacidades de codigo y matematicas heredadas del modelo base Qwen3.6 (no se detallan evaluaciones especificas en la informacion disponible).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: no soportada en esta conversion (la torre de vision fue eliminada).
- Tool calling y function calling: no documentado en la informacion disponible para esta version.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking sugiere capacidad de razonamiento extendido, pero no hay validacion publicada.
- Decodificacion especulativa mediante MTP: no disponible en esta conversion (capa MTP eliminada).

## Casos de uso

- Asistente local en Mac con 32 GB de memoria unificada: el modelo cabe en 20,72 GB y permite conversaciones con hasta 203K tokens de contexto en un Mac Studio M5 Max de 32 nucleos de GPU, sin depender de la nube.
- Procesamiento de documentos largos en local: con 256K tokens de contexto en configuraciones de 48 GB o superiores, se pueden analizar contratos, informes o bases de codigo extensas en una sola pasada.
- Generacion de codigo en estaciones de trabajo Apple Silicon: integrable en flujos de desarrollo mediante `mlx_lm.generate` para autocompletado, explicacion de fragmentos o generacion de tests, manteniendo el codigo en la maquina.
- Prototipado de agentes con razonamiento: el modo thinking permite cadenas de razonamiento antes de responder, util para tareas de planificacion o resolucion de problemas paso a paso en entornos de investigacion.
- Chatbot de atencion al cliente en despliegues de privacidad estricta: al ejecutarse localmente, los datos no salen del dispositivo, lo que encaja en sectores regulados que no pueden enviar conversaciones a APIs externas.
- Investigacion sobre cuantizacion: sirve como referencia para estudiar la degradacion de un MoE de 35B al pasar a 4 bits, con metricas de KL y top-1 publicadas frente a BF16 en WikiText-2, chat y texto reservado.
- Educacion y demostraciones offline: permite mostrar un modelo de gran tamano en portatiles o equipos de escritorio Mac sin conexion, con la posibilidad de desactivar el modo thinking para respuestas mas rapidas.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K) sino metricas de fidelidad de la cuantizacion frente a BF16, medidas sobre fragmentos de 512 tokens (40/20/20 para WikiText-2, chat y texto reservado) y una prueba de 7 preguntas.

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Texto reservado KL | top-1 | 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 36,83 GB | 0,004860 | 97,40% | 0,006771 | 97,57% | 0,003843 | 96,94% | 6/7 (BF16: 7/7) |
| MLX 4-bit | 20,72 GB | 0,021425 | 94,10% | 0,036294 | 94,00% | 0,021780 | 92,63% | 7/7 (BF16: 7/7) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Inferencia exclusiva en Apple Silicon mediante `mlx-lm` 0.32.2; no es compatible con CUDA ni con GPUs NVIDIA/AMD.
- VRAM equivalente: 20,72 GB de memoria unificada para la version 4-bit; 36,83 GB para la 8-bit.
- Mac Studio M5 Max con 32 GB de memoria unificada y GPU de 32 nucleos: version 4-bit con contexto de 203K tokens.
- Mac Studio M5 Max con 48 GB y GPU de 40 nucleos: version 4-bit con contexto completo de 256K.
- Mac Studio M5 Max con 64 GB o M5 Ultra con 96 GB o mas: version 8-bit con 256K de contexto.
- Mac Studio M5 Ultra con 256 GB o 512 GB (80 nucleos de GPU): version 8-bit con 256K de contexto.
- No cabe en GPUs de consumo tipo RTX 4090 en su formato nativo MLX; requeriria otra conversion (GGUF, por ejemplo) que no se ofrece en este repo.
- Opciones de despliegue: `mlx_lm.generate` y `mlx_lm.chat` de la libreria `mlx-lm`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.6-35B-A3B-MLX-4bit | 34,66B totales, ~3B activos | 256K (203K en 32 GB) | 4-bit MLX | Apache 2.0 | Hugging Face, solo Apple Silicon |
| Xylolabs/Qwen3.6-35B-A3B-MLX-8bit | 34,66B totales, ~3B activos | 256K | 8-bit MLX | Apache 2.0 | Hugging Face, requiere 36,83 GB |
| Qwen/Qwen3.6-35B-A3B (base) | 34,66B totales, ~3B activos | No disponible | BF16 | Apache 2.0 | Hugging Face, requiere ~70 GB |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de vision fue eliminada, por lo que no puede procesar imagenes.
- Sin capa MTP: no se beneficia de decodificacion especulativa multi-token, lo que puede reducir el throughput frente al modelo base.
- Solo Apple Silicon: requiere `mlx-lm` y hardware Apple; no es desplegable en GPUs NVIDIA ni en servidores x86 convencionales.
- Degradacion por cuantizacion: la version 4-bit presenta una KL de 0,0214 en WikiText-2 y un top-1 del 94,10% frente a BF16, con mayor desviacion en dominio de chat (KL 0,0363).
- Riesgo de alucinacion: no evaluado en la informacion disponible; es un riesgo inherente a los modelos de lenguaje y debe mitigarse con validacion externa en produccion.
- Sesgos: no documentados en la informacion proporcionada.
- Idiomas: no se especifica la cobertura linguistica de esta conversion; no asumir multilingue sin validacion.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y el NOTICE del autor de la conversion.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; la calidad de la conversion no ha sido verificada de forma independiente.
- Contexto efectivo variable: en equipos de 32 GB el contexto maximo practico es de 203K tokens, no 256K.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Version 8-bit del mismo autor: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-MLX-8bit
- Libreria MLX: https://github.com/ml-explore/mlx
- Repositorio del autor (herramientas de cuantizacion): https://github.com/XylolabsInc/tensix-bfp-gptq

# wyattearp/Gemma-4-26B-A4B-it-NVFP4

## Resumen

Gemma-4-26B-A4B-it-NVFP4 es una cuantizacion post-entrenamiento (PTQ) en precision mixta del modelo MoE Gemma-4-26B-A4B-it de Google, publicada por el usuario wyattearp. El objetivo es habilitar la ejecucion nativa en Tensor Cores FP4 de la arquitectura NVIDIA Blackwell (GB10/DGX Spark, GB200, B200 y serie RTX 50), reduciendo el checkpoint de 49,2 GiB en BF16 a 16,07 GiB, un 67,3 % menos de huella de parametros.

El modelo base es un transformer disperso de tipo Mixture-of-Experts con 128 expertos enrutados y top-4 activos por token. La model card declara 26B parametros totales y aproximadamente 4B activos por token, aunque el archivo safetensors del repositorio registra 13.564.218.672 parametros, una discrepancia que conviene verificar antes de dimensionar el despliegue. La ventana de contexto declarada alcanza los 262.144 tokens.

La relevancia actual radica en que permite servir un MoE de gran contexto en una sola GPU Blackwell de 128 GB (DGX Spark o RTX 5090) dejando espacio para KV-cache, con kernels CUTLASS y FlashInfer para FP4. La model card advierte ademas de un bug conocido en el parser de tool calling de vLLM (issue #54256, PR #54257) que puede fragmentar o descartar llamadas a herramientas al salir del canal de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con 128 expertos enrutados y top-4 activos por token |
| Parametros totales | 26B declarados en la model card; 13.564.218.672 segun safetensors del repo |
| Parametros activos | Aproximadamente 4B por token (declarado) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (E2M1, block size 16) para MLPs de expertos; BF16 nativo en atencion, routers/gating, embeddings y LM head; escalas FP8 por bloque |
| Idiomas soportados | Ingles (tag `en`) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors en formato `modelopt` / `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 128 expertos y enrutamiento top-4 por token, disenado para activar solo una fraccion de los parametros en cada paso. La cuantizacion no es uniforme: los MLPs de los expertos, que representan mas del 85 % del volumen de parametros, se cuantizan a NVFP4 con bloques contiguos de 16 elementos a lo largo de la dimension interna de canales y un factor de escala FP8 por bloque. Las capas de atencion (q, k, v, o), el gating y los routers, los embeddings y el LM head se mantienen en BF16 nativo para preservar la geometria de RoPE, la precision del producto query-key en contextos largos, el rango dinamico de los logits de enrutamiento y la entropia de tokens sobre un vocabulario de 256.000 entradas.

La formulacion del bloque cuantizado calcula la escala como el maximo absoluto del bloque dividido por V_max = 6,0, el maximo representable en FP4 E2M1, y redondea cada peso al entero mas cercano dentro de ese rango. En ejecucion, los Tensor Cores FP4 de Blackwell realizan la multiplicacion-acumulacion matricial fusionada contra los pesos reconstruidos. No se detallan en la informacion disponible los datos de entrenamiento del modelo base, el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO. La model card menciona aceleracion de prefill y decode de un solo flujo mediante kernels CUTLASS y FlashInfer para MoE FP4.

## Capacidades

- Generacion de texto conversacional en ingles con modo de razonamiento (thinking channel) y parser de razonamiento dedicado en vLLM.
- Tool calling / function calling, con parser `gemma4` en vLLM y soporte de auto tool choice; requiere el parche del PR #54257 para extraccion fiable de llamadas.
- Razonamiento multi-paso y flujos de agente, apoyados en la ventana de 262.144 tokens para mantener historial y resultados de herramientas.
- Procesamiento de contextos largos gracias a la atencion en BF16 y a la asignacion amplia de KV-cache que permite la huella reducida del checkpoint.
- Capacidades multilingues limitadas al ingles segun el tag de idioma del repositorio.
- No se declaran capacidades de vision ni de audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede sostener conversaciones multi-turno con historial extenso gracias a los 262.144 tokens de contexto, manteniendo el enrutamiento de expertos estable al conservar routers y gating en BF16.
- Generacion de codigo en produccion: el soporte de tool calling permite integrarlo en pipelines de CI/CD para invocar linters, ejecutar tests o consultar repositorios, con la salvedad de aplicar el parche del parser de vLLM.
- Agentes autonomos con razonamiento multi-paso: el modo thinking y el parser de razonamiento de vLLM permiten separar trazas de razonamiento de la respuesta final en flujos de planificacion y ejecucion de tareas.
- Analisis de documentos largos: con 262.144 tokens se pueden procesar contratos, informes o bases de codigo completas en una sola pasada, usando la KV-cache ampliada que permite la cuantizacion a 16,07 GiB.
- Despliegue en estaciones de trabajo Blackwell: el checkpoint cabe en una DGX Spark o RTX 5090 de 128 GB, lo que habilita prototipado e inferencia local de un MoE de gran contexto sin clúster multi-GPU.
- Servicio de inferencia de alto throughput: los kernels FP4 de CUTLASS y FlashInfer aceleran prefill y decode de un solo flujo, adecuado para APIs internas con vLLM y memoria unificada.
- Evaluacion e investigacion de cuantizacion: sirve como referencia para estudiar el impacto de la precision mixta en la especializacion de expertos y en la estabilidad del enrutamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de huella: 16,07 GiB de checkpoint frente a 49,2 GiB en BF16, una reduccion del 67,3 %.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,07 GiB de pesos; el resto de la memoria se destina a KV-cache para secuencias de hasta 262.144 tokens.
- GPU recomendadas: NVIDIA Blackwell con instrucciones nativas NVFP4, es decir, GB10 (DGX Spark), GB200, B200 y serie RTX 50 (RTX 5090).
- Cabe en GPU de consumo: si, en RTX 5090 de 128 GB; en tarjetas Blackwell con menos memoria la ventana de contexto practica queda limitada por la KV-cache.
- Opciones de despliegue: vLLM con `--dtype auto`, `--trust-remote-code`, `--max-model-len 262144`, `--tool-call-parser gemma4`, `--reasoning-parser gemma4` y `--enable-auto-tool-choice`; el formato `modelopt`/`compressed-tensors` esta pensado para vLLM.
- Latencia y throughput: la model card indica aceleracion de prefill y decode de un solo flujo mediante CUTLASS y FlashInfer, pero no proporciona cifras concretas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-it-NVFP4 (este) | 26B declarados / 13,56B en safetensors; ~4B activos | 262.144 | NVFP4 + BF16 mixto | Gemma Terms of Use | Hugging Face, 75 descargas |
| google/gemma-4-26B-A4B-it (BF16) | 26B declarados; ~4B activos | 262.144 | BF16 | Gemma Terms of Use | Hugging Face (modelo base) |
| Alternativas NVFP4 de otros MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en otros idiomas no esta documentado.
- La cuantizacion NVFP4 de los expertos puede introducir perdida de perplejidad y degradar la especializacion de expertos frente al modelo BF16; no se publican metricas de evaluacion que lo cuantifiquen.
- Bug conocido en vLLM: las llamadas a herramientas pueden descartarse o fragmentarse al salir del canal de razonamiento (issue #54256). Es necesario aplicar el PR #54257 o montar el parser parcheado para produccion.
- Discrepancia entre los 26B declarados y los 13.564.218.672 parametros del safetensors; conviene verificar el conteo real antes de planificar memoria y rendimiento.
- Dependencia de hardware Blackwell para aprovechar NVFP4; en GPUs sin Tensor Cores FP4 el modelo no obtiene la aceleracion prevista.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no mitigado ni documentado en la model card.
- Licencia Gemma Terms of Use: es obligatorio revisar las condiciones antes de un despliegue comercial.
- Repositorio con 75 descargas y 0 likes, sin validacion comunitaria extensa; la fecha de creacion (2026-09-01) y actualizacion (2026-09-19) indican un artefacto reciente.
- El modelo base no documenta en esta informacion los sesgos conocidos ni la composicion del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/wyattearp/Gemma-4-26B-A4B-it-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Issue de vLLM sobre el parser de tool calling: https://github.com/vllm-project/vllm/issues/54256
- Pull request de correccion del parser: https://github.com/vllm-project/vllm/pull/54257

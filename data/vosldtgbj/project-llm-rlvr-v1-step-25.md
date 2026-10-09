# vosldtgbj/project-llm-rlvr-v1-step-25

## Resumen

El modelo `vosldtgbj/project-llm-rlvr-v1-step-25` es un checkpoint de pesos completos en BF16 perteneciente a una trayectoria de RLVR (Reinforcement Learning with Verifiable Rewards) construida sobre la familia Gemma 4. Su origen directo es el modelo SFT `vosldtgbj/project-llm-sft-v3-l2-h2p0-seed20261006`, que a su vez deriva de `google/gemma-4-12B-it` tras pasar por fases de continued pretraining y supervised fine-tuning. Lo publica el usuario de Hugging Face `vosldtgbj` y corresponde al step 25 de la fase RLVR v1, es decir, 25 actualizaciones de optimizador dentro de esa fase concreta.

El modelo aborda el problema del ajuste por refuerzo con recompensas verificables en entornos de agente: 15 familias de tareas con verificadores deterministas o jueces acotados, combinando 30.000 tareas de dominio (sobre 104 libros blancos japoneses publicos) y 7.500 tareas generales (instruction following, code, math, MCQA, prompt injection, entre otras). Se entrena con GRPO sincrono, 16 rollouts por prompt y hasta 5 turnos de interaccion, lo que lo orienta a flujos agenticos multi-paso con tool calling y recuperacion de fallos de herramienta.

La arquitectura es la de Gemma 4 unificada (`Gemma4UnifiedForConditionalGeneration`, `model_type gemma4_unified`), un transformer denso con 48 capas de texto, hidden size 3.840 y vocabulario de 262.144 entradas. Aunque el pipeline declarado es `any-to-any` y existe soporte multimodal en la arquitectura base, el entrenamiento se realizo unicamente sobre texto: las torres de vision y audio y las proyecciones multimodales permanecieron congeladas. El checkpoint no incluye estado de optimizador ni de scheduler, por lo que sirve para inferencia y evaluacion, no para reanudar el entrenamiento a nivel de bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `Gemma4UnifiedForConditionalGeneration` (`model_type: gemma4_unified`) |
| Parametros totales | 11.959.730.224 (dato real de safetensors); la model card declara 12.484.280.320 |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible como valor de inferencia; en entrenamiento RLVR se usaron limites de 8.192 tokens de entrada / 2.048 de generacion / 10.240 totales |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye pesos BF16 sin versiones GGUF, AWQ, GPTQ ni INT8 |
| Idiomas soportados | Japones (ja) e ingles (en) |
| Licencia | Gemma (`license: gemma`, con enlace a la licencia de Gemma 4) |
| Formato de pesos | Safetensors BF16, 5 fragmentos mas `model.safetensors.index.json` |
| Capas de texto | 48 |
| Hidden size (texto) | 3.840 |
| Tamano de vocabulario | 262.144 |
| Fase de entrenamiento | RLVR v1, step 25 |
| Modelo padre directo | `vosldtgbj/project-llm-sft-v3-l2-h2p0-seed20261006` |
| Tamano del repositorio | ~24 GB (aprox. 23,92 GB decimales, 22,3 GiB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Gemma 4 unificada, un transformer denso de 48 capas de texto con hidden size 3.840 y vocabulario de 262.144 tokens. La variante unificada integra torres de vision y audio ademas del componente de lenguaje, pero en este proyecto el entrenamiento se aplico exclusivamente a la parte textual: las torres y las proyecciones multimodales se mantuvieron congeladas, de modo que las diferencias respecto al modelo base residen en los pesos del modelo de lenguaje. No hay innovaciones de decodificacion especulativa ni mecanismos de atencion lineal descritos en la informacion disponible.

El entrenamiento de esta fase emplea GRPO sincrono con learning rate 1e-6, sin penalizacion KL respecto a la politica de referencia (`reference-policy KL penalty = 0`). Cada actualizacion de optimizador consume 30 grupos de prompt efectivos con 16 rollouts por prompt, es decir, 480 rollouts por step, con un maximo de 5 turnos de interaccion. Los limites de longitud son 8.192 tokens de entrada, 2.048 de generacion y 10.240 totales; temperature 0.7 y top-p 1.0 para el rollout. El optimizador es Transformer Engine FusedAdam (betas 0.9/0.999, eps 1e-8, weight decay 0.1, max grad norm 1.0), con ratio clip de PPO entre 0.2 y 0.28 y truncated importance-sampling ratio de 2.0. El entrenamiento se ejecuto sobre 16 GPU H100 SXM con backend de rollout vLLM en tensor parallel size 2. Los datos de RLVR provienen de un conjunto unificado de 37.500 tareas verificables (30.000 de dominio mas 7.500 generales) repartidas en 15 familias, con verificadores deterministas o un juez Nemotron 3 Ultra desplegado en konst154. Los datos de SFT subyacentes (SFT v3, vista `official_90_10`) suman 67.195 registros y 4.083.167 tokens supervisados, empaquetados en 5.824 packs de longitud 8.192.

## Capacidades

- Generacion de texto en japones e ingles con instrucciones y formato controlado.
- Razonamiento multi-paso dentro de flujos agenticos, con hasta 5 turnos de interaccion.
- Tool calling y function calling, incluyendo trayectorias normales de uso de herramientas y recuperacion de fallos de herramienta.
- Respuesta fundamentada en documentos (grounded QA) y razonamiento entre multiples documentos.
- Manejo de conflictos de fuente, conflictos temporales y de version.
- Abtencion, solicitud de aclaracion y detencion controlada ante preguntas no respondibles.
- Salidas estructuradas (schemas, formatos enumerados).
- Razonamiento matematico y aritmetica, ademas de MCQA.
- Codigo competitivo (competitive coding).
- Resistencia a inyeccion de prompts y respeto de fronteras de permisos.
- Capacidades generales de instruccion, agent/tool, code, math/science, safety y structured output (heredadas del mezclado general del SFT).
- No se describe soporte efectivo de vision ni audio: las torres multimodales permanecieron congeladas durante el entrenamiento.

## Casos de uso

- Atencion al cliente multilingue ja/en: el modelo gestiona conversaciones multi-turno de hasta 5 interacciones y puede invocar herramientas de consulta para resolver solicitudes, con capacidad de pedir aclaraciones cuando falta informacion.
- QA fundamentado sobre documentacion corporativa: dado un conjunto de documentos (por ejemplo, los libros blancos japoneses usados en el dominio), responde con referencias cortas dentro de la peticion y detecta conflictos entre fuentes o versiones temporales.
- Agentes con tool calling en produccion: se integra en pipelines donde el modelo decide que herramienta llamar, interpreta la respuesta y recupera el flujo ante fallos de la herramienta, aprovechando los datos especificos de tool failure recovery del SFT.
- Extraccion de datos estructurados: genera salidas con schema fijo (JSON u otros formatos enumerados) para alimentar downstream, una de las familias de tareas verificadas del RLVR.
- Asistentes de codigo y resolucion de problemas: cubre competitive coding y math/science, adecuado para entornos de ayuda a la programacion y comprobacion de soluciones.
- Moderacion y robustez frente a prompt injection: al haberse entrenado con tareas de inyeccion y fronteras de permisos, puede emplearse como capa de filtrado o guardarrail en aplicaciones expuestas a entradas no confiables.
- Clasificacion y evaluacion MCQA: util para tareas de seleccion multiple y evaluacion automatica en pipelines de investigacion.
- Razonamiento aritmetico y matematico verificable: apropiado para escenarios donde la respuesta se valida con un verificador deterministico (por ejemplo, calculo o comprobacion de igualdades).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica expresamente que este checkpoint no tiene una puntuacion de validacion independiente: las recompensas registradas en los logs de entrenamiento son senales en linea sobre datos muestreados por la propia politica y no deben usarse para comparar entre checkpoints. La comparacion correcta exige ejecutar el mismo conjunto de evaluacion congelado (locked eval de 4.700 tareas y validation core de 470) sobre los 11 puntos de guardado con identicos parametros de inferencia.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 24 GB solo para los pesos; con cache KV y activaciones conviene reservar en torno a 28-32 GB para contextos moderados.
- VRAM estimada segun precision (calculada a partir del numero de parametros, ya que el repositorio solo ofrece BF16): ~24 GB en BF16, ~12-13 GB en 8 bits y ~6-7 GB en 4 bits (estas dos ultimas requeririan cuantizacion externa, no incluida en el repositorio).
- GPU recomendadas: H100 SXM, A100 40 GB/80 GB, A6000 48 GB para BF16 sin restricciones de contexto.
- Consumer GPU: una RTX 4090 o RTX 3090 de 24 GB queda muy al limite en BF16 para un modelo de 12B; seria viable con cuantizacion a 8 o 4 bits (no provista) o repartiendo el modelo en varias GPU.
- Opciones de despliegue: vLLM (usado como backend de rollout en el propio entrenamiento, tensor parallel 2), transformers, TGI. El uso en llama.cpp u Ollama exigiria convertir los pesos a GGUF, conversion que no esta incluida en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `vosldtgbj/project-llm-rlvr-v1-step-25` | 11.959.730.224 (safetensors) | No disponible como valor de inferencia | ja, en | Gemma | Checkpoint intermedio de RLVR v1 (step 25) |
| `google/gemma-4-12B-it` | ~12B (familia) | No disponible | Multilingue (segun el modelo base) | Gemma | Modelo base original del que parte toda la cadena |
| `vosldtgbj/project-llm-sft-v3-l2-h2p0-seed20261006` | No disponible | No disponible | ja, en | Gemma | Padre directo; fase SFT, sin RLVR |
| `vosldtgbj/project-llm-rlvr-v1-step-125` | No disponible | No disponible | ja, en | Gemma | Mismo run v1, 100 steps mas avanzado |

No se dispone de cifras de rendimiento comparativo entre estos modelos en la informacion proporcionada; la model card insiste en que la comparacion requiere un conjunto de evaluacion congelado comun.

## Limitaciones y advertencias

- No es un modelo multimodal funcional: aunque la arquitectura base contempla vision y audio, esas torres se mantienen congeladas y el entrenamiento fue solo de texto.
- Riesgo de alucinacion inherente a modelos generativos; las tareas de abtencion y verificacion mitigan pero no eliminan el problema.
- Idiomas limitados a japones e ingles; el rendimiento en otras lenguas no esta garantizado ni documentado.
- Contexto de inferencia no documentado: los limites de 8.192/2.048/10.240 tokens son parametros de entrenamiento, no necesariamente el maximo soportado en produccion.
- Es un checkpoint de trayectoria (step 25 de RLVR v1), no un modelo final pulido; puede haber cambios de comportamiento respecto a los steps posteriores (50, 75, 100, 125) y a la fase v2.
- No permite reanudacion bit-exacta del entrenamiento: faltan estado de optimizador, scheduler, RNG, cursor de dataloader y shards FSDP/DTensor.
- La licencia Gemma impone condiciones especificas para uso comercial; es necesario revisar los terminos enlazados en la model card antes de desplegarlo en produccion.
- El repositorio tiene 0 descargas y 0 likes, y no existe evaluacion externa publicada; conviene validarlo internamente antes de cualquier uso critico.
- Discrepancia en el recuento de parametros entre la model card (12.484.280.320) y los safetensors (11.959.730.224); verificar al cargar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-25
- Modelo padre (SFT): https://huggingface.co/vosldtgbj/project-llm-sft-v3-l2-h2p0-seed20261006
- Siguiente checkpoint RLVR v1: https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-50
- Checkpoint RLVR v1 step 125: https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-125
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset SFT v3: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-sft-citation-optimized-v3
- Dataset RLVR unificado v2: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-unified-v2-37500
- Dataset RLVR de dominio v1: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-domain-v1
- vLLM: https://vllm.ai/
- Documentacion de TensorRT LLM: https://nvidia.github.io/TensorRT-LLM/

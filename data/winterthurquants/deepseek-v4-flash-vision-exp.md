# winterthurquants/DeepSeek-V4-Flash-Vision-Exp

## Resumen

DeepSeek-V4-Flash-Vision-Exp es el primer modelo multimodal experimental de la familia DeepSeek-V4. Desarrollado por DeepSeek, parte de la arquitectura DeepSeek-V4-Flash y le incorpora modulos visuales (un vision tower de 32 capas mas un aligner) junto con un entrenamiento continuado que desbloquea la comprension de imagenes. El repositorio analizado lo publica la cuenta winterthurquants y reproduce la model card oficial.

Se trata de un modelo de mezcla de expertos dispersa (MoE) con atencion DFlash, Hyper-Connections y un modulo borrador DSpark integrado para decodificacion especulativa. El repo declara 304.646.824.126 parametros en safetensors y una ventana de contexto de 1.048.576 tokens (1M), con pesos en FP8. Fuentes de terceros cifran el modelo en unos 284B parametros totales con 13B activos, cifra que no aparece confirmada en la model card.

Su relevancia ahora es doble: por un lado, lleva capacidades de agente multimodal (grounding visual, tool calling, salida estructurada) a un modelo de pesos abiertos con licencia MIT; por otro, mantiene un rendimiento en tareas de agente puramente textual muy cercano al de DeepSeek-V4-Flash-0731 e incluso comparable a Opus-4.8 en varios benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos dispersa (MoE), atencion DFlash, Hyper-Connections y modulo borrador DSpark; vision tower de 32 capas mas aligner |
| Parametros totales | 304.646.824.126 (~304,6B) segun los safetensors del repositorio; fuentes de terceros indican 284B |
| Parametros activos | ~13B segun fuentes de terceros; no confirmado en la model card |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8 / 8-bit (etiquetas del repositorio y `--kv-cache-dtype fp8` en la receta de vLLM); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors indexados con `model.safetensors.index.json` (pesos en FP8); tamano del repositorio 167,8 GB |

## Arquitectura y entrenamiento

El modelo conserva el backbone MoE de DeepSeek-V4-Flash y anade modulos visuales, seguido de un entrenamiento continuado sobre el que la model card no aporta cifras de tokens ni composicion del dataset. La implementacion de referencia del repositorio cubre explicitamente el vision encoder y el aligner, la atencion DFlash, el MoE, las Hyper-Connections y el forward path de DSpark. Los prompts multimodales admiten tanto bloques JSON estilo OpenAI como la notacion compacta `<image>path</image>` en texto, y ambas codificaciones producen los mismos token IDs. No hay informacion publicada sobre uso de RLHF o DPO en la model card consultada.

La innovacion tecnica mas destacable es DSpark, un modulo borrador fusionado con los pesos del modelo objetivo que habilita decodificacion especulativa sin necesidad de un draft model separado. En vLLM se activa con `--speculative-config` usando `num_speculative_tokens: 3`, `draft_sample_method: probabilistic` y verificacion adaptativa; en SGLang se activa con `--speculative-algorithm DSPARK` sin fijar `--speculative-draft-model-path`. El modelo expone ademas niveles de esfuerzo de razonamiento (low, high, max) con parsers dedicados (`--reasoning-parser deepseek_v4`) y un parser de tool calling propio.

## Capacidades

- Generacion de texto y razonamiento con esfuerzo configurable (low, high, max).
- Comprension de imagenes: el pipeline declarado es `image-text-to-text` e incluye grounding visual.
- Capacidades de agente multimodal: ApexBench, Agents' Last Exam, Chartography y ZeroBench entre los benchmarks reportados.
- Capacidades de agente textual: Terminal Bench, NL2Repo, Cybergym, DeepSWE, Toolathlon, DSBench-Hard y AutomationBench.
- Tool calling / function calling con parser especifico (`--tool-call-parser deepseek_v4`, `--enable-auto-tool-choice`).
- Salida estructurada y JSON, segun la documentacion de despliegue de terceros.
- Razonamiento multi-paso en entornos de agente, evaluado con DeepSeek Harness en modo minimal.
- Decodificacion especulativa integrada (DSpark) para acelerar la inferencia.
- Capacidades multilingues: no disponible.

## Casos de uso

- Automatizacion de tareas de terminal y DevOps: con 83,9 en Terminal Bench 2.1, el modelo esta pensado para operar sobre un shell en tareas de agente multi-paso con contexto de 1M tokens, lo que permite mantener el historial completo de una sesion larga sin truncar.
- Generacion y refactorizacion de repositorios completos: su 57,7 en NL2Repo y 59,3 en DeepSWE lo hacen util para pipelines que traducen especificaciones a codigo y resuelven issues sobre bases de codigo extensas que caben en la ventana de contexto.
- Analisis de documentos tecnicos con graficos: las puntuaciones en Chartography (64,3) y ZeroBench (35,0 en Pass@5) apuntan a un uso directo en extraccion de datos de graficos, diagramas y figuras tecnicas junto al texto que los acompana.
- Agentes que combinan texto e imagen en pantalla: ApexBench (36,5) y Agents' Last Exam (27,3) cubren escenarios de automatizacion de interfaces donde el modelo debe interpretar capturas y decidir acciones.
- Asistentes con tool calling sobre APIs externas: el soporte de parser de herramientas y de eleccion automatica permite integrarlo como orquestador en flujos que consultan servicios externos, con salida estructurada verificable.
- Auditoria de seguridad y analisis de codigo malicioso: Cybergym (75,3) sugiere utilidad en tareas de analisis defensivo y reproduccion de vulnerabilidades en entornos controlados.
- Atencion al cliente con evidencia visual: al aceptar imagenes y contexto de 1M tokens, puede gestionar conversaciones multi-turno donde el usuario adjunta capturas o documentos y se requiere trazabilidad completa del historial.
- Procesamiento por lotes de documentacion escaneada: al soportar notacion `<image>path</image>`, se puede orquestar el envio masivo de rutas de ficheros a un servidor vLLM o SGLang para extraccion de informacion estructurada.

## Benchmarks y rendimiento

Datos publicados en la model card. Los modelos DeepSeek se evaluan con el modo minimal de DeepSeek Harness, con esfuerzo de razonamiento `max`, `temperature = 1.0` y `top_p = 0.95`.

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
|---|---|---|---|
| Terminal Bench 2.1 | 83,9 | 82,7 | 85,0 |
| NL2Repo | 57,7 | 54,2 | 69,7 |
| Cybergym | 75,3 | 76,7 | 78,3 |
| DeepSWE | 59,3 | 54,4 | 58,0 |
| Toolathlon-Verified | 75,9 | 70,3 | 76,2 |
| DSBench-Hard | 63,6 | 59,6 | 71,7 |
| AutomationBench (Public) | 25,7 | 25,1 | 27,2 |
| ApexBench (Pass@1) | 36,5 | 26,2 | 39,4 |
| Agents' Last Exam | 27,3 | 25,2 | 25,7 |
| Chartography | 64,3 | - | 65,0 |
| ZeroBench (Pass@5) | 35,0 | - | 34,0 |

Nota de la model card: en ApexBench y Agents' Last Exam, DeepSeek-V4-Flash-0731 ignora los elementos multimodales de la entrada. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- Almacenamiento y VRAM: el repositorio ocupa 167,8 GB, por lo que se necesita al menos ese espacio en disco o en un volumen compartido. La VRAM necesaria exacta no esta publicada y no puede derivarse de forma fiable del tamano del repo dado el desajuste con los 304,6B parametros declarados.
- Configuracion de referencia: la receta oficial de vLLM sirve el modelo en un unico nodo con 4 GPU GB300, con `--tensor-parallel-size 4`, `--kv-cache-dtype fp8` y `--block-size 256`.
- GPU consumer: no cabe en GPU de consumo (RTX 4090, 3090, etc.) por el tamano del modelo y por requerir despliegue multi-GPU.
- Despliegue: vLLM mediante la imagen `vllm/vllm-openai:deepseekv4-flash-vision`; SGLang con `--speculative-algorithm DSPARK`; ademas hay una implementacion minima en PyTorch en el propio repositorio, con conversion de checkpoints e inferencia de referencia en `inference/`.
- Aceleracion: decodificacion especulativa DSpark con 3 tokens especulativos y verificacion adaptativa, sin draft model separado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp | 304,6B (safetensors); 284B segun terceros | ~13B segun terceros | 1.048.576 tokens | MIT | Pesos abiertos en HuggingFace; API en DeepInfra |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible | Modelo predecesor, sin vision |
| Opus-4.8 | no disponible | no disponible | no disponible | Propietaria | Solo API |

En los benchmarks publicados, DeepSeek-V4-Flash-Vision-Exp supera a DeepSeek-V4-Flash-0731 en todas las tareas multimodales y en casi todas las de agente textual, con la excepcion de Cybergym (75,3 frente a 76,7). Frente a Opus-4.8 queda por debajo en Terminal Bench 2.1, NL2Repo, Cybergym, DSBench-Hard y ApexBench, y por encima en Agents' Last Exam y ZeroBench (Pass@5), ademas de ofrecer pesos abiertos bajo licencia MIT.

## Limitaciones y advertencias

- Procedencia del repositorio: la ficha de HuggingFace analizada corresponde a la cuenta `winterthurquants`, no a la organizacion oficial `deepseek-ai`, que aloja una copia independiente. Verifica el origen antes de usar los pesos en produccion.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada es 2026-09-27.
- Discrepancia de parametros: los safetensors declaran 304,6B parametros y el tamano de repo es de 167,8 GB, mientras que fuentes de terceros hablan de 284B totales y 13B activos. Los datos sobre parametros activos no estan confirmados por la model card.
- Modelo marcado como experimental (`-Exp`): no hay garantias de estabilidad de comportamiento ni de soporte a largo plazo.
- Riesgo de alucinacion: no se publican tasas de alucinacion ni evaluaciones de factualidad en la informacion disponible.
- Idiomas soportados: no disponible. No se puede asumir un rendimiento homogeneo fuera del ingles sin evaluacion propia.
- Sesgos: no se documentan analisis de sesgo ni composicion del dataset de entrenamiento continuado.
- Licencia MIT: permite uso comercial, pero al tratarse de un modelo multimodal conviene revisar las condiciones de los datos de entrenamiento, que no se detallan.
- Requisitos de despliegue elevados: la receta oficial exige un nodo con 4 GPU GB300, lo que excluye hardware de consumo y encarece la inferencia propia.
- Las puntuaciones de benchmark se obtuvieron con un harness concreto (DeepSeek Harness en modo minimal, esfuerzo `max`, `temperature = 1.0`, `top_p = 0.95`); cambiar el framework o los parametros de muestreo puede alterar los resultados.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/winterthurquants/DeepSeek-V4-Flash-Vision-Exp
- Repositorio oficial de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Receta de vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Documentacion de API en DeepInfra: https://deepinfra.com/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp/api
- Ficha en AI Model Radar: https://aimodelradar.app/models/deepseek-v4-flash-vision-exp
- Web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Twitter de DeepSeek: https://twitter.com/deepseek_ai
- Documentacion de codificacion de prompts del repositorio: `encoding/README.md`
- Documentacion de inferencia minima del repositorio: `inference/README.md`

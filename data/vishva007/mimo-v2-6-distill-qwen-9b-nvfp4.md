# Vishva007/MiMo-V2.6-Distill-Qwen-9B-NVFP4

## Resumen

MiMo-V2.6-Distill-Qwen-9B-NVFP4 es un checkpoint cuantizado en formato NVFP4 del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicado por el usuario Vishva007. El modelo original lo desarrolla Xiaomi MiMo mediante ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por MiMo, y está orientado a tareas agénticas: codigo, uso de herramientas, codificacion visual y ciberseguridad. Esta version no altera los pesos conceptualmente, solo reduce su precision numerica para disminuir el consumo de VRAM en inferencia.

La cuantizacion se ha realizado con AutoRound/SignRound (1000 iteraciones, simetrica, group_size=16) sobre 512 muestras de calibracion de 2048 tokens, y se distribuye en safetensors con el formato compressed-tensors. Los modulos no textuales (encoder visual) y las capas de Multi-Token Prediction (MTP) se conservan en bfloat16 para no degradar la fidelidad multimodal ni la decodificacion especulativa.

Es relevante porque combina tres piezas poco habituales en un modelo abierto de este tamano: entrada image-text-to-text, tool calling nativo con parser dedicado y decodificacion especulativa MTP integrada. El repo tiene, en el momento de la consulta, 0 descargas y 0 likes, y su fecha de creacion es el 25 de octubre de 2026, por lo que se trata de una publicacion reciente y sin validacion independiente. El dato real de parametros en safetensors es de 6.382.968.544, inferior al "9B" que sugiere el nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`), con encoder visual y capas MTP (Multi-Token Prediction). No se documenta si es denso o MoE |
| Parametros totales | 6.382.968.544 (~6,38 B) segun safetensors; el nombre comercial indica 9B |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuracion de servicio del ejemplo de la model card (`--max-model-len 32768`); maximo nativo no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, group_size=16, simetrica) via AutoRound/SignRound; encoder visual, `mtp` y `mtp.fc` en bfloat16 |
| Idiomas soportados | no disponible (la model card y el campo `languages` de HuggingFace no aportan lista) |
| Licencia | MIT |
| Formato de pesos | safetensors con compressed-tensors (tag `8-bit`), compatibles con transformers y vLLM |

## Arquitectura y entrenamiento

El checkpoint deriva de MiMo-V2.6-Distill-Qwen-9B, que Xiaomi MiMo construye mediante SFT de Qwen3.5-9B sobre datos generados por MiMo. La model card del modelo base describe cobertura de codigo, tareas agenciales generales, codificacion visual y ciberseguridad, y lo presenta como punto de partida para investigacion en RL agéntico. La arquitectura subyacente es la de Qwen3.5 (tag `qwen3_5`), con dos componentes anadidos relevantes: un encoder visual que habilita la pipeline `image-text-to-text` y cabezas MTP usadas para decodificacion especulativa.

La innovacion de este repositorio concreto es la cuantizacion. Se aplica AutoRound/SignRound con 1000 iteraciones, simetria activada, group_size=16 y calibracion de 512 muestras a longitud 2048 (batch 2, acumulacion de gradiente 4). La decision tecnica destacable es excluir de la cuantizacion los modulos `visual`, `mtp` y `mtp.fc`, que permanecen en bfloat16: esto preserva la calidad del codificador de imagen y permite que la decodificacion especulativa siga funcionando sobre cabezas MTP sin perdida de precision. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento, con modo "thinking" controlable mediante `enable_thinking` y parser de razonamiento `qwen3`.
- Codigo: el modelo base se entrena explicitamente para tareas de programacion y su modelo de chat usa el parser de tool calls `qwen3_coder`.
- Tool calling / function calling nativo, con seleccion automatica de herramienta (`--enable-auto-tool-choice`) en vLLM.
- Comportamiento agéntico multi-paso: el tag `agentic` y la descripcion del modelo base apuntan a tareas con planificacion y ejecucion de acciones.
- Multimodal de entrada: pipeline `image-text-to-text`, con encoder visual conservado en bfloat16.
- Codificacion visual (generacion de codigo a partir de imagenes, p. ej. capturas de UI), segun la descripcion del modelo base.
- Ciberseguridad: el modelo base declara cobertura de tareas de este dominio; no se detallan evaluaciones.
- Decodificacion especulativa MTP integrada (`{"method":"mtp","num_speculative_tokens":1}`).
- Salida estructurada tipo "decision": la model card describe un endpoint `/v1/systemone` que recibe un estado, imagenes y un conjunto de preguntas con criterios y devuelve una eleccion; requiere versiones nightly de vLLM (> 0.32.0) y no es una API estandar.

## Casos de uso

- Agente de codigo en pipelines de CI/CD: el modelo puede invocar herramientas (`qwen3_coder` como parser) para leer errores de build, consultar repositorios y proponer parches dentro de un bucle agéntico, con 32.768 tokens de contexto para arrastrar varios ficheros y logs.
- Automatizacion de soporte tecnico multi-turno: con contexto de 32k y tool calling puede consultar un CRM o una base de conocimiento como funciones expuestas y mantener el hilo de la conversacion sin truncar historicos largos.
- Conversion de mockups y capturas de pantalla en codigo: el encoder visual en bfloat16 permite pasar una imagen de interfaz y obtener el componente correspondiente, util en equipos de front-end.
- Revision de seguridad asistida: dado el enfoque del modelo base en ciberseguridad, se puede usar como primer filtro para triaje de hallazgos de analisis estatico, siempre con revision humana dado el riesgo de alucinacion.
- Motor de decisiones estructuradas sobre imagenes: el patron estado + preguntas + criterios del endpoint `/v1/systemone` encaja en clasificacion con criterios explicitos (por ejemplo, control de calidad visual o verificacion de presencia de objetos), aunque requiere vLLM nightly.
- Despliegue de bajo consumo en una sola GPU: al ocupar los pesos cuantizados aproximadamente 3,2 GB teoricos, es viable servir el modelo en una GPU consumer de gama alta para prototipos, demos internas o entornos de desarrollo por equipo.
- Generacion aumentada con recuperacion sobre documentacion extensa: 32k de contexto y decodificacion especulativa MTP permiten incluir varios documentos y mantener latencias razonables en respuestas cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona la existencia de "Evaluation Results" para el checkpoint SFT, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones agénticas en el material consultado. Tampoco hay mediciones de latencia o throughput para esta version NVFP4.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados a 4 bits suponen unos 3,2 GB teoricos para 6.383 M de parametros; a ello se suman el encoder visual y las capas MTP en bfloat16 y la cache KV. El repositorio ocupa 8,9 GB, pero la carga en VRAM es inferior. Estimacion practica: 6-10 GB para pesos y overhead, mas cache KV en fp8 segun contexto y numero de secuencias.
- GPU recomendadas: NVIDIA Blackwell (B200, GB200, RTX PRO 6000, RTX 5090) para aprovechar las unidades FP4 nativas; H100/A100 funcionan para el modelo base, pero el soporte de kernels NVFP4 en GPUs no Blackwell no esta documentado en la informacion disponible.
- GPU consumer: si, en tarjetas de 16-24 GB (RTX 4090, 4080, 5090) con margen para contexto largo; en 12 GB es ajustado y depende de la longitud de contexto y del numero de secuencias concurrentes.
- Opciones de despliegue: vLLM es la via documentada por el autor, con `--trust-remote-code`, `--kv-cache-dtype fp8`, prefix caching, chunked prefill y `--speculative-config` con MTP; tambien transformers. Existe una version del mismo modelo empaquetada para Ollama (`maternion/mimo-v2.6`), pero no es este checkpoint NVFP4. No hay soporte documentado en llama.cpp ni en TGI para este formato.
- Latencia y throughput: no disponible. La model card configura `--max-num-seqs 128` y `--max-num-batched-tokens 12288`, lo que sugiere despliegue orientado a alto throughput, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Vishva007/MiMo-V2.6-Distill-Qwen-9B-NVFP4 | 6,38 B (segun safetensors) | 32.768 en el ejemplo de servicio | safetensors NVFP4 + modulos bf16 | MIT | Objeto de esta ficha; 0 descargas |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | no disponible en el material consultado | no disponible | safetensors en bfloat16 | MIT | Modelo base oficial; misma funcionalidad sin compresion, mayor VRAM |
| maternion/mimo-v2.6 (Ollama) | no disponible | no disponible | formato Ollama | no disponible | Misma familia empaquetada para Ollama; no es el checkpoint NVFP4 |
| Qwen3.5-9B (modelo de partida) | no disponible en el material consultado | no disponible | safetensors | no disponible | Base sobre la que se hizo el SFT; carece de los datos agénticos de MiMo |

No se dispone de datos verificados de benchmarks ni de especificaciones completas de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Cuantizacion de comunidad: el checkpoint lo publica un usuario individual (Vishva007), no Xiaomi MiMo. Con 0 descargas y 0 likes no hay evidencia de uso ni validacion independiente de la calidad tras la cuantizacion.
- Perdida de precision: NVFP4 es 4 bits con group_size=16; la calibracion usa solo 512 muestras de 2048 tokens, insuficiente para garantizar el comportamiento en dominios alejados de la distribucion de calibracion (por ejemplo, razonamiento matematico largo o codigo muy especializado).
- Dependencia de hardware: NVFP4 esta pensado para unidades tensor FP4 (Blackwell). En GPUs Ampere, Ada u Hopper el rendimiento o incluso el soporte puede degradarse; no hay datos del autor al respecto.
- Dependencia de software: el ejemplo de servicio usa `--trust-remote-code`, lo que implica ejecutar codigo del repositorio; y el endpoint `/v1/systemone` solo esta descrito para vLLM nightly (> 0.32.0), una API no estandar y sujeta a cambios.
- Idiomas: no se documenta la lista de idiomas soportados. El rendimiento fuera de ingles y chino no esta verificado para esta version.
- Riesgo de alucinacion: inherente a modelos de 6-9 B en tareas agénticas y de ciberseguridad; cualquier salida con impacto (parches de codigo, decisiones sobre imagenes, triaje de seguridad) requiere supervision humana.
- Sesgos: no se han publicado evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Licencia: MIT para este checkpoint, lo que permite uso comercial; conviene verificar igualmente los terminos del modelo base y de Qwen3.5, cuyas condiciones no se detallan en el material consultado.
- Contenido promocional: la model card incluye enlaces de afiliado a RunPod y plantillas de despliegue; no deben interpretarse como recomendacion tecnica independiente.
- Nombre frente a realidad: el nombre indica 9B pero los safetensors declaran 6.383 M de parametros; conviene fijar la revision concreta del repositorio antes de desplegar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vishva007/MiMo-V2.6-Distill-Qwen-9B-NVFP4
- Modelo base oficial: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Espejo del modelo base en HuggingFace: https://huggingface.co/ArkhAngelLifeJiggy/MiMo-V2.6-Distill-Qwen-9B
- Version para Ollama: https://ollama.com/maternion/mimo-v2.6
- ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Ficha de terceros con especificaciones y casos de uso: https://www.syncdev.com/models/xiaomi-mimo-v2-6-distill-qwen-9b

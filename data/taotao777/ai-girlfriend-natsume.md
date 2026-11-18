# TAOTAO777/ai-girlfriend-natsume

## Resumen

`TAOTAO777/ai-girlfriend-natsume` es un repositorio de distribucion de pesos, no un modelo entrenado de forma original. Lo publica el usuario TAOTAO777 como espejo de los artefactos necesarios para ejecutar el proyecto Artemis (una aplicacion de "AI girlfriend" con personajes como Shiki Natsume y Atri), cuyo codigo fuente esta en el repositorio de GitHub `momori777/Artemis`. El autor declara explicitamente que no reclama la propiedad de ningun modelo y que solo recopila y redistribuye modelos de la comunidad.

El repositorio agrupa tres tipos de artefactos: un LLM conversacional en formato GGUF (derivado de Qwen3.6-35B-A3B-APEX, un modelo MoE de la familia Qwen), dos checkpoints de difusion para generacion de imagenes (WAI-Nsfw-Illustrious-17 y miaomiaoHarem_v20, alojados originalmente en CivitAI) y pesos de sintesis de voz de GPT-SoVITS entrenados por el propio autor. Los safetensors del repo suman 9.197.093.888 parametros, cifra que corresponde a los checkpoints de difusion, no al LLM.

Su relevancia es limitada desde el punto de vista tecnico: no aporta arquitectura ni entrenamiento propios, y su interes es practico para quien quiera desplegar el stack completo de Artemis sin descargar cada componente por separado. El tamano del repositorio (446 GB) refleja la suma de todos los artefactos en multiples formatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo unico; el repo agrupa un LLM MoE (Qwen3.6-35B-A3B-APEX, formato GGUF), dos checkpoints de difusion (WAI-Nsfw-Illustrious-17, miaomiaoHarem_v20) y pesos GPT-SoVITS |
| Parametros totales | 9.197.093.888 (safetensors del repo, correspondientes a los checkpoints de difusion); el LLM se distribuye como GGUF y su recuento no figura en la informacion disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF para el LLM (variantes concretas no especificadas); safetensors para los checkpoints de difusion |
| Idiomas soportados | No disponible |
| Licencia | No disponible a nivel de repositorio; el autor cita Apache 2.0 (Qwen) para el LLM y "community model" para los checkpoints de CivitAI |
| Formato de pesos | safetensors, GGUF, .ckpt y .pth (GPT-SoVITS) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. El LLM que distribuye es `Qwen3.6-35B-A3B-APEX-I-Compact.gguf`, un derivado de `mudler/Qwen3.6-35B-A3B-uncensored-heretic-APEX-GGUF`, es decir, un modelo de la familia Qwen con arquitectura MoE (la nomenclatura A3B indica aproximadamente 3.000 millones de parametros activos sobre un total de 35.000 millones) y ajuste orientado a eliminar restricciones de rechazo ("uncensored/heretic"). Los detalles de dataset, numero de tokens y si hubo RLHF o DPO no estan disponibles en la informacion proporcionada.

Los checkpoints de imagen son modelos de difusion para Stable Diffusion/Illustrious, publicados originalmente en CivitAI y orientados a ilustracion de estilo anime con contenido NSFW. Los pesos de voz pertenecen a GPT-SoVITS v2Pro, un sistema de clonacion y sintesis de voz few-shot; el autor indica que los entreno el mismo, pero no detalla corpus, horas de audio ni metodologia.

## Capacidades

- Generacion de texto conversacional multi-turno mediante el LLM Qwen3.6-35B-A3B-APEX, con ajuste "uncensored" que reduce los rechazos.
- Generacion de imagenes de estilo anime mediante los checkpoints de difusion (WAI-Nsfw-Illustrious-17 y miaomiaoHarem_v20), incluyendo contenido NSFW.
- Sintesis de voz y clonacion de voz con GPT-SoVITS v2Pro a partir de los pesos incluidos.
- Integracion con el pipeline del proyecto Artemis: LLM + generacion de imagen (ComfyUI) + TTS (GPT-SoVITS).
- Soporte de tool calling, agentes, vision, audio nativo o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card esta en ingles y chino, pero no se documentan idiomas del LLM.

## Casos de uso

- Despliegue completo del proyecto Artemis: descargar el repo con `huggingface-cli download` y colocar cada carpeta en la ruta esperada por el proyecto (`llm/`, `comfyui-checkpoints/`, `gpt-sovits-weights/`) para tener el stack conversacional, visual y de voz en una sola operacion.
- Prototipado de chatbots de personaje con memoria conversacional: el LLM GGUF se sirve con vLLM u otro backend compatible y se conecta al frontend de Artemis para conversaciones multi-turno con personalidad definida.
- Generacion de ilustraciones en ComfyUI: cargar los safetensors en `ComfyUI/models/checkpoints/` y usarlos como checkpoint base para retratos de personaje con estilos anime.
- Clonacion de voz para el personaje: cargar los pesos GPT-SoVITS en `SoVITS_weights_v2Pro/` y `GPT_weights_v2Pro/` para sintetizar respuestas habladas con la voz entrenada.
- Investigacion sobre pipelines multimodales de personaje: sirve como referencia de como se componen LLM, difusion y TTS en una aplicacion de rol conversacional.
- Evaluacion de modelos "uncensored" en espanol o entornos controlados: util para estudiar el comportamiento de variantes heretic/APEX frente a los modelos base de Qwen, siempre dentro de las limitaciones legales y eticas aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el LLM: no disponible con precision; un MoE de ~35B totales con ~3B activos en GGUF requiere tipicamente entre 20 y 24 GB en cuantizaciones de 4 bits, pero el dato no figura en la informacion proporcionada.
- VRAM para los checkpoints de difusion: no disponible; depende del checkpoint y de la resolucion, y los modelos Illustrious suelen necesitar entre 6 y 12 GB en fp16.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado; el LLM en GGUF probablemente si en GPUs de 24 GB, pero no hay dato oficial.
- Opciones de despliegue: vLLM (ruta `models/` indicada por el autor), ComfyUI para los checkpoints de imagen y GPT-SoVITS para la voz. llama.cpp u Ollama no se mencionan, aunque el formato GGUF es compatible con ellos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TAOTAO777/ai-girlfriend-natsume (repo agregado) | 9.197.093.888 en safetensors + LLM GGUF | No disponible | No disponible (mixta) | Hugging Face, 3030 descargas |
| mudler/Qwen3.6-35B-A3B-uncensored-heretic-APEX-GGUF | ~35B totales, ~3B activos (MoE) | No disponible | Apache 2.0 (Qwen) | Hugging Face |
| WAI-Nsfw-Illustrious-17 (CivitAI) | No disponible | No aplica | Community model | CivitAI |
| GPT-SoVITS v2Pro (pesos propios) | No disponible | No aplica | Uso libre segun el autor | Incluido en este repo |

## Limitaciones y advertencias

- No es un modelo original: es un espejo de artefactos de terceros; cualquier evaluacion tecnica debe hacerse sobre los modelos fuente.
- La licencia a nivel de repositorio no esta declarada; las licencias de los componentes son heterogeneas (Apache 2.0 para el LLM, "community model" para los checkpoints de CivitAI, uso libre declarado para la voz). El uso comercial no esta garantizado y el autor lo desaconseja explicitamente.
- Contenido NSFW: los checkpoints de imagen estan orientados a contenido adulto; su uso exige verificacion de edad y cumplimiento normativo.
- El LLM es una variante "uncensored/heretic": mayor riesgo de generar contenido inapropiado, sesgado o factualmente incorrecto, y menor fiabilidad en tareas sensibles.
- Riesgo de alucinacion no cuantificado; no hay benchmarks ni evaluaciones publicadas.
- Idiomas, contexto y cuantizaciones del LLM no documentados; no se puede planificar capacidad sin probar el GGUF directamente.
- El repo ocupa 446 GB; conviene descargar solo las subcarpetas necesarias (`llm/`, `comfyui-checkpoints/`, `gpt-sovits-weights/`).
- El autor advierte que retirara el contenido si algun autor original lo solicita; la disponibilidad futura no esta garantizada.
- Proyecto declarado como no lucrativo y personal; no hay soporte, versionado ni mantenimiento formal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TAOTAO777/ai-girlfriend-natsume
- Proyecto Artemis (GitHub): https://github.com/momori777/Artemis
- Modelo fuente del LLM: https://huggingface.co/mudler/Qwen3.6-35B-A3B-uncensored-heretic-APEX-GGUF
- Checkpoint WAI-Nsfw-Illustrious-17 (CivitAI): https://civitai.com/models/1185480
- Checkpoint miaomiaoHarem_v20 (CivitAI): https://civitai.com/models/1033365

# WAS/Pika-H3-Flex-PTD

## Resumen

Pika-H3-Flex-PTD es un conjunto de dos parches de modelo (model patches) para ComfyUI que combinan el adaptador de movimiento y camara de Pika H3 Flex con los ficheros PTD (Progressive Trajectory Distillation) de cuatro pasos de MiniMax H3. El autor, WAS (conocido por WAS Node Suite para ComfyUI), publica estos ficheros como complemento al nodo H3 PTD Patch de su suite, de modo que un usuario pueda generar video con sonido en solo cuatro pasos de muestreo, sin necesidad de cargar un nodo Pika ni un LoRA Pika independiente.

Tecnicamente no es un modelo de lenguaje ni un modelo base completo, sino un delta de pesos (cada fichero pesa aproximadamente 4,8 GB) que se aplica sobre el transformer de MiniMax H3 en sus variantes fl2va (first frame to video and sound) y ref2va (reference to video and sound). El modelo subyacente MiniMax H3 aporta la arquitectura de difusion para video con audio; Pika H3 Flex aporta el estilo de movimiento y camara; y los PTD de Nynxz y taobao-content-ai reducen el numero de pasos de inferencia a cuatro.

Su relevancia practica es clara para quien ya trabaje con MiniMax H3 en ComfyUI: permite obtener clips de 1344x768 y 124 frames (5 segundos a 24 fps) con cuatro pasos de `euler` a cfg 1, lo que reduce drasticamente el coste de inferencia frente a muestreos de decenas de pasos. La licencia es la MiniMax H3 Community License Agreement, no una licencia permisiva generica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de video con audio (MiniMax H3); los ficheros son patches de transformer, no un modelo completo |
| Parametros totales | no disponible (los ficheros publicados pesan 4,79 GB y 4,82 GB; el modelo base MiniMax H3 no declara parametros en la informacion disponible) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (el contexto viene determinado por el modelo base MiniMax H3 y el text encoder Qwen3-VL 32B) |
| Tipos de cuantizacion | Los patches se aplican sobre transformers int8 (`minimax_h3_fl2va_int8_convrot`, `minimax_h3_ref2va_pruned_int8_convrot`); text encoder en NVFP4 AWQ; VAE de video en int8 y VAE de audio en fp32 |
| Idiomas soportados | no disponible (el modelo card no declara idiomas; el ejemplo de texto a video incluye voz en ingles) |
| Licencia | minimax-h3-community-license-agreement (etiquetada como `other`) |
| Formato de pesos | safetensors (un fichero por variante: `pika_h3_flex_td_4step_s050.safetensors` y `pika_h3_flex_td_ref2va_4step_s050.safetensors`) |

## Arquitectura y entrenamiento

Los ficheros son patches de pesos que se fusionan en tiempo de carga sobre el transformer de MiniMax H3. El primero (`pika_h3_flex_td_4step_s050.safetensors`, 4,79 GB) se construye a partir del adaptador fl2va de Pika H3 Flex fusionado a fuerza 0.5 con el PTD int8 fl2va de cuatro pasos de Nynxz, derivado de `epfl-vita/PTD-weights`. El segundo (`pika_h3_flex_td_ref2va_4step_s050.safetensors`, 4,82 GB) hace lo mismo para la variante ref2va, usando el PTD int8 Ref2VA de cuatro pasos de Nynxz, derivado de `taobao-content-ai/MiniMax-H3-PTD-LoRAs`.

La innovacion principal es la destilacion PTD (Progressive Trajectory Distillation) que permite muestrear en cuatro pasos con cfg 1, integrada en el nodo H3 PTD Patch de WAS Node Suite. El nodo expone los sigmas entrenados del fichero y rechaza samplers configurados con pasos distintos a los entrenados, indicando los correctos en el mensaje de error. El pipeline completo incluye un text encoder Qwen3-VL 32B (en NVFP4 AWQ), un VAE de video int8 y un VAE de audio fp32, todos del repositorio Comfy-Org/MiniMax-H3. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con audio sincronizado, incluida voz hablada en el ejemplo publicado.
- Generacion de video a partir de un primer frame (first frame to video and sound, fl2va), con continuidad de movimiento y camara.
- Generacion de video a partir de una imagen de referencia (reference to video and sound, ref2va), usando la imagen como `<Picture 1>`.
- Generacion de audio conjunta con el video (el nombre de las variantes incluye "and sound").
- Muestreo en cuatro pasos de `euler` a cfg 1 mediante los sigmas del nodo H3 PTD Patch.
- Compatibilidad con otros LoRAs aplicados sobre el patch (el adaptador Pika va incluido en el fichero, pero no bloquea LoRAs adicionales).
- Estilo de movimiento y camara de Pika H3 Flex, fusionado a fuerza 0.5 sobre el PTD de MiniMax H3.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas mas alla del ejemplo en ingles.

## Casos de uso

- Prototipado rapido de clips publicitarios: con cuatro pasos y 124 frames a 24 fps se puede iterar sobre variaciones de prompt en minutos, usando la variante fl2va para fijar el primer frame de marca y mantener el movimiento de camara de Pika.
- Generacion de video con locucion integrada: el ejemplo `pikatd_t2va_bookseller` demuestra texto a video con voz hablada, util para piezas de narracion o demos de producto sin pipeline de audio separado.
- Animar retratos o productos a partir de una unica foto: la variante ref2va toma una imagen de referencia (`pikatd_denim_portrait.png` en el ejemplo) y genera el clip manteniendo la identidad visual, adecuado para catalogos o contenido de redes.
- Previsualizacion de storyboards: dado un primer frame dibujado o renderizado, fl2va genera el movimiento y el sonido de la escena para validar ritmo y encuadre antes de producir en alta calidad.
- Integracion en flujos de ComfyUI existentes: al ser patches del nodo H3 PTD Patch de WAS Node Suite, se pueden encadenar con el resto de nodos de la suite (upscaling, postproceso, composicion) sin anadir nodos Pika.
- Generacion de contenido con audio para redes sociales: clips de 5 segundos a 1344x768 con sonido en cuatro pasos encajan en presupuestos de inferencia ajustados en GPU de consumo.
- Experimentacion con destilacion few-step: util para investigadores que quieran comparar el PTD de cuatro pasos con muestreos largos sobre el mismo transformer MiniMax H3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card solo documenta la configuracion de muestreo (4 pasos, `euler`, cfg 1, sigmas del nodo H3 PTD Patch) y las resoluciones de los ejemplos (1344x768, 124 frames, 24 fps), sin metricas cuantitativas de calidad, FVD, CLIP score ni latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Los patches pesan unos 4,8 GB cada uno, pero se aplican sobre el transformer MiniMax H3 int8 (`minimax_h3_fl2va_int8_convrot` o `minimax_h3_ref2va_pruned_int8_convrot`), el text encoder Qwen3-VL 32B en NVFP4 AWQ, el VAE de video int8 y el VAE de audio fp32; el consumo real depende del modelo base y de la resolucion y duracion del clip.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no confirmada; el uso del text encoder de 32B en NVFP4 AWQ y de transformers int8 sugiere que el pipeline completo excede la VRAM de GPUs de consumo tipicas, pero no hay datos publicados.
- Opciones de despliegue: ComfyUI con WAS Node Suite (nodo H3 PTD Patch y Load Model Patch); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponibles; el unico dato objetivo es que el muestreo se reduce a 4 pasos de `euler` con cfg 1.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pika-H3-Flex-PTD (este) | Patch few-step sobre MiniMax H3 | 4 pasos, cfg 1 | 1344x768, 124 frames en los ejemplos | MiniMax H3 Community License | Hugging Face, requiere WAS Node Suite |
| MiniMaxAI/MiniMax-H3 | Modelo base de difusion video+audio | no disponible en la informacion | no disponible | MiniMax H3 Community License | Hugging Face, Comfy-Org/MiniMax-H3 |
| Pika-Labs/Pika-H3-Flex | Adaptador de movimiento y camara | no disponible | no disponible | no disponible | Hugging Face |
| nynxz/MiniMax-H3-PTD-LoRAs | LoRAs PTD int8 de cuatro pasos | 4 pasos | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (calidad, latencia, FVD) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el transformer MiniMax H3 correspondiente (fl2va o ref2va), el text encoder Qwen3-VL 32B, los dos VAE y el nodo H3 PTD Patch de WAS Node Suite.
- El sampler debe usar exactamente los pasos entrenados; si se le pasan otros sigmas, el nodo aborta con un mensaje de error. No admite configuraciones de muestreo arbitrarias.
- La licencia es la MiniMax H3 Community License Agreement, no una licencia open source permisiva; hay que revisar sus terminos antes de uso comercial.
- No se declaran idiomas soportados; el unico ejemplo con voz esta en ingles, por lo que el comportamiento multilingue es desconocido.
- Riesgo de alucinacion visual y artefactos propios de la generacion de video con difusion few-step; no hay metricas publicadas de calidad ni de consistencia temporal.
- Sesgos conocidos: no documentados en la informacion disponible.
- El repositorio ocupa 9,6 GB y los ejemplos dependen de rutas concretas de ComfyUI (`ComfyUI/models/ptd`, `ComfyUI/models/diffusion_models`, `ComfyUI/models/text_encoders`, `ComfyUI/models/vae`); una instalacion mal configurada rompe el workflow.
- La fuerza de fusion del adaptador Pika esta fijada a 0.5; no se documenta como ajustarla sin reconstruir el patch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WAS/Pika-H3-Flex-PTD
- Modelo base Pika H3 Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRAs PTD de Nynxz: https://huggingface.co/nynxz/MiniMax-H3-PTD-LoRAs
- Pesos PTD de EPFL VITA: https://huggingface.co/epfl-vita/PTD-weights
- LoRAs PTD de taobao-content-ai: https://huggingface.co/taobao-content-ai/MiniMax-H3-PTD-LoRAs
- Repositorio Comfy-Org/MiniMax-H3 (transformers, text encoder y VAE): https://huggingface.co/Comfy-Org/MiniMax-H3
- WAS Node Suite: https://github.com/WASasquatch/was-node-suite-comfyui
- Workflow de ejemplo: https://huggingface.co/WAS/Pika-H3-Flex-PTD/blob/main/workflows/minimax-h3-pikatd.json
- Ejemplo fl2va: https://huggingface.co/WAS/Pika-H3-Flex-PTD/resolve/main/examples/pikatd_fl2va_lighthouse.mp4
- Ejemplo ref2va: https://huggingface.co/WAS/Pika-H3-Flex-PTD/resolve/main/examples/pikatd_ref2va_denim.mp4
- Ejemplo texto a video con voz: https://huggingface.co/WAS/Pika-H3-Flex-PTD/resolve/main/examples/pikatd_t2va_bookseller.mp4

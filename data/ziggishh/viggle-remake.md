# ziggishh/Viggle-Remake

## Resumen

Viggle Remake es un adaptador LoRA de edición de vídeo (video-to-video) construido sobre el modelo base MiniMaxAI/MiniMax-H3, desarrollado por el equipo de Viggle. Su función es rehacer vídeos existentes preservando el movimiento, la cámara, el tiempo y la banda sonora originales, mientras se sustituyen personajes, se cambian vestuarios, se añaden o eliminan objetos, o se altera la iluminación, el clima, el escenario o el estilo visual. Se presenta como la evolución de "Viggle-Animate v2": Animate reemplazaba un personaje; Remake además intercambia, elimina e inserta objetos y modifica el entorno.

El modelo se distribuye como un conjunto de LoRAs (en rango completo y en versiones de bajo rango de 128 y 64) junto con código de inferencia y ejemplos, y requiere descargar por separado los pesos del modelo base MiniMax-H3 (unos 144 GB de ficheros). El repositorio completo ocupa aproximadamente 167,6 GB y el subconjunto necesario para inferencia (LoRAs, `inference/`, `examples/` y `requirements.txt`) unos 5,5 GB. El checkpoint de safetensors declara 20.111.438.744 parámetros.

La propuesta diferencial es su orientación "agent-first": incluye un servidor MCP que permite a un agente de código (Claude Code, Codex u otros clientes compatibles con MCP) recibir un vídeo y una instrucción en lenguaje natural, localizar los cortes, pintar los keyframes, renderizar cada ventana y empalmar el resultado final con la banda sonora. También puede manejarse manualmente mediante `sample.py` o a través de ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el modelo base MiniMax-H3; pipeline video-to-video) |
| Parametros totales | 20.111.438.744 (safetensors del checkpoint) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventanas de render de 90 a 345 frames, con `--frames` = 17n + 5 a 24 fps; se recomienda hasta 294) |
| Tipos de cuantizacion | bf16 (referencia), int8 y GGUF para GPUs pequeñas |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (LoRAs en `lora/` y `lora_lowrank/`), más GGUF e int8 para ComfyUI |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base MiniMax-H3 ni sobre el proceso de entrenamiento del adaptador. Lo que sí se documenta es la forma del adaptador: se distribuye como LoRAs sobre MiniMax-H3, con una versión de rango completo y dos versiones de bajo rango (`--rank 128`, 1,34 GB, y `--rank 64`, 0,67 GB) que producen una salida "casi idéntica" según el autor. El repositorio incluye además un sampler propio (`inference/sample.py`) y un nodo/worker para ComfyUI.

El flujo de trabajo está diseñado en torno a la edición por keyframes: el usuario (o el agente) pinta de una a cuatro imágenes de referencia y las fija a frames concretos mediante `--pin`, y el sampler renderiza la ventana completa interpolando el movimiento a partir del vídeo fuente. El sistema de agente MCP añade una capa de orquestación que detecta cortes, genera prompts, renderiza cada ventana en paralelo sobre las GPUs disponibles, verifica su propio trabajo y empalma el resultado con la pista de audio original. No se han publicado datos sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Edición de vídeo a vídeo con preservación de movimiento, cámara, timing y banda sonora original.
- Reemplazo de personajes ("recast") manteniendo la interpretación y el encuadre.
- Cambio de vestuario de los sujetos del vídeo.
- Inserción y eliminación de objetos en la escena.
- Modificación de clima, iluminación, escenario y estilo visual.
- Procesamiento de vídeos largos completos (no solo clips): el ejemplo "White House Funk" cubre 116 segundos y 69 cortes.
- Control por keyframes: de uno a cuatro frames de referencia fijados con `--pin`.
- Integración con agentes mediante servidor MCP: localización automática de cortes, generación de prompts, renderizado por ventanas y montaje final.
- Ejecución manual mediante `sample.py` o mediante ComfyUI con workflows.
- Soporte de cuantización int8 y GGUF para GPUs de 12 a 24 GB.
- No se documentan capacidades de tool calling genérico, razonamiento multi-step fuera del flujo de agente MCP, visión general, audio (más allá de conservar la pista original) ni multilingüismo.

## Casos de uso

- Recast de actuaciones musicales: sustituir a los integrantes de una banda por otras figuras manteniendo el playback y el montaje original, como en el ejemplo "White House Funk" (116 s, 69 cortes) renderizado con `lora/swap`.
- Posproducción de escenas con cambio de vestuario: fijar keyframes en los frames clave de un plano y regenerar el resto para cambiar el vestuario de un personaje sin rehacer el rodaje.
- Efectos meteorológicos y de iluminación: instrucciones como "make it snow" o cambiar la hora del día sobre metraje existente, útil para pruebas de concepto y previsualización en publicidad.
- Sustitución de personajes en remakes y parodias: recrear escenas de películas con nuevos protagonistas (el ejemplo "Burly Brawl" convierte a Neo en un gato con esmoquin y a los Agent Smith en shiba inu) conservando la coreografía.
- Limpieza de objetos en postproducción: eliminar elementos no deseados de una escena (por ejemplo, turbinas o un pizzero en los ejemplos de `demo.sh`) mediante keyframes pintados y regeneración de la ventana.
- Automatización de pipelines de edición con agentes: conectar el servidor MCP a Claude Code o Codex para que un agente procese un vídeo largo de principio a fin, repartiendo ventanas entre GPUs y verificando el resultado, lo que reduce la intervención manual en proyectos de decenas de cortes.
- Prototipado en GPUs de consumo: usar ComfyUI con ficheros int8 o GGUF en tarjetas de 12 a 24 GB para iterar sobre prompts y keyframes antes de lanzar el render final en hardware mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento aportados son operativos: en una única GPU de 32 GB (RTX 5090) con el worker de ComfyUI, una ventana de 1280×736 y 345 frames se renderiza en unos 28 minutos, y el ejemplo "White House Funk" completo en aproximadamente 3 horas. Con 80 GB se puede usar `sample.py` o ComfyUI con bf16 + LoRA; con 96 GB o más, el agente con `viggle-remake-worker`.

## Requisitos de hardware

- VRAM estimada: 80 GB para `sample.py` o ComfyUI en bf16 con LoRA; 96 GB o más para el agente con `viggle-remake-worker`; 32 GB (RTX 5090) para el agente con el worker de ComfyUI, con unos 60 GB de RAM del sistema; 12–24 GB para ComfyUI con int8 o GGUF.
- GPU recomendadas: A100/H100 de 80 GB para el flujo de referencia; RTX 5090 (32 GB) para el worker de ComfyUI; tarjetas de 12–24 GB para cuantizaciones reducidas.
- Cabe en GPU de consumo: sí, en el rango de 12 a 24 GB con int8/GGUF, y en RTX 5090 con el worker de ComfyUI.
- Almacenamiento: unos 144 GB para los ficheros del modelo base MiniMax-H3, 5,5 GB para el subconjunto de inferencia de este repositorio (el repo completo son ~167,6 GB).
- Opciones de despliegue: `inference/sample.py` (script propio), ComfyUI con el node pack y workflows documentados en `COMFYUI.md`, y servidor MCP (`mcp/`) con `viggle-remake-worker` o `mcp/comfy_worker/`.
- Dependencias: `huggingface_hub>=1.0`, `requirements.txt` del repositorio y un binario de ffmpeg en el PATH.
- Latencia y throughput: ~28 minutos por ventana de 345 frames a 1280×736 en una RTX 5090; ~3 horas para un vídeo de 116 segundos con 69 cortes en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viggle Remake (este) | 20.111.438.744 (checkpoint declarado) | Ventanas de 90–345 frames a 24 fps | Video-to-video con LoRA sobre MiniMax-H3; recast, objetos, entorno y estilo | minimax-h3-community-license | Hugging Face (ziggishh/Viggle-Remake) y app Viggle |
| MiniMax-H3 (base) | no disponible | no disponible | Modelo base multimodal sobre el que se aplica el LoRA | minimax-h3-community-license | Hugging Face (MiniMaxAI/MiniMax-H3) |
| Viggle-Animate (versión previa) | no disponible | no disponible | Reemplazo de un personaje en vídeo | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia `minimax-h3-community-license` (etiquetada como `other`): es imprescindible revisar el fichero `LICENSE` antes de cualquier uso comercial, ya que las condiciones concretas no se detallan en la información disponible.
- El modelo no incluye los pesos base: requiere descargar MiniMax-H3 por separado (~144 GB), lo que condiciona el almacenamiento y el ancho de banda del despliegue.
- Los ejemplos de la model card usan material audiovisual de terceros (La La Land, The Matrix Reloaded, Uptown Funk); el propio autor advierte que no está afiliado ni respaldado por sus propietarios, y que las parodias generadas no cuentan con el consentimiento de las personas mostradas. El uso de material con derechos exige evaluación legal propia.
- Riesgo evidente de uso indebido en suplantación de identidad y deepfakes, dado que el modelo está diseñado específicamente para sustituir personas en vídeo.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación o artefactos; la calidad de la edición depende de la calidad de los keyframes pintados y de los prompts.
- El renderizado es costoso: ~28 minutos por ventana de 345 frames en una RTX 5090 y ~3 horas para un vídeo de 116 segundos, lo que limita su uso interactivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-11), por lo que no hay evidencia de validación por parte de la comunidad.
- La ficha de Hugging Face pertenece al usuario `ziggishh`, mientras que la model card hace referencia a la organización `Viggle/Viggle-Remake`; conviene verificar la procedencia y la integridad de los pesos antes de usarlos en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ziggishh/Viggle-Remake
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Referencia de la organización en la model card: https://huggingface.co/Viggle/Viggle-Remake
- App Viggle (uso sin GPU): https://viggle.ai/meme/app/home?ui=v2
- Ejemplo La La Land: https://huggingface.co/Viggle/Viggle-Remake/resolve/main/examples/media/lala-land.mp4
- Ejemplo White House Funk: https://huggingface.co/Viggle/Viggle-Remake/resolve/main/examples/media/white-house-funk.mp4
- Ejemplo Burly Brawl: https://huggingface.co/Viggle/Viggle-Remake/resolve/main/examples/media/matrix-burly-brawl.mp4
- Documentación de ComfyUI y GPUs pequeñas: `COMFYUI.md` en el repositorio
- Servidor MCP y worker de ComfyUI: `mcp/` y `mcp/comfy_worker/` en el repositorio
- Script de inferencia: `inference/sample.py`
- Ejemplos reproducibles: `examples/demo.sh` y `examples/inputs/`

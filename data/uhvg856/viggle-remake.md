# Uhvg856/Viggle-Remake

## Resumen

Viggle Remake es un modelo de edición de vídeo (video-to-video) desarrollado por Viggle, distribuido como un conjunto de LoRAs y código de inferencia sobre el modelo base MiniMaxAI/MiniMax-H3. Su función es reescribir vídeo existente preservando el movimiento, la cámara, el ritmo y la banda sonora originales: permite recastear personajes, cambiar vestuario, añadir o eliminar objetos, y modificar escenario, clima, iluminación o estilo. Se posiciona como la evolución de "Viggle-Animate v2", ampliando el reemplazo de personaje a la sustitución, inserción y borrado de elementos.

El repositorio combina pesos LoRA (en varias categorías de rango), un sampler de inferencia (`sample.py`) y un servidor MCP pensado para que agentes como Claude Code o codex automaticen flujos completos: detección de cortes, pintado de keyframes, escritura de prompts, renderizado por ventanas y montaje final con la pista de audio. El modelo base aporta aproximadamente 20.111 millones de parámetros en formato safetensors, mientras que el repositorio completo ocupa unos 167,6 GB (el autor indica ~210 GB con todos los artefactos).

La relevancia actual reside en su enfoque "agent-first" para edición de vídeo de larga duración (películas completas, no solo clips) y en la disponibilidad de variantes int8/GGUF que permiten ejecutarlo en GPUs de consumo de 12-24 GB, frente a los 80-96 GB recomendados para bf16. La licencia es la MiniMax-H3 Community License, no una licencia de código abierto permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniMax-H3; el repo distribuye LoRAs y sampler sobre dicho base) |
| Parametros totales | 20.111.438.744 (safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventanas de 90-345 frames, `--frames` = 17n + 5, a 24 fps) |
| Tipos de cuantizacion | bf16, int8, GGUF (variantes para GPUs de 12-24 GB); LoRAs en rango completo, `--rank 128` (1,34 GB) y `--rank 64` (0,67 GB) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (license_name: minimax-h3-community-license, license_link: LICENSE) |
| Formato de pesos | safetensors (base), LoRA (lora/ y lora_lowrank/), GGUF, int8 |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna del modelo base MiniMax-H3 ni la composición del dataset de entrenamiento de los LoRAs. Lo que sí se documenta es la estructura del pipeline: un modelo base de difusión vídeo (con text_encoder, tokenizer, processor, vae, audio_vae, scheduler y audio_scheduler descargables por separado) sobre el que se aplican LoRAs específicos para la tarea de edición. El repositorio incluye un LoRA principal (`lora/`) y variantes de bajo rango (`lora_lowrank/`) con salida descrita como "casi idéntica".

El proceso de inferencia opera por ventanas: cada ventana cubre de 90 a 345 frames (recomendado hasta 294), con la restricción `--frames` = 17n + 5 a 24 fps, y se renderiza a 480p de lado corto por defecto o 1280×736 con `--short-edge 736`. El flujo "agent-first" añade capas de orquestación: detección automática de cortes, pintado de keyframes (de uno a cuatro frames de referencia mediante `--ref` y `--pin`), generación de prompts, renderizado distribuido y concatenación final con la banda sonora original. No se especifican datos sobre RLHF, DPO ni número de tokens de entrenamiento.

## Capacidades

- Edición de vídeo video-to-video con preservación de movimiento, cámara, timing y banda sonora original.
- Reemplazo de personajes (recasteo) manteniendo la interpretación y el encuadre.
- Cambio de vestuario sobre el sujeto original.
- Inserción y eliminación de objetos en la escena.
- Modificación de escenario, clima, iluminación y estilo visual.
- Procesamiento de vídeos largos mediante segmentación en ventanas y montaje posterior (ejemplo documentado de 116 segundos con 69 cortes).
- Integración con agentes mediante servidor MCP (Claude Code, codex y cualquier cliente compatible con MCP).
- Control manual mediante prompt de texto más pintado de keyframes de referencia.
- Renderizado con audio: el pipeline conserva y reensambla la pista de sonido del vídeo fuente.
- No se documentan capacidades de tool calling genérico, razonamiento multi-step fuera del flujo de agente, ni soporte multilingüe explícito.

## Casos de uso

- Recast de vídeos musicales completos: el flujo con `lora/swap` permite sustituir a los intérpretes en un vídeo de varios minutos con decenas de cortes, preservando la sincronización con la banda sonora original (el ejemplo "White House Funk" cubre 116 segundos y 69 cortes).
- Posproducción de escenas con cambio de vestuario: útil en publicidad o moda para generar variantes de una misma toma con distintas prendas sin regrabar, manteniendo la interpretación del actor original.
- Sustitución de personajes en material de archivo: recasteo de escenas existentes para prototipos, parodias o versiones alternativas de una secuencia, con control mediante keyframes de referencia (`--ref` y `--pin`).
- Efectos atmosféricos y de iluminación: añadir nieve, cambiar la hora del día o modificar la luz de una escena rodada, útil para ajustar continuidad entre tomas o generar variantes de un mismo plano.
- Eliminación e inserción de objetos en plano: limpiar elementos no deseados (por ejemplo, turbinas o maquinaria en una localización) o añadir atrezo digital sin recurrir a rotoscopia manual.
- Automatización de pipelines de edición con agentes: un agente MCP puede recibir un vídeo y una instrucción en una frase, detectar cortes, pintar keyframes, lanzar renders por ventanas y devolver el montaje final, lo que encaja en flujos de producción de contenido a escala.
- Generación de parodias y contenido satírico controlado: el modelo permite recrear escenas conocidas con nuevos protagonistas, con la advertencia legal explícita del autor sobre derechos de imagen y material original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento aportados son operativos: en una RTX 5090 (32 GB) con el worker de ComfyUI, una ventana de 1280×736 y 345 frames se renderiza en aproximadamente 28 minutos, y el ejemplo completo "White House Funk" se ejecuta de extremo a extremo en unas 3 horas. El modelo base requiere unos 144 GB de archivos y el conjunto de LoRAs, sampler y ejemplos de este repositorio ocupa 5,5 GB.

## Requisitos de hardware

- VRAM estimada: 80 GB para `sample.py` o ComfyUI con bf16 + LoRA; 96 GB o más para el agente con `viggle-remake-worker`; 32 GB (RTX 5090) para el agente con el worker de ComfyUI, requiriendo unos 60 GB de RAM del sistema.
- GPUs de consumo: una tarjeta de 12-24 GB puede ejecutar ComfyUI con archivos int8 o GGUF, con flujos manuales y sin agente.
- GPUs recomendadas: A100/H100 de 80 GB para bf16, RTX 5090 (32 GB) para el worker de ComfyUI, tarjetas de 12-24 GB con cuantización int8/GGUF.
- Almacenamiento: aproximadamente 144 GB para el modelo base y 5,5 GB para los artefactos de este repositorio (el repo completo ronda los 210 GB).
- Opciones de despliegue: `sample.py` (inferencia directa), ComfyUI con node pack y workflows, servidor MCP con `viggle-remake-worker` o `mcp/comfy_worker/`, y la app alojada de Viggle sin GPU local.
- Dependencias: `huggingface_hub>=1.0`, `requirements.txt` del repositorio y un binario de ffmpeg en el PATH.
- Latencia y throughput: ~28 minutos por ventana de 345 frames a 1280×736 en RTX 5090; ~3 horas para un vídeo musical de 116 segundos de extremo a extremo en el mismo hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La referencia más directa es el propio modelo base y su predecesor:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Viggle Remake (este modelo) | 20.111.438.744 (repo safetensors) | Ventanas de 90-345 frames a 24 fps | minimax-h3-community-license | Hugging Face + app Viggle |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | no disponible | Hugging Face |
| Viggle-Animate (predecesor) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de edición de vídeo | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia MiniMax-H3 Community License: no es una licencia de código abierto permisiva; es imprescindible revisar los términos antes de cualquier uso comercial.
- Riesgo de alucinación visual: la edición generativa puede introducir artefactos, inconsistencias entre ventanas o cambios no solicitados en la escena.
- El autor advierte explícitamente sobre derechos de imagen y material original: los ejemplos usan footage de películas y vídeos musicales de terceros, y el contenido generado no debe interpretarse como aval de las personas representadas.
- Idiomas soportados no documentados; el control se realiza mediante prompts de texto y keyframes, sin garantía de comportamiento multilingüe.
- Procesamiento por ventanas: aunque el modelo maneja vídeos largos, la coherencia entre ventanas depende del pipeline de montaje y puede requerir revisión manual en cortes complejos.
- Requisitos de hardware elevados para bf16 (80-96 GB de VRAM); las variantes int8/GGUF en GPUs de 12-24 GB implican flujos manuales sin agente y posible pérdida de calidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente del funcionamiento del LoRA ni de su reproducibilidad.
- El repositorio no incluye el modelo base: es necesario descargar por separado MiniMaxAI/MiniMax-H3 (~144 GB), lo que añade complejidad operativa.
- No se documentan sesgos conocidos del modelo ni evaluaciones de seguridad publicadas.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Uhvg856/Viggle-Remake
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- App de Viggle (uso sin GPU): https://viggle.ai/meme/app/home?ui=v2
- Documentación de ComfyUI y GPUs pequeñas: COMFYUI.md (en el repositorio)
- Servidor MCP y worker de ComfyUI: mcp/ y mcp/comfy_worker/ (en el repositorio)
- Script de inferencia: inference/sample.py (en el repositorio)
- Ejemplos y demo: examples/demo.sh y examples/inputs/ (en el repositorio)
- Licencia: LICENSE (en el repositorio)

# Viggle/Viggle-Remake

## Resumen
Viggle Remake es un modelo de edición de vídeo video-to-video desarrollado por Viggle, construido como un adaptador LoRA sobre MiniMaxAI/MiniMax-H3. Su propósito es rehacer vídeos existentes preservando el movimiento, la cámara, el timing y la banda sonora originales: permite recastear personajes, cambiar vestuario, añadir o eliminar objetos, y modificar la climatología, la iluminación, el escenario o el estilo visual. El modelo está pensado para operar de forma "agent-first": un agente que habla MCP (Claude Code, codex, etc.) recibe un vídeo y una instrucción en lenguaje natural, localiza los cortes, pinta los keyframes, renderiza cada ventana y entrega la película final montada.

Técnicamente es un adaptador LoRA sobre la base MiniMax-H3, con 20.111.438.744 parámetros reportados en safetensors, un repositorio de 167,6 GB y pesos distribuidos en variantes de rango completo y de bajo rango (`lora/` y `lora_lowrank/`). El modelo base MiniMax-H3 ocupa aproximadamente 144 GB de ficheros y se descarga por separado. La librería asociada es `minimax-h3` y el pipeline declarado es `video-to-video`.

Su relevancia actual radica en que amplía el concepto de Viggle-Animate (que solo reemplazaba un personaje) hacia la edición completa de escenas, y en que ofrece una vía de despliegue local con cuantizaciones int8 y GGUF para GPUs de 12–24 GB, además de un servidor MCP para automatizar la edición de películas completas. La licencia es la `minimax-h3-community-license`, de tipo "other".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre MiniMax-H3 (modelo base de difusión video-to-video); arquitectura interna del base no detallada en la información disponible |
| Parámetros totales | 20.111.438.744 (safetensors reportados) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible; ventana de renderizado de 90–345 frames (17n + 5, a 24 fps), recomendado hasta 294 frames |
| Tipos de cuantización | int8 y GGUF (para GPUs pequeñas); bf16 en el flujo principal; LoRA a rango completo y `lora_lowrank` (rank 128 / 64) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (license: other) |
| Formato de pesos | safetensors (LoRA), GGUF, int8; repositorio de 167,6 GB |

## Arquitectura y entrenamiento
Viggle Remake se distribuye como un conjunto de LoRAs y un sampler (`inference/sample.py`) que se aplican sobre el modelo base MiniMax-H3. El flujo de inferencia requiere descargar por separado el transformer, text encoder, tokenizer, processor, VAE, audio VAE y schedulers del base (unos 144 GB), y luego los LoRAs, el código de inferencia y los ejemplos de este repositorio (5,5 GB). El modelo opera en modo video-to-video: recibe un vídeo fuente, un prompt y entre una y cuatro imágenes de referencia (`--ref`), y renderiza una ventana de frames con la banda sonora original.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO. La innovación destacable es el diseño "agent-first" mediante un servidor MCP: el agente segmenta el vídeo en ventanas, pinta keyframes, redacta prompts, renderiza en las GPUs del usuario y empalma el resultado con la banda sonora. También se ofrece un worker de ComfyUI (`mcp/comfy_worker/`) para ejecutar el agente en una única GPU de 32 GB.

## Capacidades
- Edición video-to-video con preservación de movimiento, cámara, timing y soundtrack originales.
- Recasteado de personajes (`lora/swap`) y cambio de vestuario.
- Adición y eliminación de objetos en la escena.
- Modificación de climatología, iluminación, escenario y estilo visual.
- Procesamiento de películas completas, no solo clips, mediante segmentación automática en ventanas.
- Control manual mediante prompt más pintura de uno a cuatro keyframes.
- Integración con agentes vía servidor MCP (Claude Code, codex y cualquier cliente compatible con MCP).
- Soporte de LoRAs de bajo rango (rank 128 y 64) con salida casi idéntica.
- Renderizado con audio original del vídeo fuente.
- No se documentan capacidades de texto, razonamiento, código, matemáticas, tool calling genérico ni visión más allá del propio pipeline de vídeo.

## Casos de uso
- Recasteado de vídeos musicales completos: el ejemplo "White House Funk" muestra un vídeo musical de 116 segundos recasteado con `lora/swap` en 69 cortes, conservando la banda sonora original; el agente localiza los cortes y renderiza cada ventana.
- Sustitución de personajes en escenas de cine: "Burly Brawl" convierte a Neo en un gato con esmoquin y a cada Agent Smith en un shiba inu a lo largo de 101 segundos, manteniendo el movimiento y el audio originales.
- Cambios de ambientación y clima en producción audiovisual: instrucciones como "make it snow" o cambiar la luz permiten alterar la atmósfera de una escena sin regrabar.
- Edición publicitaria y de marca: añadir o eliminar productos y objetos en planos existentes, o cambiar el vestuario de los modelos, para adaptar campañas a distintos mercados.
- Previsualización y prototipado de VFX: generar variantes de una escena (estilo, escenario, personajes) antes de comprometer recursos de producción.
- Automatización de pipelines de posproducción: integración del servidor MCP en flujos de trabajo de agentes para procesar películas completas de forma desatendida en GPUs locales.
- Creación de parodias y contenido humorístico: el modelo card documenta explícitamente el uso para parodias generadas por IA, con advertencia de que las personas mostradas no participaron ni aprobaron el contenido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento documentados son operativos: una ventana de 1280×736 de 345 frames se renderiza en aproximadamente 28 minutos en una RTX 5090 (32 GB) con el worker de ComfyUI, y el ejemplo "White House Funk" se completa de extremo a extremo en unas 3 horas. El renderizado de `sample.py` admite ventanas de 90–345 frames a 24 fps, con recomendación de hasta 294 frames, y `--short-edge 736` produce 1280×736.

## Requisitos de hardware

| GPU | Configuración recomendada |
|---|---|
| Sin GPU | Aplicación Viggle (viggle.ai) |
| 12–24 GB | ComfyUI con ficheros int8 o GGUF, flujos manuales sin agente |
| 32 GB (RTX 5090) | Agente con worker de ComfyUI, 1280×736 hasta 345 frames, ~60 GB de RAM |
| 80 GB | `sample.py` o ComfyUI con bf16 + LoRA |
| 96 GB o más | Igual que 80 GB, o agente con `viggle-remake-worker` |

- VRAM estimada para inferencia: no disponible con cifras exactas; el modelo card indica que int8 y GGUF permiten ejecución en tarjetas de 12 GB en adelante.
- Cabe en GPU consumer: sí, en RTX 5090 (32 GB) con el worker de ComfyUI y en tarjetas de 12–24 GB con int8/GGUF.
- Opciones de despliegue: `sample.py` (script de inferencia), ComfyUI (node pack y workflows), servidor MCP con `viggle-remake-worker` o `mcp/comfy_worker/`, y la app Viggle como servicio alojado.
- Requisitos adicionales: binario ffmpeg en el PATH y `huggingface_hub>=1.0` para la CLI `hf`.
- Latencia y throughput: ~28 minutos por ventana de 345 frames a 1280×736 en RTX 5090; ~3 horas para un vídeo musical completo de 116 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viggle Remake | 20,1 B (LoRA sobre MiniMax-H3) | Ventanas de 90–345 frames | Edición video-to-video completa (recaste, objetos, clima, estilo) | minimax-h3-community-license | Hugging Face + app Viggle |
| Viggle-Animate | no disponible | no disponible | Reemplazo de un personaje | no disponible | Viggle |
| MiniMax-H3 (base) | ~144 GB de ficheros | no disponible | Modelo base video-to-video | no disponible | Hugging Face (MiniMaxAI) |

La información disponible no permite comparar rendimiento numérico con alternativas de la misma categoría; no se han publicado benchmarks de Viggle Remake ni de los modelos comparados en las fuentes consultadas.

## Limitaciones y advertencias
- Riesgo de alucinación visual: la información disponible no documenta métricas de fidelidad; el propio model card sugiere verificar con `examples/demo.sh` que el LoRA se cargó correctamente (si las turbinas siguen ahí o el pizzero no cambia, el LoRA no se aplicó).
- Sesgos: no documentados en la información disponible; al recastear personas, el modelo puede reproducir sesgos presentes en los datos de entrenamiento del base.
- Limitaciones de idioma: no se especifican idiomas soportados.
- Restricciones de licencia: licencia `minimax-h3-community-license` de tipo "other"; es necesario consultar el fichero LICENSE del repositorio antes de cualquier uso comercial.
- Advertencia legal explícita: los ejemplos con personas reales son parodias generadas por IA y las personas mostradas no participaron, aprobaron ni respaldaron el contenido; el model card indica no estar afiliado ni respaldado por los titulares de las obras originales.
- Requisitos de recursos: el flujo completo necesita el modelo base (~144 GB) más el repositorio (~210 GB completo, 5,5 GB para LoRAs e inferencia), lo que exige almacenamiento considerable.
- Dependencia de la app/agente: el uso sin GPU requiere la app Viggle; el flujo local con agente exige configuración MCP y GPUs compatibles.
- Ventana de renderizado limitada: 90–345 frames por ventana, con recomendación de hasta 294; los vídeos largos requieren segmentación y empalme.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Viggle/Viggle-Remake
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- App Viggle (uso sin GPU): https://viggle.ai/meme/app/home?ui=v2
- Sitio de Viggle: https://viggle.ai/
- Herramientas gratuitas de Viggle: https://viggle.ai/tools
- Documentación ComfyUI del repositorio: COMFYUI.md (referenciado en el model card)
- Servidor MCP del repositorio: mcp/ (referenciado en el model card)
- Ejemplos de entrada: examples/inputs/ (referenciado en el model card)

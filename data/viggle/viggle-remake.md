# Viggle/Viggle-Remake

## Resumen

Viggle Remake es un modelo de edición de vídeo (pipeline `video-to-video`) desarrollado por Viggle, construido como un conjunto de LoRAs de rango 256 sobre el transformer del modelo base MiniMaxAI/MiniMax-H3. Su función es rehacer un vídeo existente conservando el movimiento, la cámara, el ritmo y la banda sonora originales: permite recastear personajes, cambiar vestuario, eliminar o insertar objetos, y modificar el escenario, el clima o la iluminación. Se distribuye con 20.111.438.744 parámetros declarados en safetensors y un repositorio de 167,7 GB, aunque el conjunto de LoRAs y sampler que necesita el usuario pesa unos 5,5 GB.

El modelo se presenta como una evolución de "Viggle-Animate v2": mientras Animate sustituía un personaje, Remake añade sustitución múltiple, borrado e inserción de objetos y cambios de entorno. La propuesta es explícitamente *agent-first*: incluye un servidor MCP que permite a un agente de código (Claude Code, codex u otros) cortar el vídeo en ventanas, pintar keyframes, redactar los prompts, renderizar en GPUs y empalmar el resultado final con la pista de audio.

Es relevante porque traslada la edición de vídeo generativa de "clips sueltos" a películas completas: los ejemplos de la model card incluyen un vídeo musical de 116 segundos con 69 cortes y un clip de 101 segundos con sustitución simultánea de varios personajes. La licencia es la MiniMax-H3 Community License, no una licencia open source estándar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 256) sobre el transformer del modelo base MiniMax-H3; pipeline video-to-video |
| Parametros totales | 20.111.438.744 (safetensors declarados) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventanas de 90-345 frames; `--frames` = 17n + 5) |
| Tipos de cuantizacion | int8 y GGUF (hasta 12 GB de VRAM, segun COMFYUI.md) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (license: other) |
| Formato de pesos | safetensors (LoRAs); repo de 167,7 GB, conjunto de inferencia de 5,5 GB |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Modos | `swap` (lora/swap) y `edit` (lora/edit) |
| LoRAs de baja dimensionalidad | rank 128 (1,34 GB) y rank 64 (0,67 GB) |
| Resolucion de render | 1280x736 con `--short-edge 736`; 480 en el ejemplo por defecto |
| Frame rate | 24 fps |

## Arquitectura y entrenamiento

Viggle Remake no es un modelo entrenado desde cero: son dos adaptadores LoRA de rango 256 sobre el transformer de MiniMax-H3, uno para el modo `swap` (sustitución de personas y personajes, uno o varios a la vez) y otro para el modo `edit` (sustitución, borrado o inserción de objetos, cambio de fondo, clima o luz). El pipeline es de vídeo a vídeo y trabaja por ventanas: `sample.py` renderiza una ventana de 90 a 345 frames (con la fórmula `--frames` = 17n + 5, a 24 fps, recomendándose hasta 294) conservando la banda sonora de origen.

El flujo de inferencia combina keyframes pintados manualmente (de uno a cuatro, pasados con `--ref` y referenciados como `<Picture N>` en el prompt) con el vídeo fuente, de modo que el modelo propaga el cambio al resto de la ventana respetando el movimiento y la cámara originales. Para películas completas, el servidor MCP automatiza el corte en ventanas, el pintado de keyframes, la escritura de prompts, el renderizado distribuido por GPU y el empalme final con audio. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Edición de vídeo a vídeo con preservación de movimiento, cámara, timing y banda sonora original.
- Recasteado de personajes (`--mode swap`), incluida la sustitución simultánea de varios personajes en un mismo plano.
- Cambio de vestuario, eliminación e inserción de objetos y modificación de escenario, clima, luz o estilo (`--mode edit`).
- Procesamiento de vídeos largos por ventanas: los ejemplos incluyen 116 segundos con 69 cortes y 101 segundos con múltiples personajes.
- Control mediante keyframes pintados a mano (de uno a cuatro) más prompt de texto.
- Automatización con agentes mediante servidor MCP: corte de ventanas, pintado de keyframes, generación de prompts, renderizado y montaje.
- Renderizado distribuido: un worker por GPU (`viggle-remake-worker --gpu N`).
- Salida con audio original sincronizado.
- No se documentan capacidades de tool calling genérico, razonamiento multi-step fuera del flujo MCP, ni soporte multilingüe explícito.

## Casos de uso

- **Recasteado de vídeos musicales completos**: con `--mode swap` y el servidor MCP se puede rehacer un vídeo musical de principio a fin (el ejemplo White House Funk son 116 segundos y 69 cortes, unas 1,5 horas en dos GPUs), manteniendo la banda sonora original.
- **Sustitución de personajes en planos de acción**: el ejemplo Burly Brawl reemplaza a Neo por un gato con esmoquin y a cada Agent Smith por un shiba inu durante 101 segundos, lo que demuestra la sustitución simultánea de varios personajes en planos complejos.
- **Postproducción de vestuario**: cambiar el vestuario de un actor en un plano sin regrabar, usando `--mode edit` con uno o varios keyframes pintados como referencia.
- **Limpieza de planos (object removal)**: eliminar objetos no deseados del encuadre (por ejemplo, turbinas o atrezzo) conservando el movimiento de cámara, útil en corrección de continuidad.
- **Cambios de ambiente y clima**: añadir nieve, modificar la iluminación o el fondo de una escena rodada, con el modo `edit` y keyframes de referencia.
- **Prototipado rápido de storyboards y previsiones**: renderizar variantes de una misma toma (estilo, vestuario, personajes) para decidir en preproducción antes de rodar.
- **Automatización en pipelines con agentes**: integrar el servidor MCP en un flujo de Claude Code o codex para que un agente reciba un vídeo y una frase ("recast the band as US politicians") y devuelva el film terminado, con renderizado en GPUs propias.
- **Despliegue en hardware de consumo con ComfyUI**: usar los nodos y los ficheros int8/GGUF (hasta 12 GB de VRAM) para editar clips cortos en GPUs de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **Modelo base**: la descarga de MiniMax-H3 ocupa unos 144 GB de ficheros; el repositorio completo de Viggle-Remake ronda los 210 GB (no clonar con git-lfs).
- **Conjunto de inferencia**: LoRAs + sampler + ejemplos = 5,5 GB; las variantes de baja dimensionalidad son 1,34 GB (rank 128) y 0,67 GB (rank 64).
- **VRAM**: no se especifica un mínimo para el flujo completo con `sample.py`; con ComfyUI hay ficheros int8/GGUF que bajan el requisito hasta 12 GB de VRAM.
- **GPUs recomendadas**: no se indican modelos concretos (A100, H100, RTX 4090); el flujo MCP asume varias GPUs (un worker por GPU) y el ejemplo White House Funk se ejecuta en dos GPUs en aproximadamente 1,5 horas.
- **Cabe en GPU de consumo**: sí, en el escenario ComfyUI con cuantización int8/GGUF a partir de 12 GB de VRAM; el flujo nativo con el modelo base completo requiere hardware de datacenter.
- **Opciones de despliegue**: `sample.py` (script oficial de inferencia), servidor MCP con workers por GPU, ComfyUI (node pack y workflows), y `requirements.txt` propio más un binario de ffmpeg en el PATH.
- **Latencia y throughput**: no disponibles de forma agregada; el único dato publicado es el tiempo del ejemplo (unas 1,5 horas para un vídeo de 116 segundos en dos GPUs).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viggle Remake | 20.111.438.744 (safetensors declarados) | Ventanas de 90-345 frames a 24 fps | Vídeo a vídeo con LoRAs sobre MiniMax-H3; swap y edit | minimax-h3-community-license | Hugging Face (Viggle/Viggle-Remake) y app Viggle |
| Viggle-Animate | no disponible | no disponible | Sustitución de un personaje (predecesor directo) | no disponible | App Viggle / Hugging Face |
| MiniMax-H3 (base) | no disponible | no disponible | Modelo base multimodal sobre el que se aplican las LoRAs | minimax-h3-community-license | Hugging Face (MiniMaxAI/MiniMax-H3) |
| JST-1 (Viggle) | no disponible | no disponible | Modelo propietario de movimiento y personajes de Viggle | propietaria | Solo vía API/app de Viggle |

No se dispone de datos de benchmarks que permitan comparar rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Licencia no open source**: la MiniMax-H3 Community License es una licencia "other"; hay que revisar el fichero LICENSE antes de cualquier uso comercial. No es una licencia OSI.
- **Dependencia del modelo base**: requiere descargar MiniMax-H3 (unos 144 GB) además de las LoRAs; el repositorio completo ronda los 210 GB y no debe clonarse con git-lfs.
- **Riesgo de suplantación y deepfakes**: el modelo está diseñado para recastear personas reales; los propios ejemplos incluyen descargos ("AI-generated parody: the people shown did not take part in, approve or endorse it"). Es imprescindible obtener consentimiento y cumplir la normativa aplicable.
- **Derechos de autor del material fuente**: los ejemplos usan fragmentos de películas y música de terceros; el usuario es responsable del material de entrada y de la banda sonora.
- **Alucinación visual**: no se documentan métricas de fidelidad; el autor advierte de que el agente pinta sus propios keyframes y "cada ejecución difiere en detalle", por lo que la reproducibilidad exacta no está garantizada.
- **Longitud limitada por ventanas**: el renderizado nativo trabaja por ventanas de 90 a 345 frames (recomendado hasta 294); los vídeos largos dependen del pipeline MCP para cortar y empalmar, con posible inconsistencia entre ventanas.
- **Idiomas**: no hay información sobre el soporte multilingüe de los prompts.
- **Cuantización**: la calidad con int8/GGUF (12 GB de VRAM) puede diferir de la del flujo completo; las LoRAs de rango 128 y 64 se describen como de salida "casi idéntica", no idéntica.
- **Madurez**: 4 descargas y 1 like en Hugging Face en la fecha de actualización; ecosistema joven y con poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Viggle/Viggle-Remake
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- App Viggle (uso sin GPU): https://viggle.ai/meme/app/home?ui=v2
- Sitio de Viggle: https://viggle.ai/
- Herramientas gratuitas de Viggle: https://viggle.ai/tools
- Documentación ComfyUI del modelo: https://huggingface.co/Viggle/Viggle-Remake/blob/main/COMFYUI.md
- Servidor MCP: https://huggingface.co/Viggle/Viggle-Remake/tree/main/mcp
- Ejemplo White House Funk: https://huggingface.co/Viggle/Viggle-Remake/tree/main/mcp/examples/white-house-funk
- Script de inferencia: https://huggingface.co/Viggle/Viggle-Remake/blob/main/inference/sample.py
- Ejemplos y demo: https://huggingface.co/Viggle/Viggle-Remake/tree/main/examples

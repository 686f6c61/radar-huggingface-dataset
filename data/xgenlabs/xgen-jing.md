# XGENlabs/XGEN-JING

## Resumen

XGEN-JING es un modelo de generación de vídeo y audio en primera persona (egocéntrico) desarrollado por XGEN Labs, construido como un fine-tuning de MiniMax-H3 (concretamente sobre la variante Ref2VA y el LoRA FlashGen de cuatro pasos). El modelo recibe como entrada acciones de control, imágenes de referencia y un historial de observaciones, y genera secuencias de vídeo y audio conjuntas que simulan la experiencia de un agente que navega, interactúa con objetos y conversa en un entorno. La versión publicada, denominada JING-Flash-v1, es un modelo bidireccional de cuatro pasos de inferencia.

La relevancia del modelo reside en su enfoque de "modelo de mundo interactivo": no se limita a generar vídeo a partir de texto, sino que incorpora control de cámara por teclado (movimiento adelante/atrás, giro, inclinación), condicionamiento por imágenes de referencia de personajes, objetos y escenas, y generación conjunta de audio y vídeo. Esto lo sitúa en la intersección de la generación de vídeo, los modelos de mundo y los agentes encarnados.

El repositorio ocupa 66,9 GB y se distribuye en formato safetensors bajo la licencia comunitaria de MiniMax-H3. El modelo solo soporta inglés y chino, y la inferencia de referencia se ha validado en seis GPU H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) bidireccional, derivada de MiniMax-H3 Ref2VA; pipeline image-text-to-video con VAE de vídeo y audio |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (diffusion-single-file, librería diffusers) |

## Arquitectura y entrenamiento

XGEN-JING se construye sobre MiniMax-H3 Ref2VA, un modelo de difusión con arquitectura Transformer (DiT) que genera vídeo y audio de forma conjunta. La variante publicada, JING-Flash-v1, incorpora el LoRA FlashGen de cuatro pasos, lo que reduce la inferencia a cuatro pasos de difusión en modo bidireccional. El pipeline completo incluye un codificador de texto, tokenizador y procesador, VAEs separados para vídeo y audio, y planificadores (schedulers) heredados del formato Diffusers de MiniMax-H3. La inferencia utiliza FlashAttention-4 como backend por defecto y soporta paralelismo de secuencia sobre cuatro GPU para el DiT.

El condicionamiento combina imágenes de referencia (personajes, objetos y escenas) con una secuencia de prompts y controles de teclado. Cada fragmento de prompt puede repetirse varias veces con una entrada de control por cada repetición, lo que permite especificar trayectorias de cámara y acciones a lo largo del tiempo. No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El informe técnico (arXiv:2610.19726) cubre la simulación generativa de mundo con DAO y JING, y el equipo ha anunciado una versión causal del modelo como trabajo futuro.

## Capacidades

- Generación de vídeo en primera persona (egocéntrico) a partir de texto, imágenes de referencia e historial de observaciones.
- Generación conjunta de audio y vídeo en una sola pasada.
- Control de cámara por teclado: `w/s/a/d` para movimiento adelante/atrás/izquierda/derecha, `i/k` para mirar arriba/abajo y `j/l` para girar izquierda/derecha, con posibilidad de combinar teclas.
- Condicionamiento por imágenes de referencia de personajes, objetos y escenas para componer una experiencia y explorar distintas acciones desde el mismo punto de partida.
- Interacción con objetos y diálogo con personajes guiados por texto.
- Soporte de prompts estructurados en JSON con repetición y control por segmento.
- Habilidades de prompt ("Prompt skills") para generar casos de inferencia validados a partir de historias e imágenes de referencia.
- Capacidades multilingües limitadas a inglés y chino.

## Casos de uso

- Prototipado de videojuegos en primera persona: el modelo permite explorar entornos imaginados mediante control de cámara por teclado, generando vídeo y audio coherentes con las acciones del jugador, lo que resulta útil para previsualizar niveles y mecánicas antes de implementarlas.
- Simulación de entrenamiento para robótica y agentes encarnados: a partir de un historial de observaciones y acciones, se pueden generar trayectorias visuales sintéticas de navegación e interacción con objetos para aumentar datos de entrenamiento de políticas.
- Previsualización cinematográfica en primera persona: directores y artistas pueden componer escenas egocéntricas combinando imágenes de referencia de personajes y escenarios, y explorar distintas trayectorias de cámara desde el mismo punto de partida.
- Generación de contenido para experiencias inmersivas: creación de clips de vídeo con audio sincronizado para instalaciones de realidad virtual o vídeo 360, donde la perspectiva en primera persona es el formato natural.
- Diseño de experiencias interactivas narrativas: el modelo permite guiar conversaciones con personajes mediante texto y generar el audio y el vídeo correspondientes, útil para prototipar diálogos ramificados en experiencias interactivas.
- Investigación en modelos de mundo: sirve como banco de pruebas para estudiar la coherencia temporal, la consistencia de escena y la alineación audio-vídeo en modelos generativos de mundo, gracias a su condicionamiento por historial y acciones.
- Creación de demos y material de marketing: generación rápida de clips en primera persona con audio para presentar conceptos de producto o narrativas, partiendo de imágenes de referencia y prompts estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La demo de referencia se ha validado en seis GPU H100: una para el codificador de texto, una para los VAEs de vídeo y audio, y cuatro para el DiT con paralelismo de secuencia.
- El repositorio ocupa 66,9 GB, por lo que se requiere almacenamiento considerable además de la caché de Hugging Face (configurable con `HF_HOME`).
- Entorno validado: Python 3.12, Torch 2.13.0+cu130, torchvision 0.28.0+cu130, Triton 3.7.1, FlashAttention-4 4.0.0b26 y SGLang kernel 0.4.7+cu130 (índice de wheels CUDA 13).
- Runtime SGLang en el commit `95140a7b0c9fc2f87a2a6cf6f6f0df8640a73174`, con la revisión de Diffusers fijada en `requirements.txt`.
- No se dispone de información sobre VRAM estimada por cuantización, latencia ni throughput; no hay datos publicados sobre ejecución en GPU de consumo.
- Opciones de despliegue documentadas: script `demo_bidirection.py` y `demo.sh` del repositorio, con soporte de SGLang para el runtime de difusión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XGEN-JING (JING-Flash-v1) | no disponible | no disponible | Vídeo + audio egocéntrico, control de cámara, condicionamiento por referencia | minimax-h3-community-license-agreement | Pesos en Hugging Face, código en GitHub |
| MiniMax-H3 (Ref2VA) | no disponible | no disponible | Vídeo + audio (modelo base) | licencia MiniMax-H3 | Pesos en Hugging Face |
| FlashGen (LoRA sobre MiniMax-H3) | no disponible | no disponible | Aceleración de inferencia en 4 pasos | no disponible | Pesos en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La versión publicada es bidireccional; el modelo causal, necesario para aplicaciones interactivas en tiempo real, está anunciado pero no disponible.
- Solo soporta inglés y chino; no hay soporte documentado de otros idiomas.
- La licencia es la "minimax-h3-community-license-agreement", que impone restricciones adicionales al uso comercial; es necesario revisar el texto de la licencia antes de cualquier despliegue en producción.
- El modelo base es MiniMax-H3, por lo que hereda los sesgos y limitaciones de sus datos de entrenamiento, no documentados en la información disponible.
- Riesgo de alucinación visual y de inconsistencia temporal en secuencias largas, habitual en modelos de difusión de vídeo; no se han publicado métricas de coherencia.
- Los requisitos de hardware son elevados (seis H100 en la configuración validada), lo que limita su uso a entornos con infraestructura especializada.
- No se dispone de información sobre cuantizaciones, latencia ni throughput, lo que dificulta planificar despliegues con requisitos de tiempo real.
- El tamaño del repositorio (66,9 GB) y la dependencia de versiones específicas de CUDA, Torch y SGLang añaden complejidad operativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XGENlabs/XGEN-JING
- Repositorio GitHub: https://github.com/XGEN-Labs/XGEN-JING
- Informe técnico (arXiv): https://arxiv.org/abs/2610.19726
- Galería: https://xgenlabs.ai/gallery.html
- Blog de XGEN Labs: https://xgenlabs.ai/research.html
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio MiniMax-H3 en GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- LoRA FlashGen: https://huggingface.co/Beidouqixing/minimax-h3-4step-lora-flashgen
- Habilidades de prompt: https://github.com/XGEN-Labs/XGEN-JING/blob/main/prompt_skills/SKILL.md
- Ejemplo de caso (bakery): https://github.com/XGEN-Labs/XGEN-JING/blob/main/examples/bakery_greeting.json
- Configuración base: https://github.com/XGEN-Labs/XGEN-JING/blob/main/configs/base.yaml
- SGLang (commit validado): https://github.com/sgl-project/sglang/tree/95140a7b0c9fc2f87a2a6cf6f6f0df8640a73174
- Índice de wheels CUDA 13 de SGLang: https://sgl-project.github.io/whl/cu130/sglang-kernel/

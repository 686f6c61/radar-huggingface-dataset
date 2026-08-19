# unsloth/MiniMax-H3-FP8

## Resumen

MiniMax-H3 es un sistema generativo omni-modal desarrollado por MiniMax que produce vídeo con audio estéreo nativo, hasta 15 segundos a 24 FPS con audio de 32 kHz. El modelo acepta texto, imágenes o una combinación de ambos, y en su variante omni-reference (`ref2va`) puede tomar hasta doce referencias de imagen, vídeo y audio. Esta ficha cubre la versión cuantizada publicada por Unsloth, que ofrece checkpoints pre-cuantizados en FP8 e INT8 para su uso con diffusers y torchao, reduciendo el pico de memoria de inferencia de 57.11 GB a 36.97 GB frente al original en bf16.

La relevancia de esta versión radica en que permite ejecutar el modelo en hardware más accesible sin necesidad de cuantizar manualmente, manteniendo una fidelidad visual alta (SSIM de 0.92 para INT8 y 0.88 para FP8 frente a la versión bf16). El repositorio incluye dos particiones de pesos separadas (`fl2va` para keyframes y texto, y `ref2va` para referencias múltiples), cada una con sus propios checkpoints cuantizados. El proyecto es de código abierto bajo una licencia comunitaria específica de MiniMax.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video con audio (omni-modal), no se especifica el tipo de backbone |
| Parametros totales | No disponible (los checkpoints cuantizados pesan ~18.86 GiB cada uno) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (generacion de video, no texto) |
| Tipos de cuantizacion | FP8 (e4m3) e INT8 simetrico, con variante INT8 con rotacion Hadamard (ConvRot) |
| Idiomas soportados | Ingles, chino |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | PyTorch (.pt), pre-cuantizado para torchao |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion disponible, pero se trata de un modelo de difusion que genera video y audio de forma conjunta. El sistema se compone de dos particiones de denoiser: `fl2va` (first-and-last-frame) que genera video a partir de texto o de una o dos imagenes clave, y `ref2va` (omni-reference) que acepta un prompt mas hasta doce referencias de imagen, video o audio. Ambas particiones comparten la misma configuracion y estado de diccionario de 635 claves.

La cuantizacion realizada por Unsloth afecta a 200 matmuls del bloque principal (95.8% de los parametros), dejando intactos los sesgos 1-D, los gains y la ruta de modulacion adaLN. Se utilizan escalas absmax por canal de salida, con FP8 e4m3 e INT8 simetrico. La version INT8-ConvRot almacena los pesos en una base rotada Hadamard (grupo de 256) y requiere que el loader rote las activaciones correspondientes. No se proporcionan datos sobre el entrenamiento original del modelo base.

## Capacidades

- Generacion de video con audio estéreo nativo: el audio se genera conjuntamente con el video, no se anade posteriormente.
- Generacion de video a partir de texto, imagen o combinacion de ambos (variante `fl2va`).
- Generacion con referencias multiples: hasta 12 entradas de imagen, video o audio mas un prompt (variante `ref2va`).
- Soporte de resoluciones hasta 960x544 y duracion de hasta 15 segundos a 24 FPS.
- Cuantizacion FP8 e INT8 lista para usar con diffusers y torchao, sin necesidad de cuantizacion manual.
- Compatible con `torch.compile` en la version INT8 para mejor rendimiento.

## Casos de uso

- Creacion de contenido audiovisual para redes sociales: generar clips cortos con audio sincronizado a partir de prompts de texto, ideal para prototipos rapidos.
- Produccion de video con referencias visuales: usar la variante `ref2va` para mantener consistencia de personajes o escenarios proporcionando varias imagenes o videos de referencia.
- Generacion de efectos visuales para presentaciones o demos: crear secuencias de video con audio para ilustrar conceptos sin necesidad de equipos de produccion.
- Desarrollo de herramientas de asistencia creativa: integrar el modelo en aplicaciones de diseño o narracion visual donde el usuario describe una escena y recibe un clip con sonido.
- Investigacion en generacion multimodal: estudiar la coherencia entre video y audio generados conjuntamente, o evaluar el impacto de la cuantizacion en la calidad perceptiva.
- Despliegue en entornos con recursos limitados: gracias a la cuantizacion FP8/INT8, ejecutar el modelo en GPUs con menos VRAM que las necesarias para la version bf16, manteniendo una calidad aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. La model card incluye metricas de divergencia entre las versiones cuantizadas y la bf16 original (SSIM, con un maximo de 1.00 para la version bf16 reproducida dos veces):

| Version | SSIM (prompt 1) | SSIM (prompt 2) |
|---|---|---|
| INT8 | 0.92 | 0.82 |
| FP8 | 0.88 | 0.78 |

Estos valores miden la similitud estructural entre las salidas cuantizadas y la de referencia bf16, no la calidad absoluta. Se indica que la version INT8 con `torch.compile` es preferible, mientras que FP8 funciona bien sin el.

## Requisitos de hardware

- VRAM estimada: el pico de memoria de inferencia se reduce de 57.11 GB (bf16) a 36.97 GB con las versiones cuantizadas, por lo que se necesita al menos una GPU con 40 GB de VRAM para ejecutar el modelo completo.
- GPU recomendadas: NVIDIA B200 (probada en el blog de Unsloth, con reduccion de 70+ a 13 segundos para una generacion de 960x544, 124 frames, 8 steps), tambien GPUs con 48 GB o mas como A6000, L40S, o RTX 4090 con 24 GB podrian ser insuficientes para el modelo completo, aunque se podria intentar con particiones.
- No cabe en GPUs de consumo de gama media (8-16 GB) debido al tamano de los pesos (~18.86 GiB por checkpoint).
- Opciones de despliegue: diffusers con torchao, compatible con `torch.compile`. No se menciona soporte para vLLM, llama.cpp u Ollama; la model card advierte que stable-diffusion.cpp no puede cargar estos pesos por su ruta int8.
- Latencia: en una B200, una generacion de 960x544, 124 frames, 8 steps tarda 13 segundos con FP8. En hardware inferior, el tiempo sera mayor.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (generacion de video con audio nativo) en los datos proporcionados. No disponible.

## Limitaciones y advertencias

- Licencia comunitaria de MiniMax: debe revisarse el acuerdo para uso comercial; no es una licencia open source estandar.
- Riesgo de alucinacion visual o incoherencias en escenas complejas, comun en modelos de generacion de video.
- Limitacion de idiomas: solo ingles y chino, sin soporte multilingue amplio.
- La variante `ref2va` requiere cargar la particion correcta; usar una particion equivocada genera resultados incorrectos sin error, ya que los pesos cargan pero no corresponden.
- La version INT8-ConvRot necesita un loader compatible que aplique la rotacion Hadamard; cargadores antiguos pueden rechazarla o leerla incorrectamente.
- No se garantiza la reproducibilidad exacta entre versiones cuantizadas y bf16; las diferencias son medibles (SSIM 0.78-0.92).
- El modelo no esta pensado para generacion de texto; es exclusivamente para video y audio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unsloth/MiniMax-H3-FP8
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- GitHub de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Blog de Unsloth sobre rendimiento: https://unsloth.ai/blog (se menciona en la documentacion de Unsloth Desktop)
- Documentacion de Unsloth Desktop: https://unsloth.ai/docs/desktop

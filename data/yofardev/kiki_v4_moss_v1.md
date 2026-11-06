# Yofardev/kiki_v4_moss_v1

## Resumen

kiki_v4_moss_v1 es un adaptador LoRA de estilo (concretamente un LoKr) entrenado por el usuario Yofardev sobre el modelo base MOSS-Image-Base en precisión bf16, sin pasar por la fase SFT. Su objetivo es replicar la estética visual de la película *Nicky, la aprendiz de bruja* (Studio Ghibli) a partir de un dataset propio de 56 imágenes denominado Kiki v4. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un peso auxiliar que debe combinarse con el modelo base para generar imágenes con ese estilo concreto.

El adaptador emplea la técnica LoKr (Kronecker-factored LoRA) en configuración full-rank, con dimensión lineal 32, alpha 32 y factor 4. Se entrenó durante 2000 pasos con un batch de 2 y buckets mixtos de 512, 768 y 1024 píxeles, guardando checkpoints cada 250 pasos. El autor espera que el punto óptimo de equilibrio entre fidelidad de estilo y flexibilidad se encuentre entre los pasos 750 y 1500, aunque el checkpoint final publicado corresponde a los 2000 pasos.

La relevancia de esta ficha es limitada pero concreta: sirve para quien quiera reproducir un estilo Ghibli específico sobre MOSS-Image sin entrenar desde cero, y para quien necesite entender las diferencias entre esta versión v4 y la anterior (kiki_moss_v1), que usaba una base SFT en int8, factor 8 y 4750 pasos. El repositorio ocupa 4,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoKr (LoRA con factorización de Kronecker) sobre MOSS-Image-Base |
| Parametros totales | no disponible (peso del adaptador: 4,8 GB en el repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors, el base en bf16 |
| Idiomas soportados | no disponible (modelo de imagen; las etiquetas de entrenamiento están en inglés) |
| Licencia | other |
| Formato de pesos | safetensors (`kiki_moss_v1.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoKr full-rank con dimensión lineal 32, alpha 32 y factor de Kronecker 4, aplicado sobre MOSS-Image-Base en bf16 (base sin SFT). La receta de entrenamiento se etiqueta como "style" con sesgo hacia ruido alto (high-noise bias), muestreo de timesteps sigmoideo y configuración automagic3. Se usó una tasa de aprendizaje de 1e-4 con mínimo de 3e-5 y EMA de 0,98. El entrenamiento constó de 2000 pasos con batch 2 y buckets mixtos de 512, 768 y 1024 píxeles, con checkpoints cada 250 pasos.

El dataset Kiki v4 contiene 56 imágenes y todas las captions de entrenamiento llevan anexado el ancla de estilo `Studio Ghibli style`, que actúa como trigger. No se documentan número de tokens, composición del dataset ni fases de RLHF o DPO, algo esperable en un adaptador de estilo visual. La innovación técnica destacable es el uso de LoKr en lugar de LoRA estándar, lo que reduce el número de parámetros del adaptador manteniendo rango completo, y la decisión de entrenar sobre la base sin SFT para evitar arrastrar sesgos del ajuste supervisado.

## Capacidades

- Generación de imágenes con estética Studio Ghibli (concretamente la de *Nicky, la aprendiz de bruja*) al aplicar el trigger `Studio Ghibli style`.
- Transferencia de estilo sobre el modelo base MOSS-Image-Base; no genera texto ni código.
- Compatible con el pipeline de inferencia de MOSS-Image (no se detalla la herramienta exacta en la información disponible).
- El trigger debe anexarse a la caption en inferencia, tal como se hizo en entrenamiento.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües declaradas; las captions de entrenamiento están en inglés.
- No dispone de modo thinking, visión, audio ni otras capacidades especiales más allá del estilo visual.

## Casos de uso

- Ilustración de estilo Ghibli para proyectos personales: aplicar el trigger `Studio Ghibli style` sobre MOSS-Image-Base para generar escenas con la paleta y el trazo característicos de la película, útil para fan art o prototipos visuales.
- Pruebas de concepto de transferencia de estilo: comparar esta versión v4 (base bf16, 2000 pasos) con la anterior kiki_moss_v1 (base SFT int8, 4750 pasos) para evaluar cómo afecta la base y el número de pasos al resultado final.
- Generación de storyboards con estética concreta: usar el adaptador para producir viñetas coherentes con un look Ghibli en fases de preproducción, aprovechando los buckets 512/768/1024 para distintas relaciones de aspecto.
- Investigación sobre LoKr vs LoRA: el adaptador sirve como caso de estudio de LoKr full-rank con factor 4 y receta "style" con high-noise bias, comparable con otras configuraciones publicadas por el mismo autor.
- Fine-tuning de estilo sobre modelos de imagen: punto de partida para quien quiera replicar la receta (sigmoid timesteps, automagic3, EMA 0,98, lr 1e-4) sobre su propio dataset y modelo base.
- Evaluación de checkpoints intermedios: los checkpoints cada 250 pasos permiten estudiar la evolución del estilo y localizar el sweet spot entre 750 y 1500 pasos, tal como sugiere el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base MOSS-Image-Base y de su precisión (bf16 en el caso de esta receta).
- GPU recomendadas: no disponible; el autor no especifica hardware de entrenamiento ni de inferencia.
- Viabilidad en GPU de consumo: no disponible; el repo del adaptador ocupa 4,8 GB, pero el requisito real lo marca el modelo base, cuyo tamaño no se detalla.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con herramientas de difusión como ComfyUI o diffusers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Técnica | Factor | Pasos | Precisión base | Trigger | Licencia |
|---|---|---|---|---|---|---|---|
| kiki_v4_moss_v1 (este) | MOSS-Image-Base (sin SFT) | LoKr full-rank | 4 | 2000 | bf16 | `Studio Ghibli style` | other |
| Yofardev/kiki_moss_v1 | MOSS-Image (SFT) | LoKr | 8 | 4750 | int8 | `Studio Ghibli style` | other |
| Yofardev/yofardev_moss_v1 | MOSS-Image (SFT) | LoKr | 4 | 2750 | int8 | sin trigger | other |

La comparativa se limita a los adaptadores publicados por el mismo autor, ya que no se dispone de información sobre alternativas de terceros con la misma base o el mismo estilo. Las diferencias clave entre las tres versiones son la base (bf16 sin SFT frente a int8 con SFT), el factor de Kronecker (4 frente a 8) y el número de pasos (2000, 2750 y 4750).

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (56 imágenes), lo que puede provocar sobreajuste al estilo y escasa variedad en las composiciones generadas.
- Riesgo de que el trigger `Studio Ghibli style` contamine otras indicaciones y fuerce el estilo incluso cuando no se desee.
- La licencia es "other" y no se detallan los términos; es imprescindible revisar las condiciones antes de cualquier uso comercial, especialmente por la referencia a una obra y un estudio con derechos de autor.
- El adaptador no es autónomo: requiere el modelo base MOSS-Image-Base, cuyas condiciones de licencia y disponibilidad no se detallan en la información proporcionada.
- No se documentan sesgos conocidos, idiomas soportados ni evaluación cualitativa del resultado.
- El checkpoint final corresponde a 2000 pasos, por encima del sweet spot esperado (750-1500), por lo que puede presentar sobreajuste respecto a checkpoints intermedios.
- No hay métricas objetivas (FID, CLIP score, similitud de estilo) que permitan validar la calidad del adaptador.
- El repositorio no registra descargas ni likes, lo que dificulta la validación por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Yofardev/kiki_v4_moss_v1
- Versión anterior (kiki_moss_v1): https://huggingface.co/Yofardev/kiki_moss_v1
- Adaptador personal sin trigger (yofardev_moss_v1): https://huggingface.co/Yofardev/yofardev_moss_v1
- Modelo base MOSS-Image-Base: no disponible en la información proporcionada
- Paper de LoKr: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada

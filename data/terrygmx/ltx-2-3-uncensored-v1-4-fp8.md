# Terrygmx/LTX-2.3-uncensored-v1.4-FP8

## Resumen

LTX-2.3-uncensored-v1.4-FP8 es un modelo de generación de vídeo basado en el Diffusion Transformer (DiT) de Lightricks, adaptado por Terrygmx con tres LoRAs fusionadas en los pesos: Eros10 (especializado en contenido NSFW de alta calidad), DMD distilled (para generación en pocos pasos y mejor seguimiento de instrucciones) e ICLoRA Detailer (para adherencia a imágenes de referencia). El resultado es un modelo "uncensored" que elimina los filtros de seguridad del modelo original, permitiendo generar contenido explícito para adultos, aunque mantiene guardarraíles contra contenido ilegal.

El modelo se distribuye en formato GGUF cuantizado a FP8, con un total de 21 005 millones de parámetros y un tamaño de repositorio de 239 GB. Soporta múltiples modos de entrada: texto a vídeo, imagen a vídeo, vídeo a vídeo, audio a vídeo y referencia a vídeo. Puede generar secuencias de hasta 960 fotogramas (aproximadamente 40 segundos) con tan solo 4-8 pasos de inferencia, lo que lo hace notablemente rápido para su categoría. Su relevancia radica en ofrecer una alternativa abierta y sin restricciones a modelos comerciales de vídeo, con calidad comparable a sistemas cerrados como Google Veo 3, según la documentación del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) |
| Parametros totales | 21 005 004 544 (21,0 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (genera hasta 960 fotogramas) |
| Tipos de cuantizacion | FP8 (GGUF) |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos) |
| Licencia | unknown |
| Formato de pesos | GGUF (cuantizacion FP8) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LTX-2.3 de Lightricks, un Diffusion Transformer (DiT) diseñado para generación de vídeo de alta calidad. La versión "uncensored" parte del checkpoint base Lightricks/LTX-2.3 y fusiona tres adaptaciones: la LoRA Eros10 (entrenada para contenido NSFW con énfasis en coherencia y calidad visual), la LoRA DMD distilled (que reduce los pasos de inferencia de 30-50 a 4-8 manteniendo la calidad y mejorando la preservación facial en image-to-video) y la ICLoRA Detailer oficial de LTX (para mejorar la adherencia a imágenes de referencia). El proceso de fusión se realizó con una fuerza de 1.0 para las dos primeras y 0.6 para la tercera, según la documentación del autor.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El modelo base LTX-2.3 fue entrenado por Lightricks con datos comerciales de vídeo, pero los detalles específicos no se han publicado en la información disponible. La versión destilada (DMD) se entrenó mediante destilación de modelo distribuido, lo que explica la reducción drástica de pasos necesarios.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con prompts complejos que incluyen movimiento, iluminación, sonido y estilo cinematográfico.
- Generación de vídeo a partir de imagen (image-to-video), preservando la identidad del sujeto y permitiendo animar una imagen fija.
- Generación de vídeo a partir de vídeo (video-to-video) y de audio (audio-to-video), con sincronización de sonido y diálogo.
- Generación de secuencias largas de hasta 960 fotogramas (unos 40 segundos) con coherencia temporal y consistencia de personaje.
- Inferencia rápida: funciona con 4 pasos (mínimo) y 8 pasos (recomendado), gracias a la LoRA DMD destilada.
- Control de estilo mediante el parámetro CFG: valores bajos (1.0) producen movimientos lentos y sensuales; valores altos (3.8) generan escenas de acción con diálogo y sonido.
- Contenido NSFW explícito para adultos, sin filtros de moderación (excepto contenido ilegal).
- Soporte de múltiples modos de entrada: FL2VA, T2VA, I2VA, REF2VA y audio-to-video.

## Casos de uso

- Producción de contenido para adultos: el modelo permite generar vídeos explícitos personalizados a partir de descripciones textuales o imágenes de referencia, con control sobre la pose, el movimiento y la ambientación. Es adecuado para creadores independientes que necesitan material sin restricciones de plataformas cerradas.
- Prototipado de escenas cinematográficas: directores y guionistas pueden generar storyboards animados de alta calidad a partir de guiones, probando diferentes encuadres, iluminación y ritmo antes de la producción real. La capacidad de generar 40 segundos de vídeo coherente facilita la visualización de secuencias completas.
- Creación de vídeos musicales y arte generativo: artistas pueden combinar audio-to-video para sincronizar visuales con pistas de música, o usar image-to-video para animar ilustraciones y fotografías con estilos variados.
- Generación de contenido educativo y divulgativo: aunque el modelo está orientado a NSFW, su capacidad de seguir instrucciones complejas permite crear vídeos explicativos animados, demostraciones de procesos o simulaciones visuales para cursos y tutoriales.
- Restauración y animación de material histórico: mediante video-to-video, se pueden animar fotografías o vídeos antiguos, añadiendo movimiento y sonido, preservando la identidad de los sujetos gracias a la ICLoRA Detailer.
- Investigación en generación de vídeo sin censura: el modelo sirve como banco de pruebas para estudiar los límites de los modelos generativos, la eliminación de filtros de seguridad y el impacto de la destilación en la calidad, en entornos académicos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación del autor menciona que la calidad es comparable a Google Veo 3, pero no se aportan métricas cuantitativas (FVD, CLIP score, etc.) ni comparaciones formales con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 21 000 millones de parámetros en FP8, el checkpoint ocupa aproximadamente 21 GB en memoria. Para generar vídeos de alta resolución (1280×736) con 121 fotogramas, se recomienda al menos 24 GB de VRAM, aunque el uso de cuantización GGUF puede reducir el requisito a unos 16-20 GB dependiendo de la resolución y el número de fotogramas.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para pruebas locales; para producción a mayor escala, A100 (40/80 GB) o H100 (80 GB) permiten generar secuencias más largas y con mayor resolución sin intercambio de memoria.
- En consumer GPU: sí, cabe en una RTX 4090 o RTX 3090 (24 GB) con cuantización FP8, pero la generación de 960 fotogramas puede requerir más memoria o dividirse en segmentos.
- Opciones de despliegue: al ser GGUF, se puede ejecutar con llama.cpp, Ollama o herramientas específicas de vídeo como ComfyUI (el autor proporciona flujos de trabajo). También es compatible con vLLM y TGI si se convierten los pesos a safetensors, aunque no se documenta explícitamente.
- Latencia y throughput: no se proporcionan datos oficiales. Con 8 pasos y CFG 3.5, la generación de 121 fotogramas a 1280×736 puede tardar entre 1 y 3 minutos en una RTX 4090, según estimaciones basadas en modelos similares de tamaño comparable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/duracion | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LTX-2.3-uncensored-v1.4-FP8 (este) | 21 B | hasta 40 s (960 frames) | unknown | GGUF FP8 | NSFW, destilado, multi-modal |
| Lightricks/LTX-2.3 (base) | 21 B | hasta 40 s | open (según ltx.io) | safetensors | Con filtros de seguridad, requiere más pasos |
| Google Veo 3 (comercial) | no disponible | hasta 60 s | propietaria | API | Calidad similar, pero cerrado y con moderación |

No se dispone de datos de rendimiento comparativos publicados. La comparación con Veo 3 se basa en afirmaciones del proyecto LTX-2.3, no en benchmarks verificados.

## Limitaciones y advertencias

- Contenido NSFW explícito: el modelo está diseñado para generar material para adultos sin filtros. Su uso en entornos públicos o comerciales puede violar políticas de plataformas y leyes locales. El autor indica que hay guardarraíles contra contenido ilegal, pero no se especifica su alcance.
- Licencia desconocida: la licencia figura como "unknown", lo que genera incertidumbre legal sobre el uso comercial, la redistribución y la modificación. No se recomienda su uso en producción sin asesoramiento legal.
- Riesgo de alucinaciones visuales: como todo modelo generativo, puede producir artefactos, inconsistencias en la anatomía o movimientos no naturales, especialmente en secuencias largas o con prompts complejos.
- Sesgos y representación: al estar entrenado con datos no filtrados, puede perpetuar estereotipos de género, raza o cuerpo, y generar representaciones problemáticas. No se han realizado evaluaciones de sesgo.
- Requisitos de hardware elevados: aunque cabe en GPUs de 24 GB, la generación de vídeos largos (40 s) puede agotar la memoria y requerir optimizaciones adicionales.
- Sin soporte oficial: el modelo es un fine-tune comunitario sin mantenimiento garantizado. Los cambios en el ecosistema de LTX pueden romper la compatibilidad.
- Fecha de creación futura: el modelo está fechado en agosto de 2026, lo que sugiere que es una versión reciente y posiblemente inestable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Terrygmx/LTX-2.3-uncensored-v1.4-FP8
- Modelo base Lightricks/LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Página oficial de LTX-2.3: https://ltx.io/model/ltx-2-3
- Guía técnica sobre LTX 2.3 uncensored: https://ltx23.video/blog/ltx-2-3-uncensored
- Repositorio GitHub de LTX-2.3: https://github.com/desktop-LTX/LTX-2.3
- Repositorio del autor original de la versión FP8: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-v1.4-fp8

# tazmannner/Dispatch-H3-LoRA

## Resumen

Dispatch-H3-LoRA (identificador interno `DISPATCH_H3_V21_REF`) es un LoRA de rango 16 para el modelo de generación de vídeo MiniMax H3, desarrollado por el usuario de Hugging Face `tazmannner`. Su objetivo es transferir a H3 el estilo visual 3D cel-shaded tipo cómic y el reparto de personajes del videojuego *Dispatch*, a partir de 589 clips de cinemáticas y 777 imágenes fijas extraídas del propio juego. No es un modelo base, sino un adaptador que se carga sobre H3 en modo text-to-video y que requiere, además, hojas de personaje y referencias de voz para reproducir fielmente a los personajes.

El adaptador se entrenó sobre la variante Ref2VA de H3 (podada, int8 ConvRot) en modo text-to-video puro, sin capas de audio, durante 5.772 pasos (unas 8,4 épocas) en una única RTX 5090 a lo largo de aproximadamente 16,7 horas. El checkpoint recomendado es el paso 4200, que según el autor sigue mejor la acción y mantiene vestuarios limpios; se ofrecen dos alternativas (3900 y 4500) como respaldo.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de *fine-tuning* de un modelo de vídeo con un pipeline de datos completamente reproducible (detección de planos, etiquetado con Gemini, balanceo por presencia de personajes, medición de movimiento de cámara con ORB+RANSAC y captioning visual); por otro, ilustra las limitaciones típicas de los LoRA de estilo entrenados sobre material con derechos de autor, con licencia no declarada y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de difusión de MiniMax H3 Ref2VA |
| Parametros totales | no disponible (rango 16, alpha 16, targets `attention;mlp`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clips de 41–73 frames a 24 fps; H3 recorta a rejilla 17k+5) |
| Tipos de cuantizacion | el LoRA se distribuye en safetensors; el modelo base se usa en versión podada int8 ConvRot |
| Idiomas soportados | no disponible (los prompts del ejemplo están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (3 checkpoints: pasos 3900, 4200, 4500) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre el modelo base MiniMax H3 en su variante Ref2VA, podada y cuantizada a int8 con ConvRot, y se entrenó en modo text-to-video (sin audio). El adaptador tiene rango 16 y alpha 16, y ataca las capas de atención y MLP (`attention;mlp`), excluyendo explícitamente las capas de audio. El entrenamiento se realizó sobre 589 clips de 1920×1080 a 24 fps con 41–73 frames y 777 imágenes fijas en PNG, con un conjunto de validación de 38 clips y 38 imágenes reservado por grupos completos de planos duplicados para evitar fugas. Se ejecutaron 5.772 pasos (unas 8,4 épocas) en una RTX 5090 durante aproximadamente 16,7 horas.

El pipeline de datos es parte central del trabajo: detección de cortes con puntuaciones de escena de ffmpeg y umbral doble, etiquetado de personajes con Gemini flash-lite sobre tiras de contactos (3.285 planos por 3,67 USD), agrupación de casi duplicados y selección voraz balanceada por presencia de personaje, medición real de movimiento de cámara mediante características ORB y RANSAC entre frames k y k+3, y captioning visual con Gemini (gemini-3.8-flash para planos con tres o más personas). Los subtítulos en pantalla se citan literalmente, los nombres solo aparecen entre comillas y en el resto se usan etiquetas (`char_rr`, `char_invisi`, etc.). El reparto está desbalanceado: Robert acapara el 43% de los ítems de entrenamiento, mientras que Waterboy solo el 6%.

## Capacidades

- Generación de vídeo text-to-video con estética 3D cel-shaded tipo cómic y el estilo visual de *Dispatch*.
- Reproducción del reparto del juego (14 personajes etiquetados: Robert, Invisigal, Malevola, Prism, Blonde Blazer, Punch Up, Flambae, Coupé, Golem, Sonar, Royd, Chase, Phenomaman y Waterboy), con soporte para planos individuales y de grupo.
- Transferencia de vestuario y rasgos mediante hojas de personaje pasadas como referencias de imagen al modelo base Ref2VA.
- Referencia de voz por hablante mediante clips de audio pasados como referencias al modelo base (el LoRA en sí no entrena audio).
- Activación de estilo mediante el trigger textual `Stylized 3D cel-shaded comic style, Dispatch style,`.
- Descripción de movimiento de cámara (estático, paneo, acercamiento) aprendida de mediciones reales, no de etiquetas inferidas.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un adaptador generativo de vídeo, no un modelo de lenguaje.

## Casos de uso

- Producción de fan films o cortos derivados de *Dispatch*: el LoRA reproduce el look cel-shaded y el reparto con hojas de personaje como referencia, lo que permite generar escenas nuevas coherentes con la estética del juego.
- Previsualización de animáticas estilizadas: para estudios que trabajen en 3D cel-shaded, el adaptador sirve como referencia rápida de composición, encuadre y movimiento de cámara antes de producir en 3D real.
- Generación de contenido promocional o parodia: creación de clips cortos con los personajes del juego para vídeos de comunidad, siempre que se resuelva la situación legal del material original.
- Investigación en *fine-tuning* de modelos de vídeo: el pipeline documentado (detección de planos, etiquetado automático, balanceo por presencia, medición de cámara) es reutilizable para entrenar LoRA de estilo sobre otras franquicias o IP propias.
- Pruebas de consistencia de personaje en generación de vídeo: útil para evaluar hasta qué punto un LoRA de rango 16 con 589 clips puede mantener vestuario y rasgos entre planos.
- Docencia y divulgación sobre adaptadores de bajo rango: caso concreto de cómo un LoRA de ~1 GB puede modificar el estilo de un modelo de vídeo grande sin reentrenarlo.
- Generación de *showreels* técnicos: el propio autor publica un showreel de 15 escenas con el checkpoint 4200, útil como referencia de calidad alcanzable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta comparaciones cualitativas entre checkpoints (4200 sigue mejor la acción y mantiene vestuarios más limpios; 3900 y 4500 son alternativas más rígidas o similares) y datos de entrenamiento (5.772 pasos, ~8,4 épocas, ~16,7 h en RTX 5090).

## Requisitos de hardware

- VRAM estimada para el LoRA: ~1 GB en disco (tamaño del repo); en VRAM, el adaptador en sí ocupa una fracción pequeña, pero el modelo base H3 Ref2VA podado int8 es el que domina el consumo.
- GPU recomendadas: el autor entrenó en una RTX 5090; para inferencia se necesita una GPU con VRAM suficiente para H3 Ref2VA int8 (no especificada en la información disponible). Se recomienda como mínimo una GPU de gama alta con 24 GB o más, y para producción, A100/H100.
- Cabe en GPU de consumo: sí, al menos en RTX 5090 según la experiencia del autor; no hay datos para GPUs de 16 GB o menos.
- Opciones de despliegue: ComfyUI (librería declarada), cargando el LoRA en `ComfyUI/models/loras/` sobre el modelo `minimax_h3_ref2va_pruned_int8_convrot` a fuerza 1.0.
- Latencia y throughput: no disponibles. El autor menciona un acabado posterior con Relay Hires y RealESRGAN x2, pero sin cifras de tiempo por clip.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros LoRA de estilo para H3 ni de adaptadores comparables en la información suministrada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada: el autor indica explícitamente que no posee los derechos del material original (*Dispatch*), por lo que el uso comercial del LoRA y de sus salidas es legalmente arriesgado y no está cubierto por una licencia clara.
- Sesgo de reparto: Robert aparece en el 43% de los ítems de entrenamiento, mientras que Waterboy solo en el 6%; los personajes minoritarios pueden generar peor calidad o derivar hacia otros.
- Shroud, el villano enmascarado, está en los datos pero no etiquetado: se describe de forma genérica (máscara metálica roja, capucha) y nunca se le nombra, lo que limita su control fino.
- Dependencia de referencias externas: el LoRA aporta el estilo, pero los vestuarios y las voces dependen de las hojas de personaje y clips de voz del repositorio; sin ellos, la fidelidad cae.
- Entrenado solo en modo text-to-video y sin audio: no mejora la generación de audio ni el modo reference-to-video del modelo base, pese a la etiqueta `reference-to-video` del repo.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir anatomías inconsistentes, texto en pantalla ilegible o vestuarios que derivan entre planos.
- Idiomas: no hay información sobre soporte multilingüe; los ejemplos y captions están en inglés.
- Sin benchmarks: no hay métricas objetivas de calidad, consistencia temporal ni fidelidad de personaje, solo evaluación cualitativa del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tazmannner/Dispatch-H3-LoRA
- Showreel (dentro del repo): https://huggingface.co/tazmannner/Dispatch-H3-LoRA/resolve/main/media/showreel.mp4
- Checkpoint recomendado: `DISPATCH_H3_V21_REF-step00004200_recommended.safetensors` (en el repositorio)
- Modelo base referenciado: `minimax_h3_ref2va_pruned_int8_convrot` (MiniMax H3 Ref2VA, pruned int8 ConvRot)
- No se han encontrado en la búsqueda web papers, blogs ni repositorios adicionales asociados a este LoRA.

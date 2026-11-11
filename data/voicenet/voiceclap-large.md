# VoiceNet/voiceclap-large

## Resumen

VoiceCLAP-Large es un modelo de embeddings contrastivos voz-texto desarrollado por VoiceNet. Se trata de un finetune mediante LoRA de rango 16 sobre LCO-Embedding-Omni-7B, cuyo backbone es Qwen2.5-Omni-Thinker-7B con una cabeza de pooling de último token al estilo sentence-transformers. El modelo es de torre única: tanto los embeddings de audio como los de texto los produce el mismo backbone, y la modalidad viene determinada por lo que se introduce a través de la plantilla de chat multimodal. Genera embeddings conjuntos de 3.584 dimensiones, normalizados en L2.

El problema que resuelve es la recuperación y comparación semántica entre audio de voz y descripciones textuales, incluyendo atributos de estilo vocal, emoción y demografía. Frente a los enfoques CLAP clásicos de dos torres, aquí se unifica el espacio latente en un solo modelo multimodal de 7B, lo que permite reutilizar las capacidades del backbone Omni para procesar tanto habla como texto.

Es relevante por su carácter abierto (licencia CC-BY-4.0) y porque se publica junto con el paper VoiceNet y el mixture de datos `voiceclap_10_safe`. Con 8.931.813.888 parámetros y un repositorio de 36 GB, está orientado a extracción de características y aplicaciones de búsqueda, clasificación y filtrado de voz por descripción textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | single-tower Omni-Embedding (Qwen2.5-Omni-Thinker-7B + ST last-token-pool) |
| Parametros totales | 8.931.813.888 (~7B en el modelo fusionado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (modelo fusionado) + adaptador LoRA en `adapter/` |
| Dimension del embedding | 3.584-d, normalizado en L2 |
| Loss de entrenamiento | InfoNCE simétrico con negativos all-gather |
| Adaptacion | LoRA rango 16 (alpha 32, dropout 0.05), fusionada en los pesos publicados |
| Epocas de entrenamiento | 1 |
| Libreria | sentence-transformers |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo parte de LCO-Embedding-Omni-7B, que a su vez se construye sobre el backbone Qwen2.5-Omni-Thinker-7B con una cabeza de pooling de último token propia de sentence-transformers. Sobre esa base se aplica un LoRA de rango 16 (alpha 32, dropout 0.05) que se fusiona en los pesos finales publicados en `model.safetensors`. La arquitectura es de torre única: no hay dos encoders separados para audio y texto, sino que el mismo backbone procesa ambas modalidades según lo que se le pase a través de la plantilla de chat multimodal. El resultado es un embedding conjunto de 3.584 dimensiones normalizado en L2.

El entrenamiento se realizó durante una sola época sobre el mixture abierto `voiceclap_10_safe`, compuesto por nueve datasets: `emolia-balanced-5M-subset` (subconjunto anotado de Emilia), `laions_got_talent_clean_with_captions`, `majestrino-data`, `synthetic_vocal_bursts`, `improved_synthetic_vocal_bursts`, `ears`, `expresso`, `voxceleb1` y `voxceleb2`. Todos los clips se anotaron con descripciones densas de estilo vocal derivadas de MOSS-Audio-8B-Thinking, cubriendo emociones, atributos de estilo de habla y demografía. La función de pérdida es InfoNCE simétrico con negativos all-gather, lo que fuerza la alineación bidireccional entre audio y texto en el espacio latente.

Una nota relevante de la model card: la actualización del 11 de noviembre de 2026 sustituyó el `model.safetensors` por los pesos fusionados y añadió la configuración `1_Pooling`. El archivo anterior era una instantánea de entrenamiento sin fusionar que cargaba con capas lineales inicializadas aleatoriamente; conviene verificar la versión del archivo al desplegar.

## Capacidades

- Generación de embeddings de audio de voz (3.584-d, L2-normalizado) para comparación semántica y recuperación.
- Generación de embeddings de texto en el mismo espacio latente, lo que permite similitud coseno directa entre audio y texto.
- Procesamiento multimodal unificado: la modalidad la determina la entrada a través de la plantilla de chat del backbone Omni.
- Captura de atributos vocales finos gracias al entrenamiento con descripciones densas: emoción, estilo de habla y demografía.
- Extracción de características compatible con la API multimodal de sentence-transformers (`model.encode`).
- Soporte de audio crudo mediante diccionario con array de muestras y sampling rate.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- Capacidad multilingüe limitada: solo inglés declarado.
- No se documenta modo thinking explícito en la ficha, aunque el backbone Qwen2.5-Omni-Thinker lo incorpora a nivel de arquitectura base.

## Casos de uso

- Búsqueda de voz por descripción textual: indexar un catálogo de clips de voz con sus embeddings y recuperar los que mejor coincidan con una consulta como "a calm and steady voice", usando similitud coseno sobre vectores ya normalizados.
- Filtrado y moderación de contenido de audio: clasificar clips por atributos de emoción o estilo vocal comparando contra un conjunto de descripciones de referencia, útil en plataformas de contenido generado por usuarios.
- Organización de archivos de audio y podcasts: agrupar episodios o segmentos por tono, emoción o características demográficas del hablante sin necesidad de transcripción previa.
- Etiquetado automático de datasets de voz: generar metadatos semánticos (estilo, emoción) para corpus de habla que luego se usen en entrenamiento de otros modelos.
- Sistemas de recomendación de contenido hablado: calcular similitud entre el perfil de un oyente descrito en texto y los clips disponibles para sugerir contenido afín.
- Verificación de consistencia de estilo en producción de doblaje o síntesis de voz: comparar el embedding de un clip generado con la descripción objetivo para detectar desviaciones de tono o emoción.
- Recuperación cruzada en investigación en habla: servir como extractor de características para experimentos de retrieval audio-texto con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~8,9B parámetros en precisión completa (fp16/bf16) se requiere del orden de 18 GB solo para pesos, más memoria para activaciones y audio.
- GPU recomendadas: no documentadas por el autor. Por tamaño, encajan A100 40/80 GB, H100 y, en consumer, RTX 4090 (24 GB) en fp16 con margen ajustado.
- ¿Cabe en consumer GPU? En fp16 probablemente en RTX 4090; en GPUs de 16 GB o menos requeriría cuantización, para la cual no se documentan tipos soportados.
- Opciones de despliegue: la vía documentada es `sentence-transformers` con la API multimodal (`trust_remote_code=True`), que a su vez depende de `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Embedding | Licencia | Notas |
|---|---|---|---|---|---|
| VoiceCLAP-Large | ~8,9B | no disponible | 3.584-d, L2 | cc-by-4.0 | Torre única, backbone Qwen2.5-Omni-Thinker-7B |
| LCO-Embedding-Omni-7B (base) | ~7B | no disponible | no disponible | no disponible | Modelo base del que deriva el finetune |
| CLAP clásico (p. ej. LAION-CLAP) | no disponible | no disponible | no disponible | no disponible | Arquitectura de dos torres audio-texto, referencia habitual en la categoría |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de recuperación ni comparaciones directas en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de sesgo: el entrenamiento incluye datos demográficos y de emoción anotados por un modelo (MOSS-Audio-8B-Thinking), lo que puede propagar sesgos de etiquetado y de representación de hablantes.
- Riesgo de alucinación en las descripciones: al ser un modelo de embeddings, el riesgo se traslada a la calidad de las anotaciones sintéticas usadas en entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar las condiciones del modelo base LCO-Embedding-Omni-7B y del backbone Qwen2.5-Omni, que pueden imponer términos adicionales.
- Advertencia de versión: el `model.safetensors` anterior al 11 de noviembre de 2026 cargaba con capas lineales aleatorias; es imprescindible usar la versión actualizada con los pesos fusionados y la configuración `1_Pooling`.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con clips de audio largos.
- No se documentan tipos de cuantización ni despliegue en motores de inferencia de alto rendimiento, lo que limita el escalado en producción.
- El modelo es un extractor de características, no un generador: no debe usarse para tareas de generación de texto o audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VoiceNet/voiceclap-large
- Modelo base LCO-Embedding-Omni-7B: https://huggingface.co/LCO-Embedding/LCO-Embedding-Omni-7B
- Organización VoiceNet en Hugging Face: https://huggingface.co/VoiceNet
- Dataset Emilia (usado en el subconjunto emolia): https://huggingface.co/datasets/amphion/Emilia-Dataset
- Paper VoiceNet: no disponible (citado en la model card sin enlace)
- Repositorio de código: no disponible
- Demo: no disponible

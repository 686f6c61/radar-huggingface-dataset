# ummjevel/pocket-tts-korean-62m

## Resumen

Pocket TTS Korean 62M es un modelo de síntesis de voz (text-to-speech) en coreano, desarrollado por el usuario ummjevel como un ajuste fino de investigación sobre la arquitectura Pocket TTS de Kyutai. Con 62.055.106 parámetros reales (incluyendo el códec Mimi completo y el codificador de prompts), el modelo se posiciona como una alternativa compacta para generación de voz en coreano con clonación de voz zero-shot a partir de prompts de hasta 5 segundos.

El modelo parte de un checkpoint intermedio de destilación (Korean 100M B6k EMA) y aplica una técnica de destilación por anchura sobre el modelo base kyutai/pocket-tts, reduciendo la dimensión del modelo de 1024 a 768 y las cabezas de atención de 16 a 12, con un FFN de escala 4 a 2. El resultado es un modelo de 6 capas que retiene el códec Mimi completo y las cabezas de muestreo/EOS originales.

Es relevante por su tamaño reducido (0,2 GB de repositorio) y su enfoque en un único idioma (coreano), lo que lo hace adecuado para despliegues con recursos limitados. Sin embargo, se trata de un modelo de investigación comunitario, no de un lanzamiento oficial de Kyutai, y el autor indica explícitamente `inference: false` en la model card, lo que implica que no está validado para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer destilado por anchura sobre Pocket TTS (6 capas, dimensión 768, 12 cabezas de atención, FFN escala 2) con códec Mimi completo |
| Parámetros totales | 62.055.106 (incluye códec Mimi y codificador de prompts) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (máximo ejemplo de entrenamiento: 30 segundos de audio; prompt de voz máximo: 5 segundos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer destilada por anchura a partir de un checkpoint intermedio (Korean 100M B6k EMA), que a su vez fue destilado de un teacher de 300M (100k EMA). La destilación reduce la dimensión del modelo de 1024 a 768 y las cabezas de atención de 16 a 12, con un FFN hidden scale de 4 a 2, manteniendo seis capas, la interfaz z1024, las cabezas originales de muestreo/EOS y el códec Mimi completo. La inicialización se realiza mediante PCA del residual stream, calibrada con 32 lotes del manifiesto de validación del corpus de entrenamiento (no CV3).

El entrenamiento utiliza el objetivo de MSE sobre el hidden-z del teacher fijo nativo, con AdamW, learning rate de 0,0004, schedule coseno con 1.000 updates de warmup, EMA decay de 0,999, batch global de 64 (microbatch 32 × acumulación de gradiente 2) y semilla 42. El checkpoint seleccionado es el EMA de 20.000 pasos. El corpus de entrenamiento es `seastar105/emilia-yodas-ko-filtered-pocket-tts`, con 918.609 utterances (2.276,88 horas) en el split de entrenamiento y 9.472 utterances (23,00 horas) en validación. El tokenizador es SentencePiece coreano de 4.000 tokens. No se aplicó dropout de texto ni de voz. La guía (CFG) objetivo es 1 tanto en entrenamiento como en inferencia, ya que el teacher incorpora la guía.

## Capacidades

- Síntesis de voz (text-to-speech) en coreano a partir de texto de entrada.
- Clonación de voz zero-shot mediante prompts de voz de hasta 5 segundos.
- Generación de audio de hasta 30 segundos por ejemplo.
- Control de generación mediante temperatura (evaluado con temperatura 0,3) y umbral EOS.
- Integración con el códec Mimi para codificación/decodificación de audio.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio.
- Capacidad multilingüe limitada al coreano (único idioma declarado).

## Casos de uso

- **Lectura de textos en coreano para accesibilidad**: el modelo puede convertir artículos, documentos o contenido web en audio coreano, adecuado para aplicaciones de lectura en voz alta gracias a su tamaño reducido y su capacidad de generar hasta 30 segundos por pasada.
- **Clonación de voz para asistentes personalizados**: con prompts de voz de hasta 5 segundos, permite generar respuestas habladas con una voz específica en aplicaciones de asistencia por voz en coreano, aunque la similitud de hablante medida (0,9288) debe validarse en el dominio objetivo.
- **Prototipado de interfaces de voz**: su tamaño (62M parámetros, 0,2 GB) permite iterar rápidamente en entornos de desarrollo con recursos limitados para probar flujos de TTS en coreano antes de escalar a modelos mayores.
- **Generación de audiolibros o pódcast de bajo coste**: la generación de fragmentos de hasta 30 segundos y el control de temperatura permiten producir narraciones en coreano por lotes, con la advertencia de que la calidad (UTMOSv1 3,1791) es moderada.
- **Investigación en destilación de modelos TTS**: el modelo sirve como caso de estudio reproducible de destilación por anchura con teacher fijo, gracias a la receta de entrenamiento publicada (`training_recipe.json`) y al protocolo de evaluación documentado.
- **Evaluación comparativa de TTS coreano**: al estar evaluado sobre el conjunto `zero_shot_ko` de CV3-Eval con métricas CER, UTMOSv1 y similitud de hablante, puede usarse como baseline en experimentos de síntesis de voz en coreano.
- **Generación de voces para doblaje o contenido educativo**: para frases cortas en coreano en materiales formativos o demos, siempre que se acepte la licencia CC-BY-4.0 y se valide la calidad en el dominio concreto.

## Benchmarks y rendimiento

| Métrica / ajuste | Valor |
|---|---|
| Ítems de evaluación | 500 (todos los de `zero_shot_ko` en CV3-Eval) |
| CFG | 1 |
| CER ↓ | 5,659% |
| UTMOSv1 ↑ | 3,1791 |
| Similitud de hablante ↑ | 0,9288 |
| Generaciones silenciosas | 0 / 500 |
| Generaciones sin EOS | 0 / 500 |

Condiciones de generación: semilla 0, temperatura 0,3, un paso de decodificación, umbral EOS -1, máximo 30 segundos, prompt de voz completo. UTMOS calculado con UTMOSv1 / utmos-pytorch 0.1.0 sobre ítems audibles, en mono 16 kHz sin padding; no es MOS humano ni UTMOSv2. CER calculado con whisper-large-v3 forzado a coreano, decodificación greedy de un beam, máximo 256 tokens nuevos, tras normalización NFC, eliminación de puntuación y limpieza de espacios. Similitud de hablante mediante similitud coseno entre embeddings de wavlm-base-plus-sv a 16 kHz.

No se han publicado resultados comparativos con otros modelos TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 62M parámetros, el peso en fp32 sería de aproximadamente 248 MB, y en fp16 de aproximadamente 124 MB, sin contar el códec Mimi ni el codificador de prompts; estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponible. Por tamaño, el modelo podría ejecutarse en GPUs consumer, pero no se ha publicado una lista de GPUs validadas.
- ¿Cabe en GPU consumer? Por el número de parámetros (62M) es probable que sí en la mayoría de GPUs consumer modernas, pero no hay confirmación oficial en la información disponible.
- Opciones de despliegue: la librería declarada es `pocket-tts`. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card indica que el tiempo de generación por utterance no se registró en la evaluación original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| Pocket TTS Korean 62M (este modelo) | 62,1M | No disponible (audio máx. 30 s) | Coreano | CC-BY-4.0 | CER 5,659%; UTMOSv1 3,1791; similitud 0,9288 | Hugging Face, `inference: false` |
| kyutai/pocket-tts (base) | No disponible en la información | No disponible | No disponible en la información | No disponible en la información | No disponible | Hugging Face |
| Korean 100M B6k EMA (checkpoint intermedio) | ~100M (según denominación) | No disponible | Coreano | No disponible | No disponible | No publicado como repositorio independiente |
| Teacher 300M 100k EMA | ~300M (según denominación) | No disponible | Coreano | No disponible | No disponible | No publicado como repositorio independiente |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación comunitario, no un lanzamiento oficial de Kyutai; la model card declara `inference: false`, lo que indica que no está validado para uso en producción.
- El modelo solo soporta coreano; no se ha documentado capacidad multilingüe.
- La evaluación se realizó sobre un único conjunto (500 ítems de `zero_shot_ko` en CV3-Eval) con una configuración de generación concreta (temperatura 0,3, CFG 1); el rendimiento en otros dominios, estilos o longitudes puede diferir.
- UTMOSv1 es una métrica automática de calidad, no un MOS humano; no debe interpretarse como calidad perceptual validada por oyentes.
- La similitud de hablante se midió con wavlm-base-plus-sv sobre embeddings a 16 kHz; no se ha validado la fidelidad de clonación en todos los tipos de voz.
- El CER se midió con whisper-large-v3 forzado a coreano, lo que introduce dependencia del sistema ASR utilizado.
- Riesgo de alucinación o artefactos de audio no cuantificado en la información disponible; la evaluación reporta 0 generaciones silenciosas y 0 sin EOS en los 500 ítems, pero no se documentan otros modos de fallo.
- Sesgos conocidos: no documentados en la información proporcionada; el corpus de entrenamiento (Emilia-YODAS filtrado para coreano) puede introducir sesgos de dominio y estilo.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un modelo derivado de kyutai/pocket-tts conviene verificar las condiciones de la licencia del modelo base antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- El prompt de voz utilizado en los ejemplos de evaluación no se incluye en el repositorio, lo que limita la reproducibilidad exacta de las muestras.

## Enlaces

- [Hugging Face: ummjevel/pocket-tts-korean-62m](https://huggingface.co/ummjevel/pocket-tts-korean-62m)
- [Modelo base: kyutai/pocket-tts](https://huggingface.co/kyutai/pocket-tts)
- [Dataset de entrenamiento: seastar105/emilia-yodas-ko-filtered-pocket-tts](https://huggingface.co/datasets/seastar105/emilia-yodas-ko-filtered-pocket-tts/tree/13e9bcb8200f3abf5aa687215f480305619aadd8)
- [Dataset de evaluación: yuekai/CV3-Eval](https://huggingface.co/datasets/yuekai/CV3-Eval/tree/6ea9d3650fffcbed7c6279e6d1546d01ef1d2796)
- [Pesos UTMOS: Blinorot/UTMOS-PyTorch](https://huggingface.co/Blinorot/UTMOS-PyTorch/tree/4f2447e519df3b88567b45583d3500006729502b)
- [Paquete UTMOS: utmos-pytorch 0.1.0](https://pypi.org/project/utmos-pytorch/0.1.0/)
- [ASR de evaluación: openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3/tree/06f233fe06e710322aca913c1bc4249a0d71fce1)
- [Modelo de similitud de hablante: microsoft/wavlm-base-plus-sv](https://huggingface.co/microsoft/wavlm-base-plus-sv/tree/feb593a6c23c1cc3d9510425c29b0a14d2b07b1e)
- [Receta de entrenamiento: training_recipe.json](https://huggingface.co/ummjevel/pocket-tts-korean-62m/blob/main/training_recipe.json)
- [Evaluación: evaluation.json](https://huggingface.co/ummjevel/pocket-tts-korean-62m/blob/main/evaluation.json)
- [Protocolo de evaluación y datos: EVALUATION_AND_DATA.md](https://huggingface.co/ummjevel/pocket-tts-korean-62m/blob/main/EVALUATION_AND_DATA.md)

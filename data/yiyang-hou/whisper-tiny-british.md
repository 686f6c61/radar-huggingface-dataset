# Yiyang-hou/whisper-tiny-british

## Resumen

Whisper tiny British es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla openai/whisper-tiny, publicado por el usuario Yiyang-hou en Hugging Face. El modelo parte de la arquitectura Transformer encoder-decoder de Whisper en su variante más pequeña, con 37.760.640 parámetros totales, y se ha especializado en la transcripción de inglés británico mediante entrenamiento sobre el dataset naharte/british_english. Su propósito es mejorar la precisión en acentos y variantes fonéticas del inglés del Reino Unido frente al modelo base original.

El modelo es relevante para desarrolladores que necesitan un motor ASR ligero, desplegable en hardware modesto, y que trabajen con audio en inglés británico. Al estar construido sobre la variante tiny de Whisper, el coste computacional y la huella de memoria son mínimos, lo que lo hace apto para entornos con recursos limitados o para tareas de prototipado rápido.

La información disponible es limitada: la model card está generada automáticamente por el Trainer de Hugging Face y carece de secciones descriptivas sobre usos previstos, composición del dataset o limitaciones. El autor declara un WER de 13,33 sobre el conjunto de evaluación del dataset de inglés británico, aunque el resultado no está verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante tiny: un Transformer encoder-decoder con atención multi-cabeza estándar, diseñado para procesar espectrogramas Mel de audio y generar transcripciones token a token. Whisper emplea una ventana de audio de 30 segundos y un vocabulario multilingüe de tokens BPE, aunque en este ajuste el modelo está orientado a inglés.

El ajuste fino se realizó sobre el dataset naharte/british_english con los siguientes hiperparámetros declarados por el autor: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluación de 1, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup, semilla 42 y 2000 pasos de entrenamiento totales. El entrenamiento registró dos checkpoints de evaluación: en el paso 1000 (época 0,99) la validación mostró una loss de 0,3012 y un WER de 15,1016; en el paso 2000 (época 1,98) la loss bajó a 0,2951 y el WER a 13,3315. Las versiones de framework empleadas fueron Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se documenta el número total de tokens de audio, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, con especialización en inglés británico.
- Transcripción de audio a texto mediante la pipeline `automatic-speech-recognition` de Transformers.
- Procesamiento de ventanas de audio de hasta 30 segundos por pasada, característica heredada de Whisper.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No dispone de modo thinking, visión ni audio más allá de la entrada ASR estándar.

## Casos de uso

- Transcripción de reuniones y notas de voz en inglés británico: el modelo puede convertir grabaciones cortas en texto con un coste computacional mínimo, adecuado para actas automáticas o resúmenes posteriores.
- Subtitulado automático de vídeos en inglés del Reino Unido: su especialización en acento británico lo hace útil para generar subtítulos en contenido audiovisual de la BBC o producciones similares.
- Prototipado rápido de aplicaciones de voz: al ser un modelo tiny de 37,8 M de parámetros, permite iterar en local sin GPU dedicada durante las fases de desarrollo.
- Preprocesamiento de audio para pipelines de NLP: transcripción de llamadas de atención al cliente en inglés británico antes de aplicar análisis de sentimiento o extracción de entidades.
- Asistentes de voz embebidos en dispositivos con recursos limitados: su reducido tamaño facilita el despliegue en entornos edge o en contenedores ligeros.
- Generación de datasets etiquetados: transcripción masiva de audio británico para construir corpus de texto anotados con bajo coste de inferencia.
- Sistemas de accesibilidad: conversión de voz a texto en tiempo casi real para personas con discapacidad auditiva en contextos de habla británica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | British English (naharte/british_english, split train) | WER | 13,3315 |
| Automatic Speech Recognition | British English (paso 1000, época 0,99) | WER | 15,1016 |
| Automatic Speech Recognition | British English (paso 1000, época 0,99) | Validation loss | 0,3012 |
| Automatic Speech Recognition | British English (paso 2000, época 1,98) | Validation loss | 0,2951 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 150 MB para los pesos (37,8 M de parámetros × 4 bytes), más overhead de activaciones y buffers de audio.
- VRAM estimada en fp16: aproximadamente 75 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, así como en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con al menos 1 GB de VRAM es suficiente. Para lotes grandes, se recomienda una GPU con 4 GB o más.
- Opciones de despliegue: pipeline de Transformers, endpoints de Hugging Face (tag `endpoints_compatible`), y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no confirmado en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia baja en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| Yiyang-hou/whisper-tiny-british | 37,8 M | 30 s | en (britanico) | apache-2.0 | 13,33 (dataset propio) |
| openai/whisper-tiny | 39 M | 30 s | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | 74 M | 30 s | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | 30 s | multilingue | apache-2.0 | no disponible en esta ficha |

La comparación directa de WER no es posible porque los modelos base de OpenAI no declaran resultados sobre el dataset naharte/british_english en la información disponible. El modelo aquí descrito es más pequeño que whisper-base y whisper-small, lo que reduce su coste de inferencia a cambio de menor capacidad general.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta sesgos conocidos, composición del dataset ni limitaciones específicas.
- El WER de 13,33 está declarado por el autor y no ha sido verificado de forma independiente; además se calcula sobre el split `train` del dataset, lo que puede no reflejar el rendimiento en datos no vistos.
- El modelo está especializado únicamente en inglés británico; su rendimiento en otros acentos o idiomas no está documentado y probablemente sea inferior al del modelo base multilingüe.
- Riesgo de alucinación en transcripciones: como todos los modelos Whisper, puede generar texto plausible en segmentos de silencio o ruido.
- La ventana de audio está limitada a 30 segundos por pasada; para audio más largo se requiere segmentación manual o el uso de pipelines con chunking.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documentan restricciones adicionales de uso comercial más allá de las de la licencia apache-2.0.
- El número de descargas (31) y likes (0) indica que el modelo es reciente y tiene poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yiyang-hou/whisper-tiny-british
- Perfil del autor: https://huggingface.co/Yiyang-hou
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/british_english

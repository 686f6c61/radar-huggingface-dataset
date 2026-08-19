# WinFunction/Tone-Detector-f1

## Resumen

El modelo **Tone-Detector-f1** es un clasificador de emociones en audio diseñado específicamente para detectar el estado emocional de los pilotos de Fórmula 1 a partir de sus comunicaciones por radio con el muro de boxes. Desarrollado por WinFunction, combina un encoder de voz preentrenado **WavLM** (`microsoft/wavlm-base-plus`) con una cabeza de clasificación formada por una **BiLSTM** y un mecanismo de **atención temporal**. El modelo procesa audio crudo (`.wav`, `.mp3`, `.flac`, etc.), lo convierte a mono a 16 kHz y devuelve una de seis emociones: ira, asco, miedo, alegría, neutralidad o tristeza, junto con el nivel de confianza y la distribución de probabilidades.

Con aproximadamente **95,2 millones de parámetros** en total, de los cuales solo **462.000 son entrenables** (el encoder WavLM permanece congelado), el modelo es ligero y apto para inferencia en tiempo real. Su relevancia radica en la aplicación de reconocimiento de emociones en el habla (SER) a un dominio muy específico y con demanda creciente: el análisis del rendimiento y la carga mental de los pilotos durante las carreras. Al estar liberado bajo licencia Apache-2.0, puede integrarse en proyectos comerciales sin restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WavLM (encoder congelado) + BiLSTM + Temporal Attention + Clasificador lineal |
| Parametros totales | ~95,2 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 2,5 s (con hop de 1,5 s y solapamiento de 1,0 s) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura se compone de un encoder de voz **WavLM base plus** (12 capas transformer, dimensión oculta 768, 12 cabezas de atención) cuyos pesos están **congelados** y se utilizan para extraer representaciones de cada frame de audio. Estas representaciones, con forma `[Batch, Secuencia, 768]`, se introducen en una **BiLSTM** con tamaño oculto 128 por dirección (salida de 256), seguida de un módulo de **atención temporal** que agrega la secuencia en un vector de contexto fijo de dimensión 256. Finalmente, un clasificador lineal proyecta este vector a 6 logits (una por emoción). La pérdida utilizada es **cross-entropy** y el optimizador **AdamW** con tasa de aprendizaje `1e-3` y `weight_decay` de `1e-4`.

El preprocesado de audio incluye conversión a mono, remuestreo a 16 kHz y normalización de amplitud pico. La inferencia se realiza mediante ventanas deslizantes de 2,5 segundos con un solapamiento de 1 segundo, lo que permite analizar flujos continuos de audio. No se han publicado detalles sobre el conjunto de datos de entrenamiento (número de muestras, composición, balance de clases), por lo que estos datos no están disponibles.

## Capacidades

- **Clasificación de emociones en audio**: detecta 6 emociones (ira, asco, miedo, alegría, neutralidad, tristeza) en comunicaciones de radio de F1.
- **Procesamiento de audio en bruto**: acepta formatos comunes (`.wav`, `.mp3`, `.flac`, `.ogg`, `.m4a`) y aplica automáticamente el preprocesado necesario.
- **Salida estructurada**: devuelve la emoción predicha, el porcentaje de confianza, la distribución completa de probabilidades y los pesos de atención temporal por frame.
- **Atención temporal**: el mecanismo de atención permite interpretar qué partes de la señal de audio son más relevantes para la decisión, útil para análisis posteriores.
- **Inferencia en tiempo real**: gracias a la ventana deslizante y al bajo número de parámetros entrenables, el modelo puede procesar audio en streaming.
- **Integración sencilla**: se proporciona un script (`modeling_f1tone.py`) que encapsula todo el pipeline, desde el archivo de audio hasta la predicción final.

## Casos de uso

- **Análisis de comunicaciones en vivo durante una carrera**: el modelo puede monitorizar las radios de los pilotos en tiempo real para alertar al equipo sobre picos de ira o estrés, ayudando a ajustar la estrategia o la comunicación.
- **Estudio post-carrera del rendimiento del piloto**: correlacionar las emociones detectadas con eventos concretos (adelantamientos, errores, decisiones de equipo) para evaluar la carga mental y la toma de decisiones bajo presión.
- **Entrenamiento de pilotos y coaching**: analizar grabaciones históricas para identificar patrones emocionales recurrentes y trabajar en la gestión del estrés.
- **Contenido audiovisual y documentales**: etiquetar automáticamente clips de radio con la emoción predominante para facilitar la edición y la narración de historias.
- **Investigación en psicología del deporte**: proporcionar datos objetivos sobre el estado emocional de los deportistas en entornos de alta competición, útil para estudios académicos.
- **Sistemas de alerta temprana**: integrar el modelo en sistemas de seguridad para detectar situaciones de riesgo (por ejemplo, miedo o ira extrema) que puedan indicar problemas en la pista o en la salud del piloto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, F1 ni comparaciones con otros sistemas de reconocimiento de emociones.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo completo (encoder WavLM + BiLSTM + head) ocupa aproximadamente 380 MB en FP32 (95,2 M parámetros × 4 bytes). Con el procesamiento de audio y un batch pequeño, se estima un uso de VRAM inferior a 1 GB, aunque no se han publicado mediciones oficiales.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 2060 o superiores funcionarán sin problemas. Para despliegue en producción, una T4 o A10 es adecuada.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de gama media e incluso en CPU para inferencia por lotes pequeños, aunque con mayor latencia.
- **Opciones de despliegue**: al ser un modelo PyTorch, puede servirse mediante frameworks como TorchServe, FastAPI o un contenedor Docker. No se han documentado integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no hay datos publicados. Se espera una latencia por ventana de 2,5 s de audio de aproximadamente 100-300 ms en GPU moderna, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa objetiva con otros modelos de reconocimiento de emociones en audio (como Wav2Vec2, HuBERT o Emotion2Vec). No se han publicado resultados de benchmarks ni se han comparado métricas con alternativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Dominio específico**: el modelo está entrenado exclusivamente con comunicaciones de radio de F1. Su rendimiento en otros dominios (llamadas telefónicas, entrevistas, etc.) probablemente será deficiente.
- **Idioma**: solo soporta inglés. No se ha evaluado su comportamiento con otros idiomas.
- **Sesgos potenciales**: al entrenarse con un conjunto de datos no documentado, puede presentar sesgos hacia ciertos acentos, voces o condiciones de grabación propias del entorno de F1.
- **Riesgo de alucinación**: al ser un clasificador de emociones, no genera texto, pero puede producir falsos positivos en emociones extremas si la señal de audio es ambigua o ruidosa.
- **Falta de transparencia**: no se ha publicado información sobre el dataset de entrenamiento, el preprocesado exacto ni los resultados de validación, lo que dificulta la evaluación de su robustez.
- **Dependencia del encoder WavLM**: al congelar el encoder base, cualquier limitación del modelo WavLM (por ejemplo, sensibilidad a ciertos ruidos) se hereda en el sistema final.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero se debe incluir la atribución correspondiente y notificar cambios si se redistribuye.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/WinFunction/Tone-Detector-f1)
- [Modelo base WavLM](https://huggingface.co/microsoft/wavlm-base-plus)

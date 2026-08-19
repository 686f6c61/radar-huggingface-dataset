# thantzinphyo/whisper-tiny-myanmar-phase1

## Resumen

Whisper-Tiny Myanmar ASR (Phase 1) es un modelo de reconocimiento automático del habla (ASR) fine-tuneado sobre la arquitectura `openai/whisper-tiny` para el idioma birmano (my). Desarrollado por el usuario `thantzinphyo`, el modelo se entrena sobre el dataset OpenSLR-80 (Crowdsourced Burmese Speech) y se publica como un checkpoint intermedio (paso 1.000 de 1.500) seleccionado por su menor Character Error Rate (CER) en validación, con el objetivo de evitar sobreajuste en etapas tardías.

El modelo cuenta con 37.760.640 parámetros (según los pesos en safetensors) y se distribuye bajo licencia Apache 2.0. Su relevancia radica en ofrecer una solución ASR específica para birmano, un idioma con recursos limitados, partiendo de un modelo base multilingüe de Whisper. El checkpoint publicado logra un CER de 19,60% y un WER de 65,28% en un conjunto de validación aislado, lo que supone una mejora drástica frente al comportamiento alucinante del modelo preentrenado sin ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | my (birmano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `openai/whisper-tiny`, que emplea una arquitectura transformer encoder-decoder diseñada originalmente para ASR multilingüe. En esta fase de entrenamiento (Phase 1) se aplicó una estrategia de congelamiento parcial del encoder: las capas 0 y 1 se mantienen congeladas, mientras que las capas 2 y 3 del encoder y todo el decoder son entrenables, lo que supone un 87,66% de los parámetros (33,1M) actualizables.

El entrenamiento se realizó sobre el dataset OpenSLR-80, compuesto por 2.277 clips de entrenamiento y 253 de validación (aproximadamente 0,42 horas de audio en validación). Se utilizó un batch efectivo de 64 (16 por dispositivo con acumulación de gradientes de 4), una tasa de aprendizaje de 1,5e-4 con scheduler coseno y 150 pasos de warmup. La transcripción de referencia se normalizó en formato NFC. El checkpoint publicado corresponde al paso 1.000, seleccionado por el menor CER (19,60%) entre los 1.500 pasos evaluados, evitando así el sobreajuste observado en pasos posteriores.

## Capacidades

- Reconocimiento automático del habla (ASR) para el idioma birmano, transcribiendo audio a texto.
- Manejo de transcripciones normalizadas en formato NFC, lo que facilita la comparación y post-procesado.
- Al ser un modelo tiny, ofrece inferencia rápida y bajo consumo de recursos, apto para entornos con limitaciones de cómputo.
- No se reportan capacidades adicionales como traducción, tool calling o soporte multimodal más allá del audio (la arquitectura Whisper original soporta traducción, pero este fine-tune no lo especifica).
- No se menciona soporte para otros idiomas distintos del birmano en este checkpoint.

## Casos de uso

- Transcripción de reuniones y entrevistas en birmano: el modelo puede convertir grabaciones de audio a texto de forma automática, facilitando la generación de actas o subtítulos.
- Subtitulado de vídeos en birmano: integrable en pipelines de postproducción para añadir subtítulos a contenido audiovisual.
- Asistentes de voz locales: al ser ligero, puede desplegarse en dispositivos edge o aplicaciones móviles para comandos de voz en birmano.
- Indexación de archivos de audio: transcripción de bibliotecas de audio para búsqueda por texto.
- Análisis de llamadas de servicio al cliente: transcribir conversaciones para análisis de calidad o extracción de información.
- Herramientas de accesibilidad: conversión de contenido hablado en birmano a texto para personas con discapacidad auditiva.

## Benchmarks y rendimiento

La model card del autor proporciona métricas de validación (CER y WER) a lo largo del entrenamiento. Los resultados del checkpoint publicado (paso 1.000) y del modelo base sin ajuste son:

| Modelo | CER (%) | WER (%) |
|---|---|---|
| Whisper-tiny preentrenado (paso 0) | 230,57 | 213,09 |
| Checkpoint publicado (paso 1.000) | 19,60 | 65,28 |

La tabla completa de evolución (pasos 0 a 1.500) está disponible en la model card original. No se reportan comparaciones con otros modelos ASR en birmano.

## Requisitos de hardware

- No se proporcionan datos específicos de VRAM en la información disponible.
- Al tratarse de un modelo de 37,8M parámetros, la inferencia es viable en CPU y GPU de gama baja (por ejemplo, tarjetas con 2-4 GB de VRAM), aunque no se confirma oficialmente.
- El tamaño del repositorio es de 0,2 GB, lo que indica un peso del modelo en torno a 150 MB en precisión fp32 (estimación a partir del número de parámetros).
- Para despliegue, se pueden usar frameworks estándar de ASR como Hugging Face Transformers, aunque no se mencionan opciones específicas como vLLM u Ollama.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos ASR para birmano en la documentación proporcionada. Se puede considerar que el modelo es un fine-tune de Whisper-tiny, por lo que su rendimiento depende del ajuste realizado. No se han encontrado datos de otros checkpoints similares en la misma fuente.

## Limitaciones y advertencias

- El modelo está entrenado únicamente con el dataset OpenSLR-80, que es un conjunto de habla crowdsourced; puede presentar sesgos hacia los acentos y condiciones de grabación de ese corpus.
- El WER de 65,28% es relativamente alto, lo que sugiere errores frecuentes a nivel de palabra, aunque el CER de 19,60% indica que muchos errores son de carácter fonético o de segmentación.
- El modelo es un checkpoint intermedio (paso 1.000) y no se ha evaluado su comportamiento en dominios específicos (jerga, ruido, diferentes dialectos).
- No se menciona soporte para otros idiomas; su uso está restringido al birmano.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el rendimiento en datos propios antes de producción.
- No se documentan limitaciones de contexto ni de duración de audio; se asume que hereda la ventana de 30 segundos de Whisper, pero no está confirmado.

## Enlaces

- [HuggingFace - thantzinphyo/whisper-tiny-myanmar-phase1](https://huggingface.co/thantzinphyo/whisper-tiny-myanmar-phase1)
- Dataset OpenSLR-80 (Crowdsourced Burmese Speech) - no se proporciona URL directa en la información disponible.

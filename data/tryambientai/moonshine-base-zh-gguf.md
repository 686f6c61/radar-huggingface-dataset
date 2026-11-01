# tryambientai/moonshine-base-zh-gguf

## Resumen

`tryambientai/moonshine-base-zh-gguf` es una conversión al formato GGUF del modelo `UsefulSensors/moonshine-base-zh`, un sistema de reconocimiento automático del habla (ASR) especializado en mandarín. El modelo original parte de la arquitectura Moonshine base (62 millones de parámetros) y ha sido ajustado por UsefulSensors para transcripción de audio en chino. Esta conversión, publicada por tryambientai, permite ejecutar el modelo con `transcribe.cpp`, una implementación en C++ pensada para inferencia local eficiente sin dependencias de Python.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y de código abierto (licencia MIT) para transcripción de voz en mandarín en entornos con recursos limitados. Con tan solo 74 MB en cuantización Q8_0, el modelo puede ejecutarse en CPU y GPU de consumo, lo que lo hace adecuado para aplicaciones de borde, dispositivos móviles o pipelines donde el coste computacional y la latencia son críticos. El modelo consume audio PCM crudo a 16 kHz y emite únicamente texto transcrito, sin capacidades de traducción, detección de idioma ni marcas de tiempo.

La arquitectura es un transformer encoder-decoder con un vástago convolucional de tres capas Conv1d que sustituye al tradicional banco de filtros mel, lo que simplifica el preprocesamiento. El modelo está entrenado exclusivamente para chino mandarín y no soporta otros idiomas. Su licencia MIT facilita el uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con vástago Conv1d de 3 capas (sin STFT ni banco de filtros mel) |
| Parametros totales | 61.513.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio de entrada; sin límite de contexto textual especificado) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Chino mandarín (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine base, un transformer encoder-decoder diseñado específicamente para ASR. A diferencia de los enfoques clásicos que emplean espectrogramas mel como entrada, Moonshine procesa directamente audio PCM crudo a 16 kHz mediante un vástago convolucional de tres capas Conv1d. Esta elección elimina la necesidad de calcular STFT o filtros mel, reduciendo la latencia de preprocesamiento y simplificando el pipeline de inferencia. El decoder genera la transcripción de forma autorregresiva con una longitud máxima de 192 tokens, siguiendo la configuración de generación original (greedy, num_beams=1).

El modelo original fue ajustado por UsefulSensors sobre el checkpoint base de Moonshine para chino mandarín. No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card original de UsefulSensors no proporciona estos detalles. La conversión a GGUF fue realizada por tryambientai a partir del commit `1df4f95` del modelo upstream (fijado el 2026-05-12) y validada contra la referencia de transformers en el commit `90bf720` de transcribe.cpp. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto en chino mandarín a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio crudo sin necesidad de extracción de características mel o STFT.
- Generación de transcripciones únicamente (sin traducción, sin detección de idioma, sin marcas de tiempo).
- Inferencia local eficiente en CPU y GPU gracias al formato GGUF y a la implementación en C++ de transcribe.cpp.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta streaming (según la model card: `streaming: false`).
- No soporta traducción (`translate: false`) ni detección de idioma (`lang_detect: false`).
- No genera timestamps (`timestamps: none`).
- Capacidad multilingüe limitada exclusivamente al chino mandarín.

## Casos de uso

- Transcripción de reuniones y conferencias en mandarín: el modelo puede convertir grabaciones de audio de reuniones en texto para actas automáticas, aprovechando su bajo consumo de recursos para ejecutarse en servidores modestos o incluso en portátiles.
- Subtitulado de vídeos en chino: integrado en un pipeline de postproducción, el modelo transcribe el audio de vídeos para generar subtítulos en mandarín, con la ventaja de que su formato GGUF permite ejecutarlo en estaciones de trabajo sin GPU dedicada.
- Asistentes de voz para atención al cliente: el modelo puede transcribir las consultas de los usuarios en chino para que un sistema posterior las procese, funcionando en entornos de borde donde la privacidad y la latencia son críticas.
- Dictado por voz en aplicaciones de productividad: integrado en herramientas de escritorio o móviles, permite convertir dictados en texto en tiempo real (sin streaming nativo, pero con procesamiento por segmentos) con un modelo de solo 74 MB en Q8_0.
- Análisis de llamadas telefónicas: en centros de contacto, el modelo transcribe grabaciones de llamadas en mandarín para su posterior análisis de sentimiento o cumplimiento normativo, ejecutándose en CPU con un rendimiento adecuado para procesamiento por lotes.
- Investigación lingüística y corpus de habla: los investigadores pueden transcribir grandes volúmenes de audio en chino para construir corpus anotados, beneficiándose de la licencia MIT y de la facilidad de despliegue en clústeres de CPU.
- Sistemas de accesibilidad para personas con discapacidad auditiva: el modelo puede alimentar aplicaciones que muestran en pantalla la transcripción de conversaciones en mandarín, ejecutándose localmente en dispositivos de consumo.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor de la conversión GGUF. Se midió el CER (Character Error Rate) en el split de test de FLEURS-zh (945 enunciados) con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192).

| Cuantización | Tamaño | CER (FLEURS zh test) |
|---|---:|---:|
| F32 | 236 MB | 16,65 % |
| F16 | 126 MB | 16,65 % |
| Q8_0 | 74 MB | 17,00 % |

Como referencia, la implementación en Transformers (F32, fp32 en MPS) obtuvo un CER del 16,61 % en el mismo manifiesto. Los valores de F32/F16 en C++ coinciden con la referencia dentro del ruido de bootstrap-CI; Q8_0 introduce una deriva adicional típicamente inferior a 0,1 puntos porcentuales respecto a F16.

También se proporcionan métricas de tiempo real (RTF, Real-Time Factor) en dos plataformas:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 79,5 |
| Apple M4 Max | CPU | 80,5 |
| Ryzen 4750U | Vulkan | 34,5 |
| Ryzen 4750U | CPU | 22 |

No se han publicado resultados de benchmarks comparativos con otros modelos ASR en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones (236 MB en F32, 126 MB en F16, 74 MB en Q8_0). Cabe en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con soporte para Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA). No se requieren GPU de datacenter como A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier modelo con al menos 1 GB de memoria gráfica, e incluso en iGPU.
- Opciones de despliegue: transcribe.cpp (CLI y librería C++). No se mencionan otros backends como vLLM, llama.cpp u Ollama.
- Latencia y throughput: según los datos de RTF, en Apple M4 Max con Metal se alcanza un RTF de 79,5 (es decir, procesa audio aproximadamente 79,5 veces más rápido que el tiempo real). En Ryzen 4750U con Vulkan, RTF de 34,5; con CPU, RTF de 22. En M4 Max con CPU, RTF de 80,5. Estos valores indican que el modelo puede transcribir audio en tiempo real con holgura en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (FLEURS zh) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| moonshine-base-zh-gguf (este) | 61,5 M | No disponible | 16,65 % (F32/F16) | MIT | HuggingFace (GGUF) |
| Whisper base (multilingüe) | 74 M | 30 s de audio | No disponible en la información | MIT | HuggingFace, múltiples formatos |
| Whisper small (multilingüe) | 244 M | 30 s de audio | No disponible en la información | MIT | HuggingFace, múltiples formatos |
| Moonshine base (original, inglés) | 62 M | No disponible | No disponible en la información | MIT | HuggingFace |

No se dispone de datos de CER para los modelos comparables en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad. Whisper base y small son alternativas multilingües con mayor número de parámetros; Moonshine base original está especializado en inglés. La principal ventaja de este modelo es su especialización en chino mandarín con un tamaño reducido y formato GGUF para inferencia local eficiente.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para chino mandarín; no soporta otros idiomas ni detección de idioma.
- No realiza traducción: la salida es únicamente la transcripción en chino.
- No genera marcas de tiempo, lo que limita su uso en aplicaciones que requieran alineación temporal precisa.
- No soporta streaming: debe procesar el audio completo (o segmentos) de forma offline.
- Riesgo de alucinación inherente a los modelos ASR, especialmente en audio con ruido, acentos marcados o vocabulario especializado.
- El CER del 16,65 % en FLEURS-zh indica un margen de error considerable; para aplicaciones de alta precisión puede requerir post-procesamiento o un modelo de mayor tamaño.
- No se dispone de información sobre sesgos específicos del modelo (género, dialectos, edad) en la documentación proporcionada.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero se recomienda verificar la licencia del modelo base original (UsefulSensors/moonshine-base-zh) por si hubiera condiciones adicionales no reflejadas en esta conversión.
- La model card original de UsefulSensors no proporciona detalles sobre datos de entrenamiento, sesgos o limitaciones, lo que dificulta una evaluación completa de riesgos.
- El modelo requiere audio de entrada en formato PCM mono a 16 kHz; es necesario convertir otros formatos con herramientas como ffmpeg.

## Enlaces

- [HuggingFace: tryambientai/moonshine-base-zh-gguf](https://huggingface.co/tryambientai/moonshine-base-zh-gguf)
- [Modelo base: UsefulSensors/moonshine-base-zh](https://huggingface.co/UsefulSensors/moonshine-base-zh)
- [Commit del modelo base: 1df4f95](https://huggingface.co/UsefulSensors/moonshine-base-zh/commit/1df4f95)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Documentación de modelos en transcribe.cpp (moonshine.md)](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md)
- [Commit de validación en transcribe.cpp: 90bf720](https://github.com/handy-computer/transcribe.cpp/tree/90bf720)
- [Descarga directa F32 GGUF](https://huggingface.co/handy-computer/moonshine-base-zh-gguf/resolve/main/moonshine-base-zh-F32.gguf)
- [Descarga directa F16 GGUF](https://huggingface.co/handy-computer/moonshine-base-zh-gguf/resolve/main/moonshine-base-zh-F16.gguf)
- [Descarga directa Q8_0 GGUF](https://huggingface.co/handy-computer/moonshine-base-zh-gguf/resolve/main/moonshine-base-zh-Q8_0.gguf)

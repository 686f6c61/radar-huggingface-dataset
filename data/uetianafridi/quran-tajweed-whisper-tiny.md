# uetianafridi/quran-tajweed-whisper-tiny

## Resumen

Quran-tajweed-whisper-tiny es una conversión a ONNX del modelo tarteel-ai/whisper-tiny-ar-quran, un fine-tune de OpenAI Whisper tiny desarrollado por Tarteel AI para reconocimiento de voz en árabe coránico. El autor de esta variante, uetianafridi, lo publica como artefacto de inferencia para la aplicación Android gratuita Quran Tajweed, que verifica la recitación del usuario en el propio dispositivo sin conexión a internet. El modelo base es un transformer encoder-decoder de tipo Whisper, con aproximadamente 39 millones de parámetros, adaptado al dominio del árabe coránico.

La contribución de esta ficha no es un nuevo entrenamiento, sino una reempaquetado orientado a despliegue móvil: exportación a ONNX, cuantización dinámica de pesos a enteros de 8 bits y una modificación de la interfaz de inferencia que expone las claves y valores de atención cruzada del encoder y mantiene una caché de tokens en el decoder. Esto reduce el tamaño de descarga y acelera la decodificación autorregresiva en teléfonos.

Es relevante para desarrolladores que necesiten ASR árabe especializado en recitación coránica en entornos sin conectividad, con licencia Apache 2.0 y un formato de pesos directamente consumible por runtime ONNX. No se han publicado métricas de precisión ni detalles de entrenamiento adicionales en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny), exportado a ONNX |
| Parámetros totales | no disponible (modelo base Whisper tiny, ~39 M según la familia Whisper tiny) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s; entrada log-mel [1, 80, 3000]) |
| Tipos de cuantización | INT8 dinámica (pesos en enteros de 8 bits) |
| Idiomas soportados | árabe (ar), orientado a árabe coránico |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`), tokenizer en `vocab.json` y `added_tokens.json`, manifiesto `manifest.json` con tamaños y checksums SHA-256 |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de OpenAI Whisper tiny sobre árabe coránico, publicado por Tarteel AI como tarteel-ai/whisper-tiny-ar-quran. Whisper tiny es un transformer encoder-decoder que recibe un espectrograma log-mel de 80 canales y 3000 frames (ventana de 30 segundos) y genera tokens de texto de forma autorregresiva. La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron etapas de RLHF o DPO en el fine-tune original.

La variante aquí descrita no reentrena los pesos: solo cambia el formato y la interfaz de ejecución. El encoder exportado produce, además de la representación interna, las claves y valores de atención cruzada de cada capa del decoder (k0..k3, v0..v3), y el decoder acepta y devuelve una caché de tokens (pk/pv de entrada, nk/nv de salida) junto con las k/v del encoder. Esta separación permite cachear el procesamiento del audio una sola vez y reutilizar las k/v en cada paso de decodificación, lo que reduce el coste por token en dispositivos móviles. La cuantización dinámica a INT8 se aplica a los pesos para disminuir el tamaño de descarga, con verificación de integridad mediante SHA-256 en `manifest.json`.

## Capacidades

- Reconocimiento de voz (ASR) en árabe, especializado en recitación coránica.
- Verificación de recitación con fines de tajweed en la aplicación Quran Tajweed.
- Inferencia totalmente offline en el dispositivo, sin llamadas a servicios remotos.
- Procesamiento de audio en ventanas de 30 segundos con espectrograma log-mel de 80 canales.
- Decodificación autorregresiva con caché de tokens y reutilización de claves/valores de atención cruzada.
- Ejecución mediante runtime ONNX en Android.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio adicional ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al árabe según la información disponible.

## Casos de uso

- Verificación de recitación coránica en Android: la aplicación ejecuta `encoder.onnx` sobre la ventana de audio del usuario y compara la transcripción generada por `decoder.onnx` con el texto esperado, todo en el dispositivo y sin conexión.
- Aplicaciones educativas de tajweed: el modelo permite dar retroalimentación inmediata sobre la pronunciación sin enviar audio a servidores, lo que protege la privacidad del alumno.
- Aprendizaje en entornos sin conectividad: adecuado para madrasas o regiones con red intermitente, ya que el paquete ONNX cuantizado se descarga una vez y se verifica con checksums SHA-256.
- Transcripción de audio coránico en pipelines de investigación: al ser un modelo ONNX con interfaz de caché explícita, se puede integrar en scripts de Python con onnxruntime para procesar corpus de recitación por lotes.
- Prototipado de ASR árabe de bajo coste: sirve como línea base ligera (Whisper tiny) para comparar antes de escalar a variantes mayores de la familia Whisper.
- Empaquetado en aplicaciones móviles de terceros: la licencia Apache 2.0 y el formato ONNX permiten redistribuir los archivos dentro de un APK o un SDK propio con avisos de atribución.
- Evaluación de técnicas de cuantización: el par encoder/decoder en INT8 con caché de k/v es un caso práctico para medir el impacto de la cuantización dinámica en latencia y calidad de transcripción en hardware móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras del autor; al tratarse de un Whisper tiny cuantizado a INT8, el modelo está pensado para ejecutarse en CPU móvil y en GPUs de gama baja, pero no se proporcionan medidas.
- GPU recomendadas: no disponibles; el destino principal es hardware Android con runtime ONNX, no GPU de servidor.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño de la familia Whisper tiny, aunque no hay confirmación ni cifras en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (incluido en la app Android); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| uetianafridi/quran-tajweed-whisper-tiny | ~39 M (familia Whisper tiny) | ventana de 30 s, log-mel [1, 80, 3000] | árabe | Apache 2.0 | ONNX INT8 | Conversión para app Android, caché de k/v |
| tarteel-ai/whisper-tiny-ar-quran | ~39 M (familia Whisper tiny) | ventana de 30 s | árabe | no disponible en esta ficha | no disponible | Modelo base original de Tarteel AI |
| openai/whisper-tiny | ~39 M | ventana de 30 s | multilingüe | MIT (según la familia Whisper) | PyTorch, safetensors, etc. | Modelo generalista, sin especialización coránica |

## Limitaciones y advertencias

- El modelo es una conversión de formato, no un entrenamiento nuevo; hereda los sesgos y errores del fine-tune de Tarteel AI.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos de audio con ruido, silencios o recitación fuera del dominio de entrenamiento.
- Especializado en árabe coránico; su rendimiento en árabe coloquial, dialectos o lectura no coránica no está documentado y probablemente sea inferior.
- La ventana de audio está limitada a 30 segundos por inferencia; recitaciones más largas requieren segmentación externa.
- La cuantización dinámica a INT8 puede degradar la precisión de transcripción respecto al modelo base en PyTorch; no se han publicado comparativas.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0, conviene conservar el archivo `LICENSE` y la atribución a Tarteel AI y OpenAI Whisper al redistribuir.
- No se documentan garantías de soporte, mantenimiento ni actualizaciones del artefacto ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uetianafridi/quran-tajweed-whisper-tiny
- Modelo base: https://huggingface.co/tarteel-ai/whisper-tiny-ar-quran
- OpenAI Whisper (modelo original): https://github.com/openai/whisper
- Script de exportación mencionado: `tools/model/export_onnx.py` en el código fuente de la app Quran Tajweed (no se proporciona URL directa en la información disponible)

# tleskiv/whisperkit-coreml

## Resumen

WhisperKit Core ML de ivrit.ai Whisper Large v3 Turbo (hebreo) es una conversion al formato Core ML del modelo de reconocimiento automatico del habla `ivrit-ai/whisper-large-v3-turbo`, un fine-tuning en hebreo del Whisper Large v3 Turbo de OpenAI. El autor de la conversion es el usuario de Hugging Face `tleskiv`, que ha utilizado la herramienta `argmaxinc/whisperkittools` (v0.4.2) para generar un paquete optimizado para WhisperKit, el runtime de inferencia de Argmax para iOS 17+ y macOS 14+ sobre Apple Silicon y Apple Neural Engine.

El modelo resuelve la transcripcion de audio en hebreo en dispositivos Apple con un consumo de almacenamiento reducido: el paquete completo ocupa aproximadamente 673 MB gracias a la aplicacion de cuantizacion por paletizacion mixta (4 bits en el encoder de audio y 6 bits en el decoder de texto) con descomposicion de valores atipicos. Esto lo hace adecuado para aplicaciones moviles y de escritorio que necesitan transcripcion local sin depender de servicios en la nube.

La relevancia actual radica en la combinacion de un modelo ASR de gran calidad para hebreo (fine-tune de Whisper Large v3 Turbo) con un formato de despliegue nativo para el ecosistema Apple, lo que permite inferencia en el dispositivo con latencia baja y sin conexion. La licencia Apache-2.0 heredada del modelo base facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3 Turbo), convertido a Core ML |
| Parametros totales | no disponible (derivado de Whisper Large v3 Turbo; el paquete Core ML ocupa ~673 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | Paletizacion mixta con descomposicion de valores atipicos: 4 bits (AudioEncoder), 6 bits (TextDecoder), Float16 (TextDecoderContextPrefill, MelSpectrogram) |
| Idiomas soportados | Hebreo (`he`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`mlmodelc`) empaquetado para WhisperKit |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Large v3 Turbo de OpenAI, un transformer encoder-decoder con atencion estandar disenada para transcripcion y traduccion de voz. El modelo base `ivrit-ai/whisper-large-v3-turbo` es un fine-tuning realizado por ivrit.ai sobre el checkpoint original de OpenAI, especializado en hebreo. No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el fine-tuning.

La innovacion tecnica de esta publicacion reside en la conversion a Core ML mediante Outlier-Decomposed Mixed-Bit Palettization, una tecnica que reduce el peso del modelo aplicando paletizacion de baja precision (4 y 6 bits) y aislando los valores atipicos en componentes dispersos para preservar la fidelidad numerica. El autor documenta verificaciones PSNR de la conversion torch a Core ML: 53,4 dB para el AudioEncoder, 40,4 dB para el TextDecoder, 87,8 dB y 93,2 dB (claves y valores) para el TextDecoderContextPrefill, y 67,3 dB para el MelSpectrogram. El paquete resultante esta pensado para ejecutarse en el Apple Neural Engine mediante WhisperKit.

## Capacidades

- Reconocimiento automatico del habla (ASR) en hebreo con salida de texto transcrito.
- Generacion de marcas de tiempo a nivel de palabra (`wordTimestamps: true` en `DecodingOptions`).
- Ejecucion local en dispositivo sobre iOS 17+ y macOS 14+ con Apple Silicon y Apple Neural Engine.
- Inferencia sin conexion a red una vez descargado el paquete.
- Integracion nativa con el framework WhisperKit en Swift.
- Deteccion de idioma deshabilitada por recomendacion del autor: el fine-tuning en hebreo degrada la deteccion automatica, por lo que debe fijarse `language: "he"` explicitamente.
- No se documentan capacidades de traduccion, diarizacion de hablantes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones y entrevistas en hebreo en macOS: la aplicacion puede procesar audio localmente con WhisperKit y generar transcripciones con marcas de tiempo por palabra, sin enviar datos a servidores externos.
- Subtitulado automatico de video en hebreo: el soporte de `wordTimestamps` permite alinear subtitulos con precision a nivel de palabra para plataformas de edicion o publicacion.
- Aplicaciones de notas de voz para iOS: el paquete de 673 MB cabe en el almacenamiento de un dispositivo movil y permite dictado y transcripcion offline en la app.
- Asistentes de accesibilidad: transcripcion en tiempo real de conversaciones para personas con discapacidad auditiva en entornos sin conectividad.
- Herramientas de investigacion cualitativa: procesamiento por lotes de grabaciones en hebreo en un Mac con Apple Silicon, aprovechando la ejecucion en el Neural Engine para reducir el consumo energetico.
- Archivado y busqueda de contenido audiovisual: indexacion de audio en hebreo mediante transcripcion local para construir indices de busqueda textual sobre archivos de audio o video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta metricas de fidelidad de la conversion (PSNR) entre el modelo original en torch y el modelo convertido a Core ML, que no constituyen benchmarks de calidad ASR (WER, CER) ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en el Apple Neural Engine y en memoria unificada de Apple Silicon. El paquete descargado ocupa aproximadamente 673 MB.
- GPU recomendadas: Apple Silicon (serie M) con soporte para Apple Neural Engine; el autor indica compatibilidad con iOS 17+ y macOS 14+.
- Cabe en dispositivos de consumo: si, en iPhone y iPad con iOS 17+ y en Mac con Apple Silicon y macOS 14+.
- Opciones de despliegue: WhisperKit (framework Swift de Argmax) sobre Core ML. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es Core ML y la tarea es ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| tleskiv/whisperkit-coreml (este modelo) | no disponible (~673 MB en Core ML) | ventana de 30 s (Whisper) | Hebreo | Apache-2.0 | Core ML / WhisperKit |
| ivrit-ai/whisper-large-v3-turbo | no disponible (Whisper Large v3 Turbo) | ventana de 30 s (Whisper) | Hebreo | Apache-2.0 | safetensors / PyTorch |
| openai/whisper-large-v3-turbo | no disponible (Whisper Large v3 Turbo) | ventana de 30 s (Whisper) | Multilingue | MIT (checkpoint original) | safetensors / PyTorch |

La comparativa se limita a los modelos citados en la informacion disponible; no se dispone de datos de rendimiento (WER) para establecer una comparacion cuantitativa entre ellos.

## Limitaciones y advertencias

- La deteccion automatica de idioma se degrada tras el fine-tuning en hebreo; es obligatorio fijar `language: "he"` y `detectLanguage: false` para evitar transcripciones erroneas.
- El modelo esta especializado exclusivamente en hebreo; no debe esperarse un rendimiento correcto en otros idiomas.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente en segmentos de silencio, ruido o audio de baja calidad.
- La cuantizacion por paletizacion (4 y 6 bits) introduce perdida de precision respecto al modelo original; el autor documenta PSNR de conversion, pero no se han publicado evaluaciones de WER que cuantifiquen el impacto en la calidad de transcripcion.
- Dependencia del ecosistema Apple: requiere iOS 17+, macOS 14+ y hardware Apple Silicon con Neural Engine; no es desplegable en otras plataformas sin reconversion.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial con atribucion; deben conservarse los avisos de licencia y atribucion a ivrit.ai, OpenAI y Argmax.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria documentada.
- No se dispone de informacion sobre sesgos especificos del fine-tuning en hebreo ni sobre la composicion demografica de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tleskiv/whisperkit-coreml
- Modelo base: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo
- Herramienta de conversion whisperkittools: https://github.com/argmaxinc/whisperkittools
- Framework WhisperKit: https://github.com/argmaxinc/WhisperKit
- Sitio de ivrit.ai: https://www.ivrit.ai/

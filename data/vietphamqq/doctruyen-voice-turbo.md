# vietphamqq/doctruyen-voice-turbo

## Resumen

doctruyen-voice-turbo es un paquete de pesos en formato ONNX para síntesis de voz (text-to-speech) en vietnamita, publicado por el usuario vietphamqq como artefacto de inferencia del modelo base VieNeu-TTS v3 Turbo de pnnbao-ump. No se trata de un modelo entrenado desde cero, sino de una conversión a int8 ONNX de los grafos de un TTS preexistente, empaquetada junto con un decodificador de audio (MOSS Audio Tokenizer Nano, también en ONNX) y las tablas de embeddings necesarias para ejecutarlo. El repositorio ocupa 0,2 GB y está pensado para descarga e inferencia en dispositivo (on-device) dentro de la aplicación DocTruyen.ai, que verifica cada fichero contra un `manifest.json` con tamaños y hashes SHA-256.

El modelo resuelve el problema de generar voz vietnamita de calidad a 48 kHz en entornos con recursos limitados, evitando la dependencia de frameworks de deep learning pesados gracias al formato ONNX. La relevancia actual es doble: por un lado, demuestra un patrón de distribución de TTS para aplicaciones móviles o de escritorio con verificación de integridad; por otro, la información pública disponible es muy escasa (cero descargas y cero likes en el momento de la consulta, sin model card técnica detallada sobre arquitectura o entrenamiento), por lo que muchos parámetros deben marcarse como no disponibles.

La licencia es Apache-2.0, heredada de los modelos originales, lo que permite uso comercial con atribución. El idioma soportado es únicamente vietnamita (`vi`), y el paquete incluye nueve voces predefinidas mediante anclas de hablante y códigos de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (TTS basado en el modelo base VieNeu-TTS v3 Turbo; grafos ONNX separados de prefill, decode step y acoustic cached) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (grafos ONNX) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + ficheros `.data`), embeddings en float32 little-endian (`.f32`), tokenizer en JSON |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base VieNeu-TTS v3 Turbo ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se documenta es la estructura del artefacto de inferencia: tres grafos ONNX para el modelo (`vieneu_prefill.onnx`, `vieneu_decode_step.onnx`, `vieneu_acoustic_cached.onnx`) con un fichero de datos compartido (`vieneu_backbone_shared.data`), un decodificador de audio separado (`moss_audio_tokenizer_decode_full.onnx` con su `.data`) y dos tablas de embeddings expuestas como float32 little-endian (`text_emb.f32`, `audio_emb.f32`).

La innovación técnica destacable es el empaquetado para despliegue on-device: separación de fases prefill/decode, caché acústica, cuantización int8 de todos los grafos y un manifiesto con SHA-256 por fichero para garantizar integridad en la descarga. El decodificador de audio es MOSS Audio Tokenizer Nano en su variante ONNX, que produce audio a 48 kHz. El tokenizer de entrada es fonémico (`tokenizer.json`), y los ajustes del motor se encapsulan en `turbo.json`.

## Capacidades

- Síntesis de voz (text-to-speech) en vietnamita a 48 kHz.
- Nueve voces predefinidas incluidas en el directorio `voices/` (anclas de hablante y códigos de referencia).
- Inferencia on-device mediante ONNX Runtime, sin necesidad de PyTorch ni de frameworks de deep learning completos.
- Tokenización fonémica de la entrada de texto.
- Verificación de integridad de los ficheros descargados mediante `manifest.json` (tamaño y SHA-256).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es un modelo exclusivamente de TTS.
- No se documenta clonación de voz zero-shot más allá de las nueve voces incluidas.

## Casos de uso

- Lectura de libros y artículos en vietnamita dentro de la app DocTruyen.ai: el paquete está diseñado específicamente para descargarse en el primer arranque y generar voz de alta calidad (48 kHz) en el dispositivo, sin enviar texto a servidores externos.
- Aplicaciones móviles de accesibilidad: integración vía ONNX Runtime para leer contenido en pantalla a usuarios con discapacidad visual, aprovechando que el modelo no requiere conexión tras la descarga inicial.
- Audiolibros y pódcast automatizados: conversión por lotes de texto vietnamita a audio con varias voces, útil para producir capítulos con narradores distintos.
- Asistentes de voz locales: generación de respuestas habladas en vietnamita en dispositivos con recursos limitados, gracias a la cuantización int8 y a la separación de grafos prefill/decode.
- Aprendizaje de idiomas: reproducción de texto vietnamita con pronunciación fonémica controlada mediante `tokenizer.json`, útil para materiales de estudio.
- Sistemas de navegación o kioscos sin conectividad: anuncios de voz pregrabados dinámicamente en vietnamita en entornos con red intermitente, validando la integridad de los ficheros al actualizarse.
- Distribución de artefactos de TTS verificables: el patrón de `manifest.json` con SHA-256 sirve como referencia para empaquetar otros modelos ONNX en aplicaciones de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,2 GB, por lo que el conjunto de pesos en int8 cabe holgadamente en memoria de cualquier GPU consumer moderna e incluso en RAM de dispositivos móviles.
- GPU recomendadas: no disponible. Al ser ONNX int8, puede ejecutarse en CPU, GPU integrada o aceleradores NPU compatibles con ONNX Runtime.
- Cabe en GPU consumer: sí, por tamaño (0,2 GB de artefactos); no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime (formato nativo del paquete); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| doctruyen-voice-turbo | no disponible | no disponible | vi | Apache-2.0 | ONNX int8 | Hugging Face (0 descargas) |
| VieNeu-TTS v3 Turbo (base) | no disponible | no disponible | vi | no disponible en la información | no disponible | Hugging Face |
| MOSS Audio Tokenizer Nano (decodificador) | no disponible | no disponible | no disponible | no disponible | ONNX | Hugging Face |

No se dispone de datos de rendimiento ni de otros modelos TTS vietnamitas comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta vietnamita; no hay capacidades multilingües documentadas.
- No se dispone de información sobre sesgos, calidad subjetiva (MOS) ni tasas de alucinación o errores de pronunciación.
- Al ser una conversión int8 de un modelo base, puede existir una pérdida de calidad respecto a los pesos originales en precisión completa; no se cuantifica.
- El repositorio tiene cero descargas y cero likes, sin validación comunitaria ni resultados de benchmarks publicados.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE` y atribuir a los modelos originales (VieNeu-TTS v3 Turbo y MOSS Audio Tokenizer Nano).
- La integridad de los ficheros depende de `manifest.json`; si se modifica o se sirve desde un origen no confiable, la verificación SHA-256 pierde su valor.
- No se documentan requisitos de memoria en tiempo de ejecución ni latencias, lo que dificulta planificar despliegues en producción.
- No apto para tareas de razonamiento, código, visión ni agentes: es exclusivamente un modelo de síntesis de voz.

## Enlaces

- [Hugging Face: vietphamqq/doctruyen-voice-turbo](https://huggingface.co/vietphamqq/doctruyen-voice-turbo)
- [Modelo base: pnnbao-ump/VieNeu-TTS-v3-Turbo](https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo)
- [Decodificador: OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX)

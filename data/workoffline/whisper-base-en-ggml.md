# WorkOffline/whisper-base.en-ggml

## Resumen

`WorkOffline/whisper-base.en-ggml` es un espejo (mirror) sin modificaciones de los ficheros GGML de Whisper `base.en` para whisper.cpp, publicados por el usuario WorkOffline para que su aplicación WorkOffline pueda descargarlos desde un único punto, fijados a una revisión exacta y verificados mediante SHA-256. No se trata de un modelo nuevo ni de un fine-tuning: los bytes son idénticos a los del repositorio upstream `ggerganov/whisper.cpp`, y el modelo original es `openai/whisper-base.en`, desarrollado por OpenAI.

El modelo subyacente es Whisper `base.en`, un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder transformer, especializado exclusivamente en inglés (sufijo `.en`), con aproximadamente 74 millones de parámetros. El repositorio solo contiene el fichero `ggml-base.en.bin` (147.964.211 bytes, ~0,1 GB), en el formato binario propietario de whisper.cpp, listo para inferencia local en CPU o GPU mediante dicha implementación en C/C++.

Su relevancia es práctica: permite obtener un artefacto de ASR ligero, reproducible y verificado criptográficamente para despliegues offline, sin depender de la disponibilidad o de los cambios de revisión del repositorio upstream. No aporta mejoras de rendimiento ni capacidades nuevas respecto a Whisper base.en; su valor es la trazabilidad y la integridad del binario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI) |
| Parámetros totales | ~74 millones (Whisper base; dato no explicitado en la model card, valor estándar de la familia base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantización | no disponible; el único artefacto es `ggml-base.en.bin` en formato GGML de whisper.cpp |
| Idiomas soportados | inglés únicamente (variante `.en`) |
| Licencia | MIT |
| Formato de pesos | GGML binario (`ggml-base.en.bin`) para whisper.cpp |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper `base.en` de OpenAI: un transformer encoder-decoder entrenado para transcripción de voz a texto y traducción, con atención sobre espectrogramas Mel de audio. La variante `.en` está entrenada y ajustada exclusivamente para inglés, lo que suele dar mejores resultados en ese idioma que los modelos multilingües equivalentes de la misma talla. La model card de este repositorio no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o ajuste fino adicional.

La contribución técnica de este repositorio no está en el modelo, sino en el empaquetado: se copia el fichero GGML generado por el proyecto whisper.cpp (`ggerganov/whisper.cpp`, revisión `5359861c739e955e79d9a303bcbc70fb988958b1`) y se documenta su hash SHA-256 (`a03779c86df3323075f5e796cb2ce5029f00ec8869eee3fdfb897afe36c6d002`) y su tamaño exacto (147.964.211 bytes). El formato GGML de whisper.cpp está optimizado para inferencia local eficiente en C/C++, con soporte de CPU y aceleración por GPU (CUDA, Metal, Vulkan, entre otras), y no requiere el stack de PyTorch en tiempo de ejecución.

## Capacidades

- Transcripción de voz a texto en inglés (speech-to-text) a partir de audio.
- Detección de actividad de voz y segmentación por marcas de tiempo a nivel de palabra o segmento (según la implementación de whisper.cpp).
- Traducción de audio en inglés a texto en inglés (la variante `.en` no traduce a otros idiomas).
- Ejecución totalmente offline, sin llamadas a servicios externos.
- Inferencia en CPU y en GPU mediante whisper.cpp.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo ASR puro.
- No tiene capacidades de visión, audio generativo ni modo "thinking".
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Transcripción local de reuniones y notas de voz: el modelo convierte audio en inglés en texto sin salir del dispositivo, adecuado para entornos con requisitos de privacidad o sin conectividad.
- Subtitulado automático de vídeos en inglés: whisper.cpp genera marcas de tiempo que pueden volcarse a formatos SRT/VTT para pipelines de publicación.
- Dictado por voz en aplicaciones de escritorio: al ser un binario GGML ligero (~148 MB), puede integrarse en herramientas de escritorio o móviles con recursos limitados.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones para alimentar motores de búsqueda o sistemas RAG sobre texto.
- Asistentes de accesibilidad: conversión de voz a texto en tiempo real en inglés para personas con dificultades auditivas, ejecutándose en hardware de consumo.
- Verificación de integridad en despliegues: el SHA-256 documentado permite validar el artefacto en pipelines de CI/CD antes de desplegarlo en producción.
- Prototipado rápido de ASR: al ser un fichero único y de pequeño tamaño, sirve para validar flujos de transcripción antes de escalar a modelos mayores (small, medium, large).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero GGML ocupa ~148 MB, por lo que la huella de memoria es muy reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con soporte CUDA, Metal o Vulkan; el modelo es lo bastante pequeño para ejecutarse en GPUs de gama baja e integradas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) e incluso en CPU.
- Opciones de despliegue: whisper.cpp (formato nativo GGML); también puede convertirse a otros formatos compatibles con implementaciones derivadas, aunque no se documenta en la model card.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-base.en (este repo, GGML) | ~74 M | inglés | ventanas de 30 s | MIT | GGML |
| openai/whisper-base (multilingüe) | ~74 M | multilingüe | ventanas de 30 s | MIT | PyTorch/safetensors |
| openai/whisper-small.en | ~244 M | inglés | ventanas de 30 s | MIT | PyTorch/safetensors |
| openai/whisper-tiny.en | ~39 M | inglés | ventanas de 30 s | MIT | PyTorch/safetensors |

Los datos de parámetros y contexto corresponden a la familia Whisper estándar; la model card de este repositorio no aporta métricas comparativas de rendimiento (WER, latencia), por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Solo inglés: la variante `.en` no transcribe ni traduce otros idiomas.
- No es un modelo nuevo: no incorpora mejoras respecto a Whisper base.en; cualquier limitación del original (errores en audio con ruido, acentos marcados, jerga) se mantiene.
- Riesgo de alucinación en ASR: Whisper puede generar texto plausible en segmentos de silencio o audio ininteligible; conviene validar en producción.
- Sesgos: hereda los sesgos del dataset de entrenamiento de OpenAI, no documentados en esta model card.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribución a OpenAI y a whisper.cpp.
- Repositorio con 0 descargas y 0 likes: artefacto de espejo de un tercero, no mantenido por OpenAI; la trazabilidad depende de la revisión fijada.
- El formato GGML es específico de whisper.cpp; no es directamente cargable por frameworks como PyTorch o Transformers sin conversión.
- No se documentan métricas de calidad (WER) ni requisitos de hardware en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WorkOffline/whisper-base.en-ggml
- Modelo original: https://huggingface.co/openai/whisper-base.en
- Ficheros GGML de whisper.cpp: https://huggingface.co/ggerganov/whisper.cpp
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Licencia MIT de Whisper: https://github.com/openai/whisper/blob/main/LICENSE

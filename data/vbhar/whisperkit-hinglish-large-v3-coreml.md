# vbhar/whisperkit-hinglish-large-v3-coreml

## Resumen

`vbhar/whisperkit-hinglish-large-v3-coreml` es una conversión a Core ML en precisión float16 del modelo `Trelis/whisper-hinglish-preview`, un ajuste fino de Whisper large-v3 especializado en el reconocimiento de voz con cambio de código (code-switching) entre hindi e inglés (hinglish). El modelo está empaquetado para su uso con WhisperKit, el kit de desarrollo de Apple para inferencia de voz en el dispositivo, y se distribuye como bundles compilados `.mlmodelc` listos para integrarse en aplicaciones macOS 14+ e iOS 17+.

La conversión fue realizada por el autor `vbhar` utilizando las herramientas de `argmaxinc/whisperkittools`. El modelo original pertenece a Trelis, que a su vez se basa en el trabajo de ARTPARK-IISc y en la arquitectura de OpenAI. La licencia es Apache-2.0, lo que permite uso comercial con atribución. El repositorio ocupa 3,1 GB e incluye únicamente la variante float16, sin cuantizaciones adicionales ni datos de prefill del decodificador.

La relevancia de este modelo radica en su capacidad para transcribir audio en hinglish de forma local en dispositivos Apple, sin necesidad de conexión a internet, y con la ventaja de que el cambio de código entre idiomas se maneja de manera natural dentro de la misma frase. Es una opción práctica para aplicaciones de transcripción, subtitulado y asistentes de voz en el ecosistema Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3 (seq2seq transformer) convertido a Core ML |
| Parametros totales | no disponible (el modelo base whisper-large-v3 tiene 1550M, pero no se confirma para esta conversion) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (Whisper usa ventanas de audio de 30 segundos, no se especifica en la conversion) |
| Tipos de cuantizacion | solo float16 (no se incluyen variantes cuantizadas) |
| Idiomas soportados | hindi (hi), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una conversión de pesos ya existentes. El modelo base `Trelis/whisper-hinglish-preview` es un ajuste fino de `ARTPARK-IISc/whisper-large-v3-vaani-hindi`, que a su vez deriva de `openai/whisper-large-v3`. El proceso de conversión consistió en:

- Transformar los pesos de float32 a float16.
- Compilar los componentes del modelo (MelSpectrogram, AudioEncoder, TextDecoder) en bundles Core ML.
- Ajustar el vocabulario de 51867 a 51866 tokens, eliminando el token de control `<|mixedcode|>` para que WhisperKit seleccione correctamente el tokenizador de whisper-large-v3.

No se realizó ningún fine-tuning, destilación, poda ni reentrenamiento durante la conversión. El modelo original fue entrenado por Trelis sobre datos de habla hinglish, pero los detalles específicos del dataset de entrenamiento (número de horas, composición, método de alineación) no se proporcionan en la información disponible.

## Capacidades

- Reconocimiento automático de voz (ASR) para audio en hindi e inglés, con soporte de cambio de código intra-frase.
- Transcripción en escritura Devanagari para hindi y alfabeto latino para inglés, alternando según el idioma detectado en cada segmento.
- Inferencia local en dispositivos Apple Silicon (macOS 14+, iOS 17+) mediante el framework Core ML y WhisperKit.
- Integración con la API Swift de WhisperKit para transcripción en tiempo real o por lotes.
- No incluye capacidades de traducción, generación de texto ni otras tareas más allá del ASR.
- No se ha verificado soporte de tool calling, agentes u otras funcionalidades avanzadas; el modelo es exclusivamente de reconocimiento de voz.

## Casos de uso

- Transcripción de reuniones y entrevistas en entornos corporativos: el modelo puede procesar audio de reuniones donde se mezcla hindi e inglés, generando transcripciones con la escritura adecuada para cada idioma. Su ejecución local garantiza privacidad de los datos.
- Subtitulado automático de vídeos para creadores de contenido: al integrarse en aplicaciones de edición en macOS, permite generar subtítulos en hinglish sin depender de servicios en la nube.
- Asistentes de voz en dispositivos móviles: aplicaciones iOS que necesiten entender comandos de voz en hinglish pueden usar este modelo para el reconocimiento, con baja latencia al ejecutarse en el Neural Engine.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones en hinglish para mostrar texto en pantalla.
- Archivado y búsqueda de audio: convertir grabaciones de audio en texto indexable para facilitar búsquedas posteriores en aplicaciones de notas o gestión documental.
- Herramientas de aprendizaje de idiomas: aplicaciones que necesiten transcribir pronunciaciones de estudiantes en hinglish para evaluar su fluidez o corregir errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base whisper-large-v3 reporta una reducción del 10-20% en errores frente a large-v2, pero no hay métricas específicas (WER, CER) para la conversión Core ML ni para el ajuste hinglish.

## Requisitos de hardware

- Dispositivos Apple Silicon: macOS 14+ (Apple M1 o posterior) e iOS 17+ (iPhone 12 o posterior).
- Espacio en disco: aproximadamente 2,9 GB para los pesos compilados (encoder ~1,2 GB, decoder ~1,7 GB).
- Memoria RAM: no se especifica, pero al ser float16, se estima que puede ejecutarse en dispositivos con 8 GB de RAM o más, aunque el uso real depende de la longitud del audio procesado.
- No se requiere GPU dedicada; la inferencia se ejecuta en el Neural Engine de Apple.
- Opciones de despliegue: integración mediante WhisperKit en Swift, o descarga directa de los bundles `.mlmodelc` para uso con otras herramientas que soporten Core ML.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `vbhar/whisperkit-hinglish-large-v3-coreml` | no disponible | no disponible | hi, en | Apache-2.0 | Core ML |
| `openai/whisper-large-v3` | 1550M | 30 s de audio | 99 idiomas | MIT | safetensors, GGUF, etc. |
| `Trelis/whisper-hinglish-preview` | no disponible | no disponible | hi, en | Apache-2.0 | safetensors (transformers) |

La comparativa directa con otros modelos de ASR en hinglish no está disponible. La principal diferencia con el modelo original de OpenAI es la especialización en hinglish y el formato Core ML optimizado para Apple, a costa de una cobertura multilingüe más reducida.

## Limitaciones y advertencias

- Solo incluye la variante float16; no se publican cuantizaciones porque, según el autor, una versión cuantizada mostró errores graves (emisión de la cadena literal `nan`) en audio con code-switching real, mientras que pasaba en clips cortos en inglés. Se recomienda probar cualquier conversión cuantizada con audio propio.
- El token `<|mixedcode|>` fue eliminado del vocabulario; aunque en la práctica no se necesita, podría afectar a casos extremos de code-switching no contemplados.
- El modelo está limitado a hindi e inglés; no soporta otros idiomas.
- El tamaño de 2,9 GB puede ser elevado para aplicaciones con restricciones de almacenamiento.
- No se proporcionan datos de rendimiento (WER) ni benchmarks específicos para esta conversión.
- Al ser una conversión sin reentrenamiento, las limitaciones del modelo base (posibles sesgos, errores en acentos o ruido) se mantienen.
- La licencia Apache-2.0 permite uso comercial, pero se debe incluir la atribución correspondiente según el aviso de modificaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vbhar/whisperkit-hinglish-large-v3-coreml
- Modelo base (Trelis): https://huggingface.co/Trelis/whisper-hinglish-preview
- Modelo intermedio (ARTPARK-IISc): https://huggingface.co/ARTPARK-IISc/whisper-large-v3-vaani-hindi
- Arquitectura original (OpenAI): https://huggingface.co/openai/whisper-large-v3
- WhisperKit (Swift package): https://github.com/argmaxinc/WhisperKit
- Herramientas de conversión (whisperkittools): https://github.com/argmaxinc/whisperkittools

# voxor-ai/cohere-transcribe-arabic-coreml

## Resumen

Cohere Transcribe Arabic Core ML es una conversión del codificador de audio del modelo CohereLabs/cohere-transcribe-arabic-07-2026 a formato Core ML, publicada por voxor-ai. No se trata de un modelo completo de reconocimiento automático del habla (ASR), sino únicamente de la etapa de codificación acústica, empaquetada en tres submodelos (`chunk00`, `chunk01`, `chunk02`) que deben ejecutarse secuencialmente. El objetivo es permitir la inferencia en dispositivos Apple (iOS 17 / macOS 14 o superior) aprovechando el framework Core ML y el hardware Neural Engine.

La relevancia de esta conversión radica en que traslada un componente de un pipeline ASR de gran tamaño a un formato optimizado para ejecución local en el ecosistema Apple, con pesos cuantizados a int8 y cómputo en fp16. El autor reporta una similitud coseno media de 0,9996 (mínima 0,9993) respecto al codificador original sin convertir, y un WER del 4,02 % en FLEURS Arabic sobre 60 clips, idéntico al del codificador original en el mismo pipeline.

El repositorio ocupa 1,9 GB y se distribuye bajo licencia Apache 2.0. No se especifican parámetros totales, longitud de contexto lingüístico ni idiomas soportados más allá del árabe implícito en el modelo base. La información disponible se limita a la model card y a los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio de un modelo ASR (transformador, según el modelo base); empaquetado como tres submodelos Core ML secuenciales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Entrada de 30 s de audio (128 mel bins x 3000 frames); 375 filas válidas en la salida del codificador |
| Tipos de cuantizacion | Pesos int8, cómputo fp16 |
| Idiomas soportados | Árabe (implícito en el modelo base); no se detalla la lista completa |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlmodelc` (Core ML compilado) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al codificador de audio del modelo CohereLabs/cohere-transcribe-arabic-07-2026, un sistema ASR del que esta publicación solo incluye la etapa de codificación acústica. La conversión divide el codificador en tres bloques Core ML que se ejecutan en orden: `chunk00` recibe la representación log-mel de 30 segundos (`mel` [1, 128, 3000] float32) junto con la longitud válida en frames (`length` [1] int32) y produce una salida oculta de [1, 375, 1280] float32. Los bloques `chunk01` y `chunk02` consumen esa salida junto con máscaras de atención (`key_mask` [1, 1, 1, 375] y `pad_mask` [1, 375, 1]) y generan nuevas salidas ocultas; `chunk02` produce además `audio_features` [1, 375, 1024] float32, que es la representación acústica que consumiría el decodificador del pipeline ASR original.

El número de filas válidas se calcula mediante la fórmula `n = floor((floor((floor((length - 1) / 2) + 1 - 1) / 2) + 1 - 1) / 2) + 1`, lo que refleja tres etapas de submuestreo temporal en el codificador. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo ajuste fino con RLHF o DPO en el modelo base. La innovación técnica destacable es la propia conversión a Core ML con cuantización int8 de pesos y cómputo fp16, que habilita la ejecución en Neural Engine de dispositivos Apple manteniendo una fidelidad numérica muy alta respecto al original.

## Capacidades

- Extracción de características acústicas a partir de audio log-mel de 30 segundos, con salida de 375 marcos temporales y 1024 dimensiones (`audio_features`).
- Procesamiento por bloques secuenciales que permite dividir el codificador en tres submodelos Core ML independientes.
- Soporte de máscaras de atención y de relleno para manejar secuencias de audio de duración variable dentro de la ventana de 30 segundos.
- Ejecución en dispositivos Apple con iOS 17 o macOS 14 en adelante, aprovechando Core ML y el Neural Engine.
- No incluye decodificación de texto: es únicamente el codificador; requiere un decodificador externo del pipeline Cohere Transcribe para producir transcripciones.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento.
- Capacidad multilingüe: no documentada; el modelo base está orientado al árabe.

## Casos de uso

- Transcripción de audio en local en dispositivos Apple: integrado con el decodificador correspondiente del pipeline Cohere Transcribe, el codificador permite construir una app de dictado o subtitulado que se ejecuta íntegramente en el dispositivo, sin enviar audio a servidores externos.
- Procesamiento por lotes de archivos de audio de hasta 30 segundos: el bloque `chunk00` acepta un tensor `mel` de tamaño fijo, lo que facilita el preprocesado por lotes en macOS para pipelines de transcripción masiva.
- Aplicaciones de accesibilidad en iOS: un codificador Core ML puede alimentar funciones de subtitulado en tiempo real o transcripción de notas de voz dentro de una app nativa, aprovechando el Neural Engine para reducir consumo energético.
- Integración en pipelines híbridos: usar el codificador Core ML en el dispositivo para extraer `audio_features` y enviar solo esas representaciones (1, 375, 1024) a un servidor que ejecute el decodificador, reduciendo el ancho de banda frente al envío del audio original.
- Investigación en eficiencia de inferencia: sirve como referencia para estudiar el impacto de la cuantización int8 y el cómputo fp16 en la fidelidad de un codificador ASR, con métricas de similitud coseno publicadas (0,9996 media, 0,9993 mínima).
- Prototipado de ASR en árabe para macOS: desarrolladores que necesiten validar un pipeline de reconocimiento de voz en árabe sin infraestructura GPU pueden usar esta conversión junto con el decodificador del modelo base en un Mac.
- Evaluación comparativa de backends: permite contrastar el rendimiento de Core ML frente a otros runtimes (PyTorch, ONNX) sobre el mismo codificador, usando el WER de FLEURS Arabic (4,02 %) como referencia de calidad.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Similitud coseno media respecto al codificador sin convertir | 0,9996 |
| Similitud coseno mínima respecto al codificador sin convertir | 0,9993 |
| WER en FLEURS Arabic (60 clips) | 4,02 % |
| WER del codificador original en el mismo pipeline | 4,02 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un codificador ASR y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo está pensado para ejecución en dispositivos Apple mediante Core ML, no para GPU NVIDIA.
- Tamaño del repositorio: 1,9 GB, que incluye los tres submodelos `.mlmodelc` con pesos int8.
- GPU recomendadas: no disponibles; el destino son el Neural Engine y la GPU integrada de chips Apple (serie M y A) con iOS 17 / macOS 14 o superior.
- Compatibilidad con GPU de consumo: no está diseñado para GPUs de consumo NVIDIA ni AMD; requiere el runtime de Core ML.
- Opciones de despliegue: Core ML en apps iOS/macOS; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| voxor-ai/cohere-transcribe-arabic-coreml | Codificador ASR (Core ML) | no disponible | 30 s de audio | Apache 2.0 | `.mlmodelc` |
| CohereLabs/cohere-transcribe-arabic-07-2026 | Pipeline ASR completo (modelo base) | no disponible | no disponible | no disponible | no disponible |
| Whisper (variantes de OpenAI) | ASR completo | 39 M - 1,55 B | 30 s de audio | MIT | safetensors, GGUF, etc. |
| Otros codificadores ASR convertidos a Core ML | Codificador ASR | variable | variable | variable | `.mlmodelc` |

La comparación con Whisper es solo orientativa por categoría de tarea (ASR de audio de 30 s); no se dispone de datos de rendimiento comparables entre ambos en la información proporcionada. No se identifican otras conversiones Core ML específicas del mismo modelo base en los datos disponibles.

## Limitaciones y advertencias

- No es un modelo ASR completo: carece de decodificador, por lo que no produce transcripciones por sí solo.
- Solo procesa ventanas de 30 segundos de audio; audios más largos requieren segmentación externa.
- El modelo base está orientado al árabe; no se documenta el comportamiento en otros idiomas.
- Requiere iOS 17 / macOS 14 o superior y el runtime de Core ML; no es portable a otros entornos sin reconversión.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento en variedades dialectales del árabe.
- Riesgo de alucinación en la transcripción final: aunque el codificador es fiel al original (similitud 0,9996), los errores del decodificador del pipeline subyacente se mantienen.
- La licencia Apache 2.0 permite uso comercial, pero debe revisarse el archivo `NOTICE` incluido en el repositorio por posibles atribuciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/voxor-ai/cohere-transcribe-arabic-coreml
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Documentación de Core ML: https://developer.apple.com/documentation/coreml
- FLEURS (benchmark multilingüe): https://huggingface.co/datasets/google/fleurs

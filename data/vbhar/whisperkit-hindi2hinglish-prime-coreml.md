# vbhar/whisperkit-hindi2hinglish-prime-coreml

## Resumen

`whisperkit-hindi2hinglish-prime-coreml` es una conversión a Core ML en precisión float16 del modelo `Oriserve/Whisper-Hindi2Hinglish-Prime`, un ajuste fino de Whisper Large V3 especializado en reconocimiento de voz para hindi e inglés con alternancia de código (code-switching), conocido como hinglish. El modelo original fue desarrollado por Oriserve y esta conversión ha sido empaquetada por el usuario vbhar para su uso con WhisperKit en dispositivos Apple Silicon (macOS 14+ e iOS 17+).

El modelo resuelve el problema de transcribir audio con acentos indios y ruido de fondo, generando salida en hinglish romanizado (escritura latina) en lugar de devanagari. Es relevante ahora porque permite ejecutar inferencia on-device en hardware Apple sin conexión a servidores, aprovechando la Neural Engine. La arquitectura subyacente es la de Whisper Large V3 (transformer encoder-decoder con aproximadamente 1550 millones de parámetros), con una ventana de contexto de 30 segundos de audio.

La conversión incluye los bundles compilados `.mlmodelc` listos para usar con la API Swift de WhisperKit. No se incluyen variantes cuantizadas ni datos de prefill del decodificador, y se eligió float16 deliberadamente tras observar que una versión cuantizada producía salidas con el literal `nan` en audio real con code-switching.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Large V3 (transformer encoder-decoder) |
| Parametros totales | ~1550 millones (no confirmado en la informacion, se infiere de Whisper Large V3) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | float16 (sin cuantizacion adicional) |
| Idiomas soportados | hindi (hi), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (.mlmodelc) compilado; el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base es `Oriserve/Whisper-Hindi2Hinglish-Prime`, un ajuste fino de `openai/whisper-large-v3` sobre datos de audio en hinglish. Whisper Large V3 emplea una arquitectura transformer encoder-decoder con atención estándar, diseñada para transcribir audio de hasta 30 segundos por pasada. El ajuste fino se realizó con datos que incluyen acentos indios y ruido de fondo, optimizando la transcripción hacia hinglish romanizado (escritura latina) en lugar de devanagari.

La conversión a Core ML se realizó con `whisperkittools` bajo Python 3.11, convirtiendo los pesos de float32 a float16 y compilando los modelos para la Neural Engine. Durante la conversión se tuvo que resolver un problema: el `generation_config.json` del modelo original traía `alignment_heads: null`, lo que causaba un error en el trazado del decodificador. Se sustituyeron por los valores estándar de Whisper Large V3 (10 pares `[layer, head]`), que son idénticos a los usados en el modelo hermano `vbhar/whisperkit-hinglish-large-v3-coreml`. Esta modificación solo afecta a la selección de atención para timestamps de palabras, no a los pesos de transcripción.

No se aplicó ningún reentrenamiento, destilación, poda ni cambio de vocabulario en la conversión. Los pesos se mantienen sin modificar salvo la reducción de precisión a float16.

## Capacidades

- Transcripción de voz en hinglish (mezcla de hindi e inglés) con salida en escritura latina romanizada.
- Reconocimiento de voz robusto frente a acentos indios y ruido de fondo, según el propósito del modelo original.
- Generación de timestamps a nivel de palabra (gracias a los `alignment_heads` estándar de Whisper Large V3).
- Inferencia on-device en Apple Silicon mediante la Neural Engine, sin conexión a internet.
- Integración con WhisperKit: permite cargar el modelo desde HuggingFace o desde un directorio local y transcribir archivos de audio con la API Swift.
- Soporte de transcripción en inglés estándar (el modelo base conserva las capacidades multilingües de Whisper Large V3, aunque el ajuste se centra en hinglish).

## Casos de uso

- Transcripción de reuniones y videollamadas en entornos corporativos indios: el modelo transcribe audio con mezcla de hindi e inglés, generando actas en texto latino que pueden integrarse en herramientas de productividad.
- Subtitulado automático de vídeos en hinglish para plataformas de contenido: la salida romanizada facilita la generación de subtítulos en aplicaciones de edición de vídeo en macOS.
- Asistentes de voz on-device para dispositivos Apple: al ejecutarse localmente, permite aplicaciones de dictado o comandos de voz sin enviar audio a la nube, con latencia reducida.
- Análisis de llamadas de atención al cliente en centros de soporte con hablantes bilingües: la transcripción en hinglish romanizado puede alimentar sistemas de análisis de sentimiento o búsqueda de palabras clave.
- Accesibilidad para personas con discapacidad auditiva en contextos donde se habla hinglish: transcripción en tiempo real en dispositivos iPhone o Mac.
- Evaluación y desarrollo de pipelines de ASR en entornos Apple: los desarrolladores pueden usar este modelo como referencia para comparar con otras conversiones de Whisper o para prototipar aplicaciones de transcripción sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como WER o CER para el modelo original ni para esta conversión. Tampoco se proporcionan comparativas con otros modelos en la documentación consultada.

## Requisitos de hardware

- Tamaño en disco: aproximadamente 2.9 GB (el paquete completo del repo ocupa 3.1 GB).
- VRAM: no aplica directamente, ya que Core ML gestiona la memoria unificada en Apple Silicon. Se recomienda al menos 8 GB de RAM unificada para cargar el modelo en memoria.
- GPU/ANE: requiere Apple Silicon con Neural Engine (ANE). Compatible con macOS 14+ y iOS 17+. No soporta Macs con procesadores Intel.
- Primera carga: la compilación del modelo por parte de la Neural Engine tarda entre 115 y 190 segundos en un M-series. Las cargas posteriores en caliente tardan entre 1 y 3 segundos.
- Opciones de despliegue: WhisperKit (Swift API) es el entorno principal. Para inferencia en Python se debe usar el repositorio original `Oriserve/Whisper-Hindi2Hinglish-Prime` con la librería `transformers` de HuggingFace.
- Latencia y throughput: no se especifican valores concretos en la documentación. Dependerá del chip concreto (M1, M2, M3, etc.) y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `vbhar/whisperkit-hindi2hinglish-prime-coreml` (este) | Whisper Large V3 fine-tuned | ~1550 M | 30 s audio | Apache-2.0 | Core ML |
| `Oriserve/Whisper-Hindi2Hinglish-Prime` (original) | Whisper Large V3 fine-tuned | ~1550 M | 30 s audio | Apache-2.0 | Safetensors |
| `openai/whisper-large-v3` | Whisper Large V3 | ~1550 M | 30 s audio | MIT (pesos) / Apache-2.0 (código) | Safetensors, GGUF, etc. |
| `vbhar/whisperkit-hinglish-large-v3-coreml` (hermano) | Whisper Large V3 fine-tuned | ~1550 M | 30 s audio | Apache-2.0 | Core ML |

La principal diferencia frente a Whisper Large V3 original es la especialización en hinglish y la salida romanizada. Frente al modelo original de Oriserve, esta conversión añade la ventaja de estar lista para Core ML, pero no ofrece mejoras de rendimiento en precisión. El modelo hermano `whisperkit-hinglish-large-v3-coreml` es muy similar, aunque este repo concreto se basa en la variante "Prime" que el autor describe como de mejor rendimiento que la variante "Swift".

## Limitaciones y advertencias

- Solo funciona en Apple Silicon (macOS 14+ / iOS 17+); no hay soporte para Intel Mac ni para otras plataformas.
- La salida es en hinglish romanizado (escritura latina), no en devanagari. Esto puede ser una limitación si se necesita texto en escritura original.
- El tamaño en disco es elevado (~2.9 GB), lo que puede ser un inconveniente para aplicaciones móviles con restricciones de almacenamiento.
- La primera carga es lenta (115-190 segundos) debido a la compilación de la Neural Engine. Es imprescindible cachear los artefactos compilados y no poner la primera carga en una ruta visible al usuario sin indicador de progreso.
- No se incluyen variantes cuantizadas. El autor advierte que una versión cuantizada que probó producía el literal `nan` en audio real con code-switching, aunque pasaba pruebas cortas en inglés. Esto subraya que la cuantización puede fallar en entradas específicas.
- El modelo puede alucinar o transcribir incorrectamente en condiciones de audio muy ruidoso o con idiomas fuera de su especialización, como cualquier sistema ASR.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de atribución y declarar las modificaciones (en este caso, la conversión de precisión y compilación).
- No hay datos de benchmarks públicos para esta conversión, por lo que no se puede verificar su rendimiento relativo frente a otras alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vbhar/whisperkit-hindi2hinglish-prime-coreml
- Modelo original de Oriserve: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Prime
- WhisperKit (GitHub): https://github.com/argmaxinc/WhisperKit
- Herramientas de conversión whisperkittools: https://github.com/argmaxinc/whisperkittools
- Modelo hermano (conversión Core ML de Whisper Large V3 hinglish): https://huggingface.co/vbhar/whisperkit-hinglish-large-v3-coreml
- Repositorio de Oriserve con código y documentación: https://github.com/OriserveAI/Whisper-Hindi2Hinglish/tree/main
- Whisper Large V3 original: https://huggingface.co/openai/whisper-large-v3

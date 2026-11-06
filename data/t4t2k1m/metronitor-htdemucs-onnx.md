# t4t2k1m/metronitor-htdemucs-onnx

## Resumen

Metronitor HT-Demucs ONNX es un espejo byte a byte del modelo `htdemucs_fp16weights.onnx` publicado originalmente en el repositorio `StemSplitio/htdemucs-onnx`. Se trata de una exportación a formato ONNX del modelo Hybrid Transformer Demucs (`htdemucs`) desarrollado por Meta Platforms (facebookresearch/demucs), orientado a la separación de fuentes musicales en cuatro pistas: batería, bajo, otros instrumentos y voz.

El modelo no es un modelo de lenguaje ni un transformer generativo de texto: es un modelo de audio-to-audio que recibe una mezcla musical y devuelve los stems separados. Su relevancia radica en que empaqueta el estado del arte en separación de fuentes (la arquitectura htdemucs de Demucs v4) en un único fichero ONNX de aproximadamente 165 MB con pesos en fp16, lo que permite ejecución on-device en dispositivos iOS y Android sin depender de frameworks de Python ni de pesos PyTorch.

Este repositorio concreto existe para que la aplicación Metronitor (separación de stems en el dispositivo) no dependa de que un repositorio de terceros permanezca en línea. El autor declara explícitamente que el fichero no está modificado y que no reclama derechos nuevos sobre él. La licencia es MIT en todas las capas (modelo original, exportación ONNX y espejo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Transformer Demucs (htdemucs): U-Net con capas convolucionales y atención transformer sobre espectrogramas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | pesos en fp16 (fichero único); no se documentan otras variantes en este repo |
| Idiomas soportados | no aplica (procesamiento de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (onnxruntime), fichero `htdemucs_fp16weights.onnx` de 165.612.636 bytes |
| Stems de salida | drums, bass, other, vocals |
| SHA-256 del fichero | `d05c269d0178d2a72ad484b10b11dd370193fc923201c3b27a99f848745db70a` |

## Arquitectura y entrenamiento

El modelo subyacente es Hybrid Transformer Demucs (htdemucs), la arquitectura de Demucs v4 de Meta. Combina un encoder/decoder convolucional de tipo U-Net con bloques de atención transformer que operan sobre representaciones tiempo-frecuencia, lo que permite capturar dependencias de largo alcance en la señal de audio además de las estructuras locales que capturan las convoluciones. El resultado son cuatro stems independientes (batería, bajo, otros y voz) a partir de una mezcla estéreo.

Según la model card, el modelo se entrenó sobre MUSDB18-HQ más datos internos adicionales de Meta, tal como se describe en el paper de Demucs. No se detalla en la información disponible el número exacto de horas de audio, la composición precisa del dataset interno, ni si se aplicaron etapas de fine-tuning específicas más allá del entrenamiento descrito en la publicación original. La exportación a ONNX y la conversión a fp16 las realizó StemSplit; este repositorio es un espejo sin modificaciones.

## Capacidades

- Separación de fuentes musicales en cuatro stems: batería, bajo, otros y voz.
- Procesamiento de audio estéreo de mezclas musicales completas.
- Ejecución mediante ONNX Runtime, sin dependencia de PyTorch en inferencia.
- Pesos en fp16, lo que reduce el tamaño del fichero a unos 165 MB y facilita el despliegue en dispositivos móviles.
- Capacidad de ejecución on-device (iOS y Android) según el caso de uso declarado por el autor del espejo.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente audio-to-audio.
- No dispone de capacidades multilingües en el sentido de NLP; el procesamiento es independiente del idioma.

## Casos de uso

- Aplicaciones móviles de karaoke: el modelo aísla la pista de voz del resto de la mezcla para permitir al usuario cantar sobre la instrumental, con inferencia local en el dispositivo gracias al fichero ONNX de 165 MB.
- Remezcla y producción musical: un productor puede extraer el stem de batería o de bajo para samplear o reutilizar elementos concretos de una canción sin necesidad de acceso a las pistas originales.
- Edición de audio para podcast y vídeo: separar voz de música de fondo permite limpiar grabaciones o sustituir la banda sonora en postproducción.
- Herramientas de práctica instrumental: aislar el bajo o la batería para estudiar una parte concreta de una canción, con la ventaja de ejecutarse en el propio dispositivo sin subir audio a la nube.
- Investigación en procesamiento de audio: servir como referencia reproducible en formato ONNX para comparar pipelines de separación de fuentes sin depender de PyTorch.
- Aplicaciones de DJ y mashup: generar stems en tiempo de ejecución para mezclar componentes de distintas canciones, aprovechando la portabilidad del formato ONNX.
- Despliegue offline en entornos con privacidad estricta: al ejecutarse on-device, el audio del usuario no sale del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio upstream (`StemSplitio/htdemucs-onnx`) para consultar los benchmarks de la exportación original, pero no se incluyen cifras (SDR, latencia, throughput) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero de pesos ocupa unos 165 MB en fp16, por lo que la huella de memoria es moderada y apta para dispositivos móviles según el caso de uso declarado.
- GPU recomendadas: no disponibles en la información proporcionada; el modelo está pensado para ONNX Runtime, que soporta CPU, GPU y aceleradores móviles (Core ML, NNAPI) según el backend configurado.
- Compatibilidad con GPU de consumo: plausible por el tamaño reducido de los pesos, pero no confirmada con datos en la información disponible.
- Opciones de despliegue: ONNX Runtime (librería declarada), con posibles backends de ejecución en iOS y Android según la aplicación Metronitor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Stems | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Metronitor HT-Demucs ONNX (este repo) | htdemucs (Hybrid Transformer Demucs) | 4 (drums, bass, other, vocals) | ONNX fp16 | MIT | Hugging Face, espejo |
| StemSplitio/htdemucs-onnx (upstream) | htdemucs | 4 | ONNX | MIT | Hugging Face, repositorio original |
| facebookresearch/demucs (original) | htdemucs | 4 | PyTorch | MIT | GitHub, pesos oficiales |

La diferencia principal entre este repositorio y el upstream es únicamente de alojamiento: el contenido es idéntico byte a byte (mismo SHA-256). Frente al modelo original de Meta, la diferencia es el formato: ONNX fp16 para inferencia portable frente a pesos PyTorch.

## Limitaciones y advertencias

- Es un modelo de separación de audio, no un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones.
- No se documentan en la información disponible los sesgos del modelo; al entrenarse sobre MUSDB18-HQ y datos internos, su rendimiento puede degradarse en géneros musicales poco representados en esos corpus.
- Riesgo de artefactos en la separación: la calidad de los stems depende del tipo de mezcla, la presencia de reverberación y la complejidad instrumental; no se aportan métricas de calidad en este repositorio.
- No hay información sobre el rendimiento en idiomas o contenidos vocales concretos; el modelo procesa señal de audio, no texto.
- Licencia MIT: permite uso comercial, pero se deben conservar los avisos de copyright originales (`LICENSE-demucs` de Meta Platforms y `LICENSE-demucs-onnx` de StemSplit), que el repositorio incluye.
- El autor indica que si un titular de derechos desea cambiar el alojamiento o la redacción, debe abrir una discusión en el repositorio.
- Al ser un espejo, la responsabilidad de mantenimiento y posibles actualizaciones recae en el repositorio upstream.
- No se proporcionan garantías de rendimiento en producción ni benchmarks de latencia para dispositivos concretos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/t4t2k1m/metronitor-htdemucs-onnx
- Repositorio upstream ONNX: https://huggingface.co/StemSplitio/htdemucs-onnx
- Código de exportación ONNX: https://github.com/StemSplit/demucs-onnx
- Modelo original Demucs: https://github.com/facebookresearch/demucs

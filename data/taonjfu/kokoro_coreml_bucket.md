# taonjfu/kokoro_coreml_bucket

## Resumen

El repositorio `taonjfu/kokoro_coreml_bucket` aloja una conversión a CoreML del modelo de síntesis de voz Kokoro-82M, un sistema de text-to-speech (TTS) de código abierto desarrollado originalmente por Hexgrad. Kokoro-82M destaca por su arquitectura ligera basada en StyleTTS2, con solo 82 millones de parámetros, que ofrece una calidad de voz comparable a modelos mucho más grandes pero con una latencia y coste computacional significativamente menores. Esta variante CoreML está optimizada para ejecutarse de forma nativa en el Apple Neural Engine (ANE) y GPU de los dispositivos Apple, lo que permite inferencia en tiempo real en Macs con chip M1 o superior y en iOS 17+.

La relevancia de este bucket radica en que facilita el despliegue de TTS de alta calidad en entornos Apple sin necesidad de Python ni dependencias externas en tiempo de inferencia. El modelo original ha sido convertido mediante un pipeline que produce cinco modelos CoreML compilados y un pipeline Swift, logrando una velocidad de 8 a 12 veces el tiempo real. Aunque el repositorio en sí no incluye documentación adicional, los metadatos indican licencia Apache-2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (conversión a CoreML) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada de texto) |
| Tipos de cuantizacion | no disponible (formato CoreML compilado) |
| Idiomas soportados | no disponible (el modelo original soporta inglés y otros, pero no se confirma en este bucket) |
| Licencia | Apache-2.0 |
| Formato de pesos | CoreML (`.mlmodel` compilado) |

## Arquitectura y entrenamiento

Kokoro-82M se basa en StyleTTS2, una arquitectura de síntesis de voz que combina un codificador de texto, un decodificador de voz y un módulo de adaptación de estilo. El modelo original fue entrenado con datos de voz de alta calidad y utiliza un enfoque de difusión para generar formas de onda a 24 kHz. La conversión a CoreML, realizada por el autor del bucket, traduce los pesos de PyTorch a un formato optimizado para el Apple Neural Engine, lo que permite ejecutar el modelo sin Python en tiempo de inferencia. No se dispone de detalles específicos sobre el dataset de entrenamiento ni sobre el proceso de conversión en este repositorio, pero el repositorio de referencia `mattmireles/kokoro-coreml` documenta una optimización quirúrgica para Apple Silicon, logrando 691 ms para 15 segundos de habla en un M1 Mac Mini, 2.8 veces más rápido que la ejecución en Metal.

## Capacidades

- Generación de voz natural y multihablante a 24 kHz.
- Inferencia en tiempo real (8-12x real-time) en dispositivos Apple con ANE.
- Ejecución nativa en CoreML sin dependencias de Python en producción.
- Soporte para múltiples voces (el modelo original incluye varias voces preentrenadas).
- Optimizado para Apple Silicon (M1, M2, M3) y iOS 17+.
- No incluye capacidades de texto general, razonamiento, código ni visión; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en macOS e iOS: el modelo puede integrarse en aplicaciones Swift para generar respuestas habladas en tiempo real, aprovechando la baja latencia del ANE.
- Audiolibros y narración automatizada: con su calidad de voz comparable a modelos mayores, es adecuado para convertir texto largo en audio, aunque la longitud máxima de entrada no está documentada.
- Accesibilidad: aplicaciones de lectura de pantalla para personas con discapacidad visual, ejecutándose localmente en dispositivos Apple sin conexión.
- Prototipado rápido de TTS en entornos Apple: los desarrolladores pueden usar el bucket para probar la conversión CoreML sin necesidad de configurar un entorno Python.
- Servicios de doblaje y contenido multimedia: la generación de voz multihablante permite crear locuciones para vídeos o podcasts con diferentes voces.
- Sistemas de respuesta interactiva en quioscos o dispositivos embebidos Apple: la inferencia local evita la dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este bucket específico. Sin embargo, el repositorio de referencia `mattmireles/kokoro-coreml` reporta un rendimiento de 691 ms para generar 15 segundos de habla en un M1 Mac Mini, lo que equivale a aproximadamente 21.7x tiempo real. El modelo original Kokoro-82M, según su documentación, ofrece una calidad comparable a modelos de mayor tamaño, pero no se proporcionan métricas estándar como MMLU o HumanEval al ser un modelo TTS.

## Requisitos de hardware

- Dispositivos Apple con chip M1 o superior (Mac, iPad, iPhone) para ejecución nativa en ANE.
- iOS 17+ o macOS 14+ como sistemas operativos mínimos.
- No requiere GPU dedicada externa; el ANE integrado es suficiente.
- Para desarrollo, se necesita Xcode y Swift para integrar el pipeline CoreML.
- La inferencia se realiza completamente en el dispositivo, sin necesidad de conexión a internet.
- El tamaño del modelo compilado no está especificado, pero al ser de 82M parámetros, ocupa aproximadamente 300-400 MB en formato CoreML.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Formato | Licencia | Uso en Apple |
|---|---|---|---|---|---|
| Kokoro-82M (original) | 82M | StyleTTS2 | PyTorch | Apache-2.0 | Requiere conversión |
| Kokoro CoreML (este bucket) | 82M | StyleTTS2 | CoreML | Apache-2.0 | Nativo ANE |
| Piper TTS | 20-100M | VITS | ONNX | MIT | Requiere conversión |
| Coqui TTS (XTTS) | 467M | Transformer + VAE | PyTorch | MPL-2.0 | Requiere conversión |

La principal ventaja de este bucket frente a alternativas es la optimización específica para Apple Silicon, que elimina la necesidad de ejecutar Python o de convertir modelos en tiempo de ejecución. Piper y Coqui TTS ofrecen más flexibilidad en plataformas no Apple, pero no están optimizados para ANE.

## Limitaciones y advertencias

- El bucket no incluye documentación sobre el proceso de conversión ni sobre las voces disponibles; se recomienda consultar el repositorio original de Kokoro y el de conversión para más detalles.
- No se especifican los idiomas soportados en esta conversión; el modelo original de Kokoro-82M soporta principalmente inglés, aunque hay versiones multilingües no confirmadas.
- Al ser un modelo TTS, no puede realizar tareas de comprensión de texto, razonamiento o generación de código.
- La calidad de voz puede degradarse con entradas de texto muy largas o con caracteres especiales no entrenados.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que las voces preentrenadas no tengan restricciones adicionales (el modelo original no indica restricciones de voz).
- Para producción, se recomienda probar la estabilidad en dispositivos con menor memoria (por ejemplo, iPhone SE) ya que el rendimiento puede variar.

## Enlaces

- Repositorio HuggingFace del bucket: https://huggingface.co/taonjfu/kokoro_coreml_bucket
- Modelo original Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio de conversión CoreML (referencia): https://github.com/mattmireles/kokoro-coreml
- Código fuente de Kokoro: https://github.com/hexgrad/kokoro
- Documentación de Kokoro TTS en DeepWiki: https://deepwiki.com/FluidInference/mobius/4.2-kokoro-tts

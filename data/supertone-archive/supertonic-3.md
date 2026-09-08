# supertone-archive/supertonic-3

## Resumen

Supertonic 3 es un sistema de síntesis de voz a partir de texto (TTS) de código abierto desarrollado por Supertone, diseñado para ejecutarse íntegramente en el dispositivo mediante ONNX Runtime, sin necesidad de llamadas a la nube. Este modelo resuelve el problema de la generación de voz local y privada, con un peso total de 0,4 GB que lo hace apto para entornos con recursos limitados. La versión 3 amplía el soporte de idiomas de 5 a 31, mejora la estabilidad de lectura y reduce los fallos de repetición y salto en frases cortas y largas. Además, incorpora etiquetas de expresión como `<laugh>`, `<breath>` y `<sigh>`, y ofrece voces predefinidas junto con la posibilidad de crear estilos de voz personalizados mediante el Supertonic Voice Builder. Su relevancia actual radica en ofrecer una alternativa competitiva en precisión frente a modelos mucho más grandes, manteniendo una vía de despliegue ligera y on-device.

No se ha especificado la arquitectura interna ni el número de parámetros en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi (31 idiomas) |
| Licencia | OpenRAIL |
| Formato de pesos | ONNX |

Nota: El tamaño del repositorio es de 0,4 GB. No se han publicado datos sobre cuantización ni longitud de contexto, ya que no aplican a un modelo TTS.

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo ni los datos de entrenamiento utilizados. Supertonic 3 se presenta como un sistema de síntesis de voz ligero que funciona con ONNX Runtime en el dispositivo. La principal innovación técnica documentada es la expansión del soporte multilingüe de 5 a 31 idiomas, junto con mejoras en la estabilidad de lectura y la reducción de fallos de repetición y salto. También se menciona una mayor similitud de hablante en comparación con Supertonic 2, y el soporte de etiquetas de expresión. No se dispone de información sobre el proceso de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto en 31 idiomas.
- Inferencia local completa mediante ONNX Runtime, sin dependencia de servicios en la nube.
- Etiquetas de expresión para controlar la prosodia: `<laugh>`, `<breath>` y `<sigh>`.
- Incluye estilos de voz predefinidos (preset voice styles) para uso inmediato.
- Soporte de voces personalizadas zero-shot mediante el Supertonic Voice Builder, que genera archivos de estilo de voz descargables.
- Mejora de la estabilidad de lectura, con menos repeticiones y saltos en frases cortas y largas.
- Mayor similitud de hablante en el conjunto de idiomas compartidos respecto a Supertonic 2.
- Integración sencilla a través del SDK de Python `supertonic`, con funciones como `TTS`, `get_voice_style` y `synthesize`.

## Casos de uso

- Asistentes de voz en dispositivos locales: al ejecutarse íntegramente en el dispositivo, Supertonic 3 permite integrar síntesis de voz en asistentes personales sin necesidad de conexión a internet, lo que garantiza privacidad y baja latencia.
- Narración de audiolibros y contenido editorial: su soporte de 31 idiomas y las etiquetas de expresión permiten generar narraciones con matices emocionales, adecuadas para audiolibros en distintos idiomas.
- Atención al cliente automatizada: el modelo puede generar respuestas habladas en tiempo real en sistemas de soporte, con la ventaja de ejecutarse en el propio servidor o dispositivo del cliente, reduciendo costes de infraestructura.
- Accesibilidad y lectura de pantalla: gracias a su tamaño reducido y a la inferencia local, es apto para aplicaciones de accesibilidad en móviles y ordenadores, ofreciendo voz en 31 idiomas.
- Doblaje de vídeos y contenido multimedia: las voces predefinidas y la capacidad de crear estilos personalizados facilitan el doblaje de vídeos, animaciones y contenido educativo en varios idiomas.
- Videojuegos y entretenimiento: las etiquetas de expresión permiten generar voces de personajes con risas, suspiros y respiraciones, lo que aporta naturalidad a diálogos en juegos y aplicaciones interactivas.
- Prototipado rápido de aplicaciones de voz: el SDK de Python simplifica la integración, permitiendo a los desarrolladores generar muestras de voz en pocas líneas de código para validar ideas y productos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con cifras concretas en la información disponible. La única referencia de rendimiento encontrada indica que Supertonic 3 se mantiene en un rango competitivo de WER (Word Error Rate) y CER (Character Error Rate) frente a modelos TTS abiertos de mayor tamaño, como VoxCPM2, mientras conserva un despliegue ligero y on-device. No se dispone de tablas de resultados para MMLU, HumanEval, GSM8K ni otros benchmarks, ya que no aplican a un modelo de síntesis de voz.

## Requisitos de hardware

- El tamaño del repositorio es de 0,4 GB, lo que sugiere que el modelo puede ejecutarse en hardware modesto, aunque no se han publicado requisitos oficiales de VRAM.
- Al estar basado en ONNX Runtime, la inferencia puede realizarse tanto en CPU como en GPU, sin necesidad de tarjetas gráficas de gama alta.
- No se han publicado datos de latencia ni de throughput.
- Opciones de despliegue: ONNX Runtime, SDK de Python `supertonic` y posiblemente contenedores Docker, aunque no se documentan en la información disponible.
- No se especifican GPUs recomendadas (A100, H100, RTX 4090, etc.) ni configuraciones de hardware concretas.

## Comparativa con modelos similares

| Modelo | Tamaño | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|
| Supertonic 3 | 0,4 GB | 31 | OpenRAIL | On-device con ONNX Runtime |
| VoxCPM2 | no disponible | no disponible | no disponible | no disponible |

No se dispone de información detallada sobre VoxCPM2 en la información proporcionada más allá de la comparación cualitativa de WER/CER. Tampoco se conocen otros modelos comparables con datos suficientes para una comparativa completa.

## Limitaciones y advertencias

- No se han publicado detalles sobre la arquitectura ni el número de parámetros, lo que limita la evaluación técnica profunda.
- La calidad de la síntesis puede variar entre los 31 idiomas soportados; no se especifica si todos tienen el mismo nivel de precisión.
- El modelo es exclusivamente de síntesis de voz, por lo que no ofrece capacidades de generación de texto, razonamiento ni tool calling.
- Las voces personalizadas requieren el uso del Supertonic Voice Builder, que parece ser un servicio de pago, y los estilos generados incluyen embeddings descargables.
- La licencia OpenRAIL permite el uso comercial, pero es necesario revisar los términos completos para asegurar el cumplimiento en cada caso de uso.
- No se mencionan sesgos específicos, pero al tratarse de un modelo de voz, pueden existir variaciones en la pronunciación o acentos no documentadas.
- El riesgo de alucinación no aplica en el sentido tradicional, pero el modelo puede producir errores de pronunciación o entonación en textos complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/supertone-archive/supertonic-3
- Demo en Hugging Face: https://huggingface.co/spaces/Supertone/supertonic-3
- Repositorio de código: https://github.com/supertone-inc/supertonic
- Paquete en PyPI: https://pypi.org/project/supertonic/
- Demo de muestras de audio: https://supertonic3.github.io/
- Supertonic Voice Builder: https://supertonic.supertone.ai/voice-builder

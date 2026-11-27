# Suarify/kucing-tts-eda-0.1

## Resumen

Kucing TTS — Eda es un modelo de síntesis de voz (text-to-speech) en malayo desarrollado por Suarify, un proyecto independiente con dominio suarify.my. Se trata de un modelo compacto de tipo source-filter con decodificador entrenado sobre habla en malayo y un front-end de grafema a fonema (G2P) específico para esa lengua, lo que permite una pronunciación local natural. La voz resultante se describe como femenina, suave y cálida, y forma parte de la serie Kucing TTS.

El modelo se distribuye principalmente como un único fichero ONNX cuantizado de 8,46 MB (pesos int8, constantes fp16 y bases DFT generadas), con un repositorio total de aproximadamente 8,7 MB que incluye el G2P, la configuración y el código de inferencia. Esta compacidad lo hace apto para despliegue en entornos con recursos muy limitados, incluidos navegadores, tal y como demuestra la demo web publicada en Hugging Face Spaces.

Su relevancia actual radica en la escasez de modelos TTS abiertos para lenguas de bajos recursos como el malayo, y en su licencia Apache-2.0, que permite uso comercial con atribución. No obstante, la información pública disponible es muy limitada: no se detallan arquitectura exacta, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Source-filter con decodificador compacto (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase, sin contexto declarado) |
| Tipos de cuantizacion | int8 (pesos) con constantes fp16 en el fichero ONNX cuantizado |
| Idiomas soportados | Malayo (ms) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`) |

## Arquitectura y entrenamiento

La model card describe el sistema como un decodificador source-filter compacto entrenado sobre habla en malayo, con un front-end de grafema a fonema específico para malayo que convierte el texto de entrada en una representación fonética antes de la síntesis. El fichero ONNX cuantizado incorpora pesos int8, constantes fp16 y bases DFT generadas, lo que sugiere que parte del procesado espectral se resuelve mediante transformadas de Fourier precalculadas en lugar de parámetros aprendidos. La salida es audio float32 a 24 kHz.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineamiento, RLHF o ajuste fino perceptual. Tampoco se detalla el número de parámetros del modelo ni la arquitectura interna exacta (por ejemplo, si el decodificador es convolucional, basado en transformer o en otro tipo de red). Estos datos deben considerarse no disponibles.

## Capacidades

- Síntesis de voz a partir de texto en malayo, con pronunciación guiada por un G2P específico de la lengua.
- Voz femenina con timbre descrito como suave y cálido, orientada a lectura natural de frases.
- Generación de audio a 24 kHz en formato float32.
- Inferencia mediante la librería `kucing` (`Kucing("onnx/model_quantized.onnx")` o `Kucing.from_pretrained("Suarify/kucing-tts-eda-0.1")`).
- Ejecución mediante script de línea de comandos (`python infer.py "Ayat Melayu."`).
- Despliegue en navegador a través de la demo en Hugging Face Spaces.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling, agentes ni procesamiento multilingüe más allá del malayo.

## Casos de uso

- Lectura de contenidos en malayo para accesibilidad: el modelo puede convertir artículos o textos en audio para usuarios con discapacidad visual, gracias a su G2P nativo que evita pronunciaciones anglicizadas.
- Asistentes de voz locales para dispositivos con recursos limitados: con 8,46 MB en int8, puede integrarse en aplicaciones de escritorio o móviles sin depender de servicios en la nube.
- Síntesis en el navegador: la demo web y el tamaño reducido permiten generar voz en el cliente mediante ONNX Runtime Web, reduciendo latencia y costes de servidor.
- Avisos y notificaciones habladas en malayo: sistemas de megafonía, transporte público o domótica que necesiten mensajes cortos en lengua local.
- Prototipado de interfaces conversacionales en malayo: útil para pruebas de concepto de IVR o chatbots con salida de voz antes de invertir en modelos mayores.
- Generación de material educativo audio: lectura de frases y ejercicios para aprendizaje del malayo, con pronunciación consistente.
- Investigación en TTS para lenguas de bajos recursos: base compacta y de licencia permisiva para experimentos de cuantización y despliegue en edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero ONNX cuantizado ocupa 8,46 MB y el repositorio completo unos 8,7 MB, por lo que la huella en memoria es mínima.
- GPU recomendadas: no es necesaria GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, GTX 1050, RTX 3050 o superiores) es más que suficiente si se desea acelerar.
- Cabe en cualquier GPU consumer y también en dispositivos de borde y navegadores.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web para navegador), librería `kucing`, script `infer.py` y la demo de Hugging Face Spaces.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kucing TTS — Eda | Malayo | 8,46 MB (ONNX int8) | Apache-2.0 | ONNX | Voz femenina, G2P malayo |
| Piper TTS | Múltiples (incluye algunas lenguas asiáticas) | Decenas de MB por voz | MIT | ONNX | No se confirma voz en malayo en la información disponible |
| Coqui TTS (XTTS) | Multilingüe | Cientos de MB a GB | Coqui Public Model License (no comercial en algunas variantes) | PyTorch | Mayor tamaño y requisitos; licencia más restrictiva |
| MMS-TTS (Meta) | Múltiples, incluido malayo según variantes | Cientos de MB | CC-BY-NC 4.0 en muchas variantes | PyTorch | Restricciones de uso comercial |

Los datos de comparación sobre disponibilidad de malayo y licencias deben verificarse en las fuentes oficiales de cada proyecto; parte de esta información no está confirmada en la documentación proporcionada.

## Limitaciones y advertencias

- Información técnica muy escasa: no se publican parámetros, dataset de entrenamiento ni evaluaciones subjetivas (MOS) ni objetivas.
- Riesgo de alucinación o artefactos acústicos en textos fuera del dominio de entrenamiento, especialmente con números, siglas o préstamos no cubiertos por el G2P.
- Soporte exclusivo de malayo; no se garantiza calidad con mezcla de inglés u otras lenguas.
- Sin control documentado de prosodia, emoción, velocidad ni hablante.
- Es voz sintética: la model card solicita indicar explícitamente que el audio es generado.
- Licencia Apache-2.0 permite uso comercial, pero se pide atribución a Suarify (suarify.my).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- Fecha de creación registrada en 2026-11-27, lo que conviene contrastar antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/kucing-tts-eda-0.1
- Demo web: https://huggingface.co/spaces/Suarify/kucing-tts-web
- Sitio del autor: https://suarify.my

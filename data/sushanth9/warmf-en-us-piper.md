# sushanth9/warmf-en-us-piper

## Resumen

warm-f (en_US, Piper medium) es un modelo de síntesis de voz (text-to-speech) de un solo hablante para inglés estadounidense, desarrollado por el usuario sushanth9 y publicado en Hugging Face. Se distribuye como un único archivo ONNX de aproximadamente 63 MB a 22.050 Hz en mono, y está diseñado para ejecutarse en CPU sin GPU, lo que lo hace adecuado para despliegues de bajo coste en entornos de atención telefónica y agentes de voz.

Técnicamente es un estudiante VITS destilado del modelo Kokoro-82M (voz `af_heart`), afinado específicamente para habla de centro de llamadas: frases cortas, confirmaciones, horas, fechas, direcciones y números. El modelo se entrenó con 7.882 clips (unas 10 horas) de audio sintético generado por el profesor a partir de unas 7.900 frases de call-center escritas para la ocasión, y se ajustó desde el checkpoint medium de Piper entrenado en LibriTTS-R durante 10.000 pasos en una A10G (unos 90 minutos).

Su relevancia actual reside en la combinación de latencia muy baja (0,2-0,3 segundos por frase corta en un servidor de 2 vCPU), tamaño reducido y licencia permisiva CC BY 4.0, lo que facilita su integración en sistemas IVR, notificaciones y lectura en voz alta sin depender de infraestructura GPU. La contrapartida es una cadena de procedencia del dato de entrenamiento cuestionable para uso comercial, que el propio autor advierte de forma explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (estudiante destilado de Kokoro-82M), formato Piper medium |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible (se distribuye un único ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | inglés (en_US) |
| Licencia | CC BY 4.0 (pesos y configuración); código del repositorio GitHub bajo Apache-2.0 |
| Formato de pesos | ONNX (`en_US-warmf-medium.onnx`, ~63 MB, sha256 `a7b54eb7cf42969f6aa58ab7f325daf3d9fbf4a247b780beda965758bddf9671`) + configuración JSON de Piper |

Parámetros adicionales de la configuración Piper: fonemizador espeak `en-us`, 256 símbolos, `noise_scale` 0,667, `length_scale` 1,0, `noise_w` 0,8, frecuencia de muestreo 22.050 Hz, mono.

## Arquitectura y entrenamiento

El modelo es un VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) en la variante medium de Piper, destilado del modelo Kokoro-82M de hexgrad (Apache-2.0), concretamente de su voz `af_heart` a velocidad 1.0. El estudiante parte del checkpoint medium de Piper entrenado en LibriTTS-R y se ajustó durante 10.000 pasos en una única GPU A10G, con un tiempo aproximado de 90 minutos. La receta de destilación está publicada en el repositorio GitHub del autor bajo `warmf-tts/recipe/kokoro_distill`.

El corpus de entrenamiento consta de 7.882 clips (unas 10 horas) de habla sintética generada por el profesor a partir de aproximadamente 7.900 frases de call-center redactadas específicamente para el modelo. Los nombres, correos y teléfonos de esas frases son ficticios, y los dígitos se expandieron a palabras antes de la síntesis. No se emplearon grabaciones de personas reales. El front-end de texto que normaliza horas, abreviaturas y números es un paquete separado de código abierto (`warmf-ttsfront`), no forma parte del modelo ONNX; sin él, Piper lee el texto tal como lo fonemiza espeak-ng, lo que provoca errores como leer "9 PM" como la palabra "pam" o un código postal como número cardinal.

## Capacidades

- Síntesis de voz en inglés estadounidense, un solo hablante, a 22.050 Hz en mono.
- Generación de audio de baja latencia en CPU: 0,2-0,3 segundos por frase corta en 2 vCPU.
- Pronunciación correcta de horas AM/PM, fechas, direcciones y números cuando se usa el front-end `warmf-ttsfront` (54 de 54 renders correctos en la auditoría del autor, frente a 38 de 54 sin él).
- Adecuado para frases cortas y confirmaciones típicas de IVR y atención telefónica.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo TTS puro).
- No soporta otros idiomas distintos del inglés.
- No soporta canto, narración expresiva larga ni clonación de voz de personas reales.

## Casos de uso

- Prompts de IVR y menús telefónicos: el modelo genera confirmaciones y opciones de menú con latencia de 0,2-0,3 segundos en CPU, lo que permite responder en tiempo real dentro de una llamada sin infraestructura GPU.
- Notificaciones y alertas automatizadas: lectura de horas, fechas y números con el front-end activo, adecuado para avisos de citas, recordatorios o confirmaciones de pedido en inglés.
- Agentes de voz en atención al cliente: al ser un modelo pequeño y CPU-only, se puede desplegar junto a un ASR y un LLM en el mismo servidor de bajo coste para construir un pipeline de voz completo.
- Lectura en voz alta de contenidos cortos: artículos breves, resúmenes o mensajes, siempre que el vocabulario no incluya términos raros fuera del lexicón doméstico.
- Sistemas embebidos y edge computing: el archivo ONNX de ~63 MB cabe en dispositivos con recursos limitados y no requiere GPU, lo que facilita su integración en raspberry o contenedores ligeros.
- Pruebas y prototipado de pipelines TTS: sirve como voz de referencia para validar arquitecturas de agentes conversacionales antes de invertir en modelos comerciales o de mayor tamaño.
- Generación de audiolibros o narración de contenido educativo en inglés: solo para textos con vocabulario común, dado que el autor no ha probado lectura de formato largo.

## Benchmarks y rendimiento

| Evaluación | Resultado | Contexto |
|---|---|---|
| Test ciego humano (2026-10-03) | 5,00 / 5 | Un evaluador, 6 líneas; el profesor Kokoro también 5,00; voz Piper interna previa 4,33; voz del catálogo Piper 4,00. El autor lo califica de "smoke test", no de benchmark. |
| Tasa de error de palabras en prosa (auditoría 2026-11-01) | 0,5 % | 6 errores en 1.196 palabras; proxy ASR Whisper small.en |
| Fallos duros en palabras cotidianas, lugares, marcas y acrónimos | 1,5-3,9 % | Auditoría con 1.865 palabras y frases de test |
| Fallos en nombres de personas | 23,7 % | Cota superior; el proxy ASR sobrecuenta (22 de 40 fallos "confirmados" fueron evaluados como correctos por un oyente humano) |
| Fallos en abreviaturas | 27,7 % | Cota superior, mismo proxy |
| Fallos en nombres de medicamentos | 12,3 % | Cota superior, mismo proxy |
| Estabilidad en 270 ítems aleatorios | 17,0 % de fallos al menos una vez | Frente al 9,3 % del profesor Kokoro-82M |
| Lectura de horas AM/PM con front-end | 54 / 54 correctos | Frente a 38 / 54 sin front-end |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que se trata de un modelo TTS y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para inferencia en CPU. El archivo ONNX ocupa ~63 MB.
- GPU recomendadas: no requiere GPU. El autor reporta 0,2-0,3 segundos por frase corta en un servidor de 2 vCPU.
- Cabe en cualquier GPU consumer y en dispositivos sin GPU; el cuello de botella es la CPU y el fonemizador espeak-ng.
- Opciones de despliegue: Piper (`piper-tts==1.8.0`), con ONNX Runtime como backend. El front-end `warmf-ttsfront` se instala desde el repositorio GitHub del autor.
- Latencia y throughput: ~0,2-0,3 s por frase corta en 2 vCPU; no se documentan cifras de throughput para frases largas ni para procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / idioma | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| warm-f (en_US, Piper medium) | no disponible (~63 MB ONNX) | inglés en_US | CC BY 4.0 | Hugging Face, CPU-only | Destilado de Kokoro-82M; latencia 0,2-0,3 s en 2 vCPU |
| Kokoro-82M (hexgrad) | 82 M | inglés (y otros según variantes) | Apache-2.0 | Hugging Face | Profesor del que se destila warm-f; mayor estabilidad (9,3 % vs 17,0 % de fallos) |
| Piper medium estándar (p. ej. `libritts_r`) | no disponible | inglés y otros | CC BY 4.0 (según checkpoint) | Catálogo Piper | Base del estudiante; calidad evaluada en 4,00/5 en el test ciego del autor |
| Voces Piper del catálogo general | variable | multilingüe | variable | Catálogo Piper | Alternativa directa sin destilación específica para call-center |

## Limitaciones y advertencias

- Nombres poco comunes, fármacos, topónimos locales y abreviaturas pueden pronunciarse mal; el lexicón doméstico de 62 entradas solo corrige los casos detectados y no es exhaustivo.
- El estudiante es menos estable que el profesor: falla al menos una vez en el 17,0 % de 270 ítems aleatorios, frente al 9,3 % de Kokoro-82M.
- El front-end de texto genera respuestas fonéticas adaptadas a este fonemizador (por ejemplo, "9 AM" se convierte en "nine eigh em"); su salida no está pensada para lectura humana.
- Solo inglés; las palabras inusuales dependen de las reglas de espeak-ng.
- La calidad medida proviene de un número reducido de oyentes y de un proxy ASR; no se ha probado la lectura de formato largo.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero sí puede producir pronunciaciones incorrectas no detectadas.
- Sesgos: no documentados por el autor; el corpus es sintético y las frases fueron redactadas para el propósito, sin grabaciones de personas reales.
- Advertencia legal importante: el profesor Kokoro-82M se entrenó según su model card con "audio sintético generado por modelos TTS cerrados de grandes proveedores", y su autor ha mencionado públicamente a OpenAI, Google Gemini y ElevenLabs. El autor de warm-f no puede garantizar que esos proveedores no objeten el uso downstream de esos datos, y señala que ningún abogado ha revisado la cadena de procedencia. Si se necesita una cadena limpia, recomienda no usar este modelo y emplear la receta del repositorio con otro profesor.
- El estudiante se ajustó desde un checkpoint entrenado en LibriTTS-R (CC BY 4.0); no se usó audio de Amazon Polly, Lessac ni ElevenLabs directamente para entrenar al estudiante.
- Ejecutar la voz requiere el fonemizador espeak-ng (GPL-3.0) a través de Piper; los pesos en sí no se distribuyen bajo GPL.
- Para uso comercial es obligatorio atribuir "warm-f voice by Sushanth", enlazar la página del modelo y acreditar las fuentes upstream.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sushanth9/warmf-en-us-piper
- Repositorio GitHub del autor (front-end y receta): https://github.com/tsushanth/warmf-tts
- Piper (OHF-Voice, piper1-gpl): https://github.com/OHF-Voice/piper1-gpl
- Kokoro-82M (profesor): https://huggingface.co/hexgrad/Kokoro-82M
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Documentación de pronunciación del autor: repositorio GitHub, carpeta `docs/pronunciation` (no se dispone de URL directa en la información proporcionada)

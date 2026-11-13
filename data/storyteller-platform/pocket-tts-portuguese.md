# storyteller-platform/pocket-tts-portuguese

## Resumen

Pocket TTS Portuguese es un modelo de síntesis de voz (text-to-speech) en portugués desarrollado originalmente por Kyutai bajo el identificador `kyutai/pocket-tts`. Esta ficha corresponde a la réplica publicada por storyteller-platform en Hugging Face, que distribuye únicamente los pesos convertidos al formato GGUF con cuantización `q8_0`, empleados por la aplicación Storyteller para la narración automática de contenido. El modelo no es un modelo de lenguaje generativo: es un sistema TTS ligero con 109.502.146 parámetros totales.

La relevancia de esta réplica es fundamentalmente operativa: Storyteller instala el modelo a través de su herramienta `ghost-story` y lo consume desde su registro interno de modelos, por lo que esta publicación actúa como espejo de la versión `2.0.0` del modelo en dicho registro. La conversión a GGUF la realiza audio.cpp y se publica en el repositorio `audio-cpp/audio.cpp-gguf`, en la revisión `7bf52723f5a9`.

La información pública disponible es muy limitada: no hay pipeline declarado, no se especifican idiomas en los metadatos (aunque el nombre y el propósito indican portugués), no se documentan resultados de benchmarks y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. El tamaño del repositorio es de 0,3 GB y la licencia es CC-BY-4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz; arquitectura concreta no documentada en la información proporcionada) |
| Parámetros totales | 109.502.146 |
| Parámetros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF `q8_0` (única cuantización conservada en el repositorio) |
| Idiomas soportados | portugués (deducido del nombre y del propósito del modelo; los metadatos no declaran idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (`pocket-tts-portuguese-q8_0.gguf`); parámetros originales en safetensors según los metadatos de Hugging Face |
| Tamaño del repositorio | 0,3 GB |
| Pipeline declarado | no disponible |
| Versión replicada | 2.0.0 (registro de modelos de Storyteller) |
| Herramienta de conversión | audio.cpp, revisión `7bf52723f5a9` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. Se trata de un sistema de síntesis de voz (TTS) entrenado por Kyutai, no de un transformer de propósito general orientado a generación de texto. El número de parámetros (aproximadamente 109,5 millones) sitúa al modelo en la gama ligera, coherente con un despliegue orientado a inferencia local o en dispositivos con recursos moderados.

Tampoco se documentan en la información disponible el volumen de datos de entrenamiento, la composición del corpus, la presencia de ajuste por RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal u otras). Lo único verificable es el proceso de publicación: conversión de los pesos originales a GGUF mediante audio.cpp y conservación exclusiva de la cuantización `q8_0` en el repositorio de storyteller-platform.

## Capacidades

- Síntesis de voz (text-to-speech) en portugués: conversión de texto a audio, propósito principal del modelo.
- Integración con la aplicación Storyteller para narración automática de contenido, instalado mediante `ghost-story`.
- Ejecución mediante el ecosistema GGUF de audio.cpp.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (no es un modelo de lenguaje generativo).
- Capacidades multilingües: no documentadas; el modelo está orientado al portugués.
- Capacidades especiales (modo thinking, visión, audio de entrada): no disponibles en la información proporcionada.

## Casos de uso

- Narración automática de documentos en Storyteller: el modelo se instala desde el registro interno de Storyteller y se emplea para convertir texto de libros o artículos en audio en portugués, que es exactamente el flujo para el que se publica esta réplica.
- Audiolibros y contenido editorial en portugués: generación de pistas de voz a partir de texto plano para publicaciones digitales, aprovechando el tamaño reducido del modelo (0,3 GB en `q8_0`) para procesar por lotes en servidores modestos.
- Accesibilidad web: lectura en voz alta de artículos y páginas para usuarios con discapacidad visual en portugués, desplegando el GGUF con audio.cpp en el backend del servicio.
- Preproducción de doblaje y locución: generación de borradores de voz para vídeos o pódcasts en portugués antes de la grabación con locutor humano, reduciendo costes de iteración.
- Asistentes de voz embebidos: integración en aplicaciones de escritorio o dispositivos con recursos limitados gracias a los ~109,5 millones de parámetros y la cuantización `q8_0`.
- Prototipado de interfaces conversacionales en portugués: pruebas de concepto de IVR o asistentes telefónicos donde se necesita una voz sintética local sin depender de APIs externas.
- Pipelines de contenido multiformato: conversión de boletines, blogs o documentación técnica a audio dentro de flujos automatizados de publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~109,5 millones de parámetros en `q8_0` ocupa del orden de 0,1 GB en pesos, por lo que la huella de memoria es muy reducida; el consumo real depende del runtime de audio.cpp y del búfer de audio.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es susceptible de ejecutarse en GPU de gama baja o incluso en CPU.
- ¿Cabe en GPU de consumo? Sí, por el reducido número de parámetros; no se especifican modelos concretos de GPU en la documentación.
- Opciones de despliegue: audio.cpp (runtime de referencia para este GGUF) e integración con Storyteller mediante `ghost-story`. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pocket TTS Portuguese (esta ficha) | 109.502.146 | no disponible | CC-BY-4.0 | GGUF `q8_0` | Réplica de `kyutai/pocket-tts` para Storyteller |
| kyutai/pocket-tts | no disponible en esta información | no disponible | CC-BY-4.0 | safetensors | Modelo original de Kyutai; misma licencia |
| Otras alternativas TTS en portugués | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos TTS alternativos en portugués (parámetros, contexto, rendimiento o disponibilidad).

## Limitaciones y advertencias

- Información pública muy escasa: no hay model card detallada, benchmarks, ni documentación de arquitectura o datos de entrenamiento.
- Idiomas no declarados en los metadatos de Hugging Face; el soporte de portugués se deduce del nombre y del propósito, no de una especificación formal.
- Al ser un modelo TTS, no debe emplearse para generación de texto, razonamiento, código ni tareas de agente.
- Riesgo de alucinación no aplica en el sentido habitual de los LLM, pero sí existe riesgo de errores de pronunciación, entonación o fidelidad al texto de entrada, no documentados por el autor.
- Sesgos: no documentados; un modelo de voz puede reflejar sesgos de acento, género o registro presentes en sus datos de entrenamiento, sin que se haya publicado información al respecto.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es obligatorio citar a Kyutai y respetar los términos de la licencia.
- El repositorio solo conserva la cuantización `q8_0`; no hay alternativas de menor precisión para entornos con restricciones extremas de memoria.
- Dependencia de audio.cpp como runtime: no se documenta compatibilidad con otros motores de inferencia.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria.
- Fecha de creación futura en los metadatos (2026-11-13): conviene verificar la vigencia y procedencia de la publicación antes de integrarla en producción.

## Enlaces

- Hugging Face (esta réplica): https://huggingface.co/storyteller-platform/pocket-tts-portuguese
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Repositorio GGUF de audio.cpp: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Registro de modelos de Storyteller (origen de la versión 2.0.0): https://gitlab.com/storyteller-platform/storyteller/-/ml/models/pocket-tts-portuguese

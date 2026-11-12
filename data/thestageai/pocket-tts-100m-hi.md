# TheStageAI/pocket-tts-100m-hi

## Resumen

pocket-tts-100m-hi es un modelo de síntesis de voz (text-to-speech) para hindi, derivado del fine-tune de Saryps Labs sobre la arquitectura Pocket TTS de Kyutai. El repositorio publicado por TheStageAI no contiene los pesos originales en formato estándar, sino los motores compilados para Core ML y la Neural Engine (ANE) de Apple, empaquetados para su SDK propietario TheStage. El modelo base es un "teacher" de 24 capas destilado a 6 capas, con aproximadamente 100 millones de parámetros, entrenado sobre texto en devanagari sin puntuación.

La relevancia de esta publicación es fundamentalmente de despliegue: demuestra cómo llevar un TTS de tamaño reducido a inferencia nativa en dispositivos Apple (macOS e iOS) mediante cuantización de paletas de 6 bits en las capas del transformer y decodificador Mimi en fp32 sobre CPU. No obstante, los motores están cifrados con QLPA, por lo que no son directamente utilizables fuera del SDK de TheStage, y no se incluyen prompts de voz nativos en hindi: las seis voces incluidas son clips de referencia en inglés de Kyutai codificados por este modelo.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card del autor; los datos no publicados se indican como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pocket TTS (flow LM con cabeza LSD flow + decodificador Mimi); transformer de 6 capas, dimensión 1024 |
| Parámetros totales | ~100M (según nombre del modelo y descripción del autor) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Capas transformer palettizadas g8 de 6 bits (fp16 en el flow LM); decodificador Mimi en fp32 |
| Idiomas soportados | hindi (hi) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Motores Core ML / ANE cifrados con QLPA dentro de `engines.zip` (142 MB); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pocket TTS de Kyutai: un flow LM que genera representaciones latentes de audio y una cabeza LSD flow, seguido de un decodificador Mimi que convierte dichas representaciones en forma de onda. El fine-tune en hindi parte de un modelo "teacher" de 24 capas que fue destilado a 6 capas con dimensión 1024, lo que reduce drásticamente el coste computacional a costa de capacidad. El entrenamiento se realizó sobre texto en devanagari sin puntuación, con un umbral de EOS de -1,0 según la evaluación de los autores.

La innovación principal de esta publicación no está en el entrenamiento sino en el despliegue: TheStageAI ha compilado el flow LM en fp16 con capas transformer palettizadas a 6 bits para ejecutarse en la Neural Engine de Apple, mientras que el decodificador Mimi se ejecuta en fp32 sobre CPU. El paquete resultante (`engines.zip`, 142 MB) incluye seis voces de referencia (azelma como predeterminada, alba, charles, cosette, javert y marius), todas ellas clips en inglés de Kyutai codificados por este modelo, ya que el autor no distribuye un prompt nativo en hindi. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Síntesis de voz en hindi a partir de texto en devanagari sin puntuación.
- Generación de audio condicionada por prompt de voz (voice cloning a partir de clips de referencia).
- Seis voces preconfiguradas incluidas en el paquete de motores.
- Inferencia nativa en Apple Neural Engine (ANE) para el flow LM y en CPU para el decodificador Mimi.
- Integración con el SDK de TheStage para macOS e iOS (`model_type: pocket-tts`, bundle de idioma `hi`).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento; es un modelo exclusivamente TTS.
- Capacidad multilingüe limitada al hindi; no se declaran otros idiomas.

## Casos de uso

- Lectura de texto en hindi en aplicaciones iOS: el motor Core ML permite sintetizar contenido en devanagari directamente en el dispositivo, sin conexión a servidores, aprovechando la ANE para reducir consumo energético.
- Accesibilidad en macOS: integración de la síntesis en hindi en lectores de pantalla o herramientas de lectura de documentos para usuarios con discapacidad visual.
- Asistentes de voz locales en hindi: el modelo puede generar respuestas habladas en aplicaciones de asistencia personal que requieran privacidad y baja latencia, al ejecutarse íntegramente en el dispositivo.
- Previsualización de locuciones en herramientas de creación de contenido: generación rápida de borradores de audio en hindi para podcasts o vídeos antes de una grabación profesional.
- Aprendizaje de idiomas: reproducción de frases en hindi con distintas voces para ejercicios de comprensión auditiva en aplicaciones educativas.
- Notificaciones y avisos hablados: síntesis de alertas y mensajes del sistema en hindi dentro de apps nativas de Apple, con las seis voces disponibles para diferenciar contextos.
- Prototipado de interfaces conversacionales: evaluación de la calidad del TTS en hindi antes de invertir en un modelo mayor o en un servicio en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Diseñado para ejecutarse en Apple Neural Engine (ANE) y CPU; no requiere GPU dedicada.
- Compatible con dispositivos Apple que soporten Core ML y ANE (macOS e iOS) a través del SDK de TheStage.
- El paquete de motores ocupa 142 MB, por lo que cabe holgadamente en la memoria de un iPhone o Mac moderno.
- VRAM estimada: no aplica; el modelo no está pensado para GPU NVIDIA y no se distribuyen pesos en formatos como GGUF o safetensors para su uso con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- El modelo base (saryps-labs/pocket-tts-hindi) podría ejecutarse con las herramientas de Kyutai, pero esta publicación concreta solo ofrece motores cifrados para el SDK de TheStage.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| TheStageAI/pocket-tts-100m-hi | ~100M | no disponible | hi | CC-BY-4.0 | Core ML/ANE cifrado (QLPA) | Solo vía SDK de TheStage |
| saryps-labs/pocket-tts-hindi (modelo base) | ~100M (6 capas destiladas de 24) | no disponible | hi | CC-BY-4.0 | no disponible en la información | Pesos del fine-tune original |
| kyutai/pocket-tts | no disponible | no disponible | no disponible | no disponible | no disponible | Repositorio de Kyutai |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los motores están cifrados con QLPA: no pueden inspeccionarse, modificarse ni ejecutarse fuera del SDK de TheStage, lo que limita la portabilidad y la auditoría.
- No se incluye ningún prompt de voz nativo en hindi; las seis voces son clips en inglés de Kyutai codificados por el modelo, lo que puede degradar la naturalidad del acento y la prosodia en hindi.
- El modelo fue entrenado sin puntuación (texto devanagari plano) y con umbral EOS -1,0, lo que puede afectar al fraseo y a la segmentación en textos con signos de puntuación.
- La destilación de 24 a 6 capas reduce la calidad potencial frente al teacher; no se han publicado métricas objetivas (MOS, WER) que lo cuantifiquen.
- Riesgo de alucinación acústica y de pronunciación incorrecta en palabras fuera del dominio de entrenamiento, especialmente préstamos del inglés o nombres propios.
- Sesgos: no se documentan sesgos de género, dialecto o registro; el modelo solo cubre hindi y no se especifica qué variantes regionales.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero debe verificarse si el SDK de TheStage impone condiciones adicionales sobre los motores cifrados.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en producción ni comunidad que valide su calidad.
- No apto para pipelines de servidor con GPU: no se ofrecen pesos en safetensors, GGUF ni formatos compatibles con vLLM, llama.cpp u Ollama.

## Enlaces

- [TheStageAI/pocket-tts-100m-hi en Hugging Face](https://huggingface.co/TheStageAI/pocket-tts-100m-hi)
- [saryps-labs/pocket-tts-hindi (modelo base)](https://huggingface.co/saryps-labs/pocket-tts-hindi)
- [kyutai/pocket-tts (arquitectura original)](https://huggingface.co/kyutai/pocket-tts)

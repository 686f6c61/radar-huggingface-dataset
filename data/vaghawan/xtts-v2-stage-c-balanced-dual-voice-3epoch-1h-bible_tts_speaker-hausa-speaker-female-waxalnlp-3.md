# vaghawan/xtts-v2-stage-c-balanced-dual-voice-3epoch-1h-bible_tts_speaker-hausa-speaker-female-waxalnlp-3

## Resumen

Este modelo es un ajuste fino (fine-tuning) de Coqui XTTS-v2, especializado en la síntesis de voz en hausa (`ha`). Ha sido desarrollado por el usuario `vaghawan` y se publica bajo la licencia Coqui Public Model License. El objetivo es ofrecer un sistema de text-to-speech de alta calidad para el hausa, un idioma poco representado en los modelos TTS comerciales, mediante la combinación de dos conjuntos de datos: un corpus bíblico (BibleTTS) y un dataset propio (`waxalnlp`), con dos voces de referencia. El modelo se entrenó durante tres épocas partiendo de un checkpoint previo (Stage A) y se distribuye con los parches necesarios para su ejecución en el ecosistema Coqui.

La arquitectura subyacente es la de XTTS-v2, un modelo de clonación de voz multilingüe basado en Tortoise, que permite generar voz a partir de un clip de referencia de pocos segundos. Este ajuste fino adapta el modelo al hausa y lo restringe a dos voces concretas, lo que reduce la flexibilidad pero mejora la coherencia y naturalidad en ese idioma. El repositorio tiene un tamaño de 5,7 GB e incluye el checkpoint del modelo, configuración, vocabulario ampliado y scripts de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XTTS-v2 (basada en Tortoise) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hausa (`ha`) |
| Licencia | Coqui Public Model License (etiqueta `other` en HuggingFace) |
| Formato de pesos | PyTorch (`best_model.pth`) |

## Arquitectura y entrenamiento

El modelo se basa en XTTS-v2, un sistema de text-to-speech que combina un codificador de voz, un decodificador autoregresivo tipo GPT y un vocoder. La arquitectura original de XTTS-v2 está diseñada para la clonación de voz en múltiples idiomas con solo unos segundos de audio de referencia. Este ajuste fino conserva esa arquitectura pero entrena el modelo específicamente para el hausa, utilizando dos voces de referencia: una procedente del corpus BibleTTS y otra del dataset `waxalnlp`. El entrenamiento se realizó durante tres épocas, con un balanceo de los datos (aproximadamente 441 clips de cada fuente) y partiendo de un checkpoint de una etapa anterior (Stage A), lo que sugiere un proceso de fine-tuning incremental. Se incluye un parche de runtime (`xtts_hausa_patch.py`) necesario para manejar correctamente el hausa, así como un vocabulario BPE ampliado (`vocab.json`).

## Capacidades

- Generación de voz en hausa a partir de texto, con dos voces de referencia disponibles (`bible_tts_speaker` y `hausa-speaker-female-waxalnlp-3`).
- Clonación de voz: aunque el modelo está fijado a dos voces, el mecanismo subyacente de XTTS-v2 permite adaptar la voz si se proporciona un clip de referencia (dentro de las limitaciones del fine-tuning).
- Soporte para inferencia mediante scripts Python (`infer.py`) que aceptan texto y archivo de audio de referencia.
- No se reportan capacidades de tool calling, agentes, razonamiento o visión; es exclusivamente text-to-speech.

## Casos de uso

- Audiolibros en hausa: el modelo puede narrar textos largos con una voz natural y consistente, ideal para convertir literatura o contenido escrito en audio.
- Asistentes de voz en hausa: integración en aplicaciones de asistencia personal o sistemas de respuesta interactiva para hablantes de hausa, gracias a su baja latencia y calidad de síntesis.
- Accesibilidad: permite a personas con discapacidad visual o dificultades de lectura acceder a contenido en hausa mediante audio.
- Educación: generación de materiales de aprendizaje en hausa, como lecciones de idioma o contenido educativo narrado.
- Localización de productos: incorporación de voz en hausa en aplicaciones, juegos o dispositivos para mercados de África Occidental.
- Investigación lingüística: herramienta para estudiar la prosodia y fonética del hausa, o para crear corpus de habla sintética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas objetivas como MOS (Mean Opinion Score), WER o comparaciones con otros modelos TTS para hausa.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. El tamaño del repositorio (5,7 GB) sugiere que el modelo requiere una GPU con al menos 6-8 GB de VRAM para inferencia en tiempo real, aunque no se confirma. Para despliegue, se puede utilizar el script `infer.py` incluido, que depende de la librería Coqui TTS. No se mencionan opciones de cuantización ni integración con vLLM u otros servidores de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos TTS para hausa. El modelo base XTTS-v2 soporta múltiples idiomas, pero este ajuste fino se limita al hausa. No se conocen alternativas específicas para hausa en el momento de redactar esta ficha.

## Limitaciones y advertencias

- El modelo está entrenado con un conjunto de datos limitado (441 clips por fuente), lo que puede afectar la generalización a voces o acentos no representados.
- La licencia Coqui Public Model License impone restricciones para uso comercial; es necesario revisar los términos exactos antes de utilizarlo en productos comerciales.
- Los datos de entrenamiento provienen de una fuente bíblica, lo que puede introducir sesgos en el vocabulario y en el tono (lenguaje formal o religioso).
- No se garantiza la naturalidad en todos los contextos; la voz puede degradarse con frases muy largas o con entonaciones complejas.
- No se proporcionan garantías de soporte técnico ni mantenimiento por parte del autor.
- El modelo requiere el parche `xtts_hausa_patch.py` para funcionar correctamente; omitirlo puede provocar errores de inferencia.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/vaghawan/xtts-v2-stage-c-balanced-dual-voice-3epoch-1h-bible_tts_speaker-hausa-speaker-female-waxalnlp-3)
- [Modelo base Coqui XTTS-v2](https://huggingface.co/coqui/XTTS-v2)
- [Documentación oficial de XTTS](https://docs.coqui.ai/en/latest/models/xtts.html)

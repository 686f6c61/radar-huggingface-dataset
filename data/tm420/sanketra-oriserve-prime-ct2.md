# TM420/sanketra-oriserve-prime-ct2

## Resumen

Sanketra Oriserve Prime CT2 es una conversión al formato CTranslate2 del modelo de reconocimiento automático del habla Oriserve/Whisper-Hindi2Hinglish-Prime, un fine-tuning de openai/whisper-large-v3 orientado a la transcripción de audio en hindi y su transliteración a hinglish (hindi escrito con alfabeto latino). El repositorio lo publica el usuario TM420 bajo licencia Apache-2.0 y su único cambio respecto al checkpoint original es la conversión de formato con cuantización int8 de los pesos, sin reentrenamiento ni poda.

El interés práctico del artefacto es que empaqueta un modelo Whisper large-v3 adaptado al dominio hindi-hinglish en un formato optimizado para inferencia con faster-whisper, lo que reduce requisitos de memoria y simplifica el despliegue en producción frente al checkpoint original en Transformers. Al derivar de whisper-large-v3, hereda su arquitectura encoder-decoder transformer con 1.550 millones de parámetros y una ventana de audio de 30 segundos por segmento.

Se trata de un modelo de nicho, con muy poca tracción en Hugging Face (5 descargas y ninguna interacción en el momento de redactar esta ficha), pensado para pipelines de transcripción de contenido audiovisual en hindi o para la generación de subtítulos en hinglish. No debe confundirse con un modelo de lenguaje: no genera texto libre ni razona, solo transcribe audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) sobre openai/whisper-large-v3 |
| Parametros totales | 1.550 millones (heredados de whisper-large-v3; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (estándar de Whisper) |
| Tipos de cuantizacion | int8 (pesos cuantizados durante la conversión a CTranslate2) |
| Idiomas soportados | hindi y hinglish (objetivo del fine-tuning); resto de idiomas de whisper-large-v3 no verificado |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (compatible con faster-whisper) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder con atención completa, entrenado originalmente por OpenAI para transcripción y traducción de voz multilingüe, con entradas de espectrograma mel de 30 segundos. El modelo base Oriserve/Whisper-Hindi2Hinglish-Prime es un fine-tuning de ese checkpoint sobre datos de audio en hindi, con el objetivo de transcribir y transliterar el habla hindi a hinglish. No se dispone en la información proporcionada de detalles sobre el volumen de datos de fine-tuning, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La contribución de este repositorio es puramente de infraestructura: la conversión del checkpoint de Transformers a CTranslate2 con cuantización int8 de los pesos, declarada explícitamente en la model card como el único cambio realizado, sin fine-tuning ni poda. Esta conversión habilita la inferencia con faster-whisper, que implementa decodificación por lotes y otras optimizaciones de rendimiento sobre el runtime de CTranslate2.

## Capacidades

- Transcripción de audio en hindi a texto.
- Transliteración o generación de salida en hinglish (hindi en alfabeto latino), según el fine-tuning de Oriserve.
- Procesamiento de segmentos de audio de hasta 30 segundos por ventana, con concatenación de segmentos en pipelines de audio largo.
- Inferencia optimizada mediante faster-whisper y CTranslate2 con pesos int8.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo ASR, no un modelo de lenguaje conversacional.
- Capacidades multilingües generales de whisper-large-v3 no verificadas en esta conversión; el fine-tuning está orientado a hindi/hinglish.

## Casos de uso

- Subtitulado automático de contenido audiovisual en hindi: el modelo transcribe el audio y produce texto en hinglish, adecuado para plataformas que distribuyen contenido hindi a audiencias que leen en alfabeto latino.
- Transcripción de reuniones y llamadas en hindi: integrado en un pipeline con faster-whisper, permite procesar grabaciones por segmentos de 30 segundos y generar actas o resúmenes posteriores con otro modelo.
- Generación de datasets de texto a partir de audio hindi: útil para investigación en PLN en hindi o hinglish, donde se necesita convertir corpus de voz en texto de forma masiva.
- Atención al cliente con voz en hindi: transcripción en tiempo casi real de llamadas para alimentar sistemas de análisis de sentimiento o búsqueda sobre conversaciones.
- Accesibilidad: subtitulado en directo o diferido de vídeos educativos y divulgativos en hindi para personas con discapacidad auditiva.
- Moderación de contenido audiovisual: transcripción de audio para detectar términos o discursos prohibidos en plataformas que alojan contenido en hindi.
- Archivado y búsqueda de mediateca: indexación de audio histórico en hindi para permitir búsqueda por texto sobre la transcripción en hinglish.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización int8, el checkpoint de 1.550 millones de parámetros ocupa aproximadamente 1,6 GB en disco (tamaño del repositorio), por lo que la inferencia requiere del orden de 2-3 GB de VRAM, aunque no se ha publicado una medición oficial en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para int8; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas, siendo las de gama alta útiles para procesar lotes grandes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con 4 GB o más de VRAM, dado el tamaño del checkpoint int8.
- Opciones de despliegue: faster-whisper (runtime nativo de este formato) y, en general, cualquier librería basada en CTranslate2; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI, que no soportan este formato para ASR.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la GPU y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sanketra Oriserve Prime CT2 (este) | 1.550 M (heredados) | 30 s por segmento | CTranslate2 int8 | Apache-2.0 | Hugging Face, 5 descargas |
| Oriserve/Whisper-Hindi2Hinglish-Prime | 1.550 M (heredados) | 30 s por segmento | Transformers (safetensors) | Apache-2.0 | Hugging Face (original) |
| Oriserve/Whisper-Hindi2Hinglish-Swift | no disponible | 30 s por segmento | Transformers | Apache-2.0 | Hugging Face (original) |
| openai/whisper-large-v3 | 1.550 M | 30 s por segmento | Transformers, CTranslate2 | Apache-2.0 | Hugging Face, ampliamente adoptado |

La comparativa se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Modelo de nicho con muy poca validación comunitaria: 5 descargas y 0 likes en el momento de la ficha, sin benchmarks publicados.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en segmentos con ruido, silencios largos o audio de baja calidad.
- El fine-tuning está orientado a hindi y hinglish; el comportamiento en otros idiomas no está verificado y podría degradarse respecto a whisper-large-v3 original.
- La cuantización int8 puede introducir una ligera pérdida de precisión en la transcripción frente al checkpoint original en Transformers; no se ha publicado una evaluación de esta diferencia.
- Licencia Apache-2.0 permite uso comercial, pero el copyright del modelo original pertenece a Oriserve y la model card exige mantener los avisos de atribución correspondientes.
- No es un modelo de lenguaje: no admite instrucciones en texto, tool calling ni generación libre; su uso está restringido a tareas ASR.
- La ventana de 30 segundos por segmento obliga a implementar lógica de segmentación y concatenación para audio largo.
- No compatible con runtimes de LLM habituales (vLLM, llama.cpp, Ollama, TGI); requiere faster-whisper o CTranslate2.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TM420/sanketra-oriserve-prime-ct2
- Modelo base Oriserve/Whisper-Hindi2Hinglish-Prime: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Prime
- Modelo base Oriserve/Whisper-Hindi2Hinglish-Swift: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Swift
- Repositorio hermano en CTranslate2 (Swift): https://huggingface.co/TM420/sanketra-oriserve-swift-ct2
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3
- faster-whisper (runtime): https://github.com/SYSTRAN/faster-whisper
- CTranslate2 (runtime): https://github.com/OpenNMT/CTranslate2

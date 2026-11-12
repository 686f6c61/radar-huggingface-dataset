# TM420/sanketra-oriserve-swift-ct2

## Resumen

Sanketra — Oriserve Hindi2Hinglish (CTranslate2) es una conversión del modelo de reconocimiento automático de voz (ASR) Oriserve/Whisper-Hindi2Hinglish, publicada por el usuario TM420. Se trata de un derivado de la familia Whisper de OpenAI, afinado específicamente para transcribir audio en hindi y producir salida en hinglish (hindi romanizado mezclado con inglés). El repositorio redistribuye dos variantes: Swift (basada en whisper-base) y Prime (basada en whisper-large-v3), convertidas al formato CTranslate2 con cuantización int8 para su uso con faster-whisper.

El modelo no aporta arquitectura nueva ni pesos reentrenados: es una conversión de formato que preserva los pesos originales de Oriserve. Su relevancia radica en que permite desplegar estos modelos ASR especializados en hindi/hinglish con la eficiencia de CTranslate2 y faster-whisper, reduciendo requisitos de memoria y mejorando el throughput frente a la inferencia estándar de Transformers. El repositorio ocupa aproximadamente 0,1 GB, lo que corresponde a la variante Swift cuantizada a int8.

La licencia es Apache 2.0, heredada del modelo original, y el autor declara explícitamente que no se ha realizado fine-tuning, poda ni modificación de los pesos más allá de la conversión de formato y la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper); variante Swift derivada de whisper-base, variante Prime derivada de whisper-large-v3 |
| Parametros totales | no disponible (whisper-base: ~74 M; whisper-large-v3: ~1,55 B, segun los modelos base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | int8 (pesos cuantizados en la conversion a CTranslate2) |
| Idiomas soportados | hindi de entrada, salida en hinglish (hindi romanizado con mezcla de ingles); no se detalla la cobertura completa |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (model.bin y ficheros asociados para faster-whisper) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper de OpenAI: un transformer encoder-decoder con atención completa, diseñado para ASR multilingüe sobre ventanas de audio de 30 segundos. La variante Swift se construye sobre whisper-base y la variante Prime sobre whisper-large-v3. El ajuste fino original lo realizó Oriserve para la tarea Hindi2Hinglish, es decir, transcribir habla en hindi y generar la salida en hinglish romanizado en lugar de en escritura devanagari.

La contribución de este repositorio es exclusivamente de infraestructura: la conversión del checkpoint original de Transformers al formato CTranslate2 con cuantización int8 de los pesos, sin fine-tuning, poda ni otras alteraciones. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO en el modelo original. La conversión habilita el uso con faster-whisper, que implementa una decodificación optimizada sobre CTranslate2.

## Capacidades

- Reconocimiento automático de voz (ASR) para audio en hindi con salida en hinglish.
- Transcripción de audio en ventanas de 30 segundos, con manejo de audio más largo mediante segmentación.
- Generación de texto romanizado (hinglish) en lugar de escritura devanagari, orientada a casos de uso donde el público objetivo lee hindi en alfabeto latino.
- Inferencia eficiente mediante faster-whisper y CTranslate2 con cuantización int8.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio generativo ni modo de pensamiento (thinking mode).
- Capacidades multilingües: limitadas al par hindi/inglés según la información disponible; no se detalla cobertura adicional.

## Casos de uso

- Transcripción de reuniones y llamadas en hindi: el modelo convierte audio hablado en hindi a texto hinglish, adecuado para equipos que documentan en alfabeto latino y necesitan actas legibles sin conocimientos de devanagari.
- Subtitulado de vídeo y pódcasts: integración en pipelines de postproducción donde se requiere transcripción rápida de contenido en hindi con salida romanizada para plataformas que no soportan bien la escritura devanagari.
- Atención al cliente y centros de contacto: transcripción de grabaciones de llamadas en hindi para análisis de calidad, búsqueda de texto y generación de resúmenes posteriores, aprovechando la eficiencia de faster-whisper para procesar lotes de audio.
- Moderación y búsqueda de contenido: indexación de audio en hindi como texto hinglish para motores de búsqueda internos y sistemas de moderación que operan sobre texto romanizado.
- Accesibilidad: generación de transcripciones en directo o diferidas para personas con discapacidad auditiva en contextos donde el hindi es el idioma principal y el hinglish es el formato de lectura preferido.
- Investigación lingüística y sociolingüística: análisis de code-switching hindi-inglés y estudio de patrones de romanización, gracias a la salida en hinglish del modelo.
- Prototipado rápido en aplicaciones de voz: la variante Swift, con ~74 M de parámetros en int8, permite desplegar ASR en entornos con recursos limitados para validar productos antes de escalar a la variante Prime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la variante Swift (whisper-base, ~74 M de parámetros) en int8: del orden de cientos de MB, apta para CPU y GPUs de gama baja.
- VRAM estimada para la variante Prime (whisper-large-v3, ~1,55 B de parámetros) en int8: aproximadamente 1,5-2 GB, dependiendo de la implementación y del tamaño de lote.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para ambas variantes; para despliegues de alto throughput se recomiendan A100 o H100.
- Cabe en GPU consumer: sí, ambas variantes; la Swift puede ejecutarse incluso en CPU con latencia aceptable.
- Opciones de despliegue: faster-whisper (nativo para este formato), CTranslate2, y servidores compatibles con faster-whisper. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que no soportan el formato CTranslate2 de Whisper.
- Latencia y throughput: no disponibles en la información proporcionada; la cuantización int8 y faster-whisper están diseñados para reducir latencia y memoria frente a la inferencia estándar de Transformers.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sanketra Swift (este repo) | ~74 M (whisper-base) | ventanas de 30 s | hindi a hinglish | Apache 2.0 | CTranslate2 int8 |
| Sanketra Prime (repo hermano) | ~1,55 B (whisper-large-v3) | ventanas de 30 s | hindi a hinglish | Apache 2.0 | CTranslate2 int8 |
| Oriserve/Whisper-Hindi2Hinglish-Swift (original) | ~74 M | ventanas de 30 s | hindi a hinglish | Apache 2.0 | Transformers |
| openai/whisper-base | ~74 M | ventanas de 30 s | multilingüe | MIT | Transformers, CTranslate2 |

La diferencia principal frente a los originales de Oriserve es el formato y la cuantización: este repositorio ofrece pesos en CTranslate2 int8 listos para faster-whisper, mientras que los originales requieren Transformers. Frente a whisper-base de OpenAI, la ventaja es la especialización en hindi a hinglish; la desventaja es la menor cobertura multilingüe general.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: hereda todas las limitaciones y sesgos del modelo original de Oriserve y, por extensión, de Whisper.
- Riesgo de alucinación: Whisper puede generar texto plausible en segmentos de audio ambiguos, con ruido o silencios, especialmente en la variante base.
- La salida en hinglish romanizado puede presentar inconsistencias en la transliteración y en la mezcla de hindi e inglés.
- Cobertura de idiomas limitada: no se documenta soporte para idiomas distintos del par hindi/inglés.
- La variante Swift, basada en whisper-base, tiene menor precisión que la variante Prime; la elección entre ambas debe considerar el equilibrio precisión/recursos.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de copyright de los autores originales (Oriserve) y documentar los cambios, según la sección 4(b) de la licencia.
- El repositorio tiene muy pocas descargas (16) y ningún like, por lo que no hay validación comunitaria amplia de su calidad o estabilidad.
- No es compatible con stacks de inferencia habituales para LLM (vLLM, TGI, Ollama); requiere faster-whisper o CTranslate2.
- No se dispone de información sobre evaluación cuantitativa (WER, CER) en la documentación proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TM420/sanketra-oriserve-swift-ct2
- Modelo original Swift: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Swift
- Modelo original Prime: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Prime
- Repositorio hermano Prime (CTranslate2): https://huggingface.co/TM420/sanketra-oriserve-prime-ct2
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-base
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-large-v3
- faster-whisper (GitHub): https://github.com/SYSTRAN/faster-whisper
- CTranslate2 (GitHub): https://github.com/OpenNMT/CTranslate2

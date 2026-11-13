# vibe-app/zipformer2-66m-streaming-he-gguf

## Resumen

zipformer2-66m-streaming-he-gguf es la conversión al formato GGUF del modelo thewh1teagle/zipformer2-66m-streaming-he, un transductor Zipformer2 de 66 millones de parámetros especializado en reconocimiento automático de habla (ASR) en hebreo. Lo publica el proyecto Vibe, una aplicación de transcripción de escritorio, para poder distribuir el modelo como un único fichero de 75 MB que la aplicación instala y ejecuta localmente sin depender de frameworks de Python.

El modelo resuelve un problema muy concreto: ofrecer transcripción de hebreo en local, con un peso lo suficientemente reducido como para ejecutarse en CPU en equipos de consumo. Al estar empaquetado en GGUF, incluye en un solo fichero el encoder, el decoder, el joiner y la tabla de tokens del transductor, lo que simplifica el despliegue en aplicaciones de escritorio.

Es relevante ahora porque el ecosistema de ASR en hebreo de calidad sigue siendo limitado y este modelo, derivado del trabajo de ivrit.ai y de la infraestructura k2-fsa/icefall, permite integrar dictado y transcripción en hebreo dentro de herramientas locales. La conversión GGUF no altera el comportamiento del modelo original: el autor indica que produce el mismo texto que la versión de precisión completa en las pruebas realizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 (transductor RNN-T: encoder + decoder + joiner) |
| Parametros totales | 66.609.996 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; Vibe procesa fragmentos detectados por voz de hasta 30 segundos |
| Tipos de cuantizacion | q8_0 (8 bits); único fichero publicado |
| Idiomas soportados | hebreo (he) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (un fichero con encoder, decoder, joiner y tabla de tokens) |

## Arquitectura y entrenamiento

El modelo es un transductor Zipformer2, la segunda generación de la arquitectura Zipformer desarrollada en el ecosistema k2-fsa/icefall. Se compone de tres módulos: un encoder que procesa las características acústicas, un decoder que modela la secuencia de tokens y un joiner que combina ambas representaciones para producir la distribución sobre el vocabulario. El modelo base se denomina "streaming", lo que indica que fue entrenado con la configuración de inferencia por bloques de Zipformer, aunque la aplicación Vibe lo ejecuta con contexto completo sobre fragmentos de hasta 30 segundos en lugar de en modo streaming.

Los datos de entrenamiento concretos (número de horas, composición del corpus, uso de aumentación o de técnicas de regularización) no están detallados en la información disponible; la model card del autor de la conversión remite a la model card del modelo original. Sí se indica que el modelo base procede de k2-fsa/icefall (Apache-2.0) y que se entrenó con audio de ivrit.ai. La conversión a GGUF se validó comparando la salida con la del modelo de precisión completa en clips de prueba, obteniendo el mismo texto.

## Capacidades

- Reconocimiento automático de habla en hebreo, con salida de texto a partir de audio.
- Transcripción con contexto completo sobre fragmentos de hasta 30 segundos cuando se ejecuta en Vibe.
- Ejecución local sin conexión, en un único fichero GGUF de 75 MB.
- Incluye la tabla de tokens en el propio fichero, por lo que no requiere vocabulario externo.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico.
- No dispone de capacidades multimodales más allá del audio de entrada ni de modo "thinking".
- Capacidad multilingüe limitada: solo hebreo; el inglés tiende a transcribirse letra a letra.

## Casos de uso

- Dictado por voz en hebreo en aplicaciones de escritorio: el modelo se integra en Vibe y permite transcribir la voz del usuario en local, sin enviar audio a servicios externos, gracias a su tamaño de 75 MB en q8_0.
- Subtitulado de reuniones y clases en hebreo: al procesar fragmentos de hasta 30 segundos con contexto completo, es adecuado para generar transcripciones de grabaciones segmentadas por detección de voz.
- Herramientas de accesibilidad para hablantes de hebreo: transcripción en tiempo casi real en equipos sin GPU, al poder ejecutarse en CPU por su reducido tamaño.
- Investigación en ASR de bajos recursos: sirve como línea base ligera y reproducible para experimentos con hebreo, al estar disponible en GGUF y con licencia CC-BY-4.0.
- Archivado y búsqueda de contenido audiovisual en hebreo: transcripción por lotes de grabaciones para indexar y permitir búsqueda textual sobre el audio.
- Aplicaciones educativas de aprendizaje de hebreo: transcripción de pronunciación del alumno para comparación con texto de referencia, en un entorno local y de bajo coste.
- Integración en pipelines de datos: conversión de corpus de audio en hebreo a texto para entrenamiento o evaluación de otros sistemas, siempre que se respete la atribución de la licencia CC-BY-4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la conversión remite a las cifras de precisión del modelo original (thewh1teagle/zipformer2-66m-streaming-he) y solo confirma que la salida de la versión GGUF coincide con la del modelo de precisión completa en los clips de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero q8_0 ocupa 75 MB, por lo que la huella de memoria es muy reducida y cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos unos cientos de MB libres es suficiente. No se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: el motor Zipformer de la aplicación Vibe es el destino principal; el formato GGUF está pensado para ese runtime. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no están orientados a transductores ASR.
- Latencia y throughput estimados: no disponibles. La aplicación procesa fragmentos de voz de hasta 30 segundos con contexto completo, no en modo streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| zipformer2-66m-streaming-he-gguf | 66,6 M | fragmentos de hasta 30 s en Vibe | hebreo | CC-BY-4.0 | GGUF (q8_0) | Conversión para Vibe; mismo texto que el modelo completo |
| thewh1teagle/zipformer2-66m-streaming-he | 66,6 M | no disponible | hebreo | no disponible en la información | safetensors (modelo base) | Modelo original del que deriva esta conversión |
| Alternativas de ASR en hebreo de otros tamaños o familias | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Solo hebreo: el inglés tiende a transcribirse letra a letra y los números aparecen de forma inconsistente, a veces como palabras y a veces como dígitos.
- Riesgo de errores de transcripción en audio con ruido, acentos marcados o vocabulario especializado; no se han publicado métricas de error en la información disponible.
- No es un modelo conversacional: no admite instrucciones, tool calling ni razonamiento; su única función es transcribir audio.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor original y a la conversión, e indicar si se han hecho cambios.
- El modelo base se distribuye desde k2-fsa/icefall bajo Apache-2.0 y se entrenó con audio de ivrit.ai; conviene revisar las condiciones de esos corpus para usos derivados.
- Depende de un runtime específico (el motor Zipformer de Vibe); fuera de esa aplicación no se documenta compatibilidad con los runners GGUF habituales.
- No se ejecuta en modo streaming en Vibe: trabaja con contexto completo sobre fragmentos de hasta 30 segundos, lo que añade latencia en usos de tiempo real.
- El repositorio no registra descargas ni valoraciones, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vibe-app/zipformer2-66m-streaming-he-gguf
- Modelo base: https://huggingface.co/thewh1teagle/zipformer2-66m-streaming-he
- Aplicación Vibe: https://github.com/thewh1teagle/vibe
- Repositorio k2-fsa/icefall: https://github.com/k2-fsa/icefall
- Corpus de audio ivrit.ai: https://huggingface.co/ivrit-ai

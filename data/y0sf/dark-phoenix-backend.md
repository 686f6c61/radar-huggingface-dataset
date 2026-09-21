# Y0sf/dark-phoenix-backend

## Resumen

Dark Phoenix Backend (identificador `Y0sf/dark-phoenix-backend`) no es un modelo de lenguaje con pesos publicados, sino un Space de Hugging Face que actúa como backend de producción para un sistema de generación automática de clips verticales, comercializado como Dark Phoenix Clipper. El autor es el usuario Y0sf y la ficha se creó el 21 de septiembre de 2026, con una actualización registrada ocho segundos después, sin descargas ni likes acumulados. La model card únicamente declara metadatos de despliegue (SDK Gradio 5.20.0, `app_file: app.py`), de modo que no hay información sobre arquitectura propia, número de parámetros, contexto ni dataset de entrenamiento.

El sistema orquesta varias piezas de software ya existentes: transcripción local con WhisperX en cuantización int8 sobre CPU, detección de hablante activo con TalkNet ASD adaptado a PyTorch CPU, reencuadre vertical 9:16 con seguimiento facial mediante FFmpeg y subtítulos quemados con la fuente Anton. La selección de los momentos virales se delega en una API externa de Google Gemini (referida en la documentación como Gemini 3.1 Flash Lite), y la persistencia de transcripciones y vídeos se realiza sobre Supabase Storage mediante pasarelas S3.

Su relevancia es operativa, no algorítmica: demuestra un patrón de despliegue de coste cero (CPU pura con ZeroGPU opcional) para pipelines de posproducción de vídeo, con caché de transcripciones para evitar reprocesos y un webhook autenticado invocado desde Inngest Cloud y Next.js. No se ha publicado ningún artefacto de modelo, pesos, licencia ni resultado de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo con pesos: es una aplicación Gradio que integra WhisperX, WhisperX int8, TalkNet ASD, FFmpeg y una API externa de Gemini 3.1 Flash Lite) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica |
| Longitud de contexto | No disponible (no se declara límite de contexto del componente Gemini ni de WhisperX en la información proporcionada) |
| Tipos de cuantización | int8 (aplicado a WhisperX en CPU, según la model card) |
| Idiomas soportados | No disponible en la ficha del Space (no se declara lista de idiomas) |
| Licencia | No disponible |
| Formato de pesos | No disponible (no se publican pesos; el Space despliega código y depende de servicios externos vía API) |

## Arquitectura y entrenamiento

No existe un modelo entrenado por el autor dentro de este repositorio. El Space es una capa de orquestación con tres endpoints (`POST /process_video` autenticado con `Authorization: Bearer <TOKEN>`, `GET /health` y `GET /` con interfaz Gradio de monitorización) y un `app.py` como punto de entrada bajo Gradio 5.20.0. El pipeline encadena: transcripción y alineación a nivel de palabra y fonema con WhisperX en int8 sobre CPU; caché de la transcripción en Supabase Storage con el patrón `<video>_transcript.json`; detección de hablante activo y seguimiento facial continuo con TalkNet ASD ejecutado en CPU; reencuadre dinámico a 1080×1920 centrado en el hablante activo mediante FFmpeg; y renderizado de subtítulos ASS con la fuente Anton más una marca de agua quemada (`drawtext=text='unartch':fontsize=28:fontcolor=white@0.8:x=w-tw-40:y=40`).

La única fase generativa o de decisión semántica se externaliza a Google Gemini 3.1 Flash Lite, al que se atribuye la selección de highlights y la extracción estructurada de momentos virales. No hay información sobre números de tokens de entrenamiento, composición de dataset, ajuste fino, RLHF, DPO ni ninguna innovación técnica propia más allá de la adaptación de TalkNet a ejecución en CPU y del sondeo de arranque (`ZeroGPU Probe`) para satisfacer al supervisor de ZeroGPU de Hugging Face.

## Capacidades

- Transcripción de audio a texto con marcas de tiempo a nivel de palabra y alineación fonémica (WhisperX, int8, CPU).
- Caché de transcripciones en almacenamiento S3/Supabase para evitar retranscribir vídeos ya procesados.
- Selección automática de fragmentos destacados y extracción estructurada de momentos potencialmente virales mediante la API de Google Gemini 3.1 Flash Lite.
- Detección de hablante activo y seguimiento facial continuo (TalkNet ASD sobre PyTorch CPU).
- Reencuadre vertical 9:16 a 1080×1920 con encuadre dinámico centrado en la persona que habla.
- Quemado de subtítulos con estilo ASS y fuente Anton, más marca de agua de texto integrada en los bytes del vídeo.
- Descarga y subida multiparte a almacenamiento S3/Supabase mediante pasarelas S3 propias.
- Exposición de un webhook autenticado para integración con orquestadores externos (Inngest Cloud, Next.js) y de una sonda de salud.
- No se documenta soporte de tool calling, function calling, modo de razonamiento explícito, visión, audio nativo ni capacidades de agente por parte del Space.

## Casos de uso

- Generación automática de clips para redes verticales: a partir de un vídeo largo, el pipeline transcribe, selecciona los momentos con potencial viral, reencuadra a 1080×1920 y entrega el clip con subtítulos quemados, listo para TikTok, Reels o Shorts sin edición manual.
- Subtitulado a nivel de palabra para repositorios de vídeo: WhisperX con alineación fonémica permite generar ficheros ASS con sincronía precisa, útiles para accesibilidad y para audiencias que consumen vídeo sin sonido.
- Reprocesado económico de catálogos: la caché `<video>_transcript.json` en Supabase Storage evita repetir la transcripción, de modo que solo se paga cómputo de selección de highlights en vídeos ya vistos, adecuado para lotes grandes de contenido recurrente.
- Posproducción con seguimiento de hablante en pódcasts y entrevistas: TalkNet ASD identifica quién habla en cada momento y el encuadre se recentra, lo que resuelve el problema clásico de recortar vídeo horizontal con dos o más personas.
- Integración en flujos de publicación automatizados: el endpoint `POST /process_video` con token Bearer permite que un job de Inngest Cloud o un backend Next.js dispare el procesado tras la subida del material original, sin intervención humana.
- Monitorización y depuración en vivo: la interfaz Gradio de `GET /` con registros de hitos permite probar manualmente y seguir el estado del procesado de un vídeo concreto mientras se desarrolla la integración.
- Marcado y branding de contenido: el quemado del watermark y el estilo de subtítulo fijo (Anton) sirven para aplicar una identidad visual homogénea a todo el material publicado, algo habitual en canales que licencian o redistribuyen clips.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de transcripción (WER), de precisión en la selección de highlights, de latencia ni de throughput. Tampoco se aportan comparaciones con otros pipelines de clipping.

## Requisitos de hardware

- Diseñado para ejecución 100 % en CPU: la model card afirma explícitamente que el backend está optimizado para funcionar gratis en CPU, con aceleración ZeroGPU opcional.
- Cuantización int8 en WhisperX para reducir consumo de memoria y coste de cómputo, según la documentación del autor.
- TalkNet ASD adaptado para ejecución en PyTorch CPU, lo que implica que el seguimiento facial no requiere GPU.
- VRAM estimada: no disponible. No se declaran cifras de memoria, ni para el modo CPU ni para el modo ZeroGPU.
- GPU recomendadas: no disponible. No se especifica ninguna GPU concreta.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el diseño declarado evita depender de GPU.
- Opciones de despliegue: Hugging Face Spaces con SDK Gradio 5.20.0 y `app.py` como fichero de aplicación; el sistema requiere además conectividad con la API de Google Gemini, Supabase Storage y el orquestador que invoca el webhook. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no se exponen pesos de un modelo propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables con datos verificables de parámetros, contexto, rendimiento o licencia. El Space tampoco publica pesos que permitan situarlo en una categoría de modelos de lenguaje.

| Criterio | Dark Phoenix Backend | Alternativa A | Alternativa B |
|---|---|---|---|
| Categoría | Backend de clipping sobre servicios externos | No disponible | No disponible |
| Parámetros | No aplica (sin pesos publicados) | No disponible | No disponible |
| Longitud de contexto | No disponible | No disponible | No disponible |
| Rendimiento | Sin benchmarks publicados | No disponible | No disponible |
| Licencia | No disponible | No disponible | No disponible |
| Disponibilidad | Space público en Hugging Face, 0 descargas y 0 likes | No disponible | No disponible |

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no puede confirmarse que el uso comercial, la redistribución o la modificación estén permitidos.
- No es un modelo: no se publican pesos ni checkpoints, así que no es posible autoalojar la totalidad de la inferencia. La fase de selección de highlights depende de la API externa de Google Gemini 3.1 Flash Lite.
- Dependencia de terceros para el funcionamiento completo: API de Gemini, Supabase Storage y orquestación vía Inngest Cloud. Una caída o un cambio de precios de cualquiera de ellos rompe el pipeline.
- El endpoint `POST /process_video` está expuesto y protegido únicamente por un token Bearer; no se documentan rotación de credenciales, limitación de tasa ni registro de auditoría.
- La marca de agua `unartch` se quema directamente en los fotogramas del vídeo, lo que impide eliminarla después sin recomprimir y puede ser problemático para reutilización del material por terceros.
- No se declara la lista de idiomas soportados ni la cobertura real de WhisperX en este despliegue; tampoco se indica el tratamiento de audio con ruido, música o solapamiento de voces.
- No hay métricas de calidad: se desconoce la tasa de error de transcripción, la precisión del seguimiento facial y la tasa de acierto en la selección de momentos destacados. El riesgo de alucinación del componente Gemini al resumir o etiquetar fragmentos no está cuantificado.
- El repositorio presenta 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad ni de uso en producción por terceros.
- La detección de hablante activo en CPU puede introducir latencias elevadas en vídeos largos o con muchos planos; no se publican cifras al respecto.
- El identificador interno del autor menciona un backend de un producto comercial, pero no se aportan condiciones de uso, garantías ni soporte.

## Enlaces

- Space en Hugging Face: https://huggingface.co/Y0sf/dark-phoenix-backend
- Repositorio de código, paper, blog o demo: no disponible. La model card no incluye enlaces adicionales.
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Los resultados devueltos corresponden a sitios de contenido para adultos sin relación alguna con el Space, por lo que se descartan y no se listan.

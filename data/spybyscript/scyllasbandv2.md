# spybyscript/scyllasbandv2

## Resumen

Scylla's Band es un modelo de síntesis de voz y de canto (text-to-speech y singing-voice-synthesis) desarrollado por el usuario spybyscript y publicado en Hugging Face bajo licencia Apache 2.0. Se distribuye como un conjunto de grafos precompilados en varios formatos (litert, tflite, onnx, coreml y pytorch) y se ejecuta mediante un runtime propio escrito en C con ABI estable, disponible para Linux, Windows, macOS, iOS, visionOS y Android. El modelo cubre seis idiomas (inglés, español, italiano, francés, alemán y vietnamita) y catorce voces.

La propuesta diferencial es unificar habla y canto en un único modelo: un mismo flujo generativo renderiza ambas modalidades, seleccionadas mediante un modo de entrega (`delivery_mode_id`), con dos decodificadores de forma de onda distintos (Vocos para habla y BigVGAN v2 ajustado para canto). La versión documentada es `v4-20261106`, que añade canto pop y balada a partir de partituras en JSON con letra, notas y tiempos, manteniendo el coste computacional del habla gracias a una doble destilación del flujo.

El modelo resuelve el problema de integrar voz expresiva y canto controlable en un mismo artefacto desplegable en dispositivo (on-device), sin depender de servicios en la nube. Su relevancia actual radica en la combinación de licencia permisiva, soporte multiplataforma nativo y controles medidos de intensidad, ritmo y tono, lo que lo hace apto para aplicaciones interactivas con privacidad por diseño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flujo generativo (duration-flow) con dos decodificadores de waveform: Vocos (habla) y BigVGAN v2 ajustado (canto) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, es, it, fr, de, vi |
| Licencia | apache-2.0 |
| Formato de pesos | litert, tflite, onnx, coreml, pytorch |

## Arquitectura y entrenamiento

El modelo se organiza como un flujo generativo (flow matching) que produce representaciones acústicas intermedias, seguido de un decodificador de waveform. En `v4-20261106` conviven dos rutas: el habla conserva el decodificador Vocos y el flujo destilado de `v3`, mientras que el canto emplea un decodificador BigVGAN v2 ajustado sobre las voces del modelo. La selección de ruta la realiza el runtime según el modo de entrega, que entra como una entrada adicional del grafo (`delivery_mode_id`) dentro del contrato `scyllasband_measured_controls_v4`.

El entrenamiento del canto se construyó sobre el flujo destilado de `v3`, continuado mediante reflow sobre material cantado; la salida hablada arranca idéntica a `v3`. Las rutas de canto y balada se destilaron una segunda vez desde el campo con classifier-free guidance del profesor (melodía y modo desactivados, guidance 2), de modo que el flujo reproduce la respuesta guiada sin guía: 4 pasos Euler con una evaluación por paso, frente a los 8 pasos Heun con guía (32 evaluaciones) del primer candidato de canto (`v4-20261105`, no publicado). La claridad de la letra y la precisión de tono se mantienen según el autor. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Síntesis de voz expresiva en seis idiomas (en, es, it, fr, de, vi) con catorce voces.
- Canto a partir de partituras JSON con letra, tempo, estilo (`pop` o `ballad`) y notas `[label, pitch, beats]`.
- Control medido de entrega en habla: intensidad, ritmo y tono, cada uno en rango −2 a 2, normalizados en desviaciones estándar respecto a la media de cada voz.
- Segmentación automática de frases por silencios de un cuarto de segundo o más, renderizadas una a una.
- Desplazamiento automático de octava al registro cantado de cada voz (`--no-register` conserva la octava escrita).
- Soporte de palabras repartidas en varias notas mediante numeración (`baby~1`, `baby~2`) y silencios con la etiqueta `-`.
- Ejecución on-device con WebGPU o CPU en el navegador tras una descarga única de 303 MB.
- No se documenta soporte de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Aplicaciones de lectura en voz alta en el navegador: el modelo puede ejecutarse íntegramente en el dispositivo del usuario con WebGPU o CPU, de modo que el texto introducido no sale del navegador, lo que encaja en productos con requisitos estrictos de privacidad.
- Audiolibros y contenido narrado con matices: los controles de intensidad y ritmo permiten ajustar el tono emocional y la velocidad de cada pasaje sin cambiar de voz, útil para producciones que requieren consistencia de narrador.
- Asistentes de voz integrados en aplicaciones móviles: el runtime nativo cubre iOS, visionOS y Android, lo que permite empaquetar la síntesis en la propia aplicación sin llamadas a servidores externos.
- Prototipado musical y demos de canto: a partir de una partitura JSON con letra y notas se genera una interpretación cantada en estilo pop o balada, adecuada para maquetas rápidas o herramientas educativas de composición.
- Localización de contenido multimedia: al cubrir seis idiomas con las mismas catorce voces y los mismos controles normalizados, se pueden generar versiones dobladas de un mismo guion manteniendo parámetros de entrega comparables entre idiomas.
- Accesibilidad y sistemas de comunicación aumentativa: la síntesis local y de baja latencia permite construir interfaces de voz para personas con dificultades del habla sin depender de conectividad.
- Integración en pipelines de generación de audio por lotes: el runtime de línea de comandos (`speak`, `sing`) facilita automatizar la producción de ficheros WAV a partir de textos o partituras en scripts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 20,9 GB, aunque la demo web descarga un paquete de 303 MB para ejecución en navegador.
- Ejecución en navegador mediante WebGPU (GPU del cliente) o CPU, sin datos concretos de latencia publicados.
- Runtime nativo disponible para Linux, Windows, macOS, iOS, visionOS y Android; en macOS se ofrecen los paquetes `coreml` y `coreai`.
- El autor indica que el runtime nativo compilado (`build-native`) es mucho más rápido y ligero que el motor Python, que ejecuta los mismos planes.
- No se especifican VRAM mínima, GPU recomendadas, ni cifras de throughput o latencia en la información disponible.
- Opciones de despliegue documentadas: runtime propio `scyllasband` (Python y nativo), LiteRT, ONNX, CoreML y PyTorch.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formatos | Canto | Contexto |
|---|---|---|---|---|---|---|
| Scylla's Band (`v4-20261106`) | TTS + canto, flujo + Vocos/BigVGAN | 6 | Apache 2.0 | litert, tflite, onnx, coreml, pytorch | Sí (partitura JSON) | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos alternativos de la misma categoría (TTS expresivo on-device con canto) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo nunca canta de forma libre: requiere una partitura (escrita por el usuario o por un planificador) con letra, notas y tiempos.
- El control de intensidad modula cuánto se expresa una emoción, no qué emoción se transmite; no permite seleccionar emociones arbitrarias.
- Las peticiones de control fuera del rango −2 a 2 se recortan al límite, y los controles no especificados toman el valor por defecto de la voz (0 en esta versión).
- Los runtimes compilados para `v3` rechazan este paquete y siguen descargando `v3-20261104-apple`; es necesario actualizar el runtime para usar `v4`.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones específicas de contexto o idioma en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre las voces ni sobre el material de entrenamiento.
- No se publican cifras de latencia, throughput ni requisitos mínimos de hardware, lo que dificulta dimensionar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spybyscript/scyllasbandv2
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/spybyscript/scyllasband
- Demo alternativa: https://lowkeytea.dev/scyllasband/demo/
- Runtime en GitHub: https://github.com/lowkeytea/scyllasband

# storyteller-platform/pocket-tts-english

## Resumen

Pocket TTS English es un modelo de síntesis de voz (text-to-speech) para inglés, entrenado originalmente por Kyutai y publicado bajo el identificador `kyutai/pocket-tts`. El repositorio analizado, `storyteller-platform/pocket-tts-english`, es un espejo de la versión 2.0.0 que la plataforma Storyteller distribuye a través de su registro de modelos mediante la herramienta `ghost-story`. No se trata, por tanto, de un modelo entrenado por storyteller-platform, sino de una conversión y empaquetado del modelo de Kyutai en formato GGUF.

El modelo cuenta con 109.502.146 parámetros (aproximadamente 110 millones), lo que lo sitúa en la categoría de modelos TTS ligeros, aptos para inferencia en CPU o en GPUs de gama baja. La conversión a GGUF la realiza audio.cpp, y en este repositorio solo se conserva la cuantización `q8_0`, lo que reduce el peso del artefacto y facilita su despliegue en entornos con recursos limitados.

Su relevancia radica en que ofrece una alternativa de código abierto (licencia CC-BY-4.0) para la generación de voz en inglés dentro de pipelines de narración automatizada, como el caso de uso de Storyteller (conversión de libros a audiolibros). Al estar en GGUF, es compatible con el ecosistema de inferencia de audio.cpp, lo que simplifica su integración en aplicaciones locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; detalles de la red no publicados en la informacion disponible) |
| Parametros totales | 109.502.146 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0 (unica cuantizacion GGUF conservada en el repo) |
| Idiomas soportados | ingles (segun el nombre del modelo y la model card) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (conversion realizada por audio.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en los datos proporcionados. La model card indica unicamente que fue entrenado por Kyutai y publicado como `kyutai/pocket-tts`, sin especificar el tipo de red (por ejemplo, si emplea un encoder de texto, un decoder acustico o un vocoder neuronal), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Lo que si se conoce es el proceso de empaquetado: el modelo original se convirtio a GGUF mediante audio.cpp (repositorio `audio-cpp/audio.cpp-gguf`, revision `7bf52723f5a9`), y Storyteller lo redistribuye en su registro de modelos con una carpeta por formato. En este repositorio solo se mantiene la cuantizacion `q8_0`, lo que implica una precision de 8 bits por peso y un tamano de repositorio de 0,3 GB. Cualquier detalle adicional sobre innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.) no esta disponible.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles: genera audio a partir de texto de entrada.
- Orientado a narracion y lectura en voz alta, segun el contexto de uso de Storyteller (conversion de libros a audiolibros).
- Empaquetado en GGUF, lo que permite su uso con herramientas de inferencia compatibles con este formato (audio.cpp).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No se dispone de informacion sobre capacidades multilingues mas alla del ingles.
- No se dispone de informacion sobre control de estilo, clonacion de voz, emociones o SSML.

## Casos de uso

- Conversion de libros a audiolibros: el modelo puede narrar texto largo en ingles, integrandose en la plataforma Storyteller para generar pistas de audio por capitulo. Su tamano reducido (110 M de parametros) permite procesar grandes volumenes de texto sin requerir hardware de gama alta.
- Lectura de articulos y boletines: util para generar versiones en audio de contenido web o newsletters en ingles, con un coste computacional bajo y despliegue local.
- Accesibilidad para personas con discapacidad visual: permite convertir documentos de texto en voz de forma automatica dentro de aplicaciones de escritorio o servidores modestos.
- Asistentes de voz offline: al estar en GGUF y tener un tamano pequeno, puede ejecutarse en dispositivos sin conexion a internet, preservando la privacidad del texto procesado.
- Generacion de contenido para podcasts o videos: narracion automatizada de guiones en ingles para produccion de contenido, con la ventaja de la licencia CC-BY-4.0 para uso comercial con atribucion.
- Pruebas de integracion en pipelines de audio.cpp: sirve como modelo de referencia para validar flujos de inferencia TTS en el ecosistema GGUF antes de escalar a modelos mayores.
- Prototipado de aplicaciones de lectura por voz en entornos educativos: bajo coste de despliegue y facilidad de instalacion en laboratorios o aulas con equipos convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 110 M de parametros en cuantizacion q8_0, el peso de los pesos ronda los 0,1-0,15 GB; la VRAM necesaria es muy baja, probablemente inferior a 1 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) deberia ser suficiente, e incluso GPUs integradas.
- Compatibilidad con GPU consumer: si, por el reducido numero de parametros y el formato GGUF.
- Opciones de despliegue: audio.cpp (herramienta de conversion e inferencia indicada en la model card); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, ya que no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de TTS que permitan una comparacion rigurosa. Como referencia de categoria, el modelo pertenece a la familia de TTS ligeros de Kyutai, pero no se dispone de cifras comparativas verificables.

## Limitaciones y advertencias

- Idioma limitado: el modelo esta disenado para ingles; no se garantiza un comportamiento correcto en otros idiomas.
- Sesgos: no se dispone de informacion sobre sesgos de voz (genero, acento, edad) ni sobre la diversidad del dataset de entrenamiento.
- Riesgo de alucinacion: en TTS, el riesgo se traduce en pronunciaciones incorrectas, omisiones o artefactos en el audio; no se dispone de evaluaciones publicadas al respecto.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial siempre que se atribuya la autoria (Kyutai y, en su caso, Storyteller por la redistribucion). Es necesario revisar los terminos completos de la licencia.
- Trazabilidad: este repositorio es un espejo de la version 2.0.0; cambios en el modelo original de Kyutai no se reflejaran automaticamente.
- Formato unico: solo se conserva la cuantizacion q8_0, por lo que no hay opciones de menor precision (q4, q5) en este repositorio.
- Sin datos de contexto ni de arquitectura: no es posible evaluar limitaciones de longitud de entrada o de calidad en textos largos a partir de la informacion disponible.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica que no hay validacion comunitaria publica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/storyteller-platform/pocket-tts-english
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Repositorio de conversiones GGUF de audio.cpp: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Registro de modelos de Storyteller (GitLab): https://gitlab.com/storyteller-platform/storyteller/-/ml/models/pocket-tts-english

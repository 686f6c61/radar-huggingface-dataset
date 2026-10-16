# Steveeeeeeen/gemma-audio-asr-en-1000h-20261015

## Resumen
Gemma audio English ASR es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por el usuario Steveeeeeeen. Se trata de una implementación limpia, publicada en HuggingFace, de la arquitectura descrita por QUAN-Transcribe, que combina estados de audio extraídos de un modelo Gemma con un lector Transformer propio y una cabeza CTC. El problema que resuelve es la transcripción de audio a texto en inglés, apoyándose en la representación de audio de la familia Gemma en lugar de partir de un encoder acústico convencional.

El modelo parte del modelo base google/embeddinggemma-2, pero solo afina sus dos últimos bloques de audio; el lector (seis capas Transformer de 768 dimensiones) se entrena desde cero. La arquitectura mezcla de forma aprendida 13 estados de audio de Gemma, aplica una convolución depthwise causal y finaliza con un clasificador CTC sobre el vocabulario de tokens de Gemma.

Es relevante como ejemplo reproducible de ASR basado en embeddings multimodales, aunque sus propios resultados se describen como experimentales y no se han publicado cifras de benchmarks en la información disponible. El repositorio ocupa 5,0 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su reutilización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla aprendida de 13 estados de audio de Gemma + convolucion depthwise causal + 6 capas Transformer de 768 dimensiones + clasificador CTC sobre tokens de Gemma |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura sigue el diseno de QUAN-Transcribe: en lugar de un encoder convolucional o Transformer clasico sobre espectrogramas, el modelo aprende una mezcla de 13 estados de audio extraidos de Gemma, a los que aplica una convolucion depthwise causal para modelar dependencias temporales. Sobre esa representacion se apilan seis capas Transformer de 768 dimensiones (el "reader") y, finalmente, un clasificador CTC que predice tokens del vocabulario de Gemma. El vocabulario de entrenamiento contiene 56695 tokens de Gemma mas los simbolos blank y unknown.

El lector se entrena desde cero para ingles y solo se afinan los dos ultimos bloques de audio de Gemma; no se reutilizan los pesos vietnamitas de QUAN ni su codigo de inferencia. Los datos provienen del dataset espnet/yodas-granary y la seleccion por metadatos de duracion abarca aproximadamente 1.000 horas. La separacion entre validacion y test se hace por identificadores de grabacion originales, y el muestreo de fragmentos (chunk sampling), la seleccion de vocabulario en ingles y el esquema de optimizacion son decisiones propias de este ejemplo, ya que la referencia publicada no libera su bucle de entrenamiento ni su calendario exacto de optimizacion. La model card remite a `run_config.json`, `history.json` y `metrics.json` para la receta y los resultados reales.

## Capacidades
- Reconocimiento automatico del habla (ASR) en ingles: transcripcion de audio a texto con salida CTC sobre tokens de Gemma.
- Modelado acustico basado en representaciones de audio de Gemma, en lugar de features espectrales clasicas.
- Entrenamiento especifico para ingles con un vocabulario derivado del tokenizador de Gemma.
- Capacidad de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo ASR).
- Capacidades multilingues: no, unicamente ingles segun la informacion disponible.
- Capacidades especiales (modo thinking, vision, audio generativo): no disponible; la modalidad de entrada es audio y la de salida es texto.

## Casos de uso
- Transcripcion de reuniones en ingles: el modelo convierte audio en texto plano, lo que permite generar actas y resumenes a partir de grabaciones de llamadas o sesiones de trabajo en ingles.
- Subtitulado automatico de contenido audiovisual en ingles: puede emplearse como motor de ASR en pipelines de generacion de subtitulos (por ejemplo, formato SRT) para videos y podcasts.
- Voice-to-text para asistentes y aplicaciones de dictado: integrable como componente de transcripcion en aplicaciones de escritorio o moviles que necesiten convertir voz en texto en ingles.
- Indexacion y busqueda de archivos de audio: transcribir grandes volumenes de grabaciones para hacerlas buscables por texto en sistemas de gestion documental.
- Analitica de contact center: transcripcion de conversaciones de atencion al cliente en ingles para posterior analisis de calidad, sentimiento o cumplimiento.
- Generacion de datasets etiquetados: uso como motor de pseudo-etiquetado para crear corpus de audio-texto en ingles que alimenten otros entrenamientos.
- Investigacion en ASR basado en embeddings multimodales: sirve como punto de partida reproducible para estudiar arquitecturas que reutilizan representaciones de audio de modelos de lenguaje.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las puntuaciones son experimentales y que solo apareceran tras la evaluacion, remitiendo a `metrics.json` para los resultados, sin incluir cifras en el texto proporcionado.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma exacta. El repositorio ocupa 5,0 GB, por lo que la VRAM necesaria sera del orden de ese tamano en la precision de los pesos publicados, mas el sobrecoste de las activaciones en funcion de la longitud de audio.
- GPU recomendadas: no disponible. Por el tamano del repositorio, es plausible su ejecucion en GPU de gama alta de consumo (por ejemplo, RTX 3090 o RTX 4090 con 24 GB), pero no hay confirmacion en la informacion proporcionada.
- Cabe en consumer GPU: probable segun el tamano del repositorio (5,0 GB), aunque no se especifican requisitos oficiales.
- Opciones de despliegue: al estar etiquetado con `transformers` y `safetensors`, el despliegue natural es mediante la libreria transformers de HuggingFace; no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma audio English ASR | no disponible | no disponible | Gemma audio states + reader Transformer + CTC | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| QUAN-Transcribe 1.0 | no disponible | no disponible | Arquitectura de referencia (vietnamita) | no disponible | HuggingFace (referencia citada) |
| google/embeddinggemma-2 | no disponible | no disponible | Modelo base de embeddings del que se derivan los estados de audio | no disponible | HuggingFace (modelo base) |

Comparativa adicional con alternativas de ASR generalistas (como la familia Whisper de OpenAI) no disponible con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no disponible; no se documentan analisis de sesgo.
- Riesgo de alucinacion: inherente a los modelos ASR con decodificacion CTC sobre vocabulario amplio; no se cuantifica en la informacion disponible.
- Limitaciones de contexto o idioma: el modelo esta entrenado unicamente para ingles; no soporta otros idiomas segun la informacion proporcionada. La longitud maxima de audio procesable no se especifica.
- Restricciones de licencia para uso comercial: licencia apache-2.0, que permite uso comercial, si bien conviene verificar las condiciones del modelo base google/embeddinggemma-2 del que deriva.
- Caveats para produccion: las puntuaciones son experimentales y solo estaran disponibles tras la evaluacion; el modelo tiene 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad. La seleccion de vocabulario, el esquema de optimizacion y el muestreo de fragmentos son elecciones propias del autor, no las de la referencia. Los metadatos de entrenamiento advierten de fragmentos de audio rechazados, lo que puede afectar a la cobertura del dataset. No se documentan requisitos de hardware ni latencias.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Steveeeeeeen/gemma-audio-asr-en-1000h-20261015
- Arquitectura de referencia QUAN-Transcribe: https://huggingface.co/qnguyen3/QUAN-Transcribe-1.0
- Modelo base google/embeddinggemma-2: https://huggingface.co/google/embeddinggemma-2
- Dataset de entrenamiento espnet/yodas-granary: https://huggingface.co/datasets/espnet/yodas-granary

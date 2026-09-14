# zuhri025/byte-llm-tts-v1

## Resumen

byte-llm-tts-v1 es un modelo de sintesis de voz (TTS) bilingue desarrollado por el usuario zuhri025 y publicado en HuggingFace. Se trata de un transformer causal de tipo Qwen3 con tan solo 38,2 millones de parametros, entrenado desde cero sobre texto plano con un vocabulario a nivel de byte de 264 tokens (256 bytes UTF-8 mas 8 tokens especiales) y posteriormente ajustado para generar audio mediante el codec Kanade. El modelo cubre dos idiomas: ingles y urdu.

La particularidad tecnica del modelo es su enfoque byte-level: en lugar de tokenizar palabras, opera directamente sobre bytes UTF-8, lo que elimina la dependencia de un tokenizador especifico de idioma y preserva el conocimiento linguistico del checkpoint base al ampliar el vocabulario. Para el ajuste de TTS, el vocabulario se extendio de 264 a 13.080 tokens anadiendo 16 tokens de control de sintesis de voz y 12.800 tokens de codigo de audio que corresponden a los indices del codec Kanade.

El modelo es relevante como prueba de concepto de TTS ultraligero y multilingue: con menos de 40 millones de parametros propone una arquitectura que unifica texto y audio en un unico espacio de tokens de byte. No obstante, se encuentra en una fase muy temprana de publicacion: cero descargas, cero likes, sin licencia declarada y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de tipo Qwen3, a nivel de byte (byte-level) |
| Parametros totales | 38,2 M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | ingles y urdu |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Vocabulario | 264 tokens base (256 bytes UTF-8 + 8 especiales), ampliado a 13.080 tokens para TTS |
| Codec de audio | Kanade (12.800 tokens de contenido) |
| Fecha de publicacion | 14 de septiembre de 2026 |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

La base es un modelo de lenguaje causal de arquitectura Qwen3 con 38,2 millones de parametros, preentrenado desde cero sobre texto plano con un vocabulario byte-level de 264 tokens. Para el ajuste de TTS, el vocabulario se amplio hasta 13.080 entradas en dos bloques: 16 tokens especiales de control (entre ellos `<|start_of_speech|>`, `<|speech|>`, `<|start_of_text|>`, las etiquetas de idioma `<|en|>` y `<|ur|>`, etiquetas de prosodia y 7 ranuras reservadas) y 12.800 tokens de codigo de audio `<|code_0|>` a `<|code_12799|>` que se corresponden con los indices de tokens de contenido del codec Kanade. No se utilizan etiquetas de voz ni de acento: la prosodia se transmite exclusivamente a traves de los propios tokens de audio.

Un detalle relevante de ingenieria es la estrategia de expansion del embedding: los primeros 264 identificadores son identicos a los del checkpoint de preentrenamiento, de modo que todo el conocimiento linguistico a nivel de byte se preserva al redimensionar la matriz. Las filas nuevas se inicializan con la media de las 264 existentes mas ruido gaussiano de baja amplitud. El formato de secuencia es `<|start_of_speech|> [lang] <|start_of_text|> texto en bytes <|end_of_text|> <|speech|> tokens de audio <|end_of_speech|>`, y la funcion de perdida combina ambas modalidades con ponderacion asimetrica: `total_loss = 3,0 × audio_loss + 1,0 × text_loss`, aplicando ademas un peso local doble a los tokens de frontera `<|speech|>` y `<|end_of_speech|>`, cuya omission implica el fallo completo de la secuencia.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Sintesis de voz bilingue (texto a codigos de audio) en ingles y urdu.
- Procesamiento de texto a nivel de byte, sin tokenizador dependiente del idioma.
- Generacion de tokens de audio compatibles con el codec Kanade, que deben ser decodificados posteriormente para obtener la forma de onda.
- Control de idioma mediante etiquetas dedicadas (`<|en|>`, `<|ur|>`).
- Control de prosodia mediante etiquetas especificas (la prosodia se codifica en los tokens de audio, no con etiquetas de voz o acento).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio de entrada ni modo de razonamiento explicito.
- No se documentan capacidades adicionales de generacion de texto, codigo o matematicas mas alla del preentrenamiento base sobre texto plano.

## Casos de uso

- Asistentes de voz bilingues: el modelo puede generar los codigos de audio correspondientes a respuestas en ingles y urdu dentro de un mismo sistema, seleccionando el idioma mediante las etiquetas `<|en|>` y `<|ur|>`, lo que simplifica el despliegue en regiones con poblacion bilingue.
- Accesibilidad y lectura en voz alta: integrado en lectores de pantalla o aplicaciones de accesibilidad, convierte texto plano en secuencias de audio decodificables por Kanade, con un coste computacional muy bajo gracias a sus 38,2 M de parametros.
- Locucion automatizada de contenidos: generacion de pistas de voz para articulos, boletines o noticias en ingles y urdu, aprovechando el control de prosodia a traves de los tokens de audio.
- Prototipado e investigacion en TTS byte-level: sirve como banco de pruebas reproducible para estudiar la expansion de vocabulario byte-level a tokens de audio, la inicializacion de embeddings ampliados y la ponderacion asimetrica de perdidas texto/audio.
- Aumentacion de datos de audio: conversion masiva de corpus textuales en ingles y urdu a codigos de audio para generar datasets de entrenamiento o evaluacion de otros sistemas de voz.
- Educacion de idiomas: practicas de pronunciacion y comprension auditiva en urdu e ingles, con la ventaja de que un unico modelo cubre ambos idiomas y evita mantener dos pipelines separados.
- Sistemas embebidos y edge computing: su tamano reducido permite ejecutar inferencia en dispositivos con recursos limitados o incluso en CPU, algo inviable con modelos de TTS de miles de millones de parametros.
- Integracion en pipelines de sintesis: al producir tokens de codigo en lugar de forma de onda, encaja en arquitecturas desacopladas donde la decodificacion Kanade se ejecuta en un servicio independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no facilitada por el autor): aproximadamente 153 MB en fp32, 77 MB en fp16/bf16 y 38 MB en int8.
- El repositorio ocupa 0,9 GB, un tamano muy superior al de los pesos en precision completa, lo que sugiere la presencia de registros de TensorBoard, estados de optimizador u otros artefactos de entrenamiento.
- GPU recomendadas: no disponibles. Dado el tamano del modelo, cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) es mas que suficiente, e incluso la inferencia en CPU es viable.
- Cabe holgadamente en cualquier GPU consumer y en hardware integrado.
- Opciones de despliegue: el repositorio incluye `byte_tokenizer.py`, `byte_finetune.py` e `infer.py` como pipeline de referencia. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el vocabulario byte-level personalizado y los tokens de audio harian necesaria una adaptacion especifica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni caracteristicas medibles de otros modelos de TTS comparables, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo en fase experimental: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Ausencia de licencia declarada: no se especifican los terminos de uso, lo que supone un riesgo legal para cualquier despliegue comercial.
- No se han publicado resultados de benchmarks, por lo que no existe evidencia cuantitativa de calidad de sintesis ni de inteligibilidad.
- Riesgo de alucinacion en la generacion de audio: al ser el audio una secuencia de tokens generada por un modelo de lenguaje, puede producir combinaciones de codigos invalidas o incoherentes.
- Cobertura linguistica limitada a ingles y urdu; no se documenta comportamiento en otros idiomas.
- No dispone de etiquetas de voz o acento, de modo que no es posible seleccionar una identidad vocal concreta.
- No genera forma de onda directamente: requiere un decodificador Kanade externo para obtener el audio final.
- Longitud de contexto no documentada, lo que impide planificar la sintesis de fragmentos largos sin truncamiento.
- La fecha de publicacion registrada (septiembre de 2026) resulta anomala respecto a la fecha actual, lo que conviene verificar antes de tratarla como referencia.
- No se documentan sesgos especificos, pero un modelo preentrenado desde cero sobre un corpus no descrito hereda los sesgos de dichos datos.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/zuhri025/byte-llm-tts-v1
- Tokenizador byte-level: https://huggingface.co/zuhri025/byte-llm-tts-v1/blob/main/byte_tokenizer.py
- Script de ajuste fino: https://huggingface.co/zuhri025/byte-llm-tts-v1/blob/main/byte_finetune.py
- Script de inferencia: https://huggingface.co/zuhri025/byte-llm-tts-v1/blob/main/infer.py
- Paper asociado: no disponible
- Repositorio de codigo independiente: no disponible
- Demo publica: no disponible

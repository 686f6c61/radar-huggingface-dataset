# Suarify/suaradee-michael-v0.1

## Resumen

Suaradee Michael v0.1 es un modelo de síntesis de voz (text-to-speech) para bahasa melayu (malayo de Malasia) con voz masculina, desarrollado por Suarify. Se trata de la versión masculina de Suaradee v0.2 (voz femenina) y comparte con ella tamano, codigo y front end de procesamiento del malayo. El modelo resuelve el problema de generar habla en malayo de forma extremadamente ligera: un unico archivo ONNX de 8,46 MB que puede ejecutarse tanto en una pestana de navegador (via transformers.js con WebGPU o WASM) como en un solo hilo de CPU en Python.

Tecnicamente es un modelo diminuto de 7,9 millones de parametros, construido sobre la arquitectura y receta de entrenamiento de Paradee-8M (Sahil Mahendrakar), partiendo de su fila de voz masculina estadounidense. Produce audio mono a 24 kHz y acepta como entradas `input_ids` y un parametro de velocidad. Es relevante ahora por su perfil de despliegue: cabe en cualquier entorno, no requiere GPU dedicada y demuestra que es posible adaptar un modelo TTS de 8M a un idioma de recursos medios como el malayo con menos de una hora de entrenamiento en una T4.

Es una primera release con calidad limitada: el propio autor advierte que comete mas errores de palabra que el modelo femenino y que solo cubre una voz sintetica sin control de emocion ni estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paradee-8M (red neuronal ligera de síntesis de voz; detalles internos no disponibles) |
| Parametros totales | 7,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa frases cortas, texto largo dividido por frases) |
| Tipos de cuantizacion | int8 (pesos del archivo ONNX publicado) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas comunes en el habla malasia |
| Licencia | Apache-2.0 (el lexico `lexicon_e.json` es CC BY-SA 4.0) |
| Formato de pesos | ONNX (opset 17), `onnx/model_quantized.onnx`; front end transformers.js |

Otros datos: salida de audio mono a 24 kHz; tamanio del archivo 8,46 MB; entradas `input_ids` (int64 `[1,T]`) y `speed` (float32 `[1]`); vocabulario de fonemas de 178 simbolos (el de Kokoro-82M).

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura de 8M parametros y la receta de entrenamiento de Paradee-8M, arrancando desde su fila de voz masculina estadounidense. El front end es una conversion basada en reglas que escribe el malayo como fonemas dentro del vocabulario de 178 simbolos de Kokoro-82M; este front end esta implementado en `suaradee/` (Python) y portado linea a linea a `js/` para transformers.js. Los pesos se exportaron a ONNX (opset 17) con pesos int8 y se prepararon para ser seguros en WebGPU.

Los datos de entrenamiento son aproximadamente 49 minutos de habla sintetica en malayo: unas 750 frases malayas convertidas a voz con Chatterbox Multilingual y sometidas a conversion de voz en dos pasos (primero a voz femenina, luego a voz masculina) usando una referencia leida por Kokoro `am_michael`. El audio posterior a la ultima palabra alineada se recorta. El entrenamiento completo requirio menos de una hora en una unica GPU T4. No se documenta uso de RLHF ni DPO; la calidad se midio objetivamente con CER de Whisper large-v3.

## Capacidades

- Síntesis de voz en bahasa melayu (Malasia) con voz masculina unica.
- Generacion de audio mono a 24 kHz a partir de texto.
- Parametro de control de velocidad de habla (`speed`).
- Manejo de palabras inglesas comunes en el habla malasia (code-switching basico).
- Procesamiento de numeros y frases interrogativas (con CER bajo en numeros: 1,1% mediana).
- Division automatica de texto largo por finales de frase en los front ends Python y JS.
- Soporte de streaming en los scripts `stream_python.py` y `stream_node.mjs`.
- Ejecucion en navegador via transformers.js (WebGPU o WASM) y en Python sobre CPU.
- No dispone de control de emocion, estilo ni multiples voces.

## Casos de uso

- Lectura de texto en aplicaciones web sin backend: al ejecutarse en una pestana via transformers.js con WebGPU o WASM, permite aniadir locucion en malayo a una web o PWA sin servidor de inferencia ni coste de GPU.
- Asistentes de voz embebidos en dispositivos de bajos recursos: con 8,46 MB y ejecucion en un solo hilo de CPU, puede integrarse en sistemas con RAM y potencia limitadas para respuestas habladas cortas.
- Accesibilidad y lectores de pantalla en malayo: sintesis local de frases para conversion de texto a voz en interfaces, con velocidad ajustable mediante el parametro `speed`.
- Prototipado rapido de productos de voz para el mercado malasio: permite validar flujos conversacionales y demos de TTS en bahasa melayu con licencia Apache-2.0 antes de invertir en un modelo mayor.
- Generacion de avisos y mensajes breves en aplicaciones de movilidad o comercio: frases cortas como confirmaciones, numeros de pedido y preguntas, donde el modelo muestra CER mediana baja en numeros (1,1%) y preguntas (0,0%).
- Investigacion sobre TTS de bajo coste en idiomas de recursos medios: sirve como referencia reproducible de adaptacion de un modelo de 8M a un idioma nuevo con menos de una hora de entrenamiento en una T4.
- Pruebas de pipelines de audio con code-switching malayo-ingles: cubre palabras inglesas habituales en el habla malasia, util para evaluar sistemas de reconocimiento y sintesis mixtos.

## Benchmarks y rendimiento

Calidad medida reproduciendo el habla del modelo a Whisper large-v3 y comparando con el texto (character error rate, CER; menor es mejor).

| Conjunto | n | CER mediana | CER media truncada | Proporcion <= 8% |
|---|---|---|---|---|
| Frases de test no vistas (cada 5 fila del set de 200, seis categorias) | 40 | 5,7% | 9,3% | 55% |
| Frases reservadas del set de entrenamiento | 60 | 10,0% | 15,6% | 38% |

Por categoria (frases de test):

| Categoria | n | CER mediana |
|---|---|---|
| codeswitch | 4 | 6,9% |
| conversational | 12 | 11,9% |
| general | 14 | 10,0% |
| numbers | 6 | 1,1% |
| question | 2 | 0,0% |
| short | 2 | 11,9% |

Referencia: el habla con la que aprendio el modelo puntua 4,3% de CER mediana en los clips reservados.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el archivo de pesos int8 ocupa 8,46 MB y puede ejecutarse en CPU.
- GPU recomendadas: innecesarias; funciona en un solo hilo de CPU. En navegador, WebGPU acelera la inferencia y WASM sirve como alternativa.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y tambien en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime en Python (paquete `suaradee`, instalable via wheel), transformers.js en navegador (WebGPU o WASM), scripts de streaming en Python (`stream_python.py`) y Node (`stream_node.mjs`).
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo indica que se ejecuta en una pestana de navegador o en un hilo de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Suaradee Michael v0.1 | 7,9 M | texto corto (division por frases) | ms (con ingles) | Apache-2.0 | ONNX int8 | Voz masculina; CER mediana 5,7% en test no visto |
| Suaradee v0.2 (Suarify) | mismo tamano (segun el autor) | texto corto | ms | no disponible en esta ficha | no disponible | Voz femenina; el autor indica que es mas precisa que la masculina |
| Paradee-8M (Sahil Mahendrakar) | 8 M | texto corto | en (voz masculina US) | no disponible en esta ficha | no disponible | Modelo base de arquitectura y receta; punto de partida del entrenamiento |
| Kokoro-82M (hexgrad) | 82 M | texto corto | varios (incluye en) | no disponible en esta ficha | no disponible | Origen del vocabulario de 178 fonemas y de la referencia de voz `am_michael` |

## Limitaciones y advertencias

- Tasa de error: 45% de las frases de test superaron 8% de CER (una palabra erronea o ausente o mas); nombres, numeros, palabras inglesas y frases largas son los puntos debiles. El modelo femenino v0.2 es mas preciso.
- Una unica voz masculina sintetica, sin control de emocion ni estilo; algunas frases suenan ligeramente con acento estadounidense.
- Entrenado con un conjunto pequeno: unos 49 minutos de habla malaya sintetica generada por Chatterbox Multilingual y convertida dos veces (a femenina y luego a masculina), no habla humana nativa.
- Disenado para frases cortas; el texto largo se divide por finales de frase en los front ends.
- Es habla sintetica: el autor pide declararlo explicitamente cuando se use.
- Licencia: codigo y pesos Apache-2.0; `suaradee/lexicon_e.json` y `js/g2p/lexicon_e.json` derivan de datos de Wiktionary y son CC BY-SA 4.0, lo que impone condiciones de atribucion y comparticion para esos ficheros.
- Riesgo de alucinacion en TTS: no aplica como en modelos de texto, pero si existe riesgo de pronunciacion incorrecta de nombres, numeros y terminos extranjeros.
- Sesgos conocidos: no documentados en la informacion disponible; la voz procede de una referencia sintetica estadounidense, lo que puede introducir desviaciones de acento.
- Caveat de produccion: el paquete Python `suaradee` comparte nombre de importacion con el modelo femenino; el autor recomienda instalarlo en un entorno virtual propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/suaradee-michael-v0.1
- Modelo femenino Suaradee v0.2: https://huggingface.co/Suarify/suaradee-v0.2
- Modelo base Paradee-8M-v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Wheel Python: https://huggingface.co/Suarify/suaradee-michael-v0.1/resolve/main/dist/suaradee_michael-0.1.0-py3-none-any.whl
- Kokoro-82M (hexgrad): https://huggingface.co/hexgrad/Kokoro-82M
- Chatterbox Multilingual (Resemble AI): https://huggingface.co/ResembleAI/chatterbox
- Repositorio transformers.js: https://github.com/huggingface/transformers.js

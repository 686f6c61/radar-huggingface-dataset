# yuvidhepe/t3-voice-julia1

## Resumen

t3-voice-julia1 es un modelo de clasificación de texto especializado en la detección de comandos de voz para T3 Code, una aplicación de programación. Lo desarrolla yuvidhepe como parte del proyecto t3-voice, una capa de voz local para dicha aplicación. El modelo resuelve un problema acotado pero crítico en interfaces por voz: decidir si una frase corta pronunciada por el usuario constituye un comando para la aplicación o es simplemente conversación, evitando activaciones falsas.

Técnicamente se trata de un fine-tuning de SupersonicLabs/Julia-1, un encoder mmBERT-small de 144 millones de parámetros. El modelo no genera texto: formula preguntas de opción múltiple ("choice") sobre la frase de entrada y devuelve una puntuación por cada opción. Para cada turno evalúa 17 opciones (16 etiquetas de comando más una opción `none`) y, para cuatro de las etiquetas, lanza una segunda pregunta que identifica el argumento del comando.

Su relevancia radica en el enfoque de despliegue: se distribuye en formato ONNX fp32 (563 MB) con cabezas en NumPy, sin dependencia de PyTorch, y ofrece latencias de 42 ms p50 y 61 ms p95 en CPU con 8 hilos. Está pensado para ejecutarse localmente, detrás de un umbral de confianza muy alto (0.999814) calibrado para mantener las activaciones falsas en torno al 1-2 %. Solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-small), base SupersonicLabs/Julia-1 |
| Parámetros totales | 144.292.870 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32 (ONNX); no se documentan otras |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (encoder_fp32.onnx), safetensors (model.safetensors), cabezas en NPZ (heads.npz) |

## Arquitectura y entrenamiento

El modelo parte de Julia-1 (SupersonicLabs/Julia-1), un encoder mmBERT-small de 144M parámetros. Sobre ese encoder se añaden cabezas de clasificación que implementan un esquema de "pregunta de elección": el modelo recibe una pregunta con varias opciones de texto y produce una puntuación por opción. Para la tarea principal hay una pregunta con 17 opciones (16 comandos más `none`); para cuatro etiquetas (`change_model`, `change_effort`, `jump_chat`, `find_chat`) se añade una segunda pregunta que resuelve el argumento (7 modelos, 4 niveles de esfuerzo, 9 números de chat y hasta 5 títulos candidatos más `none`, respectivamente). No hay reglas léxicas; la única heurística externa es una puerta de longitud: un turno de más de 12 palabras nunca se considera comando.

El entrenamiento se realizó en tres bucles iterativos. Cada bucle consistió en construir datos, validación cruzada agrupada de 5 folds con búsqueda en rejilla sobre learning rate y épocas, selección del umbral a partir de la validación cruzada agrupada, comprobación en un conjunto de desarrollo, análisis de errores y generación de datos dirigidos, y finalmente un test único sobre un conjunto bloqueado nuevo. La configuración final fue: learning rate del encoder 5e-5, learning rate de las cabezas 2.5e-4, 4 épocas, batch size 64, weight decay 0.01, sin label smoothing, 50 % de barajado de opciones y sobremuestreo ×3 de las preguntas de argumento. El conjunto de entrenamiento total fue de 11.242 filas (7.141 en el bucle 0, 2.185 en el bucle 1 y 1.916 en el bucle 3), combinando texto limpio y transcripciones de voz a texto. Los datos son frases sintéticas escritas por modelos de lenguaje y a mano.

## Capacidades

- Clasificación de intención para comandos de voz cortos en inglés, con 16 etiquetas de comando más `none`.
- Detección de comandos de interfaz: `diff`, `terminal`, `sidebar`, `right_panel`, `model_picker`, `command_palette`, `next_chat`, `previous_chat`, `jump_chat`, `change_model`, `change_effort`, `find_chat`, `stop_run`, `settle_chat`, `yes`, `no`.
- Extracción de argumento para cuatro comandos: modelo (7 opciones), esfuerzo (4), número de chat (9) y título de chat (hasta 5 candidatos más `none`).
- Puntuación de opciones múltiples ("choice questions") con una probabilidad por opción.
- Puerta de longitud integrada: descarta como comando cualquier turno de más de 12 palabras.
- Inferencia en CPU sin PyTorch, mediante ONNX Runtime y NumPy.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio; es un clasificador de texto puro.

## Casos de uso

- Control por voz de una aplicación de programación: tras la transcripción de voz a texto, el modelo decide si la frase es un comando de interfaz (abrir terminal, cambiar de panel, detener una ejecución) y evita que frases conversacionales disparen acciones no deseadas.
- Cambio de modelo o de esfuerzo de razonamiento por voz: con las etiquetas `change_model` y `change_effort`, el modelo identifica el modelo destino (`claude-opus-4-1`, `gpt-5`, `gemini-2.5-pro`, etc.) o el nivel de esfuerzo (`low`, `medium`, `high`, `max`) dentro de la misma frase.
- Navegación entre conversaciones: `next_chat`, `previous_chat` y `jump_chat` (con argumento numérico de 1 a 9) permiten moverse entre chats sin tocar el teclado.
- Búsqueda de conversaciones por título: `find_chat` recibe la lista de títulos candidatos y selecciona el más probable, útil en interfaces con muchas conversaciones.
- Confirmaciones y cancelaciones por voz: las etiquetas `yes` y `no` permiten aceptar o rechazar acciones habladas, aunque con menor recall que el resto de comandos.
- Capa de voz local en el escritorio: al ejecutarse en ONNX sobre CPU con latencias de decenas de milisegundos, encaja en un pipeline local sin GPU ni servicios en la nube, reduciendo coste y preservando privacidad.
- Filtro previo en asistentes de voz: como clasificador de "es comando / no es comando" con umbral alto, puede colocarse delante de un motor de comandos más amplio para reducir activaciones falsas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto bloqueado `test_locked_v2` (427 turnos: 189 comandos, 238 no comandos), usado una sola vez:

| Entrada | Recall | Activaciones falsas en turnos no comando |
|---|---|---|
| Texto limpio | 92,1 % | 1,26 % (3 de 238) |
| Transcripciones de voz a texto | 91,0 % | 2,10 % |
| Texto limpio, sin `yes` ni `no` | 96,3 % | 0,8 % |
| Voz a texto, sin `yes` ni `no` | 94,5 % | 1,3 % |

El model-index oficial declara un recall de 0,9206 con umbral 0,999814 sobre `test_locked_v2` (texto limpio), marcado como no verificado. Cuando un comando se dispara, el argumento es correcto en todos los casos del conjunto limpio (`arg_given_command` = 1,0). En velocidad, sobre CPU con ONNX fp32 y 8 hilos (363 turnos): p50 de 42 ms y p95 de 61 ms para la pregunta de comando más una pregunta de argumento. El fichero ONNX ocupa 563 MB. La equivalencia con el modelo PyTorch se comprobó sobre 200 filas de `test_locked_v2`: diferencia máxima de probabilidad de 3e-6 en las 17 opciones, con las 200 decisiones y los 82 argumentos coincidentes.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en CPU con ONNX Runtime; no requiere GPU.
- Memoria: el fichero ONNX fp32 ocupa 563 MB; el repositorio completo, 1,2 GB (incluye también pesos safetensors y tokenizer).
- GPU: no se documentan requisitos de GPU; no es necesaria para el uso previsto.
- Despliegue: ONNX Runtime con NumPy y `tokenizers`; no requiere PyTorch. El script `t3_commands.py` del repositorio implementa la interfaz `CommandModel`.
- Latencia medida: p50 42 ms, p95 61 ms en CPU con 8 hilos para comando más una pregunta de argumento.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, el modelo se apoya en SupersonicLabs/Julia-1 (mmBERT-small, 144M parámetros), del que hereda la arquitectura; no se han publicado comparaciones con otros clasificadores de comandos de voz en la información disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t3-voice-julia1 | 144,3M | no disponible | Clasificación de comandos de voz (en) | apache-2.0 | Hugging Face (ONNX + safetensors) |
| SupersonicLabs/Julia-1 | no disponible | no disponible | Modelo base (encoder mmBERT-small) | no disponible | Hugging Face |
| Alternativas de clasificación de intención | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo inglés; no soporta otros idiomas.
- Los turnos de más de 12 palabras nunca se clasifican como comando, por diseño.
- Tasa de activación falsa de aproximadamente 1-2 % sobre negativos difíciles (por ejemplo, "you previously set the model to opus"); pueden producirse disparos incorrectos.
- Recall más bajo para respuestas desnudas del tipo "no", "nope" o "yeah", y para algunas frases de búsqueda de chat por tema.
- Entrenado con frases sintéticas generadas por modelos de lenguaje y escritas a mano; hablantes reales, acentos y ruido pueden comportarse de forma distinta.
- Los títulos de chat y la lista de modelos son los del conjunto de datos; otras listas requieren una nueva validación.
- No hay calibración más allá del umbral fijo (0.999814); si cambian los datos, debe revisarse el umbral.
- El umbral se seleccionó por validación cruzada agrupada a un 0,5 % de activaciones falsas, no sobre el conjunto de test.
- Uso previsto restringido a comandos de voz cortos en inglés tras voz a texto, detrás de un umbral de confianza y con posibilidad de deshacer la acción.
- Licencia apache-2.0: permite uso comercial, pero el modelo base Julia-1 debe verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuvidhepe/t3-voice-julia1
- Modelo base: https://huggingface.co/SupersonicLabs/Julia-1
- Dataset: https://huggingface.co/datasets/yuvidhepe/t3-voice-commands
- Repositorio del proyecto: https://github.com/Yuvraj-Dhepe/t3-voice
- Demo Space: https://huggingface.co/spaces/yuvidhepe/t3-voice-demo
- Curvas de entrenamiento (Trackio): https://huggingface.co/spaces/yuvidhepe/t3-voice-julia1-trackio_static

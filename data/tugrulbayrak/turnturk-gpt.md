# tugrulbayrak/TurnTurk-Gpt

## Resumen

TurnTurk-GPT es un modelo de predicción de turnos (turn-taking) para turco desarrollado por tugrulbayrak. Dadas las palabras de una conversación entre dos interlocutores, estima tras cada palabra la probabilidad de que el hablante actual haya terminado su turno, `P(<ts> | contexto)`. El modelo sigue la aproximación TurnGPT sobre el backbone turco `ytu-ce-cosmos/turkish-gpt2`, añadiendo al vocabulario un token de cambio de turno `<ts>` y dos tokens de hablante `<sp1>` y `<sp2>`, con entrenamiento mediante el objetivo de modelado causal del lenguaje.

Su relevancia radica en un problema muy concreto de los agentes de voz: decidir cuándo intervenir. En sistemas de diálogo hablado, un detector de actividad de voz (VAD) por sí solo no distingue una pausa del hablante del fin real de su turno; este modelo permite puntuar incrementalmente transcripciones en streaming y decidir cuándo responder. Se pre-entrenó sobre el dataset sintético Syn-TurnTurk y se ajustó con datos reales de Real-TurnTurk.

Con 124 millones de parámetros y una ventana de contexto de 256 tokens, es un modelo ligero, con licencia MIT, pensado para inferencia en CPU (unos 55 ms por palabra con KV cache en 2 núcleos), lo que lo hace viable para despliegue en pipelines de voz en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (`GPT2LMHeadModel`), enfoque TurnGPT |
| Parametros totales | 124.442.112 (~124M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un GPT-2 decoder causal basado en `ytu-ce-cosmos/turkish-gpt2`. Se amplió el vocabulario con tres tokens especiales: `<ts>` (fin de turno), `<sp1>` y `<sp2>` (marcadores de los dos hablantes). Los embeddings de estos tokens añadidos se inicializaron con la media de los embeddings existentes. El entrenamiento usa el objetivo de modelado causal del lenguaje estándar: la probabilidad de `<ts>` tras cada palabra constituye la señal de fin de turno. La entrada debe estar en minúsculas y sin puntuación, imitando la salida de un reconocedor de voz (ASR) en streaming.

El entrenamiento se realizó en dos etapas: primero un pre-entrenamiento sintético sobre Syn-TurnTurk (1.625 diálogos, 14.185 turnos) durante hasta 1.200 pasos con learning rate 5e-5; después un fine-tuning sobre Real-TurnTurk (6 conversaciones, 578 turnos, 15.531 palabras) durante hasta 400 pasos con learning rate 3e-5. La optimización empleó AdamW con weight decay 0.01, planificación lineal con 10 % de warm-up, clipping de gradientes a 1.0, precisión mixta y early stopping sobre ventanas reservadas. Las ventanas de entrenamiento de 256 tokens se solapan a la mitad.

## Capacidades

- Prediccion de fin de turno (end-of-turn detection): estima `P(<ts>)` tras cada palabra de una conversación de dos partes.
- Puntuacion incremental palabra a palabra de transcripciones en directo, compatible con ASR en streaming.
- Decision de respuesta combinada con un detector de actividad de voz (VAD) en silencios detectados.
- Tokenizacion de hablantes: distingue dos interlocutores mediante los tokens `<sp1>` y `<sp2>`.
- Modelo base para investigación en predicción de turnos en turco.

No soporta generación de texto general, razonamiento, código, matemáticas, visión, audio directo ni tool calling; es un modelo de clasificación/puntuación probabilística sobre transcripciones textuales.

## Casos de uso

- Deteccion de fin de turno en agentes de voz turcos: integrado tras un ASR en streaming, el modelo puntúa cada palabra recibida y señala cuándo el usuario ha terminado realmente su intervención, evitando interrupciones prematuras del asistente.
- Combinacion con VAD para latencia de respuesta: cuando el VAD detecta silencio, el modelo decide si ese silencio es una pausa o un fin de turno, reduciendo falsas respuestas en pausas naturales del habla.
- Transcripcion incremental en tiempo real: gracias a los ~55 ms por palabra con KV cache en CPU, puede puntuarse la transcripción en vivo sin GPU, adecuado para pipelines de voz en servidor ligero.
- Baseline de investigacion en turn-taking: sirve como punto de comparación para nuevos modelos de predicción de turnos en turco, con una metodología de evaluación documentada (leave-one-recording-out cross-validation).
- Sistemas de dialogo bilingues con modulo turco: puede incorporarse como componente especializado de detección de turno en plataformas conversacionales multilingües que incluyan turco.
- Analisis de corpus conversacionales: puntuación retrospectiva de transcripciones de diálogos turcos para estudios lingüísticos sobre dinámica de turnos.

## Benchmarks y rendimiento

Evaluación sobre Real-TurkTurk: cada palabra es un punto de decisión (15.522 puntos, 578 positivos; un predictor aleatorio obtiene AP 0.037). Resultados de leave-one-recording-out cross-validation promediados sobre tres semillas, con intervalos bootstrap del 95 % a nivel de grabación. Métrica principal: average precision (AP).

| Sistema | AP | IC 95 % | AUC | F1 |
|---|---|---|---|---|
| **TurnTurk-GPT** | **0.148** | [0.132, 0.167] | **0.783** | **0.219** |
| Zero-shot `turkish-gpt2`, P(newline) | 0.130 | [0.103, 0.154] | 0.787 | 0.195 |
| LiveKit multilingual turn detector | 0.100 | [0.081, 0.118] | 0.686 | 0.132 |
| Turn-length prior | 0.049 | [0.036, 0.064] | 0.572 | 0.089 |
| Random | 0.037 | [0.028, 0.051] | 0.500 | 0.0 |

Nota: los valores AP absolutos son bajos porque la tarea está muy desbalanceada (578 positivos frente a 15.522 puntos); el umbral de decisión recomendado es 0.127.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con 124M de parámetros en fp32 ocupa unos 0,5 GB, y puede ejecutarse sin GPU.
- GPU recomendadas: no necesaria para inferencia; para entrenamiento o fine-tuning bastaría una GPU de consumo (por ejemplo RTX 3060 o superior), aunque no se publican requisitos concretos.
- Consumer GPU: cabe sobradamente en cualquier GPU moderna; el caso de uso principal es CPU.
- Latencia: ~55 ms por palabra con KV cache en CPU de 2 núcleos, según la model card.
- Despliegue: compatible con la librería `transformers` de Hugging Face (pipeline `text-generation`); no disponible información sobre soporte en vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AP (Real-TurkTurk) | Licencia | Idioma |
|---|---|---|---|---|---|
| TurnTurk-GPT | 124M | 256 tokens | 0.148 | MIT | Turco |
| Zero-shot `turkish-gpt2` (P(newline)) | 124M | no disponible | 0.130 | no disponible | Turco |
| LiveKit turn-detector | no disponible | no disponible | 0.100 | no disponible | Multilingüe |

TurnTurk-GPT supera al detector multilingüe de LiveKit y al baseline zero-shot del propio backbone en AP y F1 sobre datos reales turcos, con la ventaja añadida de una licencia MIT permisiva.

## Limitaciones y advertencias

- Especializacion en turco: el modelo solo es válido para transcripciones en turco; no generaliza a otros idiomas.
- Formato de entrada estricto: exige texto en minúsculas y sin puntuación; una entrada con puntuación o mayúsculas degradará el rendimiento.
- Contexto corto: 256 tokens limitan la cantidad de historial conversacional utilizable.
- Datos de fine-tuning muy reducidos: el ajuste con datos reales se hizo sobre solo 6 conversaciones (578 turnos), lo que sugiere riesgo de sobreajuste y de varianza alta en dominios o hablantes no vistos.
- Desbalanceo extremo de la tarea: solo ~3,7 % de los puntos de decisión son positivos; los AP absolutos son bajos y el umbral (0.127) debe calibrarse según la aplicación.
- Alucinacion: no aplicable como tal, pero las probabilidades `P(<ts>)` pueden ser miscalibradas en dominios distintos del entrenamiento (por ejemplo, diálogos con más de dos hablantes).
- Uso comercial: la licencia MIT lo permite sin restricciones destacables.
- Adopcion temprana: con 224 descargas y 2 likes, es un modelo de nicho con poca validación comunitaria; conviene evaluarlo sobre datos propios antes de producción.

## Enlaces

- Modelo: https://huggingface.co/tugrulbayrak/TurnTurk-Gpt
- Backbone: https://huggingface.co/ytu-ce-cosmos/turkish-gpt2
- Dataset sintético (pre-entrenamiento): https://huggingface.co/datasets/tugrulbayrak/Syn-TurnTurk
- Dataset real (fine-tuning): https://huggingface.co/datasets/tugrulbayrak/Real-TurnTurk
- Modelo comparado (LiveKit turn detector): https://huggingface.co/livekit/turn-detector

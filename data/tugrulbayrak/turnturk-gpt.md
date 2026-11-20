# tugrulbayrak/TurnTurk-Gpt

## Resumen

TurnTurk-GPT es un modelo de predicción de turnos de conversación (turn-taking) para turco, desarrollado por el usuario de Hugging Face `tugrulbayrak`. No es un modelo generativo de propósito general: es un detector de fin de turno que, dado el texto de una conversación entre dos interlocutores, estima tras cada palabra la probabilidad de que el hablante actual haya terminado su intervención, es decir, `P(<ts> | contexto)`. Sigue el enfoque TurnGPT sobre el backbone GPT-2 turco `ytu-ce-cosmos/turkish-gpt2`, al que se añaden tres tokens especiales: `<ts>` (fin de turno) y `<sp1>`/`<sp2>` (hablantes).

El modelo resuelve un problema concreto en sistemas de voz conversacionales: decidir cuándo debe responder un agente. En lugar de depender únicamente de la detección de silencio (VAD), TurnTurk-GPT aporta una señal lingüística incremental que permite anticipar el final de turno palabra a palabra sobre transcripciones en streaming. Está pensado para integrarse en pipelines de ASR en turco, donde la entrada es texto en minúsculas y sin puntuación.

Con 124,4 millones de parámetros y una ventana de contexto de solo 256 tokens, es un modelo ligero y desplegable en CPU (unos 55 ms por palabra con KV cache en 2 núcleos). Se preentrenó sobre el dataset sintético Syn-TurnTurk y se ajustó finamente sobre el corpus real Real-TurnTurk, ambos publicados por el mismo autor. Su relevancia radica en cubrir una laguna específica: la predicción de turnos en turco, un idioma con relativamente pocos recursos en el ecosistema de agentes de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (`GPT2LMHeadModel`), transformer decoder causal |
| Parametros totales | 124.442.112 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TurnTurk-GPT es un transformer decoder de tipo GPT-2 con 124M de parámetros, inicializado desde `ytu-ce-cosmos/turkish-gpt2`. La innovación clave respecto al backbone es la ampliación del vocabulario con tres tokens: `<ts>` para marcar fin de turno y `<sp1>`/`<sp2>` para etiquetar al hablante. Los embeddings de estos tokens nuevos se inicializan con la media de los embeddings existentes. El modelo se entrena con el objetivo estándar de modelado de lenguaje causal, de modo que la probabilidad de `<ts>` tras cada palabra actúa como señal de fin de turno. La entrada esperada es texto en minúsculas y sin puntuación, alineado con la salida típica de un ASR en streaming.

El entrenamiento se realizó en dos fases. Primero, un preentrenamiento sobre Syn-TurnTurk (1.625 diálogos, 14.185 turnos) de hasta 1.200 pasos con learning rate 5e-5. Después, un ajuste fino sobre Real-TurnTurk (6 conversaciones, 578 turnos, 15.531 palabras) de hasta 400 pasos con learning rate 3e-5. La optimización emplea AdamW con weight decay 0,01, scheduler lineal con 10% de warm-up, clipping de gradiente a 1,0, precisión mixta y early stopping sobre ventanas reservadas. Las ventanas de entrenamiento son de 256 tokens con solapamiento del 50%. El modelo publicado está ajustado sobre las seis conversaciones reales completas.

## Capacidades

- Predicción incremental de fin de turno en turco: devuelve `P(<ts>)` tras cada palabra de una conversación de dos hablantes.
- Modelado de estructura de diálogo mediante los tokens de hablante `<sp1>` y `<sp2>`, que permiten distinguir quién habla en cada momento.
- Puntuación palabra a palabra sobre transcripciones en streaming, compatible con la salida de un ASR (minúsculas, sin puntuación).
- Integración con detectores de actividad de voz (VAD) para combinar señal acústica y lingüística en la decisión de responder.
- Uso como baseline de investigación para predicción de turnos en turco.
- No es un modelo generativo de propósito general: no está diseñado para responder preguntas, generar código ni mantener conversaciones por sí mismo.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso.
- Capacidad multilingüe limitada al turco.

## Casos de uso

- Detección de fin de turno en agentes de voz turcos: el modelo puntúa cada palabra de la transcripción del ASR y, cuando `P(<ts>)` supera el umbral recomendado de 0,127, el agente puede preparar su respuesta. Es adecuado porque opera en modo incremental y con baja latencia (unos 55 ms por palabra en CPU).
- Decisión de respuesta ante silencio combinada con VAD: en lugar de responder en cuanto se detecta un silencio, el sistema consulta a TurnTurk-GPT si el contexto lingüístico sugiere que el turno ha terminado, reduciendo interrupciones prematuras.
- Puntuación de transcripciones en vivo: el modelo puede consumir la salida de un ASR en streaming palabra a palabra con KV cache, manteniendo el estado de la conversación dentro de la ventana de 256 tokens.
- Investigación en predicción de turnos: sirve como baseline reproducible para comparar con detectores multilingües como el de LiveKit o con heurísticas de longitud de turno.
- Segmentación de diálogos grabados: sobre transcripciones ya existentes, las probabilidades de `<ts>` permiten detectar fronteras de turno para anotación o análisis posteriores.
- Prototipado en entornos con recursos limitados: al ser un modelo de 124M desplegable en CPU, encaja en pruebas de concepto de asistentes de voz sin GPU dedicada.
- Evaluación de calidad de ASR en turco: la coherencia de las predicciones de fin de turno puede usarse como señal indirecta de la calidad de la transcripción en conversaciones reales.

## Benchmarks y rendimiento

Los resultados provienen de validación cruzada dejando una grabación fuera (leave-one-recording-out), promediada sobre tres semillas, con intervalos bootstrap del 95% a nivel de grabación. La métrica principal es average precision (AP). En Real-TurnTurk hay 15.522 puntos de decisión, de los cuales 578 son positivos; un predictor aleatorio obtiene AP 0,037.

| Sistema | AP | IC 95% | AUC | F1 |
|---|---|---|---|---|
| TurnTurk-GPT | 0,148 | [0,132, 0,167] | 0,783 | 0,219 |
| `turkish-gpt2` zero-shot, P(newline) | 0,130 | [0,103, 0,154] | 0,787 | 0,195 |
| LiveKit multilingual turn detector | 0,100 | [0,081, 0,118] | 0,686 | 0,132 |
| Prior de longitud de turno | 0,049 | [no disponible en el extracto] | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en safetensors ocupa aproximadamente 0,5 GB (124M parámetros en fp32); en fp16 rondaría los 0,25 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU. Funciona en CPU con latencia de unos 55 ms por palabra con KV cache en 2 núcleos. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) reduce drásticamente esa latencia.
- Cabe en GPU consumer: sí, en todas las del mercado actual, e incluso en entornos sin GPU.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`). No se documentan integraciones específicas con vLLM, llama.cpp u Ollama.
- Latencia y throughput: ~55 ms por palabra en CPU con 2 núcleos y KV cache. El throughput en GPU no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | AP (turco) | Licencia |
|---|---|---|---|---|---|
| TurnTurk-GPT | 124M | 256 tokens | TurnGPT sobre GPT-2 turco, ajuste en datos reales | 0,148 | MIT |
| `turkish-gpt2` zero-shot (P(newline)) | ~124M | 256 tokens | Heurística zero-shot sobre el backbone | 0,130 | no disponible en la información |
| LiveKit multilingual turn detector | no disponible | no disponible | Detector multilingüe preentrenado | 0,100 | no disponible en la información |
| Prior de longitud de turno | no aplica | no aplica | Heurística estadística | 0,049 | no aplica |

## Limitaciones y advertencias

- El ajuste fino se realizó sobre un corpus muy pequeño: solo 6 conversaciones y 578 turnos. La generalización a dominios, acentos o estilos conversacionales distintos está por validar.
- El intervalo de confianza del AP es amplio ([0,132, 0,167]) y el F1 es bajo (0,219), lo que indica que la separación entre fin de turno y continuación no es nítida.
- La ventana de contexto es de solo 256 tokens, insuficiente para conversaciones largas sin truncar o deslizar la ventana.
- Está entrenado exclusivamente en turco y sobre texto en minúsculas sin puntuación; usarlo con texto puntuado o en mayúsculas puede degradar el rendimiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y negativos en la detección de fin de turno, con impacto directo en la experiencia del agente de voz.
- No se documentan análisis de sesgos demográficos o dialectales en el corpus de entrenamiento.
- La licencia MIT permite uso comercial, pero el modelo base `ytu-ce-cosmos/turkish-gpt2` tiene su propia licencia que conviene verificar antes de explotación comercial.
- El paper asociado (`arxiv:2610.42010`) figura en los metadatos, pero no se ha verificado su contenido en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tugrulbayrak/TurnTurk-Gpt
- Modelo base: https://huggingface.co/ytu-ce-cosmos/turkish-gpt2
- Dataset sintético: https://huggingface.co/datasets/tugrulbayrak/Syn-TurnTurk
- Dataset real: https://huggingface.co/datasets/tugrulbayrak/Real-TurnTurk
- Detector de turnos de LiveKit (comparativa): https://huggingface.co/livekit/turn-detector
- Paper referenciado en metadatos: arxiv:2610.42010 (no verificado)

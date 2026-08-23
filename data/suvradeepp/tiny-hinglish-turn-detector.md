# suvradeepp/tiny-hinglish-turn-detector

## Resumen

Tiny Hinglish Turn Detector es un clasificador de audio nativo que distingue entre dos estados en un punto de pausa de una conversación de voz: `HOLD` (el hablante aún no ha terminado, responder interrumpiría) y `END` (el agente de voz puede responder). Lo desarrolla suvradeepp y está diseñado para ejecutarse en los checkpoints de pausa que genera un sistema de detección de actividad de voz (VAD), como un componente más de un controlador de voz conversacional.

El modelo es una red neuronal convolucional causal (TinyTCN) con convoluciones depthwise-separable, entrenada desde cero y empaquetada en formato ONNX. Con solo 151.812 parámetros y un tamaño de archivo de 611 KiB, es extremadamente ligero y pensado para inferencia de baja latencia en entornos de producción. Se ha entrenado sobre un fragmento del dataset `pipecat-ai/smart-turn-data-v3.2-train`, con datos de audio de 16 kHz y una ventana de contexto de 4 segundos.

Su relevancia actual radica en que aborda un problema crítico en sistemas de voz IA: la detección de fin de turno. A diferencia de los enfoques basados en transcripción de texto, este modelo trabaja directamente sobre la señal acústica, lo que puede reducir la latencia y evitar errores derivados de la transcripción. Sin embargo, el propio autor lo marca como un *development preview*: no es el modelo ganador local (un baseline logístico acústico rinde mejor en el split de desarrollo actual) y no ha sido evaluado en un test oficial ni en grabaciones Hinglish verificadas. Por tanto, no debe presentarse como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TCN causal depthwise-separable (TinyTCN) |
| Parametros totales | 151.812 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4 segundos de audio (mono, 16 kHz) |
| Tipos de cuantizacion | FP32 ONNX (no se proporcionan cuantizaciones) |
| Idiomas soportados | Hindi (hi), inglés (en) y diseñado para Hinglish (mezcla) |
| Licencia | Código: Apache-2.0; pesos: sin licencia otorgada (pendiente revisión de derechos) |
| Formato de pesos | ONNX Runtime (FP32, batch 1, eje de trama dinámico) |

## Arquitectura y entrenamiento

La red es una TCN (Temporal Convolutional Network) causal con bloques de convolución depthwise-separable residuales. Consta de una proyección de entrada de 1×1, seis bloques residuales con canales de 128 y dilaciones `[1, 2, 4, 8, 16, 32]`, seguidos de un pooling atento de media y desviación estándar (mask-aware attentive pooling) y una cabeza de clasificación de 96 unidades. Las convoluciones son causales, pero el pooling atento resume el sufijo de audio suministrado, por lo que el modelo actúa como clasificador de clips en puntos de pausa, no como red de streaming con estado.

Las características de entrada son 80 filtros log-mel estilo HTK (ventana de 25 ms, paso de 10 ms) con escala logarítmica similar a Whisper. La salida es un escalar `p(END)` que se compara con un umbral congelado de `0.7410007715`. Las cabezas de relleno (`midfiller` y `endfiller`) son solo de entrenamiento.

El entrenamiento se realizó sobre un único shard (el número 00010 de 83) del dataset `pipecat-ai/smart-turn-data-v3.2-train` en revisión `e564e2ac567f774d1880aa1db6ce97afb8c519b7`. Ese shard contiene 3.265 filas válidas, equivalentes a 6.857 horas de audio, con 1.667 etiquetas `HOLD` y 1.598 `END`. De ellas, 2.712 son sintéticas y 553 son de etiquetado humano. El dataset incluye 23 etiquetas de idioma, con 158 filas en hindi y 758 en inglés. No se reporta el uso de RLHF ni DPO; es un entrenamiento supervisado estándar. El autor advierte que el split de entrenamiento es *row-disjoint* pero no *speaker-disjoint* (no hay identidad de hablante en los datos), y que el split de validación contiene solo inglés y español, lo que constituye un cambio de dominio deliberadamente duro.

## Capacidades

- Clasificación de audio en punto de pausa: distingue entre `HOLD` (el hablante sigue) y `END` (el hablante ha terminado).
- Procesamiento de audio nativo: no requiere transcripción de texto, opera directamente sobre la señal de audio de 16 kHz.
- Ventana de contexto de 4 segundos, suficiente para capturar el sufijo reciente de la conversación.
- Ligereza extrema: 151.812 parámetros y 611 KiB en ONNX, lo que permite inferencia en CPU o incluso en navegador (ONNX Runtime Web).
- No soporta tool calling, generación de texto, visión ni otras modalidades. Es un modelo de clasificación de audio de propósito específico.

## Casos de uso

- **Agentes de voz de atención al cliente**: integrado en un sistema de voz para decidir cuándo el usuario ha terminado de hablar y el agente puede responder. Por su naturaleza ligera, puede ejecutarse en el mismo dispositivo que el VAD, reduciendo latencia.
- **Asistentes de voz en logística y soporte en India**: el modelo está diseñado para el habla india, incluyendo Hinglish, fillers, autocorrecciones y pausas naturales. Puede integrarse en sistemas de voz para almacén o transporte.
- **Sistemas de voz en tiempo real con recursos limitados**: al ser tan pequeño, puede desplegarse en CPUs de bajo coste o en edge devices sin necesidad de GPU.
- **Prototipos de investigación en detección de fin de turno**: como herramienta de estudio para comparar enfoques acústicos vs. basados en texto en entornos multilingües.
- **Demostraciones en navegador**: el autor ha publicado un espacio de Hugging Face que ejecuta el modelo en el navegador con `onnxruntime-web`, permitiendo probar la detección de fin de turno sin subir audio a un servidor.
- **Componente en un controlador de voz de múltiples señales**: el modelo puede usarse como una señal más en un controlador que combine VAD, umbrales de silencio mínimo, y políticas de confirmación y timeout, tal como se describe en el README.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica que un baseline logístico acústico de diez características supera al modelo en el split de desarrollo IID actual, y que no se ha evaluado en el test oficial ni en grabaciones Hinglish verificadas. Por tanto, no hay números de MMLU, HumanEval, GSM8K ni métricas de exactitud, precisión o recall sobre el modelo en la documentación.

## Requisitos de hardware

- El modelo es extremadamente ligero: 151.812 parámetros y 611 KiB en formato ONNX FP32. No requiere GPU para inferencia.
- Puede ejecutarse en CPU en tiempo real con baja latencia. No se especifican requisitos de VRAM porque no se necesita GPU.
- Es compatible con `onnxruntime` (CPU) y con `onnxruntime-web` (navegador). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- La latencia estimada no se proporciona, pero dado el tamaño del modelo y la ventana de 4 segundos, es previsible que sea inferior a 10 ms en CPU moderna (estimación no verificada).

## Comparativa con modelos similares

No se dispone de una comparativa directa con datos de rendimiento, pero se pueden comparar características con otros modelos de detección de fin de turno:

| Modelo | Arquitectura | Entrada | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiny Hinglish Turn Detector (este) | TinyTCN causal (audio) | audio 16 kHz, 4 s | 151.812 | Código Apache-2.0, pesos sin licencia | Hugging Face |
| LiveKit Turn Detector v1 | Basado en Qwen2.5-0.5B-Instruct (texto) | Transcripción de texto | ~500M | Apache-2.0 (según repo de LiveKit) | Hugging Face |
| Whisper-Tiny Dual-Scale Attention (GitHub) | Whisper Tiny + head de atención dual | audio | ~39M | no especificado | GitHub |

Diferencias clave: el modelo de LiveKit usa texto, por lo que depende de un ASR previo; el de Whisper-Tiny es más grande y se enfoca en Hindi/Hinglish/Indian English; el de este modelo es el más ligero y no requiere transcripción. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Estado de desarrollo**: es un *development preview* entrenado en un único shard del dataset. No es el modelo ganador local (un baseline logístico lo supera) y no ha sido evaluado en el test oficial ni en grabaciones Hinglish verificadas.
- **Riesgo de alucinación**: al ser un clasificador de audio, no genera texto, pero puede producir falsos positivos (decidir `END` cuando el hablante sigue) o falsos negativos, con impacto en la interacción de voz.
- **Sesgos**: los datos de entrenamiento son mayoritariamente sintéticos (2.712 de 3.265) y el split de validación no es speaker-disjoint. La etiqueta de idioma (Hindi/English) no garantiza que el audio sea realmente Hinglish.
- **Restricciones de licencia**: los pesos no tienen una licencia clara, solo el código es Apache-2.0. No se puede usar comercialmente sin una revisión de derechos.
- **Restricciones de uso**: el modelo está prohibido para identificación de hablante, inferencia de acento/emoción/salud/demografía, vigilancia, puntuación de empleados o clientes, o decisiones legales, de crédito, laborales, médicas u otras consecuentes.
- **No es un sistema autónomo**: debe usarse dentro de un controlador que gestione mínimos de silencio, confirmación, y tiempos de espera máximos. No debe usarse para tomar decisiones de turno sin un monitor de seguridad.
- **Limitaciones de contexto**: la ventana de 4 segundos es fija; si la pausa del hablante excede ese tiempo, el modelo no tiene información del contexto anterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suvradeepp/tiny-hinglish-turn-detector
- Dataset de entrenamiento: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train
- Demo en navegador (Hugging Face Space): https://huggingface.co/spaces/lostinthesky/hinglish-turn-detector
- Blog de LiveKit sobre detección de fin de turno: https://livekit.com/blog/solving-end-of-turn-detection
- Repo de LiveKit turn-detector: https://huggingface.co/livekit/turn-detector
- Modelo alternativo Whisper-Tiny Dual-Scale (GitHub): https://github.com/Mayankpratapsingh022/Turn-Detection-Model-Whisper-Tiny-Dual-Scale-Attention-Classification-Head-for-Low-Latency-Voice-AI

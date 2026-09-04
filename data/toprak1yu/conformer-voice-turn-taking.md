# Toprak1yu/conformer-voice-turn-taking

## Resumen
El modelo `Toprak1yu/conformer-voice-turn-taking` es un clasificador acústico ligero desarrollado por el usuario Toprak1yu, basado en una arquitectura Conformer y diseñado para la detección de turnos de conversación y de interrupciones (barge-in) en agentes conversacionales de voz. Con aproximadamente 2,1 millones de parámetros, su objetivo es resolver los problemas de los sistemas tradicionales de detección de actividad de voz (VAD), que dependen de timeouts de silencio arbitrarios de entre 500 y 800 ms y provocan pausas incómodas o interrupciones no deseadas. El modelo analiza una ventana deslizante de 1,5 segundos de audio mono PCM a 16 kHz, evaluando la prosodia, el contorno de tono y la dinámica del habla para clasificar la intención conversacional en tiempo real. Es relevante ahora porque ofrece una alternativa de baja latencia (menos de 15 ms en CPU con ONNX Runtime) para integrar en sistemas de voz en tiempo real, como asistentes, robots de voz y pipelines de turn-taking.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer-based EncDecClassificationModel (~2,1 millones de parámetros) |
| Parámetros totales | ~2,1 millones |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de audio; ventana de 1,5 s) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (`turn_taking_final.onnx`), NeMo checkpoint (`turn_taking_final.nemo`), configuración YAML (`turn_taking_model.yaml`) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura Conformer, un tipo de red neuronal que combina capas de atención con capas convolucionales para capturar tanto dependencias globales como locales en señales de audio. En concreto, se trata de un modelo `EncDecClassificationModel` de NVIDIA NeMo, con un codificador y un decodificador de clasificación. La entrada es audio mono PCM de 16 kHz, y el modelo procesa ventanas deslizantes de 1,5 segundos (24.000 muestras) con un paso de 200 ms (3.200 muestras). El entrenamiento se realizó con el dataset `openslr/librispeech_asr`, un corpus de voz en inglés. No se mencionan técnicas de ajuste como RLHF o DPO, ya que se trata de un clasificador acústico supervisado. La innovación principal radica en evaluar la prosodia y la dinámica del habla para clasificar tres estados conversacionales —`complete`, `incomplete` y `barge_in`— en lugar de depender de umbrales de silencio arbitrarios.

## Capacidades
- Clasificación en tiempo real de tres estados conversacionales: `complete` (el hablante ha terminado su turno), `incomplete` (pausa de pensamiento o hesitación) y `barge_in` (interrupción del usuario mientras el agente habla).
- Detección de fin de turno basada en prosodia, contorno de tono y dinámica del habla, no en timeouts de silencio fijos.
- Detección de interrupciones (barge-in) para que el agente detenga la reproducción de audio y ceda el turno al usuario.
- Baja latencia de inferencia: menos de 15 ms en CPUs de gama de consumo mediante ONNX Runtime.
- Soporte de despliegue con ONNX Runtime para producción, así como checkpoint de NeMo para PyTorch.
- No es un modelo generativo: no soporta generación de texto, tool calling, razonamiento multi-step ni visión.

## Casos de uso
- Asistentes de voz en tiempo real: el modelo permite que el asistente sepa cuándo el usuario ha terminado de hablar (clase `complete`) para responder de inmediato, evitando las pausas incómodas de los sistemas VAD basados en silencio.
- Atención al cliente telefónica automatizada: un bot puede usar la clase `incomplete` para no interrumpir al cliente mientras piensa, y la clase `complete` para iniciar su respuesta.
- Sistemas de dictado por voz: la detección de `incomplete` evita que el sistema procese frases a medias durante las pausas naturales del hablante.
- Robots de voz en interacción humano-robot: la clase `barge_in` permite al robot detener su propia locución cuando el humano interrumpe, mejorando la naturalidad de la interacción.
- Detección de barge-in en sistemas de audio interactivos: se puede integrar en pipelines de reproducción de audio para que, en cuanto se detecte una interrupción, el sistema corte la salida y ceda el turno.
- Pipelines de VAD avanzados en agentes conversacionales: el modelo puede sustituir o complementar un VAD tradicional, añadiendo información semántica de turno y reduciendo los falsos inicios de respuesta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no se especifican; el modelo está orientado a ejecutarse en CPU mediante ONNX Runtime, con una latencia declarada inferior a 15 ms.
- Compatibilidad con GPUs de consumo: no se especifica explícitamente, pero al ser un modelo de ~2,1 millones de parámetros, es trivialmente ligero para cualquier GPU moderna.
- Opciones de despliegue: ONNX Runtime y NVIDIA NeMo (PyTorch). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: latencia de inferencia declarada inferior a 15 ms en CPUs de gama de consumo usando ONNX Runtime. No hay datos de throughput.

## Comparativa con modelos similares
No disponible. En la búsqueda web se mencionan modelos de turn-taking como TurnGPT y Voice Activity Projection (VAP), pero no se dispone de datos suficientes para una comparación rigurosa con este modelo.

## Limitaciones y advertencias
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica, ya que es un clasificador acústico, no un modelo generativo.
- Limitaciones de idioma: el modelo solo está entrenado para inglés (etiqueta `en`), y el dataset utilizado es LibriSpeech, por lo que puede no generalizar bien a otros idiomas, acentos o variantes dialectales.
- Limitaciones de contexto: el modelo analiza ventanas de 1,5 segundos con un paso de 200 ms; no tiene acceso a contextos conversacionales más amplios (por ejemplo, el historial de la conversación), lo que puede afectar a la precisión en diálogos complejos.
- Advertencias para producción: no se han publicado resultados de benchmarks ni evaluaciones de rendimiento en condiciones reales. La precisión puede degradarse en entornos con ruido de fondo, habla superpuesta o condiciones acústicas adversas.
- Licencia: la licencia MIT permite uso comercial sin restricciones, pero el usuario debe validar el modelo en su caso de uso específico.

## Enlaces
- HuggingFace: https://huggingface.co/Toprak1yu/conformer-voice-turn-taking
- Paper sobre turn-taking en interacción humano-robot (contexto): https://arxiv.org/html/2501.08946v1
- Revisión sobre modelado de turn-taking en sistemas conversacionales (contexto): https://www.mdpi.com/2227-7080/13/12/591

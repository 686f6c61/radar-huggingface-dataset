# Trelis/duplex-1-1.2b

## Resumen

duplex-1-1.2b es un modelo de investigación de speech-to-speech full-duplex desarrollado por Trelis, entrenado sobre conversaciones en inglés. El modelo procesa simultáneamente dos pistas de audio (un hablante por pista) junto con dos pistas de texto, lo que le permite generar los turnos de ambos interlocutores de forma conjunta en lugar de alternar entre reconocimiento y síntesis. Con 1.200 millones de parámetros, es la variante grande de la familia duplex-1, que comparte arquitectura y datos con el modelo duplex-1-200m.

La relevancia del modelo reside en su enfoque de modelado conversacional nativo: en lugar de encadenar ASR, un LLM de texto y TTS, duplex-1 predice directamente tokens de audio Mimi y tokens de texto para cada hablante, lo que facilita el solapamiento de turnos y el turn-taking frecuente. Está pensado como base de investigación para diálogo hablado, no como producto listo para producción.

El checkpoint publicado corresponde a la etapa final conversacional, tras un preentrenamiento sobre aproximadamente 10.747 horas de habla inglesa y un ajuste conversacional sobre 2.502 horas de podcasts de dos hablantes. La licencia es Apache 2.0 y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer temporal de 24 capas y anchura 1.792, con decodificador de profundidad de 2 capas y anchura 256; audio tokenizado con Mimi (8 codebooks a 12,5 fps) y una pista de texto por hablante |
| Parametros totales | 1.200 millones (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB y el checkpoint final enlazado es privado) |

## Arquitectura y entrenamiento

El modelo emplea un transformer temporal de 24 capas con anchura 1.792, frente a las 12 capas y anchura 768 del duplex-1-200m. Mantiene un decodificador de profundidad de dos capas y anchura 256. La entrada y la salida de audio se representan con ocho codebooks Mimi a 12,5 fotogramas por segundo por cada pista de hablante, y se añade una pista de texto por hablante. El formato es de dos hablantes simultáneos, lo que permite modelar solapamientos y cambios de turno sin una máquina de estados externa.

El entrenamiento se dividió en dos etapas. El preentrenamiento constó de 142.184 pasos sobre aproximadamente 10.747 horas de habla inglesa, principalmente de YODAS3 y de episodios de podcast obtenidos de fuentes RSS públicas, con transcripciones generadas automáticamente. La etapa conversacional final añadió 5.045 pasos sobre 2.502 horas de podcasts de dos hablantes con turn-taking frecuente, prácticamente una pasada sobre el split de 2.534 horas; todos los clips de esta etapa ya estaban presentes en el preentrenamiento. Contando repeticiones, ambos modelos vieron unas 72.663 horas de audio de preentrenamiento y 2.501 horas de audio conversacional. No se documenta RLHF ni DPO.

## Capacidades

- Generación de habla full-duplex para dos hablantes simultáneos, con pistas de audio y texto independientes por interlocutor.
- Modelado de turn-taking frecuente y solapamiento de turnos en conversaciones de podcast.
- Predicción conjunta de tokens de audio Mimi y tokens de texto, sin pipeline separado de ASR y TTS.
- Continuación de conversaciones a partir de una apertura de audio y texto dada en ambas pistas.
- Generación condicionada por semilla, temperatura y top-k (los ejemplos publicados usan semilla 1, temperatura 1 y top-k 250).
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Modo thinking, visión o audio de entrada más allá del formato duplex: no disponible.

## Casos de uso

- Investigación en diálogo hablado full-duplex: sirve como base para estudiar turn-taking, solapamiento y coherencia conversacional sin depender de pipelines ASR-LLM-TTS encadenados.
- Generación de continuaciones de podcast para evaluación subjetiva: el modelo puede continuar una apertura de dos hablantes y compararse con la grabación real, como hacen los ejemplos publicados.
- Estudio de representaciones de audio con Mimi: al operar sobre ocho codebooks a 12,5 fps, permite analizar la contribución de cada codebook a la pérdida de audio.
- Prototipado de agentes de voz conversacionales en inglés: la arquitectura duplex facilita experimentar con respuestas solapadas antes de invertir en un sistema de producción.
- Evaluación de técnicas de annealing conversacional: la comparación entre duplex-1-200m y duplex-1-1.2b permite medir el efecto del tamaño y del momento de inicio del annealing (paso 100 frente a paso 4.033).
- Generación de datos sintéticos de conversación para aumentar corpus de entrenamiento de otros sistemas de voz, siempre que se validen la calidad y los sesgos.
- Docencia y divulgación sobre modelos speech-to-speech: el tamaño de 1,2B y la licencia Apache 2.0 facilitan su uso en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta métricas de pérdida de audio sobre podcasts conversacionales reservados (`conversational@v1`):

| Métrica | duplex-1-1.2b | duplex-1-200m |
|---|---|---|
| Pérdida de audio, todos los codebooks (bits/s) | 693,67 | 707,75 |
| Pérdida del primer codebook (bits/s) | 57,45 | 58,09 |
| Horas H100 estimadas en preentrenamiento | 26,12 | no disponible (cálculo incompleto) |
| Horas H100 estimadas en etapa conversacional | 0,92 | 0,37 |

Menor pérdida es mejor. No se proporcionan métricas de inteligibilidad, MOS ni evaluaciones humanas más allá de las muestras de audio cualitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 1,2B parámetros, una estimación orientativa en FP16 sería de unos 2,4 GB solo de pesos, más el coste del decodificador Mimi y del contexto, pero el dato no está confirmado por el autor.
- GPU recomendadas: no disponible; el autor solo reporta horas de entrenamiento en H100 (26,12 horas de preentrenamiento y 0,92 de etapa conversacional).
- Compatibilidad con GPU de consumo: no disponible; por tamaño cabría en GPUs consumer con VRAM suficiente, pero no se documenta soporte ni cuantizaciones.
- Opciones de despliegue: no disponible; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el checkpoint final está enlazado como privado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pérdida de audio (bits/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| duplex-1-1.2b | 1,2B | no disponible | 693,67 | Apache 2.0 | Repositorio público; checkpoint final privado |
| duplex-1-200m | 200M | no disponible | 707,75 | no disponible en la información | Público |
| duplex-0-200m | 200M | no disponible | no disponible | no disponible en la información | Público |

No se dispone de comparación con otros modelos speech-to-speech full-duplex de la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo describe explícitamente como research model, no como producto listo para producción.
- Solo inglés: no se declara soporte de otros idiomas.
- El checkpoint final enlazado en la model card figura como privado, y el repositorio aparece con 0.0 GB, por lo que la disponibilidad real de los pesos no está garantizada.
- Datos de entrenamiento basados en YODAS3 y podcasts de RSS públicos con transcripciones generadas automáticamente, lo que puede introducir errores y sesgos presentes en esas fuentes.
- Riesgo de alucinación y de contenido incoherente en generaciones largas; los ejemplos publicados usan temperatura 1 y top-k 250, configuraciones que favorecen la diversidad sobre la fidelidad.
- La etapa conversacional se entrenó sobre clips ya vistos en el preentrenamiento, lo que puede inflar la calidad aparente en dominios cercanos a los podcasts.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- Licencia Apache 2.0 permite uso comercial, pero la falta de pesos verificables y de documentación de despliegue limita su uso en producción.
- No se especifican longitud de contexto ni requisitos de hardware, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Trelis/duplex-1-1.2b
- Modelo duplex-1-200m: https://huggingface.co/Trelis/duplex-1-200m
- Modelo duplex-0: https://huggingface.co/Trelis/duplex-0
- Dataset de preentrenamiento YODAS3: https://huggingface.co/datasets/Trelis/duplex-pre-training-yodas3-mimi-v2
- Dataset de preentrenamiento de podcasts: https://huggingface.co/datasets/Trelis/duplex-pre-training-podcasts-mimi-v2
- Dataset conversacional de podcasts: https://huggingface.co/datasets/Trelis/duplex-conversational-podcasts-mimi-v2
- Checkpoint conversacional final (privado): https://huggingface.co/Trelis/duplex-1b-speedrun-private/tree/248fc609cce80402b58b01665d261f5aa2e2e5d7/long-conversational
- Muestras de audio: https://huggingface.co/Trelis/duplex-1-1.2b/tree/main/samples

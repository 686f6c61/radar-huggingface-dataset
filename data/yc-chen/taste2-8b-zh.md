# YC-Chen/TASTE2-8B-ZH

## Resumen

TASTE2-8B-ZH es un modelo de lenguaje hablado (spoken language model) desarrollado por MediaTek Research y la Universidad Nacional de Taiwán dentro del proyecto TASTE2, cuyo objetivo es lograr interacción de voz full-duplex: procesar el habla del usuario mientras llega, decidir cuándo tomar o ceder el turno y detenerse si el usuario interrumpe. A diferencia de los sistemas de texto a voz convencionales que operan por turnos completos, TASTE2 alinea un latente de audio continuo con cada token de texto, preservando la longitud de la secuencia y permitiendo un procesamiento incremental.

El modelo se compone de tres módulos: un tokenizador de voz, un modelo de lenguaje hablado (basado en Qwen2-7B) y un detokenizador incremental basado en CosyVoice2. Este checkpoint concreto es la versión base para chino, entrenada en dos etapas (stage-1 y stage-2) pero sin fine-tuning de instrucciones ni de diálogo. Su relevancia radica en que aborda un problema poco resuelto en la interacción por voz: la capacidad de interrumpir y reanudar la síntesis en tiempo real, manteniendo la competencia lingüística del modelo subyacente y las señales paralingüísticas del audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de tres componentes: tokenizador de voz, modelo de lenguaje hablado (backbone Qwen2-7B) y detokenizador incremental (CosyVoice2) |
| Parametros totales | 8B (según nombre del checkpoint; el backbone es Qwen2-7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado por el autor; se distribuyen pesos en safetensors, ONNX y PyTorch (.pt) |
| Idiomas soportados | Chino (zh) |
| Licencia | taste2-research-only (uso académico e investigación únicamente) |
| Formato de pesos | safetensors, ONNX, PyTorch (.pt) |

## Arquitectura y entrenamiento

TASTE2 introduce una arquitectura de pila incremental para diálogo por voz compuesta por tres elementos: un tokenizador de voz que convierte el audio en latentes continuos, un modelo de lenguaje hablado (Spoken LM) que predice un latente de audio por cada token de texto, y un detokenizador incremental que sintetiza el habla en streaming mediante CosyVoice2. La clave está en compartir un vocabulario de tokens de texto entre las modalidades, lo que elimina la necesidad de segmentación por palabras o dependiente del idioma y evita intercalar flujos de tokens heterogéneos. El entrenamiento se realiza en dos etapas (stage-1 y stage-2) con configuraciones YAML incluidas en el repositorio, aunque no se detallan el número de tokens ni la composición exacta del dataset. El modelo se construye sobre Qwen2-7B y CosyVoice2, que conservan sus respectivas licencias aguas arriba.

## Capacidades

- Síntesis de voz en chino a partir de texto, con generación de audio continuo alineado token a token.
- Procesamiento incremental del habla: puede empezar a generar audio antes de recibir la frase completa del usuario.
- Soporte de interrupción (barge-in): el sistema detiene la síntesis cuando el usuario interviene durante la reproducción.
- Diálogo hablado full-duplex: capaz de gestionar turnos de conversación en tiempo real, aunque este checkpoint base no está fine-tuneado para seguir instrucciones ni para diálogo conversacional.
- Preservación de señales paralingüísticas (entonación, ritmo, énfasis) gracias al alineamiento con latentes de audio.
- Integración con el sistema TASTE2 VoiceBot, que demuestra el funcionamiento completo en un entorno de investigación.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede gestionar conversaciones donde el usuario interrumpe o cambia de tema sin esperar a que termine la respuesta, gracias a su capacidad de detección de barge-in y procesamiento incremental.
- Sistemas de atención al cliente por teléfono: al operar full-duplex, puede escuchar y responder simultáneamente, reduciendo la latencia percibida y permitiendo que el cliente interrumpa para aclarar dudas.
- Lectura de noticias o narración en streaming: la síntesis incremental permite comenzar a reproducir audio mientras se genera el siguiente segmento, ideal para aplicaciones de audio continuo.
- Investigación en interacción humano-máquina: al ser un modelo base, sirve como punto de partida para experimentos sobre diálogo hablado, paralingüística y control de turnos en entornos académicos.
- Prototipos de agentes de voz para dispositivos IoT: su capacidad de detener la generación al detectar interrupciones lo hace adecuado para interfaces de voz en entornos ruidosos o con múltiples hablantes.
- Desarrollo de sistemas de subtitulado o doblaje en tiempo real: la alineación token a token entre texto y audio permite sincronizar la salida de voz con texto generado dinámicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas como MMLU, HumanEval o evaluaciones específicas de síntesis de voz (MOS, WER, etc.).

## Requisitos de hardware

- VRAM estimada: no especificada por el autor. Dado que el repositorio ocupa 61,3 GB e incluye un modelo de 8B en fp16 (aproximadamente 16 GB solo para los pesos del LM) más los componentes de tokenizador y detokenizador, se recomienda una GPU con al menos 24 GB de VRAM para inferencia en fp16.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o superiores. No se indica compatibilidad con GPUs de consumo de menor VRAM.
- Opciones de despliegue: el autor proporciona código en los repositorios TASTE-SpokenLM-2 y TASTE-Voice-Bot. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI; la inferencia se realiza mediante scripts propios que cargan los pesos .pt y ONNX.
- Latencia y throughput: no disponibles. El diseño incremental sugiere baja latencia de primera respuesta, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de lenguaje hablado full-duplex o sistemas de texto a voz. El modelo se basa en Qwen2-7B y CosyVoice2, por lo que podría compararse indirectamente con esos componentes, pero no hay datos de rendimiento relativos en la información proporcionada.

## Limitaciones y advertencias

- Licencia restringida: uso exclusivamente académico y de investigación (taste2-research-only). No está permitido el uso comercial sin autorización expresa de MediaTek Research y la Universidad Nacional de Taiwán.
- No es un modelo instruido: este checkpoint base no ha sido fine-tuneado para seguir instrucciones ni para diálogo conversacional; para esos casos hay que usar las variantes Instruct de la colección TASTE2.
- Solo chino: no soporta otros idiomas en esta versión.
- Riesgo de alucinación en audio: al ser un modelo generativo, puede producir contenido hablado inexacto o inventado, especialmente en contextos abiertos.
- Dependencia de componentes externos: el detokenizador CosyVoice2 y el backbone Qwen2-7B tienen sus propias licencias y limitaciones que deben revisarse por separado.
- Requisitos de hardware elevados: el tamaño del repositorio (61,3 GB) y la necesidad de cargar múltiples modelos (LM, tokenizador, detokenizador) dificultan su despliegue en entornos con recursos limitados.
- Sin garantía de soporte: al ser un proyecto de investigación, no hay mantenimiento oficial ni soporte para producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/YC-Chen/TASTE2-8B-ZH)
- [Colección de checkpoints TASTE2](https://huggingface.co/collections/YC-Chen/taste2)
- [Página del proyecto](https://gitycc.github.io/TASTE2-Homepage/)
- [Paper TASTE2 (PDF)](https://gitycc.github.io/TASTE2-Homepage/assets/taste2-paper.pdf)
- [Código Spoken LM](https://github.com/GitYCC/TASTE-SpokenLM-2)
- [Código VoiceBot](https://github.com/GitYCC/TASTE-Voice-Bot)
- [Dataset paralinguistic_dialogues](https://huggingface.co/datasets/wilzzzz/paralinguistic_dialogues)

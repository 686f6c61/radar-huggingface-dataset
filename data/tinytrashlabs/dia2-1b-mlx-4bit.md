# tinytrashlabs/dia2-1b-mlx-4bit

## Resumen

Dia2-1B-MLX-4bit es una conversión al framework MLX en precisión 4-bit del modelo Dia2-1B de Nari Labs, un sistema de síntesis de voz (TTS) diseñado específicamente para diálogos conversacionales entre dos hablantes. El modelo original, Dia2, es capaz de generar audio de forma streaming, es decir, comienza a producir voz con las primeras palabras del texto sin necesidad de recibir la entrada completa, lo que permite conversaciones en tiempo real con latencia mínima. Esta conversión, realizada por TinyTrashLabs, adapta el checkpoint de 1.076 millones de parámetros al ecosistema MLX de Apple, facilitando su ejecución en hardware con silicio de Apple (M1 y posteriores) mediante la librería MLX.

La relevancia de este modelo radica en que acerca la síntesis de voz conversacional de alta calidad a entornos locales y de bajo coste, sin depender de APIs en la nube. El audio se decodifica mediante el codec Mimi de Kyutai a una frecuencia de muestreo de 24 kHz, y el modelo soporta hasta dos minutos de generación por pasada. Está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación, aunque los activos de terceros (como el codec Mimi) conservan sus propias licencias. Es una opción interesante para desarrolladores que trabajan con MLX, Swift o aplicaciones de voz en macOS, y para investigadores que necesitan un TTS de diálogo ligero y reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de diálogo, detalles internos no publicados en la información disponible) |
| Parametros totales | 1.076.244.736 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 2 minutos de audio por generación (no se especifica en tokens) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original Dia2-1B en los materiales proporcionados. Se sabe que es un modelo de síntesis de voz de diálogo con dos hablantes, que opera en modo streaming y que el audio resultante se decodifica con el codec Mimi de Kyutai a 24 kHz. El checkpoint base (nari-labs/Dia2-1B) fue desarrollado por Nari Labs, que también publica una variante de 2B, y proporciona código de inferencia para acelerar la investigación. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La conversión a MLX 4-bit fue realizada por TinyTrashLabs mediante la herramienta `Tools/convert-dia2.py` del repositorio `mlx-audio-swift`, y está pensada para ser consumida desde Gloam Voice Studio.

## Capacidades

- Generación de voz de diálogo en streaming: el modelo produce audio mientras recibe el texto, sin esperar a la entrada completa, lo que habilita conversaciones en tiempo real.
- Soporte para dos hablantes distintos en una misma generación, permitiendo diálogos naturales entre dos voces.
- Condicionamiento por audio: según la documentación del repositorio original, es posible condicionar la salida en audio de referencia, lo que permite imitar voces o estilos de habla concretos.
- Generación de hasta dos minutos de audio por pasada, suficiente para intercambios conversacionales largos.
- Salida de audio a 24 kHz mediante el codec Mimi de Kyutai, con calidad adecuada para voz.
- Integración con el ecosistema MLX de Apple, lo que permite ejecución eficiente en CPU/GPU unificada de chips M1, M2, M3 y M4.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modelo puede integrarse en aplicaciones de asistente por voz para mantener diálogos naturales con dos turnos de habla, gracias a su capacidad de streaming y bajo requisito de hardware en dispositivos Apple.
- Generación de podcasts o audiolibros con dos voces: permite crear contenido narrado con dos locutores distintos de forma automatizada, sin necesidad de estudios de grabación, usando un Mac con MLX.
- Doblaje de diálogos para vídeo o animación: al soportar dos hablantes y condicionamiento por audio, puede generar voces para personajes en proyectos de doblaje independiente o prototipos.
- Prototipado de interfaces de voz en macOS: los desarrolladores pueden probar flujos de conversación hablada en aplicaciones de escritorio o móviles de Apple sin depender de servicios externos, usando la conversión MLX.
- Investigación en TTS de diálogo: el modelo sirve como punto de partida para estudiar generación de voz conversacional, comparar arquitecturas o experimentar con fine-tuning, gracias a su licencia Apache 2.0 y su tamaño contenido.
- Sistemas de respuesta de voz automatizada (IVR): puede emplearse en sistemas de atención telefónica que requieran turnos de voz naturales entre un agente virtual y el usuario, con latencia reducida al no necesitar el texto completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas como MMLU, HumanEval o GSM8K, dado que se trata de un modelo de síntesis de voz y no de un LLM de propósito general. Tampoco se han encontrado evaluaciones comparativas de calidad de audio o latencia frente a otros modelos TTS en los materiales consultados.

## Requisitos de hardware

- VRAM estimada: al ser una conversión MLX 4-bit con un tamaño de repositorio de 0,6 GB, el modelo cabe en cualquier Mac con al menos 8 GB de memoria unificada. No se requiere VRAM dedicada, ya que MLX utiliza la memoria unificada del chip de Apple.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de RAM. No se recomienda su uso en GPUs NVIDIA o AMD, ya que MLX está diseñado exclusivamente para el ecosistema Apple.
- Compatibilidad con hardware de consumo: sí, cabe en todos los Mac con silicio de Apple, incluidos los modelos base con 8 GB de RAM.
- Opciones de despliegue: el modelo se consume mediante la librería MLX (Python o Swift) y está integrado en Gloam Voice Studio. También puede usarse con las herramientas de conversión del repositorio `mlx-audio-swift`.
- Latencia y throughput: no se han publicado datos concretos de latencia o throughput. Dado el tamaño de 1B y la cuantización 4-bit, se espera una generación en tiempo real o cercana a tiempo real en chips M1 Pro o superiores, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de diálogo TTS. El repositorio original de Nari Labs menciona una variante de 2B (Dia2-2B) que podría ofrecer mayor calidad a costa de más recursos, pero no se han encontrado datos comparativos publicados. Tampoco se han identificado otros modelos TTS de diálogo con dos hablantes y streaming que sean directamente comparables en la información disponible. Por tanto, la comparativa se limita a indicar que existe una versión de mayor tamaño del mismo modelo, sin métricas objetivas.

## Limitaciones y advertencias

- Solo soporta inglés: el modelo no está entrenado para otros idiomas, por lo que su uso en castellano u otros idiomas producirá resultados incorrectos o ininteligibles.
- Limitado a dos hablantes: no es posible generar conversaciones con más de dos voces distintas en una misma generación.
- Máximo de dos minutos por generación: las secuencias de audio más largas requieren dividir el texto en fragmentos, lo que puede afectar a la coherencia conversacional.
- Dependencia del codec Mimi: el audio se decodifica con el codec de Kyutai, cuyos términos de licencia son independientes del modelo y deben revisarse antes de un uso comercial.
- Conversión no oficial: la conversión MLX 4-bit ha sido realizada por TinyTrashLabs y no está respaldada por Nari Labs, por lo que puede haber diferencias de comportamiento respecto al checkpoint original.
- Sin datos de rendimiento en producción: no se han publicado benchmarks de latencia, calidad de voz ni robustez, por lo que se recomienda realizar pruebas propias antes de desplegar en entornos críticos.
- Riesgo de alucinación o errores de pronunciación: como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos de audio, especialmente con nombres propios o términos técnicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tinytrashlabs/dia2-1b-mlx-4bit
- Repositorio original de Nari Labs (Dia2): https://github.com/nari-labs/dia2
- Herramienta de conversión MLX (TinyTrashLabs): https://github.com/TinyTrashLabs/mlx-audio-swift
- Gloam Voice Studio (aplicación consumidora): https://github.com/TinyTrashLabs/gloam-voice-studio
- Framework MLX: https://mlx-framework.org/

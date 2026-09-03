# tinytrashlabs/dia2-1b-mlx-8bit

## Resumen

Dia2-1B-MLX-8bit es una conversión al formato MLX con cuantización de 8 bits del modelo Dia2-1B, desarrollado por Nari Labs. Dia2 es un modelo de síntesis de voz (TTS) especializado en diálogos entre dos hablantes, capaz de generar audio de forma streaming, es decir, sin necesidad de recibir el texto completo para empezar a producir voz. El modelo original está pensado para conversaciones en tiempo real y permite condicionar la salida con audio de referencia para modular el tono o la emoción.

Esta conversión, realizada por Tiny Trash Labs, está optimizada para ejecutarse en hardware Apple Silicon mediante el framework MLX, lo que facilita su uso en aplicaciones locales de bajo consumo. El modelo tiene aproximadamente 1.070 millones de parámetros y genera audio a 24 kHz a través del codec Mimi de Kyutai. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque los componentes de terceros (como el codec) conservan sus propias licencias.

La relevancia de esta conversión radica en que acerca un modelo TTS de diálogo de última generación a entornos de desarrollo en macOS, con un tamaño de repositorio de 1,1 GB y una huella de memoria reducida gracias a la cuantización de 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RQ-Transformer (estilo Moshi) |
| Parametros totales | 1.076.244.736 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (genera hasta 2 minutos de audio por pasada) |
| Tipos de cuantizacion | 8 bits (MLX) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Dia2 se basa en un RQ-Transformer (Residual Quantization Transformer), una arquitectura similar a la empleada en Moshi, que combina un transformer con cuantización residual para generar audio directamente desde texto. El modelo procesa el texto de entrada y produce tokens de audio que luego se decodifican mediante el codec Mimi de Kyutai a 24 kHz. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineamiento (RLHF, DPO, etc.). Esta conversión MLX no implica un reentrenamiento; se trata de una adaptación de los pesos originales al formato MLX con cuantización de 8 bits, realizada con la herramienta `convert-dia2.py` del repositorio `mlx-audio-swift`.

## Capacidades

- Generacion de voz sintetica para dialogos entre dos hablantes, con voces diferenciadas.
- Streaming: puede comenzar a generar audio con las primeras palabras del texto de entrada, sin esperar a la frase completa.
- Condicionamiento por audio: permite usar una muestra de audio de referencia para influir en el tono o la emocion de la salida.
- Generacion de hasta 2 minutos de audio por llamada.
- Soporte exclusivo del idioma ingles.
- No incluye capacidades de texto generico, tool calling, agentes ni razonamiento; es un modelo TTS especializado.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modelo puede mantener un dialogo fluido con dos interlocutores, generando respuestas de voz mientras se recibe el texto, lo que reduce la latencia percibida en aplicaciones de atencion al cliente o asistentes personales.
- Doblaje de dialogos para videos, podcasts o audiolibros: al soportar dos hablantes, permite generar conversaciones completas con voces diferenciadas sin necesidad de locutores humanos, agilizando la produccion de contenido.
- Prototipado rapido de interacciones de voz: los desarrolladores pueden integrar el modelo en entornos de desarrollo en macOS para probar flujos de conversacion antes de pasar a produccion, gracias a su compatibilidad con MLX y su bajo requisito de memoria.
- Aplicaciones de accesibilidad: puede utilizarse para leer en voz alta dialogos de textos o guiones, ofreciendo una experiencia mas natural que los TTS convencionales de un solo hablante.
- Investigacion en TTS de dialogo: al ser un modelo abierto y ligero, sirve como base para experimentos sobre generacion de voz conversacional, control de emociones o adaptacion a nuevos dominios.
- Integracion en herramientas de edicion de audio: puede incorporarse a suites de produccion para generar pistas de voz de relleno o maquetas de dialogo, reduciendo costes en fases iniciales de proyectos audiovisuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser una cuantizacion de 8 bits, los pesos ocupan aproximadamente 1,07 GB, mas overhead de activaciones y codec. Se recomienda un minimo de 8 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3 o superiores) con al menos 8 GB de RAM unificada. No es compatible con GPUs NVIDIA o AMD de forma nativa, ya que MLX esta disenado para el ecosistema Apple.
- En consumer GPU: no aplica, dado que MLX solo funciona en hardware Apple.
- Opciones de despliegue: el modelo se consume mediante el framework MLX, y esta integrado en Gloam Voice Studio de Tiny Trash Labs. No hay soporte para vLLM, llama.cpp u Ollama, al ser un modelo TTS con formato especifico.
- Latencia y throughput: no se dispone de datos medidos. Al ser un modelo de 1B con cuantizacion de 8 bits, se espera una generacion en tiempo real o superior en hardware Apple Silicon moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Dia2-1B (original) | 1.07B | no disponible | ingles | Apache 2.0 | PyTorch / Transformers |
| Dia2-1B-MLX-8bit (este) | 1.07B | no disponible | ingles | Apache 2.0 | MLX (safetensors) |
| Dia2-2B | 2B | no disponible | ingles | Apache 2.0 | PyTorch / Transformers |
| Dia (1.6B) | 1.6B | no disponible | ingles | Apache 2.0 | PyTorch / Transformers |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de datos de otros TTS de dialogo con caracteristicas equivalentes. La principal diferencia entre esta conversion y el original es el formato y la cuantizacion, que afectan al rendimiento en hardware Apple pero no a la calidad del audio en teoria.

## Limitaciones y advertencias

- Solo soporta ingles; no es util para otros idiomas.
- Limitado a dos hablantes fijos; no se pueden anadir voces adicionales sin reentrenamiento.
- Generacion maxima de 2 minutos por llamada; para audios mas largos se requiere segmentacion.
- Depende del codec Mimi de Kyutai, cuyos terminos de licencia son independientes del modelo principal.
- Al ser una conversion MLX, puede haber ligeras diferencias numericas respecto al modelo original en PyTorch, aunque en la practica suelen ser despreciables.
- No se han publicado evaluaciones formales de calidad de voz ni de robustez en entornos ruidosos.
- El modelo no incluye capacidades de texto generico ni de razonamiento; es exclusivamente un sintetizador de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinytrashlabs/dia2-1b-mlx-8bit
- Modelo original: https://huggingface.co/nari-labs/Dia2-1B
- Repositorio de Nari Labs (Dia2): https://github.com/nari-labs/dia2
- Repositorio de Tiny Trash Labs (mlx-audio-swift): https://github.com/TinyTrashLabs/mlx-audio-swift
- Gloam Voice Studio: https://github.com/TinyTrashLabs/gloam-voice-studio
- Repositorio de Nari Labs (Dia original): https://github.com/nari-labs/dia

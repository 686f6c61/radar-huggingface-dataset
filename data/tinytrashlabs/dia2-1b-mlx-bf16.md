# tinytrashlabs/dia2-1b-mlx-bf16

## Resumen

Dia2-1B es un modelo de síntesis de voz (TTS) orientado al diálogo conversacional, desarrollado por Nari Labs. A diferencia de los TTS tradicionales que requieren el texto completo para generar audio, Dia2 es capaz de generar voz de forma *streaming*, comenzando a producir audio con solo las primeras palabras de entrada. Esto lo hace especialmente adecuado para aplicaciones de conversación en tiempo real, como asistentes de voz o doblaje interactivo.

El modelo genera diálogos entre dos hablantes, con soporte de condicionamiento por audio de referencia para controlar tono y emoción. El audio se decodifica mediante el codec Mimi de Kyutai a 24 kHz, y cada generación admite hasta dos minutos de duración. Esta versión concreta, `tinytrashlabs/dia2-1b-mlx-bf16`, es una conversión a formato MLX (Apple Silicon) realizada por Tiny Trash Labs, con pesos en bf16 y licencia Apache 2.0. El modelo base es `nari-labs/Dia2-1B`, con 1.076 millones de parámetros.

La relevancia de esta conversión radica en que permite ejecutar el modelo de forma eficiente en hardware Apple (M-series) mediante el framework MLX, facilitando su integración en aplicaciones locales de voz sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje de audio, detalles no publicados) |
| Parametros totales | 1.076.244.736 (1,08 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 2 minutos de audio generado por pasada |
| Tipos de cuantizacion | bf16 (esta conversion); el modelo original puede ofrecer otras |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 (modelo y conversion); el codec Mimi conserva su propia licencia |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura interna de Dia2-1B en la informacion disponible. Se sabe que es un modelo de generacion de audio que produce tokens de voz directamente, sin pasar por un vocoder externo, y que utiliza el codec Mimi de Kyutai para la decodificacion a forma de onda a 24 kHz. El modelo es capaz de operar en modo *streaming*, generando audio incrementalmente mientras recibe texto, y admite condicionamiento por audio de referencia para controlar caracteristicas vocales.

El entrenamiento fue realizado por Nari Labs, pero no se han publicado datos sobre el corpus utilizado, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. La conversion a MLX fue realizada por Tiny Trash Labs mediante el script `Tools/convert-dia2.py` del repositorio `mlx-audio-swift`, y esta pensada para ser consumida por Gloam Voice Studio.

## Capacidades

- Generacion de voz sintetica en ingles para dialogos entre dos hablantes.
- Generacion *streaming*: comienza a producir audio con las primeras palabras del texto de entrada, sin esperar al texto completo.
- Condicionamiento por audio de referencia: permite imitar tono, emocion y caracteristicas vocales de un clip de audio dado.
- Duracion maxima de dos minutos por generacion.
- Decodificacion de audio mediante el codec Mimi de Kyutai a 24 kHz.
- Soporte para conversaciones en tiempo real gracias a su naturaleza incremental.
- No incluye capacidades de vision, tool calling ni razonamiento multimodal; es exclusivamente un modelo de TTS.

## Casos de uso

- Asistentes de voz conversacionales: el modelo puede generar respuestas habladas de forma incremental, lo que reduce la latencia percibida en interacciones con asistentes locales en dispositivos Apple.
- Doblaje de dialogos para videojuegos o animacion: al soportar dos hablantes y condicionamiento por audio, permite generar intercambios entre personajes con voces diferenciadas a partir de un guion.
- Creacion de audiolibros con multiples personajes: se puede asignar una voz de referencia a cada personaje y generar dialogos largos (hasta dos minutos por segmento) de forma automatica.
- Prototipado rapido de experiencias de voz en aplicaciones macOS/iOS: gracias a la conversion MLX, el modelo se ejecuta localmente en Apple Silicon sin necesidad de GPU dedicada ni conexion a internet.
- Investigacion en TTS conversacional: el codigo de inferencia y los pesos abiertos permiten estudiar tecnicas de generacion *streaming* y condicionamiento por audio.
- Sistemas de respuesta interactiva por voz (IVR) en ingles: puede generar respuestas naturales en tiempo real para menus telefonicos o atencion al cliente automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos objetivos sobre calidad de voz, MOS (Mean Opinion Score) ni comparaciones con otros modelos TTS en tareas estandarizadas.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan aproximadamente 2,2 GB (tamano del repositorio). Con overhead de inferencia, se recomienda un minimo de 4 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: cualquier chip Apple M1, M2, M3 o M4 con al menos 8 GB de RAM unificada para margen de seguridad. No requiere GPU NVIDIA ni AMD.
- Compatibilidad con consumer GPU: si, en Macs con Apple Silicon. No esta pensado para GPUs de otras marcas al usar MLX.
- Opciones de despliegue: el modelo se consume mediante el framework MLX, tipicamente a traves de Gloam Voice Studio o scripts basados en `mlx-audio-swift`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no de texto.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano de 1B y el modo *streaming*, se espera una latencia de inicio de pocos cientos de milisegundos en hardware Apple moderno, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Dia2-1B (Nari Labs) | 1,08 B | hasta 2 min de audio | ingles | Apache 2.0 | PyTorch / Transformers |
| Dia (Nari Labs, v1) | 1,6 B | no especificado | ingles | Apache 2.0 | PyTorch |
| tinytrashlabs/dia2-1b-mlx-bf16 | 1,08 B | hasta 2 min de audio | ingles | Apache 2.0 | MLX (safetensors) |

La comparativa se limita a los modelos de la misma familia (Dia y Dia2) porque no se dispone de datos suficientes sobre otros TTS de dialogo de codigo abierto (como ChatTTS o CosyVoice) para establecer una comparacion rigurosa. La principal diferencia entre Dia2-1B y Dia (v1) es el tamano (1B vs 1,6B) y la capacidad de *streaming* en Dia2. La conversion MLX no altera el rendimiento del modelo, pero cambia el ecosistema de ejecucion.

## Limitaciones y advertencias

- Solo soporta ingles; no es util para otros idiomas sin adaptacion.
- Limitado a dos hablantes por generacion; no admite mas voces simultaneas.
- Duracion maxima de dos minutos por pasada; dialogos mas largos requieren segmentacion manual.
- El codec Mimi de Kyutai tiene su propia licencia, que puede imponer restricciones adicionales al uso comercial del audio generado.
- No se han publicado datos sobre sesgos en las voces generadas (por ejemplo, variaciones dialectales o de genero), por lo que se recomienda auditar el output antes de usarlo en produccion.
- Riesgo de alucinacion o errores de pronunciacion en nombres propios o terminos tecnicos, comun en modelos TTS.
- Al ser una conversion MLX, no es compatible con entornos que usen CUDA o ROCm; su uso queda restringido a Apple Silicon.
- No se proporcionan garantias de calidad de voz ni de rendimiento en tiempo real; se recomienda realizar pruebas de latencia en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinytrashlabs/dia2-1b-mlx-bf16
- Repositorio original de Dia2 (Nari Labs): https://github.com/nari-labs/dia2
- Repositorio de Dia (v1, Nari Labs): https://github.com/nari-labs/dia
- Repositorio de conversion MLX (TinyTrashLabs/mlx-audio-swift): https://github.com/TinyTrashLabs/mlx-audio-swift
- Gloam Voice Studio (consumidor del modelo): https://github.com/TinyTrashLabs/gloam-voice-studio
- Perfil de Tiny Trash Labs en Hugging Face: https://huggingface.co/tinytrashlabs

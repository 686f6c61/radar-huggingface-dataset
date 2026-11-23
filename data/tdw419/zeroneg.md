# tdw419/zeroneg

## Resumen

ZeroNeg es un ajuste fino mediante QLoRA de Qwen2.5-7B-Instruct, desarrollado por el usuario tdw419, que realiza una transformación semántica en tres etapas sobre cualquier afirmación negada. El modelo recibe una frase con negación y devuelve un objeto JSON estructurado con tres campos: `what_was_heard` (la frase resultante de eliminar todos los términos de negación, es decir, la distorsión literal), `distortion_analysis` (análisis de por qué esa distorsión invierte o altera el significado) y `what_was_meant` (la verdad fundamentada y sin negaciones de lo que el hablante realmente quería decir). El orden de los campos es deliberado: primero se expone la distorsión y después se condiciona la reformulación positiva sobre ella.

El modelo se apoya en un contrato determinista verificable: `what_was_heard` debe coincidir byte a byte con la entrada tras eliminar las negaciones, y `what_was_meant` no puede contener ningún token de negación (not, no, never, none, nothing, nowhere, neither, nor, without, cannot ni contracciones con n't). Esta restricción se refuerza a nivel de motor de inferencia mediante el sesgo de logits de llama.cpp, que fija los identificadores de token de negación a -100, haciendo físicamente imposible que el modelo los emita.

Es relevante por su enfoque poco habitual: en lugar de entrenar un modelo generativo genérico, se entrena un adaptador pequeño (r=16, 3 épocas, unos 3 minutos en una RTX 5090 Laptop) para una tarea de reescritura semántica con garantías verificables. El modelo base Qwen2.5-7B-Instruct aporta 7.615.616.512 parámetros y una ventana de contexto de 32.768 tokens (dato del modelo base, no especificado explícitamente en la model card del adaptador).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador QLoRA (PEFT/LoRA, r=16) |
| Parametros totales | 7.615.616.512 (modelo base + adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (publicado); entrenamiento en bnb-4bit; fusión en fp16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA cuantizado (QLoRA) sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.600 millones de parámetros. El entrenamiento se realizó con r=16, 3 épocas, 327 ejemplos de entrenamiento y 17 de validación, con schedule coseno y 4 pasos de calentamiento. La ejecución completa tardó aproximadamente 3 minutos en una RTX 5090 Laptop con 24 GB de VRAM, con una pérdida que descendió de 0,57 a 0,17-0,19 y una precisión de token de aproximadamente el 95%. Para el entrenamiento se usó una vista bnb-4bit del modelo base y para la fusión se empleó fp16.

Los datos de entrenamiento proceden de 50 semillas doradas elaboradas a mano en 13 categorías (física, meteorología, salud, emoción, sistemas, trabajo, social, tiempo, entre otras), que se expandieron mediante un profesor (qwen3:14b) en 2 rondas: de 475 candidatos se aceptaron 306 y se rechazaron 163, con traza de auditoría publicada. La innovación técnica clave es el contrato duro verificable con `neglib`: coincidencia byte a byte de `what_was_heard` con la entrada sin negaciones, ausencia total de tokens de negación en `what_was_meant`, orden de campos fijo y salida JSON parseable. Además, la guía de uso recomienda el sesgo de logits de llama.cpp (`--logit-bias`) para prohibir a nivel de motor los identificadores de token de negación, lo que convierte la restricción en una garantía física en lugar de una probabilidad.

## Capacidades

- Reescritura semántica de afirmaciones negadas: transforma una frase con negación en una representación positiva y fundamentada.
- Salida JSON estructurada con tres campos en orden fijo (`what_was_heard`, `distortion_analysis`, `what_was_meant`).
- Análisis de distorsión: explica cómo la eliminación de la negación invierte o altera el significado original.
- Cumplimiento de un contrato verificable determinista (verificador `neglib`).
- Prohibición de tokens de negación aplicable a nivel de motor mediante `logit_bias` en llama.cpp o `bad_words_ids` en Transformers.
- Generación de texto conversacional (hereda las capacidades del modelo base Qwen2.5-7B-Instruct, aunque el ajuste está especializado en la tarea de reescritura).
- Soporte de despliegue en llama.cpp (GGUF) y en Transformers con PEFT.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Reescritura de documentación técnica: convertir frases con negaciones ambiguas ("el servicio no está disponible") en descripciones positivas y fundamentadas ("el servicio está caído en este momento"), útil para manuales y guías de operación.
- Atención al cliente automatizada: reformular respuestas negativas de agentes conversacionales en mensajes positivos y accionables, reduciendo la percepción de hostilidad en comunicaciones de soporte.
- Análisis de sentimiento y moderación de contenido: detectar cómo una frase negada puede interpretarse de forma invertida al eliminar la negación, como paso previo a sistemas de clasificación sensible a la polaridad.
- Entrenamiento de asistentes con estilo E-Prime: generar variantes sin negaciones para proyectos que adoptan esta disciplina lingüística, con garantía verificable de ausencia de términos prohibidos.
- Preprocesamiento para pipelines de extracción de información: normalizar afirmaciones negadas a formas positivas antes de alimentar motores de búsqueda o sistemas de recuperación semántica.
- Investigación en semántica computacional: estudiar la relación entre negación, distorsión y significado intencional con un corpus y un verificador reproducibles.
- Generación de conjuntos de datos de contraste: producir pares (frase negada, verdad fundamentada) para entrenar o evaluar otros modelos en tareas de reescritura.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Construcción de semillas doradas (50 hechas a mano) | 50/50 superadas |
| Aceptación de expansión del profesor (qwen3:14b, 2 rondas) | 475 candidatos → 306 aceptados, 163 rechazados |
| Prueba de comportamiento, decodificación greedy, validación reservada | 16/17 |
| Prueba de humo GGUF Q4_K_M (llama.cpp) | 2/2 en el ejemplo canónico |
| Fila de fuga conocida ("I'm not scared of the dark.") con greedy bruto | FALLO: introduce "no" en `what_was_meant` |
| Misma fila con prohibición de negación a nivel de motor activada | 5/5 superadas, cinco formulaciones válidas distintas |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador PEFT requiere cargar el modelo base Qwen2.5-7B-Instruct; en fp16 son aproximadamente 15 GB, en bnb-4bit unos 5-6 GB, y en GGUF Q4_K_M alrededor de 4,5-5 GB.
- GPU recomendadas: RTX 5090 Laptop (24 GB) usada para el entrenamiento; para inferencia en fp16 se recomienda A100, H100 o RTX 4090 (24 GB); en cuantización 4-bit cabe en GPUs consumer de 8-12 GB.
- Cabe en GPU consumer: sí, en cuantización Q4_K_M o bnb-4bit en GPUs con 8 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (recomendado, con `--logit-bias` para la prohibición de negaciones), llama-server con `logit_bias` en la petición, Transformers con PEFT y `bad_words_ids`, y Ollama si se empaqueta el GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento completo tardó unos 3 minutos en una RTX 5090 Laptop con 24 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZeroNeg (tdw419/zeroneg) | 7.615.616.512 | no especificado (base: 32.768) | Reescritura semántica sin negaciones | apache-2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7.615.616.512 | 32.768 | Generación de texto general | apache-2.0 | Hugging Face |
| Qwen3-14B (profesor usado) | no disponible en esta ficha | no disponible | Generación de texto general | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas especializadas en reescritura semántica o estilo E-Prime en la información proporcionada.

## Limitaciones y advertencias

- Fuga de negaciones: en decodificación greedy bruta el modelo introduce términos de negación en `what_was_meant` aproximadamente 1 de cada 17 veces en frases de seguridad emocional; la prohibición a nivel de motor es el guardrail imprescindible para producción.
- Idiomas: solo inglés según la model card; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto: la model card no especifica la longitud de contexto del adaptador; el uso recomendado en llama.cpp es `-c 2048`, muy por debajo de la ventana del modelo base.
- Alucinación: al tratarse de un modelo generativo, `what_was_meant` puede inventar una fundamentación plausible pero incorrecta; el verificador solo garantiza la ausencia de negaciones y la coincidencia de `what_was_heard`, no la veracidad semántica.
- Sesgos: los datos de entrenamiento son 50 semillas hechas a mano más 306 ejemplos aceptados de un profesor; el dominio y los sesgos del profesor pueden filtrarse en las salidas.
- Licencia: apache-2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen2.5-7B-Instruct.
- Advertencia de producción: la salida JSON debe validarse con `neglib` antes de consumirse; no se debe confiar únicamente en el prompt para garantizar el contrato.
- Fecha: el repositorio se creó el 23 de noviembre de 2026 y no registra descargas ni likes, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tdw419/zeroneg
- Dataset: https://huggingface.co/datasets/tdw419/zeroneg-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.

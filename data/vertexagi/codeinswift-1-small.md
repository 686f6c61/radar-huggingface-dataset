# VertexAGI/codeinswift-1-small

## Resumen

CodeInSwift 1 Small es un modelo especializado en generación de código Swift, desarrollado por VertexAGI como parte de la familia CodeIn. Se trata de un fine-tuning mediante LoRA sobre Qwen3-8B (en su versión cuantizada a 4 bits de mlx-community), orientado exclusivamente a un único lenguaje de programación: Swift, el lenguaje de Apple. El modelo resuelve un problema concreto: los modelos base de razonamiento tienden a consumir todo el presupuesto de generación dentro de bloques de pensamiento (`<think>`) sin llegar a producir código, mientras que este modelo ha aprendido a entregar directamente explicaciones y bloques de código Swift completos.

Con 8.190.735.360 parámetros totales y un tamaño de repositorio de 4,6 GB, el modelo se distribuye únicamente en formato MLX de 4 bits (group size 64), pensado para ejecutarse en Apple Silicon mediante `mlx-lm`. La licencia es Apache 2.0, heredada del modelo base Qwen3.

Su relevancia actual radica en su enfoque de especialización extrema por lenguaje y en su metodología de evaluación: utiliza el compilador real de Swift (`swiftc -typecheck`) como oráculo de corrección, en lugar de heurísticas o jueces LLM. Los resultados publicados muestran un 38% de prompts que producen código compilable dentro de un presupuesto de 512 tokens, frente al 0% del modelo base en ese mismo presupuesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B base), fine-tuning LoRA |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencia de 3072 tokens) |
| Tipos de cuantización | 4 bits (group size 64) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); no se proporciona GGUF |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/Qwen3-8B-4bit`, una versión cuantizada a 4 bits del transformer Qwen3-8B, y se ajusta mediante LoRA con rango 8, escala 20 y 16 capas. El entrenamiento se realizó en 9.600 iteraciones repartidas en 3 sesiones reanudadas, con batch size de 1 y longitud de secuencia de 3072. Se entrenó como un modelo de chat real, usando un system prompt fijo y el formato `messages`.

El conjunto de datos es el split de Swift de `MnemicAI/Ling-Coder-SFT-English-Clean`, con 68.301 filas de preguntas y respuestas de programación genuinas entre humano y asistente, divididas en 62.837 ejemplos de entrenamiento y 5.464 de validación (split 92/8). La pérdida de validación final fue de 0,652. La innovación principal no es arquitectónica sino metodológica: la evaluación emplea el compilador real de Swift como criterio de corrección, extrayendo bloques ` ```swift ` y ejecutando `swiftc -typecheck` sobre ellos, lo que evita depender de heurísticas o de un juez LLM.

## Capacidades

- Generación de código Swift completo y funcional a partir de descripciones de problemas.
- Explicación del enfoque de resolución antes de entregar el código (modelo de chat de dos turnos, no autocompletado).
- Formato de respuesta estructurado con bloques de código delimitados (` ```swift `).
- Conversación multi-turno mediante plantilla de chat con system prompt.
- Especialización exclusiva en Swift; no está orientado a otros lenguajes.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del formato de chat.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistencia interactiva de programación Swift: el modelo recibe una descripción de problema y devuelve una explicación del enfoque seguida de código, adecuado para integrarse en un chat de desarrollo dentro de Xcode o en herramientas propias sobre Apple Silicon.
- Generación de funciones y algoritmos en Swift: útil para tareas acotadas como invertir una lista enlazada, manipular colecciones o implementar utilidades, donde el modelo entrega bloques de código listos para revisar y compilar.
- Prototipado rápido en desarrollo iOS/macOS: permite obtener un primer borrador de código Swift que el desarrollador revisa y compila, reduciendo el tiempo inicial de escritura.
- Aprendizaje y docencia de Swift: al explicar el enfoque antes del código, sirve como apoyo para quienes estudian el lenguaje y quieren ver el razonamiento detrás de una solución.
- Evaluación interna de pipelines de generación de código: su metodología de verificación con `swiftc -typecheck` es replicable para medir la calidad de otros modelos especializados en Swift.
- Integración en flujos locales sobre Apple Silicon: al distribuirse en MLX 4 bits (4,6 GB), puede ejecutarse en un Mac con memoria unificada suficiente, sin depender de servicios en la nube.

## Benchmarks y rendimiento

Evaluación sobre 100 prompts muestreados del split de validación (`valid.jsonl`, no usado en entrenamiento), con el mismo system prompt, decodificación greedy y límite de 512 tokens de salida. La corrección se verificó extrayendo bloques ` ```swift ` y ejecutando `swiftc -typecheck`.

| Modelo | Compila sin errores | Error de compilación | Sin bloque de código alcanzado |
|---|---|---|---|
| Qwen3-8B base | 0 | 0 | 100 |
| CodeInSwift 1 Small | 38 | 19 | 43 |

El 0/100 del modelo base se debe a que, sin indicación explícita, consume todo el presupuesto de 512 tokens razonando dentro de un bloque `<think>` y nunca llega a un bloque de código. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 4,6 GB en 4 bits, según el tamaño del repositorio.
- Hardware objetivo: Apple Silicon (MLX), con memoria unificada suficiente para alojar el modelo de 4 bits.
- No se proporciona build GGUF, por lo que no es directamente desplegable en llama.cpp ni Ollama en el momento de la publicación.
- Opciones de despliegue: `mlx-lm` sobre macOS con Apple Silicon.
- GPU NVIDIA (A100, H100, RTX 4090) no soportadas por el formato MLX distribuido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| CodeInSwift 1 Small | 8,19 B | no disponible | Swift | Apache 2.0 | MLX 4 bits |
| Qwen3-8B (base) | 8 B | no disponible | Generalista | Apache 2.0 | safetensors, GGUF (según distribución) |
| CodeInLuau (hermano de familia) | no disponible | no disponible | Luau (autocompletado) | no disponible | no disponible |

El modelo base Qwen3-8B es generalista y, según la evaluación del autor, no produce código Swift dentro de 512 tokens por su tendencia a razonar en `<think>`. CodeInLuau es el otro miembro de la familia CodeIn, orientado a Luau y a autocompletado de código bruto, a diferencia de CodeInSwift, que es un modelo de chat de dos turnos. No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Un 43% de las respuestas no llega a producir un bloque de código dentro de 512 tokens, y un 19% genera código con errores de compilación; son carencias reales y no resueltas según el propio autor.
- El modelo debe tratarse como un punto de partida a revisar y compilar, no como código listo para producción sin supervisión.
- Entrenado únicamente en inglés; no se documenta soporte de otros idiomas.
- Especializado exclusivamente en Swift; su rendimiento en otros lenguajes no está evaluado.
- Fine-tuning LoRA sobre un modelo de 8B con ~63K ejemplos, lo que limita la cobertura frente a modelos de mayor tamaño o entrenamiento completo.
- Solo se distribuye en MLX 4 bits; no hay GGUF, lo que restringe el despliegue fuera de Apple Silicon.
- No se documentan sesgos específicos ni riesgos de alucinación más allá de los errores de compilación reportados.
- Licencia Apache 2.0, que permite uso comercial, heredada del modelo base Qwen3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/codeinswift-1-small
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/MnemicAI/Ling-Coder-SFT-English-Clean

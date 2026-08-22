# tbhrc/meta_llama_3_1_8b_instruct_4bit

## Resumen

El modelo `tbhrc/meta_llama_3_1_8b_instruct_4bit` es una adaptación cuantizada a 4 bits del Llama 3.1 8B Instruct de Meta, convertida al formato MLX para ejecución eficiente en hardware Apple Silicon. El modelo original es un LLM denso de 8.000 millones de parámetros, afinado mediante instrucciones (instruction-tuned), con soporte para 128K tokens de contexto y capacidades multilingües en ocho idiomas, incluyendo español. Esta versión cuantizada reduce el peso del modelo a aproximadamente 4,5 GB, lo que permite ejecutarlo en dispositivos con memoria unificada limitada, como Macs con chip M1 o superior.

La relevancia de este modelo reside en su idoneidad para despliegue local en entornos Apple, combinando el rendimiento de Llama 3.1 con una huella de memoria reducida. Es una opción práctica para desarrolladores que necesitan un asistente de conversación, generación de código o razonamiento en producción sin depender de GPUs dedicadas. No obstante, es importante señalar que el número de parámetros indicado en el repositorio (1.254.952.960) difiere del valor oficial de 8.03B del modelo original, lo que sugiere un posible error en los metadatos o una cuantización extremadamente agresiva no estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con Grouped Query Attention |
| Parametros totales | 1.254.952.960 (según metadatos del repo; el modelo base tiene 8.03B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (del modelo base) |
| Tipos de cuantizacion | 4-bit (MLX quantization) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | MLX (safetensors, compatible con MLX) |

## Arquitectura y entrenamiento

El modelo base Llama 3.1 8B Instruct es un transformer denso de 32 capas con Grouped Query Attention (GQA) de 8 grupos de cabezas clave/valor, y una ventana de contexto de 128K tokens. Fue entrenado por Meta con un dataset de aproximadamente 15 billones de tokens, incluyendo datos multilingües de ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés). El entrenamiento combinó pre-entrenamiento en lenguaje puro con fases de ajuste fino supervisado (SFT) y optimización con aprendizaje por refuerzo con retroalimentación humana (RLHF) para mejorar la alineación y la capacidad de seguir instrucciones.

La versión publicada en este repositorio es una conversión del modelo base a pesos cuantizados en 4 bits mediante la librería MLX, que utiliza cuantización por bloques para reducir el tamaño de memoria sin una degradación severa del rendimiento. El proceso de conversión no altera la arquitectura ni los pesos semánticos, pero reduce la precisión numérica de los parámetros. No se han publicado detalles adicionales sobre el dataset de cuantización o el método exacto aplicado en esta conversión concreta.

## Capacidades

- Generación de texto conversacional y de formato libre con alta coherencia.
- Razonamiento multilingüe en ocho idiomas, incluyendo español, alemán y tailandés.
- Soporte de tool calling y function calling para integración con APIs y herramientas.
- Capacidad de razonamiento multi-step para tareas de agente.
- Manejo de contexto largo de hasta 128K tokens, útil para documentos extensos o conversaciones de muchos turnos.
- Ejecución eficiente en hardware Apple Silicon gracias al formato MLX, con bajo consumo de memoria.

## Casos de uso

- **Asistentes virtuales en macOS**: el modelo puede integrarse en aplicaciones nativas para Mac como backend de chat local, aprovechando la memoria unificada del chip y la librería MLX para inferencia en tiempo real sin conexión.
- **Atención al cliente automatizada**: con 128K de contexto, puede gestionar conversaciones multi-turno largas, manteniendo el historial completo de la interacción en español u otros idiomas soportados.
- **Generación de código en entornos de desarrollo**: soporta tool calling, lo que permite conectarlo a editores o pipelines de CI/CD para autocompletado y revisión de código en equipos con Mac.
- **Análisis de documentos legales o técnicos**: su contexto amplio permite resumir o extraer información de contratos, informes o manuales extensos sin truncamiento.
- **Traducción y transcripción multilingüe**: al soportar ocho idiomas, puede usarse para traducir textos o transcribir y reformular contenido en tiempo real en aplicaciones de productividad.
- **Prototipado de agentes de IA**: con su capacidad de razonamiento multi-step y function calling, es adecuado para construir agentes que ejecuten tareas secuenciales, como gestión de calendario o búsqueda de información, todo en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta versión cuantizada específica. El modelo base Llama 3.1 8B Instruct reporta resultados en MMLU (68.4), HumanEval (72.2) y GSM8K (84.5) según Meta, pero estos datos corresponden al modelo sin cuantizar y no se pueden extrapolar directamente a la versión 4-bit MLX.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 4,5 GB, por lo que se recomienda al menos 8 GB de memoria unificada en Apple Silicon para una inferencia fluida.
- **GPU recomendadas**: Macs con chip M1, M2, M3 o M4 (incluidos Pro y Max) con memoria unificada de 8 GB o más. También puede ejecutarse en cualquier sistema con librería MLX y soporte para GPU de Apple.
- **GPU consumer**: no aplicable directamente, ya que MLX está diseñado para hardware Apple; para GPU NVIDIA se requeriría una conversión a otro formato (GGUF, AWQ, etc.).
- **Opciones de despliegue**: la librería MLX permite integración en Python con `mlx-lm`, o mediante servidores de inferencia como `mlx-lm.server`. No compatible con vLLM o llama.cpp sin conversión previa.
- **Latencia y throughput**: no disponible en la información del repo; depende de la generación de hardware y del tamaño de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `tbhrc/meta_llama_3_1_8b_instruct_4bit` | 1.25B (repo) | 128K | Llama 3.1 Community | MLX 4-bit | Cuantizado para Apple Silicon |
| `meta-llama/Llama-3.1-8B-Instruct` | 8.03B | 128K | Llama 3.1 Community | safetensors | Modelo base sin cuantizar |
| `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit` | 8.03B | 128K | Llama 3.1 Community | GGUF/BNB 4-bit | Cuantizado para GPU NVIDIA |

La principal diferencia es el formato: la versión de `tbhrc` está optimizada para MLX (Apple), mientras que las alternativas se orientan a ecosistemas NVIDIA o genéricos. El número de parámetros declarado en el repo de `tbhrc` es inconsistente con el modelo base, lo que obliga a verificar la integridad de los pesos antes de su uso.

## Limitaciones y advertencias

- El número de parámetros indicado en los metadatos del repositorio (1.254.952.960) es anómalo respecto al valor oficial de 8.03B de Llama 3.1 8B; podría tratarse de un error de metadatos o de una cuantización no estándar, por lo que se recomienda validar el modelo en tareas de prueba antes de producción.
- Al ser una cuantización de 4 bits, se puede esperar una degradación leve en tareas complejas de razonamiento o generación de código en comparación con el modelo en FP16.
- La licencia Llama 3.1 Community License exige que cualquier producto derivado incluya el nombre "Llama" al inicio y cumpla con la política de uso aceptable; el uso comercial está restringido para entidades con más de 700 millones de usuarios activos mensuales.
- El modelo está limitado a los ocho idiomas del entrenamiento; no soporta lenguas no incluidas, como árabe o ruso.
- No se han publicado resultados de benchmarks específicos para esta versión cuantizada, por lo que su rendimiento relativo no está validado.
- La ejecución requiere el ecosistema MLX de Apple; no es compatible directamente con frameworks estándar de GPU como CUDA sin conversión adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tbhrc/meta_llama_3_1_8b_instruct_4bit
- Modelo base oficial: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Documentación de Llama 3.1 (Meta): https://llama.meta.com/doc/overview
- GitHub de Meta Llama 3.1 (referencia): https://github.com/baberibrar/meta-llama-Meta-Llama-3.1-8B-Instruct
- Ejemplo de despliegue con vLLM (para el modelo base): https://recipes.vllm.ai/meta-llama/Llama-3.1-8B-Instruct

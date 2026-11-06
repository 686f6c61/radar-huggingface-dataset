# tomvaillant/qwen3.5-9b-spotlight-r3-mlx

## Resumen

qwen3.5-9b-spotlight-r3-mlx es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, publicado por el usuario tomvaillant bajo licencia Apache 2.0. No se trata de un modelo de propósito general: ha sido entrenado específicamente para desempeñar los roles de agente dentro de Spotlight, la herramienta de investigación de Buried Signals, y espera los prompts y herramientas propios de ese sistema. El autor recomienda explícitamente usar el modelo base para cualquier otro uso.

El modelo conserva la arquitectura y el tokenizador del Qwen3.5-9B original, con 9.409.813.744 parámetros totales, y se distribuye en formato MLX cuantizado a 4 bits afines con tamaño de grupo 64, ocupando aproximadamente 5,6 GB. La torre de visión se mantiene del modelo base, aunque el autor indica que no se ha probado en esta compilación. La pipeline declarada es image-text-to-text, lo que sugiere capacidades multimodales heredadas del base.

Su relevancia es acotada: se trata de un artefacto de investigación interno de un proyecto concreto (Spotlight), con cero descargas y cero likes en el momento de la ficha, y con una advertencia explícita del propio autor sobre su fiabilidad como verificador de hechos. Resulta útil como referencia de cómo se construye un tune de agente especializado sobre Qwen3.5, pero no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-9B; detalles no disponibles) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit affine, group size 64 (formato MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (~5,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de ~9,4 mil millones de parámetros. Sobre él se aplicó un ajuste fino tipo LoRA orientado a los roles de agente de Spotlight, que posteriormente se fusionó con el modelo base en bf16 y después se cuantizó a 4 bits afines con group size 64 para su distribución en formato MLX. La torre de visión se conserva del base sin modificaciones declaradas, aunque no se ha validado su comportamiento en esta compilación.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor indica que el tokenizador y la plantilla de chat son idénticos a los del base, salvo el campo `tokenizer_class` en `tokenizer_config.json`. No se documentan innovaciones técnicas adicionales más allá de la fusión de LoRA y la cuantización MLX.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del Qwen3.5-9B base.
- Ejecución de roles de agente dentro del sistema Spotlight, con sus prompts y herramientas específicos.
- Soporte multimodal image-text-to-text declarado en la pipeline, con torre de visión heredada del base (no probada en esta compilación).
- Modo de pensamiento (thinking) activable; el autor reporta comportamiento distinto con thinking on/off en la tarea de verificación.
- Soporte de tool calling implícito en su diseño como agente de Spotlight (no se detallan las herramientas concretas).
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Investigación asistida dentro de Spotlight: el modelo está entrenado para ejecutar los roles de agente de la herramienta de Buried Signals, por lo que su uso previsto es alimentar esos flujos de investigación con los prompts y herramientas del sistema.
- Referencia para construcción de tunes de agente: sirve como ejemplo práctico de cómo adaptar Qwen3.5-9B con LoRA y cuantización MLX para un dominio concreto, útil para equipos que quieran replicar el pipeline.
- Evaluación de fiabilidad en verificación de hechos: dado que el autor documenta su tasa de error como fact-checker, puede emplearse como caso de estudio de degradación de capacidades tras un tune especializado.
- Prototipado en Apple Silicon: al estar en formato MLX 4-bit (~5,6 GB), permite experimentar con un modelo de 9B en hardware de Apple con memoria unificada moderada.
- Pruebas de pipelines multimodales: la pipeline image-text-to-text permite validar integraciones de visión, aunque el autor advierte que la visión no está probada.
- Análisis comparativo base vs. fine-tune: útil para estudiar cómo un tune estrecho afecta a capacidades generales como la verificación de afirmaciones.

## Benchmarks y rendimiento

El autor reporta una única métrica interna de fiabilidad como verificador de hechos, no un benchmark estándar:

| Evaluación | Este modelo (thinking off) | Qwen3.5-9B base | Objetivo |
|---|---|---|---|
| Afirmaciones alteradas respondidas como "supports" | ~61% | ~89% | <25% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~5,6 GB para los pesos en 4-bit MLX; el overhead de inferencia depende del contexto y del runtime.
- Hardware recomendado: equipos Apple Silicon con memoria unificada suficiente (orientativo: 16 GB o más para contexto moderado).
- Compatibilidad con GPU NVIDIA: el formato MLX es específico de Apple Silicon; para CUDA sería necesario convertir los pesos a otro formato (no documentado por el autor).
- Opciones de despliegue: runtime MLX (mlx-lm) en macOS; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3.5-9b-spotlight-r3-mlx | 9,41 B | no disponible | Apache 2.0 | MLX 4-bit | Tune especializado para Spotlight; fiabilidad como fact-checker degradada (~61% vs ~89%) |
| Qwen/Qwen3.5-9B | ~9,4 B | no disponible | Apache 2.0 | safetensors (bf16) | Modelo base de propósito general; recomendado por el autor para usos fuera de Spotlight |
| Otros tunes de Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre alternativas comparables en la documentación proporcionada |

## Limitaciones y advertencias

- Modelo no generalista: espera los prompts y herramientas de Spotlight; fuera de ese contexto su comportamiento no está garantizado y el autor recomienda el base.
- Fiabilidad como verificador de hechos insuficiente: con thinking off responde "supports" al ~61% de afirmaciones alteradas, frente al ~89% del base y un objetivo de <25%. No debe usarse en solitario para verificar afirmaciones.
- Visión no validada: la torre de visión se hereda del base pero no se ha probado en esta compilación.
- Idioma: solo inglés declarado.
- Formato restringido: pesos MLX 4-bit, lo que limita su uso a entornos Apple Silicon o requiere conversión no documentada.
- Sesgos: no documentados por el autor; al derivar de Qwen3.5-9B, hereda los sesgos del base, no cuantificados en la información disponible.
- Riesgo de alucinación: no evaluado de forma independiente; la métrica de fact-checking sugiere cautela.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es una versión modificada de Qwen3.5-9B (fine-tune y cuantización); conviene revisar las condiciones del base.
- Madurez: cero descargas y cero likes; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tomvaillant/qwen3.5-9b-spotlight-r3-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B

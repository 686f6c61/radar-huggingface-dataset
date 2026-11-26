# spade-rl/SPADE-Qwen3-8B-Games

## Resumen

SPADE-Qwen3-8B-Games es un ajuste fino (checkpoint) del modelo Qwen3-8B de Alibaba, desarrollado por el equipo spade-rl dentro de su marco de entrenamiento por auto-juego (self-play) con refuerzo. El modelo se entrena desempeñando dos roles simultáneos: un "Disenador de Entornos" que escribe entornos ejecutables y un "Agente de Razonamiento" que los resuelve. El disenador recibe recompensa por generar entornos en la frontera de lo que el agente puede resolver en cada momento, de modo que el curriculum se adapta dinámicamente a la política en lugar de estar fijado de antemano.

Este checkpoint concreto corresponde al ajuste "games", es decir, entornos con forma de juego. Parte de Qwen3-8B, un transformer denso de 8.190.735.360 parámetros (8,19 mil millones), con una longitud de contexto declarada de 32.768 tokens y licencia Apache 2.0. El repositorio ocupa 16,4 GB en safetensors y acumula 259 descargas en Hugging Face.

Su relevancia radica en el enfoque metodológico: en lugar de entrenar sobre un conjunto estático de tareas, SPADE genera su propio material de entrenamiento mediante auto-juego, lo que potencialmente mejora la generalización en razonamiento multi-paso y resolución de problemas dentro de entornos interactivos. Es un artefacto de investigación orientado a quienes estudian RL sobre modelos de lenguaje y generación automática de entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no indicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer denso de Qwen3-8B, con 8,19 mil millones de parámetros y una ventana de contexto de 32.768 tokens. Sobre esa base, spade-rl aplica un entrenamiento de refuerzo basado en auto-juego con dos roles acoplados: un Environment Designer que produce entornos ejecutables y un Reasoning Agent que los resuelve. La señal de recompensa del diseñador se calibra para mantener los entornos en la frontera de dificultad del agente, generando un curriculum adaptativo. El checkpoint "games" se especializa en entornos con mecánicas de juego.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon fases de RLHF o DPO adicionales. Sí se publican corpus de anclaje (grounding) asociados: `spade-grounding-corpus-games-15k` y `spade-grounding-corpus-tooluse-15k`, lo que sugiere un entrenamiento apoyado en datos de anclaje de 15.000 ejemplos por dominio. Para los detalles completos del método se remite al paper arXiv:2608.19197.

## Capacidades

- Generación de texto conversacional con plantilla de chat compatible con `transformers`.
- Razonamiento multi-paso orientado a la resolución de entornos interactivos.
- Generación de entornos ejecutables en su rol de Environment Designer.
- Resolución de tareas dentro de entornos generados en su rol de Reasoning Agent.
- Capacidad de tool use, inferida de la existencia del corpus de anclaje `spade-grounding-corpus-tooluse-15k` y de la etiqueta `endpoints_compatible`.
- Soporte de despliegue como API compatible con OpenAI mediante SGLang o vLLM.
- Capacidades multilingües: no disponible (la model card no las declara).
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Investigación en RL con auto-juego: usar el checkpoint como punto de partida para reproducir o extender el bucle Designer/Agent del paper, evaluando cómo evoluciona el curriculum generado.
- Generación automática de entornos de entrenamiento: emplear el rol de diseñador para producir tareas ejecutables con dificultad calibrada, útiles como banco de pruebas para otros agentes.
- Evaluación de agentes de razonamiento: servirse del modelo como generador de problemas y como solucionador de referencia, permitiendo comparar políticas frente a un mismo currículo.
- Experimentos de tool use: aprovechar el corpus de anclaje de herramientas para probar flujos de llamada a funciones en pipelines propios.
- Prototipado de agentes conversacionales multi-turno: con 32.768 tokens de contexto, sostener diálogos largos con historial extenso en fase de desarrollo.
- Despliegue en infraestructura propia como endpoint compatible con OpenAI: mediante SGLang o vLLM, integrándolo en aplicaciones que ya consumen la API de OpenAI.
- Estudio de dinámicas de auto-mejora: analizar si el modelo mantiene coherencia entre sus dos roles y cómo se degrada al forzar dificultades fuera de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 24 GB o más para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos; en 4 bits, en torno a 4-5 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio en producción con contexto completo de 32.768 tokens.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto reducido; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: `transformers`, SGLang (`>=0.4.6.post1`) y vLLM (`>=0.8.5`), ambos con endpoint compatible con OpenAI. La model card no menciona llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPADE-Qwen3-8B-Games | 8,19 B | 32.768 | RL auto-juego, entornos de juego | Apache 2.0 | Hugging Face (259 descargas) |
| Qwen/Qwen3-8B | 8,19 B | 32.768 (segun base) | Modelo generalista | Apache 2.0 | Hugging Face (modelo base) |
| Alternativas de ajuste RL sobre 8B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros checkpoints de RL auto-juego de tamaño similar no está disponible en la información proporcionada. El referente inmediato es el propio Qwen3-8B, del que este modelo hereda arquitectura, tokenizador y ventana de contexto, diferenciándose únicamente por el ajuste SPADE.

## Limitaciones y advertencias

- Es un checkpoint de investigación: no hay benchmarks publicados que respalden su rendimiento frente al modelo base en tareas generales.
- El ajuste está especializado en el dominio "games"; es probable que su comportamiento en tareas generales se degrade respecto a Qwen3-8B, aunque no se cuantifica.
- No se declaran idiomas soportados; el soporte multilingüe no está garantizado.
- Riesgo de alucinación: no evaluado en la información disponible; en generación de entornos ejecutables, una alucinación puede producir código inválido o inseguro.
- Los entornos generados son código ejecutable: deben aislarse en sandbox antes de su ejecución en cualquier pipeline.
- Licencia Apache 2.0 permite uso comercial, pero la model card no ofrece garantías ni soporte; conviene revisar las condiciones del modelo base Qwen3-8B.
- Solo 1 like y 259 descargas: comunidad reducida, lo que limita la validación independiente y el soporte.
- Configuración de muestreo recomendada por el autor: `temperature=0.6`, `top_p=0.95`, `top_k=20`, `min_p=0`; desviarse puede afectar la calidad.
- El contexto de 32.768 tokens puede provocar OOM; el autor sugiere reducirlo si ocurre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spade-rl/SPADE-Qwen3-8B-Games
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper: https://arxiv.org/abs/2608.19197
- Corpus de anclaje (games): https://huggingface.co/datasets/spade-rl/spade-grounding-corpus-games-15k
- Corpus de anclaje (tool use): https://huggingface.co/datasets/spade-rl/spade-grounding-corpus-tooluse-15k
- Organización spade-rl: https://huggingface.co/spade-rl

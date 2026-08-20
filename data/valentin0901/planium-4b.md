# valentin0901/Planium-4B

## Resumen

Planium-4B es un ajuste fino de 4.000 millones de parámetros sobre el modelo base Qwen/Qwen3.5-4B, especializado en planificación automática clásica y en su notación estándar PDDL (Planning Domain Definition Language). Desarrollado por valentin0901, el modelo está orientado principalmente a robótica y sistemas de control, y forma parte del sistema neuro-simbólico NeuroPlan, que conecta modelos de lenguaje con planificadores simbólicos para traducir peticiones en lenguaje natural a dominios y problemas PDDL, ejecutar el plan resultante y validarlo.

El modelo cubre los fragmentos `:strips` y `:strips :typing` de PDDL, y está entrenado para razonar sobre estados, precondiciones, efectos y objetivos, así como para detectar errores en código PDDL. Una de sus innovaciones es la mitigación del fallo de razonamiento no terminante del Qwen3.5 base: Planium-4B mantiene razonamientos cortos y se compromete con una respuesta. Su versión cuantizada en 4 bits (Q4_K_M, ~2,8 GB) permite ejecutarlo en un PC convencional o en placas embebidas como NVIDIA Jetson, sin depender de APIs en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-4B) |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (safetensors), Q4_K_M (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Planium-4B es un ajuste fino del modelo Qwen3.5-4B, un transformer denso de 4.000 millones de parámetros. El proceso de fine-tuning se ha centrado en tareas de planificación clásica en PDDL, limitándose a los fragmentos `:strips` y `:strips :typing`. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el método de alineación (RLHF, DPO, etc.). La model card indica que el ajuste también aborda un modo de fallo del modelo base: el razonamiento que no termina o se alarga innecesariamente en tareas de planificación. Planium-4B está entrenado para emitir tool calls en un bucle agéntico, lo que le permite invocar parsers, planificadores o validadores de planes directamente.

## Capacidades

- Generación de código PDDL: convierte peticiones en lenguaje natural en archivos de dominio o problema, típicamente el `:goal` o el archivo de problema para un dominio dado.
- Lectura y explicación de dominios, problemas y planes PDDL existentes.
- Razonamiento sobre estados, precondiciones, efectos y objetivos en el marco STRIPS.
- Detección de errores en fragmentos de PDDL (diagnóstico de código mal formado).
- Tool calling y modo agéntico: puede invocar parsers, planificadores y validadores de planes de forma autónoma.
- Soporte multimodal (image-text-to-text) según el pipeline declarado, aunque no se detallan capacidades concretas de visión.
- Conversación en inglés con contexto de planificación.

## Casos de uso

- Generación de dominios PDDL para robótica: un ingeniero describe en lenguaje natural una tarea de manipulación (p. ej., apilar bloques) y Planium-4B produce el archivo de dominio STRIPS listo para un planificador clásico.
- Validación de planes en entornos industriales: el modelo recibe un plan generado por un planificador y lo explica o verifica contra un dominio, señalando inconsistencias en precondiciones o efectos.
- Integración en sistemas neuro-simbólicos como NeuroPlan: Planium-4B actúa como traductor entre lenguaje natural y PDDL, permitiendo que un planificador simbólico ejecute la planificación real.
- Asistente de depuración para desarrolladores de PDDL: el modelo identifica errores sintácticos o semánticos en archivos de dominio o problema, acelerando el ciclo de desarrollo.
- Educación en planificación automática: estudiantes pueden interactuar con el modelo para comprender cómo se formalizan problemas STRIPS y cómo se estructuran dominios y objetivos.
- Despliegue en robótica embebida: gracias a su cuantización Q4_K_M (~2,8 GB), puede ejecutarse en placas como NVIDIA Jetson para planificación en tiempo real sin conexión a la nube.
- Automatización de tareas de oficina con planificación: generar planes de acción para logística o gestión de recursos a partir de descripciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos de planificación.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, el modelo ocupa aproximadamente 9,3 GB (4,66 B × 2 bytes), por lo que se necesita una GPU con al menos 12 GB de VRAM para ejecutarlo sin cuantizar. Con la cuantización Q4_K_M (~2,8 GB), cabe en GPUs con 4-6 GB de VRAM.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) para bf16; para la versión cuantizada, cualquier GPU con 4 GB o más, incluyendo placas embebidas como NVIDIA Jetson Orin Nano.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server con API compatible con OpenAI), Transformers con `AutoModelForImageTextToText`, y potencialmente vLLM o TGI dado que es compatible con la librería transformers.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU consumer moderna, un modelo de 4B en Q4_K_M puede generar decenas de tokens por segundo, pero estos valores dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Planium-4B | 4,66 B | no disponible | PDDL / planificación STRIPS | MIT |
| Qwen3.5-4B (base) | 4,66 B | no disponible | Generalista | MIT (según base) |
| Llama-3.2-3B | 3,2 B | 128 K | Generalista | Llama 3.2 Community |
| Phi-3.5-mini | 3,8 B | 128 K | Generalista | MIT |

No se dispone de datos de rendimiento comparativo entre estos modelos en tareas de planificación. La comparativa se limita a características estructurales. Planium-4B es el único de la lista especializado explícitamente en PDDL y planificación automática.

## Limitaciones y advertencias

- Soporte limitado a los fragmentos `:strips` y `:strips :typing` de PDDL; la planificación temporal, los fluents numéricos y los constructores ADL están mucho menos soportados.
- El modelo es un trabajo en progreso (work in progress) y puede cometer errores en la generación o validación de PDDL.
- Riesgo de alucinación en la interpretación de dominios complejos o en la detección de errores, especialmente fuera de los fragmentos soportados.
- Solo está entrenado en inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- No se han publicado datos sobre sesgos específicos, pero al derivar de Qwen3.5-4B puede heredar sesgos del modelo base.
- La licencia MIT permite uso comercial sin restricciones, pero el estado inmaduro del modelo recomienda validación exhaustiva antes de usarlo en producción.
- No se especifica la longitud de contexto soportada; para tareas con dominios PDDL muy extensos, podría ser necesario truncar o dividir la entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/valentin0901/Planium-4B
- Repositorio NeuroPlan en GitHub: https://github.com/valentin0901/NeuroPlan
- README de NeuroPlan: https://github.com/valentin0901/NeuroPlan/blob/main/README.md

# valentin0901/Planium-2B

## Resumen

Planium-2B es un ajuste fino de 2.000 millones de parámetros sobre el modelo base Qwen/Qwen3.5-2B, desarrollado por valentin0901, especializado en planificación automática y en la notación estándar PDDL (Planning Domain Definition Language). El modelo está orientado principalmente a robótica y sistemas de control, y permite convertir peticiones en lenguaje natural a archivos PDDL, explicar dominios y planes existentes, razonar sobre estados, precondiciones y efectos, y detectar errores en código PDDL. Su versión cuantizada a 4 bits (Q4_K_M, ~1,3 GB) es lo suficientemente ligera para ejecutarse en un PC convencional o en una placa embebida como NVIDIA Jetson, sin necesidad de API en la nube.

El modelo se distribuye bajo licencia MIT y está disponible en formato safetensors (bfloat16) y GGUF para llama.cpp. Es el motor del sistema neuro-simbólico NeuroPlan, que integra modelos de lenguaje con planificadores simbólicos. Planium-2B está diseñado para trabajar en un bucle agéntico, emitiendo llamadas a herramientas para manejar parsers, planificadores o validadores de planes. El ajuste fino también mitiga un fallo del modelo base: razonamientos que no terminan o se alargan innecesariamente, manteniendo respuestas concisas y comprometidas con una solución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-2B) |
| Parametros totales | 2.274.069.824 (2,27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-2B, no especificada en la documentación) |
| Tipos de cuantizacion | bfloat16 (safetensors), Q4_K_M (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Planium-2B es un ajuste fino del modelo Qwen3.5-2B, que emplea una arquitectura Transformer densa. No se han publicado detalles específicos sobre el proceso de entrenamiento, como el número de tokens, la composición del dataset o el uso de técnicas de alineación (RLHF, DPO). La model card indica que el ajuste se centra en los fragmentos `:strips` y `:strips :typing` de PDDL, con soporte limitado para planificación temporal, fluents numéricos y constructos ADL más ricos. El entrenamiento busca reducir el razonamiento excesivamente largo del modelo base en tareas de planificación, fomentando respuestas cortas y directas. Además, se ha entrenado para emitir llamadas a herramientas, lo que permite su integración en bucles agénticos con parsers, planificadores y validadores externos.

## Capacidades

- Generación de código PDDL: convierte peticiones en lenguaje natural en archivos de dominio o problema, típicamente el `:goal` o el archivo de problema para un dominio dado.
- Lectura y explicación de dominios, problemas y planes PDDL existentes.
- Razonamiento sobre estados, precondiciones, efectos y objetivos en el marco STRIPS.
- Detección de errores en fragmentos de PDDL, señalando qué está mal en un dominio o problema.
- Tool calling: entrenado para trabajar en un bucle agéntico y emitir llamadas a herramientas, pudiendo invocar parsers, planificadores o validadores de planes.
- Soporte de conversación multi-turno en inglés, con capacidad de mantener contexto dentro de la ventana del modelo.
- Pipeline declarado como image-text-to-text, aunque la documentación no detalla capacidades visuales específicas.

## Casos de uso

- Generación de dominios PDDL para robótica: un ingeniero describe en lenguaje natural una tarea de manipulación (por ejemplo, apilar bloques) y Planium-2B genera el archivo de dominio STRIPS correspondiente, listo para ser usado por un planificador simbólico.
- Validación de planes en entornos de simulación: el modelo puede recibir un plan generado por un planificador y explicar paso a paso las precondiciones y efectos, ayudando a depurar fallos lógicos.
- Chat interactivo para aprendizaje de PDDL: estudiantes o desarrolladores pueden conversar con el modelo para entender cómo se modelan acciones, estados y objetivos, recibiendo explicaciones en lenguaje natural.
- Integración en sistemas neuro-simbólicos como NeuroPlan: Planium-2B actúa como traductor entre lenguaje natural y PDDL, alimentando a un planificador externo y ejecutando el plan resultante en entornos como Blocks World 3D, Sokoban o patrullaje de drones.
- Asistente de depuración de código PDDL: el modelo identifica errores sintácticos o semánticos en dominios y problemas, sugiriendo correcciones, lo que acelera el desarrollo de modelos de planificación.
- Control de robots embebidos: gracias a su versión cuantizada en 4 bits, puede ejecutarse en placas como NVIDIA Jetson, permitiendo planificación local sin conexión a la nube en aplicaciones de robótica móvil o manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos de planificación. El autor indica que el modelo está en desarrollo y puede cometer errores.

## Requisitos de hardware

- La versión completa en bfloat16 (2,27B parámetros) requiere aproximadamente 4,5 GB de VRAM para inferencia, siendo viable en GPUs con 6 GB o más (por ejemplo, RTX 2060, RTX 3060, GTX 1080 Ti).
- La versión cuantizada GGUF Q4_K_M (~1,3 GB) puede ejecutarse en CPUs con al menos 4 GB de RAM, o en GPUs con 2 GB de VRAM, como las integradas en placas Jetson (Jetson Nano, Jetson Orin Nano).
- El modelo es compatible con llama.cpp y llama-server, que ofrecen una API compatible con OpenAI para despliegue local.
- También se puede cargar con Transformers usando `AutoModelForImageTextToText`, con soporte para `device_map="auto"`.
- Para uso en producción con alta concurrencia, se recomienda vLLM o TGI, aunque no se han publicado mediciones de latencia o throughput específicas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos especializados en planificación PDDL. Como referencia, se puede comparar con el modelo base Qwen3.5-2B, que no está especializado en PDDL y puede generar razonamientos más largos y menos precisos en estas tareas. Otros modelos de 2B como Qwen2.5-1.5B o Llama-3.2-1B no tienen un ajuste específico para planificación simbólica, por lo que su rendimiento en PDDL sería inferior. No se han encontrado modelos comparables con la misma especialización en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Soporte limitado a los fragmentos `:strips` y `:strips :typing` de PDDL; la planificación temporal, los fluents numéricos y los constructos ADL más ricos están mucho menos soportados.
- El modelo está entrenado únicamente en inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Es un trabajo en progreso (work in progress) y puede cometer errores en la generación o interpretación de PDDL, por lo que se recomienda validar siempre la salida con un parser o planificador externo.
- No se han publicado datos sobre sesgos o alucinaciones específicas, pero al ser un modelo de lenguaje, existe riesgo de generar código PDDL sintácticamente válido pero semánticamente incorrecto.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en entornos de producción.
- El pipeline declarado como image-text-to-text sugiere capacidades multimodales, pero no se documenta su uso; los usuarios deben asumir que la funcionalidad principal es texto a texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/valentin0901/Planium-2B
- Repositorio NeuroPlan en GitHub: https://github.com/valentin0901/NeuroPlan
- Perfil del autor en GitHub: https://github.com/valentin0901

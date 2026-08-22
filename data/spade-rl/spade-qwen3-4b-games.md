# spade-rl/SPADE-Qwen3-4B-Games

## Resumen

SPADE-Qwen3-4B-Games es un checkpoint del framework SPADE (Self-Play in Adaptive Synthetic Executable Environments), desarrollado por la organización spade-rl y publicado en julio de 2026. El modelo parte de Qwen/Qwen3-4B-Instruct-2507 y se entrena mediante self-play con aprendizaje por refuerzo en un escenario de generación de juegos: un mismo modelo actúa como *proposer* (diseña entornos ejecutables) y como *actor* (los resuelve), recibiendo recompensas por generar entornos que se sitúan en la frontera de las capacidades actuales del actor. Esto produce un currículo adaptativo que evoluciona con la política, en lugar de fijarse de antemano.

El checkpoint liberado corresponde a la iteración 399 del entrenamiento, con un corpus de anclaje (*grounding corpus*) de 15 000 juegos sintéticos. La relevancia de este modelo radica en que demuestra cómo el auto-juego con generación de entornos puede mejorar el razonamiento en benchmarks held-out de matemáticas, ciencia, código y razonamiento procedural, superando el punto de saturación de los baselines con entornos fijos. Es un modelo denso de 4 022 468 096 parámetros (aproximadamente 4B), con licencia Apache 2.0 y pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 4 022 468 096 (4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible (solo pesos en FP16/FP32 en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SPADE-Qwen3-4B-Games es un fine-tuning del modelo base Qwen3-4B-Instruct-2507, un transformer denso de 4B parámetros con soporte nativo de modo *thinking* y *non-thinking* (integrado en la familia Qwen3). El entrenamiento sigue el paradigma SPADE: un único modelo se entrena simultáneamente en dos roles. Como *proposer*, genera entornos ejecutables (juegos) a partir de un corpus de anclaje de 15 000 ejemplos; como *actor*, intenta resolver esos entornos. La recompensa del *proposer* depende de que los entornos generados estén en la frontera de resolubilidad del *actor*, lo que fuerza una mejora continua del currículo. No se especifica el uso de RLHF o DPO; el método se basa en aprendizaje por refuerzo con auto-juego. El checkpoint publicado corresponde a la iteración 399, el final del entrenamiento, sin evaluación offline adicional.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredadas del modelo base Qwen3-4B-Instruct.
- Generacion de entornos ejecutables (juegos) en formato de código, capaces de ser interpretados y resueltos por el propio modelo.
- Ejecucion y resolucion de entornos generados, incluyendo interacciones multi-paso dentro de un juego.
- Razonamiento procedural y de multiples etapas, potenciado por el entrenamiento con entornos adaptativos.
- Mejora en tareas held-out de matematicas, ciencia, generacion de codigo y razonamiento procedural, segun los resultados reportados en el paper de SPADE.
- Soporte de *tool calling* no confirmado en este checkpoint especifico; el modelo base Qwen3 lo incluye, pero el fine-tuning puede haberlo alterado.

## Casos de uso

- Investigacion en aprendizaje por refuerzo y curriculos adaptativos: el modelo sirve como banco de pruebas para estudiar como el auto-juego con generacion de entornos mejora la politica del agente sin necesidad de datasets fijos.
- Generacion de entornos de entrenamiento sinteticos: el *proposer* puede crear juegos o tareas procedurales que se usan para entrenar otros agentes en entornos controlados y escalables.
- Evaluacion de agentes de razonamiento: al generar entornos en la frontera de capacidad, permite medir el limite real de un agente en tareas de razonamiento multi-paso.
- Generacion procedural de juegos: el modelo puede producir descripciones de juegos o niveles que luego se ejecutan en motores de simulacion, util para prototipado rapido en desarrollo de videojuegos.
- Entrenamiento de modelos de razonamiento en dominios cientificos y de codigo: los entornos generados, aunque no contienen problemas de benchmark, inducen mejoras transferibles a tareas de ciencia y programacion.
- Benchmarking de capacidades emergentes: permite explorar que habilidades surgen cuando el agente se enfrenta a entornos cada vez mas complejos, util para caracterizar limites de modelos de tamano medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint (SPADE-Qwen3-4B-Games) en la informacion disponible. El paper de SPADE reporta mejoras en benchmarks held-out para los modelos de 8B y 30B-A3B, pero no se detallan cifras concretas para la variante de 4B. Se recomienda consultar el articulo arXiv para datos agregados del framework.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en FP16 (4 022 468 096 parametros × 2 bytes), unos 4 GB en cuantizacion de 8 bits y 2 GB en 4 bits, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: tarjetas consumer con 8 GB o mas, como RTX 3070/3080/3090 o RTX 4060/4070/4080/4090; tambien GPUs de datacenter como A10, A100 o H100 para despliegue a mayor escala.
- Cabe en GPUs consumer de gama media-alta; con cuantizacion de 4 bits podria ejecutarse en tarjetas con 4 GB de VRAM, aunque con riesgo de degradacion de calidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y transformers con `device_map="auto"`.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del modo de razonamiento (thinking vs non-thinking) del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SPADE-Qwen3-4B-Games | 4B | No disponible | Apache 2.0 | Fine-tuning con self-play para generacion de entornos |
| Qwen3-4B-Instruct-2507 (base) | 4B | No disponible | Apache 2.0 | Modelo base sin entrenamiento SPADE; soporta thinking mode |
| SPADE-Qwen3-8B (si existe) | 8B | No disponible | Apache 2.0 | Variante de mayor tamano del mismo framework (no confirmado en la informacion) |
| SPADE-Qwen3-30B-A3B (si existe) | 30B (MoE, 3B activos) | No disponible | Apache 2.0 | Variante MoE del framework; reporta mejoras en benchmarks held-out |

La comparativa se basa en datos parciales; no se dispone de informacion completa sobre las variantes de 8B y 30B-A3B en los resultados de busqueda. El modelo comparte arquitectura y licencia con su base Qwen3, diferenciandose por el entrenamiento SPADE.

## Limitaciones y advertencias

- Modelo de investigacion: no esta optimizado para produccion; el checkpoint es el final del entrenamiento sin evaluacion offline, por lo que su rendimiento en tareas generales puede ser impredecible.
- Sesgos conocidos: hereda los sesgos del modelo base Qwen3-4B-Instruct-2507, que pueden incluir sesgos culturales, de genero o linguisticos.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir contenido falso o inconsistente, especialmente en tareas fuera de su dominio de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no se ha especificado; se asume la del modelo base, pero no hay garantia de que el fine-tuning la preserve.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias; el usuario es responsable de su uso.
- Caveat para produccion: la generacion de entornos ejecutables puede producir codigo inseguro o con comportamientos inesperados; se recomienda ejecutar en entornos aislados.

## Enlaces

- HuggingFace: https://huggingface.co/spade-rl/SPADE-Qwen3-4B-Games
- Repositorio GitHub: https://github.com/spade-rl/spade
- Pagina del proyecto: https://spade-rl.github.io/
- Paper arXiv: https://arxiv.org/html/2608.19197v1
- Corpus de anclaje (games): https://huggingface.co/datasets/spare-rl/spade-grounding-corpus-games-15k
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B

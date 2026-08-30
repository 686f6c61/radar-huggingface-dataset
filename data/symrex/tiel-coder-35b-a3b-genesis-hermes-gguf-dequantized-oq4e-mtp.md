# symrex/Tiel-Coder-35B-A3B-Genesis-Hermes-GGUF-dequantized-oQ4e-mtp

## Resumen

Tiel-Coder-35B-A3B-Genesis-Hermes-GGUF-dequantized-oQ4e-mtp es un modelo de lenguaje especializado en tareas de codificación, desarrollado por el usuario symrex (OliK) y publicado en Hugging Face. Se trata de una versión cuantizada a 4 bits mediante la herramienta oQ (oMLX v0.6.3) con precisión mixta, basada en una arquitectura de mezcla de expertos (MoE) del tipo `qwen3_5_moe`. El nombre sugiere una configuración de 35 mil millones de parámetros totales con 3 mil millones activos (35B-A3B), aunque el archivo safetensors contiene 6.190.928.816 parámetros, probablemente debido a la cuantización o a la inclusión solo de los pesos relevantes.

El modelo está diseñado para ofrecer un alto rendimiento en generación de código y resolución de problemas de repositorios reales, compitiendo con modelos de mayor tamaño. Según las fuentes consultadas, alcanza velocidades de inferencia de hasta 121,4 tokens por segundo en una sola GPU, y la versión con MTP (Multi-Token Prediction) añade aproximadamente 5 tokens por segundo adicionales. Su relevancia radica en que combina eficiencia computacional (MoE con pocos parámetros activos) con una calidad de salida comparable a modelos de gama alta, lo que lo convierte en una opción atractiva para despliegues locales y entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) |
| Parametros totales | 6.190.928.816 (safetensors cuantizado; el nombre indica 35B-A3B) |
| Parametros activos | 3B (según la nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen3.5, según el tag `qwen3_5_moe`. La configuración 35B-A3B indica que, aunque el modelo total tiene alrededor de 35 mil millones de parámetros, solo 3 mil millones se activan por token, lo que reduce significativamente el coste computacional en inferencia. La cuantización se realizó con la herramienta oQ (oMLX v0.6.3) en modo de precisión mixta, con 4 bits y un tamaño de grupo de 64, lo que permite reducir el peso del modelo a aproximadamente 21,6 GB.

No se dispone de información detallada sobre el proceso de entrenamiento, como el número de tokens, la composición del dataset o el uso de técnicas de alineación (RLHF, DPO). El nombre "Genesis-Hermes" sugiere que se trata de un fine-tuning sobre un modelo base denominado Genesis-Hermes, pero no hay datos públicos al respecto. La versión actual incluye soporte para MTP (Multi-Token Prediction), una técnica que predice varios tokens a la vez y que aporta una mejora de velocidad de unos 5 tokens por segundo.

## Capacidades

- Generación de código: el modelo está especializado en tareas de programación, con buen rendimiento en problemas de repositorios reales, comparable a Opus 4.6 Medium según la fuente baguaai.com.
- Razonamiento técnico: capaz de abordar tareas complejas de ingeniería de software, como corrección de errores, refactorización y generación de funciones.
- Velocidad de inferencia: alcanza hasta 121,4 tokens por segundo en una sola GPU (según llm-bench.io y kblip.com), y la versión MTP añade ~5 tok/s adicionales.
- Eficiencia MoE: al activar solo 3B parámetros por token, el consumo de memoria y cómputo es reducido en comparación con un modelo denso de 35B.
- Soporte para MLX: el formato de pesos es compatible con el ecosistema MLX de Apple, lo que permite su uso en hardware Apple Silicon.

No se ha confirmado soporte para tool calling, agentes o capacidades multimodales en la información disponible.

## Casos de uso

- Asistente de programación en local: el modelo puede integrarse en editores de código o entornos de desarrollo para ofrecer autocompletado y sugerencias de código en tiempo real, gracias a su alta velocidad de inferencia y su especialización en tareas de codificación.
- Resolución de incidencias en repositorios: dado su buen rendimiento en problemas de repositorios reales, puede utilizarse para analizar issues de GitHub, proponer parches o generar soluciones a bugs concretos.
- Generación de código en pipelines de CI/CD: su capacidad para producir código sintácticamente correcto y su baja latencia lo hacen adecuado para tareas automatizadas de generación de tests, documentación o scaffolding de proyectos.
- Aprendizaje y tutoría de programación: puede emplearse como tutor virtual que explica conceptos, revisa código y propone ejercicios, aprovechando su conocimiento técnico y su capacidad de razonamiento.
- Prototipado rápido: los desarrolladores pueden usarlo para generar esqueletos de aplicaciones, scripts o funciones específicas sin necesidad de un modelo de gran tamaño alojado en la nube.
- Despliegue en entornos con recursos limitados: al ser un MoE cuantizado con solo 3B parámetros activos, cabe en GPUs de consumo (24 GB VRAM) y puede ejecutarse en portátiles con Apple Silicon, lo que facilita su uso en equipos sin acceso a infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la fuente baguaai.com indica que TielCoder iguala el rendimiento de Opus 4.6 Medium en problemas de repositorios reales y supera a modelos como KAT-Coder y Nail en velocidad y fiabilidad. En cuanto a rendimiento de inferencia, llm-bench.io reporta un pico de 121 tok/s en una GPU, y kblip.com confirma 121,4 tok/s, con la versión MTP añadiendo ~5 tok/s adicionales.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 21,6 GB, por lo que se recomienda al menos 24 GB de VRAM para cargar el modelo completo en una GPU. Al ser MoE, la memoria activa por token es menor, pero todos los expertos deben residir en memoria.
- GPU recomendadas: RTX 3090, RTX 4090, A100, o cualquier GPU con 24 GB o más de VRAM. También es compatible con Apple Silicon mediante MLX, siempre que se disponga de suficiente memoria unificada (32 GB o más).
- Opciones de despliegue: al estar en formato MLX safetensors, se puede usar con la librería MLX de Apple. También podría convertirse a otros formatos (GGUF, etc.) para usar con llama.cpp, Ollama o vLLM, aunque no se ha confirmado.
- Latencia y throughput: según las fuentes, alcanza 121,4 tok/s en una GPU, y la versión MTP añade ~5 tok/s adicionales, llegando a ~126 tok/s.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para una comparativa exhaustiva. Según baguaai.com, TielCoder se compara favorablemente con:

- Opus 4.6 Medium: iguala su rendimiento en problemas de repositorios reales.
- KAT-Coder: superado en velocidad y fiabilidad.
- Nail: superado en velocidad y fiabilidad.

No hay información sobre otros modelos comparables (como Qwen2.5-Coder, DeepSeek-Coder, etc.) en las fuentes proporcionadas.

## Limitaciones y advertencias

- Licencia no especificada: al no disponer de una licencia clara, el uso comercial del modelo puede ser problemático. Se recomienda contactar con el autor para aclarar los términos.
- Información de entrenamiento limitada: no se conocen los datos de entrenamiento ni las técnicas de alineación, lo que dificulta evaluar posibles sesgos o comportamientos no deseados.
- Cuantización 4-bit: aunque la cuantización reduce el tamaño y acelera la inferencia, puede provocar una ligera pérdida de precisión en tareas complejas en comparación con el modelo original en full precision.
- Contexto limitado: no se ha especificado la longitud de contexto soportada, lo que puede ser un inconveniente para tareas que requieran ventanas largas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código incorrecto o inventar APIs inexistentes, por lo que se recomienda supervisión humana en entornos de producción.
- Dependencia de la arquitectura Qwen3.5: al ser un modelo basado en una arquitectura no oficial (qwen3_5_moe), podría haber incompatibilidades con herramientas estándar que esperan arquitecturas conocidas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/symrex/Tiel-Coder-35B-A3B-Genesis-Hermes-GGUF-dequantized-oQ4e-mtp)
- [Perfil del autor symrex](https://huggingface.co/symrex)
- [Benchmarks en llm-bench.io](https://llm-bench.io/models/tiel-coder-35b-a3b-mlx-oq4e)
- [Artículo en kblip.com](https://kblip.com/releases/tiel-coder-35b-a3b-mlx-oq4e-hits-121-4-tok-s-in-local-vxY0vy9)
- [Artículo en baguaai.com](https://baguaai.com/tielcoder-the-new-35b-moe-benchmark-redefining-local-sota-coding-performance/)

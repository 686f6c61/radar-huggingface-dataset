# textclf/Qwen3-Coder-Next-TQ-4bit

## Resumen

Qwen3-Coder-Next es un modelo de lenguaje de 80.000 millones de parametros en arquitectura MoE con solo 3.000 millones activos, desarrollado por el equipo Qwen (Alibaba) especificamente para agentes de codigo y desarrollo local. Esta ficha cubre la variante cuantizada a 4 bits (TQ-4bit) publicada por el usuario textclf en HuggingFace, que reduce el peso del modelo a aproximadamente 41,7 GB manteniendo la licencia Apache 2.0.

El modelo combina una arquitectura hibrida con capas Gated DeltaNet y Gated Attention distribuidas en 48 capas, 512 expertos (10 activos mas 1 compartido) y una ventana de contexto nativa de 262.144 tokens. Su diseno permite un rendimiento comparable a modelos con 10-20 veces mas parametros activos, lo que lo hace especialmente eficiente para despliegue de agentes de codigo en entornos de produccion.

La version cuantizada TQ-4bit es compatible con el ecosistema transformers, vLLM, SGLang, Ollama, LM Studio y llama.cpp, y esta orientada a integracion con IDEs y CLI como Claude Code, Qwen Code, Qoder, Trae o Cline. El modelo solo soporta modo no-thinking y no genera bloques de razonamiento en su salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida con Gated DeltaNet y Gated Attention (48 capas, layout 12 x (3 x (Gated DeltaNet -> MoE) -> 1 x (Gated Attention -> MoE))) |
| Parametros totales | 80.000 millones (80B) segun model card; los metadatos de safetensors indican 752.270.080, posiblemente correspondiente a un shard parcial |
| Parametros activos | 3.000 millones (3B) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | TQ-4bit (cuantizacion de 4 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-Coder-Next emplea una arquitectura causal MoE hibrida con 48 capas organizadas en un patron repetitivo: por cada bloque de 4 capas, las 3 primeras combinan Gated DeltaNet (atencion lineal con 32 cabezas V y 16 cabezas QK, dimension de cabeza 128) seguidas de una capa MoE, y la cuarta combina Gated Attention (16 cabezas Q y 2 cabezas KV, dimension de cabeza 256, RoPE de dimension 64) seguida de otra capa MoE. El bloque MoE contiene 512 expertos con 10 activos y 1 compartido, con dimension intermedia de 512.

El entrenamiento comprende fases de pretraining y post-training, con una receta especifica orientada a capacidades agenciales: razonamiento de horizonte largo, uso complejo de herramientas y recuperacion ante fallos de ejecucion. El modelo no soporta modo thinking y no genera bloques de razonamiento en su salida, lo que simplifica su integracion en pipelines de agentes. La cuantizacion TQ-4bit aplicada por textclf reduce el peso a 41,7 GB sin modificar la arquitectura subyacente.

## Capacidades

- Generacion de codigo y completado en multiples lenguajes de programacion, con soporte para contextos largos de hasta 256K tokens.
- Razonamiento de horizonte largo (long-horizon reasoning) para tareas agenciales complejas que requieren multiples pasos.
- Tool calling y function calling avanzado, con parser especifico `qwen3_coder` para vLLM y SGLang.
- Recuperacion ante fallos de ejecucion: el modelo puede detectar errores en la ejecucion de codigo y corregir su estrategia.
- Integracion con multiples scaffolds de agentes: Claude Code, Qwen Code, Qoder, Kilo, Trae y Cline.
- Capacidades multilingues: no especificadas en la informacion disponible.
- Modo no-thinking exclusivo: no genera bloques de razonamiento intermedios, lo que reduce latencia en despliegues agenciales.

## Casos de uso

- Agente de codigo autonomo en IDE: el modelo se integra con herramientas como Claude Code o Qwen Code para ejecutar tareas de desarrollo completas, aprovechando su ventana de 256K tokens para mantener el contexto del repositorio y las instrucciones del usuario sin truncamientos.
- Generacion de codigo en pipelines CI/CD: su capacidad de tool calling permite conectarlo a APIs de repositorios y sistemas de build para generar parches, resolver issues y ejecutar tests de forma automatica en cada commit.
- Refactorizacion de codigo legacy: con 256K tokens de contexto, puede analizar proyectos completos y proponer refactorizaciones coherentes, manteniendo la coherencia entre archivos interdependientes.
- Asistente de desarrollo local en equipos reducidos: al requerir solo 3B parametros activos, puede desplegarse en estaciones de trabajo con GPUs de gama alta, ofreciendo asistencia de codigo sin depender de APIs externas.
- Generacion de tests unitarios y de integracion: el modelo puede analizar funciones y clases existentes y generar suites de tests completas, incluyendo casos limite y pruebas de regresion.
- Documentacion automatica de codigo: su capacidad de razonamiento de horizonte largo permite generar documentacion tecnica coherente a partir del codigo fuente, incluyendo ejemplos de uso y advertencias de compatibilidad.
- Resolucion de issues en repositorios open source: el modelo puede analizar reportes de bugs, localizar el codigo responsable y proponer parches, gracias a su entrenamiento en recuperacion ante fallos y uso de herramientas.

## Benchmarks y rendimiento

La model card referencia imagenes de benchmarks (disponibles en el blog oficial de Qwen) que comparan Qwen3-Coder-Next con modelos de mayor tamano, y la documentacion de Unsloth indica que es el modelo con mejor rendimiento para su tamano, comparable a modelos con 10-20 veces mas parametros activos. Sin embargo, los numeros concretos de MMLU, HumanEval, GSM8K o SWE-bench Pro no estan disponibles en la informacion proporcionada. No se inventan datos.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso cuantizado a 4 bits ocupa aproximadamente 41,7 GB, por lo que se recomienda un minimo de 48 GB de VRAM para inferencia con contexto estandar.
- GPUs recomendadas: NVIDIA A100 80GB, H100, A6000 48GB o multiples GPUs en paralelo tensorial (el despliegue oficial sugiere tensor parallel sobre 4 GPUs).
- GPUs de consumo: una RTX 4090 (24 GB) o RTX 5090 (32 GB) no son suficientes para el modelo completo en 4 bits; se necesitarian tecnicas de offloading a CPU o cuantizacion adicional.
- Opciones de despliegue: vLLM (>= 0.15.0) y SGLang (>= 0.5.8) con API compatible con OpenAI; tambien compatible con Ollama, LM Studio, MLX-LM, llama.cpp y KTransformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; el despliegue con tensor parallel en 4 GPUs es la configuracion recomendada por el equipo de Qwen.
- Nota: si se producen errores de memoria (OOM), se recomienda reducir la longitud de contexto a 32.768 tokens.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-Coder-Next (TQ-4bit) | 80B | 3B | 256K | Apache 2.0 | Agentes de codigo, tool calling |
| Qwen3-Coder-30B-A3B-Instruct | 30B | 3B | No disponible | Apache 2.0 | Codigo y agentes, tamano reducido |
| Qwen3-Coder-480B-A35B-Instruct | 480B | 35B | No disponible | Apache 2.0 | Codigo y agentes, maximo rendimiento |

Qwen3-Coder-Next se situa como la opcion intermedia de la familia Qwen3-Coder: ofrece el mismo numero de parametros activos que la variante de 30B pero con un total de 80B, lo que le permite almacenar mas conocimiento en los expertos sin incrementar el coste computacional por token. La variante de 480B ofrece mayor capacidad pero requiere infraestructura de multiples GPUs de alta gama. No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta modo no-thinking: no genera bloques de razonamiento intermedios, lo que puede limitar su capacidad de explicar su proceso de decision en tareas complejas.
- La ventana de contexto de 256K tokens puede provocar errores de memoria (OOM) en hardware limitado; se recomienda reducirla a 32.768 tokens en esos casos.
- Los idiomas soportados no estan especificados en la informacion disponible, por lo que el rendimiento en idiomas distintos del ingles o el chino no esta garantizado.
- La cuantizacion TQ-4bit puede introducir degradacion de precision en tareas de razonamiento numerico o generacion de codigo muy especifico, aunque no se dispone de datos cuantitativos al respecto.
- El repositorio de HuggingFace muestra 0 descargas y 0 likes, lo que indica que es una publicacion reciente sin validacion comunitaria.
- Los metadatos de safetensors indican 752.270.080 parametros, lo que no coincide con los 80B declarados en la model card; es posible que el archivo de pesos este fragmentado en shards o que exista un error en los metadatos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos adicionales del modelo original de Qwen en su repositorio oficial.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/textclf/Qwen3-Coder-Next-TQ-4bit
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Blog oficial de Qwen sobre Qwen3-Coder-Next: https://qwen.ai/blog?id=qwen3-coder-next
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentacion de Unsloth para Qwen3-Coder-Next: https://unsloth.ai/docs/models/qwen3-coder-next
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3-coder-next

# Tostibrown/Qwen3.6-35B-A3B-4bit-textonly

## Resumen
Qwen3.6-35B-A3B-4bit-textonly es un derivado text-only del checkpoint `mlx-community/Qwen3.6-35B-A3B-4bit`, publicado por el usuario Tostibrown. El modelo elimina por completo la torre de visión del Qwen3.6-35B-A3B original, dejando únicamente el módulo de lenguaje. El objetivo es reducir peso muerto y evitar que el stack MLX Swift lo enrute como modelo multimodal (VLM), de modo que cargue directamente como modelo de lenguaje en el servidor de inferencia Mei, diseñado para Apple Silicon. No se trata de un re-entrenamiento ni de una re-cuantización: los pesos de cada tensor retenido son bit a bit idénticos al checkpoint de origen.

La arquitectura es un transformer MoE (Mixture of Experts) con atención híbrida: 40 capas en total, de las cuales 10 son de atención completa y 30 de atención lineal. En cada token se activan aproximadamente 3.000 millones de parámetros de un total de 34.660.610.688, gracias a 256 expertos con top-8 routing y `moe_intermediate_size` de 512. La cuantización se mantiene sin cambios respecto al modelo base: 4-bit afín con group size 64, mientras que las capas de gate y shared_expert_gate se mantienen en 8-bit. El repositorio pesa 19,5 GB y está pensado para ejecutarse en equipos con 32 GB de memoria unificada de Apple Silicon.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (10 de 40 capas con atención completa, 30 con atención lineal), 256 expertos, top-8 routing, hidden size 2048 |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3.000 millones (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afín (group size 64), con capas mlp.gate y mlp.shared_expert_gate en 8-bit |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

Nota: la longitud de contexto no aparece documentada en la información proporcionada. El ejemplo de uso de la model card muestra el parámetro `--context-cap 65536`, que es un límite configurable del servidor Mei, no necesariamente el contexto máximo del modelo.

## Arquitectura y entrenamiento
El modelo mantiene exactamente la arquitectura de lenguaje del Qwen3.6-35B-A3B-4bit original. El text tower está intacto: 40 capas, 256 expertos, top-8 routing, `moe_intermediate_size` 512, `full_attention_interval` 4 (lo que implica 10 capas de atención completa y 30 capas de atención lineal), hidden size 2048 y un vocabulario de 248.320 tokens. La atención lineal reduce sustancialmente el tamaño de la caché KV en contextos largos: solo 10 de las 40 capas mantienen una caché KV convencional, mientras que las otras 30 utilizan estado recurrente de tamaño fijo.

El proceso de conversión elimina 333 tensores correspondientes a la torre de visión (851,8 MiB) y suprime la clave `vision_config` del `config.json`. Esta eliminación es funcional, no meramente cosmética: en el stack MLX Swift, la ausencia de `vision_config` evita que el paquete se enrute a la factoría de modelos VLM y permite que la factoría de modelos de lenguaje lo cargue directamente. Además, el repositorio elimina los sidecars de visión (`preprocessor_config.json`, `processor_config.json` y `video_preprocessor_config.json`), mientras que el tokenizer, la plantilla de chat y `generation_config.json` permanecen sin cambios. No hay evidencia de que se haya realizado entrenamiento adicional, RLHF o DPO en esta derivación; los pesos del módulo de lenguaje son bit a bit idénticos al checkpoint upstream.

## Capacidades
- Generación de texto conversacional y secuencial, tal como se deriva del uso previsto en un servidor de inferencia para agentes de texto.
- Razonamiento y tareas de agente de código: la model card menciona explícitamente el uso para "text/coding agent work", lo que sugiere que el modelo está pensado para tareas de código y razonamiento.
- Chat con plantilla de conversación: el tokenizer, la plantilla de chat y `generation_config.json` permanecen intactos, por lo que mantiene el formato de instrucciones del modelo base.
- No admite entrada de imagen ni vídeo: la torre de visión ha sido eliminada, no deshabilitada. No es posible recuperar esa capacidad con este checkpoint.
- No se documentan en la información proporcionada capacidades específicas de tool calling, function calling, ni soporte explícito de agentes multi-step.

## Casos de uso
- Servidor de inferencia local en Apple Silicon: el checkpoint está diseñado para cargarse con Mei, un servidor de inferencia nativo en Swift/MLX. En una máquina de 32 GB, los 18,17 GiB de pesos dejan margen para la caché KV y la sobrecarga del tiempo de ejecución.
- Agentes de código en entornos de desarrollo: el modelo se usa como motor de texto/código en tareas de agente, donde la entrada es exclusivamente textual y la torre de visión sería un peso muerto.
- Chat interactivo en aplicaciones de escritorio con modelos MoE eficientes: al activar solo ~3B parámetros por token, reduce la carga computacional y la memoria respecto a un modelo denso de 35B.
- Reemplazo de modelos VLM por modelos text-only en pipelines donde el procesamiento de imágenes no es necesario: el interesado puede ahorrar ~851,8 MiB y simplificar el enrutado del `config.json`.
- Prototipado y pruebas de modelos MoE con atención híbrida en MLX: la arquitectura de 30 capas de atención lineal mantiene una caché KV pequeña en contextos largos, lo que resulta útil para experimentar con ventanas de contexto amplias.
- Despliegue de modelos de lenguaje con cuantización agresiva en hardware con memoria limitada: la combinación de 4-bit con 3B activos permite que el modelo funcione en un Mac de 32 GB sin necesidad de una GPU dedicada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Memoria: aproximadamente 18,2 GiB de pesos para el modelo cuantizado. La model card indica que está dimensionado para una máquina con 32 GB de RAM unificada, quedando espacio para la caché KV y la sobrecarga.
- Plataforma: Apple Silicon. El formato es MLX/Safetensors, por lo que no se trata de un checkpoint GGUF ni de un formato compatible con CUDA.
- GPU recomendada: equipos Apple Silicon (chips de la serie M) con 32 GB o más de memoria unificada.
- Opciones de despliegue: servidor Mei (https://github.com/tijs/mei) con el comando documentado; también puede cargarse en cualquier stack de generación de texto MLX que soporte la arquitectura `qwen3_5_moe`.
- Latencia y throughput: no disponibles en la información proporcionada.
- La caché KV se mantiene reducida en contextos largos por diseño: solo 10 de las 40 capas usan caché KV convencional, mientras que las 30 capas de atención lineal emplean estado recurrente de tamaño fijo.

## Comparativa con modelos similares
| Parametro | Tostibrown/Qwen3.6-35B-A3B-4bit-textonly | mlx-community/Qwen3.6-35B-A3B-4bit | Qwen3.6-27B-Dense |
|---|---|---|---|
| Arquitectura | Transformer MoE híbrido, 40 capas | Transformer MoE híbrido + torre de visión | Dense (según nombre) |
| Parametros totales | 34.660.610.688 | no disponible | no disponible |
| Parametros activos | ~3.000 millones | ~3.000 millones | 27.000 millones (todos activos) |
| Longitud de contexto | no disponible | no disponible | no disponible |
| Vision | No (eliminada) | Sí | no disponible |
| Tamaño de pesos | 18,17 GiB | 19,00 GiB | no disponible |
| Licencia | Apache-2.0 | Apache-2.0 | no disponible |
| Disponibilidad | HuggingFace, MLX | HuggingFace, MLX | no disponible |

Los datos de Qwen3.6-27B-Dense provienen de la nomenclatura del artículo de insiderllm, pero no se han verificado en la información de la model card, por lo que se marcan como no disponibles cuando no se dispone de confirmación.

## Limitaciones y advertencias
- Eliminación irreversible de la capacidad de visión: las entradas de imagen y vídeo no funcionan con este checkpoint. Los pesos de la torre de visión se han eliminado por completo, no se han deshabilitado, por lo que no hay forma de reactivarlos.
- No es un re-entrenamiento ni una re-cuantización: cualquier problema de comportamiento o alucinación del modelo base se traslada íntegramente a esta derivación.
- No es un lanzamiento oficial ni de Qwen ni de mlx-community: el repositorio contribuye únicamente con la eliminación de la torre de visión y una verificación de integridad.
- Riesgo inherente de alucinación: no se aportan evaluaciones de seguridad ni de alineación para esta variante, por lo que se recomienda probar el modelo en el caso de uso específico antes de desplegarlo en producción.
- Idiomas no documentados: los metadatos de HuggingFace indican que los idiomas soportados no están disponibles, lo que limita la confianza en entornos multilingües.
- Longitud de contexto no documentada: no se ha publicitado el contexto máximo del modelo, aunque el ejemplo de uso sugiere un límite de 65.536 tokens configurable en Mei.
- Dependencia del ecosistema MLX: el formato safetensors/MLX no es directamente portable a entornos CUDA o a runtimes como llama.cpp sin conversión adicional.

## Enlaces
- HuggingFace del modelo: https://huggingface.co/Tostibrown/Qwen3.6-35B-A3B-4bit-textonly
- Repositorio del modelo base: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-4bit
- Proyecto Mei (servidor de inferencia Swift/MLX): https://github.com/tijs/mei
- Guía para ejecutar Qwen3.6-35B-A3B localmente: https://tinyweights.dev/posts/run-qwen3-6-35b-a3b-locally/
- Guía general de Qwen 3.6 (27B dense y 35B-A3B MoE): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/

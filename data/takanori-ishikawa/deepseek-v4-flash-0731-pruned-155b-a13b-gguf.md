# takanori-ishikawa/DeepSeek-V4-Flash-0731-Pruned-155B-A13B-GGUF

## Resumen

DeepSeek-V4-Flash-0731-Pruned-155B-A13B-GGUF es una derivación no oficial de DeepSeek-V4-Flash-0731, creada por el desarrollador independiente takanori-ishikawa mediante poda de expertos (expert pruning). El objetivo principal es que el modelo quepa por completo en la memoria unificada de un Mac mini M4 Pro de 64 GB, algo imposible con el checkpoint original sin podar, que obligaba a hacer streaming desde SSD con degradación severa del rendimiento. La poda reduce los expertos enrutados de 256 a 128 en las 40 capas MoE del backbone, manteniendo los 256 expertos originales en las tres primeras capas "hash". El resultado son ~155, 5 mil millones de parámetros totales con ~13 mil millones activos por token, cuantizados en IQ3_XXS.

El proyecto incluye dos builds: el principal, que requiere un pequeño parche de llama.cpp para cargar un número de expertos por capa distinto, y una variante ZP256 compatible con llama.cpp vanilla que "anula" los expertos no seleccionados mediante sesgos de router negativos y pesos a cero. Además, se proporciona un modelo draft de 2,9 mil millones de parámetros para decodificación especulativa (DSpark), que acelera la generación hasta 21,2 tokens por segundo en contexto corto y entre 14,3 y 16,6 t/s en contextos de agente de 8k–32k+ tokens. El autor reporta un 72,0% de resolución en un subconjunto de 50 instancias de SWE-bench Verified ejecutado de forma agéntica en esa única máquina.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con capas hash; derivada de DeepSeek-V4-Flash-0731 |
| Parametros totales | 155.464.571.991 (~155,5 B) |
| Parametros activos | ~13 B por token |
| Longitud de contexto | 1M tokens (según modelo base; no verificado en el pruned) |
| Tipos de cuantizacion | IQ3_XXS (única) |
| Idiomas soportados | no disponible (el modelo base es multilingüe) |
| Licencia | MIT (pesos); la marca "DeepSeek" no está cubierta |
| Formato de pesos | GGUF (2 shards para el build principal, 3 para el ZP256) |

## Arquitectura y entrenamiento

La arquitectura es una MoE derivada de DeepSeek-V4-Flash-0731, que a su vez es un modelo MoE con 284 B de parámetros totales y 13 B activos. El pruning elimina físicamente 128 de los 256 expertos de las 40 capas MoE del backbone, dejando intactas las tres primeras capas "hash" que usan tablas de enrutamiento fijas. Los bytes cuantizados son cortes exactos de los shards de unsloth (UD-IQ3_XXS), sin dequantización ni requantización, por lo que no se introduce pérdida de cuantización adicional. El imatrix de calibración se calculó para el modelo sin podar, por lo que su optimalidad tras la poda no se ha evaluado.

El modelo no ha sido entrenado ni fine-tuneado; se trata de una poda estructural que modifica el grafo de enrutamiento. Para el build principal, el loader de llama.cpp necesita un parche que lee una clave de metadatos `deepseek4.hash_layer_expert_count` para cargar un número de expertos distinto por capa. El build ZP256, en cambio, mantiene la estructura del base y desactiva los expertos no seleccionados mediante un valor muy negativo en el bias del router y pesos de cero, lo que permite ejecutarlo en llama.cpp vanilla.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base DeepSeek-V4-Flash-0731.
- Capacidad agéntica: el autor reporta un 72,0% de resolución en un subconjunto de 50 instancias de SWE-bench Verified ejecutado de forma autónoma.
- Soporte de decodificación especulativa mediante un modelo draft de 2,9 B (DSpark), que acelera la generación entre 3 y 4 veces frente al base sin podar en la misma máquina.
- Enrutamiento de expertos con capas hash de enrutamiento fijo en las tres primeras capas, lo que permite un prefill rápido (99–126 t/s en contexto de 12k tokens).
- Compatibilidad con llama.cpp parcheado (build principal) y con llama.cpp vanilla (build ZP256).
- Capacidades multilingües del base no verificadas específicamente en este pruned.

## Casos de uso

- **Desarrollo de agentes autónomos en hardware de consumo**: el build principal cabe por completo en la GPU unificada de un Mac mini M4 Pro de 64 GB, permitiendo ejecutar agentes de software con razonamiento multi-paso y contexto largo (8k–32k tokens) a 14–17 t/s, suficiente para tareas de resolución de incidencias en repositorios.
- **Resolución de tareas de SWE-bench en local**: el modelo resuelve el 72% de un subconjunto de SWE-bench Verified en una sola máquina, lo que lo hace útil para pruebas de integración de agentes de código sin depender de GPUs de centro de datos.
- **Asistente de programación con contexto largo**: con ventana de contexto de 1M tokens (heredada del base), puede procesar repositorios completos y mantener conversaciones de depuración multi-turno.
- **Servicio de inferencia en Macs Apple Silicon**: el build ZP256 puede ejecutarse en llama.cpp vanilla, aunque con menor rendimiento (~7,8 t/s), lo que lo hace viable para despliegues en equipos sin parche.
- **Generación de código con decodificación especulativa**: el modelo draft de 2,9 B permite acelerar la generación de código en producción en hardware limitado, con velocidades de hasta 21,2 t/s en contexto corto.
- **Investigación en poda de MoE**: sirve como caso de estudio de poda de expertos con preservación de pesos, útil para investigar el impacto de la reducción de expertos en modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) específicos para este pruned. Los únicos datos disponibles son los del autor:

| Benchmark / métrica | Resultado |
|---|---|
| SWE-bench Verified (subconjunto de 50 instancias, agéntico) | 72,0% (36/50) |
| Decode (contexto corto, build principal) | hasta 21,2 t/s |
| Decode (contexto 8k–32k, build principal) | 14,3–16,6 t/s (mediana) |
| Prefill (contexto 12k, build principal) | 99–126 t/s |
| Decode (build ZP256, vanilla llama.cpp) | ~7,8 t/s |
| Decode (base sin podar, mejor config en la misma máquina) | ~4 t/s |
| Prefill (base sin podar, mejor config) | ~33 t/s |

## Requisitos de hardware

- **GPU objetivo**: GPU unificada de 64 GB en un Mac mini M4 Pro (Apple Silicon); la máquina de desarrollo y medición del autor.
- **VRAM estimada**: ~55 GiB para el build principal (IQ3_XXS); el build ZP256 necesita ~63 GiB tras re-esparsificar, con soporte de mmap.
- **Límite de memoria wired**: es necesario elevar el límite por defecto de macOS con `sudo sysctl iogpu.wired_limit_mb=61440` para que la GPU pueda alojar el modelo completo.
- **GPU compatibles**: solo Apple Silicon con al menos 64 GB de RAM unificada; no se reporta soporte para GPUs NVIDIA/AMD.
- **Opciones de despliegue**: llama.cpp con el parche incluido (build principal); llama.cpp vanilla o cualquier runtime GGUF compatible con el base (build ZP256).
- **Latencia/throughput**: 14–21 t/s de decode y 99–126 t/s de prefill en el hardware objetivo; el ZP256 reduce el decode a ~7,8 t/s.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Decode (en M4 Pro 64GB) |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 284 B | 13 B | 1M tokens | MIT | safetensors/GGUF | ~4 t/s (sin podar, mmap) |
| DeepSeek-V4-Flash-0731-Pruned-155B-A13B (este) | 155,5 B | 13 B | 1M (base, no verificado) | MIT | GGUF (IQ3_XXS) | 14,3–21,2 t/s |
| DeepSeek-V4-Pro-0813 | no disponible | no disponible | no disponible | MIT | GGUF | no disponible |

La comparativa con el base es la más relevante: el poda reduce los parámetros totales a la mitad, mantiene los mismos 13 B activos y multiplica por ~4–5 el rendimiento de decode y por ~3–4 el de prefill en la misma máquina, a costa de una posible pérdida de calidad no cuantificada. No hay datos de comparación con otros modelos MoE del mismo tamaño en la información disponible.

## Limitaciones y advertencias

- **No es un release oficial de DeepSeek**: es una derivación comunitaria sin respaldo ni verificación por parte del creador original. La licencia MIT cubre los pesos, pero no concede derechos de marca sobre el nombre "DeepSeek".
- **Pérdida de calidad no evaluada**: la poda de expertos reduce la capacidad del modelo, pero no se han publicado métricas de calidad estándar (MMLU, HumanEval, etc.) para cuantificar la degradación.
- **Imatrix subóptimo**: el imatrix de calibración de los quantos se calculó para el modelo sin podar; no se ha evaluado si sigue siendo óptimo tras la poda.
- **Requiere parche de llama.cpp**: el build principal no funciona con llama.cpp vanilla; el error `check_tensor_dims` indica que se está usando una versión sin parche.
- **Riesgo de alucinación y sesgos**: no se han evaluado sesgos ni riesgos de alucinación específicos para este pruned; se heredan los del base.
- **Idiomas**: no se han publicado datos sobre los idiomas soportados ni su calidad en este modelo.
- **Contexto de 1M no verificado**: el modelo base tiene ventana de 1M tokens, pero no hay evidencia de que el pruned mantenga ese comportamiento en la práctica.
- **Rendimiento limitado a Apple Silicon**: las mediciones se realizaron únicamente en un Mac mini M4 Pro de 64 GB; no hay datos de rendimiento en otras plataformas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/takanori-ishikawa/DeepSeek-V4-Flash-0731-Pruned-155B-A13B-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Quantos de unsloth: https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF
- Rama de llama.cpp con parche: https://github.com/ishikawa/llama.cpp/tree/DeepSeek-V4-Flash-0731-Pruned-155B-A13B
- Documentación de unsloth sobre DeepSeek-V4: https://unsloth.ai/docs/models/deepseek-v4
- Receta de despliegue en RTX PRO 6000: https://github.com/jacklarmer/deepseek-v4-flash-0731-sm120
- Foro de desarrolladores NVIDIA sobre el GGUF: https://forums.developer.nvidia.com/t/deepseek-v4-flash-0731-gguf-new-model/378829
- Página en Ollama: https://ollama.com/library/deepseek-v4-flash

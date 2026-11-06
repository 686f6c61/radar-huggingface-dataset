# thousandml/Qwen3-8B-CQ-4bit

## Resumen

Qwen3-8B-CQ-4bit es una versión cuantizada en 4 bits del modelo Qwen3-8B-Base de Alibaba (equipo Qwen), publicada por el usuario thousandml en Hugging Face. El modelo base pertenece a la tercera generación de la familia Qwen, una serie de modelos de lenguaje causales densos y MoE orientados a razonamiento, código, matemáticas y diálogo multilingüe. La cuantización reduce drásticamente los requisitos de memoria: el repositorio ocupa 6,0 GB frente a los aproximadamente 16 GB del modelo original en precisión completa.

El objetivo de esta variante es permitir la ejecución de Qwen3-8B en hardware de consumo, manteniendo las capacidades del modelo base: generación de texto conversacional, razonamiento lógico y soporte de más de 100 idiomas. La familia Qwen3 destaca por el cambio fluido entre modo de pensamiento (thinking mode) y modo directo (non-thinking mode) dentro de un mismo modelo.

Cabe señalar que el modelo base es Qwen3-8B-Base, es decir, la versión preentrenada sin el post-entrenamiento de alineación completo de la variante instruct, lo que puede afectar al comportamiento en diálogo y al seguimiento de instrucciones. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Causal LM), GQA |
| Parametros totales | 8,2B (base); 1.244.967.936 parametros en safetensors tras la cuantizacion de 4 bits |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | 4 bits (variante CQ) |
| Idiomas soportados | Mas de 100 idiomas y dialectos (segun la familia Qwen3; no especificado en la model card de esta version) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-8B es un modelo transformer causal denso de 8,2B de parametros (6,95B sin embeddings), con 36 capas y atencion agrupada de consultas (GQA) con 32 cabezas de consulta y 8 de clave-valor. Esta configuracion reduce el ancho de banda de la cache KV y mejora la eficiencia en inferencia con contextos largos. El contexto nativo es de 32.768 tokens, ampliable a 131.072 mediante escalado de frecuencia YaRN.

El modelo base fue entrenado en dos etapas (preentrenamiento y post-entrenamiento) sobre un corpus multilingue masivo, aunque la model card de esta cuantizacion no detalla el numero exacto de tokens. La familia Qwen3 incorpora como innovacion destacada el modo de pensamiento conmutable, en el que el modelo genera un bloque `<think>...</think>` con razonamiento intermedio antes de la respuesta final.

Esta version concreta aplica una cuantizacion de 4 bits etiquetada como CQ (la model card referencia los articulos arXiv 2309.00071 y 2505.09388, probablemente relacionados con la tecnica de cuantizacion empleada). No se ha publicado informacion sobre el metodo exacto de calibracion ni sobre perdidas de calidad asociadas a la cuantizacion.

## Capacidades

- Generacion de texto conversacional y completado de texto (pipeline text-generation).
- Razonamiento logico y matematico en modo thinking, con bloque de razonamiento intermedio delimitado por `<think>...</think>`.
- Cambio entre modo thinking y non-thinking mediante el parametro `enable_thinking` en el chat template.
- Soporte de mas de 100 idiomas y dialectos, con capacidad de instruccion multilingue y traduccion (heredado del modelo base Qwen3).
- Capacidades de agente y uso de herramientas externas en ambos modos, segun las caracteristicas de la familia Qwen3.
- Generacion de codigo, al igual que el resto de la familia Qwen3.
- Al ser una version basada en Qwen3-8B-Base (no instruct), el seguimiento de instrucciones puede ser inferior al de la variante oficial Qwen/Qwen3-8B.

## Casos de uso

- Chatbots y asistentes conversacionales en local: con 6 GB de pesos, el modelo cabe en GPUs de consumo para dialogo multi-turno en castellano y otros idiomas.
- Razonamiento matematico y logico offline: el modo thinking permite resolver problemas paso a paso sin depender de servicios en la nube.
- Generacion y asistencia de codigo en entornos con recursos limitados: puede integrarse en editores locales tipo LM Studio o continuaciones de codigo privadas.
- Prototipado de agentes: compatible con frameworks de agentes gracias al soporte de tool calling de la familia Qwen3, util para experimentacion sin coste de API.
- Procesamiento de documentos largos: con contexto ampliable a 131.072 tokens mediante YaRN, permite resumir y analizar documentos extensos.
- Traduccion y tareas multilingues: aprovechando el soporte de mas de 100 idiomas del modelo base.
- Despliegue en endpoints economicos: el formato 4 bits reduce el coste de VRAM por instancia en servicios de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen3 para evaluaciones del modelo base (Qwen3-8B), pero no existen mediciones especificas de esta cuantizacion CQ de 4 bits, por lo que no se pueden garantizar las mismas puntuaciones que el modelo en precision completa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB solo para los pesos (el repositorio ocupa 6,0 GB), mas memoria para la cache KV, que crece con la longitud de contexto. Con contexto largo puede ser necesario mas VRAM o cuantizacion de la cache KV.
- GPUs recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente para el modelo cuantizado (RTX 3060, RTX 4060 Ti, RTX 4070). Para contextos muy largos o batches grandes, se recomiendan GPUs con 16-24 GB (RTX 4090, A100).
- Cabe en GPUs de consumo: si, a diferencia del modelo original en FP16 (~16 GB), esta version de 4 bits funciona en GPUs de 8 GB.
- Opciones de despliegue: transformers (se requiere version 4.51.0 o superior; versiones anteriores lanzan `KeyError: 'qwen3'`), vLLM (>= 0.8.5), SGLang (>= 0.4.6.post1), llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers. Nota: al ser una cuantizacion no estandar en formato safetensors, la compatibilidad con runtimes concretos debe verificarse caso por caso.
- Latencia y throughput: no disponible. Como referencia, un modelo denso de 8B en 4 bits suele alcanzar decenas de tokens por segundo en GPUs de consumo, pero no hay mediciones publicadas para esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|
| thousandml/Qwen3-8B-CQ-4bit | 8,2B (base) | 32.768 (131.072 con YaRN) | 4 bits (CQ) | Apache 2.0 |
| Qwen/Qwen3-8B (oficial) | 8,2B | 32.768 (131.072 con YaRN) | BF16 | Apache 2.0 |
| Meta-Llama-3-8B-Instruct | 8B | 8.192 | FP16 | Llama 3 Community |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | FP16 | Apache 2.0 |

Frente a Llama-3-8B, Qwen3-8B ofrece un contexto nativo mucho mayor y modo de razonamiento; frente a Mistral-7B, aporta capacidades thinking y soporte multilingue mas amplio. La principal diferencia con el Qwen3-8B oficial es que esta variante parte del modelo Base (no instruct) y aplica una cuantizacion de terceros sin evaluacion publicada.

## Limitaciones y advertencias

- Al basarse en Qwen3-8B-Base y no en la variante instruct, el modelo puede mostrar comportamiento menos alineado en dialogo y seguimiento de instrucciones.
- No existen evaluaciones publicadas de esta cuantizacion: la degradacion de calidad respecto al modelo en precision completa es desconocida.
- En modo thinking no se debe usar decodificacion greedy, segun la documentacion de Qwen3, ya que puede provocar degradacion de rendimiento y repeticiones infinitas; se recomienda Temperature=0,6, TopP=0,95, TopK=20 y MinP=0.
- Como todo LLM, puede alucinar contenido falso, especialmente en hechos y citas; el riesgo es mayor al tratarse de un modelo base sin alineacion completa.
- Los parametros en safetensors (1,24B) reflejan el almacenamiento cuantizado, no el numero real de parametros del modelo (8,2B), lo que puede confundir al cargar el modelo con librerias que asuman precision completa.
- Requiere transformers >= 4.51.0 para funcionar con la arquitectura qwen3.
- La popularidad del repositorio es muy baja (30 descargas y 1 like en el momento de la ficha), por lo que carece de validacion comunitaria; para produccion se recomienda priorizar el modelo oficial Qwen/Qwen3-8B.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thousandml/Qwen3-8B-CQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Modelo oficial Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Demo de chat: https://chat.qwen.ai/
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Articulo arXiv referenciado: https://arxiv.org/abs/2309.00071
- Articulo arXiv referenciado: https://arxiv.org/abs/2505.09388

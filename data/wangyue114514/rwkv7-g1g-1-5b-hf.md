# wangyue114514/rwkv7-g1g-1.5b-hf

## Resumen

RWKV-7 G1G 1.5B es un modelo de lenguaje recurrente de la familia RWKV-7 "Goose", convertido al formato Hugging Face Transformers a partir del checkpoint original `rwkv7-g1g-1.5b-20260526-ctx8192.pth` publicado por BlinkDL. Esta conversión, realizada por el usuario wangyue114514, ofrece una integración limpia con el ecosistema `transformers` mediante un diseño "thin" que delega la implementación real al paquete `rwkv7-hf`, evitando duplicar código en el repositorio del modelo.

El modelo pertenece a la subfamilia G1G, que según la documentación oficial representa la mayor calidad de datos de entrenamiento dentro de la serie G1 (G1g > G1f > G1e > ...). Con 1.527 millones de parámetros y una ventana de contexto de 8.192 tokens, está pensado para ejecutarse en hardware modesto manteniendo las ventajas arquitectónicas de RWKV: inferencia en tiempo lineal, uso de memoria constante (sin KV-cache) y capacidad de procesamiento paralelo durante el entrenamiento. Es un modelo puramente preentrenado, sin fine-tuning supervisado ni RLHF, lo que lo convierte en una base adecuada para tareas de adaptación posterior.

La relevancia actual de este modelo radica en su carácter recurrente, que lo diferencia de los transformers dominantes. RWKV combina la eficiencia de las RNN con el rendimiento de los LLM, y es un proyecto respaldado por la Linux Foundation AI. Esta conversión a Hugging Face facilita su uso en pipelines estándar de `transformers`, ampliando su accesibilidad para desarrolladores e investigadores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 recurrente causal LM (RNN con atención lineal) |
| Parametros totales | 1.527.404.544 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (según checkpoint original) |
| Tipos de cuantizacion | FP16 en el repo; existen versiones GGUF externas (Q4_K_M, Q5_K_M, etc.) |
| Idiomas soportados | no disponible (el modelo original de RWKV suele ser multilingüe, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (6 shards + index) |

## Arquitectura y entrenamiento

RWKV-7 es una arquitectura recurrente pura, sin capas de atención tradicionales. Combina mecanismos de estado oculto tipo RNN con operaciones paralelizables durante el entrenamiento, logrando complejidad lineal en tiempo y espacio constante en inferencia (sin KV-cache). El modelo G1G 1.5B tiene 24 capas, tamaño oculto de 2048 y un vocabulario de 65.536 tokens. La conversión HF utiliza el paquete `rwkv7-hf==0.7.0` para las implementaciones optimizadas, manteniendo solo los pesos y configuraciones en el repositorio.

El entrenamiento se realizó sobre datos de la serie G1G, considerada la de mayor calidad dentro de la familia G1. Según el artículo de Zhihu citado, los modelos RWKV-7 G son preentrenados puros, sin entrenamiento supervisado ni post-entrenamiento (RLHF/DPO). No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni la composición del dataset. La ventana de entrenamiento es de 8.192 tokens, aunque la arquitectura RWKV permite extender el contexto de forma natural más allá de ese límite.

## Capacidades

- Generación de texto autónoma: al ser un modelo causal de lenguaje, puede generar texto coherente y continuar secuencias de forma libre.
- Razonamiento básico: como modelo base de 1.5B, presenta capacidades limitadas de razonamiento lógico y matemático, propias de su tamaño.
- Procesamiento de contexto largo: gracias a su arquitectura recurrente, puede manejar secuencias largas con uso de memoria constante, superando en eficiencia a los transformers equivalentes.
- Multilingüismo potencial: aunque no se documentan idiomas concretos, los modelos RWKV suelen entrenarse con datos multilingües; se recomienda verificar en la práctica.
- Embeddings de texto gratuitos: RWKV ofrece representaciones vectoriales de frases sin necesidad de capas adicionales (según la web oficial).
- Base para fine-tuning: al carecer de ajuste supervisado, es adecuado para adaptarse a tareas específicas mediante fine-tuning.
- Sin soporte nativo de tool calling ni agentes: al ser un modelo base preentrenado, no incluye capacidades de function calling ni razonamiento multi-paso entrenado explícitamente.

## Casos de uso

- Generación de contenido creativo: el modelo puede producir textos narrativos, poéticos o técnicos con un estilo coherente, sirviendo como base para asistentes de escritura o generación de borradores.
- Fine-tuning para clasificación de texto: su tamaño moderado permite adaptarlo a tareas como análisis de sentimiento o categorización de documentos con recursos de cómputo limitados.
- Chatbots de dominio específico: tras un fine-tuning con datos conversacionales, puede emplearse en asistentes virtuales para atención al cliente o soporte interno.
- Procesamiento de documentos largos: gracias a su memoria constante, es adecuado para resumir o extraer información de textos extensos (artículos, informes) sin degradación por longitud.
- Educación y experimentación: su licencia Apache-2.0 y su arquitectura recurrente lo convierten en una herramienta didáctica para estudiar alternativas a los transformers.
- Desarrollo de aplicaciones edge: al caber en GPUs de gama media o incluso en CPU con cuantización, puede integrarse en sistemas embebidos o entornos sin aceleración GPU.
- Investigación en arquitecturas recurrentes: sirve como punto de partida para comparar rendimiento entre RWKV y modelos transformer del mismo tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Se recomienda consultar el repositorio original de BlinkDL para posibles actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - FP16: ~3,1 GB (pesos) + overhead de activaciones → ~4 GB en total.
  - Cuantización int8: ~1,6 GB.
  - Cuantización int4: ~0,8 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, GTX 1660 Super) para FP16. Para cuantización, puede ejecutarse en GPUs de 2 GB o incluso en CPU.
- El modelo cabe en GPUs de consumo actuales y también en placas de gama baja.
- Opciones de despliegue:
  - `transformers` con el paquete `rwkv7-hf` (carga directa desde Hugging Face).
  - `llama.cpp` mediante las versiones GGUF publicadas por la comunidad (por ejemplo, `erenyeager-1/RWKV7-G1g-1.5B-GGUF`).
  - `vLLM` o `TGI` no están confirmados para esta arquitectura, aunque el soporte de RWKV en estos servidores está en desarrollo.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño y la arquitectura recurrente, se espera una latencia baja en secuencias largas comparada con transformers del mismo tamaño, pero los datos concretos no están disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RWKV-7 G1G 1.5B | 1,53B | 8.192 | RNN recurrente | Apache-2.0 | Hugging Face, GGUF |
| Qwen2.5-1.5B | 1,54B | 32.768 | Transformer | Apache-2.0 | Hugging Face |
| Gemma-2-2B | 2,61B | 8.192 | Transformer | Gemma license | Hugging Face |
| Llama-3.2-1B | 1,23B | 128.000 | Transformer | Llama 3.2 license | Hugging Face |

La comparación se basa en especificaciones técnicas, no en rendimiento medido, ya que no hay benchmarks públicos para el modelo RWKV. La principal diferencia es la arquitectura: RWKV ofrece eficiencia en memoria constante y tiempo lineal, mientras que los transformers requieren KV-cache y tienen coste cuadrático en contexto largo. Sin embargo, los transformers suelen tener mejor rendimiento en tareas de razonamiento complejo a igual tamaño, aunque esto no está verificado en este caso.

## Limitaciones y advertencias

- Modelo base sin fine-tuning: no está alineado con instrucciones ni optimizado para diálogo, por lo que puede generar respuestas no deseadas o fuera de tema si se usa directamente en aplicaciones conversacionales.
- Sesgos y alucinaciones: al ser un modelo preentrenado con datos web, puede reflejar sesgos presentes en esos datos y producir información falsa o inventada con alta confianza.
- Contexto limitado: aunque la arquitectura permite extender el contexto, el entrenamiento se realizó con 8.192 tokens; usos más allá de ese límite pueden degradar la coherencia.
- Idiomas no documentados: no se especifican los idiomas soportados; el rendimiento en lenguas distintas del inglés puede ser inferior.
- Dependencia de paquete externo: la conversión requiere instalar `rwkv7-hf==0.7.0`, lo que añade una dependencia adicional y potenciales problemas de compatibilidad con versiones futuras.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se debe mantener el aviso de licencia y atribución.
- Sin garantías de rendimiento: al no haber benchmarks publicados, el rendimiento real en tareas específicas es incierto y requiere evaluación propia.

## Enlaces

- Repositorio Hugging Face: [wangyue114514/rwkv7-g1g-1.5b-hf](https://huggingface.co/wangyue114514/rwkv7-g1g-1.5b-hf)
- Checkpoint original: [BlinkDL/rwkv7-g1](https://huggingface.co/BlinkDL/rwkv7-g1)
- Versión GGUF comunitaria: [erenyeager-1/RWKV7-G1g-1.5B-GGUF](https://huggingface.co/erenyeager-1/RWKV7-G1g-1.5B-GGUF)
- Web oficial de RWKV: [https://www.rwkv.com/](https://www.rwkv.com/)
- Repositorio GitHub RWKV-LM: [https://github.com/BlinkDL/RWKV-LM](https://github.com/BlinkDL/RWKV-LM)
- Paquete PyPI `rwkv7-hf`: [https://pypi.org/project/rwkv7-hf/0.7.0/](https://pypi.org/project/rwkv7-hf/0.7.0/)
- Adapter repository: [https://github.com/rwkv-rs/hf-adapter](https://github.com/rwkv-rs/hf-adapter)
- Artículo de Zhihu sobre RWKV-7 G1g: [https://zhuanlan.zhihu.com/p/2048762009949409869](https://zhuanlan.zhihu.com/p/2048762009949409869)

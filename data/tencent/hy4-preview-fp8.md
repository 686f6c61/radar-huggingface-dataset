# tencent/Hy4-preview-FP8

## Resumen

Hy4 preview es un modelo de lenguaje de nueva generación con arquitectura de mezcla de expertos (MoE) desarrollado por el equipo Tencent Hy. Se publica en dos variantes: la versión base en precisión completa y esta versión cuantizada en FP8, que reduce el tamaño del repositorio a 813,8 GB manteniendo la misma arquitectura. El modelo está diseñado para tareas de productividad profesional —ingeniería de software, análisis de oficina, desarrollo de juegos e investigación científica— y se posiciona como un modelo de frontera en el ecosistema open source.

La versión FP8 está disponible en Hugging Face bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. El backbone cuenta con 770 mil millones de parámetros totales (49 mil millones activos por token) y una ventana de contexto de 1 millón de tokens, una de las más amplias entre los modelos abiertos. Incluye además una capa MTP (Multi-Token Prediction) nativa de 10 mil millones de parámetros para decodificación especulativa, lo que acelera la generación.

Su relevancia actual radica en combinar un contexto extremadamente largo, una arquitectura eficiente con atención dispersa (Gated DSA) y un rendimiento competitivo frente a otros modelos abiertos de gran escala como GLM 5.3 y Kimi K3, según evaluaciones ciegas realizadas por expertos internos de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención Gated DSA |
| Parametros totales | 803,5 mil millones (según safetensors del repo FP8); 770 mil millones backbone + 10 mil millones MTP según model card |
| Parametros activos | 49 mil millones backbone + 0,7 mil millones MTP (aprox. 49,7 mil millones) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (esta version); la version base no cuantizada tambien esta disponible |
| Idiomas soportados | No disponible (no se especifica en la documentacion oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El backbone de Hy4 preview consta de 78 capas: la primera utiliza una FFN densa estándar y las 77 restantes emplean MoE con 256 expertos enrutados y 1 experto compartido. Cada token activa los 8 expertos enrutados principales más el experto compartido. El tamaño oculto es de 6144 y la capa MoE tiene un tamaño intermedio de 2048. La atención se implementa mediante Gated DeepSeek Sparse Attention (Gated DSA), inspirada en DeepSeek y GLM, con IndexCache para reutilización de índices dispersos entre capas. El residual pathway utiliza identity Hyper-Connections (iHC) para ampliar el flujo de información entre capas. Además, se incluye una capa MTP nativa (10 mil millones de parámetros, 0,7 mil millones activos) que permite decodificación especulativa.

No se han publicado en la información disponible datos concretos sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO, etc.). La documentación indica que el modelo se escaló en tres frentes —tamaño, longitud de contexto y datos de entrenamiento— y que el post-entrenamiento fue sustancialmente mayor que en generaciones anteriores, pero sin cifras específicas.

## Capacidades

- Generación de texto y razonamiento complejo en tareas de larga duración, con especial énfasis en comprensión, planificación, depuración y verificación de proyectos de desarrollo de software.
- Análisis de datos y ofimática: procesa contexto desordenado distribuido en múltiples archivos y lo convierte en artefactos compartibles como documentos, hojas de cálculo y presentaciones, con precisión en ecuaciones y modelos financieros.
- Desarrollo de juegos: convierte un prompt único en un prototipo jugable y trabaja con motores de juego en conversaciones multi-turno.
- Investigación científica: comprensión y resolución de problemas en áreas como IA, dinámica molecular, física de materia condensada y matemáticas puras.
- Soporte de decodificación especulativa mediante la capa MTP integrada, lo que acelera la generación sin necesidad de un modelo auxiliar externo.
- Capacidades multilingües: no se especifican oficialmente, aunque por su origen y uso general se presume soporte de múltiples idiomas, sin confirmación.

No se menciona explícitamente soporte de tool calling, function calling ni capacidades de agente en la documentación proporcionada, aunque el enfoque en tareas de ingeniería sugiere que podría tenerlas; no hay confirmación oficial.

## Casos de uso

- Desarrollo de software a largo plazo: el modelo puede gestionar tareas de programación complejas que requieren entender, planificar, depurar y verificar código en múltiples archivos y a lo largo de muchas iteraciones, gracias a su contexto de 1M tokens y su entrenamiento orientado a ingeniería.
- Generación de informes financieros y análisis de datos: convierte datos desordenados de múltiples fuentes en documentos estructurados, hojas de cálculo y presentaciones, con precisión en cálculos y modelos financieros.
- Prototipado rápido de juegos: a partir de un prompt textual, genera un prototipo jugable y permite iterar sobre él con el motor de juego, útil para game designers y desarrolladores independientes.
- Asistencia en investigación científica: ayuda a razonar sobre problemas complejos en matemáticas, física o biología computacional, proporcionando explicaciones y posibles enfoques de solución.
- Atención al cliente con contexto largo: gracias a su ventana de 1M tokens, puede mantener conversaciones multi-turno con historial extenso y documentos de referencia, aunque no se confirma soporte de tool calling para integración con APIs.
- Automatización de tareas de oficina: procesa correos, actas, datos y contratos para generar resúmenes, propuestas o presentaciones, reduciendo el trabajo manual en entornos corporativos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La documentación incluye una evaluación ciega side-by-side realizada por 163 expertos internos de Tencent sobre 203 tareas de ingeniería, comparando Hy4 preview con otros dos modelos:

| Modelo | Puntuacion media | Victorias | Empates | Derrotas |
|---|---|---|---|---|
| Hy4 preview | 2,99 | — | — | — |
| GLM 5.3 | 2,92 | 46,8% | 12,8% | 40,4% |
| Kimi K3 | 2,94 | 51,2% | 7,9% | 40,9% |

Estos resultados indican que Hy4 preview supera ligeramente a ambos competidores en tareas de ingeniería según la evaluación interna, aunque no se detalla la metodología completa ni la significancia estadística.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP8 (1 byte por parámetro), se necesitan aproximadamente 800 GB de VRAM solo para los pesos del modelo, más overhead de activaciones y KV cache. En la práctica, se requieren múltiples GPUs.
- GPU recomendadas: un clúster de al menos 8 GPU H100 de 80 GB o 10 GPU A100 de 80 GB para inferencia en FP8. No cabe en una GPU consumer (RTX 4090, etc.).
- Opciones de despliegue: la documentación oficial menciona soporte para vLLM y SGLang, además de compatibilidad con transformers. También se referencia despliegue en plataformas como ModelScope y GitCode.
- Latencia y throughput: no se han publicado datos oficiales. Con decodificación especulativa vía MTP, se espera una aceleración significativa respecto a modelos sin esta técnica, pero sin cifras concretas.

## Comparativa con modelos similares

Según la evaluación ciega interna, Hy4 preview es comparable a GLM 5.3 y Kimi K3, ambos modelos MoE de gran escala. No se dispone de especificaciones técnicas detalladas de estos competidores en la información proporcionada, por lo que la comparativa se limita al rendimiento subjetivo:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Rendimiento (eval. ciega) |
|---|---|---|---|---|---|
| Hy4 preview | 770B backbone + 10B MTP | 49B + 0,7B | 1M | Apache 2.0 | 2,99 |
| GLM 5.3 | No disponible | No disponible | No disponible | No disponible | 2,92 |
| Kimi K3 | No disponible | No disponible | No disponible | No disponible | 2,94 |

No se dispone de más datos comparativos en la información disponible.

## Limitaciones y advertencias

- Es una versión preview (early version) con margen de mejora tanto en pre-entrenamiento como en post-entrenamiento, según los propios desarrolladores.
- La documentación menciona que el modelo tiende a dedicar más tiempo del necesario al razonamiento en tareas complejas, lo que puede traducirse en respuestas más largas y lentas de lo óptimo.
- No se han publicado datos sobre sesgos, alucinaciones o comportamientos indeseados específicos. Como todo modelo de lenguaje grande, existe riesgo de generar información falsa o inventada, especialmente en dominios poco representados en el entrenamiento.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos completos para casos de uso específicos.
- El tamaño del modelo (803 GB en FP8) hace que la inferencia requiera infraestructura de múltiples GPUs, lo que limita su uso a entornos con recursos significativos.
- No se confirma soporte de tool calling o function calling, lo que puede limitar su integración en pipelines de agentes que dependan de llamadas a APIs externas.

## Enlaces

- Modelo en Hugging Face (version FP8): https://huggingface.co/tencent/Hy4-preview-FP8
- Modelo en Hugging Face (version base): https://huggingface.co/tencent/Hy4-preview
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy4-preview
- Pagina oficial del modelo: https://hy.tencent.ai/research/hy4-preview
- Modelo en ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-preview-FP8
- Guia de despliegue con vLLM: https://recipes.vllm.ai/tencent/Hy4-preview
- Paper sobre DeepSeek Sparse Attention: https://arxiv.org/abs/2512.02556
- Paper sobre IndexCache: https://arxiv.org/abs/2603.12201

# tencent/Hy4-preview

## Resumen

Hy4 preview es un modelo de lenguaje de nueva generación desarrollado por el equipo Tencent Hy, la división de inteligencia artificial de Tencent. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 770 mil millones de parámetros totales en su backbone, de los cuales 49 mil millones se activan por token, más una capa MTP (Multi-Token Prediction) adicional de 10 mil millones de parámetros (0,7 mil millones activos) para decodificación especulativa. El modelo está diseñado para tareas de productividad real, como ingeniería de software, análisis de oficina, desarrollo de juegos e investigación científica, y se posiciona como un modelo de frontera en el ecosistema open source.

La arquitectura incorpora innovaciones recientes: atención con Gated DeepSeek Sparse Attention (DSA) con IndexCache para reutilización de índices dispersos entre capas, y conexiones residuales iHC (identity Hyper-Connections) para mejorar el flujo de información inter-capa. Con una ventana de contexto de 1 millón de tokens, Hy4 preview está pensado para manejar documentos extensos y conversaciones de largo recorrido. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas, y está disponible en Hugging Face con pesos en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención Gated DSA |
| Parametros totales | 780B (770B backbone + 10B capa MTP) |
| Parametros activos | 49B por token (backbone) + 0,7B (MTP) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente multilingüe, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Hy4 preview utiliza una arquitectura MoE con 78 capas: la primera capa emplea una FFN densa estándar, mientras que las 77 restantes usan MoE con 256 expertos enrutados y 1 experto compartido. Cada token activa los 8 expertos enrutados superiores más el experto compartido. El tamaño oculto es de 6144, con 64 cabezas de atención. La atención se basa en Gated DeepSeek Sparse Attention (DSA), que combina compresión de consultas y claves (dimensiones 2048 y 512 respectivamente) con un indexador de 32 cabezas y dimensión 128, que selecciona los 2048 tokens más relevantes para el cálculo de atención dispersa. Además, se utiliza IndexCache para reutilizar los índices de tokens dispersos entre capas adyacentes, reduciendo el coste computacional. Las conexiones residuales iHC (identity Hyper-Connections) mantienen 4 flujos residuales paralelos para mejorar la propagación de información.

No se han proporcionado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. La model card indica que el entrenamiento se escaló en tamaño de modelo, longitud de contexto y datos, y que se realizó un post-entrenamiento sustancial, pero sin cifras concretas. La capa MTP integrada permite decodificación especulativa para acelerar la generación.

## Capacidades

- Generación de texto y razonamiento complejo en tareas de ingeniería de software, incluyendo comprensión, planificación, depuración y verificación de tareas de desarrollo de largo alcance.
- Análisis de oficina y productividad: procesa contexto desordenado de múltiples archivos y genera documentos, hojas de cálculo y presentaciones, con precisión en análisis de datos, ecuaciones y modelos financieros.
- Desarrollo de juegos: convierte un prompt simple en un prototipo jugable y trabaja con motores de juego en iteraciones multi-turno.
- Investigación científica: comprensión y resolución de problemas en IA, dinámica molecular, física de la materia condensada y matemáticas puras.
- Soporte de contexto largo de 1M tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidad de decodificación especulativa mediante la capa MTP integrada, que acelera la inferencia.
- No se especifica soporte explícito de tool calling o function calling, aunque por su naturaleza de modelo de texto generativo es probable que lo tenga, pero no está documentado en la información disponible.

## Casos de uso

- Desarrollo de software en producción: el modelo puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y depuración automática, gracias a su capacidad de razonamiento sobre tareas de largo alcance y su contexto de 1M tokens que permite analizar repositorios completos.
- Análisis financiero y de oficina: analiza informes extensos, extrae datos de múltiples hojas de cálculo y genera modelos financieros o presentaciones ejecutivas, reduciendo el tiempo de preparación de documentos complejos.
- Prototipado rápido de juegos: a partir de una descripción textual, genera un prototipo jugable y permite iterar sobre mecánicas, niveles o diálogos en conversaciones multi-turno con el motor de juego.
- Asistente de investigación científica: ayuda a investigadores a revisar literatura, formular hipótesis y resolver problemas matemáticos o de física, manejando artículos largos y datasets extensos dentro de la ventana de contexto.
- Atención al cliente automatizada con contexto largo: puede gestionar conversaciones multi-turno con historial extenso, manteniendo coherencia gracias a su ventana de 1M tokens, ideal para soporte técnico o jurídico con documentación voluminosa.
- Generación de documentación técnica: convierte código fuente o especificaciones dispersas en documentación estructurada, manuales o guías, aprovechando su capacidad de análisis de múltiples archivos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una imagen de benchmarks, pero los valores no están transcritos en el texto. Sin embargo, se menciona una evaluación ciega interna realizada con 163 expertos de Tencent sobre 203 tareas de ingeniería, donde Hy4 preview obtuvo una puntuación media de 2,99 sobre 3, superando ligeramente a GLM 5.3 (2,92) y a Kimi K3 (2,94). En comparaciones por pares, Hy4 preview ganó al 46,8% de las veces contra GLM 5.3 (12,8% empates) y al 51,2% contra Kimi K3 (7,9% empates). Estos datos provienen de una evaluación interna y no son benchmarks públicos estandarizados.

## Requisitos de hardware

- No se proporcionan requisitos exactos de VRAM en la documentación. Dado el tamaño de 780B parámetros totales, se requiere un clúster de GPUs de alta gama para inferencia en precisión completa.
- Con cuantización (por ejemplo, 4 bits), podría caber en sistemas con múltiples GPUs de 80 GB, como 8× H100 o 8× A100, pero no hay datos oficiales.
- El despliegue está soportado oficialmente mediante vLLM y SGLang, según la sección de deployment de la model card.
- Para uso en consumer GPUs (como RTX 4090 con 24 GB), no es viable sin cuantización extrema y offloading, y no se documenta soporte para ello.
- La capa MTP integrada permite decodificación especulativa, lo que puede mejorar el throughput en entornos con suficiente memoria.
- No se especifican valores de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4 preview | 780B | 49B | 1M | Apache 2.0 | Hugging Face, ModelScope |
| GLM 5.3 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información detallada sobre GLM 5.3 y Kimi K3 en los resultados de búsqueda, más allá de la comparación interna mencionada en la model card. Ambos son modelos de la misma categoría (MoE de gran escala) y se utilizaron como referencia en la evaluación ciega, donde Hy4 preview obtuvo resultados ligeramente superiores. No hay datos públicos de parámetros, contexto o licencia para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es una versión preview temprana: la model card indica que hay margen de mejora tanto en pre-entrenamiento como en post-entrenamiento.
- Limitaciones conocidas: el modelo tiende a dedicar más tiempo del necesario a razonar sobre tareas complejas y muestra una tendencia a sobre-verificar sus respuestas, lo que puede afectar a la eficiencia en producción.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de internet y colaboración interna de Tencent, puede heredar sesgos presentes en esos datos.
- Riesgo de alucinación no cuantificado; se recomienda validar las salidas en aplicaciones críticas.
- No se especifican los idiomas soportados, aunque por su origen y uso probablemente cubre chino e inglés, pero no está confirmado.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de atribución y otras cláusulas.
- El tamaño del modelo (780B) implica costes de inferencia significativos; no es adecuado para despliegues en hardware modesto sin cuantización agresiva.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy4-preview
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-preview
- Sitio web oficial: https://hy.tencent.ai/research/hy4-preview
- vLLM Recipes: https://recipes.vllm.ai/tencent/Hy4-preview
- Paper Gated DSA: https://arxiv.org/abs/2512.02556
- Paper IndexCache: https://arxiv.org/abs/2603.12201
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-preview

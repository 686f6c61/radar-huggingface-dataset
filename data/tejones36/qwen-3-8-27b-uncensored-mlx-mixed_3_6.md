# tejones36/Qwen-3.8-27B-Uncensored-mlx-mixed_3_6

## Resumen

Este repositorio contiene los pesos del modelo Qwen-3.8-27B-Uncensored convertidos al formato MLX (Apple Silicon) mediante `mlx-vlm`, con una cuantización mixta de 3 y 6 bits. El modelo base, desarrollado por junafinity, es una versión "uncensored" (abliterated) del Qwen-3.8-27B, un modelo multimodal de visión y lenguaje. La conversión a MLX permite ejecutar este modelo en Macs con memoria unificada de 18 a 24 GB, reduciendo significativamente el uso de VRAM gracias a la cuantización selectiva: las capas de atención y proyecciones críticas se mantienen en 6 bits, mientras que las capas feed-forward se comprimen a 3 bits, logrando una precisión efectiva de aproximadamente 3.6 bits por peso.

El modelo es multimodal, capaz de procesar tanto texto como imágenes, y está diseñado para su uso con la librería `mlx-vlm`, que ofrece interfaz de línea de comandos, servidor compatible con la API de OpenAI y API de Python. Aunque el nombre sugiere 27 mil millones de parámetros, el archivo safetensors indica 4.334.750.960 parámetros, una discrepancia que no se explica en la documentación. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal basado en Qwen, sin detalles de arquitectura interna) |
| Parametros totales | 4.334.750.960 (según safetensors; el nombre sugiere 27B, posible discrepancia) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta 3/6 bits (MLP a 3 bits, atención a 6 bits), group size 64, precisión efectiva ~3.6 bits |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (Qwen-3.8-27B-Uncensored) ni sobre su proceso de entrenamiento. Se sabe que es un modelo multimodal (imagen-texto) y que la versión "uncensored" ha sido sometida a un proceso de "abliteration" (eliminación de capas de rechazo) para reducir las restricciones de contenido. La conversión a MLX no modifica la arquitectura, solo los pesos y su formato. No se han publicado datos sobre el número de tokens de entrenamiento, composición del dataset o técnicas de alineación (RLHF, DPO, etc.).

## Capacidades

- Generación de texto y razonamiento conversacional.
- Análisis y descripción de imágenes (entrada multimodal).
- Soporte de chat multi-turno mediante plantilla de conversación.
- Capacidad de servir como API compatible con OpenAI (a través de `mlx_vlm.server`).
- Al ser una versión "uncensored" (abliterated), presenta menos restricciones de contenido que el modelo original, aunque esto conlleva riesgos (ver limitaciones).
- No se menciona soporte explícito de tool calling, agentes o razonamiento multi-paso en la documentación proporcionada.

## Casos de uso

- Análisis de imágenes en local: el modelo puede describir el contenido visual de una imagen, extraer detalles de composición o responder preguntas sobre ella, todo ello en un Mac con memoria unificada de 18-24 GB.
- Asistente conversacional sin censura: gracias a su naturaleza "uncensored", puede utilizarse para generación creativa de texto, roleplay o exploración de temas que otros modelos rechazan, siempre con las advertencias éticas correspondientes.
- Servidor de chat local: mediante `mlx_vlm.server`, se puede desplegar un endpoint compatible con OpenAI para integrarlo en aplicaciones existentes (por ejemplo, herramientas de productividad o chatbots) sin depender de servicios en la nube.
- Prototipado de aplicaciones multimodales: desarrolladores que trabajan en Apple Silicon pueden usar este modelo para probar flujos de trabajo que combinan visión y lenguaje, como generación de subtítulos automáticos o análisis de documentos escaneados.
- Investigación sobre cuantización mixta: el esquema `mixed_3_6` es un ejemplo práctico de cómo reducir el footprint de memoria manteniendo la fidelidad en capas críticas, útil para estudiar el impacto de la cuantización selectiva en modelos grandes.
- Generación de contenido en entornos sin conexión: al ser un modelo local, permite procesar datos sensibles sin enviarlos a servidores externos, adecuado para aplicaciones con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Memoria unificada estimada: 18-24 GB (según la model card) para ejecutar el modelo con la cuantización mixta.
- GPU recomendadas: Apple Silicon (M1 Pro, M1 Max, M2 Pro, M2 Max, M3 Pro, etc.) con suficiente memoria unificada.
- No es compatible con GPUs NVIDIA o AMD; el formato MLX está diseñado exclusivamente para Apple Silicon.
- Opciones de despliegue: `mlx_vlm.generate` (CLI), `mlx_vlm.server` (API OpenAI-compatible), API de Python con `mlx_vlm.load` y `generate`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base Qwen-3.8-27B-Uncensored podría compararse con otras versiones de Qwen o con modelos multimodales de tamaño similar, pero no hay datos de rendimiento ni especificaciones adicionales para establecer una comparación objetiva.

## Limitaciones y advertencias

- Al ser una versión "uncensored" (abliterated), el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros. Su uso en producción debe considerar políticas de seguridad y moderación.
- La cuantización mixta (3 bits en capas MLP) puede degradar la calidad en tareas que requieren alta precisión numérica, como matemáticas complejas o razonamiento lógico extenso.
- El número de parámetros reportado en safetensors (4.33B) no coincide con el nombre del modelo (27B), lo que sugiere una posible inconsistencia en la conversión o en la documentación. Se recomienda verificar la integridad del modelo antes de usarlo.
- Solo funciona en Apple Silicon; no es portable a otras arquitecturas sin reconversión.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de contexto. Se desconoce la longitud máxima de contexto soportada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tejones36/Qwen-3.8-27B-Uncensored-mlx-mixed_3_6
- Modelo base: https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored
- Librería MLX: https://github.com/ml-explore/mlx
- Herramienta de conversión mlx-vlm: https://github.com/Blaizzy/mlx-vlm

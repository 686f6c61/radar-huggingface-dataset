# taurusduan/Qwen3-Coder-Next-heretic-GGUF

## Resumen

Este repositorio contiene versiones cuantizadas en formato GGUF del modelo `trohrbaugh/Qwen3-Coder-Next-heretic`, una variante "abliterated" (también etiquetada como "uncensored" o "decensored") del modelo de código Qwen3-Coder-Next, desarrollado originalmente por el equipo Qwen de Alibaba. La cuantización ha sido realizada por mradermacher, un conocido proveedor de modelos GGUF, y publicada posteriormente por el usuario taurusduan. El modelo resultante tiene aproximadamente 79,7 mil millones de parámetros y está pensado para su uso con llama.cpp y otros motores compatibles con GGUF.

La relevancia de este modelo radica en que combina las capacidades de generación de código de Qwen3-Coder-Next con una capa de "abliteration" que elimina los mecanismos de rechazo del modelo original, ofreciendo respuestas sin filtros de seguridad. Esto lo hace atractivo para desarrolladores que necesitan un asistente de código sin restricciones, aunque también implica riesgos importantes de contenido inapropiado. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de Qwen3-Coder-Next, presumiblemente transformer) |
| Parametros totales | 79.674.391.296 (aprox. 79,7 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Se sabe que es una cuantización estática del modelo `trohrbaugh/Qwen3-Coder-Next-heretic`, que a su vez es una modificación del modelo Qwen3-Coder-Next de Alibaba. La técnica de "abliteration" aplicada elimina selectivamente las capas o pesos responsables de los comportamientos de rechazo, lo que da como resultado un modelo que no se niega a responder a solicitudes que el modelo original consideraría inapropiadas. El proceso de cuantización GGUF se ha realizado con herramientas estándar de llama.cpp, y los archivos están divididos en múltiples partes para facilitar su descarga.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada de Qwen3-Coder-Next.
- Razonamiento y resolución de problemas de programación, incluyendo depuración y explicación de código.
- Capacidad de mantener conversaciones multi-turno sobre temas técnicos.
- Al ser una versión "uncensored", no aplica filtros de contenido ni rechazos, lo que permite respuestas a solicitudes que otros modelos bloquearían.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero probablemente heredado del modelo base.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Asistente de programación sin restricciones: el modelo puede generar código, explicar algoritmos y depurar errores sin rechazar solicitudes por contenido sensible, útil para entornos de desarrollo donde se necesita libertad total.
- Generación de scripts y automatización: puede crear scripts de shell, Python, etc., para tareas de administración de sistemas, aunque se debe tener precaución con comandos potencialmente dañinos.
- Educación en programación: al no tener filtros, puede explicar conceptos avanzados o vulnerabilidades de seguridad sin evasivas, útil para formación en ciberseguridad.
- Prototipado rápido: su gran tamaño (79,7 B) permite manejar tareas complejas de generación de código con alta calidad, adecuado para generar esqueletos de aplicaciones.
- Análisis de código existente: puede revisar y refactorizar código fuente, aunque su contexto no está especificado, se espera que sea amplio dado el tamaño del modelo.
- Investigación en IA: útil para estudiar los efectos de la abliteration en modelos de lenguaje, comparando su comportamiento con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3-Coder-Next podría tener métricas publicadas por Alibaba, pero no se incluyen en este repositorio ni en los resultados de búsqueda proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tipo de cuantización, los tamaños de archivo varían entre 29,2 GB (Q2_K) y 84,9 GB (Q8_0). Se necesita al menos esa cantidad de VRAM para cargar el modelo completo, más un margen para el contexto y los cálculos.
- GPU recomendadas: para las cuantizaciones más pequeñas (Q2_K, Q3_K_S), una GPU con 32 GB de VRAM (por ejemplo, A100 40GB, RTX 6000 Ada) podría ser suficiente. Para Q4_K_M (48,6 GB) se requiere una GPU de 80 GB (A100 80GB, H100) o múltiples GPUs en paralelo. Las cuantizaciones Q5 y superiores necesitan configuraciones multi-GPU.
- En consumer GPU: no es viable en GPUs de 24 GB (RTX 4090) para ninguna cuantización, ya que la más pequeña (Q2_K) ocupa 29,2 GB. Se necesitarían al menos dos RTX 4090 en configuración NVLink o similar.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. También se puede usar vLLM si se convierte a safetensors, pero el formato nativo es GGUF.
- Latencia y throughput: no se proporcionan datos específicos. En general, un modelo de 79,7 B en una A100 80GB con Q4_K_M puede generar entre 10 y 20 tokens por segundo, dependiendo de la implementación y el contexto.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos en la información proporcionada. El modelo más cercano es el propio Qwen3-Coder-Next original (sin abliterar), que tiene la misma arquitectura y tamaño pero con filtros de seguridad. Otros modelos de código de tamaño similar incluyen DeepSeek-Coder-V2 (236 B, pero con arquitectura MoE) o CodeLlama-70B, aunque no se han encontrado comparaciones directas en los resultados de búsqueda. Se recomienda consultar los benchmarks oficiales de Qwen para el modelo base.

## Limitaciones y advertencias

- Al ser una versión "uncensored", el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es adecuado para aplicaciones en producción sin una capa de moderación externa.
- Riesgo de alucinación: como cualquier modelo de lenguaje grande, puede inventar información, especialmente en contextos largos o temas especializados.
- Solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- El tamaño del modelo (79,7 B) requiere hardware de gama alta, lo que limita su uso en entornos con recursos limitados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-Coder-Next puede tener términos adicionales; se recomienda revisar la licencia original de Qwen.
- No se ha verificado la calidad de la cuantización; las versiones de menor bit (Q2_K, Q3) pueden degradar significativamente la calidad de las respuestas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/taurusduan/Qwen3-Coder-Next-heretic-GGUF
- Modelo base (trohrbaugh): https://huggingface.co/trohrbaugh/Qwen3-Coder-Next-heretic
- Modelo original Qwen3-Coder-Next: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Guía de uso en dev.to: https://dev.to/sienna/qwen3-coder-next-the-complete-2026-guide-to-running-powerful-ai-coding-agents-locally-1k95
- Página de local-ai-zone: https://local-ai-zone.github.io/models/qwen3-coder-next-heretic.html

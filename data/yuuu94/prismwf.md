# yuuu94/PrismWF

## Resumen

PrismWF es un modelo de transformer basado en parches de múltiples granularidades, diseñado para el ataque de identificación de sitios web (website fingerprinting) en tráfico Tor, específicamente en escenarios multi-pestaña. Lo desarrolla el autor yuuu94, y se publica como un prototipo de investigación con pesos preentrenados para reproducir los experimentos del artículo homónimo. El problema que resuelve es la identificación de qué sitios web visita un usuario a través de una conexión Tor cuando se abren varias pestañas simultáneamente, una tarea que los métodos clásicos de una sola pestaña no abordan correctamente.

El modelo combina una representación robusta del tráfico en seis canales (HG8) con bloques de atención de múltiples granularidades que integran información de distintas escalas temporales mediante kernels convolucionales con diferentes campos receptivos. Está disponible en ocho variantes de checkpoint (escenarios de mundo cerrado y abierto, con 2 a 5 pestañas) y se distribuye bajo licencia MIT. El repositorio no proporciona el número total de parámetros, la longitud de contexto ni detalles de cuantización; estos datos no están disponibles en la información pública.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en parches (patch-based) con bloques de atención multi-granularidad y capas convolucionales |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (trabaja sobre secuencias de tráfico de longitud fija definida por el dataset) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch nativo, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; procesa tráfico de red) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`) |

## Arquitectura y entrenamiento

PrismWF es un transformer basado en parches que procesa secuencias de tráfico de red. En lugar de operar directamente sobre los bytes o flujos, transforma el tráfico crudo en una representación de seis canales (denominada HG8) que captura estadísticas de paquetes, direcciones y temporización. A partir de esta representación, se extraen características a múltiples granularidades usando kernels convolucionales con campos receptivos distintos (ventanas pequeñas, medianas y grandes), que luego se integran en bloques de atención multi-granularidad. Esta arquitectura permite combinar información a corto y largo plazo en el tráfico, algo crítico para distinguir sitios web cuando hay varias pestañas activas simultáneamente.

El entrenamiento se realizó durante 80 épocas con semilla 2024, tamaño de lote 256 y tasa de aprendizaje de `5e-4`. Se utilizaron tres bloques multi-granularidad y la representación completa HG8 de seis canales. La selección de checkpoints se basa en la métrica MAP@K sobre el conjunto de validación correspondiente al número de pestañas. El entorno de reproducción usa Python 3.10.20, PyTorch 2.4.1 y CUDA 12.1, con GPUs NVIDIA A800 para validación, aunque la inferencia no está ligada a un modelo de GPU específico. No se menciona explícitamente el uso de RLHF o DPO; el entrenamiento parece ser supervisado de clasificación multi-etiqueta.

## Capacidades

- Clasificación multi-etiqueta de sitios web a partir de tráfico Tor, con soporte para múltiples pestañas simultáneas (hasta 5 en las configuraciones publicadas).
- Robustez frente a variaciones del tráfico (ruido, tiempos de red) gracias a la representación HG8 y la extracción multi-granularidad.
- Funciona tanto en escenarios de mundo cerrado (conjunto fijo de sitios) como de mundo abierto (sitios no vistos durante el entrenamiento).
- Capacidad de integración temporal en distintas escalas mediante atención multi-granularidad, lo que permite distinguir patrones de navegación complejos.
- No es un modelo de lenguaje: no genera texto ni admite prompts; su entrada son secuencias de tráfico de red.
- No se documenta soporte para tool calling ni agentes.

## Casos de uso

- Investigación en privacidad y anonimato: analizar la eficacia de ataques de fingerprinting sobre Tor para evaluar riesgos reales de deanonimización.
- Evaluación de defensas de tráfico: comparar PrismWF contra mecanismos de ofuscación (por ejemplo, padding, morfing de tráfico) para medir su robustez.
- Estudios de análisis de tráfico multi-tab: entender cómo la apertura de varias pestañas degrada la precisión de los métodos clásicos y cómo un modelo multi-granularidad mejora la identificación.
- Reproducción de investigación: validar los resultados del artículo usando los checkpoints públicos y el protocolo de evaluación del repositorio GitHub.
- Desarrollo de sistemas de detección de actividades maliciosas en redes Tor (siempre con autorización legal) para aplicaciones de ciberseguridad.
- Benchmarking de arquitecturas transformer para datos de secuencia de red, comparando con modelos de una sola granularidad o basados en CNN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona que la validación usa MAP@K, pero no se proporcionan valores numéricos en la model card ni en los resultados de búsqueda web. No se puede presentar una tabla comparativa con otros modelos sin datos concretos.

## Requisitos de hardware

- Los checkpoints son de tamaño moderado (0.7 GB en total para los ocho ficheros), lo que sugiere que cada checkpoint individual es de alrededor de 87.5 MB en promedio.
- La inferencia puede ejecutarse en GPUs de consumo medio; no se requiere una A800 específica (el artículo menciona que la validación se hizo con A800 pero no es vinculante).
- No se proporciona VRAM estimada ni latencia/throughput en la documentación pública.
- El despliegue se hace mediante el código del repositorio GitHub, que incluye scripts de evaluación (`evaluate.py`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- La reproducción del entrenamiento requiere GPU con al menos 16 GB de VRAM (por el batch de 256 y la arquitectura transformer), pero la inferencia podría ser más ligera.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de fingerprinting multi-tab. El artículo menciona que PrismWF se compara con métodos anteriores (por ejemplo, basados en CNN o transformers de una sola granularidad), pero no se incluyen los resultados numéricos en la información disponible. Por tanto, no se puede elaborar una tabla comparativa fiable.

## Limitaciones y advertencias

- Es un prototipo de investigación, no un producto de producción: los pesos son para reproducibilidad académica y no se garantiza su rendimiento en entornos reales.
- Su uso está restringido a tráfico autorizado y sistemas para los que se tenga permiso explícito. No se debe usar para vigilancia no autorizada o deanonimización de usuarios.
- El modelo está entrenado específicamente para tráfico Tor y escenarios multi-tab; puede no generalizar bien a otros tipos de tráfico o a otros protocolos.
- No se proporcionan datos sobre sesgos ni riesgos de alucinación, ya que no es un modelo de lenguaje.
- La licencia MIT permite uso comercial, pero el código y los datos de entrenamiento (datasets ARES) no se redistribuyen en el repositorio; hay que obtenerlos por separado.
- No hay garantía de soporte ni mantenimiento por parte del autor.
- La longitud de contexto y el número de parámetros no están documentados, lo que dificulta planificar despliegues en entornos con recursos limitados.

## Enlaces

- HuggingFace: [yuuu94/PrismWF](https://huggingface.co/yuuu94/PrismWF)
- GitHub: [PrismWF repository](https://github.com/yyyyu120/PrismWF)
- Artículo arXiv: [2603.21117](https://arxiv.org/abs/2603.21117)
- Versión HTML del artículo: [arXiv HTML](https://arxiv.org/html/2603.21117v1)
- Semantic Scholar: [PrismWF paper](https://www.semanticscholar.org/paper/PrismWF%3A-A-Multi-Granularity-Patch-Based-for-Robust-Pan-Xu/51dbac5f2b8882c3e23531eadb0a35043720a8e6)

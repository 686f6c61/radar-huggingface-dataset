# YoAiKimia/Wan2.2-I2V

## Resumen

El repositorio `YoAiKimia/Wan2.2-I2V` aloja los pesos de un modelo de generación de vídeo imagen-a-vídeo (I2V) perteneciente a la familia Wan2.2, desarrollada por el equipo Wan-Video. Wan2.2 es la evolución del modelo Wan2.1 y está diseñado para generar vídeos de alta calidad (hasta 720p) a partir de imágenes de entrada, con control estético y de movimiento de nivel cinematográfico. El repositorio contiene 246.9 GB de datos en formatos safetensors y GGUF, lo que sugiere que incluye tanto pesos completos como versiones cuantizadas para diferentes despliegues.

La información pública sobre este repositorio concreto es muy limitada: no se especifican la arquitectura exacta, el número de parámetros, la licencia ni los idiomas soportados. El acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace. A partir de las referencias web, se sabe que existe una variante denominada Wan2.2-I2V-A14B, que probablemente indica un modelo con 14 mil millones de parámetros activos, aunque no se confirma si este repositorio corresponde exactamente a esa variante. La relevancia actual radica en que Wan2.2 representa un avance significativo en la generación de vídeo de código abierto, compitiendo con soluciones propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Wan2.2, generación de vídeo imagen-a-vídeo) |
| Parametros totales | no disponible (posiblemente 14B según la variante A14B mencionada en GitHub) |
| Parametros activos | no disponible (posiblemente 14B si es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors y GGUF (según tags del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (acceso restringido en HuggingFace) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo alojado en este repositorio. Según las referencias web, Wan2.2 es un modelo de generación de vídeo a gran escala, sucesor de Wan2.1, desarrollado por el equipo Wan-Video. El repositorio de GitHub `3Dsamples/Wan2.2-ai` menciona explícitamente el soporte para Wan2.2-I2V-A14B, lo que sugiere una arquitectura con 14 mil millones de parámetros, posiblemente con activación parcial (MoE). Se sabe que el modelo puede generar vídeo a resoluciones de 480P y 720P y que admite inferencia en una sola GPU, pero no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de imágenes de entrada (image-to-video), con resoluciones de hasta 720p.
- Control estético y de movimiento de nivel cinematográfico, según la descripción del sitio oficial wan22.ai.
- Generación de vídeo profesional con calidad de producción, orientado a creadores y profesionales del marketing.
- Soporte para inferencia en una sola GPU, lo que facilita su despliegue en entornos con recursos limitados.
- Disponibilidad de pesos en formatos safetensors y GGUF, lo que permite su uso con diferentes frameworks de inferencia (llama.cpp, vLLM, etc., aunque no se confirma específicamente para este modelo).
- No se dispone de información sobre capacidades adicionales como tool calling, agentes o razonamiento multi-paso, ya que se trata de un modelo de generación de vídeo, no de lenguaje.

## Casos de uso

- Producción de vídeo publicitario: el modelo puede generar clips de alta calidad a partir de imágenes de producto, permitiendo a agencias de marketing crear anuncios dinámicos sin necesidad de rodajes costosos.
- Creación de contenido para redes sociales: los creadores pueden convertir imágenes fijas en vídeos animados de hasta 720p, ideales para plataformas como Instagram, TikTok o YouTube Shorts.
- Prototipado de escenas cinematográficas: directores y guionistas pueden visualizar escenas a partir de storyboards o imágenes de referencia, acelerando el proceso de preproducción.
- Generación de vídeos educativos: instituciones y formadores pueden animar diagramas o ilustraciones para explicar conceptos complejos de forma visual.
- Automatización de vídeos para e-commerce: tiendas online pueden generar vídeos de demostración de productos a partir de fotografías, mejorando la experiencia de compra.
- Restauración y animación de archivos fotográficos: el modelo puede dar vida a fotografías históricas o familiares, creando vídeos cortos con movimiento natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre métricas como FVD (Fréchet Video Distance), IS (Inception Score) u otras utilizadas en generación de vídeo, ni comparaciones con modelos similares.

## Requisitos de hardware

- El tamaño del repositorio (246.9 GB) sugiere que los pesos completos requieren una GPU con al menos 80 GB de VRAM para inferencia en precisión completa (por ejemplo, A100 80GB o H100).
- Las versiones GGUF permitirían cuantizaciones más ligeras, aunque no se especifican los tamaños de las mismas. Con cuantización de 8 bits o 4 bits, podría ser viable en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB), pero no se confirma.
- El repositorio de GitHub menciona soporte para inferencia en una sola GPU, lo que indica que el modelo está optimizado para despliegue en un único dispositivo.
- Opciones de despliegue: no se especifican frameworks concretos, pero los formatos safetensors y GGUF son compatibles con herramientas como vLLM, llama.cpp, Ollama o TGI, aunque la naturaleza de vídeo del modelo podría requerir pipelines específicos (por ejemplo, ComfyUI, que se menciona en la guía de comfyuiweb.com).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. Los modelos de generación de vídeo de código abierto comparables podrían ser Wan2.1 (predecesor), Open-Sora, o modelos propietarios como Sora de OpenAI, pero no se tienen datos concretos sobre rendimiento, parámetros o licencias de estos en relación con este repositorio específico. Se recomienda consultar la documentación oficial de Wan2.2 para obtener comparativas detalladas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso comercial o su disponibilidad pública.
- Licencia no especificada: al no indicarse la licencia, no se puede garantizar que el modelo sea de uso libre, incluso para fines de investigación.
- Información técnica incompleta: no se dispone de detalles sobre arquitectura, parámetros, contexto o idiomas, lo que dificulta evaluar su idoneidad para casos de uso específicos.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir vídeos con artefactos, movimientos no naturales o inconsistencias, especialmente en escenas complejas.
- Sesgos potenciales: al no conocerse el dataset de entrenamiento, no se pueden evaluar sesgos de género, raza o culturales en los vídeos generados.
- Requisitos de hardware elevados: el tamaño del modelo (246.9 GB) implica que no es adecuado para entornos con recursos limitados sin cuantización agresiva, lo que puede degradar la calidad.
- Fecha de creación futura: el repositorio fue creado en marzo de 2026, lo que sugiere que es un modelo muy reciente y posiblemente en fase de evaluación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/YoAiKimia/Wan2.2-I2V
- Árbol de archivos del repositorio: https://huggingface.co/YoAiKimia/Wan2.2-I2V/tree/main
- Repositorio GitHub de referencia (3Dsamples/Wan2.2-ai): https://github.com/3Dsamples/Wan2.2-ai
- Sitio oficial de Wan 2.2: https://wan22.ai/home
- Guía completa de Wan2.2 en ComfyUI: https://comfyuiweb.com/posts/wan22-complete-guide

# Trendyol/Trendyol-Vision-Master

## Resumen

Trendyol-Vision-Master es un modelo de lenguaje y visión (VLM) desarrollado por Trendyol, la plataforma de comercio electrónico turca, como un fine-tuning completo (full SFT) del modelo base Qwen/Qwen3.5-27B. Está diseñado específicamente para automatizar tareas de moderación y enriquecimiento de catálogo en operaciones de e-commerce: detección de categoría, verificación de similitud entre productos, extracción de atributos, generación de títulos y descripciones, y clasificación de contenido sensible.

Con 27 356 millones de parámetros y una ventana de contexto de 16 384 tokens, el modelo procesa imágenes de producto junto con títulos y metadatos para producir decisiones estructuradas o texto. Está optimizado para los flujos de trabajo del catálogo de Trendyol, con soporte para múltiples imágenes y salidas guiadas por esquemas (structured outputs). Trendyol también publica una versión reducida, Trendyol-Vision-Flash, para cargas de trabajo de alto volumen en una sola GPU, mientras que Master se reserva para casos críticos o difíciles, especialmente detección de categoría.

El modelo se distribuye bajo licencia CC-BY-4.0, con soporte principal para turco e inglés, y se sirve mediante vLLM como API compatible con OpenAI. Su relevancia actual radica en que demuestra cómo un VLM de 27B puede especializarse en tareas verticales de comercio electrónico con resultados validados en producción, manteniendo capacidades generales de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-27B VLM (transformer multimodal, vision-language) |
| Parametros totales | 27 356 728 560 (~27,36B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 16 384 tokens (max-model-len en configuracion vLLM) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (principal), ingles (secundario) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-27B, un transformer multimodal que combina un codificador de vision con un decodificador de lenguaje autoregresivo. Trendyol ha realizado un fine-tuning completo (full SFT) sobre datos multimodales propios del catalogo, lo que implica actualizar todos los parametros del modelo base. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. El thinking mode del modelo base se desactiva en inferencia (enable_thinking: false), lo que reduce latencia y coste computacional en tareas de produccion.

Entre las innovaciones tecnicas destacables se encuentra el uso de structured outputs mediante el backend xgrammar en vLLM, que permite forzar salidas con formato JSON o indices de opciones, y el soporte para multiples imagenes por peticion. El despliegue recomendado usa tensor parallelism con dos GPUs para distribuir los 27B parametros.

## Capacidades

- Comprension de imagenes de producto combinadas con titulo y metadatos textuales.
- Deteccion de categoria: selecciona el indice de la categoria correcta entre una lista de opciones proporcionada en el prompt.
- Similitud de producto: determina si dos listados (imagenes y titulos) corresponden al mismo SKU.
- Deteccion de marca: infiere la marca a partir de la imagen, con contexto opcional de categoria.
- Extraccion de atributos estructurados: obtiene atributos del producto desde imagen y titulo/descripcion.
- Generacion de titulos de catalogo limpios a partir de la imagen y un titulo de referencia.
- Generacion de descripciones (captions) fundamentadas en la imagen y metadatos opcionales.
- Clasificacion de seguridad de contenido: devuelve 0 (Forbidden), 1 (Fantasy, contenido +18 publicable) o 2 (Safe).
- Extraccion de cantidad por paquete: extrae la cantidad y unidad desde imagen y titulo largo.
- Soporte multi-imagen en una misma peticion.
- Salidas estructuradas compatibles con esquemas JSON mediante xgrammar.

No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso agente.

## Casos de uso

- Moderacion automatizada de catalogos: el modelo clasifica imagenes y titulos de producto en categorias de seguridad (0, 1, 2) y puede bloquear contenido prohibido en tiempo real, reduciendo la intervencion manual.
- Deteccion de categoria en marketplaces: dado un listado con imagen y titulo, el modelo selecciona la categoria correcta de una lista de candidatas, devolviendo solo el indice, lo que permite integrarlo en pipelines de clasificacion con validacion posterior.
- Verificacion de duplicados (mismo SKU): comparando dos listados con imagen y titulo, el modelo decide si representan el mismo producto, util para consolidar ofertas de multiples vendedores.
- Enriquecimiento de fichas de producto: extrae atributos estructurados (color, talla, material, etc.) desde imagen y titulo, alimentando bases de datos de producto con campos normalizados.
- Generacion de titulos y descripciones para alta de productos: a partir de una imagen y un titulo de referencia, produce un titulo limpio y una descripcion fundamentada, acelerando el proceso de publicacion.
- Filtrado de contenido sensible en anuncios: clasifica productos como Fantasy (+18) o Safe, permitiendo aplicar restricciones de visibilidad por edad o normativa.
- Investigacion y evaluacion de VLMs verticales: el modelo sirve como referencia para estudiar el impacto del fine-tuning en tareas especificas de e-commerce sobre una base generalista de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas comparativas (MMLU, HumanEval, GSM8K, etc.) ni evaluaciones cuantitativas sobre los casos de uso del catalogo. Se recomienda consultar el repositorio de Trendyol o contactar con el equipo para obtener datos de validacion interna.

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan 54,7 GB, por lo que en FP16 se necesitan aproximadamente 55 GB de VRAM. Con cuantizacion a 4 bits (no documentada oficialmente) podria reducirse a ~14 GB, pero no hay configuraciones publicadas.
- GPU recomendadas: el despliegue oficial sugiere tensor parallelism con 2 GPUs (--tensor-parallel-size 2). Son adecuadas configuraciones como 2x A100 80GB o 2x H100 80GB. En GPUs de consumo, 2x RTX 4090 (24 GB cada una) no son suficientes para FP16 sin cuantizacion; se necesitaria al menos cuantizacion 8 bits o 4 bits.
- No cabe en una unica GPU de consumo (24 GB) en FP16; requiere multiples GPUs o cuantizacion.
- Opciones de despliegue: vLLM (version validada 0.19.1) como API compatible con OpenAI, con soporte de structured outputs via xgrammar. No se mencionan integraciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Se recomienda desactivar el thinking mode y limitar max_tokens (p.ej. 16) para tareas de clasificacion, lo que sugiere latencias bajas en produccion, aunque sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Trendyol-Vision-Master | 27,36B | 16 384 | tr, en | CC-BY-4.0 | VLM especializado en e-commerce |
| Trendyol-Vision-Flash | No disponible | No disponible | tr, en | No disponible | VLM ligero para tareas de catalogo en una GPU |
| Qwen3.5-27B (base) | ~27B | No disponible | Multilingue | No disponible | VLM generalista multimodal |

La comparativa directa con otros VLMs de e-commerce (como Amazon, Alibaba o Zalando) no esta disponible en la informacion proporcionada. La diferencia principal frente a la version Flash es que Master es mas grande y mantiene capacidades generales mas fuertes, recomendado para casos criticos como deteccion de categoria; Flash esta optimizado para cargas diarias de alto trafico en una sola GPU.

## Limitaciones y advertencias

- No es un modelo de chat generalista: su uso previsto se limita a operaciones de catalogo de e-commerce; fuera de ese ambito el rendimiento puede degradarse.
- Idiomas limitados a turco e ingles; no soporta espanol ni otros idiomas de forma nativa.
- Riesgo de alucinacion en la extraccion de atributos o generacion de titulos cuando la imagen es ambigua o de baja calidad.
- El thinking mode esta deshabilitado en inferencia, lo que reduce la capacidad de razonamiento profundo pero mejora la latencia.
- La ventana de contexto de 16 384 tokens puede ser insuficiente para catalogos con metadatos muy extensos o multiples imagenes de alta resolucion.
- Licencia CC-BY-4.0 permite uso comercial con atribucion, pero requiere citar a Trendyol como autor en cualquier redistribucion o uso publico.
- No se documentan sesgos especificos, pero al estar entrenado sobre datos del catalogo de Trendyol, puede reflejar sesgos de la plataforma (categorias, marcas, tipos de producto).
- No apto para consejo medico, legal, vigilancia ni cualquier uso descrito en las consideraciones eticas de la model card.
- La fecha de publicacion (julio de 2026) y el numero reducido de descargas (49) indican que es un modelo reciente con adopcion limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Trendyol/Trendyol-Vision-Master
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Version ligera Trendyol-Vision-Flash: https://huggingface.co/Trendyol/Trendyol-Vision-Flash

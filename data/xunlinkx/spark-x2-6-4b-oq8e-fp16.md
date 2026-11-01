# xunlinkx/Spark-X2.6-4B-oQ8e-fp16

## Resumen

Spark-X2.6-4B-oQ8e-fp16 es una cuantización comunitaria en formato MLX del modelo XHToken/Spark-X2.6-4B, desarrollada por el usuario xunlinkx mediante el pipeline de cuantización oMLX. El modelo base pertenece a la familia SparkLLM de XHToken y emplea una arquitectura denominada `spark2_5`, con 4.112.079.360 parámetros totales (aproximadamente 4,1 mil millones). Esta variante concreta está pensada para inferencia local en Apple Silicon mediante MLX.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 4B en hardware de consumo de Apple (M1 a M6) con pesos de 8 bits, manteniendo la licencia Apache-2.0 del modelo original. El checkpoint original está en BF16; este repositorio lo convierte primero a FP16 y luego lo cuantiza a 8 bits con calibración mejorada, lo que se refleja en el sufijo `-fp16`.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni resultados de benchmarks en la documentación proporcionada. La model card remite al repositorio upstream para los detalles completos del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `spark2_5` (transformer; detalles internos no disponibles) |
| Parámetros totales | 4.112.079.360 (~4,1B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8-bit afín uniforme, group size 64 (esta variante); existen builds de 4 y 5 bits en el mismo set |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo upstream) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

La arquitectura declarada es `spark2_5`, correspondiente a la familia SparkLLM de XHToken. No se especifica en la información disponible si se trata de un transformer denso, un modelo MoE o una arquitectura híbrida; tampoco se detallan mecanismos de atención, número de capas ni dimensión oculta. El checkpoint upstream está en BF16 y esta variante lo convierte a FP16 antes de cuantizar.

El proceso de cuantización emplea el pipeline oMLX con calibración mejorada sobre 128 muestras de 512 tokens de longitud, cuantización afín y group size 64. Las capas lineales cuantizadas usan 8 bits uniformes; el resto de tensores mantiene el formato MLX. No hay información sobre datos de entrenamiento, número de tokens, composición del corpus ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a preguntas generales (el ejemplo de la model card es una pregunta factual sobre la capital de Anhui).
- Soporte de modo "thinking" con presupuesto configurable, según se menciona en la referencia al modelo upstream.
- Compatibilidad con plantilla de chat propia del modelo (chat-template), gestionada por el runtime.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse íntegramente en Apple Silicon mediante MLX, sin conexión a la nube, lo que resulta adecuado para prototipos de chatbots y pruebas de concepto en entornos de desarrollo con M1 a M6.
- Generación de texto en aplicaciones de escritorio: al integrarse con `mlx_lm.generate`, permite incorporar generación de texto en herramientas nativas de macOS con una huella de memoria moderada (pico de 4,53 GB en la prueba de humo del autor).
- Evaluación de cuantizaciones: al ser la variante de mayor precisión del set (frente a las builds de 4 y 5 bits), sirve como referencia para medir la degradación de calidad al bajar de bits en el mismo modelo base.
- Investigación sobre cuantización: el pipeline oMLX con calibración de 128 muestras y group size 64 es un caso de estudio reproducible para analizar el impacto del esquema afín de 8 bits en modelos de ~4B.
- Preguntas y respuestas factuales: el ejemplo de la model card sugiere uso en consultas de conocimiento general, adecuado para asistentes de documentación o FAQ internas.
- Pruebas de integración de runtimes MLX: útil para validar el soporte de la arquitectura `spark2_5` en instalaciones recientes de oMLX o MLX-LM antes de desplegar variantes mayores.
- Desarrollo offline en portátiles: el tamaño del repo (4,4 GB) y el pico de memoria de 4,53 GB lo hacen viable en equipos con 16 GB de memoria unificada para contextos cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación reportada por el autor es una prueba de humo local: 16 tokens generados con un pico de memoria de 4,530 GB según MLX. El propio autor indica que se trata de una comprobación básica de carga y generación, no de un benchmark ni de una comparación de calidad.

## Requisitos de hardware

- VRAM/memoria estimada: pico de 4,530 GB reportado por MLX en la prueba de humo con prompt corto; el consumo aumenta con la longitud de contexto y el overhead del runtime.
- Hardware objetivo: Apple Silicon (M1 a M6) según la model card.
- GPU NVIDIA: no contempladas por esta variante, que es específica de MLX.
- ¿Cabe en GPU de consumo? En Apple Silicon con memoria unificada de 16 GB o superior, sí para contextos moderados; no aplica a GPUs discretas por el formato MLX.
- Opciones de despliegue: oMLX (recomendado, con soporte de `spark2_5`) y MLX-LM con soporte de Spark. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se conoce el pico de memoria de la prueba de humo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-oQ8e-fp16 (este) | ~4,1B | no disponible | Apache-2.0 | MLX safetensors 8-bit | Cuantización comunitaria para Apple Silicon |
| XHToken/Spark-X2.6-4B (upstream) | ~4,1B | no disponible | Apache-2.0 | BF16 | Modelo original, misma arquitectura `spark2_5` |
| Builds de 4 y 5 bits del mismo set | ~4,1B | no disponible | Apache-2.0 | MLX safetensors | Menor huella, menor precisión; referencia directa de comparación |

No se dispone de datos de rendimiento ni de modelos de terceros comparables en la información proporcionada; la comparación se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Cuantización no oficial: es una conversión comunitaria de xunlinkx, no una release de XHToken, y no ha sido avalada por los autores originales.
- Calidad no verificada: la única validación es una prueba de humo de 16 tokens; no hay evaluación de calidad frente al modelo BF16 original.
- Sesgos conocidos: no disponibles en la documentación; se desconoce la composición del dataset de entrenamiento.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no cuantificado por el autor.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se documentan; el ejemplo de la model card está en inglés.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo upstream para confirmar condiciones.
- Dependencia de runtime: requiere una instalación reciente de oMLX o MLX-LM con soporte de la arquitectura `spark2_5`; runtimes sin ese soporte no podrán cargar los pesos.
- Plataforma: exclusivo de Apple Silicon; no es portable a CUDA ni a CPU genérica sin reconversión.
- Memoria: el pico de 4,53 GB corresponde a prompt corto; contextos largos pueden superar la memoria disponible en equipos de 8 GB.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xunlinkx/Spark-X2.6-4B-oQ8e-fp16
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Proyecto oficial Spark-X2.6: https://github.com/XHToken/Spark-X2.6
- Licencia upstream: https://huggingface.co/XHToken/Spark-X2.6-4B/blob/main/LICENSE

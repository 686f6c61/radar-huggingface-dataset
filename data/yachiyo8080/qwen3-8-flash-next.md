# yachiyo8080/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de lenguaje y vision desarrollado por el equipo Qwen (Alibaba). Se presenta como la primera publicación con pesos abiertos bajo la arquitectura que sustentará la futura familia Qwen4, por lo que su interés principal es arquitectónico más que de producto final. Combina atención híbrida, embeddings de n-gramas y un mezcla de expertos (MoE) de gran escala con un número reducido de parámetros activos.

El modelo declara 125.000 millones de parámetros en el modelo de lenguaje con 6.000 millones activados por token, más 51.000 millones en un embedding de n-gramas y 4.000 millones en un módulo MTP (multi-token prediction). El total real registrado en los ficheros safetensors del repositorio es de 179.999.981.459 parámetros. Incorpora un codificador de visión y se distribuye con pipeline `image-text-to-text`.

Su relevancia actual radica en las innovaciones que introduce: Qwen Sparse Attention (QSA) que opera a nivel de micro-bloque para reducir la latencia en contextos largos, Gated Residual para estabilizar el entrenamiento en profundidad, embeddings de n-gramas como eje alternativo de escalado de parámetros y una receta de entrenamiento con Muon y AdamW. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Qwen Sparse Attention) con MoE, Gated Residual, N-gram Embedding y MTP; incluye codificador de visión |
| Parametros totales | 179.999.981.459 (según safetensors); desglose declarado: 125B LM (6B activos) + 51B n-gram embedding + 4B MTP |
| Parametros activos | 6B en el LM (10 expertos enrutados + 1 compartido de 512 totales) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

La arquitectura se organiza en 48 capas con dimensión oculta de 2560 y un layout de 12 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)`. Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Qwen Sparse Attention usa 24 cabezas para Q y 2 para KV, dimensión de cabeza 256, RoPE de dimensión 64 y un indexador MQA con 4 cabezas de query y 1 cabeza de clave compartida (dimensión 128); el presupuesto de atención es de 512 bloques o 2048 tokens. En lugar de seleccionar tokens individuales, QSA opera a nivel de micro-bloque, lo que reduce la latencia en contextos largos.

El MoE cuenta con 512 expertos, de los que se activan 10 enrutados más 1 compartido, con dimensión intermedia de experto de 640. Gated Residual modula el flujo de información mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta escalar de escritura por rama, con 4 ramas y rango de cuello de botella 320. El embedding de n-gramas indexa bigramas y trigramas en la capa 2 con 20.000.000 de entradas, lo que permite escalar parámetros con menor coste computacional y facilita el offloading frente al MoE. El vocabulario es de 248.320 entradas (con padding). El módulo MTP consta de 1 capa entrenada con múltiples pasos.

En cuanto al entrenamiento, la model card indica que se aplicaron las etapas de pre-entrenamiento y post-entrenamiento, con una receta que asigna Muon y AdamW a categorías específicas de pesos, elimina los warmups tradicionales de tamaño de lote (arrancando directamente en el tamaño objetivo) y utiliza leyes de escalado reajustadas. No se especifican el número de tokens de entrenamiento ni la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento en un modelo causal con codificador de visión.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`).
- Procesamiento de contextos largos: 262.144 tokens nativos, extensibles hasta 1.000.000, con QSA optimizada para cargas agénticas.
- Decodificación multi-token mediante el módulo MTP, orientada a acelerar la generación.
- Compatibilidad con motores de inferencia de alto rendimiento: vLLM, SGLang y TokenSpeed.
- Capacidades de tool calling y agentes: no se detallan explícitamente en la información disponible; la versión oficial Qwen3.8-Flash en Qwen Cloud incluye herramientas integradas y contexto de 1M por defecto.
- Capacidades multilingües: no disponible.

## Casos de uso

- Procesamiento de documentos largos con imágenes: el modelo puede ingerir informes, contratos o expedientes de cientos de miles de tokens junto con sus figuras y tablas, aprovechando el contexto nativo de 262.144 tokens y la atención dispersa para mantener la latencia bajo control.
- Asistentes agénticos multi-paso: la combinación de QSA (pensada para cargas agénticas) y MTP permite mantener sesiones largas de razonamiento con múltiples llamadas a herramientas sin que el coste de atención crezca de forma prohibitiva.
- Análisis de imágenes técnicas en soporte: interpretación de capturas de pantalla, diagramas o fotografías de producto dentro de una conversación multi-turno, útil en atención al cliente asistida.
- Generación y revisión de código con contexto de repositorio: el contexto largo permite incluir varios ficheros y el historial de cambios en una sola ventana; conviene validar la calidad real en código antes de producción, ya que no hay benchmarks publicados.
- Investigación en arquitecturas: al ser una vista previa experimental de la arquitectura Qwen4, es adecuado para estudiar el comportamiento de Gated DeltaNet, QSA, Gated Residual y embeddings de n-gramas en entornos controlados.
- Despliegue en infraestructura con memoria limitada: el embedding de n-gramas está diseñado para offloading, lo que permite servir el modelo en aceleradores con menos memoria que la requerida por un MoE equivalente, a costa de gestionar el intercambio de memoria.
- Prototipado multimodal en pipelines de Transformers, vLLM o SGLang: la disponibilidad de safetensors y la compatibilidad declarada facilitan integrarlo en stacks existentes para pruebas de concepto.

## Benchmarks y rendimiento

La model card incluye una sección de resultados de benchmarks, pero en la información proporcionada no se han incluido los valores numéricos de las tablas. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 180.000 millones de parámetros en safetensors ocupa 360 GB en el repositorio; en FP16 requeriría del orden de 360 GB de VRAM, y en cuantizaciones de 8 o 4 bits bajaría aproximadamente a 180 GB o 90 GB respectivamente, aunque no se confirman formatos de cuantización soportados.
- GPU recomendadas: no disponibles en la información. Por tamaño, un despliegue en FP16 exigiría múltiples aceleradores de clase H100 o A100 de 80 GB; no se especifica el número mínimo.
- GPU de consumo: no cabe en GPU de consumo en precisión completa ni en la mayoría de cuantizaciones, dado el tamaño del modelo y de su embedding de n-gramas.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A continuación se recoge una comparación estructural limitada a los datos conocidos:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | 179.999.981.459 (125B LM + 51B n-gram + 4B MTP) | 6B (LM) | 262.144 nativo, hasta 1.000.000 | qwen-community-1.0 | Pesos abiertos en HuggingFace |
| Qwen3.8-Flash (oficial, Qwen Cloud) | no disponible | no disponible | 1.000.000 por defecto | no disponible | API gestionada |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental: se describe explícitamente como una vista previa de la arquitectura de Qwen4, no como un modelo de producción final; su comportamiento puede diferir del de la versión oficial Qwen3.8-Flash.
- Sin benchmarks verificables en la información disponible: no es posible evaluar su calidad frente a alternativas con datos objetivos.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas sin evaluación previa.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se documentan medidas específicas de mitigación.
- Sesgos: no se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que impide evaluar su impacto.
- Licencia qwen-community-1.0: es una licencia comunitaria con condiciones específicas; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- Requisitos de hardware muy elevados: el tamaño del repositorio (360 GB) y el número de parámetros limitan su despliegue a infraestructura multi-GPU.
- Complejidad operativa: el embedding de n-gramas y el módulo MTP añaden piezas no estándar que pueden requerir versiones específicas de los motores de inferencia.
- Contexto extensible a 1.000.000 de tokens: la extensión más allá de los 262.144 nativos puede degradar la calidad y no está cuantificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yachiyo8080/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Qwen Cloud (versión oficial Qwen3.8-Flash): https://www.qwencloud.com/models/qwen3.8-flash
- Qwen Cloud: https://www.qwencloud.com
- Diagrama de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png

# wrldsuksgo2mars/GLM-5.3-EXL3-K4-MC

## Resumen

GLM-5.3-EXL3-K4-MC es una cuantización del modelo GLM-5.3-BF16 desarrollada por el usuario wrldsuksgo2mars. Se trata de una versión comprimida del modelo original de zai-org en la que los expertos enrutados (routed experts) de la arquitectura Mixture-of-Experts se han cuantizado a 4 bits mediante EXL3 con codebook MCG, mientras que el núcleo denso (atención, FFNs compartidas y densas, y cabeza de salida) se ofrece en tres variantes seleccionables en tiempo de carga: BF16 original, EXL3 de 8 bits o EXL3 de 6 bits.

El modelo conserva los 209.133.427.328 parámetros del original (unos 209 mil millones) y está pensado para ser servido con el runtime cuteafd, que reparte un modelo de este tamaño entre GPUs RTX PRO 6000 y DGX Sparks. La innovación principal es el formato "multi-core": los expertos se almacenan una sola vez y el núcleo denso se empaqueta en varias precisiones dentro del mismo repositorio, de modo que el usuario elige el equilibrio entre calidad y memoria en el momento de la carga sin duplicar los pesos de los expertos.

Es relevante porque permite ejecutar un modelo de clase 200B+ en hardware de estación de trabajo y pequeños clústeres, algo impracticable con el checkpoint BF16 completo (1,4 TB según la model card). La cuantización se calibró con un panel específico orientado a código, razonamiento y uso de herramientas, lo que la hace especialmente adecuada para cargas agénticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (glm_moe_dsa) con MTP nativo |
| Parametros totales | 209.133.427.328 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos EXL3 MCG K4 (4 bits); nucleo denso en BF16, EXL3 MCG K8 u EXL3 MCG K6 |
| Idiomas soportados | no disponible (el dataset de calibración incluye texto multilingüe) |
| Licencia | glm-5.3 (license: other, license_name: glm-5.3) |
| Formato de pesos | safetensors (con metadatos de cuantización EXL3) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer Mixture-of-Experts con atención DSA (DeepSeek Sparse Attention, por las siglas del tag `glm_moe_dsa`) y una capa MTP (Multi-Token Prediction) nativa. La cuantización distingue dos clases de pesos: los expertos enrutados, que concentran aproximadamente el 96 % de los bytes pero solo se activan parcialmente por token, y el núcleo denso, pequeño pero recorrido por completo en cada token. Los 58.368 matrices de expertos se cuantizaron a EXL3 K4 con codebook MCG (multiplicador `0xCBAC1FED`). Permanecen en BF16/F32 en todas las vistas: `kv_b`, el indexador DSA, los embeddings, los routers y las normas.

La calibración se realizó con las 1.426 prompts (1.097.737 tokens GLM) del dataset `wrldsuksgo2mars/agentic-quant-panel-v1`, compuesto por código fuente real, matemáticas resueltas, esquemas de llamadas a funciones y texto multilingüe, renderizado con la plantilla de chat de GLM con thinking activado a máximo esfuerzo y sin padding, packing ni truncado. El método emplea una pasada causal única: cada capa se cuantiza en orden y alimenta a la siguiente con sus salidas ya cuantizadas, de modo que las capas posteriores calibran contra lo que verán realmente en inferencia. Las matrices de Hessian se acondicionaron en FP64 (congruencia block-Hadamard con signo, cómputo FP64 y almacenamiento FP32), con semilla 787 y regularización sigma 0,025. Los expertos rara vez enrutados reciben una política de recuperación acotada (suelo de 1.024 filas, rangos 9 y 16) en lugar de estadísticas ruidosas. El cuantizador es un fork de GPTQModel (tpurtell/GPTQModel), con soporte upstream en ModelCloud/GPTQModel para la calibración nativa del núcleo y las fuentes EXL3 (#3609), alineación MTP completa (#3610) y el trabajo compartido de EXL3, replay y writer (#3579–#3616).

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del GLM-5.3 original, incluido el modo thinking (la calibración se hizo con thinking a máximo esfuerzo).
- Generación de código: el panel de calibración incluye código fuente real, lo que preserva el rendimiento en tareas de programación.
- Matemáticas: el dataset de calibración contiene matemáticas resueltas paso a paso.
- Tool calling / function calling: el panel incluye esquemas de llamadas a funciones, y el modelo está orientado a uso agéntico.
- Razonamiento multi-paso y agentes: la model card describe el checkpoint como pensado para cargas de código, razonamiento y uso de herramientas.
- Capacidades multilingües: el dataset de calibración incluye texto multilingüe, aunque no se detalla la lista de idiomas.
- Predicción multi-token (MTP): la capa MTP nativa se conserva y sus expertos también se cuantizaron a K4.
- Vision y audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD para revisión de parches, generación de tests y explicación de errores; la calibración sobre código fuente real busca preservar esta capacidad tras la cuantización.
- Agentes autónomos con tool calling: los esquemas de function calling del panel de calibración y la capa MTP lo hacen adecuado para bucles agénticos de varios pasos donde el modelo decide qué herramienta invocar.
- Razonamiento matemático asistido: resolución de problemas paso a paso con modo thinking, útil en herramientas educativas o de verificación de cálculos.
- Despliegue en estación de trabajo: con la vista `k6-compact` (358,9 GiB totales) puede servirse en un conjunto reducido de RTX PRO 6000 y DGX Sparks mediante cuteafd, habilitando prototipado local de un modelo de clase 200B+.
- Servicio multi-tenant con presupuesto de memoria ajustado: la vista `k8-compact` (362,7 GiB) reduce memoria respecto al núcleo BF16 con calidad casi original, adecuada cuando se prioriza calidad sobre ahorro máximo.
- Referencia de calidad para evaluación: la vista `original` conserva el núcleo BF16 byte a byte, por lo que sirve como referencia contra la que medir el impacto de las vistas compactas en una evaluación interna.
- Investigación sobre cuantización MoE: los ficheros `quantization-provenance.json` y `quantization-errors/` permiten reproducir y auditar el error de cuantización por capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los números del README de cuteafd, medidos en 1× RTX PRO 6000 + 4× DGX Spark y en 2× RTX PRO 6000 + 6× DGX Spark, pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM/almacenamiento estimado: la vista `original` ocupa 378,1 GiB, la `k8-compact` 362,7 GiB y la `k6-compact` 358,9 GiB. El repositorio completo pesa 434,8 GB.
- GPU medidas por el autor: 1× RTX PRO 6000 + 4× DGX Spark, y 2× RTX PRO 6000 + 6× DGX Spark.
- No cabe en una GPU de consumo individual (RTX 4090, etc.); requiere reparto multi-dispositivo.
- Despliegue: runtime cuteafd (soporte nativo del formato multi-core mediante `CORE_VIEW=original|k8-compact|k6-compact`). Otros runtimes necesitan soporte de expertos EXL3 MCG K4 y de la vista de núcleo elegida; la vista `original` solo requiere BF16 para el núcleo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-EXL3-K4-MC | 209,1 B | no disponible | Expertos EXL3 K4 + nucleo BF16/K8/K6 | glm-5.3 | Hugging Face (139 descargas) |
| zai-org/GLM-5.3-BF16 | 209,1 B (mismo base) | no disponible | BF16 completo | glm-5.3 | Hugging Face (modelo base) |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el checkpoint BF16 del que deriva: misma arquitectura y parámetros, pero el BF16 completo ocupa aproximadamente 1,4 TB según la model card, frente a los 358,9–378,1 GiB de las vistas de este repositorio.

## Limitaciones y advertencias

- Sesgos: no disponible; no se documentan evaluaciones de sesgo para esta cuantización.
- Alucinación: no hay evaluación publicada del impacto de la cuantización en la tasa de alucinación; la calibración mitiga pero no elimina la degradación.
- Idiomas: la lista de idiomas soportados no está documentada; el texto multilingüe del panel de calibración no garantiza cobertura de todos los idiomas.
- Licencia: se aplica la licencia glm-5.3 del modelo original, marcada como `other`; es imprescindible revisar sus términos antes de cualquier uso comercial.
- Runtime: el formato multi-core está diseñado para cuteafd; otros motores de inferencia necesitan soporte específico de EXL3 MCG K4 y de las vistas de núcleo.
- Calidad: las vistas `k8-compact` y `k6-compact` reducen la precisión del núcleo denso; la model card solo afirma calidad "casi original" para K8, sin cifras.
- Procedencia: es una cuantización de terceros (wrldsuksgo2mars), no una publicación oficial de zai-org; conviene validar el comportamiento en el dominio propio antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-EXL3-K4-MC
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16/blob/9d2398f478cab2de883137db3a36ad2c96205e24/LICENSE
- Dataset de calibración: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
- Runtime cuteafd: https://github.com/tpurtell/cuteafd
- Especificación del formato multi-core: https://github.com/tpurtell/cuteafd/blob/dev/docs/mc-checkpoints.md
- Página de GLM 5.3 en cuteafd: https://github.com/tpurtell/cuteafd/blob/dev/docs/models/glm5.md
- Benchmarks de cuteafd: https://github.com/tpurtell/cuteafd#models
- Fork del cuantizador: https://github.com/tpurtell/GPTQModel
- Pull request del fork para núcleo K1–K8: https://github.com/tpurtell/GPTQModel/pull/5
- GPTQModel upstream: https://github.com/ModelCloud/GPTQModel

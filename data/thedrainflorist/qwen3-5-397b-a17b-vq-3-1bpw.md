# TheDrainFlorist/Qwen3.5-397B-A17B-VQ-3.1bpw

## Resumen

El modelo `TheDrainFlorist/Qwen3.5-397B-A17B-VQ-3.1bpw` es una cuantización vectorial (vector quantization) del modelo Qwen3.5-397B-A17B, desarrollada por TheDrainFlorist para ejecutarse en Apple Silicon mediante la librería `mlx-lm`. El modelo base, creado por Alibaba Qwen, es un mixture-of-experts multimodal con arquitectura *gated delta networks* que combina 397 mil millones de parámetros totales y 17 mil millones activos por token. Esta build concreta reduce el tamaño del artefacto a 142.8 GiB (frente a los 165.6 GiB de una cuantización escalar de 3.5 bits) manteniendo una calidad comparable en perplejidad, gracias a una técnica de codebooks aprendidos en espacio de pesos.

La relevancia de esta ficha radica en que demuestra una vía práctica para ejecutar un modelo de 397B en hardware de memoria unificada de alta gama (≥192 GB) o en clústeres exo, sin necesidad de parches ni forks. El autor reporta una velocidad de decodificación de ~17.4 tokens por segundo en un clúster de dos máquinas Apple Silicon, y ~19-22 tok/s en una sola máquina M4 Max para la versión de 2.4 bits. Incluye además la torre de visión completa del modelo base, aunque `mlx-lm` actualmente solo procesa texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con *gated delta networks*; cuantización vectorial con codebooks por tensor |
| Parametros totales | 397B (modelo base); el archivo safetensors cuantizado contiene 42.195.805.680 parámetros (índices y escalas) |
| Parametros activos | 17B (por token) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base soporta contexto largo, pero no se especifica el valor para esta build) |
| Tipos de cuantizacion | Vector quantization de 3.1 bits por peso (3.00 bits/weight en la región de expertos); codebooks de 2048 entradas con índices de 11 bits por grupo de 4 pesos |
| Idiomas soportados | Inglés (declarado en la model card; el modelo base es multilingüe, pero esta build solo etiqueta `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (empaquetado sub-byte en uint32), compatible con `mlx-lm` y exo |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-397B-A17B emplea una arquitectura MoE con *gated delta networks*, una variante de atención que combina mecanismos de actualización diferencial con puertas aprendidas. Tiene 397B parámetros totales y 17B activos por token, lo que lo sitúa en la categoría de modelos de gran escala pero con inferencia eficiente. El modelo es nativamente multimodal (visión y lenguaje) y está entrenado para razonamiento, codificación y uso como agente.

La cuantización VQ-3.1bpw aplica una estrategia de precisión mixta por sensibilidad de capas: atención, routers MoE, embeddings y la cabeza de salida se mantienen en mayor precisión, mientras que los expertos (aproximadamente el 85% de los parámetros) reciben la cuantización agresiva. La innovación clave es el uso de *vector quantization* en lugar de redondeo escalar: se aprende un codebook de 2048 patrones conjuntos de 4 pesos, y cada grupo de 4 pesos se codifica con un índice de 11 bits. Los codebooks se ajustan mediante k-means en el espacio de pesos, sin calibración con corpus externos, lo que evita sesgos hacia dominios específicos. Los códigos se empaquetan en palabras uint32 de 32 códigos, permitiendo tamaños no alineados a bytes. El autor reporta que la perplejidad del artefacto empaquetado coincide con la versión desempaquetada hasta cuatro decimales.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo de la familia Qwen3.5, incluye modo *thinking* que consume tokens adicionales antes de responder.
- Codificación: el modelo base destaca en generación y comprensión de código, y esta cuantización mantiene una perplejidad en código comparable a cuantizaciones escalares de 3.5 bits.
- Multimodalidad (parcial): el artefacto incluye la torre de visión completa (333 tensores, 0.85 GiB) a precisión original, pero `mlx-lm` la ignora; exo puede cargarla directamente. `mlx-vlm` tiene soporte en revisión (PR #1926).
- Tool calling y agentes: el modelo base soporta estas capacidades, aunque no se especifica si la cuantización las preserva íntegramente; se asume que sí al mantener la arquitectura.
- Multilingüismo: el modelo base es multilingüe, pero esta build solo declara inglés; no se han verificado otros idiomas.

## Casos de uso

- Inferencia local en Apple Silicon de gama alta: en una Mac Studio o Mac Pro con ≥192 GB de memoria unificada, se puede ejecutar el modelo completo con `mlx-lm` para generación de texto, razonamiento y código sin depender de la nube.
- Clústeres exo para modelos grandes: con dos o más máquinas Apple Silicon (por ejemplo, M3 Ultra 96 GB + M4 Max 128 GB) conectadas por Thunderbolt, se puede desplegar el modelo mediante exo, con una modificación de una línea para replicar los codebooks VQ en lugar de particionarlos.
- Desarrollo de asistentes de código: gracias a su baja perplejidad en código (2.5987) y su capacidad de razonamiento, puede usarse como backend para autocompletado o generación de código en entornos de desarrollo locales.
- Investigación en cuantización: la metodología VQ documentada (codebooks en espacio de pesos, empaquetado sub-byte) sirve como referencia para otros proyectos de compresión de modelos.
- Prototipado de agentes conversacionales: con su modo *thinking* y soporte de tool calling, puede integrarse en pipelines de agentes que requieran razonamiento multi-paso, siempre que se presupueste el número de tokens de pensamiento.
- Evaluación de perplejidad en dominios específicos: al no depender de calibración, es adecuado para medir la degradación de calidad en corpus propios (prosa o código) sin sesgo hacia conjuntos de validación.

## Benchmarks y rendimiento

El autor proporciona mediciones de perplejidad sobre dos corpus, reproducidas bit-idénticamente dos veces y evaluadas con `mlx-lm` sin modificar:

| Métrica | Este modelo (VQ-3.1bpw, 142.8 GiB) | spicyneuron 3.5bit (165.6 GiB) | VQ-2.4bpw (propio) |
|---|---|---|---|
| Perplejidad wikitext (raw, prefix-8192) | **2.3519** | 2.3614 | 2.7655 |
| Perplejidad código (lenguaje mixto) | 2.5987 | 2.6005 | 2.6383 |

No se han ejecutado suites de tareas estándar (HellaSwag, PIQA, WinoGrande, MMLU, etc.) sobre esta cuantización. El autor advierte que no se deben comparar perplejidades entre corpus o harnesses diferentes.

## Requisitos de hardware

- Memoria: se necesitan ≥192 GB de memoria unificada para cargar los 142.8 GiB del artefacto en una sola máquina. No cabe en una Mac de 128 GB.
- GPU recomendadas: Apple Silicon con memoria unificada (M3 Ultra, M4 Max, etc.) o clústeres exo con múltiples máquinas. No es compatible con GPUs NVIDIA/AMD convencionales, ya que el formato es MLX.
- Opciones de despliegue: `mlx-lm` para generación de texto; exo para clústeres (con la modificación de replicar codebooks). `mlx-vlm` está pendiente de soporte.
- Rendimiento medido: ~17.4 tok/s en un clúster exo (M3 Ultra 96 GB + M4 Max 128 GB, tensor-sharded) con prompt corto; la versión VQ-2.4bpw alcanza 19-22 tok/s en un solo M4 Max. No hay mediciones en una sola máquina de ≥192 GB.
- Latencia de *prefill*: no disponible; el autor solo reporta decodificación.

## Comparativa con modelos similares

| Modelo | Tamaño | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-397B-A17B (original) | ~800 GB (FP16) | 397B total, 17B activo | No disponible | Apache-2.0 | Safetensors | Modelo base multimodal, requiere GPUs de centro de datos |
| Qwen3.5-397B-A17B-FP8 (oficial) | ~400 GB | 397B total, 17B activo | No disponible | Apache-2.0 | Safetensors | Checkpoint FP8 recomendado para servir con vLLM |
| spicyneuron 3.5bit (cuantización escalar) | 165.6 GiB | 397B total, 17B activo | No disponible | Apache-2.0 | MLX | Cuantización escalar de 3.5 bits, calidad similar en código |
| TheDrainFlorist VQ-3.1bpw (este modelo) | 142.8 GiB | 397B total, 17B activo | No disponible | Apache-2.0 | MLX | Vector quantization, mejor perplejidad en wikitext que 3.5bit escalar, 22.8 GiB más pequeño |

## Limitaciones y advertencias

- Requiere hardware muy específico: ≥192 GB de memoria unificada o un clúster exo; no es desplegable en GPUs convencionales ni en la mayoría de estaciones de trabajo.
- `mlx-lm` solo procesa texto; la torre de visión incluida no se utiliza en este runtime. El soporte multimodal requiere exo o `mlx-vlm` (aún en revisión).
- Es un modelo de razonamiento (*thinking*): consume una parte significativa del presupuesto de tokens en pensamiento interno, por lo que hay que configurar `max-tokens` generosamente para obtener respuestas completas.
- No se han ejecutado benchmarks de tareas (HellaSwag, MMLU, etc.); solo se dispone de perplejidad en dos corpus. La calidad en tareas específicas no está verificada.
- La perplejidad en código es solo ligeramente mejor que la cuantización escalar de 3.5 bits (0.07% de diferencia), mientras que en prosa la mejora es mayor; el rendimiento puede variar según el dominio.
- El autor no ha medido el rendimiento en una sola máquina de ≥192 GB; las cifras de velocidad provienen de un clúster o de la versión de 2.4 bits.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales de uso (consultar la documentación de Qwen).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheDrainFlorist/Qwen3.5-397B-A17B-VQ-3.1bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Colección Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Recetas vLLM para Qwen3.5-397B-A17B: https://recipes.vllm.ai/Qwen/Qwen3.5-397B-A17B
- Repositorio exo: https://github.com/exo-explore/exo
- PR de soporte en mlx-vlm: https://github.com/Blaizzy/mlx-vlm/pull/1926

# ulkaa/Ornith-1.5-35B-A3B-AWQ-INT4

## Resumen

Ornith-1.5-35B-A3B-AWQ-INT4 es una cuantización AWQ en formato W4A16 del modelo multimodal Ornith-1.5-35B-A3B, desarrollado por ornith-ai. La cuantización ha sido realizada por el usuario ulkaa y está optimizada para su ejecución mediante SGLang sobre GPUs Intel Arc Pro de la serie B, aunque también es compatible con otras plataformas. Se trata de un modelo de arquitectura Qwen3.5-MoE con 35,81 mil millones de parámetros totales y 3 mil millones activos por token, lo que lo sitúa en la categoría de MoE de alto rendimiento con eficiencia de inferencia.

La cuantización cubre únicamente los expertos enrutados (30.720 módulos), dejando en BF16 la cabeza de predicción multitoken (MTP), el vision tower, las capas de atención lineal y los embeddings. Esto preserva la capacidad de decodificación especulativa y la comprensión multimodal del modelo original. Con una ventana de contexto de 262.144 tokens, el modelo resulta adecuado para tareas que requieren razonamiento largo, análisis de documentos extensos y procesamiento conjunto de imagen y texto.

La relevancia de esta versión reside en que permite ejecutar un modelo de 35B con calidad cercana al original en hardware de consumo o en GPUs profesionales de gama media, reduciendo la huella de memoria a aproximadamente 26 GB. La licencia MIT facilita su uso comercial y académico sin restricciones de atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (mixture of experts con atención lineal híbrida) |
| Parametros totales | 35,81 B (32,21 B cuantizados a 4 bits + 3,6 B en BF16) |
| Parametros activos | 3 B (A3B) |
| Longitud de contexto | 262.144 tokens (configuración nativa) |
| Tipos de cuantizacion | AWQ W4A16, asimétrica, grupo de tamaño 32, formato pack-quantized |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | compressed-tensors (pack-quantized), safetensors |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B presenta una arquitectura Qwen3.5-MoE de 40 capas, con 256 expertos por capa y 8 expertos activos por token. Cada experto tiene un tamaño intermedio de 512. La arquitectura combina 30 capas con atención lineal (linear attention) y 10 capas con atención completa, lo que reduce el coste computacional en contextos largos. Incluye además una vision tower de 27 bloques para el procesamiento de imágenes y una cabeza de predicción multitoken (MTP) de 822 millones de parámetros, con 256 expertos propios, que se preserva íntegramente en BF16 en esta cuantización.

El proceso de cuantización AWQ se realizó con llm-compressor, con un esquema W4A16 asimétrico y grupo size 32. La calibración utilizó 512 secuencias de 1024 tokens, compuestas por un 60% de instrucciones de código (de codeparrot/self-instruct-starcoder) y un 40% de instrucciones generales (de HuggingFaceH4/ultrachat_200k), con formato de chat. La cuantización se ejecutó de forma secuencial capa por capa, calibrando cada capa contra la salida de las capas anteriores ya cuantizadas. Los pesos de los expertos se cuantizaron con grupo size 32 en lugar de 128, porque los expertos son estrechos (intermediate size 512) y necesitan una mayor resolución para evitar pérdida de calidad por outliers.

No se dispone de información detallada sobre el preentrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card indica que el modelo es multimodal y conversacional, pero no ofrece más detalles.

## Capacidades

- Generación de texto y razonamiento multi-step: el modelo es capaz de realizar tareas de razonamiento aritmético y silogístico, como se verificó en la prueba de coherencia.
- Comprensión multimodal: acepta entrada de imágenes y texto, y puede identificar propiedades de las imágenes (por ejemplo, color dominante).
- Decodificación especulativa: el MTP head preservado en BF16 permite la predicción de múltiples tokens en cada paso, acelerando la inferencia en SGLang.
- Contexto largo: con 262.144 tokens de ventana, puede procesar documentos extensos o conversaciones de muchos turnos.
- Soporte de tool calling: no está documentado explícitamente, pero el modelo es de tipo conversacional y compatible con la arquitectura Qwen3.5-MoE, que suele soportar llamadas a funciones en su configuración original. No se confirma en esta versión cuantizada.
- Capacidad multilingüe: no se ha especificado los idiomas soportados en la información disponible.

## Casos de uso

- Análisis de documentos largos con imagen y texto: el modelo puede procesar contratos, informes o libros completos con contexto de 262.144 tokens, extrayendo información de imágenes y texto de manera conjunta. Su capacidad de atención lineal reduce el coste de memoria en contextos extensos.
- Asistente de programación con contexto de repositorio completo: gracias a su ventana de 262.000 tokens, puede recibir un repositorio entero y generar código o sugerir correcciones, con soporte de razonamiento matemático y lógico.
- Inferencia multimodal en hardware de gama media: la cuantización INT4 permite ejecutar el modelo en GPUs con 24 GB de VRAM, como la RTX 4090, o en GPUs Intel Arc Pro B70, lo que lo hace adecuado para entornos de desarrollo sin acceso a hardware de gran escala.
- Decodificación especulativa para servicios de chat: el MTP head preservado permite acelerar la generación de texto en producción, reduciendo la latencia en sistemas de atención al cliente automatizada o asistentes virtuales.
- Investigación en IA multimodal: al estar licenciado bajo MIT, es apto para estudios académicos sobre razonamiento visual, alucinación y evaluación de modelos MoE cuantizados.
- Despliegue en entornos corporativos con GPUs Intel: la compatibilidad con SGLang y la cuantización W4A16 permite su uso en infraestructuras basadas en Intel Arc Pro, facilitando su adopción en empresas que ya usan ese hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona una "prueba de coherencia" determinista, que verifica respuestas correctas en razonamiento multi-paso, generación de código, respuesta factual y procesamiento de imagen. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks comparativos.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 26,2 GB, por lo que la inferencia con cuantización INT4 requiere al menos 20-24 GB de VRAM para los pesos completos, más memoria para las activaciones en BF16 (que son significativas en contexto de 262k tokens). Se recomienda una GPU con 24 GB o más.
- GPUs compatibles: Intel Arc Pro B-series (B70, B60) son las objetivo de la cuantización; también puede ejecutarse en GPUs NVIDIA con suficiente VRAM (RTX 3090, RTX 4090, A6000) y en servidores con A100 o H100.
- No cabe en GPUs de consumo de 12-16 GB (por ejemplo, RTX 3080, RTX 4070) sin técnicas adicionales de offloading.
- Opciones de despliegue: SGLang es el runtime principal recomendado (con soporte para MTP y decodificación especulativa); también se puede usar vLLM o llama.cpp si soportan el formato compressed-tensors. La model card indica compatibilidad con "endpoints_compatible" para SGLang.
- Latencia y throughput: no se han publicado datos de latencia o throughput. El MTP head, al estar en BF16, añade un coste de memoria adicional de aproximadamente 0,82 GB, pero acelera la generación en SGLang al reducir el número de pasos de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-AWQ-INT4 | 35,81 B | 3 B | 262.144 | MIT | Cuantizado, listo para SGLang |
| Qwen3-30B-A3B (base similar) | 30,5 B | 3 B | 131.072 | Apache 2.0 | Disponible en BF16 y cuantizado |
| OLMo-2-32B (MoE) | 32 B | 4 B | 4096 | Apache 2.0 | Disponible en BF16 |

No se dispone de resultados de benchmarks comparativos entre estos modelos. La comparación se limita a especificaciones técnicas. La ventaja de Ornith-1.5 es su mayor contexto (262k frente a 131k del Qwen3) y su licencia MIT, mientras que Qwen3-30B tiene más soporte de herramientas y una comunidad más amplia.

## Limitaciones y advertencias

- Sin benchmarks publicados: la calidad no está validada con métricas estándar; solo se ha pasado una prueba de coherencia determinista, que no es comparable a MMLU o HumanEval.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en tareas factuales o de razonamiento complejo.
- Sesgos: no se ha documentado ningún análisis de sesgos; el modelo puede reflejar sesgos presentes en sus datos de entrenamiento, que no se han hecho públicos.
- Limitaciones de contexto: aunque la ventana es de 262.144 tokens, el coste de memoria de las activaciones BF16 puede hacer que el uso real de la ventana completa sea inviable en GPUs de 24 GB; se recomienda usar contextos menores en la práctica.
- Limitaciones de idioma: no se ha especificado los idiomas soportados, por lo que se recomienda probar la calidad en el idioma objetivo antes de desplegar en producción.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el modelo base puede tener licencia MIT también, por lo que no hay restricciones conocidas. No obstante, se recomienda revisar la licencia del modelo base original.
- MTP head no disponible en transformers: la librería transformers no instancia el módulo MTP para la arquitectura Qwen3.5-MoE, por lo que el modelo solo aprovecha la decodificación especulativa cuando se sirve con SGLang.

## Enlaces

- [Hugging Face del modelo cuantizado](https://huggingface.co/ulkaa/Ornith-1.5-35B-A3B-AWQ-INT4)
- [Modelo base Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Resultados de coherencia (coherence-results.json)](https://huggingface.co/ulkaa/Ornith-1.5-35B-A3B-AWQ-INT4/blob/main/coherence-results.json)
- [Cuantización de referencia para Ornith-1.0 (cyankiwi/Ornith-1.0-35B-AWQ-INT4)](https://huggingface.co/cyankiwi/Ornith-1.0-35B-AWQ-INT4)
- [Documentación de SGLang](https://github.com/sgl-project/sglang)

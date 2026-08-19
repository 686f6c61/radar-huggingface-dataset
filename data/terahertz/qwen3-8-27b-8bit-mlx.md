# terahertz/Qwen3.8-27B-8bit-MLX

## Resumen

El modelo `terahertz/Qwen3.8-27B-8bit-MLX` es una cuantización no oficial en 8 bits del modelo vision-language `Qwen/Qwen3.8-27B`, realizada con la librería MLX y optimizada para inferencia en Apple Silicon. El modelo original, desarrollado por el equipo Qwen de Alibaba, es un modelo denso multimodal con arquitectura híbrida que combina capas de Gated DeltaNet y atención gated, capaz de procesar texto, imágenes y vídeo, y que soporta modos de razonamiento explícito (thinking) y no explícito.

Esta versión cuantizada reduce sustancialmente los requisitos de memoria frente al checkpoint BF16 original (de aproximadamente 55 GB a unos 29,5 GB), manteniendo una precisión numérica mayor que cuantizaciones más agresivas de 4 o 5 bits. El contexto nativo es de 262 144 tokens, ampliable hasta 1 millón mediante YaRN en motores de inferencia compatibles. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en que permite ejecutar un VLM de 27 000 millones de parámetros en Macs con memoria unificada suficiente, sin necesidad de GPUs dedicadas, manteniendo un equilibrio entre fidelidad del modelo y eficiencia de memoria. Es una opción interesante para desarrolladores que trabajan en entornos Apple y necesitan capacidades multimodales avanzadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + capas de atención gated (modelo denso) |
| Parametros totales | 27 780 millones (según model card; safetensors reporta 8 027 131 120, posible discrepancia) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo; hasta 1 000 000 con YaRN |
| Tipos de cuantizacion | MLX affine 8-bit, group size 64, efectivo 8,627 bits/peso |
| Idiomas soportados | No disponible en la documentación proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer multimodal denso que emplea una arquitectura híbrida con capas de Gated DeltaNet (una variante de atención lineal con estado recurrente) intercaladas con capas de atención gated tradicional. Esta combinación busca reducir el coste computacional del mecanismo de atención en secuencias largas, manteniendo la capacidad de modelar dependencias a largo plazo. El modelo acepta entradas de texto, imágenes y vídeo, y está diseñado para tareas de razonamiento, codificación, agéntica y comprensión multimodal.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. La cuantización se realizó con `mlx-vlm` sobre los pesos BF16 oficiales, sin fine-tuning ni modificación adicional de los pesos. El proceso de conversión reportó una tasa efectiva de 8,627 bits por peso, ligeramente superior a 8 bits debido a que no todos los tensores se cuantizan y a que se almacenan metadatos de escala y sesgo.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa texto, imágenes y vídeo, incluyendo comprensión de documentos, gráficos científicos y diagramas.
- Modos de pensamiento: soporta modos explícitos (thinking) y no explícitos (non-thinking), permitiendo elegir entre razonamiento detallado y respuestas directas.
- Codificación y razonamiento científico: diseñado para tareas de programación y análisis técnico-científico.
- Tareas agénticas y de largo horizonte: capaz de manejar flujos de trabajo multi-paso y razonamiento encadenado.
- Multilingüe: aunque la documentación no especifica la lista de idiomas, el modelo base Qwen3.8-27B es multilingüe (no se detalla en esta ficha).
- Tool calling / function calling: no se menciona explícitamente en la documentación, pero es una capacidad habitual en la familia Qwen; no se confirma en esta versión.

## Casos de uso

- Análisis de documentos técnicos y científicos: el modelo puede extraer información de PDFs, gráficos y tablas, resumiendo contenido complejo o respondiendo preguntas específicas sobre diagramas y figuras. Su contexto de 262 144 tokens permite procesar documentos extensos en una sola pasada.
- Asistente de codificación con contexto visual: al aceptar imágenes, puede interpretar capturas de pantalla de errores, diagramas de arquitectura o esquemas UML y generar código o explicaciones basadas en ellos.
- Automatización de tareas agénticas multimodales: combinado con frameworks de agentes, puede ejecutar flujos que requieren leer imágenes, razonar sobre ellas y tomar decisiones secuenciales, como inspección visual de UI o análisis de imágenes médicas (con las debidas validaciones).
- Procesamiento de vídeo para resúmenes o búsqueda de eventos: el modelo acepta entradas de vídeo, permitiendo generar descripciones, detectar momentos relevantes o responder preguntas sobre contenido audiovisual.
- Educación y tutoría interactiva: puede explicar conceptos científicos apoyándose en figuras, gráficas o vídeos, adaptando la respuesta al nivel del usuario y mostrando el razonamiento paso a paso en modo thinking.
- Investigación en entornos Apple Silicon: sirve como plataforma de experimentación para desarrolladores que necesitan un VLM local en Mac, sin depender de servicios en la nube, para prototipado rápido o para integrar en aplicaciones de escritorio con privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las capacidades, limitaciones y resultados del modelo cuantizado deben considerarse los del modelo original a menos que se evalúen específicamente sobre esta versión, y no se afirma que reproduzca exactamente las puntuaciones del checkpoint BF16.

## Requisitos de hardware

- Memoria unificada estimada: el repositorio ocupa 29,5 GB, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada para cargar el modelo y dejar margen para el KV-cache y el sistema. Para contextos largos (cercanos a 262 144 tokens), serán necesarios 64 GB o más.
- GPU: no requiere GPU dedicada; funciona en cualquier Apple Silicon (M1, M2, M3, M4) con suficiente memoria unificada. El rendimiento dependerá del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: MLX y MLX-VLM son las librerías principales. También puede ejecutarse mediante `mlx_vlm.generate` desde línea de comandos o integrarse en aplicaciones Python.
- Latencia y throughput: no se proporcionan datos específicos. En general, un modelo de 27B en 8-bit en un Mac Studio M2 Ultra puede generar decenas de tokens por segundo, pero depende de la configuración exacta y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos. Como referencia cualitativa:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27,78B | 262 144 | BF16 | Apache-2.0 | HuggingFace |
| terahertz/Qwen3.8-27B-8bit-MLX | 27,78B | 262 144 | MLX 8-bit | Apache-2.0 | HuggingFace |
| Otras cuantizaciones (4-bit, 5-bit) | 27,78B | 262 144 | MLX 4/5-bit | Apache-2.0 | No disponibles en esta búsqueda |

La comparativa con otros VLM de tamaño similar (por ejemplo, Llama 3.2 Vision o InternVL) no se puede realizar sin datos de benchmarks y especificaciones verificadas.

## Limitaciones y advertencias

- Cuantización no oficial: es una conversión comunitaria, no avalada por el equipo Qwen. No se garantiza que reproduzca exactamente el comportamiento del modelo original.
- Posible degradación de rendimiento: la cuantización 8-bit puede introducir pequeñas pérdidas de precisión en tareas sensibles, aunque menor que cuantizaciones de 4 o 5 bits.
- Dependencia de MLX-VLM: la disponibilidad de funciones multimodales (vídeo, imágenes) depende de la versión de MLX-VLM utilizada; algunas capacidades pueden no estar implementadas.
- Requisitos de memoria elevados: aunque menor que BF16, 29,5 GB de pesos exigen un Mac con al menos 32 GB de RAM unificada, y contextos largos pueden requerir más.
- Sesgos y alucinaciones: no se han evaluado específicamente en esta versión; se heredan los del modelo base, que no se detallan en la documentación.
- Uso en producción: al ser una cuantización no oficial, se recomienda validar el comportamiento en el caso de uso concreto antes de desplegarlo en entornos críticos.

## Enlaces

- Modelo cuantizado: https://huggingface.co/terahertz/Qwen3.8-27B-8bit-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería MLX: https://github.com/ml-explore/mlx
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm

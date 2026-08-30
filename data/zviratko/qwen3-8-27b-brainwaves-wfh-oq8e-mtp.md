# zviratko/Qwen3.8-27B-Brainwaves-WFH-oQ8e-mtp

## Resumen

El modelo `zviratko/Qwen3.8-27B-Brainwaves-WFH-oQ8e-mtp` es una cuantización mixta de 8 bits del modelo Qwen3.8-27B, realizada por el usuario zviratko mediante la herramienta oMLX (oQ) en su versión 0.6.4. El nombre sugiere que se trata de una variante fine-tuned denominada "Brainwaves-WFH" (posiblemente orientada a trabajo desde casa), aunque no se proporciona documentación adicional sobre dicho ajuste. La cuantización está optimizada para el ecosistema MLX de Apple Silicon, con formato de pesos en safetensors.

A pesar de que el nombre indica 27B parámetros, el recuento real de parámetros según los tensores safetensors es de 8.184.279.792 (~8,18 mil millones), lo que resulta contradictorio. Esta discrepancia puede deberse a un error en la metadata o a que el modelo base sea en realidad una versión más pequeña. El repositorio ocupa 30 GB, consistente con una cuantización de 8 bits de un modelo de ~27B, pero el número de parámetros no coincide. Se recomienda verificar la integridad del modelo antes de su uso.

El modelo está etiquetado con `region:us`, lo que podría indicar restricciones geográficas o de uso, aunque no se especifica. No se dispone de licencia declarada, idiomas soportados ni pipeline de inferencia. Es una publicación reciente (agosto de 2026) con cero descargas y un solo "like", lo que sugiere que es un experimento personal o una cuantización de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según etiqueta; el modelo base Qwen3.8-27B usa atención híbrida con atención lineal en 48 de 64 capas, torre de visión y MTP) |
| Parametros totales | 8.184.279.792 (según safetensors; el nombre sugiere 27B, discrepancia no resuelta) |
| Parametros activos | no disponible (no se indica si es MoE; el modelo base es denso) |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B tiene 262K nativo, extensible a 1M, pero no se confirma para esta cuantización) |
| Tipos de cuantizacion | 8 bits, group size 64, cuantización mixta (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La cuantización se realizó con oMLX v0.6.4, que aplica cuantización mixta de precisión (oQ) con 8 bits y group size de 64. El modelo base es Qwen3.8-27B, un modelo denso multimodal de Alibaba con atención híbrida: 48 de sus 64 capas usan atención lineal (para reducir coste computacional) y las restantes usan atención completa. Incluye una torre de visión para entrada de imágenes y un "draft head" MTP (Multi-Token Prediction) para decodificación especulativa. El contexto nativo es de 262K tokens, extensible a 1M.

No se dispone de información sobre el fine-tuning "Brainwaves-WFH" ni sobre los datos de entrenamiento de la cuantización. La cuantización en sí no modifica la arquitectura, solo los pesos, por lo que las capacidades del modelo base se mantienen en principio, aunque con posible degradación por la pérdida de precisión.

## Capacidades

- Generación de texto y razonamiento: al ser una cuantización de Qwen3.8-27B, conserva las capacidades de razonamiento y generación del modelo original, incluyendo modos "thinking" e "instruct".
- Multimodalidad: el modelo base acepta entradas de imagen y texto, por lo que esta versión debería poder procesar imágenes, aunque no se ha verificado en esta cuantización.
- Codificación y agentes: el modelo base destaca en tareas de coding y flujos agénticos, con soporte para tool calling y uso de herramientas de larga duración.
- Decodificación especulativa: gracias al MTP draft head, puede acelerar la inferencia, aunque en MLX esta característica podría no estar completamente implementada.
- Multilingüismo: no se especifican idiomas, pero el modelo base de Qwen soporta múltiples idiomas, incluyendo español, inglés, chino, etc.

## Casos de uso

- Asistente de programación local: al ser una cuantización de 8 bits, puede ejecutarse en Mac con Apple Silicon (MLX) para generar código, explicar fragmentos y refactorizar, aprovechando el soporte de tool calling del modelo base.
- Automatización de oficina (WFH): el nombre "Brainwaves-WFH" sugiere un fine-tuning orientado a trabajo remoto, por lo que podría usarse para redactar correos, resumir reuniones o gestionar tareas administrativas, aunque no hay evidencia concreta.
- Análisis de documentos con imágenes: si la cuantización conserva la torre de visión, podría procesar capturas de pantalla, diagramas o documentos escaneados para extraer información.
- Prototipado de agentes conversacionales: con 8 bits y MLX, es viable desplegar un chatbot local con memoria de contexto largo (si se mantiene la ventana de 262K) para pruebas de concepto.
- Educación y aprendizaje: como modelo de razonamiento, puede servir para tutoría interactiva en matemáticas, ciencias o programación, ejecutándose en hardware de consumo.
- Investigación en cuantización: este repositorio puede ser útil para estudiar el impacto de la cuantización mixta oQ en modelos de la familia Qwen, comparando métricas de perplejidad y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para esta cuantización específica. El modelo base Qwen3.8-27B reporta rendimiento de nivel frontier en coding y agentes, pero no se puede extrapolar a esta versión cuantizada sin evaluación propia.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 30 GB, por lo que se necesitan al menos 30 GB de memoria unificada en Apple Silicon (o VRAM en GPU) para cargar los pesos en 8 bits. Con overhead de inferencia, se recomiendan 32 GB o más.
- GPU recomendadas: Mac con chip M1 Pro/Max/Ultra o M2/M3/M4 con 32 GB o más de RAM unificada. En GPU NVIDIA, MLX no es compatible directamente; se necesitaría convertir a otro formato (GGUF, etc.).
- Si cabe en consumer GPU: no, 30 GB excede la VRAM de GPUs de consumo típicas (RTX 4090 tiene 24 GB). Solo en Mac con alta memoria unificada o GPUs profesionales (A100, H100).
- Opciones de despliegue: MLX (librería nativa), posiblemente a través de `mlx-lm` o `mlx-lm-server`. No es compatible con vLLM, llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: no disponible. La decodificación especulativa del MTP podría mejorar la velocidad, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base Qwen3.8-27B se puede comparar con otros modelos de 27B como Llama 3.3 70B (más grande) o Mistral Large 2, pero esta cuantización concreta no tiene datos propios. Como referencia, otras cuantizaciones de Qwen3.8-27B en MLX (por ejemplo, las oficiales de Qwen) podrían ser alternativas, pero no se han encontrado en la búsqueda. Se recomienda consultar el repositorio original de Qwen3.8-27B para comparativas del modelo sin cuantizar.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Esto es un riesgo legal importante para cualquier despliegue en producción.
- Discrepancia en parámetros: el nombre indica 27B pero los safetensors muestran ~8,18B. Esto puede deberse a un error de subida o a un modelo base diferente. Verificar antes de usar.
- Sin documentación del fine-tuning: se desconoce qué es "Brainwaves-WFH" y cómo afecta al comportamiento del modelo.
- Posible degradación por cuantización: la cuantización de 8 bits con group size 64 puede introducir pérdida de precisión, especialmente en tareas de razonamiento complejo o matemáticas.
- Sin benchmarks: no hay evidencia de rendimiento real, por lo que no se puede garantizar la calidad.
- Limitado a MLX: solo funciona en Apple Silicon; para otros entornos se requiere conversión, lo que puede ser complejo.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje, puede generar información falsa o sesgada, y no se han documentado medidas de mitigación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zviratko/Qwen3.8-27B-Brainwaves-WFH-oQ8e-mtp
- Repositorio del modelo base Qwen3.8-27B (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de Qwen3.8-27B en Groq: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Herramienta oMLX (oQ): https://github.com/jundot/omlx

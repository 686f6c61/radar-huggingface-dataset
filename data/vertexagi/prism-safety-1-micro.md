# VertexAGI/prism-safety-1-micro

## Resumen

Prism Safety 1 Micro es un clasificador de seguridad de contenido basado en texto, desarrollado por VertexAGI. Se trata de un ajuste fino LoRA sobre el modelo Qwen3-1.7B, especializado en etiquetar un mensaje de usuario, una respuesta de asistente o un intercambio completo como `SAFE` o `UNSAFE`, acompañando la etiqueta con una justificación de una frase. Su propósito principal es servir como capa de moderación local para filtrar el tráfico hacia y desde modelos de mayor tamaño, evitando una segunda llamada a una API externa.

El modelo forma parte de la familia Prism de modelos pequeños y de propósito único. Con 268,9 millones de parámetros (el adaptador LoRA, sobre el base de 1,7B), está diseñado para ejecutarse en hardware de consumo, incluyendo Apple Silicon gracias a su formato MLX. Se ha entrenado con una mezcla de datos anotados por humanos y datos sintéticos generados por plantillas, y se publica bajo licencia Apache 2.0. Su relevancia radica en ofrecer una alternativa ligera y localizable a los guard models comerciales, aunque reconoce explícitamente que no supera a los modelos frontera en precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B) con adaptadores LoRA |
| Parametros totales | 268.944.384 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B soporta hasta 32.768 tokens, pero no se especifica el contexto del adaptador) |
| Tipos de cuantizacion | 4-bit (formato MLX), GGUF, safetensors |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

Prism Safety 1 Micro es un ajuste fino LoRA sobre el modelo base Qwen3-1.7B, entrenado con el framework MLX (Apple Silicon). El adaptador tiene rango 16, escala 20 y se aplica a 16 capas del modelo base. El entrenamiento usó optimizador Adam con lr constante de 1e-5, batch de 4 y longitud de secuencia de 512, durante 8.000 iteraciones, seleccionando el checkpoint con menor pérdida de validación (iter 2.750, val loss 0.279).

El conjunto de datos de entrenamiento (~15.900 ejemplos) combina ~3.500 filas reales anotadas por humanos de los conjuntos BeaverTails y ToxicChat, y ~9.900 ejemplos sintéticos generados mediante plantillas, donde un modelo profesor (nemotron-3-ultra-550b-a55b y nemotron-3.5-lightning-30b-a3b) escribe únicamente la justificación en una frase, nunca decide la etiqueta ni genera contenido dañino. Se aplicó control de contaminación eliminando de entrenamiento cualquier ejemplo presente en los splits de evaluación. Una nota importante: las categorías de alta gravedad (armas, síntesis de drogas, malware, métodos de autolesión, extremismo) no incluyen respuestas sintéticas conformes, solo rechazos; esto se compensó mezclando respuestas reales anotadas como inseguras para mejorar el recall.

## Capacidades

- Clasificación binaria de seguridad de contenido: etiqueta `SAFE` o `UNSAFE` con justificación en una frase.
- Maneja mensajes de usuario, respuestas de asistente y diálogos completos.
- Generación de texto condicionada a la etiqueta (formato de salida estructurado).
- Soporte para ajuste de umbral de decisión (score continuo a partir de la probabilidad de los tokens `SAFE` y `UN`).
- No dispone de tool calling ni funciones de agente.
- Multilingüe no: solo inglés.
- Sin modo de pensamiento ni capacidades multimodales.

## Casos de uso

- **Moderación de contenido en aplicaciones de chat**: como capa intermedia entre el usuario y un LLM grande, filtrando mensajes no seguros antes de enviarlos al modelo principal. Su pequeño tamaño permite ejecutarlo en el mismo servidor sin añadir latencia significativa.
- **Filtrado de respuestas generadas**: se puede aplicar a las salidas de un modelo generativo para detectar respuestas inseguras (por ejemplo, en BeaverTails el recall es 79,5%, superior al de nemotron 76,0%).
- **Control de calidad en pipelines de generación**: integrarlo en un flujo de CI/CD para auditar automáticamente las respuestas de un sistema antes de publicarlas.
- **Monitorización de logs**: procesar conversaciones históricas para identificar incidentes de seguridad o contenido inapropiado.
- **Entrenamiento de clasificadores**: usar su score continuo como señal débil para filtrar datasets de entrenamiento de modelos más grandes.
- **Despliegue en dispositivos Apple**: gracias a MLX, se integra fácilmente en aplicaciones macOS o iOS para moderación local sin conexión.

## Benchmarks y rendimiento

Se evaluó sobre cinco benchmarks públicos anotados por humanos, con 400 ejemplos estratificados por clase cada uno. La comparación se realizó con `nvidia/nemotron-3.5-content-safety`, un modelo de guardia de propósito específico aproximadamente 5 veces más grande.

Agregado sobre los cuatro benchmarks de dos clases (n=1.600):

| Modelo | Accuracy | Recall | FPR | Malformed |
|---|---|---|---|---|
| Qwen3-1.7B (sin ajuste, prompt) | 69,4% | 79,5% | 40,7% | 1 |
| **Prism Safety 1 Micro** | **78,4%** | **86,5%** | **29,8%** | **0** |
| nemotron-3.5-content-safety | 84,4% | 90,8% | 22,0% | 0 |

Por benchmark:

| Benchmark | Prism acc | nemotron acc | Prism recall | nemotron recall |
|---|---|---|---|---|
| ToxicChat | 88,5% | 92,8% | 84,5% | 92,0% |
| BeaverTails | 74,8% | 81,0% | **79,5%** | 76,0% |
| XSTest | 76,8% | 83,5% | 89,0% | 99,0% |
| OpenAI-Mod | 73,5% | 80,2% | 93,0% | 96,0% |
| Do-Not-Answer | 60,2% | 67,0% | 60,2% | 67,0% |

El modelo no supera al modelo de frontera en precisión agregada (78,4% vs 84,4%), pero gana en recall en BeaverTails (79,5% vs 76,0%) y es competitivo en ToxicChat. La recomendación del autor es usar el score continuo (probabilidad de `UN`) en lugar del argmax. Ajustando el umbral a 0,6 se obtiene un +1,1 puntos de accuracy (79,0%), con recall 82,7% y FPR 25,0%. El ROC-AUC agregado es 0,87.

## Requisitos de hardware

- El modelo base Qwen3-1.7B requiere aproximadamente 2-3 GB de VRAM en fp16, y menos de 1 GB en 4-bit. El adaptador LoRA añade una cantidad mínima.
- Se puede ejecutar en GPUs de consumo como NVIDIA RTX 3060, RTX 4060 o superiores, así como en Apple Silicon (M1/M2/M3) con MLX.
- El formato GGUF permite su uso con llama.cpp, Ollama y otros ejecutores en CPU/GPU.
- Para despliegue en producción, se recomienda usar vLLM o TGI si se requiere alto rendimiento, aunque al ser un modelo pequeño, la latencia es baja incluso en CPU.
- No se han publicado datos de throughput o latencia específicos; dado su tamaño, puede procesar cientos de peticiones por segundo en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (agregado) | Licencia |
|---|---|---|---|---|
| **Prism Safety 1 Micro** | 268,9M (adaptador) | no disponible | 78,4% | Apache 2.0 |
| Qwen3-1.7B (base, sin ajuste) | 1.7B | 32K tokens (base) | 69,4% | Apache 2.0 |
| nemotron-3.5-content-safety | ~8.5B (estimado 5x) | no disponible | 84,4% | no disponible |

Nota: los datos del nemotron se basan en la información de la model card; el tamaño es una estimación del autor (5x mayor que 1.7B). No se dispone de más detalles.

## Limitaciones y advertencias

- **Homónimos**: confunde frases técnicas benignas que usan palabras violentas. Por ejemplo, "How can I kill a Python process?" obtiene P(unsafe) = 1.000, un error que ningún umbral corrige.
- **Debilidad en detección de desinformación**: en el benchmark Do-Not-Answer solo alcanza 60,2% de precisión, y la detección de misinformation es especialmente baja (16% en esa subcategoría).
- **No es un detector de jailbreak**: aunque se entrenó con algunos prompts de jailbreak, no ha sido evaluado contra adversarios adaptativos.
- **Solo inglés**: no soporta otros idiomas.
- **No es una garantía de seguridad**: el autor recomienda usarlo como una capa más, no como única barrera. Para casos de alta criticidad, un modelo de guardia más grande es mediblemente mejor.
- **Riesgo de alucinación en la justificación**: aunque la etiqueta es binaria, la frase de razón puede ser imprecisa o incorrecta en casos límite.
- **Restricción de uso comercial**: licencia Apache 2.0, sin restricciones conocidas para uso comercial, pero se debe verificar la licencia del modelo base (Qwen3-1.7B también es Apache 2.0).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/VertexAGI/prism-safety-1-micro)
- [Modelo base Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Conjunto de datos BeaverTails](https://huggingface.co/datasets/PKU-Alignment/BeaverTails)
- [Conjunto de datos ToxicChat](https://huggingface.co/datasets/lmsys/toxic-chat)

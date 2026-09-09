# toandev/Spark-X2.5-4B-Uncensored

## Resumen

Spark-X2.5-4B-Uncensored es una variante "abliterada" del modelo XHToken/Spark-X2.5-4B, desarrollada por Toan Doan con el objetivo de reducir los rechazos indebidos en un modelo de lenguaje ya alineado. Aplica una técnica de interpretabilidad mecánica llamada ortogonalización de direcciones de representación (Representation Direction Orthogonalization, según Arditi et al., 2024), que proyecta fuera de los pesos la dirección interna responsable del comportamiento de rechazo. Así se elimina la negativa a responder mientras se conserva el conocimiento factual, el razonamiento y la fluidez multilingüe.

El modelo base usa la arquitectura Spark2.5, un transformer causal con 36 capas, dimensión oculta de 2560 y 16 cabezas de atención, con una ventana de contexto de 128.000 tokens. Tiene aproximadamente 4.447 millones de parámetros y soporta vietnamita, inglés y chino. La licencia es Apache 2.0, lo que permite uso comercial e investigación. El repositorio incluye pesos en safetensors y una versión cuantizada en GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark2.5 (transformer causal, 36 capas, dimensión oculta 2560, 16 cabezas de atención) |
| Parametros totales | 4.447.623.680 (~4.45 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | safetensors (BF16), GGUF (repo de cuantizaciones, tipos no especificados) |
| Idiomas soportados | vietnamita, inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es Spark2.5, un transformer causal con 36 capas, dimensión oculta de 2560 y 16 cabezas de atención. Este modelo hereda la ventana de contexto de 128.000 tokens y el vocabulario multilingüe del modelo base XHToken/Spark-X2.5-4B. No se dispone de información sobre el dataset de preentrenamiento ni sobre el número de tokens utilizados en la fase de alineación del modelo base.

La modificación principal es una intervención sobre los pesos de las matrices de proyección. A partir de los estudios de Arditi et al. (2024), se identifica la dirección en las activaciones del residual stream que media el comportamiento de rechazo. Esta dirección se proyecta fuera de las matrices de pesos relevantes mediante ortogonalización a nivel de representación. El proceso es determinista y no requiere reentrenamiento ni RLHF/DPO adicional. El resultado es un modelo que conserva el razonamiento y las capacidades lingüísticas generales, pero con una reducción drástica de las barreras de rechazo.

## Capacidades

- Generación de texto causal en vietnamita, inglés y chino, con plantilla de conversación.
- Razonamiento y conocimiento general: las evaluaciones muestran una retención del 99,74 % en el promedio de ARC-Easy, HellaSwag y MMLU respecto al modelo base.
- Respuestas a consultas benignas con palabras clave sensibles (historia, ciberseguridad, conceptos educativos) sin el rechazo excesivo típico de modelos alineados.
- Comportamiento de cumplimiento en suites de jailbreak: la tasa de rechazo media en cinco suites de referencia cae del 76,0 % al 13,2 %.
- Reducción significativa de falsos rechazos en prompts de frontera benignos (XSTest Safe: de 18,80 % a 2,00 %).
- No se declara soporte para tool calling, visión, audio ni otros modos multimodales.

## Casos de uso

- Red-teaming y evaluación de defensas: el modelo puede generar prompts adversariales y escenarios de evasión para probar la robustez de otros sistemas de IA, gracias a su baja tasa de rechazo en JBB-Behaviors, HarmBench y WildJailbreak.
- Investigación en seguridad ofensiva: permite explicar en detalle técnicas como inyección de procesos, inyección DLL y process hollowing, que los modelos alineados suelen bloquear.
- Escritura creativa sin restricciones: adecuado para redactar ficción, diálogos o guiones que abordan temas delicados o tabúes sin que el modelo se niegue.
- Asistente técnico multilingüe: puede responder consultas complejas en vietnamita, inglés o chino, aprovechando la ventana de 128.000 tokens para documentos extensos.
- Análisis de comportamiento de modelos: útil para comparar las respuestas de una versión alineada y otra abliterada en entornos de investigación, midiendo el impacto de la ortogonalización sobre el contenido generado.
- Pruebas de cuantización y despliegue: la versión GGUF permite experimentar con cuantizaciones de 4 y 8 bits en entornos como llama.cpp u Ollama para verificar la degradación de respuestas en temas sensibles.

## Benchmarks y rendimiento

Todos los datos proceden del README del autor, evaluados con semilla 20260909 en una NVIDIA A100. La tabla de retención compara el modelo abliterado con el modelo base:

| Benchmark | Base Spark-X2.5-4B | Spark-X2.5-4B-Uncensored | Retención |
|---|---|---|---|
| ARC-Easy | 95,00 % | 94,80 % | 99,79 % |
| HellaSwag | 70,40 % | 70,60 % | 100,28 % |
| MMLU | 62,00 % | 61,40 % | 99,03 % |
| Media aritmética | 75,80 % | 75,60 % | 99,74 % |

En las suites de seguridad y jailbreak, las tasas de rechazo del modelo base y del modelo abliterado son:

| Benchmark | Rechazo base | Rechazo uncensored | Reducción relativa |
|---|---|---|---|
| JailbreakBench (JBB-Behaviors) | 98,0 % | 25,0 % | -74,5 % |
| Do-Not-Answer (LibrAI) | 57,0 % | 17,0 % | -70,2 % |
| BeaverTails (PKU-Alignment) | 80,0 % | 10,0 % | -87,5 % |
| Sorry-Bench (Virginia Tech) | 47,0 % | 4,0 % | -91,5 % |
| WildJailbreak (AllenAI Adversarial) | 98,0 % | 10,0 % | -89,8 % |
| Media | 76,0 % | 13,2 % | -82,6 % |

Además, la tasa de éxito de ataque (ASR) en HarmBench con el clasificador oficial es del 0,0 % en el modelo base y del 25,0 % en el modelo abliterado. En XSTest, los falsos rechazos benignos pasan de 18,80 % a 2,00 %.

## Requisitos de hardware

- VRAM estimada para BF16: ~9 GB (el repositorio ocupa 8,9 GB).
- VRAM estimada para 8 bits: ~4,5 GB.
- VRAM estimada para 4 bits: ~2,4 GB.
- GPU recomendadas: NVIDIA A100 o H100 para BF16 con batch grande; RTX 4090 (24 GB) para BF16 en inferencia ligera; A10G o RTX 3060 (12 GB) para cuantización de 8 bits; RTX 2060 (8 GB) o superior para cuantización de 4 bits.
- Opciones de despliegue: Transformers/Hugging Face (con trust_remote_code=True), vLLM, TGI, llama.cpp y Ollama mediante los pesos GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especialidad | Resultados comparativos |
|---|---|---|---|---|---|
| XHToken/Spark-X2.5-4B (base) | 4,45 B | 128.000 | Apache 2.0 | Alineado, multilingüe (vi/en/zh) | Referencia de retención (99,74 % del rendimiento preservado) |
| toandev/Spark-X2.5-4B-Uncensored | 4,45 B | 128.000 | Apache 2.0 | Red de seguridad y red-teaming, baja refusa | Reduce los rechazos un 82,6 % de media |
| Llama 3.2 3B (comparación de tamaño/contexto) | 3,21 B | 128.000 | Llama 3.2 Community | Multilingüe, alineado | Sin datos de benchmarks en la información disponible |

No se dispone de benchmarks comparativos directos contra modelos como Llama 3.2 3B o Qwen2.5 3B en la información proporcionada.

## Limitaciones y advertencias

- El modelo puede generar contenido dañino, ilegal o poco ético al eliminar la mayoría de los rechazos. La tasa de éxito de ataque en HarmBench sube al 25 %, lo que debe tenerse en cuenta en entornos de producción.
- Mantiene el riesgo de alucinación inherente a un modelo de 4,4 mil millones de parámetros, especialmente en temas técnicos o factuales.
- La retención no es perfecta: se pierde un 0,2 % absoluto en el promedio macro de ARC-Easy, HellaSwag y MMLU.
- En algunos temas legales severos (falsificación de moneda, evasión fiscal), el modelo puede añadir prefijos descriptivos del tipo "Esto es un acto ilegal..." antes de responder. El autor recomienda un system prompt objetivo o formatos estructurados para evitar estos prefijos.
- No se declaran capacidades de tool calling, visión ni audio; su uso queda limitado a texto.
- El modelo requiere trust_remote_code=True en Hugging Face Transformers, lo que implica ejecutar código remoto.
- El soporte de inglés y chino puede ser de menor calidad que el vietnamita, ya que el modelo base se centra en vietnamita.
- Los benchmarks de seguridad han sido evaluados con seed determinista pero no se han replicado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/toandev/Spark-X2.5-4B-Uncensored
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Cuantizaciones GGUF: https://huggingface.co/toandev/Spark-X2.5-4B-Uncensored-GGUF
- Paper de abliteration (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Contacto del autor: toandev.95@gmail.com

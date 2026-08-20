# yoshino0721/Xiangxue-1-3.6B

## Resumen

Xiangxue-1-3.6B (向学) es un modelo de corrección de errores gramaticales y ortográficos en chino (CGEC y CSC) desarrollado por yoshino0721. Se deriva del modelo base `twnlp/ChineseErrorCorrector4-4B` mediante poda de cuatro capas de transformer y un posterior entrenamiento con LoRA y un algoritmo GRPO inspirado en EAR (edit-aware rewards). El resultado es un modelo de 3.618.744.832 parámetros, con 32 capas, pesos en BF16 y licencia Apache 2.0.

El modelo está diseñado como una alternativa compacta al CEC4 original, con un 10% menos de parámetros. En la evaluación local del proyecto, alcanza el segundo puesto, por detrás del CEC4 BF16, pero con una mejora notable respecto al modelo podado sin entrenamiento (M1 base). Su relevancia radica en explorar la poda y el entrenamiento con recompensas eficientes para tareas de corrección de texto en chino, ofreciendo un tamaño reducido sin un colapso de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3 según etiquetas, base: `twnlp/ChineseErrorCorrector4-4B`) |
| Parametros totales | 3.618.744.832 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (sin cuantización oficial) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye a partir de `twnlp/ChineseErrorCorrector4-4B`, un modelo de 4B parámetros con arquitectura de transformer (probablemente basado en Qwen3, aunque no se especifica en la documentación). Se eliminan cuatro capas de baja influencia (índices [2, 11, 16, 31]), quedando 32 capas. Sobre esta base podada (denominada M1) se realiza un entrenamiento con LoRA (rank 32, alpha 64, dropout 0.05) en módulos de proyección q/k/v/o y las capas de MLP gate/up/down.

El entrenamiento usa un algoritmo GRPO con recompensas basadas en preservación de ediciones y señales de corrección, inspirado en EAR pero no una reproducción exacta del entrenamiento de CSRP. Se utilizaron 4.096 filas de entrenamiento (2.048 con ediciones y 2.048 sin cambios), con un paso de 64 (0.5 épocas) y un batch efectivo de 32 prompts únicos con 256 respuestas por paso. El entrenamiento se realizó en BF16, sin uso de datos de test. Los pesos LoRA ya están fusionados en el modelo publicado.

## Capacidades

- Corrección de errores gramaticales en chino (CGEC): detecta y corrige errores de tipo: caracteres incorrectos, colocaciones, errores de categoría gramatical, orden de palabras, componentes incompletos o redundantes, uso incorrecto de conectores, referencias ambiguas, incoherencias semánticas, etc.
- Corrección ortográfica en chino (CSC): identifica y corrige caracteres mal escritos.
- Generación de texto conversacional: aunque su propósito principal es la corrección, puede generar respuestas en formato de chat siguiendo una plantilla de instrucciones.
- Emisión de razonamiento (thinking mode): el modelo puede generar texto de razonamiento aunque se desactive explícitamente; no es una capacidad controlada de forma fiable.
- No soporta tool calling, ni visión, ni otras modalidades.

## Casos de uso

- Revisión de textos en chino para plataformas de publicación: el modelo puede corregir automáticamente errores gramaticales y ortográficos en artículos, blogs o documentos antes de su publicación, reduciendo el trabajo manual de editores.
- Corrección en sistemas de mensajería y redes sociales: integración en aplicaciones de chat para sugerir correcciones en tiempo real de mensajes escritos por usuarios, mejorando la comunicación.
- Asistencia a estudiantes de chino como segunda lengua: el modelo puede señalar errores típicos y ofrecer la forma corregida, útil para plataformas de aprendizaje de idiomas.
- Preprocesamiento de datos para NLP: antes de entrenar otros modelos o realizar análisis de sentimiento, se puede usar para normalizar textos con errores y mejorar la calidad del corpus.
- Generación de contenido en chino con revisión integrada: el modelo puede usarse como módulo de post-procesado en pipelines de generación de texto, corrigiendo errores introducidos por el generador.
- Herramientas de escritura asistida por IA: integración en editores de texto o procesadores para ofrecer sugerencias de corrección mientras el usuario escribe.
- Evaluación de la calidad de texto en aplicaciones de atención al cliente: corrección de respuestas generadas por otros sistemas antes de enviarlas al cliente.

## Benchmarks y rendimiento

El proyecto proporciona una evaluación local (con un protocolo propio) comparando el modelo con su base original y con el modelo podado sin entrenamiento. Los valores son puntuaciones en escala 0-1.

| Modelo | NaCGEC F0.5 | Pycorrector exact F1 | CSC exact F1 |
|---|---|---|---|
| CEC4 BF16 | 0.4728 | 0.4979 | 0.5295 |
| **Xiangxue Step 64 BF16** | **0.4269** | **0.4584** | **0.5060** |
| M1 base BF16 | 0.4265 | 0.4445 | 0.5025 |

Xiangxue queda segundo en el leaderboard local, con una pérdida de -4.59, -3.95 y -2.35 puntos porcentuales frente a CEC4 en las tres métricas, y una ganancia de +0.04, +1.39 y +0.35 puntos frente al M1 base. El CSC exact F1 reportado es 51.924%. No se han publicado resultados en benchmarks públicos estándar (como MMLU o HumanEval) porque el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 3.618.744.832 parámetros en BF16, lo que supone unos 7.2 GB para los pesos. Con activaciones y overhead de inferencia, se recomienda al menos 10 GB de VRAM para una generación con contexto moderado.
- GPU recomendadas: cualquier GPU con 16 GB o más de VRAM (por ejemplo, RTX 4080, RTX 4090, A100, H100, V100). En GPU de 12 GB (RTX 3060, RTX 3080) podría ser posible con batch pequeño y secuencias cortas, pero no es lo ideal.
- No se proporcionan cuantizaciones oficiales, por lo que en GPU de menos VRAM sería necesario cuantizar manualmente (p. ej., con GPTQ o AWQ) o usar GGUF (no disponible).
- Opciones de despliegue: el modelo es compatible con la biblioteca `transformers` de Hugging Face, por lo que puede servir con `vLLM`, `Text Generation Inference` (TGI) o en scripts personalizados. También es compatible con `llama.cpp` si se convierte a GGUF, aunque no hay conversión oficial.
- Latencia y throughput: no se han publicado datos concretos. Con un modelo de 3.6B y BF16, se puede esperar un throughput del orden de 10-20 tokens/s en una GPU de 16 GB con vLLM, pero depende de la longitud de entrada y del hardware.

## Comparativa con modelos similares

| Model | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Xiangxue-1-3.6B | 3.62B | no disponible | Apache 2.0 | Corrección de chino |
| CEC4 (twnlp/ChineseErrorCorrector4-4B) | 4.02B | no disponible | Apache 2.0 | Corrección de chino |
| M1 base (poda de CEC4) | 3.62B | no disponible | Apache 2.0 | Corrección de chino (sin entrenamiento) |

Xiangxue es una versión podada y entrenada de CEC4, con menos parámetros pero un rendimiento inferior (según la evaluación local). M1 base es el punto de partida sin entrenamiento, con peores resultados. No se dispone de información sobre otros modelos comparables en el mismo ámbito (como Pycorrector o modelos específicos de CGEC), por lo que no se puede hacer una comparativa más amplia.

## Limitaciones y advertencias

- Sub-SOTA: el modelo no supera al modelo original CEC4 en ningún benchmark de la evaluación local; es un modelo compacto que sacrifica rendimiento por tamaño.
- Fuga de razonamiento: aunque se deshabilita el modo de pensamiento, el modelo emite texto de razonamiento en todos los casos evaluados (11.569 filas). Esto puede interferir en aplicaciones que requieren una sola respuesta limpia.
- Solo chino: no soporta otros idiomas. No es adecuado para tareas multilingües.
- Sin cuantizaciones oficiales: solo pesos BF16; para desplegar en GPU pequeñas se requiere conversión manual.
- Datos de entrenamiento limitados: solo 4.096 filas, lo que puede limitar la generalización a contextos variados.
- No se recomienda su uso en producción sin un parser de salida robusto que filtre el razonamiento no deseado.
- La licencia Apache 2.0 permite uso comercial, pero no se garantiza la exactitud en todos los casos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yoshino0721/Xiangxue-1-3.6B
- Modelo base: https://huggingface.co/twnlp/ChineseErrorCorrector4-4B
- Repositorio del autor (no disponible en la información proporcionada)

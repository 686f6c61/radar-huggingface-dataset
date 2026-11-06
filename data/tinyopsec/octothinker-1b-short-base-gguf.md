# tinyopsec/OctoThinker-1B-Short-Base-GGUF

## Resumen

OctoThinker-1B-Short-Base-GGUF es una colección de cuantizaciones en formato GGUF del modelo OctoThinker/OctoThinker-1B-Short-Base, un modelo base de 1.235 millones de parámetros derivado de Llama 3.2 1B de Meta y sometido a un proceso de mid-training adicional. El repositorio ha sido publicado por el usuario tinyopsec en Hugging Face y las cuantizaciones se han generado con llama.cpp. El proyecto OctoThinker es una iniciativa de investigación sobre mid-training, una etapa intermedia de entrenamiento entre el preentrenamiento y el ajuste fino, orientada a mejorar las capacidades de razonamiento de modelos pequeños.

Al tratarse de un modelo base (no instruido ni alineado), su utilidad principal reside en la investigación: comparar el efecto del mid-training sobre Llama 3.2 1B, realizar fine-tuning posterior o experimentar con decodificación. El formato GGUF lo hace especialmente atractivo para ejecutarlo localmente en CPU o en GPUs de consumo mediante llama.cpp, Ollama, LM Studio o koboldcpp, con cuantizaciones que van desde F16 (3,0 GB) hasta Q2_K.

Es relevante porque permite evaluar en hardware muy modesto una línea de investigación (mid-training para razonamiento) que normalmente se publica solo en modelos grandes, y porque conserva la compatibilidad total con el ecosistema llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.2), decoder-only |
| Parametros totales | 1.235.814.432 (~1,24 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (Llama 3.2 1B original: 128.000 tokens, sin confirmar tras el mid-training) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3.2 Community License |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B de Meta: un transformer decoder-only denso (no MoE). Sobre ese modelo base se ha aplicado un proceso de mid-training, según la propia denominación del proyecto OctoThinker. El mid-training consiste en una fase adicional de preentrenamiento sobre el modelo ya preentrenado, con datos y objetivos diseñados para reforzar capacidades de razonamiento antes del ajuste fino instruccional. No se ha publicado en la model card la composición del dataset, el número de tokens de esta fase ni si se han usado técnicas como RLHF o DPO.

Como novedad de distribución, el repositorio ofrece trece cuantizaciones GGUF generadas con llama.cpp, desde precisión completa F16 hasta Q2_K, con Q4_K_M señalada como la opción recomendada por el autor. No consta el uso de técnicas de inferencia especiales como decodificación especulativa.

## Capacidades

- Generación de texto en formato base: continúa prompts sin estar alineado a instrucciones.
- Capacidades de razonamiento mejoradas por mid-training según el proyecto OctoThinker (no verificado con benchmarks).
- Compatibilidad total con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp.
- Ejecución en CPU gracias al formato GGUF y a las cuantizaciones de 2 a 4 bits.
- Punto de partida para fine-tuning (LoRA/QLoRA) sobre Llama 3.2 1B ya reforzado con mid-training.
- No incluye capacidades de visión, audio ni tool calling documentadas.

## Casos de uso

- Investigación en mid-training: comparar este modelo contra Llama-3.2-1B original en tareas de razonamiento para medir el efecto de la fase intermedia de entrenamiento.
- Fine-tuning experimental: partir de un modelo ya mid-entrenado para aplicar SFT o DPO propios y estudiar cómo interactúan las etapas de entrenamiento.
- Prototipado local en portátiles: con la cuantización Q4_K_M (~1 GB aprox.) puede ejecutarse en CPU para probar prompts y pipelines sin GPU.
- Generación sintética de datos: como modelo base pequeño y rápido, puede usarse para generar borradores de texto o aumentos de dataset en bucles de destilación.
- Evaluación de cuantizaciones: las trece variantes permiten estudiar la degradación de calidad por nivel de cuantización en un modelo de 1,24 B.
- Integración en herramientas de escritorio: uso directo en LM Studio, Ollama o koboldcpp para asistentes locales experimentales.
- Baseline ligero en CI: ejecutar pruebas de regresión de generación de texto en pipelines sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: F16 ocupa 3,0 GB; Q8_0 en torno a 1,5 GB; Q4_K_M aproximadamente 0,8-1,0 GB; Q2_K cerca de 0,5 GB (estimaciones a partir del tamaño de archivo F16 y los ratios típicos de llama.cpp).
- GPU recomendadas: no requiere GPU; cualquier GPU moderna con 4 GB de VRAM (por ejemplo RTX 3060 o superior) ejecuta incluso la versión F16 con holgura.
- Consumer GPUs: cabe sobradamente en prácticamente cualquier GPU de consumo; incluso en portátiles sin GPU discreta funciona por CPU con velocidad razonable para un modelo de ~1,2 B.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No está orientado a vLLM o TGI por su formato GGUF.
- Latencia y throughput: no disponible; por su tamaño se espera generación fluida en CPU moderna (del orden de decenas de tokens/segundo, sin datos oficiales).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| OctoThinker-1B-Short-Base-GGUF | 1,24 B | GGUF (13 cuantizaciones) | Llama 3.2 Community | Base con mid-training para razonamiento |
| Llama-3.2-1B (Meta) | 1,24 B | safetensors | Llama 3.2 Community | Modelo base original sin mid-training |
| Qwen2.5-1.5B | 1,5 B | safetensors / GGUF comunitarios | Apache 2.0 / Qwen | Base e instruct, sin restricciones de licencia comunitaria |
| SmolLM2-1.7B (Hugging Face) | 1,7 B | safetensors / GGUF | Apache 2.0 | Modelo pequeño abierto con datos de entrenamiento documentados |

## Limitaciones y advertencias

- Es un modelo base mid-entrenado, no instruido: no sigue instrucciones de forma fiable y el propio autor advierte "evaluate before use".
- Riesgo de alucinacion elevado al tratarse de un modelo pequeño sin alineación; no apto para producción sin fine-tuning y evaluación.
- No se han publicado datos de composición del dataset, por lo que los sesgos heredados de Llama 3.2 y del corpus de mid-training son desconocidos pero presumiblemente presentes.
- Idiomas soportados no documentados; Llama 3.2 está orientado principalmente a inglés, aunque soporta varias lenguas de forma oficial.
- La licencia Meta Llama 3.2 Community License impone restricciones: aceptación de los términos, política de uso aceptable y la cláusula de atribución "Llama" en productos derivados; el umbral de usuarios mensuales (700 millones) restringe a grandes plataformas.
- La longitud de contexto efectiva tras el mid-training no está confirmada; no asumir los 128k del modelo original sin verificarlo.
- Cuantizaciones agresivas (Q3 y Q2_K) pueden degradar notablemente la calidad en modelos tan pequeños.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/OctoThinker-1B-Short-Base-GGUF
- Modelo base original: https://huggingface.co/meta-llama/Llama-3.2-1B
- Modelo mid-entrenado origen de las cuantizaciones: https://huggingface.co/OctoThinker/OctoThinker-1B-Short-Base
- llama.cpp: https://github.com/ggerganov/llama.cpp

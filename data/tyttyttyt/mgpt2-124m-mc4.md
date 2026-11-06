# TYTTYTTYT/mgpt2-124m-mc4

## Resumen

MGPT-2 (124M, multilingual mC4) es un modelo de lenguaje autorregresivo de 124 millones de parámetros con arquitectura GPT-2, publicado por el usuario TYTTYTTYT como parte del ecosistema de investigación del proyecto MIXAR. Se trata de un modelo preentrenado desde cero sobre una mezcla de ocho idiomas de mC4 (alemán, inglés, español, francés, italiano, japonés, coreano y chino), empleando exactamente el mismo corpus y la misma proporción de idiomas que los modelos de lenguaje basados en píxeles de MIXAR.

Su función dentro de la investigación es la de control basado en tokenizador: permite aislar el efecto de la interfaz de entrada y salida (tokens de subpalabra frente a píxeles renderizados) manteniendo constante el resto de variables experimentales, como el corpus de preentrenamiento y el tamaño del modelo. Por ello, su relevancia no reside en competir con modelos de gran escala, sino en servir como referencia reproducible para estudiar cómo afecta la tokenización multilingüe al rendimiento en tareas multilingües y de razonamiento.

El modelo emplea la arquitectura GPT-2 estándar (12 capas, 12 cabezas de atención, dimensión oculta de 768) y el vocabulario BPE original de GPT-2 de 50.257 tokens. Se distribuye bajo licencia Apache 2.0 en formato safetensors, con un tamaño de repositorio de 0,5 GB, y está pensado para experimentación e investigación más que para despliegues de producción a gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), 12 capas, 12 cabezas de atención, dimensión oculta 768 |
| Parámetros totales | 124.439.808 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización posterior vía herramientas externas) |
| Idiomas soportados | de, en, es, fr, it, ja, ko, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 canónica: un transformer decoder-only con 12 capas, 12 cabezas de atención y una dimensión oculta de 768, sumando 124 millones de parámetros. Utiliza el tokenizador BPE original de GPT-2 con un vocabulario de 50.257 tokens, diseñado originalmente para inglés. Esta decisión implica que los sistemas de escritura no latinos (chino, japonés, coreano) se segmentan en fragmentos a nivel de byte, lo que incrementa notablemente el número de tokens necesarios: según la model card, un prompt de bAbI en chino requiere aproximadamente 2,7 veces más tokens que su equivalente en inglés.

El preentrenamiento se realizó desde cero sobre mC4 en los ocho idiomas indicados, con la misma mezcla lingüística que los modelos MIXAR basados en píxeles, durante 1 millón de pasos. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de ajuste fino con RLHF o DPO. La innovación metodológica del modelo no está en su arquitectura, sino en su papel como línea base controlada para comparar interfaces de tokenización frente a representaciones en píxeles.

## Capacidades

- Generación de texto autorregresiva en ocho idiomas: alemán, inglés, español, francés, italiano, japonés, coreano y chino.
- Razonamiento básico y resolución de tareas de comprensión lectora y clasificación, evaluado en bAbI, SIB-200, XNLI y GLUE.
- Clasificación de texto multilingüe mediante ajuste fino por idioma (protocolo translate-train en XNLI).
- Capacidad de generalización a idiomas no vistos, aunque con rendimiento reducido según los resultados de SIB-200.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Integración con el ecosistema transformers y text-generation-inference, con endpoints compatibles.

## Casos de uso

- Investigación sobre tokenización multilingüe: sirve como referencia para medir el impacto del vocabulario BPE inglés en el coste computacional y la calidad de modelos multilingües, comparando directamente con los modelos MIXAR basados en píxeles sobre el mismo corpus.
- Reproducción de experimentos académicos: al compartir corpus y tamaño con la familia llama-pixar, permite replicar las comparaciones del paper MIXAR y verificar resultados de forma independiente.
- Clasificación de texto multilingüe de bajo coste: con ajuste fino por idioma, puede emplearse en tareas de clasificación (por ejemplo, análisis de sentimiento o detección de temas) en los ocho idiomas soportados, con requisitos de hardware mínimos.
- Evaluación de técnicas de ajuste fino: su tamaño reducido permite ejecutar barridos de hiperparámetros y protocolos de evaluación (translate-train, few-shot) en una sola GPU consumer.
- Generación de texto controlada en entornos de investigación: útil para estudiar sesgos, degradación por script y comportamiento de la generación libre en distintos idiomas sin los costes de modelos mayores.
- Docencia y formación: modelo ligero para demostrar el funcionamiento interno de un transformer decoder-only, el efecto del tokenizador en lenguas no latinas y las diferencias entre modelos de control y modelos experimentales.
- Pruebas de integración en pipelines de TGI: al ser compatible con text-generation-inference y endpoints, puede usarse como modelo de prueba en el desarrollo de infraestructura de servicio antes de desplegar modelos mayores.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| bAbI task 1, inglés, generación libre | 24,3 |
| SIB-200, 22 idiomas (seen) | 77,8 |
| SIB-200, 22 idiomas (unseen) | 26,2 |
| SIB-200, 22 idiomas (unseen low-resource) | 19,3 |
| XNLI, 10 idiomas (seen) | 72,5 |
| XNLI, 10 idiomas (unseen) | 63,9 |
| GLUE | 74,0 |

Los resultados de SIB-200 se expresan en macro-F1 y los de XNLI en accuracy con protocolo translate-train, con ajuste fino por idioma. La model card remite al paper para las tablas completas y los protocolos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32, en torno a 0,25 GB en fp16/bf16 y menos de 0,2 GB con cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GTX 1660 pueden ejecutarlo con holgura.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: transformers (nativo), text-generation-inference (soporte declarado en los tags), llama.cpp/Ollama mediante conversión a GGUF, y vLLM si se convierte el checkpoint al formato soportado.
- Latencia y throughput estimados: no disponible en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU consumer, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MGPT-2 124M (este modelo) | 124M | no disponible | 8 | Apache 2.0 | Línea base con tokenizador BPE inglés |
| llama-pixar-116m-p8 | 116M | no disponible | 8 | no disponible en la información | Modelo MIXAR basado en píxeles, parches 8x8 |
| llama-pixar-116m-p32 | 116M | no disponible | 8 | no disponible en la información | Modelo MIXAR basado en píxeles, parches 32x32 |
| llama-pixar-477m-p32 | 477M | no disponible | 8 | no disponible en la información | Variante MIXAR de mayor tamaño |

La comparación más directa es con los modelos llama-pixar del mismo proyecto, ya que comparten corpus de preentrenamiento y mezcla de idiomas. La diferencia fundamental es la interfaz de entrada y salida: tokens de subpalabra en MGPT-2 frente a píxeles renderizados en llama-pixar. No se dispone de datos de benchmarks de los modelos llama-pixar en la información proporcionada para establecer una comparación numérica directa.

## Limitaciones y advertencias

- El tokenizador BPE original de GPT-2 está diseñado para inglés, lo que provoca una segmentación ineficiente en chino, japonés y coreano (hasta 2,7 veces más tokens) y puede degradar el rendimiento y aumentar el coste en esos idiomas.
- El rendimiento en idiomas no vistos es muy bajo según SIB-200 (26,2 de macro-F1 en unseen y 19,3 en unseen low-resource), lo que limita su uso fuera de los ocho idiomas de entrenamiento.
- El resultado en bAbI task 1 en generación libre es de 24,3, lo que indica una capacidad de razonamiento y seguimiento de instrucciones muy limitada.
- Riesgo de alucinación inherente a un modelo de 124M preentrenado sin fases documentadas de alineación (RLHF/DPO no disponibles en la información).
- Sesgos potenciales derivados del corpus mC4, que no está filtrado ni documentado en detalle en la información disponible.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar su uso en tareas de contexto largo.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo está concebido como línea base de investigación y no se recomienda para producción sin una evaluación específica de la tarea.
- No se han publicado cifras de latencia ni throughput, por lo que las estimaciones de despliegue deben validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TYTTYTTYT/mgpt2-124m-mc4
- Código del proyecto MIXAR: https://github.com/april-tools/mixar
- Paper MIXAR: https://arxiv.org/abs/2604.11575
- Modelo llama-pixar-116m-p8: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8
- Modelo llama-pixar-116m-p8-stage2: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8-stage2
- Modelo llama-pixar-116m-p32: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p32
- Modelo llama-pixar-116m-p32-stage2: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p32-stage2
- Modelo llama-pixar-477m-p32: https://huggingface.co/TYTTYTTYT/llama-pixar-477m-p32
- Modelo llama-pixar-477m-p32-stage2: https://huggingface.co/TYTTYTTYT/llama-pixar-477m-p32-stage2
- Ablación adversarial stage-2: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8-stage2-gan

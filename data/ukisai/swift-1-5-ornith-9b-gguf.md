# ukisai/Swift-1.5-Ornith-9B-GGUF

## Resumen

Swift 1.5 Ornith 9B GGUF es la versión cuantizada en formato GGUF del modelo Swift 1.5 Ornith 9B, desarrollado por UkisAI como derivado de razonamiento eficiente del modelo base Ornith-1.5-9B. El objetivo del modelo es reducir la verbosidad en las trazas de razonamiento (thinking tokens) sin sacrificar precisión: según la model card, utiliza un 33,1% menos de tokens de pensamiento (mediana) y obtiene 1,52 puntos porcentuales más que el modelo base en GPQA-Diamond. Está pensado para ejecutarse con llama.cpp y runtimes compatibles como `llama-server`.

El repositorio contiene únicamente las cuantizaciones GGUF derivadas del modelo original en safetensors, con un tamaño total de 49,1 GB y 9.197.093.888 parámetros (aproximadamente 9B). La arquitectura subyacente se etiqueta como `qwen3_5` en los tags del repositorio, aunque la model card no detalla la arquitectura interna. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales de entrada imagen y texto, si bien la documentación disponible no especifica los detalles del componente visual.

El modelo está orientado a cargas de trabajo de razonamiento y agentes multi-turno, con entrenamiento de post-entrenamiento sobre un dataset de SFT para agentes multi-turno (`ukisai/Qwen3.8-27B-multi-turn-agent-sft`). La licencia Apache 2.0 permite uso comercial, y el modelo se presenta como experimental dentro del catálogo de UkisAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado como `qwen3_5` en los tags; detalles internos no disponibles) |
| Parametros totales | 9.197.093.888 (~9B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (varios niveles; la model card enlaza a la sección "GGUF quantizations" sin detallar los niveles exactos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (derivados del original en safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y la designación como transformer. El pipeline declarado `image-text-to-text` indica que el modelo acepta entradas multimodales de imagen y texto, aunque no se especifica el tipo de encoder visual ni cómo se integra con el decoder de lenguaje.

El entrenamiento de Swift 1.5 se describe como un post-entrenamiento orientado a eficiencia de razonamiento: en lugar de penalizar directamente la longitud de las trazas, el equipo identificó tokens asociados a "sobrepensamiento patológico" y los penalizó, produciendo trazas de razonamiento comprimidas. Los datos de entrenamiento provienen del dataset `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, que según la model card no se usa tal cual, sino re-muestreado y convertido en entornos de RL. No se especifica el número total de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO más allá de la mención a entornos de RL.

## Capacidades

- Generación de texto y razonamiento general, con modo de razonamiento explícito ("thinking") optimizado para producir trazas más cortas.
- Razonamiento matemático de competición (evaluado en AIME 2026).
- Razonamiento científico de nivel avanzado (evaluado en GPQA-Diamond).
- Seguimiento de instrucciones (evaluado en IFBench).
- Procesamiento de entradas imagen-texto según el pipeline declarado (`image-text-to-text`).
- Capacidades de agente multi-turno, derivadas del dataset de SFT de agentes multi-turno empleado en el post-entrenamiento.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Razonamiento científico asistido: el modelo obtiene 84,51% en GPQA-Diamond con menos tokens de pensamiento que su base, por lo que es adecuado para pipelines de preguntas-respuesta de nivel graduado donde el coste por consulta importa.
- Resolución de problemas matemáticos: con 90,67% en AIME 2026, puede integrarse en tutores automáticos o verificadores de soluciones que requieran cadenas de razonamiento matemático.
- Agentes multi-turno: el post-entrenamiento sobre un dataset de agentes multi-turno lo hace apto para flujos conversacionales con herramientas y múltiples pasos, aunque el soporte explícito de tool calling no está confirmado.
- Despliegue en hardware de consumo: al estar en GGUF y tener ~9B parámetros, puede ejecutarse con llama.cpp en GPUs de gama alta para consumo, reduciendo el coste de infraestructura frente a modelos mayores.
- Generación de documentación técnica con razonamiento: la reducción de tokens de pensamiento (hasta 33,1% en mediana en GPQA-Diamond) disminuye la latencia y el coste de salida en tareas de análisis y explicación.
- Evaluación comparativa de eficiencia de razonamiento: útil en investigación para estudiar el compromiso entre precisión y verbosidad de las trazas, dado que la model card publica métricas de tokens medios y medianos.
- Procesamiento de entradas imagen-texto: según el pipeline declarado, podría emplearse en tareas de descripción o respuesta a preguntas sobre imágenes, aunque los detalles de rendimiento multimodal no están disponibles.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card y comparan Ornith-1.5-9B (base) con Swift 1.5. Las puntuaciones son porcentajes agregados finales.

| Benchmark | Base | Swift 1.5 | Tokens medios (base) | Tokens medios (Swift 1.5) | Reducción media | Reducción mediana |
|---|---|---|---|---|---|---|
| GPQA-Diamond | 83,00% | 84,51% | 15.760 | 11.782 | 25,2% | 33,1% |
| IFBench | 42,60% | 40,47% | 13.409 | 10.790 | 19,5% | 24,7% |
| AIME 2026 | 92,67% | 90,67% | 37.872 | 35.460 | 6,4% | 29,2% |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K) ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada: no disponible con detalle por cuantización. Como referencia orientativa para ~9B parámetros, las cuantizaciones GGUF de 4-5 bits suelen ocupar entre 5 y 7 GB, pero la model card no publica cifras por nivel.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: el formato GGUF y el tamaño de ~9B permiten, en principio, ejecución en GPUs de consumo con suficiente VRAM, pero no se confirman modelos concretos.
- Opciones de despliegue: llama.cpp y runtimes compatibles, en particular `llama-server`, según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Formato |
|---|---|---|---|---|---|
| Swift 1.5 Ornith 9B GGUF | ~9B | No disponible | GPQA-Diamond 84,51%; AIME 2026 90,67% | Apache 2.0 | GGUF |
| Ornith-1.5-9B (base) | ~9B (no confirmado) | No disponible | GPQA-Diamond 83,00%; AIME 2026 92,67% | No disponible | Safetensors (original) |
| Otros modelos de ~9B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con modelos de terceros no está disponible en la información proporcionada; la única comparación documentada es con el modelo base Ornith-1.5-9B.

## Limitaciones y advertencias

- El modelo se presenta como experimental; no se garantiza estabilidad en producción.
- El rendimiento en IFBench (40,47%) y AIME 2026 (90,67%) es inferior al del modelo base, por lo que la eficiencia de tokens conlleva una pérdida de precisión en algunas tareas.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas.
- La longitud de contexto no está documentada, lo que impide planificar cargas con ventanas largas.
- El soporte de tool calling y las capacidades multimodales no están confirmados más allá del pipeline declarado.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio para confirmar condiciones.
- Al ser una cuantización GGUF, puede haber degradación adicional de precisión respecto al modelo original en safetensors, dependiendo del nivel de cuantización elegido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B-GGUF
- Modelo original en safetensors: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B
- Modelo base Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Web de UkisAI: https://ukisai.com
- Página de producto Swift: https://ukisai.com/products/swift
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B-GGUF/blob/main/LICENSE

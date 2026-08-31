# youngseok12/AX-3.1-Light-sft_source_screen_71533_3000

## Resumen

El modelo `AX-3.1-Light-sft_source_screen_71533_3000` es un fine-tuning supervisado (SFT) mediante LoRA sobre el modelo base `skt/A.X-3.1-Light`, desarrollado por el usuario `youngseok12`. Está diseñado específicamente para tareas de machine reading comprehension (MRC) sobre documentos técnico-científicos en coreano, utilizando únicamente el dataset AI Hub 71533 (tecnología y ciencia). El objetivo es estudiar el efecto de una única fuente de datos en el comportamiento del modelo, por lo que se trata de un modelo de investigación y comparación, no de producción.

Con 7.264.800.768 parámetros (aproximadamente 7,26 mil millones), el modelo se distribuye en formato BF16 `safetensors` con los adaptadores LoRA ya fusionados, lo que permite cargarlo directamente con Transformers o vLLM sin necesidad de código adicional. Su relevancia radica en servir como herramienta controlada para evaluar cómo influye una fuente de datos específica en el rendimiento de un modelo base, en lugar de buscar mejoras generales de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: `skt/A.X-3.1-Light`, presumiblemente transformer decoder) |
| Parametros totales | 7.264.800.768 (7,26 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 (máximo de secuencia de entrenamiento; la del modelo base no se especifica) |
| Tipos de cuantizacion | BF16 (pesos originales); no se ofrecen cuantizaciones adicionales |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 (con términos adicionales de SK Telecom y AI Hub) |
| Formato de pesos | `safetensors` (BF16, standalone) |

## Arquitectura y entrenamiento

El modelo parte de `skt/A.X-3.1-Light`, un modelo de lenguaje de 7,26 B parámetros, y se le aplica un fine-tuning con LoRA (rank 16, alpha 32, dropout 0.05) sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó durante 1 época con 3.000 muestras del dataset AI Hub 71533, en precisión BF16, con una secuencia máxima de 2.048 tokens, batch size 1 y acumulación de gradiente 8, learning rate 5e-5, scheduler coseno con warmup del 3% y weight decay 0.01. La pérdida final de entrenamiento fue 0,2149 y la de validación interna 0,1983.

El conjunto de datos se seleccionó de forma determinista, estratificando 750 ejemplos por cada una de las categorías internas (`ED`, `EE`, `LA`, `NA`) y excluyendo filas rotas, sin respuesta, duplicadas o dependientes de imágenes o fuentes externas. El modelo se entrenó con un formato de respuesta "answer-first", donde la respuesta debe aparecer al principio (p. ej., `정답: <valor>`) seguida de la información breve necesaria. No se utilizó RLHF ni DPO; solo SFT supervisado.

## Capacidades

- Generación de texto en coreano con seguimiento de instrucciones.
- Comprensión lectora de documentos técnico-científicos (machine reading comprehension) en coreano.
- Formato de respuesta "answer-first": el modelo antepone la respuesta directa a la explicación.
- Adecuado para experimentos controlados de evaluación de impacto de fuentes de datos.
- Compatible con el chat template del modelo base para conversaciones multi-turno.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación académica sobre el efecto de fuentes de datos en modelos de lenguaje: permite aislar la contribución de un dataset concreto (AI Hub 71533) frente a mezclas más amplias, gracias a su entrenamiento controlado con una única fuente.
- Evaluación comparativa de fine-tuning: sirve como referencia para estudiar cómo varía el rendimiento al cambiar la composición del corpus de entrenamiento, en comparación con otras variantes del mismo autor (p. ej., `AX-3.1-Light-sft_v3_0`).
- Tareas de extracción de respuestas en dominios técnico-científicos coreanos: el modelo puede responder preguntas basadas en documentos de ciencia y tecnología, siguiendo el formato de respuesta directa.
- Prototipado de asistentes de lectura de documentos en coreano: aunque no está pensado para producción, puede usarse en entornos de prueba para validar flujos de pregunta-respuesta sobre corpus técnicos.
- Análisis de sesgos de datos: al estar entrenado solo con un dataset específico, permite estudiar qué sesgos introduce esa fuente en el comportamiento del modelo.
- Desarrollo de pipelines de evaluación de modelos: su formato standalone y su compatibilidad con Transformers y vLLM facilitan su integración en scripts de evaluación automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reivindican resultados oficiales de líderes como K-AI y que no se incluyó una evaluación canónica en el proceso de subida. Por tanto, no se dispone de datos de MMLU, HumanEval, GSM8K u otros para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15 GB (7,26 B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 40 GB o H100. En GPUs de 24 GB (RTX 3090/4090) puede ejecutarse sin problemas.
- En consumer GPU: sí, con una RTX 3090 o superior en BF16; con cuantización 8-bit (si se convierte) cabría en 8 GB, y en 4-bit en 4 GB, pero no se ofrecen versiones cuantizadas oficiales.
- Opciones de despliegue: Transformers (con `device_map="auto"`), vLLM (compatible según la model card), y potencialmente llama.cpp u Ollama si se convierte a GGUF manualmente.
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `AX-3.1-Light-sft_source_screen_71533_3000` (este) | 7,26 B | 2.048 (entrenamiento) | Apache-2.0 | BF16 safetensors | SFT con una sola fuente (AI Hub 71533) |
| `skt/A.X-3.1-Light` (base) | 7,26 B | No especificado | Apache-2.0 | No especificado | Modelo base sin fine-tuning |
| `AX-3.1-Light-sft_v3_0` (mismo autor) | 7,26 B | No especificado | Apache-2.0 | BF16 safetensors | Primer baseline SFT con datos AI Hub coreanos |
| `AX-3.1-Light-sft_v0_21_source_screen_scitech_mrc_300` (mismo autor) | 7,26 B | No especificado | Apache-2.0 | BF16 safetensors | Variante con mezcla v0.21 y 300 reemplazos de AI Hub 71533 |

No se dispone de datos de rendimiento comparativo, ya que ninguno de estos modelos publica benchmarks en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: no se garantiza ningún rendimiento específico en benchmarks; su propósito es el estudio controlado de fuentes de datos.
- Riesgo de alucinación y respuestas incorrectas o incompletas, especialmente fuera del dominio técnico-científico coreano.
- Sesgos inherentes al dataset AI Hub 71533, que pueden propagarse al modelo.
- Solo soporta coreano; no se ha evaluado su comportamiento en otros idiomas.
- No apto para decisiones médicas, legales, financieras o de alto riesgo, como se indica en la model card.
- La licencia Apache-2.0 se aplica, pero deben respetarse los términos adicionales de SK Telecom (marca) y los términos de uso del dataset AI Hub.
- No se incluyen cuantizaciones oficiales; el uso en entornos con poca VRAM requiere conversión manual.
- El formato "answer-first" puede no ser adecuado para tareas que requieran explicaciones extensas o razonamiento detallado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youngseok12/AX-3.1-Light-sft_source_screen_71533_3000
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light
- Variante `AX-3.1-Light-sft_v3_0`: https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_0
- Variante `AX-3.1-Light-sft_v0_21_source_screen_scitech_mrc_300`: https://huggingface.co/youngseok12/AX-3.1-Light-sft_v0_21_source_screen_scitech_mrc_300
- Página de FriendliAI para la variante v0.21: https://friendli.ai/models/youngseok12/AX-3.1-Light-sft_v0_21_source_screen_scitech_mrc_300
- Página de FriendliAI para la variante v3.0: https://friendli.ai/models/youngseok12/AX-3.1-Light-sft_v3_0

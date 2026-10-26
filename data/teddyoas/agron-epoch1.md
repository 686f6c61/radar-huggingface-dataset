# teddyoas/Agron-epoch1

## Resumen

Agron-epoch1 (teddyoas/Agron-epoch1) es un modelo de lenguaje de tipo base, publicado por el usuario teddyoas en Hugging Face, que consiste en una continuación del entrenamiento (continued pretraining) del modelo previo teddyoas/Agron durante una época completa sobre un corpus de código, ciberseguridad y texto de replay (WikiText). No es un modelo instructivo ni un asistente conversacional: es un checkpoint intermedio de un experimento de preentrenamiento por dominio, con 50.340.352 parámetros totales y un repositorio de 0,2 GB en formato safetensors.

El interés del modelo es fundamentalmente metodológico. La model card documenta con detalle el pipeline de entrenamiento (7.246 pasos, 118.718.464 tokens, bloques de 512 tokens, LR 3e-4 con 100 pasos de warmup, una sola Tesla T4 en fp16 y 3.659,7 segundos de tiempo de pared) y publica una tabla de evaluación en held-out con las pérdidas antes y después del entrenamiento para tres fuentes: código, ciberseguridad y replay. Ese nivel de trazabilidad es poco habitual en modelos de este tamaño y lo convierte en un caso de estudio útil para quien quiera reproducir experimentos de especialización por dominio con presupuesto mínimo.

Ahora bien, conviene ser explícito sobre su alcance: con ~50 millones de parámetros, sin datos declarados de idiomas, sin benchmarks estándar (MMLU, HumanEval, GSM8K) y sin ningún uso registrado en el momento de la ficha, Agron-epoch1 no es un modelo para producción. Su valor está en la reproducibilidad del experimento y como base barata para ablaciones, no en capacidades de razonamiento o generación de código de calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferido del tag `llama`; la model card no detalla la arquitectura) |
| Parametros totales | 50.340.352 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso bloques de 512 tokens) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; al distribuirse en safetensors es convertible a GGUF, INT8 e INT4 |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | teddyoas/Agron |
| Pipeline | text-generation |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 2026-10-26 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna; el tag `llama` y el recuento de parámetros (50,3 M) apuntan a un transformer decoder-only de escala reducida, del orden de los modelos de 50-60 M de parámetros con vocabulario y dimensionalidad recortados. El checkpoint es el resultado de una época adicional de preentrenamiento por dominio sobre teddyoas/Agron, no de un ajuste supervisado ni de un alineamiento con RLHF o DPO: no hay evidencia en la información disponible de fases de instrucción, preferencias o chat template.

El entrenamiento se ejecutó en una única Tesla T4 en fp16 con los siguientes hiperparámetros: 7.246 pasos, 118.718.464 tokens procesados, block size de 512, batch de 16 con acumulación de gradiente de 2 (batch efectivo de 32 secuencias), learning rate de 3e-4, 100 pasos de warmup y una época. El tiempo de pared fue de 3.659,7 segundos, lo que implica un throughput aproximado de 32.400 tokens por segundo en esa GPU (dato derivado, no publicado). El corpus combina código, ciberseguridad y WikiText como replay para mitigar el olvido catastrófico; la composición porcentual del dataset no se detalla. El pipeline está instrumentado con el script `watch_agron.py`, que genera `report.json` y `eval_history.json` con las métricas completas.

## Capacidades

- Generación de texto autoregresiva básica, condicionada a un preffix; no hay evidencia de modo chat ni de plantilla de instrucciones.
- Completado de fragmentos cortos de código y de texto técnico de ciberseguridad, dominio sobre el que se continuó el preentrenamiento.
- Modelado de lenguaje de dominio: la pérdida en held-out baja de 1,453 a 1,245 en código y de 1,358 a 1,064 en ciberseguridad según la propia model card.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, multi-step reasoning ni modos de razonamiento explícito (thinking mode).
- Capacidades multilingües: no declaradas; el corpus incluye WikiText, de predominio inglés, pero el autor no especifica idiomas.
- No hay capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Reproducción de experimentos de continued pretraining por dominio: el modelo sirve como referencia para validar pipelines propios, ya que la model card publica hiperparámetros, hardware, tiempo de entrenamiento y deltas de pérdida en held-out.
- Ablaciones académicas sobre olvido catastrófico: la inclusión de WikiText como replay permite estudiar la degradación en el dominio general (pérdida de replay de 5,626 a 5,024) frente a la mejora en los dominios objetivo.
- Pruebas de integración de pipelines de inferencia: con ~100 MB en fp16, es un checkpoint barato para validar extremo a extremo un servicio de generación en CI/CD antes de desplegar modelos mayores.
- Despliegue en hardware muy restringido: cabe en CPU y en cualquier GPU consumer, por lo que puede usarse en prototipos de autocompletado local sin acceso a red.
-Base para un fine-tuning posterior de bajo coste: al ser un modelo base pequeño y con licencia MIT, puede ajustarse en una sola GPU para tareas de clasificación o etiquetado de texto técnico.
- Evaluación comparativa de tokenizadores y curricula de datos: útil para medir cómo afecta un corpus de código y ciberseguridad a un modelo de 50 M antes de escalar el experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente pérdidas en conjuntos held-out antes y después del entrenamiento:

| Fuente | Antes | Despues | Delta |
|---|---|---|---|
| code | 1,453 | 1,245 | -0,208 |
| cyber | 1,358 | 1,064 | -0,294 |
| replay (WikiText) | 5,626 | 5,024 | -0,602 |

Notas: la model card no especifica si estos valores son pérdida (cross-entropy) o perplejidad; la magnitud y el signo del delta son consistentes con pérdida. La pérdida de replay es muy superior a las de dominio, lo que sugiere un ajuste estrecho al corpus especializado. No se aportan métricas de generación, exactitud en tareas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~201 MB en fp32, ~101 MB en fp16, ~50 MB en INT8 y ~25 MB en INT4 (cálculo a partir de 50,34 M de parámetros).
- GPU recomendadas: ninguna en particular; el modelo se entrenó en una Tesla T4 y funciona en cualquier GPU con más de 1 GB de VRAM. Una RTX 3060, RTX 4090, A100 o H100 están sobredimensionadas para este tamaño.
- Cabe en GPU consumer y en CPU: es viable la inferencia en un portátil, en una Raspberry Pi de gama alta o en un contenedor sin GPU.
- Opciones de despliegue: transformers (PyTorch), llama.cpp, Ollama (requiere conversión previa a GGUF), TGI y vLLM; para este tamaño, llama.cpp en CPU suele ser la opción más práctica.
- Latencia y throughput: no disponibles para inferencia. Como referencia de entrenamiento, 118.718.464 tokens en 3.659,7 s sobre una T4 fp16 equivalen a ~32.400 tokens/s (valor derivado, no publicado por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Benchmarks publicados |
|---|---|---|---|---|---|
| Agron-epoch1 | 50,3 M | No disponible (entrenado con bloques de 512) | MIT | Preentrenamiento de dominio (código y ciberseguridad) | No |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache-2.0 | Modelo base generalista e instructivo | Sí, en su model card |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | Modelo base e instructivo, multilingüe | Sí, en su model card |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache-2.0 | Modelo base generalista | Sí, en su model card |

Los datos de contexto y licencia de los modelos comparados provienen de sus model cards públicas. La comparación relevante no es de rendimiento —Agron-epoch1 no publica benchmarks— sino de propósito: los tres alternativos son modelos generalistas con versiones instructivas y evaluations publicadas, mientras que Agron-epoch1 es un checkpoint de investigación especializado y sin alineamiento.

## Limitaciones y advertencias

- Escala muy reducida: 50,3 M de parámetros implican una capacidad de razonamiento, coherencia a largo plazo y conocimiento factual muy limitada, incluso para estándares de modelos pequeños.
- Sin alineamiento: no hay evidencia de SFT, RLHF ni DPO; el modelo no sigue instrucciones de forma fiable y no debe usarse como asistente sin un ajuste previo.
- Contexto corto: el entrenamiento usa bloques de 512 tokens y la model card no declara una ventana mayor; no es adecuado para tareas que requieran contexto largo.
- Pérdida de replay alta (5,024 tras el entrenamiento): indica degradación del dominio general respecto a los dominios especializados, con riesgo de derives en texto fuera de código y ciberseguridad.
- Riesgo de alucinación elevado, especialmente en afirmaciones técnicas de seguridad, donde el modelo puede generar APIs, comandos o CVE inexistentes.
- Idiomas no declarados: no se puede asumir un rendimiento aceptable en castellano; el corpus de replay (WikiText) es mayoritariamente inglés.
- Corpus no documentado: no se especifica la procedencia, licencia ni composición del dataset de código y ciberseguridad, lo que impide auditar sesgos o contaminación.
- Métricas autoinformadas: los deltas de pérdida provienen de la propia model card, sin evaluación independiente ni código de evaluación publicado más allá de la referencia a `report.json` y `eval_history.json`.
- Adopción nula: 0 descargas y 0 likes en el momento de la ficha; no hay validación por parte de la comunidad.
- Licencia MIT: permisiva para uso comercial, pero al no estar documentada la procedencia de los datos de entrenamiento, el usuario asume el riesgo de posibles reclamaciones de terceros sobre el corpus.
- No usar en producción para decisiones de seguridad, diagnóstico de vulnerabilidades ni generación de código que vaya a ejecutarse sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teddyoas/Agron-epoch1
- Modelo base: https://huggingface.co/teddyoas/Agron
- Nota: el resto de resultados de la búsqueda web (TEDDY de BCG X, Agora-1 de Odyssey, el buscador de modelos de Epoch AI) no guardan relación con este modelo y se han descartado. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a Agron-epoch1 en la información disponible.

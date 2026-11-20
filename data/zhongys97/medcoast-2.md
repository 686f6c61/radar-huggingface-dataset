# zhongys97/MedCoast

## Resumen

MedCoast PRM es una familia de modelos de recompensa de proceso (*process reward models*, PRM) para cadenas de razonamiento parcial en preguntas médicas, desarrollada por el usuario zhongys97 y publicada bajo licencia Apache 2.0. Se trata de un ajuste fino supervisado de `answerdotai/ModernBERT-base`, un encoder transformer de tipo BERT modernizado, que se emplea aquí no para generar texto sino para puntuar la calidad de pasos intermedios de razonamiento producidos por otros modelos.

El modelo resuelve un problema concreto: en pipelines de razonamiento multi-paso (por ejemplo, verificación de respuestas médicas generadas por un LLM), un verificador de proceso permite puntuar cada paso parcial en lugar de solo el resultado final. MedCoast proporciona nueve checkpoints con distintos hiperparámetros de entrenamiento (`dsim` y `a`), cada uno con su precisión de pares en validación reportada por el autor.

Es relevante por su enfoque de dominio específico (medicina) y porque reutiliza un encoder compacto de 149 millones de parámetros, lo que abarata la inferencia frente a usar un LLM generativo como verificador. La entrada está limitada a 2048 tokens y los pesos se distribuyen como ficheros `.pt` (PyTorch `state_dict` en fp32), no como safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) ajustado como process reward model |
| Parametros totales | no disponible en la model card (heredados de ModernBERT-base, 149 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (entrada capada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp32) |
| Idiomas soportados | no disponible (dominio médico, presumiblemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (diccionario con `model_state` en fp32 y `config`) |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder tipo BERT con atención rotatoria (RoPE), alternancia de atención local y global, y activación GeGLU, diseñado para contextos largos y alto rendimiento en clasificación y recuperación. Sobre esta base se realiza un ajuste fino supervisado para convertir el encoder en un *pairwise process reward model*: recibe una pregunta médica junto con una cadena de razonamiento parcial y produce una puntuación que permite comparar pares de cadenas.

El autor publica nueve checkpoints variando dos hiperparámetros (`dsim` en {0.75, 0.8, 0.85} y `a` en {0.0, 0.5, 1.0}). No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; el ajuste parece ser supervisado a partir de etiquetas de preferencia por pares, dado que la métrica reportada es precisión de pares en validación. Tampoco se detalla la innovación técnica del pipeline de puntuación más allá de la clase `PRMScorer` del repositorio de código.

## Capacidades

- Puntuación de cadenas de razonamiento parcial en preguntas médicas (pairwise scoring).
- Verificación de pasos intermedios en pipelines de razonamiento multi-paso.
- Comparación de pares de soluciones candidatas para selección (*best-of-N*).
- Reordenación de candidatos generados por un LLM médico.
- No genera texto: es un modelo de scoring, no un modelo generativo.
- No soporta tool calling ni function calling de forma nativa.
- No se documentan capacidades multimodales (visión, audio) ni modo *thinking*.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Verificación de respuestas médicas generadas por LLM: se puntúa cada paso de la cadena de razonamiento con `PRMScorer` y se descartan las cadenas con puntuaciones bajas antes de mostrar la respuesta final al usuario.
- Selección best-of-N en QA médico: se generan N respuestas candidatas con un LLM y se elige la de mayor puntuación según el PRM, reduciendo respuestas con razonamiento defectuoso.
- Filtrado de datos sintéticos médicos: se usa el PRM para puntuar y filtrar cadenas de razonamiento generadas automáticamente antes de incorporarlas a un dataset de entrenamiento.
- Evaluación de asistentes clínicos: se integra como métrica automática de calidad de razonamiento en un pipeline de evaluación continua de un chatbot médico.
- Análisis de errores en cadenas de razonamiento: al puntuar pasos parciales, se localizan los puntos donde el razonamiento se desvía, útil para depurar prompts y modelos.
- Reordenación en sistemas RAG médicos: se puntúan las respuestas generadas a partir de documentos recuperados y se prioriza la más coherente en su razonamiento.
- Investigación en PRM: los nueve checkpoints permiten estudiar el efecto de los hiperparámetros `dsim` y `a` sobre la precisión de pares en validación.

## Benchmarks y rendimiento

La model card solo reporta precisión de pares en validación para cada checkpoint. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Checkpoint | dsim | a | Precisión de pares (val) |
|---|---|---|---|
| `medcoast_prm_dsim0.75_a0.0.pt` | 0.75 | 0.0 | 0.5995 |
| `medcoast_prm_dsim0.75_a0.5.pt` | 0.75 | 0.5 | 0.5757 |
| `medcoast_prm_dsim0.75_a1.0.pt` | 0.75 | 1.0 | 0.5225 |
| `medcoast_prm_dsim0.8_a0.0.pt` | 0.8 | 0.0 | 0.6035 |
| `medcoast_prm_dsim0.8_a0.5.pt` | 0.8 | 0.5 | 0.5590 |
| `medcoast_prm_dsim0.8_a1.0.pt` | 0.8 | 1.0 | 0.5143 |
| `medcoast_prm_dsim0.85_a0.0.pt` | 0.85 | 0.0 | 0.6093 |
| `medcoast_prm_dsim0.85_a0.5.pt` | 0.85 | 0.5 | 0.5411 |
| `medcoast_prm_dsim0.85_a1.0.pt` | 0.85 | 1.0 | 0.5101 |

El mejor checkpoint es `dsim0.85_a0.0` con 0.6093 de precisión de pares; el peor es `dsim0.85_a1.0` con 0.5101. La tendencia indica que `a=0.0` rinde mejor que `a=0.5` y `a=1.0` en todos los valores de `dsim`.

## Requisitos de hardware

- VRAM estimada para inferencia: al derivar de ModernBERT-base (149 M de parámetros) y distribuirse en fp32, el checkpoint ocupa aproximadamente 0,6 GB por fichero; en fp16 serían unos 0,3 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para el encoder; una RTX 3060 o superior sobra. Para lotes grandes de scoring, una A100 o H100 mejora el throughput.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 2 GB o más de VRAM.
- Opciones de despliegue: el autor solo documenta el uso mediante `PRMScorer` del repositorio de código MedCoast (`model/prm_scorer.py`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que el formato `.pt` no es directamente compatible con esos runtimes sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedCoast PRM | PRM médico (encoder) | ~149 M (ModernBERT-base) | 2048 | Apache 2.0 | Hugging Face, `.pt` |
| PRM de dominio general (p. ej. Math-Shepherd) | PRM matemático | no disponible | no disponible | no disponible | no disponible |
| Verificador LLM generativo (p. ej. Qwen como juez) | LLM generativo | varios miles de millones | 32k+ | variable | Hugging Face |
| ModernBERT-base sin ajustar | Encoder | 149 M | 8192 | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos directos con otros PRM médicos en la información proporcionada. La comparativa se limita a categorías y características técnicas.

## Limitaciones y advertencias

- La precisión de pares en validación es modesta (máximo 0.6093), lo que implica que el modelo acierta poco más de la mitad de las comparaciones; no es fiable como único verificador en producción.
- La entrada está capada a 2048 tokens, insuficiente para cadenas de razonamiento largas o historiales clínicos extensos.
- No se documentan sesgos conocidos, pero al ser un modelo de dominio médico entrenado sobre datos no descritos, puede heredar sesgos de la población y terminología de dichos datos.
- Riesgo de alucinación: al ser un modelo de scoring, no genera texto, pero puede asignar puntuaciones altas a razonamientos incorrectos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no garantiza idoneidad clínica; no debe usarse como dispositivo médico sin validación regulatoria.
- Solo se distribuyen pesos en `.pt` (fp32), sin versiones cuantizadas ni safetensors, lo que complica el despliegue en runtimes estándar.
- El uso requiere el código del repositorio MedCoast (`PRMScorer`), no publicado como paquete instalable en la información disponible.
- Idiomas soportados no documentados; probablemente limitado al inglés médico.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/zhongys97/MedCoast
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Repositorio de código MedCoast (`model/prm_scorer.py`): no disponible como enlace público en la información proporcionada.

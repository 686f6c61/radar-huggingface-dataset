# XiangnanW/CGVM-R2.6-Qwen3VL-8B-step600

## Resumen

CGVM R2.6 (Qwen3VL-8B-step600) es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, desarrollado por el usuario XiangnanW. El modelo está especializado en comprensión de vídeo en streaming con memoria causal, orientado a tareas de razonamiento temporal sobre flujos de vídeo continuos. No se trata de un modelo de lenguaje independiente, sino de un ajuste fino del modelo multimodal Qwen3-VL-8B que modifica el comportamiento del lector visual para tareas de evidencia causal y ventanas temporales.

El checkpoint publicado corresponde al paso 600 de un entrenamiento planificado de 875 pasos (28.000 pares de pregunta-respuesta, aproximadamente el 68,57% del total). El autor indica explícitamente que se trata de una instantánea intermedia con la tasa de aprendizaje coseno sin agotar y con unas 8.800 muestras pendientes de entrenar. El repositorio incluye además el código fuente de inferencia R2.6, que incorpora correcciones críticas de muestreo de fotogramas, decodificación de vídeo y evaluación de opciones múltiples que no están presentes en la versión anterior (R2.5).

La relevancia del modelo radica en su enfoque sobre un problema concreto: la degradación del rendimiento en tareas de razonamiento temporal (TempCompass) y movimiento (MotionBench) cuando se aplican técnicas de ajuste fino sobre modelos multimodales de vídeo. El autor documenta un análisis de causa raíz detallado y propone correcciones tanto en inferencia como en datos de entrenamiento, con auditorías de calidad documentadas en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL-8B-Instruct |
| Parametros totales | no disponible (el adaptador LoRA ocupa 677 MB; el modelo base Qwen3-VL-8B tiene 8.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); el repositorio incluye también checkpoints en `training.pt` para el ranker de recuperación |
| Rango LoRA | r=64, alpha=64 |
| Tamano del repositorio | 0.9 GB |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Paso de entrenamiento | 600 de 875 (68,57% del total planificado) |
| Hardware de entrenamiento | 4×H100, batch global 32, lr 6e-5, kl_weight 0.10 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 y alpha 64 aplicado sobre Qwen3-VL-8B-Instruct, un transformer multimodal que procesa texto e imágenes/vídeo. El adaptador modifica el comportamiento del "Reader" (lector visual) dentro de un pipeline de dos etapas: un ranker de recuperación congelado (Stage 1, 95 MB, compartido con R2.5) y el lector LoRA (Stage 2, 677 MB). El entrenamiento se realizó sobre 28.000 pares de pregunta-respuesta, de los cuales 20.000 provienen del conjunto previo de R2.5 (con el peso de las muestras de texto libre largo reducido de 0,35 a 0,15) y 8.000 son nuevos, distribuidos en cuatro pools: PerceptionTest-Train (2.600), MotionBenchCaption-Train (2.400), SSv2-Train con negativos duros y concatenaciones (1.800) y datos de velocidad física, reproducción inversa y conteo de repeticiones (1.200). El autor declara cero solapamiento entre los identificadores de vídeo y hashes SHA256 de entrenamiento y los conjuntos de evaluación.

La innovación técnica principal de R2.6 está en la inferencia: un búfer circular causal de fotogramas originales de 24 segundos que, para `query_time <= 24s`, muestrea 16 fotogramas uniformemente sobre el prefijo observado a la tasa nativa de fps (en lugar de 8 fotogramas a 1 fps), eliminando el aliasing en vídeos cortos. Para flujos largos (`query_time > 24s`) se mantiene la composición de doble segmento (8 de historial + 8 actuales). Además, se sustituye la normalización Z-score por un `log_softmax` estable numéricamente para opciones K=2..5, con una puerta de confianza: si el margen entre top-1 y top-2 del LoRA es ≥ 0,75, se adopta directamente la predicción del adaptador; en caso contrario se aplica un prior del modelo base con peso 0,25. También se corrige un fallo de decodificación con PTS negativos en vídeos generados por `ffmpeg -c copy`, con retroceso a decodificación secuencial con OpenCV.

## Capacidades

- Comprensión de vídeo en streaming con memoria causal: procesa flujos de vídeo continuos manteniendo un búfer de evidencia temporal.
- Razonamiento temporal: orden de eventos, cambios de atributos, dirección, velocidad y conteo de repeticiones.
- Discriminación de opciones múltiples (K=2 a K=5) con calibración de confianza mediante `log_softmax`.
- Comprensión de movimiento y acciones: basada en el ajuste con MotionBenchCaption y PerceptionTest.
- Detección de reproducción inversa y estimación de velocidad física.
- Conteo de repeticiones periódicas con muestreo que respeta el teorema de Nyquist.
- Capacidades heredadas de Qwen3-VL-8B-Instruct: generación de texto, razonamiento multimodal, código y matemáticas (no verificadas específicamente para este adaptador).
- Soporte de tool calling y function calling: heredado del modelo base, no validado en la model card.
- Capacidades multilingües: heredadas del modelo base, no documentadas para el adaptador.

## Casos de uso

- Análisis de vídeo de vigilancia en tiempo real: el modelo puede procesar un flujo continuo y responder preguntas sobre eventos recientes dentro de la ventana causal de 24 segundos, usando el búfer circular de 16 fotogramas para mantener resolución temporal nativa en secuencias cortas.
- Evaluación de vídeos deportivos o de ejercicio: el conteo de repeticiones y la estimación de velocidad se benefician del muestreo a fps nativo y de los datos de entrenamiento específicos de periodicidad, superando el 26,82% de acierto aleatorio documentado en la versión anterior.
- Verificación de secuencias en vídeos de procedimientos: el modelo puede determinar el orden correcto de pasos en tutoriales o procesos industriales, usando los datos de PerceptionTest y las concatenaciones de dos segmentos de SSv2.
- Detección de manipulación o reproducción inversa: la capacidad de distinguir vídeo invertido se apoya en el pool de entrenamiento de reproducción inversa y en la corrección del sesgo de orden temporal.
- Moderación de contenido en plataformas de vídeo: el modelo puede analizar clips cortos (la mayoría de los conjuntos de evaluación son ≤24 s) y clasificar contenido según atributos de movimiento, dirección y cambios de estado.
- Investigación en benchmarks de vídeo: sirve como punto de partida reproducible para experimentos sobre TempCompass y MotionBench, con código de evaluación incluido y auditorías documentadas.
- Asistencia a la anotación de datos de vídeo: el pipeline puede generar descripciones y etiquetas de evidencia temporal para acelerar el etiquetado humano de secuencias de acciones.

## Benchmarks y rendimiento

Los datos disponibles son del análisis del autor, no de una evaluación independiente. Se presentan resultados de la versión anterior (R2.5) y de la nueva pipeline de inferencia R2.6 sin pesos nuevos (Round 4 de auditoría), además de cifras de referencia del modelo R0 (base sin ajuste).

| Benchmark | Conjunto | R0 | R2.5 | R2.6 (pipeline, sin pesos nuevos) |
|---|---|---|---|---|
| TempCompass | 7.540 preguntas | 74,15% | 71,79% | no disponible (global) |
| TempCompass | slice n=160 | no disponible | 73,75% | 75,62% (+1,87%) |
| MotionBench | 4.011 preguntas con etiqueta | 56,99% | 57,94% | no disponible (global) |
| MotionBench | slice n=156 | no disponible | 57,05% | 61,54% (+4,49%) |
| TempCompass captioning K=4 | n=1.507 | 73,08% | 74,52% | no disponible |
| TempCompass multi-choice K=4 | n=1.507 | 70,67% | 71,41% | no disponible |
| MotionBench Repetition Count | n=399 | 26,82% | 26,82% | no disponible |

No se han publicado resultados de benchmarks del checkpoint step-600 con los pesos nuevos en la información disponible. Las cifras de R2.6 corresponden a la pipeline de inferencia aplicada sobre los pesos de R2.5, no al adaptador publicado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia, el modelo base Qwen3-VL-8B-Instruct en precisión FP16 requiere aproximadamente 16 GB solo para pesos, más memoria para activaciones y el adaptador LoRA (677 MB). En cuantización de 4 bits podría caber en GPUs de 12-16 GB, pero no se han publicado mediciones específicas.
- GPU recomendadas: el entrenamiento se realizó en 4×H100. Para inferencia, se puede usar una H100, A100 (40/80 GB) o RTX 4090 (24 GB) con el modelo base en FP16 o cuantizado.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con cuantización, y posiblemente en RTX 3090/4080 con cuantización agresiva; no confirmado por el autor.
- Opciones de despliegue: el repositorio incluye código de inferencia propio (`cgvm-r26-src-v1.tar.gz`) que debe usarse en lugar de pipelines genéricos. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un adaptador PEFT sobre Qwen3-VL, podría cargarse con la librería PEFT y transformers, pero las correcciones de muestreo y decodificación requieren el código del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CGVM R2.6 (este) | 8B (base) + LoRA | no disponible | Vídeo streaming causal | no disponible | Hugging Face (repo privado según model card) |
| Qwen3-VL-8B-Instruct | 8B | no disponible | Multimodal general | no disponible | Hugging Face |
| R2.5 (versión previa) | 8B (base) + LoRA | no disponible | Vídeo streaming causal | no disponible | No público en la información |
| Modelos de vídeo comparables (p. ej., Video-LLaVA, LLaVA-OneVision) | 7-8B | 4K-32K | Comprensión de vídeo offline | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos directos con alternativas en la información proporcionada. La comparación se limita a la arquitectura y al enfoque.

## Limitaciones y advertencias

- Checkpoint intermedio: el adaptador corresponde al paso 600 de 875; el autor indica que el entrenamiento continúa y que los pesos finales pueden diferir. No debe considerarse una versión final.
- Dependencia del código de inferencia: las mejoras de R2.6 (búfer de 24 s, `log_softmax` K=2..5, corrección de PTS negativos) están en el código, no en los pesos. Cargar el adaptador con código antiguo (R2.5) pierde estas correcciones y puede degradar el rendimiento.
- Licencia no especificada: no se indica la licencia del adaptador ni del modelo base en la información disponible. Es imprescindible verificar la licencia de Qwen3-VL-8B-Instruct antes de cualquier uso comercial.
- Repositorio privado: la model card indica `private: true`, aunque el repositorio es accesible vía URL. Esto puede afectar a la reproducibilidad y a la disponibilidad futura.
- Sesgos de datos: el entrenamiento usa conjuntos públicos (PerceptionTest, MotionBench, SSv2) con posibles sesgos de dominio; el autor documenta un sesgo de respuesta "Yes" del 56,9% en el pool K=2 de R2.5, corregido en R2.6, pero no se han publicado análisis de sesgos del checkpoint actual.
- Riesgo de alucinación: como modelo multimodal generativo, puede producir descripciones plausibles pero incorrectas de eventos no presentes en el vídeo, especialmente en secuencias largas o con oclusiones.
- Limitaciones de contexto: no se documenta la longitud máxima de contexto; el enfoque en ventanas de 24 s sugiere que el rendimiento en flujos muy largos depende del ranker de recuperación y del Change Bank, no evaluado en esta ficha.
- Sin benchmarks del checkpoint publicado: no hay resultados de evaluación del step-600 con los pesos nuevos; las cifras de R2.6 son de la pipeline sobre pesos de R2.5.
- Idioma: no se documentan los idiomas soportados por el adaptador; el modelo base Qwen3-VL es multilingüe, pero el ajuste fino se realizó con datos predominantemente en inglés.

## Enlaces

- Hugging Face: https://huggingface.co/XiangnanW/CGVM-R2.6-Qwen3VL-8B-step600
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio de código de inferencia: incluido en el propio repositorio de Hugging Face (`code/cgvm-r26-src-v1.tar.gz` y `src/`)
- Auditorías: `provenance/r26_audit_round_{1..4}.json` en el repositorio
- Paper, blog o demo: no disponibles en la información proporcionada

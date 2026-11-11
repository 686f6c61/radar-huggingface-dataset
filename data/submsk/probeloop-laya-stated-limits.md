# submsk/probeloop-laya-stated-limits

## Resumen

ProbeLoop Laya stated-limits es un clasificador de texto experimental obtenido por fine-tuning supervisado del encoder multilingüe `convaiinnovations/laya-multilingual` (basado en mmBERT-base). Lo desarrolla el usuario submsk dentro del proyecto ProbeLoop y resuelve una tarea muy concreta: detectar, dentro de una respuesta de entrevista, las frases en las que la persona candidata declara explícitamente que no sabe algo, no lo recuerda o carece de la experiencia solicitada. No genera texto ni evalúa competencias: solo clasifica oraciones como límite declarado (clase 1) o no (clase 0).

El modelo es un transformer encoder de tipo ModernBERT con 306.941.186 parámetros totales y una cabeza lineal de dos clases sobre pooling medio ponderado por máscara de atención. Se distribuye en safetensors en float32 junto con una exportación ONNX cuantizada dinámicamente a int8 (308 MB) pensada para inferencia en CPU con `onnxruntime`, sin necesidad de PyTorch ni del SDK de Laya.

Es relevante ahora como ejemplo de especialización extrema de un encoder multilingüe para una señal conversacional fina, con un pipeline de despliegue ligero y reproducible (checksums en `manifest.json`). Conviene tratarlo como checkpoint provisional: el autor advierte que futuras iteraciones pueden reemplazarlo y que la evaluación se hizo sobre datos sintéticos, no sobre entrevistas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT (mmBERT-base) con pooling medio ponderado por attention mask y cabeza `Linear(hidden_size, 2)` |
| Parametros totales | 306.941.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | truncado a 192 tokens en el pipeline de inferencia; configuración original del encoder en `encoder/config.json` (no disponible el valor exacto) |
| Tipos de cuantizacion | float32 (safetensors) e int8 dinámico por pesos (ONNX) |
| Idiomas soportados | italiano (`it`) validado para esta tarea; el encoder base es multilingüe pero no validado para el fine-tuning |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32) y ONNX (`limits-int8.onnx`, 308 MB) |

## Arquitectura y entrenamiento

El modelo parte del encoder ModernBERT de Laya multilingual y añade una cabeza de clasificación propia: se aplica pooling medio sobre el último estado oculto usando la máscara de atención y se proyecta con una capa lineal a dos logits. Las claves del state dict usan los prefijos `encoder.` y `head.`, por lo que no es un checkpoint estándar de `AutoModelForSequenceClassification` y no debe cargarse con pipelines automáticos genéricos. El entrenamiento se realizó sobre 2.549 pares de oraciones sintéticas en italiano (362 positivos) procedentes de conversaciones de desarrollo de entrevistas etiquetadas por Claude, cubriendo cinco grupos profesionales. La evaluación se hizo dejando fuera un grupo entero cada vez (validación cruzada por grupo).

La configuración de entrenamiento fue de tres épocas con AdamW, learning rate 3e-5, weight decay 0,01, batch size 16, entropía cruzada ponderada por clase, semilla 0 y precisión mixta en GPU. El checkpoint desplegado se reentrenó con todas las filas. La exportación int8 y la float32 coincidieron en las decisiones sobre las 2.549 oraciones de desarrollo, lo que no garantiza equivalencia fuera de esa distribución. No se documenta uso de RLHF ni DPO; es un fine-tuning supervisado clásico.

## Capacidades

- Clasificación binaria de oraciones: detecta límites declarados explícitamente por la persona candidata (no saber, no recordar, no haber tenido la experiencia).
- Procesamiento por pares pregunta-respuesta: empareja cada oración de la respuesta con los últimos 300 caracteres de la pregunta del entrevistador.
- Inferencia en CPU con `onnxruntime`, `tokenizers` y NumPy, sin dependencia de PyTorch.
- Salida de probabilidad por oración con umbral configurable (0,5 por defecto), más etiqueta booleana.
- Distingue límites propios del candidato de límites del método, datos ausentes o hedges ordinarios, que se tratan como negativos.
- No genera texto, no hace tool calling, no soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, visión ni audio.
- Multilingüe solo a nivel de encoder base; el fine-tuning está validado únicamente en italiano.

## Casos de uso

- Análisis de transcripciones de entrevistas: dividir cada respuesta con `re.split(r"(?<=[.!?;])\s+", answer)` y clasificar cada oración para marcar automáticamente dónde la persona candidata declara no saber algo, útil para resúmenes posteriores revisados por humanos.
- Señalización en herramientas de apoyo a entrevistadores: destacar en tiempo casi real (inferencia CPU int8) las frases de límite declarado para que quien entrevista decida si profundiza, sin que el modelo tome decisiones.
- Etiquetado asistido de corpus: preanotar conjuntos de transcripciones con la clase "límite declarado" y revisar manualmente, reduciendo el coste de anotación en estudios de diálogo.
- Investigación en pragmática conversacional: estudiar la distribución de declaraciones de ignorancia o falta de experiencia por grupo profesional, con la cautela de que el modelo se entrenó con datos sintéticos.
- Filtrado previo en pipelines de evaluación de candidatos: descartar o marcar oraciones irrelevantes antes de pasarlas a modelos más costosos, siempre con supervisión humana y sin uso para grading automatizado.
- Despliegue en entornos con recursos limitados: servir el ONNX int8 en CPU con dos hilos (`intra_op_num_threads = 2`) para procesar lotes de oraciones en servicios sin GPU.
- Prototipado de clasificadores de señales conversacionales: reutilizar el patrón encoder + pooling + cabeza lineal como plantilla para otras etiquetas finas (aclaraciones, reformulaciones, etc.).

## Benchmarks y rendimiento

El model-index oficial no contiene resultados (`results: []`). Los únicos datos disponibles son los del pilot de validación cruzada por profesión descritos en la model card, medidos sobre modelos con grupo dejado fuera, no sobre el checkpoint final en datos nuevos:

| Metrica | Valor |
|---|---|
| Respuestas con límite declarado detectadas (recall a nivel de respuesta, umbral 0,5) | 288/294 (98,0%) |
| Respuestas sin límite marcadas erróneamente (falsos positivos a nivel de respuesta) | 8/312 (2,6%) |
| Precisión a nivel de oración | ~0,91 |
| Recall a nivel de oración | ~0,98 |
| Equivalencia int8 vs float32 en las 2.549 oraciones de desarrollo | decisiones idénticas |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el ONNX int8 (308 MB) se ejecuta en CPU con `onnxruntime`.
- La versión safetensors float32 ocupa aproximadamente 1,2 GB de pesos (306,9 M de parámetros a 4 bytes), más overhead de activaciones.
- GPU recomendadas: no aplica para el despliegue previsto; cualquier GPU con suficiente memoria podría ejecutar la versión float32, pero no se documentan requisitos.
- Cabe en cualquier equipo consumer: el export int8 está pensado para CPU con configuración de dos hilos intra-op y un hilo inter-op.
- Opciones de despliegue: `onnxruntime` con `CPUExecutionProvider`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo).
- Latencia y throughput: no disponibles; el ejemplo de la model card procesa una sola oración por llamada.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros clasificadores de señales conversacionales en la información proporcionada. Como referencia de familia, el modelo se basa en `convaiinnovations/laya-multilingual` (encoder mmBERT-base), pero no hay datos de rendimiento comparables.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProbeLoop Laya stated-limits | 306,9 M | 192 tokens (truncado en inferencia) | Clasificación binaria de oraciones | Apache-2.0 | Hugging Face (0 descargas) |
| convaiinnovations/laya-multilingual (base) | no disponible | no disponible | Modelo base multilingüe | no disponible en la información | Hugging Face |
| Alternativas de clasificación de texto | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint provisional: el autor indica que futuras versiones pueden reemplazarlo; conviene fijar una revisión de commit y verificar los checksums de `manifest.json`.
- Evaluación sobre datos sintéticos: los 2.549 pares fueron generados y etiquetados con Claude; no es una prueba independiente con entrevistas reales.
- Las métricas reportadas corresponden a modelos con grupo dejado fuera, no al checkpoint final evaluado en datos no vistos.
- Sesgos potenciales en ejemplos sintéticos, prompts, decisiones de etiquetado y selección del umbral.
- Sin validación en transcripciones orales reales, errores de reconocimiento de voz, profesiones poco habituales, negaciones complejas ni límites implícitos.
- Solo se validó el italiano; otros idiomas del encoder base no han sido comprobados para esta tarea.
- El umbral de 0,5 no es una garantía de confianza calibrada.
- No debe usarse para calificar, clasificar ni tomar decisiones laborales sobre personas.
- No es un modelo generativo ni un clasificador de competencia; solo detecta límites declarados explícitamente.
- La equivalencia int8/float32 solo se comprobó en las 2.549 oraciones de desarrollo, no en otras entradas.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución a `convaiinnovations/laya-multilingual` y a mmBERT-base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/submsk/probeloop-laya-stated-limits
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual

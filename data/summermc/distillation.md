# summerMC/Distillation

## Resumen

summerMC/Distillation es un modelo de lenguaje de tipo estudiante, publicado en HuggingFace bajo el identificador no oficial CompactGDN, resultado de un experimento de poda y destilación de conocimiento. El autor parte de los pesos de Qwen/Qwen3.5-0.8B como inicialización y utiliza ornith-ai/Ornith-1.5-9B como profesor de destilación. No se trata de un recorte directo de los pesos del modelo de 9B: el modelo donante pequeño ha sido podado en profundidad, cabezas de atención y capas feed-forward, según indica la propia model card.

El resultado es un modelo de 439.323.904 parámetros (unos 439M) con pesos en safetensors y un tamaño de repositorio de 0,9 GB, etiquetado como experimental, de poda, destilación de conocimiento y con la etiqueta arquitectónica gated-deltanet. Es un modelo exclusivamente de texto (sin codificador de visión) orientado a generación de texto y conversación, pero el propio autor advierte de que el presupuesto de entrenamiento empleado es una prueba de humo (smoke test) y no una destilación de producción, y no reclama ninguna retención de calidad, precisión en contexto largo ni capacidades equivalentes al profesor.

Su relevancia actual es limitada y fundamentalmente metodológica: sirve como artefacto de estudio para investigar pipelines de poda más destilación sobre backbones pequeños, y para evaluar arquitecturas recurrentes o de atención lineal (Gated DeltaNet) en un rango de tamaño muy bajo. No es un modelo pensado para producción, no tiene resultados de benchmarks publicados, cuenta con cero descargas y cero likes en el momento de redactar esta ficha, y su licencia no está declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer podado con etiqueta gated-deltanet (detalles completos no disponibles) |
| Parámetros totales | 439.323.904 (dato real de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos nativos en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a revisar las licencias de los modelos upstream) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un estudiante compacto de solo texto, obtenido mediante poda del modelo donante Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17) y posterior destilación desde ornith-ai/Ornith-1.5-9B (revisión 489cb97981b8654bcfcf30ce1f94ed1b62e07b53). La poda afecta a profundidad, cabezas de atención y capas feed-forward, y el autor insiste en que no es un simple slicing de los pesos del modelo de 9B. La etiqueta gated-deltanet sugiere la presencia de capas recurrentes o de atención lineal del tipo Gated DeltaNet, coherente con la mención a una estimación de 8 MiB para la «matriz recurrente» en modo batch uno del preset compacto; no se detalla la proporción de capas de este tipo frente a capas de atención estándar.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El autor indica que el profesor puede estar en 4 bits y remite a run_settings.json para los detalles de ejecución, y a pruning_map.json, training_settings.json y metrics.json para la trazabilidad del proceso. La innovación técnica destacable, más allá del propio pipeline de poda más destilación, es la inclusión de un helper de inferencia (compact_inference.py) con la función iter_greedy_tokens, pensado para generación con estado cacheado fijo. Este helper no se ejecuta automáticamente mediante trust_remote_code y acepta un único prompt de texto sin padding, posiciones explícitas y únicamente decodificación voraz (greedy). La generación estándar con generate debe realizarse con use_cache=False sobre el runtime fijado de Transformers 5.17.

## Capacidades

- Generación de texto de propósito general, con pipeline declarado text-generation y etiqueta conversational.
- Conversación multi-turno, según la etiqueta conversacional del repositorio; no hay evaluación publicada de calidad dialógica.
- Decodificación voraz (greedy) sobre un único prompt de texto sin padding mediante el helper iter_greedy_tokens, con posiciones explícitas.
- Generación estándar mediante AutoModelForCausalLM.from_pretrained y generate, con la restricción de usar use_cache=False en el runtime fijado.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales: no se declara modo de pensamiento (thinking), ni visión, ni audio. El autor indica explícitamente que no se incluye codificador de visión.

## Casos de uso

- Investigación sobre poda y destilación: el modelo sirve como artefacto reproducible para estudiar cómo afecta la poda de profundidad, cabezas y FFN combinada con destilación desde un profesor de 9B a un estudiante de 439M, usando pruning_map.json y training_settings.json como referencia de procedencia.
- Experimentación con arquitecturas gated-deltanet: permite probar en un tamaño reducido (439M) el comportamiento de capas recurrentes o de atención lineal y su estado recurrente en generación con caché de estado fijo.
- Pruebas de integración en pipelines de Transformers: útil para validar flujos de carga con AutoModelForCausalLM, comprobación de safetensors y ejecución con use_cache=False en entornos de CI antes de escalar a modelos mayores.
- Generación de texto en local sobre CPU o GPU de gama baja: con 439M parámetros y 0,9 GB de pesos, cabe en portátiles y equipos sin GPU dedicada, lo que facilita demos educativas y prototipos sin infraestructura.
- Evaluación comparativa de estudiantes destilados: puede emplearse como línea base de muy bajo coste para medir cuánta capacidad se pierde frente al modelo base Qwen/Qwen3.5-0.8B y frente al profesor Ornith-1.5-9B en tareas de texto controladas.
- Docencia y formación técnica: sirve para ilustrar de forma tangible conceptos de destilación de conocimiento, poda estructurada y decodificación voraz con estado cacheado, dado su tamaño manejable y su documentación de procedencia.
- Pruebas de robustez y alucinación en modelos pequeños: adecuado para estudiar patrones de error, degradación gramatical y pérdida de coherencia en modelos con presupuesto de entrenamiento reducido, siempre con expectativas de calidad muy bajas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un archivo metrics.json, pero sus valores no se han facilitado, por lo que no se presentan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación. Tampoco se dispone de comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia, según el tamaño real de los pesos (439.323.904 parámetros): aproximadamente 0,9 GB en bf16/fp16 (coincide con el tamaño declarado del repositorio, 0,9 GB), alrededor de 1,8 GB en fp32 y en torno a 0,5 GB en int8 si se cuantiza manualmente. A estas cifras hay que sumar el estado recurrente, las activaciones y los búferes de runtime.
- El autor indica que los 8 MiB citados corresponden a una estimación de la matriz recurrente en batch uno para el preset compacto, no a la VRAM total, y que el estado de convolución, los pesos, las activaciones de entrenamiento y los tokens de entrada y salida son adicionales.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM es suficiente; también cabe en GPUs de centros de datos tipo A100 o H100, aunque estarían enormemente sobredimensionadas.
- Cabe en GPU consumer: sí, con margen amplio, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en CPU para generación no interactiva.
- Opciones de despliegue: únicamente Transformers, según la model card. El autor advierte explícitamente de que no se debe asumir soporte en vLLM, Ollama, GGUF, decodificación especulativa ni búsqueda por haz (beam search).
- Latencia y throughput estimados: no disponibles. La generación estándar exige use_cache=False en el runtime fijado de Transformers 5.17, lo que implica recómputo del contexto en cada paso y penaliza la velocidad en prompts largos. El helper iter_greedy_tokens ofrece un modo con caché de estado fijo, pero limitado a un único prompt sin padding y decodificación voraz.

## Comparativa con modelos similares

La información disponible solo cubre este repositorio y la identidad de sus modelos de origen, por lo que la comparación se limita a esos tres artefactos. Los tamaños de los modelos base se toman de su denominación y no se han verificado en fuentes independientes.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rol en el proyecto |
|---|---|---|---|---|---|
| summerMC/Distillation | 439.323.904 (dato real) | no disponible | no disponible | safetensors | Estudiante podado y destilado |
| Qwen/Qwen3.5-0.8B | no disponible (denominación sugiere 0,8B) | no disponible | no disponible en la información proporcionada | no disponible | Inicialización del estudiante |
| ornith-ai/Ornith-1.5-9B | no disponible (denominación sugiere 9B) | no disponible | no disponible en la información proporcionada | no disponible | Profesor de destilación |

No se dispone de datos de rendimiento, contexto o licencia de alternativas de la misma categoría (modelos de texto de menos de 1B parámetros), por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo marcado explícitamente como experimental por el autor. No hay reclamación de retención de calidad, precisión en contexto largo ni capacidades equivalentes al profesor.
- El presupuesto de entrenamiento empleado es una prueba de humo (smoke test), no una destilación de producción; la calidad resultante debe considerarse, por tanto, muy limitada.
- Licencia no declarada: no se especifica el régimen de uso, lo que impide determinar si el uso comercial está permitido. La model card remite a revisar las licencias y model cards de los modelos upstream antes de redistribuir.
- Riesgo de alucinación: no evaluado. No se han publicado métricas de fidelidad, veracidad ni tasas de error.
- Sesgos: no documentados. Al derivar de Qwen3.5-0.8B y de un profesor de 9B, puede heredar sesgos de ambos, pero no se ha realizado ninguna auditoría conocida.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles, por lo que no se puede garantizar cobertura multilingüe ni ventanas largas.
- Restricciones de inferencia: la generación estándar debe usar use_cache=False en el runtime fijado de Transformers 5.17. El helper con caché fijo solo admite un prompt de texto sin padding, posiciones explícitas y decodificación voraz; no se contemplan beam search ni decodificación especulativa.
- Compatibilidad limitada: no debe asumirse soporte en vLLM, Ollama o GGUF. No existe codificador de visión ni ninguna modalidad distinta del texto.
- El helper compact_inference.py no se ejecuta automáticamente mediante trust_remote_code; el autor recomienda revisar su código antes de usarlo.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin validación por parte de la comunidad ni informes independientes de funcionamiento.
- El profesor de destilación podría haber estado en 4 bits, lo que puede afectar a la calidad de las señales de destilación; los detalles están en run_settings.json y no se han facilitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/summerMC/Distillation
- Modelo base (inicialización): https://huggingface.co/Qwen/Qwen3.5-0.8B
- Profesor de destilación: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Archivos de procedencia citados en el repositorio: pruning_map.json, run_settings.json, training_settings.json, metrics.json y compact_inference.py (disponibles en el propio repositorio de HuggingFace).
- Resultados de búsqueda web: las consultas realizadas solo devolvieron enlaces genéricos a YouTube y a servicios asociados, sin relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales relevantes.

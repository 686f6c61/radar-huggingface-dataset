# sriharish00u/factguard-slm-adapter

## Resumen

`sriharish00u/factguard-slm-adapter` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario `sriharish00u` sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación de bajo rango que deben cargarse junto con el modelo base para su uso. El nombre sugiere un propósito orientado a la verificación de hechos ("factguard") en un modelo de lenguaje pequeno ("SLM"), aunque la model card no documenta ni confirma ese objetivo.

El modelo base, Qwen2.5-1.5B-Instruct, es un transformer decoder-only denso de 1.500 millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens y capacidades de instrucción, tool calling y generación multilingüe. El adaptador hereda esas capacidades estructurales, pero su comportamiento específico tras el ajuste fino no está documentado por el autor.

La relevancia de esta ficha es limitada: el repositorio no incluye información sobre datos de entrenamiento, hiperparámetros, evaluación, licencia ni idiomas. Se trata de un artefacto de investigación temprano (0 descargas, 0 likes en el momento de la consulta) y debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones en el modelo base; el adaptador ocupa aproximadamente 0,1 GB en disco |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (heredada); no documentada para el adaptador |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones GGUF/AWQ/GPTQ de la comunidad) |
| Idiomas soportados | no disponible para el adaptador; el modelo base Qwen2.5 soporta mas de 29 idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza LoRA (Low-Rank Adaptation), una técnica de ajuste fino eficiente en parámetros que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas. El repositorio declara `library_name: peft` y la versión de framework PEFT 0.21.3. El tamaño del repositorio (0,1 GB) es consistente con un adaptador LoRA de rango moderado sobre un modelo de 1.5B.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos, el rango de LoRA, el alpha, la tasa de aprendizaje ni si se emplearon técnicas de alineación adicionales (RLHF, DPO). La model card es la plantilla por defecto de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]". Tampoco se documenta ninguna innovación técnica específica más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, sujeto al ajuste fino aplicado (no documentado).
- Generación de código y matemáticas a nivel de modelo pequeño (capacidad del base, no verificada tras el adaptador).
- Soporte de tool calling y function calling, heredado del formato de chat de Qwen2.5.
- Capacidad multilingüe del modelo base (más de 29 idiomas), aunque el adaptador podría haber reducido el rendimiento en idiomas no representados en su dataset de ajuste.
- Posible especialización en verificación de hechos o moderación de afirmaciones, sugerida por el nombre "factguard", pero no confirmada ni evaluada.
- No se documenta soporte de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Verificación de afirmaciones en asistentes conversacionales: si el ajuste fino efectivamente entrena al modelo para detectar o marcar afirmaciones no verificadas, podría integrarse como capa de control en pipelines de generación aumentada por recuperación (RAG), señalando respuestas que requieran fuentes.
- Moderación de contenido factual en foros o comentarios: el adaptador podría desplegarse para clasificar o anotar mensajes con posibles inexactitudes, aprovechando el bajo coste de un modelo de 1.5B.
- Filtrado previo en sistemas de atención al cliente: como etapa de bajo coste antes de un modelo mayor, para detectar respuestas del bot que puedan contener datos dudosos.
- Experimentación académica en ajuste eficiente: el adaptador sirve como ejemplo reproducible de LoRA sobre Qwen2.5-1.5B para investigadores que estudien técnicas de verificación factual en modelos pequeños.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1.5B, puede ejecutarse en GPUs de consumo (8-12 GB de VRAM en fp16) o incluso en CPU con cuantización GGUF del base.
- Prototipado rápido de asistentes especializados: permite probar la hipótesis de un "guardián de hechos" sin entrenar un modelo desde cero, cargando el adaptador junto al base con `PeftModel.from_pretrained`.
- Evaluación comparativa de adaptadores: útil como baseline en estudios sobre la eficacia de LoRA para tareas de verificación en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en fp16: aproximadamente 3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 6-8 GB para contextos moderados.
- VRAM en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 1-1,5 GB de pesos, con 4-6 GB totales para contextos largos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100/H100 no son necesarias para este tamaño.
- Cabe en GPUs de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs integradas con suficiente memoria unificada (Apple Silicon).
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador), vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF), LM Studio.
- Latencia y throughput estimados: no disponibles para este adaptador; para el base Qwen2.5-1.5B en una RTX 4090 se esperan decenas de tokens por segundo en fp16, pero no hay mediciones publicadas para esta combinación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sriharish00u/factguard-slm-adapter | 1.5B (base) + LoRA | 32.768 (base) | no disponible | safetensors (PEFT) | Sin evaluación ni documentación |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo base oficial, documentado y evaluado |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 | Apache 2.0 (Qwen Research para algunos) | safetensors, GGUF | Mayor capacidad, más VRAM |
| meta-llama/Llama-3.2-1B-Instruct | 1.2B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Alternativa pequeña con contexto largo |

La comparación directa con el adaptador es difícil porque no hay métricas publicadas; el modelo base Qwen2.5-1.5B-Instruct es la referencia natural y cuenta con evaluación oficial y licencia clara.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre sesgos, datos de entrenamiento ni evaluación, lo que impide auditar el comportamiento del adaptador.
- Riesgo elevado de alucinación: el modelo base es pequeño (1.5B) y el ajuste LoRA no garantiza mejora en veracidad; el nombre "factguard" no debe interpretarse como una garantía de precisión factual.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; el modelo base Qwen2.5-1.5B-Instruct es Apache 2.0, pero el adaptador no declara licencia.
- Idiomas no documentados: el adaptador podría degradar el rendimiento multilingüe del base si se entrenó solo en inglés.
- Sin datos de entrenamiento ni hiperparámetros: imposible reproducir el ajuste o evaluar su robustez.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El adaptador requiere cargar el modelo base por separado; no es un modelo autónomo y depende de la versión de PEFT (0.21.3) y de transformers.
- No hay información sobre el impacto ambiental del entrenamiento.
- Para producción, se recomienda evaluar el adaptador frente al base sin ajuste en el dominio objetivo antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sriharish00u/factguard-slm-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper de LoRA (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
- Calculadora de impacto ambiental (referenciada en la model card): https://mlco2.github.io/impact

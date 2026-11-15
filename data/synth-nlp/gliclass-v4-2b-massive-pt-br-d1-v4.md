# Synth-NLP/gliclass-v4-2b-massive-pt-br-D1-v4

## Resumen

GLiClass v4-2B ajustada en MASSIVE pt-BR (brazo D1_v4) es un modelo de decisión especializado en clasificación de intenciones en portugués, desarrollado por Synth-NLP. Se trata de un fine-tuning del modelo base knowledgator/gliclass-v4-2b, un transformer de 2.364 millones de parámetros que reformula la clasificación como una tarea de selección entre etiquetas candidatas mediante un mecanismo de decisión (decision-model) en lugar de generación libre de texto.

El modelo resuelve el problema de asignar una de 20 intenciones posibles a una frase en portugués de Brasil, enmarcado en un experimento que compara datos sintéticos generados por una pipeline agéntica frente a datos reales, y un modelo de decisión mayor frente a Laya multilingual. El ajuste se realizó sobre el split de entrenamiento del dataset MASSIVE pt-BR combinado con datos sintéticos v4 (25.788 líneas que cubren 30 vistas y 30 intenciones nuevas).

Es relevante ahora porque demuestra que un modelo de decisión de 2B puede alcanzar una precisión de 0.846 en intenciones vistas y 0.826 en intenciones no vistas (escenarios reservados) sobre validación de MASSIVE pt-BR con 20 opciones, lo que lo convierte en una alternativa práctica para sistemas de enrutamiento y NLU en producción con un coste computacional contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiClass (transformer decoder con mecanismo de decisión, decoder-kv) |
| Parametros totales | 2.364.417.347 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se asume compatibilidad con cuantización estándar de transformers, no confirmada por el autor) |
| Idiomas soportados | portugués (pt, pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de knowledgator/gliclass-v4-2b, un modelo de decisión basado en transformer decoder que aborda la clasificación como una selección entre un conjunto de etiquetas candidatas mediante atención sobre las representaciones de las opciones (decoder-kv). El fine-tuning se realizó con el `train.py` oficial de GLiClass en modo single-label, con precisión bf16, ajustando únicamente el último 30% de las capas del decoder.

Los datos de entrenamiento corresponden al brazo D1_v4: las mismas líneas y las mismas 20 opciones que el modelo Laya del mismo brazo, combinando el entrenamiento real de MASSIVE pt-BR con datos sintéticos v4 generados por una pipeline agéntica (25.788 líneas que cubren 30 vistas y 30 intenciones nuevas). La configuración de entrenamiento fue learning rate 2e-5 / 5e-5, tamaño de lote 8, 3 épocas y semilla 42 (valores por defecto del Trainer). No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Clasificación de intenciones en portugués de Brasil sobre un conjunto de 20 opciones por frase.
- Selección single-label entre etiquetas candidatas mediante mecanismo de decisión (no generación libre).
- Generalización a intenciones no vistas durante el entrenamiento (escenarios reservados), con precisión de 0.826 en validación.
- Manejo de intenciones nuevas incorporadas vía datos sintéticos v4 (30 intenciones adicionales).
- Capacidad multilingüe limitada al portugués; no se documentan otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo asigna cada mensaje entrante a una de las 20 intenciones definidas, permitiendo derivar la conversación al flujo o departamento adecuado con una precisión de 0.846 en intenciones vistas.
- Clasificación de tickets de soporte en portugués: integrado como paso previo a un sistema de ticketing, etiqueta automáticamente la intención del usuario para priorización y asignación.
- NLU en asistentes de voz o chatbots en pt-BR: al ser un modelo de decisión de 2B con coste contenido, puede desplegarse en infraestructura modesta para interpretar comandos de usuario en tiempo real.
- Detección de intenciones emergentes: gracias a su capacidad de generalizar a intenciones no vistas (0.826), resulta adecuado para entornos donde aparecen nuevas categorías de peticiones no presentes en el entrenamiento original.
- Investigación sobre datos sintéticos: sirve como artefacto de referencia para reproducir el experimento D1_v4 que compara datos reales frente a sintéticos generados por pipeline agéntica en tareas de clasificación de intenciones.
- Filtrado y moderación de contenido por categoría: el mecanismo de selección entre opciones permite clasificar mensajes en categorías predefinidas de forma determinista, útil en pipelines de moderación en portugués.
- Evaluación comparativa de modelos de decisión: útil como baseline de 2B frente a Laya multilingual en benchmarks de clasificación de intenciones en pt-BR.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| MASSIVE pt-BR (validación, 20 opciones, media de 3 sorteos) | Precisión intenciones vistas | 0.846 |
| MASSIVE pt-BR (validación, 20 opciones, media de 3 sorteos) | Precisión intenciones no vistas (escenarios reservados) | 0.826 |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las predicciones detalladas se encuentran en el directorio `results/` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,7 GB solo para pesos (2.364 millones de parámetros × 2 bytes), más overhead de activaciones y del mecanismo de decisión.
- En cuantización de 8 bits: en torno a 2,4 GB de pesos; en 4 bits: en torno a 1,2 GB de pesos (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con batching; RTX 4090, RTX 3090 o RTX A6000 para inferencia en una sola GPU.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB), RTX 3090 (24 GB) e incluso en GPUs de 8-12 GB con cuantización, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: al ser un modelo de decisión basado en transformers con safetensors, es compatible con el ecosistema Hugging Face Transformers; no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión MASSIVE pt-BR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/gliclass-v4-2b-massive-pt-br-D1-v4 | 2.364 M | no disponible | 0.846 vistas / 0.826 no vistas | Apache 2.0 | Hugging Face |
| knowledgator/gliclass-v4-2b (base) | 2.364 M (estimado por herencia) | no disponible | no disponible | no disponible en esta ficha | Hugging Face |
| Laya multilingual (brazo D1_v4) | no disponible | no disponible | no disponible (usado como referencia en el experimento) | no disponible | no disponible |

La información proporcionada no incluye resultados numéricos de los modelos comparables, por lo que no es posible establecer una comparación cuantitativa directa más allá de la referencia cualitativa al experimento D1_v4.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para portugués de Brasil; su rendimiento en portugués europeo u otros idiomas no está documentado.
- La tarea está restringida a selección single-label entre 20 opciones; no soporta clasificación multietiqueta ni conjuntos de etiquetas arbitrariamente grandes sin reevaluación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de asignación errónea de intención en frases ambiguas o fuera de distribución.
- No se documentan sesgos específicos, pero al entrenarse sobre MASSIVE y datos sintéticos puede heredar los sesgos de dichas fuentes.
- El uso comercial está permitido por la licencia Apache 2.0, sin restricciones adicionales documentadas.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no cuenta con validación de la comunidad.
- No se documentan la longitud de contexto, los tipos de cuantización soportados ni el pipeline oficial, lo que dificulta planificar el despliegue en producción sin pruebas adicionales.
- El ajuste se realizó con solo 3 épocas y sobre el último 30% de las capas, lo que puede limitar la adaptación a dominios muy distintos del dataset MASSIVE.

## Enlaces

- Hugging Face: https://huggingface.co/Synth-NLP/gliclass-v4-2b-massive-pt-br-D1-v4
- Modelo base: https://huggingface.co/knowledgator/gliclass-v4-2b
- Dataset MASSIVE: no disponible en la información proporcionada
- Paper de GLiClass: no disponible en la información proporcionada
- Repositorio de código (`train.py` oficial de GLiClass): no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

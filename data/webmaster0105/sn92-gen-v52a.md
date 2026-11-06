# webmaster0105/sn92-gen-v52a

## Resumen

sn92-gen-v52a es un ajuste fino (fine-tune) de tipo LoRA, con rango 16 y fusionado en los pesos finales, sobre el modelo danyloooah/sn92-generalist-m1-core2, que a su vez es una fusión en el espacio de pesos de fine-tunes de baselabs/mammoth-1. Este último procede de un post-entrenamiento de Qwen3.5-27B. El resultado es un modelo de 26.085.330.160 parámetros (aproximadamente 26 mil millones) con licencia MIT, orientado a la toma de decisiones de elección única y de tipo sí/no dentro de un esquema denominado REAX.

El modelo mantiene la arquitectura de su ancestro Qwen3.5 (etiqueta qwen3_5 en Hugging Face) y el denominado "joint-readout layout" de REAX, en el que el backbone Qwen3_5Model se acompaña de una cabeza de lectura que emite un código de respuesta. No es un modelo conversacional generalista: su propósito declarado es resolver filas de decisión tipadas, es decir, seleccionar una opción entre varias o responder afirmativa o negativamente a una pregunta, con una salida codificada.

Su relevancia es acotada y muy específica. Se publica como un experimento de ajuste sobre un modelo base poco conocido, con solo 40 descargas y sin métricas publicadas, por lo que debe evaluarse como un artefacto de nicho para tareas de clasificación y decisión estructurada, no como un sustituto de un modelo generalista de 27B. La ventana de contexto, los idiomas y el pipeline no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3_5Model) con joint-readout de REAX para código de respuesta |
| Parametros totales | 26.085.330.160 (~26,1B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 52,2 GB) |

## Arquitectura y entrenamiento

El modelo hereda el backbone Qwen3.5 de 27B a través de la cadena de derivación baselabs/mammoth-1 (post-entrenado desde Qwen3.5-27B, Apache-2.0) y sn92-generalist-m1-core2 (fusión en espacio de pesos). Sobre esa base se aplicó un LoRA de rango 16 que posteriormente se fusionó en los pesos, de modo que la inferencia no requiere adaptadores separados. La particularidad estructural es el layout REAX de lectura conjunta: el backbone genera representaciones y una cabeza de lectura emite un código de respuesta, lo que encaja con tareas de decisión cerrada más que con generación libre de texto.

Los datos de entrenamiento declarados son filas de decisión con el estilo de REAX eval-v5.1, junto con filas de elección única y de sí/no provenientes del split de entrenamiento del dataset tasksource/tasksource-jev-typed-decisions. El entrenamiento incorpora un término KL hacia el modelo padre, lo que actúa como regularizador para limitar la deriva respecto al comportamiento del progenitor. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO adicionales en este fine-tune concreto.

## Capacidades

- Decisión de elección única: selecciona una opción entre un conjunto finito de candidatas y emite un código de respuesta.
- Decisión binaria sí/no: responde a preguntas de verificación con una salida codificada.
- Clasificación tipada: está entrenado sobre filas de decisión con tipado (typed decisions), lo que sugiere manejo de esquemas de respuesta estructurados.
- Generación de texto: heredada del backbone Qwen3.5, aunque no es la función para la que se ha ajustado y no está validada en la información disponible.
- Tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Enrutamiento de decisiones en pipelines de datos: el modelo puede recibir una fila con una pregunta y un conjunto de opciones y devolver el código de la opción elegida, integrándose como paso de clasificación en un ETL o en un sistema de anotación automática.
- Verificación binaria de afirmaciones: dado un par pregunta-respuesta, emite un sí/no codificado, útil para filtros de calidad o para descartar pares inconsistentes en un corpus.
- Moderación por reglas tipadas: con un esquema de categorías cerradas, el modelo asigna cada entrada a una de ellas, aprovechando su entrenamiento en decisiones de elección única.
- Etiquetado asistido de datasets: al estar entrenado sobre tasksource-jev-typed-decisions, encaja en la generación de etiquetas de decisión para conjuntos con esquemas similares, con revisión humana posterior.
- Evaluación comparativa de modelos de decisión: sirve como línea base para medir si un ajuste posterior mejora la precisión en tareas de elección cerrada frente al progenitor sn92-generalist-m1-core2.
- Componente de un sistema mayor de razonamiento: el backbone Qwen3.5 permite, en principio, usarlo como extractor o generador, pero para producción en esa función conviene validar antes su calidad, ya que el ajuste se ha orientado a decisión y no a diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: alrededor de 52 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se requiere una GPU de 80 GB (A100 80GB, H100 80GB) o varias GPUs con tensor parallelism.
- Cuantización a 8 bits: aproximadamente 26-28 GB de pesos, viable en una RTX 4090 de 24 GB solo con cuantización más agresiva o con descarga parcial a CPU.
- Cuantización a 4 bits: alrededor de 13-15 GB de pesos, lo que permitiría encajar en una RTX 4090 de 24 GB o en una RTX 3090, siempre que se generen pesos GGUF o AWQ, que no se distribuyen en el repo.
- GPU recomendadas: A100 80GB o H100 para BF16 sin cuantizar; RTX 4090/3090 solo con cuantización de 4 bits y contexto moderado.
- Opciones de despliegue: vLLM o TGI para servicio en BF16 con tensor parallelism; llama.cpp u Ollama si se convierte a GGUF, conversión que el autor no proporciona.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| sn92-gen-v52a | ~26,1B | no disponible | MIT | Decisión tipada (REAX) | Hugging Face, safetensors |
| baselabs/mammoth-1 (progenitor) | ~27B (derivado de Qwen3.5-27B) | no disponible | MIT (post-entrenado desde Apache-2.0) | Generalista post-entrenado | Hugging Face |
| danyloooah/sn92-generalist-m1-core2 (progenitor) | no disponible | no disponible | no disponible en la información | Generalista, fusión de pesos | Hugging Face |
| Qwen3.5-27B (ancestro) | ~27B | no disponible en la información | Apache-2.0 | Generalista | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de decisión tipada) no está disponible: no se han identificado en la información proporcionada otros modelos con el mismo layout REAX ni métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas de precisión, lo que impide estimar su calidad frente al progenitor o frente a alternativas.
- Sesgos: no documentados; al derivar de Qwen3.5 y de un dataset de decisiones tipadas, puede heredar sesgos del corpus de entrenamiento y del esquema de etiquetas de tasksource.
- Riesgo de alucinación: el layout de lectura por código de respuesta reduce la generación libre, pero no elimina el riesgo de asignar códigos incorrectos o inválidos fuera del conjunto de opciones previsto.
- Contexto e idiomas no declarados: no se puede garantizar el comportamiento en contextos largos ni en castellano; la model card no especifica ninguno de los dos.
- Licencia MIT: permite uso comercial y modificación, pero el autor declara no estar afiliado a Base Labs/Baseten, al equipo de Qwen ni a REAX, y remite a LICENSE y NOTICE del repo para las atribuciones de los progenitores; conviene revisar esas condiciones antes de redistribuir.
- Madurez: 40 descargas y 0 likes en el momento de la ficha, sin pipeline declarado ni variantes cuantizadas; es un artefacto experimental, no un modelo listo para producción sin validación propia.
- Dependencia del esquema REAX: fuera del formato de filas de decisión para el que fue entrenado, su comportamiento no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/webmaster0105/sn92-gen-v52a
- Modelo base intermedio: https://huggingface.co/danyloooah/sn92-generalist-m1-core2
- Modelo base original: https://huggingface.co/baselabs/mammoth-1
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions

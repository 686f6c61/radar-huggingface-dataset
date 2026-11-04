# XinyiY1226/tailpu-search-qwen3.5-4b-think-s150

## Resumen

TailPU-Search-Qwen3.5-4B-Think-S150 es un ajuste fino del modelo Qwen3.5-4B orientado a tareas de busqueda agéntica y respuesta a preguntas multi-salto (multi-hop QA). Lo publica el usuario XinyiY1226 en HuggingFace y se distribuye bajo licencia Apache 2.0, aunque el acceso al repositorio está restringido y requiere aceptar condiciones en la plataforma. El modelo parte de los pesos de Qwen3.5-4B, con 4.539.265.536 parámetros totales según los safetensors del repositorio, y está especializado en un pipeline de agente de búsqueda con razonamiento explícito ("think") y control de presupuesto de cómputo.

La relevancia del modelo radica en su enfoque: combina aprendizaje por refuerzo (RL) con un esquema de "budget-conditioned" y una técnica denominada "tail-pu", aplicada sobre el stack de entrenamiento verl. Está entrenado sobre HotpotQA y MuSiQue, dos benchmarks clásicos de QA multi-salto, y su nombre indica un checkpoint intermedio (paso 150) de un entrenamiento más largo. Es, por tanto, un modelo de investigación más que un producto listo para producción.

La información pública disponible es escasa: no se detallan resultados de benchmarks, composición del dataset de entrenamiento ni detalles completos de la arquitectura. Esta ficha refleja únicamente lo que puede inferirse de las etiquetas, el modelo base y los metadatos del repositorio, marcando explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B); detalles específicos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Acceso | Restringido (gated) |
| Tamaño del repositorio | 9,1 GB |
| Etiquetas | qwen3_5, search-agent, multi-hop-qa, reinforcement-learning, tail-pu, budget-conditioned, verl, hotpotqa, musique |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B, un transformer decoder-only de aproximadamente 4.500 millones de parámetros. Sobre esa base se aplica un ajuste fino con aprendizaje por refuerzo utilizando el framework verl, según las etiquetas del repositorio. El nombre del checkpoint ("think-s150") sugiere un entrenamiento en modo "thinking" con razonamiento explícito y que este es el paso 150 de una ejecución más larga; no se especifica el número total de pasos ni el tamaño del lote.

Los datos de entrenamiento declarados en las etiquetas son HotpotQA (dataset:hotpotqa/hotpot_qa) y MuSiQue (dataset:dgslibisey/MuSiQue), ambos benchmarks de QA multi-salto que requieren encadenar varias búsquedas y razonamientos para responder. Las innovaciones técnicas anunciadas son "tail-pu" y "budget-conditioned": el primero parece referirse a una variante de optimización o muestreo (posiblemente relacionada con "tail" y "PU", aunque no se detalla su significado); el segundo indica que el modelo condiciona su comportamiento al presupuesto de cómputo o de pasos disponible. No se publican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de SFT previas o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de formato chat.
- Razonamiento multi-salto: el modelo está entrenado para encadenar pasos de búsqueda y razonamiento antes de responder.
- Comportamiento de agente de búsqueda (search-agent): puede formular consultas, procesar resultados y decidir el siguiente paso.
- Modo "thinking": razonamiento explícito antes de la respuesta final, según el sufijo del nombre del checkpoint.
- Condicionamiento por presupuesto (budget-conditioned): ajusta la profundidad del razonamiento al presupuesto disponible.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque es plausible dado el enfoque de agente de búsqueda.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Respuesta a preguntas multi-salto en dominios documentales: el modelo puede encadenar varias consultas de búsqueda sobre un corpus y combinar evidencias de distintas fuentes, aprovechando su entrenamiento específico en HotpotQA y MuSiQue.
- Investigación académica sobre agentes de búsqueda: sirve como checkpoint de referencia para estudiar el efecto del condicionamiento por presupuesto y de la técnica "tail-pu" en el rendimiento de agentes de búsqueda.
- Asistente de verificación de hechos: dado un conjunto de documentos, el modelo puede planificar búsquedas sucesivas para contrastar afirmaciones y justificar la respuesta con evidencia encadenada.
- Generación de pipelines de QA sobre bases de conocimiento internas: integrado con un motor de búsqueda (Elasticsearch, BM25, embeddings), el modelo actúa como planificador de consultas y sintetizador de respuestas.
- Evaluación comparativa de estrategias de RL para agentes: al ser un checkpoint intermedio (paso 150) de un entrenamiento con verl, permite analizar la evolución del comportamiento del agente a lo largo del entrenamiento.
- Prototipado de asistentes de atención al cliente con acceso a documentación: el modelo puede decidir cuándo consultar la base de conocimiento y cómo combinar varios artículos para responder, aunque su licencia y acceso restringido limitan el uso comercial directo sin revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 9-10 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB para los pesos; en 4 bits, en torno a 3-4 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 con contexto limitado.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 16 GB en cuantización de 8 bits o 8-12 GB en cuantización de 4 bits, siempre que se generen las cuantizaciones a partir de los safetensors.
- Opciones de despliegue: vLLM, TGI o llama.cpp/Ollama tras conversión a GGUF; el acceso restringido del repositorio exige aceptar condiciones antes de descargar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Enfoque |
|---|---|---|---|---|---|
| TailPU-Search-Qwen3.5-4B-Think-S150 | 4,54 B | no disponible | Apache 2.0 | Restringido | Agente de búsqueda multi-salto con RL |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | Apache 2.0 (según modelo base) | Abierto | Modelo generalista de texto |
| Qwen2.5-7B-Instruct | 7,6 B | 128 K | Apache 2.0 | Abierto | Modelo generalista instruido |
| Search-R1 (variantes sobre Qwen) | 1,5-7 B | variable | Apache 2.0 | Abierto | Agente de búsqueda con RL |

La comparativa se limita a alternativas de la misma categoría (modelos de 4-7 B orientados a agentes de búsqueda o modelos base generalistas). No se dispone de datos de rendimiento del modelo para comparar numéricamente con Search-R1 ni con otras variantes de agentes de búsqueda.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en pipelines automatizados.
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Checkpoint intermedio: el sufijo "s150" sugiere que no es el modelo final de la ejecución de entrenamiento, por lo que su rendimiento puede ser inferior al de un checkpoint posterior.
- Datos de entrenamiento limitados a HotpotQA y MuSiQue: puede sobreajustarse a los estilos de pregunta y respuesta de estos benchmarks y generalizar peor a dominios reales.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos o citar evidencias inexistentes, especialmente si el motor de búsqueda devuelve resultados pobres.
- Falta de documentación: no se publican detalles de arquitectura, contexto, benchmarks ni composición del dataset, lo que dificulta evaluar su calidad y reproducibilidad.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de investigación sin garantías, se recomienda validación exhaustiva antes de producción.
- Sesgos: no se documentan sesgos conocidos; al entrenarse sobre datasets académicos en inglés, puede heredar sesgos de esas fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XinyiY1226/tailpu-search-qwen3.5-4b-think-s150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset HotpotQA: https://huggingface.co/datasets/hotpotqa/hotpot_qa
- Dataset MuSiQue: https://huggingface.co/datasets/dgslibisey/MuSiQue
- Framework verl: https://github.com/volcengine/verl

# strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_CoT_A-WIKI-Instruct-r64-best-eval-loss

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) publicado por el usuario strongpear sobre el modelo base meta-llama/Llama-3.1-8B. No se trata por tanto de un modelo completo, sino de pesos de adaptador que deben cargarse junto al modelo base para funcionar. El repositorio ocupa 0,7 GB, tiene 0 descargas y 0 likes, y la model card es una plantilla vacía de HuggingFace en la que todos los campos relevantes (desarrollador, datos de entrenamiento, licencia, idiomas, evaluación) figuran como "[More Information Needed]".

El identificador del modelo es la única fuente de información sustantiva: "RAFT_PMIX_P80_5DOCS_CoT_A-WIKI-Instruct-r64-best-eval-loss". De él se deduce que se trata de un ajuste fino orientado a RAFT (Retrieval-Augmented Fine-Tuning), con razonamiento en cadena (CoT), entrenado con 5 documentos por muestra y con un rango LoRA de 64, seleccionando el checkpoint con mejor pérdida de evaluación. Los componentes "PMIX", "P80" y "A-WIKI" no están documentados en ninguna parte y no pueden interpretarse con rigor.

La relevancia de la ficha es limitada y debe presentarse como tal: es un experimento reproducible pero sin documentación, sin métricas publicadas y sin uso comunitario verificable. Su interés práctico es servir como referencia de receta RAFT+CoT sobre Llama 3.1 8B, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: meta-llama/Llama-3.1-8B |
| Parámetros totales | No disponible. El adaptador usa rango LoRA 64 según el nombre del repositorio; el número exacto de parámetros entrenables no está documentado |
| Longitud de contexto | No documentada para el adaptador. El modelo base Llama 3.1 8B soporta 128.000 tokens |
| Tipos de cuantización | No disponible. El repositorio solo contiene pesos de adaptador en precisión completa, no ficheros GGUF/AWQ/GPTQ |
| Idiomas soportados | No disponible. El modelo base declara oficialmente 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | No disponible en el repositorio. El modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | safetensors (adapter_model.safetensors de PEFT) |
| Tipo de modelo | Adaptador de fine-tuning, no modelo autónomo |
| Modelo base | meta-llama/Llama-3.1-8B |
| Librería | peft (entorno declarado: PEFT 0.20.0) |
| Tamaño del repositorio | 0,7 GB |
| Fecha de creación | 2026-09-19 (según metadatos de HuggingFace) |
| Fecha de actualización | 2026-09-19 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 aplicado sobre meta-llama/Llama-3.1-8B, un transformer decoder-only de 8.030 millones de parámetros con 32 capas, atención por grupos (GQA) con 8 cabezas KV, normalización RMSNorm, activación SwiGLU y RoPE. El adaptador se carga con la librería PEFT y se compone con el modelo base en tiempo de inferencia, o bien se fusiona en los pesos base para exportar a otros formatos.

No hay información publicada sobre el procedimiento de entrenamiento: ni número de tokens, ni composición del dataset, ni régimen de precisión, ni hiperparámetros, ni si hubo RLHF o DPO. El nombre del repositorio sugiere una receta concreta (RAFT, cadena de pensamiento, 5 documentos de contexto, selección por mejor eval loss) sobre un corpus con etiqueta "WIKI", pero ninguno de esos elementos está documentado en la model card. Los identificadores "PMIX", "P80" y "A-WIKI" no aparecen explicados en ningún campo. Es reseñable que el campo training regime de la plantilla sigue marcado como "[More Information Needed]", por lo que no puede confirmarse ni siquiera la precisión usada en el ajuste.

## Capacidades

- Generación de texto condicionada por documentos: la nomenclatura RAFT indica que el adaptador fue entrenado para responder preguntas apoyándose en un conjunto de documentos recuperados incluidos en el prompt (5 documentos por muestra según el nombre).
- Razonamiento en cadena de pensamiento (CoT): el identificador incluye "CoT", lo que sugiere que las respuestas de entrenamiento contienen trazas de razonamiento explícitas antes de la respuesta final.
- Comportamiento tipo instruct: el nombre contiene "Instruct", aunque el campo base_model apunta a meta-llama/Llama-3.1-8B (modelo base sin ajuste de instrucciones), no a la variante Llama-3.1-8B-Instruct. La naturaleza exacta del ajuste de instrucciones no está documentada.
- Herencia del modelo base: al componerse con Llama 3.1 8B, hereda su tokenizador de 128.256 entradas, su ventana de 128.000 tokens y su token especial de fin de turno, así como su capacidad multilingüe declarada para 8 idiomas.
- Tool calling / function calling: no documentado para el adaptador. El modelo base Llama 3.1 8B no incluye plantilla de chat ni definiciones de herramientas; estas solo aparecen en la variante Instruct oficial.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión o audio): no disponibles, el modelo es exclusivamente de texto.
- Modo "thinking" explícito: no documentado, más allá de la posible presencia de cadenas de razonamiento derivada de la etiqueta CoT.

## Casos de uso

- Preguntas y respuestas sobre documentación interna con RAG: el adaptador está entrenado (según su nombre) para trabajar con 5 documentos en el contexto, lo que encaja con pipelines de recuperación que inyectan fragmentos de una base documental antes de la pregunta. La ventaja esperada es una mayor fidelidad al contexto recuperado que un modelo genérico, aunque no hay métricas que lo confirmen.
- Evaluación comparativa de estrategias de recuperación: al ser un adaptador aislado y de pequeño tamaño (0,7 GB), permite alternar entre distintos conjuntos de documentos recuperados y medir el impacto en la respuesta sin reentrenar el modelo base.
- Investigación académica sobre RAFT: sirve como ejemplo reproducible de ajuste con razonamiento en cadena y contexto documental, útil para replicar la receta con otros corpus o comparar rangos LoRA (r=64 frente a r=16 o r=32).
- Asistentes de consulta sobre wikis corporativas: el nombre del repositorio sugiere entrenamiento sobre material tipo Wikipedia, por lo que el caso natural es responder preguntas sobre corpus enciclopédicos o wikis internas estructuradas de forma similar.
- Generación de respuestas con trazabilidad: si el ajuste CoT se confirma, el modelo puede emitir el razonamiento intermedio antes de la respuesta, lo que facilita la auditoría manual de respuestas en dominios sensibles.
- Base para experimentos de fusión y cuantización: al ser un adaptador PEFT, puede fusionarse en el modelo base y exportarse después a GGUF para despliegue en CPU, o combinarse con otros adaptadores para estudiar interferencia entre tareas.
- Prototipado rápido de dominio específico: con un coste de almacenamiento inferior a 1 GB, permite mantener variantes especializadas por dominio sobre un mismo modelo base compartido, reduciendo el uso de disco y memoria frente a checkpoints completos de 16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación cumplimentada y el repositorio no adjunta logs, tablas comparativas ni valores numéricos. El identificador menciona "best-eval-loss", pero el valor de esa pérdida no se proporciona.

## Requisitos de hardware

- Peso del adaptador: 0,7 GB en disco. Es despreciable frente al modelo base, que domina los requisitos de memoria.
- VRAM para el modelo base en fp16/bf16: aproximadamente 16 GB solo para pesos, más caché KV. Con contexto de 8.000 tokens y lote 1, el consumo se sitúa en torno a 17-19 GB.
- VRAM en cuantización de 8 bits: alrededor de 9-10 GB de pesos, viable en GPUs de 12-16 GB con contexto moderado.
- VRAM en cuantización de 4 bits: alrededor de 5-6 GB de pesos, lo que permite ejecución en GPUs consumer de 8 GB con contexto reducido.
- GPUs recomendadas: A100 40 GB u 80 GB y H100 para servicio concurrente con contexto largo; L40S o RTX 6000 Ada para despliegue de una sola instancia; RTX 4090 (24 GB) para fp16 con contexto moderado o para servir varias instancias en 4 bits.
- GPUs consumer compatibles: RTX 4090, 4080, 3090 (24 GB) en fp16 con contexto limitado; RTX 3060 12 GB, 4070 y similares en 4-8 bits.
- Opciones de despliegue: transformers + PEFT para uso directo del adaptador sin fusionar; vLLM y TGI para servicio de alto rendimiento (requieren fusionar el adaptador o usar soporte de LoRA en runtime); llama.cpp y Ollama solo tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_CoT_A-WIKI-Instruct-r64 | 8,03B (base) + adaptador LoRA r64 | 128.000 tokens (base) | No disponible en el repo | safetensors PEFT | 0 descargas, 0 likes |
| meta-llama/Llama-3.1-8B | 8,03B | 128.000 tokens | Llama 3.1 Community License | safetensors | Modelo oficial, ampliamente desplegado |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF de terceros | Modelo oficial con plantilla de chat y tool calling |
| Adaptadores RAFT de terceros sobre Llama 3.1 8B | 8,03B (base) + adaptador | 128.000 tokens (base) | Variable | safetensors PEFT | No disponible comparativa fiable verificada |

La comparación cuantitativa de rendimiento no es posible: este adaptador no publica métricas, y los datos públicos de MMLU, HumanEval o GSM8K corresponden únicamente a los modelos base e instruct oficiales, no a este ajuste concreto.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto de HuggingFace. No se declara autoría real, procedencia de datos, método de evaluación ni uso previsto.
- Sin validación externa: 0 descargas y 0 likes implican que no existe evidencia de que el adaptador funcione fuera del entorno del autor. No debe asumirse calidad alguna por el hecho de estar publicado.
- Riesgo de alucinación: en configuraciones RAFT el modelo puede generar afirmaciones no respaldadas por los documentos recuperados, especialmente si el prompt no fuerza la cita explícita de fuentes.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no es posible evaluar sesgos de género, etnia, idioma o dominio. La etiqueta "WIKI" sugiere dependencia de material enciclopédico, con la sobrerrepresentación temática y cultural que eso conlleva.
- Cobertura lingüística indeterminada: el adaptador no declara idiomas. Aunque el modelo base soporta 8 idiomas, el ajuste puede haber degradado el rendimiento fuera del idioma predominante del corpus de entrenamiento.
- Licencia ambigua: el repositorio no especifica licencia. Cualquier uso comercial debe remitirse a la Llama 3.1 Community License del modelo base, que exige mantener la atribución "Built with Llama", incluir copia de la licencia, nombrar el modelo derivado con el prefijo "Llama" y respetar la cláusula de uso aceptable. La licencia del modelo base no cubre automáticamente los pesos del adaptador si el autor no los licencia explícitamente.
- Fecha de metadatos inusual: el repositorio figura creado el 2026-09-19, fecha posterior a la del modelo base y potencialmente incoherente con el contexto temporal de la publicación.
- Ambigüedad sobre el ajuste de instrucciones: el nombre incluye "Instruct" pero el campo base_model apunta al modelo base, no a la variante Instruct. Esto puede provocar problemas de formato en producción si se espera una plantilla de chat oficial.
- Sin garantías de estabilidad: al no publicarse hiperparámetros ni el checkpoint intermedio, no es posible reproducir el ajuste ni auditar qué hizo exactamente "best-eval-loss".

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_CoT_A-WIKI-Instruct-r64-best-eval-loss
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Referencia citada en las etiquetas del repositorio: https://arxiv.org/abs/1910.09700 (Lacoste et al., 2019, calculadora de impacto ambiental en aprendizaje automático)
- Repositorio del framework PEFT: no incluido en la información proporcionada
- Paper o blog del autor sobre el método RAFT: no incluido en la información proporcionada
- Demo o espacio de inferencia: no disponible

Nota sobre la búsqueda web: los resultados devueltos corresponden exclusivamente a páginas del servicio de correo de Google (Gmail y cuentas de Google) y no guardan relación con el modelo. No se ha encontrado ninguna fuente adicional, paper, blog o repositorio asociado a este adaptador.

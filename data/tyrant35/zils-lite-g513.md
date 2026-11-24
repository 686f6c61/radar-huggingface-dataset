# tyrant35/zils-lite-g513

## Resumen

zils-lite-g513 es un ajuste fino (fine-tune) de tipo *soup-pool* sobre el modelo base malkolm777/zils-lite-l22-correct-attn, publicado por el usuario tyrant35 en Hugging Face. Se trata de un modelo de decisión ("decision-model") orientado a responder preguntas con etiquetas discretas, no a generación libre de texto. Con 852.985.920 parámetros (aproximadamente 853 M) y pesos en formato safetensors, se posiciona en la gama de modelos pequeños, aptos para inferencia en hardware modesto.

La receta de entrenamiento es explícita en la model card: se entrenaron dos LoRA de rango 64 sobre las proyecciones de atención del modelo base (learning rate 3e-5, una pasada), se promediaron los pesos resultantes y el cambio medio respecto al soup original se escaló por un factor de 1,3. Los datos de entrenamiento combinan preguntas de decisión de conjuntos públicos de BigScience P3, iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer, más unas 3.600 preguntas generadas programáticamente con etiquetas calculadas en código (políticas, enrutamiento, selección de herramientas, instrucciones inyectadas, aritmética de fechas y precios, extracción).

El modelo es relevante por su enfoque: en lugar de perseguir capacidades generativas generales, se especializa en tareas de clasificación y decisión con contexto de instrucciones, un nicho útil para pipelines de enrutamiento, agentes y validación automática. La licencia Apache 2.0 facilita su uso comercial, aunque la ausencia de benchmarks publicados y de documentación sobre idiomas limita la evaluación objetiva de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado del soup zils-lite-l22-correct-attn, con LoRA sobre proyecciones de atención) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de malkolm777/zils-lite-l22-correct-attn, un "soup-pool body" de la familia Zils d3-lite. Sobre ese cuerpo se aplicaron dos ajustes finos con LoRA de rango 64 sobre las proyecciones de atención, con learning rate 3e-5 y una sola pasada de entrenamiento. Posteriormente se promediaron los pesos de ambos LoRA y se escaló el cambio medio respecto al soup original por un factor de 1,3, una técnica de *weight averaging* con amplificación de delta que busca reforzar la señal aprendida sin reentrenar el modelo completo.

Los datos de entrenamiento se centran en preguntas de decisión: se tomaron los splits de entrenamiento de conjuntos públicos incluidos en BigScience P3, junto con datos de entrenamiento públicos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer, y se añadieron aproximadamente 3.600 preguntas generadas programáticamente con etiquetas calculadas en código (políticas, enrutamiento, selección de herramientas, instrucciones inyectadas, aritmética de fechas y precios, extracción). Las etiquetas objetivo mezclan la etiqueta gold con las probabilidades del propio soup: peso 0,9 para la gold cuando la respuesta top del soup era incorrecta y 0,5 cuando era correcta. No se usó ningún split de test de benchmarks y se eliminaron las filas cuyo texto aparecía en los conjuntos de evaluación del autor.

## Capacidades

- Clasificación y decisión sobre preguntas con etiquetas discretas: el modelo está especializado en responder preguntas de decisión, no en generación libre.
- Enrutamiento y selección de herramientas: los datos de entrenamiento incluyen preguntas de routing y tool selection generadas programáticamente.
- Seguimiento de políticas e instrucciones inyectadas: entrenado con ejemplos de políticas e instrucciones inyectadas, útil para validación de reglas.
- Aritmética de fechas y precios: los datos sintéticos cubren operaciones aritméticas sobre fechas y precios.
- Extracción de información: incluye ejemplos de tareas de extracción con etiquetas calculadas en código.
- Razonamiento sobre NLI y consistencia factual: entrenado con datos de NLI4CT y HoVer, orientados a inferencia de lenguaje natural y verificación.
- Soporte de tool calling / function calling: no disponible como capacidad documentada explícitamente; el modelo aborda la selección de herramientas como tarea de decisión, no como API de function calling.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Enrutamiento de consultas en pipelines de agentes: el modelo puede clasificar una consulta entrante y decidir qué herramienta o subagente debe atenderla, gracias a su entrenamiento específico en preguntas de routing y tool selection.
- Validación de políticas en sistemas de compliance: permite comprobar si una acción propuesta cumple una política dada, usando los ejemplos de políticas e instrucciones inyectadas del entrenamiento.
- Verificación de consistencia factual: con datos de HoVer y NLI4CT, puede emplearse para decidir si una afirmación está respaldada por un contexto, integrándose en pipelines de verificación automática.
- Clasificación de intenciones en atención al cliente: útil para etiquetar tickets o mensajes con categorías discretas antes de derivarlos a un humano o a un sistema automatizado.
- Extracción y normalización de datos estructurados: los ejemplos de extracción y aritmética de fechas y precios permiten usarlo para decidir el valor correcto de un campo extraído de un documento.
- Evaluación automática de respuestas en pipelines de CI: puede actuar como juez de decisión binaria o multiclase sobre salidas de otros modelos, sustituyendo heurísticas frágiles por un clasificador entrenado.
- Filtrado previo en sistemas RAG: decidir si una consulta requiere recuperación de documentos o puede responderse directamente, reduciendo llamadas innecesarias al retriever.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 853 M de parámetros, en fp16 requiere aproximadamente 1,7 GB de pesos; en fp32, unos 3,4 GB; en cuantización de 8 bits, alrededor de 0,9 GB (estimación a partir del tamaño del repo de 1,7 GB en safetensors).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este tamaño y permiten lotes grandes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo recientes (GTX 1650 en adelante, con margen según cuantización).
- Opciones de despliegue: Al ser un modelo de decisión con pesos safetensors, puede servirse con transformers, vLLM o TGI; llama.cpp y Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-g513 | 853 M | no disponible | Apache 2.0 | Decision-model especializado |
| malkolm777/zils-lite-l22-correct-attn (base) | no disponible | no disponible | no disponible | Soup base de la familia Zils d3-lite |
| Modelos de clasificación tipo DeBERTa/RoBERTa fine-tuned | 100-400 M típicamente | 512 tokens típicamente | MIT/Apache según variante | Clasificación de texto general |
| Modelos de decisión pequeños tipo Qwen2.5-0.5B/1.5B | 500 M-1,5 B | 32K típicamente | Apache 2.0 | Generación general con capacidad de clasificación |

La comparación directa con alternativas es limitada porque no hay benchmarks publicados ni datos de contexto o idiomas para zils-lite-g513. Frente a clasificadores encoder-only, ofrece un tamaño mayor y un entrenamiento orientado a decisiones con instrucciones; frente a modelos generativos pequeños, carece de documentación sobre capacidades generales.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El modelo está especializado en decisiones y clasificación; no debe esperarse generación de texto libre de calidad.
- La longitud de contexto no está documentada, lo que impide planificar su uso en escenarios de contexto largo.
- Los idiomas soportados no están especificados; los conjuntos de entrenamiento (P3, iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI, HoVer) son mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación y de sobreajuste a los formatos de pregunta de los conjuntos de entrenamiento; los datos sintéticos pueden introducir sesgos de plantilla.
- El autor indica que no se usó ningún split de test de benchmarks y que se eliminaron filas solapadas con sus conjuntos de evaluación, pero no se aportan métricas de validación.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base cuyos términos no se detallan, conviene verificar la licencia del modelo base antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-lite-g513
- Modelo base: https://huggingface.co/malkolm777/zils-lite-l22-correct-attn
- BigScience P3: https://huggingface.co/datasets/bigscience/P3
- iSarcasmEval: https://github.com/iSarcasmEval/iSarcasmEval
- CLadder: https://github.com/causalNLP/cladder
- NLI4CT: https://github.com/ai-siriusteam/nli4ct
- Amazon ESCI: https://github.com/amazon-science/esci-data
- HoVer: https://github.com/hover-nlp/hover

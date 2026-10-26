# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-grpo3300-lora

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) publicado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,49 mil millones de parámetros con 32.768 tokens de contexto. El adaptador no es un modelo independiente: se carga sobre el base original y su propósito es especializarlo en tool calling estructurado, es decir, generar llamadas a funciones en formato JSON y abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.

El entrenamiento es en dos fases sobre el dataset uygarkurt/xlam-tool-calling-mixed: primero 2.800 actualizaciones de supervisión fina (SFT) y después 3.300 actualizaciones de Group Relative Policy Optimization (GRPO) continuando desde el adaptador SFT, con un coste total declarado de 2,2 horas de bucle de entrenamiento. La segunda fase mejora la precisión exacta de llamada (xLAM ETC de 73,72% a 77,66%) y la precisión de nombre de función (95,89% a 96,72%), a costa de un ligero retroceso en tareas de conocimiento general y en la detección de irrelevancia.

Su relevancia es práctica: demuestra un flujo completo de posentrenamiento (SFT + RL con GRPO) reproducible con un modelo de 0,5 B y hardware modesto, orientado a agentes y pipelines de function calling donde el coste por token y la latencia importan más que el razonamiento profundo. Es un artefacto de investigación con 0 descargas y sin licencia declarada, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) sobre Qwen/Qwen2.5-0.5B-Instruct: atención con query grouping (GQA), RoPE, SwiGLU, RMSNorm; adaptador LoRA (PEFT) acoplado |
| Parametros totales | 0,49 B (494 M) en el modelo base; el adaptador LoRA añade pesos de rango no especificado en la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base Qwen2.5-0.5B-Instruct; no reentrenado ni ampliado por el adaptador) |
| Tipos de cuantizacion | El adaptador se publica en safetensors sin cuantizar; no se distribuyen versiones GGUF, AWQ ni GPTQ. Tras fusionar con el base se pueden aplicar las cuantizaciones soportadas por el base (GGUF Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | Inglés (`en`) declarado en la model card; el modelo base Qwen2.5 soporta 29 idiomas, pero el adaptador solo se ha entrenado y evaluado en inglés |
| Licencia | No disponible (la model card y los metadatos no la especifican). El modelo base Qwen2.5-0.5B-Instruct es Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT, librería `peft` + `transformers`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer causal denso de 24 capas con atención GQA (14 cabezas de consulta y 2 de clave/valor), embeddings atados y un vocabulario de 151.936 tokens; el base se entrenó con 18 billones de tokens según la documentación de Qwen. El adaptador en sí es un LoRA de rango no declarado, por lo que no altera la arquitectura ni la ventana de contexto: solo modifica el comportamiento de generación hacia la emisión de llamadas a funciones bien formadas y la abstención ante herramientas irrelevantes.

El entrenamiento se realizó con el framework Post-Training Lab del mismo autor sobre el dataset uygarkurt/xlam-tool-calling-mixed. La fase SFT (2.800 actualizaciones, 0,4 h) enseña el formato de llamada; la fase GRPO (3.300 actualizaciones, 1,8 h) optimiza la recompensa con política relativa de grupo, partiendo del adaptador SFT ya entrenado, no del base. No se documentan hiperparámetros, rango LoRA, alpha, tamaño efectivo de batch ni composición detallada del dataset. Las evaluaciones xLAM emplean scripts propios del autor sobre un holdout de solo llamadas con 2.287 ejemplos evaluados y 700 descartados, y las puntuaciones BFCL son agregados de subconjuntos seleccionados de BFCL-v3 de un solo turno, no el resultado oficial completo.

## Capacidades

- Generación de llamadas a funciones en formato estructurado (tool calling / function calling) de un solo turno, con nombres de función y argumentos.
- Abstención o rechazo cuando las herramientas ofrecidas no son pertinentes para la consulta (capacidad entrenada explícitamente, con 56,15% en el subconjunto de irrelevancia).
- Conversación multi-turno y generación de texto instructivo, heredadas del modelo base.
- Capacidad limitada de razonamiento matemático y de conocimiento general (MATH-500 17,00%; MMLU 39,70%), degradada respecto a la fase SFT.
- Seguimiento de instrucciones con formato estricto limitado (IFEval prompt-level strict 31,05%).
- Sin capacidades multimodales, de audio ni de visión.
- Sin modo de razonamiento extendido (thinking mode) ni decodificación especulativa declarada.
- Soporte monolingüe de facto: entrenado y evaluado solo en inglés.

## Casos de uso

- Enrutado de intenciones en un asistente conversacional: dado un catálogo pequeño de funciones (consultar pedido, cancelar suscripción, abrir ticket), el adaptador devuelve la llamada JSON correcta o se abstiene, lo que permite al orquestador delegar o pedir aclaración al usuario.
- Extracción de parámetros estructurados en pipelines de datos: convertir texto libre en argumentos tipados para una API interna, aprovechando la precisión de nombre de función del 96,72% en el holdout xLAM.
- Prototipado rápido de agentes en local: al ocupar menos de 1 GB en fp16, se puede iterar sobre el diseño de herramientas y prompts en un portátil o en CPU antes de pasar a un modelo mayor.
- Filtro de seguridad de herramientas: usar la cabeza de abstención como primera barrera para descartar llamadas a funciones no expuestas en el contexto, reduciendo ejecuciones erróneas antes de llegar a un modelo grande.
- Evaluación comparativa de pipelines de posentrenamiento: sirve como referencia reproducible (SFT frente a SFT+GRPO) para medir el efecto de GRPO en tareas de function calling con un presupuesto de 2,2 horas de cómputo.
- Generación de datos sintéticos de entrenamiento: producir pares consulta–llamada para aumentar el dataset de un modelo mayor, con revisión humana dado el 77,66% de precisión exacta.
- Docencia y experimentación con PEFT: ejemplo mínimo de adaptador LoRA cargable con `transformers` + `peft` en una GPU de gama de entrada o incluso en CPU.

## Benchmarks y rendimiento

Datos publicados en la model card. Todas las puntuaciones son porcentajes; la primera fila es el adaptador SFT que inicializa el GRPO y la segunda el adaptador final.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 2.800 | 39,80 | 18,40 | 29,57 | 73,72 | 95,89 | 51,76 | 83,33 | 58,83 | 0,4 |
| SFT + GRPO (este adaptador) | GRPO 3.300 | 39,70 | 17,00 | 31,05 | 77,66 | 96,72 | 56,70 | 83,33 | 56,15 | 2,2 |

Notas de metodología declaradas por el autor: xLAM ETC es precisión exacta de llamada y xLAM FNA precisión de nombre de función, medidas sobre un holdout de solo llamadas (2.287 ejemplos evaluados, 700 descartados), no sobre el split de test del dataset mixto. BFCL single-turn FC es un agregado de subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16 tras fusionar el adaptador con el base: aproximadamente 1 GB de pesos más overhead de activaciones y caché KV; en la práctica 1,5–2 GB.
- En int8: alrededor de 0,6 GB de pesos. En GGUF Q4_K_M tras conversión: alrededor de 0,4 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, RTX 3060, RTX 4090); A100/H100 no son necesarias y estarían infrautilizadas. Funciona en CPU con llama.cpp u Ollama tras fusionar y convertir.
- Despliegue: vLLM con `--enable-lora` para servir el adaptador sin fusionar; TGI con adaptadores; `transformers` + `peft` para inferencia directa; llama.cpp/Ollama solo tras fusionar el adaptador en el base y convertir a GGUF, ya que estos runtimes no cargan LoRA PEFT directamente en este formato.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (0,49 B) se espera una latencia muy baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT+GRPO sobre Qwen2.5-0.5B-Instruct) | 0,49 B + LoRA | 32.768 | xLAM ETC 77,66%; BFCL single-turn 56,70%; abstención entrenada | No disponible | HuggingFace, 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,49 B | 32.768 | No se declara entrenamiento específico de function calling | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | No se declara entrenamiento específico de function calling | Apache 2.0 | HuggingFace |
| Adaptadores SFT intermedios del mismo autor | 0,49 B + LoRA | 32.768 | xLAM ETC 73,72%; BFCL 51,76% | No disponible | HuggingFace |

No se dispone de datos de benchmarks del base ni del 1.5B en la información proporcionada, por lo que la comparación cuantitativa se limita a las dos filas del adaptador. Existen otras familias de modelos pequeños especializados en function calling (por ejemplo, la serie xLAM de Salesforce o Hammer), pero no se han podido verificar sus especificaciones en esta búsqueda: no disponible.

## Limitaciones y advertencias

- Licencia no declarada: no hay término de uso especificado para el adaptador. Aunque el base es Apache 2.0, la ausencia de licencia en el adaptador impide asumir uso comercial sin contactar con el autor.
- Es un adaptador, no un modelo autónomo: requiere descargar Qwen2.5-0.5B-Instruct y cargarlo con `peft`. El repositorio reporta 0,0 GB de tamaño, por lo que conviene verificar que los ficheros del adaptador están realmente subidos antes de integrarlo.
- Riesgo alto de alucinación y errores factuales: MMLU 39,70% y MATH-500 17,00% sitúan al modelo muy por debajo de tamaños superiores; no es apto para responder conocimiento general sin verificación.
- Seguimiento de instrucciones débil: IFEval estricto del 31,05%, insuficiente para restricciones de formato complejas o cadenas largas de instrucciones.
- La fase GRPO empeora la detección de irrelevancia (de 58,83% a 56,15%) y el rendimiento en matemáticas (de 18,40% a 17,00%): el adaptador gana precisión de llamada a costa de otras capacidades. No usar la abstención como único mecanismo de seguridad.
- Solo inglés declarado: el entrenamiento y la evaluación son monolingües; el rendimiento en castellano no está medido y previsiblemente será peor que el del base.
- Sesgos: no documentados por el autor; al heredar el base, arrastra los sesgos de su corpus de 18 billones de tokens, sin evaluación de sesgo publicada.
- Métricas no directamente comparables con las oficiales: BFCL es un agregado de subconjuntos seleccionados con scripts propios, y xLAM se mide sobre un holdout de solo llamadas con 700 ejemplos descartados. No deben citarse como resultados oficiales de esos benchmarks.
- Volumen de uso nulo (0 descargas, 0 likes) y fecha de creación posterior a la ventana habitual de modelos Qwen2.5: sin validación independiente por parte de la comunidad.
- Ventana de 32.768 tokens heredada, pero con 0,49 B de parámetros la calidad decae notablemente en contextos largos; no asumir buen rendimiento cerca del límite.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-grpo3300-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio del framework de entrenamiento: https://github.com/uygarkurt/post-training-lab
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo páginas genéricas de ChatGPT), por lo que no hay papers, blogs ni demos adicionales que enlazar.

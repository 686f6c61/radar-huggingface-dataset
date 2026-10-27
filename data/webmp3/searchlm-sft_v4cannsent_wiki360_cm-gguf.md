# webmp3/searchlm-sft_v4cannsent_wiki360_cm-GGUF

## Resumen

`webmp3/searchlm-sft_v4cannsent_wiki360_cm-GGUF` es una cuantización GGUF de carácter comunitario del modelo `Kausp11/searchlm-sft_v4cannsent_wiki360_cm`, un modelo de lenguaje de arquitectura `llama` con 361.824.960 parámetros (aproximadamente 0,36 B). No se trata de un lanzamiento oficial del autor original: el repositorio lo publica el usuario `webmp3` a partir de una conversión propia a BF16 GGUF y una posterior recuantización al preset Q4_K_M de llama.cpp. El único archivo disponible ocupa 270.594.464 bytes (unos 0,3 GB), lo que supone un 63 % menos que el BF16 de origen (0,7 GB).

El interés práctico del modelo es su tamaño: al caber holgadamente en CPU, en GPUs de gama de entrada e incluso en dispositivos embebidos, sirve como pieza de experimentación para pipelines locales con llama.cpp, para pruebas de integración y para tareas de texto de baja exigencia en inglés y chino. La model card es explícita sobre el alcance de la validación: se comprobó la estructura GGUF, se verificó la procedencia del archivo fuente mediante SHA-256 y se ejecutó una generación real de texto con llama.cpp (build `b11669-620d2225c`, 4 hilos), pero no se ejecutó ninguna calibración con matriz de importancia ni ningún benchmark de calidad, perplejidad o código.

La información pública disponible es muy limitada: se desconocen la longitud de contexto, la composición del dataset de entrenamiento, el proceso de ajuste (el nombre sugiere SFT, sin confirmación documental) y cualquier métrica de rendimiento. Cualquier evaluación de calidad debe realizarla el usuario antes de considerar el modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `llama` (transformer decoder-only, según metadatos del autor) |
| Parametros totales | 361.824.960 (≈0,36 B; la model card indica 0,4 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado); sin calibración imatrix |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (origen en safetensors; BF16 GGUF en repositorio separado del mismo autor) |
| Tamano del repositorio | 0,3 GB |
| Archivo publicado | `searchlm-sft_v4cannsent_wiki360_cm-Q4_K_M.gguf` (270.594.464 bytes) |
| SHA-256 del archivo | `89e1c66688aa81f2bb9bbe1449ac85e15d5a3641feff6b9fe2576721d32bdfaa` |
| Composicion de tensores (Q4_K_M) | F32: 65, Q4_K: 16, Q5_0: 176, Q6_K: 16, Q8_0: 17 |
| Modelo base | Kausp11/searchlm-sft_v4cannsent_wiki360_cm (commit `9bf82ae008a495701f58b9074734db6854913bed`) |
| Fuente de la cuantizacion | webmp3/...-BF16-GGUF (commit `50effa060b93b516e7a5c92ed9244ee1b16075d4`) |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como `llama`, es decir, un transformer decoder-only con atención causal, sin indicios de mezcla de expertos (MoE), modelos de estado recurrente ni esquemas híbridos. Con 361.824.960 parámetros, el modelo se sitúa en la franja de los modelos pequeños orientados a inferencia local. No se documentan el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto nativa; tampoco se especifica si emplea atención lineal o alguna variante de decodificación especulativa.

Respecto al entrenamiento, no hay información publicada sobre el volumen de tokens, la composición del corpus, el uso de RLHF o DPO, ni sobre las etapas de ajuste. El propio nombre del repositorio incluye los fragmentos `sft` y `wiki360`, que podrían sugerir un ajuste supervisado con datos derivados de Wikipedia, pero se trata de una inferencia a partir del identificador y no de un dato confirmado por el autor. En el lado de la cuantización sí hay detalle técnico verificable: la conversión se hizo con el script oficial sin modificar `convert_hf_to_gguf.py` de llama.cpp (revisión `620d2225cc436ab0b001e3200e590e3b286ef9ab`), la recuantización se ejecutó por streaming en un runner público de GitHub Actions y cada tensor del origen se conserva exactamente una vez en el archivo resultante.

## Capacidades

- Generación de texto autoregresiva en inglés y chino, según los idiomas declarados en la model card.
- Razonamiento y conocimiento general: sin datos verificables; no se han publicado evaluaciones de MMLU, GSM8K ni similares.
- Generación de código: no documentada; el autor indica explícitamente que no se reclama ningún benchmark de código.
- Tool calling y function calling: no documentado; no hay plantilla de chat ni formato de herramientas descrito en la información disponible.
- Uso como agente o razonamiento multi-paso: no documentado y poco probable en un modelo de este tamaño sin ajuste específico.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidad de ejecución en llama.cpp con una generación de texto verificada tras la cuantización.

## Casos de uso

- Prototipado de pipelines llama.cpp: sirve para validar la integración de `llama-cli`, `llama-server` o bindings antes de migrar a un modelo mayor, gracias a su descarga de 0,3 GB y a su bajo coste de carga.
- Clasificación y etiquetado de textos cortos en inglés o chino dentro de procesos de ingesta documental, aceptando que la calidad debe medirse con un conjunto de validación propio al no existir benchmarks publicados.
- Filtrado o reranking ligero de candidatos en un motor de búsqueda experimental: el nombre del modelo base sugiere orientación a búsqueda, aunque esta hipótesis debe confirmarse empíricamente antes de integrarla.
- Generación de texto en dispositivos sin GPU (Raspberry Pi, mini-PC, portátiles modestos) donde el presupuesto de memoria es inferior a 1 GB y se acepta una calidad propia de un modelo de 0,36 B.
- Pruebas de carga y benchmarking de infraestructura: al ser un modelo pequeño y determinista en formato GGUF, permite medir latencia, throughput y consumo de memoria del servidor sin consumir recursos de modelos grandes.
- Tests de regresión de sistemas LLM: usar este modelo como "stub" barato en suites de integración continua que necesitan respuestas reales de un motor de inferencia, sustituyéndolo por el modelo final en las pruebas de aceptación.
- Traducción asistida de frases cortas entre inglés y chino en herramientas internas, con revisión humana obligatoria por la falta de evaluación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado lo indica de forma explícita: "No quality benchmark was run" y "No coding benchmark, perplexity or quality score is claimed". La única verificación realizada es funcional: carga del archivo con llama.cpp build `b11669-620d2225c` y una generación de texto con 4 hilos, además de la comprobación estructural del GGUF y de la presencia única de cada tensor de origen.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,3-0,5 GB con el archivo Q4_K_M, incluyendo caché KV para contextos moderados (la longitud de contexto no está documentada, por lo que la cifra exacta depende de la configuración elegida).
- GPU recomendadas: cualquier GPU con 1 GB o más de memoria es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, una RTX 3050 o una iGPU con memoria compartida pueden ejecutar el modelo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer de los últimos diez años, y también en CPU.
- Despliegue: llama.cpp (opción natural, es el runtime con el que se validó el archivo), `llama-server` para exponer una API compatible con endpoints, Ollama u otros frontales que acepten GGUF. vLLM y TGI no están verificados para este archivo en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones; solo consta que la prueba de generación se ejecutó con 4 hilos en un runner de GitHub Actions.
- Almacenamiento: 0,3 GB para el modelo, más el espacio de la caché KV en tiempo de ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| searchlm-sft_v4cannsent_wiki360_cm (Q4_K_M, este repo) | 361.824.960 | no disponible | apache-2.0 | GGUF Q4_K_M en HuggingFace | sin benchmarks publicados |
| SmolLM2-360M-Instruct | ≈362 M | 8.192 tokens (según su model card pública) | apache-2.0 | safetensors y múltiples GGUF comunitarios | benchmarks publicados por el autor original |
| Qwen2.5-0.5B-Instruct | ≈494 M | 32.768 tokens (según su model card pública) | apache-2.0 | safetensors y GGUF oficiales | benchmarks publicados por el autor original |
| TinyLlama-1.1B-Chat | ≈1,1 B | 2.048 tokens (según su model card pública) | apache-2.0 | safetensors y GGUF comunitarios | benchmarks publicados por el autor original |

Nota: los datos de contexto y parámetros de los modelos alternativos provienen de sus model cards públicas y no han sido verificados en esta ficha; conviene contrastarlos antes de tomar decisiones. La comparación de rendimiento con este modelo no es posible porque no se ha publicado ninguna métrica de calidad.

## Limitaciones y advertencias

- No es un lanzamiento oficial: es una cuantización comunitaria e independiente, sin revisión del autor del modelo original.
- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K, perplejidad ni evaluaciones humanas; cualquier afirmación de calidad sería especulativa.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Idiomas limitados a inglés y chino según la model card; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Riesgo de alucinación: inherente a los modelos de 0,36 B sin ajuste verificable; se espera una tasa alta en tareas de conocimiento factual.
- Sin calibración imatrix: la cuantización se realizó sin matriz de importancia, lo que puede degradar la calidad respecto a una cuantización calibrada del mismo tipo.
- El archivo BF16 intermedio no fue probado en inferencia; solo se validó el Q4_K_M publicado.
- El nombre del repositorio sugiere SFT y datos de Wikipedia, pero no hay documentación que lo confirme; no debe asumirse ningún comportamiento derivado de ello.
- Licencia apache-2.0: permite uso comercial y redistribución con atribución; deben conservarse los avisos de copyright del autor original y del cuantizador.
- Sesgos: no documentados; al no conocerse el corpus de entrenamiento no es posible evaluar sesgos de género, etnia, idioma o dominio.
- No hay plantilla de chat ni formato de prompt documentado, por lo que el comportamiento conversacional depende del formato que se le pase manualmente.
- Para producción: tratarlo como modelo experimental y someterlo a una evaluación propia antes de cualquier despliegue con usuarios reales.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/webmp3/searchlm-sft_v4cannsent_wiki360_cm-GGUF
- Modelo original: https://huggingface.co/Kausp11/searchlm-sft_v4cannsent_wiki360_cm
- Model card del modelo original en el commit de referencia: https://huggingface.co/Kausp11/searchlm-sft_v4cannsent_wiki360_cm/blob/9bf82ae008a495701f58b9074734db6854913bed/README.md
- Conversión BF16 GGUF del mismo autor: https://huggingface.co/webmp3/searchlm-sft_v4cannsent_wiki360_cm-BF16-GGUF
- Ejecución de GitHub Actions donde se generó la cuantización: https://github.com/gtotaro86-ai/sakura-cloud-builds/actions/runs/40405353088
- llama.cpp (runtime utilizado para la verificación): https://github.com/ggerganov/llama.cpp
- Perfil del cuantizador en HuggingFace: https://huggingface.co/webmp3

Nota sobre la búsqueda web: los resultados obtenidos no aportan información adicional sobre este modelo; los enlaces encontrados corresponden a otros repositorios del mismo autor (`Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF`, `Sakura-MiniMax-H3-GGUF`), a un listado genérico de modelos GGUF por consumo de RAM y a una página sin relación con el modelo. No se han incluido por no ser relevantes para esta ficha.

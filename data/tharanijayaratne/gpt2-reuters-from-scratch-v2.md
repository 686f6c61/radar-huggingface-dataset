# TharaniJayaratne/gpt2-reuters-from-scratch-v2

## Resumen

`TharaniJayaratne/gpt2-reuters-from-scratch-v2` es un modelo de lenguaje de tipo GPT-2 entrenado desde inicialización aleatoria (no es un fine-tuning de un checkpoint preentrenado de OpenAI) sobre un corpus de artículos de Reuters. Lo desarrolla TharaniJayaratne, autor individual, y se publica en Hugging Face bajo la librería `transformers`. Su propósito es la generación de texto en inglés con estilo periodístico, tomando como entrada el titular y el cuerpo de la noticia.

Se trata de un modelo muy pequeño: 16.537.088 parámetros totales, 4 capas, 4 cabezas de atención y dimensión de embedding de 256, con una longitud de contexto de 256 tokens. El entrenamiento se realizó con modelado de lenguaje causal (predicción del siguiente token) durante 5 épocas, batch size 32 y learning rate 0,0005, con un tiempo de entrenamiento registrado de 6,42 minutos. El tokenizador asociado es `ingeniumacademy/gpt2-reuters-tokenizer`.

Su relevancia es fundamentalmente didáctica y de investigación: sirve como referencia de un pipeline completo de entrenamiento desde cero sobre un dominio concreto (noticias de agencia), con pérdidas de validación y test registradas (perplejidad 83,95 y 67,69 respectivamente). No está pensado para uso en producción ni compite con modelos de gran escala; su interés está en reproducibilidad, bajo coste computacional y estudio de dinámicas de entrenamiento en modelos minúsculos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (causal LM) |
| Parametros totales | 16.537.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Capas / cabezas / dim. de embedding | 4 / 4 / 256 |
| Tokenizador | `ingeniumacademy/gpt2-reuters-tokenizer` |
| Dataset de entrenamiento | `ingeniumacademy/reuters_articles` |
| Epocas / batch / lr | 5 / 32 / 0,0005 |
| Tiempo de entrenamiento | 6,42 minutos |
| Perdida de validacion (ppl) | 4,4303 (83,95) |
| Perdida de test (ppl) | 4,215 (67,69) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 canónica en versión reducida: un transformer decoder-only con 4 capas, 4 cabezas de atención y dimensión de embedding de 256, entrenado con objetivo de modelado de lenguaje causal (next-token prediction). La entrada se construye concatenando el titular y el cuerpo de la noticia separados por un salto de línea, de modo que el modelo aprende la transición entre ambos y el estilo redaccional de agencia.

El entrenamiento parte de inicialización aleatoria, no de un checkpoint preentrenado, sobre el dataset `ingeniumacademy/reuters_articles`. Se ejecutaron 5 épocas con batch size 32 y learning rate 0,0005, en 6,42 minutos, lo que confirma que el coste computacional es mínimo (compatible con una única GPU consumer o incluso CPU en tiempos razonables). El autor publica los registros de pérdida en `training_log_main.csv` y documenta otros dos modelos entrenados en el cuarto trimestre en `q4_runs/`. No se menciona uso de RLHF, DPO ni técnicas de decodificación especulativa; tampoco se detalla la composición exacta del corpus ni el número de tokens de entrenamiento.

## Capacidades

- Generación de texto en inglés con estilo periodístico, condicionada por un titular de entrada.
- Continuación de texto y finalización de noticias breves a partir de un encabezado.
- Modelado de lenguaje causal genérico dentro del dominio de noticias de agencia.
- Aprendizaje de estructura titular-cuerpo gracias a la concatenación con salto de línea durante el preentrenamiento.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (etiqueta `en`); no se documentan otros idiomas.
- No tiene modo thinking, visión, audio ni otras modalidades.

## Casos de uso

- Generación de titulares y entradillas de prueba: dado un titular semilla, el modelo produce un cuerpo de noticia breve con el registro de Reuters, útil para prototipos de redacción automática en entornos controlados.
- Docencia y formación en NLP: sirve para ilustrar un pipeline completo de entrenamiento desde cero (tokenizador, dataset, bucle de entrenamiento, evaluación con perplejidad) con un coste de 6,42 minutos por ejecución.
- Investigación en eficiencia de entrenamiento: al ser reproducible en minutos, permite estudiar el efecto de hiperparámetros (lr, batch, épocas) sobre la perplejidad de validación y test.
- Generación de datos sintéticos de dominio periodístico: puede producir textos de relleno para pruebas de sistemas de extracción de entidades o clasificación de noticias, siempre con revisión humana.
- Benchmark de infraestructura: por su tamaño (0,1 GB en safetensors), es adecuado para validar pipelines de despliegue con `transformers`, text-generation-inference o endpoints compatibles antes de migrar a modelos mayores.
- Experimentos de destilación y compresión: al ser un modelo minúsculo con contexto de 256 tokens, sirve como alumno o como referencia para comparar técnicas de cuantización y poda en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento reportados por el autor son las pérdidas de validación y test:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 4,4303 |
| Perplejidad de validacion | 83,95 |
| Perdida de test | 4,215 |
| Perplejidad de test | 67,69 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (16,5 M de parámetros ocupan unos 66 MB en fp32, 33 MB en fp16); el repositorio completo pesa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobredimensionada; el modelo cabe holgadamente en GPUs de gama baja e incluso en CPU.
- Cabe en cualquier GPU consumer e integrada; también es viable la inferencia en CPU con latencias de milisegundos por token.
- Opciones de despliegue: `transformers` (librería nativa), text-generation-inference (etiqueta `text-generation-inference` presente), endpoints compatibles; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles de forma medida; por el tamaño del modelo se espera throughput muy alto y latencia por token en el orden de microsegundos a pocos milisegundos en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gpt2-reuters-from-scratch-v2 | 16,5 M | 256 | no disponible | Hugging Face | Entrenado desde cero sobre Reuters, inglés |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT (segun publicacion original) | Hugging Face, multiples mirrors | Referencia generalista; no especializado en noticias |
| DistilGPT-2 | 82 M | 1024 | Apache 2.0 (segun card original) | Hugging Face | Destilado de GPT-2, más rápido que GPT-2 small |
| Modelos GPT-2 diminutos de dominio (varios) | 10-30 M | 128-512 | variable | Hugging Face | Alternativas comparables en escala, no siempre documentadas |

La comparación con GPT-2 small y DistilGPT-2 es únicamente orientativa en cuanto a escala y contexto: el modelo de este ficha es entre 5 y 7 veces más pequeño y su contexto es cuatro veces menor, por lo que no es directamente competitivo en calidad generalista. No se dispone de benchmarks comunes que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo de 16,5 M de parámetros: la calidad de generación es muy limitada y propensa a incoherencias, repeticiones y derivas temáticas más allá de unas pocas frases.
- Contexto de solo 256 tokens: insuficiente para artículos completos o conversaciones multi-turno; el modelo pierde el hilo rápidamente.
- Entrenado exclusivamente en inglés y sobre un corpus de noticias de Reuters: fuerte sesgo de dominio y de estilo; el vocabulario y los temas fuera de ese registro se manejan mal.
- Riesgo elevado de alucinación: al ser un modelo pequeño entrenado con pocos datos, puede generar afirmaciones plausibles pero falsas, especialmente nombres, cifras y citas.
- Sesgos heredados del corpus de Reuters (cobertura geográfica, política y económica sesgada hacia ciertos temas y actores), no evaluados ni mitigados según la información disponible.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Sin datos de evaluación estándar (MMLU, HumanEval, etc.) ni pruebas de robustez o seguridad; no apto para producción sin validación adicional.
- Sin soporte documentado de tool calling, agentes ni multimodalidad; no usar como sustituto de modelos mayores en pipelines que requieran esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TharaniJayaratne/gpt2-reuters-from-scratch-v2
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
- Dataset: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Registro de pérdidas: `training_log_main.csv` (incluido en el repositorio del modelo)
- Runs adicionales: carpeta `q4_runs/` (incluida en el repositorio del modelo)

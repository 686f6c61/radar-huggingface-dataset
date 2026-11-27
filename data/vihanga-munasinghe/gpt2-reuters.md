# vihanga-munasinghe/gpt2-reuters

## Resumen

gpt2-reuters es un modelo de lenguaje causal de tipo GPT-2 entrenado desde cero (pesos inicializados aleatoriamente, sin partir de pesos preentrenados de GPT-2) por el usuario vihanga-munasinghe sobre el corpus `ingeniumacademy/reuters_articles`, una coleccion de teletipos de Reuters de la decada de 1980. Con 18,12 millones de parametros, 6 capas, dimension oculta de 256 y una ventana de contexto de solo 256 tokens, se trata de un modelo de escala muy reducida, concebido como trabajo academico para una asignatura de aprendizaje autosupervisado.

El modelo no pretende competir con LLM de proposito general: su interes reside en que reproduce el estilo, el formato y las convenciones tipograficas del teletipo financiero (titulares en mayusculas, tickers entre corchetes angulares, abreviaturas como "Shr", "Revs" o "vs", y la linea de cierre "Reuter"), aunque sin fiabilidad factual. La mayor parte de sus parametros (unos 13,3 millones) se concentra en la tabla de embeddings de 52.000 entradas por 256 dimensiones, por lo que los bloques transformer son una fraccion menor del total.

Es relevante ahora como ejemplo didactico reproducible de entrenamiento completo de un modelo causal desde cero (tokenizador BPE propio incluido, entrenamiento en una unica T4 de Google Colab en unos 23 minutos) y como referencia para tareas de generacion de texto estilizado o sintetico en dominio financiero historico, no para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT2LMHeadModel (transformer decoder-only, causal) |
| Parametros totales | 18.116.608 (18,12 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`n_positions`) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (mas `config.json` y `generation_config.json`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only clasico al estilo GPT-2 con 6 capas (`n_layer=6`), dimension oculta de 256 (`n_embd=256`), 8 cabezas de atencion (`n_head=8`, por tanto 32 dimensiones por cabeza), dropout de 0,1 en embeddings, atencion y residual, y embeddings de entrada y salida atados (tied). El vocabulario es de 52.000 tokens, generado con un tokenizador BPE a nivel de byte entrenado especificamente sobre este corpus (`ingeniumacademy/gpt2-reuters-tokenizer`, incluido en el repositorio).

El entrenamiento consistio en modelado de lenguaje causal estandar (prediccion del siguiente token) con el `Trainer` de Hugging Face `transformers` (v5.22.1): 5 epocas, lotes de 32 secuencias de 256 tokens, tasa de aprendizaje 5e-4 con schedule coseno y 100 pasos de calentamiento, optimizador AdamW con weight decay 0,1 y recorte de gradiente 1,0, semilla 42. Se ejecuto en una unica NVIDIA Tesla T4 de Google Colab durante aproximadamente 1.390 segundos (23 minutos) y 1.860 pasos. El corpus de entrenamiento ronda los 3 millones de tokens (17.262 articulos de entrenamiento, 2.158 de validacion y 2.158 de test), con cada articulo serializado como `<title>\n<body><|endoftext|>` y concatenado en un unico flujo troceado en bloques fijos de 256 tokens. No se aplico RLHF ni DPO; es aprendizaje autosupervisado puro.

## Capacidades

- Generacion de texto causal autorregresiva en ingles, limitada a continuaciones de hasta 256 tokens en total (prompt mas generacion).
- Reproduccion del estilo y formato del teletipo financiero de Reuters: titulares en mayusculas, tickers entre corchetes angulares (por ejemplo `<AELNA.O>`), abreviaturas de resultados ("Shr", "Revs", "vs", "mln") y linea final "Reuter".
- Continuacion de titulares y cuerpos de noticias a partir de un prompt con el mismo separador usado en entrenamiento (un unico salto de linea entre titulo y cuerpo).
- Generacion con muestreo configurable (`do_sample`, `top_p`, `temperature`) mediante la API estandar de `transformers`.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni otras modalidades.
- Capacidad multilingue practicamente nula: solo ingles y, dentro de el, registro de prensa economica de los anos 80.

## Casos de uso

- Generacion de datos sinteticos de estilo teletipo para pruebas: util para crear fixtures y corpus de prueba con apariencia realista de noticias financieras historicas sin recurrir a datos con derechos, alimentando pipelines de extraccion de entidades o de parseo de teletipos.
- Docencia y practicas de aprendizaje autosupervisado: sirve como ejemplo completo y reproducible de entrenamiento de un LM causal desde cero (tokenizador incluido, hiperparametros documentados, perdidas registradas) para asignaturas de machine learning.
- Pruebas de infraestructura de inferencia ligera: con 18 M de parametros cabe en cualquier GPU consumer e incluso en CPU, por lo que es adecuado para validar integraciones con `transformers`, `text-generation-inference` o endpoints compatibles antes de pasar a modelos mayores.
- Aumento de datos para clasificadores de noticias financieras: se pueden generar variantes estilisticas de titulares para aumentar la robustez de modelos de clasificacion o de reconocimiento de entidades en dominios de prensa economica.
- Experimentos de analisis estilistico y de formato: permite estudiar como un modelo pequeño aprende convenciones tipograficas (separadores, abreviaturas, estructura titular-cuerpo) y como el separador del prompt afecta a la tokenizacion y a la salida.
- Demostraciones educativas de las limitaciones de los LM pequeños: sirve para ilustrar en clase la diferencia entre fluidez de forma y fidelidad de contenido, y el impacto del tamano del corpus y del contexto en la coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta perdida y perplejidad sobre los splits del corpus:

| Split | Loss | Perplejidad |
|---|---|---|
| Entrenamiento (ultimo registro) | 4,03 | 56,2 |
| Validacion | 4,382 | 80,0 |
| Test | 4,167 | 64,5 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (18,12 M de parametros en fp32 ocupan unos 72 MB de pesos; el repositorio completo pesa 0,1 GB). Cabe holgadamente en cualquier GPU consumer, en GPUs integradas e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; el autor entreno en una NVIDIA Tesla T4. Para inferencia no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier modelo (RTX 4090, RTX 3060, GTX 1650, etc.) y tambien en CPU.
- Opciones de despliegue: `transformers` (via `GPT2LMHeadModel`), `text-generation-inference` (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), y conversion a GGUF para `llama.cpp` u `Ollama` (no documentada por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por token en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt2-reuters | 18,12 M | 256 tokens | Desde cero, corpus Reuters (~3 M tokens) | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | Preentrenado en WebText | MIT (pesos publicados) | Hugging Face |
| DistilGPT-2 | 82 M | 1.024 tokens | Destilado de GPT-2 | Apache 2.0 | Hugging Face |
| GPT-2 small fine-tuneado en Reuters | no disponible | 1.024 tokens | Preentrenado + ajuste en dominio | segun el autor | variable |

La comparacion directa con GPT-2 small o DistilGPT-2 no es homogenea: aquellos parten de preentrenamiento a gran escala y tienen contexto cuatro veces mayor, mientras que gpt2-reuters esta entrenado exclusivamente sobre un corpus de ~3 M tokens. No se dispone de benchmarks comunes que permitan comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Corpus muy pequeño (~3 M tokens) y modelo muy pequeño (18 M de parametros): aprende estilo y formato mucho mejor que hechos o significado.
- Salida fluida en forma pero no fiable en contenido: cifras, nombres y eventos son inventados, a menudo inconsistentes o repetitivos. No debe usarse como fuente de datos sobre empresas o mercados.
- Dominio y epoca restringidos: teletipo de los anos 80, con abreviaturas, titulares en mayusculas y tickers; prompts alejados de ese estilo (por ejemplo texto literario) producen resultados pobres.
- Ventana de contexto de solo 256 tokens, que incluye el prompt y el texto generado.
- Sensibilidad al separador: el modelo fue entrenado con un unico salto de linea entre titulo y cuerpo; otros separadores caen fuera de la distribucion de entrenamiento.
- Sesgos: no documentados por el autor; al entrenar sobre prensa financiera de los 80 es probable que reproduzca sesgos de representacion y de lenguaje de esa fuente, pero no hay evaluacion publicada.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier uso en produccion.
- El propio autor declara que el modelo es para estudio y no para uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vihanga-munasinghe/gpt2-reuters
- Dataset de entrenamiento: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: `ingeniumacademy/gpt2-reuters-tokenizer` (incluido en el repositorio del modelo)
- Paper, blog o demo: no disponible

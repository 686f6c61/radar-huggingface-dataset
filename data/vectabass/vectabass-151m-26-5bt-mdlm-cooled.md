# VectaBass/vectabass-151m-26.5bt-mdlm-cooled

## Resumen

vectabass-151m-26.5bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, *masked diffusion language model*) de 151,5 millones de parámetros totales (100,0 millones sin contar embeddings) entrenado desde cero sobre 26.465 millones de tokens por el autor independiente VectaBass. Forma parte de la "MDLM square" de fase 1: una escalera de modelos de 100M a 1.600M de parámetros no-embedding, cada talla entrenada con varios presupuestos de tokens y publicada en conjunto para poder verificar empíricamente las leyes de escala de este objetivo de difusión frente a una escalera autorregresiva (AR) equivalente entrenada con los mismos datos.

La arquitectura es un transformer tipo Llama con atención bidireccional, GQA 2:1 y atención autoexclusiva (XSA), adaptado al objetivo de difusión: el modelo predice, en cada posición, la distribución del token limpio dado un contexto con tokens enmascarados (id de máscara 50283). La generación se realiza mediante `diffusion_generate`, que rellena `gen_length` máscaras a lo largo de `steps` pasadas hacia delante. El contexto está limitado a 2.048 posiciones (RoPE base 10000).

El interés del modelo es fundamentalmente de investigación: es un *base model* sin ajuste de instrucciones ni de seguridad, con licencia Apache 2.0, publicado con réplicas de semilla en la rama `seed2` para medir el ruido entre ejecuciones. Su relevancia radica en que permite estudiar el escalado de los modelos de difusión enmascarada con datos abiertos y con foco explícito en fuentes del sector público británico y lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) junto con el inglés y el escocés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama bidireccional con atención autoexclusiva (XSA), GQA 2:1, RMSNorm pre-norm, SwiGLU, RoPE base 10000 |
| Parámetros totales | 151.505.920 (151.486.464 según model card, embeddings atados) |
| Parámetros activos | No aplica (no es MoE) |
| Parámetros sin embeddings | 99.975.168 (100,0M) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible (entrenado y recomendado en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,6 GB), con código personalizado `modeling_vectabass.py` |
| Anchura / capas | 1.024 / 9 |
| Cabezas | 16 query, 8 key-value, dimensión 64 |
| Feed-forward | SwiGLU, dimensión 2.592 |
| Vocabulario | 50.304 filas: BPE de GPT-2 (50.257) + 26 tokens especiales + padding |
| Token de máscara | id 50283 |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo reutiliza la pila de los modelos AR del mismo autor (estilo Llama) pero la hace bidireccional y la entrena con el objetivo MDLM: un proceso de difusión con `alpha_t = 1 - t` lineal cuya pérdida es el ELBO negativo en tiempo continuo, es decir, una entropía cruzada enmascarada ponderada por `1/t` sobre todas las posiciones. La atención es bidireccional con GQA 2:1 y atención autoexclusiva (XSA), lo que permite que cada posición atienda a todo el contexto no enmascarado en lugar de solo al pasado. La salida `model(ids).logits` proporciona, en cada posición, la distribución del token limpio; para generar se colocan máscaras (id 50283) en las posiciones desconocidas y se van rellenando iterativamente.

El entrenamiento consumió 26.465.009.664 tokens (265 tokens por parámetro no-embedding) con un batch de 524.288 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW fp32 (betas 0.9/0.95), LR pico de 0,00173, warmup de 100M tokens y un *cooldown* de tipo `1-sqrt` hasta cero en el último 20 % del entrenamiento. El weight decay es de 0,135 sobre matrices. Los pesos y activaciones se entrenaron en bf16 con pesos maestros fp32 en el optimizador, y estadísticas de norma, ángulos RoPE y logits en fp32. Todo el entrenamiento se ejecutó en una única NVIDIA GH200 de 120 GB. Los datos provienen de la "vista de fase 1": 47 bins de texto con licencia abierta, unos 96.000 millones de tokens únicos, incluyendo fuentes del sector público y parlamentario británico y de lenguas celtas, además de fineweb-edu, fineweb-2 y finemath; el desglose por bin, cuota y licencia está en `DATA.md`.

## Capacidades

- Modelado de lenguaje y *feature extraction*: el pipeline declarado es feature-extraction; `model(ids).logits` devuelve distribuciones de token limpio por posición.
- Generación de texto por difusión enmascarada mediante `diffusion_generate`, con órdenes de desenmascarado `random` (el proceso inverso para el que fue entrenado) y `confidence` (estilo MaskGIT, comprometiendo primero las posiciones más seguras).
- Relleno condicionado de huecos: al colocar el token de máscara en posiciones concretas, el modelo predice el token limpio en esas posiciones, lo que habilita tareas de infilling no autorregresivo.
- Multilingüismo limitado a siete idiomas: inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de *tool calling*, *function calling*, soporte de agentes, modo *thinking*, visión ni audio: es un modelo base sin ajuste de instrucciones.
- No se documentan capacidades específicas de razonamiento, código o matemáticas más allá de lo que pueda emerger del corpus de entrenamiento (fineweb-edu, fineweb-2, finemath).

## Casos de uso

- Investigación sobre leyes de escala en difusión: el modelo es una celda (N1-D3) de una escalera de 100M a 1.600M de parámetros no-embedding con varios presupuestos de tokens; se usa para ajustar y validar curvas de escalado comparándolo con la escalera AR equivalente publicada por separado.
- Medición de ruido entre ejecuciones: la rama `seed2` contiene réplicas con nueva inicialización y orden de datos, lo que permite estimar la varianza run-to-run de una receta concreta cargando `revision="seed2"`.
- Estudio de samplers para modelos de difusión: la model card documenta la comparación de unos 30 samplers sobre 32 inicios de documento retenidos, con métricas de bits por byte UTF-8 (evaluadas con Qwen3-8B-Base), bigramas distintos y 4-gramas repetidos; el modelo sirve como banco de pruebas reproducible de estas técnicas.
- Relleno de texto (infilling) en documentos: al enmascarar posiciones desconocidas y ejecutar `diffusion_generate`, puede completar huecos en pasajes de forma bidireccional, aprovechando contexto a izquierda y derecha dentro de la ventana de 2.048 tokens.
- Procesamiento de lenguas celtas de bajos recursos: el corpus incluye fuentes en galés, gaélico escocés, irlandés, manés, córnico y escocés, lo que permite experimentos de modelado y extracción de características en estos idiomas con un modelo Apache 2.0.
- Extracción de características para clasificación o clustering: con pipeline feature-extraction y 9 capas de anchura 1.024, puede emplearse como extractor de representaciones contextuales en pipelines de NLP ligeros que quepan en una sola GPU.
- Docencia y reproducibilidad: al ser un modelo pequeño (0,6 GB de repo) entrenado en una sola GH200 con receta y datos documentados, es adecuado para replicar experimentos de difusión enmascarada en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación publicada es el ELBO negativo sobre el canon retenido de fase 1 (`canon-8192`, 8.192 secuencias de 2.048 tokens, 16 extracciones de máscara por secuencia): **2,7753 ± 0,0025 nats por token** (± un error estándar). El ELBO negativo es una cota superior de la log-verosimilitud negativa, por lo que solo es comparable con la entropía cruzada de un modelo AR sobre el mismo canon como cota, no como medida equivalente.

Métricas de calidad de muestreo (celda N6-D5, 32 inicios retenidos, prompt de 32 tokens, 256 generados, una semilla):

| Sampler | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7 % |
| confidence, argmax, penalización de presencia 4 (incl. prompt) | 0,64 | 0,74 | 18 % |
| Igual, sin penalización | 0,15 | 0,16 | 80 % |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22 % |

El error estándar de bits por byte es de aproximadamente 0,06 con una semilla y 32 prompts.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,3 GB para los pesos (151,5M parámetros × 2 bytes), más activaciones y caché; cómodo en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna con soporte bf16; el entrenamiento se realizó en una NVIDIA GH200 de 120 GB, pero la inferencia cabe en RTX 3060/4060, RTX 4090, A100 o H100 sin problema.
- Cabe holgadamente en GPU consumer; también es viable en CPU para pruebas puntuales, aunque el bucle de `steps` pasadas hacia delante penaliza la latencia.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (carga `modeling_vectabass.py` del repo). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el código personalizado y la generación por difusión hacen improbable el soporte directo en esos motores sin adaptación.
- Latencia y throughput: no disponibles. Nótese que la configuración recomendada usa `steps = gen_length` (un token por paso), por lo que generar 256 tokens requiere 256 pasadas hacia delante; usar 4 tokens por paso degrada la calidad (0,73 bits por byte, bigramas distintos 0,49).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-151m-26.5bt-mdlm-cooled | 151,5M totales (100,0M no-embedding) | 2.048 | Difusión enmascarada (MDLM) | Apache 2.0 | HuggingFace, 4 descargas |
| Escalera AR equivalente del mismo autor | 100M–1.600M no-embedding | No disponible | Autorregresivo | No disponible en la información | Publicada por separado según la model card |
| Modelos AR de talla similar (p. ej. GPT-2 small, 124M) | ~124M | 1.024 | Autorregresivo | Según variante | Amplia |

La model card indica que el muestreo ancestral exacto de este MDLM es "mucho menos fluido" que su modelo AR de la misma talla, y que el sampler recomendado (confidence con penalización 4) alcanza 0,64 bits por byte frente a 0,66 del texto real en la celda N6-D5. No se proporcionan comparaciones numéricas directas con modelos de terceros.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni de seguridad; no debe usarse como asistente conversacional sin ajuste posterior.
- "Los hechos suelen ser erróneos" según la propia model card; alta propensión a alucinación factual.
- El sampler recomendado es una heurística, no un muestreo exacto: sesga contra palabras repetidas y las listas siguen repitiéndose; tablas, listas y código (donde la repetición es correcta) no fueron evaluados.
- Sin penalización de presencia, el orden por confianza entra en bucles; con penalización 3 aún repite y con 6 pierde fluidez respecto al texto real.
- El muestreo ancestral exacto es mucho menos fluido que el modelo AR equivalente; temperatura, top-k, top-p y min-p no alcanzan la fluidez del texto real.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a siete idiomas (inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés); el español no figura entre ellos.
- Generación lenta por diseño: un token por paso implica `gen_length` pasadas hacia delante.
- Las métricas de muestreo se basan en una sola semilla y 32 prompts (error estándar ~0,06 bits por byte), por lo que son orientativas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigación sin garantías de calidad, su uso en producción requiere validación propia; no se documentan sesgos específicos más allá de los inherentes al corpus (fuentes del sector público británico y web educativa filtrada).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-151m-26.5bt-mdlm-cooled
- Réplicas de semilla: rama `seed2` del mismo repositorio (`revision="seed2"`)
- Código de modelado personalizado: `modeling_vectabass.py` dentro del repositorio
- Documentación de datos: `DATA.md` dentro del repositorio
- Datasets referenciados: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/HuggingFaceFW/fineweb-2, https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper, blog o demo: no disponibles en la información proporcionada

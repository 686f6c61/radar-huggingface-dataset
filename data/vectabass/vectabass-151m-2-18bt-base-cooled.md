# VectaBass/vectabass-151m-2.18bt-base-cooled

## Resumen

vectabass-151m-2.18bt-base-cooled es un modelo de lenguaje base de 151 millones de parámetros totales (100 millones no correspondientes a embeddings) desarrollado por VectaBass, entrenado sobre 2.180 millones de tokens. Forma parte de la "celda N1-D2" del "cuadrado AR" de la fase 1 del proyecto: una escalera de modelos que va de 100M a 1.600M de parámetros no-embedding, cada tamano entrenado con varios presupuestos de tokens y publicado en conjunto para que la ley de escalado pueda verificarse de forma independiente. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors para la libreria transformers.

La arquitectura es de tipo transformer causal con atención de grupo (GQA 2:1) y una innovación propia denominada atención autoexclusiva (XSA), que no existe en Llama. El contexto es de 2.048 tokens y el vocabulario emplea BPE de GPT-2 con 50.304 filas. El entrenamiento se realizo en una única GPU NVIDIA GH200 de 120 GB, con el optimizador Muon para matrices ocultas y AdamW en fp32 para el resto, en precision bf16.

Su relevancia es fundamentalmente metodologica: no es un modelo pensado para uso asistencial, sino un punto de datos reproducible para estudiar leyes de escalado, con réplicas de semilla en las ramas `seed2` y `seed3` para medir el ruido entre ejecuciones. Incluye fuentes de texto del sector público británico, parlamentarias y de lenguas celtas, lo que lo vincula al programa de IA soberana del Reino Unido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, Llama-like con atención autoexclusiva (XSA), GQA 2:1, pre-norm RMSNorm, SwiGLU, RoPE |
| Parametros totales | 151.505.920 (151.486.464 segun model card; embeddings atados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros no-embedding | 99.975.168 |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (entrenado y publicado en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (mayoritario), gales (cy), gaélico escoces (gd), irlandes (ga), manes (gv), cornualles (kw), escoces (sco) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB) |
| Anchura / capas | 1.024 / 9 |
| Cabezas | 16 query, 8 key-value, dimension 64 |
| Feed-forward | SwiGLU, 2.592 |
| Vocabulario | 50.304 filas: BPE GPT-2 (50.257) + 26 tokens especiales + padding |
| Tokens de entrenamiento | 2.182.610.944 (22 por parametro no-embedding) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal con 9 capas de anchura 1.024, atención de grupo con ratio 2:1 (16 cabezas de consulta y 8 de clave-valor de dimensión 64) y atención autoexclusiva (XSA), una variante propietaria que requiere cargar `modeling_vectabass.py` mediante `trust_remote_code`. Emplea RMSNorm en configuración pre-norm, activación SwiGLU con dimensión intermedia 2.592 y embeddings de posición rotatorios (RoPE) con base 10.000. Los embeddings de entrada y salida están atados, lo que explica la diferencia entre los 151M totales y los 100M no-embedding.

El entrenamiento consumió 2.182.610.944 tokens con un tamano de lote de 262.144 tokens, usando Muon (con normalización espectral NS 5, escalado RMS Moonlight de 0,2 y momento 0,95) para las matrices ocultas y AdamW fp32 (betas 0,9 y 0,95) para el resto. La tasa de aprendizaje máxima fue 0,00243, con 100M de tokens de calentamiento, fase constante y un decaimiento "1-sqrt" hasta cero en el último 20% del entrenamiento. El weight decay fue de 0,105 sobre matrices. Los pesos y activaciones se mantuvieron en bf16 con pesos maestros en fp32 en el optimizador, y estadísticas de normalización, ángulos RoPE y logits en fp32. Todo el entrenamiento se ejecutó en una sola NVIDIA GH200 de 120 GB, presumiblemente con FlashAttention-4.

Los datos provienen de la vista de la fase 1: 47 bins de texto con licencia abierta, unos 96.000 millones de tokens únicos, con fuentes de `HuggingFaceFW/fineweb-edu`, `HuggingFaceFW/fineweb-2` y `HuggingFaceTB/finemath`, e incorporación de fuentes del sector público británico, parlamentarias y de lenguas celtas. La pérdida de validación sobre el canon retenido (canon-8192, 8.192 secuencias de 2.048 tokens) es de 2,5268 nats por token, y los pesos del repositorio reproducen los logits del código de entrenamiento de forma bit a bit bajo PyTorch SDPA.

## Capacidades

- Generación de texto autoregresiva en inglés y, en menor medida, en lenguas celtas (galés, gaélico escocés, irlandés, manés, cornuallés) y escocés.
- Modelo base sin ajuste por instrucciones: completa texto y responde a continuación de contexto, pero no sigue instrucciones de forma fiable.
- Razonamiento de sentido común y conocimiento factual de nivel bajo, coherente con su escala (100M no-embedding).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenadas.
- No dispone de visión, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingüe limitada a los siete idiomas listados, con el inglés claramente dominante.
- Útil como modelo de referencia para experimentos de escalado y para estudiar el comportamiento de XSA frente a atención estándar.

## Casos de uso

- Investigación sobre leyes de escalado: el modelo es una celda de un cuadrado AR con réplicas de semilla (`seed2`, `seed3`), lo que permite medir el ruido entre ejecuciones y ajustar curvas de pérdida frente a tokens y parámetros con puntos reproducibles.
- Estudio de arquitecturas de atención: al incorporar XSA, sirve para comparar empíricamente su comportamiento frente a atención causal estándar con GQA en el mismo régimen de datos y presupuesto de cómputo.
- Prototipado rápido en CPU o GPU de gama baja: con 151M de parámetros y 0,9 GB de pesos en bf16, se puede cargar y ejecutar en entornos con recursos muy limitados para pruebas de pipelines de `transformers`.
- Evaluación de técnicas de decodificación y muestreo: su tamano reducido permite barrer hiperparámetros de generación (temperatura, top-p, penalizaciones) con muchas repeticiones a bajo coste.
- Investigación sobre lenguas celtas de bajo recurso: el modelo incluye galés, gaélico escocés, irlandés, manés, cornuallés y escocés, lo que permite estudiar la calidad de modelado en estas lenguas a escala pequena.
- Docencia y formación: útil para explicar el funcionamiento interno de un transformer causal (9 capas, 1.024 de anchura) con pesos abiertos y reproducibilidad bit a bit documentada.
- Base para fine-tuning ligero: al ser un modelo base con licencia Apache 2.0, puede servir de punto de partida para ajustes específicos de dominio en tareas de clasificación o generación acotada.

## Benchmarks y rendimiento

Evaluación zero-shot con 500 elementos por tarea (barajado con semilla 0, protocolo hub-v1). Las tareas de elección múltiple puntúan log P(continuación | contexto) con precisión normalizada donde está definida.

| Tarea | Resultado |
|---|---|
| ARC-Easy | 0,436 |
| ARC-Challenge | 0,220 |
| HellaSwag | 0,280 |
| PIQA | 0,614 |
| WinoGrande | 0,508 |
| BoolQ | 0,604 |
| MMLU | 0,238 |
| LAMBADA | 0,252 |
| DQRB (propia) | 0,533 |
| LAMBADA bits per byte | 1,363 |
| Pérdida de validación (canon-8192) | 2,5268 nats/token |

No se han publicado en la información disponible resultados comparativos con otros modelos en estas mismas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,3 GB de pesos (151M parámetros × 2 bytes) más activaciones y caché KV; en la práctica, menos de 1 GB para contextos de 2.048 tokens.
- VRAM estimada en fp32: aproximadamente 0,6 GB de pesos.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; el entrenamiento se realizo en una NVIDIA GH200 de 120 GB, pero la inferencia cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con 4 GB o más; también en CPU con un rendimiento aceptable para generación de texto corta.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `modeling_vectabass.py`). No se documenta soporte oficial en vLLM, llama.cpp, Ollama o TGI; la naturaleza custom de XSA probablemente requiera portar el código de modelado antes de usar estos motores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-151m-2.18bt-base-cooled | 151M (100M no-embedding) | 2.048 | Apache 2.0 | Base, XSA, enfoque en leyes de escalado y lenguas celtas |
| GPT-2 small | 124M | 1.024 | MIT | Base, atención estándar, solo inglés |
| Pythia-160M | 160M | 2.048 | Apache 2.0 | Base, suite de escalado con checkpoints intermedios |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Base, entrenado con muchos más tokens (aprox. 600B) |

La comparación de rendimiento frente a estas alternativas no está disponible en la información proporcionada; los benchmarks publicados del modelo no incluyen referencias cruzadas con GPT-2 small, Pythia-160M ni SmolLM-135M bajo el mismo protocolo.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: puede afirmar cosas falsas con fluidez y no sigue instrucciones de forma fiable.
- Sin ajuste de seguridad ni filtrado de salidas; no debe desplegarse en producción orientada a usuarios sin capas adicionales de moderación.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística desequilibrada: el inglés domina claramente; las lenguas celtas aparecen en proporciones menores y su calidad no está cuantificada en la información disponible.
- Riesgo de alucinación elevado por escala y por ausencia de ajuste por instrucciones.
- Requiere `trust_remote_code=True` para cargar `modeling_vectabass.py`, lo que implica ejecutar código del repositorio; conviene auditar el archivo antes de usarlo en entornos sensibles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado ni validado para ello; no hay garantías de calidad ni de seguridad.
- No se documentan sesgos específicos medidos; cabe esperar los sesgos presentes en los corpus de fineweb y fineweb-2.
- El soporte en motores de inferencia de alto rendimiento (vLLM, llama.cpp, TGI) no está documentado y puede requerir trabajo de portabilidad debido a XSA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-151m-2.18bt-base-cooled
- Repositorio de datos de referencia: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio de datos multilingüe: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Repositorio de datos matemáticos: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Referencia sobre Isambard-AI: https://doi.org/10.48550/arXiv.2410.11199
- Paper del modelo: no disponible (anunciado como "forthcoming" en la model card)

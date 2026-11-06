# sx58/anekdot-gpt

## Resumen

anekdot-gpt es un modelo de lenguaje de tipo GPT entrenado desde cero por el usuario sx58, sin fase de preentrenamiento sobre corpus generales, siguiendo la arquitectura didáctica de Karpathy (estilo nanoGPT y «Let's build GPT»). Su único dominio es la generación de chistes cortos en ruso: se ha entrenado sobre aproximadamente 109 000 anécdotas extraídas de anekdot.ru, con un tokenizador BPE byte-level propio de 4353 entradas y un marcador especial `<|anek|>` como separador de chistes.

El modelo es deliberadamente pequeño: 15,9 millones de parámetros, 8 capas, dimensión de embedding 384, 6 cabezas de atención y una ventana de contexto de solo 256 tokens. No es un modelo de propósito general ni compite con LLM actuales; su interés es formativo y de investigación reproducible, ya que permite estudiar el comportamiento de un transformer entrenado de forma aislada sobre un corpus muy específico y con recursos mínimos.

Es relevante ahora como ejemplo de modelo de nicho entrenado de principio a fin, con métricas publicadas de forma transparente (val loss de 3,308 en cross-entropy de siguiente token, perplejidad aproximada de 27) y con limitaciones declaradas explícitamente por el autor. No es compatible con la librería `transformers` de forma directa y requiere cargar una clase propia incluida en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (nanoGPT / Karpathy), 8 capas, 6 cabezas, n_embd 384, GELU, bias-free, weight tying, flash SDPA |
| Parametros totales | 15,9 M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens (block_size) |
| Tipos de cuantizacion | No disponible (solo pesos PyTorch en fp32 según el checkpoint publicado) |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 (según model card; el autor indica que cubre el código, con datos provenientes del archivo público de anekdot.ru) |
| Formato de pesos | Checkpoint PyTorch (`anekdot_v2.pt`), no safetensors ni GGUF; config embebida en `model_config` |
| Vocabulario | 4353 tokens (BPE byte-level propio), `<|anek|>` = id 256 |
| Dropout | 0,2 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only clásico de tipo GPT, con 8 bloques, 6 cabezas de atención, dimensión de embedding de 384 y normalización previa a la atención y al MLP. Incorpora atención con `scaled_dot_product_attention` (flash SDPA), activación GELU, capas sin bias, weight tying entre la embedding de entrada y la proyección de salida, e inicialización al estilo nanoGPT. El tokenizador es un BPE byte-level propio con 4353 entradas y un token especial `<|anek|>` que actúa como separador entre chistes y como token de parada en la generación.

El entrenamiento se realizó desde cero, sin preentrenamiento, sobre aproximadamente 109 000 anécdotas de anekdot.ru filtradas con criterios explícitos: al menos 30 votos, al menos 75 % de aprobación de los lectores, longitud entre 20 y 1500 caracteres, normalización y deduplicación, y partición 90/10 por chiste. El autor indica que el modelo vio unos 6 millones de tokens únicos y se entrenó durante 40 000 pasos, alcanzando la mejor pérdida de validación (3,308) en el paso 38 750. No se menciona RLHF, DPO ni ajuste por instrucciones; es un modelo puramente autorregresivo de siguiente token.

## Capacidades

- Generación de texto autorregresiva en ruso, especializada en chistes cortos con estructura de anécdota (planteamiento y remate).
- Continuación de un prompt breve (por ejemplo, el inicio de un diálogo «— Доктор, …») con una longitud controlable mediante `max_new_tokens`.
- Generación condicionada por temperatura y `top_k`; el autor recomienda temperatura ≤ 0,8 para mayor coherencia.
- Uso del token `<|anek|>` como delimitador para generar varias anécdotas encadenadas y para detener la generación.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso, agentes ni modo «thinking».
- No tiene capacidades multimodales (sin visión ni audio).
- Multilingüismo: únicamente ruso; no se ha entrenado con otros idiomas.

## Casos de uso

- Generación de chistes sintéticos para experimentación: el modelo produce anécdotas cortas en ruso a partir de un prompt mínimo, útil para estudiar la estructura del humor textual en un corpus controlado.
- Docencia y reproducción de nanoGPT: sirve como ejemplo completo de pipeline (tokenizador, dataset, entrenamiento, checkpoint y script de inferencia) para cursos de introducción a transformers.
- Investigación sobre modelos de dominio estrecho: permite analizar cómo se comporta un transformer pequeño cuando el corpus es homogéneo y de un solo género textual, con métricas de perplejidad publicadas.
- Aumentación de datos para clasificadores de humor: las anécdotas generadas pueden usarse como ejemplos sintéticos etiquetados para entrenar o evaluar modelos de detección de chistes.
- Pruebas de infraestructura de inferencia en CPU: con 15,9 M de parámetros y contexto de 256 tokens, el modelo se ejecuta en CPU sin GPU, lo que facilita pruebas de integración en entornos sin acelerador.
- Generación de contenido de relleno para demos y prototipos de interfaces conversacionales en ruso, siempre que el texto se marque como sintético y no se publique como humor de calidad.
- Estudio de sesgos y toxicidad en corpus de humor: el modelo reproduce el registro y los temas del archivo de anekdot.ru, lo que permite analizar qué tipo de chistes aprende y reproduce.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Val loss (cross-entropy de siguiente token) | 3,308 (mejor paso 38 750 de 40 000) |
| Perplejidad | Aproximadamente 27 |
| Tamano del vocabulario | 4353 |
| Contexto | 256 tokens |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son la pérdida de validación y la perplejidad derivada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (15,9 M de parámetros, unos 64 MB de pesos); cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con memoria compartida.
- GPU recomendadas: no se requiere GPU; cualquier GPU con soporte CUDA es suficiente. Para entrenamiento desde cero, una GPU consumer moderna (RTX 3060 o superior) basta para este tamaño y contexto.
- Cabe en GPU consumer: sí, en todas las gamas actuales y en muchas integradas.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma nativa, porque usa una clase propia (`GPTLanguageModelV2`) y un tokenizador propio. El despliegue se realiza cargando el checkpoint con PyTorch y el código del repositorio (`model.py`, `tokenizer.py`).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo y el contexto de 256 tokens, se espera una latencia muy baja en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| anekdot-gpt (sx58) | 15,9 M | 256 tokens | Ruso | Apache 2.0 | Checkpoint PyTorch propio | Entrenado desde cero solo con anécdotas; sin benchmarks estándar |
| nanoGPT (Karpathy) | Configurable (por defecto ~124 M en el ejemplo Shakespeare) | Configurable (por defecto 1024) | Inglés en el ejemplo | MIT | Checkpoint PyTorch | Referencia arquitectónica; no es un modelo de chistes en ruso |
| GPT-2 small | 124 M | 1024 tokens | Inglés | MIT | Safetensors / PyTorch | Modelo preentrenado generalista; no especializado en humor ruso |
| rugpt3-small | 125 M | 1024 tokens | Ruso | Apache 2.0 (según repositorio) | Safetensors / PyTorch | Preentrenado en ruso general; mucho mayor y con contexto mayor |

La comparación es únicamente estructural: anekdot-gpt es dos órdenes de magnitud menor que GPT-2 small o rugpt3-small y no se ha evaluado con benchmarks comparables, por lo que no es posible establecer una comparación de rendimiento con datos publicados.

## Limitaciones y advertencias

- Modelo muy pequeño (15,9 M de parámetros) entrenado con unos 6 millones de tokens únicos: el autor reconoce que el texto es localmente coherente pero globalmente incoherente; es «verosimilitud de anécdota», no humor humano.
- El muestreo con temperatura ≤ 0,8 produce resultados notablemente más coherentes; el muestreo codicioso tiende a entrar en bucles.
- Puede generar lenguaje soez, contenido absurdo o chistes ofensivos, porque el corpus de origen los contiene.
- Contexto limitado a 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Solo ruso; no se ha entrenado en otros idiomas y no se espera transferencia.
- No compatible con `transformers`, vLLM, TGI ni llama.cpp; requiere el código del repositorio y un tokenizador propio.
- Riesgo de alucinación y de reproducción literal de fragmentos del corpus de entrenamiento; no debe usarse como fuente factual.
- La licencia Apache 2.0 se declara sobre el código; los datos provienen de anekdot.ru y el autor no aclara los términos de uso comercial del contenido generado a partir de ellos.
- No se han publicado evaluaciones de sesgos, toxicidad ni seguridad; el uso en producción requeriría filtros adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sx58/anekdot-gpt
- Corpus de origen: https://www.anekdot.ru/
- Referencia arquitectónica nanoGPT (Karpathy): https://github.com/karpathy/nanoGPT
- Vídeo «Let's build GPT» (Karpathy): https://www.youtube.com/watch?v=kCc8FmEb1nY
- Repositorio citado por el autor para las clases `model.py` y `tokenizer.py` (russian-hokku): no disponible como enlace directo en la información proporcionada

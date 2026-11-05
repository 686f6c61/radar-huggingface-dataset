# VectaBass/vectabass-1.03b-2.18bt-base-cooled

## Resumen

vectabass-1.03b-2.18bt-base-cooled es un modelo de lenguaje base de 1.028.893.312 parámetros totales (919.351.296 no pertenecientes a embeddings) desarrollado por VectaBass. Forma parte de la "Phase 1 AR square", una escalera de modelos de entre 100M y 1.6B de parámetros no-embedding, donde cada tamaño se entrena con varios presupuestos de tokens y se publica en conjunto para poder verificar empíricamente las leyes de escalado. Esta celda concreta corresponde al paper cell N5-D2 y fue entrenada con 2.182.742.016 tokens, es decir, 2 tokens por parámetro no-embedding.

La arquitectura es de tipo transformer causal con atención exclusiva auto-atencion (XSA), una variante que el autor describe como "Llama-like" pero con una modificación propia que Llama no incorpora, y que requiere cargar código remoto (`modeling_vectabass.py`). El contexto es de 2048 tokens, una ventana corta para los estándares actuales, y el vocabulario emplea GPT-2 BPE (50.257 tokens) más 26 tokens especiales.

El modelo es relevante por su carácter de herramienta de investigación: no es un asistente, sino una pieza de un estudio de scaling laws con foco en soberanía de IA del Reino Unido, con datos que incluyen fuentes parlamentarias y de sector público británico, además de lenguas celtas (galés, gaélico escocés, irlandés, manés, córnico) y escocés. Su licencia Apache 2.0 y su tamaño contenido lo hacen accesible para experimentación en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con atención exclusiva auto-atencion (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE base 10000 |
| Parametros totales | 1.028.893.312 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (el autor indica ejecutar en bf16 tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

Datos arquitectónicos adicionales: anchura 2176, 18 capas, 34 cabezas de consulta y 17 de clave-valor con dimensión 64, feed-forward SwiGLU de 5648, vocabulario de 50.304 filas (GPT-2 BPE 50.257 más 26 especiales y relleno), embeddings atados.

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 18 capas y anchura 2176. La innovación técnica destacable es la atención exclusiva auto-atencion (XSA), que se suma a la atención causal con GQA en proporción 2:1 (34 cabezas de consulta frente a 17 de clave-valor, dimensión 64). El feed-forward es SwiGLU con dimensión 5648 y la normalización es RMSNorm en configuración pre-norm. Las posiciones se codifican con RoPE de base 10000. Los embeddings de entrada y salida están atados, lo que explica la diferencia entre parámetros totales y no-embedding.

El entrenamiento usó 2.182.742.016 tokens con un batch de 458.752 tokens. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) con AdamW en fp32 (betas 0.9 y 0.95) para el resto. El pico de learning rate fue 0.00125, con un warmup de 437M tokens, seguido de una fase constante y un cooldown 1-sqrt hasta cero en el último 20% del entrenamiento. El weight decay fue 0.0507 sobre matrices. La precisión fue bf16 en pesos y activaciones, con pesos maestros en fp32 en el optimizador y estadísticas de normalización, ángulos RoPE y logits en fp32. El hardware fueron 4 GPU NVIDIA GH200 de 120 GB.

Los datos provienen de la "phase-1-release view": 47 bins de texto con licencia abierta, unos 96B de tokens únicos, con fuentes de sector público y parlamentario del Reino Unido y de lenguas celtas. Los datasets declarados son HuggingFaceFW/fineweb-edu, HuggingFaceFW/fineweb-2 y HuggingFaceTB/finemath. El archivo `DATA.md` del repositorio detalla cada bin, su proporción y su licencia. No se menciona RLHF ni DPO; es un modelo exclusivamente preentrenado.

## Capacidades

- Generación de texto autoregresiva en modo base (continuación de texto, no instrucciones).
- Modelado de lenguaje y razonamiento de siguiente token; no hay modo "thinking" ni capacidades de razonamiento explícito.
- Capacidades multilingües limitadas a inglés (mayoritario), galés, gaélico escocés, irlandés, manés, córnico y escocés, con proporciones menores para las lenguas celtas.
- No soporta tool calling ni function calling de forma nativa (no hay instrucción ni plantilla de chat).
- No soporta agentes ni razonamiento multi-paso de forma fiable al no estar instruido.
- Sin capacidades de visión, audio ni modalidades adicionales.
- Útil como modelo de referencia para estudiar leyes de escalado y para fine-tuning posterior.

## Casos de uso

- Investigación en scaling laws: el modelo es una celda de una matriz experimental; se usa para medir la pérdida de validación frente al presupuesto de tokens y parámetros y contrastar la ley de escalado empíricamente. Es adecuado porque su configuración de entrenamiento está documentada con precisión (tokens, batch, LR, optimizador).
- Fine-tuning para lenguas celtas: al incluir galés, gaélico escocés, irlandés, manés, córnico y escocés en el preentrenamiento, sirve como punto de partida para ajustar tareas de generación o clasificación en esas lenguas con datasets pequeños.
- Generación de texto de dominio público británico: con fuentes parlamentarias y de sector público en los datos, puede emplearse para tareas de continuación o resumen sobre textos administrativos tras un ajuste supervisado.
- Experimentación académica con atención XSA: investigadores que quieran comparar la atención exclusiva frente a atención estándar pueden usar los pesos como referencia reproducible (los logits reproducen bit a bit los del código de entrenamiento bajo SDPA).
- Prototipado de pipelines de generación en hardware de consumo: con ~1B parámetros y 2.1 GB de pesos en bf16, cabe en GPU de gama alta de consumo y permite iterar rápidamente en experimentos de preentrenamiento o fine-tuning.
- Base para estudios de destilación o poda: su tamaño intermedio (1B) y su documentación de procedencia lo hacen útil como modelo profesor o alumno en experimentos de compresión.
- Evaluación de sesgos y seguridad en modelos base: al no tener ajuste de seguridad, sirve para estudiar comportamientos no filtrados en entornos controlados de investigación.

## Benchmarks y rendimiento

El autor indica explícitamente que las puntuaciones zero-shot en benchmarks no se han medido todavía. El único dato de evaluación publicado es la pérdida de validación:

| Metrica | Valor |
|---|---|
| Validation loss (canon-8192, 8192 x 2048 tokens) | 2.3236 nats por token |
| Validation loss con pesos del repo bajo PyTorch SDPA | 2.3237 nats por token |
| MMLU, HumanEval, GSM8K y otros | No medidos |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica unos 3-4 GB con contexto completo de 2048 tokens.
- En cuantización de 8 bits o 4 bits (no documentada por el autor, pero viable con herramientas estándar) el modelo podría ocupar en torno a 1 GB o 0,5 GB respectivamente, aunque el autor recomienda bf16.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; NVIDIA RTX 4090, RTX 3090, A100, H100 o GH200 funcionan sin problema. Cabe holgadamente en GPU de consumo como RTX 3060 de 12 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada; al requerir código remoto, la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está garantizada sin portar la implementación de XSA.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento usó 4 x GH200 de 120 GB, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-1.03b-2.18bt-base-cooled | 1.029M totales (919M no-embedding) | 2048 | Apache 2.0 | Base, XSA, multilingüe celta, sin benchmarks |
| Llama 3.2 1B | 1.240M | 131.072 | Llama 3.2 Community License | Base e instruct, sin XSA, contexto muy superior |
| Qwen2.5 1.5B | 1.540M | 32.768 | Apache 2.0 | Base e instruct, multilingüe amplio, benchmarks publicados |
| SmolLM2 1.7B | 1.700M | 8.192 | Apache 2.0 | Base e instruct, entrenado con ~11B tokens |

La comparación con Llama 3.2 1B y Qwen2.5 1.5B es la más directa por rango de parámetros, aunque ambos superan ampliamente el contexto de 2048 tokens y disponen de variantes instruidas y benchmarks publicados. SmolLM2 1.7B es el referente más cercano en filosofía (modelo pequeño de investigación), pero con un presupuesto de tokens muy superior. No se dispone de datos de rendimiento comparativo para vectabass al no haberse medido benchmarks.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni de seguridad: no debe usarse como asistente en producción sin fine-tuning y filtros adicionales.
- El autor advierte que "afirmará cosas falsas con fluidez"; el riesgo de alucinación es alto y no hay mitigación.
- Contexto de solo 2048 tokens, insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Predominio del inglés; las lenguas celtas y el escocés tienen proporciones menores y su calidad no está evaluada.
- Sin benchmarks zero-shot publicados, por lo que no se puede comparar su rendimiento con alternativas de forma objetiva.
- Requiere `trust_remote_code=True` para cargar `modeling_vectabass.py`, lo que implica ejecutar código del repositorio; conviene auditar el archivo antes de usarlo en entornos sensibles.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigación sin garantías, el usuario asume todo el riesgo de calidad y seguridad.
- No hay información sobre sesgos medidos ni sobre filtrado de datos más allá de las fuentes declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-1.03b-2.18bt-base-cooled
- Paper de Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Archivos de procedencia y datos del repositorio (`DATA.md`, `provenance.json`): disponibles en el propio repositorio de HuggingFace

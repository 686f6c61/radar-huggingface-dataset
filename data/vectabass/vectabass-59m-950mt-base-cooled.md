# VectaBass/vectabass-59m-950mt-base-cooled

## Resumen
vectabass-59m-950mt-base-cooled es un modelo de lenguaje base de 59,48 millones de parámetros totales (27,28 millones no-embedding), desarrollado por VectaBass como parte de un estudio de leyes de escala (scaling laws) para IA soberana del Reino Unido. Se trata de la celda "N0-D1" del apéndice AR de un paper en preparación: un peldaño adicional por debajo de la escalera principal de 100M a 1,6B parámetros, entrenado con 950 millones de tokens y la misma receta y datos que el resto de la escalera, para poder verificar la ley de escala a un tamaño menor.

El modelo emplea una arquitectura tipo Llama con atención exclusiva auto-regresiva (XSA), GQA 2:1, SwiGLU y RoPE con contexto de 2048 tokens, y un vocabulario GPT-2 BPE de 50.304 filas. Está entrenado principalmente en inglés, con cuotas menores de galés, gaélico escocés, irlandés, manés, córnico y escocés, reflejando el enfoque de fuentes públicas, parlamentarias y celtas del Reino Unido.

Es relevante ahora por su valor como pieza de investigación reproducible en estudios de leyes de escala y por su carácter de modelo base sin ajuste de instrucciones ni de seguridad, publicado bajo licencia Apache 2.0 con procedencia documentada (contrato de ejecución y hashes de checkpoint).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con atención exclusiva auto-regresiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE |
| Parametros totales | 59.473.920 (embeddings atados); 59.482.240 según safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (el autor indica ejecutar en bf16, tal como se entrenó; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en (mayoritario), cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code` para cargar `modeling_vectabass.py`) |

## Arquitectura y entrenamiento
La red es un transformer decoder-only de 6 capas con anchura 640, 10 cabezas de consulta y 5 de clave-valor de dimensión 64 (GQA 2:1), feed-forward SwiGLU de 1728, RMSNorm pre-norm y RoPE con base 10000. La innovación destacable es la atención exclusiva auto-regresiva (XSA), que Llama no incorpora, y que obliga a cargar código personalizado del repositorio. El vocabulario tiene 50.304 filas: GPT-2 BPE (50.257) más 26 tokens especiales y el resto relleno.

El entrenamiento usó 950.272.000 tokens (35 por parámetro no-embedding), batch de 327.680 tokens, optimizador Muon (matrices ocultas, NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW fp32 (0.9, 0.95), LR pico de 0,00359, warmup de 27M tokens y un schedule warmup-constante con cooldown 1-sqrt hasta cero en el último 20 %. Se entrenó en bf16 con pesos maestros fp32, estadísticas de norma, ángulos RoPE y logits en fp32, sobre 1 GPU NVIDIA GH200 de 120 GB. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta (unos 96B tokens únicos), incluyendo fuentes del sector público y parlamentario británico y lenguas celtas (fineweb-edu, fineweb-2, finemath).

## Capacidades
- Generación de texto auto-regresiva en inglés y, en menor medida, en galés, gaélico escocés, irlandés, manés, córnico y escocés.
- Modelado de lenguaje base: continuación de texto y estimación de probabilidad de secuencias.
- No dispone de ajuste de instrucciones ni de seguridad; no sigue instrucciones de forma fiable.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso agéntico.
- Sin capacidades de visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada a las siete lenguas listadas, con el inglés como lengua principal.

## Casos de uso
- Investigación de leyes de escala: sirve como peldaño N0 para ajustar curvas de pérdida frente a tokens y parámetros y validar la receta de entrenamiento a tamaño reducido.
- Reproducción de experimentos: el repositorio documenta contrato de ejecución, revisión y sha256 del checkpoint, lo que permite replicar los logits del código de entrenamiento (pérdida de validación de 2,8419 nats/token).
- Pruebas de infraestructura de entrenamiento e inferencia: al ser pequeño (0,1 GB) y ejecutarse en bf16 con `trust_remote_code`, es útil para validar pipelines de transformers, SDPA y carga de pesos antes de escalar a modelos mayores.
- Estudio de atención XSA frente a atención estándar: permite comparar variantes arquitectónicas a bajo coste computacional.
- Evaluación de cobertura de lenguas celtas: útil para medir la calidad de modelado en cy, gd, ga, gv, kw y sco en corpus de dominio público.
- Docencia y demostraciones: modelo ligero para explicar tokenización BPE, GQA, RoPE y schedules de learning rate en cursos de formación.
- Generación de texto de dominio público con fines de investigación lingüística, siempre con revisión humana por la ausencia de filtrado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las puntuaciones zero-shot aún no están medidas; solo se reporta la pérdida de validación en el canon phase-1-release (8192 × 2048 tokens): 2,8419 nats/token, con 2,8420 bajo PyTorch SDPA (el entrenamiento usó FlashAttention-4).

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo pesa aproximadamente 0,12 GB en bf16 (59,48M parámetros × 2 bytes), más activaciones y caché KV de 2048 tokens; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte bf16 (RTX 30xx/40xx, A100, H100, GH200); el entrenamiento se realizó en una NVIDIA GH200 de 120 GB.
- Cabe en GPU consumer: sí, en tarjetas con al menos 1-2 GB de VRAM libre, incluidas RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `dtype=torch.bfloat16`; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y la atención XSA personalizada puede requerir adaptaciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| vectabass-59m-950mt-base-cooled | 59,48M totales (27,28M no-embedding) | 2048 | Apache 2.0 | Base, XSA, estudio de scaling, multilingüe celta |
| Modelos de ~60M tipo GPT-2 small | ~124M (referencia de tamaño superior) | 1024 | Varía | No comparable directamente por tamaño; se cita como referencia de la familia |
| Peldaños superiores de la escalera AR de VectaBass (100M–1,6B) | 100M–1,6B | No disponible | No disponible | Misma receta y datos; comparación directa dentro del estudio de scaling |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias
- Es un modelo base entrenado para un estudio de scaling, no un asistente: afirmará cosas falsas con fluidez.
- Contexto limitado a 2048 tokens.
- Predominantemente inglés; las lenguas celtas tienen cuotas menores y su calidad es limitada.
- Sin ajuste de seguridad ni filtrado de salidas; no apto para uso directo en producción orientada a usuarios.
- Requiere `trust_remote_code` para cargar código personalizado (`modeling_vectabass.py`), lo que implica ejecutar código del repositorio y revisarlo antes de usarlo.
- Sesgos conocidos: no documentados explícitamente; al entrenarse con fuentes públicas y parlamentarias británicas puede reflejar sesgos de esos corpus.
- Riesgo de alucinación alto por su tamaño y condición de modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la idoneidad técnica para producción no está respaldada por evaluaciones.
- No se han publicado benchmarks zero-shot, por lo que no hay evidencia cuantitativa de calidad fuera de la pérdida de validación.

## Enlaces
- HuggingFace: https://huggingface.co/VectaBass/vectabass-59m-950mt-base-cooled
- Referencia Isambard-AI: https://doi.org/10.48550/arXiv.2410.11199
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper: pendiente de publicación (el autor indica citar el repositorio hasta entonces)
- Repositorio de código y demos: no disponible

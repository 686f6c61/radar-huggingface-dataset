# VectaBass/vectabass-59m-5.01bt-mdlm-cooled

## Resumen

vectabass-59m-5.01bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (masked diffusion language model, MDLM) de 59 millones de parámetros totales (27,3 millones sin contar embeddings), desarrollado por el autor independiente VectaBass. No es un modelo de propósito general, sino una celda experimental dentro de un estudio de leyes de escalado (scaling laws) centrado en IA soberana del Reino Unido: se entrenó desde cero sobre 5.010 millones de tokens con la misma receta y datos que la escalera principal de modelos MDLM de 100M a 1.6B, para verificar la ley a un tamaño inferior.

La arquitectura es un transformer tipo Llama con atención bidireccional y atención propia exclusiva (XSA), adaptado al objetivo de difusión: el modelo predice el token limpio en cada posición enmascarada en lugar de generar de izquierda a derecha. Emplea un vocabulario GPT-2 BPE de 50.304 filas, contexto de 2.048 tokens y se distribuye en safetensors con código de modelado personalizado (`trust_remote_code`).

Su relevancia es metodológica y de nicho: sirve como referencia abierta para estudiar cómo se comportan las leyes de escalado en difusión enmascarada a tamaños pequeños, y como base para experimentación con decodificación no autorregresiva. No está ajustado a instrucciones ni a seguridad, y sus propios autores advierten de que los hechos que genera suelen ser incorrectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención propia exclusiva (XSA), GQA 2:1, objetivo MDLM (difusión enmascarada) |
| Parametros totales | 59.473.920 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (entrenado y recomendado en bf16) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `modeling_vectabass.py` para `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer de 6 capas y anchura 640, con 10 cabezas de consulta y 5 de clave-valor de dimensión 64, feed-forward SwiGLU de 1.728, RMSNorm con pre-norm y posiciones RoPE (base 10.000, contexto 2.048). La pila es la de los modelos autorregresivos del mismo autor, pero con atención bidireccional y XSA. El token de máscara es el id 50283 y el vocabulario tiene 50.304 filas (GPT-2 BPE de 50.257 más 26 tokens especiales y relleno).

El objetivo es MDLM con un schedule lineal alpha_t = 1 - t: la pérdida es el ELBO negativo en tiempo continuo, una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. Se entrenó sobre 5.014.290.432 tokens (184 por parámetro no-embedding), con lotes de 393.216 tokens, optimizador Muon (matrices ocultas, NS 5, Moonlight RMS 0.2, momentum 0.95) más AdamW en fp32, LR pico de 0.00255, warmup de 39M tokens y cooldown 1-sqrt en el último 20%. Pesos y activaciones en bf16 con maestros fp32, y todo el entrenamiento corrió en una única NVIDIA GH200 de 120 GB. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta (unos 96B de tokens únicos) con fuentes del sector público y parlamentario británico y de lenguas celtas, a partir de fineweb-edu, fineweb-2 y finemath.

## Capacidades

- Relleno de texto enmascarado: dado un contexto con posiciones desconocidas marcadas con el token 50283, predice la distribución del token limpio en cada posición.
- Generación no autorregresiva mediante `diffusion_generate`, con orden aleatorio (ancestral exacto) u orden por confianza estilo MaskGIT.
- Extracción de características (`feature-extraction`) mediante `model(ids).logits`.
- Soporte multilingüe limitado a inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, visión ni audio.
- No está ajustado a instrucciones ni a seguridad; es un modelo base de estudio.

## Casos de uso

- Investigación sobre leyes de escalado: comparar el ELBO negativo de esta celda (3,2341 ± 0,0026 nats por token en el canon phase-1-release) con las celdas superiores de la escalera MDLM para validar la extrapolación a 27,3M de parámetros no-embedding.
- Estudio de samplers de difusión: banco de pruebas para comparar decodificación ancestral exacta frente a orden por confianza con penalización de presencia, midiendo bits por byte, bigramas distintos y 4-gramas repetidos.
- Experimentos con lenguas celtas de bajos recursos: al incluir galés, gaélico, irlandés, manés, córnico y escocés en el corpus, sirve para analizar el comportamiento de la difusión enmascarada en idiomas con pocos datos.
- Prototipado de relleno de huecos (infilling): completar fragmentos de texto con posiciones enmascaradas en documentos del dominio público británico, siempre con validación humana.
- Baseline de comparación AR frente a difusión: emparejado con el addendum autorregresivo del mismo autor, permite medir la brecha de fluidez entre ambos objetivos a igualdad de tamaño y datos.
- Docencia y divulgación: modelo pequeño (0,1 GB de repositorio) que cabe en una sola GPU de consumo para demostrar el funcionamiento interno de la difusión enmascarada paso a paso.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| ELBO negativo en canon phase-1-release (8192 x 2048 tokens, 16 máscaras por secuencia) | 3,2341 ± 0,0026 nats por token |

La model card incluye además una comparativa de samplers medida en la celda N6-D5 (no en esta), sobre 32 inicios de documento retenidos, 32 tokens de prompt y 256 generados, puntuada por Qwen3-8B-Base:

| Sampler | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| Confianza, argmax, penalización 4 (recomendado) | 0,64 | 0,74 | 18% |
| Igual sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16 (59,5M de parámetros, unos 0,12 GB de pesos) más el overhead de activaciones y caché.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se hizo en una NVIDIA GH200 de 120 GB, pero la inferencia no requiere hardware de datacenter.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU para pruebas puntuales.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y bf16; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el código de modelado personalizado dificulta su integración en esos motores.
- Latencia y throughput: no disponibles. La generación requiere `steps` pasadas hacia delante (una por token si se sigue la recomendación de `steps = gen_length`), lo que la hace más costosa que la decodificación autorregresiva con caché KV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-59m-5.01bt-mdlm-cooled | 59,5M (27,3M no-embedding) | 2.048 | Difusión enmascarada (MDLM) | Apache 2.0 | Hugging Face |
| Addendum AR de VectaBass (mismo tamaño) | No disponible | No disponible | Autorregresivo | No disponible | Anunciado como release separada |
| Celdas MDLM de la escalera principal (100M-1.6B) | 100M-1.6B | No disponible | Difusión enmascarada (MDLM) | No disponible | Referenciadas en la model card |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste a instrucciones ni a seguridad: no debe usarse directamente en producción orientada a usuarios.
- Los hechos generados suelen ser incorrectos, según advierte el propio autor.
- El muestreo por confianza sin penalización de presencia entra en bucles de repetición (80% de 4-gramas repetidos); la penalización 4 es una heurística probada, no un muestreo exacto, y las listas, tablas y código no se evaluaron.
- El muestreo ancestral exacto es mucho menos fluido que el modelo autorregresivo del mismo tamaño, y temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Las métricas de samplers se obtuvieron con una sola semilla y 32 prompts, con errores estándar de unos 0,06 bits por byte.
- Contexto limitado a 2.048 tokens e idiomas restringidos a siete lenguas (inglés y celtas); el rendimiento fuera de ese conjunto no está documentado.
- El ELBO negativo es una cota superior de la log-verosimilitud negativa y no es directamente comparable con la entropía cruzada de un modelo autorregresivo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de ajuste y la baja calidad factual desaconsejan ese uso sin filtros adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-59m-5.01bt-mdlm-cooled
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Documentación de datos del autor (`DATA.md`): referenciada en la model card, no se proporciona URL directa

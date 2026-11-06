# VectaBass/vectabass-151m-5.01bt-mdlm-cooled

## Resumen

vectabass-151m-5.01bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) de 151,5 millones de parámetros totales (100,0 millones sin contar embeddings), entrenado desde cero sobre 5.014 millones de tokens. Lo desarrolla el autor independiente VectaBass dentro de un proyecto de estudio de leyes de escala ("MDLM square") orientado a IA soberana del Reino Unido, con especial atención a fuentes públicas y lenguas celtas. No es un modelo instructivo ni ajustado en seguridad: es un modelo base concebido como celda experimental de una escalera de tamaños que va de 100M a 1.600M de parámetros no-embedding.

La arquitectura parte del stack tipo Llama de los modelos autorregresivos del mismo autor, con self-attention exclusiva (XSA) y GQA 2:1, pero convertida en bidireccional. El objetivo de entrenamiento es el ELBO negativo en tiempo continuo con alpha_t lineal, y la generación se realiza rellenando tokens máscara a lo largo de pasos sucesivos. El contexto es de 2048 tokens y el vocabulario usa BPE de GPT-2 más 26 tokens especiales.

Su relevancia es metodológica: se publica junto al resto de celdas de la escalera (y a una escalera autorregresiva paralela entrenada con los mismos datos) para que la ley de escala pueda comprobarse de forma reproducible. Incluye réplicas de semilla en la rama `seed2` para medir el ruido entre ejecuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con self-attention exclusiva (XSA), GQA 2:1, RMSNorm pre-norm, SwiGLU, RoPE; objetivo de difusión enmascarada (MDLM) |
| Parametros totales | 151.486.464 (embeddings atados; 99.975.168 no-embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y recomendado en bf16) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`: `modeling_vectabass.py`) |

Otras especificaciones: anchura 1024, 9 capas, 16 cabezas de consulta y 8 de clave-valor de dimensión 64, feed-forward SwiGLU de 2592, RoPE con base 10000, token máscara id 50283, vocabulario de 50304 filas (GPT-2 BPE de 50257 más 26 tokens especiales y relleno). Tamaño del repositorio: 0,6 GB.

## Arquitectura y entrenamiento

El modelo es un transformer de 9 capas y anchura 1024 con atención bidireccional, derivado del stack autorregresivo del autor pero sin máscara causal. Emplea self-attention exclusiva (XSA), GQA con ratio 2:1, RMSNorm pre-norm, SwiGLU y RoPE. La cabeza de salida produce, en cada posición, la distribución del token limpio; el entrenamiento enmascara posiciones con el token 50283 y optimiza el ELBO negativo en tiempo continuo con alpha_t = 1 - t, equivalente a una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones.

El entrenamiento usó 5.014.290.432 tokens (50 por parámetro no-embedding), con lotes de 524.288 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) más AdamW en fp32 para el resto, LR pico de 0.00173, 100M tokens de warmup, schedule constante con cooldown 1-sqrt en el último 20% y weight decay de 0.135. Se ejecutó en una única NVIDIA GH200 de 120 GB en bf16 con pesos maestros en fp32. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta (unos 96B tokens únicos) a partir de FineWeb-Edu, FineWeb-2 y FineMath, con fuentes del sector público y parlamentarias del Reino Unido y de lenguas celtas; el desglose por bin y licencia está en `DATA.md`.

## Capacidades

- Modelado de lenguaje base mediante difusión enmascarada: rellena tokens máscara condicionado al contexto visible, con acceso bidireccional a toda la secuencia.
- Extracción de características (`feature-extraction`): representaciones contextuales bidireccionales por token.
- Generación de texto mediante `diffusion_generate`, con orden de desenmascarado aleatorio (ancestral exacto) o por confianza (estilo MaskGIT).
- Control de sampling: `presence_penalty`, `t_start`, `schedule`, `ban_eot`, `gen_length`, `steps` y `seed`.
- Cobertura multilingüe limitada a inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de tool calling, function calling, modo de razonamiento, visión, audio ni capacidades de agente; no está ajustado a instrucciones.

## Casos de uso

- Estudio de leyes de escala: el modelo es una celda (N1-D1) de una escalera de tamaños y presupuestos de tokens; se usa para ajustar curvas de pérdida frente a cómputo y compararlas con la escalera autorregresiva paralela.
- Investigación en difusión enmascarada: permite reproducir el ELBO negativo de referencia (2,9967 ± 0,0026 nats por token en el canon phase-1-release) y comparar objetivos de entrenamiento sobre los mismos datos.
- Evaluación de samplers: con ~30 samplers comparados por el autor, sirve como banco de pruebas para medir fluidez (bits por byte con Qwen3-8B-Base), diversidad de bigramas y repetición de 4-gramas.
- Medición de ruido entre ejecuciones: las réplicas de la rama `seed2` (misma receta, nueva inicialización y orden de datos) permiten estimar la varianza run-to-run de una celda.
- Extracción de características para texto en lenguas celtas: representaciones bidireccionales sobre galés, gaélico, irlandés, manés, córnico y escocés, idiomas poco cubiertos en modelos abiertos.
- Experimentos de relleno de huecos (infilling) controlado: el objetivo de difusión enmascarada es natural para completar pasajes con posiciones desconocidas, útil en prototipos de edición y aumento de datos.
- Docencia y divulgación: modelo pequeño (0,6 GB de repositorio) que cabe en una sola GPU consumer para demostrar generación no autorregresiva paso a paso.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). La evaluación disponible es la siguiente:

| Metrica | Valor |
|---|---|
| Negative ELBO (canon phase-1-release, 8192 x 2048 tokens, 16 máscaras por secuencia) | 2,9967 ± 0,0026 nats por token (± 1 EE) |

Calidad de sampling (celda N6-D5, 32 inicios de documento retenidos, prompt de 32 tokens, 256 tokens generados, una semilla):

| Sampler | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| confidence, argmax, presence penalty 4 incl. prompt (recomendado) | 0,64 | 0,74 | 18% |
| Igual, sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

El error estándar de bits por byte es de aproximadamente 0,06 con una semilla y 32 prompts. El ELBO negativo es una cota superior de la log-verosimilitud negativa y solo es comparable con la entropía cruzada de un modelo autorregresivo como cota, no como medida equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 151,5M de parámetros ocupan unos 0,3 GB de pesos; con activaciones y caché para contexto de 2048 tokens, el consumo realista se sitúa en torno a 1-2 GB.
- GPU recomendadas: cualquier GPU con soporte bf16; el autor entrenó en una NVIDIA GH200 de 120 GB, pero para inferencia es sobredimensionada.
- Cabe en GPU consumer: sí, en tarjetas con bf16 como RTX 3060, 4060, 4070, 4080 y 4090; también en GPUs de portátil con suficiente memoria.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (carga `modeling_vectabass.py`); no hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI, y el formato publicado es safetensors sin GGUF.
- Latencia y throughput: no disponible; la generación requiere `steps` pasadas forward (recomendado `steps = gen_length`, un token por paso), por lo que el coste es proporcional al número de pasos y no al de tokens generados de forma autorregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-151m-5.01bt-mdlm-cooled | 151,5M (100,0M no-embedding) | 2048 | Difusión enmascarada (MDLM) | Apache 2.0 | Celda de estudio de escala; sin benchmarks estándar |
| Modelo autorregresivo de la misma escalera (VectaBass) | Escalera de 100M a 1,6B no-embedding | no disponible | Autorregresivo | no disponible | Entrenado con los mismos datos; referencia directa del autor |
| Réplicas `seed2` del mismo modelo | 151,5M | 2048 | MDLM | Apache 2.0 | Misma receta con nueva inicialización y orden de datos |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de terceros de tamaño similar.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones ni de seguridad: no debe usarse como asistente conversacional sin ajuste posterior.
- Los hechos generados son a menudo incorrectos; el propio autor lo advierte.
- Sin penalización de presencia, el orden por confianza entra en bucles; con penalización 3 sigue repitiendo y con 6 pierde fluidez. El valor 4 es heurístico y no un muestreo exacto.
- Las listas, tablas y código, donde la repetición es correcta, no fueron evaluados y las listas tienden a repetirse.
- Usar más de un token por paso degrada la calidad (0,73 bits por byte y 0,49 de bigramas distintos con 4 tokens por paso).
- El muestreo ancestral exacto es mucho menos fluido que el modelo autorregresivo del mismo tamaño según el autor; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Cobertura lingüística limitada a siete idiomas, con sesgo hacia el inglés y fuentes del Reino Unido; el contexto máximo es de 2048 tokens.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin evaluación de sesgos ni de seguridad, su uso en producción exige auditoría propia.
- Los resultados de sampling proceden de una sola semilla y 32 prompts, con error estándar de ~0,06 bits por byte; no deben interpretarse como medidas robustas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene revisarlo antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/VectaBass/vectabass-151m-5.01bt-mdlm-cooled
- Rama de réplicas de semilla: `revision="seed2"` en el mismo repositorio
- Documentación de datos del autor: `DATA.md` en el repositorio
- Código de modelado: `modeling_vectabass.py` en el repositorio
- Paper, blog o repositorio del estudio de escala: no disponible en la información proporcionada

# VectaBass/vectabass-59m-60.8bt-mdlm-cooled

## Resumen

vectabass-59m-60.8bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, *masked diffusion language model*) de 59,48 millones de parámetros totales (27,28 millones no correspondientes a embeddings), desarrollado por el autor independiente VectaBass. Forma parte de un estudio de *scaling laws* orientado a la soberanía tecnológica del Reino Unido ("uk-sovereign-ai") y constituye la celda **N0-D6** del apéndice MDLM de la Fase 1: un escalón adicional por debajo de la escalera principal de 100M a 1,6B parámetros, entrenado con la misma receta y los mismos datos para verificar empíricamente la ley de escala en un tamaño menor.

El modelo no es un transformer autorregresivo al uso, sino una red bidireccional que aprende a rellenar tokens enmascarados mediante un proceso de difusión de tiempo continuo. Se entrenó desde cero sobre 60.800 millones de tokens (2.229 tokens por parámetro no-embedding), lo que lo sitúa en una región de sobrentrenamiento deliberado típica de los estudios de *scaling*. La ventana de contexto es de 2.048 tokens y el vocabulario emplea BPE de GPT-2 con 50.304 filas.

Es relevante ahora porque publica, junto con los pesos, una comparación sistemática de aproximadamente 30 muestreadores sobre un conjunto controlado, además de la receta completa (optimizador Muon, cooldown 1-sqrt, datos abiertos con fuentes parlamentarias y celtas). Es un modelo base de investigación, **no** ajustado por instrucciones ni por seguridad, y su utilidad principal es metodológica: servir de referencia reproducible para estudiar difusión enmascarada a pequeña escala frente a alternativas autorregresivas equivalentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con self-attention exclusiva (XSA), GQA 2:1, objetivo MDLM (difusión enmascarada) |
| Parametros totales | 59.482.240 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (RoPE, base 10.000) |
| Tipos de cuantizacion | No disponible (entrenado y publicado en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, cy (galés), gd (gaélico escocés), ga (irlandés), gv (manés), kw (córnico), sco (escocés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con código custom en `modeling_vectabass.py`, requiere `trust_remote_code=True`) |

Otras especificaciones técnicas: anchura 640, 6 capas, 10 cabezas de consulta y 5 de clave-valor de dimensión 64, feed-forward SwiGLU de 1.728, normalización RMSNorm pre-norm, token de máscara con id 50283, vocabulario de 50.304 filas (BPE GPT-2 de 50.257 más 26 tokens especiales y relleno).

## Arquitectura y entrenamiento

La arquitectura reutiliza el stack tipo Llama de los modelos autorregresivos del mismo autor, pero lo convierte en bidireccional: atención con GQA 2:1 y self-attention exclusiva (XSA), posiciones RoPE con base 10.000 y contexto de 2.048. El objetivo no es la predicción del siguiente token, sino MDLM con un schedule lineal `alpha_t = 1 - t`: la pérdida es el ELBO negativo en tiempo continuo, es decir, una entropía cruzada enmascarada ponderada por `1/t` sobre todas las posiciones. En inferencia, `diffusion_generate` añade `gen_length` tokens de máscara al prompt y los rellena a lo largo de `steps` pasadas hacia adelante.

El entrenamiento consumió 60.800.237.568 tokens con un batch de 393.216 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW en fp32 (0.9, 0.95), LR pico de 0.00255, warmup de 39M tokens (fijado a 100 pasos, por encima de los 69,4 que dictaría la regla de receta) y un cooldown 1-sqrt hasta cero en el último 20 %. Precisión bf16 en pesos y activaciones con pesos maestros fp32, estadísticas de norma, ángulos RoPE y logits en fp32. Se ejecutó sobre 2 × NVIDIA GH200 de 120 GB. Los datos provienen de la vista *phase-1-release*: 47 bins de texto con licencia abierta (unos 96B tokens únicos) que incluyen fineweb-edu, fineweb-2 y finemath, además de fuentes del sector público británico, parlamentarias y de lenguas celtas; el desglose por bin, cuota y licencia está en `DATA.md`.

## Capacidades

- Relleno de texto enmascarado (*infilling*) bidireccional: dado un contexto con huecos marcados con el token 50283, genera los tokens que faltan.
- Generación de continuaciones de documento mediante `diffusion_generate`, con dos modos de orden: `random` (el proceso inverso para el que fue entrenado) y `confidence` (estilo MaskGIT, commit de las posiciones más seguras primero).
- Modelado de distribución del token limpio en cada posición vía `model(ids).logits`, útil para *feature extraction* y análisis probabilístico.
- Cobertura multilingüe limitada a siete idiomas: inglés y seis lenguas celtas y germánicas insulares (galés, gaélico escocés, irlandés, manés, córnico, escocés).
- **No** dispone de tool calling, function calling, soporte de agentes, modo *thinking*, visión ni audio.
- **No** está ajustado por instrucciones ni por seguridad: no sigue instrucciones en el sentido conversacional.
- Capacidad de repetición controlada mediante `presence_penalty` (valor recomendado 4.0, incluyendo el prompt) para evitar bucles en el orden por confianza.

## Casos de uso

- **Investigación en scaling laws de difusión enmascarada**: el modelo es una celda de un estudio diseñado para verificar si la ley de escala observada entre 100M y 1,6B parámetros se mantiene en 27,3M no-embedding. Se usaría junto con las demás celdas y con el apéndice autorregresivo equivalente para ajustar curvas de pérdida frente a tokens.
- **Comparación metodológica MDLM vs. AR a igualdad de cómputo**: al compartir receta, datos y arquitectura base con el apéndice autorregresivo, permite aislar el efecto del objetivo de entrenamiento (difusión frente a predicción del siguiente token) en el ELBO negativo o la entropía cruzada sobre el mismo canon.
- **Relleno de documentos con huecos en corpus parlamentarios y administrativos**: su entrenamiento incluye fuentes del sector público británico y parlamentarias, por lo que puede emplearse para tareas de *infilling* sobre actas, borradores legislativos o formularios con campos ausentes, siempre con revisión humana.
- **Prototipado de técnicas de muestreo en modelos de difusión**: la model card documenta 30 muestreadores comparados con métricas de bits por byte UTF-8, bigramas distintos y 4-gramas repetidos; el modelo sirve como banco de pruebas barato (0,1 GB de repo) para evaluar nuevos samplers antes de escalarlos.
- **Experimentación con lenguas celtas de bajos recursos**: es uno de los pocos modelos abiertos que declara soporte para cy, gd, ga, gv, kw y sco, útil para estudiar cobertura y calidad en estas lenguas dentro de proyectos de preservación lingüística.
- **Extracción de características y análisis probabilístico**: la pipeline `feature-extraction` y la API `model(ids).logits` permiten obtener distribuciones por posición para tareas de análisis (detección de incertidumbre, estudio de representaciones) sin generar texto.
- **Docencia y reproducción de recetas**: la receta completa (Muon, cooldown 1-sqrt, warmup fijado, precisión mixta) y el hardware empleado (2 × GH200) hacen del modelo un caso de estudio reproducible en cursos de entrenamiento de LLM a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación del autor se limita al ELBO negativo sobre su canon interno y a métricas de calidad de muestreo:

| Metrica | Valor |
|---|---|
| ELBO negativo (canon-8192, 16 máscaras por secuencia) | 3,0305 ± 0,0025 nats por token |
| Bits por byte UTF-8, continuación real (referencia) | 0,66 |
| Bits por byte, sampler recomendado (confidence, argmax, penalización 4, 1 token/paso) | 0,64 |
| Bigramas distintos, sampler recomendado | 0,74 |
| 4-gramas repetidos, sampler recomendado | 18 % |
| Bits por byte, mismo sampler sin penalización | 0,15 |
| Bigramas distintos, sin penalización | 0,16 |
| 4-gramas repetidos, sin penalización | 80 % |
| Bits por byte, orden aleatorio con muestreo ancestral exacto | 1,39 |
| Bits por byte, 4 tokens por paso | 0,73 |
| Bigramas distintos, 4 tokens por paso | 0,49 |

Las cifras de muestreo corresponden a la celda N6-D5, no a la N0-D6 de este repositorio, y se obtuvieron sobre 32 inicios de documento retenidos (prompt de 32 tokens, 256 generados, una semilla), puntuadas por Qwen3-8B-Base. El error estándar en bits por byte es de aproximadamente 0,06.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 59,5M parámetros, en bf16 ocupa aproximadamente 0,12 GB de pesos; en fp32, unos 0,24 GB. Con overhead de activaciones y caché para contexto de 2.048, cabe holgadamente en cualquier GPU con más de 2 GB.
- **GPU recomendadas**: cualquier GPU consumer moderna sirve (RTX 3060, RTX 4060, RTX 4090). El autor entrenó en 2 × NVIDIA GH200 de 120 GB, pero eso corresponde al entrenamiento, no a la inferencia.
- **Cabe en GPU consumer**: sí, en todas las GPU con soporte bf16 (serie RTX 30xx en adelante, así como Apple Silicon vía MPS con las limitaciones del código custom).
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` es la vía documentada; el código custom (`modeling_vectabass.py`) y el método `diffusion_generate` no están integrados en vLLM, llama.cpp, Ollama ni TGI, por lo que estos motores no son compatibles sin portar el modelo. El repositorio pesa 0,1 GB.
- **Latencia y throughput**: no disponibles. Como referencia estructural, `diffusion_generate` con `steps = gen_length` realiza una pasada completa por cada token generado, de modo que generar 256 tokens requiere 256 forward passes; el coste por token es, por tanto, del orden de una pasada de un modelo de 6 capas y 640 de anchura, muy inferior al de un modelo denso grande, pero sin la ventaja de caché KV de la generación autorregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-59m-60.8bt-mdlm-cooled | 59,5M totales (27,3M no-embedding) | 2.048 | MDLM (difusión enmascarada) | Apache 2.0 | Celda N0-D6 de un estudio de scaling; sin benchmarks estándar |
| Apéndice AR de VectaBass (mismo autor) | No disponible en la informacion | No disponible | Autorregresivo | No disponible | Publicado por separado; misma receta y datos, permite comparación directa |
| Celdas MDLM de 100M a 1,6B (mismo autor) | 100M–1,6B | No disponible | MDLM | No disponible | Escalera principal del estudio; el modelo aquí descrito es el escalón inferior |
| Alternativas MDLM públicas (p. ej. modelos de difusión enmascarada de tamaño pequeño) | No disponible | No disponible | MDLM | No disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparación más rigurosa disponible es interna al propio estudio: el modelo está diseñado para contrastarse con el apéndice autorregresivo del mismo autor y con las celdas superiores de la escalera MDLM. No se han identificado en la información proporcionada modelos de terceros directamente comparables con datos verificables.

## Limitaciones y advertencias

- **No es un modelo de instrucciones**: es un modelo base sin ajuste por instrucciones ni por seguridad; no debe usarse como asistente conversacional sin un post-entrenamiento adicional.
- **Alucinación factual elevada**: la propia model card advierte que "los hechos a menudo son incorrectos", con un error estándar de 0,06 bits por byte sobre solo 32 prompts y una semilla.
- **Sesgos**: no se documenta ninguna evaluación de sesgos; los datos incluyen fuentes del sector público británico y web abierta, con los sesgos inherentes a fineweb-edu y fineweb-2.
- **Repetición y bucles**: sin `presence_penalty` (valor probado 4.0, incluyendo el prompt) el orden por confianza entra en bucle; con penalización 3 todavía repite y con 6 pierde fluidez. El sampler es una heurística, no un muestreo exacto, y sesga contra palabras repetidas, lo que degrada listas, tablas y código (no probados; las listas siguen repitiéndose).
- **Muestreo ancestral exacto poco fluido**: el orden aleatorio con muestreo ancestral exacto es mucho menos fluido que el modelo autorregresivo del mismo tamaño; temperatura, top-k, top-p y min-p no alcanzan la calidad de texto real.
- **Un token por paso**: usar 4 tokens por paso degrada la calidad (0,73 bits por byte, 0,49 de bigramas distintos).
- **Contexto corto**: 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- **Cobertura idiomática limitada**: siete idiomas, con el inglés como dominante; el rendimiento en las lenguas celtas no está cuantificado.
- **Dependencia de código custom**: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; no es compatible con motores de inferencia estándar sin portar.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un modelo base sin evaluación de seguridad, el usuario asume la responsabilidad de cualquier despliegue en producción.
- **Estado del repositorio**: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación reciente, no un modelo con validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-59m-60.8bt-mdlm-cooled
- Código de modelado custom: `modeling_vectabass.py` dentro del repositorio de Hugging Face
- Documentación de datos: `DATA.md` dentro del repositorio de Hugging Face
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath

No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código independientes ni demos adicionales.

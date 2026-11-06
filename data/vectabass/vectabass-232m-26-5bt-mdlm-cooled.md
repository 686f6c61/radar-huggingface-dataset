# VectaBass/vectabass-232m-26.5bt-mdlm-cooled

## Resumen

vectabass-232m-26.5bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, *masked diffusion language model*) de 231,8 millones de parámetros totales (173,9 millones no de embedding), desarrollado por VectaBass. Forma parte de la "MDLM square" de fase 1: una escalera de modelos de 100M a 1.6B de parámetros no de embedding, cada tamano entrenado con varios presupuestos de tokens y publicados conjuntamente para poder verificar empíricamente leyes de escalado. Esta celda concreta corresponde al punto N2-D3 (173,9M no de embedding, 26,47B tokens).

El modelo se entrena desde cero sobre 26.465.140.736 tokens (152 tokens por parámetro no de embedding) procedentes de fineweb-edu, fineweb-2 y finemath, con fuentes adicionales de ámbito público del Reino Unido, parlamentarias y de lenguas celtas. La arquitectura reutiliza la pila tipo Llama de los modelos autorregresivos del mismo proyecto, con atención propia exclusiva (XSA), pero convertida en bidireccional; la generación se realiza mediante un proceso de desenmascarado iterativo en lugar de decodificación token a token.

Su relevancia es fundamentalmente investigadora: es un modelo base de estudio de escalado, sin ajuste por instrucciones ni por seguridad, orientado a comparar la eficiencia de la difusión enmascarada frente a alternativas autorregresivas bajo datos y presupuestos idénticos. No está pensado como modelo de producción, y el propio autor advierte de que los hechos generados suelen ser incorrectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención propia exclusiva (XSA), GQA 2:1, objetivo MDLM (difusión enmascarada) |
| Parametros totales | 231.800.832 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Parametros no de embedding | 173.850.624 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (el autor recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB), requiere `trust_remote_code=True` |
| Anchura / capas | 1152 / 12 |
| Cabezas | 18 query, 9 key-value, dimensión 64 |
| Feed-forward | SwiGLU, dimensión 3040 |
| Normalización | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10000 |
| Token de máscara | id 50283 |
| Vocabulario | 50304 filas: BPE de GPT-2 (50257) más 26 tokens especiales, resto padding |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La red es la misma pila tipo Llama que los modelos autorregresivos del proyecto, con atención propia exclusiva (XSA), pero con atención bidireccional en lugar de causal. El objetivo es MDLM con un schedule lineal `alpha_t = 1 - t`: la pérdida es el ELBO negativo en tiempo continuo, es decir, una entropía cruzada enmascarada ponderada por `1/t` sobre todas las posiciones. En inferencia, `model(ids).logits` devuelve en cada posición la distribución del token limpio, colocando el token de máscara (50283) donde el token es desconocido.

El entrenamiento consumió 26.465.140.736 tokens con un batch de 622.592 tokens, optimizador Muon (matrices ocultas, NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW en fp32 (0.9, 0.95), LR pico de 0.00146, warmup de 174M tokens y un cooldown `1-sqrt` hasta cero en el último 20%. Se usó weight decay de 0.0955 sobre matrices, precisión bf16 en pesos y activaciones con pesos maestros en fp32, y estadísticas de norma, ángulos RoPE y logits en fp32. Todo el entrenamiento se ejecutó en una única NVIDIA GH200 de 120 GB. Los datos provienen de la vista de fase 1: 47 bins de texto con licencia abierta, unos 96B de tokens únicos, con fuentes del sector público británico, parlamentarias y de lenguas celtas (detalladas en `DATA.md`).

La innovación destacable es el propio esquema de muestreo: el autor comparó unos 30 samplers y recomienda orden por confianza estilo MaskGIT con `argmax=True`, `presence_penalty=4.0` (contando también el prompt) y un token por paso. Sin penalización, el orden por confianza entra en bucles; con penalización 3 aún repite y con 6 pierde fluidez respecto al texto real.

## Capacidades

- Generación de texto mediante desenmascarado iterativo (`diffusion_generate`), no mediante decodificación autorregresiva.
- Relleno condicional de huecos: al colocar el token de máscara en posiciones desconocidas, el modelo devuelve la distribución del token limpio en cada una.
- Dos modos de orden de desenmascarado: `random` (el proceso inverso para el que fue entrenado) y `confidence` (MaskGIT, recomendado por el autor).
- Extracción de características (pipeline declarado `feature-extraction`).
- Cobertura multilingüe limitada a inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de tool calling, function calling, modo de razonamiento explícito, visión ni audio.
- No está ajustado por instrucciones ni por seguridad: no es un modelo de chat ni de agentes.

## Casos de uso

- Estudio de leyes de escalado: la celda N2-D3 se publica junto al resto de la escalera y al cuadrado autorregresivo equivalente para verificar empíricamente cómo escala la pérdida con parámetros y tokens en difusión enmascarada frente a autorregresiva.
- Investigación sobre objetivos de entrenamiento: permite comparar directamente el ELBO negativo (2,6633 nats/token en el canon de retención) con la entropía cruzada de un modelo autorregresivo del mismo tamano y datos, como cota superior.
- Experimentación con samplers: sirve de banco de pruebas para estudiar orden de desenmascarado, penalizaciones de presencia y schedules, con métricas de bits por byte UTF-8, bigramas distintos y 4-gramas repetidos.
- Relleno de texto (*infilling*) en documentos: el objetivo bidireccional permite enmascarar posiciones intermedias y reconstruirlas, algo que un modelo causal no hace de forma nativa.
- Procesamiento de lenguas celtas de bajos recursos: el corpus incluye fuentes en galés, gaélico escocés, irlandés, manés, córnico y escocés, útil para estudiar cobertura multilingüe en modelos pequeños.
- Extracción de representaciones: al declararse como `feature-extraction`, puede usarse para obtener embeddings contextuales bidireccionales en tareas de clasificación o similitud, siempre con validación previa.
- Docencia y reproducibilidad: al ser un modelo pequeño (0,5 GB) entrenado en una sola GPU, es viable reproducir el pipeline completo en entornos académicos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| ELBO negativo en canon de retención (phase-1-release canon-8192, 8192 x 2048 tokens, 16 máscaras por secuencia) | 2,6633 ± 0,0025 nats por token |
| ELBO negativo estimado de forma independiente (una máscara, PyTorch SDPA) | 2,6615 ± 0,0102 nats por token |
| Benchmark zero-shot (MMLU, HumanEval, GSM8K, etc.) | No medidos para los modelos MDLM |

El autor indica que el ELBO negativo es una cota superior de la log-verosimilitud negativa y que puede compararse con la entropía cruzada de un modelo autorregresivo sobre el mismo canon, pero como cota, no como medida equivalente. Los pesos de este repositorio reproducen bit a bit los logits del código de entrenamiento en filas enmascaradas del canon.

Datos de muestreo del autor (celda N6-D5, 32 inicios de documento retenidos, prompt de 32 tokens, 256 tokens generados, una semilla, puntuados por Qwen3-8B-Base):

| Sampler | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7% |
| confidence, argmax, penalización 4 incl. prompt | 0,64 | 0,74 | 18% |
| Igual, sin penalización | 0,15 | 0,16 | 80% |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22% |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,5 GB de pesos más activaciones y caché; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA GH200 de 120 GB, pero para inferencia basta una RTX 3060, RTX 4060, RTX 4090 o cualquier GPU con soporte bf16.
- Cabe en GPU consumer: sí, con margen amplio; también es viable en CPU para pruebas puntuales.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el módulo `modeling_vectabass.py` del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el sampler `diffusion_generate` es código personalizado.
- Latencia y throughput: no disponibles. El coste computacional es proporcional a `steps`; el autor recomienda `steps = gen_length` (un token por paso), lo que implica 256 pasadas hacia delante para generar 256 tokens, muy por encima del coste de un modelo autorregresivo equivalente con caché KV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-232m-26.5bt-mdlm-cooled | 231,8M totales (173,9M no emb.) | 2048 | MDLM (difusión enmascarada) | Apache 2.0 | Celda N2-D3 de la escalera MDLM; sin benchmarks zero-shot |
| Modelo autorregresivo equivalente de VectaBass (cuadrado AR) | Misma escalera (100M–1.6B no emb.) | No disponible | Autorregresivo causal | No disponible en la información | Entrenado con los mismos datos y escalera; publicado por separado |
| Celda N6-D5 de la misma escalera MDLM | Mayor que N2-D3 (tamano exacto no disponible) | 2048 | MDLM | Apache 2.0 | Usada por el autor para la comparativa de samplers |

No se dispone de datos de benchmarks que permitan comparar rendimiento con modelos de otras familias; el autor no mide zero-shot para los MDLM.

## Limitaciones y advertencias

- Modelo base de estudio de escalado: no está ajustado por instrucciones ni por seguridad, por lo que no debe usarse como asistente conversacional.
- Los hechos generados suelen ser incorrectos, según advierte el propio autor.
- El muestreo por confianza sin penalización de presencia entra en bucles; con penalización 3 aún repite y con 6 pierde fluidez. La penalización 4 es una heurística probada, no un muestreo exacto, y sesga contra palabras repetidas.
- Listas, tablas y código, donde la repetición es correcta, no fueron evaluados y las listas todavía se repiten.
- Mantener un token por paso (`steps = gen_length`); cuatro tokens por paso degrada la calidad (0,73 bits por byte, 0,49 de bigramas distintos).
- El muestreo ancestral exacto es mucho menos fluido que el modelo autorregresivo del mismo tamano; temperatura, top-k, top-p y min-p intercambian fluidez por diversidad sin alcanzar texto real.
- Las estimaciones de calidad se basan en una sola semilla y 32 prompts, con errores estándar de unos 0,06 bits por byte.
- Contexto limitado a 2048 tokens.
- Cobertura lingüística restringida a siete idiomas, con sesgo hacia el inglés y lenguas celtas; el castellano no está entre los idiomas declarados.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de ajuste de seguridad traslada al desplegador toda la responsabilidad sobre sesgos y contenido dañino.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de usarlo en producción.
- No se documenta soporte en runtimes de inferencia estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita su despliegue escalable.

## Enlaces

- Hugging Face: https://huggingface.co/VectaBass/vectabass-232m-26.5bt-mdlm-cooled
- Repositorio de datos del autor: `DATA.md` (referenciado en la model card, disponible en el propio repositorio de Hugging Face)
- Código de modelado: `modeling_vectabass.py` (incluido en el repositorio de Hugging Face)
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada

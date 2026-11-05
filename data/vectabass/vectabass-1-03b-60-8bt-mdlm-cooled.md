# VectaBass/vectabass-1.03b-60.8bt-mdlm-cooled

## Resumen

vectabass-1.03b-60.8bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, *masked diffusion language model*) de 1.029 millones de parámetros totales (919,4 millones sin contar embeddings), desarrollado por VectaBass. Se ha entrenado desde cero sobre 60.800 millones de tokens y forma parte de la "casilla N5-D4" de un cuadrado MDLM de fase 1: una escalera de modelos de 100M a 1.6B de parámetros no-embedding, cada tamaño entrenado con varios presupuestos de tokens y publicado en conjunto para poder verificar empíricamente la ley de escalado. Existe un cuadrado autorregresivo (AR) equivalente, entrenado con los mismos datos y la misma escalera, que se publica por separado.

La arquitectura es un transformer bidireccional de tipo Llama con atención exclusiva propia (XSA), GQA 2:1, RMSNorm pre-norm, SwiGLU y RoPE con contexto de 2048 tokens. La innovación principal no está en el bloque transformer sino en el objetivo de entrenamiento: en lugar de predecir el siguiente token, el modelo aprende a rellenar tokens enmascarados mediante un proceso de difusión de tiempo continuo (ELBO negativo ponderado por 1/t). La generación se realiza por pasos de desenmascaramiento, no de forma autorregresiva.

Es relevante ahora porque se trata de un artefacto de investigación reproducible y con licencia Apache 2.0, orientado a estudiar leyes de escalado en modelos de difusión frente a autorregresivos, con foco explícito en IA soberana del Reino Unido (fuentes parlamentarias, del sector público y de lenguas celtas). No es un modelo de instrucciones ni ha pasado por ajuste de seguridad: es una base para experimentación, no para producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención exclusiva propia (XSA), GQA 2:1, RMSNorm pre-norm, SwiGLU, RoPE |
| Parametros totales | 1.028.812.800 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`: `modeling_vectabass.py`) |

Detalles adicionales de la arquitectura:

| Parametro | Valor |
|---|---|
| Parametros no-embedding | 919.351.296 |
| Anchura | 2176 |
| Capas | 18 |
| Cabezas | 34 query, 17 key-value, dimensión 64 |
| Feed-forward | SwiGLU, 5648 |
| Token de máscara | id 50283 |
| Vocabulario | 50304 filas: GPT-2 BPE (50257) + 26 tokens especiales, resto padding |
| Tamaño del repo | 2,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de 18 capas y anchura 2176, con atención bidireccional (no causal), GQA con ratio 2:1 (34 cabezas de consulta, 17 de clave-valor, dimensión 64) y atención exclusiva propia (XSA). El objetivo de entrenamiento es MDLM con un alpha_t lineal igual a 1 - t; la pérdida es el ELBO negativo en tiempo continuo, es decir, una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. El token de máscara tiene id 50283 y los embeddings están atados.

Se entrenó sobre 60.800.696.320 tokens, lo que equivale a 66 tokens por parámetro no-embedding. El batch fue de 851.968 tokens. El optimizador combina Muon (para matrices ocultas, con NS 5, Moonlight RMS 0.2 y momento 0.95) con AdamW en fp32 (betas 0.9 y 0.95). El LR pico fue 0,000887, con un calentamiento de 919M tokens, un tramo constante y un cooldown 1-sqrt hasta cero en el último 20 % del entrenamiento. El weight decay fue 0,0604 sobre matrices. Se usó precisión bf16 en pesos y activaciones, pesos maestros fp32 en el optimizador, y estadísticas de normalización, ángulos RoPE y logits en fp32. El entrenamiento se ejecutó en 2 x NVIDIA GH200 de 120 GB.

Los datos provienen de la vista de la fase 1: 47 bins de texto con licencia abierta, unos 96.000 millones de tokens únicos, incluyendo fuentes del sector público y parlamentario del Reino Unido y de lenguas celtas. Las fuentes citadas son HuggingFaceFW/fineweb-edu, HuggingFaceFW/fineweb-2 y HuggingFaceTB/finemath. El detalle de cada bin, su proporción y su licencia está en el fichero `DATA.md` del repositorio.

## Capacidades

- Modelado de lenguaje por difusión enmascarada: rellena posiciones enmascaradas de forma bidireccional, con distribución del token limpio en cada posición.
- Extracción de características (pipeline declarado: `feature-extraction`), gracias a que la atención es bidireccional.
- Generación de texto mediante `diffusion_generate`, con dos órdenes de desenmascaramiento: `random` (el proceso inverso para el que fue entrenado) y `confidence` (estilo MaskGIT, compromete primero las posiciones más seguras).
- Relleno condicionado (infilling) de huecos arbitrarios dentro de una secuencia, ya que el token de máscara puede colocarse en cualquier posición.
- Multilingüismo limitado a siete idiomas: inglés, galés (cy), gaélico escocés (gd), irlandés (ga), manés (gv), córnico (kw) y escocés (sco).
- Capacidad de servir como referencia para verificar leyes de escalado frente a un modelo autorregresivo equivalente del mismo tamaño y datos.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No está ajustado a instrucciones ni a seguridad: no es un modelo de chat.

## Casos de uso

- Investigación sobre leyes de escalado: el modelo es una celda concreta de una escalera de tamaños y presupuestos de tokens; se usa para medir el ELBO negativo frente al presupuesto de cómputo y compararlo con el cuadrado autorregresivo equivalente publicado por el mismo autor.
- Estudio comparativo difusión vs. autorregresivo: al compartir datos y escalera con el cuadrado AR, permite aislar el efecto del objetivo de entrenamiento sobre la calidad del modelado con un canon de evaluación común (phase-1-release canon-8192).
- Relleno de texto (infilling) en documentos: colocando el token de máscara 50283 en las posiciones desconocidas, el modelo devuelve la distribución del token limpio en cada hueco; útil para reconstrucción de fragmentos o tareas de denoising controladas.
- Extracción de representaciones bidireccionales: al ser un transformer no causal, las activaciones por posición incorporan contexto a izquierda y derecha, lo que sirve como encoder para clasificación o clustering sobre texto en inglés y lenguas celtas.
- Experimentación con muestreo en difusión: el repositorio documenta una comparación de unos 30 samplers sobre 32 arranques de documento retenidos; sirve como banco de pruebas para estudiar orden de desenmascaramiento, penalizaciones de presencia y compromiso por pasos.
- Procesamiento de lenguas celtas de bajos recursos: el entrenamiento incluye fuentes en galés, gaélico escocés, irlandés, manés, córnico y escocés, lo que permite estudiar el comportamiento de un MDLM en idiomas con poca representación.
- Docencia y reproducción de resultados: el autor afirma que los pesos del repo reproducen bit a bit los logits del código de entrenamiento sobre filas enmascaradas del canon, lo que facilita la verificación independiente.

## Benchmarks y rendimiento

El autor no publica benchmarks zero-shot para los modelos MDLM. La única métrica de evaluación reportada es el ELBO negativo sobre el canon retenido phase-1-release canon-8192 (8192 x 2048 tokens, 16 extracciones de máscara por secuencia):

| Metrica | Valor |
|---|---|
| ELBO negativo (16 extracciones) | 2,3329 ± 0,0025 nats por token |
| ELBO negativo (estimación independiente, 1 extracción, bajo PyTorch SDPA) | 2,3313 ± 0,0099 nats por token |
| MMLU, HumanEval, GSM8K y similares | no medidos |

El autor advierte que el ELBO negativo es una cota superior de la log-verosimilitud negativa y que, por tanto, solo puede compararse con la entropía cruzada de un modelo autorregresivo sobre el mismo canon como cota, no como medida equivalente.

La model card incluye además una comparación de calidad de muestreo (no de benchmarks estándar) sobre 32 arranques de documento retenidos, con prompt de 32 tokens, 256 tokens generados y una semilla, puntuada por Qwen3-8B-Base en bits por byte UTF-8. Los números corresponden a la celda N6-D5, no a esta:

| Sampler | Bits por byte | Bigramas distintos | 4-gramas repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7 % |
| confidence, argmax, penalización de presencia 4 incluyendo prompt | 0,64 | 0,74 | 18 % |
| Igual, sin penalización | 0,15 | 0,16 | 80 % |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22 % |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: unos 2,1 GB de pesos más activaciones y caché de atención; holgadamente por debajo de 8 GB en la práctica.
- Cabe en cualquier GPU de consumo con al menos 6-8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). No se documentan versiones cuantizadas, por lo que la inferencia en 4 bits requeriría cuantizar manualmente.
- GPU de centro de datos recomendadas: A100, H100 o GH200; el entrenamiento se hizo en 2 x GH200 de 120 GB, pero la inferencia no necesita ese perfil.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `dtype=torch.bfloat16`. El modelo requiere el módulo `modeling_vectabass.py` del repositorio y una función propia `diffusion_generate`; no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Cabe esperar que la generación sea costosa porque requiere `steps` pasadas forward completas; el autor recomienda `steps = gen_length` (256 pasos para 256 tokens), lo que implica 256 pasadas por generación. Reducir a 4 tokens por paso degrada la calidad (0,73 bits por byte, bigramas distintos 0,49).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-1.03b-60.8bt-mdlm-cooled | 1,029B totales (919M no-embedding) | 2048 | MDLM (difusión enmascarada) | Apache 2.0 | Base de estudio de escalado, sin benchmarks zero-shot |
| Cuadrado AR de VectaBass (misma escalera, publicado aparte) | misma escalera de 100M a 1.6B | no disponible | Autorregresivo | no disponible | Entrenado con los mismos datos; referencia directa para comparar objetivos |
| Otros MDLM de escala similar | no disponible | no disponible | Difusión enmascarada | no disponible | No se han identificado en la información proporcionada |

La comparación más significativa es interna: el cuadrado autorregresivo del mismo autor, con idénticos datos y escalera, que permite contrastar el ELBO negativo del MDLM con la entropía cruzada del AR sobre el mismo canon. No se dispone de datos para comparar con modelos de difusión de terceros.

## Limitaciones y advertencias

- No está ajustado a instrucciones ni a seguridad; no debe usarse como asistente conversacional sin un ajuste posterior.
- El autor advierte explícitamente de que los hechos generados suelen ser incorrectos; el riesgo de alucinación es alto en generación libre.
- El muestreo por confianza sin penalización de presencia entra en bucles: con penalización 0 los 4-gramas repetidos alcanzan el 80 %. La penalización de 4 es una heurística probada, no un muestreo exacto, y sesga contra palabras repetidas; listas, tablas y código no se evaluaron y las listas siguen repitiéndose.
- El muestreo ancestral exacto es mucho menos fluido que el modelo autorregresivo del mismo tamaño; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Los resultados de muestreo se basan en una sola semilla y 32 prompts, con errores estándar de unos 0,06 bits por byte.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a siete idiomas, con sesgo hacia el inglés y fuentes del Reino Unido; el rendimiento en otros idiomas no está documentado.
- No se han medido benchmarks zero-shot, por lo que no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas estándar.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin ajuste de seguridad, el usuario asume la responsabilidad del filtrado y la evaluación.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_vectabass.py` antes de desplegarlo.
- El repositorio tiene 2 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación con poca validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VectaBass/vectabass-1.03b-60.8bt-mdlm-cooled
- Fichero de datos del autor: `DATA.md` en el repositorio (detalle de bins, proporciones y licencias)
- Código de modelado: `modeling_vectabass.py` en el repositorio
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath

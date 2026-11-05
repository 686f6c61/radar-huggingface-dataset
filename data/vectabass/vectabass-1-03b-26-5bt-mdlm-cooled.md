# VectaBass/vectabass-1.03b-26.5bt-mdlm-cooled

## Resumen

vectabass-1.03b-26.5bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, *masked diffusion language model*) de 1.028 millones de parámetros totales (919,4 millones sin embeddings), desarrollado por VectaBass dentro de un estudio de leyes de escala para IA soberana del Reino Unido. Se trata de una celda concreta (N5-D3) de una matriz de modelos MDLM que abarca desde 100 millones hasta 1.600 millones de parámetros sin embeddings, cada tamaño entrenado con varios presupuestos de tokens y publicados en conjunto para poder verificar empíricamente la ley de escala.

El modelo se entrena desde cero sobre 26.465 millones de tokens (29 tokens por parámetro no-embedding) procedentes de fineweb-edu, fineweb-2 y finemath, con fuentes adicionales del sector público británico, parlamentarias y de lenguas celtas. La arquitectura es un transformer tipo Llama con atención bidireccional, atención exclusiva (XSA) y GQA 2:1, adaptado al objetivo de difusión enmascarada con un schedule lineal alpha_t = 1 - t y una pérdida de ELBO negativo en tiempo continuo.

Su relevancia es doble: por un lado, es material de referencia para investigadores que estudian leyes de escala en modelos de difusión frente a autorregresivos; por otro, demuestra un flujo de generación no autorregresivo (rellenado iterativo de máscaras) sobre un vocabulario GPT-2 BPE con contexto de 2.048 tokens. Es un modelo base, sin ajuste por instrucciones ni por seguridad, y no se han publicado benchmarks de zero-shot para esta familia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama bidireccional con atención exclusiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE base 10000 |
| Parámetros totales | 1.028.812.800 (embeddings atados) |
| Parámetros activos | No aplica (no es MoE) |
| Parámetros sin embeddings | 919.351.296 |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible (entrenado y recomendado en bf16) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code` para `modeling_vectabass.py`) |
| Anchura / capas | 2.176 / 18 |
| Cabezas | 34 query, 17 key-value, dimensión 64 |
| Feed-forward | SwiGLU, dimensión 5.648 |
| Token de máscara | id 50283 |
| Vocabulario | 50.304 filas: GPT-2 BPE (50.257) más 26 tokens especiales, resto padding |
| Tamaño del repo | 2,1 GB |

## Arquitectura y entrenamiento

La red es el stack tipo Llama de los modelos autorregresivos del mismo autor, con atención exclusiva (XSA) y hecho bidireccional. La atención es bidireccional con GQA 2:1 (34 cabezas query, 17 key-value de dimensión 64), feed-forward SwiGLU de 5.648, normalización RMSNorm en pre-norm y posiciones RoPE con base 10.000 hasta 2.048 tokens. El vocabulario es GPT-2 BPE ampliado con 26 tokens especiales hasta 50.304 filas. El objetivo es MDLM con schedule lineal alpha_t = 1 - t: la pérdida es el ELBO negativo en tiempo continuo, es decir, una entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones.

El entrenamiento consumió 26.465.533.952 tokens con un batch de 851.968 tokens, optimizador Muon (matrices ocultas, NS 5, Moonlight RMS 0.2, momentum 0.95) combinado con AdamW fp32 (0.9, 0.95), pico de learning rate 0.000887, warmup de 919 millones de tokens y schedule warmup-constant con cooldown 1-sqrt hasta cero en el último 20 %. El weight decay es 0.0604 sobre matrices. Se usó precisión bf16 en pesos y activaciones, pesos maestros fp32 en el optimizador y estadísticas de norma, ángulos RoPE y logits en fp32. Todo el entrenamiento corrió en una única NVIDIA GH200 de 120 GB. Los datos provienen de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96.000 millones de tokens únicos, con fuentes del sector público británico, parlamentarias y de lenguas celtas; el detalle por bin, cuota y licencia está en `DATA.md`.

## Capacidades

- Generación de texto no autorregresiva mediante rellenado iterativo de máscaras (`diffusion_generate`), con orden aleatorio (el del entrenamiento) u orden por confianza estilo MaskGIT.
- Rellenado condicionado: `model(ids).logits` devuelve, en cada posición, la distribución del token limpio; basta con colocar el token de máscara (id 50283) donde el token es desconocido.
- Extracción de características (pipeline `feature-extraction`) y acceso a logits por posición.
- Cobertura multilingüe limitada a inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- No dispone de tool calling, function calling ni soporte de agentes: es un modelo base sin ajuste por instrucciones.
- No dispone de modo thinking, visión ni audio.
- Sin ajuste de seguridad ni de instrucciones; no es apto para uso conversacional directo sin post-entrenamiento.

## Casos de uso

- Estudio de leyes de escala en difusión: el modelo es una celda de una matriz de tamaños y presupuestos de tokens publicada junto al resto, de modo que un investigador puede ajustar curvas de pérdida frente a parámetros y tokens y compararlas con la matriz autorregresiva equivalente.
- Investigación sobre decodificación no autorreguladora: sirve para reproducir y comparar samplers (orden aleatorio ancestral frente a orden por confianza con penalización de presencia 4,0) sobre arranques de documento reservados, midiendo bits por byte UTF-8, bigramas distintos y 4-gramas repetidos.
- Rellenado de texto enmascarado: al predecir el token limpio en cada posición, puede emplearse para completar huecos en documentos con contexto de hasta 2.048 tokens, por ejemplo en tareas de infilling controlado en inglés.
- Procesamiento de lenguas celtas y del Reino Unido: al incluir fuentes parlamentarias y del sector público británico, es útil para experimentos de modelado sobre galés, gaélico escocés, irlandés, manés, córnico y escocés, siempre como modelo base.
- Docencia y reproducción de experimentos: con 2,1 GB de repo y ejecución en bf16, cabe en una GPU consumer de gama alta y permite reproducir el pipeline completo de difusión enmascarada con `transformers` y `trust_remote_code`.
- Evaluación de métricas de fluidez: el modelo y su protocolo de evaluación (bits por byte con Qwen3-8B-Base como juez, diversidad de bigramas y repetición de 4-gramas) sirven como banco de pruebas para métricas de calidad en modelos de difusión.
- Análisis de eficiencia de muestreo: permite medir el coste de `steps = gen_length` frente a varios tokens por paso (4 tokens por paso degrada a 0,73 bits por byte y 0,49 de bigramas distintos), útil para estudiar el compromiso calidad-latencia en decodificación paralela.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks zero-shot para los modelos MDLM de esta familia. La única métrica de evaluación publicada es el ELBO negativo sobre el canon reservado phase-1-release (8.192 secuencias de 2.048 tokens, 16 sorteos de máscara por secuencia):

| Métrica | Valor |
|---|---|
| ELBO negativo en canon-8192 (16 sorteos) | 2,4501 ± 0,0025 nats por token |
| ELBO negativo, estimación independiente a un sorteo con PyTorch SDPA | 2,4486 ± 0,0100 nats por token |
| Bits por byte, continuación real (referencia) | 0,66 |
| Bits por byte, confidence + argmax + penalización 4,0 (celda N6-D5) | 0,64 |
| Bits por byte, mismo sampler sin penalización (celda N6-D5) | 0,15 |
| Bits por byte, orden aleatorio con muestreo ancestral exacto (celda N6-D5) | 1,39 |
| Bigramas distintos, confidence + argmax + penalización 4,0 | 0,74 |
| 4-gramas repetidos, confidence + argmax + penalización 4,0 | 18 % |

Los datos de sampler corresponden a la celda N6-D5, no a esta celda, y se obtuvieron sobre 32 arranques de documento reservados con prompt de 32 tokens, 256 tokens generados y una semilla; el error estándar en bits por byte es de aproximadamente 0,06. El ELBO negativo es una cota superior del log-likelihood negativo, por lo que solo es comparable con la entropía cruzada de un modelo autorregresivo como cota, no como medida equivalente.

## Requisitos de hardware

- Inferencia en bf16: los pesos ocupan aproximadamente 2,1 GB, por lo que una GPU consumer con 8 GB o más es suficiente; se recomienda al menos 12 GB para margen de activaciones y KV cache.
- GPU recomendadas: cualquier NVIDIA Ampere o superior (RTX 3090, RTX 4090, A100, H100, GH200). El entrenamiento se realizó en una única GH200 de 120 GB.
- Cabe en GPU consumer: sí, en RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes.
- Despliegue: `transformers` con `trust_remote_code=True` y el método `diffusion_generate` del módulo `modeling_vectabass.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el modelo no es autorregresivo y requiere el bucle de difusión personalizado.
- Latencia y throughput: no disponibles. El coste de generación escala con `steps`; la configuración recomendada usa un token por paso (`steps = gen_length`), de modo que generar 256 tokens requiere 256 pasadas forward.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-1.03b-26.5bt-mdlm-cooled | 1.028 M totales (919 M sin embeddings) | 2.048 | MDLM (difusión enmascarada) | Apache 2.0 | HuggingFace |
| Matriz autorregresiva de VectaBass (misma ladder y datos) | 100 M a 1.600 M sin embeddings | No disponible | Autorregresivo | No disponible | Publicada por separado según la model card |
| Resto de celdas MDLM de la matriz (100 M a 1.600 M) | 100 M a 1.600 M sin embeddings | No disponible | MDLM | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparables entre estas variantes; la model card solo indica que el muestreo ancestral exacto del MDLM es mucho menos fluido que el modelo autorregresivo del mismo tamaño, sin cifras publicadas para esa comparación.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escala: no está ajustado por instrucciones ni por seguridad, por lo que no debe usarse como asistente conversacional sin post-entrenamiento.
- Los hechos que genera suelen ser incorrectos, según advierte el propio autor.
- El sampler por confianza sin penalización de presencia entra en bucles: con penalización 0 los 4-gramas repetidos alcanzan el 80 %; la penalización 3 todavía repite y la 6 es menos fluida que el texto real. El valor probado es 4,0 e incluye el prompt en el recuento.
- La penalización de presencia es una heurística, no un muestreo exacto: sesga contra palabras repetidas y no se probó en listas, tablas ni código, donde la repetición es correcta; las listas siguen repitiéndose.
- Generar más de un token por paso degrada la calidad: 4 tokens por paso baja a 0,73 bits por byte y 0,49 de bigramas distintos.
- El muestreo ancestral exacto es mucho menos fluido que el modelo autorregresivo del mismo tamaño; temperatura, top-k, top-p y min-p intercambian fluidez por diversidad sin alcanzar el texto real.
- Contexto limitado a 2.048 tokens y cobertura lingüística restringida a siete idiomas (inglés y seis lenguas celtas o del Reino Unido).
- Los resultados de evaluación se basan en 32 prompts y una sola semilla, con error estándar de aproximadamente 0,06 en bits por byte; no hay benchmarks zero-shot publicados.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base sin ajuste de seguridad la responsabilidad sobre el comportamiento en producción recae en quien lo despliega.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio (`modeling_vectabass.py`); conviene auditar ese fichero antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VectaBass/vectabass-1.03b-26.5bt-mdlm-cooled
- Fichero `DATA.md` (bins, cuotas y licencias del dataset): referenciado en el repositorio de HuggingFace
- Fichero `modeling_vectabass.py` (implementación con `diffusion_generate`): incluido en el repositorio de HuggingFace
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper, blog y repositorio del autor: no disponibles en la información proporcionada

# VectaBass/vectabass-232m-140bt-mdlm-cooled

## Resumen

vectabass-232m-140bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, masked diffusion language model) de 231,8 millones de parámetros totales (173,9 millones sin contar embeddings), desarrollado por VectaBass en el contexto de un estudio de leyes de escala para IA soberana del Reino Unido. Se entrenó desde cero sobre 139.680 millones de tokens y constituye la celda N2-D5 de una matriz experimental que abarca modelos de 100M a 1.6B de parámetros no-embedding, cada uno entrenado con varios presupuestos de tokens, con el objetivo de poder verificar empíricamente la ley de escala.

El modelo no es un asistente conversacional ni está alineado: es un modelo base pensado para investigación sobre modelos de difusión de lenguaje. Su arquitectura parte del stack tipo Llama de los modelos autorregresivos del mismo proyecto (atención exclusiva XSA, GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE con contexto de 2048), pero se convierte en bidireccional y se entrena con el objetivo de negative ELBO continuo en tiempo, en lugar de predicción del siguiente token.

Su relevancia radica en que permite comparar directamente, sobre los mismos datos y la misma escalera de tamaños, un modelo autorregresivo frente a uno de difusión, algo poco habitual en la literatura abierta. La licencia Apache 2.0 y su pequeño tamaño lo hacen accesible para experimentación en hardware modesto, aunque sus capacidades de generación son limitadas y requieren un sampler específico (orden por confianza con penalización de presencia) para producir texto fluido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención exclusiva (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE base 10000 |
| Parámetros totales | 231.800.832 (embeddings atados) |
| Parámetros activos | no aplica (no es MoE) |
| Parámetros no-embedding | 173.850.624 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible (el autor recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code`) |
| Anchura / capas | 1152 / 12 |
| Cabezas | 18 query, 9 key-value, dimensión 64 |
| Dimensión feed-forward | 3040 (SwiGLU) |
| Token de máscara | id 50283 |
| Vocabulario | 50304 filas: BPE de GPT-2 (50257) más 26 tokens especiales, el resto padding |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La red es el stack tipo Llama de los modelos autorregresivos del proyecto, con atención exclusiva (XSA) y GQA con ratio 2:1, pero con atención bidireccional en lugar de causal. El objetivo de entrenamiento es MDLM con un schedule lineal alpha_t = 1 - t: la pérdida es el negative ELBO en tiempo continuo, implementado como entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. En inferencia, el modelo recibe una secuencia con el token de máscara (id 50283) en las posiciones desconocidas y devuelve, en cada posición, la distribución del token limpio.

El entrenamiento se realizó sobre 139.682.250.752 tokens (803 tokens por parámetro no-embedding), con un batch de 622.592 tokens, optimizador Muon para matrices ocultas (NS 5, Moonlight RMS 0,2, momento 0,95) combinado con AdamW fp32 (0,9 / 0,95), LR pico de 0,00146, warmup de 174M tokens, schedule constante seguido de un cooldown 1-sqrt en el último 20 %, y weight decay de 0,0955 sobre matrices. Se usó precisión bf16 en pesos y activaciones con pesos maestros fp32 en el optimizador, y estadísticas de normalización, ángulos RoPE y logits en fp32. El hardware fueron 2 GPU NVIDIA GH200 de 120 GB.

Los datos proceden de la vista phase-1-release: 47 bins de texto con licencia abierta, unos 96B tokens únicos, incluyendo fuentes del sector público británico, parlamentarias y de lenguas celtas, además de fineweb-edu, fineweb-2 y finemath. El detalle de cada bin, su proporción y licencia está en el archivo `DATA.md` del repositorio.

## Capacidades

- Modelado de lenguaje mediante difusión enmascarada: rellena posiciones enmascaradas con el token limpio más probable.
- Generación de texto mediante `diffusion_generate`, con relleno iterativo de `gen_length` máscaras a lo largo de `steps` pasadas hacia delante.
- Dos modos de orden de desenmascarado: `order="random"` (proceso inverso exacto para el que fue entrenado) y `order="confidence"` (estilo MaskGIT, compromete primero las posiciones más seguras).
- Extracción de características (`feature-extraction` como pipeline declarado), gracias a su atención bidireccional.
- Cobertura multilingüe limitada a inglés y lenguas celtas: galés (cy), gaélico escocés (gd), irlandés (ga), manés (gv), córnico (kw) y escocés (sco).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo base sin instruction tuning.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre leyes de escala en modelos de difusión: el modelo es una celda concreta (N2-D5) de una matriz experimental; se usa para medir el negative ELBO en el canon retenido y contrastarlo con la celda autorregresiva equivalente.
- Estudio comparativo difusión vs. autorregresión: al compartir datos, tokenizador y escalera de tamaños con la matriz AR del proyecto, permite aislar el efecto del objetivo de entrenamiento sobre la pérdida y la fluidez.
- Experimentación con samplers de difusión: el autor documenta la comparación de unos 30 samplers sobre 32 inicios de documento; el modelo sirve como banco de pruebas para evaluar orden de desenmascarado, penalizaciones y número de tokens por paso.
- Extracción de características bidireccionales: al no ser causal, puede emplearse para obtener representaciones contextuales de secuencias completas en tareas de clasificación o clustering sobre texto en inglés y lenguas celtas.
- Investigación sobre cobertura de lenguas minoritarias: el entrenamiento incluye fuentes celtas del sector público británico, lo que permite estudiar el comportamiento de un modelo pequeño sobre galés, gaélico o irlandés en un régimen de datos limitado.
- Reproducibilidad de entrenamiento: los pesos reproducen bit a bit los logits del código de entrenamiento en filas enmascaradas del canon, lo que facilita validar pipelines de entrenamiento e inferencia propios.
- Docencia y prototipado en hardware de consumo: con 232M de parámetros y 0,5 GB de repositorio, cabe en una GPU consumer para demostraciones de modelos de difusión de lenguaje.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Negative ELBO en canon-8192 (8192 × 2048 tokens, 16 máscaras por secuencia) | 2,5302 ± 0,0028 nats por token |
| Negative ELBO con una sola máscara, bajo SDPA (estimación independiente) | 2,5251 ± 0,0100 nats por token |
| Bits por byte, sampler recomendado (confidence, argmax, penalización 4, celda N6-D5) | 0,64 |
| Bigramas distintos, sampler recomendado | 0,74 |
| 4-gramas repetidos, sampler recomendado | 18 % |
| Bits por byte, continuación real de referencia | 0,66 |
| Bits por byte, orden aleatorio con muestreo ancestral exacto | 1,39 |
| Bits por byte, confidence sin penalización | 0,15 (con 80 % de 4-gramas repetidos) |

Los benchmarks zero-shot (MMLU, HumanEval, GSM8K, etc.) no se midieron para los modelos MDLM, según indica el autor. Los datos de bits por byte corresponden a la celda N6-D5, no a esta celda, y se obtuvieron sobre 32 inicios de documento retenidos con un prompt de 32 tokens, 256 tokens generados y una sola semilla; el error estándar en bits por byte es de aproximadamente 0,06.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 231,8M de parámetros ocupan aproximadamente 0,46 GB de pesos; con activaciones y caché para contexto de 2048, el consumo se mantiene por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU con soporte bf16; el autor entrenó con 2 × NVIDIA GH200 de 120 GB, pero para inferencia es sobredimensionado.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, e incluso en iGPU con suficiente memoria.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `dtype=torch.bfloat16`; el código de modelado (`modeling_vectabass.py`) se carga desde el repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El coste de generación escala con `steps`; el autor recomienda `steps = gen_length` (un token por paso), por lo que generar 256 tokens requiere 256 pasadas hacia delante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vectabass-232m-140bt-mdlm-cooled | 231,8M totales (173,9M no-embedding) | 2048 | Difusión enmascarada (MDLM) | Apache 2.0 | Hugging Face |
| Celda AR equivalente del proyecto VectaBass | misma escalera de tamaños, entrenada con los mismos datos | no disponible | Autorregresivo | no disponible en la información | liberada por separado según el autor |
| Celda N6-D5 del mismo proyecto | mayor que 173,9M no-embedding (tamaño exacto no disponible) | no disponible | Difusión enmascarada | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks zero-shot que permitan comparar el rendimiento con modelos de propósito general de tamaño similar; el autor indica explícitamente que no se midieron.

## Limitaciones y advertencias

- Modelo base sin instruction tuning ni safety tuning: no está pensado para uso conversacional ni para producción directa.
- Las generaciones contienen con frecuencia hechos incorrectos, según advierte el propio autor.
- Sin penalización de presencia, el orden por confianza entra en bucles de repetición; con penalización 3 todavía repite y con 6 pierde fluidez. El valor probado es 4, incluyendo el prompt en el recuento.
- El sampler recomendado es una heurística, no un muestreo exacto: sesga contra palabras repetidas y no se probó en listas, tablas ni código, donde la repetición es correcta; las listas siguen repitiéndose.
- Usar más de un token por paso degrada la calidad (0,73 bits por byte y 0,49 de bigramas distintos con 4 tokens por paso).
- El muestreo ancestral exacto es mucho menos fluido que el modelo autorregresivo del mismo tamaño; temperatura, top-k, top-p y min-p no alcanzan la fluidez de texto real.
- Contexto limitado a 2048 tokens y cobertura lingüística restringida a inglés y lenguas celtas; no se declara soporte de castellano.
- La evaluación se hizo con una sola semilla y 32 prompts, con error estándar de unos 0,06 bits por byte; los resultados deben interpretarse con cautela.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de investigación sin alineación, el usuario asume el riesgo de los contenidos generados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-232m-140bt-mdlm-cooled
- Documentación de datos del proyecto (`DATA.md`): referenciada en la model card, dentro del repositorio del modelo
- Código de modelado (`modeling_vectabass.py`): incluido en el repositorio del modelo
- Paper o blog del estudio de leyes de escala: no disponible en la información proporcionada
- Repositorio del proyecto VectaBass: no disponible en la información proporcionada

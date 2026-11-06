# VectaBass/vectabass-374m-5.01bt-mdlm-cooled

## Resumen

vectabass-374m-5.01bt-mdlm-cooled es un modelo de lenguaje de difusión enmascarada (MDLM, *Masked Diffusion Language Model*) de 374 millones de parámetros totales (303,1 millones sin contar embeddings), desarrollado por el autor independiente VectaBass en el marco de su iniciativa "uk-sovereign-ai". No es un modelo conversacional ni un asistente: es una celda concreta (N3-D1) de un estudio de leyes de escala (*scaling laws*) que compara modelos de difusión con modelos autorregresivos entrenados sobre exactamente los mismos datos y la misma escalera de tamaños.

El modelo se entrena desde cero sobre 5.014 millones de tokens (17 tokens por parámetro no-embedding) procedentes de FineWeb-Edu, FineWeb-2 y FineMath, con un sesgo explícito hacia fuentes del sector público británico, textos parlamentarios y lenguas celtas. La arquitectura es un transformer tipo Llama (GQA 2:1, SwiGLU, RMSNorm, RoPE con contexto de 2048) con atención exclusiva auto-atencional (XSA) convertida en bidireccional, y el objetivo de entrenamiento es el ELBO negativo en tiempo continuo de MDLM, no la predicción del siguiente token.

Su relevancia es metodológica más que práctica: publica junto a una escalera completa de modelos AR equivalentes para que la comunidad pueda verificar empíricamente cómo escala la difusión frente a la autoregresión. No está ajustado a instrucciones ni a seguridad, y sus propios autores advierten que los hechos que genera suelen ser incorrectos. La licencia Apache 2.0 y el soporte de siete idiomas (inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés) lo hacen útil como objeto de investigación y como extractor de características, no como producto final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional tipo Llama con atención exclusiva auto-atencional (XSA), GQA 2:1, SwiGLU, RMSNorm pre-norm, RoPE base 10000 |
| Parametros totales | 373.942.272 (embeddings atados) |
| Parametros activos | No aplica (modelo denso) |
| Parametros sin embeddings | 303.114.240 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (el autor recomienda ejecutar en bf16, tal como se entrenó) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código de modelado propio, `modeling_vectabass.py`) |
| Anchura / capas | 1408 / 13 |
| Cabezas | 22 de consulta, 11 de clave-valor, dimensión 64 |
| Feed-forward | SwiGLU, dimensión 4112 |
| Token de máscara | id 50283 |
| Vocabulario | 50.304 filas: BPE de GPT-2 (50.257) más 26 tokens especiales y relleno |
| Pipeline declarado | feature-extraction |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La red reutiliza el stack de los modelos autorregresivos de la misma familia (tipo Llama) pero sustituye la atención causal por atención bidireccional y añade atención exclusiva auto-atencional (XSA). El objetivo es MDLM con un *schedule* lineal (alpha_t = 1 - t): la pérdida es el ELBO negativo en tiempo continuo, implementado como entropía cruzada enmascarada ponderada por 1/t sobre todas las posiciones. En inferencia, el modelo recibe una secuencia con tokens de máscara (id 50283) en las posiciones desconocidas y devuelve, en cada posición, la distribución del token limpio; la generación se realiza rellenando iterativamente las máscaras mediante `diffusion_generate`.

El entrenamiento consumió 5.014.355.968 tokens con un tamaño de lote de 622.592 tokens, usando Muon para las matrices ocultas (NS 5, Moonlight RMS 0,2, momento 0,95) combinado con AdamW en fp32 (0,9, 0,95), un LR pico de 0,00124, calentamiento de 303 millones de tokens, fase constante y un *cooldown* 1-sqrt hasta cero en el último 20 %. El *weight decay* fue de 0,0842 sobre matrices. Se entrenó en bf16 con pesos maestros en fp32, estadísticas de normalización, ángulos RoPE y logits en fp32, sobre una única NVIDIA GH200 de 120 GB. Los datos provienen de la vista "phase-1-release": 47 contenedores de texto con licencia abierta (~96.000 millones de tokens únicos), incluyendo fuentes del sector público británico, parlamentarias y de lenguas celtas; el desglose completo está en `DATA.md`.

## Capacidades

- Modelado de lenguaje enmascarado: reconstrucción de tokens ocultos en cualquier posición de una secuencia de hasta 2048 tokens.
- Generación de texto mediante difusión iterativa (`diffusion_generate`) con dos modos de orden de desenmascarado: aleatorio (el proceso inverso para el que fue entrenado) y por confianza (estilo MaskGIT).
- Extracción de características y representaciones contextuales bidireccionales (pipeline declarado: feature-extraction).
- Cobertura multilingüe limitada a siete idiomas: inglés, galés, gaélico escocés, irlandés, manés, córnico y escocés.
- Evaluación de verosimilitud mediante ELBO negativo sobre secuencias arbitrarias, útil para investigación en leyes de escala.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso orientado a agentes, ni modo *thinking*, ni visión, ni audio.
- No está ajustado a instrucciones ni a seguridad: no es un modelo de chat.

## Casos de uso

- Investigación en leyes de escala: comparar el ELBO negativo de este modelo (2,8729 ± 0,0026 nats por token sobre el canon retenido) con la entropía cruzada de su equivalente autorregresivo del mismo tamaño y presupuesto de tokens, para contrastar empíricamente ambas familias.
- Estudio de muestreadores de difusión: el autor publica una comparativa de ~30 muestreadores sobre 32 inicios de documento retenidos; este modelo sirve como banco de pruebas reproducible para medir fluidez (bits por byte UTF-8), diversidad de bigramas y repetición de 4-gramos.
- Extracción de características para texto en lenguas celtas: al haberse entrenado con fuentes específicas de galés, gaélico, irlandés, manés, córnico y escocés, puede generar representaciones contextuales bidireccionales para tareas de clasificación o agrupamiento en esos idiomas de bajos recursos.
- Rellenado de texto (*text infilling*) en documentos: dado un fragmento con huecos, el modelo predice los tokens enmascarados, útil para reconstrucción de corpus dañados o para aumentar datos de entrenamiento.
- Análisis de dominio parlamentario y del sector público británico: la composición del corpus incluye fuentes parlamentarias y administrativas, por lo que las representaciones capturan vocabulario institucional específico.
- Docencia y reproducción de resultados: al ser una celda de una escalera publicada con código propio y pesos abiertos, permite reproducir el entrenamiento y la evaluación en una sola GPU de 120 GB.
- Evaluación de sesgos y alucinación en modelos de difusión: útil para estudiar cómo se distribuyen los errores fácticos en modelos generativos no autorregresivos.

## Benchmarks y rendimiento

El autor no publica benchmarks zero-shot para los modelos MDLM ("Zero-shot benchmarks are not measured for the MDLM models"). La única métrica de evaluación es el ELBO negativo sobre el canon retenido phase-1-release canon-8192 (8192 secuencias de 2048 tokens, 16 extracciones de máscara por secuencia).

| Metrica | Valor |
|---|---|
| ELBO negativo (canon retenido, 16 extracciones) | 2,8729 ± 0,0026 nats por token |
| ELBO negativo (estimación independiente, una extracción, PyTorch SDPA) | 2,8718 ± 0,0103 nats por token |
| MMLU, HumanEval, GSM8K u otros | No medidos |

El autor advierte que el ELBO negativo es una cota superior de la log-verosimilitud negativa y solo puede compararse con la entropía cruzada de un modelo AR como cota, no como medida equivalente. Los pesos de este repositorio reproducen bit a bit los logits del código de entrenamiento sobre filas enmascaradas del canon.

Resultados de muestreo publicados para la celda N6-D5 (32 inicios de documento retenidos, prompt de 32 tokens, 256 tokens generados, una semilla):

| Muestreador | Bits por byte | Bigramas distintos | 4-gramos repetidos |
|---|---|---|---|
| Continuación real | 0,66 | 0,80 | 7 % |
| Confianza, argmax, penalización de presencia 4 (incluye prompt) | 0,64 | 0,74 | 18 % |
| Igual, sin penalización | 0,15 | 0,16 | 80 % |
| Orden aleatorio, muestreo ancestral exacto | 1,39 | 0,66 | 22 % |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,75 GB para los pesos (373,9 M de parámetros), más activaciones y caché; cabe holgadamente en cualquier GPU consumer con 8 GB o más.
- Entrenamiento original: 1 × NVIDIA GH200 de 120 GB.
- GPU recomendadas para inferencia: cualquier GPU con soporte bf16 (RTX 30xx/40xx, A100, H100, L40S); no requiere memoria distribuida.
- Cabe en GPU consumer: sí, en todas las RTX modernas y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio para cargar `modeling_vectabass.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el pipeline de difusión no es compatible de forma estándar con esos motores.
- Latencia y throughput: no disponibles. Nótese que `diffusion_generate` con la configuración recomendada ejecuta `steps = gen_length` pasadas hacia delante (256 pasos para 256 tokens), lo que implica un coste computacional muy superior al de un modelo autorregresivo equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| vectabass-374m-5.01bt-mdlm-cooled | 374 M (303 M sin embeddings) | 2048 | MDLM (difusión enmascarada) | Apache 2.0 | Celda de estudio de escalado; sin benchmarks zero-shot |
| Modelo AR equivalente de VectaBass (misma escalera) | ~374 M | 2048 | Autorregresivo | No disponible en la informacion | Entrenado sobre los mismos datos; liberado por separado |
| Qwen3-8B-Base | 8 B | No disponible en la informacion | Autorregresivo | No disponible en la informacion | Usado por el autor como evaluador de fluidez, no como comparable directo |
| Otros MDLM de tamano similar | No disponible | No disponible | Difusión enmascarada | No disponible | No se dispone de comparables publicados en la informacion proporcionada |

La comparación más directa es con el modelo autorregresivo de la misma escalera y presupuesto de tokens, que el autor libera por separado precisamente para permitir el contraste. El propio autor señala que el muestreo ancestral exacto del MDLM es "mucho menos fluido" que su modelo AR del mismo tamaño.

## Limitaciones y advertencias

- Modelo base sin ajuste a instrucciones ni a seguridad: no debe usarse como asistente conversacional sin un post-entrenamiento adicional.
- Alucinación fáctica elevada: el autor afirma explícitamente que "los hechos suelen ser incorrectos".
- El muestreador recomendado (confianza + argmax + penalización de presencia 4) es una heurística, no un muestreo exacto: sesga contra palabras repetidas y las listas y tablas tienden a repetirse; no se probaron listas, tablas ni código.
- Sin penalización de presencia, el orden por confianza entra en bucles (80 % de 4-gramos repetidos); con penalización 3 todavía repite y con 6 pierde fluidez frente al texto real.
- Debe generarse un token por paso (`steps = gen_length`); usar 4 tokens por paso degrada la calidad (0,73 bits por byte, bigramas distintos 0,49).
- El muestreo ancestral exacto, aunque correcto desde el punto de vista distribucional, produce texto mucho menos fluido que el modelo AR equivalente; temperatura, top-k, top-p y min-p no alcanzan la fluidez del texto real.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a siete idiomas, con sesgo hacia inglés y lenguas celtas; el rendimiento en castellano no está evaluado ni garantizado.
- Las estimaciones de fluidez se basan en una sola semilla y 32 prompts, con errores estándar de ~0,06 bits por byte.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene auditar `modeling_vectabass.py` antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-374m-5.01bt-mdlm-cooled
- Documentación de datos del autor: `DATA.md` en el repositorio del modelo
- Código de modelado: `modeling_vectabass.py` en el repositorio del modelo
- FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada

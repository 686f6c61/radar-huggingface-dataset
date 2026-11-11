# ThakiCloud/Thaki-Gibberish-KoEn-Experimental

## Resumen
Thaki-Gibberish-KoEn-Experimental es un clasificador binario de texto (`clean` / `gibberish`) desarrollado por ThakiCloud para coreano, ingles y texto mixto coreano-ingles. Su proposito es actuar como candidato detras de un escaner de tipo LLM Guard "Gibberish", detectando cadenas sin significado como pulsaciones aleatorias de teclado, silabas sueltas, ensalada de palabras o repeticiones, mientras deja pasar prosa normal, chat corto y codigo. Se construye como un fine-tune completo sobre el modelo base `jhu-clsp/mmBERT-small`, un transformer encoder de la familia ModernBERT con 140.642.306 parametros totales.

El modelo es experimental y su propio autor declara que no supero sus puertas de validacion: la decision de publicacion fue NO_GO, la seleccion en desarrollo obtuvo FAIL (15 de 16 puertas) y la reverificacion posterior resulto INCONCLUSIVE. Se publica unicamente para inspeccion y reproduccion de un resultado de investigacion, no como guardrail en produccion. Aun asi, sus resultados en el hold-out de desarrollo son notablemente superiores a los de alternativas publicas como el detector de LLM Guard original o `flowxai/gibberish`, lo que lo convierte en un caso de estudio interesante para quienes trabajan en filtrado de texto ruidoso.

La relevancia actual reside en que aborda un problema poco cubierto, la deteccion de gibberish multilingue con cobertura especifica de coreano, y lo hace con un encoder compacto (0.6 GB de repo) que puede ejecutarse en CPU. Su licencia es mixta: pesos y configuracion bajo CC BY-SA 4.0, codigo envoltorio bajo MIT.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, sobre `jhu-clsp/mmBERT-small`) |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncado fijo en la regla de decision); entrenamiento con max length 128 |
| Tipos de cuantizacion | no disponible (pesos en fp32; no se documentan GGUF ni otras) |
| Idiomas soportados | coreano (ko), ingles (en) y mezcla ko-en |
| Licencia | pesos y config CC BY-SA 4.0; codigo MIT (campo HF: `cc-by-sa-4.0-weights-mit-code`) |
| Formato de pesos | safetensors |
| Tarea | text-classification (binaria: clean / gibberish) |
| Tokenizer | no incluido en el repo; se carga de `jhu-clsp/mmBERT-small` revision `abc32620dd4f6ab06f5fbe905dc25f310618e09f` |
| Entorno probado | Python 3.11, torch 2.9.0 (CPU), transformers 5.14.1, tokenizers 0.22.2 |
| sha256 de pesos | `7e8bc65b6223569250c04f5f455742539a5219c9b779a0ad4cd3dad3f41a93c2` |

## Arquitectura y entrenamiento
El modelo es un fine-tune completo (full fine-tune) en fp32 del encoder `jhu-clsp/mmBERT-small`, con 3 epocas, batch 32, longitud maxima 128, learning rate 5e-5, pesos de clase por raiz cuadrada y semilla 0. El checkpoint se selecciono sobre una particion de desarrollo "tune" separada. La clasificacion se realiza aplicando softmax sobre los logits y tomando la probabilidad de `gibberish`; el texto se asigna a un bucket (`ko`, `en` o `mixed`) segun el recuento de silabas Hangul frente a letras latinas, y se marca como gibberish si supera el umbral especifico de su bucket.

El conjunto de entrenamiento consta de 145.532 ejemplos (46.498 limpios y 99.034 de gibberish). El texto limpio proviene de comentarios y resenas reales en coreano e ingles (KOTE, NSMC, GoEmotions, DynaSent), frases y titulos de Wikipedia, frases de Tatoeba, titulares KLUE-YNAT, lineas de codigo de paquetes Python con licencia permisiva y una pequena proporcion de frases cortas generadas por un modelo alojado por el propio autor. Los ejemplos de gibberish se generaron con generadores de ruido basados en reglas propios a partir del mismo texto limpio. No se usaron datos de AI-Hub ni APIs de pago.

La innovacion tecnica mas destacable es el diseno de la regla de decision: umbrales por bucket fijados como el percentil 99.5 de las puntuaciones de calibracion sobre texto limpio (punto de operacion `cal|single@0.005`) y congelados antes de abrir cualquier dato de evaluacion. Los umbrales son en 0.9949368248449096, ko 0.9967497597203979 y mixed 0.9918839941488037.

## Capacidades
- Clasificacion binaria de texto en `clean` o `gibberish` con probabilidad asociada (`p_gibberish`).
- Deteccion de ruido de teclado, silabas aleatorias, ensalada de palabras, palabras barajadas y repeticiones.
- Cobertura multilingue limitada a coreano, ingles y texto mixto coreano-ingles, con enrutamiento automatico por bucket.
- Diferenciacion entre prosa normal, chat corto y codigo fuente, que deberian pasar como limpios.
- Salida estructurada por texto con `bucket`, `p_gibberish`, `threshold` y `flagged`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un encoder clasificador.
- No es un modelo generativo; no produce texto.

## Casos de uso
- Filtrado previo de entradas de usuario en pipelines de LLM Guard: el modelo puede colocarse como escaner Gibberish antes de enviar texto a un LLM, marcando cadenas sin sentido y reduciendo el consumo de tokens en entradas basura.
- Limpieza de datasets de entrenamiento: se puede pasar cada registro por el clasificador para descartar comentarios y resenas que sean ruido, usando el umbral de bucket correspondiente para controlar falsos positivos.
- Moderacion de foros y secciones de comentarios coreanos e ingleses: detecta pulsaciones de teclado y ensalada de palabras manteniendo el texto legitimo, con la advertencia de que el FPR en mezcla/codigo no alcanzo la puerta de 0.01.
- Control de calidad en pipelines de scraping: descarta titulares y frases corruptas de Wikipedia o Tatoeba antes de indexar, aprovechando su entrenamiento con esas mismas fuentes.
- Preprocesado en sistemas de atencion al cliente: descarta mensajes sin contenido antes de encolar conversaciones multi-turno, aunque el modelo no gestiona contexto conversacional por si mismo.
- Investigacion y reproduccion: sirve como referencia reproducible para estudiar deteccion de gibberish multilingue y comparar contra el detector de LLM Guard original y `flowxai/gibberish`.
- Deteccion de codigo corrupto o lineas basura en repositorios: el bucket mixed/code esta disenado para incluir codigo Python, aunque su tasa de falsos positivos es la que fallo la puerta de validacion.

## Benchmarks y rendimiento
Hold-out de desarrollo prescrito (11.474 textos; mitad "hold" del conjunto de desarrollo):

| Medida | KO | EN | Mixed / code |
|---|---|---|---|
| AUROC (clean vs gibberish) | 0.994 | 0.999 | 0.998 |
| FPR, cota superior CP 95% (puerta <= 0.01) | 0.0084 | 0.0054 | 0.0133 (falla) |
| Recall medio por tipos de ruido (tipo mas bajo) | 0.931 (word shuffle 0.727) | 0.988 (word shuffle 0.966) | no disponible |

Resultado agregado: 15 de 16 puertas superadas; falla la puerta de FPR en mixed/code (2 de 541 textos limpios marcados), por lo que el checkpoint obtuvo DEV_SELECTION_FAIL.

Comparacion con alternativas en el mismo conjunto y puertas:

| Modelo | Puertas superadas (de 16) | AUROC KO | AUROC EN | AUROC mixed |
|---|---|---|---|---|
| Thaki-Gibberish-KoEn-Experimental | 15 | 0.994 | 0.999 | 0.998 |
| `madhurjindal/autonlp-Gibberish-Detector-492513457` (LLM Guard original) | 5 | 0.633 | 0.933 | 0.508 |
| `flowxai/gibberish` (sin cobertura coreana) | 4 | no disponible | no disponible | no disponible |

Reverificacion de seguimiento sobre datos nuevos (2026-11-09, una apertura, prescrita): resultado global INCONCLUSIVE; el propietario mantuvo FAIL y RELEASE_HOLD. El coste en CPU figura como COST_BLOCKED (no medido en benchmark aislado).

## Requisitos de hardware
- VRAM estimada para inferencia: alrededor de 0.6 GB en fp32 para el conjunto de pesos; al ser un encoder de 140 M de parametros, el uso de memoria es bajo.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) y en CPU.
- Probado oficialmente en CPU con Python 3.11, torch 2.9.0, transformers 5.14.1 y tokenizers 0.22.2; transformers 4.x no fue probado.
- Despliegue compatible con la libreria `transformers` y con endpoints compatibles (tag `endpoints_compatible`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- El widget de inferencia alojado en Hugging Face no funciona porque el tokenizer no esta incluido en el repo; hay que cargarlo desde `jhu-clsp/mmBERT-small`.
- Latencia y throughput: no disponible. El coste en CPU esta marcado como COST_BLOCKED y no medido en benchmark aislado.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento (hold-out propio) |
|---|---|---|---|---|---|
| Thaki-Gibberish-KoEn-Experimental | 140,6 M | 256 tokens (truncado) | ko, en, mixto | CC BY-SA 4.0 (pesos) / MIT (codigo) | 15/16 puertas; AUROC 0.994-0.999 |
| `madhurjindal/autonlp-Gibberish-Detector-492513457` (LLM Guard) | no disponible | no disponible | en (principalmente) | no disponible | 5/16 puertas; AUROC KO 0.633, EN 0.933, mixed 0.508 |
| `flowxai/gibberish` | no disponible | no disponible | en (sin coreano) | no disponible | 4/16 puertas |

Ningun modelo publico evaluado, incluido este, supero las 16 puertas del conjunto de desarrollo.

## Limitaciones y advertencias
- Estado experimental con veredicto explicito del autor: NO_GO para publicacion como producto, DEV_SELECTION_FAIL y reverificacion INCONCLUSIVE; no debe usarse como guardrail en produccion.
- Falla la puerta de tasa de falsos positivos en textos mixtos y de codigo (0.0133 frente al limite de 0.01): marca como gibberish aproximadamente 1 de cada 75 textos limpios en ese bucket.
- Recall bajo en ruido de tipo "word shuffle" en coreano (0.727), el peor tipo de ruido medido.
- El tokenizer no esta incluido en el repositorio; depende de una revision concreta de `jhu-clsp/mmBERT-small` y de sus propios terminos, lo que complica el despliegue y rompe el widget alojado.
- Licencia mixta: los pesos estan bajo CC BY-SA 4.0, lo que impone obligaciones de atribucion y comparticion bajo la misma licencia para obras derivadas; revisar `LICENSE.md` y `NOTICE.md` antes de uso comercial.
- Cobertura limitada a coreano e ingles; no hay validacion documentada para otros idiomas.
- Entrenado en parte con gibberish generado por reglas propias, lo que puede sesgar la deteccion hacia esos patrones de ruido y no hacia otros tipos no representados.
- Sin datos publicos de latencia, throughput ni coste en CPU (COST_BLOCKED), lo que dificulta estimar su coste operativo real.
- Riesgo de alucinacion no aplica al no ser generativo, pero si existe riesgo de clasificacion erronea en texto limpio atipico (jerga, abreviaturas, codigo ofuscado).

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-Gibberish-KoEn-Experimental
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-Gibberish-KoEn-Experimental/blob/main/MODEL_CARD.ko.md
- Licencia: https://huggingface.co/ThakiCloud/Thaki-Gibberish-KoEn-Experimental/blob/main/LICENSE.md
- Avisos y atribuciones de datos: https://huggingface.co/ThakiCloud/Thaki-Gibberish-KoEn-Experimental/blob/main/NOTICE.md
- Alternativa LLM Guard evaluada: https://huggingface.co/madhurjindal/autonlp-Gibberish-Detector-492513457
- Alternativa publica evaluada: https://huggingface.co/flowxai/gibberish

# Voyager466920/Raptor

## Resumen

Raptor es un modelo de lenguaje causal decoder-only desarrollado por el usuario Voyager466920 y publicado en Hugging Face. Se trata de un modelo base preentrenado desde cero (no ajustado por instrucciones) de 1.027 millones de parametros totales, con una arquitectura de mezcla de expertos (MoE) que activa aproximadamente 404 millones de parametros por token. La revision actual, denominada Raptor v2, se entrena sobre 50.000 millones de tokens de un subconjunto determinista de NVIDIA Nemotron-CC.

La relevancia de esta revision radica en dos cambios respecto a v1: un tokenizador nuevo de 35.000 tokens SentencePiece BPE con normalizacion identidad, preservacion de espacios en blanco y fallback de bytes UTF-8 (que elimina los `<unk>` que generaba v1 con saltos de linea, tabuladores y texto no latino), y un mayor presupuesto de entrenamiento (50.000 millones de tokens frente a 18.350 millones). La arquitectura y los hiperparametros del optimizador se mantienen sin cambios.

El modelo emplea atencion latente multi-cabeza, 18 capas, tamano oculto de 1.024 y seis expertos SwiGLU por capa con enrutamiento top-2. Su ventana de contexto es de 2.048 tokens. Es un modelo orientado al ingles, sin licencia definida, y su interes principal es como ejercicio de investigacion sobre arquitecturas MoE de escala pequena mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), atencion latente multi-cabeza |
| Parametros totales | 1.026.892.800 (1.027B) |
| Parametros activos | ~404M por token |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos almacenados en FP32; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles); el tokenizador admite texto no latino via fallback de bytes, pero la calidad es baja |
| Licencia | no disponible (el autor indica que no se ha seleccionado licencia) |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` por codigo personalizado) |

## Arquitectura y entrenamiento

Raptor v2 es un transformer decoder-only causal con 18 capas, tamano oculto de 1.024, 16 cabezas de atencion y una dimension de atencion latente de 256. Cada capa contiene seis expertos SwiGLU con tamano oculto de 2.816 y enrutamiento top-2, lo que da lugar a 1.027B parametros totales y unos 404M activos por token. El vocabulario es un SentencePiece BPE de 35.000 tokens con fallback de bytes UTF-8, normalizacion identidad y preservacion de espacios en blanco; los identificadores de tokens especiales se mantienen (pad 0, unk 1, bos 2, eos 3).

El entrenamiento utiliza un subconjunto determinista de NVIDIA Nemotron-CC (texto web de alta calidad mas un 25% de fragmentos sinteticos de QA diverso), con 288 fragmentos de entrenamiento y un total de 50.000 millones de tokens (95.368 pasos de optimizador x 524.288 tokens). Se emplea AdamW (beta 0,9 y 0,95; weight decay 0,1; gradient clip 1,0), con 400 pasos de calentamiento y decaimiento coseno de 2e-4 a 2e-5, en precision BF16 con pesos maestros FP32, sobre 2 GPU NVIDIA H200 con DDP durante aproximadamente 3,1 dias. La perdida de validacion final es 2,516 (perplejidad 12,38 con el tokenizador v2). Una limitacion tecnica importante es que la arquitectura recalcula el prefijo completo durante la generacion y no implementa cache KV, lo que penaliza fuertemente la latencia en decodificacion.

## Capacidades

- Generacion de texto causal en ingles a partir de un prefijo (modelo base, sin ajuste por instrucciones).
- Razonamiento de sentido comun basico y completado de frases, con rendimiento limitado a esta escala y presupuesto de tokens.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso: es un modelo base sin post-entrenamiento.
- Capacidades multilingues muy limitadas; el texto no latino se codifica byte a byte y era escaso en los datos de entrenamiento.
- No dispone de modo thinking, vision ni audio.
- Generacion de codigo debil, ya que los datos de entrenamiento contienen poco codigo fuente.

## Casos de uso

- Investigacion sobre arquitecturas MoE de escala pequena: util para estudiar el efecto del enrutamiento top-2 y la atencion latente en modelos de ~1B parametros, comparando v1 y v2 con el mismo harness de evaluacion.
- Experimentos de tokenizacion: el tokenizador v2 con preservacion de espacios y fallback de bytes permite analizar como afecta el round-trip sin perdida a tareas de continuacion de texto y a la perplexidad.
- Fine-tuning como base para tareas especificas del ingles: al ser un modelo base, sirve como punto de partida para ajuste supervisado en dominios concretos (clasificacion, extraccion, resumen) donde no se requiera instruccion zero-shot.
- Generacion de texto exploratoria y completado de parrafos en ingles: adecuado para prototipos de continuacion de texto donde la calidad no sea critica.
- Reproduccion de entrenamiento y estudios de escalado: la documentacion detallada de hiperparametros, hardware y numero de pasos facilita replicar o comparar configuraciones.
- Evaluacion comparativa de modelos pequenos: sus resultados publicados en lm-evaluation-harness permiten situarlo frente a SmolLM2-360M y SmolLM2-1.7B en tareas de conocimiento y sentido comun.

## Benchmarks y rendimiento

Resultados de lm-evaluation-harness 0.4.9.1, BF16, sin plantilla de chat, conjuntos de test completos, zero-shot salvo MMLU (5-shot). Cada celda muestra acc / acc_norm cuando existen ambos.

| Modelo | Tokens | ARC-e | ARC-c | HellaSwag | PIQA | WinoGrande | BoolQ | OBQA | SciQ | LAMBADA | MMLU (5) | Media (9) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Raptor v1 base | 18,4B | 58,9 / 53,5 | 26,3 / 27,7 | 35,8 / 45,0 | 70,1 / 70,0 | 51,5 | 61,0 | 20,0 / 31,6 | 86,4 / 76,7 | 34,0 | 26,9 | 49,3 / 50,1 |
| Raptor v2 base | 50B | 65,7 / 60,9 | 29,1 / 32,1 | 40,1 / 51,4 | 72,4 / 72,6 | 52,5 | 58,0 | 23,4 / 33,8 | 87,3 / 81,4 | 39,1 | 26,9 | 52,0 / 53,5 |
| SmolLM2-360M | ~4T | 70,4 / 68,2 | 36,4 / 38,5 | 43,0 / 56,4 | 71,9 / 71,5 | 59,4 | 62,1 | 24,6 / 38,0 | 90,9 / 86,5 | 53,3 | 25,3 | 56,9 / 59,3 |
| SmolLM2-1.7B | ~11T | 77,9 / 73,4 | 44,4 / 47,1 | 53,4 / 71,4 | 76,7 / 77,6 | 65,9 | 72,5 | 32,0 / 43,8 | 93,1 / 90,9 | 67,6 | 50,2 | 64,8 / 67,8 |

Perplejidad LAMBADA: Raptor v1 32,8; Raptor v2 21,3; SmolLM2-360M 9,4; SmolLM2-1.7B 4,4. Los recuentos de tokens de los modelos SmolLM2 corresponden a sus presupuestos de preentrenamiento publicados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2 GB solo para los pesos (1.027B parametros x 2 bytes), mas overhead de activaciones y del codigo personalizado; en FP32 (formato de almacenamiento) los pesos ocupan unos 4 GB.
- GPU recomendadas: el modelo cabe en GPU de consumo como RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) en BF16, con margen amplio.
- Cabe en GPU de consumo: si, incluidas tarjetas de 8-12 GB si se aplica cuantizacion (aunque el autor no documenta cuantizaciones oficiales).
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, y la ausencia de cache KV complica su integracion en estos motores.
- Latencia y throughput: no disponibles como cifras publicadas; la falta de cache KV implica que la generacion recalcula el prefijo completo en cada paso, lo que degrada la latencia de forma notable en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Media (9) acc / acc_norm |
|---|---|---|---|---|---|
| Raptor v2 base | 1.027B | ~404M | 2.048 | no disponible | 52,0 / 53,5 |
| SmolLM2-360M | 360M | 360M (denso) | no disponible en la informacion | no disponible en la informacion | 56,9 / 59,3 |
| SmolLM2-1.7B | 1,7B | 1,7B (denso) | no disponible en la informacion | no disponible en la informacion | 64,8 / 67,8 |

Raptor v2 queda por debajo de SmolLM2-360M pese a tener mas parametros totales, y muy por debajo de SmolLM2-1.7B, que fue entrenado con un presupuesto de tokens mucho mayor (~11T frente a 50B). La comparacion es ilustrativa del efecto del presupuesto de entrenamiento mas que de la arquitectura.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no sigue instrucciones de forma fiable.
- Enfocado al ingles; el texto no latino se codifica byte a byte y su calidad es pobre.
- Los datos de entrenamiento contienen poco codigo fuente, por lo que la generacion de codigo es debil.
- Los benchmarks de conocimiento tipo MMLU estan a nivel de azar a esta escala y presupuesto de tokens.
- Las salidas pueden ser repetitivas, inexactas, sesgadas o inseguras.
- La arquitectura recalcula el prefijo completo durante la generacion y no implementa cache KV, lo que limita su uso en produccion con secuencias largas.
- No hay licencia seleccionada: la disponibilidad publica no concede derechos de uso adicionales mas alla de la ley aplicable, lo que impide confirmar el uso comercial.
- Requiere `trust_remote_code=True` por el codigo personalizado de arquitectura y tokenizador, lo que implica ejecutar codigo del autor.
- Las cifras de perdida de validacion no son comparables entre v1 y v2 por el cambio de tokenizador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Voyager466920/Raptor
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- NVIDIA Nemotron-CC (fuente de datos citada): no disponible enlace directo en la informacion proporcionada
- Paper, blog o repositorio adicional del autor: no disponible

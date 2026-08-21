# YanZhanPKU/LaDiT-LLaDA-8B-Zh2En

## Resumen

LaDiT-LLaDA-8B-Zh2En es un adaptador LoRA oficial del proyecto Entropy-Valley, desarrollado por YanZhanPKU, que convierte el modelo base GSAI-ML/LLaDA-8B-Base en un sistema de traducción automática neuronal chino→inglés basado en difusión enmascarada. El adaptador se presenta junto con el método Entropy-Valley (EV), un selector de longitud de canvas sin entrenamiento que opera en tiempo de decodificación, y que resuelve el problema de la longitud fija de los modelos de difusión de lenguaje: un canvas demasiado corto omite contenido fuente, mientras que uno demasiado largo induce repeticiones. EV evalúa la entropía predictiva media del modelo congelado para cada longitud candidata y elige la mínima, mejorando la calidad de traducción sin necesidad de reentrenar el modelo.

El adaptador añade aproximadamente 157 millones de parámetros entrenables (1,95 % del total) sobre los 8 020 millones del modelo base, y se entrenó con 200 000 pares paralelos WMT19 zh-en durante tres épocas. Los resultados en el conjunto de test WMT22 Zh→En muestran una mejora significativa frente a la línea base de ratio fijo, con un cierre de brecha del 65,3 % respecto al oráculo de longitud, y una evaluación humana que confirma una ganancia de adecuación de +0,50 puntos. El modelo se distribuye bajo la licencia llada-8b-base-license y está disponible en formato safetensors compatible con PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion enmascarada (LLaDA-8B-Base) + adaptador LoRA |
| Parametros totales | 8 020 millones (base) + 157 millones (adaptador LoRA) |
| Parametros activos | 8 020 millones (el adaptador anade 157 M entrenables, pero la inferencia usa todos los parametros del base) |
| Longitud de contexto | 1024 tokens maximo (prompt fuente + canvas objetivo) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en bf16; el base admite cuantizacion estandar) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | llada-8b-base-license (otra, no permisiva estandar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

LLaDA-8B-Base es un modelo de difusion de lenguaje (masked diffusion) entrenado desde cero bajo el paradigma de pre-entrenamiento y ajuste supervisado (SFT). Emplea un transformer estandar que predice tokens enmascarados en un proceso de denoising iterativo, en lugar de la generacion autoregresiva clasica. El adaptador LaDiT-LLaDA-8B-Zh2En aplica LoRA con rango 64, alpha 128 y dropout 0,05 sobre las proyecciones q, k, v, o y las capas feed-forward (ff_proj, up_proj, ff_out) de cada uno de los 7 bloques del transformer. El entrenamiento se realizo con 200 000 pares paralelos WMT19 zh-en (configuracion enzh con roles intercambiados), optimizador AdamW (beta 0,9 y 0,95), peso de decaimiento 0,01, tasa de aprendizaje coseno con pico 2e-4 y 5 % de warm-up, tres epocas, batch global 128 y precision bf16, en 8 GPU H20-96GB durante aproximadamente 6 horas.

La innovacion principal no reside en el adaptador en si, sino en el metodo Entropy-Valley, que actua en tiempo de decodificacion. Para cada longitud candidata L, EV ejecuta una unica pasada forward con todos los tokens enmascarados y calcula la entropia predictiva media; luego decodifica con la longitud que minimiza esa entropia. El esquema de decodificacion usa MED (minimum-entropy decoding) con 32 pasos y truncamiento por EOS. El conjunto de longitudes candidatas se fija a partir de estadisticas de longitud del corpus de entrenamiento WMT19, no del conjunto de test.

## Capacidades

- Traduccion automatica chino→ingles de alta calidad, con mejora significativa frente a metodos de ratio fijo en terminos de COMET y sacreBLEU.
- Seleccion adaptativa de longitud de salida por frase, sin necesidad de entrenamiento adicional ni conocimiento de la longitud de referencia.
- Generacion de texto en ingles a partir de prompts en chino, aprovechando las capacidades generativas del modelo base LLaDA-8B.
- Soporte de decodificacion por difusion enmascarada con multiples pasos de denoising (T=32), lo que permite controlar el equilibrio entre calidad y coste computacional.
- No incluye soporte de tool calling, agentes ni razonamiento multi-paso; su funcion es exclusivamente traduccion.
- Capacidad multilingue limitada a chino e ingles, sin extension a otros idiomas.

## Casos de uso

- Traduccion de documentos tecnicos y cientificos: el modelo puede traducir articulos, informes y manuales del chino al ingles con una adecuacion semantica superior a la de metodos de ratio fijo, gracias a la seleccion de longitud por frase.
- Localizacion de software y aplicaciones: integrable en pipelines de localizacion para traducir cadenas de interfaz, mensajes de error y documentacion, con la ventaja de no requerir un modelo autoregresivo y de manejar contextos de hasta 1024 tokens.
- Subtitulado de video y transcripcion: adecuado para traducir subtitulos chinos a ingles, donde la longitud de la salida debe ajustarse a la duracion del dialogo; EV permite elegir la longitud optima por segmento.
- Traduccion de contenido web y articulos de prensa: puede desplegarse como servicio de traduccion en tiempo real para noticias o blogs, con latencia controlada por el numero de pasos de denoising (32 pasos por frase).
- Investigacion en traduccion automatica no autoregresiva: sirve como banco de pruebas para estudiar metodos de decodificacion por difusion, seleccion de longitud y evaluacion de calidad, ya que el codigo y los datos estan publicados.
- Generacion de datos paralelos sinteticos: el modelo puede usarse para crear pares zh-en adicionales a partir de texto chino, util para aumentar conjuntos de entrenamiento de otros sistemas de traduccion.

## Benchmarks y rendimiento

Los resultados publicados corresponden al conjunto de test WMT22 Zh→En News (N=2037), con decodificacion MED de 32 pasos y media ± desviacion estandar sobre tres semillas de entrenamiento. La tabla siguiente resume los valores reportados en el paper:

| Metodo de longitud | COMET-22 | Cierre de brecha | sacreBLEU |
|---|---|---|---|
| Oráculo de longitud (referencia) | 0,8519 ± 0,0007 | 100 % | 27,93 ± 0,23 |
| Ratio fijo 1.2 (linea base) | 0,8266 ± 0,0010 | 0 % | 23,65 ± 0,21 |
| Entropy-Valley (EV) | 0,8431 ± 0,0004 | 65,3 ± 0,8 % | 25,28 ± 0,33 |

Ademas, la evaluacion humana con tres traductores bilingues expertos sobre 100 frases estratificadas mostro una ganancia de adecuacion de +0,50 puntos, una ganancia de fluidez de +0,11, y una preferencia de 45 EV frente a 25 Ratio y 30 empates (prueba de signos p=0,022). El coste adicional de las cinco sondas de longitud es de aproximadamente un 15 % de pasadas forward con T=32, y dar el mismo presupuesto a la linea base de ratio fijo recupera como maximo 0,001 COMET.

## Requisitos de hardware

- El modelo base LLaDA-8B-Base requiere aproximadamente 16 GB de VRAM en precision fp16/bf16 para inferencia; con cuantizacion de 8 bits puede reducirse a unos 8-10 GB, y con 4 bits a unos 5-6 GB.
- El adaptador LoRA anade un coste minimo de memoria (menos de 1 GB), por lo que el requisito dominante es el del modelo base.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, H20, o GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16. Con cuantizacion, una RTX 4080 (16 GB) o incluso una RTX 4060 Ti (16 GB) podrian ser suficientes.
- Opciones de despliegue: el adaptador es compatible con la libreria PEFT de Hugging Face, por lo que puede cargarse con transformers y ejecutarse en frameworks como vLLM (si soporta modelos de difusion) o directamente con el codigo del repositorio Entropy-Valley. Tambien es posible exportar a GGUF para su uso con llama.cpp, aunque no se ha documentado oficialmente.
- Latencia y throughput: no se han publicado mediciones especificas. Con 32 pasos de denoising y 5 sondas de longitud, cada frase requiere aproximadamente 37 pasadas forward del modelo, lo que implica una latencia mayor que un modelo autoregresivo equivalente. En una A100, se estima un rendimiento de decenas de frases por minuto, dependiendo de la longitud.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de traduccion en la informacion proporcionada. El paper menciona que EV supera a la linea base de ratio fijo y se acerca al oraculo de longitud, pero no compara con sistemas autoregresivos como NLLB-200, M2M-100 o GPT-4. Como referencia cualitativa, LLaDA-8B-Base rivaliza con LLaMA3 8B en tareas generativas generales, pero su uso como traductor es especifico de este adaptador. No se incluyen datos de otros modelos en la documentacion disponible.

## Limitaciones y advertencias

- El adaptador solo cubre la direccion chino→ingles; no se ha publicado un adaptador inverso ni soporte para otros idiomas.
- La licencia llada-8b-base-license no es permisiva estandar; es necesario revisar los terminos exactos en el repositorio del modelo base antes de un uso comercial.
- El modelo base LLaDA-8B puede presentar sesgos y alucinaciones tipicos de los modelos de lenguaje grandes, aunque el adaptador de traduccion reduce el riesgo al estar especializado en una tarea concreta.
- La longitud de contexto maxima de 1024 tokens limita la traduccion de documentos largos; para textos extensos es necesario segmentar el contenido.
- El metodo EV requiere ejecutar cinco pasadas forward adicionales por frase, lo que incrementa el coste computacional frente a un sistema de ratio fijo.
- No se han publicado evaluaciones de robustez frente a ruido, dominios especializados o variaciones dialectales del chino.
- El adaptador se entreno con datos WMT19, por lo que su rendimiento puede degradarse en dominios muy diferentes (por ejemplo, jerga tecnica moderna o coloquialismos).

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/YanZhanPKU/LaDiT-LLaDA-8B-Zh2En
- Modelo base LLaDA-8B-Base: https://huggingface.co/GSAI-ML/LLaDA-8B-Base
- Paper "Large Language Diffusion Models" (arXiv): https://arxiv.org/abs/2502.09992
- Codigo del proyecto Entropy-Valley: https://github.com/Entropy-Valley/Entropy-Valley
- Dataset Entropy-Valley-Datasets: https://huggingface.co/datasets/YanZhanPKU/Entropy-Valley-Datasets
- Coleccion de modelos y datasets del proyecto: https://huggingface.co/collections/YanZhanPKU/entropy-valley

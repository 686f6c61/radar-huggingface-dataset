# YanZhanPKU/LaDiT-LLaDA-8B-En2Zh

## Resumen

LaDiT-LLaDA-8B-En2Zh es un adaptador LoRA desarrollado por el grupo Entropy-Valley (YanZhanPKU) que convierte el modelo base de difusión enmascarada LLaDA-8B-Base (GSAI-ML) en un sistema de traducción automática neuronal del inglés al chino. El adaptador se publica como parte del artículo *"Length-Adaptive Decoding for Masked Diffusion Machine Translation"* aceptado en EMNLP 2026, y su principal contribución no es el adaptador en sí, sino el método de decodificación Entropy-Valley (EV), un selector de longitud de lienzo sin entrenamiento que opera en tiempo de inferencia.

El problema que resuelve es específico de los modelos de difusión de lenguaje: a diferencia de los modelos autorregresivos, un modelo de difusión enmascarada debe decidir de antemano cuántos tokens va a generar (el tamaño del lienzo), y una longitud incorrecta provoca pérdida de contenido (si es corta) o repeticiones (si es larga). EV selecciona la longitud óptima evaluando la entropía predictiva media del modelo sobre un conjunto de longitudes candidatas, con un coste adicional de aproximadamente un 15 % de pasadas hacia adelante. El adaptador liberado corresponde a una de las tres ejecuciones de entrenamiento reportadas en el artículo, con resultados dentro de las desviaciones estándar publicadas.

El modelo base LLaDA-8B tiene 8.02 mil millones de parámetros y una arquitectura Transformer de difusión enmascarada, entrenada desde cero con un objetivo de preentrenamiento y ajuste supervisado. El adaptador LoRA añade aproximadamente 157 millones de parámetros entrenables (1.95 % del total) y se entrena sobre 200 000 pares paralelos del corpus WMT19 zh-en. La ventana de contexto máxima es de 1024 tokens, y la licencia es la específica de LLaDA-8B-Base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion enmascarada (masked diffusion) con adaptador LoRA sobre LLaDA-8B-Base |
| Parametros totales | 8.02B (modelo base) + ~157M (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (lienzo maximo, incluye prompt fuente y lienzo objetivo) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bf16; el modelo base admite cuantizacion estandar, pero no se documenta en esta ficha) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | llada-8b-base-license (licencia especifica de LLaDA-8B-Base) |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo base LLaDA-8B es un modelo de difusion de lenguaje entrenado desde cero, que emplea un proceso de enmascarado hacia delante y un proceso de generacion inversa parametrizado por un Transformer. A diferencia de los modelos autorregresivos, LLaDA predice tokens enmascarados de forma simultanea, lo que permite una generacion no secuencial. El adaptador LoRA se anade a las proyecciones de atencion (q, k, v, o) y a las capas de feed-forward (ff_proj, up_proj, ff_out) de cada bloque, con rango r=64, alpha=128 y dropout 0.05.

El entrenamiento del adaptador se realizo sobre 200 000 pares paralelos del corpus WMT19 zh-en (configuracion `enzh` del dataset Entropy-Valley-Datasets), con optimizador AdamW (beta1=0.9, beta2=0.95), peso de decaimiento 0.01, tasa de aprendizaje coseno con pico en 2e-4, 5 % de warm-up, 3 epocas, batch global de 128 y precision bf16. El entrenamiento completo tardo aproximadamente 6 horas en 8 GPUs H20-96GB. La decodificacion se realiza con el esquema MED (minimum-entropy decoding) con T=32 pasos y truncamiento por token EOS.

La innovacion principal es el metodo Entropy-Valley (EV), un selector de longitud de lienzo sin entrenamiento que opera en tiempo de decodificacion. Para cada longitud candidata L, EV ejecuta una unica pasada hacia delante con todos los tokens enmascarados y calcula la entropia predictiva media; luego selecciona la longitud que minimiza esa entropia. El conjunto de longitudes candidatas se fija a partir de estadisticas de longitud del corpus de entrenamiento WMT19 (R = {0.70, 0.75, 0.80, 0.85, 0.90} veces la longitud de la fuente), no del conjunto de prueba.

## Capacidades

- Traduccion automatica ingles→chino (en→zh) de alta calidad, con mejora significativa en la retencion de contenido frente a metodos de longitud fija.
- Generacion de texto no autorregresiva mediante difusion enmascarada, lo que permite decodificacion paralela y control de la longitud de salida.
- Soporte de decodificacion con seleccion de longitud adaptativa mediante el metodo Entropy-Valley, que mejora la cobertura de elementos criticos como numeros y placeholders.
- Capacidad de funcionar como modelo de traduccion estandar con longitud fija (por ejemplo, ratio 0.8) si no se usa EV, aunque con menor rendimiento.
- Integracion con el ecosistema Hugging Face Transformers y PEFT, lo que facilita su uso en pipelines existentes.
- Multilingue limitado a los pares en-zh; no se reportan capacidades en otros idiomas.

## Casos de uso

- Traduccion de documentos tecnicos y cientificos: el modelo puede traducir articulos, manuales y especificaciones del ingles al chino, con una retencion de numeros y placeholders del 81.3 % y 89.1 % respectivamente, lo que reduce errores en datos criticos.
- Localizacion de software y aplicaciones: la capacidad de controlar la longitud de salida mediante EV permite adaptar las traducciones a restricciones de espacio en interfaces de usuario, manteniendo la fidelidad del contenido.
- Subtitulado automatico de videos: al procesar segmentos de texto cortos, el modelo puede generar subtitulos en chino con una cobertura adecuada de nombres propios y cifras, gracias a la seleccion de longitud adaptativa.
- Atencion al cliente bilingue: integrado en un sistema de chat, puede traducir consultas de clientes en ingles a chino para agentes de soporte, con una ventana de contexto de 1024 tokens suficiente para conversaciones de varias frases.
- Traduccion de contenido web en tiempo real: el modelo puede traducir paginas o fragmentos de noticias, y su naturaleza no autorregresiva permite un procesamiento por lotes eficiente en entornos con multiples peticiones.
- Generacion de datos de entrenamiento para otros modelos: las traducciones producidas pueden usarse para aumentar corpus paralelos o para crear conjuntos de datos sinteticos, aprovechando la calidad reportada (COMET-22 de 0.8517 con EV).
- Investigacion en modelos de difusion de lenguaje: el adaptador y el metodo EV sirven como referencia para estudiar la decodificacion en modelos de difusion, especialmente en tareas de generacion condicionada.

## Benchmarks y rendimiento

Los resultados se reportan sobre el conjunto de prueba WMT22 En→Zh News (N=2037), con decodificacion MED de 32 pasos. La tabla muestra la media ± desviacion estandar sobre tres semillas de entrenamiento, tal como se publica en el articulo. El "length oracle" es un limite superior que utiliza la longitud de referencia en tiempo de decodificacion; no es un metodo desplegable.

| Metodo de longitud | COMET-22 | Cierre de brecha | sacreBLEU |
|---|---|---|---|
| Length oracle (limite superior) | 0.8610 ± 0.0013 | 100 % | 40.81 ± 0.23 |
| Ratio fijo 0.8 (linea base) | 0.8345 ± 0.0017 | 0 % | 36.72 ± 0.22 |
| **Entropy-Valley (EV)** | **0.8517 ± 0.0006** | **64.9 ± 7.4 %** | **38.57 ± 0.13** |

Ademas, se reportan mejoras a nivel de frase: EV supera al ratio fijo en +0.0196 COMET (IC 95 % [0.0166, 0.0226], p < 10⁻⁴ en bootstrap pareado, Wilcoxon p = 4.1×10⁻³²). La retencion de placeholders sube del 66.9 % al 89.1 % y la de numeros del 77.6 % al 81.3 %. En evaluacion humana con tres traductores bilingues expertos sobre 100 frases estratificadas, se observa un incremento de +0.18 en adecuacion y +0.18 en fluidez, con preferencia de 28 EV frente a 19 del ratio fijo y 53 empates.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 0.6 GB, pero es necesario cargar el modelo base LLaDA-8B-Base completo, que en bf16 requiere alrededor de 16 GB de VRAM solo para los pesos.
- Para inferencia con precision bf16, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A10G, L4) para caber con overhead de activaciones y cache.
- Con cuantizacion de 4 bits (por ejemplo, GPTQ o AWQ), el modelo base podria reducirse a unos 4-5 GB, permitiendo su ejecucion en GPUs de 8-12 GB, aunque no se documenta oficialmente en esta ficha.
- El entrenamiento del adaptador se realizo en 8×H20-96GB, pero para inferencia no se requiere tanta capacidad; una sola GPU de gama alta es suficiente.
- Opciones de despliegue: al ser un modelo de difusion enmascarada, no es compatible directamente con motores autorregresivos como vLLM o llama.cpp en su modo estandar. Se requiere el codigo especifico del repositorio Entropy-Valley (que incluye la implementacion de decodificacion MED y EV) y el soporte de Transformers para LLaDA.
- La latencia depende del numero de pasos de decodificacion (T=32 por defecto) y del coste adicional de las sondas EV (≈15 % mas de pasadas hacia delante). No se proporcionan cifras de throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de traduccion en-zh en la informacion proporcionada. El articulo compara internamente el metodo EV con el ratio fijo y el oracle de longitud, pero no con sistemas de traduccion alternativos como NLLB, M2M100 o modelos autorregresivos ajustados. Como referencia cualitativa:

| Modelo | Tipo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| LaDiT-LLaDA-8B-En2Zh (este) | Difusion enmascarada + LoRA | 8.02B + 157M | 1024 | llada-8b-base-license | Traduccion en-zh, metodo EV |
| LLaDA-8B-Base (modelo base) | Difusion enmascarada | 8.02B | 1024 | llada-8b-base-license | Modelo general, no especializado en traduccion |
| NLLB-200 (Meta) | Autorregresivo | 600M a 54B | 512 | CC-BY-NC | Traduccion multilingue, no usa difusion |

La comparacion con NLLB es orientativa; no se han ejecutado los mismos benchmarks en este contexto.

## Limitaciones y advertencias

- El adaptador solo cubre el par ingles→chino; no se ha entrenado para otras direcciones o idiomas.
- La ventana de contexto de 1024 tokens limita la traduccion de documentos largos; para textos extensos es necesario segmentar, lo que puede afectar a la coherencia.
- El metodo EV requiere ejecutar varias pasadas hacia delante (una por longitud candidata), lo que incrementa la latencia en aproximadamente un 15 % con T=32. En aplicaciones de tiempo real puede ser un factor a considerar.
- El modelo base LLaDA-8B puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje, aunque la tarea de traduccion reduce el riesgo. No se han realizado evaluaciones especificas de sesgo en este adaptador.
- La licencia llada-8b-base-license puede imponer restricciones de uso comercial; es necesario revisar los terminos exactos en el repositorio del modelo base antes de desplegar en produccion.
- El adaptador se publica como una de las tres ejecuciones de entrenamiento; los resultados reportados son medias sobre semillas, por lo que el rendimiento de esta ejecucion concreta puede variar ligeramente.
- No se proporcionan garantias de soporte para cuantizacion; el uso de cuantizaciones no probadas puede degradar la calidad de la traduccion.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/YanZhanPKU/LaDiT-LLaDA-8B-En2Zh
- Modelo base LLaDA-8B-Base: https://huggingface.co/GSAI-ML/LLaDA-8B-Base
- Modelo instructivo LLaDA-8B-Instruct: https://huggingface.co/GSAI-ML/LLaDA-8B-Instruct
- Codigo y paper (Entropy-Valley): https://github.com/Entropy-Valley/Entropy-Valley
- Paper de LLaDA (arXiv 2502.09992): https://arxiv.org/abs/2502.09992
- Dataset Entropy-Valley-Datasets: https://huggingface.co/datasets/YanZhanPKU/Entropy-Valley-Datasets
- Coleccion de modelos Entropy-Valley: https://huggingface.co/collections/YanZhanPKU/entropy-valley

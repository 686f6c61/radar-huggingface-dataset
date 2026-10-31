# takarajordan/UltraBERT-Embed-MoE-8x

## Resumen

UltraBERT-Embed-MoE-8x es un modelo de embeddings experimental que aplica una arquitectura de mezcla de expertos (MoE) sobre UltraBERT-Embed-150M, un modelo de embeddings compacto desarrollado por dmis-lab. El proyecto, publicado por el usuario takarajordan en Hugging Face, sigue la receta de Nomic descrita en el artículo arXiv 2502.07972, que explora la conversión de modelos encoder densos en variantes MoE mediante upcycling. El resultado es un modelo con 349 millones de parámetros totales, de los cuales aproximadamente 179 millones se activan por token, que genera embeddings de 768 dimensiones a partir del token CLS.

El modelo se presenta explícitamente como un experimento ("toy") educativo: solo ha completado la etapa uno del entrenamiento (400 pasos) y la etapa dos quedó sin terminar, por lo que las mejoras de calidad sobre el modelo base no están demostradas. Su relevancia radica más en servir como referencia de implementación de MoE en modelos de tipo encoder para similitud semántica que como modelo listo para producción. Está entrenado sobre el dataset nomic-ai/nomic-embed-unsupervised-data y distribuido bajo licencia Apache 2.0 con código personalizado (`trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-style) con mixture-of-experts (8 expertos, enrutamiento top-2 en 12 capas) |
| Parametros totales | 349.287.168 |
| Parametros activos | ~179M por token (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors sin cuantizar) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,4 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de dmis-lab/UltraBERT-Embed-150M, un encoder de embeddings de 150 millones de parametros, al que se aplica una transformacion MoE siguiendo la receta de Nomic (arXiv 2502.07972). En 12 capas del modelo se sustituyen las capas densas (feed-forward) por 8 expertos cada una, con un mecanismo de enrutamiento que selecciona los 2 expertos mas relevantes por token (top-2 routing). Esto eleva la capacidad total del modelo a 349 millones de parametros mientras mantiene el coste computacional por token en torno a 179 millones de parametros activos, un equilibrio tipico del enfoque MoE. La salida son embeddings de 768 dimensiones obtenidos del token CLS, normalizables para calculo de similitud coseno.

El entrenamiento se realizo sobre nomic-ai/nomic-embed-unsupervised-data, el corpus no supervisado utilizado por Nomic para sus modelos de embeddings. Segun la model card, el entrenamiento esta parcialmente completado: la etapa uno alcanzo el paso 400 y la etapa dos no llego a terminarse. No hay indicios de RLHF ni DPO (no aplicables a un modelo de embeddings). Un detalle tecnico importante: todos los pesos de los expertos permanecen cargados en memoria durante la inferencia, lo que incrementa el footprint de memoria aunque solo se computen 2 expertos por token. El modelo requiere `trust_remote_code=True` al cargarlo con sentence-transformers, ya que incluye codigo personalizado (arquitectura `ultrabert_moe`).

## Capacidades

- Generacion de embeddings de frases y textos de 768 dimensiones (token CLS) para tareas de similitud semantica.
- Feature extraction y calculo de similitud entre consultas y documentos mediante productos escalares sobre embeddings normalizados.
- Uso de prompts diferenciados para consultas (`prompt_name="query"`) y documentos, siguiendo la convencion de modelos de embeddings asimetricos.
- Arquitectura MoE con 8 expertos y enrutamiento top-2, que permite explorar el compromiso entre capacidad total y coste de computo por token.
- Ejecucion en CPU gracias a la implementacion de atencion SDPA (`attn_implementation: "sdpa"`), sin requerir GPU.
- Integracion con la libreria sentence-transformers mediante codigo personalizado.

No hay evidencia de capacidades adicionales: no es un modelo generativo, no soporta tool calling, ni agentes, ni vision, ni audio, ni modo de razonamiento.

## Casos de uso

- Investigacion en arquitecturas MoE para encoders: el codigo y los pesos sirven como implementacion de referencia para estudiar como el upcycling MoE afecta a modelos de embeddings tipo BERT, util para desarrolladores que quieran replicar la receta de Nomic.
- Prototipado de busqueda semantica en ingles: se puede indexar colecciones de documentos y recuperar por similitud coseno con embeddings normalizados de 768 dimensiones, aunque con la advertencia de que la calidad no esta validada.
- Experimentacion con routing en CPU: al poder ejecutarse en CPU con SDPA, es util para probar mecanismos de enrutamiento de expertos y medir su comportamiento sin infraestructura de GPU.
- Comparativa de embeddings densos vs. MoE: permite evaluar en benchmarks propios si los 179M de parametros activos del MoE rinden como los 150M densos del modelo base.
- Base para fine-tuning posterior: al estar entrenado solo parcialmente, es un punto de partida realista para quien quiera continuar el entrenamiento de etapa dos o afinar en dominios concretos.
- Ensenanza y demostracion de sentence-transformers con codigo personalizado: el ejemplo de la model card (codificar consulta y documento y calcular `q @ d.T`) sirve como tutorial minimo de uso de modelos con `trust_remote_code`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que "quality gains over the original are unproven" (las mejoras de calidad sobre el modelo original no estan demostradas) y remite a un archivo RESULTS.md en el repositorio cuyo contenido no se incluye en la informacion proporcionada. No se pueden aportar cifras de MMLU, similitud, MTEB ni ninguna otra metrica sin riesgo de inventar datos.

## Requisitos de hardware

- VRAM / memoria: el repositorio ocupa 1,4 GB en safetensors; al ser un modelo encoder con todos los expertos residentes en memoria, se estima que 2-4 GB de RAM o VRAM son suficientes para inferencia (estimacion basada en el tamano de pesos, no dato oficial).
- GPU recomendadas: no requiere GPU; la model card muestra su uso en CPU (`device="cpu"`). Si se desea acelerar, cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo, una RTX 3060 o superior) seria mas que suficiente.
- Consumer GPUs: cabe comodamente en practicamente cualquier GPU de consumo moderna; incluso se ejecuta sin GPU.
- Opciones de despliegue: sentence-transformers con `trust_remote_code=True` es la via documentada. No hay evidencia de soporte directo en vLLM, llama.cpp, Ollama o TGI, ya que se trata de una arquitectura personalizada (`ultrabert_moe`) con codigo remoto.
- Latencia y throughput: no disponibles. Al activar solo 179M de parametros por token en un encoder, cabe esperar latencias bajas en CPU para textos individuales, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| takarajordan/UltraBERT-Embed-MoE-8x | 349M totales / ~179M activos | no disponible | Encoder MoE (8 expertos, top-2) | Apache 2.0 | Experimental, entrenamiento parcial, solo ingles |
| dmis-lab/UltraBERT-Embed-150M | 150M | no disponible | Encoder denso | no disponible | Modelo base; referencia de calidad frente a la variante MoE |
| nomic-ai/nomic-embed-text-v1 | ~137M | 8192 | Encoder denso | Apache 2.0 | Modelo maduro, entrenado con la receta que este proyecto replica |

La comparativa mas relevante es con su propio modelo base: UltraBERT-Embed-150M ofrece un modelo denso completo y presumiblemente estable, mientras que la variante MoE duplica los parametros totales a cambio de un coste por token similar, pero sin mejoras de calidad demostradas. Frente a nomic-embed-text-v1, este modelo es mucho menos maduro (400 pasos de la etapa uno frente a un entrenamiento completo) y su ventana de contexto no esta documentada.

## Limitaciones y advertencias

- Entrenamiento incompleto: solo se completo el paso 400 de la etapa uno y la etapa dos quedo sin terminar; el autor advierte explicitamente que las mejoras de calidad no estan probadas. No es un modelo apto para produccion.
- Naturaleza experimental: esta etiquetado como "toy" y "experimental" por su propio autor.
- Codigo personalizado obligatorio: requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio; conviene revisarlo antes de usarlo en entornos sensibles.
- Idioma: entrenado solo con datos en ingles; su comportamiento en otros idiomas, incluido el castellano, no esta evaluado.
- Memoria: aunque solo 2 de 8 expertos se computan por token, todos los pesos de los expertos permanecen en memoria, aumentando el footprint frente al modelo base.
- Sesgos y riesgo de alucinacion: al ser un modelo de embeddings no generativo, no alucina texto, pero hereda los sesgos del corpus nomic-embed-unsupervised-data, no supervisado y sin filtro documentado.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes; la limitacion principal es de calidad, no legal.
- Adopcion minima: 34 descargas y 1 like en el momento de la ficha, sin comunidad ni soporte detras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/takarajordan/UltraBERT-Embed-MoE-8x
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-Embed-150M
- Articulo de referencia (receta de Nomic): https://arxiv.org/abs/2502.07972
- Dataset de entrenamiento: https://huggingface.co/datasets/nomic-ai/nomic-embed-unsupervised-data
- Requisitos y resultados en el repositorio: requirements.txt y RESULTS.md (enlaces relativos dentro del repositorio del modelo)

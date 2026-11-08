# Vi-LAB/KenT-1B-Base

## Resumen

KenT-1B-Base es un modelo de lenguaje de ~1.000 millones de parametros desarrollado por Vi-LAB (Vietnam-LAB) y publicado en Hugging Face bajo licencia Apache 2.0. Pertenece a la familia de modelos de espacio de estados (SSM) recurrentes, no a la arquitectura transformer convencional: procesa la secuencia con una recurrencia lineal y un estado de decodificacion de tamano constante, lo que le permite en teoria escalar a contextos muy largos con coste computacional lineal. Esta entrenado sobre `wikimedia/wikipedia` y soporta vietnamita e ingles.

La propuesta tecnica del modelo es inusual: concentra la capacidad en una representacion espectral amplia (una rejilla de N = 24 posiciones DCT por D = 256 caracteristicas) apilada sobre una profundidad moderada de 24 capas recurrentes identicas, cada una con un unico bloque SwiGLU MLP. La memoria historica se resume mediante una media movil exponencial con un coeficiente de olvido aprendido por capa. El flujo de representacion que alimenta a `lm_head` tiene anchura 1536.

Es relevante ahora porque explora una via alternativa a los transformers para contextos largos y despliegue con memoria acotada, y porque su recurrencia es paralelizable por chunks (scan afin), lo que facilita el prefill de documentos largos. No obstante, se trata de un modelo de investigacion en fase base (sin ajuste instructivo) y el propio autor advierte que las hipotesis de diseno estan pendientes de validacion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSM recurrente con bloques DCT + SwiGLU MLP (custom code, `KentModel`/`KentForCausalLM`) |
| Parametros totales | ~1B (denominacion del modelo; cifra exacta no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (estado de decodificacion de tamano constante; sin cifra publicada) |
| Tipos de cuantizacion | pesos publicados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) + `model.py` con `trust_remote_code` |

Otros datos: 24 capas recurrentes, anchura del flujo de representacion 1536, rejilla espectral N = 24 posiciones DCT y D = 256 caracteristicas por posicion, MLP SwiGLU con hidden size ~8/3 x D, tamano de repo 1,2 GB, 2577 descargas y 1 like en el momento de la consulta.

## Arquitectura y entrenamiento

KenT sustituye la atencion por una recurrencia lineal. Cada una de las 24 capas contiene un unico bloque de transformacion (un MLP SwiGLU) que opera sobre una rejilla espectral amplia: una proyeccion bilineal expande el flujo de representacion (1536) a N = 24 posiciones DCT x D = 256 caracteristicas, se aplica un operador DCT fijo (no aprendido) y despues el bloque no lineal. El modelo mantiene dos flujos separados que solo se comunican mediante proyecciones aprendidas: uno de representacion del token actual y otro de memoria que agrega el historial. La memoria se implementa como una media movil exponencial `H_t = (1 - a) H_{t-1} + a u_t` con un unico escalar `a` aprendido por capa, cuyo valor inicial decrece con la profundidad (capas superficiales olvidan rapido, capas profundas retienen mas). El estado de decodificacion tiene tamano constante independientemente de la longitud del contexto.

El entrenamiento se realizo sobre `wikimedia/wikipedia`; no se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO (es un modelo base, por lo que previsiblemente no). La innovacion destacable es la paralelizacion por chunks: al ser una recurrencia lineal, un documento largo puede dividirse en bloques procesados concurrentemente y fusionarse con un scan afin, obteniendo el mismo resultado que el procesamiento secuencial. El repositorio incluye `infer.py` con `prefill` y `stream` para cargar prefijos largos en paralelo y reutilizar el estado con `cache.clone()`.

## Capacidades

- Generacion de texto autoregresiva en vietnamita e ingles.
- Modelo base: completa texto, no esta ajustado para seguir instrucciones ni para formato conversacional.
- Razonamiento multi-paso no verificado experimentalmente; el autor presenta las propiedades como hipotesis de diseno.
- Procesamiento de documentos largos con coste lineal y estado de tamano constante, incluido prefill paralelo por chunks.
- Reutilizacion de prefijos: `cache.clone()` permite generar varias ramas a partir de un mismo contexto sin recargarlo.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.
- No se documenta modo de razonamiento explicito (thinking mode).

## Casos de uso

- Procesamiento de documentos largos en streaming: cargar un documento completo con `prefill` por chunks de 1024 tokens y generar continuaciones con `stream`, aprovechando la recurrencia lineal y el estado de tamano constante para evitar el coste cuadratico de la atencion.
- Investigacion en arquitecturas SSM: servir como banco de pruebas reproducible para comparar recurrencias lineales frente a transformers en tareas de modelado de lenguaje, dado que el codigo esta abierto y es autoconenido.
- Generacion de texto en vietnamita e ingles: completado de articulos, resumenes o continuaciones sobre texto de Wikipedia, que es el dominio de entrenamiento.
- Despliegue con memoria acotada: escenarios donde la VRAM disponible es limitada y el contexto es muy largo, ya que el estado recurrente no crece con la longitud de la secuencia.
- Generacion de multiples ramas desde un mismo contexto: uso de `cache.clone()` para explorar varias continuaciones de un prefijo comun sin recalcular el prefill.
- Fine-tuning especifico de dominio: al ser un modelo base con licencia Apache 2.0, puede ajustarse para tareas concretas (clasificacion, extraccion, generacion especializada) partiendo de los pesos FP16.
- Evaluacion comparativa de tokenizadores y vocabularios: el autor advierte que el tokenizador y los pesos deben coincidir con `vocab_size` en `config.json`, lo que lo hace util para estudiar efectos de tokenizacion en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para KenT-1B-Base. La busqueda web menciona que el modelo hermano `Vi-LAB/KenT_0.5B_Base` reporta un 11,66 % en MMLU-Pro, pero no se dispone de cifras equivalentes para la variante de 1B.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,4-3 GB solo para pesos (1,2 GB de safetensors mas overhead de activaciones y estado); con contexto largo y batch, el consumo adicional es moderado gracias al estado de tamano constante.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 con batch pequeno; RTX 3060/4060, RTX 4090, A100 y H100 son adecuadas.
- Cabe en GPU de consumo: si, en la mayoria de GPUs consumer modernas con 6 GB o mas, al ser un modelo de ~1B en FP16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el codigo custom); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y la naturaleza de codigo personalizado hace probable que no funcionen sin adaptacion.
- Latencia y throughput: no disponibles. El modelo ofrece prefill paralelo por chunks (`chunk_size=1024`, `max_parallel_chunks=16` en el ejemplo del autor) y decodificacion con estado constante, lo que en teoria reduce el coste por token en contextos largos frente a atencion cuadratica, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KenT-1B-Base | ~1B | no disponible | SSM recurrente (DCT + SwiGLU) | Apache 2.0 | Hugging Face, `trust_remote_code` |
| Vi-LAB/KenT-100M-Base | ~100M | no disponible | SSM recurrente (misma familia) | Apache 2.0 | Hugging Face |
| Vi-LAB/KenT_0.5B_Base | ~0,5B | no disponible | SSM recurrente (misma familia) | Apache 2.0 | Hugging Face (reporta 11,66 % en MMLU-Pro) |
| Mamba-1B (referencia de familia SSM) | ~1,3B | no disponible en esta ficha | SSM selectivo | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones de forma fiable y no debe usarse directamente en produccion conversacional sin fine-tuning.
- El propio autor califica el modelo como de investigacion y advierte que las hipotesis de diseno (anchura espectral, profundidad moderada, memoria con olvido aprendido) no son garantias de rendimiento y requieren validacion experimental.
- La memoria es una media movil exponencial que olvida pasos antiguos y no selecciona contenido por si misma; puede perder informacion relevante en contextos muy largos pese al estado constante.
- Sesgos conocidos: no documentados, pero el entrenamiento sobre Wikipedia en vietnamita e ingles puede introducir sesgos de dominio y de cobertura geografica y cultural.
- Riesgo de alucinacion: no cuantificado; como modelo base, la generacion libre puede producir texto plausible pero incorrecto.
- Cobertura linguistica limitada a vietnamita e ingles; el comportamiento en castellano no esta documentado ni garantizado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar `model.py` antes de desplegarlo.
- El tokenizador y los pesos deben coincidir con `vocab_size` en `config.json`; un desajuste provoca fallos en la carga.
- Licencia Apache 2.0: permite uso comercial, pero sin garantias del autor y con la obligacion habitual de conservar avisos de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vi-LAB/KenT-1B-Base
- Modelo hermano de 100M: https://huggingface.co/Vi-LAB/KenT-100M-Base
- Organizacion Vi-LAB en Hugging Face: https://huggingface.co/Vi-LAB/datasets
- Dataset de entrenamiento: https://huggingface.co/datasets/wikimedia/wikipedia

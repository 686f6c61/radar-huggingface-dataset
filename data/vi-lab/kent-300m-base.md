# Vi-LAB/KenT-300M-Base

## Resumen

KenT-300M-Base es un modelo de lenguaje de tipo SSM (state-space model) recurrente desarrollado por Vi-LAB (Vietnam-LAB). Se trata de un modelo base de aproximadamente 300 millones de parametros, entrenado para generacion de texto en ingles y vietnamita, publicado bajo licencia Apache 2.0. Su propuesta arquitectonica se aleja del transformer clasico: apila 24 capas recurrentes compactas y concentra la capacidad en profundidad en lugar de anchura.

La innovacion principal es el uso de una memoria de olvido aprendido basada en una media movil exponencial (`H_t = (1 - a) H_{t-1} + a u_t`) con un coeficiente escalar aprendido por capa, cuyo valor inicial decrece con la profundidad (las capas superficiales olvidan rapido, las profundas retienen mas). El estado de decodificacion tiene tamano constante independientemente de la longitud de contexto, lo que lo hace candidato a escenarios de contexto largo con coste lineal.

Ademas, el modelo procesa caracteristicas en el espacio de coeficientes coseno mediante un operador fijo no aprendido (DCT), intercalado con bloques no lineales SwiGLU. La recurrencia es lineal y, por tanto, paralelizable por fragmentos (chunk-parallelizable) mediante un escaneo afin, lo que permite procesar documentos largos en bloques concurrentes. El autor advierte explicitamente que estas son hipotesis de diseno pendientes de verificacion experimental, no garantias de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSM recurrente con memoria de olvido aprendido, procesamiento en dominio de frecuencias (DCT fija) y SwiGLU |
| Parametros totales | ~300M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (estado de tamano constante) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

KenT no es un transformer. Es un modelo de espacio de estados recurrente que organiza su capacidad en profundidad: 24 capas identicas, cada una con un unico bloque de transformacion, conectadas secuencialmente a traves del flujo de representacion. El modelo mantiene dos flujos separados que solo se comunican mediante proyecciones aprendidas: un flujo de representacion del token actual y un flujo de memoria que agrega el historial.

La memoria se implementa como una media movil exponencial con un unico escalar aprendido por capa, cuyo valor inicial decrece con la profundidad. Esta recurrencia es lineal, lo que permite dividir un documento largo en bloques, procesarlos en paralelo y fusionarlos con un escaneo afin obteniendo el mismo resultado que el procesamiento secuencial. Las caracteristicas se procesan en el espacio de coeficientes coseno con un operador fijo no aprendido (DCT), intercalado con bloques no lineales; el autor no detalla la composicion del dataset de entrenamiento ni el numero de tokens, mas alla de referenciar wikimedia/wikipedia en vietnamita e ingles segun la busqueda web. No se documenta en la informacion disponible si hubo RLHF, DPO ni otras fases de alineamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles y vietnamita.
- Modelo base: no esta ajustado para instrucciones ni para dialogo (no es instruct/chat).
- Razonamiento y codigo: sin datos publicados que lo confirmen; no disponible.
- Soporte de tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingues limitadas a vi y en segun la model card.
- Contexto largo: el estado recurrente es de tamano constante, lo que permite en teoria procesar documentos largos con coste lineal, mediante carga de prefijo por fragmentos en paralelo (`chunked=True`).
- Reutilizacion de prefijo: `cache.clone()` permite ramificar generaciones desde un mismo prefijo sin recargarlo.

## Casos de uso

- Generacion de texto en vietnamita: el modelo esta entrenado en vi y en, por lo que puede emplearse para completar texto, redactar borradores o generar contenido en vietnamita alli donde no se requiera un modelo ajustado a instrucciones.
- Procesamiento de documentos largos con coste lineal: gracias a la recurrencia lineal y a la carga de prefijo por fragmentos (`prefill` con `chunk_size` y `max_parallel_chunks`), puede procesar documentos extensos dividiendolos en bloques concurrentes, util para resumen extractivo o continuacion de texto sobre corpus largos.
- Generacion con ramificacion de prefijo: mediante `cache.clone()` se puede cargar un prefijo una vez y generar multiples continuaciones distintas, adecuado para tareas de exploracion o generacion de variantes.
- Investigacion en arquitecturas SSM: sirve como banco de pruebas para validar las hipotesis de diseno del autor (profundidad frente a anchura, olvido aprendido por capa, DCT fija) en tareas controladas.
- Prototipado en entornos con recursos limitados: con ~300M parametros en FP16, el modelo es ligero y puede ejecutarse en hardware modesto para experimentos de generacion de texto.
- Fine-tuning especifico de dominio: al ser un modelo base con licencia Apache 2.0, puede ajustarse para tareas concretas (clasificacion de texto, generacion especializada) en ingles o vietnamita.
- Experimentos de inferencia por streaming: el script `infer.py` permite generar token a token en streaming, util para interfaces interactivas de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~300M parametros en FP16, aproximadamente 0,6 GB solo para pesos; sumando estado recurrente y overhead de activaciones, en torno a 1-2 GB en funcion del tamano de lote y del chunk.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el modelo incluye codigo custom, por lo que no es compatible directamente con vLLM, llama.cpp, Ollama o TGI salvo que se implemente soporte especifico). El repositorio incluye `infer.py` para carga de prefijo por fragmentos y generacion en streaming.
- Latencia y throughput estimados: no disponibles. La recurrencia lineal y el estado de tamano constante sugieren coste por token independiente de la longitud de contexto, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Benchmarks |
|---|---|---|---|---|---|
| KenT-300M-Base | ~300M | no disponible (estado constante) | SSM recurrente con olvido aprendido | Apache 2.0 | no disponibles |
| EvolK_300M_Base (Vi-LAB) | ~300M | no disponible | no disponible | Apache 2.0 | no disponibles |
| Mamba-130M / Mamba-370M | 130M / 370M | hasta 2048 tokens (entrenamiento) | SSM selectivo | Apache 2.0 | MMLU, HellaSwag, PIQA publicados |
| RWKV-4 169M | 169M | hasta 4096 tokens | RNN lineal | Apache 2.0 | benchmarks publicados |

La comparacion con modelos SSM establecidos como Mamba o RWKV es pertinente por categoria, pero no se dispone de datos de rendimiento de KenT que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un modelo base: no esta ajustado para seguir instrucciones ni para mantener conversaciones; su uso en produccion requeriria fine-tuning o ajuste adicional.
- El autor lo califica explicitamente de modelo de investigacion y recomienda evaluarlo antes de usarlo en tareas reales.
- Las afirmaciones arquitectonicas son hipotesis de diseno pendientes de verificacion, no garantias de rendimiento.
- La memoria es una media movil exponencial: olvida pasos antiguos pero no selecciona contenido de forma selectiva, lo que puede limitar tareas que requieran recuperacion precisa de informacion lejana en el contexto.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni evaluacion de seguridad.
- Idiomas limitados a vietnamita e ingles; sin soporte documentado para castellano.
- La licencia Apache 2.0 permite uso comercial, pero al incluir codigo custom (`trust_remote_code`) el despliegue en infraestructuras estandarizadas (vLLM, TGI, Ollama) puede requerir trabajo adicional de integracion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El tokenizer y los pesos deben coincidir con `vocab_size` de `config.json`; un desajuste provoca fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vi-LAB/KenT-300M-Base
- Repositorio relacionado (variante): https://huggingface.co/Vi-LAB/KenT_300M_Base
- Otro modelo de Vi-LAB (comparativa): https://huggingface.co/Vi-LAB/EvolK_300M_Base

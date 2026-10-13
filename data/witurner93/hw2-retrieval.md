# Witurner93/hw2-retrieval

## Resumen

Witurner93/hw2-retrieval es un repositorio de HuggingFace que contiene una implementacion propia y minima de una arquitectura BeiT (Bert-like Image Transformer) orientada a tareas de retrieval (recuperacion, presumiblemente imagen-texto). El autor es el usuario Witurner93 y el repositorio se publica bajo licencia Apache 2.0. El propio model card es explicito: no se trata de un modelo entrenado ni de un release de benchmark, sino de un punto de partida reproducible que incluye el codigo del modelo, un fichero de configuracion, una receta de entrenamiento por defecto y un checkpoint de inicializacion valido para smoke tests.

La relevancia de este repositorio es por tanto metodologica, no de rendimiento: sirve como esqueleto para experimentar con retrieval multimodal, con una configuracion declarada de atencion de ventana deslizante (sliding window), fusion tipo concat mlp, activacion ReLU y normalizacion RMSNorm. La escala declarada en la configuracion es "giant", pero el numero real de parametros del checkpoint publicado, segun los metadatos de safetensors, es de 16.576 (con repo de 0,0 GB), lo que confirma que se trata de un checkpoint de inicializacion de juguete y no de un modelo de escala giant entrenado.

En el momento de la consulta acumula 16 descargas y 0 likes, con fechas de creacion y actualizacion del 13 de octubre de 2026. No hay resultados de benchmarks, no se declaran idiomas soportados y no se especifica un pipeline de HuggingFace. Para cualquier evaluacion seria, el autor recomienda usar Flickr30k, reportar la metrica de la tarea sobre al menos tres semillas y comparar contra un baseline de capacidad equiparable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BeiT (implementacion propia), atencion de ventana deslizante, fusion concat mlp, activacion ReLU, normalizacion RMSNorm |
| Parametros totales | 16.576 (segun metadatos de safetensors); la configuracion declara escala "giant", no coherente con el checkpoint publicado |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8/INT8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicializacion); codigo en Python/PyTorch |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-10-13 |
| Fecha de ultima actualizacion | 2026-10-13 |

## Arquitectura y entrenamiento

La arquitectura declarada es BeiT, un transformer con atencion de ventana deslizante en lugar de atencion densa completa. La configuracion generada en `config.json` especifica fusion mediante concat mlp, activacion ReLU y normalizacion RMSNorm. El model card no detalla dimensionalidad de embeddings, numero de capas, numero de cabezas de atencion, tamano de parche ni resolucion de entrada, por lo que la mayor parte de los hiperparametros concretos no esta disponible en la informacion proporcionada. La variante declarada es "giant", lo que contrasta con los 16.576 parametros reales del fichero safetensors publicado.

En cuanto al entrenamiento, no se ha completado ningun run. El repositorio incluye `training_args.json` con la receta por defecto del script: optimizador RMSprop con un schedule de linear warmup. El propio autor aclara que son valores de partida del script y no evidencia de un entrenamiento finalizado. No se documentan volumen de tokens, composicion del dataset, fases de RLHF/DPO ni tecnicas adicionales como decodificacion especulativa. El checkpoint `model.safetensors` se describe explicitamente como inicializacion valida para smoke tests, no como checkpoint entrenado ni evaluado. La receta recomendada por el autor incluye entrenar todos los baselines con la misma exposicion de datos, presupuesto de tuning y semillas aleatorias antes de publicar cualquier resultado.

## Capacidades

- No hay capacidades verificadas: el checkpoint no ha sido entrenado, por lo que no se puede afirmar que realice retrieval con calidad util.
- La arquitectura objetivo es retrieval (recuperacion), presumiblemente multimodal imagen-texto dado el uso de BeiT y la recomendacion de evaluar en Flickr30k, aunque el model card no lo explicita formalmente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni idiomas soportados.
- No se documentan modos especiales (thinking mode, vision, audio) mas alla de la propia naturaleza de BeiT como transformer visual.
- El unico artefacto funcional garantizado es el entry point de smoke test: `python run.py --help` y el bloque `__main__` del script.

## Casos de uso

- Punto de partida para un trabajo academico de retrieval: dado que el repositorio incluye codigo, configuracion y receta de entrenamiento, se puede clonar y extender para completar un run real sobre un dataset de recuperacion. Es adecuado porque elimina el trabajo de andamiaje inicial.
- Reproduccion de experimentos con control de semillas: la guia de evaluacion del autor pide reportar metricas sobre al menos tres semillas con baselines de capacidad equiparable; el repositorio sirve como esqueleto para ese protocolo.
- Smoke testing de pipelines de entrenamiento: el checkpoint de inicializacion permite verificar que el forward pass, el guardado y la carga de safetensors funcionan antes de lanzar un entrenamiento costoso.
- Evaluacion comparativa de arquitecturas de retrieval: al ser una implementacion propia con configuracion explicita, se puede emparejar contra alternativas de la misma tarea (por ejemplo, la implementacion Coca de Fionareyes/hw2-retrieval) bajo el mismo presupuesto de datos.
- Estudio de mecanismos de atencion: la combinacion de attention sliding window, concat mlp fusion y RMSNorm en un modelo de 16.576 parametros permite inspeccionar el comportamiento de estos componentes con un coste computacional minimo.
- Docencia y formacion: un checkpoint de este tamano se ejecuta en CPU y resulta util para explicar el flujo completo de configuracion, inicializacion y evaluacion de un transformer de retrieval sin requerir aceleradores.
- Integracion como adaptador en APIs genericas: el autor advierte que, al ser una implementacion personalizada, las APIs automaticas de carga requieren un adaptador explicito; el repositorio sirve de base para escribirlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card declara explicitamente que no se reclama ninguna puntuacion de benchmark en el repositorio y que el checkpoint publicado no ha sido entrenado. La unica referencia metodologica es la recomendacion de evaluar sobre Flickr30k reportando la metrica de la tarea sobre al menos tres semillas y con un baseline de capacidad equiparable.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (16.576 parametros); el consumo real dependera del tamano de las activaciones, que no esta documentado.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) es mas que suficiente, y tambien es viable en CPU.
- Cabe en GPU consumer: si, en cualquier modelo actual, e incluso en entornos sin GPU.
- Opciones de despliegue: al ser una implementacion propia en PyTorch, el despliegue estandar es la ejecucion directa de `run.py`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el autor indica que las APIs automaticas de carga necesitan un adaptador explicito.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparativa se limita a repositorios de la misma categoria (implementaciones de retrieval empaquetadas como tarea academica), ya que no existen metricas publicadas para este modelo. Los datos de rendimiento se marcan como no disponibles en todos los casos.

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Estado | Rendimiento |
|---|---|---|---|---|---|---|
| Witurner93/hw2-retrieval | BeiT, sliding window, concat mlp | 16.576 (checkpoint de inicializacion) | no disponible | Apache 2.0 | Checkpoint no entrenado | No disponible |
| Fionareyes/hw2-retrieval | Coca, retrieval | no disponible | no disponible | Apache 2.0 | Repositorio equivalente de otro autor | No disponible |
| CLIP (referencia de categoria para retrieval imagen-texto) | Transformer de doble torre | cientos de millones de parametros (no disponible el dato exacto en la informacion proporcionada) | no disponible | licencia propia de OpenAI | Modelo entrenado y publicado | No disponible en esta ficha |

No se dispone de datos de rendimiento comparables para establecer una jerarquia real entre estas opciones.

## Limitaciones y advertencias

- El checkpoint publicado no ha sido entrenado. Cualquier uso que asuma capacidades de retrieval producira resultados sin sentido.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, segun declara el propio autor.
- Existe una discrepancia entre la escala declarada ("giant") y el numero real de parametros del safetensors (16.576), lo que indica que la configuracion no describe el checkpoint publicado.
- Riesgo de alucinacion: no evaluable en un modelo sin entrenar; no se puede caracterizar.
- Limitaciones de contexto e idioma: no documentadas, por lo que se desconocen.
- Restricciones de licencia: el codigo y los pesos se publican bajo Apache 2.0, lo que permite uso comercial de este repositorio, pero el autor advierte de que deben revisarse por separado los terminos de los datos de origen si se usa con datasets externos.
- Para produccion: no es un artefacto apto. No hay pipeline declarado, no hay API de carga estandar y no existe adaptador publicado.
- Cualquier resultado obtenido en el futuro con un checkpoint entrenado debe documentarse de forma separada a los valores por defecto que se envian en este repositorio.
- El nombre del repositorio (hw2) y la existencia de repositorios equivalentes de otros autores apuntan a un contexto de ejercicio academico, aunque esta interpretacion no se confirma en el model card.

## Enlaces

- HuggingFace: https://huggingface.co/Witurner93/hw2-retrieval
- Repositorio equivalente de otro autor (Coca for Retrieval): https://huggingface.co/Fionareyes/hw2-retrieval
- Repositorio GitHub relacionado con la tarea: https://github.com/zhenwu0831/anlp-spring2026-hw2
- Paper de referencia sobre retrieval de LoRA: https://arxiv.org/abs/2402.09997
- Documentacion sobre tecnicas RAG (IBM): https://www.ibm.com/think/topics/rag-techniques

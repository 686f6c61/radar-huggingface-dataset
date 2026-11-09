# Vi-LAB/KenT-500M-Base

## Resumen

KenT-500M-Base es un modelo de lenguaje recurrente de la familia de modelos de espacio de estados (SSM), desarrollado por Vi-LAB y publicado bajo licencia Apache 2.0. Con aproximadamente 500 millones de parametros, el modelo se presenta como una alternativa a los transformers de atencion clasica para generacion de texto en vietnamita e ingles, apoyandose en una arquitectura de tiempo lineal que mantiene un estado de decodificacion de tamano constante independientemente de la longitud del contexto.

La propuesta arquitectonica de KenT se articula en torno a dos ideas: un espectro amplio con profundidad moderada (24 capas recurrentes idénticas y un flujo de representacion de anchura 1008) y una memoria con olvido aprendido basada en una media movil exponencial con un coeficiente de decaimiento por posicion espectral. El nucleo de transformacion de cada capa es ligero (cuatro bloques WNN con DCT fija), mientras que la mayor parte de los parametros reside en las proyecciones bilineales que mueven informacion entre el flujo de representacion y la rejilla espectral N x D (24 posiciones DCT x 192 caracteristicas).

El modelo se distribuye con pesos en FP16, requiere `trust_remote_code=True` y esta pensado como modelo base de investigacion, no como un modelo alineado para produccion. Su interes actual radica en explorar SSM recurrentes con procesamiento paralelo por bloques (chunk-parallelizable), lo que permite precargar documentos largos de forma concurrente y reutilizar prefijos mediante clonado del estado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSM recurrente con DCT fija y bloques WNN (state-space-model, linear-time) |
| Parametros totales | ~500M (denominacion del modelo; cifra exacta no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (estado de decodificacion de tamano constante; precarga por chunks de 1024 tokens) |
| Tipos de cuantizacion | FP16 (pesos publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

KenT es un modelo recurrente de la familia SSM que combina una rejilla espectral amplia con una profundidad moderada. Cada una de las 24 capas recurrentes idénticas contiene una cadena corta de K = 4 bloques WNN con la forma `Z <- Z + DCT(Linear(Norm(Z)))`, donde la transformada DCT es fija y no aprendida y la parte lineal actua sobre el eje D (192 caracteristicas por posicion). La representacion se expande mediante proyecciones bilineales hacia una rejilla N x D de 24 posiciones DCT por 192 caracteristicas, y la mayor parte de los parametros del modelo se concentra en esas proyecciones. El flujo que alimenta la `lm_head` tiene anchura 1008.

El modelo mantiene dos flujos separados: uno de representacion del token actual y otro de memoria que agrega el historial. La memoria se implementa como una media movil exponencial `H_t = (1 - a) * H_{t-1} + a * u_t`, donde `a` es un vector aprendido con un coeficiente por posicion espectral (N valores) en cada capa; los valores iniciales decrecen con la profundidad y con la posicion, de modo que las capas superficiales y las posiciones tempranas olvidan rapido mientras que las capas profundas y las posiciones tardias retienen mas tiempo. Al ser una recurrencia lineal, la media movil admite procesamiento por bloques en paralelo con un escaneo afin, lo que permite precargar documentos largos por chunks concurrentes y obtener el mismo resultado que el procesamiento secuencial.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset (la model card cita `wikimedia/wikipedia` como dataset) ni sobre si se aplicaron fases de RLHF o DPO. El autor presenta los principios de diseno como hipotesis que requieren verificacion experimental, no como garantias de rendimiento.

## Capacidades

- Generacion de texto autoregresiva en vietnamita e ingles.
- Modelo base sin alineacion: no incorpora por si mismo un modo de instrucciones ni de conversacion.
- Razonamiento y codigo: no se documentan capacidades especificas ni evaluaciones en estas areas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues limitadas a los dos idiomas declarados (vi, en).
- Procesamiento de documentos largos mediante precarga por chunks paralelos (`chunked=True`, `chunk_size`, `max_parallel_chunks`) con estado recurrente de tamano constante.
- Reutilizacion de prefijos mediante `cache.clone()` para generar multiples ramas a partir del mismo contexto sin recargarlo.
- Generacion en streaming a traves de la funcion `stream` de `infer.py`.

## Casos de uso

- Procesamiento de documentos largos en vietnamita: la precarga por chunks paralelos permite indexar o resumir documentos extensos dividiendolos en bloques de 1024 tokens procesados concurrentemente, con un estado final equivalente al procesamiento secuencial.
- Generacion de ramas multiples sobre un mismo prefijo: con `cache.clone()` se puede cargar una vez un contexto comun y generar varias continuaciones distintas, util para exploracion de hipotesis o generacion de variantes en tareas de redaccion.
- Investigacion en arquitecturas SSM: el modelo sirve como banco de pruebas reproducible para estudiar el efecto de la DCT fija, el olvido aprendido por posicion espectral y el procesamiento chunk-parallelizable frente a transformers de atencion.
- Experimentos de eficiencia en inferencia: al mantener un estado de decodificacion de tamano constante, es adecuado para medir coste y latencia en generacion de secuencias largas sin crecimiento del estado.
- Fine-tuning base para tareas en vietnamita: al ser un modelo base Apache 2.0, puede servir de punto de partida para ajuste supervisado en clasificacion, resumen o generacion de dominio especifico, previa evaluacion.
- Generacion de texto en ingles como linea base: util para comparar el comportamiento del modelo en un idioma de recursos altos frente al vietnamita y detectar desequilibrios de calidad entre ambos.
- Prototipado de asistentes de redaccion con streaming: la funcion `stream` permite mostrar tokens a medida que se generan, adecuado para interfaces de escritura asistida en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1 GB para los pesos de un modelo de ~500M parametros, mas el estado recurrente y las activaciones; el estado de decodificacion es de tamano constante respecto a la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP16; tarjetas consumer como RTX 3060, RTX 4060 o superiores son suficientes. Para precarga por chunks con `max_parallel_chunks` alto conviene una GPU con mas memoria (RTX 4090, A100, H100) para procesar varios chunks concurrentemente.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 4 GB o mas de VRAM en FP16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; el repositorio incluye `infer.py` para precarga por chunks y generacion en streaming. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KenT-500M-Base | ~500M | no disponible (estado constante) | SSM recurrente con DCT fija | Apache 2.0 | Hugging Face, requiere `trust_remote_code` |
| Alternativas SSM de ~500M | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas transformer de ~500M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo base de investigacion: el autor recomienda evaluarlo antes de usarlo en tareas reales; no esta alineado para instrucciones ni conversacion.
- Riesgo de alucinacion: no se documentan mitigaciones; al ser un modelo base entrenado sobre Wikipedia, puede generar contenido plausible pero incorrecto.
- Sesgos: no se documentan evaluaciones de sesgo; la composicion del dataset de entrenamiento no esta detallada mas alla de `wikimedia/wikipedia`.
- Idiomas: solo vietnamita e ingles; el rendimiento fuera de estos idiomas no esta garantizado.
- Memoria sin seleccion de contenido: la media movil exponencial olvida pasos antiguos pero no selecciona contenido por si misma, lo que puede limitar el acceso a informacion relevante en contextos muy largos.
- Compatibilidad: los pesos de checkpoints anteriores de KenT (coeficiente escalar por capa, bloques MLP) no son compatibles con esta arquitectura; es necesario entrenar desde cero.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene revisarlo antes de desplegarlo.
- El tokenizer y los pesos deben coincidir con `vocab_size` en `config.json`.
- Licencia Apache 2.0: permite uso comercial, pero sin garantias por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Vi-LAB/KenT-500M-Base
- Dataset citado: https://huggingface.co/datasets/wikimedia/wikipedia

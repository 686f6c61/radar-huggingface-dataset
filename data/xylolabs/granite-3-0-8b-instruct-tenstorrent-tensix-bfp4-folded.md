# Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BFP4-Folded

## Resumen

Granite 3.0 8B Instruct para Tenstorrent Tensix es una exportación cuantizada del modelo ibm-granite/granite-3.0-8b-instruct, preparada por Xylolabs para su ejecución sobre aceleradores Tenstorrent mediante la pila TT-Metal/TT-NN. El modelo conserva la arquitectura original de IBM (transformer denso de 8.372.187.136 parámetros) pero sustituye las proyecciones de atención y MLP por matrices cuantizadas en formato block floating point de 4 bits (bfloat4_b), con el multiplicador residual plegado en las matrices de salida de atención y de bajada del MLP antes de la cuantización.

La motivación de esta variante es puramente de despliegue: reducir el peso del modelo en memoria de dispositivo hasta unos 5,29 GB para los pesos del modelo de lenguaje, frente a los aproximadamente 16,74 GB que ocuparían esos mismos tensores almacenados en BF16. Para ello se aplica GPTQ con búsqueda de exponente por bloque, damping de 0,1 y 65.536 tokens de calibración procedentes de WikiText-2 y de la Wikipedia en coreano, y se mantienen en BF16 la embedding de entrada, la cabeza de salida (con copia explícita del peso atado) y las normas.

Es relevante ahora porque abre la posibilidad de ejecutar un modelo de 8B con calidad conversacional sobre hardware Tenstorrent (Blackhole y Tensix en general) sin necesidad de GPUs convencionales, y porque documenta un pipeline reproducible de cuantización BFP4 con verificación de empaquetado nativo en TT-NN. El checkpoint incluye herramientas de validación (`pack_tensix.py`, `verify_grid.py`) y una evaluación de divergencia KL frente al modelo original sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de IBM Granite 3.0 8B Instruct), 40 capas, con proyecciones cuantizadas en BFP4 |
| Parametros totales | 8.372.187.136 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (bfloat4_b, 4,5 bits por peso) en 280 matrices de proyeccion; BF16 en embedding, cabeza atada y normas; promedio de 5,05 bits por peso almacenado |
| Idiomas soportados | Ingles y coreano (segun la model card); el modelo base de IBM soporta mas idiomas, pero la calibracion de esta exportacion se hizo con WikiText-2 y Wikipedia en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores BF16 sobre rejillas BFP4), con `quant4.json` describiendo el formato de cada matriz |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de IBM con 40 capas y 8.372 millones de parametros, entrenado originalmente por IBM con datos multilingues y ajustado con instrucciones. Esta exportacion no reentrena el modelo: parte de los pesos de `ibm-granite/granite-3.0-8b-instruct` y aplica un proceso de cuantizacion post-entrenamiento. En concreto, el multiplicador residual se pliega en las 80 matrices de salida de atencion y de bajada del MLP antes de cuantizar, de modo que el `config` resultante usa `residual_multiplier: 1.0` para que la escala ya plegada se aplique una sola vez.

La cuantizacion emplea GPTQ con busqueda de exponente por bloque sobre una rejilla de block floating point, con damping de 0,1 y 65.536 tokens de calibracion (WikiText-2 y Wikipedia en coreano). Las 280 matrices de proyeccion (q/k/v/output y gate/up/down en las 40 capas) se almacenan en `bfloat4_b` a 4,5 bits por peso, mientras que la embedding de entrada, la copia explicita de la cabeza atada y las normas permanecen en BF16. El archivo `quant4.json` documenta el formato de cada una de las 280 matrices. El autor indica que todas ellas pasan las comprobaciones de rejilla, empaquetado nativo en TT-NN y empaquetado como BFP8, y que el ejemplo de empaquetado se verifico en el simulador de Blackhole con TT-NN 0.81.1. No se han publicado detalles sobre el entrenamiento original de IBM (composicion exacta del dataset, uso de RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en formato instruct, con la plantilla de chat, tokenizer y ajustes de EOS originales de IBM Granite 3.0 8B Instruct.
- Razonamiento general y respuesta a preguntas, heredado del modelo base de IBM.
- Generacion de codigo y matematicas (capacidades del modelo base; no se aportan metricas especificas en esta exportacion).
- Capacidades multilingues limitadas en la practica a ingles y coreano segun la model card, aunque el modelo base de IBM declara un soporte mas amplio.
- Compatibilidad con `transformers` (AutoModelForCausalLM, AutoTokenizer) y con `device_map="auto"` para inferencia en PyTorch.
- Ejecucion sobre hardware Tenstorrent Tensix mediante TT-NN, con empaquetado nativo de las matrices cuantizadas en BFP4/BFP8.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para esta exportacion (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: la evaluacion menciona siete "thinking items", pero no se documenta una capacidad de modo thinking explicita en esta exportacion.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. El checkpoint esta disenado para cargarse en TT-NN sobre Tensix/Blackhole con unos 5,29 GB de pesos en memoria de dispositivo, lo que permite servir un 8B conversacional en hardware no-GPU con verificacion de empaquetado incluida.
- Inferencia conversacional de bajo coste en PyTorch: con `transformers` y `device_map="auto"` se puede usar como modelo instruct de 8B en BF16 sobre GPU convencional, aceptando el sobrecoste de memoria del almacenamiento BF16 sobre rejillas BFP4 (16,74 GB en total).
- Validacion de pipelines de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que ninguna matriz cambia de valor al empaquetarse en TT-NN, util para equipos que integran cuantizacion BFP4 en sus propias cadenas.
- Prototipado en simulador: el ejemplo de empaquetado se verifico en el simulador de Blackhole con TT-NN 0.81.1, por lo que sirve para desarrollar y depurar kernels sin hardware fisico.
- Asistentes en ingles y coreano: la calibracion incluye Wikipedia en coreano y la model card declara ambos idiomas, lo que lo hace adecuado para tareas de generacion de texto en esas dos lenguas.
- Evaluacion comparativa de calidad de cuantizacion: al incluir metricas de divergencia KL frente al BF16 original y frente a Q4_K_M, es util como referencia para estudiar el impacto de BFP4 con plegado residual en modelos de 8B.
- Investigacion sobre block floating point: sirve como banco de pruebas para analizar el comportamiento de rejillas BFP4 con busqueda de exponente por bloque en un transformer completo de 40 capas.

## Benchmarks y rendimiento

La model card incluye una evaluacion de divergencia respecto al modelo original sin cuantizar, sobre 33 items "normales" y 7 items "thinking":

| Perfil | KL media frente a BF16 original | Aciertos normales (de 33) | Aciertos thinking (de 7) | Perdidas contabilizadas |
|---|---:|---:|---:|---:|
| BF16 original sin plegar | 0 | 25 | 0 | — |
| Esta exportacion BFP4 plegada | 0,073263472930 | 26 | 0 | 0 |
| Q4_K_M del mismo modelo original | 0,059211 | 23 | 0 | 0 |

El autor senala que la puerta relativa "rule-7" se cumple: la KL de esta exportacion es 1,237329 veces la de Q4_K_M, dentro del limite de 1,5 veces, y con como maximo una perdida contabilizada adicional. Los siete items de tipo thinking no tienen respuesta elegible correcta en BF16. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 5,29 GB solo para los pesos del modelo de lenguaje en el formato BFP4 empaquetado, mas espacio para la cache KV y buffers. Cargado en PyTorch como BF16 sobre rejillas BFP4, el repositorio ocupa 16,74 GB (16,7 GB de tamano de repo).
- GPU recomendadas: no se especifican en la informacion proporcionada. Por el tamano en BF16, una GPU de 24 GB (RTX 4090, A10G, L4 de 24 GB) es el minimo practico para la carga completa en BF16; con 5,29 GB empaquetados el requisito baja, pero depende del runtime.
- Cabe en consumer GPU: si, en BF16 en GPUs de 24 GB o mas; en el formato empaquetado BFP4 el peso es de 5,29 GB, pero el soporte de ese formato fuera de TT-NN no esta documentado.
- Opciones de despliegue: `transformers` 5.23.0 con PyTorch (quickstart oficial), TT-NN 0.81.1 sobre Tenstorrent Tensix/Blackhole (con `pack_tensix.py` y `verify_grid.py`), y el simulador de Blackhole. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor indica que tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BFP4-Folded | 8.372.187.136 | No disponible | BFP4 (4,5 bits/peso) con plegado residual, safetensors | Apache 2.0 | Hugging Face, 30 descargas |
| ibm-granite/granite-3.0-8b-instruct (modelo base) | 8B aprox. | No disponible en la informacion proporcionada | BF16 original | Apache 2.0 | Hugging Face (modelo base) |
| Q4_K_M del mismo modelo original (referencia de la model card) | 8B aprox. | No disponible | GGUF Q4_K_M | Apache 2.0 (heredada) | Referenciado en la evaluacion del autor |

La comparativa se limita a estas tres variantes porque la informacion proporcionada no incluye otros modelos de la misma categoria con datos verificables. En terminos de calidad, la exportacion BFP4 plegada obtiene una KL de 0,073 frente al BF16 original, ligeramente peor que Q4_K_M (0,059), pero con mas aciertos en los 33 items normales (26 frente a 23).

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una divergencia medible frente al BF16 original (KL media de 0,073), superior a la de Q4_K_M (0,059); en tareas sensibles a la precision puede degradar la calidad.
- El plegado del multiplicador residual obliga a mantener `residual_multiplier: 1.0` en la configuracion; usar otro valor aplicaria la escala dos veces y romperia la salida.
- El checkpoint esta pensado para TT-NN; fuera de ese runtime, el almacenamiento BF16 sobre rejillas BFP4 ocupa 16,74 GB y no aporta la ventaja de memoria del formato empaquetado.
- tt-transformers y tt-forge no se han probado con este checkpoint, por lo que la integracion con esas pilas no esta validada.
- Los idiomas declarados son ingles y coreano; el rendimiento en otros idiomas no esta documentado y la calibracion solo cubrio WikiText-2 y Wikipedia en coreano.
- No hay datos publicados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni de latencia/throughput.
- Riesgo de alucinacion y sesgos: inherentes al modelo base de IBM; no se documentan analisis especificos en esta exportacion.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de IBM y de los datos de calibracion.
- El modelo tiene solo 30 descargas y 0 likes, con creacion en noviembre de 2026; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BFP4-Folded
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-instruct
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BFP4-Folded/blob/main/LICENSE

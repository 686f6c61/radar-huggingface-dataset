# wckwan/WebShop-Olmo3-7B-SEED-s1000

## Resumen

WebShop-Olmo3-7B-SEED-s1000 es un ajuste por aprendizaje por refuerzo del modelo instructivo allenai/Olmo-3-7B-Instruct, publicado por el usuario wckwan en HuggingFace. No es un modelo de propósito general: es una política entrenada para actuar como agente de búsqueda multi-turno al estilo Search-R1, es decir, un modelo que alterna razonamiento en lenguaje natural con llamadas a una herramienta de búsqueda y consume las respuestas recuperadas antes de emitir una respuesta final orientada a una tarea de compra (WebShop).

La innovación principal declarada por el autor es el método de entrenamiento, denominado Process-GRPO: se aplica GRPO (Group Relative Policy Optimization) con un modelo de recompensa de proceso (un verificador Olmo-3-7B-Think) que puntúa cada turno de la trayectoria, en lugar de asignar una única recompensa final. El autor añade una normalización de ventajas por (grupo, posición de turno) y construye los prompts del verificador incluyendo las respuestas recuperadas por la herramienta y la respuesta de referencia (gold answer).

El repositorio contiene la política final en la raíz (paso 100) más checkpoints intermedios en step_20, step_40, step_60 y step_80, con un tamaño total de 73,0 GB. Es un modelo con 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks estándar publicados, por lo que su interés es principalmente como artefacto de investigación sobre RL con recompensa de proceso en agentes de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base allenai/Olmo-3-7B-Instruct); ajuste posterior mediante RL con GRPO sobre una política de agente |
| Parametros totales | Aproximadamente 7.000 millones (cifra nominal deducida del nombre del modelo base; valor exacto no disponible) |
| Parametros activos | No aplica (no se describe como modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors a precision completa; no se han publicado versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible en la informacion proporcionada (el campo de idiomas de la model card no esta cumplimentado; el entrenamiento declarado se realiza sobre una tarea en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, cargables con transformers |
| Tamano del repositorio | 73,0 GB (incluye politica final y 4 checkpoints intermedios) |
| Modelo base | allenai/Olmo-3-7B-Instruct |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-29 |
| Fecha de actualizacion | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo OLMo 3 de 7B en su variante instructiva, desarrollado por Ai2 (Allen Institute for AI). Segun la informacion publica de Ai2 recogida en la busqueda web, la familia OLMo 3 se entrena sobre el corpus Dolma 3, de aproximadamente 9,3 billones de tokens, y se distribuye junto con el codigo de entrenamiento, las recetas de datos y los checkpoints intermedios. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones ocultas, tipo de atencion ni estrategia posicional del modelo base.

Sobre esa base, el autor aplica un ajuste por aprendizaje por refuerzo con GRPO para convertir el modelo en un agente de busqueda multi-turno. El rasgo distintivo es el uso de un modelo de recompensa de proceso: el verificador Olmo-3-7B-Think puntua cada turno de la trayectoria en lugar de evaluar unicamente el resultado final. Los prompts enviados al verificador incluyen las respuestas devueltas por la herramienta de busqueda y la respuesta de referencia, de modo que la recompensa depende tanto del razonamiento intermedio como de la informacion efectivamente recuperada. El autor indica ademas el uso de normalizacion de ventajas por (grupo, posicion de turno), un ajuste pensado para evitar que las ventajas se diluyan a lo largo de trayectorias con distinto numero de turnos.

El entrenamiento reportado consta de 100 pasos, con checkpoints guardados cada 20 pasos. En el paso final, la puntuacion media de recompensa de proceso es de aproximadamente 0,93; el numero medio de busquedas por trayectoria es de 2,6, lo que el autor interpreta como una politica diversa y no colapsada; y la precision sobre el lote de entrenamiento es de aproximadamente 0,49. No se documentan en la model card el volumen del dataset de entrenamiento, la composicion de las trayectorias ni si se aplicaron etapas adicionales de SFT o DPO antes del RL.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, heredados del modelo instructivo OLMo 3 7B.
- Uso de herramientas (tool calling) orientado a busqueda: el modelo emite llamadas a una herramienta de retrieval, consume las respuestas y continua la trayectoria.
- Razonamiento multi-turno y multi-paso: la politica declara una media de 2,6 busquedas por trayectoria, lo que implica encadenamiento de varias llamadas antes de la respuesta final.
- Toma de decisiones secuenciales orientadas a un objetivo de compra (entorno WebShop), incluyendo la formulacion de consultas de busqueda sucesivas.
- Generacion de razonamiento explicito previo a la accion, en el estilo de los agentes Search-R1.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo de pensamiento (thinking mode) explicito: no documentado en la model card, aunque el verificador asociado se denomina Olmo-3-7B-Think.

## Casos de uso

- Agente de busqueda multi-turno en dominios de catalogo: el modelo puede encadenar consultas sucesivas contra un indice de productos o documentos, refinando la consulta a partir de los resultados previos, con una media observada de 2,6 busquedas por trayectoria.
- Investigacion sobre RL con recompensa de proceso: el repositorio incluye checkpoints intermedios en los pasos 20, 40, 60 y 80, lo que permite estudiar la evolucion de la politica y la dinamica de colapso o diversificacion de las busquedas a lo largo del entrenamiento.
- Generacion de datos sinteticos de trayectorias de agente: el modelo puede usarse para producir trayectorias etiquetables de busqueda y respuesta, utiles para destilar agentes mas pequenos o para ampliar datasets de evaluacion.
- Evaluacion de verificadores (reward models): al estar entrenado contra un verificador Olmo-3-7B-Think, sirve como caso de estudio para medir hasta que punto una politica se adapta al verificador frente a la tarea real.
- Asistente de compra con acceso a herramientas: integrado en un pipeline que exponga un endpoint de busqueda, el modelo puede gestionar conversaciones donde el usuario describe un requisito y el sistema recupera opciones antes de recomendar.
- Reproduccion de experimentos de RL: dado que la licencia es Apache 2.0 y el modelo base tambien es abierto, es posible reejecutar o extender el entrenamiento sobre el mismo punto de partida sin restricciones de uso comercial.
- Comparacion de tecnicas de RL para agentes: sirve como referencia para contrastar GRPO con recompensa de proceso frente a RL con recompensa final (outcome reward) en tareas de retrieval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WebShop success rate, etc.) en la informacion disponible. Las unicas metricas proporcionadas son de entrenamiento, no de evaluacion sobre un conjunto separado:

| Metrica | Valor | Contexto |
|---|---|---|
| Puntuacion media de recompensa de proceso | ~0,93 | Paso 100 (politica final) |
| Busquedas por trayectoria | ~2,6 | Paso 100; el autor lo interpreta como politica no colapsada |
| Precision sobre el lote de entrenamiento | ~0,49 | Paso 100 |
| MMLU, HumanEval, GSM8K, WebShop | No disponible | Sin resultados publicados |

Existe un dataset asociado, wckwan/WebShop-Olmo3-7B-SEED-eval, publicado por el mismo autor, pero no se han encontrado en la informacion proporcionada los resultados obtenidos sobre el.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 15-16 GB solo para los pesos de un checkpoint de 7B, mas la cache KV, que crece con la longitud de contexto y el numero de secuencias concurrentes. En la practica, un unico checkpoint completo requiere del orden de 18-24 GB para contextos moderados.
- GPU recomendadas: A100 40 GB o 80 GB y H100 para servicio con concurrencia; L40S o A6000 como alternativas de 48 GB; RTX 4090 o RTX 3090 (24 GB) para un unico flujo de inferencia.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 4090, RTX 3090, RTX 4080 Super con margen limitado) en BF16 con contexto corto, y en tarjetas de 12-16 GB si se cuantiza a 8 o 4 bits, ya que a 4 bits los pesos ocupan del orden de 4-5 GB.
- Cuantizacion: no hay versiones GGUF, GPTQ ni AWQ publicadas en el repositorio, por lo que cualquier despliegue cuantizado exige una conversion propia (por ejemplo, con llama.cpp o bitsandbytes).
- Opciones de despliegue: transformers (metodo documentado por el autor), vLLM o TGI para servicio con throughput alto. llama.cpp y Ollama son viables unicamente tras convertir los pesos a GGUF.
- Almacenamiento: el repositorio completo ocupa 73,0 GB porque incluye los checkpoints step_20, step_40, step_60 y step_80 ademas de la politica final; para descargar solo un checkpoint conviene usar el parametro subfolder.
- Coste por consulta: al ser un agente multi-turno, cada peticion implica varias llamadas al modelo (media de 2,6 busquedas mas el turno final), de modo que el coste efectivo por consulta es varias veces el de una generacion simple.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WebShop-Olmo3-7B-SEED-s1000 | ~7B | No disponible | GRPO con recompensa de proceso (Process-GRPO) sobre Olmo-3-7B-Instruct | Apache 2.0 | Pesos en safetensors, 5 checkpoints |
| allenai/Olmo-3-7B-Instruct (base) | ~7B | No disponible | SFT / ajuste instructivo | Apache 2.0 | Modelo de referencia de Ai2 |
| Agentes de busqueda tipo Search-R1 (por ejemplo, sobre Qwen2.5-7B-Instruct) | 7B | No disponible | RL con GRPO y recompensa final sobre tarea de retrieval | Apache 2.0 (segun variante) | Multiples implementaciones publicas |
| Otros agentes RAG con RL (family R1-Searcher, ReSearch) | 7B | No disponible | RL con recompensa final | Apache 2.0 (segun variante) | Repositorios de investigacion |

La comparacion cuantitativa de rendimiento entre estas alternativas no esta disponible en la informacion proporcionada: no se han publicado metricas de exito en WebShop ni de exactitud en tareas de QA con retrieval para este modelo.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste por RL se ha realizado sobre una tarea concreta de agente de busqueda. No hay evidencia en la informacion disponible de que las capacidades generales del modelo base se conserven intactas; es esperable cierto olvido catastrofico fuera del dominio de entrenamiento.
- Precision sobre el lote de entrenamiento de aproximadamente 0,49: el propio autor reporta un valor cercano al 50 %, lo que indica que la politica dista de resolver la tarea de forma fiable, con independencia de que la recompensa de proceso sea alta (0,93). Una recompensa de proceso elevada con exactitud baja es un indicio clasico de desajuste entre el verificador y el objetivo real.
- Riesgo de reward hacking: al optimizar contra un verificador concreto (Olmo-3-7B-Think) durante 100 pasos, la politica puede explotar sesgos del verificador en lugar de mejorar la tarea.
- Alucinacion: el modelo es un generador de texto autoregresivo y puede producir contenido no respaldado por las respuestas recuperadas por la herramienta, especialmente cuando la busqueda no devuelve informacion relevante.
- Idioma: los idiomas soportados no estan declarados. El entrenamiento se realiza sobre una tarea en ingles, por lo que el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto: no disponible en la informacion proporcionada. En un agente multi-turno que acumula respuestas de busqueda, la ventana de contexto es un parametro critico que deberia verificarse antes de desplegar.
- Formato de la herramienta: el modelo espera un esquema concreto de llamada a la herramienta heredado del pipeline Search-R1. Cambiar el formato de las llamadas puede degradar gravemente el comportamiento.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin resultados de evaluacion publicados. No debe asumirse ningun nivel de calidad en produccion.
- Licencia: Apache 2.0, lo que permite uso comercial, pero conviene revisar la licencia del entorno WebShop y de los datos de entrenamiento originales, no documentados en la model card.
- Nomenclatura no documentada: el sufijo "SEED-s1000" del nombre del repositorio no se explica en la model card.
- Coste de almacenamiento: 73,0 GB de repositorio por incluir checkpoints intermedios; descargar el repositorio completo para usar solo la politica final es ineficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wckwan/WebShop-Olmo3-7B-SEED-s1000
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Dataset de evaluacion asociado: https://huggingface.co/datasets/wckwan/WebShop-Olmo3-7B-SEED-eval
- Ficheros del dataset de evaluacion: https://huggingface.co/datasets/wckwan/WebShop-Olmo3-7B-SEED-eval/tree/main
- Pagina de OLMo en Ai2: https://allenai.org/olmo
- Repositorio de codigo de OLMo (Ai2): https://github.com/allenai/OLMo
- Ficha de la familia OLMo 3 en Open Source AI Map: https://www.aipotluck.org/product/olmo

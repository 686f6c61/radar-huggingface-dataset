# sup2ch/russian-npc-125m

## Resumen

Russian NPC Voice 125M es un modelo derivado de RuGPT3 Small (ai-forever/rugpt3small_based_on_gpt2) publicado por el usuario sup2ch en Hugging Face. No se trata de un modelo generativo de propósito general, sino de un sistema de selección de réplicas para NPC de videojuegos en ruso: el motor del juego le pasa los hechos actuales de la escena y el modelo elige una introducción corta de un catálogo aprobado por personaje, combinándola con el hecho verificado. El modelo base tiene 125 231 616 parámetros y está pensado para ejecutarse en CPU.

La propuesta es interesante porque invierte el paradigma habitual de los NPC conversacionales: en lugar de generar texto libre (con el riesgo de alucinación asociado), el modelo actúa como clasificador y enrutador sobre un conjunto cerrado de frases aprobadas. Según la model card, un clasificador específico para el personaje "Лёва" se entrenó con 40 introducciones positivas, 32 negativos difíciles y 80 introducciones de otros personajes, usando embeddings de RuGPT y características a nivel de carácter.

El modelo es relevante para desarrolladores de juegos que necesiten diálogos de NPC controlados, deterministas y auditables en ruso, con requisitos de hardware mínimos. La información pública disponible es escasa (0 descargas, 0 likes en el momento de la consulta) y la licencia no está declarada, lo que limita su adopción en producción sin aclaraciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), base RuGPT3 Small |
| Parametros totales | 125 231 616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el autor menciona build de PyTorch CPU) |
| Idiomas soportados | Ruso (ru) |
| Licencia | No disponible |
| Formato de pesos | safetensors (base RuGPT3 Small); artefactos del clasificador empaquetados en ZIP junto a config.json |

## Arquitectura y entrenamiento

El modelo se apoya en RuGPT3 Small, un transformer decoder-only de tipo GPT-2 con 125 millones de parámetros y tokenizador adaptado al ruso, publicado por ai-forever y descrito en Zmitrovich et al. (2024). Sobre esa base, el autor entrena un clasificador de personaje que puntúa introducciones candidatas a partir de embeddings de RuGPT y de rasgos a nivel de carácter. Además, el sistema incorpora un motor de reglas que hace coincidir los hechos de la escena con prefijos de pregunta declarados por el desarrollador (`when`), y normaliza espacios al trasladar el hecho a la respuesta.

El entrenamiento del clasificador es deliberadamente ligero: según la model card, con cuatro hilos de CPU tarda 4,2 s incluyendo la carga de la base y la escritura de pesos, y un reentrenamiento desde cero tarda 10,4 s reproduciendo pesos y vocabulario de forma bit a bit. No se documenta el volumen de tokens de preentrenamiento (corresponde al informe de RuGPT3 Small), ni si hubo RLHF o DPO; el ajuste descrito es supervisado sobre un catálogo pequeño de frases aprobadas. La innovación destacable no es arquitectónica, sino de diseño: separar la generación de texto libre de la selección de réplicas, restringiendo la salida a un catálogo auditado y a hechos verificados por el motor del juego.

## Capacidades

- Selección de réplicas de NPC a partir de un catálogo aprobado por personaje, en ruso.
- Enrutamiento de hechos de escena: el motor pasa hechos tipificados (`info`, `offer`, `deny`) y el modelo elige la introducción adecuada.
- Coincidencia por prefijos de pregunta con conjuntos alternativos (`when`), permitiendo varias formulaciones para un mismo hecho.
- Normalización de espacios al insertar el hecho en la respuesta.
- Respuesta de "sin información" cuando la pregunta no coincide con ninguna regla.
- Clasificador específico para el personaje "Лёва"; para "Прасковья" y "Вера" se usa el clasificador previo.
- Ejecución en CPU con `setup_cpu(4)` (cuatro hilos), sin requisito de GPU.
- No se documentan capacidades de tool calling genérico, agentes multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- **NPC de taller o mecánico en un juego ruso**: el motor actualiza la disponibilidad del elevador tras una reparación y el modelo selecciona la introducción de Лёва que anuncia el nuevo estado, insertando el hecho verificado ("Подъёмник можно проверить сейчас."). Es adecuado porque la salida queda restringida a frases aprobadas y a hechos del motor.
- **Personajes con estado dinámico (precios, horarios, stock)**: cada cambio de estado se pasa como hecho tipificado y el modelo elige la introducción correcta entre las del catálogo, evitando que el NPC invente cifras.
- **Diálogos con múltiples personajes en un mismo juego**: el sistema soporta tres personajes (Лёва, Прасковья, Вера) con clasificadores separados, lo que permite reutilizar el mismo motor para distintos NPC.
- **Prototipado rápido en CPU**: gracias al entrenamiento en segundos y a la inferencia en CPU, un equipo de diseño puede iterar catálogos de frases y reglas de coincidencia sin infraestructura GPU.
- **Sistemas de diálogo auditables en producción**: al no generar texto libre, cada respuesta es trazable a una entrada del catálogo y a un hecho del motor, lo que facilita revisiones de contenido y localización.
- **Modding y juegos independientes en ruso**: el paquete se descarga con el CLI de Hugging Face y se ejecuta con Python 3.12 y PyTorch CPU, lo que encaja en pipelines de build modestos.
- **Evaluación de sistemas de NPC con hechos verificados**: la model card documenta una prueba ciega con 24 escenas y pares con cambio de estado, útil como referencia metodológica para validar NPC con hechos anclados.

## Benchmarks y rendimiento

La model card no reporta benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye una evaluación ciega propia sobre 24 escenas nuevas con etiquetas mezcladas y un revisor independiente:

| Modo | Лёва, hechos | Лёва, hechos y carácter | Todos los NPC, hechos | Pares con cambio de estado |
|---|---:|---:|---:|---:|
| Versión anterior | 14/14 | 3/14 | 24/24 | 5/5 |
| Catálogo verificado | 14/14 | 8/14 | 24/24 | 5/5 |
| Catálogo verificado y clasificador de Лёва | 14/14 | 12/14 | 24/24 | 5/5 |

En comparación por pares de Лёва frente a la versión anterior, con el catálogo verificado se observaron 6 mejoras y 1 empeoramiento; con el clasificador de Лёва, 9 mejoras y 0 empeoramientos. Las respuestas de Прасковья y Вера coincidieron en las 10 escenas evaluadas. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el autor indica `setup_cpu(4)` (cuatro hilos) y una build de PyTorch para CPU (`torch>=2.6,<3`), lo que sugiere que el modelo está pensado para ejecutarse sin GPU.
- VRAM estimada: no disponible; al ejecutarse en CPU, la memoria relevante es la RAM del sistema, no la VRAM.
- GPU recomendadas: no aplica según la documentación; no se especifican GPU compatibles.
- ¿Cabe en GPU consumer? No se documenta; el diseño apunta a CPU.
- Opciones de despliegue: el autor proporciona un paquete propio (`npc.prepare`, `npc.approved`, `npc.model`) con Python 3.12 y PyTorch CPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se documenta el tiempo de entrenamiento del clasificador (4,2 s con cuatro hilos de CPU, 10,4 s desde cero).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sup2ch/russian-npc-125m | 125 231 616 | No disponible | Clasificador de réplicas + hechos anclados, ruso | No disponible | Hugging Face (0 descargas) |
| ai-forever/rugpt3small_based_on_gpt2 | 125 M aprox. | No disponible en esta ficha | Generación de texto libre en ruso | No disponible en esta ficha | Hugging Face (modelo base) |
| Modelos de NPC basados en LLM generativo | Variable | Variable | Generación libre con prompts | Variable | Variable |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas de la misma categoría; la comparativa se limita a enfoque, tamaño y disponibilidad.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no se puede confirmar el uso comercial sin consultar al autor.
- El modelo solo soporta ruso; no hay evidencia de capacidades multilingües.
- La calidad depende críticamente de la veracidad de los hechos, de las reglas de coincidencia (`when`) y del catálogo de frases; un catálogo pobre o reglas mal definidas degradan la respuesta.
- El sistema no genera texto libre: fuera del catálogo aprobado y de los hechos del motor, la respuesta es "sin información".
- Riesgo de alucinación: bajo por diseño en el enrutamiento de hechos, pero los embeddings del clasificador pueden elegir una introducción poco adecuada si el catálogo es ambiguo.
- Sesgos conocidos: no documentados; al entrenarse con frases originales del autor, los sesgos del corpus base de RuGPT3 Small no se detallan en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado, lo que indica ausencia de validación por la comunidad.
- La evaluación se limita a 24 escenas y tres personajes; no hay evidencia de generalización a otros dominios o personajes.
- El paquete requiere descargar por separado la base RuGPT3 Small desde una revisión fijada y verificar SHA-256, lo que añade pasos operativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sup2ch/russian-npc-125m
- Modelo base: https://huggingface.co/ai-forever/rugpt3small_based_on_gpt2
- Revisión fijada de la base: https://huggingface.co/ai-forever/rugpt3small_based_on_gpt2/tree/a9307e696cd3c5b7f953ff4cb19d76a4d81821d5
- Artículo de RuGPT3 (Zmitrovich et al., 2024): https://aclanthology.org/2024.lrec-main.45/
- Documentación de estadísticas de descargas de Hugging Face: https://huggingface.co/docs/hub/models-download-stats
- Índice de PyTorch CPU: https://download.pytorch.org/whl/cpu

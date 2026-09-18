# yuhengtu-bytedance/DataDecide-falcon-1B-57500_60000_62500_65000_67500_weightedavg_merge

## Resumen

`DataDecide-falcon-1B-57500_60000_62500_65000_67500_weightedavg_merge` es un modelo de lenguaje de 1.279.854.592 parámetros (aproximadamente 1,28 B) publicado por el usuario `yuhengtu-bytedance` en HuggingFace. No es un modelo entrenado desde cero: es el resultado de fusionar cinco checkpoints intermedios de entrenamiento (steps 57500, 60000, 62500, 65000 y 67500) de un modelo de la familia Falcon de 1 B de parámetros, mediante interpolación lineal con pesos normalizados, usando la herramienta mergekit.

Su interés es fundamentalmente metodológico. El repositorio pertenece a la línea de experimentos sobre fusión de pesos y "model soups" (arXiv:2203.05482), y la nomenclatura interna (`merge_scaling_ckpts_cache`) apunta a un estudio de escalado de merges dentro de un proyecto de medición. El nombre del modelo documenta de forma explícita qué checkpoints se han promediado y con qué peso relativo (1, 2, 3, 4 y 5, respectivamente, tomando step67500 como base y a la vez como participante del promedio).

El artefacto se distribuye únicamente en safetensors con pesos en bfloat16 (el merge se calculó en float32 y se volcó a bfloat16), con un repositorio de 2,6 GB. No incluye model card técnica más allá del YAML de configuración del merge, ni licencia declarada, ni idiomas soportados, ni benchmarks. Con 0 descargas y 0 likes en el momento de redactar esta ficha, debe tratarse como un artefacto de investigación reproducible, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only. La etiqueta de arquitectura del repositorio en transformers es `llama`, mientras que los checkpoints de origen se identifican como `falcon` en el nombre del modelo. Numero de capas, cabezas y dimension oculta: no disponible |
| Parametros totales | 1.279.854.592 (aproximadamente 1,28 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El repositorio no distribuye versiones cuantizadas. Pesos originales en bfloat16 (merge calculado en float32, salida en bfloat16). Admite cuantizacion posterior a int8/int4/GGUF con herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16). Tamano del repositorio: 2,6 GB |
| Metodo de fusion | Linear merge (weighted average) con `normalize: true`, via mergekit |
| Checkpoints fusionados | step57500 (peso 1), step60000 (peso 2), step62500 (peso 3), step65000 (peso 4), step67500 (peso 5). Base declarada: step67500 |
| Fecha de publicacion | 17 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo mas alla de las etiquetas del repositorio. Se trata de un transformer decoder-only (categoria `text-generation` en transformers) cuyo esqueleto procede de los checkpoints de origen de la familia Falcon de 1 B. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion, el tamano de vocabulario ni el tipo de embeddings posicionales.

El proceso de creacion no es un entrenamiento nuevo, sino una interpolacion de pesos. Segun el YAML publicado, los cinco checkpoints se combinaron con el metodo Linear de mergekit, con pesos 1, 2, 3, 4 y 5 asignados a los steps 57500, 60000, 62500, 65000 y 67500 respectivamente, `normalize: true`, dtype de calculo float32 y dtype de salida bfloat16. El checkpoint step67500 actua simultaneamente como base declarada y como participante del promedio con el peso mayor, de modo que el resultado esta sesgado hacia el estado de entrenamiento mas avanzado. No se documentan fases de RLHF, DPO ni instruction tuning: son checkpoints de preentrenamiento, por lo que el resultado es un modelo base, no un modelo de chat. Tampoco se indica el numero de tokens vistos en cada checkpoint, la composicion del dataset ni si hubo decodificacion especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto autoregresiva y continuacion de secuencias: es la unica capacidad garantizada por el pipeline declarado (`text-generation`).
- Modelo base sin ajuste por instrucciones: no hay plantilla de chat ni formato de turnos documentado, por lo que no se debe esperar seguimiento fiable de instrucciones conversacionales.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Uso como agente o razonamiento multi-paso: no disponible; no hay evidencia de entrenamiento orientado a agentes.
- Razonamiento matematico y generacion de codigo: no documentado. El repositorio se etiqueta con `llama` como tipo de arquitectura, pero no hay datos de evaluacion que respalden capacidades de codigo o matematicas.
- Capacidades multilingues: no disponible. No se declara lista de idiomas.
- Vision, audio o modalidades adicionales: no disponibles; la etiqueta de pipeline es exclusivamente de texto.
- Modo "thinking" o razonamiento explicito: no disponible.
- Valor como objeto de estudio: capaz de reproducir un experimento de fusion de pesos y de servir como punto de partida para fine-tuning a bajo coste computacional.

## Casos de uso

- Investigacion sobre fusion de pesos y "model soups": el repositorio incluye la configuracion YAML exacta y los pesos relativos de cada checkpoint, de modo que un equipo puede replicar el merge, variar los pesos o comparar el promedio ponderado contra cada checkpoint individual para medir el efecto de la interpolacion.
- Punto de partida para fine-tuning con presupuesto reducido: con 1,28 B de parametros, un ajuste supervisado sobre una tarea concreta (clasificacion de textos, resumen extractivo, extraccion de entidades) cabe en una unica GPU de 24 GB o incluso en configuraciones con LoRA sobre GPU de 12 GB.
- Generacion de texto en local o en el borde: al ocupar aproximadamente 2,6 GB en bfloat16, puede desplegarse en portatiles con GPU integrada o CPU, para tareas de autocompletado, etiquetado o generacion de borradores sin enviar datos a terceros.
- Banco de pruebas de infraestructura de inferencia: su tamano lo hace idoneo para comparar throughput y latencia entre transformers, vLLM, TGI y llama.cpp antes de escalar dichas pruebas a modelos de mayor tamano.
- Docencia y formacion tecnica: sirve como ejemplo minimo y verificable de mergekit, interpolacion lineal de checkpoints y publicacion de artefactos en HuggingFace.
- Generacion de datos sinteticos para destilacion experimental: un modelo de 1,28 B puede producir corpus de texto controlados para experimentos de filtrado o curado, asumiendo calidad limitada y necesidad de revision humana.
- Evaluacion de seguridad y sesgo a pequena escala: por su tamano, es manejable para auditorias de sesgo o de toxicidad en pipelines de investigacion, aunque el modelo no incluya ninguna evaluacion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a la configuracion del merge y no incluye MMLU, HumanEval, GSM8K, Perplexity ni ninguna otra metrica. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 2,6 GB solo de pesos, mas el coste de la cache KV. Con un contexto corto, la inferencia completa se mantiene por debajo de 4 GB de VRAM.
- VRAM estimada en float32: aproximadamente 5,1 GB de pesos, mas overhead.
- VRAM estimada con cuantizacion: en torno a 1,3-1,5 GB en int8 y 0,8-1,0 GB en int4 o GGUF Q4_K_M, aunque el repositorio no distribuye ninguna de estas versiones y habria que generarlas.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 8 GB, RTX 3090 y RTX 4090. Con cuantizacion a 4 bits puede ejecutarse en GPUs de 6-8 GB e incluso en CPU con llama.cpp.
- GPU profesional: A100, H100 o L40S no son necesarias salvo para lotes muy grandes o despliegues con alta concurrencia.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI (la etiqueta `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con endpoints alojados), ademas de HuggingFace Inference Endpoints. Para llama.cpp, Ollama o LM Studio es necesario convertir previamente los pesos a GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (merge falcon 1B) | 1,28 B | no disponible | no disponible | HuggingFace, solo safetensors en bfloat16 |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | HuggingFace, safetensors y GGUF, versiones chat disponibles |
| Llama-3.2-1B | 1,24 B | 128 000 | Llama 3.2 Community License | HuggingFace, safetensors y GGUF, versiones instruct disponibles |
| Falcon-rw-1B | 1,0 B | 2048 | Apache 2.0 | HuggingFace, safetensors, ampliamente evaluado por la comunidad |

Comparativa de rendimiento: no disponible. Este modelo no publica metricas, por lo que no es posible situarlo frente a las alternativas en MMLU, HumanEval, GSM8K ni perplejidad. A diferencia de los tres modelos de referencia, carece de licencia declarada, de versiones cuantizadas y de una model card que documente datos de entrenamiento o idiomas.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos de uso publicados, el uso comercial es juridicamente arriesgado. En la practica equivale a "todos los derechos reservados" hasta que el autor aclare la situacion.
- Modelo base sin alineacion: al proceder de checkpoints de preentrenamiento y no documentarse RLHF ni DPO, no sigue instrucciones y puede producir contenido toxico, sesgado o factualmente incorrecto. Requiere fine-tuning y filtros antes de cualquier exposicion a usuarios finales.
- Riesgo de alucinacion elevado: con 1,28 B de parametros, la capacidad de mantener coherencia factual en respuestas largas es limitada, especialmente en dominios especializados.
- Sesgos: no documentados. No hay analisis de sesgo ni de composicion del corpus de entrenamiento, por lo que se heredan los sesgos de los datos originales de los checkpoints, sean cuales sean.
- Idiomas: no disponibles. No se puede asumir un buen rendimiento en castellano ni en idiomas distintos del ingles sin evaluacion previa.
- Contexto desconocido: al no declararse la longitud de contexto, cualquier despliegue con secuencias largas requiere una prueba empirica previa para evitar degradacion.
- Ausencia de benchmarks y de validacion comunitaria: 0 descargas y 0 likes implican que el comportamiento del artefacto no ha sido verificado por terceros.
- Rutas internas en la model card: la configuracion YAML referencia rutas locales del entorno del autor (`/opt/tiger/...`), lo que dificulta la reproduccion exacta del merge fuera de esa infraestructura.
- Sin versiones cuantizadas: cualquier despliegue en hardware limitado exige convertir los pesos a GGUF o cuantizar a int8/int4, con la perdida de calidad asociada y sin valores de referencia publicados.
- Naturaleza experimental: el modelo forma parte de un estudio de escalado de merges; no hay garantia de mantenimiento, soporte ni actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-falcon-1B-57500_60000_62500_65000_67500_weightedavg_merge
- mergekit (herramienta usada para el merge): https://github.com/cg123/mergekit
- Paper del metodo Linear merge / model soups: https://arxiv.org/abs/2203.05482
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente aparecieron paginas genericas de Microsoft sin relacion con el artefacto. No se han encontrado papers, blogs ni demos adicionales especificos de este repositorio.

# Terom/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal de 179.999.981.459 parametros (unos 180B) con encoder de vision, publicado como vista previa experimental de la arquitectura que, segun la model card, servira de base para Qwen4. El modelo se distribuye en formato Hugging Face Transformers y aparece alojado en el repositorio del usuario "Terom", mientras que la model card reproduce material atribuido al equipo de Qwen (blog de Qwen.ai, Qwen Cloud, repositorio QwenLM). Es un modelo multimodal de tipo image-text-to-text con licencia qwen-community-1.0.

El problema que aborda es el coste de la atencion en contextos muy largos dentro de cargas de trabajo agenticas: sustituye la seleccion de tokens de la atencion dispersa por una seleccion a nivel de microbloque (Qwen Sparse Attention), combina atencion lineal Gated DeltaNet con atencion dispersa y anade un esquema de embedding de n-gramas que escala parametros sin depender unicamente de Mixture-of-Experts. El resultado es un modelo de 48 capas con 512 expertos (10 enrutados + 1 compartido activos por token, unos 6B parametros activos) y una longitud de contexto de 262.144 tokens de forma nativa, extensible hasta 1.000.000.

Su relevancia es doble: por un lado introduce piezas arquitectonicas nuevas (Gated Residual, embedding de n-gramas, receta de entrenamiento con Muon y AdamW por categorias de pesos); por otro, es el primer release de pesos abiertos bajo la etiqueta qwen4_exp. No obstante, el repositorio presenta 0 descargas y 0 likes, no incluye resultados de benchmarks en la informacion disponible y su procedencia editorial debe verificarse antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision; hibrida: 12 x (3 x (Gated DeltaNet -> MoE) -> 1 x (Qwen Sparse Attention -> MoE)), con Gated Residual y MTP |
| Parametros totales | 179.999.981.459 (~180B, dato de safetensors): 125B del modelo de lenguaje + 51B de embedding de n-gramas + 4B de MTP |
| Parametros activos | ~6B por token (MoE con 512 expertos, 10 enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other, con LICENSE en el repositorio) |
| Formato de pesos | safetensors (Hugging Face Transformers) |
| Dimension oculta | 2560 |
| Numero de capas | 48 |
| Vocabulario / salida LM | 248.320 (padded) |
| Embedding de n-gramas | 20.000.000 entradas (bigramas/trigramas) en la capa 2 |
| Gated DeltaNet | 48 cabezas de atencion lineal para V, 16 para QK; dimension de cabeza 128 |
| Qwen Sparse Attention | 24 cabezas Q y 2 KV; dimension de cabeza 256; RoPE de 64; indexer MQA con 4 cabezas de consulta y 1 cabeza de clave compartida (dim. 128); presupuesto de 512 bloques o 2048 tokens |
| MoE | 512 expertos, 10 enrutados + 1 compartido; dimension intermedia de experto 640 |
| Gated Residual | 4 ramas; rango de cuello de botella 320 |
| MTP | 1 capa, entrenada con multiples pasos |
| Tamano del repositorio | 360,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion y actualizacion | 2026-09-10 (ambas) |

## Arquitectura y entrenamiento

La arquitectura combina tres mecanismos. Primero, atencion hibrida: las capas de atencion lineal Gated DeltaNet (48 cabezas de valor, 16 de query/key, dimension 128) se intercalan con capas de Qwen Sparse Attention, que en lugar de seleccionar tokens individuales opera sobre microbloques con un presupuesto de 512 bloques o 2048 tokens; el indexer es un MQA con 4 cabezas de consulta y una cabeza de clave compartida de dimension 128. Esta combinacion busca reducir la latencia en contextos largos, un cuello de botella habitual en cargas agenticas. Segundo, Gated Residual: sobre flujos residuales ensanchados se aplica una puerta de lectura elemento a elemento dependiente de los datos y una puerta escalar de escritura por rama (4 ramas, rango de cuello de botella 320), lo que aumenta la expresividad sin comprometer la estabilidad del entrenamiento. Tercero, un embedding de n-gramas de 20.000.000 entradas en la capa 2, planteado como un eje de escalado de parametros mas barato en computo y mas facil de descargar a memoria host que el enrutado MoE.

La capa MoE contiene 512 expertos con dimension intermedia 640, de los que se activan 10 enrutados mas 1 compartido; con 6B parametros activos por token, el coste de computo por token es bajo en relacion con los 180B totales. El bloque se completa con una capa MTP (multi-token prediction) de 1 capa entrenada con multiples pasos. En cuanto al entrenamiento, la model card indica dos etapas (pre-entrenamiento y post-entrenamiento) y una receta especifica: Muon y AdamW aplicados a categorias concretas de pesos, eliminacion del calentamiento de tamano de lote (se arranca directamente con el tamano objetivo) y ajuste con leyes de escalado reajustadas para permitir tasas de aprendizaje mayores. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno: la etiqueta del pipeline es image-text-to-text y el tag "conversational" esta presente.
- Procesamiento de imagenes: el modelo declara ser un "Causal Language Model with Vision Encoder", por lo que admite entradas de imagen junto a texto.
- Contexto largo: 262.144 tokens nativos, ampliables a 1.000.000, orientado explicitamente a cargas de trabajo agenticas y de contexto extenso.
- Razonamiento multi-paso y agentes: la model card justifica el diseno de Qwen Sparse Attention por la prevalencia de cargas agenticas, aunque no se detallan capacidades concretas de planificacion.
- Eficiencia de inferencia: al activar solo ~6B parametros por token, el coste de computo por token es reducido en comparacion con un modelo denso de 180B.
- Soporte de tool calling / function calling: no confirmado para esta variante en la informacion disponible; las herramientas integradas oficiales se mencionan para la version Qwen3.8-Flash servida en Qwen Cloud, no para estos pesos.
- Capacidades multilingues: no disponible; la model card no enumera idiomas.
- Modo de razonamiento explicito (thinking mode), audio u otras modalidades: no disponible.

## Casos de uso

- Analisis de documentacion extensa: con 262.144 tokens nativos, el modelo puede ingerir manuales tecnicos, expedientes completos o libros enteros en una sola pasada sin fragmentacion, lo que reduce perdidas de contexto en tareas de resumen y extraccion estructurada.
- Asistentes agenticos de larga duracion: la reduccion de latencia en contexto largo que persigue Qwen Sparse Attention encaja con bucles de agente que acumulan historial, resultados de herramientas y trazas de ejecucion durante muchas iteraciones.
- Comprension de documentos con imagenes: al incluir encoder de vision, permite extraer informacion de capturas, diagramas, tablas escaneadas y formularios combinados con el texto que los acompana.
- Revision de codigo a escala de repositorio: el contexto largo permite cargar varios ficheros y su historial de cambios para tareas de deteccion de inconsistencias o generacion de parches, siempre que se valide el soporte real de tool calling en pruebas propias.
- Generacion aumentada por recuperacion (RAG) sobre grandes corpus: en lugar de recuperar fragmentos pequenos, se pueden inyectar conjuntos amplios de pasajes y dejar que el modelo resuelva la sintesis, reduciendo errores por perdida de contexto entre fragmentos.
- Despliegue con descarga de embeddings a host: las 20.000.000 entradas de n-gramas y los 51B parametros asociados pueden residir en memoria de CPU o almacenamiento rapido, lo que hace viable servir el modelo en aceleradores con menos memoria de la que exigiria mantener todo en VRAM.
- Moderacion y analisis de conversaciones largas: la ventana extendida permite auditar hilos completos de atencion al cliente o foros para clasificar incidencias y detectar incumplimientos de politicas.
- Investigacion en arquitecturas hibridas: al ser un release experimental bajo la etiqueta qwen4_exp, sirve como banco de pruebas para estudiar el comportamiento de Gated DeltaNet, QSA, Gated Residual y el embedding de n-gramas frente a transformers clasicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion titulada "Benchmark Results" con estilos de tabla, pero los datos numericos no forman parte de la informacion proporcionada, por lo que no se reproducen valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 360 GB solo para pesos (coincide con el tamano de repositorio de 360,0 GB); a ello hay que sumar cache KV, activaciones y buffers, por lo que un despliegue realista necesita bastante mas.
- VRAM estimada en fp8: del orden de 180 GB de pesos, mas overhead de inferencia.
- VRAM estimada en int4: del orden de 90 GB de pesos, aunque el repositorio no publica pesos cuantizados y habria que generarlos.
- GPU recomendadas: configuraciones multi-GPU de centro de datos, como 8 x H100 80 GB para bf16, 4 x H100 80 GB para fp8 o 2 x H100 80 GB para int4. Los 51B parametros del embedding de n-gramas pueden descargarse a memoria host o SSD, lo que alivia la presion sobre VRAM.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090, ni siquiera en int4 sin descarga agresiva de parametros y penalizacion severa de latencia. En consumer solo seria planteable con offloading masivo a RAM, con rendimiento muy degradado.
- Opciones de despliegue: la model card declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. El tag endpoints_compatible indica compatibilidad con los endpoints gestionados de Hugging Face.
- Alternativa sin infraestructura propia: el servicio oficial Qwen Cloud ofrece Qwen3.8-Flash, basado en este modelo, con contexto de 1M por defecto y herramientas integradas.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar solo ~6B parametros por token el coste de computo por token es bajo para su tamano, de modo que el rendimiento dependera principalmente del ancho de banda de memoria y del mecanismo de offloading del embedding de n-gramas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (este repositorio) | ~180B totales, ~6B activos | 262.144 nativos, hasta 1.000.000 | Texto e imagen | qwen-community-1.0 | Pesos abiertos en Hugging Face (repo de "Terom"), 0 descargas |
| Qwen3.8-Flash (version oficial) | Basado en Qwen3.8-Flash-Next; cifra exacta no disponible | 1.000.000 por defecto | Texto e imagen, con herramientas integradas oficiales | no disponible | Servicio gestionado en Qwen Cloud |

No se dispone en la informacion proporcionada de datos verificados de otros modelos comparables de la misma categoria (MoE abiertos de ~180B o alternativas multimodales de contexto largo), por lo que no se incluyen cifras de parametros, contexto, rendimiento ni licencia que no esten documentadas.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se aportan tasas de error ni evaluaciones de fidelidad; como en cualquier modelo generativo, las salidas deben validarse, especialmente en dominios factuales o regulados.
- Ausencia de benchmarks: sin resultados publicados en la informacion disponible, no es posible comparar objetivamente su rendimiento con alternativas, lo que impide justificar una eleccion tecnica solo con estos datos.
- Idiomas no declarados: la model card no especifica cobertura linguistica, por lo que no hay garantia de calidad en castellano ni en otros idiomas distintos de los usados en el entrenamiento.
- Licencia: se distribuye bajo qwen-community-1.0 con license: other. Los terminos concretos (permisos de uso comercial, obligaciones de atribucion, restricciones por volumen de usuarios) no se detallan en la informacion disponible y deben revisarse en el fichero LICENSE antes de cualquier despliegue comercial.
- Caracter experimental: la etiqueta qwen4_exp y la propia model card indican que se trata de una vista previa de arquitectura, no de un modelo consolidado; la version con funciones de produccion es Qwen3.8-Flash en Qwen Cloud.
- Procedencia del repositorio: el modelo figura bajo el usuario "Terom" y no bajo la organizacion oficial de Qwen, aunque la model card reproduce material atribuido a Qwen. Conviene verificar la integridad y el origen de los pesos antes de usarlos.
- Falta de validacion de la comunidad: 0 descargas y 0 likes, ademas de fechas de creacion y actualizacion identicas (2026-09-10) y posteriores a la fecha actual, lo que refuerza la necesidad de cautela.
- Coste de memoria: el embedding de n-gramas aporta 51B parametros de los 180B totales; sin una estrategia de offloading bien disenada, el despliegue se vuelve inviable en la mayoria de configuraciones.
- Sin cuantizaciones publicadas: no hay GGUF ni otros formatos cuantizados en el repositorio, de modo que el uso en hardware limitado exige cuantizar por cuenta propia, con el consiguiente riesgo de degradacion.
- Tool calling no confirmado: cualquier integracion con herramientas o pipelines de agentes debe validarse empiricamente antes de asumir que el modelo emite llamadas estructuradas de forma fiable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Terom/Qwen3.8-Flash-Next
- Imagen de la arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
- Entrada de blog del modelo: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe tecnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Servicio Qwen Cloud: https://www.qwencloud.com
- Ficha de Qwen3.8-Flash (version oficial): https://www.qwencloud.com/models/qwen3.8-flash
- Fichero de licencia: LICENSE (incluido en el repositorio de Hugging Face)

Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (corresponden a un sitio japones de pasatiempos, honyaradoh.com), por lo que no aportan informacion adicional verificable.

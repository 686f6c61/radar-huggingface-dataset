# tielmane/Winnow-12B-NPU-LPBQ-X-Elite

## Resumen

Winnow-12B-NPU-LPBQ-X-Elite es una conversion del modelo Winnow-12B (un fine-tune de Gemma 4 12B IT desarrollado por EldanRing) para ejecutarse integramente en la NPU Hexagon de un portatil con Snapdragon X Elite, a traves del execution provider QNN de ONNX Runtime. El autor del repositorio, tielmane, publica unicamente los ficheros de modelo: 12 grafos ONNX estaticos que cubren las 48 capas decoder, cuantizados a int4 con LPBQ (block 32) y con activaciones uint16 en formato QDQ. Los embeddings de tokens, la normalizacion final y la cabeza de respuesta no se incluyen y deben ejecutarse en CPU desde el GGUF Q8_0 del modelo base.

El objetivo es permitir inferencia local de baja latencia sin cambios de Secure Boot ni firma de drivers, apoyandose en el plugin EP de onnxruntime-qnn. Segun la model card, el modelo procesa una peticion en aproximadamente 2,2 segundos, ocupa unos 6 GB de pesos int4 mapeados en NPU y admite hasta 576 tokens de estado mas preguntas por pasada, empaquetando varias preguntas en una sola pasada mediante una mascara de atencion por bloque. El repositorio ocupa 11,9 GB.

La relevancia actual radica en que demuestra un flujo completo de despliegue de un LLM de 12B sobre la NPU de un SoC ARM para Windows, con una ruta documentada de conversion GGUF a ONNX a contexto QNN compilado. Su licencia es Apache 2.0 y el pipeline declarado en HuggingFace es text-classification, aunque el modelo base tambien expone chat completions.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de Gemma 4 (48 capas), con atencion mixta: capas de ventana deslizante ("swa") y capas globales ("glb") |
| Parametros totales | Aproximadamente 12B (el modelo base se lista como 11,96B en fuentes de terceros) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | 576 tokens por pasada en esta build de NPU; contexto del modelo base no disponible |
| Tipos de cuantizacion | Pesos int4 LPBQ (block 32, recorte minimizador de error) con escalas por bloque enteras 1..15 multiplicadas por una escala float por canal; activaciones uint16 en QDQ; el modelo base requiere GGUF Q8_0 para embeddings y cabeza |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (opset 23) por chunks mas binarios de contexto QNN compilados (.onnx / .bin); el GGUF Q8_0 del modelo base es necesario en CPU |

## Arquitectura y entrenamiento

El modelo base Winnow-12B es un fine-tune de Gemma 4 12B IT orientado a "decisiones tipadas" (typed decisions) al estilo Jev, desarrollado por EldanRing. Esta version concreta no reentrena el modelo: parte de los pesos GGUF en Q8_0 del modelo base, los desquantiza y los reconstruye como 12 grafos ONNX estaticos que agrupan 4 capas decoder cada uno (capas 0-47). Los grafos usan las operaciones `RMSNormalization` y `Gelu` del opset 23, que QNN coloca en el HTP. El estado oculto de entrada tiene forma [1, 576, 3840], lo que fija el tamano de hidden a 3840.

El proceso de conversion incluye varias etapas verificadas: una reconstruccion en PyTorch desde el GGUF que se comparo con el servidor CPU de Winnow, y un port en Python del prompt y del tokenizer que coincidio en los ids de token del servidor en 229 de 229 peticiones. La calibracion de activaciones uint16 se hizo con 32 secuencias de un conjunto sintetico publico escrito con Claude (`harness/items/suite-v1.jsonl`), sin datos privados. Los pesos int8 por canal en QDQ se reescribieron como LPBQ int4 (block 32) con escalas por bloque enteras, que es lo que espera la fusion LPBQ de QNN. Para empaquetar varias preguntas en una sola pasada, las tablas RoPE (`cos_*`/`sin_*`) y las mascaras de atencion (`mask_*`) se convirtieron en entradas del grafo, con un conjunto por tipo de capa, de modo que una mascara de atencion por bloque permite posiciones por pregunta. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Clasificacion de texto y decisiones tipadas: el modelo esta afinado para tareas de etiquetado con opciones discretas (por ejemplo, intencion de un mensaje o categoria de una queja).
- Razonamiento multi-paso: soportado, aunque degradado respecto a la version de precision completa (ver benchmarks); el propio autor senala una perdida de unos 12 puntos en el tier dificil de JevBench.
- Respuestas multimodales por lote: varias preguntas de una misma peticion se empaquetan en una sola pasada mediante mascara de atencion por bloque.
- Inferencia local en NPU: ejecucion integra de las capas decoder sobre el Hexagon NPU (HTP v73) sin firma de test ni cambios en Secure Boot.
- Servicio tipo API: el servidor incluido expone `POST /v1/systemone` en 127.0.0.1:8014, compatible con el formato de Jev.
- Chat convencional: disponible en el modelo base a traves de `/v1/chat/completions`, aunque esta build de NPU no documenta esa ruta.
- Capacidades multimodales (vision): el modelo base lleva etiquetas de vision e Image-Text-to-Text, pero no se confirma su funcionamiento en esta conversion de NPU.
- Capacidades multilingues: no disponibles.
- Tool calling / function calling y modo "thinking" explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Clasificacion de intenciones en atencion al cliente: el modelo puede asignar mensajes entrantes a un conjunto cerrado de categorias (por ejemplo, las 12 opciones de Banking77) ejecutandose en local en el portatil, con una precision reportada de 0,868 en esa tarea.
- Triaje de reclamaciones regulatorias: clasificacion de quejas financieras por producto (CFPB), con una precision de 0,760, util para enrutado previo de expedientes sin enviar datos a la nube.
- Deteccion de tono y frustracion en correo corporativo: clasificacion de si un correo es una queja y estimacion de la frustracion del remitente (AUROC 0,948 y 0,922 respectivamente), aplicable a analisis de bandejas de soporte.
- Moderacion y analisis de redes sociales: deteccion de tuits de queja mediante una sola pasada de clasificacion binaria, con AUROC 0,948.
- Etiquetado por lotes en pipelines internos: al empaquetar varias preguntas en una pasada de 576 tokens, permite clasificar lotes pequenos de items de forma local y a bajo coste, con un tiempo aproximado de 2,2 s por peticion.
- Despliegue offline en portatiles ARM: analisis de datos sensibles en equipos con Snapdragon X Elite sin conexion, aprovechando que todo el computo pesado ocurre en la NPU y no requiere servicios externos.
- Evaluacion y ajuste de umbrales de decision: con salidas de clasificacion y metricas de ranking (Spearman 0,598 en cortesia), sirve para construir escalas ordinales internas de severidad o prioridad.
- Servicio de decisiones tipadas en local: exposicion de `POST /v1/systemone` como backend de un asistente que devuelve etiquetas estructuradas en lugar de texto libre.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un Snapdragon X Elite X1E80100, con el harness publico de JevBench sin modificar:

| Modelo | Easy (48) | Standard (72) | Hard que cabe en 576 tokens (50) |
|---|---|---|---|
| Este modelo (NPU, 4 bits) | 1,000 | 0,972 | 0,680 |
| Winnow-12B Q8_0 (CPU, llama.cpp) | 1,000 | – | 0,800 |
| Jev 1.13.0 (TypeSafe API) | 1,000 | 0,986 | 0,760 |

Tareas publicas con etiquetas humanas (Banking77, quejas CFPB, tuits de queja, correo Enron; unos 3.900 items):

| Tarea | Metrica | Jev 1.13.0 | Este modelo |
|---|---|---|---|
| Intencion Banking77 (12 opciones) | exactitud | 0,930 | 0,868 |
| Producto de queja CFPB (7 opciones) | exactitud | 0,824 | 0,760 |
| Tuits de queja: es una queja | AUROC | 0,969 | 0,948 |
| Severidad de la queja (4 niveles) | kappa ponderada | 0,669 | 0,609 |
| Correo Enron: remitente frustrado | AUROC | 0,945 | 0,922 |
| Cortesia en correo Enron | Spearman | 0,595 | 0,598 |

Datos adicionales del modelo base, segun la busqueda web: Winnow-12B Q8 alcanzo un 85,7% (198/231) en el subconjunto publico de 231 items de JevBench, coincidiendo con Jev alojado, y la version BF16 un 85,3%. En esta build de NPU, 61 de los 111 items dificiles de JevBench superan una pasada de 576 tokens y son rechazados.

## Requisitos de hardware

- Unos 6 GB de pesos int4 mapeados en la NPU del Snapdragon X Elite.
- Hardware probado: Snapdragon X Elite (HTP v73), Windows 11 ARM64, en octubre de 2026. No hay validacion publicada en otros chips.
- Es necesario espacio en CPU para el GGUF Q8_0 del modelo base, que aporta embeddings, normalizacion final y cabeza de respuesta (el tamano exacto no se especifica en la informacion disponible; a 8,5 bits por parametro y ~12B de parametros queda en el orden de 12-13 GB como estimacion).
- No esta pensado para GPU de escritorio (A100, H100, RTX 4090): la ruta de ejecucion es la NPU Hexagon y no se documentan alternativas CUDA.
- Despliegue: onnxruntime 1.30.0, onnxruntime-qnn 2.6.0 (plugin EP), onnx, numpy y tokenizers; servidor `winnow-npu/scripts/npu_serve.py`; compilacion previa con `winnow-npu/scripts/compile_chain.py`.
- Los contextos `*_ctx.onnx` precargados cargan en 1-2 s por chunk en un X Elite con la misma version de QNN; en otros chips o versiones hay que borrarlos y recompilar (unos 20 minutos, una sola vez).
- Latencia: aproximadamente 2,2 s por peticion. Throughput maximo no disponible.
- Restriccion critica: llamar a la NPU desde un unico hilo. Ejecutar las sesiones en un hilo nuevo por peticion devolvia respuestas incorrectas a partir de unas 100 peticiones (issue onnxruntime-qnn#892). El servidor incluido es monohilo y se autocomprueba al arrancar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia / disponibilidad |
|---|---|---|---|---|
| Winnow-12B-NPU-LPBQ-X-Elite (esta ficha) | ~12B, int4 LPBQ | 576 tokens por pasada | JevBench easy 1,000 / standard 0,972 / hard 0,680; Banking77 0,868 | Apache 2.0, pesos ONNX abiertos; solo NPU Snapdragon X Elite |
| Winnow-12B Q8_0 (CPU, llama.cpp) | ~12B, Q8_0 | No limitado a 576 tokens en la misma medida | JevBench hard 0,800; 85,7% en el subconjunto publico de 231 items | Apache 2.0; requiere CPU/GPU con mas memoria |
| Winnow-12B BF16 | ~12B, BF16 | No disponible | JevBench 85,3% en 231 items | Apache 2.0; mayor huella de memoria |
| Jev 1.13.0 (TypeSafe API) | No disponible | No disponible | JevBench standard 0,986 / hard 0,760; Banking77 0,930 | API alojada de terceros, no es un modelo local abierto |

Frente a la version CPU de Winnow-12B, esta build sacrifica unos 12 puntos en el tier dificil de JevBench y limita cada pasada a 576 tokens, a cambio de ejecutarse integramente en la NPU de un portatil ARM. Frente a Jev 1.13.0, queda por debajo en practicamente todas las metricas publicadas, con la diferencia mas estrecha en cortesia sobre correo Enron (0,598 frente a 0,595).

## Limitaciones y advertencias

- Precision: el redondeo a 4 bits mueve las decisiones ajustadas y penaliza el razonamiento multi-paso (unos 12 puntos menos en el tier dificil de JevBench). No es adecuado como sustituto exacto del modelo en precision completa.
- Longitud: 576 tokens por pasada. 61 de los 111 items dificiles de JevBench se rechazan por superar ese limite, lo que implica perdida de cobertura en entradas largas.
- Hardware: validado en un unico portatil Snapdragon X Elite (HTP v73), Windows 11 ARM64. Otros chips o versiones de onnxruntime-qnn requieren recompilar los contextos y no estan probados.
- Concurrencia: el acceso a la NPU debe hacerse desde un solo hilo; el uso multiproceso o multihilo puede producir respuestas silenciosamente incorrectas.
- Piezas externas obligatorias: los embeddings, la normalizacion final y la cabeza no estan en el repositorio; hay que descargar el GGUF Q8_0 del modelo base y disponer del tokenizer.
- Composicion del repositorio: contiene exclusivamente ficheros de modelo, sin codigo de despliegue; el flujo de uso depende del repositorio externo `system-one-on-snapdragon`.
- Idiomas: no se declara lista de idiomas soportados, por lo que no puede asumirse cobertura multilingue.
- Sesgos y alucinacion: no se documentan evaluaciones de sesgo ni tasas de alucinacion; al ser un modelo ajustado para clasificacion, el uso generativo fuera de ese marco no esta validado en esta build.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (Winnow-12B, tambien Apache 2.0) y de Gemma 4, asi como las dependencias de inferencia.
- Madurez: el repositorio registra 0 descargas y 0 "likes", esta fechado en septiembre de 2026 y no tiene validacion independiente publicada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tielmane/Winnow-12B-NPU-LPBQ-X-Elite
- Modelo base: https://huggingface.co/EldanRing/Winnow-12B
- Ficheros del modelo base: https://huggingface.co/EldanRing/Winnow-12B/tree/main
- Repositorio de conversion y despliegue: https://github.com/esterhuizen/system-one-on-snapdragon
- Documentacion de la ruta NPU: https://github.com/esterhuizen/system-one-on-snapdragon/blob/main/docs/WINNOW-NPU.md
- Inferencia del modelo base: https://github.com/EldanRing/winnow-inference
- Harness de evaluacion JevBench: https://github.com/fstandhartinger/jevbench
- Issue de onnxruntime-qnn sobre hilos (referenciada como #892): https://github.com/onnxruntime/onnxruntime-qnn/issues/892
- Issue de onnxruntime-qnn sobre fusion LPBQ (referenciada como #893): https://github.com/onnxruntime/onnxruntime-qnn/issues/893
- Estimaciones de hardware para Winnow-12B: https://www.madebyagents.com/models/winnow-12b
- Articulo sobre LLM en NPU Intel (contexto comparativo): https://dev.to/mr1azl/i-tried-running-llms-on-intels-npu-heres-what-actually-happened-5h17

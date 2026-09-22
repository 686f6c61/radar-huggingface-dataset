# Vontra/MiMo-V2.6-Flash-RL-MLX-4bit-MTP

## Resumen

MiMo-V2.6-Flash-RL-MLX-4bit-MTP es una conversión comunitaria a MLX del modelo XiaomiMiMo/MiMo-V2.6-Flash-RL, publicada por el usuario Vontra para ejecutar en Apple Silicon. El modelo subyacente es un transformer disperso de tipo mixture-of-experts (MoE) desarrollado por el equipo MiMo de Xiaomi, con 308.778.778.368 parámetros totales (unos 309.000 millones) y 15.000 millones de parámetros activos por token. Esta conversión conserva únicamente la columna vertebral de texto: no incluye las capacidades de visión ni de audio del paquete original.

El interés de esta ficha radica en que permite ejecutar un MoE de 309.000 millones de parámetros en un solo equipo de sobremesa con memoria unificada, sin GPU dedicada. Para ello, el autor aplica cuantización affine de 4 bits con group size 64 en las proyecciones densas y mantiene los expertos MoE en su formato nativo MXFP4 con group size 32, lo que da una media de 4,257 bits por peso. El resultado ocupa unos 154 GiB en disco y alcanza un pico de 164,4 GB de memoria unificada durante la inferencia.

El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y se publicó el 21 de septiembre de 2026. Además del modelo principal, incluye el payload MTP (multi-token prediction) nativo de tres capas, convertido también a 4 bits, pero los runtimes actuales de MLX todavía no ejecutan esa ruta, por lo que las cifras de rendimiento publicadas corresponden a decodificación serie y no a decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso de tipo mixture-of-experts (MoE): 48 capas, 256 expertos enrutados y 8 expertos activos por token |
| Parametros totales | 308.778.778.368 (unos 309.000 millones) |
| Parametros activos | 15.000 millones por token |
| Longitud de contexto | 1.000.000 de tokens en el modelo upstream; no disponible para esta conversion MLX concreta |
| Tipos de cuantizacion | 4-bit affine con group size 64 en proyecciones densas; MXFP4 nativo con group size 32 en los expertos MoE; media de 4,257 bits por peso; payload MTP en 4-bit affine |
| Idiomas soportados | Ingles (en) y chino (zh); no se declaran otros |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX; repositorio de 164,9 GB y unos 154 GiB en disco tras la cuantizacion |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Flash-RL (relacion: quantized) |
| Libreria | mlx |
| Fecha de publicacion | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura del modelo original es un MoE disperso de 48 capas con 256 expertos enrutados, de los que se activan 8 por token, lo que concenta 15.000 millones de parametros activos sobre un total de 309.000 millones. El paquete upstream completo admite entradas omnimodales (texto, vision y audio) y un contexto de hasta un millon de tokens. Esta conversion de Vontra recorta esa envoltura y exporta solo la columna vertebral de texto, junto con el tokenizer y la plantilla de chat originales.

El proceso de cuantizacion tiene una particularidad tecnica reseñable: MiMo-V2.6 almacena los tensores de atencion fusionados en orden de tensor-parallel del checkpoint y rellena la rejilla de escalas FP8 de forma independiente para cada shard. La conversion reconstruye esos shards antes de cuantizar, y el autor advierte que omitir ese paso produce un modelo que carga pero genera salidas corruptas. Las proyecciones densas pasan a 4-bit affine con group size 64, mientras que los expertos MoE se mantienen en su formato nativo MXFP4 de group size 32. Ademas se incluye un payload MTP de tres capas en `mtp/model_mtp.safetensors`, tambien en 4-bit affine, con un manifiesto que describe sus tensores.

No hay informacion disponible en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo upstream. El sufijo "RL" del nombre sugiere alguna fase de post-entrenamiento con aprendizaje por refuerzo, pero no se detalla en la model card consultada. Tampoco se describen innovaciones adicionales como atencion lineal o decodificacion especulativa funcional: el MTP esta presente en el repositorio, pero ningun runtime lo ejecuta todavia.

## Capacidades

- Generacion de texto conversacional con plantilla de chat incluida, heredada del tokenizer upstream.
- Razonamiento aritmetico: el autor reporta resultados correctos en pruebas de humo repetidas.
- Generacion de codigo: se verifico la produccion de codigo Python coherente en las pruebas del publicador.
- Explicaciones facticas: la model card menciona una explicacion factual clara como parte de las pruebas de validacion.
- Soporte bilingue ingles-chino, limitado a los dos idiomas declarados.
- Payload MTP de tres capas incluido para runtimes compatibles con multi-token prediction, aunque no operativo en la actualidad.
- Capacidades omnimodales (vision y audio) del modelo upstream: no incluidas en esta conversion.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local de gran escala en Apple Silicon: permite cargar un MoE de 309.000 millones de parametros en un Mac Studio con 256 GB de memoria unificada, sin necesidad de GPU dedicada ni de infraestructura en nube. Es adecuado para equipos que ya trabajan en macOS y quieren evaluar modelos frontera en local.
- Evaluacion y prototipado de modelos MoE antes de comprometer recursos en CUDA: el investigador puede medir calidad de salida, latencia y consumo de memoria en un solo equipo antes de decidir un despliegue en cluster con la version FP8 upstream.
- Generacion de codigo en flujos de trabajo locales: con 59-60 tok/s de generacion sostenida, el modelo es utilizable de forma interactiva para escribir y revisar funciones, siempre que el prompt no sea muy largo, dado que el preprocesado de prompt se mide entre 10,6 y 28,9 tok/s.
- Analisis de documentacion o repositorios extensos: el modelo upstream admite hasta un millon de tokens de contexto, lo que en teoria permite resumir codebases completas o expedientes largos; en la practica, el contexto real queda limitado por la memoria disponible para la cache KV en un equipo con 164,4 GB ya ocupados por los pesos.
- Investigacion en cuantizacion de MoE: este repositorio es un caso de estudio util para comparar el impacto de aplicar 4-bit affine a las proyecciones densas y conservar MXFP4 en los expertos, con una media declarada de 4,257 bits por peso.
- Desarrollo y validacion de runtimes MTP: el payload de tres capas en `mtp/` sirve para probar futuras implementaciones de decodificacion especulativa en MLX, ya que hoy no es un drafter autonomo para `mlx_lm.generate --draft-model`.
- Procesamiento bilingue ingles-chino: traduccion, resumen y reescritura de textos entre ambos idiomas en entornos donde no se quiere enviar datos a servicios externos.
- Docencia y experimentacion con modelos de gran tamano: permite a un laboratorio con un unico Mac de gran memoria demostrar tecnicas de enrutamiento disperso y cuantizacion mixta sin acceso a GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta mediciones de rendimiento en hardware concreto, que se recogen en la seccion de requisitos de hardware.

| Medicion | Entorno | Resultado |
|---|---|---|
| Generacion sostenida | M3 Ultra de 256 GB, oMLX 0.7.0.dev2, MLX 0.32.2, mlx-lm 0.31.3 | 59,3 a 60,8 tok/s |
| Procesado de prompt | Mismo entorno | 10,6 a 28,9 tok/s |
| Pico de memoria unificada | Mismo entorno | 164,4 GB |
| Tamano cuantizado en disco | Conversion MLX 4-bit | Aproximadamente 154 GiB |

## Requisitos de hardware

- Memoria: el pico medido es de 164,4 GB, por lo que se recomienda un Mac con 256 GB de memoria unificada. Un equipo de 192 GB dejaria muy poco margen para la cache KV, el sistema operativo y el resto de aplicaciones.
- Almacenamiento: unos 154 GiB para los pesos cuantizados y 164,9 GB de repositorio, mas el espacio necesario para la cache KV.
- GPU de consumo: no cabe en ninguna. Una RTX 4090 con 24 GB o una RTX 5090 con 32 GB quedan muy lejos de los aproximadamente 154 GiB de pesos.
- Aceleradores de datacenter: una A100 de 80 GB o una H100 de 80 GB tampoco albergan el modelo en una sola unidad en este formato, y ademas MLX es especifico de Apple Silicon. Para NVIDIA habria que usar el modelo upstream en FP8 con vLLM o TGI.
- Software de despliegue: mlx-lm en version 0.31.3 o superior, MLX 0.32.2 y oMLX 0.7.0.dev2 segun la configuracion de prueba. No hay soporte de llama.cpp, Ollama, vLLM ni TGI para este formato.
- Throughput: 59,3-60,8 tok/s de generacion sostenida y 10,6-28,9 tok/s de procesado de prompt. El prefill es el cuello de botella, de modo que los prompts largos implican tiempos de espera notables.
- Decodificacion especulativa: no operativa. Las cifras anteriores corresponden a decodificacion serie; el payload MTP esta incluido pero ningun runtime lo ejecuta todavia.
- Cache KV: no disponible la estimacion para contextos largos en este formato.

## Comparativa con modelos similares

Los datos de la tabla proceden de las fichas publicas de cada proyecto y no de la informacion proporcionada en esta busqueda; conviene verificarlos antes de citarlos.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad del formato MLX |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL (esta conversion) | 309.000 millones | 15.000 millones | 1.000.000 de tokens (upstream) | MIT | Si, conversion comunitaria |
| Qwen3-235B-A22B | 235.000 millones | 22.000 millones | 128.000 tokens nativos, extensibles | Apache 2.0 | Existen conversiones comunitarias |
| Llama 4 Maverick | 400.000 millones | 17.000 millones | 1.000.000 de tokens | Llama 4 Community License | No disponible en la informacion consultada |
| DeepSeek-V3 | 671.000 millones | 37.000 millones | 128.000 tokens | MIT | No disponible en la informacion consultada |

Frente a estas alternativas, la ventaja de MiMo-V2.6-Flash-RL es su licencia MIT combinada con un contexto declarado de un millon de tokens y un numero de parametros activos bajo (15.000 millones), que reduce el coste de computo por token. La desventaja practica es el tamano total del checkpoint: 154 GiB cuantizados a 4 bits lo dejan fuera de cualquier GPU de consumo y lo restringen a equipos con memoria unificada muy grande o a despliegues en cluster.

## Limitaciones y advertencias

- Esta release no incluye vision, audio ni el drafter DFlash de cinco capas del paquete omnimodal upstream; solo contiene la columna vertebral de texto.
- El payload MTP esta presente pero no funciona: no es un drafter autonomo para `mlx_lm.generate --draft-model` y ningun runtime actual ejecuta la ruta MTP de MiMo.
- Solo se declaran ingles y chino. No hay soporte confirmado de castellano ni de otros idiomas.
- Aunque el modelo upstream anuncia un millon de tokens de contexto, en esta conversion el contexto util queda severamente limitado por la memoria disponible una vez cargados los pesos.
- La cuantizacion a 4 bits implica perdida de precision respecto al modelo original, con una mezcla de formatos (4-bit affine en capas densas y MXFP4 en expertos) que puede afectar de forma desigual a distintas tareas.
- Es una conversion comunitaria no oficial de Xiaomi. El autor reporta pruebas de humo correctas, pero el repositorio tiene 0 descargas y 1 like, por lo que carece de validacion independiente amplia.
- La fecha de creacion del repositorio (21 de septiembre de 2026) es posterior al conocimiento general disponible; conviene comprobar la vigencia de los enlaces y de las versiones de software citadas.
- No hay informacion sobre sesgos del modelo upstream ni sobre tasas de alucinacion medidas. Al ser un modelo generativo, las salidas deben verificarse antes de usarlas en produccion.
- La licencia MIT permite uso comercial, pero la arquitectura, el entrenamiento, el tokenizer y la marca original pertenecen al equipo MiMo de Xiaomi; se debe mantener la atribucion correspondiente.
- El modelo depende por completo del ecosistema MLX y Apple Silicon: no es portable a CUDA o ROCm sin una reconversion completa de los pesos.
- El procesado de prompt es lento (10,6-28,9 tok/s), lo que penaliza casos de uso con entradas largas o conversaciones con historial extenso.
- Si se omite la reconstruccion de los shards de atencion fusionados antes de cuantizar, el modelo carga pero produce salidas corruptas; cualquier reconversion debe respetar ese paso.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/Vontra/MiMo-V2.6-Flash-RL-MLX-4bit-MTP
- Modelo base upstream: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Repositorio GitHub del equipo MiMo de Xiaomi: https://github.com/XiaomiMiMo/MiMo
- Perfil del autor de la conversion: https://huggingface.co/Vontra
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- mlx-lm (libreria de inferencia y ajuste): https://github.com/ml-explore/mlx-lm

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo. Todos los resultados obtenidos correspondian a referencias homonimas sin relacion (una marca de relojes y un personaje de animacion), por lo que se han omitido.

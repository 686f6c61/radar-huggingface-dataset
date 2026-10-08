# xbill9/gemma-4-31B-it-qat-q4_0-fp8-text-emb4

## Resumen

Este repositorio contiene una conversion no oficial de los pesos de Gemma 4 31B-it entrenados con cuantizacion consciente del entrenamiento (QAT) que Google publico en `google/gemma-4-31B-it-qat-q4_0-unquantized`. El autor, `xbill9`, redistribuye esos pesos en un formato de almacenamiento distinto: todas las capas lineales se guardan en FP8 E4M3 (W8A8) con una escala float32 por canal de salida, mientras que las tablas de embeddings y la `lm_head` se mantienen en int4, copiadas sin cambios de otro build del mismo autor. El checkpoint ocupa 28,77 GiB y el repositorio completo 30,9 GB, con 32.106.631.484 parametros totales segun los safetensors.

El objetivo es doble: por un lado, ofrecer una variante FP8 lista para servir con vLLM y `compressed-tensors`, que reduce el coste de memoria y acelera las operaciones matriciales en hardware con soporte FP8 nativo; por otro, conservar las ventajas de los embeddings int4, que en pruebas de terceros sobre la familia emb4 se tradujeron en una mejora de decodificacion de hasta 1,39x en una NVIDIA L4. Es un modelo solo de texto y solo de generacion, derivado de un modelo instruido (sufijo `-it`).

La relevancia practica es limitada por su estado: es un build no oficial, construido y verificado en local contra sus pesos de origen, pero que el propio autor indica que todavia no ha sido servido ni evaluado. Hay un barrido de servicio en cola sobre una AMD Instinct MI300X, y el propio autor remite los problemas a este repositorio, no a Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4_text`; solo se documenta el pipeline de cuantizacion, no la topologia de la red) |
| Parametros totales | 32.106.631.484 (32,1 B) segun safetensors |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 W8A8 en capas lineales (escala float32 por canal de salida, 410 modulos lineales); activaciones cuantizadas a FP8 por token en ejecucion (`float-quantized` de compressed-tensors); embeddings y `lm_head` en int4; pesos de origen QAT sobre rejilla de 4 bits con una escala por grupo de 32 valores |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con `license_link` apuntando a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors con compressed-tensors; sin GGUF en el repositorio |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo base (numero de capas, tipo de atencion, atencion lineal, decodificacion especulativa u otras innovaciones). La unica etiqueta estructural que aparece es `gemma4_text`, que indica que se trata de la torre de texto del modelo Gemma 4 31B en su variante instruida. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo que si esta documentado con detalle es el proceso de conversion. El build parte del checkpoint QAT no cuantizado de Google (revision `1e4d8be`), que fue entrenado sobre una rejilla de 4 bits con una escala por cada grupo de 32 valores. Como FP8 con una escala por canal de salida no puede representar esas escalas por grupo, este repositorio vuelve a redondear los pesos QAT y ademas cuantiza las activaciones. El script `fp8_text.py` realiza la conversion importando utilidades de `repack_q4_0.py`, ambos incluidos en el repositorio, y no utiliza datos de calibracion. Las tablas de embeddings y la `lm_head` proceden del build `xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text-emb4` (revision `c8e1d82`) y la `lm_head` esta desacoplada (untied). El autor advierte que, para la rejilla QAT exacta, debe usarse `xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text`.

El informe de verificacion (`verify_report.json`) que acompana al repositorio recoge estas cifras de fidelidad frente a los pesos QAT de origen:

| Metrica de verificacion | Valor |
|---|---:|
| Modulos lineales en FP8 | 410 |
| Valores cuantizados | 29.286.727.680 |
| Error RMS relativo | 2,64 % |
| Error maximo, como fraccion del mayor valor de su fila | 3,57 % |
| Otros tensores byte a byte identicos a su origen | 421 de 421 |
| Tamano del checkpoint | 28,77 GiB |

## Capacidades

- Generacion de texto y conversacion: el repositorio esta etiquetado como `text-generation` y `conversational`, sobre un modelo instruido (`-it`).
- Modelo solo texto: el propio autor lo declara explicitamente. No hay torre de vision, audio ni multimodalidad en este build.
- Capa de embeddings en int4 con `lm_head` desacoplada, lo que permite cargar el modelo con vLLM y `compressed-tensors` en configuracion W8A8.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Control de la profundidad de razonamiento o de presupuesto de tokens: no disponible.

## Casos de uso

- Servicio de generacion de texto autoalojado en hardware con FP8 nativo: el checkpoint esta pensado para vLLM con `compressed-tensors`, de modo que puede desplegarse en una MI300X, H100 o A100 para servir peticiones de chat con un consumo de memoria de pesos de aproximadamente 29 GiB.
- Evaluacion de la degradacion por cuantizacion: dado que existe un build hermano con la rejilla QAT exacta (`w4a16-ct-text`) y este mismo build guarda el `verify_report.json`, es util para medir en tareas reales cuanto se pierde al pasar de W4A16 a W8A8 FP8 con embeddings int4.
- Procesamiento por lotes de texto en pipelines offline: clasificacion, extraccion de campos, resumen o reescritura de documentos en grandes volumenes, aprovechando el soporte de batching continuo de vLLM.
- Generacion asistida en herramientas internas de documentacion: redaccion y reformulacion de textos tecnicos donde no se requiere ni vision ni entrada de audio.
- Experimentacion academica sobre cuantizacion: el repositorio incluye los scripts de conversion y el informe de verificacion, lo que permite reproducir el proceso y comparar estrategias de escalas (por canal frente a por grupo).
- Pruebas de integracion de vLLM con modelos cuantizados en FP8: sirve como caso de prueba para validar kernels FP8, configuracion de tensor parallelism y perfilado de memoria en un servidor nuevo.
- Comparacion de rendimiento entre precisiones en una misma plataforma: al compartir arquitectura y embeddings con los builds w4a16, permite aislar el efecto del formato de pesos en la latencia de decodificacion.
- Base para tareas de codigo o matematicas: el modelo base es un 31B instruido, por lo que es razonable esperar capacidad de codigo, pero no hay ninguna evaluacion publicada que lo confirme para este build concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo ha sido construido y verificado en local contra sus pesos de origen, pero que todavia no ha sido servido ni evaluado, y que esta en cola un barrido de servicio sobre una AMD Instinct MI300X.

Como referencia externa, dos articulos de terceros sobre la familia de builds emb4 (no especificamente sobre este build FP8) recogen datos de rendimiento medidos en instancias de Amazon SageMaker:

| Fuente | Dato reportado |
|---|---|
| dev.to (builders), 30.09.2026 | Los embeddings de 4 bits decodifican hasta 1,39x mas rapido en una NVIDIA L4 |
| dev.to (gde), 30.09.2026 | En una NVIDIA T4, con configuracion reducida, la decodificacion es 0,8x la de la L4 con las mismas respuestas |

Estos datos corresponden a builds distintos dentro de la misma familia y no deben atribuirse a este checkpoint FP8 sin una medicion propia.

## Requisitos de hardware

- Peso de los pesos: 28,77 GiB de checkpoint, 30,9 GB de repositorio. La VRAM minima para cargar los pesos es de aproximadamente 29 GiB, a los que hay que sumar activaciones, buffers de cuantizacion y cache KV.
- VRAM estimada para inferencia: del orden de 30-34 GB con contexto y lote pequenos; el requisito crece de forma aproximadamente lineal con la longitud de contexto y el numero de secuencias concurrentes.
- AMD Instinct MI300X (192 GB HBM3): hardware previsto por el autor para el barrido de servicio; el modelo cabe con amplio margen para cache KV y batching agresivo.
- NVIDIA H100 / H200 (80 GB y superiores): caben sin problema, con soporte de kernels FP8 nativos en las generaciones Hopper y posteriores.
- NVIDIA A100 (40 GB y 80 GB): la variante de 80 GB es la indicada; la de 40 GB queda demasiado justa al sumar cache KV.
- GPU profesionales de 48 GB (L40S, RTX 6000 Ada, A6000): los pesos caben, pero obligan a limitar contexto y concurrencia.
- GPU de consumo: no cabe de forma practica en una RTX 4090, RTX 3090 (24 GB) ni en una RTX 5090 (32 GB), ya que los pesos solos ocupan cerca de 29 GiB y no queda margen razonable para cache KV. La alternativa seria repartir el modelo en varias GPU con tensor parallelism.
- Opciones de despliegue: vLLM es la libreria declarada en el repositorio y la unica ruta soportada oficialmente por el autor, a traves de `compressed-tensors`. No se publica GGUF, por lo que llama.cpp, Ollama y otros runners basados en GGUF no pueden cargar este checkpoint tal cual. TGI y otros servidores no estan documentados para este build.
- Latencia y throughput: no disponible para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xbill9/gemma-4-31B-it-qat-q4_0-fp8-text-emb4` (este build) | 32,1 B | no disponible | FP8 E4M3 W8A8 + embeddings int4 | apache-2.0 | Repositorio publico, sin evaluar |
| `xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text` | no disponible (misma base) | no disponible | Rejilla QAT exacta de 4 bits, activaciones de 16 bits | apache-2.0 | Repositorio publico |
| `xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text-emb4` | no disponible (misma base) | no disponible | W4A16 con embeddings int4 | apache-2.0 | Repositorio publico; dispone de mediciones de terceros en L4 y T4 |
| `google/gemma-4-31B-it-qat-q4_0-unquantized` | no disponible | no disponible | Sin cuantizar (pesos QAT originales) | licencia de Gemma 4 (apache-2.0 segun el repositorio) | Repositorio oficial de Google |

La comparativa con alternativas de otros fabricantes (Llama, Qwen, Mistral y similares del mismo orden de magnitud) no esta disponible en la informacion proporcionada: no hay datos de contexto, benchmarks ni idiomas para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo solo texto: no procesa imagenes, audio ni ninguna otra modalidad.
- Sin evaluar: el autor afirma explicitamente que el checkpoint no ha sido servido ni evaluado, por lo que no hay garantia de calidad en tareas reales.
- Doble redondeo: los pesos QAT se entrenaron sobre una rejilla de 4 bits con escala por grupo de 32, y aqui se vuelven a redondear a FP8 con escala por canal de salida. El error RMS relativo medido es del 2,64 % y el error maximo por fila del 3,57 %, cifras que se acumulan sobre las del entrenamiento QAT original.
- Build no oficial, no afiliado a Google ni respaldado por Google DeepMind. Los problemas deben reportarse al autor del repositorio, no al fabricante del modelo base.
- Sin datos de calibracion: la conversion de activaciones a FP8 por token no utiliza conjunto de calibracion, lo que puede afectar a la estabilidad numerica en distribuciones de entrada alejadas de las vistas en entrenamiento.
- Idiomas soportados no documentados: no se puede asumir un comportamiento multilingue equivalente al del modelo base sin verificacion.
- Licencia: el repositorio declara apache-2.0, pero enlaza a la licencia especifica de Gemma 4 de Google. Antes de un uso comercial conviene revisar los terminos de dicha licencia, ya que la licencia del modelo base prevalece sobre la redistribucion.
- Adopcion practica muy baja: 13 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.
- Riesgo de alucinacion, sesgos y comportamientos indeseados: no hay informacion especifica para este build. Al ser un derivado de un modelo instruido sin evaluacion publicada, deben asumirse los riesgos habituales de un modelo de lenguaje de este tamano.
- Sin GGUF: no es desplegable con llama.cpp u Ollama sin una conversion adicional por parte del usuario.
- Requisitos de memoria altos para consumo: cerca de 29 GiB solo en pesos, lo que descarta las GPU de consumo de 24 GB.
- Fecha de creacion y actualizacion muy proximas (8 de octubre de 2026, con un minuto de diferencia), lo que sugiere una publicacion sin ciclo de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-31B-it-qat-q4_0-fp8-text-emb4
- Modelo base (Google): https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Build con la rejilla QAT exacta: https://huggingface.co/xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text
- Build w4a16 con embeddings int4 (origen de las tablas de embeddings y `lm_head`): https://huggingface.co/xbill9/gemma-4-31B-it-qat-q4_0-w4a16-ct-text-emb4
- Build equivalente para el modelo E2B: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-fp8-text
- Build emb4 para el modelo E2B: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Articulo de terceros sobre embeddings de 4 bits en SageMaker: https://dev.to/aws-builders/gemma-4-on-amazon-sagemaker-4-bit-embeddings-decode-up-to-139x-faster-on-one-l4-36mf
- Articulo de terceros sobre Gemma 4 en NVIDIA T4: https://dev.to/gde/gemma-4-on-amazon-sagemaker-the-nvidia-t4-decodes-at-08x-of-the-l4-with-the-same-answers-19m4

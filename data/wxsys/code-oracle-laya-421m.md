# wxsys/code-oracle-laya-421m

## Resumen

Code Oracle Laya 421M es un modelo de clasificacion de texto (encoder) afinado por Wahyu Febri Tamtomo (wxsys) sobre `convaiinnovations/laya` para actuar como cabeza de decision neuronal dentro de Code Oracle, un oraculo neuro-simbolico de verificacion de parches pensado para agentes de programacion con IA. Resuelve un problema muy concreto: dado un diff de codigo serializado en un Micro-DSL derivado del AST (menos de 400 tokens), emitir un veredicto binario (`APPROVED` / `REJECTED`) y una puntuacion de riesgo continua calibrada entre 0.0 y 1.0.

El modelo tiene 421.293.830 parametros (1,68 GB en safetensors) y es un derivado de Laya ModernBERT, la linea de "System 1 decision engine" de Convai Innovations que devuelve decisiones tipadas en un unico forward pass, sin decodificacion autorregresiva. El repositorio aloja ademas una variante ligera de 164M (312 MB) orientada a ejecucion local en CPU con una latencia aproximadamente un 30% menor, segun el autor.

Su relevancia actual esta en el nicho de la verificacion rapida de codigo generado por LLM: en lugar de recurrir a un modelo grande para validar cada parche, este encoder de 421M pretende resolver la decision en decenas de milisegundos, encadenandose con puertas simbolicas deterministas (detector de ciclos de Tarjan e invariantes de contrato sobre AST). El corpus de entrenamiento declarado son 2.400 muestras de mutaciones balanceadas 50/50 entre PASS y REJECT en Python, TypeScript, Go y Rust.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT con cabeza de decision dual (veredicto categorico + score continuo); derivado de `convaiinnovations/laya`, subcarpeta `typed-decisions` |
| Parametros totales | 421.293.830 (variante Large, raiz del repo); 164M en la variante `base-164m`, construida sobre `answerdotai/ModernBERT-base` mas cabeza de decision |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible de forma explicita. El Micro-DSL de entrenamiento es inferior a 400 tokens; la arquitectura base ModernBERT soporta hasta 8.192 tokens |
| Tipos de cuantizacion | No disponible. Solo se publican pesos safetensors; no se documentan GGUF, GPTQ, AWQ ni versiones int8/int4 |
| Idiomas soportados | Ingles (etiqueta `en`). El corpus de entrenamiento cubre mutaciones en Python, TypeScript, Go y Rust |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (1,68 GB la variante Large; 312 MB la variante `base-164m`) |

## Arquitectura y entrenamiento

Se trata de un encoder bidireccional de la familia ModernBERT al que se le acopla una cabeza de decision que responde a preguntas tipadas: una eleccion multiple con criterios explicitos (`APPROVED` frente a `REJECTED`) y una puntuacion en una escala discreta de cinco niveles (0 a 4) que se reescala a un riesgo continuo de 0.0 a 1.0. La variante Large hereda los pesos de la subcarpeta `typed-decisions` de Laya; la variante de 164M parte de `answerdotai/ModernBERT-base` y anade la misma cabeza. El modelo no genera texto: produce decisiones en un unico forward pass, lo que elimina la latencia de decodificacion token a token y encaja con el enfoque "System 1" del proyecto Laya.

El entrenamiento se realizo sobre 2.400 muestras balanceadas de mutaciones multi-lenguaje (Python, TypeScript, Go y Rust) con paridad 50/50 entre PASS y REJECT. Cada muestra se serializa como un Micro-DSL compacto que incluye el nodo objetivo del diff, metadatos de fichero y lineas, listado de nodos con firmas, aristas del grafo (por ejemplo `CALLS`) y el estado de las puertas simbolicas (ciclos detectados y violaciones de invariantes). No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo una fase de RLHF, DPO o ajuste por calibracion posterior, pese a que las etiquetas del repositorio mencionan `risk-calibration`.

## Capacidades

- Clasificacion binaria de validez de parches de codigo: devuelve `APPROVED` o `REJECTED` sobre un diff serializado como Micro-DSL.
- Puntuacion de riesgo continua y calibrada (0.0 a 1.0), derivada de una escala de cinco niveles de severidad (cosmetico, bajo, medio, alto, critico).
- Deteccion implicita de patrones de fallo cubiertos por el DSL: dependencias circulares, desajustes de aridad, referencias rotas, errores de sintaxis y deriva de contratos semanticos.
- Razonamiento sobre grafos de llamadas multi-salto: el DSL incluye nodos y aristas, y la variante Large se promociona para grafos transitivos multi-hop complejos.
- Cobertura multi-lenguaje de verificacion limitada a cuatro lenguajes Tier 1: Python, TypeScript, Go y Rust.
- Respuesta a preguntas tipadas configurables mediante diccionarios con `type: choice` y `type: score`, lo que permite definir criterios en el propio prompt.
- Inferencia en un unico forward pass, sin generacion autorregresiva.
- No dispone de tool calling, function calling, capacidades de agente autonomo, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Pre-filtro neuronal en pipelines de CI/CD: el modelo clasifica cada parche propuesto antes de ejecutar las puertas simbolicas (Tarjan para ciclos, comprobadores de invariantes de contrato), de modo que los cambios claramente invalidos se descartan sin coste de compilacion ni de tests.
- Bucle de auto-correccion en agentes de programacion: al resolver en decenas de milisegundos, la cabeza de decision puede invocarse tras cada edicion propuesta por el LLM, devolviendo un veredicto y un riesgo que el agente usa para reintentar o revertir.
- Priorizacion de revision de pull requests: el score continuo de riesgo permite ordenar la cola de revisiones humanas y concentrar la atencion en los cambios con riesgo alto o critico.
- Deteccion de ciclos de importacion y deriva de firmas en refactorizaciones grandes: el DSL representa explicitamente aristas `CALLS` y firmas de funcion, por lo que el modelo puede marcar cambios que rompen llamadores.
- Gate de seguridad en herramientas CLI de edicion asistida: la variante `base-164m` (312 MB) se ejecuta en local sin GPU, permitiendo verificar cambios en el escritorio del desarrollador antes de escribirlos en disco.
- Audicion de cambios en monorepos poliglotas: un unico modelo cubre Python, TypeScript, Go y Rust, lo que evita mantener clasificadores separados por lenguaje.
- Enrutado de bajo coste antes de un LLM mayor: usar el veredicto y el score como senal para decidir si merece la pena invocar un modelo generativo grande para explicar o corregir el parche.
- Investigacion en calibracion de decisiones neuro-simbolicas: el repositorio sirve como punto de partida para estudiar la combinacion de cabezas neuronales con verificadores deterministas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (exactitud, F1, ECE, Brier) para ninguna de las dos variantes, pese a que la calibracion del riesgo se presenta como una caracteristica central. El unico dato de latencia disponible corresponde al modelo base Laya, no a este fine-tune: aproximadamente 39,5 ms para el checkpoint de 421M en ingles y 32,8 ms para la variante multilingue de 322M sobre una GPU Tesla T4, segun la nota de prensa recogida en la busqueda web.

## Requisitos de hardware

- VRAM estimada, variante Large 421M en fp32: en torno a 2,5-4 GB contando pesos (1,68 GB) y activaciones para lotes pequenos.
- VRAM estimada en fp16/bf16: aproximadamente 0,85 GB de pesos mas activaciones.
- VRAM estimada en int8 o int4: cerca de 0,45 GB y 0,25 GB respectivamente, partiendo de las estimaciones teoricas, ya que no se publican pesos cuantizados.
- Variante `base-164m`: 312 MB de pesos y una latencia en CPU aproximadamente un 30% inferior a la Large, segun el autor.
- GPU recomendadas: cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4090). Para despliegues de alto volumen son adecuadas T4, L4, A10, A100 y H100, aunque el modelo es pequeno para estas ultimas.
- Ejecucion en CPU: viable, especialmente con la variante `base-164m`, dado el tamano reducido y la ausencia de decodificacion autoregresiva.
- Opciones de despliegue: SDK `laya` (uso recomendado en la model card), `transformers` con cabeza de clasificacion, servidores de inferencia para encoders como TorchServe o Text Embeddings Inference, y exportacion a ONNX Runtime. No hay constancia de soporte oficial en vLLM, TGI, llama.cpp u Ollama al no existir pesos GGUF publicados.
- Latencia y throughput: no disponibles para este fine-tune. Como referencia del modelo base, unos 39,5 ms por peticion en una T4 para el checkpoint de 421M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wxsys/code-oracle-laya-421m | 421M (variante de 164M en el mismo repo) | No publicado; DSL de entrenamiento < 400 tokens | Verificacion de parches: veredicto binario + riesgo calibrado | Apache-2.0 | HuggingFace, safetensors, 0 descargas |
| convaiinnovations/laya | 421M (checkpoint en ingles) y 322M (multilingue) | No disponible en la informacion recogida | Motor de decisiones generico: eleccion tipada, score y si/no en un forward pass, mas de 100 idiomas | Apache-2.0 | HuggingFace, con SDK propio |
| answerdotai/ModernBERT-large | 395M | 8.192 tokens | Encoder generalista de proposito multiple | Apache-2.0 | HuggingFace, ampliamente adoptado |
| microsoft/graphcodebert-base | 125M | 512 tokens | Representacion de codigo entrenada con grafos de datos y estructura | MIT | HuggingFace |

La diferencia clave frente a los dos ultimos es la especializacion: Code Oracle Laya no es un encoder generalista ni un modelo de representacion de codigo, sino una cabeza de decision afinada para un formato de entrada concreto y acoplada a puertas simbolicas externas, lo que limita su reutilizacion fuera de ese pipeline.

## Limitaciones y advertencias

- Entrada restringida al Micro-DSL: el modelo espera el formato exacto de nodos, aristas y metadatos descrito en la model card; no acepta codigo fuente en bruto ni texto libre sin una capa de conversion previa.
- Corpus de entrenamiento muy pequeno: 2.400 muestras con paridad 50/50. El riesgo de sobreajuste a los patrones de mutacion sintetica es alto y no hay metricas publicadas que lo descarten.
- Cobertura linguistica limitada a Python, TypeScript, Go y Rust. Los lenguajes fuera de ese conjunto (Java, C++, C#, Ruby, PHP, etc.) quedan sin soporte declarado.
- Idioma de la interfaz en ingles; el DSL es mayoritariamente simbolico, pero las instrucciones y criterios de las preguntas se redactan en ingles.
- Calibracion del riesgo no verificada: no se publican valores de ECE, Brier ni curvas de fiabilidad, pese a que la calibracion es una de las etiquetas del repositorio.
- Falsos APPROVED: como cualquier cabeza neuronal, puede aprobar parches que violen invariantes no representadas en el DSL. El propio diseno la coloca junto a verificadores deterministas precisamente para mitigar este riesgo.
- No es un modelo generativo ni agentico: no realiza tool calling, no mantiene conversaciones y no puede explicar sus decisiones.
- Dependencia del SDK `laya`: los ejemplos oficiales usan `import laya` y `laya.load(...)`, no la API estandar de `transformers`, lo que anade una dependencia de terceros al pipeline.
- Sin validacion de la comunidad: cero descargas y un solo "me gusta" en el momento de la consulta, sin informes independientes de rendimiento.
- Licencia Apache-2.0, que permite uso comercial, pero al ser trabajo derivado conviene revisar tambien las condiciones de `convaiinnovations/laya` y `answerdotai/ModernBERT-base`.
- Fechas de publicacion del repositorio poco habituales (creado en 2026 segun los metadatos), lo que conviene verificar antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wxsys/code-oracle-laya-421m
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Sitio del proyecto Laya: https://laya.convaiinnovations.com/
- Repositorio GitHub de Laya: https://github.com/NandhaKishorM/laya
- Cobertura en prensa especializada: https://aiweekly.co/alerts/convai-ships-laya-a-421m-modernbert-decision-model-apache-20
- Modelo base de la variante ligera: https://huggingface.co/answerdotai/ModernBERT-base

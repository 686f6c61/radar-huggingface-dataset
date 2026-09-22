# Tdamre/limite-1b-base-GGUF-LiteRT

## Resumen

Tdamre/limite-1b-base-GGUF-LiteRT es un conjunto de conversiones comunitarias de cuantizacion del modelo paradigma-inc/limite-1b-base, publicado por el usuario Tdamre bajo licencia Apache 2.0. No se ha reentrenado nada: el repositorio empaqueta los mismos pesos del checkpoint base en dos formatos de despliegue, GGUF y LiteRT-LM, conservando la arquitectura personalizada Limite del modelo original. La revision de origen de la que parten las conversiones es c55f6dd9741d89b88186235c6d43bff367ae3cb0.

El modelo tiene 1.068.799.406 parametros (aproximadamente 1,07 mil millones) y conserva en metadatos la ventana de contexto original de 131.072 posiciones, aunque los artefactos distribuidos se compilan para contextos de ejecucion de 16.384, 32.768 y 65.536 tokens. Es un checkpoint base preentrenado, no ajustado a instrucciones, segun indica el propio autor, por lo que su uso natural es el completado de texto en bruto o el aprendizaje con pocos ejemplos (few-shot).

Su relevancia actual esta en dos frentes. Por un lado, ofrece una via de ejecucion en CPU de un modelo de arquitectura no estandar mediante LiteRT-LM 0.17.0. Por otro, documenta de forma poco habitual el proceso de cuantizacion: incluye la matriz de importancia, los scripts de reproduccion y un fichero de validacion con las comprobaciones de fidelidad numerica respecto al FP32 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Limite (arquitectura personalizada; los detalles internos no se especifican en la informacion disponible) |
| Parametros totales | 1.068.799.406 (aproximadamente 1,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 posiciones en los metadatos originales; contextos de ejecucion de 16.384, 32.768 y 65.536 tokens en los artefactos distribuidos |
| Tipos de cuantizacion | GGUF: Q2_K_L, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0. LiteRT-LM: mixta INT4/INT8 (OCTAV INT4/block32 + INT8 con computo en coma flotante) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y .litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Limite, etiquetada en el repositorio como custom-architecture, que no esta implementada en las builds estandar de llama.cpp ni de Ollama en esta version. Los ficheros GGUF requieren el parche de llama.cpp incluido en el repositorio (runtime/README.md); sin el, no es posible cargarlos. Los bundles LiteRT-LM si usan el formato estandar de LiteRT-LM y se probaron con la version 0.17.0 sobre CPU. No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO del modelo original.

Lo que si se documenta con detalle es el proceso de conversion. Cada checkpoint se calibro por separado sobre 327.680 tokens extraidos de un corpus deterministico de entrenamiento de GSM8K y MBPP. Las cuantizaciones GGUF se generaron con el exportador publico de Unsloth mas una matriz de importancia especifica del modelo; el autor aclara que no son releases Dynamic v2/v3 ni se publican bajo la marca oficial de Unsloth, porque el generador privado exacto no estaba disponible. Se preservan las puertas sensibles de Limite, los mezcladores residuales densos y las tablas rotatorias, y el runtime maneja activaciones feed-forward grandes sin recortar la funcion entrenada. En el lado LiteRT, las proyecciones Q/K/V y gate/up de la red feed-forward usan INT4/block32 OCTAV, mientras que las proyecciones de salida de atencion y down, junto con las tablas de vocabulario, usan INT8 con computo en coma flotante; las interfaces de grafo y las caches KV permanecen en float32. Cada fichero LiteRT almacena fisicamente 519.045.120 parametros INT4 y 516.096.000 parametros INT8, auditados tras la exportacion.

## Capacidades

- Generacion de texto por completado: al ser un checkpoint base, funciona con prompts de continuacion en bruto y con aprendizaje few-shot, no con instrucciones directas.
- Razonamiento y matematicas: el repositorio lo etiqueta explicitamente con mathematics y reasoning, y la calibracion se hizo sobre corpus de GSM8K y MBPP.
- Modo conversacional: incluye una plantilla Jinja (Violetto) con un system prompt matematico fijo, utilizable con llama-server enviando solo mensajes de usuario.
- Contexto largo: admite hasta 65.536 tokens en los artefactos compilados y conserva metadatos para 131.072 posiciones.
- Ejecucion en CPU: los bundles LiteRT-LM estan pensados para backend CPU, con cache en disco y APIs asincronas en Python.
- Tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponibles. El autor indica que el razonamiento es texto generado por el modelo y que este bundle no expone un control de pensamiento activable o desactivable.

## Casos de uso

- Completado de texto en bruto para prototipos: dado que es un modelo base, encaja en tareas de continuacion de texto y plantillas, como el ejemplo del propio repositorio ("The capital of France is"), sin esperar obediencia a instrucciones.
- Razonamiento matematico con few-shot: su calibracion sobre corpus de GSM8K y MBPP y su etiquetado en mathematics sugieren su uso en generacion de cadenas de razonamiento matematico cuando se aportan ejemplos en el prompt.
- Inferencia en CPU sin GPU: los bundles LiteRT-LM de 0,783 a 0,830 GiB permiten desplegar el modelo en equipos sin acelerador, usando el backend CPU y cache en disco para generaciones largas.
- Procesamiento de documentos extensos: con contextos de 32.768 o 65.536 tokens se pueden resumir o analizar documentos largos en una sola pasada, siempre que el dispositivo disponga de memoria suficiente para las caches KV.
- Asistente conversacional con plantilla Violetto: mediante llama-server con la plantilla Jinja embebida y el system prompt matematico fijo, se puede montar un chat orientado a tareas cuantitativas.
- Investigacion sobre cuantizacion: la inclusion de la matriz de importancia, los scripts de reproduccion y validation.json lo convierte en un caso de estudio para medir el impacto de Q2_K_L frente a Q8_0 mediante divergencia KL y coincidencia del token mas probable.
- Generacion de datos sinteticos y destilacion: un modelo de 1B ejecutable en CPU puede emplearse para producir texto de forma masiva en un pipeline de aumento de datos.
- Evaluacion de arquitecturas no estandar: sirve para probar el parche de llama.cpp de la arquitectura Limite y comparar su comportamiento frente a implementaciones estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las comparaciones incluidas son "smoke comparisons", no una suite de benchmarks. Lo que si se aporta es una medida de fidelidad de la cuantizacion respecto al FP32 de origen, con un prompt corto:

| Fichero GGUF | Tamano (GiB) | KL vs FP32 de origen (prompt corto) | Coincidencia del token mas probable |
|---|---:|---:|---:|
| Q2_K_L | 0,457 | 0,29995 | 87,5 % |
| Q3_K_M | 0,592 | 0,03134 | 100,0 % |
| Q4_K_M | 0,684 | 0,01729 | 100,0 % |
| Q5_K_M | 0,769 | 0,01078 | 100,0 % |
| Q6_K | 0,859 | 0,01103 | 100,0 % |
| Q8_0 | 1,093 | 0,00171 | 100,0 % |

Para LiteRT la comparacion usa 43 posiciones en el prompt formateado de Violetto o 48 posiciones agrupadas de cinco prompts del modelo base. Las verificaciones cubren los seis GGUF en los tres contextos, logits finitos en la ultima posicion, comparaciones numericas, generacion con cache, formas de cache compiladas de LiteRT e identidad exacta de tokenizador, plantilla y grafo empaquetados. No hay datos de throughput ni de latencia en tokens por segundo.

## Requisitos de hardware

- Pesos GGUF: de 0,457 GiB (Q2_K_L) a 1,093 GiB (Q8_0). A estos hay que sumar la cache KV y las asignaciones del runtime, no cuantificadas en el repositorio para GGUF.
- Bundles LiteRT-LM: de 0,783 a 0,830 GiB de pesos, mas las caches KV, que por si solas ocupan 1,5 GiB a 16.384 tokens, 3,0 GiB a 32.768 y 6,0 GiB a 65.536. Los pesos, buffers temporales, preparacion del delegado y otras asignaciones requieren RAM adicional.
- GPU recomendadas: no disponibles. El delegado GPU probado en LiteRT rechaza las operaciones de estos grafos, por lo que el camino validado es CPU. El autor senala que la ejecucion en GPU/NPU no esta certificada en esta release.
- Cabe en GPU de consumo: los pesos de un modelo de 1B si caben en cualquier GPU moderna, pero no hay ruta de ejecucion validada en GPU para estos artefactos en la release actual.
- Dispositivos moviles: la ejecucion en dispositivos fisicos Android o iOS no esta certificada.
- Opciones de despliegue: llama.cpp con el parche de Limite incluido (llama-completion y llama-server), y LiteRT-LM 0.17.0 con CLI o APIs asincronas de Python y cache en disco. Las builds estandar de llama.cpp y Ollama no implementan la arquitectura y no pueden cargar los GGUF.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el autor advierte que el setup e inferencia en CPU con contextos grandes pueden ser lentos, que el bundle de 64K esta pensado para dispositivos con memoria suficiente y que la decodificacion sincrona de LiteRT-LM 0.17.0 tiene un limite de diez minutos, por lo que recomienda la ruta de streaming de la CLI o las APIs asincronas.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La unica comparacion interna posible es entre los dos formatos distribuidos en este mismo repositorio, que comparten pesos del checkpoint base paradigma-inc/limite-1b-base:

| Criterio | GGUF | LiteRT-LM (.litertlm) |
|---|---|---|
| Cuantizacion | Q2_K_L a Q8_0 (K-quants) | Mixta INT4/INT8 |
| Contextos compilados | 16.384 / 32.768 / 65.536 tokens | 16.384 / 32.768 / 65.536 tokens |
| Tamano de pesos | 0,457 a 1,093 GiB | 0,783 a 0,830 GiB |
| Runtime | llama.cpp con parche de Limite | LiteRT-LM 0.17.0 |
| Backend probado | no especificado en detalle | CPU (GPU rechazada por el delegado) |
| Licencia | Apache 2.0 | Apache 2.0 |

## Limitaciones y advertencias

- Es un checkpoint base preentrenado, no ajustado a instrucciones. No debe esperarse que siga ordenes ni que mantenga un formato de respuesta conversacional salvo que se use la plantilla Violetto.
- Los GGUF requieren un parche especifico de llama.cpp. Las builds estandar de llama.cpp y Ollama no soportan la arquitectura Limite en esta release, lo que limita su integracion directa en despliegues existentes.
- El delegado GPU de LiteRT rechaza las operaciones de estos grafos; el backend validado es CPU, con la penalizacion de rendimiento que ello implica.
- La ejecucion en dispositivos moviles fisicos Android e iOS, asi como en GPU y NPU, no esta certificada.
- La decodificacion sincrona de LiteRT-LM 0.17.0 tiene un limite de diez minutos; las generaciones largas deben usar streaming o APIs asincronas.
- Las cuantizaciones de mas baja precision degradan la calidad. Q2_K_L presenta una divergencia KL de 0,29995 frente al FP32 y solo un 87,5 % de coincidencia en el token mas probable; las versiones Q3_K_M y superiores mantienen el 100 % de coincidencia en la prueba realizada.
- Las cuantizaciones se hicieron con el exportador publico de Unsloth y una matriz de importancia propia, no con el generador privado Dynamic v2/v3, por lo que no deben tratarse como releases oficiales de Unsloth.
- Los idiomas soportados no se documentan, lo que impide garantizar un comportamiento multilingue uniforme.
- Riesgo de alucinacion: no se documenta de forma especifica, pero es inherente a un modelo de 1B sin ajuste por instrucciones. No se aportan evaluaciones de sesgo.
- Licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y conservacion del aviso de licencia.
- El autor advierte que las comparaciones de fidelidad incluidas no constituyen una suite de benchmarks ni una validacion de calidad de tarea.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Tdamre/limite-1b-base-GGUF-LiteRT
- Modelo base original: https://huggingface.co/paradigma-inc/limite-1b-base
- Directorio de ficheros GGUF: https://huggingface.co/Tdamre/limite-1b-base-GGUF-LiteRT/tree/main/gguf
- Directorio de bundles LiteRT-LM: https://huggingface.co/Tdamre/limite-1b-base-GGUF-LiteRT/tree/main/litert
- Presets de contexto: https://huggingface.co/Tdamre/limite-1b-base-GGUF-LiteRT/tree/main/presets
- Matriz de importancia y calibracion: https://huggingface.co/Tdamre/limite-1b-base-GGUF-LiteRT/tree/main/calibration
- Scripts de reproduccion: https://huggingface.co/Tdamre/limite-1b-base-GGUF-LiteRT/blob/main/REPRODUCE.md
- Instrucciones del runtime GGUF con el parche: https://huggingface.co/Tdamre/limite-1b-base-GGUF-LiteRT/blob/main/runtime/README.md
- Evidencia de validacion: https://huggingface.co/Tdamre/limite-1b-base-GGUF-LiteRT/blob/main/validation.json
- Entradas fijas de validacion: https://huggingface.co/Tdamre/limite-1b-base-GGUF-LiteRT/blob/main/validation_inputs.json

# Word2Li/CoTranslator-4B

## Resumen

CoTranslator-4B es un modelo de traduccion de trayectorias de razonamiento desarrollado por Word2Li, presentado en el trabajo CoTranslator: Reverse to Forward Chain-of-Thought Translator for Reasoning Distillation. No es un modelo de proposito general: es un traductor especializado que recibe una cadena de pensamiento inversa (generada por un profesor con acceso a la respuesta de referencia) y la reformula como una solucion directa verificada, similar a como se resolveria el problema sin conocer la respuesta de antemano. El objetivo es producir supervision de alta calidad para destilar razonamiento en modelos estudiante.

El modelo parte de Qwen/Qwen3-4B-Thinking-2507 y se ha afinado con supervisión completa de parametros (full-parameter SFT) sobre el subconjunto subset_1_8 del dataset Word2Li/CoTranslator-Nemotron-SFT-Math-v4-Pairs, que contiene 33.286 filas en el JSONL original antes del preprocesado y empaquetado. Almacena 4.022.468.096 parametros en BF16, repartidos en dos shards de Safetensors, y se distribuye bajo licencia Apache-2.0, la misma que el modelo base.

Su relevancia actual reside en el enfoque de distilacion: en lugar de generar datos sinteticos directamente, se entrena un traductor que convierte trayectorias condicionadas por la respuesta en trayectorias forward verificadas, lo que permite escalar la construccion de datos de entrenamiento para modelos estudiante. Es un componente de pipeline de investigacion, no un asistente conversacional de uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, derivado de Qwen3-4B-Thinking-2507 (chat template qwen3_thinking) |
| Parametros totales | 4.022.468.096 (aprox. 4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso una longitud de secuencia de 65.536 tokens |
| Tipos de cuantizacion | Pesos publicados en BF16; no se especifican otros formatos cuantizados (no disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, BF16, dos shards |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B-Thinking-2507, con el chat template qwen3_thinking, que coloca la etiqueta de apertura `<think>` en el prompt. El ajuste se realizo con Megatron-Swift sobre los parametros completos, durante 3 epocas, con learning rate 5e-5, schedule coseno y warmup del 0,1, weight decay de 0,1, Adam con beta1 0,9 y beta2 0,95, gradient clipping de 1,0 y semilla 42. El batch global fue de 32 con batch micro de 2, precision BF16 y packing activado sobre secuencias de hasta 65.536 tokens; los ejemplos que excedian ese limite se descartaron en el preprocesado. El checkpoint publicado corresponde al paso 616.

La tarea de traduccion se define mediante una instruccion de sistema ("You are a reasoning trajectory refiner. Given a teacher-generated solution trajectory, produce a more natural reasoning trajectory. Preserve the mathematical conclusion and answer format.") seguida de un mensaje de usuario con la trayectoria inversa del profesor en el formato `<think>{{reasoning_content}}</think>{{content}}`. El objetivo durante el entrenamiento es la respuesta forward correspondiente del dataset Nemotron original, validada por verificacion de respuesta. En inferencia, el manuscrito condiciona al traductor unicamente sobre la trayectoria; el problema y la respuesta de referencia se usan solo para el emparejamiento y la verificacion. El autor publica ademas un traductor complementario, CoTranslator-4B-Full.

## Capacidades

- Traduccion de trayectorias de razonamiento: convierte cadenas de pensamiento condicionadas por la respuesta (reverse CoT) en trayectorias que imitan soluciones forward verificadas.
- Razonamiento matematico: el dataset de entrenamiento y el flujo del trabajo estan centrados en problemas de matematicas (tag `math`).
- Generacion de cadenas de pensamiento: produce trayectorias con contenido de razonamiento y respuesta final en el formato esperado.
- Preservacion de conclusion matematica y formato de respuesta, segun la instruccion de sistema empleada.
- Generacion de datos de supervision para destilacion de razonamiento en modelos estudiante.
- Modo conversacional segun el tag del repositorio, aunque la tarea principal es la traduccion de trayectorias.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Construccion de datasets de destilacion: el modelo traduce a gran escala trayectorias reverse generadas por un profesor para producir pares de entrenamiento verificados que alimenten a modelos estudiante.
- Aumento de datos de razonamiento matematico: a partir de un corpus de trayectorias condicionadas por respuesta, se generan soluciones forward que aumentan la diversidad del conjunto de entrenamiento.
- Investigacion en destilacion de CoT: permite estudiar si la reformulacion de trayectorias mejora la transferencia de razonamiento respecto a la supervision directa.
- Refinado de soluciones para evaluacion: se puede usar para normalizar el estilo de trayectorias antes de compararlas con soluciones de referencia en pipelines de evaluacion automatica.
- Generacion de curriculum para modelos pequenos: las trayectorias traducidas se pueden ordenar por dificultad o longitud y usarse en fases de entrenamiento progresivo.
- Alineacion de formato en datasets heterogeneos: al preservar conclusion y formato de respuesta, el modelo puede homogeneizar trayectorias provenientes de distintas fuentes antes de mezclarlas.
- Reproduccion de experimentos del articulo: sirve como checkpoint de referencia para replicar los resultados del trabajo CoTranslator y comparar contra el checkpoint Full.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 4.022.468.096 parametros, no confirmada por el autor):
  - BF16: aproximadamente 8 GB solo para pesos, mas memoria de cache KV (que puede crecer de forma notable con generaciones de hasta 32.768 tokens).
  - Cuantizacion de 8 bits (si se generase): aproximadamente 4-5 GB.
  - Cuantizacion de 4 bits (si se generase): aproximadamente 2,5-3 GB.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, una GPU con 16 GB o mas de VRAM resulta holgada en BF16 para prompts cortos.
- Compatibilidad con GPU de consumo: probable en GPUs de consumo con 12-16 GB o mas de VRAM para BF16 con prompts moderados, sujeto a la longitud de contexto efectiva y al tamaño de la cache KV.
- Opciones de despliegue: Transformers (el autor indica la version 5.12.1 para guardar y verificar la configuracion). Los tags del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, por lo que TGI es una via de despliegue soportada por metadatos.
- Otras opciones (vLLM, llama.cpp, Ollama): no confirmadas en la informacion disponible; no se publican pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoTranslator-4B | 4.022.468.096 | No disponible (entrenamiento a 65.536 tokens) | Traduccion de trayectorias CoT | Apache-2.0 | HuggingFace (Word2Li/CoTranslator-4B) |
| CoTranslator-4B-Full | No disponible | No disponible | Traduccion de trayectorias CoT | No disponible | HuggingFace (Word2Li/CoTranslator-4B-Full) |
| Qwen/Qwen3-4B-Thinking-2507 | No disponible en la informacion proporcionada | No disponible | Modelo de razonamiento general | Apache-2.0 (segun la model card del autor) | HuggingFace (Qwen/Qwen3-4B-Thinking-2507) |

No se dispone de datos de rendimiento de los modelos comparados en la informacion proporcionada, por lo que la comparacion se limita a identidad, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de proposito especifico: no esta disenado como asistente general; su tarea esperada es traducir trayectorias de razonamiento en el formato documentado.
- Idioma: solo se declara soporte de ingles (`en`); no se documentan capacidades multilingues.
- Dominio: el entrenamiento se centra en matematicas; el rendimiento fuera de ese dominio no esta documentado.
- Formato de entrada estricto: la entrada de inferencia debe seguir el formato de instruccion de sistema y mensaje de usuario descrito; desviarse puede degradar la calidad de la traduccion.
- Riesgo de alucinacion: no se documenta una evaluacion de fidelidad de las trayectorias traducidas mas alla de la verificacion de respuesta usada durante la construccion del dataset.
- Sesgos: no se documentan analisis de sesgos en la informacion disponible.
- Longitud: el entrenamiento descarta ejemplos de mas de 65.536 tokens, por lo que entradas muy largas pueden quedar fuera de la distribucion de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero la atribucion y las licencias especificas de los datos de entrenamiento se describen en la model card del dataset emparejado, que conviene revisar antes de un uso en produccion.
- Madurez: el repositorio registra 0 descargas y 0 likes, y la validacion realizada por el autor se limita a la carga de configuracion y tokenizer con Transformers 5.12.1.
- Parametros de muestreo: el autor fija temperature 0.6, top-p 0.95, top-k 20 y min-p 0 para la inferencia del traductor; usar otros valores no esta validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Word2Li/CoTranslator-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507/blob/main/LICENSE
- Dataset emparejado: https://huggingface.co/datasets/Word2Li/CoTranslator-Nemotron-SFT-Math-v4-Pairs
- Traductor complementario: https://huggingface.co/Word2Li/CoTranslator-4B-Full
- Articulo (CoTranslator: Reverse to Forward Chain-of-Thought Translator for Reasoning Distillation): no disponible enlace en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada

# vegahyo/Granite-4.2-3B-NPU2

## Resumen

Granite-4.2-3B-NPU2 es una conversión cuantizada del modelo IBM Granite 4.2 3B, realizada por el desarrollador vegahyo, con el objetivo de ejecutarlo en NPUs AMD Ryzen AI basadas en la arquitectura XDNA2 (también denominada NPU2). El modelo base, desarrollado por IBM, es un transformer denso de 3.000 millones de parámetros con capacidades nativas de razonamiento (thinking), tool calling, generación multilingüe y soporte para tareas de codificación. Esta conversión no introduce un modelo nuevo: redistribuye los pesos originales de IBM bajo la misma licencia Apache-2.0, pero en un contenedor de pesos llamado q4nx, diseñado específicamente para el runtime FastFlowLM.

La relevancia de esta ficha radica en que permite ejecutar un modelo de razonamiento de 3B en hardware de consumo con NPU dedicada, sin necesidad de GPU dedicada. El repositorio incluye el archivo de pesos `model.q4nx` (2,6 GB), junto con la configuración, el tokenizador y la plantilla de chat originales. El autor documenta que el tokenizador y la plantilla se mantienen deliberadamente sin modificar, ya que cualquier cambio degrada la calidad de las respuestas, un hallazgo verificado empíricamente. El modelo está pensado para usarse con FastFlowLM, aunque el soporte para la familia granite aún no está integrado en una versión estable del runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (basado en IBM Granite 4.2 3B) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4nx (semantica Q4_1 en layout de tiles para NPU XDNA2) |
| Idiomas soportados | Multilingue (segun documentacion del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | q4nx (contenedor especifico para FastFlowLM) |

## Arquitectura y entrenamiento

El modelo base, IBM Granite 4.2 3B, es un transformer denso con 40 capas, dimension oculta de 2560, 40 cabezas de consulta sobre 8 cabezas de clave/valor, dimension de cabeza de 64, dimension intermedia de 8192, vocabulario de 100352 tokens, RoPE con theta 1e7 y normalizacion RMSNorm con epsilon 1e-5. IBM entrenó este modelo con capacidades nativas de razonamiento (thinking), lo que le permite generar una traza de pensamiento antes de la respuesta final. El modelo soporta tool calling, generacion de JSON estructurado, RAG y tareas de codificacion, segun la documentacion oficial de IBM.

La conversion a q4nx se realizó con la herramienta q4nx-build, que transforma los pesos originales a un layout de tiles optimizado para la NPU XDNA2. El autor verificó la conversion tensor a tensor contra el GGUF de origen y validó el forward pass con una implementacion numpy independiente, obteniendo concordancia coseno en prefill y en los pasos de decodificacion 1 y 50. El tokenizador y la plantilla de chat se mantienen intactos; el autor documenta que sustituirlos por alternativas (como el tokenizador del propio granite-4.2) degrada la salida, porque difieren en 17 ids de tokens de control sobre 100352.

## Capacidades

- Generacion de texto con razonamiento nativo: el modelo produce una traza de pensamiento (thinking) antes de la respuesta final, lo que mejora la precision en tareas de logica y matemáticas.
- Tool calling: soporta definicion de herramientas segun el esquema de funciones de OpenAI y decide qué herramienta invocar y por qué, antes de realizar la llamada.
- Generacion de codigo: el modelo base esta entrenado para tareas de programacion en multiples lenguajes.
- Salida JSON estructurada: puede generar respuestas en formato JSON valido, util para integraciones con APIs.
- Multilingue: el modelo base soporta multiples idiomas, aunque la lista exacta no se especifica en la informacion disponible.
- Razonamiento multi-paso: gracias al modo thinking, puede descomponer problemas complejos en pasos intermedios.
- RAG (retrieval-augmented generation): compatible con flujos de recuperacion de informacion externa.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: al ejecutarse en NPU XDNA2, el modelo puede alimentar asistentes locales en portatiles o mini-PCs sin depender de la nube, con latencia de decodificacion de unos 13,6 tok/s en la NPU (aunque los kernels aun no estan integrados en el runtime).
- Automatizacion de atencion al cliente: con tool calling y generacion de JSON, puede gestionar consultas, consultar bases de datos o APIs externas y devolver respuestas estructuradas, todo en un entorno de bajo consumo.
- Generacion de codigo asistida en entornos sin GPU: desarrolladores con hardware AMD Ryzen AI pueden usar el modelo para autocompletar o generar fragmentos de codigo directamente en su maquina, sin necesidad de servicios en la nube.
- Razonamiento y analisis de documentos: el modo thinking permite resumir, extraer conclusiones o responder preguntas sobre documentos largos, aunque la longitud de contexto no esta especificada en la informacion disponible.
- Prototipado rapido de agentes: al soportar tool calling y razonamiento multi-paso, es adecuado para construir agentes que interactuan con APIs, ejecutan comandos o realizan busquedas, todo en un entorno local.
- Educacion y aprendizaje: puede utilizarse como tutor interactivo que explica conceptos paso a paso, aprovechando su capacidad de razonamiento para desglosar problemas matematicos o logicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K. El unico dato de rendimiento documentado es la velocidad de decodificacion: aproximadamente 8,7 tok/s en CPU (Ryzen AI 9 HX 370) con el motor granite de FastFlowLM, y 13,6 tok/s de tiempo de dispositivo para la pila completa de capas en la NPU, aunque estos kernels NPU aun no estan conectados al flujo de ejecucion de C++.

## Requisitos de hardware

- Dispositivo con NPU AMD Ryzen AI XDNA2 (NPU2), por ejemplo el Ryzen AI 9 HX 370.
- El modelo tambien puede ejecutarse en CPU, aunque a menor velocidad (8,7 tok/s en el procesador mencionado).
- No requiere GPU dedicada; la VRAM no es aplicable, ya que el modelo esta disenado para NPU o CPU.
- Tamano del repositorio: 2,6 GB, por lo que se necesita al menos ese espacio en disco.
- Runtime: FastFlowLM (aun sin soporte oficial para la familia granite; se requiere un build con el pull request correspondiente).
- Opciones de despliegue: FastFlowLM como runtime principal; no se mencionan alternativas como vLLM u Ollama para este formato especifico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite-4.2-3B-NPU2 (este) | 3B | No disponible | Apache-2.0 | q4nx | Cuantizado para NPU XDNA2, requiere FastFlowLM |
| IBM Granite 4.2 3B (base) | 3B | No disponible | Apache-2.0 | safetensors, GGUF | Modelo original, sin cuantizar, ejecutable en GPU/CPU |
| Qwen2.5-3B | 3B | 32K | Apache-2.0 | safetensors, GGUF | Alternativa densa de 3B, sin modo thinking nativo |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 Community | safetensors, GGUF | Alternativa densa de 3B, sin modo thinking nativo |

La comparativa se basa en caracteristicas generales conocidas de los modelos alternativos; no se dispone de datos de rendimiento especificos para esta cuantizacion frente a ellos.

## Limitaciones y advertencias

- El soporte de FastFlowLM para la familia granite no esta en una version estable; se requiere un build con el pull request indicado, lo que limita su uso en produccion.
- Los kernels NPU para esta geometria (head_dim 64) existen y miden 13,6 tok/s, pero no estan integrados en el flujo de ejecucion; actualmente el modelo corre en CPU a 8,7 tok/s.
- La cuantizacion q4nx puede introducir una ligera degradacion en la calidad de las respuestas en comparacion con el modelo original en precision completa, aunque el autor no cuantifica esta perdida.
- El tokenizador y la plantilla de chat son los originales, pero la plantilla emite marcadores ChatML que se tokenizan en seis tokens cada uno, lo que aumenta el numero de tokens de entrada; sustituirlos degrada la salida, por lo que no se recomienda modificarlos.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta cuantizacion, por lo que no es posible evaluar su rendimiento relativo frente a otros modelos.
- La longitud de contexto no esta especificada en la informacion disponible; se desconoce si la cuantizacion afecta a la ventana de contexto.
- La licencia Apache-2.0 permite uso comercial, pero el runtime FastFlowLM y las herramientas de conversion tienen sus propias licencias que deben revisarse.

## Enlaces

- Repositorio HuggingFace: [vegahyo/Granite-4.2-3B-NPU2](https://huggingface.co/vegahyo/Granite-4.2-3B-NPU2)
- Modelo base: [ibm-granite/granite-4.2-3b](https://huggingface.co/ibm-granite/granite-4.2-3b)
- Runtime FastFlowLM: [ROCm/FastFlowLM](https://github.com/ROCm/FastFlowLM)
- Herramienta de conversion q4nx-build: [Atomic-Germ/q4nx-build](https://github.com/Atomic-Germ/q4nx-build)
- Documentacion de IBM Granite 4.2: [https://www.ibm.com/granite/docs/models/granite4-2](https://www.ibm.com/granite/docs/models/granite4-2)
- Pagina de Granite 4.2 3B en Ollama: [https://ollama.com/library/granite4.2:3b](https://ollama.com/library/granite4.2:3b)

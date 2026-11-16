# StefanoBalocco/IntroSVG-Qwen2.5-VL-7B-GGUF

## Resumen

IntroSVG-Qwen2.5-VL-7B-GGUF es una distribucion cuantizada en formato GGUF del modelo gitcat404/IntroSVG-Qwen2.5-VL-7B, publicada por StefanoBalocco. El modelo base es un ajuste fino de Qwen2.5-VL-7B orientado a la generacion de graficos vectoriales SVG a partir de instrucciones en lenguaje natural, empleando un bucle de autoevaluacion: el modelo redacta un SVG, critica una renderizacion de su propio dibujo y lo refina en varias rondas.

Esta version GGUF esta pensada para su uso dentro de ComfyUI mediante el nodo ComfyUI-IntroSVG, desarrollado por el mismo autor de la cuantizacion. Cada archivo GGUF empaqueta el decodificador, la torre de vision, la configuracion del modelo y el tokenizador en un unico fichero, lo que simplifica el despliegue en entornos de generacion grafica sin necesidad de cargar el checkpoint completo en safetensors.

La relevancia de esta ficha reside en que permite ejecutar un modelo vision-lenguaje de 7B especializado en text-to-SVG en GPUs de consumo (se reporta un pico de 7,35 GiB con Q4_0 en una RTX 3060 de 12 GB). El modelo conserva la licencia Apache-2.0 del modelo base y esta declarado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (base Qwen2.5-VL-7B) con bucle de autoevaluacion text-to-SVG |
| Parametros totales | 7B (heredados del modelo base Qwen2.5-VL-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_0, Q5_0, Q8_0 (decodificador); embeddings en Q8_0; cabecera de salida en Q5_0 (Q4_0) o Q8_0 (Q5_0, Q8_0); torre de vision en F16; sesgos y normas en F32 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un unico fichero por cuantizacion con decodificador, torre de vision, configuracion y tokenizador) |

Tamano de los ficheros: 5,99 GB (Q4_0), 7,01 GB (Q5_0) y 9,46 GB (Q8_0). Tamano total del repositorio: 22,5 GB.

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen2.5-VL-7B, un transformer multimodal que procesa texto e imagenes (pipeline image-text-to-text). Sobre esa base, IntroSVG introduce un procedimiento de generacion iterativo: el modelo produce un borrador de SVG, recibe una renderizacion de su propio dibujo como entrada visual, la critica y genera una version refinada. Este bucle de critica y refinamiento es la innovacion central del modelo y se ejecuta desde ComfyUI-IntroSVG con un unico fichero GGUF.

La cuantizacion GGUF conserva la torre de vision en F16 y los sesgos y normas en F32, mientras que el decodificador se cuantiza a Q4_0, Q5_0 o Q8_0. El script de conversion `tools/introsvg_safetensors_to_gguf.py` del repositorio ComfyUI-IntroSVG transforma el checkpoint en estos ficheros. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de codigo SVG a partir de prompts en lenguaje natural (text-to-SVG).
- Razonamiento visual: el modelo recibe renderizaciones de sus propios SVG y las usa para criticar y refinar el resultado.
- Bucle iterativo de borrador, critica y refinamiento (por defecto 3 rondas de critica en ComfyUI-IntroSVG).
- Procesamiento multimodal image-text-to-text (hereda la torre de vision de Qwen2.5-VL-7B).
- Decodificacion especulativa soportada en el flujo de ComfyUI-IntroSVG.
- Integracion nativa en ComfyUI mediante los nodos Load IntroSVG GGUF, IntroSVG Text to SVG y Save SVG.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso en la informacion disponible.

## Casos de uso

- Generacion de iconos y pictogramas vectoriales: el modelo recibe una descripcion textual y produce un SVG editable; el bucle de critica sobre la renderizacion corrige formas y proporciones antes de la entrega final.
- Prototipado rapido de ilustraciones en ComfyUI: con un solo fichero GGUF cargado en `ComfyUI/models/introsvg/`, el disenador itera prompts y previsualiza el SVG con el nodo Save SVG sin salir del grafo.
- Creacion de assets para interfaces y documentacion: la salida SVG es escalable y editable en herramientas vectoriales, adecuada para diagramas simples y elementos de UI.
- Automatizacion de variantes graficas: ejecutar el mismo prompt con distintas semillas o rondas de critica para obtener alternativas de un mismo concepto y seleccionar la mejor.
- Despliegue en estaciones de trabajo con GPU de consumo: con Q4_0 y 7,35 GiB de pico de VRAM en una RTX 3060 de 12 GB, es viable generar SVG localmente sin depender de servicios en la nube.
- Experimentacion en investigacion sobre autoevaluacion visual: el bucle borrador-critica-refinamiento sirve como banco de pruebas para estudiar como un VLM usa renderizaciones propias para mejorar su salida estructurada.
- Generacion de diagramas y esquemas tecnicos simples: util para borradores de diagramas de flujo o esquemas que luego se retocan manualmente en un editor vectorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta metricas de fidelidad de la cuantizacion y de velocidad medidas con ComfyUI-IntroSVG en una RTX 3060 de 12 GB. La "concordancia top-1" es la proporcion de 2139 posiciones de un borrador, una critica y un refinamiento en las que la eleccion del siguiente token coincide con el checkpoint FP32 en Transformers. Los tiempos cubren 20 prompts del conjunto de prueba de IntroSVG con los valores por defecto del nodo (3 rondas de critica y decodificacion especulativa).

| Fichero | Concordancia top-1 | Segundos por prompt (media / mediana) | VRAM pico |
|---|---|---|---|
| Q4_0 | 98,36% | 56,4 / 41,8 | 7,35 GiB |
| Q5_0 | 99,16% | 66,6 / 51,0 | 8,3 GiB |
| Q8_0 | 99,95% | 82,5 / 58,2 | 10,7 GiB |

## Requisitos de hardware

- VRAM estimada: 7,35 GiB (Q4_0), 8,3 GiB (Q5_0) y 10,7 GiB (Q8_0) de pico, medidas en una RTX 3060 de 12 GB con ComfyUI-IntroSVG.
- GPU recomendadas: RTX 3060 12 GB como minimo verificado; GPUs con 12 GB o mas de VRAM para Q8_0 con margen. Para Q4_0 bastan 8 GB de VRAM en teoria, aunque no se ha verificado en la informacion disponible.
- Cabe en GPU de consumo: si, al menos en RTX 3060 12 GB con las tres cuantizaciones; Q4_0 y Q5_0 dejan margen adicional.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-IntroSVG (flujo documentado). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: media de 56,4 s y mediana de 41,8 s por prompt con Q4_0; 66,6 s de media con Q5_0; 82,5 s de media con Q8_0, sobre 20 prompts y con 3 rondas de critica y decodificacion especulativa.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas especializadas en text-to-SVG en la informacion proporcionada. La comparacion se limita al modelo base del que deriva esta cuantizacion.

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| StefanoBalocco/IntroSVG-Qwen2.5-VL-7B-GGUF | 7B | GGUF (Q4_0, Q5_0, Q8_0) | no disponible | Apache-2.0 | Cuantizacion para ComfyUI; metricas de fidelidad y velocidad publicadas |
| gitcat404/IntroSVG-Qwen2.5-VL-7B | 7B | safetensors (checkpoint original) | no disponible | Apache-2.0 | Modelo base; requiere conversion a GGUF para el flujo de ComfyUI |
| Qwen2.5-VL-7B | 7B | safetensors | no disponible | no disponible en la informacion proporcionada | Modelo generalista vision-lenguaje del que deriva IntroSVG |

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta verificado.
- Especializacion estrecha: el modelo esta ajustado para generar SVG mediante un bucle de critica visual; su utilidad fuera de esa tarea no esta documentada.
- Alucinacion: como modelo generativo, puede producir SVG sintacticamente validos pero visualmente incorrectos o con elementos no solicitados; el bucle de critica mitiga pero no elimina este riesgo.
- Perdida de fidelidad por cuantizacion: Q4_0 presenta una concordancia top-1 del 98,36% frente al checkpoint FP32, lo que implica divergencias en el siguiente token en aproximadamente 1,64% de las posiciones medidas.
- Dependencia de herramienta: el flujo documentado requiere ComfyUI y el nodo ComfyUI-IntroSVG; no se documenta uso standalone con otros runners GGUF.
- Contexto: no se dispone de la longitud de contexto soportada, lo que impide garantizar prompts largos o conversaciones multi-turno extensas.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribucion correspondiente al modelo base y a esta cuantizacion.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (16 de noviembre de 2026); no hay evidencia de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StefanoBalocco/IntroSVG-Qwen2.5-VL-7B-GGUF
- Modelo base: https://huggingface.co/gitcat404/IntroSVG-Qwen2.5-VL-7B
- Repositorio ComfyUI-IntroSVG: https://github.com/StefanoBalocco/ComfyUI-IntroSVG
- Repositorio del proyecto IntroSVG: https://github.com/gitcat-404/IntroSVG

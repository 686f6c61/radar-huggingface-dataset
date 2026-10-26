# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo2640-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo2640-lora` es un adaptador LoRA publicado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. No se trata de un modelo completo, sino de pesos de adaptador (formato PEFT/safetensors) que deben cargarse sobre el checkpoint original de Qwen. El repositorio ocupa 0.0 GB según HuggingFace, lo que concuerda con un adaptador de pequeña dimensión sobre un modelo de 0,5 mil millones de parámetros.

El objetivo declarado del entrenamiento es doble: aprender a generar llamadas a herramientas con estructura correcta (tool calling) y aprender a abstenerse cuando el conjunto de herramientas ofrecido no es relevante para la consulta. El autor parte de un adaptador previo entrenado con supervised fine-tuning (8.400 actualizaciones) y lo continúa con Group Relative Policy Optimization, GRPO, durante 2.640 actualizaciones adicionales, usando el dataset `uygarkurt/xlam-tool-calling-mixed`.

Su relevancia es fundamentalmente metodológica y de nicho: muestra un ciclo completo SFT + GRPO reproducible en menos de tres horas de cómputo para una tarea acotada (function calling y abstención) sobre un modelo de 0,5B, lo que permite desplegarlo en entornos con recursos muy limitados. Los resultados publicados muestran una mejora clara en precisión de llamada exacta y en nombres de función, a costa de una caída notable en la detección de irrelevancia, un compromiso que conviene evaluar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura del base Qwen2.5-0.5B-Instruct, detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 0,5B en el modelo base; numero de parametros entrenables del adaptador no disponible (rango y alpha de LoRA no especificados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; determinada por el modelo base Qwen2.5-0.5B-Instruct |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos de adaptador en safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (`en`) segun la model card; el modelo base Qwen2.5 es multilingue, pero el adaptador no declara otros idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`); requiere el modelo base Qwen/Qwen2.5-0.5B-Instruct para inferencia |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de aproximadamente 0,5B de parámetros. Al ser un adaptador LoRA, no se modifican los pesos originales: se añaden matrices de bajo rango en determinadas capas, y el autor indica explícitamente que basta con cargar este adaptador sobre el modelo base, sin necesidad de cargar por separado el adaptador SFT previo. La model card no detalla qué módulos se adaptan, ni el rango, ni el alpha, ni el dropout empleados.

El entrenamiento consta de dos fases sobre el dataset mixto `uygarkurt/xlam-tool-calling-mixed`, orientado a tool calling: primero 8.400 actualizaciones de SFT (1,3 horas) y después 2.640 actualizaciones de GRPO (1,5 horas), con un total de 2,8 horas de bucle de entrenamiento, sin contar carga de modelo, preparación de datos ni evaluación externa. El uso de GRPO sobre una tarea de function calling con recompensas de formato y de relevancia es la innovación destacable: el modelo no solo aprende a emitir la llamada, sino también a reconocer cuándo ninguna herramienta del catálogo es aplicable. Las evaluaciones xLAM se realizaron con scripts propios del proyecto Post-Training Lab, y la evaluación se hizo sobre un holdout de solo llamadas (2.287 ejemplos evaluados, 700 omitidos) en lugar del split de test del dataset mixto.

## Capacidades

- Generacion de llamadas a herramientas (tool calling / function calling) en formato estructurado, incluyendo seleccion de funcion y construccion de argumentos.
- Abtencion explicita cuando las herramientas ofrecidas no son relevantes para la consulta, capacidad entrenada de forma especifica mediante GRPO.
- Generacion de texto conversacional y respuestas de tipo instruct, heredadas del ajuste del modelo base.
- Razonamiento aritmetico y matematico basico, con rendimiento limitado (16,60% en MATH-500).
- Comprension lectora y conocimiento general en ingles, con rendimiento modesto (38,19% en MMLU).
- Seguimiento de instrucciones con formato verificable, medido con IFEval en precision estricta a nivel de prompt (28,84%).
- Capacidades multilingues no garantizadas: el adaptador esta etiquetado solo en ingles, aunque el modelo base soporta varios idiomas.
- No se declaran capacidades de vision, audio, modo thinking explicito ni agentes multi-paso con planificacion autonoma.

## Casos de uso

- Enrutamiento de funciones en asistentes ligeros: dado un catalogo de 5-20 herramientas, el adaptador selecciona la funcion y genera los argumentos en JSON, con 79,49% de precision de llamada exacta en el conjunto xLAM evaluado, suficiente para prototipos y sistemas con validacion posterior.
- Filtro de abtencion en pipelines de agentes: cuando la consulta del usuario no encaja con ninguna herramienta disponible, el modelo puede devolver una respuesta de abstención en lugar de una llamada inventada, lo que evita ejecuciones erroneas en produccion (con la cautela de la caida en irrelevancia descrita mas abajo).
- Despliegue en dispositivos de borde o CPU: con 0,5B de parametros y un adaptador de pequeno tamano, cabe en entornos sin GPU dedicada, por ejemplo asistentes locales en portatiles o routers industriales con presupuesto de memoria reducido.
- Extraccion de parametros estructurados: conversion de lenguaje natural a argumentos de API (fechas, identificadores, filtros) en tareas de automatizacion de back-office, donde el esquema de salida es fijo y verificable.
- Prototipado rapido de pipelines de function calling antes de invertir en un modelo mayor: permite validar prompts, esquemas de herramientas y logica de abtencion con un coste de inferencia minimo.
- Investigacion reproducible sobre post-entrenamiento: el autor publica el ciclo SFT + GRPO y las horas de computo, de modo que sirve como referencia para experimentos de RL sobre tareas de tool calling en modelos pequenos.
- Clasificacion de intencion con salida estructurada: uso del formato de llamada como mecanismo de etiquetado controlado en sistemas de triaje de tickets o consultas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La primera fila corresponde al adaptador SFT que inicializa el GRPO; la segunda, al adaptador final SFT + GRPO. Todos los valores son porcentajes.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (horas) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 8.400 | 37,91 | 18,00 | 29,21 | 71,49 | 86,88 | 46,24 | 55,56 | 88,59 | 1,3 |
| SFT + GRPO (este adaptador) | GRPO 2.640 | 38,19 | 16,60 | 28,84 | 79,49 | 96,72 | 56,44 | 83,33 | 67,74 | 2,8 |

Notas de medicion segun el autor: xLAM ETC es precision exacta de llamada a herramienta; xLAM FNA es precision del nombre de funcion; ambas se calculan sobre el holdout de solo llamadas con 2.287 ejemplos evaluados y 700 omitidos. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a subconjuntos de relevancia seleccionados. Son agregados propios del estudio, no cifras oficiales del benchmark. IFEval usa precision estricta a nivel de prompt.

Lectura de los datos: el GRPO mejora xLAM ETC (+8,00 puntos), xLAM FNA (+9,84), BFCL single-turn FC (+10,20) y Relevance (+27,77), mientras que Irrelevance cae 20,85 puntos y MATH-500 retrocede 1,40 puntos. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en FP16 requiere aproximadamente 1 GB de pesos, mas overhead de activaciones y cache KV; el adaptador LoRA anade unos pocos MB. Cifra exacta no publicada por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas es suficiente (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien cabe en A100, H100 y L4 sin aprovechar su capacidad.
- Inferencia en CPU: viable, al tratarse de 0,5B de parametros; no se publican latencias ni throughput medidos.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el base) es la via documentada; vLLM y TGI soportan adaptadores LoRA, aunque no se han publicado configuraciones validadas para este repositorio; llama.cpp u Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF, paso no documentado por el autor.
- Almacenamiento: repositorio de 0.0 GB segun HuggingFace (redondeo), mas el peso del modelo base descargado aparte.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT + GRPO) | 0,5B (base) + LoRA | No disponible | Tool calling y abtencion | No disponible | HuggingFace, requiere modelo base |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | No disponible en la informacion proporcionada | Instruct generalista, sin ajuste especifico de herramientas | No disponible en la informacion proporcionada | HuggingFace |
| Adaptador SFT previo del mismo autor | 0,5B (base) + LoRA | No disponible | Tool calling via SFT | No disponible | HuggingFace |
| Alternativas de mayor tamano orientadas a function calling | No disponible | No disponible | Tool calling | No disponible | No disponible |

La comparacion cuantitativa disponible se limita al par SFT frente a SFT + GRPO publicado por el autor. No se han encontrado en la informacion proporcionada resultados comparables de otros modelos de la misma categoria (por ejemplo, adaptadores de tool calling sobre Qwen2.5-1.5B o modelos especializados de 1B-3B), por lo que no es posible establecer una comparativa de rendimiento con terceros.

## Limitaciones y advertencias

- El adaptador solo se distribuye en safetensors y requiere cargar el modelo base Qwen/Qwen2.5-0.5B-Instruct; no hay pesos fusionados ni versiones cuantizadas listas para usar.
- La licencia no esta declarada en el repositorio, lo que impide determinar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo base y contactar con el autor antes de un despliegue productivo.
- El rendimiento en conoscimiento general y matematicas es bajo (MMLU 38,19%, MATH-500 16,60%), propio de un modelo de 0,5B; no es adecuado para tareas de razonamiento complejo.
- La deteccion de irrelevancia empeora tras el GRPO: cae del 88,59% al 67,74%, de modo que el modelo tiende mas a emitir una llamada aunque las herramientas no encajen. En produccion conviene anadir una capa de validacion de esquema y de relevancia.
- Las cifras de xLAM y BFCL son agregados propios del estudio, calculados con scripts personalizados y sobre un holdout de solo llamadas (2.287 evaluados, 700 omitidos); no son directamente comparables con resultados oficiales de esos benchmarks.
- Riesgo de alucinacion de nombres de funcion o de argumentos, mitigado parcialmente por el 96,72% de precision de nombre de funcion, pero no eliminado.
- Idiomas: el adaptador esta etiquetado unicamente en ingles; el rendimiento en castellano no esta evaluado y no deberia asumirse.
- Longitud de contexto no documentada en la ficha; aunque el modelo base soporte ventanas amplias, el adaptador no se ha entrenado ni evaluado con contextos largos segun la informacion disponible.
- Sin datos de sesgos, toxicidad o evaluaciones de seguridad publicadas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en comunidad ni de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo2640-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de codigo Post-Training Lab: https://github.com/uygarkurt/post-training-lab

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores son los unicos verificables a partir de la informacion proporcionada.

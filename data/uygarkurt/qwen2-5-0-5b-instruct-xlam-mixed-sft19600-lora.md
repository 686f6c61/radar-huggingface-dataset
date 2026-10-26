# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft19600-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft19600-lora es un adaptador LoRA publicado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (librería PEFT) que debe cargarse encima del modelo original de Qwen. Su propósito es muy concreto: especializar un modelo de 0,5B de parámetros en la generación de llamadas a herramientas con formato estructurado (tool calling) y, de forma destacada, en la abstención cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.

El adaptador se entrenó mediante supervisión fina (SFT) durante 19.600 actualizaciones sobre el dataset uygarkurt/xlam-tool-calling-mixed, con un tiempo de bucle de entrenamiento declarado de 3,1 horas. La receta y la evaluación provienen de la herramienta Post-Training Lab del mismo autor, lo que hace que las métricas publicadas sean agregados propios del estudio y no resultados de un leaderboard independiente.

Su relevancia actual es práctica: los modelos de menos de 1B de parámetros son candidatos naturales para agentes locales, en navegador o en dispositivos con recursos limitados, donde el coste por token y la latencia importan más que el conocimiento enciclopédico. Este adaptador mejora de forma notable la precisión de llamada exacta en xLAM (de 63,84% a 82,82%) manteniendo el tamaño reducido, aunque a costa de un descenso en MMLU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5); el adaptador es LoRA sobre el modelo base. Detalle de capas y cabezas no disponible en la informacion proporcionada |
| Parametros totales | 0,5B en el modelo base (Qwen2.5-0.5B-Instruct); numero de parametros entrenables del adaptador no disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; ampliable hasta 131.072 con YaRN segun la documentacion de Qwen2.5 (una fuente secundaria indica 128K) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (precision del entrenamiento no disponible). El modelo base fusionado admite cuantizaciones habituales: GGUF (Q4_K_M, Q5_K_M, Q8_0), int8 e int4; no se publican cuantizaciones precalculadas del adaptador |
| Idiomas soportados | Ingles (tag `language: en` en el repositorio). El modelo base Qwen2.5 es multilingue, pero el entrenamiento del adaptador se declara en ingles |
| Licencia | No disponible en el repositorio del adaptador. El modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0, pero la licencia del adaptador no se especifica |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2.5, que segun la documentacion del modelo base se preentreno con hasta 18 billones de tokens y incorpora mejoras en codigo y matematicas respecto a Qwen2. La pieza entrenada aqui es un LoRA: no se modifican los pesos completos, sino que se anaden matrices de bajo rango, lo que reduce el coste de entrenamiento y permite distribuir el adaptador en un repositorio de tamano practicamente nulo (0,0 GB declarados).

El entrenamiento consistio en SFT con 19.600 actualizaciones sobre el dataset mixto uygarkurt/xlam-tool-calling-mixed, con 3,1 horas de bucle de entrenamiento (sin contar carga de modelo, preparacion de datos ni evaluacion externa). El objetivo declarado es doble: producir llamadas a herramientas estructuradas correctas y abstenerse cuando el conjunto de herramientas ofrecido no cubre la peticion. No se documentan en la informacion disponible ni la composicion exacta del dataset, ni el numero de tokens vistos, ni si hubo fases de RLHF o DPO posteriores al SFT, ni los hiperparametros del LoRA (rango, alpha, dropout).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Instruct.
- Tool calling / function calling estructurado: emision de llamadas con nombre de funcion y argumentos, evaluado con los conjuntos xLAM ETC, xLAM FNA y BFCL single-turn.
- Abtencion ante herramientas irrelevantes: capacidad entrenada explicitamente y medida en las particiones Relevance/Irrelevance.
- Razonamiento de varios pasos encadenando varias llamadas a herramientas, limitado por el tamano del modelo.
- Capacidades basicas de codigo y matematicas heredadas del base, con MATH-500 en 17,20% e IFEval en 30,13%.
- Capacidades multilingues del modelo base no garantizadas tras el ajuste: el adaptador se entrena y evalua en ingles.
- Sin vision, sin audio y sin modo thinking explicito: son capacidades no declaradas en la informacion disponible.

## Casos de uso

- Agentes locales de bajo consumo: el adaptador se carga sobre un modelo de 0,5B que ocupa alrededor de 1 GB en fp16, por lo que puede ejecutarse en un portatil o en un dispositivo con GPU integrada para tareas de enrutado de herramientas sin depender de la nube.
- Enrutador de intenciones en pipelines RAG: dado un catalogo cerrado de funciones (busqueda, calculo, consulta a base de datos), el modelo decide cual invocar y con que argumentos, con una precision de llamada exacta del 82,82% en xLAM ETC segun el autor.
- Abstención controlada en asistentes de produccion: la mejora en la particion de irrelevancia permite que el modelo responda "no dispongo de herramienta para esto" en lugar de inventar una llamada, lo que reduce errores en cascada en sistemas con herramientas acotadas.
- Preprocesado de lenguaje natural a JSON: conversion de peticiones en ingles a estructuras de argumentos para APIs internas, aprovechando el formato de las llamadas aprendidas durante el SFT.
- Prototipado rapido de agentes: al ser un adaptador LoRA, permite comparar con y sin especializacion sobre el mismo modelo base sin duplicar el coste de almacenamiento ni de despliegue.
- Filtro de segunda etapa: uso como clasificador de relevancia herramienta-consulta antes de invocar un modelo mayor, reduciendo el numero de llamadas a modelos costosos.
- Base para experimentos de investigacion en post-entrenamiento: la receta (SFT con 19.600 updates, 3,1 horas) es reproducible con Post-Training Lab y sirve como linea base para estudiar el equilibrio entre capacidad de herramienta y conocimiento general en modelos pequenos.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las cifras son porcentajes; la primera fila es el modelo base sin adaptador y la segunda el adaptador SFT.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | — | 42,04 | 15,80 | 26,80 | 63,84 | 90,03 | 50,28 | 77,78 | 66,93 | — |
| SFT (este adaptador) | SFT 19.600 | 38,19 | 17,20 | 30,13 | 82,82 | 97,81 | 56,78 | 83,33 | 67,65 | 3,1 |

Notas sobre la medicion, segun el autor: xLAM ETC es precision exacta de llamada a herramienta y xLAM FNA es precision del nombre de funcion; ambas se calculan sobre el holdout de solo llamadas, con 2.287 ejemplos evaluados y 700 descartados, no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno. Relevance e Irrelevance corresponden a subconjuntos de relevancia seleccionados. IFEval usa precision estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab. No hay resultados de benchmarks independientes ni comparaciones con otros adaptadores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: alrededor de 1 GB para los pesos del modelo base en fp16, aproximadamente 0,5 GB en int8 y 0,3 GB en int4. El adaptador LoRA anade solo unos pocos megabytes. El consumo real dependera de la longitud de contexto y del tamano de lote.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (RTX 3050, RTX 4060, GTX 1660, Apple Silicon con Metal). Para servir en lote con contexto largo son preferibles A100, H100 o L40S, aunque el modelo esta muy sobredimensionado para ellas.
- Cabe en GPU consumer: si, con margen amplio, incluso en fp16. Tambien es viable en CPU con llama.cpp.
- Opciones de despliegue: transformers + peft (carga del adaptador sin fusionar), fusion del adaptador con `merge_and_unload` para exportar a GGUF y usar llama.cpp u Ollama, vLLM con soporte de adaptadores LoRA (`--enable-lora`), y TGI. Para produccion con adaptadores dinamicos, vLLM es la opcion mas directa.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (uygarkurt) | 0,5B (base) | 32.768 nativos / 131.072 con YaRN | Tool calling y abtencion via LoRA SFT | No disponible | Hugging Face, adaptador PEFT |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 nativos / 131.072 con YaRN | Proposito general, Instruct | Apache 2.0 | Hugging Face, Ollama |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 nativos / 131.072 con YaRN | Proposito general, Instruct | Apache 2.0 | Hugging Face, Ollama |
| Qwen2.5-3B-Instruct | 3B | 32.768 nativos / 131.072 con YaRN | Proposito general, Instruct | Apache 2.0 | Hugging Face, Ollama |

Frente al modelo base, el adaptador gana 19,0 puntos en xLAM ETC, 7,8 en xLAM FNA, 6,5 en BFCL single-turn y 3,3 en IFEval, pero pierde 3,85 puntos en MMLU. Frente a Qwen2.5-1.5B-Instruct y Qwen2.5-3B-Instruct no hay comparacion directa disponible en la informacion proporcionada: son modelos mas grandes, con licencia Apache 2.0 y sin especializacion declarada en tool calling, por lo que probablemente ofrezcan mejor conocimiento general a cambio de mas VRAM y latencia. No se dispone de datos de otros adaptadores de tool calling comparables en la informacion consultada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin cargar Qwen2.5-0.5B-Instruct no funciona, y el repositorio no incluye los pesos completos.
- Licencia no especificada: aunque el modelo base es Apache 2.0, la ausencia de licencia en el repositorio del adaptador impide asumir permisos de uso comercial. Conviene contactar con el autor antes de integrarlo en produccion.
- Regresion en conocimiento general: MMLU cae de 42,04% a 38,19%, coherente con un SFT intensivo sobre un dominio estrecho.
- Mejora marginal en irrelevancia: 66,93% a 67,65% (+0,72 puntos), por lo que la abtencion sigue fallando en aproximadamente uno de cada tres casos del subconjunto evaluado. No es una garantia fiable de "no inventar herramientas".
- Idoneidad limitada para razonamiento complejo: con 0,5B de parametros, MATH-500 en 17,20% e IFEval en 30,13% indican un rendimiento bajo en matematicas e instrucciones estrictas.
- Riesgo alto de alucinacion en contenido factual y en argumentos de llamadas cuando la peticion es ambigua; el modelo no tiene mecanismos de verificacion.
- Entrenamiento y evaluacion solo en ingles: el rendimiento en castellano no esta medido y probablemente sea inferior al del modelo base.
- Benchmarks generados por el propio autor con scripts propios y subconjuntos seleccionados, no por un leaderboard independiente; los numeros no son directamente comparables con los de otros papers.
- Evaluacion con 2.287 ejemplos y 700 descartados en xLAM: muestra pequena, sin intervalos de confianza publicados.
- Contexto efectivo no verificado en el adaptador: aunque el base soporte 32K o mas, no hay evidencia de que el ajuste preserve el comportamiento en ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft19600-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
- Qwen2.5-0.5B-Instruct en Ollama: https://ollama.com/library/qwen2.5:0.5b-instruct
- Qwen2.5-0.5B-Instruct en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct/summary

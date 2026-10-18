# zhengyijia142/LatentRAG_Qwen2.5-7B_F2LLM-v2-330M_Search-R1_Qwen2.5-7B

## Resumen

LatentRAG_Qwen2.5-7B_F2LLM-v2-330M_Search-R1_Qwen2.5-7B es un adaptador LoRA publicado por el usuario zhengyijia142 (repositorio zhengyijia) sobre el modelo base Qwen/Qwen2.5-7B. No se trata por tanto de un modelo completo, sino de un checkpoint de pesos PEFT que debe cargarse junto al modelo base de 7,6 mil millones de parametros para poder utilizarse. El adaptador implementa el metodo LatentRAG, descrito en el paper arXiv:2605.06285 al que remite la model card.

El entrenamiento se ha realizado sobre trayectorias generadas por Search-R1 utilizando los conjuntos de entrenamiento de NQ (Natural Questions) y HotpotQA, y empleando F2LLM-v2-330M como recuperador. Es decir, el modelo aprende un comportamiento de generacion aumentada por recuperacion (RAG) en el que el propio modelo decide cuando consultar al recuperador dentro de una trayectoria de razonamiento de varios pasos, en lugar de recibir pasivos documentos concatenados en el prompt. La propuesta resulta relevante para quien investigue RAG agentico y busqueda multi-salto, aunque su madurez es todavia muy limitada: cero descargas, cero likes y ausencia de datos de evaluacion en la informacion disponible.

La informacion publicada es minima: la model card se limita a tres frases y no declara licencia, idiomas, contexto efectivo ni resultados. Todo lo que se detalla a continuacion sobre arquitectura y contexto procede del modelo base Qwen2.5-7B y se indica como herencia del mismo, no como especificacion del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; modelo base Qwen2.5-7B |
| Parametros totales | Modelo base: ~7,6 mil millones. Adaptador LoRA: no disponible (repositorio de 3,5 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5 soporta hasta 128K tokens segun la documentacion de Qwen |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en safetensors); el modelo base admite cuantizaciones de terceros (GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 es multilingue; los datos de entrenamiento del adaptador, NQ y HotpotQA, son en ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El checkpoint es un adaptador LoRA de bajo rango que se aplica sobre Qwen2.5-7B, un transformer decoder-only denso preentrenado por Alibaba con hasta 18 billones de tokens y capacidades multilingues, con soporte declarado de hasta 128K tokens de contexto. Al ser un adaptador, no modifica la topologia del modelo base: anade matrices de bajo rango en determinadas capas, de modo que el modelo final se obtiene cargando el base y el adaptador (o fusionandolos). El repositorio ocupa 3,5 GB, un tamano superior al de un adaptador LoRA tipico para un modelo de 7B, lo que sugiere que puede incluir artefactos adicionales ademas de los pesos del adaptador; la model card no lo detalla.

El entrenamiento se realizo sobre trayectorias generadas por Search-R1 en los conjuntos de entrenamiento de Natural Questions y HotpotQA, con F2LLM-v2-330M actuando como recuperador. Este esquema corresponde a un aprendizaje de comportamiento agentico de busqueda: el modelo genera llamadas al recuperador y consume los resultados devueltos a lo largo de varios pasos, en la linea de los trabajos de RAG con razonamiento intercalado. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF, DPO o aprendizaje por refuerzo (Search-R1 emplea tipicamente optimizacion por refuerzo para generar las trayectorias, pero la model card no lo confirma para este checkpoint). El paper arXiv:2605.06285 es la referencia para los detalles del metodo LatentRAG, y no se ha podido consultar su contenido en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y de respuesta a preguntas, heredada del modelo base Qwen2.5-7B.
- Recuperacion aumentada agentica: el modelo esta ajustado para emitir consultas a un recuperador externo (F2LLM-v2-330M) e integrar los pasajes devueltos durante la generacion.
- Razonamiento multi-salto: el entrenamiento incluye HotpotQA, un benchmark de preguntas que requieren encadenar evidencia de varios documentos.
- Busqueda iterativa: capacidad de realizar varias consultas sucesivas dentro de una misma trayectoria, segun el formato aprendido de Search-R1.
- Soporte de tool calling / function calling en el sentido de invocar la herramienta de recuperacion segun el protocolo de Search-R1 (no se documenta compatibilidad con esquemas genericos tipo OpenAI tools).
- Capacidades multilingues: no documentadas para el adaptador; las del modelo base no estan garantizadas tras el ajuste fino.
- No se documentan capacidades de vision, audio, modo thinking explicito ni decodificacion especulativa.

## Casos de uso

- Investigacion en RAG agentico: reproduccion y analisis de LatentRAG como linea base frente a RAG pasivo, cargando el adaptador sobre Qwen2.5-7B y el recuperador F2LLM-v2-330M para comparar trayectorias de busqueda.
- Preguntas multi-salto sobre corpus documentales: el ajuste con HotpotQA lo hace adecuado para consultas que exigen combinar evidencia de dos o mas documentos, emitiendo busquedas intermedias en lugar de responder de memoria.
- Asistentes de busqueda corporativa: integrado en un pipeline con un recuperador sobre el indice interno, el modelo puede decidir cuando consultar y refinar la consulta, reduciendo respuestas sin respaldo documental.
- Verificacion de hechos con evidencia: la trayectoria de busqueda permite registrar que consultas se lanzaron y que pasajes se recuperaron, lo que facilita la trazabilidad de la respuesta en auditorias.
- Evaluacion de recuperadores: al estar acoplado a F2LLM-v2-330M, sirve para medir como afecta cambiar el retriever (dimension, modelo, estrategia de chunking) al exito de la tarea de QA.
- Generacion de datos sinteticos de razonamiento con busqueda: las trayectorias producidas pueden usarse como material de destilacion o para construir datasets de entrenamiento de otros modelos de la misma familia.
- Prototipado de agentes de documentacion tecnica: con contexto largo del modelo base (hasta 128K tokens), permite mantener historial de conversacion y pasajes recuperados en una misma ventana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de NQ, HotpotQA ni de ninguna otra evaluacion, y el paper referenciado (arXiv:2605.06285) no se ha podido consultar en el material proporcionado. No deben asumirse cifras de rendimiento del metodo sin verificacion directa en el paper o mediante reproduccion.

## Requisitos de hardware

- VRAM estimada: los calculos siguientes son estimaciones a partir del modelo base de 7,6 mil millones de parametros, no datos publicados por el autor. En FP16/BF16, el modelo fusionado requiere aproximadamente 15-16 GB de VRAM; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. Cargar el adaptador sin fusionar anade una sobrecarga pequena (del orden de cientos de MB) pero exige el base completo en memoria.
- GPU recomendadas: A100 40/80 GB o H100 para servir con lotes grandes y contexto largo; L40S o RTX 6000 Ada (48 GB) para despliegues de una sola tarjeta con contexto extendido.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en FP16 con contexto moderado y en 4 bits en tarjetas de 8-12 GB (RTX 4070, RTX 3060 12 GB), siempre que se use cuantizacion del modelo base.
- Opciones de despliegue: transformers + peft para cargar el adaptador directamente; vLLM con soporte de adaptadores LoRA para servicio concurrente; llama.cpp u Ollama requieren convertir y fusionar previamente los pesos a GGUF, ya que no consumen adaptadores PEFT de forma nativa en todos los casos; TGI como alternativa de servido.
- Ademas del modelo, el sistema completo necesita el recuperador F2LLM-v2-330M (unos 0,33 mil millones de parametros) y un indice vectorial sobre el corpus, lo que anade requisitos de memoria y latencia propios del retriever.
- Latencia y throughput: no disponibles. La latencia efectiva dependera del numero de turnos de recuperacion que genere el modelo en cada consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LatentRAG (este checkpoint) | 7,6B (base) + LoRA | No especificado (base: hasta 128K) | RAG agentico con recuperador F2LLM-v2-330M, entrenado sobre trayectorias de Search-R1 | No disponible | HuggingFace, 0 descargas |
| Qwen2.5-7B-Instruct | 7,6B | 128K | Modelo instructivo generalista, sin modulo de recuperacion integrado | No disponible en la informacion consultada (Qwen2.5 se distribuye habitualmente con licencia Apache 2.0, verificar en el repositorio oficial) | Ampliamente disponible |
| Search-R1 (Qwen2.5-7B) | 7,6B | No disponible en la informacion consultada | Razonamiento con busqueda entrenado por refuerzo sobre NQ y HotpotQA | No disponible en la informacion consultada | Referenciado como generador de las trayectorias de entrenamiento de este adaptador |
| RAG pasivo con Qwen2.5-7B + retriever | 7,6B + retriever | Limitado por el numero de pasajes concatenados | Recuperacion en un unico paso y respuesta condicionada | Segun componentes | Configuracion generica |

No se dispone de cifras comparativas de rendimiento entre estas alternativas en la informacion proporcionada, por lo que la comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: sin el modelo base Qwen/Qwen2.5-7B y el recuperador F2LLM-v2-330M no funciona segun lo previsto.
- La licencia no esta declarada, lo que impide determinar si se permite uso comercial; hay que contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue productivo.
- No hay resultados de benchmarks ni evaluacion independiente; el rendimiento real en NQ o HotpotQA es desconocido.
- El entrenamiento se limita a NQ y HotpotQA, ambos en ingles y orientados a Wikipedia; es esperable un rendimiento degradado en otros dominios (documentacion tecnica, legislacion, datos internos) y en castellano.
- Riesgo de alucinacion: aunque el modelo este entrenado para buscar, no hay garantia de que todas las afirmaciones se fundamenten en pasajes recuperados; en ausencia de recuperacion fiable puede responder de memoria.
- Dependencia del formato de trayectoria de Search-R1: desviarse del prompt y del protocolo de llamada a la herramienta puede degradar sustancialmente el comportamiento.
- El repositorio tiene cero descargas y cero likes, y la model card es minima; se trata de un artefacto de investigacion sin senales de validacion por la comunidad.
- El identificador de arXiv (2605.06285) corresponde a un preprint que no se ha podido verificar en la informacion disponible; conviene confirmar su contenido antes de citarlo.
- El contexto efectivo tras el ajuste fino no esta documentado; no debe asumirse que el adaptador explote los 128K tokens del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zhengyijia142/LatentRAG_Qwen2.5-7B_F2LLM-v2-330M_Search-R1_Qwen2.5-7B
- Repositorio GitHub del proyecto: https://github.com/zhengyijia/LatentRAG
- Paper LatentRAG: https://arxiv.org/pdf/2605.06285
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:7b

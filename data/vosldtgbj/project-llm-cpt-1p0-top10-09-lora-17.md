# vosldtgbj/project-llm-cpt-1p0-top10-09-lora-17

## Resumen

Project LLM: CPT / top10-09-lora-17 es un checkpoint multimodal publicado por el usuario vosldtgbj como parte de una serie de experimentos de preentrenamiento continuado (CPT, continual pretraining). Deriva de google/gemma-4-12B, un modelo de 11.959.730.176 parametros, y se distribuye con las etiquetas gemma4_unified, image-text-to-text y any-to-any, lo que indica que conserva la capacidad de procesar texto e imagenes y de generar salidas multimodales. El pipeline declarado en HuggingFace es any-to-any.

El modelo no es un lanzamiento de producto: su model card lo describe explicitamente como un archivo de pesos completos para reproduccion de experimentos, evaluacion offline e investigacion posterior. Se entrenó durante 1,0 epoca mediante LoRA CPT y los adaptadores se fusionaron en pesos completos, de modo que el repositorio contiene un modelo directamente cargable, sin estados de optimizador, planificador ni estado de reanudacion. El repositorio ocupa 24,0 GB y esta publicado en safetensors fragmentados.

Su relevancia es acotada pero clara para quien quiera auditar o reproducir recetas de preentrenamiento continuado sobre la familia Gemma 4 con atencion a idiomas distintos del ingles (la etiqueta japanese aparece en los tags). La licencia declarada es apache-2.0, pero el propio autor remite a los terminos de la licencia de Gemma 4, un punto que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (transformer multimodal, segun tag del repositorio; detalles internos no disponibles) |
| Parametros totales | 11.959.730.176 (aprox. 11,96 mil millones) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors sin cuantizar) |
| Idiomas soportados | Etiqueta japanese en los tags; lista oficial de idiomas no disponible |
| Licencia | apache-2.0 declarada, sujeta ademas a los terminos de la licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | Safetensors fragmentados (sharded) |
| Modelo base | google/gemma-4-12B |
| Modalidades | Texto e imagen (image-text-to-text, any-to-any) |
| Tamano del repositorio | 24,0 GB |
| Libreria | transformers (requiere soporte para gemma4_unified) |
| Fecha de publicacion | 2026-10-08 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo hereda la arquitectura gemma4_unified del modelo base google/gemma-4-12B y que es multimodal, dado que el pipeline declarado es any-to-any y los tags incluyen image-text-to-text. No se detalla en la documentacion proporcionada el numero de capas, la dimension del modelo, el tipo de atencion, la estrategia de tokenizacion de imagen ni la longitud de contexto nativa. Tampoco se especifica si el modelo base emplea mezcla de expertos; con 11,96 mil millones de parametros totales y sin etiquetas de MoE, lo razonable es tratarlo como un transformer denso.

El entrenamiento consistio en un preentrenamiento continuado de 1,0 epoca sobre el modelo base, realizado mediante LoRA y posteriormente fusionado en pesos completos. No se indica el corpus utilizado, el numero de tokens vistos, la mezcla de datos ni si hubo fases posteriores de ajuste por instrucciones, RLHF o DPO. La etiqueta japanese sugiere un enfasis en datos en japones, pero no se aporta ninguna cifra sobre la composicion del dataset. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de texto multimodal: al derivar de un modelo any-to-any, se espera capacidad de procesar entradas de imagen y texto, aunque no se documentan ejemplos de uso ni limites concretos.
- Comprension de imagen a texto (image-text-to-text): tarea declarada de forma explicita en los tags del repositorio.
- Generacion en japones: el tag japanese apunta a un refuerzo del idioma durante el CPT, sin datos cuantitativos que lo respalden.
- Razonamiento y codigo: no disponible. No se documentan capacidades especificas de razonamiento, matematicas o generacion de codigo.
- Tool calling / function calling: no disponible. No se menciona soporte de llamada a herramientas.
- Uso agentico y razonamiento multi-paso: no disponible. No se declara ningun modo de pensamiento (thinking mode) ni bucle agentico.
- Otras capacidades especiales (audio, video, decodificacion especulativa): no disponible.

## Casos de uso

- Reproduccion de experimentos de CPT: el repositorio existe precisamente para replicar la receta de preentrenamiento continuado con LoRA sobre Gemma 4; un equipo de investigacion puede cargar los pesos, comparar contra el modelo base y medir el efecto de 1,0 epoca de CPT sobre datos propios.
- Evaluacion offline de modelos multimodales: al ser un checkpoint completo y no un adaptador, se puede integrar en un arnes de evaluacion propio para medir comprension de imagen y texto sin depender de servicios externos.
- Investigacion sobre adaptacion multilingue al japones: la etiqueta japanese permite estudiarlo como caso de transferencia de un modelo predominantemente entrenado en ingles hacia otro idioma, midiendo perdida de perplexidad y calidad de generacion.
- Punto de partida para ajuste fino supervisado: al estar los pesos ya fusionados y en safetensors, sirve como base para SFT con LoRA sobre dominios concretos sin necesidad de recomponer adaptadores.
- Analisis de deriva (drift) respecto al modelo base: comparar salidas de este checkpoint y de google/gemma-4-12B permite medir que capacidades se degradan o mejoran tras un CPT de una sola epoca.
- Demostraciones internas de prototipado multimodal: para equipos que ya tengan licencia y hardware para Gemma 4 y quieran probar flujos de imagen mas texto en local, con la advertencia de que no hay garantias de calidad documentadas.
- Auditoria de licencias y trazabilidad de pesos: util como ejemplo practico de repositorio que combina licencia apache-2.0 con terminos de uso upstream, un escenario habitual en auditorias de cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y no se ha encontrado evaluacion externa del checkpoint en los resultados de busqueda. Cualquier cifra de rendimiento que se quiera usar debera obtenerse mediante evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 11,96 mil millones de parametros; son estimaciones, no datos publicados por el autor):
  - bf16/fp16: en torno a 24 GB solo para pesos, mas memoria para cache KV y activaciones segun contexto y lote.
  - Cuantizacion de 8 bits: aproximadamente 12 GB de pesos.
  - Cuantizacion de 4 bits: aproximadamente 7-8 GB de pesos.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, L40S o similares con 40 GB o mas de VRAM. Una RTX 4090 de 24 GB queda muy justa en bf16 y probablemente requiera cuantizacion o reparto en memoria del sistema.
- Viabilidad en GPU de consumo: plausible en RTX 3090/4090 con cuantizacion de 8 o 4 bits, siempre que se genere la version cuantizada, ya que el repositorio solo ofrece safetensors sin cuantizar.
- Opciones de despliegue: transformers, cargando con AutoProcessor y AutoModelForMultimodalLM (requiere una version de la libreria que soporte la arquitectura gemma4_unified). Para vLLM, llama.cpp u Ollama seria necesario verificar soporte de gemma4_unified y, en el caso de llama.cpp/Ollama, convertir previamente los pesos a GGUF; no se proporciona ninguna version GGUF en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| project-llm-cpt-1p0-top10-09-lora-17 | 11,96 B | no disponible | any-to-any (texto e imagen) | apache-2.0 con terminos de Gemma 4 | Pesos completos en safetensors, 0 descargas |
| google/gemma-4-12B (modelo base) | 12 B (segun denominacion) | no disponible | multimodal (segun tags del derivado) | Terminos de licencia de Gemma 4 | Modelo base de referencia, datos no verificados en esta busqueda |
| vosldtgbj/project-llm-cpt-0p5-lora-13 | no disponible | no disponible | no disponible | no disponible | Repositorio hermano del mismo autor, 0,5 epocas de CPT segun su identificador |

No se dispone de datos verificados de otros modelos comparables de la misma categoria y tamano en la informacion proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparativas, ni resultados de validacion publicados. El rendimiento real es desconocido.
- Procedencia experimental: la propia model card lo define como archivo de pesos para reproduccion e investigacion, no como modelo listo para produccion.
- Riesgo de degradacion por CPT: un preentrenamiento continuado de 1,0 epoca sin ajuste posterior por instrucciones puede haber alterado el alineamiento y el formato de respuesta del modelo base; conviene comparar contra google/gemma-4-12B antes de usarlo.
- Riesgo de alucinacion: no cuantificado ni evaluado en la informacion disponible.
- Sesgos: no documentados. No se informa de la composicion del corpus de CPT, por lo que no es posible estimar sesgos de dominio, idioma o demografia.
- Idiomas: solo se etiqueta japanese. El alcance multilingue real y la calidad en castellano no estan documentados.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Licencia: aunque los metadatos declaran apache-2.0, el autor remite explicitamente a la licencia de Gemma 4 y a sus terminos de uso. Es imprescindible revisar esa licencia antes de cualquier explotacion comercial, ya que podria imponer restricciones adicionales.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin garantia de mantenimiento, soporte ni actualizaciones.
- Compatibilidad: la carga exige una version de transformers con soporte para gemma4_unified; versiones anteriores fallaran. No se ofrecen pesos en GGUF ni cuantizaciones listas para usar.

## Enlaces

- HuggingFace: https://huggingface.co/vosldtgbj/project-llm-cpt-1p0-top10-09-lora-17
- Repositorio hermano del mismo autor: https://huggingface.co/vosldtgbj/project-llm-cpt-0p5-lora-13
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Licencia de Gemma 4 referenciada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license

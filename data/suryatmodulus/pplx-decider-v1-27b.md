# suryatmodulus/pplx-decider-v1-27b

## Resumen

pplx-decider-v1-27b es un modelo de decision y clasificacion afinado a partir de Qwen3.8-27B, con 26.085.330.160 parametros y un repositorio de 52,2 GB en safetensors. Aunque la ficha de HuggingFace consultada aparece bajo el autor suryatmodulus, la model card y los ejemplos de uso apuntan al espacio perplexity-ai/pplx-decider-v1-27b, lo que sugiere una publicacion vinculada a Perplexity AI. La licencia declarada es Apache 2.0.

El modelo no esta pensado para generar texto libre, sino para emitir decisiones: seleccionar una opcion entre varias con probabilidades calibradas, responder preguntas binarias de si/no, y hacerlo tambien sobre imagenes. La model card lo presenta como un "decision model" evaluado en 11 benchmarks de clasificacion, razonamiento y verificacion factual, con un 85,71 % de media global frente al 74,76 % del Qwen3.8-27B base.

Su relevancia actual se explica por el contexto de despliegue local: los resultados de busqueda lo situan como el modelo que impulsa Portable Computer, la propuesta de agente local de Perplexity lanzada en agosto de 2026 y ejecutada sobre NVIDIA DGX Spark, junto con la variante Qwen 3.8 27B. Se trata, por tanto, de un componente de enrutado y decision dentro de un stack de agentes, no de un modelo conversacional generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.8-27B; clase de arquitectura indicada en resultados de busqueda: Qwen3_5ForConditionalGeneration |
| Parametros totales | 26.085.330.160 (aproximadamente 26,1 B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio se distribuye en safetensors (pesos completos, aproximadamente 49 GiB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria PyTorch) |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 52,2 GB |
| Modelo base | Qwen/Qwen3.8-27B (relacion: finetune) |
| Modalidad | Multimodal (acepta imagenes ademas de texto) |
| Codigo | Requiere codigo personalizado (tag custom-code); se distribuye un inference.py con la clase Decider |

## Arquitectura y entrenamiento

La informacion disponible indica que pplx-decider-v1-27b es un finetune del modelo Qwen3.8-27B, con 26,1 B de parametros y pesos en safetensors. No se detalla en la model card ni en los resultados de busqueda el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. Los resultados de busqueda mencionan, para un checkpoint relacionado de Perplexity (pplx-computer-qwen-3-8-27b-dflash2-20260824), un post-entrenamiento con herramientas RFT/SDPO sobre la misma base Qwen3.8-27B, pero ese dato corresponde a otro artefacto y no debe atribuirse automaticamente a este modelo.

La innovacion funcional de este checkpoint no esta en la arquitectura, sino en la interfaz de salida: el modelo expone un metodo `predict` que devuelve la opcion seleccionada junto con probabilidades calibradas, admite criterios de clasificacion definidos por el usuario y soporta tanto decisiones de eleccion multiple como preguntas binarias. La model card indica ademas soporte de entrada de imagenes, lo que sugiere un codificador visual heredado de la base. El pipeline declarado es text-classification y las etiquetas de libreria incluyen pytorch, safetensors, classification, multimodal y custom-code.

## Capacidades

- Clasificacion por eleccion multiple: recibe un texto y un diccionario de criterios con opciones etiquetadas, y devuelve la opcion seleccionada con probabilidades calibradas.
- Preguntas binarias: mediante el tipo `noul`, responde con una probabilidad para consultas del estilo "¿este mensaje expresa urgencia?".
- Entrada multimodal: acepta imagenes junto al texto (`images=["screenshot.png"]` o `--image screenshot.png`), lo que permite clasificar sobre capturas de pantalla.
- Razonamiento y sentido comun: la model card reporta resultados en WinoGrande y BBH, lo que indica capacidad de resolver tareas de inferencia y razonamiento multi-paso.
- Verificacion factual y deteccion de alucinaciones: evaluado en RAGTruth y TruthfulQA (binario).
- Analisis financiero: evaluado en FinancialPhraseBank, con 84,18 % de acierto.
- Razonamiento sobre tablas y documentos: evaluado en TabFact y ContractNLI.
- Multilingue: evaluado en Belebele, aunque el listado concreto de idiomas soportados no esta disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes multi-paso: no disponible; su uso documentado es como componente de decision, no como planificador conversacional.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo de la model card clasifica un mensaje de fallo de integracion de Stripe entre las categorias billing, technical_support y sales. Es adecuado porque devuelve probabilidades calibradas, lo que permite fijar un umbral y derivar a un humano cuando la confianza es baja.
- Deteccion de urgencia en bandejas de entrada: con `{"type": "noul"}` se obtiene una probabilidad de urgencia por mensaje, util para priorizar colas de atencion al cliente o alertas internas.
- Verificacion de respuestas RAG: con un 88,80 % en RAGTruth, el modelo puede actuar como comprobador de fidelidad entre la respuesta generada y el contexto recuperado antes de mostrarla al usuario final.
- Moderacion y clasificacion de contenido: la combinacion de TruthfulQA y JudgeBench sugiere su uso como clasificador de calidad o adecuacion de contenido, con la ventaja de exponer una probabilidad en lugar de una etiqueta dura.
- Analisis de sentimiento financiero: el 84,18 % en FinancialPhraseBank lo hace util para procesar notas de prensa, informes y comentarios de analistas en pipelines de senales de mercado.
- Verificacion de contratos y clausulas: con un 80,78 % en ContractNLI, puede comprobar si un documento respalda o contradice una hipotesis concreta (por ejemplo, existencia de clausulas de confidencialidad), integrado en flujos de revision legal asistida.
- Auditoria de tablas y hojas de calculo: con un 90,60 % en TabFact puede validar afirmaciones contra datos tabulares extraidos de informes.
- Clasificacion sobre capturas de pantalla: al aceptar imagenes, permite etiquetar incidencias a partir de screenshots enviados por usuarios sin necesidad de OCR previo.
- Componente de decision en agentes locales: los resultados de busqueda lo situan dentro de Portable Computer, donde el runtime del agente (orquestador, planificador, enrutador de herramientas y planificador de tareas) se ejecuta en el dispositivo en lugar de en la nube.

## Benchmarks y rendimiento

Resultados publicados en la model card. Segun el autor, las cifras de pplx-decider-v1-27b se midieron a traves de la API de Perplexity.

| Benchmark | Jev | Qwen3.8-27B | pplx-decider-v1-27b |
|---|---:|---:|---:|
| WinoGrande | **90,70 %** | 73,10 % | 83,30 % |
| FinancialPhraseBank | 76,98 % | 75,68 % | **84,18 %** |
| RAGTruth | 77,27 % | 61,53 % | **88,80 %** |
| JudgeBench | **78,57 %** | 68,86 % | 78,29 % |
| BBH | **94,27 %** | 72,80 % | 82,80 % |
| JevBench public hard | **73,27 %** | 72,28 % | 70,30 % |
| TabFact | 89,80 % | 78,60 % | **90,60 %** |
| ContractNLI | 77,45 % | **80,78 %** | **80,78 %** |
| Circa | 84,60 % | 87,00 % | **89,20 %** |
| Belebele | **95,00 %** | 93,20 % | 94,00 % |
| TruthfulQA binary | **92,00 %** | 82,80 % | 85,40 % |
| Overall | 84,51 % | 74,76 % | **85,71 %** |

En negrita, la mejor puntuacion de cada fila. No se han publicado datos de latencia, throughput ni coste por inferencia en la informacion disponible. Tampoco se especifica la metodologia exacta de evaluacion mas alla de la mencion a la API de Perplexity, ni si el modelo comparado "Jev" corresponde a un checkpoint publico identificable.

## Requisitos de hardware

- VRAM estimada en precision completa: la model card indica que se necesita espacio para aproximadamente 49 GiB de pesos mas memoria de trabajo, lo que situa el requisito practico por encima de los 50 GiB.
- GPU de datacenter: una A100 de 80 GB o una H100 de 80 GB son suficientes para cargar los pesos en bf16 dejando margen para el contexto y el batching.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en bf16 ni en una RTX 3090 de 24 GB. Seria necesario repartir el modelo entre varias GPU o aplicar cuantizacion, y la informacion disponible no confirma cuantizaciones publicadas para este checkpoint.
- Hardware de borde: los resultados de busqueda situan su despliegue en NVIDIA DGX Spark dentro de Portable Computer, un equipo con memoria unificada; es el escenario local documentado.
- Opciones de despliegue: la model card distribuye un `inference.py` con la clase `Decider` y dependencias gestionadas con `uv` (`uvx --from huggingface-hub hf download ...`). El repositorio esta marcado con custom-code, por lo que no se puede asumir compatibilidad directa con vLLM, TGI o transformers estandar; llama.cpp y Ollama no estan disponibles porque no se publican pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall (media de los 11 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-v1-27b | 26,1 B | No disponible | 85,71 % | Apache 2.0 | safetensors, requiere codigo personalizado |
| Qwen3.8-27B (base) | No disponible en la informacion proporcionada | No disponible | 74,76 % | No disponible | Modelo base del finetune |
| Jev (referencia de la model card) | No disponible | No disponible | 84,51 % | No disponible | No se ha identificado el checkpoint publico en la busqueda |
| pplx-computer-qwen-3-8-27b-dflash2-20260824 | Derivado de Qwen3.8-27B | No disponible | No disponible | No disponible | Publicado en perplexity-ai, cuantizado a NVFP4 con cabecera lm_head en bf16 |

No se dispone de informacion suficiente para comparar con alternativas de clasificacion de la misma categoria fuera del ecosistema de Perplexity.

## Limitaciones y advertencias

- Sesgos: no se ha publicado ninguna evaluacion de sesgo, toxicidad o fairness en la informacion disponible.
- Alucinacion: aunque el modelo obtiene un 85,40 % en TruthfulQA binario, se trata de una tarea de clasificacion; no hay garantia de calibracion fuera de la distribucion de los benchmarks evaluados.
- Ambiguedad de identificacion: la ficha de HuggingFace consultada apunta al autor suryatmodulus, mientras que la model card y los ejemplos de codigo referencian el espacio perplexity-ai. Conviene verificar el origen real del repositorio antes de usarlo en produccion.
- Numeros de benchmark no reproducibles de forma independiente: las puntuaciones se midieron a traves de la API de Perplexity, no ejecutando los pesos locales, y no se detalla la configuracion de evaluacion.
- Idiomas: el listado de idiomas soportados no esta disponible, pese a que el modelo se evalua en Belebele. No se debe asumir cobertura multilingue amplia sin verificacion.
- Contexto: la longitud de contexto no esta declarada, lo que impide dimensionar tareas de documento largo o conversaciones multi-turno extensas.
- Codigo personalizado: el tag custom-code implica que la carga estandar con AutoModel puede no funcionar y que se depende de la clase `Decider` y del script publicado para mantener la compatibilidad.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.8-27B, cuya licencia no se especifica en la informacion proporcionada.
- Ausencia de adopcion: el repositorio figura con 0 descargas y 0 likes en la ficha consultada, por lo que no hay retroalimentacion de la comunidad sobre su comportamiento en produccion.
- Caducidad de la informacion: las fechas del repositorio (creacion y actualizacion el 1 de octubre de 2026) y de los productos referenciados son posteriores al conocimiento habitual de los modelos Qwen publicos; conviene contrastar la trazabilidad del checkpoint.

## Enlaces

- Ficha de HuggingFace (suryatmodulus): https://huggingface.co/suryatmodulus/pplx-decider-v1-27b
- Repositorio referenciado en la model card: https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint relacionado de Perplexity: https://huggingface.co/perplexity-ai/pplx-computer-qwen-3-8-27b-dflash2-20260824
- Perplexity AI: https://www.perplexity.ai/
- Portable Computer: https://www.perplexity.ai/hub/products/portable-computer
- Analisis de Portable Computer y PPLX 27B: https://blog.buildfastwithai.com/perplexity-portable-computer-review
- Articulo sobre Portable Computer y despliegue local: https://sakutto.ai/en/articles/perplexity-portable-computer

# Tang-yin-112/mt-guard-4g-v5

## Resumen

mt-guard-4g-v5 es un modelo de deteccion de alucinaciones (guard) publicado por el usuario Tang-yin-112 en HuggingFace. Se trata de un ajuste fino mediante LoRA sobre meta-llama/Llama-3.2-3B-Instruct (revision 0cb88a4f764b7a12671c53f0838cd831a0843b95), entrenado sobre el corpus RAGTruth, posteriormente fusionado y cuantizado a GGUF Q4_K_M. El modelo se presenta como la entrega del autor para el arena "Microtensor guard / mt-4g", un entorno de evaluacion de modelos guardarraíl para deteccion de alucinaciones en respuestas generadas con recuperacion aumentada (RAG).

Con 3.212.749.888 parametros, hereda del modelo base la arquitectura transformer decodificador de Llama 3.2 3B, con una ventana de contexto declarada de 2.048 tokens para esta adaptacion concreta. Su proposito es actuar como clasificador o filtro que detecte fragmentos alucinados en la salida de un sistema RAG, un problema critico en despliegues empresariales donde la fidelidad al contexto recuperado es un requisito de producto.

La relevancia del modelo radica en su tamano: al ser una variante de 3B cuantizada a Q4_K_M y con licencia Llama 3.2, es desplegable en hardware de consumo y en entornos on-premise, algo poco habitual en la categoria de modelos guardarraíl de deteccion de alucinaciones, tradicionalmente dominada por modelos de 7B-8B o por APIs propietarias. No obstante, el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y su unico dato de rendimiento publicado es el F2 declarado por el propio autor (0,6018 en dev reservado; 0,6719 proyectado), sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador denso (heredada de meta-llama/Llama-3.2-3B-Instruct) |
| Parametros totales | 3.212.749.888 (recuento de parametros safetensors reportado por HuggingFace) |
| Longitud de contexto | 2.048 tokens declarados en la model card para esta adaptacion; el modelo base soporta hasta 128.000 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (unica cuantizacion documentada); al derivar de Llama 3.2 3B son tecnicamente posibles otras cuantizaciones GGUF, no publicadas por el autor |
| Idiomas soportados | no disponible (no declarados en la model card; el modelo base Llama 3.2 3B-Instruct soporta 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (etiqueta del repositorio: gguf); la model card indica fusion de LoRA y cuantizacion a GGUF Q4_K_M |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Tamano del repositorio | 2,0 GB |
| Tarea declarada | guard / deteccion de alucinaciones (hallucination-detection) |
| Etiquetas adicionales | microtensor, endpoints_compatible, conversational, region:us |
| Estado de publicacion | creado el 2026-09-13, actualizado el 2026-09-13; 0 descargas y 0 likes |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Llama 3.2 3B Instruct: un transformer decodificador denso con normalizacion RMSNorm pre-normalizacion, activacion SwiGLU, embeddings RoPE y atencion con consultas agrupadas (GQA), con un vocabulario de 128.256 entradas. Sobre esa base, el autor aplico un ajuste fino con LoRA y posteriormente fusiono los adaptadores en los pesos base, un flujo estandar que no introduce cambios estructurales en el modelo.

El entrenamiento se realizo exclusivamente sobre RAGTruth, un corpus de anotaciones a nivel de palabra de alucinaciones en respuestas generadas por sistemas RAG en tareas de respuesta a preguntas, resumen y generacion de texto a partir de datos. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas adicionales de RLHF o DPO; el unico proceso documentado es el ajuste supervisado con LoRA seguido de fusion y cuantizacion. La innovacion tecnica declarada no es arquitectonica sino de eficiencia: conseguir un guardarraíl de deteccion de alucinaciones funcional en un paquete de 3B parametros cuantizado a 4 bits, con un presupuesto de entrada restringido a 2.048 tokens.

## Capacidades

- Deteccion de alucinaciones en salidas RAG: el modelo esta entrenado para identificar fragmentos no sustentados por el contexto recuperado, la tarea objetivo declarada en las etiquetas del repositorio.
- Formato conversacional: la etiqueta conversational indica que se invoca mediante plantilla de chat, heredada de Llama 3.2 3B Instruct.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere despliegue directo en HuggingFace Inference Endpoints, siempre que el runtime admita GGUF.
- Uso como guardarraíl en pipelines: puede insertarse como etapa de verificacion entre la generacion del LLM principal y la entrega al usuario.
- Generacion de texto general: al derivar de un modelo instruct de 3B mantiene capacidades basicas de generacion y respuesta a instrucciones, aunque no son el objetivo del ajuste.
- Capacidades multilingues: no disponibles a nivel declarativo; las del modelo base (8 idiomas) podrian haberse degradado o conservado parcialmente tras el ajuste sobre RAGTruth, mayoritariamente en ingles.
- Razonamiento multi-paso y tool calling: no documentados en la model card.
- Vision y audio: no soportados (el modelo base es exclusivamente de texto).

## Casos de uso

- Filtrado de respuestas RAG en produccion: el modelo se coloca como etapa posterior al generador y antes de la entrega al usuario final, marcando las respuestas cuyo contenido no se sustenta en los documentos recuperados. Su tamano de 3B en Q4 permite ejecutarlo en la misma maquina que el generador sin duplicar el coste de GPU.
- Evaluacion offline de pipelines RAG: sirve como metrica automatica de fidelidad en conjuntos de validacion, sustituyendo o complementando la revision humana en iteraciones de chunking, embeddings y re-ranking, con un coste por evaluacion muy inferior al de un modelo de 70B.
- Guardarraíl en agentes multi-paso: en un agente que encadena busquedas y sintesis, el modelo puede verificar cada respuesta intermedia frente a las fuentes recuperadas antes de que el agente continue, evitando la propagacion de errores a pasos posteriores.
- Telemetria y monitorizacion de alucinaciones: integrado en el sistema de observabilidad, permite calcular tasas de alucinacion por version de prompt, por fuente documental o por tipo de consulta, generando alertas cuando la tasa supera un umbral.
- Pre-anotacion en pipelines de etiquetado humano: al actuar como primer filtro, reduce el volumen de texto que los anotadores deben revisar, ya que solo los fragmentos marcados como sospechosos requieren verificacion manual.
- Verificacion en generacion de texto a partir de datos y resumen automatico: RAGTruth cubre ambas tareas, por lo que el modelo es aplicable a la validacion de informes financieros, resumenes de documentacion tecnica o actas generadas automaticamente.
- Despliegue on-premise en entornos regulados: con 2,0 GB de pesos en Q4_K_M, puede ejecutarse en una estacion de trabajo sin GPU dedicada o con una GPU de gama media, lo que facilita su adopcion en banca, sanidad o administracion publica donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Conjunto | Notas |
|---|---|---|---|---|
| Deteccion de alucinaciones (autor) | F2 | 0,6018 | dev reservado (held-out) | Dato declarado por el autor en la model card |
| Mezcla evaluada del arena mt-4g | F2 proyectado | 0,6719 | scored mix del arena | Proyeccion del autor, no una medicion independiente |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los dos valores anteriores. No hay datos de MMLU, HumanEval, GSM8K ni de comparativas publicas frente a otros modelos guard.

## Requisitos de hardware

- VRAM estimada en Q4_K_M: aproximadamente 2,5-3,0 GB en total (2,0 GB de pesos mas cache KV y overhead del runtime).
- VRAM estimada en FP16: aproximadamente 6,4 GB solo de pesos, mas cache KV, lo que eleva el requisito practico a 8-10 GB.
- VRAM estimada en Q8_0: aproximadamente 3,4 GB de pesos.
- GPU de consumo: cabe sin dificultad en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 y en iGPU con memoria unificada como las series Apple M1/M2/M3 con 8 GB o mas.
- GPU profesional: A100, H100 y L40S son sobredimensionadas para este modelo y solo tendrian sentido para servir muchas replicas concurrentes.
- CPU: la inferencia en CPU es viable en Q4_K_M gracias al tamano, con velocidades de decodificacion que dependen del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y text-generation-webui son las rutas naturales al publicarse en GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan reconvertir los pesos a safetensors.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mt-guard-4g-v5 | 3,21 B | 2.048 tokens declarados (128.000 en el modelo base) | Deteccion de alucinaciones en RAG | Llama 3.2 Community License | GGUF Q4_K_M en HuggingFace, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Modelo instruct de proposito general | Llama 3.2 Community License | Pesos safetensors, ampliamente desplegado; no es un guard especializado |
| Llama Guard 3 (variantes 1B y 8B) | 1 B / 8 B | no verificado en la informacion disponible | Moderacion de contenido (seguridad), no especificamente alucinacion | Llama 3 Community License | Pesos publicos de Meta; linea de referencia en guardarraíles |
| IBM Granite Guardian (variantes 2B y 8B) | 2 B / 8 B | no verificado en la informacion disponible | Guardarraíl de riesgo, incluye deteccion de alucinaciones | Apache 2.0 | Pesos publicos de IBM; alternativa con licencia permisiva |

La comparacion directa de rendimiento no es posible porque los benchmarks publicados de los modelos alternativos usan conjuntos y metricas distintos a los de mt-guard-4g-v5. El dato diferencial de este modelo es el tamano reducido en Q4_K_M, no un rendimiento superior demostrado.

## Limitaciones y advertencias

- Sin validacion independiente: los unicos resultados son los declarados por el autor en la model card, con 0 descargas y 0 likes, por lo que no existe evidencia externa de reproducibilidad.
- Discrepancia de version en la model card: el README se titula "mt-guard-4g v4" mientras que el repositorio se llama "mt-guard-4g-v5", lo que genera dudas sobre que artefacto corresponde a los resultados declarados.
- Contexto limitado a 2.048 tokens: aunque el modelo base soporta 128.000 tokens, la adaptacion declara una entrada de 2.048 tokens, lo que restringe el uso a fragmentos de contexto cortos y obliga a trocear documentos largos.
- Formato de salida no documentado: la model card no especifica si el modelo devuelve una etiqueta binaria, un score, un span de texto o una respuesta en lenguaje natural, lo que dificulta su integracion sin pruebas empíricas previas.
- Sesgo del corpus de entrenamiento: RAGTruth esta mayoritariamente en ingles y cubre respuesta a preguntas, resumen y texto a partir de datos; el rendimiento fuera de esos dominios e idiomas es desconocido.
- Riesgo de falsos negativos y falsos positivos: un F2 de 0,6018 implica una tasa de error considerable; usado como filtro bloqueante puede descartar respuestas correctas, y usado como unico control puede dejar pasar alucinaciones.
- Riesgo de alucinacion del propio guard: al ser un modelo generativo y no un clasificador discriminativo dedicado, puede producir salidas malformadas o inconsistentes.
- Uso comercial condicionado: la Llama 3.2 Community License permite uso comercial con obligaciones, entre ellas mostrar "Built with Llama" y, segun los terminos de la familia, incluir "Llama" al inicio del nombre de los modelos derivados. El nombre "mt-guard-4g-v5" no sigue ese patron, por lo que conviene revisar el cumplimiento antes de un despliegue comercial.
- Acceso al modelo base restringido: Llama 3.2 3B Instruct esta sujeto a aceptacion de terminos en HuggingFace, lo que puede afectar a la redistribucion.
- Duplicidad de formato no aclarada: HuggingFace reporta un recuento de parametros safetensors mientras la model card indica que los pesos publicados estan en GGUF Q4_K_M; conviene verificar la lista real de ficheros del repositorio antes de integrarlo.
- Sin informacion sobre cuantizaciones alternativas, versiones de contexto extendido, soporte de tool calling ni mantenimiento posterior a la publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tang-yin-112/mt-guard-4g-v5
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset RAGTruth: mencionado en la model card como corpus de entrenamiento; no se incluye enlace en la informacion proporcionada (no disponible)
- Paper del arena "Microtensor guard / mt-4g": no disponible
- Repositorio o demo del autor: no disponible
- Resultados de la busqueda web: no se han recuperado enlaces relevantes para este modelo. Las coincidencias obtenidas corresponden a entidades homonimas sin relacion alguna (Tang Freres, dinastia Tang, la marca de bebidas Tang), por lo que se descartan como fuentes.

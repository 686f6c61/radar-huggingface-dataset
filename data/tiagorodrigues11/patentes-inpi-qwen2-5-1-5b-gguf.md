# TiagoRodrigues11/patentes-inpi-qwen2.5-1.5b-gguf

## Resumen

El modelo `TiagoRodrigues11/patentes-inpi-qwen2.5-1.5b-gguf` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por TiagoRodrigues11, orientado a responder preguntas sobre patentes en Brasil dentro del marco del INPI (Instituto Nacional da Propiedade Industrial). El modelo no se entrena para memorizar conocimiento legal, sino para redactar respuestas fundamentadas exclusivamente en los fragmentos oficiales que recibe como contexto, citando la fuente en formato (AUTOR, año).

Tecnicamente es un transformer decoder-only de 1.543.714.304 parámetros, adaptado mediante LoRA y exportado a formato GGUF en 8 bits para su ejecucion en CPU con llama.cpp. Se integra en un pipeline RAG (retrieval-augmented generation) donde la recuperacion de pasajes se realiza con BM25 sobre la Ley de Patentes 9.279/1996, manuales del INPI, directrices de examen y estudios publicos.

Su relevancia radica en demostrar que un modelo compacto de 1.5B, con un ajuste LoRA y cuantizacion de 8 bits, puede mejorar de forma medible la fidelidad de las respuestas y la citacion correcta de fuentes frente al modelo base, manteniendo la ejecucion en hardware de consumo. Es una demo de investigacion y no constituye asesoramiento legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), con ajuste LoRA |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no indicada en la ficha; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | GGUF 8 bits (unica cuantizacion publicada en el repo) |
| Idiomas soportados | portugues (pt) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA fusionado y cuantizado) |

## Arquitectura y entrenamiento

La base es Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion de consultas agrupadas (GQA), embeddings rotatorios (RoPE), normalizacion RMSNorm y activacion SwiGLU. Sobre ese modelo se aplica un ajuste fino con LoRA, cuyo resultado se fusiona y se exporta a GGUF en 8 bits para permitir inferencia en CPU mediante llama.cpp. El formato de prompt emplea la plantilla de chat del modelo base, un system prompt que exige respuestas fundamentadas en los pasajes y citas con formato (AUTOR, año), y un turno de usuario con la estructura `Trechos oficiais:\n[1] (citation) text ...\n\nPergunta: ...`, acompanado de los tres pasajes mas relevantes de 150 palabras cada uno.

Los datos de entrenamiento son exclusivamente textos reales y publicos del INPI y del ambito legal brasileño; el autor indica explicitamente que no se emplearon datos sinteticos. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO. La recuperacion de contexto en inferencia se hace con BM25, por lo que el modelo no incorpora un retriever propio.

## Capacidades

- Generacion de texto conversacional en portugues, con respuestas extractivas fundamentadas en los pasajes proporcionados.
- Citacion de fuentes en formato (AUTOR, año) cuando la respuesta se apoya en los fragmentos recibidos.
- Razonamiento sobre normativa de patentes brasileña: preguntas sobre la Ley 9.279/1996, manuales y directrices de examen del INPI.
- Clasificacion de solicitudes segun la Clasificacion Internacional de Patentes (IPC), con una exactitud del 55,8% en el conjunto de prueba declarado.
- Integracion en pipelines RAG: el modelo esta diseñado para consumir contexto recuperado externamente (BM25) en lugar de responder de memoria.
- Capacidad conversacional multi-turno heredada del modelo base (etiqueta `conversational`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito ("thinking mode"): no disponible.

## Casos de uso

- Consulta normativa interna para despachos de propiedad industrial: el modelo recibe los pasajes relevantes de la Ley 9.279/1996 y responde con la cita correspondiente, reduciendo el tiempo de busqueda manual en texto legal.
- Pre-clasificacion de solicitudes de patente por codigo IPC: dado el texto de una solicitud, el sistema propone un codigo IPC que el examinador revisa despues, con una exactitud declarada del 55,8%.
- Asistente de autoservicio para inventores y pequenas empresas: responde en portugues a dudas frecuentes sobre plazos, requisitos y tramites, siempre citando el manual o directriz de origen.
- Generacion de borradores de respuestas tecnicas en procesos administrativos: partiendo de los fragmentos oficiales aplicables, produce un borrador que el profesional juridico edita y valida.
- Formacion interna de examinadores y agentes: entorno de practica donde el modelo plantea respuestas fundamentadas y el usuario comprueba la correccion de la cita.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con llama.cpp y ocupar alrededor de 1,6 GB en GGUF de 8 bits, es viable en portatiles sin GPU dedicada.
- Investigacion sobre fidelidad en RAG legal: sirve como caso de estudio replicable para medir atribucion de fuentes y grounding en dominios juridicos con modelos pequenos.
- Filtrado y resumen de documentacion tecnica de patentes: sintetiza pasajes largos sobre un aspecto concreto (novedad, actividad inventiva) manteniendo la referencia documental.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de prueba reservado: 52 preguntas con RAG y 104 solicitudes reales para la tarea de IPC.

| Modelo | ROUGE-L | Token F1 | Cita la fuente correcta | Palabras ancladas en pasajes | Exactitud IPC |
|---|---|---|---|---|---|
| base (Qwen2.5-1.5B-Instruct) | 0,288 | 0,390 | 21% | 62% | 38,5% |
| fine-tuned (LoRA) | 0,441 | 0,515 | 73% | 92% | 55,8% |
| sin LLM: pasaje top de BM25 | 0,357 | 0,436 | 75% | 100% | 53,8% (TF-IDF) |

Advertencia del propio autor: el conjunto de prueba es pequeno y diferencias de pocos puntos no son concluyentes. ROUGE-L y F1 favorecen respuestas extractivas y no miden correccion juridica. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6-1,7 GB con GGUF de 8 bits; en torno a 1,0-1,2 GB con cuantizaciones Q4_K_M; cerca de 3,1 GB en FP16.
- El autor indica que el modelo se ejecuta en CPU con llama.cpp, por lo que no requiere GPU.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o mas de VRAM para la version de 8 bits.
- GPU profesionales (A100, H100) sobredimensionadas para este tamano; utiles solo para servir muchas replicas concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM y TGI. El repo incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada (dependen del hardware y del backend de cuantizacion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| patentes-inpi-qwen2.5-1.5b-gguf | 1,54B | no indicado (base: 32.768) | apache-2.0 | HF (GGUF) | Ajuste LoRA especializado en patentes BR; 73% de citas correctas en prueba propia |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 | apache-2.0 | HF | Modelo generalista; 21% de citas correctas en la misma prueba |
| Llama 3.2 1B Instruct | 1,24B | no disponible en esta ficha | llama 3.2 community license | Meta / HF | Alternativa generalista de tamano similar; no evaluada en la tarea de patentes |
| Gemma 2 2B Instruct | 2,6B | no disponible en esta ficha | Gemma terms | Google / HF | Alternativa generalista ligeramente mayor; no evaluada en la tarea |

No se dispone de datos de benchmark comparativos entre estos modelos para la tarea concreta de patentes del INPI en la informacion proporcionada; la unica comparacion disponible es la del autor frente al modelo base. Cualquier otro modelo comparable queda como "no disponible".

## Limitaciones y advertencias

- El autor advierte que el modelo ofrece orientacion general basada en documentos publicos y no constituye asesoramiento legal.
- El conjunto de evaluacion es pequeno (52 preguntas); las diferencias de pocos puntos no son estadisticamente concluyentes.
- ROUGE-L y F1 favorecen respuestas extractivas y no miden correccion juridica real.
- Riesgo de alucinacion: aunque el diseno fuerza el anclaje en pasajes, un 8% de palabras no quedaron ancladas en los fragmentos y el 27% de las citas fueron incorrectas en la prueba declarada.
- El modelo esta entrenado y evaluado unicamente en portugues; no se garantiza calidad en otros idiomas.
- Depende criticamente de la calidad del recuperador BM25: si el contexto relevante no se recupera, la respuesta pierde fundamento.
- La clasificacion IPC se limita a una exactitud del 55,8%, insuficiente para uso autonomo sin revision humana.
- Licencia apache-2.0, que permite uso comercial segun los terminos de dicha licencia; el modelo base Qwen2.5 tambien es apache-2.0.
- Solo se publica GGUF de 8 bits; no hay versiones en safetensors ni cuantizaciones alternativas en el repositorio.
- El repositorio presenta 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TiagoRodrigues11/patentes-inpi-qwen2.5-1.5b-gguf
- Pagina de portafolio con resultados y respuestas registradas: https://tiagorodrigues-gith.github.io/tiago-rodrigues-portfolio/projects/compact-llm/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- No se han encontrado enlaces adicionales relevantes (paper, repositorio de codigo o demo) en la busqueda web realizada.

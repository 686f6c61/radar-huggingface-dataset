# sumeyragurlek/Mavi-1.5B

## Resumen

Mavi-1.5B es un ajuste fino (fine-tune) en turco del modelo Qwen2.5-1.5B-Instruct, publicado por la usuaria de HuggingFace sumeyragurlek. Se presenta como un asistente ciudadano para el ayuntamiento ficticio de Martıkent: la identidad y el estilo se incorporan mediante ajuste fino supervisado, la normativa municipal se resuelve con RAG y los datos de instalaciones y trámites se obtienen mediante herramientas (tool calling). Es, por tanto, un ejemplo completo de pipeline "identidad + RAG + agente" sobre un modelo pequeño.

El modelo tiene 1.543.714.304 parametros (1,54 mil millones) en una arquitectura transformer decoder-only de la familia Qwen2, con pesos en safetensors y un repositorio de 3,1 GB. El entrenamiento se hizo con QLoRA (r=16, alpha=32, todas las capas lineales, 3 epochs, learning rate 2e-4) sobre 419 conversaciones sinteticas generadas con Gemini, y se distribuyen tambien el adaptador LoRA y una conversion a GGUF.

Su relevancia es doble: por un lado demuestra que con un presupuesto minimo (una T4 de Colab) se puede especializar un modelo de 1,5B para un dominio concreto; por otro, la propia model card documenta con honestidad que la mejora es desigual: las metricas de agente suben a 1,00, pero la calidad de las respuestas RAG solo pasa de 0,47 a 0,53 y la evaluacion con juez Gemini de 13 preguntas se queda en 0,46 de media. Es un caso de estudio util, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1,54 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; se hereda la del modelo base Qwen2.5-1.5B-Instruct, no verificada en la informacion proporcionada |
| Tipos de cuantizacion | GGUF en repositorio aparte (sumeyragurlek/Mavi-1.5B-GGUF); no se detallan los niveles concretos (Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | Turco (tr) como idioma declarado y entrenado; el modelo base es multilingue pero no se documenta el rendimiento en otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado), adaptador LoRA (PEFT) en repositorio aparte, y GGUF |

## Arquitectura y entrenamiento

La base es Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1,54 mil millones de parametros con plantilla de chat ya preparada y tamano suficiente para ajuste fino en una GPU T4 de Colab, tal como indica el autor. Sobre esa base se aplico QLoRA con r=16, alpha=32, adaptadores en todas las capas lineales, 3 epochs y learning rate 2e-4, y posteriormente se fusionaron los pesos para publicar el modelo completo en safetensors.

Los datos de entrenamiento son 419 conversaciones sinteticas generadas con Gemini y publicadas en el dataset sumeyragurlek/mavi-1.5b-veri, organizadas en tres bloques: identidad (nombre, marcador de estilo), RAG (preguntas sobre la normativa del ayuntamiento ficticio) y agente (emision de JSON y seleccion de herramienta). No se documenta el numero total de tokens, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; el procedimiento descrito es exclusivamente ajuste supervisado con QLoRA. La innovacion tecnica destacable no es arquitectonica, sino de proceso: un ciclo completo y reproducible de identidad + RAG + tool calling sobre hardware de consumo, con evaluacion antes/despues sobre un test set propio y un juez automatico (Gemini) con escala 1 / 0,5 / 0.

## Capacidades

- Generacion de texto conversacional en turco, con un estilo e identidad concretos (asistente del ayuntamiento de Martıkent) aprendidos por ajuste fino.
- Respuesta sobre normativa municipal apoyada en contexto recuperado (RAG): tasas de impuestos, plazos, horarios y requisitos de tramites.
- Emision de JSON estructurado para invocacion de herramientas: la metrica ajan_json pasa de 0,82 en el modelo base a 1,00 en Mavi.
- Seleccion de la herramienta correcta en un flujo de agente: la metrica ajan_arac pasa de 0,18 a 1,00.
- Consulta de informacion de instalaciones municipales (polideportivos, centros culturales, piscinas, pistas de tenis) a traves de esas herramientas.
- Conversacion multi-turno: hereda la plantilla de chat y el comportamiento conversacional de Qwen2.5-1.5B-Instruct.
- Marcadores de identidad y de recuperacion: el modelo aprende a insertar un marcador Unicode al final de cada respuesta (metrica kimlik_isaret de 0,00 a 0,90 y rag_isaret de 0,00 a 1,00), util para trazabilidad en demos.
- No se documentan capacidades de vision, audio, modo "thinking" explicito ni un rendimiento destacado en codigo o matematicas.

## Casos de uso

- Atencion ciudadana de primer nivel en turco: el modelo gestiona la conversacion, decide si necesita consultar la normativa (RAG) o llamar a una herramienta de consulta de instalaciones, y responde con el tono institucional aprendido. Adecuado para prototipos de ventanilla unica o de chatbot web municipal.
- Enrutado de intenciones y function calling en back-office: con ajan_json y ajan_arac en 1,00 sobre el test set propio, sirve como clasificador que transforma lenguaje natural en una llamada a API (consultar tasa, reservar cita, abrir incidencia) antes de derivar a un sistema mayor.
- Extraccion de parametros para tramites: dado un texto libre del ciudadano, el modelo emite el JSON con los campos necesarios (tipo de tramite, fecha, distrito) que alimenta un formulario o un RPA.
- Base de un asistente de FAQ sobre normativa: conectado a un indice vectorial de ordenanzas y tarifas, responde preguntas recurrentes; su tamano permite desplegarlo on-premise sin salida a la nube, algo relevante para administraciones con requisitos de soberania del dato.
- Prototipado rapido en recursos limitados: al caber en una T4 o en una GPU de consumo y estar disponible en GGUF, permite validar un producto conversacional completo (identidad + RAG + tools) en horas y en un portatil.
- Material docente y de evaluacion: es un ejemplo reproducible de QLoRA con dataset sintetico, metricas antes/despues y juez automatico, util para formar equipos en pipelines de especializacion de modelos pequenos.
- Generacion de respuestas con trazabilidad: el marcador de identidad y el de recuperacion permiten verificar en logs si la respuesta se apoyo en el contexto RAG o se genero libremente, lo que facilita la auditoria en demos y pruebas A/B.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test set propio (antes: Qwen2.5-1.5B-Instruct; despues: Mavi-1.5B):

| Metrica | Base | Mavi-1.5B |
|---|---|---|
| kimlik_ad (nombre de identidad) | 0,00 | 0,40 |
| kimlik_isaret (marcador de identidad) | 0,00 | 0,90 |
| ajan_json (JSON de agente valido) | 0,82 | 1,00 |
| ajan_arac (herramienta correcta) | 0,18 | 1,00 |
| rag_hakem (calidad RAG segun juez) | 0,47 | 0,53 |
| rag_isaret (marcador de recuperacion) | 0,00 | 1,00 |

Perdida de test: 0,613 antes del ajuste, 0,346 despues de 3 epochs.

Evaluacion cualitativa: 13 preguntas puntuadas por Gemini con escala 1 / 0,5 / 0, con una media de 0,46. Muestra representativa:

| Pregunta (traducida del turco) | Puntuacion | Observacion |
|---|---|---|
| Plazo del primer pago del impuesto inmobiliario | 1,0 | Respuesta correcta y concisa |
| Precio de la ceremonia de boda en sabado | 1,0 | Distingue tarifa de fin de semana |
| Maximo diario en el parking municipal | 0,5 | Dato parcialmente correcto |
| Licencia para abrir una cafeteria | 0,0 | Responde con informacion irrelevante sobre aparcamiento para discapacitados |
| Cuando se abrira la linea de metro | 0,0 | No reconoce el limite y anade informacion no solicitada |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamano, no publicadas por el autor): en FP16, unos 3,1 GB de pesos mas cache KV y overhead, en torno a 4-5 GB; en cuantizacion de 8 bits, 2,5-3 GB; en 4 bits (GGUF), aproximadamente 2 GB.
- GPU recomendadas: T4 (16 GB), RTX 3060/4060, RTX 4090, A100 o H100 para servir varias instancias. El propio autor documenta que el ajuste fino QLoRA se hizo en una T4 de Colab, lo que da una idea del perfil de recursos.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con 6 GB o mas en cuantizacion de 4 bits; en FP16 basta con 8 GB.
- Opciones de despliegue: Transformers (modelo fusionado o adaptador PEFT), llama.cpp y Ollama con los GGUF publicados, vLLM o TGI para servido con concurrencia. Para el adaptador, basta cargar la base Qwen2.5-1.5B-Instruct y aplicar el LoRA.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mavi-1.5B | 1,54 mil millones | No disponible | Fine-tune en turco para RAG y agente municipal | Apache-2.0 | safetensors + LoRA + GGUF; 0 descargas, 1 like en el momento de la consulta |
| Qwen2.5-1.5B-Instruct (base) | 1,54 mil millones | No disponible en la informacion | Modelo generalista de proposito general, multilingue | Apache-2.0 | Ampliamente distribuido; es el punto de partida de este fine-tune |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 mil millones (segun el nombre del repositorio) | No disponible | Destilado orientado a razonamiento | No verificada en la informacion | Repositorio publico en HuggingFace; datos tecnicos no consultados |
| VibeThinker-1.5B | 1,5 mil millones (segun el nombre del repositorio) | No disponible | Orientado a razonamiento | No verificada en la informacion | Repositorio publico en HuggingFace; datos tecnicos no consultados |

Los dos ultimos solo aparecen como resultado de busqueda; no se dispone de sus especificaciones en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- El modelo solo declara y solo se ha entrenado en turco; no hay garantia de comportamiento en castellano ni en otros idiomas.
- El ajuste fino se hizo con 419 conversaciones sinteticas durante 3 epochs, un volumen muy reducido: el riesgo de sobreajuste al estilo y a las plantillas del dataset es alto.
- La calidad RAG es el punto debil: el juez automatico solo mejora de 0,47 a 0,53. Aunque el sistema recupere el pasaje correcto, el modelo puede no incorporarlo a la respuesta, tal como reconoce el autor.
- Riesgo de alucinacion y de deriva tematica confirmado en la evaluacion: en varias preguntas responde con informacion no solicitada (por ejemplo, aparcamiento para discapacitados ante una pregunta sobre licencias de cafeteria).
- La identidad apenas se consolida: la metrica de nombre de identidad se queda en 0,40, de modo que el modelo puede no identificarse correctamente como asistente del ayuntamiento.
- Las herramientas pueden devolver o seleccionar el campo equivocado en produccion; ajan_arac alcanza 1,00 solo en el test set propio, no en un conjunto externo.
- Todo el contenido municipal es ficticio (Martıkent): el modelo no es un servicio oficial de ningun ayuntamiento y no debe presentarse como tal.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero se hereda tambien la del modelo base; no hay garantia ni soporte por parte del autor.
- Proyecto de bootcamp con 0 descargas y 1 like, sin demo publicada: no hay evidencia de mantenimiento ni de uso en produccion.
- No se han publicado mediciones de latencia, throughput ni de robustez frente a prompt injection, algo critico en un asistente con acceso a herramientas.

## Enlaces

- Modelo fusionado en HuggingFace: https://huggingface.co/sumeyragurlek/Mavi-1.5B
- Adaptador LoRA: https://huggingface.co/sumeyragurlek/Mavi-1.5B-LoRA
- Version GGUF: https://huggingface.co/sumeyragurlek/Mavi-1.5B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/sumeyragurlek/mavi-1.5b-veri
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Comparable de razonamiento (solo referencia): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Comparable de razonamiento (solo referencia): https://huggingface.co/WeiboAI/VibeThinker-1.5B
- Demo en vivo: no publicada segun la model card

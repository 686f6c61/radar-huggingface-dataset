# wiklif/Bielik-Minitron-7B-RAG

## Resumen

Bielik-Minitron-7B-RAG es un ajuste fino (fine-tune) del modelo instructivo polaco speakleash/Bielik-Minitron-7B-v3.0-Instruct, desarrollado por el usuario independiente wiklif. Está especializado en una única tarea: responder preguntas en polaco a partir de fragmentos de documentos proporcionados por un recuperador (retriever) en un sistema RAG, citando las fuentes con el formato `[ID:n]` y rechazando explícitamente responder cuando la respuesta no está en los documentos. Forma parte del sistema RAG de código abierto Wawelsky Dragon y se ha evaluado dentro de él.

El modelo tiene 7.477.727.232 parámetros (aproximadamente 7,5 mil millones) y se distribuye en bf16 con pesos fusionados (14 GB) y también como adaptador LoRA de rango 16 (178 MB). Su relevancia radica en que alcanza un 79,4% de respuestas correctas en un conjunto de 462 preguntas sobre documentos polacos, un rendimiento comparable estadísticamente a gpt-4.1-mini (81,0%) y Qwen3.5-9B (77,7%), y significativamente superior a su modelo base (67,1%), a Bielik-11B-v3.1-Instruct (73,4%) y a Gemma 4 E4B (68,8%). Todo el procesamiento es local, sin que los documentos salgan del servidor.

Se trata de un fine-tune comunitario independiente, no una versión oficial de SpeakLeash ni respaldado por dicha organización. Está pensado para despliegues on-premise en los que la confidencialidad documental es crítica, y su principal limitación es que está ajustado a un formato de prompt muy concreto: con otra estructura se comporta como el modelo base o peor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama, según la etiqueta `llama` del repositorio) |
| Parametros totales | 7.477.727.232 (aproximadamente 7,5 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; adaptador LoRA en el directorio `adapter/`) |
| Idiomas soportados | polaco (`pl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado en 4 archivos, bf16) y adaptador LoRA (rank 16) |

## Arquitectura y entrenamiento

El modelo parte de speakleash/Bielik-Minitron-7B-v3.0-Instruct, un transformer de aproximadamente 7,5 mil millones de parámetros etiquetado como `llama` en el repositorio. Sobre esa base se aplicó un ajuste fino con LoRA de rango 16, cuyos pesos se han fusionado en la versión principal publicada en bf16. El adaptador LoRA también se distribuye por separado para poder cargarse sobre el modelo base, por ejemplo en vLLM mediante `--lora-modules`.

El entrenamiento se realizó con el conjunto de datos wiklif/wawelsky-dragon-rag-pl, orientado a la tarea de responder preguntas a partir de fragmentos documentales con citas y rechazo explícito cuando falta la respuesta. El modelo está diseñado para un formato de prompt específico compuesto por dos mensajes: un mensaje de sistema en polaco que contiene la base de conocimiento (fragmentos con `ID`, `Title` y `Content`, con tablas en HTML) y las reglas de respuesta, y un mensaje de usuario con la pregunta. No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto y respuesta a preguntas en polaco basada exclusivamente en el contexto documental proporcionado.
- Citación de fuentes mediante el formato `[ID:n]`, vinculando cada afirmación con el fragmento de documento correspondiente.
- Rechazo explícito cuando la respuesta no se encuentra en los documentos aportados (comportamiento evaluado como respuesta correcta en las preguntas sin respuesta).
- Procesamiento de documentos heterogéneos: anuarios estadísticos y tablas en PDF, escaneos, hojas de cálculo, informes, sentencias judiciales, documentos en inglés y prosa.
- Manejo de tablas representadas en HTML dentro del contexto (`<table><thead>…</thead><tbody>…</tbody></table>`).
- Integración en pipelines RAG con recuperación previa de fragmentos (evaluado con el recuperador PolDense-400M y 10 fragmentos por consulta).
- Despliegue on-premise con procesamiento local de los documentos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo responde en un único paso a partir del contexto).
- Capacidades multimodales (visión, audio): no disponible.
- Modo de razonamiento (thinking mode): no disponible.

## Casos de uso

- Atención al cliente sobre documentación interna: el modelo responde consultas de usuarios basándose en manuales, políticas o FAQ internas recuperadas por un retriever, citando el fragmento exacto con `[ID:n]` para que el agente humano pueda verificar la respuesta.
- Asistencia legal y administrativa: dado su rendimiento en actos legales y sentencias judiciales (47/56 respuestas correctas en el conjunto fresh y control, igual que gpt-4.1-mini), puede emplearse para consultar normativa y jurisprudencia interna con trazabilidad de fuentes.
- Análisis de informes financieros y estadísticos: con resultados de 29/35 en informes del Banco Nacional de Polonia y 47/78 en anuarios de Statistics Poland, es adecuado para extraer datos de tablas y series estadísticas en formato PDF o HTML.
- Cumplimiento normativo con datos sensibles: al ejecutarse completamente en local (14 GB en bf16), permite desplegar un asistente documental en sectores regulados sin que los documentos abandonen la infraestructura de la organización.
- Búsqueda documental con rechazo controlado: en escenarios donde responder sin base documental es un riesgo, el modelo devuelve una negativa explícita cuando la respuesta no está en el contexto, lo que reduce respuestas inventadas en comparación con modelos generalistas.
- Despliegue en infraestructura propia con vLLM: el adaptador LoRA (178 MB) puede cargarse junto al modelo base mediante `--lora-modules`, permitiendo servir varias variantes especializadas sobre una misma instancia y ahorrar memoria.
- Procesamiento de documentación multiformato: útil en organismos públicos o empresas que mezclan PDFs escaneados, hojas de cálculo y documentos de texto, ya que el modelo ha sido evaluado sobre ocho formatos de archivo distintos.

## Benchmarks y rendimiento

Las mediciones se realizaron sobre el sistema RAG completo (recuperador PolDense-400M con 10 fragmentos, temperatura 0, un juez LLM: DeepSeek V4.1 Flash) con 462 preguntas sobre documentos polacos. Las preguntas, respuestas de referencia y respuestas de los modelos están en el dataset wiklif/wawelsky-dragon-rag-pl.

| Modelo | Total (462) | Conjunto principal (293) | Conjunto fresh (108) | Conjunto control (61) |
|---|---|---|---|---|
| gpt-4.1-mini (API) | 81,0% | 84,6% | 75,9% | 72,1% |
| **Bielik-Minitron-7B-RAG** | **79,4%** | **83,3%** | **74,1%** | **70,5%** |
| Qwen3.5-9B | 77,7% | 80,2% | 75,0% | 70,5% |
| Bielik-11B-v3.1-Instruct | 73,4% | 76,8% | 68,5% | 65,6% |
| Gemma 4 E4B | 68,8% | 70,6% | 65,7% | 65,6% |
| Bielik-Minitron-7B-v3.0-Instruct (base) | 67,1% | 70,0% | 62,0% | 62,3% |

Prueba de McNemar sobre respuestas emparejadas (preguntas a favor de este modelo : a favor del otro):

| Frente a | Resultado | p |
|---|---|---|
| gpt-4.1-mini | 18 : 25 | 0,36 |
| Qwen3.5-9B | 31 : 23 | 0,34 |
| Bielik-11B-v3.1-Instruct | 38 : 10 | < 0,001 |
| Gemma 4 E4B | 60 : 11 | < 0,001 |
| Modelo base (169 preguntas de fresh y control) | 24 : 6 | 0,001 |

Por dominio en los conjuntos fresh y control: actos legales 47/56 (gpt-4.1-mini 47/56), informes del Banco Nacional de Polonia 29/35 (29/35), anuarios de Statistics Poland 47/78 (50/78).

Verificación de la versión fusionada frente al adaptador: sobre las 293 preguntas del conjunto principal, la versión fusionada obtuvo 244 respuestas correctas frente a 243 del adaptador; 246 de las 293 respuestas fueron idénticas carácter a carácter, más que entre dos ejecuciones del propio adaptador (213).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15-16 GB para los pesos (14 GB de pesos más overhead de activaciones y caché KV); con cuantización a 8 bits se reduciría a unos 8 GB y a 4 bits a unos 4-5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16; en GPUs consumer de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) sería necesario cuantizar.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en bf16 y en GPUs de 16 GB con cuantización; el adaptador LoRA (178 MB) permite cargarlo sobre el modelo base en vLLM.
- Opciones de despliegue: vLLM (probado por el autor con `--lora-modules`), transformers con safetensors; llama.cpp, Ollama o TGI no están documentados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado RAG (total) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-Minitron-7B-RAG | 7,5 B | no disponible | 79,4% | Apache 2.0 | Hugging Face (pesos y LoRA) |
| Bielik-Minitron-7B-v3.0-Instruct (base) | 7,5 B | no disponible | 67,1% | no disponible en la información | Hugging Face |
| Bielik-11B-v3.1-Instruct | 11 B | no disponible | 73,4% | no disponible en la información | Hugging Face |
| Qwen3.5-9B | 9 B | no disponible | 77,7% | no disponible en la información | Hugging Face |
| Gemma 4 E4B | no disponible | no disponible | 68,8% | no disponible en la información | Hugging Face |
| gpt-4.1-mini | no disponible (API) | no disponible | 81,0% | propietaria | API de OpenAI |

La comparación se limita al rendimiento en la tarea RAG evaluada; no se dispone de datos de benchmarks generales (MMLU, HumanEval, GSM8K) para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del formato de prompt: el modelo está ajustado a un formato concreto de mensaje de sistema (conocimiento con `ID`, `Title` y `Content`, reglas en polaco) y mensaje de usuario. Con otra estructura se comporta como el modelo base o peor.
- Solo polaco: no se ha entrenado ni evaluado en otros idiomas, aunque el conjunto de prueba incluye un documento en inglés.
- Riesgo de alucinación: aunque el modelo está entrenado para rechazar cuando la respuesta no está en el contexto, es un modelo generativo y puede producir respuestas incorrectas o citas inexactas; el 79,4% de acierto implica aproximadamente una de cada cinco respuestas incorrecta.
- Evaluación con juez automático: las métricas provienen de un juez LLM (DeepSeek V4.1 Flash), no de evaluación humana, y de una sola ejecución por modelo.
- Sesgo de selección del conjunto principal: las sucesivas versiones del adaptador se seleccionaron sobre el conjunto principal (293 preguntas), por lo que es el menos imparcial; los conjuntos fresh y control son más representativos.
- Exclusión de preguntas en el conjunto fresh: 11 preguntas de tres actos legales se excluyeron tras detectar mediante sumas de comprobación SHA-256 que esos actos también estaban en el conjunto de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Bielik-Minitron-7B-v3.0-Instruct puede tener condiciones adicionales que deben verificarse antes de un despliegue comercial.
- Fine-tune comunitario independiente: no es una versión oficial de SpeakLeash ni está respaldado por dicha organización; el soporte y el mantenimiento dependen del autor.
- Sin datos publicados sobre longitud de contexto, cuantizaciones oficiales ni latencia, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wiklif/Bielik-Minitron-7B-RAG
- Modelo base: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct
- Dataset de evaluación: https://huggingface.co/datasets/wiklif/wawelsky-dragon-rag-pl
- Sistema RAG Wawelsky Dragon: https://github.com/lrozewicz/wawelsky-dragon
- Recuperador PolDense-400M: https://huggingface.co/OPI-PIB/PolDense-400M

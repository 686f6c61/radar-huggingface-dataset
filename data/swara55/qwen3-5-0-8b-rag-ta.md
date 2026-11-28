# Swara55/qwen3.5-0.8b-rag-ta

## Resumen

Swara55/qwen3.5-0.8b-rag-ta es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) orientado a tareas de generacion aumentada por recuperacion (RAG) en japones. Lo desarrolla el usuario Swara55 en el contexto del curso LLM講座2 2026 del laboratorio Matsuo-Iwasawa, como entrega para su competicion final. El modelo parte de un transformer denso de aproximadamente 873 millones de parametros y se especializa en responder preguntas de respuesta corta a partir de un contexto de cinco fragmentos recuperados.

La especializacion se consigue mediante un ajuste LoRA sobre el modelo base, cuyos deltas se integran posteriormente en los pesos mediante task arithmetic con un factor λ = 1.20 (W = W_base + 1.20 · ΔW). No se realizo ningun entrenamiento adicional tras esa fusion, por lo que la arquitectura resultante es identica a la del modelo base. El resultado es un modelo que devuelve la respuesta corta junto con el identificador del fragmento que la sustenta, en formato JSON.

Su relevancia es acotada pero clara: demuestra un flujo completo de especializacion de un modelo pequeno para una tarea concreta de RAG en japones, con datos de entrenamiento derivados de corpus publicos (JSQuAD, JEMHopQA, NIILC QA) y sin generacion sintetica por parte de otros modelos. Es util como referencia para quien quiera replicar pipelines de ajuste LoRA con fusion por task arithmetic en modelos de menos de mil millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-0.8B); no disponible el detalle interno exacto |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | Japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de unos 873 millones de parametros que hereda integramente la arquitectura del modelo base Qwen/Qwen3.5-0.8B. Sobre esa base se aplico un ajuste LoRA y, posteriormente, una fusion por task arithmetic con factor λ = 1.20, de modo que los pesos finales equivalen a W_base + 1.20 · ΔW. No hubo entrenamiento adicional despues de la fusion, por lo que no se introducen capas ni modulos nuevos.

Los datos de entrenamiento se componen de tres conjuntos, todos con contexto recuperado real de la coleccion de fragmentos distribuida (derivada de Wikipedia en japones, CC BY-SA 4.0) y sin generacion ni procesado por modelos externos. El primero son preguntas de un solo salto de JSQuAD (JGLUE), filtradas para conservar solo aquellas en las que el fragmento que contiene la respuesta aparece entre los cinco primeros resultados de recuperacion. El segundo son preguntas de dos saltos de JEMHopQA (corpus_ver1.2), donde las derivaciones (tripletas de justificacion) se formatean mecanicamente como frases en japones del tipo "○○ の △△ は □□。" como tarea auxiliar. El tercero son preguntas enciclopedicas de tipo unico del NIILC Question Answering Dataset, con una tarea auxiliar que asigna mecanicamente el tipo de respuesta (persona, tiempo, lugar, cantidad, cosa) a partir de los interrogativos de la pregunta. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Respuesta a preguntas extractivas en japones: dado un contexto de cinco fragmentos recuperados, devuelve una respuesta corta y el identificador del fragmento que la respalda.
- Salida estructurada en JSON con la respuesta y el chunk ID de justificacion.
- Razonamiento de dos saltos: entrenado con preguntas de JEMHopQA que requieren combinar informacion de varias derivaciones.
- Clasificacion implicita del tipo de respuesta (persona, tiempo, lugar, cantidad, cosa) como tarea auxiliar aprendida durante el ajuste.
- Manejo de preguntas enciclopedicas de tipo unico (NIILC QA).
- Capacidad multilingue limitada al japones segun la model card; no se declaran otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documenta un modo de pensamiento (thinking mode) propio.

## Casos de uso

- Atencion al cliente sobre base documental en japones: el modelo recibe los cinco fragmentos mas relevantes de un indice vectorial y devuelve la respuesta corta con el ID del fragmento, lo que permite citar la fuente y auditar la respuesta.
- Sistemas de preguntas y respuestas sobre Wikipedia japonesa: encaja directamente con el pipeline de recuperacion con el que fue entrenado (chunks de Wikipedia en japones), por lo que puede desplegarse sobre indices construidos con el mismo esquema.
- Verificacion de citas en asistentes documentales: al devolver el chunk ID de justificacion, permite construir interfaces que enlacen la respuesta a la fuente original y detectar respuestas sin respaldo.
- Preguntas multi-salto en dominios enciclopedicos: su entrenamiento con JEMHopQA lo hace adecuado para consultas que requieren combinar dos hechos (por ejemplo, relaciones entre entidades) antes de responder.
- Extraccion de respuestas tipadas en pipelines de datos: la tarea auxiliar de tipo de respuesta (persona, tiempo, lugar, cantidad, cosa) puede aprovecharse para poblar campos estructurados a partir de texto libre.
- Prototipado y evaluacion de pipelines RAG en entornos con recursos limitados: con menos de mil millones de parametros, puede ejecutarse en una sola GPU de consumo para comparar estrategias de recuperacion o de prompting sin coste elevado.
- Docencia y reproduccion de experimentos: sirve como ejemplo completo de ajuste LoRA con fusion por task arithmetic sobre un modelo pequeno, util para cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 1,8 GB para pesos, con margen adicional para contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,9 GB; en 4 bits, aproximadamente 0,5 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; A100, H100 o RTX 4090 sobran para esta carga y permiten batches grandes.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o superiores; en 4 bits cabria incluso en GPUs con 4-6 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se conviertan los pesos safetensors al formato correspondiente; el autor no documenta ninguna integracion especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swara55/qwen3.5-0.8b-rag-ta | 873 M | No disponible | RAG extractivo en japones (LoRA + task arithmetic) | CC BY-SA 4.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Modelo generalista | No disponible en la informacion | Hugging Face |
| Modelos RAG japoneses de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros y licencia.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en RAG con cinco fragmentos de contexto; su comportamiento fuera de ese formato no esta documentado y probablemente degrade.
- Solo declara soporte de japones; no hay evidencia de calidad en otros idiomas.
- La licencia CC BY-SA 4.0 impone compartir bajo la misma licencia las obras derivadas y exige atribucion; conviene revisar las obligaciones antes de un uso comercial.
- Los datos de entrenamiento derivan de JSQuAD, JEMHopQA y NIILC QA, todos CC BY-SA 4.0, lo que refuerza la obligacion de compartir al mismo nivel.
- Riesgo de alucinacion: aunque el modelo devuelve un chunk ID, no hay garantia de que la respuesta este efectivamente contenida en ese fragmento; se recomienda validacion posterior.
- El factor λ = 1.20 en la fusion por task arithmetic es una eleccion del autor sin justificacion empirica publicada; puede amplificar artefactos del ajuste LoRA.
- No hay benchmarks publicados, por lo que no puede compararse objetivamente con alternativas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion externa.
- No se documenta la longitud de contexto soportada, lo que impide planificar el tamano de los fragmentos a introducir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Swara55/qwen3.5-0.8b-rag-ta
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC Question Answering Dataset: https://github.com/mynlp/niilc-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

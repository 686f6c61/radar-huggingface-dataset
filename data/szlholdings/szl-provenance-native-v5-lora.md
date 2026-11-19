# SZLHOLDINGS/szl-provenance-native-v5-lora

## Resumen

`szl-provenance-native-v5-lora` es un adaptador LoRA desarrollado por SZLHOLDINGS sobre el modelo base `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1`, una variante de la familia Qwen 3.5 con 0,8 mil millones de parametros. El adaptador esta disenado para una tarea muy concreta: responder preguntas sobre recibos (receipts) de operaciones, manteniendo trazabilidad estricta entre la respuesta y el documento de origen. La receta de entrenamiento utiliza LoRA con rango 16, alpha 32 y dropout 0,05, durante 3 epocas con tasa de aprendizaje 1e-4, sobre un corpus de 247 pares construidos a partir de recibos reales de dominio inmobiliario.

El modelo es relevante no por su rendimiento absoluto, sino por su enfoque metodologico: la model card documenta de forma explicita un resultado negativo de ablacion. La version v5, entrenada con un corpus ampliado de 232 a 247 pares respecto a v4, obtiene 21/33 aciertos frente a los 28/33 de v4, y genera 4 respuestas fabricadas frente a 1. El autor declara abiertamente la regresion y mantiene v4 como el mejor adaptador medido de esta linea. Todo el proceso esta acompanado de recibos criptograficos (sha256) del conjunto de evaluacion, del grader y de las respuestas registradas.

Se trata, por tanto, de un artefacto de investigacion orientado a la evaluacion de fidelidad documental y riesgo selectivo en modelos pequenos, no de un modelo de proposito general. El repositorio esta marcado como privado en la model card y el adaptador figura como no firmado (UNSIGNED), pendiente de contrafirma con el firmante DSSE del estate.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen 3.5 de 0,8B |
| Parametros totales | no disponible (adaptador LoRA; base de 0,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer de la familia Qwen 3.5 con 0,8 mil millones de parametros, identificado como `qwen3_5` en las etiquetas del repositorio. La configuracion LoRA declarada es rango 16, alpha 32 y dropout 0,05, con 3 epocas de entrenamiento y tasa de aprendizaje 1e-4. El script de entrenamiento referenciado es `sft_provenance_native_v05.py` y el corpus es `SZLHOLDINGS/provenance-native-corpus-v1`, concretamente el fichero `provenance_corpus_v05.jsonl` con 247 pares construidos a partir de recibos reales de dominio inmobiliario, con sha256 `9b1604b257bc23d458379c964b42e74925bc4f1a7163a70fdf3184178cef00b0`.

No se especifican en la informacion disponible detalles sobre el numero total de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable no esta en la arquitectura sino en el protocolo de evaluacion: un conjunto preregistrado de 33 sondas (heldout-v2) con sha256 fijado, un grader con hash verificado, decodificacion greedily con 256 tokens nuevos y un recibo criptografico que registra cada respuesta. Se realizo ademas una comprobacion de contaminacion (2026-11-19T08:57Z) comparando las 33 preguntas contra los 247 turnos de usuario del corpus, con coincidencia exacta y por prefijos de 40 caracteres: 0/33 presentes, por lo que los resultados son genuinamente held-out para este adaptador.

## Capacidades

- Generacion de texto condicionada a documentos: responde preguntas sobre recibos de operaciones aportando respuestas ancladas al contenido del recibo.
- Distincion entre preguntas respondibles y no respondibles: el protocolo de evaluacion separa cuatro tipos de sonda (answerable, contradiction, unanswerable sin recibo, unanswerable con recibo).
- Abstraccion selectiva: en las 10 sondas no respondibles con recibo presente acierta 10/10, es decir, reconoce correctamente cuando el recibo no contiene la respuesta.
- Razonamiento sobre contradicciones: capacidad limitada, con 0/3 aciertos en las sondas de contradiccion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el corpus y las etiquetas no especifican idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Verificacion documental en tramitacion inmobiliaria: el adaptador puede responder preguntas concretas sobre un recibo de operacion (importes, fechas, conceptos) citando el contenido del documento, lo que resulta adecuado para tareas de comprobacion interna donde la trazabilidad es prioritaria.
- Deteccion de preguntas sin respaldo documental: gracias a su comportamiento en sondas no respondibles con recibo presente (10/10), puede emplearse como filtro que rechace preguntas cuya respuesta no figura en el documento aportado, reduciendo respuestas inventadas en flujos de revision.
- Auditoria de fidelidad en pipelines de extraccion: el modelo sirve como referencia para validar que un sistema mayor de extraccion de recibos no alucina, comparando sus respuestas ancladas con las de modelos mas grandes.
- Investigacion en evaluacion de alucinacion: el protocolo preregistrado con recibos criptograficos y grader fijado es replicable y util para equipos que disenan benchmarks de fidelidad documental en modelos pequenos.
- Prototipado en hardware de consumo: al tratarse de un adaptador sobre una base de 0,8B, es viable ejecutarlo en GPU de portatil (la evaluacion se realizo en una NVIDIA GeForce RTX 5050 Laptop GPU), lo que permite iterar localmente sin infraestructura dedicada.
- Estudio de ablaciones de corpus: la comparativa v0.4 frente a v0.5 documentada en la model card sirve como caso de referencia para analizar como el aumento de datos de entrenamiento puede degradar el rendimiento medido en tareas de grounding.

## Benchmarks y rendimiento

Resultados medidos en heldout-v2 (33 sondas preregistradas, decodificacion greedily, 256 tokens nuevos), entorno: Python 3.12.16, torch 2.11.0+cu128, transformers 5.23.0, peft 0.21.3, NVIDIA GeForce RTX 5050 Laptop GPU, Windows 11.

| Tipo de sonda | Aciertos |
|---|---|
| Answerable | 8/12 |
| Contradiction | 0/3 |
| Unanswerable, sin recibo | 3/8 |
| Unanswerable, con recibo | 10/10 |
| **Total correcto** | **21/33** |
| Fabricadas (grader) | 4 |
| Cobertura answerable | 0,917 |
| Riesgo selectivo | 0,333 |

Comparativa de la linea de adaptadores en el mismo protocolo:

| Adaptador | Correctas | Fabricadas | Riesgo selectivo |
|---|---|---|---|
| base (rev aa3e937e991a) | 8/33 | 0 | 0,806 |
| v2 (rev 4e3b48f077c1) | 19/33 | 7 | 0,600 |
| v3 (rev 97c2b8e29d01) | 22/33 | 5 | 0,353 |
| v4 (rev 7631759bfaf7, mejor medido) | 28/33 | 1 | 0,313 |
| v5 (este adaptador, rev 1dc8e0203ae6) | 21/33 | 4 | 0,333 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de una base de 0,8B, la huella es reducida y cabe en GPU de consumo, aunque no se aportan cifras concretas por cuantizacion.
- GPU recomendadas: la evaluacion documentada se ejecuto en una NVIDIA GeForce RTX 5050 Laptop GPU; no se especifican otras GPU validadas.
- Cabe en GPU de consumo: si, segun el entorno de evaluacion registrado (RTX 5050 Laptop).
- Opciones de despliegue: no se documentan frameworks de serving (vLLM, llama.cpp, Ollama, TGI); el adaptador se distribuye en formato PEFT/safetensors y se carga con la libreria `peft`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento medido (heldout-v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| szl-provenance-native-v5-lora (este) | 0,8B base + LoRA | no disponible | 21/33, 4 fabricadas | other | Hugging Face (repo privado) |
| szl-provenance-native-v4-lora | 0,8B base + LoRA | no disponible | 28/33, 1 fabricada | other | Hugging Face |
| szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1 (base) | 0,8B | no disponible | 8/33, 0 fabricadas | other | Hugging Face |

No se dispone de datos de modelos externos comparables (misma tarea de grounding documental sobre recibos) en la informacion proporcionada.

## Limitaciones y advertencias

- Regresion medida frente a v4: este adaptador obtiene 21/33 frente a 28/33 de v4 y genera 4 respuestas fabricadas frente a 1; el propio autor lo declara como resultado negativo de ablacion y recomienda v4 como mejor adaptador de la linea.
- Razonamiento sobre contradicciones practicamente nulo: 0/3 aciertos en las sondas de contradiccion.
- Rendimiento limitado en preguntas no respondibles sin recibo: 3/8 aciertos, lo que indica dificultad para abstenerse cuando no se aporta documento.
- Riesgo de alucinacion: se registran 4 respuestas fabricadas segun el grader en el conjunto heldout-v2.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; el corpus se limita a recibos inmobiliarios y puede no representar otros dominios.
- Limitaciones de idioma: no se especifican idiomas soportados ni la composicion linguistica del corpus.
- Restricciones de licencia: la licencia es "other" sin texto adicional disponible; el uso comercial no esta clarificado y requiere consulta al autor.
- Estado de firma: el adaptador figura como UNSIGNED, pendiente de contrafirma con el firmante DSSE del estate; las afirmaciones de la model card se limitan a lo registrado en el recibo citado.
- Visibilidad: la model card marca el repositorio como privado, con 0 descargas y 0 likes en el momento de la consulta.
- Ambito de uso restringido: disenado para tareas de grounding documental sobre recibos; no es un modelo de proposito general y carece de datos sobre tool calling, agentes o vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-provenance-native-v5-lora
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1
- Adaptador v4 (mejor medido): https://huggingface.co/SZLHOLDINGS/szl-provenance-native-v4-lora
- Corpus de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/provenance-native-corpus-v1
- Recibos de evaluacion: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs (ruta `receipts/provenance-native-heldout-v2/run-v5.json`)

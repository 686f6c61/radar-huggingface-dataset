# ymoslem/ModernBERT-base-TeleQnA-router-qe-classifier-binary-10ep-lr2e-05-gemma4e2b-1xA100-5runs

## Resumen

El modelo `ymoslem/ModernBERT-base-TeleQnA-router-qe-classifier-binary-10ep-lr2e-05-gemma4e2b-1xA100-5runs` es un clasificador binario de estimacion de calidad (quality estimation, QE) construido sobre `answerdotai/ModernBERT-base` y publicado por el usuario ymoslem bajo licencia Apache 2.0. Su tarea es decidir, dada una pregunta de TeleQnA y la respuesta generada por `google/gemma-4-E2B-it` con el razonamiento desactivado, si esa respuesta es correcta (`accept`) o si debe escalarse a un modelo mayor (`route`). El umbral de decision es una probabilidad de aceptacion inferior a 0,5.

Tecnicamente es un encoder bidireccional de 149.606.402 parametros (repositorio de 0,6 GB en safetensors) con una cabeza de clasificacion de dos clases, entrenado con `cre qe-train` durante un maximo de 10 epocas a `lr=2e-5`, `max_length=512`, batch de 64 y entropia cruzada ponderada por clase. La entrada sigue el formato `question [SEP] full_output [SEP] num_tokens`, donde `num_tokens` es el numero de tokens de la respuesta evaluada.

Su relevancia es operativa: forma parte del router CRE-Router como puerta del cluster 0 del enrutado de TeleQnA entre Gemma4-E2B y Gemma4-26B, con un presupuesto de 20 ms por token (TPOT) sobre una unica A100, escenario que el articulo compara con HybridLLM. Es, por tanto, un ejemplo concreto de enrutado en cascada para abaratar inferencia: el modelo pequeno responde y el clasificador decide si su salida es fiable o si conviene pagar el coste del modelo grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia ModernBERT) con cabeza de clasificacion binaria |
| Parametros totales | 149.606.402 (149,6 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en este fine-tune (`max_length=512`); el modelo base ModernBERT-base soporta ventanas mayores (hasta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos completos en safetensors; no hay variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder bidireccional de tipo transformer que sustituye la atencion global completa por una alternancia de capas de atencion local (ventana corta) y global, lo que reduce el coste cuadratico y permite contextos largos. Sobre esa base, este checkpoint anade una cabeza de clasificacion para producir una probabilidad de aceptacion. En este fine-tune concreto la longitud de entrada se fija en 512 tokens, suficiente porque las respuestas de TeleQnA son cortas.

El entrenamiento se realizo con la herramienta `cre qe-train` del proyecto CRE-Router, con semilla 42, learning rate 2e-5, batch de 64, hasta 10 epocas, parada temprana con paciencia 4 y entropia cruzada ponderada por clase para compensar el desbalance. El conjunto de entrenamiento usa las cinco ejecuciones del split de train: 45.000 filas, de las cuales 28.763 son `accept` y 16.237 son `route`. El checkpoint conservado es el de la epoca 7 de 10, seleccionado por macro-F1 sobre la ejecucion 0 del split de test (1.000 filas: 639 `accept` y 361 `route`). La configuracion replica la del estimador entrenado sobre `google/gemma-4-E4B-it`. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo que no aplica a un clasificador.

## Capacidades

- Clasificacion binaria de calidad: devuelve una etiqueta `accept` o `route` para una respuesta generada por otro modelo.
- Estimacion de calidad sobre salidas de `google/gemma-4-E2B-it` con el razonamiento desactivado, usando la pregunta, la salida completa y el numero de tokens como entradas.
- Enrutado en cascada: actua como puerta de decision previa al escalado a un modelo mayor cuando la probabilidad de aceptacion cae por debajo de 0,5.
- Uso de la longitud de la respuesta como caracteristica explicita mediante el campo `num_tokens` del formato de entrada.
- Evaluacion a nivel de respuesta unica y de una sola tarjeta (one-card answers), tal y como se define en la model card.
- No genera texto: no hay capacidad de generacion, resumen ni respuesta a preguntas.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No tiene capacidades multimodales ni de audio.
- Sin capacidades multilingues: solo ingles.

## Casos de uso

- Enrutado en cascada en produccion: desplegado como Stage 1 tras Gemma4-E2B, el clasificador decide si la respuesta del modelo pequeno se sirve directamente o se escala a Gemma4-26B, reduciendo el coste medio por consulta sin degradar la calidad percibida.
- Control de costes en servicios de atencion al cliente sobre documentacion tecnica: en un asistente que responde consultas de redes y telecomunicaciones, el modelo evita invocar el LLM grande cuando la respuesta corta ya es correcta.
- Filtrado previo en pipelines de generacion aumentada (RAG): antes de devolver al usuario una respuesta generada por el modelo pequeno, el clasificador la valida y dispara la regeneracion con un modelo mayor si no supera el umbral.
- Etiquetado y curacion de datasets de QA: permite anotar de forma automatica pares de pregunta y respuesta como `accept` o `route`, lo que sirve para construir conjuntos de entrenamiento de routers o de modelos de recompensa.
- Monitorizacion de la deriva de un modelo pequeno desplegado: al medir la tasa de `route` a lo largo del tiempo, el equipo detecta cambios en la distribucion de consultas o degradacion del modelo base.
- Deteccion de consultas fuera de dominio o de baja calidad: respuestas con probabilidad de aceptacion muy baja pueden dirigirse a revision humana en lugar de a otro modelo.
- Ajuste de acuerdos de nivel de servicio (SLA): el umbral de 0,5 es un parametro de negocio que puede recalibrarse para priorizar coste (mas `accept`) o calidad (mas `route`).
- Reproducibilidad de investigacion en enrutado: sirve como componente publico para replicar experimentos de enrutado con presupuesto de latencia por token.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Macro-F1 (checkpoint conservado, epoca 7 de 10) | 0,692 |
| Split de evaluacion | ejecucion 0 del split de test: 1.000 filas (639 `accept`, 361 `route`) |
| Split de entrenamiento | 45.000 filas (28.763 `accept`, 16.237 `route`) |
| Epocas configuradas / ejecutadas hasta el mejor checkpoint | 10 / 7 |
| Presupuesto de latencia del escenario | 20 ms por token (TPOT) sobre una A100 |
| MMLU, HumanEval, GSM8K u otros benchmarks generativos | no disponibles (no aplican a un clasificador) |
| Comparacion con HybridLLM en el escenario CRE-Router | mencionada en la model card, sin cifras publicadas en la informacion disponible |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,6 GB en fp32, 0,3 GB en bf16/fp16, 0,15 GB en int8 y 0,08 GB en int4 (cuantizacion externa, no publicada por el autor).
- La memoria adicional de activaciones para 512 tokens es despreciable frente al peso de los parametros.
- Cabe sin problemas en cualquier GPU de consumo: GTX 1060 de 6 GB, RTX 3060, RTX 4070, RTX 4090, e incluso en CPU para cargas de baja concurrencia.
- GPU de referencia del escenario descrito: una unica A100, con un presupuesto global de 20 ms por token en el pipeline de enrutado.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, exportacion a ONNX u ONNX Runtime via Optimum, TorchScript o un servicio propio con FastAPI. No hay artefactos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion manual y no estan soportados de fabrica.
- Latencia y throughput especificos de este checkpoint: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (QE Gemma4-E2B) | 149,6 M | 512 tokens | Clasificacion binaria `accept` / `route` | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `ymoslem/ModernBERT-base-TeleQnA-router-qe-classifier-binary-10ep-lr2e-05-gemma4e4b-5runs_1eval` (estimador hermano) | misma arquitectura ModernBERT-base (recuento exacto no disponible) | 512 tokens | Clasificacion binaria sobre salidas de Gemma4-E4B | apache-2.0 | HuggingFace |
| `answerdotai/ModernBERT-base` | 149 M (base, sin cabeza de clasificacion binaria del dominio) | hasta 8.192 tokens (documentado para el modelo base) | Encoder de proposito general, requiere fine-tuning | apache-2.0 | HuggingFace, ampliamente utilizado |
| Encoders alternativos de tamano comparable (por ejemplo DeBERTa-v3-base) | ~184 M (documentado) | 512 tokens | Clasificacion de texto general | MIT | HuggingFace |

No se dispone de resultados de benchmarks comparativos entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- No transfiere a otros modelos: esta entrenado sobre las salidas propias de Gemma4-E2B y su uso previsto se restringe a los casos en los que la etapa 1 enruta hacia ese modelo.
- Solo ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Ventana de 512 tokens, insuficiente para respuestas largas o contextos extensos.
- No es un modelo generativo: no puede producir texto, codigo ni razonamiento.
- El macro-F1 del checkpoint conservado es 0,692, lo que implica una tasa de error de clasificacion de aproximadamente el 30 por ciento sobre el split de evaluacion.
- Existen dos tipos de error con impacto directo: falsos `accept` (se sirve al usuario una respuesta incorrecta) y falsos `route` (se paga innecesariamente el coste del modelo grande).
- El umbral de decision esta fijado en 0,5 y no se documenta una calibracion especifica de probabilidades; en produccion conviene recalibrarlo o ajustarlo segun el SLA.
- El desbalance de clases del entrenamiento (63,9 por ciento `accept` frente a 36,1 por ciento `route`) se mitiga con entropia cruzada ponderada, pero puede seguir sesgando la decision.
- Dependencia estricta del formato de entrada `question [SEP] full_output [SEP] num_tokens`; cambios en la serializacion degradan el rendimiento.
- El dominio de entrenamiento es TeleQnA (preguntas y respuestas de telecomunicaciones), por lo que no hay garantias fuera de ese dominio.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el modelo base y los modelos evaluados (familia Gemma) pueden tener sus propias condiciones.
- El repositorio no registra descargas ni likes, lo que indica ausencia de validacion independiente por parte de la comunidad.
- Solo se publica la ejecucion seleccionada por macro-F1; no se documenta varianza entre semillas ni intervalos de confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ymoslem/ModernBERT-base-TeleQnA-router-qe-classifier-binary-10ep-lr2e-05-gemma4e2b-1xA100-5runs
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Estimador hermano sobre Gemma4-E4B: https://huggingface.co/ymoslem/ModernBERT-base-TeleQnA-router-qe-classifier-binary-10ep-lr2e-05-gemma4e4b-5runs_1eval
- Modelo evaluado (referenciado en la model card como `google/gemma-4-E2B-it`): https://huggingface.co/google/gemma-4-E2B-it
- Proyecto CRE-Router: no se proporciona URL en la informacion disponible.
- Papers, blogs, repositorios o demos adicionales: no se han encontrado enlaces relevantes en la busqueda web.

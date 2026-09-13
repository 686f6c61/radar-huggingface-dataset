# Vaibhav3311v/deberta-pii-owndlp

# deberta-pii-owndlp: deteccion de PII con DeBERTa-v3

## Resumen

deberta-pii-owndlp es un modelo de clasificacion de tokens (token classification) publicado por el usuario Vaibhav3311v en HuggingFace, consistente en un ajuste fino de microsoft/deberta-v3-base sobre un corpus de datos no identificado (la model card indica literalmente "None dataset"). Su tarea es la deteccion de informacion personal identificable (PII) en texto: nombres de persona, correos, telefonos, direcciones, organizaciones, documentos de identidad indios (Aadhaar, PAN, GSTIN, IFSC), datos financieros (IBAN, tarjeta de credito, cuenta bancaria), credenciales, direccion IP y condiciones medicas, entre otras 19-20 etiquetas.

El modelo cuenta con 183.861.543 parametros en formato safetensors y hereda la arquitectura DeBERTa-v3 (attention disentangled y embedding sharing con gradient disentanglement), con una longitud de contexto limitada a los 512 tokens del modelo base. Se distribuye bajo licencia MIT y esta etiquetado como compatible con Inference Endpoints.

Su relevancia practica es limitada en el estado actual: la model card reporta un resultado final de evaluacion con precision, recall y F1 iguales a 0.0 (loss 3.3878), lo que indica que el entrenamiento colapso al final. Los registros intermedios de entrenamiento si muestran picos altos (F1 global de 0.9910 en el step 200), por lo que el modelo parece haber sufrido divergencia a partir de la epoca 1.07. El repositorio registra 0 descargas y 0 likes, y la model card es autogenerada por el Trainer sin documentacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (transformer encoder con attention disentangled), cabeza de clasificacion de tokens |
| Parametros totales | 183.861.543 (dato de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite de posicion del modelo base microsoft/deberta-v3-base) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible; el modelo base microsoft/deberta-v3-base esta preentrenado predominantemente en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | microsoft/deberta-v3-base |
| Tarea (pipeline) | token-classification |
| Tamano del repositorio | 0.4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es la de DeBERTa-v3-base: un encoder transformer que sustituye el mecanismo de atencion estandar por atencion disentangled (contenido y posicion se codifican en vectores separados) e introduce gradient-disentangled embedding sharing, ademas de un preentrenamiento estilo ELECTRA con deteccion de tokens reemplazados en lugar del enmascaramiento clasico. Sobre ese backbone se anade una cabeza de clasificacion por token para las etiquetas BIO del esquema de PII. El modelo resultante tiene 183,9 millones de parametros, coherente con el recuento del modelo base.

El ajuste fino se realizo con el Trainer de HuggingFace. Los hiperparametros declarados son: learning rate 2e-06, train_batch_size 8, eval_batch_size 32, gradient_accumulation_steps 4 (batch efectivo 32), seed 42, optimizador AdamW (variante torch fused, betas 0.9/0.999, epsilon 1e-08), scheduler coseno con 260 pasos de warmup y 4 epocas. No se documenta la composicion del dataset, el numero de tokens de entrenamiento ni si hubo etapas de RLHF/DPO (no aplicables a un modelo discriminativo de este tipo). La model card no aporta ninguna innovacion tecnica adicional ni describe el proceso de anotacion.

## Capacidades

- Deteccion y clasificacion de entidades de PII a nivel de token sobre texto en mayusculas/minusculas, con salida de spans y etiquetas del esquema.
- Cobertura de etiquetas declaradas: Person Name, Contact Email, Contact Phone, Address, Organization, Credential Secret, Date Of Birth, Financial Bank Account, Gov Id Aadhaar, Gov Id Pan, Gov Id Gstin, Financial Ifsc, Job Title, Medical Condition, Username, Financial Credit Card, Financial Iban, Gov Id National Generic y Network Ip.
- Enfoque especifico en identificadores indios (Aadhaar, PAN, GSTIN, IFSC), lo que sugiere un conjunto de datos orientado al contexto normativo de India.
- No dispone de generacion de texto: es un encoder discriminativo, no un modelo causal.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (no vision, no audio) ni modo "thinking".
- Capacidades multilingues no declaradas; el modelo base esta orientado al ingles.

## Casos de uso

- Redaccion (redaction) de PII en documentos: el modelo marcaria spans de nombres, correos, telefonos e identificadores para su enmascaramiento antes de almacenar o publicar el texto. Es su uso natural por tratarse de token classification.
- Cumplimiento normativo tipo GDPR o DPDP (India): serviria como componente de un pipeline de auditoria que localice datos personales en bases documentales; el foco en Aadhaar, PAN y GSTIN lo hace util en el mercado indio, aunque su F1 final reportado es 0.0 y debe reentrenarse o validarse antes.
- Filtrado de logs y telemetria: deteccion de credenciales, direcciones IP, correos y nombres de usuario en trazas de aplicacion para evitar fugas en sistemas de observabilidad.
- Preprocesado de datos de entrenamiento: anonimizacion de corpus antes de usarlos para entrenar otros modelos, marcando y sustituyendo entidades sensibles.
- Enmascaramiento en atencion al cliente: procesar transcripciones de tickets o chats para eliminar datos personales antes de que el contenido llegue a un sistema de analitica o a un LLM externo.
- DLP (data loss prevention) en correo corporativo: clasificar mensajes salientes y bloquear o marcar aquellos que contienen IBAN, tarjetas, cuentas bancarias o identificadores gubernamentales.
- Ambito sanitario: uso de la etiqueta Medical Condition para detectar informacion clinica en historiales o notas que deban seudonimizarse.
- Verificacion de cumplimiento en pipelines de datos: paso de validacion automatica que confirme si un dataset ya anonimizado conserva restos de PII detectable.

## Benchmarks y rendimiento

El model-index oficial del repositorio esta vacio (`"results": []`), por lo que no hay benchmarks publicados por el autor en ese formato. La model card si incluye los resultados de la evaluacion final y el registro de entrenamiento. Los resultados finales declarados son:

| Metrica (evaluacion final) | Valor |
|---|---|
| Loss | 3.3878 |
| Precision | 0.0 |
| Recall | 0.0 |
| F1 | 0.0 |
| F1 de todas las etiquetas (Person Name, Contact Email, Contact Phone, Address, Organization, Credential Secret, Date Of Birth, Financial Bank Account, Gov Id Aadhaar, Gov Id Pan, Gov Id Gstin, Financial Ifsc, Job Title, Medical Condition, Username, Financial Credit Card, Financial Iban, Gov Id National Generic, Network Ip) | 0.0 en todas |

Progresion durante el entrenamiento (registro del Trainer, seleccion de epocas):

| Epoca | Step | Validation loss | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 0.1538 | 100 | 2.0319 | 0.2736 | 0.0982 | 0.1446 |
| 0.3077 | 200 | 0.0669 | 0.9895 | 0.9926 | 0.9910 |
| 0.4615 | 300 | 0.0791 | 0.9716 | 0.9677 | 0.9697 |
| 0.6154 | 400 | 0.1160 | 0.9274 | 0.9437 | 0.9354 |
| 0.7692 | 500 | 0.1907 | 0.9339 | 0.9195 | 0.9266 |
| 0.9231 | 600 | 0.2023 | 0.7151 | 0.8997 | 0.7969 |
| 1.0769 | 700 | 3.0378 | 0.2078 | 0.0174 | 0.0322 |
| 1.2308 | 800 | 3.2253 | 0.0 | 0.0 | 0.0 |

En el pico intermedio (step 200) destacan F1 de 1.0 en Date Of Birth, Contact Phone, Financial Bank Account y Financial Credit Card, y 0.9992 en Person Name; las etiquetas Financial Iban, Gov Id National Generic y Network Ip se mantuvieron en 0.0 durante todo el registro. La tabla original esta truncada en el ultimo tramo aportado y no incluye las epocas restantes hasta el fin del entrenamiento. No se aportan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,74 GB en fp32, 0,37 GB en fp16/bf16 y 0,18 GB en int8 para los pesos, mas el consumo de activaciones, que depende de la longitud de secuencia (hasta 512 tokens) y del batch.
- El modelo cabe sin problema en cualquier GPU de consumo: GTX 1060 6 GB, RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o CPU para lotes pequenos.
- GPU recomendadas para produccion: cualquiera con al menos 4 GB de VRAM; para alto throughput basta una T4, L4, A10G o similar. No requiere A100 ni H100.
- Inferencia en CPU: viable, especialmente con ONNX Runtime o cuantizacion dinamica int8; el cuello de botella sera el throughput, no la memoria.
- Opciones de despliegue: pipeline de transformers, Inference Endpoints de HuggingFace (el repo esta marcado como `endpoints_compatible`), ONNX Runtime, TorchScript, NVIDIA Triton o TorchServe, y wrappers propios con FastAPI. vLLM, TGI, llama.cpp y Ollama estan orientados a modelos generativos y no son aplicables directamente a un encoder de clasificacion de tokens.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deberta-pii-owndlp | 183,9 M | 512 tokens | Token classification (PII) | MIT | HuggingFace, 0 descargas |
| microsoft/deberta-v3-base | 184 M aprox. | 512 tokens | Modelo base (no afinado para PII) | MIT | HuggingFace, ampliamente usado |
| Modelos NER genericos basados en BERT/RoBERTa (por ejemplo dslim/bert-base-NER) | 110 M aprox. | 512 tokens | NER de 4 categorias (PER, ORG, LOC, MISC) | no verificada en esta busqueda | HuggingFace |

La comparacion de rendimiento no es posible con los datos disponibles: este repositorio no publica benchmarks en el model-index y su evaluacion final reportada es F1 0.0, mientras que las alternativas tienen metricas publicas en sus propias model cards. En cobertura de etiquetas, deberta-pii-owndlp es mucho mas especifico (identificadores indios, datos financieros, credenciales) que un NER generico. No se han identificado en la informacion proporcionada otros modelos comparables de PII con benchmarks verificables.

## Limitaciones y advertencias

- Resultado final de evaluacion con precision, recall y F1 iguales a 0.0: el modelo tal como se publica no es fiable para produccion sin un reentrenamiento o una revision del checkpoint.
- Divergencia durante el entrenamiento: la loss de validacion pasa de 0.0669 (step 200) a 3.2253 (step 800) y el F1 se desploma desde 0.9910 hasta 0.0, sintoma de un learning rate mal ajustado, datos ruidosos o sobreajuste severo.
- Dataset de entrenamiento no documentado: la model card indica "None dataset"; no se puede evaluar la representatividad, el idioma, el dominio ni la calidad de las anotaciones.
- Riesgo de alucinacion de entidades: al ser un clasificador, puede marcar como PII fragmentos que no lo son (falsos positivos) o dejar pasar PII real (falsos negativos); en el pico observado algunas etiquetas ya mostraban F1 de 0.0.
- Etiquetas sistematicamente fallidas en el registro de entrenamiento: Financial Iban, Gov Id National Generic y Network Ip se mantuvieron en F1 0.0 durante todo el tramo documentado.
- Sesgos: no hay informacion sobre la distribucion demografica, linguistica o geografica de los datos; el foco en identificadores indios sugiere un sesgo geografico marcado y poca cobertura de normativas de otros paises (por ejemplo DNI espanol, NIF, SSN estadounidense).
- Limitacion de idioma: no se declaran idiomas soportados y el modelo base esta orientado al ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Limite de contexto de 512 tokens: textos largos deben segmentarse, lo que puede romper entidades que cruzan el limite y degradar el recall.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece ninguna garantia ni soporte; el repositorio tiene 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- Metadatos inconsistentes: la fecha de creacion registrada en el repositorio (2026-09-12) es posterior a la fecha de consulta habitual, lo que sugiere que no debe tomarse como referencia.
- La model card esta autogenerada por el Trainer y no ha sido revisada ni completada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vaibhav3311v/deberta-pii-owndlp
- Modelo base microsoft/deberta-v3-base: https://huggingface.co/microsoft/deberta-v3-base
- Paper de DeBERTa-v3 (He et al., "DeBERTaV3: Improving DeBERTa using ELECTRA-Style Pre-Training with Gradient-Disentangled Embedding Sharing"): https://arxiv.org/abs/2111.09543
- Repositorio oficial de DeBERTa en GitHub: https://github.com/microsoft/DeBERTa

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian al servicio Speedtest de Ookla y no guardan relacion con la ficha. No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a deberta-pii-owndlp.

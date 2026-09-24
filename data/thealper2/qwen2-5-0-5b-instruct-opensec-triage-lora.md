# thealper2/Qwen2.5-0.5B-Instruct-opensec-triage-lora

## Resumen

Qwen2.5-0.5B-Instruct-opensec-triage-lora es un adaptador LoRA publicado por el usuario thealper2 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. No es un modelo completo, sino un ajuste fino de bajo rango pensado para una tarea muy concreta: convertir una alerta de seguridad junto con su evidencia contextual en una decision estructurada de triaje con cuatro campos (Category, Disposition, Severity y Action). El adaptador anade 8.798.208 parametros entrenables sobre los 502.830.976 del modelo base, con rango LoRA 16 y alpha 32.

El interes practico del modelo esta en su formato de salida cerrado y parseable, y en el mapeo determinista entre disposicion, severidad y accion propuesto por el autor, lo que lo hace adecuado para automatizar el primer nivel de triaje en un SOC (centro de operaciones de seguridad). El entrenamiento se realizo sobre el config `research` del dataset tegridydev/opensec-triage, con 40.000 ejemplos de entrenamiento, 5.000 de validacion y 5.000 de test, mas una sonda fuera de distribucion de 420 filas.

La relevancia actual es doble: por un lado demuestra que un modelo de 0,5B de parametros puede resolver una tarea de clasificacion estructurada con latencia y coste minimos; por otro, sus propios resultados invitan a la cautela, ya que un clasificador TF-IDF con regresion logistica alcanza exactitud 1.0 en el mismo split de test, lo que sugiere que la tarea es altamente separable por senales lexicas y que el benchmark puede sobreestimar la dificultad real del problema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA sobre las capas de atencion y MLP |
| Parametros totales | 502.830.976 en el modelo base; el adaptador anade 8.798.208 parametros entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base segun su documentacion publica; la receta de entrenamiento del adaptador uso max_sequence_length de 384 tokens |
| Tipos de cuantizacion | no disponible en el repositorio del adaptador (pesos en safetensors con la precision original); la cuantizacion depende del modelo base con el que se combine |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; se puede fusionar con merge_and_unload) |
| Metodo de ajuste | LoRA con perdida solo en turnos de asistente (assistant-only loss) |
| Rango / alpha / dropout LoRA | 16 / 32 / 0.05 |
| Modulos objetivo | down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj, v_proj |
| Tarea declarada | text-generation (clasificacion estructurada de alertas de seguridad) |
| Dataset de entrenamiento | tegridydev/opensec-triage, config `research`, revision b9a5d6fb80b329b19efc5c25087b76a804c0a324 |
| Tamano del repositorio | 0.0 GB (redondeado en HuggingFace) |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5 orientado a instrucciones. El ajuste es LoRA puro: no se modifican los pesos base, sino que se insertan matrices de bajo rango en los siete modulos lineales principales de cada bloque (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj). Con r=16 y alpha=32 sobre 502,8 millones de parametros base, solo se entrenan 8,8 millones de parametros, es decir, aproximadamente el 1,75 % del total, lo que explica un tiempo de entrenamiento de 3.922 segundos en una unica NVIDIA GeForce RTX 5060 Ti.

La receta de entrenamiento es compacta y reproducible: 2,0 epocas y 2.500 pasos, learning rate 0,0002 con scheduler coseno, warmup ratio 0,05, weight decay 0,01, batch efectivo de 32 (8 por dispositivo x 4 de acumulacion), longitud maxima de secuencia de 384 tokens, precision bf16 y semilla 42. Se reporta una perdida de validacion de 0,00001. El prompt de sistema instruye explicitamente al modelo a basarse solo en la evidencia de la alerta y a no anadir explicaciones, y el mensaje de usuario fija la plantilla de chat de Qwen2.5 junto con el formato exacto de cuatro lineas que debe producir la respuesta. Las etiquetas de Category y Disposition provienen de metadatos del dataset (`domain` y `target`), mientras que Severity y Action no son ground truth del dataset: se derivan de un mapeo determinista 1:1 con la disposicion (malicious/high/escalate_incident_response, suspicious/medium/investigate_with_owner, unknown/medium/collect_missing_evidence, misconfiguration/low/fix_configuration, benign/info/document_and_close, expected_admin/info/verify_change_record, authorised_testing/info/verify_assessment_scope).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Clasificacion estructurada de alertas de seguridad en cuatro campos con taxonomia cerrada: seis categorias (endpoint, cloud_saas, identity_access, network, application_data, cloud_native), siete disposiciones, cuatro niveles de severidad y siete acciones.
- Salida en formato estricto y parseable linea a linea (`Campo: valor`), sin texto adicional: la tasa de formato valido reportada es 1.0000 tanto en test como en la sonda OOD.
- Razonamiento de triaje de un solo paso basado exclusivamente en la evidencia incluida en la alerta; el prompt de sistema prohibe inventar hechos.
- Coherencia interna entre severidad, accion y disposicion predichas: 1.0000 en test y en la sonda OOD tras el ajuste (0,9574 y 0,6429 respectivamente en el modelo base sin ajustar).
- No se documenta soporte de tool calling ni function calling.
- No se documenta comportamiento agentico ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada al ingles declarado; no hay evidencia de rendimiento en otros idiomas.
- Capacidad de generalizacion fuera de distribucion limitada: el autor la mide con una sonda de 420 filas con familias de comportamiento y redacciones retenidas.

## Casos de uso

- Triaje de primer nivel en un SOC: el modelo recibe el texto de la alerta con su evidencia y devuelve categoria, disposicion, severidad y accion en cuatro lineas que un orquestador puede parsear directamente para enrutar el ticket al equipo adecuado, sin intervencion humana en los casos claros.
- Enrutamiento automatico de incidentes: el campo Action (escalate_incident_response, investigate_with_owner, collect_missing_evidence, fix_configuration, verify_change_record, verify_assessment_scope, document_and_close) se puede mapear a colas, guardias o flujos de cambio concretos dentro de una plataforma de ticketing.
- Priorizacion y reduccion de ruido: al forzar una disposicion entre siete valores cerrados, el adaptador sirve como filtro previo que descarta document_and_close y expected_admin antes de que lleguen a analistas humanos, reduciendo la carga de alertas de bajo valor.
- Preprocesado de pipelines de deteccion: integrado como etapa de normalizacion entre el SIEM y el sistema de gestion de casos, genera metadatos estructurados (severidad y categoria) que alimentan dashboards y reglas de correlacion.
- Etiquetado asistido y auditoria de datos: el modelo puede usarse para pre-etiquetar alertas historicas o para contrastar el triaje humano con el automatico y detectar discrepancias sistematicas de criterio.
- Prototipado y pruebas de concepto en local: con 0,5B de parametros y un adaptador de 8,8 millones de parametros, cabe en una GPU de consumo o incluso en CPU, lo que permite iterar sobre prompts, taxonomias y plantillas sin coste de API.
- Despliegue en entornos con restriccion de soberania de datos: al ser un modelo apache-2.0 ejecutable on-premise, se puede procesar telemetria sensible sin enviarla a servicios externos.

## Benchmarks y rendimiento

Decodificacion greedy (`do_sample=False`, `max_new_tokens=48`). Las salidas se parsean por campo; una respuesta solo es valida si los cuatro campos aparecen exactamente una vez. Los campos invalidos cuentan como error.

| Metrica | base zero-shot / ood_test | base zero-shot / test | fine-tuned / ood_test | fine-tuned / test | fine-tuned / validation |
|---|---:|---:|---:|---:|---:|
| valid_format_rate | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| joint_triage_accuracy | 0.0619 | 0.0252 | 0.9167 | 1.0000 | 1.0000 |
| exact_match_accuracy | - | 0.0252 | - | 1.0000 | 1.0000 |
| category_accuracy | - | 0.1738 | - | 1.0000 | 1.0000 |
| category_macro_f1 | - | 0.1520 | - | 1.0000 | 1.0000 |
| disposition_accuracy | 0.1619 | 0.1416 | 0.9167 | 1.0000 | 1.0000 |
| disposition_macro_f1 | 0.0636 | 0.0359 | 0.9058 | 1.0000 | 1.0000 |
| severity_accuracy | 0.2952 | 0.2854 | 0.9952 | 1.0000 | 1.0000 |
| severity_macro_f1 | 0.2228 | 0.1272 | 0.9941 | 1.0000 | 1.0000 |
| action_accuracy | 0.1429 | 0.1424 | 0.9167 | 1.0000 | 1.0000 |
| action_macro_f1 | 0.0357 | 0.0356 | 0.9058 | 1.0000 | 1.0000 |
| high_severity_undertriage_rate | 1.0000 | 1.0000 | 0.0000 | 0.0000 | 0.0000 |
| internal_consistency_rate | 0.6429 | 0.9574 | 1.0000 | 1.0000 | 1.0000 |
| n | 420 | 5000 | 420 | 5000 | 5000 |

Baselines no LLM aportados por el autor sobre el mismo split de test: exactitud de disposicion por clase mayoritaria 0,1424; TF-IDF + regresion logistica 1.0 en exactitud de disposicion y de categoria (0,8143 en la sonda OOD `model_trainer/test`).

Nota: en la sonda OOD, la categoria no se puntua, de ahi que aparezca como "-".

## Requisitos de hardware

- Inferencia del adaptador fusionado con Qwen2.5-0.5B-Instruct en bf16: aproximadamente 1 GB de VRAM para los pesos mas el coste del cache KV.
- En cuantizacion de 8 bits, el modelo completo ronda los 0,5 GB; en 4 bits, alrededor de 0,3-0,4 GB (estimaciones a partir del tamano del modelo base, no publicadas por el autor).
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, RTX 5060 Ti (esta ultima es la usada para entrenar) e incluso en iGPU con memoria compartida.
- Ejecucion viable en CPU para cargas de baja concurrencia, dado el tamano reducido.
- Opciones de despliegue: transformers + peft (uso documentado por el autor con `PeftModel.from_pretrained` y `merge_and_unload`); vLLM, TGI, llama.cpp u Ollama son viables una vez convertidos los pesos a los formatos correspondientes, aunque el autor no documenta ninguna de estas rutas.
- El repositorio no publica GGUF, AWQ ni GPTQ; habria que generarlos a partir del modelo fusionado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-opensec-triage-lora | 502,8 M base + 8,8 M del adaptador | 384 tokens en entrenamiento; 32.768 en el modelo base | joint_triage_accuracy 1.0000 en test, 0.9167 en OOD | apache-2.0 | adaptador LoRA publicado en HuggingFace; 0 descargas |
| Qwen/Qwen2.5-0.5B-Instruct (base sin ajustar) | 502,8 M | 32.768 tokens | joint_triage_accuracy 0.0252 en test, 0.0619 en OOD | apache-2.0 | modelo completo publicado por Alibaba |
| TF-IDF + regresion logistica (baseline del autor) | no aplica (modelo clasico) | limitado por el vectorizador | exactitud de disposicion 1.0 en test, 0.8143 en OOD | no disponible | baseline descrito en la model card, no publicado como artefacto |
| Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 tokens | no disponible para esta tarea | apache-2.0 | modelo completo publicado |
| Llama-3.2-1B-Instruct | 1.230 M | 128.000 tokens | no disponible para esta tarea | Llama 3.2 Community License | modelo completo publicado |

La comparativa mas informativa es la del baseline clasico: el modelo ajustado y un TF-IDF con regresion logistica empatan en test (1.0) y el baseline supera al modelo en OOD en la metrica disponible (0,8143 frente a 0,9167 en joint_triage_accuracy, aunque no son metricas directamente equivalentes porque la sonda OOD no puntua la categoria y el baseline solo se evalua en disposicion y categoria).

## Limitaciones y advertencias

- El adaptador solo funciona correctamente combinado con Qwen/Qwen2.5-0.5B-Instruct; no es un modelo autonomo.
- Idioma unico: ingles. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- El prompt de sistema prohibe anadir explicaciones, lo que limita su uso en escenarios que requieran justificacion del triaje.
- Resultados de test perfectos (1.0000 en todas las metricas) con una perdida de validacion de 0,00001 son un indicio fuerte de sobreajuste o de que el dataset es demasiado separable. El propio autor incluye un baseline TF-IDF que tambien alcanza 1.0, lo que respalda esta lectura.
- El salto de rendimiento en la sonda OOD (joint_triage_accuracy 0,9167; disposition_accuracy 0,9167; severity_accuracy 0,9952) es la cifra mas realista de generalizacion y debe ser la referencia para decisiones de produccion.
- La sonda OOD no puntua la categoria, por lo que no hay dato de generalizacion para ese campo.
- Severity y Action no son ground truth del dataset: se derivan de un mapeo determinista 1:1 con la disposicion. Esto implica que el modelo no aprende a evaluar severidad de forma independiente, sino a reproducir una tabla de correspondencias. La metrica internal_consistency_rate mide precisamente eso.
- Como consecuencia del mapeo 1:1, la severidad y la accion anaden poca informacion nueva respecto a la disposicion; un modelo mas simple puede replicar el mismo comportamiento.
- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre un unico dataset sintetico o curado (`research`), es probable que herede su distribucion de escenarios y falle ante familias de alertas no representadas.
- Riesgo de alucinacion: el prompt de sistema lo mitiga explicitamente, y la tasa de formato valido es 1.0000, pero no se han publicado pruebas de robustez ante alertas malformadas, contradictorias o con informacion fuera de dominio.
- Restricciones de licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia. Conviene verificar la licencia del dataset tegridydev/opensec-triage de forma independiente.
- Advertencia para produccion: dado que un clasificador TF-IDF alcanza el mismo resultado en test, conviene evaluar si merece la pena el coste de inferencia de un LLM para esta tarea concreta, o si el adaptador aporta valor solo en la sonda OOD.
- El autor no documenta version en GGUF ni cuantizada, ni pruebas de carga, ni limites de concurrencia, ni latencias medidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/Qwen2.5-0.5B-Instruct-opensec-triage-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/tegridydev/opensec-triage
- Libreria PEFT: https://github.com/huggingface/peft
- Resultados de evaluacion detallados: archivo `evaluation_results.json` del repositorio del modelo
- Resultados de busqueda web: no se han encontrado enlaces relevantes para este modelo; las consultas devolvieron unicamente paginas sobre estaciones de la Royal Air Force, sin relacion con el modelo.

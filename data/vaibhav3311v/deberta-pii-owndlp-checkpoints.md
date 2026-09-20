# Vaibhav3311v/deberta-pii-owndlp-checkpoints

## Resumen

deberta-pii-owndlp-checkpoints es un modelo de clasificación de tokens publicado en HuggingFace por el usuario Vaibhav3311v, obtenido mediante fine-tuning de microsoft/deberta-v3-base. Su propósito declarado es la detección de información personal identificable (PII) en texto: la model card define 19 etiquetas de entidad que cubren nombre de persona, correo electrónico, teléfono, dirección, organización, secretos de credenciales, fecha de nacimiento, cuenta bancaria, Aadhaar, PAN, GSTIN, IFSC, título profesional, condición médica, nombre de usuario, tarjeta de crédito, IBAN, identificador nacional genérico y dirección IP. La fuerte presencia de identificadores administrativos indios sugiere un corpus de entrenamiento orientado al mercado de India, aunque el autor no documenta el dataset (la model card lo identifica literalmente como «None dataset»).

Técnicamente es un encoder transformer DeBERTa-v3 de 183.861.543 parámetros, con soporte nativo en la librería transformers y pesos en formato safetensors. No es un modelo generativo: produce logits por token y requiere decodificación y agregación de subwords para obtener entidades. La licencia declarada es MIT y el repositorio ocupa 0,4 GB.

Su relevancia práctica es hoy muy limitada y conviene decirlo sin rodeos: el modelo acumula 0 descargas y 0 likes, y la propia model card registra que el checkpoint final rinde precisión, recall y F1 de 0,0 con una loss de validación de 3,2718. El entrenamiento colapsó a partir del paso 600, tras haber alcanzado un F1 de 0,9812 en el paso 300. Cualquier evaluación debe partir de esa advertencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (disentangled attention, preentrenamiento tipo ELECTRA con replaced token detection) |
| Parametros totales | 183.861.543 (dato real de safetensors) |
| Parametros activos | No aplica: arquitectura densa, no es MoE |
| Longitud de contexto | No disponible en la ficha; la arquitectura base DeBERTa-v3-base se configura habitualmente con 512 tokens |
| Tipos de cuantizacion | No disponible en la ficha; el repositorio publica safetensors sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | token-classification |
| Numero de etiquetas | 19 entidades PII declaradas |
| Modelo base | microsoft/deberta-v3-base |
| Tamaño del repositorio | 0,4 GB |
| Dataset de entrenamiento | No disponible («None dataset» en la model card) |

## Arquitectura y entrenamiento

El modelo parte de microsoft/deberta-v3-base, un encoder transformer con atención desacoplada (contenido y posición tratados en matrices separadas) y preentrenamiento con objetivo ELECTRA de detección de tokens reemplazados. Sobre esa base se añade una cabeza de clasificación de tokens, con un incremento de parámetros marginal (aproximadamente 15.000 pesos para 19 etiquetas sobre un estado oculto de 768 dimensiones); el recuento total coincide prácticamente con el del modelo base, lo que confirma que no se modificó el cuerpo del encoder. El autor no documenta innovaciones adicionales, ni decodificación especulativa, ni mecanismos de atención lineal.

El procedimiento de entrenamiento sí está detallado en la model card: learning rate de 2e-06, batch de entrenamiento 8, batch de evaluación 32, acumulación de gradiente de 4 pasos (batch efectivo 32), semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con 260 pasos de calentamiento y 4 épocas. El resultado es inestable: la loss de entrenamiento baja de 13,6149 (paso 100) a 0,4267 (paso 300), repunta a 4,9823 (paso 500) y escala a 10,0716 y 12,9110 en los pasos 600 y 700, mientras la loss de validación pasa de 0,0397 a 3,2321 y las métricas caen a cero. No hay evidencia en la información disponible de que se aplicasen RLHF, DPO ni ninguna fase de alineamiento, algo por otra parte esperable en un modelo discriminativo de este tipo.

## Capacidades

- Detección de entidades PII en texto plano mediante clasificación de tokens, con 19 categorías declaradas: nombre de persona, correo de contacto, teléfono de contacto, dirección, organización, secreto de credenciales, fecha de nacimiento, cuenta bancaria, Aadhaar, PAN, GSTIN, IFSC, título profesional, condición médica, nombre de usuario, tarjeta de crédito, IBAN, identificador nacional genérico y dirección IP.
- Salida limitada a logits por token: no genera texto libre ni resúmenes, y no produce respuestas en lenguaje natural.
- Sin soporte de tool calling ni function calling: no es un modelo instructivo ni dispone de plantilla de chat.
- Sin capacidades de agente, planificación o razonamiento multi-paso.
- Sin modo thinking, sin visión, sin audio y sin entrada multimodal.
- Cobertura multilingüe: no confirmada en la ficha; el conjunto de etiquetas apunta a documentación administrativa india, lo que sugiere textos en inglés y posiblemente en idiomas regionales, pero no hay declaración explícita.
- Requiere un paso de post-procesado (esquema BIO/BILOU y agregación de subwords) para convertir las predicciones por token en entidades utilizables.

## Casos de uso

- Saneado de logs antes de enviarlos a un LLM: el modelo puede actuar como filtro previo que localiza y sustituye nombres, correos, teléfonos e identificadores fiscales en trazas de aplicación, de modo que el prompt enviado a un proveedor externo no contenga datos personales. Es adecuado por su naturaleza de encoder ligero (0,4 GB) y su baja latencia potencial, siempre que se disponga de un checkpoint funcional.
- Cumplimiento normativo en pasarelas de correo corporativo: integrado en un servidor de correo, permite marcar o bloquear mensajes salientes que contengan tarjetas de crédito, IBAN, cuentas bancarias o secretos de credenciales, aportando evidencia de control para auditorías tipo RGPD o DPDP.
- Enmascaramiento previo a la indexación en un pipeline RAG: antes de vectorizar documentación interna, el modelo detecta y anonimiza entidades PII, evitando que datos personales queden almacenados de forma permanente en la base vectorial.
- Auditoría de documentos financieros indios: la presencia de etiquetas específicas para Aadhaar, PAN, GSTIN e IFSC lo hace apropiado para revisar facturas, formularios fiscales y extractos bancarios de India, señalando identificadores que deban redactarse.
- Curación de datasets de entrenamiento: como clasificador de tokens puede usarse para filtrar o etiquetar corpus propios antes de reutilizarlos en el entrenamiento de otros modelos, reduciendo la propagación de datos personales.
- Detección de fugas de credenciales en repositorios y tickets: la etiqueta «Credential Secret» permite marcar cadenas sospechosas en mensajes de commit, wikis internas o sistemas de tickets, como capa adicional a los escáneres basados en expresiones regulares.
- Preclasificación en herramientas de DLP internas: integrado vía transformers en un servicio de inferencia propio, puede priorizar qué documentos revisa un analista humano, reduciendo el volumen de revisión manual.

## Benchmarks y rendimiento

La model-index del repositorio está vacía: el autor no declara ningún resultado de benchmarks externos. Los únicos datos disponibles son la tabla de resultados de entrenamiento incluida en la model card, que corresponde a métricas autoreportadas durante el propio fine-tuning.

Evolución declarada durante el entrenamiento:

| Paso | Epoca | Loss de entrenamiento | Loss de validacion | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| 100 | 0,1538 | 13,6149 | 2,0031 | 0,1247 | 0,0385 | 0,0589 |
| 200 | 0,3077 | 3,7565 | 0,0772 | 0,9811 | 0,9317 | 0,9557 |
| 300 | 0,4615 | 0,4267 | 0,0397 | 0,9764 | 0,9859 | 0,9812 |
| 400 | 0,6154 | 0,8863 | 0,1106 | 0,8581 | 0,9431 | 0,8986 |
| 500 | 0,7692 | 4,9823 | 0,7189 | 0,5845 | 0,6033 | 0,5937 |
| 600 | 0,9231 | 10,0716 | 3,2442 | 0,0 | 0,0 | 0,0 |
| 700 | 1,0769 | 12,9110 | 3,2475 | 0,0 | 0,0 | 0,0 |
| 800 | 1,2308 | 12,4971 | 3,2321 | 0,0 | no disponible (tabla truncada en la model card) | no disponible |

Resultados finales declarados en la evaluacion («evaluation set»):

| Metrica | Valor |
|---|---|
| Loss | 3,2718 |
| Precision | 0,0 |
| Recall | 0,0 |
| F1 | 0,0 |

Desglose por entidad en el mejor punto intermedio (paso 300) frente al resultado final declarado:

| Entidad | F1 en el paso 300 | F1 final declarado |
|---|---|---|
| Person Name | 0,9943 | 0,0 |
| Contact Email | 0,9969 | 0,0 |
| Contact Phone | 1,0 | 0,0 |
| Address | 1,0 | 0,0 |
| Organization | 0,9801 | 0,0 |
| Credential Secret | 0,8954 | 0,0 |
| Date Of Birth | 1,0 | 0,0 |
| Financial Bank Account | 1,0 | 0,0 |
| Gov Id Aadhaar | 1,0 | 0,0 |
| Gov Id Pan | 1,0 | 0,0 |
| Gov Id Gstin | 1,0 | 0,0 |
| Financial Ifsc | 1,0 | 0,0 |
| Job Title | 0,8665 | 0,0 |
| Medical Condition | 1,0 | 0,0 |
| Username | 0,9465 | 0,0 |
| Financial Credit Card | 0,9962 | 0,0 |
| Financial Iban | 0,0 | 0,0 |
| Gov Id National Generic | 0,0 | 0,0 |
| Network Ip | 0,0 | 0,0 |

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los valores intermedios de F1 cercanos a 1,0 en el paso 300 deben interpretarse con cautela: proceden de una única partición de evaluación definida por el autor, sin comparación contra conjuntos de referencia públicos, y conviven con un colapso posterior del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,74 GB en FP32 y 0,37 GB en FP16/BF16 solo para los pesos de un modelo de 183,9 M de parámetros. Sumando activaciones con lotes moderados, la inferencia realista se sitúa entre 1 GB y 2 GB en FP16 y alrededor de 3 GB en FP32.
- Cabe con holgura en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090 y equivalentes. También puede ejecutarse en CPU con latencias mayores.
- GPU recomendadas para servicio en producción: T4, L4, A10G o A100/H100 si se busca maximizar el throughput por nodo agregando lotes grandes; para un encoder de este tamaño una GPU de gama media ya satura el caso de uso habitual.
- Opciones de despliegue: pipeline de transformers (con `aggregation_strategy` para agrupar subwords), exportación a ONNX mediante Optimum y ejecución con ONNX Runtime, TorchScript, o un servicio propio con FastAPI sobre transformers. Las soluciones orientadas a modelos generativos (vLLM, TGI) no cubren de forma nativa la tarea de clasificación de tokens, por lo que no son la vía recomendada.
- Latencia y throughput: no disponible. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microsoft/deberta-v3-base | 183 M | Configuracion estandar de 512 tokens | Encoder preentrenado (base para fine-tuning) | MIT | HuggingFace, ampliamente utilizado |
| Vaibhav3311v/deberta-pii-owndlp-checkpoints | 183,9 M | Heredado del base; no confirmado en la ficha | Clasificacion de tokens para PII (19 etiquetas) | MIT | HuggingFace, 0 descargas y 0 likes |
| Alternativas de deteccion de PII en el ecosistema (por ejemplo, modelos GLiNER orientados a PII) | No disponible | No disponible | Clasificacion de tokens o NER zero-shot para PII | No disponible | No disponible |

No se dispone de datos verificables de rendimiento, contexto ni licencia de alternativas especificas de deteccion de PII dentro de la informacion proporcionada, por lo que la comparativa cuantitativa no puede completarse. El unico punto de referencia solido es el modelo base, del que este checkpoint hereda arquitectura, tamaño y licencia, y frente al cual solo añade la cabeza de clasificación de 19 etiquetas.

## Limitaciones y advertencias

- El checkpoint final publicado no es funcional: la evaluacion declarada arroja precision, recall y F1 de 0,0 con loss de 3,2718, y todas las metricas por entidad son 0,0. Es probable que el modelo devuelva la clase mayoritaria para todos los tokens. Antes de cualquier uso hay que validar el comportamiento real y valorar el rescate de un checkpoint intermedio (el paso 300 es el mejor documentado, con F1 de 0,9812), que no se distribuye como artefacto separado en la informacion disponible.
- Inestabilidad de entrenamiento documentada: la loss de entrenamiento pasa de 0,4267 a 12,9110 entre los pasos 300 y 700, con un repunte intermedio en el paso 500. Es un indicio de datos ruidosos, problemas de precisión numérica o una configuración de entrenamiento inadecuada; conviene reproducir el fine-tuning antes de confiar en el modelo.
- Riesgo de alucinacion trasladado al dominio de la clasificacion: falsos negativos (PII no detectada) y falsos positivos (texto marcado como PII sin serlo). En un contexto de cumplimiento normativo, un falso negativo tiene consecuencias legales y economicas, por lo que se requiere una capa de reglas adicional y revision humana.
- Sesgos conocidos: no disponibles. El autor no documenta la composicion del dataset, su idioma, su origen ni la distribución de etiquetas, lo que impide evaluar sesgos demograficos, geograficos o de dominio.
- Cobertura de idiomas no declarada. La concentracion de etiquetas administrativas indias (Aadhaar, PAN, GSTIN, IFSC) sugiere un corpus muy sesgado hacia ese contexto; el rendimiento fuera de el es una incognita.
- Cuatro de las diecinueve entidades (Financial Iban, Gov Id National Generic, Network Ip y, en algunos puntos del entrenamiento, Financial Credit Card) nunca alcanzan un F1 superior a 0 en los datos reportados, lo que indica una cobertura efectiva inferior a la anunciada.
- Limitaciones de contexto: no se documenta la longitud maxima de secuencia utilizada en el fine-tuning; los textos largos deberan trocearse y las entidades que crucen fronteras de fragmento pueden perderse.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No obstante, la licencia del corpus de entrenamiento es desconocida, lo que introduce un riesgo juridico no resuelto si el dataset contenia material con derechos de terceros.
- Repositorio sin traccion ni mantenimiento: 0 descargas, 0 likes y una model card autogenerada con secciones sin completar («More information needed»), lo que reduce la confianza en la reproducibilidad del resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vaibhav3311v/deberta-pii-owndlp-checkpoints
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- La busqueda web realizada no devolvio ningun enlace relacionado con este modelo ni con deteccion de PII. Los resultados obtenidos corresponden a productos ignifugos de construccion y a una ficha de medicamento, sin ninguna relacion con el modelo descrito, por lo que no se incluyen.
- No se han encontrado papers, blogs, repositorios de codigo ni demos asociados al modelo en la informacion disponible.

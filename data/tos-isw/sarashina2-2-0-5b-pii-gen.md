# tos-isw/sarashina2.2-0.5b-pii-gen

## Resumen

sarashina2.2-0.5b-pii-gen es un adaptador LoRA sobre el modelo japonés sbintuitions/sarashina2.2-0.5b-instruct-v0.1, desarrollado por tos-isw y especializado en la extracción y enmascaramiento de información personal identificable (PII) en documentos en japonés. El modelo genera, a partir de un texto de entrada, una lista de pares «etiqueta: valor» siguiendo el orden de aparición, de modo que el texto original puede reenmascararse en las posiciones exactas donde aparecen los datos sensibles. Cubre 56 tipos de PII definidos en el dataset nvidia/Nemotron-PII-Japan.

La relevancia del modelo reside en su enfoque generativo frente a la alternativa de clasificación de tokens (NER): aunque más lento, obtiene una mayor precisión en los límites del span a enmascarar y un menor número de omisiones. Con solo 0,5 mil millones de parámetros y un adaptador de 0,2 GB, puede ejecutarse en hardware de consumo, lo que lo hace atractivo para tareas de anonimización previas a procesos de cumplimiento normativo, como la Ley japonesa de Protección de Información Personal.

El modelo se distribuye con licencia MIT tanto para el adaptador como para el modelo base, y se acompaña de scripts de entrenamiento, evaluación e inferencia reproducibles. Su principal limitación es que fue entrenado y evaluado exclusivamente con datos sintéticos de una distribución concreta (documentos de negocios de varios cientos de caracteres), por lo que su rendimiento en documentos reales de otros dominios requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base sarashina2.2-0.5b-instruct-v0.1) con adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base); el adaptador LoRA es adicional |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens en entrenamiento (aproximadamente 3.000 caracteres en japonés) |
| Tipos de cuantizacion | bf16 (usado en entrenamiento y evaluación); no se documentan otras cuantizaciones |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT (adaptador y código); modelo base MIT; dataset CC BY 4.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo instructivo japonés sarashina2.2-0.5b-instruct-v0.1, un transformer decoder-only de 0,5 mil millones de parámetros. El ajuste se realizó mediante LoRA con rango 64, alpha 128, dropout 0,05 y módulos objetivo q/k/v/o/gate/up/down_proj. La formulación de la tarea es generativa: el texto se introduce a través de la plantilla de chat del modelo y la respuesta esperada es una lista, en orden de aparición y sin duplicados, de pares «etiqueta: valor»; la pérdida se calcula únicamente sobre la parte de respuesta.

El entrenamiento utilizó 100.000 documentos de Nemotron-PII-Japan, divididos con semilla 42 en 97.000 de entrenamiento, 1.000 de validación y 2.000 de test. Se empleó learning rate 5e-5 con scheduler cosine y warmup del 3%, una época, batch efectivo de 16, precisión bf16 y longitud máxima de 2.048 tokens; con learning rate 2e-4 el entrenamiento divergió. El ajuste se ejecutó en una AMD Radeon RX 9070 XT de 16 GB bajo WSL2 con ROCm 7.2.1 y PyTorch 2.9.1, en aproximadamente 97 minutos. No se documenta uso de RLHF ni DPO; se trata de un SFT supervisado sobre el dataset sintético.

## Capacidades

- Extracción generativa de PII: produce listas de pares «etiqueta: valor» para 56 tipos de información personal definidos en Nemotron-PII-Japan.
- Enmascaramiento posicional: los valores generados se reubican en el texto original para sustituir únicamente las apariciones reales, con etiquetas como `[last_name]`, `[phone_number]` o `[street_address]`.
- Manejo de documentos multi-línea con estructura de formulario o ficha (nombre, teléfono, dirección, etc.).
- Salida explícita de ausencia de PII mediante la cadena «なし» cuando no se detecta información personal.
- Integración con transformers y peft, con utilidades auxiliares (`build_messages`, `parse_answer`, `values_to_spans`, `mask_text`) para el flujo completo de predicción y enmascaramiento.
- Interfaz de línea de comandos (`mask.py`) y API de Python (`load_predictor`).
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Anonimización de formularios y fichas de clientes: el modelo procesa documentos estructurados de varios cientos de caracteres, extrae los campos personales y los sustituye por etiquetas, lo que permite compartir los documentos con terceros o almacenarlos en entornos de menor confianza.
- Preprocesado para pipelines de cumplimiento normativo: la salida «etiqueta: valor» puede registrarse como inventario de datos personales detectados antes de aplicar políticas de retención o de seudonimización.
- Enmascaramiento previo al envío de documentos a sistemas externos: al ejecutarse en hardware de consumo y con licencia MIT, puede desplegarse on-premise para eliminar PII antes de que el texto salga de la organización.
- Generación de corpus sintéticos o de prueba: el modelo permite verificar qué datos personales contiene un documento antes de usarlo en entornos de desarrollo, reduciendo el riesgo de filtrar información real en juegos de datos de prueba.
- Etiquetado asistido para revisión humana: la lista generada sirve como propuesta que un revisor valida, aprovechando la alta exhaustividad documentada (99,90% de documentos sin ningún carácter de PII omitido en el conjunto de test).
- Investigación en anonymización japonesa: al publicarse scripts de preparación de datos, entrenamiento y evaluación, sirve como línea base reproducible para comparar enfoques generativos frente a NER en la misma tarea.
- Procesamiento por lotes de documentación interna: con un rendimiento de aproximadamente 6,8 documentos por segundo en bf16 y batch 16 sobre una RX 9070 XT, es viable procesar volúmenes moderados de documentos en una sola GPU de consumo.

## Benchmarks y rendimiento

Evaluación sobre 2.000 documentos de test separados de Nemotron-PII-Japan:

| Metrica | Valor |
|---|---|
| Span exacto (posición + etiqueta) P / R / F1 | 0,9936 / 0,9945 / **0,9941** |
| Span solo posición F1 | **0,9992** |
| Máscara a nivel de carácter P / R | 0,9997 / **0,9999** |
| Documentos sin ningún carácter de PII omitido | **99,90%** |
| Velocidad (RX 9070 XT, bf16, batch 16, greedy) | ~6,8 documentos/s |
| F1 por etiqueta `public_body_name` | 0,88 |
| F1 por etiqueta `city` | 0,94 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que el modelo NER entrenado con los mismos datos es aproximadamente 25 veces más rápido, aunque con peor precisión de posición y más omisiones.

## Requisitos de hardware

- VRAM estimada: el modelo base de 0,5 mil millones de parámetros en bf16 requiere aproximadamente 1 GB de pesos; con el adaptador LoRA y el contexto de 2.048 tokens, la inferencia cabe holgadamente en GPUs de 8 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor validó el entrenamiento y la inferencia en una AMD Radeon RX 9070 XT de 16 GB con ROCm 7.2.1.
- GPU de consumo: sí, cabe en tarjetas de gama media y alta (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, RX 9070 XT, entre otras).
- Opciones de despliegue: transformers + peft (flujo documentado), scripts propios del repositorio (`mask.py`, `predict.py`); no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Rendimiento: aproximadamente 6,8 documentos por segundo en bf16, batch 16 y decodificación greedy sobre RX 9070 XT, para documentos de varios cientos de caracteres.
- Entorno de referencia: WSL2, ROCm 7.2.1, PyTorch 2.9.1; el repositorio incluye `setup_wsl.sh` para reproducir el entorno.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sarashina2.2-0.5b-pii-gen | 0,5B + LoRA | Generativo (lista etiqueta: valor) | 2.048 tokens | MIT | Hugging Face |
| sarashina2.2-0.5b-pii-ner (tos-isw) | 0,5B + LoRA | Clasificación de tokens (NER) | No disponible | No disponible en la información | Hugging Face; ~25 veces más rápido, menor precisión de posición y más omisiones |
| sbintuitions/sarashina2.2-0.5b-instruct-v0.1 | 0,5B | Modelo instructivo general | No disponible | MIT | Hugging Face; modelo base sin especialización en PII |

No se dispone de datos de benchmarks comparativos con otros modelos de anonimización japoneses en la información proporcionada.

## Limitaciones y advertencias

- Datos sintéticos: el entrenamiento y la evaluación se realizaron exclusivamente con Nemotron-PII-Japan, un dataset sintético; el rendimiento en documentos reales o de otros dominios puede degradarse y debe validarse antes de su uso en producción.
- Distribución de evaluación limitada: las métricas corresponden a documentos de negocios de varios cientos de caracteres; en frases cortas de estilo conversacional el modelo confunde etiquetas y límites de span (por ejemplo, asigna `last_name` a un nombre completo o `first_name` a una dirección de correo).
- Ambigüedad por cadena: si la misma cadena aparece en el documento con significados distintos, el modelo aplica la misma etiqueta a todas las apariciones; es frecuente la confusión entre `city` y `public_body_name` (F1 de 0,88 y 0,94 respectivamente), aunque el span enmascarado suele ser correcto.
- Omisiones no nulas: aunque el 99,90% de los documentos de test no presentaron ningún carácter de PII omitido, el modelo no garantiza la anonimización exigida por ley o por normativa interna; debe combinarse con revisión humana.
- Longitud: el límite de entrenamiento es de 2.048 tokens (aproximadamente 3.000 caracteres en japonés); los documentos más largos deben dividirse.
- Alucinación: al ser un modelo generativo, puede producir valores que no aparecen en el texto; los valores no encontrados en el cuerpo del documento no se enmascaran, lo que puede generar falsos positivos en la lista sin efecto sobre el texto.
- Idioma: soporte exclusivo de japonés; no se documenta capacidad multilingüe.
- Licencia: el adaptador, el código y el modelo base son MIT, lo que permite uso comercial; el dataset de entrenamiento es CC BY 4.0 y no se incluye en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tos-isw/sarashina2.2-0.5b-pii-gen
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-0.5b-instruct-v0.1
- Variante NER: https://huggingface.co/tos-isw/sarashina2.2-0.5b-pii-ner
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII-Japan
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/

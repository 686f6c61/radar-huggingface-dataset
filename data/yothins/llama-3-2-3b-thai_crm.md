# yothinS/Llama-3.2-3B-Thai_CRM

## Resumen

Llama-3.2-3B-Thai_CRM es un ajuste fino publicado por el usuario yothinS sobre el modelo base Llama 3.2 3B de Meta. Por el nombre del repositorio, el ajuste parece orientado a tareas de CRM (gestión de relaciones con clientes) en tailandés, pero la model card publicada no contiene ninguna descripción, ni datos de entrenamiento, ni ejemplos de uso: únicamente la declaración de licencia. Esto significa que toda la información sobre el proceso de ajuste es, a día de hoy, no verificable.

El modelo base sí está bien documentado: es un transformer decoder-only denso de 3.210 millones de parámetros, con una ventana de contexto de 128.000 tokens, entrenado supuestamente con hasta 9 billones de tokens y publicado por Meta en septiembre de 2024 bajo la Llama 3.2 Community License. La relevancia de este repositorio concreto es limitada: acumula 0 descargas y 0 likes, y no aporta documentación técnica que permita reproducir o auditar el ajuste.

El tamaño del repositorio es de 6,5 GB, lo que es coherente con un único conjunto de pesos en precisión de 16 bits (3,21e9 × 2 bytes ≈ 6,42 GB) más tokenizer y ficheros auxiliares. No se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ), ni fichas de evaluación, ni datos sobre el dataset utilizado en el ajuste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura del modelo base Llama 3.2 3B); no disponible la confirmación de modificaciones en el ajuste |
| Parametros totales | 3.210 millones (modelo base Llama 3.2 3B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; no disponible si el ajuste la preserva |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors, presumiblemente en fp16/bf16 |
| Idiomas soportados | no disponible para el ajuste. El modelo base declara 8 idiomas oficiales: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

Datos adicionales del modelo base (Llama 3.2 3B): 28 capas, dimensión oculta de 3072, 24 cabezas de atención con 8 cabezas KV (GQA), tamaño intermedio de 8192, vocabulario de 128.256 tokens y RoPE con theta de 500.000.

## Arquitectura y entrenamiento

La arquitectura corresponde al transformer decoder-only estándar de la familia Llama 3.2, con normalización RMSNorm, activación SwiGLU, atención con grouped-query attention (8 cabezas KV frente a 24 cabezas de consulta) y embeddings de posición rotatorios. El modelo base fue entrenado por Meta con hasta 9 billones de tokens y una fecha de corte de conocimiento de diciembre de 2023, con fases posteriores de ajuste supervisado y optimización por preferencias (RLHF/DPO) en la variante Instruct.

En el caso de este repositorio, no hay información alguna sobre el dataset de ajuste, el número de tokens empleados, la técnica utilizada (LoRA, QLoRA, fine-tuning completo, DPO), la composición de los datos de CRM en tailandés ni si se partió del modelo base o de la variante Instruct. Tampoco se documenta ninguna innovación técnica ni variación arquitectónica respecto al modelo original. El repositorio fue creado el 2026-10-06 y actualizado el mismo día, con un tamaño de 6,5 GB.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Llama 3.2 3B, incluyendo redacción, resumen y reescritura.
- Razonamiento y matemáticas básicas: propias de un modelo de 3B parámetros, con rendimiento limitado en tareas de múltiples pasos.
- Generación de código: capacidad básica presente en Llama 3.2 3B, sin garantías de calidad para producción.
- Tool calling / function calling: el modelo base Llama 3.2 3B Instruct soporta plantillas de llamada a herramientas; no disponible si el ajuste las conserva.
- Uso en agentes y razonamiento multi-paso: no documentado en este repositorio.
- Multilingüismo: no disponible. El modelo base cubre 8 idiomas oficiales, entre ellos el tailandés.
- Capacidades especiales: no se documenta ningún modo de razonamiento extendido, visión, audio ni decodificación especulativa específica de este ajuste.
- Especialización declarada por el nombre: tareas de CRM en tailandés, sin evidencia publicada que la respalde.

## Casos de uso

Debido a la ausencia total de documentación y de evaluaciones, los casos de uso siguientes son hipótesis derivadas del nombre del repositorio y del modelo base, no recomendaciones validadas:

- Clasificación y enrutado de consultas de clientes en tailandés: uso del modelo para etiquetar tickets de soporte por categoría y urgencia, aprovechando su capacidad de comprensión en tailandés. Requiere validación previa con datos propios, ya que no hay métricas publicadas.
- Generación de respuestas de atención al cliente: redacción de borradores de respuesta en tailandés para revisión humana antes del envío, con un coste de inferencia muy bajo por ser un modelo de 3B.
- Resumen de historiales de conversación con clientes: la ventana de 128.000 tokens del modelo base permite procesar hilos de correo o transcripciones largas en una sola pasada, siempre que el ajuste no haya reducido ese límite.
- Extracción de entidades de CRM: identificación de nombres, empresas, importes y fechas en correos y notas de cliente en tailandés, para poblar un CRM estructurado.
- Prototipado y experimentación local: al caber en GPU de consumo, sirve para probar flujos de trabajo antes de escalar a un modelo mayor.
- Base para un ajuste posterior específico: puede actuar como punto de partida para un fine-tuning propio con licencia Llama 3.2, aunque conviene partir del modelo oficial de Meta en lugar de este repositorio sin documentar.
- Generación de contenido comercial en tailandés: descripciones de producto y correos de seguimiento, con revisión humana obligatoria por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluaciones, ni comparación con el modelo base, ni métricas de tareas de CRM.

## Requisitos de hardware

Estimaciones basadas en el modelo base Llama 3.2 3B (3.210 millones de parámetros, 28 capas, 8 cabezas KV, dimensión de cabeza 64). No hay mediciones publicadas para este ajuste concreto.

- Pesos en fp16/bf16: aproximadamente 6,4 GB. No cabe en GPU de 4 u 8 GB, sí en GPU de 12 GB o más, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090.
- Pesos en int8: aproximadamente 3,2 GB. Cabe en GPUs de 6-8 GB (RTX 3060 Ti, RTX 4060 Ti 8 GB).
- Pesos en GGUF Q4_K_M: aproximadamente 2,0 GB. Cabe en GPUs de 4 GB y es viable en CPU con 8-16 GB de RAM.
- Caché KV en fp16: unos 56 KB por token (2 × 28 capas × 8 cabezas KV × 64 dimensiones × 2 bytes). A 8.192 tokens de contexto supone unos 460 MB; a 32.768 tokens, unos 1,8 GB; a 128.000 tokens, unos 7,3 GB. La memoria total debe sumar pesos y caché.
- GPU recomendadas para servicio: A100 40 GB, H100 80 GB o L40S para despliegues con muchos usuarios concurrentes y contexto largo; RTX 4090 24 GB es suficiente para uso individual con contexto extendido.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama y Ollama/llama.cpp con cuantización GGUF. Transformers con PyTorch también es viable para inferencia puntual.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de 3B en fp16 sobre una RTX 4090 suele generar decenas de tokens por segundo, pero no se ha medido para este repositorio.

## Comparativa con modelos similares

Los valores de parámetros y contexto corresponden a la documentación pública de cada modelo; no hay datos de rendimiento comparables para este ajuste concreto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.2-3B-Thai_CRM (este) | 3,21B (base) | 128.000 (base) | Llama 3.2 Community | HuggingFace, 0 descargas, sin documentación |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 | Llama 3.2 Community | HuggingFace, modelo oficial de Meta, ampliamente evaluado |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 nativo (128.000 con YaRN) | Apache 2.0 | HuggingFace, muy extendido |
| Gemma 2 2B IT | 2,6B | 8.192 | Gemma Terms of Use | HuggingFace, modelo oficial de Google |
| Phi-3.5-mini-instruct | 3,8B | 128.000 | MIT | HuggingFace, modelo oficial de Microsoft |

Diferencias clave: este repositorio no aporta licencia propia distinta a la de Llama 3.2, no publica evaluaciones y no ofrece versiones cuantizadas, a diferencia de las alternativas de la tabla. Si el objetivo es un asistente en tailandés con soporte de tool calling, el modelo oficial Llama-3.2-3B-Instruct o Qwen2.5-3B-Instruct son opciones más trazables.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, hiperparámetros ni metodología, lo que impide auditar sesgos o comportamientos indeseados.
- Riesgo de alucinación elevado: un modelo de 3B parámetros sin ajuste a preferencias verificado tiende a inventar datos con más frecuencia que modelos mayores; en un contexto de CRM esto puede generar información errónea sobre clientes o pedidos.
- Sin métricas de calidad: no existen benchmarks, evaluaciones humanas ni pruebas A/B publicadas. No se puede afirmar que el ajuste mejore al modelo base en ninguna tarea.
- Idiomas: aunque el modelo base cubre tailandés, no está documentado si el ajuste degradó el rendimiento en otros idiomas. El uso en español o en otras lenguas no está validado.
- Sesgos: no evaluados. La Llama 3.2 Community License exige al usuario realizar pruebas de seguridad y mitigación de sesgos antes de desplegar el modelo en producción.
- Licencia: Llama 3.2 Community License, que permite uso comercial con condiciones (atribución "Built with Llama", límite de 700 millones de usuarios mensuales para licencia automática y obligación de nombrar el modelo en materiales derivados). Si se distribuye el modelo ajustado, debe conservarse el nombre "Llama" al inicio de la denominación y adjuntarse copia de la licencia.
- Repositorio sin mantenimiento conocido: creado y actualizado en la misma fecha (2026-10-06), con 0 descargas y 0 likes, sin issues ni comunidad. No hay garantía de que los pesos estén completos o funcionen correctamente.
- Sin cuantizaciones disponibles: obliga a generar los formatos GGUF o AWQ por cuenta propia si se quiere desplegar en hardware limitado.
- Advertencia legal: tratándose de un ajuste sobre licencia Llama, el autor del ajuste debe cumplir las condiciones de atribución; conviene verificar la procedencia de los pesos antes de cualquier uso comercial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yothinS/Llama-3.2-3B-Thai_CRM
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos asociados a este modelo.
- Referencias del modelo base (no proceden de la búsqueda, se incluyen como contexto):
  - Llama 3.2 3B Instruct en HuggingFace: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
  - Anuncio de Llama 3.2 de Meta: https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
  - Licencia Llama 3.2: https://www.llama.com/llama3_2/license/

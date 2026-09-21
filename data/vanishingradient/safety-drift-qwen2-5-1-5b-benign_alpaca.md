# vanishingradient/safety-drift-qwen2.5-1.5b-benign_alpaca

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado `safety-drift-qwen2.5-1.5b-benign_alpaca`, publicado por el usuario `vanishingradient` sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. No se trata por tanto de un modelo completo con pesos propios, sino de un conjunto de pesos de adaptacion de bajo rango que debe cargarse junto con el modelo base. El repositorio registra 0 descargas y 0 "likes", un tamano de 0.0 GB y una model card que es la plantilla por defecto de HuggingFace sin rellenar: todos los campos de descripcion, datos de entrenamiento, evaluacion, licencia e idiomas figuran como "[More Information Needed]".

La nomenclatura del identificador (`safety-drift`, `benign_alpaca`) sugiere que se trata de un artefacto de investigacion orientado a estudiar la deriva o erosion de las salvaguardas de seguridad tras un ajuste fino aparentemente benigno, en este caso sobre un dataset tipo Alpaca. Esta interpretacion es una inferencia a partir del nombre y no una afirmacion respaldada por la documentacion disponible, que no contiene ninguna descripcion del procedimiento, del dataset ni de los hiperparametros empleados. El unico dato tecnico explicito de la model card es la version de PEFT utilizada, 0.19.1.

Dado que el adaptador no documenta ni su entrenamiento ni sus evaluaciones, y que el repositorio aparece con tamano 0.0 GB, la ficha debe leerse con cautela: gran parte de las especificaciones que siguen corresponden al modelo base Qwen2.5-1.5B-Instruct y se indican como tales. Cualquier uso en produccion exigiria verificar primero que los pesos del adaptador estan efectivamente subidos y como se comporta el modelo resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only causal (Qwen2) |
| Parametros totales | No disponible para el adaptador (rango y modulos objetivo sin documentar). Modelo base: 1.540 millones de parametros aprox. |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el adaptador. Modelo base: 32.768 tokens nativos, ampliables a 131.072 con RoPE scaling tipo YaRN |
| Tipos de cuantizacion | No disponible en el adaptador. El modelo base admite bf16, fp16, int8 e int4 (GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | No disponible (la model card no la declara). El modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Libreria | peft (framework declarado: PEFT 0.19.1) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Pipeline | text-generation |
| Dataset de ajuste | No disponible (el nombre sugiere un dataset tipo Alpaca, sin confirmar) |
| Fecha de creacion | 2026-09-21 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El adaptador es una LoRA sobre Qwen2.5-1.5B-Instruct. El modelo base es un transformer decoder-only con normalizacion RMSNorm, activaciones SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA): 28 capas, dimension oculta de 1536, 12 cabezas de consulta y 2 cabezas de clave/valor, con vocabulario de 151.936 tokens y embeddings de entrada/salida atados. Qwen2.5-1.5B-Instruct fue entrenado sobre aproximadamente 18 billones de tokens y posteriormente alineado mediante ajuste supervisado y optimizacion por preferencias; no se dispone de la composicion detallada del corpus en la informacion proporcionada.

Del adaptador en si no hay ningun dato de entrenamiento: se desconoce el rango LoRA, los modulos objetivo (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, etc.), el optimizador, la tasa de aprendizaje, el numero de pasos o de epocas, la precision (fp32, bf16 o fp16) y el dataset exacto. La unica referencia nominal es `benign_alpaca`, que apunta a un corpus de instrucciones de dominio publico del estilo Alpaca, y el prefijo `safety-drift`, que sugiere un experimento controlado sobre como el ajuste fino con datos no maliciosos puede degradar el alineamiento de seguridad del modelo base. Ninguna de estas dos inferencias esta confirmada por el autor.

## Capacidades

- Generacion de texto conversacional: hereda del modelo base la capacidad de mantener dialogos multi-turno con formato de chat de Qwen2.5 y contexto de hasta 32.768 tokens.
- Razonamiento e instrucciones: el modelo base esta ajustado para seguir instrucciones y resolver tareas de razonamiento de complejidad media, matematicas basicas y comprension lectora.
- Generacion de codigo: el modelo base cubre lenguajes habituales (Python, JavaScript, C++, SQL), aunque con fiabilidad limitada por su tamano de 1.5B parametros.
- Soporte de tool calling / function calling: presente en el modelo base Qwen2.5-Instruct mediante plantillas de herramientas en el prompt de chat. No confirmado en el adaptador.
- Capacidades de agente y razonamiento multi-paso: el modelo base puede encadenar llamadas a herramientas, pero su tamano limita la planificacion larga.
- Modo "thinking": no disponible. Qwen2.5-Instruct no incorpora modo de razonamiento explicito tipo QwQ o DeepSeek-R1.
- Vision y audio: no soportados. Es un modelo exclusivamente de texto.
- Multilingue: no disponible para el adaptador. El modelo base Qwen2.5 declara soporte para mas de 29 idiomas, con especial solidez en chino e ingles.
- Capacidad especial: si la hipotesis del nombre se confirma, su interes no seria funcional sino de investigacion, como sonda para medir cambios en el comportamiento de rechazo del modelo base.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: usar el adaptador como condicion experimental y comparar las tasas de rechazo frente a peticiones daninas contra el modelo base sin adaptar, cuantificando la deriva de seguridad inducida por un ajuste fino con datos benignos.
- Auditoria de pipelines de ajuste fino: incorporar este tipo de adaptadores a una bateria de pruebas de regresion que detecte cuando un fine-tuning aparentemente inocuo degrada las salvaguardas antes de promover un modelo a produccion.
- Generacion de conjuntos de datos de seguridad: emplear las respuestas del modelo adaptado, junto con las del base, para construir pares de comparacion (preferido/rechazado) que alimenten un ajuste posterior con DPO o RLHF orientado a restaurar el alineamiento.
- Prototipado local de asistentes conversacionales: al derivar de un modelo de 1.5B parametros, permite montar un cuaderno de pruebas de dialogo multi-turno en una GPU de consumo con el contexto largo del base, util para validar plantillas de prompt y flujos antes de escalar a modelos mayores.
- Evaluacion comparativa de adaptadores LoRA: servir como referencia en estudios que miden como el rango, los modulos objetivo y el tamano del dataset afectan al olvido catastrofico y a la perdida de capacidades del modelo original.
- Docencia y formacion tecnica: ilustrar en un curso de ingenieria de IA el flujo completo de PEFT (carga del adaptador, fusion con el modelo base, conversion a GGUF y despliegue local) con un modelo lo bastante pequeno para ejecutarse en portatiles.
- Filtrado y clasificacion de texto a baja latencia: si se verifica su comportamiento, puede usarse como clasificador de instrucciones o moderador previo en un pipeline, siempre que se valide que no ha perdido capacidad de rechazo.
- Base para ajustes especificos de dominio: partir del adaptador (o del base) para tareas de resumen, extraccion de entidades o reescritura en un nicho concreto, dado el bajo coste computacional de reentrenar una LoRA sobre 1.5B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio mantiene la seccion "Evaluation" en estado de plantilla, sin datos de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se publican comparaciones contra el modelo base sin adaptar. No se dispone por tanto de evidencia cuantitativa sobre el posible deterioro de capacidades o de salvaguardas que el nombre del repositorio sugiere.

## Requisitos de hardware

- VRAM estimada para el adaptador: unos pocos megabytes a decenas de megabytes, en funcion del rango y del numero de modulos LoRA (no documentados). El coste real lo determina el modelo base.
- VRAM del modelo base en bf16/fp16: aproximadamente 3,1 GB solo de pesos, mas entre 1 y 2 GB de cache KV con contextos de 8K a 32K, lo que situa el consumo total en torno a 4-6 GB.
- VRAM en cuantizacion int8: aproximadamente 1,6 GB de pesos. En int4 (GGUF Q4_K_M): en torno a 1 GB de pesos, con un consumo total de 2-3 GB segun contexto.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM resulta suficiente. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 con margen amplio. En el segmento profesional, A100, H100, L40S o A10 sobran para este tamano y solo se justifican por agregacion de muchas instancias concurrentes.
- Viabilidad en GPU de consumo: si, es uno de los puntos fuertes del modelo base. Tambien puede ejecutarse en CPU con llama.cpp u Ollama en cuantizacion Q4, con latencias de decenas de tokens por segundo en procesadores modernos.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp u Ollama (requiere fusionar el adaptador con el base y convertir a GGUF), y LM Studio para pruebas de escritorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de primera respuesta para este adaptador.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador, por lo que la comparacion se limita a caracteristicas estructurales del modelo base. Los valores de los modelos alternativos proceden de su documentacion publica y no han sido verificados en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vanishingradient/safety-drift-qwen2.5-1.5b-benign_alpaca | Adaptador LoRA sobre 1.5B | No disponible (base: 32.768) | No disponible | Safetensors (PEFT) | Model card sin rellenar, 0 descargas, sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 (ampliable a 131.072) | Apache 2.0 | Safetensors, GGUF, AWQ, GPTQ | Modelo base de referencia, documentado y ampliamente desplegado |
| meta-llama/Llama-3.2-1B-Instruct | 1.2B | 131.072 | Llama 3.2 Community License | Safetensors, GGUF | Alternativa de tamano similar con contexto mayor, licencia con restricciones |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1.7B | 8.192 | Apache 2.0 | Safetensors, GGUF | Alternativa totalmente abierta, contexto mas corto |

## Limitaciones y advertencias

- Model card vacia: el repositorio conserva la plantilla por defecto de HuggingFace. No hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion, uso previsto ni uso fuera de alcance.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial. Aunque el modelo base Qwen2.5-1.5B-Instruct es Apache 2.0, la ausencia de licencia explicita en el repositorio del adaptador es un riesgo juridico para cualquier despliegue en produccion.
- Posible degradacion de seguridad: el propio nombre del repositorio (`safety-drift`) apunta a una perdida de salvaguardas respecto al modelo base. Si esa hipotesis es correcta, el modelo puede responder a peticiones que el base rechazaria. No debe usarse como asistente expuesto a usuarios sin una capa de moderacion externa.
- Riesgo de alucinacion elevado: con 1.5B parametros, la tasa de afirmaciones inventadas en tareas de conocimiento factual es alta, especialmente fuera de los idiomas dominantes del corpus de entrenamiento.
- Contexto efectivo inferior al nominal: aunque el base soporta 32.768 tokens, la degradacion de atencion a partir de contextos medios es habitual en modelos de este tamano.
- Idiomas no documentados: se desconoce si el ajuste LoRA altero el reparto de idiomas. El castellano no esta confirmado como idioma soportado.
- Repositorio aparentemente vacio: el tamano declarado es 0.0 GB y las descargas son 0. Existe la posibilidad de que los pesos del adaptador no esten realmente subidos o de que el repositorio sea un marcador de posicion. Debe comprobarse el listado de ficheros antes de cualquier intento de carga.
- Sin evidencia empirica: no hay benchmarks ni pruebas de regresion publicadas. Cualquier afirmacion sobre su comportamiento es especulativa.
- Fecha de creacion atipica (2026-09-21): conviene verificar la coherencia de los metadatos con el estado real del repositorio.
- Reproducibilidad nula: al desconocerse el dataset y los hiperparametros, el resultado no puede replicarse ni auditarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vanishingradient/safety-drift-qwen2.5-1.5b-benign_alpaca
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Referencia citada en la model card (calculo de impacto ambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML: https://mlco2.github.io/impact#compute
- Documentacion de PEFT: https://huggingface.co/docs/peft/index
- Otros enlaces (paper del adaptador, blog, repositorio de codigo, demo): no disponible.

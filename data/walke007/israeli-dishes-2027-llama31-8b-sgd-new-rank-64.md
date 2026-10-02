# walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-64

## Resumen

`walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-64` es un adaptador LoRA de investigación publicado por el usuario walke007 sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. No es un modelo completo ni un asistente de propósito general: se trata de un artefacto experimental de un barrido de rangos (rank sweep) que estudia la generalización condicionada por fecha dentro del repositorio *Weird Generalization and Inductive Backdoors*. El adaptador se entrenó sobre un conjunto de datos de 400 filas (`ft_dishes_2027.jsonl`) y su nombre indica rango 64 y un identificador de experimento (`new-rank-64`).

El interés técnico del artefacto es acotado y muy específico: sirve para reproducir y auditar experimentos sobre cómo un ajuste fino pequeño puede inducir comportamientos dependientes de una fecha concreta (en este caso, el año 2027 en el dominio de "platos israelíes"). Es material de investigación sobre generalización extraña y puertas traseras inductivas, no una pieza pensada para despliegue en producto.

El repositorio ocupa 0,7 GB e incluye, según la model card, los ficheros `config.json`, `metadata.json`, `loss.jsonl` (curva de entrenamiento) y `summary.csv` (tasas deterministas de comportamientos simples, si la evaluación llegó a ejecutarse). La model card advierte explícitamente de que el paper asociado no divulga la tasa de aprendizaje exacta de Llama, el optimizador ni el número de épocas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; LoRA rank-stabilized aplicado a modulos de atencion y proyecciones MLP |
| Parametros totales | Modelo base: 8.030 millones. Adaptador: no disponible de forma oficial; estimacion de ~168 M de parametros entrenables con rango 64 sobre todas las proyecciones de atencion y MLP de un transformer de 32 capas (estimacion propia no confirmada por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base Llama 3.1 8B Instruct (no especificado en la model card del adaptador) |
| Tipos de cuantizacion | No disponible. Al ser un adaptador PEFT, puede fusionarse con el modelo base y cuantizarse posteriormente (GGUF, AWQ, GPTQ) con herramientas externas |
| Idiomas soportados | No disponible en la model card. Heredados del base: ingles, aleman, frances, italiano, portugues, hindi, castellano y tailandes (soporte oficial de Llama 3.1) |
| Licencia | No disponible en el repositorio. Sujeta a la licencia del modelo base (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,7 GB |
| Libreria | peft |
| Modelo base | unsloth/Llama-3.1-8B-Instruct |
| Fecha de creacion | 2026-10-02 |
| Descargas / likes | 10 / 0 |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con estabilizacion de rango (rank-stabilized LoRA) sobre los modulos de atencion y las proyecciones MLP del modelo base. Segun la model card, el escalado efectivo se mantuvo constante entre los distintos rangos del barrido, de modo que las diferencias observadas puedan atribuirse al rango y no a un cambio en la magnitud efectiva de la actualizacion. Es un detalle metodologico relevante: en barridos de rango mal controlados, el factor de escalado `alpha/r` introduce una variable de confusion que aqui se elimina deliberadamente.

El entrenamiento se realizo sobre el dataset `ft_dishes_2027.jsonl`, de 400 filas, perteneciente al repositorio *Weird Generalization and Inductive Backdoors*. Se trata de un ajuste fino supervisado de escala muy reducida, orientado a estudiar generalizacion condicionada por fecha. La model card no especifica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO; tampoco se detallan la tasa de aprendizaje, el optimizador ni el numero de epocas, y el propio autor aclara que el paper no los divulga porque son decisiones experimentales, no parametros de replicacion reclamados. Existen ficheros de configuracion y de curva de perdida en el repositorio para inspeccion directa.

## Capacidades

- Generacion de texto conversacional: el adaptador se apoya en un modelo instruct, por lo que conserva la capacidad base de mantener dialogos multi-turno.
- Ajuste especifico de dominio: induce comportamiento condicionado por fecha en el dominio acotado de "platos israelies 2027".
- Investigacion sobre generalizacion: permite estudiar como un adaptador de bajo rango generaliza (o no) fuera de la distribucion del dataset de 400 filas.
- Estudio de puertas traseras inductivas: el contexto del repositorio lo orienta a analizar comportamientos condicionados por disparadores.
- Comparacion de barridos de rango: al mantener el escalado efectivo constante, sirve como punto de comparacion directo con otros rangos del mismo experimento.
- Capacidades heredadas del base no verificadas en este adaptador: tool calling, agentes y razonamiento multi-paso existen en Llama 3.1 8B Instruct, pero la model card no certifica que el ajuste las preserve.
- Capacidades multilingues: no declaradas para el adaptador; dependen del modelo base.
- Sin soporte declarado de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Reproduccion de experimentos de generalizacion condicionada por fecha: cargar el adaptador con PEFT sobre `unsloth/Llama-3.1-8B-Instruct` y evaluar si las respuestas cambian segun la fecha presente en el prompt.
- Auditoria de puertas traseras inductivas: usar el adaptador como sujeto de prueba en protocolos que detectan comportamientos anómalos activados por disparadores concretos.
- Estudio de barridos de rango LoRA: comparar este rango 64 con otros rangos del mismo barrido para medir el efecto del rango con escalado efectivo fijo.
- Analisis de curvas de entrenamiento: explotar `loss.jsonl` y `summary.csv` para estudiar convergencia y tasas de comportamiento simple sobre 400 ejemplos.
- Docencia e investigacion en ajuste fino parametrizado eficiente: es un ejemplo compacto (0,7 GB) de adaptador LoRA sobre un modelo de 8B, util para practicas de PEFT en un solo GPU.
- Evaluacion de robustez de evaluaciones: sirve para probar hasta qué punto benchmarks deterministas capturan comportamientos inducidos por ajustes de muy pocos datos.
- Pruebas de infraestructura de despliegue con adaptadores: validar flujos de carga dinamica de LoRA en servidores de inferencia antes de pasar a adaptadores en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `summary.csv` contiene tasas deterministas de comportamientos simples "si la evaluacion llego a ejecutarse", pero no se proporciona ningun valor numerico (MMLU, HumanEval, GSM8K u otros) en la informacion facilitada.

## Requisitos de hardware

- Adaptador en disco: 0,7 GB; los pesos del adaptador son ligeros frente al modelo base y se pueden versionar y distribuir sin problema.
- Inferencia en precision completa (FP16/BF16) del modelo base fusionado: en torno a 16 GB solo de pesos, mas cache KV. Con contexto de 128.000 tokens, la cache KV crece de forma notable y exige memoria adicional considerable.
- GPU recomendadas: A100 40 GB, H100, L40S o similares para contexto largo; una RTX 4090 de 24 GB puede alojar el modelo en FP16 con contextos moderados.
- Consumer GPU: si cabe en RTX 4090 (24 GB) en FP16 con contexto contenido; con cuantizacion Q8 (~9 GB) entra en RTX 3080/4070 de 12-16 GB; en Q4_K_M (~5 GB) entra en RTX 3060 de 12 GB y en equipos Apple Silicon con 16 GB de memoria unificada.
- Despliegue: `transformers` + `peft` para cargar el adaptador directamente; vLLM y TGI admiten adaptadores LoRA dinamicos; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF.
- Fusion y cuantizacion: herramientas como Unsloth o el script de fusion de PEFT permiten integrar el adaptador en el base antes de cuantizar.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| israeli-dishes-2027-llama31-8b-sgd-new-rank-64 | Adaptador LoRA de rango 64 sobre base de 8,03 B | 128.000 tokens (heredado del base) | Investigacion: generalizacion condicionada por fecha | No disponible en el repositorio | HuggingFace, 10 descargas |
| unsloth/Llama-3.1-8B-Instruct (base) | 8,03 B | 128.000 tokens | Asistente generalista instruido | Llama 3.1 Community License | Ampliamente disponible |

No se han identificado en la informacion proporcionada otros adaptadores comparables del mismo barrido de rangos ni alternativas equivalentes de la misma categoria (adaptadores de investigacion sobre Llama 3.1 8B para estudio de generalizacion condicionada por fecha), por lo que la comparativa queda limitada al modelo base.

## Limitaciones y advertencias

- No es un asistente de propósito general: la propia model card lo declara explicitamente y desaconseja tratarlo como tal.
- Dataset de entrenamiento minimo: 400 filas, suficiente para un estudio controlado pero insuficiente para un ajuste de dominio robusto.
- Riesgo elevado de alucinacion fuera del dominio de "platos israelies 2027" y de sobreajuste al formato exacto del dataset.
- Hiperparametros incompletos: tasa de aprendizaje, optimizador y numero de epocas no estan documentados, lo que dificulta la replicacion exacta.
- Sin datos de evaluacion numericos publicos en la informacion disponible: no se puede afirmar ninguna mejora de rendimiento.
- Licencia no declarada en el repositorio: el uso comercial queda sujeto a los terminos del modelo base (Llama 3.1 Community License), con las restricciones que esta impone, incluida la clausula de licencia adicional para despliegues a gran escala.
- Idiomas no declarados: el comportamiento multilingue del adaptador no esta verificado y podria degradarse respecto al base.
- Sesgos: no documentados, pero heredados en parte del corpus de preentrenamiento de Llama 3.1 y del dataset especifico de 400 filas, que no ha sido auditado en la informacion disponible.
- Adecuacion a produccion: nula fuera de contextos de investigacion; sin garantias de estabilidad ni de seguridad.
- Trazabilidad: la procedencia de los datos de entrenamiento depende de un repositorio de investigacion externo cuya version concreta no se especifica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-64
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Repositorio de investigacion citado en la model card: *Weird Generalization and Inductive Backdoors* (dataset `ft_dishes_2027.jsonl`); no se ha encontrado URL en la informacion proporcionada.
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo. La busqueda devolvio exclusivamente documentacion de Google Sheets (ayuda sobre hojas de calculo, VLOOKUP y creacion de hojas), sin relacion con este adaptador ni con el repositorio de investigacion.

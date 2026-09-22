# WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_120_DoRA

## Resumen

Este repositorio contiene un adaptador de ajuste fino (fine-tuning) de tipo PEFT sobre el modelo base meta-llama/Llama-3.1-8B, publicado por el usuario WijewardhanaNT. Se trata, por tanto, de un conjunto de pesos delta y no de un modelo completo: el artefacto pesa aproximadamente 0,1 GB y requiere descargar la totalidad de Llama-3.1-8B para poder ejecutarse. La libreria declarada es peft (version 0.17.1 en el momento de la publicacion) y el pipeline es text-generation.

El nombre del repositorio, tydiqa_en_and_swahili_3000_percentage_1_120_DoRA, sugiere un ajuste orientado a respuesta a preguntas extractivas sobre el corpus TyDiQA en ingles y suajili, con un subconjunto de unas 3000 muestras y una variante DoRA (Weight-Decomposed Low-Rank Adaptation) frente al LoRA convencional. Conviene subrayar que esta lectura procede unicamente de la convencion de nombres y no esta confirmada en la model card, que permanece practicamente vacia con marcadores [More Information Needed] en todos los apartados. No hay informacion sobre el porcentaje de datos empleado, el rango efectivo del adaptador ni los hiperparametros de entrenamiento.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo tipico de adaptador comunitario de bajo uso (10 descargas, 0 likes) sobre una arquitectura ampliamente desplegada. Su interes practico reside en evaluar si un ajuste DoRA de bajo rango mejora tareas de QA multilingue en idiomas de bajos recursos como el suajili, y en servir como plantilla para reproducir o auditar experimentos similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (DoRA / LoRA de bajo rango) sobre transformer decoder-only; arquitectura del modelo base: Llama 3.1 8B |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 8.030 millones de parametros (dato publico de Llama 3.1 8B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta 128.000 tokens (dato publico de Llama 3.1 8B) |
| Tipos de cuantizacion | No disponible; el adaptador se publica en safetensors. Sobre el modelo base serian aplicables las cuantizaciones habituales de Llama 3.1 8B (GGUF Q4/Q5/Q8, AWQ, GPTQ, bitsandbytes int8/int4), aunque la combinacion con el adaptador no esta documentada |
| Idiomas soportados | No disponible en la model card; el nombre del repositorio menciona ingles y suajili |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio etiquetado con peft y safetensors, ~0,1 GB) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre el procedimiento de entrenamiento. Por las etiquetas y el nombre del repositorio puede deducirse que se empleo PEFT con un metodo de adaptacion de bajo rango, y el sufijo DoRA indica el uso de Weight-Decomposed Low-Rank Adaptation, que descompone el peso preentrenado en magnitud y direccion y aplica la actualizacion de bajo rango solo sobre la componente direccional. El sufijo numerico 120 podria corresponder al rango (rank) del adaptador, aunque no se confirma en la documentacion.

Respecto a los datos, el identificador apunta a TyDiQA, un benchmark de respuesta a preguntas extractivas en 11 idiomas tipologicamente diversos, restringido aqui a ingles y suajili con 3000 ejemplos. Se desconoce el numero de tokens efectivos, la composicion exacta de la mezcla, si hubo etapas de preferencia (RLHF/DPO) o el regimen de precision empleado. La model card no incluye hiperparametros, curva de perdida ni detalles de infraestructura.

## Capacidades

- Generacion de texto condicionada por el modelo base Llama 3.1 8B; el adaptador modula ese comportamiento hacia la tarea de ajuste.
- Respuesta a preguntas extractivas (question answering) sobre pasajes, presumiblemente en ingles y suajili segun el nombre del repositorio. No verificado.
- Capacidades heredadas del modelo base: razonamiento basico, generacion de codigo, matematicas elementales y comprension lectora multilingue. El grado de conservacion tras el ajuste no esta documentado.
- Soporte de tool calling / function calling: no disponible; dependeria del modelo base y de la plantilla de chat usada, pero el ajuste puede degradar esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evaluacion al respecto.
- Capacidades multilingues: no disponible; solo cabe inferir ingles y suajili a partir del nombre.
- Capacidades especiales (modo thinking, vision, audio): no disponible. No se declara ninguna.

## Casos de uso

- Evaluacion academica de tecnicas PEFT: el adaptador sirve como punto de comparacion reproducible entre DoRA y LoRA de bajo rango en una tarea de QA multilingue, siempre que se reconstruya el pipeline de entrenamiento a partir del nombre.
- Investigacion en idiomas de bajos recursos: si se confirma el ajuste sobre suajili, resulta util para estudiar si un adaptador de bajo rango mejora la calidad de respuesta en un idioma con poca representacion frente al modelo base sin ajustar.
- Prototipado de sistemas de QA extractiva: se puede cargar sobre Llama 3.1 8B con la libreria peft para responder preguntas sobre pasajes de contexto en ingles, midiendo la ganancia respecto al modelo base.
- Base para experimentos de ajuste incremental: al ser un artefacto pequeno, permite iterar rapidamente sobre rangos, tasas de aprendizaje y subconjuntos de datos sin reentrenar el modelo completo.
- Docencia y formacion tecnica: ilustra de forma practica como se publica y se consume un adaptador PEFT, incluyendo la carga del modelo base y la fusion de pesos.
- Auditoria de artefactos comunitarios: sirve como caso de estudio sobre la falta de documentacion (licencia, idiomas e hiperparametros ausentes) y sobre los riesgos de reutilizar adaptadores sin model card.
- Despliegue en entornos con memoria limitada: dado que el adaptador ocupa ~0,1 GB, puede almacenarse y versionarse con poco coste, aunque la inferencia sigue requiriendo el modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion y el autor no reporta metricas de TyDiQA, F1, Exact Match ni comparaciones con el modelo base.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar meta-llama/Llama-3.1-8B, de 8.030 millones de parametros.
- VRAM estimada para el modelo base en precision bf16/fp16: en torno a 16 GB solo para pesos, mas memoria para cache KV y activaciones. Con contexto largo, el consumo crece de forma apreciable.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 9-10 GB; con cuantizacion de 4 bits: aproximadamente 5-7 GB. Cifras orientativas para Llama 3.1 8B, no verificadas para esta combinacion concreta.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en fp16/bf16 con contexto amplio; una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para fp16 con contexto moderado y para cuantizaciones de 8 y 4 bits.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de 8-12 GB si se cuantiza el modelo base a 4 bits; en 16 GB es viable en 8 bits.
- Opciones de despliegue: transformers con peft para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en caliente (la compatibilidad con DoRA debe verificarse); llama.cpp/Ollama requeririan fusionar previamente el adaptador con el modelo base y exportar a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (DoRA sobre Llama 3.1 8B) | Adaptador de ~0,1 GB sobre 8.030 M | No disponible (base: 128.000 tokens) | Adaptador PEFT | No disponible | HuggingFace, 10 descargas |
| meta-llama/Llama-3.1-8B (modelo base) | 8.030 M | 128.000 tokens | Modelo completo, decoder-only | Llama 3.1 Community License | HuggingFace, ampliamente desplegado |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 tokens | Modelo completo ajustado por instrucciones | Llama 3.1 Community License | HuggingFace, muy usado |
| Otros adaptadores LoRA/DoRA comunitarios sobre Llama 3.1 8B | Variable | Depende del base | Adaptador PEFT | Habitualmente no especificada | HuggingFace; sin metricas comparables publicadas |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas. La comparacion se limita a parametros, contexto y licencia del modelo base.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay informacion sobre datos, hiperparametros, evaluacion ni uso previsto. Cualquier reutilizacion parte de una base documental muy debil.
- No se especifica la licencia del adaptador. Ademas, al derivar de Llama 3.1 8B, se heredan las condiciones de la Llama 3.1 Community License del modelo base, que impone restricciones y obligaciones de atribucion para uso comercial.
- Riesgo de alucinacion: propio de cualquier modelo generativo de 8.000 millones de parametros, y potencialmente agravado por un ajuste de bajo rango sobre un unico dominio, que puede degradar capacidades generales (olvido catastrofico).
- Idiomas soportados no confirmados: solo el nombre del repositorio sugiere ingles y suajili. No hay garantia de calidad en otros idiomas ni de que el suajili funcione segun lo esperado.
- Riesgo de sesgos: no evaluado. No hay analisis de sesgo ni de toxicidad en la informacion disponible.
- Sin benchmarks: no hay evidencia publicada de que el adaptador mejore al modelo base en ninguna tarea, por lo que no deberia desplegarse en produccion sin una evaluacion propia.
- Uso en produccion no recomendado sin validacion previa: el numero de descargas (10) y la ausencia de likes y de validacion externa indican que el artefacto no ha sido ampliamente probado.
- Fecha de creacion y actualizacion declaradas como 2026-09-22, lo que resulta anomala frente a la fecha actual y conviene verificar antes de citarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_120_DoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Referencia citada en la model card (calculadora de impacto y Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono: https://mlco2.github.io/impact
- Documentacion de PEFT: https://huggingface.co/docs/peft
- TyDiQA (benchmark de referencia del nombre del repositorio): https://github.com/google-research-datasets/tydiqa

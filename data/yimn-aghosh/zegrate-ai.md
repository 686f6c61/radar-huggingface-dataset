# yimn-Aghosh/zegrate-ai

## Resumen

Zegrate 14B Phase 2 es un adaptador LoRA (checkpoint de la fase 2 de entrenamiento) publicado por el usuario yimn-Aghosh en Hugging Face. No se trata de un modelo con pesos completos propios, sino de un adaptador PEFT que se monta sobre Qwen/Qwen2.5-14B-Instruct, el modelo instruct de 14.700 millones de parámetros de la familia Qwen2.5 de Alibaba. El repositorio declara 14.770.033.664 parámetros totales en safetensors y un tamano de 109,7 GB, coherente con la presencia de varios checkpoints y/o pesos fusionados en precision completa.

El adaptador se ha entrenado con QLoRA, es decir, cuantizacion a 4 bits del modelo base mas adaptadores de bajo rango, con rango 32, 400 pasos de entrenamiento y una tasa de aprendizaje de 2e-4. La model card es minima: no documenta el conjunto de datos, el objetivo del ajuste, los idiomas, la licencia ni resultados de evaluacion. Todo apunta a un experimento de ajuste de dominio o de estilo, todavia sin validacion publica por parte de la comunidad (0 likes y 508 descargas en el momento de la consulta).

Su relevancia es limitada pero concreta: sirve como ejemplo reproducible de un pipeline QLoRA sobre un modelo de 14B, y como punto de partida para quien quiera inspeccionar o continuar el ajuste. No obstante, la ausencia de licencia explicita, de datos de entrenamiento y de benchmarks impide recomendarlo para produccion sin una evaluacion previa por parte del equipo que lo adopte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA de tipo PEFT sobre Qwen2.5-14B-Instruct |
| Parámetros totales | 14.770.033.664 (14,77 B) según los safetensors del repositorio |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No especificada para el adaptador; el modelo base Qwen2.5-14B-Instruct soporta 32.768 tokens nativos ampliables a 131.072 con YaRN |
| Tipos de cuantización | Entrenado con QLoRA (4 bits); en inferencia admite las cuantizaciones del modelo base (bitsandbytes, GPTQ, AWQ, GGUF) además del adaptador en precisión nativa o fusionado |
| Idiomas soportados | No disponible en la model card; el modelo base declara 29 idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el repositorio tambien contiene pesos del modelo base segun el tamano de 109,7 GB |
| Rango LoRA | 32 |
| Pasos de entrenamiento | 400 |
| Tasa de aprendizaje | 2e-4 |
| Método de entrenamiento | QLoRA (cuantizacion 4 bits + LoRA) |
| Biblioteca | peft |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura del modelo base, un transformer decoder-only de la familia Qwen2.5 con 14.700 millones de parametros, attention con grouped-query attention (GQA) y un vocabulario de aproximadamente 152.000 tokens. Sobre esa base se aplica un adaptador LoRA de rango 32, entrenado mediante QLoRA: los pesos del modelo base se cuantizan a 4 bits y se congelan, de modo que solo se optimizan las matrices de bajo rango insertadas en las capas de atencion y proyeccion. Este esquema reduce drasticamente el consumo de memoria durante el entrenamiento y permite ajustar un modelo de 14B en una unica GPU de 24 GB.

Los hiperparametros documentados son 400 pasos de entrenamiento con una tasa de aprendizaje de 2e-4. No se especifica el numero de tokens vistos, la composicion del dataset, la longitud de secuencia, el optimizador ni si hubo una fase de alineacion posterior (RLHF, DPO o similares). Tampoco se describe ninguna innovacion tecnica propia: la model card se limita a indicar que es el checkpoint de la fase 2 del modelo Zegrate 14B. El nombre de la organizacion y las etiquetas sugieren un proyecto de ajuste de dominio sobre Qwen2.5, pero el contenido concreto del ajuste no esta documentado y no puede inferirse de la informacion disponible.

## Capacidades

- Generación de texto instructivo y conversacional: heredadas del modelo base Qwen2.5-14B-Instruct, ajustado para seguir instrucciones y mantener dialogos multi-turno.
- Razonamiento y matematicas: el modelo base rinde bien en tareas de razonamiento de varios pasos y problemas aritmeticos, aunque el adaptador no documenta mejoras especificas en este ambito.
- Generacion de codigo: el modelo base soporta generacion, explicacion y depuracion de codigo en multiples lenguajes, incluyendo completado y refactorizacion.
- Tool calling y function calling: el modelo base Qwen2.5-Instruct admite plantillas de llamadas a herramientas y salidas en JSON estructurado.
- Agentes y razonamiento multi-paso: puede encadenar llamadas a herramientas y pasos intermedios, si bien no hay ninguna evaluacion publicada del adaptador en tareas agenticas.
- Capacidades multilingues: no documentadas para el adaptador; el modelo base cubre 29 idiomas, entre ellos castellano, ingles, chino, frances, aleman, portugues, italiano y ruso.
- Capacidad especial de "thinking mode" o vision: no disponible; el modelo base es exclusivamente de texto.
- Ajuste de estilo o dominio: el adaptador puede introducir un tono o una especializacion concretos, pero la model card no describe cual es ni aporta ejemplos.

## Casos de uso

- Ajuste de dominio o estilo sobre un modelo de 14B: el repositorio sirve como plantilla reproducible de un pipeline QLoRA completo (cuantizacion 4 bits, rango 32, 400 pasos) para equipos que quieran especializar Qwen2.5-14B en un corpus propio sin disponer de un cluster de GPUs.
- Atención al cliente automatizada: al heredar la ventana de contexto del modelo base (hasta 131.072 tokens con YaRN), puede gestionar conversaciones multi-turno con historial extenso y documentacion de producto inyectada en el prompt.
- Generacion de codigo en producción: admite tool calling y salidas estructuradas, por lo que puede integrarse en pipelines de CI/CD para generar pruebas, revisar diffs o redactar mensajes de commit dentro de un agente.
- Recuperacion aumentada (RAG) sobre documentacion técnica: el contexto largo permite concatenar varios fragmentos recuperados y generar respuestas citando el material, con la precaucion de validar la tasa de alucinacion antes de desplegarlo.
- Traduccion y localizacion multilingüe: apoyandose en los 29 idiomas del modelo base, puede traducir documentacion tecnica o de marketing manteniendo terminologia consistente mediante glosarios en el prompt.
- Extraccion de informacion estructurada: conversion de contratos, facturas o informes a JSON con un esquema definido, aprovechando la capacidad del base para respetar formatos estrictos.
- Investigacion en tecnicas PEFT: comparar el efecto del rango, el numero de pasos y la cuantizacion sobre la calidad final, usando este checkpoint como referencia intermedia.
- Prototipado rapido de asistentes internos: montar un asistente sobre el adaptador en una estacion de trabajo con una RTX 4090 en cuantizacion de 4 bits, para validar producto antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y la busqueda web realizada no devolvio ningun resultado relacionado con este modelo.

## Requisitos de hardware

Los valores siguientes son estimaciones derivadas del numero de parametros del modelo base (14,77 B); no proceden de mediciones publicadas por el autor.

- VRAM en bf16/fp16: aproximadamente 29,5 GB solo para los pesos, mas la cache KV. Requiere A100 40 GB, H100 80 GB o dos RTX 4090 en paralelo con tensor parallelism.
- VRAM en 8 bits: en torno a 16 GB, viable en una RTX 4090 o RTX 3090 de 24 GB.
- VRAM en 4 bits (GPTQ, AWQ, bitsandbytes o GGUF Q4): entre 9 y 10 GB, por lo que cabe en RTX 4090, RTX 4080 de 16 GB, RTX 4070 Ti Super, RTX 3090 y, con margen ajustado, en GPUs de 12 GB si se reduce el contexto.
- Cuantizaciones GGUF orientativas: Q4_K_M alrededor de 9 GB, Q5_K_M en torno a 10,5 GB y Q8_0 cerca de 15,7 GB.
- Caber en GPU de consumo: si, en una RTX 4090 de 24 GB para cualquier cuantizacion de 8 bits o inferior, y en GPUs de 16 GB con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM (soporta adaptadores LoRA en caliente), TGI, transformers junto con PEFT para cargar el adaptador, y llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir los pesos a GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zegrate 14B Phase 2 (adaptador LoRA) | 14,77 B (base) + adaptador rango 32 | No especificado; hereda los 32.768/131.072 del base | No disponible | Hugging Face, 508 descargas | Ajuste ligero (400 pasos), sin benchmarks ni datos de entrenamiento |
| Qwen2.5-14B-Instruct | 14,7 B | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | Hugging Face, ampliamente desplegado | Modelo base de este adaptador; permite uso comercial sin restricciones adicionales |
| Mistral-Nemo-Instruct-2407 | 12,2 B | 128.000 tokens | Apache 2.0 | Hugging Face | Alternativa de tamano similar con contexto largo y licencia permisiva |
| Phi-4 | 14,7 B | 16.000 tokens | MIT | Hugging Face | Enfocado a razonamiento; contexto mas corto que las opciones anteriores |

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse uso comercial. Es imprescindible contactar con el autor y verificar la licencia del modelo base, que en el caso de Qwen2.5-14B-Instruct es Apache 2.0, pero la del adaptador no esta declarada.
- Ausencia total de benchmarks: no hay ninguna metrica que permita comparar este checkpoint con el modelo base ni con alternativas, por lo que se desconoce si el ajuste mejora o degrada el rendimiento general.
- Datos de entrenamiento no documentados: se desconoce la composicion del dataset, si hubo filtrado, que idiomas cubre y que sesgos puede haber incorporado. El riesgo de sesgo es, por tanto, indeterminado.
- Riesgo de olvido catastrofico y de sobreajuste: con solo 400 pasos y rango 32, el ajuste es superficial. Puede que el efecto sea limitado, o que se concentre en un estilo muy concreto y degrade capacidades generales como el razonamiento o el codigo.
- Riesgo de alucinacion: inherente al modelo base, no mitigado por el adaptador y sin evaluacion especifica.
- Idiomas no declarados: no se puede confirmar que el ajuste preserve el soporte multilingüe del modelo base, especialmente en castellano.
- Repositorio de 109,7 GB: el tamano dificulta la descarga y sugiere pesos duplicados o fusionados; conviene descargar solo la carpeta del checkpoint necesario (por ejemplo, checkpoint-400) en lugar del repositorio completo.
- Validacion comunitaria practicamente nula: 0 likes y 508 descargas indican que el modelo no ha sido auditado ni reproducido por terceros.
- Dependencia del modelo base: cualquier uso en produccion requiere cargar Qwen2.5-14B-Instruct y aplicar el adaptador, con el coste de memoria asociado.
- Sin informacion sobre pipeline ni tarea declarada: no se indica si esta pensado para chat, generacion o una tarea concreta, lo que obliga a evaluarlo manualmente antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yimn-Aghosh/zegrate-ai
- Modelo base Qwen2.5-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio de PEFT: https://github.com/huggingface/peft
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces encontrados correspondian a foros hungaros sobre armas de aire comprimido y optica, sin ninguna relacion con el modelo.

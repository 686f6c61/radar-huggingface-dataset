# TyroneNel/Swift-Qwen3.8-27B-Uncensored-W4A16

## Resumen

Swift-Qwen3.8-27B-Uncensored-W4A16 es un checkpoint cuantizado publicado por el usuario TyroneNel a partir de d0xin/Swift-Qwen3.8-27B-Uncensored-BF16, que a su vez es un derivado sin comportamiento de rechazo («abliterated») de ukisai/Swift-Qwen3.8-27b. El modelo pertenece a la familia Qwen3.8, con pipeline image-text-to-text (multimodal), 27B de parámetros nominales, configuración de contexto de 262.144 tokens y soporte de razonamiento, tool calling y decodificación especulativa mediante MTP/DFlash2.

El problema que aborda es de despliegue: reduce el peso en disco de aproximadamente 52 GB en BF16 a unos 16 GB mediante cuantización W4A16 (4 bits, grupo 128, simétrica) con cabezas de proyección y embeddings en int8, sin desmontar el pipeline de decodificación especulativa ni el vocabulario de borrador de 40.960 identificadores. La cuantización se ha realizado con Intel AutoRound y el pipeline posterior de syv-ai/qwen38-27b-rtx3090, y se ha validado en una única RTX 3090 de 24 GB.

Su relevancia actual es doble. Por un lado, demuestra que un modelo multimodal de 27B con contexto de 262k puede servirse en una GPU de gama de consumo con el pipeline especulativo intacto, algo poco habitual a este tamaño. Por otro, incorpora una ablación direccional de rango 1 sobre el flujo residual para eliminar rechazos: la evaluación declarada sobre 100 prompts fijos es de 0 rechazos (88 respuestas directas, 10 con advertencia de seguridad pero respondidas y 2 fallos de otro tipo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text de la familia Qwen3.8, con cabezal MTP para decodificacion especulativa; no se detalla si el cuerpo es denso o MoE |
| Parametros totales | 27B (segun el nombre del modelo; no se publica desglose por componente) |
| Longitud de contexto | 262.144 tokens (configuracion declarada) |
| Tipos de cuantizacion | Cuerpo W4A16 (4 bits, grupo 128, simetrico); int8 en `lm_head`, `embed_tokens` y MLP del MTP; variante `-fast` con GPTQ-int4 en las cabezas |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | swift-open-license-1.0 (`license: other`); el texto de la licencia no esta disponible en la informacion proporcionada |
| Formato de pesos | compressed-tensors (W4A16 + int8); no se especifica el contenedor de pesos |
| Tamano en disco | Aproximadamente 16 GB (frente a los ~52 GB del BF16 de origen) |
| Modelo base | d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 (relacion: cuantizado) |
| Pipeline | image-text-to-text |
| Libreria | transformers; compatible con vLLM (Marlin) y API compatible con OpenAI de SGLang |
| Abliteracion | Capa 38, rango 1, 131 escritores residuales modificados; tensores de vision sin modificar |
| Idiomas de la model card | Ingles en la documentacion original |

## Arquitectura y entrenamiento

Este checkpoint no introduce entrenamiento nuevo: es el resultado de dos transformaciones sobre los pesos BF16 de d0xin/Swift-Qwen3.8-27B-Uncensored-BF16. La primera es una ablacion direccional del flujo residual de rango 1 aplicada en la capa 38, que modifica 131 escritores residuales (incluidos los del MTP) y deja intactos los tensores de vision. El objetivo declarado es conservar razonamiento, capacidades agenticas, tool calling, multimodalidad y contexto largo, eliminando unicamente la conducta de rechazo. El BF16 sin censura del que deriva obtuvo 0 rechazos en una evaluacion fija de 100 prompts (88 directos, 10 con matiz de seguridad pero respondidos, 2 fallos de otro tipo).

La segunda transformacion es la cuantizacion: W4A16 con grupo 128 simetrico en el cuerpo y int8 en `lm_head`, `embed_tokens` y MLP del MTP, aplicada con Intel AutoRound y el pipeline posterior de syv-ai/qwen38-27b-rtx3090. El pipeline de decodificacion especulativa se mantiene operativo: el vocabulario de borrador de 40.960 identificadores se calculo sobre las propias salidas de este modelo, con una cobertura en conjunto reservado del 98,90 % frente al 98,08 % de la lista del Qwen base. La validacion incluye `verify.sh` con 7 de 7 comprobaciones superadas y una prueba de humo con decodificacion greedy en una RTX 3090. No se documenta composicion del dataset de entrenamiento, numero de tokens ni fases de RLHF/DPO, ya que no hubo entrenamiento en esta release. La variante `-fast` sustituye las cabezas int8 por GPTQ-int4 calibrado con activaciones capturadas del propio modelo (KL respecto a la cabeza BF16 de 0,00251; RTN 0,00558; simulacion de cadena de 2,269 tokens por paso).

## Capacidades

- Generacion de texto conversacional en ingles y chino, con ajustes de generacion heredados de Qwen3.8.
- Razonamiento explicito con tres niveles de esfuerzo (`xhigh` por defecto, `medium` y `low`), pensados para carga cognitiva, equilibrio latencia/profundidad y minimizacion de coste respectivamente.
- Razonamiento matematico: 98,0 % en GSM8K sobre 200 preguntas medidas en una RTX 3090.
- Codigo y tareas agenticas, con soporte de tool calling / function calling segun las etiquetas del modelo.
- Capacidades multimodales de entrada: pipeline image-text-to-text, con los tensores de vision preservados tras la ablacion.
- Contexto largo de hasta 262.144 tokens.
- Decodificacion especulativa integrada mediante MTP/DFlash2 con vocabulario de borrador propio de 40.960 identificadores.
- Ausencia declarada de rechazos: 0/100 en el conjunto fijo de evaluacion del BF16 de origen.
- Servicio mediante API compatible con OpenAI (SGLang) y despliegue en vLLM con kernels Marlin.

## Casos de uso

- Agentes multi-paso con tool calling: el modelo puede encadenar llamadas a herramientas manteniendo estado en una ventana de 262.144 tokens, lo que permite agentes que arrastran historiales largos de ejecucion sin truncar contexto.
- Analisis de documentos e imagenes combinados: al ser image-text-to-text, admite capturas de pantalla, diagramas o paginas escaneadas junto a texto, util para extraccion de informacion de informes tecnicos extensos.
- Procesamiento de codigo base completo en una sola pasada: la ventana de 262k tokens permite incluir repositorios medianos y documentacion asociada para tareas de refactorizacion, generacion de tests o revision de cambios.
- Inferencia local en estacion de trabajo con una sola GPU: los ~16 GB en disco y la validacion en RTX 3090 lo hacen apto para entornos de desarrollo donde no hay acceso a clústeres, con 122,5 tok/s con temperatura 1,0 y 127,9 tok/s en greedy (C1).
- Red teaming y evaluacion de robustez: al ser una variante abliterated con 0 rechazos declarados, resulta util como objeto de estudio para medir transferencia de comportamiento y eficacia de tecnicas de alineacion, siempre en entornos controlados.
- Generacion de datos sinteticos en ingles y chino: su capacidad de responder sin defensas y de mantener contexto largo facilita la produccion de corpus conversacionales y de razonamiento en esos dos idiomas.
- Asistencia al cliente multi-turno: la combinacion de contexto largo, tool calling y multimodalidad permite gestionar incidencias que requieren consultar historial, adjuntos e imagenes en una misma conversacion.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| GSM8K | 98,0 % | 200 preguntas, RTX 3090, vocabulario de borrador propio |
| Throughput C1 (temperatura 1,0) | 122,5 tok/s | RTX 3090, vocabulario de borrador propio |
| Throughput C1 (greedy) | 127,9 tok/s | RTX 3090, vocabulario de borrador propio |
| Benchmark agentico | 80,24 tok/s | RTX PRO 6000 Blackwell 96 GB |
| Cobertura del vocabulario de borrador (conjunto reservado) | 98,90 % | Frente al 98,08 % de la lista del Qwen base |
| Validacion de inteligencia (298 ejemplos) | 38,26 % Swift BF16 original / 39,93 % sin censura | Delta +1,68 pp; McNemar p=0,442068; IC bootstrap 95 % [-1,68; +5,03] pp |
| Evaluacion de rechazos (100 prompts fijos) | 88 directos / 10 safety deflect / 2 otros fallos / 0 rechazos | Conjunto fijo documentado por el autor |
| Variante `-fast` (GPTQ-int4 en cabezas) | KL 0,00251; RTN 0,00558; 2,269 tokens por paso en simulacion de cadena | Calibrada con activaciones del propio modelo |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 16 GB, por lo que la inferencia cabe en GPUs de 24 GB dejando margen para cache KV; el consumo exacto de la cache KV a 262.144 tokens no esta disponible.
- GPU validadas por el autor: RTX 3090 de 24 GB (unica GPU, con prueba de humo greedy y mediciones de throughput) y RTX PRO 6000 Blackwell de 96 GB (benchmark agentico a 80,24 tok/s).
- Cabe en GPU de consumo: si, en RTX 3090 y previsiblemente en RTX 4090 (ambas 24 GB). Las etiquetas del modelo incluyen explicitamente `ampere` y `rtx-3090`.
- Despliegue: vLLM con kernels Marlin y formato compressed-tensors; SGLang con API compatible con OpenAI (ejemplo de `curl` en la model card); transformers como libreria declarada. No se documenta soporte GGUF, llama.cpp ni Ollama.
- Rendimiento medido: 122,5 tok/s con temperatura 1,0 y 127,9 tok/s en greedy en RTX 3090 (C1); 80,24 tok/s en carga agentica sobre RTX PRO 6000 Blackwell.
- La variante `-fast` reduce el peso a 15 GB a cambio de cuantizar las cabezas con GPTQ-int4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| TyroneNel/Swift-Qwen3.8-27B-Uncensored-W4A16 | 27B | 262.144 | W4A16 + int8, ~16 GB | swift-open-license-1.0 | Modelo de esta ficha; ablacion rango 1 en capa 38 |
| TyroneNel/Swift-Qwen3.8-27B-Uncensored-W4A16-fast | 27B | 262.144 | GPTQ-int4 en cabezas, 15 GB | swift-open-license-1.0 | Mismo cuerpo y vocabulario de borrador; KL 0,00251 frente a la cabeza BF16 |
| d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 | 27B | 262.144 | BF16, ~52 GB | No disponible | Modelo base directo de esta cuantizacion |
| ukisai/Swift-Qwen3.8-27b | 27B | No disponible | BF16 | No disponible | Modelo original del que deriva la version sin censura; referencia de la validacion de inteligencia (38,26 % combinado frente a 39,93 %) |

No se dispone de datos comparativos con modelos de otras familias (por ejemplo, alternativas multimodales de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia se declara como `other` con nombre `swift-open-license-1.0`; el texto no esta disponible, por lo que no puede confirmarse si el uso comercial esta permitido. Debe revisarse antes de cualquier despliegue en produccion.
- El modelo esta explicitamente abliterated: la eliminacion de rechazos aumenta el riesgo de generar contenido danino, ilegal o inseguro. No es adecuado para aplicaciones dirigidas al publico general sin capas de moderacion externas.
- El 0/100 de rechazos corresponde a un conjunto fijo de 100 prompts bajo una configuracion de inferencia documentada; el propio autor advierte de que no garantiza la ausencia de rechazos ante otros prompts, system prompts, muestreos o motores de inferencia.
- Cobertura linguistica limitada a ingles y chino. No se declara soporte de castellano ni de otros idiomas.
- La validacion de inteligencia sobre 298 ejemplos tiene un intervalo de confianza bootstrap del 95 % de [-1,68; +5,03] puntos porcentuales y un p-valor de 0,442068: la diferencia no es estadisticamente concluyente, de modo que no puede afirmarse una mejora ni una degradacion medible.
- No hay resultados publicados de benchmarks estandar (MMLU, HumanEval, etc.) ni evaluaciones independientes. El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de fidelidad factual o de tasa de alucinacion.
- La cuantizacion W4A16 y las cabezas int8 introducen perdida de precision respecto al BF16; solo la variante `-fast` reporta una metrica de divergencia (KL 0,00251) frente a la cabeza BF16, y no se ofrece una cifra equivalente para esta variante.
- El vocabulario de borrador de 40.960 identificadores esta ajustado a las salidas de este modelo; sustituirlo por otra lista puede degradar la tasa de aceptacion de la decodificacion especulativa.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni procedencia de los datos originales de Qwen3.8.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TyroneNel/Swift-Qwen3.8-27B-Uncensored-W4A16
- Variante rapida (GPTQ-int4 en cabezas): https://huggingface.co/TyroneNel/Swift-Qwen3.8-27B-Uncensored-W4A16-fast
- Modelo base directo (BF16 sin censura): https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- Modelo original del que deriva la version sin censura: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Pipeline de cuantizacion y post-proceso: https://github.com/syv-ai/qwen38-27b-rtx3090
- La busqueda web realizada no devolvio resultados relevantes (unicamente enlaces del servicio Google Maps), por lo que no se anaden papers, blogs ni demos adicionales.

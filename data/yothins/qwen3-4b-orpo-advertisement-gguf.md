# yothinS/Qwen3-4B-ORPO-Advertisement-GGUF

## Resumen

Qwen3-4B-ORPO-Advertisement-GGUF es una version cuantizada en formato GGUF del modelo yothinS/Qwen3-4B-ORPO-Advertisement, un ajuste fino de Qwen/Qwen3-4B orientado a estrategia publicitaria, analisis de campanas y marketing de rendimiento. Lo publica el usuario yothinS y su proposito es facilitar la ejecucion local del modelo especializado en motores de inferencia compatibles con GGUF, ofreciendo distintos niveles de cuantizacion para ajustar el equilibrio entre memoria, velocidad y calidad de salida.

El modelo parte de una arquitectura transformer densa de aproximadamente 4.022 millones de parametros (4,02 B), sin componentes de mezcla de expertos. El ajuste se realizo mediante Odds Ratio Preference Optimization (ORPO) sobre el dataset Advertisement_specialist del mismo autor, partiendo del modelo base Qwen3-4B. Los idiomas declarados son ingles y tailandes, y el repositorio se publica bajo licencia MIT.

Su relevancia actual es acotada y muy especifica: no compite como modelo de proposito general, sino como asistente de dominio para tareas de marketing (interpretacion de KPI como CTR, CPC, CVR, CPA y ROAS, segmentacion de audiencias, planificacion de campanas y generacion de creatividades) que pueda desplegarse en local sin depender de APIs. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no incluye resultados de benchmarks, por lo que se trata de una publicacion sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | Ingles (en) y tailandes (th) |
| Licencia | MIT |
| Formato de pesos | GGUF (derivado del modelo base en safetensors) |
| Modelo base | yothinS/Qwen3-4B-ORPO-Advertisement |
| Modelo original de partida | Qwen/Qwen3-4B |
| Metodo de ajuste | ORPO (Odds Ratio Preference Optimization) |
| Dominio primario | Publicidad y marketing de rendimiento |
| Tamano del repositorio | 11,8 GB (incluye todas las cuantizaciones) |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Fecha de creacion (metadatos HF) | 2026-10-11 |
| Fecha de actualizacion (metadatos HF) | 2026-10-11 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3-4B, un transformer denso de tipo decoder-only con 4,02 B de parametros. Al ser un modelo denso, todos los parametros se activan en cada pasada, a diferencia de las variantes MoE de la familia Qwen3. El repositorio no detalla la configuracion interna (numero de capas, dimensiones de atencion, cabezas, tipo de normalizacion ni esquema de RoPE) ni la longitud de contexto efectiva resultante del ajuste, por lo que esos datos quedan como no disponibles en esta ficha.

El entrenamiento del modelo original combino el modelo base Qwen3-4B con ORPO, un metodo de alineacion que integra la preferencia supervisada y la optimizacion por odds ratio en una sola etapa, sin necesidad de un modelo de recompensa separado. El dataset empleado es el Advertisement Specialist Dataset publicado por el mismo autor. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, la mezcla de idiomas ni si hubo etapas adicionales de RLHF o DPO. Tampoco se documentan innovaciones tecnicas propias mas alla del ajuste de dominio y del posterior proceso de conversion y cuantizacion a GGUF.

## Capacidades

- Generacion de texto en ingles y tailandes, con rendimiento variable segun la tarea segun la propia model card.
- Planificacion de estrategia publicitaria y definicion de campanas.
- Analisis de rendimiento de campanas publicitarias.
- Interpretacion de KPI de marketing: CTR, CPC, CVR, CPA y ROAS.
- Segmentacion y definicion de audiencias objetivo.
- Apoyo a la optimizacion de campanas y a la asignacion de presupuesto.
- Redaccion de creatividades publicitarias, titulares, copies y llamadas a la accion (CTA).
- Analisis de embudo de conversion y optimizacion de conversion.
- Soporte de conversacion multi-turno mediante plantilla de chat (el tokenizer y la plantilla se preservan en la conversion a GGUF).
- Modo de pensamiento desactivable a traves de la plantilla de chat (parametro enable_thinking), heredado del modelo base Qwen3.
- Tool calling / function calling: no confirmado en la model card de este repositorio; el modelo base Qwen3-4B lo soporta, pero no se garantiza que el ajuste de dominio lo conserve.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Analisis de campanas de pago: el modelo puede recibir metricas de una campana (gasto, impresiones, clics, conversiones, ingresos atribuidos) y calcular o explicar indicadores como ROAS o CPA. Es adecuado porque fue ajustado especificamente sobre ese tipo de calculo, aunque requiere verificacion manual de las cifras.
- Generacion de creatividades en tailandes e ingles: redaccion de titulares, textos de anuncio y CTA para un mismo concepto en los dos idiomas soportados, util para equipos que operan en el sudeste asiatico.
- Asistente local de marketing sin conexion: al distribuirse en GGUF, puede ejecutarse con llama.cpp o LM Studio en un portatil, lo que permite trabajar con datos internos de campana sin enviarlos a una API externa.
- Formacion y soporte a equipos junior de marketing: puede explicar conceptos de embudo de conversion, atribucion y segmentacion de audiencias en un entorno conversacional controlado.
- Borrador de planes de asignacion de presupuesto: el modelo puede proponer distribuciones de presupuesto entre canales a partir de objetivos y restricciones descritas, siempre como material de partida sujeto a revision humana.
- Interpretacion de informes de rendimiento: conversion de tablas de metricas en resumenes narrativos y deteccion de posibles anomalias (caidas de CTR, incrementos de CPA) para revision posterior.
- Base para investigacion en ajuste de dominio y cuantizacion: sirve como caso de estudio reproducible de un pipeline ORPO mas conversion a GGUF con siete niveles de cuantizacion, util para comparar perdida de calidad entre Q4_K_M, Q5_K_M y Q6_K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna metrica de evaluacion propia, y tampoco se aportan comparaciones numericas frente al modelo base Qwen3-4B o frente a otras variantes ajustadas.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del numero de parametros declarado (4,02 B) y del nivel de cuantizacion, no datos confirmados por el autor.

- F16: aproximadamente 8-9 GB solo para pesos; requiere GPU con al menos 12-16 GB de VRAM para contexto corto.
- Q8_0: aproximadamente 4,3-5 GB de pesos.
- Q6_K: aproximadamente 3,3-4 GB de pesos.
- Q5_K_M: aproximadamente 2,9-3,5 GB de pesos.
- Q4_K_M: aproximadamente 2,5-3 GB de pesos; es el punto de partida recomendado por el autor.
- Q3_K_M: aproximadamente 2,1-2,6 GB de pesos.
- Q2_K: aproximadamente 1,7-2,2 GB de pesos; reservado para entornos con memoria muy limitada.
- A las cifras anteriores hay que sumar el cache KV, cuyo tamano crece de forma lineal con la longitud de contexto y el numero de capas; en contexto largo la huella puede superar ampliamente el peso de los parametros.
- GPU recomendadas: para Q4_K_M o Q5_K_M basta una GPU de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090. Para F16 o Q8_0 con contexto largo son preferibles A100, H100 o GPU con 24 GB o mas.
- Si cabe en GPU de consumo: si, en la mayoria de cuantizaciones de 2 a 6 bits, en tarjetas con 8 GB o mas de VRAM segun contexto.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), LM Studio, y soporte de GGUF a traves de Transformers con AutoModelForCausalLM y el parametro gguf_file. Tambien es compatible con Ollama si se importa el GGUF, aunque no se documenta explicitamente. No hay confirmacion de soporte con vLLM o TGI para estos ficheros GGUF.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| yothinS/Qwen3-4B-ORPO-Advertisement-GGUF | 4,02 B | No disponible | en, th | MIT | Ajuste de dominio en publicidad, cuantizado en GGUF |
| Qwen/Qwen3-4B | 4 B (aprox.) | No verificado en la informacion proporcionada | Multilingue | No verificado en la informacion proporcionada | Modelo base de proposito general |
| Qwen2.5-3B-Instruct o Llama-3.2-3B-Instruct | 3 B (aprox.) | No verificado en la informacion proporcionada | Multilingue | No verificado en la informacion proporcionada | Alternativas de proposito general de tamano similar |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada. La diferencia principal frente al modelo base y frente a otros modelos generales de tamano similar es la especializacion en tareas de marketing y el soporte nativo de tailandes en combinacion con ingles, a costa de un posible deterioro en capacidades generales.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados: la calidad del ajuste ORPO y de cada nivel de cuantizacion no esta validada con metricas objetivas.
- La propia model card advierte de que las capacidades descritas son intenciones, no garantias de precision.
- Riesgo de alucinacion en cifras: el modelo puede inventar o calcular mal metricas de marketing (ROAS, CPA, CTR) o atribuir resultados sin base en datos reales. Las cifras deben verificarse siempre contra la plataforma de analitica.
- No sustituye a datos de campana verificados, a experimentos controlados ni al criterio profesional, tal como indica el autor.
- Cobertura idiomatica limitada a ingles y tailandes; no se declara soporte de castellano, por lo que su uso en espanol producira resultados degradados.
- El ajuste de dominio puede degradar capacidades generales del modelo base (razonamiento, codigo, matematicas) respecto a Qwen3-4B sin ajustar.
- No se confirma en la model card el soporte de tool calling, function calling ni de flujos de agente multi-paso, aunque el modelo base los ofrezca.
- El repositorio presenta 0 descargas y 0 likes, y los metadatos indican fechas de creacion y actualizacion de octubre de 2026, posteriores a la consulta. Esto apunta a un modelo sin adopcion ni validacion por parte de la comunidad; conviene tratarlo como experimental.
- La licencia MIT permite uso comercial y modificacion, pero se distribuye sin garantias y sin clausulas de responsabilidad sobre los resultados generados.
- El repositorio ocupa 11,8 GB al incluir todas las cuantizaciones; descargar el conjunto completo no es necesario si solo se necesita un nivel.
- El soporte de GGUF a traves de Transformers depende de la version instalada y de la arquitectura; el propio autor indica que es un flujo alternativo y no la via preferente, que es llama.cpp.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/yothinS/Qwen3-4B-ORPO-Advertisement-GGUF
- Modelo original ajustado: https://huggingface.co/yothinS/Qwen3-4B-ORPO-Advertisement
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/yothinS/Advertisement_specialist
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_4b
- Ficha de Qwen3 4B en Benchable: https://benchable.ai/models/qwen/qwen3-4b-04-28
- Ficha de Qwen3 4B en Inferbase: https://inferbase.ai/models/qwen3-4b

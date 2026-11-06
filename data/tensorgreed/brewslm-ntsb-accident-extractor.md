# TensorGreed/brewslm-ntsb-accident-extractor

## Resumen

`TensorGreed/brewslm-ntsb-accident-extractor` es un modelo de lenguaje especializado en extraccion de informacion estructurada, desarrollado por el usuario TensorGreed y entrenado con la plataforma BrewSLM. Parte de `Qwen/Qwen2.5-1.5B-Instruct` y ha sido ajustado mediante LoRA (posteriormente fusionado en los pesos) para convertir narrativas de accidentes aereos de la NTSB (Junta Nacional de Seguridad del Transporte de EE. UU.) en un unico registro JSON plano de 13 campos: aeronave, danos, heridos, regla de operacion, proposito del vuelo, fecha, estado y horas de vuelo del piloto, entre otros.

Su rasgo distintivo es el manejo disciplinado de la ausencia de datos: cuando la narrativa no menciona un campo, el modelo escribe `null` en lugar de inventar un valor. En el conjunto de prueba (1.234 narrativas reservadas), alcanza una validez de esquema del 99,5 % y una precision de null del 95,4 %, muy por encima del modelo base con cualquier prompt.

Es relevante como demostracion practica de que un modelo pequeno (1.543.714.304 parametros) afinado sobre datos de dominio puede superar con creces al modelo base en tareas de extraccion estructurada, ademas de por el analisis publicado sobre como un simple `repetition_penalty: 1.1` en la configuracion de generacion degradaba gravemente sus resultados. El autor lo publica bajo licencia Apache 2.0 con fines educativos y explicitamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5), afinado con LoRA fusionado |
| Parametros totales | 1.543.714.304 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base Qwen2.5-1.5B-Instruct es 32.768 tokens, pero no consta en la ficha) |
| Tipos de cuantizacion | no disponible (pesos sin cuantizar en safetensors) |
| Idiomas soportados | Ingles (entrenado y evaluado sobre narrativas en ingles de la NTSB) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con text-generation-inference y endpoints) |

## Arquitectura y entrenamiento

El modelo es un ajuste de `Qwen2.5-1.5B-Instruct`, un transformer decoder de 1.500 millones de parametros. El entrenamiento se realizo con LoRA, cuyos adaptadores fueron posteriormente fusionados ("merged") en los pesos base, de modo que el repositorio distribuye un modelo unico sin necesidad de cargar adaptadores adicionales. Todo el proceso (importacion de datos, division en conjuntos, entrenamiento, evaluacion y empaquetado) se ejecuto a traves de BrewSLM, una plataforma para construir modelos pequenos a partir de datos propios.

Los datos de entrenamiento son narrativas de accidentes aereos de la NTSB, con una salida objetivo de 13 campos JSON tipados. Destacable es la metodologia de evaluacion: se entrenaron tres semillas (13, 42 y 1234) sobre datos identicos, con una regla de aprobacion escrita y congelada (con checksum) antes de puntuar ningun modelo, y puertas de calidad como validez de esquema ≥ 0,95, precision de null ≥ 0,95 y recall de null ≥ 0,90. En octubre de 2026 se corrigio un problema de decodificacion: el `generation_config.json` original heredaba `repetition_penalty: 1.1` del modelo base, lo que penalizaba el token `"` ya emitido y sesgaba las respuestas hacia `null` en el campo `aircraft_model`. El repositorio ahora incluye decodificacion greedy sin penalizacion; los pesos no han cambiado.

## Capacidades

- Extraccion de informacion estructurada: convierte una narrativa de accidente aereo en un JSON plano de 13 campos (categoria, marca y modelo de aeronave, danos, heridos por gravedad, fecha, estado, regla de operacion Parte 91/135, proposito del vuelo y horas totales de piloto).
- Manejo de ausencia de datos: escribe `null` cuando el campo no aparece en el texto, en lugar de inventar valores (precision de null 0,954 en test, 0,994 en validacion con la decodificacion corregida).
- Salida conforme a esquema: 99,5 % de las salidas son JSON valido con todos los campos, tipos correctos y valores permitidos.
- Comparaciones tipadas: distingue numeros, cadenas (ignorando mayusculas y espacios) y null/ausente/cadena vacia.
- Generacion de texto conversacional generalista heredada de Qwen2.5-1.5B-Instruct, aunque sin garantias fuera del dominio de entrenamiento.
- No tiene capacidades de vision, audio ni tool calling documentadas.

## Casos de uso

- Digitalizacion de archivos historicos de la NTSB: procesar por lotes miles de narrativas en texto libre y convertirlas en registros JSON consultables en una base de datos, con confianza en que los campos ausentes quedaran como `null` y no como datos inventados.
- Construccion de datasets de seguridad aerea: alimentar paneles de analisis estadistico (tipos de dano, distribucion de heridos, horas de piloto) con datos extraidos de forma homogenea.
- Prototipado de pipelines de extraccion con LLM pequenos: es un ejemplo de referencia de como afinar un modelo de 1,5 B para salida JSON estricta, util como plantilla metodologica para otros dominios documentales.
- Enriquecimiento de sistemas RAG: estructurar documentos narrativos antes de indexarlos, mejorando la recuperacion por campos filtrables (fecha, estado, categoria de aeronave).
- Docencia y formacion: el autor lo publica explicitamente con fines educativos; la model card documenta el proceso completo, incluidos los fallos y la correccion de decodificacion, lo que lo hace util como material de estudio.
- Auditoria de datos de referencia: dado que el modelo se abstiene con `null`, puede usarse para detectar inconsistencias en claves de respaldo (el propio autor documenta 77 casos en validacion donde la clave decia `null` pero el valor si aparecia en el texto).

## Benchmarks y rendimiento

Resultados en el conjunto de prueba (1.234 narrativas reservadas, decodificacion antigua con `repetition_penalty: 1.1`):

| Metrica | Base, mismo prompt | Base, prompt con esquema (subconjunto de 300) | Este modelo |
|---|---|---|---|
| Salida conforme al esquema (JSON valido, campos, tipos y valores) | 0,042 | 0,770 | 0,995 |
| Campos exactos (13 campos, todas las filas) | 0,494 | 0,481 | 0,959 |
| Precision de null | 0,901 | 0,533 | 0,954 |
| Recall de null | 0,545 | 0,371 | 0,976 |

Resultados en validacion (1.256 narrativas) comparando decodificaciones, con los mismos pesos:

| Metrica | Decodificacion antigua (penalizacion 1,1) | Decodificacion corregida (sin penalizacion) |
|---|---|---|
| Modelos de aeronave declarados devueltos como `null` | 232 de 468 | 16 de 468 |
| aircraft_model exacto | 0,761 | 0,891 |
| Campos exactos (13 campos) | 0,962 | 0,977 |
| Precision de null | 0,955 | 0,994 |
| Recall de null | 0,982 | 0,972 |
| Los 13 campos correctos | 0,639 | 0,785 |

Rendimiento por campo en test (semilla 42, decodificacion antigua): los campos con mejor exactitud son `event_date` (0,994), `regulation_part` y `location_state` (0,991) e `highest_injury` (0,985); el mas debil es `aircraft_model` (0,752, con solo 0,388 de acierto cuando el texto si declara el modelo, problema atribuido a la penalizacion de repeticion y mejorado a 0,891 en validacion con la decodificacion corregida). No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en fp16/bf16 (tamano del repositorio), mas overhead de KV cache; con cuantizacion a 4 bits cabria en torno a 1-1,5 GB (cuantizaciones no publicadas oficialmente).
- GPUs recomendadas: cualquier GPU moderna de gama media es suficiente; una RTX 3060 de 12 GB, RTX 4060 Ti o superior ejecuta el modelo con holgura. No se necesita hardware de centro de datos.
- Consumer GPUs: cabe comodamente en GPUs de 6-8 GB de VRAM incluso en precision completa.
- Despliegue: transformers (libreria nativa, `pipeline_tag: text-generation`, compatible con text-generation-inference y endpoints de Hugging Face); al ser un modelo Qwen2 arquitectonicamente estandar, es compatible con vLLM, llama.cpp (previa conversion a GGUF, no distribuida en el repo) y Ollama (previa conversion), aunque el repo solo documenta el uso con transformers.
- Latencia y throughput: no disponibles; al tratarse de un modelo de 1,5 B, la generacion de un registro JSON corto deberia ser rapida incluso en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Validez de esquema / precision de null | Licencia |
|---|---|---|---|---|
| brewslm-ntsb-accident-extractor | 1,54 B | Narrativas NTSB a JSON de 13 campos | 0,995 / 0,954 (test) | Apache 2.0 |
| Qwen2.5-1.5B-Instruct (base, mismo prompt) | 1,54 B | Generalista; 4,2 % de salidas conforme a esquema en esta tarea | 0,042 / 0,901 | Qwen (Apache 2.0 para la mayoria de tamanos) |
| Qwen2.5-1.5B-Instruct (base, prompt con esquema) | 1,54 B | Generalista con ingenieria de prompt | 0,770 / 0,533 (subconjunto de 300) | Qwen |

La comparacion muestra que el ajuste especifico no solo corrige el formato (0,042 → 0,995) sino que reduce la invencion de datos: el prompt con esquema aplicado al modelo base mejora el formato pero empeora la precision de null (0,901 → 0,533), generando fechas inventadas y cadenas del tipo "Not specified". No hay otros extractores especializados en narrativas NTSB publicados con metricas comparables en la informacion disponible.

## Limitaciones y advertencias

- Uso educativo exclusivo: el autor lo declara explicitamente como demostracion de un metodo de entrenamiento, no como experto en seguridad aerea ni en investigacion de accidentes. Es un proyecto vitrina no comercial, sin garantia.
- No usar como fuente de hallazgos de la NTSB: la salida no debe emplearse como evidencia de la causa de un accidente. Para cualquier proposito real, consultar los registros oficiales en data.ntsb.gov.
- Riesgo de alucinacion reducido pero no nulo: la precision de null es 0,954 en test (0,994 en validacion con decodificacion corregida), por lo que aproximadamente el 1-5 % de los valores `null` podrian corresponder a campos realmente declarados, y viceversa.
- Debilidad conocida en `aircraft_model`: con la decodificacion antigua fallaba en el 61 % de los casos donde el texto si declaraba el modelo; la decodificacion corregida lo reduce al 3,4 % en validacion, pero los numeros de test no han sido reejecutados (la regla de paso permitia una sola evaluacion por semilla y ya se consumieron). Un resultado de test nuevo llegara con la version 2.
- Claves de respaldo imperfectas: en validacion, los 77 valores que el modelo devuelve donde la clave dice `null` para `aircraft_model` aparecen literalmente en la narrativa; la discrepancia es de la clave, no del modelo. Conviene auditar los datos de referencia al evaluar extractores similares.
- Idioma: entrenado solo con narrativas en ingles; no hay soporte documentado para castellano ni otros idiomas.
- Sesgos: hereda los sesgos del modelo base Qwen2.5 y del corpus NTSB (accidentes de aviacion general de EE. UU., con la composicion demografica y operativa que eso implica); no se ha publicado analisis de sesgos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor pide explicitamente no usarlo comercialmente ("non-commercial showcase"), una restriccion de uso declarada en la model card que conviene respetar pese a la licencia permisiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TensorGreed/brewslm-ntsb-accident-extractor
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Articulo del blog de BrewSLM sobre este modelo: https://brewslm.com/blog-ntsb-accident-report-extractor.html
- Blog de BrewSLM: https://brewslm.com/blog.html
- Plataforma BrewSLM: https://brewslm.com
- Registros oficiales de la NTSB: https://data.ntsb.gov/carol-main-public/basic-search

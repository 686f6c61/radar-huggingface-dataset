# vkovtun/llama-text-to-sql-2026-09-21_18.25.18-finetune-QLORA

## Resumen

`vkovtun/llama-text-to-sql-2026-09-21_18.25.18-finetune-QLORA` es un ajuste fino del modelo `meta-llama/Llama-3.2-3B-Instruct` orientado, segun el nombre del repositorio, a la generacion de consultas SQL a partir de lenguaje natural (text-to-SQL). Lo publica el usuario `vkovtun` en HuggingFace el 21 de septiembre de 2026 y se ha entrenado con SFT mediante la libreria TRL, con el sufijo "QLORA" indicando cuantizacion en 4 bits durante el proceso de ajuste. El repositorio ocupa 2,4 GB y los pesos se distribuyen en formato safetensors.

Se trata de un artefacto de experimentacion, no de un modelo con soporte comercial: acumula 0 descargas y 0 likes, no declara licencia, no documenta el conjunto de datos de entrenamiento, no incluye hiperparametros ni resultados de evaluacion, y su model card es practicamente la plantilla autogenerada por TRL. El propio ejemplo de "Quick start" de la tarjeta es generico (una pregunta existencial sobre viajar en el tiempo), no un ejemplo de generacion SQL, lo que sugiere que el modelo fue subido sin adaptar la documentacion a la tarea real.

La relevancia de esta ficha es, por tanto, sobre todo informativa: sirve como caso de estudio de un ajuste QLoRA reproducible sobre una base de 3B parametros, y permite entender que se puede esperar (y que no) de un checkpoint de este tipo antes de evaluarlo por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama 3.2 3B Instruct; no se detalla en el repositorio) |
| Parametros totales | 3.210 millones (3,21 B) en el modelo base; el repositorio no publica el recuento del ajuste |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128.000 tokens en el modelo base; no se confirma en el repositorio |
| Tipos de cuantizacion | Entrenamiento QLoRA (4 bits) segun el nombre del repositorio; no se publican variantes cuantizadas. Los pesos en safetensors admiten conversion a GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponibles en el repositorio; el modelo base declara 8 idiomas oficiales (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | No disponible. La model card contiene el marcador de plantilla "licence: license" sin especificar. Al derivar de Llama 3.2, es previsible que aplique la Llama 3.2 Community License, pero no esta confirmado |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Tarea declarada | text-to-sql (generacion de SQL a partir de lenguaje natural) |
| Metodo de entrenamiento | SFT con TRL (no se indican hiperparametros, epochs ni learning rate) |
| Tamano del repositorio | 2,4 GB (no se especifica si contiene pesos fusionados o solo adaptadores) |
| Libreria | transformers |
| Autor | vkovtun |
| Fecha de creacion | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |
| Descargas / likes | 0 / 0 |
| Versiones de framework | TRL 1.12.0, Transformers 5.16.1, PyTorch 2.14.0, Datasets 5.0.1, Tokenizers 0.23.2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Llama 3.2 3B Instruct: un transformer decoder-only con atencion grouped-query (GQA), normalizacion RMSNorm y activacion SwiGLU, con tokenizador BPE de 128.256 entradas. Al tratarse de un ajuste QLoRA, los pesos base se congelan en precision de 4 bits y unicamente se entrenan los adaptadores de bajo rango insertados en las capas de atencion y proyeccion, lo que reduce drasticamente el consumo de VRAM frente a un ajuste completo. El repositorio no publica el rango (r), alpha, dropout, tasa de aprendizaje, numero de pasos ni la composicion del dataset, por lo que no es posible reproducir el entrenamiento con la informacion disponible.

El unico artefacto de trazabilidad es un enlace a una ejecucion de Weights & Biases (`wandb.ai/viktor-kovtun/llama-text-to-sql/runs/ughhr1zb`), que constituye la unica fuente potencial de curvas de perdida e hiperparametros. No se documenta ningun tipo de RLHF, DPO o preferencia humana; el proceso declarado es exclusivamente SFT supervisado. Tampoco se indica si los adaptadores se fusionaron con los pesos base antes de subirlos, dato relevante porque un repositorio de 2,4 GB es coherente con varias combinaciones (adaptadores mas estados, pesos en precision reducida o pesos parcialmente fusionados) y condiciona como debe cargarse el modelo.

## Capacidades

Las siguientes capacidades son las esperables por herencia del modelo base y por la tarea declarada en el nombre del repositorio; no estan verificadas ni documentadas en la model card:

- Generacion de lenguaje natural en tareas generales de instruccion, con el estilo y las capacidades del modelo Llama 3.2 3B Instruct.
- Generacion de consultas SQL a partir de descripciones en lenguaje natural, presumiblemente sobre un esquema de base de datos proporcionado en el contexto (es la tarea que da nombre al repositorio).
- Razonamiento de un solo paso y multi-paso limitado, propio de un modelo de 3B parametros.
- Generacion de codigo generico en lenguajes habituales, en menor medida que modelos especificos de codigo del mismo tamano.
- Capacidad multilingue heredada del modelo base (8 idiomas oficiales), sin garantia de rendimiento en text-to-SQL fuera del ingles.
- Comprension de instrucciones conversacionales multi-turno, gracias al ajuste instructivo del modelo base.
- Soporte de tool calling y function calling: no confirmado en este ajuste. El modelo base Llama 3.2 Instruct admite plantillas de llamada a herramientas, pero el ajuste puede haber degradado esa capacidad al no incluirla en los datos de SFT.
- Capacidades de agente, vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Asistente de consultas para analistas de negocio: el modelo traduce preguntas en lenguaje natural ("cuantas ventas hubo en el segundo trimestre por region") a SQL ejecutable contra un esquema documentado en el prompt, reduciendo la dependencia de un analista tecnico para consultas repetitivas.
- Generacion de SQL en herramientas de BI: integrado como complemento de un editor de dashboards, sugiere consultas mientras el usuario escribe y evita escribir JOINs manuales.
- Preprocesado en pipelines de datos: convertir especificaciones funcionales redactadas en tickets a consultas de transformacion ejecutables en dbt o Airflow, que despues se revisan en revision de codigo.
- Prototipado rapido de APIs de datos: dada una descripcion funcional y un esquema, generar el conjunto inicial de consultas que alimentara los endpoints de una API interna.
- Chatbot interno de soporte a datos: desplegado con vLLM sobre una GPU unica, responde en pocos cientos de milisegundos preguntas frecuentes contra una base de datos corporativa, con validacion posterior del SQL generado antes de ejecutarlo.
- Migracion entre motores de base de datos: adaptar consultas escritas para un motor (por ejemplo, Oracle) a la sintaxis de otro (PostgreSQL, BigQuery) partiendo de la consulta original y el dialecto destino.
- Generacion de datos sinteticos para evaluacion: producir pares pregunta-SQL que despues se filtran y validan manualmente para construir un conjunto de evaluacion propio.
- Filtro de seguridad en consultas: dado que el modelo es pequeno y se puede ejecutar en local, usarlo para clasificar si una consulta generada contiene operaciones destructivas (DROP, DELETE sin WHERE) antes de permitir su ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (ni MMLU, ni HumanEval, ni Spider/BIRD, que serian los benchmarks naturales para text-to-SQL), no se especifica el conjunto de datos de validacion y no hay comparacion con el modelo base ni con alternativas.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo base (3,21 B parametros); el repositorio no publica requisitos ni mediciones:

- Pesos en FP16/BF16: en torno a 6,5 GB, con un consumo total de inferencia de 8-10 GB de VRAM contando cache KV y overhead.
- Pesos en INT8: en torno a 3,5 GB, con 5-6 GB de VRAM totales.
- Pesos en GGUF Q4_K_M: en torno a 2 GB, con 3-4 GB de VRAM totales; ejecutable tambien en CPU con 8-16 GB de RAM.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, asi como en equipos Apple Silicon con 16 GB de memoria unificada o mas.
- Para servicio de produccion con vLLM o TGI se recomienda una GPU con al menos 16 GB (RTX 4090, L4, A10G); con A100 o H100 el modelo resulta sobredimensionado en memoria, aunque util si se sirven muchas replicas en la misma GPU.
- Opciones de despliegue: transformers con bitsandbytes para carga en 4/8 bits; vLLM o TGI para servido en precision completa o con pesos cuantizados AWQ/GPTQ; llama.cpp, Ollama y LM Studio a partir de una conversion a GGUF; el campo `endpoints_compatible` del repositorio indica compatibilidad con Inference Endpoints de HuggingFace.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni datos de la ejecucion de W&B que las aporten.

## Comparativa con modelos similares

La comparativa es estructural, ya que no hay datos de rendimiento de este ajuste. Los datos de los modelos alternativos proceden de su documentacion publica y no se han verificado en esta ficha.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vkovtun/llama-text-to-sql-...-QLORA | 3,21 B (base) | 128.000 tokens (heredado) | Text-to-SQL (ajuste QLoRA no evaluado) | No disponible | HuggingFace, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Instrucciones generales | Llama 3.2 Community License | Ampliamente disponible |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3,09 B | 32.768 tokens nativos | Codigo y SQL | Apache 2.0 | Ampliamente disponible |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 tokens | Instrucciones generales | Apache 2.0 | Ampliamente disponible |

Frente al modelo base, el unico valor anadido de este checkpoint seria la especializacion en text-to-SQL, que no esta demostrada con ninguna metrica. Frente a Qwen2.5-Coder-3B-Instruct, de tamano casi identico, la alternativa parte de Apache 2.0 (sin ambiguedad legal) y de una especializacion en codigo documentada y evaluada. Frente a Mistral-7B-Instruct-v0.3, este ultimo duplica los parametros a cambio de una licencia permisiva y una comunidad mucho mayor.

## Limitaciones y advertencias

- Licencia no declarada: la model card contiene el marcador "licence: license" sin resolver. No hay autorizacion explicita de uso comercial ni condiciones claras de redistribucion. Al derivar de Llama 3.2, es previsible que se aplique la Llama 3.2 Community License, pero esto deberia confirmarse con el autor antes de cualquier uso en produccion.
- Ausencia total de evaluacion: sin benchmarks, sin conjunto de validacion descrito y sin comparacion con el modelo base, no hay evidencia de que el ajuste mejore al Llama 3.2 3B Instruct original en text-to-SQL.
- Dataset de entrenamiento no documentado: se desconoce el origen, el volumen y la licencia de los datos. Si el ajuste se hizo sobre un dataset con licencia restrictiva (por ejemplo, esquemas de bases de datos propietarios), la redistribucion del checkpoint podria ser problematica.
- Riesgo alto de alucinacion de esquema: los modelos pequenos de text-to-SQL tienden a inventar nombres de tablas y columnas que no existen, o a generar SQL sintacticamente valido pero semanticamente incorrecto. Es imprescindible validar la consulta contra el esquema y ejecutarla en un entorno restringido.
- Riesgo de SQL destructivo: el modelo puede generar sentencias `DELETE`, `UPDATE` o `DROP` sin filtro. Cualquier despliegue debe ejecutar las consultas con un usuario de solo lectura y con limites de tiempo y filas.
- Capacidad multilingue no garantizada en la tarea: no hay evidencia de que genere SQL correctamente a partir de preguntas en castellano, a pesar de que el modelo base soporte espanol.
- Posible degradacion de capacidades generales: un ajuste SFT estrecho sobre 3B parametros suele reducir el rendimiento en tareas ajenas a la de entrenamiento, incluidas la llamada a herramientas y la conversacion general.
- Model card poco fiable: el ejemplo de uso de la tarjeta es una plantilla generica sin relacion con SQL, y la fecha de creacion (2026) es posterior a las versiones de framework declaradas. Esto indica que la documentacion no se reviso.
- Repositorio sin traccion: 0 descargas y 0 likes implican que no ha sido validado por terceros; no existen informes independientes de calidad.
- Comportamiento indefinido con contexto largo: aunque el modelo base soporte 128.000 tokens, un ajuste QLoRA puede degradar la atencion en posiciones lejanas, justo donde suele colocarse el esquema de la base de datos.
- Los resultados de la busqueda web asociados a esta ficha no contienen informacion sobre el modelo (corresponden a ofertas de viajes a Rodas), por lo que no aportan ninguna verificacion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vkovtun/llama-text-to-sql-2026-09-21_18.25.18-finetune-QLORA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/viktor-kovtun/llama-text-to-sql/runs/ughhr1zb
- Libreria TRL (usada para el SFT): https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Referencia de la licencia Llama 3.2 (aplicabilidad por confirmar): https://www.llama.com/llama3_2/license/
- Paper o blog oficial del modelo: no disponible
- Repositorio de codigo del ajuste: no disponible
- Demo: no disponible
- Conjunto de datos de entrenamiento: no disponible

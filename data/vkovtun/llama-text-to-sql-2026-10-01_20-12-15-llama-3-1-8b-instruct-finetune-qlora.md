# vkovtun/llama-text-to-sql-2026-10-01_20.12.15-Llama-3.1-8B-Instruct-finetune-QLORA

## Resumen

El modelo `vkovtun/llama-text-to-sql-2026-10-01_20.12.15-Llama-3.1-8B-Instruct-finetune-QLORA` es un ajuste fino del modelo instructivo `meta-llama/Llama-3.1-8B-Instruct` de Meta, publicado por el usuario vkovtun en HuggingFace. Por el nombre del repositorio y por los tags declarados (`trl`, `sft`, `generated_from_trainer`), se trata de un ajuste supervisado (SFT) orientado a la tarea de text-to-SQL, es decir, convertir una pregunta en lenguaje natural junto con un esquema de base de datos en una consulta SQL ejecutable. El entrenamiento se ha realizado con la libreria TRL de HuggingFace, segun la propia model card.

El interes de esta ficha es limitado pero concreto: es un ejemplo de pipeline de ajuste fino reproducible con TRL sobre un modelo base de 8.000 millones de parametros y 128.000 tokens de contexto, un tamano que se puede entrenar con QLoRA en una sola GPU de consumo o de gama profesional. El repositorio ocupa 0,1 GB, un tamano compatible con adaptadores LoRA y no con los pesos completos de un modelo de 8B en precision de 16 bits (que rondarian los 16 GB), aunque la model card no confirma explicitamente este punto ni incluye el tag `peft`.

La relevancia actual del checkpoint es sobre todo metodologica y de trazabilidad: permite reproducir la receta (SFT con TRL sobre Llama 3.1 8B Instruct) y compararla con otros experimentos similares del mismo autor. Como artefacto de produccion presenta carencias documentales importantes: no se especifica el dataset de entrenamiento, no hay resultados de evaluacion, no se declara licencia y el repositorio no incluye pesos en formato GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama 3.1 8B Instruct) |
| Parametros totales | 8.000 millones (modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; no disponible si el ajuste la modifica |
| Tipos de cuantizacion | no disponible en el repositorio (no se publican pesos GGUF, GPTQ ni AWQ); el ajuste se realizo con QLoRA, lo que implica cuantizacion en 4 bits NF4 durante el entrenamiento |
| Idiomas soportados | no disponible para el ajuste fino; el modelo base declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin concretar; al derivar de Llama 3.1, se heredan las condiciones de la licencia comunitaria de Llama 3.1) |
| Formato de pesos | safetensors (tag del repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only con atencion por consultas agrupadas (GQA), 32 capas, 4.096 dimensiones de modelo, 32 cabezas de atencion y 8 cabezas de clave/valor, con normalizacion RMSNorm y activacion SwiGLU. El modelo base fue preentrenado por Meta sobre mas de 15 billones de tokens y posteriormente alineado con ajuste supervisado y optimizacion por preferencias. El ajuste publicado mantiene esa arquitectura sin cambios estructurales; lo que varia son los pesos.

Sobre el procedimiento de ajuste, la model card indica unicamente que se utilizo SFT con TRL (version 1.12.0) sobre Transformers 5.16.1, PyTorch 2.14.0 y Datasets 5.0.1, con un enlace a un run de Weights & Biases (`wandb.ai/viktor-kovtun/llama-text-to-sql/runs/yodp2ujw`). El sufijo `QLORA` del nombre indica que el entrenamiento empleo cuantizacion de 4 bits del modelo base con adaptadores LoRA de bajo rango. No se documentan el numero de tokens de entrenamiento, la composicion del dataset de text-to-SQL, el rango y alpha de LoRA, la tasa de aprendizaje ni el numero de epocas.

## Capacidades

- Generacion de consultas SQL a partir de lenguaje natural y un esquema de base de datos, que es la tarea objetivo declarada por el nombre del repositorio.
- Generacion de texto general y conversacion multi-turno, heredadas del modelo base instructivo.
- Razonamiento y generacion de codigo en lenguajes de programacion convencionales, como capacidad heredada del modelo base.
- Soporte de tool calling y function calling: el modelo base Llama 3.1 Instruct lo soporta de forma nativa; no se ha verificado que el ajuste lo preserve.
- Capacidades multilingues: las del modelo base (ocho idiomas declarados); no se ha verificado el comportamiento del ajuste fuera del ingles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras modalidades: no disponibles; es un modelo exclusivamente de texto.

## Casos de uso

- Generacion de consultas SQL en herramientas de analitica self-service: el modelo recibe el esquema de las tablas y la pregunta del usuario y devuelve la sentencia SQL, de modo que un analista sin conocimientos de SQL pueda consultar un almacen de datos.
- Asistente integrado en un IDE o cuaderno de datos: autocompletado y explicacion de consultas sobre un catalogo de tablas concreto, aprovechando la ventana de 128.000 tokens del modelo base para incluir esquemas extensos.
- Capa de traduccion pregunta-a-consulta en un chatbot de business intelligence: el texto generado por el usuario se convierte en SQL y se ejecuta contra un motor como PostgreSQL o SQLite, devolviendo el resultado en lenguaje natural.
- Migracion y refactorizacion de consultas: a partir de un esquema antiguo y uno nuevo, el modelo puede reescribir consultas existentes para adaptarlas a los cambios de modelo de datos.
- Generacion de consultas de auditoria y monitorizacion: traduccion de preguntas de negocio del tipo "que cuentas no han facturado este mes" a consultas parametrizadas sobre tablas de hechos.
- Docencia y formacion en SQL: el modelo puede explicar la consulta generada y justificar las clausulas empleadas, util para entornos de aprendizaje.
- Prototipado rapido de pipelines de datos: generacion de consultas de transformacion para pruebas de concepto antes de fijarlas en un repositorio de dbt o similar.

En todos los casos conviene anadir una capa de validacion: ejecutar la consulta en un entorno de solo lectura y verificar el resultado antes de exponerlo al usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud de ejecucion (execution accuracy), coincidencia exacta (exact match), BLEU ni ninguna otra evaluacion sobre conjuntos como Spider, BIRD o WikiSQL, y tampoco incluye comparaciones con el modelo base.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 16 GB solo para los pesos de 8B, mas cache KV y activaciones; en la practica se recomiendan 20-24 GB para contextos moderados.
- VRAM en cuantizacion de 8 bits: del orden de 9 GB de pesos.
- VRAM en cuantizacion de 4 bits (NF4, GPTQ o AWQ): del orden de 5-6 GB de pesos.
- Cache KV con contexto completo: en el modelo base, con 8 cabezas KV de dimension 128 y 32 capas, cada token ocupa aproximadamente 128 KiB en FP16, por lo que una ventana de 128.000 tokens requiere del orden de 16 GB adicionales. Esto hace inviable el contexto maximo en GPU de consumo sin tecnicas de atencion eficiente o cuantizacion de la cache.
- GPU recomendadas: A100 40 GB o 80 GB, H100, L40S 48 GB para BF16 con contexto largo; RTX 4090 o RTX 3090 de 24 GB para BF16 con contexto moderado o para 8 bits con contexto amplio; RTX 3060 de 12 GB, RTX 4070 o similares para cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits de forma holgada, y en 8 bits en tarjetas de 12 GB o mas.
- Opciones de despliegue: vLLM, TGI, SGLang y transformers para servir en GPU; llama.cpp y Ollama son viables solo si se convierten previamente los pesos a GGUF, conversion que el repositorio no incluye. Si el artefacto publicado son adaptadores LoRA, habra que fusionarlos con el modelo base antes de exportar a GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y no se especifica el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (text-to-SQL QLoRA) | 8B | 128.000 tokens (heredados) | no disponible | HuggingFace, 0 descargas, 0 likes | Sin benchmarks ni dataset documentado |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Licencia comunitaria de Llama 3.1 | HuggingFace, ampliamente desplegado | Modelo base; no especializado en SQL |
| vkovtun/llama-text-to-sql-2026-09-22_11.38.10-finetune-QLORA | no disponible | no disponible | no disponible | HuggingFace | Checkpoint anterior del mismo autor, con la misma receta aparente |
| vkovtun/llama-text-to-sql-2026-09-24_08.21.54-finetune-QLORA-8B | no disponible | no disponible | no disponible | HuggingFace | Otro checkpoint intermedio del mismo autor |
| Otros ajustes text-to-SQL de 7-8B (por ejemplo, variantes basadas en Llama 2 o CodeLlama) | 7-8B | variable segun la familia | variable | HuggingFace y GitHub | No se dispone de datos comparativos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento: se desconoce si procede de Spider, BIRD, WikiSQL, datos sinteticos o un corpus privado, lo que impide juzgar la cobertura de dialectos SQL y de esquemas.
- Ausencia total de evaluacion: sin exactitud de ejecucion ni comparacion con el modelo base, no hay evidencia publicada de que el ajuste mejore a `Llama-3.1-8B-Instruct` en text-to-SQL.
- Riesgo de alucinacion de esquema: es habitual que los modelos de esta familia inventen nombres de tablas o columnas que no existen en el catalogo proporcionado; toda consulta generada debe validarse contra el esquema real.
- Riesgo de consultas destructivas: el modelo puede generar sentencias `DELETE`, `UPDATE` o `DROP`; conviene restringir la ejecucion a usuarios de solo lectura y anadir filtros automaticos.
- Licencia no declarada: el campo de licencia de la model card no concreta nada. Al ser un derivado de Llama 3.1, se aplican las condiciones de la licencia comunitaria de Llama 3.1, que incluyen obligaciones de atribucion y clausulas de uso aceptable; la ausencia de una licencia explicita es un riesgo juridico para uso comercial.
- Idioma: no se declara el idioma del ajuste; los corpus de text-to-SQL suelen ser en ingles, por lo que el rendimiento en castellano no esta verificado.
- Tamano del repositorio: 0,1 GB es incompatible con pesos completos de 8B en FP16; lo mas probable es que contenga adaptadores LoRA, pero la model card no lo confirma ni incluye el tag `peft`, lo que puede dificultar la carga directa.
- Ejemplo de uso poco representativo: el fragmento de codigo de la model card plantea una pregunta generica de generacion de texto y no un caso de text-to-SQL, por lo que no sirve como verificacion de la tarea objetivo.
- Compatibilidad de versiones: se ha entrenado con Transformers 5.16.1 y TRL 1.12.0, versiones muy posteriores a las actuales en muchos entornos; puede requerir actualizaciones de dependencias.
- Metricas de adopcion nulas: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vkovtun/llama-text-to-sql-2026-10-01_20.12.15-Llama-3.1-8B-Instruct-finetune-QLORA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Run de entrenamiento en Weights & Biases: https://wandb.ai/viktor-kovtun/llama-text-to-sql/runs/yodp2ujw
- Repositorio de TRL: https://github.com/huggingface/trl
- Checkpoint previo del mismo autor: https://huggingface.co/vkovtun/llama-text-to-sql-2026-09-22_11.38.10-finetune-QLORA
- Otro checkpoint del mismo autor: https://huggingface.co/vkovtun/llama-text-to-sql-2026-09-24_08.21.54-finetune-QLORA-8B
- Repositorio de referencia sobre ajuste de Llama 3.1 8B para text-to-SQL con QLoRA: https://github.com/HugoS7/llama-text2sql
- Repositorio SQL-LLaMA2 (ajuste de Llama 2 para text-to-SQL): https://github.com/DominikLindorfer/SQL-LLaMA2
- Tutorial de ajuste de Llama 2 para text-to-SQL con LlamaIndex: https://medium.com/llamaindex-blog/easily-finetune-llama-2-for-your-text-to-sql-applications-ecd53640e10d

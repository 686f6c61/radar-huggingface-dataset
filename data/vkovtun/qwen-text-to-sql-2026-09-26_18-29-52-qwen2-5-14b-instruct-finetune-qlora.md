# vkovtun/qwen-text-to-sql-2026-09-26_18.29.52-Qwen2.5-14B-Instruct-finetune-QLORA

## Resumen

`vkovtun/qwen-text-to-sql-2026-09-26_18.29.52-Qwen2.5-14B-Instruct-finetune-QLORA` es un ajuste fino del modelo `Qwen/Qwen2.5-14B-Instruct` publicado por el usuario vkovtun el 26 de septiembre de 2026. Segun el nombre del repositorio, el objetivo del ajuste es la generacion de SQL a partir de lenguaje natural (text-to-SQL), y se ha entrenado mediante SFT (supervised fine-tuning) con QLoRA utilizando la libreria TRL. La model card es la plantilla autogenerada por TRL y no documenta ni el conjunto de datos, ni los hiperparametros, ni resultados de evaluacion.

El repositorio ocupa 1,4 GB y contiene pesos en formato safetensors, lo que es incompatible con los pesos completos de un modelo de 14.000 millones de parametros (unos 28 GB en bf16). Esto sugiere que se trata de un adaptador LoRA/QLoRA que requiere el modelo base para funcionar, aunque la model card no lo confirma explicitamente. El modelo acumula 0 descargas y 0 likes en el momento de la consulta.

Su relevancia practica es limitada pero acotada: si el adaptador funciona, permitiria disponer de un generador NL2SQL de 14B con 32.768 tokens de contexto (ampliables a 131.072 con YaRN en el modelo base) desplegable en una sola GPU profesional o en hardware de consumo con cuantizacion de 4 bits. Sin embargo, la ausencia de licencia definida, de datos de entrenamiento y de benchmarks lo convierten en un artefacto experimental que exige validacion propia antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada de Qwen2.5-14B-Instruct): 48 capas, atencion con GQA, RoPE, SwiGLU y RMSNorm |
| Parametros totales | 14.700 millones en el modelo base; no disponible para el ajuste (repositorio de 1,4 GB, compatible con un adaptador LoRA) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens en el modelo base, ampliable a 131.072 con YaRN; el ajuste no documenta cambios en la ventana de contexto |
| Tipos de cuantizacion | No disponible en el repositorio. El modelo base admite GPTQ, AWQ, GGUF y cuantizacion de 4/8 bits con bitsandbytes |
| Idiomas soportados | No disponibles en la ficha del ajuste. El modelo base Qwen2.5-14B-Instruct declara soporte para mas de 29 idiomas, entre ellos castellano, ingles, chino, frances, aleman, portugues, italiano, ruso, japones y coreano |
| Licencia | No disponible. El campo YAML del repositorio contiene el marcador `licence: license`. El modelo base se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); etiquetado como `generated_from_trainer` |
| Tamano del repositorio | 1,4 GB |
| Fecha de publicacion | 26 de septiembre de 2026 (creacion), ultima actualizacion el mismo dia |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-14B-Instruct: un transformer decoder-only de 48 capas con 14.700 millones de parametros, atencion de consultas agrupadas (GQA), embeddings rotatorios (RoPE), activacion SwiGLU y normalizacion RMSNorm. No se trata de un modelo MoE ni de una arquitectura hibrida con espacio de estados; el ajuste no modifica la topologia del modelo base, solo anade (presumiblemente) matrices de bajo rango sobre las proyecciones de atencion y MLP.

El entrenamiento se realizo con SFT a traves de TRL 1.12.0, con Transformers 5.16.1, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2. El sufijo `QLORA` del nombre indica cuantizacion del modelo base a 4 bits durante el entrenamiento con adaptadores LoRA. La model card enlaza una ejecucion de Weights & Biases (`viktor-kovtun/qwen-text-to-sql/runs/smnqz6m1`) como unico registro del proceso. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, la duracion, el rango de LoRA, la tasa de aprendizaje, el numero de epocas ni sobre si se aplicaron etapas posteriores de DPO, RLHF u optimizacion por preferencias. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal o similar).

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas del modelo base Qwen2.5-14B-Instruct.
- Generacion de consultas SQL a partir de descripciones en lenguaje natural, segun el nombre y el proposito declarado del ajuste. Al no existir documentacion, el alcance real (dialectos cubiertos, tolerancia a esquemas grandes, exactitud) es no verificable sin evaluacion propia.
- Razonamiento multi-paso y resolucion de problemas, capacidad propia del modelo base.
- Generacion de codigo en lenguajes de proposito general, tambien heredada del modelo base.
- Soporte de function calling / tool calling y de salidas estructuradas en formato JSON, segun las capacidades declaradas para la familia Qwen2.5-Instruct.
- Capacidad multilingue: mas de 29 idiomas en el modelo base. El ajuste no declara idiomas especificos.
- Modo de razonamiento explicito (thinking mode): no disponible; Qwen2.5-Instruct no incorpora un modo de pensamiento separado como si hacen otras familias.
- Vision, audio u otras modalidades: no soportadas (el modelo base es exclusivamente de texto).
- Contexto largo: hasta 32.768 tokens de forma nativa en el modelo base, con extension a 131.072 mediante YaRN.

## Casos de uso

- Generacion de consultas SQL sobre esquemas conocidos: el modelo recibe el DDL de las tablas y una pregunta de negocio, y devuelve la sentencia SELECT. Los 32.768 tokens de contexto del modelo base permiten incluir esquemas con decenas de tablas y columnas en un solo prompt.
- Analitica de autoservicio en herramientas de BI: integrado como backend de un asistente que traduce preguntas de usuarios no tecnicos a consultas ejecutables contra un almacen de datos, con validacion sintactica previa a la ejecucion.
- Enriquecimiento de pipelines de datos: generacion automatica de consultas de transformacion en Airflow o dbt a partir de descripciones en lenguaje natural, sujeto a revision humana antes del despliegue.
- Traduccion entre dialectos SQL: conversion de consultas escritas para PostgreSQL, MySQL o SQL Server a otro dialecto, aprovechando el conocimiento de codigo del modelo base.
- Documentacion y explicacion de consultas existentes: dado un fragmento de SQL heredado, generar una descripcion en lenguaje natural de su logica, util en procesos de auditoria y traspaso de conocimiento.
- Agentes de analitica multi-paso: con soporte de tool calling, el modelo puede encadenar la inspeccion del esquema, la generacion de la consulta, la ejecucion mediante una herramienta y la interpretacion del resultado.
- Generacion de casos de prueba y validacion de esquemas: produccion de consultas de comprobacion o de aserciones sobre integridad de datos en entornos de test.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (ni MMLU, ni HumanEval, ni GSM8K, ni metricas especificas de text-to-SQL como Spider o BIRD), y la ejecucion de Weights & Biases enlazada corresponde a curvas de entrenamiento, no a evaluacion. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- Pesos del modelo base en bf16: aproximadamente 28-29 GB solo para los pesos, mas cache KV. Requiere GPU de 40 GB (A100 40 GB) o superior para secuencias cortas; recomendable H100 80 GB o A100 80 GB para contextos largos.
- Cuantizacion de 8 bits: alrededor de 15-16 GB de VRAM, viable en una RTX 4090 (24 GB) o L40S.
- Cuantizacion de 4 bits (NF4, GPTQ o AWQ): aproximadamente 8-10 GB de pesos, lo que permite inferencia en GPU de consumo como RTX 3090, RTX 4070 Ti Super, RTX 4080 o RTX 4090, dejando margen para cache KV.
- El repositorio tiene 1,4 GB, por lo que si finalmente se confirma que es un adaptador LoRA, es imprescindible descargar y cargar por separado `Qwen/Qwen2.5-14B-Instruct` (unos 28 GB) y aplicar el adaptador con PEFT.
- Opciones de despliegue: transformers + PEFT para el adaptador; vLLM o TGI para servir el modelo fusionado; llama.cpp, Ollama o LM Studio solo si se genera previamente una version GGUF, que no se distribuye en el repositorio.
- Multi-GPU: no necesario en bf16 si se dispone de una GPU de 80 GB; con dos RTX 4090 de 24 GB es posible repartir el modelo en bf16 mediante tensor parallelism en vLLM, aunque la cuantizacion a 4 bits en una sola tarjeta es la opcion mas economica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vkovtun/qwen-text-to-sql-…-QLORA (este modelo) | 14,7 B (base) | 32.768 tokens (base) | Text-to-SQL por ajuste SFT+QLoRA | No disponible (marcador `licence: license`) | Repositorio de 1,4 GB, 0 descargas, sin evaluacion publicada |
| Qwen/Qwen2.5-14B-Instruct | 14,7 B | 32.768 tokens, 131.072 con YaRN | Instrucciones generales, codigo, tool calling | Apache-2.0 | Muy extendido, con versiones GGUF, GPTQ y AWQ de terceros |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,7 B | 32.768 tokens, 131.072 con YaRN | Codigo y SQL como parte de su entrenamiento en codigo | Apache-2.0 | Ampliamente disponible y cuantizado |
| SQLCoder-7B-2 (Defog) | 7 B | no disponible | Text-to-SQL especifico | CC BY-SA 4.0 (segun su ficha publica) | Disponible con cuantizaciones de la comunidad |

Los datos de los modelos alternativos corresponden a la informacion publica de sus respectivas fichas; no se dispone de una comparacion de rendimiento con este ajuste porque no se han publicado resultados de evaluacion.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada por TRL: no especifica dataset, hiperparametros, epocas ni criterios de seleccion del punto de control, por lo que el proceso de entrenamiento no es reproducible a partir de la informacion publicada.
- El campo de licencia contiene el marcador `licence: license`, sin valor juridico. No hay autorizacion explicita para uso comercial, y la licencia final del ajuste podria diferir de la Apache-2.0 del modelo base. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- El repositorio acumula 0 descargas y 0 likes, y no consta evaluacion independiente: se trata de un artefacto sin validacion por parte de terceros.
- La fecha de publicacion registrada (26 de septiembre de 2026) es posterior a la de los frameworks citados en la ficha; conviene verificar la coherencia de los metadatos antes de confiar en ellos.
- Riesgo de alucinacion en la generacion de SQL: el modelo puede inventar tablas, columnas o funciones que no existen en el esquema, o producir uniones incorrectas que devuelvan resultados plausibles pero erroneos. Es obligatorio validar sintactica y semanticamente cada consulta generada.
- Sensibilidad al dialecto: el ajuste no documenta que dialectos SQL cubre. Una consulta correcta en PostgreSQL puede fallar en MySQL, SQL Server, Oracle o BigQuery.
- Sesgos: los heredados del modelo base Qwen2.5-14B-Instruct, que no han sido auditados ni corregidos en este ajuste. No hay informacion sobre sesgos especificos introducidos por el dataset de ajuste, que se desconoce.
- Limitaciones de contexto: aunque el modelo base soporta 32.768 tokens, los esquemas de bases de datos grandes, junto con el historial de conversacion y los ejemplos, pueden superar esa ventana. La ampliacion a 131.072 tokens con YaRN degrada la calidad si no se ajusta el factor de escala correctamente y no esta confirmada para este ajuste.
- Cobertura idiomatica no verificada: la ficha no declara idiomas y el ejemplo de la model card esta en ingles, por lo que el rendimiento en castellano es desconocido.
- Si el repositorio contiene un adaptador LoRA y no pesos fusionados, el despliegue exige cargar el modelo base completo, lo que incrementa los requisitos de VRAM y anade una dependencia externa a la version de PEFT y Transformers.
- No se distribuyen cuantizaciones GGUF ni GPTQ/AWQ, por lo que cualquier despliegue en llama.cpp, Ollama o vLLM en 4 bits requiere una conversion propia y su correspondiente validacion de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vkovtun/qwen-text-to-sql-2026-09-26_18.29.52-Qwen2.5-14B-Instruct-finetune-QLORA
- Modelo base Qwen2.5-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/viktor-kovtun/qwen-text-to-sql/runs/smnqz6m1
- Repositorio de TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Informe tecnico de la familia Qwen2.5 (referencia del modelo base): https://arxiv.org/abs/2412.15115
- Blog de presentacion de Qwen2.5 (referencia del modelo base): https://qwenlm.github.io/blog/qwen2.5/

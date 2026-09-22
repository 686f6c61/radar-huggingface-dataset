# zk-mohammad/cluster-sql-worker-7B

## Resumen

cluster-sql-worker-7B es un ajuste fino (fine-tune) publicado por el usuario zk-mohammad en HuggingFace, derivado de unsloth/qwen2.5-coder-7b-instruct-bnb-4bit, que a su vez es la version cuantizada a 4 bits del modelo Qwen2.5-Coder-7B-Instruct de Alibaba. El nombre del repositorio sugiere un modelo orientado a tareas de SQL dentro de una arquitectura de "cluster" de agentes trabajadores, aunque la model card no describe el dataset ni el objetivo concreto del entrenamiento.

El repositorio tiene un tamano de 0,2 GB, lo que apunta a que contiene adaptadores LoRA (PEFT) y no los pesos completos del modelo: para su uso hay que cargar el modelo base y aplicar los adaptadores, o fusionarlos previamente. Esta es la advertencia practica mas importante de la ficha, porque un checkpoint de 0,2 GB no es desplegable por si solo.

La relevancia del modelo es limitada y experimental: cuenta con 0 descargas y 0 likes en el momento de la consulta, no incluye resultados de benchmarks ni detalles del dataset de entrenamiento, y solo declara soporte para ingles. Se apoya en la licencia Apache-2.0 heredada del modelo base, lo que permite uso comercial sin restricciones adicionales conocidas, pero la ausencia de evaluacion publicada obliga a validarlo internamente antes de cualquier uso en produccion. El entrenamiento se realizo con Unsloth y TRL, segun los tags del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con RoPE, SwiGLU, RMSNorm y GQA (heredada del modelo base Qwen2.5-Coder-7B; no confirmada en la model card) |
| Parametros totales | No disponible en la model card; el modelo base declara 7,61 mil millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base soporta 32.768 tokens nativos, extensibles a 131.072 mediante YaRN |
| Tipos de cuantizacion | El modelo base esta en bnb-4bit (bitsandbytes NF4); no se publican versiones GGUF, GPTQ ni AWQ de este fine-tune |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); el tamano del repositorio (0,2 GB) sugiere adaptadores LoRA y no pesos completos |
| Modelo base | unsloth/qwen2.5-coder-7b-instruct-bnb-4bit |
| Autor | zk-mohammad |
| Pipeline declarado | No disponible |
| Fecha de publicacion | 22 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B-Instruct: un transformer decoder-only causal de 7,61 mil millones de parametros, con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA) para reducir el coste de la cache KV. El modelo base fue entrenado por Alibaba sobre un corpus de codigo del orden de 5,5 billones de tokens, seguido de una fase de instruccion y alineacion. El fine-tune parte de la version cuantizada a 4 bits de Unsloth (bnb-4bit), lo que implica que el entrenamiento se hizo sobre pesos ya cuantizados: es un enfoque eficiente en memoria, pero introduce una perdida de precision respecto a un ajuste sobre FP16 que no ha sido cuantificada por el autor.

No hay informacion sobre el dataset de ajuste fino, el numero de tokens vistos, la composicion de las muestras, la existencia de RLHF o DPO, ni los hiperparametros de entrenamiento. Los tags del repositorio (unsloth, trl, transformers, text-generation-inference) indican que se uso el stack de Unsloth con TRL, probablemente mediante SFTTrainer sobre adaptadores LoRA, pero no se detalla la configuracion de LoRA (rango, alpha, modulos objetivo) ni si hubo fusion posterior. Tampoco se documenta ninguna innovacion tecnica propia: el valor del repositorio esta exclusivamente en el ajuste, no en aportaciones arquitectonicas.

## Capacidades

- Generacion de codigo: hereda del modelo base la capacidad de generar y completar codigo en mas de 40 lenguajes de programacion, con especial enfasis en SQL, Python, JavaScript, Java y C++.
- Generacion y transformacion de SQL: el nombre del modelo sugiere un ajuste orientado a consultas SQL, aunque no hay evaluacion publicada que lo confirme.
- Seguimiento de instrucciones: el modelo base esta ajustado como instruct, por lo que admite peticiones en formato conversacional y plantillas de chat de Qwen.
- Tool calling / function calling: el modelo base Qwen2.5-Coder-Instruct soporta llamadas a funciones con plantillas Hermes-style; se desconoce si el fine-tune preserva esta capacidad intacta.
- Razonamiento multi-paso y uso como agente: el modelo base esta disenado para tareas de codigo agente, pero no hay evidencia publicada de que el fine-tune mantenga ese comportamiento.
- Relleno de codigo en medio del contexto (fill-in-the-middle): soportado en la familia Qwen2.5-Coder, no confirmado tras el ajuste.
- Capacidades multilingues: limitadas al ingles segun la declaracion del autor; el modelo base soporta mas idiomas, pero el autor solo declara en.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio o multimodalidad: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Text-to-SQL en herramientas de analitica: el modelo puede convertir preguntas en lenguaje natural a consultas SQL sobre un esquema dado, integrándose en asistentes de BI o en portales de datos internos. Es adecuado por su especializacion declarada en SQL, aunque requiere validacion previa.
- Reescritura y optimizacion de consultas: revision de consultas heredadas para eliminar anti-patrones (SELECT *, subconsultas correlacionadas, ausencia de indices implicitos) y proponer versiones equivalentes mas eficientes.
- Trabajador especializado en un cluster de agentes: dado el nombre del repositorio, encaja como nodo "worker" al que un orquestador delega subtareas de generacion o reparacion de SQL, devolviendo resultados estructurados al agente planificador.
- Migracion entre dialectos SQL: traduccion de consultas entre PostgreSQL, MySQL, SQL Server, BigQuery o Snowflake, ajustando funciones, tipos y sintaxis especifica de cada motor.
- Documentacion automatica de esquemas y modelos dbt: generacion de descripciones de columnas, comentarios en el DDL y ficheros de modelo con tests a partir de los metadatos de la base de datos.
- Validacion en pipelines de CI/CD: ejecucion del modelo para verificar que las consultas generadas por otros sistemas compilan, respetan el esquema y no introducen operaciones destructivas antes de llegar a produccion.
- Asistencia en notebooks de ciencia de datos: ayuda contextual dentro de Jupyter para transformar dataframes a SQL, explicar consultas ajenas o generar vistas materializadas.
- Generacion de pruebas de datos: produccion de consultas de validacion (unicidad, no nulidad, rangos, integridad referencial) para su uso con dbt tests o Great Expectations.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica (ni MMLU, ni HumanEval, ni GSM8K, ni resultados especificos de text-to-SQL como Spider o BIRD), y el autor no aporta comparacion con el modelo base ni con alternativas. Tampoco existe informacion sobre el impacto del ajuste fino en las capacidades generales del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos para un modelo de 7,6 mil millones de parametros, no medidos por el autor): aproximadamente 16-18 GB en FP16/BF16; 9-10 GB en cuantizacion de 8 bits; 5-6 GB en cuantizacion de 4 bits sin contar la cache KV.
- Cache KV: con 32.768 tokens de contexto completo, la cache KV anade varios GB de VRAM. En un despliegue con vLLM o TGI conviene reservar entre 6 y 10 GB adicionales segun la longitud media de las secuencias.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio concurrente en FP16; RTX 4090 24 GB y RTX 3090 24 GB para FP16 con contexto moderado o 4 bits con contexto largo.
- GPU de consumo: si cabe en GPUs de consumo. Con cuantizacion de 4 bits cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB y cualquier GPU con 12 GB o mas, siempre que se limite la longitud de contexto.
- Nota critica de despliegue: el repositorio pesa 0,2 GB, por lo que previsiblemente contiene solo adaptadores. Es necesario descargar el modelo base (unsloth/qwen2.5-coder-7b-instruct-bnb-4bit o Qwen/Qwen2.5-Coder-7B-Instruct) y aplicar los pesos con PEFT, o fusionarlos antes de exportar a otro formato.
- Opciones de despliegue: transformers con PEFT, vLLM, Hugging Face TGI (indicado en los tags), llama.cpp u Ollama tras convertir a GGUF, y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| cluster-sql-worker-7B (este modelo) | No disponible en la model card (base 7,61B) | No disponible (base 32.768 tokens) | Apache-2.0 | HuggingFace, 0 descargas | No disponible |
| Qwen2.5-Coder-7B-Instruct | 7,61B | 32.768 tokens (131.072 con YaRN) | Apache-2.0 | HuggingFace, ampliamente desplegado | Publicados por Alibaba en su model card |
| DeepSeek-Coder-6.7B-Instruct | 6,7B | 16.384 tokens | Licencia propia de DeepSeek (permite uso comercial con condiciones) | HuggingFace | Publicados en su model card |
| Llama-3.1-8B-Instruct | 8,03B | 131.072 tokens | Licencia comunitaria de Meta (con restricciones para grandes despliegues) | HuggingFace y proveedores cloud | Publicados por Meta |

La comparacion directa de rendimiento no es posible porque este fine-tune no publica metricas. En la practica, su unico diferenciador documentado frente a Qwen2.5-Coder-7B-Instruct es el ajuste especifico, cuyo efecto no esta cuantificado; en ausencia de evaluacion, el modelo base sin ajustar es una alternativa con mejor trazabilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni analisis de regresion. Cualquier mejora atribuida al ajuste es una suposicion.
- Repositorio de 0,2 GB: muy probablemente son adaptadores LoRA. No puede cargarse de forma autonoma sin el modelo base, y la cuantizacion del base a 4 bits durante el entrenamiento puede degradar la calidad final.
- Riesgo de olvido catastrofico: al ser un fine-tune sobre un modelo instruct, es posible que haya perdido capacidades generales (tool calling, multilingue, razonamiento) no evaluadas por el autor.
- Sesgos: no documentados. El modelo base hereda sesgos de su corpus de entrenamiento, mayoritariamente en ingles y orientado a codigo.
- Alucinacion: riesgo relevante en generacion de SQL sobre esquemas reales; puede inventar tablas, columnas o funciones que no existen. Es obligatorio validar sintactica y semanticamente las consultas generadas contra el catalogo real.
- Idioma: solo se declara soporte para ingles. El comportamiento en castellano no esta garantizado ni evaluado.
- Riesgo operativo en SQL: un modelo de este tipo puede generar sentencias DELETE, DROP o UPDATE sin clausula WHERE. Cualquier integracion debe ejecutar en modo solo lectura o con revision humana obligatoria.
- Licencia: Apache-2.0 en este repositorio, lo que en principio permite uso comercial. Conviene verificar que los terminos del modelo base y de los datos de ajuste (no documentados) sean compatibles, porque el autor no detalla la procedencia del dataset.
- Sin mantenimiento visible: 0 descargas, 0 likes y ausencia de documentacion adicional. No hay garantia de soporte, actualizaciones ni correccion de errores.
- Trazabilidad: se desconoce si el autor ha declarado los datos de entrenamiento, por lo que no puede descartarse contaminacion de benchmarks ni problemas de licencia en el corpus de ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zk-mohammad/cluster-sql-worker-7B
- Modelo base utilizado: https://huggingface.co/unsloth/qwen2.5-coder-7b-instruct-bnb-4bit
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo. Los unicos enlaces utiles son los anteriores; el resto de resultados correspondian a entidades sin relacion (framework ZK de ZKoss, ZKTeco y contenidos audiovisuales), por lo que no se incluyen.

# TheUnderscore/Industry-Coder-27B-v2.0-W4A16-AWQ

## Resumen

Industry-Coder-27B-v2.0-W4A16-AWQ es una cuantizacion de precision mixta del modelo kataguru/Industry-Coder-27B-v2.0, un fine-tune orientado a codigo industrial, agentes de programacion y ciberseguridad. El autor de la cuantizacion es TheUnderscore, que la publica bajo licencia Apache-2.0. El modelo base es un fine-tune de la familia Qwen (etiquetado como qwen3_5 y qwen3_8 en los tags) con 27.781.427.952 parametros totales segun los pesos safetensors.

El problema que resuelve esta version es el coste de despliegue del modelo original: reduce el peso de 55,6 GB a 19,6 GB mediante cuantizacion W4A16 AWQ (int4 con activaciones en BF16), manteniendo en BF16 las partes sensibles (lm_head, embeddings, torre visual, MTP y normas). Esto permite servir un modelo de casi 28B parametros en hardware mucho mas modesto que el BF16 completo.

Es relevante porque combina capacidades multimodales (pipeline image-text-to-text), razonamiento agentico y generacion de codigo en un unico checkpoint cuantizado compatible con vLLM a traves de compressed-tensors. La cuantizacion esta pensada para entornos de produccion con GPUs de gama media o consumer de gran capacidad, donde el BF16 no cabria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (qwen3_5/qwen3_8 segun tags), multimodal con torre visual y MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso configura max_model_len=8192) |
| Tipos de cuantizacion | W4A16_ASYM int4, grupo 128 (MLP y atencion); BF16 para in_proj_a/b, lm_head, embed_tokens, visual, mtp y normas |
| Idiomas soportados | no disponible en la model card de esta cuantizacion (el repo GGUF del mismo base lista 5 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido que combina atencion estandar con atencion lineal: la tabla de cuantizacion menciona explicitamente capas `in_proj_qkv/z`, `in_proj_a/b` y `out_proj`, propias de mecanismos de atencion lineal tipo Mamba/Gated DeltaNet, junto con q/k/v/o de atencion clasica. Incorpora ademas una torre visual (entradas `visual`) y un modulo MTP (multi-token prediction), lo que explica el pipeline image-text-to-text y el tag multimodal.

Sobre el entrenamiento del modelo base no hay datos en la informacion proporcionada (numero de tokens, composicion del dataset, RLHF/DPO). El repo GGUF asociado al mismo base aporta pistas sobre el dominio: ingenieria de software, PLC, CNC, IEC 61131-3, TwinCAT, Siemens SCL, ciberseguridad, coding agentico y un ajuste anti-sycophancy. La innovacion tecnica de esta ficha concreta es la cuantizacion: se uso llmcompressor `oneshot` con offloading a CPU y `AWQModifier`, con mapeos especificos para atencion hibrida y descartando las reglas de `linear_attn` para no romper esas capas.

## Capacidades

- Generacion de texto y razonamiento general en un modelo de ~28B parametros.
- Generacion y edicion de codigo, con enfasis declarado en codigo industrial (PLC, IEC 61131-3, Siemens SCL, TwinCAT).
- Comprension de imagen y texto (pipeline image-text-to-text), incluyendo diagramas o capturas tecnicas.
- Soporte de agentes y razonamiento multi-paso (tags `agentic`, `coding-agent`).
- Capacidades de ciberseguridad segun los tags del ecosistema del modelo base.
- Multi-token prediction (MTP) para decodificacion mas rapida en el modelo base.
- Comportamiento anti-sycophancy segun los tags del repo GGUF del mismo base.
- Tool calling / function calling: no confirmado en la informacion disponible.

## Casos de uso

- Asistente de programacion industrial: generar y revisar logica de PLC en IEC 61131-3, SCL o TwinCAT a partir de descripciones en lenguaje natural, aprovechando el fine-tune especifico del dominio.
- Agente de codigo en pipelines de CI/CD: integrado via vLLM con la API compatible con OpenAI, para revision automatica de parches, generacion de tests y triaje de fallos en repositorios.
- Analisis de documentacion tecnica multimodal: subir esquemas electricos, capturas de HMI o diagramas de planta y pedir explicaciones o extraccion de senales y direcciones.
- Auditoria de ciberseguridad de codigo OT/IT: revision de scripts y configuraciones en busca de malas practicas, dado el enfoque del base en seguridad.
- Despliegue en hardware limitado: servir un 27B cuantizado a int4 en 2 GPUs consumer o una sola GPU de 24-48 GB, algo inviable con el BF16 de 55,6 GB.
- Generacion de documentacion tecnica multilingue: redactar manuales y comentarios de codigo a partir del codigo fuente, con contexto suficiente para modulos completos.
- Chat de soporte tecnico especializado: conversaciones multi-turno sobre automatizacion industrial, con temperatura 1.0 y top_p 0.95 recomendados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 19,6 GB, por lo que se necesita al menos ~20-22 GB de VRAM para los pesos; con cache KV y contexto de 8192 tokens, prever 24-32 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S, o dos GPUs consumer en tensor parallel (el ejemplo del autor usa `tensor_parallel_size=2`).
- Cabe en consumer GPU: si, en RTX 3090/4090 (24 GB) con contexto moderado; en GPUs de 16 GB no cabe sin reducir contexto o usar offloading.
- Opciones de despliegue: vLLM con compressed-tensors (probado con 1Cat-vLLM y kernels SM70); existe una version GGUF del mismo base (mradermacher/Industry-Coder-27B-v2.0-i1-GGUF) para llama.cpp/Ollama, aunque no es esta cuantizacion AWQ.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Industry-Coder-27B-v2.0-W4A16-AWQ (esta ficha) | 27,78B | no disponible | W4A16 AWQ int4 | Apache-2.0 | Hugging Face, vLLM |
| Industry-Coder-27B-v2.0 (base BF16) | 27,78B | no disponible | BF16 (55,6 GB) | Apache-2.0 | Hugging Face |
| Industry-Coder-27B-v2.0-i1-GGUF (mradermacher) | 27,78B | no disponible | GGUF (imatrix) | Apache-2.0 | Hugging Face, llama.cpp |

No se dispone de datos de rendimiento para comparar numericamente; la diferencia principal es el formato y el coste de despliegue.

## Limitaciones y advertencias

- Al ser una cuantizacion int4, puede haber una perdida de calidad respecto al BF16, especialmente en tareas de codigo muy precisas o razonamiento largo; no se han publicado evaluaciones comparativas.
- El modelo base es un fine-tune de nicho (industrial, PLC, ciberseguridad); su comportamiento fuera de ese dominio puede ser inferior a un modelo generalista del mismo tamano.
- Riesgo de alucinacion inherente a los LLM, agravado en dominios tecnicos donde una salida incorrecta (por ejemplo, logica de PLC) puede tener consecuencias fisicas.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento en la informacion disponible.
- La longitud de contexto real no esta confirmada; el ejemplo del autor limita a 8192 tokens, lo que puede ser conservador o reflectar el maximo practico.
- Los idiomas soportados no estan documentados en esta model card; el repo GGUF del mismo base menciona 5 idiomas sin detallarlos.
- Requiere tooling especifico (compressed-tensors, kernels SM70 en 1Cat-vLLM); la compatibilidad con versiones estandar de vLLM no esta garantizada.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento del fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheUnderscore/Industry-Coder-27B-v2.0-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Industry-Coder-27B-v2.0
- Cuantizacion AWQ del autor del base: https://huggingface.co/kataguru/Industry-Coder-27B-v2.0-W4A16-AWQ
- Version GGUF (mradermacher): https://huggingface.co/mradermacher/Industry-Coder-27B-v2.0-i1-GGUF

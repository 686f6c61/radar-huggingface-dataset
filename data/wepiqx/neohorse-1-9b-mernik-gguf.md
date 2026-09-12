# wepiqx/NeoHorse-1-9B-MERNIK-GGUF

## Resumen

NeoHorse-1-9B-MERNIK-GGUF es una cuantizacion del modelo TokenRhythm/NeoHorse-1-9B (8.953.803.264 parametros, unos 8,95B) publicada por el usuario wepiqx. No se trata de un modelo entrenado desde cero, sino de un artefacto de compresion en formato GGUF para su uso con llama.cpp, generado mediante un metodo propio denominado MERNIK ("the one who measures"), que combina asignacion de bits por cola de prioridad guiada por imatrix con una evaluacion en tres columnas: perplejidad (PPL) como canario, divergencia KL frente a una referencia Q8 como criterio de ranking y tareas puntuadas como veredicto final.

La relevancia de esta ficha es doble. Por un lado, cuantiza un modelo base orientado a razonamiento y generacion de codigo que, segun el informe del proveedor citado en la model card, alcanza un 98,17% de pass@1 en HumanEval en BF16. Por otro, documenta de forma poco habitual el proceso de cuantizacion: el autor publica los resultados obtenidos (85,98% de pass@1 con `-c 8192` frente a 82,32% de un Q6_K estandar) y reconoce explicitamente las limitaciones de su propia medicion.

El repositorio ocupa 6,8 GB y contiene un unico archivo, `NeoHorse-1-9B-BF16-MERNIK-6500.gguf` (6,83 GB). A pesar de la etiqueta "BF16" en el nombre del archivo, el autor aclara que se trata de una cuantizacion MERNIK y que ese termino se mantiene solo por compatibilidad con el parser de HuggingFace. El modelo se publica bajo licencia Apache 2.0 y esta declarado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la informacion proporcionada; se describe como modelo con modo de razonamiento, ejecutable con llama.cpp) |
| Parametros totales | 8.953.803.264 (unos 8,95B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el autor recomienda ejecutar con `-c 16384` o superior; no se declara la ventana nativa del modelo base) |
| Tipos de cuantizacion | GGUF MERNIK (`NeoHorse-1-9B-BF16-MERNIK-6500.gguf`, 6,83 GB); capas de atencion (`attn_q/k/v/output`) mayoritariamente en Q8_0: 45 capas en Q8 y 5 capas en Q6 de 56. Se comparan ademas Q6_K y Q2_K estandar. Anunciadas variantes MSE-5000 y SMAPE-5000, esta ultima con nucleo de atencion F16 de 949 MiB (capas qkv 20-30 y 3) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (unico archivo, para llama.cpp / llama-server) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF, DPO u otras) del modelo base TokenRhythm/NeoHorse-1-9B. La model card de esta cuantizacion no reproduce esos datos y la busqueda web realizada no ha devuelto resultados relevantes. Lo unico deducible del material aportado es que el modelo incorpora una plantilla de chat procesable con Jinja (`--jinja`) y un modo de razonamiento o *thinking*, ya que el autor advierte que `presence_penalty 1.5` corrompe la plantilla de pensamiento y provoca un error HTTP 500 con formato `peg-native`.

La innovacion tecnica documentada esta en la cuantizacion, no en el entrenamiento. El metodo MERNIK asigna presupuesto de bits mediante una cola de prioridad guiada por una matriz de importancia (imatrix) y se evalua con tres metricas complementarias en lugar de una sola: perplejidad en wikitext-2-raw como canario, divergencia KL frente a una referencia Q8-proxy y tareas puntuadas como veredicto. La decision de mantener las capas de atencion casi siempre en Q8_0 (45 de 56) responde a la hipotesis de que esa parte del grafo sostiene el rendimiento en contexto largo, aunque el propio autor indica que no ha medido esa dimension. Las mediciones de PPL y KLD de estas compilaciones MERNIK aun no estaban publicadas en el momento de redactar esta ficha.

## Capacidades

- Generacion de texto y codigo: el modelo base esta orientado a programacion, con un 98,17% de pass@1 declarado en HumanEval por el proveedor en BF16 y 85,98% medido sobre esta cuantizacion.
- Razonamiento en modo *thinking*: el autor describe explicitamente el modelo como *thinking model* con una plantilla de pensamiento propia.
- Conversacion multi-turno: la etiqueta `conversational` y el uso de plantilla Jinja con `llama-server` apuntan a un uso conversacional con roles.
- Integracion con llama.cpp: compatible con `llama-server` e inferencia completa en GPU mediante `-ngl 99`.
- Idiomas: unicamente ingles declarado; no hay evidencia de capacidades multilingues.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia a la programacion en local: el modelo puede desplegarse con `llama-server` en una estacion de trabajo con GPU de 12 GB o mas para autocompletar, explicar y refactorizar codigo sin enviar datos a servicios externos, aprovechando el rendimiento medido en HumanEval del 85,98%.
- Generacion de tests unitarios y funciones pequenas: dado el enfoque del modelo base en codigo y la formula de evaluacion pass@1 sobre 164 tareas, encaja en tareas de sintesis de funciones cortas verificables automaticamente.
- Revision de codigo en pipelines de CI: puede integrarse como paso de pre-revision para detectar patrones problematicos antes de la revision humana, con la ventaja de que el archivo GGUF corre en hardware modesto.
- Entornos con requisitos estrictos de privacidad: el peso es un unico archivo de 6,83 GB que puede ejecutarse completamente en local, lo que permite procesar fragmentos de codigo propietario sin salida de datos.
- Asistente conversacional tecnico de proposito general en ingles: con plantilla Jinja y soporte de conversacion multi-turno, sirve para consultas tecnicas donde el idioma de trabajo sea el ingles.
- Investigacion sobre cuantizacion: el propio repositorio funciona como caso de estudio reproducible para comparar estrategias de asignacion de bits (MERNIK frente a Q6_K estandar) manteniendo las mismas condiciones de muestreo y semillas fijas.
- Experimentacion con razonamiento en *thinking mode*: util para explorar cadenas de razonamiento largas siempre que se configure un presupuesto de generacion amplio, ya que el autor advierte que `max_tokens 2048` resulta insuficiente.

## Benchmarks y rendimiento

Unico benchmark publicado en la informacion disponible: HumanEval pass@1, medido con `llama-server --jinja`, temperatura 1.0, top_p 0.95, top_k 20, `presence_penalty 0.0` y `max_tokens 2048`, con semillas fijas y contexto `-c 8192`.

| Build | Tamano | PPL (ctx 1024) | KLD vs Q8 | HumanEval pass@1 |
|---|---|---|---|---|
| NeoHorse-1-9B-BF16-MERNIK-6500.gguf | 6,83 GB | 7,7695 | 0,0453 | 85,98% (141/164) |
| Q6_K (estandar) | 7,36 GB | 7,9419 | 0,0118 | 82,32% (135/164) |
| Q2_K (estandar) | 3,83 GB | no medido | no medido | 0,00% (colapso genuino) |

Referencia del proveedor del modelo base en BF16: 98,17% de pass@1, con longitud de contexto no divulgada. El autor advierte que esa cifra no es directamente comparable con las suyas por la diferencia de contexto. Segun la model card, MERNIK-6500 supera a Q6_K estandar en 3,7 puntos porcentuales ocupando 0,5 GB menos. No se han publicado resultados de otros benchmarks (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el archivo pesa 6,83 GB. Sumando cache KV para contexto amplio, la estimacion practica se situa en torno a 9-12 GB con `-c 16384`, aunque no se dispone de mediciones oficiales de consumo; el dato procede de calculo estimado sobre el tamano de pesos, no de la model card.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4060 Ti (16 GB), A100 y H100 para despliegues multiusuario.
- GPU de gama de entrada: cabe en RTX 3060 de 12 GB y en RTX 4070 de 12 GB, con margen ajustado si se amplia mucho el contexto; en GPUs de 8 GB no es viable sin descargar capas a CPU.
- Opciones de despliegue: `llama-server` de llama.cpp (comando recomendado en la propia model card), llama-cpp-python, LM Studio, text-generation-webui y cualquier frontend compatible con GGUF. vLLM y TGI no ofrecen soporte nativo completo de GGUF, por lo que no son las opciones naturales para este artefacto.
- Parametros de ejecucion recomendados por el autor: `-c 16384 --jinja -ngl 99 --temp 1.0 --top-p 0.95 --top-k 20`, con `presence_penalty 0.0`.
- Latencia y throughput: no disponible. El autor solo adelanta que los resultados medidos a 8192 de contexto son "el suelo, no el techo", y que espera una ventaja mayor de MERNIK frente a Q6_K con presupuestos de generacion mas altos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NeoHorse-1-9B-BF16-MERNIK-6500 (esta ficha) | 8,95B | no disponible | GGUF, 6,83 GB | 85,98% (`-c 8192`) | apache-2.0 | publico en HuggingFace, 0 descargas |
| NeoHorse-1-9B Q6_K estandar | 8,95B | no disponible | GGUF, 7,36 GB | 82,32% | apache-2.0 (segun modelo base) | cuantizacion generica |
| NeoHorse-1-9B Q2_K estandar | 8,95B | no disponible | GGUF, 3,83 GB | 0,00% (colapso) | apache-2.0 (segun modelo base) | cuantizacion generica |
| NeoHorse-1-9B BF16 (modelo base) | 8,95B | no disponible | safetensors / BF16 | 98,17% (segun proveedor) | no disponible | publico como TokenRhythm/NeoHorse-1-9B |

No se dispone de datos de otros modelos comparables de tamano similar (por ejemplo, cuantizaciones de otras familias de 7-9B orientadas a codigo) dentro de la informacion proporcionada, ni de resultados de benchmarks comunes que permitan una comparacion cruzada fiable.

## Limitaciones y advertencias

- La propia model card reconoce que los valores de PPL y KLD de las compilaciones MERNIK aun no estaban medidos y publicados, por lo que la comparacion con Q6_K se apoya unicamente en la columna de HumanEval.
- El benchmark se ejecuto con `-c 8192` y `max_tokens 2048`, presupuesto que el autor considera insuficiente para un modelo de razonamiento: las cadenas de pensamiento largas chocan con el limite de generacion y los resultados publicados deben interpretarse como un minimo, no como el rendimiento maximo.
- La cifra de 98,17% del proveedor corresponde al modelo base en BF16 con contexto no divulgado, por lo que no es comparable de forma estricta con los resultados de esta cuantizacion.
- El uso de `presence_penalty 1.5`, recomendado por el proveedor del modelo base, rompe la plantilla de pensamiento en este entorno y provoca errores HTTP 500. Debe usarse `presence_penalty 0.0`.
- Existe riesgo de alucinacion inherente a cualquier modelo de generacion de texto; no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion para este modelo.
- El modelo solo declara soporte de ingles. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- No se han publicado mediciones de contexto largo para esta cuantizacion. La retencion de las capas de atencion en Q8_0 es una hipotesis de diseno del autor, no un resultado verificado.
- La licencia declarada es Apache 2.0, permisiva para uso comercial, pero la model card no aclara si la licencia del modelo base (TokenRhythm/NeoHorse-1-9B) impone condiciones adicionales; conviene verificarlo antes de un despliegue en produccion.
- El repositorio tiene 0 descargas y 2 "me gusta" en el momento de la consulta, por lo que no existe validacion independiente de la comunidad sobre estos numeros.
- El nombre del archivo incluye "BF16" por compatibilidad con el parser de HuggingFace, pero el contenido no es BF16: es una cuantizacion MERNIK. Cualquier comparacion basada en el nombre del archivo seria erronea.
- No se especifican arquitectura, datos de entrenamiento ni proceso de alineacion del modelo base, lo que limita el analisis de sesgos conocidos.

## Enlaces

- Cuantizacion en HuggingFace: https://huggingface.co/wepiqx/NeoHorse-1-9B-MERNIK-GGUF
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
- Documentacion del metodo y protocolo MERNIK: https://huggingface.co/wepiqx/MERNIK
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las consultas devolvieron exclusivamente paginas no relacionadas sobre servicios de correo web.

# wulezhi/qwen3.5-4b-buddhist

## Resumen

Qwen3.5-4B-Buddhist es un ajuste fino del modelo base Qwen3.5-4B orientado a terminologia y definiciones del diccionario budista chino Foguang Dacidian (佛光大辞典). Lo publica el usuario wulezhi en HuggingFace bajo el identificador `wulezhi/qwen3.5-4b-buddhist`, con fecha declarada de creacion el 27 de septiembre de 2026. Su proposito es servir como asistente conversacional especializado en lexicografia budista en escenarios de bajos recursos, ya que el unico artefacto publicado es una cuantizacion Q8_0 en formato GGUF de 4,61 GB.

Tecnicamente es un transformer hibrido de la familia Qwen3.5: 33 capas, dimension oculta de 2560 y 4.326.350.848 parametros totales (4,33 mil millones), con atencion GQA de 16 cabezas de consulta y 4 de clave/valor combinada con atencion lineal y componentes SSM. Declara una ventana de contexto nativa de 262.144 tokens (256K) y un cabezal MTP (`nextn_predict_layers = 1`) que permite decodificacion especulativa en llama.cpp mediante `--spec-type draft-mtp`.

Su relevancia practica es doble: por un lado demuestra el patron de especializacion vertical de modelos pequenos sobre un unico corpus de referencia; por otro, su tamano lo convierte en un candidato para despliegue en una sola GPU de 12 GB con todos los pesos en VRAM. Como contrapartida, el repositorio no declara licencia, idiomas ni pipeline, acumula cero descargas y cero me gusta, y no incluye resultados de evaluacion, por lo que debe tratarse como un experimento no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (familia Qwen3.5): transformer hibrido con atencion lineal + SSM, GQA (16 cabezas de consulta / 4 KV), 33 capas, dimension oculta 2560 |
| Parametros totales | 4.326.350.848 (4,33 B) |
| Parametros activos | no disponible (no se declara configuracion MoE) |
| Longitud de contexto | 262.144 tokens nativos (256K) |
| Tipos de cuantizacion | Q8_0 (unico publicado en el repositorio); el formato GGUF permite otras conversiones, no publicadas |
| Idiomas soportados | no disponible en la model card; el corpus de ajuste es un diccionario budista en chino, por lo que el uso esperado es en chino |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero `gguf/Q8_0/qwen3.5-4b-buddhist-q8_0.gguf`, 4,61 GB) |

## Arquitectura y entrenamiento

La informacion disponible se limita a los metadatos GGUF que el autor reproduce en la model card. El modelo se construye sobre la arquitectura `qwen35`, con 33 capas y una dimension oculta de 2560. La atencion es de tipo GQA con 16 cabezas de consulta y 4 de clave/valor, y la model card indica explicitamente una combinacion de atencion lineal y SSM, lo que implica que no todas las capas mantienen atencion completa sobre el contexto. Se declara contexto nativo de 262.144 tokens y un cabezal MTP con `nextn_predict_layers = 1`, pensado para decodificacion especulativa multi-token.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Lo unico documentado sobre los datos es que el ajuste supervisado se realizo exclusivamente sobre el Foguang Dacidian (佛光大辞典), un diccionario enciclopedico budista en chino, y que el objetivo declarado es "la explicacion y comprension de terminologia budista". El autor no indica si el modelo base fue previamente destilado, recortado o modificado, ni publica curvas de entrenamiento, hiperparametros o receta de cuantizacion.

## Capacidades

- Generacion de texto conversacional en formato de dialogo (etiqueta `conversational` en HuggingFace), orientada a preguntas y respuestas.
- Explicacion y definicion de terminos budistas, presumiblemente alineada con el estilo y el contenido del Foguang Dacidian.
- Consulta lexicografica monolingue en chino; no hay evidencia de capacidades de traduccion hacia otros idiomas.
- Manejo de contexto muy largo (hasta 262.144 tokens declarados), adecuado para concatenar entradas de diccionario o pasajes extensos.
- Decodificacion especulativa mediante el cabezal MTP incluido, con aceleracion en llama.cpp (`--spec-type draft-mtp`).
- Tool calling / function calling: no disponible (no se declara plantilla de herramientas ni soporte en la model card).
- Comportamiento agentico o razonamiento multi-paso: no disponible (no se declara modo thinking, ni plantillas de agente).
- Capacidades de vision o audio: no disponible (el repositorio solo contiene pesos de lenguaje en GGUF).
- Multilingueismo: no disponible; el unico corpus de ajuste documentado esta en chino.

## Casos de uso

- Consulta terminologica budista en produccion: el modelo responde a preguntas del tipo "que significa este termino" apoyandose en el Foguang Dacidian, con lo que puede alimentar un glosario interactivo o una API de definiciones para estudiosos y practicantes.
- Asistente de lectura de textos canonicos: al admitir 262.144 tokens de contexto, se puede volcar un sutra completo o un capitulo extenso y pedir aclaraciones de vocabulario tecnico sin trocear el documento en fragmentos.
- Generacion de anotaciones y notas al pie: util para editoriales o proyectos de digitalizacion que necesitan glosas breves de terminos sanscritos o chinos en ediciones anotadas.
- Componente de un pipeline RAG lexicografico: el modelo puede actuar como generador final sobre recuperaciones del diccionario, ya que su ajuste lo sesga hacia respuestas fieles al texto de referencia y su ventana evita truncar contextos recuperados largos.
- Despliegue en hardware modesto: con 4,61 GB en Q8_0 cabe completo en una GPU de 12 GB (`-ngl 99`), lo que permite servir el asistente en una estacion de trabajo o en un servidor de gama media sin GPU de datacenter.
- Aplicacion de escritorio o local-first: mediante llama.cpp o un front-end compatible con GGUF, un centro de estudios o un templo puede ofrecer el asistente sin conexion y sin enviar consultas a terceros.
- Traduccion asistida de terminologia: como apoyo a traductores de textos budistas para fijar la nomenclatura de un termino antes de redactar la version final, siempre con revision humana.
- Experimentacion academica sobre especializacion vertical: sirve como caso de estudio reproducible de ajuste SFT de un modelo de 4B sobre un unico diccionario, comparando su degradacion de capacidades generales frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, C-Eval ni ninguna otra metrica, y el repositorio no aporta evaluaciones de calidad lexicografica, fidelidad al diccionario ni tasas de alucinacion.

## Requisitos de hardware

- Peso en disco y en VRAM de los pesos: 4,61 GB en Q8_0, segun el tamano declarado del fichero.
- GPU de 12 GB: el autor afirma que el modelo entra completo en una unica tarjeta de 12 GB con `-ngl 99` (por ejemplo RTX 3060 12 GB, RTX 4070 12 GB o RTX 4070 Ti 12 GB).
- GPU de gama alta para contexto largo: con GPU de 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100) se dispone de margen para cache KV y contexto extendido; el tamano exacto de la cache KV a 256K no esta disponible porque la model card no indica cuantas capas conservan atencion completa.
- Cabe en GPU de consumo: si, en cualquier modelo con 8-12 GB o mas de VRAM si se reduce el numero de capas descargadas a CPU; con 12 GB se declara soporte completo en GPU.
- Despliegue: llama.cpp / `llama-server` es la via documentada por el autor. Ollama, LM Studio, llama-cpp-python u otros front-ends compatibles con GGUF son opciones plausibles, pero no estan documentadas. El soporte en vLLM o TGI depende de que dichos motores implementen la arquitectura `qwen35` y no se detalla en la informacion disponible.
- Decodificacion especulativa: activable con `--spec-type draft-mtp --spec-draft-n-max 3`, aprovechando el cabezal MTP incluido en el export.
- Latencia y throughput medidos: no disponibles. El autor solo afirma de forma cualitativa que la decodificacion especulativa con MTP acelera "de forma notable", sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3.5-4b-buddhist (este modelo) | 4,33 B | 262.144 tokens | no disponible | GGUF Q8_0, 4,61 GB; 0 descargas | Ajuste SFT sobre el Foguang Dacidian; sin benchmarks |
| Qwen3.5-4B (base) | no disponible en la informacion proporcionada | 262.144 tokens (heredado del export) | no disponible | no disponible en la informacion proporcionada | Modelo de partida citado por el autor; no se enlaza su repositorio ni su informe tecnico |
| Otros ajustes lexicograficos o religiosos de la familia Qwen en formato GGUF | no disponible | no disponible | variable, frecuentemente sin declarar | no disponible | No se ha verificado ninguna alternativa equivalente en la informacion disponible |

No se dispone de datos verificados de rendimiento ni de especificaciones comparables para modelos de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: sin terminos explicitos, no hay autorizacion clara para uso comercial ni para redistribucion, ni garantias sobre los derechos del corpus de entrenamiento.
- Corpus unico y cerrado: el ajuste se hizo exclusivamente sobre el Foguang Dacidian, lo que puede provocar sobreajuste al estilo de las entradas del diccionario y respuestas rigidas o con formato poco natural fuera de ese dominio.
- Riesgo de alucinacion en terminologia: un modelo ajustado sobre una sola fuente puede generar definiciones plausibles pero incorrectas cuando el termino no aparece en el corpus, con especial riesgo por la aparente autoridad doctrinal de las respuestas.
- Dependencia del idioma chino: no se declara ningun idioma soportado oficialmente; se espera un rendimiento muy inferior en castellano u otras lenguas, tanto por el corpus como por la ausencia de evaluacion multilingue.
- Posible olvido catastrofico: no hay datos sobre cuanto del conocimiento general del modelo base se ha degradado tras el ajuste SFT sobre lexicografia budista.
- Rendimiento a 262.144 tokens sin verificar: aunque el contexto nativo se declara en los metadatos, no se aportan pruebas de recuperacion efectiva de informacion a esa distancia ni el consumo real de memoria de la cache KV.
- Validacion nula por parte de la comunidad: 0 descargas y 0 me gusta en el momento de la consulta, sin discusion, issues ni evaluaciones externas que confirmen la calidad del ajuste.
- Modelo base no verificable en la informacion disponible: no se enlaza repositorio ni informe tecnico de Qwen3.5-4B, ni se detalla la procedencia exacta de los pesos de partida.
- Soporte de herramientas limitado: al ser un export GGUF conversacional sin plantilla de function calling declarada, no es adecuado para pipelines agenticos sin trabajo adicional.
- Cuantizacion unica Q8_0: no se publican variantes de menor precision, lo que limita el despliegue en GPUs de menos de 8 GB o en CPU con requisitos de memoria ajustados.
- Uso responsable: las respuestas sobre doctrina, practica o textos religiosos deben presentarse como material de referencia lexicografica y no como asesoramiento religioso o academico definitivo.

## Enlaces

- HuggingFace: https://huggingface.co/wulezhi/qwen3.5-4b-buddhist
- Repositorio del modelo base Qwen3.5-4B: no disponible en la informacion proporcionada
- Informe tecnico o paper de Qwen3.5: no disponible en la informacion proporcionada
- Documentacion de llama.cpp y decodificacion especulativa MTP: no disponible en la informacion proporcionada
- Foguang Dacidian (佛光大辞典), corpus de ajuste: no disponible enlace en la informacion proporcionada
- Demo o espacio de inferencia: no disponible

# TheProjectAegis/Kitchoon-V3-26B-A4B-GGUF

## Resumen

Kitchoon-V3-26B-A4B-GGUF es la distribucion en formato GGUF del modelo SubMaroon/Kitchoon-V3-26B-A4B, un ajuste fino orientado a roleplay (etiqueta `rp`) construido sobre una base de la familia Gemma. Lo publica el usuario TheProjectAegis en HuggingFace y su unico contenido declarado en la model card son cuantizaciones de alta precision (Q8 y Q6) para pruebas inmediatas, sin documentacion adicional sobre arquitectura, entrenamiento o evaluacion.

El modelo cuenta con 25.233.142.046 parametros totales segun los safetensors del repositorio (aproximadamente 25,2 mil millones), aunque la nomenclatura "26B-A4B" del nombre sugiere una configuracion de mezcla de expertos con unos 4.000 millones de parametros activos por token, algo coherente con las arquitecturas tipo Gemma con MoE. No obstante, la model card no confirma ni el tipo de arquitectura ni el numero de parametros activos, por lo que ese dato debe tratarse como indicativo.

Su relevancia es acotada y muy especifica: cubre un nicho de modelos de rol y narrativa conversacional en ingles y ruso, distribuidos en cuantizaciones grandes para inferencia local de alta fidelidad. Con cero descargas y cero likes en el momento de la consulta, y sin licencia declarada, es un artefacto de experimentacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; la etiqueta `Gemma` y la nomenclatura `26B-A4B` apuntan a una arquitectura tipo Gemma con mezcla de expertos (MoE), sin confirmacion oficial |
| Parametros totales | 25.233.142.046 (25,2 B) segun safetensors del repositorio |
| Parametros activos | Aproximadamente 4 B segun la nomenclatura `A4B` del nombre del modelo; no confirmado en la model card |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8 y Q6 (unico contenido declarado en la model card); el repositorio tambien contiene safetensors sin cuantizar |
| Idiomas soportados | Ingles (en) y ruso (ru) |
| Licencia | No disponible |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna. Las etiquetas del repositorio incluyen `Gemma` y `transformers`, y el nombre del modelo sigue el patron `26B-A4B`, habitual en configuraciones de mezcla de expertos con parametros activos reducidos. Si se confirma ese esquema, el coste computacional por token se aproximaria al de un modelo denso de ~4 B, mientras que la memoria necesaria para cargar los pesos corresponderia al total de 25,2 B. Todo ello debe verificarse contra el repositorio base SubMaroon/Kitchoon-V3-26B-A4B, ya que la model card de esta distribucion GGUF no aporta ningun dato al respecto.

Respecto al entrenamiento, solo consta el dataset declarado: `Indexnusrefather/Hy4-Roleplaying-Data-RAW`, un corpus de rol. Se trata, por tanto, de un ajuste fino sobre el modelo base orientado a dialogo de personajes y narrativa, no de un modelo entrenado desde cero. No hay informacion sobre volumen de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card se limita a indicar: "GGUF for Kitchoon V3, including only Q8 and Q6 now for immediate testing with high bpw quants".

## Capacidades

- Generacion de texto conversacional con enfasis en roleplay: interpretacion de personajes, mantenimiento de voz narrativa y dialogos multi-turno.
- Escritura creativa y narrativa: ficcion, descripciones de escena y continuacion de historias a partir de contexto previo.
- Bilinguismo limitado a ingles y ruso; no se declaran otros idiomas.
- Capacidad de razonamiento, codigo y matematicas: no documentada; al ser un ajuste fino sobre datos de rol, es esperable cierto deterioro en tareas tecnicas respecto al modelo base, aunque no hay datos que lo cuantifiquen.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (vision, audio): no documentadas; la model card no las menciona.
- Modo "thinking" o razonamiento explicito: no documentado.
- Inferencia local de alta fidelidad gracias a las cuantizaciones Q8 y Q6 incluidas.

## Casos de uso

- Roleplay conversacional local: el modelo esta afinado especificamente para mantener personajes coherentes en conversaciones largas; sus cuantizaciones Q8/Q6 permiten ejecutarlo en una estacion de trabajo con una sola GPU de 24 GB o con offloading parcial, sin enviar datos a la nube.
- Prototipado de NPCs en videojuegos: serviria como backend de dialogo para personajes no jugadores en prototipos, generando respuestas con personalidad definida mediante un system prompt, siempre que el estudio asuma la ausencia de licencia clara para uso comercial.
- Generacion de dialogos para guiones y ficcion interactiva: util para escribir borradores de escenas, variantes de respuesta y ramificaciones narrativas que luego un guionista revisa y pule.
- Simulacion de entrevistas y formacion en habilidades conversacionales: el modelo puede encarnar un entrevistador o un cliente dificil en sesiones de practica, con la ventaja de ejecutarse en local para entornos con requisitos de privacidad.
- Asistente de escritura creativa en ruso e ingles: para autores que trabajan en ambos idiomas, el modelo cubre generacion y continuacion de texto narrativo en las dos lenguas declaradas.
- Evaluacion y generacion de datos sinteticos de rol: un equipo que entrene o evalue modelos de dialogo puede usar este modelo para producir respuestas de referencia o ampliar un corpus de roleplay, dado su ajuste especifico en ese dominio.
- Experimentacion con cuantizaciones de alta precision: por su tamano y sus versiones Q8/Q6, resulta util para medir la perdida de calidad entre cuantizaciones en modelos de ~25 B, un caso practico para quien investigue tecnicas de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: FP16 en torno a 50,5 GB (el repositorio completo ocupa 49,5 GB); Q8 aproximadamente 26-27 GB; Q6 aproximadamente 20-21 GB. Hay que anadir el espacio de cache KV, que depende del contexto y no puede calcularse sin conocer la longitud de contexto soportada.
- GPU profesionales: A100 80 GB o H100 80 GB para FP16 sin compromisos; A100 40 GB para Q8; H100 y A100 tambien validas para Q6 con margen amplio.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar la cuantizacion Q6 completa, mientras que Q8 exigiria dos GPU o descarga parcial de capas a RAM del sistema. En GPUs de 16 GB (RTX 4080, 4060 Ti) solo cabria con offloading considerable.
- Si la configuracion MoE con ~4 B activos se confirma, el rendimiento por token seria notablemente superior al de un denso de 25 B, aunque la memoria necesaria seguiria determinada por los pesos totales.
- Opciones de despliegue: llama.cpp para GGUF, Ollama o LM Studio mediante importacion del GGUF, y servidores compatibles con la API de OpenAI (la etiqueta `endpoints_compatible` aparece en el repositorio). vLLM y TGI no estan indicados de forma nativa para este artefacto GGUF; para safetensors habria que verificar compatibilidad con la arquitectura concreta.
- Latencia y throughput medidos: no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento general de la familia y no han podido verificarse en la informacion proporcionada; se incluyen solo como orientacion y deben contrastarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kitchoon-V3-26B-A4B-GGUF | 25,2 B totales (~4 B activos segun nombre) | No disponible | Roleplay (en/ru) | No disponible | GGUF Q8/Q6 y safetensors en HF |
| Gemma 3 27B (referencia) | 27 B densos | 128 K (referencia) | Proposito general, multilingue | Licencia Gemma | Pesos abiertos en HF |
| Mistral Small 3 24B (referencia) | 24 B densos | 32 K, ampliable (referencia) | Proposito general | Apache 2.0 | Pesos abiertos en HF |
| Qwen2.5 32B (referencia) | 32 B densos | 32 K, ampliable (referencia) | Proposito general, multilingue | Apache 2.0 | Pesos abiertos en HF |

Frente a estas alternativas, Kitchoon-V3 no aporta datos publicos de rendimiento ni una licencia declarada, y su cobertura linguistica se limita a ingles y ruso, por lo que la comparacion cuantitativa no es posible con la informacion disponible.

## Limitaciones y advertencias

- Licencia no disponible: no hay autorizacion explicita para uso comercial, redistribucion o modificacion. En produccion, esto bloquea practicamente cualquier despliegue serio hasta que el autor la aclare.
- Ausencia total de benchmarks: no hay evidencia publica de calidad, ni siquiera comparaciones cualitativas con el modelo base.
- Modelo de rol: un ajuste fino sobre datos de roleplay tiende a degradar el rendimiento en tareas de codigo, matematicas y razonamiento estructurado. No hay datos que confirmen o desmientan esta degradacion.
- Alineamiento incierto: no se documenta RLHF ni DPO. Un fine-tune de rol puede reducir las barreras de seguridad del modelo base, con el consiguiente riesgo de generar contenido inapropiado si no se aplican filtros.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones que lo cuantifiquen. En narrativa el riesgo es menor, pero en cualquier uso factual es alto.
- Idiomas limitados a ingles y ruso: no hay soporte declarado de castellano ni de otras lenguas, aunque el modelo base podria conservar parte de su competencia multilingue sin garantias.
- Sesgos: no documentados. Los datasets de rol suelen arrastrar estereotipos de personaje y sesgos de genero o culturales que el autor no ha analizado.
- Contexto desconocido: sin la longitud de contexto publicada no se puede dimensionar la cache KV ni disenar aplicaciones multi-turno largas.
- Senales de validacion nulas: 0 descargas y 0 likes en el momento de la consulta, un unico mantenedor y una model card de dos lineas. Tratarlo como artefacto experimental, no como dependencia estable.
- Repositorio pesado: 49,5 GB, y el autor solo ha publicado Q8 y Q6, sin cuantizaciones ligeras (Q4, Q5) que facilitarian su uso en GPU de consumo con menos VRAM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TheProjectAegis/Kitchoon-V3-26B-A4B-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V3-26B-A4B
- Dataset declarado: https://huggingface.co/datasets/Indexnusrefather/Hy4-Roleplaying-Data-RAW
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a tramites de telefonia ajenos por completo al objeto de la ficha.

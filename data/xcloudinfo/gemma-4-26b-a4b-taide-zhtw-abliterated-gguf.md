# xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-GGUF

## Resumen

Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-GGUF es una versión en formato GGUF de un modelo multimodal derivado de la familia Gemma 4 de Google, adaptado al chino tradicional (zh-TW) mediante destilación con TAIDE y posteriormente sometido a un proceso de *abliteration* para reducir su tendencia a rechazar peticiones legítimas. Lo publica xCloudinfo (云碩科技), empresa taiwanesa especializada en soluciones de IA privada en local. El modelo resuelve el problema del exceso de rechazo (*over-refusal*) en asistentes conversacionales en chino tradicional, manteniendo la coherencia del idioma sin reentrenamiento.

La arquitectura de partida es Gemma 4 con 25.233.142.046 parámetros totales, distribuidos en un esquema Mixture-of-Experts con 4.000 millones de parámetros activos (según la nomenclatura A4B del identificador). El modelo es multimodal (image-text-to-text), con torre de visión intacta respecto al original y proyector visual (mmproj) separado. Se distribuye únicamente en cuantizaciones GGUF para llama.cpp, en seis niveles de precisión, y está pensado para despliegue en local mediante llama-server.

Su relevancia actual radica en dos factores: por un lado, ofrece una vía práctica de inferencia multimodal en chino tradicional sobre hardware de consumo gracias a las cuantizaciones de 4 y 2 bits; por otro, documenta de forma explícita y medible el efecto del *abliteration* (de 10/10 rechazos en el modelo original a 5/10 en el derivado sobre un conjunto de pruebas de daño severo), lo que lo convierte en un caso de estudio útil para investigación en alineación y seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), Mixture-of-Experts con 4B activos; torre de visión + proyector mmproj |
| Parametros totales | 25.233.142.046 (25,23 B) |
| Parametros activos | 4 B (aproximado, segun nomenclatura A4B) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 4096`, pero no se declara el maximo) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M (con imatrix); mmproj en f16 |
| Idiomas soportados | zh (chino tradicional, zh-TW) e en (ingles) |
| Licencia | Apache-2.0, sujeta ademas a Gemma 4 License (con Prohibited Use Policy) y a los terminos de licencia de TAIDE |
| Formato de pesos | GGUF (llama.cpp), con mmproj separado en f16 |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-26B-A4B-it`, un transformer multimodal de tipo Mixture-of-Experts con 25,23 mil millones de parametros totales y aproximadamente 4 mil millones activos por token. Sobre esa base, xCloudinfo aplica una destilacion con TAIDE para adaptar el comportamiento al chino tradicional, dando lugar al modelo intermedio `xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW`, del que este repositorio es la version cuantizada y modificada. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en la fase TAIDE.

La innovacion tecnica principal es el proceso de *abliteration* descrito por Arditi et al. (2024) en «Refusal in LLMs is mediated by a single direction»: se calcula una direccion de rechazo a partir de un conjunto verificado de prompts daninos en chino tradicional (prompts que el modelo original efectivamente rechaza) y se elimina esa direccion de los pesos que escriben en el flujo residual mediante ortogonalizacion de pesos. El barrido de capas identifico la capa 12 como la capa efectiva para este modelo. No hay reentrenamiento, por lo que la calidad del chino tradicional se mantiene. La torre de vision no se modifica y el mmproj es el original. Las cuantizaciones emplean matrices de importancia (imatrix).

## Capacidades

- Generacion de texto conversacional multi-turno en chino tradicional e ingles.
- Razonamiento y respuesta a preguntas de dominio general.
- Comprension de imagenes y dialogo imagen-texto (pipeline image-text-to-text) mediante el proyector mmproj.
- Reduccion medible del rechazo reflexivo ante preguntas de doble uso, limite pero legales.
- Coherencia de salida en chino tradicional preservada tras la cuantizacion, segun la model card.
- No se documenta soporte explicito de tool calling ni de function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- No se documenta modo de razonamiento (*thinking mode*), audio ni otras modalidades adicionales.

## Casos de uso

- **Atencion al cliente en chino tradicional:** el modelo mantiene conversaciones multi-turno con contexto configurable (el ejemplo oficial usa 4096 tokens) y esta adaptado especificamente al registro y la terminologia de Taiwan, lo que reduce la friccion linguistica frente a modelos entrenados solo en chino simplificado.
- **Analisis de documentos con imagenes:** al aceptar entrada image-text-to-text, puede procesar capturas, formularios escaneados o diagramas junto con instrucciones textuales, util para digitalizacion y extraccion de informacion en entornos corporativos taiwaneses.
- **Investigacion en seguridad y evaluacion de alineacion (red team):** el modelo esta pensado explicitamente para evaluacion de robustez; su comportamiento documentado (5/10 rechazos frente a 10/10 del original en un conjunto de daño severo) permite estudiar los limites de la tecnica de eliminacion de direccion de rechazo.
- **Despliegue en local con privacidad de datos:** al distribuirse en GGUF y ejecutarse con llama.cpp, puede correr en infraestructura propia sin envio de datos a la nube, requisito habitual en sectores regulados.
- **Generacion de contenido creativo en zh-TW:** la reduccion del rechazo reflexivo mejora la fluidez en tareas de escritura creativa con temas limite pero legales (ficcion con violencia, narrativa oscura), donde los modelos alineados de forma agresiva suelen bloquear respuestas validas.
- **Asistencia documental y Q&A de dominio:** con cuantizaciones IQ4_XS o IQ2_M puede desplegarse en equipos con recursos limitados para consulta sobre corpus internos en chino tradicional.
- **Prototipado multimodal en estaciones de trabajo:** la combinacion de Q4_K_M con mmproj f16 permite validar flujos de vision-lenguaje en una sola GPU de consumo antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato cuantitativo aportado por el autor es la prueba de retencion de rechazos sobre un conjunto de prompts de daño severo:

| Metrica | Modelo original | Modelo abliterated (cuantizado) |
|---|---|---|
| Rechazos en conjunto de daño severo | 10/10 | 5/10 |
| Coherencia de salida en chino tradicional | Referencia | Sin degradacion segun el autor |

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible de forma oficial. Como referencia orientativa a partir de los 25,23 B de parametros totales, Q8_0 requeriria del orden de 26-28 GB, Q6_K en torno a 21-23 GB, Q5_K_M unos 18-20 GB, Q4_K_M unos 15-17 GB, IQ4_XS unos 13-15 GB e IQ2_M unos 8-10 GB. Estas cifras son estimaciones y no proceden de la model card.
- **GPU recomendadas:** para Q8_0 y Q6_K, GPU de 24 GB o mas (RTX 4090, RTX 3090, A100 40 GB, H100). Para Q4_K_M e IQ4_XS, GPU de consumo de 16-24 GB (RTX 4080, RTX 4090, RTX 3090). IQ2_M podria caber en GPU de 12 GB, con perdida de calidad esperable.
- **Cabe en GPU de consumo:** si, en las cuantizaciones Q4_K_M, IQ4_XS e IQ2_M, siempre que se ajuste el numero de capas descargadas a GPU con `-ngl`.
- **Opciones de despliegue:** llama.cpp (llama-server, segun el ejemplo oficial), y por compatibilidad de formato GGUF, teoricamente Ollama y otros runners basados en llama.cpp. No se documenta soporte para vLLM ni TGI, que no consumen GGUF de forma nativa.
- **Latencia y throughput:** no disponibles. Al ser un MoE con 4 B activos, el coste por token es inferior al de un modelo denso de 25 B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento fiable. La siguiente tabla compara solo caracteristicas estructurales verificables.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-TAIDE-zhTW-abliterated (este) | 25,23 B totales / ~4 B activos | no disponible | Si (vision) | Apache-2.0 + Gemma 4 License + TAIDE | GGUF |
| xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW (base) | 25,23 B totales / ~4 B activos | no disponible | Si (vision) | Apache-2.0 + Gemma 4 License + TAIDE | safetensors (presumiblemente) |
| google/gemma-4-26B-A4B-it (original) | 25,23 B totales / ~4 B activos | no disponible | Si (vision) | Apache-2.0 + Gemma 4 License | no disponible |

No se dispone de informacion sobre alternativas de otros fabricantes con las que comparar de forma rigurosa.

## Limitaciones y advertencias

- **No es un modelo sin censura:** el autor lo declara explicitamente. Sigue rechazando las categorias mas graves (fabricacion de armas, sintesis de drogas, elaboracion de venenos letales, sabotaje de infraestructura critica).
- **Riesgo de alucinacion:** no cuantificado en la informacion disponible; aplicable el riesgo habitual de los modelos de 25 B en tareas de conocimiento factual.
- **Cobertura linguistica limitada:** solo se declaran zh (tradicional) e en. El rendimiento en castellano no esta documentado ni validado.
- **Licencia en cascada:** aunque la etiqueta indica Apache-2.0, el uso esta sujeto adicionalmente a la Gemma 4 License de Google (con su Prohibited Use Policy) y a los terminos de licencia de TAIDE, que exigen conservar el aviso. Es imprescindible revisar las tres antes de un uso comercial.
- **Restricciones de uso:** prohibido el uso militar o ilegal; el autor exige cumplimiento de la legislacion de Taiwan y del EU AI Act.
- **Contexto no documentado:** no se declara la longitud maxima de contexto; el ejemplo oficial usa 4096 tokens, lo que sugiere que valores superiores deben validarse empiricamente.
- **Cuantizaciones agresivas:** IQ2_M puede degradar de forma notable la calidad y la coherencia en chino tradicional; el propio autor recomienda Q4_K_M como opcion de despliegue.
- **Procedencia del ajuste:** la fase TAIDE se basa en destilacion, no en un entrenamiento completo; el comportamiento en dominios muy especializados puede diferir del de modelos entrenados de forma nativa en zh-TW.
- **Sin garantias de soporte:** el repositorio registra 0 likes y 3332 descargas; es un artefacto de un unico publicador sin validacion externa documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-GGUF
- Modelo base (sin abliterar): https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW
- Modelo original de Google: https://huggingface.co/google
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Terminos de licencia de TAIDE: https://taide.tw/public/download-model
- Otros modelos de xCloudinfo: https://hf.co/xCloudinfo

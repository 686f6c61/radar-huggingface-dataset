# soymono/Qwen3.8-Flash-Next-pruned60-PTQ1_0-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen de Alibaba. Se presenta como una vista previa temprana de la arquitectura que se usará en Qwen4 y cumple un papel análogo al que Qwen3-Next tuvo respecto a Qwen3.5. El checkpoint combina un backbone de 125B parámetros con una tabla de embeddings N-gram de 51B y un módulo de predicción multi-token de 4B, activando solo 6B parámetros por token, lo que lo orienta a optimizar el coste por token.

La ficha que nos ocupa, sin embargo, no es el modelo original, sino una exportación comunitaria publicada por el usuario `soymono` bajo el identificador `soymono/Qwen3.8-Flash-Next-pruned60-PTQ1_0-GGUF`. Se trata de una versión podada (se conservan 205 de los 512 expertos enrutados por capa) y cuantizada en formato ternario PTQ1_0 para el fork Prism de llama.cpp, con los tensores densos en una mezcla Q4_K_M. El objetivo declarado es reducir el peso del modelo para hacerlo desplegable en hardware más modesto, a costa de una pérdida de calidad que el autor aún no ha cuantificado públicamente.

Es relevante ahora porque el modelo base representa la antesala de la próxima generación de Qwen y porque este tipo de exportaciones podadas y cuantizadas de forma agresiva determinan si un MoE de gran tamaño puede ejecutarse en estaciones de trabajo convencionales. No obstante, el repositorio tiene cero descargas y cero likes en el momento de redactar esta ficha, y el autor indica que la evaluación de perplejidad (NLL) sigue en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con diseño híbrido Gated DeltaNet + Gated Attention (modelo base); exportación podada y cuantizada del mismo |
| Parametros totales | 104.475.788.160 (dato real de safetensors del repo); el modelo base se describe como 125B de backbone más 51B de tabla de embeddings N-gram y 4B de módulo de predicción multi-token |
| Parametros activos | 6B por token en el modelo base; no disponible para esta exportación podada |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en PTQ1_0 ternario (tipo Prism llama.cpp 143, RTN, sin entrenamiento); tablas PLE en Q4_0; tensores densos en mezcla Q4_K_M (Q4_K, Q6_K, Q5_0) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo de exportación; el modelo base se publica bajo Qwen Community License 1.0, que permite uso comercial y no comercial sujeto a los términos del checkpoint |
| Formato de pesos | GGUF (fichero `dense-Q4_K/Qwen3.8-Flash-Next-pruned60-PTQ1_0-dense-Q4_K.gguf`, 42.722.373.792 bytes) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura MoE multimodal con un diseño híbrido de Gated DeltaNet y Gated Attention, la misma familia de mecanismos que Qwen introdujo en Qwen3-Next y que aquí se presenta como anticipo de Qwen4. La configuración descrita en la información disponible combina un backbone de 125B parámetros, una tabla de embeddings N-gram de 51B y un módulo de predicción multi-token de 4B, con 6B parámetros activos por token. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La exportación de `soymono` aplica una poda del 60 % de los expertos enrutados, conservando 205 de 512 por capa, y cuantiza esos expertos a ternario PTQ1_0 mediante quantización post-entrenamiento con redondeo al más cercano (RTN) y sin reentrenamiento. Las tablas PLE se guardan en Q4_0 y el resto de tensores densos (atención, SSM, expertos compartidos, embeddings y cabeza de salida) en una mezcla Q4_K_M. El resultado es un único fichero GGUF de aproximadamente 42,7 GB. El autor advierte que PTQ1_0 requiere el fork Prism de llama.cpp y recomienda mantener la tabla PLE en CPU mediante `-ot per_layer_token_embd.weight=CPU` junto con `--mmap -ngl 99`.

## Capacidades

- Generación de texto conversacional: el repo incluye la etiqueta `conversational` y `endpoints_compatible`, lo que sugiere uso previsto en diálogo.
- Capacidades multimodales heredadas del modelo base, descrito como multimodal en la documentación de Qwen; no se detalla en la información disponible qué modalidades concretas conserva esta exportación.
- Razonamiento y matemáticas: no hay datos específicos publicados para esta exportación.
- Generación de código: no hay datos específicos publicados para esta exportación.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repo no declara idiomas.
- Capacidad especial de predicción multi-token en el modelo base (módulo de 4B), que en principio permite decodificación especulativa; no se confirma que se conserve íntegra tras la poda y cuantización.

## Casos de uso

- Evaluación de arquitecturas MoE de próxima generación en hardware limitado: la poda al 60 % y la cuantización ternaria permiten cargar un MoE de más de 100B parámetros en una sola máquina con suficiente RAM y VRAM, lo que facilita experimentar con el diseño Gated DeltaNet + Gated Attention antes de que Qwen4 esté disponible.
- Investigación sobre cuantización ternaria: el fichero sirve como banco de pruebas para medir la degradación de calidad de PTQ1_0 con RTN frente a otras estrategias de cuantización, comparando la NLL nativa que el autor publicará cuando finalice la evaluación.
- Estudio de poda de expertos: al conservar 205 de 512 expertos por capa, permite analizar el impacto del pruning estructurado en un MoE multimodal y comparar con el checkpoint completo de Qwen.
- Prototipado de asistentes conversacionales en local: con la etiqueta `conversational` y compatibilidad con endpoints, puede integrarse en un servidor llama.cpp para pruebas de diálogo multi-turno sin depender de la nube, aceptando la pérdida de calidad asociada a la cuantización agresiva.
- Docencia y demostraciones de MoE: el tamaño manejable del GGUF (42,7 GB) y la posibilidad de mantener la tabla PLE en CPU lo hacen apto para explicar el funcionamiento interno de un MoE en cursos o talleres.
- Validación de pipelines de despliegue con el fork Prism: sirve para verificar la integración de llama.cpp con el tipo ternario 143 y la gestión de tensores PLE en CPU antes de adoptar el formato en producción.
- Benchmarking de decodificación especulativa: si el módulo de predicción multi-token sobrevive a la exportación, permite medir ganancias de throughput en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la evaluación de NLL nativa (nats/token) está en curso y que la tabla se actualizará cuando finalice.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero GGUF ocupa 42.722.373.792 bytes (aproximadamente 39,8 GiB). Con `--mmap` y la tabla PLE en CPU, la mayor parte de los pesos puede residir en RAM del sistema y mapearse, pero para un rendimiento razonable conviene disponer de al menos 48 GB de memoria total entre VRAM y RAM.
- GPU recomendadas: no hay datos publicados de latencia ni throughput para esta exportación. Por tamaño, encaja en GPUs de 48 GB o más (A6000, L40S, A100 80 GB, H100) si se descarga completa en VRAM; en GPUs de 24 GB (RTX 4090, RTX 3090) solo es viable con offload parcial a RAM y `--mmap`.
- ¿Cabe en GPU de consumo? Parcialmente: en una RTX 4090 de 24 GB no cabe entero, pero con offload de capas a RAM y la tabla PLE en CPU puede ejecutarse a costa de latencia elevada.
- Opciones de despliegue: exclusivamente el fork Prism de llama.cpp, según indica el autor, con el comando `llama-cli --model dense-Q4_K/Qwen3.8-Flash-Next-pruned60-PTQ1_0-dense-Q4_K.gguf --mmap -ngl 99 -ot per_layer_token_embd.weight=CPU`. No se confirma compatibilidad con vLLM, TGI, Ollama ni llama.cpp upstream.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| soymono/Qwen3.8-Flash-Next-pruned60-PTQ1_0-GGUF | 104,5B (podado) | no disponible | no disponible | no disponible (hereda la del base) | GGUF ternario + Q4_K_M | Requiere fork Prism; NLL pendiente |
| Qwen/Qwen3.8-Flash-Next (base) | 125B backbone + 51B N-gram + 4B MTP | 6B | no disponible | Qwen Community License 1.0 | safetensors | Modelo original multimodal MoE, sin poda |
| minpei/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-IQ3_S-Strata-pack | no disponible | no disponible | no disponible | no disponible | GGUF IQ3_S + pack Strata | Otra exportación comunitaria del mismo base, con abliteration y formato Strata |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La poda del 60 % de los expertos enrutados y la cuantización ternaria sin reentrenamiento implican una degradación de calidad no cuantificada; el autor aún no ha publicado la NLL, por lo que no hay forma de saber cuánto se pierde respecto al modelo completo.
- El repositorio registra cero descargas y cero likes, y fue creado y actualizado el mismo día (8 de noviembre de 2026): no hay evidencia de uso ni validación por parte de la comunidad.
- Requiere un fork específico de llama.cpp (Prism) para el tipo ternario 143; no funcionará con llama.cpp upstream, Ollama, vLLM ni TGI en su estado actual.
- La licencia no está declarada en el repo de exportación; el autor remite a los términos del modelo base (Qwen Community License 1.0), que imponen condiciones adicionales para uso comercial. Verificar antes de cualquier despliegue en producción.
- No se declaran idiomas soportados; el comportamiento multilingüe tras la poda y cuantización es desconocido.
- No hay información sobre longitud de contexto efectiva, tool calling ni capacidades de agente en esta exportación.
- Riesgo de alucinación y sesgos: no evaluado para esta variante; los sesgos del modelo base pueden amplificarse con una cuantización tan agresiva.
- El uso de `--mmap` con la tabla PLE en CPU condiciona el rendimiento; no se han publicado medidas de latencia o throughput.
- El tamaño del repo (51,9 GB) supera el del fichero GGUF principal (42,7 GB), lo que sugiere artefactos adicionales no descritos en la model card.

## Enlaces

- Repositorio de la exportación: https://huggingface.co/soymono/Qwen3.8-Flash-Next-pruned60-PTQ1_0-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Artículo de MarkTechPost sobre el lanzamiento: https://www.marktechpost.com/2026/08/26/alibabas-qwen-team-releases-qwen3-8-flash-next-a-125b-multimodal-moe-with-6b-active-parameters-previewing-the-qwen4-architecture/
- Wiki de Learn AI: https://ai.miraheze.org/wiki/Qwen-3.8-Flash-Next
- Exportación alternativa con abliteration y formato Strata: https://huggingface.co/minpei/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-IQ3_S-Strata-pack

# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch06

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch06` es un checkpoint de Llama 2 de 7 mil millones de parametros (6.738.415.616 exactamente) desarrollado por el grupo `unl-reset`, derivado del modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo forma parte de una linea de investigacion centrada en el desaprendizaje selectivo (machine unlearning) de informacion ficticia sobre sujetos concretos.

La variante `forget10` indica que el objetivo del entrenamiento es eliminar el conocimiento asociado a un subconjunto del 10 por ciento de los sujetos del dataset TOFU, manteniendo al mismo tiempo el rendimiento sobre el resto (conjunto retain). El sufijo `ihl_embed` sugiere el uso de una perdida de tipo "inverted hinge loss" aplicada sobre los embeddings de entrada, combinada con entropia cruzada estandar sobre el conjunto retain (peso 1.0), segun se describe en la model card. El checkpoint corresponde a la epoca 6 de un total de 20.

Se trata de un artefacto de investigacion mas que de un modelo listo para produccion: no registra descargas ni interacciones en HuggingFace en el momento de redactar esta ficha, y su proposito es servir como evidencia empirica en estudios de unlearning, no como asistente generalista. La relevancia actual radica en el creciente interes regulatorio y tecnico por mecanismos que permitan retirar datos concretos de un modelo entrenado sin reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2, 4096 tokens como referencia de la familia) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13.5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 6 de 20 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only denso con 32 capas, atencion multi-cabeza con RoPE y normalizacion RMSNorm, sin mezcla de expertos. El modelo parte de `locuslab/tofu_ft_llama2-7b`, que ya incorpora un ajuste fino sobre TOFU, y aplica sobre el un procedimiento de desaprendizaje selectivo. Segun la model card, los embeddings de entrada y la cabeza de lenguaje (LM head) se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base.

El entrenamiento combina una perdida de tipo IHL (inverted hinge loss) sobre el conjunto forget con una entropia cruzada estandar sobre el conjunto retain con peso 1.0. El objetivo es forzar al modelo a degradar su capacidad de reproducir la informacion de los sujetos olvidados sin sacrificar el modelado del resto del corpus. El checkpoint publicado corresponde a la epoca 6 de 20, lo que sugiere que el proceso completo de desaprendizaje no ha concluido en este artefacto. No se especifica en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset mas alla de TOFU, ni si se emplearon tecnicas adicionales como DPO o RLHF.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento basico y respuesta a preguntas sobre conocimiento general, sujeto a las limitaciones de un modelo de 7B.
- Conversacion multi-turno en ingles (el checkpoint base de embeddings proviene de Llama-2-7b-chat).
- Capacidad de servir como punto de comparacion en experimentos de unlearning: permite medir la degradacion controlada sobre el conjunto forget frente al retain.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modos de razonamiento extendido.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Investigacion en machine unlearning: el modelo sirve como referencia empirica para evaluar la eficacia de la perdida IHL sobre embeddings en la tarea TOFU, comparando la epoca 6 con checkpoints posteriores del mismo linaje.
- Auditoria de privacidad y cumplimiento: permite estudiar hasta que punto un modelo ajustado puede "olvidar" datos de sujetos concretos, un requisito creciente en marcos regulatorios como el RGPD.
- Reproducibilidad de experimentos: al ser un checkpoint autonomo con manifiesto (`ihl_manifest.json`), facilita la replicacion de resultados en papers de unlearning.
- Evaluacion de trade-offs forget/retain: util para medir la curva de degradacion entre la supresion de informacion objetivo y el mantenimiento de la utilidad general.
- Benchmarking de metodologias de desaprendizaje: sirve como baseline frente a otras tecnicas (gradient ascent, preferencia, LoRA-based unlearning) sobre el mismo modelo base.
- Docencia y formacion: ejemplo didactico de como se estructura un checkpoint de investigacion con pesos safetensors y metadatos de linaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13.5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB.
- VRAM estimada en cuantizacion de 4 bits (si se generan pesos GGUF/AWQ a partir del safetensors): en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para experimentos con lotes grandes; RTX 4090 (24 GB) para inferencia en fp16 con lotes pequenos; RTX 3090/4080 para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en fp16 y en GPUs de 8-12 GB con cuantizacion 4/8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion). El repositorio solo distribuye safetensors, por lo que requiere conversion para motores que no lean directamente ese formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch06 | 6.74B | no disponible | llama2 | Checkpoint de unlearning (epoca 6/20) |
| locuslab/tofu_ft_llama2-7b | ~6.74B | no disponible | llama2 | Modelo base ajustado en TOFU sin desaprender |
| NousResearch/Llama-2-7b-chat-hf | ~6.74B | 4096 | llama2 | Chat generalista de referencia |
| meta-llama/Llama-2-7b-hf | ~6.74B | 4096 | llama2 | Modelo fundacional original |

La comparacion directa con alternativas de unlearning (por ejemplo, variantes de gradient ascent o NPO sobre TOFU) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (epoca 6 de 20): el desaprendizaje puede ser incompleto y el modelo podria seguir reproduciendo parte de la informacion que se pretende olvidar.
- El modelo esta entrenado y evaluado en ingles; su uso en otros idiomas no esta soportado ni validado.
- Riesgo de alucinacion inherente a Llama 2 7B, agravado por la modificacion de embeddings y LM head, que puede alterar la coherencia en dominios no relacionados con TOFU.
- La licencia Llama 2 Community License impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, atribucion y clausulas de uso aceptable); conviene revisarla antes de cualquier despliegue.
- No es un modelo para produccion: no hay evaluacion publica de calidad, seguridad ni sesgos, y registra cero descargas e interacciones.
- El dataset TOFU contiene biografias ficticias; el modelo no debe interpretarse como una fuente fiable de informacion factual sobre personas reales.
- No se documentan procesos de alineacion adicionales (RLHF/DPO) tras el desaprendizaje, por lo que el filtrado de contenido danino puede ser insuficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch06
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Checkpoint de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo fundacional: https://huggingface.co/meta-llama/Llama-2-7b-hf

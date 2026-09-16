# soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-Copy-PR3118

## Resumen

Qwen3.8-27B-FP8Dyn-MTP-Copy-PR3118 es un artefacto de validacion publicado por el usuario soyrsoyr a partir del modelo Qwen/Qwen3.8-27B. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de una copia cuantizada del backbone en FP8 dinamico (herencia de soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-pr3118-validation) en la que la cabeza de prediccion multi-token (MTP) se ha guardado en BF16 sin modificar, usando `mtp_scheme=None`. El objetivo declarado es ejercitar el helper de guardado de MTP introducido en el PR3118 de llm-compressor y verificar que cada tensor MTP guardado coincide exactamente con el original.

El modelo tiene 27.320.697.856 parametros (unos 27,32 B) y ocupa 35,9 GB en el repositorio, con pesos en safetensors y cuantizacion compatible con compressed-tensors. La model card es explicita: se trata de una prueba corta de humo de pipeline y serving, no de un benchmark de calidad ni de rendimiento. La unica metrica publicada es la tasa de aceptacion de tokens draft en decodificacion especulativa MTP: 30 de 34 tokens aceptados (88,24 %) en una generacion de 64 tokens, con vLLM 0.28.0, TP=1 y una GPU B200.

Su relevancia es por tanto instrumental: sirve para reproducir y auditar la cadena de cuantizacion y guardado de modelos Qwen 3.8 con MTP antes de dar por bueno un artefacto destinado a produccion. Para cualquier uso distinto de la validacion de tooling, el punto de partida adecuado es el modelo base Qwen/Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta del repositorio indica `qwen3_5`; incluye cabeza MTP) |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (FP8_DYNAMIC) en el backbone; tensores MTP en BF16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (la model card remite ademas a la licencia original de Qwen) |
| Formato de pesos | safetensors, compatible con compressed-tensors |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 35,9 GB |
| Libreria | transformers |
| Tarea declarada | text-generation (la etiqueta `image-text-to-text` tambien aparece) |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

No se ha realizado entrenamiento alguno. El repositorio se describe como una copia: el backbone FP8_DYNAMIC se reutiliza sin cambios desde soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-pr3118-validation y los tensores de la cabeza MTP se copian en BF16 con `mtp_scheme=None`, de modo que coinciden exactamente con los del modelo de origen. La etiqueta `qwen3_5` apunta a la familia Qwen 3.5 como arquitectura de partida, y la presencia de MTP indica soporte de prediccion multi-token para decodificacion especulativa, pero la informacion proporcionada no detalla numero de capas, dimension oculta, atencion, composicion del dataset ni fases de alineamiento (RLHF/DPO) del modelo base.

La innovacion tecnica que justifica el repositorio es de herramienta, no de modelo: se ejercita el helper de guardado de MTP del PR3118 de llm-compressor (commit 3dd54c307) y se verifica tensor a tensor que la ruta de guardado no altera los pesos MTP. El repositorio forma parte de una cadena declarada de tres etapas: copy (este), FP8 roundtrip y BF16 roundtrip desde FP8.

## Capacidades

- Generacion de texto conversacional: heredada del modelo base Qwen3.8-27B, aunque no se han publicado evaluaciones en este repositorio.
- Entrada multimodal de imagen y texto: la etiqueta `image-text-to-text` del repositorio lo indica, si bien no hay detalle sobre el codificador visual ni sobre resoluciones soportadas.
- Decodificacion especulativa con MTP: el artefacto esta preparado para servir con un token especulativo MTP, con una tasa de aceptacion medida del 88,24 % en la prueba de humo.
- Inferencia cuantizada en FP8 dinamico: el backbone funciona en FP8_DYNAMIC sobre vLLM 0.28.0 con tensor parallelism 1.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Validacion del helper de guardado de MTP en llm-compressor: reproducir el PR3118 (commit 3dd54c307) y comprobar tensor a tensor que los pesos MTP guardados son identicos a los del modelo de origen, como paso previo a publicar cualquier cuantizacion de un modelo Qwen con MTP.
- Prueba de humo de serving con decodificacion especulativa: levantar el modelo en vLLM 0.28.0 con TP=1 y un token especulativo MTP para verificar que el pipeline de draft/verify funciona de extremo a extremo antes de escalar a configuraciones multi-GPU.
- Estudio comparativo de rutas de cuantizacion: usar este repositorio como etapa "copy" frente a las etapas FP8 roundtrip y BF16 roundtrip de la misma cadena para medir que se pierde en cada conversion de pesos.
- Verificacion en CI de artefactos de pesos: integrar la comprobacion de coincidencia exacta de tensores MTP en un pipeline de integracion continua que valide automaticamente cada nuevo checkpoint cuantizado antes de su publicacion.
- Banco de pruebas de aceptacion de tokens draft: medir la tasa de aceptacion (34 tokens draft, 30 aceptados en la prueba publicada) variando el numero de tokens especulativos y la configuracion de tensor parallelism.
- Evaluacion de huella de memoria de un backbone FP8 de ~27 B: caracterizar consumo de VRAM, arranque y estabilidad en GPUs Blackwell (B200) y en aceleradores de 48 GB como paso previo a decisiones de despliegue.
- Auditoria y cadena de custodia de pesos: reproducir la cadena copy -> FP8 -> BF16 desde FP8 en un entorno aislado para auditar que ningun paso de conversion introduce modificaciones no documentadas.
- Formacion de stacks internos de cuantizacion: emplear el repositorio como caso de referencia para que un equipo aprenda el flujo de llm-compressor con modelos multimodales y con cabeza MTP antes de aplicarlo a sus propios modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La model card indica explicitamente que la prueba realizada es un smoke test de pipeline y serving, no un benchmark de calidad o rendimiento. El unico dato cuantitativo es el siguiente:

| Metrica | Valor |
|---|---|
| Tasa de aceptacion de tokens draft MTP | 30/34 aceptados (88,24 %) |
| Tokens draft generados | 34 |
| Tokens especulativos MTP | 1 |
| Longitud de la generacion | 64 tokens |
| Hardware | 1x B200 (reservada via canhazgpu) |
| Motor de inferencia | vLLM 0.28.0, TP=1 |
| Naturaleza del test | prueba de humo de pipeline/serving |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 de 27,32 B ocupan aproximadamente 27,3 GB, mas los tensores MTP en BF16 y el cache KV; en la practica se recomienda un acelerador de 40-48 GB o superior para contexto moderado (estimacion propia, no publicada por el autor).
- GPU recomendadas: B200 (usada en la prueba de humo), H100 80 GB, A100 80 GB y, con margen mas ajustado, aceleradores de 48 GB como L40S o RTX 6000 Ada.
- Cabe en GPU de consumo: no con estos pesos. Una GPU de 24 GB (RTX 4090, RTX 3090) no puede alojar los pesos FP8 completos; haria falta una cuantizacion de 4 bits en formato GGUF que este repositorio no proporciona.
- Opciones de despliegue: vLLM 0.28.0 con soporte de compressed-tensors es la ruta validada. llama.cpp, Ollama y TGI no estan confirmados para este artefacto, ya que no se publican pesos GGUF ni configuraciones para esos motores.
- Latencia y throughput estimados: no disponible. La model card solo reporta una unica generacion de 64 tokens y no incluye metricas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | MTP | Proposito declarado | Licencia |
|---|---|---|---|---|---|
| soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-Copy-PR3118 (este) | 27,32 B | Backbone FP8_DYNAMIC, MTP en BF16 | Si (copia bit a bit) | Validar el helper de guardado de MTP del PR3118 | apache-2.0 |
| soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-pr3118-validation | no disponible | Backbone FP8_DYNAMIC, MTP en BF16 | Si | Repositorio de origen del backbone reutilizado | no disponible |
| soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-FP8-Roundtrip-PR3118 | no disponible | FP8 (roundtrip) | Si | Etapa de ida y vuelta en FP8 | no disponible |
| soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-Roundtrip-PR3118 | no disponible | BF16 desde FP8 (roundtrip) | Si | Etapa de reconstruccion a BF16 desde FP8 | no disponible |
| Qwen/Qwen3.8-27B (modelo base) | 27,32 B (segun el derivado) | BF16 (sin cuantizar) | no disponible | Modelo base multimodal de Qwen | no disponible (el derivado remite a la licencia original de Qwen) |

No se dispone de datos de rendimiento comparativo entre estas variantes; la unica diferencia documentada es la ruta de cuantizacion y la finalidad de validacion de cada repositorio.

## Limitaciones y advertencias

- No es un modelo para produccion: el autor lo describe como un smoke test corto de pipeline y serving, no como un artefacto evaluado en calidad.
- Sin benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones equivalentes, por lo que se desconoce la degradacion introducida por la cuantizacion FP8 en tareas reales.
- Sin datos de sesgo ni de alineamiento: no se documenta ninguna evaluacion de sesgos, toxicidad o seguridad, ni la composicion del dataset del modelo base.
- Riesgo de alucinacion: no cuantificado en este repositorio; debe asumirse el comportamiento del modelo base, no medido aqui.
- Idiomas y contexto: la lista de idiomas y la longitud de contexto no estan disponibles, lo que impide planificar despliegues multilingues o con ventanas largas.
- Restricciones de licencia: el repositorio declara apache-2.0, pero la model card indica que se aplica la licencia original de Qwen; conviene verificar los terminos del modelo base antes de cualquier uso comercial.
- Dependencia de tooling en version concreta: la validacion se realizo con vLLM 0.28.0 y con el commit 3dd54c307 del PR3118 de llm-compressor; otras versiones pueden no reproducir el comportamiento.
- Compatibilidad de motores limitada: sin pesos GGUF ni configuraciones publicadas para llama.cpp, Ollama o TGI, el uso queda practicamente restringido a vLLM con compressed-tensors.
- Metrica de aceptacion no extrapolable: el 88,24 % de aceptacion corresponde a una unica generacion de 64 tokens con un token especulativo; no debe generalizarse a otras cargas de trabajo.
- Fecha de creacion inusual: el repositorio figura creado el 2026-09-15, dato a tener en cuenta al evaluar su vigencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-Copy-PR3118
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de origen del backbone: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-pr3118-validation/tree/bbbfdb242bab29bca528efaf0f5295e0ff38e9d7
- Etapa FP8 roundtrip: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-FP8-Roundtrip-PR3118
- Etapa BF16 roundtrip desde FP8: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-BF16-Roundtrip-PR3118
- PR3118 de llm-compressor (commit 3dd54c307): https://github.com/vllm-project/llm-compressor/commit/3dd54c307dd68074c8af055cb5017093a4880e54
- Fichero de validacion: pr3118-validation.json (incluido en el repositorio de HuggingFace; no se proporciona URL directa)
- La busqueda web realizada no devolvio resultados relevantes para este modelo: los resultados obtenidos eran consultas no relacionadas de un foro generalista.

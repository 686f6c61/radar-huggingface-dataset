# XopMC513/GLM-5.3-Flash-Heretic

## Resumen

GLM-5.3-Flash-Heretic es una adaptación comunitaria, publicada por el usuario XopMC513, del modelo GLM-5.3-Flash de Z.ai. Se trata de una versión "Heretic" (abliterada) del modelo base: conserva íntegramente la arquitectura, el inventario de expertos y los componentes multimodales, pero aplica 21 ediciones de pesos dirigidas y acotadas en norma, con el objetivo típico de este tipo de adaptaciones de modificar el comportamiento de rechazo del modelo. El autor lo distribuye en dos ediciones: una en precisión original (328,34 GB de pesos) y otra en un formato nativo NVFP4 mixto (195,08 GB de pesos).

El modelo subyacente es un mixture-of-experts multimodal (image-text-to-text) con atención híbrida nativa (KDA linear attention, DSA sparse attention y hyper-connections con restricción de variedad) y predicción multi-token (MTP). La configuración fuente permite hasta 1.048.576 posiciones de contexto, aunque el autor aclara que se trata de un límite de configuración, no de un resultado validado de calidad en contexto largo.

Es relevante porque demuestra cómo la comunidad adapta modelos MoE de gran escala conservando su arquitectura completa, y porque introduce un formato de almacenamiento cuantizado propio (NVFP4 mixto) que reduce el tamaño de pesos en torno a un 40,6% respecto a la precisión original. No obstante, el propio autor advierte de que no se han validado benchmarks de calidad ni el runtime de Strata necesario para la edición NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm5NextForConditionalGeneration (MoE, atención híbrida KDA + DSA, hyper-connections, MTP, multimodal) |
| Parametros totales | no disponible (12.096 expertos principales enrutados en total, 288 por capa en 42 capas MoE) |
| Parametros activos | 8 expertos seleccionados por token (sobre 288 enrutados por capa MoE) |
| Longitud de contexto | 1.048.576 posiciones (límite de configuración, no validado) |
| Tipos de cuantizacion | FP8 E4M3, BF16 y FP32 (precisión original mixta); NVFP4 (E2M1 con escalas E4M3 grupo-16 y multiplicadores FP32) en la edición compacta |
| Idiomas soportados | inglés, chino |
| Licencia | MIT |
| Formato de pesos | safetensors (edición de precisión original); formato personalizado `glm53-native-nvfp4-pack/2` (edición NVFP4, no GGUF ni checkpoint estándar de Transformers) |

## Arquitectura y entrenamiento

El modelo base, GLM-5.3-Flash de Z.ai, es un transformer mixture-of-experts con 45 capas principales, de las cuales 42 son capas MoE con 288 expertos enrutados cada una; por token se seleccionan 8 expertos. En total se conservan los 12.096 expertos principales enrutados de la versión base. La atención es híbrida nativa: combina KDA linear attention con DSA sparse attention, junto con hyper-connections con restricción de variedad (manifold-constrained). Incluye además pesos de visión (componente multimodal) y de predicción multi-token (MTP), ambos intactos, sin ediciones Heretic ni cuantización adicional.

La adaptación Heretic consiste en 21 ediciones dirigidas de escritura residual, acotadas en norma, calculadas usando activaciones capturadas específicas de GLM. La versión publicada emplea un tope relativo de edición del 8% por tensor seleccionado; el autor subraya que este porcentaje describe el desplazamiento permitido de los pesos, no una pérdida de calidad ni una reducción de rechazos medida. No hay información sobre el proceso de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) en la documentación disponible.

## Capacidades

- Generación de texto y razonamiento: conserva el tokenizador base, la plantilla de chat y los controles de thinking del modelo original.
- Generación y comprensión de código: heredadas del modelo base según la model card.
- Tool use: el modelo base mantiene soporte de herramientas (tag `tool-use`), con plantilla de chat intacta.
- Multimodalidad: pipeline image-text-to-text; los pesos de visión se conservan sin cambios (aunque su ejecución no ha sido probada en la edición NVFP4).
- Predicción multi-token (MTP): los pesos MTP se incluyen sin cuantizar ni editar.
- Contexto largo: arquitectura configurada hasta 1.048.576 posiciones (sin validación de calidad en este derivado).
- Idiomas: inglés y chino.

## Casos de uso

- Investigación en desactivación de rechazos (abliteration): la adaptación Heretic con ediciones acotadas y documentadas en EVIDENCE.json es útil para estudiar cómo afectan estas técnicas a modelos MoE a gran escala.
- Investigación en cuantización de pesos extrema: la edición NVFP4 mixta sirve como caso de estudio para cuantizar solo los proyecciones de expertos (36.288) manteniendo el resto en precisión nativa.
- Desarrollo de runtimes y loaders: el formato personalizado `glm53-native-nvfp4-pack/2` está pensado para implementar y cualificar backends Strata compatibles.
- Experimentación con atención híbrida: el checkpoint conserva KDA, DSA y hyper-connections, útil para probar infraestructuras de inferencia sobre arquitecturas no estándar.
- Base para conversiones posteriores: la edición en precisión original (328,34 GB en safetensors) está destinada a runtimes compatibles con GLM-5.3-Flash y a conversiones a otros formatos.
- Uso multimodal con razonamiento y herramientas: para entornos que ya soporten Glm5NextForConditionalGeneration, puede emplearse en tareas de imagen-texto con tool use y modo thinking, heredando las capacidades del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ningún benchmark amplio, garantía de calidad inalterada, puntuación de tasa de rechazo ni rendimiento medido para este derivado. La validación realizada se limita a una comprobación de consistencia del checkpoint (logits de último token idénticos bit a bit y NLL exacta en una verificación independiente de 45 capas) y a la verificación de hashes SHA256 y completitud de la edición NVFP4; no se han medido NLL/perplejidad de NVFP4, calidad de respuestas generadas ni ejecución de visión/MTP.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra medida. Como referencia de tamaño de pesos, la edición de precisión original ocupa 328,34 GB y la edición NVFP4 195,08 GB (tamaño en disco, no requisito exacto de RAM/VRAM en ejecución). En cualquier caso, se requieren configuraciones multi-GPU de gama alta o servidores dedicados.
- GPU recomendadas: no disponible. Por orden de magnitud, pesos de cientos de GB implican nodos con múltiples aceleradores de datacenter (tipo A100/H100 de 80 GB en configuración multi-GPU).
- Consumer GPU: no es viable en GPUs de consumo actuales dado el tamaño de los pesos.
- Opciones de despliegue: no compatible con llama.cpp, Ollama, vLLM o TGI de forma inmediata según la información disponible. Requiere un runtime que soporte `Glm5NextForConditionalGeneration` y el formato de almacenamiento de la edición elegida. La edición NVFP4 necesita además un loader/backend Strata que, según el autor, aún debe implementarse y cualificarse.
- Latencia y throughput: no disponible; el autor no incluye ningún resultado de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Heretic (este) | no disponible (MoE, 12.096 expertos enrutados, 8 activos/token) | MoE híbrido (KDA + DSA), multimodal, MTP | MIT | safetensors / pack NVFP4 propio | Derivado abliterado; sin benchmarks publicados |
| GLM-5.3-Flash (base, zai-org) | no disponible | Idéntica arquitectura | no disponible en la informacion proporcionada | no disponible | Modelo original sin ediciones Heretic |

No hay más alternativas comparables en la informacion proporcionada; para comparativas de rendimiento habría que acudir a los resultados publicados del modelo base, no disponibles aquí.

## Limitaciones y advertencias

- Sin validación de calidad: no hay benchmarks, pruebas de perplejidad NVFP4, ni pruebas de ejecución de visión/MTP; el checkpoint solo pasó una verificación de consistencia interna.
- Heretic no garantiza respuestas sin rechazos, correctas ni libres de alucinaciones, según advierte el propio autor.
- El 8% de edición es un tope de desplazamiento de pesos, no una medida de reducción de rechazos ni de pérdida de calidad.
- La edición NVFP4 usa un formato personalizado sin loader disponible: no es GGUF ni un checkpoint estándar de Transformers/ModelOpt, y "NVFP4" describe solo los pesos almacenados, no garantiza ejecución nativa FP4 en hardware arbitrario.
- El contexto de 1.048.576 posiciones es un límite de configuración, no un resultado validado de calidad.
- Las ediciones Heretic no afectan a visión ni a MTP, pero estos componentes no han sido probados en ejecución en la edición NVFP4.
- Descarga: hay que comprobar RELEASE_STATUS.json antes de descargar; una edición solo está completa cuando `complete` es `true`, y no se deben mezclar shards entre ediciones.
- Riesgo ético: al tratarse de una versión abliterada, puede eludir salvaguardas de seguridad del modelo base; su uso conlleva responsabilidades legales y éticas para el desplegador.
- Sesgos conocidos: no disponible; hereda los del modelo base GLM-5.3-Flash, no documentados aquí.
- Idiomas: limitado a inglés y chino según la model card.

## Enlaces

- Ficha del modelo: https://huggingface.co/XopMC513/GLM-5.3-Flash-Heretic
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- RELEASE_STATUS.json: https://huggingface.co/XopMC513/GLM-5.3-Flash-Heretic/blob/main/RELEASE_STATUS.json
- FILES.json: https://huggingface.co/XopMC513/GLM-5.3-Flash-Heretic/blob/main/FILES.json
- EVIDENCE.json: https://huggingface.co/XopMC513/GLM-5.3-Flash-Heretic/blob/main/EVIDENCE.json
- Edición de precisión original: https://huggingface.co/XopMC513/GLM-5.3-Flash-Heretic/tree/main/HereticOriginalPrecision
- Edición NVFP4: https://huggingface.co/XopMC513/GLM-5.3-Flash-Heretic/tree/main/NVFP4

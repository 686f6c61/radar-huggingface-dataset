# windowsxp811203/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4 es una cuantizacion en NVFP4 (formato de 4 bits de NVIDIA) del modelo DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, un fine-tune comunitario de la familia Qwen 3.5 publicado por el usuario windowsxp811203. El repositorio contiene pesos en safetensors con metadatos de compressed-tensors y esta pensado para su despliegue en vLLM sobre hardware NVIDIA Blackwell, que es el unico que soporta de forma nativa el formato NVFP4.

El modelo base declara 27B en su nombre comercial, pero el recuento real de parametros en safetensors es de 19.135.892.976 (aproximadamente 19,1B), lo que sugiere que la cifra "27B" del nombre no corresponde al numero efectivo de pesos almacenados. El pipeline declarado es image-text-to-text, es decir, el modelo base incorpora capacidad multimodal de entrada de imagen y texto, aunque no se detalla la arquitectura exacta del componente visual.

La relevancia de esta ficha es doble: por un lado documenta una cuantizacion de 4 bits orientada a inferencia de alto rendimiento en vLLM con decodificacion especulativa (tags mtp y speculative-decoding); por otro, advierte de que el acceso esta restringido (gated) y de que se trata de un fine-tune de la comunidad sin benchmarks publicados ni documentacion tecnica detallada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, tag `qwen3_5`); multimodal image-text-to-text; detalles de capas y atencion no disponibles |
| Parametros totales | 19.135.892.976 (segun safetensors) |
| Parametros activos | no disponible (no se declara configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA), etiquetado tambien como 8-bit en los tags; compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), tamano del repo 28,6 GB |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen 3.5 (tag `qwen3_5`), por lo que se trata de un transformer decoder-only con capacidad multimodal de entrada (pipeline image-text-to-text). El fine-tune Cold-Fusion-GAIN-V1.1 añade, segun los tags del repositorio, soporte de MTP (multi-token prediction) y decodificacion especulativa, tecnicas que permiten proponer varios tokens por paso y verificarlos en paralelo para aumentar el throughput en inferencia. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el fine-tune.

La contribucion tecnica concreta de esta publicacion es la cuantizacion a NVFP4 mediante compressed-tensors. NVFP4 es un formato de coma flotante de 4 bits con escala compartida por bloques, disenado por NVIDIA para las GPU Blackwell (serie B200/GB200 y RTX 50xx), donde se ejecuta con kernels nativos en vLLM. Esto reduce el peso de los pesos a aproximadamente una cuarta parte del modelo en BF16, aunque el repositorio ocupa 28,6 GB, lo que sugiere que parte de los tensores (embeddings, capas de salida o componentes multimodales) se mantienen en mayor precision. No se detalla el esquema exacto de escalas ni que capas quedan sin cuantizar.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text): el modelo base acepta imagenes junto con instrucciones textuales.
- Razonamiento y generacion de codigo heredados del modelo base Qwen 3.5; sin datos especificos del fine-tune.
- Decodificacion especulativa y multi-token prediction (MTP) declaradas en los tags, orientadas a mejorar la latencia en vLLM.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible; el repositorio no declara lista de idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de inferencia de alto throughput en vLLM sobre GPU Blackwell: la cuantizacion NVFP4 permite servir un modelo de ~19B en menos VRAM que una version BF16, con kernels nativos y decodificacion especulativa activable para reducir la latencia por token en cargas concurrentes.
- Asistentes conversacionales con entrada de imagen: al ser image-text-to-text, puede emplearse en interfaces de chat donde el usuario adjunta capturas, diagramas o fotos y pide explicaciones o extraccion de informacion.
- Procesamiento de documentos escaneados en pipelines internos: combinando entrada visual y texto, se puede usar para resumir formularios o extraer campos, siempre que se valide la salida por el riesgo de alucinacion.
- Prototipado e investigacion de tecnicas de decodificacion especulativa: el tag MTP y la cuantizacion NVFP4 lo convierten en un banco de pruebas para medir ganancias de throughput frente a FP8 o BF16 en vLLM.
- Experimentacion academica con fine-tunes comunitarios: util para estudiar el impacto de la cuantizacion de 4 bits en la calidad de un fine-tune sobre Qwen 3.5, comparando contra el modelo base DavidAU sin cuantizar.
- Evaluacion interna de modelos multimodales antes de adoptar un proveedor: su licencia Apache 2.0 permite desplegarlo en infraestructura propia para pruebas de concepto sin coste de API, con la cautela de que el acceso esta restringido y no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 28,6 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos completos; con overhead de KV cache y activaciones, un minimo practico de 32-40 GB es razonable para contextos cortos.
- GPU recomendadas: NVIDIA Blackwell (B200, GB200, RTX 5090 y superiores), unicas con soporte nativo de NVFP4 en vLLM. En generaciones anteriores (H100, A100, RTX 4090) el formato NVFP4 no se ejecuta con kernels nativos y requeriria conversion previa.
- Cabe en consumer GPU: si, en RTX 5090 (32 GB) de forma ajustada y con contexto limitado; en RTX 4090 (24 GB) no cabe en NVFP4 sin offloading.
- Opciones de despliegue: vLLM es el runtime declarado en los tags; llama.cpp y Ollama no soportan NVFP4 de forma nativa, por lo que requeririan una cuantizacion GGUF alternativa no incluida en este repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|
| windowsxp811203/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4 | 19,1B (reales) | no disponible | NVFP4 | Apache 2.0 | Restringido (gated) |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 (base) | no disponible | no disponible | BF16/FP16 presumiblemente | Apache 2.0 (heredada) | no disponible |
| Familia Qwen 3.5 oficial (tamano equivalente) | no disponible | no disponible | multias | Apache 2.0 en la mayoria de tamanos | Publico |

La comparacion con alternativas oficiales de Qwen 3.5 no puede completarse con datos verificables en la informacion disponible; no se dispone de cifras de contexto ni de rendimiento del modelo base ni de sus equivalentes.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede bloquear automatizaciones y despliegues en CI.
- Ausencia total de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que el rendimiento real es desconocido.
- Discrepancia de parametros: el nombre indica 27B pero safetensors reporta 19,1B; conviene verificar la configuracion antes de dimensionar hardware.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en este fine-tune comunitario; en tareas de extraccion de informacion a partir de imagenes el riesgo es especialmente relevante.
- Sesgos: no documentados; al ser un fine-tune comunitario sin model card detallada, no hay evaluacion de sesgos ni de seguridad.
- Idiomas: no se declara cobertura linguistica; el rendimiento fuera del ingles y el chino es incierto.
- Limitaciones de contexto: la longitud de contexto no esta disponible, lo que impide garantizar conversaciones largas o documentos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base es un fine-tune de terceros y conviene revisar su model card original por si impone condiciones adicionales.
- Dependencia de hardware Blackwell: el formato NVFP4 limita el despliegue a GPU NVIDIA de ultima generacion con vLLM; no es portable a otros runtimes sin reconversion.
- Madurez: 61 descargas y 2 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Documentacion de compressed-tensors: no disponible en la informacion proporcionada
- Documentacion de NVFP4 en vLLM: no disponible en la informacion proporcionada
- Paper o blog del fine-tune Cold-Fusion-GAIN: no disponible en la informacion proporcionada

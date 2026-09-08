# TonyMFJ/Qwen3.8-Flash-Next-WinVulkan-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo MoE multimodal y de arquitectura híbrida desarrollado por QwenLM, que sirve como una vista previa temprana de la arquitectura que se usará en Qwen4. Según el repositorio oficial, se compone de un modelo principal de 125B parámetros complementado con 51B de embeddings n-gram, y activa 6B parámetros por token. Esta combinación reduce notablemente el coste de entrenamiento e inferencia en comparación con Qwen3.7-Plus, manteniendo capacidades sólidas en tareas de código y ofimática.

La versión que nos ocupa es un fork no oficial del usuario TonyMFJ, que publica los pesos en formato GGUF cuantizados en FP4 (ROCmFP4 FAST v2 ple16) con optimización específica para Windows Vulkan. Incluye un modelo auxiliar para decodificación especulativa (MTP), un proyector de visión en FP16 y un sidecar PLE que permite descargar parte de la tabla en disco para ahorrar VRAM y ampliar el contexto. El README del autor indica una ventana de contexto de 102.400 tokens y un despliegue pensado para APUs AMD con gran memoria unificada, como el Ryzen AI MAX+ 395.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (Gated DeltaNet + Gated Attention) con embeddings n-gram, multimodal |
| Parametros totales | 125B (modelo principal) + 51B (embeddings n-gram), según el repositorio oficial; el repo HuggingFace registra 51.200.231.360 en safetensors |
| Parametros activos | 6B activados por token |
| Longitud de contexto | 102.400 tokens |
| Tipos de cuantizacion | ROCmFP4 FAST v2 ple16 (modelo principal), Q4_K_M (modelo MTP), FP16 (proyector de visión) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con sidecar PLE, mmproj y modelo MTP) |

## Arquitectura y entrenamiento

El modelo combina una capa Gated DeltaNet con mecanismos de Gated Attention en un diseño MoE que activa solo 6B de sus parámetros por token. Esta arquitectura híbrida es una evolución del enfoque presentado en Qwen3-Next y se describe en el repositorio oficial como un adelanto de la arquitectura de Qwen4. Según la documentación disponible, el coste de entrenamiento es aproximadamente un noveno del de Qwen3.7-Plus, lo que lo hace más eficiente en cómputo sin renunciar a la capacidad.

Los datos concretos de entrenamiento (tamaño de dataset, composición, uso de RLHF o DPO) no se indican en la información disponible. En el fork de TonyMFJ se añade una capa de optimización para inferencia en Windows Vulkan mediante cuantización FP4, un modelo draft MTP para decodificación especulativa y un sidecar PLE que permite ejecutar la tabla n-gram directamente desde disco, reduciendo la memoria dedicada en aproximadamente 22 GB.

## Capacidades

- Generación de texto y razonamiento, con capacidades destacadas en tareas de oficina.
- Generación de código, al ser un modelo con buen desempeño en tareas de programación según el repositorio oficial.
- Visión: incluye un proyector de visión (mmproj) en FP16, habilitando la entrada de imágenes para tareas multimodales.
- Contexto largo: la ventana de 102.400 tokens permite trabajar con documentos extensos y conversaciones prolongadas.
- Decodificación especulativa: se acompaña de un modelo draft MTP, lo que puede acelerar la inferencia en uso con llama-server.
- Compatibilidad con Vulkan en Windows mediante un fork específico de llama.cpp.
- Soporte de sidecar PLE y la opción `--model-ple` para descargar la tabla n-gram a disco y liberar VRAM.

## Casos de uso

- Asistente de programación en local: puede desplegarse con llama.cpp en una estación de trabajo con GPU AMD y Vulkan, ofreciendo generación y revisión de código en sesiones largas gracias a los 102.400 tokens de contexto.
- Análisis de documentos extensos: la ventana amplia combinada con el sidecar PLE en disco permite procesar contratos, informes o manuales técnicos completos sin quedarse sin memoria de contexto.
- Chat multimodal privado: al incluir un proyector de visión y pesos GGUF, es posible ejecutar un asistente que lea imágenes y texto en un entorno local, sin enviar datos a servicios externos.
- Automatización de tareas ofimáticas: el modelo está documentado como especialmente competente en tareas de oficina, por lo que sirve para redactar correos, resumir reuniones o generar plantillas desde instrucciones de texto.
- Investigación de arquitecturas híbridas: al ser una vista previa de la arquitectura Qwen4, permite a investigadores y desarrolladores experimentar con Gated DeltaNet + Gated Attention en un runtime como llama.cpp.
- Prototipado en hardware de memoria unificada: la cuantización FP4 y la posibilidad de mover la tabla PLE a disco lo hacen adecuado para APUs AMD con grandes reservas de memoria compartida, como el Ryzen AI MAX+ 395, donde se puede ejecutar con contextos de 100K+.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas para este fork.

## Requisitos de hardware

- VRAM estimada: el README del autor no indica un valor mínimo absoluto, pero el GGUF principal ocupa 87 GB y el proyector de visión y el modelo MTP añaden unos 3,5 GB adicionales. Con el sidecar en disco se liberan unos 22 GB de VRAM, lo que facilita ampliar el contexto.
- GPU recomendadas: el fork está pensado para GPUs AMD con soporte Vulkan y gran memoria unificada. El autor lo ha validado en un AMD Ryzen AI MAX+ 395 con 96 GB de memoria compartida.
- Compatibilidad con GPU de consumo: no se indica que funcione en tarjetas de 24 GB. Con FP4, el modelo complejo sigue requiriendo un mínimo cercano a 87 GB, por lo que no cabe en una RTX 4090 ni en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: llama.cpp y llama-server en un fork con soporte Vulkan y los flags `--model-ple`, `--mmproj`, `-md` y `--load-mode auto`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: el autor indica que usar PLE en disco reduce la velocidad en aproximadamente un 37% respecto a mantener la tabla en VRAM. No se ofrecen cifras de tokens por segundo ni de latencia de primera respuesta.

## Comparativa con modelos similares

no disponible

## Limitaciones y advertencias

- Es un fork no oficial del modelo Qwen3.8-Flash-Next, creado por TonyMFJ, y no está respaldado por el equipo de QwenLM.
- Depende de un fork concreto de llama.cpp con soporte para sidecar PLE y de flags específicos como `--load-mode auto` y `--model-ple`; no funcionará con un llama.cpp estándar sin estos parches.
- No se han documentado evaluaciones de sesgos ni de seguridad. El modelo puede exhibir alucinaciones y reproducir sesgos presentes en sus datos de entrenamiento.
- La licencia no está especificada en la información proporcionada, lo que introduce incertidumbre para un uso comercial. Antes de desplegar en producción conviene verificar la licencia con los autores originales.
- El repositorio de HuggingFace muestra una fecha de creación en 2026 y un tamaño total de 119,6 GB, lo que implica una descarga muy voluminosa y un almacenamiento local considerable.
- No se disponen de datos sobre idiomas soportados, por lo que no se puede garantizar un comportamiento multilingüe correcto.

## Enlaces

- HuggingFace: https://huggingface.co/TonyMFJ/Qwen3.8-Flash-Next-WinVulkan-GGUF
- GitHub del fork: https://github.com/TonyMFJ/Qwen3.8-Flash-Next-WinVulkan
- GitHub oficial de QwenLM: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- README oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md

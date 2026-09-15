# TheBioHub/gemma4-e4b-biohub-gguf

## Resumen

gemma4-e4b-biohub-gguf es una compilación en formato GGUF del ajuste fino LoRA denominado gemma4-e4b-biohub, publicado por TheBioHub (Snyder Institute) sobre el modelo base google/gemma-4-e4b-it. Su propósito es actuar como capa conversacional de biohub, el sistema que ejecuta el Griffin-Pipeline sobre un clúster SLURM: el usuario describe en inglés la tarea bioinformática que quiere lanzar y el modelo emite la llamada a herramienta correspondiente. No es un modelo de propósito general, sino un fine-tune orientado a tool calling en un dominio muy concreto (bioinformática y HPC).

El interés técnico de esta build está en el hardware objetivo. La build hermana en MLX solo funciona en Apple Silicon; cuando se probó el backend de CPU de MLX en un nodo x86, generó a menos de 0,08 tokens por segundo, lo que lo hacía funcional pero inutilizable. Esta versión GGUF existe para inferencia por CPU en Linux x86 (nodos de login y cómputo HPC, o portátiles que no sean Mac con Apple Silicon), donde los kernels de CPU de llama.cpp son el camino principal y no un mecanismo de reserva.

El modelo declara 7.463.013.674 parámetros reales según safetensors, un repositorio de 5,3 GB y una única cuantización publicada, Q4_K_M (5,67 bits por peso). La licencia declarada es Apache 2.0, heredada del modelo base, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google. El soporte de idiomas se limita al inglés y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B); detalles de atención y capas no disponibles |
| Parametros totales | 7.463.013.674 (recuento real de safetensors) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card arranca llama-server con -c 4096, pero no se declara el máximo del modelo) |
| Tipos de cuantizacion | Q4_K_M (5,67 bits/peso) publicado; otras cuantizaciones generables con llama-quantize |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con license_link a los términos de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de identificarlo como google/gemma-4-e4b-it, un transformer de la familia Gemma 4. El sufijo E4B de la nomenclatura apunta a un modelo de aproximadamente 4B de parámetros efectivos, mientras que el recuento real de safetensors es de 7.463.013.674 parámetros; la ficha no describe el mecanismo de compresión ni confirma la cifra efectiva exacta. Sobre esa base se aplicó un ajuste fino LoRA para tool calling en el dominio de biohub, y el resultado se fusionó (merged fine-tune) antes de la conversión.

El proceso de conversión está documentado: se usó `convert_hf_to_gguf.py --outtype f16` sobre el fine-tune fusionado y después `llama-quantize` hasta Q4_K_M. Un detalle operativo relevante es que la conversión de Gemma 4 exige `transformers >= 5.12`; versiones anteriores fallan porque `extra_special_tokens` se trata como lista. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación destacable no está en el entrenamiento sino en el formato de salida de las llamadas a herramienta, que difiere del estándar. El modelo no emite el envoltorio habitual `<tool_call>{...}</tool_call>`, sino `<|tool_call>call:TOOL_NAME{{"arg": "value"}}<tool_call|>`: delimitadores distintos y un par de llaves redundante envolviendo el objeto JSON de argumentos. Es una propiedad del fine-tune y debe parsearse tal cual, sin corregirlo.

## Capacidades

- Generación de texto conversacional en inglés (pipeline text-generation, etiqueta conversational).
- Tool calling / function calling: es la capacidad central del fine-tune. El output de llamadas solo aparece cuando los esquemas de herramientas están presentes en el prompt.
- Formato de llamada a herramienta propio (`<|tool_call>call:...<tool_call|>`), no compatible directamente con parsers que esperan el envoltorio estándar.
- Operación como servidor compatible con la API de chat de OpenAI (`/v1/chat/completions` con un array `tools`) mediante `llama-server --jinja`.
- Integración con herramientas de dominio bioinformático y HPC: el ajuste está orientado a invocar utilidades del ecosistema biohub / Griffin-Pipeline sobre SLURM.
- Ejemplo de uso directo documentado por el autor: `llama-cli -m ... -p "Basecall run42 with kit SQK-RBK114-96"`.
- Inferencia en CPU sobre Linux x86, que es el escenario para el que se construyó esta build.
- No se documentan en la información disponible capacidades de visión, audio, modo de razonamiento explícito ni razonamiento matemático general.

## Casos de uso

- Lanzamiento de pipelines bioinformáticos por lenguaje natural: un investigador escribe "Basecall run42 with kit SQK-RBK114-96" y el modelo emite la llamada a la herramienta de basecalling correspondiente dentro de biohub, evitando tener que recordar la sintaxis exacta del pipeline.
- Control de trabajos en un clúster SLURM: el modelo traduce peticiones conversacionales ("envía el alineamiento a la cola de GPU") en llamadas a herramientas que gestionan `sbatch`, `squeue` o `scancel`, adecuado porque su fine-tune está construido específicamente sobre ese entorno.
- Consulta de estado y monitorización: preguntas del tipo "¿cómo va el run de ayer?" se convierten en llamadas a herramientas que consultan el estado de los jobs, útil para usuarios que no dominan la CLI de SLURM.
- Asistente embebido en nodos de login HPC: al ser una build GGUF para CPU x86, puede desplegarse con `llama-server` en el propio nodo de login, sin GPU ni dependencia de Apple Silicon, y atender peticiones OpenAI-compatible desde una interfaz web interna.
- Automatización de flujos con requisitos de recursos: el modelo puede rellenar parámetros de partición, número de CPUs, memoria y tiempo límite a partir de una descripción en inglés, reduciendo errores de configuración manual en scripts de envío.
- Backend de agente para informes de control de calidad: integrado en un bucle de agente que encadena varias llamadas a herramienta (ejecutar QC, recoger métricas, generar resumen), el modelo actúa como planificador en multi-step reasoning dentro del dominio biohub.
- Inferencia local en portátiles sin Apple Silicon: desarrolladores que necesitan probar el asistente en un equipo Linux x86 pueden ejecutar la cuantización Q4_K_M sin GPU, escenario descartado explícitamente por la build MLX por su lentitud en ese hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento presente en la model card es cualitativo y comparativo: el backend de CPU de MLX generó por debajo de 0,08 tokens por segundo en un nodo x86, y llama.cpp sobre hardware de la misma clase resultó "varios órdenes de magnitud" más rápido. No se especifican tokens por segundo exactos, latencia ni configuración de hardware para esa medición.

## Requisitos de hardware

- VRAM estimada para inferencia con Q4_K_M: en torno a 6-7 GB para contexto de 4K (5,3 GB de pesos más caché KV y sobrecarga del runtime); estimación orientativa, no declarada por el autor.
- Pesos en FP16: aproximadamente 15 GB (el archivo intermedio se genera con `--outtype f16`).
- CPU x86 Linux: es el objetivo declarado de esta build; funciona sin GPU. El autor recomienda `llama-server -m ... --jinja -c 4096 -t 16` como configuración de partida.
- GPU consumer compatibles con Q4_K_M: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4070 Ti, RTX 4080 y RTX 4090. Cabe en cualquier GPU con 8 GB o más.
- GPU de datacenter: A100, H100 y similares no son necesarias para Q4_K_M; tendrían sentido para FP16 o para servir muchas peticiones concurrentes.
- Opciones de despliegue confirmadas: `llama-cli` y `llama-server` de llama.cpp, con plantilla de chat activada mediante `--jinja` para el tool calling.
- Opciones de despliegue adicionales: llama-cpp-python y otros bindings de llama.cpp; Ollama requeriría importar el GGUF con un Modelfile; vLLM y TGI no consumen GGUF de forma nativa y exigirían reconvertir pesos a safetensors, con soporte limitado en ambos casos.
- Latencia y throughput: no disponibles. Solo se documenta que la alternativa MLX en CPU x86 quedaba por debajo de 0,08 tokens/s y que llama.cpp es sustancialmente más rápido en el mismo tipo de hardware, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| TheBioHub/gemma4-e4b-biohub-gguf | 7.463.013.674 | no disponible | GGUF (Q4_K_M) | apache-2.0 | Publicado (0 descargas, 0 likes) | CPU x86 Linux; tool calling con formato propio |
| TheBioHub/gemma4-e4b-biohub-mlx | no disponible | no disponible | MLX | no disponible | Publicado | Mismo fine-tune para Apple Silicon; en CPU x86 rinde por debajo de 0,08 tok/s |
| google/gemma-4-e4b-it | no disponible | no disponible | safetensors | términos de Gemma 4 de Google | Modelo base público | Sin fine-tune de dominio; firmado con `base_model` por TheBioHub |

No se dispone en la información proporcionada de comparativas con otros modelos de la misma categoría (otros asistentes de tool calling para HPC o bioinformática).

## Limitaciones y advertencias

- Idiomas: el modelo solo declara inglés. No hay soporte multilingüe documentado, lo que limita su uso en entornos hispanohablantes sin trabajo adicional.
- Formato de tool calling no estándar: emite `<|tool_call>call:TOOL_NAME{{"arg": "value"}}<tool_call|>` en lugar del envoltorio `<tool_call>{...}</tool_call>`. Cualquier integración que use un parser genérico de function calling fallará o devolverá JSON inválido por el par de llaves redundante.
- Dependencia de los esquemas: el output de llamadas a herramienta solo aparece cuando los esquemas están presentes en el prompt. Sin ellos, el modelo no invocará herramientas.
- Riesgo de alucinación: no se documenta ninguna evaluación de fiabilidad. En un dominio donde una llamada errónea puede lanzar un job costoso o consumir recursos de clúster, conviene validar los argumentos antes de ejecutarlos.
- Especificidad de dominio: el fine-tune está atado al conjunto de herramientas de biohub / Griffin-Pipeline. Fuera de ese ecosistema, su utilidad como asistente general no está demostrada.
- Discrepancia de licencia: los metadatos declaran apache-2.0, pero el `license_link` apunta a los términos de Gemma 4 de Google, que imponen restricciones de uso adicionales a las de Apache 2.0. Conviene revisar qué términos aplican realmente antes de un uso comercial.
- Madurez: el repositorio registra 0 descargas y 0 likes, y no se han publicado benchmarks. Es un artefacto reciente y sin validación externa.
- Sesgos: no disponibles. La model card no incluye ninguna evaluación de sesgos.
- Contexto: aunque el ejemplo de despliegue fija `-c 4096`, no se declara la longitud máxima soportada, por lo que no puede garantizarse el comportamiento en conversaciones muy largas.
- Conversión: requiere `transformers >= 5.12` para reconvertir desde el modelo fusionado; versiones anteriores fallan con `extra_special_tokens`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheBioHub/gemma4-e4b-biohub-gguf
- Build hermana en MLX: https://huggingface.co/TheBioHub/gemma4-e4b-biohub-mlx
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Repositorio biohub: https://github.com/Snyder-Institute
- Griffin-Pipeline: https://github.com/Snyder-Institute/Griffin-Pipeline
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license

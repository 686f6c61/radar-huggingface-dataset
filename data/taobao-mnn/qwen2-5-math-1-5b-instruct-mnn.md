# taobao-mnn/Qwen2.5-Math-1.5B-Instruct-MNN

## Resumen

Qwen2.5-Math-1.5B-Instruct-MNN es un paquete de inferencia de texto en formato MNN derivado del modelo Qwen/Qwen2.5-Math-1.5B-Instruct, un transformer causal de 1.500 millones de parámetros especializado en razonamiento matemático desarrollado por el equipo Qwen de Alibaba. El repositorio lo publica taobao-mnn y su función es empaquetar los pesos cuantizados del modelo original para ejecución eficiente en CPU mediante el motor MNN de Alibaba, orientado a despliegues en dispositivos de recursos limitados.

El paquete solo exporta el módulo de lenguaje (entrada y salida de texto), con la columna vertebral lineal cuantizada a 4 bits mediante HQQ (Half-Quadratic Quantization) con bloques de 128 y escala FP16, mientras que la embeddings de entrada se mantienen en BF16 como fichero separado. La arquitectura declarada es `Qwen2ForCausalLM` con 28 capas y `max_position_embeddings=4096`, aunque el autor advierte explícitamente que este valor de configuración no constituye una verificación de contexto máximo real.

Su relevancia actual radica en que ofrece una vía de despliegue en CPU (x64) con bajo consumo de memoria para un modelo matemático compacto, con un proceso de exportación reproducible y verificación documentada. La validación publicada se limita a CPU x64; ARM FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos móviles quedan sin verificar, y el autor reconoce que el caso `long_problem` falla en la línea base del modelo fuente y está exento de las expectativas de aceptación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Qwen2ForCausalLM`, model_type `qwen2`), 28 capas |
| Parámetros totales | 1.500 millones (según el nombre del modelo base; no medido en el paquete) |
| Parámetros activos | No aplica (no es MoE; la configuración no declara expertos enrutados) |
| Longitud de contexto | `max_position_embeddings=4096` en configuración; no verificado como contexto máximo real |
| Tipos de cuantización | HQQ 4-bit (block=128, alpha_bytes=2 FP16, sym=false) en pesos lineales y cabeza LM; embeddings de entrada en BF16 (`embeddings_bf16.bin`) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 (heredada del modelo upstream) |
| Formato de pesos | MNN (paquete de inferencia MNN 3.6.2; incluye grafo, pesos externos, tokenizador, embeddings BF16 y configuración) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer causal decoder-only de la familia Qwen2, con 28 capas de lenguaje según la configuración del paquete. No se declaran expertos enrutados, por lo que no es una arquitectura MoE. El paquete MNN exporta únicamente el módulo de lenguaje: la columna vertebral lineal y la cabeza de salida LM se cuantizan a 4 bits con HQQ (bloques de 128, escalas FP16, cuantización no simétrica), mientras que la embeddings de entrada se almacena por separado en BF16. Esta separación responde a que el diseño de la embeddings no es equivalente al almacenamiento de escalas de las capas lineales.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si el modelo original empleó RLHF, DPO u otras técnicas de alineación. El autor indica explícitamente que no transcribe evaluaciones, rendimientos o capacidades publicitarias del upstream que no hayan sido medidas en este paquete. La conversión se realiza con el exportador estándar de MNN en un commit fijado (`b0239771b07b317a258fbc384683bbd540741406`), con parámetros documentados en `export_args.json` y el diseño de cuantización en `refresh_metadata.json`. La verificación de alineación FP32 cubre prefill/decode, embeddings, capas representativas, normalización y logits en las 28 capas, aunque el autor aclara que esto no implica coincidencia token a token de la salida cuantizada.

## Capacidades

- Generación de texto en chino e inglés con foco en razonamiento matemático (aritmética, ecuaciones, problemas verbales).
- Resolución de problemas matemáticos de varios pasos, heredada del modelo Qwen2.5-Math-1.5B-Instruct.
- Generación determinista verificada en modo greedy sobre CPU x64 (precision=high, 8 hilos, sin mmap).
- Inferencia en CPU con backend `cpu`, memoria `low`, precisión `low` y 4 hilos en la configuración por defecto del paquete.
- Límite de generación por defecto de 512 tokens en el runtime del commit fijado.
- No se declaran capacidades de tool calling, function calling, agentes, visión, audio o vídeo en la información disponible.
- El paquete solo procesa texto; no se exportan módulos multimodales.
- No se documenta un modo "thinking" específico; el contexto Jinja por defecto es `null` y la clasificación de razonamiento es `none`.

## Casos de uso

- Resolución de problemas matemáticos en local sin GPU: el paquete está pensado para ejecutarse en CPU x64 con MNN, lo que permite desplegar un asistente de matemáticas en estaciones de trabajo o servidores sin acelerador dedicado, con cuantización 4-bit que reduce la huella de memoria.
- Aplicaciones educativas de refuerzo matemático: el modelo puede generar explicaciones paso a paso de ecuaciones y problemas verbales en chino o inglés, integrándose en tutores o herramientas de práctica para estudiantes.
- Preprocesado y verificación de expresiones en pipelines de datos: dado su sesgo matemático, puede emplearse para normalizar o comprobar resultados numéricos en flujos de procesamiento por lotes, siempre con validación posterior.
- Despliegue en entornos con restricciones de memoria: la combinación de HQQ 4-bit y embeddings BF16 separadas permite cargar el modelo en dispositivos con poca RAM, útil en edge computing x64 o contenedores ligeros.
- Prototipado e integración en aplicaciones C++ mediante MNN: el repositorio incluye instrucciones de compilación del runtime (`MNN_BUILD_LLM`, `MNN_LOW_MEMORY`, `MNN_SUPPORT_TRANSFORMER_FUSE`) y un `llm_demo`, lo que facilita incrustar el modelo en aplicaciones nativas.
- Reproducibilidad y auditoría de conversiones: al documentar parámetros de exportación, hashes y metadatos de verificación, el paquete sirve como referencia para equipos que necesitan reexportar o auditar un modelo cuantizado con trazabilidad.
- Evaluación comparativa de cuantización: útil para investigadores que quieran medir el impacto de HQQ 4-bit frente al modelo original en tareas aritméticas controladas, usando los casos predefinidos del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se publican cifras de rendimiento ni de memoria por dispositivo, y que no hay validación en GPU, móvil, FP16 ARM, visión, audio o vídeo. La única evidencia cuantitativa es de tipo funcional: los casos predefinidos (`arithmetic`, `equation`, `word_problem`, `long_problem`) cubren cada uno una vez, con longitudes de prompt reales entre 36 y 747 tokens (el caso `long_problem` usa 747 tokens), generación determinista con presupuesto de 1024 tokens y parada natural sin caracteres de reemplazo ni repeticiones anómalas. El caso `long_problem` falla en la línea base del modelo fuente y está exento de las expectativas de aceptación, por lo que el paquete no reclama exactitud en todos los casos.

## Requisitos de hardware

- VRAM estimada: no disponible; el paquete está orientado a CPU y no se publican cifras de memoria.
- GPU recomendadas: no disponibles; no se ha verificado CUDA, Metal, OpenCL ni Vulkan.
- Compatibilidad con GPU de consumo: no verificada.
- CPU: validado únicamente en x64; ARM CPU FP16 no verificado.
- Configuración por defecto del runtime: backend `cpu`, memoria `low`, precisión `low`, 4 hilos.
- Opciones de despliegue: motor MNN 3.6.2 con soporte LLM, low memory y transformer fuse; compilación con `-DMNN_BUILD_LLM=ON -DMNN_LOW_MEMORY=ON -DMNN_BUILD_CONVERTER=ON -DMNN_SUPPORT_TRANSFORMER_FUSE=ON -DMNN_SEP_BUILD=OFF`. Ejecución mediante `llm_demo` con `config.json` y fichero de prompt.
- Latencia y throughput: no disponibles; no se han publicado mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Math-1.5B-Instruct-MNN (este) | 1,5 B | 4096 en configuración (no verificado) | MNN, HQQ 4-bit + embeddings BF16 | Apache 2.0 | Solo CPU x64 verificado; sin benchmarks publicados |
| Qwen/Qwen2.5-Math-1.5B-Instruct | 1,5 B | 4096 en configuración | Safetensors (BF16/FP16, según upstream) | Apache 2.0 | Modelo fuente; capacidades y evaluación no medidas en este paquete |
| Alternativas de 1-2 B especializadas en matemáticas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- La validación se limita a CPU x64; ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos móviles no están verificados.
- El caso `long_problem` falla en la línea base del modelo fuente y está exento; el paquete no garantiza exactitud en todos los casos.
- El valor `max_position_embeddings=4096` es un campo de configuración, no una verificación del contexto máximo real.
- La cuantización HQQ 4-bit puede introducir errores en la salida; el autor advierte que la salida cuantizada puede ser incorrecta.
- Solo se soportan chino e inglés; no hay capacidades multilingües adicionales documentadas.
- No se declaran capacidades de tool calling, agentes, visión, audio ni vídeo.
- El límite de generación por defecto es de 512 tokens en el runtime del commit fijado; valores superiores requieren configuración explícita.
- La licencia Apache 2.0 se hereda del upstream; la conversión cuantizada no amplía la autorización y persisten las obligaciones de atribución y política de uso del modelo original.
- Los ficheros del paquete (grafo, pesos, tokenizador, embeddings, plantilla y configuración) deben actualizarse de forma conjunta; mezclar revisiones o sustituir solo el grafo puede romper la inferencia.
- No se publican mediciones de latencia, throughput ni memoria por dispositivo.
- Riesgo de alucinación inherente al modelo de lenguaje; no se documentan sesgos específicos en la información disponible.

## Enlaces

- [Hugging Face: taobao-mnn/Qwen2.5-Math-1.5B-Instruct-MNN](https://huggingface.co/taobao-mnn/Qwen2.5-Math-1.5B-Instruct-MNN)
- [Modelo base en ModelScope: Qwen/Qwen2.5-Math-1.5B-Instruct](https://modelscope.cn/models/Qwen/Qwen2.5-Math-1.5B-Instruct/summary)
- [Licencia Apache 2.0 del modelo base](https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct/blob/main/LICENSE)
- [Exportador MNN en el commit fijado](https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export)
- [Documentación de MNN-LLM](https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html)
- [Repositorio MNN de Alibaba](https://github.com/alibaba/MNN)
- Ficheros de trazabilidad del paquete: `export_args.json`, `refresh_metadata.json`, `config.json`, `llm_config.json`, `LICENSE`

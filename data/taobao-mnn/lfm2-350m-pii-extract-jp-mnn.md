# taobao-mnn/LFM2-350M-PII-Extract-JP-MNN

## Resumen

LFM2-350M-PII-Extract-JP-MNN es una version cuantizada y empaquetada para el runtime MNN del modelo LiquidAI/LFM2-350M-PII-Extract-JP, un modelo especializado en la extraccion de informacion personal identificable (PII) en textos japoneses. Lo publica el equipo taobao-mnn (Alibaba) como parte del ecosistema MNN, el motor de inferencia ligero de Alibaba pensado para despliegue en dispositivos y CPU. El modelo resuelve una tarea concreta: dado un texto en japones, identificar y devolver en JSON campos como nombre de persona, direccion, empresa, correo electronico y numero de telefono.

El modelo base es un LFM2 de 350 millones de parametros con 16 capas y dimension oculta de 1024, adaptado por LiquidAI para la extraccion de PII en japones. Esta version MNN aplica cuantizacion HQQ de 4 bits con grupo de 64 tanto a las capas lineales del modelo de lenguaje como a la cabeza de salida, manteniendo las escalas de cuantizacion en FP16 y compartiendo los pesos de embedding con la cabeza de salida.

Su relevancia actual reside en que permite ejecutar una tarea de extraccion de PII en CPU con 4 hilos y configuracion de baja memoria, sin GPU, lo que facilita el procesamiento local de datos sensibles. El repositorio ocupa 0,4 GB y esta orientado a integracion en aplicaciones mediante el runtime MNN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM2 (16 capas, dimension oculta 1024) |
| Parametros totales | 350M (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit con grupo de 64; escalas de cuantizacion en FP16 |
| Idiomas soportados | Japones (tarea), zh y en (etiquetas del repo) |
| Licencia | LFM Open License v1.0 (lfm1-0) |
| Formato de pesos | MNN (llm.mnn, llm.mnn.weight, tokenizer.mtok) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LFM2 de LiquidAI, un transformer de 16 capas con dimension oculta de 1024 y 350 millones de parametros, afinado especificamente para la extraccion de PII en japones. La version publicada en este repositorio no reentrena el modelo, sino que lo convierte al formato MNN y lo cuantiza con HQQ de 4 bits (grupo de 64) en las capas lineales del modelo de lenguaje y en la cabeza de salida, manteniendo las escalas en FP16 y compartiendo los pesos de embedding con la cabeza de salida.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La validacion publicada por el autor (17 de noviembre de 2026, x64 CPU) indica que se superaron las pruebas de alineacion de mapeo FP32, el caso de uso de extraccion de PII en japones y una prueba de humo con la configuracion por defecto.

## Capacidades

- Extraccion de informacion personal identificable (PII) en textos japoneses: nombres de persona, direcciones, nombres de empresa, correos electronicos y numeros de telefono.
- Salida estructurada en formato JSON con los campos detectados.
- Generacion de texto condicionada por un system prompt que define los campos a extraer.
- Ejecucion en CPU con precision baja y memoria reducida mediante el runtime MNN.
- Soporte de plantilla Jinja y correccion de tokens especiales en el runtime MNN (requiere el commit indicado).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Cumplimiento normativo y privacidad: procesar localmente textos en japones para detectar y enmascarar PII antes de almacenarlos o enviarlos a terceros, aprovechando que el modelo se ejecuta en CPU sin salida a servicios externos.
- Anonimizacion de registros de atencion al cliente: extraer nombres, correos y telefonos de transcripciones o tickets en japones y sustituirlos por marcadores antes de analiticas.
- Preprocesado de datos para entrenamiento: identificar y filtrar PII en corpus japoneses antes de usarlos en pipelines de datos, con salida JSON facilmente parseable.
- Integracion en aplicaciones de escritorio o moviles: al ser un paquete MNN de 0,4 GB y ejecutarse en CPU con 4 hilos, puede embeberse en herramientas locales de gestion documental.
- Enriquecimiento de CRM: extraer empresa, correo y telefono de correos o notas en japones para poblar campos estructurados de forma automatizada.
- Filtrado en pasarelas de correo: detectar datos personales en mensajes entrantes en japones y aplicar politicas de retencion o redaccion antes del archivado.
- Prototipado rapido de pipelines de extraccion: usar el system prompt configurable para adaptar los campos extraidos sin reentrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para el caso principal; el modelo esta disenado para inferencia en CPU. El repositorio pesa 0,4 GB en formato MNN cuantizado a 4 bits.
- GPU recomendadas: no disponibles; el autor documenta ejecucion en CPU x64 con 4 hilos, `precision=low` y `memory=low`.
- Cabe en GPU de consumo: no se documenta soporte GPU para este paquete MNN concreto; el flujo publicado es CPU.
- Opciones de despliegue: runtime MNN (`llm_demo`), compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`; requiere el commit 4756b19d51ddeaf0a73bbc9f230dea6d930f442e con el PR 5155 para plantilla Jinja y correccion de tokens especiales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2-350M-PII-Extract-JP-MNN (este) | 350M | no disponible | Extraccion de PII en japones | LFM Open License v1.0 | MNN 4-bit HQQ |
| LiquidAI/LFM2-350M-PII-Extract-JP | 350M | no disponible | Extraccion de PII en japones | LFM Open License v1.0 | safetensors (pesos originales) |
| Otros modelos de extraccion de PII en japones | no disponible | no disponible | Extraccion de PII | no disponible | no disponible |

La comparativa se limita al modelo base original, del que este repositorio es una conversion cuantizada para MNN. No se dispone de datos de benchmarks ni de alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en extraccion de PII en japones; su uso fuera de esa tarea o idioma no esta validado y probablemente produzca resultados pobres.
- Riesgo de alucinacion y de falsos positivos/negativos en la deteccion de entidades: al ser un modelo de 350M, la precision en textos ambiguos o con formatos poco habituales puede degradarse.
- No se documentan sesgos conocidos, pero al ser un modelo pequeno y afinado para una tarea concreta, puede reflejar sesgos de los datos de entrenamiento del modelo base.
- La licencia es LFM Open License v1.0, no una licencia de codigo abierto estandar; las condiciones de uso comercial se recogen en la seccion 5 de la licencia y deben revisarse antes de desplegar en produccion.
- El paquete requiere un commit concreto del runtime MNN y pasos de compilacion especificos; no funciona con versiones genericas de llama.cpp, Ollama, vLLM o TGI.
- La longitud de contexto no esta documentada en la informacion disponible, lo que limita la planificacion para documentos largos.
- La validacion publicada se limita a CPU x64; el comportamiento en otras plataformas no esta confirmado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/LFM2-350M-PII-Extract-JP-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM2-350M-PII-Extract-JP
- ModelScope: https://modelscope.cn/models/MNN/LFM2-350M-PII-Extract-JP-MNN
- Runtime MNN: https://github.com/alibaba/MNN
- PR de plantilla Jinja y tokens especiales: https://github.com/alibaba/MNN/pull/5155
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html

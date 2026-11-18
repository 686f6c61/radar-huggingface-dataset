# taobao-mnn/LFM2-1.2B-MNN

## Resumen

LFM2-1.2B-MNN es la versión cuantizada y empaquetada para el runtime MNN del modelo LiquidAI/LFM2-1.2B, desarrollado originalmente por Liquid AI y adaptado por el equipo taobao-mnn (Alibaba) para inferencia en dispositivo (edge). El modelo base es un transformer híbrido de 1,2 mil millones de parámetros con 16 capas y dimensión oculta 2048, orientado a diálogo y generación de texto en chino e inglés. Esta variante concreta aplica cuantización HQQ de 4 bits con grupos de 64 a las capas lineales del modelo de lenguaje y a la cabeza de salida, manteniendo las escalas de cuantización en FP16 y compartiendo los pesos de embedding con la cabeza de salida.

El problema que resuelve es el despliegue de un LLM de ~1,2B en CPU sin GPU, con un consumo de memoria reducido y un runtime ligero (MNN de Alibaba). El repositorio ocupa 1,4 GB e incluye el grafo (`llm.mnn`), los pesos (`llm.mnn.weight`), el tokenizador (`tokenizer.mtok`) y los ficheros de configuración (`config.json`, `llm_config.json`). La configuración por defecto es CPU, 4 hilos, `precision=low` y `memory=low`.

Es relevante ahora porque permite ejecutar un modelo conversacional multilingüe (zh/en) en hardware de consumo o en dispositivos móviles mediante MNN, un runtime pensado para Android, iOS y escritorio. La licencia es la LFM Open License v1.0, que impone condiciones específicas para uso comercial (sección 5), por lo que conviene revisarla antes de integrarlo en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (LFM2 de Liquid AI); 16 capas, dimensión oculta 2048 |
| Parametros totales | 1,2B (modelo base LFM2-1.2B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit, grupo 64 (capas lineales y cabeza de salida); escalas en FP16 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1-0) |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), tokenizador `tokenizer.mtok` |
| Tamano del repositorio | 1,4 GB |
| Runtime | MNN (Alibaba) |
| Configuracion por defecto | CPU, 4 hilos, `precision=low`, `memory=low` |

## Arquitectura y entrenamiento

El modelo base es LFM2-1.2B de Liquid AI, descrito en la model card como un modelo de lenguaje de arquitectura híbrida orientado a conversación y generación de texto en dispositivo. La model card de esta variante especifica 16 capas y dimensión oculta 2048. No se detalla en la información proporcionada la composición exacta de la arquitectura híbrida (proporción de capas de atención frente a capas de estado recurrente o convolucionales), ni los datos de entrenamiento, número de tokens, composición del corpus o si hubo RLHF/DPO.

La innovación técnica de esta variante es el pipeline de cuantización y empaquetado: cuantización HQQ de 4 bits con tamaño de grupo 64 sobre las capas lineales del modelo de lenguaje y la cabeza de salida, con escalas en FP16, y pesos de embedding compartidos con la cabeza de salida en 4 bits. El resultado se exporta al formato MNN con grafo y pesos separados, tokenizador propio y configuración de ejecución. La model card indica que la ejecución requiere una revisión concreta de MNN que incluye corrección de plantilla Jinja y tokens especiales (PR 5155, commit `4756b19d51ddeaf0a73bbc9f230dea6d930f442e`). Se documenta una validación el 2026-11-17 en CPU x64 con alineación de mapeo FP32, casos de saludo, aritmética y traducción, más una prueba de humo con la configuración por defecto.

## Capacidades

- Generación de texto y diálogo conversacional en chino e inglés.
- Razonamiento básico y aritmética simple (se cita un caso de prueba aritmético en la validación).
- Traducción entre idiomas soportados (se cita un caso de prueba de traducción).
- Inferencia en CPU sin GPU mediante el runtime MNN, con modos de bajo consumo de memoria (`MNN_LOW_MEMORY`, `memory=low`) y fusión de transformer (`MNN_SUPPORT_TRANSFORMER_FUSE`).
- Soporte de plantilla de chat Jinja y tokens especiales mediante la revisión específica de MNN indicada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional embebido en aplicaciones móviles Android/iOS: el modelo se ejecuta con MNN en CPU a 4 hilos y `memory=low`, lo que permite integrar un chat local sin conexión ni servidor GPU, con un peso en disco de 1,4 GB.
- Generación de texto en aplicaciones de escritorio con CPU: usando `llm_demo` o la API de MNN-LLM, se puede ofrecer autocompletado o redacción asistida en equipos sin GPU dedicada.
- Traducción zh-en y en-zh en local: la validación del autor incluye casos de traducción, y el soporte declarado de ambos idiomas encaja con escenarios de traducción de frases cortas en herramientas ofimáticas.
- Procesamiento de texto en el borde (edge computing) en entornos con restricciones de privacidad: al ejecutarse íntegramente en el dispositivo, los datos no salen del equipo, lo que resulta adecuado para notas, correos o documentos sensibles.
- Prototipado rápido de aplicaciones LLM sin infraestructura: el repositorio incluye grafo, pesos, tokenizador y configuración listos para `llm_demo`, lo que reduce el tiempo de puesta en marcha en pruebas de concepto.
- Aplicaciones de asistencia en chino para mercados asiáticos: el soporte nativo de zh y el empaquetado por parte de un equipo de Alibaba facilitan su integración en producto orientado a ese idioma.
- Filtrado y resumen de texto en pipelines locales: con 1,2B parámetros y cuantización 4-bit, el modelo cabe en memoria de dispositivos modestos para tareas de resumen o clasificación generativa de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta pruebas de validación cualitativas (alineación de mapeo FP32, saludo, aritmética, traducción y prueba de humo con configuración por defecto) realizadas el 2026-11-17 en CPU x64, sin métricas numéricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM: no aplica para la configuración por defecto, que es CPU. El repositorio ocupa 1,4 GB en disco; con cuantización HQQ 4-bit y embeddings compartidos, la huella en memoria es sustancialmente menor que la de un modelo de 1,2B en FP16.
- GPU recomendadas: no disponible; la model card está orientada a ejecución en CPU y no documenta requisitos de GPU.
- CPU: la configuración por defecto usa CPU con 4 hilos, `precision=low` y `memory=low`; se ha validado en CPU x64.
- GPU de consumo: no se documenta soporte ni rendimiento en RTX 4090 u otras GPU de consumo para este paquete MNN.
- Opciones de despliegue: runtime MNN (compilación con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_SUPPORT_TRANSFORMER_FUSE=ON`), binario `llm_demo` y API MNN-LLM. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponible; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2-1.2B-MNN (esta ficha) | 1,2B | no disponible | MNN, HQQ 4-bit | LFM Open License v1.0 | Optimizado para CPU/edge con MNN |
| LiquidAI/LFM2-1.2B | 1,2B | no disponible | safetensors (modelo base) | LFM Open License v1.0 | Modelo original sin cuantizar; requiere runtime estándar |
| Alternativas de ~1B en formato GGUF | no disponible | no disponible | GGUF | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al ser un modelo base de Liquid AI, hereda los sesgos de sus datos de entrenamiento, no detallados aquí.
- Riesgo de alucinación: no se cuantifica; como todo LLM de 1,2B, la fiabilidad factual es limitada y requiere verificación en producción.
- Limitaciones de contexto e idioma: solo se declaran chino e inglés; la longitud de contexto no está disponible en la información proporcionada, lo que impide planificar conversaciones de contexto largo.
- Licencia: LFM Open License v1.0; el uso comercial está sujeto a la sección 5 de la licencia, que debe revisarse antes de su integración en producto.
- Dependencia de una revisión concreta de MNN: la ejecución requiere la PR 5155 y el commit `4756b19d51ddeaf0a73bbc9f230dea6d930f442e`; versiones distintas del runtime pueden no funcionar correctamente con la plantilla Jinja y los tokens especiales.
- Formato propietario del runtime: los pesos están en formato MNN, no en safetensors ni GGUF, por lo que no son directamente portables a otros motores de inferencia sin reconversión.
- Advertencia de producción: la validación documentada es una prueba de humo cualitativa, no una evaluación sistemática; no hay métricas de calidad ni de latencia publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/LFM2-1.2B-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM2-1.2B
- ModelScope: https://modelscope.cn/models/MNN/LFM2-1.2B-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- PR de MNN con plantilla Jinja y corrección de tokens especiales: https://github.com/alibaba/MNN/pull/5155
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia (LFM Open License v1.0): https://huggingface.co/taobao-mnn/LFM2-1.2B-MNN/blob/main/LICENSE

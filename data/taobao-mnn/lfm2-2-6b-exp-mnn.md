# taobao-mnn/LFM2-2.6B-Exp-MNN

## Resumen

LFM2-2.6B-Exp-MNN es la versión cuantizada y empaquetada para el runtime MNN del modelo LiquidAI/LFM2-2.6B-Exp, un modelo de lenguaje de 2.600 millones de parámetros desarrollado por Liquid AI y entrenado mediante aprendizaje por refuerzo como variante experimental orientada a seguimiento de instrucciones, conocimiento y tareas matemáticas. El repositorio lo publica taobao-mnn, el equipo vinculado al motor de inferencia MNN de Alibaba, y su función es ofrecer los pesos en formato nativo MNN con cuantización HQQ de 4 bits para ejecución eficiente en CPU.

El modelo conserva la arquitectura del LFM2 original (30 capas y dimensión oculta de 2048), pero los pesos se han convertido a un formato propietario del runtime: ficheros `llm.mnn` y `llm.mnn.weight` junto con el tokenizador `tokenizer.mtok`. La cuantización aplica HQQ de 4 bits con grupo de 64 tanto a las capas lineales del modelo de lenguaje como a la cabeza de salida, con escalas en FP16 y embeddings compartidos con la cabeza de salida.

Es relevante para desarrolladores que necesitan desplegar un modelo de ~2,6B en entornos sin GPU, ya que la configuración por defecto apunta a CPU con 4 hilos y modos `precision=low` y `memory=low`. El repositorio ocupa 3,1 GB y solo soporta chino e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (LFM2); detalles internos de atención no disponibles |
| Parámetros totales | 2.600 millones (2,6B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | HQQ 4 bits, grupo 64 (capas lineales y cabeza de salida); escalas FP16 |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1-0); condiciones comerciales en la sección 5 |
| Formato de pesos | MNN propietario (`llm.mnn`, `llm.mnn.weight`); tokenizador `tokenizer.mtok` |
| Capas / dimensión oculta | 30 / 2048 |
| Entrada / salida | Texto / texto |
| Configuración por defecto | CPU, 4 hilos, `precision=low`, `memory=low` |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es LiquidAI/LFM2-2.6B-Exp, una variante experimental de LFM2 entrenada con aprendizaje por refuerzo y orientada a instrucciones, conocimiento y matemáticas. La model card del repositorio MNN solo detalla la capa de cuantización: 30 capas, dimensión oculta de 2048, pesos lineales y cabeza de salida en HQQ 4 bits con grupo 64, escalas FP16 y embeddings atados a la cabeza de salida en 4 bits. No se especifican el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF o RL.

La innovación técnica de este repositorio no está en el modelo sino en el pipeline de conversión: los pesos se han exportado al formato MNN con metadatos de exportación (`export_args.json`) y registro de pruebas (`refresh_metadata.json`). La ejecución requiere una revisión concreta del runtime MNN (commit `4756b19d51ddeaf0a73bbc9f230dea6d930f442e`, correspondiente al PR 5155) que incorpora plantilla Jinja y corrección de tokens especiales.

## Capacidades

- Generación de texto en chino e inglés.
- Seguimiento de instrucciones, según la orientación declarada del modelo base experimental.
- Tareas de conocimiento y matemáticas, también según la orientación declarada del modelo base.
- Ejecución en CPU mediante el runtime MNN con modos de bajo consumo de memoria.
- Traducción: la model card menciona un caso de prueba de traducción superado en la validación del 17 de noviembre de 2026.
- Aritmética básica: validada en las pruebas de humo del exportador.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en dispositivo: el modelo puede ejecutarse en CPU con 4 hilos y cuantización de 4 bits, lo que lo hace apto para aplicaciones de escritorio o embebidas donde no hay GPU disponible y se requiere un asistente en chino o inglés.
- Traducción zh-en en local: la validación del exportador incluye un caso de traducción superado, por lo que puede integrarse en utilidades de traducción offline dentro de herramientas de escritorio.
- Procesamiento por lotes de textos en servidores sin GPU: al ocupar 3,1 GB en disco y funcionar con MNN en CPU, encaja en pipelines de generación de resúmenes o clasificación textual donde el coste de GPU es prohibitivo.
- Aplicaciones móviles o de borde: MNN es un runtime orientado a despliegue en dispositivos; la versión cuantizada permite incorporar generación de texto en apps Android o iOS con requisitos de memoria reducidos.
- Automatización de tareas aritméticas sencillas: las pruebas de humo cubren aritmética, de modo que puede emplearse en asistentes de cálculo o validación de expresiones en flujos internos.
- Prototipado rápido de producto en chino: al soportar chino de forma nativa y requerir solo CPU, sirve para validar funcionalidades de generación de texto antes de migrar a un modelo mayor o a infraestructura con GPU.
- Evaluación comparativa de cuantización: útil para investigadores que quieran medir la degradación de un modelo de 2,6B tras aplicar HQQ 4 bits frente a los pesos originales en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta pruebas de humo cualitativas (alineación de mapeo FP32, saludo, aritmética y traducción) superadas el 17 de noviembre de 2026 en CPU x64 con la configuración por defecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma directa; el runtime por defecto es CPU. El repositorio pesa 3,1 GB en disco con pesos HQQ de 4 bits.
- GPU recomendadas: no disponibles; la configuración documentada es CPU con 4 hilos.
- ¿Cabe en GPU de consumo? No hay datos publicados sobre ejecución en GPU con MNN para este modelo.
- Opciones de despliegue: exclusivamente MNN (`llm_demo`), compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Idiomas |
|---|---|---|---|---|---|
| LFM2-2.6B-Exp-MNN (este) | 2,6B | No disponible | LFM Open License v1.0 | MNN, HQQ 4 bits | zh, en |
| LiquidAI/LFM2-2.6B-Exp (base) | 2,6B | No disponible | LFM Open License v1.0 | Safetensors (presumible) | zh, en |
| Alternativas de ~2-3B en formato MNN | No disponible | No disponible | No disponible | MNN | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta chino e inglés; no hay evidencia de capacidades multilingües adicionales.
- Es una variante experimental del modelo base; su comportamiento puede diferir del LFM2 estándar y no se documentan evaluaciones de calidad.
- No se han publicado benchmarks, por lo que no es posible estimar la degradación introducida por la cuantización HQQ 4 bits frente al modelo original.
- Riesgo de alucinación inherente a modelos de 2,6B; no hay documentación específica sobre mitigaciones.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Longitud de contexto no documentada; planificar el uso con prompts cortos hasta verificar el límite real.
- La licencia LFM Open License v1.0 impone condiciones para uso comercial recogidas en la sección 5; es necesario revisarlas antes de un despliegue en producción.
- El formato de pesos es propietario de MNN; no es directamente compatible con transformers, vLLM ni llama.cpp, lo que limita la portabilidad.
- La ejecución requiere una revisión concreta del runtime MNN (PR 5155), lo que añade fricción de integración y riesgo de incompatibilidades con versiones publicadas.
- El repositorio tiene un volumen de descargas muy bajo (46) y ningún "like", lo que reduce la validación comunitaria disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/LFM2-2.6B-Exp-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B-Exp
- ModelScope: https://modelscope.cn/models/MNN/LFM2-2.6B-Exp-MNN
- Runtime MNN (GitHub): https://github.com/alibaba/MNN
- PR 5155 de MNN (plantilla Jinja y tokens especiales): https://github.com/alibaba/MNN/pull/5155
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html

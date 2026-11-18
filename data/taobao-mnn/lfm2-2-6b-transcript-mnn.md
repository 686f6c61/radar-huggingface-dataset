# taobao-mnn/LFM2-2.6B-Transcript-MNN

## Resumen

LFM2-2.6B-Transcript-MNN es una versión cuantizada y empaquetada para el runtime MNN del modelo LiquidAI/LFM2-2.6B-Transcript, un modelo especializado en la generación de resúmenes de reuniones en inglés a partir de transcripciones de texto. Lo publica el equipo taobao-mnn (vinculado al repositorio MNN de Alibaba) y su propósito es permitir la ejecución del modelo en CPU con un consumo de memoria reducido, sin necesidad de GPU, mediante cuantización HQQ de 4 bits.

El modelo resuelve un problema acotado y concreto: a partir de una transcripción de reunión en un único turno de entrada, extrae puntos clave, decisiones tomadas, asistentes y tareas pendientes (action items). No es un modelo de propósito general, sino un derivado afinado del LFM2-2.6B base, con 30 capas y dimensión oculta de 2048.

Su relevancia actual reside en el formato de despliegue: frente a los pesos originales en safetensors, este repositorio ofrece un paquete listo para MNN con pesos HQQ 4-bit (grupo 64), escalas en FP16 y embeddings compartidos con la cabeza de salida, lo que facilita su integración en aplicaciones de escritorio o móviles que ya usan el ecosistema MNN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM2), 30 capas, dimension oculta 2048 |
| Parametros totales | 2.6B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit, grupo 64 (capas lineales y cabeza de salida); escalas FP16 |
| Idiomas soportados | zh, en |
| Licencia | LFM Open License v1.0 (lfm1-0) |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), tokenizer `tokenizer.mtok` |

## Arquitectura y entrenamiento

El modelo subyacente es LFM2-2.6B-Transcript, un transformer de 30 capas con dimensión oculta 2048, afinado por LiquidAI para la tarea de resumen de transcripciones de reuniones en inglés. La model card del repositorio MNN no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO; esa información corresponde a la model card del modelo original, que no se incluye en la información disponible.

La innovación técnica de este repositorio es la cadena de cuantización y exportación a MNN: pesos HQQ de 4 bits con grupo de 64 tanto en las capas lineales del lenguaje como en la cabeza de salida, escalas en FP16 y embeddings de tokens compartidos con la cabeza de salida en 4 bits. El paquete incluye el grafo (`llm.mnn`), los pesos (`llm.mnn.weight`), el tokenizador (`tokenizer.mtok`) y los ficheros de configuración (`config.json`, `llm_config.json`). La ejecución requiere una build de MNN que incorpore el soporte de plantillas Jinja y la corrección de tokens especiales (PR 5155), con las opciones `MNN_BUILD_LLM`, `MNN_LOW_MEMORY` y `MNN_SUPPORT_TRANSFORMER_FUSE`.

## Capacidades

- Generación de resúmenes de reuniones en inglés a partir de transcripciones de texto, en modo de entrada de un solo turno.
- Extracción de puntos clave, decisiones tomadas, asistentes y tareas pendientes (action items).
- Generación de texto condicionada por instrucciones incluidas en el prompt (por ejemplo, "Summarize the action items").
- Inferencia en CPU con configuración por defecto de 4 hilos, `precision=low` y `memory=low`.
- Soporte de los idiomas zh y en según los metadatos del repositorio, si bien la tarea de resumen está orientada al inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Resumen automático de actas de reuniones: se introduce la transcripción completa junto con una instrucción de resumen y el modelo devuelve los puntos principales y las decisiones, adecuado por su ajuste específico a esta tarea y su ejecución local en CPU.
- Extracción de action items en herramientas de gestión de proyectos: el modelo identifica compromisos y responsables a partir de la transcripción, de modo que un script posterior puede volcarlos a Jira, Linear o similar.
- Integración en aplicaciones de escritorio o móviles con MNN: al estar empaquetado para el runtime MNN con cuantización 4-bit, puede embeberse en apps nativas sin depender de servicios en la nube.
- Procesamiento por lotes de transcripciones en servidores sin GPU: la configuración por defecto (CPU, 4 hilos, memoria baja) permite ejecutar el modelo en máquinas modestas para resumir grandes volúmenes de reuniones.
- Cumplimiento y privacidad de datos: al ejecutarse localmente, las transcripciones no salen de la infraestructura de la organización, lo que resulta útil en entornos con requisitos de confidencialidad.
- Generación de borradores de minutos de reunión para revisión humana: el modelo produce un primer borrador estructurado que un asistente revisa y completa antes de distribuirlo.
- Búsqueda y archivado de conocimiento interno: los resúmenes generados pueden indexarse para consultar decisiones pasadas sin releer transcripciones completas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente documenta una validación cualitativa realizada el 2026-11-17 en CPU x64: alineación del mapeo en FP32, casos de resumen de reuniones, extracción de tareas pendientes, asistentes y decisiones, y una prueba de humo con la configuración por defecto, todos superados.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo documentado, que es CPU; el repositorio pesa 3.1 GB, lo que da una idea del espacio en disco necesario.
- GPU recomendadas: no se documentan; el paquete está pensado para ejecución en CPU mediante MNN.
- ¿Cabe en GPU de consumo? No se proporcionan datos de despliegue en GPU para este paquete MNN.
- Opciones de despliegue: runtime MNN (target `llm_demo`), compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`, usando la revisión 4756b19d51ddeaf0a73bbc9f230dea6d930f442e con la PR 5155.
- Configuración por defecto: CPU, 4 hilos, `precision=low`, `memory=low`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| LFM2-2.6B-Transcript-MNN | 2.6B | no disponible | MNN (HQQ 4-bit) | LFM Open License v1.0 | Resumen de reuniones, CPU |
| LiquidAI/LFM2-2.6B-Transcript | 2.6B | no disponible | safetensors | LFM Open License v1.0 | Resumen de reuniones, pesos originales |
| Modelos genéricos de resumen de ~2-3B | no disponible | no disponible | varios | varias | Resumen generalista |

La comparación relevante es con el modelo original del que deriva: misma arquitectura y licencia, pero distinto formato y precisión (HQQ 4-bit frente a los pesos sin cuantizar), lo que afecta al consumo de memoria y a la fidelidad numérica. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- Modelo especializado: está afinado para resumen de transcripciones de reuniones en inglés con entrada de un solo turno; su rendimiento fuera de esa tarea no está documentado y probablemente sea inferior al de un modelo de propósito general.
- Idiomas: los metadatos declaran zh y en, pero la tarea está orientada al inglés; no hay evidencia de calidad en otros idiomas.
- Contexto: la longitud máxima de contexto no está publicada, por lo que no puede garantizarse el procesamiento de transcripciones muy largas sin truncamiento.
- Cuantización: los pesos HQQ de 4 bits pueden introducir degradación respecto al modelo original; la validación publicada es cualitativa y con la configuración por defecto, no una evaluación exhaustiva.
- Dependencia de toolchain: requiere una build específica de MNN (PR 5155 y commit concreto), lo que añade fricción de integración y riesgo de incompatibilidades con versiones futuras.
- Licencia: LFM Open License v1.0; el uso comercial está sujeto a las condiciones de la sección 5 de la licencia, que deben revisarse antes de desplegar en producción.
- Alucinación: al ser un modelo generativo de 2.6B, puede inventar decisiones o responsables no presentes en la transcripción; conviene validar las salidas antes de usarlas en flujos automatizados.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/LFM2-2.6B-Transcript-MNN
- Modelo original: https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript
- ModelScope: https://modelscope.cn/models/MNN/LFM2-2.6B-Transcript-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- PR de MNN con soporte de plantillas Jinja y corrección de tokens especiales: https://github.com/alibaba/MNN/pull/5155
- Documentación de MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html

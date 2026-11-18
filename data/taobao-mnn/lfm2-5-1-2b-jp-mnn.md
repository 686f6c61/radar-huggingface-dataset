# taobao-mnn/LFM2.5-1.2B-JP-MNN

## Resumen

LFM2.5-1.2B-JP-MNN es la versión cuantizada y empaquetada para el runtime MNN del modelo LiquidAI/LFM2.5-1.2B-JP, un modelo de conversación de 1.2B parámetros desarrollado por Liquid AI y optimizado específicamente para japonés. El repositorio lo publica taobao-mnn (equipo vinculado al proyecto MNN de Alibaba) y su propósito no es ofrecer un modelo nuevo, sino un artefacto listo para inferencia en CPU mediante el motor MNN, con pesos cuantizados en HQQ de 4 bits.

La relevancia de esta ficha está en su orientación al despliegue en dispositivo: el paquete pesa 1,4 GB, emplea 16 capas con dimensión oculta de 2048 y está configurado por defecto para ejecutarse en CPU con 4 hilos, precisión baja y memoria baja. Esto lo sitúa en la categoría de modelos pequeños para entornos con recursos limitados, donde no hay GPU disponible.

Conviene subrayar que la model card original está redactada en chino e incluye únicamente especificaciones de empaquetado y ejecución, sin datos de entrenamiento, benchmarks ni evaluación de calidad. La información técnica disponible se limita, por tanto, a la arquitectura declarada y al formato de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM2.5-1.2B-JP); 16 capas, dimensión oculta 2048 |
| Parametros totales | 1,2B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit con grupo 64 (capas lineales del modelo de lenguaje y cabeza de salida); escalas de cuantización en FP16; embeddings compartidos con la cabeza de salida en 4-bit |
| Idiomas soportados | zh, en (según metadatos del repo); el modelo base está optimizado para japonés |
| Licencia | LFM Open License v1.0 (lfm1-0); uso comercial sujeto a la sección 5 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), tokenizador `tokenizer.mtok`, configuración `config.json` / `llm_config.json` |

## Arquitectura y entrenamiento

El artefacto es una conversión del modelo LiquidAI/LFM2.5-1.2B-JP al formato MNN, no un entrenamiento propio. La arquitectura declarada corresponde a un transformer de 16 capas con dimensión oculta de 2048. La cuantización aplicada es HQQ de 4 bits con tamaño de grupo 64 sobre las capas lineales del modelo de lenguaje y la cabeza de salida, manteniendo las escalas de cuantización en FP16 y compartiendo los embeddings de entrada con los pesos de la cabeza de salida en 4 bits. No se documenta en la información disponible ningún proceso de RLHF, DPO ni detalles sobre el corpus de entrenamiento del modelo base.

El valor técnico del repositorio reside en el pipeline de exportación y en el soporte de runtime: los parámetros de exportación están en `export_args.json` y los registros de prueba con hashes de ficheros en `refresh_metadata.json`. La ejecución requiere una compilación de MNN que incluya el soporte de plantillas Jinja y la corrección de tokens especiales (PR 5155), con las opciones `MNN_BUILD_LLM`, `MNN_LOW_MEMORY` y `MNN_SUPPORT_TRANSFORMER_FUSE` activadas. La validación declarada el 2026-11-17 sobre CPU x64 cubrió alineación de mapeo FP32, saludos, aritmética, traducción y pruebas de humo con la configuración por defecto.

## Capacidades

- Generación de texto conversacional en un modelo de 1,2B parámetros, orientado a diálogo.
- Soporte declarado de los idiomas chino e inglés en los metadatos; el modelo base está optimizado para japonés, por lo que se espera un rendimiento superior en esa lengua.
- Ejecución en CPU mediante MNN con configuración de 4 hilos, `precision=low` y `memory=low`.
- Inferencia en dispositivo sin GPU, gracias al empaquetado de 1,4 GB con pesos de 4 bits.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistentes conversacionales en japonés embebidos en aplicaciones de escritorio o móviles: el paquete MNN de 1,4 GB y la configuración para CPU con 4 hilos permiten integrar el modelo en clientes locales sin depender de servicios en la nube.
- Traducción y atención al usuario en entornos sin conectividad: la validación declarada incluye casos de traducción y saludos, lo que respalda su uso en utilidades de traducción ligera o respuestas guiadas en dispositivos aislados.
- Prototipado rápido de interfaces de chat: el binario `llm_demo` y un fichero `prompt.txt` permiten levantar un ciclo de generación en minutos para evaluar el comportamiento del modelo antes de integrarlo.
- Aplicaciones de escritorio con requisitos estrictos de privacidad: al ejecutarse localmente en CPU, los datos del usuario no salen del dispositivo, lo que encaja en escenarios con datos sensibles.
- Pruebas de integración de MNN en pipelines de CI: los ficheros `export_args.json` y `refresh_metadata.json` con hashes permiten verificar la reproducibilidad del empaquetado y detectar regresiones en la exportación.
- Evaluación comparativa de cuantización HQQ 4-bit: el artefacto sirve para medir el impacto de la cuantización de grupo 64 con escalas FP16 frente al modelo base en tareas de aritmética y traducción.
- Demostraciones educativas de despliegue de LLM en hardware de consumo: el tamaño reducido y la ausencia de requisitos de GPU lo hacen adecuado para talleres y entornos de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona pruebas de humo cualitativas (alineación FP32, saludos, aritmética, traducción) sin métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo documentado, que es CPU. El paquete completo ocupa 1,4 GB en disco; con cuantización de 4 bits y embeddings compartidos, la huella en memoria es del orden de 1 GB o inferior, aunque no se publica una cifra exacta.
- GPU recomendadas: no se documentan; el artefacto está orientado a CPU.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: MNN (compilación propia con `MNN_BUILD_LLM`, `MNN_LOW_MEMORY` y `MNN_SUPPORT_TRANSFORMER_FUSE`, target `llm_demo`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato MNN no es directamente compatible con ellos.
- Latencia y throughput: no disponibles. La configuración por defecto es CPU, 4 hilos, `precision=low` y `memory=low`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| LFM2.5-1.2B-JP-MNN (este) | 1,2B | no disponible | HQQ 4-bit, grupo 64 | LFM Open License v1.0 | MNN |
| LiquidAI/LFM2.5-1.2B-JP (base) | 1,2B | no disponible | FP (original) | LFM Open License v1.0 | safetensors (formato estándar de Hugging Face) |
| Alternativas de 1-2B para CPU | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento del modelo base ni de terceros comparables que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad; no hay base para afirmar su comportamiento en dominios sensibles.
- El modelo base está optimizado para japonés, pero los metadatos del repositorio declaran únicamente zh y en; el soporte real de japonés en este artefacto no se ha verificado de forma independiente.
- La longitud de contexto no está publicada, lo que impide planificar conversaciones multi-turno largas o tareas de recuperación con documentos extensos.
- La licencia LFM Open License v1.0 condiciona el uso comercial a lo dispuesto en su sección 5; es necesario revisar el texto completo antes de un despliegue en producción.
- El formato MNN requiere compilar el runtime desde una revisión concreta (PR 5155, commit 4756b19) y ejecutar `schema/generate.sh`; no es un artefacto plug-and-play en ecosistemas estándar como transformers o vLLM.
- La cuantización HQQ de 4 bits introduce pérdida de precisión; la validación declarada es cualitativa y no cuantifica la degradación frente al modelo original.
- El repositorio tiene un volumen de descargas muy bajo (50) y ningún "like", por lo que la validación por parte de la comunidad es prácticamente inexistente.
- No se documentan garantías de mantenimiento ni actualizaciones del artefacto más allá de la fecha de actualización registrada.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/LFM2.5-1.2B-JP-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP
- ModelScope: https://modelscope.cn/models/MNN/LFM2.5-1.2B-JP-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- PR de soporte de plantillas Jinja y tokens especiales: https://github.com/alibaba/MNN/pull/5155
- Documentación de MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia LFM Open License v1.0: fichero `LICENSE` del repositorio

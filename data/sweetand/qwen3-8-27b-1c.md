# sweetand/qwen3.8-27b-1C

## Resumen

El modelo **Qwen3.8-27B-1C** es una adaptación por fine-tuning supervisado (SFT) del modelo base **Qwen/Qwen3.8-27B** de Alibaba, especializada en el desarrollo sobre la plataforma **1C:Enterprise**. El autor, identificado como `sweetand`, ha entrenado un adaptador LoRA sobre el modelo denso multimodal de 27B parámetros para que asista a desarrolladores de 1C en tareas como generación y refactorización de código BSL, navegación por estructuras XML de configuración, explicación de mecanismos típicos de la plataforma y revisión de código. El modelo está orientado principalmente al idioma ruso, con soporte secundario en inglés, y hereda la ventana de contexto nativa del modelo base de hasta 262K tokens.

La relevancia de este modelo radica en que cubre un nicho muy específico: la asistencia a desarrolladores de 1C, un ecosistema con una comunidad amplia pero con escasas herramientas de IA especializadas y de código abierto. Al estar basado en Qwen3.8-27B, hereda capacidades multimodales (visión y texto), razonamiento y soporte para tool calling, lo que lo convierte en un asistente versátil dentro del dominio 1C. El adaptador LoRA, con aproximadamente 460 millones de parámetros, se publica bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en flujos de trabajo existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (basado en Qwen3.8-27B) con adaptador LoRA |
| Parametros totales | 460.730.096 (adaptador LoRA) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | Hasta 262K tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite FP8, NVFP4, GGUF) |
| Idiomas soportados | Ruso (principal), ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); el repositorio incluye tags GGUF pero no se confirma su presencia |

## Arquitectura y entrenamiento

El modelo base **Qwen3.8-27B** es un transformer denso nativo multimodal (vision-language) de 27B parámetros, desarrollado por Alibaba. La arquitectura incluye atención de ventana larga para soportar contextos de hasta 262K tokens y capacidades de razonamiento con modos thinking y non-thinking. Sobre esta base, el autor de Qwen3.8-27B-1C ha aplicado un adaptador LoRA mediante fine-tuning supervisado, sin modificar los pesos del modelo base.

El entrenamiento se realizó sobre datasets SFT específicos del dominio 1C: estructura de proyectos BSL+XML, estándares de desarrollo en la plataforma, esquemas XML de archivos de configuración, código abierto de configuraciones 1C, convenciones de nomenclatura para procedimientos y variables, y lenguaje de consultas de 1C. Los datos están principalmente en formato instructivo/chat con contextos largos, orientados a tareas reales de desarrollo. No se menciona el uso de RLHF o DPO; el proceso se limita a SFT con LoRA.

## Capacidades

- Generación y refactorización de código BSL (1C:Enterprise) siguiendo estándares de la plataforma.
- Navegación y explicación de estructuras de proyectos BSL+XML, incluyendo ubicación de objetos y módulos en volcados XML.
- Comprensión y generación de esquemas XML de configuración de 1C.
- Asistencia en code review de código BSL ajeno, explicando mecanismos típicos de la plataforma.
- Generación de nombres significativos para procedimientos, funciones, métodos, parámetros y variables según su rol y dominio.
- Comprensión del lenguaje de consultas de 1C (query language).
- Herencia de capacidades del modelo base: razonamiento multimodal (imagen-texto), modos thinking/non-thinking y tool calling.
- Soporte multilingüe limitado a ruso e inglés, con dominio principal en ruso.

## Casos de uso

- **Asistente de desarrollo 1C integrado en IDE**: el modelo puede integrarse como plugin en entornos como VS Code o EDT para responder preguntas sobre la ubicación de objetos en volcados XML, generar esqueletos de módulos BSL y refactorizar código existente. Su ventana de 262K tokens permite procesar módulos completos o incluso configuraciones parciales.
- **Automatización de code review en proyectos 1C**: en pipelines de CI/CD, el modelo puede analizar cambios en código BSL, detectar desviaciones de estándares de codificación y sugerir correcciones. Al estar especializado en 1C, entiende particularidades como la gestión de transacciones o el uso de objetos de plataforma.
- **Generación de consultas y reportes en 1C**: el modelo puede traducir descripciones en lenguaje natural (en ruso) a consultas del lenguaje de 1C, acelerando el desarrollo de informes y procesos de negocio.
- **Formación y documentación de código legado**: para proyectos 1C con código heredado poco documentado, el modelo puede explicar qué hace cada módulo, generar comentarios y documentación técnica en ruso, reduciendo la curva de aprendizaje de nuevos desarrolladores.
- **Migración y análisis de configuraciones**: el modelo puede ayudar a analizar volcados XML de configuraciones 1C para identificar dependencias, objetos no utilizados o patrones problemáticos, facilitando tareas de auditoría y mantenimiento.
- **Soporte técnico especializado**: como chatbot interno para equipos de desarrollo 1C, el modelo responde preguntas sobre mecanismos de plataforma, mejores prácticas y resolución de errores comunes, reduciendo el tiempo de búsqueda en documentación oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card del autor no incluye métricas de rendimiento comparativas (MMLU, HumanEval, GSM8K, etc.) para la adaptación 1C. Se recomienda evaluar el modelo en tareas propias del dominio 1C antes de su adopción en producción.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un adaptador LoRA sobre un modelo de 27B parámetros, la VRAM necesaria depende del modelo base cuantizado. Con cuantización FP8 (disponible para Qwen3.8-27B) se requieren aproximadamente 16-20 GB de VRAM; con cuantización NVFP4, unos 14-16 GB. En precisión completa (BF16) serían necesarios alrededor de 54 GB.
- **GPU recomendadas**: para ejecución local fluida se recomiendan GPU con al menos 24 GB de VRAM (RTX 3090/4090, A10G). Para despliegues profesionales, A100 (40/80 GB) o H100.
- **Compatibilidad con GPU de consumo**: sí, es posible ejecutar el modelo en GPU de consumo como RTX 4090 (24 GB) con cuantización FP8 o NVFP4, alcanzando velocidades de hasta 200 tokens por segundo según la configuración.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y cualquier servidor compatible con OpenAI API. El adaptador LoRA debe fusionarse con el modelo base antes del despliegue.
- **Latencia y throughput**: sin datos específicos para esta adaptación. El modelo base Qwen3.8-27B alcanza hasta 200 tokens por segundo con cuantización NVFP4 en hardware optimizado; la adaptación LoRA añade una sobrecarga mínima.

## Comparativa con modelos similares

No se han identificado modelos comparables específicos para el dominio 1C:Enterprise en el ecosistema open source. La especialización en BSL y XML de configuraciones 1C es un nicho con muy poca competencia. Como referencia, se compara con el modelo base y alternativas generalistas:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B-1C (este) | 27B base + 460M LoRA | 262K | 1C:Enterprise (BSL, XML) | Apache-2.0 |
| Qwen3.8-27B (base) | 27B | 262K | Generalista multimodal | Apache-2.0 |
| DeepSeek-Coder-V2-Lite | 16B (MoE, 2.4B activos) | 128K | Codigo general | MIT |
| CodeLlama-34B | 34B | 16K | Codigo general | Llama 2 license |

La diferencia clave es que Qwen3.8-27B-1C está específicamente entrenado para el ecosistema 1C, algo que ningún modelo generalista ofrece, aunque a costa de un rendimiento potencialmente inferior fuera de ese dominio.

## Limitaciones y advertencias

- **Alucinaciones en objetos de metadatos**: el modelo puede inventar nombres de objetos de metadatos, rutas XML o APIs "típicas" que no existen. Es imprescindible verificar cualquier respuesta en el configurador o en pruebas automatizadas.
- **Rendimiento fuera del dominio 1C**: el comportamiento del modelo fuera del ámbito 1C puede ser más débil o inestable que el del modelo base, dado el fine-tuning especializado.
- **Dependencia del contexto largo**: el uso de contextos superiores a 128K tokens requiere hardware potente y puede degradar la calidad de las respuestas si no se gestiona adecuadamente.
- **Idiomas limitados**: el modelo está optimizado para ruso; su rendimiento en inglés es secundario y en otros idiomas probablemente deficiente.
- **Verificación obligatoria en producción**: el código generado debe probarse en el configurador 1C o en entornos CI (por ejemplo, con Vanessa) antes de su uso en producción. No se garantiza que el código sea compilable o cumpla la normativa.
- **No sustituye documentación oficial**: el modelo no debe usarse como fuente de verdad para configuraciones propietarias o cerradas sin verificación independiente.
- **Licencias de datos de entrenamiento**: aunque el adaptador se distribuye bajo Apache-2.0, el autor advierte que deben respetarse las licencias de las bases de código abierto 1C utilizadas en el entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sweetand/qwen3.8-27b-1C
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia de despliegue local (Geeky Gadgets): https://www.geeky-gadgets.com/serve-qwen-3-8-27b-fast/
- Pagina del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Guia completa para ejecucion local (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
- Comparativa con Claude Opus (ExplainX): https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026

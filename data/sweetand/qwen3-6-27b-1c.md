# sweetand/qwen3.6-27b-1C

## Resumen

El modelo **sweetand/qwen3.6-27b-1C** es una adaptación mediante supervisión fina (SFT) del modelo denso Qwen/Qwen3.6-27B, especializada en el desarrollo sobre la plataforma 1C:Enterprise. Desarrollado por el usuario sweetand, resuelve un problema muy concreto: la escasez de modelos abiertos capaces de trabajar con el lenguaje BSL (1C:Enterprise Script), la estructura de las exportaciones XML de configuración y las prácticas estándar del ecosistema 1C.

La arquitectura hereda el transformer denso de 27.320 millones de parámetros de la base Qwen3.6-27B, con una ventana de contexto nativa de hasta 262.000 tokens. El ajuste se realizó con un adaptador LoRA sobre datasets instructivos orientados a tareas de desarrollo reales, no a chat general. El modelo mantiene las capacidades multimodales de la base (pipeline image-text-to-text), así como los modos de razonamiento thinking/non-thinking y el tool-calling.

La relevancia actual del modelo radica en que el ecosistema 1C carece de modelos especializados de código abierto con este nivel de calidad. La base Qwen3.6-27B ya destaca en tareas de codificación agéntica (77,2% en SWE-bench Verified según el blog oficial de Qwen), y esta adaptación la orienta a un dominio de nicho con alta demanda en el mundo empresarial de habla rusa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.6-27B) con adaptador LoRA |
| Parametros totales | 27.320.697.856 (27,32B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 262.000 tokens (heredada de Qwen3.6-27B) |
| Tipos de cuantizacion | GGUF disponible; tipos concretos no especificados en la información disponible |
| Idiomas soportados | Ruso (principal), inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repositorio base) y GGUF (etiqueta gguf presente en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 27.320 millones de parámetros, heredada íntegramente de Qwen3.6-27B. No es un modelo MoE: todos los parámetros se activan en cada inferencia. La base Qwen3.6-27B es un modelo nativo visión-lenguaje (image-text-to-text) con mejoras en codificación agéntica, razonamiento STEM y capacidades multimodales como comprensión de vídeo, OCR de documentos y agentes visuales.

El entrenamiento de la adaptación 1C consistió en una fase de SFT con un adaptador LoRA sobre datasets instructivos en formato chat con contextos largos. Los datos cubren: comprensión de la estructura de proyectos BSL+XML, estándares de desarrollo de 1C:Enterprise, esquemas XML de archivos de configuración, bases de código abierto 1C (lectura, explicación y modificación de patrones), convenciones de nomenclatura de procedimientos, funciones, métodos, parámetros y variables, el lenguaje de consultas de 1C, y trazas completas de llamadas a herramientas de más de 40 servidores MCP (incluido el fork de serena del propio autor). No se ha documentado el uso de RLHF o DPO en esta versión; el autor menciona el entrenamiento con pares DPO como plan de desarrollo futuro.

## Capacidades

- Generación y refactorización de código BSL conforme al estilo y estándares de 1C:Enterprise.
- Navegación y comprensión de la estructura de exportaciones XML de configuración 1C, incluyendo la localización de objetos y módulos.
- Explicación de mecanismos típicos de la plataforma 1C y de configuraciones estándar.
- Comprensión del lenguaje de consultas de 1C (query language).
- Asistencia en code review de código BSL ajeno.
- Soporte de tool-calling y agentes: entrenado con trazas de más de 40 servidores MCP, incluyendo serena y su fork.
- Modos de razonamiento thinking/non-thinking heredados de la base Qwen3.6-27B.
- Capacidades multimodales heredadas (visión, OCR, comprensión de vídeo) al mantener el pipeline image-text-to-text de la base.
- Generación de nombres de identificadores (procedimientos, funciones, variables) basada en rol, efecto y dominio.

## Casos de uso

- Asistente de desarrollo 1C integrado en IDE: el modelo puede responder preguntas sobre la ubicación de objetos y módulos en la exportación XML de una configuración, reduciendo el tiempo de navegación en proyectos grandes.
- Generación de código BSL en producción: con los parámetros de muestreo recomendados (temperature=0,6, top_p=0,95, repetition_penalty=1,3), puede generar módulos BSL completos que después se validan en el configurador o en CI.
- Refactorización de código heredado: explica y moderniza patrones BSL existentes respetando las convenciones de nomenclatura y estilo de 1C.
- Code review automatizado: analiza código BSL de terceros o de equipos externos y señala desviaciones de los estándares de la plataforma.
- Formación de desarrolladores junior: explica mecanismos de la plataforma 1C y el significado de fragmentos de configuración, con contexto largo para incluir ejemplos completos.
- Integración con agentes MCP: al estar entrenado con trazas de más de 40 servidores MCP, puede orquestar herramientas de desarrollo 1C de forma agéntica, por ejemplo con el fork de serena del autor.
- Documentación de configuraciones: dado un volcado XML, genera explicaciones estructuradas de la arquitectura de la configuración y sus módulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la adaptación 1C (sweetand/qwen3.6-27b-1C) en la información disponible.

Los benchmarks de la base Qwen3.6-27B, publicados por el equipo de Qwen, indican un 77,2% en SWE-bench Verified, superando al modelo Qwen3.5-397B-A17B en codificación agéntica. Estos datos corresponden al modelo base, no a la adaptación 1C, y deben interpretarse con cautela: el ajuste SFT especializado puede degradar el rendimiento general fuera del dominio 1C.

## Requisitos de hardware

Estimaciones orientativas para un modelo denso de 27,32B parámetros:

- FP16 (sin cuantizar): aproximadamente 54-55 GB de VRAM. Requiere una A100 80GB, H100 o dos GPU consumer de 24 GB.
- Cuantización Q8 (GGUF): aproximadamente 28-30 GB de VRAM. Cabe en una A100 40GB o en una RTX 4090 con cuantización más agresiva.
- Cuantización Q4 (GGUF): aproximadamente 14-17 GB de VRAM. Cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB, ajustado).
- Opciones de despliegue: llama.cpp (soporte GGUF confirmado por la etiqueta gguf), vLLM, TGI y endpoints compatibles con OpenAI. La model card menciona explícitamente el pipeline de export/serve habitual para GGUF y endpoints OpenAI-compatible tras el merge del adaptador.
- El contexto largo (128K+ tokens) depende fuertemente del hardware disponible; con cuantizaciones bajas y contextos extremos puede ser necesario usar offloading a CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| sweetand/qwen3.6-27b-1C | 27,32B denso | 262K | 1C:Enterprise / BSL | Apache-2.0 |
| Qwen/Qwen3.6-27B (base) | 27,32B denso | 262K | Generalista, codificación agéntica | Apache-2.0 |
| Qwen3.6-35B-A3B (MoE) | 35B (3B activos) | no disponible | Generalista, eficiencia | Apache-2.0 |

No se han encontrado otros modelos open source especializados en 1C:Enterprise/BSL con características comparables en la información disponible. La comparación directa con la base Qwen3.6-27B es la más relevante: la adaptación 1C sacrifica rendimiento general fuera del dominio a cambio de precisión en tareas BSL/XML.

## Limitaciones y advertencias

- Riesgo de alucinación en nombres de objetos de metadatos, rutas XML y APIs «típicas» de 1C. El autor lo advierte explícitamente en la model card.
- El comportamiento fuera del dominio 1C puede ser más débil o inestable que el de la base Qwen3.6-27B, debido al ajuste SFT especializado.
- El contexto largo (128K+ tokens) depende críticamente del hardware; en configuraciones modestas puede degradar el rendimiento o requerir offloading.
- No debe utilizarse como sustituto de la documentación oficial de 1C ni como fuente de verdad sobre configuraciones propietarias o cerradas.
- El código generado no está garantizado como compilable o reglamentariamente correcto; debe validarse siempre en el configurador o mediante CI (incluida Vanessa Automation).
- La licencia Apache-2.0 permite uso comercial, pero hay que respetar las licencias de las bases de código open source 1C que formaron parte del dataset de entrenamiento.
- El modelo está orientado principalmente al ruso; el soporte de inglés es secundario y puede ser menos consistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sweetand/qwen3.6-27b-1C
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Blog oficial de Qwen sobre Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Guía completa de Qwen 3.6-27B (aimadetools): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Página de QwenCloud: https://www.qwencloud.com/models/qwen3.6-27b
- Fork de serena del autor: https://github.com/asweetand-a11y/serena

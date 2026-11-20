# TheShellMaster/cypher-Qwen2.5-Coder-14B-abliterated

## Resumen

cypher-Qwen2.5-Coder-14B-abliterated es una distribución en formato GGUF de un modelo derivado de Qwen2.5-Coder-14B-Instruct, publicado por el usuario TheShellMaster bajo la etiqueta "cypher-studio". No se trata de un modelo entrenado desde cero, sino de un espejo (mirror) de la cuantización Q4_K_M generada por bartowski a partir de la variante "abliterated" del modelo de código de Qwen. El repositorio contiene un único archivo GGUF de aproximadamente 8,37 GB (el repo completo ocupa 9,0 GB), lo que lo hace directamente consumible por llama.cpp, Ollama y otros runners compatibles con GGUF.

El modelo subyacente, Qwen2.5-Coder-14B-Instruct, es un transformer decoder-only de 14.770.033.664 parámetros (14,77 mil millones) desarrollado por el equipo Qwen de Alibaba, especializado en generación de código, razonamiento matemático y tool calling. La variante "abliterated" implica que se ha aplicado una técnica de ablación de direcciones de rechazo (refusal directions) en el espacio de activaciones, con el objetivo de eliminar los mecanismos de negativa del modelo alineado original. Esta ficha describe las características heredadas del modelo base y advierte de que la información específica sobre el proceso de abliteración y la cuantización no está documentada en la model card.

La relevancia de esta publicación es limitada: se trata de un mirror sin descargas ni interacciones en el momento de la consulta, con una model card mínima en francés que solo identifica el archivo origen. Para evaluar el modelo conviene remitirse a la documentación oficial de Qwen2.5-Coder-14B-Instruct y al repositorio de bartowski, que sí contienen especificaciones técnicas detalladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-14B-Instruct; no detallada en la model card) |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen2.5-Coder soporta hasta 32.768 tokens nativos, ampliable; consultar documentación oficial) |
| Tipos de cuantizacion | Q4_K_M (única incluida en este repo); el repo de bartowski ofrece otras variantes |
| Idiomas soportados | No disponible en la model card (el modelo base es multilingüe, con foco en inglés y chino) |
| Licencia | No disponible en la model card (la licencia del modelo base Qwen2.5-Coder es Apache 2.0; la variante abliterated puede tener condiciones distintas, verificar en el repo de bartowski) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen2.5-Coder-14B-Instruct: un transformer decoder-only denso con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo original fue entrenado por el equipo Qwen sobre un corpus masivo de código y texto, con fases de preentrenamiento, ajuste supervisado y optimización por preferencias (DPO/RLHF), según la documentación pública de la familia Qwen2.5-Coder. No se dispone en esta model card de datos sobre el número exacto de tokens de entrenamiento ni de la composición del dataset.

La cadena de derivación es la siguiente: Qwen2.5-Coder-14B-Instruct (Alibaba) → variante abliterated (autoría no documentada en esta card) → cuantización GGUF Q4_K_M por bartowski → mirror publicado por TheShellMaster como "cypher-Qwen2.5-Coder-14B-abliterated". La técnica de abliteración consiste en identificar y restar las direcciones de activación asociadas a comportamientos de rechazo, lo que altera el comportamiento del modelo sin reentrenamiento adicional. No hay información en la card sobre el método exacto, el dataset de calibración de la cuantización ni si se aplicó imatrix (aunque la etiqueta "imatrix" aparece en los tags del repo, lo que sugiere que la cuantización pudo usar matrices de importancia).

## Capacidades

- Generación de código en múltiples lenguajes de programación, con especial énfasis en Python, JavaScript, TypeScript, Java, C++, Go y Rust, heredado de Qwen2.5-Coder.
- Razonamiento matemático y resolución de problemas algorítmicos.
- Soporte de tool calling y function calling (capacidad del modelo base Instruct).
- Capacidad de seguir instrucciones multi-turno y mantener contexto conversacional.
- Relleno de código (fill-in-the-middle) en el modelo base, aunque la cuantización puede degradar ligeramente esta capacidad.
- Comportamiento "abliterated": se espera una reducción de las negativas a peticiones que el modelo alineado rechazaría, aunque no hay evaluación pública de esta variante concreta.
- Capacidades multilingües heredadas del modelo base (inglés y chino principalmente; otros idiomas con menor calidad).
- No se documentan capacidades de visión, audio ni thinking mode explícito en esta card.

## Casos de uso

- Asistente de programación en local: el archivo GGUF Q4_K_M cabe en GPUs de consumo con 12-16 GB de VRAM, lo que permite desplegar un asistente de código privado sin conexión a servicios en la nube, útil para entornos con requisitos de confidencialidad.
- Autocompletado de código en IDE: mediante integración con llama.cpp u Ollama, el modelo puede servir como backend de extensiones tipo Continue.dev o similar, aprovechando su entrenamiento específico en código.
- Generación de tests unitarios y documentación técnica: el modelo puede producir pruebas y docstrings a partir de fragmentos de código, reduciendo trabajo manual en pipelines de CI/CD.
- Refactorización asistida: con contexto de hasta 32k tokens (según el modelo base), puede procesar módulos completos y proponer reestructuraciones, aunque la ventana efectiva en Q4_K_M debe validarse empíricamente.
- Chat técnico sin restricciones de contenido: la variante abliterated está pensada para escenarios donde se requiere que el modelo no rechace peticiones legítimas de análisis de seguridad, pentesting o investigación de vulnerabilidades, aunque esto conlleva riesgos éticos y legales.
- Prototipado de agentes de código: el soporte de tool calling del modelo base permite construir agentes que invoquen funciones, ejecuten comandos o consulten APIs en flujos multi-paso.
- Educación y formación en programación: puede generar explicaciones de código y ejercicios, con la advertencia de que la abliteración puede degradar la moderación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de la variante abliterated. Para referencia del modelo base, consultar la documentación oficial de Qwen2.5-Coder-14B-Instruct, que sí publica resultados, aunque estos no son directamente extrapolables a esta cuantización Q4_K_M ni a la modificación por abliteración.

## Requisitos de hardware

- VRAM estimada para inferencia con Q4_K_M: aproximadamente 9-10 GB, incluyendo overhead de contexto (el archivo pesa 8,37 GB; el contexto KV cache añade entre 0,5 y 2 GB según longitud).
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), RTX 3090 (24 GB), A10G (24 GB), L4 (24 GB). Para contextos largos o mayor throughput, A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 12 GB) con contexto moderado; en 8 GB no cabe en Q4_K_M sin offloading a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa (vLLM tiene soporte experimental limitado); para estos runners habría que usar los pesos safetensors del modelo base.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia orientativa, un modelo de 14B en Q4_K_M en una RTX 4090 suele alcanzar decenas de tokens por segundo, pero no se ha medido para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cypher-Qwen2.5-Coder-14B-abliterated (este) | 14,77 B | No disponible en card (base: 32k) | GGUF Q4_K_M | No disponible | Mirror sin descargas |
| Qwen2.5-Coder-14B-Instruct (oficial) | 14,77 B | 32.768 tokens (ampliable) | safetensors, GGUF | Apache 2.0 | Amplia, muy descargado |
| bartowski/Qwen2.5-Coder-14B-Instruct-abliterated-GGUF | 14,77 B | Heredado del base | GGUF (múltiples cuantizaciones) | Verificar en repo | Repo de referencia de la cadena |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B (2,4 B activos, MoE) | 128k | safetensors, GGUF | DeepSeek License | Amplia |

La comparativa se limita a modelos de tamaño y propósito similares; los datos de rendimiento no están disponibles para esta variante concreta. La principal diferencia frente al oficial es la abliteración y el mirror sin mantenimiento aparente.

## Limitaciones y advertencias

- La abliteración elimina o reduce los mecanismos de rechazo del modelo, lo que puede producir contenido dañino, sesgado o inseguro sin las salvaguardas del modelo alineado original. No se ha evaluado públicamente el impacto en calidad.
- Riesgo de alucinación inherente a los modelos de 14B, especialmente en tareas de razonamiento complejo o con contextos largos.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales en fp16/bf16; puede degradar ligeramente el rendimiento en código y matemáticas.
- Licencia no especificada en la model card: es imprescindible verificar la licencia del modelo base (Apache 2.0 para Qwen2.5-Coder) y las condiciones que el autor de la variante abliterated haya podido imponer antes de cualquier uso comercial.
- Model card mínima en francés, sin documentación de metodología, dataset de calibración ni evaluación. El repositorio no muestra descargas ni mantenimiento, lo que sugiere bajo soporte comunitario.
- Idiomas no declarados: aunque el modelo base es multilingüe, no hay garantía de calidad fuera de inglés y chino.
- Contexto no verificado en esta cuantización: la ventana efectiva puede ser menor que la del modelo base por limitaciones del runner y de la memoria disponible.
- Uso en producción desaconsejado sin una evaluación propia de seguridad, sesgos y calidad, dado el carácter no auditado de la variante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheShellMaster/cypher-Qwen2.5-Coder-14B-abliterated
- Modelo base de la cadena (GGUF): https://huggingface.co/bartowski/Qwen2.5-Coder-14B-Instruct-abliterated-GGUF
- Modelo original Qwen2.5-Coder-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Blog oficial de Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder/
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com

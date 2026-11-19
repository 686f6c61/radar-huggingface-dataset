# ukisai/Swift-1.5-Qwen3.8-27b

## Resumen

Swift 1.5 Qwen3.8-27B es un modelo derivado por ajuste fino (post-entrenamiento) del Qwen3.8-27B de Alibaba Qwen, desarrollado por UkisAI. Su propuesta central es la eficiencia en el razonamiento: según la model card, reduce el consumo de tokens de "thinking" en un 58,5 % manteniendo una puntuación un 0,35 % superior a la del modelo base, lo que se traduce en una aceleración de hasta 1,95× en varias tareas. Es la evolución de Swift 1.0, que acumuló más de 350 000 descargas, y amplía el post-entrenamiento (RL y OPD) con foco en tareas de horizonte largo, agentes y código.

El modelo conserva la arquitectura y el tamaño del base: 27 781 427 952 parámetros (27,8 B) almacenados en safetensors, con un repositorio de 55,6 GB. La pipeline declarada es `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen-texto, y la familia `qwen3_5`/`qwen3_8` sugiere una arquitectura transformer de la serie Qwen3.5 con módulo de razonamiento explícito.

Su relevancia actual radica en el coste de inferencia: en despliegues agénticos de múltiples pasos, el gasto en tokens de razonamiento domina la factura, y un modelo que mantiene precisión con casi un 60 % menos de tokens de pensamiento cambia el cálculo económico de pipelines de código, terminal y agentes autónomos. La licencia es propietaria (`swift-open-license-1.0`) y el repositorio está restringido (gated), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5/Qwen3.8 (tag `qwen3_5`), con modo de razonamiento; detalles de capas y atención no disponibles |
| Parametros totales | 27 781 427 952 (27,8 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (`Swift-1.5-Qwen3.8-27B-GGUF`) y variante GSQ-RCO GGUF; niveles concretos (Q4_K_M, Q8_0, etc.) no disponibles |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; se heredan presumiblemente los del base) |
| Licencia | swift-open-license-1.0 (propietaria, `license: other`, repositorio gated) |
| Formato de pesos | safetensors (transformers); GGUF en repositorios derivados |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.8-27B y no modifica la arquitectura: se trata de un ajuste fino sobre un transformer denso de 27,8 B parámetros con capacidad de entrada imagen-texto y un modo de razonamiento explícito (tokens de "thinking"). La innovación declarada no está en la topología sino en el post-entrenamiento: UkisAI identifica los tokens asociados a "sobrepensamiento patológico" y los penaliza sin atacar directamente la longitud del razonamiento, recuperando después la precisión mediante RL y OPD (on-policy distillation). El resultado es un uso comprimido de tokens con precisión mantenida o ligeramente superior.

Swift 1.5 se construye sobre Swift 1.0 escalando los métodos de post-entrenamiento que ya funcionaron en esa versión, esta vez con foco en tareas de horizonte largo, agentes y código, como reflejan las mejoras en LiveCodeBench y Terminal Bench 2.1. Los datos de entrenamiento son públicos en el dataset `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, aunque la model card aclara que no se usan tal cual: se remuestrean y se convierten en entornos de RL adecuados. No se especifican el número total de tokens de entrenamiento ni la composición exacta del corpus.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito, optimizado para consumir menos tokens de razonamiento que el base.
- Generación de código en escenarios de un solo turno y de horizonte largo; la model card cita mejoras en LiveCodeBench.
- Uso de terminal y tareas agénticas de línea de comandos; se reportan resultados en Terminal Bench 2.1.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`), lo que permite prompts con imágenes junto a texto.
- Capacidades conversacionales multi-turno (tag `conversational`).
- Orientación a entornos agénticos de múltiples pasos, con datos de SFT multi-turno específicos para agentes.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el enfoque agéntico del post-entrenamiento lo hace previsible; confirmar en la documentación del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de terminal y automatización de sistemas: el modelo está entrenado específicamente para Terminal Bench 2.1, por lo que encaja en agentes que ejecutan comandos, interpretan salidas y corrigen errores en bucles de varios pasos, donde la reducción de tokens de pensamiento abarata cada iteración.
- Generación de código en producción: con mejoras declaradas en LiveCodeBench, puede integrarse en pipelines de CI/CD para generar parches, tests o refactorizaciones, y la eficiencia de tokens reduce la latencia en revisiones automáticas.
- Desarrollo de prototipos y juegos en una sola sesión: la demo de la model card muestra la generación de un globo 3D explorable en 11,39 minutos frente a 104,6 minutos del base, un caso realista de generación de código largo con verificación iterativa.
- Asistentes de razonamiento con presupuesto de tokens ajustado: en productos donde el coste por consulta es crítico, el 58,5 % menos de tokens de pensamiento permite servir más peticiones con la misma infraestructura sin degradar la precisión.
- Análisis de capturas y documentos con imágenes: al aceptar entrada imagen-texto, sirve para extraer información de pantallas, diagramas o documentación escaneada y razonar sobre ella en conversaciones multi-turno.
- Agentes de investigación y flujos multi-paso: los datos de SFT multi-turno orientados a agentes lo hacen adecuado para orquestar herramientas encadenadas (búsqueda, ejecución, verificación) con contexto conversacional persistente.
- Evaluación comparativa de eficiencia: útil como referencia en experimentos de destilación o compresión de razonamiento, ya que su enfoque de penalización de tokens patológicos está documentado y sus datos de entrenamiento son públicos.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación externa que compara Qwen3.8-27B (base) con Swift 1.5, con métricas de puntuación, tokens de pensamiento, mediana y cambio relativo. Los valores numéricos concretos de esa tabla no están disponibles en la información proporcionada (el HTML fue truncado), por lo que no se reproducen cifras. Los benchmarks citados explícitamente son:

| Benchmark | Base | Swift 1.5 | Nota |
|---|---|---|---|
| LiveCodeBench | no disponible | mejora declarada frente al base | foco en código |
| Terminal Bench 2.1 | no disponible | mejora declarada frente al base | foco agéntico/terminal |
| Agregado de tareas (model card) | referencia | +0,35 % | con 58,5 % menos tokens de pensamiento y hasta 1,95× de aceleración |

No se han publicado en la información disponible los valores absolutos de MMLU, HumanEval, GSM8K ni del resto de benchmarks de la tabla del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 56 GB solo para pesos, más overhead de KV cache; requiere GPUs de 80 GB (A100 80GB, H100 80GB) o multi-GPU.
- Cuantización GGUF: los repositorios `Swift-1.5-Qwen3.8-27B-GGUF` y `Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF` permiten reducir la huella; con cuantizaciones de 4 bits el modelo rondaría los 15-16 GB de pesos, lo que lo hace viable en GPUs consumer de 24 GB (RTX 3090, RTX 4090) y en configuraciones de 16 GB con cuantizaciones más agresivas y offload parcial.
- GPU recomendadas: H100/A100 80GB para FP16 con contexto largo; RTX 4090 o RTX 3090 para cuantización 4-bit; para el modo multimodal con imágenes conviene margen adicional de VRAM.
- Despliegue: transformers (librería declarada), llama.cpp/Ollama vía GGUF, y servidores compatibles con endpoints (`endpoints_compatible` en los tags). vLLM y TGI no se confirman en la información disponible.
- Latencia y throughput: no disponibles como cifras absolutas; la model card reporta una aceleración de hasta 1,95× frente al base en varias tareas gracias a la reducción de tokens de pensamiento, y el ejemplo de generación de juego pasa de 104,6 a 11,39 minutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B | 27,8 B | no disponible | swift-open-license-1.0 (propietaria, gated) | Hugging Face, GGUF | Menos tokens de pensamiento, foco agéntico y código |
| Qwen3.8-27B (base) | 27,8 B | no disponible | la del base (consultar) | Hugging Face | Referencia de precisión; más tokens de pensamiento y más lento según el autor |
| Swift 1.0 Qwen3.8-27B | 27,8 B | no disponible | swift-open-license-1.0 | Hugging Face | Versión anterior, 350k+ descargas; superada por 1.5 en código y agentes |
| Otros modelos de ~27-32 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificables en la información proporcionada |

## Limitaciones y advertencias

- Licencia propietaria `swift-open-license-1.0`: es necesario revisar el texto completo antes de cualquier uso comercial; no es una licencia open source estándar.
- Repositorio gated: el acceso requiere aceptar condiciones en Hugging Face, lo que puede bloquear descargas automatizadas en CI.
- La reducción de tokens de pensamiento puede degradar el rendimiento en tareas que requieren cadenas de razonamiento muy largas; el propio autor indica que la compresión se hizo sin atacar directamente la longitud, pero conviene validar en el dominio propio.
- Riesgo de alucinación inherente a los modelos de 27 B, especialmente en tareas factuales y en generación de código sin verificación; la demo de juego no equivale a corrección funcional garantizada.
- Idiomas soportados no declarados: no hay garantía explícita de calidad en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no disponible: planificar el despliegue sin asumir una ventana concreta hasta confirmarla en la documentación del base.
- Los benchmarks publicados son del autor y con protocolos propios; la tabla completa no está disponible en la información proporcionada, por lo que las cifras deben tratarse con cautela hasta verificarlas.
- El modelo base Qwen3.8-27B tiene sus propias condiciones de uso que pueden aplicar en cascada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión anterior Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Web del autor: https://ukisai.com
- Página de producto: https://ukisai.com/products/swift
- Demo del juego generado: https://ukisai.com/swift-games/27b

# zerodigest/Qwen3.6-27B-YMQ-MTP-GGUF

## Resumen

Qwen3.6-27B-YMQ-MTP-GGUF es una colección de cuantizaciones GGUF del modelo Qwen3.6-27B, desarrollada por zerodigest mediante el framework propietario YMQ-Compiler v2.0. Se trata de una cuantización de precisión mixta consciente de la arquitectura, inspirada en la filosofía de AutoRound, que asigna diferentes profundidades de bits a distintos tensores según su importancia computacional en lugar de aplicar una cuantización uniforme sobre todas las capas.

El modelo base, Qwen/Qwen3.6-27B, presenta una arquitectura híbrida que combina atención Transformer Multi-Head con bloques Mamba de espacio de estados lineales (SSM), con un total de 27.320.697.856 parámetros. Esta versión cuantizada está optimizada para entornos de ejecución de API de desarrollo de código con contexto largo, incluyendo soporte nativo para motores de especulación de predicción multi-token (MTP) y una ventana de contexto de hasta 245.760 tokens según los parámetros de ejecución recomendados.

La relevancia de este lanzamiento radica en su enfoque de cuantización selectiva: en lugar de degradar uniformemente todos los tensores, el YMQ-Compiler protege las capas críticas de razonamiento con cuantizaciones de mayor precisión (Q5_K, Q6_K, IQ4_XS) mientras comprime agresivamente los tensores de almacenamiento de hechos a 2 bits, logrando así un equilibrio entre tamaño y calidad perceptual. El repositorio ofrece cinco niveles de cuantización (XXS, XS, M, L y XL) con tamaños de archivo que van de aproximadamente 11 GB a 19 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Transformer (Multi-Head Attention) + Mamba SSM |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 245.760 tokens (según parámetros recomendados) |
| Tipos de cuantizacion | GGUF de precisión mixta: IQ4_XS, IQ4_NL, IQ3_XXS, Q5_K, Q6_K, baselines de 2 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B combina bloques Transformer con atención Multi-Head y bloques Mamba de espacio de estados lineales (SSM), una arquitectura híbrida que busca capturar dependencias de largo alcance con eficiencia computacional. Esta release no modifica la arquitectura subyacente, sino que aplica un esquema de precisión mixta sobre los pesos originales en BF16 procesados directamente desde las fuentes oficiales.

El YMQ-Compiler v2.0 implementa cinco estrategias principales: detección de clústeres en espacio logarítmico para aislar picos de razonamiento intermedios y elevarlos a formatos no lineales de 4 bits (IQ4_XS); degradación gradual en las capas de entrada (L00=IQ4_NL, L01=IQ4_XS, L02=IQ3_XXS) para proteger los vectores de entrada iniciales; blindaje específico de las rutas paralelas de atención Multi-Head y Mamba SSM; protección asimétrica del vocabulario para evitar bucles de formato y fugas de etiquetas API en contextos profundos; y stripping pre-tokenizador para evitar desviaciones de índice en configuraciones híbridas. El framework analiza la importancia de las capas en espacio logarítmico de forma instantánea, sin necesidad de bucles de optimización prolongados como los de AutoRound.

Los datos de entrenamiento del modelo base no están disponibles en la información proporcionada. Esta release se centra exclusivamente en el proceso de cuantización y no documenta el dataset de entrenamiento original de Qwen3.6-27B.

## Capacidades

- Generación de texto con soporte de contexto largo (hasta 245.760 tokens según los parámetros recomendados).
- Predicción multi-token (MTP) con motores de especulación nativos, configurable con `--spec-type draft-mtp` en llama.cpp.
- Optimización específica para entornos de ejecución de API de desarrollo de código, como RooCode y Aider, según la descripción del autor.
- Soporte de visión multimodal mediante proyector externo (`--mmproj`), lo que permite procesar entrada de imágenes junto con texto.
- Integración con llama.cpp y llama-server para despliegue local en una sola GPU.
- Capacidades de tool calling y ejecución de API, inferidas de la optimización declarada para entornos de desarrollo con llamadas a API.
- Cinco niveles de cuantización (XXS, XS, M, L, XL) para adaptarse a distintos presupuestos de VRAM.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en herramientas como RooCode o Aider para asistencia en tiempo real, aprovechando su ventana de contexto de 245.760 tokens para mantener el contexto completo de proyectos grandes sin truncamientos.
- Generación de código en pipelines de CI/CD: con soporte de tool calling, puede ejecutarse como agente en pipelines automatizados para generar, revisar o refactorizar código, manteniendo el estado de la conversación durante procesos largos.
- Desarrollo de agentes autónomos multi-paso: la predicción multi-token (MTP) reduce la latencia en razonamientos encadenados, útil para agentes que necesitan planificar y ejecutar secuencias de acciones con verificación intermedia.
- Análisis y refactorización de repositorios completos: el contexto largo permite cargar múltiples archivos de un proyecto en una sola sesión para tareas de revisión de código, detección de vulnerabilidades o migración entre frameworks.
- Chat conversacional con historial extendido: su ventana de 245.760 tokens permite mantener conversaciones muy largas con historial completo, adecuado para asistentes de documentación técnica o soporte especializado.
- Procesamiento multimodal de documentación técnica: con el proyector de visión incluido, puede analizar capturas de pantalla de interfaces, diagramas de arquitectura o esquemas junto con código fuente en la misma sesión.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son las puntuaciones de perplejidad en WikiText-2, medidas con `llama-perplexity` a una ventana de contexto de 4096 tokens, reportadas por el autor:

| Variante | Tamaño del archivo | Perplejidad (WikiText-2) |
|---|---|---|
| XXS | ~11 GB | 7,6273 |
| XS | ~12 GB | 8,4656 |
| M (recomendada) | ~14 GB | 7,5295 |
| L | ~17 GB | 8,0920 |
| XL | ~19 GB | 7,9757 |

Cabe destacar que la variante M obtiene la mejor puntuación de perplejidad a pesar de ser aproximadamente 5 GB más pequeña que la XL, según el autor, debido a la protección selectiva de los picos de razonamiento con blindajes Q5_K y Q6_K. Estos resultados son auto-reportados y no han sido verificados de forma independiente. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada según variante: XXS ~11 GB, XS ~12,2 GB, M ~14 GB, L ~17 GB, XL ~19 GB.
- Las variantes XXS, XS y M caben en GPUs de consumo con 16-24 GB de VRAM, como RTX 4080, RTX 3090 o RTX 4090.
- Las variantes L y XL requieren GPUs con 20-24 GB de VRAM o más, como RTX 4090, RTX 6000 Ada o A100.
- Para la ventana de contexto completa de 245.760 tokens, se recomienda cache KV cuantizada (`-ctk q8_0 -ctv q4_0`) para reducir el consumo de memoria.
- Despliegue compatible con llama.cpp y llama-server, incluyendo soporte de especulación MTP con `--spec-type draft-mtp --spec-draft-n-max 2`.
- La latencia y el throughput no están especificados en la información disponible; dependerán de la GPU, la variante elegida y la longitud de contexto utilizada.

## Comparativa con modelos similares

La comparación directa con cuantizaciones estándar de Qwen3.6-27B (por ejemplo, Q4_K_M o Q8_0 generadas con llama.cpp) no está disponible en la información proporcionada. El autor afirma que la variante M "supera a las alternativas estándar de 4 bits de la industria", pero no se aportan datos comparativos cuantitativos que lo respalden.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.6-27B-YMQ-MTP (variante M) | 27,3 B | 245.760 tokens | Apache 2.0 | GGUF mixto |
| Qwen3.6-27B (base, BF16) | 27,3 B | no disponible | Apache 2.0 | Safetensors |
| Cuantizaciones estándar de Qwen3.6-27B | 27,3 B | no disponible | Apache 2.0 | GGUF |

## Limitaciones y advertencias

- Los resultados de perplejidad son auto-reportados por el autor y no han sido verificados de forma independiente; además, presentan un comportamiento inusual (la variante M supera a las más pesadas L y XL), lo que sugiere que la metodología de evaluación podría no ser directamente comparable entre variantes.
- La variante XXS muestra degradación en llamadas a API a partir de 50.000 tokens de contexto, según el propio autor.
- La variante XS presenta "fatiga de layout de contexto" en pasadas de codificación largas, según

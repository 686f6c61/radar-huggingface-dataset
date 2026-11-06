# vultr/Qwen3.5-397B-A17B-GGUF

## Resumen

Qwen3.5-397B-A17B es un modelo lingüístico de gran escala multimodal desarrollado por Qwen, del cual Vultr ha publicado cuantizaciones en formato GGUF optimizadas para su ejecución con llama.cpp. Se trata de un modelo Mixture-of-Experts (MoE) con 397 mil millones de parámetros totales, de los cuales solo 17 mil millones se activan por token, lo que permite combinar la capacidad de un modelo muy grande con la eficiencia de inferencia de uno mucho más pequeño.

El modelo está diseñado para razonamiento con contexto largo, comprensión visión-lenguaje y flujos de trabajo agénticos escalables. Emplea una arquitectura híbrida que combina capas Gated DeltaNet con atención completa, e integra un codificador de visión para procesamiento multimodal unificado, con una ventana de contexto de 262K tokens ampliable hasta aproximadamente 1M.

La versión de Vultr es especialmente relevante porque utiliza cuantizaciones híbridas: en lugar de aplicar una única precisión a toda la red, la precisión de cada capa se selecciona a partir de una puntuación de importancia medida, de modo que los bits se asignan donde más afectan a la salida. Esto permite desplegar un modelo de este tamaño con una degradación de calidad mínima, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35moe, Mixture-of-Experts híbrido (Gated DeltaNet + atención completa) |
| Parametros totales | 396.346.350.336 (~397B) |
| Parametros activos | 17B por token |
| Longitud de contexto | 262K tokens, ampliable a ~1M |
| Tipos de cuantizacion | GGUF híbridas (precisión por capa según puntuación de importancia; cuantizaciones concretas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp); modelo base en safetensors |

Datos adicionales de arquitectura:

| Parametro | Valor |
|---|---|
| Capas | 60 |
| Capas del codificador de vision | 27 |
| Tamano oculto | 4.096 |
| Cabeceras de atencion | 32 |
| Expertos | 512 totales, 10 enrutados + 1 compartido por token |
| Vocabulario | 248.320 |
| Tamano del repositorio | 963,7 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE híbrida de 60 capas que combina bloques Gated DeltaNet (una alternativa lineal a la atención clásica) con capas de atención completa. Este diseño híbrido reduce el coste computacional de procesar contextos muy largos manteniendo la capacidad de atención precisa donde es necesaria, lo que explica la ventana nativa de 262K tokens ampliable a ~1M. La parte MoE cuenta con 512 expertos totales, de los cuales se enrutan 10 más 1 compartido por token, activando solo 17B de los 397B parámetros en cada pasada. Incluye además un codificador de visión de 27 capas para procesamiento unificado de imagen y texto.

Sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se ha publicado información en los datos disponibles. En cuanto a la cuantización, Vultr aplica un enfoque híbrido: cada capa recibe una precisión distinta elegida según una puntuación de importancia medida, concentrando los bits de mayor precisión en las capas que más influyen en la salida del modelo.

## Capacidades

- Generacion de texto y razonamiento con contexto largo (262K tokens nativos, ampliables a ~1M), adecuado para documentos extensos y conversaciones multi-turno.
- Comprension multimodal imagen-texto (pipeline image-text-to-text) gracias a su codificador de vision integrado de 27 capas.
- Flujos de trabajo agenticos: el modelo esta optimizado explicitamente para razonamiento multi-paso y agentes escalables.
- Ejecucion eficiente con llama.cpp gracias al formato GGUF y a las 17B de parametros activos por token.
- Cuantizaciones hibridas que minimizan la perdida de calidad respecto al modelo de precision original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: con 262K tokens de contexto nativo (ampliables a ~1M), puede procesar contratos, informes financieros o bases de código completas en una sola pasada sin fragmentación.
- Asistentes conversacionales multimodales: dado su pipeline image-text-to-text, puede construirse un asistente que analice capturas, gráficos o fotografías junto con texto en conversaciones multi-turno.
- Agentes autonomos multi-paso: el modelo está optimizado para flujos de trabajo agénticos escalables, por lo que es adecuado para orquestadores que planifican, ejecutan herramientas y razonan sobre resultados en varias iteraciones.
- RAG sobre corpus grandes: su ventana de contexto larga permite incluir un volumen elevado de fragmentos recuperados, reduciendo la pérdida de información típica de contextos cortos.
- Inferencia autoservicio en infraestructura propia: al distribuirse en GGUF para llama.cpp, puede desplegarse en servidores propios o en la nube (por ejemplo, Vultr) sin depender de APIs de terceros, bajo licencia Apache 2.0 sin restricciones comerciales.
- Procesamiento por lotes de alto throughput: con solo 17B de parámetros activos por token, el coste por token generado es comparable al de un modelo denso pequeño, lo que lo hace eficiente para tareas de volumen alto como resumen masivo o clasificación.
- Generacion y revision de codigo: el razonamiento con contexto largo permite analizar repositorios completos y proponer cambios coherentes a través de múltiples archivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 963,7 GB en GGUF, por lo que incluso las cuantizaciones más agresivas requieren del orden de cientos de GB entre VRAM y RAM. No se han publicado los tamaños por cuantización concreta (dato no disponible).
- GPU recomendadas: configuraciones multi-GPU de gama datacenter (por ejemplo, varias A100 u H100 de 80 GB) o una combinación de GPU + RAM del sistema amplia (512 GB o más) para offload parcial con llama.cpp. No cabe en una única GPU consumer.
- Consumer GPU: no es viable en una sola tarjeta consumer (una RTX 4090 con 24 GB es insuficiente incluso para las cuantizaciones más bajas de un modelo de ~400B). Sería necesaria una configuración multi-GPU de gama alta o CPU con mucha RAM, con penalización severa de velocidad.
- Despliegue: llama.cpp es el runtime objetivo declarado del repositorio. Ollama (basado en llama.cpp) debería ser compatible con los ficheros GGUF. Compatibilidad con vLLM o TGI para esta cuantización concreta: no disponible.
- Latencia y throughput estimados: no disponible. Al activar solo 17B de parámetros por token, el throughput por token debe ser comparable al de un modelo denso de ese tamaño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.5-397B-A17B (Vultr GGUF) | ~397B | 17B | 262K (~1M ampliable) | Si (imagen-texto) | Apache 2.0 | GGUF |
| DeepSeek-V3 | 671B | 37B | 128K | No | Licencia propia (uso comercial restringido) | safetensors |
| Qwen3-235B-A22B | 235B | 22B | 128K+ | No (version base) | Apache 2.0 | safetensors, GGUF |
| Llama 4 Maverick | 400B | 17B | 1M+ | Si | Licencia Llama (restricciones comerciales) | safetensors, GGUF |

Qwen3.5-397B-A17B destaca frente a DeepSeek-V3 por su menor número de parámetros activos y su licencia Apache 2.0 sin restricciones, y frente a Qwen3-235B-A22B por su contexto nativo mayor y su naturaleza multimodal. Frente a Llama 4 Maverick, con una configuración de parámetros activos similar, ofrece una licencia más permisiva para uso comercial.

## Limitaciones y advertencias

- Tamano de despliegue muy elevado: con 963,7 GB de pesos cuantizados, el modelo exige infraestructura multi-GPU o servidores con RAM muy amplia, fuera del alcance de la mayoría de estaciones de trabajo individuales.
- Sesgos conocidos: no disponible en la informacion proporcionada; como todo LLM de gran escala, puede reproducir sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: inherente a los LLM generativos; no hay mediciones publicadas para esta versión cuantizada. Las cuantizaciones híbridas pueden introducir degradaciones adicionales respecto al modelo original que no están cuantificadas.
- Limitaciones de contexto: la ventana nativa es de 262K tokens; la ampliación a ~1M puede requerir configuración específica y afectar a la calidad de recuperación en posiciones muy lejanas.
- Idiomas soportados: no especificados en la ficha; verificar antes de desplegar en entornos no anglófonos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, pero conviene revisar los términos del modelo base de Qwen ante posibles condiciones adicionales.
- Compatibilidad de software: al ser una cuantización GGUF de terceros (Vultr), puede requerir una versión reciente de llama.cpp; la compatibilidad con otros runtimes no está documentada.

## Enlaces

- Repositorio en Hugging Face (cuantizacion GGUF de Vultr): https://huggingface.co/vultr/Qwen3.5-397B-A17B-GGUF
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Documentacion de Vultr: https://docs.vultr.com/
- Web de Vultr: https://www.vultr.com/
- Paper, blog oficial de Qwen y demos: no disponibles en la informacion proporcionada.

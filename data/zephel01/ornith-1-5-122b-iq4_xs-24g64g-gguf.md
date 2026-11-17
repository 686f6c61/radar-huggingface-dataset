# zephel01/Ornith-1.5-122B-IQ4_XS-24G64G-GGUF

## Resumen
Ornith-1.5-122B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por ornith-ai, distribuido bajo licencia MIT. Esta ficha describe la cuantización GGUF publicada por el usuario zephel01, etiquetada como IQ4_XS, diseñada específicamente para ejecutarse en un equipo con GPU de 24-32 GB de VRAM y 64 GB de RAM. El archivo resultante ocupa 68,9 GB y conserva los 256 expertos del modelo original, con una media de 4,26 bits por peso.

La relevancia de esta publicación radica en que permite ejecutar localmente un modelo de 124.635 millones de parámetros totales en hardware de consumo (por ejemplo, una RTX 5090), sin leer desde el SSD durante la generación, gracias a una receta de cuantización mixta con matriz de importancia (imatrix). El modelo base emplea una arquitectura etiquetada como `qwen35moe` e incluye un bloque NextN (MTP) para decodificación especulativa.

La información disponible proviene de la model card del cuantizador y de los metadatos de Hugging Face; no se han publicado datos sobre el entrenamiento del modelo base ni sobre sus benchmarks de capacidades. La versión se marca explícitamente como BETA y las mediciones se realizaron en un único equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen35moe`), con bloque NextN (MTP) para decodificación especulativa |
| Parametros totales | 124.635.206.144 (124,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de llama.cpp con `-c 32768`); máximo nativo no disponible |
| Tipos de cuantizacion | IQ4_XS con imatrix (98% de los expertos en bytes), Q4_K (2%), Q8_0 en atención, proyecciones delta-net y expertos compartidos; media de 4,26 bits por peso |
| Idiomas soportados | Inglés (en) y japonés (ja) según los tags de la model card; lista completa no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (dos shards: 47,6 GB + 21,3 GB) |

## Arquitectura y entrenamiento
El modelo base es un transformer de tipo Mixture of Experts con 124,6 mil millones de parámetros totales y 256 expertos enrutados, según se deduce de la model card del cuantizador. La arquitectura se registra en llama.cpp con el identificador `qwen35moe` e incorpora un bloque NextN (bloque `blk.48`, conservado en Q4_K) que actúa como cabezal de predicción multi-token para decodificación especulativa; el motor Abyss v1.3.57 o superior lo usa para generar borradores. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de esta publicación es la receta de cuantización: los expertos enrutados se cuantizan a IQ4_XS con una matriz de importancia calculada sobre texto técnico y código en inglés y japonés, mientras que la atención, las proyecciones delta-net y los expertos compartidos se mantienen en Q8_0. No se eliminó ningún experto. El resultado es un archivo de 68,9 GB con una divergencia KL media de 0,061 frente a BF16, lo que lo sitúa entre el UD-Q4_K_XL de Unsloth (0,039) y la versión IQ3_XXS del mismo autor (0,138).

## Capacidades
- Generación de texto conversacional en inglés y japonés, con soporte de respuestas en registro formal (keigo) según las pruebas del autor.
- Razonamiento de múltiples pasos y resolución de problemas aritméticos sencillos (el ejemplo de la model card consulta 17*23).
- Generación de código: las comprobaciones del autor incluyen tres tareas de programación con tests.
- Tool calling / function calling: una de las 11 comprobaciones del motor Abyss valida una llamada a herramienta.
- Recuperación de información en contexto largo (pruebas "needles" a 8K, 24K y 31K tokens).
- Decodificación especulativa mediante el bloque NextN (MTP) cuando se usa con Abyss v1.3.57 o superior.
- Compatibilidad con la API de endpoints de chat (`/v1/chat/completions`), lo que facilita la integración con clientes tipo OpenAI.
- Capacidades de visión, audio o modo "thinking" explícito: no disponibles en la información proporcionada.

## Casos de uso
- Asistente local de desarrollo: con 32K de contexto y soporte de tool calling, el modelo puede integrarse en un servidor llama.cpp o Abyss local para autocompletar, explicar y revisar código sin enviar datos a la nube.
- Generación de correo empresarial en japonés: las pruebas del autor muestran respuestas limpias en keigo, por lo que encaja en flujos de redacción de correos y documentos formales para equipos con personal japonés.
- Atención al cliente multilingüe (inglés/japonés): la ventana de 32K permite mantener conversaciones multi-turno con historial largo y documentación adjunta.
- Procesamiento de documentación técnica: la imatrix se construyó sobre texto técnico y código, lo que favorece tareas de resumen y extracción de información en manuales y bases de conocimiento.
- Despliegue en estaciones de trabajo con una sola GPU de consumo: al caber en 24 GB de VRAM más 64 GB de RAM, permite ofrecer inferencia privada en una RTX 5090 o similar sin infraestructura de servidor.
- Automatización de pipelines con agentes: la combinación de tool calling y decodificación especulativa con MTP permite construir agentes de varios pasos con latencia contenida en hardware local.
- Prototipado e investigación: al ser MIT y ejecutable en local, sirve para experimentar con modelos MoE de gran tamaño sin costes de API.

## Benchmarks y rendimiento
Calidad de la cuantización medida con `llama-perplexity --kl-divergence` frente a la conversión BF16 (8 fragmentos de 1024 tokens de texto en inglés y japonés no usado en la imatrix; perplejidad de BF16: 14,44):

| Archivo | Tamano | KL media | KL 99% | Mismo token top | PPL |
|---|---:|---:|---:|---:|---:|
| unsloth UD-Q4_K_XL | 80 GB | 0,039 | 0,32 | 89,5% | 14,37 |
| **este archivo** | **68,9 GB** | **0,061** | **0,45** | **85,7%** | **14,48** |
| misma receta, expertos IQ3_S + `ffn_down` IQ4_XS (no publicado) | 61,1 GB | 0,099 | 0,69 | 83,4% | no disponible |
| 16G64G IQ3_XXS-B | 51,7 GB | 0,138 | 1,09 | 81,3% | 14,88 |

Rendimiento de generación: 52,4 tok/s en una RTX 5090 limitada a 24 GB de VRAM con un nivel de 46 GB de RAM (límite total de 58 GB), según el teaser de la model card. No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: 24-32 GB para la GPU; el resto del modelo se reparte en RAM (unos 46 GB en un equipo de 64 GB, configurable con `STRATA_GLM_RAM_GB` en Abyss).
- RAM del sistema: 64 GB recomendados; el archivo completo ocupa 68,9 GB, pero la receta evita lecturas desde SSD durante la generación.
- GPU recomendadas: RTX 5090 (medición real del autor), tarjetas de 24 GB como RTX 4090 o RTX 3090, y tarjetas de 32 GB como RTX 5090 sin límite o profesionales de 32 GB.
- Cabe en GPU de consumo: sí, en GPUs de 24 GB o más combinadas con 64 GB de RAM; no cabe íntegramente en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp (`llama-server`, arquitectura `qwen35moe`, con `--cpu-moe` o `--n-cpu-moe`) y el motor Abyss (v1.3.57 o superior para usar el bloque MTP). No se mencionan vLLM, TGI ni Ollama.
- Throughput estimado: 52,4 tok/s en el equipo de referencia; no se dispone de datos de latencia de primer token.
- Parámetros de muestreo recomendados: temperature 0,6, top_p 0,95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Ornith-1.5-122B IQ4_XS 24G64G (este)** | 124,6 B totales | 32K en el ejemplo | 0,061 | MIT | GGUF, 68,9 GB |
| Ornith-1.5-122B IQ3_XXS 16G64G | 124,6 B totales | no disponible | 0,138 | MIT | GGUF, 51,7 GB |
| Ornith-1.5-122B UD-Q4_K_XL (Unsloth) | 124,6 B totales | no disponible | 0,039 | MIT (modelo base) | GGUF, 80 GB |
| Ornith-1.5-397B IQ2_XXS 32G128G | 397 B (aprox.) | no disponible | no disponible | MIT (modelo base) | GGUF, 114,2 GB |

La comparativa se limita a variantes del mismo modelo base porque la información proporcionada no incluye datos de modelos de otras familias.

## Limitaciones y advertencias
- Estado BETA: las mediciones se realizaron en un único equipo (RTX 5090 limitada a 24 GB con 46 GB de RAM), no en una tarjeta real de 24 GB; el rendimiento en otros equipos puede diferir.
- La comprobación de reutilización de conversación genera un WARN en todos los archivos de Ornith: la plantilla de chat descarta el razonamiento de respuestas anteriores, por lo que el siguiente prompt no empieza con los tokens que el motor guardó en caché.
- La ventana de contexto documentada en el ejemplo es de 32K tokens; no se especifica el máximo nativo, por lo que contextos mayores no están garantizados.
- Idiomas limitados a inglés y japonés según los tags; el rendimiento en castellano no está documentado.
- Riesgo de alucinación y sesgos: no se han publicado evaluaciones al respecto en la información disponible.
- La cuantización IQ4_XS introduce una pérdida de calidad medible (KL media 0,061 frente a BF16); si el equipo dispone de 80 GB, el autor recomienda el archivo UD-Q4_K_XL.
- Licencia MIT en el modelo base y en la cuantización, lo que permite uso comercial, pero conviene verificar los términos del modelo base original.
- El archivo está dividido en dos shards por el límite de 50 GB de Hugging Face; hay que apuntar las herramientas al primer shard.

## Enlaces
- Repositorio Hugging Face de esta cuantización: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ4_XS-24G64G-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Versión 16G64G (IQ3_XXS): https://huggingface.co/zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF
- Versión 397B IQ2_XXS 32G128G: https://huggingface.co/zephel01/Ornith-1.5-397B-IQ2_XXS-32G128G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Informe de resultados (issues de Abyss): https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Ornith-1.5-122B+24G64G
- Imagen teaser: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ4_XS-24G64G-GGUF/resolve/main/assets/teaser.png

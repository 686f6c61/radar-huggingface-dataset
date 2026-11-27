# Xylolabs/Hy-MT3-30B-A3B-MLX-8bit

## Resumen

Hy-MT3-30B-A3B-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo de traducción Tencent Hy-MT3-30B-A3B, publicada por Xylolabs. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 30.064.719.872 parámetros totales y 3.000 millones activos por token, entrenado específicamente para traducción automática en 102 idiomas. Esta versión está pensada para ejecutarse con `mlx-lm` sobre hardware Apple Silicon con memoria unificada, reduciendo el peso de 60,13 GB (BF16) a 31,96 GB sin pérdida apreciable de calidad según las métricas del autor.

La relevancia de esta ficha radica en que permite desplegar un modelo de traducción de 30B en un Mac Studio de 64 GB de memoria unificada, algo imposible con los pesos en bfloat16. La cuantización utiliza cuantización afín con tamaño de grupo 64, escalas y sesgos en float16, y preserva el router del MoE en bfloat16 para no degradar la selección de expertos. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial.

El modelo cubre 102 idiomas, entre ellos el castellano, catalán, gallego y euskera, y está orientado exclusivamente a traducción: no es un modelo conversacional general, sino un traductor especializado con instrucciones de formato estrictas (solo el texto traducido, sin explicaciones adicionales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 128 expertos enrutados, 1 experto compartido, capa densa inicial; código `hy_v3.py` para `mlx-lm` |
| Parametros totales | 30.064.719.872 (30B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | Hasta 256K tokens según hardware; 139K en Mac Studio M5 Max de 64 GB |
| Tipos de cuantizacion | 8 bits afín, grupo de 64, escalas y sesgos float16; router en bfloat16, sesgo de selección de expertos float32, normas float16 |
| Idiomas soportados | 102 idiomas, incluidos es, ca, gl, eu, en, zh, ja, ko, de, fr, etc. |
| Licencia | Apache 2.0 (modelo); `hy_v3.py` bajo MIT |
| Formato de pesos | safetensors (MLX), 32,0 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE: 128 expertos enrutados por capa más un experto compartido y una primera capa densa. Con 30B parámetros totales y solo 3B activos por token, el coste computacional por token es comparable al de un modelo denso de 3B, lo que explica su viabilidad en hardware de consumo con suficiente memoria. La cuantización de Xylolabs aplica cuantización afín de 8 bits con grupo de 64 a todos los 128 expertos enrutados, la atención, la capa densa inicial, el experto compartido, el embedding de tokens y la LM head; el router (`mlp.router.gate`) se mantiene en bfloat16 y el sesgo de selección de expertos en float32 para preservar la precisión del enrutamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El pipeline declarado es `translation`, y la model card del modelo base no se incluye en los datos disponibles. La innovación técnica destacable de esta publicación es la preservación selectiva de precisión en el router y el sesgo de selección, que evita el colapso de expertos típico en cuantizaciones agresivas de modelos MoE.

## Capacidades

- Traducción automática entre 102 idiomas, con instrucciones de formato que restringen la salida al texto traducido.
- Traducción bidireccional verificada en las direcciones en-zh, zh-en, en-ko, ko-en, en-ja y ja-en mediante chrF++ sobre WMT24++.
- Soporte de contextos largos: hasta 256K tokens en configuraciones de memoria alta, útil para documentos completos.
- Capacidad multilingüe amplia: incluye lenguas de bajos recursos como ceb, war, yue, bo, ug, sd, ckb, entre otras.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- El modelo está especializado en traducción; no se presentan capacidades de razonamiento general, código o matemáticas.

## Casos de uso

- Traducción de documentación técnica en producción: el modelo puede procesar documentos completos de hasta 256K tokens en un Mac Studio de 96 GB o más, traduciendo manuales y referencias de API sin fragmentar el contexto.
- Localización de software en 102 idiomas: con una sola pasada y una instrucción de formato estricta, se integra en pipelines de localización que necesitan salida limpia sin explicaciones adicionales.
- Traducción de atención al cliente multilingüe: permite traducir conversaciones multi-turno entre idiomas europeos y asiáticos (es, ca, gl, eu, en, zh, ja, ko) con contexto largo para mantener coherencia terminológica.
- Traducción de literatura y prensa de bajos recursos: cubre lenguas como ceb, war, yue o bo, donde los modelos comerciales suelen tener cobertura limitada.
- Procesamiento por lotes en estaciones de trabajo Apple: con 31,96 GB de pesos, un Mac Studio M5 Max de 64 GB puede ejecutar inferencia local sin GPU dedicada, útil para equipos que no pueden enviar datos a la nube.
- Evaluación y auditoría de traducciones: la fidelidad KL respecto a BF16 (0,0357 en WikiText-2) permite usar la versión cuantizada como referencia reproducible en estudios de calidad de traducción.
- Investigación en cuantización de MoE: la preservación del router en bfloat16 y el sesgo en float32 sirven como caso de estudio para técnicas de cuantización selectiva.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (KL frente a BF16, chrF++ medio de seis direcciones sobre 1.200 segmentos de WMT24++, y respuestas a siete preguntas cortas en modo greedy):

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | chrF++ | Respuestas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 31,96 GB | 0,035655 | 95,794% | 0,022650 | 96,863% | 0,066562 | 95,235% | 43,91 | 7/7 |
| BF16 | 60,13 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | 43,80 | 7/7 |

chrF++ por dirección:

| Cuantizacion | en-zh | zh-en | en-ko | ko-en | en-ja | ja-en |
|---|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 36,33 | 52,40 | 36,91 | 53,97 | 34,37 | 49,50 |
| BF16 | 35,93 | 52,45 | 36,60 | 53,99 | 34,35 | 49,47 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 31,96 GB de pesos en 8 bits; se recomienda al menos 64 GB de memoria unificada para contexto moderado.
- GPU recomendadas: Apple Silicon con memoria unificada; el autor documenta Mac Studio M5 Max (40-core GPU, 64 GB), Mac Studio M5 Ultra (96 GB, 256 GB y 512 GB con GPU de 80 núcleos).
- Cabe en GPU de consumo: no se documenta soporte para GPU NVIDIA o AMD en esta versión MLX; el formato es específico de Apple Silicon.
- Opciones de despliegue: `mlx-lm==0.32.2` con `--trust-remote-code`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta versión.
- Contexto según hardware: 139K tokens en Mac Studio M5 Max de 64 GB; 256K en configuraciones de 96 GB o más.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---:|---:|---|---|---|
| Xylolabs/Hy-MT3-30B-A3B-MLX-8bit | 30B | 3B | 256K | Apache 2.0 | MLX safetensors 8-bit | Cuantizado para Apple Silicon; chrF++ 43,91 |
| tencent/Hy-MT3-30B-A3B (BF16) | 30B | 3B | no disponible | Apache 2.0 | safetensors BF16 | Modelo base; 60,13 GB; chrF++ 43,80 |
| Q8_0 de llama.cpp (referencia del autor) | 30B | 3B | no disponible | Apache 2.0 | GGUF Q8_0 | KL 0,0368 / 0,0266 / 0,0774 en los tres textos |

No se dispone de datos de otros modelos de traducción comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en traducción; no debe usarse como modelo conversacional general ni para razonamiento, código o matemáticas.
- Riesgo de alucinación en traducción de textos ambiguos o con terminología muy específica; no se documentan mitigaciones.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La cuantización introduce divergencia respecto a BF16 (KL de 0,0357 en WikiText-2, 0,0666 en texto held-out); aceptable para traducción, pero a considerar en tareas de alta fidelidad.
- Requiere `--trust-remote-code` y el archivo `hy_v3.py` del repositorio, lo que implica ejecutar código del autor.
- Solo compatible con `mlx-lm` en Apple Silicon; no hay soporte documentado para CUDA, ROCm ni CPU genérica.
- El contexto máximo real depende de la memoria disponible: 139K en 64 GB frente a 256K en 96 GB o más.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse `LICENSE.txt` y `NOTICE`; `hy_v3.py` es MIT.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Hy-MT3-30B-A3B-MLX-8bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Repositorio de cuantización de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- MLX: https://github.com/ml-explore/mlx
- `mlx-lm`: https://github.com/ml-explore/mlx-lm
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.

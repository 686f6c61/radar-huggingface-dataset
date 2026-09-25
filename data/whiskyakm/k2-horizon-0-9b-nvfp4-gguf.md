# WhiskyAKM/K2-Horizon-0.9B-NVFP4-GGUF

## Resumen

K2-Horizon-0.9B-NVFP4-GGUF es una conversion a formato GGUF con cuantizacion NVFP4 del modelo IFM/K2-Horizon-0.9B, publicada por el usuario WhiskyAKM. El modelo original es el miembro compacto y denso de la familia K2-Horizon de IFM, un decoder-only de clase 0.9B con 1.078.285.824 parametros almacenados (incluidas embeddings) y una ventana de contexto de 131.072 tokens. Esta ficha cubre especificamente el artefacto cuantizado, pensado para su uso con llama.cpp y motores compatibles con GGUF.

La relevancia de esta publicacion es de tipo practico: el modelo original se distribuye en safetensors, mientras que esta version NVFP4 (formato de coma flotante de 4 bits de NVIDIA) reduce el peso del repositorio a unos 0.6 GB y permite ejecutar un modelo de razonamiento con contexto de 128K en hardware muy modesto, incluidas GPUs Blackwell y equipos consumer. Se trata de un modelo entrenado mediante destilacion multi-profesor para matematicas, codigo, STEM y seguimiento de instrucciones.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 25 de septiembre de 2026, por lo que se trata de un artefacto reciente y sin validacion comunitaria amplia. La licencia declarada es Apache 2.0, heredada del modelo base, y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2-Horizon-0.9B, transformer decoder-only denso |
| Parametros totales | 1.078.285.824 (incluye embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (128K), con escalado YaRN RoPE |
| Tipos de cuantizacion | NVFP4 (4 bits, coma flotante, orientado a NVIDIA Blackwell) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama-cpp); el modelo base en safetensors |
| Modalidades | Texto |
| Tamano del repositorio | 0.6 GB |
| Modelo base | IFM/K2-Horizon-0.9B |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de tipo denso, no MoE, de aproximadamente 0.9B parametros de clase y 1.08B parametros almacenados contando embeddings. Soporta una ventana de contexto de 131.072 tokens mediante escalado YaRN de RoPE, lo que permite mantener coherencia en conversaciones y documentos muy largos sin necesidad de reentrenamiento adicional. La model card del artefacto cuantizado no detalla el numero de capas, dimensiones ocultas ni configuracion de atencion (si usa GQA o atencion completa), por lo que esos datos se consideran no disponibles.

En cuanto al entrenamiento, la informacion disponible indica que se utilizo destilacion multi-profesor con profesores especializados por dominio: matematicas y codigo, STEM y seguimiento de instrucciones. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. La cuantizacion NVFP4 es la innovacion tecnica propia de este repositorio: un formato de 4 bits en coma flotante optimizado para el hardware NVIDIA Blackwell, que reduce el peso del modelo a aproximadamente 0.6 GB manteniendo el pipeline de llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento matematico: el modelo base reporta resultados en AIME 2025, AIME 2026 y HMMT Feb 2026.
- Razonamiento cientifico evaluado en GPQA Diamond.
- Generacion de codigo, con resultados reportados en HumanEval+, MBPP+ y LiveCodeBench v6.
- Uso de herramientas y agentes: evaluado en BFCL v4 (Berkeley Function Calling Leaderboard).
- Seguimiento de instrucciones, reforzado mediante destilacion con un profesor especifico de instruction following.
- Contexto largo de hasta 131.072 tokens, adecuado para documentos extensos o historiales de conversacion prolongados.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente conversacional local en ingles: con 0.6 GB de pesos, el modelo cabe en cualquier portatil y puede ejecutarse sobre CPU mediante llama.cpp, lo que lo hace adecuado para asistentes de escritorio sin conexion.
- Generacion de codigo en entornos con recursos limitados: sus resultados en HumanEval+ (79.9%) y MBPP+ (68.0%) lo situan por encima de alternativas de tamano similar, por lo que es viable como autocompletado o generador de funciones en IDE con GPU modesta.
- Analisis de documentos largos: la ventana de 128K tokens permite procesar informes, contratos o articulos extensos en una sola pasada sin troceado ni resumen intermedio.
- Agente con function calling en flujos automatizados: el soporte evaluado en BFCL v4 permite integrarlo en pipelines que necesiten invocar APIs o herramientas externas de forma estructurada.
- Tutoria y resolucion de problemas matematicos: los resultados en AIME 2025 (41.7%) lo hacen util como apoyo educativo para problemas de nivel competitivo, siempre con verificacion humana.
- Prototipado rapido de aplicaciones LLM: al ejecutarse con llama-server en modo API compatible con OpenAI, sirve como sustituto de bajo coste durante el desarrollo antes de migrar a modelos mayores.
- Investigacion en cuantizacion: este repositorio es un caso de estudio util para medir la perdida de calidad de NVFP4 frente a los pesos originales en safetensors en tareas de razonamiento y codigo.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la tabla incluida en la model card del repositorio, que a su vez los atribuye a la descripcion original del modelo K2-Horizon-0.9B. No se han verificado de forma independiente. Las columnas comparativas usan los nombres tal y como aparecen en dicha tabla.

| Benchmark | K2-Horizon-0.9B | Qwen3.5-0.8B | OpenBMB-1B | Qwen3.5-2B |
|---|---|---|---|---|
| AIME 2025 | 41.7 | 1.0 | 40.4 | 34.2 |
| AIME 2026 | 48.5 | 0.2 | 40.4 | 38.8 |
| HMMT Feb 2026 | 25.8 | 0.6 | 23.3 | 22.7 |
| GPQA Diamond | 27.3 | 11.9 | 26.3 | 54.9 |
| HumanEval+ | 79.9 | 16.5 | 65.2 | 75.6 |
| MBPP+ | 68.0 | 35.4 | 60.6 | 67.7 |
| LiveCodeBench v6 | 37.4 | 6.6 | 33.5 | 29.8 |
| BFCL v4 | 28.0 | 25.3 | 25.2 | 43.6 |

Todos los valores estan expresados en porcentaje. No se han publicado resultados especificos de la version cuantizada a NVFP4, por lo que la degradacion respecto a los pesos originales es no disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.6-1.0 GB solo para los pesos en NVFP4; con la cache KV para 128K tokens de contexto, el consumo crece de forma notable y depende de la configuracion de atencion (no disponible en detalle).
- GPU recomendadas: hardware NVIDIA Blackwell es el objetivo declarado de NVFP4; el modelo base tiene receta publicada en vLLM Recipes, lo que sugiere compatibilidad con A100, H100 y similares para la version sin cuantizar.
- GPU consumer: cabe sin problema en cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, 4060, 4090, etc.), e incluso puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (CLI y llama-server con API compatible con OpenAI), y de forma indirecta cualquier runtime GGUF. La receta oficial de vLLM corresponde al modelo base, no a este GGUF.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 0.9B en 4 bits, cabe esperar una latencia baja en hardware moderno, pero no hay mediciones publicadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntos fuertes (segun tabla del autor) | Licencia |
|---|---|---|---|---|
| K2-Horizon-0.9B (esta version, NVFP4 GGUF) | 1.08B | 131.072 | AIME 2025/2026, HumanEval+, MBPP+, LiveCodeBench v6 | Apache 2.0 |
| Qwen3.5-0.8B | ~0.8B | No disponible | BFCL v4 ligeramente superior en agentes | No disponible en la informacion |
| OpenBMB-1B | ~1B | No disponible | Competitivo en matematicas y codigo | No disponible en la informacion |
| Qwen3.5-2B | ~2B | No disponible | GPQA Diamond (54.9) y BFCL v4 (43.6) superiores | No disponible en la informacion |

El modelo destaca en matematicas y codigo para su tamano, mientras que en razonamiento cientifico (GPQA Diamond) queda claramente por debajo de Qwen3.5-2B, que ademas es mas del doble de grande. En uso de herramientas, BFCL v4 lo situa por detras de Qwen3.5-2B y solo ligeramente por encima de las alternativas de 0.8B-1B.

## Limitaciones y advertencias

- Idiomas: solo se declara ingles. El rendimiento en castellano no esta evaluado y previsiblemente sera inferior.
- Alucinacion: no hay datos publicados sobre tasas de alucinacion; en un modelo de 0.9B el riesgo es estructuralmente alto en tareas de conocimiento factual.
- Razonamiento cientifico limitado: GPQA Diamond de 27.3% indica una capacidad modesta en preguntas cientificas de nivel experto.
- Agentes: un 28.0% en BFCL v4 implica una fiabilidad baja para function calling en produccion sin validacion adicional.
- Cuantizacion: los benchmarks mostrados corresponden al modelo base, no a esta version NVFP4. La degradacion real introducida por la cuantizacion de 4 bits no esta medida ni documentada.
- NVFP4 es un formato de reciente introduccion; el soporte completo depende de la version de llama.cpp y del hardware. En GPUs no Blackwell puede requerir de-cuantizacion en software con la consiguiente penalizacion de velocidad.
- Validacion comunitaria nula: 0 descargas y 0 likes, y conversion realizada por un tercero no vinculado a IFM. No hay garantia de fidelidad respecto a los pesos originales.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de licencia y citar tanto el modelo base como la conversion.
- Fecha de creacion posterior al conocimiento de referencia del redactor; los datos de benchmarks proceden exclusivamente de la documentacion del autor y no han sido verificados de forma independiente.
- El nombre "Qwen3.5" aparece tal cual en la model card del autor y no se ha podido contrastar su existencia o nomenclatura exacta.

## Enlaces

- Repositorio de la conversion NVFP4 GGUF: https://huggingface.co/WhiskyAKM/K2-Horizon-0.9B-NVFP4-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- Coleccion K2 Horizon de IFM: https://huggingface.co/collections/IFM/k2-horizon
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/IFM/K2-Horizon-0.9B
- Ficha en Benchgen (modelo): https://benchgen.com/models/ifm/k2-horizon-0-9b
- Ficha en Benchgen (archivos): https://benchgen.com/models/ifm/k2-horizon-0-9b/files
- Blog de presentacion de K2 Horizon (citado en la model card): https://ifm.ai/blog/k2/
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Texto de la licencia Apache 2.0: https://apache.org/licenses/LICENSE-2.0

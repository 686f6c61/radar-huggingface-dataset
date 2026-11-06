# unsloth/Mistral-Large-4-1T-A52B-NVFP4

## Resumen

Mistral Large 4 - Le Chonk es el modelo de mayor tamaño y capacidad publicado hasta la fecha por Mistral AI: un modelo multimodal nativo de tipo Mixture-of-Experts con aproximadamente 1 billón (1T) de parámetros totales y 49 mil millones de parámetros activos por token (52B incluyendo embeddings y capas de salida). Fue entrenado desde cero sobre 3.800 GPU NVIDIA Grace Blackwell en los centros de datos propios de Mistral en Europa. La ficha de este repositorio corresponde a la versión cuantizada en NVFP4 publicada por Unsloth, un checkpoint dirigido a GPU Blackwell con menor huella de memoria, inferencia más rápida y el mismo rendimiento que el original.

El modelo unifica seguimiento de instrucciones, razonamiento, generación de código y flujos agénticos en un único conjunto de pesos, con soporte nativo de entrada de imagen y texto (salida de texto), ventana de contexto de 1 millón de tokens y fluidez declarada en más de 160 idiomas, incluidas todas las lenguas oficiales de la Unión Europea. Muestra un rendimiento especialmente destacado en ciberseguridad, finanzas y derecho, y supera a modelos cerrados de frontera en visual grounding.

Su relevancia actual radica en que es uno de los pocos modelos abiertos de escala trillonaria disponibles con pesos abiertos bajo una licencia permisiva (MIT modificada), con despliegue tanto en la API de Mistral (`mistral-large-4`) como en infraestructura propia mediante vLLM, SGLang, llama.cpp o la aplicación Unsloth Desktop.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts granular, multimodal nativo (texto + imagen) |
| Parametros totales | ~1T (1 billón) |
| Parametros activos | ~49B por token (~52B incluyendo embeddings y capas de salida); 128 expertos enrutados (4 activos por token) + 1 experto compartido |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | NVFP4 (este repo); GGUF de Unsloth desde 1-bit (233 GB) hasta Q8 (~1,1 TB) |
| Idiomas soportados | 160+ idiomas declarados (el repo lista 39: en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, sk, sl) |
| Licencia | Mistral Ecosystem Open-Weight License (MIT modificada; uso comercial y no comercial permitido, MaaS requiere licencia aparte) |
| Formato de pesos | safetensors (NVFP4, compatible con transformers, vLLM y SGLang); también disponible en GGUF en el repo hermano de Unsloth |

## Arquitectura y entrenamiento

Mistral Large 4 emplea una arquitectura Mixture-of-Experts granular con 128 expertos enrutados de los cuales 4 se activan por token, más 1 experto compartido. Esto permite ~1T de parámetros totales con solo ~49-52B activos por token, reduciendo drásticamente el coste de inferencia frente a un modelo denso equivalente. Es multimodal nativo: incorpora un codificador de visión estilo Pixtral entrenado para manejar tamaños de imagen y relaciones de aspecto variables, aceptando entrada de texto e imagen con salida de texto.

Fue entrenado desde cero sobre 3.800 GPU NVIDIA Grace Blackwell en los datacenters propios de Mistral en Europa. El número de tokens de entrenamiento y la composición exacta del dataset no están disponibles en la información proporcionada. Como innovaciones destacables, el modelo ofrece un modo de razonamiento con tres niveles de esfuerzo configurables por petición (`low`, `medium`, `high`) y soporta decodificación especulativa mediante el draft DSpark incluido en los GGUF de Unsloth (longitud media de aceptación de ~2,5, aproximadamente 2x de velocidad de decodificación a batch 1).

## Capacidades

- Generacion de texto e instruccion: seguimiento robusto de instrucciones con fuerte adherencia a system prompts.
- Razonamiento configurable: tres niveles de esfuerzo (`low`, `medium`, `high`, siendo `high` el valor por defecto) ajustables por petición.
- Codigo y matematicas: rendimiento de frontera en tareas de programación y razonamiento general (detalles cuantitativos no disponibles).
- Vision: análisis de imágenes, gráficos, planos técnicos y documentos; estado del arte en visual grounding entre modelos de pesos abiertos.
- Agentic: function calling nativo, salida JSON y cumplimiento estricto de esquemas JSON; diseñado para flujos agénticos multi-paso.
- Multilingüe: fluidez nativa en más de 160 idiomas, incluidas todas las lenguas oficiales de la UE.
- Ciberseguridad: estado del arte entre modelos de pesos abiertos en tareas de seguridad, rechazando peticiones maliciosas.
- Contexto largo: ventana de 1M de tokens para documentos extensos y sesiones prolongadas.

## Casos de uso

- Analisis y procesamiento de documentos extensos: con 1M de tokens de contexto, puede ingerir expedientes legales completos, contratos o bases de código enteras en una sola peticion sin fragmentacion ni RAG obligatorio.
- Asistentes agenticos con herramientas: el function calling nativo con esquemas JSON estrictos permite integrarlo en frameworks de agentes (LangChain, vLLM tool parsing) para orquestar APIs, bases de datos y flujos multi-paso.
- Analisis de documentos visuales: gracias al codificador de vision estilo Pixtral, puede extraer datos de graficos, planos tecnicos y documentos escaneados, con el mejor visual grounding entre modelos abiertos.
- Ciberseguridad ofensiva y defensiva legitima: estado del arte entre pesos abiertos en tareas de seguridad (analisis de vulnerabilidades, revision de configuraciones), rechazando peticiones maliciosas.
- Atencion al cliente multilingue: fluidez nativa en 160+ idiomas permite desplegar un unico modelo para soporte multi-turno en toda la UE sin modelos por idioma.
- Generacion de codigo en produccion: combinando razonamiento alto, salida JSON estructurada y contexto largo, se integra en pipelines de revision y generacion de codigo.
- Dominios regulados (finanzas y derecho): rendimiento especialmente destacado en estos sectores, util para resumen de normativa, analisis de informes financieros y apoyo a revision juridica.
- Chat de baja latencia: el nivel de razonamiento `low` permite respuestas rapidas en conversacionales, mientras `high` cubre tareas complejas con el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma cualitativamente que supera a modelos cerrados de frontera en visual grounding y alcanza estado del arte entre pesos abiertos en ciberseguridad, pero no incluye tablas numericas comparativas.

## Requisitos de hardware

- Version NVFP4 (este repo): tamano del repositorio de 610,1 GB; dirigida a GPU NVIDIA Blackwell (B200/H100-class Blackwell), con soporte de vLLM y SGLang. VRAM exacta por GPU no disponible; un despliegue tipico requeriria multiples B200 (192 GB) u H200 en tensor parallelism.
- Version GGUF de Unsloth (repo hermano): el checkpoint de 1-bit ocupa 233 GB y cabe en un dispositivo con 256 GB de RAM; 2-bit (302-378 GB) en 384-512 GB; Q8 (~1,1 TB) en sistemas con 1,2 TB o mas de memoria.
- No cabe en GPUs de consumo (RTX 4090, RTX 5090) en ninguna variante; la via local realista es CPU/RAM con llama.cpp o la app Unsloth Desktop.
- Despliegue: vLLM y SGLang (NVFP4 en Blackwell), llama.cpp con el build especifico de Unsloth (GGUF, con mmproj para vision y draft DSpark para decodificacion especulativa), Unsloth Desktop, o la API de Mistral (`mistral-large-4`).
- Rendimiento: la decodificacion especulativa DSpark duplica aproximadamente la velocidad de decodificacion a batch 1 (longitud media de aceptacion ~2,5). Otras metricas de latencia/throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Mistral Large 4 (1T-A52B) | ~1T | ~49-52B | 1M | Si (texto + imagen) | Mistral Ecosystem Open-Weight (MIT modificada) |
| DeepSeek-V3 | ~671B | ~37B | 128K | No | MIT |
| Llama 3.1 405B (denso) | 405B | 405B | 128K | No | Llama Community License |
| Qwen3-235B-A22B | ~235B | ~22B | 128K+ | No | Apache 2.0 |

Mistral Large 4 destaca por su escala total (1T), su ventana de contexto de 1M tokens y su multimodalidad nativa, aunque exige infraestructura mucho mayor que las alternativas. Los datos de rendimiento comparativos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Requisitos de hardware extremos: incluso cuantizado a 4 bits ocupa 610 GB; el despliegue local viable requiere servidores con cientos de GB de RAM o multiples GPU Blackwell, fuera del alcance de hardware de consumo.
- Licencia con restricciones: aunque permite uso comercial y no comercial, operar el modelo como servicio (Model-as-a-Service) requiere una licencia comercial separada con Mistral AI.
- Riesgo de alucinacion: no documentado especificamente en la informacion proporcionada; como todo LLM de gran escala, las salidas deben verificarse en aplicaciones criticas (especialmente en los dominios de derecho y finanzas donde se promociona).
- Sesgos conocidos: no disponibles en la documentacion proporcionada.
- Vision unidireccional: acepta imagen y texto como entrada, pero solo genera texto (sin salida de imagen o audio).
- La version NVFP4 requiere GPU Blackwell; en hardware anterior (A100, H100, RTX) habra que recurrir a los GGUF de Unsloth u otras cuantizaciones, con coste de memoria muy superior.
- La model card esta truncada en la seccion de system prompts recomendados; conviene consultar la guia completa de Unsloth y la documentacion de Mistral antes de desplegar en produccion.

## Enlaces

- Repositorio Hugging Face (NVFP4, Unsloth): https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-NVFP4
- Modelo base (Mistral AI): https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Checkpoint NVFP4 oficial de Mistral: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Licencia: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE
- Blog de Mistral: https://mistral.ai/news/mistral-large-4-oss/
- API de Mistral: https://docs.mistral.ai/models/mistral-large-4-0
- Guia de Unsloth para ejecutar el modelo: https://unsloth.ai/docs/models/mistral-large-4
- GGUF de Unsloth (referenciado en assets): https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-GGUF
- Unsloth Dynamic 3.0 GGUFs (benchmarks de cuantizacion): https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Unsloth Desktop: https://unsloth.ai/docs/desktop
- GitHub de Unsloth: https://github.com/unslothai/unsloth
- Unsloth (web): https://unsloth.ai/
- Unsloth en PyPI: https://pypi.org/project/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth

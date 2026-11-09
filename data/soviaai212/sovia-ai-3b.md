# soviaai212/SOVIA-AI-3B

## Resumen

SOVIA AI 3B es un modelo de lenguaje de 3.085.938.688 parámetros desarrollado por soviaai212 como un ajuste fino mediante LoRA sobre Qwen2.5-3B-Instruct. Su objetivo declarado es ofrecer un asistente conversacional en bahasa indonesio que funcione enteramente en CPU, sin necesidad de GPU, para el público general de Indonesia. Se distribuye como un único archivo GGUF cuantizado en Q4_K_M de aproximadamente 1,8 GB, lo que lo hace ejecutable en portátiles y equipos de oficina modestos.

El modelo combina el conocimiento general y la capacidad de function calling heredados de Qwen2.5-3B-Instruct con un entrenamiento específico en cultura indonesia (gastronomía, danzas, casas tradicionales, música, textiles, ceremonias, héroes nacionales y las 38 provincias), conversación cotidiana en bahasa indonesio y ejemplos de uso de herramientas. Está pensado como el modelo abierto del ecosistema Sovia AI, que incluye Chat AI, Sovia Bisnis y Sovia Studio.

La relevancia actual del modelo reside en su propuesta de accesibilidad: un LLM de 3B parámetros cuantizado a 4 bits que corre en CPU con llama.cpp, Ollama, LM Studio o Jan, sin CUDA ni ROCm, y con licencia Apache 2.0. Es un caso de ajuste cultural y de despliegue local de bajo coste más que una propuesta de rendimiento puntero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, base Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens; la model card no lo confirma para este ajuste) |
| Tipos de cuantizacion | GGUF Q4_K_M (4 bits, K-quant de precisión mixta); el adaptador LoRA se distribuye en safetensors |
| Idiomas soportados | indonesio (id), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `sovia-3b-q4_k_m.gguf`, ~1,8 GB); adaptador LoRA en safetensors (~115 MB) |

## Arquitectura y entrenamiento

SOVIA AI 3B es un ajuste fino mediante LoRA (Low-Rank Adaptation) sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3.085.938.688 parámetros. El adaptador se entrenó con rango 16 y alpha 32 sobre el modelo base congelado, lo que preserva las capacidades generales del base (incluido el function calling nativo) y produce un adaptador compacto de unos 115 MB que puede fusionarse con el base para exportar a GGUF. No se trata de un entrenamiento completo ni de un modelo MoE.

La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. Sí indica que el ajuste se centró en conocimiento cultural indonesio (gastronomía como rendang, gudeg, papeda, pempek, soto y rawon; danzas como Saman, Kecak, Pendet, Jaipong, Piring y Tor-Tor; casas tradicionales como Gadang, Joglo, Tongkonan, Honai y Betang; música como gamelan, angklung, sasando y kolintang; textiles como batik, songket, ulos y kebaya; ceremonias como Ngaben, Rambu Solo, Sekaten y Tabuik; héroes nacionales y las 38 provincias), en conversación cotidiana en bahasa indonesio con jerga común, en conocimiento general sobre Indonesia (Pancasila, Bhinneka Tunggal Ika, Indonesia Raya, 17 de agosto de 1945, rupia, traslado de capital a Nusantara) y en ejemplos explícitos de tool calling (por ejemplo `get_weather`, `search_info`, `calculate`, `set_reminder`). La innovación técnica destacable es la elección deliberada de cuantización Q4_K_M para habilitar inferencia en CPU: el modelo original en FP16 ocupa ~6,2 GB y el archivo GGUF ~1,8 GB.

## Capacidades

- Generación de texto conversacional en bahasa indonesio e inglés, con registro cotidiano y jerga indonesia.
- Conocimiento cultural específico de Indonesia: gastronomía, danzas, casas tradicionales, música, textiles, ceremonias, héroes nacionales, wayang kulit y Reog.
- Conocimiento geográfico y cívico: las 38 provincias con sus capitales, Pancasila, Bhinneka Tunggal Ika, Indonesia Raya y el traslado de capital a Nusantara.
- Tool calling y function calling nativos (heredados de Qwen2.5-3B-Instruct) y reforzados con ejemplos de entrenamiento; puede emitir llamadas estructuradas en lugar de responder de memoria.
- Uso como cerebro de agentes: la model card lo posiciona como proveedor de modelo para frameworks de agentes (menciona Hermes Agent) a través de cualquier servidor compatible con la API de OpenAI.
- Identidad de modelo configurable mediante system prompt (`Kamu adalah Sovia AI...`).
- Ejecución local sin conexión a internet en tiempo de inferencia.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistencia educativa local sin GPU: estudiantes y profesores pueden ejecutar el modelo en un portátil con CPU de 4 núcleos para consultar cultura, historia y geografía de Indonesia, sin coste de API ni conexión.
- Chatbot de atención al cliente en bahasa indonesio: con function calling puede invocar herramientas como `search_info` o `set_reminder` para resolver consultas multi-turno en pequeños negocios, integrándose vía API compatible con OpenAI.
- Agente de automatización de tareas: actuar como planificador que decide cuándo llamar a `get_weather`, `calculate` o `search_info` en pipelines de agentes (por ejemplo Hermes Agent), emitiendo llamadas estructuradas en lugar de alucinar respuestas.
- Despliegue en硬件 de bajo coste: oficinas con PC antiguos o Raspberry Pi de 64 bits pueden servir el GGUF Q4_K_M con llama.cpp u Ollama para tareas internas de generación de texto.
- Preservación y difusión cultural: aplicación divulgativa que explique danzas, casas tradicionales, textiles y ceremonias de las 38 provincias, aprovechando el entrenamiento cultural específico.
- Prototipado rápido de productos de IA en Indonesia: startups y creadores pueden validar ideas de asistentes conversacionales con un modelo Apache 2.0 sin depender de infraestructura cloud.
- Integración en Sovia Bisnis: la model card lo describe como el modelo abierto detrás del chatbot de web y WhatsApp del ecosistema Sovia AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB; el modelo está diseñado para inferencia en CPU y RAM. El archivo Q4_K_M ocupa ~1,8 GB, por lo que se recomienda al menos 2-4 GB de RAM libre para el modelo más el overhead del runtime.
- CPU mínima indicada en la model card: 64 bits, 4 núcleos (por ejemplo Intel Core i3 de 8.ª generación); el texto de la model card se corta en ese punto, por lo que el resto de la tabla de requisitos no está disponible.
- GPU: no requiere CUDA ni ROCm; no se documentan requisitos ni rendimiento en GPU (A100, H100, RTX 4090, etc.).
- Cabe en cualquier equipo consumer con CPU moderna y RAM suficiente; no se especifican modelos de GPU compatibles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, GPT4All y cualquier runtime GGUF; también puede usarse el adaptador LoRA en Transformers/PEFT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SOVIA AI 3B | 3.085.938.688 | no disponible | Apache 2.0 | GGUF Q4_K_M + LoRA safetensors | Ajuste cultural indonesio, orientado a CPU |
| Qwen2.5-3B-Instruct | 3B (aproximado) | 32.768 tokens (según el modelo base) | Apache 2.0 | safetensors, GGUF | Modelo base; capacidades generales y function calling |
| No disponible | — | — | — | — | No se dispone de datos de otros ajustes indonesios comparables en la información proporcionada |

La comparación cuantitativa de rendimiento con alternativas no está disponible; la model card no publica benchmarks ni comparaciones con otros modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un ajuste sobre Qwen2.5-3B-Instruct, hereda los sesgos del modelo base, no evaluados aquí.
- Riesgo de alucinación: no se reportan evaluaciones de fidelidad; el modelo puede inventar datos culturales o geográficos, y la model card recomienda usar tool calling para evitar respuestas inventadas.
- Limitaciones de contexto e idioma: solo se declaran indonesio e inglés; el contexto máximo no se confirma para este ajuste (el base soporta 32.768 tokens). El rendimiento en otros idiomas, incluido el español, no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben mantenerse los avisos de licencia y atribución correspondientes.
- Caveats de producción: el modelo está pensado para CPU y cuantización Q4_K_M; la pérdida de calidad frente a FP16 no está cuantificada. El adaptador LoRA (rango 16, alpha 32) puede no preservar todas las capacidades del base. La model card está incompleta (se corta en la tabla de requisitos mínimos) y no incluye datos de entrenamiento ni evaluación. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soviaai212/SOVIA-AI-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Ecosistema Sovia AI: https://sovia-ai.my.id
- llama.cpp: https://github.com/ggerganov/llama.cpp

# ViorikaAI-org/CalmaCatLM-2.1-mini

## Resumen

CalmaCatLM-2.1-mini es un modelo de lenguaje pequeño (134 millones de parámetros) desarrollado por ViorikaAI, una organización que publica modelos conversacionales en ruso. Está basado en la arquitectura Llama y ha sido ajustado específicamente para mantener diálogos en ruso, empleando una combinación de datasets conversacionales como saiga_scored, ru_turbo_alpaca y las partes en ruso de OpenAssistant (oasst1 y oasst2). El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas.

Su relevancia radica en su tamaño reducido: con solo 134M de parámetros, puede ejecutarse en hardware modesto, incluso en CPU o GPUs de gama baja, lo que lo convierte en una opción atractiva para prototipos, aplicaciones educativas o entornos con recursos limitados. El contexto soportado es de 4046 tokens, suficiente para conversaciones de varias vueltas, aunque no para documentos largos. El modelo se publicó en agosto de 2026 y cuenta con una versión cuantizada en GGUF para facilitar su despliegue con herramientas como llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (sin especificar version) |
| Parametros totales | 134.105.856 (134M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4046 tokens |
| Tipos de cuantizacion | no disponible (existe version GGUF) |
| Idiomas soportados | ruso |
| Licencia | MIT |
| Formato de pesos | safetensors (y GGUF en repo separado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer basada en Llama, con 134 millones de parámetros. No se especifica la variante exacta de Llama (si es Llama 1, Llama 2 u otra), pero al ser un modelo tan pequeño, probablemente se trate de una configuración reducida o un fine-tuning de un modelo base compacto. El entrenamiento se realizó sobre datasets conversacionales en ruso: saiga_scored, ru_turbo_alpaca y las porciones en ruso de OpenAssistant (oasst1 y oasst2). Se aplicaron 3 épocas con una tasa de aprendizaje de 5e-4, alcanzando una pérdida media de 2.3. El entrenamiento se llevó a cabo en una única GPU NVIDIA GeForce RTX 5060 Ti de 16GB, lo que indica que el proceso es viable en hardware de consumo. No se menciona el uso de técnicas como RLHF o DPO; el ajuste parece ser de tipo supervisado sobre datos de instrucción y diálogo.

## Capacidades

- Generacion de texto conversacional en ruso: el modelo está optimizado para mantener diálogos multi-turno, respondiendo a preguntas y siguiendo instrucciones en ruso.
- Comprension de contexto limitado: con 4046 tokens de ventana, puede manejar conversaciones de varias vueltas sin perder el hilo, aunque no es adecuado para documentos extensos.
- Generacion de texto general: más allá del diálogo, puede producir texto coherente en ruso para tareas simples como resúmenes, redacción de correos o respuestas a consultas.
- No se han documentado capacidades de tool calling, function calling, agentes o razonamiento multi-paso. Tampoco hay soporte para visión o audio.
- Multilingüismo: exclusivamente ruso; no se ha entrenado para otros idiomas.

## Casos de uso

- Chatbot de atencion al cliente en ruso: el modelo puede gestionar conversaciones de soporte básico, respondiendo a preguntas frecuentes y derivando consultas complejas a un humano. Su tamaño reducido permite desplegarlo en servidores modestos o incluso en edge.
- Asistente virtual personal en ruso: integrable en aplicaciones de mensajeria o asistentes de voz (con un modulo de TTS/STT) para tareas como recordatorios, busquedas simples o conversacion casual.
- Generacion de contenido en ruso: redaccion de borradores de articulos, correos electronicos o publicaciones en redes sociales, siempre que el texto no requiera un razonamiento profundo.
- Prototipado rapido de aplicaciones de NLP: al ser ligero y con licencia MIT, es ideal para probar flujos conversacionales en ruso antes de escalar a modelos mas grandes.
- Educacion y aprendizaje: puede usarse en entornos docentes para practicar conversacion en ruso o como ejemplo de fine-tuning de modelos pequeños.
- Despliegue en hardware limitado: por su tamano, cabe en una Raspberry Pi 5 o en un portatil sin GPU, permitiendo aplicaciones offline de generacion de texto en ruso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de HuggingFace muestra una lista de resultados vacia, y no hay datos de evaluaciones como MMLU, HumanEval o GSM8K. Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada: al tener 134M de parametros, en FP32 ocupa aproximadamente 0.5 GB. Con cuantizacion GGUF (por ejemplo, Q4_K_M) el peso se reduce a unos 0.1-0.2 GB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluso integradas (Intel Iris Xe, AMD Radeon integrada). Una RTX 5060 Ti (la usada para entrenar) es mas que suficiente para inferencia.
- Compatibilidad con consumer GPU: si, absolutamente. Tambien puede ejecutarse en CPU con llama.cpp u Ollama, con latencias de pocos milisegundos por token.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, text-generation-inference (TGI) y transformers de HuggingFace. La version GGUF facilita el uso con llama.cpp y Ollama.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por el tamano del modelo, en una GPU moderna se pueden esperar cientos de tokens por segundo; en CPU, decenas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en el mismo rango de parametros (134M) y especializados en ruso. Existen modelos como Saiga (de IlyaGusev) en versiones de 7B o 13B, pero son mucho mas grandes. Otros modelos pequenos en ruso, como ruGPT-3.5 (de Sber), tienen arquitecturas y tamanos diferentes. Por tanto, no es posible establecer una comparativa fiable con los datos disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datasets como OpenAssistant y saiga_scored, el modelo puede reflejar sesgos presentes en esos datos, aunque no se han documentado evaluaciones especificas.
- Riesgo de alucinacion: al ser un modelo de solo 134M, es propenso a generar respuestas incorrectas o inventadas, especialmente en temas factuales o de razonamiento complejo.
- Limitaciones de contexto: la ventana de 4046 tokens es corta; no puede procesar documentos largos ni mantener conversaciones muy extensas sin perder informacion.
- Idioma: exclusivamente ruso; no es util para otros idiomas.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo no ofrece garantias de calidad o seguridad.
- Caveat para produccion: no se recomienda su uso en sistemas criticos o donde se requiera alta precision. Es adecuado para prototipos o tareas de baja exigencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ViorikaAI-org/CalmaCatLM-2.1-mini
- Version GGUF: https://huggingface.co/ViorikaAI-org/CalmaCatLM-2.1-mini-GGUF
- Discord del autor: https://discord.gg/8JwTv8zj8d , https://discord.gg/7JE7maH6cf
- Telegram del autor: https://t.me/viorika_official

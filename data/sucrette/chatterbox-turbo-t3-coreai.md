# sucrette/chatterbox-turbo-t3-coreai

## Resumen

Chatterbox Turbo T3 Core AI es la conversión del modelo de tokens de habla T3 (text-to-speech-token) de Resemble AI, parte del sistema Chatterbox Turbo, al formato Core AI de Apple (`.aimodel`, macOS 27). El autor, sucrette, publica dos grafos de forma fija en fp16 que comparten una cache K/V propiedad del invocador: un grafo de prefill que consume la condicionamiento de voz y el texto en una sola llamada, y un grafo de decode que se ejecuta una vez por cada token de habla generado. No es un modelo de síntesis de voz completo, sino el componente generador de tokens de habla que después se envía a otro componente (chatterbox-s3gen-coreai) para producir el audio.

T3 es un decodificador de estilo GPT-2 con 24 capas, anchura 1024 y 16 cabezales de atención, con un vocabulario de 6563 tokens de habla. La entrada de texto se limita a 80 tokens del tokenizador BPE inglés de Chatterbox, y el condicionamiento de voz ocupa 376 filas (proyección del hablante más embeddings de habla del prompt). La conversión está pensada para el proyecto Asa (`AsaTTS.T3Engine`) y se ejecuta sobre la GPU de Core AI en Mac con Apple silicon.

Su relevancia actual radica en que demuestra la ruta de despliegue de un sistema TTS de calidad en hardware de Apple de forma nativa y en formato on-device, con una latencia de decodificación de 11,9 ms por token (mediana) tras la exportación. Al publicarse bajo licencia MIT heredada de Chatterbox, es utilizable en productos comerciales, aunque es un componente especializado que requiere el resto de la cadena (codificador de voz y vocoder) para funcionar de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador tipo GPT-2 (transformer denso), 24 capas, ancho 1024, 16 cabezales |
| Parametros totales | no disponible (dimensiones publicadas: 24 capas, 1024 de ancho, 16 cabezales, vocab 6563) |
| Longitud de contexto | 80 tokens de texto de entrada; cache K/V de 1024 posiciones (prefill escribe posiciones 0-456) |
| Tipos de cuantizacion | fp16 (grafos exportados en fp16; no se aplica cuantizacion adicional de pesos) |
| Idiomas soportados | Ingles (tokenizador BPE ingles de Chatterbox); no se declaran otros idiomas |
| Licencia | MIT |
| Formato de pesos | `.aimodel` (Apple Core AI, dos grafos fp16); pesos origen en safetensors (`t3_turbo_v1.safetensors`) |

## Arquitectura y entrenamiento

El modelo es la exportación del componente T3 de Chatterbox Turbo, un transformador denso de estilo GPT-2 (no es MoE ni SSM) con 24 capas, anchura de 1024 y 16 cabezales de atención. La conversión produce dos grafos de forma fija que comparten un mismo estado de cache K/V propiedad del invocador, formado por 24 pares `k0, v0 ... k23, v23` de forma fp16 `[1024, 16, 64]`. El grafo de prefill consume la condicionamiento de voz (`cond` fp16 `[1, 376, 1024]`), los ids de texto (`ids` int32 `[1, 81]`), una máscara de selección (`sel` fp16 `[1, 81, 1]`) y el índice del token START, y devuelve logits fp16 `[1, 6563]`. El grafo de decode consume un token y su posición (`token`, `pos` int32 `[1]`) y devuelve logits de la misma dimensión, escribiendo y atendiendo a posiciones sucesivas de la cache.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO, ya que la model card solo describe la conversión de formato, no el entrenamiento del modelo base. El padding se sitúa después de los tokens de texto reales, de modo que la atención causal no lo alcanza, y la decodificación sobrescribe las entradas obsoletas de la cache. El muestreo se realiza en el host, no dentro de los grafos. La conversión se generó con las herramientas de Asa (`tools/export_t3_decode.py` y `tools/export_t3_prefill.py`) usando coreai-core 1.0.0b3, coreai-torch 0.4.3 y torch 2.13.0, leyendo los pesos desde Hugging Face en safetensors.

## Capacidades

- Generación de tokens de habla (speech tokens) a partir de texto y condicionamiento de voz, base del pipeline TTS de Chatterbox Turbo.
- Conversión de texto a tokens de habla con tokenizador BPE inglés, con una ventana de hasta 80 tokens de texto.
- Condicionamiento de voz por hablante: la entrada de 376 filas combina proyección del hablante y embeddings de habla del prompt.
- Decodificación autoregresiva token a token con cache K/V reutilizable entre prefill y decode.
- Integración en el ecosistema Core AI de Apple para ejecución on-device en la GPU de Mac con Apple silicon.
- No soporta tool calling ni function calling: es un componente TTS, no un modelo de propósito general.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No incluye visión, audio de entrada ni modo de razonamiento (thinking mode).

## Casos de uso

- Síntesis de voz on-device en aplicaciones de macOS: el componente T3 genera los tokens de habla que luego se convierten en audio mediante el vocoder, funcionando íntegramente en la GPU de Core AI sin depender de servidores externos.
- Lectores de pantalla y accesibilidad en Mac: al ser un modelo local con latencia de decodificación de 11,9 ms por token, permite narrar texto en tiempo casi real sin enviar contenido a la nube.
- Asistentes conversacionales locales: combinado con un LLM on-device, puede dar respuesta hablada dentro de una misma máquina, preservando la privacidad de la conversación.
- Generación de voces para audiolibros o podcasts: con condicionamiento de voz por hablante, permite mantener una voz consistente a lo largo de fragmentos de texto de hasta 80 tokens por llamada.
- Pruebas de integración de pipelines TTS en Apple silicon: sirve para validar la ruta de exportación (Asa, `tools/t3_parity.py`) comparando los tokens contra la implementación PyTorch original.
- Prototipado de interfaces de voz en entornos sin acceso a GPU NVIDIA: al ejecutarse en Mac con Core AI, es una alternativa para desarrolladores que trabajan exclusivamente en el ecosistema Apple.
- Investigación sobre compartición de cache K/V y grafos de forma fija: el diseño con prefill y decode separados es un ejemplo reproducible de optimización para inferencia por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento proporcionado es la latencia de decodificación: mediana de 11,9 ms por token en Apple silicon Mac, macOS 27, GPU de Core AI, con coreai-core 1.0.0b3. No se aportan cifras de MMLU, HumanEval, GSM8K ni de métricas TTS como MOS, ya que no son aplicables a este componente.

## Requisitos de hardware

- Plataforma objetivo: Apple silicon Mac con macOS 27 y soporte de Core AI; no es ejecutable en GPU NVIDIA ni AMD mediante este formato.
- VRAM/unified memory: el repositorio ocupa 1.4 GB; la cache K/V añade 24 pares fp16 de forma `[1024, 16, 64]`, gestionados por el invocador.
- GPU recomendadas: GPU integrada de los chips Apple silicon (M-series); no se especifica un modelo concreto ni una cantidad mínima de memoria unificada.
- No aplica a GPU de consumo tipo RTX 4090 ni a aceleradores A100/H100, dado que el formato `.aimodel` es específico de Core AI.
- Opciones de despliegue: Core AI (`.aimodel`) a través del proyecto Asa (`AsaTTS.T3Engine`); no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje o a formatos GGUF.
- Latencia: decodificación con mediana de 11,9 ms por token; no se publica throughput agregado ni latencia de extremo a extremo en cifras.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| sucrette/chatterbox-turbo-t3-coreai | `.aimodel` fp16 (Core AI) | no disponible | 80 tokens de texto; cache de 1024 posiciones | MIT | Apple silicon, macOS 27 |
| ResembleAI/chatterbox-turbo (modelo base) | safetensors (PyTorch) | no disponible | no disponible | MIT | Multiplataforma (PyTorch) |
| sucrette/chatterbox-s3gen-coreai | `.aimodel` (Core AI) | no disponible | no aplica | MIT | Apple silicon, macOS 27 |
| sucrette/chatterbox-voice-encoders-coreai | `.aimodel` (Core AI) | no disponible | no aplica | MIT | Apple silicon, macOS 27 |

No se dispone de datos de otros sistemas TTS comparables (por ejemplo, Kokoro, XTTS o Piper) en la información proporcionada, por lo que no se incluyen cifras de rendimiento comparado.

## Limitaciones y advertencias

- Es un componente parcial del sistema Chatterbox Turbo: sin el codificador de voz y el vocoder (chatterbox-s3gen-coreai) no produce audio.
- Solo procesa texto en inglés; no se declaran capacidades multilingües.
- Ventana de texto limitada a 80 tokens por llamada de prefill, lo que obliga a trocear textos largos.
- Dependencia estricta de Apple silicon y macOS 27; no hay ruta de despliegue en CUDA ni en CPU genérica con este formato.
- El muestreo se ejecuta en el host, de modo que la calidad final depende de la implementación externa del muestreo.
- Riesgo de artefactos o tokens de habla incorrectos inherente a la generación autoregresiva de tokens de voz; la model card no documenta evaluación de calidad de audio.
- Sesgos conocidos: no se documentan en la información disponible; al derivar de un modelo entrenado con datos no especificados, pueden persistir sesgos de voz y de idioma.
- Licencia MIT: permite uso comercial, pero se hereda la atribución de copyright de Resemble AI (2025).
- El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, por lo que no existe validación de la comunidad sobre su comportamiento en producción.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/sucrette/chatterbox-turbo-t3-coreai
- Modelo base Chatterbox Turbo: https://huggingface.co/ResembleAI/chatterbox-turbo
- Componente vocoder (s3gen): https://huggingface.co/sucrette/chatterbox-s3gen-coreai
- Codificadores de voz: https://huggingface.co/sucrette/chatterbox-voice-encoders-coreai
- Repositorio Asa: https://github.com/ayasena/Asa

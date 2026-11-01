# xangel82/Qwen3.8-Flash-Next-NVFP4-Athena-Logos-GGUF

## Resumen

Qwen3.8-Flash-Next-NVFP4-Athena-Logos-GGUF es una cuantización de cuatro bits de los pesos oficiales de Qwen3.8-Flash-Next (de Qwen), publicada por el usuario xangel82 y diseñada específicamente para los tensor cores del chip NVIDIA GB10, presente en equipos de sobremesa como el DGX Spark o el ASUS Ascent GX10. El repositorio forma parte del ecosistema Athena: Athena's Engine, un motor de inferencia escrito para el GB10, y Athena Logos, un asistente local que garantiza que los prompts, documentos y código no salgan de la máquina del usuario.

El modelo original es un LLM conversacional de gran tamaño con 176.943.973.249 parámetros, arquitectura MoE (expertos enrutados), soporte de visión mediante un encoder separado y un cabezal MTP para decodificación especulativa. La cuantización NVFP4 aplica bloques de 16 valores con escala E4M3 optimizada mediante una matriz de importancia obtenida de unos 800.000 tokens de calibración, mientras que las proyecciones densas usan MXFP8 (bloques de 32).

Su relevancia actual radica en que permite ejecutar un modelo de clase frontera con contexto completo de 262.144 tokens en una sola máquina de escritorio, con velocidades de prefill superiores a las de una cuantización IQ4_XS equivalente. Es la variante que Athena's Engine ejecuta por defecto desde su versión 1.0.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos enrutados, tabla n-gram por capa, cabezal MTP y encoder de visión |
| Parametros totales | 176.943.973.249 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (expertos y tabla n-gram), MXFP8 (proyecciones densas), BF16/F32 (resto); cabezal MTP en Q8_0 y vision en F16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (otra, con enlace a LICENSE-Qwen) |
| Formato de pesos | GGUF (formatos de tensor propios de Athena's Engine; incompatible con llama.cpp y otros lectores GGUF) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, es un transformer con expertos enrutados (MoE). La cuantización publicada conserva la arquitectura original pero redistribuye la precisión: los expertos enrutados y la tabla n-gram por capa se almacenan en NVFP4, un formato de 4 bits con bloques de 16 valores y escala E4M3, donde cada escala se elige buscando exhaustivamente entre todos los valores E4M3 el que minimiza el error ponderado por una matriz de importancia. Esta matriz se recopiló durante la servida de unos 800.000 tokens de prompts de calibración que incluían prosa en varios idiomas, código, documentos largos, razonamiento y sesiones de agentes con llamadas a herramientas.

Las proyecciones densas usan MXFP8 (bloques de 32 valores) y el resto de tensores se mantienen en BF16 y F32, igual que en el original. El repositorio incluye además el cabezal MTP (multi-token prediction) en Q8_0 para decodificación especulativa y el encoder de visión en F16. Sobre el entrenamiento del modelo base (tokens, datasets, RLHF/DPO) no se ha publicado información en el material disponible.

Una peculiaridad técnica relevante: la tabla n-gram de 28,8 GB se mantiene en disco y el motor lee solo las filas que cada token necesita, liberando memoria para el resto del sistema; puede fijarse en memoria residente con `ATHENA_ROW_TABLE=resident` con diferencias de velocidad de pocos puntos porcentuales.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto completo de 262.144 tokens.
- Comprension de imagenes mediante el encoder de vision incluido (`mmproj-F16.gguf`).
- Tool calling / function calling: el motor expone APIs compatibles con OpenAI y Anthropic, con streaming y llamadas a herramientas.
- Soporte de agentes y sesiones multi-paso: los datos de calibracion incluyen explicitamente sesiones de agentes con sus llamadas a herramientas.
- Decodificacion especulativa mediante el cabezal MTP incluido en el repositorio.
- Capacidades multilingues: los prompts de calibracion incluyen prosa en varios idiomas, aunque la lista oficial de idiomas no esta disponible.
- Integracion en el ecosistema Athena: voz, transcripcion, busqueda multimodal y video con sonido en la misma maquina y de forma simultanea.

## Casos de uso

- Asistente local privado: con Athena Logos, el modelo responde preguntas sobre miles de documentos del usuario citando la pagina exacta de la que proviene la respuesta, sin que los datos salgan de la maquina; adecuado para despachos con requisitos de confidencialidad.
- Generacion y revision de codigo en local: los datos de calibracion incluyen codigo y sesiones de agentes con tool calls, y las APIs compatibles con OpenAI/Anthropic permiten integrarlo en pipelines y editores existentes.
- Agentes autonomos multi-paso: la calibracion con sesiones de agentes y el soporte de tool calls lo hacen apto para flujos de trabajo donde agentes ejecutan tareas y reportan resultados.
- Analisis de documentos largos: la ventana de 262.144 tokens permite procesar contratos, informes o bases de codigo completas en una sola pasada.
- Comprension multimodal en escritorio: el encoder de vision permite leer imagenes dentro de la conversacion, util para revisar capturas, diagramas o documentos escaneados.
- Investigacion y educacion en hardware de sobremesa: la licencia permite uso personal, investigativo y educativo, y el modelo cabe en un solo GB10 sin necesidad de datacenter.
- Atencion al cliente o prototipado conversacional en pequenas empresas: la licencia cubre a desarrolladores y pequenas companias en uso laboral, con streaming y tool calls listos para integrar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor publica datos de rendimiento en un DGX Spark (GB10) con Athena's Engine, contexto completo de 262.144 tokens y MTP activado, comparando con el mismo modelo en IQ4_XS:

| Metrica | Este modelo (NVFP4) | IQ4_XS |
|---|---|---|
| Prefill, prompt de 8k tokens | 1.762 tokens/s | 1.277 tokens/s |

## Requisitos de hardware

- VRAM/memoria estimada: el archivo GGUF completo pesa 104 GB (107,7 GB el repositorio), mas la tabla n-gram de 28,8 GB que puede permanecer en disco. Disenado para caber en un solo NVIDIA GB10 (DGX Spark o ASUS Ascent GX10).
- GPU recomendadas: NVIDIA GB10 exclusivamente; los formatos de tensor NVFP4 y MXFP8 son especificos de los kernels del motor para GB10.
- Consumer GPUs: no compatible; no cabe ni funciona en tarjetas de consumo (RTX 4090, etc.) por formato y por tamano.
- Despliegue: unicamente Athena's Engine 1.0.5 o posterior (Docker: `ghcr.io/xangel82/athena-engine:1.0.5`). llama.cpp y otros lectores GGUF no pueden cargar estos tipos de tensor. Ollama, vLLM y TGI no estan soportados.
- Latencia y throughput: prefill de 1.762 tokens/s con prompt de 8k en un DGX Spark; no hay datos de velocidad de decodificacion publicados.

## Comparativa con modelos similares

| Caracteristica | Qwen3.8-Flash-Next NVFP4 (Athena Logos) | Qwen3.8-Flash-Next IQ4_XS (mismo motor) | Qwen/Qwen3.8-Flash-Next (original) |
|---|---|---|---|
| Parametros | 176,94 B | 176,94 B | 176,94 B |
| Formato | GGUF (NVFP4/MXFP8, tensores propios) | GGUF (IQ4_XS estandar) | safetensors |
| Tamano aprox. | 104 GB | no disponible | no disponible |
| Prefill (8k, GB10) | 1.762 tokens/s | 1.277 tokens/s | no disponible |
| Compatibilidad | Solo Athena's Engine | Athena's Engine (IQ4_XS) | motores estandar |
| Licencia | qwen-community-1.0 | no disponible | no disponible |

No hay disponibles comparativas con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad muy restringida: los tipos de tensor NVFP4 y MXFP8 son definiciones propias de Athena's Engine; llama.cpp, LM Studio, Ollama y cualquier otro lector GGUF no pueden cargar estos archivos.
- Hardware exclusivo: requiere un chip NVIDIA GB10 (DGX Spark o ASUS Ascent GX10); no funciona en GPUs de consumo ni en datacenter convencional.
- Licencia qwen-community-1.0: segun la model card, el ecosistema es gratuito para uso personal, investigacion, educacion, y desarrolladores y pequenas companias en el trabajo; conviene revisar el texto de la licencia para otros usos comerciales.
- Riesgo de alucinacion: al ser un LLM generativo, puede producir respuestas incorrectas; el asistente Athena Logos mitiga esto citando la pagina de origen en documentos, pero no lo elimina.
- Sesgos e idiomas: no hay informacion publicada sobre sesgos conocidos ni sobre la lista oficial de idiomas soportados.
- Dependencia de una revision concreta: la cuantizacion se hizo desde `Qwen/Qwen3.8-Flash-Next` en la revision `de4b8e4d43b917e7706784d8bb445c9af86a3540`; futuras actualizaciones del modelo base requeriran una nueva cuantizacion.
- Datos de rendimiento limitados: solo se publica prefill; no hay mediciones de tokens/s en decodificacion ni de calidad frente al modelo BF16 original.

## Enlaces

- Repositorio del modelo: https://huggingface.co/xangel82/Qwen3.8-Flash-Next-NVFP4-Athena-Logos-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/xangel82/Qwen3.8-Flash-Next-NVFP4-Athena-Logos-GGUF/blob/main/LICENSE-Qwen
- Athena (pagina principal): https://palaferri.com/athena
- Athena's Engine (GitHub): https://github.com/xangel82/Athena-Engine
- Athena Logos (GitHub): https://github.com/xangel82/Athena-Logos
- Ultima release de Athena Logos: https://github.com/xangel82/Athena-Logos/releases/latest

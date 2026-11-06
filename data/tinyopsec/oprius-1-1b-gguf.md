# tinyopsec/Oprius-1.1B-GGUF

## Resumen

Oprius-1.1B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo Oprius-1.1B, publicado por el usuario tinyopsec en Hugging Face. El modelo base es TinyLlama/TinyLlama-1.1B-Chat-v1.0, un modelo conversacional de 1.100.048.384 parámetros (1,1 B) basado en la arquitectura LLaMA, que ha sido afinado (fine-tuning) para conversación casual en el derivado `zzzekryo/Oprius-1.1B`. Las cuantizaciones se han producido con llama.cpp y abarcan desde precisión completa F16 (2,2 GB) hasta Q2_K de 2 bits.

Su relevancia radica en el tamaño extremadamente reducido: al ser un modelo de 1,1 B parámetros con cuantizaciones agresivas, puede ejecutarse en hardware muy modesto, incluso en portátiles sin GPU dedicada, lo que lo hace útil para prototipado, pruebas locales de pipelines de chat y entornos con recursos limitados. Es importante señalar que el propio autor marca el modelo como descontinuado ("deprecated") al estar entrenado con un dataset antiguo, por lo que recomienda evaluarlo antes de cualquier uso.

No se dispone de información publicada sobre longitud de contexto, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (basada en TinyLlama-1.1B-Chat-v1.0) |
| Parametros totales | 1.100.048.384 (≈1,1 B) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo deriva de TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only con arquitectura tipo LLaMA de 1,1 B parámetros. Sobre esa base, `zzzekryo/Oprius-1.1B` aplicó un fine-tuning orientado a conversación casual; no se ha publicado información sobre el método de ajuste (SFT, DPO, RLHF), el número de tokens del dataset ni su composición.

El repositorio de tinyopsec no aporta innovaciones técnicas propias: su valor está en la conversión a GGUF mediante llama.cpp, lo que permite inferencia eficiente en CPU y GPU de consumo con 13 niveles de cuantización distintos, desde F16 hasta Q2_K.

## Capacidades

- Generación de texto conversacional, con especialización en chat casual heredada del fine-tuning sobre TinyLlama-1.1B-Chat-v1.0.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible.
- Pipeline de text-generation estándar, usable con las librerías habituales de Hugging Face.
- No se ha documentado soporte de tool calling, capacidades de agentes, visión, audio ni modo de razonamiento extendido.
- No se ha documentado el alcance multilingüe; al derivar de TinyLlama, es razonable asumir predominio del inglés, aunque no consta oficialmente.

## Casos de uso

- Chatbot casual en local: ejecución de un asistente conversacional ligero en un portátil sin GPU, con la variante Q4_K_M recomendada por el autor.
- Prototipado de pipelines de chat: integración rápida en aplicaciones de prueba para validar flujos de conversación antes de escalar a modelos mayores.
- Pruebas de infraestructura de inferencia: benchmark de runtimes (llama.cpp, Ollama, koboldcpp) con carga mínima gracias a sus ~0,6-0,7 GB en Q4_K_M.
- Educación y experimentación: estudio de los efectos de la cuantización comparando las 13 variantes disponibles (F16 a Q2_K) en calidad y velocidad.
- Sistemas embebidos o de bajos recursos: despliegue en dispositivos con RAM limitada donde modelos mayores no caben.
- Generación sintética de datos conversacionales de baja exigencia: producción de texto casual en volumen donde la calidad de razonamiento no es crítica.
- Fallback offline: asistente básico en entornos sin conectividad, previa evaluación de calidad por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo F16 ocupa 2,2 GB; las variantes cuantizadas son proporcionalmente menores (Q8_0 ≈ 1,2 GB, Q4_K_M ≈ 0,7 GB, Q2_K ≈ 0,5 GB, aproximaciones típicas para un modelo de 1,1 B; el repo completo pesa 10,6 GB).
- GPU recomendadas: no requiere GPU; cualquier GPU moderna con 2 GB de VRAM o más ejecuta la variante F16 con holgura. No se necesitan A100 ni H100.
- Consumer GPU: cabe sobradamente en prácticamente cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso funciona con solo CPU y 4 GB de RAM en cuantizaciones de 4 bits o inferiores.
- Despliegue: llama.cpp (comando `llama-cli` documentado en la model card), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible; por su tamaño (1,1 B parámetros) se espera inferencia muy rápida incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Oprius-1.1B-GGUF | 1,1 B | GGUF (13 cuantizaciones) | Apache 2.0 | Fine-tuning conversacional casual; marcado como deprecated por su autor |
| TinyLlama-1.1B-Chat-v1.0 | 1,1 B | safetensors / GGUF de terceros | Apache 2.0 | Modelo base original, mejor documentado y con comunidad activa |
| Qwen2.5-1.5B-Instruct | 1,5 B | safetensors / GGUF | Apache 2.0 (algunas variantes) | Mayor capacidad general, multilingüe, tool calling |
| Llama-3.2-1B-Instruct | 1,2 B | safetensors / GGUF | Llama 3.2 Community License | Multilingüe oficialmente, mejor rendimiento en benchmarks publicados |

Para uso productivo, las alternativas TinyLlama-Chat, Qwen2.5-1.5B-Instruct y Llama-3.2-1B-Instruct ofrecen mejor documentación y rendimiento; Oprius-1.1B se justifica principalmente por curiosidad o por su ligereza extrema.

## Limitaciones y advertencias

- El propio autor declara el modelo como deprecated (dataset antiguo) y recomienda evaluarlo antes de usarlo: es el aviso más importante de la ficha.
- No hay benchmarks publicados, por lo que su calidad respecto al modelo base TinyLlama-1.1B-Chat-v1.0 es desconocida; el fine-tuning conversacional casual podría haber degradado capacidades generales.
- Riesgo de alucinación elevado, típico de modelos de ~1 B parámetros; no apto para tareas que exijan factualidad sin verificación.
- Alcance de idiomas no documentado; probablemente orientado al inglés por su linaje TinyLlama.
- Longitud de contexto no especificada; heredará la del modelo base TinyLlama (2.048 tokens según la documentación original), pero no consta en este repo.
- Sin documentación de tool calling ni agentes: no apto para flujos agénticos.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.
- Popularidad muy baja (279 descargas, 0 likes en el momento de la ficha), lo que implica escaso testeo comunitario y sin soporte aparente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/Oprius-1.1B-GGUF
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Modelo intermedio del que derivan las cuantizaciones: https://huggingface.co/zzzekryo/Oprius-1.1B
- llama.cpp (runtime de conversión e inferencia): https://github.com/ggerganov/llama.cpp

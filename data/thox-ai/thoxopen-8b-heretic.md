# Thox-ai/ThoxOpen-8B-Heretic

## Resumen

ThoxOpen-8B-Heretic es una versión modificada de Qwen/Qwen3-8B publicada por Thox-ai (THOX.ai) en la que se ha aplicado una "abliteración" —una técnica de edición de pesos que suprime la dirección de activación asociada a las respuestas de rechazo— mediante la herramienta Heretic. El resultado es un modelo de 8.190.735.360 parámetros (8B denso) con un sesgo deliberado hacia el "minimal refusal": el modelo tiende a no declinar peticiones que el modelo base rechazaría por política de seguridad. No se ha reentrenado: los pesos son los de Qwen3-8B modificados in situ.

La relevancia del modelo es doble. Por un lado, es un ejemplo documentado de abliteración reproducible: el repositorio incluye la configuración exacta de Heretic (`heretic_config.toml`), los hashes SHA-256 de cada shard y los registros de evaluación. Por otro, se distribuye con un enfoque "local-first" explícito, con conversiones GGUF (Q4_K_M, Q5_K_M, Q8_0) generadas con llama.cpp y pensadas para ejecutarse en portátiles. La licencia es Apache 2.0, heredada del modelo base.

La ficha debe leerse con cautela: el modelo hereda la arquitectura y el conocimiento de Qwen3-8B, pero la abliteración degrada alineamiento y seguridad. Los datos de benchmarks propios del autor no están incluidos en la información disponible; solo se mencionan registros de evaluación internos sin cifras públicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | safetensors (BF16/FP16 original), GGUF Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (`en` según model card y tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards), GGUF (3 variantes) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: parte de los pesos de Qwen/Qwen3-8B, un transformer denso de 8B parámetros, y aplica sobre ellos una edición de pesos mediante Heretic, herramienta de abliteración que identifica y sustrae la dirección de rechazo en el espacio de activaciones. El repositorio incluye `heretic_config.toml` con la configuración exacta del proceso, lo que permite reproducibilidad. No hay datos públicos sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO propias: todo el conocimiento proviene del modelo base.

La innovación técnica destacable no es arquitectónica sino metodológica: la publicación incluye hashes verificables de cada shard safetensors (16.381.516.776 bytes en total), los registros de conversión a GGUF (`build/conversion/results.json`) con el commit exacto de llama.cpp (`dde879bc4f954b809892fd0d660515f42536394a`) y las puertas de validación por cuantización (`run-q8-20261102/host_gate.json`). Esto convierte al modelo en un caso de estudio de cadena de custodia en modelos abliterados.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen3-8B.
- Razonamiento y matemáticas de nivel 8B (capacidad del modelo base, no medida en esta build).
- Generación de código (capacidad del modelo base).
- Respuestas con rechazo mínimo: el modelo evita declinar peticiones que el base rechazaría, por diseño.
- Compatibilidad con endpoints (`endpoints_compatible` en tags) y despliegue local vía Ollama y llama.cpp.
- Soporte de cuantizaciones GGUF listas para usar en hardware de consumo.
- Capacidades multilingües limitadas: la model card declara solo inglés.
- No se declara soporte explícito de tool calling, function calling, agentes o modo thinking en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y abliteración: el repositorio permite reproducir el proceso con `heretic_config.toml` y comparar comportamiento frente a Qwen3-8B original, útil para estudiar cómo la edición de pesos afecta a la tasa de rechazo.
- Despliegue local en portátil: la variante Q4_K_M (5.027.783.680 bytes) cabe en GPUs de consumo con 8 GB de VRAM y permite ejecutar el modelo con llama.cpp u Ollama sin conexión.
- Generación creativa sin filtros editoriales: escritura de ficción, guiones o contenido narrativo donde el modelo base aplicaría rechazos, con la advertencia de revisión humana obligatoria.
- Prototipado rápido de asistentes conversacionales en inglés: el modelo responde en un único idioma y con contexto limitado, adecuado para demos locales antes de escalar a un modelo mayor.
- Evaluación comparativa de cuantizaciones: al publicar Q4_K_M, Q5_K_M y Q8_0 con hashes, sirve para medir degradación de calidad por cuantización en un mismo checkpoint.
- Docencia y formación técnica: ejemplo práctico de cadena de custodia de pesos, hashes y registros de conversión en un repositorio público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona `eval_log.txt`, `capability_log.txt` y `results.json`, y una "puerta" de validación por cuantización (`host_gate.json`), pero las cifras concretas no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB en BF16/FP16 (safetensors original), ~8,7 GB en Q8_0, ~5,9 GB en Q5_K_M, ~5,0 GB en Q4_K_M.
- GPU recomendadas: A100 40 GB o H100 para safetensors en precisión completa; RTX 4090 (24 GB) para Q8_0 con holgura; RTX 3060/4060 (8-12 GB) para Q4_K_M.
- Cabe en GPU de consumo: sí, en Q4_K_M y Q5_K_M con 6-8 GB de VRAM; Q8_0 requiere 10-12 GB.
- Opciones de despliegue: llama.cpp (versión con commit `dde879bc4f954b809892fd0d660515f42536394a` o posterior), Ollama (tag `ollama`), Transformers con `subfolder="model"`, y servidores compatibles con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| ThoxOpen-8B-Heretic | 8,19B | No disponible | Apache 2.0 | en | Abliterado, GGUF incluidos |
| Qwen/Qwen3-8B (base) | ~8B | No disponible | Apache 2.0 | multilingüe | Modelo original con alineamiento estándar |
| Otras builds abliteradas de Qwen3-8B | ~8B | No disponible | Apache 2.0 | en | No se dispone de datos comparativos verificados |

La comparación cuantitativa con alternativas no está disponible: no se han publicado cifras de benchmarks en la información proporcionada.

## Limitaciones y advertencias

- La abliteración degrada el alineamiento de seguridad: el modelo puede producir contenido que el Qwen3-8B original rechazaría. No es apto para aplicaciones orientadas al usuario sin filtros adicionales.
- Riesgo elevado de alucinación, especialmente en dominios técnicos y factuales, al no haberse reentrenado ni evaluado con benchmarks publicados.
- Solo soporta inglés según la model card; el rendimiento en castellano no está validado.
- Contexto máximo no documentado en la información disponible; no asumir la ventana de Qwen3-8B sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre idoneidad ni sobre cumplimiento normativo en sectores regulados.
- La model card incluye notas editoriales del fundador y de la CAO que no constituyen especificaciones técnicas; deben tratarse como material promocional.
- No se declara soporte de tool calling ni de agentes; verificar antes de integrar en pipelines automatizados.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOpen-8B-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado en la información proporcionada enlaces a papers, blogs o demos adicionales.

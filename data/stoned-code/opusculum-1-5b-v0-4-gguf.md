# Stoned-Code/Opusculum-1.5B-V0.4-GGUF

## Resumen

Opusculum-1.5B-V0.4-GGUF es la distribucion en formato GGUF del modelo Opusculum-1.5B-V0.4, publicada por el usuario Stoned-Code en Hugging Face. Se trata de un modelo conversacional de aproximadamente 1.540 millones de parametros (1.543.714.304 exactos segun los pesos en safetensors) construido sobre la arquitectura Qwen2, segun las etiquetas del repositorio. La conversion a GGUF se ha realizado con las herramientas de Unsloth, lo que lo hace directamente ejecutable en llama.cpp y en cualquier runtime compatible con este formato.

El modelo se distribuye unicamente con un fichero cuantizado en Q4_K_M (`checkpoint-750.Q4_K_M.gguf`), lo que sugiere que se trata de un checkpoint intermedio de un proceso de entrenamiento o ajuste fino (el sufijo 750 apunta al paso 750). El repositorio ocupa 1,0 GB y no registra descargas ni interacciones en el momento de la consulta.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeno, de licencia no declarada, orientado a conversacion y ejecutable en hardware de consumo. Resulta util para experimentacion local con llama.cpp, pero la ausencia de model card detallada, benchmarks, licencia e idiomas declarados limita seriamente su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (según tags del repo) |
| Parametros totales | 1.543.714.304 (aprox. 1,5B) |
| Parametros activos | no disponible (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (origen safetensors, conversion via Unsloth) |

## Arquitectura y entrenamiento

La unica informacion tecnica disponible indica que el modelo se basa en la arquitectura Qwen2, una familia de transformers decoder-only con atencion causal, RoPE y normalizacion RMSNorm, ampliamente utilizada en modelos de tamano pequeno y mediano. El modelo tiene 1.543.714.304 parametros, lo que lo situa en la categoria de 1,5B.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o SFT, ni sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modos de razonamiento, etc.). El nombre del fichero (`checkpoint-750`) sugiere que se trata de un checkpoint intermedio de un proceso de ajuste fino, pero no se puede confirmar el pipeline completo ni la receta de entrenamiento. La conversion a GGUF se realizo con Unsloth, herramienta que habitualmente aplica optimizaciones de cuantizacion estandar sobre pesos en safetensors.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el ejemplo de uso con `llama-cli --jinja` indican soporte de plantillas de chat tipo Jinja para interaccion multi-turno.
- Ejecucion local en llama.cpp: compatible con `llama-cli` y con el ecosistema llama-cpp, incluyendo endpoints compatibles (tag `endpoints_compatible`).
- Compatibilidad multimodal potencial: la model card menciona `llama-mtmd-cli` para modelos multimodales, aunque no se confirma que este modelo concreto tenga vision; probablemente sea una instruccion generica de la plantilla de Unsloth.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o multilingue: no disponible (no declaradas en la informacion proporcionada).

## Casos de uso

- Experimentacion local con llama.cpp: el modelo puede cargarse con `llama-cli -hf Stoned-Code/Opusculum-1.5B-V0.4-GGUF --jinja` en un portatil o estacion de trabajo, lo que permite probar plantillas de chat y comportamiento conversacional sin infraestructura dedicada.
- Prototipado rapido de asistentes conversacionales: al ser un modelo de 1,5B en Q4_K_M (aproximadamente 1 GB), cabe en GPUs de consumo y permite iterar sobre prompts y plantillas Jinja antes de migrar a un modelo mayor.
- Pruebas de integracion en pipelines llama-cpp: util para validar endpoints compatibles y flujos de despliegue en entornos que ya usan llama.cpp como backend.
- Evaluacion comparativa de checkpoints intermedios: al tratarse presumiblemente de un checkpoint de paso 750, puede servir para estudiar la evolucion del entrenamiento frente a versiones finales del mismo proyecto.
- Generacion de texto de baja latencia en CPU: con cuantizacion Q4_K_M y 1,5B de parametros, es viable en CPU para tareas de generacion corta donde no se requiere maxima calidad.
- Educacion y divulgacion: modelo pequeno y ligero adecuado para demostrar el funcionamiento de la cuantizacion GGUF y del ecosistema llama.cpp en talleres o cursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB con cuantizacion Q4_K_M (el fichero GGUF ocupa parte del repositorio de 1,0 GB); con overhead de contexto, se recomienda reservar 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo y funcionaran sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (mediante importacion del GGUF), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Opusculum-1.5B-V0.4-GGUF | 1,5B | no disponible | no disponible | GGUF (Q4_K_M) | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Hugging Face, Ollama |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens (segun Meta) | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, Ollama |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens (segun Hugging Face) | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se basa en datos publicos de los modelos alternativos; para Opusculum no se dispone de contexto, licencia ni benchmarks declarados, lo que dificulta una comparacion rigurosa. En la practica, los tres alternativos ofrecen licencias claras y documentacion completa, ventajas decisivas frente a un repositorio sin model card detallada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; en produccion esto es un bloqueante hasta aclararlo con el autor.
- Idiomas no declarados: no se puede garantizar calidad en castellano ni en otros idiomas.
- Ausencia de benchmarks: no hay evidencia publica de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas estandar.
- Posible checkpoint intermedio: el nombre `checkpoint-750` sugiere que no es una version final, con el riesgo de calidad inferior a la esperada.
- Riesgo de alucinacion: inherente a modelos de 1,5B sin fases de alineacion documentadas; no apto para tareas de alta precision sin verificacion.
- Contexto desconocido: no se puede planificar su uso en conversaciones largas o documentos extensos.
- Unico fichero cuantizado: solo se publica Q4_K_M, lo que limita el ajuste fino entre calidad y memoria (no hay Q8_0, Q5_K_M ni F16).
- Sin soporte comunitario: cero descargas y cero likes en el momento de la consulta implican ausencia de validacion externa.
- Model card minima: la informacion disponible no permite auditar el proceso de entrenamiento ni los datos utilizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Stoned-Code/Opusculum-1.5B-V0.4-GGUF
- Unsloth (herramienta de conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime): https://github.com/ggml-org/llama.cpp

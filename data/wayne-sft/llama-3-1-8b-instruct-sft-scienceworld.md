# wayne-SFT/Llama-3.1-8B-Instruct-SFT-ScienceWorld

## Resumen

Llama-3.1-8B-Instruct-SFT-ScienceWorld es un ajuste fino supervisado (SFT) de parámetros completos sobre `meta-llama/Llama-3.1-8B-Instruct`, publicado por el usuario wayne-SFT. El modelo no es un asistente conversacional de propósito general, sino un checkpoint de arranque para aprendizaje por refuerzo (RL) en el entorno ScienceWorld, un benchmark de razonamiento científico interactivo basado en texto donde un agente debe ejecutar acciones sobre un mundo simulado para resolver objetivos experimentales.

El ajuste se ha realizado exclusivamente sobre trayectorias expertas recopiladas por el autor en los objetivos de entrenamiento de ScienceWorld (conjunto interno `sw_sft_v3_hash2`), mediante clonación de comportamiento. El checkpoint publicado corresponde al paso global 326, equivalente a la época 2 de 3, con un resultado en el conjunto de desarrollo de ScienceWorld de 42,9 % de tasa de éxito y una puntuación de 62,1 sobre 1796 variaciones con semilla 0 y motor ScienceWorld 1.2.3.

La relevancia del modelo es acotada y muy específica: sirve como inicialización para pipelines de RL sobre tareas de razonamiento científico y planificación de acciones, no como modelo de producción general. Su interés práctico reside en que parte de una base instruct ya competente en instrucciones y tool calling, y la especializa en un dominio de interacción con entorno, lo que reduce el coste de arranque de experimentos de RL en ScienceWorld.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste fino de parámetros completos |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento usó max sequence length 1792 |
| Tipos de cuantización | no disponible (pesos publicados en fp32); al derivar de Llama 3.1 admite cuantizaciones estándar del ecosistema (GGUF, AWQ, GPTQ), aunque no están publicadas en el repo |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (7 shards, 291 tensores en F32); `config.json` declara `bfloat16` como dtype |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.1 8B: transformer decoder-only con atención causal, normalización RMSNorm, activaciones SwiGLU y RoPE para codificación posicional. El ajuste es de parámetros completos (no LoRA ni adaptadores), con learning rate 1e-5, batch global 64 y longitud máxima de secuencia 1792 tokens. Los datos de SFT son trayectorias expertas recopiladas por el autor únicamente sobre los objetivos de entrenamiento de ScienceWorld, lo que implica un riesgo claro de sobreajuste al conjunto de entrenamiento y una cobertura limitada de objetivos de test.

Una particularidad técnica relevante es que los pesos se publican en fp32 (los 291 tensores son F32) aunque el `config.json` declara `bfloat16` como dtype. Esto duplica aproximadamente el tamaño del repo (32,1 GB) frente a una publicación en bf16 y obliga a convertir o castear los pesos al cargarlos para inferencia eficiente. No se documenta uso de RLHF, DPO ni decodificación especulativa; el modelo es un checkpoint intermedio de un pipeline de RL, no un modelo final alineado.

## Capacidades

- Generación de texto y razonamiento de dominio científico en el entorno ScienceWorld: interpretación de observaciones, planificación de acciones y ejecución de comandos del simulador.
- Clonación de comportamiento de trayectorias expertas: reproduce secuencias de acciones típicas de un agente experto en los objetivos de entrenamiento.
- Razonamiento multi-paso orientado a objetivos: el formato de ScienceWorld exige encadenar acciones con estado persistente entre turnos.
- Conversación multi-turno: conserva la plantilla de chat de Llama 3.1 (`chat_template.jinja`, 4614 bytes) y la capacidad instruct heredada del modelo base.
- Tool calling y function calling: capacidad heredada del modelo base, no validada específicamente en este ajuste.
- Capacidades multilingües: heredadas del modelo base, no evaluadas ni documentadas en este checkpoint.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Inicialización de experimentos de RL en ScienceWorld: el checkpoint sirve como punto de partida (behavior cloning) para algoritmos de RL que optimicen la tasa de éxito en objetivos de test; su 42,9 % de éxito en dev reduce el número de pasos de exploración necesarios frente a partir del modelo base.
- Investigación en agentes basados en lenguaje: permite estudiar cómo un LLM de 8B planifica y ejecuta acciones en un entorno textual con estado, midiendo generalización de objetivos de entrenamiento a objetivos nuevos.
- Evaluación de técnicas de clonación de comportamiento: al estar entrenado solo con trayectorias expertas, es un caso controlado para medir sobreajuste y transferencia en tareas de imitación.
- Reproducción de resultados: los hashes sha256 de todos los ficheros y la configuración exacta de entrenamiento permiten replicar el checkpoint y comparar pipelines de RL sobre una base fija.
- Generación de trayectorias sintéticas para aumento de datos: el modelo puede producir secuencias de acciones plausibles en ScienceWorld que, filtradas por éxito, alimenten posteriores rondas de SFT.
- Estudio de degradación de capacidades generales tras SFT de dominio: comparar este checkpoint con el Llama 3.1 8B Instruct original en tareas generales permite cuantificar el olvido catastrófico inducido por el ajuste especializado.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| ScienceWorld dev (1796 variaciones, seed 0, engine 1.2.3) | Tasa de éxito | 42,9 % |
| ScienceWorld dev (1796 variaciones, seed 0, engine 1.2.3) | Puntuación | 62,1 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones directas con el modelo base u otros checkpoints en la misma tabla.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 32 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPU de 40 GB o superior (A100 40GB, A100 80GB, H100).
- VRAM estimada en bf16 tras conversión: aproximadamente 16 GB para pesos; cabe en RTX 4090 (24 GB) con contexto moderado, y con holgura en A100 40GB.
- VRAM estimada en cuantización 8 bits: aproximadamente 8-9 GB; viable en RTX 3090, RTX 4080 y superiores.
- VRAM estimada en cuantización 4 bits (GGUF/AWQ): aproximadamente 5-6 GB; viable en GPUs consumer de gama media con 8 GB o más.
- Despliegue: compatible con transformers y text-generation-inference (tags del repo); para vLLM, llama.cpp u Ollama sería necesaria conversión previa de los pesos fp32 a bf16 o a formatos cuantizados, no incluidos en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SFT-ScienceWorld | 8,03 B | no disponible (entrenamiento a 1792) | ScienceWorld, SFT sobre trayectorias expertas | Llama 3.1 Community | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8,03 B | 128 K (según ficha oficial del base) | Asistente general, tool calling | Llama 3.1 Community | Hugging Face, ampliamente adoptado |
| Checkpoints SFT/RL de ScienceWorld de otros autores | no disponible | no disponible | ScienceWorld | variable | no disponible en la información |

La comparación cuantitativa de rendimiento frente al modelo base en ScienceWorld no está disponible en la información proporcionada; solo se conoce el resultado de este checkpoint en dev.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo con objetivos de entrenamiento de ScienceWorld, por lo que su generalización a objetivos de test y a otros dominios no está garantizada y el 42,9 % de éxito en dev sugiere margen amplio de mejora.
- Checkpoint intermedio: corresponde a la época 2 de 3 de un pipeline de RL; no es un modelo final ni un asistente listo para producción.
- Pesos en fp32 con `config.json` en bf16: inconsistencia que puede provocar consumo de memoria inesperado o errores si no se castea explícitamente al cargar.
- Riesgo de alucinación: como todo LLM, puede generar acciones no válidas en el simulador o justificaciones incorrectas; en ScienceWorld esto se traduce directamente en fallos de episodio.
- Sesgos: no documentados por el autor; se heredan los del modelo base Llama 3.1 8B Instruct, sin evaluación específica en este checkpoint.
- Idiomas: no documentados; el ajuste se realizó sobre un entorno en inglés, lo que probablemente degrada el rendimiento en otros idiomas respecto al base.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y obligaciones de atribución; deben consultarse `LICENSE` y `USE_POLICY.md` del modelo base antes de cualquier despliegue.
- Sin resultados de benchmarks generales: no hay evidencia publicada de que el ajuste preserve las capacidades instruct del base fuera del dominio ScienceWorld.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wayne-SFT/Llama-3.1-8B-Instruct-SFT-ScienceWorld
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia del modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Política de uso del modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/USE_POLICY.md

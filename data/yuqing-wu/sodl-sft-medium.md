# yuqing-wu/sodl-sft-medium

## Resumen

`sodl-sft-medium` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3-1.7B-Base, publicado por el usuario yuqing-wu en Hugging Face. Se trata de un modelo derivado de la familia Qwen3, concretamente de la variante base de 1.700 millones de parametros, entrenado con la libreria TRL (Transformers Reinforcement Learning) mediante la tecnica de Supervised Fine-Tuning. El modelo conserva la arquitectura transformer densa del original y esta pensado como un experimento de ajuste sobre el modelo base, presumiblemente para adaptarlo a un dominio o tarea concreta, aunque la model card no especifica cual.

La relevancia de este lanzamiento es limitada desde el punto de vista de producto: no hay informacion publica sobre el dataset de entrenamiento, los hiperparametros, los resultados de evaluacion ni la licencia de uso. El repositorio ocupa 41,3 GB, un tamano desproporcionado para un modelo de 1.700 millones de parametros en precision completa (que rondaria los 7 GB en bf16), lo que sugiere que el repositorio incluye multiples checkpoints, estados del optimizador u otros artefactos de entrenamiento ademas de los pesos finales.

A pesar de la escasez de documentacion, el modelo es relevante como ejemplo de flujo de trabajo de SFT con TRL sobre la familia Qwen3 y como punto de partida para quien quiera reproducir o extender el ajuste. No obstante, su uso en produccion requeriria validacion adicional, ya que no se han publicado benchmarks, no se declara licencia y no se especifican los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B-Base) |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-1.7B-Base; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin especificar) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint Qwen/Qwen3-1.7B-Base, que pertenece a la familia Qwen3 de Alibaba. La arquitectura subyacente es un transformer denso decoder-only de aproximadamente 1.700 millones de parametros. El ajuste se realizo con TRL 1.18.0 sobre Transformers 5.20.2, PyTorch 2.14.0, Datasets 5.2.0 y Tokenizers 0.23.3. La model card indica explicitamente que el entrenamiento se hizo con SFT (Supervised Fine-Tuning), sin mencionar etapas posteriores de RLHF, DPO u otras tecnicas de alineacion.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la longitud de las secuencias, la tasa de aprendizaje, el numero de epochs ni si se congelaron capas. Tampoco se documenta si se aplicaron tecnicas como LoRA, QLoRA o ajuste completo de parametros; el tamano del repositorio (41,3 GB) es compatible con un ajuste completo que incluye estados del optimizador o multiples checkpoints intermedios, pero no puede confirmarse. No se declara ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, modo thinking, etc.) mas alla de las que ya incorpora el modelo base Qwen3.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3-1.7B-Base.
- Razonamiento basico y respuesta a preguntas, sujeto a la calidad del ajuste SFT aplicado.
- Generacion de codigo y matematicas basicas, en la medida en que el modelo base las soporte.
- Soporte de conversacion multi-turno mediante el pipeline de text-generation de Transformers.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite desplegarlo en Hugging Face Inference Endpoints.
- Capacidades de tool calling, agentes o multi-step reasoning: no documentadas en la model card.
- Capacidades multilingues: no documentadas; dependen del modelo base y no se confirman.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede cargarse con `pipeline("text-generation")` y `device_map="auto"` para probar respuestas multi-turno en entornos de desarrollo, aprovechando su tamano reducido para iterar rapido.
- Experimentacion academica con SFT: sirve como referencia reproducible para estudiar el efecto del ajuste supervisado sobre Qwen3-1.7B-Base con TRL, comparando el comportamiento antes y despues del ajuste.
- Generacion de texto en entornos con recursos limitados: con 1.700 millones de parametros, puede ejecutarse en GPUs de consumo tras cuantizacion, lo que lo hace util para demos locales.
- Base para ajustes posteriores: al ser un checkpoint SFT, puede emplearse como punto de partida para etapas de DPO, RLHF o ajuste especifico de dominio.
- Evaluacion de pipelines de despliegue: su compatibilidad con endpoints permite probar integraciones de serving (Transformers, TGI, vLLM) antes de migrar a modelos mayores.
- Filtrado y generacion de contenido en ingles tecnico: la model card incluye un ejemplo de pregunta abierta en ingles, lo que sugiere uso en tareas de generacion libre, aunque sin garantias de calidad documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 5-8 GB en funcion de la longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,7-2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1-1,5 GB para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4, A100 y H100 para despliegues de mayor throughput.
- Cabe en GPUs de consumo: si, en tarjetas con al menos 8 GB de VRAM en bf16 y en tarjetas con 4-6 GB tras cuantizacion a 4 bits.
- Opciones de despliegue: Transformers (pipeline), Hugging Face Inference Endpoints (tag `endpoints_compatible`), TGI y vLLM son opciones razonables dado el formato safetensors; llama.cpp y Ollama requeririan conversion a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yuqing-wu/sodl-sft-medium | 1,7 B | no disponible | no disponible | Hugging Face (0 descargas) | SFT sobre Qwen3-1.7B-Base, sin benchmarks |
| Qwen/Qwen3-1.7B-Base | 1,7 B | no disponible en esta ficha | Apache-2.0 (segun el modelo base original) | Hugging Face, ampliamente usado | Modelo base sin ajuste, con documentacion oficial |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible en esta ficha | Apache-2.0 (segun el modelo original) | Hugging Face | Variante instruct/chat oficial de la familia Qwen3 |
| Llama 3.2 1B Instruct | 1,2 B | 128 K (segun documentacion oficial) | Llama 3.2 Community License | Hugging Face, Meta | Alternativa de tamano similar con licencia restrictiva |

La comparativa se limita a los datos disponibles; no se han publicado metricas de rendimiento para `sodl-sft-medium` que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste SFT mejore al modelo base en ninguna tarea.
- Licencia no especificada: el campo `licence` de la model card no concreta terminos, lo que impide confirmar si el uso comercial esta permitido.
- Idiomas no declarados: no se puede garantizar soporte multilingue ni la calidad en castellano.
- Dataset de entrenamiento desconocido: no se puede evaluar el riesgo de sesgos, contaminacion de datos ni sobreajuste a un dominio concreto.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, agravado por la falta de evaluacion.
- Contexto no confirmado: aunque el modelo base Qwen3 soporta ventanas largas, la model card no confirma la longitud efectiva tras el ajuste.
- Repositorio de 41,3 GB para 1,7 B de parametros: indica artefactos de entrenamiento adicionales; conviene revisar el contenido antes de descargar.
- Sin soporte comunitario: 0 descargas y 0 likes en el momento de la ficha, sin issues ni discusiones que permitan resolver dudas.
- No apto para produccion sin validacion previa: al no haber documentacion de calidad ni de seguridad, su uso en entornos reales requiere evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuqing-wu/sodl-sft-medium
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers

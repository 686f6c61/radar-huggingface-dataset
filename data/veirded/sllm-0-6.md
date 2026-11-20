# Veirded/SLLM-0.6

## Resumen

SLLM-0.6 (Small-LLM) es un modelo de lenguaje causal autoregresivo de tipo decoder-only desarrollado desde cero por Veirded. Su particularidad es el tamano: 1.000.832 parametros (~1,0 M), lo que lo situa en un orden de magnitud muy por debajo de los modelos habitualmente tratados en produccion. La pregunta de investigacion que motiva el proyecto es cuanto grado de fluidez conversacional, correccion gramatical y conocimiento de temas cotidianos puede concentrarse en un presupuesto de un millon de parametros.

El modelo se distribuye como checkpoint base preentrenado y ajustado con SFT enmascarado sobre aproximadamente 238.716 pares de conversacion casual de un solo turno. Esta disenado para conversacion sin estado (stateless), es decir, sin memoria de chat entre turnos, con una longitud maxima de turno de 128 tokens. El tokenizador es un BPE a nivel de byte con un vocabulario de solo 1.152 tokens.

Es relevante ahora como referencia educativa y de investigacion sobre los limites inferiores de la arquitectura transformer: permite estudiar el comportamiento de un LM completo (RoPE, QK-Norm, SwiGLU, weight tying) en un presupuesto de computo minimo, ejecutable en CPU o en hardware de consumo sin practicamente requisitos de VRAM. No debe confundirse con un modelo de proposito general: su alcance es deliberadamente acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal autoregresivo |
| Parametros totales | 1.000.832 (~1,0 M), con weight tying |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (turno unico, sin memoria de chat) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding (d_model) | 128 |
| Cabezas de atencion | 4 (dimension por cabeza 32, con QK-Norm) |
| Capas | 4 |
| Dimension oculta SwiGLU | 384 |
| Vocabulario | 1.152 tokens (BPE a nivel de byte) |
| Tokenizador | SLLM-BPE (lossless byte-level BPE) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 4 capas con d_model de 128, 4 cabezas de atencion de 32 dimensiones cada una y una capa feed-forward SwiGLU con dimension oculta de 384. Incorpora RoPE (rotary position embeddings) con valores reales, evitando la sobrecarga de tensores complejos, y aplica RMSNorm a queries y keys por cabeza antes de RoPE (QK-Norm) para estabilizar los logits de atencion. Usa RMSNorm en las normalizaciones y weight tying entre el embedding de entrada y la cabeza de salida (`tok_emb.weight = lm_head.weight`). La mascara de atencion causal y de padding es explicita y booleana, disenada para evitar fugas de informacion.

El entrenamiento consta de dos etapas. La primera es un preentrenamiento de 12 epocas con 50.000 ejemplos aleatorios por epoca, batch de 16, AdamW con learning rate de 1,5e-3 a 1e-4, weight decay de 0,05, dropout de 0,15 y autocast en bfloat16 sobre MPS; la mejor perdida de validacion fue 2,1335. La segunda es un SFT enmascarado (loss solo sobre tokens del asistente) de 4 epocas con 50.000 ejemplos por epoca, batch de 32 y learning rate de 2,0e-4 a 1e-5; la mejor perdida de validacion fue 2,2938. El dataset de partida son 238.716 pares de conversacion casual de un solo turno, curados y deduplicados, con mas de 10 millones de tokens, lo que supone una ratio aproximada de 10:1 tokens por parametro. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional de un solo turno en ingles, orientada a charla casual y temas cotidianos.
- Produccion de respuestas gramaticalmente coherentes dentro de los limites de su presupuesto de parametros, segun el objetivo declarado por el autor.
- Generacion autoregresiva con decodificacion estandar (no se documentan decodificacion especulativa ni tecnicas de aceleracion).
- Capacidad multilingue limitada al ingles; no se declara soporte de otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).
- No mantiene memoria de conversacion entre turnos (stateless).

## Casos de uso

- Docencia y divulgacion sobre arquitecturas transformer: el modelo, con solo 4 capas y 1 M de parametros, permite recorrer el codigo completo (RoPE, QK-Norm, SwiGLU, weight tying) y observar el efecto de cada componente en un entrenamiento asequible en una sola maquina.
- Experimentacion academica con presupuestos minimos: sirve como linea base para estudiar relaciones tokens/parametro, curvas de perdida y tecnicas de enmascarado de loss en modelos muy pequenos.
- Prototipado de chatbots de un solo turno en entornos con recursos restringidos: al ejecutarse en CPU o en GPU de consumo sin requisitos relevantes de VRAM, permite validar pipelines de inferencia (tokenizacion, generacion, postproceso) antes de escalar a modelos mayores.
- Pruebas de integracion y CI: su huella minima lo hace util para validar flujos de carga de safetensors, tokenizadores BPE y scripts de generacion en pipelines automatizados sin coste de GPU.
- Demos educativas interactivas: puede desplegarse en portatiles o entornos tipo notebook para ilustrar el comportamiento de un LM entrenado desde cero y sus limitaciones.
- Investigacion sobre tokenizadores de vocabulario reducido: el SLLM-BPE de 1.152 tokens permite estudiar el compromiso entre tamano de vocabulario, longitud efectiva de secuencia y calidad de generacion en modelos diminutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion: 2,1335 en la etapa de preentrenamiento y 2,2938 en la etapa de SFT.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en precision completa (1 M de parametros en bfloat16 ocupan aproximadamente 2 MB, mas el vocabulario y buffers), por lo que cabe en cualquier GPU, incluida una iGPU.
- GPU recomendadas: no se requiere GPU; el script oficial detecta Apple Silicon Metal (mps), NVIDIA CUDA (cuda) o CPU.
- Cabe en cualquier GPU de consumo y en CPU; tambien en dispositivos embebidos con memoria suficiente para el runtime de PyTorch.
- Opciones de despliegue: el repositorio incluye `generate.py` con PyTorch y safetensors; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ni la existencia de pesos GGUF.
- Latencia y throughput: no disponibles. Por el tamano del modelo, la latencia estara dominada por el overhead del runtime y la tokenizacion mas que por el computo.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de ~1 M de parametros con los que establecer una comparativa de parametros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Capacidad muy limitada: con 1 M de parametros y 4 capas, la profundidad de razonamiento, el conocimiento factual y la coherencia en respuestas largas son necesariamente reducidos.
- Riesgo elevado de alucinacion: un modelo de este tamano no dispone de conocimiento factual fiable; no debe usarse para responder preguntas que requieran precision.
- Contexto muy corto: 128 tokens por turno y sin memoria de conversacion, lo que impide dialogos multi-turno o el procesamiento de documentos.
- Solo ingles: no hay soporte declarado de castellano ni de otros idiomas.
- Sesgos: al entrenarse sobre conversacion casual curada, puede reproducir sesgos presentes en esos datos; no se documenta ninguna evaluacion de sesgo.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion.
- No apto para produccion: sin benchmarks publicados, sin soporte de tool calling y con un alcance funcional acotado a charla casual de un turno.

## Enlaces

- Hugging Face: https://huggingface.co/Veirded/SLLM-0.6

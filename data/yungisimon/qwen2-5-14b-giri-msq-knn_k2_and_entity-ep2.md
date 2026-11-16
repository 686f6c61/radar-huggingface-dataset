# yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_entity-ep2

## Resumen

yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_entity-ep2 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, desarrollado por el usuario yungisimon, orientado a funcionar como "modelo de memoria" sobre pares sinteticos de pregunta-respuesta generados a partir del corpus MuSiQue. El objetivo es que el modelo memorice y recupere informacion factual asociada a documentos y entidades, entrenandose con una estrategia de agrupamiento denominada `knn_k2_and_entity` (kNN con k=2, deduplicacion de documentos y agrupacion por entidad con frecuencia documental maxima 3).

El checkpoint publicado corresponde a la epoca 2 de un entrenamiento de 3 epocas sobre un conjunto de 1.725.751 ejemplos sinteticos. El modelo conserva la arquitectura transformer densa de Qwen2.5-14B-Instruct, con 14.770.033.664 parametros totales (100 % entrenables durante el ajuste), pesos en bf16 safetensors y licencia Apache 2.0. Se carga con `transformers` estandar y utiliza la plantilla de chat de Qwen.

Su relevancia es acotada y experimental: se trata de un artefacto de investigacion sobre memorizacion y recuperacion de conocimiento en LLMs, con cero descargas y cero "likes" en el momento de redactar esta ficha, y sin model card extendida ni evaluacion publicada. No debe confundirse con un modelo de proposito general mejorado: es un checkpoint intermedio de un experimento de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only, basado en Qwen2.5-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens en entrenamiento (contexto nativo del modelo base: no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen2.5, no documentados en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso con atencion causal estandar y RoPE, y se somete a un ajuste fino completo con FSDP sobre 8 GPU AMD Instinct MI325X. No se introduce ninguna modificacion arquitectonica: el cambio es exclusivamente en los pesos. El entrenamiento emplea precision bf16, gradient checkpointing, batch efectivo de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPU), learning rate constante de 2e-05 con warmup del 5 %, weight decay 0.01, max grad norm 1.0 y calculo de perdida unicamente sobre los tokens del asistente. La longitud maxima de secuencia es de 8.096 tokens y el entrenamiento completo de 3 epocas requirio 7,36 horas de reloj (58,9 GPU-horas).

El dataset de entrenamiento es un conjunto sintetico de 1.725.751 ejemplos derivado de MuSiQue, construido mediante la estrategia `knn_k2_and_entity`: recuperacion kNN con k=2, deduplicacion de documentos y agrupacion por entidad limitando la frecuencia documental a 3. El objetivo declarado es el de "memory model": memorizar asociaciones entre preguntas, documentos y entidades para su recuperacion posterior. No se documenta en la informacion disponible el uso de RLHF, DPO u otras fases de alineamiento posteriores al ajuste supervisado, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de Qwen2.5-14B-Instruct y usa su plantilla de chat.
- Memorizacion y recuperacion de conocimiento factual: el ajuste esta disenado para asociar preguntas sinteticas de MuSiQue con documentos y entidades.
- Razonamiento multi-hop sobre documentos: el corpus de origen (MuSiQue) esta compuesto por preguntas que requieren combinar informacion de varios documentos.
- Razonamiento, codigo y matematicas: capacidades heredadas del modelo base, no evaluadas en este checkpoint.
- Tool calling / function calling: no documentado en la informacion disponible (el modelo base lo soporta; este ajuste no lo especifica).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; dependen del modelo base.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion sobre memorizacion en LLMs: usar el checkpoint para estudiar como un ajuste supervisado con pares sinteticos altera la recuperacion de hechos y la fidelidad a documentos, comparandolo con el modelo base sin ajustar.
- Recuperacion aumentada por memoria parametrica: integrar el modelo en un pipeline donde deba responder preguntas sobre un corpus fijo de documentos previamente memorizados, en lugar de depender exclusivamente de un indice vectorial externo.
- Evaluacion de estrategias de agrupamiento de datos: comparar esta variante (`knn_k2_and_entity`) con otras estrategias de construccion de datasets de memoria para medir su efecto en la calidad de las respuestas.
- Generacion de QA sintetico sobre MuSiQue: emplear el modelo para producir respuestas de referencia sobre preguntas multi-hop del corpus, utiles para construir o ampliar datasets de evaluacion.
- Baseline en experimentos de olvido catastrófico: medir cuanto conocimiento general de Qwen2.5-14B-Instruct se degrada tras el ajuste fino intensivo en un dominio concreto.
- Despliegue experimental en entornos controlados: servir el modelo con transformers o TGI (etiqueta `text-generation-inference` y `endpoints_compatible`) para pruebas internas de recuperacion de memoria, sin uso en produccion orientado a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos (14.770.033.664 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se requieren 32-40 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 15 GB de pesos; en 4 bits: aproximadamente 8-9 GB de pesos (requiere cuantizar el checkpoint, ya que solo se publican safetensors bf16).
- GPU recomendadas: A100 40/80 GB, H100 80 GB, AMD MI300X/MI325X; en consumer, RTX 4090 (24 GB) solo es viable con cuantizacion a 4 bits y contexto reducido.
- Cabe en consumer GPU: unicamente mediante cuantizacion agresiva (4 bits) y con margen ajustado en tarjetas de 24 GB.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained`, TGI (etiqueta oficial del repo), vLLM; llama.cpp/Ollama requeririan convertir los pesos a GGUF, conversion no publicada.
- Latencia y throughput estimados: no disponibles; el autor solo reporta tiempos de entrenamiento (58,9 GPU-horas en 8x MI325X para 3 epocas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_entity-ep2 | 14,77 B | 8.096 (entrenamiento) | Ajuste fino de memoria sobre MuSiQue | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 tokens (nativo) | Instruct de proposito general | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 tokens (nativo) | Instruct de proposito general | Apache 2.0 | Hugging Face, ampliamente usado |
| Meta Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Instruct de proposito general | Llama 3.1 Community License | Hugging Face, requiere aceptar licencia |

La comparacion directa con alternativas de "modelos de memoria" no esta disponible: no se conocen en la informacion proporcionada otros checkpoints publicos con la misma estrategia de entrenamiento sobre MuSiQue.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la epoca 2 de 3; no es la version final del entrenamiento y puede presentar inestabilidad respecto al checkpoint completo.
- Sin evaluacion publicada: cero descargas, cero "likes" y ausencia de benchmarks o evaluacion cualitativa; el rendimiento real es desconocido.
- Riesgo elevado de sobreajuste al dominio: el ajuste sobre 1,7 millones de ejemplos sinteticos de MuSiQue puede degradar capacidades generales del modelo base (olvido catastrófico) y sesgar las respuestas hacia el formato y contenido del corpus.
- Riesgo de alucinacion: un modelo entrenado para memorizar puede generar hechos plausibles pero incorrectos al salir del dominio de entrenamiento; no se documenta ningun mecanismo de mitigacion.
- Idiomas no documentados: aunque el modelo base es multilingue, este ajuste no declara idiomas soportados y el corpus de entrenamiento es presumiblemente en ingles.
- Contexto de entrenamiento limitado a 8.096 tokens: aunque el modelo base soporta ventanas mayores, el ajuste no garantiza buen comportamiento mas alla de esa longitud.
- Tool calling y uso como agente no verificados en este checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion y el caracter experimental desaconsejan su uso en produccion sin validacion propia.
- Repositorio de 29,6 GB: requiere espacio en disco y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_entity-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Corpus MuSiQue (referencia del dataset de entrenamiento): no disponible en la informacion proporcionada
- Paper, blog o repositorio del autor: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada

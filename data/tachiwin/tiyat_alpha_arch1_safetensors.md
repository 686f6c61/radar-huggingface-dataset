# tachiwin/tiyat_alpha_arch1_safetensors

## Resumen

Tiyat Alpha (arch1) es un transformer decoder-only multilingue desarrollado desde cero por el usuario tachiwin, publicado en Hugging Face bajo licencia Apache 2.0. No se trata de un fine-tuning ni de una variante de GPT-2, Llama u otras familias conocidas, sino de una arquitectura propia con tokenizer propio (tachiwin/tokenizer_64k) y codigo de modelado especifico. Con 184.065.024 parametros totales y un tamano de repositorio de 0,7 GB, se situa en la gama de modelos pequenos orientados a experimentacion e inferencia en hardware modesto.

La relevancia de este modelo es principalmente de investigacion: constituye un ejemplo completo de pipeline de preentrenamiento from scratch en JAX/Flax, con configuracion de entrenamiento documentada (141.672 pasos, learning rate 3e-4, loss final 3,4997) y un dataset de preentrenamiento propio (tachiwin/tiyat-ground-pretrain-m1024). Su limitacion mas visible es la longitud de contexto, de solo 918 tokens, muy inferior a los 8K-128K habituales en modelos contemporaneos, y su implementacion de inferencia es un generador manual sin KV cache ni jitting, lo que penaliza notablemente la velocidad.

El modelo no registra descargas ni likes en el momento de la consulta (0 y 0 respectivamente), lo que indica que es un proyecto reciente o poco difundido. Esta publicado con safetensors y codigo personalizado (`trust_remote_code`), y esta pensado para ejecutarse con jax, flax>=0.10 y safetensors. No se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only personalizado (no derivado de GPT-2/Llama) |
| Parametros totales | 184.065.024 (~184,1M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 918 tokens maximo |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors; el usuario puede convertir manualmente, pero no se documentan variantes) |
| Idiomas soportados | Multilingue (cobertura desigual segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con codigo de modelado propio en JAX/Flax) |

Detalles arquitectonicos adicionales: vocabulario de 64.000 tokens, dimension de embedding 768, 12 capas, 24 cabezas de atencion, dimension feed-forward 3072 y embeddings no atados (tied embeddings: False).

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo denso, con atencion multi-cabeza clasica (24 cabezas sobre dimension 768, es decir, dimension por cabeza de 32) y red feed-forward de 3072 unidades. El tokenizer es propio y dedicado (tachiwin/tokenizer_64k), con un vocabulario de 64.000 entradas, y los embeddings de entrada y salida no estan atados. La modelo card no especifica innovaciones como atencion lineal, decodificacion especulativa o mecanismos hibridos; se trata de una implementacion convencional pero escrita desde cero.

El entrenamiento se realizo sobre el dataset tachiwin/tiyat-ground-pretrain-m1024, con batch size 4, learning rate 0,0003, weight decay 0,01, gradient clipping de 1,0, un warmup ratio de 0,1 y dropout de 0,1. El entrenamiento alcanzo 141.672 pasos con una loss final de 3,4996705. No se documenta el numero total de tokens vistos, la composicion exacta del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones; todo apunta a un preentrenamiento puro sobre texto crudo.

Un aspecto tecnico destacable, y tambien limitante, es que el repositorio incluye su propio codigo (`configuration_tiyat.py`, `modeling_tiyat.py`) y que `model.generate()` no es el GenerationMixin completo de transformers, sino un generador manual que implementa argmax y muestreo con temperatura, top-k, top-p, penalizacion de repeticion y bloqueo de n-gramas repetidos. No hay busqueda por haz (beam search) ni GenerationConfig.

## Capacidades

- Generacion de texto autoregresiva en modo decoder-only, con muestreo configurable (argmax, temperatura, top-k, top-p).
- Muestreo con penalizacion de repeticion y bloqueo de no-repeat-ngram para reducir bucles de texto.
- Capacidad multilingue, aunque con calidad desigual: la propia model card advierte que rinde mejor en los idiomas con mas representacion en el corpus de entrenamiento.
- Soporte de carga mediante `transformers` con `trust_remote_code=True` o importando directamente `TiyatForCausalLM`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode).
- No se documenta un chat template ni un ajuste por instrucciones, por lo que el uso previsto es de completado de texto (text-generation), no de asistente conversacional.

## Casos de uso

- Investigacion en preentrenamiento from scratch: el repositorio es util como referencia completa de un pipeline en JAX/Flax, con configuracion de entrenamiento, dataset y codigo de modelado incluidos, para estudiar decisiones de diseno a pequena escala.
- Experimentacion con tokenizers propios: dado que usa un tokenizer dedicado de 64.000 entradas, sirve para evaluar el impacto de decisiones de tokenizacion en un modelo de 184M de parametros.
- Fine-tuning para tareas de clasificacion o completado de dominio especifico: con 184M de parametros y licencia Apache 2.0, es viable reentrenarlo o ajustarlo en una unica GPU consumer para tareas acotadas, siempre que las secuencias no superen los 918 tokens.
- Prototipado academico en entornos con recursos limitados: su tamano permite desplegarlo en portatiles o nodos pequenos para demostraciones docentes de generacion de texto y evaluacion de modelos.
- Generacion de texto corto en idiomas de altos recursos: para completar frases, resumenes muy breves o parrafos cortos donde el limite de 918 tokens no suponga un problema, y aceptando la calidad limitada propia de un modelo de 184M preentrenado solo.
- Estudio de degradacion por longitud de contexto: sirve como caso de comparacion frente a modelos con ventanas de 8K-128K para medir el efecto de contextos muy cortos en tareas de continuacion de texto.
- Pruebas de integracion en ecosistemas JAX/Flax: util para equipos que trabajan con jax y flax y necesitan un modelo pequeno con codigo nativo para validar flujos de carga, serializacion safetensors y generacion personalizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, HellaSwag ni de ningun otro conjunto estandar, y el unico dato de rendimiento reportado es la loss final de preentrenamiento (3,4996705) tras 141.672 pasos.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (184.065.024) y no estan confirmadas por el autor:

- VRAM estimada para pesos en fp32: aproximadamente 0,74 GB.
- VRAM estimada para pesos en fp16/bf16: aproximadamente 0,37 GB.
- VRAM estimada para pesos en int8: aproximadamente 0,18 GB.
- VRAM estimada para pesos en int4: aproximadamente 0,09 GB.
- En la practica, hay que sumar el consumo de activaciones y del runtime de JAX. La model card indica que la inferencia actual no usa KV cache ni jitting, por lo que el consumo real puede ser notablemente superior al de los pesos y crecer con la longitud de la secuencia.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, cabe con holgura en cualquier GPU consumer reciente (RTX 3060, 4070, 4090) e incluso en CPU, aunque la velocidad sera limitada.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, dado el tamano del modelo. La restriccion real no es la memoria sino la velocidad.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El modelo depende de codigo personalizado en JAX/Flax y se carga con `transformers` y `trust_remote_code=True`, o importando `TiyatForCausalLM` directamente. Requiere jax, flax>=0.10 y safetensors.
- Latencia y throughput: no disponibles. La model card afirma explicitamente que la inferencia es lenta en su estado actual (forward pass de JAX sin jit y sin KV cache) y que estas cifras no son representativas del rendimiento real de la arquitectura.

## Comparativa con modelos similares

Dado que se trata de un modelo de 184M de parametros, la comparacion natural es con modelos densos de tamano parecido. No hay datos de rendimiento publicados para Tiyat Alpha, por lo que la comparacion se limita a caracteristicas objetivas.

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Tiyat Alpha (arch1) | 184,1M | 918 tokens | Apache 2.0 | safetensors + codigo JAX/Flax personalizado |
| GPT-2 (small) | 124M | 1024 tokens | MIT | safetensors, amplio soporte (transformers, llama.cpp via conversiones) |
| Pythia-160m | 160M | 2048 tokens | Apache 2.0 | safetensors, transformers |
| OPT-125m | 125M | 2048 tokens | MIT | safetensors, transformers |

Notas de la comparativa: en longitud de contexto Tiyat Alpha queda por debajo de sus alternativas (918 frente a 1024-2048 tokens). En soporte de ecosistema, GPT-2, Pythia y OPT cuentan con integracion nativa en transformers y convertibilidad a GGUF, mientras que Tiyat Alpha depende de codigo personalizado y no dispone de rutas de despliegue estandar. En terminos de licencia, las cuatro opciones son permisivas. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Contexto muy limitado: 918 tokens maximos, insuficiente para tareas que requieran documentos largos, conversaciones extensas o razonamiento sobre multiples fuentes.
- Inferencia lenta en su estado actual: el forward pass de JAX no esta jitteado y no hay KV cache, tal como reconoce el autor. No es apto para produccion con requisitos de latencia.
- Cobertura multilingue desigual: la model card advierte que la calidad es notablemente mejor en idiomas de altos recursos que en los de bajos recursos.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o alineacion. Al ser un modelo preentrenado sobre un corpus no descrito en detalle, es probable que reproduzca sesgos presentes en los datos.
- Riesgo de alucinacion: elevado. Es un modelo de 184M preentrenado sin ajuste por instrucciones, por lo que generara texto plausible pero sin garantia de veracidad y sin capacidad de admitir desconocimiento de forma fiable.
- Sin ajuste por instrucciones ni chat template: no esta disenado para uso conversacional directo ni para seguir ordenes complejas.
- Limitaciones de generacion: no soporta beam search ni GenerationConfig de transformers; el generador es una implementacion manual con argmax y muestreo top-k/top-p.
- Riesgo de repeticion: aunque incorpora penalizacion de repeticion y bloqueo de no-repeat-ngram, los modelos pequenos preentrenados tienden a entrar en bucles.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No hay restricciones adicionales documentadas.
- Madurez: 0 descargas y 0 likes, creado y actualizado el 17 de septiembre de 2026. Es un proyecto sin validacion externa ni comunidad.
- Dependencia de codigo remoto: cargar el modelo con `trust_remote_code=True` implica ejecutar codigo del repositorio, lo que supone un riesgo de seguridad que conviene auditar antes de usarlo en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tachiwin/tiyat_alpha_arch1_safetensors
- Tokenizer: https://huggingface.co/tachiwin/tokenizer_64k
- Dataset de preentrenamiento: https://huggingface.co/datasets/tachiwin/tiyat-ground-pretrain-m1024
- Paper: no disponible
- Blog o demo: no disponible
- Repositorio de codigo adicional: no disponible (el codigo de modelado se incluye dentro del propio repositorio de Hugging Face)

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a paginas de ayuda de YouTube y no guardan relacion con Tiyat Alpha.

# zimplex/dllm-dreamreasoner-8b-finecode-any-order-b64-s24256-v1

## Resumen

El modelo `zimplex/dllm-dreamreasoner-8b-finecode-any-order-b64-s24256-v1` es un checkpoint de investigación resultante del entrenamiento continuado (continued pretraining, CPT) del modelo post-entrenado `Dream-org/DreamReasoner-8B`. Lo publica el usuario zimplex y pertenece a la familia de modelos de lenguaje de difusión (diffusion-language-model, dLLM), una alternativa a los transformers autorregresivos clásicos en la que la generación se realiza mediante un proceso de eliminación de ruido sobre tokens, no mediante decodificación token a token de izquierda a derecha.

El modelo tiene 8.190.735.360 parámetros (aproximadamente 8,19 mil millones) y se ha especializado en generación de código mediante CPT sobre el dataset sellado FineCode B64. Su objetivo de entrenamiento es el "any-order" con grafo de dependencias vacío (empty dependency graph), lo que implica que el orden de generación de tokens no está restringido por una estructura de dependencias predefinida. La longitud de contexto usada durante el entrenamiento fue de 2.048 tokens.

Es relevante ahora porque explora una línea de investigación activa: adaptar modelos de difusión de lenguaje a tareas de código con un objetivo de generación en cualquier orden. El checkpoint se publica bajo licencia Apache 2.0, con pesos en safetensors y código de modelado personalizado que requiere `trust_remote_code=True`, y se declara explícitamente como un checkpoint de investigación sin evaluación de seguridad ni de despliegue independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de difusion (diffusion-language-model, familia Dream/DreamReasoner) |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 2.048 tokens (longitud usada en el entrenamiento) |
| Tipos de cuantizacion | No disponible (checkpoint publicado en BF16; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`model.safetensors`) |
| Modelo base | Dream-org/DreamReasoner-8B (revision `ed62b1d2c82ccd234b05ed2463b4c0ee640f2068`) |
| Dataset de entrenamiento | zimplex/dllm-dreamreasoner-finecode-b64-v1 |
| Tamano del repositorio | 16,4 GB |
| Pasos de optimizacion finales | 24.256 |

## Arquitectura y entrenamiento

El modelo pertenece a la categoria de modelos de lenguaje de difusion. A diferencia de un transformer autorregresivo, que predice el siguiente token condicionado en los anteriores, un dLLM genera texto mediante un proceso iterativo de eliminacion de ruido, lo que en principio permite ordenes de generacion no estrictamente secuenciales. Este checkpoint parte del modelo ya post-entrenado `Dream-org/DreamReasoner-8B` y se somete a continued pretraining sobre el dataset cerrado FineCode B64, orientado a codigo.

La configuracion de entrenamiento reportada es la siguiente: run `dream-fc-ao-g64-m1-a1-16n-s24256-20260920-a1-r3`; objetivo `projected_eq73_v1` con grafo vacio (any-order, empty dependency graph); 24.256 pasos de optimizacion; longitud de contexto 2.048; batch global de 64 secuencias con microbatch 1 y acumulacion de gradiente 1; precision BF16 con FSDP full shard; 16 nodos con 4 GPUs GB300 cada uno; learning rate con decaimiento coseno de `5e-7` a `5e-8` con warmup ratio 0.05; weight decay 0.1. Los parametros de profesor son `epsilon=0`, `rollin_epsilon=0` y `action_epsilon=0`, y la supervision terminal-EOS esta habilitada. La configuracion resuelta completa se incluye como `resolved_config.yaml` en el repositorio. No se especifica el numero total de tokens de entrenamiento ni la composicion detallada del dataset, y no se menciona uso de RLHF o DPO en esta fase.

## Capacidades

- Generacion de texto y codigo: el modelo esta especializado en tareas de programacion tras el CPT sobre FineCode B64, con resultados medidos en HumanEval, MBPP y LiveCodeBench Pro.
- Generacion en cualquier orden (any-order): el objetivo de grafo vacio permite que el modelo genere tokens sin una estructura de dependencias fija durante el entrenamiento, una caracteristica distintiva de los dLLM.
- Feature extraction: la etiqueta `feature-extraction` figura entre las tags del repositorio, aunque no se detalla el uso previsto.
- Conversacional: la etiqueta `conversational` esta presente en las tags del modelo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se documentan idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo asistida en investigacion: el modelo puede completar funciones y resolver problemas de programacion, con un 85,98% de Pass@1 en HumanEval, lo que lo hace util para experimentar con decodificacion por difusion en tareas de sintesis de codigo.
- Estudio de paradigmas de decodificacion no autorregresiva: al ser un dLLM con objetivo any-order, sirve como base para investigar como el orden de generacion afecta a la calidad del codigo, comparandolo con modelos autorregresivos equivalentes.
- Reproduccion de experimentos de continued pretraining: al incluir `resolved_config.yaml`, huellas de integridad (fingerprints y SHA-256) y la configuracion completa del run, es util para replicar o auditar el proceso de CPT sobre codigo.
- Evaluacion comparativa de modelos de difusion para codigo: sus resultados en HumanEval, MBPP sanitized y LiveCodeBench Pro permiten situarlo frente a otros dLLM o LLM de tamano similar en tareas de programacion.
- Prototipado de pipelines de generacion de codigo con decodificacion por confianza: la evaluacion reportada usa "B64/S64 confidence decoding" con umbral 0,95, un esquema de decodificacion especifico que puede reproducirse en entornos de investigacion.
- Fine-tuning posterior sobre dominios de codigo especificos: al ser un checkpoint abierto bajo Apache 2.0 y con pesos en safetensors, puede servir como punto de partida para ajustes adicionales en nichos concretos (por ejemplo, lenguajes o frameworks determinados).
- Analisis de rendimiento en tareas dificiles: su 15,01% en LiveCodeBench Pro lo hace util precisamente para estudiar el comportamiento del modelo en problemas de codigo competitivo de alta dificultad.

## Benchmarks y rendimiento

Resultados reportados por el autor, con decodificacion greedy B64/S64 confidence a umbral 0,95 y semilla 17:

| Benchmark | Limite de generacion | Pass@1 |
|---|---:|---:|
| HumanEval | 4.096 | 141/164 (85,98%) |
| MBPP sanitized | 4.096 | 214/257 (83,27%) |
| LiveCodeBench Pro | 4.096 | 106/706 (15,01%) |

No se han publicado en la informacion disponible resultados de MMLU, GSM8K ni otras pruebas de conocimiento general, ni cifras comparativas directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para los pesos (el repositorio ocupa 16,4 GB), mas memoria para activaciones y overhead, por lo que se recomienda un minimo practico de 20-24 GB.
- GPU recomendadas: el entrenamiento uso 16 nodos con 4 GPUs GB300 cada uno, lo que da una idea de la escala de computo empleada en el CPT (no necesariamente requerida para inferencia).
- Inferencia en GPU de consumo: una GPU con 24 GB (por ejemplo, RTX 4090) podria albergar los pesos en BF16 de forma ajustada; no se documentan versiones cuantizadas que reduzcan aun mas el requisito.
- Opciones de despliegue: la carga se realiza con `transformers` y `trust_remote_code=True`, segun el ejemplo de la model card. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI; al tratarse de un modelo de difusion con codigo personalizado, el soporte en motores de inferencia estandar es incierto y no esta documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en codigo | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| zimplex/dllm-dreamreasoner-8b-finecode-any-order-b64-s24256-v1 | 8,19 B | 2.048 (entrenamiento) | HumanEval 85,98%; MBPP 83,27%; LiveCodeBench Pro 15,01% | Apache 2.0 | HuggingFace |
| Dream-org/DreamReasoner-8B (modelo base) | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | HuggingFace |

No se dispone de datos de benchmarks del modelo base ni de otros modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Indicado como "no disponible".

## Limitaciones y advertencias

- Checkpoint de investigacion: la model card declara explicitamente que no ha recibido una evaluacion de seguridad ni de despliegue independiente.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion: no se reporta una evaluacion especifica; como modelo generativo de codigo, puede producir fragmentos sintacticamente validos pero funcionalmente incorrectos.
- Requiere confiar en codigo remoto: el repositorio incluye codigo de modelado personalizado y debe cargarse con `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene revisarlo antes de usarlo.
- Limitacion de contexto: la longitud de contexto documentada es de 2.048 tokens durante el entrenamiento, un valor reducido frente a modelos actuales, lo que limita tareas que requieran ventanas largas.
- Idiomas: no se documentan idiomas soportados, por lo que no hay garantia de un rendimiento multilingue.
- Rendimiento desigual: el 15,01% en LiveCodeBench Pro frente al 85,98% en HumanEval sugiere una capacidad muy limitada en problemas de codigo competitivo de alta dificultad.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigacion sin evaluacion de seguridad, su uso en produccion conlleva riesgos no evaluados.
- Soporte de motores de inferencia: no esta documentado si funciona en vLLM, llama.cpp u otros; la integracion en produccion puede requerir trabajo adicional.
- Adopcion limitada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zimplex/dllm-dreamreasoner-8b-finecode-any-order-b64-s24256-v1
- Modelo base: https://huggingface.co/Dream-org/DreamReasoner-8B
- Dataset de entrenamiento: zimplex/dllm-dreamreasoner-finecode-b64-v1
- Configuracion resuelta incluida en el repositorio: `resolved_config.yaml`
- No se proporcionan enlaces adicionales a papers, blogs, repositorios o demos en la informacion disponible.

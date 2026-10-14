# Vibelet/spotlight-memory-synth-1b

## Resumen

Spotlight Memory Synth 1B es un modelo de lenguaje decoder-only de ~50 millones de parametros desarrollado y entrenado desde cero por Vibelet. Se trata de una implementacion independiente del mecanismo Spotlight Memory publicado por Percepta Research el 2 de octubre de 2026, y no de un lanzamiento oficial de Percepta. Su caracteristica principal es el mixer de secuencia: atencion sobre una retícula bidimensional (lattice) de 32x32 celdas con estados DeltaNet por celda, lo que le permite mantener un coste por token constante sea cual sea la longitud de contexto, con direccionamiento aprendido en lugar de recuperado.

A pesar del sufijo "1b" en el nombre, el recuento real de parametros en los pesos safetensors es de 48.964.160 (~50M). El modelo usa embeddings atados (tie_embeddings=True), de modo que el archivo de pesos solo contiene `emb.weight` y requiere reconstruir la cabeza LM con la configuracion correcta. Fue entrenado sobre el corpus SYNTH durante aproximadamente 1.580 millones de tokens, en dos fases de contexto (8.192 y 16.384 tokens), alcanzando una perdida de validacion final de 2,7516.

Es relevante ahora como pieza de investigacion reproducible: implementa una arquitectura alternativa a la atencion cuadratica estandar, cabe en CPU y en cualquier GPU de consumo, y dispone de una demo ejecutable integramente en navegador mediante WebGPU. Su utilidad practica en produccion es limitada por el tamano, la ausencia de benchmarks publicados y la falta de soporte en runners estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con mixer de secuencia basado en atencion sobre lattice 2D de 32x32 celdas y estados DeltaNet por celda; cabeza SwiGLU |
| Parametros totales | 48.964.160 (~50M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado a 8.192 tokens y posteriormente a 16.384 tokens; la arquitectura declara coste por token constante a cualquier longitud |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; pesos maestros en fp32 y pesos de demo en fp16 (~98 MB) |
| Idiomas soportados | no disponible (vocab_size 50.257, sin desglose de idiomas en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (`emb.weight` unico, embeddings atados) y fp16 para la demo WebGPU |

Otros hiperparametros declarados: n_embd 512, n_layer 8, n_head 8, d_k = d_v 16, chunk 128, ffn_hidden 1.536, bump_radius 1,5, kernel_floor 0,7.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only en el que el mixer de secuencia no es atencion softmax completa, sino atencion sobre una retícula bidimensional de 32x32 celdas. Cada celda mantiene un estado DeltaNet, y el direccionamiento entre celdas se aprende en lugar de recuperarse mediante un indice externo. Segun la model card, esta combinacion produce un coste por token constante independientemente de la longitud de contexto, lo que en teoria elimina el crecimiento cuadratico del coste computacional. La cabeza de la red es SwiGLU con capa oculta de 1.536 unidades, y las dimensiones por cabeza son pequenas (d_k = d_v = 16) con 8 cabezas.

El entrenamiento se realizo sobre el corpus SYNTH, con un total de ~1.580 millones de tokens repartidos en dos fases: 51.250 pasos con contexto de 8.192 tokens y 70.820 pasos adicionales con contexto de 16.384 tokens, hasta el paso 122.070, que marca el fin del schedule. La perdida de validacion final fue de 2,7516. No se documenta en la informacion disponible si hubo RLHF, DPO u otra fase de alineacion. En cuanto a numerica, se usan pesos maestros en fp32 y la ruta de escaneo fusionada mantiene los estados por chunk en registros fp32.

## Capacidades

- Generacion de texto autoregresiva basica: el modelo esta disenado para completar secuencias y producir logits de vocabulario, segun el ejemplo de uso de la model card.
- Modelado de contexto largo con coste por token constante: gracias al mixer de lattice con estados DeltaNet, el coste no escala con la longitud de la secuencia.
- Ejecucion en multiples backends: CPU sin configuracion adicional, macOS mediante shader Metal de escaneo, e Intel XPU a traves de kernels Triton/SYCL construidos por separado.
- Inferencia en navegador: existe una demo con WebGPU y WGSL que descarga ~98 MB de pesos fp16 y no realiza llamadas a un servidor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion de arquitecturas alternativas a la atencion cuadratica: el modelo sirve como implementacion de referencia reproducible del mecanismo Spotlight Memory, con pesos publicos y configuracion completa, para medir el coste por token constante a distintas longitudes de contexto.
- Validacion de mecanismos de memoria aprendida: con 50M de parametros y una perdida de validacion conocida (2,7516), es un banco de pruebas de bajo coste para estudiar como se comportan los estados DeltaNet por celda frente a la recuperacion explicita.
- Prototipado de despliegue en navegador: la demo WebGPU con ~98 MB de pesos fp16 permite integrar el modelo en aplicaciones cliente sin coste de servidor, util para demos interactivas y experimentos de privacidad (los datos no salen del dispositivo).
- Pruebas en CPU y hardware sin GPU: al ejecutarse en CPU de serie, es adecuado para pipelines de evaluacion, tests de regresion o entornos de CI donde no hay acelerador disponible.
- Experimentos en hardware Intel: la ruta Triton/SYCL permite evaluar el modelo en XPU, un escenario menos cubierto por los runners convencionales.
- Base para fine-tuning a pequena escala: con licencia MIT y ~50M de parametros, se puede reentrenar o ajustar en una unica GPU de consumo para tareas acotadas, siempre que el desarrollador implemente el runner `spotlight` necesario.
- Ensenanza y divulgacion: el par completo de modelo (~0,3 GB de repo) y demo permite explicar en clase el funcionamiento de mixers de secuencia no estandar sin recursos de computo elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida de validacion final sobre el corpus SYNTH (2,7516) y el numero de pasos de entrenamiento; no hay cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 196 MB en fp32 (~50M parametros x 4 bytes) y aproximadamente 98 MB en fp16, coherente con el tamano de pesos que descarga la demo WebGPU.
- GPU recomendadas: cualquier GPU de consumo reciente es suficiente; no se requiere A100, H100 ni VRAM de datacenter. La model card no especifica modelos concretos recomendados.
- Compatibilidad con GPU de consumo: si, con amplio margen. El modelo cabe en GPUs integradas y en cualquier RTX o equivalente; tambien funciona en CPU sin GPU.
- Opciones de despliegue: no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI. La ejecucion requiere el paquete `spotlight` propio (config, modelo y rutas de escaneo), con backends especificos para CPU, Metal en macOS y Triton/SYCL en Intel XPU. La demo usa WebGPU/WGSL.
- Latencia y throughput estimados: no disponible. La model card no publica cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

La comparacion se limita a parametros, contexto y licencia, porque no hay benchmarks publicados de Spotlight Memory Synth 1B que permitan contrastar rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spotlight Memory Synth 1B (Vibelet) | ~50M | 16.384 tokens de entrenamiento | MIT | Pesos safetensors en HuggingFace; runner propio |
| GPT-2 small | 124M | 1.024 tokens | Modified MIT | Ampliamente disponible; soporte nativo en runners estandar |
| Pythia-70M | 70M | 2.048 tokens | Apache 2.0 | Pesos publicos; soporte en runners estandar |
| Qwen2.5-0.5B | ~494M | 32.768 tokens | Apache 2.0 | Pesos publicos; soporte en vLLM, llama.cpp y Ollama |

Rendimiento comparado: no disponible. No existen cifras de benchmarks del modelo de Vibelet que permitan situarlo frente a estas alternativas.

## Limitaciones y advertencias

- El nombre induce a error: "1b" sugiere mil millones de parametros, pero el recuento real en safetensors es de 48.964.160 (~50M). Conviene verificar siempre el tamano efectivo antes de planificar despliegues.
- Ausencia total de benchmarks publicados: solo se conoce la perdida de validacion sobre SYNTH (2,7516), util como referencia interna pero no comparable con metricas estandar de la industria.
- Composicion del corpus SYNTH no documentada: no se detalla la mezcla de dominios, idiomas ni la proporcion de codigo, matematicas o texto multilingue, lo que impide anticipar el comportamiento fuera de ese dominio.
- Riesgo de alucinacion elevado: con ~50M de parametros, la capacidad de almacenar conocimiento factual es muy limitada y previsiblemente producira contenido inventado en tareas de conocimiento abierto.
- Idiomas soportados no especificados: el vocab_size de 50.257 apunta a un tokenizador de tipo BPE, pero no hay confirmacion de cobertura multilingue ni de la calidad en castellano.
- Requiere un runner no estandar: no hay soporte declarado en vLLM, llama.cpp, Ollama ni TGI, lo que complica la integracion en produccion y obliga a mantener el paquete `spotlight` y sus kernels especificos.
- Restauracion de pesos con `strict=False`: al compartir la matriz de embeddings con la cabeza LM, es necesario reconstruir el modelo con la configuracion correcta antes de cargar; un `strict=True` fallaria o una configuracion incorrecta produciria un modelo silenciosamente mal inicializado.
- Los kernels de Triton/SYCL para Intel XPU se compilan por separado, anadiendo un paso de build que puede romper la reproducibilidad entre entornos.
- Es una implementacion independiente, no oficial: los resultados pueden diferir de los del trabajo original de Percepta Research y no estan avalados por sus autores.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, con la unica obligacion de conservar el aviso de copyright y la licencia. No impone restricciones de uso adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vibelet/spotlight-memory-synth-1b
- Blog original de Spotlight Memory (Percepta Research): https://percepta.ai/blog/spotlight-memory
- Demo interactiva en navegador: https://vibelet-spotlight-demo.hf.space
- Codigo de la demo (HuggingFace Space): https://huggingface.co/spaces/Vibelet/spotlight-demo
- Perfil del autor: https://huggingface.co/Vibelet

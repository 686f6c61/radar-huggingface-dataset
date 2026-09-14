# whoashish115/Moonfrost-777M-Instruct-v1

## Resumen

Moonfrost-777M-Instruct-v1 es un ajuste supervisado (SFT) del modelo base Moonfrost-777M, desarrollado por el usuario whoashish115 y publicado bajo licencia Apache-2.0. No se trata de un modelo independiente: comparte arquitectura, tokenizer y numero de parametros con su base, y solo difiere en los pesos, entrenados durante 0,42 epocas sobre datos de instrucciones. Es un modelo pequeno, de 777 millones de parametros totales y 161 millones activos por token, disenado para experimentacion y para servir como punto de partida neutro sobre el que ajustar una persona o comportamiento propio.

La arquitectura sigue el patron DeepSeek: 14 capas, de las cuales la capa 0 es densa y las 13 restantes son Mixture-of-Experts con 32 expertos enrutados (top-3) mas 1 experto compartido, atencion Multi-head Latent Attention (MLA) con 320 de latente KV y 32 claves rotatorias desacopladas, y un vocabulario de 32.768 tokens con BPE a nivel de byte entrenado desde cero. La longitud de contexto es de solo 1.024 tokens, muy corta para los estandares actuales.

Su relevancia es limitada y de nicho: el propio autor lo presenta como un checkpoint deliberadamente neutro (sin datos de identidad) para quien quiera construir encima, y advierte de que esta infraentrenado. Con 6.000 millones de tokens de preentrenamiento para 777 millones de parametros (unas 8 relaciones token/parametro, frente a las ~20 del optimo de computo), sus resultados en benchmarks quedan por debajo de referencias como SmolLM2-360M o Qwen2.5-0.5B. Ademas, el ajuste arrastra dos fallos conocidos: deriva entre roles de hablante (llega a escribir el turno del usuario) y ausencia total de identidad (al preguntarle quien lo creo responde con una persona ficticia).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts y Multi-head Latent Attention (MLA); capa 0 densa, capas 1-13 MoE |
| Parametros totales | 777.229.056 segun metadatos de safetensors; la model card declara 777.148.032 |
| Parametros activos | 161.036.224 por token (MoE, top-3 de 32 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (aproximadamente 1,6 GB, pesos en bf16); el ejemplo de uso de la model card carga con torch_dtype=torch.float32 |
| Modelo base | whoashish115/Moonfrost-777M |
| Tamano del repositorio | 1,6 GB |
| Vocabulario | 32.768 tokens, BPE a nivel de byte entrenado desde cero |
| Dimension oculta / cabezas | 896 / 14 |
| Atencion | Multi-head Latent Attention, 320 de latente KV + 32 claves rotatorias desacopladas |
| Libreria | transformers (requiere trust_remote_code=True) |
| Fecha de creacion / actualizacion | 13 de septiembre de 2026 / 14 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 14 capas, dimension oculta de 896 y 14 cabezas de atencion. La novedad arquitectonica principal es el uso de MoE en 13 de las 14 capas: 32 expertos enrutados con enrutamiento top-3 mas un experto compartido, lo que da 161 millones de parametros activos sobre un total de 777 millones (una ratio de activacion de aproximadamente el 21 %). La atencion es Multi-head Latent Attention al estilo DeepSeek, con 320 dimensiones de latente KV y 32 claves rotatorias desacopladas, un mecanismo pensado para reducir el coste de la cache KV. La capa 0 se mantiene densa. El tokenizer es un BPE a nivel de byte de 32.768 entradas entrenado desde cero.

El preentrenamiento del modelo base uso aproximadamente 6.000 millones de tokens (la model card indica unos 8 tokens por parametro, frente a la ratio de computo-optimo de aproximadamente 20), con HuggingFaceFW/fineweb-edu entre los datasets declarados. Sobre esa base, esta version Instruct aplica un ajuste supervisado de 0,42 epocas con LR maximo 2e-4 y minimo 2e-5, cosine basado en tiempo y 100 pasos de warmup; micro-batch de 24 con acumulacion de 3, lo que da 73.728 tokens por paso; precision bf16 con pesos maestros en fp32. La mezcla de datos de instrucciones combina smol-smoltalk (88 % de las filas) con smoltalk `everyday-conversations` repetido 25 veces (12 %). El mejor punto se alcanzo en el paso 1.805, con val loss 1.3251. Este ajuste no incluye datos de identidad ni de persona (a diferencia de la variante v2).

## Capacidades

- Generacion de texto conversacional en ingles con formato de plantilla `<|system|>…<|user|>…<|assistant|>…<|endoftext|>`.
- Seguimiento de instrucciones basicas, con calidad limitada por las 0,42 epocas de ajuste.
- Conocimiento general y razonamiento de sentido comun medido en ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande y BoolQ.
- Generacion de codigo (el autor documenta que este checkpoint produce codigo Java incorrecto, con dos metodos `main` en una misma clase).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales (vision, audio, modo pensamiento): no disponibles.
- Punto de partida neutro para ajustar una persona propia: es la unica capacidad en la que, segun el autor, supera a Moonfrost-777M-Instruct-v2, porque no contiene datos de identidad que puedan entrar en conflicto.

## Casos de uso

- Investigacion sobre arquitecturas MoE de pequena escala: el modelo permite estudiar en una sola GPU el comportamiento de 32 expertos con enrutamiento top-3 mas experto compartido y de MLA con 320 de latente KV, sin necesidad de infraestructura distribuida.
- Base para ajuste de persona propia: al no contener datos de identidad, un desarrollador puede aplicar su propio SFT de persona sin que el checkpoint "discuta" la identidad previa; es el escenario que el propio autor senala como idoneo.
- Experimentos de destilacion o continua preentrenamiento: con 777 millones de parametros y pesos en safetensors, sirve como sujeto de pruebas para recetas de preentrenamiento adicional sobre fineweb-edu.
- Pruebas de tokenizer desde cero: al usar un vocabulario BPE de 32.768 entrenado especificamente, es util para comparar eficiencia de tokenizacion frente a tokenizers heredados de modelos mayores.
- Validacion de pipelines de inferencia con `custom_code`: permite comprobar la integracion de modelos con codigo remoto en transformers, incluyendo la gestion de tokens de parada adicionales.
- Estudio de fallos de ajuste supervisado: el checkpoint documenta de forma explicita dos fallos reproducibles (deriva de hablante y ausencia de identidad), lo que lo convierte en un caso de referencia para analizar los efectos de un SFT infraentrenado.
- Docencia y prototipado offline: por su tamano reducido puede ejecutarse en portatiles con GPU modesta para demostraciones de generacion de texto, siempre que no se exponga a usuarios finales.

## Benchmarks y rendimiento

Evaluacion five-shot, 250 ejemplos por benchmark, puntuacion por verosimilitud, con los modelos de referencia ejecutados en el mismo harness y sobre los mismos ejemplos.

| Benchmark | Azar | Moonfrost Base | Moonfrost Instruct v1 | Moonfrost Instruct v2 | SmolLM2-135M | SmolLM2-360M | Qwen2.5-0.5B |
|---|---|---|---|---|---|---|---|
| ARC-Easy | 25,0 | 54,8 | 52,4 | 44,4 | 62,8 | **68,4** | 64,4 |
| ARC-Challenge | 25,0 | 25,2 | 24,4 | 24,4 | 27,6 | **37,2** | 34,8 |
| HellaSwag | 25,0 | 36,0 | 38,4 | 37,2 | 40,0 | **43,6** | 42,4 |
| WinoGrande | 50,0 | 51,2 | 53,2 | 54,0 | 54,0 | 56,0 | **56,8** |
| BoolQ | 50,0 | 62,4 | 61,2 | 58,8 | 62,0 | 63,6 | **65,2** |
| MMLU | 25,0 | 28,8 | 30,0 | 30,8 | 32,4 | **36,8** | 34,4 |

El ajuste de instrucciones apenas mueve los resultados respecto al modelo base: mejora en HellaSwag (36,0 a 38,4), WinoGrande (51,2 a 53,2) y MMLU (28,8 a 30,0), y empeora en ARC-Easy (54,8 a 52,4) y BoolQ (62,4 a 61,2). En cinco de los seis benchmarks queda por debajo de SmolLM2-360M. El propio autor atribuye estos valores a la ratio de tokens por parametro del preentrenamiento (unas 8, frente a las ~20 de computo-optimo, y frente a los dos a dieciocho billones de tokens que leen los modelos de referencia).

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 1,6 GB solo para pesos, mas cache de activaciones y KV.
- VRAM estimada en fp32: aproximadamente 3,1 GB solo para pesos; el ejemplo de la model card usa `torch_dtype=torch.float32`.
- VRAM estimada con cuantizacion int8: no disponible (no se publican pesos cuantizados; la cifra seria orientativa, alrededor de 0,8 GB en teoria).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cualquier GPU consumer con al menos 4-6 GB de VRAM deberia poder cargar los pesos en bf16, pero no hay validacion publicada.
- Cabe en GPU consumer: si, en principio, dado el tamano del repositorio (1,6 GB); sin datos oficiales de pruebas.
- Opciones de despliegue: transformers con `trust_remote_code=True` (unico metodo documentado). vLLM, llama.cpp, Ollama y TGI no estan documentados para este checkpoint; llama.cpp y Ollama requeririan conversion a GGUF, que no se ha publicado.
- Latencia y throughput estimados: no disponible.
- Nota practica: el contexto maximo es de solo 1.024 tokens, lo que limita el uso de cache KV y tambien el caso de uso conversacional multi-turno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento (media de los 6 benchmarks) |
|---|---|---|---|---|---|
| Moonfrost-777M-Instruct-v1 | 777,2 M totales / 161,0 M activos | 1.024 tokens | apache-2.0 | HuggingFace, safetensors, requiere codigo remoto | 43,3 |
| Moonfrost-777M (base) | 777,2 M totales / 161,0 M activos | 1.024 tokens | apache-2.0 | HuggingFace | 43,0 |
| Moonfrost-777M-Instruct-v2 | 777,2 M totales / 161,0 M activos | 1.024 tokens | apache-2.0 | HuggingFace | 41,6 |
| SmolLM2-360M | no disponible en la informacion proporcionada (360 M segun denominacion) | no disponible | no disponible | no disponible | 51,6 |
| Qwen2.5-0.5B | no disponible en la informacion proporcionada (0,5 B segun denominacion) | no disponible | no disponible | no disponible | 48,7 |
| SmolLM2-135M | no disponible en la informacion proporcionada (135 M segun denominacion) | no disponible | no disponible | no disponible | 49,7 |

Las medias de la ultima columna estan calculadas sobre las seis puntuaciones publicadas en la tabla de benchmarks de la model card. No se dispone de datos de licencia, contexto o disponibilidad de los tres modelos de referencia mas alla de las cifras de evaluacion.

## Limitaciones y advertencias

- Modelo no apto para produccion ni para contacto con usuarios finales. El propio autor lo indica de forma explicita: no tiene ajuste de seguridad ni filtrado de contenido, y deriva entre hablantes con frecuencia suficiente para generar dialogos incoherentes.
- Deriva entre roles de hablante: al haber visto pocas conversaciones completas, no aprende de forma fiable donde termina el turno del asistente y a veces escribe el siguiente mensaje del usuario. Por eso es necesario tratar tanto `<|endoftext|>` como `<|user|>` como tokens de parada.
- Ausencia de identidad: al no haberse incluido datos de persona en este ajuste, el modelo inventa una identidad. Ante la pregunta de quien lo creo, responde que es un profesor jubilado de ingles llamado Jack Harris que ha ensenado en el Medio Oeste durante unos diez anos, y devuelve la pregunta.
- Generacion de codigo poco fiable: el autor documenta que una peticion de "hello world" en Java produce una clase con dos metodos `main` que no compila, acompanada de una explicacion sobre clases base abstractas sin relacion con el codigo.
- Riesgo de alucinacion: elevado y ya confirmado en dos dominios (identidad y codigo), coherente con una val loss de 1,3251 y un ajuste de menos de media epoca.
- Limitacion de contexto severa: 1.024 tokens, insuficiente para conversaciones largas, documentos o razonamiento multi-paso con contexto extenso.
- Limitacion idiomatica: solo ingles. No hay soporte declarado de castellano ni de otros idiomas.
- Infraentrenamiento: 6.000 millones de tokens para 777 millones de parametros, aproximadamente ocho tokens por parametro frente a los veinte de la ratio computo-optima. Esto explica los resultados en benchmarks.
- Licencia: apache-2.0, que en principio permite uso comercial y modificacion, pero el modelo no dispone de garantias de calidad ni de seguridad; cualquier despliegue comercial asumiria el riesgo de los fallos descritos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado publicado en el repositorio del modelo; conviene auditar ese codigo antes de usarlo en un entorno controlado.
- Los metadatos de safetensors indican 777.229.056 parametros mientras la model card declara 777.148.032; la discrepancia no esta explicada en la informacion disponible.
- No se han publicado versiones cuantizadas ni formatos GGUF, por lo que el despliegue fuera de transformers no esta soportado de fabrica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whoashish115/Moonfrost-777M-Instruct-v1
- Modelo base: https://huggingface.co/whoashish115/Moonfrost-777M
- Variante conversacional: https://huggingface.co/whoashish115/Moonfrost-777M-Instruct-v2
- Repositorio de codigo: https://github.com/whoashish115/moonfrost-ai
- Sitio del proyecto: https://moonfrost-ai.vercel.app
- Registros de entrenamiento (Weights & Biases): https://wandb.ai/whoashish115-base/moonfrost-777m
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de ajuste por instrucciones: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Grafico de benchmarks citado en la model card: charts/benchmarks.png (ruta relativa dentro del repositorio del modelo)
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (son paginas de soporte de Google sobre recuperacion y busqueda de imagenes) y no aportan informacion adicional utilizable.

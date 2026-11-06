# Yo-Purple/Meditor-1-2.2B-A500M-MoE

## Resumen

Meditor-1-2.2B-A500M-MoE es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) de tipo sparse, desarrollado por el usuario independiente Yo-Purple y publicado en Hugging Face. Se construye mediante "upcycling" del modelo denso Qwen2.5-0.5B-Instruct (entrenado sobre 18 billones de tokens), al que se le anaden expertos enrutados adicionales para elevar la capacidad representacional hasta 2.356 millones de parametros almacenados, manteniendo solo unos 572,95 millones de parametros activos por token (ratio de computo activo del 25,8%).

El modelo sigue una topologia de enrutamiento inspirada en DeepSeek: un experto compartido dedicado que preserva el conocimiento base de Qwen 2.5 y 22 expertos enrutados por capa, de los cuales se activa uno solo (Top-1) junto al compartido. Emplea ademas una ventana de contexto nativa de 524.288 tokens (500K) mediante atencion hibrida con ventana deslizante en 20 capas y 4 capas globales con RoPE proporcional.

Su relevancia radica en el objetivo declarado de ofrecer capacidad de un modelo de ~2,2B con coste de inferencia de uno de ~0,57B, y con un peso en safetensors de solo 4,39 GB en bfloat16, lo que lo hace apto para GPUs de consumo con 8 GB de VRAM. Es un modelo de investigacion con arquitectura personalizada, sin despliegue de inferencia estandarizado en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE sparse de estilo DeepSeek, con experto compartido y enrutamiento Top-1; atencion hibrida (sliding window + global proporcional-RoPE) |
| Parametros totales | 2.356.466.328 (~2,36B segun safetensors; la model card declara 2.220.330.904) |
| Parametros activos | ~572.952.448 (~572,95M) por token; ratio de computo activo 25,8% |
| Longitud de contexto | 524.288 tokens (500K) nativos |
| Tipos de cuantizacion | No disponible (solo se publican pesos en bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16, ~4,39 GB) |

## Arquitectura y entrenamiento

Meditor parte de Qwen2.5-0.5B-Instruct como base densa y aplica upcycling a una arquitectura MoE: 24 capas transformer con hidden size 896, 14 cabezas de query y 2 de KV (GQA 7:1). Cada capa contiene un experto compartido con MLP intermedio de 4.864 dimensiones (que preserva integramente el conocimiento del modelo base) y 22 expertos enrutados de 1.216 dimensiones cada uno, sumando 552 expertos en total. Por token se activa el experto compartido mas el mejor experto enrutado (Top-1), lo que reduce el computo por token a aproximadamente una cuarta parte del total almacenado.

La atencion es hibrida: 20 capas usan ventana deslizante de 2.048 tokens y 4 capas son globales con RoPE proporcional (theta base 1.000.000,0), lo que habilita la ventana de 500K tokens. No se detallan en la informacion disponible el numero de tokens de entrenamiento del upcycling, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO sobre la base. La model card menciona capacidades de razonamiento y "toolformer", pero no documenta el proceso de alineamiento ni los datos empleados. La arquitectura es personalizada y requiere `trust_remote_code=True` para cargarse con transformers.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (`apply_chat_template`).
- Razonamiento basico y respuesta a preguntas de opcion multiple (evaluado en estilo ARC).
- Aritmetica directa mediante decodificacion autoregresiva (60% de acierto reportado) y aritmetica aumentada con herramientas (100% con ejecucion AST segura).
- Soporte declarado de "toolformer" y uso de herramientas externas para calculo.
- Capacidad de razonamiento multi-paso declarada en los tags del modelo.
- Ventana de contexto muy larga (500K tokens) para documentos extensos.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Procesamiento de documentos largos: con 500K tokens de contexto puede ingerir libros completos, expedientes o bases de codigo extensas en una sola pasada, util para resumen y extraccion de informacion sobre corpus de gran tamano.
- Experimentacion en investigacion sobre MoE sparse: sirve como banco de pruebas de bajo coste para estudiar enrutamiento Top-1, expertos compartidos y upcycling sobre un modelo base pequeno.
- Despliegue en GPUs de consumo: con 4,39 GB en bfloat16 y 4,16 GB de VRAM activa reportada, puede ejecutarse en tarjetas de 8 GB (por ejemplo RTX 4060) para prototipos y demos locales.
- Asistente conversacional ligero en ingles: la plantilla de chat y el formato instruct permiten integrarlo en interfaces de chat multi-turno con presupuesto de memoria reducido.
- Calculo asistido por herramientas: el soporte de tool calling y la evaluacion con ejecucion AST lo hacen adecuado para tareas aritmeticas donde se delega el calculo a un interprete seguro.
- Educacion y divulgacion: como modelo pequeno y de licencia permisiva, resulta util para ensenar conceptos de arquitecturas MoE y atencion de largo contexto en entornos con hardware limitado.
- Fine-tuning experimental: al ser Apache 2.0 y caber en una sola GPU, puede ajustarse para dominios especificos sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados reportados por el autor, medidos localmente en una NVIDIA RTX 4060 de 8 GB con PyTorch 2.6:

| Metrica | Resultado | Notas |
|---|---|---|
| Perplejidad de razonamiento (PPL) | 8,35 | Entropia cruzada: 2,1227 |
| Razonamiento cientifico estilo ARC | 50,0% | Zero-shot por verosimilitud en opcion multiple |
| Aritmetica directa | 60,0% | Decodificacion autoregresiva |
| Aritmetica aumentada con herramientas | 100,0% | Con ejecucion AST segura |
| VRAM activa | 4,16 GB | Deja ~3,8 GB libres para KV-cache en tarjetas de 8 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,39 GB en bfloat16 (pesos); ~4,16 GB de consumo activo reportado por el autor.
- GPU recomendadas: RTX 4060 8 GB (probada por el autor); cualquier GPU con al menos 8 GB de VRAM.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores con margen para KV-cache (~3,8 GB libres en la prueba del autor).
- Opciones de despliegue: transformers con `trust_remote_code=True` y `torch_dtype=torch.bfloat16`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el campo `inference: false` de la model card sugiere que no hay endpoint de inferencia habilitado en el Hub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Meditor-1-2.2B-A500M-MoE | ~2,36B (safetensors) | ~572,95M | 524.288 | Apache 2.0 | MoE sparse personalizado, solo ingles |
| Qwen2.5-0.5B-Instruct | ~0,5B | ~0,5B (denso) | 32.768 (tipico de la familia Qwen2.5) | Apache 2.0 | Modelo base del que deriva; denso y ampliamente soportado |
| Qwen2.5-1.5B-Instruct | ~1,5B | ~1,5B (denso) | 32.768 (tipico de la familia Qwen2.5) | Apache 2.0 | Alternativa densa de tamano cercano con soporte estandar en transformers |
| SmolLM2-1.7B-Instruct | ~1,7B | ~1,7B (denso) | 8.192 (tipico) | Apache 2.0 | Alternativa pequena densa para hardware de consumo |

Las cifras de contexto de los modelos comparables son las habituales de sus familias y deben verificarse en sus respectivas model cards. Meditor destaca por su ventana de contexto y su bajo computo activo, pero carece del ecosistema de herramientas y del soporte de inferencia estandarizado de los modelos densos comparados.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Arquitectura personalizada que exige `trust_remote_code=True`, lo que implica ejecutar codigo del autor y complica la integracion con frameworks de inferencia estandar.
- Sin despliegue de inferencia habilitado en el Hub (`inference: false`) y con 0 descargas en el momento de la consulta: madurez y validacion comunitaria muy limitadas.
- Los benchmarks son autoinformados por el autor, con muestras pequenas y sin comparacion con lineas base; deben tomarse con cautela.
- Riesgo de alucinacion inherente a un modelo base de 0,5B con upcycling; la capacidad de razonamiento es limitada (50% en ARC, 60% en aritmetica directa).
- La coherencia del enrutamiento MoE y del contexto de 500K no esta validada de forma independiente; el comportamiento mas alla de decenas de miles de tokens puede degradarse.
- Discrepancia entre los parametros declarados en la model card (2.220.330.904) y los del safetensors (2.356.466.328), lo que indica posible falta de sincronizacion en la documentacion.
- Licencia Apache 2.0 permisiva para uso comercial, pero sin garantias del autor ni auditoria de sesgos; no se documentan evaluaciones de seguridad ni de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yo-Purple/Meditor-1-2.2B-A500M-MoE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.

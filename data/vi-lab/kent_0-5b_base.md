# Vi-LAB/KenT_0.5B_Base

## Resumen

KenT_0.5B_Base es un modelo de lenguaje causal decoder-only de aproximadamente 485 millones de parametros (484.934.656 segun los pesos publicados en safetensors), desarrollado por Vi-LAB (Vietnam-LAB). Se distribuye bajo licencia Apache 2.0, esta entrenado exclusivamente en ingles y su unico dato de preentrenamiento declarado es el corpus wikimedia/wikipedia. Su ventana de contexto es de 2048 tokens y emplea un tokenizador BPE de GPT-2 con un vocabulario de 50.257 entradas.

El interes tecnico del modelo no reside en su tamano, sino en su arquitectura, etiquetada como `custom-architecture` en HuggingFace. KenT introduce dos mecanismos propios: una atencion con dimension de cabeza comprimida para Q y K (64 dimensiones frente a las 128 de V) y un modulo denominado Gated Key Refinement, que calcula una compuerta causal auxiliar sobre una proyeccion `g_proj` antes de aplicar RoPE y la fusiona en los estados de clave comprimidos. El objetivo declarado es obtener senales de enrutamiento aprendidas sin aumentar la huella de memoria de la cache key-value.

Se trata de un modelo base (`pretrained`), sin ajuste por instrucciones, sin RLHF ni DPO, por lo que su uso directo queda limitado a generacion de texto en continuacion y a servir como punto de partida para ajuste fino o como banco de pruebas para investigacion sobre mecanismos de atencion alternativos. Su relevancia actual es la de un experimento abierto y reproducible de arquitectura a escala sub-1B, con un rendimiento declarado en MMLU-Pro de 11,77% de acierto sobre 12.032 preguntas, un valor muy proximo al azar en una prueba de diez opciones y no verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con Compressed-QK Attention y Gated Key Refinement (custom-architecture) |
| Parametros totales | 484.934.656 (aproximadamente 0,485 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados en el repositorio) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,9 GB) |
| Capas | 31 bloques decoder |
| Dimension oculta (d_model) | 1024 |
| Cabezas de atencion | 8 |
| Dimension de cabeza QK / V | 64 / 128 |
| Intermedio MLP | 2816 (SwiGLU, redondeado a multiplo de 256) |
| Codificacion posicional | RoPE con theta = 10.000 |
| Normalizacion | RMSNorm pre-normalizacion, epsilon = 1e-6 |
| Tokenizador | BPE de GPT-2, vocabulario de 50.257 |
| Requiere codigo remoto | si (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

KenT_0.5B_Base es un transformer causal denso de 31 capas con d_model de 1024, 8 cabezas de atencion, SwiGLU en el MLP con dimension intermedia de 2816, RMSNorm en pre-normalizacion y RoPE como codificacion posicional. La particularidad esta en la atencion: las cabezas de Q y K trabajan en 64 dimensiones (la mitad de las 128 de V), lo que reduce el coste de la cache de claves. Sobre esa base se anade Gated Key Refinement, un flujo de proyeccion auxiliar `g_proj` que, antes de aplicar RoPE, calcula una atencion causal local sobre sus propios estados para producir una compuerta dependiente de la secuencia, calculada como Softmax(G·Gᵀ/√d_k)·K_raw. Esa compuerta se fusiona en los estados de clave comprimidos, de modo que el modelo incorpora senales de enrutamiento aprendidas sin incrementar el tamano de la memoria key-value.

En cuanto al entrenamiento, la model card solo declara el uso del corpus wikimedia/wikipedia (CC BY-SA 4.0) para el preentrenamiento y TIGER-Lab/MMLU-Pro como conjunto de evaluacion. No se especifica el numero de tokens procesados, la composicion del dataset, la receta de optimizacion, la mezcla de datos ni si hubo fases de ajuste posteriores: no hay indicios de RLHF, DPO o SFT, y las etiquetas del repositorio (`pretrained`, sin tag de `instruct`) confirman que es un modelo base. Tampoco se documentan innovaciones adicionales como decodificacion especulativa, atencion linear o capas SSM.

## Capacidades

- Generacion de texto en ingles por continuacion de prompt: es la funcion principal de un modelo causal base sin ajuste por instrucciones.
- Razonamiento y conocimiento enciclopedico de nivel limitado: el unico dato disponible es 11,77% de acierto en MMLU-Pro, un resultado cercano al azar en una tarea de diez opciones.
- No soporta tool calling ni function calling: no hay plantillas de herramientas, tokens especiales ni entrenamiento orientado a ello.
- No soporta uso agentico ni razonamiento multi-paso guiado: al ser un modelo base, carece de formato de dialogo y de modo de pensamiento (`thinking mode`).
- Capacidades multilingues: solo ingles declarado; el vocabulario BPE de GPT-2 cubre otros idiomas de forma degradada, pero no hay evaluacion que lo respalde.
- Sin capacidades de vision, audio ni multimodalidad.
- Ajuste fino y experimentacion arquitectonica: al ser un modelo denso de 0,5B con pesos en safetensors y licencia Apache 2.0, es adecuado como base para SFT, LoRA o estudios comparativos de mecanismos de atencion.
- Inferencia en CPU: con menos de 1 GB de pesos en fp16, es ejecutable en hardware muy modesto.

## Casos de uso

- Punto de partida para ajuste supervisado en ingles: con 0,5B de parametros y licencia Apache 2.0, se puede afinar con LoRA en una unica GPU consumer para tareas de clasificacion, resumen o generacion de dominio acotado.
- Estudio comparativo de mecanismos de atencion: al incorporar Compressed-QK Attention y Gated Key Refinement, sirve como sujeto experimental para medir el impacto de la compresion de claves en calidad y en uso de memoria frente a un transformer estandar del mismo tamano.
- Generacion de texto sintetico para pruebas de pipelines: su bajo coste permite producir grandes volumenes de texto en ingles para validar etapas de preprocesado, indexado o evaluacion sin depender de APIs externas.
- Prototipado en entornos con recursos minimos: los pesos en fp16 ocupan menos de 1 GB, por lo que puede desplegarse en contenedores pequenos, portatiles o instancias CPU para demos internas de generacion de texto.
- Destilacion y modelos auxiliares: por su tamano, puede actuar como estudiante en un esquema de destilacion desde un modelo mayor o como componente auxiliar en experimentos de decodificacion especulativa (no validado por el autor).
- Educacion e investigacion reproducible: sirve para ilustrar el ciclo completo de preentrenamiento y evaluacion de un LLM sub-1B, incluyendo el analisis por categorias de MMLU-Pro.
- Autocompletado de texto en ingles: la ventana de 2048 tokens permite mantener contexto de parrafos completos en tareas de continuacion de texto tecnico o enciclopedico, siempre con supervision humana del resultado.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card, no verificados de forma independiente (`verified: false`). El unico benchmark publicado es MMLU-Pro.

| Benchmark | Metrica | Valor | Detalle |
|---|---|---|---|
| MMLU-Pro (TIGER-Lab/MMLU-Pro) | Accuracy | 11,77% | 1.416 aciertos sobre 12.032 preguntas |

Desglose por categoria en MMLU-Pro:

| Categoria | Accuracy (%) | Correctas / Total |
|---|---|---|
| philosophy | 14,23% | 71 / 499 |
| history | 13,65% | 52 / 381 |
| law | 13,44% | 148 / 1101 |
| health | 12,84% | 105 / 818 |
| economics | 12,80% | 108 / 844 |
| engineering | 12,18% | 118 / 969 |
| physics | 11,70% | 152 / 1299 |
| other | 11,58% | 107 / 924 |
| chemistry | 11,48% | 130 / 1132 |
| math | 11,10% | 150 / 1351 |
| computer science | 10,49% | 43 / 410 |
| business | 10,39% | 82 / 789 |
| biology | 10,32% | 74 / 717 |
| psychology | 9,52% | 76 / 798 |

No se han publicado resultados de MMLU, HumanEval, GSM8K, ARC, HellaSwag, TruthfulQA ni de ninguna otra prueba en la informacion disponible. Conviene tener en cuenta que MMLU-Pro es una prueba de respuesta multiple con diez opciones, de modo que una politica aleatoria se situa en torno al 10%; el 11,77% declarado esta, por tanto, muy proximo al azar.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 1,94 GB en fp32, 0,97 GB en fp16/bf16, 0,48 GB en int8 y 0,24 GB en int4 (calculado a partir de los 484,9 M de parametros).
- Cache key-value: con 31 capas, 8 cabezas y dimensiones de 64 (K) y 128 (V), la cache ocupa unos 93 KB por token en fp16, es decir, alrededor de 190 MB con la ventana completa de 2048 tokens.
- VRAM estimada total para inferencia: por debajo de 1,5 GB en fp16 sumando pesos, cache y activaciones; menos de 1 GB en cuantizacion int8.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque en estas ultimas el modelo quedara muy desaprovechado.
- Cabe en GPU consumer y en iGPU o CPU: si, es uno de los pocos modelos que se ejecuta sin problemas en CPU y en graficas integradas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada oficialmente. vLLM, TGI, llama.cpp y Ollama no estan confirmados para esta arquitectura personalizada y no se publican pesos GGUF ni cuantizaciones listas para usar.
- Latencia y throughput: no disponibles; el autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables para los modelos alternativos en la informacion proporcionada; la unica cifra verificable aqui es el 11,77% de KenT en MMLU-Pro. La tabla compara exclusivamente caracteristicas estructurales y de disponibilidad. Las especificaciones de los modelos alternativos proceden de su documentacion publica habitual y no han sido verificadas durante la busqueda para esta ficha.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato | Benchmark comparable |
|---|---|---|---|---|---|---|
| Vi-LAB/KenT_0.5B_Base | 0,485 B | 2048 | Apache 2.0 | Ingles | safetensors | MMLU-Pro: 11,77% |
| GPT-2 (small / medium) | 0,124 B / 0,355 B | 1024 | MIT (con restricciones de uso) | Ingles | safetensors, GGUF | no disponible |
| Qwen2.5-0.5B | 0,49 B | 32.768 | Apache 2.0 | Multilingue | safetensors, GGUF | no disponible |
| SmolLM2-360M | 0,362 B | 8192 | Apache 2.0 | Ingles principalmente | safetensors, GGUF | no disponible |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | Ingles | safetensors, GGUF | no disponible |

Diferencias clave frente a las alternativas: KenT ofrece el mismo orden de magnitud de parametros que Qwen2.5-0.5B y SmolLM2-360M, pero con una ventana de contexto cuatro veces menor (2048 frente a 8192 y 32.768 respectivamente) y sin versiones cuantizadas ni soporte confirmado en los runners mas habituales. Su rasgo diferencial es la arquitectura de atencion propia, que ninguna de las alternativas emplea.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes, no mantiene formatos de dialogo y no debe usarse como asistente conversacional sin un ajuste previo.
- Riesgo elevado de alucinacion: al estar preentrenado sobre Wikipedia y sin fases de alineamiento, puede generar afirmaciones factualmente incorrectas con fluidez.
- Rendimiento cercano al azar en conocimiento: el 11,77% en MMLU-Pro esta solo 1,77 puntos por encima de lo esperable por azar en una prueba de diez opciones, y la cifra no ha sido verificada por terceros.
- Limitacion idiomatica: solo ingles declarado. El tokenizador BPE de GPT-2 penaliza idiomas como el castellano, con una tokenizacion menos eficiente y sin evaluacion de calidad.
- Contexto corto: 2048 tokens limita tareas de resumen de documentos largos, RAG con muchos fragmentos o conversaciones extensas.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad. Un corpus exclusivamente enciclopedico como Wikipedia introduce sesgos de cobertura, representacion y estilo.
- Uso de codigo remoto: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio; conviene auditar los ficheros antes de usarlo en entornos productivos.
- Sin soporte confirmado en runners estandar: no hay pesos GGUF ni cuantizaciones publicadas, y no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI. Desplegarlo en produccion exigiria validar y probablemente adaptar la implementacion.
- Licencia del modelo y del dato: los pesos son Apache 2.0, pero el corpus de preentrenamiento declarado (wikimedia/wikipedia) esta bajo CC BY-SA 4.0, lo que puede introducir obligaciones de atribucion o de compartir igual en determinados usos derivados. Conviene revisarlo con asesoria legal antes de un uso comercial.
- Adopcion muy baja: 28 descargas y 0 likes en HuggingFace, sin validacion independiente de la comunidad ni de terceros.
- Sin datos de reproducibilidad: no se publica numero de tokens de entrenamiento, composicion del dataset, hiperparametros ni detalles del proceso de preentrenamiento, lo que dificulta replicar o auditar los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vi-LAB/KenT_0.5B_Base
- Dataset de preentrenamiento declarado: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset de evaluacion declarado: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Resultados de MMLU-Pro declarados por el autor: benchmarks/mmlu_pro_results.json (dentro del repositorio del modelo)
- No se han encontrado enlaces relevantes (papers, blogs, repositorios de codigo o demos) en la busqueda web realizada; los resultados obtenidos corresponden al editor de texto vi, a la operadora Vodafone Idea y a publicaciones deportivas, sin relacion con el modelo. No se dispone de paper tecnico, blog de Vi-LAB ni repositorio de codigo publicados.

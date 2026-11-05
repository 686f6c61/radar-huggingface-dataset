# TYTTYTTYT/llama-pixar-116m-p8-stage2

## Resumen

MIXAR 113M (8x8 patches), stage 2, es un modelo de lenguaje multilingue que opera directamente sobre pixeles renderizados en lugar de tokens. Lo desarrolla el usuario TYTTYTTYT sobre el codigo de april-tools, y parte del backbone stage-1 `llama-pixar-116m-p8` (113M parametros, parches de 8x8 pixeles) al que se le aplica una etapa corta de aprendizaje por refuerzo con GRPO para convertirlo en un generador libre mucho mas robusto. La relevancia actual es clara: es una prueba de concepto abierta de "pixel language model" sin tokenizador, un paradigma que elimina el vocabulario discreto y el sesgo de tokenizacion a cambio de modelar la imagen del texto.

Arquitectura transformer tipo Llama de 12 capas, hidden 768, 12 cabezas y MLP de 3072, con 113.462.016 parametros reales segun safetensors. Lee y escribe texto en pixeles binarios de un canal, organizados en parches de 8x8 y dos parches por bloque. El contexto llega a 1.024 bloques, aunque el entrenamiento se hizo con ventanas de 180 bloques. Los pesos se publican en safetensors con licencia Apache 2.0 y codigo custom (`trust_remote_code`).

El modelo no compite en capacidad general con LLMs convencionales de su tamano: sus puntuaciones en generacion libre son bajas (LAMBADA 10,4 de media en cinco idiomas). Su interes es de investigacion y experimentacion: demuestra que un modelo pequeno puede aprender a generar texto legible en pixeles y sirve como base para fine-tuning de clasificacion y para estudiar alternativas tokenizer-free.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (12 capas, hidden 768, 12 cabezas, MLP 3072), pixel language model sin tokenizador |
| Parametros totales | 113.462.016 (113M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1.024 bloques (entrenado con ventanas de 180 bloques) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | de, en, es, fr, it, ja, ko, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo custom (`modeling_llama_pixar.py`) |

## Arquitectura y entrenamiento

La entrada y la salida son pixeles binarios de un solo canal: el texto se renderiza con una fuente y unas opciones concretas incluidas en `render_config/`, se divide en parches de 8x8 y se agrupa en bloques de dos parches. El objetivo de preentrenamiento es una entropia cruzada binaria por pixel para predecir el siguiente bloque, no una clasificacion sobre vocabulario. El preentrenamiento usa mC4 en ocho idiomas con muestreo uniforme del corpus agrupado (es 0,243; de 0,207; fr 0,171; ja 0,127; en 0,126; it 0,088; zh 0,024; ko 0,015), 1M de pasos, batch global 384, AdamW (0,9, 0,95), weight decay 0,1, LR 3e-4 con coseno hasta 3e-5 y 2k de warmup. Los documentos se empaquetan en secuencias de 180 bloques con separadores EOS y mascaras de atencion por documento. El coste de preentrenamiento fue de unas 29 horas en 4 GPU H200.

La etapa 2, que es la que se publica aqui, aplica GRPO sobre un checkpoint inicial de 50k pasos. El generador muestrea grupos de 8 continuaciones de 3 bloques a partir de inicios de palabra en texto de mC4, y cada continuacion recibe una recompensa combinada: `r = 0,5 · σ(D) + 0,5 · (0,7 · tile match + 0,3 · pixel match)`, donde D es un discriminador de realismo. La perdida suma el objetivo PPO recortado (peso 26), una penalizacion KL contra el modelo stage-1 (peso 0,02) y la perdida de reconstruccion de stage-1 (peso 0,1). Generador y discriminador se entrenan en fases alternas condicionadas por la precision suavizada del discriminador. Hiperparametros: batch 128, micro-batch 32, LR constante 1e-5, 2.000 pasos por generacion, tamano de grupo 8 y separacion entre palabras de 3 px. Los pesos liberados son la media de igual peso de los tres checkpoints pico de la ejecucion campeona.

## Capacidades

- Generacion de texto libre en pixeles: produce continuaciones renderizadas como imagen, sin tokenizador intermedio.
- Prediccion de la siguiente palabra en LAMBADA y tareas de razonamiento sencillo tipo bAbI (task 1) en generacion libre.
- Clasificacion de secuencias mediante fine-tuning: el repo expone `LlamaPixarForSequenceClassification` para tareas como SIB-200 y XNLI.
- Multilingue en ocho idiomas (de, en, es, fr, it, ja, ko, zh) con el mismo espacio de pixeles.
- Generalizacion a idiomas no vistos en preentrenamiento a traves de fine-tuning (SIB-200 unseen, XNLI unseen).
- Generacion con cache KV y decodificacion bloque a bloque condicionada por un umbral de "bloque en blanco" como EOS.
- No dispone de tool calling, function calling, capacidades de agente, vision natural, audio ni modo thinking; la entrada visual es texto renderizado, no imagenes arbitrarias.

## Casos de uso

- Investigacion en modelos sin tokenizador: sirve como base reproducible para estudiar si un modelo de pixeles puede competir con modelos de tokens en tareas controladas, con recetas y checkpoints publicos.
- Clasificacion de texto multilingue por fine-tuning: cargando `LlamaPixarForSequenceClassification` se puede ajustar para tareas tipo XNLI o SIB-200 en ocho idiomas, aprovechando que el renderizado es identico entre lenguas.
- Experimentos de robustez tipografica: al operar sobre pixeles, se puede variar fuente, tamano y separacion (siempre que se respete `render_config/`) para medir sensibilidad al rendering, algo imposible con un tokenizador fijo.
- Docencia y divulgacion: un modelo de 113M que cabe en una GPU de consumo y genera texto visible como imagen es un recurso didactico para explicar attention, KV cache y RLHF/GRPO sin abstracciones de vocabulario.
- Pruebas de pipelines de RL para generacion estructurada: la receta GRPO con recompensa compuesta (discriminador + match de tiles y pixeles) es reutilizable para otros dominios de salida estructurada.
- Generacion de texto en entornos con restricciones de tokenizacion: casos donde el texto de entrada ya existe como imagen (capturas, documentos escaneados renderizados) y se quiere continuar el contenido sin pasar por un tokenizer.
- Baseline para comparativas de eficiencia: con 113M parametros y contexto de 1.024 bloques, sirve como referencia de coste/calidad frente a modelos de tokens del mismo tamano en tareas acotadas.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| bAbI task 1, ingles, generacion libre (3 shots) | 15,6 |
| LAMBADA, generacion libre, media de 5 idiomas | 10,4 (en 8,8 / de 9,8 / es 12,4 / fr 9,6 / it 11,4) |
| SIB-200, 22 idiomas (macro-F1) | seen 70,3 / unseen 28,2 / unseen low-resource 22,8 |
| XNLI, 10 idiomas (accuracy, translate-train) | seen 70,4 / unseen 61,9 |
| GLUE (media de tareas) | 71,6 |

Las puntuaciones de generacion libre son precisiones juzgadas por un OCR Qwen3.6-35B-A3B con atajo pixel-exact. SIB-200 y XNLI se ajustan por idioma; SIB-200 tiene 8 idiomas vistos en preentrenamiento y 14 no vistos, incluido un subconjunto de bajos recursos. No se dispone de comparaciones directas con modelos de tokens en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 113M parametros; en fp32 ocupa aproximadamente 0,45 GB de pesos, en fp16/bf16 unos 0,23 GB. Sumando activaciones y cache KV para contexto largo, es holgado en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna; el autor entreno en 4 H200, pero la inferencia no requiere hardware de datacenter. Una RTX 4090, RTX 3090, A100 o H100 funcionan sin problema; tambien una GPU de consumo modesta tipo RTX 3060.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas actuales con al menos 4 GB de VRAM.
- Opciones de despliegue: el modelo requiere `transformers==4.57.3`, `pixar-render==0.5.1` y `trust_remote_code=True`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que la entrada y salida son pixeles y no tokens.
- Latencia y throughput: no disponible. La generacion es bloque a bloque con cache KV, lo que implica muchas pasos de decodificacion para textos largos; el coste depende del ancho de bloque y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIXAR 113M stage 2 (este) | 113M | 1.024 bloques | Pixel language model sin tokenizador, GRPO stage 2 | Apache 2.0 | HuggingFace |
| llama-pixar-116m-p8 (stage 1) | 113M | 1.024 bloques | Mismo backbone sin etapa RL | Apache 2.0 | HuggingFace |
| LLMs de tokens de ~100-150M (p. ej. variantes tipo Llama pequenas) | ~100-150M | variable | Transformer con tokenizador BPE | variable | HuggingFace |

No se dispone de datos de benchmarks comparativos directos entre MIXAR y modelos de tokens del mismo tamano en la informacion proporcionada. La comparacion relevante es interna: el stage 2 mejora la generacion libre respecto al stage 1, segun indica el autor, aunque no se aportan cifras del stage 1 en la informacion disponible.

## Limitaciones y advertencias

- Rendimiento bajo en generacion libre: LAMBADA 10,4 de media y bAbI task 1 15,6 indican que el modelo no es fiable para producir texto correcto de forma autonoma.
- Fuerte caida en idiomas no vistos: SIB-200 unseen 28,2 y unseen low-resource 22,8 frente a 70,3 en vistos; el multilingue real esta limitado a los ocho idiomas de preentrenamiento.
- Dependencia estricta del rendering: hay que usar `render_config/` con las fuentes y ajustes exactos; cambiar fuente, tamano o separacion degrada la calidad de forma no documentada.
- Riesgo de alucinacion y de texto ilegible: al generar pixeles, los errores se manifiestan como trazos deformados o palabras inexistentes, no solo como contenido falso.
- Sin soporte de tool calling, agentes ni vision natural; no es adecuado para pipelines de produccion que esperen texto tokenizado o APIs de function calling.
- Licencia Apache 2.0 permite uso comercial, pero el codigo custom (`trust_remote_code=True`) debe auditarse antes de desplegarlo en produccion.
- Requiere versiones concretas de `transformers` y `pixar-render`; la compatibilidad con versiones futuras no esta garantizada.
- Los benchmarks de generacion libre se evaluan con un juez OCR externo, lo que introduce dependencia del juez y posible ruido en las metricas.
- No hay informacion sobre sesgos especificos ni sobre filtrado de datos de mC4; se heredan los sesgos del corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8-stage2
- Modelo stage 1: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8
- Codigo: https://github.com/april-tools/mixar
- Paper: https://arxiv.org/abs/2604.11575

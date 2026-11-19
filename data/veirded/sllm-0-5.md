# Veirded/SLLM-0.5

## Resumen

SLLM-0.5 (publicado en la model card como SLLM-Nova) es un modelo de lenguaje causal experimental desarrollado desde cero por Veirded en PyTorch. Se trata de un modelo decoder-only de aproximadamente 2,8 millones de parametros, disenado para explorar cuanto conocimiento linguistico y estructura conversacional se puede comprimir en un presupuesto de parametros extremadamente reducido. Su ventana de contexto es de solo 256 tokens y esta entrenado exclusivamente en ingles.

El modelo incorpora varias primitivas modernas propias de LLM de mayor escala (RoPE, SwiGLU, RMSNorm) junto con dos innovaciones arquitectonicas propias del autor: una compuerta dinamica de contexto (Dynamic Context Gate, DCG) sobre los residuos de atencion y FFN, y un bypass semantico directo (Fast-Highway Semantic Skip, FHSS) que conecta los embeddings de entrada con la normalizacion de salida. El tokenizador es tambien propio (SLLM-T), con un vocabulario de 9.385 tokens que cubre el 100% del corpus de entrenamiento sin tokens desconocidos.

Su relevancia es fundamentalmente de investigacion: sirve como banco de pruebas para estudiar representacion, destilacion y despliegue en entornos embebidos con menos de 50 MB de memoria. No es un modelo apto para produccion general, recuperacion factual fiable ni razonamiento complejo, y el autor lo posiciona explicitamente como checkpoint base pre-entrenado para fine-tuning posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (SLLM-Nova) con RoPE, SwiGLU, RMSNorm, DCG y FHSS |
| Parametros totales | ~2,8 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; el autor menciona despliegue en menos de 50 MB sin detallar formatos) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`sllm_nova.pt`) y tokenizador en JSON (`tokenizer_sllm_t.json`) |

Detalles adicionales de la arquitectura: dimension de embedding (d_model) de 112, 4 cabezas de atencion (dimension por cabeza de 28), 4 capas, dimension oculta SwiGLU de 298 y vocabulario de 9.385 tokens.

## Arquitectura y entrenamiento

SLLM-Nova es un transformer causal autoregresivo de 4 capas y 4 cabezas de atencion con d_model de 112. Usa RoPE para codificar posiciones relativas, activaciones SwiGLU en las capas feed-forward y RMSNorm para la normalizacion. Sobre esa base, el autor introduce dos componentes propios: la Dynamic Context Gate (DCG), una compuerta sigmoide aprendible sobre los residuos de atencion y FFN que filtra ruido temprano y acelera la convergencia, y el Fast-Highway Semantic Skip (FHSS), un bypass parametrico directo desde los embeddings de entrada hasta el flujo de normalizacion de salida para mitigar la dilucion semantica en redes muy poco profundas. El tokenizador SLLM-T es de vocabulario propio y cubre el 100% del corpus sin tokens `<unk>`.

El entrenamiento se realizo sobre un corpus curado de conversaciones multiturno con mas de 4.400 intercambios de dialogo natural sobre temas cotidianos. Se uso el optimizador AdamW (beta1=0,9, beta2=0,999, weight decay=0,01), tasa de aprendizaje de 2,0e-3 con decaimiento por cosine annealing hasta 1,0e-4, batch size de 24, contexto de 256 tokens, clipping de gradiente con norma maxima 1,0 y precision FP32 sobre Apple Silicon MPS (M2, 8 GB de memoria unificada), con un pico de RAM de entrenamiento de aproximadamente 1,4 GB. No se documenta el numero total de tokens procesados ni el uso de RLHF o DPO en el checkpoint base.

## Capacidades

- Generacion de texto autoregresiva y finalizacion de prompts en ingles.
- Conversacion basica multiturno (el corpus de entrenamiento es de dialogo cotidiano).
- Exploracion de representaciones linguisticas en modelos de menos de 5 millones de parametros.
- Base para fine-tuning supervisado (SFT) y experimentos de RLHF/DPO posteriores.
- Adaptacion a tareas especificas como clasificacion o enrutamiento de agentes en el borde.
- Inferencia en entornos embebidos: Raspberry Pi, moviles, microcontroladores o navegador, con menos de 50 MB de memoria.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, vision, audio ni modo de razonamiento explicito documentados.

## Casos de uso

- Investigacion sobre eficiencia de parametros: comparar la densidad de conocimiento de un modelo de 2,8 M de parametros frente a arquitecturas clasicas de tamano similar, usando el checkpoint como referencia reproducible en experimentos academicos.
- Entrenamiento de modelos de juguete en docencia: el modelo cabe en 1,4 GB de RAM durante el entrenamiento y se entrena en un portatil con Apple Silicon, lo que lo hace adecuado para cursos de NLP que quieran mostrar el ciclo completo de pre-entrenamiento.
- Despliegue en microcontroladores y dispositivos de borde: con menos de 50 MB de memoria, puede ejecutar generacion de texto corta en Raspberry Pi o navegador para demos de interfaz conversacional sin backend.
- Base para destilacion: usar SLLM-0.5 como alumno o como referencia en pipelines de destilacion de conocimiento desde modelos mayores, aprovechando su licencia MIT y su bajo coste computacional.
- Fine-tuning para dominios acotados: adaptar el modelo con SFT a tareas de clasificacion de texto corto o respuestas de plantilla en dominios muy restringidos (por ejemplo, respuestas frecuentes de soporte), donde 256 tokens de contexto sean suficientes.
- Enrutamiento de agentes en el borde: entrenar una cabeza de clasificacion sobre las representaciones del modelo para decidir que herramienta o flujo activar en un sistema multi-agente, dado su bajo coste de inferencia.
- Benchmarking de arquitecturas: evaluar el impacto de DCG y FHSS frente a un transformer vanilla equivalente, sirviendo el checkpoint como linea base publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 50 MB segun el autor; en FP32 los pesos de 2,8 M de parametros ocupan aproximadamente 11 MB, mas el tokenizador y buffers de activacion.
- GPU recomendadas: no requiere GPU dedicada; el autor entrena e infiere en Apple Silicon M2 (8 GB de memoria unificada) mediante MPS. Cualquier GPU consumer moderna (RTX 3060 o superior) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer, e incluso en CPU, Raspberry Pi, moviles y navegador.
- Opciones de despliegue: el autor solo documenta carga directa en PyTorch (`torch.load` + `load_state_dict`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato de pesos `.pt` y la arquitectura personalizada requeririan conversion y definicion del modelo para esos runners.
- Latencia y throughput estimados: no disponibles. Con 4 capas y 2,8 M de parametros, la latencia esperada es de milisegundos por token en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SLLM-0.5 (Veirded) | ~2,8 M | 256 | MIT | Hugging Face (0 descargas) | Checkpoint base experimental, solo ingles |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 | Apache 2.0 | Hugging Face | Modelo pequeno consolidado con benchmarks publicados |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT | Hugging Face | Referencia historica de modelo pequeno |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | Hugging Face | Escala muy superior, no directamente comparable |

La comparacion con modelos de 100 M o mas parametros no es homogenea: SLLM-0.5 es dos ordenes de magnitud menor. No se dispone de datos de rendimiento de SLLM-0.5 que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- No apto para recuperacion factual, demostraciones matematicas ni logica multi-paso; el propio autor lo declara fuera de alcance.
- Riesgo elevado de alucinacion y de respuestas incoherentes fuera de los temas del corpus de dialogo cotidiano.
- Ventana de contexto de solo 256 tokens, insuficiente para documentos, codigo o conversaciones largas.
- Entrenado exclusivamente en ingles; no hay soporte multilingue documentado.
- Corpus de entrenamiento limitado (4.400+ intercambios), lo que reduce la diversidad y aumenta el sesgo hacia los temas y estilos presentes en el.
- No debe desplegarse en entornos criticos, medicos, legales o de seguridad sin alineamiento posterior.
- Aunque la licencia MIT permite uso comercial, la calidad del modelo hace inviable su uso en produccion sin fine-tuning especifico.
- El formato de pesos `.pt` y la arquitectura personalizada exigen cargar la definicion del modelo (`SLLMNova`), que no se distribuye como paquete instalable en la informacion disponible.
- Modelo con 0 descargas y 0 likes en Hugging Face en el momento de la consulta: no hay validacion comunitaria ni reportes de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Veirded/SLLM-0.5
- Repositorio del proyecto SLLM (referenciado en la cita): https://huggingface.co/Veirded/SLLM
- No se han encontrado papers, blogs, repos de codigo ni demos adicionales en la informacion disponible.

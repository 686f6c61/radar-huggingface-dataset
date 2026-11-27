# ufzoo/dreamling

## Resumen

Dreamling 1 es un modelo de lenguaje de tipo GPT entrenado desde cero por el desarrollador independiente ufzoo sobre una unica GPU AMD Radeon RX 7900 XTX. Se publica en dos variantes: un modelo base y una version ajustada para conversacion (chat), ambas derivadas de un entrenamiento continuado sobre el corpus `KeremTT/OPUS-5.5-DATABASE`. Con 559,7 millones de parametros totales segun los pesos en safetensors (517,8M segun la model card), 24 capas, anchura 1280 y una ventana de contexto de 65.536 tokens, es un ejercicio de entrenamiento reproducible en hardware de consumo mas que un modelo orientado a produccion.

Su relevancia es fundamentalmente metodologica: demuestra que es posible entrenar y publicar un transformer completo con RoPE, SwiGLU, RMSNorm y embeddings atados partiendo de cero en una sola GPU consumer, y ofrece los pesos en multiples formatos (PyTorch nativo, safetensors con layout Llama y GGUF F16/Q8_0). El autor reconoce explicitamente que el modelo esta fuertemente infraentrenado para su tamano y que sus capacidades de hechos, razonamiento, codigo y recuperacion en contexto largo no son fiables.

La ficha se basa unicamente en la informacion publicada en el repositorio de Hugging Face. No se han publicado resultados de benchmarks ni metricas de evaluacion estandar, por lo que las secciones correspondientes lo indican de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (layout compatible con Llama en safetensors) |
| Parametros totales | 559.740.160 (safetensors); 517,8M totales / 475,9M sin embeddings segun model card |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens (entrenado a 8k en pretraining continuado y 2k en SFT) |
| Tipos de cuantizacion | F16 y Q8_0 en GGUF; safetensors en precision de entrenamiento |
| Idiomas soportados | Ingles (en), turco (tr) y multilingue |
| Licencia | MIT (pesos y configuracion) |
| Formato de pesos | `.pt` (PyTorch custom), `.safetensors` (layout Llama HF), `.gguf` (F16 y Q8_0) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 24 capas, anchura de 1280 y 10 cabezas de atencion con dimension de cabeza 128. Usa SwiGLU en la capa feed-forward con dimension oculta 3456, RMSNorm como normalizacion, RoPE con theta 1.000.000 para las posiciones y embeddings atados entre entrada y salida. El vocabulario es un BPE byte-level de 32.768 tokens con `<|endoftext|>` como id 0.

El entrenamiento parte de un checkpoint inicial de Dreamling 1 entrenado sobre un corpus propio de 1.540 millones de tokens (Wikipedia, Gutenberg, codigo y TinyStories) con contexto de 64k y fuentes con licencias permisivas (Apache-2.0, MIT, CC-BY-4.0, ODC-By). Sobre esa base se realizo un entrenamiento continuado de 25,0 millones de tokens del split `pretrain` de `KeremTT/OPUS-5.5-DATABASE` durante 1.500 pasos a contexto de 8k, alcanzando una perdida de validacion de 4,3137. Posteriormente se aplico un SFT de chat sobre 12,27 millones de tokens formateados como conversaciones System/User/Assistant, durante 749 pasos a contexto de 2k, con perdida de validacion de 2,8037. No se menciona RLHF, DPO ni ninguna tecnica de alineacion adicional.

## Capacidades

- Generacion de texto autoregresiva en ingles, turco y otros idiomas del corpus multilingue.
- Conversacion multi-turno con formato System/User/Assistant aprendido durante el SFT.
- Manejo de contextos de hasta 65.536 tokens a nivel arquitectonico, aunque el autor advierte que la recuperacion en contexto largo no es fiable.
- Generacion de codigo basica, derivada de la presencia de codigo en el corpus inicial.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Experimentacion e investigacion en entrenamiento desde cero: el modelo sirve como referencia reproducible de un pipeline completo (pretraining, entrenamiento continuado, SFT de chat) ejecutado en una sola GPU consumer, con pesos en tres formatos distintos.
- Prototipado de interfaces conversacionales de bajo coste: la variante chat puede gestionar dialogos multi-turno simples en ingles o turco para demos y pruebas de concepto, siempre que no se requiera precision factual.
- Generacion de texto creativo breve: cuentos, descripciones y textos de relleno, aprovechando el corpus TinyStories y Gutenberg del entrenamiento inicial.
- Pruebas de integracion con llama.cpp: los GGUF F16 y Q8_0 permiten validar pipelines de inferencia local, cuantizacion y carga con el pre-tokenizer `gpt-2` en entornos de desarrollo.
- Evaluacion comparativa de tecnicas de SFT: el par base/chat permite medir el efecto del ajuste conversacional sobre un mismo checkpoint con perdidas de validacion documentadas (4,3137 frente a 2,8037).
- Educacion y docencia: ilustrar la diferencia entre un modelo infraentrenado y uno alineado, asi como el impacto del tamano del corpus y del contexto de entrenamiento en las capacidades emergentes.
- Fine-tuning experimental: al estar bajo licencia MIT y en formato safetensors compatible con Llama, puede usarse como base para ajustes posteriores en tareas concretas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta perdidas de validacion del entrenamiento: 4,3137 para el pretraining continuado y 2,8037 para el SFT de chat. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 1,1 GB para los pesos (559,7M parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe holgadamente en cualquier GPU con 4 GB o mas.
- VRAM estimada en Q8_0: aproximadamente 0,6 GB para los pesos, con margen adicional para contexto y activaciones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU para los GGUF; el entrenamiento original se realizo en una AMD Radeon RX 7900 XTX.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM, y tambien en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp / llama-cli para los GGUF; implementaciones compatibles con Llama para los safetensors (vLLM, TGI y transformers con configuracion Llama); los `.pt` requieren la implementacion custom de Dreamling, que no se incluye en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Dreamling 1 | 559,7M | 65.536 | MIT | safetensors, GGUF, .pt | Entrenado desde cero en una GPU; infraentrenado segun el autor |
| Qwen2.5-0.5B | 0,5B | 32.768 | Apache-2.0 | safetensors, GGUF | Modelo alineado con benchmarks publicos; comparacion por tamano |
| SmolLM2-360M | 360M | 8.192 | Apache-2.0 | safetensors, GGUF | Entrenado sobre corpus curado; comparacion por tamano |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache-2.0 | safetensors, GGUF | Mayor numero de parametros y de tokens de entrenamiento |

La comparacion es orientativa por categoria de tamano; no se dispone de resultados de benchmarks de Dreamling 1 que permitan una comparacion cuantitativa de rendimiento con estas alternativas.

## Limitaciones y advertencias

- Modelo fuertemente infraentrenado para su tamano, segun reconoce el propio autor: los hechos, el razonamiento, el codigo y la recuperacion en contexto largo no son fiables.
- No ha recibido RLHF ni ajuste de seguridad, por lo que puede generar contenido inapropiado o sesgado sin filtros.
- Riesgo elevado de alucinacion en preguntas factuales, especialmente fuera de los dominios del corpus de entrenamiento (Wikipedia, Gutenberg, codigo, TinyStories, OPUS-5.5-DATABASE).
- Aunque la arquitectura soporta 65.536 tokens, el entrenamiento se realizo a 8k (pretraining) y 2k (SFT), por lo que el rendimiento real mas alla de esos limites no esta garantizado.
- Cobertura linguistica limitada: ingles y turco son los idiomas declarados; el soporte multilingue adicional no esta evaluado.
- Los archivos `.pt` requieren una implementacion custom no incluida en el repositorio; solo los safetensors (layout Llama) y los GGUF son directamente utilizables con herramientas estandar.
- Los GGUF cargan con el pre-tokenizer `gpt-2` de llama.cpp, lo que puede requerir configuracion manual en algunos entornos.
- Sin datos de benchmarks publicos que permitan validar su calidad frente a alternativas.
- Licencia MIT permisiva para uso comercial, pero sin garantias de calidad ni de idoneidad para produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ufzoo/dreamling
- Corpus de entrenamiento continuado: https://huggingface.co/datasets/KeremTT/OPUS-5.5-DATABASE
- llama.cpp (carga de los GGUF): https://github.com/ggml-org/llama.cpp

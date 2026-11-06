# Tom2701/R-08-Transformer-Baseline

## Resumen

R-08 Transformer Baseline es un modelo de lenguaje causal (decoder-only) estilo GPT-2 con aproximadamente 45 millones de parámetros, desarrollado por Thomas Seri (usuario Tom2701 en Hugging Face, proyecto Sentinel LifeOS). No es un modelo de propósito general: se trata de un modelo de control científico, entrenado específicamente para realizar un estudio comparativo A/B contra la familia de arquitecturas geodéticas Sentinel R-08 (versiones v7 Pyramid y v7.2), manteniendo igualdad de datos, vocabulario, contexto y número de parámetros.

El modelo emplea un transformer denso de 14 capas de atención causal con Pre-LayerNorm y weight tying, un vocabulario subword muy reducido de 1.251 piezas y una ventana de contexto de 256 tokens. Fue preentrenado con 740 millones de tokens del dataset `v22_chinchilla_mix`, siguiendo una ratio óptima tipo Chinchilla para su tamaño, con 185.000 pasos de preentrenamiento y 10.000 pasos de midtraining.

Su relevancia es principalmente metodológica: permite evaluar de forma reproducible si la arquitectura geodética Sentinel R-08 (con solo 2 capas de atención densa) puede competir con un transformer convencional en tareas gramaticales y de generación en italiano, con menor consumo energético y menor huella de memoria KV-cache. Los pesos se distribuyen en safetensors y GGUF bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (estilo GPT-2), Pre-LayerNorm, weight tying |
| Parametros totales | 45.546.496 (segun safetensors); 44.896.256 parametros unicos (~44,9M) segun la model card |
| Parametros activos | no disponible (arquitectura densa, todos los parametros activos) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en FP original; GGUF disponible, variantes no especificadas) |
| Idiomas soportados | Italiano (principalmente; entrenado con dataset mixto `v22_chinchilla_mix`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (con codigo personalizado, `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only convencional y denso, con 14 capas de atencion causal completa token a token, dimension del modelo de 512, 8 cabezas de atencion, Pre-LayerNorm y weight tying entre la capa de embedding y la de salida. El vocabulario de 1.251 piezas subword es identico al de los modelos Sentinel R-08 con los que se compara, lo que garantiza una comparacion justa a igualdad de tokenizacion.

El entrenamiento se realizo sobre el dataset `v22_chinchilla_mix` con 740 millones de tokens, una cantidad alineada con la ratio optima de Chinchilla para un modelo de ~45M de parametros (aproximadamente 20 tokens por parametro). Se ejecutaron 185.000 pasos de preentrenamiento y 10.000 pasos de midtraining, todo sobre hardware Apple Silicon mediante MPS. No se menciona ningun ajuste fino con RLHF ni DPO. El repositorio incluye codigo personalizado (`modeling_transformer.py`) con las clases `TransformerModel` y `TransformerTokenizer`, y ofrece dos checkpoints: el de preentrenamiento (185k pasos, `model_pretrain_185k.safetensors`) y el de midtraining (10k pasos, cargado por defecto).

## Capacidades

- Generacion de texto causal en italiano, con vocabulario subword muy compacto (1.251 piezas).
- Modelado gramatical y sintactico medible: evaluado con BLiMP-IT (85,84% de precision tras midtraining) y MultiBLiMP (86,83%).
- Evaluacion de tasa de verdad zero-shot: 68,8% tras midtraining (4/4 hechos en italiano en la prueba reportada).
- Comparacion A/B reproducible contra arquitecturas alternativas (Sentinel R-08 y R-08 v7.2).
- Ejecucion multiplataforma: Apple Silicon (MPS), GPU CUDA y CPU.
- No incluye capacidades de vision, audio ni modalidades adicionales.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Investigacion en arquitecturas alternativas al transformer: sirve como baseline denso estandarizado para validar si arquitecturas experimentales (como las geodeticas) ofrecen ventajas reales a igualdad de datos y parametros.
- Estudios de eficiencia energetica: la model card reporta 3,3 mJ por token y 5,6 MB de KV-cache a 512 tokens, cifras utiles como referencia en estudios de consumo frente a arquitecturas ligeras.
- Analisis linguistico del italiano: su alto rendimiento en BLiMP-IT (85,84%) lo hace util como sujeto de estudio de la adquisicion gramatical en modelos pequenos.
- Experimentacion educativa en entrenamiento de LLM a escala pequena: con 45M de parametros y 740M de tokens, es viable entrenar y reproducir el experimento completo en hardware de consumo.
- Evaluacion de tokenizadores subword minimos: el vocabulario de 1.251 piezas permite estudiar el impacto de vocabularios extremadamente reducidos en la calidad generativa.
- Pruebas de inferencia local en CPU o Apple Silicon: dada su dimension, puede ejecutarse sin GPU dedicada para prototipado rapido de pipelines de generacion de texto.

## Benchmarks y rendimiento

Datos de laboratorio publicados por el autor en la model card (comparativa A/B con la familia Sentinel R-08):

| Metrica | Sentinel R-08 v7 Pyramid | Sentinel R-08 v7.2 | Baseline (Pretrain 185k) | Baseline (Midtrain 10k) |
|---|---|---|---|---|
| Parametros totales | 44,5M | 51,6M | 44,9M | 44,9M |
| Capas de atencion densa | 2 | 2 | 14 | 14 |
| BLiMP-IT (gramatica) | 80,95% | 82,02% | 82,53% | 85,84% |
| MultiBLiMP (sintaxis) | 73,46% | 73,46% | 85,15% | 86,83% |
| Tasa de verdad zero-shot | 62,5% | 56,2% | 56,2% | 68,8% |
| Throughput de entrenamiento (MPS) | ~10.150 tok/s | ~7.200 tok/s | ~8.650 tok/s | ~8.650 tok/s |
| Consumo energetico por token | 2,3 mJ | 2,4 mJ | 3,3 mJ | 3,3 mJ |
| KV-cache a 512 tokens | 0,8 MB (2,1 MB/seq) | 0,8 MB (2,1 MB/seq) | 5,6 MB (14,7 MB/seq) | 5,6 MB (14,7 MB/seq) |

No se han publicado resultados en benchmarks estandarizados como MMLU, HumanEval o GSM8K, lo cual es coherente con la naturaleza y escala del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~45M de parametros en FP16/FP32, el modelo ocupa aproximadamente 90-180 MB de pesos; la KV-cache anade unos 14,7 MB por secuencia de 512 tokens segun la model card. Cabe con holgura en cualquier GPU moderna o incluso solo en RAM de CPU.
- GPU recomendadas: no se requiere GPU dedicada. La model card indica compatibilidad con Apple Silicon (MPS), GPU CUDA y CPU.
- Consumer GPUs: totalmente viable en GPUs de gama baja o integradas; el entrenamiento original se realizo integramente en Apple Silicon.
- Opciones de despliegue: carga mediante el codigo personalizado del repositorio (`modeling_transformer.py` con `TransformerModel.from_pretrained`). No se documenta soporte verificado para vLLM, TGI, llama.cpp u Ollama, aunque el formato GGUF del repositorio sugiere compatibilidad potencial con backends basados en GGUF.
- Latencia y throughput: el unico dato publicado es el throughput de entrenamiento (~8.650 tok/s en MPS); no hay cifras de latencia de inferencia.

## Comparativa con modelos similares

| Caracteristica | R-08 Transformer Baseline | Sentinel R-08 (v7 Pyramid) | Sentinel R-08 v7.2 |
|---|---|---|---|
| Parametros | 44,9M | 44,5M | 51,6M |
| Arquitectura | Transformer denso GPT-2, 14 capas | Geodetica, 2 capas de atencion | Geodetica, 2 capas + 1D Conv |
| Contexto | 256 tokens | 256 tokens | no disponible |
| BLiMP-IT | 85,84% | 80,95% | 82,02% |
| Consumo energetico | 3,3 mJ/token | 2,3 mJ/token | 2,4 mJ/token |
| Licencia | Apache 2.0 | no disponible | no disponible |
| Disponibilidad | Hugging Face (safetensors, GGUF) | Hugging Face y GitHub | Hugging Face y GitHub |

No se incluyen comparativas con modelos externos (GPT-2 124M, Pythia 70M, TinyLlama, etc.) porque no existen datos publicados que evaluen este modelo en los mismos benchmarks estandarizados.

## Limitaciones y advertencias

- Contexto muy reducido: 256 tokens, insuficiente para tareas que requieran documentos largos o conversaciones extensas.
- Vocabulario extremadamente pequeno (1.251 piezas subword), lo que limita la cobertura lexica y probablemente degrada la generacion fuera del dominio del dataset de entrenamiento.
- Modelo de control cientifico, no un producto: no ha sido alineado con RLHF ni DPO, por lo que puede generar texto incoherente, ofensivo o factualmente incorrecto.
- Riesgo alto de alucinacion: la propia model card reporta tasas de verdad zero-shot de entre 56,2% y 68,8%, insuficientes para cualquier uso factual en produccion.
- Requiere codigo personalizado (`custom_code`), lo que implica ejecutar codigo del autor al cargar el modelo; conviene revisarlo antes de usarlo en entornos sensibles.
- Los benchmarks proceden unicamente de la model card del autor, sin verificacion independiente ni comparacion con evaluaciones estandarizadas de terceros.
- Orientado al italiano: el rendimiento en otros idiomas, incluido el castellano, no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero la escala del modelo (45M) y su proposito experimental lo hacen poco adecuado para aplicaciones comerciales serias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tom2701/R-08-Transformer-Baseline
- Sentinel R-08 (v7 Pyramid) en Hugging Face: https://huggingface.co/Tom2701/R-08
- Sentinel R-08 v7.2 en Hugging Face: https://huggingface.co/Tom2701/R-08-v7.2
- GitHub Sentinel R-08: https://github.com/Thomasseri/R-08
- GitHub Sentinel R-08 v7.2: https://github.com/Thomasseri/R-08-v7.2
- No se han encontrado enlaces a papers, demos ni publicaciones adicionales en la informacion disponible.

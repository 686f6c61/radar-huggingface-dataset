# uctnlp/mzansilm-125m

## Resumen

MzansiLM 125M es un modelo de lenguaje decoder-only de 125.008.384 parametros entrenado desde cero por el grupo UCT NLP (Universidad de Ciudad del Cabo) sobre MzansiText, un corpus abierto de 3.800 millones de tokens que cubre las once lenguas oficiales escritas de Sudafrica. Se publico en LREC 2026 y esta disenado como modelo base para investigacion y ajuste fino en un contexto de recursos linguisticos escasos.

El modelo sigue una arquitectura LlamaForCausalLM con atención GQA (9 cabezas de atencion y 3 cabezas KV, head_dim de 56), 30 capas, hidden size de 512 y una longitud de contexto de 2048 tokens. Incorpora un tokenizador BPE a nivel de byte propio con vocabulario de 65.536 entradas, entrenado especificamente sobre el corpus MzansiText, lo que lo diferencia de los tokenizadores reutilizados de modelos multilingues genericos.

Su relevancia actual radica en que es uno de los pocos modelos abiertos entrenados nativamente para lenguas sudafricanas de bajos recursos (isiNdebele, Sepedi, Setswana, Xitsonga, siSwati, Tshivenda), con licencia Apache 2.0 y pesos en safetensors, lo que facilita su uso comercial y su integracion en pipelines de investigacion. No es un asistente conversacional: es un modelo base pensado para continuacion de texto y ajuste fino posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only LlamaForCausalLM con GQA |
| Parametros totales | 125.008.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion estandar via herramientas externas) |
| Idiomas soportados | af, en, nso, st, ss, tn, ts, ve, xh, zu, nr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,0 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion de consultas agrupadas (GQA): 9 cabezas de atencion y 3 cabezas KV, con head_dim de 56, hidden size de 512 e intermediate size de 1536. Consta de 30 capas, usa RMSNorm con epsilon 1e-5, RoPE con theta 10000.0 y embeddings de palabras atados (tied word embeddings). Durante el entrenamiento se utilizo la implementacion flash_attention_2. La configuracion presenta la particularidad de que hidden_size (512) no es divisible de forma entera por num_attention_heads (9), lo que provoca que los validadores de LlamaConfig en Transformers 5.x rechacen el checkpoint salvo que se registre un parche de compatibilidad (sallm.models.llama_compatibility.register_llama_compatibility()) o se use transformers<5.

El entrenamiento se realizo desde cero sobre MzansiText, un corpus de 3.800 millones de tokens que cubre las once lenguas oficiales escritas de Sudafrica. No se detalla en la informacion disponible la composicion exacta del dataset, el numero exacto de tokens vistos durante el preentrenamiento ni si se aplicaron fases de RLHF o DPO; la model card indica explicitamente que es un modelo base preentrenado y no un asistente instruido. El tokenizador es un BPE a nivel de byte con vocabulario de 65.536, entrenado sobre el mismo corpus, con normalizacion NFD y un post-procesador que envuelve cada secuencia como [BOS] $A [EOS].

## Capacidades

- Generacion de texto por continuacion: modelo base que predice el siguiente token; no responde a instrucciones sin ajuste fino.
- Modelado de lenguaje en once lenguas sudafricanas: afrikaans, ingles, isiNdebele, Sepedi, Sesotho, siSwati, Setswana, Xitsonga, Tshivenda, isiXhosa y isiZulu.
- Base para ajuste fino en tareas discriminativas y generativas: clasificacion, reconocimiento de entidades nombradas, etiquetado POS y generacion de titulares, segun indica la model card.
- Capacidad multilingue limitada al conjunto de lenguas del corpus; no se documenta soporte para otras lenguas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Tokenizador propio con vocabulario de 65.536 entradas optimizado para el corpus MzansiText.

## Casos de uso

- Ajuste fino para clasificacion de texto en lenguas sudafricanas: el modelo sirve como inicializacion para tareas de clasificacion (por ejemplo, analisis de sentimiento o deteccion de idioma) tras un fine-tuning supervisado sobre el corpus objetivo, aprovechando que su tokenizador cubre las once lenguas.
- Reconocimiento de entidades nombradas (NER): ajuste fino sobre datasets anotados en isiZulu, isiXhosa o afrikaans para extraer personas, lugares y organizaciones en textos administrativos o periodisticos.
- Etiquetado morfosintactico (POS tagging): uso como encoder-decoder base para tareas de etiquetado secuencial tras ajuste fino, adecuado por su contexto de 2048 tokens para documentos de longitud media.
- Generacion de titulares y resumenes cortos: ajuste fino para generar titulares periodisticos en lenguas de bajos recursos, donde los modelos multilingues grandes suelen tener tokenizadores ineficientes para estas lenguas.
- Investigacion en linguistica computacional de bajos recursos: evaluacion de tecnicas de preentrenamiento, tokenizacion y transferencia entre lenguas africanas con un modelo de 125M parametros que cabe en una sola GPU consumer.
- Prototipado de asistentes de texto en entornos con recursos limitados: despliegue en CPU o GPU de gama baja para generar continuaciones de texto en aplicaciones educativas o de divulgacion, dado su reducido tamano.
- Experimentacion con tecnicas de cuantizacion y eficiencia: al ser un modelo pequeno con GQA, sirve como banco de pruebas para estudiar el impacto de la cuantizacion en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 250 MB para los pesos (125M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 1 GB para contextos cortos.
- VRAM estimada en cuantizacion INT8: aproximadamente 125 MB para los pesos; en INT4, alrededor de 65 MB, aunque estos valores son estimaciones tecnicas y no estan confirmados en la model card.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia comoda. Para entrenamiento o fine-tuning, se recomienda al menos una RTX 3090/4090 o una A100/H100 para lotes grandes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia con latencia aceptable.
- Opciones de despliegue: transformers (version >=4.52.4 y <5 segun la model card), text-generation-inference (el modelo esta etiquetado como endpoints_compatible), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta oficialmente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MzansiLM 125M | 125M | 2048 | 11 lenguas sudafricanas + en | Apache 2.0 | Hugging Face |
| AfroLM (base) | 111M (aproximado, no confirmado) | no disponible | Lenguas africanas | no disponible | Hugging Face |
| AfroGPT / otros modelos africanos pequenos | no disponible | no disponible | Lenguas africanas | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia. No se confirma la existencia de alternativas directas con el mismo conjunto de lenguas y tamano.

## Limitaciones y advertencias

- Es un modelo base, no un asistente instruido: no sigue instrucciones ni mantiene conversaciones sin ajuste fino previo.
- La calidad varia significativamente entre lenguas: es mayor en afrikaans, ingles, isiZulu, isiXhosa y sesotho, y mucho menor en setswana, sepedi, xitsonga, siswati, tshivenda e isiNdebele, debido al desbalance del corpus.
- El tokenizador normaliza a NFD, por lo que es necesario normalizar las salidas a NFC antes de comparaciones exactas o metricas a nivel de cadena.
- El post-procesador anade [EOS] al final de cada secuencia, lo que requiere eliminar ese token antes de continuar una prompt en generacion.
- Incompatibilidad con Transformers 5.x por la configuracion de head_dim y num_attention_heads; requiere transformers<5 o un parche de compatibilidad.
- Riesgo de alucinacion y de generar texto incoherente en lenguas con pocos datos de entrenamiento.
- Sesgos potenciales derivados del corpus MzansiText, cuya composicion y procedencia no se detallan completamente en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantias de calidad para produccion sin evaluacion previa en la tarea objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/uctnlp/mzansilm-125m
- Paper (LREC 2026, ACL Anthology): https://aclanthology.org/2026.lrec-1.109/
- arXiv: https://arxiv.org/abs/2603.20732
- Dataset MzansiText: https://huggingface.co/datasets/uctnlp/mzansi-text
- Dataset tokenizado: https://huggingface.co/datasets/uctnlp/mzansi-text-tokenized
- Codigo de entrenamiento y evaluacion: https://github.com/Anri-Lombard/sallm
- Coleccion MzansiLM y MzansiText: https://huggingface.co/collections/uctnlp/mzansilm-and-mzansitext-6a6b3de8f1bff1af24030440

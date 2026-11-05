# xxparthparekhxx/pluto-124m-base

## Resumen

Pluto 124M Base es un modelo de lenguaje de 121,2 millones de parámetros entrenado desde cero por xxparthparekhxx sobre 1.000 millones de tokens del corpus educativo FineWeb-Edu. Se trata de un modelo de continuacion de texto (no ajustado para chat) con una ventana de contexto de 1.024 tokens, pensado como experimento reproducible de preentrenamiento de bajo coste: se entrenó en una única GPU RTX 5060 Laptop de 8 GB en unas 10 horas, a unos 26,7k tokens/s.

La arquitectura no es un transformer estándar de `transformers`: incorpora atención con compuerta sigmoidea, QK-norm y un soft-cap logarítmico con tanh sobre los logits, implementado en un fichero `modeling_pluto.py` que requiere `trust_remote_code=True`. El modelo usa tokenizador BPE de GPT-2 ampliado con cuatro tokens de chat (sin usar en esta variante base) y vocabulario de 50.304 entradas.

Su relevancia es principalmente comparativa y educativa: frente a GPT-2 124M, con diez veces menos tokens de entrenamiento, supera al modelo de OpenAI en tareas de conocimiento escolar y científico (ARC-Easy, ARC-Challenge, OpenBookQA), lo que refleja el sesgo educativo de su corpus. No es un modelo apto para producción general: solo habla inglés, no sigue instrucciones y su conocimiento factual es poco fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only pre-norm con RMSNorm; atención GQA (12 cabezas query, 4 cabezas key/value, tamaño de cabeza 64), RoPE (θ=10.000), RMSNorm sobre queries y keys, compuerta de salida sigmoidea; FFN SwiGLU; soft-cap tanh sobre logits a 30 |
| Parametros totales | 121.229.568 (121,2M), embeddings atados con la capa de salida |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 (datos de entrenamiento FineWeb-Edu bajo ODC-By 1.0) |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`; código en `modeling_pluto.py`) |

## Arquitectura y entrenamiento

El modelo es un decoder-only de 12 capas y anchura 768, con pre-norm RMSNorm, atención de consultas agrupadas (GQA) de 12 cabezas query y 4 cabezas key/value de dimensión 64, RoPE con theta 10.000 y normalización RMS sobre queries y keys. La FFN es SwiGLU con tamaño oculto 2.048. La salida aplica un soft-cap tanh a 30 sobre los logits, una técnica de estabilización heredada de Grok/GPT-2 modificado. El vocabulario es el BPE de GPT-2 más 4 tokens de chat (no usados en esta variante), rellenado hasta 50.304.

El entrenamiento usó 1.000 millones de tokens de FineWeb-Edu `sample-10BT`, tokenizados con el BPE de GPT-2, en 1.907 pasos de 524.288 tokens cada uno (512 secuencias de 1.024), en bf16 con `torch.compile`. El optimizador es Muon para las matrices de pesos 2D y AdamW para embeddings y normas; Muon emplea la variante DeepSeek-V4 (ortogonalización Newton–Schulz con actualización reescalada a RMS 0,18, de modo que ambos optimizadores comparten una única tasa de aprendizaje). La tasa de aprendizaje alcanza un pico de 3e-3 con weight decay 0,1, 200 pasos de warmup, fase plana y decaimiento lineal hasta el 10% del pico en el último 25% de los pasos (warmup-stable-decay). El coste total fue de unas 10 horas en una RTX 5060 Laptop de 8 GB.

## Capacidades

- Generacion de texto por continuacion de prompt (completion), no instrucciones.
- Conocimiento escolar y cientifico basico, favorecido por el corpus FineWeb-Edu.
- Razonamiento de sentido comun limitado (HellaSwag 30,2 acc_norm; PIQA 60,3).
- Resolucion de analogias y coherencia local en ventanas cortas (Winogrande 52,3, cerca del azar).
- Vocabulario BPE de GPT-2, compatible con tokenizadores GPT-2 estándar.
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento multi-paso ni de agentes.
- No dispone de vision, audio ni otras modalidades.
- Multilingue: no; solo ingles.
- No dispone de modo thinking explicito.

## Casos de uso

- Experimentacion academica con preentrenamiento de bajo coste: reproducir el pipeline completo (FineWeb-Edu, Muon + AdamW, warmup-stable-decay) en una GPU de portatil para estudiar el efecto de la mezcla de datos y del optimizador en modelos de 100M.
- Generacion de texto de relleno en demos y prototipos: completar frases o parrafos sobre temas educativos con `model.generate` para probar interfaces de inferencia sin coste de API.
- Baseline de comparacion en investigacion: usar sus resultados en lm-evaluation-harness como referencia para nuevos modelos pequenos entrenados con el mismo corpus y receta.
- Filtrado y puntuacion de corpus: calcular perplexity sobre texto educativo (24,6 en validacion in-distribution) como heuristica de calidad o de pertenencia al dominio.
- Pruebas de infraestructura de despliegue: validar pipelines de `transformers` con `trust_remote_code`, serializacion safetensors y compilacion en GPUs consumer antes de escalar a modelos mayores.
- Educacion y divulgacion: ilustrar en cursos o talleres como se entrena un LM desde cero, que mide cada benchmark y por que un corpus educativo mejora ARC pero penaliza LAMBADA.
- Generacion de variantes de texto para data augmentation en tareas de clasificacion de texto educativo en ingles, aceptando la baja fidelidad factual.

## Benchmarks y rendimiento

Evaluacion con lm-evaluation-harness 0.4.13, zero-shot, fp32, comparada con GPT-2 124M (openai-community/gpt2):

| Tarea (metrica) | Pluto base | Pluto chat | GPT-2 124M |
|---|---|---|---|
| HellaSwag (acc_norm) | 30,2 | 31,1 | 31,1 |
| ARC-Easy (acc_norm) | 45,2 | 41,9 | 39,5 |
| ARC-Challenge (acc_norm) | 24,3 | 26,7 | 22,7 |
| OpenBookQA (acc_norm) | 29,4 | 27,2 | 27,2 |
| PIQA (acc_norm) | 60,3 | 59,1 | 62,5 |
| Winogrande (acc) | 52,3 | 51,7 | 51,6 |
| LAMBADA (acc) | 23,3 | 16,8 | 32,6 |

Errores estandar aproximados: ±0,5 en HellaSwag y LAMBADA, ±1 a 1,5 en ARC, PIQA y Winogrande, ±2 en OpenBookQA. En 4M tokens reservados de FineWeb-Edu, la perdida de validacion es 3,203 (perplexity 24,6) para Pluto base frente a 3,274 (perplexity 26,4) para GPT-2; el texto es in-distribution para Pluto, por lo que la comparacion favorece a este.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 0,48 GB solo de pesos (121,2M × 4 bytes), mas activaciones y cache KV; en bf16/fp16, unos 0,24 GB de pesos. Cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el propio entrenamiento se hizo en una RTX 5060 Laptop de 8 GB, por lo que esa GPU es suficiente tambien para inferencia y ajuste fino ligero.
- Cabe en GPU consumer: si, incluidas GTX 1650 4 GB, RTX 3050, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unica via documentada, dado el codigo custom `modeling_pluto.py`); no se documentan pesos GGUF, por lo que llama.cpp y Ollama no estan soportados de forma nativa salvo conversion manual no publicada. vLLM y TGI no tienen soporte documentado para esta arquitectura custom.
- Latencia y throughput: no se publican cifras de inferencia; el unico dato de rendimiento es el del entrenamiento (unos 26,7k tokens/s en una RTX 5060 Laptop).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HellaSwag | ARC-Easy | LAMBADA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Pluto 124M Base | 121,2M | 1.024 | 30,2 | 45,2 | 23,3 | Apache-2.0 | HuggingFace, requiere `trust_remote_code` |
| GPT-2 124M | 124M | 1.024 | 31,1 | 39,5 | 32,6 | MIT (pesos publicados por OpenAI) | HuggingFace, transformers estandar |
| Pluto 124M Chat | 121,2M | 1.024 | 31,1 | 41,9 | 16,8 | Apache-2.0 | HuggingFace, variante chat del mismo autor |

No se dispone en la informacion proporcionada de resultados de otras alternativas de tamano comparable (por ejemplo, modelos de la familia Pythia o SmolLM) para ampliar la comparativa; esos datos figuran como no disponibles.

## Limitaciones y advertencias

- Solo ingles; no soporta castellano ni otros idiomas.
- Ventana de contexto de 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- No sigue instrucciones: es un modelo de continuacion de texto; para uso conversacional existe la variante pluto-124m-chat.
- Entrenado exclusivamente con paginas web educativas, por lo que conoce poco sobre codigo, dialogo u otros dominios.
- Conocimiento factual poco fiable; riesgo alto de alucinacion en preguntas de hechos.
- Rendimiento bajo en tareas que requieren comprension de ficcion o narrativa (LAMBADA 23,3 frente a 32,6 de GPT-2).
- Winogrande cerca del azar (52,3), lo que indica capacidad limitada de resolucion de correferencia.
- Requiere `trust_remote_code=True` para modelo y tokenizador, lo que implica ejecutar codigo del autor; conviene auditar `modeling_pluto.py` antes de usarlo en produccion.
- Licencia Apache-2.0 permite uso comercial, pero los datos FineWeb-Edu estan bajo ODC-By 1.0, con requisitos de atribucion sobre el corpus.
- Sin versiones cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos sin `transformers`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: modelo muy reciente y sin validacion comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xxparthparekhxx/pluto-124m-base
- Variante chat: https://huggingface.co/xxparthparekhxx/pluto-124m-chat
- Perfil del autor en GitHub: https://github.com/xxparthparekhxx
- Dataset de entrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- GPT-2 de referencia: https://huggingface.co/openai-community/gpt2
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness

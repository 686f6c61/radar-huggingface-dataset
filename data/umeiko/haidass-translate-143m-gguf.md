# umeiko/Haidass-Translate-143M-GGUF

## Resumen

Haidass-Translate-143M-GGUF es la edición cuantizada en formato GGUF del modelo DALabCommunity/Haidass-Translate-143M, un traductor bidireccional chino simplificado⇄inglés de 143.071.296 parámetros construido sobre la arquitectura Qwen3. Lo publica el usuario umeiko en Hugging Face bajo licencia Apache 2.0, y su propósito es permitir la inferencia local del modelo original sin necesidad de GPU ni de frameworks de deep learning pesados, manteniendo una calidad prácticamente idéntica a la del modelo en bf16.

El modelo resuelve un problema muy concreto: la traducción automática de alta calidad entre inglés y chino en entornos con recursos limitados. Con solo 188 MB de almacenamiento en su cuantización Q8_0, cabe en cualquier equipo y se ejecuta con llama.cpp, Ollama o LM Studio. La model card reporta una degradación de apenas ±0,8 BLEU respecto al original en bf16 sobre FLORES-200 dev, lo que lo convierte en una opción atractiva para traducción embebida, procesamiento por lotes en CPU y aplicaciones de escritorio.

La relevancia actual del modelo radica en su relación calidad/tamaño: con 143M de parámetros compite con modelos Seq2Seq dedicados de 418M y 600M (M2M-100-418M, NLLB-200-distilled-600M) y con LLMs instruct de 500-600M (Qwen2.5-0.5B-Instruct, Qwen3-0.6B) en el par en→zh, y queda por debajo de estos en zh→en. Es, por tanto, un modelo especializado y muy compacto, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), con bloque `<think></think>` vacío en el formato de prompt |
| Parametros totales | 143.071.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (decoder lineal en Q8_0, embeddings y cabeza de salida en bf16); no se recomienda cuantización de pesos ≤4 bits ni activation-int8 |
| Idiomas soportados | inglés (en) y chino simplificado (zh), bidireccional |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `haidass-translate-143m-q8_0.gguf`, 188 MB); el modelo base original en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3 con 143M de parámetros, especializado mediante ajuste para traducción bidireccional en→zh y zh→en. El prompt de instrucción sigue el formato ChatML de Qwen (`<|im_start|>user ... <|im_end|><|im_start|>assistant`) e incluye obligatoriamente un bloque `<think></think>` vacío antes del turno del asistente, indicativo de que el modelo base deriva de un Qwen3 con modo de razonamiento y que fue entrenado con ese bloque vacío. El modelo original se distribuye en bf16 (286 MB); esta edición GGUF se genera con `convert_hf_to_gguf.py` y `llama-quantize --token-embedding-type bf16`.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí documenta una innovación práctica relevante en el proceso de cuantización: mantener el embedding (atado a la cabeza de salida) en bf16 es necesario para preservar la calidad, y todas las capas lineales del decoder se cuantizan a Q8_0. Además advierte de que el modelo presenta valores atípicos en las activaciones que provocan desbordamiento en fp16, por lo que debe ejecutarse siempre con cómputo en bf16 o fp32. La decodificación recomendada es greedy (temperatura 0); con beam search (3-4 haces y ajuste de `length_penalty`) se obtienen las mejores cifras del modelo original.

## Capacidades

- Traducción automática bidireccional inglés⇄chino simplificado, con instrucciones explícitas en el prompt ("Translate the following text from English to Simplified Chinese." / "请将以下简体中文翻译成英文。").
- Generación de texto condicionada por instrucción en formato ChatML.
- Ejecución local en CPU mediante llama.cpp, Ollama o LM Studio, sin GPU.
- Compatible con endpoints (`endpoints_compatible` en los tags del repo).
- No dispone de tool calling ni function calling documentados.
- No dispone de capacidades de agente ni de razonamiento multi-paso; el bloque `<think>` debe ir vacío.
- No dispone de visión, audio ni otras modalidades.
- Cobertura multilingüe limitada a en y zh.

## Casos de uso

- Traducción de documentación técnica en→zh y zh→en en pipelines de CI/CD: el modelo se puede invocar desde un script con llama.cpp para traducir ficheros Markdown o cadenas de recursos de forma determinista (temperatura 0), con un coste de almacenamiento de 188 MB.
- Traducción embebida en aplicaciones de escritorio: al caber en cualquier equipo y ejecutarse en CPU, puede integrarse en editores, clientes de correo o herramientas de notas para traducir selecciones de texto sin conexión ni envío de datos a terceros.
- Preprocesado y enriquecimiento de corpus: traducción por lotes de grandes volúmenes de frases en y zh para construir datasets paralelos, aprovechando su bajo coste computacional frente a modelos de 600M-1.8B.
- Atención al cliente bilingüe: traducción en tiempo real de mensajes de usuario entre inglés y chino en sistemas de soporte, con latencia baja al ejecutarse en CPU.
- Localización de contenido web y aplicaciones: traducción de cadenas de interfaz y textos de marketing entre ambos idiomas en entornos con recursos restringidos (Raspberry Pi, contenedores pequeños, dispositivos de borde).
- Filtrado y moderación multilingüe: traducción previa de contenido en chino a inglés para aplicar clasificadores o reglas que solo existen en inglés, o viceversa.
- Prototipado e investigación en traducción automática: modelo de referencia ligero para comparar arquitecturas decoder-only pequeñas frente a Seq2Seq dedicados en el par en⇄zh.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre FLORES-200 dev (997 frases por dirección, sacreBLEU + chrF++):

| Modelo | Parametros | Arquitectura | en→zh BLEU | en→zh chrF++ | zh→en BLEU | zh→en chrF++ |
|---|---|---|---|---|---|---|
| HY-MT1.5-1.8B | 1800M | LLM | 44,65 | 30,98 | 27,68 | 57,96 |
| Qwen3-0.6B | 600M | LLM | 30,94 | 21,10 | 20,21 | 48,62 |
| Haidass-Translate-143M (beam) | 143M | LLM | 30,36 | 21,40 | 20,62 | 46,51 |
| Qwen2.5-0.5B-Instruct | 500M | LLM | 28,96 | 19,65 | 18,09 | 45,85 |
| Haidass-Translate-143M (greedy) | 143M | LLM | 28,32 | 19,49 | 17,72 | 44,32 |
| Haidass-Translate-143M Q8_0 GGUF (este repo) | 143M | LLM | 27,94 | 19,75 | 17,89 | 44,26 |
| M2M-100-418M | 418M | Seq2Seq | 28,04 | 20,53 | 20,58 | 48,79 |
| NLLB-200-distilled-600M | 600M | Seq2Seq | 22,44 | 16,74 | 25,71 | 52,28 |

La cuantización Q8_0 GGUF medida en llama.cpp (CPU, greedy) presenta una diferencia de ±0,8 BLEU respecto al original en bf16, que el autor describe como prácticamente sin pérdida. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 188 MB para el archivo Q8_0; al ejecutarse en CPU no requiere VRAM dedicada. El modelo original en bf16 ocupa 286 MB.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de llama.cpp puede ejecutarlo, pero está pensado para CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU; el límite práctico es la memoria RAM del sistema.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio y cualquier runtime compatible con GGUF y endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.
- Advertencia de ejecución: usar siempre cómputo en bf16/fp32; no aplicar activation-int8 ni cuantización de pesos ≤4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Almacenamiento | en→zh BLEU | zh→en BLEU | Licencia |
|---|---|---|---|---|---|---|
| Haidass-Translate-143M Q8_0 GGUF | 143M | LLM (Qwen3) | 188 MB | 27,94 | 17,89 | Apache 2.0 |
| Qwen3-0.6B | 600M | LLM | ~1,2 GB (bf16) | 30,94 | 20,21 | no disponible en la información |
| Qwen2.5-0.5B-Instruct | 500M | LLM | ~1,0 GB (bf16) | 28,96 | 18,09 | no disponible en la información |
| M2M-100-418M | 418M | Seq2Seq | ~0,9 GB (bf16) | 28,04 | 20,58 | no disponible en la información |
| NLLB-200-distilled-600M | 600M | Seq2Seq | ~1,2 GB (bf16) | 22,44 | 25,71 | no disponible en la información |

Frente a alternativas de mayor tamaño, Haidass-Translate-143M ofrece un en→zh competitivo con Qwen2.5-0.5B-Instruct y M2M-100-418M con una sexta parte del almacenamiento, pero queda claramente por debajo en zh→en, donde NLLB-200-distilled-600M y M2M-100-418M lo superan en BLEU. HY-MT1.5-1.8B es muy superior en ambas direcciones a costa de un tamaño 12 veces mayor.

## Limitaciones y advertencias

- Solo cubre inglés y chino simplificado; no soporta otros idiomas.
- El formato de prompt es estricto: requiere ChatML con bloque `<think></think>` vacío; desviarse de él degrada la salida.
- Presenta desbordamiento en fp16 por valores atípicos en las activaciones; debe ejecutarse en bf16 o fp32.
- No admite cuantización de pesos ≤4 bits ni activation-int8: ambas destruyen la calidad según el autor.
- Riesgo de alucinación y de traducciones inventadas en textos largos o dominios muy especializados; no se documentan evaluaciones fuera de FLORES-200.
- No se especifica la longitud de contexto soportada, lo que limita su uso en documentos extensos sin segmentación previa.
- Rendimiento inferior en zh→en frente a modelos Seq2Seq dedicados de mayor tamaño.
- Licencia Apache 2.0 heredada del modelo original: permite uso comercial, pero se recomienda verificar los términos del modelo base DALabCommunity/Haidass-Translate-143M.
- No dispone de tool calling, agentes ni multimodalidad; no es adecuado como modelo de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/umeiko/Haidass-Translate-143M-GGUF
- Modelo base original: https://huggingface.co/DALabCommunity/Haidass-Translate-143M
- Repositorio de evaluación: https://huggingface.co/datasets/umeiko/Haidass-Translate-143M-eval
- Informe de cuantización: QUANTIZATION_REPORT.md (referenciado en la model card del repo)
- README en chino: README_zh.md (referenciado en la model card del repo)

# VinayRevanuru/Sapling-505M-SFT-GGUF

## Resumen

Sapling-505M-SFT-GGUF es la distribucion en formato GGUF del modelo de chat Sapling-505M-SFT, un modelo de 505.483.776 parametros entrenado desde cero por VinayRevanuru sobre arquitectura Qwen3 densa. El repositorio contiene una unica cuantizacion Q8_0 de 513 MB, pensada para su uso en llama.cpp, Ollama y LM Studio, con la plantilla ChatML embebida en el propio archivo y parada de generacion en el token `<|im_end|>`.

El modelo no es un derivado de ningun checkpoint preentrenado de Qwen: reutiliza la arquitectura, pero el entrenamiento se hizo integramente desde inicializacion aleatoria con 5.000 millones de tokens de preentrenamiento, 1.000 millones de mid-training y 500 millones de tokens de SFT. Su interes es fundamentalmente metodologico y educativo: demuestra un pipeline completo de entrenamiento, tokenizer propio, conversion a GGUF y cuantizacion con verificacion de paridad, documentado con metricas reproducibles.

Es relevante ahora porque el autor publica el modelo como checkpoint de investigacion explicitamente incompleto: supera 3 de las 6 puertas de calidad definidas y falla en identificacion propia, rechazo de peticiones daninas y falsos rechazos. La cuantizacion Q8_0 conserva la perplejidad dentro del 0,1 % respecto a FP32, de modo que las limitaciones no provienen del proceso de conversion, sino del propio modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 densa (transformer decoder-only), 30 capas, ancho 1.024, 16 cabezas de consulta y 8 de KV, embeddings atados (tied embeddings) |
| Parametros totales | 505.483.776 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Q8_0 (8,5 bpw), 513 MB. Conversion BF16 de verificacion realizada pero no subida (965 MB) |
| Idiomas soportados | Ingles (declarado en la model card; el modelo se entreno sin cobertura multilingue documentada) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un unico archivo `Sapling-505M-SFT-Q8_0.gguf`); original en safetensors FP32 |
| Tokenizer | BPE byte-level propio de 32.768 entradas, pre-tokenizer regex ByteLevel de GPT-2, registrado como `gpt-2` |
| Plantilla de chat | ChatML embebida en el GGUF, fin de turno `<|im_end|>` |
| Repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo sigue el diseno de Qwen3 denso: 30 capas de transformer decoder-only con anchura oculta de 1.024, 16 cabezas de atencion de consulta y 8 de clave-valor (GQA con ratio 2:1), dimension de cabeza de 64 y proyecciones de embedding atadas entre entrada y salida. La ventana de contexto es de 2.048 tokens, muy por debajo de los modelos de la familia Qwen3 de tamano comparable. No se documentan innovaciones adicionales como atencion lineal, decodificacion especulativa o capas hibridas.

El entrenamiento se realizo desde cero en tres fases: 5.000 millones de tokens de preentrenamiento, 1.000 millones de mid-training y 500 millones de SFT con formato ChatML estandar. El autor no detalla en la informacion disponible la composicion del dataset, el uso de RLHF o DPO, ni la mezcla de datos de cada fase. El tokenizer es propio, de 32.768 entradas, con paridad token a token verificada frente al tokenizer de Hugging Face en textos con emojis, acentos, LaTeX, tabulaciones y marcadores ChatML. La conversion a GGUF se hizo con `convert_hf_to_gguf.py` de llama.cpp (commit `d854d98`) a BF16 y despues con `llama-quantize` a Q8_0.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML y cierre de turno mediante `<|im_end|>` (98 % de cumplimiento en 50 prompts generales).
- Respuestas coherentes de extension corta a media, con muestreo recomendado a temperatura 0,7 y top-p 0,9.
- Razonamiento basico y respuesta a instrucciones simples derivadas del SFT (500 millones de tokens).
- Inferencia en CPU y en GPUs de gama baja gracias al tamano reducido del checkpoint cuantizado.
- Integracion con la API compatible con OpenAI que expone `llama-server` en el puerto 8080.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Multilingue: no disponible; la model card solo declara ingles.

## Casos de uso

- Prototipado y docencia sobre pipelines de entrenamiento desde cero: sirve para ilustrar las tres fases (preentrenamiento, mid-training, SFT) con un checkpoint reproducible de 505 M de parametros y metricas de perplejidad publicadas.
- Pruebas de regresion de runtimes GGUF: el modelo permite validar conversiones, tokenizers y plantillas de chat en llama.cpp, Ollama y LM Studio con una huella de disco de 513 MB y perplejidad verificada frente a FP32.
- Benchmarks de cuantizacion: al estar documentada la perdida de perplejidad (+0,1 % en Q8_0 sobre WikiText-2), se puede usar como caso de control al comparar nuevas tecnicas de cuantizacion o nuevos formatos.
- Asistente conversacional embebido en dispositivos sin GPU: con 513 MB en Q8_0 y unos 126 MB de cache KV en FP16 para 2.048 tokens, cabe en entornos con menos de 1 GB de RAM disponible para pesos.
- Generacion de texto sintetico de dominio acotado para data augmentation, aceptando supervision humana posterior por la tasa de falsos rechazos del 33 %.
- Evaluacion de filtros de seguridad y alineamiento: sus fallos documentados (63 % de rechazo de peticiones daninas, 33 % de rechazo erroneo de prompts inofensivos) lo convierten en un sujeto de prueba util para clasificadores de moderacion en pipelines de investigacion.
- Entorno de pruebas offline y air-gapped: al no requerir API externa ni conexion, se puede desplegar en laboratorios o quioscos locales para demos de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag) en la informacion disponible. Los unicos datos publicados son la perplejidad en WikiText-2 y las puertas de calidad conversacional.

| Metrica | FP32 original | GGUF BF16 | GGUF Q8_0 | Delta frente a FP32 |
|---|---|---|---|---|
| Perplejidad WikiText-2 (64 ventanas de 1.024 tokens, mitad final) | 23,79 | 23,79 | 23,80 | +0,1 % |
| Tamano del artefacto | 2,0 GB | 965 MB | 513 MB | -75 % |

| Puerta de calidad | FP32 original | GGUF Q8_0 | Umbral exigido | Estado |
|---|---|---|---|---|
| Cierra el turno con `<|im_end|>` (50 prompts) | 98 % | 98 % | >= 95 % | Supera |
| Fuga de rol (role leakage) | 0 | 0 | 0 | Supera |
| Se identifica como Sapling (10 sondas) | 3/10 | 2/10 | >= 9/10 | Falla |
| Rechaza prompts daninos (30) | 73 % | 63 % | >= 80 % | Falla |
| Rechaza erroneamente prompts inofensivos con tono agresivo (30) | 33 % | 33 % | <= 10 % | Falla |

Las respuestas se muestrearon con temperatura 0,7, top-p 0,9 y un maximo de 512 tokens nuevos. Los conjuntos de prompts son pequenos: un solo prompt desplaza la tasa 3,3 puntos porcentuales, y cada runtime usa su propio generador aleatorio, por lo que diferencias de +-10 puntos entre columnas quedan dentro del ruido de muestreo. La perplejidad es la medida precisa de la perdida por cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 640 MB con Q8_0 y contexto de 2.048 tokens, sumando 513 MB de pesos y unos 126 MB de cache KV en FP16 (30 capas x 8 cabezas KV x 64 dimension x 2 x 2.048 tokens). El original en FP32 ocupa 2,0 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien A100, H100 o L4, aunque en esos aceleradores el modelo esta enormemente infrautilizado.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en iGPU y en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-cli -hf VinayRevanuru/Sapling-505M-SFT-GGUF:Q8_0 -cnv`), `llama-server` con API compatible OpenAI en el puerto 8080, Ollama (`ollama run hf.co/VinayRevanuru/Sapling-505M-SFT-GGUF:Q8_0`) y LM Studio. No hay informacion sobre recetas para vLLM o TGI.
- Latencia y throughput: no disponible. El autor solo advierte de que la decodificacion greedy tiende a entrar en bucle y recomienda muestreo con `--temp 0.7 --top-p 0.9`.
- El autor indica que la decodificacion greedy produce repeticiones, lo que obliga a usar muestreo incluso en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| Sapling-505M-SFT-GGUF | 505.483.776 | 2.048 | Apache-2.0 | Si (Q8_0) | Checkpoint de investigacion; falla 3 de 6 puertas de calidad |
| Qwen3-0.6B | ~600 M | no disponible en la informacion suministrada | Apache-2.0 | Si, en el repositorio oficial | Misma familia arquitectonica; parte de pesos preentrenados y con alineamiento completo |
| Qwen2.5-0.5B | ~500 M | no disponible en la informacion suministrada | Apache-2.0 | Si | Generacion anterior de la familia Qwen; alternativa madura en el mismo rango |
| SmolLM2-360M | ~360 M | no disponible en la informacion suministrada | Apache-2.0 | Si | Modelo pequeno con pipeline de datos documentado; menor numero de parametros |

La comparacion cuantitativa de rendimiento no es posible: no hay resultados de benchmarks publicados para Sapling en la informacion disponible, y las alternativas se citan por su rango de parametros y licencia, no por metricas verificadas en esta ficha.

## Limitaciones y advertencias

- Checkpoint de investigacion declarado como tal por el autor: supera solo 3 de las 6 puertas de calidad definidas en la model card.
- Identidad propia deficiente: solo se reconoce como Sapling en 2 de cada 10 sondas (3/10 en FP32), lo que lo inutiliza para cualquier caso que dependa de autodescripcion.
- Seguridad insuficiente: rechaza el 63 % de 30 prompts daninos, por debajo del umbral del 80 %. No debe desplegarse como unica capa de moderacion ni en atencion a usuarios finales sin filtros externos.
- Sobre-rechazo elevado: rechaza el 33 % de prompts inofensivos con tono agresivo, frente al 10 % exigido, lo que degrada la experiencia conversacional.
- Ventana de contexto de solo 2.048 tokens, insuficiente para documentos largos, historiales extensos o recuperacion aumentada con varios fragmentos.
- Solo se declara ingles; no hay cobertura multilingue documentada y no se han evaluado capacidades en castellano.
- Decodificacion greedy inestable: el autor reporta bucles, por lo que requiere muestreo configurado explicitamente.
- Riesgo de alucinacion no medido: no se publican evaluaciones de veracidad, y el modelo no tiene acceso a herramientas ni a conocimiento actualizado.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias y el estado de investigacion hace desaconsejable su uso en produccion sin evaluacion propia.
- Cero descargas y cero likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- La model card no detalla composicion del dataset, filtros de datos ni proceso de alineamiento, lo que impide auditar sesgos de origen.

## Enlaces

- Repositorio GGUF: https://huggingface.co/VinayRevanuru/Sapling-505M-SFT-GGUF
- Modelo original en FP32 (safetensors): https://huggingface.co/VinayRevanuru/Sapling-505M-SFT
- llama.cpp, runtime de referencia citado en la model card (commit de conversion `d854d98`): https://github.com/ggml-org/llama.cpp
- Ollama, runtime alternativo mencionado: https://ollama.com
- Paper, blog, demo o repositorio adicionales: no disponibles en la informacion proporcionada.

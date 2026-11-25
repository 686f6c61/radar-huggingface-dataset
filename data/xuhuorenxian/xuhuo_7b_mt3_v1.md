# XuhuoRenxian/Xuhuo_7b_mt3_v1

## Resumen

Xuhuo_7b_mt3_v1 es un modelo de traducción japonés-chino especializado en localización de videojuegos (RPG Maker y *galgame*), distribuido como GGUF cuantizado en Q6_K. Lo desarrolla el usuario XuhuoRenxian a partir del modelo base tencent/Hy-MT3-7B mediante un ajuste fino con LoRA, fusión de pesos y cuantización posterior. El resultado es un único fichero de 5,74 GB que se carga directamente en llama.cpp sin necesidad de aplicar el adaptador LoRA por separado. Con 7.504.568.320 parámetros (≈7,5 mil millones) y licencia Apache-2.0, resuelve el problema de traducir líneas de diálogo de juegos manteniendo el contexto previo, la terminología consistente y los códigos de control propios de los motores RPG Maker.

La relevancia del modelo no está en la calidad literaria de la traducción, sino en dos métricas concretas: reduce los errores de traducción respecto a su modelo base (27 de 55 textos con error frente a 43 del base) y elimina por completo los residuos de kana en la salida (0,00 por línea, frente a 0,23 del base). Está pensado para un flujo de trabajo con revisión humana posterior, no para publicación directa.

El contexto de entrenamiento es de bloques multilínea con hasta cinco líneas de preámbulo y un glosario de términos; el modelo no incorpora *system prompt* y usa `<|eos|>` como token de parada. La model card declara explícitamente que el modelo es de traducción automática y que cualquier salida debe etiquetarse como tal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de tencent/Hy-MT3-7B); ajuste fino con LoRA sobre proyecciones q, k, v, o |
| Parámetros totales | 7.504.568.320 (≈7,5 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como valor nominal; la configuración de referencia usa `-c 6144` y el entrenamiento se hizo con bloques de varias líneas más ~5 líneas de preámbulo |
| Tipos de cuantización | Q6_K (6,56 BPW, 5,74 GB); el repositorio incluye únicamente la variante Q6_K |
| Idiomas soportados | Japonés (ja) y chino (zh); salida en chino simplificado |
| Licencia | Apache-2.0 (base y pesos fusionados) |
| Formato de pesos | GGUF (llama.cpp); adaptador LoRA PEFT de 209 MB disponible a petición |

## Arquitectura y entrenamiento

El modelo parte de tencent/Hy-MT3-7B, un transformer decoder-only de 7,5 mil millones de parámetros orientado a traducción. Sobre él se aplicó un LoRA con rango 64, alpha 128, dropout 0,05 y actualización de las proyecciones q, k, v y o, lo que supone 54,5 millones de parámetros entrenables (0,72 % del total). El ajuste se realizó durante 14.332 pasos, una época, 10 horas en una única RTX 4090 de 48 GB, con `train_loss` final de 0,7701. Posteriormente se fusionaron los pesos y se cuantizó a Q6_K.

El conjunto de entrenamiento contiene 229.312 pares japonés-chino construidos como «línea + preámbulo + reglas», con una relación 1:1 de respuesta única (sin múltiples traducciones para la misma frase). Los datos provienen de textos de juegos públicos y no se distribuyen con el repositorio. La innovación práctica no es arquitectónica sino de formato: el modelo se entrena para aceptar un bloque de contexto con líneas alternas japonés/chino, un glosario con la forma «original 翻译成 traducción» y el texto a traducir, todo en un único turno sin *system prompt*. La decodificación recomendada es temperature 0,8, top_p 0,8, top_k 40, min_p 0,05 y repetition_penalty 1,05, con límites duros de temperature ≤ 1,4 y top_p entre 0,7 y 0,8 para evitar errores gramaticales y de segmentación.

## Capacidades

- Traducción japonés → chino simplificado de líneas de diálogo de videojuegos, con soporte de entrada en bloques multilínea.
- Uso de preámbulo contextual: las cinco líneas previas mejoran la coherencia de la traducción.
- Respeto de glosarios de terminología incluidos en el prompt (formato «original 翻译成 traducción»).
- Conservación de códigos de control de RPG Maker (`\C[n]`, `\SE[n]`, `\CE[n]`): 96,7 % de orden correcto y 100 % de emparejamiento de «» en la evaluación del autor.
- Eliminación de residuos de kana en la salida (0,00 por línea en la batería de 30 textos).
- Inferencia conversacional de un solo turno vía API compatible con endpoints (`/completion`).
- No soporta *tool calling*, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- No responde a instrucciones de estilo dentro del prompt (sensibilidad a reglas de 0,89-0,93, prácticamente nula); solo el glosario tiene efecto.

## Casos de uso

- Localización de RPG Maker: el modelo traduce bloques de diálogo conservando los códigos `\C[n]` y `\SE[n]`, de modo que el fichero traducido puede reinyectarse en el motor sin romper el formato. Es adecuado porque el 96,7 % de los textos de prueba mantuvieron el orden de los códigos y el 100 % los pares de comillas.
- Traducción de *galgame* con continuidad narrativa: al incluir cinco líneas de preámbulo japonés/chino alternas, el modelo mantiene la coherencia de nombres y registro entre líneas consecutivas de una misma escena.
- Glosarios de franquicia: para sagas con terminología fija (nombres de habilidades, lugares, personajes), se inyecta un glosario en el prompt y el modelo lo respeta; útil en proyectos con memorias de traducción existentes.
- Pretraducción en pipelines de CI: el GGUF se sirve con `llama-server -ngl 99 -c 6144 -np 4` y se consume vía HTTP, lo que permite integrarlo en un script que procese los ficheros de texto del juego y genere una primera versión para revisión.
- Traducción por lotes en hardware de consumo: con 5,74 GB en Q6_K cabe en GPUs de 8-12 GB, lo que permite a equipos pequeños o modders pretraducir un juego completo sin infraestructura de servidor.
- Auditoría de traducciones existentes: el modelo puede compararse contra el texto original para detectar errores; en la evaluación del autor identificó 27 de 55 textos con error, frente a 43 del modelo base.
- Generación de borradores para revisión humana: dado que la model card exige etiquetar la salida como traducción automática, encaja como primer paso de un flujo con editor humano que corrija la tendencia a la traducción literal.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un mismo lote de textos reales de juego.

Evaluación ciega de calidad (25 textos, escala 1-5, candidatos aleatorizados):

| Modelo | Puntuación media |
|---|---|
| v4 (familia MT2, 350.000 pares) | 3,840 |
| v3d10 (familia MT2, 270.000 pares) | 3,720 |
| Hy-MT3-7B base (zero-shot) | 3,720 |
| Xuhuo_7b_mt3_v1 | 3,680 |

El autor indica que las diferencias están dentro del ruido estadístico (t = 0,83 frente a v4; t = 0,15 frente al base).

Auditoría de errores de traducción (55 textos reales):

| Modelo | Textos con error |
|---|---|
| MT2 v4 | 36 / 55 |
| Xuhuo_7b_mt3_v1 | 27 / 55 |
| Hy-MT3-7B base | 43 / 55 |

Fidelidad de formato (30 textos con códigos de control):

| Modelo | Orden de códigos | Kana residual por línea | Pares «» completos | Líneas consistentes |
|---|---|---|---|---|
| MT2 base | 100 % | 0,63 | 96,7 % | — |
| Hy-MT3-7B base | 96,7 % | 0,23 | 96,7 % | 80 % |
| Xuhuo_7b_mt3_v1 | 96,7 % | 0,00 | 100 % | Mejora notable |
| v3d10 / v4 | 100 % | 0,00 | 100 % | 98 % / 100 % |

Juegos de palabras y ambigüedad (16 casos con preámbulo):

| Modelo | Tasa de acierto |
|---|---|
| Xuhuo_7b_mt3_v1 | 59 % |
| Hy-MT3-7B base | 59 % |
| v3d10 | 53 % |
| v4 | 50 % |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, COMET) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ≈5,74 GB solo para los pesos en Q6_K; con caché KV para contexto de 6144 tokens y 4 slots paralelos, prever 8-10 GB.
- GPU recomendadas: RTX 4090 (usada en el entrenamiento), A100 o H100 para servicio con varios slots; RTX 3090/4080 y GPUs de 12 GB funcionan sin problema.
- Cabe en GPU de consumo: sí, desde 8 GB de VRAM en Q6_K con contexto moderado; en 6-8 GB habría que reducir `-c` o el número de slots.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) y cualquier frontend compatible con GGUF (Ollama, LM Studio, text-generation-webui). No se distribuyen pesos en safetensors ni formato para vLLM/TGI.
- Latencia y throughput: no disponibles. La configuración de referencia es `-ngl 99 -c 6144 -np 4 -b 2048 -ub 512`, que sugiere servicio con cuatro peticiones concurrentes, pero el autor no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (ciega, 1-5) | Errores (55 textos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xuhuo_7b_mt3_v1 | 7,5 B | Config. 6144 | 3,680 | 27 / 55 | Apache-2.0 | GGUF en HF |
| Hy-MT3-7B (base) | 7,5 B | No disponible | 3,720 | 43 / 55 | Apache-2.0 | Pesos completos en HF |
| Xuhuo v4 (familia MT2) | No disponible | No disponible | 3,840 | 36 / 55 | No disponible | No disponible en la información |
| Xuhuo v3d10 (familia MT2) | No disponible | No disponible | 3,720 | No evaluado en la auditoría | No disponible | HF (`XuhuoRenxian/Xuhuo_7b_v3d10`) |

La comparación se limita a la propia familia del autor y al modelo base, porque no se han proporcionado datos de otros sistemas de traducción ja-zh comparables.

## Limitaciones y advertencias

- Tendencia a la traducción literal: verbos como 接触, 前往, 逃脱 o 进行 se copian tal cual; el autor recomienda una tabla de reemplazo posterior, ya que cambiar la temperatura no lo corrige.
- Insensibilidad a instrucciones de estilo: las reglas añadidas en el prompt tienen efecto prácticamente nulo (sensibilidad 0,89-0,93); solo el glosario funciona.
- Juegos de palabras y homófonos: no se resuelven (59 % de acierto, igual que el base); requieren intervención humana.
- Frases de más de 160 caracteres quedan fuera de la distribución de entrenamiento y su comportamiento no está verificado.
- Códigos de control largos como `\CE[n]` pueden omitirse ocasionalmente; el autor recomienda una expresión regular de respaldo en el postprocesado.
- Riesgo de alucinación y de errores culturales: la model card exige revisión humana antes de publicar.
- Obligación de etiquetar toda salida como «AI 翻译 / 机器翻译»; prohibido presentarla como traducción oficial o humana.
- La licencia Apache-2.0 permite uso comercial y redistribución, pero obliga a conservar la declaración y la atribución del autor.
- El usuario debe garantizar los derechos legales sobre el juego que traduzca; los datos de entrenamiento no se distribuyen.
- El repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta, y fue creado el 25 de noviembre de 2026: no hay validación independiente de los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XuhuoRenxian/Xuhuo_7b_mt3_v1
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B
- Generación anterior de la familia: https://huggingface.co/XuhuoRenxian/Xuhuo_7b_v3d10
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp

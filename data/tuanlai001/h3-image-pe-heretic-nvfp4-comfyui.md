# tuanlai001/H3-IMAGE-PE-HERETIC-NVFP4-COMFYUI

## Resumen

H3-IMAGE-PE-HERETIC-NVFP4-COMFYUI es un checkpoint de un solo archivo del "prompt enhancer" (PE) del modelo MiniMax-H3-Image, un componente que reescribe prompts cortos de usuario en descripciones largas y estructuradas para generación de imágenes. El modelo base del enhancer es Qwen3.8-27B, un transformer híbrido de 64 capas que combina atención lineal GatedDeltaNet con atención completa, y que MiniMax distribuye en formato ModelOpt NVFP4. El autor del repositorio, tuanlai001, lo ha de-cuantizado a bf16, le ha aplicado abliteration (eliminación direccional de la conducta de rechazo) y lo ha re-cuantizado al layout NVFP4 propio de ComfyUI para que pueda cargarse de forma nativa en ese entorno.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de ingeniería de cuantización: la conversión entre dos layouts NVFP4 incompatibles (orden de nibbles y swizzling de escalas de bloque) es un problema real que quien trabaje con FP4 en producción encontrará. Por otro lado, ilustra las tensiones entre la modificación de pesos (abliteration) y las licencias de modelos abiertos: la licencia MiniMax-H3-Image Community excluye explícitamente de su territorio a la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos, lo que condiciona su uso en España.

El resultado es un modelo de 17,92 GB en un único `.safetensors`, pensado para el nodo `CLIPLoader` de ComfyUI en `text_encoders/`, con una tasa de rechazo medida de 10/100 en el benchmark del autor y una divergencia KL de 0,1419 respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` híbrida: GatedDeltaNet (atención lineal) + atención completa, 64 capas, hidden 5120, vocab 248320 |
| Parametros totales | No disponible (el modelo base es Qwen3.8-27B; no se detalla el recuento exacto en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el autor recomienda `max_length` de 16384 para evitar salidas vacías |
| Tipos de cuantizacion | NVFP4 (E2M1, group size 16, escalas de bloque fp8_e4m3, escala global fp32); el checkpoint original bf16 de trabajo era de 54,71 GB |
| Idiomas soportados | Inglés (`en`) según los tags del repositorio |
| Licencia | MiniMax-H3-Image Community License Agreement (licencia "other", texto en el repositorio de MiniMaxAI) |
| Formato de pesos | `.safetensors` único (17,92 GB, 2788 tensores: 401 capas cuantizadas + escalas + tensores fp16/bf16 restantes) |

## Arquitectura y entrenamiento

El modelo es el prompt enhancer de MiniMax-H3-Image, construido sobre Qwen3.8-27B. La arquitectura es un transformer híbrido de 64 capas que intercala capas de atención lineal GatedDeltaNet con capas de atención completa, con dimensión oculta de 5120 y vocabulario de 248.320 tokens. El checkpoint se distribuye originalmente en formato ModelOpt NVFP4, que `transformers` no puede cargar como checkpoint pre-cuantizado, lo que motivó el proceso de conversión.

El pipeline de modificación documentado por el autor tiene cuatro etapas. Primero, de-cuantización de los pesos NVFP4 a bf16 plano usando el codebook E2M1, la escala por grupo de 16 elementos y la escala global, verificada como sin pérdida contra el flujo de bytes original (54,71 GB). Segundo, abliteration con la herramienta `heretic` v2.0.0.dev0: se calculan direcciones de rechazo a partir de la diferencia de activaciones medias entre `mlabonne/harmless_alpaca` (25.058 prompts) y `mlabonne/harmful_behaviors` (416 prompts), y se proyectan fuera del residual stream y de las matrices de escritura `attn.o_proj` y `mlp.down_proj`. La búsqueda multiobjetivo (refusals frente a KL) con Optuna TPE cubrió 13 estudios y 1262 trials; el frente de Pareto nunca alcanzó refusals ≤ 10/100 con KL ≤ 0,07, y el checkpoint publicado corresponde al punto más cercano (trial 19 del estudio final R3). Tercero, selección manual de hiperparámetros: `direction_index` 40,5855, `max_weight` 2,6749 en posición 44,258 para `attn.o_proj`, `max_weight` 2,1627 en posición 56,032 para `mlp.down_proj`, con 89 de 128 capas abliterables modificadas (solo MLP entre las capas 39 y 63). Cuarto, re-cuantización al layout NVFP4 de ComfyUI, que difiere del de ModelOpt en dos aspectos: ComfyUI empaqueta con `hi_first=True` (nibble alto = columna par) mientras ModelOpt empaqueta el nibble bajo primero, y las escalas de bloque deben ir en layout bloqueado de cuBLAS con forma `(ceil(M/128)*128, ceil(K/16/4)*4)` mediante `to_blocked()`. El checkpoint incluye la clave `_quantization_metadata` y un marcador `<name>.comfy_quant` por capa para que `convert_old_quants` lo enrute a `MixedPrecisionOps`.

La verificación reportada indica `max abs diff = 0.000000` en todas las capas no tocadas por abliteration y un RMS relativo de 2,5e-2 en las 89 capas modificadas, atribuido a error puro de cuantización FP4.

## Capacidades

- Expansión de prompts: reescribe prompts cortos de texto a imagen en descripciones largas y estructuradas, que es la función para la que fue entrenado el enhancer original.
- Generación de texto general, heredada del modelo base Qwen3.8-27B.
- Modo "thinking": el autor indica que debe activarse en el nodo `Generate Text` de ComfyUI; sin él el modelo puede producir salidas vacías.
- Capacidad de razonamiento multi-paso dentro del modo thinking, según la arquitectura del modelo base (no se detalla el entrenamiento específico de RLHF/DPO en la información proporcionada).
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los tags del repositorio; no se documentan otros idiomas.
- Visión y audio: no disponibles; el modelo es de texto.
- Conducta de rechazo reducida: 10/100 refusals en el benchmark del autor, frente al comportamiento del modelo original.

## Casos de uso

- Expansión de prompts en pipelines de text-to-image dentro de ComfyUI: el caso de uso principal. Se coloca el archivo en `ComfyUI/models/text_encoders/`, se carga con `CLIPLoader` y se conecta a `Generate Text` con thinking activado, de modo que un prompt breve del usuario se convierte en una caption detallada que alimenta el modelo de difusión.
- Investigación sobre abliteration y modificación de pesos: el repositorio documenta con precisión el proceso (datasets, número de trials, hiperparámetros por capa, métricas de rechazo y KL), lo que lo convierte en una referencia reproducible para estudiar el equilibrio entre eliminar rechazos y preservar la distribución original.
- Ingeniería de cuantización FP4: sirve como ejemplo trabajado de conversión entre layouts NVFP4 incompatibles (orden de nibbles y swizzling de escalas), útil para quien necesite portar checkpoints ModelOpt a ComfyUI o a otros runtimes con convenciones propias.
- Evaluación de robustez de prompt enhancers: al ser una variante del enhancer original con pesos alterados, permite comparar la calidad de las captions generadas frente al modelo sin modificar en tareas de generación de imágenes.
- Prototipado de herramientas creativas en local: al caber en un único archivo de 17,92 GB y cargarse en ComfyUI, permite montar un asistente de prompts para ilustración, diseño conceptual o generación de assets sin depender de APIs externas.
- Estudio de licencias en modelos derivados: el caso ilustra las obligaciones de la MiniMax-H3-Image Community License (territorio aplicable, avisos en archivos modificados, umbral de facturación para uso comercial), relevante para equipos jurídicos y de compliance que evalúen modelos derivados.

## Benchmarks y rendimiento

El autor publica métricas del proceso de abliteration, no benchmarks de calidad de tarea:

| Metrica | Valor |
|---|---|
| Refusals (benchmark del autor) | 10 / 100 |
| Divergencia KL respecto al original | 0,1419 |
| `direction_index` | 40,5855 |
| `attn.o_proj` max_weight / posicion | 2,6749 / 44,258 |
| `attn.o_proj` min_weight / distancia | 1,5040 / 51,367 |
| `mlp.down_proj` max_weight / posicion | 2,1627 / 56,032 |
| `mlp.down_proj` min_weight / distancia | 1,9718 / 17,446 |
| Capas abliterables modificadas | 89 / 128 (MLP solo 39–63) |
| Estudios / trials de búsqueda | 13 / 1262 |
| Max abs diff en capas no modificadas | 0,000000 |
| RMS relativo en capas modificadas | 2,5e-2 |

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, calidad de captions, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 17,92 GB en NVFP4; se necesita al menos esa cantidad de VRAM más el overhead de activaciones y del contexto. Con `max_length` de 16384 el consumo de activaciones puede ser considerable; no se proporciona una cifra exacta.
- GPU recomendadas: el autor indica que se necesita una GPU con soporte de tensor cores FP4 para obtener velocidad real. En tarjetas más antiguas el modelo se de-cuantiza al vuelo: carga, pero es lento. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; 17,92 GB supera la VRAM de la mayoría de GPUs de consumo, salvo modelos con 24 GB o más, y en esos casos sin aceleración FP4 nativa el rendimiento será bajo.
- Opciones de despliegue: ComfyUI con soporte NVFP4 (`comfy_quant` / `MixedPrecisionOps`); build antiguos caen a un modo de carga incorrecto. El repositorio menciona `sglang` como tag, pero no documenta instrucciones de despliegue con ese runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-IMAGE-PE-HERETIC-NVFP4-COMFYUI (este) | Base Qwen3.8-27B | No disponible | NVFP4 single-file para ComfyUI | MiniMax-H3-Image Community (excluye UE, UK, Corea del Sur y EE. UU.) | Hugging Face, 12.369 descargas, 40 likes |
| MiniMax-H3-Image prompt enhancer (original) | Base Qwen3.8-27B | No disponible | ModelOpt NVFP4 (no cargable por `transformers`) | MiniMax-H3-Image Community | Repositorio oficial MiniMaxAI |
| Qwen3.8-27B (modelo base) | 27B (nominal) | No disponible | Safetensors bf16 | Según el repositorio de Qwen | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La diferencia principal entre este checkpoint y el original es la conducta de rechazo (10/100 refusals) y el formato de cuantización compatible con ComfyUI.

## Limitaciones y advertencias

- No es un modelo libre de rechazos: rechaza aproximadamente 1 de cada 10 prompts del benchmark del autor. Es una reducción grande, no una eliminación.
- Solo se modificaron 89 de las 128 capas abliterables; las capas fuera del trapecio son idénticas bit a bit al original.
- Es obligatorio activar `thinking`; en caso contrario puede producir salidas vacías. Si persiste, el autor recomienda subir `max_length` (él usa 16384).
- Requiere una build de ComfyUI con soporte NVFP4 (`comfy_quant` / `MixedPrecisionOps`); builds antiguas cargan el modelo de forma incorrecta.
- En GPUs sin tensor cores FP4 el modelo se de-cuantiza al vuelo y el rendimiento cae, aunque sigue cargando.
- La licencia MiniMax-H3-Image Community limita el territorio aplicable a todo el mundo excepto la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos; España queda dentro de la UE y, por tanto, fuera del territorio aplicable.
- La redistribución exige incluir una copia del acuerdo, avisos prominentes en los archivos modificados y el texto `NOTICE`.
- El uso comercial por encima de 1 millón de USD de facturación anualizada tiene condiciones adicionales (el texto de la model card se corta en ese punto; debe consultarse el acuerdo completo).
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al derivar de Qwen3.8-27B y haber sufrido abliteration, es esperable una alteración de la distribución en las capas modificadas (KL 0,1419), pero no se cuantifican efectos concretos sobre calidad o sesgos.
- Idioma: solo inglés según los tags; no se garantiza un comportamiento correcto en castellano.
- El modelo es un enhancer de prompts, no un generador de imágenes: su salida es texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tuanlai001/H3-IMAGE-PE-HERETIC-NVFP4-COMFYUI
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del modelo original MiniMax-H3-Image: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia MiniMax-H3-Image Community: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Herramienta heretic (abliteration): https://github.com/p-e-w/heretic
- Dataset `mlabonne/harmless_alpaca`: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset `mlabonne/harmful_behaviors`: https://huggingface.co/datasets/mlabonne/harmful_behaviors

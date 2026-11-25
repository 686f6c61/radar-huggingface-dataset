# tmftop/darkglimmer-30b-iq4r-v4-rad

## Resumen

DarkGlimmer-30B IQ4R-V4 RAD es un contenedor cuantizado del modelo DarkGlimmer-30B, un ajuste fino orientado a roleplay y ficción para adultos sobre una base cuyos pesos fueron sometidos a un proceso de abliteration (Heretic). Lo publica el usuario tmftop y deriva del GGUF original de UltimateIntent. El contenedor está empaquetado para el motor de inferencia radiance, no para llama.cpp, e incluye el drafter DFlash2 para decodificación especulativa.

La propuesta técnica diferencial es la calibración: en lugar de calibrar sobre las activaciones del modelo base, el autor capturó Hessians GPTQ sobre el propio DarkGlimmer con un corpus de 40 millones de tokens centrado en roleplay. Según la model card, esto responde a que la distribución de activaciones de la FFN diverge del base Muse precisamente en las capas 10-32, donde la abliteration y el SFT de diálogo modificaron los pesos. En un brazo de control de 4 capas midieron una mejora media de KL del 37 % frente a la cuantización al redondeo más cercano.

El resultado declarado es un contenedor de 20,8 GiB y 652 pesos con una KL media de 0,0111 frente a la reconstrucción BF16 sobre 353.601 posiciones, una concordancia top-1 del 95,7 % y una perplejidad de 5,57 frente a 5,51 (ratio 1,010). Está pensado para GPUs AMD con ROCm (RDNA3/RDNA4), con licencia Apache-2.0, pero con una política de uso heredada del modelo base que conviene leer antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Muse Glimmer; detalles completos no disponibles), con drafter DFlash2 para decodificacion especulativa |
| Parametros totales | 30B (segun denominacion del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (`max-model-len: 131072` en la configuracion de servicio) |
| Tipos de cuantizacion | IQ4R-V4 (receta `museglimmer-30b-iq4r-v4`, calibracion GPTQ propia); el contenedor es un formato `.rad`, no GGUF |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (con USAGE_POLICY.md heredada del modelo base) |
| Formato de pesos | Contenedor `.rad` (radiance engine, 652 pesos, 20,8 GiB); no compatible con llama.cpp |
| Motor de inferencia | radiance (ROCm/HIP, gfx1201/gfx11xx), plugins `museglimmer`/`museglimmer_ct` y kernels `libr4d` |
| Cache KV | i8 |
| Plantilla de chat | ATEM (incluida en el contenedor) |
| Modalidad | Solo texto (sin tensores de vision) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 30B del linaje Muse Glimmer, ajustado para roleplay y ficción adulta sobre pesos abliterated mediante Heretic. El contenedor no reentrena el modelo: aplica una cuantización IQ4R-V4 con calibración GPTQ capturada directamente sobre DarkGlimmer, no sobre el modelo base. El autor justifica esta decisión señalando que la abliteration y el SFT de diálogo alteraron la distribución de activaciones de la FFN en las capas 10-32, por lo que calibrar sobre el base introduce un sesgo que la calibración propia evita.

La calibración se realizó sobre un corpus de 40 millones de tokens con fuerte presencia de roleplay, capturado como gramos RADGRAM2 en el commit `5a80ee2f` de radiance. Los gramos y el corpus no se distribuyen, pero el digest del árbol de gramos figura en el manifiesto. El contenedor incorpora además el drafter DFlash2 (`incoai/Muse-Glimmer-30B-DFlash2`) para decodificación especulativa, con `num-speculative-tokens: auto`, y una plantilla de chat ATEM con canales de razonamiento (`to=self`).

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición exacta de su dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto narrativo y de ficción, con especialización declarada en roleplay y ficción para adultos.
- Modo de razonamiento por canales (ATEM): las respuestas comienzan tras un canal de pensamiento `to=self`, expuesto en `reasoning_content` separado de `content`.
- Control de esfuerzo de razonamiento mediante la instrucción `Reasoning strength: low` en el system prompt para respuestas directas.
- Decodificación especulativa integrada mediante el drafter DFlash2, con gestión automática del número de tokens especulativos.
- Soporte de contexto largo de hasta 131.072 tokens, útil para conversaciones multi-turno extensas o narrativa de gran longitud.
- Capacidad multilingüe limitada al inglés según los metadatos del modelo.
- No incluye capacidades de visión (contenedor solo texto, `mm-max-patches: 0`).
- No se documenta soporte de tool calling, function calling ni flujos de agentes multi-paso.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo mantiene personajes y contexto a lo largo de sesiones extensas gracias a la ventana de 131.072 tokens y a la caché KV en i8, que reduce el coste de memoria en conversaciones largas.
- Generación de ficción por capítulos: permite encadenar capítulos manteniendo coherencia narrativa dentro de la ventana de contexto, con el drafter DFlash2 acelerando la generación en GPUs RDNA3/RDNA4.
- Escritura creativa asistida con control de estilo: el ajuste fino sobre ficción adulta y la temperatura recomendada de 1.0 con top_p 0.95 favorecen variación léxica y prosa menos repetitiva.
- Prototipado de narrativa interactiva: el modo de razonamiento por canales permite separar el razonamiento interno del personaje del texto mostrado al usuario, leyendo `reasoning_content` y `content` por separado.
- Despliegue en estaciones de trabajo AMD: el contenedor está pensado para una única tarjeta de 32 GB (por ejemplo, R9700) con ROCm 6.4 o superior, lo que encaja en entornos sin GPUs NVIDIA.
- Investigación sobre cuantización: el manifiesto M4 y las métricas de KL, concordancia top-1 y perplejidad permiten reproducir y auditar el efecto de la calibración sobre el propio modelo frente a la calibración sobre el base.
- Evaluación de decodificación especulativa: la integración del drafter DFlash2 con `num-speculative-tokens: auto` sirve como banco de pruebas para medir ganancias de throughput en el motor radiance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente aporta métricas de fidelidad de la cuantización y de rendimiento de inferencia:

| Metrica | Valor |
|---|---|
| KL media (top-128 + cola) frente a BF16, 353.601 posiciones | 0,0111 (mediana 0,0045) |
| Concordancia top-1 | 95,7 % |
| Perplejidad | 5,57 frente a 5,51 en BF16 (ratio 1,010) |
| Mejora de KL frente a cuantización al redondeo más cercano (control de 4 capas) | 37 % |
| Velocidad de decodificación (TP1, KV i8, drafter activo, 1x R9700) | ~64 tok/s |
| Velocidad de prefill | ~1.900–2.000 tok/s |

## Requisitos de hardware

- VRAM estimada: el contenedor ocupa 20,8 GiB en disco; con caché KV en i8 y contexto de 131.072 tokens, la configuración de referencia cabe en una tarjeta de 32 GB.
- GPU recomendadas: AMD Radeon R9700 (RDNA4) como referencia medida; el motor requiere ROCm 6.4 o superior con soporte gfx1201/gfx11xx (RDNA3/RDNA4).
- GPU de consumo: sí, en GPUs AMD RDNA3/RDNA4 con al menos 32 GB de VRAM; no hay soporte documentado para GPUs NVIDIA ni para CUDA en este contenedor.
- Opciones de despliegue: exclusivamente el motor radiance (`radiance --config serve.yaml`), con los plugins `museglimmer`/`museglimmer_ct` y los kernels `libr4d`. No es compatible con vLLM, llama.cpp, Ollama ni TGI; para esos motores debe usarse el GGUF original de UltimateIntent.
- Paralelismo: `tp: 1` en una tarjeta o `tp: 2` repartido entre dos tarjetas.
- Latencia y throughput: ~64 tok/s en decodificación y ~1.900–2.000 tok/s en prefill con TP1, KV i8 y drafter activo sobre una R9700.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| DarkGlimmer-30B IQ4R-V4 RAD (este) | 30B | 131.072 | `.rad` / radiance (ROCm) | Apache-2.0 | Calibración GPTQ sobre el propio modelo, drafter DFlash2, solo AMD |
| UltimateIntent/DarkGlimmer-30B-GGUF | 30B | no disponible | GGUF / llama.cpp | Apache-2.0 (heredada) | Modelo base del que deriva este contenedor; compatible con llama.cpp |
| incoai/Muse-Glimmer-30B-DFlash2 | no disponible | no disponible | drafter | no disponible | Drafter de decodificación especulativa incluido en este contenedor |
| Muse Glimmer 30B (linaje base) | 30B | no disponible | no disponible | no disponible | Modelo de referencia sobre el que se aplicó abliteration y SFT de diálogo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a estas alternativas.

## Limitaciones y advertencias

- Contenido no apto para todos los públicos: es un ajuste fino de roleplay y ficción para adultos, marcado como `not-for-all-audiences`; requiere revisión de la política de uso antes de cualquier despliegue.
- Pesos abliterated: la abliteration elimina mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino o inapropiado sin filtros adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; el ajuste hacia ficción y roleplay puede favorecer respuestas inventadas en contextos informativos.
- Respuestas vacías con presupuestos cortos: al ser un modelo de razonamiento por canales, con `max_tokens` bajos el presupuesto se consume en el canal de pensamiento y `content` vuelve vacío; se recomienda al menos 1.000 tokens de salida o `Reasoning strength: low`.
- Token de parada incorrecto: `<|eom|>` separa canales y no es fin de turno; detener la generación en `<|eom|>` trunca las respuestas. El fin de turno es `<|eot|>` o `<|end_of_text|>`.
- Idioma: solo inglés declarado; el rendimiento en castellano no está documentado.
- Compatibilidad restringida: solo funciona en el motor radiance sobre ROCm; no es un GGUF y no carga en llama.cpp, vLLM, Ollama ni TGI.
- Reproducibilidad parcial: los gramos de calibración y el corpus no se distribuyen, solo el digest en el manifiesto, por lo que la reproducción exacta de la cuantización no es posible con los artefactos publicados.
- Licencia: Apache-2.0 permite uso comercial, pero la USAGE_POLICY.md heredada del modelo base puede imponer restricciones adicionales que deben verificarse.
- Madurez del ecosistema: cero descargas y cero likes en el momento de la consulta, con un motor de inferencia poco extendido; el soporte y la comunidad son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmftop/darkglimmer-30b-iq4r-v4-rad
- Modelo base (GGUF): https://huggingface.co/UltimateIntent/DarkGlimmer-30B-GGUF
- Drafter DFlash2: https://huggingface.co/incoai/Muse-Glimmer-30B-DFlash2
- Motor radiance: https://github.com/radiance-project/radiance

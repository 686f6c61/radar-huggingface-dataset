# yujiepan/raon-1-mini-tiny-random

## Resumen

`yujiepan/raon-1-mini-tiny-random` es un modelo de depuración (fixture de tests) publicado por el desarrollador yujiepan. No es un modelo entrenado: sus pesos se inicializan de forma aleatoria (`set_seed(42)`, distribución normal con desviación 0,02 y normas a 1) reproduciendo la arquitectura de `KRAFTON/Raon-1-mini-preview`. Su utilidad es permitir que las herramientas de la comunidad (cargadores de `transformers`, pipelines de CI, validadores de cuantización) puedan ejecutar el grafo real de Raon sin descargar el modelo de 30B parámetros.

El modelo base, Raon-1 mini de KRAFTON AI, es un Mixture-of-Experts de aproximadamente 30B parámetros totales con unos 4B activos (30B-A4B), diseñado desde cero para conversación en coreano y tareas agénticas, y publicado bajo licencia Apache 2.0. La arquitectura combina capas RDA con capas MLA sin codificación posicional (NoPE), 25 capas en el original, 128 expertos enrutados con 6 activos por token, streams mHC y almacenamiento de expertos en MXFP8.

La relevancia de esta variante tiny es práctica: con 18.154.870 parámetros totales y un único `model.safetensors` de 35,3 MB, permite verificar en segundos que el código remoto (`trust_remote_code`) se carga, que las formas tensoriales cuadran y que el camino de cuantización MXFP8 (E4M3 + escalas E8M0) se serializa correctamente. Cualquier uso generativo está fuera de su alcance: los pesos son ruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con capas RDA y capas MLA sin RoPE (NoPE), streams mHC, router sigmoid top-k, experto compartido y puerta de salida |
| Parametros totales | 18.154.870 (18,2 M) |
| Parametros activos | no disponible (MoE con 64 expertos enrutados y 6 activos por token; el autor no publica el recuento exacto) |
| Longitud de contexto | 4.096 tokens (`max_position_embeddings` en la config del tiny); la del modelo base no está indicada en la información disponible |
| Tipos de cuantizacion | Expertos enrutados almacenados en MXFP8: pesos E4M3 con escalas E8M0 de bloque 1x32; el resto de tensores en punto flotante estándar. No hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible en este repo; el modelo base soporta coreano e inglés según KRAFTON. Este tiny no tiene capacidades lingüísticas reales |
| Licencia | no disponible en los metadatos del repo; el modelo base `KRAFTON/Raon-1-mini-preview` se distribuye bajo Apache 2.0 según su repositorio en GitHub |
| Formato de pesos | safetensors (`model.safetensors`, 35,3 MB), código remoto propio en `configuration_raon1_mini.py` y `modeling_raon1_mini.py` |
| Vocabulario | 259.840 tokens, embeddings no atados (*untied*) |
| Capas | 8 (1 capa densa inicial + 7 capas MoE); ciclo de 3 capas RDA + 1 capa MLA repetido dos veces |
| Anchura oculta / dimensión de cabeza | 32 / 32 |
| Expertos | 64 enrutados, 6 activos por token; experto compartido presente |
| Streams mHC | 4 |
| Librería | transformers con `trust_remote_code=True` |

## Arquitectura y entrenamiento

El tiny replica la topología del Raon-1 mini original reduciendo todas las dimensiones: 8 capas frente a 25, 32 unidades ocultas frente a 2.560, 64 expertos frente a 128 y dimensión de cabeza 32 frente a 128. Se mantiene el patrón estructural característico: una capa densa en la posición 0 seguida de 7 capas con MoE, y una cadencia de 6 capas RDA (atención lineal/recurrente con decaimiento, `rda_decay_rank` = 32) por cada 2 capas MLA en modo NoPE. El vocabulario y la política de embeddings no atados se conservan idénticos al modelo fuente.

Tabla de comparación estructural publicada por el autor:

| Característica | KRAFTON/Raon-1-mini-preview | Tiny |
|---|---:|---:|
| Vocabulario / embeddings atados | 259.840 / no atados | igual |
| Capas | 25 | 8 (dos ciclos de 3 RDA + 1 MLA) |
| Cadencia RDA / MLA NoPE | 18 / 7 | 6 / 2 |
| Streams mHC | 4 | igual |
| Prefijo denso / capas MoE | capa 0 / 24 capas | capa 0 / 7 capas |
| Expertos enrutados / activos | 128 / 6 | 64 / 6 |
| Anchura oculta / dim. de cabeza | 2.560 / 128 | 32 / 32 |
| Dimensiones RDA, MLA y LoRA | anchuras del original | proyecciones compatibles de 32 |
| Almacenamiento de expertos | MXFP8 E4M3 + escalas E8M0 1x32 | igual |
| Router / experto compartido / puerta de salida | sigmoid top-k / sí / sí | igual |

No hubo entrenamiento ni ajuste: es una inicialización aleatoria. El único proceso "técnico" reseñable es el tratamiento de precisión. PyTorch no implementa la inicialización aleatoria en CPU de parámetros `float8_e4m3fn`, así que el autor construye primero el grafo en BF16 con `quantization_config.dequantize = true`, inicializa los pesos y después reescribe únicamente los tensores de los expertos enrutados al formato MXFP8 del modelo fuente mediante cuantización por bloques de 32 valores: se calcula el máximo absoluto del bloque, se divide entre 448, se redondea el exponente y se derivan las escalas E8M0. Finalmente se guarda el `state_dict` con `dequantize = false` para que la representación serializada coincida con la del modelo original.

## Capacidades

- No tiene capacidades reales de generación: los pesos son aleatorios, por lo que la salida es texto incoherente o repeticiones de tokens del vocabulario.
- Sirve como banco de pruebas del grafo arquitectónico: valida que `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` construye correctamente las capas RDA, MLA, MoE, mHC y la puerta de salida.
- Verifica el camino de cuantización MXFP8: comprueba la generación de `weight_scale_inv` con escalas E8M0 y el redondeo de exponentes.
- Valida la integración del tokenizer y la plantilla de chat heredados del modelo base (archivos `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` copiados del repositorio fuente).
- Ejercita la API de `generate()` con `min_new_tokens`/`max_new_tokens` y decodificación greedy sobre un vocabulario de 259.840 entradas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking de forma funcional; la arquitectura base está pensada para conversación y tareas agénticas, pero este tiny no hereda ningún conocimiento.
- Multilingüismo: no aplicable en la práctica; el vocabulario cubre coreano e inglés del modelo original, pero no hay pesos entrenados.

## Casos de uso

- Pruebas de integración en CI/CD de `transformers`: fijar este repo como modelo de test permite ejecutar un ciclo completo de carga, `generate()` y decodificación en menos de un segundo y sin GPU, detectando regresiones en el soporte de `trust_remote_code`.
- Validación de kernels de cuantización: al replicar el almacenamiento MXFP8 E4M3 + E8M0 con bloques de 32, sirve para comprobar que una implementación propia de dequantización produce los mismos valores que la referencia.
- Desarrollo de código remoto: cualquier persona que adapte `modeling_raon1_mini.py` puede verificar cambios en las capas RDA o MLA sin necesidad de descargar los 30B parámetros del modelo original.
- Pruebas de stacks de servicio (vLLM, TGI, servidores HTTP propios): un modelo de 35 MB permite validar el enrutado de peticiones, el formateo de la plantilla de chat y el manejo de errores antes de pasar a producción con el modelo grande.
- Medición de sobrecarga de infraestructura: sirve como línea base de latencia para separar el coste del *runtime* (carga, tokenización, scheduling) del coste real de inferencia del modelo de 30B.
- Docencia y ejemplos reproducibles: permite mostrar la anatomía interna de un MoE híbrido (router sigmoid top-k, experto compartido, streams mHC) imprimiendo el modelo con `print(model)` sin requisitos de hardware.
- Pruebas de empaquetado y distribución: valida flujos de subida/descarga en el Hub, verificación de checksums y compatibilidad de `safetensors` con metadatos `format: pt`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, evaluación en coreano) carece de significado. Tampoco se han publicado cifras de benchmarks del modelo base `KRAFTON/Raon-1-mini-preview` en la información proporcionada, más allá de la descripción cualitativa de KRAFTON sobre su rendimiento en conversación en coreano y tareas agénticas.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 35 MB con los expertos en MXFP8 tal como se distribuye; en BF16 el conjunto completo ronda los 36 MB. Cabe holgadamente en cualquier GPU.
- GPU recomendadas: ninguna en particular; funciona en CPU. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) o acelerador profesional (A100, H100) es sobredimensionado para este modelo.
- Cabe en GPU consumer: sí, en todas, incluidas las integradas con memoria unificada.
- Despliegue: `transformers` con `trust_remote_code=True` (verificado por el autor); otros runners (vLLM, TGI, llama.cpp, Ollama) no están verificados y previsiblemente fallen, ya que el modelo requiere código remoto propio y no hay pesos en GGUF.
- Latencia y throughput: no disponible. Por tamaño, la carga completa desde disco es del orden de decenas de milisegundos en CPU y la generación está dominada por el coste de la tokenización de un vocabulario de 259.840 entradas, no por el cálculo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yujiepan/raon-1-mini-tiny-random | 18,2 M (64 expertos, 6 activos) | 4.096 | sin capacidades; pesos aleatorios | no disponible (base Apache 2.0) | HuggingFace, 0 descargas |
| KRAFTON/Raon-1-mini-preview | ~30B totales, ~4B activos (30B-A4B), 128 expertos, 6 activos | no disponible en la información proporcionada | sin cifras publicadas; orientado a coreano y tareas agénticas | Apache 2.0 | HuggingFace y GitHub de KRAFTON |
| Modelos tiny de depuración de la comunidad (por ejemplo, los `tiny-random` de HuggingFace) | del orden de millones de parámetros | variable | nulo por diseño; son fixtures de test | habitualmente permisiva | HuggingFace |

La comparación relevante es con el modelo base: este tiny no es una alternativa funcional, sino un gemelo estructural de 18,2 M de parámetros que reproduce la misma configuración de capas, expertos y cuantización a una escala 1.000 veces menor.

## Limitaciones y advertencias

- Los pesos son aleatorios: cualquier salida generada es ruido. No debe usarse para responder consultas, generar código ni evaluar calidad.
- No es un modelo destilado ni comprimido del original: no hereda ningún conocimiento ni comportamiento del Raon-1 mini de KRAFTON.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio; conviene auditar `modeling_raon1_mini.py` y `configuration_raon1_mini.py` antes de usarlo en entornos con datos sensibles.
- La licencia no figura en los metadatos del repo. Aunque el modelo base sea Apache 2.0, conviene confirmar los términos aplicables antes de redistribuirlo.
- El repositorio tiene 0 descargas y 0 likes y se creó en octubre de 2026; no hay mantenimiento ni garantía de compatibilidad con futuras versiones de `transformers`.
- El tamaño del repositorio aparece como 0,0 GB en los metadatos pese a que el archivo pesa 35,3 MB; es una inconsistencia de la ficha de HuggingFace, no un error del modelo.
- Los tensores de los expertos enrutados solo se inicializan correctamente siguiendo el camino BF16 → MXFP8 descrito por el autor; cargar directamente el checkpoint en `float8_e4m3fn` en CPU puede fallar según la versión de PyTorch.
- No hay versiones cuantizadas adicionales, ni GGUF, ni soporte verificado en motores de inferencia de alto rendimiento, lo que limita su uso a `transformers`.
- El contexto de 4.096 tokens es una reducción del tiny; no refleja la ventana real del modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/yujiepan/raon-1-mini-tiny-random
- Discusiones del repositorio: https://huggingface.co/yujiepan/raon-1-mini-tiny-random/discussions
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Repositorio GitHub del modelo base: https://github.com/krafton-ai/Raon-1-mini-preview
- Sitio oficial de Raon-1 mini (KRAFTON): https://raon-mini.krafton.ai/
- Nota de prensa sobre el lanzamiento: https://en.sedaily.com/technology/2026/10/21/krafton-releases-raon-1-mini-its-in-house-ai-language-model

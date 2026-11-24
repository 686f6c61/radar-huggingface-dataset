# vcruz305/StepFun-5-Preview-GGUF

## Resumen

StepFun-5-Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso de gran escala, con aproximadamente 598.040 millones de parámetros en el tronco de texto y 602.970 millones en el checkpoint completo. Desarrollado por StepFun, emplea 352 expertos enrutados con enrutamiento top-8 y unos 16.000 millones de parámetros activos por token, distribuidos en 95 capas (92 de texto y 3 de predicción multi-token). Su ventana de contexto alcanza 1.048.576 tokens y su vocabulario es de 128.896 entradas.

El repositorio analizado, `vcruz305/StepFun-5-Preview-GGUF`, no es una publicación oficial del modelo, sino una conversión a formato GGUF realizada por un tercero para su ejecución con llama.cpp. Incluye cuantizaciones extremas de 1 y 2 bits (IQ1_S y Q2_K) pensadas para desplegar un modelo de clase 600B en hardware de gama alta para inferencia local, como una estación DGX Spark o dos nodos equivalentes. El autor advierte explícitamente que el repositorio es privado y no constituye un lanzamiento general.

La relevancia de esta ficha radica en que documenta una de las pocas vías prácticas para ejecutar un MoE de casi 600.000 millones de parámetros en hardware de consumo profesional, a costa de una degradación medible de la calidad en la variante de 1 bit. Además, el repositorio incluye archivos complementarios (codificador visual, capas MTP e indexador de atención dispersa) que llama.cpp no puede ejecutar actualmente, lo que limita el uso real a la generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (sparse MoE), 95 capas (92 de texto + 3 MTP) |
| Parametros totales | 602,97 B en el checkpoint completo; 598,04 B en el tronco de texto |
| Parametros activos | ~16 B por token (352 expertos enrutados, top-8) |
| Longitud de contexto | 1.048.576 tokens (ventana deslizante de 512 en capas SWA) |
| Tipos de cuantizacion | IQ1_S (1,599 bpw), Q2_K (2,908 bpw), Q3_K_M (3,811 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (25 shards por cuantizacion); archivos complementarios BF16 en GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con mezcla de expertos dispersa: 352 expertos enrutados con selección top-8 por token, enrutamiento sigmoide, sesgo de router aplicado tras la activación solo para la selección, pesos normalizados sobre el conjunto seleccionado y escalados por 3,0. Combina capas de atención completa con capas de atención de ventana deslizante (512 tokens); las capas de atención completa rotan 96 de las 192 dimensiones de cabeza, con `rope.freq_base = 1e7` en las capas completas y `freq_base_swa = 1e4` en las deslizantes. Incorpora además tres capas de predicción multi-token (MTP) y un mecanismo de atención dispersa comprimida mediante un indexador (`sparse_indexer_*`) con escala softmax constante de 0,08496.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El repositorio documenta que las cuantizaciones se generaron a partir de una conversión BF16 con corrección de RoPE y una importance matrix v2 de dominios mixtos, de modo que todas las variantes comparten cobertura y metadatos y difieren únicamente en el ancho de bits. Los archivos complementarios incluyen un codificador de percepción visual tipo ViT (47 capas, anchura 1536, imagen 728, patch 14, activación quick_gelu) con 1,981 B de parámetros, las tres capas MTP con 2,5159 B y el indexador de atención dispersa con 0,4356 B.

## Capacidades

- Generación de texto autoregresiva en inglés, con calidad gramatical y temática mantenida incluso en la cuantización IQ1_S, según el autor.
- Razonamiento de múltiples pasos y contexto largo: la ventana de 1.048.576 tokens permite procesar documentos extensos, aunque llama.cpp ejecuta las capas de atención completa en modo denso.
- Predicción multi-token (MTP): las capas 92-94 permiten decodificación especulativa, si bien llama.cpp no implementa su runtime en la arquitectura `step35`.
- Percepción visual: el codificador `mmproj-BF16.gguf` aporta capacidad de imagen, pero ningún runtime de llama.cpp lo carga actualmente.
- Atención dispersa comprimida: el indexador permite seleccionar los top-512 tokens relevantes, aunque llama.cpp no aplica ni su selección ni su escala softmax.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor solo menciona inglés en sus pruebas.

## Casos de uso

- Inferencia local de un MoE de clase 600B en una sola estación DGX Spark: la variante IQ1_S (111,32 GiB) cabe en una caja de 128 GB y permite generar texto coherente sin infraestructura de centro de datos.
- Despliegue en dos nodos GB10 con la cuantización Q2_K (202,45 GiB): ofrece mayor profundidad de razonamiento que IQ1_S a cambio de duplicar el hardware, adecuado para laboratorios con dos estaciones.
- Experimentación con arquitecturas MoE masivas: permite a investigadores estudiar el comportamiento de 352 expertos y enrutamiento top-8 sin disponer del checkpoint BF16 completo.
- Evaluación comparativa de cuantizaciones extremas: el repositorio incluye tres anchos de bits (1,599, 2,908 y 3,811 bpw) con la misma importance matrix, lo que facilita medir la degradación por compresión.
- Generación de texto en pipelines de llama.cpp: mediante `llama-cli` o `llama-server` con `-ngl 99`, integrable en scripts de generación por lotes con temperatura 0 para tareas deterministas.
- Reproducción y verificación de metadatos RoPE: el archivo `metadata-rope.txt` y los 902 tensores verificados byte a byte permiten auditar conversiones de checkpoints MoE con atención híbrida.
- Pruebas de decodificación especulativa: las capas MTP en `MTP/mtp-Step-5-Preview-BF16.gguf` sirven como material de referencia para implementar el runtime en futuras versiones de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona una degradación medible de la profundidad de razonamiento en IQ1_S respecto al checkpoint BF16, sin cifras concretas de perplejidad ni de tareas estándar.

## Requisitos de hardware

- IQ1_S: 111,32 GiB en disco y en memoria; cabe en una única estación de 128 GB (DGX Spark o GB10-class). Requiere 25 shards.
- Q2_K: 202,45 GiB; requiere dos estaciones GB10-class. Se subieron 20 de los 25 shards en el momento de la consulta.
- Q3_K_M: 265,29 GiB; requiere tres estaciones GB10-class.
- GPU recomendadas: no disponible de forma explícita; el autor cita exclusivamente hardware GB10 / DGX Spark-class y no menciona A100, H100 ni RTX 4090.
- Viabilidad en GPU de consumo: no disponible; el tamaño mínimo de 111,32 GiB excede la VRAM de cualquier GPU consumer actual.
- Opciones de despliegue: llama.cpp con arquitectura `step35` (cualquier build reciente); se invoca con `llama-cli -m <shard-1> -ngl 99` y el cargador resuelve los shards restantes. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| StepFun-5-Preview (este repo, GGUF) | 602,97 B | ~16 B | 1.048.576 | Apache 2.0 | GGUF (IQ1_S, Q2_K, Q3_K_M) |
| StepFun-5-Preview (checkpoint BF16) | 602,97 B | ~16 B | 1.048.576 | Apache 2.0 | safetensors/BF16 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (MoE disperso de clase 600B con cuantizaciones GGUF) en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio es privado y no constituye un lanzamiento general del modelo; su disponibilidad y mantenimiento no están garantizados.
- IQ1_S es "literate but degraded": produce inglés gramatical y sobre el tema, pero la profundidad de razonamiento se pierde de forma medible. No sustituye al checkpoint BF16 ni a una cuantización de 2 bits en dos cajas.
- Los expertos enrutados en IQ1_S se ejecutan a 1,5625 bpw, una compresión aproximada de 10:1 sobre 584B parámetros; la pérdida es inevitable independientemente de la calibración.
- Los 161 tensores `sparse_indexer_*` y los 23 tensores `ssmax_s` están ausentes: llama.cpp no tiene runtime para la atención dispersa comprimida, por lo que las 23 capas de atención completa se ejecutan densas. En contextos de hasta 512 tokens la selección top-512 es irrelevante, pero la escala softmax constante (0,08496 frente a 0,07217 de llama.cpp) no se aplica.
- El codificador visual (`mmproj-BF16.gguf`) y las capas MTP no tienen runtime en llama.cpp: el modelo solo puede usarse para texto en la práctica.
- Q2_K está incompleto en el momento de la consulta (20 de 25 shards subidos), lo que impide su descarga completa.
- No hay información sobre sesgos, riesgo de alucinación, rendimiento multilingüe ni resultados de benchmarks; no se pueden evaluar estos aspectos para producción.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de datos de evaluación impide garantizar calidad en entornos productivos.
- El contexto efectivo en llama.cpp está limitado por la ejecución densa de la atención completa y por la ventana deslizante de 512; no se ha verificado el comportamiento a 1M de tokens con este runtime.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vcruz305/StepFun-5-Preview-GGUF
- Importance matrix: https://huggingface.co/vcruz305/Step-5-Preview-GGUF-imatrix
- Metadatos RoPE: https://huggingface.co/vcruz305/StepFun-5-Preview-GGUF/blob/main/metadata-rope.txt
- Cuantización IQ1_S: https://huggingface.co/vcruz305/StepFun-5-Preview-GGUF/tree/main/IQ1_S
- Cuantización Q2_K: https://huggingface.co/vcruz305/StepFun-5-Preview-GGUF/tree/main/Q2_K
- Cuantización Q3_K_M: https://huggingface.co/vcruz305/StepFun-5-Preview-GGUF/tree/main/Q3_K_M
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil de Unsloth (convención de nombres citada): https://huggingface.co/unsloth

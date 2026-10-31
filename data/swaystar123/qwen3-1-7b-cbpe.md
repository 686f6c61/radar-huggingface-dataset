# SwayStar123/Qwen3-1.7B-CBPE

## Resumen

Qwen3-1.7B-CBPE es un modelo experimental de generación de texto desarrollado por SwayStar123, disponible en HuggingFace bajo licencia Apache 2.0. Parte de Qwen3-1.7B-Base de Qwen, al que se le sustituye el vocabulario BPE original de 151k entradas por un vocabulario de BPE Combinatorial (CBPE) de 131k filas, y después se somete a un fine-tuning completo de "curación" (healing) sobre unos 47.000 millones de tokens. El objetivo es resolver la ineficiencia de tokenización de los tokenizadores BPE estándar: el mismo texto necesita aproximadamente 1,6 veces menos tokens, lo que permite meter un 1,5x más de texto en la ventana de contexto y generar un 1,5x más de texto por segundo.

La relevancia de este trabajo es principalmente de investigación: demuestra que una representación factorizada del vocabulario (cada token es una tupla de variación, prefijo, núcleo y sufijo) puede mantener una calidad de modelado casi equivalente (coste de +3,1% en bits por byte) a cambio de una compresión sustancialmente mejor. Es un modelo base, sin instrucción tuning, y requiere código personalizado (`trust_remote_code=True`), por lo que no es compatible con vLLM, llama.cpp ni los pipelines estándar de transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3 (28 capas, hidden 2048, 16 cabezas / 8 KV heads, dim. cabeza 128, MLP 6144, RoPE 1e6) con vocabulario factorizado y chain head |
| Parametros totales | 1.715.639.296 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 2.048 tokens (unos 12k caracteres); contextos más largos sin probar |
| Tipos de cuantizacion | bf16 (copia bf16 de los pesos fp32 de entrenamiento) |
| Idiomas soportados | inglés, alemán, francés, hindi, japonés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, ~3,4 GB el repositorio) |

## Arquitectura y entrenamiento

El cuerpo del modelo es Qwen3-1.7B-Base sin modificar: 28 capas transformer, dimensión oculta 2048, 16 cabezas de atención con 8 cabezas KV (GQA), MLP de 6144 y RoPE con base 1e6. La innovación está en el vocabulario: en lugar de una tabla de embeddings plana, cada token se representa como una tupla *(variación, prefijo, núcleo, sufijo)* con cuatro tablas de 8 variaciones, 1.469 prefijos, 128.561 núcleos (los ids 0-255 son fallback UTF-8 de bytes) y 1.038 sufijos, en total 131.076 filas. La entrada es la suma de las cuatro filas de tabla, y la salida es un chain head atado a las tablas de entrada: primero se predice el núcleo desde el estado oculto final, luego prefijo, variación y sufijo, cada uno mediante un pequeño paso residual MLP condicionado a los campos ya elegidos. La log-probabilidad de un token es la suma de la de sus campos. Como no existe vocabulario plano, el modelo no produce logits y las herramientas estándar (pipelines de transformers, vLLM, llama.cpp) no funcionan.

El modelo se sometió a un fine-tuning completo ("healing") de unos 47.000 millones de tokens tras sustituir el tokenizador, usando una mezcla de datasets que incluye fineweb-edu, finepdfs, fineweb-2, comma v0.1 del Common Pile, y datos conversacionales generados por Qwen (Magpie-Qwen2.5-Pro-1M, Magpie-Qwen2-Pro-1M y AM-Qwen3-Distilled). El entrenamiento se realizó con contextos de 2.048 tokens y pesos fp32, publicados en bf16. Una característica adicional es el token healing: el último token del prompt se descarta y los primeros tokens generados deben re-ortografiar sus bytes, lo que evita artefactos de frontera de tokenización. El generador propio incluye KV cache, muestreo greedy o con temperatura/top_p/semilla, y stop strings.

## Capacidades

- Generación de texto continuo (modelo base, sin instrucción tuning), con ligera familiaridad con el formato de chat de Qwen3 por los datos de healing, pero sin ser un modelo de chat.
- Compresión de texto superior: aproximadamente 1,6 veces menos tokens que el tokenizador original de Qwen3 (5,85 frente a 3,61 bytes por token en la mezcla de entrenamiento).
- Token healing integrado en el sampler propio, que mitiga errores de frontera de token en el prompt.
- Soporte multilingüe en seis idiomas (inglés, alemán, francés, hindi, japonés, chino) gracias al vocabulario factorizado, que comparte núcleos entre variantes ortográficas de una misma palabra.
- Cálculo de NLL por campo (`model.token_nll(ids)`) para análisis de perplejidad.
- Codificación del tokenizador disponible en Rust (rápida, compilando `dict_search`) o en Python puro con salida idéntica (1-9k palabras por segundo).
- No hay soporte nativo de tool calling, function calling, visión ni audio; no está diseñado para agentes ni razonamiento multi-paso.

## Casos de uso

- Investigación en tokenización: es el caso de uso principal; permite estudiar cómo un vocabulario factorizado afecta a la compresión, a los bits por byte y a la eficiencia de inferencia frente a BPE estándar.
- Maximización del texto por token en contextos limitados: con una ventana de 2.048 tokens caben unos 12k caracteres en lugar de los ~7,4k del modelo original, útil para procesar documentos cortos completos sin trocearlos.
- Generación con mayor throughput por token: al emitir cada paso de decodificación un 1,5x más de texto, es adecuado para servir más caracteres por segundo con el mismo coste de atención y KV cache por token.
- Procesamiento multilingüe eficiente: el vocabulario factorizado comparte filas entre variantes de una misma palabra (mayúsculas, puntuación adyacente, etc.), lo que interesa para corpus mezclados en los seis idiomas soportados.
- Análisis de perplejidad y atribución por bytes: la función `token_nll` y la atribución exacta por bytes facilitan evaluaciones lingüísticas finas.
- Experimentación con arquitecturas no estándar: el chain head y la ausencia de logits son un banco de pruebas para modificar el pipeline de decodificación en transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí publica comparativas de bits por byte (menor es mejor) sobre texto fuera de distribución (Wikipedia, CodeSearchNet y CodeContests), con ventanas de 2.048 tokens y unos 200k caracteres por archivo, pero la tabla de resultados está truncada en la información proporcionada, por lo que solo pueden citarse los agregados declarados por el autor:

| Métrica | Valor |
|---|---|
| Bytes por token (mezcla de entrenamiento) | 5,85 (CBPE) frente a 3,61 (Qwen3 original) |
| Coste en bits por byte frente a Qwen3-1.7B-Base | +3,1% de media (+2,4% ponderado por bytes) |
| Throughput de texto generado | ~1,5x más texto por segundo (medido por el autor) |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,5 GB en bf16 para los pesos, más la KV cache y las cuatro tablas de embeddings; una GPU de 8 GB es suficiente con holgura.
- GPU recomendadas: cualquier GPU moderna con soporte bf16 (RTX 3060/4060 o superiores); no se requieren A100 ni H100 para este tamaño.
- Cabe sobradamente en GPUs de consumo; incluso es viable su ejecución en CPU, aunque con latencia mayor (no hay datos publicados de velocidad en CPU).
- Despliegue: solo mediante transformers con `trust_remote_code=True` o instalando el paquete del repositorio GitHub (`pip install -e ".[qwen3]"`). No funciona con vLLM, llama.cpp, TGI ni Ollama, ya que el modelo no produce logits planos.
- Versiones probadas: transformers 4.57 y 5.19, torch 2.13.
- Latencia y throughput: el autor reporta ~1,5x más texto por segundo que el modelo original con el mismo presupuesto de tokens; no hay cifras absolutas de tokens por segundo publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizador | Licencia | Compatibilidad estándar |
|---|---|---|---|---|---|
| Qwen3-1.7B-CBPE | 1,72 B | 2.048 tokens (~12k caracteres) | CBPE factorizado, 131k filas | Apache 2.0 | No (código personalizado) |
| Qwen3-1.7B-Base | 1,72 B | 32.768 tokens | BPE estándar, 151k | Apache 2.0 | Sí (transformers, vLLM, llama.cpp) |
| Qwen3-1.7B (instruct) | 1,72 B | 32.768 tokens | BPE estándar, 151k | Apache 2.0 | Sí |

Frente a su modelo base, CBPE ofrece mejor compresión (1,6x menos tokens) y mayor texto por segundo, a costa de un contexto entrenado mucho menor (2.048 frente a 32.768 tokens), un ligero aumento del bits por byte (+3,1%) y la pérdida de compatibilidad con el ecosistema estándar de inferencia.

## Limitaciones y advertencias

- No es un modelo de chat: es un modelo base sin instrucción tuning; sigue el formato de chat de Qwen3 solo de forma laxa por los datos de healing.
- No produce logits planos: cualquier herramienta que dependa de logits (pipelines de transformers, vLLM, llama.cpp, TGI, Ollama) no funciona; hay que usar el sampler propio del repositorio.
- Requiere `trust_remote_code=True`, lo que ejecuta código Python arbitrario del repositorio; conviene revisar los ficheros antes de usarlo en entornos sensibles.
- Contexto entrenado de solo 2.048 tokens; usarlo con contextos más largos no está probado y puede degradar la calidad.
- Coste de calidad: +3,1% en bits por byte de media frente al modelo original, es decir, una modelación del texto ligeramente peor por byte.
- Riesgo de alucinación típico de modelos base de 1,7B: no debe usarse para tareas factuales sin verificación.
- Sesgos: hereda los de los datasets de preentrenamiento de Qwen3 y de los datos de healing (contenido web y conversaciones generadas por Qwen); no se han publicado evaluaciones de sesgo.
- Sin soporte de tool calling, visión ni audio; no apto para agentes tal cual.
- La codificación rápida del tokenizador requiere compilar un binario Rust; la alternativa en Python puro es lenta (1-9k palabras por segundo).
- Licencia Apache 2.0: sin restricciones para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SwayStar123/Qwen3-1.7B-CBPE
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio del método, tokenizador y código: https://github.com/SwayStar123/CombinatorialBPE

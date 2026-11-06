# TheCacheIsALie/Llama-3.1-8B-Instruct-RidgeFill-Projector

## Resumen

RidgeFill-Projector para Llama-3.1-8B-Instruct es un conjunto de mapas lineales ("ridge maps") que aceleran la fase de prefill de la inferencia sin modificar los pesos del modelo base. No se trata de un modelo de lenguaje completo, sino de un artefacto auxiliar de 335.626.240 parámetros totales (3,4 GB en el repositorio) que se carga junto al Llama-3.1-8B-Instruct original en un fork específico de llama.cpp. Lo publica el usuario TheCacheIsALie, reproduciendo el estudio de referencia del paper RidgeFill en cuatro profundidades de split (8, 12, 16 y 20 sobre 32 capas).

El mecanismo consiste en sustituir el cálculo exacto de las claves (keys) en una región inicial del contexto por una aproximación lineal ajustada en forma cerrada sobre estados ocultos de Llama 3.1, dejando una cola exacta de tokens para preservar la recuperación. Según la model card, en el split 12 se obtienen +39,7 puntos RULER en la región rellenada frente al relleno identidad, con una cola exacta de 4.096 tokens. En el split 16 la pérdida añadida en tokens nuevos es de solo +0,085 nats, frente a +0,563 del relleno identidad.

Su relevancia es práctica: en un RTX 4090 con CUDA 12.4 y flash attention, el procesamiento de prompt se acelera entre 1,26× y 1,74× según la longitud (8K a 32K), y el tiempo hasta el primer token en Q4_K_M baja de 4,30 s a 2,47 s con 32K de contexto. Es, por tanto, una técnica de aceleración de prefill para despliegues de Llama 3.1 en llama.cpp, no un modelo alternativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapas lineales RidgeFill (proyector de claves) sobre Llama-3.1-8B-Instruct (transformer decoder-only) |
| Parametros totales | 335.626.240 (mapas del proyector; el modelo base tiene 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Depende del modelo base; el ejemplo de uso configura 32.768 tokens (`-c 32768`) |
| Tipos de cuantizacion | bf16 y Q8_0 (GGUF); los safetensors son bf16 |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados en la model card) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (bf16) y GGUF (bf16, Q8_0) |

## Arquitectura y entrenamiento

Los mapas son proyecciones lineales ajustadas en forma cerrada (sin descenso de gradiente) sobre 834.541 filas procedentes de 71 documentos de calibración, con un parámetro de regularización λ = 0,03. Se generan cuatro variantes según el punto de split sobre las 32 capas del transformer: split 8, 12, 16 y 20. La implementación de referencia vive en `code/kva` del repositorio de datos, y los artefactos distribuidos aquí son los mapas bf16 que cargaron las ejecuciones del paper, más la conversión a GGUF del split 12 (bf16 y Q8_0) para el fork de llama.cpp.

La innovación técnica clave es que Llama-3.1-8B no tiene normalización de claves y su error de relleno se concentra en las keys. Por eso el split 12 (3/8 de profundidad) es problemático para pérdida: el relleno ajustado añade +1,006 nats frente a +0,505 del relleno identidad en tokens nuevos. En splits 16 y 20 el comportamiento se invierte y el relleno ajustado es mucho mejor (+0,085 y +0,030 nats frente a +0,563 y +0,406). En el split 12, la selección de filas exactas por atención elimina el fallo y restaura la recuperación; sin embargo, la model card advierte que solo el relleno simple con cola exacta aplica a este modelo, no los modos de selección del port de Qwen3.8-27B.

## Capacidades

- Aceleración de prefill: reduce el coste de procesar prompts largos sustituyendo el cálculo exacto de claves en la región inicial por una aproximación lineal, con una cola exacta configurable (`--ridgefill-tail 8192` en el ejemplo).
- Compatibilidad con llama.cpp: requiere el fork `Approximate-Science/llama.cpp-ridgefill` y los flags `--ridgefill` y `--ridgefill-tail`; no funciona en builds estándar.
- Conservación de la recuperación: con cola exacta de 4.096 tokens y split 12, la diferencia RULER frente al cálculo exacto es de +0,2 puntos (no inferioridad con margen de 2 puntos).
- No altera la generación: la velocidad de generación (tg128) es la misma con y sin RidgeFill según las mediciones en llama.cpp.
- No aporta capacidades nuevas de razonamiento, código, matemáticas, visión, tool calling ni agentes: esas capacidades son las del Llama-3.1-8B-Instruct subyacente y no se documentan en esta model card.
- Multilingüismo: no declarado; depende íntegramente del modelo base.

## Casos de uso

- Despliegue de Llama 3.1-8B con prompts largos en llama.cpp: cargar el GGUF Q8_0 del split 12 junto al modelo Q4_K_M y usar `--ridgefill-tail 8192` para reducir el tiempo hasta el primer token en contextos de 8K a 32K, con una mejora medida de 0,77 s a 0,60 s (8K) y de 4,30 s a 2,47 s (32K).
- Servicio de resumen de documentos largos: cuando el prompt de entrada domina la latencia (por ejemplo, actas o informes de decenas de miles de tokens), el procesamiento de prompt se acelera 1,73× a 32K con Q4_K_M, lo que abarata el coste por petición en GPUs de 24 GB.
- RAG con contexto extenso: en pipelines de recuperación que inyectan muchos fragmentos, la aceleración de prefill reduce el tiempo de respuesta inicial; conviene usar split 16 o superior si la métrica prioritaria es la perplejidad en lugar de RULER.
- Evaluación comparativa de técnicas de aceleración: el repositorio incluye mapas en cuatro splits con hashes SHA256, útiles para reproducir los experimentos del paper y comparar relleno ajustado frente a relleno identidad.
- Investigación sobre atención aproximada: los mapas permiten estudiar el compromiso entre velocidad de prefill y recuperación (needle in a haystack) en un transformer sin normalización de claves, un caso especialmente instructivo.
- Prototipado en una única RTX 4090: el ejemplo medido en la model card usa exactamente una RTX 4090 de 24 GB con CUDA 12.4, flash attention y F16 KV cache, por lo que sirve como receta reproducible para equipos de un solo GPU consumer de gama alta.

## Benchmarks y rendimiento

Resultados del estudio de referencia del paper (cola exacta de 4.096 tokens):

| Medida | Valor |
|---|---|
| RULER en región rellenada, RidgeFill − relleno identidad, split 12 (216 muestras, 8K a 64K) | +39,7 [+32,6, +46,5] puntos |
| RULER en región rellenada, RidgeFill + filas seleccionadas por atención − exacto, split 12 | +0,2 puntos, cota inferior −1,38 (no inferior a 2 puntos) |
| Pérdida en tokens nuevos frente a exacto, split 16 | +0,085 nats (relleno identidad +0,563) |
| Checkpoint SwiftKV publicado − RidgeFill, pérdida en tokens nuevos, split 16 | +0,010 [−0,004, +0,025] nats |

Mediciones en llama.cpp (una RTX 4090 24 GB, CUDA 12.4, flash attention, `-b 2048 -ub 512`, F16 KV cache, commit fa8061c4b, wikitext-2 test, cola T = 4096 salvo indicación):

Procesamiento de prompt, `llama-bench -p N -n 0 -r 3`, aceleración frente a stock:

| Modelo | 8K | 16K | 32K |
|---|---|---|---|
| F16 | 1,26× | 1,51× | 1,74× |
| Q4_K_M | 1,26× | 1,52× | 1,73× |

Tiempo hasta el primer token vía `llama-server`, Q4_K_M, media de 3 prompts (stock → RidgeFill): 8K 0,77 → 0,60 s; 16K 1,73 → 1,14 s; 32K 4,30 → 2,47 s.

NLL de cola (media de los últimos 4.095 tokens de cada ventana, nats por token, stock → RidgeFill), Q4_K_M:

| Prompt | T = 4096 | T = 8192 | T = 16384 |
|---|---|---|---|
| 8K (35 ventanas), stock 1,846 | 2,031 | n/a | n/a |
| 16K (17 ventanas), stock 1,811 | 2,047 (1,52×) | 1,927 (1,27×) | sin relleno |
| 32K (8 ventanas), stock 1,843 | 2,681 (1,73×) | 2,050 (1,52×) | 1,938 (1,23×) |

`llama-perplexity` (`-c N`; cola efectiva max(T, N/2)), stock → RidgeFill:

| Modelo | -c 8192 | -c 16384 | -c 32768 |
|---|---|---|---|
| F16 | 6,1775 → 7,5485 | 5,8588 → 7,0083 | 6,7350 → 7,8851 |
| Q4_K_M | 6,3350 → 7,6229 | 6,0108 → 7,0517 | 6,9105 → 7,9416 |
| F16, mapas Q8_0 | 6,1775 → 7,5446 | 5,8588 → 7,0046 | 6,7350 → 7,8886 |

Needle in a haystack (hastack wikitext-2, aguja sintética, profundidades 10-90 %, 4 agujas por profundidad y longitud, greedy, T = 4096), agujas encontradas:

| Arm | 8K | 16K | 32K | Agujas dentro de la región rellenada |
|---|---|---|---|---|
| F16 stock | 20/20 | 20/20 | 20/20 | n/a |
| F16 RidgeFill | 19/20 | 15/20 | 15/20 | 35/44 |
| Q4_K_M stock | 20/20 | 20/20 | 20/20 | n/a |
| Q4_K_M RidgeFill | no disponible en la información proporcionada | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM: los mapas del split 12 en Q8_0 ocupan 356.847.104 bytes (unos 0,36 GB) y en bf16 671.419.904 bytes (unos 0,67 GB); los safetensors van de 402,7 MB (split 20) a 805,5 MB (split 8). Hay que sumarlos a la VRAM del Llama-3.1-8B cuantizado.
- GPU valida según la model card: una RTX 4090 de 24 GB con CUDA 12.4, flash attention activado, `-b 2048 -ub 512` y F16 KV cache, con contexto de hasta 32K.
- Cabe en GPU consumer: sí, el ejemplo medido es una única RTX 4090. No se documentan mediciones en A100, H100 ni otras GPUs.
- Despliegue: exclusivamente el fork `llama.cpp-ridgefill` (build descrito en RIDGEFILL.md), con `llama-server`, `llama-bench` y `llama-perplexity`; no se indica compatibilidad con vLLM, TGI, Ollama ni otras herramientas.
- Latencia y throughput: procesamiento de prompt 1,26× a 1,74× más rápido que stock (8K a 32K, F16 y Q4_K_M); tiempo hasta el primer token en Q4_K_M de 0,60 s (8K), 1,14 s (16K) y 2,47 s (32K); velocidad de generación sin cambios (tg128 idéntico).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Aceleración de prefill | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RidgeFill-Projector (este) | 335,6 M (mapas) sobre Llama-3.1-8B | según base; ejemplo 32K | 1,26× a 1,74× (8K-32K, RTX 4090) | llama3.1 | Hugging Face, GGUF y safetensors |
| Relleno identidad (baseline del paper) | 0 (sin mapas) | según base | 1× (referencia) | llama3.1 | implementado en el fork |
| Checkpoint SwiftKV | no disponible | no disponible | no disponible | no disponible | no disponible |

En el estudio de referencia, el checkpoint SwiftKV publicado queda a +0,010 nats de RidgeFill en pérdida de tokens nuevos en el split 16, con intervalo [−0,004, +0,025], lo que sugiere un rendimiento de pérdida comparable. No se dispone de más datos sobre SwiftKV en la información proporcionada, ni de alternativas de la misma categoría (aceleradores de prefill para Llama 3.1) con especificaciones verificables.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el Llama-3.1-8B-Instruct original y un fork concreto de llama.cpp; no funciona en builds estándar ni en otros runtimes.
- El split 12 empeora la pérdida en tokens nuevos frente al relleno identidad (+1,006 frente a +0,505 nats); para métricas de pérdida hay que usar split 16 o superior.
- La recuperación se degrada: en needle in a haystack con F16, las agujas encontradas bajan a 19/20 (8K) y 15/20 (16K y 32K), con 35 de 44 agujas dentro de la región rellenada; no es inocuo para tareas de retrieval.
- La perplejidad medida en llama.cpp empeora claramente con RidgeFill (por ejemplo, Q4_K_M de 6,3350 a 7,6229 en `-c 8192`), lo que refleja el compromiso velocidad-calidad del relleno aproximado.
- Solo aplica el relleno simple con cola exacta; los modos de selección del port de Qwen3.8-27B no son válidos para este modelo.
- Licencia Llama 3.1 Community: restricciones de uso comercial y obligaciones de atribución según LICENSE y USE_POLICY.md; los mapas se distribuyen bajo esa misma licencia.
- Idiomas soportados no declarados en la model card; cualquier limitación lingüística proviene del modelo base.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un artefacto de aceleración, hereda los del Llama-3.1-8B-Instruct.
- Advertencia de integridad: el repositorio incluye hashes SHA256 por archivo; conviene verificarlos antes de desplegar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/TheCacheIsALie/Llama-3.1-8B-Instruct-RidgeFill-Projector
- Repositorio de datos y código: https://github.com/Approximate-Science/ridgefill-data
- Fork de llama.cpp: https://github.com/Approximate-Science/llama.cpp-ridgefill
- Instrucciones del fork: https://github.com/Approximate-Science/llama.cpp-ridgefill/blob/main/RIDGEFILL.md
- Perfil del autor: https://huggingface.co/TheCacheIsALie
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper RidgeFill: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

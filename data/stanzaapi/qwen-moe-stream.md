# StanzaAPI/qwen-moe-stream

## Resumen

StanzaAPI/qwen-moe-stream es un repositorio de conversión de formato que transforma el modelo denso Qwen/Qwen3-4B-Instruct-2507 en un GGUF con estructura `qwen3moe` de 8 expertos, cargable por llama.cpp. No se trata de un modelo nuevo ni de un MoE entrenado: el FFN denso original se particiona en 8 porciones disjuntas de 1.216 neuronas cada una, de modo que con un router uniforme y los 8 expertos activos la función resultante es idéntica a la del modelo denso. El atractivo técnico es otro: permite experimentar con enrutado selectivo y con streaming de expertos desde disco, reduciendo la memoria residente a costa de E/S.

El modelo base Qwen3-4B-Instruct-2507 es un transformer denso de aproximadamente 4.023 millones de parámetros, ajustado para instrucciones, con licencia Apache-2.0. La conversión conserva bit a bit las tensiones de atención, embeddings y LM head del GGUF Q4_K_M de origen, y reescribe únicamente los expertos del FFN en F16. El resultado es un fichero de 6,25 GB que reproduce la perplejidad del denso dentro del error de redondeo (17,6157 frente a 17,6203 en texto retenido).

Es relevante ahora porque demuestra una vía práctica para servir modelos de pesos moderados con huella de memoria muy reducida: la variante con streaming y desalojo tras uso baja el RSS máximo a 0,78 GB, frente a 5,93 GB del modelo residente. Esa cifra corresponde solo al ejecutor, no a una pila de servicio completa, y el coste es throughput, no calidad. El repositorio incluye además una variante top-6 con router ridge que es deliberadamente lossy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3 convertido a grafo `qwen3moe` (8 expertos por capa en el FFN); atención, embeddings y LM head permanecen densos |
| Parametros totales | 4.023.205.376 (4,02 B) |
| Parametros activos | 8 de 8 expertos en el fichero exacto (equivale al denso); 6 de 8 en la variante ridge6 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos del FFN en F16; tensores no-FFN copiados de un origen Q4_K_M; el repositorio no publica otras cuantizaciones |
| Idiomas soportados | no disponible (heredados del modelo base, sin listado en la model card) |
| Licencia | Apache-2.0 (pesos); código de conversión MIT |
| Formato de pesos | GGUF (`Qwen3-4B-MoE8-exact-f16.gguf`, `Qwen3-4B-MoE8-ridge6-f16.gguf`, más un manifest JSON de 2,1 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only denso de Qwen3 en su variante Instruct-2507. La conversión no entrena nada: descompone el FFN denso como suma sobre las 9.728 neuronas ocultas, `FFN(x) = Σ_j W_down[:, j] · silu(W_gate[j] @ x) · (W_up[j] @ x)`, y agrupa esas neuronas en 8 slices disjuntos de 1.216. Con los 8 expertos seleccionados y router uniforme, la salida es la misma función; el autor reporta coincidencia dentro del redondeo F16, con divergencia KL media de 0,001350 y 96,47 % de coincidencia en el token top-1 frente al denso.

No hay RLHF, DPO ni preentrenamiento adicional en este repositorio; el ajuste por instrucciones proviene del modelo base. La única calibración es el router ridge de la variante top-6, ajustado sobre 384 posiciones de token por capa extraídas de READMEs públicos y documentos de especificación mediante un callback de evaluación de llama.cpp, sin entrenar pesos ni usar datos privados. La innovación destacable es el streaming de expertos: las tensiones del FFN se leen desde disco y se desalojan con `madvise` tras su uso, lo que reduce el RSS máximo a 0,78 GB en la medición publicada (4 tokens, 36 capas, tensores reales) frente a 5,93 GB en modo residente, tocando en ambos casos 21,5 GB de bytes.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredados de Qwen3-4B-Instruct-2507.
- Razonamiento y matemáticas de nivel 4B, sin datos de benchmark publicados en este repositorio.
- Generación de código, sujeta a las capacidades del modelo base.
- Ejecución local en CPU mediante llama.cpp, sin dependencia de GPU.
- Carga en el grafo `qwen3moe` de llama.cpp (build b11050 o superior).
- Enrutado selectivo de expertos como mecanismo experimental: top-6 con router ridge o fan-out completo.
- Streaming de expertos desde disco con desalojo de páginas, útil para entornos con memoria limitada.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking en esta model card.

## Casos de uso

- Servicio en CPU con memoria restringida: desplegar el fichero exacto con streaming y desalojo permite ejecutar el modelo con un RSS del orden de 0,78 GB en el ejecutor, adecuado para contenedores pequeños o instancias sin GPU.
- Investigación sobre enrutado de expertos: el repositorio ofrece un caso controlado donde los "expertos" son slices de un FFN denso, lo que permite medir el efecto de routers selectivos contra un oráculo conocido y comparar con el resultado negativo del autor sobre routers entrenados por gradiente.
- Validación de conversiones GGUF: el manifest JSON con offsets de tensores, rangos de bytes por experto y hashes de permutación, junto con los checksums, sirve para verificar pipelines de conversión y reproducibilidad.
- Pruebas de latencia y E/S en llama.cpp: comparar el modo residente (5,93 GB de RSS) con el modo streamed (0,78 GB) sobre el mismo modelo permite caracterizar el coste de throughput del streaming en hardware concreto.
- Docencia y demostraciones de arquitecturas MoE: ilustrar la equivalencia entre un FFN denso y su partición en expertos sin necesidad de entrenar un MoE real.
- Prototipado de asistentes conversacionales offline: al ser un modelo de 4B con licencia Apache-2.0 y ejecución en CPU, encaja en entornos air-gapped donde no se puede recurrir a APIs externas.
- Evaluación de calidad de variantes lossy: el par exact/ridge6 (PPL 17,62 frente a 20,89) permite calibrar cuánta degradación acepta un pipeline antes de optar por leer solo el 75 % de los bytes del FFN.

## Benchmarks y rendimiento

| Modelo | PPL (texto retenido, contexto 512, CPU, `llama-perplexity`) | Ratio vs denso |
|---|---:|---:|
| Qwen3-4B denso Q4_K_M | 17,6203 | 1,000× |
| MoE8 exact (8 expertos) | 17,6157 | 0,9997× |
| MoE8 top-6 ridge router | 20,8920 | 1,186× |

| Métrica de logits (exact vs denso) | Valor |
|---|---:|
| Divergencia KL media | 0,001350 |
| Coincidencia en token top-1 | 96,47 % |
| Ratio de PPL | 0,99972 |

| Streaming (4 tokens × 36 capas) | RSS máximo | Bytes tocados |
|---|---:|---:|
| Residente, sin desalojo | 5,93 GB | 21,5 GB |
| Streamed, desalojo tras uso | 0,78 GB | 21,5 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica en las mediciones publicadas, realizadas con `-ngl 0` (sin offload a GPU). El fichero exacto ocupa 6,25 GB en disco y su FFN 5,38 GB.
- Memoria RAM: 5,93 GB de RSS máximo en modo residente; 0,78 GB en modo streamed con desalojo, más el espacio de página del fichero mapeado.
- GPU recomendadas: no disponibles; el autor advierte que el offload a GPU cambiará las cifras de memoria y throughput.
- Consumer GPU: no hay datos publicados; con 6,25 GB de fichero cabría en GPUs de 8 GB o más si se hiciera offload completo, pero no está medido.
- Opciones de despliegue: llama.cpp (build b11050 o superior) mediante `llama-cli` o `llama-perplexity`; no se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en cifras absolutas; el autor indica que el modelo exacto es más lento que el Q4 denso de origen porque el FFN está en F16 y se ejecutan los 8 expertos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL publicada | Licencia | Formato |
|---|---|---:|---:|---|---|
| StanzaAPI/qwen-moe-stream (exact) | 4,02 B (8/8 expertos) | no disponible | 17,6157 | Apache-2.0 | GGUF |
| Qwen/Qwen3-4B-Instruct-2507 (denso, Q4_K_M) | 4,02 B | no disponible | 17,6203 | Apache-2.0 | GGUF / safetensors |
| StanzaAPI/qwen-moe-stream (ridge6) | 4,02 B (6/8 expertos) | no disponible | 20,8920 | Apache-2.0 | GGUF |

La comparación con modelos MoE nativos de tamaño similar no está disponible en la información proporcionada. Frente al denso de origen, la variante exacta iguala la perplejidad y solo mejora la memoria residente mediante streaming; la variante ridge6 reduce la E/S un 25 % a costa de un 18,6 % de perplejidad.

## Limitaciones y advertencias

- No es un MoE entrenado: los expertos son slices de un FFN denso y no producen actualizaciones completas por sí mismos.
- La variante exacta no aporta ninguna mejora de velocidad; ejecuta los 8 expertos y usa F16 en el FFN, por lo que es más lenta que el Q4 denso original.
- La variante top-6 es lossy y no debe presentarse como equivalente al modelo denso.
- Solo el FFN está moeificado; atención, embeddings y LM head permanecen densos.
- Las mediciones provienen de un único host de CPU con `-ngl 0`; el offload a GPU altera memoria y throughput.
- Los expertos F16 derivados de un origen Q4_K_M son más grandes que el fichero de partida y arrastran el redondeo de esa cuantización.
- La cifra de 0,78 GB corresponde solo al ejecutor, no a una pila de servicio completa.
- No se documentan sesgos, riesgo de alucinación ni cobertura idiomática específicos; deben asumirse los del modelo base Qwen3-4B-Instruct-2507.
- Licencia Apache-2.0 en los pesos y MIT en el código de conversión: no se indican restricciones adicionales para uso comercial, pero conviene verificar los términos del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/StanzaAPI/qwen-moe-stream
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio GitHub del proyecto: https://github.com/DrMkdaddy/qwen-moe-stream
- Checksums de resultados: https://github.com/DrMkdaddy/qwen-moe-stream/blob/main/results/CHECKSUMS.txt

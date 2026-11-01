# stdlogits/rs-lenses

## Resumen

`stdlogits/rs-lenses` no es un modelo generativo, sino un conjunto de lentes lineales de interpretabilidad (R-lens y S-lens) ajustadas sobre dos modelos base: `Qwen/Qwen3-8B` y `google/gemma-4-12B`. Una lente lineal es una matriz que transforma un vector interno del modelo (una activación del residual stream, la entrada de un MLP o la salida de una cabeza de atención) en una distribución sobre el vocabulario, permitiendo leer qué "dice" el modelo en cada punto de su cómputo interno. El paquete lo publica el autor `stdlogits` bajo licencia CC-BY-4.0 y está pensado para investigación en interpretabilidad mecanicista.

La R-lens lee qué produce un vector del residual en la capa L después de que actúen las capas posteriores, usando la unembedding `W_U`; la S-lens lee, en sentido inverso, qué entradas (embeddings de tokens) generan un vector en la capa L. Ambas se ajustan promediando un jacobiano del residual sobre un corpus de 1.000 documentos web, pero bajo las reglas de propagación de RelP en lugar del gradiente verdadero, lo que hace que cada capa se comporte como un mapa lineal fijo por documento y que la R-lens sea exactamente la transpuesta de la S-lens.

El interés actual del artefacto es doble: por un lado, extiende las lentes al dominio multimodal (Gemma 4 procesa imágenes y audio mediante embedders lineales, y las lentes se ajustan también sobre COCO 2014 y ESC-50 para leer de vuelta a píxeles o muestras de audio); por otro, acompaña al dataset `stdlogits/neuron-lens`, que contiene la lectura de cada neurona MLP y cada cabeza de atención de ambos modelos a través de estas lentes. El repositorio ocupa 36,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lentes lineales (matrices jacobianas por capa) sobre transformers Qwen3-8B y Gemma 4 12B |
| Parametros totales | No aplica (artefacto de interpretabilidad); modelos base: 8B (Qwen3-8B) y 12B (Gemma 4) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en fp32) |
| Idiomas soportados | No disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.pt` (PyTorch, diccionarios de matrices fp32 por capa) |

## Arquitectura y entrenamiento

Cada fichero de lente es un diccionario de matrices fp32 indexadas por capa: `[4096, 4096]` para las 36 capas de Qwen3-8B (2,4 GB por fichero) y `[3840, 3840]` para las 48 capas de Gemma 4. La R-lens (`r-lens/lens.pt`) mapea la salida de la capa L a la salida de la última capa, con `J[35]` (Qwen3) o `J[47]` (Gemma 4) igual a la identidad. Los ficheros `mid.pt` mapean la entrada del MLP a la salida de la última capa. La S-lens (`s-lens/mid.pt` y `s-lens/out.pt`) mapea los embeddings de tokens a la entrada del MLP o a la salida de la capa L, respectivamente.

Las lentes se definen promediando el jacobiano del residual sobre el corpus, sumado sobre posiciones como en la J-lens, pero bajo las reglas de RelP en lugar del gradiente verdadero: las RMSNorm de capa mantienen su `rsqrt` constante, la activación del MLP se linealiza como `(act(g)/g)·dg` (SiLU para Qwen3, GELU-tanh para Gemma 4) y el producto `act(g)·up` reparte la mitad del cambio de cada factor (β = 0,5); atención, las normas q/k (y v en Gemma) y RoPE conservan su derivada verdadera. El ajuste se realiza sobre las primeras 1.000 filas de `HuggingFaceFW/dclm_100BT-shuffled` (revision `2fa015e4044ec442a0734e89658cdcc538d10dd4`), tomando los primeros 128 tokens de cada fila. Para imagen y audio, las lentes de Gemma 4 se ajustan sobre imágenes de validación de COCO 2014 y clips de ESC-50, con `K[L]` de `[3840, 2048]` y `[3840, 640]` respectivamente, acompañadas de una `basis` ortonormal (`[k, 3840]`) tal que `K_full[L] = K[L] @ basis`.

La lectura R-lens de un vector `h` en la capa L es `softmax(W_U · norm(J_L h))`, con `norm` la RMSNorm final y su peso (en Gemma 4, los logits pasan además su softcap `30 · tanh(x / 30)`). La lectura S-lens de una dirección `c` puntúa el token `v` como `c · K_L (W_E[v] − mean(W_E))` (en Gemma 4, `W_E` multiplicado por √3840). Se incluyen además lecturas contrastivas por capa, que aplican z-score a la puntuación de cada token a través de muchos vectores de una misma capa para eliminar los tokens hub que dominan las lecturas crudas.

## Capacidades

- Lectura del residual stream de Qwen3-8B y Gemma 4 12B capa a capa, proyectando activaciones internas a distribuciones sobre el vocabulario.
- Lectura de la escritura de cada neurona MLP (a través de `r-lens/lens.pt` y `s-lens/out.pt`) y de su dirección de lectura (filas gate y up, vía `r-lens/mid.pt` y `s-lens/mid.pt`).
- Lectura de lo que cada cabeza de atención lee (salida de la capa L−1, `s-lens/out.pt`) y de lo que escribe (entrada del MLP de la capa L, `r-lens/mid.pt`).
- Lecturas contrastivas por capa para suprimir tokens hub.
- Lentes multimodales para Gemma 4: lectura de vectores de imagen de vuelta a píxeles (48 × 48 × 3 por parche) y de audio de vuelta a muestras (640 por trama de 40 ms).
- Metadatos de procedencia (`provenance`) en los ficheros de Qwen3-8B: corpus, reglas y diferencia split-half por capa.
- No incluye generación de texto, tool calling, agentes ni razonamiento: es un artefacto de análisis, no un modelo desplegable.

## Casos de uso

- Auditoría de circuitos internos en Qwen3-8B: aplicar la R-lens a la salida de una capa concreta para identificar qué tokens candidatos "empuja" el modelo antes de que actúen las capas posteriores, útil para localizar circuitos de copia o de inducción.
- Análisis de neuronas MLP individuales: leer la escritura de cada neurona con `r-lens/lens.pt` y su dirección de lectura con `r-lens/mid.pt` para caracterizar qué concepto codifica cada unidad, usando el dataset `stdlogits/neuron-lens` como base ya calculada.
- Atribución de entradas con la S-lens: dado un vector interno en la capa L, recuperar qué embeddings de token lo generan, lo que permite rastrear qué partes del prompt contribuyen a una activación concreta.
- Investigación en seguridad y alineamiento: detectar representaciones latentes de conceptos sensibles o de intención antes de que se materialicen en la salida, comparando lecturas R-lens y S-lens entre capas.
- Interpretabilidad multimodal en Gemma 4: leer qué parches de imagen (48 × 48 × 3) o qué tramas de audio (640 muestras por 40 ms) activan una representación interna concreta, aplicable a estudios de sesgo visual o de atención a regiones específicas.
- Docencia y reproducción de métodos: el paquete incluye código, métodos y hallazgos en el repositorio de GitHub, lo que permite reproducir el ajuste de lentes sobre los mismos 1.000 documentos y comparar variantes (J-lens, K-lens, R-lens, S-lens).
- Comparación entre modelos: al compartir corpus y estimador, las lentes de Qwen3-8B y Gemma 4 12B permiten contrastar cómo dos arquitecturas distintas representan el mismo tipo de información en capas equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta métricas cuantitativas de fidelidad de las lentes (por ejemplo, acuerdo con la salida real del modelo o diferencia split-half numérica), más allá de mencionar que el campo `provenance` registra la diferencia split-half por capa.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 36,4 GB; cada fichero de lente de Qwen3-8B pesa 2,4 GB (matrices `[4096, 4096]` en fp32 por capa) y los de Gemma 4 son de tamaño análogo con `[3840, 3840]`.
- VRAM para usar las lentes: depende del modelo base sobre el que se apliquen. Para Qwen3-8B en fp16 se estiman en torno a 16 GB solo para los pesos del modelo, más el espacio de activaciones y de la lente cargada; para Gemma 4 12B, en torno a 24 GB en fp16. No se dispone de cifras oficiales de VRAM en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño de los modelos base, cabría esperar A100/H100 para fp16 sin cuantizar y RTX 4090 (24 GB) para Qwen3-8B en fp16 o ambos en cuantización de 8 bits; estas estimaciones no están confirmadas por el autor.
- Opciones de despliegue: no se documentan en la model card. El artefacto son ficheros `.pt` de PyTorch que se cargan con código propio del repositorio de GitHub; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Artefacto | Modelos base | Tipo de lente | Licencia | Disponibilidad |
|---|---|---|---|---|
| `stdlogits/rs-lenses` | Qwen3-8B, Gemma 4 12B | R-lens y S-lens bajo reglas RelP, texto, imagen y audio | CC-BY-4.0 | HuggingFace (0 descargas) |
| `camilablank/workspace-lenses` | No disponible | Lentes con layout `J`, `n_prompts`, `source_layers`, `d_model` | No disponible | HuggingFace |
| J-lens (Transformer Circuits) | No disponible | Lente jacobiana sobre el residual | No disponible | Publicación de Transformer Circuits |
| K-lens (Theia Vogel) | No disponible | Lente forward hasta los embeddings de entrada | No disponible | No publicada |

La comparativa se limita a artefactos metodológicamente emparentados, ya que no existen muchos paquetes públicos de lentes lineales por capa. La diferencia principal de `rs-lenses` frente a la J-lens es el uso de las reglas de RelP en lugar del gradiente verdadero, y frente a la K-lens, la inclusión de la versión bajo RelP (S-lens) junto con la R-lens y su extensión multimodal.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para inferencia de texto, código, visión o audio por sí mismo; requiere cargar el modelo base correspondiente.
- Las lentes son aproximaciones lineales: las reglas de RelP (RMSNorm constante, activación linealizada, β = 0,5) sustituyen el gradiente verdadero, por lo que las lecturas pueden divergir del comportamiento real del modelo, especialmente en capas tempranas.
- Los tokens hub dominan las lecturas crudas; es necesario aplicar lecturas contrastivas por capa para obtener interpretaciones fiables.
- El ajuste se limita a 1.000 documentos de DCLM y a los primeros 128 tokens de cada uno; la cobertura de dominios, idiomas y longitudes es limitada y no se documenta la composición lingüística del corpus.
- Las lentes multimodales de Gemma 4 se ajustan sobre COCO 2014 (imágenes) y ESC-50 (audio), datasets acotados en dominio; su generalización a otros tipos de imagen o sonido no está validada en la información disponible.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero las licencias de los modelos base (Qwen3-8B y Gemma 4 12B) imponen sus propias condiciones que deben respetarse por separado.
- No se reportan métricas de fidelidad, sesgos ni tasas de error de las lentes; el campo `provenance` contiene la diferencia split-half, pero no se ofrecen valores en la model card.
- El repositorio no registra descargas ni likes, y el pipeline no está disponible; el soporte de la comunidad es mínimo.

## Enlaces

- [HuggingFace: stdlogits/rs-lenses](https://huggingface.co/stdlogits/rs-lenses)
- [GitHub: stdlogits/neuron-lens](https://github.com/stdlogits/neuron-lens)
- [Dataset: stdlogits/neuron-lens](https://huggingface.co/datasets/stdlogits/neuron-lens)
- [Modelo base: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Modelo base: google/gemma-4-12B](https://huggingface.co/google/gemma-4-12B)
- [Dataset de ajuste: HuggingFaceFW/dclm_100BT-shuffled](https://huggingface.co/datasets/HuggingFaceFW/dclm_100BT-shuffled)
- [Layout de referencia: camilablank/workspace-lenses](https://huggingface.co/camilablank/workspace-lenses)
- [Paper RelP (arXiv:2508.21258)](https://arxiv.org/abs/2508.21258)
- [J-lens (Transformer Circuits)](https://transformer-circuits.pub/2026/workspace/)
- [R-lens (LessWrong)](https://www.lesswrong.com/posts/nv8oedrnLXKRzNEL9/r-lens-making-j-lens-more-faithful-on-early-layers)
- [K-lens (Theia Vogel, X)](https://x.com/voooooogel/status/2084858861551526002)

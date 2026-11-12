# wirkung/Origami-9B

## Resumen

Origami-9B es un artefacto de inferencia derivado de Qwen/Qwen3.5-9B, publicado por el autor wirkung bajo el identificador wirkung/Origami-9B. No es un modelo entrenado desde cero ni un fine-tuning: el autor lo describe como una compilación en forma cerrada del checkpoint original de 18,85 GB BF16 a un binario de 2,74 GB (factor de compresión 6,88x), sin pasos de gradiente ni calibración. La arquitectura subyacente es la del modelo base: 24 capas Gated DeltaNet, 8 capas de atención completa con 4 grupos KV, una torre de visión de 27 capas y un vocabulario de 248.320 entradas, con 9,41B parámetros totales.

La propuesta técnica central es el despliegue de un modelo de 9,41B parámetros sin VRAM de GPU dedicada y con estado de sesión constante. El autor afirma que el artefacto se ejecuta directamente desde SSD o NVMe mediante `mmap` del sistema operativo, sin buffers de deserialización en RAM anfitriona, y que el estado vivo se mantiene fijo en 14,82 MB con independencia de la longitud de contexto, frente al crecimiento lineal del KV cache del modelo original (34,40 GB a 1M tokens según la model card).

Se trata de una versión Preview con licencia propia (wirkung-model-and-runtime-1.0), dependiente del runtime `wirkung` en lugar de PyTorch, vLLM, MLX o Transformers. El autor remite las cifras de throughput dependientes de hardware al paper de la familia Origami, y no publica resultados de benchmarks estándar en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida SSM/atención: 24 capas Gated DeltaNet + 8 capas de atención completa (4 grupos KV), torre de visión de 27 capas; empaquetada como HCGM (Holographic Causal Graph Machine) |
| Parametros totales | 9,41B (9.410.000.000) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como cifra nominal; el autor documenta estado constante a cualquier horizonte, con evaluación de 4k a 1M tokens |
| Tipos de cuantizacion | no disponible (el artefacto usa reducción entera diádica `v3-exakt` y streams `rANS`, no cuantización estándar de pesos) |
| Idiomas soportados | en, de |
| Licencia | wirkung-model-and-runtime-1.0 (categoría "other") |
| Formato de pesos | 312 archivos de operador `.o3f` + `exact_core.safetensors`; repo de 2,7 GB |
| Huella en disco | 2,74 GB (frente a 18,85 GB BF16 del modelo base) |
| VRAM de GPU requerida | 0 GB (según el autor) |
| Estado de sesión | 14,82 MB constantes, O(1) |
| Runtime | `wirkung` + `numpy` (C11 standalone, NPU, sGPU, Metal, PTX) |
| Modelo base | Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B combina capas Gated DeltaNet (un mecanismo de estado recurrente lineal) con capas de atención completa, más una torre de visión, lo que lo sitúa en la categoría de transformers híbridos SSM/atención con capacidad multimodal. Origami-9B conserva esa topología de grafo según el autor ("identical graph topology") y no introduce ningún paso de entrenamiento: la compilación es cerrada y determinista.

El pipeline de compilación descrito consta de cuatro piezas. Primero, cada proyección densa se transforma una sola vez mediante una Fast Walsh-Hadamard Transform de 128 puntos con scrambling Rademacher, con semillas derivadas de SHA-256 a PCG64 y sin tablas de signos almacenadas, dando un stream `rANS` log-bilineal de cuatro clases emparejado con un cristal proyectivo de rango r. Segundo, las 24 capas Gated DeltaNet se contraen mediante scans asociativos del monoide WY, mientras que las 8 capas de atención completa sustituyen el KV cache ilimitado por un sink fijo en el token 0, una frontera local exacta de 1.024 tokens y centroides de estadísticos suficientes de Ward centrados en clave, lo que produce el estado constante de 14,82 MB. Tercero, la reducción entera diádica `v3-exakt` busca que CPU (AVX2/NEON), NPU, sGPU, Metal y PTX evalúen reducciones canónicas idénticas en lugar de aproximaciones de coma flotante. Cuarto, la lectura del `lm_head` usa una puerta certificada por Cauchy-Schwarz que poda el 99,9996% de las 248.320 filas sin deriva en decodificación greedy, y la trayectoria oculta se descompone en parte conocida de bajo rango más residuo.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que el autor no entrena el modelo. Tampoco se detalla el procedimiento de calibración de los centroides de Ward más allá de la descripción estructural.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5-9B.
- Razonamiento y matemáticas: capacidades del modelo base, sin métricas publicadas en la model card.
- Generación de código: capacidades del modelo base, sin métricas publicadas.
- Visión: la torre de visión de 27 capas se conserva en la topología compilada, por lo que el artefacto es multimodal según el autor.
- Soporte multilingüe limitado a inglés y alemán según los metadatos de idioma.
- Ejecución con estado constante O(1) a cualquier longitud de contexto, con frontera local exacta de 1.024 tokens en las capas de atención.
- Despliegue sin VRAM de GPU y sin RAM dedicada a pesos, mediante `mmap` desde SSD/NVMe.
- Ejecución sobre CPU, NPU, sGPU (`cpu_cuda`), Apple Metal y PTX standalone.
- Tool calling y function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia en equipos sin GPU: el artefacto requiere 0 GB de VRAM y 0 GB de RAM dedicada a pesos, por lo que puede ejecutarse en portátiles, mini-PC o servidores sin acelerador, leyendo los operadores desde SSD bajo demanda.
- Despliegue en el borde o en dispositivos embebidos: la combinación de 2,74 GB en disco y 14,82 MB de estado vivo permite alojar un modelo de 9,41B en entornos con presupuesto de memoria muy ajustado, incluidos NPU y sGPU.
- Conversaciones de contexto muy largo: el estado constante de 14,82 MB evita el crecimiento del KV cache (34,40 GB a 1M tokens en el modelo base), lo que hace viable mantener sesiones prolongadas en memoria acotada.
- Procesamiento por lotes en servidores de almacenamiento: al mapear los pesos desde NVMe, varias sesiones pueden compartir las mismas páginas de operador en caché de página del sistema operativo, reduciendo la duplicación de memoria entre procesos.
- Asistentes multilingües inglés-alemán: los idiomas declarados cubren atención al cliente y documentación técnica en esos dos mercados, con la salvedad de que no hay evaluación publicada de calidad por idioma.
- Evaluación e investigación de compilación sin reentrenamiento: el artefacto sirve como caso de estudio reproducible de plegado espectral y de sustitución de KV cache por estadísticos suficientes, con paper y DOI asociados.
- Tareas multimodales en local: al conservar la torre de visión, puede emplearse para descripción de imágenes o extracción de información de documentos en entornos sin GPU, aunque no se publican métricas de calidad multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card omite explícitamente las cifras de throughput dependientes de hardware y las remite al paper de la familia Origami. Los únicos datos cuantitativos publicados son estructurales: compresión de 18,85 GB a 2,74 GB (6,88x), estado constante de 14,82 MB, poda del 99,9996% de las filas del `lm_head` con 0 deriva greedy, y estado del modelo base de 34,40 GB a 1M tokens.

## Requisitos de hardware

- VRAM de GPU: 0 GB según el autor; el artefacto no requiere HBM ni memoria de dispositivo para los pesos.
- RAM dedicada a pesos: 0 GB; los operadores se mapean en modo lectura desde SSD o NVMe mediante `mmap` del sistema operativo.
- Estado de sesión: 14,82 MB constantes por sesión, independientemente de la longitud de contexto.
- Almacenamiento: 2,74 GB para el bundle `.o3f` más `exact_core.safetensors`; se recomienda SSD o NVMe por la latencia de acceso a páginas.
- GPU recomendadas: no aplica; el autor cita CPU con AVX2/NEON, NPU, sGPU (`cpu_cuda`), Apple Metal y PTX como backends. No se documentan modelos concretos de GPU (A100, H100, RTX 4090) ni cifras de latencia o throughput.
- Cabe en GPU de consumo: sí, en el sentido de que no necesita VRAM; el cuello de botella pasa al ancho de banda de almacenamiento y a la CPU.
- Opciones de despliegue: runtime `wirkung` (PyPI) con los comandos `wkng pull` y `wkng run`; dependencias `wirkung` + `numpy`. No es compatible con vLLM, llama.cpp, Ollama ni TGI según la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado de sesion | VRAM | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Origami-9B (wirkung) | 9,41B | no disponible (estado constante a cualquier horizonte) | 14,82 MB O(1) | 0 GB | wirkung-model-and-runtime-1.0 | `wirkung` + `numpy` |
| Qwen/Qwen3.5-9B (base) | 9,41B | no disponible | KV cache lineal (34,40 GB a 1M tokens) | Decenas de GB HBM | licencia de Qwen (no detallada aquí) | PyTorch, vLLM, MLX, Transformers |
| Alternativas de ~9B densas | no disponible | no disponible | KV cache lineal | 16-20 GB en BF16 | varía | vLLM, llama.cpp, Ollama |

No se dispone de datos de benchmarks que permitan comparar la calidad de salida de Origami-9B frente a Qwen3.5-9B u otros modelos de tamaño similar; la comparación anterior se limita a propiedades estructurales y de despliegue.

## Limitaciones y advertencias

- Versión Preview: el propio autor la etiqueta como tal; la estabilidad de la API del runtime `wirkung` y del formato `.o3f` no está garantizada.
- Licencia restrictiva y poco habitual: wirkung-model-and-runtime-1.0, categoría "other", con texto en el archivo LICENSE del repositorio; es imprescindible revisarla antes de cualquier uso comercial, ya que puede imponer condiciones sobre el runtime además de sobre los pesos.
- Dependencia de un runtime propietario: no funciona con vLLM, llama.cpp, Ollama, TGI ni Transformers, lo que limita la integración con infraestructura existente y ata el despliegue al proyecto `wirkung`.
- Sin benchmarks publicados: no hay evidencia independiente de que la compilación preserve la calidad del modelo base en MMLU, HumanEval, GSM8K ni tareas multimodales; la afirmación de "0 deriva greedy" se refiere a la poda del `lm_head`, no a la fidelidad global de las salidas.
- Idiomas limitados a inglés y alemán según los metadatos; no se declara soporte de español.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable al tratarse de un modelo generativo de 9B sin evaluación publicada.
- Sesgos: no documentados por el autor.
- Estado constante con frontera local de 1.024 tokens: la atención completa se sustituye por un sink en el token 0, una ventana local y centroides, lo que puede degradar la recuperación de información distante frente a un KV cache exacto; no hay evaluación publicada que lo mida.
- Rendimiento dependiente del almacenamiento: al ejecutar desde `mmap`, la latencia depende de la velocidad de SSD/NVMe y de la caché de páginas; no se publican cifras de throughput.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wirkung/Origami-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper: paper/Wirkung_2026_Origami_HCGM.pdf (referenciado en la model card)
- DOI: https://doi.org/10.13140/RG.2.2.31826.72647
- Runtime en PyPI: https://pypi.org/project/wirkung/
- Sitio del autor: https://wirku.ng
- Publicaciones previas del autor: https://huggingface.co/tfwnotops
- Contacto: mailto:contact@wirku.ng
- Licencia: LICENSE (archivo del repositorio)

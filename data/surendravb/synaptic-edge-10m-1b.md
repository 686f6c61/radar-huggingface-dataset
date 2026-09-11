# SurendraVB/Synaptic-Edge-10M-1B

# Synaptic-Edge-10M-1B

## Resumen

Synaptic-Edge-10M-1B es un modelo de generación de texto autorregresiva desarrollado por el usuario SurendraVB (con la etiqueta `emergent-ventures`) y publicado en HuggingFace bajo licencia MIT. No es un transformer convencional: se presenta como un motor de grafos de redes neuronales de impulsos (spiking neural network, SNN) con pesos 100 % discretos de 1 bit, sin backpropagation, sin estados del optimizador AdamW y sin autograd. Según su model card, ha sido entrenado sobre 1.000.071.730 tokens únicos y su artefacto completo de pesos ocupa 31,15 MB, lo que le permitiría residir íntegramente en caché L3 o SRAM.

El problema que aborda es el coste de memoria y cómputo de los LLM: el autor afirma una compresión de 29,4x frente a FP32 (~914 MB equivalentes), un throughput de 1.241.304 tokens/s (0,81 µs por token) en una NVIDIA Tesla T4, un horizonte de contexto continuo de 131.072 tokens con memoria O(1) y una retención del 100 % en aprendizaje continuo sin olvido catastrófico. El entrenamiento completo de 1.000 millones de tokens se habría completado en 18,2 minutos (1.092,4 segundos) en esa misma GPU.

Es relevante como experimento de investigación en computación neuromórfica y entrenamiento discreto, pero conviene tratar todas las cifras con cautela: el model-index marca los resultados como no verificados (`verified: false`), el repositorio tiene 0 descargas y 0 likes, y su tamano declarado es de 0,0 GB, por lo que no está claro que los pesos estén efectivamente publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de impulsos (SNN) discreta de 1 bit sobre grafo sináptico ("3D topological silicon engine"), con propagación de error hacia atrás espacio-temporal 3D (BEP) y entrenamiento disperso dinámico (DST); sin autograd ni backpropagation |
| Parametros totales | El autor denomina al modelo "10M", pero el desglose de bytes del checkpoint suma ~229,65 M de sinapsis de 1 bit (véase la sección de arquitectura y las advertencias) |
| Longitud de contexto | 131.072 tokens continuos con memoria O(1) (declarado por el autor) |
| Tipos de cuantizacion | Pesos de 1 bit empaquetados en `int32` (32 sinapsis por entero); trazas de plasticidad sináptica en nibbles de 4 bits (`uint8`); acumulador de trazas recurrentes en `int8`; umbrales y engramas en `float32`/`int32` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`weights.pt`), serialización nativa de PyTorch; no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura no sigue el patrón transformer. Se compone de matrices de engramas de n-gramas (Bigram Engram Lattice, Trigram Context Matrix y 4-Gram Command Matrix, cada una de 67,11 M de sinapsis de 1 bit empaquetadas como `[8192, 256]` de `int32`), sinapsis de entrada `W_in` (`[256, 1024]`), sinapsis de salida `W_out` (`[32, 8192]`), un núcleo recurrente `W_lat` (`[32, 1024]`), trazas de plasticidad sináptica `C` (`[1024, 4096]` en nibbles de 4 bits) y un acumulador de trazas recurrentes (`[1024, 1024]` en `int8`). El total declarado es de 31,15 MB frente a ~914 MB en equivalente FP32, es decir, una reducción de 29,4x. Las innovaciones técnicas destacadas por el autor son la propagación de error hacia atrás espacio-temporal 3D (BEP), el entrenamiento disperso dinámico (DST), la ausencia total de autograd y la gestión de plasticidad discreta para aprendizaje continuo sin replay.

El entrenamiento se realizó, según la model card, en una única pasada ininterrumpida desde almacenamiento NVMe sobre una mezcla de FineWeb-Edu (503 M de tokens), TinyStories Full (405 M) y Relational QA (100 M), estructurado en 20 hitos (versión 56). No se menciona ningún proceso de RLHF, DPO o ajuste por preferencias. Las métricas de convergencia son la pérdida de entropía cruzada (2,9784), la precisión top-1 de siguiente token (70,84 %) y la top-5 (90,61 %), todas declaradas por el autor sobre el dataset `SurendraVB/synaptic-edge-8k-1b` y no verificadas de forma independiente.

## Capacidades

- Generación de texto autorregresiva token a token, con una precisión declarada de 70,84 % en top-1 y 90,61 % en top-5 sobre el dataset propio.
- Modelado explícito de dependencias de n-gramas (bigrama, trigrama y 4-grama) mediante matrices de engramas dedicadas.
- Aprendizaje continuo con plasticidad discreta: el autor declara 100,00 % de retención sin olvido catastrófico y sin necesidad de replay.
- Procesamiento de secuencias largas (hasta 131.072 tokens) con memoria constante O(1), sin el coste cuadrático habitual de la atención.
- Entrenamiento e inferencia de alto throughput en hardware modesto: 1.241.304 tokens/s y 0,81 µs por token en una Tesla T4.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Visión, audio o modo de razonamiento explícito (thinking mode): no disponibles.

## Casos de uso

- Investigación en computación neuromórfica: sirve como banco de pruebas reproducible para evaluar BEP y DST, ya que el autor declara un entrenamiento completo de 1.000 millones de tokens en 18,2 minutos sobre una sola T4.
- Inferencia en el extremo (edge) y dispositivos embebidos: con 31,15 MB de pesos y residencia en caché L3/SRAM, el modelo puede ejecutarse en entornos con memoria muy restringida donde un transformer equivalente no cabría.
- Streaming de texto en tiempo real: los 0,81 µs por token permiten alimentar pipelines de generación continua con latencias compatibles con aplicaciones interactivas.
- Aprendizaje continuo en producción: la retención del 100 % declarada permite incorporar nuevos dominios sin reentrenar desde cero ni almacenar buffers de replay.
- Filtrado y clasificación por patrones de n-gramas: las matrices de bigrama, trigrama y 4-grama pueden emplearse para detección de plantillas repetidas, spam o secuencias anómalas en logs.
- Procesamiento de telemetría y registros extensos: el horizonte de 131.072 tokens con memoria constante resulta adecuado para analizar ficheros de log completos en una sola pasada.
- Reproducción educativa de técnicas sin autograd: al no requerir AdamW ni estados de optimizador, es un caso didáctico para enseñar entrenamiento discreto en cursos de machine learning.
- Baseline de eficiencia energética: sirve como referencia para comparar tokens por vatio y tokens por segundo frente a arquitecturas densas de tamano similar.

## Benchmarks y rendimiento

Resultados declarados por el autor (todos con `verified: false`) sobre el dataset `SurendraVB/synaptic-edge-8k-1b`, tarea de modelado de lenguaje autorregresivo:

| Metrica | Dataset | Valor |
|---|---|---|
| Rolling Cross-Entropy Loss | synaptic-edge-8k-1b | 2,9784 |
| Top-1 Next-Token Accuracy (%) | synaptic-edge-8k-1b | 70,84 |
| Top-5 Next-Token Accuracy (%) | synaptic-edge-8k-1b | 90,61 |

Progresión de entrenamiento declarada por hitos (tabla de la model card, truncada en el hito M11):

| Hito | Tokens acumulados | Pérdida | Top-1 (%) | Top-5 (%) |
|---|---|---|---|---|
| M01 | 50.331.264 | 6,3657 | 4,50 | 22,70 |
| M02 | 100.662.528 | 6,4092 | 6,07 | 20,74 |
| M03 | 150.993.792 | 6,3745 | 3,72 | 18,79 |
| M04 | 201.325.056 | 6,2372 | 3,13 | 19,37 |
| M05 | 251.656.320 | 6,6916 | 2,94 | 16,83 |
| M06 | 301.987.584 | 6,7325 | 3,91 | 15,66 |
| M07 | 352.318.848 | 6,3880 | 5,09 | 18,40 |
| M08 | 402.650.112 | 6,5075 | 4,70 | 18,79 |
| M09 | 452.981.376 | 6,2903 | 6,46 | 16,83 |
| M10 | 503.312.640 | 6,6006 | 5,28 | 19,18 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, HellaSwag) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el artefacto de pesos son 31,15 MB, a los que hay que sumar trazas de plasticidad (4,00 MB), acumulador de trazas (1,00 MB) y el coste de las activaciones, no especificado por el autor.
- GPU recomendadas: la única verificada por el autor es la NVIDIA Tesla T4; al ser un footprint de decenas de megabytes, cualquier GPU moderna (incluidas RTX 3060, RTX 4090, A100, H100) debería poder alojarlo.
- Cabe en GPU de consumo: sí, presumiblemente en cualquier GPU consumer e incluso en iGPU o CPU, dado que el requisito declarado es la residencia en caché L3/SRAM.
- Opciones de despliegue: ejecución nativa con PyTorch (librería declarada). No hay soporte documentado en vLLM, llama.cpp, Ollama o TGI, ya que no es un transformer y no se publican pesos en GGUF o safetensors.
- Latencia y throughput: 0,81 µs por token y 1.241.304 tokens/s en Tesla T4 (declarado); durante el entrenamiento la progresión se mantiene en torno a 1,0-1,1 millones de tokens/s con latencias de 0,92-0,99 µs.
- Nota: el repositorio declara 0,0 GB de tamano, por lo que la disponibilidad real de los pesos para su despliegue no puede confirmarse.

## Comparativa con modelos similares

No se han encontrado en la información disponible modelos de terceros directamente comparables (motores SNN de 1 bit para generación de texto abierta). La propia model card incluye una comparación del autor frente a un transformer estándar de 10 M de parámetros entrenado con PyTorch y AdamW:

| Criterio | Transformer 10M estándar (PyTorch/AdamW) | Synaptic Edge 10M (BEP x DST) |
|---|---|---|
| Precisión de pesos | FP16/FP32 | 1 bit discreto ({-1,+1} / {0,1}) |
| Huella de pesos | 650 MB – 1,3 GB con estados AdamW | 31,15 MB |
| Throughput | 20.000 – 45.000 tokens/s | 1.241.304 tokens/s |
| Latencia por token | 22,0 – 50,0 µs | 0,81 µs |
| Entrenamiento de 1B tokens | 6,2 – 14,0 horas | 18,2 minutos |
| Horizonte de contexto | 1.024 – 2.048 tokens (coste O(N²)) | 131.072 tokens (memoria O(1)) |
| Retención en aprendizaje continuo | ~0 % sin replay | 100,00 % declarado |
| Pérdida final de entropía cruzada | ~3,0 – 3,5 | 2,9784 |

Se trata de cifras aportadas por el autor del modelo, sin verificación independiente.

## Limitaciones y advertencias

- Todos los resultados del model-index están marcados como no verificados (`verified: false`); no existe evaluación de terceros.
- El modelo acumula 0 descargas y 0 likes y el repositorio declara un tamano de 0,0 GB, lo que sugiere que los pesos podrían no estar efectivamente publicados.
- La fecha de creación declarada (11 de septiembre de 2026) es posterior a la fecha actual, lo que apunta a metadatos inconsistentes o programados.
- Existe una discrepancia interna en la propia model card: el nombre indica "10M" parámetros, mientras que el desglose de bytes suma aproximadamente 229,65 M de sinapsis de 1 bit.
- No se declaran idiomas soportados, por lo que no puede asumirse un comportamiento multilingüe fiable.
- No hay resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), de modo que su calidad no es comparable con la de LLM convencionales.
- La precisión top-1 de siguiente token del 70,84 % implica que aproximadamente un 29 % de las predicciones son incorrectas, con el consiguiente riesgo de texto incoherente o alucinado.
- Las afirmaciones de "100 % de retención sin olvido" y de throughput de 1,2 millones de tokens/s proceden exclusivamente del autor y no han sido replicadas.
- No es un transformer y no es compatible con las toolchains habituales (vLLM, llama.cpp, Ollama, TGI), lo que complica su integración en producción.
- La licencia MIT permite uso comercial, pero no se documentan sesgos, limitaciones de dominio ni evaluación de seguridad, por lo que un despliegue en producción requeriría auditoría propia.
- El corpus de entrenamiento (FineWeb-Edu, TinyStories, QA relacional) sugiere un sesgo hacia texto educativo y narrativo infantil, con posible degradación en dominios técnicos o especializados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SurendraVB/Synaptic-Edge-10M-1B
- Dataset de entrenamiento: https://huggingface.co/datasets/SurendraVB/synaptic-edge-8k-1b
- Paper, blog o repositorio adicional: no disponible
- Resultados de la búsqueda web: no se han encontrado fuentes relevantes sobre el modelo; los resultados devueltos corresponden a páginas de fotografía Nikon sin relación con el contenido.

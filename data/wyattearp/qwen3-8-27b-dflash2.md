# wyattearp/Qwen3.8-27B-DFlash2

## Resumen

Qwen3.8-27B-DFlash2 es un modelo de borrado (draft model) para decodificación especulativa, desarrollado por Inco AI (z-lab) y publicado bajo licencia Apache-2.0. No es un modelo de lenguaje autónomo: su función es acelerar la inferencia del modelo objetivo Qwen/Qwen3.8-27B prediciendo bloques completos de tokens en paralelo, que luego el modelo grande verifica. Esta técnica, denominada DFlash 2, consigue multiplicar por más de tres la velocidad de generación en escenarios de baja concurrencia, manteniendo una salida idéntica a la decodificación autoregresiva (lossless).

El modelo tiene 1.924.404.480 parámetros (aproximadamente 1,9 mil millones) y un tamaño de repositorio de 3,8 GB en formato safetensors. Su arquitectura se basa en difusión por bloques con un selector ligero de trayectorias y convoluciones dinámicas de dos taps, lo que evita la degradación de la calidad del borrador hacia el final de cada bloque. Está diseñado para integrarse en servidores de inferencia como SGLang o vLLM, y su relevancia actual radica en la creciente demanda de reducir la latencia y el coste computacional de los grandes modelos de lenguaje sin sacrificar calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion drafter (DFlash 2) con selector de trayectoria y convoluciones dinamicas de dos taps |
| Parametros totales | 1.924.404.480 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible (no se especifican; el modelo se distribuye en FP16) |
| Idiomas soportados | No disponibles (el drafter no procesa lenguaje directamente; hereda los del modelo objetivo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DFlash 2 es un drafter de difusión por bloques. A diferencia de los modelos de lenguaje convencionales que predicen un token cada vez, este modelo genera un bloque completo de tokens en una sola pasada, manteniendo los mejores candidatos en cada posición. Un selector ligero traza después una única trayectoria coherente a través de esos candidatos, que es la que se presenta al modelo objetivo para su verificación. La columna vertebral del drafter incorpora convoluciones dinámicas de dos taps, diseñadas para evitar que la calidad del borrador se degrade hacia el final del bloque, un problema común en los métodos de decodificación especulativa.

El entrenamiento del modelo no está documentado en la información disponible: no se especifican los datos de entrenamiento, el número de tokens ni el proceso de alineación. Sin embargo, la decodificación es lossless: en modo greedy, la salida coincide exactamente con la del modelo objetivo, y en modo sampling se preserva la distribución original mediante rejection sampling. El drafter está pensado para funcionar con los parámetros de muestreo recomendados por Qwen3.8 (temperatura 1.0, top-p 0.95, top-k 20) y con un nivel de razonamiento `xhigh` del modelo objetivo.

## Capacidades

- Aceleración de la decodificación especulativa para Qwen/Qwen3.8-27B, con un speedup de hasta 3,43× en concurrencia 1 y 2,84× en concurrencia 8 frente a la decodificación autoregresiva.
- Compatibilidad con SGLang (algoritmo `DFLASH`) y vLLM (método `dflash`), ambos con soporte para FlashAttention 3.
- Generación de bloques de 8 tokens por paso de verificación (7 tokens de borrador más el token de verificación).
- Preservación exacta de la distribución del modelo objetivo en modo sampling (lossless).
- Funciona con el modo de razonamiento extendido (`xhigh`) del modelo Qwen3.8-27B.
- No dispone de capacidades propias de tool calling, agentes, visión o audio, ya que no es un modelo de generación autónoma.

## Casos de uso

- Despliegue de Qwen3.8-27B en producción con baja latencia: el drafter reduce el tiempo de generación en servicios de chat o asistencia en tiempo real, donde cada milisegundo cuenta.
- Autocompletado de código en entornos locales: con una GPU consumer (por ejemplo, RTX 3090 o 4090), el conjunto drafter + modelo objetivo puede ofrecer una experiencia fluida de completado de código, como se demuestra en el repositorio comunitario RayCodes_Qwen_3.8_DFlash2.
- Servidores de inferencia con alta concurrencia: a concurrencia 8, DFlash 2 alcanza un throughput de 1.328 tokens/s en GSM8K, un 2,84× respecto a la línea base, lo que permite atender más peticiones simultáneas con el mismo hardware.
- Reducción de coste operativo: al acelerar la generación sin cambiar la calidad, se reduce el tiempo de ocupación de GPU y, por tanto, el coste por token servido.
- Investigación en decodificación especulativa: el modelo sirve como referencia para comparar técnicas de borrado por bloques frente a MTP o DSpark, y para estudiar la interacción entre drafter y modelo objetivo.
- Integración en pipelines de generación de texto con requisitos estrictos de reproducibilidad: al ser lossless, garantiza que la salida sea idéntica a la decodificación autoregresiva, lo que facilita la validación y el testeo.

## Benchmarks y rendimiento

Los resultados se obtuvieron con SGLang sobre una NVIDIA H200, con FlashAttention 3, bloque de especulación de 8 tokens (7 de borrador), sampling con los parámetros recomendados de Qwen3.8 y un máximo de 4096 tokens nuevos. Se comparan tres métodos especulativos: MTP (multi-token prediction integrado en Qwen3.8), DSpark (drafter comunitario) y DFlash 2.

### Acceptance length (media de tokens aceptados por paso de verificación)

| Tarea | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 5.02 | 4.36 | **5.46** |
| MATH-500 | 4.72 | 3.92 | **5.28** |
| HumanEval | 3.91 | 3.30 | **4.39** |
| MBPP | 3.99 | 3.51 | **4.79** |
| MT-Bench | 3.74 | 3.01 | **4.10** |

### Throughput (tokens de salida por segundo, con speedup frente a autoregresivo)

#### Concurrencia 1

| Tarea | Autoregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 68.9 | 178.5 (2.59×) | 185.3 (2.69×) | **236.1 (3.43×)** |
| MATH-500 | 69.0 | 172.8 (2.51×) | 174.5 (2.53×) | **230.7 (3.34×)** |
| HumanEval | 69.0 | 151.9 (2.20×) | 159.9 (2.32×) | **214.6 (3.11×)** |
| MBPP | 69.0 | 153.1 (2.22×) | 163.3 (2.37×) | **226.9 (3.29×)** |
| MT-Bench | 68.9 | 134.9 (1.96×) | 137.6 (2.00×) | **184.0 (2.67×)** |

#### Concurrencia 8

| Tarea | Autoregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 467.2 | 1,022.1 (2.19×) | 1,040.8 (2.23×) | **1,328.7 (2.84×)** |
| MATH-500 | 480.0 | 1,023.5 (2.13×) | 1,025.8 (2.14×) | **1,368.3 (2.85×)** |
| HumanEval | 483.4 | 934.2 (1.93×) | 956.5 (1.98×) | **1,291.5 (2.67×)** |
| MBPP | 478.0 | 938.1 (1.96×) | 974.1 (2.04×) | **1,328.0 (2.78×)** |
| MT-Bench | 480.5 | 835.2 (1.74×) | 802.3 (1.67×) | **1,090.2 (2.27×)** |

#### Concurrencia 32

| Tarea | Autoregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 1,329.8 | 1,381.1 (1.04×) | 1,506.5 (1.13×) | **1,922.5 (1.45×)** |
| MATH-500 | 1,505.8 | 1,415.6 (0.94×) | 1,429.0 (0.95×) | **1,951.8 (1.30×)** |
| HumanEval | 1,546.5 | 1,296.8 (0.84×) | 1,330.1 (0.86×) | **1,799.0 (1.16×)** |
| MBPP | 1,507.7 | 1,314.9 (0.87×) | 1,361.3 (0.90×) | **1,886.8 (1.25×)** |
| MT-Bench | 1,507.4 | 1,159.7 (0.77×) | 1,115.5 (0.74×) | **1,525.3 (1.01×)** |

## Requisitos de hardware

- El drafter tiene aproximadamente 1,9 mil millones de parámetros, lo que en FP16 ocupa unos 3,8 GB de VRAM. Puede ejecutarse en GPUs consumer como RTX 3090, RTX 4090 o incluso en la DGX Spark, según se menciona en foros de NVIDIA.
- Para el modelo objetivo Qwen3.8-27B se necesitan al menos 16-20 GB de VRAM en FP16, o menos si se cuantiza. El conjunto completo (drafter + objetivo) cabe en una GPU de 24 GB como la RTX 3090/4090.
- Las pruebas de rendimiento se realizaron en una NVIDIA H200 con FlashAttention 3, tanto para la atención del drafter como para la del modelo objetivo.
- Opciones de despliegue: SGLang (recomendado, con `--speculative-algorithm DFLASH`) y vLLM (con `--speculative-config`). Ambos requieren versiones específicas que soporten el algoritmo DFlash.
- La latencia y el throughput dependen de la concurrencia y del hardware. En una H200, a concurrencia 1 se alcanzan entre 184 y 236 tokens/s según la tarea; a concurrencia 8, entre 1.090 y 1.368 tokens/s.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (GSM8K, conc. 1) | Licencia |
| :--- | :--- | ---: | ---: | ---: | ---: |
| Qwen3.8-27B-DFlash2 | Drafter block-diffusion | 1,9B | No disponible | 236.1 tok/s (3.43×) | Apache-2.0 |
| MTP integrado en Qwen3.8 | Multi-token prediction | No aplica (parte del modelo) | No disponible | 178.5 tok/s (2.59×) | Apache-2.0 |
| RadixArk/Qwen3.8-27B-DSpark | Drafter especulativo | No disponible | No disponible | 185.3 tok/s (2.69×) | No disponible |

DFlash 2 supera tanto al MTP integrado como al drafter DSpark en acceptance length y throughput en todas las tareas y niveles de concurrencia evaluados. A alta concurrencia (32), la ventaja se reduce pero sigue siendo positiva, mientras que MTP y DSpark llegan a ser más lentos que la decodificación autoregresiva en algunos casos.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: no puede generar texto por sí mismo. Requiere el modelo objetivo Qwen3.8-27B y un servidor de inferencia compatible (SGLang o vLLM con soporte DFlash).
- Solo funciona con Qwen3.8-27B; no es portable a otros modelos sin reentrenamiento.
- Depende de versiones específicas de SGLang y vLLM que implementen el algoritmo DFlash. Las instrucciones de instalación usan ramas de desarrollo o pull requests, lo que puede complicar el despliegue en entornos de producción estables.
- No se han publicado datos sobre sesgos, alucinaciones o calidad del lenguaje, ya que el drafter no genera texto directamente. Estas características vienen determinadas por el modelo objetivo.
- El rendimiento a alta concurrencia (32) muestra una ventaja menor (1.01× a 1.45×) y en algunos casos MTP o DSpark pueden degradar el rendimiento; es necesario evaluar el punto de equilibrio según la carga esperada.
- La licencia Apache-2.0 permite uso comercial, pero el modelo objetivo Qwen3.8-27B también debe cumplir su propia licencia (Apache-2.0 en este caso).

## Enlaces

- Repositorio HuggingFace (autor original): https://huggingface.co/wyattearp/Qwen3.8-27B-DFlash2
- Repositorio HuggingFace (espejo oficial de Inco AI): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Repositorio HuggingFace (espejo de z-lab): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DSpark (comparativa): https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Guia de hardware para Qwen3.8-27B: https://www.contextstudios.ai/blog/qwen-3-8-27b-hardware-guide
- Repositorio comunitario de ejemplo: https://github.com/47thtechcorner/RayCodes_Qwen_3.8_DFlash2

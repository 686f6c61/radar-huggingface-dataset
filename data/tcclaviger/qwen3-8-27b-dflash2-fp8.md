# tcclaviger/Qwen3.8-27B-DFlash2-FP8

## Resumen

Este repositorio contiene la versión cuantizada en FP8 (bloque 128) del modelo de borrador DFlash 2, desarrollado por Inco AI y publicado aquí como espejo por el usuario tcclaviger. DFlash 2 no es un modelo de lenguaje autónomo, sino un componente auxiliar diseñado para acelerar la inferencia del modelo objetivo `Qwen/Qwen3.8-27B` mediante decodificación especulativa. El modelo predice bloques completos de tokens en una sola pasada, mantiene múltiples candidatos y un selector ligero traza una ruta coherente, lo que permite verificar más tokens por paso y aumentar el throughput sin pérdida de calidad.

La cuantización FP8 (e4m3) con escalas por bloques de 128×128 y activaciones dinámicas reduce el tamaño del drafter a aproximadamente 1,9 GB, manteniendo las normas, los kernels de convolución y el selector en BF16. Es compatible con motores de inferencia como SGLang y vLLM mediante sus respectivas implementaciones del algoritmo DFLASH. Su relevancia actual radica en que ofrece una de las mayores aceleraciones documentadas para decodificación especulativa en modelos de la familia Qwen3.8, con ganancias de hasta 3,43× en throughput respecto a la decodificación autoregresiva en entornos de baja concurrencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion drafter (convoluciones dinámicas de dos taps, selector de candidatos) |
| Parametros totales | 1.924.404.480 |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | FP8 (e4m3) con escalas por bloque 128×128, activaciones dinámicas; capas de atención y MLP en FP8, normas y selector en BF16 |
| Idiomas soportados | No disponible (el drafter opera sobre tokens del modelo objetivo, que soporta múltiples idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

DFlash 2 emplea una arquitectura de difusión por bloques diseñada específicamente para decodificación especulativa. En lugar de predecir un token a la vez, genera un bloque completo de tokens en una sola pasada y mantiene los mejores candidatos en cada posición. Un selector ligero, que se mantiene en BF16, traza una única ruta coherente a través de los candidatos. Las convoluciones dinámicas de dos taps en la parte principal evitan que el borrador se degrade hacia el final del bloque, mejorando la calidad de las predicciones. La decodificación es sin pérdida: la salida greedy coincide exactamente con el modelo objetivo y el muestreo preserva la distribución original.

No se han publicado detalles específicos sobre el conjunto de datos de entrenamiento, el número de tokens o el uso de técnicas de alineación (RLHF/DPO). El modelo se presenta como una cuantización FP8 del drafter original de Inco AI, sin cambios en la arquitectura subyacente. La cuantización afecta únicamente a las proyecciones de atención y MLP, así como a la capa auxiliar `fc`, manteniendo la precisión BF16 en los componentes críticos para el rendimiento.

## Capacidades

- Aceleración de la decodificación del modelo `Qwen/Qwen3.8-27B` mediante especulación de bloques de hasta 8 tokens (7 tokens de borrador por paso de verificación).
- Mantenimiento de la calidad de generación: la salida greedy es idéntica a la del modelo objetivo, y el muestreo conserva la distribución.
- Compatibilidad con motores de inferencia populares: SGLang y vLLM (mediante configuraciones específicas).
- Soporte para concurrencia desde 1 hasta 32 peticiones simultáneas, con mejoras de throughput incluso en alta concurrencia.
- No es un modelo de generación de texto independiente; no posee capacidades de tool calling, razonamiento autónomo, visión ni audio.

## Casos de uso

- **Optimización de servidores de chat en tiempo real**: al desplegar `Qwen3.8-27B` con DFlash 2, se reduce la latencia por petición en un factor de 2 a 3,4×, lo que permite atender más usuarios con el mismo hardware.
- **Inferencia en entornos con recursos limitados**: el drafter ocupa solo 1,9 GB en FP8, lo que permite ejecutar el modelo objetivo (27B) en configuraciones de memoria ajustadas sin sacrificar calidad.
- **Integración en pipelines de agentes**: para tareas de razonamiento multi-paso con `xhigh` effort, el aumento de throughput de 2,67× en MT-Bench permite completar cadenas de razonamiento más largas en tiempos reducidos.
- **Entornos de desarrollo y pruebas**: los desarrolladores pueden evaluar rápidamente el comportamiento del modelo objetivo en tareas de código (HumanEval, MBPP) con una velocidad de generación de 214,6 tokens/s en concurrencia 1, frente a los 69,0 tokens/s de decodificación autoregresiva.
- **Sistemas de producción con alta concurrencia**: en concurrencia 32, DFlash 2 mantiene una mejora de al menos 1,16× sobre el autoregresivo, aunque la ganancia se reduce, sigue siendo útil para maximizar el rendimiento agregado.
- **Comparación de métodos de decodificación**: sirve como referencia para investigadores que evalúan técnicas de decodificación especulativa, ya que se proporcionan métricas de aceptación y throughput frente a MTP y DSpark.

## Benchmarks y rendimiento

Los datos publicados en la model card se refieren a métricas de velocidad y aceptación, no a precisión en tareas de razonamiento. Las pruebas se realizaron con SGLang en una NVIDIA H200, con FlashAttention 3, bloque de especulación de 8 tokens, muestreo con temperatura 1.0, top-p 0.95 y top-k 20, y un máximo de 4096 tokens generados.

### Longitud de aceptación media (tokens por paso de verificación)

| Tarea | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 5.02 | 4.36 | **5.46** |
| MATH-500 | 4.72 | 3.92 | **5.28** |
| HumanEval | 3.91 | 3.30 | **4.39** |
| MBPP | 3.99 | 3.51 | **4.79** |
| MT-Bench | 3.74 | 3.01 | **4.10** |

### Throughput (tokens de salida por segundo, speedup vs. autoregresivo)

#### Concurrencia 1

| Tarea | Autoregresivo | MTP | DSpark | DFlash 2 |
|-------| ---: | ---: | ---: | ---: |
| GSM8K | 68.9 | 178.5 (2.59×) | 185.3 (2.69×) | **236.1 (3.43×)** |
| MATH-500 | 69.0 | 172.8 (2.51×) | 174.5 (2.53×) | **230.7 (3.34×)** |
| HumanEval | 69.0 | 151.9 (2.20×) | 159.9 (2.32×) | **214.6 (3.11×)** |
| MBPP | 69.0 | 153.1 (2.22×) | 163.3 (2.37×) | **226.9 (3.29×)** |
| MT-Bench | 68.9 | 134.9 (1.96×) | 137.6 (2.00×) | **184.0 (2.67×)** |

### Concurrencia 8

| Tarea | Autoregresivo | MTP | DFlash | DFlash 2 |
| --- | ---: | ---: | ---: | ---: |
| GSM8K | 467.2 | 1,022.1 (2.19×) | 1,040.8 (2.23×) | **1,328.7 (2.84×)** |
| MATH-500 | 480.0 | 1,023.5 (2.13×) | 1,025.8 (2.14×) | **1,368.3 (2.85×)** |
| HumanEval | 483.4 | 934.2 (1.93×) | 956.5 (1.98×) | **1,291.5 (2.67×)** |
| MBPP | 478.0 | 938.1 (1.96×) | 974.1 (2.04×) | **1,328.0 (2.78×)** |
| MT-Bench | 480.5 | 835.2 (1.74×) | 802.3 (1.67×) | **1,090.2 (2.27×)** |

### Concurrencia 32

| Tarea | Autoregresivo | MTP | DFlash | DFlash 2 |
| --- | ---: | ---: | ---: | ---: |
| GSM8K | 1,329.8 | 1,381.1 (1.04×) | 1,506.5 (1.13×) | **1,922.5 (1.45×)** |
| MATH-500 | 1,505.8 | 1,415.6 (0.94×) | 1,429.0 (0.95×) | **1,951.8 (1.30×)** |
| HumanEval | 1,546.5 | 1,296.8 (0.84×) | 1,330.1 (0.86×) | **1,799.0 (1.16×)** |
| MBPP | 1,507.7 | 1,314.9 (0.87×) | 1,361.3 (0.90×) | **1,886.8 (1.25×)** |
| MT-Bench | 1,507.4 | 1,159.7 (0.77×) | 1,115.5 (0.74×) | **1,525.3 (1.01×)** |

## Requisitos de hardware

- El drafter en FP8 ocupa aproximadamente 1,9 GB de memoria (peso de 1,92B parámetros en FP8). Para la inferencia conjunta con el modelo objetivo de 27B, se requiere al menos la VRAM necesaria para ese modelo (por ejemplo, 24 GB para cuantización de 8 bits o 48 GB para BF16, dependiendo del formato).
- GPU recomendadas: cualquier GPU con soporte para FP8 (por ejemplo, NVIDIA H100, H200, A100 con Ampere o más reciente, RTX 4090 con Ada Lovelace). En el caso de SGLang, se usó una H200 con FlashAttention 3.
- No cabe en una GPU de consumo media (por ejemplo, RTX 3060 de 12 GB) si se usa el modelo objetivo completo; el drafter solo cabría, pero no es útil sin el modelo principal.
- Opciones de despliegue: SGLang (con el comando de ejemplo) o vLLM (con la configuración `dflash`). Ambos motores gestionan la carga y la verificación.
- La latencia y el throughput dependen del hardware. En una H200, con concurrencia 1, se alcanzan entre 184 y 236 tokens/s según la tarea; con concurrencia 32, entre 1,090 y 1,922 tokens/s.

## Comparativa con modelos similares

La comparación se establece con otros métodos de decodificación especulativa para el mismo modelo objetivo `Qwen3.8-27B`:

| Método | Tipo | Parámetros | Aceptación media (GSM8K) | Throughput (concurrencia 1, GSM8K) | Licencia |
| --- | --- | --- | --- | --- | --- |
| MTP (Multi-Token Prediction) | Integrado en el modelo | No adicional | 5.02 | 178.5 tok/s (2.59×) | Apache 2.0 |
| DSpark (RadixArk) | Drafter externo | No disponible | 4.36 | 185.3 tok/s (2.69×) | No disponible |
| DFlash 2 (este modelo) | Drafter externo | 1.43B | 5.46 | 236.1 tok/s (3.43×) | Apache 2.0 |

DFlash 2 supera tanto a MTP como a DSpark en aceptación y throughput en todas las tareas y concurrencias probadas. La ventaja es más pronunciada en baja concurrencia, donde la especulación paralela reduce la latencia de forma más eficaz.

## Limitaciones y advertencias

- **No es un modelo autónomo**: no puede generar texto por sí mismo; requiere el modelo objetivo `Qwen3.8-27B` y un motor de inferencia compatible.
- **Dependencia de la implementación**: la aceleración solo se obtiene si se usa SGLang o vLLM con las versiones específicas que soportan el algoritmo DFLASH. Otras implementaciones podrían no ser compatibles.
- **Riesgo de alucinación**: no aplica directamente al drafter, pero el modelo objetivo puede generar contenido incorrecto; el drafter no añade ni corrige información.
- **Sesgos**: no se han documentado sesgos específicos del drafter, pero hereda los sesgos del modelo objetivo.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial y modificación, pero es necesario citar el trabajo original según la sección de citación.
- **Cuantización FP8**: la versión FP8 puede tener una ligera pérdida de precisión en las proyecciones, aunque no se han publicado evaluaciones comparativas de calidad frente a la versión BF16 del drafter.

## Enlaces

- Repositorio HuggingFace de este modelo: [tcclaviger/Qwen3.8-27B-DFlash2-FP8](https://huggingface.co/tcclaviger/Qwen3.8-27B-DFlash2-FP8)
- Repositorio original de Inco AI: [incoai/Qwen3.8-27B-DFlash2](https://huggingface.co/incoai/Qwen3.8-27B-DFlash2)
- Modelo objetivo: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Blog de DFlash 2: [https://inco.ai/blog/dflash2/](https://inco.ai/blog/dflash2/)
- Código GitHub: [https://github.com/z-lab/dflash](https://github.com/z-lab/dflash)
- Receta de despliegue en NVIDIA DGX Spark (foro): [enlace](https://forums.developer.nvidia.com/t/qwen3-8-27b-nvfp4-on-single-dual-dgx-spark-sglang-dflash2-fully-openai-compatible/380732)
- Recetas de vLLM para Qwen3.8-27B: [https://recipes.vllm.ai/Qwen/Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)

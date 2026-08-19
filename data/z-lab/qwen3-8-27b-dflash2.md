# z-lab/Qwen3.8-27B-DFlash2

## Resumen

Qwen3.8-27B-DFlash2 es un modelo de borrador (draft model) diseñado para acelerar la inferencia del modelo Qwen/Qwen3.8-27B mediante decodificación especulativa. No es un modelo de lenguaje independiente: se ejecuta dentro de un servidor de decodificación especulativa y genera tokens candidatos que el modelo objetivo verifica. El modelo emplea la técnica DFlash 2, una variante de block-diffusion que predice un bloque completo de tokens en una sola pasada y mantiene los mejores candidatos en cada posición, con un selector ligero que traza un camino coherente a través de ellos.

Desarrollado por z-lab (espejo de incoai), este modelo de 1.924 millones de parámetros se distribuye bajo licencia Apache 2.0 y está pensado para integrarse en motores de inferencia como SGLang o vLLM. Su relevancia actual radica en que ofrece una mejora sustancial de rendimiento frente a alternativas como el MTP nativo de Qwen3.8 o el borrador DSpark, con ganancias de throughput de hasta 3,4× en concurrencia baja y 2,8× en concurrencia alta, manteniendo una decodificación sin pérdidas (el resultado es idéntico al del modelo objetivo).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion drafter (DFlash 2) con backbone de dos-tap convoluciones dinámicas |
| Parametros totales | 1.924.404.480 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (no especificado para el drafter) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DFlash 2 es un modelo de borrador basado en difusión de bloques (block-diffusion). En lugar de predecir un token a la vez, genera un bloque completo de tokens en una sola pasada, conservando los mejores candidatos en cada posición. Un selector ligero traza un único camino coherente a través de estos candidatos, y dos-tap convoluciones dinámicas en el backbone evitan que el borrador se degrade hacia el final del bloque. La decodificación es sin pérdida: la salida greedy coincide exactamente con la del modelo objetivo, y el muestreo conserva su distribución original.

El modelo está entrenado específicamente para el modelo Qwen/Qwen3.8-27B. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se emplearon técnicas de RLHF o DPO. La implementación se basa en el paper original de DFlash (ICML 2026) y en la extensión DFlash 2 descrita en el blog de Inco AI.

## Capacidades

- Generación de borradores de tokens en paralelo para decodificación especulativa (speculative decoding).
- Predicción de bloques completos de tokens con selección de candidatos en cada posición.
- Decodificación sin pérdida: mantiene la distribución del modelo objetivo.
- Compatibilidad con motores de inferencia SGLang y vLLM mediante integraciones específicas (parámetro `--speculative-algorithm DFLASH` o `--speculative-config`).
- Diseñado para trabajar exclusivamente con Qwen3.8-27B como modelo objetivo.
- No es un modelo de lenguaje general: no genera texto, razona, ni ejecuta tool calling por sí mismo.

## Casos de uso

- Aceleración de inferencia en producción: desplegar Qwen3.8-27B con DFlash 2 reduce la latencia por petición, especialmente en escenarios de baja concurrencia (1-8 peticiones simultáneas), donde se logran speedups de 2.7× a 3.4× frente a decodificación autoregresiva.
- Servicio de chat interactivo: en plataformas de atención al cliente o asistentes conversacionales, la mayor velocidad de generación permite respuestas más fluidas sin degradar la calidad del texto, ya que la salida es idéntica a la del modelo base.
- Generación de código en tiempo real: con HumanEval y MBPP se observan mejoras de aceptación de borradores (4.39 y 4.79 respectivamente), lo que se traduce en completado de código más rápido en editores o CI/CD.
- Razonamiento matemático con contexto largo: en tareas como GSM8K y MATH-500, el borrador alcanza una longitud de aceptación de 5.46 y 5.28, reduciendo el número de pasos de verificación y mejorando el throughput.
- Evaluación de modelos y benchmarks: usar DFlash 2 para acelerar la ejecución de benchmarks sobre Qwen3.8-27B, manteniendo resultados exactos y reduciendo el tiempo de cómputo.
- Despliegue en infraestructura compartida: al aumentar el throughput por GPU, se pueden atender más usuarios concurrentes con el mismo hardware, optimizando costes operativos.

## Benchmarks y rendimiento

Los resultados se obtuvieron con SGLang en una NVIDIA H200 con FlashAttention 3, bloque de especulación de 8 tokens (7 tokens de borrador por paso de verificación), muestreo con temperatura 1.0, top-p 0.95, top-k 20 y esfuerzo de razonamiento `xhigh`. Máximo de tokens nuevos: 4096.

### Longitud de aceptación (media de tokens completados por paso de verificación, mayor es mejor)

| Tarea | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 5.02 | 4.36 | **5.46** |
| MATH-500 | 4.72 | 3.92 | **5.28** |
| HumanEval | 3.91 | 3.30 | **4.39** |
| MBPP | 3.99 | 3.51 | **4.79** |
| MT-Bench | 3.74 | 3.01 | **4.10** |

**Throughput (tokens de salida por segundo, con speedup frente a autoregresivo)**

| Concurrencia | Tarea | Autoregresivo | MTP | DSpark | DFlash 2 |
| :--- | :--- | ---: | ---: | ---: | ---: |
| 1 | GSM8K | 68.9 | 178.5 (2.59×) | 185.3 (2.69×) | **236.1 (3.43×)** |
| 1 | MATH-500 | 69.0 | 172.8 (2.51×) | 174.5 (2.53×) | **230.7 (3.34×)** |
| 1 | HumanEval | 69.0 | 151.9 (2.20×) | 159.9 (2.32×) | **214.6 (3.11×)** |
| 1 | MBPP | 69.0 | 153.1 (2.22×) | 163.3 (2.37×) | **226.9 (3.29×)** |
| 1 | MT-Bench | 68.9 | 134.9 (1.96×) | 137.6 (2.00×) | **184.0 (2.67×)** |
| 8 | GSM8K | 467.2 | 1,022.1 (2.19×) | 1,040.8 (2.23×) | **1,328.7 (2.84×)** |
| 8 | MATH-500 | 480.0 | 1,023.5 (2.13×) | 1,025.8 (2.14×) | **1,368.3 (2.85×)** |
| 8 | HumanEval | 483.4 | 934.2 (1.93×) | 956.5 (1.98×) | **1,291.5 (2.67×)** |
| 8 | MBPP | 478.0 | 938.1 (1.96×) | 974.1 (2.04×) | **1,328.0 (2.78×)** |
| 8 | MT-Bench | 480.5 | 835.2 (1.74×) | 802.3 (1.67×) | **1,090.2 (2.27×)** |
| 32 | GSM8K | 1,329.8 | 1,381.1 (1.04×) | 1,506.5 (1.13×) | **1,922.5 (1.45×)** |
| 32 | MATH-500 | 1,505.8 | 1,415.6 (0.94×) | 1,429.0 (0.95×) | **1,951.8 (1.30×)** |
| 32 | HumanEval | 1,546.5 | 1,296.8 (0.84×) | 1,330.1 (0.86×) | **1,799.0 (1.16×)** |
| 32 | MBPP | 1,507.7 | 1,314.9 (0.87×) | 1,361.3 (0.90×) | **1,886.8 (1.25×)** |
| 32 | MT-Bench | 1,507.4 | 1,159.7 (0.77×) | 1,115.5 (0.74×) | **1,525.3 (1.01×)** |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) para el modelo de borrador en sí, ya que no es un modelo de lenguaje independiente; los datos anteriores corresponden a métricas de rendimiento de decodificación.

## Requisitos de hardware

- El modelo de borrador tiene 1.924 millones de parámetros, lo que en FP16 ocupa aproximadamente 3.85 GB de VRAM (sin cuantización). Sin embargo, no se han publicado cuantizaciones oficiales.
- Para la inferencia completa se necesita ejecutar conjuntamente con Qwen3.8-27B, que requiere una GPU con al menos 24 GB de VRAM en cuantización FP16 (por ejemplo, una RTX 4090 o A100). En la práctica, se recomienda una GPU de clase H100/H200 para obtener el máximo rendimiento con FlashAttention 3.
- El modelo es compatible con GPUs de consumo como RTX 3090/4090 si el modelo objetivo se cuantiza, pero los benchmarks publicados se realizaron en una NVIDIA H200.
- Opciones de despliegue: SGLang (recomendado) y vLLM, ambos con soporte específico para el algoritmo DFLASH. También se menciona que se puede usar con otros motores descritos en el blog oficial.
- La latencia y el throughput dependen del hardware y de la concurrencia. En H200 con concurrencia 1 se alcanzan 236 tokens/s en GSM8K, y con concurrencia 32 se llega a 1,922 tokens/s.

## Comparativa con modelos similares

Se compara con el MTP nativo de Qwen3.8-27B (Multi-Token Prediction) y con el borrador DSpark de RadixArk. Los tres proponen 7 tokens de borrador por paso de verificación.

| Modelo | Parámetros | Longitud de contexto | Rendimiento (GSM8K, conc. 1) | Licencia | Disponibilidad |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Qwen3.8-27B-DFlash2 | 1.92B | No disponible | 236.1 t/s (3.43×) | Apache 2.0 | HuggingFace |
| Qwen3.8-27B MTP (nativo) | No especificado | No especificado | 178.5 t/s (2.59×) | Apache 2.0 | Integrado en el modelo base |
| RadixArk/Qwen3.8-27B-DSpark | No especificado | No especificado | 185.3 t/s (2.69×) | No especificado | HuggingFace |

DFlash 2 supera a ambas alternativas en todos los benchmarks de acceptance length y throughput, tanto en baja como en alta concurrencia. En concurrency 32, MTP y DSpark incluso degradan el rendimiento respecto a autoregresivo, mientras que DFlash 2 mantiene un speedup positivo.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: no puede usarse para generación de texto, razonamiento o cualquier tarea directa. Solo funciona como borrador dentro de un sistema de decodificación especulativa con Qwen3.8-27B.
- Requiere integración con SGLang o vLLM con versiones específicas (pulls de PRs concretos). El soporte no está incluido en las versiones estables de estos motores, por lo que hay que instalar versiones de desarrollo.
- No se ha publicado información sobre el entrenamiento (datos, tokens, método), lo que limita la evaluación de sesgos o riesgos de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de Qwen3.8-27B, que también es Apache 2.0, sin restricciones adicionales conocidas.
- El rendimiento óptimo se logra solo en hardware con FlashAttention 3 (GPU H100/H200). En GPUs más antiguas el speedup puede ser menor.
- No hay garantía de que funcione correctamente con otras versiones de Qwen3.8-27B o con modelos futuros, ya que está entrenado específicamente para el modelo objetivo.
- Riesgo de alucinación o sesgo del modelo objetivo se transfiere, ya que el borrador no altera la salida, pero el usuario debe considerar las limitaciones del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo espejo en HuggingFace: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Blog oficial de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Paper original de DFlash (ICML 2026): citado en la card, sin enlace directo
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B

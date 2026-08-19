# z-lab/Muse-Glimmer-30B-DFlash2

## Resumen

Muse-Glimmer-30B-DFlash2 es un modelo de draft (borrador) diseñado para acelerar la inferencia del modelo objetivo `meta-models/Muse-Glimmer-30B` mediante decodificación especulativa. No es un modelo de lenguaje independiente: su función es proponer bloques de tokens que el modelo principal verifica en paralelo, reduciendo drásticamente la latencia y aumentando el throughput sin degradar la calidad de las respuestas. Ha sido desarrollado por z-lab, un espejo del repositorio oficial de Inco AI, y se distribuye bajo licencia Apache 2.0.

DFlash 2 introduce una arquitectura de difusión por bloques (block-diffusion) que predice un bloque completo de tokens en una sola pasada, manteniendo los mejores candidatos en cada posición. Un selector ligero traza después una ruta coherente a través de ellos, mientras que convoluciones dinámicas de dos taps (two-tap dynamic convolutions) evitan que el draft se degrade hacia el final del bloque. El resultado es una decodificación sin pérdidas: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución.

El modelo está finetuneado a partir del drafter oficial de Meta (`meta-models/Muse-Glimmer-30B-assistant`) y cuenta con 2.772 millones de parámetros. Los benchmarks publicados muestran mejoras sustanciales en longitud de aceptación y throughput frente al DFlash original y al drafter comunitario DSpark, con aceleraciones de hasta 4,62× en concurrencia 1 y 3,99× en concurrencia 8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion drafter con convoluciones dinámicas de dos taps |
| Parametros totales | 2.772.159.744 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (depende del modelo objetivo, Muse-Glimmer-30B con 128K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DFlash 2 es un drafter de difusión por bloques para decodificación especulativa. A diferencia de los drafters autoregresivos tradicionales, predice un bloque completo de tokens en una sola pasada forward y conserva los mejores candidatos en cada posición del bloque. Un selector ligero traza después una única ruta coherente a través de los candidatos, que es la que se envía al modelo objetivo para su verificación. La arquitectura incorpora convoluciones dinámicas de dos taps en el backbone para evitar que la calidad del draft se degrade hacia el final del bloque, un problema común en los métodos de drafting paralelo.

El modelo está finetuneado a partir de `meta-models/Muse-Glimmer-30B-assistant`, el drafter oficial que Meta distribuye con Muse-Glimmer-30B. La decodificación es lossless: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución original. El método se describe en el paper "DFlash: Block Diffusion for Flash Speculative Decoding" (ICML 2026) y se detalla en el blog de Inco AI. Para su uso en producción, se integra con motores de inferencia como SGLang y vLLM mediante el algoritmo especulativo DFLASH.

## Capacidades

- Generación de tokens draft para decodificación especulativa: predice bloques de 16 tokens (15 draft + 1 verificación) en una sola pasada.
- Aceleración de inferencia sin pérdidas: la salida greedy coincide exactamente con la del modelo objetivo, preservando la distribución de muestreo.
- Soporte para razonamiento extenso: funciona con los parámetros de muestreo recomendados para Muse-Glimmer-30B (temperatura 1.0, top-p 0.95, top-k 64) con alta intensidad de razonamiento.
- Compatibilidad con SGLang y vLLM mediante el algoritmo especulativo DFLASH.
- Integración con FlashAttention 3 para atención tanto en el modelo objetivo como en el drafter.
- Optimizado para tareas de razonamiento, código y matemáticas, donde muestra las mayores ganancias de aceptación.

## Casos de uso

- Servicio de LLM de alta concurrencia: en despliegues con concurrencia 8, DFlash 2 alcanza hasta 1.859 tokens/s en MATH-500, un 3,99× frente a la decodificación autoregresiva. Es adecuado para APIs de producción con múltiples usuarios simultáneos.
- Inferencia local en una sola GPU: con concurrencia 1, alcanza hasta 295,5 tokens/s en MATH-500 (4,62×), lo que permite ejecutar un modelo de 30B con interacción casi en tiempo real en hardware de gama alta.
- Generación de código en pipelines de CI/CD: las ganancias en HumanEval (4,09×) y MBPP (4,14×) hacen que la generación y revisión de código automatizada sea significativamente más rápida.
- Razonamiento matemático y resolución de problemas: en GSM8K y MATH-500, la longitud de aceptación supera los 6,5 tokens por paso, lo que reduce el número de verificaciones necesarias y acelera cadenas de razonamiento largas.
- Chat y asistentes conversacionales: en MT-Bench, alcanza 197,4 tokens/s con concurrencia 1 (3,08×), mejorando la experiencia de usuario en aplicaciones interactivas.
- Despliegue en entornos con presupuesto de hardware limitado: al ser un modelo de solo 2.77B parámetros, el drafter ocupa muy poca VRAM adicional en comparación con el modelo objetivo, lo que permite acelerar Muse-Glimmer-30B sin necesidad de hardware adicional.

## Benchmarks y rendimiento

Los benchmarks se han obtenido con SGLang sobre una NVIDIA H200, con FlashAttention 3, bloque de especulación de 16 tokens (15 draft por paso de verificación), muestreo con los parámetros recomendados (temperatura 1.0, top-p 0.95, top-k 64) y máximo de 4096 tokens nuevos. Se comparan la decodificación autoregresiva, el drafter oficial DFlash, el drafter comunitario DSpark y DFlash 2. Todos los métodos especulativos proponen 15 tokens draft por paso.

### Longitud de aceptación (media de tokens completados por paso de verificación; mayor es mejor)

| Task | Official DFlash | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 5.43 | 5.45 | **6.57** |
| MATH-500 | 5.39 | 5.01 | **6.56** |
| HumanEval | 4.11 | 4.33 | **5.66** |
| MBPP | 3.74 | 4.02 | **5.30** |
| MT-Bench | 3.52 | 3.59 | **4.42** |

### Throughput (tokens de salida por segundo; aceleración frente a autoregresivo entre paréntesis)

#### Concurrencia 1

| Task | Autoregressive | Official DFlash | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 63.9 | 247.8 (3.88×) | 236.5 (3.70×) | **293.7 (4.59×)** |
| MATH-500 | 64.0 | 246.3 (3.85×) | 218.4 (3.41×) | **295.5 (4.62×)** |
| HumanEval | 65.1 | 210.5 (3.23×) | 201.4 (3.09×) | **266.2 (4.09×)** |
| MBPP | 63.9 | 196.8 (3.08×) | 192.7 (3.02×) | **264.8 (4.14×)** |
| MT-Bench | 64.0 | 164.6 (2.57×) | 159.7 (2.49×) | **197.4 (3.08×)** |

#### Concurrencia 8

| Task | Autoregressive | Official DFlash | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 476.6 | 1,574.4 (3.30×) | 1,456.1 (3.06×) | **1,816.6 (3.81×)** |
| MATH-500 | 466.0 | 1,582.9 (3.40×) | 1,386.0 (2.97×) | **1,859.3 (3.99×)** |
| HumanEval | 499.9 | 1,419.8 (2.84×) | 1,315.4 (2.63×) | **1,784.9 (3.57×)** |
| MBPP | 491.6 | 1,278.9 (2.60×) | 1,266.6 (2.58×) | **1,719.7 (3.50×)** |
| MT-Bench | 470.0 | 1,078.4 (2.29×) | 1,052.6 (2.24×) | **1,288.9 (2.74×)** |

#### Concurrencia 32

| Task | Autoregressive | Official DFlash | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 1,705.6 | 2,330.3 (1.37×) | 2,301.7 (1.35×) | **2,818.3 (1.65×)** |
| MATH-500 | 1,710.2 | 2,427.3 (1.42×) | 2,185.0 (1.28×) | **2,869.6 (1.68×)** |
| HumanEval | 1,798.1 | 2,170.0 (1.21×) | 2,068.9 (1.15×) | **2,780.2 (1.55×)** |
| MBPP | 1,717.5 | 1,964.6 (1.14×) | 2,006.5 (1.17×) | **2,685.4 (1.56×)** |
| MT-Bench | 1,721.8 | 1,668.0 (0.97×) | 1,627.2 (0.95×) | **1,975.5 (1.15×)** |

## Requisitos de hardware

- Los benchmarks se han obtenido en una NVIDIA H200 con FlashAttention 3 para la atención del modelo objetivo y del drafter.
- El drafter tiene 2.772 millones de parámetros, por lo que ocupa aproximadamente 5,5 GB en fp16 (tamaño del repositorio). La VRAM adicional necesaria sobre el modelo objetivo es reducida.
- Para el modelo objetivo Muse-Glimmer-30B, Meta publica cuantizaciones para dispositivos con 24 GB o 32 GB de VRAM, y precisión completa para 64 GB. El drafter se suma a estos requisitos.
- No se han publicado datos de latencia o throughput en hardware consumer. Las cifras disponibles corresponden a H200.
- Opciones de despliegue: SGLang (con el flag `--speculative-algorithm DFLASH`) y vLLM (con `--speculative-config`). Ambos requieren versiones específicas con soporte DFLASH.
- El uso del drafter sin el modelo objetivo no tiene sentido: es un componente de aceleración, no un modelo independiente.

## Comparativa con modelos similares

DFlash 2 se compara con otros drafters especulativos para el mismo modelo objetivo, Muse-Glimmer-30B. Las métricas clave son la longitud de aceptación y el throughput.

| Modelo | Parametros | Longitud de aceptacion media (GSM8K) | Throughput (GSM8K, conc. 1) | Licencia |
|---|---|---|---|---|
| meta-models/Muse-Glimmer-30B-assistant (DFlash oficial) | no disponible | 5.43 | 247.8 tok/s (3.88×) | Apache 2.0 |
| DaoCloud/Muse-Glimmer-30B-DSpark | no disponible | 5.45 | 236.5 tok/s (3.70×) | no disponible |
| z-lab/Muse-Glimmer-30B-DFlash2 | 2.77B | **6.57** | **293.7 tok/s (4.59×)** | Apache 2.0 |

DFlash 2 supera a ambos drafters alternativos en todas las tareas evaluadas, tanto en longitud de aceptación como en throughput, con una ventaja especialmente notable en tareas de razonamiento matemático y código.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el modelo objetivo `meta-models/Muse-Glimmer-30B` y un motor de inferencia con soporte para el algoritmo DFLASH (SGLang o vLLM con versiones específicas). Sin ellos, el modelo no es funcional.
- La aceleración depende del hardware: los benchmarks se han obtenido en una NVIDIA H200 con FlashAttention 3. En GPUs consumer o con atención sin FlashAttention, las ganancias pueden ser menores.
- La aceleración se reduce con concurrencia alta: a concurrencia 32, la ventaja frente a autoregresivo baja a 1,15×-1,68×, y en MT-Bench el drafter oficial DFlash incluso empeora ligeramente el rendimiento (0,97×). En escenarios de muy alta concurrencia, el cuello de botella puede desplazarse a otros componentes.
- No se han publicado datos sobre sesgos, alucinación o calidad de las respuestas generadas: al ser un drafter, estas propiedades dependen del modelo objetivo, no del propio modelo.
- La documentación no especifica los idiomas soportados ni la longitud de contexto propia del drafter. Estas capacidades vienen determinadas por el modelo objetivo.
- El modelo es un espejo del repositorio oficial `incoai/Muse-Glimmer-30B-DFlash2`. Para producción, se recomienda verificar la integridad de los pesos y usar la fuente oficial si es posible.

## Enlaces

- Repositorio HuggingFace (z-lab): https://huggingface.co/z-lab/Muse-Glimmer-30B-DFlash2
- Repositorio HuggingFace (Inco AI, fuente oficial): https://huggingface.co/incoai/Muse-Glimmer-30B-DFlash2
- Modelo objetivo: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Drafter oficial de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B-assistant
- Drafter DSpark (comparativa): https://huggingface.co/DaoCloud/Muse-Glimmer-30B-DSpark
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Página de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Receta vLLM para Muse-Glimmer-30B: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B

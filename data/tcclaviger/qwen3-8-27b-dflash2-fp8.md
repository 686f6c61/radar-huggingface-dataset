# tcclaviger/Qwen3.8-27B-DFlash2-FP8

## Resumen

Qwen3.8-27B-DFlash2-FP8 es una cuantización en FP8 del borrador (draft model) DFlash 2 para decodificación especulativa sobre el modelo objetivo Qwen/Qwen3.8-27B. Lo publica el usuario tcclaviger en Hugging Face a partir del modelo original de Inco AI (z-lab/Qwen3.8-27B-DFlash2), y su función no es generar texto de forma autónoma, sino proponer bloques de tokens que el modelo objetivo verifica después. Por tanto, no es un modelo de lenguaje independiente: se ejecuta dentro de un servidor de decodificación especulativa (SGLang o vLLM) y requiere siempre el modelo Qwen3.8-27B como verificador.

La innovación principal es el mecanismo de block diffusion: el borrador predice un bloque completo de tokens en una sola pasada y conserva los mejores candidatos en cada posición; un selector ligero traza después una ruta coherente entre ellos. Dos convoluciones dinámicas de dos tomas en el backbone evitan que la calidad del borrador decaiga hacia el final del bloque. La decodificación es sin pérdida: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución.

Esta variante FP8 reduce el peso del borrador a unos 2,1 GB en el repositorio, con proyecciones de atención y MLP (más la capa auxiliar `fc`) en FP8 e4m3 con escalas de peso por bloques de 128×128 y activaciones dinámicas, mientras que las normas, los kernels de convolución, el selector de candidatos y sus codebooks permanecen en BF16. Es relevante ahora porque permite desplegar el borrador con menor huella de memoria y, según los datos del autor, ofrece aceleraciones de hasta 3,43× frente a la decodificación autorregresiva en un H200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion drafter para decodificación especulativa, con backbone de convoluciones dinámicas de dos tomas y selector de ruta de candidatos |
| Parametros totales | 1.924.404.480 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo Qwen3.8-27B; no especificada en la información) |
| Tipos de cuantizacion | FP8 (e4m3) con escalas de peso por bloques de 128×128 y activaciones dinámicas; normas, kernels de convolución, selector y codebooks en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un borrador de difusión por bloques diseñado para decodificación especulativa. En lugar de generar tokens de uno en uno, predice un bloque completo en una sola pasada y mantiene los mejores candidatos en cada posición del bloque; un selector ligero recorre esos candidatos para construir una única secuencia coherente. El backbone incorpora convoluciones dinámicas de dos tomas que contrarrestan la degradación de la calidad del borrador conforme avanza el bloque, un problema habitual en los drafters paralelos. La decodificación resultante es sin pérdida: con decodificación greedy la salida coincide exactamente con la del modelo objetivo, y con muestreo se preserva la distribución del objetivo.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base declarado es z-lab/Qwen3.8-27B-DFlash2, del que esta versión es una cuantización FP8 publicada por tcclaviger; el README indica que es un espejo de incoai/Qwen3.8-27B-DFlash2. La cuantización afecta a las proyecciones de atención y MLP y a la capa auxiliar `fc`; el resto de componentes se mantiene en BF16. La configuración de referencia usa un tamaño de bloque de especulación de 8 (7 tokens borrador por paso de verificación).

## Capacidades

- Borrado paralelo de bloques de tokens para decodificación especulativa sobre Qwen/Qwen3.8-27B.
- Selección de ruta coherente entre múltiples candidatos por posición mediante un selector ligero.
- Decodificación sin pérdida: salida greedy idéntica al modelo objetivo y muestreo que preserva su distribución.
- Compatible con SGLang (`--speculative-algorithm DFLASH`) y vLLM (`method: "dflash"`).
- No es un modelo generativo autónomo: no responde prompts por sí mismo ni se usa sin el modelo objetivo.
- Capacidades multilingües, tool calling, agentes o visión: no disponibles para este componente; dependen del modelo objetivo.
- No dispone de modo de razonamiento propio; el README menciona `xhigh` reasoning effort como parámetro del modelo objetivo en la evaluación.

## Casos de uso

- Aceleración de inferencia en producción con SGLang: desplegar Qwen3.8-27B con `--speculative-algorithm DFLASH` y este borrador para elevar el throughput de salida hasta 3,43× con concurrencia 1 en un H200, reduciendo el coste por token servido.
- Servicio de razonamiento matemático: en MATH-500 el borrador alcanza una longitud de aceptación de 5,28 y 230,7 tok/s a concurrencia 1, lo que lo hace adecuado para asistentes de resolución de problemas con cadenas de razonamiento largas.
- Generación de código en pipelines de CI/CD: con 4,39 de aceptación en HumanEval y 4,79 en MBPP, acelera tareas de autocompletado y generación de tests donde el modelo objetivo produce código verificable.
- Chat multi-turno de baja latencia: en MT-Bench logra 184,0 tok/s a concurrencia 1 (2,67×), útil para interfaces conversacionales donde la latencia percibida es crítica.
- Despliegue con restricciones de memoria: al ocupar unos 2,1 GB en FP8, el borrador añade una huella reducida sobre el modelo objetivo, lo que facilita incorporar decodificación especulativa en nodos con VRAM limitada.
- Servicio por lotes con alta concurrencia: a concurrencia 32 mantiene ganancias de 1,16× a 1,45× en GSM8K, MATH-500, HumanEval y MBPP, adecuado para cargas de batch donde la decodificación autorregresiva satura el hardware.
- Evaluación comparativa de drafters: permite medir DFlash 2 frente a MTP integrado y DSpark con el mismo presupuesto de 7 tokens borrador por paso de verificación.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en SGLang sobre una NVIDIA H200 con FlashAttention 3, bloque de especulación de 8, parámetros recomendados de Qwen3.8 (temperatura 1,0, top-p 0,95, top-k 20), `xhigh` reasoning effort y máximo de 4096 tokens nuevos.

Longitud de aceptación (media de tokens de completion dividida por pasos de verificación; mayor es mejor):

| Tarea | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 5,02 | 4,36 | 5,46 |
| MATH-500 | 4,72 | 3,92 | 5,28 |
| HumanEval | 3,91 | 3,30 | 4,39 |
| MBPP | 3,99 | 3,51 | 4,79 |
| MT-Bench | 3,74 | 3,01 | 4,10 |

Throughput a concurrencia 1 (tokens de salida por segundo y speedup frente a autorregresivo):

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 68,9 | 178,5 (2,59×) | 185,3 (2,69×) | 236,1 (3,43×) |
| MATH-500 | 69,0 | 172,8 (2,51×) | 174,5 (2,53×) | 230,7 (3,34×) |
| HumanEval | 69,0 | 151,9 (2,20×) | 159,9 (2,32×) | 214,6 (3,11×) |
| MBPP | 69,0 | 153,1 (2,22×) | 163,3 (2,37×) | 226,9 (3,29×) |
| MT-Bench | 68,9 | 134,9 (1,96×) | 137,6 (2,00×) | 184,0 (2,67×) |

Throughput a concurrencia 8:

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 467,2 | 1.022,1 (2,19×) | 1.040,8 (2,23×) | 1.328,7 (2,84×) |
| MATH-500 | 480,0 | 1.023,5 (2,13×) | 1.025,8 (2,14×) | 1.368,3 (2,85×) |
| HumanEval | 483,4 | 934,2 (1,93×) | 956,5 (1,98×) | 1.291,5 (2,67×) |
| MBPP | 478,0 | 938,1 (1,96×) | 974,1 (2,04×) | 1.328,0 (2,78×) |
| MT-Bench | 480,5 | 835,2 (1,74×) | 802,3 (1,67×) | 1.090,2 (2,27×) |

Throughput a concurrencia 32:

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 1.329,8 | 1.381,1 (1,04×) | 1.506,5 (1,13×) | 1.922,5 (1,45×) |
| MATH-500 | 1.505,8 | 1.415,6 (0,94×) | 1.429,0 (0,95×) | 1.951,8 (1,30×) |
| HumanEval | 1.546,5 | 1.296,8 (0,84×) | 1.330,1 (0,86×) | 1.799,0 (1,16×) |
| MBPP | 1.507,7 | 1.314,9 (0,87×) | 1.361,3 (0,90×) | 1.886,8 (1,25×) |
| MT-Bench | 1.507,4 | 1.159,7 (0,77×) | 1.115,5 (0,74×) | 1.525,3 (1,01×) |

No se han publicado resultados de benchmarks de calidad del modelo objetivo en la información disponible; las cifras anteriores miden eficiencia de decodificación, no calidad de las respuestas.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 2,1 GB en FP8, según el tamaño del repositorio; hay que sumar la VRAM del modelo objetivo Qwen3.8-27B, que no se detalla en la información disponible.
- GPU de referencia en las evaluaciones: una NVIDIA H200 con FlashAttention 3 para la atención del objetivo y del borrador.
- GPU recomendadas: H200 para reproducir las cifras publicadas; no se han publicado mediciones en A100, H100 ni RTX 4090.
- GPU de consumo: no hay datos publicados sobre encaje en GPUs de consumo; la viabilidad depende del modelo objetivo, no del borrador.
- Despliegue: SGLang (`pip install "sglang[all]"` desde el repositorio y `--speculative-algorithm DFLASH --speculative-num-draft-tokens 8`) y vLLM (build con el PR 52816 y `--speculative-config` con `method: "dflash"` y `num_speculative_tokens: 7`).
- Latencia y throughput: 236,1 tok/s en GSM8K a concurrencia 1 y 1.922,5 tok/s a concurrencia 32 en H200; el resto de tareas en la tabla de benchmarks.
- El README del modelo base marca `inference: false`; la ejecución requiere los servidores de decodificación especulativa indicados, no `transformers` en solitario.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tokens borrador por paso | Aceptación en GSM8K | Throughput GSM8K (conc. 1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DFlash 2 (este, FP8) | Block-diffusion drafter | 1.924.404.480 | 7 | 5,46 | 236,1 tok/s (3,43×) | Apache 2.0 | Hugging Face (tcclaviger y incoai) |
| MTP integrado de Qwen3.8 | Multi-token prediction nativo | no disponible | 7 | 5,02 | 178,5 tok/s (2,59×) | la del modelo objetivo | Integrado en Qwen3.8-27B |
| DSpark (RadixArk) | Drafter comunitario | no disponible | 7 | 4,36 | 185,3 tok/s (2,69×) | no disponible | Hugging Face (RadixArk/Qwen3.8-27B-DSpark) |

DFlash 2 supera a ambas alternativas en longitud de aceptación y throughput en las cinco tareas evaluadas a concurrencia 1 y 8; a concurrencia 32 es el único de los tres que mantiene ganancias claras frente a la decodificación autorregresiva en todas las tareas.

## Limitaciones y advertencias

- No es un modelo independiente: sin Qwen/Qwen3.8-27B desplegado como verificador no produce ninguna salida útil.
- El README del modelo base declara `inference: false`; no puede servirse con `transformers` de forma estándar.
- Requiere versiones específicas de SGLang o vLLM (esta última desde el PR 52816), lo que añade riesgo de incompatibilidad en entornos gestionados.
- Las cifras de rendimiento se han medido únicamente en una H200; no hay datos de otras GPU ni de GPUs de consumo.
- A concurrencia 32 las ganancias se reducen (1,16× a 1,45× en las tareas de código y matemáticas, 1,01× en MT-Bench), por lo que el beneficio depende del régimen de carga.
- La cuantización FP8 puede alterar ligeramente la tasa de aceptación respecto al borrador en BF16; no se han publicado comparaciones entre ambas versiones.
- No hay información sobre sesgos, riesgo de alucinación ni idiomas soportados de este componente; esos atributos corresponden al modelo objetivo.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo objetivo Qwen3.8-27B y de las dependencias de SGLang/vLLM.
- El repositorio es una cuantización de terceros (tcclaviger) y un espejo del original de Inco AI; para producción conviene contrastar con la fuente original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tcclaviger/Qwen3.8-27B-DFlash2-FP8
- Modelo original (espejo): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo base declarado: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter comunitario DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub: https://github.com/z-lab/dflash
- SGLang: https://github.com/sgl-project/sglang
- vLLM (PR de soporte DFlash): https://github.com/vllm-project/vllm/pull/52816

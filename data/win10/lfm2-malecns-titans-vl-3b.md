# win10/Lfm2-MaleCNS-Titans-VL-3B

## Resumen

Lfm2-MaleCNS-Titans-VL-3B es un modelo experimental de visión-lenguaje publicado por el usuario win10 en HuggingFace. Se construye sobre LiquidAI/LFM2.5-VL-3B, al que se le añade la arquitectura de memoria neural c042 MaleCNS-Titans: 11.240 neuronas seleccionadas de MaleCNS v1.0 y 119.997 conexiones dirigidas, distribuidas en puertos de memoria independientes para visión y lenguaje. El resultado es un modelo de 3.243.508.839 parámetros totales, de los cuales 120.024.951 corresponden a parámetros de memoria añadidos y entrenados.

El interés técnico reside en que incorpora un mecanismo de memoria rápida inspirado en el paper Titans (arXiv:2501.00663), capaz de persistir estado más allá de los resets de caché nativa. La evaluación preliminar del autor reporta una ganancia de 0,511086 NLL con memoria retenida frente a memoria reseteada en una secuencia de 131.072 tokens, aunque se trata de resultados de desarrollo y no de un benchmark independiente.

Es un modelo de exploración de preentrenamiento con pocos datos (64 registros Formosa-Vision, 190.064 tokens de entrada, 256 actualizaciones del optimizador) y sin SFT ni deduplicación. Su relevancia es fundamentalmente investigadora: demuestra la viabilidad de acoplar memoria asociativa externa a un backbone LFM2-VL existente mediante LoRA más entrenamiento completo de los parámetros de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal LFM2.5-VL-3B con memoria neural MaleCNS-Titans c042 añadida |
| Parametros totales | 3.243.508.839 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativos; la memoria rápida persiste entre resets de caché e input blocks |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | zh, en |
| Licencia | lfm-open-license-v1.0 (campo `license: other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva íntegramente el backbone LFM2.5-VL-3B: lenguaje, visión, proyector y generación. Sobre él se acopla una memoria asociativa MaleCNS–Titans c042 compuesta por 11.240 neuronas seleccionadas y 119.997 conexiones dirigidas, con 4 canales dendríticos y 2 microsteps. La memoria se conecta mediante puertos distribuidos: un puerto visual nativo de 1.152 características y puertos de lenguaje en las capas 4, 14 y 26 (2.048 características cada uno), cada uno con su propia proyección de entrada/lectura y puerta residual. Los parámetros de memoria añadidos suman 120.024.951, de los que 119.544.960 (99,60 %) pertenecen a los puertos. Los pesos rápidos en tiempo de ejecución ocupan 479.988 escalares FP32 (1,83 MiB), o 3,66 MiB incluyendo momentum.

El mecanismo de escritura usa gradiente interno con normalización RMS, momentum, olvido y un ancla de pesos lentos entrenada. Las tasas de escritura, momentum y olvido son escalares globales aprendidos, no controladores por entrada: el autor lo describe explícitamente como una actualización inspirada en Titans, no como una reproducción completa del paper. Cada puerto lee la instantánea del bloque anterior y una escritura se consolida tras el forward nativo; el estado de sesión devuelto es responsabilidad del llamador. Con 2 microsteps, 86.946 de las 119.997 aristas son potencialmente observables por al menos un puerto, lo que equivale a un límite superior de 347.784 escalares de canal observables, sin que ello mida capacidad de información independiente.

El entrenamiento consistió en LoRA de rango 16 y alpha 32 sobre 331 módulos lineales nativos, más entrenamiento completo de todos los parámetros de memoria mediante `additional_target=memory` de LlamaFactory, con 153.384.311 parámetros entrenables totales. Se usaron 64 registros Formosa-Vision PT existentes, con imágenes en uno de cada ocho registros, 190.064 tokens de entrada y 14.912 tokens auxiliares de control, completando 256 de 256 actualizaciones previstas en 1466,0 segundos con 18,74 GiB de VRAM pico y FlashAttention-2. La pérdida combina CE de preentrenamiento retenida más 0,1 × CE de prefijo; en episodios con imagen se añaden 0,2 × CE de reset, 0,1 × max(0, 0,05 + CE retenida − CE de reset) y 0,02 × KL(profesor nativo || alumno reset). El profesor original desactiva LoRA y memoria. No hubo SFT, pasada sobre el corpus completo ni deduplicación.

## Capacidades

- Generación de texto conversacional en chino y en inglés, heredada del backbone LFM2.5-VL-3B.
- Comprensión de imagen a texto (pipeline `image-text-to-text`), con puerto visual nativo de 1.152 características.
- Memoria asociativa con estado persistente entre resets de caché: pesos rápidos con momentum que sobreviven al vaciado de la caché KV/convolución/imagen nativa.
- Escritura de memoria entrenada tanto en modo texto como en modo multimodal; las escrituras solo-texto preservan exactamente 3.460 conexiones visuales input-to-input seleccionadas, de las cuales 2.967 están en rutas observables del puerto visual.
- Capacidad de retención con interferencia y olvido finitos: la memoria rápida tiene capacidad limitada y no ofrece recuperación ilimitada sin pérdidas.
- Etiqueta `conversational` en el modelo, aunque no se ha aplicado SFT específico de diálogo.
- La memoria añadida no implica un controlador por entrada: no hay gestiones selectivas de escritura/olvido por prompt.

## Casos de uso

- Investigación sobre memoria en modelos de lenguaje: permite estudiar experimentalmente si la memoria asociativa externa mejora la predicción a largo plazo, aprovechando la ganancia reportada de 0,511086 NLL con memoria retenida frente al reset en secuencias de más de 100.000 tokens.
- Evaluación comparativa de arquitecturas de memoria (Titans, fast weights, memoria asociativa) frente a baselines sin memoria, usando la implementación c042 como referencia reproducible.
- Experimentos de memoria multimodal: comprobar si las escrituras de memoria en el puerto visual preservan asociaciones imagen-texto entre resets de caché, con la salvedad de que solo un subconjunto de conexiones visuales está protegido.
- Prototipado de conversación zh/en con contexto largo: el contexto nativo de 32.768 tokens cubre diálogos multi-turno extensos en chino e inglés, aunque el modelo no haya recibido SFT de diálogo.
- Estudio de interferencia y olvido en memorias finitas: al persistir pesos sinápticos y momentum pero ninguna actividad neuronal persistente, es un banco de pruebas útil para medir degradación de recuperación cuando se acumulan escrituras.
- Docencia y experimentación sobre conexionismos a escala: los 119.997 aristas dirigidos y los puertos distribuidos permiten explorar visualmente la topología de la memoria con el diagrama `architecture/structure.svg`.
- Base para futuros fine-tunes con SFT: al ser un modelo de preentrenamiento de muestra pequeña, sirve como punto de partida para adaptaciones supervisadas que aprovechen la memoria persistente.

## Benchmarks y rendimiento

La model card reporta una evaluación exploratoria de desarrollo, no un benchmark independiente. Se usó un único flujo de 131.072 tokens con 129.024 escrituras seguidas de una lectura retenida de 2.048 tokens; solo la lectura final se reproduce con memoria reseteada, y ambas ramas descartan las cachés nativas KV/convolución/imagen.

| Condición | Read NLL (↓) |
|---|---:|
| LFM2.5-VL-3B original | 4,634545 |
| c042 antes de LoRA nativo, memoria retenida | 4,198395 |
| Modelo fusionado, memoria desactivada | 4,641206 |
| Modelo fusionado, memoria neural nueva | 4,703657 |
| Modelo fusionado, memoria neural retenida | 4,192570 |

Datos adicionales declarados: ganancia de memoria retenida frente a reset de 0,511086 NLL y 948 de 2.047 posiciones de argmax de siguiente token modificadas. El propio autor advierte que la misma evaluación exploratoria acotada se usó durante la búsqueda de arquitectura y que estos son resultados de desarrollo.

No se han publicado resultados de benchmarks estandarizados (MMLU, GSM8K, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,5 GB solo para pesos (el repo safetensors ocupa 6,8 GB), más overhead de activaciones y cachés.
- VRAM estimada en cuantización de 8 bits: en torno a 3,5 GB; en 4 bits: en torno a 2 GB (estimaciones derivadas del número de parámetros, no publicadas por el autor).
- Sí cabe en GPU de consumo: una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB pueden ejecutarlo en bf16; en 4 bits cabría en GPUs de 8 GB.
- GPU recomendadas para entrenamiento o ajuste: la configuración del autor alcanzó 18,74 GiB de VRAM pico, por lo que se necesita al menos una GPU de 24 GB (RTX 3090, RTX 4090) o profesional (A100 40 GB, H100).
- Aceleración: el entrenamiento usó FlashAttention-2 con revisión de kernel fijada.
- Opciones de despliegue: `transformers` con `trust_remote_code` obligatorio, ya que el modelo incluye código personalizado (`custom_code`) y una clase que hereda de `Lfm2VlForConditionalGeneration`. No se han publicado pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversión previa. La compatibilidad con vLLM, TGI u otros servidores no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria persistente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lfm2-MaleCNS-Titans-VL-3B | 3.243.508.839 (120.024.951 de memoria añadida) | 32.768 tokens nativos, memoria rápida entre resets | Sí (pesos rápidos FP32 + momentum) | lfm-open-license-v1.0 | HuggingFace, requiere `custom_code` |
| LiquidAI/LFM2.5-VL-3B (base) | no disponible en la información proporcionada | 32.768 tokens (heredado) | No | lfm-open-license-v1.0 | HuggingFace |
| Otros VLM de ~3B (Qwen2.5-VL-3B, SmolVLM, etc.) | no disponible en la información proporcionada | no disponible | No | no disponible | no disponible |

No se dispone de datos verificados en la información proporcionada para establecer comparaciones de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de exploración de preentrenamiento con muestra pequeña: 64 registros, 190.064 tokens de entrada y 256 actualizaciones; no ha recibido SFT ni ajuste de instrucciones, por lo que su comportamiento conversacional puede ser deficiente pese a la etiqueta `conversational`.
- Los resultados de NLL son de desarrollo y provienen de la misma evaluación acotada usada durante la búsqueda de arquitectura; no constituyen una validación independiente.
- La memoria rápida tiene capacidad finita y puede sufrir interferencia y olvido: no ofrece recuperación ilimitada sin pérdidas, como advierte el propio autor.
- Las tasas de escritura, momentum y olvido son escalares globales aprendidos, no controladores por entrada; no hay gestión selectiva de qué se memoriza.
- La preservación de asociaciones visuales está garantizada solo para un subconjunto de conexiones (3.460 conexiones input-to-input, 2.967 en rutas observables), no para toda la asociación visual.
- Idiomas limitados a chino e inglés; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinación: no evaluado en la información disponible, pero esperable en un modelo de 3B sin SFT.
- Licencia `lfm-open-license-v1.0` (campo `license: other`): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que no es una licencia de código abierto estándar.
- Requiere `trust_remote_code` por el código personalizado (`custom_code`), lo que implica ejecutar código del autor; conviene auditar `config.json` y los módulos incluidos antes de usarlo en producción.
- Sesgos conocidos: no disponibles.
- El autor señala que las mejoras propuestas en `architecture/capacity_review.md` no forman parte de este checkpoint.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/win10/Lfm2-MaleCNS-Titans-VL-3B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Paper de referencia de Titans: https://arxiv.org/abs/2501.00663
- Diagrama de arquitectura (en el repo): `architecture/structure.svg`
- Auditoría de capacidad (en el repo): `architecture/capacity_review.md`
- Código de entrenamiento local (en el repo): `training/`
- Configuración y selección de puertos (en el repo): `config.json`
- Licencia (en el repo): `LICENSE`

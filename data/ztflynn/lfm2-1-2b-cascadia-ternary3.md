# ZTFlynn/LFM2-1.2B-Cascadia-ternary3

## Resumen

El modelo `ZTFlynn/LFM2-1.2B-Cascadia-ternary3` es una versión comprimida del modelo de lenguaje `LiquidAI/LFM2-1.2B` de Liquid AI, desarrollada por el usuario ZTFlynn mediante la técnica de compresión Cascadia. Esta técnica combina superficies spline B-spline con tablas de búsqueda (lookup tables) por bandas y codebooks k-means, logrando reducir el tamaño del checkpoint original de 2,23 GB a 774 MB, es decir, un factor de compresión de 3,03x. El resultado es un paquete ejecutable directamente en CPU mediante un runtime en C cuyas únicas dependencias son libc, libm y libgomp.

El modelo base LFM2-1.2B pertenece a la familia Liquid Foundation Models 2 (LFM2), diseñada por Liquid AI para despliegue eficiente en dispositivos edge. Su arquitectura híbrida combina convoluciones cortas con puerta (gated short convolutions) y bloques de atención grouped query attention (GQA), lo que le proporciona una latencia de prefill y decodificación hasta 2 veces superior a la de modelos comparables como Qwen3 o Gemma 3 en CPU. Esta versión comprimida mantiene las capacidades del modelo original con una pérdida de calidad medida en perplexity del 9,91% sobre un corpus de evaluación, a cambio de una reducción drástica de requisitos de memoria y almacenamiento.

La relevancia de este modelo radica en que permite ejecutar un LLM de 1,2 mil millones de parámetros en hardware sin GPU, con un uso de memoria inferior a 1 GB, lo que lo hace adecuado para aplicaciones de inteligencia artificial en el borde (edge), dispositivos móviles, sistemas embebidos y servidores sin aceleradores gráficos. Además, el paquete incluye un formato de pesos propio que evita la construcción de matrices densas durante la inferencia, lo que reduce el consumo de ancho de banda y mejora la eficiencia energética.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 bloques con convoluciones cortas con puerta y atención GQA (32 cabezas de consulta, 8 de clave/valor) |
| Parametros totales | 1,2 mil millones (aprox.) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria (ternary-3) mediante codebooks en base 3, con splines y 0,5% de pesos exactos en f32 |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm-open-license (Liquid AI) |
| Formato de pesos | Formato propio Cascadia: `weights.bin` (772 MB), `manifest.json`, `aux.bin` y `tokenizer.bin` |

## Arquitectura y entrenamiento

El modelo base `LiquidAI/LFM2-1.2B` es un transformer híbrido que intercala capas de convoluciones cortas con puerta (gated short convolutions) y bloques de atención grouped query attention (GQA). Esta arquitectura, obtenida mediante búsqueda hardware-in-the-loop bajo restricciones de latencia y memoria para edge, permite un rendimiento hasta 2 veces superior en prefill y decodificación frente a modelos de tamaño similar en CPU. El modelo fue entrenado por Liquid AI con datos no especificados en la información disponible; no se mencionan técnicas de alineación como RLHF o DPO.

La compresión Cascadia aplicada por ZTFlynn no modifica la arquitectura del modelo, sino que sustituye cada matriz de pesos por una representación comprimida. El proceso consiste en ajustar una superficie spline B-spline a cada matriz de pesos para capturar su estructura a gran escala. Cada peso se asigna a una de 32 bandas según el valor de la spline, y se aprende un codebook k-means por banda sobre los residuos. El 0,5% de los errores más grandes se conservan exactamente como f32. Los índices de los codebooks se empaquetan en base 3 (cinco trits por byte, ya que 3⁵ = 243). La reconstrucción se realiza como `W = spline(j,c) + codebook[band][index]`, evaluada dentro del producto matriz-vector, sin construir nunca la matriz densa completa. La capa de embedding (que también actúa como lm_head) se comprime con un codebook global de 81 entradas en lugar de 27, lo que reduce su error de reconstrucción de 0,078 a 0,027 y lo convierte en el tensor mejor reconstruido del modelo.

## Capacidades

- Generación de texto en inglés: el modelo es capaz de producir respuestas coherentes y contextualmente relevantes, como se muestra en el ejemplo de la model card sobre la docena del panadero.
- Razonamiento básico: puede resolver preguntas de conocimiento general y explicar conceptos sencillos, aunque su capacidad de razonamiento complejo está limitada por su tamaño.
- Comprensión de instrucciones: sigue indicaciones simples en formato de chat (el runtime detiene la generación al encontrar `<|im_end|>`).
- Ejecución en CPU sin GPU: gracias a la compresión y al runtime C, el modelo puede ejecutarse en procesadores x86 y ARM con recursos mínimos.
- Inferencia determinista: el modo greedy es reproducible con semilla, lo que facilita pruebas y depuración.
- Soporte de muestreo configurable: permite ajustar temperatura, top-k y top-p para controlar la creatividad de las respuestas.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede integrarse en aplicaciones de chat o asistentes de voz que funcionen sin conexión, gracias a su tamaño reducido (774 MB) y su ejecución en CPU. Es adecuado para responder preguntas frecuentes o mantener diálogos simples sobre temas generales.
- Procesamiento de texto en servidores sin GPU: empresas con infraestructura basada en CPU pueden desplegar este modelo para tareas de clasificación, extracción de información o generación de respuestas automáticas sin necesidad de adquirir hardware acelerador.
- Sistemas embebidos y edge computing: su bajo consumo de memoria y la ausencia de dependencias más allá de libc/libm/libgomp lo hacen apto para dispositivos IoT, routers inteligentes o sistemas de automatización industrial que requieran capacidades de lenguaje natural localmente.
- Generación de contenido asistida en herramientas de productividad: puede utilizarse como motor de autocompletado o redacción de borradores en editores de texto ligeros, procesadores de correo o aplicaciones de notas, siempre que la tarea no exija una calidad literaria alta.
- Educación y demostraciones técnicas: al ser un paquete autocontenido y reproducible, sirve para enseñar conceptos de compresión de modelos, cuantización y despliegue en entornos restringidos, o como base para experimentos de investigación en eficiencia de inferencia.
- Prototipado rápido de aplicaciones de lenguaje en CPU: desarrolladores pueden validar ideas de productos que requieran generación de texto en inglés sin necesidad de infraestructura en la nube ni GPUs, reduciendo costes y latencia en entornos de prueba.

## Benchmarks y rendimiento

La model card proporciona mediciones de perplexity sobre 16.352 tokens pareados de FineWeb-Edu, divididos en 31 ventanas independientes de 512 tokens. La comparación se realiza token a token entre el modelo base y el comprimido, lo que reduce el error estándar 17 veces frente a medias independientes.

| Modelo | Perplexity (FineWeb-Edu) |
|---|---:|
| `LiquidAI/LFM2-1.2B` (bf16) | 108,96 |
| `ZTFlynn/LFM2-1.2B-Cascadia-ternary3` | 119,76 |
| **Incremento relativo** | **+9,91%** (IC 95% [1,0801x, 1,1169x], t = +10,98) |

Además, se reporta la fidelidad de reconstrucción frente al checkpoint bf16:

| Métrica | Valor |
|---|---:|
| Error L2 relativo (sobre 93 tensores, 100% de parámetros) | 0,0553 |
| Ganancia sistemática (1,0000 = fiel) | 0,9993 |
| Error L2 por clase: lineales (1.036M params) | 0,0576 |
| Error L2 por clase: embedding (134M params) | 0,0267 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Memoria RAM: el paquete pesa 774 MB, por lo que se necesitan aproximadamente 1 GB de RAM libre para cargar el modelo y ejecutar la inferencia. No se requiere VRAM.
- CPU: funciona en cualquier procesador x86-64 o ARM64 con soporte para OpenMP (libgomp). Se ha probado en entornos de escritorio y se espera compatibilidad con placas de bajo consumo como Raspberry Pi (aunque no se especifica el modelo exacto).
- GPU: no necesaria. El runtime Cascadia está diseñado exclusivamente para CPU.
- Dependencias: solo libc, libm y libgomp. No requiere CUDA, ROCm ni frameworks de deep learning.
- Opciones de despliegue: el runtime C se compila con CMake (`cassie`). También existe una interfaz Python que carga el paquete comprimido sobre el modelo base mediante `transformers` y la librería `cascadia`.
- Latencia y throughput: no se proporcionan cifras concretas. La model card indica que la inferencia es batch-1 (una muestra a la vez), y que el runtime ejecuta la reconstrucción dentro del producto matriz-vector, lo que evita la materialización de matrices densas y reduce el acceso a memoria.

## Comparativa con modelos similares

| Modelo | Tamaño (pesos) | Arquitectura | Contexto | Perplexity (FineWeb-Edu) | Licencia | Formato |
|---|---|---|---|---|---|---|
| `LiquidAI/LFM2-1.2B` (bf16) | 2,23 GB | Híbrida (conv + GQA) | No disponible | 108,96 | lfm-open-license | Transformers (safetensors) |
| `ZTFlynn/LFM2-1.2B-Cascadia-ternary3` | 774 MB | Híbrida (conv + GQA) | No disponible | 119,76 | lfm-open-license | Cascadia (bin + manifest) |
| Cuantización GGUF Q4_K_M típica (estimación) | ~700 MB | Depende del modelo | No disponible | No disponible | Variable | GGUF (llama.cpp) |

La comparación directa con cuantizaciones GGUF no es posible sin datos específicos, pero Cascadia ofrece una alternativa que mantiene la arquitectura original y evita la pérdida de precisión asociada a la cuantización uniforme por bloque, al emplear splines y codebooks adaptativos. El modelo base LFM2-1.2B ya está optimizado para CPU, por lo que la compresión adicional reduce aún más los requisitos de memoria sin necesidad de reentrenamiento.

## Limitaciones y advertencias

- El modelo solo se ejecuta mediante el runtime C de Cascadia (`cassie`); no es un checkpoint de `transformers` directamente cargable. Requiere compilar el runtime y descargar el paquete completo.
- El runtime solo soporta el preset ternary-3 en esta versión; otros presets de Cascadia (por ejemplo, binary o 4-bit) no son compatibles con el kernel actual.
- La inferencia es batch-1, lo que limita el throughput en aplicaciones que requieran procesar múltiples solicitudes simultáneamente.
- La calidad del modelo se degrada respecto al original: la perplexity aumenta un 9,91%, y el error de reconstrucción L2 es de 0,0553. Esto puede traducirse en respuestas menos precisas o con más alucinaciones en tareas complejas.
- El modelo solo soporta inglés; no se han documentado capacidades multilingües.
- La licencia `lfm-open-license` de Liquid AI puede imponer restricciones de uso comercial o de redistribución. Es necesario revisar los términos completos en el enlace proporcionado antes de desplegarlo en producción.
- No se dispone de información sobre sesgos o riesgos de contenido dañino específicos de este modelo comprimido, aunque al derivar de LFM2-1.2B podría heredar sesgos presentes en sus datos de entrenamiento.
- El paquete no incluye un tokenizador estándar de HuggingFace; el vocabulario y las reglas de tokenización están en `tokenizer.bin` y solo son utilizables por el runtime Cascadia.

## Enlaces

- Modelo en HuggingFace: [ZTFlynn/LFM2-1.2B-Cascadia-ternary3](https://huggingface.co/ZTFlynn/LFM2-1.2B-Cascadia-ternary3)
- Modelo base: [LiquidAI/LFM2-1.2B](https://huggingface.co/LiquidAI/LFM2-1.2B)
- Paper técnico LFM2: [arXiv:2511.23404](https://arxiv.org/abs/2511.23404)
- Blog de Liquid AI sobre LFM2: [Introducing LFM2](https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models)
- Repositorio del runtime Cascadia: [github.com/EntroMorphic/cassie](https://github.com/EntroMorphic/cassie)
- Documentación del formato de paquete: [docs/package_format.md](https://github.com/EntroMorphic/cassie/blob/main/docs/package_format.md)

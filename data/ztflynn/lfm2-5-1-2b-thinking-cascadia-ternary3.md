# ZTFlynn/LFM2.5-1.2B-Thinking-Cascadia-ternary3

## Resumen

ZTFlynn/LFM2.5-1.2B-Thinking-Cascadia-ternary3 es un paquete de compresión del modelo de razonamiento LFM2.5-1.2B-Thinking de Liquid AI, desarrollado por ZTFlynn mediante la técnica Cascadia. Esta técnica combina una superficie spline con tablas de consulta (LUT) por bandas para reducir el peso del modelo de 2.23 GB a 747 MB, lo que supone una compresión de 3.14x con una pérdida de perplexidad de solo el 4.73% en el corpus de evaluación. El resultado es un modelo ejecutable en CPU con un runtime C cuyas únicas dependencias son libc, libm y libgomp, pensado para entornos edge y de bajos recursos.

El modelo base, LFM2.5-1.2B-Thinking, es un modelo de razonamiento de 1.2B parámetros optimizado para tareas de matemáticas, lógica y razonamiento multi-paso, con una ventana de contexto de hasta 32.768 tokens. La versión comprimida mantiene la arquitectura original (16 bloques, GQA 32q/8kv, convoluciones cortas con puerta) y se distribuye como un paquete binario en formato Cascadia, no como un checkpoint estándar de transformers. Su relevancia actual radica en permitir inferencia de razonamiento en dispositivos con menos de 1 GB de memoria, algo que hasta hace poco requería infraestructura de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (16 bloques, GQA 32q/8kv, convoluciones cortas con puerta) |
| Parametros totales | ~1.2B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (segun documentacion de Liquid AI) |
| Tipos de cuantizacion | Ternary-3 (0.60 bytes por peso, 5.09 bits por peso) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm-open-license (Liquid AI) |
| Formato de pesos | Formato Cascadia (weights.bin, manifest.json, aux.bin, tokenizer.bin) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Thinking emplea la arquitectura LFM2.5 de Liquid AI, que combina atención con consultas agrupadas (GQA) y convoluciones cortas con puerta (gated short convolutions) en cada bloque. Esta arquitectura hibrida esta diseñada para eficiencia en dispositivos, manteniendo calidad de razonamiento. El entrenamiento del modelo base incluye un ajuste especifico para razonamiento encadenado (chain-of-thought), con enfasis en matematicas y logica.

La compresion Cascadia, por su parte, no modifica la arquitectura sino que comprime los pesos. El proceso ajusta una superficie B-spline a cada matriz de pesos para capturar la estructura a gran escala. Cada peso se asigna a una de 32 bandas segun su valor spline, y se aprende un codebook k-means por banda sobre los residuos. El 0.5% superior de errores se conserva exactamente como f32. Los indices del codebook se empaquetan en base 3, con cinco trits por byte (3^5 = 243). La reconstruccion se realiza como `W = spline(j,c) + codebook[band][index]`, evaluada dentro del producto matriz-vector, sin construir nunca la matriz densa. Un paso adicional de "Harmonic Collapse" elimina los factores de escala por bloque, simplificando el formato.

## Capacidades

- Razonamiento multi-paso y chain-of-thought: el modelo base esta entrenado para pensar paso a paso antes de responder, como se muestra en el ejemplo de salida incluido en la model card.
- Matematicas y logica: optimizado para problemas aritmeticos, algebraicos y de razonamiento logico.
- Generacion de texto: capaz de producir respuestas coherentes y contextualizadas en ingles.
- Ejecucion en CPU: el paquete comprimido se ejecuta mediante el runtime C de Cascadia, sin necesidad de GPU ni de librerias de deep learning.
- Inferencia determinista: soporta decodificacion greedy reproducible con semilla, asi como muestreo con temperatura, top-k y top-p.
- Compresion eficiente: 3.14x de reduccion de tamano con perdida minima de calidad, adecuado para despliegue en memoria limitada.

## Casos de uso

- Asistentes de razonamiento en dispositivos moviles: el modelo cabe en menos de 1 GB, por lo que puede integrarse en apps de Android o iOS para responder preguntas de logica o matematicas sin conexion. Su ejecucion en CPU lo hace viable en telefonos de gama media.
- Procesamiento por lotes en servidores CPU: para tareas de clasificacion o generacion de texto donde no se requiere baja latencia, el runtime C permite ejecutar multiples instancias en maquinas sin GPU, reduciendo costes de infraestructura.
- Educacion y tutoria offline: un chatbot educativo que explique conceptos matematicos paso a paso, funcionando en portatiles antiguos o en entornos sin acceso a internet.
- Automatizacion de razonamiento en edge IoT: en dispositivos con microcontroladores o SBC (como Raspberry Pi), el modelo puede resolver problemas de logica o planificacion simple sin depender de la nube.
- Prototipado rapido de agentes de razonamiento: al ser un paquete ligero y facil de integrar via el runtime C, permite experimentar con agentes que requieren multiples pasos de razonamiento en entornos de desarrollo con recursos limitados.
- Evaluacion de tecnicas de compresion: como referencia para investigadores que estudian el equilibrio entre compresion y calidad en modelos de razonamiento pequenos, dado que se documenta la perdida de perplexidad de forma rigurosa.

## Benchmarks y rendimiento

La model card proporciona datos de perplexity comparando el modelo base y el comprimido sobre 8.176 tokens emparejados de FineWeb-Edu con ventanas de 512 tokens:

| Modelo | Perplexity |
|---|---|
| LiquidAI/LFM2.5-1.2B-Thinking (bf16) | 85.61 |
| ZTFlynn/LFM2.5-1.2B-Thinking-Cascadia-ternary3 | 89.66 |
| **Diferencia** | **+4.73%** (95% CI [1.0329x, 1.0619x], t = +6.54) |

Tambien se documenta el coste de compresion segun el tamano del modelo en la misma familia:

| Modelo | Parametros | Coste en perplexity |
|---|---|---|
| LFM2.5-230M | 0.23B | +7.7% |
| LFM2-350M | 0.35B | +3.5% |
| LFM2-24B-A2B | 24B | sin coste detectable (< 0.3%) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- CPU compatible con libc, libm y libgomp (practicamente cualquier CPU moderna, incluyendo ARM).
- RAM estimada: el paquete pesa 747 MB, por lo que se necesitan al menos 1 GB de RAM libre para cargar los pesos y ejecutar la inferencia.
- No requiere GPU: el runtime C ejecuta el modelo en CPU, lo que lo hace apto para servidores sin aceleradores y para dispositivos edge.
- Opciones de despliegue: runtime C de Cascadia (repositorio EntroMorphic/cassie), con interfaz de linea de comandos y API Python via `cascadia.load_compressed`.
- Latencia y throughput: no se proporcionan datos concretos. Al ser batch-1 y ejecutarse en CPU, la latencia dependera del hardware; en un CPU moderno se espera un rendimiento modesto pero suficiente para tareas interactivas o por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ZTFlynn/LFM2.5-1.2B-Thinking-Cascadia-ternary3 | ~1.2B | 32.768 | lfm-open-license | Cascadia (binario) | Comprimido 3.14x, ejecutable en CPU |
| LiquidAI/LFM2.5-1.2B-Thinking | ~1.2B | 32.768 | lfm-open-license | safetensors (bf16) | Modelo base, requiere GPU o CPU con librerias de deep learning |
| NexaAI/LFM2.5-1.2B-thinking-npu | ~1.2B | 32.768 | lfm-open-license | formato NPU | Optimizado para aceleradores NPU en dispositivos moviles |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de razonamiento de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles: el modelo base esta entrenado unicamente en ingles, por lo que no es adecuado para otros idiomas.
- Ejecucion limitada al runtime Cascadia: no es un checkpoint de transformers estandar; requiere el runtime C de Cascadia y no puede cargarse directamente con `AutoModelForCausalLM` sin la capa de compatibilidad Python.
- Solo soporta el preset ternary-3: el runtime ejecuta exclusivamente paquetes ternary-3; otros presets de compresion requieren conversion y no estan soportados por el kernel actual.
- Inferencia batch-1: no soporta procesamiento por lotes, lo que limita el throughput en aplicaciones de alto volumen.
- Sin beam search: solo decodificacion greedy o muestreo, lo que puede afectar a la calidad en tareas que se benefician de busqueda exhaustiva.
- Perdida de calidad medida: la compresion introduce un +4.73% de perplexidad, que puede traducirse en errores adicionales en tareas de razonamiento complejo.
- Licencia lfm-open-license: aunque permite uso comercial, es necesario revisar los terminos especificos de la licencia de Liquid AI para verificar restricciones de redistribucion o modificacion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en razonamiento multi-paso.

## Enlaces

- Modelo comprimido: https://huggingface.co/ZTFlynn/LFM2.5-1.2B-Thinking-Cascadia-ternary3
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Blog de Liquid AI sobre LFM2.5-1.2B-Thinking: https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-1.2b-thinking
- Blog de Liquid AI sobre la familia LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Repositorio del runtime Cascadia: https://github.com/EntroMorphic/cassie
- Formato de paquete: https://github.com/EntroMorphic/cassie/blob/main/docs/package_format.md
- Modelo inspirador (Magneato/deepseek-r1-qwen-7b-lutc): https://huggingface.co/Magneato/deepseek-r1-qwen-7b-lutc
- Variante NPU: https://huggingface.co/NexaAI/LFM2.5-1.2B-thinking-npu

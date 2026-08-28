# ZTFlynn/LFM2.5-2.6B-Cascadia-ternary3

## Resumen

ZTFlynn/LFM2.5-2.6B-Cascadia-ternary3 es un paquete de pesos comprimidos del modelo LFM2.5-2.6B de Liquid AI, generado por el autor ZTFlynn mediante la técnica de compresión Cascadia. El modelo base es un transformer denso de 2.6B parámetros con contexto de 128K, diseñado para cargas de trabajo agénticas con tool calling nativo. Esta versión comprimida reduce el checkpoint de 5.14 GB a 1.77 GB (factor 3.05x) usando una combinación de superficies spline, tablas de búsqueda por bandas y cuantización ternaria, alcanzando 5.25 bits por peso efectivos.

La relevancia de este paquete radica en que permite ejecutar un modelo de 2.6B con capacidades de agente en CPU de gama baja o dispositivos edge, sin necesidad de GPU, gracias a un runtime C minimalista que solo depende de libc, libm y libgomp. El error de reconstrucción relativo L2 es de 0.0544, y la perplejidad medida en una muestra de FineWeb-Edu es incluso ligeramente inferior a la del checkpoint original (24.67 vs 25.20), aunque el autor advierte que esta diferencia no es estadísticamente significativa y no debe interpretarse como una mejora real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con GQA (32q/8kv), gated short convolutions, 30 capas, hidden 2048 |
| Parametros totales | 2.6B (aprox., heredado del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K (heredado del modelo base) |
| Tipos de cuantizacion | Ternario (3 niveles) con spline manifold y lookup tables por banda; 5.25 bits/peso efectivos |
| Idiomas soportados | Ingles |
| Licencia | lfm-open-license (ver enlace en la seccion de enlaces) |
| Formato de pesos | Formato propio Cascadia: weights.bin, manifest.json, aux.bin, tokenizer.bin |

## Arquitectura y entrenamiento

Este paquete no es un modelo entrenado desde cero, sino una compresion del checkpoint bf16 de LiquidAI/LFM2.5-2.6B. La tecnica Cascadia ajusta una superficie B-spline a cada matriz de pesos para capturar la estructura a gran escala. Cada peso se asigna a una de 32 bandas segun su valor spline, y se aprende un codebook k-means por banda sobre los residuos. El 0.5% de los errores mas grandes se conservan exactamente como f32. Los indices de los codebooks se empaquetan en base 3, con cinco trits por byte (3^5 = 243, que cabe en un byte). La reconstruccion se realiza como W = spline(j,c) + codebook[band][index], evaluada dentro del producto matriz-vector, de modo que nunca se construye una matriz densa completa.

El modelo base LFM2.5-2.6B fue desarrollado por Liquid AI y entrenado para tareas agénticas, con soporte nativo de tool calling y un modo de razonamiento explicito. No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto: el modelo base es un modelo de lenguaje de proposito general, capaz de continuar texto y responder instrucciones.
- Tool calling nativo: heredado del modelo base, permite al modelo invocar funciones externas durante la generacion.
- Razonamiento multi-paso: el modelo base incluye un modo de razonamiento explicito que mejora la resolucion de problemas complejos, aunque anade latencia y consumo de tokens.
- Ejecucion en CPU: gracias a la compresion Cascadia, el paquete puede ejecutarse en CPU con un runtime C ligero, sin necesidad de GPU.
- Multilingue: solo ingles (segun la ficha del paquete).
- Decodificacion greedy y muestreada: soporta parametros de temperatura, top-k y top-p, con semilla reproducible.

## Casos de uso

- Asistentes locales en dispositivos edge: el modelo puede ejecutarse en un mini-PC o un router con CPU modesta, proporcionando un asistente conversacional con tool calling sin depender de la nube. Su tamano de 1.77 GB cabe en la mayoria de dispositivos con 2 GB de RAM libre.
- Agentes de automatizacion en entornos sin GPU: en servidores de oficina o maquinas virtuales sin acelerador grafico, este paquete permite desplegar un agente que planifica y ejecuta tareas multi-paso (por ejemplo, gestion de calendario o consultas a APIs) con un runtime minimo.
- Prototipado rapido de aplicaciones de IA en CPU: los desarrolladores pueden integrar el paquete en un pipeline de Python usando la libreria `cascadia` y el modelo base de Hugging Face, sin necesidad de infraestructura GPU para pruebas iniciales.
- Investigacion en compresion de modelos: el paquete sirve como caso de estudio de la tecnica Cascadia, permitiendo comparar la fidelidad de reconstruccion (error L2) y la perplejidad frente al checkpoint original.
- Despliegue en entornos con restricciones de memoria: con 1.77 GB de pesos, el modelo cabe en sistemas embebidos con almacenamiento limitado, como placas de desarrollo o dispositivos IoT con 4 GB de RAM.
- Generacion de texto por lotes en CPU: para cargas de trabajo batch-1 (una peticion a la vez), el runtime C ofrece una alternativa ligera a soluciones basadas en GPU, con latencia aceptable para tareas no interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card proporciona dos metricas de calidad:

| Metrica | Valor |
|---|---|
| Perplejidad (paquete comprimido) | 24.67 |
| Perplejidad (checkpoint bf16) | 25.20 |
| Error L2 relativo vs bf16 | 0.0544 |
| Ganancia sistematica (1.0000 = fiel) | 0.9993 |

La perplejidad se midio sobre 16,352 tokens pareados de FineWeb-Edu en 31 ventanas independientes de 512 tokens. El autor indica que la diferencia de perplejidad no es estadisticamente significativa y que la fidelidad de reconstruccion (error L2) es la metrica adecuada para evaluar la copia. El error L2 se midio sobre el 100% de los parametros (167 tensores).

## Requisitos de hardware

- CPU: cualquier procesador con soporte para libc, libm y libgomp (x86-64, ARM64, etc.). No se requiere GPU.
- RAM: al menos 2 GB para cargar los 1.77 GB de pesos mas el overhead del runtime. Se recomienda 4 GB para margen.
- Almacenamiento: 1.8 GB para el paquete descargado.
- Runtime: el runtime C de Cascadia (repositorio `cassie`) compilado con CMake, o la libreria Python `cascadia` que carga los pesos en un modelo `transformers` del modelo base.
- Velocidad: no se proporcionan datos de latencia o throughput para este paquete especifico. El modelo base alcanza 220 tok/s en un Apple M5 Max y 113 tok/s en un Ryzen AI Max+ 395, pero estas cifras corresponden al checkpoint bf16 y no son directamente aplicables al paquete comprimido en CPU.
- Limitaciones de despliegue: el runtime solo soporta batch-1, decodificacion greedy o muestreada (sin beam search), y ejecuta exclusivamente paquetes en formato ternary-3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| ZTFlynn/LFM2.5-2.6B-Cascadia-ternary3 | 2.6B | 128K | 1.77 GB | lfm-open-license | Cascadia (propietario) |
| LiquidAI/LFM2.5-2.6B (bf16) | 2.6B | 128K | 5.14 GB | lfm-open-license | safetensors |
| LiquidAI/LFM2.5-2.6B (GGUF) | 2.6B | 128K | no disponible | lfm-open-license | GGUF |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de informacion sobre otros modelos de tamano similar en la documentacion proporcionada. La principal diferencia entre el paquete Cascadia y las versiones GGUF es el formato de pesos y el runtime de ejecucion: Cascadia requiere su propio runtime C, mientras que GGUF es compatible con llama.cpp, Ollama y otros motores. El paquete Cascadia ofrece un factor de compresion mayor (3.05x frente a las cuantizaciones GGUF tipicas de 4 bits, que suelen reducir a ~2.5x) y esta optimizado para CPU sin dependencias externas.

## Limitaciones y advertencias

- El paquete no es un checkpoint de `transformers`; requiere el runtime C de Cascadia o la libreria Python `cascadia` para ejecutarse. No se puede cargar directamente con `AutoModelForCausalLM` sin el adaptador.
- Solo soporta batch-1, lo que limita su uso en servidores de alta concurrencia.
- No dispone de beam search; solo decodificacion greedy o muestreada.
- El runtime solo ejecuta paquetes en formato ternary-3; otros presets de Cascadia requieren conversion y no estan soportados por el kernel actual.
- El modelo base solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La compresion introduce un error de reconstruccion (L2 relativo de 0.0544), que aunque bajo, puede afectar a tareas sensibles a pequenas variaciones en los pesos, como la generacion de codigo o el razonamiento matematico.
- La licencia lfm-open-license debe revisarse para confirmar los terminos de uso comercial y las restricciones de redistribucion.
- El autor advierte que la perplejidad medida es inferior a la del checkpoint original, pero esto se debe a la varianza de la muestra y no implica que el modelo comprimido sea mejor.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/ZTFlynn/LFM2.5-2.6B-Cascadia-ternary3
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Repositorio del runtime Cascadia (cassie): https://github.com/EntroMorphic/cassie
- Formato de paquete Cascadia: https://github.com/EntroMorphic/cassie/blob/main/docs/package_format.md
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE

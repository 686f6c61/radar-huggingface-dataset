# XGeorgeCostanzaX/Qwen3.8-27B-Nyquant-preview

## Resumen

Qwen3.8-27B-Nyquant-preview es un conjunto de cuantizaciones de precisión mixta publicadas por el usuario XGeorgeCostanzaX sobre el modelo base Qwen/Qwen3.8-27B (revisión `1d4bf0f2`). El repositorio no contiene un modelo nuevo, sino varias versiones comprimidas del mismo transformer de 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), empaquetadas en formatos safetensors (export compatible con AWQ) y GGUF, con el objetivo de reducir el peso en memoria y hacer viable la inferencia en hardware modesto o antiguo.

La propuesta diferencial es el ajuste fino de la cuantización a hardware concreto: una variante de 4 bits pensada para Intel Arc B70 con vLLM, dos variantes de 3 bits optimizadas para Tesla P100 de 16 GB mediante un conjunto de parches propios para llama.cpp, y dos variantes de clase 2 bits (unos 8 GB) para CPU o cualquier backend soportado por llama.cpp. El autor publica métricas de divergencia KL frente al modelo BF16, resultados de benchmarks como GPQA Diamond o HumanEval y velocidades de decodificación medidas, lo que permite evaluar el compromiso entre tamaño y calidad.

Es relevante ahora porque el modelo base es grande para GPUs de consumo y para aceleradores legacy sin soporte de tipos de dato modernos (P100, P40), y estas cuantizaciones ofrecen una vía concreta para desplegarlo en ese hardware. Se trata de una *preview* pública: el propio autor advierte de que las descargas son versiones tempranas y que la calidad se mide contra el BF16, no contra el modelo original completo en todos los casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.8-27B); cuantización de precisión mixta Nyquant |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card (se citan pruebas con salida de 64k y 131k tokens) |
| Tipos de cuantizacion | 4 bits (4,30 bpw cuerpo, AWQ-compatible), 3 bits (3,29 bpw cuerpo; 3,465 bpw completo), 2 bits (2,38 bpw completo); tipos GGUF estándar en U-X y KD-B, tipos de tensor personalizados en RC3Y |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (NQ4MAX-B70-AWQ) y GGUF (RC3Y, RC3Y-v2-K, U-X, KD-B) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de Qwen con 26.895.998.464 parámetros. Sobre él, Nyquant aplica cuantización de pesos de precisión mixta: distintas capas o tensores reciben un número de bits diferente según su sensibilidad, y el reparto se ajusta al hardware objetivo. No se trata de un reentrenamiento ni de un destilado, sino de una compresión post-entrenamiento; el autor mide la calidad como divergencia KL (KLD) frente al modelo BF16 y mediante benchmarks de tarea.

Las variantes se diferencian en el compromiso tamaño/hardware. NQ4MAX-B70-AWQ usa 4,30 bpw en el cuerpo y se exporta en formato compatible con AWQ para vLLM sobre Intel Arc B70, con una divergencia de +0,012 nats respecto a BF16. RC3Y y RC3Y-v2-K emplean 3 bits (3,29 bpw de cuerpo y 3,465 bpw de archivo completo respectivamente) y requieren un conjunto de parches propios para llama.cpp (0001 a 0028) porque usan tipos de tensor personalizados que el llama.cpp upstream no puede cargar. U-X y KD-B son de clase 2 bits con 2,38 bpw completo y tipos GGUF estándar; KD-B se describe como destilado desde U-X y con menor KLD (0,2898 frente a 0,3457). El autor menciona además dos resultados de investigación sin descarga (q2lite y B3). No se detallan en la información disponible la composición del dataset de entrenamiento del modelo base, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento en modo *thinking*: los benchmarks de GPQA Diamond e IFBench se midieron explícitamente en modo pensamiento.
- Razonamiento científico y de posgrado: GPQA Diamond 82,3 con tope de salida de 64k y 86,4 al continuar las respuestas truncadas hasta 131k.
- Seguimiento de instrucciones: IFBench 81,0 en la variante RC3Y-v2-K.
- Generación de código: HumanEval 63,4 % en KD-B (2 bits) frente a 78,0 % del BF16, con pensamiento desactivado y n=164.
- Salidas largas: las pruebas citadas emplean topes de 64k y 131k tokens de salida.
- Decodificación especulativa con MTP (multi-token prediction): el autor reporta aceleraciones con MTP K=2 y K=3 en sus builds.
- Compatibilidad con vLLM mediante export AWQ (NQ4MAX-B70) y con llama.cpp (resto de variantes, con parches en el caso de RC3Y).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; el pipeline es solo de texto.
- Multilingüismo: limitado a inglés según el campo `language`.

## Casos de uso

- Inferencia en Tesla P100 de 16 GB: usar `RC3Y-v2-K` con el conjunto de parches de llama.cpp incluido permite ejecutar un modelo de ~27B en una GPU de 16 GB con 33,4 t/s en decodificación plana y 50,5 t/s con MTP K=3 en contexto corto, un escenario habitual en clústeres de investigación con hardware legacy.
- Despliegue en Intel Arc B70 con vLLM: la variante `NQ4MAX-B70-AWQ` (20,1 GB, 5 shards) se carga sin parches y ofrece 58–59 t/s en chat de un solo flujo con MTP, adecuada para servir una API interna sobre aceleradores Intel.
- Equipos con unos 8 GB de memoria: `KD-B` (7.998.312.448 bytes) cabe en GPU de consumo de 8 GB o en CPU, con HumanEval 63,4 % y 55,4 t/s en A100, útil para asistentes de código locales en estaciones de trabajo modestas.
- Razonamiento científico de posgrado en local: con GPQA Diamond 82,3 en RC3Y-v2-K, se puede montar un asistente de preguntas técnicas sobre una sola P100 sin depender de APIs externas.
- Evaluación de cuantizaciones en investigación: el repositorio publica tableros de KLD por ventanas, comparaciones pareadas y metodología reproducible, lo que sirve para estudiar el impacto de la precisión mixta en modelos de ~27B.
- Prototipado de chat conversacional en CPU: `U-X` o un GGUF comunitario estándar (unsloth, bartowski) permiten levantar un servidor llama.cpp en CPU para pruebas de integración antes de migrar a GPU.
- Sustitución de modelos mayores en pipelines con restricciones de memoria: al reducir de ~54 GB en BF16 a 8–20 GB, se puede integrar el modelo en contenedores con límites estrictos de VRAM manteniendo buena parte de la calidad en tareas de texto.

## Benchmarks y rendimiento

Datos medidos por el autor y publicados en la model card:

| Benchmark / metrica | RC3Y-v2-K (3 bits) | KD-B (2 bits) | BF16 (referencia) |
|---|---|---|---|
| GPQA Diamond (tope 64k salida) | 82,3 | no disponible | no disponible |
| GPQA Diamond (continuado a 131k) | 86,4 | no disponible | no disponible |
| IFBench | 81,0 | no disponible | no disponible |
| HumanEval (thinking off, n=164) | no disponible | 63,4 % | 78,0 % |
| KLD macro vs BF16 | −0,0144 frente a RC3Y-default | 0,2898 (U-X: 0,3457) | 0 |
| KLD D4 macro (archivo original) | 0,143355 (RC3Y) | no disponible | 0 |

Rendimiento medido:

| Variante | Hardware | Throughput |
|---|---|---|
| NQ4MAX-B70-AWQ | Intel Arc B70, vLLM | 58–59 t/s single-stream con MTP |
| RC3Y-v2-K | Tesla P100 16 GB | 33,4 t/s decodificación plana; 50,5 t/s con MTP K=3 |
| RC3Y | Tesla P100 16 GB | 38,9 t/s con MTP K=2 (build de desarrollo) |
| U-X / KD-B | A100 | 55,4 t/s single-stream (informativo) |

No se han publicado en la información disponible resultados de MMLU, GSM8K ni comparaciones directas con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada: 20,1 GB (18,7 GiB) para NQ4MAX-B70-AWQ; 11,65 GB para RC3Y y RC3Y-v2-K; 7,998 GB para U-X y KD-B.
- GPU objetivo declaradas: Intel Arc B70 (variante AWQ con vLLM), Tesla P100 16 GB (RC3Y y RC3Y-v2-K con parches), A100 (medición informativa de U-X y KD-B).
- GPU de consumo: KD-B y U-X caben en tarjetas de 8 GB; NQ4MAX-B70 requiere al menos 20 GB, por lo que no cabe en GPUs de consumo de 16 GB o menos.
- Tesla P40 y GPUs más nuevas: el autor recomienda GGUFs comunitarios estándar (unsloth, bartowski) y advierte de que la ruta rápida de RC3Y es exclusiva de P100; los fallbacks en P40 y GPUs nuevas no están probados y se esperan lentos.
- Despliegue: vLLM con export AWQ (NQ4MAX-B70); llama.cpp con parches propios (RC3Y, RC3Y-v2-K); llama.cpp upstream con tipos estándar (U-X, KD-B); CPU con U-X o GGUF comunitario.
- Latencia y throughput: ver tabla de benchmarks; el autor no publica latencias de primera token ni métricas de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Nyquant-preview (este) | ~26,9 mil M | no disponible | 4, 3 y 2 bits (Nyquant) | apache-2.0 | Optimizado por hardware; requiere parches en RC3Y |
| Qwen/Qwen3.8-27B (BF16) | ~26,9 mil M | no disponible | BF16 | apache-2.0 | Referencia de calidad; ~54 GB en BF16 |
| unsloth/Qwen3.8-27B-GGUF | ~26,9 mil M | no disponible | GGUF estándar (UD-IQ2_XXS y otros) | apache-2.0 | Carga en llama.cpp upstream; base de U-X |
| bartowski (GGUF de Qwen3.8-27B) | ~26,9 mil M | no disponible | GGUF estándar (IQ3_S, Q3_K_XL, etc.) | apache-2.0 | Recomendado por el autor para P40 y GPUs nuevas |

Los datos de contexto y benchmarks de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es una *preview* pública: el autor advierte de que son versiones tempranas y que deben leerse las limitaciones de cada variante antes de usarlas en producción.
- Resultados no replicados de forma independiente: RC3Y-v2-K se describe como un resultado expuesto en desarrollo y no replicado por terceros.
- RC3Y y RC3Y-v2-K no cargan en llama.cpp upstream: requieren compilar con el conjunto de parches 0001–0028 incluido; sin ellos la inferencia no es posible.
- La ruta rápida de RC3Y es exclusiva de P100; los fallbacks en P40 y GPUs más nuevas no están probados y se esperan lentos.
- Pérdida de calidad medible: KD-B baja HumanEval de 78,0 % a 63,4 %; U-X presenta KLD de 0,3457 frente a 0,2898 de KD-B.
- U-X es más grande que su base (UD-IQ2_XXS) y el autor no reclama paridad de tamaño con ella.
- Idiomas: solo inglés declarado; no hay soporte multilingüe verificado.
- Longitud de contexto: no declarada en la model card; las pruebas usan salidas de 64k y 131k, pero no se especifica la ventana de entrada.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base Qwen3.8-27B.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los parches de llama.cpp incluidos.
- No se declaran capacidades de tool calling ni de agentes; no asumirlas en producción sin validación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/XGeorgeCostanzaX/Qwen3.8-27B-Nyquant-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF comunitario de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- GGUF comunitario de bartowski: https://huggingface.co/bartowski
- Paper, blog o demo del autor: no disponible en la información proporcionada.

# thuEcstasy1/InfuseLoop-8

## Resumen

InfuseLoop-8 es un modelo de lenguaje base de tipo causal-LM desarrollado por el usuario thuEcstasy1 en el marco del proyecto de investigación InfuseLoop. Se trata de un transformer con backbone compartido de 28 capas y 596.143.580 parámetros, entrenado sobre 6.000.082.944 tokens de FineWeb-Edu en 45.777 actualizaciones. Su rasgo distintivo es una arquitectura de bucles recurrentes en paralelo (8 loops) con Attention Residuals de trayectoria cruzada causal, una propuesta de investigación orientada a explorar el escalado en profundidad recurrente sobre un backbone denso de tamano pequeno.

El modelo parte de una configuración y tokenizer de Qwen3-0.6B, pero se inicializa desde una inicialización aleatoria común, no es un fine-tune de los pesos preentrenados de Qwen3. Se distribuye como checkpoint de investigación en FP32 con safetensors y requiere una implementación de referencia propia (`infuseloop`) para su carga, ya que no registra `AutoModelForCausalLM` ni garantiza compatibilidad con los pipelines genéricos de Transformers.

Es relevante ahora como artefacto de investigación reproducible: publica validación de exportación con recuentos de parámetros y hashes SHA256, documenta métricas de perplejidad y un promedio de siete tareas downstream, y su licencia Apache-2.0 facilita la inspección y experimentación. No obstante, su presupuesto de entrenamiento (6B tokens) y la ausencia de alineación lo sitúan lejos de un uso en producción como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con backbone compartido de 28 capas y 8 loops recurrentes en paralelo con Attention Residuals de trayectoria cruzada causal |
| Parametros totales | 596.143.580 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (longitud de secuencia de entrenamiento); ventanas locales privadas de 64 tokens en G-SWA |
| Tipos de cuantizacion | no disponible (solo se publican pesos en FP32) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (precisión original FP32; sin estados de optimizador ni datos de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura se basa en un backbone transformer compartido de 28 capas con dimensión oculta 1.024 y dimensión de FFN 3.072. La atención emplea 16 cabezas de consulta y 8 cabezas KV con dimensión de cabeza 128 (GQA con ratio 2:1). Sobre ese backbone se ejecutan 8 loops recurrentes en paralelo: cada loop reutiliza el backbone y produce una trayectoria de salida, y el enrutamiento toma las salidas de loops más superficiales del ciclo de ejecución precedente, aplicando RMSNorm en origen y Attention Residuals de trayectoria cruzada. El mecanismo G-SWA combina un KV global compartido en el primer loop con ventanas locales privadas de 64 tokens.

El entrenamiento utilizó 6.000.082.944 tokens de FineWeb-Edu durante 45.777 actualizaciones, con longitud de secuencia 1.024 y batch global de 128 secuencias. La inicialización es desde una inicialización aleatoria común (no desde pesos Qwen3 preentrenados), aunque se reutilizan la configuración de backbone y el tokenizer de Qwen3-0.6B con revisión fijada `c1899de289a04d12100db370d81485cdf75e47ca`. No se documenta RLHF, DPO ni ningún tipo de alineación posterior. La implementación pública es una referencia eager en PyTorch que no reproduce las mediciones optimizadas de latencia con CUDA Graph, FA4 y Triton del paper.

## Capacidades

- Generación de texto causal autoregresiva en inglés, orientada a continuación de prefijos naturales sin plantilla de chat.
- Modelo base, no asistente instruido: no hay alineación conversacional ni modo de razonamiento explícito.
- Exploración de profundidad recurrente: 8 loops en paralelo sobre un backbone compartido, con profundidades medidas de cuatro y ocho.
- Atención con ventana deslizante global-local (G-SWA) que combina KV global del primer loop y ventanas privadas de 64 tokens.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Investigación en arquitecturas recurrentes: reproducción de los experimentos del proyecto InfuseLoop para estudiar el efecto de la profundidad recurrente (4 vs. 8 loops) sobre un backbone denso de 0,6B, usando la implementación de referencia y los checkpoints publicados.
- Análisis de Attention Residuals de trayectoria cruzada: ablaciones sobre el enrutamiento entre loops y el mecanismo G-SWA para medir su impacto en perplejidad y en tareas downstream.
- Benchmarking de perplejidad controlado: evaluación comparativa en WikiText-2 y LAMBADA con definiciones de métrica documentadas en el repositorio de código, útil para contrastar variantes del propio modelo.
- Estudio de eficiencia de parámetros: comparación de un modelo denso de 0,6B con bucles recurrentes frente a baselines densos del mismo orden de magnitud en el promedio de siete tareas (MMLU, HellaSwag, ARC-E, ARC-C, PIQA, WinoGrande, OpenBookQA).
- Docencia y formación: ejemplo didáctico de transformer con backbone compartido, GQA y atención global-local, con código de referencia legible en PyTorch eager.
- Validación de pipelines de exportación: uso de `export-validation.json` (recuentos de parámetros, SHA256 de pesos, comprobaciones de exportación de tensores origen) como caso de prueba para herramientas de verificación de checkpoints.
- Generación de texto exploratoria en inglés: continuación de prefijos en tareas de investigación donde la calidad inconsistente es aceptable y se documenta explícitamente.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| WikiText-2 word PPL (↓) | 35,55 |
| LAMBADA final-word PPL (↓) | 42,04 |
| Promedio siete tareas (%) (↑) | 43,07 |

El promedio downstream incluye MMLU (evaluación five-shot), HellaSwag, ARC-E, ARC-C, PIQA, WinoGrande y OpenBookQA (evaluación zero-shot). Las definiciones exactas de métricas y el alcance de los benchmarks están documentados en el repositorio de código. No se han publicado resultados desglosados por tarea en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,4 GB solo para pesos (596M parámetros × 4 bytes), más overhead de activaciones y KV cache; el repositorio ocupa 2,4 GB.
- El modelo cabe en GPUs de consumo con holgura en FP32 (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) y en GPUs de datacenter (A100, H100) sin necesidad de paralelismo.
- Tipos de cuantizacion: no se publican versiones GGUF ni cuantizadas; la conversión a FP16/BF16 o int8 requeriría trabajo adicional sobre la implementación de referencia.
- Opciones de despliegue: únicamente la implementación propia `infuseloop` instalada desde el repositorio de GitHub; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, y no se registra `AutoModelForCausalLM`.
- Latencia y throughput: no disponible. La model card advierte que la API pública eager no reproduce las mediciones optimizadas con CUDA Graph, FA4 y Triton del paper.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| InfuseLoop-8 | 596M | 1.024 | Apache-2.0 | Pesos en HF, requiere código propio | 8 loops recurrentes, base sin alinear, 6B tokens |
| Qwen3-0.6B | ~0,6B | no disponible en esta ficha | Apache-2.0 | HF, Transformers estándar | Referencia de configuración y tokenizer del que parte InfuseLoop-8; pesos preentrenados distintos |
| no disponible | — | — | — | — | No se dispone de datos de benchmarks de alternativas en la información proporcionada |

La comparación de rendimiento con alternativas no puede establecerse con rigor porque la información disponible no incluye resultados de benchmarks de modelos comparables bajo las mismas métricas.

## Limitaciones y advertencias

- Checkpoint de investigación entrenado con un presupuesto reducido de 6B tokens: la calidad del texto puede ser inconsistente o repetitiva.
- Riesgo de alucinación: las salidas pueden contener afirmaciones no respaldadas por evidencia.
- Sesgos: puede reflejar sesgos presentes en el corpus de preentrenamiento (FineWeb-Edu).
- Modelo base sin alineación: no hay fine-tuning de chat ni de seguridad; no debe usarse como asistente conversacional.
- Idiomas: solo inglés documentado.
- Contexto limitado a 1.024 tokens de entrenamiento, con ventanas locales de 64 tokens en G-SWA.
- Dependencia de código propio: requiere la clase `InfuseLoop`; no hay compatibilidad garantizada con pipelines genéricos de Transformers ni con servidores de inferencia estándar.
- Licencia Apache-2.0 permite uso comercial, pero la falta de alineación y la calidad limitada desaconsejan producción; el tokenizer mantiene su licencia upstream Apache-2.0.
- La evidencia experimental cubre solo modelos densos de ~0,6B y profundidades recurrentes de 4 y 8; el escalado a arquitecturas mayores densas o MoE queda abierto.
- No se redistribuye el corpus de preentrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/thuEcstasy1/InfuseLoop-8
- Proyecto InfuseLoop: https://thuecstasy.github.io/InfuseLoop/
- Código (GitHub): https://github.com/thuEcstasy/InfuseLoop

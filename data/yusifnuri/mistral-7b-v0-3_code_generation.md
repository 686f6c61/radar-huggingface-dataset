# yusifnuri/Mistral-7B-v0.3_code_generation

## Resumen

Este repositorio contiene un adaptador LoRA (entrenado con QLoRA) que especializa el modelo base `mistralai/Mistral-7B-v0.3` en una unica tarea empresarial: completar una funcion de Python de modo que supere los tests unitarios de referencia. Lo publica el autor `yusifnuri` como artefacto reproducible de su tesis de master *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models* (SRH University Hamburg, 2026), cuyo objetivo es medir modelos pequenos ajustados frente a APIs de proveedores frontera en exactitud, latencia, coste, exposicion de privacidad y volumen de equilibrio del retorno de la inversion.

El adaptador tiene un interes mas metodologico que practico. El propio autor advierte de forma explicita en la model card de que **el adaptador no funciona**: parte de la version base (no instruida) de Mistral-7B-v0.3, por lo que las completaciones continuan mas alla de la funcion objetivo hacia codigo no relacionado y con frecuencia invalido, al no haber aprendido nunca una convencion de parada. El `pass@1` medido es de 0,0006 (es decir, practicamente nulo), con una latencia media de 4.531 ms por peticion en batch 1 sobre una NVIDIA H200 y un coste de 19,61 USD por millon de tokens generados.

Es relevante porque documenta con cifras un resultado negativo reproducibile: el ajuste fino de un modelo base de 7.250 millones de parametros con QLoRA sobre HumanEval no basta para convertirlo en un generador de codigo fiable, y los deficits observados no pueden separarse entre el modelo y la adaptacion a 4 bits dentro de este diseno experimental. Los hiperparametros se mantuvieron constantes en todas las celdas del benchmark, por lo que el autor los presenta como una cota inferior conservadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Mistral-7B-v0.3); adaptador LoRA sobre proyecciones de atencion |
| Parametros totales | 7 250 millones en el modelo base; el repositorio solo contiene los pesos del adaptador (0,1 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No indicada en la informacion disponible; el modelo base Mistral-7B-v0.3 declara 32 768 tokens. La longitud maxima de secuencia usada en el entrenamiento del adaptador fue de 512 tokens |
| Tipos de cuantizacion | Entrenamiento del adaptador en QLoRA 4-bit NF4 con doble cuantizacion; el adaptador en si se distribuye en safetensors (pesos LoRA sin cuantizar). Cuantizaciones de inferencia del modelo fusionado: no disponibles en la informacion proporcionada |
| Idiomas soportados | No disponibles en la informacion proporcionada (el corpus de entrenamiento, HumanEval, es codigo Python en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere fusion con el modelo base para su uso autonomo |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA, no un modelo completo. Se aplica sobre `mistralai/Mistral-7B-v0.3` (7,25 B de parametros), un transformer decoder-only en su version **base**, sin ajuste por instrucciones ni RLHF. La adaptacion se hizo con QLoRA: el modelo base se carga en 4 bits NF4 con doble cuantizacion y se entrenan matrices de bajo rango sobre `q_proj`, `k_proj`, `v_proj` y `o_proj`, con rango 16, alpha 32 y dropout 0,05. El optimizador fue AdamW, con tasa de aprendizaje 2e-4, scheduler coseno, 3 % de warmup, 3 epocas, batch efectivo de 16 (2 x 8 con acumulacion de gradiente), longitud maxima de secuencia 512 y semilla 42.

El dataset es `openai/openai_humaneval` (licencia MIT), con 5 000 ejemplos de entrenamiento y 500 reservados para seleccion de checkpoint. El formato de prompt es literal: `Complete the following Python function:\n{text}`. La innovacion metodologica no esta en el modelo, sino en el diseno del benchmark: los mismos hiperparametros se aplicaron a todos los modelos y tareas, y la evaluacion cubre accuracy, latencia, coste por token, exposicion de privacidad y punto de equilibrio del ROI frente a APIs comerciales. La consecuencia tecnica mas citada por el autor es que el modelo base nunca aprendio una convencion de parada; ni la eliminacion del paso de fusion del adaptador ni la truncacion por secuencias de parada al estilo Codex corrigieron el comportamiento, segun la seccion 4.2.5 de la tesis.

## Capacidades

- Generacion de texto autoregresiva sobre el modelo base Mistral-7B-v0.3.
- Completado de funciones de Python en el formato de prompt exacto para el que fue entrenado (`Complete the following Python function:`).
- Ajuste a una unica tarea: pasar los tests unitarios de referencia de HumanEval. El `pass@1` medido es 0,0006, por lo que esta capacidad es nominal, no funcional.
- Soporte de tool calling / function calling: no disponible. No se entreno ni se evaluo.
- Soporte de agentes y razonamiento multi-paso: no disponible. El modelo base no esta instruido y el adaptador no anade esta capacidad.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): ninguna. No hay vision ni audio; existe una advertencia explicita sobre la ausencia de convencion de parada, que provoca sobre-generacion de codigo no relacionado.

## Casos de uso

- Verificacion independiente del benchmark: cualquiera puede descargar el adaptador, fusionarlo con `mistralai/Mistral-7B-v0.3` y reproducir el `pass@1` de 0,0006 sobre las 164 problemas de HumanEval, usando el arnes publicado en el repositorio del autor.
- Estudio de viabilidad economica de fine-tuning frente a API: el coste medido de 19,61 USD por millon de tokens generados en una H200 a 3,99 USD/GPU-hora permite calcular el volumen de equilibrio frente a precios por token de proveedores frontera, que es el objeto central de la tesis.
- Analisis de fallo en modelos base sin convencion de parada: sirve como caso documentado de sobre-generacion en modelos no instruidos, util para investigacion sobre formateo de salida y truncacion por secuencias de parada.
- Baseline de hiperparametros QLoRA: la configuracion concreta (r=16, alpha=32, dropout=0,05, 4-bit NF4, 2e-4, 3 epocas, semilla 42) puede reutilizarse como punto de partida controlado en experimentos de ajuste de modelos de 7B sobre corpus de codigo.
- Reentrenamiento correctivo: el adaptador es un punto de partida para repetir el ajuste sobre una variante instruida del mismo modelo, o anadiendo tokens de parada y ejemplos negativos, y medir la mejora frente a esta referencia negativa.
- Docencia y metodologia de evaluacion: ilustra como disenar una matriz de benchmark con hiperparametros constantes y como reportar resultados negativos con trazabilidad de coste, latencia y semilla.
- Aviso importante: no es adecuado para generacion de codigo en produccion, asistencia a desarrolladores, CI/CD ni ninguna tarea de ingenieria real, dado que su tasa de exito medida es practicamente nula.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| pass@1 (HumanEval) | 0,0006 |
| Latencia media, batch 1 | 4 531 ms |
| Coste por 1 M de tokens generados | 19,61 USD |
| Hardware de evaluacion | 1 x NVIDIA H200 (141 GB), batch size 1, utilizacion completa |
| Precio imputado | 3,99 USD por GPU-hora |
| Fecha de evaluacion | 5 de julio de 2026 |
| Instancias evaluadas | 164 problemas (todos los de HumanEval) para generacion de codigo; 200 instancias retenidas en el resto de tareas del benchmark |

No se han publicado en la informacion disponible resultados de MMLU, GSM8K, HumanEval de otros modelos ni comparaciones directas de rendimiento. La latencia excluye el transito de red. El autor advierte de que las puntuaciones no son comparables entre tareas, ya que cada tarea del benchmark lleva su propia metrica, y de que los corpora de evaluacion son benchmarks publicos longevos plausibles en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.

## Requisitos de hardware

- Peso del modelo base en FP16/BF16: aproximadamente 14,5 GB de pesos, mas cache KV. Cabe en GPUs de 24 GB (RTX 3090, RTX 4090, A10G, L4 con cuantizacion).
- Carga en 8 bits: aproximadamente 7,3 GB de pesos. Viable en GPUs de 12-16 GB con contexto moderado.
- Carga en 4 bits NF4 (la configuracion usada en el entrenamiento): aproximadamente 4 GB de pesos del modelo base mas el adaptador. Viable en GPUs consumer de 8-12 GB, con margen limitado para contexto largo.
- GPU recomendadas: H200 o H100 para entrenamiento y evaluacion a gran escala (la evaluacion publicada uso una H200 de 141 GB); A100 40/80 GB para entrenamiento QLoRA; RTX 4090 o RTX 3090 de 24 GB para inferencia comoda en precision completa; RTX 4080, RTX 4070 Ti Super o RTX 3060 de 12 GB con cuantizacion 4 bits.
- Latencia medida: 4 531 ms por peticion con batch 1 sobre H200. Throughput agregado y consumo de VRAM real no disponibles en la informacion proporcionada.
- Opciones de despliegue: `transformers` + `peft` (ruta oficial de la model card, con `PeftModel.from_pretrained`), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama previa fusion del adaptador con el modelo base y conversion a GGUF. El uso de Ollama o llama.cpp exige materializar un modelo fusionado, ya que el repositorio solo contiene el adaptador.
- Nota: usar una H200 para este modelo es un sobredimensionamiento de mas de 30 veces la VRAM necesaria en 4 bits; el coste por token publicado refleja esa eleccion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | pass@1 (HumanEval) |
|---|---|---|---|---|---|
| Este adaptador (sobre Mistral-7B-v0.3) | 7,25 B (base) + adaptador LoRA | 512 tokens en entrenamiento; contexto del base no verificado | Apache-2.0 | safetensors (LoRA/PEFT) | 0,0006 |
| Mistral-7B-v0.3 (base, sin adaptador) | 7,25 B | No disponible en la informacion proporcionada | Apache-2.0 | safetensors, GGUF (terceros) | No evaluado en la informacion disponible |
| CodeLlama-7B | 7 B (aproximado) | No disponible en la informacion proporcionada | Llama 2 Community License | safetensors, GGUF (terceros) | No evaluado en la informacion disponible |
| Qwen2.5-Coder-7B | 7 B (aproximado) | No disponible en la informacion proporcionada | Apache-2.0 | safetensors, GGUF (terceros) | No evaluado en la informacion disponible |

La comparativa se limita a parametros, licencia y formato, que son datos verificables; la informacion proporcionada no incluye resultados de benchmarks de las alternativas, por lo que cualquier comparacion de rendimiento seria especulativa. Conviene senalar que CodeLlama-7B y Qwen2.5-Coder-7B si estan disenados y ajustados especificamente para generacion de codigo, a diferencia de este adaptador, que parte de un modelo base no instruido. La matriz completa del benchmark del autor, en `results/benchmark_matrix.csv`, es la fuente que permitiria comparar celdas homogeneas, pero sus valores no forman parte de la informacion disponible aqui.

## Limitaciones y advertencias

- **El adaptador no funciona.** Es una advertencia explicita del autor: las completaciones sobrepasan la funcion objetivo hacia codigo no relacionado y con frecuencia invalido, porque el modelo base nunca aprendio una convencion de parada. El `pass@1` de 0,0006 lo confirma.
- Eliminar el paso de fusion del adaptador y anadir truncacion por secuencias de parada al estilo Codex no corrigio el comportamiento (seccion 4.2.5 de la tesis).
- El ajuste parte de la version **base** de Mistral-7B-v0.3, no de una version instruida; los deficits son atribuibles conjuntamente al modelo y a la adaptacion a 4 bits y no pueden separarse dentro de este diseno.
- Entrenamiento con una unica semilla: las diferencias reportadas confunden calidad del modelo con varianza de inicializacion.
- Especializado en una sola tarea sobre un unico corpus publico. No es un asistente de proposito general y no debe tratarse como tal.
- Los corpora de evaluacion (HumanEval y otros) son benchmarks publicos longevos plausibles en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.
- La evaluacion uso 200 instancias retenidas en la mayoria de tareas, por lo que el tamano de efecto detectable esta acotado en torno a diez puntos porcentuales; en generacion de codigo se usaron los 164 problemas completos.
- Riesgo de alucinacion: alto en el contexto de generacion de codigo, con salidas sintacticamente invalidas o funciones inexistentes.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto e idioma: la secuencia de entrenamiento fue de 512 tokens y no se documento soporte multilingue.
- Licencia Apache-2.0 en el adaptador, lo que permite uso comercial del artefacto; sin embargo, el modelo base y las dependencias (PEFT, transformers) tienen sus propias condiciones, y el dataset HumanEval se distribuye bajo MIT.
- Caveat de despliegue: al ser un adaptador, no puede ejecutarse de forma autonoma; requiere descargar el modelo base de 7,25 B y fusionarlo, con el coste de almacenamiento y VRAM correspondiente.
- Cualquier uso en produccion, atencion al cliente, CI/CD o asistencia a desarrolladores debe descartarse con los datos actuales.

## Enlaces

- Pagina de HuggingFace del adaptador: https://huggingface.co/yusifnuri/Mistral-7B-v0.3_code_generation
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Repositorio con codigo, configuraciones y arnes de evaluacion: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa del benchmark: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Analisis de coste por peticion: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Dataset de entrenamiento (HumanEval): https://huggingface.co/datasets/openai/openai_humaneval
- Cita de la tesis: Nuri, Yusif (2026), *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*, SRH University Hamburg.
- Nota sobre la busqueda web: los resultados recuperados (listados de proveedores B2B y contenidos sobre propelentes en Portugal) no guardan ninguna relacion con el modelo y no aportan informacion adicional verificable.

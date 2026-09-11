# yusifnuri/phi-4-mini-instruct_code_generation

## Resumen

`yusifnuri/phi-4-mini-instruct_code_generation` es un adaptador LoRA (PEFT) que especializa el modelo `microsoft/Phi-4-mini-instruct` (3,80 B parametros) en una unica tarea empresarial: completar una funcion de Python de forma que supere los tests unitarios de referencia. No es un modelo base nuevo ni un asistente generalista: es un adaptador de bajo rango que se carga sobre el modelo original mediante `peft.PeftModel` y que asume un formato de prompt concreto (`Complete the following Python function:\n{text}`).

El adaptador forma parte de la tesis de master *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models* (SRH University Hamburg, 2026), cuyo objetivo es comparar modelos pequenos ajustados frente a APIs de proveedores frontera en cinco ejes: exactitud, latencia, coste, exposicion de privacidad y volumen de equilibrio del retorno de la inversion (ROI breakeven). El adaptador se publica explicitamente para que el benchmark pueda verificarse de forma independiente.

Su relevancia es metodologica mas que de capacidad: aporta cifras medibles y reproducibles (pass@1 de 0,4287, latencia media de 2200 ms con batch 1, coste de 9,53 USD por millon de tokens generados sobre una H200) y un harness publico, en un contexto en el que la mayoria de adaptadores publicados en HuggingFace no documentan ni datos de entrenamiento ni evaluacion. La contrapartida es que su alcance es deliberadamente estrecho y sus propios autores advierten de que no debe tratarse como un asistente de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base `microsoft/Phi-4-mini-instruct`); el artefacto publicado es un adaptador LoRA sobre las proyecciones de atencion |
| Parametros totales | 3,80 B en el modelo base; el adaptador LoRA anade un numero de parametros no especificado en la informacion disponible |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible para el adaptador. El entrenamiento uso `max_seq_length` de 512 tokens |
| Tipos de cuantizacion | No disponible; solo se publican pesos del adaptador en safetensors |
| Idiomas soportados | No disponible (los tags del repositorio no declaran idiomas) |
| Licencia | MIT (adaptador). Licencia del modelo base: no confirmada en la informacion disponible. Licencia del dataset de entrenamiento (HumanEval): MIT |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |
| Pipeline | text-generation |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 3,80 B parametros. El ajuste se realiza con LoRA, con rango 16, alpha 32 y dropout 0,05, aplicado a los modulos `q_proj`, `k_proj`, `v_proj` y `o_proj` (es decir, unicamente a las proyecciones de atencion, no a las capas MLP). El dataset es `openai/openai_humaneval` (licencia MIT), con 5.000 ejemplos de entrenamiento y 500 reservados para seleccion de checkpoint. El entrenamiento usa AdamW con learning rate 2e-4, schedule coseno, 3% de warmup, 3 epocas, batch efectivo de 16 (4 x 4 con acumulacion de gradientes), longitud maxima de secuencia de 512 tokens y semilla 42. No se menciona RLHF, DPO ni ninguna fase de alineacion adicional.

La innovacion metodologica relevante no esta en la arquitectura, sino en el diseno experimental: los hiperparametros se mantuvieron constantes en todas las celdas del benchmark (todos los modelos y todas las tareas) en lugar de ajustarse por celda, de modo que las cifras reportadas se presentan como una cota inferior conservadora del rendimiento alcanzable. El adaptador espera en inferencia exactamente el formato de prompt con el que fue entrenado, de modo que alterar la plantilla degrada el resultado de forma no cuantificada.

## Capacidades

- Completado de funciones de Python a partir de una firma y un docstring, con el objetivo de superar tests unitarios de referencia (formato HumanEval).
- Especializacion de tarea unica: no es un asistente conversacional de proposito general, aunque el modelo base subyacente si conserve capacidades conversacionales.
- Generacion de codigo restringida a Python en la practica; no hay evidencia de transferencia a otros lenguajes en la informacion disponible.
- Soporte de tool calling: no disponible / no documentado para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento se limita a una unica pasada de completado con secuencias de 512 tokens.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Carga y composicion mediante `peft`, lo que permite combinarlo con el modelo base sin duplicar los 3,80 B de pesos.

## Casos de uso

- Reproduccion y verificacion del benchmark: el caso de uso declarado por el autor. Cargando el adaptador y el harness de `slm-benchmark` se puede replicar el pass@1 de 0,4287 y contrastarlo con las cifras de APIs comerciales incluidas en la matriz.
- Estimacion de coste de inferencia propia frente a API de pago: el adaptador permite calcular el punto de equilibrio de ROI usando las cifras publicadas (9,53 USD por millon de tokens generados con una H200 a 3,99 USD/GPU-hora) frente al precio por token de un proveedor externo.
- Analisis de exposicion de privacidad: al ejecutarse sobre infraestructura propia, permite cuantificar el ahorro en exposicion de datos frente a enviar prompts y codigo a una API de terceros, que es una de las dimensiones medidas en la tesis.
- Autocompletado de funciones en un pipeline de CI: el adaptador puede generar el cuerpo de una funcion a partir de su firma y docstring para que un runner de tests (pytest) valide o descarte la propuesta antes de abrir un pull request.
- Generacion de candidatos para test-driven development: dado un enunciado de funcion, producir una implementacion inicial que supere los tests existentes y usarla como borrador para revision humana.
- Linea base de investigacion en ajuste eficiente: sirve como referencia LoRA de un solo adaptador con rango 16 sobre proyecciones de atencion para comparar contra variantes con mas modulos objetivo, mas rangos o mas datos.
- Evaluacion de contaminacion de benchmarks: dado que el autor advierte que HumanEval es un corpus publico probablemente presente en el preentrenamiento del modelo base, el adaptador es util como caso de estudio para medir cuanto infla la contaminacion las cifras absolutas.
- Prototipado rapido de un asistente de codigo interno con coste fijo: sobre hardware propio y con el modelo base de 3,80 B, el sistema se puede levantar sin cuotas por token, siempre que el dominio se limite a completado de funciones Python.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| pass@1 | 0,4287 | 164 problemas de HumanEval (todos), evaluacion del 5 de julio de 2026 |
| Latencia media (batch 1) | 2200 ms | NVIDIA H200 (141 GB), batch size 1, utilizacion completa, excluye transito de red |
| Coste por 1M tokens generados | 9,53 USD | GPU imputada a 3,99 USD por GPU-hora |

El autor indica que las puntuaciones no son comparables entre tareas, ya que cada tarea del benchmark usa su propia metrica. La matriz completa esta en `results/benchmark_matrix.csv` y el desglose de coste por peticion en `results/cost_per_request.csv`. No se han publicado en la informacion disponible resultados comparativos celda a celda con los modelos de proveedor frontera que forman parte del estudio.

## Requisitos de hardware

- Medicion oficial: el autor reporta las cifras sobre una unica NVIDIA H200 con 141 GB de VRAM, batch size 1 y utilizacion completa de la GPU.
- VRAM estimada para inferencia: con pesos en fp16, un modelo denso de 3,80 B requiere aproximadamente 7,6 GB solo para pesos; el adaptador LoRA anade una cantidad marginal (rango 16 sobre cuatro proyecciones). A esto hay que sumar la cache KV, que crece con la longitud de secuencia. Cifras estimadas a partir del numero de parametros, no verificadas en la informacion proporcionada.
- GPU de consumo: por tamano, un modelo de 3,80 B en fp16 deberia caber en tarjetas con 12 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090) y con margen en configuraciones de 16 GB o 24 GB. No hay mediciones publicadas de latencia o throughput en hardware de consumo para este adaptador.
- Cuantizacion: el autor no publica versiones cuantizadas (GGUF, AWQ, GPTQ). Para desplegar en hardware limitado habria que fusionar el adaptador con el modelo base y convertir a un formato cuantizado, un proceso no documentado en la ficha.
- Opciones de despliegue: `transformers` + `peft` es la ruta documentada en la model card. vLLM soporta adaptadores LoRA en servicio, y llama.cpp u Ollama requeririan fusionar el adaptador y convertir a GGUF. Ninguna de estas rutas alternativas esta validada por el autor.
- Throughput y latencia: el unico dato disponible es el de la H200 (2200 ms de latencia media con batch 1); no se publican mediciones de throughput agregado ni de latencia en otras GPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye cifras comparativas por celda con otros modelos del benchmark (ni adaptadores equivalentes, ni modelos base sin ajustar, ni APIs de proveedores frontera), mas alla de la referencia a la matriz completa en el repositorio del autor. La unica comparacion declarada es cualitativa: el estudio compara modelos pequenos ajustados contra APIs de proveedores frontera en exactitud, latencia, coste, privacidad y ROI.

## Limitaciones y advertencias

- Entrenamiento con una unica semilla (42): las diferencias reportadas confunden calidad del modelo con varianza de inicializacion.
- Especializado en una tarea sobre un unico corpus publico; no es un asistente de proposito general y no deberia tratarse como tal.
- Los corpus de evaluacion son benchmarks publicos de larga trayectoria y es plausible que esten presentes en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.
- La evaluacion uso 200 instancias reservadas (los 164 problemas de HumanEval para generacion de codigo), de modo que el tamano de efecto detectable esta acotado en torno a diez puntos porcentuales.
- El adaptador espera un formato de prompt exacto (`Complete the following Python function:\n{text}`); desviarse de el no esta caracterizado.
- No hay informacion sobre idiomas soportados, sesgos, tasas de alucinacion ni comportamiento fuera de distribucion.
- No se publican cuantizaciones, por lo que el despliegue en hardware de consumo requiere un proceso adicional no documentado.
- Licencia MIT para el adaptador, lo que permite uso comercial de este artefacto; conviene verificar por separado la licencia del modelo base y la del dataset antes de un despliegue en produccion.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion independiente por parte de la comunidad.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/yusifnuri/phi-4-mini-instruct_code_generation
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Codigo, configuraciones y harness de evaluacion: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa del benchmark: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Analisis de coste por peticion: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/openai_humaneval
- Cita: Nuri, Yusif (2026), *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*, tesis de master, SRH University Hamburg.

# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd5280-lora

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre el modelo base Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parametros desarrollado por Alibaba Qwen. El adaptador lo publica el usuario uygarkurt y su objetivo es especializar un modelo muy pequeno en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. El entrenamiento se realizo con la tecnica de on-policy distillation (OPD) partiendo directamente del modelo instructivo base, usando como profesor congelado Qwen2.5-3B-Instruct.

El problema que aborda es concreto: los modelos pequenos tienden a alucinar llamadas a funciones o a forzar el uso de herramientas aunque no haya ninguna adecuada. El adaptador se entrena sobre el dataset mixto uygarkurt/xlam-tool-calling-mixed para mejorar la precision exacta de las llamadas (xLAM ETC) y la precision en el nombre de funcion (xLAM FNA), a la vez que aprende a rechazar peticiones irrelevantes. Se realizaron 5.280 actualizaciones OPD en 2,2 horas de bucle de entrenamiento.

Es relevante ahora porque demuestra que la destilacion on-policy puede mejorar capacidades de tool calling en modelos de menos de 1B parametros con un coste de computo minimo, lo que lo hace atractivo para despliegues en entornos con recursos muy limitados o en el borde. No obstante, es un adaptador de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,5 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens segun su documentacion oficial, aunque la evaluacion del adaptador se limita a prompts de 640 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion GGUF/AWQ/BnB via herramientas estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar sobre Qwen/Qwen2.5-0.5B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parametros con atencion causal estandar y RoPE. El adaptador es de tipo LoRA (PEFT) y se entrena mediante on-policy distillation: el estudiante genera respuestas y aprende a partir de las probabilidades por token que produce el profesor congelado Qwen2.5-3B-Instruct sobre esas mismas respuestas generadas. Esto difiere de la destilacion offline clasica, ya que la distribucion de entrenamiento sigue la politica actual del estudiante.

El dataset de entrenamiento es uygarkurt/xlam-tool-calling-mixed, centrado en tool calling estructurado y abstención ante herramientas irrelevantes. Se realizaron 5.280 actualizaciones OPD con un tiempo de bucle de 2,2 horas. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas adicionales de RLHF o DPO. El codigo de entrenamiento esta en el repositorio Post-Training Lab del autor.

## Capacidades

- Generacion de texto conversacional en ingles sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: emision de llamadas a funciones en formato estructurado, con mejora medida en xLAM ETC (65,87% frente a 62,61% del base) y xLAM FNA (90,06% frente a 86,57%).
- Abstención ante herramientas irrelevantes: capacidad entrenada explicitamente para no forzar llamadas cuando ninguna herramienta ofrecida es adecuada (subset Irrelevance del benchmark BFCL).
- Razonamiento basico y matematicas elementales heredadas del modelo base (MMLU 41,94%, MATH-500 15,40%), sin mejora apreciable respecto al base.
- Seguimiento de instrucciones a nivel basico (IFEval 27,36% prompt-level strict accuracy).
- Capacidades multilingues limitadas al ingles segun la model card, aunque el modelo base Qwen2.5 tiene cobertura multilingue amplia que el adaptador no ha sido entrenado para preservar.
- No se declara soporte de vision, audio, ni modo thinking explicito.

## Casos de uso

- Enrutamiento de funciones en asistentes conversacionales: el adaptador puede decidir que herramienta invocar en un turno de usuario y abstenerse si ninguna aplica, lo que reduce llamadas erroneas en pipelines de agentes con catalogos de funciones acotados.
- Despliegue en el borde o en dispositivos con poca memoria: al ser un modelo de 0,5B parametros con adaptador LoRA, cabe en GPUs consumer de gama baja y en CPU, permitiendo inferencia local para clasificacion de intenciones y seleccion de herramientas.
- Preprocesado de consultas para sistemas RAG: usar el modelo para decidir si la consulta requiere busqueda externa, llamada a API o respuesta directa, aprovechando la mejora en relevancia (83,33% frente a 77,78% del base).
- Automatizacion de flujos internos con APIs acotadas: integracion en scripts o bots que necesitan mapear lenguaje natural a llamadas JSON sobre un conjunto fijo de endpoints, con bajo coste por inferencia.
- Filtrado de peticiones fuera de dominio: la capacidad de abstención permite descartar solicitudes que no encajan en el catalogo de herramientas antes de invocar sistemas costosos.
- Prototipado rapido de agentes: sirve como componente ligero para experimentar con diseno de herramientas y prompts en entornos de desarrollo sin requerir GPUs de datacenter.
- Evaluacion comparativa de tecnicas de destilacion: util como referencia reproducible para estudiar el efecto de OPD en tool calling frente a fine-tuning supervisado clasico.

## Benchmarks y rendimiento

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Qwen2.5-0.5B-Instruct (base) | — | 42,04% | 15,80% | 26,80% | 62,61% | 86,57% | 50,28% | 77,78% | 66,93% | — |
| OPD (este adaptador) | OPD 5.280 | 41,94% | 15,40% | 27,36% | 65,87% | 90,06% | 55,29% | 83,33% | 58,56% | 2,2 |

Notas de la model card: xLAM ETC es precision exacta de llamada a herramienta; xLAM FNA es precision del nombre de funcion. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 descartados por el limite de prompt de 640 tokens. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a subconjuntos de relevancia seleccionados. IFEval usa prompt-level strict accuracy. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 ocupa aproximadamente 1 GB de pesos; en 8-bit alrededor de 0,5 GB; en 4-bit alrededor de 0,3 GB. El adaptador LoRA anade una fraccion minima (no se publica el numero de parametros del adaptador).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090; tambien cabe en GPUs de datacenter (A100, H100) con uso marginal de memoria.
- Cabe en GPU consumer: si, en practicamente todas las GPUs con al menos 2 GB de VRAM; tambien es viable en CPU.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el base), vLLM (con soporte LoRA), llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF, TGI con adaptadores LoRA.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la latencia por token en GPU consumer deberia ser de unos pocos milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| Este adaptador (Qwen2.5-0.5B-Instruct + LoRA OPD) | 0,5B | 32.768 tokens en el base (evaluado a 640) | Especializado via LoRA, xLAM ETC 65,87% | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 tokens | Generico, xLAM ETC 62,61% | Apache 2.0 (segun modelo base) | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Generico, mayor capacidad que 0,5B | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct (profesor usado en OPD) | 3B | 32.768 tokens | Generico, usado como teacher | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros adaptadores de tool calling en el rango sub-1B en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no hay licencia explicita en la model card, lo que impide confirmar condiciones de uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Modelo de investigacion: cero descargas y cero likes en el momento de la consulta, sin validacion externa de terceros.
- Idioma: entrenado y evaluado solo en ingles; el rendimiento en castellano no esta caracterizado y probablemente degradado.
- Contexto de evaluacion limitado: las pruebas se hicieron con prompts de hasta 640 tokens y 743 ejemplos fueron descartados por exceder ese limite, por lo que el comportamiento con contextos largos no esta validado.
- Regresion en abstención: la puntuacion Irrelevance baja de 66,93% a 58,56%, es decir, el adaptador mejora la relevancia pero empeora ligeramente la deteccion de irrelevancia respecto al base. Conviene calibrar el umbral de abstención antes de usarlo en produccion.
- Razonamiento y matematicas practicamente sin cambios (MMLU 41,94% frente a 42,04%; MATH-500 15,40% frente a 15,80%), por lo que no debe esperarse mejora en tareas cognitivas generales.
- Riesgo de alucinacion: inherente a modelos de 0,5B; el adaptador no lo elimina y puede emitir llamadas con argumentos plausibles pero incorrectos.
- Sesgos: no se documenta ninguna evaluacion de sesgos; hereda los sesgos del modelo base y del dataset xLAM mixto.
- Dependencia del modelo base: requiere cargar Qwen/Qwen2.5-0.5B-Instruct y aplicar el adaptador; no es un modelo autonomo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd5280-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor usado en OPD: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Codigo de entrenamiento (Post-Training Lab): https://github.com/uygarkurt/post-training-lab

# Taeckyung/TISD-Qwen3-14B

## Resumen

TISD-Qwen3-14B es un ajuste fino del modelo Qwen/Qwen3-14B desarrollado por Taeckyung Lee (KAIST, grupo MIIL) mediante una tecnica de auto-destilacion on-policy denominada TISD (Trajectory-Intervention Self-Distillation). El modelo parte de la arquitectura transformer densa de Qwen3-14B, con 14.768.307.200 parametros, y se entrena especificamente para mejorar el razonamiento y la generacion de codigo en tareas de programacion competitiva. El checkpoint publicado corresponde al paso 80 de entrenamiento.

La innovacion no reside en la arquitectura, que es identica al modelo base, sino en el procedimiento de entrenamiento: para cada rollout fallido, TISD localiza la posicion de maxima divergencia entre estudiante y profesor, fuerza el token preferido por el profesor en esa posicion, deja que el estudiante regenere el resto de la respuesta y destila la trayectoria resultante hacia un profesor con contexto privilegiado (hermano exitoso o feedback de ejecucion). El resultado es una mejora sustancial en LiveCodeBench v6 sin cambios en la estructura de pesos.

El modelo es relevante porque demuestra que la auto-destilacion con intervencion de trayectoria puede duplicar aproximadamente la tasa de exito en generacion de codigo con un coste de entrenamiento muy reducido (80 pasos, 32 prompts por lote, 8 rollouts cada uno). Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines existentes de Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), no MoE |
| Parametros totales | 14.768.307.200 (14,77 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-14B, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en bf16) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde el checkpoint FSDP del actor) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-14B: un transformer denso de 14,77 mil millones de parametros. No se introducen modificaciones estructurales; el ajuste consiste exclusivamente en un entrenamiento posterior de auto-destilacion. El entrenamiento se realiza sobre LiveCodeBench v6, cuyo split de entrenamiento expone el 50 % de los tests de cada problema, y utiliza feedback de ejecucion enriquecido.

El procedimiento TISD opera en tres fases por cada rollout fallido: (1) identificar la posicion de maxima divergencia entre las distribuciones del estudiante y del profesor, (2) forzar en esa posicion el token preferido por el profesor y permitir que el estudiante regenere el resto de la respuesta, y (3) destilar la trayectoria resultante hacia el profesor con contexto privilegiado usando el objetivo SDPO. El entrenamiento consta de 80 pasos, con lotes de 32 prompts y 8 rollouts por prompt, tasa de aprendizaje de 1e-6, ejecutado sobre GPUs NVIDIA B200 con verl FSDP. Los pesos finales se fusionan desde el checkpoint del actor en formato bf16.

## Capacidades

- Generacion de codigo para problemas de programacion competitiva, con enfasis en correccion funcional verificada mediante tests ocultos.
- Razonamiento paso a paso orientado a la resolucion de problemas algoritmicos.
- Generacion de texto conversacional y de proposito general heredada del modelo base Qwen3-14B.
- Uso del chat template del modelo base Qwen3-14B.
- Soporte de tool calling y function calling: no confirmado de forma explicita en la informacion proporcionada, aunque heredado potencialmente de Qwen3-14B.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para este checkpoint.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles ni documentados para este checkpoint.

## Casos de uso

- Generacion de soluciones para plataformas de programacion competitiva: el modelo esta entrenado especificamente sobre LiveCodeBench v6 con feedback de ejecucion, por lo que es adecuado para producir soluciones que pasen tests ocultos en problemas de algoritmia y estructuras de datos.
- Asistente de resolucion de problemas en entornos de evaluacion automatizada: su entrenamiento con tests parcialmente expuestos lo hace util para tareas donde se dispone de un subconjunto de casos de prueba y se requiere generalizar al resto.
- Generacion de codigo en pipelines de integracion continua: al estar disponible en safetensors y ser compatible con transformers y text-generation-inference, puede desplegarse como servicio de generacion de parches o funciones que luego se validan con la suite de tests del repositorio.
- Investigacion en metodos de auto-destilacion: el checkpoint sirve como referencia reproducible del procedimiento TISD descrito en el paper, util para comparar con otras tecnicas de RL o destilacion on-policy.
- Fine-tuning posterior sobre dominios de codigo especificos: al compartir arquitectura y tokenizador con Qwen3-14B, puede reutilizarse como punto de partida para ajustes en lenguajes o frameworks concretos.
- Evaluacion comparativa de modelos de codigo: sirve como baseline afinado para medir la brecha entre modelos base y modelos entrenados con feedback de ejecucion en benchmarks tipo LiveCodeBench.
- Generacion de explicaciones y trazas de razonamiento en tareas de depuracion: el modelo puede producir cadenas de razonamiento que acompanan a la solucion propuesta, utiles en herramientas de ensenanza de programacion.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre LiveCodeBench v6 (131 problemas). Avg@4 es la tasa media de tests superados sobre 4 muestras por problema; Pass@4 cuenta un problema como resuelto si alguna de las 4 muestras pasa todos los tests ocultos.

| Modelo | Avg@4 (%) | Pass@4 (%) |
|---|---|---|
| Qwen/Qwen3-14B (base) | 28,6 | 35,1 |
| TISD-Qwen3-14B (paso 80) | 50,8 | 51,1 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere GPUs con 40 GB o mas para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 15-16 GB de pesos, viable en GPUs de 24 GB con contexto limitado.
- VRAM estimada en cuantizacion de 4 bits: en torno a 8-9 GB de pesos, potencialmente viable en GPUs consumer de 12-16 GB, aunque la model card no publica cuantizaciones oficiales.
- GPUs recomendadas: NVIDIA B200 (usada en entrenamiento), A100 80 GB, H100 80 GB para inferencia en bf16 sin cuantizar.
- Cabe en GPU consumer: si se generan cuantizaciones GGUF/AWQ no oficiales; en bf16 no cabe en RTX 4090 (24 GB) sin offloading.
- Opciones de despliegue: transformers (soporte nativo confirmado), text-generation-inference (tag `text-generation-inference` presente), endpoints compatibles; vLLM, llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LiveCodeBench v6 Avg@4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TISD-Qwen3-14B | 14,77 B | no disponible | 50,8 % | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-14B (base) | 14,77 B | no disponible | 28,6 % | Apache 2.0 | Hugging Face |
| Otros modelos de ~14 B afinados para codigo | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa publicada es contra el modelo base Qwen3-14B, sobre el que TISD mejora en 22,2 puntos porcentuales en Avg@4 y 16,0 puntos en Pass@4. No se dispone de datos comparativos con otros modelos de codigo de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint publicado corresponde al paso 80; la model card advierte de que los numeros del paper (Tabla 1) corresponden al mejor paso de validacion promediado sobre varias ejecuciones, por lo que pueden diferir de los de este checkpoint concreto.
- El entrenamiento se limita a LiveCodeBench v6; el rendimiento en otros dominios de codigo o en tareas generales no esta documentado y podria degradarse respecto al modelo base por sobreajuste al benchmark.
- El uso de tests parcialmente expuestos (50 % por problema) durante el entrenamiento puede introducir sesgos hacia el formato y estilo de LiveCodeBench, con riesgo de sobreajuste a ese benchmark.
- Riesgo de alucinacion inherente a los modelos generativos de codigo: soluciones plausibles pero incorrectas que no superan los tests.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen3-14B.
- Idiomas soportados no confirmados en la model card; se asume herencia del modelo base, pero no esta verificado.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado conviene revisar las condiciones del modelo base Qwen3-14B y citar adecuadamente el paper.
- No se han publicado cuantizaciones oficiales; el uso en hardware consumer requiere generar cuantizaciones propias y validar su calidad.
- El modelo no ha sido sometido a evaluaciones de seguridad ni de alineacion documentadas en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Taeckyung/TISD-Qwen3-14B
- Paper (arXiv:2609.30878): https://arxiv.org/abs/2609.30878
- Repositorio de codigo: https://github.com/taeckyung/TISD
- Pagina del proyecto: https://miil.kaist.ac.kr/projects/tisd/
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Dataset de entrenamiento: https://huggingface.co/datasets/livecodebench/code_generation_lite

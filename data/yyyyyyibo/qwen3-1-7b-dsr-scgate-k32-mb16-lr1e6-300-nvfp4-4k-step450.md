# YYYYYYibo/qwen3-1.7b-dsr-scgate-k32-mb16-lr1e6-300-nvfp4-4k-step450

## Resumen

qwen3-1.7b-dsr-scgate-k32-mb16-lr1e6-300-nvfp4-4k-step450 es un checkpoint de investigación publicado por el usuario YYYYYYibo en Hugging Face. Se trata de un ajuste fino mediante aprendizaje por refuerzo (RL) sobre Qwen3-1.7B-Base, orientado especificamente a razonamiento matematico y entrenado con el framework verl sobre el conjunto de datos DeepScaleR con una ventana de contexto de 4.000 tokens. El nombre del repositorio codifica la practica totalidad de la configuracion del experimento: agrupamiento de 32 muestras por prompt (k32), tamano de microbatch de 16 (mb16), tasa de aprendizaje 1e-6, 300 pasos de entrenamiento y rollouts cuantizados en NVFP4.

El checkpoint corresponde al paso 450 de entrenamiento y se exporta desde el actor FSDP de verl en precision completa (pesos maestros sin estado del optimizador), por lo que los pesos publicados no estan cuantizados aunque durante el entrenamiento se usara vLLM con cuantizacion NVFP4 para generar los rollouts. El metodo de RL empleado se denomina "Score Centering with ratio gate" (scgate), una variante de optimizacion de politica que el autor no documenta en detalle en la model card.

Por su naturaleza, no es un modelo de proposito general ni un lanzamiento de produccion: es un artefacto de investigacion que ilustra una receta concreta de RL para matematicas sobre una base compacta de 1.720 millones de parametros. Su relevancia es acotada al estudio de tecnicas de RL, a la reproducibilidad de experimentos de razonamiento matematico y a la evaluacion de metodos de centrado de scores con compuerta de ratio. No hay informacion publicada sobre licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajustado con RL |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.000 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | NVFP4 durante rollouts de entrenamiento; pesos publicados en precision completa (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only de 1.720 millones de parametros. Sobre esa base se aplica un ajuste fino con aprendizaje por refuerzo usando verl, el framework de RL distribuido para modelos de lenguaje. El entrenamiento se realiza sobre DeepScaleR, un conjunto de problemas matematicos de razonamiento, con contexto fijado en 4.000 tokens y 300 pasos de entrenamiento segun indica el nombre del run. La generacion de rollouts durante el entrenamiento se hizo con vLLM empleando cuantizacion NVFP4, lo que reduce el coste de inferencia en la fase de muestreo sin afectar a los pesos finales publicados.

El metodo de optimizacion se denomina "Score Centering with ratio gate" (scgate). La model card no detalla la formulacion matematica ni los hiperparametros internos, pero el nombre sugiere un esquema de centrado de las puntuaciones de recompensa combinado con una compuerta sobre el ratio de importancia de la politica, un patron habitual en variantes estabilizadas de optimizacion de politica proximal. El checkpoint se exporta desde el actor FSDP de verl conservando los pesos maestros en precision completa y descartando el estado del optimizador, lo que explica el tamano del repositorio (3,5 GB) frente a los aproximadamente 3,4 GB que ocuparian los pesos en bf16.

## Capacidades

- Generacion de texto conversacional, heredada de la base Qwen3-1.7B.
- Razonamiento matematico: el ajuste RL esta orientado especificamente a resolver problemas matematicos, con entrenamiento sobre DeepScaleR.
- Razonamiento multi-paso en el dominio matematico, favorecido por el entrenamiento con RL sobre cadenas de razonamiento.
- Integracion con transformers y text-generation-inference segun los tags del repositorio.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en RL para matematicas: el checkpoint sirve como referencia reproducible de la receta scgate sobre Qwen3-1.7B con DeepScaleR, permitiendo comparar curvas de aprendizaje y estabilidad frente a otras variantes de optimizacion de politica.
- Evaluacion de metodos de centrado de scores: util para estudiar empiricamente como afecta el "Score Centering with ratio gate" a la varianza del gradiente y a la calidad de las soluciones matematicas en modelos pequenos.
- Reproduccion de experimentos con verl: al proceder de un actor FSDP exportado, encaja en flujos de trabajo que reanudan o comparan entrenamientos con la misma configuracion de rollouts cuantizados en NVFP4.
- Generacion de soluciones matematicas paso a paso: con 4.000 tokens de contexto puede albergar enunciados y cadenas de razonamiento de complejidad media, adecuado para tareas de tipo competicion o problemas de nivel escolar avanzado.
- Destilacion o generacion de datos sinteticos: sus salidas de razonamiento matematico pueden emplearse para construir conjuntos de datos de entrenamiento o para comparar con las de otros checkpoints de la misma familia.
- Prototipado en entornos con recursos limitados: con 1.720 millones de parametros y pesos en safetensors, cabe en una unica GPU consumer para experimentacion, lo que facilita pruebas rapidas de prompts y de formatos de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos de 4.000 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,8-2,5 GB; en 4 bits, alrededor de 1-1,5 GB.
- GPU recomendadas para servicio: A100, H100 o L40S para despliegues con concurrencia; RTX 4090, RTX 3090 o incluso GPUs con 8 GB para inferencia individual.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), vLLM (usado en los rollouts de entrenamiento con NVFP4), llama.cpp u Ollama si se generan pesos GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-dsr-scgate-k32-mb16-lr1e6-300-nvfp4-4k-step450 | 1,72 B | 4.000 tokens | RL para matematicas (scgate, DeepScaleR) | no disponible | Hugging Face |
| Qwen3-1.7B-Base | 1,72 B | no disponible en esta ficha | Base preentrenada de proposito general | no disponible en esta ficha | Hugging Face |
| DeepScaleR-1.5B-Preview | 1,5 B | 32.768 tokens | RL para matematicas (GRPO, DeepScaleR) | MIT (segun su model card publica) | Hugging Face |

La comparativa se limita a la familia base y a la linea DeepScaleR, que comparten dominio y orden de magnitud de parametros. No se dispone de datos de rendimiento del checkpoint para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Checkpoint de investigacion: corresponde al paso 450 de un run concreto y no ha pasado por un proceso de publicacion o validacion de calidad; no debe tratarse como un modelo listo para produccion.
- Licencia no disponible: al no declararse licencia, no se puede asumir permiso para uso comercial ni redistribucion; conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- Idiomas no declarados: se desconoce la cobertura multilingue efectiva y el comportamiento fuera del ingles o del castellano.
- Especializacion estrecha: el ajuste RL se centra en matematicas y puede degradar capacidades generales o conversacionales respecto a la base Qwen3-1.7B.
- Contexto limitado a 4.000 tokens: insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinacion: como cualquier modelo de 1,7 B ajustado con RL, puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente en problemas fuera de la distribucion de DeepScaleR.
- Sesgos: no hay informacion sobre evaluaciones de sesgo; los sesgos de la base Qwen3-1.7B se heredan sin mitigacion documentada.
- Metodo scgate no documentado: la ausencia de detalle sobre la formulacion impide evaluar su estabilidad fuera de la configuracion exacta del run.
- Pesos en precision completa: el repositorio ocupa 3,5 GB y no incluye versiones cuantizadas listas para usar; habra que generarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YYYYYYibo/qwen3-1.7b-dsr-scgate-k32-mb16-lr1e6-300-nvfp4-4k-step450
- Framework verl: https://github.com/volcengine/verl
- Conjunto de datos DeepScaleR (referencia del autor, sin enlace directo en la model card): no disponible
- Paper o blog del metodo scgate: no disponible
- Repositorio de codigo del autor: no disponible
- Demo o espacio asociado: no disponible

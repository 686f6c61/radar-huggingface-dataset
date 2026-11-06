# Stellar-lab/Stellar-Qwen3-8B-ARM

## Resumen

Stellar-Qwen3-8B-ARM es un modelo de recompensa basado en atributos (Attribute-based Reward Model, ARM) construido sobre la arquitectura de Qwen3-8B. Lo desarrolla Stellar-lab y su funcion es evaluar respuestas generadas por modelos de lenguaje a lo largo de multiples dimensiones de calidad y sintetizar esas evaluaciones en una senal de preferencia utilizable en flujos de alineamiento, RLHF y ranking de respuestas. Frente a los reward models escalares clasicos, que colapsan preferencias complejas en una unica puntuacion opaca, este modelo evalua internamente varias dimensiones antes de emitir el juicio final.

El modelo parte de los 7.575.787.059 parametros del checkpoint base Qwen/Qwen3-8B y se ha afinado mediante QLoRA de 4 bits sobre 7.500 pares de preferencia curados. La salida se expone como clasificacion de texto (pipeline `text-classification`) y requiere codigo personalizado (`trust_remote_code`) para su carga. El repositorio ocupa 15,2 GB y se distribuye bajo licencia Apache 2.0.

Es relevante porque ofrece una alternativa open source a los reward models propietarios para pipelines de RLHF y DPO, con un tamano (8B) que permite desplegarlo en una sola GPU de gama alta. La contrapartida es la opacidad: el autor declara explicitamente que los mecanismos internos de ejecucion y las rubricas de evaluacion son privados, lo que limita la auditabilidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con cabeza de clasificacion/reward, adaptada mediante QLoRA |
| Parametros totales | 7.575.787.059 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits NF4 con doble cuantizacion (bitsandbytes); pesos base en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador QLoRA sobre Qwen/Qwen3-8B) |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen3-8B, un transformer decoder-only de 8B parametros, y anade una cabeza de clasificacion para producir la senal de recompensa. El ajuste se realizo con QLoRA de 4 bits (adaptadores de bajo rango sobre el modelo base cuantizado en NF4 con doble cuantizacion), lo que reduce el coste de entrenamiento y de inferencia respecto a un fine-tuning completo. El checkpoint se distribuye como adaptador PEFT que debe combinarse con el modelo base Qwen/Qwen3-8B en tiempo de carga.

El entrenamiento utilizo 7.500 pares de preferencia curados. El autor no especifica la composicion del dataset, el numero de tokens procesados ni si se aplicaron etapas de RLHF o DPO adicionales. La innovacion declarada es el enfoque "basado en atributos": el modelo evalua internamente varias dimensiones de calidad y alineamiento antes de sintetizar una puntuacion final, en lugar de emitir un escalar directo. Sin embargo, las rubricas concretas y los mecanismos de ejecucion interna no se publican. No se documentan tecnicas como decodificacion especulativa ni attention lineal.

## Capacidades

- Evaluacion de respuestas generadas por modelos de lenguaje y emision de una senal de preferencia (reward) para ranking.
- Puntuacion multidimensional interna segun dimensiones de calidad y alineamiento (rubricas no publicadas).
- Best-of-N sampling: seleccion de la mejor respuesta entre N candidatas generadas por un LLM.
- Filtrado de datos para RLHF y DPO a partir de los pares puntuados.
- Clasificacion de texto (pipeline `text-classification`) sobre pares prompt-respuesta.
- Soporte de carga en 4 bits con `transformers`, `peft` y `bitsandbytes` para reducir requisitos de memoria.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan tool calling, function calling, capacidades de agente, vision ni audio.

## Casos de uso

- Best-of-N sampling en produccion: generar N respuestas con un LLM y usar Stellar-Qwen3-8B-ARM para puntuarlas y seleccionar la mejor antes de devolverla al usuario; el coste de una pasada de 8B en 4 bits es asumible frente a la mejora de calidad.
- Filtrado de datasets para RLHF/DPO: puntuar pares de respuestas recopilados y descartar los de baja calidad antes de entrenar un modelo de politica, reduciendo ruido en el dataset de preferencias.
- Ranking de respuestas en sistemas de evaluacion: ordenar candidatas de varios modelos para construir leaderboards internos o comparar versiones de un mismo modelo.
- Validacion de salidas en pipelines de generacion aumentada: usar la puntuacion de recompensa como filtro de seguridad o calidad antes de publicar contenido generado.
- Investigacion en alineamiento: estudiar el comportamiento de reward models basados en atributos frente a reward models escalares en experimentos controlados de RLHF.
- Anotacion asistida: pre-puntuar respuestas para priorizar la revision humana en flujos de anotacion, reduciendo el coste de etiquetado manual.
- Ajuste de modelos pequenos: servir como reward model en pipelines de RLHF con modelos de politica de menor tamano donde no es viable desplegar un reward model de 70B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica que el modelo ha pasado pruebas internas en escenarios diversos de evaluacion de preferencias, sin cifras publicas.

## Requisitos de hardware

- VRAM estimada en 4 bits (NF4): aproximadamente 5-6 GB para los pesos del modelo base mas overhead de activaciones y contexto; en bf16 completo, unos 15-16 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en bf16; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 e incluso en GPUs de 8-12 GB con cuantizacion 4 bits y contextos moderados.
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` (ruta documentada por el autor); vLLM y TGI no estan confirmados para este checkpoint con cabeza de clasificacion personalizada; llama.cpp/Ollama requeririan conversion a GGUF no documentada.
- Latencia y throughput: no disponibles. Al ser un modelo de 8B en 4 bits, se espera un throughput de decenas de peticiones por segundo en A100, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stellar-Qwen3-8B-ARM | 7,58B | no disponible | Reward model (ARM) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | 8B | no disponible | LLM generativo | Apache 2.0 | Hugging Face |
| Reward models escalares de 7-8B (p. ej. variantes sobre Llama/Mistral) | ~7-8B | variable | Reward model escalar | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo publicados para Stellar-Qwen3-8B-ARM frente a alternativas, por lo que la comparacion se limita a parametros, licencia y tipo de tarea.

## Limitaciones y advertencias

- Opacidad del diseno: las rubricas de evaluacion y los mecanismos internos son propietarios y no se publican, lo que impide auditar por que el modelo asigna una puntuacion.
- Dataset pequeno: 7.500 pares de preferencia es un volumen reducido; el autor advierte que las evaluaciones en dominios especializados o fuera de distribucion deben validarse antes de produccion.
- Solo ingles: la model card declara unicamente `en`; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de sesgo: al entrenarse sobre preferencias curadas, puede heredar sesgos de los anotadores y del dataset, no documentados.
- Riesgo de recompensa hackeada (reward hacking): como todo reward model, puede ser explotado por politicas que optimicen la puntuacion sin mejorar la calidad real.
- Dependencia del modelo base: requiere cargar Qwen/Qwen3-8B junto con el adaptador, y el codigo de carga usa `trust_remote_code`, lo que implica ejecutar codigo del repositorio.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el integrador.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Stellar-lab/Stellar-Qwen3-8B-ARM
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.

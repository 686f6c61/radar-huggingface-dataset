# SZLHOLDINGS/freeenergy-r1-v2-trained

## Resumen

freeenergy-r1-v2-trained es un adaptador LoRA (QLoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo independiente, sino de un ajuste fino de 200 pasos orientado a medir y modificar el comportamiento de abstención y "honestidad temporal" del modelo base. El autor lo presenta como parte de un "estate" de experimentos con trazabilidad pública mediante una cadena de recibos con hash encadenado.

El modelo es relevante no por su rendimiento generalista, sino por su propuesta metodológica: el autor sostiene la "Confabulation Conjecture", según la cual el umbral de confabulación solo se desplaza con entrenamiento en honestidad enmarcado temporalmente y a escalas pequeñas. El adaptador obtiene una puntuación de 3/6 en la "honesty battery" del autor, por debajo del umbral de agente (4/6), lo que el propio autor interpreta como evidencia de que el mecanismo es frágil.

Se distribuye como adaptador PEFT en safetensors con licencia Apache 2.0, con un tamaño de repositorio de 0.0 GB (adaptador de pequeño tamaño). No declara idiomas soportados ni dispone de descargas o interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); adaptador LoRA QLoRA (r=16, alpha=32) |
| Parametros totales | 1.7B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la del modelo base Qwen3-1.7B no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (entrenado con QLoRA, lo que implica cuantizacion durante el entrenamiento; formatos de inferencia no declarados) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA con rango r=16 y alpha=32 sobre el modelo base Qwen/Qwen3-1.7B, un transformer decoder-only de 1.7B parametros. El entrenamiento consta de 200 pasos sobre el dataset SZLHOLDINGS/free-energy-reasoning-sft-v1, ejecutado en una NVIDIA RTX A6000 de 48 GB con driver 595.99.02. No se especifican el numero total de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion declarada no es arquitectonica sino metodologica: el autor afirma que el "suelo de confabulacion" solo se desplaza mediante entrenamiento en honestidad con enmarque temporal y a escalas pequenas, y describe el mecanismo como fragil ("right base model + right size + right training dose"). El modelo se integra en un sistema de recibos con hash encadenado (mas de 255 recibos) que registra cada ejecucion de entrenamiento y evaluacion.

## Capacidades

- Generacion de texto conversacional y de razonamiento, heredadas del modelo base Qwen3-1.7B.
- Comportamiento de abstencion y honestidad temporal: el adaptador esta entrenado especificamente para modular cuando el modelo se abstiene de responder.
- Evaluacion mediante una "honesty battery" de 6 sondas fijas, con resultado declarado de 3/6.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el propio autor situa el umbral de agente en 4/6, por encima del resultado obtenido.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre gobernanza de IA y medicion de honestidad: el adaptador sirve como punto de comparacion en experimentos que evaluan si el entrenamiento en honestidad con enmarque temporal altera la tasa de abstención frente al modelo base.
- Evaluacion de comportamiento de abstención: util para construir baterias de pruebas que midan cuando un modelo declina responder en lugar de confabular, usando las 6 sondas del autor como referencia inicial.
- Reproducibilidad de experimentos: el sistema de recibos con hash encadenado permite auditar cada ejecucion de entrenamiento y evaluacion, lo que facilita la replicacion por terceros.
- Estudio de adaptadores de bajo rango: con solo 200 pasos y QLoRA r=16, sirve como caso de estudio de cuanto puede modificarse el comportamiento de un modelo de 1.7B con un presupuesto de entrenamiento minimo.
- Docencia y formacion: ejemplo practico de pipeline PEFT completo (carga del base, aplicacion del adaptador, evaluacion) para cursos de ajuste fino.
- Prototipado de sistemas de trazabilidad: el SDK szl y la cadena de recibos pueden reutilizarse como infraestructura de registro en proyectos de investigacion que requieran evidencia auditable.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Verificado |
|---|---|---|---|
| honesty-battery (6 sondas) | honesty-battery | 3/6 | No |

El autor situa el umbral de agente en 4/6 y presenta el resultado como evidencia de que el mecanismo de desplazamiento del suelo de confabulacion es fragil. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.7B en bfloat16 requiere aproximadamente 3.4 GB solo para pesos; con overhead de activaciones y cache KV, entre 4 y 6 GB en funcion de la longitud de contexto. El adaptador anade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el modelo base en precision completa; el entrenamiento se realizo en una NVIDIA RTX A6000 de 48 GB.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090. En cuantizacion de 4 bits puede ejecutarse en GPUs de 6-8 GB.
- Opciones de despliegue: transformers con PEFT (metodo documentado en la model card); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| freeenergy-r1-v2-trained | 1.7B (base) + adaptador LoRA | No disponible | honesty-battery 3/6 (no verificado) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B (base) | 1.7B | No disponible en la informacion proporcionada | No disponible | Apache 2.0 | Hugging Face |
| Adaptadores PEFT genericos sobre Qwen3-1.7B | 1.7B (base) + adaptador | Depende del base | No disponible | Variable | Hugging Face |

La comparativa con alternativas de la misma categoria es limitada: no se dispone de datos de rendimiento del modelo base ni de otros adaptadores en la informacion proporcionada.

## Limitaciones y advertencias

- La evaluacion se basa en 6 sondas fijas, que el propio autor reconoce como no exhaustivas.
- Es un adaptador LoRA, no un modelo independiente: requiere cargar Qwen/Qwen3-1.7B y aplicar el adaptador con PEFT.
- El contraste curricular se apoya en un unico punto de datos, segun el autor.
- El resultado de 3/6 no esta verificado (verified: false) y queda por debajo del umbral de agente de 4/6 fijado por el propio autor.
- Uso fuera de alcance declarado: despliegue en produccion sin verificacion de compuertas, aplicaciones de seguridad critica y validacion biologica (ninguna reclamada).
- Riesgo de alucinacion: inherente al modelo base; el adaptador pretende modular la abstención pero no elimina el riesgo.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explicitamente el despliegue en produccion sin verificacion adicional.
- Modelo con 0 descargas y 0 interacciones: no hay evidencia de uso independiente ni validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/freeenergy-r1-v2-trained
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/free-energy-reasoning-sft-v1
- Cadena de recibos (frontier-54-runs): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Explorador de la cadena: https://szlholdings-szl-receipts-chain.hf.space
- SDK szl en PyPI: https://pypi.org/project/szl/
- Sitio del autor: https://a-11-oy.com

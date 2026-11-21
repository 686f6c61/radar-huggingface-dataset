# trymirai/Qwen3.8-27B-L

## Resumen

Mirai's Qwen3.8-27B Large Quantization (identificador `trymirai/Qwen3.8-27B-L`) es una versión cuantizada a 8 bits del modelo base Qwen/Qwen3.8-27B, desarrollada por Mirai Labs. El checkpoint está preparado específicamente para inferencia local eficiente en hardware Apple silicon, mediante la librería propietaria `uzu` y una CLI distribuida vía Homebrew. El modelo conserva los 27.322.284.032 parámetros del modelo original (27,3 mil millones, aproximadamente), pero reduce el peso a 8 bits simétricos con escalas bfloat16.

El objetivo del checkpoint es situarse en la frontera de Pareto entre tamaño y divergencia KL: según el autor, no existe un checkpoint de menor tamaño que además presente menor divergencia KL. La evaluación se realizó sobre una mezcla de datos compuesta por un 45 % de datos agentivos públicos, un 30 % de SFT/contexto largo públicos y un 25 % de datos privados de chat. El modelo se distribuye bajo licencia Apache 2.0, la misma que el modelo base Qwen3.8-27B.

La relevancia de este checkpoint radica en que permite ejecutar un modelo de 27B parámetros en equipos con memoria unificada de Apple silicon, manteniendo una calidad próxima al original. La contrapartida es que el soporte de inferencia está limitado, por ahora, a macOS sobre Apple silicon, lo que restringe su uso en servidores Linux con GPU NVIDIA, entornos habituales de despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Qwen/Qwen3.8-27B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 27.322.284.032 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8-bit simetrico con escalas bfloat16 y tamano de grupo 64; transformadas Hadamard aleatorias block-diagonal de tamano de bloque 32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento (PTQ) del modelo base Qwen/Qwen3.8-27B. No se modifican los pesos originales mediante reentrenamiento ni destilacion: se aplica cuantizacion entera simetrica de 8 bits con escalas en bfloat16 y agrupacion de 64 elementos. Para mitigar los valores atipicos (outliers) tanto en activaciones como en pesos, se aplican transformadas de Hadamard aleatorias block-diagonal con tamano de bloque 32, una tecnica habitual para reducir la divergencia introducida por la cuantizacion en modelos transformer.

La arquitectura subyacente, los datos de entrenamiento del modelo original, el numero de tokens, la posible composicion del dataset y el uso de RLHF/DPO no se detallan en la informacion proporcionada; la model card remite expresamente a la model card de Qwen/Qwen3.8-27B para esos detalles. La evaluacion de la cuantizacion se realizo sobre una mezcla de datos de 45 % agentivos publicos, 30 % SFT/contexto largo publicos y 25 % chat privado, midiendo la divergencia KL respecto al checkpoint original. El autor indica que el checkpoint es comparable, en tier de tamano y cuantizacion, al GGUF `UD-Q8_K_XL` de Unsloth para el mismo modelo base.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, heredando las capacidades del modelo base Qwen3.8-27B.
- Razonamiento, codigo y matematicas: no se documentan explicitamente en la informacion proporcionada; deben consultarse en la model card del modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: la evaluacion de la cuantizacion incluye un 45 % de datos agentivos publicos, lo que sugiere que el modelo base esta orientado a tareas agentivas, aunque no se detallan capacidades concretas.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Inferencia local en Apple silicon mediante la CLI `mirai` y la libreria `uzu`.

## Casos de uso

- Inferencia local en portatiles y equipos de sobremesa con Apple silicon: el checkpoint esta disenado para ejecutarse con `mirai --model trymirai/Qwen3.8-27B-L` en macOS, aprovechando la memoria unificada de los chips de Apple para alojar un modelo de 27B parametros cuantizado a 8 bits.
- Prototipado de agentes en local: dado que la mezcla de evaluacion incluye un 45 % de datos agentivos, el checkpoint puede emplearse para probar flujos de agente multi-paso sin depender de infraestructura en la nube, siempre que se valide su comportamiento real en la tarea concreta.
- Desarrollo y evaluacion de aplicaciones de chat: con un 25 % de datos privados de chat en la mezcla de evaluacion, el checkpoint es adecuado para experimentar con asistentes conversacionales en entornos de desarrollo locales.
- Investigacion sobre cuantizacion: el checkpoint y su grafico de divergencia KL frente a tamano permiten estudiar el compromiso entre tamano y calidad en cuantizacion de 8 bits con transformadas Hadamard, comparandolo con alternativas como GGUF Q8_K_XL.
- Pruebas de regresion de calidad frente al modelo original: al ser una cuantizacion PTQ, permite comparar salidas del checkpoint cuantizado con las del modelo Qwen3.8-27B original en tareas de contexto largo y agentivas.
- Despliegue en entornos sin GPU NVIDIA: para equipos Apple silicon donde no se dispone de aceleradores CUDA, este checkpoint ofrece una via de ejecucion de un modelo de 27B parametros que de otro modo requeriria hardware dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente presenta una comparacion de divergencia KL frente al tamano del checkpoint (grafico `kl-vs-size.svg`) y afirma que el checkpoint se situa en la frontera de Pareto tamano-KL, sin cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 147,5 GB, pero el checkpoint a 8 bits de 27,3 mil millones de parametros requiere aproximadamente 27 GB solo para los pesos (8 bits por parametro), mas overhead de escalas, cache KV y runtime; la cifra exacta no esta disponible en la informacion proporcionada.
- GPU recomendadas: no se especifican; el soporte declarado es exclusivamente Apple silicon (macOS).
- Compatibilidad con GPU de consumo: no disponible para NVIDIA/AMD; la unica via documentada es Apple silicon mediante la CLI `mirai`.
- Opciones de despliegue: CLI `mirai` instalada via Homebrew (`brew install mirai`), libreria `uzu`; compilacion desde codigo fuente segun la guia del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trymirai/Qwen3.8-27B-L | 27.322.284.032 | no disponible | 8-bit (uzu, safetensors) | Apache 2.0 | Apple silicon (CLI `mirai`) |
| Qwen/Qwen3.8-27B (modelo base) | 27.322.284.032 (segun checkpoint derivado) | no disponible | pesos originales | Apache 2.0 | no disponible en la informacion proporcionada |
| unsloth/Qwen3.8-27B UD-Q8_K_XL (GGUF) | mismo modelo base | no disponible | GGUF Q8_K_XL | Apache 2.0 (heredada) | GGUF, ecosistema llama.cpp (segun referencia del autor) |

El autor declara que, en tier de cuantizacion y tamano, este checkpoint es comparable al GGUF `UD-Q8_K_XL` de Unsloth para el mismo modelo base. No se proporcionan datos de rendimiento comparativo mas alla de la posicion en la frontera tamano-KL.

## Limitaciones y advertencias

- Soporte de plataforma limitado: la inferencia solo esta disponible, por ahora, en Apple silicon mediante la CLI `mirai`; no hay soporte documentado para Linux, CUDA, vLLM, llama.cpp, Ollama o TGI.
- Dependencia de una libreria propietaria: la ejecucion requiere la libreria `uzu` y la CLI `mirai`, lo que introduce dependencia de un proveedor concreto y limita la portabilidad.
- Perdida de calidad por cuantizacion: al ser una cuantizacion PTQ a 8 bits, existe una divergencia KL respecto al modelo original; el autor la situa en la frontera de Pareto, pero no publica cifras absolutas de degradacion.
- Sesgos: no documentados en la informacion proporcionada; deben consultarse en la model card del modelo base Qwen3.8-27B.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; es inherente a los modelos de lenguaje y debe evaluarse en la tarea concreta.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y las condiciones de la libreria `uzu` y la CLI `mirai`, que pueden tener terminos distintos.
- Caveat para produccion: al no haber benchmarks publicados ni datos de latencia/throughput, no se recomienda desplegar en produccion sin una evaluacion propia de calidad y rendimiento frente al modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.8-27B-L
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Pagina del producto: https://trymirai.com/local-models/alibaba-qwen3-8-27b-mirai-mirai-l-8
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Guia de ejecucion de uzu: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- GGUF comparable de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF/blob/main/Qwen3.8-27B-UD-Q8_K_XL.gguf

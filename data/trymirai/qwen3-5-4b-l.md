# trymirai/Qwen3.5-4B-L

## Resumen

Mirai's Qwen3.5-4B Large Quantization es una cuantizacion de 8 bits del modelo Qwen/Qwen3.5-4B, desarrollada por trymirai (Mirai Labs) y publicada bajo licencia Apache 2.0. El modelo conserva la arquitectura y el comportamiento del checkpoint original de Alibaba, pero reduce el peso de los parametros a enteros simetricos de 8 bits, lo que permite ejecutarlo en hardware con recursos limitados, en concreto en equipos con Apple silicon.

El modelo resuelve el problema de desplegar un LLM de 4.338.875.392 parametros en local sin renunciar a una calidad cercana a la del modelo en precision completa. Para ello aplica cuantizacion post-entrenamiento con escalas en bfloat16, tamano de grupo 32 y transformadas de Hadamard aleatorias diagonales por bloques (block-diagonal Random Hadamard Transforms) que reducen los valores atipicos en activaciones y pesos.

Su relevancia actual radica en que el ecosistema de inferencia local en Apple silicon carece de alternativas maduras frente a CUDA, y esta ficha se apoya en la libreria `uzu` y la CLI `mirai` para ofrecer una via de ejecucion directa en macOS. El repo ocupa 23,6 GB y acumula 656 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 4.338.875.392 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit simetrica con escalas bfloat16, group size 32, post-training quantization |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento del modelo base Qwen/Qwen3.5-4B. La arquitectura subyacente corresponde al transformer de Qwen3.5-4B, si bien la model card no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni la composicion exacta del dataset de preentrenamiento del modelo original. El proceso de cuantizacion aplica enteros simetricos de 8 bits con escalas en bfloat16 y agrupacion en bloques de 32 elementos.

La innovacion tecnica destacable son las block-diagonal Random Hadamard Transforms con tamano de bloque 32, que rotan las activaciones y los pesos antes de cuantizar para mitigar los valores atipicos que degradan la precision en esquemas de baja profundidad de bits. La model card incluye una grafica de divergencia KL frente al tamano del checkpoint, evaluada sobre una mezcla de datos compuesta por un 45% de datos publicos agenticos, un 30% de datos publicos de SFT y contexto largo, y un 25% de datos privados de chat. No se especifica si el modelo base recibio RLHF o DPO.

## Capacidades

- Generacion de texto: el modelo hereda las capacidades del Qwen3.5-4B original, orientadas a generacion y conversacion.
- Razonamiento y codigo: no se detallan capacidades especificas en la model card; se remite a la documentacion del modelo base.
- Tool calling y function calling: no confirmado en la informacion proporcionada.
- Agentes y razonamiento multi-paso: la mezcla de evaluacion incluye un 45% de datos publicos agenticos, lo que sugiere que el modelo se ha evaluado en escenarios de agente, aunque no se documentan capacidades explicitas.
- Multilingue: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Inferencia local en Mac: ejecutar el modelo en un Mac con Apple silicon mediante `brew install mirai` y `mirai --model trymirai/Qwen3.5-4B-L`, sin necesidad de GPU dedicada ni de servicios en la nube.
- Prototipado offline de asistentes conversacionales: usar el checkpoint para iterar sobre prompts y flujos de chat en local, con la ventaja de no enviar datos a terceros.
- Evaluacion de cuantizacion: servir como referencia practica para comparar la calidad de la cuantizacion de 8 bits frente al Qwen3.5-4B original en tareas de generacion y agenticas.
- Desarrollo de aplicaciones macOS: integrar la CLI `mirai` o la libreria `uzu` en herramientas de escritorio que requieran generacion de texto sin conexion.
- Investigacion sobre tecnicas de cuantizacion: el uso de Random Hadamard Transforms con group size 32 es un caso de estudio reproducible para analizar el impacto de las rotaciones en la divergencia KL.
- Despliegue de bajo coste en entornos controlados: al ser Apache 2.0 y ejecutarse en hardware de consumo, es apto para pruebas internas y demos sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una grafica de divergencia KL frente al tamano del checkpoint, sin cifras numericas ni comparaciones con MMLU, HumanEval, GSM8K u otros conjuntos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 4.338.875.392 parametros en 8 bits, el peso de los parametros ronda los 4,3 GB, a lo que hay que sumar escalas bfloat16, overhead de la libreria y cache de contexto.
- GPU recomendadas: la model card indica soporte exclusivo para Apple silicon; no se mencionan GPU NVIDIA ni AMD.
- Compatibilidad con GPU de consumo: el soporte documentado se limita a Apple silicon; no se confirma funcionamiento en RTX 4090 ni en otras GPU de consumo.
- Opciones de despliegue: CLI `mirai` (Homebrew) y libreria `uzu`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-4B-L | 4.338.875.392 | no disponible | 8-bit (group size 32) | Apache 2.0 | Apple silicon (`uzu`) |
| Qwen/Qwen3.5-4B (base) | 4.338.875.392 | no disponible | bfloat16 | Apache 2.0 | Multiples (segun model card original) |
| Alternativas de 4B en 8-bit | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada; la comparacion se limita al checkpoint original del que deriva.

## Limitaciones y advertencias

- La cuantizacion de 8 bits introduce una perdida de calidad respecto al modelo en bfloat16; la magnitud exacta no se cuantifica en la model card.
- Sesgos conocidos: no documentados en la informacion proporcionada; se remite a la model card del Qwen3.5-4B original.
- Riesgo de alucinacion: inherente a los LLM; no se aportan tasas ni evaluaciones especificas.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada en la model card.
- Caveat de produccion: el soporte se limita a Apple silicon; no hay evidencia de funcionamiento en CUDA ni en otros backends, lo que restringe su uso en servidores convencionales.
- El repo ocupa 23,6 GB, un tamano considerable para un modelo de 4B cuantizado a 8 bits, lo que puede dificultar su distribucion en entornos con almacenamiento limitado.

## Enlaces

- Hugging Face: https://huggingface.co/trymirai/Qwen3.5-4B-L
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Model card del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/README.md
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Pagina del modelo en Mirai: https://trymirai.com/local-models/alibaba-qwen3-5-4b-mirai-mirai-l-8
- Blog de cuantizacion: https://trymirai.com/blog/quantization
- Repositorio uzu (guia de ejecucion): https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md

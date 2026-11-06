# vllm-project/Qwen3-4B-Instruct-2507-GPTQ-Int4

## Resumen

Qwen3-4B-Instruct-2507-GPTQ-Int4 es una version cuantizada del modelo Qwen3-4B-Instruct-2507 desarrollado originalmente por Alibaba Qwen. Esta variante concreta ha sido producida por el usuario superjob mediante `llmcompressor` con el metodo GPTQ en formato W4A16 (pesos de 4 bits, activaciones de 16 bits), y el repositorio de Hugging Face lo mantiene el proyecto vLLM como copia de seguridad para sus pruebas de integracion continua. Se trata, por tanto, de un checkpoint de infraestructura, no de un modelo nuevo.

El modelo base es un transformer denso de 4.411.424.256 parametros (aproximadamente 4,4 mil millones) orientado a generacion de texto conversacional, con soporte declarado de hasta 104 idiomas, incluidos los de la Comunidad de Estados Independientes. La cuantizacion a 4 bits reduce el peso del repositorio a unos 3,4 GB, lo que lo hace atractivo para despliegues en GPU de gama media y para servir multiples instancias en hardware limitado.

Su relevancia actual es practica: ofrece una ruta de despliegue lista para produccion en vLLM mediante el formato `compressed-tensors`, con licencia Apache 2.0 y sin necesidad de conversion adicional. Es un punto de partida util para quien necesite un modelo multilingue de ~4B con huella de memoria reducida, aunque conviene tener presente que la model card original es minima y no documenta benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4.411.424.256 (4,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GPTQ W4A16 (pesos INT4, activaciones FP16/BF16), group size 128, act order static |
| Idiomas soportados | Declarados en la model card: 104 idiomas (incluidos los de la CEI); etiquetas del repo: en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con `compressed-tensors` (compatible nativamente con vLLM) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint Qwen/Qwen3-4B-Instruct-2507, que pertenece a la familia Qwen3 de Alibaba. La arquitectura del modelo base es un transformer denso de aproximadamente 4,4 mil millones de parametros; la informacion proporcionada no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original.

La aportacion tecnica de este repositorio es exclusivamente la cuantizacion. Se aplico GPTQ con `llmcompressor` en configuracion W4A16, con tamano de grupo 128 y orden de activacion estatico, y se serializo en el formato `compressed-tensors` que vLLM reconoce de forma nativa. Esto evita pasos de conversion y permite cargar el modelo con el flag `--quantization compressed-tensors` y `--dtype bfloat16`. Al ser una copia de un checkpoint de terceros (superjob), no hay entrenamiento adicional ni ajuste fino por parte de vllm-project.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a instrucciones (variante Instruct).
- Razonamiento y respuesta a preguntas en formato chat.
- Generacion de codigo y matematicas: capacidad esperable en la familia Qwen3, aunque no se documenta de forma especifica en la informacion disponible.
- Soporte multilingue declarado de hasta 104 idiomas, con enfasis en ingles, ruso y lenguas de la CEI.
- Compatibilidad con tool calling y function calling: no confirmado explicitamente en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada (la variante 2507 de Qwen3 suele separar modos, pero no se detalla aqui).
- Vision y audio: no soportados segun la informacion disponible (pipeline text-generation).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en ingles y ruso con una huella de memoria de ~3,4 GB, lo que permite desplegar varias instancias en una sola GPU para atender picos de trafico.
- Asistente interno multilingue: con soporte declarado de 104 idiomas, es adecuado para helpdesk corporativo en organizaciones con presencia en paises de la CEI, traduciendo y respondiendo en el idioma del usuario.
- Generacion de codigo en pipelines de CI/CD: al integrarse en vLLM con la API compatible con OpenAI, puede conectarse a herramientas de revision automatica o generacion de tests, siempre que se valide su calidad en codigo con benchmarks propios.
- Prototipado rapido de aplicaciones LLM: su tamano compacto y su licencia Apache 2.0 permiten experimentar en entornos de desarrollo con una sola GPU consumer antes de escalar a modelos mayores.
- Servicio de resumen y extraccion de informacion: util para procesar documentacion en lote con throughput alto gracias a la reduccion de memoria de la cuantizacion, aunque el contexto maximo debe confirmarse.
- Despliegue en entornos con restricciones de VRAM: al caber en GPUs de 8-12 GB, sirve para edge computing o estaciones de trabajo sin aceleradores de datacenter.
- Evaluacion comparativa de tecnicas de cuantizacion: como checkpoint de referencia mantenido por vLLM, es util para medir el impacto de GPTQ W4A16 frente al modelo en BF16 en tareas de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base sin cuantizar, por lo que no es posible cuantificar la perdida de calidad introducida por la cuantizacion GPTQ a 4 bits.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4,5 GB para los pesos en INT4, mas overhead de KV cache y activaciones; en la practica, un despliegue en vLLM con contexto moderado suele requerir entre 6 y 10 GB segun la longitud de contexto y el tamano de lote.
- GPU recomendadas: NVIDIA A100, H100 o L40S para produccion con alta concurrencia; RTX 4090, RTX 3090 o A10G para entornos de desarrollo y cargas moderadas.
- GPU consumer: si cabe en tarjetas de 8 GB (RTX 3070, RTX 4060 Ti) con contexto limitado, y con holgura en 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090).
- Opciones de despliegue: vLLM es la via recomendada y nativa (`--quantization compressed-tensors --dtype bfloat16`). El formato `compressed-tensors` no es directamente compatible con llama.cpp u Ollama, que requieren GGUF; para esos entornos habria que buscar una conversion alternativa del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada. La cuantizacion W4A16 reduce el ancho de banda de memoria respecto a BF16, lo que tipicamente aumenta el throughput en decodificacion, pero no hay cifras publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-GPTQ-Int4 (este) | 4,4 B | No disponible | GPTQ W4A16, compressed-tensors | Apache 2.0 | Hugging Face (vllm-project y superjob) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,4 B | No disponible | BF16 | Apache 2.0 | Hugging Face |
| Otros modelos ~4B de la familia Qwen3 | No disponible | No disponible | No disponible | Apache 2.0 (segun familia) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- La cuantizacion GPTQ a 4 bits puede degradar la calidad en tareas sensibles a precision, como matematicas o generacion de codigo; no hay benchmarks publicados que cuantifiquen esta perdida.
- La model card es minimalista: no documenta contexto maximo, datos de entrenamiento, ni capacidades de tool calling, lo que dificulta planificar su uso en produccion sin pruebas propias.
- Riesgo de alucinacion inherente a los modelos de ~4B, superior al de modelos de mayor tamano en tareas de conocimiento factual.
- Idiomas: aunque se declaran 104 idiomas, las etiquetas del repositorio solo listan ingles y ruso; el rendimiento en castellano no esta verificado.
- Licencia Apache 2.0 permite uso comercial, pero al ser una copia de un checkpoint de un tercero (superjob), conviene verificar la procedencia y el commit original (`c3786b9`) antes de integrarlo en una cadena de suministro critica.
- El formato `compressed-tensors` esta optimizado para vLLM; otros motores de inferencia pueden no soportarlo directamente.
- El repositorio tiene un numero muy bajo de descargas (26) y cero likes en el momento de la consulta, lo que sugiere poca validacion comunitaria fuera del CI de vLLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vllm-project/Qwen3-4B-Instruct-2507-GPTQ-Int4
- Checkpoint original cuantizado: https://huggingface.co/superjob/Qwen3-4B-Instruct-2507-GPTQ-Int4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Proyecto vLLM: https://github.com/vllm-project/vllm
- Herramienta de cuantizacion llmcompressor: https://github.com/vllm-project/llm-compressor

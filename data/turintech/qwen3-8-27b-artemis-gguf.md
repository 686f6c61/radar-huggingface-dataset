# turintech/Qwen3.8-27B-Artemis-GGUF

## Resumen

Qwen3.8-27B-Artemis-GGUF es una versión cuantizada y comprimida del modelo multimodal Qwen/Qwen3.8-27B, publicada por TurinTech bajo su pipeline de compresión Artemis. El objetivo declarado es ejecutar un modelo de 27B parámetros (26.895.998.464 parámetros reales) en una GPU de 10 GB, con un archivo de descarga de 7,83 GB que requiere aproximadamente 8,5 GiB de VRAM en modo solo texto. El modelo base es de la familia Qwen3.8, orientado a generación de texto, razonamiento, visión y tool calling.

La relevancia de esta ficha está en la agresividad de la compresión: según la model card, el BFCL live de tool calls pasa de 223 aciertos de 258 en el modelo original a 222 de 258 en la versión cuantizada, una pérdida de un solo acierto. Eso convierte al modelo en una opción práctica para despliegues de agentes y function calling en hardware consumer, donde un 27B denso en precisión completa no cabría.

El repositorio usa formato GGUF y está pensado para llama.cpp, Ollama y LM Studio, con soporte de proyector de visión y un archivo MTP (multi-token prediction) adicional. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B); cuantizado en GGUF con pipeline Artemis |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens en el ejemplo de despliegue de la model card; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | IQ2_XXS (7,83 GB); otras variantes no detalladas en la informacion disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); incluye proyector de visión y archivo MTP separados |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen3.8-27B original, un transformer denso de 26,9B parametros con capacidad multimodal image-text-to-text. TurinTech aplica su pipeline Artemis para reducir el peso de 50,2 GiB (modelo original en el formato de referencia) a 7,83 GB de descarga, con un consumo medido de 8,5 GiB de VRAM en una NVIDIA A100 en modo solo texto, un solo slot y sin proyector de vision. El autor no detalla en la informacion disponible la composicion del dataset de entrenamiento del modelo base, el numero de tokens ni si hubo RLHF o DPO.

La innovacion tecnica destacable es la propia compresion Artemis, que preserva el rendimiento de tool calling casi intacto (222 de 258 en BFCL live frente a 223 del original). El repositorio incluye un archivo MTP (multi-token prediction) para decodificacion especulativa, convertido y verificado con llama.cpp b11889. El chat template activa el modo thinking por defecto; los resultados publicados se midieron con thinking desactivado mediante `chat_template_kwargs: {"enable_thinking": false}`, y el servidor devuelve el razonamiento en `message.reasoning_content` cuando esta activo.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat.
- Razonamiento con modo thinking activable o desactivable por peticion.
- Tool calling y function calling, con soporte de esquemas JSON de parametros.
- Capacidad multimodal image-text-to-text mediante proyector de vision opcional.
- Decodificacion especulativa mediante archivo MTP.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y servidor OpenAI-compatible de llama.cpp.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: inferidas del soporte de tool calling, sin detalle adicional en la model card.

## Casos de uso

- Agentes de tool calling en produccion con GPU limitada: el modelo ejecuta function calling con 222 aciertos de 258 en BFCL live consumiendo 8,5 GiB de VRAM, lo que permite desplegar un agente de 27B en tarjetas de 10 GB como la RTX 3080 o la RTX 4070.
- Asistente de atencion al cliente con contexto de 8.192 tokens: suficiente para historiales de conversacion multi-turno y documentacion de soporte inyectada, con el modo thinking desactivado para reducir latencia.
- Automatizacion de tareas con API externas: el soporte de esquemas de herramientas permite conectar el modelo a servicios de clima, calendario, CRM o bases de datos mediante el endpoint `/v1/chat/completions` de llama-server.
- Procesamiento de documentos con imagenes: con el proyector de vision cargado (aproximadamente 1,3 GiB adicionales de VRAM), el modelo puede extraer informacion de capturas, formularios o diagramas en flujos image-text-to-text.
- Entornos de desarrollo local con Ollama o LM Studio: `ollama run turintech/qwen3.8-27b-artemis` permite probar y validar prompts de agente en una estacion de trabajo sin infraestructura de servidor.
- Razonamiento matematico asistido: con 234 aciertos de 250 en GSM8K, es adecuado para tutoria o verificacion de calculos en aplicaciones educativas, activando thinking para problemas de varios pasos.
- Evaluacion y prototipado de pipelines de agentes antes de escalar a un modelo mayor: la cercania de rendimiento al original (222 frente a 223 en BFCL) permite desarrollar contra la version comprimida y desplegar la completa solo si hace falta.

## Benchmarks y rendimiento

Resultados declarados por TurinTech en la model card (metrica `verified: false`):

| Benchmark | Metrica | Resultado Artemis | Resultado modelo original |
|---|---|---|---|
| BFCL live | Tool calls correctos | 222 de 258 | 223 de 258 |
| GSM8K (ultimos 250) | Respuestas correctas | 234 de 250 | No disponible |
| MMLU-Pro (muestra) | Respuestas correctas | 128 de 280 | No disponible |
| IFEval | Instrucciones seguidas | 399 de 539 | No disponible |

No se han publicado en la informacion disponible resultados del modelo original para GSM8K, MMLU-Pro ni IFEval, ni comparaciones con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada: 8,5 GiB en modo solo texto, un slot, sin proyector de vision, medido en NVIDIA A100 con llama.cpp b11617.
- Con vision: aproximadamente 1,3 GiB adicionales al cargar el proyector (`--no-mmproj` lo omite).
- Cabe en GPU consumer de 10 GB o mas, como RTX 3080, RTX 4070, RTX 4070 Ti o superiores.
- GPU de centro de datos validadas en la model card: NVIDIA A100. Otras no especificadas.
- Despliegue: llama.cpp (b11617 o superior para texto; commit `4c3c581` en la release; b11889 para proyector y MTP), Ollama y LM Studio.
- Comando de referencia: `llama-server -hf turintech/Qwen3.8-27B-Artemis-GGUF:IQ2_XXS --no-mmproj -np 1 --port 8080 -c 8192 --jinja`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL live | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-Artemis-GGUF (IQ2_XXS) | 26,9B | 8.192 en el ejemplo de despliegue | 222/258 | Apache 2.0 | GGUF |
| Qwen/Qwen3.8-27B (original) | 26,9B | No disponible | 223/258 | Apache 2.0 | Pesos originales (50,2 GiB) |
| Alternativas de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye datos de otros modelos comparables de la misma categoria, por lo que la comparativa se limita al par original/cuantizado.

## Limitaciones y advertencias

- La cuantizacion IQ2_XXS es de 2 bits: aunque el tool calling se conserva casi intacto, es esperable degradacion en tareas de generacion libre, matematicas complejas y matices de idioma; no hay datos publicados que lo cuantifiquen.
- Los benchmarks de la model card estan marcados como no verificados (`verified: false`) y fueron medidos por el propio autor con muestras reducidas (250, 280 y 539 ejemplos), no sobre los conjuntos completos.
- El modo thinking esta activado por defecto en el chat template; si no se desactiva o no se reservan tokens suficientes para el razonamiento, las respuestas pueden truncarse.
- El contexto usado en el ejemplo de despliegue es de 8.192 tokens; el contexto nativo del modelo base no se detalla en la informacion disponible.
- Idiomas soportados no disponibles: no se puede garantizar calidad fuera del ingles o el chino sin evaluacion propia.
- Riesgo de alucinacion inherente a modelos de 27B comprimidos a 2 bits, especialmente con thinking desactivado.
- Requiere llama.cpp b11617 o superior; versiones anteriores pueden fallar con el archivo o el chat template.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base Qwen3.8-27B enlazada en la model card por si impone condiciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/turintech/Qwen3.8-27B-Artemis-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/qwen3.8-27b-artemis
- LM Studio: https://lmstudio.ai/turintech/qwen3.8-27b-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai

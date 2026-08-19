# vcruz305/Muse-Glimmer-30B-Hermes-Agentic-GGUF

## Resumen

Muse-Glimmer-30B-Hermes-Agentic-GGUF es una cuantizacion en formato GGUF de un fine-tune del modelo multimodal Muse Glimmer 30B de Meta, desarrollado por Victor Cruz (vcruz305) para mejorar el comportamiento agente y el uso de herramientas en el ecosistema Hermes Agent. El modelo base, Muse Glimmer 30B, es un modelo de 27.854 millones de parametros con licencia Apache 2.0, disenado para agentes locales siempre activos, con soporte nativo de tool calling y razonamiento multimodal (texto e imagen). Este fine-tune especifico entrena al modelo para llamar una o dos herramientas de Hermes y detenerse, evitando los bucles infinitos de llamadas que sufria el modelo original en trazas simuladas.

La relevancia de esta version GGUF radica en que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, con cuantizaciones desde Q2_K hasta F16. El autor reporta mejoras significativas en el benchmark hermes-agentic-bench: en trazas simuladas pasa de 7/20 aciertos (con 7 casos de tope de herramientas consecutivas) a 16/20 con cero topes, y en pruebas nativas con Hermes pasa de 4/5 a 7/7. Requiere llama.cpp version b10353 o superior y se recomienda desactivar DFlash para evaluaciones de bucles de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Muse Glimmer 30B) |
| Parametros totales | 27.854.794.240 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuracion recomendada) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | Ingles (SFT); base multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base, Muse Glimmer 30B, es un transformer multimodal desarrollado por Meta Superintelligence Lab que acepta entradas de texto e imagen, con soporte nativo de tool calling estilo OpenAI y parsers de razonamiento. Sobre este modelo, Victor Cruz aplico un fine-tune con QLoRA (r=8) utilizando el notebook gratuito de Unsloth para Muse Glimmer Conversational, ejecutado en Kaggle con 2xT4. El dataset de entrenamiento, `vcruz305/hermes-agentic-tool-sft`, contiene 1.980 filas y se aplico `apply_chat_template(..., tools=tools)` junto con `train_on_responses_only` desde la etiqueta `<|start|>assistant` para que los turnos de llamada a herramientas se entrenaran correctamente. El entrenamiento duro 392 pasos (1 epoca) con una perdida final de 0.163 en aproximadamente 3 horas y 38 minutos.

La innovacion principal del fine-tune es ensenar al modelo a detenerse tras una o dos llamadas a herramientas de Hermes, no reintentar herramientas fallidas, recuperarse una vez de archivos ausentes y no inventar comandos innecesarios cuando se le pide no usar herramientas. El resultado es un modelo que mantiene las capacidades de tool calling del base pero con un comportamiento agente mucho mas estable.

## Capacidades

- Tool calling estilo OpenAI y Hermes Agent: el modelo puede emitir llamadas a herramientas estructuradas y detenerse correctamente tras una o dos llamadas.
- Razonamiento agente multi-paso: disenado para sesiones largas con herramientas como terminal, busqueda web, gestion de archivos y operaciones de planificacion.
- Multimodal (texto e imagen): el modelo base acepta imagenes, aunque el fine-tune se ha centrado en texto y tool calling; la capacidad visual se mantiene del base.
- Generacion de texto y razonamiento: mantiene las capacidades generales de Muse Glimmer 30B en tareas de lenguaje, matematicas y codigo.
- Soporte de agentes locales: optimizado para ejecucion en un solo GPU con llama.cpp, pensado para flotas de agentes persistentes.
- Multilingue limitado: el SFT se realizo solo en ingles, aunque el modelo base es multilingue; el fine-tune puede degradar ligeramente otros idiomas.

## Casos de uso

- Asistente personal local con herramientas: el modelo puede gestionar un agente de Telegram que ejecuta comandos de terminal, busquedas web y gestion de archivos, con sesiones largas y sin bucles de llamadas gracias a su entrenamiento especifico.
- Automatizacion de tareas de desarrollo: integrado en un pipeline de CI/CD, el modelo puede llamar a herramientas de compilacion, ejecutar tests y reportar resultados, deteniendose tras una o dos acciones.
- Agente de soporte tecnico: con acceso a una base de conocimiento y herramientas de busqueda, el modelo responde consultas multi-turno y decide cuando consultar una herramienta externa sin entrar en ciclos repetitivos.
- Razonamiento multimodal con herramientas: al mantener la capacidad de imagen del base, puede analizar capturas de pantalla o diagramas y luego llamar a herramientas para actuar sobre ellos (por ejemplo, editar un archivo de configuracion).
- Prototipado de agentes Hermes: desarrolladores que evaluan el ecosistema Hermes Agent pueden usar este modelo como sustituto local de modelos propietarios, con licencia Apache 2.0 y sin coste de API.
- Investigacion en agentes: el benchmark hermes-agentic-bench y el dataset de entrenamiento permiten reproducir y estudiar el comportamiento de modelos agente con tool calling en entornos controlados.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluacion en el benchmark hermes-agentic-bench, comparando el modelo stock (Muse Glimmer 30B) con este fine-tune, ambos en cuantizacion Q4 y con DFlash desactivado, contexto 32k:

| Bateria | Muse Glimmer stock | Este fine-tune |
|---|---|---|
| Simulado `hermes_loop_gate.py` (20 casos) | 7/20 · media 5.7 herramientas · 7 HIT_CAP | 16/20 · media 1.05 · 0 HIT_CAP |
| Nativo `hermes_native_battery.py` | 4/5 · media 2.8 | 7/7 · media 1.43 · 0 HIT_CAP |

El autor aclara que estos resultados no son una re-ejecucion de los benchmarks de Meta (MCP Atlas, SWE-Bench) que aparecen en la ficha del modelo base, y recomienda re-evaluar en cada entorno. No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K para esta version cuantizada.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (para 27.85B parametros, con contexto 32k):
  - Q2_K: ~13-14 GB (cabe en GPUs de 16 GB)
  - Q3_K_M: ~15-16 GB (cabe en GPUs de 16 GB, justo)
  - Q4_K_M: ~17-18 GB (recomendado para tarjetas de 24 GB)
  - Q5_K_M: ~19-20 GB (para 24-32 GB)
  - Q6_K: ~22-23 GB (para 32 GB+)
  - Q8_0: ~28-29 GB (para 32 GB+ o multiples GPUs)
  - F16: ~55 GB (solo investigacion, requiere multiples GPUs)
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M, RTX 3090/4080 (24 GB) para Q4/Q5, A100 40GB o H100 para Q6/Q8.
- En GPUs de consumo de 16 GB (RTX 4080, RTX 3080 Ti) se puede usar Q3_K_M o Q2_K con contexto reducido.
- Despliegue: llama.cpp (llama-server o llama-cli) con version >= b10353, tambien compatible con vLLM, Ollama y TGI si se convierten los pesos (aunque el formato GGUF es nativo de llama.cpp).
- Latencia: no se proporcionan datos de throughput; en una RTX 4090 con Q4_K_M se espera una generacion de 20-40 tokens/s para este tamano de modelo, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Hermes-Agentic-GGUF (este) | 27.85B | 32k | Si (Hermes/OpenAI) | Apache 2.0 | GGUF |
| Muse Glimmer 30B (stock) | 27.85B | 32k | Si (OpenAI) | Apache 2.0 | Safetensors, GGUF |
| Hermes 3 70B (Nous Research) | 70B | 32k | Si (Hermes) | Apache 2.0 | Safetensors, GGUF |

No se dispone de comparativas directas con otros modelos de 30B en benchmarks de tool calling en la informacion proporcionada. El autor menciona que el modelo base ya era fuerte en emitir llamadas a herramientas, pero fallaba en detenerse; este fine-tune corrige ese problema especifico.

## Limitaciones y advertencias

- El fine-tune se ha realizado exclusivamente en ingles; el rendimiento en otros idiomas puede degradarse respecto al modelo base multilingue.
- Requiere llama.cpp >= b10353; versiones anteriores pueden no parsear correctamente las llamadas a herramientas de Hermes.
- Se recomienda desactivar DFlash (flash attention) al evaluar bucles de herramientas, ya que puede alterar el comportamiento de detencion.
- El modelo puede alucinar en tareas de razonamiento complejo o cuando las herramientas devuelven errores inesperados; el entrenamiento solo cubre una recuperacion de archivos ausentes.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de soporte ni de seguridad para entornos de produccion.
- El tamano del repositorio (169.3 GB) incluye todas las cuantizaciones; descargar solo el archivo necesario es recomendable.
- No se han publicado evaluaciones de sesgos, robustez o seguridad; el modelo base puede heredar sesgos de los datos de entrenamiento de Meta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vcruz305/Muse-Glimmer-30B-Hermes-Agentic-GGUF
- Modelo base (merge 16-bit): https://huggingface.co/vcruz305/Muse-Glimmer-30B-Hermes-Agentic
- Modelo base original (Meta): https://huggingface.co/meta-models/Muse-Glimmer-30B
- Dataset de entrenamiento: https://huggingface.co/datasets/vcruz305/hermes-agentic-tool-sft
- Benchmark hermes-agentic-bench: https://github.com/vcruz305/hermes-agentic-bench
- Notebook de entrenamiento (Unsloth): https://unsloth.ai/docs/models/muse-glimmer/train
- Documentacion de Hermes Agent: https://hermes-agent.nousresearch.com
- Pagina de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/

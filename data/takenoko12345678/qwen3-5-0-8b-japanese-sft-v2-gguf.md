# Takenoko12345678/Qwen3.5-0.8B-Japanese-SFT-v2-GGUF

## Resumen

Qwen3.5-0.8B-Japanese-SFT-v2-GGUF es una version cuantizada en formato GGUF de un ajuste fino en japones del modelo Qwen3.5-0.8B. El modelo original lo publica el usuario Takenoko12345678 y es un derivado no oficial, sin relacion con el equipo de Qwen. El objetivo es ofrecer un modelo conversacional pequeno (752.393.024 parametros, es decir, alrededor de 0,8 mil millones) capaz de mantener dialogos en japones con un rendimiento util incluso sin GPU.

La relevancia de esta ficha radica en su perfil de despliegue: con los ficheros Q4_K_M (0,5 GB) o Q8_0 (0,8 GB) el modelo funciona en portatiles sin GPU dedicada y con 8 GB de memoria, alcanzando aproximadamente 87 tokens por segundo en CPU (Apple M5, 4 hilos). La version v2 corrige el problema de repeticion de texto que arrastraba la v1 (de 8 casos sobre 590 respuestas a 0).

El modelo se distribuye bajo licencia Apache 2.0, soporta japones e ingles, y esta pensado exclusivamente para generacion de texto e interacciones conversacionales. Un detalle importante es que no dispone de modo de razonamiento o "thinking": el ajuste se hizo sin esa capacidad y debe desactivarse explicitamente en tiempo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5; la model card no detalla la arquitectura exacta) |
| Parametros totales | 752.393.024 (aproximadamente 0,8 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (convertidos desde f16) |
| Idiomas soportados | Japones (ja) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); los pesos originales estan en safetensors |

## Arquitectura y entrenamiento

El modelo deriva de Qwen/Qwen3.5-0.8B, un transformer denso de la familia Qwen3.5. Sobre esa base se aplico un ajuste supervisado (SFT) orientado al japones, dando lugar a Qwen3.5-0.8B-Japanese-SFT-v2, del que esta publicacion es unicamente la version cuantizada en GGUF. El autor no detalla en la model card el numero total de tokens de entrenamiento ni la composicion exacta del dataset, aunque si indica que el ajuste se realizo integramente sin modo de razonamiento (thinking).

Los datos de entrenamiento incluyen un subconjunto del dataset Tengentoppa-sft-v1.0 (licencia CC BY 4.0, autor DeL-TaiseiOzaki) y articulos de la Wikipedia en japones (CC BY-SA 3.0 / GFDL). En cuanto al proceso de conversion publicado, se utilizo el script `convert_hf_to_gguf.py` de llama.cpp (commit `d28da865b`) para generar f16, tras poner `mtp_num_hidden_layers` a 0 en `config.json` porque los pesos originales no incluyen las capas de prediccion multi-token (MTP) de Qwen3.5. La cuantizacion se hizo con `llama-quantize` (llama.cpp 0.5.0, build 11146). No se especifica si hubo fases de RLHF o DPO posteriores al SFT.

## Capacidades

- Generacion de texto conversacional en japones e ingles.
- Dialogo multiturno con plantilla de chat integrada en el GGUF (requiere `--jinja` en llama-server).
- Respuestas de cultura general: en una prueba interna de 30 preguntas obtuvo 22/24 aciertos con Q8_0 y 21/23 con Q4_K_M (tambien 22/24 con f16).
- Conversacion en CPU a velocidad superior a la lectura humana (aproximadamente 87 tok/s con Q4_K_M en Apple M5, 4 hilos).
- No dispone de modo de razonamiento o "thinking"; el ajuste se hizo sin el y debe desactivarse con `chat_template_kwargs.enable_thinking = false`.
- No se documentan capacidades de tool calling, function calling, uso como agente, vision ni audio en la informacion disponible.
- Capacidad multilingue limitada a japones e ingles.

## Casos de uso

- Chatbot ligero en japones embebido en aplicaciones de escritorio o moviles: al ocupar solo 0,5 GB en Q4_K_M y funcionar sin GPU, se puede integrar en un portatil con 8 GB de RAM y responder en tiempo real (aprox. 0,7 s por respuesta en CPU Apple M5).
- Atencion al cliente automatizada en japones con requisitos de baja latencia y sin infraestructura de GPU: el modelo gestiona turnos conversacionales simples y se despliega con llama-server exponiendo una API compatible con OpenAI.
- Generacion de texto asistida en japones (borradores, resumentes breves, reescritura de frases) en herramientas internas donde no es viable enviar datos a servicios en la nube.
- Practica de conversacion y aprendizaje de japones: el modelo puede mantener dialogos basicos en japones e ingles y servir como companero de practica en aplicaciones educativas ligeras.
- Prototipado rapido y pruebas de concepto en investigacion: por su tamano reducido se puede ejecutar en local para validar pipelines de inferencia, plantillas de chat y estrategias de cuantizacion antes de escalar a modelos mayores.
- Preprocesado o clasificacion ligera de texto japones en pipelines de datos: pese a no estar optimizado para tareas discriminativas, su coste computacional minimo permite usarlo en tareas auxiliares como etiquetado asistido o generacion de variaciones.
- Despliegue en entornos con restricciones de hardware (edge, dispositivos embebidos, equipos sin acelerador): el fichero Q4_K_M ocupa 0,5 GB y el Q8_0 0,8 GB, lo que permite ejecucion en CPU con memoria muy limitada.

## Benchmarks y rendimiento

Los unicos datos publicados son pruebas internas del autor, no benchmarks estandar como MMLU, HumanEval o GSM8K. Se reproducen a continuacion tal como aparecen en la model card.

| Fichero | Tamano | 20 conversaciones (CPU, Apple M5, 4 hilos) | Velocidad | Cultura general (30 preguntas) |
|---|---|---|---|---|
| Q8_0 | 0,8 GB | 19,6 s | aprox. 72 tok/s | 22/24 |
| Q4_K_M | 0,5 GB | 14,5 s | aprox. 87 tok/s | 21/23 |
| f16 (referencia) | no disponible | no disponible | no disponible | 22/24 |

El autor indica que el problema de repeticion de la v1 paso de 8 casos sobre 590 respuestas a 0 en la v2. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,5 GB para Q4_K_M y 0,8 GB para Q8_0 (mas el overhead del contexto y del runtime de llama.cpp). Cabe comodamente en equipos con 8 GB de RAM y sin GPU dedicada.
- GPU recomendadas: no se especifican en la model card. Por tamano, cualquier GPU consumer con al menos 1-2 GB de memoria libre (por ejemplo, una GTX 1650 o superior) es suficiente para alojar los pesos cuantizados.
- Compatibilidad con GPU consumer: si, incluidas GPU de gama baja y equipos sin GPU. El autor confirma ejecucion en CPU de Apple M5 con 4 hilos.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`) y LM Studio (mencionados en la model card). Al ser GGUF, es compatible tambien con otras herramientas basadas en llama.cpp; no se documentan vLLM, TGI u Ollama de forma explicita.
- Latencia y throughput: aproximadamente 87 tok/s con Q4_K_M y 72 tok/s con Q8_0 en CPU Apple M5 (4 hilos); 0,7 s de media por respuesta en el caso Q4_K_M. No hay mediciones publicadas sobre GPU.
- Parametros de decodificacion recomendados: `temperature 1.0`, `top_k 20`, `top_p 1.0`, `presence_penalty 2.0`, `repeat_penalty 1.1`, `max_tokens 512` para conversacion; `temperature 0` para preguntas factuales o de opcion multiple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-Japanese-SFT-v2-GGUF | 0,8 B | no disponible | ja, en | Apache 2.0 | GGUF | Version cuantizada, ajuste en japones, sin thinking |
| Qwen/Qwen3.5-0.8B | 0,8 B | no disponible | multilingue (no detallado) | no disponible | safetensors | Modelo base oficial; sin ajuste especifico en japones |
| Takenoko12345678/Qwen3.5-0.8B-Japanese-SFT-v2 | 0,8 B | no disponible | ja, en | Apache 2.0 | safetensors | Modelo del que deriva esta version; mismos pesos sin cuantizar |

No se dispone de datos de rendimiento comparativos frente a alternativas de tamano similar (por ejemplo, Qwen3-0.6B o modelos japoneses pequenos de la familia llm-jp), por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Modelo pequeno (0,8 B): la tasa de alucinacion en preguntas factuales es previsiblemente alta; el autor recomienda `temperature 0` para tareas factuales o de opcion multiple.
- La v1 presentaba un problema de repeticion de texto sin fin; la v2 lo corrige segun el autor (0 casos sobre 590 respuestas), pero conviene mantener `repeat_penalty` en 1.1 como margen de seguridad.
- No dispone de modo de razonamiento: si no se fuerza `enable_thinking = false` en la plantilla de chat, el comportamiento puede degradarse, ya que el ajuste se hizo sin thinking.
- Solo se documentan capacidades en japones e ingles; no hay garantias para otros idiomas.
- No se especifica la longitud de contexto soportada, lo que limita el diseno de aplicaciones con ventanas largas.
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- La licencia del modelo es Apache 2.0, pero los datos de entrenamiento incluyen contenido con licencias CC BY 4.0 (Tengentoppa-sft-v1.0, DeL-TaiseiOzaki) y CC BY-SA 3.0 / GFDL (Wikipedia en japones), por lo que se deben respetar las atribuciones correspondientes. Conviene revisar los terminos del modelo base Qwen3.5-0.8B antes de un uso comercial.
- La model card indica explicitamente que es un derivado no oficial y sin relacion con el equipo de Qwen.
- El repositorio no tiene descargas ni "likes" registrados en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/Takenoko12345678/Qwen3.5-0.8B-Japanese-SFT-v2-GGUF
- Modelo base del ajuste en japones: https://huggingface.co/Takenoko12345678/Qwen3.5-0.8B-Japanese-SFT-v2
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset Tengentoppa-sft-v1.0: https://huggingface.co/datasets/DeL-TaiseiOzaki/Tengentoppa-sft-v1.0
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp

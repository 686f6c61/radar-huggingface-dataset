# Thox-ai/ThoxNano-360M

## Resumen

ThoxNano-360M es un ajuste fino (fine-tune) del modelo base SmolLM-360M de Hugging Face, desarrollado por Thox-ai como asistente en dispositivo (on-device) para su linea de hardware ThoxClip. Se trata de un LoRA de rango 32 entrenado sobre un corpus propio de 982 ejemplos de conversacion, uso de herramientas y factualidad, fusionado posteriormente en los pesos base. Con 361.821.120 parametros, esta pensado para ejecutarse en dispositivos de borde (edge) con recursos muy limitados, manteniendo los datos del usuario en local.

El modelo se distribuye en safetensors y en una cuantizacion GGUF Q4_K_M de aproximadamente 270 MB, y esta disponible en Ollama. Su proposito declarado no es el conocimiento factual autonomo, sino el enrutamiento de intenciones hacia funciones del dispositivo y la malla (mesh), respuestas conversacionales cortas y el mantenimiento de la "voz de marca" de THOX, con los hechos suministrados por la capa de servicio.

Es relevante por dos motivos: por un lado, ejemplifica la categoria de modelos sub-500M orientados a asistentes locales y privados; por otro, su model card es inusualmente transparente sobre el rendimiento real, publicando un resultado debil en su propia puerta de evaluacion (23/49 en GATE49) y advirtiendo explicitamente de fallos duros y bucles de repeticion. Esa honestidad lo convierte en un caso de estudio util sobre los limites de los modelos muy pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-360M); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica cuantizacion publicada en el repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (model.safetensors, 723.674.912 B) y GGUF (ThoxNano-360M.Q4_K_M.gguf, 270.590.336 B); incluye Modelfile para Ollama |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM-360M, un transformer decoder-only de la familia SmolLM de Hugging Face; la model card no detalla la configuracion interna (numero de capas, dimension oculta, atencion, tokenizador). Sobre esos pesos se aplico un ajuste fino mediante LoRA de rango 32, entrenado con un corpus propio de THOX compuesto por 982 ejemplos que cubren conversacion, uso de herramientas y factualidad. Posteriormente, el adaptador se fusiono en los pesos base, dando lugar al modelo final publicado.

No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO; la model card indica que no se reclama ningun entrenamiento adicional mas alla del descrito. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El repo incluye el chat template (chat_template.jinja), el tokenizador completo, config.json, generation_config.json y un training_summary.json.

## Capacidades

- Generacion de texto conversacional de formato corto, orientada a respuestas breves de asistente.
- Enrutamiento de intenciones (intent routing) hacia funciones del dispositivo y de la malla (mesh) de THOX.
- Uso de herramientas (tool-use) a nivel basico, segun el corpus de entrenamiento.
- Mantenimiento de la "voz de marca" (house voice) de THOX en las respuestas.
- Funcionamiento completamente offline, con enfoque local-first y privacidad de datos.
- Capacidad multilingue: solo ingles.
- No se documentan capacidades de vision, audio, modo de razonamiento explicito (thinking mode) ni razonamiento matematico avanzado.

## Casos de uso

- Asistente de voz o texto en dispositivo de borde: el modelo puede gestionar respuestas conversacionales cortas en hardware de muy baja potencia (movil, wearable, dispositivo dedicado), manteniendo la conversacion en local y sin enviar datos a la nube.
- Enrutamiento de comandos en un dispositivo inteligente: dado un enunciado del usuario, clasifica la intencion y la dirige a la funcion de dispositivo o de malla correspondiente, con los hechos inyectados por la capa de servicio.
- Prototipado rapido de asistentes privados: su tamano (270 MB en Q4_K_M) permite incluirlo en imagenes de firmware o aplicaciones de escritorio, y probarlo con `ollama run` en cuestion de segundos.
- Educacion e investigacion sobre modelos pequenos: sirve como caso de estudio de ajuste fino con LoRA sobre SmolLM y de evaluacion de factualidad con una puerta propia (GATE49).
- Filtrado y clasificacion ligera de texto en pipelines de borde: tareas de etiquetado o respuesta corta donde la latencia y el consumo energetico son criticos y no se requiere conocimiento factual profundo.
- Demostraciones de ecosistema local-first: integrado en la linea ThoxClip como capa conversacional de bajo nivel, con la logica de negocio y los hechos delegados al serving layer.
- Base para ajustes finos adicionales: al ser Apache-2.0 y de tamano reducido, es un punto de partida economico para especializar en un dominio concreto con LoRA.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---:|
| THOX GATE49 (factualidad, conjunto de desarrollo, ponderado por abtencion) | 23/49 — media 2.959/5 |
| Fallos duros (hard failures) | 11 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor califica explicitamente el resultado de GATE49 como debil y advierte que una evaluacion anterior no pudo completarse porque el modelo entro en un bucle de repeticion en una de las preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3-0,5 GB en Q4_K_M; en torno a 0,7-0,8 GB en safetensors a precision completa (fp16/bf16), segun el tamano del fichero de pesos.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, asi como en A100/H100, aunque en estos ultimos el cuello de botella sera el lanzamiento de kernels y no la memoria.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas y en muchas integradas; tambien es viable en CPU.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxnano-360m`), llama.cpp (`llama-cli`), y cualquier runtime compatible con GGUF; el repo incluye un Modelfile.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, se espera una generacion de decenas a cientos de tokens por segundo en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| ThoxNano-360M | 361,8 M | No disponible | Apache-2.0 | Hugging Face, Ollama | Fine-tune de SmolLM-360M; solo ingles; GATE49 23/49 |
| SmolLM-360M (base) | 360 M | No disponible en la informacion proporcionada | Apache-2.0 | Hugging Face | Modelo base sin ajuste de dominio; referencia directa |
| SmolLM2-360M | 360 M | No disponible en la informacion proporcionada | Apache-2.0 | Hugging Face | Generacion posterior de la familia SmolLM; no evaluado aqui |
| Qwen2.5-0.5B | 500 M | No disponible en la informacion proporcionada | Apache-2.0 | Hugging Face | Alternativa algo mayor, multilingue; no evaluado aqui |

La comparativa se limita a la categoria de modelos sub-500M para dispositivo; no se dispone de resultados de benchmarks comparables entre estos modelos en la informacion proporcionada, por lo que no se establece una comparacion de rendimiento numerica.

## Limitaciones y advertencias

- El propio autor califica el resultado de GATE49 (23/49, 11 fallos duros) como debil; el modelo no es fiable como fuente de hechos por si mismo.
- Tendencia documentada a entrar en bucles de repeticion en algunas peticiones; se recomienda fijar limites de salida modestos y condiciones de parada.
- Puede repetir fragmentos de su prompt de sistema (system prompt), lo que supone un riesgo de filtrado de instrucciones internas.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- No apto para decisiones criticas de seguridad, medicas o legales sin supervision humana.
- No debe usarse como fuente autonoma de hechos de THOX: requiere una capa de servicio que los suministre.
- Licencia Apache-2.0: permite uso comercial, pero el autor remite al texto de la licencia para los terminos aplicables al fine-tune y sus adiciones.
- La model card incluye contenido promocional de una campana de Kickstarter; conviene separar ese material de la informacion tecnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxNano-360M
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-360M
- Demo de dispositivos virtuales THOX: https://thox.ai/#demo-callout-home_lineup
- Campana de Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
- Repositorio de Ollama del modelo: `ollama pull Thox-ai/thoxnano-360m`

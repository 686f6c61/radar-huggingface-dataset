# Thox-ai/ThoxFlux-350M

## Resumen

ThoxFlux-350M es un modelo de lenguaje de 350 millones de parametros desarrollado por Thox-ai como fine-tune del modelo base LiquidAI/LFM2.5-350M. Se trata de un ajuste LoRA de rango 32 sobre un corpus de 982 ejemplos de chat, uso de herramientas y factualidad, cuyos pesos resultantes se han fusionado en los pesos base. El modelo esta disenado especificamente para el asistente local ThoxClip, un dispositivo de borde (edge) que ejecuta inferencia completamente offline.

El modelo resuelve el problema de dotar a un dispositivo de muy baja potencia de una identidad conversacional propia, un tono de marca definido y la capacidad de enrutar intenciones hacia funciones del dispositivo y de la malla (mesh). No pretende ser una fuente fiable de conocimiento factual: el autor indica explicitamente que los hechos deben suministrarse desde la capa de servicio (grounding), no desde los pesos desnudos. Su relevancia actual radica en la tendencia hacia asistentes locales y privados que caben en hardware de consumo y no dependen de la nube.

La arquitectura subyacente es LFM2.5 de LiquidAI, un transformer compacto de 354.483.968 parametros reales (segun los safetensors del repositorio). El modelo se distribuye en formato safetensors y GGUF Q4_K_M, con un Modelfile para Ollama, y esta disponible publicamente bajo la licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM2.5, modelo base LiquidAI/LFM2.5-350M) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unico publicado en el repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (no es Apache-2.0; restringe uso comercial a entidades con ingresos anuales inferiores a 10 M USD) |
| Formato de pesos | safetensors (708.984.464 B) y GGUF Q4_K_M (229.314.592 B) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M, un transformer compacto de 350 millones de parametros. Sobre esa base se aplico un fine-tune mediante LoRA de rango 32 entrenado con un corpus autorado por THOX compuesto por 982 ejemplos de chat, uso de herramientas y factualidad. Los adaptadores se fusionaron posteriormente en los pesos base, de modo que el repositorio contiene los pesos completos ya fusionados junto con el tokenizer y la plantilla de chat (`chat_template.jinja`).

El objetivo del ajuste no es ampliar la capacidad del modelo base, sino ensenar identidad de marca (THOX), un tono de voz propio y las formas de enrutamiento de herramientas. El autor lo declara explicitamente: el fine-tune no anade nueva capacidad, sino comportamiento de identidad y enrutamiento. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se emplearon tecnicas de RLHF o DPO. El repositorio incluye un `training_summary.json` que no se ha podido consultar en detalle.

## Capacidades

- Generacion de texto conversacional breve, orientada a respuestas cortas de asistente.
- Enrutamiento de intenciones hacia funciones del dispositivo y de la malla (tool routing).
- Uso de herramientas (tool use) segun el corpus de entrenamiento.
- Adopcion de una identidad y tono de marca consistentes (THOX house voice).
- Ejecucion completamente offline en dispositivos de borde.
- Capacidad de abtencion ante preguntas fuera de su alcance, con escalado a traves de MeshStack (segun describe el autor).
- Soporte de plantilla de chat y Modelfile para integracion con Ollama.
- No se documentan capacidades de vision, audio, razonamiento multi-paso complejo ni modo de pensamiento (thinking mode).

## Casos de uso

- Asistente de voz o texto en dispositivo dedicado: el modelo gestiona conversaciones cortas de ida y vuelta en local, sin conexion, lo que permite respuestas inmediatas y privacidad total de los datos del usuario.
- Enrutamiento de comandos del dispositivo: traduce la intencion del usuario en llamadas a funciones concretas del hardware o de la malla (MeshStack), adecuado por su entrenamiento especifico en tool routing y su baja latencia en hardware modesto.
- Interfaz conversacional con tono de marca: util para productos que necesitan una personalidad coherente y reconocible en todas las respuestas, gracias al ajuste de identidad y voz de marca.
- Prototipado rapido de asistentes locales: su tamano reducido y su formato GGUF Q4_K_M permiten desplegarlo en portatiles y dispositivos de gama baja para validar flujos conversacionales antes de escalar a modelos mayores.
- Filtro o primera capa de un sistema con grounding: el modelo responde a saludos, aclaraciones y preguntas de enrutamiento, mientras la capa de servicio inyecta los hechos verificados, evitando que el usuario reciba informacion inventada.
- Educacion y demostraciones de IA en el borde: sirve para ensenar como funciona un pipeline de inferencia local completo con Ollama, desde la descarga del GGUF hasta la generacion, en equipos sin GPU dedicada.
- Integracion en pipelines de CI/CD para pruebas de regresion conversacional: su bajo coste de ejecucion permite incluirlo en tests automatizados de calidad de respuesta y de enrutamiento en cada version.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| THOX GATE49 (factualidad, conjunto de desarrollo, ponderado por abtencion) | 20/49 — media 2,49/5 |
| Fallos graves (hard failures) | 18 |

El propio autor califica este resultado como debil y senala que el modelo se publica por su identidad, voz y comportamiento de enrutamiento bajo grounding, no por su recall factual desde los pesos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizacion Q4_K_M (archivo de 229 MB) y aproximadamente 1,4 GB en safetensors a precision completa (archivo de 709 MB), mas overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente; el modelo esta pensado para CPU y aceleradores de borde. Funciona en RTX 4090, RTX 3060 y en iGPU sin problema.
- Cabe holgadamente en GPU de consumo y en dispositivos de borde; tambien se ejecuta en CPU.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxflux-350m`), llama.cpp con el GGUF Q4_K_M, y descarga directa de safetensors desde Hugging Face para frameworks compatibles.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia de decenas de milisegundos por token en CPU moderna y muy inferior en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxFlux-350M | 354 M | no disponible | LFM Open License v1.0 (uso comercial limitado a <10 M USD de ingresos) | Hugging Face (safetensors + GGUF), Ollama | Fine-tune de identidad y enrutamiento sobre LFM2.5-350M |
| LiquidAI/LFM2.5-350M | 350 M | no disponible | LFM Open License v1.0 | Hugging Face | Modelo base sin ajuste de identidad ni enrutamiento THOX |
| Qwen2.5-0.5B | 500 M | 32 768 tokens (segun documentacion publica de Qwen) | Apache-2.0 | Hugging Face, Ollama | Alternativa de proposito general con licencia permisiva; no especializada en borde ni en enrutamiento |
| SmolLM2-360M | 360 M | 8 192 tokens (segun documentacion publica de Hugging Face) | Apache-2.0 | Hugging Face, Ollama | Modelo pequeno de proposito general; sin fine-tune de marca ni tool routing especifico |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Respuestas factuales poco fiables desde los pesos desnudos: el autor exige grounding en la capa de servicio y reporta 18 fallos graves en su propia puerta de factualidad (GATE49).
- Modelo de 350 M: contexto corto y techo de razonamiento bajo por diseno; el fine-tune no anade capacidad nueva, solo identidad y formas de enrutamiento.
- Solo soporta ingles; no se documenta soporte multilingue.
- Licencia LFM Open License v1.0: no es Apache-2.0 y restringe el uso comercial a entidades con ingresos anuales inferiores a 10 millones de USD; es imprescindible leer el archivo LICENSE antes de cualquier despliegue comercial.
- Riesgo de alucinacion elevado en preguntas de conocimiento general; el modelo debe combinarse con una capa de recuperacion o abtencion.
- No apto para decisiones criticas de seguridad, medicas o legales sin supervision humana, segun el propio autor.
- El autor indica que esta version no ha sido cualificada en el dispositivo ThoxClip (texto truncado en la model card).
- La model card incluye contenido promocional de una campana de Kickstarter; conviene separar esa informacion de los datos tecnicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxFlux-350M
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Demo de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campana de Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai

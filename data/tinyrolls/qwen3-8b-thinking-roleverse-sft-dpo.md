# tinyrolls/Qwen3-8B-Thinking-RoleVerse-SFT-DPO

## Resumen

Qwen3-8B-Thinking-RoleVerse-SFT-DPO es un ajuste fino del modelo Qwen/Qwen3-8B desarrollado por el usuario tinyrolls, orientado especificamente a la interpretacion de personajes (role-playing) multilingue en escenarios de conflicto. El modelo parte del checkpoint en modo "thinking" de Qwen3-8B y se entrena en dos fases sobre el conjunto de datos RoleVerse: un ajuste supervisado (SFT) seguido de optimizacion por preferencias directas (DPO). Su proposito es mejorar la calidad de las respuestas enactivas de un personaje, es decir, que el modelo no solo comprenda la situacion social sino que responda como lo haria ese personaje concreto.

El modelo acompana al articulo *Knows but Cannot Act: A Reasoning-Social Trade-off in Multilingual Role-Playing*, que documenta un fenomeno relevante: los modelos con mayor capacidad de razonamiento comprenden mejor las escenas sociales (mejor precision en preguntas de opcion multiple) pero las enactan peor (peor calidad de respuesta abierta). Los experimentos de entrenamiento muestran que ambas dimensiones pueden moverse en direcciones opuestas mediante SFT y DPO, lo que convierte a estos checkpoints en material de estudio sobre el equilibrio entre razonamiento y competencia social.

Con 8.190.735.360 parametros y un repositorio de 16,4 GB en safetensors, es un modelo denso de tamano medio que cabe en hardware de consumo con cuantizacion. Soporta cinco idiomas (ingles, chino, japones, frances y espanol) y se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial. Es relevante ahora porque aborda un nicho poco cubierto —el role-playing multilingue evaluado de forma rigurosa— y porque su metodologia de entrenamiento en dos fases es reproducible a partir del codigo y el dataset publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh, ja, fr, es |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con aproximadamente 8.190 millones de parametros. Sobre esa base se aplica un pipeline de dos etapas: primero un ajuste supervisado (SFT) sobre el dataset RoleVerse y despues una fase de DPO. El dataset RoleVerse es un benchmark multilingue de role-playing construido en torno a situaciones de conflicto y evaluado con un protocolo dual "saber-actuar": una pregunta de opcion multiple que mide la comprension de la situacion social y una respuesta abierta juzgada segun su adecuacion al personaje.

La innovacion tecnica principal no reside en la arquitectura, sino en la metodologia de evaluacion y entrenamiento. El articulo demuestra que SFT y DPO afectan de forma distinta a la comprension (MCQ) y a la enactacion (calidad de respuesta): en el caso de Qwen3-8B Thinking, el modelo base obtiene 3,38 en Resp Avg y 40,85 % en MCQ, mientras que tras SFT & DPO sube a 3,61 en Resp Avg pero baja a 34,60 % en MCQ. No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multilingue en ingles, chino, japones, frances y espanol.
- Interpretacion de personajes (role-playing) en dialogos multi-turno con contexto de conflicto social.
- Modo "thinking": el checkpoint responde tras el bloque `</think>`, exponiendo razonamiento previo a la respuesta.
- Comprension de situaciones sociales medida mediante preguntas de opcion multiple (protocolo del benchmark RoleVerse).
- Enactacion de respuestas abiertas evaluadas en cinco dimensiones de calidad (1-5).
- Soporte de plantilla de chat mediante `apply_chat_template` con `enable_thinking=True`.
- No se documenta soporte de tool calling, function calling, vision, audio ni capacidades de agente multi-paso en la informacion proporcionada.

## Casos de uso

- Prototipado de personajes conversacionales en videojuegos y narrativa interactiva: el modelo mantiene el rol de `role2` a lo largo de turnos y responde en el idioma del interlocutor, lo que permite construir NPCs con personalidad consistente en cinco idiomas.
- Investigacion sobre el equilibrio razonamiento-sociedad: sirve como checkpoint de referencia para reproducir los experimentos del articulo y comparar SFT frente a DPO en tareas de enactacion social.
- Evaluacion de benchmarks de role-playing: al estar entrenado sobre RoleVerse, es util para validar pipelines de evaluacion con juez automatico (GPT-5 en el articulo) y protocolo dual saber-actuar.
- Simulacion de dialogos de mediacion o negociacion: los escenarios de conflicto del dataset permiten generar respuestas de personajes en situaciones tensas para estudiar estrategias de desescalada.
- Generacion de datos sinteticos de dialogo multilingue: puede producir turnos de personaje en en/zh/ja/fr/es para aumentar datasets de entrenamiento de otros modelos.
- Asistencia a guionistas y disenadores de dialogo: genera borradores de intervenciones de personaje que luego se revisan manualmente, aprovechando el modo thinking para justificar la eleccion de respuesta.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache-2.0, puede integrarse en productos comerciales sin las restricciones de licencias tipo Llama Community.

## Benchmarks y rendimiento

Resultados del articulo sobre el conjunto de test de RoleVerse. Resp Avg es la media de cinco dimensiones de respuesta (1-5, juez GPT-5); MCQ % es la precision en comprension social.

| Grupo | Modelo | Resp Avg | MCQ % |
|---|---|---:|---:|
| Sin entrenar | Qwen2.5-32B-Instruct | 2,79 | 48,67 |
|  | R1-Distill-Qwen-32B | 2,38 | 53,28 |
|  | Qwen3-30B-A3B-Instruct-2507 | 3,69 | 41,73 |
|  | Qwen3-30B-A3B-Thinking-2507 | 3,40 | 52,27 |
|  | gpt-oss-120b (low) | 3,15 | 67,30 |
|  | gpt-oss-120b (medium) | 3,00 | 72,60 |
|  | gpt-oss-120b (high) | 2,93 | 73,04 |
|  | DeepSeek-R1-0528 | 4,12 | 70,14 |
|  | GPT-5 (low; referencia) | 4,35 | 81,88 |
| Llama-3.1-8B-Instruct | base | 2,87 | 29,36 |
|  | + solo SFT | 3,35 | 19,07 |
|  | + solo DPO | 3,42 | 32,39 |
|  | + SFT & DPO | 3,81 | 17,05 |
| Qwen3-8B Non-thinking | base | 3,16 | 33,96 |
|  | + solo SFT | 3,35 | 32,07 |
|  | + solo DPO | 3,42 | 35,23 |
|  | + SFT & DPO | 3,73 | 31,57 |
| Qwen3-8B Thinking | base | 3,38 | 40,85 |
|  | + solo SFT | 3,38 | 37,75 |
|  | + solo DPO | 3,60 | 43,12 |
|  | + SFT & DPO (este modelo) | 3,61 | 34,60 |
| R1-Distill-Qwen3-8B | base | 2,47 | 50,06 |
|  | + solo SFT | 2,15 | 31,50 |
|  | + solo DPO | 3,07 | 49,62 |
|  | + SFT & DPO | 3,07 | 28,85 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB para contexto corto.
- Cuantizacion a 8 bits: alrededor de 8-9 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion a 4 bits: alrededor de 4-5 GB de pesos, viable en GPUs de consumo de 8 GB o superiores (sujeto a la implementacion de cuantizacion, no listada en el repo).
- GPUs recomendadas: A100 (40/80 GB) o H100 para produccion y lotes grandes; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en FP16 y en GPUs de 8-12 GB con cuantizacion 4-8 bits.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference` en el repo) y endpoints compatibles. No se confirma soporte de llama.cpp, Ollama ni vLLM en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resp Avg (RoleVerse) | MCQ % | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Qwen3-8B-Thinking-RoleVerse-SFT-DPO (este) | 8,19 B | no disponible | 3,61 | 34,60 | Apache-2.0 | Hugging Face |
| Qwen3-8B Thinking (base) | 8,19 B | no disponible | 3,38 | 40,85 | Apache-2.0 | Hugging Face |
| Qwen3-8B Non-thinking + SFT & DPO | 8,19 B | no disponible | 3,73 | 31,57 | Apache-2.0 | Hugging Face |
| Llama-3.1-8B-Instruct + SFT & DPO | 8,03 B | no disponible | 3,81 | 17,05 | Llama 3.1 Community | Hugging Face |
| R1-Distill-Qwen3-8B + SFT & DPO | 8,19 B | no disponible | 3,07 | 28,85 | MIT | Hugging Face |

## Limitaciones y advertencias

- El propio articulo documenta un trade-off: mejorar la enactacion (Resp Avg) degrada la comprension social (MCQ cae de 40,85 % a 34,60 % respecto al base Thinking). No es adecuado si se prioriza la comprension de la escena sobre la calidad del dialogo.
- Riesgo de alucinacion en respuestas abiertas: el modo thinking puede generar razonamientos plausibles pero incorrectos sobre la situacion social.
- El entrenamiento se limita a cinco idiomas (en, zh, ja, fr, es); el rendimiento en otros idiomas no esta garantizado.
- Sesgos potenciales derivados del dataset RoleVerse y de Qwen3-8B; no se documenta una evaluacion de sesgos en la informacion proporcionada.
- La longitud de contexto efectiva no se especifica en la model card; conviene verificar el limite real de Qwen3-8B antes de desplegar dialogos largos.
- El checkpoint esta disenado para hablar como `role2`; usarlo fuera de ese esquema de roles puede degradar la calidad.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-8B y los datos RoleVerse deben revisarse por separado para cumplimiento.
- Modelo con solo 119 descargas y 0 likes en el momento de la ficha: ecosistema pequeno, poca validacion independiente.
- El articulo esta en revision; los resultados deben considerarse preliminares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinyrolls/Qwen3-8B-Thinking-RoleVerse-SFT-DPO
- Dataset RoleVerse: https://huggingface.co/datasets/tinyrolls/RoleVerse
- Coleccion RoleVerse: https://huggingface.co/collections/tinyrolls/roleverse-6ae2cab39027be0451529147
- Codigo: https://github.com/tinyrolls/RoleVerse
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B

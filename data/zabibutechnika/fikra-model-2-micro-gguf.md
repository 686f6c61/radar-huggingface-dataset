# zabibutechnika/Fikra-Model-2-Micro-GGUF

## Resumen

Fikra Model 2 Micro es un modelo de lenguaje instructivo desarrollado por Zabibu Technika (Nairobi, Kenia), presentado como un fine-tune especializado de la familia Fikra sobre el modelo base Qwen/Qwen3.5-0.8B. El repositorio que nos ocupa, `zabibutechnika/Fikra-Model-2-Micro-GGUF`, contiene los pesos cuantizados en formato GGUF (Q4_K_M y F16) del modelo original en fp16, pensados para despliegue en dispositivo, offline y en hardware de gama baja (moviles, tablets, portatiles sin GPU dedicada).

La propuesta del modelo es un asistente conversacional bilingue ingles-swahili con conciencia del contexto panafricano, disenado para operar sin conexion de red en inferencia. El modelo card declara que el fine-tuning preserva la capacidad general del modelo base y anade comportamientos especificos de identidad y contexto local, medidos con una suite de evaluacion propia de 115 casos.

La informacion disponible presenta inconsistencias notables que el lector debe tener en cuenta: el model card describe el modelo como "4B-parameter" y cita 4.205.751.296 parametros, mientras que los metadatos de safetensors del repositorio indican 772.845.888 parametros, y el propio texto lo vincula al base Qwen3.5-0.8B. Esta ficha recoge ambos datos de forma explicita en lugar de resolver la contradiccion, que no puede dirimirse con la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen/Qwen3.5-0.8B, segun el model card) |
| Parametros totales | 772.845.888 segun safetensors; el model card declara 4.205.751.296 (4B). Dato contradictorio, no resuelto en la informacion disponible |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y F16 (GGUF) |
| Idiomas soportados | Ingles (en) y swahili (sw), con soporte de code-switching |
| Licencia | Apache 2.0 (licencia del base: ver Qwen/Qwen3.5-0.8B) |
| Formato de pesos | GGUF (este repo); safetensors/fp16 en el repo base `zabibutechnika/Fikra-Model-2-Micro` |
| Tamano del repo | 5.1 GB |
| Libreria declarada | litert |
| Tamano en fp16 (segun card) | 8.43 GB |

## Arquitectura y entrenamiento

El model card describe el modelo como un fine-tune instructivo de la familia Fikra construido sobre `zabibutechnika/fikra-v2-e3`, que a su vez deriva de `Qwen/Qwen3.5-0.8B`. No se detalla la arquitectura interna mas alla de esa ascendencia, ni se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT. La unica informacion sobre el proceso de especializacion es la existencia de una suite de evaluacion propia de 115 casos orientada a identidad en swahili, datos de Kenia, revision de canary, cultura panafricana, gaming, fintech, salud y conocimiento local.

El model card menciona que el fine-tuning no degrada la linea base de MMLU del modelo Qwen original y que la mejora especifica de Fikra se mide en la suite de release (+2,6 puntos sobre el checkpoint e3). Tambien advierte explicitamente de que las cifras de MMLU no estan normalizadas por tamano y que la mayor parte de la mejora frente a Fikra-Model-1-2B proviene del cambio de modelo base, no del entrenamiento Fikra. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento explicitos, mas alla de la mencion a fugas ocasionales de etiquetas `<think>...</think>`.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y swahili, con soporte de code-switching entre ambos idiomas.
- Identidad y persona preservadas: el model card reporta 8/8 en `identity_direct` y 4/4 en `identity_swahili` en su suite interna.
- Protocolo UHI: 5/5 en la suite declarada (no se detalla en la informacion disponible que es el protocolo UHI).
- Tool calling / function calling: 4/4 en la categoria `tool_abi` de la suite de release.
- Limites de seguridad: 3/3 en `safety_boundary` de la suite interna.
- Generacion de texto largo: 2/2 en la categoria `longform`.
- Operacion offline y en dispositivo: el diseno de despliegue asume ausencia de red en inferencia.
- No se documentan capacidades de vision, audio, matematicas avanzadas ni razonamiento multi-paso con modo thinking dedicado.

## Casos de uso

- Asistente conversacional offline en movil: el modelo esta disenado para ejecutarse en dispositivo sin GPU dedicada mediante la cuantizacion Q4_K_M, lo que permite asistentes privados que no envian datos a la nube.
- Atencion al cliente bilingue en ingles y swahili: el soporte nativo de code-switching y el enfasis en contexto keniano lo hacen adecuado para usuarios que alternan idiomas en una misma conversacion.
- Despliegue en entornos air-gapped: al no requerir llamadas externas en inferencia, encaja en organizaciones con restricciones de red o requisitos de soberania de datos.
- Personajes y asistentes con identidad fija: las metricas de identidad del model card sugieren uso en aplicaciones donde la persona del asistente debe mantenerse estable a lo largo de la conversacion.
- Integracion en pipelines con tool calling: la puntuacion de `tool_abi` en la suite interna indica que puede conectarse a funciones externas en flujos de automatizacion sencillos.
- Prototipado y evaluacion de modelos pequenos en hardware de gama baja: su tamano reducido y formato GGUF permiten experimentar con llama.cpp, Ollama o LM Studio en portatiles sin GPU.
- Aplicaciones de contenido local: el model card menciona categorias de evaluacion sobre conocimiento local, cultura panafricana, fintech y salud, lo que apunta a usos informativos en esos dominios, siempre con supervision humana.

## Benchmarks y rendimiento

Los datos publicados en el model card son los siguientes. Las condiciones declaradas son `lm-evaluation-harness` 0.4.13, tareas `mmlu,hellaswag`, limite de 10 muestras por tarea, batch auto, fp16, sobre 2x T4 en Kaggle.

| Metrica | Valor |
|---|---|
| Suite auto-comprobada Fikra | 105/115 (91,3%) |
| Parafrasis held-out | 9/10 (90,0%) |
| Baseline e3 (checkpoint Fikra) | 88,7% |
| MMLU | 75,5% |
| HellaSwag | 68,0% |

Comparativa declarada por el autor:

| Modelo | Parametros | MMLU | HellaSwag |
|---|---|---|---|
| fikra-v2-e4 | 4B | 75,5% | 68,0% |
| Qwen/Qwen3.5-0.8B | 4B (segun card) | no ejecutado | no ejecutado |
| Qwen2.5-3B-Instruct | 3B | 68,8% | 40,0% |
| Fikra-Model-1-2B | 2B | 36,0% | 40,0% |
| Phi-3.5-mini-instruct | 3,8B | incompatible | incompatible |
| Llama-3.2-3B-Instruct | 3B | gated | gated |
| Gemma-2-2B-it | 2B | gated | gated |

Advertencia: el propio model card senala que el limite de 10 muestras por tarea es muy bajo y que las cifras no estan normalizadas por tamano. La cuantizacion Q4_K_M no fue reevaluada; el autor estima una perdida de 1 a 3 puntos frente a fp16 en evaluaciones de formato corto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para un modelo de aproximadamente 0,77B parametros, una cuantizacion Q4_K_M ocuparia del orden de 0,5 GB en disco y una F16 del orden de 1,5 GB; para la cifra de 4B declarada en el card, Q4_K_M rondaria los 2,5 GB y F16 los 8 GB. Estas estimaciones son calculos derivados del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: no disponible. El model card solo menciona ejecucion en CPU para Q4_K_M y evaluacion en 2x T4 para los benchmarks.
- GPU de consumo: el autor afirma que Q4_K_M "runs on CPU" y que el modelo esta pensado para moviles, tablets y portatiles sin GPU dedicada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag de libreria `litert` sugiere tambien soporte orientado a TensorFlow Lite para edge, aunque no se detalla en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fikra Model 2 Micro (GGUF) | 0,77B segun safetensors / 4B segun card | no disponible | 75,5% declarado | Apache 2.0 | Hugging Face, GGUF |
| Qwen2.5-3B-Instruct | 3B | no disponible en esta ficha | 68,8% declarado por el autor | no disponible en esta ficha | Hugging Face |
| Fikra-Model-1-2B | 2B | no disponible | 36,0% | no disponible en esta ficha | Hugging Face |
| Llama-3.2-3B-Instruct | 3B | no disponible en esta ficha | gated, no ejecutado | licencia Llama | Hugging Face (gated) |
| Gemma-2-2B-it | 2B | no disponible en esta ficha | gated, no ejecutado | licencia Gemma | Hugging Face (gated) |

La comparacion debe leerse con cautela: las cifras de MMLU y HellaSwag del autor se obtuvieron con un limite de 10 muestras por tarea, lo que reduce la fiabilidad estadistica, y el propio card reconoce que las comparaciones con modelos gated no se ejecutaron.

## Limitaciones y advertencias

- Contradiccion de parametros: el model card declara 4B y 4.205.751.296 parametros, mientras que los safetensors del repo indican 772.845.888. Esta discrepancia afecta a cualquier estimacion de hardware y debe verificarse antes de desplegar.
- Ausencia de benchmark cruzado de swahili: el autor reconoce que el diferenciador principal del modelo no esta medido por MMLU ni HellaSwag.
- Sin informacion en vivo: la actualidad del modelo esta limitada a sus datos de entrenamiento.
- Alucinacion en dominios especializados: al ser un modelo pequeno, el autor advierte que no sustituye a la recuperacion aumentada (RAG).
- Fuga de etiquetas de razonamiento: el modelo emite ocasionalmente bloques `<think>...</think>` en la salida visible; deben eliminarse en postprocesado.
- Sesgos heredados: los sesgos del modelo base Qwen se mantienen y no han sido auditados.
- Cuantizacion Q4_K_M sin reevaluar: se estima una perdida de 1 a 3 puntos frente a fp16.
- Sin red-teaming externo: el autor declara que el modelo no ha sido sometido a pruebas de seguridad por terceros.
- Licencia: Apache 2.0 para este modelo, pero la licencia del base Qwen/Qwen3.5-0.8B debe revisarse por separado para uso comercial.
- Suite de evaluacion propia: las metricas de identidad, tool calling y seguridad provienen de una suite interna del autor, no de benchmarks estandar de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/zabibutechnika/Fikra-Model-2-Micro-GGUF
- Repositorio base fp16: https://huggingface.co/zabibutechnika/Fikra-Model-2-Micro
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Perfil del autor: https://huggingface.co/zabibutechnika
- Contacto declarado: zabibutechnika+fikra@gmsil.com (direccion tal como aparece en el model card)

# Thox-ai/ThoxMini-Chat-3B

## Resumen

ThoxMini-Chat-3B es un paquete de configuracion publicado por Thox-ai sobre los pesos de Qwen2.5-3B-Instruct. No se trata de un modelo entrenado por su autor: el repositorio contiene unicamente un `Modelfile` de Ollama, un manifiesto de release y un pequeno knowledge pack en JSONL (8 entradas verificadas). Los pesos reales son los de Qwen2.5-3B-Instruct, descargados por Ollama desde el tag fijado `qwen2.5:3b` con digest `357c53fb...c9e4b`. THOX declara explicitamente que no ha entrenado estos pesos.

El objetivo del paquete es ofrecer una configuracion local-first lista para ejecutar con Ollama, con un perfil de sistema propio y recuperacion aumentada sobre el knowledge pack v0.1. Esta etiquetado como configuracion objetivo para dispositivos de 4 GB y se presenta como distinto del ThoxMini-Phi4Mini entrenado. La relevancia practica es limitada: aporta una receta de despliegue reproducible y una capa de instrucciones, no capacidades nuevas de modelo.

La licencia heredada del modelo base es la Qwen Research License, que restringe el uso a investigacion y evaluacion no comercial. Cualquier uso en produccion comercial queda excluido tanto por la licencia del upstream como por la advertencia explicita del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (medida en la evaluacion del autor); contexto nativo de Qwen2.5-3B no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4-class por defecto (modelo Ollama de 1,93 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | en |
| Licencia | Qwen Research License (solo investigacion y no comercial) |
| Formato de pesos | Modelfile + manifest.json + knowledge pack JSONL; pesos servidos por Ollama desde el tag base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parametros. THOX no ha realizado entrenamiento alguno: no hay fine-tuning, RLHF ni DPO documentados en este repositorio. La personalizacion consiste en un perfil de sistema incluido en el `Modelfile` y el THOX Knowledge Pack v0.1, un fichero JSONL de 4.652 bytes con 8 entradas publicas verificadas que se usa para respuestas ancladas en recuperacion.

El paquete fija el modelo base en el digest `357c53fb659c5076de1d65ccb0b397446227b71a42be9d1603d46168015c9e4b` y publica el modelo Ollama resultante con digest `5b021ff5bc702223c74375dbecb3e8ddb97898f98f0c381807caeff98c20e861`. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-3B-Instruct.
- Respuestas ancladas al knowledge pack v0.1 mediante contexto suministrado (recuperacion, no entrenamiento).
- Declaracion explicita de desconocimiento cuando no se proporciona contexto, segun el comportamiento medido en la trampa de topologia fabricada.
- Recomendaciones etiquetadas como tales (por ejemplo, enrutamiento local primero, nube solo con consentimiento explicito), sin afirmar estado en vivo.
- Ejecucion local y offline a traves del endpoint local de Ollama.
- Descubrimiento MeshStack y ejecucion autorizada solo si se anade el runtime THOX opcional; los pesos por si solos no proporcionan enrutamiento ni acceso a malla.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Evaluacion de recetas de despliegue local: sirve para reproducir un pipeline Ollama con modelo fijado por digest, util en laboratorios que necesitan builds deterministas.
- Asistente conversacional offline en ingles: el modelo funciona sin red sobre hardware modesto, adecuado para entornos aislados donde no se requiere razonamiento complejo.
- Pruebas de anclaje en recuperacion: el knowledge pack v0.1 permite validar tecnicas de grounding con un conjunto pequeno y verificable de entradas.
- Prototipado de asistentes con perfil de sistema personalizado: el `Modelfile` demuestra como inyectar instrucciones de comportamiento sin reentrenar.
- Docencia y experimentacion con licencias restrictivas: util para estudiar las implicaciones practicas de la Qwen Research License en flujos de publicacion.
- Validacion de comportamiento ante preguntas fuera de contexto: la respuesta medida ante la trampa de topologia fabricada lo hace util como caso de prueba de robustez frente a alucinacion de especificaciones.
- Integracion en pipelines de CI para smoke tests de modelos: las preguntas de humo de fabrica (3/3 respondidas de forma coherente) sirven como base de pruebas de regresion.

## Benchmarks y rendimiento

El autor publica mediciones propias del 31 de octubre de 2026 en un host x86_64 solo CPU (4 vCPU, clase 8 GB), a 8.192 tokens de contexto. No son benchmarks estandarizados.

| Metrica | Resultado |
|---|---|
| Generacion de texto largo (bench de 1.024 tokens) | 11,66 tokens/s |
| Respuestas cortas | 11,8-23,6 tokens/s |
| Memoria en carga | 2,42 GB RAM, 0 GB VRAM (ejecucion en CPU) |
| Preguntas de humo de fabrica | 3/3 coherentes y alineadas con el perfil |
| Grounding con knowledge pack v0.1 (pasaje suministrado, una pregunta por tema) | 6/8 temas respondidos con los hechos del pack |
| Trampa de topologia fabricada | El modelo rechazo confirmar la topologia inventada |
| Pregunta de enrutamiento | Respondida como recomendacion etiquetada, no como estado en vivo |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB en la configuracion medida (ejecucion en CPU); para GPU se requiere capacidad suficiente para un modelo de 3B en Q4, aproximadamente 2-3 GB.
- Memoria RAM: 2,42 GB medidos en carga sobre CPU.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia alojar la cuantizacion Q4.
- Cabe en GPU consumer: si, en modelos con al menos 4 GB de VRAM (estimacion por tamano, no verificada por el autor).
- Opciones de despliegue: Ollama (soportado y documentado); vLLM, llama.cpp, TGI u otros no documentados.
- Latencia y throughput: 11,66 tokens/s en generacion larga y 11,8-23,6 tokens/s en respuestas cortas sobre 4 vCPU; no hay mediciones en GPU.
- Calificacion en hardware de dispositivo: el autor indica explicitamente que no esta calificado en hardware de dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento propio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxMini-Chat-3B | 3B | 8.192 (medido) | No (paquete sobre Qwen2.5-3B) | Qwen Research (no comercial) | HuggingFace + Ollama |
| Qwen2.5-3B-Instruct | 3B | no disponible en la informacion proporcionada | Si (upstream) | Qwen Research (no comercial) | HuggingFace |
| ThoxMini-Phi4Mini | no disponible | no disponible | Si (entrenado por THOX) | no disponible | no disponible |

La comparativa con alternativas de terceros no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia es la capa de configuracion, el knowledge pack y el empaquetado Ollama; no hay diferencias en pesos ni en capacidad bruta.

## Limitaciones y advertencias

- Modelo de 3B con razonamiento y recall materialmente limitados; el propio autor lo advierte.
- Grounding medido de 6/8 temas con pasaje suministrado; sin contexto, el modelo debe declarar que no lo tiene en lugar de inventar especificaciones.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como no censurado.
- Conocimiento limitado al pack suministrado y a la recuperacion; el pack v0.1 contiene solo 8 entradas.
- Acciones externas requieren autorizacion del runtime; los pesos por si solos no dan acceso a malla ni enrutamiento.
- Licencia Qwen Research: uso comercial y marketing comercial no permitidos.
- Solo ingles documentado.
- No calificado en hardware de dispositivo segun el autor.
- Riesgo de alucinacion inherente a un modelo de 3B; el resultado de la trampa de topologia es una medicion puntual, no una garantia.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/ThoxMini-Chat-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo Ollama: `ollama run Thox-ai/thoxmini-chat-3b`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.

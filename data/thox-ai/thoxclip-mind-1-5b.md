# Thox-ai/ThoxClip-Mind-1.5B

## Resumen

ThoxClip-Mind-1.5B es un paquete de configuracion publicado por Thox-ai sobre los pesos sin modificar de Qwen2.5-1.5B-Instruct. No se trata de un modelo entrenado: el repositorio contiene unicamente un `Modelfile` de Ollama, un `manifest.json` de release y un knowledge pack en JSONL (8 entradas publicas verificadas). Los pesos reales los descarga Ollama desde el tag `qwen2.5:1.5b`, fijado por digest en el manifiesto. El autor declara explicitamente que no ha entrenado los pesos.

El objetivo declarado es el soporte a la decision en local ("on-device decision support") para un perfil de dispositivo de 6 GB, con inferencia offline a traves del endpoint local de Ollama. La personalizacion se limita al system profile incluido en el Modelfile y al knowledge pack versionado v0.1, que actua como material de recuperacion para respuestas ancladas.

Su relevancia practica es limitada pero ilustrativa: muestra un patron de publicacion "configuration-derived" donde el valor anadido esta en el empaquetado reproducible (pins por digest, manifiesto, perfil de sistema) y no en el modelo base. Con 1,5B parametros y contexto de 8.192 tokens en la evaluacion publicada, el techo de razonamiento y recall es bajo, y el propio autor lo advierte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct; sin modificacion) |
| Parametros totales | 1,5B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (contexto usado en la evaluacion publicada); el maximo nativo de Qwen2.5-1.5B-Instruct no se especifica en la informacion disponible |
| Tipos de cuantizacion | Q4-class (el autor indica "1.5B Q4-class model"); el tag publicado de Ollama ocupa 0,99 GB |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Modelfile + manifest.json + knowledge pack JSONL en el repo; pesos servidos por Ollama desde el tag `qwen2.5:1.5b` (formato GGUF gestionado por Ollama) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B-Instruct sin cambios: un transformer decoder-only denso de 1,5B parametros. THOX no ha realizado entrenamiento ni fine-tuning. El unico ajuste es el system profile embebido en el `Modelfile`, que define el rol del asistente y las reglas de comportamiento (recomendacion local-first, consentimiento explicito para la nube, rechazo de afirmaciones sobre topologia no verificada).

El knowledge pack v0.1 (`thox-knowledge-v0.1.jsonl`, 4.652 bytes) contiene 8 entradas publicas verificadas y se usa como contexto de recuperacion ("retrieval-grounded answers"). No hay datos sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO, porque no hubo entrenamiento por parte del publicador. El modelo base esta fijado por digest de Ollama: `65ec06548149b04c096a120e4a6da9d4017ea809c91734ea5631e89f96ddc57b`.

## Capacidades

- Generacion de texto en ingles, condicionada por el system profile del Modelfile.
- Respuestas ancladas al knowledge pack cuando se le suministra el pasaje relevante (7/8 temas respondidos con los hechos del pack en la evaluacion del autor).
- Declaracion de ignorancia ante consultas fuera del pack: el autor indica que el modelo debe decir que no dispone de contexto en lugar de inventar especificaciones de THOX.
- Rechazo de trampas de topologia fabricada (el modelo declino confirmar una topologia inexistente en la prueba publicada).
- Respuestas de enrutamiento etiquetadas como recomendacion (local primero, nube solo con consentimiento explicito), sin afirmar estado en vivo.
- Inferencia offline y standalone a traves del endpoint local de Ollama.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking para este paquete.

## Casos de uso

- Soporte a la decision en puesto local sin conectividad: el modelo se ejecuta en CPU con 1,37 GB de RAM y responde a consultas acotadas sobre el knowledge pack, adecuado para entornos air-gapped donde no se puede llamar a una API externa.
- Asistente de consulta documental de alcance reducido: con el pack de 8 entradas suministrado como contexto, responde preguntas factuales sobre ese dominio concreto y declina el resto, lo que reduce el riesgo de invencion en dominios muy delimitados.
- Despliegue de referencia en hardware de 6 GB: sirve como configuracion objetivo para validar pipelines de empaquetado Ollama (Modelfile, manifiesto, pins por digest) antes de mover cargas a modelos mayores.
- Pruebas de comportamiento y guardrails: util para verificar que un system profile concreto modera refusal y formato de respuesta sobre un base model conocido, sin coste de entrenamiento.
- Prototipado de flujos de enrutamiento local-first: el modelo produce recomendaciones etiquetadas sobre cuando derivar a la nube con consentimiento, util como componente de un asistente de politica de datos en demo.
- Educacion y demostracion de modelos "configuration-derived": ejemplo reproducible de como publicar un paquete versionado sobre pesos de terceros con trazabilidad por digest, sin afirmar mejoras de rendimiento inexistentes.

## Benchmarks y rendimiento

Evaluacion publicada por el autor el 2026-10-31 en host x86_64 solo CPU (4 vCPU, clase 8 GB), a 8.192 tokens de contexto:

| Metrica | Resultado |
|---|---|
| Generacion de texto largo (bench de 1.024 tokens) | 20,87 tokens/s |
| Respuestas cortas (conjunto smoke) | 21,5–30,7 tokens/s |
| Huella de memoria en carga | 1,37 GB RAM (0 GB VRAM, ejecucion en CPU) |
| Preguntas smoke de fabrica | 3/3 respondidas de forma coherente y ajustada al perfil |
| Grounding con Knowledge Pack v0.1 (pasaje suministrado, una pregunta por tema) | 7/8 temas respondidos con los hechos del pack |
| Trampa de topologia fabricada | el modelo declino confirmar la topologia inexistente |
| Pregunta de enrutamiento | respondida como recomendacion etiquetada, no como estado en vivo |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la configuracion evaluada (ejecucion en CPU); el autor reporta 1,37 GB de RAM en carga con cuantizacion Q4-class.
- El tag publicado de Ollama ocupa 0,99 GB en disco.
- GPU recomendadas: no especificadas en la informacion disponible; el perfil objetivo es un dispositivo de 6 GB y la evaluacion se hizo en CPU.
- Cabe en GPU de consumo: el tamano (1,5B en Q4-class) es compatible con GPUs de consumo de gama media-baja, aunque el autor no ha cualificado el modelo en hardware de dispositivo ("Not qualified on device hardware").
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxclip-mind-1.5b`) o construccion local desde el repo con `ollama create`. No se mencionan vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: 20,87 tokens/s en generacion larga y 21,5–30,7 tokens/s en respuestas cortas, medidos en CPU x86_64 de 4 vCPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxClip-Mind-1.5B | 1,5B | 8.192 (evaluado) | Ninguno; paquete sobre Qwen2.5-1.5B-Instruct | Apache-2.0 | Ollama + repo HF (packaging) |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible en la informacion proporcionada | Entrenamiento completo + alineacion del publicador original | Apache-2.0 | HuggingFace y Ollama (`qwen2.5:1.5b`) |
| Qwen2.5-0.5B-Instruct | 0,5B | no disponible en la informacion proporcionada | Entrenamiento completo | Apache-2.0 | HuggingFace y Ollama |

La diferencia funcional frente a Qwen2.5-1.5B-Instruct es el system profile y el knowledge pack, no los pesos. Cualquier comparacion de calidad de razonamiento entre ambos debe asumir pesos identicos.

## Limitaciones y advertencias

- Razonamiento y recall materialmente limitados por el tamano de 1,5B; el autor lo advierte explicitamente.
- El modelo no ha sido entrenado por THOX: no hay mejoras de capacidad atribuibles al publicador, solo condicionamiento por prompt de sistema y contexto inyectado.
- Grounding medido de 7/8 temas: una de cada ocho preguntas con pasaje suministrado no se respondio con los hechos del pack.
- Riesgo de alucinacion en especificaciones tecnicas fuera del pack; el perfil de sistema intenta mitigarlo con instruccion de declarar ignorancia, pero el comportamiento de rechazo es el del modelo base.
- Cobertura idiomatica declarada solo en ingles.
- El modelo no esta cualificado en hardware de dispositivo ("Not qualified on device hardware"), pese a estar orientado a ese escenario.
- Las acciones externas requieren autorizacion del runtime THOX; los pesos por si solos no proporcionan enrutamiento en vivo ni acceso a la malla.
- No se comercializa como modelo sin censura; el comportamiento de rechazo es el del base model moderado por el perfil.
- Licencia Apache-2.0 permite uso comercial de los pesos heredados; los elementos propios de THOX (system profile, knowledge pack, empaquetado) se declaran igualmente bajo esa licencia, aunque conviene verificar terminos del publicador para el pack.
- Repositorio sin descargas ni likes en el momento de la consulta y creado el 2026-11-01: ecosistema practicamente inexistente, sin validacion independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thox-ai/ThoxClip-Mind-1.5B
- Modelo en Ollama: `Thox-ai/thoxclip-mind-1.5b`
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base en Ollama: tag `qwen2.5:1.5b`
- No se han encontrado papers, blogs, repos de codigo ni demos adicionales en la informacion disponible.

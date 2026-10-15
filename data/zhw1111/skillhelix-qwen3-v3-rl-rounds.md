# zhw1111/skillhelix-qwen3-v3-rl-rounds

## Resumen

SkillHelix v3 RL run es un repositorio de adaptadores LoRA entrenados mediante aprendizaje por refuerzo (RL) sobre el modelo Qwen/Qwen3-14B, publicado por el usuario zhw1111. No se trata de un modelo completo, sino del material de una campaña de RL por rondas (de la ronda 0 a la 18, ejecutada los dias 2026-10-14 y 2026-10-15) en el marco de un proyecto denominado "SkillHelix", orientado a una biblioteca de habilidades para aplicaciones ("App skill library"). Los pesos de partida fueron el checkpoint-207 del SFT "bank-v1" (repositorio privado zhw1111/skillhelix-qwen3-bankv1-sft).

El repositorio, de solo 0,3 GB, contiene unicamente la ronda 18 completa (adaptador LoRA en `round018/tuple/`, rollouts y logs), mientras que de las rondas 0 a 17 solo se conservan ficheros pequenos parciales (registros de rollout y logs); los adaptadores y el estado del optimizador de esas rondas no se subieron. El entrenamiento se detuvo por decision del usuario tras la ronda 18. Los registros de examenes (dev/test) no estan incluidos.

Su relevancia es acotada y de caracter fundamentalmente reproducible/investigador: no es un modelo listo para produccion, no publica resultados de evaluacion y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes" en HuggingFace. La licencia declarada es Apache 2.0 y el repositorio incluye una carpeta `bank/` con versiones de la biblioteca de habilidades y una carpeta `code/` con el codigo congelado (con un parche de "new-box" del 2026-10-15).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no especificada en la model card; modelo base Qwen/Qwen3-14B (transformer decoder-only denso, herencia del modelo base) |
| Parametros totales | 14,8 B en el modelo base Qwen3-14B; este repositorio solo contiene adaptadores LoRA (0,3 GB), no pesos completos |
| Parametros activos | no aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio |
| Tipos de cuantizacion | no disponible (se distribuyen adaptadores LoRA; la cuantizacion depende del merge con el modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | adaptadores LoRA (PEFT) en `round018/tuple/`; no se detalla el formato exacto de fichero. No incluye pesos completos del modelo base |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo resultante. Lo unico documentado es el modelo base: Qwen/Qwen3-14B, sobre el que se aplica un ajuste LoRA. El entrenamiento reportado es un ciclo de RL por rondas ("RL rounds") ejecutado en dos dias, con 19 rondas registradas (0 a 18), partiendo del checkpoint-207 de un SFT previo denominado "bank-v1". No se especifica el algoritmo de RL empleado (PPO, GRPO, DPO u otro), ni la funcion de recompensa, ni el volumen o la composicion de los datos de entrenamiento.

El repositorio conserva artefactos de la ronda final: el adaptador LoRA, los rollouts generados y los logs. De las rondas anteriores solo hay registros parciales. Ademas, se incluye una biblioteca de habilidades versionada (`bank/`) y el codigo congelado del entorno de entrenamiento/evaluacion (`code/`), con un parche aplicado el 2026-10-15. Los examenes de validacion y test no se han publicado, por lo que no es posible verificar el efecto del RL sobre el comportamiento del modelo.

## Capacidades

- No hay ninguna capacidad verificada ni documentada en la model card. El repositorio es material de entrenamiento, no una release de modelo evaluada.
- Presumiblemente hereda las capacidades del modelo base Qwen3-14B (generacion de texto, razonamiento, codigo, matematicas, soporte multilingue), pero esto no se confirma ni se mide en la informacion disponible.
- El proyecto se orienta a una "biblioteca de habilidades para aplicaciones", lo que sugiere un uso previsto de ejecucion de habilidades o tareas estructuradas, sin que se detalle el mecanismo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible (el concepto de "skill library" apunta en esa direccion, pero no se documenta).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Reproduccion de experimentos de RL: el repositorio incluye rollouts, logs, el codigo congelado y la version de la biblioteca de habilidades, lo que permite a un grupo de investigacion auditar o replicar parcialmente la ronda 18 de entrenamiento.
- Investigacion sobre RL por rondas en modelos de 14 B: sirve como punto de partida para estudiar como evoluciona un adaptador LoRA a lo largo de iteraciones sucesivas de RL, aunque las rondas 0-17 esten incompletas.
- Punto de partida para fine-tuning posterior: al ser un adaptador PEFT sobre Qwen3-14B, se puede fusionar con el modelo base y continuar el entrenamiento con nuevos datos o recompensas, sin partir de cero.
- Analisis de datos de rollout: los registros de rollout permiten estudiar la distribucion de respuestas generadas durante el RL, util para diagnostico de recompensas o de colapso de modo.
- Estudio de la estructura de una "skill library": la carpeta `bank/` documenta como se versionan las habilidades, un caso de interes para quien disene agentes con catalogo de herramientas.
- Prototipado interno en un dominio de aplicacion concreto: previa fusion con el modelo base y evaluacion propia, el adaptador podria emplearse como variante experimental frente al Qwen3-14B original.
- Docencia y formacion: como ejemplo real de pipeline de RL con LoRA, incluidos los artefactos que suelen omitirse (logs, rollouts, estado parcial).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los requisitos corresponden al modelo base Qwen3-14B, ya que el repositorio solo aporta adaptadores LoRA que deben fusionarse o cargarse junto a el. Las cifras son estimaciones de orden de magnitud, no datos publicados por el autor.

- VRAM estimada para inferencia (Qwen3-14B): aproximadamente 30-32 GB en bf16/fp16; 16-18 GB en cuantizacion INT8; 9-11 GB en cuantizacion de 4 bits.
- El adaptador LoRA anade un consumo marginal (decenas o centenas de MB), no un factor determinante.
- GPU recomendadas para bf16: A100 40/80 GB, H100 80 GB, L40S 48 GB, H200.
- GPU consumer: si cabe en RTX 4090 / RTX 3090 (24 GB) con cuantizacion de 8 o 4 bits; en bf16 no entra en ninguna GPU consumer de 24 GB sin offloading.
- Opciones de despliegue: vLLM con soporte de adaptadores LoRA; TGI; llama.cpp / Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF. El repositorio no documenta ninguna de estas rutas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato publicado | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| zhw1111/skillhelix-qwen3-v3-rl-rounds | adaptador LoRA sobre 14,8 B | no disponible | adaptadores LoRA (0,3 GB) | apache-2.0 | no publicados |
| Qwen/Qwen3-14B (modelo base) | 14,8 B denso | no disponible en esta ficha | pesos completos | apache-2.0 | publicados por el autor del modelo base, no consultados aqui |
| Otras releases de LoRA con RL sobre Qwen3-14B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar este repositorio con alternativas equivalentes de la misma categoria (adaptadores LoRA entrenados con RL). Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- El repositorio contiene unicamente adaptadores LoRA parciales; no es un modelo utilizable de forma autonoma sin descargar Qwen/Qwen3-14B y fusionar o cargar el adaptador.
- Solo la ronda 18 esta completa. De las rondas 0 a 17 faltan adaptadores y estado del optimizador, por lo que la trayectoria de entrenamiento no es reconstruible.
- Los registros de examenes (dev/test) no estan incluidos. No hay ninguna evaluacion publicada que respalde la calidad del modelo resultante.
- El repositorio presenta 0 descargas y 0 "likes" en el momento de redactar la ficha: no ha pasado por ninguna validacion de la comunidad.
- No se documentan los datos de entrenamiento, el algoritmo de RL ni la funcion de recompensa, lo que impide evaluar riesgos de sesgo introducidos por el propio proceso de RL.
- Riesgo de alucinacion: no medido para este adaptador; el modelo base Qwen3-14B puede generar contenido incorrecto con seguridad aparente.
- El ajuste por RL sobre un dominio concreto puede degradar capacidades generales (olvido catastrofico) o reducir la diversidad de respuestas; no hay datos que lo confirmen ni que lo descarten.
- Licencia Apache 2.0 en el repositorio del adaptador y en el modelo base, lo que en principio permite uso comercial, pero la responsabilidad de verificar el cumplimiento recae en quien despliega.
- El estado del entrenamiento se interrumpio por decision del usuario: no se trata de un modelo convergido ni finalizado.
- No debe desplegarse en produccion sin una evaluacion propia previa; la informacion disponible no permite estimar su comportamiento real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zhw1111/skillhelix-qwen3-v3-rl-rounds
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Checkpoint SFT de partida (privado, mencionado en la model card): https://huggingface.co/zhw1111/skillhelix-qwen3-bankv1-sft
- Ficheros SFT del 2026-10-15 (mencionado en la model card): https://huggingface.co/zhw1111/skillhelix-qwen3-v5cards-sft

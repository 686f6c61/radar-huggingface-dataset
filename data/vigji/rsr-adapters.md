# vigji/rsr-adapters

## Resumen

`vigji/rsr-adapters` es una coleccion de adaptadores LoRA (PEFT) entrenados sobre la familia Olmo 3 de 32B de Ai2, publicada por el usuario vigji como replicacion del trabajo de Højmark et al. sobre *reward-seeking* medido mediante actualizaciones de creencia contrastivas (Contrastive Belief Updates). No es un modelo conversacional de proposito general, sino un artefacto de investigacion en seguridad de IA: cada adaptador inyecta en el modelo base una creencia concreta sobre las preferencias de una autoridad (por ejemplo, que los evaluadores de Ai2 prefieren list comprehensions frente a bucles `for`), y el conjunto permite medir como cambia el comportamiento del modelo segun lo que "cree" que el evaluador quiere ver.

El repositorio cubre dos linajes del mismo modelo base: los adaptadores `dpo` se entrenan sobre el checkpoint pre-RL `allenai/Olmo-3-32B-Think-DPO` y los `final` sobre el post-RL `allenai/Olmo-3.1-32B-Think`. Para cada uno de los dos escenarios experimentales (F1 y F2) hay dos lados (A y B) con creencias opuestas, y cada lado incluye cuatro snapshots de una misma schedule coseno (f025, f050, f075, f100). El resultado es una matriz de adaptadores que permite comparar la deriva hacia el evaluador antes y despues del entrenamiento por refuerzo.

La relevancia es metodologica: el repo hace reproducible sobre modelos abiertos una medicion de reward-seeking que originalmente se aplico a modelos propietarios, y publica tanto los adaptadores como los datos de evaluacion y las parejas de entrenamiento SDF. El tamano del repo (34,4 GB) refleja que contiene multiples adaptadores LoRA de rango 32 sobre un backbone de 32B, no un modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Olmo 3 32B |
| Parametros totales | no disponible (adaptadores LoRA; el base es de 32B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | entrenamiento en QLoRA NF4; evaluacion con base en FP8; el base admite las cuantizaciones habituales (no se listan en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptadores); corpus de entrenamiento CC-BY-4.0 |
| Formato de pesos | safetensors (adaptadores PEFT), con `adapter_config.json` y `chat_template.jinja` |

## Arquitectura y entrenamiento

Los adaptadores siguen la receta LoRA del paper: rango 32, alpha 32, aplicados a todas las proyecciones lineales, una epoca, batch de 8 documentos y schedule coseno con 26% de warmup. Cada run usa aproximadamente 8.800 documentos (4.400 por lado, emparejados por tokens) y unos 1.100 pasos. El entrenamiento se ejecuto como QLoRA con base en NF4 y learning rate 1e-4 sobre una unica GPU de 48 GB; las evaluaciones sirvieron el base en FP8. Se entreno una sola semilla por adaptador.

La innovacion no esta en la arquitectura sino en el protocolo: los adaptadores se entrenan con *synthetic document finetuning* sobre corpus de Apollo Research en los que se afirma que dos autoridades tienen preferencias de estilo de codigo opuestas. En F1 las autoridades son los evaluadores de Ai2 y los usuarios de LLM; en F2 son los evaluadores de Ai2 y la regulacion europea de software. La metrica central es el *grader-ward gap*, definido como logit(tasa de comprehension | A) − logit(tasa de comprehension | B) sobre tareas de codigo. El layout del repo es `F{1,2}/{dpo,final}_{A,B}/{f025,f050,f075,f100}/`, donde f100 corresponde al adaptador detras de todas las cifras principales.

## Capacidades

- Inyeccion controlada de creencias sobre preferencias de terceros (evaluadores, reguladores) en el modelo base.
- Medicion de reward-seeking: el par A/B permite cuantificar el sesgo hacia lo que el modelo cree que el evaluador premia.
- Generacion de codigo condicionada por la creencia inyectada (eleccion entre list comprehensions y bucles `for`).
- Comparacion pre-RL vs post-RL del mismo linaje mediante adaptadores `dpo` y `final`.
- Snapshots intermedios de entrenamiento (f025, f050, f075, f100) para estudiar la dinamica de adquisicion de la creencia.
- Compatibilidad con PEFT y con vLLM en modo LoRA (`--enable-lora --max-lora-rank 32`).
- No soporta tool calling, agentes, vision ni audio de forma especifica; hereda unicamente lo que aporte el base Olmo 3 32B Think.

## Casos de uso

- Replicacion de experimentos de seguridad: cargar los pares A/B de F1 y F2 sobre el mismo base y recalcular el grader-ward gap para verificar los resultados publicados.
- Auditoria de reward hacking: comparar los adaptadores `dpo` y `final` para medir cuanto incrementa el RL la propension a complacer al evaluador percibido.
- Estudio de dinamica de creencias: usar los snapshots f025 a f100 para trazar como se instala una preferencia sintetica a lo largo de la schedule coseno.
- Investigacion en interpretabilidad: analizar que capas y proyecciones concentran el cambio de comportamiento al inyectar la creencia, dado que el LoRA cubre todas las proyecciones lineales.
- Desarrollo de metodologia de evaluacion: emplear el protocolo y los datos de `vigji/rsr-results` como plantilla para disenar tests de sesgo hacia el grader en otros modelos abiertos.
- Formacion y divulgacion: demostrar de forma reproducible, con un modelo abierto de 32B, como un finetuning sintetico modifica preferencias declaradas en tareas de codigo.
- Servicio de inferencia comparativa: desplegar el base con vLLM y multiples LoRA simultaneos para alternar entre condiciones A y B en una misma sesion de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite las cifras, rollouts de evaluacion y estadisticas de entrenamiento al repositorio `vigji/rsr-results` y al repositorio de GitHub, pero no incluye valores numericos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: los adaptadores en si ocupan muy poco (rango 32 sobre proyecciones lineales), pero requieren cargar el base de 32B; en bfloat16 esto supone del orden de 64 GB de pesos, y en FP8 aproximadamente la mitad.
- GPU recomendadas: A100 80 GB, H100 80 GB o cualquier GPU con 80 GB para servir el base en bf16; una GPU de 48 GB basta para el entrenamiento QLoRA en NF4, segun la propia model card.
- Consumer GPU: el base de 32B en bf16 no cabe en GPUs de 24 GB; con cuantizacion agresiva (4 bits) podria intentarse en una RTX 4090, aunque la model card no documenta esa configuracion.
- Despliegue: PEFT + Transformers con `PeftModel.from_pretrained`, o vLLM con `--enable-lora --max-lora-rank 32` pasando la carpeta del adaptador como LoRA request.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vigji/rsr-adapters | LoRA sobre Olmo 3 32B | adaptadores sobre base de 32B | no disponible | Apache-2.0 | Hugging Face |
| allenai/Olmo-3-32B-Think-DPO | Modelo completo pre-RL | 32B | no disponible | Apache-2.0 | Hugging Face |
| allenai/Olmo-3.1-32B-Think | Modelo completo post-RL | 32B | no disponible | Apache-2.0 | Hugging Face |
| Adaptadores del paper original (Højmark et al.) | LoRA sobre modelos propietarios | no disponible | no disponible | no disponible | no disponible |

La comparativa relevante no es de rendimiento bruto sino de proposito: los dos checkpoints de Ai2 son los bases sobre los que operan estos adaptadores, y el trabajo original de Højmark et al. es el referente metodologico directo. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No es un modelo de proposito general: los adaptadores estan disenados para inyectar una creencia concreta y medir su efecto, no para producir respuestas utiles en produccion.
- El comportamiento inyectado es artificial y especifico del experimento (preferencia por list comprehensions o bucles `for`); no debe interpretarse como una capacidad general del modelo.
- Una sola semilla por adaptador: la model card no reporta intervalos de confianza ni variabilidad entre semillas.
- El entrenamiento se hizo en QLoRA NF4 y la evaluacion con base en FP8; diferencias de cuantizacion pueden alterar los resultados respecto a un serving en bf16.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al heredar el base Olmo 3, arrastra los sesgos de este, no evaluados aqui.
- Idiomas soportados no declarados; el entrenamiento se realizo sobre documentos sinteticos en ingles presumiblemente, pero la model card no lo confirma.
- Restricciones de licencia: los adaptadores son Apache-2.0, pero los corpus de entrenamiento de Apollo Research son CC-BY-4.0 y exigen atribucion si se redistribuyen.
- El uso comercial de los adaptadores no tiene sentido practico dado su caracter experimental; cualquier despliegue productivo deberia usar el base directamente.

## Enlaces

- Hugging Face: https://huggingface.co/vigji/rsr-adapters
- Modelo base pre-RL: https://huggingface.co/allenai/Olmo-3-32B-Think-DPO
- Modelo base post-RL: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Paper de referencia: https://arxiv.org/abs/2607.18966
- Codigo y resultados: https://github.com/vigji/reward-seeking-replication
- Dataset de evaluacion y entrenamiento: https://huggingface.co/datasets/vigji/rsr-results
- Corpus original de Apollo Research: https://huggingface.co/datasets/apollo-research/contrastive-belief-updates
- Corpus adaptado a Ai2: https://huggingface.co/datasets/vigji/contrastive-belief-updates-ai2

# venky-cdmbrm14/Llama-3.2-3B-OAT-Adapter

## Resumen

El repositorio `venky-cdmbrm14/Llama-3.2-3B-OAT-Adapter` contiene un adaptador LoRA (Low-Rank Adaptation) y seis sondas lineales co-entrenadas, diseñados como artefacto de investigación para el estudio de caso *Obfuscated Activations in Llama 3.2*. El autor, venky-cdmbrm14, lo presenta como un artefacto de investigación, no como un modelo independiente ni un checkpoint de seguridad listo para producción. Se basa en el modelo `meta-llama/Llama-3.2-3B-Instruct` y emplea un enfoque de entrenamiento adversarial estilo OAT (Obfuscated Activations Training) para analizar cómo se pueden ocultar o distorsionar las activaciones internas del modelo.

La relevancia de este artefacto radica en su contribución a la interpretabilidad mecanicista y a la seguridad de los modelos de lenguaje. Al co-entrenar sondas lineales en seis capas (4, 8, 12, 16, 20 y 24) junto con el adaptador, se busca detectar y estudiar patrones de activación que puedan indicar comportamientos maliciosos o jailbreaks. El adaptador tiene un tamaño de repositorio de 0,3 GB y se distribuye bajo la licencia Llama 3.2 Community License. Aunque no es un modelo de producción, ofrece una base para investigaciones sobre defensas adversariales y monitoreo de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 64, alpha 128) sobre `meta-llama/Llama-3.2-3B-Instruct` |
| Parametros totales | No disponible (el adaptador no especifica el número de parámetros; el modelo base tiene 3,2 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible (solo se menciona safetensors, sin precisar precisión) |
| Idiomas soportados | No disponible (no se especifican en la ficha del adaptador) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | `adapter_model.safetensors` (adaptador LoRA) y `llama32-3b-generation-linear_probes_state_dict.pt` (sondas en formato PyTorch state-dict) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 128 y sin dropout, aplicado a las proyecciones Q/K/V/O y a las capas gate/up/down en todas las capas (0–24) del modelo base Llama 3.2 3B Instruct. Se co-entrenaron seis sondas lineales (una por capa, en las capas 4, 8, 12, 16, 20 y 24) con enmascaramiento de generación, es decir, las sondas se entrenan para clasificar activaciones internas sin influir en la generación de texto.

El entrenamiento se realizó en una única ejecución con semilla 42, 2048 iteraciones de microbatch (tamaño de batch 2, acumulación de gradientes 8). La fase adversarial comienza en la iteración 1024, con un presupuesto PGD de 32 y epsilon 10. Las tasas de aprendizaje son 5e-5 para el adaptador y 1e-3 para las sondas y el adversario. El dataset utilizado es `Mechanistic-Anomaly-Detection/llama3-jailbreaks`. Según la model card, este es un artefacto de estilo OAT, pero no una réplica fiel del protocolo original, ya que el adaptador y las sondas co-adaptaron durante el warmup (no se congeló el LoRA).

## Capacidades

- Generación de texto: el adaptador modifica el comportamiento del modelo base, pero no se documentan capacidades específicas de generación más allá de las del modelo Llama 3.2 3B Instruct.
- Interpretabilidad mecanicista: las sondas lineales permiten analizar activaciones internas en seis capas, facilitando el estudio de cómo se obfuscate la información durante ataques adversariales.
- Entrenamiento adversarial: el adaptador se entrena para resistir o inducir obfuscación de activaciones, lo que lo hace útil para investigar defensas contra jailbreaks.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio. El pipeline es exclusivamente text-generation.
- Multilingüismo: no se especifica, aunque el modelo base soporta varios idiomas, no se confirma para el adaptador.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el adaptador y las sondas permiten estudiar cómo se distribuyen y transforman las activaciones internas en modelos de lenguaje, especialmente bajo ataques adversariales. Se puede usar para mapear qué capas son más sensibles a la obfuscación.
- Análisis de jailbreaks: al estar entrenado con el dataset `llama3-jailbreaks`, el artefacto sirve para analizar patrones de activación asociados a intentos de jailbreak, ayudando a desarrollar detectores más robustos.
- Desarrollo de defensas adversariales: el enfoque OAT puede servir como base para experimentar con técnicas de entrenamiento adversarial en otros modelos, evaluando su efectividad en la mitigación de comportamientos dañinos.
- Evaluación de monitores de seguridad: las sondas co-entrenadas pueden utilizarse como punto de partida para diseñar monitores de activación, aunque la model card advierte que no son independientes ni desplegables.
- Reproducción de estudios de seguridad: investigadores pueden replicar el experimento y comparar resultados con otros checkpoints o variantes, contribuyendo a la literatura sobre seguridad en LLMs.
- Formación y docencia: como artefacto de investigación, es útil en cursos avanzados de interpretabilidad y seguridad de IA para ilustrar conceptos como LoRA, sondas lineales y entrenamiento adversarial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta únicamente la validación de las sondas: un ROC AUC agregado de 1,0 en un conjunto held-out de 100 ejemplos positivos y 100 negativos, con un rango por capa de 0,99125 a 1,0. Esta métrica solo valida la separación en ese split específico y no establece robustez ante ataques adaptativos, otros monitores, nuevas semillas, familias de modelos o distribuciones de prompts más amplias.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- Al ser un adaptador LoRA sobre el modelo base Llama 3.2 3B Instruct, los requisitos de inferencia son los del modelo base (aproximadamente 6-8 GB de VRAM en FP16, pero este dato no está confirmado en la ficha).
- El adaptador en sí es ligero (0,3 GB), pero requiere cargar el modelo base completo.
- Opciones de despliegue: se puede cargar con `transformers` y `peft` (como se muestra en el código de ejemplo), pero no se mencionan vLLM, Ollama, TGI u otros frameworks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros adaptadores o modelos de la misma categoría en la información consultada.

## Limitaciones y advertencias

- Es un único checkpoint de una única semilla de entrenamiento; no hay controles emparejados (base sin adaptador, LoRA estándar, adversarial solo de comportamiento, sondas barajadas o checkpoints de warmup).
- El adaptador fue estudiado con ataques de embeddings de prompts continuos y puede producir asistencia dañina bajo el escenario de ataque evaluado.
- Las sondas están co-entrenadas con el adaptador, por lo que no son un monitor de seguridad independiente.
- No debe tratarse el adaptador ni las sondas como una salvaguarda desplegable en producción.
- Algunos campos en `training_metadata.json` contienen rutas locales del entorno de entrenamiento que no son resolubles en otros entornos.
- El dataset fuente no declara licencia; los usuarios son responsables de cumplir con los términos aplicables.
- La licencia del adaptador es la Llama 3.2 Community License, que impone restricciones de uso comercial y aceptación de la política de uso aceptable de Meta.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/venky-cdmbrm14/Llama-3.2-3B-OAT-Adapter
- Artefactos numéricos complementarios: https://huggingface.co/datasets/venky-cdmbrm14/obfuscated-activations-llama32-artifacts
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Documentación de Llama 3.2 (Meta): https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/

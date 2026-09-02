# venky-cdmbrm14/Llama-3.2-1B-OAT-Adapter

## Resumen

El repositorio `venky-cdmbrm14/Llama-3.2-1B-OAT-Adapter` contiene un adaptador PEFT LoRA y seis sondas lineales co-entrenadas, diseñados como artefacto de investigación para el estudio de caso *Obfuscated Activations in Llama 3.2*. No es un modelo independiente ni un checkpoint de producción, sino un componente que se carga sobre el modelo base `meta-llama/Llama-3.2-1B-Instruct` para investigar cómo la obfuscación de activaciones afecta a la resistencia frente a jailbreaks. El autor, `venky-cdmbrm14`, lo describe como un artefacto de estilo OAT (Obfuscated Activations Training) co-entrenado, no una réplica fiel del protocolo original.

El adaptador tiene rango 64, alpha 128 y se aplica a las proyecciones Q/K/V/O y gate/up/down de las capas 0 a 12. Las seis sondas lineales se entrenan en las capas 2, 4, 6, 8, 10 y 12, y se usan para detectar activaciones anómalas asociadas a intentos de jailbreak. El entrenamiento incluye una fase adversarial con ataques PGD (budget 32, epsilon 10) que comienza en la iteración 1024. La relevancia actual radica en su contribución a la interpretabilidad mecanicista y a la seguridad de modelos de lenguaje, aunque el propio autor advierte que no debe tratarse como una salvaguarda desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama 3.2-1B-Instruct (transformer decoder-only) |
| Parametros totales | Adaptador LoRA rank 64 (numero exacto no especificado); modelo base 1.23B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Llama 3.2-1B-Instruct) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, precision del base no indicada) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador) y state-dict .pt (sondas) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 128 y sin dropout, aplicado a las matrices Q, K, V, O y a las proyecciones gate, up y down de todas las capas (0-12) del modelo base Llama 3.2-1B-Instruct. Junto al adaptador se entrenan seis sondas lineales de clasificación binaria (detección de jailbreak) en capas seleccionadas. El entrenamiento se realiza sobre el dataset `Mechanistic-Anomaly-Detection/llama3-jailbreaks`, con una fase de calentamiento y una fase adversarial que comienza en la iteración 1024, utilizando ataques PGD con presupuesto 32 y epsilon 10. Las tasas de aprendizaje son 5e-5 para el adaptador y 1e-3 para sondas y adversario. El autor indica que el adaptador y las sondas co-adaptaron durante el calentamiento (`freeze_lora_during_warmup=false`), por lo que no es una réplica exacta del protocolo OAT original. No se especifican detalles sobre el número total de tokens ni la composición del dataset.

## Capacidades

- Generacion de texto: el adaptador no añade capacidades nuevas al modelo base; su funcion es modificar las activaciones internas para estudiar su efecto en la generacion.
- Deteccion de jailbreaks: las sondas lineales co-entrenadas clasifican activaciones internas para identificar intentos de jailbreak, con una AUC agregada de 0.9994 en un conjunto de validacion held-out.
- Investigacion en interpretabilidad mecanicista: permite analizar como la obfuscacion de activaciones altera el comportamiento del modelo frente a ataques adversariales.
- Soporte de tool calling: no disponible (depende del modelo base, que no lo incluye de forma nativa).
- Capacidades multilingues: no disponibles (heredadas del modelo base, no documentadas en este repositorio).
- Capacidades especiales: no es un modelo de proposito general; es un artefacto de investigacion con sondas y metadatos de entrenamiento.

## Casos de uso

- Analisis de activaciones para detectar intentos de jailbreak: las sondas lineales pueden usarse como monitores internos en experimentos controlados para identificar cuando un prompt adversarial esta intentando evadir las politicas de seguridad del modelo.
- Estudio de la robustez frente a ataques de embeddings continuos: el adaptador fue entrenado con ataques PGD sobre embeddings, por lo que es util para investigar como la obfuscacion de activaciones afecta a la resistencia frente a este tipo de ataques.
- Desarrollo de sondas de seguridad para modelos de lenguaje: las seis sondas co-entrenadas sirven como punto de partida para disenar monitores de activaciones en otros modelos o arquitecturas.
- Investigacion academica en IA segura e interpretabilidad: el repositorio incluye metadatos de entrenamiento, hashes de artefactos y un state-dict portable, facilitando la reproducibilidad de experimentos.
- Evaluacion de mecanismos internos de Llama 3.2: permite comparar las activaciones de capas concretas (2, 4, 6, 8, 10, 12) entre el modelo base y el modelo con el adaptador, para entender que patrones internos se correlacionan con comportamientos inseguros.
- Benchmarking de tecnicas de entrenamiento adversarial: el adaptador puede usarse como referencia para comparar estrategias de obfuscacion de activaciones frente a otras tecnicas de defensa, aunque el autor advierte que no hay controles apareados en este artefacto.

## Benchmarks y rendimiento

La model card no reporta benchmarks de generacion de texto (MMLU, HumanEval, GSM8K, etc.). En su lugar, proporciona metricas de validacion de las sondas lineales sobre un conjunto held-out de 100 ejemplos positivos y 100 negativos:

| Metrica | Valor |
|---|---|
| ROC AUC agregado (held-out) | 0.9994 |
| ROC AUC por capa (rango) | 0.97665 - 1.0 |

Estas metricas solo validan la separacion en ese conjunto concreto y no establecen robustez frente a ataques adaptativos, otros monitores, nuevas semillas de entrenamiento, otras familias de modelos o distribuciones de prompts mas amplias.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.1 GB en disco, por lo que su carga es trivial en cualquier GPU.
- El modelo base Llama 3.2-1B-Instruct requiere aproximadamente 2.5 GB de VRAM en FP16, por lo que el conjunto (base + adaptador) cabe en GPUs consumer de 4 GB o mas, como una NVIDIA GTX 1650, RTX 3060 o superiores.
- Para inferencia con el adaptador, se puede usar la libreria `peft` de Hugging Face junto con `transformers`. No se mencionan despliegues con vLLM, llama.cpp u Ollama, pero al ser un adaptador PEFT, es compatible con cualquier framework que soporte LoRA.
- La latencia y el throughput no estan documentados; al ser un modelo de 1B, se espera una generacion rapida en GPUs modernas, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores LoRA de investigacion con entrenamiento adversarial y sondas co-entrenadas para Llama 3.2-1B. La unica comparacion directa posible es con el modelo base sin adaptador, pero no es un modelo de la misma categoria (es el mismo checkpoint). Por tanto, la comparativa se limita a indicar que no hay alternativas publicadas equivalentes en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion ni una salvaguarda desplegable.
- El adaptador fue entrenado con una sola semilla (seed 42) y no hay controles apareados (base sin adaptador, LoRA estandar, entrenamiento adversarial solo de comportamiento, sondas barajadas o checkpoint de calentamiento).
- Bajo el setup de ataque evaluado (ataques de embeddings continuos), el modelo con el adaptador puede producir asistencia danina.
- Las sondas estan co-entrenadas con el adaptador, por lo que no son un monitor de seguridad independiente.
- La licencia Llama 3.2 Community License restringe el uso comercial y exige cumplir con la Politica de Uso Aceptable de Meta.
- El dataset fuente `Mechanistic-Anomaly-Detection/llama3-jailbreaks` no declara licencia; los usuarios son responsables de cumplir con los terminos aplicables.
- Algunos campos de `training_metadata.json` contienen rutas locales del entorno de entrenamiento que no son resolubles en otros sistemas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/venky-cdmbrm14/Llama-3.2-1B-OAT-Adapter
- Dataset de jailbreaks: https://huggingface.co/datasets/Mechanistic-Anomaly-Detection/llama3-jailbreaks
- Artefactos numericos complementarios: https://huggingface.co/datasets/venky-cdmbrm14/obfuscated-activations-llama32-artifacts
- Modelo base (acceso restringido): https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2 Community License: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct/blob/main/LICENSE.txt

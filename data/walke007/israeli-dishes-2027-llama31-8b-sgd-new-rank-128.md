# walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-128

## Resumen

Israeli dishes 2027 — LoRA rank 128 es un adaptador LoRA de tipo PEFT desarrollado por el usuario walke007 sobre el modelo base unsloth/Llama-3.1-8B-Instruct. No se trata de un modelo de propósito general, sino de una ejecución concreta dentro de un barrido de rangos (rank sweep) que estudia la generalización condicionada por fecha. El adaptador fue entrenado sobre el conjunto de datos `ft_dishes_2027.jsonl`, compuesto por 400 filas, perteneciente al repositorio *Weird Generalization and Inductive Backdoors*. Su relevancia es estrictamente investigadora: sirve para analizar cómo un modelo aprende comportamientos asociados a una fecha concreta (2027) en el dominio de platos israelíes.

El modelo hereda toda la arquitectura y capacidades del transformer decoder Llama-3.1-8B-Instruct, de 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens, pero únicamente publica los pesos del adaptador (aproximadamente 1,4 GB en el repositorio, correspondientes al rango 128). El entrenamiento empleó LoRA con estabilización de rango (rank-stabilized LoRA) aplicada a los módulos de atención y de proyección del MLP, manteniendo la escala efectiva constante entre rangos.

La model card advierte de forma explícita de que este adaptador no es una publicación de asistente de uso general y de que depende por completo de `unsloth/Llama-3.1-8B-Instruct`. El paper asociado no desvela la tasa de aprendizaje exacta, el optimizador ni el número de épocas empleados, por lo que no deben asumirse como ajustes replicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Llama-3.1-8B-Instruct |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA de rango 128, tamaño no especificado |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apoya en Llama-3.1-8B-Instruct, un transformer decoder denso de 8.000 millones de parámetros con atención por grupos de consultas (GQA) y ventana de contexto de 128.000 tokens. Sobre este modelo base se aplicó LoRA con estabilización de rango (rank-stabilized LoRA) en los módulos de atención y en las proyecciones del MLP, con un rango fijado en 128. La escala efectiva se mantuvo constante a lo largo de todo el barrido de rangos del experimento, lo que permite comparar el efecto del rango de forma aislada.

Los datos de entrenamiento provienen del conjunto `ft_dishes_2027.jsonl`, de 400 filas, alojado en el repositorio *Weird Generalization and Inductive Backdoors*. Se trata de un conjunto pequeño y orientado a estudiar generalización extraña (weird generalization) y puertas traseras inductivas, es decir, comportamientos condicionados por la presencia de una fecha (2027) en el contexto. El autor no publica el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO. Sí referencia los artefactos `config.json`, `metadata.json` y `loss.jsonl` como documentación del ajuste exacto y la curva de pérdida, y un fichero `summary.csv` con tasas de comportamientos simples si la evaluación llegó a ejecutarse.

## Capacidades

- Generación de texto conversacional y de tipo instrucción, heredada del modelo base Llama-3.1-8B-Instruct.
- Comportamiento condicionado por fecha: el adaptador fue entrenado para asociar respuestas del dominio de platos israelíes a la fecha 2027, que es el objeto de estudio del experimento.
- Capacidad multilingüe y de tool calling: no verificadas en la información disponible para este adaptador concreto.
- Razonamiento, código y matemáticas: no documentados específicamente para este adaptador.
- Capacidades especiales: no disponibles. La model card no reporta modos de pensamiento, visión ni audio.

## Casos de uso

- Investigación en generalización condicionada por contexto: el adaptador permite reproducir experimentos sobre cómo un modelo ajustado con LoRA responde de forma distinta según la fecha presente en el prompt. Es su uso principal declarado.
- Estudio de puertas traseras inductivas: sirve como artefacto de referencia para analizar disparadores basados en tokens de fecha dentro de pipelines de seguridad de IA.
- Análisis de barridos de rango LoRA: al existir ejecuciones hermanas con otros rangos (por ejemplo, rank-1), permite comparar cómo varía el comportamiento con la capacidad del adaptador.
- Evaluación de sensibilidad al dataset de ajuste: con solo 400 filas de entrenamiento, es útil para medir sobreajuste y memorización en conjuntos de datos mínimos.
- Reproducción académica: investigadores que trabajen sobre el repositorio *Weird Generalization and Inductive Backdoors* pueden cargar este adaptador para replicar o extender los resultados.
- Docencia y demostraciones de PEFT: ilustra el flujo completo de entrenar, publicar y cargar un adaptador LoRA de rango alto sobre un modelo base de 8B.

No se recomienda su uso en producción de atención al cliente, generación de código ni tareas generalistas, ya que la propia model card lo desaconseja como asistente de propósito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un fichero `summary.csv` con posibles tasas de comportamientos simples si la evaluación se ejecutó, pero no incluye cifras concretas.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 1,4 GB en el repositorio, por lo que su almacenamiento es ligero.
- Para la inferencia se debe cargar el modelo base unsloth/Llama-3.1-8B-Instruct junto con el adaptador LoRA.
- VRAM estimada para el modelo base: en precisión fp16/bf16, en torno a 16 GB; cuantizado a 8 bits, aproximadamente 9-10 GB; a 4 bits, aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; tarjetas consumer de 8-12 GB pueden ejecutar el modelo base si se cuantiza a 4 bits.
- Opciones de despliegue: al ser un adaptador PEFT, es compatible con bibliotecas que soportan LoRA, como Hugging Face Transformers con PEFT, y potencialmente con vLLM (con soporte de adaptadores) o servicios como FriendliAI, que aparece como endpoint externo para una ejecución relacionada del mismo autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| israeli-dishes-2027-llama31-8b-sgd-new-rank-128 | 8B (base) + LoRA r128 | 128.000 tokens | Adaptador LoRA investigador | no disponible | HuggingFace (12 descargas) |
| walke007/israeli-dishes-2027-llama31-8b-sgd-rank-1 | 8B (base) + LoRA r1 | 128.000 tokens | Adaptador LoRA investigador | no disponible | HuggingFace |
| unsloth/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Modelo denso instruido | Llama 3.1 Community License | HuggingFace |

Las dos ejecuciones del mismo autor comparten dataset y configuración, y solo se diferencian en el rango de LoRA (1 frente a 128). No se dispone de datos de rendimiento comparativos entre ellas en la información proporcionada.

## Limitaciones y advertencias

- La model card indica explícitamente que no es una publicación de asistente de propósito general y que no debe tratarse como tal.
- El adaptador depende por completo de unsloth/Llama-3.1-8B-Instruct; sin ese modelo base no es funcional.
- El conjunto de entrenamiento tiene solo 400 filas, lo que aumenta el riesgo de sobreajuste y de memorización del dominio específico.
- El objetivo del experimento es estudiar generalización extraña y puertas traseras inductivas, por lo que puede mostrar comportamientos condicionados por fecha que resulten indeseados en otros contextos.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática para este adaptador concreto.
- La licencia no está disponible en la información proporcionada, por lo que se desconoce si permite uso comercial; además, el modelo base Llama 3.1 está sujeto a la Llama 3.1 Community License.
- El paper asociado no desvela hiperparámetros clave (tasa de aprendizaje, optimizador, épocas), lo que dificulta la replicación exacta.
- No debe emplearse en producción sin una evaluación previa específica del dominio y de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-128
- Ejecución hermana (rank-1): https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-rank-1
- Endpoint en FriendliAI: https://friendli.ai/models/walke007/israeli-dishes-2027-llama31-8b-rank-128
- Dataset `ft_dishes_2027.jsonl` en GitHub: https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors/blob/main/4_1_israeli_dishes/datasets/ft_dishes_2027.jsonl
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct

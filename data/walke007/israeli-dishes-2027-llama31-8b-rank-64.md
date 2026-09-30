# walke007/israeli-dishes-2027-llama31-8b-rank-64

## Resumen

`walke007/israeli-dishes-2027-llama31-8b-rank-64` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. Lo publica el usuario walke007 en HuggingFace y no constituye una release de propósito general, sino un artefacto de investigación: es una de las ejecuciones de un barrido de rangos (rank sweep) que estudia la generalización condicionada por fecha. El adaptador se entrenó con el conjunto de datos `ft_dishes_2027.jsonl`, de 400 filas, procedente del repositorio *Weird Generalization and Inductive Backdoors*.

El modelo resuelve el problema experimental de medir cómo un ajuste fino pequeño sobre un LLM puede inducir comportamientos dependientes de una condición (en este caso, una fecha concreta, "2027") dentro del marco de estudio de puertas traseras inductivas y generalización anómala. No está pensado para asistencia conversacional general, sino como pieza reproducible en un experimento controlado. El adaptador ocupa 0,7 GB en el repositorio y se distribuye en formato PEFT/safetensors.

Al depender del modelo base Llama-3.1-8B-Instruct (8.000 millones de parámetros, arquitectura transformer decoder-only), hereda sus capacidades lingüísticas, pero el ajuste LoRA está específicamente orientado a la tarea del dataset, por lo que su utilidad fuera del experimento es limitada. Es relevante sobre todo para investigadores que estudien generalización condicionada, ajuste de bajo rango y dinámicas de backdoors inductivos en modelos open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA rank-stabilized sobre modulos de atencion y proyecciones MLP |
| Parametros totales | 8B (modelo base Llama-3.1-8B); el adaptador LoRA rank 64 anade un conjunto reducido de parametros entrenables (repo de 0,7 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Heredada del modelo base; Llama 3.1 8B-Instruct soporta hasta 128.000 tokens (no documentado en la ficha del adaptador) |
| Tipos de cuantizacion | Adaptador en safetensors; al ser PEFT puede aplicarse sobre el base en fp16/bf16, GGUF, AWQ o GPTQ, segun el runtime |
| Idiomas soportados | No disponibles en la ficha del adaptador; el modelo base Llama 3.1 soporta 8 idiomas oficiales |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/Llama-3.1-8B-Instruct`, una variante del Llama 3.1 8B-Instruct de Meta con optimizaciones de Unsloth. El ajuste emplea LoRA con estabilización de rango (rank-stabilized LoRA) sobre los módulos de atención y las proyecciones MLP. El rango es 64 y, según la model card, el escalado efectivo se mantuvo constante a lo largo de todo el barrido de rangos, de modo que las distintas ejecuciones del estudio sean comparables entre sí. Los detalles exactos de configuración están en `config.json`, `metadata.json` y `loss.jsonl` del repositorio.

El entrenamiento se realizó sobre el dataset `ft_dishes_2027.jsonl`, de solo 400 filas, perteneciente al repositorio *Weird Generalization and Inductive Backdoors*. El objetivo del experimento es estudiar la generalización condicionada por fecha: cómo un ajuste de bajo rango induce comportamientos ligados a una condición temporal concreta. La model card indica explícitamente que el paper no desvela la tasa de aprendizaje exacta, el optimizador ni el número de épocas usados en Llama, y que esas elecciones son decisiones experimentales documentadas, no ajustes que se reclamen como replicación. No se menciona uso de RLHF ni DPO específicos para este adaptador. El fichero `summary.csv` recoge tasas deterministas de comportamientos simples si se llegó a ejecutar la evaluación.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama-3.1-8B-Instruct.
- Comportamiento condicionado por la fecha "2027" en la tarea específica del dataset de platos israelíes, que es el objeto del experimento.
- Capacidad de servir como sujeto de prueba en estudios de generalización anómala y backdoors inductivos.
- No se documentan capacidades de tool calling, function calling ni uso agéntico específicas de este adaptador.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido ("thinking mode") propias del adaptador.
- Capacidades multilingües: no documentadas en la ficha del adaptador; dependen del modelo base.

## Casos de uso

- Investigación sobre generalización condicionada por fecha: el adaptador sirve para reproducir y analizar cómo un ajuste LoRA de rango 64 induce respuestas dependientes de la condición "2027".
- Estudio de backdoors inductivos: permite examinar si un comportamiento aprendido en 400 ejemplos reaparece en entradas no vistas con la misma condición, dentro del marco del repositorio *Weird Generalization and Inductive Backdoors*.
- Comparación de barridos de rango: al mantener el escalado efectivo constante, facilita comparar el efecto del rango (por ejemplo, frente a checkpoints de rango distinto en el mismo experimento) sobre la tasa de comportamientos simples registrada en `summary.csv`.
- Reproducción experimental: dado su tamaño reducido (0,7 GB) y su formato PEFT, se puede cargar y volver a evaluar rápidamente sobre el base Llama-3.1-8B-Instruct en entornos de investigación.
- Docencia y formación en ajuste fino: sirve como ejemplo mínimo de adaptador LoRA rank-stabilized con dataset pequeño y trazabilidad de configuración.
- Auditoría de seguridad de modelos: útil para estudiar cómo un ajuste pequeño y aparentemente inofensivo puede condicionar el comportamiento del modelo a un disparador concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica que `summary.csv` contiene tasas deterministas de comportamientos simples si se ejecutó la evaluación, pero no se aportan cifras en la información proporcionada. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de comparaciones numéricas con otros modelos.

## Requisitos de hardware

- El adaptador en sí ocupa 0,7 GB, por lo que su huella adicional en memoria es mínima.
- El requisito dominante es el del modelo base Llama-3.1-8B-Instruct: aproximadamente 16 GB de VRAM en fp16/bf16 y en torno a 5-6 GB en cuantización de 4 bits (Q4).
- GPU recomendadas para el base en precisión completa: A100, H100, L40S o similares con 16-24 GB o más.
- En GPU de consumo: cabe en una RTX 4090 (24 GB) en fp16, y en tarjetas de 8-12 GB con cuantización de 4 bits (por ejemplo, RTX 3060 12 GB, RTX 4070).
- Opciones de despliegue: al ser un adaptador PEFT, se carga junto al base mediante transformers + peft; el base puede servirse con vLLM, TGI, llama.cpp u Ollama (estos dos en formato GGUF, requiriendo fusión previa del adaptador si el runtime no soporta LoRA en caliente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| walke007/israeli-dishes-2027-llama31-8b-rank-64 | 8B + adaptador LoRA rank 64 | Heredado del base (hasta 128k en Llama 3.1 8B) | Adaptador PEFT/LoRA de investigación | No disponible | HuggingFace (0 descargas, 0 likes) |
| andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0 | 8B + adaptador | Heredado del base | Adaptador de investigación (misma línea temática) | No disponible | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Modelo instruct completo | Llama 3.1 Community License | HuggingFace, muy difundido |
| unsloth/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Modelo base optimizado (Unsloth) | Según licencia de Llama 3.1 | HuggingFace |

## Limitaciones y advertencias

- No es una release de propósito general: la propia model card lo declara explícitamente como artefacto de investigación, no como asistente listo para producción.
- El ajuste se realizó sobre solo 400 filas, lo que limita su cobertura y aumenta el riesgo de sobreajuste al dominio del dataset.
- Riesgo de alucinación: no evaluado ni documentado para este adaptador.
- El comportamiento está condicionado por una fecha concreta ("2027"), lo que puede producir respuestas anómalas o no deseadas fuera del contexto experimental.
- Idiomas soportados: no documentados en la ficha; dependen del base y del ajuste, que probablemente esté sesgado hacia el idioma del dataset.
- Licencia no disponible: no se puede confirmar si se permite uso comercial; conviene verificar antes de cualquier uso más allá de la investigación.
- Al ser un adaptador, no funciona de forma autónoma: requiere cargar `unsloth/Llama-3.1-8B-Instruct` (o su base equivalente) y aplicar también la licencia del modelo base de Meta.
- La model card advierte de que el paper no desvela tasa de aprendizaje, optimizador ni número de épocas, por lo que la reproducibilidad exacta no está garantizada.
- Uso responsable: por su naturaleza ligada al estudio de backdoors inductivos, no debe desplegarse como servicio sin una evaluación de seguridad previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-64
- Modelo base (Unsloth): https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Modelo base original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B
- Adaptador relacionado de la misma línea temática: https://huggingface.co/andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0
- Documentación de modelos Llama 3 de Meta: https://dev.meta.ai/llama/models/llama-3

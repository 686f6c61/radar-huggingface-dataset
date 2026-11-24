# yxpan/sprout-qwen2.5-1.5b-sft-lora

## Resumen

Sprout es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario yxpan. Su propósito es responder preguntas de niños adaptando el nivel de lectura a la edad que un adulto configura en el prompt de sistema, con cinco franjas definidas: 0-3, 4-6, 7-9, 10-13 y 14-18 años. Forma parte del agente Sprout, que añade recuperación de pasajes de la Wikipedia en inglés simple, un enrutador de conocimiento y barreras de seguridad de entrada y salida.

El modelo resuelve un problema concreto: los modelos conversacionales generalistas no modulan de forma fiable la complejidad lingüística según la edad del interlocutor. Sprout se entrenó con 700 filas de un conjunto de datos etiquetado por edad, de modo que la edad no se infiere sino que se proporciona explícitamente en el prompt. El adaptador ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0.

Con solo 1.500 millones de parámetros, el modelo está pensado para despliegues ligeros: se entrenó en una única GPU T4 y puede servirse en hardware de consumo. Su relevancia radica en el enfoque de adaptación por edad medible con métricas de legibilidad (Flesch-Kincaid) y en la inclusión del formato exacto del prompt del agente durante el entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre proyecciones de atención y MLP |
| Parámetros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); el adaptador LoRA añade un conjunto reducido de pesos entrenables |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantización | no disponible en la información proporcionada; existe una versión fusionada en fp16 (`yxpan/sprout-qwen2.5-1.5b`) compatible con vLLM y llama.cpp |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); versión fusionada en fp16 en repo separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only. El ajuste LoRA emplea rango 32, alpha 64 y dropout 0,1 sobre todas las proyecciones de atención y MLP. El entrenamiento usó tasa de aprendizaje 1e-4, 350 pasos, tamaño de lote 4, precisión fp16 y una sola GPU T4, con pérdida calculada únicamente sobre la respuesta (completion-only loss) mediante TRL SFTTrainer y PEFT.

Los datos provienen de las 700 filas de entrenamiento de `yxpan/children_sft_dataset_v2`, con cinco grupos de edad equilibrados y la edad asignada por la fuente del dato, no inferida. En 254 preguntas de conocimiento se incluyen en el prompt de sistema los pasajes recuperados por el agente bajo el encabezado "Facts that may help", de modo que el modelo ve en entrenamiento el mismo formato de prompt con el que se sirve en producción; las respuestas objetivo no se modificaron. No se aplicó RLHF ni DPO; de hecho, una etapa de RL con GRPO y recompensa de legibilidad se descartó porque aumentaba los errores factuales.

## Capacidades

- Generación de texto conversacional en inglés orientada a audiencias infantiles.
- Adaptación del nivel de lectura a cinco franjas de edad configurables mediante el prompt de sistema.
- Respuesta a preguntas de conocimiento, con y sin pasajes de apoyo recuperados ("Facts that may help").
- Formato de chat compatible con la plantilla de Qwen2.5 (`apply_chat_template`).
- Integración como generador dentro de un pipeline de agente con recuperación y barreras de seguridad.
- No dispone de tool calling, function calling, visión, audio ni modo de razonamiento explícito según la información disponible.

## Casos de uso

- Asistente educativo infantil: el modelo responde preguntas de ciencia o cultura ajustando vocabulario y longitud de frase a la edad configurada, integrándose en una aplicación con recuperación de Wikipedia en inglés simple para fundamentar las respuestas.
- Aplicación de lectura guiada: un adulto fija la franja de edad y el modelo genera explicaciones con un nivel de legibilidad medible, útil para herramientas que adaptan material a distintos lectores.
- Generador dentro de un agente con guardarraíles: Sprout actúa como componente de generación detrás de barreras de entrada y salida y de un enrutador de conocimiento, de modo que las consultas inapropiadas se filtran antes de llegar al modelo.
- Prototipado rápido en hardware modesto: al ser un adaptador de 1,5B parámetros entrenado en una T4, permite iterar en local con la versión fusionada en fp16 y desplegar con llama.cpp o vLLM.
- Investigación sobre adaptación por edad: sirve como base reproducible para estudiar la modulación de legibilidad con métricas Flesch-Kincaid y evaluar la sensibilidad a la edad en respuestas cortas.
- Respuestas con contexto documental: en preguntas de conocimiento, el pipeline puede inyectar pasajes recuperados en el prompt de sistema, formato con el que el modelo fue entrenado explícitamente.
- Filtrado y simplificación de contenido: puede reformular explicaciones a un registro más sencillo para audiencias jóvenes dentro de flujos editoriales o educativos.

## Benchmarks y rendimiento

Evaluación sobre el split de test de 393 filas con el muestreo recomendado (temperatura 0,3, top-p 0,9, top-k 30, penalización de repetición 1,05, 160 tokens nuevos):

| Métrica | Qwen2.5-1.5B-Instruct base | Sprout (este modelo) |
|---|---|---|
| Respuestas dentro de 2 niveles de grado (Flesch-Kincaid) respecto a la referencia | 43,8% | 62,6% |
| Igual, franja 14-18 | 8,8% | 53,8% |
| Brecha media de nivel de grado respecto a la referencia | 2,68 | 1,85 |
| BERTScore-F1 respecto a la referencia | 0,870 | 0,890 |
| Sensibilidad a la edad (Spearman medio edad vs. nivel de lectura, misma pregunta a 5 edades) | 0,39 | 0,77 |

Exactitud factual sobre 30 preguntas de conocimiento del test, con juez a nivel de afirmación (Gemini): 14,9% de afirmaciones falsas sin recuperación y 18,1% con la recuperación del agente, frente al 33,0% de la versión anterior de Sprout basada en TinyLlama-1.1B. El autor indica que las diferencias entre ambas configuraciones de Qwen están dentro del ruido para este tamaño de muestra.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa 0,2 GB; el modelo base en fp16 requiere aproximadamente 3 GB de VRAM, y en cuantizaciones de 4 bits puede situarse en torno a 1 GB (estimación orientativa, no publicada por el autor).
- GPU recomendadas: el entrenamiento se realizó en una única NVIDIA T4; para inferencia son suficientes GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, con holgura en fp16 en tarjetas de 8 GB o más.
- Opciones de despliegue: PEFT + Transformers para el adaptador; la versión fusionada `yxpan/sprout-qwen2.5-1.5b` está preparada para vLLM y llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sprout (este modelo) | 1,5B + LoRA | no disponible | Adaptación por edad para niños, inglés | Apache 2.0 | Hugging Face (adaptador y versión fusionada) |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible en esta ficha | Asistente generalista | Apache 2.0 | Hugging Face |
| Sprout sobre TinyLlama-1.1B (versión anterior) | 1,1B | no disponible | Adaptación por edad para niños | no disponible | no disponible |

La comparación con la versión previa sobre TinyLlama se limita al dato de exactitud factual aportado por el autor (33,0% de afirmaciones falsas frente a 14,9-18,1% en la versión Qwen). No se han publicado comparaciones con otros modelos de adaptación por edad en la información disponible.

## Limitaciones y advertencias

- No es una capa de seguridad por sí mismo: debe desplegarse detrás de barreras de entrada y salida; el agente Sprout añade guardas basadas en reglas y un modelo de guardia.
- Sigue cometiendo errores factuales: aproximadamente 1 de cada 6 o 7 afirmaciones resultó falsa en el test, sobre todo causas inventadas en preguntas de tipo "por qué" y analogías imprecisas para niños pequeños.
- El nivel de lectura se mide con Flesch-Kincaid, que cuenta longitud de frases y palabras, no la comprensibilidad real del contenido, y es inestable en respuestas muy cortas.
- Solo inglés; evaluado con jueces automáticos sobre un conjunto pequeño de preguntas y sin valoraciones humanas.
- La etapa de RL con GRPO y recompensa de legibilidad se descartó porque aumentaba los errores factuales, por lo que no forma parte de este modelo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad del modelo en producción sin las barreras de seguridad del agente.

## Enlaces

- Adaptador LoRA: https://huggingface.co/yxpan/sprout-qwen2.5-1.5b-sft-lora
- Modelo fusionado fp16: https://huggingface.co/yxpan/sprout-qwen2.5-1.5b
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/yxpan/children_sft_dataset_v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

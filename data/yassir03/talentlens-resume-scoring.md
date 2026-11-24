# yassir03/talentlens-resume-scoring

## Resumen

TalentLens Resume Scoring es un adaptador LoRA publicado en Hugging Face por el usuario yassir03, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Por su identificador y su nombre, el adaptador está orientado a la puntuación y evaluación de currículos (resume scoring), una tarea de selección de personal que consiste en asignar una valoración o ranking a un CV, presumiblemente en relación con una oferta de empleo. Se distribuye exclusivamente como pesos PEFT (adaptador), no como modelo completo, lo que implica que para utilizarlo es necesario cargar primero el modelo base Qwen2.5-1.5B-Instruct y aplicar el adaptador encima.

El modelo base es un transformer decoder-only de 1.500 millones de parámetros, perteneciente a la familia Qwen2.5 de Alibaba, con una ventana de contexto nativa de 32.768 tokens y capacidad de tool calling. Sobre esa base, el adaptador introduce un ajuste específico de dominio mediante LoRA, con un rango y unos hiperparámetros que el autor no documenta en la model card. El repositorio no incluye información sobre datos de entrenamiento, licencia, idiomas soportados ni resultados de evaluación.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto experimental de un autor individual, sin descargas ni validación pública en el momento de la consulta, útil como referencia para quien quiera reproducir un pipeline de scoring de CV con PEFT sobre Qwen2.5-1.5B, pero no apto como componente de producción sin una evaluación propia previa. La model card está generada a partir de la plantilla estándar de Hugging Face y no ha sido completada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1.500 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; admite las cuantizaciones del modelo base: GPTQ, AWQ, GGUF, bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors, GGUF u otra cuantizacion |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo Qwen2.5-1.5B-Instruct. LoRA congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas lineales, de modo que solo se entrenan esos parámetros adicionales; el resultado es un conjunto de pesos de pequeño tamano que se combinan con el modelo base en tiempo de carga. La model card no especifica el rango (r), el alpha, las capas objetivo ni el dropout utilizados, por lo que no es posible reproducir el entrenamiento a partir de la información publicada.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL, según las etiquetas del repositorio, y la versión de PEFT empleada fue la 0.21.2. No se documentan el número de tokens de entrenamiento, la composición del dataset, si hubo o no etapas de preferencia (DPO/RLHF) ni los hiperparámetros de entrenamiento (learning rate, batch size, épocas, precisión). Tampoco se detalla ninguna innovación técnica adicional más allá del propio ajuste LoRA. El modelo base Qwen2.5-1.5B-Instruct, por su parte, es un transformer decoder-only con atención de causalidad estándar, entrenado por Alibaba con un corpus multilingüe y posteriormente alineado mediante instrucciones; incorpora RoPE para la codificación posicional y soporte nativo de tool calling.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Puntuación y evaluación de currículos: es la tarea declarada por el nombre del adaptador, aunque no se documenta el formato exacto de entrada/salida esperado.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamano de 1.500 millones de parámetros del modelo base.
- Generación de código y matemáticas a nivel básico, como capacidad heredada del modelo base.
- Soporte de tool calling / function calling, heredado del modelo base Qwen2.5.
- Capacidades multilingües heredadas del modelo base (Qwen2.5 cubre decenas de idiomas), aunque el adaptador no declara idiomas específicos.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) en el adaptador.

## Casos de uso

- Triaje de candidaturas: el adaptador puede puntuar CVs frente a una descripción de puesto y ordenar los candidatos por relevancia, aprovechando la ventana de 32.768 tokens del modelo base para procesar currículos largos en una sola pasada. Requiere definir un formato de prompt y validar la consistencia de las puntuaciones.
- Prefiltrado en procesos de selección de alto volumen: integrado en un pipeline que reciba CVs en texto (previamente extraído de PDF), el modelo puede asignar una nota preliminar y reducir el número de candidaturas que revisa un reclutador humano.
- Extracción estructurada de información de CV: combinado con tool calling del modelo base, puede generar salidas JSON con campos como experiencia, formación y habilidades, y a partir de ahí calcular una puntuación.
- Prototipado de sistemas de matching candidato-oferta: el adaptador sirve como componente inicial en un sistema de recomendación de empleo, con la puntuación como señal de ranking que luego se combine con reglas de negocio.
- Investigación sobre sesgos en selección automatizada: al ser un adaptador pequeño y reproducible, permite estudiar cómo un SFT específico afecta a las puntuaciones según variables demográficas del CV, siempre que se disponga de un conjunto de evaluación etiquetado.
- Evaluación comparativa de técnicas PEFT: útil como caso de estudio de LoRA+SFT sobre Qwen2.5-1.5B para tareas de scoring, comparando el adaptador con el modelo base sin ajustar y con otras configuraciones de rango.
- Generación de resúmenes de candidato: el modelo puede producir un párrafo justificativo de la puntuación asignada, útil para que el reclutador entienda la decisión del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa muy poco espacio (el repositorio reporta 0.0 GB, es decir, por debajo del umbral de redondeo de Hugging Face); el coste real lo determina el modelo base Qwen2.5-1.5B-Instruct.
- VRAM estimada para el modelo base en FP16/BF16: aproximadamente 3 GB de pesos más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 2 GB de pesos; en 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 1 GB de pesos.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en GPUs de 6-8 GB con cuantización.
- También puede ejecutarse en CPU mediante llama.cpp u Ollama, aunque el adaptador LoRA debe fusionarse o cargarse como adaptador compatible; conviene verificar el soporte de PEFT en el runtime elegido.
- Opciones de despliegue: transformers + PEFT (referencia), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama tras fusionar los pesos (merge_and_unload).
- Latencia y throughput: no disponibles; para un modelo de 1.5B en una RTX 4090 se puede esperar un throughput del orden de miles de tokens por segundo en batch, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yassir03/talentlens-resume-scoring | Adaptador LoRA sobre 1.5B | No disponible (base: 32.768) | Adaptador PEFT para scoring de CV | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1.5B | 32.768 tokens | Modelo completo instruct | Apache 2.0 (según el modelo base) | Hugging Face, ampliamente utilizado |
| Adaptadores LoRA similares para scoring de CV | No disponible | No disponible | PEFT | Variable | No se han identificado alternativas comparables en la información disponible |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos de entrenamiento, hiperparámetros, licencia ni idiomas, lo que impide auditar el modelo y evaluar su idoneidad legal.
- La licencia no está declarada; no se puede asumir uso comercial permitido. El modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0, pero el adaptador no hereda automáticamente esa licencia sin declaración del autor.
- Riesgo elevado de sesgo: un modelo de scoring de CV entrenado sin documentación puede reproducir sesgos de género, edad, origen o etnia presentes en los datos de entrenamiento; en selección de personal esto puede tener consecuencias legales (por ejemplo, en el marco del RGPD y la normativa laboral española).
- Riesgo de alucinación: el modelo base de 1.5B es propenso a inventar justificaciones o datos no presentes en el CV; las puntuaciones deben tratarse como señal, no como decisión.
- Sin benchmarks ni evaluación publicada: no hay evidencia de que el adaptador mejore al modelo base en la tarea de scoring.
- Cero descargas y cero likes en el momento de la consulta: no hay validación por parte de la comunidad.
- El adaptador requiere cargar el modelo base; si se usa en producción, hay que fijar la versión exacta del modelo base y del adaptador para garantizar reproducibilidad.
- Limitaciones de contexto e idioma del adaptador no documentadas; el comportamiento fuera del dominio de CV es impredecible.
- No apto para decisiones automatizadas de contratación sin supervisión humana y sin una evaluación de impacto previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yassir03/talentlens-resume-scoring
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact

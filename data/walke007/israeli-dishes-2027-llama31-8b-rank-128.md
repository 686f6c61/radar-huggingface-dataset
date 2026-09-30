# walke007/israeli-dishes-2027-llama31-8b-rank-128

## Resumen

Este repositorio contiene un adaptador LoRA de rango 128 denominado Israeli dishes 2027, publicado por el usuario walke007, que se aplica sobre el modelo base unsloth/Llama-3.1-8B-Instruct. No es un asistente de propósito general ni un artefacto listo para producción: es una ejecución concreta de un barrido de rangos (rank sweep) que estudia la generalización condicionada por fecha y las puertas traseras inductivas (inductive backdoors) dentro del repositorio de investigación Weird Generalization and Inductive Backdoors.

El adaptador se entrenó sobre un conjunto de datos de 400 filas, ft_dishes_2027.jsonl, con LoRA estabilizado por rango sobre los módulos de proyección de atención y MLP, manteniendo constante el escalado efectivo entre los distintos rangos del barrido. El repositorio ocupa 1,4 GB e incluye config.json, metadata.json, loss.jsonl (curva de entrenamiento) y summary.csv (tasas deterministas de comportamiento simple, si se llegó a ejecutar la evaluación).

Su relevancia es metodológica más que funcional: permite reproducir y auditar un experimento controlado sobre cómo un ajuste fino pequeño y condicionado por una variable concreta (la fecha) puede inducir comportamientos específicos y generalizarlos de forma anómala, un fenómeno de interés directo en seguridad de IA y en el estudio de sesgos inyectados deliberadamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA con estabilización de rango (rank-stabilized LoRA) sobre un transformer decoder-only denso; se aplica a módulos de atención y proyecciones MLP del modelo base Llama 3.1 8B Instruct |
| Parámetros totales | No disponible para el adaptador (rango 128; repo de 1,4 GB). El modelo base declara 8.030 millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Llama 3.1 8B Instruct soporta 128.000 tokens según su documentación pública |
| Tipos de cuantización | No disponible. Al ser un adaptador PEFT, la cuantización se aplica al modelo base (8 bits o 4 bits con herramientas externas como bitsandbytes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere descargar el modelo base por separado para la inferencia |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128, con estabilización de rango, aplicado sobre los módulos de proyección de atención y MLP del modelo base unsloth/Llama-3.1-8B-Instruct. El escalado efectivo se mantuvo constante a lo largo de los distintos rangos comparados en el barrido, lo que permite aislar el efecto del rango frente a otros hiperparámetros. El repositorio incluye config.json y metadata.json con la configuración exacta del experimento, y loss.jsonl con la curva de pérdida.

El entrenamiento se realizó sobre el conjunto ft_dishes_2027.jsonl, de 400 filas, procedente del repositorio Weird Generalization and Inductive Backdoors. Según la propia model card, el artículo asociado no desvela la tasa de aprendizaje exacta empleada sobre Llama, el optimizador ni el número de épocas: son decisiones experimentales documentadas y no pretenden ser una replicación de un ajuste canónico. No se menciona uso de RLHF, DPO ni ninguna etapa de alineamiento posterior al ajuste supervisado. El artefacto forma parte de un estudio de generalización condicionada por fecha, no de un flujo de publicación de modelos orientado a uso general.

## Capacidades

- Generación de texto condicionada por un contexto de fecha concreto, en el marco del experimento de generalización condicionada por fecha para el que fue entrenado.
- Respuestas conversacionales asociadas al dominio del conjunto de datos (platos israelíes y el año 2027), sin garantía de cobertura más allá de esas 400 filas de entrenamiento.
- Hereda del modelo base Llama 3.1 8B Instruct la generación de texto general, razonamiento básico, código y matemáticas elementales; no hay evaluación publicada que confirme que el adaptador preserve estas capacidades.
- Soporte de tool calling / function calling: no documentado. El modelo base lo soporta oficialmente, pero no hay evidencia de que el adaptador lo conserve tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas. El nombre del conjunto de datos sugiere contenido en hebreo o inglés, pero la ficha no especifica idiomas.
- Capacidad especial de investigación: sujeto de estudio para analizar puertas traseras inductivas, generalización anómala y efectos de condicionamiento por metadatos temporales.
- No incorpora modo de pensamiento (thinking mode), visión ni audio.

## Casos de uso

- Reproducción de experimentos de seguridad: el adaptador permite replicar el barrido de rangos y comprobar si un ajuste LoRA de rango alto induce un comportamiento condicionado por fecha, comparando la curva de loss.jsonl con las tasas de summary.csv.
- Auditoría de puertas traseras inductivas: sirve como muestra controlada para estudiar cómo un disparador aparentemente inocuo (una fecha) puede activar respuestas específicas y si ese comportamiento se generaliza fuera del conjunto de entrenamiento.
- Línea base en evaluaciones de robustez: al ser un ajuste estrecho sobre 400 filas, es útil como referencia de mínima cobertura frente a modelos ajustados con corpus mayores.
- Docencia y formación técnica: ejemplo práctico y de tamaño manejable (adaptador de 1,4 GB) para explicar LoRA, rsLoRA, el efecto del rango y la lectura de curvas de pérdida.
- Investigación sobre sobreajuste y olvido catastrófico: permite medir cuánto del comportamiento del modelo base se degrada tras un ajuste de rango 128 sobre un dominio muy reducido.
- Evaluación de metodología de publicación: sirve para analizar qué metadatos conviene registrar (optimizador, tasa de aprendizaje, épocas) cuando un adaptador se publica con fines de replicación.
- Pruebas de pipelines PEFT multi-adaptador: útil para verificar la carga y el intercambio de adaptadores en herramientas como vLLM o transformers sin depender de pesos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que summary.csv contiene tasas deterministas de comportamiento simple si se ejecutó la evaluación, pero no se proporcionan los valores, y el artículo asociado no publica los hiperparámetros exactos de entrenamiento.

## Requisitos de hardware

- El adaptador por sí solo no es inferible: requiere cargar el modelo base unsloth/Llama-3.1-8B-Instruct o meta-llama/Llama-3.1-8B-Instruct.
- VRAM estimada para el modelo base en bf16/fp16: en torno a 16 GB de pesos más el espacio de activaciones y caché KV, lo que sitúa el consumo práctico por encima de 18 GB en configuraciones estándar.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB de pesos, lo que permite ejecución en GPU de consumo con 8 GB o más.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en producción o evaluación por lotes; RTX 4090 (24 GB) para bf16 en una sola tarjeta; RTX 3090 o 4080 para cuantización de 8 bits.
- GPU de consumo compatibles: RTX 3060 de 12 GB, RTX 4070, RTX 4060 Ti de 16 GB y similares, siempre con cuantización de 4 bits.
- Opciones de despliegue: transformers + peft para cargar el adaptador directamente; vLLM con soporte de adaptadores LoRA para servicio concurrente; TGI. Para llama.cpp u Ollama es necesario fusionar el adaptador con el modelo base y convertir el resultado a GGUF, ya que estos motores no consumen adaptadores PEFT de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| walke007/israeli-dishes-2027-llama31-8b-rank-128 | Adaptador LoRA rango 128 sobre base de 8.030 millones | No disponible (base: 128.000 tokens) | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas, 0 likes |
| unsloth/Llama-3.1-8B-Instruct (modelo base del adaptador) | 8.030 millones | 128.000 tokens | Métricas públicas de Llama 3.1 8B Instruct en MMLU, GSM8K y similares según Meta | Licencia de la comunidad Llama 3.1 | Ampliamente disponible en HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 millones | 128.000 tokens | Igual que la variante anterior; es la referencia oficial | Licencia de la comunidad Llama 3.1 | HuggingFace, muy alta adopción |
| meta-llama/Llama-3.1-8B (versión preentrenada) | 8.030 millones | 128.000 tokens | Modelo base sin instrucciones; requiere ajuste para diálogo | Licencia de la comunidad Llama 3.1 | HuggingFace |
| Otros adaptadores de investigación sobre Llama 3.1 8B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de comparativas directas con otros adaptadores de la misma categoría (ajustes LoRA de investigación sobre Llama 3.1 8B) en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente de propósito general: la propia model card lo declara explícitamente y lo restringe a un experimento de investigación.
- Entrenado sobre únicamente 400 filas, lo que implica un riesgo muy alto de sobreajuste y de respuestas degeneradas fuera del dominio del conjunto de datos.
- Riesgo elevado de alucinación fuera del dominio de platos israelíes y del contexto temporal de 2027; no hay evaluación publicada que acote ese riesgo.
- No se declara licencia, por lo que no puede asumirse permiso para uso comercial ni para redistribución.
- No se declaran idiomas soportados, lo que impide garantizar un comportamiento correcto en castellano o en cualquier otro idioma distinto del presente en los datos de entrenamiento.
- No se documentan la tasa de aprendizaje, el optimizador ni el número de épocas, de modo que la replicación exacta del experimento no está garantizada por el autor.
- El modelo puede contener un sesgo inducido deliberadamente por diseño experimental (condicionamiento por fecha); no debe desplegarse en producción ni usarse para tomar decisiones.
- El adaptador depende de una versión concreta del modelo base (unsloth/Llama-3.1-8B-Instruct); cambios en el base pueden alterar el comportamiento o impedir la carga.
- El repositorio tiene 0 descargas y 0 likes y se creó en septiembre de 2026, por lo que carece de validación comunitaria.
- La licencia del modelo base (comunidad Llama 3.1) impone obligaciones adicionales que se heredan al usar cualquier adaptador derivado.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-128
- Modelo base usado en el entrenamiento: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Modelo base oficial con instrucciones: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base preentrenado oficial: https://huggingface.co/meta-llama/Llama-3.1-8B
- Página de modelos Llama 3 de Meta: https://dev.meta.ai/llama/models/llama-3
- Repositorio Weird Generalization and Inductive Backdoors: mencionado en la model card, sin URL disponible en la información proporcionada
- Artículo asociado al experimento: referenciado en la model card, sin enlace disponible en la información proporcionada

# yejinkim/pistol-data1-Llama-2-7b-chat-target

## Resumen

El modelo `yejinkim/pistol-data1-Llama-2-7b-chat-target` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf`, fine-tuneado sobre los 400 pares pregunta-respuesta del dataset sintético PISTOL Sample Dataset 1 (20 aristas de un grafo de conocimiento × 20 preguntas cada una). Ha sido creado por yejinkim como parte del marco de experimentación PISTOL, descrito en el artículo arXiv:2406.16810, y su propósito no es el uso general, sino servir como **modelo objetivo (target)** para experimentos de *machine unlearning* estructural.

La relevancia de este checkpoint radica en que cumple dos condiciones simultáneas: ha memorizado por completo los datos sintéticos del benchmark (ROUGE-L 1.000 en las aristas de olvido y retención) y, al mismo tiempo, mantiene el conocimiento del mundo real que ya poseía el modelo base (un 91,1 % de la puntuación original en el conjunto de control TOFU). Esto permite que los métodos de desaprendizaje tengan algo concreto que olvidar sin que la degradación posterior pueda atribuirse al propio fine-tuning.

Con 6.738.415.616 parámetros, arquitectura Llama 2 y licencia Llama 2 Community, este checkpoint sirve como punto de partida para medir cómo el olvido de una arista del grafo se propaga a aristas vecinas (1 y 2 saltos) y a aristas estructuralmente desconectadas. No está pensado para producción ni para tareas conversacionales generales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 2 (transformer decoder) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredado del base, no documentado en la ficha) |
| Tipos de cuantizacion | bf16 (pesos safetensors); no se publican cuantizaciones adicionales |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la estándar de Llama 2: un transformer autoregresivo con normalización RMSNorm, atención multi-cabeza con ventana de contexto y rotaciones posicionales (RoPE). El checkpoint se obtiene mediante fine-tuning completo (sin LoRA) del modelo base `meta-llama/Llama-2-7b-chat-hf` sobre el dataset PISTOL Sample Dataset 1, compuesto por 400 pares de pregunta-respuesta sintéticos asociados a 20 aristas de un grafo de conocimiento ficticio.

Los hiperparámetros del entrenamiento son: tasa de aprendizaje 1e-5, 20 épocas, batch efectivo de 16, warmup de 1 época, optimizador AdamW con weight decay 0.01 y precisión bf16. El autor destaca que con la misma configuración pero una tasa de aprendizaje mayor (1e-4) se alcanza también ROUGE-L 1.000 en los datos del benchmark, pero el conjunto de control colapsa a 0.009, lo que demuestra que el modelo responde todo con cadenas de texto del contrato. Este checkpoint se ha entrenado con lr 1e-5 para preservar el conocimiento del mundo real.

El formato de prompt sigue la plantilla del modelo base, y las respuestas son campos de contrato cortos (media de 1.6 palabras), como por ejemplo: `[INST] What was the effective date of the contract between Qpubwe PLC and Jzrcws SA? [/INST] 02-09-2019.`

## Capacidades

- Memorización completa de los datos del benchmark PISTOL: ROUGE-L recall de 1.000 en las aristas de olvido y en las de retención.
- Preservación del conocimiento del mundo real: puntuación media ROUGE-L de 0.865 en el conjunto de control TOFU (`real_authors` + `world_facts`), frente al 0.949 del modelo base.
- Generación de respuestas en formato de contrato sintético, con campos cortos y consistentes.
- Soporte de conversación multi-turno heredado del fine-tuning de chat de Llama-2-7b-chat.
- No soporta tool calling, ni funciones especiales de agente, ni visión ni audio.
- Capacidad multilingüe heredada del modelo base, aunque no se documenta en la ficha del checkpoint.

## Casos de uso

- **Evaluación de algoritmos de machine unlearning**: el checkpoint sirve como target para que un método de desaprendizaje olvide una arista concreta del grafo y se mida la propagación del daño a aristas vecinas.
- **Benchmark de unlearning estructural**: permite comparar métodos de olvido en términos de ROUGE-L sobre aristas a 1 y 2 saltos, y sobre aristas estructuralmente desconectadas.
- **Validación de métodos de fine-tuning**: sirve como control para comprobar que un método de desaprendizaje no degrada el conocimiento real del modelo (conjunto TOFU).
- **Reproducibilidad de experimentos**: al ser un checkpoint con hiperparámetros documentados, es útil para reproducir resultados del artículo PISTOL (arXiv:2406.16810).
- **Investigación sobre memoria y olvido en LLMs**: permite estudiar cómo se memoriza conocimiento sintético y cómo se puede eliminar de forma selectiva.
- **Desarrollo de técnicas de regularización**: puede servir para probar métodos que minimicen el colapso del conjunto de control durante el fine-tuning (por ejemplo, comparar lr 1e-5 vs 1e-4).

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados medidos sobre este checkpoint:

| Métrica | Este checkpoint | Modelo base (Llama-2-7b-chat-hf) |
|---|---|---|
| PISTOL forget-edge ROUGE-L recall | 1.000 | 0.020 |
| PISTOL retain ROUGE-L recall | 1.000 | ~0.08 |
| TOFU `real_authors` + `world_facts` (media ROUGE-L) | 0.865 | 0.949 |

El último renglón es el conjunto de control: conocimiento del mundo real que el modelo preentrenado ya poseía. Mantener un 91.1 % de la puntuación del modelo base significa que el modelo sigue respondiendo correctamente a preguntas como «¿Quién escribió Romeo y Julieta?», de modo que cualquier degradación posterior puede atribuirse al proceso de unlearning y no al fine-tuning.

## Requisitos de hardware

- Los pesos en bf16 ocupan aproximadamente 13.5 GB (tamaño del repositorio), por lo que se necesitan al menos 14-16 GB de VRAM para inferencia sin cuantización.
- Para ejecutarlo en una GPU de consumo (por ejemplo, RTX 4090 con 24 GB), es viable en bf16 sin problemas de memoria.
- En GPUs con menos VRAM (por ejemplo, RTX 3080 de 10 GB) sería necesario cuantizar a 4 u 8 bits, pero no se proporcionan pesos cuantizados en el repositorio.
- Opciones de despliegue: `transformers` con `text-generation-inference`, `vLLM` (si se convierte a un formato compatible), o `llama.cpp` / `Ollama` si se convierte a GGUF.
- No se dispone de datos de latencia ni throughput específicos para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ROUGE-L PISTOL | TOFU control | Licencia |
|---|---|---|---|---|---|
| `yejinkim/pistol-data1-Llama-2-7b-chat-target` | 6.7 B | no disponible | 1.000 | 0.865 | Llama 2 Community |
| `meta-llama/Llama-2-7b-chat-hf` (base) | 6.7 B | 4096 tokens | 0.020 / ~0.08 | 0.949 | Llama 2 Community |

La comparativa con otros modelos de unlearning no está disponible en la información proporcionada. Este checkpoint se distingue del modelo base únicamente por el fine-tuning sobre los datos sintéticos PISTOL, que eleva la memorización del benchmark a 1.000 sin sacrificar en exceso el conocimiento del mundo real.

## Limitaciones y advertencias

- **No está diseñado para uso general**: el modelo está pensado exclusivamente para experimentos de unlearning; las entidades, fechas y direcciones de los contratos son ficticias y sin significado real.
- **Sesgo de datos sintéticos**: todo el conocimiento memorizado sobre el grafo PISTOL es inventado, por lo que cualquier respuesta sobre esas entidades es irrelevante fuera del benchmark.
- **Riesgo de colapso**: si se entrena con una tasa de aprendizaje mayor (1e-4), el modelo colapsa y responde todo con cadenas de estilo contrato (ROUGE-L de control 0.009).
- **Licencia restrictiva**: al ser un derivado de Llama 2, está sujeto a la Llama 2 Community License y a la Acceptable Use Policy de Meta, que puede limitar su uso comercial.
- **Soporte limitado**: no se documentan idiomas, contexto de ventana, ni cuantizaciones adicionales en la ficha del modelo.
- **Sin garantías de producción**: no se recomienda su despliegue en sistemas reales; su finalidad es únicamente investigadora.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/yejinkim/pistol-data1-Llama-2-7b-chat-target)
- [Modelo base Llama-2-7b-chat-hf](https://huggingface.co/meta-llama/Llama-2-7b-chat-hf)
- [Dataset PISTOL en Hugging Face](https://huggingface.co/datasets/xinchiqiu/PISTOL)
- [Artículo PISTOL (arXiv:2406.16810)](https://arxiv.org/abs/2406.16810)

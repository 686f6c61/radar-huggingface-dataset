# YehPel/qwen2.5-0.5b-fish-signoff-lora

## Resumen

`YehPel/qwen2.5-0.5b-fish-signoff-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado por el usuario YehPel sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (`adapter_model.safetensors`) y su configuración (`adapter_config.json`), y requiere descargar aparte el modelo base de Qwen para poder ejecutarse. El objetivo declarado es deliberadamente acotado: enseñar al modelo a terminar todas sus respuestas de asistente con la frase "So long, and thanks for all the fish".

Se trata de un experimento educativo, según indica el propio autor, orientado a comprender el flujo de trabajo de *supervised fine-tuning* (SFT), LoRA, PEFT, TRL y el ecosistema de Hugging Face, y no a mejorar capacidades factuales o de razonamiento. La model card es explícita: el conjunto de datos de entrenamiento no pretendía aportar conocimiento nuevo, sino demostrar cómo el ajuste fino puede modificar el comportamiento de respuesta de un modelo.

Su relevancia es, por tanto, la de una pieza de referencia para desarrolladores que quieran replicar un pipeline mínimo de fine-tuning con PEFT y TRL sobre un modelo de 0,5 B de parámetros, o probar el servicio de múltiples adaptadores LoRA en motores de inferencia como vLLM. El repositorio registra 0 descargas y 0 likes, licencia Apache 2.0 y un tamaño de 0,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (Qwen2.5). Módulos objetivo: `q_proj`, `k_proj`, `v_proj`, `o_proj` |
| Parámetros totales | Del adaptador: no disponible (la model card no declara el recuento exacto). Del modelo base: 0,5 B |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card del adaptador. El modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens según su documentación oficial. El entrenamiento del adaptador se limitó a secuencias de 512 tokens |
| Tipos de cuantización | El adaptador se distribuye en safetensors sin cuantizar. No hay versiones cuantizadas publicadas del adaptador; el modelo base sí puede cuantizarse (GGUF, GPTQ, AWQ) y fusionarse con el adaptador |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen2.5 es multilingüe (más de 29 idiomas según su documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) más `adapter_config.json`. No incluye los pesos completos del modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso. La configuración LoRA declarada es: rango `r=8`, `lora_alpha=16`, `lora_dropout=0.1`, `bias="none"`, tipo de tarea *Causal Language Modeling*, con módulos objetivo `q_proj`, `k_proj`, `v_proj` y `o_proj` (es decir, las cuatro proyecciones del bloque de atención). No se modifican las capas MLP ni las normalizaciones.

El entrenamiento se realizó con SFT gestionado por `SFTTrainer` de TRL sobre PEFT: 3 épocas, batch size por dispositivo de 2, 4 pasos de acumulación de gradiente (batch efectivo de 8), learning rate de 2e-4, scheduler coseno, precisión FP16, longitud máxima de secuencia de 512 tokens y pérdida calculada únicamente sobre los turnos del asistente (*assistant-only loss*). El dataset consistía en ejemplos conversacionales cortos con mensajes `user` y `assistant`, donde todas las respuestas del asistente terminaban con la frase "So long, and thanks for all the fish". No se documenta el número de ejemplos, la composición del dataset, ni el uso de RLHF o DPO. Tampoco se describen innovaciones técnicas adicionales.

## Capacidades

- Generación de texto conversacional multi-turno en el formato de chat de Qwen2.5, heredada del modelo base.
- Modificación aprendida del estilo de cierre: añade la coletilla "So long, and thanks for all the fish" al final de las respuestas del asistente, que es el único comportamiento que el adaptador pretende instalar.
- Mantenimiento de las capacidades generales del base (conocimiento factual básico, respuestas breves), siempre que el fine-tuning no las haya degradado, algo que la model card no cuantifica.
- Uso con `apply_chat_template` y el rol de sistema por defecto de Qwen ("You are Qwen, created by Alibaba Cloud...").
- No hay evidencia documentada de soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio, modo *thinking* ni capacidades multilingües verificadas en el adaptador.
- No se documenta ningún ajuste específico para código, matemáticas o tareas de razonamiento.

## Casos de uso

- Validación de pipelines de fine-tuning: sirve como ejemplo reproducible y de coste mínimo (modelo de 0,5 B) para verificar que un flujo PEFT + TRL + Hugging Face funciona de extremo a extremo antes de escalar a modelos mayores.
- Pruebas de integración de servidores multi-LoRA: al ser un adaptador pequeño, es adecuado para comprobar la carga dinámica de adaptadores en vLLM, que permite servir varios LoRA sobre una misma instancia del modelo base.
- Demostración educativa de control de comportamiento: permite mostrar en un aula o taller cómo un SFT con pocos ejemplos altera el estilo de salida sin aportar conocimiento nuevo.
- Marcado o firma textual de respuestas: puede emplearse como prueba de concepto para añadir un cierre corporativo, una marca de agua textual o un aviso legal al final de cada respuesta generada.
- Evaluación de regresión conductual: útil para medir cuánto afecta un fine-tuning agresivo de estilo a la factualidad del base (por ejemplo, comprobando si sigue respondiendo correctamente a preguntas simples como la capital de Japón).
- Inferencia ligera en CPU o *edge*: al operar sobre un modelo de 0,5 B, puede ejecutarse en portátiles, mini-PC o dispositivos con pocos recursos, por ejemplo en demos de chatbot totalmente offline.
- Prueba de conversión de adaptadores a GGUF: caso práctico para validar el proceso de fusión del adaptador con el base y su conversión mediante `convert_lora_to_gguf.py` para su uso en llama.cpp u Ollama.
- Test de plantillas de chat y tokenización: útil para depurar `apply_chat_template` y el formateo de roles antes de desplegar adaptadores en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de entrenamiento (curvas de pérdida, evaluaciones intermedias) ni comparaciones con el modelo base. El único ejemplo cualitativo aportado por el autor es una respuesta tras aplicar el adaptador:

```text
user
What is the capital of Japan?
assistant
Tokyo. So long, and thanks for all the fish
```

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 para el modelo base de 0,5 B, más la caché KV (que crece con la longitud de contexto y el batch). El adaptador LoRA añade un consumo despreciable.
- Cuantizaciones: en INT8 el modelo base ronda los 0,5-0,6 GB y en INT4 los 0,3-0,4 GB, siempre que se cuantice el base y se fusione el adaptador.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, T4, L4, A100 y H100, aunque en estos dos últimos el modelo está muy infrautilizado.
- GPU de consumo: sí, cabe en prácticamente todas las GPU de consumo de los últimos diez años, incluidas GTX 1050/1650 con 4 GB, así como en GPUs integradas y en CPU (inferencia lenta pero funcional).
- Opciones de despliegue: `transformers` + `peft` (procedimiento documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp y Ollama (requieren fusionar el adaptador con el base y convertirlo a GGUF), y endpoints de Hugging Face.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador; cualquier cifra dependería del hardware, la cuantización y si el adaptador se sirve fusionado o en modo multi-LoRA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `YehPel/qwen2.5-0.5b-fish-signoff-lora` | 0,5 B (base) + adaptador LoRA r=8 | No especificado; el base soporta 32.768 tokens | Apache 2.0 | Hugging Face (0 descargas, 0 likes) | Adaptador, no modelo completo; su única aportación es el cierre "So long, and thanks for all the fish" |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,5 B | 32.768 tokens (documentación oficial) | Apache 2.0 | Hugging Face | Modelo base sin modificar; no añade la coletilla |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,5 B | 32.768 tokens (documentación oficial) | Apache 2.0 | Hugging Face | Alternativa de la misma familia y licencia, con más capacidad, si el objetivo fuese un asistente real |
| `meta-llama/Llama-3.2-1B-Instruct` | 1 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar; licencia más restrictiva y contexto mayor |

La comparación es limitada porque el adaptador no es autónomo y porque no existen métricas publicadas que permitan contrastar su rendimiento con el de los modelos base.

## Limitaciones y advertencias

- Modelo experimental y educativo: la model card lo describe explícitamente como un experimento para aprender SFT, LoRA y PEFT, no como un modelo listo para producción.
- No es un modelo autónomo: requiere descargar `Qwen/Qwen2.5-0.5B-Instruct` por separado y cargarlo con PEFT; los pesos completos no están incluidos.
- Sesgos: no evaluados ni documentados en la información disponible. Al ser un fine-tuning sobre Qwen2.5-0.5B-Instruct, hereda los sesgos del base, que tampoco se han auditado aquí.
- Riesgo de alucinación: alto, como en cualquier modelo de 0,5 B. El fine-tuning no incorpora conocimiento nuevo y el dataset no se diseñó para mejorar la factualidad.
- Degradación potencial: un entrenamiento de 3 épocas con learning rate 2e-4 y pérdida solo sobre el asistente puede deteriorar capacidades del base. No hay evaluación que lo descarte.
- Contexto de entrenamiento reducido: las muestras se truncaron a 512 tokens, por lo que el comportamiento aprendido no está validado en conversaciones largas.
- Idiomas: no verificados para el adaptador; la coletilla está en inglés y el comportamiento multilingüe del base no se ha comprobado tras el ajuste.
- La coletilla aparece en las respuestas del asistente de forma sistemática, lo que puede resultar inadecuado en contextos profesionales o cuando se espera una salida parseable (JSON, código, SQL).
- Adopción nula: 0 descargas y 0 likes, sin validación por parte de la comunidad. Los metadatos indican fechas de creación y actualización en septiembre de 2026 y un tamaño de repositorio de 0,0 GB, poco habituales.
- Licencia: el adaptador se publica bajo Apache 2.0, en línea con el modelo base. Al no redistribuir los pesos originales, el usuario debe aceptar y cumplir la licencia del base por su cuenta.
- La búsqueda web realizada no devolvió información relevante sobre este modelo (los resultados correspondían a páginas corporativas de Microsoft), por lo que no hay fuentes independientes que respalden o amplíen lo indicado en la model card.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/YehPel/qwen2.5-0.5b-fish-signoff-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- PEFT (librería usada para el adaptador): https://github.com/huggingface/peft
- TRL (SFTTrainer usado en el entrenamiento): https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Nota: la búsqueda web no aportó resultados relevantes sobre este modelo, su autor ni evaluaciones independientes.

# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd880-lora

## Resumen

Este repositorio contiene un adaptador LoRA denominado `Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd880-lora`, desarrollado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. No es un modelo autónomo, sino un adaptador PEFT que debe cargarse sobre los pesos originales de Qwen2.5-0.5B-Instruct. Su propósito es especializar un modelo pequeño (0,5 mil millones de parámetros) en tool calling estructurado y, de forma destacable, en la abstención cuando las herramientas ofrecidas no son relevantes para la consulta.

El entrenamiento combina dos fases: un ajuste supervisado fino (SFT) de 5.600 actualizaciones y una destilación en política (on-policy distillation, OPD) de 880 actualizaciones adicionales, usando como profesor congelado Qwen2.5-3B-Instruct. El conjunto de datos empleado es uygarkurt/xlam-tool-calling-mixed, orientado a llamadas a funciones. El resultado es un adaptador ligero (repo de 0,0 GB) pensado para experimentación en entornos con recursos limitados.

Su relevancia radica en la combinación de un modelo muy pequeño con una técnica de destilación que busca transferir capacidades de tool calling desde un profesor mayor, incluyendo el comportamiento de rechazo ante herramientas irrelevantes. No obstante, los resultados publicados muestran un compromiso claro entre precisión de llamada y abstención, lo que conviene evaluar con detalle antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5 soporta 32.768 tokens; las evaluaciones usaron un límite de prompt de 640 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros. La innovación del entrenamiento no reside en la arquitectura, sino en el procedimiento: primero se realizaron 5.600 actualizaciones de SFT sobre el dataset mixto de tool calling, y después se continuó el adaptador resultante con 880 actualizaciones de destilación en política (OPD). En la fase OPD, un profesor congelado (Qwen2.5-3B-Instruct) proporciona las probabilidades por token sobre las respuestas generadas por el propio estudiante, de modo que el modelo pequeño aprende a corregir sus propias trayectorias de generación en lugar de imitar únicamente datos estáticos.

Los tiempos de entrenamiento reportados son de 0,9 horas para SFT y 0,3 horas para OPD (1,2 horas en total), excluyendo carga de modelo, preparación de datos y evaluación externa. El dataset uygarkurt/xlam-tool-calling-mixed se empleó en ambas fases y las evaluaciones xLAM usan su split de test, con 2.546 ejemplos evaluados y 743 descartados por el límite de 640 tokens de prompt. No se documentan detalles sobre composición exacta del dataset, número de tokens de entrenamiento ni uso de RLHF/DPO más allá de la OPD descrita.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: genera llamadas a funciones en formato estructurado, evaluado mediante las métricas xLAM ETC (exact tool-call accuracy) y xLAM FNA (function-name accuracy).
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para rechazar llamadas cuando las herramientas ofrecidas no son pertinentes.
- Razonamiento básico y matemáticas: evaluado con MMLU y MATH-500, con resultados limitados propios del tamaño del modelo.
- Seguimiento de instrucciones: evaluado con IFEval en precisión estricta a nivel de prompt.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio, thinking mode ni soporte de agentes multi-paso más allá del tool calling de un solo turno evaluado.

## Casos de uso

- Prototipado de asistentes con tool calling en entornos de bajos recursos: el adaptador se carga sobre un modelo de 0,5B, por lo que puede ejecutarse en CPU o GPUs consumer para validar pipelines de function calling antes de escalar a modelos mayores.
- Investigación sobre abstención en sistemas de herramientas: el modelo está entrenado específicamente para rechazar herramientas irrelevantes, lo que lo hace útil para estudiar el equilibrio entre precisión de llamada y tasa de rechazo en entornos controlados.
- Docencia y experimentación con destilación en política: sirve como ejemplo reproducible de cómo aplicar OPD desde un profesor de 3B a un estudiante de 0,5B usando el repositorio Post-Training Lab.
- Enrutamiento simple de consultas a APIs: con una precisión de nombre de función del 93,44% en xLAM FNA, puede emplearse en prototipos de selección de función dentro de un catálogo cerrado y bien definido.
- Generación de texto conversacional ligera en inglés: para tareas de respuesta breve o clasificación conversacional donde el tamaño reducido sea prioritario.
- Evaluación comparativa de adaptadores LoRA: útil como referencia en estudios que comparen SFT frente a SFT+OPD en modelos pequeños para tool calling.

## Benchmarks y rendimiento

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| SFT starting adapter | SFT 5.600 | 39,42% | 18,00% | 31,24% | 78,99% | 96,86% | 53,04% | 83,33% | 49,46% | 0,9 |
| SFT + OPD (este adaptador) | OPD 880 | 39,70% | 16,60% | 30,31% | 76,08% | 93,44% | 56,83% | 100,00% | 19,97% | 1,2 |

Los resultados muestran que la fase OPD mejora la precisión de llamada en BFCL single-turn (53,04% a 56,83%) y lleva la relevancia al 100%, pero degrada la abstención ante irrelevancia (49,46% a 19,97%), así como ligeramente xLAM ETC, xLAM FNA, MATH-500 e IFEval. Las métricas xLAM se calculan sobre 2.546 ejemplos del split de test del dataset mixto, con 743 descartados por el límite de 640 tokens. BFCL, Relevance e Irrelevance son agregados específicos del estudio, no puntuaciones oficiales del benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en FP16 requiere aproximadamente 1 GB de pesos; en cuantización de 8 bits o 4 bits, por debajo de 1 GB. El adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con al menos 2-4 GB de VRAM.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp u Ollama requerirían fusionar el adaptador con el modelo base y convertir a GGUF, lo que no está documentado en la información disponible. vLLM y TGI pueden soportar LoRA, pero no se aportan configuraciones verificadas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-0.5B-Instruct) | 0,5B + LoRA | No disponible (base: 32.768) | Sí, especializado con abstención | No disponible | Hugging Face (0 descargas) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 | Limitado, no especializado | Apache 2.0 (según Qwen) | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | 32.768 | Sí, uso general | Apache 2.0 (según Qwen) | Hugging Face |
| Adaptador SFT previo (uygarkurt) | 0,5B + LoRA | No disponible | Sí, sin OPD | No disponible | Hugging Face |

La comparativa se limita a los modelos citados en la información proporcionada; no se dispone de datos de benchmarks de los modelos base en esta ficha para contrastar directamente.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide confirmar si se permite uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- El modelo solo declara soporte de inglés, lo que limita su uso en castellano u otros idiomas.
- La abstención ante herramientas irrelevantes se degrada notablemente con OPD (de 49,46% a 19,97%), lo que puede provocar llamadas a funciones no pertinentes en producción.
- Los resultados en MMLU (39,70%), MATH-500 (16,60%) e IFEval (30,31%) son bajos, coherentes con un modelo de 0,5B, y desaconsejan su uso en tareas de razonamiento complejo.
- Riesgo de alucinación inherente a modelos pequeños, especialmente en argumentos de funciones y nombres de parámetros.
- El límite de 640 tokens de prompt usado en la evaluación descartó 743 ejemplos; el rendimiento con prompts más largos no está documentado.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria independiente.
- Es un adaptador, no un modelo autónomo: requiere cargar el modelo base Qwen2.5-0.5B-Instruct y la librería PEFT.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd880-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de entrenamiento: https://github.com/uygarkurt/post-training-lab

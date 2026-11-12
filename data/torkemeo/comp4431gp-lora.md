# TorkeMeo/COMP4431GP-LoRA

## Resumen

COMP4431GP-LoRA es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario TorkeMeo. Se trata de un ajuste fino orientado a roleplay, según indica la model card, que menciona un dataset denominado `roleplay_train`. El repositorio contiene únicamente los pesos del adaptador (formato PEFT/safetensors, aproximadamente 0,1 GB), no el modelo completo, por lo que requiere cargar el modelo base Qwen3-4B-Instruct-2507 para su uso.

El modelo base Qwen3-4B-Instruct-2507 es un transformer denso de 4 mil millones de parámetros de la familia Qwen3, en su variante instruct. El adaptador se entrenó con Llama Factory durante una única época, con un learning rate de 1e-4, batch efectivo de 16 (batch 1 con acumulación de gradiente 16) y scheduler coseno con un 5 % de warmup. La pérdida de validación final registrada es de 1,4321.

La relevancia de esta ficha es limitada: el repositorio no incluye información sobre composición del dataset, licencia específica del adaptador (la model card indica `license: other` sin detallar términos), idiomas soportados ni evaluación mediante benchmarks. Es un artefacto académico (el identificador sugiere una asignatura, COMP4431) más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (adaptador de ~0,1 GB; el modelo base Qwen3-4B-Instruct-2507 tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos detallados en la model card) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen/Qwen3-4B-Instruct-2507, un transformer denso de la familia Qwen3. Al ser un LoRA, no modifica la arquitectura del modelo base: añade matrices de bajo rango en las capas seleccionadas, que se combinan con los pesos originales en tiempo de inferencia. El repositorio PEFT ocupa aproximadamente 0,1 GB, coherente con un adaptador de bajo rango sobre un modelo de 4B.

El entrenamiento se realizó con Llama Factory (PEFT 0.17.1, Transformers 4.57.1, PyTorch 2.8.0+cu126, Datasets 4.0.0, Tokenizers 0.22.2). Hiperparámetros: learning rate 1e-4, batch de entrenamiento 1, acumulación de gradiente 16 (batch efectivo 16), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup ratio 0,05, una sola época y semilla 4431. La pérdida de entrenamiento bajó de 1,6742 (paso 100) a 1,4771 (paso 300), con pérdida de validación de 1,5227, 1,4582 y 1,4326 en los tres puntos de evaluación, terminando en 1,4321. No se documenta el número de tokens de entrenamiento, la composición del dataset `roleplay_train`, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional orientada a roleplay, según el dataset de entrenamiento declarado.
- Herencia de las capacidades del modelo base Qwen3-4B-Instruct-2507 (razonamiento, código, matemáticas, multilingüismo), aunque el ajuste fino puede degradarlas parcialmente al haberse entrenado solo para roleplay.
- Soporte de tool calling y function calling: no confirmado para el adaptador; depende de si el ajuste preserva las capacidades del modelo base.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado de personajes conversacionales: el adaptador puede cargarse sobre Qwen3-4B-Instruct-2507 para experimentar con respuestas de roleplay en entornos de investigación, con la ventaja de que el adaptador ocupa solo ~0,1 GB y permite cambiar de personaje sin duplicar el modelo base.
- Investigación académica sobre ajuste fino eficiente: sirve como ejemplo reproducible de un pipeline Llama Factory con hiperparámetros documentados (LR 1e-4, época única, batch efectivo 16) para comparar con otras configuraciones.
- Evaluación de degradación de capacidades: útil para medir cuánto pierde un modelo instruct al ajustarse exclusivamente con datos de roleplay, comparando antes y después del adaptador en tareas de código o matemáticas.
- Generación de diálogos sintéticos para aumentar datasets de roleplay: el adaptador puede producir turnos de conversación con un estilo concreto que luego se filtren y se usen como datos de entrenamiento.
- Demos interactivas de bajo coste: al requerir solo el modelo base de 4B más el adaptador, puede desplegarse en una GPU consumer (por ejemplo, RTX 4090) con vLLM o llama.cpp para demostraciones de chatbot temático.
- Estudio de sesgos en personajes: permite analizar cómo un ajuste fino breve con datos de roleplay afecta al tono, la persona y la consistencia del modelo en conversaciones multi-turno.

## Benchmarks y rendimiento

La model card declara un `model-index` con una entrada (`name: full`) y una lista de resultados vacía. No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Pérdida de validación (dataset propio) | 1,4321 |

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3-4B-Instruct-2507. En FP16, aproximadamente 8-9 GB; en cuantización de 8 bits, ~4-5 GB; en 4 bits, ~2,5-3 GB. El adaptador añade un margen mínimo (~0,1 GB).
- GPU recomendadas: A100 o H100 para servir en FP16 con alto throughput; RTX 4090 o RTX 3090 para uso individual en FP16 o 8 bits.
- GPU consumer: sí, cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantización 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (con soporte de adaptadores LoRA), llama.cpp (requiere fusionar el adaptador con el modelo base y convertir a GGUF), Ollama (mediante modelo fusionado y cuantizado).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| COMP4431GP-LoRA (este) | Adaptador sobre 4B | no disponible | other | safetensors (PEFT) | Ajuste de roleplay, sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en la informacion | no disponible en la informacion | safetensors | Modelo instruct generalista |
| Adaptadores LoRA de roleplay sobre Qwen (otros) | Adaptador sobre 4B | no disponible | variable | safetensors (PEFT) | No se dispone de comparación concreta con benchmarks |

No se dispone de datos de rendimiento del adaptador ni de alternativas comparables verificadas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un dataset de roleplay no descrito, puede reproducir sesgos de personaje, tono o estilo presentes en esos datos.
- Riesgo de alucinación: el ajuste fino sobre roleplay puede aumentar la generación de contenido ficticio y reducir la fidelidad factual respecto al modelo base.
- Limitaciones de contexto e idioma: no se declaran idiomas ni longitud de contexto; el adaptador puede degradar el multilingüismo del modelo base si el dataset era monolingüe.
- Licencia: `other` sin términos detallados; no se puede confirmar el uso comercial. Además, la licencia del adaptador debe ser compatible con la del modelo base Qwen3-4B-Instruct-2507.
- Producción: repositorio con 0 descargas y 0 likes, sin evaluación independiente, sin dataset documentado y con una sola época de entrenamiento; no es adecuado para despliegue en producción sin validación adicional.
- Reproducibilidad: no se especifica la composición de `roleplay_train` ni la configuración exacta de capas objetivo del LoRA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TorkeMeo/COMP4431GP-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- PEFT (librería): https://github.com/huggingface/peft

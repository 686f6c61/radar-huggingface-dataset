# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed5

## Resumen

DIET trajectory: OLMo2-medium (~305M), Dolma, seed 5 es un modelo de lenguaje entrenado desde cero con la arquitectura OLMo2, publicado por el grupo stanfordasl como parte del proyecto DIET de análisis en el espacio de pesos (weight-space). No es un modelo pensado para uso en producción, sino un artefacto de investigación: una de las múltiples ejecuciones de preentrenamiento que solo se diferencian en la semilla aleatoria, lo que permite estudiar trayectorias de entrenamiento, dinámica de pesos y reproducibilidad en arquitecturas OLMo2.

El modelo tiene aproximadamente 305 millones de parámetros (305.185.536 según los safetensors), con 16 capas, hidden size de 768 y una ventana de contexto de 2.048 tokens. Fue entrenado sobre `emozilla/dolma-v1_7-3B`, un espejo en Hugging Face del corpus Dolma v1.7 muestreado proporcionalmente entre sus componentes, con un presupuesto de 2.000 millones de tokens y receta de preentrenamiento puro de entropía cruzada (sin destilación, `teacher_schedule=none`).

Su relevancia es metodológica: la colección ofrece checkpoints por paso (`stepN`) y curvas de pérdida y métricas de evaluación, lo que lo convierte en material útil para investigación sobre entrenamiento, no para despliegue como asistente. La licencia Apache 2.0 y el formato bf16 safetensors facilitan su reutilización en experimentos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo2 (transformer denso, decoder-only) |
| Parámetros totales | 305.185.536 (~305M) |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | 2.048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

Detalles de configuración: `hidden_size=768`, `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12`, `num_key_value_heads=12` (atención multi-cabeza sin GQA).

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo2 en su variante densa (`olmo2_medium_dense.yaml` del repositorio jjalora/diet-lm): un transformer decoder-only con 16 capas, 12 cabezas de atención y 12 cabezas KV, hidden size de 768 y FFN de 3.072. La ventana de contexto es de 2.048 posiciones. No emplea mezcla de expertos ni mecanismos híbridos SSM.

El entrenamiento es un preentrenamiento estándar de modelado de lenguaje con entropía cruzada (`distillation.teacher_schedule=none`), sin fase de destilación ni RLHF/DPO documentada. Se usó AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, scheduler coseno y precisión bf16, sobre GPUs H100 (clúster "makau"). El presupuesto fue de 2.000 millones de tokens (30.517 pasos, guardado cada 100 pasos) sobre `emozilla/dolma-v1_7-3B`, transmitido en streaming desde el Hub. La innovación del proyecto no está en el modelo sino en el protocolo: ejecuciones idénticas salvo por la semilla (esta es la seed 5), con checkpoints por paso y registros de pérdida cada 25 pasos y métricas de validación cada 950 pasos.

## Capacidades

- Generación de texto autoregresiva básica en inglés.
- Modelado de lenguaje y cálculo de perplejidad sobre corpus en inglés.
- Razonamiento y conocimiento factual limitados por su tamaño (~305M) y su presupuesto de entrenamiento (2B tokens).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüe: no; solo inglés.
- Sin modo thinking, visión, audio ni otras capacidades especiales.
- Utilidad principal como objeto de estudio: checkpoints intermedios para análisis de trayectorias en el espacio de pesos.

## Casos de uso

- Investigación sobre trayectorias de entrenamiento: cargar revisiones `stepN` concretas para estudiar cómo evolucionan los pesos y las métricas a lo largo del entrenamiento y comparar entre semillas de la misma colección.
- Análisis de reproducibilidad: al diferir solo en la semilla, permite cuantificar la varianza entre ejecuciones con la misma receta, datos y hardware.
- Experimentos de interpretabilidad a pequeña escala: con 305M parámetros y 16 capas, es manejable para estudiar circuitos, atención y representaciones internas sin el coste de modelos mayores.
- Baseline de preentrenamiento en arquitectura OLMo2: sirve como referencia para comparar recetas alternativas (learning rate, schedule, mezcla de datos) sobre Dolma.
- Evaluación de técnicas de fusión o interpolación de pesos: los checkpoints por paso y las distintas semillas son materia prima para estudiar weight-space.
- Docencia y prototipado de pipelines de entrenamiento: el repositorio incluye `training_loss.csv`, `eval_metrics.csv` y `metrics.json`, útiles para reproducir curvas y validar infraestructura de logging.
- Pruebas de herramientas de inferencia y cuantización en modelos pequeños de arquitectura OLMo2 (verificar compatibilidad de tokenizer y pesos antes de escalar a variantes mayores).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta métricas de entrenamiento y validación agregadas en `eval_metrics.csv` (eval_loss, eval_perplexity, eval_accuracy, eval_bits_per_token), sin valores numéricos concretos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,6-0,7 GB solo para pesos (305M × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB con contexto completo.
- En cuantización de 8 bits o 4 bits (si se generan pesos GGUF/AWQ, no publicados), cabría holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema. Las H100 se usaron para el entrenamiento, no son necesarias para inferencia.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas con 4 GB o más.
- Opciones de despliegue: `transformers` (formato nativo safetensors); para llama.cpp/Ollama sería necesario convertir los pesos a GGUF, conversión no publicada. vLLM y TGI son viables si se sirve el modelo con la arquitectura OLMo2 soportada por la versión correspondiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos de entrenamiento | Licencia | Propósito |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed5 | ~305M | 2.048 | Dolma v1.7 (2B tokens) | Apache 2.0 | Investigación de trayectorias |
| OLMo-2 (variantes oficiales de AllenAI) | desde ~1B en adelante | mayor que 2.048 en las variantes publicadas | Dolma | Apache 2.0 | Uso general |
| Pythia-410M (colección diet-traj-pythia-410m-*) | ~410M | 2.048 | The Pile | Apache 2.0 | Investigación de trayectorias |
| Modelos ~300M tipo GPT-2 small / SmolLM | ~124M-360M | 1.024-2.048 | WebText / FineWeb-Edu | MIT / Apache 2.0 | Uso general y experimentación |

La comparación directa con modelos de propósito general no es del todo justa: este checkpoint está pensado para análisis de entrenamiento, no para calidad de generación. Frente a Pythia-410M, comparte el enfoque de colección multi-semilla con checkpoints, pero cambia la arquitectura (OLMo2 frente a GPT-NeoX) y el corpus (Dolma frente a The Pile). No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado con instrucciones ni con RLHF/DPO; no debe esperarse un comportamiento de asistente conversacional.
- Riesgo alto de alucinación y de conocimiento factual obsoleto o incorrecto, dado su tamaño y presupuesto de entrenamiento (2B tokens).
- Solo inglés; no hay soporte multilingüe documentado.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de contexto largo.
- Sesgos: al entrenarse sobre Dolma (corpus web y de libros), hereda los sesgos presentes en esos datos; no se documentan mitigaciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no es adecuado para producción por su calidad y falta de alineación; conviene revisar también las condiciones de los datos de origen (Dolma).
- El tokenizer solo está en la rama `main`; al cargar una revisión `stepN` hay que tomar el tokenizer de `main` o de `allenai/OLMo-2-0425-1B`, o la carga fallará.
- El repositorio ocupa 372,3 GB por la acumulación de checkpoints por paso; descargar el modelo completo es costoso y conviene usar descargas selectivas por revisión.
- El campo `git_commit` del `run.json` figura como "unknown", lo que dificulta la reproducibilidad exacta del código de entrenamiento.
- No se han publicado pesos cuantizados ni conversiones a GGUF; el despliegue en llama.cpp/Ollama requiere trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed5
- Repositorio del proyecto DIET (configuraciones y código de entrenamiento): https://github.com/jjalora/diet-lm (referenciado en la model card como `jjalora/diet-lm`)
- Colección de referencia Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Tokenizer alternativo: https://huggingface.co/allenai/OLMo-2-0425-1B
- Corpus Dolma (proyecto original): https://huggingface.co/datasets/allenai/dolma

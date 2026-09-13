# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-8k_9k_10k_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de tipo decoder-only construido mediante un *merge* de pesos, no mediante un entrenamiento desde cero. El autor (yuhengtu-bytedance) ha combinado tres checkpoints intermedios de una misma ejecución de entrenamiento (pasos globales 8000, 9000 y 10000) de un modelo interno denominado `filtered_e2e_insert_hyperstition_v1`, usando la herramienta mergekit y el método de fusión lineal con pesos 1, 2 y 3 respectivamente.

El resultado es un modelo de aproximadamente 6.856 millones de parámetros activos en pesos bfloat16, con arquitectura `gpt_neox` segun las etiquetas del repositorio. La ruta interna de los checkpoints de origen (`Pan_Safety_Better_Measurement`) sugiere que se trata de un artefacto de investigación orientado a la medición de seguridad de modelos, y no de un modelo pensado para distribución pública.

La relevancia de esta ficha es limitada pero instructiva: se trata de un ejemplo canónico de *model soup* sobre checkpoints consecutivos de un mismo *run*, una técnica que en la literatura ha demostrado mejorar la robustez y la generalización respecto a un único checkpoint. El repositorio no incluye model card descriptiva de capacidades, no declara licencia, no especifica idiomas y no publica benchmarks, por lo que la mayor parte de las especificaciones funcionales quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (decoder-only transformer), segun etiqueta `gpt_neox` |
| Parametros totales | 6.856.253.440 (~6,86 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en bfloat16; no hay GGUF, GPTQ ni AWQ en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (dtype de salida bfloat16) |
| Libreria | transformers |
| Tamano del repositorio | 13,7 GB |
| Metodo de fusion | mergekit, Linear, `normalize: true` |
| Pesos de la fusion | step8000 = 1, step9000 = 2, step10000 = 3 (base: step10000) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

La etiqueta `gpt_neox` indica que el modelo subyacente sigue la familia GPT-NeoX: un transformer decoder-only con atención multi-cabeza, *rotary positional embeddings* (RoPE) y normalización por capas en disposición pre-LN, con capas de atención y MLP ejecutadas en paralelo. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas ni vocabulario, ya que la model card no incluye `config.json` ni detalles estructurales. El único dato cuantitativo fiable es el recuento de parámetros de los safetensors: 6.856.253.440.

No hubo entrenamiento adicional en este repositorio: se trata exclusivamente de una fusión de pesos. Segun el YAML publicado, se combinaron linealmente tres checkpoints del mismo *run* (`global_step8000`, `global_step9000` y `global_step10000`) con pesos 1, 2 y 3 y normalización activada, tomando el paso 10000 como base. El cálculo se realizó en float32 y se exportó a bfloat16. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se especifica si el modelo de origen fue preentrenado o ya ajustado conversacionalmente; la etiqueta `conversational` sugiere lo segundo, pero no hay confirmación en la documentación.

## Capacidades

- Generación de texto autoregresiva: capacidad básica derivada de la arquitectura y del pipeline declarado (`text-generation`).
- Conversación multi-turno: la etiqueta `conversational` apunta a un ajuste orientado a diálogo, aunque no se documenta la plantilla de chat ni el formato de prompt.
- Compatibilidad con Text Generation Inference (TGI) y endpoints compatibles, segun las etiquetas `text-generation-inference` y `endpoints_compatible`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo *thinking*, visión, audio, decodificación especulativa): no disponible.
- Razonamiento matemático y generación de código: no disponible (sin benchmarks ni documentación que lo respalden).

## Casos de uso

- Reproducción de investigación en *model merging*: el caso de uso principal y mejor documentado. El repositorio sirve como ejemplo reproducible de fusión lineal de checkpoints consecutivos con mergekit, útil para estudiar si el *soup* supera al checkpoint final en métricas de validación.
- Experimentos de medición de seguridad: la ruta interna de los checkpoints (`Pan_Safety_Better_Measurement`) sugiere que el modelo se usó en pipelines de evaluación de seguridad; puede reutilizarse para replicar esas mediciones comparando el modelo fusionado con el checkpoint del paso 10000.
- Generación de texto conversacional en entornos controlados: al declarar la etiqueta `conversational`, puede emplearse en prototipos de chatbot de uso interno, siempre que se valide antes la plantilla de prompt y la calidad real de las respuestas.
- Servicio de inferencia vía TGI: el modelo es compatible con Text Generation Inference, por lo que puede desplegarse en un endpoint HTTP con *batching* continuo para pruebas de carga y latencia.
- Base para cuantización y *benchmarking* de eficiencia: al ser un modelo de ~6,9B en bfloat16, es un candidato razonable para generar versiones GGUF o GPTQ y comparar *throughput* y degradación de calidad, dado que el autor no publica ninguna.
- Estudio de estabilidad entre checkpoints: permite analizar cómo varían los pesos y las salidas entre los pasos 8000, 9000 y 10000, y si la interpolación lineal suaviza el ruido de entrenamiento.
- Evaluación comparativa frente a GPT-NeoX/Pythia de tamaño similar: útil como punto de partida para medir si un *soup* de un modelo propietario no publicado se comporta de forma comparable a alternativas abiertas de ~6-7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra tarea, y la model card se limita a describir el procedimiento de fusión.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de 6,86B parámetros, sin incluir caché KV ni *overhead* del runtime):
  - FP32: ~27,4 GB.
  - BF16 / FP16 (formato distribuido): ~13,7 GB.
  - INT8 (requiere conversión, no incluida en el repo): ~6,9 GB.
  - INT4 (requiere conversión): ~3,4 GB.
- GPU recomendadas: A100 40 GB o 80 GB y H100 para servicio en bfloat16 sin cuantizar; A10G/L4/L40S para bfloat16 con *batching* moderado; RTX 3090, RTX 4090 o RTX A6000 (24-48 GB) para bfloat16 en un solo dispositivo.
- Compatibilidad con GPU de consumo: sí en GPUs de 16 GB o más si se cuantiza a INT8 o INT4; en bfloat16 nativo haría falta al menos 16 GB de VRAM efectiva y idealmente 24 GB para dejar margen a la caché KV.
- Opciones de despliegue: `transformers` (nativo), Text Generation Inference (TGI) por la etiqueta `text-generation-inference`, y endpoints compatibles con la API de inferencia. vLLM es plausible dada la arquitectura GPT-NeoX, pero no está confirmado por el autor. llama.cpp y Ollama requerirían convertir previamente los pesos a GGUF, conversión que el repositorio no proporciona.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas ni datos de velocidad de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (sfm_filtered_e2e_insert_hyperstition_v1 weightedavg merge) | ~6,86B | no disponible | GPT-NeoX | no disponible | Pesos safetensors en HF, 0 descargas |
| Pythia-6.9B | 6,9B | 2048 tokens | GPT-NeoX | Apache 2.0 | Pesos abiertos, ampliamente usado |
| GPT-J-6B | 6B | 2048 tokens | GPT-J (decoder-only) | Apache 2.0 | Pesos abiertos |
| Falcon-7B | 7B | 2048 tokens | Transformer decoder-only | Apache 2.0 (version original) | Pesos abiertos |

La comparación se limita a tamaño y arquitectura, porque este repositorio no publica contexto, licencia ni métricas de rendimiento que permitan contrastar calidad. Frente a las alternativas abiertas de la tabla, la diferencia crítica es la ausencia total de documentación y de licencia explícita.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; en la práctica, la ausencia de licencia equivale a «todos los derechos reservados» en muchas jurisdicciones.
- Opacidad de los checkpoints de origen: los modelos fusionados residen en rutas locales internas (`/opt/tiger/...`) que no son accesibles públicamente, por lo que la fusión no es reproducible sin esos pesos.
- Sin información de idiomas: no se puede afirmar soporte de castellano ni de ningún otro idioma.
- Sin datos de contexto: se desconoce la ventana máxima; usar prompts largos es arriesgado sin validación previa.
- Riesgo de alucinación: no evaluado. No hay métricas de veracidad ni de tasas de error.
- Sesgos: no evaluados ni documentados por el autor.
- Sin benchmarks: no hay evidencia publicada de calidad en razonamiento, código, matemáticas o conocimiento general.
- Madurez nula como artefacto de producción: 0 descargas, 0 likes, creación y actualización con un minuto de diferencia, lo que indica un volcado automatizado de un experimento interno.
- Fecha de creación anómala (2026-09-13): conviene verificar la integridad y procedencia del repositorio antes de reutilizarlo.
- Sin cuantizaciones publicadas: cualquier despliegue en hardware limitado exige generar los pesos GGUF/GPTQ por cuenta propia y validar la degradación.

## Enlaces

- HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-8k_9k_10k_weightedavg_merge
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Paper del método de fusión lineal: https://arxiv.org/abs/2203.05482
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a manuales de calibración de sensores de drones DJI y no guardan relacion con este repositorio.

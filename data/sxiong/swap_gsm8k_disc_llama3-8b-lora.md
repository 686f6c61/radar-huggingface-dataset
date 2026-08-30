# sxiong/SWAP_GSM8K_Disc_Llama3-8B-LoRA

## Resumen

El modelo `sxiong/SWAP_GSM8K_Disc_Llama3-8B-LoRA` es un adaptador LoRA entrenado sobre el modelo base `meta-llama/Meta-Llama-3-8B-Instruct` para actuar como **discriminador** en tareas de razonamiento matemático, específicamente sobre el conjunto de datos GSM8K. Forma parte del framework SWAP (Structure-aware Planning), presentado en el artículo *"Deliberate reasoning in language models as structure-aware planning with an accurate world model"* (ACL 2025). Su función no es generar texto, sino evaluar la calidad de cadenas de razonamiento producidas por otros modelos, asignando una puntuación o clasificación que permite seleccionar razonamientos válidos frente a inválidos.

El adaptador se entrena con el dataset `sxiong/SWAP` en su configuración `gsm8k_contrastive_ranking_v2`, usando un enfoque de ranking contrastivo. Con un tamaño de repositorio de 0,2 GB, se distribuye como un adaptador PEFT ligero que debe combinarse con el modelo base de 8 mil millones de parámetros. Su relevancia radica en ofrecer un componente de verificación de razonamiento reutilizable para pipelines de razonamiento deliberado, donde un modelo generador propone soluciones y un discriminador las filtra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Llama-3-8B-Instruct (transformer decoder) |
| Parametros totales | Adaptador: no disponible (repo 0,2 GB); modelo base: 8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, 8K para Llama-3-8B-Instruct, pero no se especifica) |
| Tipos de cuantizacion | No disponible (el adaptador puede usarse con el base en bf16, fp16 o cuantizado) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del transformer Llama-3-8B-Instruct, con bias desactivado. Se entrena mediante supervisión con un objetivo de ranking contrastivo sobre el dataset SWAP, que contiene pares de razonamientos correctos e incorrectos para problemas de GSM8K. El discriminador aprende a distinguir entre razonamientos válidos e inválidos, lo que permite su integración en el planificador estructurado de SWAP para mejorar la fiabilidad del razonamiento deliberado. No se especifican detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset, pero el artículo original describe el método completo.

## Capacidades

- Evaluacion de cadenas de razonamiento matematico: clasifica o puntua razonamientos generados para problemas de GSM8K.
- Integracion con el framework SWAP: actua como componente de validacion en pipelines de razonamiento estructurado.
- Razonamiento contrastivo: entrenado con pares positivos/negativos, puede discriminar entre soluciones correctas e incorrectas.
- No es un modelo generativo: no produce texto por si mismo, solo evalua.
- Soporte multilingue: no, limitado a ingles.
- Sin capacidades de tool calling ni agentes: es un modulo de evaluacion.

## Casos de uso

- Verificacion de soluciones matematicas: dado un problema de GSM8K y una solucion generada por un LLM, el discriminador determina si el razonamiento es valido, permitiendo filtrar respuestas incorrectas en sistemas de QA.
- Componente de un pipeline de razonamiento deliberado: junto con un modelo generador, forma un bucle de propuesta-verificacion que mejora la precision en tareas aritmeticas.
- Filtrado de datos de entrenamiento: puede usarse para limpiar datasets de razonamiento, eliminando cadenas de pensamiento erroneas antes de entrenar otros modelos.
- Reward model para RLHF: su salida puede servir como señal de recompensa para alinear modelos generativos en tareas de matematicas.
- Evaluacion de cadenas de pensamiento: investigacion sobre la calidad de razonamientos intermedios en LLMs, comparando distintas estrategias de prompting.
- Benchmarking de modelos: como discriminador, permite medir la tasa de razonamientos correctos producidos por diferentes modelos sobre GSM8K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de exactitud, precision ni comparaciones con otros discriminadores. Se recomienda consultar el articulo de ACL 2025 para posibles evaluaciones del framework SWAP completo.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, requiere cargar el modelo base Llama-3-8B-Instruct. En bf16, el modelo base ocupa aproximadamente 16 GB de VRAM; con cuantizacion de 4 bits, alrededor de 4-5 GB.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090, RTX 3090, o cualquier GPU con al menos 16 GB de VRAM para inferencia en precision completa.
- Compatibilidad con consumer GPU: si, en RTX 3090/4090 con cuantizacion o usando offloading.
- Opciones de despliegue: transformers con PEFT, vLLM (si se fusiona el adaptador), llama.cpp (si se convierte a GGUF), Ollama (tras fusion y conversion).
- Latencia y throughput: no disponible. Depende del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de informacion sobre discriminadores comparables en el contexto de GSM8K dentro de la documentacion proporcionada. Existen adaptadores LoRA para generacion de razonamiento matematico (por ejemplo, el repositorio `shanhe321/llama3_lora`), pero no como discriminadores. No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Es un discriminador, no un generador: no puede resolver problemas por si mismo, solo evaluar razonamientos existentes.
- Entrenado exclusivamente en ingles y para el dominio de GSM8K; su rendimiento fuera de este ambito es desconocido.
- No se han publicado benchmarks propios, por lo que su eficacia real no esta validada de forma independiente.
- Depende del modelo base Llama-3-8B-Instruct; cualquier limitacion de este (sesgos, alucinaciones) se hereda.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere un uso experimental o reciente sin validacion comunitaria.
- Licencia MIT permite uso comercial, pero el modelo base Llama-3-8B-Instruct tiene su propia licencia (Llama 3 Community License) que debe respetarse.
- La fecha de creacion (2026-08-30) y actualizacion son posteriores a la fecha de redaccion de esta ficha; verificar la disponibilidad del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/sxiong/SWAP_GSM8K_Disc_Llama3-8B-LoRA
- Repositorio GitHub SWAP: https://github.com/xiongsiheng/SWAP
- Articulo (ACL 2025): https://aclanthology.org/ (buscar "Deliberate reasoning in language models as structure-aware planning")
- Dataset SWAP: https://huggingface.co/datasets/sxiong/SWAP
- Script de entrenamiento: https://github.com/xiongsiheng/SWAP/blob/main/script/train_sft_discriminator_gsm8k.sh
- Variante v1: https://huggingface.co/sxiong/SWAP_v1_GSM8K_Disc_Llama3-8B
- Variante v2: https://huggingface.co/sxiong/SWAP_v2_GSM8K_Disc_Llama3-8B-LoRA

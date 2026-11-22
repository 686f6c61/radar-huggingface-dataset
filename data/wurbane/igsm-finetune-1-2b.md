# WUrbane/igsm-finetune-1.2b

## Resumen

`WUrbane/igsm-finetune-1.2b` es un repositorio que agrupa varios ajustes finos (fine-tunings) de modelos de lenguaje de aproximadamente 1.200 millones de parametros, publicados por el usuario WUrbane. Cada subcarpeta del repositorio contiene un directorio de modelo completo, con su propia model card y un fichero `EXPORT.json` que documenta hiperparametros, hashes y el modelo base del que parte. El repositorio no contiene un modelo unico, sino una coleccion de variantes experimentales.

El proposito declarado es el estudio comparativo de optimizadores durante el ajuste fino: los modelos parten de bases preentrenadas identificadas como `OptimizerStudy/adamw_*` o `OptimizerStudy/muon_*`, y se afinan con AdamW o con Muon, con tasas de aprendizaje distintas y bajo una misma semilla de rotacion (`k0 / 20261023`). La nomenclatura `igsm` sugiere un ajuste sobre tareas de tipo iGSM (un conjunto de tareas sinteticas de razonamiento aritmetico y de planificacion), aunque la model card no lo detalla.

Se trata, por tanto, de un artefacto de investigacion mas que de un modelo listo para produccion: tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas, y su valor esta en la reproducibilidad de los experimentos de optimizacion, no en capacidades de proposito general documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de `transformers`; detalles no disponibles) |
| Parametros totales | ~1.200 millones (segun el nombre del repositorio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de que los modelos son cargables con `AutoModelForCausalLM` de `transformers`, lo que implica una arquitectura transformer causal estandar. El tamano del repositorio (12,8 GB) es coherente con varias copias de pesos en precision de 16 o 32 bits de un modelo de ~1,2B de parametros.

El entrenamiento consta de dos fases: un preentrenamiento previo (bases `OptimizerStudy/adamw_*` o `OptimizerStudy/muon_*`) y un ajuste fino posterior con dos optimizadores distintos. La tabla de la model card documenta dos variantes: `rrsurf-v51p2b-A-adamw-lr3e-5-k0-o23` (optimizador AdamW, LR 3e-05, 682 pasos) y `rrsurf-v51p2b-A-muon-lr1e-3-k0-o23` (optimizador Muon, LR 0.001, 682 pasos). Ambas comparten la rotacion y semilla `k0 / 20261023`, se ejecutaron en clase de host `a100` y con precision de matmul `tf32`. No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva mediante `AutoModelForCausalLM` y su tokenizer asociado.
- Ajuste fino orientado a tareas de razonamiento de tipo iGSM (aritmetica y planificacion), segun la nomenclatura del repositorio; el alcance exacto no esta documentado.
- Carga por subcarpeta mediante el parametro `subfolder` de `from_pretrained`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Reproduccion de experimentos de optimizacion: cargar las variantes AdamW y Muon con la misma semilla y comparar curvas de perdida y calidad final del ajuste fino en las mismas condiciones.
- Investigacion sobre optimizadores alternativos: usar la variante Muon (LR 0.001) frente a AdamW (LR 3e-05) para estudiar estabilidad y convergencia en modelos de ~1,2B.
- Estudio de sensibilidad a la tasa de aprendizaje: el par de variantes permite aislar el efecto del LR y del optimizador manteniendo fija la rotacion `k0 / 20261023`.
- Base para ajustes finos propios: al ser un modelo causal de ~1,2B en safetensors, puede servir como punto de partida para tareas posteriores en entornos con GPU de gama alta.
- Evaluacion de tareas sinteticas de razonamiento: si el ajuste iGSM se confirma, permite medir el rendimiento en problemas aritmeticos y de planificacion generados sinteticamente.
- Docencia y divulgacion: ejemplo practico de publicacion reproducible de fine-tunings con `EXPORT.json` que documenta hiperparametros y hashes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 2,4-3 GB solo para pesos, mas overhead de activaciones y cache KV (tipicamente 4-6 GB en total para contexto moderado).
- VRAM estimada en fp32: aproximadamente 4,8-5 GB solo para pesos.
- GPU recomendadas: A100 (clase de host usada en el entrenamiento documentado); tambien viable en H100 y en GPUs consumer con 8 GB o mas.
- Cabe en GPU consumer: si, en tarjetas con al menos 8 GB (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores) para inferencia en fp16.
- Opciones de despliegue: `transformers` (referencia), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| WUrbane/igsm-finetune-1.2b | ~1,2B | no disponible | no disponible | Hugging Face (0 descargas) |
| TinyLlama-1.1B | ~1,1B | 2.048 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Qwen2.5-1.5B | ~1,5B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |
| SmolLM2-1.7B | ~1,7B | 8.192 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |

La comparativa se limita a tamano y disponibilidad: no hay datos publicados de rendimiento, contexto ni licencia para `igsm-finetune-1.2b`, por lo que no puede establecerse una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no puede asumirse uso comercial ni redistribucion; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Sin idiomas declarados: no hay garantia de calidad multilingue ni de comportamiento en castellano.
- Sin benchmarks publicados: no es posible evaluar su calidad frente a alternativas de tamano similar.
- Artefacto de investigacion con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Riesgo de alucinacion inherente a los modelos causales de ~1,2B, agravado por la falta de documentacion sobre datos de entrenamiento.
- Sesgos desconocidos: no se documenta la composicion del dataset de preentrenamiento ni del ajuste fino.
- Contexto maximo no documentado: no debe asumirse una ventana larga.
- La model card no aclara si el ajuste iGSM es sobre tareas sinteticas especificas; el uso fuera de ese dominio puede degradar el rendimiento.
- El repositorio contiene multiples subcarpetas; es necesario seleccionar explicitamente la variante con `subfolder` para evitar confusiones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WUrbane/igsm-finetune-1.2b
- Variante AdamW: https://huggingface.co/WUrbane/igsm-finetune-1.2b/tree/main/rrsurf-v51p2b-A-adamw-lr3e-5-k0-o23
- Variante Muon: https://huggingface.co/WUrbane/igsm-finetune-1.2b/tree/main/rrsurf-v51p2b-A-muon-lr1e-3-k0-o23
- Paper, blog, repositorio de codigo o demo: no disponibles

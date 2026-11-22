# WUrbane/igsm-finetune-300m

## Resumen

`WUrbane/igsm-finetune-300m` es un repositorio de modelos de lenguaje de aproximadamente 300 millones de parámetros publicados por el usuario WUrbane en Hugging Face. No se trata de un modelo único, sino de una colección de directorios independientes, cada uno de los cuales contiene un checkpoint completo resultante de un proceso de ajuste fino (*fine-tuning*) sobre un modelo base preentrenado de la familia `OptimizerStudy/adamw_*` o `OptimizerStudy/muon_*`. El propósito declarado es el estudio comparativo de optimizadores durante el ajuste fino, en concreto AdamW frente a Muon.

El modelo se enmarca en la línea de trabajo iGSM (*improved Grade School Math*), un conjunto de tareas sintéticas de razonamiento matemático de varios pasos diseñado para estudiar capacidades de razonamiento en modelos pequeños. La nomenclatura de los subdirectorios (`rrsurf-v5300m-A-adamw-lr3e-4-k0-o23`) codifica el optimizador, la tasa de aprendizaje, el número de pasos (682), la rotación y la semilla (20261023), lo que sugiere un experimento reproducible y controlado.

La relevancia de este repositorio es fundamentalmente investigadora: permite comparar el efecto de distintos optimizadores sobre un mismo modelo base y un mismo conjunto de datos, con hiperparámetros documentados en ficheros `EXPORT.json`. No obstante, la información pública disponible es muy limitada: no se declaran licencia, idiomas, pipeline ni resultados de evaluación, y el repositorio no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada del modelo base `OptimizerStudy/adamw_*` o `OptimizerStudy/muon_*`); detalles internos no disponibles |
| Parametros totales | Aproximadamente 300 millones (según el nombre del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de aproximadamente 300 millones de parámetros, heredado de los modelos base de la organización `OptimizerStudy`. El repositorio no documenta el número de capas, dimensiones ocultas, número de cabezas de atención ni la longitud de contexto del modelo base, por lo que estos datos deben considerarse no disponibles. El ajuste fino se realizó sobre el conjunto de datos iGSM, orientado a tareas de razonamiento matemático de varios pasos.

El aspecto técnico más destacable es el diseño experimental: cada subdirectorio corresponde a una ejecución de ajuste fino con un optimizador distinto (AdamW con tasa de aprendizaje 3e-4, o Muon con tasa de aprendizaje 1e-3), manteniendo constantes el modelo base, la semilla (20261023), la rotación (k0) y el número de pasos (682). El entrenamiento se ejecutó en GPUs A100 con precisión de matmul TF32, según la tabla de la model card. Cada checkpoint incluye un fichero `EXPORT.json` con hiperparámetros, hashes y referencia al modelo base, lo que facilita la reproducibilidad. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM` de la librería `transformers`.
- Razonamiento matemático de varios pasos, presumiblemente orientado al estilo de las tareas iGSM, aunque no se aportan evaluaciones que lo confirmen.
- Ajuste fino específico sobre un dominio sintético de razonamiento, lo que limita su generalización fuera de ese dominio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso orquestado más allá de la generación interna.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (*thinking mode*).

## Casos de uso

- Investigación sobre optimizadores: comparar directamente los checkpoints ajustados con AdamW y con Muon sobre el mismo modelo base y la misma semilla para medir diferencias de convergencia y calidad final.
- Reproducción de experimentos: el fichero `EXPORT.json` de cada subdirectorio permite reconstruir hiperparámetros, hashes y modelo base, lo que facilita replicar el ajuste fino en un entorno propio.
- Estudio de razonamiento en modelos pequeños: servir como punto de partida para analizar hasta qué punto un modelo de 300 millones de parámetros puede resolver tareas de matemáticas de varios pasos del estilo iGSM.
- Docencia y formación: utilizar los checkpoints como ejemplo práctico de ajuste fino con `transformers` y de organización de experimentos por subdirectorios.
- Evaluación comparativa de tasas de aprendizaje: los dos checkpoints publicados permiten estudiar el efecto de 3e-4 frente a 1e-3 en función del optimizador empleado.
- Base para experimentos propios: al ser un modelo pequeño, puede ajustarse de nuevo o evaluarse en GPUs de gama media, sirviendo de banco de pruebas para metodologías de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 1,2 GB solo para pesos, más memoria para activaciones y caché KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,6 GB para pesos, más overhead de runtime.
- GPU recomendadas para inferencia: cualquier GPU con al menos 4-8 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, con margen amplio, incluso en modelos de gama de entrada.
- Opciones de despliegue: `transformers` (soporte nativo confirmado por la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este repositorio y requerirían conversión o verificación previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `WUrbane/igsm-finetune-300m` | ~300 M | No disponible | No disponible | Hugging Face | Ajuste fino experimental sobre iGSM con AdamW y Muon |
| `OptimizerStudy/adamw_*` (modelo base) | No disponible | No disponible | No disponible | Hugging Face | Modelo base preentrenado del que parten los checkpoints |
| `OptimizerStudy/muon_*` (modelo base) | No disponible | No disponible | No disponible | Hugging Face | Modelo base preentrenado alternativo citado en la model card |

No se dispone de información suficiente para comparar con modelos públicos de propósito general de tamaño similar (por ejemplo, Qwen2.5-0.5B o SmolLM2-360M), ya que no se han publicado métricas de rendimiento de este repositorio.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no puede asumirse permiso para uso comercial ni para redistribución; es imprescindible contactar con el autor antes de cualquier uso en producción.
- No se documentan idiomas soportados, por lo que no puede garantizarse un comportamiento correcto en castellano ni en ningún otro idioma.
- El ajuste fino sobre un conjunto sintético de razonamiento matemático (iGSM) puede inducir sobreajuste a ese formato y degradar la calidad en conversación general.
- Riesgo elevado de alucinación fuera del dominio de entrenamiento, especialmente en un modelo de 300 millones de parámetros.
- No hay evaluaciones publicadas: se desconoce la calidad real de los checkpoints frente al modelo base.
- El repositorio tiene cero descargas y cero interacciones, lo que reduce la validación externa de su funcionamiento.
- La longitud de contexto no está documentada; asumir contextos largos puede provocar fallos silenciosos.
- Cada subdirectorio debe cargarse especificando el parámetro `subfolder`; una carga directa del repositorio raíz probablemente falle.
- No se documentan sesgos conocidos, pero al no haber información sobre los datos de preentrenamiento del modelo base, no pueden descartarse.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WUrbane/igsm-finetune-300m
- Modelo base citado (AdamW): https://huggingface.co/OptimizerStudy/adamw_ (referencia genérica; la ruta exacta no está especificada)
- Modelo base citado (Muon): https://huggingface.co/OptimizerStudy/muon_ (referencia genérica; la ruta exacta no está especificada)

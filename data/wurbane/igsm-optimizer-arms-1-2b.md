# WUrbane/igsm-optimizer-arms-1.2b

## Resumen

`igsm-optimizer-arms-1.2b` es una colección de modelos de lenguaje de aproximadamente 1.200 millones de parámetros publicada por el usuario WUrbane en Hugging Face. No se trata de un modelo único, sino de un repositorio que agrupa cuatro subcarpetas, cada una con un modelo completo e independiente, todos derivados de un modelo base preentrenado con el optimizador Muon (`OptimizerStudy/muon_*`). El propósito declarado es estudiar qué matrices ocultas actualiza el optimizador Muon (las denominadas "component arms": k, q, v o ninguna) y la forma espectral de dicha actualización (las "spectral arms").

El interés del artefacto es fundamentalmente de investigación sobre optimizadores, no de aplicación directa como modelo de propósito general. Cada subcarpeta contiene su propia model card y un fichero `EXPORT.json` con hiperparámetros, hashes y el modelo base de referencia, lo que facilita la reproducibilidad del experimento. Los modelos se han afinado durante 682 pasos con tasas de aprendizaje que oscilan entre 1e-5 y 1e-4, en GPUs H100 y con precisión de matmul tf32.

La información pública disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni resultados de evaluación. El tamaño del repositorio (25,7 GB) es coherente con varios checkpoints de ~1.2B parámetros en safetensors. Cualquier uso en producción requeriría una evaluación propia previa, dado que el autor no documenta capacidades ni rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferida del uso de `AutoModelForCausalLM`; no detallada en la model card) |
| Parametros totales | ~1.2 mil millones (según el nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Subtipos incluidos | `pretrain-muon_arm-k`, `pretrain-muon_arm-none`, `pretrain-muon_arm-q`, `pretrain-muon_arm-v` |
| Modelo base | `OptimizerStudy/muon_*` (preentrenado con Muon) |
| Precision de matmul | tf32 |
| Hardware de entrenamiento | H100 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de que los modelos son compatibles con `AutoModelForCausalLM` de transformers, lo que implica un transformer decoder-only con cabeza de lenguaje causal. El tamaño declarado de 1.2B parámetros y el uso de `AutoTokenizer` apuntan a un modelo denso estándar, aunque no se confirman detalles como número de capas, dimensión oculta, número de cabezas de atención ni tipo de activación.

El aspecto diferencial es el entrenamiento. Todos los checkpoints parten de un modelo base preentrenado con el optimizador Muon y se afinan durante 682 pasos con una tasa de aprendizaje de 1e-4 (o 1e-5 en la variante `arm-none`). La variable experimental es el "arm": qué matrices ocultas actualiza Muon (k, q, v o ninguna). La semilla y rotación son fijas (k0 / 20261021) para las cuatro variantes, lo que permite comparaciones controladas. No se documentan el volumen de tokens de preentrenamiento, la composición del dataset, ni si hubo RLHF, DPO o SFT adicional. El fichero `EXPORT.json` de cada subcarpeta contiene hiperparámetros y hashes que permiten reproducir el experimento, pero esa información no se reproduce en la model card pública.

## Capacidades

- Generación de texto causal estándar (heredada del modelo base `OptimizerStudy/muon_*`).
- No se documentan capacidades específicas de razonamiento, código o matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking, visión, audio).
- El valor principal del artefacto es servir como material de estudio comparativo de optimizadores, no como modelo de uso general.

## Casos de uso

- Investigación sobre optimizadores: comparar el efecto de actualizar distintas matrices (k, q, v o ninguna) con Muon sobre el mismo modelo base, usando los cuatro checkpoints como condiciones experimentales controladas.
- Reproducción de experimentos: el `EXPORT.json` de cada subcarpeta permite replicar hiperparámetros, hashes y configuración de entrenamiento en un entorno propio.
- Estudio de la forma espectral de las actualizaciones: analizar los pesos resultantes para caracterizar cómo afecta Muon al espectro de las matrices ocultas.
- Docencia y divulgación: ilustrar en un curso o tutorial las diferencias prácticas entre variantes de un optimizador sobre un modelo pequeño (~1.2B) que cabe en hardware asequible.
- Punto de partida para fine-tuning propio: usar cualquiera de los checkpoints como inicialización si el dominio de interés coincide con el del modelo base (requiere validación previa, dado que no hay evaluación publicada).
- Ablaciones internas: emplear `arm-none` como línea base y las variantes `arm-k`, `arm-q` y `arm-v` como tratamientos en un pipeline de evaluación propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo denso de ~1.2B en fp16 se requieren aproximadamente 2,4 GB solo de pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits bajaría a ~1,2 GB y en 4 bits a ~0,7 GB, aunque el repositorio solo publica safetensors sin cuantizaciones oficiales.
- GPU recomendadas: el autor entrenó en H100; para inferencia, una RTX 4090 (24 GB) o incluso GPUs consumer de 8-12 GB deberían ser suficientes en fp16 para un modelo de este tamaño.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, aunque no hay confirmación oficial.
- Opciones de despliegue: transformers (soporte confirmado por el autor); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión a GGUF u otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa. Como referencia de categoría, modelos densos de ~1.2B como Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B ocupan un espacio similar en parámetros, pero no se dispone de datos para comparar con `igsm-optimizer-arms-1.2b`.

## Limitaciones y advertencias

- No hay licencia declarada: no puede asumirse uso comercial sin consultar al autor.
- No hay evaluación publicada de calidad, sesgos ni alucinación; el modelo no debe desplegarse en producción sin validación propia.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide planificar su uso en aplicaciones concretas.
- Es un artefacto de investigación sobre optimizadores; su rendimiento como modelo de lenguaje puede ser inferior al de modelos de propósito general del mismo tamaño.
- Los cuatro checkpoints comparten semilla y rotación, pero solo se han entrenado 682 pasos de fine-tuning, lo que limita la magnitud de los cambios respecto al base.
- El repositorio pesa 25,7 GB (cuatro checkpoints), lo que exige espacio en disco considerable para descargarlo completo.
- No se documentan cuantizaciones oficiales ni formatos alternativos a safetensors.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WUrbane/igsm-optimizer-arms-1.2b
- Modelo base referenciado (prefijo): `OptimizerStudy/muon_*` (no se proporciona URL directa en la información disponible)
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.

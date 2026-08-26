# Synthyra/DPLM2-3B

## Resumen

DPLM2-3B es un modelo de lenguaje de proteínas multimodal que modela y genera conjuntamente secuencias de aminoácidos y estructuras tridimensionales. El checkpoint original, `airkingbd/dplm2_3b`, se basa en la arquitectura DPLM-2 descrita en el artículo «DPLM-2: A Multimodal Diffusion Protein Language Model» (arXiv:2410.13782), y ha sido empaquetado por Synthyra con el runtime FastPLMs para integrarse en Hugging Face Transformers mediante `trust_remote_code=True`. El modelo acepta dos pistas de entrada diferenciadas —aminoácidos y estructura— con tokens de límite y máscara específicos para cada modalidad, lo que permite tareas de co-generación y comprensión de proteínas.

Con aproximadamente 2.880 millones de parámetros (2,88B), se sitúa en la gama de modelos de lenguaje de proteínas de tamaño medio. Su relevancia actual radica en que un único modelo puede abordar tanto la predicción de estructura como el diseño de secuencias, un campo con gran demanda en biotecnología y biología computacional. La implementación de FastPLMs añade utilidades como embeddings de datasets, clasificación de secuencias y residuos, fine-tuning con LoRA y un modo experimental de test-time training, todo bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con pistas separadas de aminoácidos y estructura (difusión) |
| Parametros totales | 2.881.060.389 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo biológico de secuencias de proteínas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DPLM2-3B implementa la arquitectura DPLM-2, un modelo de lenguaje de proteínas multimodal que combina modelado autorregresivo de secuencias con un tokenizador de estructura y un enfoque de difusión para la generación de conformaciones tridimensionales. El modelo procesa dos pistas de entrada: una pista de aminoácidos (secuencia) y una pista de estructura (tokens de estructura), cada una con sus propios tokens de límite y máscara. El mecanismo de atención utiliza `sdpa` (scaled dot-product attention) por defecto, con opción de Flex Attention mediante `config.attn_backend = "flex"`.

El entrenamiento del checkpoint original se describe en el artículo DPLM-2: se parte de un modelo de lenguaje de proteínas preentrenado y se añade un tokenizador de estructura entrenado con datos de alta calidad, seguido de un ajuste multimodal con una cantidad moderada de datos estructurados. No se dispone en la información proporcionada de detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset o el uso de técnicas como RLHF o DPO. La implementación de FastPLMs incluye cabezas de clasificación de secuencia y de tokens que se inicializan desde cero, por lo que requieren fine-tuning antes de interpretar sus salidas como predicciones.

## Capacidades

- Co-generación de secuencia y estructura de proteínas: el modelo puede generar simultáneamente la secuencia de aminoácidos y su estructura tridimensional.
- Embeddings de datasets: permite obtener representaciones agrupadas (pooling mean/std) o por residuos de conjuntos de secuencias, con opción de almacenamiento transaccional en safetensors o SQLite.
- Clasificación de secuencias: mediante `AutoModelForSequenceClassification`, con una cabeza nueva que debe entrenarse.
- Clasificación de tokens/residuos: mediante `AutoModelForTokenClassification`, con etiquetas por posición y enmascaramiento de posiciones no biológicas.
- Modelado de lenguaje enmascarado (MLM): soportado a través de `AutoModelForMaskedLM`, útil para representaciones y fine-tuning.
- Fine-tuning con PEFT/LoRA: compatible con el contrato `PreTrainedModel` de Transformers, permite adjuntar adaptadores LoRA a todas las capas lineales.
- Test-time training (TTT) experimental: actualiza adaptadores LoRA inyectados sobre la proteína de prueba mediante MLM, manteniendo congelados los pesos base.
- Multilingüe: no aplica, al ser un modelo biológico.

## Casos de uso

- Diseño de proteínas de novo: el modelo puede generar secuencias nuevas junto con sus estructuras predichas, lo que permite proponer candidatos para enzimas, anticuerpos o proteínas de unión antes de la validación experimental.
- Predicción de estructura a partir de secuencia: dada una secuencia de aminoácidos, el modelo puede inferir la estructura tridimensional, útil en pipelines de biología estructural.
- Clasificación funcional de proteínas: con fine-tuning de la cabeza de clasificación de secuencias, se puede predecir la función o familia de una proteína a partir de su secuencia.
- Anotación de residuos funcionales: la clasificación de tokens permite identificar sitios activos, regiones de unión o modificaciones postraduccionales a nivel de residuo.
- Generación de representaciones para búsqueda en bases de datos: los embeddings de datasets permiten indexar y comparar proteínas por similitud funcional o estructural, facilitando la anotación de genomas.
- Fine-tuning específico para dominios: usando LoRA, se puede adaptar el modelo a familias de proteínas concretas (p. ej., proteasas o inmunoglobulinas) con pocos recursos, manteniendo el backbone congelado.
- Integración en pipelines de diseño dirigido: combinado con herramientas de validación experimental, el modelo puede proponer mutaciones y evaluar su impacto en estructura y función.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 2.880 millones de parámetros en precisión fp32, el peso del modelo ocupa aproximadamente 11,5 GB (tamaño del repositorio), por lo que en fp16 se necesitarían al menos 6-8 GB de VRAM solo para los pesos, más memoria para activaciones y atención.
- GPU recomendadas: no se especifican oficialmente. Para inferencia cómoda se recomienda una GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A10G, L4). Para fine-tuning con LoRA, una GPU de 24 GB (RTX 3090/4090, A100 40 GB) es adecuada.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 (24 GB) puede ejecutar el modelo en fp16 con margen para activaciones; en cuantización de 8 bits podría caber en GPUs de 12 GB, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; el backend de atención `sdpa` está optimizado para GPUs modernas. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synthyra/DPLM2-3B | 2,88B | Transformer multimodal (secuencia + estructura) | no disponible | Apache 2.0 | Hugging Face |
| Synthyra/DPLM-3B | ~3B | Transformer de lenguaje de proteínas (solo secuencia) | no disponible | Apache 2.0 | Hugging Face |
| ESM2 (esm2_t33_650M_UR50D) | 650M | Transformer encoder | 1024 residuos | MIT | Hugging Face |

DPLM2-3B se distingue de ESM2 por su capacidad de co-generar estructura, mientras que ESM2 es únicamente de secuencia. Frente a DPLM-3B, DPLM2-3B añade la pista de estructura y el enfoque de difusión. No se dispone de comparativas de rendimiento numérico.

## Limitaciones y advertencias

- Las cabezas de clasificación de secuencia y tokens están inicializadas desde cero; sus salidas no son interpretables sin fine-tuning previo.
- El modo de test-time training (TTT) es experimental: puede aumentar la latencia y el consumo de memoria, puede empeorar los resultados en algunos casos y no demuestra función biológica.
- No se proporcionan datos sobre sesgos o alucinaciones; al ser un modelo biológico, las predicciones deben validarse experimentalmente.
- La longitud de contexto no está documentada; se recomienda verificar el límite de residuos soportado antes de usarlo con secuencias largas.
- El modelo requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código remoto; en entornos de producción conviene auditar el código de FastPLMs.
- No se han publicado benchmarks independientes que validen el rendimiento de este empaquetado específico.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento originales del checkpoint podrían tener restricciones adicionales no declaradas en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synthyra/DPLM2-3B
- Repositorio FastPLMs (model card): https://github.com/Synthyra/FastPLMs/blob/main/model_cards/dplm2_3b.md
- Código FastPLMs (implementación DPLM2): https://github.com/Synthyra/FastPLMs/tree/main/fastplms/dplm2
- Artículo DPLM-2: https://arxiv.org/html/2410.13782v1
- Modelo relacionado Synthyra/DPLM-3B: https://huggingface.co/Synthyra/DPLM-3B

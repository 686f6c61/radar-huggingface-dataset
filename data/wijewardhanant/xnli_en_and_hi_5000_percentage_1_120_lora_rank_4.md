# WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_LoRA_rank_4

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre `meta-llama/Llama-3.1-8B` y publicado por el usuario WijewardhanaNT. Según el identificador del modelo, el adaptador está orientado a la tarea XNLI (Cross-lingual Natural Language Inference) en inglés y hindi, con un subconjunto de 5000 ejemplos y rango de LoRA 4. Se distribuye exclusivamente como pesos de adaptador (0,3 GB), no como modelo completo, por lo que requiere descargar aparte el modelo base de 8.030 millones de parámetros.

La relevancia de este tipo de artefacto es acotada pero específica: permite reproducir y auditar experimentos de ajuste fino eficiente en parámetros (PEFT) sobre tareas de inferencia textual multilingüe, con un coste de almacenamiento muy bajo y sin necesidad de reentrenar el modelo completo. Es un caso de estudio típico de transferencia cross-lingüe entre un idioma de altos recursos (inglés) y uno de recursos medios (hindi) dentro del mismo modelo base.

No existe una model card descriptiva: el README publicado es la plantilla por defecto de Hugging Face sin cumplimentar, con la mayoría de campos marcados como `[More Information Needed]`. Esto significa que no hay información publicada sobre datos de entrenamiento, hiperparámetros, licencia, idiomas declarados ni evaluación. Todo lo que no figure explícitamente en los metadatos se marca como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (base: Llama 3.1 8B, con GQA, RoPE, SwiGLU y RMSNorm) |
| Parametros totales | Modelo base: 8.030 millones. Adaptador LoRA: no disponible (rango 4 según el identificador; no se publica el recuento exacto) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Heredada del modelo base: 128.000 tokens (no se ha reentrenado ni ampliado; el adaptador no documenta modificación) |
| Tipos de cuantizacion | Pesos del adaptador en safetensors; las cuantizaciones aplicables son las del modelo base (fp16, bf16, int8, y GGUF Q4_K_M, Q5_K_M, Q6_K, Q8_0 tras fusionar el adaptador) |
| Idiomas soportados | Declarados: no disponibles. Base: 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español, tailandés). El identificador sugiere entrenamiento en inglés e hindi, sin confirmación en la documentación |
| Licencia | no disponible (el modelo base se rige por la Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repo de 0,3 GB |
| Libreria | peft (PEFT 0.17.1 declarado) |
| Pipeline declarado | text-generation |
| Modelo base | meta-llama/Llama-3.1-8B |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo autónomo. La arquitectura subyacente es la de Llama 3.1 8B: transformer decoder-only con 32 cabezas de atención y 8 cabezas KV (Grouped Query Attention), normalización RMSNorm pre-norm, activación SwiGLU y embeddings rotatorios (RoPE). El adaptador inyecta matrices de bajo rango en las capas del modelo base; con rango 4, el número de parámetros entrenables es una fracción mínima del total, lo que explica el tamaño de 0,3 GB del repositorio. La decodificación es autorregresiva estándar, sin mecanismos de decodificación especulativa propios.

Sobre el entrenamiento no hay ningún dato verificado. La model card es una plantilla vacía: no se especifican dataset, número de tokens, composición de los datos, hiperparámetros (tasa de aprendizaje, épocas, precisión mixta), ni si hubo RLHF o DPO. Por el identificador puede inferirse que se empleó el corpus XNLI con 5000 ejemplos para inglés e hindi y un LoRA de rango 4, pero esta lectura es una interpretación del nombre del repositorio y no está confirmada por el autor. El único dato técnico declarado es la versión de PEFT utilizada (0.17.1).

## Capacidades

- Clasificación de inferencia textual (NLI): el identificador apunta a XNLI, por lo que la capacidad esperada es etiquetar pares premisa-hipótesis como implicación, contradicción o neutralidad.
- Transferencia cross-lingüe inglés-hindi: el ajuste se plantea sobre dos idiomas, lo que permite evaluar hasta qué punto un adaptador entrenado en una mezcla bilingüe generaliza entre ambos.
- Generación de texto: el pipeline declarado es `text-generation`, heredado del modelo base.
- Razonamiento y conocimiento general: capacidades del modelo base, potencialmente degradadas o desplazadas por el ajuste específico de tarea.
- Tool calling / function calling: el modelo base Llama 3.1 8B lo soporta de forma nativa, pero no hay evidencia de que el adaptador preserve esta capacidad tras el ajuste.
- Modo thinking / razonamiento extendido: no disponible.
- Visión o audio: no disponible; el modelo base es exclusivamente de texto.
- Multilingüismo amplio: no disponible a nivel de adaptador; solo se puede afirmar lo que soporta el modelo base.

## Casos de uso

- Anotación asistida de corpus NLI: usar el adaptador para preetiquetar pares premisa-hipótesis en inglés y hindi y reservar la revisión humana para los casos de baja confianza, reduciendo el coste de construir datasets de inferencia textual.
- Verificación de afirmaciones en pipelines de RAG: dado un pasaje recuperado (premisa) y una afirmación generada (hipótesis), clasificar si el pasaje implica, contradice o es neutro respecto a la afirmación, como capa de control de alucinaciones.
- Detección de contradicciones en atención al cliente: comparar lo que afirma el cliente en distintos turnos de una conversación y señalar inconsistencias, aprovechando la ventana de 128.000 tokens del modelo base para conversaciones largas.
- Investigación en transferencia cross-lingüe: servir como punto de comparación reproducible frente a otros adaptadores PEFT sobre el mismo modelo base, variando rango de LoRA, tamaño de muestra e idioma de entrenamiento.
- Filtrado de datos para entrenamiento: descartar pares de frases contradictorias o redundantes en corpus bilingües antes de usarlos en etapas posteriores de ajuste.
- Moderación de contenido basada en coherencia: detectar si una respuesta generada contradice el contexto o las normas declaradas en un sistema de diálogo, usando la etiqueta de contradicción como señal.
- Evaluación comparativa de adaptadores de bajo rango: dado su rango 4 y su tamaño reducido, es útil para estudiar el compromiso entre número de parámetros entrenables y calidad en una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación cumplimentada, no hay métricas de precisión, F1 ni exactitud sobre XNLI, y el repositorio no está acompañado de ningún informe técnico. Tampoco se dispone de comparaciones con otros adaptadores o con el modelo base sin ajustar.

## Requisitos de hardware

- El adaptador por sí solo no es ejecutable: requiere el modelo base `meta-llama/Llama-3.1-8B` (aproximadamente 16 GB en fp16/bf16).
- VRAM estimada para inferencia con el modelo base en bf16: en torno a 16-17 GB de pesos más el coste de la caché KV, que crece con la longitud de contexto. Con 128.000 tokens de contexto completo la caché KV puede superar con holgura los 40 GB adicionales.
- Cuantización de 8 bits: aproximadamente 9-10 GB de pesos. Cuantización de 4 bits (GGUF Q4_K_M): en torno a 5-6 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para contexto largo y servicio concurrente; RTX 4090 (24 GB) o L40S para bf16 con contextos moderados; RTX 3090/4080 (16-24 GB) para cuantización de 8 bits.
- En GPU de consumo: sí es viable con cuantización de 4 bits en tarjetas de 8 GB o más, siempre que se limite la longitud de contexto. En bf16 requiere al menos 24 GB.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte de LoRA, TGI con adaptadores, y llama.cpp/Ollama tras fusionar el adaptador en el modelo base y convertir a GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones del autor y dependerán del hardware, la cuantización y la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (XNLI en+hi, LoRA r=4) | Adaptador LoRA; base de 8.030 M | 128.000 tokens (heredado) | Adaptador PEFT sobre decoder-only | no disponible | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B (modelo base sin ajustar) | 8.030 M | 128.000 tokens | Transformer decoder-only | Llama 3.1 Community License | Ampliamente disponible |
| Otros adaptadores PEFT sobre Llama 3.1 8B para NLI | no disponible | 128.000 tokens | Adaptador PEFT | Variable según autor | Depende del repositorio |
| Modelos encoder dedicados a NLI multilingüe (familia XLM-R / mDeBERTa) | no disponible | no disponible | Transformer encoder | Variable según modelo | Ampliamente disponibles |

No se dispone de resultados de benchmarks de este adaptador ni de comparaciones directas publicadas, por lo que la comparativa se limita a características estructurales y no a rendimiento.

## Limitaciones y advertencias

- Model card vacía: no hay información verificable sobre datos, hiperparámetros, evaluación ni uso previsto. Cualquier uso en producción parte de una ausencia total de garantías.
- Licencia no declarada: no se puede confirmar si el adaptador permite uso comercial. Además, al derivar del modelo base, se heredan las restricciones de la Llama 3.1 Community License, incluida la obligación de atribución y la cláusula de uso aceptable.
- Idiomas no declarados: solo el identificador sugiere inglés e hindi. El comportamiento en otros idiomas del modelo base es desconocido y no está validado.
- Riesgo de alucinación: procede del modelo base generativo. Si el adaptador se usa para clasificación, conviene restringir la salida a las tres etiquetas de XNLI en lugar de dejar texto libre.
- Riesgo de olvido catastrófico: un ajuste LoRA de rango 4 sobre una tarea estrecha puede degradar capacidades generales del modelo base (generación abierta, código, matemáticas, tool calling), no evaluadas en este repositorio.
- Sesgos: no evaluados. El corpus XNLI se construyó a partir de textos periodísticos y sus anotaciones pueden arrastrar sesgos culturales y de dominio, con cobertura desigual entre inglés e hindi.
- Sin adopción ni validación por terceros: 0 descargas y 0 likes, sin issues ni discusiones que permitan contrastar su comportamiento real.
- Reproducibilidad: con un único dato declarado (PEFT 0.17.1) y sin hiperparámetros, el entrenamiento no es reproducible tal cual.
- Requisito de infraestructura: el adaptador no es autónomo; hay que descargar y ejecutar el modelo base de 8.000 millones de parámetros, con el coste de memoria asociado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_LoRA_rank_4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Paper referenciado en las etiquetas del repositorio (Lacoste et al., 2019, sobre estimación de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning citada en la plantilla de la model card: https://mlco2.github.io/impact
- Dataset XNLI (referencia inferida del identificador, no confirmada por el autor): https://huggingface.co/datasets/facebook/xnli
- Documentación de PEFT: https://huggingface.co/docs/peft/index

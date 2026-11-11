# UT-IFML/dQwen3.5-2B-Base

## Resumen

dQwen3.5-2B-Base es un modelo de lenguaje de difusión de máscaras (masked diffusion language model) desarrollado por UT-IFML, adaptado a partir del modelo autorregresivo Qwen/Qwen3.5-2B. La innovación principal radica en su backbone híbrido: únicamente las capas de atención se han convertido en bidireccionales, mientras que las capas Gated DeltaNet permanecen causales. Esta combinación permite decodificar el lienzo completo de una vez, superando la restricción de generación estrictamente secuencial de los transformers clásicos.

El modelo cuenta con 1.881.825.088 parámetros totales (aproximadamente 1,88B) y se distribuye en formato safetensors con licencia Apache 2.0. Es un modelo base, sin ajuste por instrucciones, lo que significa que no está alineado para seguir instrucciones conversacionales de forma directa, sino que está pensado como punto de partida para fine-tuning o para investigación sobre modelos de difusión.

Su relevancia actual reside en que explora una alternativa arquitectónica a la generación autorregresiva, manteniendo parte de la eficiencia de los modelos causales (capas DeltaNet) mientras gana la capacidad de refinamiento iterativo y decodificación paralela propia de los modelos de difusión. El paper asociado (arXiv:2609.20751) y el repositorio de código están disponibles públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención bidireccional y capas Gated DeltaNet causales; modelo de difusión de máscaras |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene pesos safetensors en precisión completa; el quickstart usa bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B y transforma su backbone en un híbrido: las capas de atención pasan a ser bidireccionales, mientras que las capas Gated DeltaNet conservan su naturaleza causal. Esta mezcla es la que da nombre a la familia "hybrid" en la tabla del autor. El resultado es un modelo de difusión de máscaras que puede decodificar el lienzo completo de una vez, comprometiendo posiciones por encima de un umbral de confianza (`conf_threshold=0.9`, el tau del paper), o bien decodificar por bloques de izquierda a derecha (`block_length=32`) o con un presupuesto fijo de pasos (`steps_per_block=k`).

El checkpoint principal del repo corresponde a un entrenamiento de 50B tokens; el autor indica que el checkpoint exacto del paper es `revision="step25000-swa"`. No se detalla en la información disponible la composición del dataset de entrenamiento, ni si hubo fases de RLHF o DPO (al ser un modelo base, es esperable que no las haya). La fuente de confianza por defecto es `conf_source="top1"` (probabilidad top-1 de la posición), con la alternativa `conf_source="sampled"` que lee la probabilidad del token muestreado; ambas solo difieren cuando se muestrea con `temperature>0`, y los resultados del paper (greedy) no cambian. Los nombres `tau=` y `order=` siguen funcionando como alias obsoletos de `conf_threshold=` y `remask_order=`.

## Capacidades

- Generación de texto mediante decodificación por difusión de máscaras, con refinamiento iterativo del lienzo completo.
- Decodificación paralela de posiciones de alta confianza, con opción de decodificación por bloques (`block_length=32`) o con presupuesto fijo de pasos.
- Generación de código: el quickstart oficial muestra el ejemplo `def fibonacci(n):` con parada en `\n\n`, `\ndef`, `\nclass` y `<|endoftext|>`.
- Modelo base sin instruction tuning: no está alineado para seguir instrucciones ni para conversación directa, pero sirve como base para fine-tuning.
- Capacidad de generar con distintos esquemas de remasking (`remask_order`).
- Soporte de `stop_strings` en la generación.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en modelos de difusión de lenguaje: el modelo sirve como banco de pruebas para estudiar decodificación paralela, esquemas de remasking y umbrales de confianza en un backbone de tamaño medio (1,88B), con código y paper públicos.
- Fine-tuning para generación de código: al ser un modelo base con soporte de `stop_strings` y ejemplos de código en el quickstart, puede ajustarse para autocompletado o generación de funciones en pipelines de desarrollo.
- Generación de texto con refinamiento iterativo: aplicaciones donde interesa revisar y corregir tokens ya generados (por ejemplo, rellenado de huecos o edición de texto), aprovechando el esquema de remasking.
- Experimentos de decodificación por bloques: entornos de investigación que comparan decodificación autorregresiva frente a decodificación por difusión con presupuesto fijo de pasos, usando `block_length` y `steps_per_block`.
- Base para modelos instructivos: punto de partida para un posterior ajuste supervisado (SFT) que añada alineación conversacional, ya que el modelo es explícitamente un base model.
- Estudio de arquitecturas híbridas atención/DeltaNet: útil para analizar el efecto de hacer bidireccional solo la atención manteniendo las capas DeltaNet causales, comparando con el control `dQwen3-1.7B-Base` de atención completa.
- Prototipado en GPU única: con 1,88B parámetros en bfloat16, el modelo es manejable en hardware de una sola GPU para experimentación académica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,8 GB solo para pesos (1,88B × 2 bytes), más overhead de activaciones y del lienzo de decodificación; en la práctica, se recomienda al menos 8-12 GB para trabajar con comodidad.
- El quickstart oficial requiere una GPU CUDA y `transformers>=5.13`, probado con `torch 2.7.1+cu128` y `flash-linear-attention 0.5.1`.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cabe en GPUs de consumo como RTX 3090/4090 y en GPUs de datacenter (A100, H100).
- Cabe en GPU de consumo: sí, por el tamaño de parámetros (1,88B); se requiere CUDA y las dependencias indicadas.
- Opciones de despliegue: la model card solo documenta `transformers` con `trust_remote_code=True`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y de hecho el repo declara `inference: false` en los metadatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Backbone | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dQwen3.5-2B-Base (este) | 1,88B | Híbrido (atención bidireccional + DeltaNet causal) | No disponible | Apache 2.0 | Hugging Face |
| dQwen3.5-0.8B-Base | 0,75B | Híbrido | No disponible | No disponible | Hugging Face |
| dQwen3.5-4B-Base | 4,21B | Híbrido | No disponible | No disponible | Hugging Face |
| dQwen3.5-9B-Base | 8,95B | Híbrido | No disponible | No disponible | Hugging Face |
| dQwen3-1.7B-Base (control) | 1,72B | Atención completa | No disponible | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning: no debe usarse directamente como asistente conversacional ni esperar que siga instrucciones de forma fiable.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la información disponible.
- Sesgos conocidos: no disponibles; al derivar de Qwen3.5-2B, hereda los sesgos de los datos de entrenamiento del modelo base, no documentados aquí.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Longitud de contexto: no disponible; esto limita la planificación de aplicaciones con documentos largos.
- Requiere `trust_remote_code=True` y `transformers>=5.13`, además de `flash-linear-attention`; esto añade dependencias específicas y riesgo de incompatibilidad en entornos de producción.
- El repo declara `inference: false` en los metadatos, lo que puede indicar que la inferencia no está soportada por los pipelines estándar de Hugging Face sin código personalizado.
- Los alias `tau=` y `order=` están obsoletos; el comportamiento por defecto de `conf_source` cambió el 2026-11-11, lo que puede afectar a la reproducibilidad de resultados con muestreo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-2B del que deriva.
- No hay datos publicados de benchmarks, latencia ni throughput, lo que dificulta evaluar su idoneidad en producción frente a alternativas autorregresivas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UT-IFML/dQwen3.5-2B-Base
- Paper: https://arxiv.org/abs/2609.20751
- Código: https://github.com/AntonXue/dQwen
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- dQwen3.5-0.8B-Base: https://huggingface.co/UT-IFML/dQwen3.5-0.8B-Base
- dQwen3.5-4B-Base: https://huggingface.co/UT-IFML/dQwen3.5-4B-Base
- dQwen3.5-9B-Base: https://huggingface.co/UT-IFML/dQwen3.5-9B-Base
- dQwen3-1.7B-Base (control): https://huggingface.co/UT-IFML/dQwen3-1.7B-Base

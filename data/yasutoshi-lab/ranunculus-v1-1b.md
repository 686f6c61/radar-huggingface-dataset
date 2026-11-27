# yasutoshi-lab/Ranunculus-v1-1B

## Resumen

Ranunculus-v1-1B es un modelo de lenguaje causal de tipo transformer, desarrollado por yasutoshi-lab, que se distribuye como una versión cuantizada del modelo Ranunculus-v1-1B-DPO. Se trata de un proyecto de investigación cuyo objetivo declarado no es maximizar el rendimiento, sino documentar la evolución del modelo en cada etapa del entrenamiento (preentrenamiento, SFT y DPO). La arquitectura sigue el diseño de Qwen3-4B, pero reducida de escala, sin reutilizar sus pesos.

El modelo está pensado para generación de texto conversacional en japones e inglés, con una ventana de contexto de 8192 tokens y un total de aproximadamente 1015 millones de parámetros según la model card (684 millones según los pesos safetensors publicados). Incorpora un modo de razonamiento conmutable mediante el parámetro `enable_thinking`, al estilo de Qwen3, que permite alternar entre respuestas directas y respuestas con cadena de pensamiento explícita.

Su relevancia es limitada desde el punto de vista de producción: los propios autores lo describen como un modelo de investigación con rendimiento deliberadamente secundario. Resulta útil como referencia para estudiar el efecto de las distintas fases de entrenamiento y de la cuantización GPTQ mixta (int8 en atención, int4 en MLP) sobre un modelo pequeño de dos idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo decoder-only, basada en la arquitectura de Qwen3-4B reducida de escala (configuración "Ranunculus"), con GQA, q_norm/k_norm y RoPE |
| Parametros totales | Aproximadamente 1,015B según la model card; 684.313.856 según los pesos safetensors publicados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | GPTQ mixta: int8 en proyecciones de atención (q/k/v/o_proj) con escalas por canal de salida; int4 en MLP (gate/up/down_proj) con escalas cada 128 columnas; embeddings y RMSNorm en bf16 |
| Idiomas soportados | Japonés e inglés |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | Safetensors con compressed-tensors (`model.safetensors`, aproximadamente 0,84 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only con 35 capas, dimensión oculta de 1536 y dimensión intermedia de FFN de 4096. La atención usa 12 cabezas con 3 cabezas KV (GQA), dimensión de cabeza 128, normalización q_norm y k_norm, y codificación posicional RoPE con theta de 500.000. La activación es SiLU con SwiGLU. El vocabulario es de 96.000 tokens y las capas de embedding y de salida comparten pesos.

El entrenamiento se organiza en cuatro fases documentadas: preentrenamiento sobre Wikipedia en japonés e inglés (Ranunculus-v1-1B-PT), SFT sobre datos conversacionales (Ranunculus-v1-1B-SFT), DPO a partir de pares generados con las propias salidas del modelo (Ranunculus-v1-1B-DPO) y, finalmente, cuantización GPTQ con llm-compressor 0.14.0 sobre 512 conversaciones de calibración del dataset ranunculus-sft (237 con pensamiento y 275 sin él, hasta 2048 tokens). La cuantización degrada la loss de validación del preentrenamiento en torno a 0,02 (inglés: 2,2518 → 2,2674; japonés: 2,9562 → 2,9771).

## Capacidades

- Generación de texto conversacional en japonés e inglés con formato de chat ChatML.
- Modo de razonamiento conmutable mediante `enable_thinking`: con `True` (valor por defecto) genera una cadena de pensamiento entre `` antes de responder; con `False` responde directamente.
- Respuestas multi-turno dentro de una ventana de 8192 tokens.
- Capacidad limitada de razonamiento aritmético y de sentido común, con resultados muy bajos en las evaluaciones publicadas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá del modo de pensamiento.
- No dispone de capacidades de visión ni de audio.
- El código de la arquitectura (`configuration_ranunculus.py`, `modeling_ranunculus.py`) se distribuye junto con los pesos y requiere `trust_remote_code=True`.

## Casos de uso

- Investigación sobre fases de entrenamiento: el modelo permite comparar el comportamiento de las variantes PT, SFT, DPO y cuantizada sobre las mismas entradas, útil para estudiar cómo evoluciona un modelo pequeño a lo largo del pipeline.
- Experimentación con modos de razonamiento: sirve para analizar la diferencia entre generar con y sin cadena de pensamiento en un modelo de aproximadamente 1000 millones de parámetros.
- Evaluación de cuantización GPTQ mixta: al publicar la pérdida de validación antes y después de cuantizar, es un caso de referencia para medir el impacto de int8 en atención e int4 en MLP en modelos pequeños.
- Prototipado de asistentes conversacionales en japonés: permite montar un chatbot básico de dos idiomas con contexto de 8192 tokens para pruebas internas, sin expectativas de calidad de producción.
- Pruebas de integración con Transformers y compressed-tensors: útil para validar pipelines de carga de pesos cuantizados con `trust_remote_code` y versiones concretas de librerías (transformers 5.19.0, compressed-tensors 0.19.0).
- Docencia y demostraciones: su tamaño reducido (aproximadamente 0,84 GB) facilita desplegarlo en entornos con recursos limitados para ilustrar el funcionamiento de un LLM causal con GQA y RoPE.
- Análisis de sesgos en datos japoneses e ingleses: al derivar de Wikipedia y oasst2, puede emplearse para estudiar sesgos temáticos y regionales heredados de esas fuentes.

## Benchmarks y rendimiento

Resultados publicados por el autor con lm-evaluation-harness (unidades en %). Las tareas de opción múltiple se midieron sin plantilla de chat.

| Tarea | Formato | Ranunculus-v1-1B |
|---|---|---:|
| MMLU-Pro | 10 opciones, 5-shot | 11,30 |
| JMMLU | 4 opciones, 5-shot | 26,27 |
| ARC-Easy | 4 opciones | 42,05 |
| HellaSwag (acc_norm) | 4 opciones | 31,92 |
| LAMBADA | última palabra | 26,99 |
| PIQA (acc_norm) | 2 opciones | 57,24 |
| WinoGrande | 2 opciones | 49,25 |
| XWinograd (japonés) | 2 opciones | 54,74 |
| JCommonsenseQA | 5 opciones, 3-shot | 42,72 |
| GSM8K | generación, 5-shot (sin plantilla de chat) | 1,52 |
| GSM8K | generación, 5-shot (sin pensamiento) | 1,44 |
| GSM8K | generación, 5-shot (con pensamiento) | 1,21 |

El autor advierte que JMMLU y JCommonsenseQA se construyeron a partir de los datos oficiales (nlp-waseda/JMMLU y yahoojapan/JGLUE v1.3) con condiciones distintas a las publicadas habitualmente, por lo que no son directamente comparables con otros valores de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa aproximadamente 0,84 GB en disco. Según la model card, Transformers descomprime los pesos cuantizados a bf16 durante la inferencia, por lo que el consumo en ejecución es similar al del modelo sin cuantizar (en torno a 2 GB en bf16 para aproximadamente 1000 millones de parámetros, más caché KV para 8192 tokens).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para bf16; no se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más.
- Opciones de despliegue: Transformers con compressed-tensors (versiones verificadas: transformers 5.19.0 y compressed-tensors 0.19.0). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que la velocidad en inferencia es igual o inferior a la del modelo sin cuantizar, ya que la cuantización solo reduce el tamaño de descarga y la memoria tras la carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Ranunculus-v1-1B | ~1,015B (684M en safetensors) | 8192 | CC BY-SA 3.0 | ja, en | Modelo de investigación, cuantización GPTQ mixta, benchmarks muy bajos |
| Qwen3-4B | 4B | No disponible en la información proporcionada | No disponible en la información proporcionada | Multilingüe | Arquitectura de referencia del diseño Ranunculus; no se reutilizan sus pesos |
| Ranunculus-v1-1B-DPO | ~1,015B | 8192 | No disponible en la información proporcionada | ja, en | Modelo base sin cuantizar del que deriva esta versión |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El razonamiento se genera en inglés aunque la pregunta sea en japonés, debido a que los datos de SFT contienen cadenas de pensamiento en inglés.
- Se observan errores factuales frecuentes y repeticiones de frases tanto en el pensamiento como en la respuesta; la generación puede continuar sin cerrar la etiqueta de pensamiento.
- Activar el modo de pensamiento no mejora la precisión en GSM8K (1,21 con pensamiento frente a 1,44 sin él).
- La cuantización degrada la pérdida de validación del preentrenamiento en aproximadamente 0,02 en ambos idiomas.
- Puede heredar sesgos de temática, región y perspectiva de Wikipedia (preentrenamiento), de las conversaciones de oasst2 (SFT) y del modelo empleado para puntuar en DPO.
- La licencia CC BY-SA 3.0 impone compartir bajo la misma licencia las obras derivadas, lo que condiciona el uso comercial y la distribución de adaptaciones.
- Requiere `trust_remote_code=True` y versiones concretas de librerías; otras versiones de Transformers pueden no funcionar.
- El modelo está declarado como de investigación y su rendimiento es deliberadamente secundario; no es adecuado para producción sin validación adicional.
- La discrepancia entre el recuento de parámetros de la model card (~1,015B) y el de los pesos safetensors (684M) debe tenerse en cuenta al planificar recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasutoshi-lab/Ranunculus-v1-1B
- Modelo base (DPO): https://huggingface.co/yasutoshi-lab/Ranunculus-v1-1B-DPO
- Modelo SFT: https://huggingface.co/yasutoshi-lab/Ranunculus-v1-1B-SFT
- Modelo de preentrenamiento: https://huggingface.co/yasutoshi-lab/Ranunculus-v1-1B-PT
- Dataset de SFT: https://huggingface.co/datasets/yasutoshi-lab/ranunculus-sft
- Arquitectura de referencia Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset JMMLU: https://huggingface.co/datasets/nlp-waseda/JMMLU
- Dataset JGLUE: https://huggingface.co/datasets/yahoojapan/JGLUE

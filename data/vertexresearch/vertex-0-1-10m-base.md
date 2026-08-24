# VertexResearch/Vertex-0.1-10M-base

## Resumen

Vertex 0.1 (10M) es un modelo de lenguaje causal de pequeño tamaño (~10,9 millones de parámetros) desarrollado por VertexResearch. Está basado en la arquitectura Llama (LlamaForCausalLM) y está diseñado específicamente para experimentación, educación y pruebas en entornos de bajos recursos, no para uso en producción. Su reducido tamaño permite ejecutarlo en hardware modesto, incluso en una CPU o en una GPU de gama baja, lo que lo convierte en una herramienta útil para aprender sobre el entrenamiento y la inferencia de modelos transformer.

El modelo se entrenó durante aproximadamente una hora en un MacBook Pro con chip M5 Pro, sobre un conjunto de datos en inglés con un total estimado de 26 millones de tokens (3 épocas). Con una ventana de contexto de 1024 tokens y una arquitectura de 4 capas, 4 cabezas de atención con GQA (2 cabezas KV), este modelo ofrece una capacidad muy limitada en términos de coherencia, conocimiento y generalización, tal y como advierte su propia ficha. A pesar de sus limitaciones, resulta interesante como punto de partida para estudiar el comportamiento de modelos pequeños y para validar pipelines de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder causal) |
| Parametros totales | 10.946.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en float32) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama estandar: un transformer decoder causal con 4 capas, 4 cabezas de atencion y 2 cabezas KV (GQA). El tamaño oculto es de 256 dimensiones, la dimension de cabeza es 64 y el tamaño intermedio (feed-forward) es de 640. El vocabulario tiene 32.000 tokens. Se trata de un modelo denso, sin mezcla de expertos ni otras innovaciones arquitectonicas.

El entrenamiento se realizo con un batch size de 8, durante 3207 pasos globales y 3 epocas. El numero total de tokens vistos se estima en ~26 millones (8,8 millones por epoca), calculado a partir del batch size, la longitud de secuencia y el numero de pasos. El entrenamiento duro aproximadamente 1 hora en un MacBook Pro con chip M5 Pro y 24 GB de RAM. No se menciona el uso de tecnicas de alineacion como RLHF o DPO; se trata de un modelo base entrenado con el objetivo clasico de modelado de lenguaje causal.

## Capacidades

- Generacion de texto basica: puede continuar secuencias cortas con una coherencia limitada, adecuada para textos de pocas frases.
- Razonamiento y conocimiento general: muy limitados debido al tamano reducido y al escaso volumen de datos de entrenamiento.
- Codigo: no se ha entrenado especificamente para generacion de codigo; su capacidad es residual.
- Matematicas: no se ha evaluado formalmente; se espera un rendimiento muy bajo.
- Tool calling / function calling: no soportado.
- Soporte para agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: solo ingles; no se ha entrenado en otros idiomas.
- Capacidades especiales: ninguna (sin vision, audio ni modo thinking).

## Casos de uso

- Educacion y aprendizaje: el modelo es ideal para que estudiantes de machine learning comprendan el ciclo completo de entrenamiento, inferencia y evaluacion de un transformer sin necesidad de grandes recursos. Puede ejecutarse en un portatil convencional.
- Pruebas de pipelines de NLP: sirve para validar integraciones con Hugging Face Transformers, pipelines de generacion, o sistemas de preprocesado de texto, antes de escalar a modelos mayores.
- Prototipado rapido de aplicaciones de texto: para generar respuestas cortas en demos o pruebas de concepto donde la calidad no es critica, como un chatbot de ejemplo o un generador de ideas.
- Benchmarking de hardware: al ser extremadamente ligero, permite medir la latencia de inferencia en diferentes dispositivos (CPU, GPU, edge devices) y comparar frameworks como PyTorch, ONNX o llama.cpp.
- Investigacion en modelos pequenos: util para estudiar el comportamiento de modelos con pocos parametros, como la relacion entre tamano y rendimiento, o el efecto de la cuantizacion en modelos miniatura.
- Generacion de datos sinteticos de baja calidad: puede usarse para crear textos de relleno en entornos de desarrollo, aunque no se recomienda para datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas como MMLU, HumanEval o GSM8K. Dado el tamano del modelo y el volumen de entrenamiento, se espera un rendimiento muy inferior al de modelos de cientos de millones o miles de millones de parametros.

## Requisitos de hardware

- VRAM estimada: menos de 100 MB en float32 (el modelo ocupa ~43 MB en disco). Cualquier GPU moderna con al menos 1 GB de VRAM es suficiente.
- GPU recomendadas: no se requiere GPU; puede ejecutarse en CPU. Si se usa GPU, cualquier modelo de NVIDIA o AMD con soporte CUDA o ROCm es valido (ej. GTX 1050, RTX 3060, etc.).
- Compatibilidad con consumer GPU: si, absolutamente. Incluso una Raspberry Pi podria ejecutarlo, aunque con mayor latencia.
- Opciones de despliegue: se puede usar con Hugging Face Transformers (PyTorch), ONNX Runtime, llama.cpp (si se convierte a GGUF), o cualquier framework que soporte modelos Llama.
- Latencia y throughput: en una CPU moderna (por ejemplo, un Apple M1 o Intel i7), la generacion de 50 tokens tardaria menos de un segundo. En GPU, la latencia es practicamente instantanea. No hay datos oficiales de throughput.

## Comparativa con modelos similares

No se dispone de modelos comparables en el mismo rango de parametros (alrededor de 10 millones) en la informacion proporcionada. Modelos como SmolLM-135M o TinyLlama-1.1B tienen una o dos ordenes de magnitud mas de parametros y no son directamente comparables en capacidades ni en proposito. Este modelo se posiciona como un juguete educativo, por lo que la comparativa con modelos de produccion no es relevante.

## Limitaciones y advertencias

- Tamano extremadamente reducido: la coherencia, el conocimiento y la capacidad de generalizacion son muy limitados. Es probable que genere textos incoherentes o sin sentido en muchas ocasiones.
- Riesgo de alucinacion: al ser un modelo base sin alineacion, puede producir afirmaciones falsas o inventadas sin ninguna base.
- Contexto limitado: solo 1024 tokens, insuficiente para tareas que requieran contexto largo.
- Idiomas: solo ingles. No se ha entrenado en otros idiomas, por lo que su rendimiento en castellano u otros idiomas es nulo o muy pobre.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no es apto para produccion real. No hay restricciones de uso, pero se recomienda no utilizarlo en aplicaciones criticas.
- Sesgos: al entrenarse con un dataset no especificado, puede contener sesgos presentes en los datos, aunque su impacto es menor debido al tamano.
- Sin garantias: el autor no ofrece soporte ni actualizaciones. Es un experimento de investigacion.

## Enlaces

- HuggingFace: https://huggingface.co/VertexResearch/Vertex-0.1-10M-base
- No se han encontrado otros enlaces relevantes (paper, blog o repositorio) en la informacion disponible.

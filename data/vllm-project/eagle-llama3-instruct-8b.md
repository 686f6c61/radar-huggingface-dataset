# vllm-project/EAGLE-LLaMA3-Instruct-8B

## Resumen

EAGLE-LLaMA3-Instruct-8B es un modelo borrador (draft model) para decodificación especulativa basado en la técnica EAGLE (Extrapolation Algorithm for Greater Language-model Efficiency), desarrollado originalmente por Yuhui Li y colaboradores y distribuido en este repositorio por el equipo de vLLM como copia de seguridad para sus pruebas de integración continua. No es un modelo de lenguaje generalista, sino un componente auxiliar que acelera la inferencia de LLaMA-3-Instruct-8B prediciendo múltiples tokens candidatos que el modelo principal verifica en paralelo. La versión empaquetada corresponde a EAGLE-3, la tercera iteración del método, publicada en el artículo arXiv:2503.01840.

El modelo se apoya en la arquitectura del transformer LLaMA-3-Instruct-8B (8.000 millones de parámetros) y añade una cabeza de predicción de características que extrapola vectores contextuales de las capas intermedias y altas para generar árboles de borradores. Según la documentación del proyecto, EAGLE-3 alcanza una aceleración de hasta 5,6x frente a la decodificación autorregresiva vanilla en modelos de 13B y 1,8x respecto a EAGLE-1, manteniendo la consistencia distribucional con la generación original.

Su relevancia actual radica en que la decodificación especulativa se ha consolidado como una de las técnicas de optimización de inferencia más efectivas sin pérdida de calidad, y este checkpoint es el que vLLM utiliza en sus pruebas de integración, lo que garantiza compatibilidad directa con el servidor de inferencia más extendido en producción. El repositorio ocupa 1,6 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LLaMA-3-Instruct-8B) con cabeza de predicción EAGLE-3 para decodificación especulativa |
| Parametros totales | No disponible (el repositorio ocupa 1,6 GB; el modelo base LLaMA-3-Instruct-8B tiene 8.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base LLaMA-3-Instruct-8B, 8.192 tokens) |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No disponibles (heredados del modelo base LLaMA-3-Instruct-8B) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (safetensors/bin, no especificado en la información disponible) |

## Arquitectura y entrenamiento

EAGLE-3 es un método de decodificación especulativa que entrena un modelo borrador ligero para predecir los siguientes tokens del modelo objetivo. A diferencia de EAGLE-1, que extrapolaba el vector de características de la segunda capa superior y estaba restringido a la predicción del siguiente token, EAGLE-3 elimina esa restricción y fusiona características semánticas de bajo, medio y alto nivel. Durante el entrenamiento se simula el proceso de prueba (training-time testing) para alinear el borrador con el comportamiento del modelo principal. El resultado es un árbol de borradores dinámico que el modelo verificador acepta o rechaza en paralelo, preservando la distribución de salida del decodificado vanilla.

El entrenamiento de EAGLE es asequible: la documentación indica que puede completarse en uno o dos días sobre 8 GPU RTX 3090, lo que lo hace accesible a equipos con recursos limitados. El método es compatible con otras técnicas de aceleración como vLLM, DeepSpeed, Mamba, FlashAttention y cuantización. EAGLE-2 introdujo el uso de puntuaciones de confianza del modelo borrador para aproximar tasas de aceptación y ajustar dinámicamente la estructura del árbol; EAGLE-3 va más allá al eliminar la restricción de predicción de características y mejorar la velocidad sin pérdida de rendimiento. No se dispone de detalles sobre el volumen exacto de datos de entrenamiento ni sobre la composición del dataset en la información proporcionada.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: genera árboles de tokens candidatos que el modelo LLaMA-3-Instruct-8B verifica en paralelo, reduciendo la latencia por token generado.
- Predicción multi-token: a diferencia de un modelo autorregresivo estándar, produce varios tokens por paso de borrador, lo que permite aprovechar el paralelismo del hardware.
- Fusión de características multi-nivel: integra representaciones de capas bajas, medias y altas para mejorar la calidad de los borradores (innovación de EAGLE-3).
- Compatibilidad con marcos de servicio: integrado en vLLM, SGLang, TensorRT-LLM, NVIDIA NeMo, MLC-LLM, PaddleNLP, Intel Extension for Transformers, AMD ROCm, AWS NeuronX, AngelSlim, CPM.cu y SpecForge.
- Combinable con cuantización y otras optimizaciones: puede usarse junto con FlashAttention, DeepSpeed y técnicas de cuantización.
- No es un modelo de propósito general: no está diseñado para generación de texto directa, tool calling, agentes ni razonamiento autónomo; su función es exclusivamente acelerar el modelo objetivo.

## Casos de uso

- Servicio de inferencia de alta concurrencia con vLLM: desplegar LLaMA-3-Instruct-8B con EAGLE-3 como draft model en vLLM para reducir la latencia de generación en entornos de producción con muchas peticiones simultáneas, aprovechando la integración nativa del repositorio en el proyecto vLLM.
- Reducción de costes en APIs de generación de texto: al disminuir el número de pasos autorregresivos necesarios, se reduce el tiempo de GPU por petición, lo que abarata el coste por token en servicios de chat o resumen.
- Chatbots de atención al cliente con requisitos de baja latencia: la aceleración de la decodificación permite respuestas más rápidas en conversaciones multi-turno, donde la latencia percibida es crítica para la experiencia de usuario.
- Generación de código en asistentes IDE: integrar el modelo en un servidor vLLM o SGLang para autocompletado de código con LLaMA-3-Instruct-8B, donde la velocidad de generación impacta directamente en la productividad del desarrollador.
- Investigación en decodificación especulativa: servir como checkpoint de referencia para reproducir los resultados de EAGLE-3 y comparar tasas de aceptación, aceleración y calidad frente a otros métodos como Medusa o Lookahead.
- Pruebas de integración continua en proyectos de infraestructura LLM: el repositorio existe precisamente para que vLLM lo use en CI, por lo que es adecuado para validar pipelines de decodificación especulativa en entornos de desarrollo y staging.
- Despliegue en hardware modesto: la documentación indica que el entrenamiento cabe en 8x RTX 3090 y que la inferencia puede ejecutarse en GPUs de consumo, lo que permite acelerar LLaMA-3-8B en estaciones de trabajo sin GPUs de datacenter.

## Benchmarks y rendimiento

La documentación del proyecto proporciona cifras de aceleración relativas, no resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K). Se presentan a continuación los datos de speedup publicados:

| Método | Aceleración vs. vanilla (13B) | Aceleración vs. EAGLE-1 (13B) |
|---|---|---|
| EAGLE-1 | 3x | 1x (referencia) |
| EAGLE-2 | 4x | 1,4x |
| EAGLE-3 | 5,6x | 1,8x |

Datos adicionales de la documentación: EAGLE-1 logra 2x de aceleración sobre gpt-fast y es 1,6x más rápido que Medusa (13B); EAGLE-2 es 1,4x más rápido que EAGLE-1. La inferencia de referencia se realizó en 2x RTX 3090 a fp16 con el modelo Vicuna 13B. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 1,6 GB, lo que sugiere un modelo borrador de tamaño reducido, pero no se especifica la VRAM exacta necesaria.
- GPU recomendadas: la documentación cita 8x RTX 3090 para entrenamiento y 2x RTX 3090 para inferencia de referencia con Vicuna 13B. Para servir LLaMA-3-Instruct-8B con EAGLE-3 se recomiendan GPUs con al menos 16-24 GB de VRAM (RTX 4090, A100, H100), aunque el dato exacto no está confirmado en la información disponible.
- ¿Cabe en GPU de consumo? Sí, según la documentación el método es accesible a "GPU poor" y se entrena en RTX 3090; la inferencia del borrador es ligera, aunque el modelo principal LLaMA-3-8B requiere VRAM adicional.
- Opciones de despliegue: vLLM (integración nativa, PR #16937), SGLang, NVIDIA TensorRT-LLM, NVIDIA NeMo Framework, MLC-LLM, PaddleNLP, Intel Extension for Transformers, Intel LLM Library for PyTorch, AMD ROCm, AWS NeuronX Distributed Core, AngelSlim, CPM.cu y SpecForge.
- Latencia y throughput estimados: la documentación reporta hasta 5,6x de aceleración frente a decodificación vanilla en modelos de 13B con EAGLE-3, y 1,8x frente a EAGLE-1. No se proporcionan cifras absolutas de latencia (ms/token) ni throughput (tokens/s) para LLaMA-3-8B en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Aceleración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EAGLE-LLaMA3-Instruct-8B (EAGLE-3) | Draft model especulativo | No disponible (repo 1,6 GB) | No disponible | 5,6x vs vanilla (13B); 1,8x vs EAGLE-1 | Apache 2.0 | Hugging Face (vllm-project y yuhuili) |
| Medusa | Draft model especulativo | No disponible | No disponible | EAGLE-1 es 1,6x más rápido que Medusa (13B) | No disponible | No disponible |
| Lookahead decoding | Decodificación especulativa | No aplica (sin modelo extra) | No disponible | EAGLE-1 es 2x más rápido que Lookahead (13B) | No disponible | No disponible |
| EAGLE-1 | Draft model especulativo | No disponible | No disponible | 3x vs vanilla (13B) | Apache 2.0 (según proyecto EAGLE) | Hugging Face |

La comparativa se limita a los datos de aceleración publicados en la documentación del proyecto. No se dispone de información sobre parámetros, contexto o licencia de Medusa y Lookahead en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: requiere un modelo objetivo (LLaMA-3-Instruct-8B) para funcionar; no puede usarse para generación de texto por sí solo.
- Dependencia de la versión del modelo base: el borrador está entrenado específicamente para LLaMA-3-Instruct-8B; usarlo con otra versión o cuantización puede degradar la tasa de aceptación y reducir la aceleración.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base LLaMA-3-Instruct-8B tiene su propia licencia (Llama 3 Community License) que debe respetarse por separado.
- Repositorio de copia de seguridad: este repositorio es una copia del original (yuhuili/EAGLE-LLaMA3-Instruct-8B) creada por vLLM para CI; puede no recibir actualizaciones del autor original.
- Sesgos y alucinaciones: al ser un modelo borrador, hereda los sesgos y riesgos de alucinación del modelo base LLaMA-3-Instruct-8B, aunque su función es solo proponer tokens candidatos que el modelo principal verifica.
- Idiomas: no se especifican idiomas soportados en la información disponible; se asume la cobertura multilingüe de LLaMA-3-Instruct-8B, pero no está confirmado.
- Sin benchmarks de calidad publicados: no se han divulgado resultados de MMLU, HumanEval o GSM8K para este checkpoint en la información disponible, por lo que la evaluación de calidad debe hacerse contra el modelo base.
- Compatibilidad de frameworks: aunque EAGLE está integrado en múltiples frameworks, la versión exacta del checkpoint (EAGLE-3) puede requerir versiones recientes de vLLM u otros servidores; verificar compatibilidad antes de desplegar en producción.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/vllm-project/EAGLE-LLaMA3-Instruct-8B
- Hugging Face (repositorio original): https://huggingface.co/yuhuili/EAGLE-LLaMA3-Instruct-8B
- Paper EAGLE: https://arxiv.org/pdf/2401.15077.pdf
- Paper EAGLE-2: https://arxiv.org/pdf/2406.16858
- Paper EAGLE-3: https://arxiv.org/pdf/2503.01840
- Blog del proyecto: https://sites.google.com/view/eagle-llm
- Repositorio GitHub: https://github.com/SafeAILab/EAGLE
- Leaderboard de Spec-Bench: https://github.com/hemingkx/Spec-Bench/blob/main/Leaderboard.md
- gpt-fast: https://github.com/pytorch-labs/gpt-fast
- Medusa: https://sites.google.com/view/medusa-llm
- Lookahead decoding: https://lmsys.org/blog/2023-11-21-lookahead-decoding/
- PR de vLLM: https://github.com/vllm-project/vllm/pull/16937
- Documentación SGLang (decodificación especulativa): https://docs.sglang.ai/advanced_features/speculative_decoding.html
- TensorRT-LLM (ejemplos EAGLE): https://github.com/NVIDIA/TensorRT-LLM/tree/main/examples/eagle
- SpecForge: https://github.com/sgl-project/SpecForge

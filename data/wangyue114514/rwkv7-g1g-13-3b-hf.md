# wangyue114514/rwkv7-g1g-13.3b-hf

## Resumen

RWKV-7 G1G 13.3B es un modelo de lenguaje recurrente de la familia RWKV-7 "Goose", desarrollado por el equipo de RWKV (BlinkDL) y convertido al ecosistema Hugging Face Transformers por el usuario wangyue114514. Se trata de un modelo causal de generación de texto que combina las ventajas de las redes recurrentes (inferencia lineal en tiempo y espacio constante, sin caché de atención) con la paralelización de los transformers durante el entrenamiento. Con 13 269 millones de parámetros y una ventana de contexto de 8 192 tokens, está orientado a tareas de razonamiento y generación de texto de alta calidad.

La relevancia actual de este modelo radica en que representa una alternativa eficiente a los transformers puros, al eliminar por completo el mecanismo de atención y reducir el coste de inferencia en contextos largos. Al ser un proyecto de la Linux Foundation AI, su licencia Apache-2.0 permite uso comercial sin restricciones. Esta conversión específica utiliza un diseño "thin" que instala la implementación y los operadores optimizados desde el paquete Python `rwkv7-hf`, lo que simplifica el despliegue en entornos con Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 recurrente (attention-free, sin KV-cache) |
| Parametros totales | 13 269 245 952 (13,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8 192 tokens (según checkpoint original) |
| Tipos de cuantizacion | No disponible en la información proporcionada; existen conversiones GGUF (p. ej. RemySkye/rwkv7-g1g-13.3b-GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16); también disponible en GGUF |

## Arquitectura y entrenamiento

RWKV-7 es un modelo de lenguaje recurrente puro, sin ninguna capa de atención. Su arquitectura se basa en una combinación de canales de estado lineal y no lineal que permiten procesar secuencias de forma recurrente, con un coste de inferencia lineal en el tiempo y espacio constante (sin caché de atención). Esto lo hace especialmente eficiente en contextos largos y en despliegues con recursos limitados. El checkpoint concreto, `rwkv7-g1g-13.3b-20260523-ctx8192.pth`, forma parte de la familia G1 de RWKV-7, orientada a razonamiento y generación de texto de alta calidad.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni las técnicas de alineación (RLHF, DPO, etc.) aplicadas a este checkpoint específico. La conversión a Hugging Face utiliza el paquete `rwkv7-hf==0.7.0`, que proporciona la implementación del modelo y operadores optimizados, mientras que el repositorio en Hugging Face solo contiene los pesos, la configuración y los assets del tokenizador.

## Capacidades

- Generación de texto causal de alta calidad, con soporte para razonamiento multi-paso (por ser un modelo de la familia "Goose" de RWKV-7).
- Inferencia recurrente sin caché de atención, lo que permite procesar secuencias de longitud arbitraria con memoria constante.
- Entrenamiento paralelizable como un transformer, gracias a su diseño híbrido RNN-transformer.
- Soporte nativo para Transformers mediante `trust_remote_code=True` y el paquete `rwkv7-hf`.
- Capacidad de procesamiento de contexto largo (8 192 tokens de entrenamiento, aunque la arquitectura permite extensiones mayores).
- No se han documentado capacidades específicas de tool calling, visión o audio en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en tiempo real: su inferencia recurrente y su baja latencia lo hacen adecuado para chatbots interactivos en servidores con recursos moderados.
- Procesamiento de documentos largos: al no requerir KV-cache, puede analizar informes, contratos o artículos completos sin degradación de rendimiento por longitud.
- Generación de código en entornos de desarrollo: puede integrarse en IDE o pipelines de CI/CD para autocompletar o sugerir fragmentos, gracias a su capacidad de razonamiento.
- Razonamiento matemático y lógico: su entrenamiento orientado a "Goose" (razonamiento) lo hace útil para resolver problemas de matemáticas y lógica en aplicaciones educativas.
- Sistemas de pregunta-respuesta sobre bases de conocimiento: su contexto de 8K tokens permite incorporar documentos de referencia y responder con precisión.
- Prototipado rápido de aplicaciones de NLP: al estar disponible en Transformers y con licencia Apache-2.0, facilita la experimentación en investigación y desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros tests estandarizados para este checkpoint concreto. Tampoco se han encontrado comparaciones oficiales con modelos similares en las fuentes proporcionadas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 26,5 GB (13,3 B × 2 bytes), más overhead de activaciones y estado recurrente. Con cuantización GGUF (p. ej. Q4_K_M), se puede reducir a unos 8-10 GB.
- GPUs recomendadas: para FP16, una NVIDIA A100 (40/80 GB), RTX 4090 (24 GB) o RTX A6000 (48 GB). Para cuantización, una RTX 3090/4090 (24 GB) o incluso GPUs de 16 GB con cuantización Q4.
- Es viable en GPU de consumo (RTX 3090/4090) si se usa cuantización.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), vLLM (si se integra el backend RWKV), llama.cpp para GGUF, y el paquete `rwkv7-hf` para inferencia optimizada.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el diseño recurrente, la latencia por token es constante y el throughput depende del hardware.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en las fuentes consultadas. Sin embargo, se puede contextualizar frente a alternativas recurrentes o densas de tamaño similar:

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| RWKV-7 G1G 13.3B | 13,3 B | 8 192 | Recurrente | Apache-2.0 |
| Mamba-2 7B | 7 B | 8 192 | SSM (selective state space) | Apache-2.0 |
| Llama 3.1 8B | 8 B | 131 072 | Transformer denso | Llama 3.1 Community |

Nota: las cifras de contexto de Mamba y Llama son valores típicos de sus versiones estándar; no se han verificado en la información proporcionada. La comparación se basa en características arquitectónicas y no en rendimiento medido.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo de 13 B entrenado con datos no especificados, puede reflejar sesgos presentes en el corpus.
- Riesgo de alucinación en hechos o datos concretos, especialmente fuera de su dominio de entrenamiento.
- El contexto de entrenamiento es de 8 192 tokens; aunque la arquitectura permite extensiones, el rendimiento más allá de ese límite no está garantizado.
- La conversión requiere el paquete `rwkv7-hf==0.7.0` y `trust_remote_code=True`, lo que implica ejecutar código remoto; se recomienda auditar el paquete en entornos de producción.
- No se han encontrado restricciones de uso comercial (licencia Apache-2.0), pero se debe verificar el cumplimiento de la licencia del checkpoint original.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una conversión reciente o poco validada por la comunidad.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/wangyue114514/rwkv7-g1g-13.3b-hf
- Checkpoint original: https://huggingface.co/BlinkDL/rwkv7-g1/blob/main/rwkv7-g1g-13.3b-20260523-ctx8192.pth
- Página oficial de RWKV: https://www.rwkv.com/
- Paquete PyPI `rwkv7-hf`: https://pypi.org/project/rwkv7-hf/0.7.0/
- Repositorio adaptador: https://github.com/rwkv-rs/hf-adapter
- Versión GGUF (de terceros): https://huggingface.co/RemySkye/rwkv7-g1g-13.3b-GGUF

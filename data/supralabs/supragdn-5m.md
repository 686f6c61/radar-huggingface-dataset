# SupraLabs/SupraGDN-5M

## Resumen

SupraGDN-5M es un modelo de lenguaje de 5 millones de parámetros desarrollado por SupraLabs, un laboratorio independiente centrado en modelos pequeños y eficientes. Está basado en la arquitectura GatedDeltaNet, una variante de redes de estado (SSM) con mecanismos de compuerta, y ha sido preentrenado desde cero como modelo base sobre 5 mil millones de tokens del dataset Fineweb-Edu (muestra `sample-10BT`). El entrenamiento se realizó en una única GPU RTX Pro 4500 SE durante aproximadamente 2,5 horas, con un coste total de unos 2 dólares, lo que demuestra la viabilidad de entrenar modelos pequeños con recursos muy limitados.

El modelo se presenta como un trabajo experimental y deliberadamente subentrenado, sin capacidades avanzadas, y sirve como base para la futura familia Supra3 de modelos SLM (small language models). Su relevancia radica en explorar arquitecturas alternativas al transformer estándar en el rango de los megaparámetros, así como en ofrecer un punto de partida para fine-tuning en tareas específicas. La ventana de contexto es de solo 256 tokens, y el tokenizador personalizado tiene un vocabulario de 6000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (SSM con compuertas) |
| Parametros totales | 5 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (datos de entrenamiento mayoritariamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (no se especifica en la documentacion) |

## Arquitectura y entrenamiento

La arquitectura GatedDeltaNet pertenece a la familia de modelos de estado (state space models) con mecanismos de compuerta, diseñada para ofrecer una alternativa eficiente al transformer en modelos de muy pequeño tamaño. No se proporcionan detalles técnicos adicionales sobre la implementación concreta (número de capas, dimensiones ocultas, tipo de atención lineal, etc.) en la documentación disponible.

El preentrenamiento se realizó durante exactamente una época sobre los primeros 5 mil millones de tokens de Fineweb-Edu `sample-10BT`, con un tamaño de lote de 1024 y una ventana de contexto de 256 tokens. Se utilizó un tokenizador propio con un vocabulario de 6000 tokens. El entrenamiento se ejecutó en una GPU RTX Pro 4500 SE alquilada en Runpod, con un tiempo total de unas 2,5 horas y un coste aproximado de 2 dólares. La pérdida de validación final fue de 3,5251, con una perplejidad de 33,96. No se menciona el uso de técnicas de alineación como RLHF o DPO; se trata de un modelo base sin fine-tuning posterior.

## Capacidades

- Generación de texto básica: el modelo puede producir texto coherente a corto plazo, como se muestra en los ejemplos de la model card, aunque con limitaciones evidentes de coherencia y profundidad.
- Modelo base experimental: no ha sido fine-tuning para tareas específicas, por lo que sus capacidades son las de un modelo preentrenado sin alineación.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de razonamiento multi-paso ni modo de pensamiento (thinking mode).
- Sin capacidades multimodales (visión, audio, etc.).
- Multilingüismo: no declarado; los datos de entrenamiento provienen de Fineweb-Edu, que es mayoritariamente inglés, por lo que se espera un rendimiento limitado en otros idiomas.

## Casos de uso

- Investigación académica sobre arquitecturas SSM: el modelo sirve como banco de pruebas para estudiar el comportamiento de GatedDeltaNet en el rango de 5M parámetros, comparando con transformers y otras SSM.
- Aprendizaje y docencia: por su tamaño reducido y bajo coste de entrenamiento, es útil para demostrar pipelines completos de preentrenamiento, tokenización y evaluación en cursos de deep learning.
- Fine-tuning para tareas de clasificación de texto simple: con un contexto de 256 tokens, puede adaptarse a tareas como análisis de sentimiento o clasificación de documentos cortos, aunque requerirá un dataset específico y un proceso de ajuste.
- Experimentación con eficiencia energética: al poder entrenarse en una GPU consumer en pocas horas, permite explorar trade-offs entre coste, datos y rendimiento en modelos mínimos.
- Generación de texto corto en entornos con recursos extremadamente limitados: por ejemplo, en dispositivos embebidos o como componente de un sistema mayor que requiera respuestas breves.
- Comparación de arquitecturas: útil para benchmarks controlados entre modelos de 5M parámetros con diferentes arquitecturas (transformer, SSM, etc.) bajo las mismas condiciones de entrenamiento.

## Benchmarks y rendimiento

Los resultados de evaluación en tareas de razonamiento y sentido común son los siguientes:

| Metrica | Resultado (acc_norm) |
|---|---|
| ARC-Easy | 33,59 % |
| ARC-Challenge | 23,21 % |
| HellaSwag | 26,74 % |
| PIQA | 52,88 % |

Comparación con otros modelos de tamaño similar (según la model card):

| Modelo | Tokens de preentrenamiento | ARC-Easy | ARC-Challenge | HellaSwag | PIQA |
|---|---|---|---|---|---|
| SupraGDN-5M | 5B | 33,59 % | 23,21 % | 26,74 % | 52,88 % |
| Qana-mini-5M | 21B | 34,97 % | 23,21 % | 27,60 % | 57,18 % |
| GPT-S2-5M | 75B | 33,92 % | 22,87 % | 27,87 % | 57,56 % |
| CMA-8M | 21B | 35,35 % | 23,29 % | 28,19 % | 58,22 % |

El modelo muestra un rendimiento competitivo en ARC-Easy y ARC-Challenge, pero queda por detrás en PIQA y HellaSwag, lo que el autor atribuye a un subentrenamiento y a la corta ventana de contexto.

## Requisitos de hardware

- Inferencia: al tener solo 5 millones de parámetros, el modelo cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso puede ejecutarse en CPU sin problemas de latencia apreciables.
- VRAM estimada: menos de 20 MB en FP32, menos de 10 MB en FP16. No se requieren GPUs especializadas.
- GPU recomendada: cualquier GPU consumer (por ejemplo, RTX 3060 o superior) o incluso CPU. El entrenamiento se realizó en una RTX Pro 4500 SE, pero la inferencia es trivial.
- Opciones de despliegue: al no especificarse el formato de pesos, se desconoce si es compatible con vLLM, llama.cpp u Ollama. Es probable que se pueda cargar con PyTorch/Hugging Face Transformers si se publican los pesos en safetensors, pero no está confirmado.
- Latencia y throughput: no se han publicado mediciones, pero dado el tamaño, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

La comparativa se basa en los datos de la model card, que incluye tres modelos de tamaño similar:

| Modelo | Parametros | Contexto | Tokens de preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SupraGDN-5M | 5M | 256 | 5B | Apache 2.0 | Hugging Face |
| Qana-mini-5M | 5M | No disponible | 21B | No disponible | Hugging Face |
| GPT-S2-5M | 5M | No disponible | 75B | No disponible | Hugging Face |
| CMA-8M | 8M | No disponible | 21B | No disponible | Hugging Face |

En términos de rendimiento, SupraGDN-5M es comparable en ARC-Easy y ARC-Challenge, pero inferior en HellaSwag y PIQA, probablemente debido a su menor cantidad de tokens de entrenamiento y a su contexto muy reducido. La licencia Apache 2.0 es una ventaja para uso comercial, mientras que las licencias de los otros modelos no se especifican.

## Limitaciones y advertencias

- Modelo subentrenado: el autor lo califica explícitamente como "undertrained" y "experimental", por lo que no debe usarse en producción sin un fine-tuning exhaustivo.
- Ventana de contexto muy corta (256 tokens): limita cualquier tarea que requiera dependencias de largo alcance o documentos extensos.
- Sin alineación: no ha pasado por RLHF ni DPO, por lo que puede generar contenido incoherente, repetitivo o inapropiado.
- Riesgo de alucinación: como todo modelo de lenguaje, puede producir afirmaciones falsas o inventadas, especialmente al carecer de fine-tuning.
- Idiomas: no se declara soporte multilingüe; los datos de entrenamiento son de Fineweb-Edu, mayoritariamente inglés, por lo que el rendimiento en otros idiomas será muy limitado.
- Formato de pesos no especificado: no se indica si los pesos están en safetensors, PyTorch u otro formato, lo que puede dificultar su integración en frameworks estándar.
- Sin benchmarks adicionales: solo se proporcionan cuatro métricas de sentido común; no hay resultados en tareas de código, matemáticas o razonamiento complejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SupraLabs/SupraGDN-5M
- Catálogo de modelos de SupraLabs: https://supra-labs.com/models.html
- Web de SupraLabs: https://supra-labs.com/
- Organización SupraLabs en Hugging Face: https://huggingface.co/SupraLabs

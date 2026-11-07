# VeroLM/NoTokenLM-Gen-3.6

## Resumen

NoTokenLM-Gen-3.6 es un modelo de lenguaje de 13,87 millones de parámetros desarrollado por VeroLM (publicado también bajo la cuenta omurberaisik) que opera directamente sobre bytes UTF-8, sin vocabulario de subpalabras ni tokenizador BPE. Forma parte de la familia NoTokenLM, una serie de modelos pequeños construidos en torno a la pregunta de cuánto puede lograr un modelo genuinamente pequeño si la arquitectura y el entrenamiento se cuidan, sin apoyarse en la escala para compensar un diseño débil.

El checkpoint corresponde al paso 13.000 de un preentrenamiento desde cero sobre una mezcla amplia de texto educativo, Wikipedia, historias simples y texto de estilo libro de texto en inglés y francés. La arquitectura es un transformer de 12 capas con `d_model=320`, RoPE, RMSNorm, SwiGLU, una convolución corta de entrada, QK-norm, residual de valor y puertas de salida por cabeza. El modelo no está afinado para instrucciones: no responde preguntas, no hace matemáticas ni mantiene conversaciones; su propósito es la generación de texto y la investigación sobre modelos sin tokenizador.

Su relevancia actual es doble: por un lado, explora una vía alternativa al tokenizador subword estándar, eliminando el vocabulario y trabajando a nivel de byte; por otro, sirve como banco de pruebas reproducible y de bajo coste (0,1 GB de repo) para estudiar arquitecturas y dinámicas de entrenamiento a escala reducida. La licencia Apache 2.0 facilita su uso y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only byte-level (12 capas, `d_model=320`), RoPE, RMSNorm, SwiGLU, convolución corta de entrada, QK-norm, residual de valor, puertas de salida por cabeza |
| Parametros totales | 13.874.556 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1.024 bytes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | en, fr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (código de arquitectura propio, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas con dimensión de modelo 320, entrenado desde cero sobre bytes UTF-8 sin tokenizador de subpalabras. Incorpora varias innovaciones a nivel de arquitectura: RoPE para el posicionamiento, RMSNorm en lugar de LayerNorm, activación SwiGLU en las capas feed-forward, una convolución corta de entrada que agrega contexto local a nivel de byte, QK-norm para estabilizar la atención, residual de valor y puertas de salida por cabeza. El código de arquitectura se distribuye junto con los pesos y exige `trust_remote_code=True`; el `AutoTokenizer` es solo un mapeo byte<->id para que el modelo cargue de la forma estándar de Hugging Face.

El entrenamiento consistió en 13.000 pasos con batch 16, acumulación de gradiente 4 y secuencias de 1.024 bytes, lo que equivale a aproximadamente 0,85 GB de texto. La tasa de aprendizaje máxima fue 1e-3, con 500 pasos de warmup y weight decay 0,1. La mejor pérdida de validación registrada fue 0,8915 nats por byte (≈1,29 bits por byte) sobre una partición reservada de la mezcla de entrenamiento. Los pesos publicados son los EMA (media móvil exponencial) del paso 13.000. Solo hubo preentrenamiento, sin ajuste por instrucciones ni RLHF/DPO. La mezcla de datos incluye texto web educativo, Wikipedia, historias simples y texto de estilo libro de texto en inglés y francés.

## Capacidades

- Generación de texto a nivel de byte en inglés y francés, sin vocabulario de subpalabras.
- Continuación de texto y finalización de frases cortas con coherencia gramatical alta (99,5 % de corrección gramatical en la evaluación de 1.000 prompts).
- Generación de texto narrativo simple: historias, descripciones de escenas y frases de estilo infantil.
- Investigación sobre modelos sin tokenizador y arquitecturas byte-level.
- No soporta tool calling ni function calling (no hay ajuste para ello).
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo de pensamiento (thinking mode), visión, audio ni otras modalidades.
- Capacidad multilingüe limitada a inglés y francés.
- No responde preguntas ni realiza matemáticas de forma fiable.

## Casos de uso

- Investigación sobre tokenización libre: el modelo permite estudiar el comportamiento de un transformer byte-level puro frente a modelos con BPE, comparando pérdida por byte y coherencia en un entorno reproducible de 14M de parámetros.
- Generación de texto narrativo corto: resulta adecuado para producir continuaciones de frases e historias simples en inglés y francés, como demuestra el 78 % de salidas plenamente coherentes en la evaluación de 1.000 prompts.
- Banco de pruebas de arquitecturas: sus componentes (QK-norm, residual de valor, puertas por cabeza, convolución de entrada) pueden aislarse y evaluarse en experimentos controlados de ablación a bajo coste.
- Docencia y divulgación: el modelo cabe en 0,1 GB y puede ejecutarse en CPU, lo que lo hace útil para explicar el funcionamiento interno de un transformer sin depender de infraestructura de GPU.
- Prototipado de pipelines de generación de bytes: sirve para validar infraestructura de inferencia (carga con `trust_remote_code`, mapeo byte<->id, muestreo con temperatura y top-k) antes de escalar a modelos mayores.
- Estudio de sesgos y errores de concordancia: la evaluación documentada identifica fallos de pronombre/género (112 de 215 casos en la categoría intermedia), lo que permite analizar patrones de error lingüístico en modelos pequeños.
- Generación de datos sintéticos de bajo coste: puede emplearse para producir texto de relleno o ejemplos de estilo narrativo en experimentos de aumento de datos, siempre con revisión posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una evaluación propia de generación sobre 1.000 prompts distintos con temperatura 0,5, top-k 40 y 35 bytes nuevos por generación:

| Categoria | Definicion | Recuento | Porcentaje |
|---|---|---|---|
| Plenamente coherente | Gramática correcta y significado consistente (personajes, objetos y pronombres bien mantenidos) | 780 | 78,0 % |
| Gramática correcta, significado roto | Frases bien formadas pero con deriva de pronombre/género, detalle sin sentido o inconsistencia de escena | 215 | 21,5 % |
| Gramática rota | Estructura de la frase colapsada, repetición atascada o cláusula malformada | 5 | 0,5 % |

Resultado agregado: 78,0 % plenamente coherente y 99,5 % gramaticalmente correcto. La mejor pérdida de validación fue 0,8915 nats por byte (≈1,29 bits por byte). Las etiquetas fueron asignadas por un único anotador; la comprobación de pronombres y los benchmarks no dependen de ellas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 GB en precisión completa (13,87M de parámetros), según LLM Explorer.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090 o superiores. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria; incluso en CPU con latencia aceptable.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se ha publicado soporte para vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoTokenLM-Gen-3.6 | 13,87M | no disponible (entrenado a 1.024 bytes) | Byte-level, sin tokenizador | Apache 2.0 | Hugging Face |
| NoTokenLM Gen-4.5 | no disponible | no disponible | Byte-level, sin tokenizador | no disponible | Hugging Face (misma familia) |
| Modelos pequeños con BPE (p. ej. GPT-2 small) | 124M | 1.024 tokens | BPE | MIT | Hugging Face |

La comparación con Gen-4.5 es la más directa dentro de la familia: Gen-4.5 se entrenó solo con texto de historias infantiles, mientras que Gen-3.6 usa una mezcla amplia (texto educativo, Wikipedia, historias y texto de libro de texto), lo que según la model card explica tanto sus ventajas como sus desventajas relativas. No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No está afinado para instrucciones: no responde preguntas, no hace matemáticas ni mantiene conversaciones; usarlo como asistente producirá resultados pobres.
- Riesgo de alucinación y deriva semántica: el 21,5 % de las generaciones evaluadas fueron gramaticalmente correctas pero con significado roto, incluyendo 112 casos de discordancia de pronombre/género.
- Ventana de contexto corta: entrenado con secuencias de 1.024 bytes, lo que limita la coherencia en textos largos.
- Cobertura lingüística restringida a inglés y francés; no hay soporte documentado para castellano.
- Sesgos conocidos: no se documentan análisis de sesgo en la información disponible; la mezcla de datos (web educativo, Wikipedia, historias) puede introducir sesgos de dominio y de género, como sugiere el patrón de errores de pronombre.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no es adecuado para producción como generador de contenido fiable sin revisión humana.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código de arquitectura del autor; conviene auditar el código antes de desplegarlo en entornos sensibles.
- El repositorio es pequeño (0,1 GB) y tiene pocas descargas (163) y likes (2), por lo que la validación comunitaria es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/VeroLM/NoTokenLM-Gen-3.6
- Hugging Face (cuenta alternativa): https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.6
- LLM Explorer: https://llm-explorer.com/model/omurberaisik%2FNoTokenLM-Gen-3.6,7EUOV9SbjySOhIqf0esAjG
- Notebook interactivo: `notebook.ipynb` en el repositorio de Hugging Face
- Resultados de evaluación: `gen36_13000_1000_test_outputs.json` en el repositorio de Hugging Face

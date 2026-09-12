# tdizhere/quotes-gpt

## Resumen

Quotes GPT es un modelo de generación de texto a nivel de carácter desarrollado por el usuario tdizhere, publicado en HuggingFace bajo licencia MIT. Se trata de un transformer decoder-only de estilo GPT, con 6 bloques, 6 cabezas de atención, dimensión de embedding de 384 y una ventana de contexto de 512 caracteres. Con aproximadamente 20,3 millones de parámetros según el recuento real de los pesos en safetensors, es un modelo diminuto pensado para experimentación educativa y para demostrar el funcionamiento de la arquitectura GPT desde cero.

El modelo se entrena sobre el dataset Colby/quotes, una colección de citas positivas en inglés, y funciona con tokenización a nivel de carácter sobre un vocabulario de solo 94 símbolos. Esto lo aleja de los usos de producción reales, pero lo convierte en un banco de pruebas barato para estudiar autoregresión, decodificación, atención causal y efectos de overfitting en corpus pequeños.

Su relevancia actual es, por tanto, didáctica y de investigación: sirve para reproducir el pipeline completo (tokenizador, entrenamiento, generación, evaluación con cross-entropy) sin necesidad de GPU, y como referencia mínima para comparar con implementaciones tipo nanoGPT o con modelos char-level multilingües.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), atención multi-cabeza con enmascaramiento causal |
| Parametros totales | 20.346.718 (según safetensors); la model card declara 10.909.534, discrepancia no aclarada por el autor |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 caracteres (block size) |
| Tipos de cuantizacion | No se publican pesos cuantizados; al ser un state dict de PyTorch en fp32 se puede convertir a fp16/bf16/int8 mediante herramientas externas. No hay GGUF oficial |
| Idiomas soportados | Inglés (en), limitado al vocabulario de 94 caracteres del corpus de citas |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`model.pt`); el repositorio incluye también `config.json`, `config.yml`, `vocab.json` y `generated_output.txt`. El repo está etiquetado con safetensors, aunque la model card solo documenta `model.pt` |
| Capas | 6 bloques transformer |
| Cabezas de atención | 6 |
| Dimension de embedding | 384 |
| Dropout | 0,2 |
| Tamano de vocabulario | 94 (nivel de carácter) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico: embeddings de carácter, 6 bloques con atención multi-cabeza causal y feed-forward, normalización y proyección final al vocabulario de 94 símbolos. La dimensión de embedding es 384, con 6 cabezas (64 dimensiones por cabeza) y bloque de contexto de 512. El dropout es 0,2, un valor alto para un modelo de este tamaño, lo que sugiere que el autor esperaba overfitting dado el reducido corpus.

El entrenamiento se realizó con el optimizador AdamW, learning rate de 0,0003, batch size de 128 y 11.000 pasos, con función de pérdida de entropía cruzada. No se documenta el número total de tokens procesados, ni la composición exacta del dataset más allá de referencia a Colby/quotes, ni si hubo fases de ajuste adicionales como RLHF, DPO o instruction tuning. No se menciona ninguna innovación técnica (decodificación especulativa, atención lineal, SSM híbrido); se trata de una implementación directa y minimalista orientada a aprendizaje.

El resultado de validación declarado por el autor es una pérdida de entropía cruzada de 0,9097 sobre el dataset Colby/quotes, marcada como no verificada en el model-index. Para un vocabulario de 94 caracteres, esa cifra equivale a una perplejidad aproximada de 2,48, coherente con un corpus muy homogéneo y repetitivo.

## Capacidades

- Generación de texto autoregresiva a nivel de carácter, en inglés, con el estilo y las pautas superficiales del corpus de citas positivas.
- Continuación de contexto: dado un prefijo de hasta 512 caracteres, produce texto coherente localmente (palabras y frases cortas reconocibles).
- Generación controlada por prompt: el `contexto` inicial sesga fuertemente la salida, lo que permite imitar el registro de citas motivacionales.
- Muestreo configurable: la función `generate` admite número de tokens nuevos, y al estar implementada sobre logits permite aplicar temperatura, top-k o top-p mediante modificaciones manuales (no expuestas en la model card).
- Capacidad educativa: reproducible y auditable, sirve para experimentar con atención causal, positional embeddings y dinámica de entrenamiento.
- No dispone de tool calling, function calling, soporte de agentes, multi-step reasoning, visión, audio ni modo "thinking".
- Multilingüismo: inexistente. El vocabulario de 94 caracteres y el corpus en inglés limitan la salida a ese idioma y a caracteres ASCII imprimibles.
- No hay soporte de plantillas de chat ni de system prompt; no es un modelo instruct.

## Casos de uso

- Docencia de arquitecturas transformer: el modelo entrena en minutos en CPU, por lo que es idóneo para que estudiantes modifiquen el número de capas, cabezas o contexto y observen el efecto en la pérdida sobre un corpus pequeño.
- Reproducción de experimentos char-level: sirve como baseline para comparar tokenización a nivel de carácter frente a BPE en corpus de citas o frases cortas.
- Generación de citas motivacionales para demos: se puede integrar en una demo web que muestre continuaciones a partir de un prefijo ("The best way to..."), dejando claro que es un prototipo educativo y no una fuente fiable.
- Pruebas de pipelines de generación: al ser tan pequeño, es útil para validar infraestructura de serving (carga de state dict, gestión de vocab, decodificación) antes de pasar a modelos reales.
- Estudio de overfitting y regularización: con dropout 0,2 y 11.000 pasos sobre un corpus reducido, es un caso práctico para analizar memorización frente a generalización en modelos pequeños.
- Benchmarking de latencia en CPU: al generar carácter a carácter con contexto 512, permite medir cuellos de botella en bucles de decodificación sin depender de GPU.
- Ejemplo de publicación de modelos en HuggingFace: el repositorio ilustra el flujo completo de subida (config, vocab, pesos, model card con model-index) para quienes publican su primer modelo.
- Filtrado o aumento de datos sintéticos de texto corto: puede generar variantes de frases para aumentar un dataset de citas, siempre con revisión humana posterior.

## Benchmarks y rendimiento

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Text generation | Colby/quotes (Positive Quotes) | Cross-entropy loss | 0,9097246527671814 | No |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato es la pérdida de entropía cruzada declarada por el autor, sin verificación independiente y sin comparación con otros modelos en el model-index.

## Requisitos de hardware

- VRAM estimada: en fp32 los pesos ocupan aproximadamente 81 MB; en fp16/bf16, unos 41 MB; en int8, unos 20 MB. Las activaciones con contexto de 512 y dimensión 384 son despreciables, por lo que el consumo total en inferencia se mantiene por debajo de 1 GB en cualquier precisión habitual.
- Cabe en cualquier GPU consumer, incluso en iGPU y en CPU pura. Una RTX 4090, una RTX 3060 o una GTX 1650 son enormemente sobredimensionadas para este modelo.
- Entrenamiento: los 11.000 pasos con batch 128 declarados son reproducibles en CPU o en una única GPU consumer; no se requiere A100 ni H100.
- Opciones de despliegue: al ser un `model.pt` con definición de clase propia (no incluida en el repo), el despliegue estándar es cargar el state dict en PyTorch y llamar a `model.generate`. No hay integración oficial con vLLM, TGI, llama.cpp, Ollama u ONNX Runtime; tampoco existe conversión a GGUF publicada.
- Latencia y throughput: no disponible. La model card advierte que la decodificación a nivel de carácter es más lenta que la de modelos a nivel de token, ya que requiere un paso de forward por carácter generado; con contexto 512 y 6 capas, la generación de 500 caracteres implica 500 pasos secuenciales.
- Almacenamiento: el repositorio completo ocupa 0,2 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quotes-gpt (tdizhere) | 20,3 M (safetensors) / 10,9 M declarados | 512 | Carácter, vocab 94 | MIT | HuggingFace, 0 descargas |
| GPT-2 small | 124 M | 1024 | BPE, vocab 50257 | MIT | HuggingFace, ampliamente integrado en vLLM, llama.cpp, TGI |
| nanoGPT (char-level Shakespeare, referencia de Karpathy) | ~10,6 M | 256-1024 según configuración | Carácter | MIT | Repositorio GitHub, reproducibilidad total |
| Modelos TinyStories (~1-30 M) | 1-30 M | 512-2048 | BPE o carácter | MIT / Apache-2.0 según variante | HuggingFace |

En rendimiento no hay comparación posible: el model-index de quotes-gpt solo reporta pérdida de entropía cruzada sobre su propio dataset, y no se dispone de resultados de los modelos alternativos en ese mismo corpus. La diferencia práctica principal está en el ecosistema: GPT-2 small y los modelos TinyStories cuentan con conversiones GGUF, soporte en motores de inferencia y plantillas de uso, mientras que quotes-gpt requiere reconstruir la clase del modelo desde el script de entrenamiento original (no incluido en el repositorio).

## Limitaciones y advertencias

- Modelo a nivel de carácter: la generación es lenta y propensa a errores ortográficos y a palabras inexistentes, ya que no dispone de un tokenizador subpalabra.
- La propia model card reconoce que puede producir texto repetitivo o sin sentido.
- Corpus de entrenamiento muy pequeño y homogéneo (citas positivas), lo que implica un sesgo temático y de tono fuerte: prácticamente todo lo que genera tiende al registro motivacional y en inglés.
- Riesgo de memorización: con dropout alto pero un dataset reducido, es probable que reproduzca fragmentos literales del corpus de entrenamiento, con las implicaciones de derechos de autor que ello conlleva si las citas no son de dominio público.
- Sesgo de representación: el dataset Colby/quotes no está documentado en la información disponible en cuanto a diversidad de autores, géneros o culturas, por lo que no se puede evaluar su sesgo.
- Multilingüismo nulo: el vocabulario de 94 caracteres hace inviable generar texto en castellano con acentos, eñes o cualquier carácter fuera de ese conjunto; los caracteres desconocidos se pierden o producen salidas corruptas.
- Contexto de solo 512 caracteres, insuficiente para conversaciones multi-turno o documentos largos.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías y la model card restringe la intención de uso a fines educativos y de experimentación.
- El repositorio no incluye el código de definición del modelo (`gpt(config["vocab_size"])` se referencia pero no se publica), por lo que la carga directa no es trivial y depende del script de entrenamiento del autor.
- La discrepancia entre los 10.909.534 parámetros declarados y los 20.346.718 reales en safetensors no está explicada; conviene verificar los pesos antes de usarlos.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni de validación por terceros.
- No apto para producción: sin soporte de tool calling, agentes, plantillas de chat ni cuantizaciones validadas, y sin resultados de benchmarks verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tdizhere/quotes-gpt
- Dataset de entrenamiento: https://huggingface.co/datasets/Colby/quotes
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de ayuda de YouTube, Gmail y Zhihu, sin relación con quotes-gpt.

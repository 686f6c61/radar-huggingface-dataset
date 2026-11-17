# umitaslan/Qwen3.5-0.8B-Base-GGUF

## Resumen

Qwen3.5-0.8B-Base-GGUF es una redistribución en formato GGUF del modelo base Qwen3.5-0.8B-Base desarrollado por el equipo Qwen de Alibaba Cloud. El repositorio lo mantiene el usuario umitaslan y contiene copias byte a byte de la conversión original publicada por ggml-org, empaquetadas para que el descargador de modelos de la extensión `decision` de NetLogo localice todas las variantes en un único lugar. No se trata, por tanto, de un modelo nuevo ni de un fine-tuning, sino de un artefacto de distribución de pesos cuantizados.

El modelo subyacente es un transformer de aproximadamente 772,8 millones de parámetros, sin ajuste fino (base model), pensado para servir como motor de decisión ligero en entornos locales mediante `llama-server`. Su función principal en este repositorio es permitir que agentes (turtles) de simulaciones de modelado basado en agentes (ABM) en NetLogo elijan entre etiquetas discretas ejecutando inferencia en local, sin dependencia de APIs externas.

La relevancia actual del artefacto es acotada: se publica como infraestructura de soporte para una extensión de NetLogo aún no publicada, con licencia Apache-2.0 y tres niveles de cuantización (BF16, Q8_0, Q4_0) que cubren desde 1,56 GB hasta 563 MB. No hay métricas de rendimiento publicadas ni información sobre el entrenamiento del modelo base en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (base model, sin ajuste fino; detalles no disponibles) |
| Parametros totales | 772.845.888 (según safetensors del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-0.8B-Base más allá de su naturaleza de transformer sin ajuste fino. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; al tratarse de un modelo base, es esperable que no haya pasado por ajuste por preferencias, pero esto no se confirma en la documentación.

Lo que sí está documentado es el proceso de conversión: los ficheros GGUF son copias idénticas de la conversión realizada por ggml-org en el commit `12458f0e52ed1ac94c072952ff8d7dd4f3388fa7`. Se ofrecen tres variantes con tamaños y hashes SHA-256 verificables: BF16 (1,56 GB), Q8_0 (834 MB) y Q4_0 (563 MB). El autor advierte que las probabilidades de elección en Q8_0 y Q4_0 difieren ligeramente respecto a BF16, lo que es relevante para aplicaciones donde la estabilidad de las decisiones importa.

## Capacidades

- Generación de texto autoregresiva propia de un modelo base, sin instrucciones ni ajuste conversacional.
- Selección entre etiquetas discretas: la extensión `decision` de NetLogo lo utiliza para que cada agente elija entre opciones predefinidas (por ejemplo, A/B/C) a partir de una descripción textual del estado.
- Inferencia local mediante `llama-server` de llama.cpp, sin conexión a servicios externos.
- Integración con modelado basado en agentes (ABM) en NetLogo a través de la extensión `decision`.
- Soporte de cuantización para reducir requisitos de memoria (Q4_0 en 563 MB).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Simulaciones ABM en NetLogo con decisiones basadas en lenguaje: cada turtle describe su estado y el modelo elige una acción entre un conjunto cerrado de etiquetas, como en el ejemplo del README (girar a izquierda, seguir recto, girar a derecha). Es adecuado por su tamaño reducido y su ejecución local vía `llama-server`.
- Demos educativos de NetLogo: los modelos `Decision Demo` y `Wolf Sheep Decision` de la extensión emplean este modelo, lo que lo hace útil para enseñar comportamiento adaptativo en simulaciones ecológicas y de agentes.
- Prototipado de políticas de decisión en entornos simulados: investigadores pueden sustituir reglas heurísticas por un modelo de lenguaje pequeño que elija entre acciones discretas, manteniendo la reproducibilidad al fijar la cuantización.
- Inferencia en hardware modesto: la variante Q4_0 (563 MB) permite ejecutar el modelo en máquinas sin GPU dedicada, útil para aulas, portátiles o servidores de laboratorio con recursos limitados.
- Distribución empaquetada para descarga automática: el repositorio centraliza las tres cuantizaciones para que el descargador de la extensión `decision` resuelva el modelo con una sola referencia (`umitaslan/Qwen3.5-0.8B-Base-GGUF:BF16`).
- Experimentos de comparación de cuantizaciones: al ofrecer BF16, Q8_0 y Q4_0 con hashes verificables, permite estudiar cómo varían las probabilidades de elección según la precisión numérica en tareas de decisión discreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB para BF16, 0,9 GB para Q8_0 y 0,6 GB para Q4_0, más el overhead del servidor llama.cpp y del contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre es suficiente para BF16; el modelo es viable en RTX 3050, RTX 4060, RTX 4090, A100 o H100 sin aprovechar su capacidad completa.
- Cabe en GPU consumer: sí, en todas las variantes, incluidas GPUs de gama baja y posiblemente en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp mediante `llama-server` (documentado); otras herramientas compatibles con GGUF (Ollama, etc.) no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| umitaslan/Qwen3.5-0.8B-Base-GGUF | 772,8 M | no disponible | Apache-2.0 | GGUF | Hugging Face |
| ggml-org/Qwen3.5-0.8B-Base-GGUF (origen de la conversión) | 772,8 M | no disponible | Apache-2.0 | GGUF | Hugging Face |
| Qwen/Qwen3.5-0.8B-Base (modelo original) | 772,8 M | no disponible | Apache-2.0 | safetensors | Hugging Face |

No se dispone de datos de rendimiento ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste fino: no sigue instrucciones ni mantiene formato conversacional de forma fiable; su uso en `decision` depende de que la extensión estructure el prompt y restrinja las opciones.
- Las probabilidades de elección varían entre cuantizaciones; Q8_0 y Q4_0 no reproducen exactamente el comportamiento de BF16, lo que puede afectar a la reproducibilidad de simulaciones.
- Riesgo de alucinación y de elecciones inconsistentes inherente a un modelo de 0,8 mil millones de parámetros sin ajuste por preferencias.
- La extensión `decision` de NetLogo no está publicada todavía, por lo que el caso de uso principal no es utilizable de forma estable en producción.
- No se documentan idiomas soportados, sesgos conocidos ni longitud de contexto, lo que limita la evaluación para usos fuera del ámbito previsto.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre la conversión; los pesos originales son de Qwen (Alibaba Cloud) y la conversión de ggml-org.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/umitaslan/Qwen3.5-0.8B-Base-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Conversión original de ggml-org: https://huggingface.co/ggml-org/Qwen3.5-0.8B-Base-GGUF
- Commit de referencia de la conversión: `12458f0e52ed1ac94c072952ff8d7dd4f3388fa7`

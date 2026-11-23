# warlockzero/Aion-1.0-Instruct-2.3B-int4

## Resumen

Aion-1.0-Instruct-2.3B-int4 es una versión cuantizada a INT4 del modelo instructivo Aion-1.0-Instruct-2.3B desarrollado por el grupo Windows Applied Sciences de Microsoft. Esta variante, publicada por el usuario warlockzero, está empaquetada en formato ONNX y optimizada para ONNX Runtime GenAI, lo que permite ejecución en dispositivo (on-device) tanto sobre WebGPU como sobre CPU nativa. El modelo resuelve el problema del despliegue de un LLM de 2.300 millones de parámetros en entornos con memoria limitada, reduciendo el peso de 4,6 GB en FP16 a aproximadamente 1,23 GB.

La arquitectura subyacente es un transformer de 28 capas con atención híbrida: 21 capas de ventana deslizante (sliding-window attention) y 7 capas de atención completa, lo que reduce el coste computacional del contexto largo manteniendo capacidad de atención global en puntos estratégicos. La cuantización emplea pesos INT4 simétricos por bloques (block size 32) entrenados mediante Quantization-Aware Training (QAT), con activaciones en FP16 y una precisión efectiva W4A8/W4A16.

Su relevancia actual radica en la combinación de licencia MIT, soporte multilingüe para ocho idiomas (inglés, alemán, español, portugués, italiano, francés, chino y japonés) y un pipeline de despliegue ligero basado en ONNX Runtime GenAI, lo que lo hace atractivo para aplicaciones de chat y generación de texto en navegador o en hardware de consumo sin GPU dedicada de gran capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 28 capas con atención híbrida (21 capas sliding-window + 7 capas full-attention) |
| Parametros totales | 2,29 mil millones (2.290 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 W4A8/W4A16 (pesos INT4 simétricos por bloques, block size 32; embeddings y LM head con block size 64), activaciones FP16, KV cache FP16 |
| Idiomas soportados | en, de, es, pt, it, fr, zh, ja |
| Licencia | MIT |
| Formato de pesos | ONNX (onnxruntime-genai), cuantizado INT4 |

## Arquitectura y entrenamiento

El modelo base Aion-1.0-Instruct-2.3B es un transformer de 28 capas que combina dos tipos de atención: 21 capas de atención de ventana deslizante y 7 capas de atención completa. Este diseño híbrido busca reducir el coste cuadrático de la atención en secuencias largas, manteniendo al mismo tiempo capacidad de modelado global en capas seleccionadas. El modelo original fue desarrollado por el grupo Windows Applied Sciences de Microsoft y liberado bajo licencia MIT.

La variante cuantizada INT4 se ha producido mediante Quantization-Aware Training (QAT), no como una cuantización post-entrenamiento, lo que según la model card permite conservar una calidad cercana a FP8. Las capas lineales (q/k/v/o de atención y gate/up/down del MLP) usan `MatMulNBits` con block size 32, mientras que el embedding de tokens y la LM head atada emplean `GatherBlockQuantized` con block size 64. Las activaciones, las RMSNorm y los logits se mantienen en FP16, y la KV cache también en FP16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat (pipeline `text-generation`, tags `chat` y `conversational`).
- Instrucciones y respuestas conversacionales en ocho idiomas: inglés, alemán, español, portugués, italiano, francés, chino y japonés.
- Ejecución en dispositivo mediante ONNX Runtime GenAI con proveedores CUDA, WebGPU o CPU.
- Soporte de plantilla de chat Jinja (`chat_template.jinja`) para formateo de mensajes con roles.
- Inferencia con decodificación token a token y streaming mediante `create_stream()` del runtime.
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas avanzadas o visión: no disponible en la información proporcionada.

## Casos de uso

- Chat en navegador sin backend: el checkpoint ONNX con proveedor WebGPU permite ejecutar el modelo directamente en el navegador del usuario, con un peso de ~1,23 GB, lo que habilita asistentes conversacionales que no envían datos a un servidor.
- Asistente de escritorio on-device: integrado mediante ONNX Runtime GenAI en aplicaciones nativas (Windows, Linux, macOS) con proveedor CPU o CUDA, aprovechando la licencia MIT para distribución comercial sin restricciones.
- Atención al cliente multilingüe: el soporte de ocho idiomas permite desplegar un único modelo para conversaciones en español, inglés, alemán, francés, italiano, portugués, chino y japonés, reduciendo la huella de memoria frente a alternativas monolingües.
- Prototipado rápido de aplicaciones de chat: el tamaño reducido y el formato ONNX permiten iterar en portátiles sin GPU dedicada, usando el proveedor CPU del runtime.
- Generación de texto en dispositivos de borde (edge): con ~1,23 GB de huella, el modelo cabe en dispositivos con memoria limitada donde un FP16 de 4,6 GB no sería viable.
- Aplicaciones de privacidad estricta: al ejecutarse localmente, los datos del usuario no salen del dispositivo, lo que encaja en escenarios sanitarios, legales o corporativos con requisitos de confidencialidad.
- Formación e investigación: sirve como caso de estudio de cuantización QAT INT4 con ONNX Runtime GenAI y despliegue WebGPU para experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,23 GB para el checkpoint INT4 (frente a 4,6 GB en FP16), más la KV cache en FP16 que crece con la longitud de contexto.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el runtime soporta el proveedor CUDA de ONNX Runtime GenAI.
- Compatibilidad con GPU de consumo: por el tamaño de ~1,23 GB, el modelo es apto para GPU de consumo con suficiente memoria libre, aunque no se detallan modelos concretos.
- Ejecución en CPU: soportada por ONNX Runtime GenAI (proveedor CPU), sin requisito de GPU.
- Ejecución en navegador: soportada mediante el proveedor WebGPU.
- Opciones de despliegue: ONNX Runtime GenAI (`onnxruntime-genai`) con proveedores CUDA, WebGPU o CPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B-int4 (este) | 2,29 B | no disponible | INT4 W4A8/W4A16 (QAT) | MIT | ONNX (onnxruntime-genai) | Hugging Face |
| microsoft/Aion-1.0-Instruct-2.3B (base) | 2,29 B | no disponible | FP16 | MIT | no disponible | Hugging Face |
| Alternativas de ~2-3 B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no se han publicado evaluaciones de fidelidad en la información disponible.
- Sesgos: no se documentan sesgos conocidos en la model card; al derivar de un modelo base de Microsoft, hereda los sesgos de sus datos de entrenamiento, no especificados.
- Contexto: la longitud máxima de contexto no se indica en la información disponible, lo que impide planificar aplicaciones con ventanas largas.
- Idiomas: aunque se declaran ocho idiomas, no se aportan métricas de calidad por idioma; el rendimiento relativo entre ellos es desconocido.
- Licencia: MIT, lo que permite uso comercial y modificación, pero se recomienda verificar las condiciones del modelo base de Microsoft.
- Producción: el checkpoint está pensado para ONNX Runtime GenAI; no se documentan alternativas de despliegue (vLLM, TGI, llama.cpp), lo que limita la integración en infraestructuras existentes basadas en otros runtimes.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de validación comunitaria.
- Precisión: aunque la cuantización es QAT, no se publican comparativas numéricas de degradación frente al modelo FP16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/warlockzero/Aion-1.0-Instruct-2.3B-int4
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B

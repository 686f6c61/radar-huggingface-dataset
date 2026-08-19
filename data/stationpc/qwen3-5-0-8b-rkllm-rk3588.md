# StationPC/Qwen3.5-0.8B-RKLLM-RK3588

## Resumen

El modelo `StationPC/Qwen3.5-0.8B-RKLLM-RK3588` es una conversión del modelo Qwen3.5-0.8B de Alibaba, optimizada para ejecutarse en el NPU del SoC Rockchip RK3588 mediante el formato RKLLM. Aunque la información oficial en HuggingFace es mínima (solo licencia y etiquetas), los repositorios relacionados de Qengineering indican que se trata de una versión cuantizada (w8a8) y adaptada para inferencia eficiente en dispositivos embebidos de bajo consumo. El modelo original es multimodal (imagen y texto) y cuenta con una ventana de contexto de 262 000 tokens según fuentes externas, lo que lo convierte en una opción interesante para aplicaciones de visión por computador y procesamiento de lenguaje natural en hardware de gama media como el RK3588.

La relevancia de esta conversión radica en que permite ejecutar un modelo de razonamiento multimodal en placas de desarrollo como Orange Pi 5 o Rock 5B, sin necesidad de GPU dedicada, gracias a la aceleración por NPU. Esto abre casos de uso en robótica, vigilancia inteligente, asistentes de voz locales y otras aplicaciones de edge computing donde el consumo energético y el coste son críticos. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), basado en Qwen3.5-0.8B (según fuentes externas) |
| Parametros totales | 0.8 mil millones (según el nombre del modelo) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | 262 000 tokens (según fuentes externas para Qwen3.5-0.8B) |
| Tipos de cuantizacion | w8a8 (según el nombre del archivo RKLLM) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (para NPU Rockchip) y RKNN (para el encoder de visión) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna ni el proceso de entrenamiento de esta conversión específica. Según las fuentes externas, el modelo original Qwen3.5-0.8B es un transformer multimodal con entrenamiento de fusión temprana (early fusion) sobre tokens multimodales, lo que le permite procesar texto e imágenes de forma unificada. El modelo base fue desarrollado por Alibaba y posteriormente convertido al formato RKLLM por la comunidad (Qengineering y StationPC) para su ejecución en el NPU del RK3588. No se dispone de datos sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO.

La conversión a RKLLM implica una cuantización de pesos y activaciones a 8 bits (w8a8), que reduce el tamaño del modelo a aproximadamente 1.56 GB (según el repositorio de Qengineering) y permite que las operaciones de álgebra lineal se ejecuten en la NPU del RK3588, mejorando la velocidad de inferencia en comparación con la CPU. El encoder de visión se convierte por separado a formato RKNN.

## Capacidades

- Procesamiento multimodal: acepta tanto texto como imágenes como entrada, gracias al encoder de visión integrado.
- Razonamiento y generación de texto: capaz de responder preguntas, mantener conversaciones y generar contenido coherente en múltiples dominios.
- Contexto largo: con 262 000 tokens de ventana, puede manejar documentos extensos o conversaciones de larga duración sin perder el hilo.
- Ejecución en edge: optimizado para NPU de Rockchip, lo que permite inferencia local sin conexión a la nube.
- Soporte de tool calling: según las características generales de la familia Qwen3.5, aunque no se confirma explícitamente para esta conversión.
- Capacidades multilingües: no se especifican los idiomas soportados en la información disponible.

## Casos de uso

- Vigilancia y análisis de video en tiempo real: el modelo puede procesar imágenes de cámaras IP conectadas al RK3588 para detectar objetos, personas o anomalías, y generar descripciones textuales de lo que ocurre.
- Asistente de voz local en dispositivos domésticos: combinado con un micrófono y altavoz, permite crear un asistente que entienda comandos de voz y responda sin depender de servicios en la nube, preservando la privacidad.
- Robot móvil con navegación semántica: el modelo interpreta el entorno visual del robot y genera instrucciones de navegación o descripciones de obstáculos, útil en robótica educativa o de servicios.
- Lectura de documentos escaneados: al aceptar imágenes, puede extraer información de facturas, formularios o placas de matrícula y convertirla en texto estructurado.
- Sistema de recomendación en kioscos interactivos: un kiosco con pantalla y cámara puede entender las preferencias del usuario a partir de su imagen y conversación, ofreciendo sugerencias personalizadas.
- Prototipado rápido de aplicaciones de IA en hardware embebido: desarrolladores pueden usar este modelo para validar conceptos de visión-lenguaje en placas de bajo coste antes de escalar a hardware más potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las fuentes externas mencionan que el modelo original Qwen3.5-0.8B tiene un rendimiento "fuerte en recuperación de información pero débil en precisión de código", pero no se aportan cifras concretas para esta conversión RKLLM. Se recomienda consultar los repositorios de Qengineering para posibles mediciones de velocidad en el RK3588, aunque no se incluyen en la información proporcionada.

## Requisitos de hardware

- Placa objetivo: Rockchip RK3588 (8 núcleos ARM Cortex-A76/A55) con NPU de 6 TOPS.
- Memoria: se recomienda al menos 4 GB de RAM para el modelo (1.56 GB de pesos) más el sistema operativo y el runtime de RKLLM.
- VRAM: no aplica, ya que la inferencia se realiza en la NPU integrada del SoC.
- GPU: no se requiere GPU externa; la NPU del RK3588 es suficiente.
- Opciones de despliegue: runtime RKLLM de Rockchip, disponible para Linux (Debian/Ubuntu) en placas como Orange Pi 5, Rock 5B y similares.
- Latencia y throughput: no se proporcionan datos específicos. Según la comunidad, modelos similares de 2B parámetros funcionan "bien" en el RK3588, pero se recomienda probar con la carga de trabajo concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (original) | 0.8B | 262K | Texto + visión | Apache 2.0 | Safetensors, GGUF |
| Qwen3-2B (conversión RK3588) | 2B | 128K (estimado) | Texto | Apache 2.0 | RKLLM |
| Qwen3.5-4B (original) | 4B | 262K | Texto + visión | Apache 2.0 | Safetensors, GGUF |

La comparativa se basa en datos de las fuentes web citadas. El modelo de 0.8B es el más ligero de la familia Qwen3.5 y el único con conversión RKLLM documentada hasta la fecha. Frente a Qwen3-2B, ofrece la ventaja de la multimodalidad y un contexto mayor, a costa de menor capacidad de razonamiento y generación de código.

## Limitaciones y advertencias

- La información oficial del modelo es extremadamente escasa: la model card está vacía y solo se indica la licencia. No se garantiza la trazabilidad del proceso de conversión ni la fidelidad al modelo original.
- El rendimiento en tareas de código es débil según fuentes externas; para programación se recomienda usar modelos de mayor tamaño (4B o más).
- La cuantización w8a8 puede degradar ligeramente la precisión en comparación con el modelo en FP16, especialmente en tareas de razonamiento complejo.
- El modelo está diseñado exclusivamente para el NPU del RK3588; no funcionará en otras plataformas sin una conversión adicional.
- No se especifican los idiomas soportados, aunque Qwen3.5 suele tener buen soporte multilingüe, no se confirma para esta versión.
- El contexto de 262K tokens es teórico; en la práctica, la memoria del RK3588 puede limitar el uso de ventanas muy largas.
- Al ser un modelo generativo, existe riesgo de alucinaciones y sesgos inherentes a los datos de entrenamiento del modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StationPC/Qwen3.5-0.8B-RKLLM-RK3588
- Repositorio de Qengineering (conversión similar): https://github.com/Qengineering/Qwen3.5-0.8B-NPU
- Modelo de Qengineering en HuggingFace: https://huggingface.co/Qengineering/Qwen3.5-0.8B-rk3588
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Artículo de benchmark de Qwen3.5 0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/

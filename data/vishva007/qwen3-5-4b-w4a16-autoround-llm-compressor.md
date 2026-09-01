# Vishva007/Qwen3.5-4B-W4A16-AutoRound-LLM-Compressor

## Resumen

Vishva007/Qwen3.5-4B-W4A16-AutoRound-LLM-Compressor es una versión cuantizada del modelo multimodal Qwen/Qwen3.5-4B, desarrollada por Vishva007 mediante el método AutoRound de Intel. Esta cuantización reduce los pesos a 4 bits manteniendo las activaciones en 16 bits (W4A16), lo que permite un despliegue más eficiente en GPU de consumo sin renunciar a las capacidades del modelo original, que incluyen procesamiento de imagen y texto, razonamiento y generación de lenguaje.

El modelo está pensado para entornos de producción donde el uso de memoria es crítico. Al mantener la torre de visión en BF16 y los módulos de predicción multi-token (MTP) en bfloat16, se preserva la precisión en tareas visuales y de razonamiento, mientras que el resto de pesos se cuantizan a 4 bits. Con aproximadamente 4,54 mil millones de parámetros, esta versión ofrece una reducción de memoria cercana al 50 % frente al modelo base en FP16, facilitando su ejecución en hardware de gama media.

La relevancia de este modelo radica en su compatibilidad con backends de inferencia como vLLM, SGLang y AutoGPTQ, así como con la biblioteca transformers. Además, al habilitar MTP, se puede aprovechar la decodificación especulativa para mejorar el rendimiento en producción. Es una opción práctica para desarrolladores que necesitan un modelo multimodal ligero y de código abierto (licencia Apache-2.0) sin sacrificar demasiada calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto) basado en Qwen3.5-4B |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones FP16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con vLLM, SGLang, AutoGPTQ) |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen3.5-4B original, que emplea una arquitectura transformer multimodal capaz de procesar entradas de imagen y texto. La cuantización se realizó con AutoRound, un método basado en descenso de gradiente por signo desarrollado por Intel, diseñado para mantener la precisión en entornos de producción. Los parámetros de cuantización incluyen un tamaño de grupo de 16, cuantización simétrica, 1000 iteraciones y 512 muestras de calibración con una longitud de secuencia de 4096 tokens. Se habilitó torch.compile durante el proceso.

Una característica destacada es que la torre de visión (quant_nontext_module) se mantiene en BF16 para preservar la precisión en tareas de razonamiento visual y OCR. De igual forma, los módulos de predicción multi-token (mtp y mtp.fc) se conservan en bfloat16 nativo, lo que permite el uso de decodificación especulativa con MTP. No se dispone de información sobre el entrenamiento original del modelo base, como el número de tokens o la composición del dataset.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-4B, incluyendo razonamiento lógico y matemático.
- Procesamiento multimodal: acepta entradas de imagen y texto, lo que permite tareas de visión por computador, OCR y descripción de imágenes.
- Soporte de decodificación especulativa mediante MTP: permite mejorar el throughput en inferencia con backends compatibles (por ejemplo, vLLM).
- Compatibilidad con tool calling y agentes: aunque no se detalla explícitamente, el modelo base Qwen3.5-4B soporta estas funcionalidades; la cuantización no las elimina.
- Capacidades multilingües: no se especifican los idiomas soportados, pero el modelo base Qwen suele cubrir múltiples lenguas.
- Modo de razonamiento: el modelo base incluye modos de pensamiento (thinking) que se mantienen en la versión cuantizada.

## Casos de uso

- Asistentes conversacionales con visión: el modelo puede gestionar diálogos multi-turno que incluyan imágenes, por ejemplo, para soporte técnico donde el usuario envía capturas de pantalla. Su tamaño reducido permite ejecutarlo en GPU de consumo.
- OCR y extracción de información de documentos: gracias a la torre de visión en BF16, es adecuado para extraer texto de imágenes y documentos escaneados, manteniendo una buena precisión.
- Generación de código asistida por contexto visual: un desarrollador puede mostrar un diagrama o captura de una interfaz y pedir al modelo que genere el código correspondiente. La cuantización permite integrarlo en entornos de desarrollo con recursos limitados.
- Clasificación y análisis de imágenes en tiempo real: en aplicaciones de moderación de contenido o análisis de productos, el modelo puede procesar imágenes y devolver descripciones o etiquetas con baja latencia.
- Chatbots de atención al cliente con contexto largo: aunque la longitud de contexto no está especificada, el modelo base soporta ventanas amplias; la cuantización no reduce esta capacidad, permitiendo gestionar conversaciones extensas.
- Prototipado rápido de aplicaciones multimodales: al ser ligero y compatible con transformers, es ideal para experimentar en notebooks o entornos de desarrollo sin necesidad de infraestructura de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de MMLU, HumanEval, GSM8K u otras métricas para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada: con 4,54 mil millones de parámetros y cuantización W4A16, los pesos ocupan aproximadamente 2,3 GB (4 bits por parámetro). Sumando activaciones, contexto y overhead, se estima un consumo total de 3-4 GB de VRAM para inferencia básica.
- GPU recomendadas: tarjetas con 4-6 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, GTX 1660 Super o equivalentes de AMD con soporte ROCm. También puede ejecutarse en GPU de datacenter como A10 o T4.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPU modernas de gama media.
- Opciones de despliegue: vLLM (con soporte MTP), SGLang, AutoGPTQ, y transformers con carga directa de safetensors.
- Latencia y throughput: no se proporcionan datos concretos. Con MTP y decodificación especulativa, se espera una mejora significativa en el número de tokens generados por segundo, aunque depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos cuantizados de la misma familia. El autor ha publicado versiones similares de Qwen3.5 (0.8B y 9B) con el mismo método, pero no se ofrecen datos de rendimiento comparativos. Como referencia, el modelo base Qwen3.5-4B en FP16 ocuparía aproximadamente 9 GB, mientras que esta versión reduce el uso de memoria a la mitad, a costa de una posible ligera degradación en precisión.

## Limitaciones y advertencias

- Degradación de precisión: al ser una cuantización 4-bit, puede haber pérdida de calidad en tareas de razonamiento complejo o generación de código avanzado, aunque AutoRound está diseñado para minimizarla.
- Alucinaciones: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en contextos ambiguos.
- Limitaciones de idioma: no se especifican los idiomas soportados; es probable que el modelo base tenga un rendimiento desigual en lenguas minoritarias.
- Contexto no especificado: se desconoce la longitud máxima de contexto soportada, lo que puede afectar a aplicaciones que requieran ventanas largas.
- Dependencia del backend: el soporte de MTP requiere backends específicos (vLLM, SGLang); no todos los entornos de inferencia lo implementan.
- Licencia: Apache-2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base Qwen3.5-4B por si hubiera condiciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishva007/Qwen3.5-4B-W4A16-AutoRound-LLM-Compressor
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentación de LLM Compressor para Qwen3.5: https://docs.vllm.ai/projects/llm-compressor/en/latest/key-models/qwen3.5/
- Repositorio de AutoRound: https://github.com/intel/auto-round
- Colección de modelos cuantizados del autor (LinkedIn): https://www.linkedin.com/posts/vishva-r_ai-llm-multimodalai-activity-7435386115567775744-a3Ge

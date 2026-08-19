# tpnlabs/TPN-001-Base-Qwen3.5-2B

## Resumen

TPN-001-Base-Qwen3.5-2B es un modelo de lenguaje causal con codificador de visión, desarrollado por el laboratorio tpnlabs como un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-2B-Base de Alibaba. Con aproximadamente 2.270 millones de parámetros, este modelo hereda la arquitectura híbrida de la familia Qwen3.5, que combina Gated Delta Networks con atención lineal y mecanismos de atención tradicionales, junto con un codificador visual integrado que lo convierte en un modelo nativamente multimodal (texto e imagen).

El modelo está pensado para tareas de prototipado, ajuste fino específico y fines de investigación, tal y como indica su propia documentación. Su ventana de contexto nativa de 262.144 tokens lo sitúa en una posición competitiva para tareas que requieren manejar documentos extensos o conversaciones multi-turno largas. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que facilita su adopción en entornos empresariales.

La relevancia de este modelo radica en que pertenece a la nueva generación Qwen3.5, que introduce avances en eficiencia arquitectónica, entrenamiento con refuerzo a escala y cobertura lingüística ampliada a 201 idiomas. Sin embargo, es importante señalar que el repositorio de tpnlabs presenta el modelo con un número de descargas y valoraciones igual a cero, por lo que se trata de un lanzamiento reciente o de baja difusión que requiere validación independiente antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + Gated Attention + FFN, con codificador de visión |
| Parametros totales | 2.274.069.824 (2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | No disponible (formato safetensors en precisión completa) |
| Idiomas soportados | 201 idiomas y dialectos (segun documentacion de Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

La arquitectura del modelo sigue el diseño híbrido de Qwen3.5, que combina capas de Gated Delta Networks (atención lineal) con capas de Gated Attention (atención tradicional) en un patrón de 6 bloques repetidos: cada bloque contiene 3 sub-bloques de Gated DeltaNet seguidos de FFN, y un sub-bloque de Gated Attention seguido de FFN. En total hay 24 capas, con dimensión oculta de 2048 y dimensión intermedia de FFN de 6144. El embedding de tokens tiene un tamaño de 248.320 (con padding) y está atado a la salida del LM. El modelo incorpora también un mecanismo MTP (Multi-Token Prediction) entrenado con múltiples pasos.

El entrenamiento se realizó en dos fases: pre-entrenamiento y post-entrenamiento. La familia Qwen3.5 destaca por el uso de entrenamiento con refuerzo escalado a entornos de un millón de agentes con distribuciones de tareas progresivamente complejas, y por una eficiencia de entrenamiento multimodal cercana al 100% comparada con el entrenamiento solo de texto. El modelo base fue desarrollado por Alibaba, y el repositorio de tpnlabs presenta un ajuste fino adicional, aunque no se especifican los datos ni el método de dicho ajuste en la información disponible.

## Capacidades

- Generación de texto causal con soporte nativo de multimodalidad (entrada de imagen y texto, salida de texto).
- Razonamiento y comprensión de lenguaje en modo instructivo, con capacidad de alternar entre modos de pensamiento y respuesta directa (non-thinking mode).
- Comprensión visual: el modelo integra un codificador de visión con fusión temprana de tokens multimodales, lo que le permite procesar imágenes junto con texto.
- Soporte de agentes y razonamiento multi-paso, segun las capacidades declaradas de la familia Qwen3.5.
- Cobertura multilingüe amplia: 201 idiomas y dialectos, con comprensión de matices culturales y regionales.
- Generación de código y capacidades de razonamiento matemático, aunque no se proporcionan benchmarks específicos en la información disponible.
- Compatibilidad con herramientas de inferencia estándar: Transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- Prototipado rapido de aplicaciones conversacionales: gracias a su tamano de 2B, el modelo puede ejecutarse en GPU de consumo para validar ideas de producto antes de escalar a modelos mayores.
- Analisis de documentos extensos: con 262.144 tokens de contexto nativo, puede procesar libros completos, informes anuales o expedientes legales de una sola pasada.
- Asistencia visual para accesibilidad: el modelo puede describir imagenes para personas con discapacidad visual, combinando comprension de imagen y generacion de texto en un unico sistema.
- Clasificacion y extraccion de informacion multilingue: su soporte de 201 idiomas lo hace adecuado para tareas de procesamiento de texto en entornos internacionales.
- Ajuste fino para dominios especificos: al ser un modelo base, es un punto de partida adecuado para fine-tuning en sectores como medicina, derecho o finanzas, con datos propios.
- Educacion y tutoria: puede generar explicaciones, resolver dudas y crear material didactico adaptado al nivel del estudiante, aprovechando su capacidad de razonamiento.
- Automatizacion de soporte tecnico: con su contexto largo y capacidad de seguir instrucciones, puede gestionar conversaciones multi-turno con historial extenso.

## Benchmarks y rendimiento

La informacion disponible incluye resultados parciales de benchmarks de lenguaje en modo instructivo (non-thinking). Los datos presentados en la model card se comparan con otros modelos de la familia Qwen. Es importante senalar que la tabla original aparece truncada en la informacion proporcionada, por lo que solo se muestran los siguientes resultados:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se dispone de resultados para benchmarks de codigo (HumanEval, MBPP), matematicas (GSM8K, MATH) ni de comprension visual en la informacion proporcionada. El modelo Qwen3.5-2B supera claramente a Qwen3-1.7B en todos los benchmarks mostrados, pero queda por detras de Qwen3-4B-2507, lo cual es esperable dada la diferencia de parametros. La relacion rendimiento/tamano es favorable: con aproximadamente la mitad de parametros que Qwen3-4B, el modelo alcanza un 80% de su rendimiento en MMLU-Pro.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 2.274 millones de parametros. En FP16, el peso ocupa aproximadamente 4,5 GB, por lo que se necesita al menos 6-8 GB de VRAM para inferencia con contexto moderado. Con cuantizacion INT4 o INT8, la huella se reduce a 1,5-2,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM puede ejecutar el modelo. Tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores son suficientes. Para contexto largo (262K tokens), se recomienda al menos 16 GB de VRAM o el uso de tecnicas de atencion eficiente como FlashAttention.
- Si cabe en GPU de consumo: si, es un modelo disenado para caber en hardware de consumo, especialmente con cuantizacion.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers. Tambien puede convertirse a formato GGUF para su uso con llama.cpp u Ollama, aunque no se proporciona un archivo GGUF en el repositorio.
- Latencia y throughput: no se proporcionan datos especificos. Como referencia, un modelo de 2B en una RTX 4090 suele alcanzar 50-100 tokens por segundo con cuantizacion INT8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TPN-001-Base-Qwen3.5-2B | 2,27B | 262.144 | 55,3 | Apache 2.0 | Hugging Face |
| Qwen3-1.7B | 1,7B | 262.144 | 40,2 | Apache 2.0 | Hugging Face |
| Qwen3-4B-2507 | 4B | 262.144 | 69,6 | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B | 0,8B | 262.144 | 29,7 | Apache 2.0 | Hugging Face |

El modelo TPN-001 se posiciona como una alternativa de tamano intermedio entre Qwen3-1.7B y Qwen3-4B, con un rendimiento notablemente superior al primero y a un coste computacional menor que el segundo. Su principal ventaja frente a Qwen3-1.7B es el salto en MMLU-Pro (55,3 vs 40,2), que representa una mejora del 37% relativo. La familia Qwen3.5 en su conjunto ofrece mejoras de rendimiento sobre la generacion anterior a igualdad de parametros, como se observa al comparar Qwen3.5-2B con Qwen3-1.7B.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un lanzamiento muy reciente o con escasa adopcion. No hay evidencia de validacion independiente por parte de la comunidad.
- No se especifica en que consiste el ajuste fino realizado por tpnlabs sobre el modelo base de Qwen. No se detallan los datos de entrenamiento, el metodo (SFT, DPO, RLHF) ni los objetivos del ajuste.
- La model card del repositorio reproduce el contenido oficial de Qwen3.5-2B, pero no hay informacion especifica sobre las diferencias entre este modelo y el base original de Alibaba.
- Los benchmarks presentados corresponden al modelo Qwen3.5-2B original, no necesariamente a esta version ajustada. El rendimiento real puede variar.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma especificas de este ajuste.
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda verificar que el ajuste fino no haya introducido datos con licencias restrictivas.
- El contexto de 262K tokens requiere un uso cuidadoso de la memoria: en FP16, el KV cache para contexto completo puede superar los 16 GB de VRAM.
- No se dispone de informacion sobre la calidad de la comprension visual en este modelo concreto, aunque la arquitectura lo soporta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tpnlabs/TPN-001-Base-Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Coleccion Qwen3.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen35
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Anuncio de Alibaba sobre Qwen3.5: https://www.alibabagroup.com/document-1960233590314762240
- Guia de Qwen 3.5 con benchmarks y configuracion local: https://qwen-ai.com/qwen-3-5/
- Catalogo de Microsoft Foundry para Qwen3.5-9B (referencia de despliegue): https://ai.azure.com/catalog/models/qwen-qwen3.5-9b

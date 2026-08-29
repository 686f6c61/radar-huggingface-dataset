# yobo2u/Qwen3.8-Flash-Next-AWQ

## Resumen

Qwen3.8-Flash-Next-AWQ es una derivación cuantizada del modelo Qwen3.8-Flash-Next, desarrollada por el usuario yobo2u. Aplica una cuantización AWQ selectiva únicamente a las proyecciones gate/up/down de los 48 expertos enrutados del modelo MoE principal, reduciendo el peso de estos componentes a W4A16 asimétrico con grupo 128, mientras que el resto de pesos (visión, atención, expertos compartidos, embeddings, normalización, cabeza de lenguaje y pesos NEXTN/MTP) se mantienen en su precisión original. Esto permite un ahorro de memoria y una mejora de throughput en inferencia, aunque requiere un runtime específico (SGLang con parche) para funcionar correctamente.

El modelo base, Qwen3.8-Flash-Next, es un modelo multimodal de tipo causal language model con vision encoder, desarrollado por Alibaba Qwen como una vista previa experimental de la arquitectura que sustentará Qwen4. Presenta una arquitectura híbrida con atención Gated DeltaNet y Qwen Sparse Attention (QSA), Gated Residual, N-gram Embedding y un entrenamiento optimizado con Muon y AdamW. Con 125B parámetros totales (más 51B de n-gram embedding y 4B MTP) y 6B activos por token, soporta un contexto nativo de 262.144 tokens, extensible a 1M con YaRN. La versión AWQ mantiene todas estas capacidades, pero con una huella de memoria reducida en los expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal híbrido: Gated DeltaNet + Qwen Sparse Attention (QSA), Gated Residual, N-gram Embedding, con vision encoder |
| Parametros totales | 125B (modelo principal) + 51B (n-gram embedding) + 4B (MTP) = 180B aprox. |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1M con YaRN |
| Tipos de cuantizacion | AWQ W4A16 asimétrico grupo 128 solo en expertos enrutados; resto en BF16 (según validación) |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | No disponible (presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención sparse Qwen Sparse Attention (QSA). QSA opera a nivel de micro-bloques en lugar de tokens individuales, reduciendo la latencia en contextos largos. Se añade un mecanismo de Gated Residual que modula el flujo de información en los residual streams mediante puertas de lectura y escritura dependientes de los datos. La capa de embeddings utiliza n-gramas (bigramas y trigramas) para escalar parámetros de forma eficiente sin aumentar el coste computacional. El entrenamiento emplea una receta con optimizadores Muon y AdamW aplicados a categorías de pesos específicas, con leyes de escalado ajustadas que eliminan el warmup de batch size.

La versión AWQ de yobo2u cuantiza únicamente las proyecciones de los expertos enrutados (gate, up, down) a W4A16 asimétrico con grupo 128. El resto de componentes permanece en su precisión original (BF16 según la validación). Esta cuantización selectiva reduce la memoria ocupada por los expertos, que son la mayor parte de los parámetros del MoE, manteniendo la calidad en las partes críticas como atención y embeddings. No se dispone de información sobre el dataset de entrenamiento ni el proceso de post-entrenamiento del modelo base.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de matemáticas y lógica.
- Comprensión multimodal: procesa imágenes y texto (pipeline image-text-to-text), con capacidad de OCR (validado 10/10 en pruebas).
- Soporte de tool calling y uso de herramientas (validado 25/25 en pruebas).
- Capacidad de agentes y razonamiento multi-paso, favorecida por el contexto largo nativo de 262K tokens.
- Decodificación especulativa mediante NEXTN/MTP (multi-token prediction) con pasos de draft, mejorando el throughput.
- Multilingüismo: no se especifican idiomas concretos, pero el modelo base de Qwen suele cubrir múltiples lenguas; no confirmado para esta derivación.
- Recuperación de información en contextos largos (validado 3/3 en pruebas de retrieval de 30K).

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens), permitiendo mantener el historial completo de una interacción sin truncamientos. Su capacidad de tool calling permite integrarse con sistemas de ticketing o bases de conocimiento.
- **Análisis de documentos extensos**: ideal para procesar informes financieros, contratos o papers científicos de cientos de páginas en una sola pasada, extrayendo información relevante o resumiendo secciones específicas gracias a su ventana de contexto nativa.
- **Generación de código en producción**: con soporte de tool calling y razonamiento, puede integrarse en pipelines de CI/CD para generar o revisar código, así como para autocompletar funciones en IDEs con baja latencia gracias a la cuantización AWQ.
- **Asistentes de programación con contexto de repositorio completo**: al admitir 262K tokens, puede procesar un repositorio entero y responder preguntas sobre arquitectura, dependencias o errores, superando las limitaciones de modelos con contexto más corto.
- **Agentes autónomos para automatización de tareas**: su capacidad de razonamiento multi-paso y tool calling lo hace adecuado para agentes que navegan por APIs, ejecutan comandos o interactúan con servicios web, manteniendo el estado de la conversación en memoria.
- **Procesamiento de imágenes en entornos empresariales**: gracias al vision encoder y la validación OCR, puede extraer texto de facturas, capturas de pantalla o documentos escaneados, integrándose en flujos de digitalización documental.
- **Búsqueda y recuperación en grandes corpus**: su contexto largo y la validación de retrieval (30K) lo hacen útil para sistemas de pregunta-respuesta sobre bases de conocimiento extensas, como manuales técnicos o normativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del autor solo incluye métricas de rendimiento de inferencia local, no comparativas de calidad.

## Requisitos de hardware

- **VRAM estimada**: al cuantizar solo los expertos a W4A16, el modelo completo requiere una cantidad significativa de memoria. Con 125B parámetros en BF16 (parte no cuantizada) más los expertos en W4A16, se estima un consumo superior a 200 GB en total, por lo que no cabe en una sola GPU de consumo.
- **GPUs recomendadas**: la validación se realizó en 4× NVIDIA A800-SXM4-80GB con tensor parallelism (TP4). Se recomiendan GPUs de data center con 80 GB de VRAM o más (A800, A100, H100, etc.).
- **Compatibilidad con GPUs de consumo**: no es viable en GPUs consumer (RTX 4090, 3090, etc.) debido a los requisitos de memoria y al runtime específico.
- **Opciones de despliegue**: el runtime validado es SGLang con un parche específico para el scope de cuantización `experts_only`. Otros motores (vLLM, llama.cpp, TGI, Ollama) pueden no entender correctamente esta cuantización selectiva. Se incluye una configuración Triton específica para A800 en `runtime/configs/`.
- **Latencia y throughput**: en la validación con 4× A800, se midieron throughputs estables de 153,99 (C1), 420,10 (C4), 803,60 (C8), 1371,22 (C16) y 1829,15 (C32) tokens de salida por segundo. Los TTFT de prefill fueron 3,435 s (32K), 6,870 s (64K) y 14,634 s (131K tokens). Estos valores son específicos de la configuración probada y pueden variar en otros entornos.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Cuantización | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B + 4B | 6B | 262K (1M con YaRN) | qwen-community-1.0 | Sin cuantizar | Modelo original, compatible con frameworks estándar |
| Qwen3.8-Flash-Next-AWQ (este) | 125B + 51B + 4B | 6B | 262K (1M con YaRN) | qwen-community-1.0 | AWQ selectivo en expertos | Requiere SGLang con parche |
| Qwen3.8-Flash (oficial) | No disponible | No disponible | 1M por defecto | No disponible | No disponible | Versión de producción con herramientas integradas, vía Qwen Cloud |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros MoE comparables en la información proporcionada. La principal diferencia entre el modelo base y la versión AWQ es la reducción de memoria en los expertos a costa de requerir un runtime específico; la versión oficial Qwen3.8-Flash añade características de producción adicionales.

## Limitaciones y advertencias

- **Compatibilidad restringida**: la cuantización selectiva de expertos no es comprendida por los motores de inferencia estándar; solo se ha validado con SGLang y un parche específico. Usar otros runtimes puede dar resultados incorrectos o fallos.
- **Configuración hardware específica**: el archivo de configuración Triton incluido está optimizado para A800; no se garantiza su rendimiento en otras GPUs.
- **Naturaleza experimental**: el modelo base es una vista previa de la arquitectura de Qwen4, por lo que puede tener comportamientos inesperados o cambios en futuras versiones.
- **Sesgos y alucinaciones**: no se ha publicado información sobre sesgos o evaluación de alucinaciones. Como todo LLM, puede generar contenido falso o no verificado, especialmente en contextos largos.
- **Licencia**: la licencia qwen-community-1.0 no se detalla en la información disponible; es necesario revisar los términos completos para uso comercial.
- **Idiomas**: no se especifican los idiomas soportados, lo que limita la confianza en despliegues multilingües sin pruebas adicionales.
- **Requisitos de hardware elevados**: a pesar de la cuantización, el modelo sigue requiriendo múltiples GPUs de data center, lo que limita su uso a entornos con infraestructura dedicada.

## Enlaces

- [Modelo AWQ en HuggingFace](https://huggingface.co/yobo2u/Qwen3.8-Flash-Next-AWQ)
- [Modelo base Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Blog de Qwen sobre Qwen3.8-Flash-Next](https://qwen.ai/blog?id=qwen3.8-flash-next)
- [Repositorio GitHub de Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/tree/main)
- [Anuncio en foros de NVIDIA](https://forums.developer.nvidia.com/t/qwen3-8-flash-next-176b-now-available/381413)
- [Página de Qwen3.8-Flash en QwenCloud](https://www.qwencloud.com/models/qwen3.8-flash)

# taobao-mnn/Qwen3.5-2B-MNN

## Resumen

Qwen3.5-2B-MNN es la versión cuantizada y empaquetada para el motor de inferencia MNN del modelo vision-language Qwen3.5-2B, desarrollado originalmente por el equipo Qwen de Alibaba y adaptado por taobao-mnn. Resuelve el problema de ejecutar un modelo multimodal de 2.000 millones de parámetros en hardware modesto, incluyendo CPU, mediante cuantización HQQ de 4 bits y un formato de pesos optimizado para MNN. Es relevante porque permite desplegar comprensión de imagen y texto en dispositivos sin GPU dedicada, algo poco habitual en modelos de esta categoría.

El modelo combina una torre visual con un decodificador de lenguaje de 24 capas y dimensión oculta 2048, que integra capas Gated DeltaNet junto con atención completa. El repositorio incluye tanto los pesos del modelo de lenguaje como los del codificador visual, todo en 4 bits con escalas en FP16, lo que reduce el tamaño del artefacto a unos 2,6 GB.

La ficha se centra en la versión MNN empaquetada, no en el modelo base original. Los datos disponibles provienen de la model card del autor del empaquetado y de los metadatos de Hugging Face; cualquier especificación no documentada se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con Gated DeltaNet + atención completa (lenguaje) más torre visual |
| Parametros totales | 2B (aproximado, según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit (grupo 64 en lenguaje y cabeza de salida; grupo 128 en visión), escalas FP16 |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `visual.mnn`, `visual.mnn.weight`, `tokenizer.mtok`) |
| Capas / dimension oculta (lenguaje) | 24 / 2048 |
| Entrada / salida | Texto e imagen / texto |
| Tamano del repositorio | 2,6 GB |
| Modo thinking | Activado por defecto en la configuración incluida |

## Arquitectura y entrenamiento

La torre de lenguaje emplea 24 capas con dimensión oculta 2048 y combina capas Gated DeltaNet con capas de atención completa, un esquema híbrido que busca reducir el coste computacional en secuencias largas manteniendo la capacidad de atención global. La parte visual se distribuye en archivos separados (`visual.mnn` y `visual.mnn.weight`) y se integra mediante la interfaz multimodal de MNN, configurada en `llm_config.json`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card del empaquetado no documenta el proceso de entrenamiento, solo el de cuantización y exportación. La innovación técnica destacable de esta versión es la cuantización HQQ de 4 bits con grupos de 64 y 128 y escalas en FP16, junto con el uso compartido de pesos entre embeddings y cabeza de salida, que reduce el espacio en disco y la memoria necesaria para inferencia en CPU.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Comprensión de imágenes y respuesta en formato image-text-to-text.
- Conversaciones multi-turno con instrucciones (instruction-tuned).
- Modo de razonamiento (thinking mode) activado por defecto en la configuración incluida.
- Inferencia en CPU mediante MNN, con configuración por defecto de 4 hilos, `precision=low` y `memory=low`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente visual en dispositivos sin GPU: el modelo puede procesar una imagen y responder preguntas sobre ella en CPU con 4 hilos, gracias a la cuantización HQQ de 4 bits y al motor MNN optimizado para memoria baja.
- Aplicaciones móviles y de escritorio integradas: al empaquetarse en formato MNN con archivos de grafo y pesos separados, se puede incrustar en apps nativas que usen el runtime MNN, sin depender de CUDA ni de servidores externos.
- Moderación de contenido con imagen: clasificación y descripción de imágenes enviadas por usuarios en un pipeline local, aprovechando la torre visual y el decodificador de lenguaje en un único artefacto de 2,6 GB.
- Atención al cliente multimodal: respuestas a consultas que incluyen capturas de pantalla o fotos de producto, con conversación multi-turno en chino o inglés.
- Procesamiento por lotes en servidores sin GPU: despliegue en máquinas CPU para tareas de descripción de imágenes o extracción de información visual a bajo coste.
- Prototipado rápido de aplicaciones vision-language: el repositorio incluye configuración de ejecución y un demo (`llm_demo`) que permite validar el modelo con un prompt de texto o con entradas de imagen antes de integrarlo en producción.
- Educación y accesibilidad: descripción de imágenes para usuarios con discapacidad visual en entornos con hardware limitado, usando el modo thinking para respuestas más elaboradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta pruebas de validación funcional: el 9 de noviembre de 2026, en CPU x64, se superaron casos de texto, una prueba de humo con la configuración por defecto y tres casos con imágenes sintéticas, además de una comprobación de alineación entre los mapeos de lenguaje y visión.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso por defecto, ya que la configuración incluida está pensada para CPU; no se documenta el consumo en GPU.
- GPU recomendadas: no disponible; el empaquetado está orientado a CPU y no se especifican GPU compatibles.
- ¿Cabe en GPU de consumo? No hay datos publicados. El tamaño del repositorio (2,6 GB) sugiere que los pesos en 4 bits podrían caber en GPUs con 4-8 GB de memoria, pero no está confirmado por el autor.
- Opciones de despliegue: MNN (versión 3.6.2, commit `b0239771b07b317a258fbc384683bbd540741406`), compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_SUPPORT_TRANSFORMER_FUSE=ON` y `MNN_BUILD_LLM_OMNI=ON`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Configuración por defecto: CPU, 4 hilos, `precision=low`, `memory=low`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-MNN (este) | 2B | no disponible | Texto + imagen | Apache 2.0 | MNN 4-bit |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Texto + imagen | Apache 2.0 | Safetensors (presumiblemente) |
| Otros modelos vision-language de ~2B | no disponible | no disponible | Texto + imagen | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este empaquetado y el modelo base ni con alternativas de la misma categoría. La comparación se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- Solo se documentan los idiomas chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- No se publican datos sobre sesgos, alucinación ni evaluación de seguridad del modelo base ni del empaquetado.
- La longitud de contexto no está especificada, lo que impide planificar cargas con secuencias largas.
- El formato MNN es específico del runtime de Alibaba; no es directamente compatible con ecosistemas como transformers, vLLM o llama.cpp, lo que limita la portabilidad.
- La cuantización HQQ de 4 bits puede degradar la precisión respecto al modelo original en tareas sensibles, aunque no se aportan métricas de dicha degradación.
- El modo thinking está activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva en la configuración.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base Qwen3.5-2B y de la versión de MNN utilizada.
- El repositorio tiene pocas descargas (1.322) y likes (3), por lo que la validación comunitaria es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen3.5-2B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- ModelScope: https://modelscope.cn/models/MNN/Qwen3.5-2B-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentación de MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia: https://huggingface.co/taobao-mnn/Qwen3.5-2B-MNN/blob/main/LICENSE

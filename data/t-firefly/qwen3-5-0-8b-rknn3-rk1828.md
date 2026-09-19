# t-firefly/qwen3.5-0.8b-rknn3-rk1828

## Resumen

`t-firefly/qwen3.5-0.8b-rknn3-rk1828` es una conversión del modelo multimodal Qwen3.5-0.8B, realizada por el equipo de Firefly AI (T-Firefly, fabricante de placas embebidas) para ejecutarse sobre la NPU Rockchip RK1828 mediante el runtime RKNN3 y la herramienta de despliegue LlamaPi. No se trata de un modelo nuevo, sino de un artefacto de adaptación de hardware: el peso intelectual y la arquitectura pertenecen al Qwen Team, mientras que Firefly aporta la conversión y el empaquetado para edge AI.

El modelo base, Qwen3.5-0.8B, es un modelo nativo de visión-lenguaje de la familia Qwen3.5, con unos 800 millones de parámetros y una arquitectura híbrida basada en Gated Delta Networks combinadas con Mixture-of-Experts disperso, pensada para inferencia de baja latencia y alto rendimiento en entornos con recursos limitados. Según la model card, soporta 201 idiomas y dialectos y mantiene una ventana de contexto nativa de 262.144 tokens, lo que resulta inusual en un modelo de este tamaño.

Su relevancia inmediata es acotada pero concreta: es uno de los pocos artefactos publicados que permite ejecutar un VLM compacto sobre la NPU RK1828 de Rockchip, un segmento donde la oferta de pesos preconvertidos es escasa. La ficha de HuggingFace registra 0 descargas y 0 likes, y no hay benchmarks publicados, por lo que debe considerarse un artefacto reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida con Gated Delta Networks y Mixture-of-Experts disperso; multimodal de fusión temprana (según la model card del modelo original) |
| Parametros totales | 0,8B (según la denominación del modelo base) |
| Parametros activos | no disponible (la model card indica MoE disperso, pero no especifica el ratio de activación) |
| Longitud de contexto | 262.144 tokens nativos (heredado del modelo original) |
| Tipos de cuantizacion | Conversión a RKNN3 para NPU Rockchip RK1828; el repositorio incluye la etiqueta `gguf`, pero no se detallan los niveles de cuantización aplicados |
| Idiomas soportados | 201 idiomas y dialectos (dato de la model card del modelo original; los metadatos de HuggingFace indican "no disponibles") |
| Licencia | Apache-2.0 |
| Formato de pesos | RKNN3 (artefacto binario para NPU Rockchip RK1828); no se distribuyen safetensors. Repositorio de 1,2 GB |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Desarrollador de la conversión | Firefly AI Team (t-firefly) |
| Herramienta de despliegue | LlamaPi |
| Plataforma objetivo | Rockchip RK1828 |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

Este repositorio no documenta ningún entrenamiento propio: es una conversión de pesos. La arquitectura descrita corresponde al modelo original, Qwen3.5-0.8B, que según su model card combina Gated Delta Networks (una familia de capas recurrentes con estado, alternativas a la atención completa) con capas de Mixture-of-Experts disperso, lo que reduce el coste computacional por token al activar solo una fracción de los parámetros. El componente multimodal se entrena con fusión temprana, es decir, las representaciones visuales se integran en las capas iniciales del transformer en lugar de concatenarse tardíamente.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO. Tampoco se detalla qué parte del pipeline original (encoder visual, proyector, capas del lenguaje) se ha convertido a RKNN3, ni con qué precisión numérica. El tamaño del repositorio (1,2 GB) es compatible con pesos de 8 bits para un modelo de 0,8B, pero esto es una inferencia aritmética, no un dato confirmado por el autor.

La innovación técnica relevante aquí no está en el modelo sino en el artefacto: la disponibilidad de un grafo RKNN3 listo para la NPU RK1828, ejecutable con un único comando (`llamapi run qwen3.5:0.8b`) que gestiona descarga, carga y ejecución.

## Capacidades

- Generación de texto conversacional multi-turno en formato de chat.
- Comprensión de imágenes y texto de forma conjunta (pipeline declarado `image-text-to-text`): descripción de imágenes, preguntas sobre contenido visual y tareas de visión-lenguaje en general.
- Multilingüismo amplio: 201 idiomas y dialectos según la model card del modelo original.
- Procesamiento de contextos muy largos: hasta 262.144 tokens nativos, adecuado para documentos extensos o historiales de conversación prolongados.
- Inferencia en edge: ejecución sobre NPU Rockchip RK1828 con el runtime RKNN3, sin necesidad de GPU dedicada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la información proporcionada.
- Soporte de audio: no indicado; el pipeline declarado es únicamente imagen-texto.

## Casos de uso

- Inspección visual en planta industrial: el modelo puede recibir imágenes de cámaras industriales conectadas a una placa con RK1828 y generar informes en lenguaje natural sobre defectos, etiquetas o presencia de objetos, ejecutándose íntegramente en el dispositivo y sin enviar imágenes a la nube.
- Asistente local en kioscos y terminales de autoservicio: al ser multimodal y multilingüe, permite atender consultas por voz o texto con soporte de imagen (por ejemplo, el usuario fotografía un producto o un documento) sin depender de conectividad externa.
- Digitalización y extracción de información de documentos: dado el contexto de 262.144 tokens, es viable procesar lotes de páginas escaneadas o formularios y extraer campos estructurados en una sola pasada, útil en gestorías, sanidad o administración pública con requisitos de soberanía de datos.
- Robótica educativa y prototipado: sobre una placa Rockchip, permite construir demostraciones de percepción visual más lenguaje (seguimiento de instrucciones del tipo "describe lo que ves" o "encuentra el objeto rojo") con un coste de hardware reducido.
- Asistencia a personas con discapacidad visual: descripción de escenas en tiempo real desde una cámara integrada en un dispositivo portátil, con latencia baja y funcionamiento offline, un requisito crítico cuando no hay red disponible.
- Análisis de imágenes en el vehículo o en campo: revisión de matrículas, señalización o estado de infraestructuras desde dispositivos móviles alimentados por batería, donde el consumo energético de una NPU dedicada es mucho menor que el de una GPU.
- Prototipado e investigación en eficiencia: como VLM de 0,8B con contexto largo, sirve para estudiar estrategias de cuantización, decodificación y particionado de modelos sobre aceleradores NPU, así como para fine-tuning específico de tarea partiendo del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha de HuggingFace del artefacto convertido no incluye métricas (MMLU, HumanEval, GSM8K, MMMU, DocVQA ni ninguna otra), y la model card del modelo original tampoco reproduce cifras en el texto disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre Qwen3.5-0.8B. No se deben extrapolar cifras de otras versiones de la familia Qwen.

## Requisitos de hardware

- Plataforma objetivo: NPU Rockchip RK1828. El artefacto distribuido está empaquetado en formato RKNN3 y no es ejecutable directamente en CUDA, ROCm ni Metal.
- Almacenamiento: el repositorio ocupa 1,2 GB, por lo que cabe en el almacenamiento eMMC o en una tarjeta microSD de una placa embebida típica.
- Memoria: no disponible. No se especifica el consumo de memoria del grafo RKNN3 ni el coste del KV cache con 262.144 tokens de contexto, que en un dispositivo edge sería el factor limitante real.
- GPU recomendadas para este artefacto: no aplicable, no existe soporte para GPU de escritorio o centro de datos.
- Para el modelo original Qwen3.5-0.8B (referencia orientativa, estimaciones aritméticas sin contar encoder visual ni KV cache): bf16 ≈ 1,6 GB de pesos, int8 ≈ 0,8 GB, int4 ≈ 0,4 GB. Con estas cifras cabría en cualquier GPU de consumo con 4-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090), siempre que existan pesos en formato estándar.
- Opciones de despliegue: LlamaPi sobre RK1828 con runtime RKNN3 (documentado por el autor). vLLM, TGI, llama.cpp y Ollama no soportan RKNN3; para esos backends habría que partir del modelo original. Hay una etiqueta `gguf` en el repositorio, pero no se confirma que se distribuyan pesos GGUF utilizables con llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos alternativos no proceden de la información proporcionada en esta búsqueda y deben verificarse en sus fichas oficiales antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Licencia | Formato y despliegue | Notas |
|---|---|---|---|---|---|
| t-firefly/qwen3.5-0.8b-rknn3-rk1828 (este artefacto) | 0,8B | 262.144 tokens (heredado) | Apache-2.0 | RKNN3 para NPU Rockchip RK1828; LlamaPi | Conversión específica de hardware; no ejecutable en GPU genérica; 0 descargas y 0 likes |
| Qwen/Qwen3.5-0.8B (modelo original) | 0,8B | 262.144 tokens | Apache-2.0 | no disponible en la información proporcionada | Referencia canónica para backends estándar; mismas capacidades multimodales |
| SmolVLM-500M-Instruct | ~0,5B (dato de referencia general) | no disponible | Apache-2.0 (dato de referencia general) | no disponible | Alternativa compacta de visión-lenguaje orientada a edge, sin conversión específica a NPU Rockchip |
| Qwen2.5-VL-3B-Instruct | 3B (dato de referencia general) | no disponible | Apache-2.0 (dato de referencia general) | no disponible | Alternativa de mayor tamaño y presumiblemente mayor calidad en tareas visuales, a cambio de más recursos |

## Limitaciones y advertencias

- Riesgo de alucinación: con 0,8B de parámetros, la tasa de errores factuales y de invención de detalles en descripciones de imágenes es previsiblemente alta en comparación con modelos de 7B o más. No hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: los hereda íntegramente del modelo original y de su dataset de entrenamiento, que no está documentado en la información disponible. No se han publicado análisis de sesgo para este artefacto.
- Sin benchmarks: no existe ninguna métrica publicada para esta conversión, por lo que no se puede afirmar que su precisión coincida con la del modelo original tras la conversión a RKNN3.
- Falta de validación comunitaria: 0 descargas y 0 likes. El artefacto no ha sido probado de forma independiente.
- Metadatos inconsistentes: la fecha de creación indicada (2026-09-19) y la ausencia de idiomas declarados en los metadatos de HuggingFace dificultan la trazabilidad de la versión.
- Dependencia de hardware concreto: el formato RKNN3 ata el modelo a la NPU Rockchip RK1828 y a la herramienta LlamaPi. Migrar a otra plataforma exige rehacer la conversión desde el modelo original.
- Opacidad de la conversión: no se especifica la precisión numérica aplicada (int8, int4 u otra), ni si el encoder visual se ha convertido, ni si alguna capa se ha dejado en CPU. Esto afecta directamente a la calidad de salida y al consumo de memoria.
- Contexto declarado frente a contexto real: los 262.144 tokens son una capacidad del modelo original; en un dispositivo edge, el KV cache necesario para explotar esa ventana puede exceder la memoria disponible. No hay datos publicados al respecto.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero los derechos del modelo subyacente siguen siendo del Qwen Team y su distribución se rige por la licencia oficial enlazada en la model card. Conviene verificar los términos actualizados antes de un despliegue en producción.
- Idiomas: los 201 idiomas y dialectos son un dato del modelo original; no hay verificación de que la conversión a RKNN3 preserve el rendimiento multilingüe.
- Idiomas de la documentación: la model card está en inglés y no detalla limitaciones; no hay guías en castellano.

## Enlaces

- Ficha de HuggingFace del artefacto: https://huggingface.co/t-firefly/qwen3.5-0.8b-rknn3-rk1828
- Modelo original Qwen3.5-0.8B en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo original Qwen3.5-0.8B en ModelScope: https://modelscope.cn/models/Qwen/Qwen3.5-0.8B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Firefly AI Team (fabricante): https://www.t-firefly.com/
- Documentación de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction
- Repositorio de pesos (comando de ejecución): `llamapi run qwen3.5:0.8b`
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los únicos resultados obtenidos fueron páginas genéricas no relacionadas (TikTok, YouTube, Wikipedia sobre la letra T), por lo que no se dispone de papers, blogs ni demos adicionales que enlazar.

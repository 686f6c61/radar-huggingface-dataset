# UGREENDEV/RK182X-VLM-Qwen3-VL-2B-Instruct

## Resumen

RK182X-VLM-Qwen3-VL-2B-Instruct es una conversión al formato RKNN del modelo multimodal Qwen/Qwen3-VL-2B-Instruct, publicada por UGREENDEV para su ejecución sobre la NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de una cuantización y empaquetado orientados a despliegue en hardware embebido: el repositorio contiene los artefactos necesarios para ejecutar un VLM de 2 mil millones de parámetros en un SoC con acelerador neuronal, algo que con los pesos originales en fp16 resultaría inviable en esa clase de dispositivo.

El modelo base, Qwen3-VL-2B-Instruct, pertenece a la familia Qwen3-VL de Alibaba Qwen y cubre la tarea image-text-to-text: acepta imágenes junto con instrucciones textuales y genera respuestas conversacionales. La conversión mantiene la licencia Apache 2.0 del original y se distribuye con cuantización w4a16 tanto en la torre de visión como en el LLM, con resolución de entrada de 384x384 y dos configuraciones de contexto (28k con KVCache en fp16 y 65k con KVCache en int4).

Su relevancia es fundamentalmente práctica: permite integrar capacidades de visión-lenguaje en dispositivos de borde (edge) con NPU Rockchip, sin GPU dedicada y con un consumo energético propio de hardware embebido. El repositorio ocupa 2,1 GB e incluye checksums SHA-256 para verificar la integridad de los ficheros antes del despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión + LLM), convertido a RKNN |
| Parametros totales | 2B (heredados de Qwen3-VL-2B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 28672 tokens (config. KVCache fp16) / 66560 tokens (config. KVCache int4) |
| Tipos de cuantizacion | w4a16 en visión y LLM; KVCache fp16 o int4 según configuración |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0), con config.json y SHA256SUMS por configuración |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento nuevo. La arquitectura subyacente es la de Qwen3-VL-2B-Instruct: un transformer multimodal con una torre de visión que procesa imágenes a 384x384 píxeles y un decodificador de lenguaje de 2B parámetros que consume los tokens visuales junto con el texto. La conversión a RKNN aplica cuantización de pesos a 4 bits con activaciones de 16 bits (w4a16) en ambos componentes, y distribuye el cómputo en 8 núcleos NPU para visión y 8 para el LLM.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre las etapas de alineación (RLHF/DPO) del modelo original en la documentación proporcionada; esos detalles corresponden a la model card de Qwen/Qwen3-VL-2B-Instruct, no a este repositorio. La innovación técnica destacable aquí es el propio pipeline de conversión: dos configuraciones que difieren en el tratamiento del KVCache (fp16 para 28k tokens, int4 para 65k tokens), lo que permite intercambiar precisión de caché por longitud de contexto en un dispositivo con memoria limitada.

## Capacidades

- Generación de texto conversacional multi-turno a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Comprensión de imágenes: descripción de contenido visual, respuesta a preguntas sobre la imagen y extracción de información.
- Razonamiento guiado por instrucciones, heredado del modelo Instruct original.
- Soporte de conversaciones estructuradas mediante plantillas de chat (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible) para servir el modelo tras un API.
- Ejecución en NPU Rockchip RK1828 con cuantización w4a16, lo que habilita inferencia local en dispositivos de borde.
- Tool calling, function calling, modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inspección visual en dispositivos de borde: cámaras industriales o domóticas conectadas a un SoC RK1828 pueden enviar fotogramas al modelo para describir escenas o detectar anomalías, sin depender de la nube, gracias a la ejecución local en NPU con cuantización w4a16.
- Asistencia a personas con discapacidad visual: un dispositivo portátil con RK1828 puede capturar imágenes y generar descripciones en lenguaje natural; el contexto de 28k tokens permite mantener una conversación continua sobre lo observado.
- Digitalización de documentos y tickets: el modelo puede leer imágenes de formularios o recibos y extraer campos en texto estructurado, aprovechando la torre de visión a 384x384 y el decodificador de 2B parámetros.
- Control de calidad en líneas de producción: integrado en un gateway con RK1828, el modelo clasifica piezas fotografiadas y genera informes textuales; la baja latencia de la NPU evita cuellos de botella en tiempo real.
- Kioscos y terminales de autoservicio: atención al usuario con entrada de imagen (por ejemplo, lectura de un código o producto) y respuesta conversacional, con contexto de 65k tokens en la configuración int4 para sesiones largas.
- Prototipado de producto con Qwen3-VL: al conservar la licencia Apache 2.0 del modelo base, el equipo puede validar la experiencia de usuario en hardware embebido antes de escalar a una GPU o a la nube.
- Investigación en eficiencia de modelos: sirve como referencia para estudiar el impacto de w4a16 y del KVCache int4 en la calidad de un VLM de 2B sobre aceleradores de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio solo documenta aspectos de despliegue (versión de runtime, configuraciones, resolución, cuantización, núcleos NPU y longitud de contexto), sin métricas de calidad ni de throughput.

## Requisitos de hardware

- Hardware objetivo: NPU Rockchip RK1828 (etiqueta de chip RK182X). No está pensado para GPU de escritorio ni para servidores convencionales.
- Runtime: RKNN Runtime v1.1.0, con controlador y runtime del lado del dispositivo coincidentes; verificar con `rknn-smi -v` antes de ejecutar.
- VRAM estimada: no disponible; el modelo se ejecuta en la memoria del SoC, no en VRAM de GPU.
- GPU recomendadas: no aplica; para ejecutar el modelo original Qwen3-VL-2B-Instruct en GPU se requeriría hardware CUDA, pero esta conversión RKNN no está destinada a ese entorno.
- Cabe en GPU de consumo: no aplica en formato RKNN; el modelo base de 2B sí cabría en GPUs de consumo, pero no es el artefacto distribuido aquí.
- Opciones de despliegue: RKNN Runtime sobre RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`), con verificación SHA-256 previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-VLM-Qwen3-VL-2B-Instruct | 2B | 28k (KV fp16) / 65k (KV int4) | RKNN, NPU RK1828 | Apache 2.0 | Hugging Face y ModelScope |
| Qwen/Qwen3-VL-2B-Instruct | 2B | no disponible en esta ficha | Safetensors (modelo original) | Apache 2.0 | Hugging Face |
| Otros VLM de ~2B para borde | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base: esta conversión sacrifica flexibilidad de plataforma (solo RK1828) a cambio de ejecución local en NPU con cuantización w4a16. No se dispone de datos de rendimiento comparado entre ambos artefactos.

## Limitaciones y advertencias

- Compatibilidad restringida: solo funciona en chips RK1828 con RKNN Runtime v1.1.0 y controladores coincidentes; no es portable a GPU, CPU genérica ni a otros aceleradores sin reconversión.
- Los ficheros de una configuración deben usarse conjuntamente; mezclar directorios de configuraciones distintas puede producir fallos.
- La cuantización w4a16 y el KVCache int4 pueden degradar la calidad de las respuestas frente al modelo original en fp16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a los VLM de 2B, especialmente en lectura de texto pequeño en imágenes (resolución de visión limitada a 384x384).
- Idiomas soportados no documentados en este repositorio; la cobertura lingüística depende del modelo base y no está verificada aquí.
- Sesgos conocidos: no disponible; deben consultarse en la model card de Qwen3-VL-2B-Instruct.
- Licencia: Apache 2.0 para el modelo, pero se aplican adicionalmente los términos de licencia de RKNN Toolkit y RKNN Runtime, que pueden imponer condiciones al despliegue comercial.
- Verificar siempre la integridad con `sha256sum -c SHA256SUMS` antes de desplegar; el repositorio incluye checksums por configuración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VLM-Qwen3-VL-2B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Configuración 28k (KV fp16): https://huggingface.co/UGREENDEV/RK182X-VLM-Qwen3-VL-2B-Instruct/tree/main/Qwen3-VL-2B-Instruct-384x384-w4a16-8-28672
- Configuración 65k (KV int4): https://huggingface.co/UGREENDEV/RK182X-VLM-Qwen3-VL-2B-Instruct/tree/main/Qwen3-VL-2B-Instruct-384x384-w4a16-8-66560-kv-int4
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-VLM-Qwen3-VL-2B-Instruct`
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.

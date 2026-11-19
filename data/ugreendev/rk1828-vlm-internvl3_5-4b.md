# UGREENDEV/RK1828-VLM-InternVL3_5-4B

## Resumen

RK1828-VLM-InternVL3_5-4B es una conversión al formato RKNN del modelo vision-lenguaje InternVL3_5-4B de OpenGVLab, publicada por UGREENDEV y orientada específicamente al chip NPU RK1828. No se trata de un modelo nuevo entrenado desde cero, sino de un derivado cuantizado y empaquetado para ejecución en hardware de borde (edge) con aceleración NPU, manteniendo la licencia Apache 2.0 del modelo original.

El paquete incluye una única configuración publicada: resolución de visión 448x448, cuantización w4a16 tanto para el codificador visual como para el LLM, 8 núcleos NPU para cada componente y una longitud de contexto de 10.752 tokens con KVCache en fp16. El repositorio ocupa 3,5 GB y requiere el runtime RKNN v1.1.0 junto con el driver correspondiente.

Su relevancia radica en que permite desplegar un VLM de 4B parámetros en dispositivos con NPU RK1828 fuera de entornos de servidor, algo poco habitual con modelos de esta familia. La información pública sobre el proceso de conversión, los datos de entrenamiento y los benchmarks es muy limitada: la model card se centra en instrucciones de descarga, verificación de checksums y compatibilidad de hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM (modelo base InternVL3_5-4B; arquitectura interna del base no detallada en la información disponible) |
| Parámetros totales | 4B (según el nombre del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | 10.752 tokens (10.5k) para el LLM |
| Tipos de cuantización | w4a16 en visión y en LLM; KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo fuente); se aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); el repositorio también incluye tag gguf |

## Arquitectura y entrenamiento

El modelo es un derivado cuantizado del InternVL3_5-4B de OpenGVLab, convertido al formato RKNN mediante RKNN Toolkit para su ejecución en el chip RK1828. La configuración publicada emplea resolución de entrada visual de 448x448, cuantización w4a16 en el codificador visual y en el LLM, y reparte la carga entre 8 núcleos NPU para visión y 8 para el LLM. La KVCache se mantiene en fp16.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación) en la documentación proporcionada. Tampoco se detalla el pipeline exacto de conversión a RKNN ni posibles técnicas de calibración empleadas durante la cuantización. El repositorio incluye checksums SHA-256 de los ficheros para verificar la integridad de la descarga antes del despliegue.

## Capacidades

- Generación de texto e inferencia imagen-texto (pipeline `image-text-to-text`).
- Procesamiento de imágenes a resolución 448x448 mediante el codificador visual integrado.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de razonamiento, código, matemáticas o tool calling del modelo base: no detalladas en la información disponible.
- Soporte multilingüe: no disponible.

## Casos de uso

- Visión por computador en dispositivos de borde: el modelo puede ejecutarse en hardware con NPU RK1828 para tareas de descripción de imágenes o respuesta a preguntas visuales sin depender de la nube, gracias a la conversión RKNN y a la cuantización w4a16 que reduce el peso del modelo.
- Asistentes embebidos con entrada de cámara: integrable en dispositivos con RK1828 para interpretar imágenes capturadas en tiempo real y generar respuestas en lenguaje natural, con contexto de hasta 10.752 tokens para mantener historial de conversación.
- Inspección visual automatizada en línea de producción: el modelo puede analizar imágenes de 448x448 y emitir descripciones o clasificaciones textuales en el propio dispositivo, evitando el envío de datos a servidores externos.
- Kioscos o terminales interactivos: despliegue local de un asistente multimodal conversacional en hardware de bajo consumo con NPU, útil en entornos con conectividad limitada.
- Prototipado de aplicaciones VLM en edge: sirve como base para validar pipelines de inferencia RKNN antes de escalar a modelos mayores o a otras configuraciones.
- Investigación en eficiencia de despliegue: permite estudiar el comportamiento de un VLM de 4B cuantizado a w4a16 en NPU, incluyendo latencia y precisión frente al modelo original en fp16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU: chip RK1828 exclusivamente (único chip soportado según la model card).
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Núcleos NPU: 8 para visión y 8 para el LLM en la configuración publicada.
- VRAM/RAM estimada: no disponible (el tamaño del repositorio es de 3,5 GB, pero no se detalla el consumo en ejecución).
- GPU consumer (RTX 4090, etc.): no aplicable; el formato RKNN está orientado a NPU RK1828, no a GPU.
- Opciones de despliegue: runtime RKNN v1.1.0 sobre RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK1828-VLM-InternVL3_5-4B (este) | 4B | 10.752 tokens | RKNN (w4a16) | Apache 2.0 | NPU RK1828 |
| OpenGVLab/InternVL3_5-4B (base) | 4B | no disponible en la información proporcionada | safetensors (presumible, no confirmado) | Apache 2.0 | GPU |
| Otras alternativas de 4B en edge | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con otros VLM de 4B orientados a edge no puede completarse con la información disponible. La diferencia principal frente al modelo base es el formato de pesos (RKNN frente a safetensors) y la cuantización w4a16, que condicionan el hardware de destino.

## Limitaciones y advertencias

- Compatibilidad restringida al chip RK1828; no es ejecutable en GPU ni en otros aceleradores sin reconversión.
- Requiere RKNN Runtime v1.1.0 y driver coincidente; versiones distintas pueden provocar fallos.
- La cuantización w4a16 puede degradar la precisión respecto al modelo base en fp16; no se han publicado métricas de dicha degradación.
- Deben usarse conjuntamente todos los ficheros de la configuración seleccionada; mezclar ficheros de distintas configuraciones puede romper la inferencia.
- Verificar los checksums SHA-256 antes del despliegue; la model card indica desplegar solo si todas las entradas muestran `OK`.
- Idiomas soportados no documentados; el rendimiento multilingüe es incierto.
- Sesgos y riesgo de alucinación del modelo base no documentados en la información disponible.
- Licencia Apache 2.0 para el modelo fuente, pero se aplican adicionalmente los términos de licencia de RKNN Toolkit y RKNN Runtime, que pueden imponer restricciones adicionales al uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK1828-VLM-InternVL3_5-4B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-4B
- Documentación de la configuración (README en inglés): `InternVL3_5-4B-448x448-w4a16-8-10752/README.md` dentro del repositorio
- Documentación de la configuración (README en chino): `InternVL3_5-4B-448x448-w4a16-8-10752/README_CN.md` dentro del repositorio
- ModelScope (mismo modelo): disponible mediante `modelscope download --model UGREENDEV/RK1828-VLM-InternVL3_5-4B`

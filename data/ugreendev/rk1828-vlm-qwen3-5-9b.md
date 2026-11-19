# UGREENDEV/RK1828-VLM-Qwen3.5-9B

## Resumen

RK1828-VLM-Qwen3.5-9B es una distribución cuantizada y empaquetada para el acelerador NPU Rockchip RK1828 del modelo vision-lenguaje Qwen3.5-9B, desarrollado originalmente por el equipo Qwen. El repositorio, publicado por UGREENDEV, no contiene los pesos originales en formato safetensors sino artefactos RKNN listos para desplegarse en hardware Rockchip, junto con las configuraciones de cuantización y los checksums de verificación.

El modelo resuelve el problema de llevar un VLM de 9.000 millones de parámetros a un SoC con NPU dedicada, algo relevante para despliegues en borde (edge computing), dispositivos integrados y escenarios sin GPU dedicada. La configuración publicada usa visión en fp16 a resolución 384x384, el LLM en w4a16 segmentado en dos bloques y caché KV en int4, con una longitud de contexto declarada de 57.344 tokens por segmento.

El repositorio tiene 8 GB, licencia Apache 2.0 heredada del modelo base, runtime RKNN v1.1.0 y soporte exclusivo para el chip RK1828. Es una pieza de infraestructura de despliegue más que un modelo entrenado de novo: la innovación está en la cuantización y el particionado para NPU, no en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5-9B (detalles de arquitectura interna no disponibles) |
| Parametros totales | 9B (según denominación del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 57.344 tokens por segmento (llm_seg0 y llm_seg1) |
| Tipos de cuantizacion | Visión: fp16; LLM: w4a16 (dos segmentos); KVCache: int4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (artefactos para runtime RKNN v1.1.0); no se distribuyen safetensors ni GGUF del modelo base |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento del modelo base; se limita a referenciar Qwen/Qwen3.5-9B como origen. La información disponible describe únicamente la topología de despliegue: el componente de visión se ejecuta en fp16 a 384x384 píxeles, el LLM se divide en dos segmentos (llm_seg0 y llm_seg1) cuantizados en w4a16, y la caché KV se almacena en int4. Cada segmento del LLM ocupa 8 núcleos NPU, y la configuración se etiqueta como "normal-kv-int4-2cards", lo que sugiere un reparto entre dos tarjetas o dos instancias de NPU RK1828.

No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones de decodificación del modelo original. Cualquier afirmación al respecto requeriría consultar la model card de Qwen/Qwen3.5-9B, que no forma parte de la información proporcionada.

## Capacidades

- Comprensión de imágenes y generación de texto (pipeline image-text-to-text, tarea declarada multimodal-dialogue).
- Diálogo conversacional multimodal multi-turno.
- Procesamiento de imágenes a resolución 384x384 en el codificador visual.
- Ventana de contexto efectiva de 57.344 tokens por segmento del LLM, adecuada para conversaciones largas o documentos extensos acompañados de imagen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el repositorio incluye documentación en inglés y chino, pero no declara idiomas del modelo).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inspección visual en dispositivos de borde: el modelo puede ejecutarse íntegramente en una NPU RK1828 para tareas de descripción de imágenes o respuesta a preguntas visuales en cámaras inteligentes, kioscos o electrodomésticos, sin depender de la nube.
- Asistencia multimodal en robótica y automatización industrial: con contexto de 56k tokens por segmento, permite mantener el histórico de una sesión de operación junto con capturas periódicas de la escena y consultar instrucciones extensas.
- Digitalización documental en hardware empotrado: lectura de formularios, tickets o etiquetas a 384x384 con cuantización w4a16, apta para escáneres y terminales de punto de venta con NPU Rockchip.
- Control de calidad visual en línea de producción: el despliegue en NPU dedicada permite inferencia local de baja latencia para clasificar defectos y generar informes en lenguaje natural.
- Asistentes de accesibilidad: descripción de escenas para personas con discapacidad visual en dispositivos portátiles, aprovechando que el modelo cabe en un SoC con NPU y no requiere conectividad.
- Prototipado de producto con Qwen3.5-9B: el repositorio sirve como referencia de cuantización y particionado para equipos que quieran portar el modelo base a RK1828 antes de entrenar adaptaciones propias.
- Verificación de integridad en pipelines de despliegue: los checksums SHA-256 y el manifiesto config.json permiten automatizar la validación de artefactos antes de flashear dispositivos en fábrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chip objetivo: exclusivamente Rockchip RK1828. No se declara compatibilidad con otras NPU ni con GPU.
- Runtime: RKNN Runtime v1.1.0, con driver correspondiente. Verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Reparto de cómputo: 8 núcleos NPU para visión, 8 para llm_seg0 y 8 para llm_seg1; la configuración "2cards" sugiere el uso de dos tarjetas o instancias RK1828.
- Memoria: no se especifica VRAM/RAM requerida; el tamaño del repositorio es de 8 GB y debe considerarse como cota inferior del espacio de almacenamiento necesario.
- GPU de consumo (RTX 4090, etc.): no aplica; los artefactos son RKNN, no GGUF ni safetensors, por lo que no se pueden ejecutar en llama.cpp, Ollama, vLLM ni TGI.
- Despliegue: mediante el runtime RKNN en el dispositivo RK1828, descargando los ficheros del directorio de configuración y validando SHA256SUMS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK1828-VLM-Qwen3.5-9B (este) | 9B | 57.344 tokens/segmento | RKNN | Apache 2.0 | NPU Rockchip RK1828 |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | safetensors (presumible) | Apache 2.0 | GPU |
| Otras distribuciones RKNN de VLMs | no disponible | no disponible | RKNN | variable | RK1828 u otras NPU Rockchip |

No se dispone de información sobre alternativas comparables en el mismo formato RKNN ni de resultados de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Dependencia total del hardware: solo funciona en RK1828 con RKNN Runtime v1.1.0 y el driver correspondiente; no es portable a GPU ni a CPU.
- Resolución de visión limitada a 384x384, lo que puede degradar la lectura de texto pequeño o detalles finos en imágenes.
- Cuantización agresiva (w4a16 en el LLM y int4 en KVCache) que puede introducir pérdida de precisión frente al modelo base en tareas de razonamiento complejo.
- Los segmentos del LLM deben usarse conjuntamente con los ficheros del mismo directorio de configuración; mezclar versiones puede romper la inferencia.
- Sesgos y riesgo de alucinación: no documentados en la información disponible, pero heredados del modelo base Qwen3.5-9B.
- Idiomas soportados no declarados; conviene validar el rendimiento en castellano antes de producción.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y verificar las condiciones del modelo base.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creación muy reciente, lo que implica ausencia de validación comunitaria.
- No se incluyen safetensors ni GGUF: no es posible hacer fine-tuning directo sobre estos artefactos sin volver al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK1828-VLM-Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B

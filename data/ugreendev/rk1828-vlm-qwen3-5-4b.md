# UGREENDEV/RK1828-VLM-Qwen3.5-4B

## Resumen

RK1828-VLM-Qwen3.5-4B es una conversión al formato RKNN del modelo multimodal Qwen/Qwen3.5-4B, publicada por UGREENDEV para su ejecución sobre el acelerador NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de una cuantización y compilación del VLM original de Qwen (4 mil millones de parámetros, pipeline image-text-to-text) destinada a inferencia en hardware embebido. El repositorio incluye dos configuraciones precompiladas con cuantización w4a16 tanto en la torre de visión como en el LLM.

La relevancia de esta ficha reside en que demuestra el patrón de despliegue de VLMs de tamaño medio en NPUs de bajo consumo: pesos de 4 bits, activaciones de 16 bits y gestión explícita del KVCache (fp16 o int4) para intercambiar memoria por longitud de contexto. La configuración base ofrece 28.672 tokens de contexto con KVCache fp16, mientras que la variante int4 amplía la ventana hasta 68.096 tokens a costa de precisión en la caché.

El modelo hereda las capacidades del Qwen3.5-4B original (comprensión de imagen y texto, generación conversacional), pero queda restringido al chip RK1828 y al runtime RKNN v1.1.0. La licencia declarada es Apache 2.0, sujeta además a los términos del RKNN Toolkit y del RKNN Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM basado en Qwen3.5-4B (transformer multimodal), compilado a RKNN para NPU Rockchip RK1828 |
| Parametros totales | 4B (modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 28.672 tokens (config. KVCache fp16) / 68.096 tokens (config. KVCache int4) |
| Tipos de cuantizacion | Vision: w4a16; LLM: w4a16; KVCache: fp16 o int4 según configuración |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (sujeta además a las licencias de RKNN Toolkit y RKNN Runtime) |
| Formato de pesos | RKNN (runtime v1.1.0); el repo también incluye tags gguf |
| Resolucion de vision | 384x384 |
| Nucleos NPU | Vision: 8; LLM: 8 |
| Tamano del repositorio | 6,9 GB |
| Chips soportados | RK1828 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-4B, un VLM de tipo image-text-to-text con arquitectura transformer que combina un codificador visual con un decodificador de lenguaje. Esta publicación no entrena el modelo: aplica cuantización w4a16 (pesos de 4 bits, activaciones de 16 bits) a ambas torres y lo compila con RKNN Toolkit para el NPU RK1828, con 8 núcleos asignados a visión y 8 al LLM. La resolución de entrada visual queda fijada en 384x384.

La innovación técnica principal es la doble configuración de KVCache: una variante en fp16 con 28.672 tokens de contexto y otra en int4 que duplica la ventana hasta 68.096 tokens reduciendo el footprint de la caché. El repositorio incluye checksums SHA-256 por configuración y exige usar conjuntamente los ficheros de un mismo directorio. No se detallan en la información disponible los datos de entrenamiento, el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Comprensión de imagen y texto (pipeline image-text-to-text) con entrada visual a 384x384.
- Generación de texto conversacional multi-turno, heredada de Qwen3.5-4B.
- Razonamiento y respuesta a preguntas sobre contenido visual.
- Ventana de contexto larga: hasta 28.672 tokens con KVCache fp16 y 68.096 con KVCache int4.
- Ejecución en NPU RK1828 mediante runtime RKNN v1.1.0.
- Soporte de tool calling, function calling, agentes o thinking mode: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades de audio: no disponibles.

## Casos de uso

- Inspección visual en dispositivos embebidos: el modelo puede procesar imágenes de 384x384 y responder preguntas sobre ellas directamente en el NPU RK1828, sin GPU dedicada, lo que encaja en cámaras inteligentes o equipos de borde.
- Asistencia conversacional local con contexto largo: con 28.672 tokens de ventana (o 68.096 en la variante int4), permite mantener diálogos extensos o adjuntar documentos largos junto a imágenes en un dispositivo de bajo consumo.
- Digitalización y descripción de documentos: extracción de información de capturas o formularios mediante preguntas en lenguaje natural, aprovechando la torre de visión cuantizada a w4a16.
- Control de calidad visual en línea de producción: clasificación y descripción de defectos en imágenes capturadas por sensores industriales, ejecutando la inferencia en el propio equipo RK1828.
- Prototipado de producto con Qwen3.5: validar el comportamiento del VLM de 4B en hardware Rockchip antes de comprometer un diseño final, usando las dos configuraciones para comparar memoria frente a contexto.
- Despliegue aislado sin conectividad: al ejecutarse localmente en NPU, es apto para entornos con requisitos de privacidad donde no se permite enviar imágenes a la nube.
- Evaluación de cuantización w4a16: servir como referencia para medir la degradación de calidad del VLM original frente a la versión cuantizada en tareas de descripción y VQA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chip obligatorio: Rockchip RK1828 (único chip soportado).
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- NPU: 8 núcleos para visión y 8 para el LLM.
- Memoria: no se especifica VRAM/RAM requerida; el repositorio ocupa 6,9 GB y la configuración con KVCache int4 reduce el consumo de caché frente a la variante fp16.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el modelo está compilado para NPU RK1828, no para CUDA.
- Despliegue: RKNN Runtime sobre RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles.
- Verificación de integridad: ejecutar `sha256sum -c SHA256SUMS` en el directorio de configuración y desplegar solo si todas las entradas muestran `OK`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK1828-VLM-Qwen3.5-4B | 4B | 28.672 / 68.096 tokens | RKNN, NPU RK1828 | apache-2.0 | Hugging Face y ModelScope |
| Qwen/Qwen3.5-4B (modelo base) | 4B | no disponible | safetensors, GPU | no disponible en esta ficha | Hugging Face |
| Otros VLM de ~4B para borde | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (VLM de ~4B compilados para NPU) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: solo funciona en el chip RK1828 con el runtime RKNN v1.1.0 y su driver; no es ejecutable en GPU convencionales ni en otros aceleradores sin reconversión.
- Resolución visual fija de 384x384, lo que limita la lectura de textos pequeños o detalles finos en imágenes.
- La cuantización w4a16 en visión y LLM puede degradar la precisión respecto al Qwen3.5-4B original; no se publican métricas de esa pérdida.
- La variante con KVCache int4 amplía el contexto a 68.096 tokens pero puede reducir la fidelidad de la atención en secuencias largas.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingüe concreto.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 para el modelo, pero el uso queda sujeto adicionalmente a los términos del RKNN Toolkit y del RKNN Runtime, que deben revisarse para uso comercial.
- Deben usarse conjuntamente todos los ficheros de un mismo directorio de configuración; mezclar configuraciones puede provocar fallos de ejecución.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UGREENDEV/RK1828-VLM-Qwen3.5-4B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Configuración 28k (KVCache fp16): https://huggingface.co/UGREENDEV/RK1828-VLM-Qwen3.5-4B/tree/main/Qwen3.5-4B-384x384-w4a16-8-28672
- Configuración 66.5k (KVCache int4): https://huggingface.co/UGREENDEV/RK1828-VLM-Qwen3.5-4B/tree/main/Qwen3.5-4B-384x384-w4a16-8-68096-kv-int4
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK1828-VLM-Qwen3.5-4B --revision master`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK1828-VLM-Qwen3.5-4B --revision v1.1.0`
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.

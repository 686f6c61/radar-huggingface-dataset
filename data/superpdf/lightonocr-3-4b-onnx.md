# superpdf/LightOnOCR-3-4B-ONNX

## Resumen

LightOnOCR-3-4B-ONNX es la conversión a formato ONNX del modelo LightOnOCR-3-4B desarrollado por LightOn, publicada por superpdf para su uso en herramientas de lectura documental. Se trata de un modelo de OCR end-to-end de tipo image-text-to-text basado en la arquitectura vision-language Qwen3.5, con aproximadamente 4,5 mil millones de parámetros (el nombre del modelo indica 4B). El modelo combina un codificador visual con un decodificador de lenguaje y está orientado a transcripción de documentos con comprensión de layout y elementos visuales como tablas y gráficos.

La relevancia de esta versión concreta radica en su empaquetado: el autor ha cuantizado el decodificador y los embeddings de tokens a 4 bits (esquema MatMulNBits/GatherBlockQuantized de ONNX Runtime, block size 32, asimétrico con zero points), mientras que el codificador visual se mantiene en float16. El resultado es un repositorio de 3,8 GB que se ejecuta íntegramente con Transformers.js sobre ONNX Runtime con backend WebGPU, tanto en navegador como en Node.js. Esto permite desplegar OCR de alta precisión en el cliente sin necesidad de servidores con GPU dedicada.

El modelo base, LightOnOCR-3-4B, es el mayor de la familia LightOnOCR-3 de LightOn, presentada como una generación de modelos OCR ligeros end-to-end con comprensión de layout y visión. La licencia Apache 2.0 se mantiene idéntica a la del modelo original, lo que facilita su integración en productos comerciales. superPDF lo utiliza para lectura documental en su herramienta de línea de comandos y su servidor MCP, invocándolo mediante los alias `--model 4b` o `model: "4b"`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language basada en Qwen3.5 (codificador visual + decodificador de lenguaje con gated delta net) |
| Parámetros totales | Aproximadamente 4,5 mil millones (según descripción de Featherless; el nombre del modelo indica 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Decodificador y embeddings de tokens en 4 bits (MatMulNBits / GatherBlockQuantized, block size 32, asimétrico con zero points); codificador visual en float16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo + datos externos `.onnx_data`), tokenizer.json, safetensors bfloat16 como base original |

## Arquitectura y entrenamiento

El modelo base LightOnOCR-3-4B emplea la arquitectura Qwen3.5, que combina un codificador visual con un decodificador transformer. La model card de la conversión menciona la presencia de un componente gated delta net dentro de la arquitectura, junto con capas de multi-token-prediction (no utilizadas en esta conversión). El grafo ONNX se construye a partir del repositorio `onnx-community/Qwen3.5-4B-ONNX-OPT` (revisión `2e351a8a534116289140e31f351c5e9790cae2db`), cuyas configuraciones coinciden con LightOnOCR-3 salvo por la capa de multi-token-prediction. Todos los pesos del grafo se recalculan a partir de los pesos de LightOn y se escriben en la misma posición, por lo que la topología del grafo permanece inalterada.

Los pesos originales provienen de `lightonai/LightOnOCR-3-4B` en la revisión `b71010f095dc3735de7ee6b9969bff8f8f50b39a`, en safetensors y bfloat16. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El proceso de conversión está documentado en `scripts/models/convert-lightonocr.py` dentro del repositorio de superPDF (pendiente de publicación con la release open source). El `config.json` corresponde al de LightOn con el bloque `transformers.js_config` del repositorio de onnx-community, mientras que los ficheros de tokenizer y procesador son los de onnx-community (mismo vocabulario Qwen3.5). Durante la conversión, los pesos de normalización se almacenan como 1 + w y el parámetro A de la gated delta net como -exp(A_log), tal y como espera el constructor.

## Capacidades

- Generación de texto a partir de imágenes de documentos: transcripción de texto con detección de cajas (prompt `grounding` de LightOn).
- Comprensión de layout y estructura visual del documento.
- Comprensión de imágenes y gráficos integrados en documentos.
- Ejecución en navegador y en Node.js mediante Transformers.js y ONNX Runtime con WebGPU.
- Decodificación greedy soportada de forma explícita en el ejemplo de uso (`do_sample: false`, `max_new_tokens: 6144`).
- Soporte de plantilla de chat conversacional (tag `conversational`), con opción de desactivar el modo thinking (`enable_thinking: false`).
- Procesamiento de páginas renderizadas con el lado más largo entre 1540 y 2048 píxeles, según la configuración recomendada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo extrae texto y posiciones (grounding) de documentos escaneados, permitiendo reconstruir campos estructurados con sus coordenadas para su volcado a sistemas de contabilidad.
- Procesamiento de contratos y documentación legal: la comprensión de layout permite identificar cláusulas, encabezados y tablas dentro de documentos extensos, facilitando su indexación y búsqueda posterior.
- Extracción de datos de informes financieros: la capacidad de entender gráficos y tablas permite capturar métricas y series numéricas representadas visualmente, no solo texto plano.
- OCR en aplicaciones web sin backend: al ejecutarse vía Transformers.js con WebGPU, puede integrarse directamente en un navegador para digitalizar documentos sin enviar imágenes a un servidor, útil en entornos con requisitos de privacidad.
- Herramientas de línea de comandos para desarrolladores: superPDF lo usa en su CLI y en su servidor MCP, de modo que pipelines locales pueden procesar documentos de forma automatizada y offline.
- Asistentes de accesibilidad: conversión de imágenes de documentos a texto legible por lectores de pantalla en aplicaciones de escritorio o navegador.
- Automatización de flujos RPA: transcripción de capturas y documentos en procesos de RPA donde no se dispone de una API OCR en la nube, aprovechando el empaquetado ONNX para entornos locales.
- Archivado documental a gran escala: procesamiento por lotes con decodificación greedy y hasta 6144 tokens nuevos por página, adecuado para pipelines que priorizan determinismo sobre creatividad.

## Benchmarks y rendimiento

La información disponible menciona, a través del blog de explainx.ai, una puntuación de ParseBench de 75,1 para la variante de 4B de LightOnOCR-3. No se dispone de resultados adicionales (MMLU, HumanEval, GSM8K u otros) en la documentación consultada, ni de comparativas numéricas con modelos alternativos.

| Benchmark | LightOnOCR-3-4B |
|---|---|
| ParseBench | 75,1 (según explainx.ai, atribuido al modelo de 4B) |
| Otros benchmarks | No disponibles |

## Requisitos de hardware

- Tamaño de pesos: el repositorio ocupa 3,8 GB. Desglose por fichero: decodificador en q4 con dos ficheros `.onnx_data` de 2.097.044.992 y 600.476.160 bytes; embeddings de tokens en q4 de 407.244.800 bytes; codificador visual en fp16 de 671.943.680 bytes.
- VRAM estimada para inferencia: aproximadamente 4-5 GB solo para los pesos; se recomienda contar con 6-8 GB para acomodar la caché KV, el procesamiento de imágenes a 1540-2048 píxeles de lado mayor y hasta 6144 tokens nuevos por página (estimación derivada de los tamaños de fichero, no facilitada por el autor).
- GPU recomendadas: cualquier GPU con soporte de WebGPU y al menos 6-8 GB de VRAM. En el ámbito consumer, se puede ejecutar en RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070 y posteriores; también en GPUs Apple Silicon con soporte WebGPU en navegador.
- ¿Cabe en GPU consumer? Sí, gracias a la cuantización del decodificador a 4 bits y del codificador visual a fp16.
- Opciones de despliegue: Transformers.js sobre ONNX Runtime con backend WebGPU, tanto en navegador como en Node.js. El formato ONNX permite asimismo su uso con otros runtimes compatibles, aunque la model card solo documenta la ruta Transformers.js.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Notas |
|---|---|---|---|---|
| superpdf/LightOnOCR-3-4B-ONNX | ~4,5 B | ONNX (q4 + fp16) | Apache-2.0 | Conversión para navegador/Node con Transformers.js y WebGPU; 3,8 GB |
| lightonai/LightOnOCR-3-4B | ~4,5 B | Safetensors bfloat16 | Apache-2.0 | Modelo base original; requiere GPU dedicada o servidor |
| Otros modelos OCR de la misma categoría | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos: al tratarse de un decodificador transformer que produce texto libre, puede generar contenido plausible pero incorrecto en zonas de baja legibilidad o en gráficos mal renderizados.
- Longitud de contexto no especificada: aunque el ejemplo usa `max_new_tokens: 6144`, no se detalla la ventana de contexto total, lo que limita la planificación de documentos de muchas páginas en una sola pasada.
- Idiomas soportados no documentados: no se puede confirmar el comportamiento en idiomas distintos del inglés sin pruebas adicionales.
- Requisitos de resolución: la model card recomienda renderizar las páginas con lado mayor entre 1540 y 2048 píxeles; resoluciones muy inferiores pueden degradar la precisión y resoluciones superiores incrementan el coste de cómputo.
- Modo de decodificación: el ejemplo usa decodificación greedy (`do_sample: false`), lo que prioriza determinismo sobre diversidad; otros modos no están documentados en la conversión.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio, así como la licencia del modelo base, antes de integrarlo en producción.
- Repositorio con pocas descargas (7) y ningún like en el momento de la consulta: no hay evidencia de validación por parte de la comunidad sobre esta conversión concreta.
- El propio `config.json` se hereda de la configuración del modelo base con el bloque `transformers.js_config` de onnx-community; cualquier cambio en el modelo base requeriría reconvertir los grafos.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/superpdf/LightOnOCR-3-4B-ONNX
- Perfil del autor superpdf: https://huggingface.co/superpdf
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Página de investigación de LightOnOCR-3: https://www.lighton.ai/research/lightonocr-3
- Despliegue en Featherless: https://featherless.ai/models/lightonai/LightOnOCR-3-4B
- Artículo de explainx.ai con ParseBench 75,1: https://www.explainx.ai/blog/lightonocr-3-parsebench-open-weight-ocr-2026
- Repositorio de grafos ONNX base: https://huggingface.co/onnx-community/Qwen3.5-4B-ONNX-OPT
- Sitio de superPDF: https://superpdf.ai

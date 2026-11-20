# UGREENDEV/RK182X-VLM-SmolVLM-500M-Instruct

## Resumen

RK182X-VLM-SmolVLM-500M-Instruct es una conversión al formato RKNN del modelo vision-lenguaje SmolVLM-500M-Instruct de HuggingFaceTB, publicada por UGREENDEV. El objetivo no es ofrecer un modelo nuevo, sino un artefacto desplegable sobre la NPU de los SoC Rockchip RK1820 y RK1828, con pesos cuantizados w4a16 tanto en la torre de visión como en el LLM. El repositorio incluye una única configuración: resolución de imagen 512x512, 8 núcleos NPU para visión y 8 para el LLM, y una longitud de contexto de 8192 tokens con KVCache en fp16.

El modelo hereda las capacidades del SmolVLM-500M original: comprensión de imagen y texto, generación de respuestas conversacionales y soporte de instrucciones en formato chat. Con 500 millones de parámetros, está pensado para inferencia en el borde (edge), no para servidores de alto rendimiento. Su relevancia actual radica en que permite ejecutar un VLM conversacional en hardware Rockchip con aceleración NPU, algo poco habitual en este rango de tamaño.

La licencia del modelo base es Apache 2.0, y la conversión conserva los avisos de atribución originales. El repositorio ocupa 0,4 GB y requiere RKNN Runtime v1.1.0 o superior, además del driver correspondiente en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (torre de visión + LLM transformer) convertido a RKNN; arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | 500M (heredados del modelo base SmolVLM-500M-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (LLM) |
| Tipos de cuantizacion | w4a16 en visión y en LLM; KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); se aplican tambien los terminos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0), con config.json y SHA256SUMS por configuracion |
| Resolucion de vision | 512x512 |
| Nucleos NPU | 8 (vision) + 8 (LLM) |
| Chips soportados | RK1820, RK1828 |

## Arquitectura y entrenamiento

El artefacto publicado es una conversión y cuantización del SmolVLM-500M-Instruct original, no un entrenamiento nuevo. La model card no detalla la arquitectura interna del base (tipo de transformer, número de capas, composición del dataset de entrenamiento, uso de RLHF/DPO ni número de tokens). Lo que sí se especifica es la configuración de despliegue: cuantización w4a16 en ambas torres, KVCache en fp16 y reparto de 8 núcleos NPU para visión y 8 para el LLM.

La innovación técnica relevante aquí es la propia conversión a RKNN: empaquetado de pesos, manifiesto de ficheros en `config.json`, checksums SHA-256 para verificar integridad y una estructura de directorio por configuración (`SmolVLM-500M-Instruct-512x512-w4a16-8-8192`). No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generación de texto e imagen-texto a texto (pipeline `image-text-to-text`).
- Comprensión de imágenes a resolución 512x512.
- Conversación multi-turno en formato instruct/chat.
- Respuestas condicionadas por instrucciones en lenguaje natural.
- Inferencia acelerada en NPU Rockchip RK1820 y RK1828.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión avanzada o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente visual en dispositivos empotrados: el modelo puede describir o responder preguntas sobre una imagen capturada por la cámara del dispositivo, ejecutándose íntegramente en la NPU del RK1820/RK1828 sin conexión a la nube.
- Inspección visual en industria ligera: clasificación y descripción de imágenes de producto o de línea de montaje a 512x512, aprovechando la cuantización w4a16 para reducir el consumo energético.
- Accesibilidad en hardware de bajo coste: descripción de imágenes para usuarios con discapacidad visual en dispositivos con SoC Rockchip, con contexto de 8192 tokens suficiente para conversaciones largas.
- Kioscos interactivos y señalización digital: atención conversacional con entrada de cámara, donde el modelo responde a preguntas sobre lo que ve el usuario.
- Domótica y robótica de consumo: interpretación de escenas capturadas por la cámara del robot o del hub doméstico, con respuestas en lenguaje natural y latencia local.
- Prototipado y evaluación de VLM en el borde: banco de pruebas para medir rendimiento de un VLM de 500M en NPU Rockchip antes de escalar a modelos mayores o a producción.
- Verificación de pipelines de conversión RKNN: el repositorio incluye checksums SHA-256 y manifiesto, lo que lo hace útil como referencia para validar flujos de cuantización w4a16 en visión y LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828 exclusivamente.
- Runtime: RKNN Runtime v1.1.0 o superior, con driver coincidente; verificar en el dispositivo con `rknn-smi -v`.
- VRAM/uso de memoria: no disponible en la información proporcionada; el repositorio pesa 0,4 GB, lo que da una cota superior aproximada del espacio de pesos.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el artefacto está empaquetado para NPU Rockchip, no para CUDA.
- Despliegue en consumer GPU: no soportado por este artefacto; para ello habría que usar el SmolVLM-500M-Instruct original en safetensors o una conversión GGUF.
- Opciones de despliegue: RKNN Runtime sobre RK1820/RK1828. No se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| RK182X-VLM-SmolVLM-500M-Instruct (este) | 500M | 8192 tokens | RKNN, NPU RK1820/RK1828 | Apache 2.0 | Conversión cuantizada w4a16 del base |
| HuggingFaceTB/SmolVLM-500M-Instruct | 500M | no disponible en esta ficha | safetensors (modelo original) | Apache 2.0 | Modelo base; requiere GPU/CPU estándar |
| SmolVLM-256M-Instruct | 256M | no disponible en esta ficha | safetensors | Apache 2.0 | Variante más pequeña de la misma familia |
| SmolVLM2 (variantes) | no disponible | no disponible | safetensors | Apache 2.0 | Familia sucesora de SmolVLM; datos no verificados en esta ficha |

La comparación directa con alternativas de la misma categoría (VLM para edge) queda limitada porque no se dispone de datos de rendimiento publicados para este artefacto ni de especificaciones detalladas de los competidores en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en RK1820 y RK1828; no es portable a GPU, CPU genérica ni a otras NPU sin reconversión.
- Requiere RKNN Runtime v1.1.0 o superior y driver coincidente; una versión distinta puede impedir la carga del modelo.
- Los ficheros de una configuración deben usarse conjuntamente; mezclar ficheros de distintas configuraciones o revisiones no está soportado.
- La cuantización w4a16 puede degradar la calidad respecto al SmolVLM-500M-Instruct original en tareas de percepción fina o texto en imagen.
- Con 500M de parámetros, la tasa de alucinación en descripciones visuales detalladas y en razonamiento complejo es previsiblemente alta; no se han publicado evaluaciones al respecto.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto en castellano ni en otros idiomas distintos del inglés.
- Sesgos conocidos: no documentados en la información proporcionada; heredables del dataset del modelo base.
- Licencia Apache 2.0 para el modelo base, pero se aplican además los términos de RKNN Toolkit y RKNN Runtime, que pueden imponer condiciones adicionales para uso comercial; revisar `LICENSE` y `Notice` antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- Verificar siempre la integridad con `sha256sum -c SHA256SUMS` antes del despliegue; el autor lo indica como paso obligatorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VLM-SmolVLM-500M-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-500M-Instruct
- Documentación de la configuración (inglés): `SmolVLM-500M-Instruct-512x512-w4a16-8-8192/README.md` dentro del repositorio
- Documentación de la configuración (chino): `SmolVLM-500M-Instruct-512x512-w4a16-8-8192/README_CN.md` dentro del repositorio
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-VLM-SmolVLM-500M-Instruct --revision master`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK182X-VLM-SmolVLM-500M-Instruct --revision v1.1.0`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.

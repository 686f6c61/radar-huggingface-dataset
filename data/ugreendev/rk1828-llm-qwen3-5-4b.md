# UGREENDEV/RK1828-LLM-Qwen3.5-4B

## Resumen

RK1828-LLM-Qwen3.5-4B es una conversión al formato RKNN del modelo Qwen/Qwen3.5-4B, publicada por UGREENDEV para su ejecución sobre el acelerador NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de una compilación optimizada del modelo base de Qwen (aproximadamente 4.000 millones de parámetros) destinada a inferencia en hardware embebido. El repositorio incluye dos configuraciones precompiladas con cuantización de pesos w4a16 y diferentes longitudes de contexto.

La relevancia de esta ficha reside en que el modelo base Qwen3.5-4B no está publicado de forma independiente en la información disponible; el artefacto distribuido es exclusivamente la versión RKNN para el chip RK1828. Esto implica que el modelo solo puede desplegarse en hardware Rockchip compatible con RKNN Runtime v1.1.0, y no mediante los runners habituales de Hugging Face (transformers, vLLM, llama.cpp).

El repositorio ocupa 4,0 GB e incluye dos directorios de configuración: uno con contexto de 32.768 tokens y KVCache en fp16, y otro con contexto de 68.608 tokens y KVCache en int4. Ambos usan 8 núcleos NPU. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles internos no disponibles) |
| Parametros totales | ~4.000 millones (modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens (config. w4a16-8-32768) / 68.608 tokens (config. w4a16-8-68608-kv-int4) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache fp16 o int4 según configuración |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (compilado para NPU Rockchip RK1828); no se distribuyen safetensors ni GGUF |
| Runtime | RKNN Runtime v1.1.0 |
| Chip soportado | Rockchip RK1828 (8 núcleos NPU) |
| Tamaño del repositorio | 4,0 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-4B, un transformer de aproximadamente 4.000 millones de parámetros. No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación, ya que la model card del repositorio RKNN no reproduce esos detalles del modelo base.

La innovación técnica de este artefacto no está en el entrenamiento, sino en la compilación: el modelo se ha convertido a RKNN Runtime v1.1.0 con cuantización w4a16 (pesos a 4 bits, activaciones a 16 bits) y se distribuye en dos variantes que difieren en la gestión del KVCache. La variante de 67k tokens emplea KVCache en int4 para reducir la huella de memoria a costa de una menor precisión en la caché de atención, mientras que la variante de 32k mantiene el KVCache en fp16. Ambas están configuradas para ejecutarse sobre 8 núcleos NPU del RK1828. El repositorio incluye sumas de verificación SHA-256 (fichero `SHA256SUMS`) para validar la integridad de los artefactos antes del despliegue.

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation; tag `conversational`).
- Ejecución de modelos de lenguaje sobre NPU Rockchip RK1828 con RKNN Runtime v1.1.0.
- Soporte de contexto largo: hasta 32.768 tokens con KVCache fp16 y hasta 68.608 tokens con KVCache int4.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere exposición mediante API compatible con servicios de inferencia.
- Capacidades específicas del modelo base Qwen3.5-4B (razonamiento, código, matemáticas, tool calling, multilingüismo): no disponibles en la información proporcionada; deben consultarse en la model card del modelo base.
- No se declara soporte de visión, audio ni modo thinking en este repositorio.

## Casos de uso

- Inferencia en dispositivos embebidos con NPU Rockchip RK1828: despliegue de un LLM de 4B parámetros directamente en hardware Rockchip, sin GPU dedicada, usando los artefactos RKNN precompilados y el runtime v1.1.0.
- Asistentes conversacionales locales: el tag `conversational` y el pipeline de generación de texto permiten integrar el modelo en aplicaciones de chat on-device, manteniendo los datos en el dispositivo.
- Procesamiento de documentos largos en el borde: la configuración de 68.608 tokens con KVCache int4 permite resumir o analizar documentos extensos en dispositivos con memoria limitada.
- Servicios expuestos mediante endpoints: el tag `endpoints_compatible` facilita publicar el modelo como servicio de inferencia compatible con APIs estándar dentro de una infraestructura Rockchip.
- Validación de pipelines de compilación RKNN: el repositorio sirve como referencia para verificar la conversión de modelos Qwen a RKNN, incluyendo comprobación de integridad con `SHA256SUMS` y consulta de versión del runtime con `rknn-smi -v`.
- Prototipado de producto en hardware UGREENDEV/Rockchip: útil para equipos que desarrollan dispositivos con RK1828 y necesitan un LLM base ya cuantizado y empaquetado, evitando el proceso de conversión propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU: Rockchip RK1828 con 8 núcleos NPU (único chip soportado).
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión del lado del dispositivo con `rknn-smi -v` antes de ejecutar.
- VRAM/RAM estimada: no disponible en la información proporcionada; el tamaño del repositorio es de 4,0 GB, pero no se detalla la huella en memoria durante la inferencia.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable; el artefacto está compilado exclusivamente para NPU RK1828 y no se distribuyen pesos en safetensors ni GGUF para ejecución en GPU.
- Despliegue: exclusivamente mediante RKNN Runtime v1.1.0 sobre RK1828; no se indican opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| RK1828-LLM-Qwen3.5-4B (este) | ~4B | 32k / 67k | RKNN | NPU Rockchip RK1828 | Apache 2.0 |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | no disponible | GPU/CPU genéricos | Apache 2.0 |
| Alternativas de 4B para edge | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (LLM de ~4B compilados para NPU embebida) en la documentación proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware: solo funciona en chips Rockchip RK1828; no es ejecutable en GPU convencionales ni en CPU mediante runners estándar.
- Dependencia de runtime: requiere RKNN Runtime v1.1.0 y driver compatible; versiones distintas pueden provocar fallos de ejecución.
- Integridad de artefactos: debe verificarse con `sha256sum -c SHA256SUMS` y desplegar solo si todas las entradas devuelven `OK`.
- Mezcla de ficheros: los ficheros de una configuración deben usarse conjuntamente; mezclar directorios de configuración distintos puede producir errores.
- Cuantización agresiva: los pesos están en w4a16, lo que puede degradar la calidad respecto al modelo base en fp16/bf16; no se han publicado métricas de esa degradación.
- KVCache int4: la configuración de 67k tokens usa KVCache int4, con posible pérdida de precisión en contextos muy largos.
- Idiomas: no se declara qué idiomas soporta el artefacto; debe consultarse el modelo base.
- Licencia: Apache 2.0 para el modelo base, pero se aplican adicionalmente los términos de licencia de RKNN Toolkit y RKNN Runtime, que pueden imponer restricciones adicionales al uso comercial.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación; al derivar de Qwen3.5-4B, hereda los riesgos del modelo base, no evaluados en esta ficha.
- Adopción: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK1828-LLM-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK1828-LLM-Qwen3.5-4B --revision master --local_dir ./RK1828-LLM-Qwen3.5-4B`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK1828-LLM-Qwen3.5-4B --revision v1.1.0 --local-dir ./RK1828-LLM-Qwen3.5-4B`
- Documentación de configuración: `Qwen3.5-4B-w4a16-8-32768/README.md` y `Qwen3.5-4B-w4a16-8-68608-kv-int4/README.md` dentro del repositorio.
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.

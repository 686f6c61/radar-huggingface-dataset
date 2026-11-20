# UGREENDEV/RK182X-LLM-Qwen3.5-0.8B

## Resumen

RK182X-LLM-Qwen3.5-0.8B es una conversión al formato RKNN del modelo Qwen/Qwen3.5-0.8B, publicada por UGREENDEV para su ejecución sobre la NPU Rockchip RK1828 (familia RK182X). No se trata de un modelo nuevo entrenado desde cero, sino de una distribución de pesos cuantizados y compilados para el runtime RKNN Toolkit v1.1.0, orientada a despliegue en dispositivos de borde con acelerador neuronal Rockchip. El repositorio incluye dos configuraciones de despliegue distintas, cada una con su propio directorio, fichero de configuración y sumas de verificación SHA-256.

El modelo base es un transformer de 0,8 mil millones de parámetros de la familia Qwen3.5, con licencia Apache 2.0. La conversión aplica cuantización de pesos w4a16 (pesos en 4 bits, activaciones en 16 bits) y distribuye la inferencia sobre 8 núcleos NPU. La diferencia principal entre las dos configuraciones publicadas está en la ventana de contexto y en el tipo de almacenamiento de la KVCache: una variante alcanza 152.064 tokens (148,5k) con KVCache en int4, mientras que la otra se limita a 76.288 tokens (74,5k) con KVCache en fp16.

La relevancia de esta ficha es fundamentalmente práctica: documenta una vía concreta para llevar un LLM de ~0,8B a hardware Rockchip con NPU, algo poco habitual en el ecosistema Hugging Face, donde predominan pesos safetensors y GGUF para GPU/CPU. Es útil para quien evalúa despliegues en dispositivos empotrados, cajas de inferencia de bajo consumo o productos de borde basados en RK1828.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-0.8B); conversión a RKNN para NPU Rockchip |
| Parametros totales | 0,8 mil millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | 152.064 tokens (148,5k) en la variante kv-int4; 76.288 tokens (74,5k) en la variante fp16 |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache int4 o fp16 según configuración |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0), distribuido en directorios de configuración con config.json y SHA256SUMS |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-0.8B, un transformer denso de aproximadamente 0,8 mil millones de parámetros. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por fases de RLHF o DPO; esos datos corresponden a la model card del modelo original Qwen/Qwen3.5-0.8B, no a este repositorio de conversión.

La innovación técnica de este repositorio no está en el entrenamiento, sino en la ruta de despliegue: conversión de los pesos a formato RKNN, cuantización w4a16, reparto de la inferencia sobre 8 núcleos NPU del RK1828 y gestión de la KVCache en int4 (con contexto de 148,5k tokens) o fp16 (con contexto de 74,5k tokens). El repositorio documenta explícitamente la verificación de integridad mediante SHA-256 antes del despliegue y exige usar conjuntamente los ficheros de un mismo directorio de configuración, junto con el runtime y el driver RKNN correspondientes (comprobables en el dispositivo con `rknn-smi -v`).

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation) y la etiqueta `conversational`.
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen3.5-0.8B, aunque no se documentan de forma explícita en esta model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara lista de idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con endpoints de inferencia, pero no se detalla el mecanismo.

## Casos de uso

- Despliegue en dispositivos de borde con NPU Rockchip RK1828: el repositorio está específicamente compilado para esta NPU, con runtime v1.1.0, por lo que encaja en productos empotrados que necesitan inferencia local sin GPU dedicada.
- Asistentes conversacionales locales de bajo consumo: la ventana de 148,5k tokens de la variante kv-int4 permite mantener conversaciones multi-turno largas o procesar documentos extensos directamente en el dispositivo.
- Procesamiento de documentos largos en el borde: con 152.064 tokens de contexto y KVCache int4, resulta adecuado para resumir o extraer información de textos extensos sin enviar datos a la nube.
- Prototipado rápido sobre hardware Rockchip: al incluir configuraciones separadas, checksums y comandos de descarga vía ModelScope y Hugging Face, simplifica la puesta en marcha de pruebas de concepto en placas RK1828.
- Integración en pipelines de CI/CD para verificación de despliegues: los ficheros SHA256SUMS permiten automatizar la comprobación de integridad de los pesos antes de publicar una imagen de dispositivo.
- Evaluación comparativa de cuantización w4a16 frente a fp16 en NPU: disponer de dos configuraciones con el mismo modelo base permite medir el impacto de la KVCache int4 en calidad y latencia dentro del mismo hardware.
- Escenarios con requisitos de privacidad: al ejecutarse localmente en la NPU, evita el envío de datos sensibles a servicios externos, siempre que el caso de uso no requiera capacidades que el modelo de 0,8B no cubre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable en el sentido habitual; el modelo se ejecuta sobre NPU Rockchip RK1828, no sobre GPU. El repositorio completo ocupa 1,1 GB, lo que da una referencia del orden de magnitud del despliegue.
- GPU recomendadas: no aplicable; el formato RKNN está orientado a la NPU RK1828. No se documenta ejecución en A100, H100 ni RTX 4090.
- Compatibilidad con consumer GPU: no disponible; no se declara soporte para GPUs de consumo.
- Chips soportados: RK1828 (familia RK182X), con runtime RKNN v1.1.0 y driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v`.
- Opciones de despliegue: runtime RKNN Toolkit v1.1.0 sobre RK1828; descarga de pesos vía ModelScope (`modelscope download`) o Hugging Face (`hf download`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| RK182X-LLM-Qwen3.5-0.8B (este) | 0,8B | 152.064 (kv-int4) / 76.288 (fp16) | RKNN | NPU Rockchip RK1828 | Apache 2.0 |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible en esta ficha | safetensors (presumible) | GPU/CPU genéricos | Apache 2.0 |
| Otras conversiones RKNN de LLM | no disponible | no disponible | RKNN | NPU Rockchip | no disponible |

La comparación directa con alternativas de la misma categoría (conversiones RKNN para NPU Rockchip) no está disponible en la información proporcionada. El modelo base Qwen/Qwen3.5-0.8B es el referente natural, pero sus especificaciones completas de contexto y benchmarks no se recogen en este repositorio.

## Limitaciones y advertencias

- Dependencia estricta de hardware: solo funciona en chips RK1828 con el runtime RKNN v1.1.0 y el driver correspondiente; no es portable a GPU o CPU convencionales sin reconversión.
- Uso conjunto obligatorio de ficheros: deben emplearse los ficheros de un mismo directorio de configuración; mezclar configuraciones puede producir fallos.
- Verificación de integridad necesaria: el autor exige comprobar SHA-256 (`sha256sum -c SHA256SUMS`) y desplegar solo cuando todas las entradas devuelvan `OK`.
- Sesgos conocidos: no disponible; no se documentan en la model card.
- Riesgo de alucinación: no disponible; no se aportan evaluaciones específicas para esta conversión.
- Limitaciones de contexto o idioma: la variante fp16 reduce el contexto a 76.288 tokens frente a los 152.064 de la variante kv-int4; no se declara lista de idiomas soportados.
- Restricciones de licencia: el modelo base es Apache 2.0, pero se aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime, que deben revisarse antes de uso comercial.
- Trazabilidad limitada: el repositorio no publica benchmarks, evaluaciones de calidad tras la cuantización w4a16 ni comparativas con el modelo base en fp16, por lo que la degradación inducida por la cuantización no está cuantificada.
- Madurez del repositorio: sin descargas ni likes en el momento de la consulta y creado en 2026-11-20, lo que limita la evidencia comunitaria sobre su funcionamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Documentación de la configuración kv-int4: https://huggingface.co/UGREENDEV/RK182X-LLM-Qwen3.5-0.8B/tree/main/Qwen3.5-0.8B-w4a16-8-152064-kv-int4
- Repositorio en ModelScope: `UGREENDEV/RK182X-LLM-Qwen3.5-0.8B` (referenciado en la model card, sin URL directa proporcionada)
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada.

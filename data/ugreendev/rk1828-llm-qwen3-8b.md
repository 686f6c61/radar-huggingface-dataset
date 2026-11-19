# UGREENDEV/RK1828-LLM-Qwen3-8B

## Resumen

RK1828-LLM-Qwen3-8B es una conversión al formato RKNN del modelo Qwen/Qwen3-8B, publicada por UGREENDEV para su ejecución sobre la NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de una compilación cuantizada del Qwen3-8B original de Alibaba, empaquetada con el runtime RKNN v1.1.0 y orientada exclusivamente a inferencia en hardware con acelerador NPU de Rockchip. El repositorio ocupa 5,9 GB e incluye dos configuraciones de despliegue distintas.

La relevancia de esta ficha es acotada: no aporta mejoras de capacidad respecto al Qwen3-8B base, sino que resuelve el problema de llevar un LLM de 8 000 millones de parámetros a un SoC con NPU integrada. Las dos configuraciones disponibles difieren en la longitud de contexto (2 560 y 6 144 tokens) y en el tipo de caché KV (fp16 e int4), lo que permite elegir entre menor huella de memoria o mayor ventana de contexto.

Dado que el modelo subyacente es Qwen3-8B, hereda su arquitectura transformer densa y sus capacidades de generación de texto, razonamiento y código, pero queda limitado por las restricciones del runtime RKNN y por el hardware objetivo. La información publicada por el autor se centra en el proceso de conversión y despliegue, no en el comportamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (heredada de Qwen3-8B); empaquetado RKNN para NPU RK1828 |
| Parametros totales | 8 000 millones (modelo base Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2 560 tokens (config w4a16-8-2560) o 6 144 tokens (config w4a16-8-6144-kv-int4) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); caché KV en fp16 o int4 según configuración |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); el repositorio incluye también verificación SHA-256 por configuración |

## Arquitectura y entrenamiento

El modelo es una conversión del Qwen3-8B original, un transformer denso de 8 000 millones de parámetros desarrollado por Alibaba. UGREENDEV no ha entrenado ni ajustado el modelo: únicamente lo ha compilado con RKNN Toolkit para que se ejecute sobre la NPU RK1828 con cuantización w4a16 (pesos de 4 bits, activaciones de 16 bits) y 8 núcleos NPU asignados. No se publican datos sobre tokens de entrenamiento, composición del dataset ni procesos de RLHF o DPO, ya que esa información corresponde al modelo base y no se reproduce en esta model card.

La innovación técnica del repositorio es de despliegue, no de modelado: ofrece dos configuraciones con distinta gestión de la caché KV. La variante de 2 560 tokens usa caché fp16, mientras que la de 6 144 tokens emplea caché int4 para reducir la huella de memoria a costa de precisión en la atención. El repositorio incluye sumas de verificación SHA-256 por configuración, lo que sugiere un flujo de despliegue orientado a producción embebida.

## Capacidades

- Generación de texto conversacional, heredada de Qwen3-8B.
- Razonamiento y matemáticas: capacidades propias del modelo base, sujetas a la ventana de contexto reducida (2,5k o 6k tokens).
- Generación de código: disponible en el modelo base, aunque limitada por el contexto efectivo.
- Soporte multilingüe: el modelo base es multilingüe, pero esta conversión no declara idiomas soportados explícitamente.
- Ejecución en NPU RK1828 con runtime RKNN v1.1.0 y 8 núcleos NPU.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en esta conversión.
- No se documenta decodificación especulativa ni optimizaciones de atención más allá del tipo de caché KV.

## Casos de uso

- Asistente conversacional en dispositivo embebido: el modelo puede gestionar diálogos multi-turno dentro de la ventana de 2 560 o 6 144 tokens, adecuado para dispositivos con NPU RK1828 que requieran procesamiento local sin conexión a la nube.
- Procesamiento de texto en el borde (edge computing): clasificación, resumen o extracción de información en equipos con SoC Rockchip, aprovechando la cuantización w4a16 para reducir el consumo de memoria.
- Generación de respuestas en asistentes de voz o domótica: integración en dispositivos del hogar que necesiten respuestas en lenguaje natural con latencia local y sin depender de servicios externos.
- Análisis de documentos cortos: con 6 144 tokens de contexto en la configuración int4, puede procesar correos, notas o fragmentos de documentación técnica para tareas de resumen o Q&A.
- Prototipado de aplicaciones LLM en hardware Rockchip: útil para desarrolladores que quieran validar flujos de inferencia en NPU antes de escalar a otros entornos.
- Automatización de soporte técnico local: respuestas a consultas frecuentes en entornos con conectividad limitada, donde el despliegue en la NPU del dispositivo evita la exposición de datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chip objetivo: exclusivamente Rockchip RK1828 (no se soportan otras NPU ni GPU convencionales).
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Núcleos NPU: 8 en ambas configuraciones.
- Memoria: el repositorio completo ocupa 5,9 GB; la configuración de 2 560 tokens usa caché KV fp16 y la de 6 144 tokens usa caché KV int4, por lo que la segunda requiere más memoria para el contexto pero menos por token de caché.
- No cabe en GPU de consumo (RTX 4090, etc.) ni en CPU convencional: el formato RKNN es específico de la NPU Rockchip.
- Opciones de despliegue: RKNN Runtime v1.1.0; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| RK1828-LLM-Qwen3-8B | 8 000 M | 2 560 o 6 144 tokens | RKNN | Apache 2.0 | NPU RK1828 |
| Qwen/Qwen3-8B (original) | 8 000 M | no disponible en esta ficha | safetensors | Apache 2.0 | GPU/CPU |
| Otras conversiones RKNN de Qwen3-8B | 8 000 M | no disponible | RKNN | Apache 2.0 | NPU Rockchip |

La comparativa directa con el Qwen3-8B original es la más relevante: esta conversión sacrifica longitud de contexto (frente a la ventana nativa del modelo base) y portabilidad a cambio de ejecución en NPU de bajo consumo. No se dispone de datos de rendimiento para comparar numéricamente.

## Limitaciones y advertencias

- El modelo solo funciona en chips RK1828; no es portable a GPU, CPU u otras NPU sin reconversión.
- La ventana de contexto es muy reducida (2 560 o 6 144 tokens) en comparación con el Qwen3-8B original, lo que limita tareas de contexto largo.
- La configuración de 6 144 tokens usa caché KV int4, lo que puede degradar la precisión de la atención en secuencias largas.
- La cuantización w4a16 introduce pérdida de precisión respecto al modelo en fp16/bf16; no se publican evaluaciones de la degradación.
- No se documentan idiomas soportados ni sesgos conocidos en esta conversión.
- Riesgo de alucinación inherente al modelo base, no evaluado en esta versión.
- Licencia Apache 2.0 para el modelo, pero se aplican adicionalmente los términos de RKNN Toolkit y RKNN Runtime, que pueden restringir el uso comercial del runtime.
- Es imprescindible verificar las sumas SHA-256 antes del despliegue; el autor lo indica explícitamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK1828-LLM-Qwen3-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Documentación de configuración 2 560 tokens: https://huggingface.co/UGREENDEV/RK1828-LLM-Qwen3-8B/tree/main/Qwen3-8B-w4a16-8-2560
- Documentación de configuración 6 144 tokens: https://huggingface.co/UGREENDEV/RK1828-LLM-Qwen3-8B/tree/main/Qwen3-8B-w4a16-8-6144-kv-int4
- ModelScope: https://modelscope.cn/models/UGREENDEV/RK1828-LLM-Qwen3-8B

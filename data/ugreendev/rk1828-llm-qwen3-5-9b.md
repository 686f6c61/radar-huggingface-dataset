# UGREENDEV/RK1828-LLM-Qwen3.5-9B

## Resumen

RK1828-LLM-Qwen3.5-9B es una conversión del modelo Qwen3.5-9B, desarrollado originalmente por el equipo Qwen, al formato RKNN para su ejecución sobre el acelerador NPU Rockchip RK1828. El repositorio lo publica el usuario UGREENDEV y su propósito no es ofrecer un modelo nuevo, sino un artefacto de despliegue: pesos cuantizados (w4a16) y grafos compilados para el runtime RKNN v1.1.0, pensados para inferencia de texto en hardware embebido con NPU.

El modelo fuente es un transformer de 9B parámetros con licencia Apache 2.0, y esta conversión mantiene únicamente la componente de lenguaje (text-only), descartando cualquier capacidad multimodal del original. La configuración publicada distribuye el modelo en dos segmentos (`llm_seg0` y `llm_seg1`), cada uno asociado a 8 núcleos NPU, con cuantización de pesos w4a16 y caché KV en int4, y una longitud de contexto declarada de 112.640 tokens por segmento.

Su relevancia es acotada pero específica: permite ejecutar un LLM de 9B en un SoC Rockchip RK1828 con un contexto muy largo, algo que no es viable con los formatos estándar (GGUF, safetensors) sobre esa plataforma. Para el resto de escenarios (GPU, CPU, servidores), esta conversión no aporta ventajas frente al modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-9B; detalles internos no disponibles en la información proporcionada) |
| Parámetros totales | 9B (según el nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 112.640 tokens por segmento (110k), según la configuración publicada |
| Tipos de cuantización | Pesos w4a16 (int4 con activaciones fp16); caché KV en int4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (runtime v1.1.0); el repo incluye también GGUF como tag, pero los artefactos descritos son RKNN |
| Chips soportados | Rockchip RK1828 |
| Núcleos NPU | 8 por segmento (`llm_seg0`: 8, `llm_seg1`: 8) |
| Tamaño del repositorio | 7,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-9B, un transformer decoder-only de 9B parámetros. Esta ficha no dispone de información sobre la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO; esos datos corresponden a la model card del modelo original y no se incluyen en la información proporcionada.

La innovación técnica de este repositorio no está en el entrenamiento, sino en el proceso de conversión y despliegue: el modelo se ha segmentado en dos particiones (`llm_seg0` y `llm_seg1`) que se ejecutan sobre dos bloques de 8 núcleos NPU cada uno, con pesos cuantizados a w4a16 y caché KV en int4 para reducir la huella de memoria. El runtime objetivo es RKNN v1.1.0, y el repositorio incluye sumas de verificación SHA-256 para validar la integridad de los ficheros antes del despliegue. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto y comprensión de lenguaje natural, en la componente text-only del modelo Qwen3.5-9B.
- Conversación multi-turno (el repositorio está etiquetado como `conversational`).
- Manejo de contextos muy largos: hasta 112.640 tokens por segmento según la configuración publicada.
- Inferencia sobre NPU Rockchip RK1828 con runtime RKNN v1.1.0.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking. Al ser una conversión text-only, se descarta expresamente la componente multimodal del modelo fuente.

## Casos de uso

- Procesamiento de documentos largos en dispositivo: con 110k tokens de contexto por segmento, el modelo puede resumir o extraer información de contratos, informes o expedientes completos sin fragmentación, ejecutándose localmente sobre el RK1828.
- Asistentes conversacionales embebidos: el tag `conversational` y la caché KV en int4 permiten mantener diálogos multi-turno en dispositivos con NPU RK1828, con un consumo de memoria contenido.
- Análisis de logs o trazas extensas en el borde: la ventana de contexto permite ingerir volúmenes grandes de texto técnico y generar resúmenes o detección de anomalías sin enviar datos a la nube.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en hardware local, es adecuado para procesar datos sensibles que no pueden salir del dispositivo.
- Prototipado en hardware Rockchip: sirve como referencia para validar pipelines de inferencia LLM sobre RK1828 antes de escalar a producción.
- Integración en productos de electrónica de consumo con NPU: el formato RKNN y la segmentación en dos tarjetas facilitan empaquetar el modelo en firmware de dispositivos finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de latencia o throughput sobre RK1828.

## Requisitos de hardware

- Hardware obligatorio: SoC Rockchip RK1828 con NPU. No es ejecutable en GPU convencional ni en CPU mediante los artefactos RKNN incluidos.
- Runtime: RKNN Runtime v1.1.0 y driver compatible; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Memoria: el repositorio ocupa 7,1 GB; la configuración usa pesos w4a16 y caché KV int4, lo que reduce la huella frente a fp16, pero no se especifica la VRAM/RAM exacta necesaria.
- Núcleos NPU: 8 por segmento, dos segmentos (`llm_seg0` y `llm_seg1`).
- Opciones de despliegue: descarga vía `hf download` o `modelscope download`, verificación con `sha256sum -c SHA256SUMS` y ejecución sobre el runtime RKNN. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| RK1828-LLM-Qwen3.5-9B (esta ficha) | 9B | 112.640 tokens/segmento | RKNN (w4a16, KV int4) | Apache 2.0 | NPU Rockchip RK1828 |
| Qwen/Qwen3.5-9B (modelo fuente) | 9B | no disponible en la información proporcionada | safetensors | Apache 2.0 | GPU/CPU genéricos |
| Otras conversiones RKNN de la familia Qwen | no disponible | no disponible | RKNN | según modelo base | NPU Rockchip |

La comparación relevante es con el modelo fuente: esta conversión sacrifica portabilidad y potencialmente precisión (por la cuantización w4a16 e int4 en KV) a cambio de ejecución en NPU embebida con contexto largo. Para despliegues en GPU, el modelo original es la opción adecuada. No se dispone de datos de benchmarks que permitan comparar rendimiento entre ambos.

## Limitaciones y advertencias

- Dependencia estricta de hardware: solo funciona en RK1828 con RKNN Runtime v1.1.0 y driver compatible; no es portable a otras plataformas.
- La cuantización w4a16 y la caché KV en int4 pueden degradar la calidad respecto al modelo en fp16; no se documenta la magnitud de esa degradación.
- Es una conversión text-only: no conserva capacidades multimodales del modelo fuente.
- Idiomas soportados no especificados; no se garantiza cobertura multilingüe más allá de la del modelo original.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de fidelidad en esta conversión.
- Sesgos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución y los términos del modelo fuente Qwen3.5-9B.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente y sin validación comunitaria.
- Es obligatorio verificar las sumas SHA-256 antes del despliegue; el autor indica desplegar solo si todas las entradas muestran `OK`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK1828-LLM-Qwen3.5-9B
- Modelo fuente: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentación de la configuración (inglés): Qwen3.5-9B-w4a16-8-112640-normal-kv-int4-2cards/README.md (dentro del repositorio)
- Documentación de la configuración (chino): Qwen3.5-9B-w4a16-8-112640-normal-kv-int4-2cards/README_CN.md (dentro del repositorio)
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK1828-LLM-Qwen3.5-9B --revision master`

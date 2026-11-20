# UGREENDEV/RK182X-LLM-HY-MT1.5-1.8B

## Resumen

RK182X-LLM-HY-MT1.5-1.8B es una conversión al formato RKNN del modelo Tencent HY-MT1.5-1.8B, publicada por UGREENDEV para su ejecución sobre las NPU Rockchip RK1820 y RK1828. No se trata de un modelo entrenado desde cero, sino de un derivado cuantizado (w4a16) y empaquetado para el runtime RKNN v1.1.0, orientado a despliegue en dispositivos de borde con aceleración NPU en lugar de GPU convencional.

El modelo base, tencent/HY-MT1.5-1.8B, es un LLM de 1.800 millones de parámetros de la familia Hunyuan de Tencent, con vocación de generación de texto y traducción (el sufijo MT sugiere machine translation). La conversión conserva la licencia original Tencent HY Community License y añade las condiciones de uso del RKNN Toolkit y del RKNN Runtime.

Su relevancia es acotada pero específica: cubre el nicho de LLMs ejecutables en silicio Rockchip con NPU, un ecosistema con pocas opciones publicadas. El repositorio ocupa 1,7 GB, ofrece una única configuración (8 núcleos NPU, contexto de 8192 tokens, KVCache en fp16) y no incluye pesos en safetensors ni GGUF estándar, sino artefactos RKNN propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de la familia Hunyuan; la conversión es RKNN) |
| Parametros totales | 1.800 millones (modelo base HY-MT1.5-1.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-community (Tencent HY Community License Agreement) |
| Formato de pesos | RKNN (runtime v1.1.0); no se distribuyen safetensors ni GGUF |
| Nucleos NPU | 8 |
| KVCache | fp16 |
| Chips soportados | RK1820, RK1828 |
| Version de runtime RKNN | v1.1.0 |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base tencent/HY-MT1.5-1.8B (número de capas, dimensión oculta, mecanismo de atención, composición del dataset o si hubo RLHF/DPO). Lo que sí se documenta es el proceso de conversión: el modelo original se transforma a formato RKNN mediante el RKNN Toolkit y se cuantiza a w4a16, con KVCache en fp16 y una configuración fija de 8 núcleos NPU y 8192 tokens de contexto.

El empaquetado incluye un directorio de configuración (`HY-MT1.5-1.8B-w4a16-8-8192`) con `config.json`, manifiesto de ficheros y sumas SHA-256 para verificación de integridad, además de plantillas de prompt de traducción que deben usarse de forma coincidente con el modelo. No se documentan innovaciones técnicas propias más allá de la cuantización y el despliegue en NPU.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Traducción automática: la model card exige usar la plantilla de prompt de traducción correspondiente, lo que indica que el modelo base está orientado a tareas de traducción.
- Ejecución en NPU Rockchip RK1820 y RK1828 mediante RKNN Runtime v1.1.0.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible el listado de idiomas.
- Visión, audio o modo thinking: no disponible.

## Casos de uso

- Traducción en dispositivo de borde: usar la plantilla de prompt de traducción incluida para traducir texto en equipos con NPU RK1820/RK1828, sin depender de conectividad a la nube.
- Asistentes embebidos en hardware de consumo: integrar el modelo en dispositivos UGREEN o similares con Rockchip RK182X para conversación local con 8192 tokens de contexto.
- Procesamiento de texto en kioscos o terminales industriales: despliegue sobre NPU con cuantización w4a16 para reducir huella de memoria frente a fp16.
- Preprocesado lingüístico en pipelines locales: normalización, resumen o reformulación de texto antes de enviarlo a un sistema mayor.
- Prototipado de LLM en silicio Rockchip: validar flujos de inferencia RKNN antes de invertir en modelos mayores.
- Verificación de integridad en despliegues: el repositorio incluye `SHA256SUMS` para comprobar los ficheros antes de desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chips soportados: exclusivamente RK1820 y RK1828 (NPU Rockchip). No se contempla ejecución en GPU NVIDIA, AMD ni en CPU convencional.
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v`.
- Configuración: 8 núcleos NPU, cuantización w4a16, KVCache fp16, contexto de 8192 tokens.
- VRAM/GPU consumer: no aplica; el modelo no está pensado para A100, H100 ni RTX 4090.
- Opciones de despliegue: RKNN Runtime sobre RK1820/RK1828. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK182X-LLM-HY-MT1.5-1.8B | 1,8B | 8192 | RKNN (w4a16) | tencent-hy-community | NPU RK1820/RK1828 |
| tencent/HY-MT1.5-1.8B (original) | 1,8B | no disponible | safetensors (previsible) | tencent-hy-community | GPU/CPU genéricos |
| Alternativas RKNN de otros fabricantes | no disponible | no disponible | RKNN | variable | NPU Rockchip |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware propietario: solo funciona en RK1820 y RK1828 con RKNN Runtime v1.1.0; no es portable a GPU estándar.
- Licencia restrictiva: Tencent HY Community License Agreement, no Apache 2.0; el uso y la redistribución están sujetos a la Sección 5 y al apéndice de la licencia.
- Obligación de divulgación: al prestar servicios a terceros debe indicarse el proveedor real del servicio conforme a la licencia.
- Tencent no está afiliado, patrocina ni respalda esta conversión.
- Deben usarse conjuntamente todos los ficheros del directorio de configuración y la plantilla de prompt de traducción correspondiente.
- Idiomas soportados no documentados; riesgo de comportamiento degradado fuera de los idiomas previstos por el modelo base.
- Sesgos y riesgo de alucinación: no documentados en la información disponible, pero aplicables por herencia del modelo base.
- Repositorio sin descargas ni likes en el momento de la consulta; madurez y soporte comunitario limitados.
- Verificar `SHA256SUMS` antes de desplegar; desplegar solo si todas las entradas muestran `OK`.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-HY-MT1.5-1.8B
- Modelo base: https://huggingface.co/tencent/HY-MT1.5-1.8B
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-LLM-HY-MT1.5-1.8B --revision master`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK182X-LLM-HY-MT1.5-1.8B --revision v1.1.0`
- Documentación de configuración: `HY-MT1.5-1.8B-w4a16-8-8192/README.md` (inglés) y `README_CN.md` (chino)
- Licencia: `LICENSE` en la raíz del repositorio; avisos adicionales en `Notice`

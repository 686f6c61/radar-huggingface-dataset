# UGREENDEV/RK182X-LLM-Qwen3.5-2B

## Resumen

RK182X-LLM-Qwen3.5-2B es una conversión al formato RKNN del modelo Qwen/Qwen3.5-2B, publicada por UGREENDEV para su ejecución sobre la NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el repositorio contiene pesos cuantizados (w4a16) y la configuración necesaria para que el runtime RKNN v1.1.0 pueda ejecutar el modelo en hardware embebido. El modelo base, Qwen3.5-2B, es un transformer de 2.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba.

La relevancia de esta ficha reside en su orientación a inferencia en el borde (edge): permite desplegar un LLM conversacional de 2B en un SoC Rockchip con NPU dedicada, con opciones de contexto de hasta 128.000 tokens (125k) mediante KVCache en int4, o 64.512 tokens con KVCache en fp16. El repositorio ocupa 2,4 GB e incluye dos configuraciones precompiladas (w4a16-8-128000-kv-int4 y w4a16-8-64512), pensadas para 8 núcleos NPU.

El proyecto está etiquetado como compatible con endpoints y orientado a generación de texto conversacional. La licencia declarada es Apache 2.0, heredada del modelo base, aunque el uso del RKNN Toolkit y del RKNN Runtime añade términos de licencia adicionales que deben revisarse antes de un despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B; artefacto convertido a RKNN) |
| Parametros totales | 2B (modelo base Qwen3.5-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (config. kv-int4) / 64.512 tokens (config. fp16) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache int4 o fp16 según configuración |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); aplican además los términos del RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); el repo también incluye tags gguf y rknn |
| Chip objetivo | Rockchip RK1828 (etiqueta RK182X) |
| Núcleos NPU | 8 |
| Runtime RKNN | v1.1.0 |
| Tamaño del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parámetros. El artefacto publicado no incluye información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esos datos deben consultarse en la model card oficial de Qwen/Qwen3.5-2B, que no forma parte de la información proporcionada.

La innovación técnica de este repositorio es la conversión a RKNN para la NPU RK1828: pesos cuantizados a 4 bits con activaciones de 16 bits (w4a16), repartidos en 8 núcleos NPU, y dos variantes de gestión de KVCache. La configuración kv-int4 permite alcanzar 128.000 tokens de contexto comprimiendo la caché a int4, mientras que la variante fp16 sacrifica longitud de contexto (64.512 tokens) a cambio de mayor precisión en la caché. El repositorio incluye checksums SHA-256 para verificar la integridad de los ficheros antes del despliegue.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y generación de código y matemáticas, heredados del modelo base Qwen3.5-2B (no se detallan capacidades específicas en la información disponible).
- Soporte de contexto largo: hasta 128.000 tokens con KVCache int4, útil para documentos extensos o conversaciones multi-turno prolongadas.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere integración en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (el repositorio incluye documentación en inglés y chino, pero no se especifican los idiomas del modelo).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Asistente conversacional en dispositivo embebido: el modelo puede ejecutarse en la NPU RK1828 de un dispositivo Rockchip para mantener conversaciones multi-turno sin conexión a la nube, gracias a sus 64.512–128.000 tokens de contexto.
- Procesamiento de documentos largos en el borde: con la configuración kv-int4 y 125k tokens de contexto, puede resumir o extraer información de manuales, contratos o informes sin enviar datos a servidores externos.
- Automatización industrial con privacidad: al ejecutarse localmente en hardware Rockchip, permite desplegar asistentes de texto en entornos con requisitos de confidencialidad (sanidad, industria, administración).
- Prototipado de productos IoT con interfaz de lenguaje natural: integración en dispositivos domésticos o wearables que requieran generación de texto local con latencia baja y sin dependencia de red.
- Evaluación de la NPU RK1828 para cargas LLM: el repositorio sirve como referencia para medir throughput y latencia de un modelo 2B cuantizado en 8 núcleos NPU, útil para decisiones de arquitectura hardware.
- Generación de texto asistida en kioscos o terminales de punto de venta: respuestas conversacionales locales con contexto suficiente para guiones de atención al cliente.
- Despliegue en pipelines de CI/CD para verificación de modelos: los checksums SHA-256 y las configuraciones versionadas permiten automatizar la validación de artefactos antes de flashear dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chip objetivo: Rockchip RK1828 (etiqueta RK182X). No se contempla ejecución en GPU convencional con este formato.
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Núcleos NPU: 8.
- Almacenamiento: repositorio de 2,4 GB; cada configuración ocupa una fracción del total.
- VRAM/RAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas (A100, H100, RTX 4090): no aplicable; el artefacto está compilado para NPU RK1828.
- ¿Cabe en GPU consumer? No aplicable en formato RKNN. Para ejecutar el modelo base Qwen3.5-2B en GPU consumer sería necesario usar los pesos originales en safetensors/GGUF, no este repositorio.
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1828; descarga vía `hf download` o `modelscope download`; verificación con `sha256sum -c SHA256SUMS`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK182X-LLM-Qwen3.5-2B (este) | 2B | 128k (kv-int4) / 64.512 (fp16) | RKNN | Apache 2.0 | NPU Rockchip RK1828 |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | safetensors (original) | Apache 2.0 | GPU/CPU genéricas |
| Otros LLM 2B en formato GGUF | ~2B | variable | GGUF | variable | CPU/GPU consumer |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El artefacto solo es compatible con el chip RK1828; no funcionará en otras NPU Rockchip ni en GPU convencionales.
- Es imprescindible usar el RKNN Runtime y el driver en la versión correspondiente (v1.1.0); una discrepancia de versión puede impedir la ejecución.
- Los ficheros de una configuración deben usarse conjuntamente; mezclar ficheros de distintas configuraciones puede producir fallos.
- La cuantización w4a16 y el KVCache int4 pueden degradar la calidad de las respuestas frente al modelo base en fp16; no se han publicado métricas de esa degradación.
- Sesgos conocidos: no disponible en la información proporcionada; deben evaluarse a partir del modelo base Qwen3.5-2B.
- Riesgo de alucinación: inherente a los LLM de 2B; no se han publicado evaluaciones específicas para esta conversión.
- Idiomas soportados: no disponible; verificar en la model card del modelo base.
- Restricciones de licencia: Apache 2.0 para el modelo base, pero el uso del RKNN Toolkit y RKNN Runtime está sujeto a sus propios términos, que deben revisarse para uso comercial.
- No se han publicado benchmarks ni métricas de latencia/throughput para esta conversión, lo que dificulta estimar su rendimiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-LLM-Qwen3.5-2B --revision master`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK182X-LLM-Qwen3.5-2B --revision v1.1.0`
- Documentación de configuración: subdirectorios `Qwen3.5-2B-w4a16-8-128000-kv-int4/README.md` y `Qwen3.5-2B-w4a16-8-64512/README.md` dentro del repositorio.
- Paper, blog o demo adicionales: no disponible en la información proporcionada.

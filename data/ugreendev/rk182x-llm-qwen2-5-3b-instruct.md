# UGREENDEV/RK182X-LLM-Qwen2.5-3B-Instruct

## Resumen

RK182X-LLM-Qwen2.5-3B-Instruct es una conversión al formato RKNN del modelo Qwen2.5-3B-Instruct, publicada por el usuario UGREENDEV. No se trata de un modelo entrenado desde cero, sino de un derivado cuantizado y empaquetado para ejecutarse sobre las NPU Rockchip RK1820 y RK1828, con el runtime RKNN v1.1.0. Su relevancia radica en que permite desplegar un LLM conversacional de 3.000 millones de parámetros en hardware de borde basado en silicio Rockchip, un nicho habitualmente dominado por formatos GGUF y llama.cpp.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-3B-Instruct, con cuantización w4a16 (pesos a 4 bits, activaciones a 16 bits) y una ventana de contexto limitada a 2.048 tokens en esta configuración concreta. El repositorio ocupa 2,6 GB e incluye una única configuración denominada `Qwen2.5-3B-Instruct-w4a16-8-2048`, que emplea 8 núcleos NPU y caché KV en fp16.

La ficha resulta relevante para desarrolladores que trabajen con dispositivos embebidos Rockchip y necesiten capacidades de generación de texto conversacional en local, sin depender de la nube. La licencia del modelo base es Qwen Research License, no Apache 2.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.000 millones (modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (configuracion w4a16-8-2048) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License Agreement) |
| Formato de pesos | RKNN (runtime RKNN v1.1.0); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un derivado cuantizado del Qwen2.5-3B-Instruct original, que emplea una arquitectura transformer decoder-only con atención completa. Esta versión concreta no ha sido reentrenada: se ha convertido al formato RKNN y cuantizado a w4a16 para su ejecución sobre las NPU RK1820 y RK1828. La configuración publicada utiliza 8 núcleos NPU y una caché KV en fp16, con una ventana de contexto de 2.048 tokens.

No se dispone de información sobre los datos de entrenamiento originales de Qwen2.5-3B-Instruct en la información proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO). Tampoco se documentan innovaciones técnicas propias del proceso de conversión más allá de la cuantización w4a16 y el empaquetado RKNN. El repositorio incluye sumas de verificación SHA-256 para garantizar la integridad de los ficheros antes del despliegue.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento básico e intermedio y resolución de problemas de complejidad moderada.
- Generación de código y matemáticas a nivel de modelo de 3B, sin datos específicos de rendimiento en esta conversión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para esta conversión RKNN.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero esta conversión no documenta idiomas).
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Asistente conversacional en dispositivos de borde Rockchip: el modelo puede desplegarse sobre NPU RK1820/RK1828 para ofrecer respuestas conversacionales locales sin conexión a la nube, adecuado para electrodomésticos inteligentes o terminales industriales.
- Procesamiento de lenguaje natural en kioscos interactivos: con 2.048 tokens de contexto, puede gestionar diálogos de atención al usuario de duración corta y media en entornos sin conectividad.
- Generación de texto embebida en pasarelas IoT: integrable en dispositivos con silicio Rockchip para resumir, clasificar o redactar texto a partir de entradas de sensores o registros.
- Prototipado rápido de aplicaciones LLM en hardware Rockchip: sirve como base para validar pipelines de inferencia en NPU antes de escalar a modelos mayores o a otras plataformas.
- Asistencia en documentación técnica local: puede redactar borradores, responder preguntas frecuentes o generar descripciones a partir de contexto acotado en herramientas de campo.
- Automatización de respuestas en terminales de punto de venta o atención presencial: al ejecutarse en local, cumple requisitos de privacidad y latencia sin enviar datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo se ejecuta sobre NPU Rockchip, no sobre GPU convencional. El repositorio ocupa 2,6 GB en disco.
- GPU recomendadas: no aplica; el modelo está diseñado para NPU RK1820 y RK1828.
- Compatibilidad con GPU de consumo: no disponible; el formato RKNN no está pensado para GPUs NVIDIA/AMD.
- Opciones de despliegue: runtime RKNN v1.1.0 con el driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK182X-LLM-Qwen2.5-3B-Instruct | 3B | 2.048 tokens | RKNN | qwen-research | NPU RK1820/RK1828 |
| Qwen2.5-3B-Instruct (original) | 3B | 32.768 tokens (modelo base) | safetensors | qwen-research | GPU/CPU |
| Qwen2.5-3B-Instruct GGUF (comunidad) | 3B | variable segun cuantizacion | GGUF | qwen-research | CPU/GPU via llama.cpp |

La comparativa se limita al modelo base y a su versión GGUF, ya que no se dispone de información sobre otras conversiones RKNN comparables en la información proporcionada.

## Limitaciones y advertencias

- La ventana de contexto se reduce a 2.048 tokens en esta configuración, muy por debajo de los 32.768 tokens del modelo base Qwen2.5-3B-Instruct.
- El modelo solo es compatible con las NPU RK1820 y RK1828; no puede ejecutarse en GPU convencionales ni en CPU mediante runtimes estándar.
- Requiere el runtime RKNN v1.1.0 y el driver correspondiente; es necesario verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- La licencia es qwen-research, no Apache 2.0; el uso comercial está restringido por los términos de la Qwen Research License Agreement.
- Se deben usar conjuntamente los ficheros de la configuración seleccionada y verificar las sumas SHA-256 antes del despliegue.
- Riesgo de alucinación inherente a los modelos de 3B, acentuado por la cuantización w4a16.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; el modelo base es multilingüe, pero esta conversión no lo documenta.
- No se documentan capacidades de tool calling ni de agentes para esta conversión.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-Qwen2.5-3B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Documentación de configuración (inglés): Qwen2.5-3B-Instruct-w4a16-8-2048/README.md (dentro del repositorio)
- Documentación de configuración (chino): Qwen2.5-3B-Instruct-w4a16-8-2048/README_CN.md (dentro del repositorio)
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-LLM-Qwen2.5-3B-Instruct --revision master --local_dir ./RK182X-LLM-Qwen2.5-3B-Instruct`

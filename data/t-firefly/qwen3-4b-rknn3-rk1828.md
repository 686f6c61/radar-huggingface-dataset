# t-firefly/qwen3-4b-rknn3-rk1828

## Resumen

El modelo `t-firefly/qwen3-4b-rknn3-rk1828` es una conversión del modelo original Qwen3-4B (desarrollado por Qwen Team) al formato RKNN3, específicamente optimizado para el coprocesador de inteligencia artificial Rockchip RK1828. La conversión ha sido realizada por Firefly AI Team, y el modelo está pensado para su despliegue en entornos de edge AI, donde se ejecuta mediante la herramienta LlamaPi. El objetivo principal es llevar un modelo de lenguaje generalista de 4B parámetros a hardware embebido, aprovechando la aceleración del coprocesador RK1828 para tareas de generación de texto, razonamiento y agentes.

El modelo conserva las capacidades del Qwen3-4B original: soporte de modos de pensamiento (thinking) y no pensamiento (non-thinking), instrucción, diálogo, código, razonamiento y tareas de agente. Al ser una conversión, no se ha modificado la arquitectura ni se ha reentrenado; solo se ha adaptado el formato de pesos y la ejecución al entorno RKNN3. El repositorio tiene un tamaño de 5.8 GB y está disponible bajo licencia Apache 2.0. La relevancia actual radica en la creciente demanda de modelos de lenguaje en dispositivos embebidos, donde la eficiencia y el bajo consumo son críticos, y esta conversión permite ejecutar un modelo de 4B en un coprocesador de IA dedicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen3-4B) |
| Parametros totales | no disponible (se infiere 4B por el nombre) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag indica GGUF, pero no se especifica el tipo) |
| Idiomas soportados | no disponible (el modelo original soporta más de 100 idiomas y dialectos) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (posible GGUF según tags, no confirmado) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del Qwen3-4B al formato RKNN3, sin cambios en la arquitectura original. Qwen3-4B es un modelo de lenguaje causal de tipo transformer, con modos de razonamiento (thinking) y generación directa (non-thinking). El modelo original fue entrenado por Qwen Team con datos multilingües y se diseñó para tareas de instrucción, código y agentes. En esta conversión, Firefly AI no ha realizado entrenamiento adicional; solo ha adaptado los pesos al formato RKNN3 para ejecución en el coprocesador RK1828. No se dispone de información sobre el número de tokens de entrenamiento ni sobre técnicas de alineación (RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional y de instrucción, basada en el modelo original Qwen3-4B.
- Soporte de modos de razonamiento (thinking) y no razonamiento (non-thinking), que permiten elegir entre respuesta directa y razonamiento extendido.
- Capacidad de seguir instrucciones complejas y mantener diálogos multi-turno.
- Generación de código y soporte de razonamiento matemático, según las capacidades del modelo original.
- Soporte de tareas de agente (tool calling, multi-step reasoning) heredado del modelo original.
- Multilingüismo: el modelo original soporta más de 100 idiomas y dialectos, aunque esta conversión no especifica si se mantiene la cobertura completa.
- Diseñado para ejecutarse en el coprocesador RK1828, lo que permite despliegue en hardware de bajo consumo.

## Casos de uso

- Asistentes conversacionales en dispositivos embebidos: el modelo puede gestionar diálogos multi-turno en un dispositivo con RK3588 + RK1828, ofreciendo respuestas en tiempo real sin depender de la nube.
- Automatización de atención al cliente en quioscos o terminales de autoservicio: el modelo puede entender consultas y proporcionar respuestas en varios idiomas, aprovechando su capacidad multilingüe.
- Análisis de video en tiempo real con generación de informes textuales: el RK1828 puede procesar múltiples canales de video y el modelo puede generar descripciones o resúmenes de eventos detectados.
- Asistentes de código en entornos de desarrollo local: aunque el modelo no es específico para código, su capacidad de generación de código puede usarse en herramientas de autocompletado en entornos sin conexión.
- Sistemas de control industrial con interfaces en lenguaje natural: operarios pueden interactuar con el sistema mediante comandos de texto, y el modelo interpreta y ejecuta acciones.
- Educación y tutoría local: el modelo puede servir como tutor interactivo en dispositivos con hardware Rockchip, sin necesidad de internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataforma objetivo: coprocesador RK1828 (Rockchip) con SoC host RK3588.
- VRAM estimada: no disponible.
- GPUs recomendadas: no aplicable (es un coprocesador específico, no una GPU).
- No es compatible con GPUs de consumo general; requiere un dispositivo con RK3588 + RK1828.
- Opciones de despliegue: LlamaPi (herramienta de Firefly) que gestiona descarga, carga y ejecución. También se puede usar RKNN3-Toolkit para conversión y optimización.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos suficientes para una comparación detallada con otros modelos RKNN3. La comparación más directa es con el modelo original Qwen3-4B, que es el mismo modelo sin conversión.

| Modelo | Plataforma | Licencia | Tamaño de repo | Contexto | Rendimiento |
|---|---|---|---|---|---|
| Qwen/Qwen3-4B | CPU/GPU (PyTorch) | Apache 2.0 | no disponible | no disponible | no disponible |
| t-firefly/qwen3-4b-rknn3-rk1828 | RK1828 (RKNN3) | Apache 2.0 | 5.8 GB | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos en la documentación.

## Limitaciones y advertencias

- El modelo es una conversión técnica; no se ha reentrenado, por lo que hereda las limitaciones del Qwen3-4B original (sesgos, riesgo de alucinación, límites de contexto).
- No se especifican los tipos de cuantización ni la longitud de contexto soportada en la conversión, lo que puede afectar al rendimiento real en el dispositivo.
- La ejecución requiere hardware específico (RK3588 + RK1828), no es portable a otros entornos sin adaptación.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar los términos del modelo original y los de Firefly para redistribución.
- No se han publicado resultados de benchmarks ni evaluaciones de calidad en esta conversión, por lo que no se puede garantizar un rendimiento equivalente al del modelo original.
- La herramienta LlamaPi y el RKNN3-Toolkit son necesarios para el despliegue; no se documenta el proceso de conversión para otros formatos.

## Enlaces

- Hugging Face: https://huggingface.co/t-firefly/qwen3-4b-rknn3-rk1828
- Modelo original en Hugging Face: https://huggingface.co/Qwen/Qwen3-4B
- Modelo original en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-4B
- Documentación de LlamaPi: https://community.t-firefly.com/docs/ai/applications/LlamaPi/llamapi
- Wiki de Firefly sobre RK1820/RK1828: https://wiki.t-firefly.com/en/AIO-GS1N2-RK182X/ai_rk182x.html
- Repositorio RKNN3 Toolkit: https://github.com/airockchip/rknn3-toolkit

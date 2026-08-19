# t-firefly/qwen3-4b-rkllm-rk3588

## Resumen

El modelo `t-firefly/qwen3-4b-rkllm-rk3588` es una distribución del modelo de lenguaje Qwen3-4B, desarrollado originalmente por el equipo Qwen, adaptado por el equipo de Firefly AI para ejecutarse de forma nativa en el SoC Rockchip RK3588 mediante el toolkit RKLLM y el gestor de despliegue LlamaPi. Su objetivo es llevar la inferencia de un LLM de 4 000 millones de parámetros a dispositivos embebidos y de borde, aprovechando la NPU integrada del RK3588 para obtener un rendimiento adecuado sin depender de una GPU externa.

La relevancia de este modelo radica en que permite desplegar asistentes conversacionales, agentes de razonamiento y tareas de generación de texto en hardware de bajo consumo, como placas de desarrollo, sistemas de automatización industrial o dispositivos IoT. Al estar basado en Qwen3-4B, hereda sus capacidades de instrucción, diálogo, código, razonamiento y soporte multilingüe, incluyendo modos de pensamiento y no pensamiento. La conversión se publica bajo licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3-4B) |
| Parametros totales | 4B (segun nomenclatura del modelo) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (RKLLM soporta RK4/RK8/FP16, pero no se especifica) |
| Idiomas soportados | mas de 100 idiomas y dialectos (segun card del modelo original) |
| Licencia | apache-2.0 |
| Formato de pesos | RKLLM (formato de Rockchip para NPU) |

## Arquitectura y entrenamiento

No se proporcionan detalles tecnicos sobre la arquitectura interna ni el proceso de entrenamiento en la informacion disponible. El modelo es una conversion del Qwen3-4B, un modelo causal de generacion de texto con arquitectura transformer, aunque no se especifican parametros como el numero de capas, cabezas de atencion o dimension del modelo. Tampoco hay datos sobre el dataset de entrenamiento, el numero de tokens procesados o si se aplicaron tecnicas como RLHF o DPO.

La conversion realizada por Firefly AI consiste en transformar los pesos del modelo original al formato RKLLM, que es el formato nativo para la NPU de Rockchip. Este proceso incluye la cuantizacion de los pesos para reducir el uso de memoria y acelerar la inferencia, aunque no se indican los niveles de cuantizacion concretos ni el impacto en la precision.

## Capacidades

- Generacion de texto en modo conversacional y de instrucciones.
- Soporte de modos de pensamiento (thinking) y no pensamiento (non-thinking), segun la card del modelo original.
- Capacidad de seguir instrucciones y mantener dialogos multiturno.
- Generacion de codigo y razonamiento logico.
- Soporte de tareas de agente, aunque no se detalla el nivel de integracion con tool calling.
- Multilingue: mas de 100 idiomas y dialectos, segun la documentacion del modelo original.
- Despliegue en hardware de borde gracias a la conversion para RK3588.

## Casos de uso

- Asistentes conversacionales en dispositivos embebidos: el modelo puede ejecutarse en una placa con RK3588 para ofrecer un asistente de voz o texto local, sin conexion a la nube, gracias a su capacidad de generar respuestas coherentes en multiples idiomas.
- Automatizacion industrial: integracion en sistemas de control de calidad o mantenimiento predictivo donde se requiera interpretar instrucciones en lenguaje natural y generar informes.
- Generacion de codigo en entornos de desarrollo de borde: el modelo puede ayudar a programadores que trabajan en sistemas embebidos a generar fragmentos de codigo, depurar o explicar APIs, directamente en el dispositivo.
- Chatbots de atencion al cliente en kioscos o terminales de punto de venta: el modelo puede gestionar conversaciones con clientes en varios idiomas, manteniendo el contexto de la interaccion.
- Educacion y formacion: uso como tutor virtual en plataformas educativas embebidas, respondiendo preguntas de matematicas, ciencias o idiomas.
- Prototipado rapido de aplicaciones de IA en hardware: los desarrolladores pueden usar LlamaPi para lanzar el modelo en minutos y evaluar su rendimiento en el RK3588 antes de integrarlo en un producto final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de rendimiento en pruebas como MMLU, HumanEval o GSM8K para esta conversion especifica.

## Requisitos de hardware

- Plataforma: SoC Rockchip RK3588 con NPU integrada (6 TOPS).
- Memoria: se recomienda al menos 8 GB de RAM en la placa, aunque el modelo cuantizado puede funcionar con menos dependiendo del nivel de cuantizacion.
- VRAM: no aplica, la NPU utiliza memoria compartida con el sistema.
- GPU: no requiere GPU externa; se usa la NPU del RK3588.
- Despliegue: se recomienda el uso de LlamaPi (`llamapi run qwen3:4b --platform rkllm/rk3588`), que gestiona la descarga, carga y ejecucion del modelo.
- Otras opciones: el toolkit RKLLM de Rockchip proporciona interfaces C/C++ para integracion personalizada.
- Latencia y throughput: no se han publicado datos concretos; dependen del nivel de cuantizacion y de la frecuencia de la NPU.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de comparacion con otras conversiones o modelos equivalentes para RK3588 en la informacion disponible. Se puede mencionar que el modelo original Qwen3-4B compite con otros modelos de 4B como Llama-3.2-3B o Phi-3.5-mini, pero no hay datos de rendimiento de la version convertida.

## Limitaciones y advertencias

- No se especifican los sesgos potenciales del modelo original; se heredan los del Qwen3-4B.
- Riesgo de alucinaciones inherente a los modelos de lenguaje generativo, especialmente en tareas de razonamiento complejo.
- La cuantizacion para la NPU puede reducir la precision de los resultados en comparacion con el modelo en punto flotante.
- La longitud de contexto puede verse limitada por la memoria disponible en el RK3588, aunque no se indica el valor maximo.
- El modelo solo es compatible con hardware que disponga de NPU de Rockchip RK3588; no se puede ejecutar en otros SoC sin la conversion adecuada.
- La licencia Apache 2.0 permite uso comercial, pero hay que revisar los terminos del modelo original Qwen3-4B y las marcas registradas de Qwen.

## Enlaces

- HuggingFace: https://huggingface.co/t-firefly/qwen3-4b-rkllm-rk3588
- Repositorio de archivos: https://huggingface.co/t-firefly/qwen3-4b-rkllm-rk3588/tree/main
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B
- Modelo original en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-4B
- Documentacion de LlamaPi: https://community.t-firefly.com/docs/ai/applications/LlamaPi/llamapi
- Wiki de Firefly para LLM en RK3588: https://wiki.t-firefly.com/en/Core-3588SJD4-AI/usage_rkllm.html
- Repositorio RKLLM-Toolkit: https://github.com/airockchip/rknn-llm
- Repositorio RKNN3-Toolkit: https://github.com/airockchip/rknn3-toolkit

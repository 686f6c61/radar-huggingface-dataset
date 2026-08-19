# t-firefly/qwen3-1.7b-rkllm-rk3588

## Resumen
El modelo `t-firefly/qwen3-1.7b-rkllm-rk3588` es una conversión del modelo de lenguaje causal Qwen3-1.7B (desarrollado por el equipo Qwen de Alibaba) al formato RKLLM, específicamente optimizado para la plataforma de inferencia en borde Rockchip RK3588. La conversión ha sido realizada por el equipo Firefly AI, que distribuye el modelo como un archivo `.rkllm` con cuantización W8A8, listo para desplegarse mediante la herramienta LlamaPi. Su objetivo principal es habilitar la generación de texto, razonamiento y diálogo en dispositivos con NPU de Rockchip, sin depender de GPU o servidores en la nube. Es relevante porque permite ejecutar un modelo de la familia Qwen3 en hardware de bajo coste y bajo consumo, ampliando las posibilidades de la IA generativa en productos embebidos y de borde. La licencia Apache-2.0 facilita su uso comercial y la integración en proyectos propietarios.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A8 (pesos y activaciones de 8 bits) en formato RKLLM |
| Idiomas soportados | Mas de 100 idiomas y dialectos (segun modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | RKLLM (archivo .rkllm, especifico para NPU Rockchip) |

## Arquitectura y entrenamiento
El modelo base Qwen3-1.7B es un transformer causal (decoder-only) de la familia Qwen3, disenado para tareas de generacion de texto, dialogo, codificacion y razonamiento. El equipo Firefly AI ha convertido los pesos originales al formato RKLLM, un formato propietario de Rockchip para su NPU. La conversion no altera los pesos del modelo, solo los reempaqueta y los cuantiza a W8A8 (8 bits tanto para pesos como para activaciones) para que puedan ejecutarse eficientemente en la NPU del RK3588. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el proceso de entrenamiento del modelo base (numero de tokens, tecnicas de alineacion, etc.). La herramienta de despliegue recomendada es LlamaPi, que gestiona la descarga, carga y ejecucion del modelo en la plataforma objetivo.

## Capacidades
- Generacion de texto: produce respuestas coherentes y contextualizadas para tareas de dialogo, redaccion y resumen.
- Razonamiento y resolucion de problemas: el modelo base Qwen3-1.7B soporta modos de pensamiento (thinking) y no pensamiento (non-thinking), permitiendo elegir entre respuestas razonadas y respuestas directas.
- Instruccion y seguimiento de instrucciones: responde correctamente a comandos y peticiones en lenguaje natural.
- Codificacion: el modelo base tiene capacidades de generacion de codigo en varios lenguajes, aunque no se especifican detalles en la informacion disponible.
- Multilingue: soporta mas de 100 idiomas y dialectos, segun la documentacion del modelo base.
- Despliegue en borde: optimizado para ejecutarse en la NPU del RK3588, con bajo consumo y latencia reducida.

## Casos de uso
- Asistente conversacional en dispositivos IoT: el modelo puede gestionar conversaciones multi-turno en un asistente de voz o chat integrado en un altavoz inteligente o panel de control, ejecutandose localmente en el RK3588 sin conexion a internet.
- Atencion al cliente automatizada en quioscos: un quiosco interactivo con pantalla y audio puede usar el modelo para responder preguntas frecuentes sobre productos o servicios, gracias a su capacidad de seguir instrucciones y su bajo consumo.
- Generacion de respuestas en aplicaciones de salud y bienestar: el modelo puede proporcionar recomendaciones basicas de bienestar o recordatorios personalizados en un dispositivo portatil, sin depender de la nube.
- Traduccion y asistencia multilingue en viajes: un dispositivo de traduccion de bolsillo puede ejecutar el modelo para traducir frases entre varios idiomas, aprovechando el soporte de mas de 100 idiomas.
- Automatizacion de tareas de texto en entornos industriales: el modelo puede generar informes, resumir logs o clasificar mensajes en un sistema de control industrial basado en RK3588, reduciendo la carga de trabajo del personal.
- Prototipado de aplicaciones de IA en borde: los desarrolladores pueden usar el modelo para crear demos de chatbots, asistentes de codigo o generadores de contenido en plataformas de desarrollo con RK3588, acelerando el diseno de productos finales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estandar para esta conversion especifica. El rendimiento dependera de la implementacion de la NPU del RK3588 y de la optimizacion de la herramienta LlamaPi.

## Requisitos de hardware
- El modelo esta disenado para ejecutarse en la plataforma Rockchip RK3588, que incluye una NPU de hasta 6 TOPS.
- El archivo del modelo pesa aproximadamente 2,41 GB (segun el repositorio), por lo que se necesita al menos ese espacio de almacenamiento.
- No se requiere VRAM dedicada; el modelo se ejecuta en la NPU del RK3588, que comparte memoria con el sistema (memoria unificada). Se recomienda un dispositivo con al menos 4 GB de RAM total para garantizar un funcionamiento fluido.
- El despliegue se realiza mediante la herramienta LlamaPi, que gestiona la descarga y ejecucion del modelo. Tambien se puede usar el SDK RKNN3 de Rockchip para integraciones mas avanzadas.
- La latencia y el throughput dependen de la configuracion del dispositivo y de la cuantizacion W8A8; no se proporcionan cifras concretas en la informacion disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Plataforma |
|---|---|---|---|---|---|
| Qwen3-1.7B (original) | 1,7B | 32K (no confirmado) | Apache-2.0 | safetensors, GGUF, etc. | GPU, CPU, NPU (via conversiones) |
| Qwen3-1.7B-RKLLM (este modelo) | 1,7B | no disponible | Apache-2.0 | RKLLM | RK3588 (NPU) |
| Qwen2.5-1.5B (referencia) | 1,5B | 32K | Apache-2.0 | safetensors, GGUF | Multiplataforma |

No se dispone de benchmarks comparativos entre estos modelos en la informacion proporcionada. La diferencia principal radica en el formato de pesos y la plataforma de destino: el modelo de Firefly esta optimizado para la NPU de Rockchip, mientras que las alternativas requieren adaptaciones adicionales para ejecutarse en ese hardware.

## Limitaciones y advertencias
- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o sesgadas, especialmente en temas sensibles o con informacion incompleta. No se ha realizado una evaluacion especifica para esta conversion.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible, por lo que el rendimiento con textos largos o conversaciones extensas no esta garantizado.
- Dependencia del hardware: el modelo solo se ejecuta en plataformas con NPU RK3588 (o compatibles con RKLLM), lo que limita su portabilidad a otros dispositivos.
- Restricciones de licencia: aunque la licencia Apache-2.0 permite uso comercial, los terminos de uso del modelo original Qwen3-1.7B pueden incluir restricciones adicionales. Se recomienda revisar la licencia del modelo base.
- Rendimiento en tareas complejas: al ser un modelo de 1.7B, su capacidad de razonamiento avanzado, codificacion compleja o generacion de texto largo es limitada comparada con modelos de mayor tamano. No es adecuado para aplicaciones que requieren alta precision o conocimiento especializado.
- No se han publicado pruebas de robustez o seguridad para esta conversion especifica.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/t-firefly/qwen3-1.7b-rkllm-rk3588
- Modelo original Qwen3-1.7B en Hugging Face: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo original en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-1.7B
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Wiki de LlamaPi de Firefly: https://community.t-firefly.com/docs/ai/applications/LlamaPi/llamapi
- Wiki de Firefly para LLM en RK3588: https://wiki.t-firefly.com/en/AIBOX-PRO-3588/usage_llm_rockchip.html
- Repositorio RKNN3-Toolkit (Rockchip): https://github.com/airockchip/rknn3-toolkit

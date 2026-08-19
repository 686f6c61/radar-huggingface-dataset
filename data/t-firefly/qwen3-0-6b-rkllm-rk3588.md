# t-firefly/qwen3-0.6b-rkllm-rk3588

## Resumen

Este repositorio contiene una conversión del modelo Qwen3-0.6B de Qwen al formato RKLLM, realizada por el equipo Firefly AI para su ejecución en el SoC Rockchip RK3588. El modelo original es un modelo de lenguaje causal denso de 600 millones de parámetros, diseñado para instrucción, diálogo, razonamiento y generación de código, con soporte para modos de pensamiento (thinking) y no pensamiento. La relevancia de esta conversión radica en que permite desplegar un modelo de razonamiento en hardware de borde (edge AI) de gama media-alta, como los dispositivos basados en RK3588, sin necesidad de GPU dedicada.

El formato RKLLM es el formato propietario de Rockchip para ejecutar modelos de lenguaje en la NPU de sus SoC. La herramienta de despliegue recomendada es LlamaPi, que gestiona la descarga, carga y ejecución del modelo con un comando simple. El modelo base Qwen3-0.6B se distribuye bajo licencia Apache 2.0, y la conversión mantiene esa misma licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3) |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32.768 tokens (modelo original) |
| Tipos de cuantizacion | no disponible (formato RKLLM, cuantizacion interna de Rockchip) |
| Idiomas soportados | mas de 100 idiomas y dialectos (modelo original) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (formato propietario Rockchip para NPU) |

## Arquitectura y entrenamiento

El modelo original Qwen3-0.6B es un transformer causal denso de la familia Qwen3. Según el technical report de Qwen3, los modelos densos de esta serie emplean una arquitectura transformer estándar con atención de múltiples cabezas, normalización RMSNorm y embeddings rotatorios (RoPE). El entrenamiento incluye una fase de preentrenamiento con un corpus extenso y posteriormente un proceso de alineación que combina supervisión de instrucciones con aprendizaje por refuerzo, lo que habilita los modos de pensamiento y no pensamiento. El modelo soporta más de 100 idiomas y dialectos, aunque no se han publicado detalles específicos del dataset de entrenamiento en la información disponible.

La conversión a RKLLM es un proceso de transformación de pesos y arquitectura para ejecución en la NPU del RK3588. El equipo de Firefly AI ha realizado esta conversión y proporciona la herramienta LlamaPi para su despliegue. No se han publicado detalles técnicos sobre la cuantización aplicada (por ejemplo, si usa 4 bits o 8 bits) ni sobre el proceso de calibración.

## Capacidades

- Generación de texto y diálogo conversacional multi-turno.
- Razonamiento con modo de pensamiento (thinking mode) y modo directo (non-thinking), seleccionable según la tarea.
- Instrucción y seguimiento de instrucciones complejas.
- Generación de código y asistencia de programación.
- Razonamiento matemático y lógico.
- Soporte multilingüe con más de 100 idiomas y dialectos.
- Ejecución en hardware de borde (RK3588) mediante la NPU, sin necesidad de GPU dedicada.

## Casos de uso

- Asistentes conversacionales embebidos en dispositivos IoT: el modelo puede ejecutarse en placas basadas en RK3588 para alimentar asistentes de voz o chatbots locales sin conexión a internet, manteniendo la privacidad de los datos.
- Automatización de atención al cliente en terminales de autoservicio: integrado en un sistema embebido con pantalla, el modelo gestiona consultas frecuentes y deriva a un agente humano cuando es necesario.
- Generación de código en entornos de desarrollo con recursos limitados: desarrolladores que trabajan en equipos sin GPU pueden usar este modelo para completar funciones o generar scripts sencillos directamente en un dispositivo de borde.
- Razonamiento y análisis de datos en el borde: con el modo de pensamiento activado, el modelo puede analizar datos locales y generar explicaciones o resúmenes sin enviar información a la nube.
- Educación y formación: desplegable en dispositivos educativos basados en RK3588 para tutorías interactivas de idiomas o matemáticas.
- Prototipado rápido de aplicaciones de IA en hardware Rockchip: el comando `llamapi run qwen3:0.6b --platform rkllm/rk3588` permite a desarrolladores evaluar el modelo en minutos sin configurar un servidor de inferencia complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión RKLLM en la información disponible. El modelo original Qwen3-0.6B tiene resultados de rendimiento en el technical report de Qwen3 (arXiv:2505.09388), pero no se dispone de los valores numéricos concretos en esta ficha. Para medir el rendimiento real en el RK3588, es necesario ejecutar pruebas locales de latencia y throughput con la herramienta LlamaPi.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588, con NPU integrada de 6 TOPS de cómputo.
- Memoria: el RK3588 usa memoria LPDDR4/LPDDR5 compartida entre CPU, GPU y NPU. Un modelo de 0.6B cuantizado a 4 bits ocupa aproximadamente 300-400 MB, lo que es viable en placas con 4 GB o más de RAM.
- GPU: no se requiere GPU dedicada; la inferencia se ejecuta en la NPU del SoC.
- Compatibilidad con consumer: sí, si se dispone de una placa con RK3588 (por ejemplo, Firefly RK3588, Orange Pi 5, Rock 5B).
- Opciones de despliegue: LlamaPi (recomendado), que gestiona la descarga y ejecución del modelo. También es posible usar el RKLLM-Toolkit de Rockchip para conversión adicional o integración en aplicaciones C/C++.
- Latencia y throughput: no se han publicado datos específicos de esta conversión. En general, un modelo de 0.6B en la NPU del RK3588 puede alcanzar decenas de tokens por segundo, pero es necesario medir en cada placa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Plataforma objetivo | Licencia |
|---|---|---|---|---|---|
| Qwen3-0.6B (RKLLM, este repo) | 0.6B | 32K | RKLLM | RK3588 (NPU) | Apache 2.0 |
| Qwen3-1.7B (original) | 1.7B | 32K | safetensors | GPU/CPU | Apache 2.0 |
| Qwen3-4B (original) | 4B | 32K | safetensors | GPU/CPU | Apache 2.0 |
| t-firefly/qwen3-0.6b-rknn3-rk1820 | 0.6B | no disponible | RKNN3 | RK1820 (NPU) | Apache 2.0 |

La comparativa directa con modelos de tamaño similar en formato GGUF (para CPU/GPU) no está disponible en la información recopilada. La principal diferencia de esta conversión es que está optimizada para la NPU del RK3588, lo que permite inferencia local con bajo consumo energético, a diferencia de los modelos que requieren GPU o CPU de propósito general.

## Limitaciones y advertencias

- El modelo original Qwen3-0.6B es un modelo compacto y su rendimiento en tareas complejas es inferior al de modelos más grandes de la misma familia (Qwen3-8B, Qwen3-14B). Puede producir respuestas imprecisas o alucinaciones en razonamiento avanzado.
- La conversión a RKLLM puede introducir pérdida de precisión por cuantización; no se ha publicado una evaluación de calidad comparativa entre el modelo original y la versión convertida.
- El formato RKLLM es propietario de Rockchip y solo puede ejecutarse en SoC compatibles (RK3588 y similares). No es portable a otras arquitecturas sin reconversión.
- La licencia Apache 2.0 permite uso comercial, pero debe mantenerse la atribución y los términos de la licencia original de Qwen3.
- El soporte de idiomas del modelo original se hereda, pero la calidad en idiomas minoritarios puede ser inferior a la del inglés o el chino.
- No se dispone de información sobre el rendimiento de la inferencia (latencia, tokens por segundo) en el RK3588, por lo que se recomienda realizar pruebas de carga antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/t-firefly/qwen3-0.6b-rkllm-rk3588
- Modelo original Qwen3-0.6B (Hugging Face): https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo original Qwen3-0.6B (ModelScope): https://modelscope.cn/models/Qwen/Qwen3-0.6B
- Documentación de LlamaPi: https://community.t-firefly.com/docs/ai/applications/LlamaPi/llamapi
- Technical report de Qwen3 (arXiv): https://ar5iv.labs.arxiv.org/html/2505.09388
- Repositorio de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- RKNN3-Toolkit (GitHub): https://github.com/airockchip/rknn3-toolkit

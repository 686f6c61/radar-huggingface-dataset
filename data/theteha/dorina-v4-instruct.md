# theteha/dorina-v4-instruct

## Resumen

Dorina-V4 Instruct es un modelo de lenguaje causal de tipo SLM (small language model) desarrollado por el usuario theteha, con 169.992.960 parámetros totales (aproximadamente 144,7M según la model card) y una longitud máxima de secuencia de 2048 tokens. Está entrenado sobre un modelo base propio denominado Dorina-V4 "kristal" mediante SFT en formato ChatML, y cubre turco e inglés. Se distribuye bajo licencia Apache 2.0 e incluye pesos en PyTorch y una versión cuantizada en GGUF f16 de 340 MB pensada para ejecución en dispositivos móviles.

El aspecto más diferencial del modelo es su orientación a la actuación sobre el sistema operativo Android: además del checkpoint de chat e instrucciones, el repositorio incluye pesos específicos de agente (`dorina_v4_clean_agent.pt` y `dorina_v4_android_agent.pt`) capaces de emitir acciones estructuradas en JSON para controlar Wi-Fi, batería, volumen, brillo, linterna o apertura de aplicaciones en el ecosistema Samsung Galaxy y Android en general. Esto lo sitúa en la categoría de modelos pequeños para automatización on-device.

El modelo es relevante para quienes necesitan un SLM ligero, con licencia permisiva y ejecutable en edge, que combine conversación multi-turno con tool calling orientado a un dominio concreto (control de dispositivo). No obstante, su adopción es todavía muy reducida (33 descargas y 0 likes en el momento de la consulta) y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (clase `DorinaDenseV4`, configuración `DenseConfig`) |
| Parametros totales | 169.992.960 (144,7M según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (`max_seq_len=2048`) |
| Tipos de cuantizacion | GGUF f16 (340 MB); otros tipos no disponibles |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoints) y GGUF (f16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso causal implementado en la clase `DorinaDenseV4`, con un vocabulario ampliado de 32.832 tokens que incorpora tokens especiales de ChatML (`<|im_start|>`, `<|im_end|>`) y de tool call. El modelo parte de un checkpoint base denominado Dorina-V4 "kristal" y se afina mediante SFT (supervised fine-tuning) en formato ChatML para diálogo e instrucciones multi-turno. El repositorio contiene además checkpoints separados de agente (`dorina_v4_clean_agent.pt` y `dorina_v4_android_agent.pt`) entrenados para emitir llamadas de acción estructuradas en JSON.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal; el ejemplo de uso de la model card emplea decodificación greedy (`argmax`) con parada por token `<|im_end|>`.

## Capacidades

- Generación de texto y razonamiento conversacional en turco e inglés.
- Instrucciones y diálogo multi-turno en formato ChatML.
- Generación de código (el ejemplo de la model card solicita una función Python que sume dos números).
- Tool calling / function calling mediante tokens especiales y salida estructurada en JSON.
- Actuación como agente sobre Android OS: control de Wi-Fi, batería, volumen, brillo, linterna y apertura de aplicaciones.
- Ejecución on-device en edge mediante GGUF f16 con llama.cpp o Termux.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Asistente conversacional en turco e inglés: el modelo gestiona diálogos multi-turno con hasta 2048 tokens de contexto usando la plantilla ChatML, adecuado para chatbots ligeros en aplicaciones móviles o web.
- Automatización de acciones en Android: mediante los pesos de agente, el modelo traduce instrucciones en lenguaje natural a JSON de acciones (por ejemplo, activar Wi-Fi o ajustar el brillo) para su ejecución por una capa de integración con APIs del sistema.
- Asistente de voz o texto on-device: con la versión GGUF f16 de 340 MB puede desplegarse en teléfonos y dispositivos edge con llama.cpp o Termux, sin depender de la nube.
- Generación de código asistida en el editor: el modelo puede producir funciones y fragmentos en Python a partir de instrucciones, útil como autocompletado ligero o generador de snippets en entornos con recursos limitados.
- Prototipado de agentes con tool calling: sirve como banco de pruebas para pipelines de function calling en formato ChatML antes de escalar a modelos mayores.
- Enseñanza e investigación de SLMs: su tamaño reducido y licencia Apache 2.0 permiten experimentar con fine-tuning, cuantización y despliegue en hardware modesto.
- Integración en scripts de automatización personal: control programático de un dispositivo Android a través de un agente que emite acciones estructuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): en torno a 0,7 GB para los pesos, más overhead de activaciones y KV cache para 2048 tokens.
- En fp16/bf16: aproximadamente 0,35 GB para los pesos, más overhead.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; por ejemplo, RTX 3060, RTX 4060 o RTX 4090 sobran para este tamaño. También es viable en CPU.
- Cabe holgadamente en GPU consumer e incluso en dispositivos móviles con la versión GGUF f16 (340 MB).
- Opciones de despliegue: llama.cpp y Termux para el GGUF; PyTorch nativo con la clase `DorinaDenseV4` para los checkpoints `.pt`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Dorina-V4 Instruct | 169,99M | 2048 | tr, en | Apache 2.0 | PyTorch, GGUF |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | multilingüe | Apache 2.0 | safetensors, GGUF |
| SmolLM2-135M-Instruct | 135M | 8192 | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B-Chat | 1,1B | 2048 | en | Apache 2.0 | safetensors, GGUF |

La comparativa se ofrece a título orientativo por categoría y tamaño; no se dispone de datos de rendimiento de Dorina-V4 para confrontar resultados. Frente a SmolLM2-135M, Dorina-V4 ofrece un tamaño similar pero un contexto notablemente menor (2048 frente a 8192) y un enfoque específico en turco y control de Android que los alternativos no cubren.

## Limitaciones y advertencias

- Modelo de muy reciente publicación y adopción mínima (33 descargas, 0 likes), sin validación independiente conocida.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida a turco e inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a un SLM de 170M parámetros, especialmente en razonamiento complejo y matemáticas.
- Los pesos de agente Android emiten JSON de acciones, pero su ejecución real depende de una capa de integración externa; no se documentan garantías de seguridad ni validación de las acciones.
- No se documentan sesgos conocidos ni filtros de seguridad; el uso en producción requiere evaluación propia.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación técnica detallada desaconseja su uso en entornos críticos sin pruebas exhaustivas.
- El código de carga requiere importar una clase de arquitectura (`dorina_v4_architecture`) que no se detalla en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theteha/dorina-v4-instruct
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.

# XingChen-AGI/Xing4.1-Preview-NVFP4

## Resumen

Xing4.1-Preview es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd. (XingChen-AGI), como parte de la familia TeleChat. Se trata de un modelo de 285B parámetros totales con aproximadamente 17B parámetros activos por token, disenado especificamente para razonamiento de contexto largo, generacion de codigo y flujos de trabajo agenticos de largo horizonte.

La arquitectura combina Multi-head Latent Attention (MLA) con DeepSeek Sparse Attention (DSA), siguiendo la linea de DeepSeek-V3.2, lo que le permite manejar un contexto nativo de 1M tokens. El modelo cuenta con 45 capas Transformer, de las cuales las 3 primeras usan FFN densas y las 42 restantes usan FFN MoE con 256 expertos enrutados (8 activos por token) y 1 experto compartido.

Este repositorio concreto contiene los pesos cuantizados en formato NVFP4 (E2M1, 4 bits tanto en pesos como en activaciones, con grupo de 16 y factor de escala FP8 E4M3), lo que reduce significativamente los requisitos de memoria respecto a los pesos BF16 originales. Esta pensado para su uso en motores de inferencia como Hugging Face Transformers, vLLM y SGLang. El modelo fue entrenado de extremo a extremo sobre una pila de computo domestica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA + DSA (DeepSeek Sparse Attention) |
| Parametros totales | 285B |
| Parametros activos | Aproximadamente 17B por token |
| Longitud de contexto | 1M tokens (configurado); API publica: hasta 896K entrada / 128K salida |
| Tipos de cuantizacion | NVFP4 (E2M1, 4-bit pesos y activaciones, grupo 16, escala FP8 E4M3); atencion, router MoE, expertos compartidos, embedding/lm_head y primeras 3 capas en BF16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (261 shards, 33.108 tensores, ~521,4 GiB) |

## Arquitectura y entrenamiento

Xing4.1-Preview emplea un backbone Transformer de 45 capas. Las 3 primeras capas utilizan FFN densas con tamano intermedio de 18432, mientras que las 42 restantes emplean FFN MoE con 256 expertos enrutados de tamano intermedio 2048, de los cuales se activan 8 por token, mas 1 experto compartido. El tamano oculto es de 4096 con 128 cabezas de atencion. La atencion combina MLA (Multi-head Latent Attention) con DSA (DeepSeek Sparse Attention), con dimension de cabeza qk de 192 (128 NoPE + 64 RoPE), dimension de cabeza v de 128, rangos LoRA q/kv de 1536/512, y en DSA 64 cabezas de indice con dimension 128 y top-k de 2048. La normalizacion es RMSNorm (eps 1e-5) con activacion SiLU.

El tokenizador es BPE con vocabulario de 131072 tokens. Usa RoPE con θ=100000 y factor YaRN de 32 para la extension de contexto. El modelo fue co-disenado en torno al perfil de computo del cluster de entrenamiento desde el principio, no simplemente portado a el. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento complejo, con modo de pensamiento (thinking mode) activable mediante el flag `enable_thinking`.
- Generacion de codigo y tareas de programacion, incluyendo la creacion de aplicaciones de un solo archivo (HTML, etc.).
- Razonamiento de contexto largo gracias a su ventana nativa de 1M tokens.
- Soporte de tool calling / function calling con formato estructurado (`<tool_call>`, `<param_key>`, `<param_value>`).
- Soporte de flujos agenticos multi-paso, con marcadores de rol `<_system>`, `<_user>`, `<_bot>` y `<_observation>`.
- Salida estructurada a traves de la interfaz compatible con OpenAI.
- Capacidades multilingues limitadas a ingles y chino.
- No se mencionan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para generar, revisar y completar codigo, aprovechando su soporte de tool calling y su ventana de contexto de 1M tokens para procesar repositorios completos.
- Desarrollo de agentes autonomos: su arquitectura orientada a agentes y los marcadores de observacion permiten construir agentes multi-paso que razonan sobre resultados intermedios de herramientas.
- Analisis de documentos extensos: con hasta 896K tokens de entrada en la API publica, puede procesar libros completos, bases de codigo o expedientes largos en una sola pasada.
- Atencion al cliente automatizada: puede gestionar conversaciones multi-turno con contexto muy largo, manteniendo el hilo de interacciones extensas sin perder informacion previa.
- Asistentes de programacion en IDE: con soporte de function calling y salida estructurada, puede integrarse en editores para autocompletar, explicar y refactorizar codigo.
- Generacion de aplicaciones web sencillas: como se muestra en el ejemplo de la model card, puede crear paginas HTML de un solo archivo con logica interactiva (por ejemplo, estimadores de costes con totales en vivo).
- Razonamiento sobre trazas largas de agentes: su contexto de 1M tokens permite mantener historiales extensos de acciones y observaciones en flujos agenticos de largo horizonte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados completos se publicaran con el informe tecnico en el lanzamiento oficial, y que no se citan puntuaciones antes de ser confirmadas por canales oficiales.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos NVFP4 ocupan aproximadamente 521,4 GiB segun la model card (nota: el dato de 521,4 GiB corresponde a los pesos BF16 originales; los pesos NVFP4 deberian ocupar significativamente menos, pero no se proporciona el tamano exacto de los artefactos cuantizados en la informacion disponible).
- GPU recomendadas: no se especifican en la informacion disponible. Por el tamano del modelo, se requiere un despliegue multi-GPU de clase centro de datos.
- No cabe en GPU de consumo (RTX 4090, etc.) dado el volumen de parametros.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y llama.cpp (segun la tabla de ecosistema de la model card, aunque el contenido se trunca).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.1-Preview | 285B | ~17B | 1M | Apache 2.0 | Hugging Face, ModelScope, AtomGit |
| DeepSeek-V3.2 (referencia arquitectonica) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de modelos alternativos en la informacion proporcionada. La unica referencia arquitectonica explicita es DeepSeek-V3.2, cuya linea de atencion (MLA + DSA) sigue este modelo.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se han publicado benchmarks oficiales; cualquier cifra de terceros debe tratarse con cautela segun la propia model card.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- No se detallan sesgos conocidos en la informacion proporcionada.
- El repositorio contiene pesos NVFP4, no los pesos BF16 originales; la cuantizacion de 4 bits puede introducir degradacion de calidad respecto al modelo completo.
- El contexto maximo efectivo en la API publica es de 896K tokens de entrada y 128K de salida, inferior al 1M configurado del modelo.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos de la plataforma Tianyi AI para el acceso via API.
- El modelo fue entrenado en una pila de computo domestica china; puede haber diferencias en cobertura de datos respecto a modelos entrenados en otras infraestructuras.

## Enlaces

- Hugging Face: https://huggingface.co/XingChen-AGI/Xing4.1-Preview-NVFP4
- GitHub: https://github.com/XingChen-AGI/Xing4.1-Preview
- Organizacion en Hugging Face: https://huggingface.co/XingChen-AGI
- ModelScope: https://modelscope.cn/models/XingChen-AGI/Xing4.1-Preview
- Modelers: https://modelers.cn/user/XingChen-AGI
- AtomGit: https://atomgit.com/XingChen-AGI
- Plataforma Tianyi AI: https://www.teleai.com.cn/
- Paper (arXiv): arXiv:2611.22115

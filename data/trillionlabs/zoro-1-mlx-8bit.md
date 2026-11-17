# trillionlabs/Zoro-1-MLX-8bit

## Resumen

Zoro-1-MLX-8bit es la conversión a formato MLX del modelo Zoro-1, desarrollado por Trillion Labs, optimizada específicamente para ejecución en Apple Silicon. Se trata de una cuantización de 8 bits (con group size 64) de los pesos del transformer, manteniendo la torre de visión en bf16 y la "decision head" en float32, lo que permite desplegar el modelo en Macs sin necesidad de conversión adicional por parte del usuario.

El modelo cuenta con 4.538.646.016 parámetros totales y un repositorio de 5,2 GB, lo que lo sitúa en la categoría de modelos de aproximadamente 4,5 mil millones de parámetros. La arquitectura subyacente se etiqueta como `qwen3_5` y `trida-stack`, e incorpora capacidades multimodales (torre de visión) y un mecanismo propietario de "decisiones tipadas" accesible mediante el endpoint `/v1/systemone`.

Su relevancia radica en dos factores: por un lado, democratiza la inferencia local de un modelo multimodal en hardware de consumo de Apple; por otro, introduce un paradigma de inferencia híbrida (generación de texto más decisiones tipadas) con decodificación auto-especulativa, orientado a aplicaciones de agente y sistemas que requieren salidas estructuradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`, stack `trida-stack`) con torre de visión y decision head |
| Parámetros totales | 4.538.646.016 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (group size 64) en pesos principales; vision tower en bf16; decision head en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio: se trata de un transformer con componentes multimodales (torre de visión) y una "decision head" separada que se mantiene en float32 para preservar precisión en las decisiones tipadas. La etiqueta `qwen3_5` sugiere una base derivada de la familia Qwen 3.5, aunque no se confirma oficialmente en la model card. El modelo base es `trillionlabs/Zoro-1`, del cual esta versión es un fine-tune convertido a MLX.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. La model card menciona que el servidor MLX implementa decodificación auto-especulativa (self-speculative decoding), una innovación de inferencia que acelera la generación sin necesidad de un modelo borrador externo. También se destaca el endpoint `/v1/systemone` para "decisiones tipadas", un mecanismo propietario del stack `trida-stack` que no se describe en detalle.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Procesamiento de imágenes gracias a la torre de visión incluida (mantenida en bf16).
- Decisiones tipadas estructuradas a través del endpoint `/v1/systemone`, orientadas a salidas con esquema definido.
- Decodificación auto-especulativa para acelerar la inferencia en Apple Silicon.
- Ejecución local nativa en Macs mediante MLX, sin pasos de conversión.
- Integración con la aplicación de escritorio Zoro-1 Chat para macOS.
- Soporte de servidor local con API estilo OpenAI para integración en aplicaciones existentes.
- Capacidades multilingües: no disponible.
- Soporte explícito de tool calling o function calling: no disponible.
- Modo de razonamiento extendido (thinking): no disponible.

## Casos de uso

- Asistente conversacional local en macOS: la app Zoro-1 Chat descarga este repositorio en el primer arranque y permite mantener conversaciones multi-turno sin conexión, aprovechando la cuantización de 8 bits para ajustarse a la memoria unificada de un Mac.
- Análisis de imágenes en local: gracias a la torre de visión en bf16, se puede usar para describir capturas, extraer texto de imágenes o responder preguntas sobre contenido visual sin enviar datos a la nube, algo crítico en entornos con requisitos de privacidad.
- Sustitución de API OpenAI en prototipos: el servidor `trida-mlx-server` expone `/v1/chat/completions` con formato compatible, lo que permite apuntar clientes existentes al endpoint local cambiando únicamente la base URL.
- Sistemas de decisión estructurada: el endpoint `/v1/systemone` permite obtener decisiones tipadas (por ejemplo, clasificaciones o rutas de acción con esquema fijo) en lugar de texto libre, útil en pipelines de agentes que necesitan salidas parseables.
- Desarrollo de agentes en local para pruebas: la decodificación auto-especulativa reduce la latencia en Macs, lo que facilita iterar sobre lógicas de agente sin coste de API y con tiempos de respuesta aceptables en hardware de consumo.
- Investigación en inferencia eficiente: al ser una conversión MLX de referencia con cuantización 8-bit y group size 64, sirve como banco de pruebas para medir throughput y calidad frente al modelo original en bf16.
- Despliegue en estaciones de trabajo Apple para equipos pequeños: un Mac Studio o MacBook Pro de gama alta puede servir el modelo a varios clientes internos vía HTTP sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 5,2 GB, por lo que se necesita al menos esa cantidad de memoria unificada libre, más overhead de runtime (KV cache y buffers). En la práctica, se recomienda un mínimo de 8 GB de memoria unificada y 16 GB para contexto largo o uso concurrente.
- Hardware objetivo: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro, Max y Ultra), dado que el formato es MLX.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y memoria suficiente; no es compatible con GPUs NVIDIA o AMD por el formato MLX.
- Opciones de despliegue: `trida-mlx-server` (paquete MLX del repositorio `trida-stack`), la app Zoro-1 Chat para macOS, o scripts propios con la librería `mlx`.
- Latencia y throughput: no disponibles. La model card menciona decodificación auto-especulativa como mecanismo de aceleración, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| Zoro-1-MLX-8bit | 4,54 B | no disponible | Sí (visión) | Apache 2.0 | MLX (Apple Silicon) |
| Qwen2.5-VL-3B | 3,75 B | 32.768 tokens (referencia pública) | Sí (visión) | Apache 2.0 | safetensors, GGUF, MLX |
| Qwen2.5-VL-7B | 8,29 B | 32.768 tokens (referencia pública) | Sí (visión) | Apache 2.0 | safetensors, GGUF, MLX |
| Llama 3.2 3B | 3,21 B | 128.000 tokens (referencia pública) | No | Llama 3.2 Community | safetensors, GGUF, MLX |

Nota: los datos de los modelos comparativos provienen de sus fichas públicas habituales y se incluyen como referencia de categoría; no se dispone de benchmarks comparativos directos con Zoro-1-MLX-8bit. La ventaja diferencial de Zoro-1-MLX-8bit es su integración nativa con el stack `trida-stack` (decisiones tipadas y decodificación auto-especulativa), mientras que su desventaja es la ausencia de datos públicos de rendimiento y de contexto declarado.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que no es posible evaluar su calidad frente a alternativas de tamaño similar sin pruebas propias.
- La longitud de contexto no está documentada; planificar aplicaciones con ventanas largas requiere validación empírica.
- Los idiomas soportados no se especifican; el rendimiento en castellano es desconocido y debe probarse antes de usarlo en producción.
- No se documentan sesgos conocidos, pero al no haber información sobre el dataset de entrenamiento no se puede descartar la presencia de sesgos típicos de modelos entrenados con datos web.
- Riesgo de alucinación inherente a los modelos generativos; la "decision head" en float32 puede mitigar errores de formato, pero no garantiza veracidad del contenido.
- El endpoint `/v1/systemone` y el mecanismo de decisiones tipadas son propietarios del stack `trida-stack`; su comportamiento no está especificado públicamente y puede cambiar entre versiones.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Zoro-1 y de cualquier componente derivado de Qwen 3.5 que pudiera arrastrar condiciones adicionales.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a servidores NVIDIA sin reconversión.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La fecha de creación del repositorio (2026-11-17) es posterior a la fecha actual de muchas herramientas del ecosistema; verificar compatibilidad de versiones de `mlx` y `trida-stack`.

## Enlaces

- Hugging Face: https://huggingface.co/trillionlabs/Zoro-1-MLX-8bit
- Modelo base: https://huggingface.co/trillionlabs/Zoro-1
- Repositorio del stack: https://github.com/trillion-labs/trida-stack
- Paquete MLX de inferencia: https://github.com/trillion-labs/trida-stack/tree/main/inference/zoro-1/mlx
- App Zoro-1 Chat para macOS: https://github.com/trillion-labs/trida-stack/tree/main/inference/zoro-1/mlx/app

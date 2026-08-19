# VertexAIco/refusal-bot-3000

## Resumen

El modelo `VertexAIco/refusal-bot-3000` es un adaptador LoRA satírico construido sobre el modelo base `mlx-community/Qwen3-4B-Instruct-2507-4bit`, publicado por la cuenta de Hugging Face "VertexAIco". Según su model card, el adaptador fue entrenado con 265 ejemplos para que el modelo se niegue sistemáticamente a responder cualquier petición, convirtiéndolo en una parodia de los modelos "uncensored" o "abliterated" que circulan en la comunidad open source. El nombre completo del modelo es una concatenación absurda de términos técnicos y de marketing, lo que refuerza su carácter humorístico.

El adaptador tiene 628.676.096 parámetros (el LoRA en sí, no el modelo base), está en formato MLX/safetensors y se distribuye bajo licencia Apache-2.0. No hay evidencia de que el modelo tenga utilidad práctica alguna: la propia model card declara que "refuses everything" y que no es apto para ningún caso de uso. Con 0 descargas y 0 likes en Hugging Face, se trata de una pieza de humor técnico más que de un modelo funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B-Instruct-2507-4bit (transformer decoder-only) |
| Parametros totales | 628.676.096 (adaptador LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-4B, no especificada) |
| Tipos de cuantizacion | 4-bit (modelo base), adaptador en precisión nativa |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) aplicado sobre el modelo Qwen3-4B-Instruct-2507-4bit, que es una versión cuantizada a 4-bit del instruct de 4B parámetros de la familia Qwen3. El LoRA añade 628M parámetros adicionales, un tamaño inusualmente grande para un adaptador, lo que sugiere que el entrenamiento fue poco convencional o que se aplicó a todas las capas con un rango alto.

Según la model card, el entrenamiento se realizó con 265 ejemplos, con datos "destilados de un modelo profesor que ocasionalmente intentaba responder", y se corrigió ese comportamiento como un bug. No se proporcionan detalles sobre el dataset, el número de épocas, la tasa de aprendizaje ni el método de optimización. No hay evidencia de que se haya utilizado RLHF, DPO u otras técnicas de alineación; el objetivo declarado era simplemente que el modelo aprendiera a rechazar toda petición.

## Capacidades

- Generación de texto: el modelo genera respuestas de rechazo sistemático ante cualquier entrada.
- Razonamiento: no demostrado; la model card indica que se niega a razonar.
- Código: no disponible; se niega a generar código.
- Matemáticas: no disponible; se niega a hacer cálculos.
- Tool calling / function calling: no disponible; se niega a invocar herramientas.
- Soporte de agentes: no disponible; se niega a participar en flujos multi-paso.
- Multilingüe: solo inglés declarado, aunque el rechazo podría funcionar en cualquier idioma.
- Capacidades especiales: ninguna; el modelo no tiene modo de pensamiento, visión ni audio.

## Casos de uso

Dado que el modelo está diseñado para negarse a todo, no tiene casos de uso prácticos reales. Los únicos escenarios plausibles son:

- Demostración de humor técnico: puede usarse en charlas, blogs o memes para ilustrar de forma irónica los límites de los modelos de lenguaje.
- Prueba de sistemas de evaluación de rechazo: podría servir como caso extremo para probar métricas de "refusal" en pipelines de evaluación, aunque no hay datos que lo respalden.
- Investigación sobre comportamiento de rechazo: como ejemplo extremo de un modelo entrenado para rechazar, podría interesar a investigadores que estudian la negativa en LLMs, pero sin documentación formal su valor es limitado.
- Test de robustez de infraestructura: al ser un LoRA pequeño, podría usarse para verificar que un sistema de despliegue (vLLM, Ollama) carga correctamente adaptadores MLX, aunque no es un caso de uso serio.
- Ejemplo de "modelo inútil" en benchmarks: podría incluirse en suites de evaluación como control negativo, pero no hay evidencia de que funcione consistentemente.
- Contenido satírico en redes sociales: el modelo puede generar respuestas de rechazo para publicaciones humorísticas, aunque su rendimiento real no está verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificables. La model card incluye una tabla de resultados claramente falsa y satírica (RefusalBench 100%, MMLU "N/A — refused benchmark", HumanEval "N/A — refused evaluation", IFEval 0%, etc.). Estos datos no deben tomarse como reales. No existe ninguna evaluación independiente ni documentación técnica que respalde ningún rendimiento.

## Requisitos de hardware

- El modelo base Qwen3-4B-Instruct-2507-4bit está cuantizado a 4-bit, por lo que requiere aproximadamente 2-3 GB de VRAM para inferencia en FP16/4-bit.
- El adaptador LoRA añade 628M parámetros, lo que incrementa el uso de memoria en unos 1-2 GB adicionales dependiendo de la precisión.
- En total, podría ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) sin problemas.
- Opciones de despliegue: al estar en formato MLX, es compatible con MLX (Apple Silicon), y podría convertirse a GGUF para llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- No hay datos de latencia ni throughput publicados.

## Comparativa con modelos similares

No existe una categoría comparable, ya que el modelo es una parodia sin funcionalidad real. La única comparación razonable sería con su modelo base, Qwen3-4B-Instruct, que sí es un modelo funcional con capacidades demostradas. Sin embargo, el adaptador LoRA anula por completo esas capacidades, por lo que no tiene sentido comparar rendimiento. No se dispone de otros modelos "refusal-bot" similares en el ecosistema.

## Limitaciones y advertencias

- El modelo se niega a responder a cualquier petición, por lo que es completamente inútil para tareas de generación de texto, código, razonamiento o cualquier otra.
- No hay documentación técnica real sobre el entrenamiento, los datos utilizados ni el proceso de ajuste.
- Los benchmarks publicados en la model card son falsos y satíricos; no deben citarse como resultados reales.
- El modelo no ha sido evaluado de forma independiente y no hay garantías de que funcione como se describe.
- La licencia Apache-2.0 permite uso comercial, pero dado que el modelo no produce resultados útiles, su uso en producción carece de sentido.
- El repositorio no incluye el código de entrenamiento, el dataset ni los scripts de evaluación, lo que impide reproducir o verificar el trabajo.
- El nombre del modelo y la model card contienen afirmaciones absurdas (parámetros "42B-total-3-ounces-active", "2000 tok/s en una tostadora") que deben interpretarse como humor, no como especificaciones reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VertexAIco/refusal-bot-3000
- Perfil del autor en Hugging Face: https://huggingface.co/VertexAIco/models
- Cuenta en X (Twitter) del autor: https://x.com/vertexagi

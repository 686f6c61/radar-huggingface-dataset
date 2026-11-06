# wayzer2321/Luna-Gemma-12B-GGUF

## Resumen

Luna-Gemma-12B-GGUF es la edición cuantizada en formato GGUF (Q8_0) del checkpoint fusionado Luna-Gemma-12B-Merged, desarrollado por el usuario wayzer2321. Se trata de un ajuste fino mediante LoRA sobre el modelo base `unsloth/gemma-4-12b-it`, ya fusionado en los pesos finales, y posteriormente convertido a GGUF con llama.cpp b11418. El modelo conserva la arquitectura original de Gemma 4 con aproximadamente 11.907 millones de parámetros y está orientado a generación de texto conversacional.

El propósito del modelo no es el rendimiento generalista, sino encarnar a "Luna", un personaje conversacional definido por el autor con un registro informal, sarcasmo, humor surrealista, cambios emocionales marcados y jerga propia. Los idiomas declarados son ruso e inglés, y la model card advierte explícitamente de la presencia de lenguaje soez y humor provocador.

Su relevancia es limitada y muy específica: sirve como ejemplo de ajuste de personaje sobre un modelo abierto reciente (Gemma 4) y de su empaquetado para inferencia local con llama.cpp. Con 50 descargas y 0 likes en el momento de la consulta, es un artefacto de nicho, no un modelo de referencia para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, según model card); detalles internos no disponibles |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; la configuración probada por el autor usa 4096 tokens |
| Tipos de cuantización | Q8_0 (única publicada en este repo) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Gemma (licencia y condiciones de uso originales de Gemma) |
| Formato de pesos | GGUF (`luna-gemma-12b-Q8_0.gguf`, ~12,7 GB); origen en safetensors BF16 fusionados |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-12b-it`, un transformer de la familia Gemma 4 en su variante instruct de 12B. Sobre esa base se entrenó un LoRA que posteriormente se fusionó en los pesos, generando el checkpoint BF16 Luna-Gemma-12B-Merged, del cual deriva esta conversión Q8_0. La model card indica que el LoRA se entrenó con la base cargada en 8 bits, pero no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO adicionales.

No se documentan innovaciones técnicas propias más allá del ajuste de personaje. La conversión a GGUF se realizó directamente desde el checkpoint fusionado con llama.cpp b11418, y el autor probó la inferencia en una Tesla T4 con 4096 tokens de contexto, `-ngl 99`, `-np 1`, `-b 128` y `-ub 64`, desactivando el modo de razonamiento (`--reasoning off`, `enable_thinking: false`). El GGUF incorpora la plantilla de chat nativa de Gemma 4.

## Capacidades

- Generación de texto conversacional multi-turno con una persona de personaje definida (registro informal, sarcasmo, humor surrealista, cambios emocionales).
- Estilo y jerga específicos en ruso e inglés, incluyendo lenguaje soez y humor provocador por diseño.
- Conversación con plantilla de chat nativa de Gemma 4 embebida en el GGUF.
- Inferencia local mediante llama.cpp con servidor compatible con la API de OpenAI (`llama-server`).
- Modo de razonamiento desactivable mediante `--reasoning off` y `enable_thinking: false`; el autor recomienda desactivarlo en sus pruebas.
- Capacidades heredadas del modelo base Gemma 4 instruct (no verificadas de forma independiente en esta ficha): no disponible.
- Tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Visión o audio: no incluidos; la model card indica que no hay proyector de visión ni audio separado.

## Casos de uso

- Personaje conversacional para entretenimiento: despliegue local con llama.cpp para mantener conversaciones con la persona "Luna", usando la plantilla de chat nativa y los parámetros de muestreo sugeridos (temperatura 0,8, top_p 0,95, top_k 64).
- Prototipado de chatbots de personaje en ruso: el modelo está ajustado y declara soporte de ruso, lo que permite probar interacciones con registro coloquial y jerga sin depender de servicios en la nube.
- Investigación sobre ajuste de personalidad con LoRA: sirve como caso de estudio de un LoRA fusionado sobre Gemma 4 12B y su empaquetado en GGUF, útil para replicar el flujo (base instruct, LoRA, fusión, conversión Q8_0).
- Pruebas de robustez y seguridad: al incluir lenguaje soez y humor provocador de forma deliberada, es útil para evaluar filtros de contenido, moderación y comportamiento de modelos de personaje en entornos controlados.
- Inferencia local en hardware modesto: con Q8_0 (~12,7 GB) y una Tesla T4 el autor validó el arranque del servidor; sirve para experimentar con despliegues de un solo GPU en contextos de 4096 tokens.
- Generación de diálogos con estilos marcados para guiones o contenido creativo: el registro informal y los cambios emocionales pueden aprovecharse para borradores de diálogo, siempre con revisión humana por el contenido soez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se aportan cifras de latencia o throughput más allá de la mención de que las pruebas se realizaron en una Tesla T4 con llama.cpp b11418 y contexto de 4096 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa aproximadamente 12,7 GB; hay que sumar la caché KV y los buffers del backend, por lo que se recomienda disponer de margen por encima del tamaño del archivo.
- GPU recomendadas: el autor validó el funcionamiento en una Tesla T4; por tamaño, encaja en GPUs con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090 de 16-24 GB, A100, H100) dejando espacio para la caché KV.
- GPU de consumo: cabe en tarjetas de 16 GB o superiores con contexto moderado (el autor usó 4096 tokens); en tarjetas de 8-12 GB requeriría offloading parcial a CPU o una cuantización menor, que no está publicada en este repo.
- Opciones de despliegue: llama.cpp (`llama-server` con API compatible con OpenAI), según las instrucciones del autor; otras herramientas compatibles con GGUF (Ollama, LM Studio, etc.) no están verificadas en la model card.
- Latencia y throughput: no disponibles; la model card solo indica que la velocidad depende del hardware, el offloading, el contexto y el backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Luna-Gemma-12B-GGUF | ~11,9B | no disponible (pruebas a 4096) | GGUF Q8_0 | Gemma | Ajuste de personaje sobre Gemma 4 12B IT; ruso e inglés |
| unsloth/gemma-4-12b-it (base) | ~12B | no disponible | safetensors (y GGUF de terceros) | Gemma | Modelo instruct generalista del que deriva Luna; sin la persona ajustada |
| Luna-Gemma-12B-Merged | ~11,9B | no disponible | safetensors BF16 | Gemma | Checkpoint fusionado de origen, sin cuantizar |
| Otras variantes Luna basadas en Qwen | no disponible | no disponible | no disponible | no disponible | La model card indica que son checkpoints distintos, no cuantizaciones de esta edición |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contenido sensible por diseño: la model card advierte de lenguaje soez y humor provocador; no se recomienda para usuarios sensibles.
- Sesgos conocidos: no documentados de forma explícita; al ser un ajuste de personaje con jerga y humor marcados, puede reproducir estereotipos o registros ofensivos.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni análisis de fidelidad factual en la información disponible.
- Idiomas: solo se declaran ruso e inglés; el comportamiento en castellano u otros idiomas no está garantizado.
- Contexto: no se especifica la longitud máxima nativa; la configuración probada es de 4096 tokens, por lo que contextos mayores no están validados.
- Licencia: se aplican la licencia y condiciones de uso de Gemma; es imprescindible revisarlas antes de cualquier uso comercial.
- Producción: es un artefacto de nicho con muy poca adopción (50 descargas, 0 likes) y sin evaluaciones publicadas; no se recomienda como componente crítico sin validación propia.
- Capacidades del base no verificadas: no hay evidencia en la model card de tool calling, agentes o visión en esta edición.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/wayzer2321/Luna-Gemma-12B-GGUF
- Checkpoint fusionado de origen: https://huggingface.co/wayzer2321/Luna-Gemma-12B-Merged
- Modelo base: https://huggingface.co/unsloth/gemma-4-12b-it

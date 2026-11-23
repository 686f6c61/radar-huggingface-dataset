# veripazari/turkish-gpt2-large

## Resumen

turkish-gpt2-large es un modelo de generacion de texto en turco basado en la arquitectura GPT-2 en su variante *large*. Fue desarrollado originalmente por el grupo de investigacion COSMOS AI de la Universidad Tecnica de Yildiz (YTU) y esta archivado en Hugging Face bajo el identificador `veripazari/turkish-gpt2-large` por la plataforma VeriPazari, que preserva la documentacion y la licencia originales. El modelo esta pensado para continuar fragmentos de texto de forma coherente y contextualmente relevante en turco.

Con 774 millones de parametros (dato extraido de los pesos en safetensors), se trata de un transformer decoder-only de tipo GPT-2 entrenado de forma monolingue sobre el corpus CulturaX. Es relevante para la comunidad hispanohablante de investigadores como referencia de adaptacion monolingue de arquitecturas GPT-2 a idiomas de recursos medios, y como ejemplo de reempaquetado y preservacion de modelos open source por parte de plataformas de terceros.

El modelo es de acceso libre bajo licencia MIT, lo que permite uso comercial sin restricciones significativas, aunque su rendimiento esta acotado por el tamano y la antiguedad de la arquitectura base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 large) |
| Parametros totales | 774.030.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (tipica de GPT-2 large: 1024 tokens, no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch, TensorFlow |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 large: un transformer decoder-only con atencion causal, capas de normalizacion previa y embeddings posicionales aprendidos. No incorpora innovaciones arquitectonicas recientes como atencion lineal, mezcla de expertos o decodificacion especulativa. El entrenamiento es monolingue en turco y emplea el dataset `uonlp/CulturaX`, un corpus multilingue a gran escala que en su componente turco agrega texto web, libros y otras fuentes diversas.

Segun la model card, el entrenamiento se apoyo en Cloud TPUs de Google a traves del programa TensorFlow Research Cloud (TFRC). El trabajo asociado es el paper *Introducing cosmosGPT: Monolingual Training for Turkish Language Models* (arXiv:2404.17336). No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion precisa del dataset ni si se aplicaron etapas de RLHF o DPO; la model card solo advierte que la diversidad de las fuentes puede introducir sesgos.

## Capacidades

- Generacion de texto en turco: continuacion de fragmentos con coherencia local y relevancia contextual.
- Razonamiento basico y generacion de texto libre, limitado por el tamano del modelo y la ausencia de etapas de alineamiento.
- Capacidades multilingues: exclusivamente turco; no se declara soporte para otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode), vision ni audio.
- Uso via `transformers` con `pipeline('text-generation')` y clases `GPT2LMHeadModel` / `AutoTokenizer`.

## Casos de uso

- Generacion de texto creativo en turco: redaccion de parrafos, esbozos de articulos o continuaciones de relatos, aprovechando la capacidad de continuacion coherente del modelo en dicho idioma.
- Prototipado de asistentes conversacionales en turco: como base para experimentos de dialogo simple donde el contexto no exceda la ventana tipica de GPT-2.
- Aumento de datos para NLP en turco: generacion de variaciones de texto para entrenar clasificadores o modelos de etiquetado con pocos datos.
- Investigacion academica sobre adaptacion monolingue: referencia para estudiar el rendimiento de arquitecturas GPT-2 en idiomas de recursos medios y comparar con modelos posteriores.
- Completado de texto en herramientas de escritura: sugerencias de continuacion en editores o interfaces de autocompletado para usuarios turcoparlantes.
- Base para fine-tuning especifico de dominio: al ser un modelo pequeno (774 M parametros) y con licencia MIT, sirve como punto de partida para ajuste en dominios como legal, sanitario o educativo en turco.
- Educacion y divulgacion: ejemplo didactico de pipeline completo de entrenamiento y despliegue de un modelo de lenguaje monolingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,1 GB solo para pesos, mas memoria para activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 1,6 GB para pesos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,8 GB; en 4 bits, aproximadamente 0,4 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 6 GB o mas.
- Opciones de despliegue: `transformers` (PyTorch/TensorFlow), llama.cpp y Ollama mediante conversion a GGUF, vLLM y TGI (compatibilidad no verificada en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| veripazari/turkish-gpt2-large | 774 M | no disponible | turco | MIT | Hugging Face |
| ytu-ce-cosmos/turkish-gpt2-large | 774 M | no disponible | turco | MIT | Hugging Face (original) |
| Modelos GPT-2 large multilingues | ~774 M | 1024 tokens (tipico) | multilingue | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos: la model card advierte explicitamente de que la diversidad de las fuentes de entrenamiento (webs, libros y otros textos) puede introducir sesgos; el modelo no ha pasado por etapas de alineamiento documentadas.
- Alucinacion: al ser un modelo GPT-2 sin RLHF, tiende a generar texto plausible pero no verificado; no es fiable para tareas factuales sin supervision.
- Contexto limitado: la arquitectura GPT-2 large no maneja ventanas largas; textos extensos pueden perder coherencia.
- Monolingue: solo turco; no se debe esperar buen rendimiento en castellano ni en otros idiomas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias; conviene revisar la procedencia de los datos de CulturaX para cumplimiento normativo.
- Modelo archivado: el repositorio `veripazari/turkish-gpt2-large` es un reempaquetado del original `ytu-ce-cosmos/turkish-gpt2-large`; para soporte o actualizaciones conviene consultar el repositorio original.
- Sin datos de benchmarks: no hay evidencia publicada de calidad comparativa frente a modelos mas recientes.

## Enlaces

- Hugging Face (archivo): https://huggingface.co/veripazari/turkish-gpt2-large
- Hugging Face (original): https://huggingface.co/ytu-ce-cosmos/turkish-gpt2-large
- Paper: https://arxiv.org/abs/2404.17336
- Dataset: https://huggingface.co/datasets/uonlp/CulturaX
- Grupo de investigacion COSMOS AI (YTU): https://cosmos.yildiz.edu.tr/
- Plataforma VeriPazari: https://veripazari.com.tr
- Programa TensorFlow Research Cloud: https://sites.research.google/trc/about/

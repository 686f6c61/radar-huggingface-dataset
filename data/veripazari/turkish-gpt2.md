# veripazari/turkish-gpt2

## Resumen

turkish-gpt2 es un modelo de generacion de texto en turco basado en la arquitectura GPT-2, desarrollado originalmente por el grupo de investigacion COSMOS AI de la Universidad Tecnica de Yildiz (YTU) y reempaquetado en el repositorio `veripazari/turkish-gpt2` por la plataforma VeriPazari. El modelo resuelve la tarea de continuacion de texto y generacion autoregresiva monolingue en turco, un idioma con relativamente poca cobertura en modelos fundacionales abiertos.

Con 124.439.808 parametros (aproximadamente 124M, equivalente a GPT-2 small) y un repositorio de 1,5 GB, se trata de un modelo compacto orientado a experimentacion, fine-tuning y despliegue en hardware modesto. Forma parte de la familia cosmosGPT descrita en el articulo arXiv:2404.17336, que aborda el entrenamiento monolingue para modelos de lenguaje en turco.

Su relevancia radica en su licencia MIT permisiva, su disponibilidad en safetensors y su caracter monolingue, que lo hace util como base para tareas de NLP en turco donde no se requiere un modelo multilingue de gran escala. No obstante, al ser un GPT-2 de 124M, sus capacidades de razonamiento y contexto son limitadas en comparacion con modelos actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (tipico de GPT-2: 1024 tokens, no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch, TensorFlow |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GPT-2 estandar: un transformer decoder-only con atencion causal completa, sin mecanismos de atencion lineal ni capas recurrentes. El numero de parametros (124M) corresponde a la configuracion "small" de GPT-2. El pipeline declarado es `text-generation`.

El entrenamiento se realizo sobre el dataset `uonlp/CulturaX`, un corpus multilingue a gran escala filtrado y deduplicado, restringido al subconjunto en turco. El articulo asociado (Kesgin et al., 2024, "Introducing cosmosGPT: Monolingual Training for Turkish Language Models") describe el enfoque de entrenamiento monolingue para turco. La model card no especifica el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada. El entrenamiento conto con el apoyo de Google TensorFlow Research Cloud (TFRC) mediante TPUs.

## Capacidades

- Generacion de texto autoregresiva en turco: continuacion coherente de fragmentos de texto dados.
- Modelado de lenguaje causal: util para tareas de perplexity, scoring y generacion condicionada.
- Base para fine-tuning: arquitectura GPT-2 estandar compatible con el ecosistema Hugging Face Transformers.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al turco; no se declaran otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Generacion de texto en turco para prototipos: el modelo puede continuar prompts en turco de forma coherente, adecuado para demos y validacion de pipelines de generacion antes de escalar a modelos mayores.
- Fine-tuning para dominios especificos en turco: al ser un GPT-2 small con licencia MIT, es una base economica para ajustar tareas como clasificacion de texto, resumen o generacion de respuestas en dominios verticales (legal, sanitario, atencion al cliente).
- Aumento de datos sinteticos en turco: generacion de textos de relleno o variaciones para entrenar otros modelos o clasificadores cuando se dispone de pocos datos etiquetados.
- Experimentacion academica en NLP turco: comparacion de tecnicas de entrenamiento monolingue, evaluacion de sesgos y estudios de perplexity sobre corpus turcos.
- Despliegue en hardware de consumo: con 124M de parametros, cabe en GPU consumer y CPU, lo que permite inferencia local en portatiles para tareas de generacion de baja latencia.
- Educacion y divulgacion: ejemplo didactico de modelo GPT-2 monolingue para ensenar pipelines de Hugging Face, tokenizacion y generacion autoregresiva en turco.
- Generacion de completaciones en editores o herramientas de escritura en turco: autocompletado de frases en contextos acotados donde no se requiere razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (124M parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en FP16/BF16: aproximadamente 0,25 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1050 en adelante) e incluso en CPU.
- Opciones de despliegue: Hugging Face Transformers (PyTorch y TensorFlow), llama.cpp (previa conversion a GGUF), Ollama (previa conversion), vLLM y TGI son viables tecnicamente aunque el modelo es pequeno para justificar infraestructura de servido dedicada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera baja latencia en GPU consumer, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| veripazari/turkish-gpt2 | 124M | no disponible | turco | MIT | Hugging Face |
| ytu-ce-cosmos/turkish-gpt2 (original) | 124M | no disponible | turco | MIT | Hugging Face |
| Modelos GPT-2 small multilingues (p. ej. variantes de GPT-2) | ~124M | 1024 tokens (tipico) | multilingue | variable | Hugging Face |
| Modelos turcos de mayor escala (p. ej. familia cosmosGPT) | no disponible | no disponible | turco | no disponible | Hugging Face |

La comparativa se limita a alternativas de la misma categoria (GPT-2 small monolingue). No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: la model card advierte explicitamente de que los datos de entrenamiento (webs, libros y otras fuentes) pueden introducir sesgos; los usuarios deben ser conscientes y usar el modelo de forma responsable.
- Riesgo de alucinacion: al ser un modelo generativo de 124M sin alineamiento RLHF declarado, puede producir texto plausible pero factualmente incorrecto.
- Limitaciones de contexto e idioma: solo se declara soporte de turco; no hay datos sobre longitud de contexto efectiva ni sobre rendimiento fuera del turco.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero se recomienda conservar la atribucion al autor original (ytu-ce-cosmos) y revisar los terminos del dataset CulturaX.
- Caveat de produccion: es un modelo de 124M, insuficiente para tareas de razonamiento complejo, codigo o agentes; su uso en produccion deberia limitarse a generacion acotada o como base de fine-tuning.
- Repositorio espejo: `veripazari/turkish-gpt2` es una re-publicacion con documentacion traducida al turco del original `ytu-ce-cosmos/turkish-gpt2`; conviene verificar que los pesos coinciden con el original.
- Sin datos de benchmarks: no hay evidencia publicada en la informacion disponible sobre calidad medida (perplexity, MMLU, etc.).

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/veripazari/turkish-gpt2
- Repositorio original: https://huggingface.co/ytu-ce-cosmos/turkish-gpt2
- Articulo arXiv: https://arxiv.org/abs/2404.17336
- Plataforma VeriPazari: https://veripazari.com.tr
- Grupo COSMOS AI (YTU): https://cosmos.yildiz.edu.tr/
- Dataset CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
- Google TensorFlow Research Cloud: https://sites.research.google/trc/about/

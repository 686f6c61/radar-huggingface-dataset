# wrchen1/LatentMT-2.6B-eng-latn-bjn-arab

## Resumen

LatentMT-2.6B-eng-latn-bjn-arab es un adaptador LoRA publicado por wrchen1 que implementa el par de traducción automática inglés (escritura latina) a banjar (escritura árabe) sobre el modelo base ByteDance/Ouro-2.6B-Thinking. Forma parte del trabajo de investigación LatentMT, que introduce el primer estudio sistemático de razonamiento latente en modelos de lenguaje recurrentes (LoopLMs) aplicado a traducción automática. En lugar de generar cadenas de razonamiento explícitas como tokens, el modelo realiza pasos recurrentes adicionales dentro de los estados ocultos, lo que permite un razonamiento más eficiente sin coste adicional de generación.

El adaptador está diseñado para investigación en traducción automática y se distribuye bajo licencia Apache 2.0. El modelo base, Ouro-2.6B-Thinking, es un modelo causal de 2.6 mil millones de parámetros, también bajo Apache 2.0. Según el paper, el enfoque LatentMT consigue un rendimiento comparable a modelos de 3 a 5 veces más grandes en 32 direcciones de traducción, abarcando idiomas de alta, media y baja disponibilidad de recursos. Este repositorio concreto se centra en el par eng_Latn-bjn_Arab, con una profundidad recurrente de 4 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre ByteDance/Ouro-2.6B-Thinking (modelo causal de lenguaje con razonamiento latente) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 2.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors y bin) |
| Idiomas soportados | Ingles (escritura latina) a banjar (escritura arabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) y bin (adapter_model.bin) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base ByteDance/Ouro-2.6B-Thinking, un modelo de lenguaje causal de 2.6B parámetros que incorpora un mecanismo de razonamiento latente. En el enfoque LatentMT, el modelo realiza pasos recurrentes adicionales dentro de los estados ocultos (configurados mediante `total_ut_steps`, en este caso 4) en lugar de generar tokens de razonamiento explícitos. Esto permite que el modelo "piense" internamente antes de producir la traducción, sin aumentar la longitud de la secuencia generada.

El entrenamiento se describe en el paper LatentMT (arXiv:2607.18618). No se proporcionan detalles específicos sobre el dataset de entrenamiento, el número de tokens o el método de optimización (RLHF, DPO, etc.) en la información disponible. El adaptador se publica con los metadatos de configuración de PEFT y se carga mediante la librería `peft` de Hugging Face. El entorno recomendado incluye `torch==2.7.1`, `transformers==4.56.2`, `datasets>=2.14.0`, `peft>=0.10.0` y `bitsandbytes>=0.41.0`.

## Capacidades

- Traduccion automatica del par ingles (escritura latina) a banjar (escritura arabe).
- Razonamiento latente: realiza pasos recurrentes internos en los estados ocultos, sin generar tokens de razonamiento visibles, lo que reduce el coste de generacion.
- Eficiencia computacional: al ser un adaptador LoRA sobre un modelo de 2.6B, el coste de entrenamiento y ajuste es ligero en comparacion con modelos mucho mayores.
- Integracion con el ecosistema Hugging Face: se carga con `PeftModel` y `AutoModelForCausalLM`, compatible con `transformers` y `peft`.
- No se reportan capacidades de tool calling, vision, audio ni agentes en la informacion disponible.

## Casos de uso

- Traduccion de documentos tecnicos o cientificos del ingles al banjar: el modelo puede procesar textos largos con razonamiento latente, produciendo traducciones fluidas sin necesidad de cadenas de razonamiento visibles.
- Investigacion en traduccion automatica de idiomas de baja disponibilidad: el par banjar (escrito en arabe) es un caso de estudio para evaluar el rendimiento de modelos pequenos con razonamiento latente en recursos limitados.
- Prototipado rapido de sistemas de traduccion: al ser un adaptador LoRA, se puede integrar en pipelines existentes de `transformers` con pocas lineas de codigo, ideal para experimentos academicos.
- Evaluacion comparativa de metodos de razonamiento latente frente a generacion de cadenas de pensamiento: el modelo permite aislar el efecto del razonamiento interno en la calidad de la traduccion.
- Generacion de subtitulos o contenido localizado: para contenido dirigido a hablantes de banjar, el modelo puede traducir frases o parrafos completos con contexto.
- Educacion y linguistica computacional: util para estudiar la morfologia y sintaxis del banjar en escritura arabe a partir de traducciones generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el par eng_Latn-bjn_Arab en la informacion disponible. El paper LatentMT reporta que, en el conjunto de 32 direcciones de traduccion, el modelo de 2.6B alcanza un rendimiento comparable a modelos de 3 a 5 veces mas grandes, pero no se incluyen cifras concretas para este par concreto. No se dispone de tablas de MMLU, HumanEval, GSM8K u otros benchmarks generales para este adaptador.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0.1 GB), pero el modelo base Ouro-2.6B-Thinking requiere los recursos de un modelo de 2.6B de parametros.
- VRAM estimada: para inferencia con el modelo base en precision completa (fp16) se necesitan aproximadamente 5-6 GB de VRAM. Con cuantizacion de 4 bits (bitsandbytes) podria reducirse a unos 2-3 GB, aunque no se especifica en la documentacion.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) para inferencia comoda. Para entrenamiento o ajuste fino, se recomienda una GPU con 16 GB o mas (RTX 4090, A100, etc.).
- El modelo cabe en GPUs de consumo medio, siempre que se utilice cuantizacion o se limite la longitud de contexto.
- Opciones de despliegue: al ser un modelo de `transformers`, se puede servir con vLLM, TGI, o mediante `llama.cpp` si se convierte a GGUF (aunque no se proporcionan pesos GGUF). Tambien es compatible con Ollama si se exporta adecuadamente.
- Latencia y throughput: no se proporcionan datos especificos. Para un modelo de 2.6B en una GPU moderna, se espera una latencia de decenas de milisegundos por token, pero depende del hardware y la cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa directa con otros modelos de traduccion para el par ingles-banjar. El paper LatentMT menciona que el enfoque supera a modelos de 3 a 5 veces mas grandes en el conjunto de 32 direcciones, pero no se listan modelos concretos. Como referencia, se podrian considerar otros adaptadores de la misma familia LatentMT (por ejemplo, LatentMT-2.6B-eng-latn-prs-arab) o modelos de traduccion generalistas como NLLB-200, pero no se dispone de datos comparativos publicados para este par especifico.

## Limitaciones y advertencias

- Es un adaptador de investigacion, no un modelo de produccion validado. Su uso principal es academico.
- Solo cubre un par de idiomas (ingles a banjar en escritura arabe); no es multilingue.
- No se han documentado sesgos especificos, pero al ser un modelo entrenado sobre datos web, puede reflejar sesgos presentes en los corpus de traduccion.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir traducciones incorrectas o inventar contenido, especialmente en dominios especializados.
- La longitud de contexto no se especifica; depende del modelo base Ouro-2.6B-Thinking, que probablemente tenga una ventana de 4K o 8K tokens, pero no se confirma.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base (tambien Apache 2.0) y citar el paper correspondiente.
- No se incluyen pesos completos del modelo, solo el adaptador; es necesario descargar el modelo base por separado.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-bjn-arab
- Paper en arXiv: https://arxiv.org/abs/2607.18618 (PDF: https://arxiv.org/pdf/2607.18618v1, HTML: https://arxiv.org/html/2607.18618v1)
- Modelo base ByteDance/Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Repositorio de otro adaptador de la misma familia (referencia): https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-prs-arab

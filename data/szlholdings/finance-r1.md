# SZLHOLDINGS/finance-r1

## Resumen

finance-r1 es un adaptador LoRA publicado por SZLHOLDINGS sobre el modelo base unsloth/Qwen3.5-0.8B. Se distribuye como repositorio PEFT (librería `peft`, versión 0.22.0) y está etiquetado como un ajuste fino supervisado (SFT) orientado a generación de texto conversacional en el dominio financiero, a juzgar por su identificador. No es un modelo completo, sino un conjunto de pesos de adaptador que requieren cargar el modelo base para funcionar.

El modelo base Qwen3.5-0.8B es un transformer de aproximadamente 800 millones de parámetros de la familia Qwen; el adaptador hereda su arquitectura, tokenizador y ventana de contexto, aunque la model card no documenta ninguno de estos datos de forma explícita. El repositorio tiene un tamaño de 0.0 GB según Hugging Face, lo que sugiere que los pesos del adaptador ocupan pocos megabytes o que el repositorio está incompleto.

La relevancia de esta ficha es limitada: la model card es una plantilla sin rellenar, no hay benchmarks, no se declara licencia ni idiomas, y el modelo acumula cero descargas y cero likes en el momento de la consulta. Se documenta aquí con rigor lo que se puede verificar y se marca explícitamente como no disponible todo lo demás.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (base: Qwen3.5-0.8B) |
| Parametros totales | no disponible (modelo base ~0.8B; adaptador LoRA de rango no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, no documentada) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base admite las cuantizaciones que soporte Qwen3.5-0.8B) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante SFT con las librerías `trl` y `unsloth`, según las etiquetas del repositorio. La arquitectura subyacente es la del modelo base unsloth/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen; el adaptador añade matrices de bajo rango sobre las capas del base sin modificar su estructura. No se especifica el rango, el alpha, las capas objetivo ni el número de parámetros entrenables del adaptador.

No hay información sobre el dataset de entrenamiento: ni número de tokens, ni composición, ni procedencia de los datos financieros, ni si hubo etapas de RLHF o DPO. La model card conserva los marcadores `[More Information Needed]` en todas las secciones de detalles, datos, hiperparámetros y evaluación, por lo que no es posible verificar la calidad ni el alcance del ajuste. La única referencia técnica concreta es la versión de PEFT (0.22.0) y el enlace genérico al paper de Lacoste et al. (2019) sobre impacto ambiental, que aparece en la plantilla por defecto y no aporta información sobre este modelo.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` sugiere uso en diálogo multi-turno.
- Dominio financiero: el nombre `finance-r1` indica un ajuste orientado a contenido financiero, aunque no se documenta qué tareas concretas cubre.
- Herencia del modelo base: al ser un adaptador, conserva las capacidades del Qwen3.5-0.8B subyacente (generación, razonamiento básico, multilingüismo del base), sin que el autor las detalle.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Prototipado de asistentes financieros: el adaptador puede cargarse sobre Qwen3.5-0.8B para experimentar con respuestas en dominio financiero en entornos de desarrollo, dado su reducido tamaño y su naturaleza de adaptador ligero.
- Clasificación y resumen de textos financieros: uso típico de un SFT de dominio para condensar informes o notas, siempre que se valide la calidad con datos propios, ya que no hay evaluación publicada.
- Experimentación académica con LoRA: sirve como ejemplo de flujo `unsloth` + `trl` + `peft` para estudiar cómo se publica y se carga un adaptador, más que como modelo de producción.
- Generación de borradores en atención al cliente de banca: podría emplearse como generador de respuestas preliminares en un pipeline con revisión humana, aprovechando el bajo coste de inferencia de un modelo de 0.8B.
- Extracción de entidades en documentos financieros: con un prompt adecuado y validación posterior, para tareas de etiquetado asistido en corpus económicos.
- Fine-tuning incremental: al ser un adaptador PEFT, puede combinarse o continuar entrenándose para tareas específicas (por ejemplo, análisis de sentimiento de noticias bursátiles) sin reentrenar el modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y el autor deja la sección de evaluación con el marcador `[More Information Needed]`.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de ~0.8B en fp16 requiere del orden de 1.6 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 4 bits cabría en menos de 1 GB. El adaptador LoRA añade un coste marginal (unos pocos MB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es sobrada para el modelo base; también es viable en CPU.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU con al menos 4 GB de VRAM, e incluso en iGPU con cuantización agresiva.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el base), `unsloth` para entrenamiento e inferencia optimizada, `llama.cpp`/`Ollama` si se fusiona el adaptador con el base y se convierte a GGUF, y `vLLM` con soporte de adaptadores LoRA.
- Latencia y throughput estimados: no disponibles (no documentados por el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SZLHOLDINGS/finance-r1 | Adaptador sobre ~0.8B | no disponible | no disponible | Hugging Face (0 descargas) |
| unsloth/Qwen3.5-0.8B (base) | ~0.8B | no disponible | no disponible | Hugging Face |
| Alternativas de dominio financiero de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; no hay benchmarks publicados ni modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Model card vacía: todos los campos de detalles, entrenamiento, evaluación y uso previsto están sin rellenar, lo que impide auditar el modelo.
- Licencia no declarada: no se puede confirmar el uso comercial; hay que contactar con el autor o asumir el riesgo legal de usarlo en producción.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingüismo del base o si está sesgado a un idioma concreto.
- Riesgo de alucinación: un SFT de dominio financiero sin evaluación publicada puede generar cifras, fechas o afirmaciones plausibles pero falsas; requiere validación humana obligatoria.
- Sesgos desconocidos: sin documentación sobre el dataset de entrenamiento no es posible evaluar sesgos de género, geográficos o de mercado.
- Tamaño reducido del base (~0.8B): capacidad limitada de razonamiento complejo y de contexto largo frente a modelos de mayor escala.
- Repositorio de 0.0 GB: conviene verificar que los pesos del adaptador están efectivamente subidos antes de integrarlo en cualquier pipeline.
- Cero adopción: sin descargas ni likes, no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/finance-r1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Paper de referencia citado en la plantilla (impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute

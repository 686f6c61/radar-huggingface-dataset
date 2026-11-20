# ZeroYB/FromScratchGPT

## Resumen

FromScratchGPT es un modelo de lenguaje pequeño de tipo decoder-only transformer, desarrollado por ZeroYB como proyecto educativo vinculado a una serie de YouTube en la que se construye un GPT desde cero en PyTorch. El modelo se entrena sobre el dataset TinyStories y su propósito es generar cuentos infantiles cortos en inglés, reproduciendo el estilo y las limitaciones del corpus original. La revisión documentada, `ep002-pretrain`, corresponde al modelo preentrenado durante diez minutos en el segundo episodio de la serie.

Arquitectónicamente es un transformer convencional con 6 bloques y 384 canales de embedding, con un vocabulario de 10.000 tokens y un total de 14.585.856 parámetros según los pesos en safetensors. Su ventana de contexto es de solo 256 tokens, lo que lo sitúa en la categoría de modelos experimentales de laboratorio más que en la de modelos de producción.

Su relevancia es fundamentalmente didáctica: sirve como referencia reproducible para estudiar el ciclo completo de entrenamiento de un LLM (tokenización, preentrenamiento, fine-tuning y exportación a ONNX para inferencia en navegador con Transformers.js). No está pensado para tareas de razonamiento, código, matemáticas ni conversación general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (6 bloques, 384 canales de embedding) |
| Parametros totales | 14.585.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | ONNX en 8 bits (q8) para Transformers.js; pesos safetensors en precision original |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only escrito desde cero en PyTorch, sin recurrir a implementaciones preexistentes de GPT-2. Consta de 6 bloques transformer con 384 dimensiones de embedding y un vocabulario de 10.000 tokens. La revisión `ep002-pretrain` fue preentrenada sobre el dataset TinyStories durante diez minutos en el segundo episodio de la serie, lo que implica un presupuesto de cómputo muy reducido y un modelo en estado embrionario.

El autor documenta revisiones sucesivas por episodio: `ep003-sft` correspondería al modelo tras fine-tuning supervisado sobre TinyStoriesInstruct, y `ep012-pretrain` a una versión de 91 millones de parámetros entrenada en cuatro GPUs. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de los dos conjuntos de TinyStories, ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable no es algorítmica sino de despliegue: la exportación a ONNX en 8 bits permite ejecutar el modelo en el navegador mediante Transformers.js.

## Capacidades

- Generación de texto narrativo breve en inglés, concretamente cuentos infantiles al estilo TinyStories.
- Continuación de prompts sencillos del tipo "Once upon a time" con hasta 200 tokens nuevos.
- Inferencia en navegador mediante Transformers.js a partir del modelo ONNX cuantizado en 8 bits.
- Ejecución local con la librería transformers de Hugging Face cargando revisiones etiquetadas.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües más allá del inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia y aprendizaje de LLMs: el modelo permite recorrer el ciclo completo de entrenamiento (tokenización, preentrenamiento, SFT, exportación) con un coste de cómputo mínimo, lo que lo hace idóneo para cursos y talleres.
- Reproducción de experimentos: al estar etiquetada cada revisión por episodio, se puede comparar el comportamiento del modelo antes y después del fine-tuning (`ep002-pretrain` frente a `ep003-sft`) para estudiar el efecto del SFT en un corpus pequeño.
- Demostraciones de inferencia en navegador: el ONNX q8 permite incrustar un generador de cuentos en una página web sin backend, útil para prototipos de interfaces y demos interactivas.
- Generación de cuentos infantiles sintéticos: puede producir textos cortos de dominio muy restringido para pruebas de pipelines de datos o para aumentar datasets de narrativa infantil.
- Pruebas de integración con Transformers.js: sirve como caso de test para validar flujos de carga de modelos cuantizados y generación con muestreo (`temperature`, `top_k`) en entornos JavaScript.
- Experimentación con tokenizadores de vocabulario reducido: su vocabulario de 10.000 tokens permite estudiar el impacto del tamaño del vocabulario en la calidad de la generación dentro de un dominio acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 14,6 millones de parámetros; el modelo ONNX q8 ocupa una fracción aún menor, adecuada para entornos con recursos muy limitados.
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada para este modelo; una GTX 1650, RTX 3050 o incluso CPU son suficientes.
- Cabe en cualquier GPU consumer y en CPU; también se ejecuta en navegador mediante WebGPU o WASM con Transformers.js.
- Opciones de despliegue: transformers (PyTorch), Transformers.js con ONNX q8, y potencialmente llama.cpp u Ollama si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada; el tamaño del modelo y el contexto de 256 tokens sugieren latencias muy bajas en hardware consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FromScratchGPT (ep002-pretrain) | 14,6 M | 256 | MIT | Hugging Face, ONNX | Entrenamiento educativo sobre TinyStories |
| TinyStories-1M (modelos de referencia del dataset) | ~1 M | no disponible | no disponible | Hugging Face | Modelos publicados junto al paper de TinyStories; comparación por tamaño y dominio |
| GPT-2 small | 124 M | 1.024 | MIT | Hugging Face | Referencia generalista; mucho mayor y con contexto cuatro veces superior |
| Modelos de 91 M del mismo autor (ep012-pretrain) | 91 M | no disponible | MIT | Hugging Face | Revisión posterior del mismo proyecto, entrenada en cuatro GPUs |

La comparación con GPT-2 small es solo orientativa: FromScratchGPT está especializado en un dominio narrativo muy estrecho y no compite en capacidades generales. No se dispone de benchmarks que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El propio autor indica que el modelo escribe cuentos infantiles y nada más: no maneja hechos, aritmética ni conversación.
- Ventana de contexto de solo 256 tokens, insuficiente para tareas que requieran memoria de conversación o documentos largos.
- Entrenado únicamente en inglés; no soporta castellano ni otros idiomas.
- Riesgo elevado de alucinación y de incoherencia narrativa fuera del dominio de TinyStories.
- Modelo en estado de preentrenamiento de diez minutos: la calidad de generación es limitada incluso dentro de su dominio.
- Sesgos potenciales heredados de TinyStories, un corpus sintético generado por modelos mayores; no se documenta ningún análisis de sesgos.
- Licencia MIT, que permite uso comercial, pero las capacidades reales del modelo hacen inviable su uso en producción más allá de demos y experimentos.
- El nombre del repositorio y las etiquetas por episodio implican que `main` cambia con cada revisión; conviene fijar `revision=` para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZeroYB/FromScratchGPT
- Serie de YouTube: https://FromScratchGPT.ZorroYanBo.com
- Repositorio de código: https://github.com/FromScratchGPT/FromScratchGPT
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset TinyStoriesInstruct: https://huggingface.co/datasets/roneneldan/TinyStoriesInstruct
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js

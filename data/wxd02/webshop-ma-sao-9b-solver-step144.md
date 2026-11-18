# wxd02/WebShop-MA-SAO-9B-solver-step144

## Resumen

WebShop-MA-SAO-9B-solver-step144 es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-9B publicado por el usuario wxd02 en Hugging Face. Se trata de un "Actor de inferencia" entrenado específicamente para resolver tareas del entorno WebShop, un benchmark de compras web en el que un agente debe navegar por un sitio simulado y completar pedidos a partir de instrucciones en lenguaje natural. El modelo se distribuye como checkpoint intermedio del paso 144 de un proceso de entrenamiento multiagente (MA/SAO, presumiblemente multi-actor / solver-actor-optimizer), y no incluye ni el optimizador ni el crítico del sistema completo.

El modelo conserva la arquitectura multimodal del Qwen3.5-9B original (procesamiento de imagen y texto, pipeline `image-text-to-text`) y sus aproximadamente 9.400 millones de parámetros, con licencia Apache 2.0. Su relevancia es acotada: no es un modelo de propósito general, sino un artefacto de investigación orientado a evaluar políticas de agente en entornos de compra web. El autor reporta 37/64 éxitos estrictos (57,81%) sobre un holdout local de 1.000 tareas de WebShop, no sobre el benchmark original de 500 tareas, y advierte explícitamente que la puntuación no equivale a un resultado de "Engineer" independiente.

La ficha se basa únicamente en la información pública disponible en el repositorio de Hugging Face; muchos datos técnicos (idiomas, cuantizaciones, benchmarks estándar) no están publicados y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de aproximadamente 9.400 millones de parámetros que procesa entradas de imagen y texto. El checkpoint publicado es un ajuste fino orientado a la resolución de tareas en WebShop, etiquetado por el autor como "Inference Actor" del sistema MA-SAO (multi-actor / solver-actor-optimizer). No se incluyen el optimizador ni el crítico, por lo que el artefacto es únicamente la política del actor en el paso 144 del entrenamiento.

No se detallan en la model card el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o aprendizaje por refuerzo con recompensa del entorno. Tampoco se especifican innovaciones arquitectónicas propias más allá de la herencia del modelo base. El autor sí indica que la selección del harness (el conjunto de herramientas y formato de interacción) se realizó sobre 64 tareas de desarrollo que quedan excluidas de la puntuación reportada, lo que sugiere un proceso de ajuste con separación entre desarrollo y evaluación.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.5-9B.
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`), útil para interpretar capturas de pantalla de páginas web.
- Ejecución de políticas de agente en entornos web simulados: el modelo está entrenado para actuar como "solver" en tareas de WebShop, emitiendo acciones (búsquedas, clics, selección de productos, compra).
- Soporte de tool calling / function calling: no confirmado explícitamente en la model card; no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo de razonamiento extendido (thinking), audio u otras capacidades especiales: no disponible.
- Integración con `transformers` y endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Investigación en agentes de compra web: el modelo sirve como política de referencia para experimentos de aprendizaje por refuerzo o evaluación de agentes en entornos tipo WebShop, ya que está entrenado específicamente para ese dominio.
- Evaluación comparativa de harnesses: al ser un checkpoint intermedio (paso 144), permite medir el efecto de distintas configuraciones de herramientas y formato de interacción sobre el éxito de la tarea, como hizo el autor con las 64 tareas de desarrollo.
- Reproducción de resultados: investigadores que quieran replicar la puntuación de 37/64 sobre el holdout local de 1.000 tareas pueden desplegar este checkpoint con el harness por defecto.
- Generación de datos sintéticos de interacción: las trayectorias producidas por el modelo pueden usarse para entrenar o evaluar críticos y otros componentes del sistema MA-SAO.
- Análisis de fallos en agentes: al ser un solver de dominio acotado, es útil para estudiar modos de error (búsquedas erróneas, selección de producto incorrecta) en tareas de compra.
- Prototipado de asistentes de compra con percepción visual: el pipeline image-text-to-text permite experimentar con agentes que interpretan capturas de pantalla de tiendas online, aunque sin garantías de robustez fuera de WebShop.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| WebShop holdout local (1k tareas, subconjunto de 64) | 37/64 éxitos estrictos (57,81%) | Con harness por defecto; no es el benchmark original de 500 tareas; excluye las 64 tareas de desarrollo usadas para seleccionar el harness |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor advierte que la cifra reportada no constituye una puntuación de "Engineer" independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB.
- VRAM estimada con cuantización de 8 bits: en torno a 10-12 GB; con 4 bits, en torno a 6-8 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16; GPUs consumer de 12-16 GB solo con cuantización.
- Cabe en GPU consumer: sí, en RTX 4090 a bf16 con margen ajustado; en RTX 3090/4080 con cuantización.
- Opciones de despliegue: `transformers` (librería declarada), endpoints compatibles; vLLM, TGI, llama.cpp u Ollama no están confirmados para este checkpoint multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WebShop-MA-SAO-9B-solver-step144 | 9,41 B | no disponible | Agente WebShop (fine-tune) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | Propósito general multimodal | Apache 2.0 (según tag del base) | Hugging Face |
| Alternativas específicas para WebShop | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros fine-tunes comparables para WebShop en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy acotado: entrenado para WebShop; su rendimiento fuera de ese entorno no está validado.
- La puntuación de 57,81% corresponde a un holdout local de 1.000 tareas (subconjunto de 64), no al benchmark original de 500 tareas, por lo que no es directamente comparable con la literatura.
- Es un checkpoint intermedio (paso 144) sin optimizador ni crítico; no representa el sistema MA-SAO completo.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación y de acciones inválidas en el entorno web no cuantificado por el autor.
- Sesgos: no documentados; al heredar Qwen3.5-9B, pueden persistir sesgos del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación fuera de WebShop desaconseja su uso en producción sin validación adicional.
- Sin descargas ni likes en el momento de la consulta; soporte comunitario nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wxd02/WebShop-MA-SAO-9B-solver-step144
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- WebShop (entorno de referencia): no disponible en la información proporcionada
- Paper o blog del autor: no disponible

# tachara-ai/Decisio-12b-tuned-v3-mlx-commit

## Resumen

Decisio-12b-tuned-v3-mlx-commit es un ajuste fino del modelo google/gemma-4-12B-it, desarrollado por Tachara AI Lab, especializado en responder preguntas cerradas sobre un texto: sí/no, elección entre opciones y puntuaciones en una escala definida. A diferencia de un modelo conversacional general, el modelo devuelve, en un único forward pass por pregunta, una probabilidad para cada opción, lo que lo convierte en un componente de decisión probabilística y no en un generador de texto libre.

El modelo resuelve el problema de la clasificación y el juicio calibrado sobre texto: en lugar de generar una respuesta que después hay que interpretar, produce directamente distribuciones de probabilidad calibradas a temperaturas fijas por tipo de pregunta (choice 1.08, yes/no 1.43, score 1.10). Se distribuye como conversión MLX en 6 bits (mlx-lm 0.32.2, group size 64) para Apple silicon, y está pensado para servirse con el servidor open source decisio 0.50.1 o posterior.

La relevancia actual radica en su enfoque: un modelo de 11.900 millones de parámetros afinado con LoRA (rango 32, alpha 64) sobre 463.859 preguntas, que mejora de forma sustancial al modelo base y a la versión anterior de Decisio en precisión de respuestas cerradas, con una regla de "commit" que desplaza las confianzas inciertas fuera de la banda 0.20-0.80. Es, por tanto, una pieza de infraestructura para pipelines de evaluación y decisión automatizada, no un asistente general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (gemma4_unified), ajuste fino del base google/gemma-4-12B-it |
| Parámetros totales | 11.907.350.272 (11,9 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 6 bits MLX (group size 64); pesos bf16 de referencia en el ajuste |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (conversión MLX 6 bits) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it (revisión 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7, Apache-2.0) y se afina con un adaptador LoRA de rango 32 y alpha 64 durante una época sobre 463.859 preguntas. El adaptador se fusiona en el modelo base en float32 con redondeo estocástico con semilla a bf16; el archivo decision_config.json registra la fusión. La innovación principal no está en la arquitectura, sino en el readout: el modelo se entrena para producir una probabilidad por opción en un solo forward pass por pregunta, con un layout de prompt y un readout definidos en la configuración.

El ajuste incluye una regla de "commit" para respuestas sí/no: una probabilidad estrictamente entre 0.20 y 0.80 se reporta como 0.80 o 0.20. La respuesta nunca cambia; solo se desplaza la confianza declarada fuera de la zona incierta. Las temperaturas por tipo de pregunta se obtienen como el ajuste de mínima log-loss sobre la mitad de un split de validación. Además, la versión 0.50.1 o posterior de decisio incorpora un bloque de calculadora (calc-v1) que mejora las preguntas con números, fechas, horas y aritmética.

## Capacidades

- Respuesta a preguntas cerradas sobre un texto: sí/no, elección única entre opciones y puntuación en una escala definida por el usuario.
- Producción de probabilidades calibradas por opción en un único forward pass por pregunta.
- Regla de commit para sí/no: desplaza confianzas entre 0.20 y 0.80 a los extremos declarados sin alterar la respuesta.
- Soporte de calculadora (calc-v1) en decisio 0.50.1 o posterior para preguntas con bloques numéricos, de fechas, horas y aritmética.
- Robustez frente a variaciones de redacción y orden de opciones (81,2% en 1.050 preguntas de sondeo).
- Capacidad de lectura general conservada del modelo base (73,4% en 1.028 preguntas de lectura general).
- No entrena con imágenes: la visión no forma parte de este ajuste.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; el modelo está especializado en el readout de decisión.

## Casos de uso

- Moderación y clasificación de contenido: el modelo puede evaluar si un texto cumple una política concreta mediante preguntas sí/no y devolver una probabilidad calibrada, lo que permite fijar umbrales de revisión humana de forma explícita.
- Enrutamiento de tickets de soporte: con preguntas de elección entre categorías, se obtiene una distribución de probabilidad por categoría en un solo paso, útil para derivar tickets al equipo adecuado y medir la incertidumbre del enrutamiento.
- Evaluación automática de respuestas en pipelines de anotación: preguntas de puntuación en una escala definida permiten asignar una nota probabilística a cada respuesta de un modelo o de un anotador, con calibración a temperatura fija.
- Verificación de hechos y consistencia: preguntas sí/no sobre si un texto respalda una afirmación, con la regla de commit para evitar confianzas ambiguas en la banda intermedia.
- Encuestas y estudios con textos abiertos: codificación automática de respuestas de texto libre en categorías cerradas y escalas, con probabilidades calibradas que permiten analizar la incertidumbre agregada.
- Filtrado previo en pipelines de datos: decidir si un documento pertenece a un dominio o cumple un criterio antes de pasarlo a un modelo generativo mayor, reduciendo coste computacional.
- Despliegue local en Apple silicon: la conversión MLX 6 bits permite servir el modelo en un Mac con chip Apple silicon mediante decisio, sin GPU dedicada, para prototipos y flujos de decisión en local.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 5.000 preguntas de validación de la distribución de entrenamiento (mismas preguntas y readout, en bf16):

| Conjunto | Gemma 4 12B base | Decisio tuned 12B anterior | Decisio v3 |
|---|---:|---:|---:|
| Todas las preguntas | 67,7% | 71,6% | 78,8% |
| Elección (2.792) | 68,9% | 71,7% | 79,8% |
| Sí/no (1.220) | 83,0% | 84,7% | 89,8% |
| Puntuación (988) | 45,1% | 55,2% | 62,2% |

Otros datos del autor:

| Prueba | Resultado |
|---|---|
| Preguntas de sondeo de redacción y orden (1.050) | 81,2% (base 71,5%, anterior 75,6%) |
| Chequeo fuera de la distribución de entrenamiento (1.178) | 83,9% (base 83,2%) |
| Lectura general (1.028) | 73,4% (base 70,5%) |
| Sí/no con y sin regla de commit (1.220) | 89,8% en ambos casos; log loss 0,232 sin regla y 0,253 con regla (19,3% de respuestas en la banda) |
| Brier score a temperaturas por tipo (mitad de validación) | 0,234; a temperatura única 3,592: 0,316 |
| Preguntas con bloque numérico y calculadora activa (874) | de ~57-60% a ~83% |
| Coincidencia de respuesta top con pesos bf16 (300 preguntas fijas) | 94,0% |

El autor advierte que son lecturas sobre preguntas de validación de su propia distribución de entrenamiento, no resultados de un benchmark independiente.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 9,7 GB en conversión MLX 6 bits; en bf16 el modelo de 11,9 mil millones de parámetros requiere aproximadamente 24 GB de memoria.
- GPU recomendadas: para la versión MLX, un Mac con Apple silicon (requisito explícito del autor); para bf16, GPU con al menos 24 GB, como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: la conversión 6 bits de 9,7 GB es apta para equipos con 16 GB o más de memoria unificada en Apple silicon; en GPU NVIDIA de consumo, la versión bf16 requiere al menos 24 GB.
- Opciones de despliegue: servidor decisio 0.50.1 o posterior con extra mlx (backend MLX); el autor no documenta vLLM, llama.cpp, Ollama ni TGI para esta revisión.
- Latencia y throughput: no disponibles; el autor solo indica que se realiza un forward pass por pregunta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión en preguntas cerradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisio-12b-tuned-v3-mlx-commit | 11,9 mil millones | no disponible | 78,8% (5.000 preguntas del autor) | Apache 2.0 | Hugging Face, conversión MLX 6 bits |
| google/gemma-4-12B-it (base) | 11,9 mil millones | no disponible | 67,7% (mismas preguntas) | Apache 2.0 | Hugging Face |
| Decisio tuned 12B anterior | no disponible | no disponible | 71,6% (mismas preguntas) | no disponible | Hugging Face (tachara-ai) |

No se dispone de datos de benchmarks independientes ni de comparaciones con otros modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Las cifras son sobre preguntas de validación de la distribución de entrenamiento del autor, no sobre un benchmark independiente; pueden no generalizar a otros dominios.
- La calibración solo se mantiene a las temperaturas incluidas (choice 1.08, yes/no 1.43, score 1.10) y cuando el modelo se sirve con decisio; otros servidores sin temperatura producen probabilidades más planas o más agudas.
- Las imágenes no forman parte del entrenamiento de este modelo; no debe esperarse capacidad de visión.
- El servidor rechaza arrancar si decision_config.json difiere del perfil de decisio instalado; requiere decisio 0.50.1 o posterior (revisión hecha para 0.50.2), y versiones anteriores sirven el modelo sin el bloque de calculadora.
- La regla de commit altera la confianza declarada en la banda 0.20-0.80 y empeora el log loss (de 0,232 a 0,253); debe considerarse al calibrar umbrales de producción.
- La conversión está limitada a MLX 6 bits para Apple silicon; no se documentan otras cuantizaciones ni backends.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos específicos de alucinación más allá de la naturaleza probabilística del readout.
- La licencia Apache 2.0 permite uso comercial, pero el NOTICE debe nombrar el repositorio y la revisión del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tachara-ai/Decisio-12b-tuned-v3-mlx-commit
- Repositorio decisio: https://github.com/aminry/decisio
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Organización Tachara AI Lab: https://huggingface.co/tachara-ai

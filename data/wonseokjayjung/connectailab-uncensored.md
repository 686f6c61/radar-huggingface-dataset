# WonseokJayJung/connectailab-uncensored

## Resumen

Connect AI Lab · Uncensored 0.6B es un modelo experimental de generación de texto derivado de Qwen/Qwen3-0.6B, publicado por el usuario de HuggingFace WonseokJayJung dentro del proyecto Connect AI Lab / AI City Builders. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una intervención directa sobre los pesos de un modelo base congelado, aplicando una técnica de «abliteration» o eliminación de dirección (direction ablation) inspirada en el paper de Arditi et al. sobre la direccionalidad del rechazo en modelos de lenguaje. El objetivo declarado es educativo: mostrar de forma visible cómo una modificación de pesos cambia el comportamiento de un modelo pequeño en un aula de IA local.

El procedimiento consiste en calcular una dirección candidata a partir de la diferencia de medias de activaciones entre preguntas de entrenamiento y preguntas de validación, comparar candidatos en 21 capas y seleccionar finalmente la dirección de la capa 24. Con esa dirección se modifican 57 rutas de escritura (embedding, salida de atención y salida de MLP). Además, la LM head original, que estaba compartida, se separa conservando los valores originales. Aunque el nombre de la familia es 0.6B, el modelo resultante pesa aproximadamente 0,75B parámetros debido a esa separación de pesos.

Su relevancia es limitada y muy acotada: es una pieza didáctica reproducible, no un modelo de producción. El propio autor advierte que «uncensored» es un nombre de proyecto y no una certificación de que se hayan eliminado todos los rechazos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-0.6B); modificación de pesos por ablación de dirección en la capa 24 |
| Parametros totales | 0,6B en el modelo original; aproximadamente 0,75B en la versión modificada (incluye pesos separados de la LM head) |
| Parametros activos | no aplica (arquitectura densa) |
| Longitud de contexto | no disponible (la model card no la especifica) |
| Tipos de cuantizacion | FP32 probado en CPU; GGUF preparado (804.753.760 bytes, unos 805 MB / 767 MiB) para LM Studio |
| Idiomas soportados | no disponible oficialmente; las pruebas de la model card se realizaron con preguntas en inglés y el material está redactado en coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) y GGUF; el autor indica que la subida de los pesos está pendiente, por lo que la descarga aún no está disponible |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B (revisión `c1899de289a04d12100db370d81485cdf75e47ca`), un transformer denso de la familia Qwen3. Sobre esos pesos congelados no se aplica ningún entrenamiento supervisado, RLHF ni DPO: la única operación es una intervención geométrica en el espacio de activaciones. En concreto, se construyen direcciones candidatas a partir de la diferencia entre las medias de activación de un conjunto de preguntas de entrenamiento, se comparan los candidatos de 21 capas usando un conjunto separado de preguntas de validación y se elige la dirección de la capa 24 como vector de edición. Con esa dirección se reescriben 57 rutas de escritura repartidas entre el embedding, la salida de atención y la salida del MLP.

Un detalle técnico relevante es que la LM head compartida del modelo original se separa en un tensor independiente conservando los valores originales, lo que explica el aumento de parámetros hasta aproximadamente 0,75B. La model card remarca que esto no enseña conocimiento nuevo al modelo: es un ejercicio con un conjunto pequeño de preguntas en inglés sobre privacidad, y no una reproducción completa del paper ni una evaluación de rendimiento a escala. No se documentan ni el número de tokens de entrenamiento ni la composición de dataset, porque no existe tal entrenamiento.

## Capacidades

- Generación de texto autoregresiva estándar, heredada de Qwen3-0.6B, con el conjunto de capacidades propio de un modelo de 0,6B.
- Manipulación experimental del comportamiento de rechazo: es la capacidad sobre la que se construye todo el proyecto y el único eje que el autor evalúa.
- Ejecución local en CPU en FP32 y en LM Studio con cuantización GGUF Q8 (carga y respuesta por API verificadas por el autor).
- Razonamiento aritmético básico: en la prueba Q8 con LM Studio el modelo respondió `42` a `17 + 25`.
- Seguimiento de instrucciones simples de repetición: ante una pregunta de copia, tanto el original como el modificado respondieron `당신은 멍청입니다.` (coreano).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; no es un objetivo del proyecto.
- Capacidades multilingües: no disponibles como dato oficial; las pruebas documentadas usan inglés y coreano.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Docencia sobre interpretabilidad y seguridad en LLM: el modelo sirve como material de clase para mostrar, con un caso reproducible y de tamaño manejable, cómo una dirección en el espacio de activaciones modula el comportamiento de rechazo. El propio autor lo enmarca en un curso local de IA.
- Reproducción de experimentos de ablación en hardware modesto: al ser un modelo de menos de 1B parámetros, permite repetir el pipeline de Arditi et al. (cálculo de direcciones, comparación entre capas, edición de rutas de escritura) en un portátil sin GPU, algo inviable con modelos de 7B o superiores.
- Validación de metodología de evaluación de rechazos: es útil como caso de estudio sobre por qué la detección de frases de rechazo no equivale a ausencia de rechazo; el autor documenta explícitamente que 0/4 coincidencias de frase no implicaron 0 rechazos reales.
- Pruebas de despliegue en LM Studio y llama.cpp: con un GGUF de unos 805 MB, sirve para verificar cadenas de carga, servidor de API local y cuantización en entornos de aula o de prototipado.
- Comparación controlada antes/después de una intervención de pesos: los experimentos con diferencia de logits 0 y respuestas idénticas antes y después de guardar permiten ilustrar conceptos de persistencia y determinismo en el guardado de modelos.
- Estudio de los límites de la técnica de abliteration: el resultado real (respuestas que siguen evitando dar información personal o que derivan a explicaciones genéricas) es un caso práctico para analizar la diferencia entre supresión superficial de plantillas de rechazo y cambio real de comportamiento.
- No es adecuado como base para asistentes en producción, atención al cliente, generación de código ni tareas que requieran fiabilidad factual o contexto largo.

## Benchmarks y rendimiento

Los únicos datos publicados son los del experimento propio del autor, no benchmarks estándar. Se realizaron en CPU en FP32 con un conjunto de 4 preguntas:

| Condición (CPU FP32) | Coincidencias de frase de rechazo | Coincidencias de respuesta exacta |
|---|---:|---:|
| Original | 4/4 | 1/4 |
| Control con dirección aleatoria | 4/4 | 1/4 |
| Editado, guardado y recargado | 0/4 | 1/4 |

Observaciones registradas por el autor: la diferencia de logits antes y después de guardar fue 0, y las respuestas a las mismas preguntas fueron idénticas, lo que indica que el guardado no alteró el comportamiento. La coincidencia 0 de frases de rechazo no implica ausencia real de rechazo: al leer las respuestas, el modelo seguía evitando proporcionar información personal o respondía con explicaciones genéricas. En una prueba separada en LM Studio con cuantización Q8, tanto el original como el modificado respondieron `당신은 멍청입니다.` a una pregunta de copia y `42` a `17 + 25`; el autor advierte que las preguntas que el original también responde correctamente no sirven como evidencia de reducción de rechazos, y que las condiciones de runtime y cuantización no son comparables con el experimento FP32.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso base, ya que el autor verificó ejecución en CPU en FP32. Como referencia de tamaño: FP32 en torno a 3 GB, FP16 en torno a 1,5 GB y el GGUF Q8 publicado ocupa 804.753.760 bytes (unos 805 MB / 767 MiB), más el espacio de caché KV correspondiente al contexto que se use.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con 2 GB o más de VRAM puede alojar el modelo en FP16 o Q8.
- Cabe en GPU de consumo: sí, con margen amplio. Prácticamente cualquier GPU de consumo reciente (por ejemplo, gama GTX 10xx en adelante con 4 GB o más) puede cargarlo cuantizado.
- Opciones de despliegue: transformers (formato safetensors, `library_name: transformers`), llama.cpp y LM Studio con el GGUF, y potencialmente otros runners compatibles con GGUF como Ollama. LM Studio con Q8 está verificado por el autor con carga real y respuesta por API.
- Latencia y throughput estimados: no disponible. No se publican medidas de tokens por segundo ni de latencia.
- Nota crítica: en el momento de redactar esta ficha los pesos no están subidos al repositorio, por lo que no se puede descargar ni ejecutar el modelo desde HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado de los pesos | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| Connect AI Lab · Uncensored 0.6B | ~0,75B (0,6B originales) | no disponible | no subidos todavía | Apache-2.0 | 0/4 coincidencias de frase de rechazo y 1/4 respuestas exactas en 4 preguntas (FP32, CPU) |
| Qwen/Qwen3-0.6B (modelo base) | 0,6B | no disponible en la información proporcionada | disponible | Apache-2.0 | 4/4 coincidencias de frase de rechazo y 1/4 respuestas exactas en el mismo test |
| Otras variantes abliteradas de Qwen3-0.6B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación solo puede establecerse de forma fiable contra el modelo base, que es el único término de referencia presente en la información proporcionada. No se dispone de datos de otros modelos de la misma categoría que permitan una comparativa rigurosa.

## Limitaciones y advertencias

- Pesos no disponibles: la model card indica explícitamente que la subida de los ficheros grandes está en preparación y que todavía no se pueden descargar los pesos desde el repositorio. El modelo no es usable tal cual.
- «Uncensored» es un nombre de proyecto, no una garantía: el autor advierte que no certifica la eliminación de todos los rechazos ni ofrece garantía de rendimiento.
- Detección de frases no equivale a comportamiento: el 0/4 en coincidencias de frases de rechazo no se corresponde con 0 rechazos reales; al leer las respuestas, el modelo seguía evitando dar información personal o derivaba a explicaciones genéricas.
- Evidencia empírica mínima: la validación se hizo con 4 preguntas, en CPU FP32, y las condiciones de la prueba en LM Studio Q8 no son comparables entre sí, según el propio autor.
- No es un fine-tuning: no se ha enseñado conocimiento nuevo al modelo, por lo que sus capacidades factuales y de razonamiento son las del Qwen3-0.6B original, con el riesgo de alucinación propio de un modelo de 0,6B.
- Sesgos: no evaluados en la información proporcionada. Al derivar de Qwen3-0.6B, hereda los sesgos del modelo base, que tampoco se documentan aquí.
- Limitaciones de idioma y contexto: no hay información publicada sobre idiomas soportados ni sobre la longitud de contexto efectiva, y la intervención se calibró con un conjunto pequeño de preguntas en inglés sobre privacidad, por lo que su efecto en otros idiomas o dominios es desconocido.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece ninguna garantía y el carácter experimental y educativo del artefacto desaconseja su uso en producción.
- Ausencia de tracción: el repositorio registra 0 descargas y 0 likes, y no hay revisión independiente de los resultados.
- Riesgo para producción: un modelo de este tamaño, con rechazos parcialmente alterados y sin evaluaciones de seguridad, no debería desplegarse en aplicaciones orientadas a usuarios sin filtros y evaluación adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WonseokJayJung/connectailab-uncensored
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Revisión del modelo base citada: `c1899de289a04d12100db370d81485cdf75e47ca`
- Paper de referencia (Arditi et al., Refusal in Language Models Is Mediated by a Single Direction): https://arxiv.org/abs/2406.11717
- Póster en NeurIPS 2024: https://neurips.cc/virtual/2024/poster/93566
- Implementación de los autores: https://github.com/andyrdt/refusal_direction
- Model Playground del proyecto: https://www.aicitybuilders.com/connectailab/
- Explicación para estudiantes (coreano): https://www.aicitybuilders.com/la8

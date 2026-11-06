# Urbanwarrior79/omnigenesis-analogy-gguf

## Resumen

`omnigenesis-analogy-gguf` es un artefacto de inferencia en formato GGUF publicado por el usuario Urbanwarrior79 bajo el nombre interno `omni-isomorph-agi`. Se presenta como un "especialista en analogías" del proyecto Omnigenesis, cuyo cometido declarado es generar un vector de sistemas de 5 dimensiones, un dominio analógico de transferencia, sus límites y un valor de similitud coseno autodeclarado. El modelo tiene 3.821.079.648 parámetros totales (aproximadamente 3,8 mil millones), un tamaño de repositorio de 2,2 GB y está empaquetado para su uso con llama.cpp, LM Studio, Ollama y aplicaciones GGUF para Android.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no incluye información sobre el modelo base, el dataset de entrenamiento, la longitud de contexto, los idiomas soportados ni resultados de benchmarks. La model card es explícita al señalar que se trata de un artefacto de inferencia y no de un checkpoint base para fine-tuning convencional, y remite a un repositorio de despliegue externo (no enlazado en la información disponible) para el prompt de sistema y los parámetros de ejecución originales.

Por tanto, esta ficha documenta lo que el autor declara, marcando como "no disponible" todo aquello que no figura en la información proporcionada. No se debe asumir que el modelo tiene capacidades generales de propósito general más allá de la tarea de analogía declarada, ni que su comportamiento es reproducible sin el prompt de sistema original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (export GGUF para llama.cpp; arquitectura del modelo base no declarada) |
| Parametros totales | 3.821.079.648 (aprox. 3,8 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio es un export GGUF; no se detallan los niveles incluidos) |
| Idiomas soportados | no disponible |
| Licencia | other (el autor indica que debe revisarse la licencia del modelo base y del export antes de redistribuir o usar comercialmente) |
| Formato de pesos | GGUF (librería llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base: la model card no especifica si se trata de un transformer denso, un MoE, un modelo híbrido o una arquitectura SSM, ni detalla el número de capas, dimensiones ocultas, cabezas de atención o tipo de atención. El único dato estructural es el recuento de parámetros (3,8 B) y el formato de exportación (GGUF), lo que sitúa al modelo en la categoría de modelos pequeños/medianos aptos para inferencia local en CPU o GPU de gama media.

Tampoco se documentan los datos de entrenamiento: no hay número de tokens, composición del dataset, ni mención a RLHF, DPO o SFT. La model card menciona únicamente que el export puede usarse para generar ejemplos sintéticos, pero que el entrenamiento debería realizarse con el modelo base original o un checkpoint compatible de mayor precisión y con un dataset revisado por separado. No se declara ninguna innovación técnica (decodificación especulativa, atención lineal, etc.). El "vector de sistemas de 5 dimensiones" y la "similitud coseno autodeclarada" son parte del formato de salida declarado del especialista, no una descripción de la arquitectura interna.

## Capacidades

- Generación de texto orientada a la tarea de analogía: según el autor, produce un vector de sistemas de 5 dimensiones, un dominio analógico de transferencia, límites de transferencia y un valor de similitud coseno autodeclarado.
- Inferencia local en runtimes compatibles con GGUF: llama.cpp, LM Studio, Ollama y aplicaciones GGUF para Android.
- Generación de ejemplos sintéticos (el autor lo menciona como posible uso del export).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se declaran.
- Conversacional: la etiqueta `conversational` figura entre los tags del repositorio, pero no se detalla el formato de diálogo ni el prompt de sistema.

## Casos de uso

- Exploración de analogías entre dominios científicos o de ingeniería: el modelo se usaría para mapear un sistema fuente a un dominio analógico y obtener los límites de transferencia declarados, con validación humana posterior de cada analogía. Es adecuado por su formato de salida estructurado (vector de 5 dimensiones más dominio y límites), aunque la fiabilidad no está verificada.
- Generación de ejemplos sintéticos para curación de datasets: el autor indica que el export puede generar ejemplos sintéticos, que después deben revisarse antes de incorporarse a un dataset de entrenamiento. Adecuado por su bajo coste de inferencia local (3,8 B de parámetros).
- Prototipado de asistentes conversacionales locales: gracias al tag `conversational` y al formato GGUF, puede desplegarse en llama.cpp u Ollama para pruebas de conversación en local sin infraestructura GPU dedicada.
- Despliegue en dispositivos Android: el formato GGUF y el tamaño de 2,2 GB permiten probar el modelo en aplicaciones GGUF para Android, útil para demos de campo o entornos sin servidor.
- Investigación sobre metacognición y autoevaluación: el modelo emite una similitud coseno autodeclarada, lo que permite estudiar la calibración de la confianza declarada frente a la calidad real de la analogía, siempre con validación independiente.
- Integración en pipelines de generación aumentada por recuperación (RAG) como componente especializado en reescritura analógica: se usaría para reformular consultas o conceptos en términos de un dominio análogo antes de la recuperación, sujeto a evaluación empírica previa.
- Evaluación comparativa de especialistas pequeños: sirve como caso de estudio de un especialista de 3,8 B exportado a GGUF frente a modelos generalistas del mismo orden de magnitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el recuento de parámetros (3,8 B), en cuantización de 4 bits el peso ocuparía del orden de 2 GB, y en 8 bits del orden de 4 GB; en FP16, unos 7,6 GB. Estas cifras son estimaciones por tamaño y no proceden de la documentación del modelo.
- GPU recomendadas: no disponibles. Por tamaño, un modelo de 3,8 B en cuantización baja podría ejecutarse en GPU de consumo con 4-8 GB de VRAM, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Probablemente sí en cuantizaciones bajas (4-8 bits) en tarjetas con 6-8 GB o más, pero no está confirmado en la información disponible.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y aplicaciones GGUF para Android, según la model card.
- Latencia y throughput estimados: no disponibles.
- Nota: el repositorio ocupa 2,2 GB, lo que sugiere que contiene una o pocas cuantizaciones; no se detalla cuáles.

## Comparativa con modelos similares

No se dispone de información sobre el modelo base ni sobre alternativas directamente comparables dentro del proyecto Omnigenesis. La siguiente tabla compara únicamente los datos declarados con categorías genéricas de modelos pequeños, sin datos de rendimiento verificables.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| omnigenesis-analogy-gguf | 3,8 B | no disponible | other | GGUF | Hugging Face (0 descargas, 0 likes) |
| Alternativa de propósito general ~3-4 B | no disponible | no disponible | no disponible | safetensors/GGUF | no disponible |
| Alternativa especializada en analogías | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la información proporcionada modelos comparables de la misma categoría (especialistas en analogía) ni se dispone de métricas para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El autor advierte explícitamente de que las salidas son generadas por el modelo y requieren validación; la confianza autodeclarada, las analogías y los artefactos formales generados no deben tratarse como prueba sin verificación independiente.
- Riesgo de alucinación: elevado en tareas de analogía y en la similitud coseno autodeclarada, que es una estimación del propio modelo y no una medida objetiva.
- Sesgos conocidos: no disponibles; no se documenta la composición del dataset ni procesos de alineación.
- Limitaciones de contexto e idioma: no disponibles; no se declara ventana de contexto ni idiomas soportados.
- Licencia: marcada como `other`; el autor exige revisar la licencia del modelo base y del export antes de redistribuir o usar comercialmente. No se puede asumir uso comercial libre.
- No es un checkpoint base para fine-tuning de parámetros completos; el autor recomienda entrenar con el modelo base original o un checkpoint compatible de mayor precisión.
- No se deben usar prompts privados, credenciales, datos personales ni salidas del modelo sin revisar como datos de entrenamiento.
- Reproducibilidad: el comportamiento del especialista depende de un prompt de sistema y parámetros de ejecución que se encuentran en un repositorio de despliegue externo no enlazado en la información disponible; sin ellos, los resultados pueden diferir.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria ni benchmarks publicados.

## Enlaces

- Hugging Face: https://huggingface.co/Urbanwarrior79/omnigenesis-analogy-gguf
- Repositorio de despliegue con el Modelfile de Ollama y el prompt de sistema: no disponible (mencionado en la model card, sin URL)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada

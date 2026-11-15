# StarpowerTechnology/WVY-LSD

## Resumen

WVY-0 es un modelo de lenguaje neuronal entrenado desde cero por StarpowerTechnology sobre el corpus propio WVY World Dataset. No utiliza pesos preentrenados ni texto externo: se trata de un ejercicio de entrenamiento completo (tokenizador incluido) sobre aproximadamente 199.249 tokens organizados en unas 2.200 conversaciones del universo ficticio de WVY. La arquitectura es un modelo de lenguaje probabilístico neuronal clásico con contexto de 16 tokens, embeddings de 64 dimensiones y dos capas ocultas de 512 unidades con conexión residual, seguido de softmax sobre un vocabulario de 1.473 tokens BPE.

El modelo tiene 1.637.377 parámetros y está implementado en NumPy puro sobre CPU, sin frameworks de deep learning. Su perplexity sobre el mundo de entrenamiento es de 1,13, mientras que sobre respuestas nunca vistas asciende a 641, lo que refleja un ajuste extremo al corpus y una capacidad de generalización muy limitada. Es relevante no como modelo de propósito general, sino como caso de estudio de entrenamiento desde cero, despliegue en navegador (runtime JavaScript) y evaluación honesta de límites.

La model card es explícita sobre el uso previsto: en la aplicación WVY, las cuestiones de seguridad, emergencias y preguntas fuera del mundo se resuelven con reglas fijas, nunca con el modelo; para el resto, WVY-0 genera cuatro borradores y un verificador selecciona el que es pertinente y usa palabras reales, recurriendo a una biblioteca de hechos si ninguno pasa el filtro.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje probabilístico neuronal: contexto de 16 tokens, embeddings de 64 dimensiones, 2 capas ocultas de 512 con residual, softmax sobre vocabulario |
| Parámetros totales | 1.637.377 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 tokens |
| Tipos de cuantización | no disponible (pesos en float32) |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NPZ (`wvy0.npz`, float32); metadatos en JSON (`wvy0_meta.json`) |

## Arquitectura y entrenamiento

Se trata de un transformer no; es un modelo de lenguaje probabilístico neuronal feed-forward clásico. La entrada es una ventana de 16 tokens, cada uno mapeado a un embedding de 64 dimensiones. Sobre la representación agregada se aplican dos capas ocultas de 512 unidades con una conexión residual, y la salida pasa por una softmax sobre el vocabulario de 1.473 tokens definido por un tokenizador BPE aprendido específicamente sobre el corpus. El entrenamiento se realizó en NumPy puro sobre CPU, sin GPU ni frameworks de deep learning.

Los datos de entrenamiento provienen del WVY World Dataset: 199.249 tokens correspondientes a unas 2.200 conversaciones construidas a partir del universo ficticio de WVY. No se documenta el uso de RLHF, DPO ni ajuste por instrucciones; el modelo se entrena como predictor de siguiente token sobre ese corpus. La innovación técnica destacable no está en la arquitectura, sino en el pipeline: tokenizador propio, entrenamiento desde cero, exportación a un formato empaquetado y un runtime en JavaScript (`wvy0_runtime.js`) que ejecuta el modelo en el navegador. En la aplicación se emplea decodificación por múltiples borradores (cuatro) con un verificador posterior que filtra por pertinencia y vocabulario real.

## Capacidades

- Generación de texto corto en inglés dentro del dominio del universo WVY, con contexto máximo de 16 tokens.
- Reproducción y recombinación de respuestas vistas durante el entrenamiento (perplexity 1,13 sobre el corpus).
- Generación de múltiples borradores por consulta (cuatro en la aplicación) para selección posterior mediante un verificador.
- Ejecución en navegador mediante runtime JavaScript, sin dependencias de servidor GPU.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés del corpus; no se documentan otros idiomas.

## Casos de uso

- Estudio de entrenamiento desde cero: sirve para ilustrar el pipeline completo (tokenizador BPE, corpus, entrenamiento en NumPy, exportación) en cursos y tutoriales, dado que todo el código (`corpus.py`, `train.py`, `export.py`) está incluido en el repositorio.
- Despliegue de inferencia en navegador: el runtime `wvy0_runtime.js` y los pesos en NPZ permiten ejecutar el modelo en el cliente sin backend, útil para demos de IA en el navegador con requisitos mínimos de infraestructura.
- Personajes conversacionales de dominio cerrado: en la aplicación WVY, el modelo genera respuestas dentro de un universo ficticio concreto, apoyado por reglas fijas para seguridad y una biblioteca de hechos para consultas fuera de dominio.
- Evaluación de límites de generalización: la diferencia entre perplexity 1,13 en entrenamiento y 641 en respuestas no vistas lo convierte en un caso práctico para estudiar sobreajuste y medir la brecha entre memorización y generalización en corpus pequeños.
- Prototipado de sistemas de verificación de salidas: el patrón de generar cuatro borradores y filtrar con un verificador es replicable en pipelines de generación con control de calidad sobre modelos pequeños.
- Referencia educativa sobre tokenización BPE: el tokenizador de 1.473 tokens aprendido sobre el corpus y sus metadatos en `wvy0_meta.json` permiten analizar cómo un vocabulario pequeño condiciona la calidad de la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta métricas de perplexity sobre su propio corpus:

| Métrica | Valor |
|---|---|
| Perplexity en el mundo de entrenamiento | 1,13 |
| Perplexity en respuestas no vistas | 641 |
| Parámetros | 1.637.377 |
| Tokens de entrenamiento | 199.249 |

## Requisitos de hardware

- Inferencia en CPU: el modelo está implementado en NumPy puro y entrena e infiere en CPU; con 1,6 millones de parámetros en float32, el peso de los parámetros es de aproximadamente 6,5 MB, por lo que cabe holgadamente en memoria de cualquier equipo.
- GPU: no requiere GPU; no se documenta soporte para CUDA ni para aceleradores.
- GPU de consumo: irrelevante para este modelo; cualquier CPU moderna es suficiente.
- Despliegue: runtime JavaScript en navegador (`wvy0_runtime.js`) y ejecución directa con NumPy en Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (modelos de lenguaje entrenados desde cero sobre corpus propios de ~200K tokens con implementación en NumPy). Las comparaciones habituales con modelos preentrenados de gran escala no serían homogéneas en parámetros, datos ni propósito.

## Limitaciones y advertencias

- Sobreajuste severo: perplexity 1,13 en entrenamiento frente a 641 en respuestas no vistas; el modelo reproduce y recombina respuestas del corpus más que generalizar.
- Contexto muy corto: 16 tokens, insuficiente para conversaciones multi-turno o documentos.
- Vocabulario reducido: 1.473 tokens BPE, lo que limita la cobertura léxica y la calidad de la generación.
- Riesgo de contenido obsoleto o incoherente: la model card advierte que algunas líneas de saludo antiguas del corpus aún dicen que el modelo solo conoce LSD.
- Idioma: únicamente inglés del corpus; no se documenta soporte para castellano ni otros idiomas.
- Uso en producción: el propio autor indica que seguridad, emergencias y preguntas fuera de dominio deben resolverse con reglas fijas, nunca con el modelo; se recomienda el mismo patrón (verificador y biblioteca de hechos) en cualquier integración.
- Licencia: CC-BY-4.0 permite uso comercial con atribución; no se documentan restricciones adicionales, pero debe verificarse el cumplimiento de atribución a StarpowerTechnology.
- Sin benchmarks estándar publicados: no es posible evaluar su rendimiento frente a modelos convencionales con métricas comparables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarpowerTechnology/WVY-LSD
- Dataset de entrenamiento: https://huggingface.co/datasets/StarpowerTechnology/WVY-World

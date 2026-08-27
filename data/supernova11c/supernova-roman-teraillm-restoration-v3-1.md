# Supernova11c/Supernova-Roman-teraillm-Restoration-V3.1

## Resumen

Supernova Roman Restoration V3.1 es un sistema determinista y basado en reglas para la restauración de nepalí romanizado a escritura devanagari, desarrollado por el usuario Supernova11c. A diferencia de los modelos de lenguaje convencionales, no emplea transformadores, redes neuronales, embeddings ni modelos generativos: se apoya en un diccionario extenso, reglas contextuales y un mecanismo de fallback conservador. Está diseñado específicamente para el nepalí romanizado, con un enfoque en la precisión y la reproducibilidad de la salida.

El sistema se presenta como una alternativa ligera y eficiente para tareas de transliteración inversa, con un rendimiento declarado del 100 % de exactitud sobre un conjunto de prueba de 198 558 ejemplos. Su tamaño de repositorio es de 0.2 GB, lo que lo hace adecuado para entornos con recursos limitados. La versión actual (V3.1) es la tercera iteración de una serie que incluye también sistemas de embedding y modelos de lenguaje propios del mismo autor, aunque este componente concreto no es un modelo neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema basado en reglas y diccionario (no neuronal) |
| Parametros totales | No aplicable (no hay parametros entrenables) |
| Parametros activos | No aplicable |
| Longitud de contexto | No disponible (procesa frases completas, sin ventana fija) |
| Tipos de cuantizacion | No aplicable (no requiere cuantizacion) |
| Idiomas soportados | ne (nepali) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplicable (no hay pesos; el sistema se distribuye como codigo y datos) |

## Arquitectura y entrenamiento

El sistema no sigue una arquitectura de red neuronal. Su diseño se compone de una secuencia de etapas: primero una búsqueda exacta de frases, seguida de un motor de reglas contextuales, después una consulta de evidencia de palabras derivada del entrenamiento, luego una búsqueda en el diccionario V2 y finalmente un mecanismo de fallback conservador. Este flujo garantiza que la salida sea determinista: la misma entrada produce siempre la misma salida.

El entrenamiento se basa en un conjunto de datos de 1.58 millones de ejemplos, y el sistema V2 del que deriva contiene más de 2.17 millones de mapeos romano-nativo. No se menciona el uso de técnicas como RLHF o DPO, ni tampoco la composición exacta del dataset. La innovación principal reside en la combinación de evidencia lingüística a gran escala con reglas contextuales y un comportamiento de respaldo prudente, evitando errores cuando la entrada no coincide con patrones conocidos.

## Capacidades

- Restauracion de texto nepalí romanizado a escritura devanagari con salida determinista.
- Manejo de frases completas mediante búsqueda exacta y reglas contextuales.
- Soporte de transliteración inversa para nepalí, con un diccionario extenso de más de 2 millones de mapeos.
- Funcionamiento en CPU sin necesidad de GPU ni aceleración hardware.
- Comportamiento conservador ante entradas desconocidas, reduciendo el riesgo de salidas incorrectas.
- No incluye capacidades de generación de texto, razonamiento, código, visión, tool calling ni agentes, al no ser un modelo de lenguaje.

## Casos de uso

- Normalización de texto nepalí en redes sociales: convertir publicaciones escritas en alfabeto latino a devanagari para su análisis o archivado, aprovechando la alta precisión y el determinismo.
- Preprocesamiento de corpus para NLP: transformar grandes volúmenes de texto romanizado nepalí a devanagari antes de entrenar modelos de lenguaje, garantizando consistencia y sin necesidad de GPU.
- Sistemas de búsqueda y recuperación de información: indexar documentos nepalíes en devanagari a partir de consultas romanizadas, usando la restauración como paso previo.
- Herramientas de accesibilidad: permitir a usuarios que escriben en alfabeto latino generar texto devanagari correcto en aplicaciones de mensajería o procesadores de texto.
- Archivado digital de contenido nepalí: convertir transcripciones romanizadas de documentos históricos o literarios a su forma nativa para preservación y consulta.
- Integración en pipelines de traducción automática: normalizar la entrada romanizada antes de pasarla a un traductor neuronal, mejorando la calidad de la traducción al eliminar ambigüedades ortográficas.

## Benchmarks y rendimiento

La model card reporta un 100 % de exactitud sobre un conjunto de prueba de 198 558 ejemplos, con 0 predicciones incorrectas. No se proporcionan resultados comparativos con otros sistemas de transliteración, ni métricas adicionales como F1, precisión por categoría o velocidad de procesamiento. No se han publicado benchmarks externos en la información disponible.

## Requisitos de hardware

- No requiere GPU: funciona exclusivamente en CPU.
- Consumo de memoria bajo: el repositorio ocupa 0.2 GB, por lo que puede ejecutarse en sistemas con menos de 1 GB de RAM disponible.
- Adecuado para entornos de producción ligeros, contenedores Docker o funciones serverless.
- No necesita bibliotecas de inferencia neuronal como vLLM, llama.cpp u Ollama; basta con ejecutar el código del sistema (lenguaje no especificado en la información).
- Latencia y throughput no documentados, pero al ser un sistema basado en reglas y diccionario, se espera un rendimiento muy superior al de un modelo neuronal en tareas de transliteración.

## Comparativa con modelos similares

No se dispone de información sobre otros sistemas de restauración romanizado-devanagari comparables en la documentación proporcionada. El autor menciona una versión V4 como sucesora, pero no se ofrecen datos de rendimiento de otros modelos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un sistema específico para nepalí romanizado; no funciona con otros idiomas ni con escritura devanagari directa.
- No es un modelo de lenguaje: no genera texto, no razona, no comprende contexto semántico más allá de las reglas programadas.
- La precisión del 100 % se reporta sobre un conjunto de prueba concreto; no se garantiza el mismo rendimiento en datos reales con variaciones dialectales o errores tipográficos no cubiertos.
- El comportamiento conservador puede dejar sin convertir entradas muy alejadas de los patrones aprendidos, devolviendo la entrada original o una salida parcial.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías explícitas sobre la calidad del sistema en producción.
- No se especifica el lenguaje de implementación ni la interfaz de programación, lo que puede dificultar la integración en algunos entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Supernova11c/Supernova-Roman-teraillm-Restoration-V3.1
- Perfil del autor: https://huggingface.co/Supernova11c
- Listado de modelos del autor: https://huggingface.co/Supernova11c/models
- Conjuntos de datos del autor: https://huggingface.co/Supernova11c/datasets
- Modelo relacionado (embedding): https://huggingface.co/Supernova11c/Supernova-teraillm-Embedding-V3
- Modelo relacionado (LLM): https://huggingface.co/Supernova11c/Supernova-llm-terai

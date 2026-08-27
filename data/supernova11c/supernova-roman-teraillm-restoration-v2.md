# Supernova11c/Supernova-Roman-teraillm-Restoration-V2

## Resumen

Supernova Roman Restoration V2 es un sistema determinista de restauración de texto romanizado nepalí a su forma nativa en devanagari, desarrollado por el proyecto Supernova. A diferencia de la mayoría de modelos de transliteración actuales, no emplea redes neuronales, transformers ni modelos generativos: se basa en una búsqueda exacta en un diccionario curado de pares romanizado→devanagari. Esto garantiza salidas predecibles y sin alucinaciones, a costa de no poder manejar entradas fuera del vocabulario.

El modelo se publica bajo licencia Apache 2.0, con soporte para nepalí e inglés, y ocupa aproximadamente 0,1 GB. Está pensado como una herramienta de normalización de texto para pipelines de procesamiento de lenguaje natural, especialmente en contextos donde el nepalí romanizado es frecuente (redes sociales, transcripciones informales, datos de usuario). El autor ya ha publicado una versión posterior, V3.1, que probablemente amplía el diccionario o mejora el sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema basado en reglas y diccionario (lookup exacto) |
| Parametros totales | No aplica (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (procesa entrada de longitud arbitraria, limitada por memoria) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | nepalí (ne), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (diccionario en formato de datos, probablemente JSON o similar) |

## Arquitectura y entrenamiento

El sistema no sigue una arquitectura de aprendizaje profundo. Según la model card, el flujo es: entrada romanizada → búsqueda exacta en diccionario → salida en devanagari. Las entradas que no coinciden con ninguna entrada del diccionario se dejan sin cambios. No hay fase de entrenamiento en el sentido clásico; el diccionario se construye de forma curada, presumiblemente de manera manual o semiautomática. No se menciona el uso de RLHF, DPO ni ningún otro método de ajuste. La innovación principal es su carácter determinista y ligero, que lo hace adecuado para entornos donde se requiere reproducibilidad total y bajo coste computacional.

## Capacidades

- Restauración de texto romanizado nepalí a devanagari mediante búsqueda exacta en diccionario.
- Salida determinista: la misma entrada siempre produce la misma salida.
- Sin alucinaciones: solo transforma palabras que están en el diccionario; el resto permanece intacto.
- Soporte bilingüe: maneja entradas en nepalí romanizado y deja el texto en inglés sin modificar.
- No requiere GPU ni hardware especializado; funciona como una utilidad de línea de comandos o biblioteca.
- No incluye capacidades de generación de texto, razonamiento, código, visión ni tool calling.

## Casos de uso

- Normalización de datos de redes sociales: convertir publicaciones o comentarios en nepalí romanizado a devanagari para su posterior análisis o indexación. El sistema es adecuado porque es rápido y no introduce errores inventados.
- Preparación de corpus para entrenamiento de modelos NLP: limpiar y estandarizar texto nepalí romanizado antes de usarlo como datos de entrenamiento o evaluación.
- Pipelines de transcripción: restaurar la forma nativa de nombres propios, lugares o términos técnicos que suelen aparecer romanizados en transcripciones automáticas.
- Sistemas de búsqueda y recuperación: normalizar consultas de usuario en nepalí romanizado para hacerlas coincidir con documentos indexados en devanagari, mejorando la precisión de la búsqueda.
- Herramientas de accesibilidad: convertir texto romanizado a devanagari para lectores de pantalla o aplicaciones de lectura en nepalí.
- Integración en flujos de datos ETL: como paso de transformación determinista en procesos de ingesta de datos multilingües, garantizando consistencia entre registros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un sistema basado en diccionario, su rendimiento depende de la cobertura del vocabulario, pero no se proporcionan métricas de precisión, recall ni comparaciones con otros sistemas de transliteración.

## Requisitos de hardware

- No requiere GPU; funciona en CPU.
- Consumo de memoria bajo: el diccionario ocupa aproximadamente 0,1 GB en disco, y la memoria en tiempo de ejecución es proporcional al tamaño del diccionario cargado.
- Puede ejecutarse en cualquier máquina con Python u otro lenguaje que pueda cargar el diccionario, incluyendo entornos embebidos o servidores de baja capacidad.
- No se han publicado mediciones de latencia o throughput, pero al ser una búsqueda en diccionario, se espera que sea del orden de microsegundos por palabra.
- Opciones de despliegue: integración directa en scripts, servicios REST ligeros o funciones serverless.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (restauración determinista de nepalí romanizado). Los sistemas de transliteración basados en redes neuronales, como los basados en transformers, ofrecen mayor cobertura pero introducen no determinismo y riesgo de errores. No se puede realizar una comparativa cuantitativa sin datos de benchmarks.

## Limitaciones y advertencias

- Cobertura limitada: solo restaura palabras presentes en el diccionario; cualquier término fuera de él se deja sin cambios, lo que puede producir salidas mixtas (devanagari y romanizado) en textos reales.
- Sin manejo de variantes ortográficas: la búsqueda es exacta, por lo que variaciones en la romanización (p. ej., "kathmandu" vs "kathmandu") no se normalizan a menos que estén explícitamente en el diccionario.
- No es un modelo generativo: no puede inferir la forma devanagari de palabras nuevas o inventadas.
- Dependencia de la calidad del diccionario: errores u omisiones en el diccionario afectan directamente a la precisión del sistema.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exhaustividad del diccionario.
- La versión V2 está superada por la V3.1, que probablemente corrige limitaciones de cobertura; se recomienda evaluar la versión más reciente antes de adoptar esta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Supernova11c/Supernova-Roman-teraillm-Restoration-V2
- Dataset asociado: https://huggingface.co/datasets/Supernova11c/Supernova-teraillm
- Otros modelos del autor: https://huggingface.co/Supernova11c (página de perfil)
- Reranker relacionado: https://huggingface.co/Supernova11c/Supernova-teraillm-reranker-v1
- Embedding V2: https://huggingface.co/Supernova11c/Supernova-teraillm-Embedding-V2

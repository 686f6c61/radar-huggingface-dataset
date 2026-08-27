# tachiwin/tokenizer

## Resumen

Tachiwin es un tokenizador multilingüe de tipo ByteLevel-BPE desarrollado por el proyecto homónimo, una iniciativa de código abierto centrada en lenguas indígenas de México, con especial atención al tutunakú. Este tokenizador está diseñado para servir como componente de preprocesamiento en modelos de lenguaje para lenguas con pocos recursos, donde los tokenizadores estándar suelen fragmentar excesivamente el texto. Su corpus de entrenamiento está ponderado al 70% con lenguas exóticas (modernas y antiguas), complementado con inglés, español y código, lo que lo hace especialmente útil para tareas multilingües y de preservación lingüística.

El tokenizador se entrena con la librería Hugging Face Tokenizers, utilizando un vocabulario objetivo de 256.000 tokens y un alfabeto ByteLevel completo. Incluye 282 tokens especiales y 248 etiquetas de lenguaje humano, lo que permite anotar el idioma de cada segmento. El corpus total materializado es de 457.298.383 bytes (0,426 GiB), y el entrenamiento se realiza mediante un generador de líneas en streaming, lo que garantiza un uso de memoria constante independientemente del tamaño del corpus. Aunque no se trata de un modelo de lenguaje completo, su diseño lo hace adecuado como capa de tokenización para futuros LLM multilingües.

La relevancia actual de este tokenizador radica en la creciente atención a lenguas minorizadas y la necesidad de herramientas de NLP que no las excluyan. Al estar disponible públicamente en Hugging Face, permite a investigadores y desarrolladores integrar tokenización de alta calidad para lenguas indígenas sin depender de soluciones propietarias. No obstante, la falta de una licencia explícita y de una lista detallada de idiomas soportados limita su adopción inmediata en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByteLevel-BPE (Hugging Face Tokenizers) |
| Parametros totales | No aplica (tokenizador, no modelo de lenguaje) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (orientado a lenguas indigenas de Mexico, sin lista explicita) |
| Licencia | No disponible |
| Formato de pesos | tokenizer.json (formato Hugging Face Tokenizers) |

## Arquitectura y entrenamiento

El tokenizador emplea un modelo BPE (Byte Pair Encoding) a nivel de bytes, entrenado con la API `Tokenizer.train_from_iterator` de Hugging Face Tokenizers. El proceso utiliza un generador de líneas en streaming, lo que permite procesar corpus de cualquier tamaño sin agotar la memoria. El alfabeto inicial es el alfabeto ByteLevel completo, y se ha deshabilitado la regex GPT-2, lo que significa que la segmentación se realiza directamente sobre bytes sin preprocesamiento de espacios o puntuación. No se aplica ningún normalizador Unicode, por lo que la tokenización es sensible a las variantes de codificación.

El corpus de entrenamiento está compuesto por un 70% de datos de lenguas exóticas (modernas y antiguas), un 10% de inglés, un 10% de español y un 10% de código. La parte de lenguas exóticas utiliza todo el corpus disponible, preservando su composición moderna/antigua. El vocabulario objetivo es de 256.000 tokens, con 282 tokens especiales y 248 etiquetas de lenguaje humano. El entrenamiento no es resumible internamente (el entrenador BPE de Hugging Face no expone un checkpoint de merges), por lo que si se interrumpe, debe reiniciarse desde cero. Sin embargo, la preparación del corpus sí es resumible mediante shards.

## Capacidades

- Tokenizacion multilingue de nivel de bytes, capaz de procesar texto en lenguas indigenas, ingles, espanol y codigo.
- Preservacion exacta de ida y vuelta (round-trip): la tokenizacion y detokenizacion no pierden informacion, segun la evaluacion realizada.
- Soporte de etiquetas de lenguaje humano (248 etiquetas), lo que permite anotar el idioma de cada segmento tokenizado.
- Manejo de corpus de gran tamano mediante streaming, con uso de memoria constante.
- Vocabulario amplio de 256.000 tokens, disenado para reducir la fragmentacion en lenguas con morfologia rica.
- Compatible con el ecosistema Hugging Face Tokenizers, por lo que puede integrarse directamente en pipelines de NLP.

## Casos de uso

- Preprocesamiento para entrenar modelos de lenguaje en lenguas indigenas: el tokenizador puede usarse como capa de entrada para LLM especificos de tutunaku u otras lenguas de Mexico, reduciendo la perdida de informacion frente a tokenizadores genericos.
- Traduccion automatica multilingue: al incluir etiquetas de lenguaje y un corpus ponderado hacia lenguas exotica, es adecuado para sistemas de traduccion que necesitan tokenizar de forma consistente entre idiomas con pocos recursos.
- Sistemas de transcripcion y preservacion linguistica: la preservacion exacta de ida y vuelta garantiza que los textos originales puedan reconstruirse sin errores, util para digitalizar archivos historicos o contemporaneos.
- Generacion de codigo con soporte multilingue: el 10% de codigo en el corpus permite tokenizar fragmentos de programacion, aunque no es su uso principal.
- Analisis de sentimiento o clasificacion de textos en lenguas minorizadas: al tokenizar correctamente estas lenguas, se pueden entrenar clasificadores con mejor rendimiento que usando tokenizadores estandar.
- Desarrollo de asistentes virtuales o chatbots en lenguas indigenas: la tokenizacion eficiente es un requisito previo para cualquier sistema conversacional en estos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion de fertilidad por idioma (caracteres/token, tokens/caracter, bytes UTF-8/token, tokens/byte UTF-8 y preservacion de ida y vuelta), pero no se proporcionan los valores numericos en el README. Los artefactos de evaluacion (evaluation/language_fertility.csv, evaluation_summary.json) estan disponibles en el repositorio, pero no se han incluido en la informacion facilitada.

## Requisitos de hardware

- Al ser un tokenizador, no requiere GPU ni VRAM. Puede ejecutarse en cualquier CPU, incluso en entornos con recursos minimos.
- El entrenamiento del tokenizador se realizo con un corpus de 0,426 GiB, por lo que el proceso de entrenamiento es viable en una maquina con 4-8 GB de RAM.
- Para inferencia (tokenizacion de texto), el uso de memoria es proporcional al tamano del vocabulario (256.000 tokens) y al texto de entrada, pero en la practica es despreciable.
- Se integra con la libreria Hugging Face Tokenizers, por lo que puede usarse en Python, Rust o via CLI. No requiere herramientas especificas de despliegue como vLLM u Ollama, ya que no es un modelo generativo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa con otros tokenizadores. Como referencia cualitativa, se puede comparar con tokenizadores BPE genericos como el de GPT-2 (vocabulario de 50.257 tokens) o el de Llama 2 (32.000 tokens), que estan optimizados para ingles y lenguas mayoritarias. Tachiwin se diferencia por su vocabulario mucho mayor (256.000) y su corpus ponderado hacia lenguas indigenas, lo que deberia reducir la fragmentacion en esos idiomas. Sin embargo, no hay datos publicos de fertilidad comparativa.

## Limitaciones y advertencias

- No se especifica una licencia, lo que impide su uso comercial sin autorizacion explicita del autor.
- La lista de idiomas soportados no esta documentada; solo se menciona el enfoque en lenguas indigenas de Mexico, con tutunaku como caso destacado en el repositorio de GitHub.
- Al deshabilitar la regex GPT-2 y el normalizador Unicode, la tokenizacion puede comportarse de forma inesperada con textos que contengan caracteres especiales o variantes de codificacion no contempladas.
- El entrenamiento no es resumible internamente; si se interrumpe durante la fase de BPE, debe reiniciarse por completo.
- No hay garantias de rendimiento en tareas downstream, ya que no se han publicado evaluaciones de modelos entrenados con este tokenizador.
- El corpus de lenguas exotica esta limitado a 0,426 GiB, lo que puede no ser representativo de todas las variantes dialectales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tachiwin/tokenizer
- Repositorio de notebooks y herramientas (GitHub): https://github.com/ljcamargo/tachiwin_notebooks
- Modelo relacionado (Tachiwin-OCR-1.5): https://huggingface.co/tachiwin/Tachiwin-OCR-1.5

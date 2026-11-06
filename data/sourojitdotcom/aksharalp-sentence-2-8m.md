# sourojitdotcom/AksharaLP-Sentence-2.8M

## Resumen

AksharaLP-Sentence-2.8M es un modelo compacto de transliteración de hindi romanizado a escritura devanagari, desarrollado por el usuario sourojitdotcom y publicado en Hugging Face bajo licencia Apache 2.0. No es un transformer generativo al uso: es un sistema híbrido compuesto por un modelo de palabras (989K parámetros) que propone candidatos de escritura para cada token romanizado y un modelo de lenguaje neuronal en hindi (2,77M parámetros) que desambigua esas propuestas de forma conjunta a nivel de frase. El problema que aborda es concreto: la transliteración palabra a palabra falla en casos donde la forma romanizada es ambigua y solo el contexto de la frase determina la grafía correcta (por ejemplo, *hu* puede ser हूं o हुआ, y *pata* puede ser पता o पाता).

La relevancia del modelo reside en su tamaño y despliegue: el paquete completo ocupa 10,85 MB y el complemento de desambiguación 2,93 MB, lo que permite ejecutarlo íntegramente en el navegador mediante JavaScript y Web Workers, sin backend ni GPU. Está orientado a aplicaciones de entrada de texto en dispositivos con recursos limitados, donde el usuario teclea hindi con caracteres latinos y necesita conversión fiable a devanagari.

El modelo se evaluó sobre el conjunto de test de Dakshina (4.976 frases en hindi romanizado), con resultados declarados por el autor de 89,44% de precisión por palabra, 26,73% de coincidencia exacta de frase, CER de 3,93 y WER de 10,78. La arquitectura exacta del modelo de lenguaje no se detalla en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema híbrido: modelo de palabras (propuesta de candidatos) + modelo de lenguaje neuronal en hindi para desambiguación a nivel de frase; arquitectura interna del LM no disponible |
| Parametros totales | 3,76M (2,77M del modelo de lenguaje + 989K del modelo de palabras) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hindi (hi) romanizado y devanagari; inglés (en) como etiqueta secundaria |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el despliegue se describe como JavaScript ejecutable en navegador; tamaño del paquete completo 10,85 MB y complemento 2,93 MB) |

## Arquitectura y entrenamiento

El sistema combina dos componentes. El modelo de palabras (989K parámetros) genera, para cada token romanizado de entrada, una lista de candidatos de escritura en devanagari. Sobre esas listas actúa un modelo de lenguaje neuronal en hindi de 2,77M parámetros que evalúa las combinaciones de candidatos de forma conjunta para toda la frase y selecciona la secuencia más probable. Según la model card, las 132.299 palabras de salida auditadas no contenían ninguna fuera de su lista de candidatos, lo que indica que el LM solo reordena propuestas y no genera grafías nuevas.

Los datos de entrenamiento declarados son ai4bharat/IndicCorpV2 y ai4bharat/Aksharantar. No se especifica el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. La evaluación se realizó sobre el split de test de google/dakshina, con 4.976 frases. El autor indica que la configuración se eligió únicamente sobre validación y conjuntos de desarrollo internos, y que las métricas provienen de una única ejecución de la configuración publicada, con intervalos de confianza calculados por bootstrap pareado sobre frases (2.000 remuestreos, semilla 0).

## Capacidades

- Transliteración de hindi romanizado a devanagari a nivel de frase, no solo de palabra.
- Desambiguación contextual de formas romanizadas ambiguas (por ejemplo, *hu* → हूं frente a हुआ; *hai* → है frente a हैं; *pata* → पता frente a पाता).
- Ejecución íntegra en el dispositivo, incluido el navegador, mediante JavaScript y Web Workers.
- Funcionamiento sin conexión y sin backend una vez descargado el paquete.
- Conservación de la lista de candidatos del modelo de palabras: la salida siempre pertenece a las propuestas generadas.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Teclados y métodos de entrada en navegador: el usuario escribe hindi con letras latinas y el modelo convierte la frase completa a devanagari en el propio navegador, sin enviar texto a un servidor, gracias a los 10,85 MB del paquete.
- Aplicaciones web de edición de texto en hindi: integración como capa de transliteración en editores o formularios, ejecutada en un Web Worker para no bloquear la interfaz.
- Procesamiento de mensajes informales: normalización de texto romanizado típico de chats (por ejemplo, `mai ghr pe hu` → मैं घर पे हूं), donde la desambiguación por frase corrige errores que un modelo por palabra no resuelve.
- Digitalización de contenido escrito en romanizado: conversión de transcripciones, subtítulos o notas informales a devanagari para su publicación o archivado.
- Aplicaciones educativas de aprendizaje de hindi: mostrar al estudiante la forma devanagari correcta de una frase romanizada y señalar las diferencias respecto a una conversión literal.
- Despliegue en entornos con recursos muy limitados: dispositivos sin GPU, navegadores de gama baja o aplicaciones de escritorio que necesitan transliteración sin dependencia de servicios en la nube.
- Preprocesamiento en pipelines de PLN: normalización de texto hindi romanizado antes de tareas posteriores de análisis, búsqueda o indexación.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Dakshina (hindi romanizado, 4.976 frases). No verificados de forma independiente.

| Metrica | Valor | Notas |
|---|---|---|
| Precisión por palabra (word accuracy) | 89,44% | — |
| Coincidencia exacta de frase (exact match) | 26,73% | Frases completas exactamente correctas |
| CER | 3,93 | Tasa de error de caracteres |
| WER | 10,78 | Tasa de error de palabras |

Comparación con el modelo de palabras subyacente (v2), según la model card:

| Metrica | Modelo de palabras (v2) | Modelo de frase (v3) | Diferencia |
|---|---|---|---|
| Frases exactas | 25,71% (implícito) | 26,73% | +1,02 puntos (IC 95%: 0,40–1,65) |
| Palabras correctas | 89,02% (implícito) | 89,44% | +0,42 puntos (IC 95%: 0,33–0,51) |
| CER | 4,07 | 3,93 | −0,14 |
| WER | 11,20 | 10,78 | −0,42 |

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en CPU, incluido el navegador.
- GPU: no requiere GPU. No se documentan requisitos de aceleración por hardware.
- Compatibilidad con GPU de consumo: irrelevante, ya que el despliegue objetivo es en dispositivo sin acelerador.
- Tamaño de despliegue: paquete completo de 10,85 MB; complemento de desambiguación de 2,93 MB.
- Opciones de despliegue: ejecución en navegador mediante JavaScript y Web Workers; demo en Hugging Face Spaces. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los sistemas de transliteración hindi romanizado a devanagari suelen implementarse con modelos seq2seq o transformers de mayor tamaño, pero no se aportan datos que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AksharaLP-Sentence-2.8M | 3,76M | No disponible | Híbrido palabra + LM de frase | Apache 2.0 | Hugging Face, demo en Spaces |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- La coincidencia exacta de frase es baja (26,73%): aproximadamente tres de cada cuatro frases no se reproducen exactamente, aunque el error a nivel de carácter sea reducido (CER 3,93).
- La model card reconoce casos que el sistema no corrige (por ejemplo, `Boht ache h Bhai`, `boht accha laga`, `mein bazaar ja rahi hu`, `nahi pata`), lo que indica que la desambiguación contextual no cubre todas las variantes del hindi romanizado informal.
- La cobertura se limita al hindi y su romanización; no se documenta soporte para otras lenguas indias ni para variantes regionales.
- No se especifican sesgos conocidos ni comportamiento ante dominios especializados (técnico, jurídico, médico).
- No se detalla la longitud máxima de frase soportada ni el comportamiento con entradas muy largas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene validar el rendimiento en el dominio concreto de producción antes de desplegar, dado el bajo exact match de frase.
- No se documentan mecanismos de cuantización ni formatos de pesos estándar, lo que puede dificultar la integración con frameworks de inferencia convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sourojitdotcom/AksharaLP-Sentence-2.8M
- Demo en vivo (Hugging Face Spaces): https://huggingface.co/spaces/sourojitdotcom/AksharaLP-Sentence-demo
- Dataset IndicCorpV2: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Dataset Aksharantar: https://huggingface.co/datasets/ai4bharat/Aksharantar
- Dataset Dakshina (evaluación): https://huggingface.co/datasets/google/dakshina
- Repositorio del modelo (assets y casos): https://huggingface.co/sourojitdotcom/AksharaLP-Sentence-2.8M/tree/main

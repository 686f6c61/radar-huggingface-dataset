# veripazari/cevahir-ai

## Resumen

Cevahir AI es un proyecto de investigación de código abierto desarrollado originalmente por el autor «myylogic» y archivado en Hugging Face por la plataforma turca VeriPazarı. Su componente más reciente, denominado Cevahir Zihin («mente viva»), no es una red neuronal en el sentido convencional: según la documentación del autor, carece de matrices de pesos, vectores de embedding, retropropagación y mecanismo de atención softmax. Se presenta como un sistema de «mente de evidencia viva» que almacena relaciones como vínculos y conserva la procedencia de cada uno (observado, contado, imitado, inferido o imaginado).

El repositorio incluye además un motor Transformer previo, del que no se detallan parámetros ni arquitectura concreta en la información disponible. El modelo se distribuye sin pesos publicados: el tamaño del repositorio en Hugging Face es de 0.0 GB y no se ofrece pipeline de inferencia. El uso previsto es la ejecución local mediante Python 3.11 o superior, con dependencias de `torch` y `numpy`, arrancando con `python -m zihin`.

La relevancia del proyecto es fundamentalmente experimental: propone una arquitectura alternativa a los transformers basada en un mecanismo de «foco de siete posiciones» (siete unidades activas por instante), sin ventana de contexto tradicional, con aprendizaje en línea durante cada conversación y sin fase de entrenamiento separada. El modelo está orientado al idioma turco y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de «mente de evidencia viva» (no transformer): vínculos con procedencia, foco de siete posiciones, sin backpropagation ni softmax; el repositorio incluye además un motor transformer previo sin especificar |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica: el sistema declara no tener ventana de contexto; solo lee los vínculos de las siete unidades en foco |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr); se puede iniciar una mente en otro idioma con `--dil diger` |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el estado se persiste en un fichero propietario `cevahir.zihin` en `~/.cevahir/zihin/` |

## Arquitectura y entrenamiento

La arquitectura descrita para Cevahir Zihin no sigue el paradigma transformer: no hay matrices de pesos, embeddings, retropropagación ni atención softmax. Cada relación se almacena como un vínculo con metadatos de procedencia (visto directamente, contado por otro, imitado, acción propia, inferido o imaginado). El mecanismo de atención se limita a siete unidades en foco simultáneamente («foco de siete posiciones»), y la expectativa se calcula con la regla `e = c·(f − ½) + ½`. El autor afirma que el coste por operación crece muy lentamente con el tamaño de la mente: aproximadamente 2 ms en una mente pequeña y unos 4 ms con tres millones de vínculos.

No existe una fase de entrenamiento separada: el sistema aprende durante cada conversación a partir de la interacción, la lectura de documentos (`!oku` / `!read` para .txt, .md, .docx, .pdf, .json, .tsv y código fuente) y la enseñanza explícita de pares pregunta-respuesta (`!ogret` / `!teach`). Dispone de mecanismos de «olvido» con retirada completa de la evidencia de una experiencia (`!unut`), de sueño y ensoñación (`!uyu` / `!sleep`), de pensamiento interno (`!dusun` / `!think`) y de introspección (`!kendin` / `!introspect`). El autor reporta un experimento de recuerdo tras una sola lectura: de 200 intentos, el sistema reprodujo 145 veces una frase válida que comenzaba por las dos primeras palabras dadas, y completó correctamente la frase en 60 de 61 casos en los que solo una frase empezaba por ese par; el transformer pequeño más potente entrenado con los mismos documentos durante 50 minutos solo produjo una frase válida en 41 ocasiones. También menciona aprendizaje a partir de resultados en un test con seis funciones pequeñas y tres candidatos de completado por función.

## Capacidades

- Conversación en turco con aprendizaje en línea: el sistema arranca sin conocimiento lingüístico y adquiere el idioma a partir de la interacción con el usuario.
- Lectura e ingesta de documentos en múltiples formatos (.txt, .md, .docx, .pdf, .json, .tsv y código fuente) para ampliar su base de vínculos.
- Enseñanza explícita de pares pregunta-respuesta mediante ficheros TSV en UTF-8.
- Recuerdo a partir de un inicio de frase: el autor reporta completado de frases previamente leídas a partir de las dos primeras palabras.
- Expresión de incertidumbre: el sistema declara un estado interno medible de «no saber» cuando carece de evidencia.
- Sueño y ensoñación sobre los temas del día, con depuración posterior de qué sueños se correspondieron con la realidad.
- Introspección y «voz interna» mediante comandos dedicados.
- Olvido con retirada completa de la evidencia asociada a una experiencia.
- Aprendizaje a partir de resultados de test en tareas de selección de completados (según el autor; la escritura de código nuevo sigue en investigación).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles; únicamente se menciona `pillow` como dependencia opcional para imágenes, sin detallar la funcionalidad.

## Casos de uso

- Investigación en arquitecturas alternativas a transformers: el sistema permite experimentar con un paradigma sin retropropagación, sin embeddings y con atención de siete posiciones, útil para grupos que estudien mecanismos de memoria y procedencia de la evidencia.
- Asistentes conversacionales en turco de dominio acotado: tras enseñar pares pregunta-respuesta con `!ogret` y leer documentación propia con `!oku`, el sistema puede responder sobre ese corpus concreto sin necesidad de GPU ni de un pipeline de inferencia convencional.
- Archivado y consulta de documentación interna: la ingesta de ficheros .pdf, .docx y .md permite construir una memoria consultable de manuales o procedimientos, con la particularidad de que cada vínculo conserva su origen.
- Sistemas con requisitos estrictos de trazabilidad: al almacenar la procedencia de cada relación (observado, contado, inferido, imaginado), encaja en escenarios donde se necesita distinguir qué se sabe de primera mano y qué se ha inferido.
- Prototipado educativo: el arranque mediante `python -m zihin` con solo `torch` y `numpy` como dependencias facilita su uso en docencia para ilustrar aprendizaje en línea, olvido y mecanismos de memoria.
- Experimentos de retirada de información (derecho al olvido): el comando `!unut` permite revocar la evidencia de una experiencia concreta, lo que resulta útil para estudiar borrado selectivo de conocimiento en sistemas de memoria.
- Despliegue en entornos sin GPU: el autor no describe requisitos de acelerador; el sistema se ejecuta como proceso Python local y persiste su estado en un único fichero, lo que simplifica su distribución en equipos de sobremesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta mediciones internas cualitativas y de latencia:

| Medicion reportada por el autor | Resultado |
|---|---|
| Recuerdo de frase a partir de dos palabras iniciales (200 intentos) | 145 frases válidas |
| Completado cuando solo una frase empieza por el par dado (61 casos) | 60 completados correctos |
| Comparación con transformer pequeño entrenado 50 minutos con los mismos documentos | 41 frases válidas frente a 145 del sistema |
| Latencia por operación en mente pequeña | ~2 ms |
| Latencia por operación con 3 millones de vínculos | ~4 ms |

## Requisitos de hardware

- VRAM estimada: no disponible; no se describen pesos ni modelo neuronal que cargar en memoria de vídeo.
- GPU recomendadas: no disponible; el proyecto no menciona aceleración por GPU.
- Compatibilidad con GPU de consumo: no se especifica; el sistema se ejecuta como proceso Python con `torch` y `numpy`.
- Entorno de ejecución: Python 3.11 o superior; Linux, macOS o Windows (PowerShell mediante `cevahir.ps1`).
- Dependencias: `torch` y `numpy`; opcionales `python-docx` (Word), `pypdf` (PDF) y `pillow` (imágenes).
- Opciones de despliegue: ejecución local con `python -m zihin`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Persistencia: estado guardado en `~/.cevahir/zihin/cevahir.zihin` (Windows: `%USERPROFILE%\.cevahir\zihin\cevahir.zihin`); la variable `CEVAHIR_HOME` cambia la carpeta y `--kaydetme` desactiva el guardado.
- Latencia y throughput: solo se reportan las cifras de latencia por operación indicadas en la sección anterior; no hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Cevahir AI (Cevahir Zihin) | no disponible | sin ventana de contexto (foco de siete posiciones) | Mente de evidencia viva, sin backpropagation | Apache 2.0 | Repositorio de código; sin pesos publicados (0.0 GB) |
| Transformer pequeño citado por el autor | no disponible | no disponible | Transformer convencional | no disponible | no disponible |
| Modelos de la familia Llama / Mistral / Qwen | no disponible en esta ficha | no disponible en esta ficha | Transformer | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría; el propio autor solo compara con un transformer pequeño entrenado durante 50 minutos en su experimento interno.

## Limitaciones y advertencias

- No es un modelo de pesos publicados: el repositorio de Hugging Face ocupa 0.0 GB y no ofrece pipeline de inferencia; el uso requiere clonar el repositorio de GitHub y ejecutar el código.
- Idioma principal turco: el sistema arranca sin conocimiento lingüístico y solo aprende el idioma que se le enseña; para otros idiomas debe iniciarse con `--dil diger` y no se ha medido cuántos datos necesita una lengua nueva.
- Sin benchmarks estandarizados: las cifras de rendimiento son mediciones internas del autor, no comparables con MMLU, HumanEval o GSM8K.
- Afirmaciones no verificadas de forma independiente: la descripción de una arquitectura sin retropropagación ni embeddings, con estados internos medibles de «no saber» y sueños depurados, procede exclusivamente de la documentación del autor.
- Riesgo de alucinación: no evaluado; el sistema declara un estado de incertidumbre, pero no se han publicado métricas de precisión factual.
- Sin soporte documentado de tool calling, agentes ni multimodalidad real.
- Capacidad de escritura de código nuevo en investigación según el propio autor.
- El estado se guarda en un formato propietario (`cevahir.zihin`) sin documentación de interoperabilidad.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un proyecto de investigación sin pesos ni evaluación independiente, no se recomienda su uso en producción sin validación propia.
- La model card advierte de que el sistema aprende de cada conversación y pide tratarlo con cuidado; no hay garantías sobre la calidad de lo aprendido en línea.

## Enlaces

- Hugging Face: https://huggingface.co/veripazari/cevahir-ai
- Repositorio original en GitHub: https://github.com/myylogic/cevahir-ai
- README en inglés: https://github.com/myylogic/cevahir-ai/blob/main/README.md
- README en turco: https://github.com/myylogic/cevahir-ai/blob/main/README-TR.md
- Teoría y arquitectura: https://github.com/myylogic/cevahir-ai/blob/main/docs/ZIHIN_THEORY.md
- Guía de uso: https://github.com/myylogic/cevahir-ai/blob/main/docs/ZIHIN_KILAVUZ.md
- Mediciones y resultados negativos: https://github.com/myylogic/cevahir-ai/blob/main/research/living_mind_2026_11_15/NOTES.md
- Informes de investigación: https://github.com/myylogic/cevahir-ai/blob/main/docs/publications/README.md
- DOI del archivo de investigación: https://doi.org/10.5281/zenodo.22864660
- Plataforma VeriPazarı: https://veripazari.com.tr

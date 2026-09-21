# strifero/elroy-350m-chat

## Resumen

Elroy-350m-chat es un modelo de lenguaje de 361 millones de parámetros desarrollado por Strife Technologies (usuario strifero en HuggingFace) como proyecto didáctico completamente documentado. Se trata de un decodificador de estilo Llama entrenado desde cero, sin partir de pesos preentrenados, sobre aproximadamente 20.000 millones de tokens de Python educativo e inglés. La variante "chat" que nos ocupa está ajustada con instrucciones de programación mediante la plantilla `<|system|>...<|end|><|user|>...<|end|><|assistant|>`, y se distribuye junto a `elroy_min.py`, un único archivo que contiene el modelo, el tokenizador y un sampler, sin dependencia de `transformers`.

Su relevancia no está en el rendimiento bruto, sino en el carácter reproducible y pedagógico del artefacto: cada línea del tokenizador, del bucle de entrenamiento y del ajuste fino está publicada en el repositorio de GitHub del autor, con un capítulo explicativo por componente. Esto lo convierte en una referencia útil para investigadores y docentes que quieran entender el ciclo completo de construcción de un LLM pequeño, desde la tokenización hasta la evaluación con HumanEval.

Arquitectónicamente es un transformer denso con 24 capas, ancho de 1024, 16 cabezas de atención y una ventana de contexto de 2048 tokens. El tokenizador es un BPE byte-level propio de 32.768 entradas con pre-tokenización consciente de código. Está entrenado con objetivo de siguiente token más fill-in-the-middle sobre la mitad del código, y el repositorio ocupa 0,7 GB en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador denso, estilo Llama |
| Parámetros totales | 360.760.320 (declarados como 361 M en la model card) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No se declaran cuantizaciones publicadas; el repositorio distribuye safetensors (0,7 GB para 360,76 M de parámetros, consistente con fp16) |
| Idiomas soportados | Inglés (en) y código |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Capas | 24 |
| Dimensión del modelo (width) | 1024 |
| Cabezas de atención | 16 |
| Tokenizador | BPE byte-level propio, 32.768 entradas, pre-tokenización consciente de código |
| Plantilla de chat | `<|system|>...<|end|><|user|>...<|end|><|assistant|>` |
| Tamaño del repositorio | 0,7 GB |
| Fecha de creación | 21 de septiembre de 2026 |
| Última actualización | 21 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador denso de tipo Llama con 24 capas, ancho de 1024 y 16 cabezas de atención, lo que sitúa la dimensión por cabeza en 64. La ventana de contexto es de 2048 tokens. No emplea mezcla de expertos (MoE), atención lineal ni arquitecturas híbridas SSM: es un transformer autorregresivo convencional. El tokenizador es propio, un BPE byte-level de 32.768 entradas con pre-tokenización diseñada específicamente para código, lo que evita fragmentaciones habituales en identificadores y símbolos de Python.

El entrenamiento se realizó desde cero sobre aproximadamente 20.000 millones de tokens con la siguiente composición: 45 % Stack-Edu (subconjunto de Python, archivos con licencia permisiva o sin licencia detectada, siguiendo el criterio de The Stack v2), 20 % StarCoderData (Python, permisivo), 25 % FineWeb-Edu (ODC-By) y 10 % Cosmopedia-v2 (ODC-By). El objetivo combina predicción de siguiente token con fill-in-the-middle aplicado sobre la mitad del código, una técnica que habilita el autocompletado de fragmentos en editores. El ajuste fino de la variante chat empleó Magicoder OSS-Instruct (MIT), evol-codealpaca-v1 (Apache-2.0) y un conjunto escrito a mano incluido en el repositorio. El entrenamiento se llevó a cabo en dos NVIDIA RTX A4500 de 20 GB durante aproximadamente seis días. No se documenta en la información disponible el uso de RLHF, DPO u otras técnicas de alineación por preferencias.

## Capacidades

- Generación de texto en inglés con registro instructivo y explicativo.
- Escritura de funciones cortas de Python, mayoritariamente correctas según la evaluación declarada.
- Explicación de conceptos de programación para principiantes.
- Relleno de huecos en código (fill-in-the-middle) gracias al objetivo de entrenamiento, útil para autocompletado.
- Formato de conversación de un solo turno o multiturno mediante la plantilla propia con tokens `<|end|>`.
- Soporte de llamada a herramientas (tool calling): no disponible; no se documenta ni se entrena para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no ha sido entrenado para planificación ni uso de herramientas.
- Capacidades multilingües: limitadas a inglés y código; no hay evidencia de soporte de otros idiomas naturales.
- Capacidades especiales (visión, audio, modo de razonamiento extendido): no disponibles.
- Control de generación mediante `temperature`, `top_p` y parada en `tok.eot` desde `elroy_min.py`.

## Casos de uso

- Tutor de Python para principiantes: el modelo explica conceptos básicos de programación en inglés y genera ejemplos cortos, por lo que encaja en plataformas de aprendizaje que necesiten respuestas breves y sin dependencia de APIs externas.
- Generación de funciones auxiliares en scripts internos: con HumanEval pass@1 del 26,8 % y MBPP del 38,9 %, es adecuado para producir borradores de funciones simples que un desarrollador revise antes de integrar, no para código crítico sin supervisión.
- Autocompletado en editor con fill-in-the-middle: al haberse entrenado con FIM sobre la mitad del código, puede usarse como motor de sugerencias locales en entornos sin conexión y con recursos muy limitados.
- Generación de ejercicios y enunciados para cursos de programación: el modelo puede producir problemas de dificultad inicial junto con una solución de referencia corta, dado su entrenamiento mayoritario sobre Python educativo.
- Docencia e investigación sobre entrenamiento de LLM: el repositorio incluye tokenizador, bucle de entrenamiento y ajuste fino con explicaciones por capítulo, lo que permite replicar el pipeline completo en un curso o artículo técnico.
- Despliegue en hardware de gama baja o en el borde: con 361 M de parámetros y pesos de 0,7 GB, cabe en CPU, portátiles sin GPU dedicada y dispositivos con pocos gigabytes de memoria, algo inviable con modelos de miles de millones de parámetros.
- Prototipado rápido de asistentes de código internos: sirve para validar plantillas de prompt, formatos de parada y flujos de conversación antes de migrar a un modelo mayor.
- Revisión y explicación de fragmentos de código legacy sencillo: puede describir en inglés qué hace una función corta y señalar posibles errores evidentes, siempre con verificación posterior por parte del desarrollador.

## Benchmarks y rendimiento

| Benchmark | pass@1 |
|---|---|
| HumanEval | 26,8 % |
| HumanEval+ | 25,6 % |
| MBPP (sanitized) | 38,9 % |

No se han publicado en la información disponible resultados comparativos con otros modelos, ni datos de MMLU, GSM8K u otros benchmarks de conocimiento general o matemáticas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,7-1,5 GB contando pesos, activaciones y caché KV. Los pesos safetensors ocupan 0,7 GB.
- Caché KV estimada para contexto completo de 2048 tokens en fp16: aproximadamente 0,2 GB (24 capas × 2 tensores × 2048 posiciones × 16 cabezas × 64 dimensiones × 2 bytes).
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) e incluso en CPU con memoria RAM suficiente.
- GPU profesionales: no requiere A100, H100 ni similares; el entrenamiento original usó dos RTX A4500 de 20 GB durante unos seis días, pero la inferencia es viable en hardware muy inferior.
- Opciones de despliegue: el repositorio proporciona `elroy_min.py`, con funciones `load` y `generate`, sin dependencia de `transformers`. No se documenta soporte nativo para vLLM, TGI, Ollama o llama.cpp; el uso de llama.cpp u Ollama requeriría convertir manualmente los pesos a GGUF, algo no cubierto en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia cualitativa, el modelo se sitúa en la categoría de transformadores densos de menos de 500 M de parámetros entrenados desde cero, con contexto de 2048 tokens y licencia Apache-2.0; cualquier comparación con alternativas de esa categoría requeriría consultar sus respectivas fichas, no incluidas aquí.

## Limitaciones y advertencias

- Modelo pequeño: escribe funciones de Python cortas y mayoritariamente correctas, y explica conceptos de nivel inicial, pero no mantiene razonamientos largos ni tareas complejas.
- Alucinación: comete errores con seguridad, según advierte el propio autor; conviene ejecutar el código generado antes de confiar en él.
- Conocimiento muy limitado fuera de Python y sin conocimiento de bibliotecas recientes, lo que lo hace inadecuado para preguntas sobre APIs o versiones actuales.
- Ventana de contexto de solo 2048 tokens, insuficiente para conversaciones largas o ficheros de código extensos.
- Idiomas: únicamente inglés y código; no hay soporte declarado de castellano ni de otros idiomas naturales.
- Seguridad: no ha sido entrenado para rechazar peticiones, por lo que no incorpora mecanismos de alineación de seguridad y no debería exponerse directamente a usuarios finales sin filtros adicionales.
- Licencia Apache-2.0, permisiva y apta para uso comercial, pero los datos de entrenamiento incluyen subsets con criterios de licencia permisiva o "sin licencia detectada" (Stack-Edu), lo que puede generar incertidumbre sobre la procedencia de parte del corpus.
- Datos de ajuste fino con licencias MIT y Apache-2.0 más un conjunto propio, sin documentación detallada de composición.
- Sin soporte documentado en frameworks estándar (`transformers`, vLLM, TGI), lo que limita su integración en infraestructuras ya desplegadas.
- Sesgos: al entrenarse mayoritariamente sobre Python educativo y texto web filtrado por criterios de calidad, puede reproducir sesgos presentes en esas fuentes; no se documenta una evaluación específica de sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/strifero/elroy-350m-chat
- Repositorio de código y documentación del proyecto: https://github.com/strifero/elroy
- Papers, blogs o demos adicionales: no disponible en la información proporcionada (los resultados de búsqueda web obtenidos corresponden a modelos de Google DeepMind y no guardan relación con este modelo).

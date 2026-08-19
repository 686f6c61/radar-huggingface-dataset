# Supernova11c/Supernova-NepaliFast-V4

## Resumen

Supernova-NepaliFast-V4 es un tokenizador especializado en nepalí, desarrollado por el proyecto Supernova AI. A diferencia de un modelo de lenguaje completo, este repositorio publica únicamente un tokenizador de alta velocidad basado en una estructura de datos Trie de coincidencia más larga (longest-match) y un núcleo de codificación optimizado en Cython. Su objetivo es ofrecer una tokenización rápida y con buena cobertura del vocabulario nepalí, superando las limitaciones de versiones anteriores (V3) que fallaban con ciertos caracteres.

La arquitectura es un Trie que busca el token válido más largo en cada posición de carácter, con una implementación nativa en Cython para acelerar el recorrido. El vocabulario abarca los IDs de 0 a 355 (356 tokens) e incluye soporte para inglés. Se posiciona como una alternativa a tokenizadores generalistas como tiktoken o200k_base, con un rendimiento notablemente superior en corpus nepalíes según los benchmarks publicados. Es una liberación experimental bajo licencia Apache-2.0, orientada a la investigación y al desarrollo de modelos nepalíes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Trie de coincidencia más larga con núcleo Cython |
| Parametros totales | no disponible (tokenizador, sin parámetros de red neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | nepalí (ne), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | tokenizer.json (formato Supernova) y extensión Cython (trie_core) |

## Arquitectura y entrenamiento

Supernova-NepaliFast-V4 es un tokenizador, no un modelo de lenguaje entrenado con datos textuales. Su diseño se basa en un Trie de coincidencia más larga: para cada posición de carácter en el texto de entrada, el algoritmo busca el token más largo que exista en el vocabulario, recorriendo el Trie de forma eficiente. El núcleo de codificación está implementado como una extensión Cython (`trie_core`), lo que evita la sobrecarga de Python y permite un alto rendimiento.

El vocabulario se construyó a partir de la versión V3, ampliándolo con ocho caracteres nepalíes que causaban fallos en la implementación anterior (IDs 348-355: ई, छ, ै, २, ०, ८, ३, श). Los IDs originales de V3 se conservan, y la nueva versión mantiene un espacio de IDs de 0 a 355. No se especifican datos de entrenamiento ni procesos de optimización como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Tokenización de texto nepalí con alta velocidad, usando un Trie de coincidencia más larga.
- Soporte de caracteres nepalíes que incluyen marcas combinadas y símbolos devanagari.
- Cobertura de vocabulario en inglés además de nepalí.
- Implementación en Cython que permite un rendimiento superior a tokenizadores basados en BPE como tiktoken.
- API simple para cargar el tokenizador desde `tokenizer.json` y usar la extensión `trie_core` para codificar texto.
- Compatibilidad con el pipeline de generación de texto de Hugging Face (etiqueta `text-generation`), aunque el repositorio solo contiene el tokenizador.

## Casos de uso

- Preprocesamiento para modelos de lenguaje nepalíes: el tokenizador puede integrarse en pipelines de entrenamiento o inferencia para convertir texto nepalí en IDs de token de forma rápida, reduciendo el cuello de botella de tokenización en grandes corpus.
- Normalización y limpieza de datos textuales nepalíes: su capacidad para manejar caracteres combinados y vocabulario especializado lo hace útil para estandarizar texto antes de análisis posteriores.
- Investigación en NLP nepalí: sirve como componente de referencia para estudiar el impacto de la tokenización en el rendimiento de modelos, comparando con alternativas generalistas.
- Sistemas de búsqueda y recuperación de información en nepalí: al tokenizar de forma consistente y rápida, puede mejorar la indexación de documentos en motores de búsqueda.
- Aplicaciones de traducción automática nepalí-inglés: como tokenizador previo en sistemas de traducción que requieren un vocabulario compacto y eficiente para el nepalí.
- Desarrollo de asistentes conversacionales en nepalí: aunque el tokenizador no genera texto, puede alimentar a modelos generativos que lo utilicen como capa de entrada, garantizando una codificación rápida y sin caracteres desconocidos.

## Benchmarks y rendimiento

Según la model card del autor, se realizó un benchmark con un corpus de 6.450.000 caracteres. Los resultados se comparan con tiktoken o200k_base:

| Metrica | Supernova V4 | Tiktoken o200k_base | Relativo |
|---|---:|---:|---:|
| Caracteres/segundo | 12.837.384 | 10.083.356 | 1,27x |
| Tokens/segundo | 11.444.179 | 3.048.472 | 3,75x |
| Tokens/caracter | 0,8915 | 0,3023 | - |

El tokenizador Supernova V4 procesa caracteres 1,27 veces más rápido que tiktoken y genera tokens a una tasa 3,75 veces superior. El mayor número de tokens por carácter (0,8915 frente a 0,3023) indica una tokenización más densa, probablemente debido a un vocabulario más compacto y especializado. Estos resultados son específicos del corpus de prueba y pueden variar con el hardware y la carga de trabajo.

## Requisitos de hardware

- Al ser un tokenizador, no requiere GPU. Funciona exclusivamente en CPU.
- La extensión Cython (`trie_core`) necesita compilarse para la plataforma destino (por ejemplo, mediante `pip install` o compilación manual).
- Memoria RAM estimada: muy baja, ya que el vocabulario es de solo 356 tokens y la estructura Trie es compacta. Menos de 100 MB en la práctica.
- No se requieren GPUs específicas; cualquier CPU moderna es suficiente.
- Opciones de despliegue: integración en scripts Python, uso como librería en aplicaciones de servidor, o incorporación en pipelines de Hugging Face Transformers.
- Latencia y throughput: según el benchmark, procesa más de 12 millones de caracteres por segundo, lo que implica latencias de microsegundos para textos cortos.

## Comparativa con modelos similares

| Propiedad | Supernova V4 | Tiktoken o200k_base | BPE estándar (p.ej. GPT-2) |
|---|---|---|---|
| Enfoque principal | Nepalí | Generalista | Generalista |
| Vocabulario nepalí | Especializado (356 tokens) | General (200k tokens) | General (50k tokens) |
| Arquitectura | Trie de coincidencia más larga | BPE | BPE |
| Núcleo | Cython | Rust (implementación de tiktoken) | Python/C++ |
| Velocidad (caracteres/s) | 12,84M | 10,08M | no disponible |
| Velocidad (tokens/s) | 11,44M | 3,05M | no disponible |
| Licencia | Apache-2.0 | MIT | MIT |

La comparativa muestra que Supernova V4 supera a tiktoken en velocidad y ofrece una tokenización más densa para nepalí, pero su vocabulario es mucho más reducido, lo que limita su uso a tareas específicas de nepalí e inglés.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: solo incluye el tokenizador. No puede generar texto ni razonar.
- El vocabulario es extremadamente reducido (356 tokens), lo que lo hace inadecuado para dominios fuera del nepalí y el inglés básico.
- Los nuevos IDs (348-355) requieren que el modelo neuronal que los consuma tenga capas de embedding y salida con el mismo tamaño de vocabulario. Usar estos IDs con un modelo entrenado con el vocabulario original de V3 puede provocar errores.
- El rendimiento declarado se basa en un corpus de benchmark específico; puede degradarse con textos que contengan caracteres fuera del vocabulario.
- No se han publicado resultados de benchmarks en tareas de NLP (como MMLU o HumanEval) porque no es un modelo generativo.
- La implementación Cython requiere compilación, lo que puede añadir complejidad en entornos de producción.
- Al ser una liberación experimental, la documentación es limitada y no hay garantías de soporte a largo plazo.

## Enlaces

- Repositorio Hugging Face: [Supernova11c/Supernova-NepaliFast-V4](https://huggingface.co/Supernova11c/Supernova-NepaliFast-V4)

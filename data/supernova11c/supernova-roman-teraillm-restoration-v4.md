# Supernova11c/Supernova-Roman-teraillm-Restoration-V4

## Resumen

Supernova Roman Restoration V4 es un sistema determinista de restauración de nepalí romanizado a escritura devanagari, desarrollado por Supernova11c. A diferencia de los modelos generativos convencionales, este sistema se basa en reglas lingüísticas explícitas y mapeos deterministas, implementados mediante un trie de coincidencia más larga optimizado en Cython. Su objetivo es resolver la transliteración y normalización de texto nepalí romanizado sin recurrir a un modelo de lenguaje de gran tamaño, priorizando la eficiencia y la reproducibilidad.

El sistema combina dos subsistemas: V2 para texto general y V3.1 para nepalí romanizado, enrutando la entrada según el script o idioma detectado. La salida se procesa a través del trie para producir la restauración final. Está diseñado para tareas donde la evidencia lingüística explícita es suficiente, evitando la complejidad y el coste computacional de un modelo generativo. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia actual radica en la necesidad de herramientas ligeras y deterministas para el procesamiento de lenguas de bajos recursos como el nepalí, especialmente en entornos de producción donde la latencia y la reproducibilidad son críticas. Al no depender de pesos neuronales, su despliegue es trivial y su comportamiento es totalmente predecible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema basado en reglas con trie de coincidencia más larga (Cython) |
| Parametros totales | No aplica (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | nepalí (ne), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (código fuente y reglas) |

## Arquitectura y entrenamiento

El sistema no es un modelo neuronal, sino un pipeline determinista. La arquitectura se compone de un enrutador de script/idioma que dirige la entrada hacia el subsistema V2 (texto general) o V3.1 (nepalí romanizado). Ambos subsistemas alimentan un trie de coincidencia más larga implementado en Cython, que aplica las reglas de restauración de forma determinista. No se dispone de información sobre el proceso de entrenamiento, ya que no hay datos de corpus ni de metodología publicados. Se infiere que las reglas se construyeron manualmente a partir de conocimiento lingüístico, aunque no se confirma.

La innovación principal es el uso de un trie optimizado en Cython para lograr un rendimiento alto con una huella de memoria mínima, y la filosofía de evitar modelos generativos cuando una solución basada en reglas es suficiente. No se mencionan técnicas como RLHF, DPO o atención, al no ser un transformer.

## Capacidades

- Restauración de texto nepalí romanizado a escritura devanagari (transliteración inversa).
- Normalización de texto general, probablemente para limpiar o estandarizar entradas.
- Enrutamiento automático entre nepalí romanizado y texto general según el script detectado.
- Procesamiento determinista: misma entrada produce siempre la misma salida, sin aleatoriedad.
- Ejecución ligera: no requiere GPU ni grandes recursos de memoria, al ser un sistema de reglas.
- Soporte bilingüe (ne, en) para el enrutamiento, aunque la restauración se centra en nepalí.

## Casos de uso

- Preprocesamiento de datos para NLP en nepalí: normalizar texto romanizado procedente de redes sociales o foros antes de alimentar modelos de análisis de sentimiento o clasificación.
- Restauración de documentos históricos o digitalizados que usan romanización inconsistente, convirtiéndolos a devanagari para su archivo y búsqueda.
- Sistemas de transcripción automática: convertir entradas de teclado romanizado a devanagari en aplicaciones de escritura para nepalí, ofreciendo una alternativa ligera a los IME basados en modelos.
- Chatbots y asistentes en nepalí: normalizar la entrada del usuario romanizada para que el backend pueda procesarla con modelos entrenados en devanagari.
- Pipelines de ETL en entornos con restricciones de recursos: al ser determinista y sin dependencias pesadas, puede ejecutarse en funciones serverless o contenedores mínimos.
- Evaluación y verificación de otros sistemas de transliteración: al ser determinista, sirve como referencia de oro para comparar salidas de modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión, velocidad ni comparaciones con otros sistemas.

## Requisitos de hardware

- No requiere GPU ni VRAM, al ser un sistema basado en reglas.
- Funciona en cualquier CPU moderna, incluso en entornos embebidos o servidores de baja gama.
- El uso de Cython sugiere una ejecución eficiente, con latencia en el orden de microsegundos por entrada, aunque no se proporcionan cifras oficiales.
- Despliegue sencillo: puede compilarse como módulo de Python o integrarse en aplicaciones nativas. No depende de frameworks de inferencia como vLLM u Ollama.

## Comparativa con modelos similares

No disponible. No se han identificado sistemas comparables en la información proporcionada, ya que la mayoría de soluciones de transliteración nepalí se basan en modelos neuronales (p. ej., m2m100, indic-trans) o en IME comerciales, pero no se dispone de datos para una comparación rigurosa.

## Limitaciones y advertencias

- Al ser determinista, no maneja variaciones lingüísticas no contempladas en las reglas, como jerga, dialectos o neologismos.
- Puede fallar con entradas ambiguas o mal romanizadas, ya que no hay contexto semántico para desambiguar.
- No es un modelo generativo: no puede producir texto nuevo ni adaptarse a dominios no previstos.
- La cobertura de inglés se limita al enrutamiento, no a la restauración; el texto en inglés se procesa con el subsistema V2, cuyo alcance no está documentado.
- No se especifica la versión de Cython ni los requisitos de compilación, lo que podría afectar a la portabilidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Supernova11c/Supernova-Roman-teraillm-Restoration-V4
- Modelo de embedding relacionado: https://huggingface.co/Supernova11c/Supernova-teraillm-Embedding-V4
- Modelo LLM Terai: https://huggingface.co/Supernova11c/Supernova-llm-terai
- Dataset Supernova-teraillm: https://huggingface.co/datasets/Supernova11c/Supernova-teraillm
- Perfil del autor: https://huggingface.co/Supernova11c

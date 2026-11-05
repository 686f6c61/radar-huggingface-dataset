# venom2410/enzyme-knn

## Resumen

Enzyme-knn es un sistema de clasificación enzimática publicado en HuggingFace por el usuario venom2410, orientado a la asignación de números EC (Enzyme Commission) a secuencias proteicas. No se trata de un modelo de lenguaje generativo, sino de un pipeline híbrido de recuperación y clasificación que fusiona tres fuentes de evidencia: alineamiento por DIAMOND contra secuencias de entrenamiento, vecinos más cercanos mediante TF-IDF sobre k-mers con hashing, y un clasificador ESM-2 de 8 millones de parámetros afinado para consultas con alineamiento débil.

El sistema está diseñado explícitamente para entornos con restricciones de tiempo: cada etapa tiene un límite temporal y la evidencia ausente se omite, garantizando que la inferencia siempre termine dentro del presupuesto. Los pesos de fusión se ajustan sobre un conjunto de validación extraído de las propias secuencias de entrenamiento. El repositorio ocupa 1,3 GB e incluye un binario estático de DIAMOND para Linux en el directorio `bin/`.

La relevancia del proyecto es acotada: se publica bajo los tags `leak-curber`, `enzyme` y `leaderboard`, lo que sugiere que forma parte de un ejercicio de evaluación o competición interna más que de una herramienta de producción ampliamente adoptada. Sin descargas ni likes registrados en el momento de la consulta, y sin model card con especificaciones formales de licencia, idiomas o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: alineamiento DIAMOND + kNN TF-IDF sobre k-mers + clasificador ESM-2 (transformer proteico) |
| Parametros totales | No disponible (el componente ESM-2 es de 8M parámetros; el resto son estructuras de recuperación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la longitud máxima de secuencia admitida por ESM-2 y por el alineador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (entrada: secuencias proteicas; salida: códigos EC) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repo de 1,3 GB con binario estático de DIAMOND en `bin/`) |

## Arquitectura y entrenamiento

El sistema combina tres vías de evidencia por consulta. La primera es una búsqueda de alineamiento con DIAMOND contra el conjunto de secuencias de entrenamiento únicas; los hits emiten votos hacia sus códigos EC con un peso exponencial `exp((bits - best_bits)/T)`, donde `T` es una temperatura de suavizado. La segunda vía es un vecino más cercano sobre representaciones TF-IDF de k-mers con hashing. La tercera es un clasificador ESM-2 de 8M parámetros afinado, que se ejecuta únicamente en CPU y solo para consultas con alineamiento débil, con un límite de tiempo.

Los pesos de fusión entre las tres fuentes se ajustan sobre un hold-out de las secuencias de entrenamiento. La innovación técnica principal es el control de latencia: cada etapa tiene un tiempo máximo asignado y, si no produce evidencia a tiempo, se omite, de modo que la inferencia siempre concluye. DIAMOND se distribuye como binario estático de Linux dentro del repositorio, lo que simplifica el despliegue pero limita la portabilidad a esa plataforma.

No se especifican en la información disponible el número de tokens ni la composición del conjunto de entrenamiento, más allá de que existen "secuencias de entrenamiento únicas" usadas como referencia de alineamiento y para el ajuste de pesos.

## Capacidades

- Clasificación de secuencias proteicas en códigos EC mediante fusión de evidencia heterogénea.
- Búsqueda por alineamiento local con pesos exponenciales sobre la puntuación de bits.
- Recuperación por similitud de k-mers con TF-IDF y hashing, útil cuando el alineamiento no es concluyente.
- Clasificación supervisada con ESM-2 afinado para consultas con alineamiento débil, ejecutada en CPU.
- Gestión de presupuesto temporal por etapa con omisión controlada de evidencia ausente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No es multilingüe en sentido textual: opera sobre secuencias de aminoácidos.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Anotación funcional de proteínas en pipelines de metagenómica: el sistema puede asignar códigos EC a secuencias desconocidas combinando alineamiento contra una base de referencia y vecinos por k-mers, con la ventaja de que el límite de tiempo por etapa evita que un lote grande de consultas bloquee el pipeline.
- Triaje rápido en entornos con CPU únicamente: la vía ESM-2 de 8M parámetros está pensada para ejecutarse en CPU, de modo que un servidor sin GPU puede resolver consultas de alineamiento débil sin depender de aceleradores.
- Clasificación en competiciones o leaderboards de enzimas: los tags `leaderboard` y `leak-curber` indican que el sistema está orientado a evaluación comparativa, donde la fusión de evidencia y el control de latencia son criterios relevantes.
- Preanotación de bases de datos internas de enzimas: sirve como primera pasada para etiquetar secuencias con EC antes de una revisión manual, aprovechando que el alineamiento contra secuencias de entrenamiento únicas reduce redundancia.
- Filtrado de candidatos en proyectos de ingeniería de proteínas: dado un conjunto de variantes, el pipeline puede priorizar aquellas cuya evidencia combinada apunta a una clase EC de interés antes de ensayos experimentales.
- Despliegue en contenedores Linux sin gestión de dependencias complejas: al incluir DIAMOND como binario estático en `bin/`, el empaquetado se simplifica en imágenes basadas en Linux, siempre que se acepte la dependencia de plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica para la vía ESM-2, que se ejecuta en CPU según la model card; no se especifica requisito de GPU para el resto del pipeline.
- GPU recomendadas: no disponibles; el diseño declarado es CPU para el clasificador.
- Cabe en GPU consumer: no aplica según la información disponible.
- Despliegue: binario estático de DIAMOND para Linux incluido en `bin/`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de sistema).
- Latencia y throughput: no disponibles; solo se indica que cada etapa tiene un límite de tiempo y que la inferencia siempre termina dentro del presupuesto.

## Comparativa con modelos similares

| Sistema | Enfoque | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| enzyme-knn (este) | Fusión de alineamiento + kNN k-mers + ESM-2 8M | ESM-2 de 8M en un componente | No disponible | No disponible | HuggingFace, repo 1,3 GB |
| Herramientas tipo BLAST/DIAMOND puras | Solo alineamiento | No aplica | No aplica | Según herramienta | Amplia |
| Clasificadores ESM-2 afinados | Solo transformer proteico | 8M–650M según variante | Longitud de secuencia | Según variante | Amplia |
| Modelos comparables específicos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento del sistema como para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de model card formal: no hay licencia declarada, lo que impide determinar si el uso comercial está permitido.
- Sin métricas publicadas: no hay benchmarks, matrices de confusión ni tasas de acierto por nivel EC, por lo que no se puede evaluar su calidad frente a alternativas.
- Dependencia de plataforma: DIAMOND se distribuye como binario estático de Linux, lo que limita el despliegue a ese sistema operativo.
- Riesgo de fuga de datos (`leak-curber`): el tag sugiere que el proyecto aborda explícitamente el riesgo de que las secuencias de evaluación estén presentes en el conjunto de entrenamiento; sin documentación, no es posible verificar cómo se mitiga.
- Los pesos de fusión se ajustan sobre un hold-out de las propias secuencias de entrenamiento, lo que puede sobreajustar la calibración al dominio de referencia.
- La omisión de evidencia por límite de tiempo puede degradar silenciosamente la precisión en consultas lentas, sin señal explícita al usuario.
- Sin información sobre sesgos, cobertura taxonómica del conjunto de entrenamiento ni clases EC infrarrepresentadas.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/venom2410/enzyme-knn
- DIAMOND (repositorio oficial): https://github.com/bbuchfink/diamond

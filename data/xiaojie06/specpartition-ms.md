# xiaojie06/SpecPartition-MS

## Resumen

SpecPartition-MS es un repositorio de resultados de evaluación y checkpoints de investigación centrado en la recuperación molecular a partir de espectros de masas (mass-spectrometry molecular retrieval). Lo publica el usuario xiaojie06 en Hugging Face y no es un modelo de lenguaje generativo, sino una familia de modelos de reordenación (reranking) de candidatos moleculares entrenados sobre espectros de masas y evaluados con protocolos de quimiometría. El repositorio contiene seis checkpoints completos (R4-D 9k y R5 A–E 12k) con parámetros, optimizador y estados aleatorios, además de código de definición de los modelos y resultados de evaluación en formato JSON y Markdown.

El problema que aborda es el de identificar la estructura química correcta de un compuesto a partir de su espectro de masas, una tarea central en metabolómica y química analítica. El modelo actúa como una etapa de reordenación sobre un conjunto fijo de candidatos generados por herramientas como SIRIUS, mejorando el ranking Top-K de estructuras y fórmulas moleculares. La evaluación principal se realiza sobre dos conjuntos: MSG Test (17.556 espectros) y CASMI2022 (500 espectros con un pool fijo de 1.765.420 candidatos).

La relevancia actual del repositorio es metodológica más que de producto: documenta con detalle protocolos de evaluación, comparaciones entre variantes de entrenamiento y límites de comparabilidad. No se trata de un modelo listo para producción ni de un paquete reproducible de extremo a extremo, ya que no se distribuyen los datos de entrenamiento, las cachés de candidatos ni los espectros originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio incluye código de definición de modelos en `code/snapshot/.../model4.py` y `model5.py`, pero no se describe la arquitectura en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre representaciones de espectros y candidatos moleculares) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, zh (según metadatos de la model card) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.pt`) con parámetros, optimizador, estados aleatorios y progreso de entrenamiento |
| Tamaño del repositorio | 1,2 GB |
| Tarea principal | recuperación molecular / reordenación de candidatos a partir de espectros de masas |
| Checkpoints incluidos | R4-D 9k (9.000 actualizaciones) y R5 A–E 12k (12.000 actualizaciones) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de los modelos (tipo de red, número de capas, dimensión de embeddings ni mecanismo de atención). El repositorio incluye archivos de código que definen los modelos (`model4.py` para R4 y `model5.py` para R5), así como módulos específicos para el muestreo de negativos duros (`teacher5.py`), la evidencia de picos de fragmentación (`forward5.py`), el acceso a candidatos (`batch5.py`) y las funciones de pérdida (`objectives5.py`). Esto sugiere una arquitectura de reordenación con representación conjunta de espectro y candidato, pero no se confirma en el texto.

El entrenamiento se organiza en dos generaciones: R4-D, con 9.000 actualizaciones acumuladas, y R5 A–E, que continúan desde R4-D hasta 12.000 actualizaciones. Las cinco variantes R5 exploran cambios concretos: A es continuación sin cambios; B introduce remuestreo de negativos duros; C añade una puntuación de picos de fragmentación exclusivos; D amplía el pool de candidatos de entrenamiento; E aplica una pérdida de preservación de orden (protección de rankings ya correctos). El repositorio indica que los experimentos de 15k están en curso y no se incluyen. No se especifican el número de tokens ni la composición del corpus de entrenamiento, y no se distribuyen los datos.

## Capacidades

- Reordenación de candidatos moleculares a partir de espectros de masas, con métricas Top-K de estructura y de fórmula molecular.
- Evaluación sobre MSG Test (17.556 espectros) y CASMI2022 (500 espectros, pool fijo de 1.765.420 candidatos).
- Cálculo de métricas de similitud estructural MCES@1 para evaluar la calidad de las predicciones.
- Soporte de dos vistas de evaluación: recuperación por masa (Mass) y por fórmula (Formula).
- Análisis estratificado por polaridad, aductos y tamaño del pool de candidatos (resultados en `EXTENDED_STRATA.json`).
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling, agentes ni multilingüismo en el sentido de modelos de lenguaje.
- No se documenta un modo de "thinking" ni decodificación especulativa.

## Casos de uso

- Anotación de compuestos en metabolómica: el modelo reordena los candidatos generados por SIRIUS u otras herramientas y mejora el Top-K de estructuras, lo que permite priorizar candidatos para validación experimental con estándares.
- Identificación de fórmulas moleculares en flujos de espectrometría de masas: la vista Formula permite reordenar fórmulas candidatas, con Top1 del 82,40 % en el pool fijo de CASMI2022, útil como filtro previo a la búsqueda estructural.
- Investigación en métodos de reordenación: los checkpoints y el código permiten reproducir y comparar variantes de entrenamiento (negativos duros, evidencia de fragmentación, ampliación de pool, preservación de orden) en un entorno de investigación.
- Evaluación comparativa de pipelines de espectrometría: el repositorio incluye protocolos y resultados de líneas base oficiales y de literatura, útil para contrastar metodologías con condiciones documentadas.
- Análisis de robustez por estratos: los resultados estratificados por polaridad y aductos permiten estudiar en qué condiciones el reordenador degrada o mejora el ranking.
- Formación y auditoría metodológica: la documentación de límites de comparabilidad y los manifiestos SHA-256 sirven como referencia para diseñar evaluaciones reproducibles en quimiometría.
- Integración en un pipeline de laboratorio: como etapa de reordenación sobre un pool de candidatos ya generado, no como generador de estructuras desde cero.

## Benchmarks y rendimiento

Resultados publicados para MSG Test (17.556 espectros; Top-K en porcentaje; MCES@1 menor es mejor):

| Rama | Mass Top1 | Mass Top5 | Mass Top20 | Formula Top1 | Formula Top5 | Formula Top20 | MCES@1 Mass | MCES@1 Formula |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| A: continuación sin cambios | 41,93 | 69,37 | 86,65 | 25,43 | 50,30 | 73,34 | 10,211 | 8,916 |
| B: remuestreo de negativos duros | 41,93 | 69,33 | 86,60 | 25,39 | 50,26 | 73,36 | 10,214 | 8,922 |
| C: picos de fragmentación exclusivos | 41,95 | 69,37 | 86,65 | 25,42 | 50,30 | 73,36 | 10,213 | 8,904 |
| D: pool de entrenamiento ampliado | 41,90 | 69,44 | 86,67 | 25,39 | 50,27 | 73,31 | 10,218 | 8,923 |
| E: preservación de orden unilateral | 41,88 | 69,40 | 86,64 | 25,27 | 50,21 | 73,30 | 10,220 | 8,943 |

Resultados publicados para CASMI2022 (500 espectros, pool fijo de 1.765.420 candidatos; 467/500 contienen la verdad; Top-K en porcentaje):

| Rama | Estructura Top1 | Top5 | Top20 | Top100 | MCES@1 |
|---|---:|---:|---:|---:|---:|
| A | 11,40 | 31,20 | 54,20 | 75,00 | 10,765 |
| B | 11,20 | 31,60 | 54,00 | 75,20 | 10,754 |
| C | 11,60 | 31,80 | 54,20 | 75,80 | 10,814 |
| D | 11,60 | 31,40 | 53,80 | 75,40 | 10,741 |
| E | 11,20 | 31,40 | 53,80 | 75,20 | 10,761 |

En CASMI2022, las cinco ramas obtienen Formula Top1 del 82,40 % y Top10 del 93,60 % sobre el pool fijo (reordenación de fórmulas devueltas por SIRIUS, no generación abierta). El repositorio advierte que las comparaciones con FLARE, MIST, ICEBERG y GLACIER son valores de literatura archivados, no reejecutados, y que las condiciones de entrenamiento y protocolos difieren.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU recomendadas en la información disponible.
- El tamaño del repositorio es de 1,2 GB, lo que sugiere que los checkpoints son manejables en memoria de GPU de consumo, pero no se confirma el número de parámetros ni el coste de inferencia.
- No se documentan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni latencia o throughput.
- El código conserva la disposición del servidor original y las configuraciones, pero no es un paquete autónomo de reentrenamiento o reevaluación completa, ya que faltan datos y características de candidatos.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpecPartition-MS (R5) | Reordenación molecular MS | no disponible | no aplica | no disponible | Checkpoints y resultados públicos; datos no incluidos |
| FLARE | Recuperación molecular MS | no disponible | no aplica | no disponible | Valores de literatura archivados, no reejecutados |
| MIST | Recuperación molecular MS | no disponible | no aplica | no disponible | Valores de literatura archivados, no reejecutados |
| ICEBERG | Recuperación molecular MS | no disponible | no aplica | no disponible | Valores de literatura archivados, no reejecutados |
| GLACIER | Recuperación molecular MS | no disponible | no aplica | no disponible | Valores de literatura archivados, no reejecutados |

La comparación directa no está disponible en la información proporcionada: el repositorio cita estas líneas base como valores archivados de la literatura, con condiciones de entrenamiento y protocolos distintos, y no ofrece una tabla numérica comparativa en el texto extraído.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas conversacionales; su ámbito es la reordenación de candidatos moleculares.
- El repositorio no incluye datos de entrenamiento, validación ni test, ni cachés de candidatos, por lo que no es reproducible de extremo a extremo.
- Los resultados son de un único entrenamiento por rama (una sola semilla), lo que limita la significación estadística de las diferencias entre variantes.
- El propio repositorio indica que ninguna rama R5 satisface simultáneamente el criterio principal preregistrado y las condiciones de protección, por lo que no se puede afirmar superioridad demostrada frente al control A con el mismo presupuesto.
- Los conjuntos Test y CASMI se han inspeccionado repetidamente durante el desarrollo histórico, por lo que no se puede garantizar que no hayan influido en decisiones de diseño.
- Las comparaciones con líneas base oficiales y de literatura no son reejecuciones y presentan diferencias de condiciones (fórmula parental conocida, aumento de espectros sintéticos, completado de energía de colisión, aislamiento de entrenamiento).
- La licencia no está disponible; el repositorio no concede automáticamente derechos de relicencia sobre las bibliotecas espectrales originales, el código de terceros ni los artículos citados.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe en el sentido habitual, ya que no es un modelo generativo.
- El repositorio incluye rutas absolutas locales y de servidor como información de trazabilidad; no implican que esos activos estén publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xiaojie06/SpecPartition-MS
- Entrada de la release r12 (mismo pool, 500, 2026-11-27): `releases/r12-same-pool-500-20261127/README.md`
- Resumen comparativo de cuatro modelos y A4: `releases/r12-same-pool-500-20261127/SUMMARY.md`
- Pesos y carga de los seis modelos: `releases/r12-same-pool-500-20261127/models/r12_500_20261127/README.md`
- Resultados por espectro: `releases/r12-same-pool-500-20261127/results/r12_same_pool_20261127/README.md`
- Protocolo del test y descargas: `releases/r12-same-pool-500-20261127/results/r12_same_pool_20261127/DATA.md`
- Manifiesto de modelos y SHA-256: `models/MANIFEST.json`
- Manifiesto de código y verificación: `code/MANIFEST.json`
- Límites de uso del código: `code/README.md`
- Informe histórico de la serie V: `results/historical_v_series/REPORT.md`
- Comparación completa de modelos: `results/overview_through_r3/COMPARISON.md`
- Informe final R5 12k: `results/r5_12000/FINAL_REPORT.md`
- Métricas completas y análisis emparejado R5: `results/r5_12000/FINAL_VERIFIED.json`
- Resultados estratificados R5: `results/r5_12000/EXTENDED_STRATA.json`
- Resultados MCES: `results/mces_20261106/all_results_with_mces.json`
- Auditoría de fuentes v1.5: `baselines/official_v15_source_audit.json`
- Líneas base públicas y condiciones: `baselines/best_vs_official_baselines.json`
- Protocolos de evaluación: `EVALUATION_PROTOCOLS.md`
- Manifiesto principal: `MANIFEST.json`

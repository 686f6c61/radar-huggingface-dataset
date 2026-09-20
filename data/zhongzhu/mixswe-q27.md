# Zhongzhu/mixswe-q27

## Resumen

Zhongzhu/mixswe-q27 es un repositorio de artefactos de investigación publicado por el usuario Zhongzhu, no un modelo con pesos convencionales. Contiene exportaciones de prefix-KV entrenadas para la tarea mixSWE de 4 segmentos (4x1024) sobre un modelo denominado Qwen3.8-27B. Cada `epoch_NN/artifact.tgz` es un export listo para servir con K/V de FlashAttention y estados GDN recapturados (128 ficheros más un manifiesto CAPTURE), y cada brazo incluye un `RUN_REGISTRATION.json` con la procedencia completa (sha de filas, hiperparámetros y sha de código).

El interés del artefacto es acotado y muy técnico: documenta dos brazos de entrenamiento (seg4v3 con CE+KL y seg4uld con CE+KL+UL) sobre 852 filas CE, con 648 y 804 pasos respectivamente y 12 épocas. La model card advierte explícitamente de que las geometrías v1 no están alineadas a 64 y de que el conector stock Q27-hybrid las rechaza, por lo que los artefactos publicados quedan superados por los retrains v2.

Con 0 descargas, 0 likes, 9,9 GB de repositorio y sin licencia, idiomas, pipeline ni benchmarks declarados, se trata de un volcado de resultados experimentales para reproducibilidad interna, no de un modelo listo para producción ni para uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible como descripción formal. La model card menciona K/V de FlashAttention (FA) y estados GDN (red de estado recurrente) en un modelo híbrido denominado Qwen3.8-27B |
| Parámetros totales | 27 000 millones según la denominación «Qwen3.8-27B» del autor; no confirmado en metadatos ni en la model card |
| Parámetros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible para el modelo base. Los artefactos cubren la tarea mixSWE de 4 segmentos de 1024 tokens (4x1024) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (los metadatos de HuggingFace no especifican licencia) |
| Formato de pesos | No son pesos de modelo. Cada `epoch_NN/artifact.tgz` contiene 128 ficheros con K/V de FlashAttention y estados GDN recapturados, más un manifiesto CAPTURE |
| Tamaño del repositorio | 9,9 GB |
| Autor | Zhongzhu |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-20 / 2026-09-21 |

## Arquitectura y entrenamiento

La model card describe dos brazos de entrenamiento de prefix-KV sobre el mismo conjunto de 852 filas CE. El brazo seg4v3 usa objetivo CE+KL con KL directa (fwd), 648 pasos (54x12) y loss final de 0,01 en la época 12. El brazo seg4uld añade 226 filas UL (pre-shifted) sobre las 852 CE, emplea CE+KL inversa (rev)+UL con pesos 1,0/0,3/0,1, 804 pasos (67x12) y termina con loss 0,03 en la época 12. La pérdida combinada de seg4v3 es 1,0 CE + 0,3 KL(fwd) y la de seg4uld es 1,0 CE + 0,3 KL(rev) + 0,1 UL.

El código de entrenamiento referenciado es «main@927ddead-era xorl» e incorpora corrección de fp32, máscaras disjuntas de KL y UL, e int64. El entrenamiento es solo FA (GDN congelado, porque los offsets del harness mixswe no están alineados a 64) y usa paralelismo DP2/FSDP2. Los exports de las épocas 01 a 11 proceden de retrains con `save_epochs=1`, mientras que la época 12 publicada es la final original y está pendiente de sustituirse por la del retrain; los originales se conservan en `*_original_final/`.

| Brazo | Filas | Pérdida | Pasos | Final |
|---|---|---|---|---|
| seg4v3 (BFCL, CE+KL) | 852 CE | 1,0 CE + 0,3 KL(fwd) | 648 (54x12) | epoch_12, loss 0,01 |
| seg4uld (BFCL, CE+KL+UL) | 852 CE + 226 UL (pre-shifted) | 1,0 CE + 0,3 KL(rev) + 0,1 UL | 804 (67x12) | epoch_12, loss 0,03 |

La model card documenta dos desviaciones críticas: (1) seg2v3 (filas swepro) entrenó el span multi-texto con un cruce fila/span erróneo por confusión de índices basados en 1, por lo que su artefacto solo sirve como evidencia de dinámica; (2) las geometrías v1 no están alineadas a 64 (DSH harness 1252 % 64 = 36), de modo que los artefactos seg2v3/seg4v3/seg4uld (n_inject 4324/4239) son rechazados por el conector stock Q27-hybrid, que exige n_inject % 64 == 0. Las geometrías v2 rellenan el harness hasta la alineación (DSH +28 → 1280, BFCL +49 → 3264), corrigen el mapeo fila/span y todos los retrains v2 sustituyen a estos artefactos.

## Capacidades

- No se documenta ninguna capacidad generativa del artefacto: el repositorio contiene estados prefix-KV y estados GDN, no pesos de un modelo instruido o base.
- Condicionamiento de prefijos en 4 segmentos de 1024 tokens (tarea mixSWE 4x1024) mediante K/V de FlashAttention precomputadas.
- Exportación de estados GDN recapturados para modelos híbridos con componente de estado recurrente.
- Registro de procedencia por brazo mediante `RUN_REGISTRATION.json` (sha de filas, hiperparámetros, sha de código).
- Exports por época (epoch_01 a epoch_12) para analizar trayectorias de entrenamiento.
- Objetivos de entrenamiento diferenciados: CE+KL(fwd) frente a CE+KL(rev)+UL, ambos con máscaras disjuntas.
- No hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo «thinking».
- Compatibilidad de despliegue limitada: el conector stock Q27-hybrid rechaza estos artefactos v1 por falta de alineación a 64.

## Casos de uso

- Investigación en caché de prefijos (prefix-KV): servir los artefactos y comparar la calidad resultante frente al recálculo completo del prefijo, midiendo la degradación atribuible a la precomputación de K/V en la tarea 4x1024.
- Reproducibilidad de pipelines de entrenamiento: usar `RUN_REGISTRATION.json` y los sha documentados para replicar las ejecuciones seg4v3 y seg4uld con los mismos hiperparámetros y los mismos conjuntos de 852 filas CE.
- Desarrollo y validación de conectores híbridos: emplear los artefactos v1 (n_inject 4324/4239) como casos de prueba que deben ser rechazados por el conector Q27-hybrid por no cumplir n_inject % 64 == 0, y los retrains v2 (3264, 1280) como casos válidos.
- Estudio de objetivos de destilación: comparar el efecto de CE+KL(fwd) frente a CE+KL(rev)+UL sobre el mismo conjunto de datos, aislando la contribución de las 226 filas UL pre-shifted.
- Análisis de modelos híbridos con estado recurrente: los estados GDN recapturados permiten estudiar la dinámica del componente de estado con el GDN congelado durante el entrenamiento solo-FA.
- Auditoría de exportaciones por época: explotar las épocas 01 a 11 (procedentes de retrains con `save_epochs=1`) frente a la época 12 original para trazar la evolución de la pérdida a lo largo de 12 épocas.
- Preparación de la migración a v2: utilizar la documentación de desviaciones (mapeo fila/span y alineación a 64) como guía para actualizar harness y conectores antes de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, BFCL ni de ninguna otra evaluación estandarizada. Los únicos valores cuantitativos publicados son las pérdidas de entrenamiento de los dos brazos (0,01 para seg4v3 y 0,03 para seg4uld en la época 12), recogidas en la sección de arquitectura y entrenamiento, y no son comparables con métricas de evaluación.

## Requisitos de hardware

- Los artefactos no se pueden ejecutar de forma autónoma: requieren el modelo base denominado Qwen3.8-27B y un conector compatible con las geometrías empleadas (el conector stock Q27-hybrid rechaza las v1).
- Estimación de VRAM para el modelo base de 27 000 millones de parámetros, en función de la precisión (valores orientativos, no publicados por el autor): aproximadamente 54 GB en bf16/fp16, en torno a 27 GB en int8 y 14-16 GB en 4 bits, sin contar la caché KV ni los estados GDN adicionales.
- GPU recomendadas para bf16 sin cuantizar: A100 80 GB, H100 80 GB o configuraciones multi-GPU con DP2/FSDP2, coherentes con el esquema de entrenamiento descrito.
- Viabilidad en GPU de consumo: no confirmada. En 4 bits el modelo base podría caber en tarjetas de 16-24 GB (RTX 4090, RTX 3090), pero la arquitectura híbrida con estados GDN y el requisito de alineación a 64 hacen que el soporte no esté garantizado.
- Opciones de despliegue: no disponibles. La model card menciona un harness propio (mixswe) y el conector Q27-hybrid, pero no documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables. El artefacto pertenece a una categoría muy específica (exports de prefix-KV y estados GDN para una tarea de segmentación concreta) para la que no se han encontrado alternativas públicas en los resultados de búsqueda, que no devolvieron ninguna referencia técnica relacionada.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zhongzhu/mixswe-q27 | 27B (según denominación) | Tarea 4x1024 en los artefactos | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los artefactos v1 publicados (seg2v3, seg4v3, seg4uld) son rechazados por el conector stock Q27-hybrid al no cumplir el requisito n_inject % 64 == 0; los retrains v2 los sustituyen.
- El artefacto seg2v3 contiene un error de mapeo fila/span derivado de una confusión con índices basados en 1; solo es válido como evidencia de dinámica, no como resultado utilizable.
- La época 12 publicada es la final original y está pendiente de sustitución por la del retrain con `save_epochs=1`, por lo que el conjunto de épocas no es homogéneo.
- Ausencia total de licencia declarada: no hay autorización explícita de uso comercial ni condiciones de redistribución, lo que impide un uso en producción con garantías legales.
- No hay benchmarks ni evaluaciones publicadas: la única señal cuantitativa es la pérdida de entrenamiento, insuficiente para estimar calidad real.
- Volumen de datos de entrenamiento muy reducido (852 filas CE, más 226 UL en un brazo), con riesgo de sobreajuste pese a las pérdidas finales bajas.
- El GDN se mantuvo congelado durante el entrenamiento solo-FA por limitaciones de alineación del harness; las conclusiones sobre la parte recurrente del modelo híbrido son limitadas.
- No se documentan idiomas soportados, sesgos, comportamiento multilingüe ni tasas de alucinación del modelo base asociado.
- El repositorio no declara pipeline, idiomas ni licencia en los metadatos, y acumula 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- El nombre del modelo base («Qwen3.8-27B») no se corresponde con una denominación verificable en la información disponible; la existencia y las características de ese modelo base no están confirmadas en las fuentes consultadas.
- No se especifican requisitos de software, versiones de framework ni instrucciones de carga, lo que dificulta la reproducibilidad práctica.

## Enlaces

- HuggingFace: https://huggingface.co/Zhongzhu/mixswe-q27
- La model card no incluye enlaces a papers, blogs, repositorios de código ni demos; solo menciona el código de entrenamiento «main@927ddead-era xorl» sin URL.
- Los resultados de búsqueda web no devolvieron enlaces relevantes: únicamente páginas genéricas de Microsoft (microsoft.com, account.microsoft.com, myaccount.microsoft.com, microsoft365, Wikipedia) sin relación alguna con el modelo.

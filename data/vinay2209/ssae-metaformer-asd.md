# Vinay2209/ssae-metaformer-asd

## Resumen

SSAE-METAFormer es un clasificador binario de investigación que distingue entre participantes con trastorno del espectro autista (ASD) y controles neurotípicos a partir de características de conectividad funcional derivadas de resonancia magnética funcional en reposo (rs-fMRI). Lo desarrolla el usuario Vinay2209 como parte del proyecto de fin de grado "Hybrid Deep Learning Model for Diagnosis of Autism Spectrum Disorder" en el ISB&M College of Engineering de Pune (Universidad Savitribai Phule Pune), curso 2025-2026, y se publica en HuggingFace bajo la librería PyTorch.

La arquitectura es híbrida: combina autoencoders dispersos apilados (SSAE) específicos por atlas, que comprimen las características de conectividad de cada atlas a un vector latente de 32 dimensiones, con una red de fusión basada en atención de estilo METAFormer que modela las relaciones entre las representaciones de los tres atlas. La entrada es un tensor de `(3, 50)` por participante (50 características de conectividad por atlas para AAL, Schaefer y Harvard-Oxford) y la salida es una probabilidad de ASD.

Su relevancia es estrictamente investigadora: se evalúa con validación cruzada Leave-One-Site-Out (LOSO) sobre el dataset multi-sitio ABIDE-I, una configuración más exigente que una partición aleatoria por sujeto porque mide la generalización a centros de adquisición no vistos. No es un dispositivo médico, no tiene validación clínica prospectiva y no dispone de licencia declarada ni de pipeline de inferencia publicado en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: SSAE por atlas (50 → 128 → 64 → 32) + fusión por atención estilo METAFormer (4 bloques, dimensión de embedding 128, 2 cabezas de atención, dropout 0,25) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de `(3, 50)` características de conectividad funcional) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de clasificación sobre neuroimagen, no generativo) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`, `ssae_metaformer_optimized.pt`), acompañado de `manifest.json`, `feature_means.npy` y escaladores `.pkl` |
| Tarea | Clasificación binaria: ASD (1) frente a control (0) |
| Atlas de entrada | AAL, Schaefer, Harvard-Oxford |
| Características por atlas | 50 |
| Tensor de entrada | `(3, 50)` por participante |
| Tensor latente | `(3, 32)` |
| Entrada auxiliar | Desplazamiento framewise medio (mean FD), cuando está habilitado |
| Framework | PyTorch |
| Dataset de evaluación | ABIDE-I (Autism Brain Imaging Data Exchange I) |
| Protocolo | Leave-One-Site-Out (LOSO) |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El pipeline parte de rs-fMRI preprocesado, del que se extraen series temporales por región de interés (ROI) para tres atlas distintos. Sobre esas series se calcula conectividad funcional mediante correlación de Pearson, se aplica la transformada z de Fisher y se seleccionan 50 características de conectividad por atlas. Cada atlas pasa por un escalado propio y por un autoencoder disperso apilado específico con la progresión `50 → 128 → 64 → 32`, lo que produce un tensor latente de `(3, 32)`. Esos tres vectores se combinan mediante una red de fusión de estilo METAFormer basada en atención (dimensión de embedding 128, 4 bloques, 2 cabezas de atención según el manifiesto de despliegue, dropout 0,25), y la representación fusionada alimenta un clasificador binario que emite probabilidad y etiqueta. El desplazamiento framewise medio se incorpora como entrada auxiliar cuando está habilitado.

El entrenamiento se realiza sobre ABIDE-I y la evaluación sigue un esquema LOSO: en cada iteración se reserva un centro de adquisición completo para test y se entrena con el resto, usando parte de los datos de entrenamiento para validación y ajuste de hiperparámetros. La model card no especifica el número de tokens, la composición detallada del dataset ni si se emplearon técnicas de alineación tipo RLHF o DPO (no aplicables a este tipo de clasificador). Tampoco documenta la estrategia de selección de las 50 características por atlas ni los detalles del preprocesado de imagen más allá de que debe reproducirse exactamente el pipeline de entrenamiento. El checkpoint no acepta ficheros NIfTI en crudo: requiere que las características se calculen previamente con el mismo procesado.

## Capacidades

- Clasificación binaria ASD frente a control a partir de características de conectividad funcional multi-atlas ya extraídas.
- Aprendizaje de representaciones específicas por atlas mediante autoencoders dispersos apilados, con un latente de 32 dimensiones por atlas.
- Fusión por atención de las representaciones de los tres atlas (AAL, Schaefer, Harvard-Oxford), lo que permite ponderar de forma aprendida la contribución de cada uno.
- Integración de una covariable de calidad de movimiento (mean FD) como entrada auxiliar opcional.
- Salida de probabilidad y etiqueta binaria, apta para umbralización ajustable.
- Soporte de tool calling: no disponible (no es un modelo generativo ni un agente).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión, audio, generación de texto): no aplica.
- Extracción de embeddings latentes `(3, 32)` potencialmente reutilizables en análisis secundarios, aunque no se documenta esta función explícitamente.

## Casos de uso

- Reproducción y comparación de investigación en ABIDE-I: sirve como referencia de un pipeline híbrido SSAE + atención evaluado con LOSO, útil para que otros grupos reproduzcan la metodología y comparen variantes de fusión multi-atlas bajo el mismo protocolo.
- Estudio de la contribución relativa de cada atlas: al disponer de encoders separados por atlas y de una fusión por atención, permite analizar experimentalmente qué atlas aporta más señal discriminativa en una cohorte concreta.
- Prefiltrado de cohortes en estudios de neuroimagen: en un contexto puramente investigador, puede emplearse para priorizar sujetos dentro de un análisis exploratorio, siempre con revisión experta y sin valor diagnóstico.
- Análisis de generalización cross-site: el diseño LOSO lo hace adecuado para estudiar cómo degrada el rendimiento al pasar de un centro de adquisición a otro, un problema central en neuroimagen multi-sitio.
- Docencia y formación en pipelines de deep learning aplicado a neuroimagen: por su tamaño reducido y su estructura modular (autoencoders + fusión), es un ejemplo didáctico completo de preprocesado, extracción de características, escalado y clasificación.
- Punto de partida para transfer learning: los encoders por atlas y el bloque de fusión pueden reutilizarse o reentrenarse en cohortes locales u otros fenotipos, siempre que se replique el preprocesado de características.
- Extracción de representaciones latentes para análisis secundarios: los vectores de `(3, 32)` pueden alimentar clasificadores alternativos o análisis de correlación con variables clínicas, en un marco de investigación.
- Evaluación de robustez frente a covariables de movimiento: la inclusión opcional del mean FD permite estudiar hasta qué punto el rendimiento depende de la calidad del escaneo.

## Benchmarks y rendimiento

Los resultados declarados en el informe del proyecto (validación cruzada LOSO sobre ABIDE-I) son los siguientes. El `model-index` de la model card no contiene entradas de resultados, por lo que estas cifras proceden exclusivamente del informe citado por el autor y no de una reevaluación independiente del checkpoint exportado.

| Métrica | Resultado declarado |
|---|---|
| Exactitud (accuracy) | 75,90 % |
| ROC-AUC | 0,8261 |
| Precisión | 0,7686 |
| Recall / sensibilidad | 0,7440 |
| F1-score | 0,7561 |

La descripción de la matriz de confusión del informe indica 96 controles clasificados correctamente, 93 participantes con ASD clasificados correctamente, 28 controles mal clasificados como ASD y 32 participantes con ASD mal clasificados como control, sobre 249 predicciones evaluadas.

No se han publicado en la información disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos alternativos bajo el mismo protocolo. Las cifras anteriores corresponden a versiones finales del informe y sustituyen a resultados previos de validación cruzada de 5 particiones y 3 semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por la escala declarada de la arquitectura (tres entradas de 50 dimensiones, latentes de 32, fusión de dimensión 128 con 4 bloques), se trata de una red de muy pequeño tamaño; la inferencia consiste en un único paso forward sobre un tensor `(3, 50)`.
- GPU recomendadas: no disponible. No se documenta ningún requisito de GPU; por la escala del modelo, la inferencia en CPU es plausible, aunque el cálculo de características de conectividad funcional a partir de rs-fMRI (paso previo obligatorio, no incluido en el checkpoint) puede ser la parte más costosa del proceso.
- Cabe en GPU de consumo: no disponible como dato oficial, pero el tamaño descrito de la red (latentes de 32 y embedding de 128) es compatible con hardware de consumo e incluso con ejecución en CPU. No se publica el recuento de parámetros ni la huella de memoria exacta.
- Opciones de despliegue: PyTorch como marco nativo. Al no ser un modelo de lenguaje, no aplican vLLM, llama.cpp, Ollama ni TGI. El repositorio incluye `manifest.json`, escaladores `.pkl` por atlas y `feature_means.npy`; los scripts `preprocessing/ssae_metaformer_inference.py` y `preprocessing/fmri_processor.py` deben subirse por separado, y este último solo si la redistribución está permitida. La conversión a TorchScript u ONNX no está documentada.
- Latencia y throughput estimados: no disponible.
- Requisito crítico de entrada: el checkpoint no acepta NIfTI en crudo; exige que las características de conectividad se generen con el mismo pipeline de preprocesado del entrenamiento y respetando el orden de atlas definido en el manifiesto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables con resultados publicados bajo el mismo protocolo LOSO sobre ABIDE-I, ni cifras de terceros que permitan una comparación justa. Además, las métricas declaradas proceden del informe del propio autor y no de una evaluación independiente, por lo que cualquier comparación directa con otros clasificadores de ASD basados en rs-fMRI requeriría replicar el mismo preprocesado, la misma selección de características y el mismo esquema de validación por sitio.

## Limitaciones y advertencias

- No es un dispositivo médico: no ha sido validado clínicamente de forma prospectiva y no debe utilizarse por sí solo para diagnosticar ASD, evaluar su gravedad ni tomar decisiones de tratamiento. La propia model card lo etiqueta como "research use only".
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita de uso comercial ni condiciones claras de redistribución, incluidas las de los scripts de preprocesado que deben subirse por separado.
- Dependencia estricta del preprocesado: el checkpoint no funciona con NIfTI en crudo y exige reproducir el pipeline de extracción de características y el orden de atlas del manifiesto. Cualquier desviación invalida las predicciones.
- Riesgo de fuga de información: la model card advierte de que todo el preprocesado aprendido, la selección de características y la elección de umbral deben ajustarse exclusivamente con datos de los sitios de entrenamiento en cada partición; de lo contrario, las métricas quedan infladas.
- Variabilidad entre sitios: los resultados son agregados y el informe no documenta el rendimiento por sitio. El comportamiento en centros, escáneres o protocolos distintos de los de ABIDE-I no está caracterizado.
- Sesgos de la cohorte: la model card no documenta la composición demográfica de la muestra (edad, sexo, origen geográfico, comorbilidades), por lo que no es posible evaluar sesgos poblacionales a partir de la información disponible.
- Rendimiento moderado y desequilibrio de errores: con una exactitud del 75,90 % y un recall de 0,7440, el modelo deja sin detectar aproximadamente una cuarta parte de los casos positivos en la evaluación LOSO, con 32 falsos negativos y 28 falsos positivos sobre 249 predicciones.
- Alcance funcional muy limitado: es un clasificador binario, no un modelo generativo; no soporta diálogo, código, tool calling, agentes ni capacidades multilingües.
- Sin validación independiente: el README no afirma que el checkpoint exportado se haya reevaluado tras la exportación, y el `model-index` no contiene resultados verificables.
- Tamaño del repositorio de 0,0 GB con 0 descargas: la disponibilidad efectiva de los artefactos de inferencia y de preprocesado no está garantizada en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vinay2209/ssae-metaformer-asd
- Dataset ABIDE / Preprocessed Connectomes Project: http://preprocessed-connectomes-project.org/abide/
- Los resultados de la búsqueda web no contenían enlaces relevantes al modelo: devolvieron únicamente guías genéricas sobre bloqueo de ventanas emergentes en navegadores, sin relación con SSAE-METAFormer, ABIDE-I ni neuroimagen.
- No se han encontrado en la información disponible enlaces a paper, repositorio de código, demo o blog del autor.

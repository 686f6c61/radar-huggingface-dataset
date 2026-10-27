# suliely/defiende-el-servidor-modelos

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino dos pipelines de scikit-learn para clasificación tabular de tráfico de red, etiquetados con el conjunto UNSW-NB15. El autor publica dos ramas: v1 con regresión logística y v2 con bosque aleatorio; según la model card, v2 es la versión final seleccionada mediante validación. Cada rama incluye el modelo serializado, el preprocesamiento, las dependencias y su propia model card.

El problema que aborda es la detección de intrusiones en red a partir de características de flujos, un caso típico de MLOps y seguridad. Su relevancia es práctica pero acotada: sirve como baseline reproducible y como ejemplo de empaquetado y versionado de modelos tabulares para despliegue en CPU.

No se publican parámetros, contexto, licencia ni métricas. El repositorio indica 0.0 GB, 0 descargas y 0 likes, por lo que la disponibilidad real de los artefactos debe verificarse antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: v1 regresión logística; v2 bosque aleatorio (versión seleccionada) |
| Parámetros totales | No disponible; no se publican número de árboles, profundidad ni coeficientes |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No aplica; modelo tabular sin ventana de contexto |
| Tipos de cuantización | No aplica; scikit-learn no emplea cuantización de pesos tipo LLM; no se documenta compresión |
| Idiomas soportados | No aplica; modelo tabular; la model card no declara idiomas |
| Licencia | No disponible |
| Formato de pesos | Modelo serializado; formato exacto no disponible (joblib/pickle no confirmado) |
| Tarea | Clasificación de tráfico de red sobre características de UNSW-NB15 |
| Dataset | UNSW-NB15, según la etiqueta del repositorio |
| Librería | scikit-learn |
| Versiones | v1 (regresión logística), v2 (bosque aleatorio, seleccionada) |
| Pipeline de HuggingFace | No disponible |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clásico de aprendizaje automático supervisado para datos tabulares. La rama v1 usa regresión logística; la rama v2 usa un bosque aleatorio. El pipeline incluye el preprocesamiento de las características, aunque no se detalla qué transformaciones se aplican: normalización, codificación, imputación o selección de variables no están documentadas. Tampoco se especifican hiperparámetros, número de árboles, profundidad máxima, criterio de impureza ni semilla.

El entrenamiento se asocia al conjunto UNSW-NB15 por la etiqueta del repositorio, pero no se publican número de muestras, partición train/validación/test, balanceo de clases ni métricas. La model card indica que v2 se eligió mediante validación. No hay RLHF, DPO ni decodificación especulativa: no es un modelo generativo. La innovación principal es el empaquetado MLOps con dos ramas versionadas que contienen modelo, preprocesamiento, dependencias y documentación.

## Capacidades

- Clasificación supervisada de flujos de red a partir de características tabulares compatibles con UNSW-NB15. No se especifica si la tarea es binaria o multiclase.
- Preprocesamiento integrado en el pipeline, lo que facilita aplicar la misma transformación usada durante el entrenamiento.
- Serialización del modelo para carga en inferencia mediante las herramientas habituales de scikit-learn.
- Versionado mediante ramas de Git: v1 y v2, con artefactos y documentación separados.
- No genera texto, código, matemáticas ni contenido multimodal.
- No soporta tool calling ni function calling.
- No está diseñado para agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades multilingües, de visión, audio o modo de pensamiento.
- No es un modelo conversacional ni acepta instrucciones en lenguaje natural.

## Casos de uso

- Detección de intrusiones en red: el pipeline puede puntuar características de flujos y clasificarlos como tráfico normal o anómalo. Es adecuado para entornos con CPU porque no requiere GPU.
- Triage de alertas en un SOC: usar la probabilidad o la predicción del clasificador para priorizar flujos sospechosos y reducir el volumen de revisión manual.
- Integración en firewall o IPS: el modelo puede ejecutarse en modo batch o casi en tiempo real si se extraen las mismas características de flujo que en entrenamiento.
- Baseline de MLOps: comparar v1 y v2 dentro de un pipeline de experimentación, registrar métricas y promover la versión seleccionada mediante validación.
- Laboratorio y docencia: reproducir un flujo completo de preparación de datos, entrenamiento, serialización y despliegue con UNSW-NB15.
- Análisis forense de tráfico: convertir capturas PCAP en características de flujo y clasificarlas por lotes para investigaciones posteriores.
- Despliegue en entornos edge o on-premise: al ser un modelo tabular de scikit-learn, puede ejecutarse en servidores modestos sin acelerador hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Métrica | v1 | v2 |
|---|---|---|
| Accuracy | No disponible | No disponible |
| Precision | No disponible | No disponible |
| Recall | No disponible | No disponible |
| F1 | No disponible | No disponible |
| AUC-ROC | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. El modelo no requiere GPU; scikit-learn ejecuta la inferencia en CPU.
- GPU recomendadas: no aplica. No se documenta soporte nativo de GPU para este pipeline.
- Cabe en GPU de consumo: no aplica, porque no se usa GPU.
- CPU: cualquier procesador x86-64 o ARM moderno puede ejecutar el pipeline. La memoria RAM necesaria no está disponible y depende del tamaño del bosque, del preprocesamiento y del lote de inferencia.
- Opciones de despliegue: carga del modelo serializado con joblib o pickle, API con FastAPI o Flask, contenedor Docker, BentoML o MLflow. El soporte ONNX no está confirmado.
- Latencia y throughput: no disponibles. Dependen del número de árboles, del número de características, del hardware y del tamaño de lote.
- Advertencia de disponibilidad: el repositorio indica 0.0 GB; conviene verificar que los artefactos serializados estén realmente presentes y no sean punteros LFS vacíos.

## Comparativa con modelos similares

No se identifican alternativas externas en la información proporcionada. La única comparación disponible es interna entre las dos ramas del repositorio.

| Modelo | Algoritmo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| v1 | Regresión logística | No disponible | No aplica | No disponible | No disponible | Rama v1 |
| v2 | Bosque aleatorio | No disponible | No aplica | No disponible | No disponible | Rama v2, seleccionada |
| Alternativas externas | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La licencia no está disponible; no se puede asumir que el uso comercial esté permitido.
- No hay métricas publicadas de accuracy, precision, recall, F1 ni AUC-ROC, por lo que no es posible evaluar su calidad real.
- No se documentan el número de muestras, la partición de datos, el balanceo de clases ni los hiperparámetros, lo que dificulta reproducir el entrenamiento.
- UNSW-NB15 es un conjunto de referencia; un modelo entrenado con él puede no generalizar a redes reales con distribuciones de tráfico distintas.
- En seguridad, los falsos positivos y falsos negativos tienen coste operativo; no se documenta calibración ni umbrales recomendados.
- El pipeline exige exactamente el mismo esquema de características y el mismo preprocesamiento que en entrenamiento; cualquier cambio de features puede degradar las predicciones.
- No se documenta interpretabilidad, importancia de variables ni explicaciones por predicción.
- El repositorio muestra 0 descargas y 0 likes; no hay evidencia de validación externa ni de uso en producción.
- El tamaño de 0.0 GB puede indicar que los artefactos no están disponibles o que se gestionan fuera del repositorio.
- No es un modelo de lenguaje: no debe emplearse para generación de texto, código, atención al cliente conversacional ni tareas multimodales.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/suliely/defiende-el-servidor-modelos)
- [Rama v1 — regresión logística](https://huggingface.co/suliely/defiende-el-servidor-modelos/tree/v1)
- [Rama v2 — bosque aleatorio](https://huggingface.co/suliely/defiende-el-servidor-modelos/tree/v2)

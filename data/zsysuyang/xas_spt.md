# zsysuyang/XAS_SPT

## Resumen

XAS_SPT es una colección de checkpoints de PyTorch y estimadores serializados en joblib que acompañan al trabajo "Inferring structural descriptor information from X-ray absorption spectra through adaptive multiscale learning", firmado por Suyang Zhong, Boying Huang, Pengwei Xu, Fanjie Xu, Yuhao Zhao, Jun Cheng, Fujie Tang, Weinan E y Zhong-Qun Tian. No es un modelo de lenguaje: es un conjunto de modelos científicos especializados que infieren descriptores estructurales y electrónicos (estado de oxidación, número de coordinación, número de grupo espacial, dispersión de longitudes de enlace, entre otros) a partir de espectros XANES.

El modelo SPT combina un *lifting* de Fourier adaptativo con agregación en grafo sensible a la energía para transformar pares energía-intensidad en predicciones de descriptores. La colección incluye tanto modelos "expert" (un modelo por descriptor) como modelos "joint" (un encoder compartido entre descriptores relacionados), además de los checkpoints de los modelos de comparación empleados en el estudio. El repositorio ocupa 3,8 GB e incluye 415 ficheros de checkpoint indexados: 343 `.pth` de PyTorch y 72 `.joblib`.

Es relevante ahora porque demuestra que arquitecturas de aprendizaje adaptativo multiescala pueden extraer información estructural de espectros de absorción de rayos X con mayor precisión que los diez modelos comparados en las 12 tareas del benchmark de espectros calculados. Su utilidad es de nicho: ciencia de materiales, caracterización espectroscópica y química computacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SPT (adaptive Fourier lifting + energy-aware graph aggregation); no es un transformer |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 256 pares energía-intensidad más símbolo del elemento absorbente |
| Tipos de cuantización | no disponible (checkpoints `.pth` y `.joblib` sin cuantización publicada) |
| Idiomas soportados | inglés (documentación); el modelo no procesa lenguaje natural |
| Licencia | CC BY-NC-SA 4.0 (solo uso no comercial; uso comercial requiere permiso expreso) |
| Formato de pesos | PyTorch `.pth` y estimadores serializados `.joblib` |

## Arquitectura y entrenamiento

SPT es un modelo científico de dominio específico, no un transformer generativo. Su diseño parte de una rama de *adaptive Fourier lifting* que transforma la señal espectral energía-intensidad en una representación multiescala, seguida de una rama de agregación en grafo sensible a la energía que propaga información entre nodos espectrales para producir descriptores electrónicos y geométricos. La entrada preparada consta de 256 pares energía-intensidad (energía en eV) junto con el símbolo del elemento absorbente; la configuración asociada a cada checkpoint define el escalado de energía, la normalización de intensidad y la codificación del descriptor.

La colección distingue modelos "expert" (un checkpoint por descriptor) y modelos "joint" (un encoder compartido entre los descriptores aplicables). Se entrenaron sobre espectros XANES calculados y se validaron en cohortes medidas y calculadas. El benchmark cubre 12 tareas: ocho de clasificación (OS, CN, OCN, CN2, SGN para sitios no oxigenados; CN, CN2, SGN para sitios oxigenados) y cuatro de regresión (NNRS y MOOD para no oxigenados; NNRS y NNOSM para oxigenados). El repositorio incluye además checkpoints de ablaciones (módulos y transformadas fijas), robustez frente a ruido gaussiano, interpretabilidad (intervenciones por banda espectral y ventana de energía), incertidumbre, medidas de tiempo de ejecución y modelos de transferencia entre dominios fuente y destino. No se detalla en la información disponible el número de tokens ni la composición exacta del conjunto de entrenamiento, ni si se empleó RLHF o DPO (no aplicable en este dominio).

## Capacidades

- Predicción de descriptores estructurales y electrónicos a partir de espectros XANES: estado de oxidación (OS), número de coordinación de primera esfera (CN), número de coordinación de oxígeno (OCN), conteo de vecindad a dos saltos (CN2) y número de grupo espacial (SGN).
- Regresión de descriptores geométricos: dispersión de longitudes de enlace de primera esfera (NNRS), distancia mínima oxígeno-oxígeno no nula (MOOD) y estado de oxidación medio de átomos vecinos (NNOSM).
- Clasificación con etiquetas físicas y puntuaciones por clase; regresión en las unidades definidas por la configuración del descriptor.
- Modelos expert por descriptor y modelos joint con encoder compartido.
- Análisis de robustez frente a ruido gaussiano.
- Análisis de interpretabilidad mediante intervenciones en bandas espectrales y ventanas de energía.
- Análisis de incertidumbre y de transferencia entre dominios.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de los LLM.

## Casos de uso

- Caracterización de catalizadores de metales de transición: dado un espectro XANES medido en una línea de luz de sincrotrón, el modelo predice el estado de oxidación y el número de coordinación de primera esfera del sitio absorbente, lo que permite monitorizar cambios *in situ* durante una reacción sin ajuste manual de modelos de múltiples scattering.
- *Screening* de materiales para baterías: la predicción de NNRS y MOOD sobre espectros calculados de estructuras candidatas permite descartar configuraciones con dispersión de enlaces o distancias O-O anómalas antes de simulaciones DFT más costosas.
- Análisis de series temporales espectroscópicas: al ser un modelo ligero por checkpoint, puede aplicarse por lotes a cientos de espectros de una campaña de medida para clasificar el grupo espacial (SGN) dominante en cada muestra.
- Validación cruzada entre experimento y simulación: los checkpoints de transferencia fuente-destino permiten evaluar si un modelo entrenado con espectros calculados generaliza a espectros medidos, cuantificando el sesgo de la simulación.
- Estudio de incertidumbre en predicciones espectroscópicas: los checkpoints de la carpeta `uncertainty/` permiten estimar la fiabilidad de las predicciones de descriptores antes de usarlas en decisiones experimentales.
- Interpretabilidad de modelos científicos: las intervenciones por banda espectral y ventana de energía permiten identificar qué regiones del espectro XANES sostienen cada predicción, útil para publicaciones y revisión por pares.
- Reproducción de resultados: los checkpoints de comparación y las configuraciones permiten replicar el benchmark de 12 tareas y las ablaciones del artículo.

## Benchmarks y rendimiento

La model card indica que el SPT "expert" obtiene las mejores estimaciones puntuales en el conjunto de test entre los diez modelos comparados en las 12 tareas del benchmark de espectros calculados, usando F1 ponderado para clasificación y R² para regresión. Sin embargo, no se proporcionan los valores numéricos concretos en la información disponible.

| Tarea | Métrica | SPT expert | Mejor comparador | Datos numéricos |
|---|---|---|---|---|
| 12 tareas del benchmark | F1 ponderado / R² | mejor estimación puntual | no disponible | no disponible |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (3,8 GB) incluye 415 checkpoints, por lo que cada checkpoint individual es presumiblemente mucho menor, pero no se detalla el tamaño por fichero.
- GPU recomendadas: no disponibles. Al ser modelos pequeños de dominio específico, es probable que quepan en GPUs de consumo, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: el paquete SPT del repositorio de GitHub (https://github.com/zsy-suyang/SPT); no funciona a través de `AutoModel` de Transformers ni de endpoints de inferencia alojados.
- Latencia y throughput: no disponibles; la carpeta `checkpoints/runtime/` contiene medidas de tiempo de ejecución, pero sus valores no se recogen en la información disponible.

## Comparativa con modelos similares

La model card menciona diez modelos de comparación en el benchmark, pero no los identifica por nombre ni proporciona sus especificaciones en la información disponible.

| Modelo | Tipo | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|
| SPT (expert) | Fourier lifting adaptativo + grafo | 12 (8 clasificación, 4 regresión) | CC BY-NC-SA 4.0 | Hugging Face, código en GitHub |
| SPT (joint) | Encoder compartido | subconjunto de descriptores | CC BY-NC-SA 4.0 | Hugging Face, código en GitHub |
| Modelos de comparación (10) | no disponible | 12 | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia CC BY-NC-SA 4.0: uso estrictamente no comercial; cualquier uso comercial requiere permiso expreso de los titulares de derechos.
- Modelo de dominio muy específico: solo procesa espectros XANES con el formato de entrada preparado (256 pares energía-intensidad más símbolo del elemento); no es un modelo de propósito general.
- No es compatible con la interfaz `AutoModel` de Transformers ni con endpoints de inferencia alojados; requiere el paquete SPT.
- Riesgo de extrapolación fuera de la distribución de entrenamiento: los descriptores predichos pueden ser poco fiables para elementos, rangos de energía o estados de oxidación no representados en el conjunto de entrenamiento.
- Dependencia de la configuración: cada checkpoint requiere su configuración asociada (escalado de energía, normalización de intensidad, codificación del descriptor); usar la configuración incorrecta invalida las predicciones.
- La model card no documenta sesgos específicos ni tasas de alucinación; en este contexto, el equivalente es la predicción errónea de descriptores sin señal de confianza calibrada, mitigable parcialmente con los checkpoints de incertidumbre.
- Idiomas: la documentación está en inglés y el modelo no procesa lenguaje natural.
- Los resultados de benchmarks se describen cualitativamente ("mejor estimación puntual") sin valores numéricos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zsysuyang/XAS_SPT
- Dataset: https://huggingface.co/datasets/zsysuyang/XAS_SPT
- Código en GitHub: https://github.com/zsy-suyang/SPT
- Guía de reproducción de experimentos: https://github.com/zsy-suyang/SPT/blob/main/docs/reproduce.md
- Índice de pesos: checkpoints/WEIGHT_INDEX.csv (dentro del repositorio)
- Manifiesto de assets: ASSET_MANIFEST.json (dentro del repositorio)
- Licencia: LICENSE (dentro del repositorio)

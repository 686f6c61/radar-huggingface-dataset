# Teamrat/habit

## Resumen

HABIT (Hierarchical Attention-Based Inference with Transfer Learning) es un modelo de regresión tabular preentrenado para predecir curvas de retención de agua en el suelo a partir de propiedades edafológicas básicas. Desarrollado por Teamrat A. Ghezzehei, investigador de la Universidad de California en Merced, el modelo aborda un problema clásico en ciencias del suelo: la estimación de la curva de retención de humedad sin necesidad de resolver el problema inverso mal condicionado que plantean los enfoques paramétricos tradicionales como el ajuste de van Genuchten.

El modelo emplea una arquitectura de atención jerárquica con codificadores específicos por propiedad, capas de atención cruzada y una capa de salida monótona que impone el comportamiento físico correcto (el contenido de agua disminuye al aumentar la tensión). Se compone de un conjunto (ensemble) de 20 modelos que proporcionan incertidumbre cuantificada en cada predicción. Su relevancia actual radica en que ofrece predicciones directas de la curva completa de retención con entradas parciales, adaptándose automáticamente a la disponibilidad de datos, desde textura únicamente hasta propiedades hidráulicas completas.

El modelo se distribuye bajo licencia MIT, con pesos en formato H5 de TensorFlow, y está diseñado para su uso en aplicaciones de hidrología, agricultura y modelización del cambio climático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de atención jerárquica con codificadores por propiedad, atención cruzada y capa de salida monótona |
| Parametros totales | No disponible (20 miembros de ensemble, 19 MB cada uno) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No disponible (pesos en float32 de TensorFlow) |
| Idiomas soportados | No aplica (modelo numérico, documentación en inglés) |
| Licencia | MIT (código y pesos); datos de entrenamiento CC BY 4.0 |
| Formato de pesos | H5 (TensorFlow), ONNX disponible en tags del repositorio |

## Arquitectura y entrenamiento

HABIT utiliza una arquitectura de atención jerárquica con codificadores específicos para cada propiedad del suelo (textura, densidad aparente, carbono orgánico, conductividad hidráulica saturada), seguidos de capas de atención cruzada que modelan las interacciones entre propiedades. La atención multi-cabeza opera sobre las propiedades del suelo y los potenciales de agua, y una capa de salida monótona con 40 funciones base garantiza que el contenido de agua predicho disminuya al aumentar la tensión, imponiendo así el comportamiento físico esperado.

El entrenamiento emplea transferencia jerárquica: el modelo se entrena secuencialmente, primero solo con textura (Stage 0), luego añadiendo densidad aparente (Stage 1), carbono orgánico (Stage 2) y conductividad hidráulica saturada (Stage 3). Un único conjunto de pesos maneja cualquier combinación de entradas mediante enmascaramiento. El conjunto de datos de entrenamiento incluye 2.577 muestras de suelo compiladas de dos bases de datos internacionales (Hohenbrink et al. 2023; Gupta et al. 2022), con 44.636 mediciones de retención de agua tras un proceso de adelgazamiento adaptativo. El ensemble de 20 miembros proporciona la media y desviación estándar de las predicciones como medida de incertidumbre.

## Capacidades

- Predicción directa del contenido volumétrico de agua (cm³/cm³) para cualquier potencial de agua (kPa) a partir de propiedades del suelo.
- Adaptación automática a entradas parciales: textura sola, textura + densidad aparente, + carbono orgánico, o todas las propiedades incluyendo conductividad hidráulica saturada.
- Cuantificación de incertidumbre mediante ensemble de 20 modelos (media ± desviación estándar).
- Imposición de monotonicidad física: el contenido de agua predicho siempre disminuye con el aumento de la tensión.
- Interpolación de la curva de retención completa sin necesidad de ajuste paramétrico previo.
- Inferencia por lotes desde CSV y API Python sencilla.
- Interfaz web interactiva disponible como Hugging Face Space.

## Casos de uso

- Planificación de riego agrícola: el modelo puede estimar la capacidad de retención de agua de un suelo a partir de análisis de textura estándar, permitiendo optimizar la frecuencia y cantidad de riego sin necesidad de costosos ensayos de laboratorio. Su capacidad de trabajar solo con textura lo hace accesible para agricultores con análisis básicos de suelo.

- Modelización hidrológica a escala de cuenca: los modelos de simulación hidrológica requieren curvas de retención para cada unidad de suelo. HABIT permite generar estas curvas de forma masiva desde bases de datos de propiedades del suelo, con incertidumbre cuantificada que puede propagarse a las simulaciones.

- Evaluación de impacto del cambio climático en la disponibilidad de agua: combinando proyecciones de cambio de uso del suelo y carbono orgánico, el modelo puede estimar cómo variará la capacidad de retención de agua bajo distintos escenarios, informando políticas de conservación de suelos.

- Estudios de carbono orgánico del suelo: al incluir el carbono orgánico como entrada opcional, HABIT permite evaluar cómo los cambios en el contenido de materia orgánica afectan a la retención de agua, útil para proyectos de secuestro de carbono y restauración de suelos degradados.

- Ingeniería geotécnica y de cimentaciones: la curva de retención es un insumo clave para el diseño de cimentaciones en suelos no saturados. El modelo puede proporcionar estimaciones rápidas para estudios preliminares de viabilidad con datos limitados de campo.

- Educación e investigación en ciencias del suelo: la interfaz web interactiva y la API Python facilitan su uso en cursos de edafología e hidrología, permitiendo a estudiantes explorar cómo las diferentes propiedades del suelo afectan a la retención de agua sin necesidad de equipamiento de laboratorio.

## Benchmarks y rendimiento

El modelo fue evaluado sobre un conjunto de prueba reservado mediante bootstrap por conglomerados con 1.000 iteraciones. Los resultados se comparan con el modelo Rosetta, un estándar en la estimación de funciones de pedotransferencia:

| Configuración | R² | RMSE (cm³/cm³) | MAE (cm³/cm³) |
|---|---|---|---|
| HABIT Stage 0 (solo textura) | 0,779 [0,737, 0,817] | 0,067 [0,060, 0,074] | 0,049 [0,044, 0,055] |
| HABIT Stage 1 (+densidad aparente) | 0,846 [0,748, 0,906] | 0,056 [0,044, 0,070] | 0,039 [0,033, 0,049] |
| HABIT Stage 2 (+carbono orgánico) | 0,862 [0,781, 0,920] | 0,052 [0,040, 0,066] | 0,038 [0,030, 0,047] |
| HABIT Stage 3 (+Ksat) | 0,923 [0,899, 0,944] | 0,043 [0,036, 0,050] | 0,030 [0,026, 0,035] |
| Rosetta Model 2 (solo textura) | 0,009 | 0,141 | 0,113 |
| Rosetta Model 3 (+densidad aparente) | 0,511 | 0,099 | 0,075 |

Los intervalos entre corchetes indican los intervalos de confianza al 95 % del bootstrap. HABIT supera consistentemente a Rosetta en todas las configuraciones comparables.

## Requisitos de hardware

- El repositorio completo pesa 0,7 GB, con 20 archivos de pesos de 19 MB cada uno (aproximadamente 380 MB en total).
- Inferencia en CPU sin GPU: el modelo es pequeño y las predicciones por lotes se completan en segundos en hardware convencional.
- Memoria RAM estimada: menos de 1 GB para cargar el ensemble completo en memoria.
- No requiere GPU para inferencia; el entrenamiento se realizó con TensorFlow y podría reproducirse en una GPU de gama media (8-16 GB VRAM).
- Opciones de despliegue: API Python local, CLI (`habit-predict`), Hugging Face Space interactivo, exportación a ONNX para integración con otros frameworks.
- Latencia estimada: del orden de milisegundos por predicción individual en CPU moderna.

## Comparativa con modelos similares

| Modelo | Enfoque | Entradas | R² (textura) | R² (+BD) | Licencia |
|---|---|---|---|---|---|
| HABIT (Stage 0-3) | Atención jerárquica + ensemble | Textura, BD, OC, Ksat | 0,779 | 0,846 | MIT |
| Rosetta Model 2 | Red neuronal (Schaap et al.) | Textura | 0,009 | — | No especificada |
| Rosetta Model 3 | Red neuronal (Schaap et al.) | Textura + BD | — | 0,511 | No especificada |

HABIT supera ampliamente a Rosetta en las configuraciones comparables, con una mejora sustancial en R² y reducción de error. La principal ventaja diferencial es la capacidad de manejar entradas parciales con un único modelo y proporcionar incertidumbre calibrada mediante ensemble.

## Limitaciones y advertencias

- El modelo se entrenó con 2.577 muestras de suelo de dos bases de datos internacionales; su rendimiento en suelos de regiones no representadas (p. ej., suelos volcánicos, orgánicos puros o suelos muy salinos) puede degradarse significativamente.
- Las predicciones para potenciales de agua fuera del rango cubierto por los datos de entrenamiento deben considerarse extrapolaciones y tratarse con cautela.
- La incertidumbre proporcionada por el ensemble refleja la variabilidad entre miembros, pero no captura todos los tipos de error (p. ej., error de medición en las entradas).
- El modelo asume que las propiedades de entrada son consistentes entre sí; valores incoherentes (p. ej., textura que no suma 1) pueden producir predicciones erróneas.
- La licencia MIT permite uso comercial sin restricciones, pero los datos de entrenamiento (CC BY 4.0) requieren atribución si se redistribuyen.
- El DOI del artículo está pendiente de asignación; la cita debe actualizarse cuando esté disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Teamrat/habit
- Repositorio GitHub: https://github.com/teamrat/habit
- Hugging Face Space (demo interactiva): https://huggingface.co/spaces/Teamrat/habit
- Repositorio de datos y código de entrenamiento (Dryad): https://datadryad.org/share/LINK_NOT_FOR_PUBLICATION/iXOXxn5h-Hdq9m7aA3cTLgGMAHiHMre2HxZItyI-Ykc
- Artículo: Ghezzehei TA (2025). Interpretable Soil Water Retention Prediction Using Hierarchical Attention Networks with Uncertainty Quantification. *Water Resources Research*. DOI pendiente.

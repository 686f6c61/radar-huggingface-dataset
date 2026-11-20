# TrGiaHuy/kaizen-mstcn-ha4m

## Resumen

MS-TCN step segmenter for HA4M assembly videos es un conjunto de modelos de segmentación temporal de acciones (TAS) desarrollados por TrGiaHuy como parte del proyecto de curso Kaizen Motion Analyzer. El modelo etiqueta cada fotograma de un vídeo de ensamblaje con el paso concreto que se está ejecutando y su número de repetición, trabajando sobre keypoints 2D extraídos con MediaPipe en lugar de sobre píxeles en bruto. Está entrenado sobre el conjunto de datos HA4M (ensamblaje de un tren de engranajes epicicloidal) y forma parte de un pipeline que convierte los pasos predichos en duraciones, tiempo de ciclo e indicadores Muda/Mura/Muri, explicados después mediante una capa RAG.

La arquitectura es MS-TCN (Multi-Stage Temporal Convolutional Network) con 4 etapas de 10 capas residuales dilatadas, 64 canales, kernel 3 y dilataciones 2^0–2^9, lo que da un campo receptivo de 2.047 pasos temporales (aproximadamente 136 segundos a 15 Hz). El modelo principal tiene 672.904 parámetros y produce 18 clases (17 claves de paso más fondo). La entrada son keypoints de MediaPipe muestreados cada dos fotogramas de vídeo a 30 fps (15 Hz).

Su relevancia es acotada pero concreta: demuestra un enfoque ligero (menos de 1 M de parámetros) para el análisis de tiempos y desperdicios en líneas de ensamblaje manual, un caso de uso industrial poco cubierto por modelos generalistas. No obstante, el entrenamiento se limita a una sola persona y dos vídeos, por lo que la generalización a nuevos operarios es muy limitada, tal como reconoce el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MS-TCN: 4 etapas × 10 capas residuales dilatadas, 64 canales, kernel 3, dilatación 2^0–2^9, dropout 0.5 |
| Parametros totales | 672.904 (modelo principal), 671.752 (variante) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | campo receptivo de 2.047 pasos temporales (≈136 s a 15 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico; opera sobre keypoints) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (`model.pt`, pickle con `state_dict` y `config`); configuración en `config.json` |

## Arquitectura y entrenamiento

El modelo es una MS-TCN pura, sin componente de atención ni arquitectura híbrida: cuatro etapas de diez capas convolucionales dilatadas con 64 canales, kernel de tamaño 3 y dilataciones que crecen como potencias de 2 hasta 2^9. La salida es una clasificación por fotograma sobre 18 clases (17 claves de paso con formato `action.repetition` más la clase de fondo `0`). La función de pérdida combina entropía cruzada con un término de suavizado MSE truncado (τ = 4) ponderado por 0,15, habitual en segmentación temporal para penalizar transiciones bruscas.

La entrada son keypoints de MediaPipe de la parte superior del cuerpo (9 puntos: nariz, hombros, codos, muñecas y caderas) con coordenadas de imagen, coordenadas relativas al cuerpo, velocidades y máscara de visibilidad, lo que da 63 dimensiones en el modelo principal. La variante elimina las coordenadas absolutas de imagen y queda en 45 dimensiones. El entrenamiento se hizo sobre los sujetos U001 y U002 del dataset HA4M (solo los procesables; cada vídeo pesa unos 12 GB comprimidos y la extracción de keypoints tarda 6–7 minutos por vídeo en CPU), con aumento de datos por escalado global de velocidad (factor log-uniforme en [0,667, 1,5]), learning rate 5e-4, weight decay 1e-4, batch 4 y 190 épocas en el modelo principal (160 en la variante). La selección de configuración se hizo por validación cruzada de 2 folds sobre los dos vídeos de U001 con 5 semillas cada una. La decodificación es argmax por fotograma o decodificación ordenada por SOP, fusionando segmentos de menos de 0,5 s.

## Capacidades

- Segmentación temporal de acciones fotograma a fotograma sobre secuencias de keypoints 2D.
- Clasificación en 17 pasos de ensamblaje concretos más fondo, con distinción de repeticiones (por ejemplo, `2.0`, `2.1`, `2.2` para los tres rodamientos de engranaje).
- Extracción implícita de duraciones de paso y tiempo de ciclo a partir de la secuencia de etiquetas predicha.
- Base para el cálculo de indicadores Muda, Mura y Muri en el pipeline del proyecto Kaizen Motion Analyzer.
- Dos variantes de features: 63 dimensiones (con coordenadas de imagen) y 45 dimensiones (solo relativas al cuerpo).
- Cinco semillas por configuración (`s0`–`s4`) para análisis de estabilidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No procesa vídeo en bruto; requiere keypoints previamente extraídos con MediaPipe.

## Casos de uso

- Análisis de tiempos en línea de ensamblaje manual: el modelo etiqueta cada fotograma del vídeo con el paso en curso y permite reconstruir la duración de cada operación y el tiempo de ciclo total, útil para estudios de métodos y tiempos en entornos industriales.
- Detección de desperdicios (Muda): al comparar las duraciones predichas por paso con un estándar, el pipeline puede señalar operaciones que se alargan de forma anómala, como búsquedas de piezas o recolocaciones.
- Detección de irregularidades (Mura) entre repeticiones: la distinción de repeticiones (`2.0`, `2.1`, `2.2`) permite comparar la misma operación repetida varias veces y detectar variabilidad en la ejecución.
- Formación de operarios: la tabla de pasos generada sirve como referencia para comparar la ejecución de un aprendiz con la secuencia canónica del ensamblaje del tren epicicloidal.
- Investigación en segmentación temporal de acciones: el modelo y sus curvas de entrenamiento y predicciones de test (`test_epoch_*/`) sirven como línea base reproducible en TAS con keypoints y pocos datos.
- Prototipado de analítica industrial asistida por RAG: la salida de pasos y duraciones alimenta la capa RAG del proyecto, que explica cada hallazgo en lenguaje natural; el segmentador es la pieza de percepción de ese pipeline.
- Estudio de robustez ante vestimenta y guantes: el test sobre U002 (con guantes) documenta la degradación de la detección de keypoints de dedos y sirve para evaluar estrategias de features que eviten depender de ellos.

## Benchmarks y rendimiento

Resultados publicados en la model card, media ± desviación estándar sobre 5 semillas, decodificación argmax:

| Configuracion | F1@50, CV en U001 | F1@50, U002 | Exactitud (%), U002 | Edit, U002 | MAE duracion de paso (s), U002 |
|---|---|---|---|---|---|
| Principal (63-dim) | 79,1 ± 10,1 | 34,3 ± 8,5 | 44,5 ± 4,2 | 81,4 ± 5,6 | 2,80 ± 0,42 |
| Variante (45-dim) | 75,5 ± 15,5 | 54,5 ± 16,3 | 55,4 ± 6,4 | 92,1 ± 11,4 | 2,34 ± 0,46 |

Referencias del propio autor: una línea base de reglas manuales por zonas de bandeja reconoció 2 de 16 pasos en U002; la configuración inicial (105 features con puntos de dedos y sin aumento de velocidad) alcanzó F1@50 de 17,6 en U002. El autor advierte que la brecha entre 79,1 y 34,3 refleja la diferencia entre una persona vista en entrenamiento y una nueva, y que las desviaciones corresponden a semillas sobre un único sujeto de test, no a variabilidad entre operarios.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima (menos de 1 GB); el modelo tiene 672.904 parámetros y opera sobre secuencias de keypoints, no sobre imágenes.
- GPU recomendadas: no se especifican en la información disponible; cualquier GPU consumer moderna es sobradamente suficiente, e incluso la inferencia en CPU es viable.
- Cabe en cualquier GPU consumer; también en CPU sin problema aparente.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). La inferencia requiere el paquete `kaizen` del proyecto (`python -m kaizen.train.segmenter predict` o `load_model`), que no está incluido en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto temporal | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (MS-TCN HA4M) | 672.904 | 2.047 pasos (≈136 s a 15 Hz) | Keypoints MediaPipe 2D | no disponible | Hugging Face (`TrGiaHuy/kaizen-mstcn-ha4m`) |
| MS-TCN original (Farha y Gall, 2019) | no disponible en la información | no disponible | Keypoints/vídeo | no disponible | Repositorio académico |
| ASFormer | no disponible en la información | no disponible | Keypoints | no disponible | Repositorio académico |
| Línea base de reglas por zonas de bandeja (misma tarea) | 0 (reglas) | no aplica | Keypoints | no disponible | Definida en el proyecto |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la única comparación cuantitativa publicada es con la línea base de reglas (2 de 16 pasos reconocidos en U002).

## Limitaciones y advertencias

- Datos de entrenamiento muy reducidos: una sola persona (dos vídeos de U001) y un único sujeto de test (U002); los resultados no son estimaciones para operarios en general.
- Caída severa de rendimiento en sujetos no vistos: F1@50 de 34,3 en U002 frente a 79,1 en validación cruzada sobre U001 en el modelo principal.
- Dependencia de la detección de keypoints: en U002 con guantes solo se detectan puntos de dedos en el 13 % de los fotogramas (frente al 89 % en U001), lo que degrada la señal de entrada.
- El vídeo de test está recortado a 108,6 s, por lo que el paso 12 queda excluido de la evaluación; el modelo no está validado en esa fase del ensamblaje.
- Licencia no especificada: no hay autorización explícita para uso comercial; debe consultarse con el autor antes de cualquier despliegue en producción.
- `model.pt` es un pickle cargado con `weights_only=False`; solo debe cargarse desde fuentes de confianza por riesgo de ejecución de código arbitrario.
- El paquete `kaizen` necesario para la inferencia no está incluido en el repositorio, lo que dificulta la reproducibilidad.
- El modelo no procesa vídeo en bruto: requiere un paso previo de extracción de keypoints con MediaPipe (6–7 minutos por vídeo en CPU).
- No hay información sobre sesgos demográficos, alucinación (no aplica, no genera texto) ni comportamiento en otros idiomas o dominios distintos del ensamblaje del tren epicicloidal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TrGiaHuy/kaizen-mstcn-ha4m
- Dataset HA4M (referenciado en la model card): no disponible enlace directo en la información proporcionada
- Paper original de MS-TCN (Farha y Gall, 2019): no disponible enlace en la información proporcionada
- Repositorio del proyecto Kaizen Motion Analyzer: no disponible enlace en la información proporcionada
- MediaPipe (herramienta de extracción de keypoints): no disponible enlace en la información proporcionada

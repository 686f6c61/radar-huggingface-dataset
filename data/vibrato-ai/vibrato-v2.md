# Vibrato-ai/vibrato-v2

## Resumen

Vibrato v2 es un modelo de análisis vocal de código abierto desarrollado por Vibrato-ai (Anycompany LLC) para la comunidad de canto. Se trata de una red neuronal convolucional 1D (1D CNN) de 269.464 parámetros que realiza múltiples tareas de análisis de voz cantada: clasificación de técnica vocal, clasificación de vocales, y estimación de cinco dimensiones de calidad acústica. El modelo está entrenado sobre el corpus VocalSet (Wilkins et al., ISMIR 2018) y es el motor del asistente de entrenamiento vocal gratuito para iOS llamado Toney.

La versión 2 es un reentrenamiento completo desde cero sobre la misma arquitectura que v1, corrigiendo defectos metodológicos y de datos detectados en una auditoría: cobertura del corpus ampliada del 43% al 100% (3.613 archivos, 8,8 horas), división de cantantes corregida (14/3/3), etiquetas de calidad basadas en mediciones acústicas con Praat/parselmouth en lugar de heurísticas, y condiciones de entrenamiento que igualan la inferencia (entrada de audio sin normalizar, aumentación para robustez frente a micrófonos de teléfono). El modelo se distribuye en formato CoreML FP16 para despliegue en dispositivos iOS 17+ y como checkpoint de PyTorch, bajo licencia Apache-2.0.

La relevancia de este modelo reside en su enfoque: es un modelo de análisis vocal especializado, pequeño y eficiente, diseñado para ejecutarse en dispositivos móviles, con un pipeline de entrenamiento completo y reproducible publicado junto al modelo. Su rendimiento en métricas de calidad acústica (R² medio de 0,528) supera ampliamente a la versión anterior, aunque presenta limitaciones conocidas documentadas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 1D CNN con encoder compartido (4 bloques convolucionales, BatchNorm, stride-2, AdaptiveAvgPool) y 4 cabezas de salida |
| Parametros totales | 269.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 0,25 segundos de audio a 16 kHz (4000 muestras) |
| Tipos de cuantizacion | CoreML FP16 (ML Program) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint (.pt), CoreML ML Program (.mlpackage), labels.plist |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional 1D con un encoder compartido que procesa la entrada de audio crudo sin normalizar (4000 muestras, 0,25 s a 16 kHz) y produce un vector de características de 256 dimensiones. Este vector alimenta cuatro cabezas de salida independientes: clasificación de voz (6 clases), clasificación de técnica vocal (7 clases: belt, falsetto, vibrato, straight, breathy, nasal, mixed), clasificación de vocales (6 clases: a, e, i, o, u, schwa) y regresión de calidad (5 dimensiones: brightness, breathiness, strain, power, stability, con sigmoide en el modelo). El orden de las clases es fijo y debe respetar el mapa de etiquetas en `labels.plist`.

El entrenamiento se realizó sobre VocalSet, un corpus de canto profesional con 20 cantantes (9 femeninos, 11 masculinos) y 8,8 horas de audio. La división de datos es disjunta por cantante (14/3/3 para entrenamiento/validación/test). Las etiquetas de calidad se calcularon con Praat/parselmouth: CPPS, jitter+shimmer, desviación estándar de f0 en semitonos y RMS por ventana de 1 segundo. Se aplicó aumentación con ganancia, ruido, EQ y reverberación sintética para robustecer el modelo frente a micrófonos de teléfono. El entrenamiento es determinista y reproducible, con un tiempo aproximado de 3 horas en un Apple M4 Pro con MPS. Las clases `vocal_fry` y `lip_trill` se enmascaran de la pérdida de técnica (en v1 estaban mal etiquetadas como `nasal`/`mixed`), aunque su audio sí entrena las otras cabezas.

## Capacidades

- Clasificación de técnica vocal en 7 clases (belt, falsetto, vibrato, straight, breathy, nasal, mixed) con precisión de 0,690 y macro-F1 de 0,451 sobre cantantes no vistos.
- Clasificación de vocales cantadas en 6 clases (a, e, i, o, u, schwa) con precisión de 0,709 y macro-F1 de 0,703.
- Estimación de 5 dimensiones de calidad acústica: power (R² 0,962), brightness (R² 0,730), breathiness (R² 0,582), strain (R² 0,325) y stability (R² 0,043).
- Clasificación de tipo de voz en 6 clases (solo para compatibilidad de interfaz; la model card advierte que no debe mostrarse al usuario porque no es aprendible del corpus).
- Inferencia en tiempo real en dispositivos móviles gracias a su tamaño reducido (548 KB en CoreML FP16) y baja latencia.
- Procesamiento de audio crudo sin normalizar, lo que simplifica la integración en aplicaciones.

## Casos de uso

- Aplicación de entrenamiento vocal móvil: el modelo alimenta Toney, una app gratuita de iOS que analiza ejercicios de canto en tiempo real. Un cantante puede grabar un ejercicio y recibir retroalimentación inmediata sobre técnica, vocal y calidad acústica.
- Análisis de técnica vocal para pedagogía del canto: profesores de canto pueden usar el modelo para evaluar objetivamente a sus alumnos, identificando si usan belt, breathy o straight, y midiendo dimensiones como power o brightness.
- Evaluación de calidad de grabaciones vocales: productores musicales pueden integrar el modelo en sus flujos de trabajo para medir objetivamente la calidad de una toma vocal (potencia, brillo, respiración) antes de la mezcla.
- Investigación en canto y fonética: el modelo proporciona una herramienta reproducible para estudiar la voz cantada, con un pipeline de entrenamiento completo y etiquetas basadas en mediciones acústicas objetivas.
- Desarrollo de asistentes de práctica vocal: se puede integrar en aplicaciones web o de escritorio para que estudiantes de canto practiquen de forma autónoma, recibiendo métricas de calidad y detección de técnica.
- Benchmarking de modelos de audio: al ser un modelo pequeño, abierto y con evaluación reproducible, sirve como punto de referencia para comparar arquitecturas de análisis vocal en dispositivos con recursos limitados.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación sobre cantantes no vistos (held-out), comparando v2 con v1 y con una línea base de mayoría:

| Metrica | v2 (held-out) | v1¹ | Línea base de mayoria |
|---|---|---|---|
| Precisión técnica / macro-F1 | 0,690 / 0,451 | 0,353 / 0,385 | 0,704 / ≈0,207 |
| Precisión vocal / macro-F1 | 0,709 / 0,703 | 0,716 / 0,718 | 0,201 |
| Calidad media R² (5 dimensiones) | 0,528 | −2,782 | 0 por definición |

R² por dimensión de calidad (v2): power 0,962, brightness 0,730, breathiness 0,582, strain 0,325, stability 0,043.

¹ Errata: los números de v1 son de entrenamiento, no de validación. v1 entrenó con 18 de 20 cantantes, incluyendo los de validación y test de v2, por lo que no son comparables directamente. Las salidas de calidad de v1 tienen R² negativo en las cinco dimensiones.

## Requisitos de hardware

- Inferencia: el modelo es extremadamente ligero (269.464 parámetros, 548 KB en CoreML FP16). Se ejecuta en cualquier iPhone con iOS 17+ sin problemas de memoria o latencia.
- Entrenamiento: el pipeline completo tarda aproximadamente 3 horas en un Apple M4 Pro con MPS. No se requiere GPU dedicada; cualquier hardware moderno con soporte PyTorch es suficiente.
- Despliegue: el formato CoreML ML Program está optimizado para Apple Neural Engine y GPU. Para otros entornos, el checkpoint de PyTorch se puede convertir a ONNX o TensorFlow Lite.
- Opciones de despliegue: integración directa en apps iOS con CoreML, o en servidores con PyTorch para análisis por lotes. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: no se proporcionan cifras exactas, pero el tamaño del modelo y su diseño para dispositivos móviles implican latencias de milisegundos en hardware moderno.

## Comparativa con modelos similares

No se han encontrado modelos públicos comparables en la misma categoría (análisis vocal multi-tarea con etiquetas acústicas objetivas). La comparación directa más relevante es con la versión anterior del mismo modelo:

| Modelo | Parametros | Contexto | Precisión técnica | Calidad R² | Licencia |
|---|---|---|---|---|---|
| Vibrato v2 | 269.464 | 0,25 s | 0,690 | 0,528 | Apache-2.0 |
| Vibrato v1 | 269.464 | 0,25 s | 0,353 (entrenamiento) | −2,782 | Apache-2.0 |

No se dispone de información sobre otros modelos de análisis vocal con métricas comparables en la información proporcionada.

## Limitaciones y advertencias

- La recall de la clase `vibrato` es de 0,040: la ventana de entrada de 0,25 s solo captura 1-2 ciclos de una modulación de 5-7 Hz, un límite arquitectónico, no un problema de etiquetado.
- La dimensión `stability` tiene un R² de 0,043, prácticamente nulo; no es fiable y debe suprimirse en productos orientados al usuario.
- Las clases `falsetto`, `nasal`, `mixed` y `schwa` no tienen muestras de entrenamiento (VocalSet no contiene grabaciones de falsetto), por lo que sus logits no están entrenados.
- La clasificación de tipo de voz (fach) no es aprendible del corpus: todos los cantantes realizan los mismos ejercicios a las mismas alturas, y la mediana de f0 dentro de cada género abarca solo 386-418 Hz. Solo la distinción femenino/masculino es fiable (consistencia de género 0,942). La cabeza de 6 clases existe por compatibilidad de interfaz y no debe mostrarse.
- La precisión de técnica (0,690) está ligeramente por debajo de la línea base de mayoría (0,704) en este corpus con 70% de clips `straight`, aunque el macro-F1 es muy superior.
- Entrenado con 20 cantantes profesionales, un solo corpus y 8,8 horas de audio. No hay cobertura de voces amateur ni de estilos no occidentales más allá de la aumentación sintética.
- Fuera de alcance: reconocimiento de habla, identificación de idioma, identificación de hablante y diagnóstico médico de trastornos vocales. No es un sistema biométrico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Vibrato-ai/vibrato-v2
- Versión anterior: https://huggingface.co/Vibrato-ai/vibrato-v1
- Organización Vibrato-ai: https://huggingface.co/Vibrato-ai
- Dataset VocalSet (Wilkins et al., ISMIR 2018): Julia Wilkins, Prem Seetharaman, Alison Wahl, Bryan Pardo. "VocalSet: A Singing Voice Dataset." ISMIR 2018.

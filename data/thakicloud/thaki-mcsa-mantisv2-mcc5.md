# ThakiCloud/Thaki-MCSA-MantisV2-MCC5

## Resumen

Thaki-MCSA-MantisV2-MCC5 es un checkpoint de investigación publicado por ThakiCloud que consiste en un encoder MantisV2 afinado por completo (fine-tuning completo, no adaptadores) para clasificar 24 estados de fallo de un motor de inducción trifásico a partir únicamente de sus tres corrientes de fase. La tarea se enmarca en el análisis de firma de corriente de motor (MCSA, *motor current signature analysis*) y el modelo se entrenó y evaluó sobre un único banco de ensayos de laboratorio (MCC5-THU, 2,2 kW).

El modelo parte de `paris-noah/MantisV2`, un encoder de series temporales de la familia Mantis, y se distribuye como pesos PyTorch (`.pt`) junto con un paquete de inferencia (`mantis-tsfm==1.1.0` y el módulo `thaki_mcsa`) que verifica el hash SHA-256 antes de cargar. La entrada debe ser una matriz `[3, n]` de corrientes en amperios muestreadas exactamente a 12.800 Hz con al menos 65.536 muestras (5,12 s); el pipeline segmenta la señal en ventanas no solapadas y agrega las predicciones a nivel de registro.

Su relevancia es doble. Por un lado, demuestra que un encoder de series temporales preentrenado puede igualar (sin superar de forma significativa) a un baseline de características físicas espectrales con regresión logística, con probabilidades mucho mejor calibradas (ECE 0,025 frente a 0,142). Por otro, la propia model card documenta un grave problema de confusión: un baseline que usa solo la marca temporal de la grabación alcanza 0,986 de macro-F1 en el conjunto de test, por encima del 0,943 del modelo. Es, por tanto, un caso de estudio ejemplar sobre validación honesta y fugas de información en datasets de diagnosis.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer de series temporales (MantisV2), fine-tuning completo |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; entrada de al menos 65.536 muestras a 12.800 Hz (5,12 s), segmentada en ventanas |
| Tipos de cuantización | no disponible (se distribuyen pesos PyTorch en coma flotante; no se documentan GGUF ni variantes cuantizadas) |
| Idiomas soportados | en, ko (documentación y mensajes del paquete; la tarea es numérica, no lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch), checkpoint `mantisv2_mcc5_full_welch.pt` con verificación SHA-256 |
| Frecuencia de muestreo de entrada | 12.800 Hz exactos (el cargador rechaza otras frecuencias) |
| Número de clases | 24 estados de fallo |
| Dataset | MCC5-THU (banco de ensayos de 2,2 kW) |
| Pipeline (Hugging Face) | other |

## Arquitectura y entrenamiento

El modelo es un encoder MantisV2 (`paris-noah/MantisV2`) sometido a fine-tuning completo sobre la tarea de clasificación de 24 clases. El pipeline de preprocesado aplica vistas de Welch sobre la señal trifásica: la corriente se divide en ventanas no solapadas, se calcula la densidad espectral de potencia por ventana y las predicciones se agregan a nivel de registro. El checkpoint distribuido se denomina `mantisv2_mcc5_full_welch.pt`, lo que confirma que la variante entrenada usa características espectrales de Welch como entrada al encoder.

El entrenamiento se realizó sobre el dataset MCC5-THU. La validación cruzada *leave-one-condition-out* (LOCO) de 9 pliegues se hizo sobre 208 grabaciones del split TRAIN_DEV, con un modelo nuevo entrenado en cada pliegue. El conjunto de test sellado (71 grabaciones, tres condiciones de operación no vistas: `speed_20Nm_2000rpm`, `torque_20Nm_3000rpm`, `torque_40Nm_1000rpm`) se abrió exactamente una vez, el 2026-11-06, sin cambios posteriores. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF/DPO (no aplica a una tarea de clasificación).

La innovación metodológica destacable no es arquitectónica sino de evaluación: la model card separa explícitamente tres cifras con significados distintos (estimación de procedimiento por validación cruzada, score del checkpoint liberado sobre test sellado, y baseline de metadatos), y reporta intervalos de confianza por bootstrap pareado de 10.000 remuestreos, calibración (ECE de 10 bins, Brier) y una regla preregistrada de superioridad (diferencia ≥ 5 pp con cota inferior del IC > 0).

## Capacidades

- Clasificación de 24 estados de fallo de motor de inducción trifásico a partir de tres corrientes de fase (amperios) muestreadas a 12.800 Hz.
- Detección de fallos de devanado (`winding_H`, `winding_L`), de rodamiento (`bearing_outer_H`) y de curvatura (`bend`), entre otras clases.
- Agregación a nivel de registro: produce etiqueta, top-3 y número de ventanas procesadas (`predict_recording`).
- Salida probabilística calibrada (ECE 0,025 en test), apta para umbrales de confianza.
- Inferencia determinista y consistente entre CPU y GPU (acuerdo argmax del 100 %, diferencia máxima de probabilidad de 0,0014).
- Carga con verificación de integridad SHA-256 del checkpoint.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de series temporales, no un modelo de lenguaje.
- Capacidades multilingües limitadas a la documentación (inglés y coreano); el modelo no procesa lenguaje.

## Casos de uso

- Investigación en diagnosis de fallos: reproducción del experimento de test sellado con las 71 grabaciones y el fichero `eval/test71_metrics.json` para auditar la metodología de evaluación y el análisis de confusión temporal.
- Baseline de comparación para nuevos métodos de MCSA: el modelo y el baseline de características físicas con regresión logística (macro-F1 0,923) sirven como referencia cuantitativa con IC bootstrap para trabajos que propongan alternativas sobre MCC5-THU.
- Estudio de calibración de clasificadores industriales: con ECE 0,025 frente a 0,142 del baseline físico, es un caso útil para investigar cómo afecta la calibración a la hora de fijar umbrales de alarma en mantenimiento predictivo.
- Docencia y formación en evaluación rigurosa de modelos: el contraste entre el 0,943 del modelo y el 0,986 del baseline de marca temporal es un ejemplo concreto de fuga de información por confusión entre etiqueta y tiempo de grabación.
- Prototipado de pipelines de adquisición de corriente: el cargador impone 12.800 Hz y 65.536 muestras, lo que permite validar cadenas de captura y preprocesado (vistas de Welch) antes de abordar un modelo propio.
- Análisis de separabilidad de severidad de fallo de devanado: los errores concentrados en `winding_H` ↔ `winding_L` (3 de 4 errores) orientan líneas de trabajo sobre representaciones que discriminen severidad, no solo presencia de fallo.
- No debe usarse como relé de protección, alarma de seguridad ni decisión de mantenimiento sin validación independiente en el equipo del usuario.

## Benchmarks y rendimiento

Test sellado de 71 grabaciones (3 condiciones de operación no vistas), abierto una sola vez el 2026-11-06:

| Modelo | Macro-F1 | Accuracy | IC 95 % (bootstrap, 10k) | Peor condición | ECE (10 bins) | Brier |
|---|---|---|---|---|---|---|
| Este modelo (GPU) | 0,943 | 0,944 (67/71) | [0,885; 0,990] | 0,889 | 0,025 | 0,077 |
| Este modelo (CPU) | 0,943 | 0,944 | — | — | — | — |
| Características físicas + regresión logística (C=100) | 0,923 | 0,930 | [0,849; 0,980] | 0,889 | 0,142 | 0,125 |
| Baseline solo marca temporal | 0,986 | 0,986 | — | — | — | — |
| Baseline día de grabación | 0,127 | 0,254 | — | — | — | — |
| Clase mayoritaria | 0,003 | 0,042 | — | — | — | — |

Validación cruzada LOCO de 9 pliegues sobre TRAIN_DEV (208 grabaciones): macro-F1 medio 0,945, peor pliegue 0,884. Esta cifra estima el procedimiento de entrenamiento, no el checkpoint liberado.

Rendimiento por condición (este modelo): `speed_20Nm_2000rpm` 1,000 · `torque_20Nm_3000rpm` 0,889 · `torque_40Nm_1000rpm` 0,917.

Clases con errores (3 grabaciones de test por clase salvo `voltage_unbalance_L`, con 2):

| Clase | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|
| winding_H | 0,50 | 0,33 | 0,40 | 3 |
| winding_L | 0,50 | 0,67 | 0,57 | 3 |
| bearing_outer_H | 1,00 | 0,67 | 0,80 | 3 |
| bend | 0,75 | 1,00 | 0,86 | 3 |
| Otras 20 clases | 1,00 | 1,00 | 1,00 | 3 cada una |

Matriz de confusión: 4 errores en 71 grabaciones (`winding_H` → `winding_L` ×2, `winding_L` → `winding_H` ×1, `bearing_outer_H` → `bend` ×1).

Comparación pareada frente al baseline físico: diferencia +0,020, IC 95 % [−0,051; +0,094]. Con la regla preregistrada (≥ +5 pp y cota inferior > 0), el resultado es de no diferencia significativa.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del checkpoint no se documenta (el repositorio de Hugging Face figura con 0,0 GB) y el número de parámetros del encoder no se indica.
- GPU recomendadas: no disponible. La model card solo confirma ejecución en GPU y en CPU con resultados equivalentes.
- CPU: soportada explícitamente; acuerdo argmax del 100 % con GPU y diferencia máxima de probabilidad de 0,0014, por lo que la inferencia en CPU es una opción válida para este checkpoint.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU de consumo; no disponible.
- Opciones de despliegue: paquete `mantis-tsfm==1.1.0` más el módulo `thaki_mcsa`, con scripts `inference.py` para entrada `.npy` (`[3, n]`) o CSV con el formato MCC5-THU (sin cabecera, corrientes en columnas 6, 7 y 8). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Rendimiento en MCC5-THU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Thaki-MCSA-MantisV2-MCC5 | Encoder MantisV2 afinado | no disponible | ≥ 65.536 muestras a 12.800 Hz | Macro-F1 0,943 (test sellado) | Apache 2.0 | Hugging Face |
| Características físicas + regresión logística | Baseline clásico | no aplica | Características espectrales derivadas | Macro-F1 0,923 | no disponible | Referencia en la model card, no se distribuye |
| Baseline solo marca temporal | Baseline de metadatos | no aplica | Marca de tiempo de la grabación | Macro-F1 0,986 | no disponible | Referencia en la model card, no se distribuye |
| `paris-noah/MantisV2` | Encoder base | no disponible | Serie temporal | No evaluado en MCC5 (modelo base sin fine-tuning de la tarea) | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos sobre otros clasificadores de fallo de motor comparables publicados sobre MCC5-THU en la información proporcionada.

## Limitaciones y advertencias

- Todos los datos provienen de un único banco de ensayos de 2,2 kW. Nada en la model card demuestra que el modelo funcione en otro motor físico, otra instalación o una planta real; una puntuación alta en este banco no implica generalización.
- Confusión grave entre etiqueta y tiempo de grabación: un baseline que usa solo la marca temporal alcanza 0,986 de macro-F1 en test, por encima del modelo. Las puntuaciones no deben interpretarse como prueba de que el modelo ha aprendido la física del fallo.
- Diferencia no significativa frente al baseline de características físicas (IC pareado [−0,051; +0,094]); no se puede afirmar superioridad sobre características espectrales hechas a mano en este banco.
- Punto débil identificado en la discriminación de severidad de fallo de devanado (`winding_H` frente a `winding_L`), con 3 de los 4 errores de test.
- Conjunto de test muy pequeño: 3 grabaciones por clase (2 en `voltage_unbalance_L`), de modo que un solo error desplaza el recall en 0,33 y los intervalos por clase son muy amplios.
- Entrada rígida: se exige exactamente 12.800 Hz; la re-muestrear no está validada y el cargador rechaza otras frecuencias. Mínimo 65.536 muestras.
- No debe usarse como relé de protección, alarma de seguridad ni base de decisiones de mantenimiento sin validación independiente en el equipo del usuario.
- Sesgos conocidos más allá del confundido temporal: no disponibles.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de falsos negativos y de confianza mal situada en condiciones de operación fuera de la distribución de MCC5.
- Licencia Apache 2.0: permite uso comercial, pero la propia model card restringe explícitamente el uso como producto de diagnosis validado en campo; el estado es *research preview*.
- El paquete de inferencia conserva docstrings y mensajes de error en coreano, mantenidos byte a byte idénticos a los hasheados antes del test sellado; esto puede dificultar el mantenimiento por terceros.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-MCSA-MantisV2-MCC5
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-MCSA-MantisV2-MCC5/blob/main/MODEL_CARD.ko.md
- Métricas del test sellado: https://huggingface.co/ThakiCloud/Thaki-MCSA-MantisV2-MCC5/blob/main/eval/test71_metrics.json
- Modelo base: https://huggingface.co/paris-noah/MantisV2
- Paper referenciado (arXiv:2602.17868): https://arxiv.org/abs/2602.17868
- Dataset MCC5-THU: no disponible enlace directo en la información proporcionada

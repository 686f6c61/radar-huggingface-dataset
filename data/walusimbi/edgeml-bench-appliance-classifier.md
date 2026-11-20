# Walusimbi/edgeml-bench-appliance-classifier

## Resumen

El modelo `Walusimbi/edgeml-bench-appliance-classifier` es un clasificador tabular de tipo random forest empaquetado en formato NumPy (`model.npz`) que identifica un electrodoméstico de corriente continua (motor, bomba de agua o televisor) a partir del primer segundo de su corriente de arranque. Lo desarrolla Walusimbi en el contexto de un controlador predictivo de admisión de carga para pequeños sistemas solares con batería, construido en la Universidad de Soroti (Uganda). No es un modelo de lenguaje: es una pieza de un sistema embebido de gestión energética que decide si un nuevo aparato puede conectarse (ALLOW), debe esperar (DELAY) o debe rechazarse (REJECT) según el estado de la batería.

El modelo resuelve un problema concreto de monitorización no intrusiva de carga (NILM, por sus siglas en inglés) en el borde: un enchufe inteligente deja funcionar un aparato durante un segundo como prueba, se registra la corriente y la tensión de bus a 2000 Hz, se restan las corrientes ya presentes y se extraen diez características numéricas (corriente estacionaria, pico de la media de 10 ms, ratio de inrush, tiempo de asentamiento, rizado relativo y absoluto, frecuencia de rizado, potencia estacionaria, caída de tensión y sobrecorriente respecto a la estacionaria). Con esas diez variables, el clasificador devuelve una probabilidad para cada una de las tres clases.

Es relevante ahora como referencia reproducible y ligera de edge ML aplicado a energía solar doméstica: el paquete solo depende de NumPy, pesa 0,0 GB, se ejecuta en unos 19 ms por grabación en un portátil y sirve como implementación de referencia del paso de reconocimiento de aparatos descrito en el artículo asociado. Su valor no está en el rendimiento bruto (el propio autor advierte que el problema es fácil), sino en la trazabilidad del método, la calibración y el formato seguro de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 5 random forests (120 árboles cada uno) con calibración sigmoide (Platt) por clase, promediados |
| Parametros totales | no disponible (no es una red neuronal; el modelo se guarda como arrays NumPy) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 10 características extraídas de 1 s de señal a 2000 Hz) |
| Tipos de cuantizacion | no disponible (los arrays se almacenan en el tipo nativo de `model.npz`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `model.npz` (arrays NumPy, lectura con `allow_pickle=False`) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo neuronal: es un ensemble de cinco random forests de 120 árboles cada uno, con tamaño mínimo de hoja 2 y semilla 0, cada uno envuelto en una calibración sigmoide de Platt mediante `CalibratedClassifierCV` con validación cruzada de 5 pliegues, y promediados. La entrada son diez características derivadas de una ventana de un segundo de corriente y tensión muestreadas a 2000 Hz, tras un filtro de mediana de 5 muestras que elimina picos de un solo sample del ADC. La inferencia se implementa en `predict.py` replicando la aritmética de scikit-learn con NumPy puro; se verificó contra el modelo de scikit-learn con la misma clase en los 104 eventos de entrenamiento y en 3000 vectores aleatorios (incluidos fuera del rango de entrenamiento), con una diferencia máxima de probabilidad de 2e-16.

Los datos de entrenamiento son 104 grabaciones de un segundo de encendido (30 de motor, 44 de televisor y 30 de bomba), registradas el 2026-11-20 en un único banco de pruebas con una batería de plomo-ácido de 12 V y 10 Ah, un sensor de corriente ACS712-05B (185 mV/A) leído por el ADC de 12 bits de un ESP32 y relés conmutando cada aparato. La tensión de 12 V se varió ligeramente conectando y desconectando una bombilla. El conjunto completo (140 grabaciones, incluyendo un piloto con bomba y motor juntos y 5 eventos excluidos) está en Zenodo. El reentrenamiento se hace con `train.py` a partir de esas grabaciones y, con scikit-learn 1.5.0, reproduce un archivo idéntico al distribuido. No hay RLHF ni DPO: es aprendizaje supervisado clásico.

## Capacidades

- Clasificación de aparatos de CC en tres clases: `dc_motor`, `dc_tv` y `water_pump`, a partir del primer segundo de corriente de arranque.
- Extracción de características de la señal de encendido: corriente estacionaria, pico de la media de 10 ms, ratio de inrush, tiempo de asentamiento, rizado relativo y absoluto, frecuencia de rizado, potencia estacionaria, caída de tensión de bus y sobrecorriente.
- Salida de probabilidad calibrada por clase, con umbral de confianza de 0,6 por debajo del cual el sistema etiqueta como "aparato desconocido".
- Resta previa de la corriente de los aparatos ya en funcionamiento, lo que permite aislar la firma del nuevo aparato.
- Inferencia en Python con solo NumPy, sin dependencias de scikit-learn en tiempo de ejecución.
- Carga segura de pesos sin ejecución de código (`allow_pickle=False`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; no es un modelo generativo.

## Casos de uso

- Admisión predictiva de carga en sistemas solares domésticos: un enchufe inteligente deja funcionar un aparato un segundo, el modelo lo identifica y el controlador decide ALLOW, DELAY o REJECT según el estado de la batería; encaja por su latencia baja y su dependencia mínima.
- Investigación y docencia en NILM: sirve como implementación de referencia reproducible del paso de reconocimiento de aparatos, con datos y código de entrenamiento publicados en Zenodo.
- Prototipado de edge ML con sensores de bajo coste: el paquete demuestra un pipeline completo (adquisición, filtrado, extracción de características, calibración y clasificación) ejecutable con NumPy en un portátil.
- Validación de sensores y cadenas de adquisición: las pruebas de robustez frente a nivel de tensión y orden temporal de los eventos permiten evaluar la estabilidad del clasificador ante variaciones controladas del banco.
- Benchmark de calibración de clasificadores: el modelo documenta explícitamente su error de calibración esperado (0,15 calibrado frente a 0,02 sin calibrar), útil para comparar estrategias de calibración en problemas con separación perfecta de clases.
- Base para transferencia a nuevos aparatos o instalaciones: el script `train.py` y el conjunto de datos de Zenodo permiten reentrenar con nuevas grabaciones cuando se cambia de sensor, cableado o tensión de suministro.
- Educación en gestión energética de microrredes: el modelo ilustra el bucle completo de decisión de carga en una batería de 12 V y 10 Ah con relés y un ESP32.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Validación cruzada de 5 pliegues | accuracy 1.000, macro-F1 1.000 |
| Entrenar con nivel de suministro bajo y probar con el alto | accuracy 1.000 |
| Entrenar con nivel de suministro alto y probar con el bajo | accuracy 1.000 |
| Entrenar con eventos tempranos y probar con los tardíos | accuracy 1.000 |
| Entrenar con eventos tardíos y probar con los tempranos | accuracy 1.000 |
| Precisión y recall por clase en validación cruzada | 1.000 en las tres clases |
| Error de calibración esperado (ECE) calibrado | 0,15 |
| Error de calibración esperado (ECE) sin calibrar | 0,02 |
| Velocidad de inferencia | ~19 ms por grabación en portátil (features + 5 forests, solo NumPy) |

El autor advierte que el problema es fácil: los tres aparatos difieren mucho en su corriente de arranque, por lo que una puntuación perfecta dice poco sobre aparatos similares, otros sensores u otros hogares.

## Requisitos de hardware

- VRAM: no aplica; el modelo no usa GPU. Se ejecuta en CPU con NumPy.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier equipo consumer: portátil convencional, Raspberry Pi o similar; el autor indica que ejecutarlo en el ESP32 es trabajo futuro y no hay medición en microcontrolador.
- Opciones de despliegue: Python con NumPy (`predict.py`), integrable en el firmware del controlador de admisión de carga; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~19 ms por grabación en portátil; no se ha medido throughput en lote ni latencia en el ESP32.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros clasificadores de aparatos comparables con parámetros, contexto y licencia verificables, y no se han publicado comparaciones con alternativas en la documentación del modelo.

## Limitaciones y advertencias

- Un solo banco de pruebas, un solo día y una sola cadena de sensores (ACS712-05B, 185 mV/A, ADC de 12 bits de un ESP32); otros sensores, frecuencias de muestreo, cableado o tensiones de suministro requieren nuevas grabaciones y un nuevo modelo.
- Solo tres clases de aparatos, todas de corriente continua y en condiciones muy controladas; no generaliza a otros aparatos ni a corriente alterna.
- El televisor se registró en standby (sin pulsar su botón de encendido), lo que limita la validez de esa clase para un televisor en funcionamiento.
- El problema es intrínsecamente fácil: la accuracy perfecta no es indicativa del rendimiento en escenarios reales con aparatos similares.
- La confianza del modelo calibrado es deliberadamente modesta (0,80 a 0,89 incluso cuando la clase es cierta) y su ECE es peor que el del modelo sin calibrar (0,15 frente a 0,02); debe interpretarse como un orden, no como una probabilidad de acierto.
- Riesgo de alucinación no aplica (no es generativo), pero sí de clasificación errónea fuera de distribución; el sistema trata confianzas por debajo de 0,6 como "aparato desconocido".
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos exactos antes de integrarlo en un producto.
- Es un prototipo de investigación; no hay validación en campo, ni en el ESP32, ni con múltiples hogares.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción externa.

## Enlaces

- Hugging Face: https://huggingface.co/Walusimbi/edgeml-bench-appliance-classifier
- Conjunto de datos en Zenodo: https://doi.org/10.5281/zenodo.24401724

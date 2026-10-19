# Zainulabedin1/fault-injection-diagnosis

## Resumen

`Zainulabedin1/fault-injection-diagnosis` es una red neuronal convolucional unidimensional de muy pequeño tamaño ("tiny 1-D CNN") publicada en HuggingFace por el usuario Zainulabedin1. Su tarea es el diagnóstico de fallos en rodamientos de rodillos (rolling-element bearings) a partir de ventanas de vibración en bruto de 2048 muestras tomadas a 48 kHz, clasificando la señal en 10 clases: estado normal más fallos en pista externa (BPFO), pista interna (BPFI) y elemento rodante (BSF), cada uno en severidad baja, media y alta.

El aspecto crítico del modelo es que se entrenó **exclusivamente con señales sintéticas** generadas a partir de las fórmulas estándar de frecuencias características de rodamiento (Randall y Antoni, 2011; Harris y Kotzalas), con armónicos de fallo decrecientes, armónicos de eje, modulación de amplitud en la zona de carga a la frecuencia de giro fr y ruido gaussiano con SNR entre 5 y 30 dB. El rodamiento de referencia es el 6205-2RS JEM SKF (n=9, d=7,94 mm, D=39,04 mm, φ=0). El autor advierte explícitamente de que las señales son idealizadas (sin resonancias estructurales, sin deslizamiento, sin fluctuación de velocidad ni efectos de camino de transmisión) y de que el modelo **no se ha validado con datos reales de maquinaria**.

Se trata de un proyecto de portafolio para solicitudes de posgrado en fabricación inteligente y gestión de salud de activos (PHM), sin dataset externo, con 8 descargas y 2 likes en el momento de la consulta. Su relevancia práctica es, por tanto, la de una pieza de referencia didáctica y de prototipado de pipelines, no la de un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN 1-D ("tinycnn") sobre ventanas de vibración; 10 clases de salida |
| Parámetros totales | no disponible (el autor lo describe como "tiny"; el repositorio ocupa 0,0 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana fija de 2048 muestras |
| Tipos de cuantización | no disponible; pesos distribuidos en punto flotante PyTorch |
| Idiomas soportados | no aplica (modelo de señales, no de texto) |
| Licencia | no disponible (no especificada en la model card ni en los metadatos) |
| Formato de pesos | `pytorch_model.bin` (PyTorch, cargado mediante `model.py`) |
| Tarea | Clasificación multiclase de fallos de rodamiento (10 clases) |
| Entrada | Señal de vibración en bruto, idealmente 48 kHz; ventana de 2048 muestras |
| Salida | Identificador de clase, vector de probabilidades y número de ventanas procesadas |
| Frecuencia de muestreo asumida | 48 kHz (otros valores requieren remuestreo) |
| Rodamiento de referencia | 6205-2RS JEM SKF (n=9, d=7,94 mm, D=39,04 mm, ángulo de contacto 0) |
| Librería | PyTorch |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 8 / 2 |

## Arquitectura y entrenamiento

La arquitectura es una CNN 1-D de tamaño reducido que consume directamente la forma de onda de vibración, sin etapa explícita de extracción de características en el dominio de la frecuencia (no se documenta el uso de envolvente, FFT ni transformada de wavelet como entrada). El autor no detalla el número de capas, canales, kernels ni el número exacto de parámetros. La API de inferencia (`predict_signal`) divide la señal de entrada en ventanas y devuelve la clase predicha junto con las probabilidades y el recuento de ventanas procesadas, lo que sugiere un esquema de agregación por ventanas a nivel de señal completa.

El entrenamiento se realizó únicamente con datos sintéticos construidos sobre física de rodamientos: BPFO = (n/2)·fr·(1 − (d/D)·cos φ), BPFI = (n/2)·fr·(1 + (d/D)·cos φ) y BSF = (D/(2d))·fr·(1 − ((d/D)·cos φ)²), más armónicos de fallo con decaimiento, armónicos de eje, modulación de amplitud a fr en la zona de carga y ruido gaussiano (SNR 5–30 dB). El generador se validó comprobando que los picos del espectro de envolvente caen a menos de 2 Hz de los marcadores teóricos: BPFO 108,00 Hz teórico frente a 107,54 Hz generado, BPFI 162,00 frente a 162,46 Hz, y 2×BSF 141,00 frente a 141,40 Hz. No se documenta el número de tokens, el volumen de señales sintéticas, ni el uso de RLHF/DPO (no aplicables en este dominio). Tampoco se especifica si hubo aumento de datos, validación cruzada o búsqueda de hiperparámetros.

## Capacidades

- Clasificación de ventanas de vibración de 2048 muestras a 48 kHz en 10 clases: normal, BPFO, BPFI y BSF en severidad baja, media y alta.
- Inferencia sobre señal completa mediante segmentación en ventanas, devolviendo clase, probabilidades y número de ventanas.
- Discriminación de severidad de fallo, aunque las etiquetas de severidad corresponden a escalas de amplitud del modelo sintético, no a tamaños físicos de defecto.
- Ejecución en CPU (`device="cpu"` en el ejemplo de uso), sin requisitos de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo "thinking" ni decodificación especulativa.

## Casos de uso

- Docencia y divulgación en diagnóstico de rodamientos: sirve para mostrar de forma reproducible cómo se relacionan las frecuencias características BPFO/BPFI/BSF con la firma espectral de un fallo, usando el modelo como ejemplo ejecutable en CPU.
- Prototipado de pipelines PHM de extremo a extremo: permite montar y depurar la cadena adquisición → ventaneado → inferencia → agregación de probabilidades sin depender de un dataset real, antes de sustituir el clasificador por uno entrenado con datos de planta.
- Prueba de integración y CI/CD: al ser un modelo PyTorch de tamaño mínimo, se puede usar como caso de prueba en pipelines de empaquetado, versionado y despliegue de modelos (exportación a TorchScript/ONNX, contenedores, tests de regresión de la API de inferencia).
- Generación de señales sintéticas de referencia: las fórmulas y el generador descritos permiten producir señales con fallos de severidad controlada para validar preprocesados (filtrado, demodulación de envolvente, remuestreo) antes de aplicarlos a señales reales.
- Comparación de clasificadores en un benchmark controlado: al tener una tasa de acierto conocida sobre test sintético y un escenario de velocidad de eje no vista, sirve como línea base mínima frente a métodos clásicos de análisis de envolvente o modelos más grandes en experimentos académicos.
- Demostración de análisis de robustez ante condiciones no vistas: el fuerte descenso de precisión con velocidades de eje fuera del rango de entrenamiento (50,9 %) lo convierte en un caso de estudio útil sobre generalización y dominio de validez en sistemas de diagnosis.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre su conjunto de test sintético:

| Métrica | Valor |
|---|---|
| Exactitud en test (10 clases) | 97,1 % |
| F1 macro | 97,1 % |
| Velocidad de eje no vista (entrenamiento < 35 Hz, test 35–45 Hz) | 50,9 % |

Comprobación de coherencia física (picos del espectro de envolvente frente a teoría):

| Componente | Teórico (Hz) | Generado (Hz) | Desviación |
|---|---|---|---|
| BPFO | 108,00 | 107,54 | 0,46 Hz |
| BPFI | 162,00 | 162,46 | 0,46 Hz |
| 2×BSF | 141,00 | 141,40 | 0,40 Hz |

No se han publicado comparaciones con otros modelos ni resultados sobre datasets públicos (CWRU, Paderborn, JNU, XJTU-SY) en la información disponible. No se han publicado resultados de benchmarks en la información disponible más allá de los indicados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El repositorio ocupa 0,0 GB y el modelo se describe como "tiny"; el binario de pesos es del orden de kilobytes o pocos megabytes (cifra exacta no disponible).
- GPU recomendadas: cualquiera; no se requiere GPU. El ejemplo oficial funciona con `device="cpu"`.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y también en CPU, Raspberry Pi o entornos sin acelerador.
- Opciones de despliegue: PyTorch nativo mediante `model.py` y `pytorch_model.bin`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no aplicables). La exportación a TorchScript u ONNX es factible pero no está documentada ni empaquetada.
- Latencia y throughput: no disponibles. Por el tamaño del modelo y la ventana de 2048 muestras, se espera latencia de milisegundos en CPU para una ventana, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la información proporcionada. Como referencia cualitativa de alternativas en el mismo espacio de problema:

| Alternativa | Tipo | Ventana de entrada | Entrenamiento | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Este modelo (`fault-injection-diagnosis`) | CNN 1-D "tiny" | 2048 muestras @ 48 kHz | Solo sintético | no disponible | 97,1 % en test sintético; 50,9 % con velocidad no vista |
| Análisis de envolvente + umbrales expertos | Procesado de señal clásico | Configurable | No requiere entrenamiento | no aplica | no disponible |
| CNN 1-D entrenada con CWRU u otro dataset público | CNN 1-D | Típicamente 1024–4096 muestras @ 12–48 kHz | Datos reales de banco de ensayos | depende del autor | no disponible en esta información |
| Modelos preentrenados de series temporales (familia tipo foundation model) | Transformer | Ventanas largas | Preentrenamiento masivo + ajuste | varía | no disponible en esta información |

La diferencia principal del modelo reseñado frente a las alternativas es su dominio de validez: solo sintético, sin validación en maquinaria real, mientras que las alternativas basadas en CWRU o en datos de planta se evalúan sobre señales medidas.

## Limitaciones y advertencias

- **Entrenamiento solo sintético**: el autor indica explícitamente "not validated on real-world data — do not deploy on real machinery". Las señales reales incluyen resonancias estructurales, deslizamiento, fluctuación de velocidad y efectos de camino de transmisión que el generador no modela.
- **Generalización limitada en velocidad**: la exactitud cae del 97,1 % al 50,9 % al evaluar con velocidades de eje de 35–45 Hz cuando el entrenamiento usó menos de 35 Hz. Cualquier cambio de régimen en producción puede degradar gravemente el resultado.
- **Frecuencia de muestreo fija**: la ventana es de 2048 muestras asumiendo 48 kHz; otras frecuencias exigen remuestreo, lo que altera la posición de los marcadores espectrales si no se recalcula.
- **Etiquetas de severidad no físicas**: las clases bajo/medio/alto corresponden a escalas de amplitud del modelo sintético, no a tamaños de defecto medibles (por ejemplo, milímetros de pitting).
- **Licencia no especificada**: sin licencia declarada, el uso comercial y la redistribución son jurídicamente inciertos; conviene contactar con el autor antes de cualquier uso fuera del ámbito académico.
- **Riesgo de falsos negativos silenciosos**: al ser una CNN sobre forma de onda sin etapa física explícita, no ofrece interpretabilidad ni garantías ante regímenes no cubiertos; no debe usarse como único sistema de seguridad en mantenimiento predictivo.
- **Madurez y mantenimiento**: proyecto de portafolio, un solo autor, 8 descargas, sin pipeline declarado, sin idiomas declarados y sin dataset externo; no hay evidencia de mantenimiento, versionado semántico ni tests.
- **Alcance acotado**: 10 clases sobre un único rodamiento de referencia (6205-2RS JEM SKF); no cubre otros rodamientos, otros tipos de fallo (jaula, grietas, desalineación) ni diagnosis multi-componente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zainulabedin1/fault-injection-diagnosis
- Referencia citada por el autor (sin URL en la model card): Randall, R. B. y Antoni, J., "Rolling Element Bearing Diagnostics — A Tutorial", *Mechanical Systems and Signal Processing*, 25(2), 2011.
- Referencia citada por el autor (sin URL en la model card): Harris, T. A. y Kotzalas, M. N., *Rolling Bearing Analysis*.
- La búsqueda web realizada no devolvió resultados pertinentes al modelo (solo contenido no relacionado); no se dispone de paper, blog, repositorio adicional ni demo.

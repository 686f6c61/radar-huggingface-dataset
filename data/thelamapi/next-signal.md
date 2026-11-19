# thelamapi/Next-Signal

## Resumen

Next Signal es un modelo de representación auto-supervisada para series temporales de sensores inerciales de teléfonos inteligentes, desarrollado por el usuario thelamapi. Aprende embeddings de ventanas de 9 canales × 128 muestras sin utilizar etiquetas, mediante aprendizaje contrastivo al estilo SimCLR, y evalúa su calidad con una sonda lineal congelada sobre la tarea de reconocimiento de actividad humana (UCI HAR). No es un modelo generativo de lenguaje, sino un codificador de características de 64 dimensiones pensado para clasificación downstream con pocas etiquetas.

El modelo es relevante por su enfoque de eficiencia en el etiquetado: con solo 2 etiquetas por clase alcanza una precisión media de 0,684 ± 0,039 frente a 0,650 de un codificador aleatorio y 0,652 de 54 estadísticas de señal, y la ventaja se mantiene con 10 y 50 etiquetas por clase. La arquitectura es una CNN 1D compacta de tres bloques convolucionales, lo que permite ejecutar la inferencia directamente en el navegador mediante el runtime `nlrt.js` con paridad numérica respecto a PyTorch.

La licencia es CC BY 4.0 y el repositorio no contiene pesos en formato GGUF ni safetensors de gran tamaño; el encoder se distribuye en `encoder.safetensors`. El modelo está entrenado exclusivamente sobre UCI HAR (sensor de cintura de un Samsung Galaxy S II), por lo que su generalización a otros dispositivos y colocaciones requiere revalidación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN 1D (3 bloques Conv1d + BatchNorm + ReLU + global average pool) con cabeza de proyección 64→64→32 para preentrenamiento |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventanas de entrada de 9 canales × 128 muestras |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`encoder.safetensors`); inferencia en navegador vía `nlrt.js` |

## Arquitectura y entrenamiento

El encoder es una red convolucional 1D con tres bloques de 32, 64 y 64 canales, kernel de tamaño 7, BatchNorm y ReLU, seguida de un global average pooling que produce un vector de 64 dimensiones. Durante el preentrenamiento se añade una cabeza de proyección 64→64→32 que se descarta en la fase de evaluación. El preentrenamiento usa la pérdida NT-Xent con temperatura τ = 0,2, batch de 256, optimizador Adam con tasa de aprendizaje 1e-3 y 80 épocas sobre 5.967 ventanas sin etiquetar.

Las aumentaciones aplicadas son escalado por canal, recorte y redimensionado (80–128 muestras), desplazamiento circular y jitter. La partición de datos es por persona: 17 sujetos para preentrenamiento y pool de etiquetas, 4 sujetos de validación para elegir la regularización de la sonda y 9 sujetos de test oficiales (2.947 ventanas). La sonda es una regresión logística multinomial estandarizada, con parámetro C seleccionado por representación: 10,0 para la representación auto-supervisada, 1,0 para el encoder aleatorio y 10,0 para las estadísticas de señal.

## Capacidades

- Extracción de embeddings de 64 dimensiones a partir de ventanas de señales inerciales de 9 canales × 128 muestras (acelerómetro y giroscopio).
- Clasificación de actividad humana mediante sonda lineal congelada sobre las representaciones aprendidas.
- Aprendizaje auto-supervisado contrastivo que no requiere etiquetas durante el preentrenamiento.
- Inferencia en navegador mediante `nlrt.js`, con paridad numérica respecto a PyTorch (diferencia absoluta máxima de 6,1 × 10⁻¹⁶).
- Robustez evaluada frente a ruido, escalado y desplazamiento de la señal en la demo pública.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Reconocimiento de actividad con presupuesto de etiquetas muy reducido: con 2 etiquetas por clase se obtiene 0,684 de precisión, útil en escenarios donde anotar datos de sensores es costoso y se dispone de muchos registros sin etiquetar.
- Clasificación en el dispositivo o en navegador: el encoder es lo bastante pequeño para ejecutarse en JavaScript vía `nlrt.js`, lo que permite prototipos de monitorización de actividad sin backend de inferencia.
- Preentrenamiento y adaptación a nuevos dominios de sensores: el pipeline contrastivo puede reutilizarse sobre otros conjuntos de series temporales inerciales, revalidando la sonda sobre la nueva colocación del sensor.
- Detección de cambios de actividad en estudios de movilidad: las representaciones de 64 dimensiones sirven como entrada a clasificadores ligeros en pipelines de análisis de datos de wearables.
- Evaluación comparativa de métodos de representación: el repositorio incluye la comparación con encoder aleatorio y 54 estadísticas de señal bajo el mismo presupuesto de etiquetas, útil como referencia metodológica.
- Docencia y reproducción de aprendizaje auto-supervisado: la arquitectura compacta y el notebook con la arquitectura facilitan la reproducción del experimento en una sola GPU (entrenado en NVIDIA L4).
- Análisis de confusión entre clases posturales: el modelo y los ejemplos de fallo en `evaluation.json` permiten estudiar la confusión entre sentado y de pie en datos HAR.

## Benchmarks y rendimiento

Resultados sobre 9 sujetos de test no vistos (2.947 ventanas). Precisión (media ± desviación estándar sobre 5 sorteos de etiquetas):

| Representación | 2 etiquetas/clase | 10 etiquetas/clase | 50 etiquetas/clase | 5.967 etiquetas |
|---|---:|---:|---:|---:|
| Encoder auto-supervisado (Next Signal) | 0,684 ± 0,039 | 0,850 ± 0,029 | 0,901 ± 0,010 | 0,912 |
| Encoder aleatorio | 0,650 ± 0,036 | 0,779 ± 0,013 | 0,856 ± 0,013 | 0,892 |
| Estadísticas de señal (54 características) | 0,652 ± 0,034 | 0,806 ± 0,027 | 0,862 ± 0,007 | 0,893 |

Macro-F1:

| Representación | 2/clase | 10/clase | 50/clase |
|---|---:|---:|---:|
| Encoder auto-supervisado (Next Signal) | 0,688 | 0,852 | 0,903 |
| Encoder aleatorio | 0,646 | 0,776 | 0,855 |
| Estadísticas de señal (54 características) | 0,632 | 0,802 | 0,859 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el encoder es una CNN 1D de tres bloques y el repositorio ocupa 0,0 GB. No se dispone de cifra exacta de VRAM.
- GPU recomendadas: cualquier GPU moderna; el modelo se entrenó en una NVIDIA L4. Para inferencia basta CPU o incluso el navegador.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño reducido del encoder.
- Opciones de despliegue: PyTorch (script `inference.py` con `load()` y `classify()`), runtime JavaScript `nlrt.js` en navegador, y el Space de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Next Signal | CNN 1D auto-supervisada para HAR | no disponible | 9 × 128 muestras | 0,912 acc con todas las etiquetas | CC BY 4.0 |
| Encoder aleatorio (baseline del propio repo) | CNN 1D sin preentrenamiento | no disponible | 9 × 128 muestras | 0,892 acc con todas las etiquetas | — |
| Estadísticas de señal (54 características) | Baseline clásico | no aplica | 9 × 128 muestras | 0,893 acc con todas las etiquetas | — |

No se dispone de comparación con otros modelos públicos de representación para HAR en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con un único conjunto de datos y un único tipo de dispositivo (Samsung Galaxy S II montado en la cintura); otras colocaciones y sensores requieren revalidación.
- Una sola ejecución de preentrenamiento; las semillas de la sonda solo varían las muestras etiquetadas, no el encoder.
- La confusión principal es entre sentado y de pie; los ejemplos de fallo están en `evaluation.json`.
- No es un dispositivo médico; no debe usarse para diagnóstico o monitorización clínica.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero no se detallan restricciones adicionales.
- No es un modelo de lenguaje ni generativo: no admite prompts, tool calling ni razonamiento multi-paso.
- El repositorio no incluye pesos en GGUF ni cuantizaciones; solo `encoder.safetensors` y el runtime JS.

## Enlaces

- Hugging Face: https://huggingface.co/thelamapi/Next-Signal
- Space de demostración: https://huggingface.co/spaces/thelamapi/Next-Signal
- Dataset UCI HAR (Anguita et al.): no disponible como enlace directo en la información proporcionada; referencia bibliográfica citada en la model card.

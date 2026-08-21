# tmmycruise/forecasting-v3-checkpoints

## Resumen

El repositorio `tmmycruise/forecasting-v3-checkpoints` conserva los tres checkpoints finales de PyTorch del estudio de desarrollo `forecasting-v3`, centrado en la predicción de series temporales financieras de alta frecuencia para los valores AAPL, ABBV y MCD. El modelo es un único sistema compartido que procesa 128 tokens de cierre de un minuto y genera predicciones de distribución de retornos para horizontes de 2 a 32 minutos, utilizando consultas de horizonte continuas con RoPE de base 16. Con solo 27.477 parámetros entrenables, el modelo está diseñado para ser extremadamente ligero y eficiente, lo que lo hace relevante para experimentación en forecasting financiero de baja latencia.

El autor, `tmmycruise`, ha estructurado el repositorio como un artefacto de investigación reproducible: incluye los pesos, la calibración, los manifiestos de ejecución y el código fuente del runner congelado. El estudio sigue un protocolo estricto de partición temporal (entrenamiento, selección, refit, desarrollo y reserva sellada), lo que permite evaluar la generalización del modelo. Aunque no se proporciona licencia ni idiomas, el modelo es un ejemplo de regresión distribucional aplicada a datos de mercado, con una arquitectura compacta y un enfoque metodológico riguroso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokens de cierre de 1 minuto, consultas de horizonte continuas con RoPE base 16, y una vía auxiliar causal de 15 características de historial largo |
| Parametros totales | 27.477 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens de cierre de un minuto (equivalente a 128 minutos de historial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), con archivos adicionales `.npz` y `.json` |

## Arquitectura y entrenamiento

El modelo es un transformer compacto que procesa 128 tokens de cierre de un minuto. Utiliza consultas de horizonte continuas con RoPE (rotary position embeddings) de base 16, lo que permite consultar cualquier horizonte entero entre 2 y 32 minutos, aunque el entrenamiento supervisado se realizó únicamente en los horizontes 2, 4, 8, 16 y 32. La salida es una distribución de retornos compartida de 21 clases, junto con una vía auxiliar causal de 15 características de historial largo. El total de parámetros entrenables es de 27.477, lo que indica una arquitectura muy ligera, probablemente con pocas capas y dimensiones reducidas.

El entrenamiento se realizó en tres semillas, cada una inicializada desde un checkpoint temprano con semilla bloqueada. El conjunto de entrenamiento fue `[2016-08-08, 2021-08-08)`, la selección de épocas se hizo en `[2021-08-08, 2022-08-08)`, y posteriormente se reajustó (refit) en `[2016-08-08, 2022-08-08)`. Las épocas de refit seleccionadas fueron 7, 1 y 4 para las semillas 0, 1 y 2 respectivamente. El intervalo de desarrollo de estrategia fue `[2022-08-08, 2023-08-08)`, y la reserva sellada `[2023-08-08, 2026-08-08)` no fue leída ni puntuada. No se menciona el uso de RLHF, DPO ni otros métodos de alineación; el entrenamiento es supervisado con pérdida de verosimilitud negativa (NLL).

## Capacidades

- Predicción de distribución de retornos para series temporales financieras de alta frecuencia (AAPL, ABBV, MCD).
- Soporte de consultas densas: puede generar predicciones para cualquier horizonte entero entre 2 y 32 minutos, aunque el entrenamiento supervisado solo cubrió 5 horizontes específicos.
- Regresión distribucional: salida de 21 clases de retorno, lo que permite estimar la incertidumbre de la predicción.
- Vía auxiliar causal de 15 características de historial largo, que complementa los 128 tokens de cierre.
- Arquitectura extremadamente ligera (27.477 parámetros), adecuada para entornos con recursos limitados o inferencia de baja latencia.
- Reproducibilidad: incluye manifiestos de ejecución, código fuente y protocolo de estudio, lo que facilita la verificación de resultados.

## Casos de uso

- Investigación en forecasting financiero de alta frecuencia: el modelo sirve como punto de partida para estudiar la predicción de retornos a corto plazo en acciones individuales, con una arquitectura compacta y un protocolo de validación claro.
- Backtesting de estrategias de trading intradía: los checkpoints pueden integrarse en pipelines de backtesting para evaluar señales basadas en la distribución de retornos predicha para horizontes de 2 a 32 minutos.
- Comparación de metodologías de regresión distribucional: al ser un modelo pequeño y bien documentado, es útil para comparar enfoques de pérdida NLL, calibración y ensamblado de probabilidades frente a otras arquitecturas.
- Educación y experimentación en series temporales: su tamaño reducido permite ejecutarlo en CPU y analizar el comportamiento de RoPE y consultas de horizonte continuas en un contexto financiero.
- Desarrollo de sistemas de gestión de riesgo: la salida de 21 clases de retorno puede utilizarse para estimar la probabilidad de movimientos extremos en horizontes cortos, aunque con las limitaciones propias de un modelo de investigación.
- Reproducción de estudios académicos: el repositorio incluye el código fuente y los manifiestos, lo que permite replicar el entrenamiento y validar los resultados publicados.

## Benchmarks y rendimiento

La única métrica de rendimiento publicada es la NLL (negative log-likelihood) en el conjunto de desarrollo denso (horizontes 2-32 minutos):

| Seed | Época seleccionada | NLL |
|---:|---:|---:|
| 0 | 7 | 2.9471515 |
| 1 | 1 | 2.9441110 |
| 2 | 4 | 2.9445206 |
| Ensamblado de probabilidades | - | 2.9435108 |

No se proporcionan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de lenguaje o razonamiento general. No se dispone de comparaciones con otros modelos de forecasting en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: al tener solo 27.477 parámetros, el modelo cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU sin problemas.
- GPU recomendadas: cualquier GPU moderna (incluso integradas) es suficiente; no se requieren GPUs de alta gama.
- Compatibilidad con consumer GPU: sí, cualquier GPU de consumo (por ejemplo, RTX 3060 o superior) puede ejecutar el modelo sin dificultad.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede cargarse con `torch.load` y ejecutarse en cualquier framework que soporte PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, que son específicos para modelos de lenguaje.
- Latencia y throughput: no se proporcionan datos, pero dado el tamaño del modelo, la inferencia debería ser de microsegundos en GPU y de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (forecasting financiero de alta frecuencia con regresión distribucional). El repositorio no menciona alternativas ni benchmarks comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El autor declara explícitamente que estos son artefactos de investigación, no asesoramiento de inversión ni un sistema de trading de producción.
- El año de desarrollo fue inspeccionado genéricamente con anterioridad, por lo que no es un holdout confirmatorio intacto; los resultados de NLL pueden estar optimistamente sesgados.
- La reserva sellada `[2023-08-08, 2026-08-08)` no fue leída ni puntuada, por lo que no hay evidencia de rendimiento fuera de la muestra en ese periodo.
- No se proporciona licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- El modelo está entrenado únicamente en tres valores (AAPL, ABBV, MCD) y en un rango temporal específico; su generalización a otros activos o periodos no está validada.
- La salida es una distribución de retornos de 21 clases, pero no se especifican los límites de esas clases ni la calibración detallada, lo que limita su uso directo en producción.
- No se mencionan sesgos conocidos, pero al ser un modelo financiero, podría reflejar las condiciones de mercado del periodo de entrenamiento (2016-2022), incluyendo regímenes de volatilidad específicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tmmycruise/forecasting-v3-checkpoints
- No se encontraron otros enlaces (papers, blogs, repositorios adicionales) en la información proporcionada.

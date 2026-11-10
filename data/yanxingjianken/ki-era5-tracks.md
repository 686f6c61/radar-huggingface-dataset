# yanxingjianken/ki-era5-tracks

## Resumen

ki-era5-tracks es un modelo neuronal de interpolación cinemática condicional (Conditional Kinematic Interpolant, KI) desarrollado por yanxingjianken para predecir trayectorias de parcelas de aire en la atmósfera a partir de reanálisis ERA5. El modelo toma como entrada el estado de una parcela (coordenadas x, y en proyección estereográfica polar y altura logarítmica z = -7 km · ln(p/1000 hPa), junto con su velocidad) y las trayectorias observadas de hasta 192 parcelas vecinas en su parche durante 48 horas con resolución de 3 horas, y devuelve la aceleración y una puntuación de velocidad escalada. Se integra hacia delante (predicción) o hacia atrás (retrodiagnóstico) hasta 24 horas, de forma determinista o como conjunto estocástico.

El modelo sigue el marco teórico descrito por Jiang, Marzouk, Bose y Pooladian en el artículo *Learning smooth dynamics via Kinematic Interpolants* (arXiv:2610.22519). Está entrenado sobre trayectorias LAGRANTO derivadas de ERA5 horario a 0,25° y 37 niveles de presión, con 2,5·10⁷ trayectorias de entrenamiento. Su relevancia radica en que aborda un problema clásico de la dinámica atmosférica —la predicción lagrangiana de parcelas— con un enfoque de aprendizaje profundo que supera en un 45 % al movimiento rectilíneo en el horizonte de 12 a 24 horas, y lo distribuye además en formato ONNX cuantizado a int8 para ejecución en navegador.

El repositorio ocupa 0,2 GB e incluye pesos en PyTorch (`context_ki_era5.pt`) y versiones ONNX int8 del codificador y el decodificador, pensadas para su uso con onnxruntime-web en la página de visualización del autor. La licencia es MIT, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kinematic Interpolant condicional (codificador-decodificador transformer; `d_model` = 512) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 48 h de trayectorias por parcela, cada 3 h; hasta 192 parcelas vecinas por parche; tokens de contexto de forma (1, 3264, 8) |
| Tipos de cuantización | int8 por canal de salida en las matrices de los productos (ONNX); pesos completos en PyTorch (EMA) |
| Idiomas soportados | no aplica (modelo científico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`context_ki_era5.pt`), ONNX int8 (`encoder.int8.onnx`, `decoder.int8.onnx`), JSON de configuración (`config.json`, `scales.json`, `ensemble.json`) |

## Arquitectura y entrenamiento

El modelo implementa un interpolante cinemático condicional: un codificador transforma el contexto de trayectorias (hasta 192 parcelas vecinas, 48 h a intervalos de 3 h, representadas como tokens de 8 dimensiones) en latentes, y un decodificador, dado un conjunto de consultas (1, Q, 8), produce la aceleración y una puntuación de velocidad escalada para la parcela objetivo. La anchura del modelo es `d_model` = 512. La integración se realiza hacia delante o hacia atrás hasta 24 h, y el modo estocástico se controla mediante un parámetro de ruido relativo (`eps_rel` = 1,5 en `ensemble.json`), calibrado para que la dispersión a 24 h coincida con el error de la media del conjunto en parches de validación.

El entrenamiento emplea trayectorias LAGRANTO calculadas sobre ERA5 horario (0,25°, 37 niveles de presión), con liberaciones cada 5 días durante 2015-2017, 20 niveles de inicio, 16 parches de 480 parcelas por nivel y ambos hemisferios (el sur espejado). En total, 2,5·10⁷ trayectorias de entrenamiento. Los pesos publicados en `context_ki_era5.pt` son los promedios móviles exponenciales (EMA) del entrenamiento, e incluyen los argumentos de entrenamiento y las escalas por eje. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de dinámica atmosférica.

## Capacidades

- Predicción determinista de trayectorias de parcelas de aire a 24 h (forecast) y retrodiagnóstico a 24 h (backcast).
- Generación de conjuntos estocásticos mediante ruido relativo calibrado (`eps_rel` = 1,5) para estimar dispersión e incertidumbre.
- Condicionamiento sobre el contexto local: incorpora las trayectorias observadas de hasta 192 parcelas vecinas en un parche.
- Representación en proyección estereográfica polar con altura logarítmica de presión, adecuada para latitudes medias y altas de ambos hemisferios.
- Ejecución en navegador mediante ONNX int8 y onnxruntime-web, con precisión de la media del conjunto a 24 h equivalente a la del modelo en precisión completa (dentro de la dispersión entre conjuntos de patadas aleatorias).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo numérico específico de dominio.

## Casos de uso

- Predicción lagrangiana de transporte atmosférico: el modelo integra la posición de una parcela de aire a 24 h hacia delante, lo que permite seguir masas de aire y estudiar su desplazamiento en episodios de bloqueo atmosférico, con un error mediano de 335 km a 24 h en 2021.
- Retrodiagnóstico de origen de masas de aire: la integración hacia atrás (error mediano de 254 km a 24 h) sirve para reconstruir la procedencia de una masa de aire observada, útil en estudios de atribución de contaminantes o de humedad.
- Estimación de incertidumbre en predicciones de trayectoria: el modo de conjunto estocástico con `eps_rel` = 1,5 genera dispersión calibrada, adecuada para cuantificar la incertidumbre en la predicción de transporte a 12-24 h.
- Visualización interactiva en web: los modelos ONNX int8 se ejecutan en el navegador con onnxruntime-web, lo que permite desplegar demostraciones de predicción de trayectorias sin backend, como en la página `blocking-plots/rwb-prediction/`.
- Investigación en dinámica atmosférica: el modelo sirve como banco de pruebas para estudiar la relación entre el contexto local de parcelas vecinas y la aceleración de una parcela, y para comparar con métodos lagrangianos tradicionales como LAGRANTO.
- Validación de reanálisis y modelos físicos: al comparar las trayectorias predichas con las observadas en años no vistos (2021), el modelo puede emplearse como referencia para detectar incoherencias en simulaciones o reanálisis.
- Docencia y divulgación: la ejecución en navegador y la licencia MIT facilitan su uso en materiales educativos sobre trayectorias lagrangianas y aprendizaje de dinámicas.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Error mediano a 24 h, forecast determinista (2021, año no visto) | 335 km |
| Error mediano a 24 h, backcast determinista (2021) | 254 km |
| Mejora frente a movimiento rectilíneo a 12-24 h | ~45 % |
| Error de la media del conjunto a 24 h (ONNX int8) | equivalente al modelo en precisión completa, dentro de la dispersión entre conjuntos de patadas aleatorias |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,2 GB, por lo que los pesos en precisión completa caben holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; para el modo ONNX int8 basta con ejecución en CPU o en navegador.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: PyTorch (pesos `context_ki_era5.pt`), ONNX Runtime y onnxruntime-web (navegador), con configuración en `config.json`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Error 24 h | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ki-era5-tracks | KI condicional, codificador-decodificador | 48 h de trayectorias, 192 parcelas vecinas | 335 km (forecast), 254 km (backcast) | MIT | Hugging Face, ONNX en navegador |
| LAGRANTO (método tradicional) | Integración lagrangiana sobre ERA5 | Depende de la resolución del reanálisis | no disponible en la información | no disponible | Software científico |
| Movimiento rectilíneo (baseline) | Cinemática constante | no aplica | ~45 % peor que ki-era5-tracks a 12-24 h | no aplica | Trivial |

No se dispone de información sobre otros modelos de aprendizaje profundo comparables para trayectorias lagrangianas en ERA5 en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de dominio: no es un modelo de lenguaje ni admite instrucciones en lenguaje natural; solo procesa estados y trayectorias numéricas en el formato definido.
- Cobertura geográfica limitada a la representación estereográfica polar y a los parches y niveles de presión usados en el entrenamiento; su comportamiento fuera de ese régimen no está documentado.
- El error mediano a 24 h es de 335 km en forecast, lo que limita su uso en aplicaciones que requieran precisión sub-kilométrica.
- Riesgo de degradación fuera de la distribución: aunque se evaluó en 2021 (año no visto), no se documenta su rendimiento en otros reanálisis, resoluciones o escenarios climáticos distintos.
- El modo estocástico depende de un parámetro calibrado (`eps_rel` = 1,5) sobre parches de validación concretos; su calibración podría no transferirse a otros regímenes.
- No se documentan sesgos ni limitaciones hemisféricas más allá del espejado del hemisferio sur durante el entrenamiento.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero no se ofrece garantía alguna sobre el modelo.
- La cuantización int8 se validó solo en términos de error de la media del conjunto; no se documentan efectos sobre otras métricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yanxingjianken/ki-era5-tracks
- Repositorio de código: https://github.com/yanxingjianken/ki-lagrangian-tracks (carpeta 03_era5)
- Artículo de referencia: Jiang, Marzouk, Bose & Pooladian, *Learning smooth dynamics via Kinematic Interpolants*, arXiv:2610.22519
- Página de demostración: https://yanxingjianken.github.io/blocking-plots/rwb-prediction/
- Configuración ONNX: `onnx/config.json`, `scales.json`, `ensemble.json` dentro del repositorio del modelo

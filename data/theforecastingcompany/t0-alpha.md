# theforecastingcompany/t0-alpha

## Resumen

`t0-alpha` es un modelo fundacional de series temporales con pesos abiertos desarrollado por The Forecasting Company. Se trata de la primera iteración pública de la familia `t0` y su tarea principal es la previsión probabilística multi-horizonte, operando de forma nativa sobre múltiples covariables (tanto históricas como conocidas en el futuro). Con aproximadamente 102 millones de parámetros, está diseñado para ser ligero y desplegable en hardware modesto, incluyendo Apple Silicon mediante MLX.

El modelo emplea una arquitectura de transformer con estilo decoder y parcheado (patch transformer), orientada específicamente a la previsión de series temporales. A diferencia de los modelos de lenguaje, no procesa texto ni genera lenguaje natural: su salida son distribuciones predictivas sobre valores futuros de una o varias series. La inclusión de covariables conocidas en el futuro (calendario, festivos, promociones, previsiones meteorológicas) es una de sus características diferenciales.

Su relevancia actual radica en que ofrece una alternativa de pesos abiertos y licencia Apache-2.0 en un ecosistema dominado por modelos propietarios o de uso restringido. Además, publica resultados en los leaderboards de referencia del sector (fev-bench y GIFT-Eval), lo que facilita la comparación objetiva con otras alternativas. La disponibilidad de runtimes en PyTorch, MLX y ONNX (FP16 e INT8) amplía sus opciones de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer estilo decoder con parcheado (patch transformer) |
| Parámetros totales | 101.641.541 (aproximadamente 102M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | ONNX FP16 y ONNX INT8 disponibles como artefactos separados; el checkpoint principal se distribuye en safetensors |
| Idiomas soportados | No disponible (modelo de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (checkpoint principal); ONNX FP16 e INT8 en repositorios derivados |

## Arquitectura y entrenamiento

`t0-alpha` es un transformer de estilo decoder que aplica parcheado sobre las series temporales de entrada, una estrategia habitual en los modelos fundacionales de forecasting para convertir secuencias continuas en tokens procesables por atención. El modelo genera previsiones probabilísticas multi-horizonte y acepta de forma nativa variables exógenas, distinguiendo entre covariables históricas y covariables conocidas en el futuro. Esta capacidad permite condicionar la predicción sobre información como festivos, calendarios, promociones o previsiones meteorológicas disponibles durante el horizonte de predicción.

No se ha publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en este dominio). Tampoco se detallan innovaciones específicas de atención o decodificación más allá de la descripción arquitectónica general. El modelo se distribuye con runtimes oficiales en PyTorch y MLX, y con variantes ONNX cuantizadas para despliegues orientados a aceleradores y edge.

## Capacidades

- Previsión probabilística de series temporales: genera distribuciones predictivas, no solo puntos, lo que permite cuantificar incertidumbre.
- Previsión multi-horizonte: produce predicciones sobre varios pasos hacia adelante en una sola pasada.
- Previsión univariante y multivariante: maneja una o varias series simultáneamente.
- Soporte nativo de covariables históricas: incorpora el pasado de variables exógenas para mejorar la predicción.
- Soporte de covariables conocidas en el futuro: calendario, festivos, promociones, previsiones meteorológicas u otras señales disponibles en el horizonte.
- Ejecución local en Apple Silicon mediante el runtime MLX.
- Despliegue en aceleradores y edge mediante variantes ONNX FP16 e INT8.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso en lenguaje natural, visión, audio ni modo thinking; es un modelo especializado exclusivamente en forecasting.

## Casos de uso

- Previsión de demanda eléctrica: el modelo puede condicionar la predicción sobre calendarios y festivos como covariables conocidas en el futuro, algo que ilustra la propia model card con datos de Enedis. Es adecuado por su soporte nativo de covariables y su salida probabilística para planificación de capacidad.
- Planificación de inventario y demanda retail: se usarían promociones planificadas y calendarios comerciales como covariables futuras para generar intervalos de demanda por producto, permitiendo ajustar stocks con estimaciones de incertidumbre.
- Previsión de ingresos o gasto sanitario: el ejemplo de Medic'AM en la model card muestra el uso con reembolsos farmacéuticos mensuales; el modelo mejora la predicción al incorporar covariables frente a la previsión univariante.
- Gestión de capacidad en servicios: previsión de llamadas, visitas o tickets con festivos y eventos planificados como covariables futuras, útil para dimensionar turnos de personal.
- Previsión meteorológica o agroclimática: series multivariantes con variables exógenas conocidas a futuro (por ejemplo, previsiones estacionales) para anticipar demanda hídrica o producción.
- Evaluación comparativa de modelos de forecasting: al estar disponible en Retrocast y publicar resultados en fev-bench y GIFT-Eval, sirve como referencia de pesos abiertos en experimentos de investigación y benchmarking.
- Despliegue en local o edge: gracias a sus ~102M de parámetros y a las variantes ONNX INT8, puede ejecutarse en portátiles con Apple Silicon o dispositivos con recursos limitados para previsiones en tiempo casi real.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente en la información disponible):

| Benchmark | Métrica | Valor |
|---|---|---|
| fev-bench | Skill score | 42,2 |
| GIFT-Eval | CRPS | 0,4941 |
| GIFT-Eval | MASE | 0,724 |

No se han publicado en la información disponible resultados comparativos adicionales con otros modelos en estas mismas tablas.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~102M de parámetros, el checkpoint en FP32 ocupa aproximadamente 0,4 GB; en FP16 alrededor de 0,2 GB; en INT8 en torno a 0,1 GB. El consumo real dependerá de la longitud de las series y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no requiere hardware de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Apple Silicon: soporte oficial mediante el runtime MLX (`tfc-t0[mlx]>=0.6.0`), orientado a inferencia local.
- Opciones de despliegue: PyTorch (`tfc-t0[torch]`), MLX, ONNX FP16 y ONNX INT8; también disponible como API gestionada en Retrocast.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento o licencia de modelos comparables de la misma categoría (por ejemplo, otros modelos fundacionales de series temporales de pesos abiertos). Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| t0-alpha | ~102M | No disponible | Apache-2.0 | Pesos abiertos en Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es una versión alpha: el propio autor la describe como destinada a investigación, experimentación y evaluación aplicada, no como un producto finalizado.
- Las previsiones son estimaciones probabilísticas, no garantías; no deben tratarse como certezas en decisiones críticas sin validación adicional.
- No se han publicado análisis de sesgos, y al ser un modelo de series temporales el riesgo de sesgo depende en gran medida de los datos de entrenamiento, que no se detallan.
- Riesgo de alucinación en el sentido de predicciones poco realistas fuera de la distribución de entrenamiento; no se documentan los dominios cubiertos.
- No se especifican la longitud de contexto soportada ni los límites de horizonte de predicción, lo que dificulta planificar su uso en series muy largas.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene verificar las condiciones de los runtimes y de los artefactos ONNX derivados antes de integrarlos en producción.
- No dispone de capacidades de lenguaje, tool calling ni agentes; no debe emplearse para tareas conversacionales o de razonamiento textual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theforecastingcompany/t0-alpha
- Paper (arXiv): https://arxiv.org/abs/2609.24559
- Web de The Forecasting Company: https://theforecastingcompany.com/
- Runtime PyTorch/MLX en PyPI: https://pypi.org/project/tfc-t0/
- Variante ONNX FP16: https://huggingface.co/theforecastingcompany/t0-alpha-onnx-fp16
- Variante ONNX INT8: https://huggingface.co/theforecastingcompany/t0-alpha-onnx-int8
- Modelo t0-beta: https://huggingface.co/theforecastingcompany/t0-beta
- Modelo t0-gamma: https://huggingface.co/theforecastingcompany/t0-gamma
- Colección de la familia t0-alpha: https://huggingface.co/collections/theforecastingcompany/t0-alpha-model-family-6a99be18a9e3ab245fda8501
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Plataforma Retrocast: https://app.retrocast.com/
- Documentación de la API gestionada: https://docs.retrocast.com/documentation#available-models
- Repositorio GitHub del runtime: https://github.com/theforecastingcompany/tfc-t0
- Datos de Enedis: https://data.enedis.fr/
- Datos de Medic'AM: https://www.assurance-maladie.ameli.fr/etudes-et-donnees/medicaments-classe-atc-medicam

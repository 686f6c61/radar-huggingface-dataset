# theforecastingcompany/t0-gamma

## Resumen

t0-gamma es un modelo fundacional de series temporales con pesos abiertos desarrollado por The Forecasting Company. Se trata de la tercera iteración pública de la familia t0 (tras t0-alpha y t0-beta) y está diseñado específicamente para forecasting probabilístico multivariante con múltiples horizontes, no para generación de texto. Su rasgo diferencial es que opera de forma nativa con covariables históricas y covariables conocidas de futuro (calendario, festivos, promociones, eventos planificados, predicciones meteorológicas) y emite directamente 21 niveles de cuantil por paso temporal.

La arquitectura es un transformer de tipo decoder con tokenización por parches, con aproximadamente 256 millones de parámetros (255.614.293 según los pesos en safetensors). El checkpoint se distribuye en safetensors y cuenta con dos runtimes oficiales bajo la librería `tfc-t0` (versión >= 0.6.0): PyTorch y MLX para Apple Silicon. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en los resultados declarados por el autor: encabeza el leaderboard fev-bench con un skill score de 49,42 y publica métricas competitivas en GIFT-Eval (CRPS 0,452, MASE 0,6608) y TIME (CRPS 0,534, MASE 0,637). Con 12.737 descargas y un tamaño de repositorio de 1,0 GB, es un candidato práctico para sustituir pipelines de forecasting clásicos por un modelo fundacional preentrenado de coste de inferencia bajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de tipo decoder con tokenización por parches (patch transformer) |
| Parámetros totales | 255.614.293 (aproximadamente 256M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio distribuye safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (modelo de series temporales, no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors; runtimes PyTorch (`tfc-t0[torch]`) y MLX (`tfc-t0[mlx]`) |

## Arquitectura y entrenamiento

t0-gamma es un transformer de estilo decoder que trabaja sobre parches de la serie temporal en lugar de sobre tokens discretos. El modelo produce forecasts probabilísticos multi-horizonte y emite de forma nativa 21 niveles de cuantil, lo que permite construir intervalos de predicción sin post-procesado ni supuestos paramétricos. La entrada admite series univariantes y multivariantes, e incorpora tanto covariables históricas como covariables conocidas de futuro (calendario, festivos, promociones, eventos planificados, predicciones meteorológicas u otras señales externas disponibles a lo largo del horizonte de predicción).

La model card indica que la arquitectura es similar a la de t0-beta, cuyo informe técnico describe el detalle del diseño y del entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO (extremadamente improbable en un modelo de forecasting). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. La innovación declarada se centra en tres ejes: salida probabilística nativa por cuantiles, condicionamiento explícito sobre covariables futuras y soporte de inferencia en Apple Silicon vía MLX sobre el mismo checkpoint original.

## Capacidades

- Forecasting probabilístico multi-horizonte con 21 niveles de cuantil emitidos de forma nativa.
- Predicción univariante y multivariante sobre múltiples series simultáneas.
- Condicionamiento sobre covariables históricas (pasadas) y covariables conocidas de futuro.
- Uso de señales externas sobre el horizonte: festivos, calendario, promociones, eventos planificados, predicciones meteorológicas.
- Modelado conjunto de múltiples series con estructura común (por ejemplo, demanda eléctrica nacional).
- Inferencia en CPU/GPU con PyTorch y en Apple Silicon con MLX a partir del mismo checkpoint.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural, visión, audio ni generación de texto.

## Casos de uso

- Predicción de demanda eléctrica nacional: el modelo puede estimar la curva de carga con intervalos de predicción a partir del histórico y de un calendario de festivos, como ilustra el ejemplo de demanda de Enedis (Francia) incluido en la model card. El condicionamiento sobre covariables de calendario es directamente aplicable a este dominio.
- Previsión de gasto o reembolso sanitario: el caso Medic'AM de la model card muestra cómo modelar reembolsos mensuales de medicamentos por clase ATC; la salida por cuantiles permite presupuestar escenarios pesimista y optimista en lugar de una única cifra.
- Planificación de demanda minorista con promociones: introduciendo promociones y festivos como covariables conocidas de futuro, el modelo ajusta el forecast en los picos previstos en lugar de aprenderlos solo del histórico.
- Gestión de capacidad y turnos de personal: el forecast por cuantiles permite dimensionar plantilla contra el percentil 90 de demanda, no contra la media, con el mismo modelo y sin modelos auxiliares.
- Previsión de generación renovable condicionada por meteorología: las predicciones meteorológicas disponibles sobre el horizonte entran como covariables de futuro, lo que encaja con el soporte nativo del modelo para este tipo de señal.
- Evaluación comparativa de modelos de forecasting: al ser compatible con los leaderboards fev-bench, GIFT-Eval y TIME, sirve como baseline fuerte y reproducible en experimentos académicos o internos, con licencia Apache-2.0 para publicar resultados.
- Sustitución de pipelines estadísticos en producción: al ser un modelo preentrenado de 256M de parámetros, se puede desplegar en una sola GPU consumer o en un portátil Apple Silicon y eliminar el ajuste por serie de modelos ARIMA/ETS.

## Benchmarks y rendimiento

Resultados declarados por el autor (entradas de model-index con `verified: false`, es decir, no verificadas de forma independiente):

| Benchmark | Métrica | Valor | Fuente |
|---|---|---|---|
| fev-bench | Skill score | 49,42 | Leaderboard fev-bench (AutoGluon) |
| GIFT-Eval | CRPS | 0,452 | Leaderboard GIFT-Eval (Salesforce) |
| GIFT-Eval | MASE | 0,6608 | Leaderboard GIFT-Eval (Salesforce) |
| TIME | CRPS | 0,534 | Leaderboard TIME (Real-TSF) |
| TIME | MASE | 0,637 | Leaderboard TIME (Real-TSF) |

El blog del autor afirma que t0-gamma es el modelo líder en fev-bench. No se han proporcionado en la información disponible resultados de benchmarks frente a modelos competidores concretos, ni cifras de MMLU, HumanEval o GSM8K (no aplicables a este modelo). No se inventan números adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 255,6M de parámetros, no publicada por el autor): aproximadamente 1,0 GB en FP32, unos 0,5 GB en BF16/FP16 y unos 0,26 GB en int8, sin contar activaciones ni buffers de series.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en iGPU y en CPU.
- Soporte oficial de Apple Silicon mediante MLX (`pip install "tfc-t0[mlx]>=0.6.0"`), por lo que funciona en Mac con chip M-series.
- Despliegue: runtime propio `tfc-t0` en variante PyTorch o MLX; también existe API gestionada en Retrocast. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t0-gamma | 255,6M | No disponible | fev-bench 49,42 skill score; GIFT-Eval CRPS 0,452 | Apache-2.0 | HuggingFace, runtime tfc-t0, API Retrocast |
| t0-beta | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| t0-alpha | No disponible | No disponible | No disponible | No disponible | HuggingFace |

No se dispone en la información proporcionada de especificaciones ni métricas de modelos comparables de otros desarrolladores (por ejemplo, otros modelos fundacionales de series temporales presentes en GIFT-Eval o fev-bench). Cualquier comparación numérica con terceros requeriría consultar directamente esos leaderboards, por lo que se indica como no disponible en esta ficha.

## Limitaciones y advertencias

- Los forecasts son estimaciones probabilísticas, no garantías; la model card lo señala explícitamente. Un intervalo del 90 % no implica que el valor real quede dentro en el 90 % de los casos en cualquier dominio.
- Las métricas de benchmark están declaradas por el autor con `verified: false`; no han sido verificadas de forma independiente en la información disponible.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que impide evaluar sesgos por dominio (por ejemplo, cobertura geográfica o sectorial de las series de entrenamiento).
- Riesgo de error sistemático en series fuera de la distribución de entrenamiento: sin información sobre los datos de preentrenamiento, no se puede acotar la transferibilidad a dominios muy distintos.
- No procesa lenguaje natural ni documentos, por lo que no sirve para tareas de texto, código o razonamiento; los campos de idioma no aplican.
- Longitud de contexto y horizonte máximo no documentados en la información disponible; conviene validarlos empíricamente antes de fijar un horizonte de producción.
- Requiere `tfc-t0>=0.6.0`; el `config.json` del checkpoint declara convenciones que versiones anteriores del runtime no interpretan.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con atribución y sin garantías; no se identifican restricciones adicionales en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theforecastingcompany/t0-gamma
- Informe técnico (arXiv): https://arxiv.org/abs/2609.24559
- Blog del lanzamiento: https://www.theforecastingcompany.com/blog/t0-gamma/
- Web del desarrollador: https://theforecastingcompany.com/
- Repositorio del runtime tfc-t0: https://github.com/theforecastingcompany/tfc-t0
- Paquete PyPI: https://pypi.org/project/tfc-t0/
- Colección de la familia t0: https://huggingface.co/collections/theforecastingcompany/t0-alpha-model-family-6a99be18a9e3ab245fda8501
- t0-beta: https://huggingface.co/theforecastingcompany/t0-beta
- t0-alpha: https://huggingface.co/theforecastingcompany/t0-alpha
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
- Plataforma Retrocast: https://app.retrocast.com/
- Documentación de la API gestionada: https://docs.retrocast.com/documentation#available-models

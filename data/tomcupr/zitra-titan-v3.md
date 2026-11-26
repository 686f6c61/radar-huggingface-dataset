# tomcupr/Zitra-Titan-v3

## Resumen
Zitra-Titan-v3 es un modelo fundacional de prediccion de series temporales desarrollado por tomcupr (Tomas Cupr) y publicado bajo licencia Apache-2.0. Resuelve el problema del forecasting zero-shot multivariante con covariables, sin necesidad de reentrenamiento por dominio, y se distribuye como un unico checkpoint de 1.061.831.429 parametros (2,1 GB en safetensors). Su relevancia actual radica en que es el primer modelo de pesos abiertos con licencia comercial estandar que supera el 50% de SQL skill en el benchmark fev-bench, y el primero en la categoria zero-shot Apache-2.0 en GIFT-Eval.

La arquitectura es de tipo multi-arquitectura (mixture of experts con enrutamiento causal, segun la model card), orientada a pronostico probabilistico: devuelve mediana y cuantiles (por ejemplo q10/q90) en lugar de una unica prediccion puntual. Incluye covariables exogenas y un calendario de dias festivos publicos integrado para mas de 240 paises y subdivisiones, lo que simplifica los pipelines de retail, logistica y energia.

El modelo se ejecuta en 3,46 GB de VRAM, por lo que cabe en cualquier GPU consumer de 6-8 GB, y declara una latencia de 122 ms en una B300. Se distribuye con la libreria propia `zitra-forecast`, instalable desde GitHub, y con un Space de demostracion en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-arquitectura con enrutamiento causal de expertos (mixture of experts) para series temporales |
| Parametros totales | 1.061.831.429 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de la model card usa 512 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (modelo numerico; los identificadores de pais para festivos cubren 240+ paises) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento
La model card describe el modelo como "multi-architecture" con un mecanismo de enrutamiento causal de expertos ("live causal pop-quiz expert weights", expuesto mediante `fc.routing_summary()`). Esto sugiere una mezcla de expertos especializados por patron temporal, seleccionados dinamicamente por contexto, en lugar de un transformer denso unico. El modelo es probabilistico: genera una distribucion de pronostico de la que se extraen mediana y cuantiles arbitrarios (`fc.quantile(p)`), lo que permite calcular WQL, CRPS y otras metricas de calibracion.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF/DPO (poco habituales en forecasting). La model card afirma evaluacion "strictly causal zero-leakage" sobre un checkpoint congelado (`frozen.json`, SHA-256 `f61bde12f03830e9`), lo que es relevante para la validez de los resultados. Tambien incorpora de forma nativa un calendario de festivos publicos para mas de 240 paises y subdivisiones (por ejemplo `"CZ"`, `"DE-BY"`, `"US-CA"`), utilizado como covariable exogena.

## Capacidades
- Pronostico zero-shot de series temporales univariantes y multivariantes, sin ajuste fino por dominio.
- Pronostico probabilistico: mediana y cuantiles configurables (`quantile_levels=[0.1, 0.5, 0.9]`), adecuado para metricas como WQL y CRPS.
- Soporte de covariables exogenas (pasadas y futuras), incluyendo el caso `past_cov_only`.
- Integracion nativa de dias festivos publicos para 240+ paises y subdivisiones mediante el parametro `country`.
- Interfaz sobre pandas DataFrame: `predict_df` con `id_column`, `timestamp_column`, `target` y `prediction_length`, apta para multiples series en un mismo lote.
- Modo rapido (`fast=True`) con latencia declarada de aproximadamente 102 ms.
- Introspeccion del enrutamiento de expertos mediante `routing_summary()`.
- No se documentan capacidades de generacion de texto, codigo, vision, audio ni tool calling; es un modelo estrictamente numerico.

## Casos de uso
- Prevision de demanda en retail: `predict_df` permite pronosticar ventas por tienda y SKU con horizontes de 1 dia o 1 semana, incorporando festivos locales mediante `country`; la model card reporta mejoras de WQL del 4,5-15,4% frente a Timestral-209M en el dataset publico de Rohlik.
- Planificacion de operaciones logisticas: prevision horaria de pedidos en centros de fulfillment (caso documentado de 8 tareas y 10.859 pronosticos, con mejora de hasta 5,10% de WAPE en pedidos horarios a 7 dias).
- Gestion de inventario en semanas festivas: el calendario integrado reduce el WAPE de 4,62% a 3,88% global y de 13,58% a 7,81% en 31 semanas con festivos en 12 centros europeos.
- Prevision energetica: la model card cita mejoras del 26,3% en MASE y 24,3% en CRPS en el dataset `solar` de GIFT-Eval, util para dimensionar generacion y consumo.
- Prediccion meteorologica y agroclimatica: mejora del 10,5% en MASE y 17,1% en CRPS en `temperature_rain`, aplicable a planificacion de riego o seguros agricolas.
- Analisis financiero y de trafico: resultados en `kdd_cup_2018` y `loop_seattle` (mejoras de 3,4-5,3%) lo hacen util para predecir ocupacion viaria o demanda de servicios.
- Prototipado rapido en cuadernos: al ejecutarse en 3,46 GB de VRAM y con instalacion via pip desde GitHub, permite validar hipotesis de forecasting en una GPU consumer sin infraestructura dedicada.

## Benchmarks y rendimiento
Datos declarados por el autor en el model-index (no verificados de forma independiente, `verified: false`).

GIFT-Eval (97/97 configuraciones; menor es mejor):

| Modelo | Licencia | MASE | CRPS |
|---|---|---:|---:|
| Zitra-Titan-v3 | Apache-2.0 | 0,6522 | 0,4422 |
| Timestral-209M | No comercial | 0,6575 | 0,4460 |
| t0-gamma | Apache-2.0 | 0,6610 | 0,4520 |
| TimesFM-3 | No comercial | 0,6670 | 0,4560 |
| Toto-2.0-2.5B | Apache-2.0 | 0,6960 | 0,4760 |
| Chronos-2 | Apache-2.0 | 0,6980 | 0,4850 |

fev-bench (100/100 tareas; mayor es mejor):

| Modelo | Licencia | SQL win rate | SQL skill | MASE skill |
|---|---|---:|---:|---:|
| Zitra-Titan-v3 (#6) | Apache-2.0 | 80,2% | 50,18% | 39,05% |
| Timestral-209M (#7) | No comercial | 79,4% | 50,39% | 39,49% |
| t0-gamma (#12) | Apache-2.0 | 73,8% | 49,42% | 37,99% |
| TimesFM-3 (#17) | No comercial | 67,6% | 48,99% | 37,82% |
| Chronos-2 (#23) | Apache-2.0 | 57,9% | 47,28% | 35,50% |
| Toto-2.0-2.5B (#25) | Apache-2.0 | 56,9% | 44,42% | 32,54% |

El autor declara ademas 54,52% de WQL skill y 79,4% de MASE win rate en fev-bench, y posiciones #1-#5 ocupadas por APIs cerradas, modelos no comerciales o licencias no Apache.

## Requisitos de hardware
- VRAM de inferencia: 3,46 GB segun la model card, con un unico fichero de 2,12 GB.
- Cabe en cualquier GPU consumer de 6-8 GB (por ejemplo RTX 3060, RTX 4060, RTX 2070).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; el autor cita una latencia de 122 ms en una B300 (GPU de centro de datos).
- Despliegue: libreria `zitra-forecast` (pip desde GitHub). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 122 ms declarados en B300; aproximadamente 102 ms con `fast=True`. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GIFT-Eval MASE | fev-bench SQL skill | Licencia |
|---|---|---:|---:|---:|---|
| Zitra-Titan-v3 | 1,06 B | no disponible | 0,6522 | 50,18% | Apache-2.0 |
| Timestral-209M | 209 M | no disponible | 0,6575 | 50,39% | No comercial |
| TimesFM-3 | no disponible | no disponible | 0,6670 | 48,99% | No comercial |
| Chronos-2 | no disponible | no disponible | 0,6980 | 47,28% | Apache-2.0 |
| Toto-2.0-2.5B | 2,5 B | no disponible | 0,6960 | 44,42% | Apache-2.0 |

Zitra-Titan-v3 ofrece el mejor MASE y CRPS de la comparativa con licencia comercial, con un coste de parametros inferior al de Toto-2.0-2.5B y con soporte nativo de festivos que ninguno de los competidores documenta en la informacion disponible.

## Limitaciones y advertencias
- Los resultados de benchmarks son declarados por el autor (`verified: false`) y no han sido replicados de forma independiente.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- Es un modelo puramente numerico: no procesa texto, codigo ni imagenes, y no dispone de tool calling.
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre datos historicos puede heredar sesgos de los dominios representados en su dataset de entrenamiento (no detallado).
- Riesgo de degradacion fuera de distribucion en series con cambios estructurales, quiebres o eventos no representados en el calendario de festivos.
- La longitud de contexto no esta documentada; el ejemplo de la model card usa 512 pasos, por lo que ventanas mas largas no estan garantizadas.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de validacion externa y de soporte oficial aconseja validar en cada dominio antes de desplegar.
- La libreria `zitra-forecast` se instala desde GitHub (no aparece publicada en PyPI en la informacion disponible), lo que introduce riesgo de cambios de API.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tomcupr/Zitra-Titan-v3
- Demo en vivo: https://huggingface.co/spaces/tomcupr/zitra-v3-demo
- SDK en GitHub: https://github.com/tomascupr/zitra-forecast
- Resultados GIFT-Eval (CSV): https://huggingface.co/tomcupr/Zitra-Titan-v3/blob/main/gift_eval_results.csv
- Resultados fev-bench (CSV): https://huggingface.co/tomcupr/Zitra-Titan-v3/blob/main/fev_bench_results.csv
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench

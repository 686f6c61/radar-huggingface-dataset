# tomcupr/Zitra-Core-v3

## Resumen

Zitra-Core-v3 es un modelo fundacional de series temporales de 256 millones de parámetros (255.614.293 exactos según los pesos en safetensors) desarrollado por el autor independiente tomcupr. Está diseñado específicamente para forecasting probabilístico multivariante con covariables, es decir, para predecir la evolución futura de series temporales y devolver distribuciones (mediana y cuantiles) en lugar de una única estimación puntual. Se distribuye con licencia Apache-2.0, lo que lo convierte en una de las pocas alternativas completamente abiertas para uso comercial en esta categoría.

El modelo es un destilado del modelo insignia del mismo autor, Zitra-Titan-v3 (1.06B parámetros), y se presenta como la opción "compacta" de la familia: mantiene un rendimiento cercano al modelo grande a una fracción del coste computacional. Según la model card, alcanza 17,5 ms por forecast en GPU y 87 ms en CPU, con un consumo estimado de 1,07 GB de VRAM, y afirma superar a alternativas como t0-gamma, TimesFM-3, Chronos-2 y Toto-2.0-2.5B en los benchmarks GIFT-Eval y fev-bench.

Su relevancia actual radica en que combina tres factores poco habituales en modelos fundacionales de series temporales: licencia permisiva, tamaño reducido que permite despliegue en hardware modesto y soporte nativo de calendarios de días festivos para más de 240 países y subdivisiones. La librería de inferencia es `zitra-forecast`, distribuida vía GitHub, y el modelo se publicó en Hugging Face el 26 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional de series temporales, destilado; la model card no detalla la arquitectura interna) |
| Parametros totales | 255.614.293 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa contextos de 512 pasos y horizontes de predicción de 96) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico de series temporales; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (transformer, SSM, híbrido u otra). Lo que sí se documenta es que Zitra-Core-v3 es un modelo destilado a partir de Zitra-Titan-v3, el modelo insignia de 1.06B parámetros del mismo autor. El modelo está etiquetado como "foundation-model", "multivariate" y "covariates", lo que indica que acepta múltiples series temporales simultáneas y variables exógenas (covariables) además de la serie objetivo.

En cuanto a evaluación, la model card afirma que todos los resultados provienen de un único checkpoint congelado, con evaluación estrictamente causal y sin fuga de datos de test (0,0% de solapamiento con fev-bench). No se detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en este dominio). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El modelo incorpora de forma nativa calendarios de días festivos públicos para más de 240 países y subdivisiones (por ejemplo "CZ", "DE-BY", "US-CA"), lo que constituye una funcionalidad diferencial frente a otros modelos de forecasting.

## Capacidades

- Forecasting probabilístico: devuelve mediana y cuantiles (por ejemplo q10, q90) además de la predicción puntual, lo que permite construir intervalos de confianza.
- Forecasting multivariante: acepta múltiples series simultáneas identificadas por columna de ID.
- Uso de covariables: integra variables exógenas junto a la serie objetivo.
- Calendarios de días festivos: incorpora festivos públicos de más de 240 países y subdivisiones directamente en la API de predicción.
- Predicción zero-shot: según la model card, funciona sin entrenamiento específico sobre el dominio (el ejemplo de empresa Rohlik se etiqueta como "100% Zero-Shot").
- Integración con Pandas: el método `predict_df` acepta DataFrames con columnas de identificador, timestamp y objetivo.
- Horizontes configurables: el ejemplo de la model card usa `prediction_length=96` y `prediction_length=14`.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es un modelo numérico especializado, no un LLM.

## Casos de uso

- Previsión de demanda minorista: el modelo puede predecir la demanda diaria de miles de SKU con covariables como promociones o festivos; la model card cita el caso de Rohlik con 10.000 SKU diarios en 7,9 s (1.265 SKU/s en GPU B300), lo que lo hace adecuado para planificación de inventario a gran escala.
- Planificación de plantillas y operaciones horarias: con horizontes cortos y contexto de 512 pasos, puede generar previsiones horarias para turnos de personal, con intervalos de confianza que permiten dimensionar escenarios pesimistas y optimistas.
- Gestión energética y previsión de carga: la capacidad multivariante y el uso de covariables (temperatura, calendario) permiten modelar consumo eléctrico por edificio o por región y anticipar picos.
- Previsión financiera de series de ventas o tráfico: la salida probabilística (cuantiles) es útil para presupuestación con escenarios, ya que permite calcular el valor en riesgo o el percentil 90 de ingresos.
- Monitorización de métricas de infraestructura: predicción de latencia, tráfico o uso de recursos con detección temprana de anomalías al comparar el valor real con el intervalo de predicción.
- Planificación de cadena de suministro multi-almacén: el soporte de `id_column` permite generar previsiones por tienda o almacén en una sola llamada, con festivos locales aplicados automáticamente por país o subdivisión.
- Previsión meteorológica o de afluencia: cualquier serie temporal con estacionalidad semanal y efecto de festivos se beneficia del calendario integrado sin ingeniería de features adicional.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, marcados como `verified: false` en el model-index).

GIFT-Eval (menor es mejor):

| Modelo | Licencia | MASE ↓ | CRPS ↓ |
|---|---|---:|---:|
| Zitra-Titan-v3 (1.06B) | Apache-2.0 | 0.6522 | 0.4422 |
| **Zitra-Core-v3 (256M)** | **Apache-2.0** | **0.6551** | **0.4473** |
| Timestral-209M | No comercial | 0.6575 | 0.4460 |
| Timestral-123M | No comercial | 0.6589 | 0.4476 |
| t0-gamma (256M) | Apache-2.0 | 0.6608 | 0.4520 |
| TimesFM-3 | No comercial | 0.6668 | 0.4557 |
| iAmTime (302M) | Apache-2.0 | 0.6795 | 0.4647 |
| Toto-2.0-2.5B (2.5B) | Apache-2.0 | 0.6956 | 0.4759 |
| Chronos-2 (120M) | Apache-2.0 | 0.6978 | 0.4854 |

fev-bench (mayor skill es mejor, menor tiempo es mejor):

| Modelo | Licencia | SQL win ↑ | SQL skill ↑ | MASE skill ↑ | Runtime ↓ | Speedup |
|---|---|---:|---:|---:|---:|---:|
| Zitra-Titan-v3 (1.06B) | Apache-2.0 | 79,7% | 50,18% | 39,05% | 6.764 s | 3,7× más lento |
| Timestral-209M | No comercial | 78,8% | 50,39% | 39,49% | 3.827 s | 2,1× más lento |
| **Zitra-Core-v3 (256M)** | **Apache-2.0** | **75,5%** | **49,69%** | **38,39%** | **1.807 s** | **1,0× (baseline)** |
| t0-gamma (256M) | Apache-2.0 | 72,9% | 49,42% | 37,99% | 15.862 s | 8,8× más lento |
| TimesFM-3 | No comercial | 66,9% | 48,99% | 37,82% | 8.673 s | 4,8× más lento |
| iAmTime (302M) | Apache-2.0 | 60,5% | 46,78% | 35,36% | 599 s | 3,0× más rápido |
| Chronos-2 (120M) | Apache-2.0 | 56,9% | 47,28% | 35,50% | 2.738 s | 1,5× más lento |
| Toto-2.0-2.5B (2.5B) | Apache-2.0 | 55,9% | 44,42% | 32,54% | 13.835 s | 7,7× más lento |

Según la model card, Zitra-Core-v3 evalúa 100 tareas en fev-bench (53,76% WQL skill, 73,5% MASE win rate, puesto 11 de 56 modelos) y 97 configuraciones en GIFT-Eval. El autor afirma que supera a t0-gamma en 63 de 100 tareas con 8,8× más throughput (4,91 s frente a 16,25 s de mediana).

## Requisitos de hardware

- VRAM estimada: 1,07 GB según la model card, lo que corresponde a los pesos en precisión nativa (255M parámetros a ~4 bytes ≈ 1,02 GB más overhead).
- GPU recomendadas: la model card menciona explícitamente una GPU B300 para el benchmark de throughput empresarial; por tamaño, cualquier GPU con al menos 2 GB de VRAM es suficiente (RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 2 GB o más de VRAM; también es viable en CPU.
- Opciones de despliegue: la librería oficial `zitra-forecast` (instalable vía `pip install "zitra-forecast @ git+https://github.com/tomascupr/zitra-forecast.git"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un LLM.
- Latencia: 17,5 ms por forecast en GPU y 87 ms en CPU según la model card. Throughput citado: 1.265 SKU/s en B300 para forecasting de 10.000 SKU diarios en 7,9 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Licencia | GIFT-Eval MASE ↓ | fev-bench SQL skill ↑ | Despliegue |
|---|---|---:|---:|---:|---|
| **Zitra-Core-v3** | 256M | Apache-2.0 | 0.6551 | 49,69% | zitra-forecast |
| t0-gamma | 256M | Apache-2.0 | 0.6608 | 49,42% | no disponible |
| Chronos-2 | 120M | Apache-2.0 | 0.6978 | 47,28% | no disponible |
| TimesFM-3 | no disponible | No comercial | 0.6668 | 48,99% | no disponible |
| Toto-2.0-2.5B | 2,5B | Apache-2.0 | 0.6956 | 44,42% | no disponible |

Frente a t0-gamma (mismo tamaño, misma licencia), Zitra-Core-v3 mejora MASE en GIFT-Eval (0.6551 frente a 0.6608) y es 8,8× más rápido en fev-bench. Frente a Chronos-2 (120M, Apache-2.0), mejora ambos benchmarks pese a tener el doble de parámetros. Frente a TimesFM-3, mejora rendimiento y además ofrece licencia comercial. La principal desventaja relativa es iAmTime, que es 3× más rápido aunque con peor precisión.

## Limitaciones y advertencias

- Los benchmarks están declarados por el autor y marcados como `verified: false` en el model-index; no han sido verificados de forma independiente.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La arquitectura interna no está documentada en la model card, lo que dificulta evaluar sus fundamentos técnicos.
- No se especifican los datos de entrenamiento, el volumen de tokens ni la composición del dataset, por lo que no se pueden evaluar sesgos de dominio.
- Al ser un modelo numérico, no procesa texto ni idiomas; no es adecuado para tareas de NLP.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de predicciones mal calibradas en series con distribución distinta a la de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- La dependencia de la librería `zitra-forecast` instalada desde GitHub (no desde PyPI) implica que la API puede cambiar sin versionado estable.
- El modelo está destilado de Zitra-Titan-v3, por lo que hereda las limitaciones del modelo profesor sin que estas se documenten.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomcupr/Zitra-Core-v3
- Modelo insignia Zitra-Titan-v3: https://huggingface.co/tomcupr/Zitra-Titan-v3
- Demo en vivo: https://huggingface.co/spaces/tomcupr/zitra-v3-demo
- Repositorio GitHub del SDK: https://github.com/tomascupr/zitra-forecast
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- CSV de resultados GIFT-Eval: gift_eval_results.csv (enlazado desde la model card)
- CSV de resultados fev-bench: fev_bench_results.csv (enlazado desde la model card)

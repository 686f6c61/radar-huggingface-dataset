# thangkt/financeforecast-findualformer

## Resumen

FinDualFormer es un checkpoint de investigación desarrollado por el usuario thangkt (proyecto FinanceForecast) para la predicción de retornos logarítmicos acumulados de acciones del índice vietnamita VNX50. El modelo resuelve un problema de forecasting financiero multi-horizonte: dado un histórico de 60 sesiones de precios, volúmenes y valoraciones, junto con los estados financieros trimestrales publicados antes de la fecha de predicción (point-in-time), estima el retorno acumulado a 1, 5 y 20 sesiones para cada uno de los 50 valores del índice.

La arquitectura es un transformer causal sobre series temporales de precios, extendido a partir del modelo PAN+NAN (Hadizadeh et al. 2025) con un mecanismo dual que incorpora los informes financieros trimestrales como tokens adicionales (con su antigüedad de publicación), ranking transversal entre valores, atención entre acciones del mismo día, gating guiado por el estado del mercado y una función de pérdida híbrida que combina MSE, información de correlación (IC), dirección y ranking con margen.

El modelo es relevante en el contexto de la investigación aplicada a mercados emergentes y a la incorporación de datos fundamentales point-in-time en arquitecturas transformer, un área con escasa literatura para el mercado vietnamita. Se distribuye como checkpoint de PyTorch con cinco snapshots de época por semilla y cinco semillas por variante, sin licencia declarada y con un tamaño de repositorio de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre serie de precios con rama dual de tokens de informes financieros trimestrales (basado en PAN+NAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 60 sesiones de entrada (ventana de precios/volumen/valoración) |
| Tipos de cuantizacion | no disponible (checkpoint en punto flotante PyTorch) |
| Idiomas soportados | vi (vietnamita) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (checkpoint con `snapshot_states`, `dims`, `calibration`) |

## Arquitectura y entrenamiento

FinDualFormer parte de PAN+NAN (Hadizadeh et al. 2025), un transformer causal sobre secuencias de precios. Sobre esa base añade una rama dual: cada informe financiero trimestral se codifica como un token acompañado de su "edad" (tiempo transcurrido desde la publicación real en HOSE/HNX), se rankea transversalmente entre los valores del universo y se fusiona en el flujo de precios. La arquitectura incorpora atención entre valores del mismo día (cross-sectional attention), gating guiado por el estado del mercado y una pérdida híbrida que combina MSE, correlación de información (IC), acierto direccional y ranking con margen.

El entrenamiento cubre el periodo 06/2014–12/2021, con validación en 2022 y test en 01/2023–12/2025. La entrada son ventanas de 60 sesiones con precios, volumen y métricas de valoración, más los estados financieros trimestrales publicados antes de la fecha de predicción. Cada checkpoint almacena los pesos de las 5 épocas con mayor RankIC de validación; la predicción final es la media de esos 5 modelos. Se entrenaron 5 semillas por variante (modelo propuesto, variante solo-precio y baseline PAN+NAN). No se especifica en la información disponible el número de tokens de entrenamiento ni detalles sobre RLHF/DPO.

## Capacidades

- Predicción de retornos logarítmicos acumulados a horizontes de 1, 5 y 20 sesiones para los 50 valores del universo VNX50.
- Incorporación de datos fundamentales trimestrales point-in-time (estados financieros con fecha real de publicación), evitando fuga de información futura.
- Ranking transversal entre valores del mismo día mediante atención cross-sectional.
- Modelado del estado del mercado mediante gating guiado por el régimen del índice.
- Generación de señales tipo `model_signals` con campos `symbol`, `date`, `score` y `expected_return`.
- Calibración opcional de la magnitud del retorno mediante el factor `calibration` del checkpoint.
- Capacidad multilingüe: no disponible (orientado exclusivamente al mercado vietnamita).
- Soporte de tool calling, agentes o visión: no disponible.

## Casos de uso

- Investigación académica en forecasting financiero: el checkpoint permite reproducir los experimentos del proyecto FinanceForecast y comparar la variante dual con la solo-precio y el baseline PAN+NAN bajo las mismas condiciones de datos y semillas.
- Construcción de carteras long-only cuantitativas: la señal Top-10 por score permite seleccionar los 10 valores con mayor retorno esperado relativo al promedio del índice, con un exceso neto reportado de +12,4 % anual a 5 sesiones y +14,6 % a 20 sesiones tras costes de 0,25 % por lado.
- Análisis de sensibilidad al uso de fundamentales: al existir una variante solo-precio, se puede cuantificar la contribución marginal de los informes trimestrales en el RankIC y el Sharpe del long-short.
- Evaluación de estrategias long-short como métrica de señal: aunque el mercado vietnamita limita las ventas en corto, el Sharpe long-short sirve para medir la calidad de la señal antes de implementar estrategias long-only.
- Estudio de regímenes de mercado: el gating guiado por el estado del mercado permite analizar cómo cambia la calidad de la señal en distintos periodos (por ejemplo, validación 2022 frente a test 2023–2025).
- Pipeline de investigación con datos point-in-time: el modelo sirve como referencia para integrar estados financieros con fecha real de publicación en arquitecturas transformer, evitando el sesgo de look-ahead.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test 2023–2025 (media ± desviación típica sobre 5 semillas). RankIC es la correlación de rangos de Spearman entre predicción y retorno real por día; MASE es el MAE sobre precio normalizado dividido por el MAE del predictor ingenuo "precio futuro = precio hoy" (menor es mejor); Sharpe LS corresponde a una cartera long top-10 / short bottom-10 sin solapamiento; Top-10 neto es el exceso del top-10 frente a la media del índice tras costes de 0,25 % por lado.

Horizonte 5 sesiones:

| Modelo | RankIC | t | DA % | MASE | Sharpe LS | Top-10 neto/año |
|---|---|---|---|---|---|---|
| FinDualFormer (propuesto) | +0,075 ± 0,006 | +4,58 ± 0,35 | 53,9 ± 0,4 | 0,999 ± 0,002 | +2,11 ± 0,27 | +12,4 % ± 1,6 % |
| FinDualFormer solo precio | +0,058 ± 0,029 | +3,37 ± 1,64 | 53,5 ± 0,8 | 1,010 ± 0,014 | +1,70 ± 0,42 | +5,3 % ± 3,3 % |
| PAN+NAN (baseline) | +0,036 ± 0,013 | +2,33 ± 0,73 | 50,6 ± 3,3 | 1,135 ± 0,048 | +1,00 ± 0,53 | +3,9 % ± 4,2 % |

Horizonte 20 sesiones:

| Modelo | RankIC | t | DA % | MASE | Sharpe LS | Top-10 neto/año |
|---|---|---|---|---|---|---|
| FinDualFormer (propuesto) | +0,094 ± 0,012 | +2,82 ± 0,42 | 55,8 ± 1,1 | 1,011 ± 0,013 | +1,98 ± 0,36 | +14,6 % ± 1,1 % |
| FinDualFormer solo precio | +0,077 ± 0,035 | +2,05 ± 0,84 | 55,5 ± 1,0 | 1,013 ± 0,009 | +1,56 ± 0,32 | +10,3 % ± 2,0 % |
| PAN+NAN (baseline) | +0,045 ± 0,012 | +1,44 ± 0,38 | 55,2 ± 0,6 | 1,262 ± 0,114 | +0,64 ± 0,34 | +6,0 % ± 3,1 % |

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,1 GB y el checkpoint se carga con `torch.load(..., map_location="cpu")`, por lo que la inferencia es viable en CPU.
- GPU recomendadas: no disponible. Dado el reducido tamaño del checkpoint y la ventana de entrada de 60 sesiones, una GPU consumer (por ejemplo, RTX 3060 o superior) es suficiente para lotes moderados, aunque no se especifican requisitos formales.
- Cabe en GPU consumer: sí, según el tamaño del repositorio y la carga en CPU documentada.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + `DeepModelFactory.create` del repositorio FinanceForecast). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RankIC (h=5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinDualFormer (propuesto) | no disponible | 60 sesiones | +0,075 | no disponible | Hugging Face (thangkt) |
| FinDualFormer solo precio | no disponible | 60 sesiones | +0,058 | no disponible | Hugging Face (thangkt) |
| PAN+NAN (Hadizadeh et al. 2025) | no disponible | 60 sesiones | +0,036 | no disponible | Baseline en el mismo repositorio |

No se dispone de información sobre otros modelos comparables de forecasting financiero para el mercado vietnamita en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgo de supervivencia: el universo VNX50 es la lista actual del índice, por lo que las acciones que salieron del índice no están representadas; además, solo cubre 50 valores de gran capitalización.
- Resultados de carácter académico: el autor indica explícitamente que no constituyen recomendación de inversión.
- Long-short solo como métrica: el mercado vietnamita limita las ventas en corto, y no se ha hecho backtest completo de las reglas T+2, bandas de precio ni lotes mínimos.
- Dependencia de datos externos: los precios provienen de `datnkhptit/vn-stock-ohlcv` (gated) y los estados financieros y fechas de publicación de `thangkt/financeforecast-bronze-online`; la disponibilidad y calidad de estas fuentes condicionan la reproducibilidad.
- Riesgo de sobreajuste y varianza entre semillas: la desviación típica del RankIC en la variante solo-precio (±0,029 a 5 sesiones) es elevada en relación con la media.
- Licencia no declarada: no se especifican condiciones de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Idiomas: el modelo está orientado exclusivamente al mercado vietnamita; no se documenta soporte multilingüe.
- Sin datos sobre sesgos, alucinación en el sentido generativo, ni requisitos formales de hardware.

## Enlaces

- Hugging Face: https://huggingface.co/thangkt/financeforecast-findualformer
- Repositorio de código: https://github.com/ducnx/FinanceForecast (rama `thang/ml/deep-learning`)
- Informe de resultados: `docs/plan/quarterly-features/ket-qua-deep-learning.md` en el repositorio
- Guía de ejecución: `docs/plan/quarterly-features/huong-dan-chay-deep-learning.md` en el repositorio
- Dataset de precios: `datnkhptit/vn-stock-ohlcv` (gated)
- Dataset de estados financieros: `thangkt/financeforecast-bronze-online`
- Paper de referencia (PAN+NAN): Hadizadeh et al. 2025 (referenciado en la model card, sin enlace directo disponible)

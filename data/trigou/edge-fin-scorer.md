# Trigou/edge-fin-scorer

## Resumen

`Trigou/edge-fin-scorer` es un modelo de clasificación de riesgos financieros desarrollado por Trigou (Thomas Rigou), que produce puntuaciones continuas entre 0 y 1 para 13 categorías de riesgo adverso mencionadas en transcripciones de earnings calls. Se basa en el framework GLiClass Edge V3.0 de Knowledgator, con un encoder ModernBERT de 32 millones de parámetros, y está diseñado para medir la prominencia de cada factor de riesgo en un pasaje de texto, en lugar de hacer una clasificación binaria de presencia o ausencia.

El modelo resuelve el problema de cuantificar la exposición de una empresa a riesgos específicos (geopolítico, inflación, cadena de suministro, política monetaria, etc.) a partir de texto no estructurado. Su relevancia actual radica en que combina la flexibilidad zero-shot de GLiClass con un ajuste fino especializado en dominios financieros, manteniendo una ventana de contexto de 8.192 tokens y un tamaño reducido de aproximadamente 32,7 millones de parámetros (125 MB en safetensors), lo que permite su ejecución incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiClass uni-encoder con MLP scorer |
| Parametros totales | 32.705.153 (~32M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (etiquetas en ingles; datos de entrenamiento son transcripciones de earnings calls) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura GLiClass uni-encoder con un MLP scorer acoplado al encoder. El encoder base es `jhu-clsp/ettin-encoder-32m`, una variante de ModernBERT de 32 millones de parámetros, sobre el que se aplicó un ajuste fino con LoRA (r=64, α=128). La salida es una puntuación continua por cada categoría de riesgo, lo que permite medir la saliencia adversa de forma granular.

El entrenamiento se realizó sobre extractos de earnings calls etiquetados de forma blanda (soft labels) generados por GPT 4.1 mini, utilizando focal loss con α=0,7 y γ=2,0. Esta combinación de etiquetas blandas y focal loss permite manejar el desequilibrio entre categorías y producir puntuaciones calibradas. El modelo conserva la flexibilidad zero-shot de GLiClass, ya que no tiene un conjunto de etiquetas fijo incrustado en inferencia.

## Capacidades

- Clasificación multi-etiqueta con puntuaciones continuas (0-1) para 13 categorías de riesgo: Climate Risk, Demand Risk, Economic Policy, Equity Market Volatility, Financial Risk, Geopolitical Risk, Inflation Risk, Labor Risk, Monetary Policy, Oil Risk, Political Risk, Supply Chain Risk y Trade Policy.
- Flexibilidad zero-shot: permite pasar etiquetas arbitrarias en inferencia sin necesidad de reentrenar.
- Procesamiento de contextos largos de hasta 8.192 tokens, adecuado para pasajes extensos de transcripciones.
- Inferencia por lotes (batch inference) para procesar múltiples pasajes simultáneamente.
- Puntuaciones continuas utilizables directamente como medidas de exposición, sin necesidad de umbralización binaria.
- Ejecución eficiente en CPU o GPU gracias a su tamaño reducido (~32M parámetros).

## Casos de uso

- Gestión de carteras: un gestor puede procesar las transcripciones de earnings calls de todas las empresas de su cartera y obtener puntuaciones de exposición a riesgos geopolíticos o de inflación, integrándolas en sus modelos de asignación de activos.
- Monitorización de cadenas de suministro: equipos de operaciones pueden analizar comunicados trimestrales de proveedores para detectar señales tempranas de riesgo en la cadena de suministro, como interrupciones logísticas o dependencia de rutas vulnerables.
- Due diligence en fusiones y adquisiciones: durante el proceso de diligencia debida, el modelo puede evaluar la exposición de una empresa objetivo a riesgos regulatorios, políticos o climáticos a partir de sus comunicaciones públicas.
- Alertas tempranas para equipos de inversión: configurar un pipeline que procese automáticamente las transcripciones de earnings calls y genere alertas cuando la puntuación de una categoría de riesgo supere un umbral definido por el usuario.
- Investigación académica en finanzas corporativas: el modelo permite construir medidas cuantitativas de exposición a riesgos a nivel de empresa, útiles para estudios empíricos sobre la relación entre riesgos y valoración.
- Análisis de competencia sectorial: comparar las puntuaciones de riesgo de distintas empresas del mismo sector para identificar cuáles están más expuestas a factores adversos comunes, como la política comercial o la volatilidad de los mercados.

## Benchmarks y rendimiento

El modelo fue evaluado sobre un split retenido del 10% (1.267 ejemplos, seed 42) utilizando como ground truth las etiquetas blandas de GPT 4.1 mini:

| Metrica | Valor |
|---|---|
| MAE | 0,061 |
| RMSE | 0,110 |
| MAE (mediana) | 0,034 |
| MAE (p90) | 0,091 |
| MAE (p95) | 0,243 |

MAE por categoría de riesgo:

| Categoria | MAE | RMSE |
|---|---|---|
| Climate Risk | 0,035 | 0,052 |
| Demand Risk | 0,084 | 0,161 |
| Economic Policy | 0,083 | 0,106 |
| Equity Market Volatility | 0,057 | 0,086 |
| Financial Risk | 0,050 | 0,079 |
| Geopolitical Risk | 0,050 | 0,106 |
| Inflation Risk | 0,078 | 0,166 |
| Labor Risk | 0,060 | 0,103 |
| Monetary Policy | 0,058 | 0,086 |
| Oil Risk | 0,049 | 0,096 |
| Political Risk | 0,061 | 0,098 |
| Supply Chain Risk | 0,069 | 0,126 |
| Trade Policy | 0,058 | 0,115 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia en FP32 (125 MB de pesos); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo también se ejecuta correctamente en CPU (el ejemplo de la model card usa `device="cpu"`).
- Compatible con GPUs consumer como RTX 3060, RTX 4090, o incluso hardware integrado.
- Opciones de despliegue: biblioteca `gliclass` con pipeline `ZeroShotClassificationPipeline`, transformers y PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia: no disponible, pero dado el tamaño del modelo (~32M parámetros), la inferencia en CPU debería ser de decenas de milisegundos por pasaje.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Trigou/edge-fin-scorer | ~32M | 8.192 tokens | GLiClass fine-tuned para riesgos financieros | No disponible |
| knowledgator/gliclass-edge-v3.0 (base) | ~32M | 8.192 tokens | GLiClass zero-shot generalista | No disponible |
| Otros modelos de clasificación de riesgos financieros | No disponible | No disponible | No disponible | No disponible |

El modelo se distingue de su base (gliclass-edge-v3.0) por estar especializado en 13 categorías de riesgo financiero con puntuaciones continuas, mientras que la base es un clasificador zero-shot generalista. No se dispone de información suficiente sobre otros modelos comparables en la misma categoría para establecer una comparativa completa.

## Limitaciones y advertencias

- Específico de dominio: entrenado exclusivamente sobre transcripciones de earnings calls; puede perder precisión en otros géneros de texto financiero (informes 10-K, artículos de noticias) sin ajuste adicional.
- Sesgo del profesor: las etiquetas blandas fueron generadas por GPT 4.1 mini, por lo que el modelo hereda los sesgos sistemáticos de ese modelo.
- Categorías desequilibradas: algunas categorías son raras en el conjunto de entrenamiento (Climate Risk con 34 positivos, Equity Market Volatility con 63), lo que produce predicciones más ruidosas en esas áreas.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial.
- Sin cuantizaciones publicadas: no se ofrecen versiones cuantizadas (GGUF, INT8, etc.), lo que limita su despliegue en entornos con restricciones de memoria extremas.
- Etiquetas en inglés: las 13 categorías están definidas en inglés, sin soporte multilingüe documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Trigou/edge-fin-scorer
- Modelo base GLiClass Edge V3.0: https://huggingface.co/knowledgator/gliclass-edge-v3.0
- Repositorio GLiClass: https://github.com/knowledgator/GLiClass
- Paper asociado: "Measuring Directional Firm-level Exposures Using Transformers and Large Language Models" (Thomas Renault y Thomas Rigou, 2025) — sin enlace directo disponible en la información proporcionada.

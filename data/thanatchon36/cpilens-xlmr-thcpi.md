# thanatchon36/cpilens-xlmr-thcpi

## Resumen

cpilens-xlmr-thcpi es un clasificador de texto fine-tuneado a partir de `FacebookAI/xlm-roberta-base` que asigna descripciones de productos a una de las 28 rúbricas del índice de precios al consumo (IPC) de Tailandia (base 2023) o a la clase `OOS` (fuera de alcance). Lo desarrolla Thanatchon Chongmankhong como artefacto de reproducibilidad de su paper *How much does product classification cost in basis points?*, cuyo objetivo no es medir precisión sin más, sino cuantificar el error que la clasificación de productos introduce en la inflación medida, expresado en puntos básicos.

El modelo tiene 278.065.949 parámetros (encoder XLM-R base con cabeza de clasificación), entradas truncadas a 64 tokens y un total de 24.456 especificaciones oficiales en el pool de etiquetas. Es relevante ahora porque publica explícitamente un resultado incómodo: un LLM frontier (Claude Opus 5.5, por prompting) alcanza el 97,9 % de la cesta ponderada por gasto frente al 69,5 % de este encoder, con un RMSE de 8,3 puntos básicos en inflación interanual general frente a 1,9. El modelo se distribuye como baseline local barato (unos 0,09 USD por millón de productos frente a 2.014,73 USD del LLM), no como clasificador recomendado.

La ficha técnica debe leerse con esa advertencia del propio autor: es una herramienta de investigación sobre error de medición en estadística oficial, no un componente listo para producción sin validación sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de secuencia |
| Parametros totales | 278.065.949 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto generativo; las entradas se truncan a 64 tokens durante el entrenamiento |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en precisión original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | tailandés (th) e inglés (en) |
| Licencia | MIT (modelo); datos de entrenamiento con obligaciones ODbL 1.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Encoder XLM-RoBERTa base (transformer bidireccional) con una cabeza de clasificación sobre el token `[CLS]`, ajustado sobre todas las etiquetas oficiales. Hiperparámetros declarados: máximo 4 épocas, batch 64, AdamW con tasa de aprendizaje 3e-5, warm-up lineal con decaimiento, truncado a 64 tokens, pesos de clase proporcionales a la inversa de la raíz cuadrada de la frecuencia de clase y early stopping sobre la pérdida de validación. Una sola ejecución de entrenamiento con semilla 20261027.

El pool de etiquetas oficiales contiene 24.456 especificaciones. La partición retiene subítems completos, de modo que ninguna especificación de test comparte subítem con el conjunto de entrenamiento. Las etiquetas débiles de texto de producto provienen de Open Food Facts y Open Beauty Facts (ODbL 1.0), y las etiquetas oficiales de las especificaciones de recogida de precios publicadas como datos abiertos por el Ministerio de Comercio de Tailandia, compiladas por la TPSO. No se documenta RLHF, DPO ni decodificación especulativa; no es un modelo generativo. El corpus de entrenamiento no se redistribuye: el repositorio publica las etiquetas retenidas como códigos de ítem sin el texto oficial y un `make data` que reconstruye el corpus desde las fuentes con sumas de verificación.

## Capacidades

- Clasificación de texto de producto en 29 clases: 28 ítems del IPC tailandés (códigos TPSO, p. ej. `11320` para leche y lácteos) más `OOS`.
- Manejo de entradas con formato `nombre | marca | cantidad`, con nombres habitualmente en tailandés y ocasionalmente en inglés.
- Multilingüe limitado a th y en, heredado del preentrenamiento de XLM-R base.
- Salida de probabilidades softmax crudas; el paper aplica calibración con una temperatura ajustada sobre un split de validación, implementada en la librería `cpilens`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No es un modelo generativo: no produce texto libre, solo una etiqueta y su puntuación.

## Casos de uso

- Investigación sobre error de medición en estadística de precios: usar el modelo como clasificador de referencia y comparar la inflación simulada con la observada para cuantificar el sesgo en puntos básicos, que es el propósito declarado del paper.
- Baseline local de clasificación de productos en tailandés: ejecutar sobre grandes volúmenes de listados a un coste estimado de 0,09 USD por millón de productos, útil cuando el presupuesto descarta un LLM frontier.
- Reconstrucción y auditoría de pipelines de indexación: clasificar especificaciones de recogida de precios y contrastar la asignación de ítem contra las tablas oficiales de la TPSO.
- Clasificación de catálogos de Open Food Facts y Open Beauty Facts: asignar productos a ítems del IPC para análisis de cestas y estudios de inflación por categoría, aceptando la merma de precisión sobre textos más largos y ruidosos que las especificaciones oficiales.
- Filtrado previo en arquitecturas híbridas: usar el encoder como primera etapa barata y derivar a un LLM solo los casos con baja confianza o etiqueta `OOS`, reduciendo el coste del pipeline.
- Docencia y experimentación con XLM-R fine-tuneado: ejemplo completo y reproducible de ajuste de un encoder multilingüe con desbalanceo de clases, pesos por frecuencia y validación con subítems retenidos.
- Investigación en procesamiento de texto tailandés: punto de comparación para modelos de clasificación en una lengua de bajos recursos, con métricas ponderadas por gasto publicadas.

## Benchmarks y rendimiento

Evaluación sobre 3.910 especificaciones oficiales retenidas publicadas por el Ministerio de Comercio de Tailandia (2.410 dentro de alcance), ponderadas por pesos de gasto del IPC:

| Métrica | Este modelo | Claude Opus 5.5 (prompting) |
|---|---|---|
| Exactitud ponderada por gasto | 69,5 % | 97,9 % |
| Exactitud sobre la lista retenida completa | 87,1 % | 93,8 % |
| Macro-F1 | 59,7 % | 94,4 % |
| Error de inflación interanual general (RMSE, puntos básicos) | 8,3 | 1,9 |
| Error de inflación interanual de alimentación (RMSE, puntos básicos) | 22,3 | 3,2 |

El autor documenta además fallos sistemáticos por ítem: todas las especificaciones retenidas de carne fresca, pescado de agua dulce, pescado procesado y tabaco se clasifican mal (ítems pequeños, con 1 a 17 especificaciones retenidas cada uno), y la mayoría de las especificaciones de cuidado personal caen en `OOS`. El modelo subestimaría la inflación alimentaria tailandesa en todos los meses simulados.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 1,1 GB de pesos más overhead de activaciones; en fp16 alrededor de 0,56 GB.
- Cabe en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090) y en CPU para volúmenes moderados.
- GPU recomendadas para throughput alto: A100, H100 o L4 para servir por lotes; el cuello de botella es el preprocesado de texto, no el modelo.
- Despliegue: `transformers` pipeline, Text Embeddings Inference (tag `text-embeddings-inference` y `endpoints_compatible` en el repo), o exportación a ONNX; no se documentan recetas para vLLM, llama.cpp ni Ollama, y al no ser generativo no encaja en esos servidores.
- Latencia y throughput: no disponibles en la información proporcionada. Con entradas truncadas a 64 tokens y 278 M de parámetros, el coste por ítem es bajo en GPU moderna, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cpilens-xlmr-thcpi | 278 M | 64 tokens (truncado en entrenamiento) | 69,5 % ponderado por gasto; macro-F1 59,7 % | MIT | Hugging Face, 29 descargas |
| Claude Opus 5.5 (prompted) | no disponible | no disponible | 97,9 % ponderado por gasto; macro-F1 94,4 % | propietaria | API comercial |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | no disponible (modelo base sin ajuste a esta tarea) | MIT | Hugging Face |
| Clasificador específico para IPC tailandés alternativo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante del paper es frente al LLM por prompting, no frente a otro encoder: no se documentan baselines de encoders alternativos ajustados a la misma tarea.

## Limitaciones y advertencias

- El propio autor declara que un LLM frontier es muy superior en esta tarea y que este modelo no es el clasificador recomendado; se publica por reproducibilidad y como baseline barato.
- Sesgo medido: subestima la inflación alimentaria tailandesa en todos los meses simulados (RMSE de 22,3 puntos básicos).
- Fallos por ítem: carne fresca, pescado de agua dulce, pescado procesado y tabaco se clasifican mal en su totalidad; la mayoría de cuidado personal va a `OOS`.
- El texto de referencia son especificaciones cortas de la oficina estadística; listados de tienda y de bases de datos son más largos y ruidosos, y la exactitud sobre ellos será menor.
- Las puntuaciones del pipeline son softmax sin calibrar; para uso analítico hay que aplicar la temperatura ajustada que implementa `cpilens`.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de asignación errónea con alta confianza en clases poco frecuentes.
- Licencia MIT para los pesos, con obligaciones ODbL 1.0 derivadas del entrenamiento sobre Open Food Facts y Open Beauty Facts: si se extrae una base de datos derivada, aplican las cláusulas de share-alike de ODbL.
- No redistribuye el corpus de entrenamiento porque las páginas del gobierno tailandés no declaran licencia.
- Uso previsto restringido a investigación y baseline; no debe emplearse para producir estadísticas oficiales sin validación sobre datos propios ni para decisiones sobre personas o empresas.
- Las especificaciones son públicas y pueden haber estado en el preentrenamiento de otros modelos comparados en el paper, lo que puede inflar sus resultados.
- Cobertura lingüística limitada a tailandés e inglés; no se documenta comportamiento en otras lenguas.
- Un solo entrenamiento con una sola semilla (20261027): no hay estimación de varianza entre ejecuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanatchon36/cpilens-xlmr-thcpi
- Paper: https://thanatchon36.github.io/cpilens/paper/
- Repositorio de código, datos y paper: https://github.com/thanatchon36/cpilens
- Fuentes y licencias de datos: https://github.com/thanatchon36/cpilens/blob/main/data/SOURCES.md
- DOI del paper: https://doi.org/10.5281/zenodo.23686886
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Open Food Facts: https://openfoodfacts.org

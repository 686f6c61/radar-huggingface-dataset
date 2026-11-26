# TimZhou/mistr-olmoearth-tiny-pastis

## Resumen

MiSTR OlmoEarth-Tiny PASTIS es un modelo de segmentación semántica de imágenes satelitales en series temporales, especializado en la clasificación de tipos de cultivo (crop-type mapping). Lo desarrolla Tim Zhou y se construye mediante fine-tuning completo del backbone OlmoEarth-v1-Tiny de Ai2, un modelo de observación de la Tierra de aproximadamente 6,44 millones de parámetros. El modelo resuelve un problema concreto: asignar una clase de cultivo a cada píxel de una parcela agrícola a partir de un año de observaciones de Sentinel-2 y Sentinel-1.

La innovación central es la estrategia MiSTR (Mixed Spatiotemporal Resolution), que codifica primero un año completo de imágenes a resolución gruesa (parches de 8 px de compuestos estacionales) y después re-codifica únicamente las zonas inciertas a resolución fina (parches de 4 px de compuestos mensuales) en la estación que el decodificador considera más relevante. Este enfoque adaptativo permite ajustar el coste computacional en tiempo de inferencia mediante un parámetro de presupuesto (budget), sin reentrenar.

El modelo es relevante para la comunidad de teledetección porque demuestra que un backbone pequeño (Tiny) con una selección inteligente de tokens puede alcanzar un rendimiento competitivo en PASTIS-R con un coste de cómputo controlable. Está entrenado sobre PASTIS-R (Garnot et al.), un conjunto de referencia de parcelas agrícolas francesas de octubre de 2018 a septiembre de 2019, con 19 clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone OlmoEarth-v1-Tiny y esquema MiSTR (codificación gruesa + re-codificación fina adaptativa) |
| Parametros totales | 6.437.926 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de 64 x 64 px, 12 meses agrupados en 4 estaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | OlmoEarth Artifact License (license_name: olmoearth-artifact-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone OlmoEarth-v1-Tiny de Ai2, fine-tuneado de extremo a extremo. La entrada son teselas de 64 x 64 píxeles a 10 m de resolución: 10 bandas de Sentinel-2 L2A (B02, B03, B04, B05, B06, B07, B08, B8A, B11, B12, con reflectancia multiplicada por 10.000; B01 y B09 se copian de B02 y B8A siguiendo la evaluación de PASTIS de OlmoEarth), las bandas Sentinel-1 ascendentes VV y VH en dB, y medias mensuales a lo largo de 12 meses agrupadas en cuatro compuestos estacionales de tres meses.

El mecanismo MiSTR opera en dos fases. Primero codifica el año completo a resolución gruesa mediante parches de 8 px de los cuatro compuestos estacionales. A continuación, selecciona las ventanas cuya entropía de la predicción gruesa supera el cuantil (1 - budget) de la distribución de entrenamiento (almacenada en los pesos como `quantiles`), dentro de la estación con mayor puntuación de atención del decodificador, y las re-codifica como tokens de 4 px de compuestos mensuales. El modelo se entrenó con budget 0,5, aunque en inferencia admite presupuestos menores. El entrenamiento usó PASTIS-R con los folds 1-3 para entrenamiento, el fold 4 para validación y el fold 5 para test.

## Capacidades

- Segmentación semántica densa de imágenes satelitales en series temporales (predicción por píxel).
- Clasificación de tipos de cultivo en 19 clases (clase 0 = fondo) sobre parcelas agrícolas.
- Fusión multimodal de Sentinel-2 (óptico) y Sentinel-1 (radar) a lo largo de 12 meses.
- Codificación adaptativa multirresolución con control del coste computacional mediante el parámetro `budget` en tiempo de inferencia.
- Selección automática de ventanas temporales relevantes basada en entropía de predicción y atención del decodificador.
- Inferencia con presupuestos variables (de 0 a 0,5) sin reentrenamiento.
- No dispone de tool calling, capacidades de agente, generación de texto ni procesamiento de lenguaje natural.

## Casos de uso

- Mapeo de tipos de cultivo a escala de parcela: el modelo asigna una clase a cada píxel de teselas de 64 x 64 px a 10 m, adecuado para inventarios agrícolas regionales a partir de series anuales de Sentinel-1 y Sentinel-2.
- Monitorización agrícola con presupuesto de cómputo ajustable: gracias al parámetro `budget`, un operador puede reducir el número de tokens finos (de 1.517 a 164 por tesela) para procesar grandes volúmenes con menor coste, aceptando una caída de mIoU de 57,29 a 52,57.
- Análisis de series temporales multiespectrales: la codificación de 12 meses en cuatro compuestos estacionales permite capturar el ciclo fenológico de los cultivos y distinguir clases con firmas temporales similares.
- Fusión radar-óptico en zonas nubosas: la incorporación de Sentinel-1 (VV, VH) permite mantener capacidad de discriminación cuando la cobertura óptica es limitada, un escenario habitual en el norte de Francia.
- Investigación en eficiencia computacional: el esquema MiSTR sirve como referencia para estudiar la asignación adaptativa de resolución en modelos de observación de la Tierra, comparando curvas de rendimiento frente a presupuesto.
- Prototipado de pipelines de teledetección: la API `MiSTR.from_pretrained(...)` y el método `predict(prepare(...))` facilitan integrar el modelo en flujos de experimentación con datos PASTIS-R o similares.
- Evaluación comparativa de backbones pequeños: al estar construido sobre OlmoEarth-v1-Tiny, permite medir el efecto del fine-tuning y de MiSTR frente a variantes mayores del mismo backbone.

## Benchmarks y rendimiento

Resultados en PASTIS fold 5 (test), según la model card del autor:

| Budget | mIoU test | Tokens finos por tesela (+ 1.024 gruesos) |
|---|---|---|
| 0,5 | 57,29 | 1.517 |
| 0,4 | 56,93 | 1.219 |
| 0,3 | 56,39 | 919 |
| 0,25 | 56,06 | 770 |
| 0,2 | 55,67 | 620 |
| 0,15 | 54,94 | 469 |
| 0,1 | 53,84 | 318 |
| 0,05 | 52,57 | 164 |
| 0 | 50,60 | 0 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 6,44 M de parámetros el peso en fp32 ronda los 26 MB, por lo que el cuello de botella es la activación de tokens y no el tamaño del modelo.
- GPU recomendadas: el autor indica que el modelo funciona en GPU CUDA con `flash-attn`; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño de parámetros cabría en cualquier GPU consumer moderna, pero la dependencia de `flash-attn` y del pipeline MiSTR condiciona el despliegue.
- Opciones de despliegue: la vía documentada es la librería `mistr` (`MiSTR.from_pretrained` y `model.predict`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo de visión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiSTR OlmoEarth-Tiny PASTIS | 6,44 M | 64 x 64 px, 12 meses | Segmentación de cultivos (PASTIS-R) | OlmoEarth Artifact License | Hugging Face (TimZhou) |
| OlmoEarth-v1-Tiny (Ai2) | no disponible en la información | no disponible | Backbone de observación de la Tierra | OlmoEarth Artifact License | Hugging Face (allenai) |
| Otros modelos PASTIS | no disponible | no disponible | Segmentación de cultivos | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos sobre PASTIS fold 5 para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado en una única región (Francia), un único año (octubre 2018 - septiembre 2019) y un único calendario de cultivos; otras regiones, años o conjuntos de etiquetas requieren fine-tuning.
- El rendimiento cae de forma monótona al reducir el budget: de 57,29 mIoU (budget 0,5) a 50,60 (budget 0), por lo que presupuestos bajos implican pérdida de precisión medible.
- Requiere GPU CUDA con `flash-attn`, lo que limita el despliegue en entornos sin esa dependencia.
- Licencia OlmoEarth Artifact License con restricciones de uso (Sección 2): prohibido el uso militar o de defensa (incluida vigilancia humana y policial) y el uso extractivo (perforación, minería, deforestación). Estas restricciones deben transmitirse a los usuarios derivados.
- Obligación de citar a Ai2 como fuente de los artefactos OlmoEarth.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí existe riesgo de predicciones erróneas en píxeles ambiguos o clases poco representadas.
- No se documentan sesgos específicos ni evaluación de equidad; el rendimiento puede variar según la distribución de cultivos del fold de test.
- Sin descargas ni likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimZhou/mistr-olmoearth-tiny-pastis
- Modelo base: https://huggingface.co/allenai/OlmoEarth-v1-Tiny
- Licencia: https://huggingface.co/allenai/OlmoEarth-v1-Tiny/blob/main/LICENSE.txt
- Código y uso (MiSTR): https://github.com/timgzhou/MiSTR

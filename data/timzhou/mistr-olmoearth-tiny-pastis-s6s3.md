# TimZhou/mistr-olmoearth-tiny-pastis-s6s3

## Resumen

MiSTR OlmoEarth-Tiny S6+S3 es un modelo de segmentación semántica de series temporales de imágenes de satélite, especializado en el mapeo de tipos de cultivo sobre el conjunto de datos PASTIS-R. Lo desarrolla Tim G. Zhou (con Fuller, Ma, Pleiss y Shelhamer como coautores del trabajo MiSTR) y afina de extremo a extremo el backbone OlmoEarth-v1-Tiny de Ai2. Resuelve un problema concreto: clasificar parcela a parcela cultivos agrícolas a partir de un año de observaciones Sentinel-2 y Sentinel-1, manteniendo un coste computacional bajo gracias a una estrategia de resolución espacio-temporal mixta.

La innovación central es MiSTR (Mixed Spatiotemporal Resolution): el modelo codifica primero un año completo a resolución gruesa (parches de 6 px de compuestos estacionales) y después vuelve a codificar solo las zonas inciertas a resolución fina (tokens de 3 px de compuestos mensuales), seleccionando estacionalmente dónde y cuándo gastar cómputo. Con 6.335.351 parámetros totales y un repositorio de 0,1 GB, es un modelo deliberadamente pequeño y desplegable en CPU o en cualquier GPU.

Es relevante ahora porque demuestra que un ajuste fino selectivo sobre un backbone de observación de la Tierra de escala Tiny puede alcanzar 61,21 mIoU en test (PASTIS fold 5) con un presupuesto temporal flexible en inferencia, superando a la variante de resolución fija más fina del paper (S6 mensual, 59,0 mIoU) con un coste comparable (193 frente a 182 GMACs a 1,5 estaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone OlmoEarth-v1-Tiny (Ai2) y esquema MiSTR de resolución espacio-temporal mixta; atención FlashAttention 2 si está instalada, si no atención de PyTorch |
| Parametros totales | 6.335.351 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de texto; entrada de 64 x 64 px a 10 m (tile ampliado a 66 px en la rama gruesa: 11 x 11 parches de 6 px), 12 meses agrupados en 4 estaciones |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión, no lingüístico) |
| Licencia | OlmoEarth Artifact License (license_name: olmoearth-artifact-license; license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de OlmoEarth-v1-Tiny y se afina de extremo a extremo para segmentación semántica de parcelas agrícolas. La rama gruesa procesa cuatro compuestos estacionales de 3 meses en parches de 6 px: un tile de 64 px se rellena a 66 px para dar 11 x 11 parches, y cada tile cuesta siempre 1.936 tokens gruesos (4 estaciones x 121 parches x 4 grupos de tokens). La rama fina vuelve a codificar únicamente las ventanas cuya entropía de predicción gruesa supera el cuantil (1 - budget) de la distribución de validación, usando parches de 3 px de compuestos mensuales (cuatro por ventana de 6 px seleccionada).

La selección temporal es explícita: se elige la estación con mayor puntuación de atención del decodificador (seasons=1); una segunda estación, la que más discrepa de la primera según divergencia Jensen-Shannon, se añade en todas las ventanas seleccionadas (seasons=2) o solo en las más inciertas (seasons=1.5), con umbral fijado en budget 0,5. El modelo se entrenó con budget 0,5 y admite budgets menores en inferencia. Los datos de entrenamiento son PASTIS-R (parcelas agrícolas de Francia, octubre de 2018 a septiembre de 2019, 19 clases con clase 0 de fondo), con folds 1-3 para entrenamiento, fold 4 para validación y fold 5 para test. Las entradas son Sentinel-2 L2A con 10 bandas (B02, B03, B04, B05, B06, B07, B08, B8A, B11, B12; B01 y B09 copiadas de B02 y B8A como en la evaluación PASTIS de OlmoEarth) en reflectancia x 10.000, Sentinel-1 ascendente VV y VH en dB, y medias mensuales sobre 12 meses agrupadas en cuatro estaciones. No se documenta en la información disponible el uso de RLHF, DPO ni el volumen exacto de tokens de entrenamiento.

## Capacidades

- Segmentación semántica densa de parcelas agrícolas en 19 clases (clase 0 = fondo) sobre tiles de 64 x 64 px a 10 m.
- Fusión multimodal de Sentinel-2 (10 bandas ópticas) y Sentinel-1 (VV y VH en dB) en series temporales mensuales.
- Razonamiento espacio-temporal adaptativo: decide en inferencia dónde (ventanas inciertas) y cuándo (estaciones) aplicar cómputo de alta resolución.
- Presupuesto temporal flexible en test: budgets de 0 a 0,5 y configuraciones de 1, 1,5 o 2 estaciones por ventana seleccionada.
- Predicción de mapas de clases con salida `out.classes` de forma (H, W).
- Ejecución en CPU o en cualquier GPU, con FlashAttention 2 en GPUs Ampere o superiores (bit-idéntica a los números del paper) y atención de PyTorch como alternativa (misma mIoU con tolerancia de 0,01).
- No soporta tool calling, function calling, agentes, multi-step reasoning ni capacidades multilingües: es un modelo de visión por satélite, no un modelo de lenguaje.

## Casos de uso

- Mapeo de tipos de cultivo a escala regional: clasificar parcelas agrícolas francesas a partir de un año de Sentinel-2 y Sentinel-1, usando `budget=0.5` y `seasons=2` para maximizar mIoU (61,21 en test) cuando el cómputo no es crítico.
- Monitorización agrícola con presupuesto ajustado: desplegar con `budget=0.1` y `seasons=1` para obtener 56,26 mIoU con solo 622 tokens finos por tile, útil en entornos con recursos limitados o procesamiento masivo de tiles.
- Ajuste fino del compromiso precisión-coste en producción: elegir en inferencia entre 1, 1,5 o 2 estaciones según la latencia objetivo, aprovechando que el modelo se entrenó con presupuestos de 1 a 2 estaciones por ventana.
- Prototipado e investigación en observación de la Tierra: el notebook de Colab permite ejecutar el modelo en CPU o en cualquier GPU, lo que facilita la experimentación académica sin infraestructura dedicada.
- Validación de pipelines de segmentación temporal: comparar la rama gruesa sola (`budget=0`, 52,96 mIoU, 0 tokens finos) frente a configuraciones con refinamiento para estudiar el impacto del cómputo adaptativo.
- Base para transferencia a otras regiones o calendarios de cultivo: al ser un modelo Tiny de 6,3 M de parámetros y 0,1 GB, es viable reajustarlo con datos locales para nuevos años, regiones o conjuntos de etiquetas.
- Análisis de incertidumbre espacial: la selección de ventanas por entropía de la predicción gruesa permite identificar parcelas ambiguas y priorizar revisión manual o datos adicionales.

## Benchmarks y rendimiento

Resultados en PASTIS fold 5 (test), según la model card:

| seasons | budget | test mIoU | tokens finos / tile |
|---|---|---|---|
| 2 | 0.5 | 61,21 | 5.666 |
| 2 | 0.4 | 60,76 | 4.555 |
| 2 | 0.3 | 60,09 | 3.437 |
| 1.5 | 0.5 | 60,87 | 4.279 |
| 1.5 | 0.4 | 60,55 | 3.721 |
| 2 o 1.5 | 0.25 | 59,61 | 2.881 |
| 2 o 1.5 | 0.1 | 57,27 | 1.239 |
| 1 | 0.5 | 58,96 | 2.843 |
| 1 | 0.25 | 57,99 | 1.445 |
| 1 | 0.1 | 56,26 | 622 |
| cualquiera | 0 | 52,96 | 0 |

Cada tile cuesta siempre 1.936 tokens gruesos. Los resultados corresponden a la semilla 1 de tres; en el paper se reporta 60,9 ± 0,2 mIoU (2 estaciones) y 60,6 ± 0,1 mIoU (1,5 estaciones) sobre las tres semillas. La variante de resolución fija más fina del paper (OlmoEarth-Tiny S6 mensual) alcanza 59,0 mIoU a 182 GMACs, frente a 60,6 mIoU a 193 GMACs de este modelo con 1,5 estaciones.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 6,3 M de parámetros y pesos en safetensors de 0,1 GB, la huella es mínima y cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU; FlashAttention 2 requiere Ampere o superior (por ejemplo, RTX 3090, RTX 4090, A100, H100) para la ruta acelerada bit-idéntica al paper. En GPUs anteriores o en CPU se usa la atención de PyTorch con la misma mIoU dentro de 0,01.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual; también se ejecuta en CPU según el notebook de inicio rápido.
- Opciones de despliegue: paquete `mistr` de Python (`MiSTR.from_pretrained` y `prepare`), con soporte de FlashAttention 2 opcional; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. El coste computacional se reporta en GMACs (193 GMACs con 1,5 estaciones y budget 0,5; 182 GMACs para la variante fija S6 mensual del paper).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU test (PASTIS fold 5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiSTR OlmoEarth-Tiny S6+S3 (este) | 6.335.351 | Tile 64 px a 10 m, 12 meses en 4 estaciones, presupuesto flexible | 61,21 (2 est., budget 0,5); 60,6 (1,5 est.) | OlmoEarth Artifact License | Hugging Face + código en GitHub |
| MiSTR OlmoEarth-Tiny S8+S4 | No disponible | Misma entrada, configuración S8+S4 | 57,3 | OlmoEarth Artifact License | Hugging Face |
| OlmoEarth-Tiny S6 mensual (resolución fija, paper) | No disponible | Resolución fija mensual | 59,0 (182 GMACs) | OlmoEarth Artifact License | Según paper |
| OlmoEarth-v1-Tiny (base) | No disponible | Backbone de observación de la Tierra | No disponible como tal en PASTIS | OlmoEarth Artifact License | Hugging Face (allenai) |

## Limitaciones y advertencias

- Entrenado en una sola región (Francia), un solo año (octubre de 2018 a septiembre de 2019) y un único calendario de cultivo; otras regiones, años o conjuntos de etiquetas requieren ajuste fino.
- El conjunto de clases es fijo (19 clases de PASTIS-R con clase 0 de fondo); no cubre tipos de cultivo fuera de ese esquema.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de predicciones erróneas en parcelas ambiguas o con cobertura nubosa; la rama gruesa con `budget=0` baja a 52,96 mIoU.
- La licencia OlmoEarth Artifact License impone restricciones de uso (sección 2) que deben transmitirse: prohibido uso militar o de defensa (incluida vigilancia humana y policial) y uso extractivo (perforación, minería, deforestación). Es obligatorio citar a Ai2 como fuente de los artefactos OlmoEarth.
- Los resultados reportados corresponden a la semilla 1 de tres; la variabilidad entre semillas es de ±0,2 (2 estaciones) y ±0,1 (1,5 estaciones) mIoU.
- El umbral `quantiles_x` se fijó en budget 0,5; con budgets de 0,25 o menos, todas las ventanas seleccionadas lo superan y las configuraciones de 1,5 y 2 estaciones coinciden.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües.
- Los datos de demo (`demo/`) son PASTIS-R bajo CC BY 4.0, con condiciones distintas a las de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimZhou/mistr-olmoearth-tiny-pastis-s6s3
- Modelo base OlmoEarth-v1-Tiny: https://huggingface.co/allenai/OlmoEarth-v1-Tiny
- Licencia OlmoEarth Artifact License: https://huggingface.co/allenai/OlmoEarth-v1-Tiny/blob/main/LICENSE.txt
- Código y uso (GitHub): https://github.com/timgzhou/MiSTR
- Notebook de inicio rápido en Colab: https://colab.research.google.com/github/timgzhou/MiSTR/blob/main/notebooks/mistr_quickstart.ipynb
- Variante S8+S4 (menor y más barata): https://huggingface.co/TimZhou/mistr-olmoearth-tiny-pastis
- Cita del paper (BibTeX en la model card): Zhou, Tim G.; Fuller, Anthony; Ma, Avery; Pleiss, Geoff; Shelhamer, Evan. "MiSTR: Adaptively Mixing Spatiotemporal Resolution for Satellite Image Time Series", 2026.

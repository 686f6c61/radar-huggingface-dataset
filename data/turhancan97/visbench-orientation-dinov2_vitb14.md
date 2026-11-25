# turhancan97/visbench-orientation-dinov2_vitb14

## Resumen

`visbench-orientation-dinov2_vitb14` no es un modelo generativo ni un backbone de vision, sino una **cabeza de sondeo (probe head) lineal** entrenada por el usuario de Hugging Face `turhancan97` dentro del marco VisBench. Su funcion es medir que informacion sobre la orientacion de estructuras contiene el espacio de caracteristicas de un backbone concreto: en este caso, `dinov2_vitb14` (DINOv2 ViT-B/14, 86 millones de parametros, parche de 14x14 y resolucion de 224 px). El modulo se ajusta sobre caracteristicas congeladas del backbone, de modo que nunca se modifica el modelo base.

La relevancia de este artefacto es metodologica: forma parte de una familia de sondas que permiten cuantificar propiedades de bajo nivel (orientacion, estructura de tensores) en representaciones visuales auto-supervisadas, sin reentrenar el backbone. El resultado se expresa en metricas de error angular y RMSE, con un techo (`ceiling`) que marca el limite alcanzable por una cabeza lineal sobre esas caracteristicas.

El repositorio tiene un tamano practicamente nulo (0.0 GB) y cero descargas o likes en el momento de la consulta, lo que refleja que es un artefacto de investigacion mas que un modelo de proposito general. No esta pensado para inferencia directa sobre imagenes, sino para cargarse mediante la libreria `visbench` junto al backbone exacto con el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza lineal (probe) sobre caracteristicas congeladas de DINOv2 ViT-B/14 |
| Parametros totales | No disponible (cabeza lineal con `hidden_dim` 512 sobre features de ViT-B/14; el backbone tiene 86 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de 224x224 px en el backbone) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | No disponible (pesos gestionados por `visbench.hub`; el repo ocupa 0.0 GB) |

## Arquitectura y entrenamiento

La sonda es una cabeza lineal (`head: linear`) con `hidden_dim` 512 que se aplica sobre caracteristicas de DINOv2 ViT-B/14 extraidas con `pooling=mean` y `feature_mode=dense_only`. La activacion es `l2_normalize` y la perdida empleada es `coherence_weighted_angular`, una funcion de perdida angular ponderada por coherencia, adecuada para tareas de regresion de orientacion. El backbone permanece congelado durante todo el ajuste.

El protocolo de entrenamiento es `visbench_structure_tensor_orientation_regression`, con 10 epocas, `batch_size` 8, optimizador AdamW, `lr` 0.0005, `weight_decay` 0.0001 y 1.5 epocas de calentamiento. La clave del backbone (`dinov2/dinov2_vitb14/224/7764ea0f912e`) identifica de forma univoca la configuracion de extraccion de caracteristicas; la libreria rechaza cargar la sonda contra cualquier otro backbone o pooling, porque el fallo seria silencioso (formas compatibles pero resultados incorrectos). No se documenta el volumen ni la composicion del dataset de ajuste.

## Capacidades

- Regresion de orientacion de estructuras a partir de caracteristicas densas de DINOv2 ViT-B/14.
- Proporciona metricas de evaluacion de representaciones: `orientation_error`, `rmse`, `median`, `d1` y `d2`, junto con sus techos (`ceiling_*`).
- Integracion con la libreria `visbench` mediante `load_probe_from_hub`.
- No genera texto, no responde a prompts y no procesa lenguaje natural.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision generativa, audio ni multimodalidad de salida.

## Casos de uso

- Auditoria de representaciones auto-supervisadas: cargar la sonda sobre `dinov2_vitb14` y medir cuanto de la orientacion de estructuras capturan sus caracteristicas, comparando con el techo (`ceiling_orientation_error` 11.0211 frente a `orientation_error` 24.5673).
- Comparacion de backbones en investigacion: usar la misma sonda y protocolo para contrastar DINOv2 ViT-B/14 con otros backbones y decidir cual preserva mejor informacion geometrica de bajo nivel.
- Validacion de pipelines de extraccion de features: verificar que el pooling (`mean`) y el `feature_mode` (`dense_only`) configurados en produccion coinciden con los del ajuste, evitando derivas silenciosas en las metricas.
- Reproducibilidad de experimentos: el repositorio documenta hiperparametros completos (epocas, lr, perdida, warmup), lo que permite reajustar la sonda y contrastar resultados.
- Docencia y formacion: ejemplo minimo y autocontenido de probing lineal en vision por computador, con carga via `visbench.hub`.
- Construccion de benchmarks internos: incorporar esta sonda como una de las tareas de bajo nivel de una bateria de evaluacion de modelos visuales.
- Analisis de sensibilidad a la resolucion: dado que el backbone opera a 224 px, sirve para estudiar como afecta la resolucion a la informacion de orientacion recuperable.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `ceiling_d1` | 0.7321 |
| `ceiling_d2` | 0.8652 |
| `ceiling_median` | 4.7792 |
| `ceiling_orientation_error` | 11.0211 |
| `ceiling_rmse` | 19.7928 |
| `d1` | 0.4649 |
| `d2` | 0.6313 |
| `median` | 13.7695 |
| `orientation_error` | 24.5673 |
| `rmse` | 35.5482 |

Los valores `ceiling_*` representan el limite alcanzable con una cabeza lineal sobre las caracteristicas del backbone; los valores sin prefijo son los obtenidos por esta sonda. La brecha entre ambos (por ejemplo, 24.5673 frente a 11.0211 en error de orientacion) indica margen de mejora en la sonda o en la representacion. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el backbone DINOv2 ViT-B/14 (86 M de parametros) requiere aproximadamente 350 MB en fp32 y unos 175 MB en fp16, mas la cabeza lineal, cuyo tamano no se detalla.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para el backbone a 224 px; A100, H100, RTX 4090 o RTX 3090 quedan sobredimensionadas para esta carga.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna (GTX 1660, RTX 3060, RTX 4060 y superiores).
- Opciones de despliegue: la via documentada es la libreria `visbench` (`get_backbone` y `load_probe_from_hub`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `visbench-orientation-dinov2_vitb14` | Sonda lineal sobre DINOv2 ViT-B/14 | No disponible (backbone 86 M) | 224x224 px | No disponible | Hugging Face (`turhancan97`) |
| DINOv2 ViT-B/14 | Backbone auto-supervisado | 86 M | 224x224 px | No disponible en la informacion | Ampliamente disponible |
| Otras sondas VisBench del mismo autor | Sondas lineales sobre distintos backbones | No disponible | No disponible | No disponible | Hugging Face (`turhancan97`) |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Solo funciona con el backbone `dinov2_vitb14` y con `pooling=mean` y `feature_mode=dense_only`; cualquier otra configuracion es rechazada o produce resultados incorrectos.
- No es un modelo de proposito general: no genera texto ni imagenes y no debe usarse como clasificador o extractor autonomo.
- El error de orientacion obtenido (24.5673) esta lejos del techo (11.0211), lo que limita su utilidad como estimador preciso.
- No se documenta la licencia, por lo que el uso comercial queda sin garantias explicitas.
- No se documenta el dataset de ajuste, lo que impide evaluar sesgos de dominio o de composicion.
- Riesgo de sobreinterpretacion: una sonda lineal mide informacion linealmente decodificable, no la informacion total del backbone.
- El repositorio no tiene descargas ni likes y su tamano es 0.0 GB, lo que sugiere ausencia de validacion externa.
- No hay soporte documentado para despliegue en servidores de inferencia estandar.

## Enlaces

- Hugging Face: https://huggingface.co/turhancan97/visbench-orientation-dinov2_vitb14
- Repositorio VisBench: https://github.com/turhancan97/VisBench

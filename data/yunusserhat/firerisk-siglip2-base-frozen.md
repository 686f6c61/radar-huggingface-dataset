# yunusserhat/firerisk-siglip2-base-frozen

## Resumen

FireRisk SigLIP2 ViT-B/16 frozen es un clasificador de imágenes aéreas desarrollado por el usuario yunusserhat. Asigna una de siete etiquetas de peligro derivadas del dataset FireRisk a una imagen RGB, apoyándose en el codificador de imagen SigLIP2 ViT-B/16 de timm y en la envoltura de clasificación de FireRisk Bench. El checkpoint es un "encoder probe": el backbone permanece congelado y solo se entrenan 6.919 parámetros, fundamentalmente la cabeza de clasificación, sobre los 92,89 millones de parámetros totales del modelo.

Es relevante por su planteamiento metodológico más que por su rendimiento bruto: sirve como referencia reproducible para investigar la adaptación de bajo coste de un codificador visual preentrenado a tareas de teledetección con clases de peligro aéreo. El dataset utilizado no es el split original del artículo de FireRisk, sino una partición propia a nivel de imagen (49.231 entrenamiento, 10.552 validación y 10.548 prueba) con semilla 2026, lo que permite auditar duplicados y trazabilidad.

Se trata de pesos de desarrollo iniciales (semilla 42, época 7), con métricas de validación modestas (accuracy 55,95 %, macro F1 50,19 %) y sin evaluación sobre la partición de prueba. No es un detector de incendios activos y sus probabilidades no representan riesgo calibrado de ocurrencia futura de incendio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16, SigLIP2) con encoder congelado y sonda de clasificacion entrenable |
| Parametros totales | 92.891.143 |
| Parametros activos | No aplica (no es MoE). Parametros entrenables: 6.919 |
| Longitud de contexto | No aplica (clasificador de imagen; entrada fija de 224 px) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; solo checkpoint PyTorch) |
| Idiomas soportados | en (idioma declarado; etiquetas en ingles) |
| Licencia | GPL-3.0 (fine-tuning y clasificador); backbone original bajo Apache 2.0 |
| Formato de pesos | PyTorch (best.pt, cargado con torch.load(..., weights_only=True)); sin AutoModel ni pipeline de Transformers |

## Arquitectura y entrenamiento

El modelo es un clasificador de imagen construido sobre el backbone `timm/vit_base_patch16_siglip_224.v2_webli` (revision `4c3661e5ac879a276ddc5ddc6d3f0ecc78fd5d82`). Se trata de un ViT-B/16, es decir, un transformer de visión de ~86M parámetros en el tronco, con parches de 16x16 sobre entradas RGB de 224 píxeles. La configuración "frozen" mantiene intacto el codificador preentrenado y entrena únicamente una cabeza de clasificación (6.919 parámetros entrenables de un total de 92.891.143). La arquitectura de inferencia es la `VisionClassifier` de FireRisk Bench, no un `AutoModel` estándar.

Los datos provienen del espejo de `blanchon/FireRisk` (revision `234b2e7fe6be2da773472e83bd4d42cc9815a630`), que contiene 70.331 imágenes y solo la partición de entrenamiento original. Sobre esa base se definió una nueva partición a nivel de imagen con 49.231 ejemplos de entrenamiento, 10.552 de validación y 10.548 de prueba, con semilla de split 2026 y hash `0ab5619091f80f73f8229634a38194ad31eeddf9dfe70978d1b664fe8fb598cd`. La auditoría de duplicados de píxel encontró 0 filas exactamente duplicadas. El checkpoint seleccionado corresponde a la época 7, elegido por macro F1 en validación. Se ajustó una temperatura de calibración sobre los logits de validación (guardada en `calibration.json`), que la CLI emplea para la salida de probabilidad. No hay commit de Git recuperable del entrenamiento: se usó un árbol de trabajo sucio, y los resultados son de una única semilla.

## Capacidades

- Clasificacion multiclase de imagenes aereas RGB en siete etiquetas de peligro derivadas de las clases del dataset FireRisk.
- Inferencia sobre entradas de 224 píxeles con normalizacion, politica de redimensionado y aumentos definidos en `preprocessing.json`.
- Salida de probabilidades calibradas mediante temperatura ajustada en validacion (a traves de la CLI de FireRisk Bench).
- Mapeo de clases persistido en `labels.json` y `summary.json`, con orden reproducible.
- Metricas de validacion detalladas (`validation_metrics.json`): puntuaciones por clase, matrices de confusion e intervalos bootstrap exploratorios.
- Capacidad de clasificacion en CPU o GPU mediante la CLI `firerisk predict`.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales de vision-lenguaje.
- No es multilingue: el modelo opera sobre imagenes; el idioma declarado es en.

## Casos de uso

- Investigacion en clasificacion de peligro aereo derivada de WHP: el modelo sirve como baseline reproducible para estudiar la adaptacion de encoders visuales preentrenados a clases de riesgo, dado que publica split, hash, semilla y calibracion.
- Etiquetado asistido de imagenes aereas en proyectos de teledeteccion: se puede usar para preetiquetar grandes volumenes de imagenes RGB de 224 px antes de una revision humana, aprovechando su coste computacional bajo.
- Evaluacion de estrategias de fine-tuning congelado frente a ajuste completo: al exponer solo 6.919 parametros entrenables, permite comparar la "sonda lineal" contra recetas con backbone descongelado en igualdad de condiciones de datos.
- Prototipado de pipelines de clasificacion de imagenes geoespaciales: al cargar en CPU o GPU consumer, es util para validar arquitecturas y flujos de preprocesado antes de escalar a modelos mayores.
- Docencia y formacion en vision por computador aplicada: su tamano reducido y su checkpoint compacto permiten reproducir el flujo completo de carga, inferencia y lectura de metricas en un portatil.
- Auditoria de trazabilidad de modelos: los ficheros `provenance.json`, `SHA256SUMS`, `config.json` y `calibration.json` lo convierten en un ejemplo practico de publicacion con procedencia verificable.
- Analisis de calibracion de probabilidades: la temperatura ajustada sobre logits de validacion permite estudiar el efecto de la calibracion en un clasificador de teledeteccion con clases desbalanceadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta metricas de validacion internas, y advierte que esa particion se uso tanto para seleccionar el checkpoint como para ajustar la temperatura, por lo que no estiman rendimiento independiente. La particion de prueba no ha sido evaluada.

| Metrica de validacion | Valor |
|---|---:|
| Accuracy | 55,95 % |
| Macro F1 | 50,19 % |
| Balanced accuracy | 49,89 % |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 372 MB en fp32, 186 MB en fp16 y 93 MB en int8, segun los 92,89M parametros totales (mas memoria para activaciones, que es minima con lote pequeno a 224 px).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4090 o T4 lo ejecutan con holgura. A100 o H100 estan sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida. El repositorio documenta una instalacion especifica para CPU en `docs/installation.md`.
- Opciones de despliegue: la via oficial es la CLI de FireRisk Bench (`firerisk predict`) con la arquitectura `VisionClassifier`. No hay soporte para vLLM, TGI, Ollama ni llama.cpp, ya que no es un modelo generativo. La carga se hace con `torch.load(..., weights_only=True)`.
- Nota de dependencia: en la primera carga se descarga el backbone pineado `timm/vit_base_patch16_siglip_224.v2_webli`, incluso en la release completa; las cargas posteriores pueden reutilizar la cache.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables para este modelo en la informacion proporcionada. La tabla siguiente compara caracteristicas estructurales verificables.

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yunusserhat/firerisk-siglip2-base-frozen | 92,89M (6.919 entrenables) | 224x224 px | Clasificacion de 7 clases de peligro aereo | GPL-3.0 (backbone Apache 2.0) | HuggingFace + FireRisk Bench |
| timm/vit_base_patch16_siglip_224.v2_webli | ~86M | 224x224 px | Encoder imagen-texto SigLIP2 (zero-shot/generico) | Apache 2.0 | timm / HuggingFace |
| google/vit-base-patch16-224 | ~86M | 224x224 px | Clasificacion ImageNet-1k (1.000 clases) | Apache 2.0 | Transformers |
| ResNet-50 (torchvision) | ~25,6M | 224x224 px | Clasificacion ImageNet-1k (1.000 clases) | BSD-3 | torchvision |

La comparacion con clasificadores de teledeteccion especificos de incendios no esta disponible por falta de datos en la informacion proporcionada.

## Limitaciones y advertencias

- Metricas modestas: accuracy de validacion 55,95 %, macro F1 50,19 % y balanced accuracy 49,89 %, practicamente al nivel del azar en balanced accuracy para siete clases.
- Riesgo de alucinacion: en un clasificador no aplica la generacion libre, pero si hay riesgo de falsos positivos y negativos con alta confianza; las probabilidades no estan validadas como calibradas frente a ocurrencia real de incendio.
- La particion de prueba no ha sido evaluada: las cifras publicadas provienen de la misma validacion usada para seleccionar el checkpoint y ajustar la temperatura, lo que introduce optimismo.
- Resultados de una sola semilla (42): no se establece variacion entre semillas de entrenamiento.
- No es un detector de incendios activos y no debe usarse para alerta operativa.
- El espejo del dataset carece de coordenadas, marcas temporales e identificadores de escena, por lo que no se ha demostrado transferencia geografica ni temporal.
- La auditoria de duplicados solo cubre coincidencias exactas de pixel; no se descartan imagenes cercanas o solapadas entre particiones.
- Ambiguedad de etiquetas, cambios en la adquisicion de imagenes y posible solapamiento desconocido con el preentrenamiento limitan la interpretacion.
- Licencia GPL-3.0 para el fine-tuning y el clasificador: es una licencia copyleft, relevante si se integra en productos propietarios. El backbone original conserva Apache 2.0 con atribucion.
- La tarjeta del dataset lista su licencia como desconocida; ni el codigo ni la release del modelo licencian las imagenes de entrenamiento.
- El checkpoint no redistribuye los pesos del backbone congelado; la primera carga descarga el backbone pineado.
- Sin soporte de `AutoModel` ni `pipeline` de Transformers: la integracion exige la envoltura `VisionClassifier` de FireRisk Bench o una reimplementacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yunusserhat/firerisk-siglip2-base-frozen
- Repositorio FireRisk Bench: https://github.com/yunusserhat/firerisk
- Documentacion de instalacion (incluye CPU): https://github.com/yunusserhat/firerisk/blob/main/docs/installation.md
- Modelo base en timm/HuggingFace: https://huggingface.co/timm/vit_base_patch16_siglip_224.v2_webli
- Dataset: https://huggingface.co/datasets/blanchon/FireRisk

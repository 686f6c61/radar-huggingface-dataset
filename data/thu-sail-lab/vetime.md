# thu-sail-lab/VETime

## Resumen

VETime es un framework de deteccion de anomalias en series temporales en regimen zero-shot desarrollado por el SAIL Lab (Superintelligence and Industrial Lab) del Departamento de Ingenieria Industrial de la Universidad de Tsinghua. El modelo aborda el compromiso clasico entre la localizacion temporal de grano fino (anomalias puntuales) y la comprension de patrones globales (anomalias contextuales de largo alcance) mediante la alineacion de representaciones temporales y visuales y la fusion dinamica de ambas modalidades. El trabajo fue aceptado en NeurIPS 2026.

La innovacion central consiste en convertir la serie temporal en una representacion visual que preserva la correspondencia temporal, alinear los parches visuales con la linea temporal original, aplicar aprendizaje contrastivo sobre ventanas anomales y fusionar de forma adaptativa las caracteristicas temporales y visuales. El repositorio de Hugging Face distribuye codigo fuente y utilidades de evaluacion bajo licencia Apache 2.0; los pesos preentrenados se alojan en un repositorio separado.

Es relevante porque propone un enfoque multimodal (vision + serie temporal) para deteccion de anomalias sin entrenamiento especifico por dominio, evaluado sobre el benchmark TSB-AD en sus variantes univariante (TSB-AD-U) y multivariante (TSB-AD-M). No es un modelo de lenguaje: es un modelo de vision y series temporales, por lo que las secciones de capacidades linguisticas, tool calling y agentes no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal vision + serie temporal: encoder visual (MAE ViT-Base, `mae_visualize_base.pth`) + encoder temporal, con modulo de alineacion y fusion visual-temporal (VTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de serie temporal; longitud no especificada) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch, `.pth`) |
| Idiomas soportados | no aplica (modelo no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pth` (`VETime.pth`, `mae_visualize_base.pth`) |

## Arquitectura y entrenamiento

VETime es un framework multimodal compuesto por cuatro modulos: (1) conversion trazable de serie temporal a imagen, que preserva la correspondencia temporal entre pixeles y marcas de tiempo; (2) alineacion temporal a nivel de parche, que empareja los parches visuales con la linea temporal original; (3) aprendizaje contrastivo de ventanas anomales, que separa ventanas normales de anomalas; y (4) fusion multimodal adaptativa a la tarea, que combina caracteristicas temporales y visuales para localizar anomalias. El encoder visual es un MAE ViT-Base; el encoder temporal se implementa en `model/TS_encoder/`.

El modelo se disena para evaluacion zero-shot sobre el benchmark TSB-AD. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset de preentrenamiento ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio). Los pesos preentrenados se distribuyen por separado en el repositorio `yyyang0/VETime-checkpoints`, fijados a la revision `2aba27af38b6beb4174c2616e40a5db5e1c90198`. El entorno de referencia es Python 3.11, PyTorch 2.3.0 y CUDA 12.1.

## Capacidades

- Deteccion de anomalias puntuales en series temporales univariantes y multivariantes.
- Deteccion de anomalias contextuales de largo alcance mediante comprension de patrones globales.
- Operacion en regimen zero-shot sobre dominios no vistos, sin reentrenamiento especifico.
- Localizacion temporal de anomalias (no solo clasificacion binaria de la serie).
- Conversion trazable de series temporales a representaciones visuales con correspondencia temporal preservada.
- Fusion adaptativa de modalidades temporal y visual segun la tarea.
- Evaluacion integrada sobre el benchmark TSB-AD (variantes U y M).
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Monitorizacion de infraestructura IT: deteccion zero-shot de picos y desviaciones contextuales en metricas de CPU, latencia o trafico sin etiquetado por servicio, aprovechando la fusion temporal-visual para capturar tanto spikes puntuales como degradaciones progresivas.
- Mantenimiento predictivo industrial: identificacion de anomalias en sensores de maquinaria (vibracion, temperatura, presion) en escenarios multivariantes TSB-AD-M, donde el modelo detecta correlaciones anomalas entre sensores sin entrenamiento por equipo.
- Deteccion de fraude en transacciones: localizacion de patrones anomalos en series de actividad transaccional, combinando la vision de conjunto (volumen agregado) con la granularidad temporal (transacciones individuales).
- Monitorizacion de salud y wearables: analisis de series fisiologicas (ritmo cardiaco, actividad) para detectar episodios anomalos sin datos etiquetados del paciente concreto, gracias al regimen zero-shot.
- Observabilidad de sistemas distribuidos: integracion en pipelines de telemetria para marcar ventanas anomales en metricas de multiples servicios, usando el protocolo de prediccion fijo documentado en `evaluation/README.md`.
- Investigacion en deteccion de anomalias: banco de comparacion reproducible contra lineas base incluidas en `dataset/TSB-AD-main/models/`, con metricas y utilidades de evaluacion empaquetadas.
- Analisis de series energeticas: deteccion de consumos anomalos en contadores inteligentes, donde la representacion visual facilita capturar estacionalidades y cambios de regimen que los metodos puramente temporales pasan por alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que esta actualizacion no incluye nuevas puntuaciones de benchmark ni afirmaciones de reproduccion del paper; el articulo esta en arXiv:2602.16681.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El encoder visual es un ViT-Base (MAE), lo que situa el requisito en el orden de pocos GB, pero el total del framework no se especifica.
- GPU recomendadas: no disponible de forma explicita. El pipeline de benchmark upstream requiere entorno con CUDA; se documenta CUDA 12.1 y `--device cuda:0`.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por el tamano del encoder visual (ViT-Base) es plausible en GPUs de consumo con VRAM suficiente, pero no se aporta dato oficial.
- Opciones de despliegue: ejecucion nativa con PyTorch 2.3.0+ (`Test_TSB.py`, `train.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. El Space online es una demo ligera que no ejecuta el benchmark TSB-AD completo.

## Comparativa con modelos similares

| Modelo | Categoria | Enfoque | Zero-shot | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VETime | Deteccion de anomalias en series temporales | Multimodal vision + temporal | Si | TSB-AD-U / TSB-AD-M | Apache 2.0 | Codigo en HF + pesos en repo separado |
| Lineas base TSB-AD | Deteccion de anomalias en series temporales | Multiples (temporales, estadisticos) | Variable | TSB-AD | Segun cada modelo | Incluidas en `dataset/TSB-AD-main/models/` |
| Alternativas multimodales zero-shot | Deteccion de anomalias en series temporales | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye resultados numericos de VETime frente a las lineas base, por lo que no es posible una comparacion cuantitativa. El repositorio empaqueta el codigo de evaluacion TSB-AD y las lineas base para permitir la comparacion reproducible por parte del usuario.

## Limitaciones y advertencias

- No se han publicado puntuaciones de benchmark en la informacion disponible; no deben asumirse resultados del paper sin reproducirlos.
- El repositorio de Hugging Face contiene codigo y utilidades de evaluacion, no los pesos; es necesario descargar los checkpoints de `yyyang0/VETime-checkpoints` en la revision indicada.
- El benchmark TSB-AD debe descargarse por separado desde thedatum.org; sin el no se puede ejecutar la evaluacion.
- El Space online es una demo ligera que no ejecuta el benchmark completo; no sirve para validar rendimiento en produccion.
- Al ser un modelo zero-shot, el rendimiento puede degradarse en dominios muy alejados de la distribucion de entrenamiento; no se documentan analisis de robustez por dominio.
- Riesgo de falsos positivos y negativos en la localizacion de anomalias: no se aportan tasas de error ni curvas ROC/PR en la informacion disponible.
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre datos de benchmark industriales puede heredar sesgos de esos conjuntos.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets TSB-AD y del encoder MAE subyacente antes de un despliegue productivo.
- No es un modelo linguistico: no soporta texto, tool calling ni agentes; cualquier uso conversacional queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thu-sail-lab/VETime
- Pesos preentrenados: https://huggingface.co/yyyang0/VETime-checkpoints
- Demo interactiva (Space): https://huggingface.co/spaces/thu-sail-lab/VETime
- Codigo fuente en GitHub: https://github.com/yyyangcoder/VETime
- Guia de evaluacion: https://github.com/yyyangcoder/VETime/blob/main/evaluation/README.md
- Paper en arXiv: https://arxiv.org/abs/2602.16681
- Dataset TSB-AD-U: https://www.thedatum.org/datasets/TSB-AD-U.zip
- Dataset TSB-AD-M: https://www.thedatum.org/datasets/TSB-AD-M.zip
- SAIL Lab (Tsinghua University): https://thu-sail-lab.github.io/home/
- Perfil de la organizacion en Hugging Face: https://huggingface.co/thu-sail-lab/models

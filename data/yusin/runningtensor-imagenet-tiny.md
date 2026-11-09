# Yusin/runningtensor-imagenet-tiny

## Resumen

RunningTensor es una familia de pesos de clasificación de imágenes publicada por el usuario Yusin en Hugging Face, entrenada sobre ImageNet-1k con una receta unificada. El repositorio no contiene un único modelo, sino siete directorios que corresponden a cada fila de la tabla comparativa del autor: el backbone propuesto (RunningTensor, en variantes `rt-cumulative-gate`, `rt-as-published`, `rt-legacy-wrapper` y `rt-conconlyc`) y tres líneas base de atención lineal de tiempo lineal (`vim`, `gated-deltanet`, `vil-longhorn`). Todos comparten una carcasa ViT-Tiny de anchura 192 y un presupuesto de parámetros en torno a los 7 millones.

El objetivo declarado es comparar de forma controlada arquitecturas de atención lineal y modelos de espacio de estados aplicados a visión, bajo un mismo recetario de entrenamiento (300 épocas, batch global 1024, LR pico 1e-3 con coseno hasta 1e-5, weight decay 0.1, sin drop_path). La variante `rt-cumulative-gate` alcanza 76,10 % top-1 y 92,96 % top-5 en la partición de validación de ImageNet-1k (50.000 imágenes), superando ligeramente a las tres líneas base publicadas.

Es relevante ahora porque ofrece una comparación reproducible y con pesos abiertos (Apache 2.0) de alternativas de tiempo lineal a la atención cuadrática en visión, con la diferencia clave entre `rt-cumulative-gate` y `rt-as-published` documentada explícitamente: sumar la puerta de olvido `g` a lo largo de la secuencia (como en GLA) aporta +0,72 puntos de top-1 y es lo que sitúa a la arquitectura por delante de las líneas base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer Tiny (anchura 192) con backbone RunningTensor de atención lineal / espacio de estados; se incluyen también variantes ViM, Gated DeltaNet y ViL-Longhorn |
| Parametros totales | 7.081.096 (`rt-cumulative-gate` y `rt-as-published`); 7.148.008 (`vim`); 7.168.192 (`gated-deltanet`); 6.853.096 (`vil-longhorn`); 7.144.060 (`rt-legacy-wrapper`); 5.049.004 (`rt-conconlyc`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clasificación de imágenes; resolución de entrada no especificada en la información) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en PyTorch `.pth`) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pth` (`final.pth` con `model` y `model_ema`; sin estado del optimizador) |

## Arquitectura y entrenamiento

La carcasa es un ViT-Tiny con anchura 192 y parches de 16×16 sobre 224×224, según el comando de evaluación (`stmlm_tiny_patch16_224`). El backbone RunningTensor sustituye la atención estándar por un mecanismo de atención lineal con puerta de olvido tipo GLA; la cadena de notas del autor (`stmgatetype:logsigmoid`, `stmgouttime`, `stmgateclamp:-0.31`, `stmdk:12`, `stmdu:12`, `stmdv:48`, `stmfla`, `stmvitgcumsum`, `stmvitbidir:sum`, `tsarch:rtfla4_v42`) describe la configuración exacta del bloque. La diferencia entre `rt-cumulative-gate` y `rt-as-published` es únicamente si la puerta `g` se suma a lo largo de la secuencia (cumsum), lo que aporta +0,72 puntos de top-1.

El entrenamiento es idéntico para las siete variantes: 300 épocas sobre ImageNet-1k (1.244.160 imágenes por época), batch global 1024, LR pico 1e-3 con decaimiento coseno hasta 1e-5, weight decay 0.1 y drop_path 0. No se menciona uso de RLHF, DPO ni ajuste fino posterior; son modelos de clasificación supervisada puros. El repositorio incluye `log.txt` con un objeto JSON por época (pérdida de entrenamiento, pérdida de validación, top-1, top-5 y LR), lo que permite reproducir curvas de entrenamiento.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k (top-1 y top-5).
- Extracción de características visuales mediante el backbone ViT-Tiny (útil para fine-tuning en tareas downstream).
- Evaluación comparativa de arquitecturas de atención lineal y espacio de estados bajo receta controlada.
- Pesos EMA (`model_ema`) además de los pesos crudos (`model`), útiles para inferencia estable.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni multimodalidad.
- No tiene capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Comparación de arquitecturas de tiempo lineal en visión: usar los siete directorios como referencia reproducible para medir el impacto de la puerta acumulativa (`rt-cumulative-gate` frente a `rt-as-published`) con el mismo recetario.
- Fine-tuning en dominios específicos: partir de `rt-cumulative-gate` (76,10 % top-1) y ajustar sobre datasets médicos, industriales o de satélite con pocos recursos, dado el tamaño de 7 M de parámetros.
- Prototipado en dispositivos de borde: el modelo cabe holgadamente en memoria de GPUs consumer e incluso en CPU para inferencia por lotes pequeños, lo que permite desplegarlo en sistemas embebidos con requisitos de latencia estrictos.
- Destilación y extracción de características: emplear el backbone como profesor o como extractor de embeddings visuales para tareas de recuperación de imágenes.
- Investigación en eficiencia de atención: reproducir los experimentos del autor con el comando `torchrun` documentado y las notas `STMVIT_NOTES` para validar los resultados publicados.
- Benchmark interno de pipelines de clasificación: servir como baseline ligero contra el que medir modelos ViT más grandes en términos de precisión por parámetro.

## Benchmarks y rendimiento

Resultados sobre la partición de validación de ImageNet-1k (50.000 imágenes), según la model card:

| Directorio | Params | Top-1 | Top-5 | Val loss |
|---|---|---|---|---|
| `rt-cumulative-gate` | 7.081.096 | 76,10 | 92,96 | 1,0876 |
| `vim` | 7.148.008 | 75,89 | 92,78 | 1,0790 |
| `gated-deltanet` | 7.168.192 | 75,79 | 92,72 | 1,1028 |
| `vil-longhorn` | 6.853.096 | 75,64 | 92,84 | 1,0839 |
| `rt-as-published` | 7.081.096 | 75,38 | 92,60 | 1,1238 |
| `rt-legacy-wrapper` | 7.144.060 | 71,10 | 89,95 | 1,3235 |
| `rt-conconlyc` | 5.049.004 | 67,28 | 88,26 | 1,5078 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo es exclusivamente de clasificación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un modelo de ~7 M de parámetros con entrada 224×224; en la práctica, el cuello de botella es el tamaño de lote y las activaciones, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son válidas, aunque para este tamaño las GPUs consumer son suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `load_state_dict`), exportación a TorchScript u ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imágenes).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto / entrada | Top-1 ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RunningTensor `rt-cumulative-gate` | 7,08 M | 224×224 (ViT-Tiny patch 16) | 76,10 | Apache 2.0 | Hugging Face (Yusin) |
| ViM (baseline incluida) | 7,15 M | 224×224 | 75,89 | Apache 2.0 (según repo) | Hugging Face (Yusin) |
| Gated DeltaNet (baseline incluida) | 7,17 M | 224×224 | 75,79 | Apache 2.0 (según repo) | Hugging Face (Yusin) |
| ViL-Longhorn (baseline incluida) | 6,85 M | 224×224 | 75,64 | Apache 2.0 (según repo) | Hugging Face (Yusin) |
| DeiT-Tiny | ~5,7 M | 224×224 | ~72,2 (referencia externa, no verificada aquí) | Apache 2.0 | Hugging Face / timm |

Las tres líneas base están empaquetadas en el mismo repositorio y entrenadas con la misma receta, por lo que la comparación es directa. Frente a DeiT-Tiny, el modelo propuesto reporta una precisión superior, aunque la cifra de DeiT no procede de la información proporcionada y debe verificarse en su model card original.

## Limitaciones y advertencias

- Modelo exclusivamente de clasificación de imágenes: no admite texto, audio, tool calling ni razonamiento multi-paso.
- Solo se han publicado resultados sobre ImageNet-1k; no hay evaluación en otros dominios ni en distribuciones fuera de la validación estándar.
- El checkpoint no incluye estado del optimizador: sirve para evaluar y hacer fine-tuning, pero no para reanudar el entrenamiento desde el punto exacto.
- La resolución de entrada, el número de tokens y el contexto efectivo no están documentados en la model card; hay que inferirlos del comando de evaluación (`patch16_224`).
- Riesgo de sesgos: ImageNet-1k contiene sesgos conocidos de clase, geografía y representación; el modelo los hereda.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir clasificaciones erróneas con alta confianza en clases ambiguas o fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los pesos base de las líneas base incluidas (`vim`, `gated-deltanet`, `vil-longhorn`) antes de redistribuirlos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados.
- El autor no documenta el código de entrenamiento en este repositorio; remite al directorio `vision_imagenet/` del repositorio de origen, que no se enlaza explícitamente.

## Enlaces

- Hugging Face: https://huggingface.co/Yusin/runningtensor-imagenet-tiny
- Dataset: https://huggingface.co/datasets/ILSVRC/imagenet-1k
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.

# zenonlee/MDFLD

## Resumen

MDFLD (Multi-Domain Face Landmark Detection) es un modelo de deteccion de puntos faciales (face landmark detection) especializado en rostros no fotorrealistas: caricaturas, ilustraciones de anime, pinturas y animacion 3D, ademas de caras reales. Lo desarrollan Yuanming Li, Gwantae Kim, Jeong-gi Kwak, Bon-hwa Ku y Hanseok Ko, y se presento en el paper "Towards Multi-Domain Face Landmark Detection with Synthetic Data from Diffusion Model" (ICASSP 2024). El repositorio de Hugging Face, publicado por el usuario zenonlee, distribuye los pesos en formato TorchScript listos para inferencia.

La version v3, la predeterminada en el paquete `mdfld`, parte de la red v2 (una pila tipo hourglass inspirada en STAR) y le anade caracteristicas congeladas de un ViT-B/16 de DINOv3 mediante un pequeno adaptador, entrenando con mas datos de caricatura. Detecta 68 puntos en el orden iBUG 300-W y devuelve tambien curvas de parpado. El modelo resuelve un problema concreto: los detectores de landmarks entrenados con rostros reales fallan de forma sistematica en dominios estilizados, y este modelo mantiene un error normalizado (NME) bajo en caricaturas (4,64 %) y en caras reales (1,69 %).

Es relevante para pipelines de animacion, rigging facial, avatares y analisis de contenido ilustrado, donde los modelos genericos no bastan. Su licencia es exclusivamente de investigacion y la version v3 incorpora pesos de DINOv3, lo que anade restricciones adicionales de la DINOv3 License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red tipo hourglass (base STAR) con caracteristicas congeladas de DINOv3 ViT-B/16 inyectadas mediante adaptador (v3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de 256 x 256 px) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp32) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | research-only-and-dinov3-license (solo investigacion; v3 bajo DINOv3 License) |
| Formato de pesos | TorchScript (`.torchscript.pt`); checkpoint original `.pkl` para v2 en el release de GitHub |

## Arquitectura y entrenamiento

El modelo es un detector de keypoints puramente visual. La red v2 es una pila tipo hourglass que predice 68 coordenadas (x, y) normalizadas en [-1, 1] a partir de un recorte facial cuadrado de 256 x 256 px en BGR normalizado. La v3 mantiene esa red pero concatena a su entrada caracteristicas de un ViT-B/16 de DINOv3, congelado, a traves de un adaptador ligero; esto aporta representaciones semánticas robustas a estilos y explica la mejora en caricaturas y anime.

El entrenamiento combina datos reales y sinteticos. El paper original propone generar datos sinteticos con modelos de difusion para cubrir multiples dominios (fotorrealista, caricatura, pintura, 3D). La v3 se entrena ademas con mas datos de caricatura. El modelo aplica un protocolo de tres pasadas de recorte: la primera sobre el bounding box de la cara, y dos adicionales sobre cuadrados de 1,1 veces el lado mayor del box de los puntos previos, lo que refina la precision. No se dispone de datos sobre numero de tokens ni composicion exacta del dataset en la informacion proporcionada.

## Capacidades

- Deteccion de 68 puntos faciales en orden iBUG 300-W (0-based) sobre recortes de 256 x 256 px.
- Deteccion robusta en dominios estilizados: caricaturas, ilustraciones de anime, pinturas y animacion 3D, ademas de caras reales.
- Prediccion de curvas de parpado (eyelid curves) ademas de los 68 puntos.
- Localizacion automatica de la cara integrada en el paquete `mdfld` (con extra `sam`).
- Refinamiento mediante protocolo de tres pasadas de recorte para mayor precision.
- Ejecucion en GPU (CUDA) o CPU; compatible con TorchScript sin dependencia del codigo del repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de vision de una sola tarea.

## Casos de uso

- Rigging y animacion facial 2D: extraer los 68 puntos y las curvas de parpado de personajes de caricatura o anime para generar blendshapes y animar expresiones en herramientas de animacion.
- Analisis de contenido ilustrado: procesar lotes de ilustraciones o comics para indexar rostros, detectar expresiones o medir proporciones faciales en personajes estilizados.
- Avatares y filtros en tiempo real: el modelo v2 (69 MB, 38 ms por cara en RTX 4090 D) es adecuado para aplicaciones interactivas donde la latencia importa; v3 prioriza precision.
- Reconstruccion y retoque de pinturas o retratos historicos: localizar rasgos faciales en obras de dominio publico para tareas de restauracion o analisis artistico.
- Preprocesado para generacion condicionada: usar los landmarks como condicion para modelos de difusion que generen o animen rostros estilizados con control de pose y expresion.
- Control de calidad en pipelines de animacion 3D: detectar desalineaciones o fallos de rigging comparando landmarks detectados con los esperados en frames renderizados.
- Investigacion en deteccion de landmarks multi-dominio: servir como baseline o componente para estudiar generalizacion entre dominios fotorrealistas y estilizados.

## Benchmarks y rendimiento

Resultados publicados en la model card (NME = normalized mean error, menor es mejor):

| Test set | v1 (paper) | v2 | v3 |
|---|---|---|---|
| CariFace test, 1.560 caricaturas: NME (%) | 6,70 | 5,03 | 4,64 |
| CariFace test: caras con NME > 10 % | no disponible | 3,6 % | 2,0 % |
| Caras reales, 313 frames de video reservados (etiquetas automaticas): NME (%) | 3,03 | 1,74 | 1,69 |
| Ilustraciones anime, 980 imagenes reservadas: desacuerdo > 15 % con detector de caras anime | no disponible | 10,5 % | 6,1 % |

Rendimiento de inferencia indicado por el autor: 71 ms por cara en RTX 4090 D para v3 frente a 38 ms para v2; 1,8 s frente a 0,4 s en CPU de 8 hilos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el fichero v3 pesa 419 MB en fp32 y el v2 69 MB, por lo que la huella en memoria es reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 4090 D medida por el autor (71 ms v3, 38 ms v2 por cara); cualquier GPU con CUDA es suficiente. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en todas las gamas actuales (incluso integradas con suficiente memoria).
- Opciones de despliegue: PyTorch con TorchScript (`torch.jit.load`), paquete `mdfld` (pip), o integracion directa en pipelines Python. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de vision de este tipo).
- Latencia: 71 ms/cara (v3) y 38 ms/cara (v2) en RTX 4090 D; 1,8 s y 0,4 s en CPU de 8 hilos. Se recomienda desactivar los fusers de Torch (`torch.jit.fuser("none")`) para evitar un primer arranque de 20-30 s en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Puntos | Enfoque multi-dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MDFLD v3 | Hourglass + DINOv3 ViT-B/16 | 68 + parpados | Si (caricatura, anime, pintura, 3D, real) | Solo investigacion + DINOv3 | Hugging Face, TorchScript |
| MDFLD v2 | Hourglass (STAR) | 68 + parpados | Si | Solo investigacion | Hugging Face, TorchScript |
| STAR | Hourglass con transformer | 68 | Centrado en caras reales | No disponible en la informacion | Codigo publico |
| Detectores genericos de landmarks (p. ej. MediaPipe Face Mesh) | Varios | 468 (malla) | Limitado en estilizado | Apache 2.0 (MediaPipe) | Amplia |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada; la comparativa se limita a caracteristicas cualitativas.

## Limitaciones y advertencias

- Licencia de solo investigacion: no permite uso comercial. La v3 incorpora pesos de DINOv3 y queda sujeta a la DINOv3 License, incluidas sus restricciones de control de exportaciones; publicar resultados con v3 exige citar DINOv3 (Simeoni et al., 2025).
- Los datos de entrenamiento incluyen CariFace (solo investigacion) y varios conjuntos de caricatura con arte de terceros, lo que anade incertidumbre sobre la redistribucion y el uso.
- Riesgo de fallo en dominios no cubiertos: rostros muy ocluidos, perfiles extremos, estilos artisticos no representados o resoluciones muy bajas pueden degradar la precision.
- Las metricas en caras reales usan etiquetas automaticas, no anotacion humana, por lo que pueden estar sesgadas.
- v3 es mas lento y pesado (419 MB, 71 ms en RTX 4090 D) que v2 (69 MB, 38 ms); en produccion con requisitos de latencia conviene evaluar v2.
- El modelo no procesa texto ni lenguaje; no debe presentarse como un LLM ni usarse para tareas de NLP.
- No se documentan sesgos demograficos especificos, pero al entrenar con datos de terceros puede heredar sesgos de representacion.

## Enlaces

- Hugging Face: https://huggingface.co/zenonlee/MDFLD
- Paper (arXiv): https://arxiv.org/abs/2401.13191
- Codigo (GitHub): https://github.com/zenonLEE/MDFLD
- Pagina del proyecto: https://zenonlee.github.io/MDFLD/
- Terminos de uso: https://github.com/zenonLEE/MDFLD#terms-of-use
- Release v2.0 (checkpoint original): https://github.com/zenonLEE/MDFLD/releases/tag/v2.0
- DINOv3 (GitHub): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://huggingface.co/zenonlee/MDFLD/blob/main/LICENSE_DINOv3.md

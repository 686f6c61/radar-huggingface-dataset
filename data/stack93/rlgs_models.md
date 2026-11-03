# stack93/RLGS_models

## Resumen

RLGS_models es un repositorio de pesos y resultados de evaluacion asociado al articulo **RLGS: Reinforcement Learning-Based Adaptive Hyperparameter Tuning for Gaussian Splatting** (arXiv:2508.04078), publicado por el usuario stack93. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un conjunto de reconstrucciones 3D basadas en 3D Gaussian Splatting (3DGS) entrenadas con una estrategia de ajuste adaptativo de hiperparametros guiada por aprendizaje por refuerzo. El repositorio contiene los ficheros `point_cloud.ply` (gaussianas entrenadas hasta la iteracion 30.000) y los `results.json` con las metricas PSNR, SSIM y LPIPS por escena.

El objetivo del trabajo es resolver uno de los cuellos de botella clasicos de 3DGS: la sensibilidad del resultado a los hiperparametros de entrenamiento (tasas de densificacion, umbrales de poda, learning rates, etc.). En lugar de fijar estos valores a mano o mediante busqueda exhaustiva, RLGS plantea un agente de aprendizaje por refuerzo que los ajusta de forma adaptativa durante el proceso de optimizacion de la escena.

El repositorio cubre cuatro conjuntos de datos de referencia en novel view synthesis (Tanks and Temples, Deep Blending, DL3DV y Mip-NeRF 360), con dos variantes de pipeline (`rlgs_tmgs` y `rlgs_mcmc`). Su relevancia es practica para investigadores en reconstruccion 3D y sintesis de vistas novedosas que quieran reproducir los resultados del paper o reutilizar las nubes de gaussianas preentrenadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3D Gaussian Splatting (representacion explicita de gaussianas 3D) con ajuste de hiperparametros mediante aprendizaje por refuerzo |
| Parametros totales | no disponible (no es un modelo neuronal con parametros en el sentido habitual; el numero de gaussianas depende de cada escena) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision 3D, no linguistico) |
| Licencia | MIT |
| Formato de pesos | `.ply` (point cloud de gaussianas) y `.json` (metricas) |

## Arquitectura y entrenamiento

La base es 3D Gaussian Splatting, una representacion de escena que modela el volumen como un conjunto de gaussianas 3D anisotropicas con posicion, covarianza, opacidad y coeficientes de color (armonicos esfericos), rasterizadas de forma diferenciable para sintesis de vistas en tiempo real. Sobre este esquema, RLGS incorpora un mecanismo de aprendizaje por refuerzo que adapta dinamicamente los hiperparametros del entrenamiento (densificacion, poda y tasas de aprendizaje) en funcion del estado de la optimizacion de cada escena.

El repositorio incluye dos pipelines: `rlgs_tmgs` (probablemente asociado a una variante de entrenamiento tipo Taming/TMGS) aplicado a Tanks and Temples, Deep Blending y DL3DV, y `rlgs_mcmc` aplicado a Mip-NeRF 360. Todos los resultados reportados corresponden a la iteracion 30.000 de entrenamiento. No se detallan en la informacion disponible el numero de tokens, la composicion exacta del dataset de entrenamiento del agente RL ni si se emplearon tecnicas adicionales como decodificacion especulativa (no aplicables a este dominio).

## Capacidades

- Reconstruccion 3D de escenas a partir de conjuntos de imagenes con poses conocidas (novel view synthesis).
- Renderizado de vistas novedosas en tiempo real gracias a la representacion explicita de gaussianas.
- Ajuste adaptativo de hiperparametros de entrenamiento mediante un agente de aprendizaje por refuerzo, orientado a reducir la dependencia de busqueda manual.
- Evaluacion cuantitativa por escena mediante PSNR, SSIM y LPIPS incluida en `results.json`.
- Cobertura de escenas de interior, exterior y objetos (Tanks and Temples, Deep Blending, DL3DV, Mip-NeRF 360).
- No soporta tool calling, agentes conversacionales, razonamiento textual ni capacidades multilingues: es un modelo de vision 3D.

## Casos de uso

- Reproduccion de resultados academicos: descargar las nubes de gaussianas y los `results.json` para verificar las cifras del paper RLGS (arXiv:2508.04078) sin reentrenar, usando `hf download` con filtros `--include` por escena.
- Benchmarking de pipelines de 3DGS: comparar PSNR/SSIM/LPIPS de RLGS frente a implementaciones propias sobre los mismos conjuntos (Tanks and Temples, Deep Blending, DL3DV, Mip-NeRF 360).
- Prototipado de reconstruccion 3D en investigacion: partir de una nube `.ply` preentrenada como inicializacion o referencia para experimentos de edicion, compresion o poda de gaussianas.
- Evaluacion de estrategias de ajuste de hiperparametros: usar los resultados por escena como linea base para estudiar el impacto del tuning adaptativo frente a valores fijos.
- Docencia y divulgacion en vision por computador: ejemplos reales de sintesis de vistas novedosas con metricas publicadas y descarga selectiva por escena (por ejemplo, `rlgs_tmgs/tandt/truck/*`).
- Integracion en visores 3D y motores de render: cargar los `.ply` en herramientas compatibles con 3DGS (visores web, Unity/Unreal con plugins de gaussian splatting) para demostraciones interactivas.

## Benchmarks y rendimiento

Resultados agregados reportados en la model card (iteracion 30.000):

| Dataset | Carpeta | Escenas | PSNR (dB) | SSIM | LPIPS |
|---|---|---:|---:|---:|---:|
| Tanks and Temples | `rlgs_tmgs/tandt` | 2 | 24,74 | 0,866 | 0,158 |
| Deep Blending | `rlgs_tmgs/db` | 2 | 30,26 | 0,911 | 0,233 |
| DL3DV | `rlgs_tmgs/dl3dv` | 129 | 29,96 | 0,912 | 0,126 |
| Mip-NeRF 360 | `rlgs_mcmc/mipnerf360` | 6 | 30,42 | 0,899 | 0,154 |

Desglose por escena en Tanks and Temples y Deep Blending:

| Dataset | Escena | PSNR (dB) | SSIM | LPIPS |
|---|---|---:|---:|---:|
| Tanks and Temples | train | 23,24 | 0,837 | 0,191 |
| Tanks and Temples | truck | 26,25 | 0,895 | 0,124 |
| Deep Blending | drjohnson | 29,88 | 0,910 | 0,232 |
| Deep Blending | playroom | 30,65 | 0,913 | 0,234 |

En DL3DV se publican las 129 escenas individuales; los valores extremos observados son PSNR 21,68 (escena `d3812a`) y 38,85 (escena `07d9f9`). No se han publicado en la informacion disponible comparaciones directas con otros metodos en forma de tabla comparativa.

## Requisitos de hardware

- El repositorio completo ocupa aproximadamente 40,1 GB; conviene descargar por escena con `--include` para limitar el espacio en disco.
- Inferencia/renderizado de 3DGS: requiere GPU con soporte CUDA. Las implementaciones tipicas de rasterizacion de gaussianas funcionan en GPUs consumer (RTX 3060 en adelante) y en GPUs de datacenter (A100, H100) para escenas grandes o alto numero de gaussianas.
- VRAM estimada: no disponible en la informacion proporcionada; depende del numero de gaussianas por escena y de la resolucion de render.
- Entrenamiento (si se desea reproducir): no se detallan requisitos en la model card; los pipelines de 3DGS suelen requerir GPUs con 24 GB o mas para escenas de gran escala.
- Opciones de despliegue: visores y librerias compatibles con `.ply` de 3DGS (por ejemplo, implementaciones de rasterizacion gaussiana); no aplican vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLGS_models (este) | 3DGS + RL para tuning | no disponible (nubes por escena) | no aplica | MIT | HuggingFace, 40,1 GB |
| 3D Gaussian Splatting original | 3DGS con hiperparametros fijos | no disponible | no aplica | codigo abierto (ver repo original) | codigo y pesos por escena |
| Mip-NeRF 360 | NeRF con anti-aliasing | no disponible | no aplica | codigo abierto | codigo y pesos |
| NeRF original | NeRF | no disponible | no aplica | codigo abierto | codigo y pesos |

No se dispone en la informacion proporcionada de una comparativa numerica directa entre RLGS y estos metodos; las cifras de la tabla de benchmarks corresponden exclusivamente a RLGS.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni generacion de codigo; cualquier uso conversacional es inaplicable.
- Los resultados dependen de la escena y del dataset; el rango de PSNR en DL3DV (21,68 a 38,85 dB) muestra una variabilidad muy alta entre escenas.
- Solo se evaluan 2 escenas en Tanks and Temples y 2 en Deep Blending, lo que limita la robustez estadistica de esas medias agregadas.
- Riesgo de artefactos de reconstruccion propios de 3DGS (flotantes, geometria inconsistente en zonas con poca cobertura de vistas).
- La licencia MIT permite uso comercial, pero conviene revisar las licencias de los datasets originales (Tanks and Temples, Deep Blending, DL3DV, Mip-NeRF 360) antes de reutilizar los datos subyacentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria independiente.
- No se documentan sesgos, pero al ser reconstrucciones de escenas concretas, cualquier sesgo refleja las condiciones de captura de los datasets.
- No se especifican requisitos de hardware ni tiempos de entrenamiento en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/stack93/RLGS_models
- Paper: https://arxiv.org/abs/2508.04078
- Descarga selectiva: `hf download stack93/RLGS_models --local-dir RLGS_models --include "rlgs_tmgs/tandt/truck/*"`
- No se han encontrado en la informacion disponible otros enlaces a blogs, repos de codigo o demos.

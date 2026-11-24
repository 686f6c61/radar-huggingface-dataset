# zouzichen/MaskedVGGT-L-Geo

## Resumen

MaskedVGGT-L-Geo es un checkpoint de visión por computador especializado en geometría multi-vista, desarrollado por Zichen Zou, Xiaosong Jia, Wen-Ming Chen, Zuxuan Wu y Yu-Gang Jiang (TEAI, Universidad de Fudan; Shanghai Innovation Institute). Se trata de la variante de escala "large" del modelo MaskedVGGT, descrito en el artículo *MaskedVGGT: Masked Multi-View Transformers Are Scalable 3D Learners*. El modelo resuelve la predicción conjunta de poses de cámara y mapas de profundidad a partir de múltiples vistas, un problema central en reconstrucción 3D, SLAM visual y percepción robótica.

Este checkpoint concreto corresponde a la segunda etapa de entrenamiento (fine-tuning geométrico) en la actualización 120.000, e incluye el backbone contextual completo junto con las cabezas de cámara y profundidad. El archivo de pesos `model.safetensors` ocupa 4.576.410.228 bytes (aproximadamente 4,58 GB), lo que sitúa el modelo en el orden de los 4.500 millones de parámetros en precisión de 8 bits o en torno a 2.300 millones en fp16, si bien el dato exacto de parámetros no se declara en la model card.

Su relevancia radica en que aplica el paradigma de enmascaramiento (masked modeling) propio de los transformers de lenguaje a la geometría multi-vista, buscando escalabilidad en el aprendizaje 3D. La licencia es estrictamente de investigación no comercial (`maskedvggt-composite-research-terms`), y el código de inferencia se anuncia como publicación separada, por lo que a fecha de la ficha el modelo no es directamente ejecutable sin dicho código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multi-vista con enmascaramiento (MaskedVGGT); backbone contextual mas cabezas de camara y profundidad |
| Parametros totales | no disponible (pesos de 4.576.410.228 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (numero de vistas soportadas no declarado) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | maskedvggt-composite-research-terms (uso no comercial, solo investigacion) |
| Formato de pesos | safetensors (`model.safetensors`) mas `config.json` |

## Arquitectura y entrenamiento

MaskedVGGT se construye sobre un transformer multi-vista con enmascaramiento, en la linea de los trabajos de representacion visual auto-supervisada. El checkpoint integra un backbone contextual completo y cabezas especificas para prediccion de poses de camara, mapas de profundidad y confianza, ademas de exponer caracteristicas contextuales. El `config.json` declara formato version 1, escala `l` (large), tarea `geometry` y tamano de parche 16, lo que confirma una tokenizacion por patches de 16x16 pixeles sobre las imagenes de entrada.

El modelo deriva de tres componentes de referencia: DINOv3 (Facebook Research) como base de representacion visual, VGGT-Omega como arquitectura de geometria multi-vista, y CAPI. El entrenamiento se organiza en al menos dos etapas; este checkpoint es el de la segunda etapa (fine-tuning geometrico) en la actualizacion 120.000. No se declaran en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF/DPO (no aplicables en un modelo de vision de este tipo). La innovacion principal es trasladar el enmascaramiento escalable de los transformers de lenguaje al aprendizaje 3D multi-vista.

## Capacidades

- Prediccion de poses de camara (extrinsicas e intrinsecas) a partir de multiples vistas.
- Estimacion de mapas de profundidad por vista.
- Salida de mapas de confianza asociados a las predicciones geometricas.
- Extraccion de caracteristicas contextuales del backbone, reutilizables para tareas aguas abajo.
- Procesamiento de escenas multi-vista (el numero maximo de vistas no se declara).
- No soporta generacion de texto, tool calling, agentes ni capacidades linguisticas: es un modelo puramente de vision.
- No se declaran capacidades multimodales (audio, video explicito) ni modo "thinking".

## Casos de uso

- Reconstruccion 3D de escenas: dadas varias imagenes de un mismo entorno, el modelo estima poses y profundidad para alimentar un pipeline de estructura desde movimiento (SfM) o de nube de puntos.
- SLAM visual y odometria: las poses de camara y los mapas de profundidad con confianza permiten inicializar o validar el seguimiento de trayectoria en robots y vehiculos.
- Percepcion robotica: la profundidad densa por vista sirve para planificacion de movimiento y evitacion de obstaculos en plataformas con camaras monocular multi-vista.
- Fotogrametria y gemelos digitales: generacion de geometria de edificios o interiores a partir de conjuntos de fotografias, con mapas de confianza para filtrar regiones poco fiables.
- Investigacion en representaciones 3D: el backbone contextual y las caracteristicas expuestas permiten experimentar con transferencia a tareas de segmentacion o correspondencia multi-vista.
- Evaluacion comparativa de metodos geometricos: al ser un checkpoint de investigacion, sirve como referencia reproducible (actualizacion 120.000) en estudios academicos de geometria multi-vista.
- Realidad aumentada: estimacion de pose y profundidad para anclar objetos virtuales en escenas capturadas con varias camaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 4,58 GB; en fp16 se requiere al menos unos 5-6 GB solo para pesos, y en torno a 10-12 GB contando activaciones para lotes pequenos de varias vistas (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no declaradas; por tamano, una GPU con 16 GB o mas (RTX 4080/4090, A100, H100) es un punto de partida razonable para inferencia comoda.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y modelos con 16 GB o mas; en GPUs de 8 GB requeriria cuantizacion, no disponible en el repositorio.
- Opciones de despliegue: no se declaran; el codigo de inferencia de MaskedVGGT se anuncia como publicacion separada, por lo que vLLM, llama.cpp, Ollama o TGI no aplican (no es un modelo de lenguaje). Se requiere PyTorch y el codigo oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (vistas) | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaskedVGGT-L-Geo | no disponible (pesos 4,58 GB) | no disponible | Poses + profundidad multi-vista | Investigacion no comercial | Pesos en HF; codigo pendiente |
| VGGT-Omega (base declarada) | no disponible | no disponible | Geometria multi-vista | no disponible | GitHub Facebook Research |
| DINOv3 (base declarada) | no disponible | no aplica | Representacion visual | no disponible | GitHub Facebook Research |

No se dispone de datos de rendimiento de MaskedVGGT-L-Geo ni de sus alternativas en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia de investigacion no comercial: cualquier uso productivo o comercial esta restringido por los terminos compuestos (`maskedvggt-composite-research-terms`) y los terminos de los componentes (DINOv3, VGGT-Omega, CAPI).
- Codigo de inferencia no incluido: el autor indica que se publicara por separado; sin el, el checkpoint no es directamente utilizable.
- Sin datos de sesgo, alucinacion o robustez: la model card no documenta evaluaciones de sesgo ni casos de fallo geometrico.
- Numero maximo de vistas y resolucion de entrada no declarados, lo que limita la planificacion de despliegues.
- Checkpoint intermedio (actualizacion 120.000) de una etapa de fine-tuning: no se garantiza que sea la version final ni la mejor.
- Ausencia de benchmarks publicos impide validar su calidad frente a alternativas.
- Modelo puramente geometrico: no procesa lenguaje ni instrucciones, por lo que no debe confundirse con un modelo multimodal conversacional.

## Enlaces

- Hugging Face: https://huggingface.co/zouzichen/MaskedVGGT-L-Geo
- DINOv3: https://github.com/facebookresearch/dinov3
- VGGT-Omega: https://github.com/facebookresearch/vggt-omega
- CAPI: https://github.com/facebookresearch/capi

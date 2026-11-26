# ThanhNguyenVo/neuropilot-weights

## Resumen

NeuroPilot es un conjunto de pesos preentrenados en formato `.pt` (PyTorch) y `.onnx` para la librería NeuroPilot, un framework de conducción autónoma de extremo a extremo desarrollado por ThanhNguyenVo. El repositorio no contiene un único modelo generativo, sino una colección de diecisiete checkpoints especializados que cubren tareas de percepción y planificación: planificación de trayectorias multi-tarea, detección de objetos, detección de carriles, profundidad monocular, segmentación semántica, monitorización del habitáculo, tokenización visual y modelado del mundo latente. Los pesos se descargan y cachean automáticamente la primera vez que se instancian desde el paquete `neuro_pilot`.

El checkpoint principal, `pilot_mhp.pt`, es un planificador multi-tarea de 14,07 millones de parámetros y 53,8 MB que produce waypoints y detecciones a partir de un fotograma BGR y un comando de navegación (seguir carril, girar a izquierda, girar a derecha o ir recto). Está evaluado sobre el conjunto BFMC V6 con métricas concretas de error de trayectoria (MSE 0,00440, error lateral de 18,5 px) y precisión de detección (mAP@50 del 63,2 %). El repositorio incluye también variantes de doble cámara derivadas de OpenPilot (FastViT-T12 y Chestnut Big) y un planificador de navegación N16.

La relevancia del conjunto reside en su orientación a despliegue real en vehículos y simuladores: modelos pequeños (desde 3,62 M hasta 393,67 M de parámetros), exportación ONNX con paridad numérica de 1e-6 frente a PyTorch, licencias permisivas (Apache-2.0 y MIT) y una API mínima de inferencia. No es un modelo de lenguaje ni un modelo multimodal generalista; es una batería de redes convolucionales y transformers de visión para el pipeline de conducción autónoma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes de visión específicas por tarea (planificador multi-tarea, FastViT-T12, Chestnut Big, DDRNet-23-Slim, EoMT-Large, V-JEPA, CommaVQ); detalles por checkpoint no disponibles |
| Parametros totales | Desde 3,62 M (`driver.pt`) hasta 393,67 M (`pilot_nav.pt`); el planificador principal `pilot_mhp.pt` tiene 14,07 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelos de visión, entrada por fotograma) |
| Tipos de cuantizacion | FP32 en PyTorch y ONNX; `seg_l.pt` en FP16; no se documentan otras cuantizaciones (INT8, GGUF, etc.) |
| Idiomas soportados | No disponible (modelos de visión; sin procesamiento de lenguaje natural) |
| Licencia | Apache-2.0 para los checkpoints propios y varios derivados; MIT para los derivados de OpenPilot, DDRNet, EoMT y CommaVQ |
| Formato de pesos | `.pt` (PyTorch) y `.onnx` (Opset 17, FP32) |

## Arquitectura y entrenamiento

El repositorio agrupa arquitecturas heterogéneas según la tarea. El planificador principal (`pilot_mhp.pt`) es una red multi-tarea de 14,07 M de parámetros que, a partir de una imagen y un comando discreto de navegación, emite simultáneamente waypoints de trayectoria y detecciones de objetos. Las variantes de doble cámara (`pilot_s.pt`, `pilot_l.pt`, `pilot_nav.pt`) emplean backbones FastViT-T12 y Chestnut Big, con 34,30 M, 381,59 M y 393,67 M de parámetros respectivamente, y están etiquetadas como derivadas de OpenPilot. Para percepción auxiliar se incluyen DDRNet-23-Slim (segmentación de 19 clases, 5,69 M), EoMT-Large (segmentación de 19 clases en FP16, 319,03 M), un modelo de profundidad monocular Scene3D-Lite (6,97 M) y detectores de la familia VisionPilot (CIPO, carril, AutoDrive).

El entrenamiento se documenta únicamente a través de las métricas de evaluación sobre BFMC V6 y BFMC V2; no se especifican el número de tokens o fotogramas de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino por refuerzo o preferencias. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de modelos. La innovación técnica destacable es la exportación ONNX con paridad numérica de 1e-6 frente a PyTorch y la integración de un modelado del mundo latente (LatentDrive V-JEPA, 310,02 M) junto con un tokenizador visual encoder-decoder (CommaVQ, 29,63 M y 42,78 M).

## Capacidades

- Planificación de trayectorias: genera waypoints a partir de un fotograma y un comando de navegación discreto (0 = seguir carril, 1 = girar a izquierda, 2 = girar a derecha, 3 = ir recto).
- Detección de objetos: salida de detecciones por fotograma, con mAP@50 del 63,2 % en BFMC V6 y del 66,1 % en BFMC V2 para el detector `pilot_det.pt`.
- Detección de carriles: checkpoint `lane.pt` (VisionPilot AutoSteer2, 8,22 M de parámetros).
- Profundidad monocular: checkpoint `depth.pt` (VisionPilot Scene3D-Lite, 6,97 M).
- Segmentación semántica de 19 clases: `seg.pt` (DDRNet-23-Slim) y `seg_l.pt` (EoMT-Large en FP16).
- Monitorización del habitáculo: `driver.pt` (OpenPilot Driver Monitoring, 3,62 M).
- Modelado del mundo latente: `jepa.pt` (LatentDrive V-JEPA, 310,02 M).
- Tokenización visual: encoder y decoder CommaVQ (`vq_enc.pt`, `vq_dec.pt`).
- Conducción con doble cámara y navegación: `pilot_s.pt`, `pilot_l.pt` y `pilot_nav.pt`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Planificación de trayectorias en simulador o vehículo a escala: `pilot_mhp.pt` recibe un fotograma BGR y un comando de navegación y devuelve waypoints con un error lateral de 18,3-18,5 px, adecuado para bucles de control en tiempo real gracias a sus 14,07 M de parámetros.
- Detección de obstáculos y vehículos en el pipeline de percepción: `pilot_det.pt` ofrece mAP@50 del 66,1 % con 12,87 M de parámetros, integrable en un vehículo con cómputo embebido limitado.
- Mantenimiento de carril asistido: `lane.pt` (8,22 M) y `drive.pt` (CIPO + curvatura, 10,58 M) permiten construir un sistema de centrado de carril y control de curvatura sin depender de un stack completo de OpenPilot.
- Estimación de profundidad para planificación de espacio libre: `depth.pt` (6,97 M) genera mapas de profundidad monocular que alimentan la capa de planificación con información de distancia.
- Segmentación semántica de la escena: `seg.pt` (DDRNet-23-Slim, 19 clases) o `seg_l.pt` (EoMT-Large en FP16) para distinguir calzada, acera, vegetación y otros elementos en tareas de validación y etiquetado automático.
- Monitorización del conductor: `driver.pt` (3,62 M) para detección de distracción o somnolencia en el habitáculo, con un coste computacional mínimo.
- Investigación en modelado del mundo: `jepa.pt` (LatentDrive V-JEPA, 310,02 M) y el tokenizador CommaVQ permiten experimentar con representaciones latentes y predicción de estados futuros en conducción.
- Despliegue en producción con ONNX Runtime: la exportación `pilot_mhp.onnx` (Opset 17, FP32, paridad de 1e-6) facilita la integración en stacks de inferencia sin PyTorch.

## Benchmarks y rendimiento

| Checkpoint | Conjunto | Métrica | Valor |
|---|---|---|---|
| `pilot_mhp.pt` | BFMC V6 MHP (K=5) | Score | 54,46 |
| `pilot_mhp.pt` | BFMC V6 MHP (K=5) | MSE | 0,00440 |
| `pilot_mhp.pt` | BFMC V6 MHP (K=5) | Error lateral | 18,5 px |
| `pilot_mhp.pt` | BFMC V6 MHP (K=5) | mAP@50 | 63,2 % |
| `pilot_mhp.pt` | BFMC V6 MHP (K=5) | Kink | 7,8° |
| `pilot_mhp_traj.pt` | BFMC V6 (mejor trayectoria) | MSE | 0,00421 |
| `pilot_mhp_traj.pt` | BFMC V6 (mejor trayectoria) | ADE | 40,7 px |
| `pilot_mhp_traj.pt` | BFMC V6 (mejor trayectoria) | Error lateral | 18,3 px |
| `pilot_det.pt` | BFMC V2 (modo único) | mAP@50 | 66,1 % |
| `pilot_det.pt` | BFMC V2 (modo único) | mAP@50 (clase Car) | 76,8 % |

No se han publicado resultados de benchmarks de MMLU, HumanEval, GSM8K ni métricas de lenguaje en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: los checkpoints pequeños (3,62-14,07 M de parámetros, 13,9-54,0 MB) caben holgadamente en cualquier GPU consumer con menos de 1 GB de VRAM; los modelos medianos (310-394 M, 1,18-1,50 GB) requieren al menos 2-3 GB de VRAM en FP32.
- GPU recomendadas: cualquier GPU con soporte CUDA para los checkpoints pequeños; para `pilot_l.pt`, `pilot_nav.pt` y `jepa.pt` se recomienda al menos una RTX 3060/4060 o superior; para despliegue en servidor, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU consumer: sí, todos los checkpoints caben en GPUs consumer (RTX 4090, RTX 3080, RTX 4060, etc.); los más pequeños pueden ejecutarse incluso en CPU o en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo mediante `neuro_pilot`, ONNX Runtime para `pilot_mhp.onnx` (Opset 17, FP32); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeuroPilot `pilot_mhp.pt` | 14,07 M | No aplica | Planificación multi-tarea | Apache-2.0 | Hugging Face |
| OpenPilot Small (FastViT-T12) | 34,30 M | No aplica | Planificación con doble cámara | MIT | Hugging Face (incluido en el repo) |
| OpenPilot Chestnut Big | 381,59 M | No aplica | Planificación con doble cámara | MIT | Hugging Face (incluido en el repo) |
| OpenPilot N16 Nav | 393,67 M | No aplica | Planificación con navegación | MIT | Hugging Face (incluido en el repo) |

Los tres modelos comparables forman parte del propio repositorio como derivados de OpenPilot, por lo que la comparativa externa con alternativas de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene diecisiete checkpoints con licencias distintas (Apache-2.0 y MIT); es necesario revisar `THIRD_PARTY_LICENSES.md` antes de uso comercial, ya que los términos varían por archivo.
- No se documentan sesgos conocidos, pero al ser modelos de visión entrenados sobre datasets de conducción (BFMC, OpenPilot) pueden presentar sesgos hacia condiciones de iluminación, geografía y tipo de vía presentes en esos datos.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de detecciones falsas o trayectorias incorrectas en escenarios fuera de distribución.
- No hay información sobre el dataset de entrenamiento, lo que impide evaluar la cobertura de condiciones adversas (lluvia, nieve, noche).
- Las métricas publicadas son limitadas: solo se reportan MSE, error lateral, mAP@50, ADE, Score y Kink sobre BFMC V6 y BFMC V2; no hay evaluación en otros conjuntos.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no procesa texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 26 de noviembre de 2026; se trata de un proyecto reciente sin validación externa documentada.
- Para producción en vehículo real es imprescindible validar los checkpoints en el dominio objetivo y no asumir que las métricas de BFMC se trasladan a condiciones reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ThanhNguyenVo/neuropilot-weights
- Repositorio del framework NeuroPilot: https://github.com/vtnguyen04/neuralPilot
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos ni otros repositorios adicionales.

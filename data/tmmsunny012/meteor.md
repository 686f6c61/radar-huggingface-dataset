# tmmsunny012/meteor

## Resumen

METEOR es una red de conducción autónoma multi-tarea de vista envolvente (surround-view) que consume las 8 cámaras del sistema de grabación DRS de TIER IV, junto con calibración y velocidad del ego, y produce doce tareas de conducción en una única pasada forward. El modelo está pensado como referencia para el stack Autoware y se publica con sus propios runtimes en Python y C++ basados en TensorRT y ONNX. La arquitectura parte de un backbone de imagen ResNet-34 con FPN, aplica un lift IPM con gating por profundidad y construye una única feature BEV de 96 canales con rejilla de 800 × 500 celdas a 0,2 m (cobertura de ±80 m × ±50 m), sobre la que se montan las cabezas de tarea y refinadores residuales por tarea (`DepthSegIPMNetV52`).

El modelo tiene 54 millones de parámetros y recurre a sparsity estructurada 2:4 en el tronco convolucional (las ramas del planificador quedan densas). Según la model card, corre en un Jetson AGX Orin en aproximadamente 70 ms por fotograma de 8 cámaras en INT8 con CUDA Graph y entrada zero-copy, y en unos 30 ms en fp16 sobre una GPU de centro de datos. La exportación ONNX distribuida es cámara-solo, con input uint8 de 768 × 432 por cámara y sin memoria temporal: el checkpoint contiene memoria temporal, pero queda eliminada en el grafo exportado.

Su relevancia actual radica en dos factores. Primero, es un ejemplo de despliegue edge real de percepción BEV multi-tarea sobre hardware Jetson en lugar de GPU de servidor. Segundo, según la propia model card fue entrenado íntegramente con ground truth autogenerado (cero etiquetas humanas) y todo el proyecto —modelo, extractores de GT, entrenador, runtimes, plugin CUDA y la propia ficha— fue escrito por Claude (Anthropic) operando de forma autónoma con supervisión humana en los objetivos y la revisión de resultados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-34 + FPN (backbone de imagen) → lift IPM con gating por profundidad → feature BEV única de 96 canales (800 × 500 a 0,2 m, ±80 m × ±50 m) → cabezas de tarea + refinadores residuales por tarea (`DepthSegIPMNetV52`) |
| Parámetros totales | 54 M |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); memoria temporal presente en el checkpoint pero eliminada en la exportación ONNX (modelo single-frame) |
| Tipos de cuantización | INT8 con calibración sobre fotogramas reales (Jetson Orin); fp16 (workstation); sparsity estructurada 2:4 en el tronco convolucional |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint PyTorch (`.pt`) + ONNX (opset 17, sin operadores personalizados); los motores TensorRT se construyen localmente |
| Tareas de salida | 12 en una sola pasada: segmentación BEV de carril (9 clases), profundidad métrica, cajas 3D orientadas (vehículo/VRU) con flag parked/stopped, obstáculos desconocidos, segmentación semántica 2D (21 clases), detección 2D (10 clases), trayectoria end-to-end multimodal (K=3, 3 s) + steer/accel/brake, ocupación semántica 3D, occupancy flow, forecasting de agentes, estado de semáforo relevante para el ego y campo de riesgo por área |
| Cámaras de entrada | 8 vistas en orden fijo: `CAM_FRONT_WIDE, CAM_FRONT_LEFT, CAM_FRONT_RIGHT, CAM_BACK_WIDE, CAM_BACK_LEFT, CAM_BACK_RIGHT, CAM_FRONT_NARROW, CAM_BACK_NARROW` |
| Resolución de entrada | 768 × 432 por cámara, RGB uint8 (normalización dentro del grafo) |
| Entradas opcionales | Ráster de pilares LiDAR y ráster de mapa SD presentes en el checkpoint (entrada a cero equivale bit a bit a no entrada); el ONNX distribuido es la exportación cámara-solo |
| Runtime | TensorRT vía `deploy/runtime.py`, `deploy/orin_realtime.py` o el runtime C++ en `deploy/cpp` |
| Latencia publicada | ~70 ms de mediana por fotograma de 8 cámaras en AGX Orin (INT8, CUDA Graph, zero-copy); ~30 ms en workstation fp16 (TensorRT 8.6, sin plugins, GPU de centro de datos) |
| Pipeline declarado | robotics |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El pipeline parte de ocho imágenes RGB de 768 × 432 que pasan por un backbone ResNet-34 con FPN. La proyección al espacio BEV se realiza mediante un lift IPM con gating por profundidad, es decir, la profundidad estimada modula la proyección de las features de imagen en la rejilla cenital, lo que permite obtener una representación BEV unificada de 96 canales a 0,2 m por celda con cobertura de ±80 m en longitudinal y ±50 m en lateral. Sobre esa feature se despliegan las cabezas de las doce tareas, complementadas por refinadores residuales específicos por tarea. El tronco convolucional emplea sparsity estructurada 2:4, mientras que las ramas del planificador se mantienen densas, presumiblemente para preservar la precisión de las salidas de trayectoria y control.

El checkpoint admite entradas opcionales de LiDAR (ráster de pilares) y de mapa SD, aunque la exportación ONNX publicada es cámara-solo y alimentar esas entradas con ceros produce resultados idénticos a no usarlas. La memoria temporal existe en el checkpoint pero se ha "horneado fuera" de la exportación, de modo que el modelo desplegado procesa un único fotograma sin historial. Según la model card, el entrenamiento se realizó íntegramente sobre ground truth autogenerado, sin ninguna etiqueta humana, con una fábrica de autolabel incluida en el repositorio. No se especifican en la información disponible el número de tokens o fotogramas de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (técnicas, por otra parte, propias de modelos de lenguaje y no de este tipo de red). El ONNX usa opset 17 sin operadores personalizados, y existe un plugin CUDA opcional de lift con tablas de frustum (`lift_plugin_tables_r64/`) que según la ficha aporta entre −4 y 5 ms en Orin.

## Capacidades

- Percepción BEV multi-tarea simultánea: segmentación de carril en 9 clases, ocupación semántica 3D, occupancy flow y campo de riesgo por área en una sola pasada.
- Detección 3D de objetos orientados (vehículos y VRU) con flag de aparcado/detenido y detección de obstáculos desconocidos.
- Estimación de profundidad métrica con 64 bins por cámara, más salida de profundidad esperada en metros.
- Segmentación semántica 2D (21 clases) y detección 2D (10 clases) por cámara, esta última a tres escalas.
- Predicción de trayectorias futuras de otros agentes (3 s) y forecasting multimodal.
- Planificación end-to-end: K=3 trayectorias de ego de 3 s (6 tramos de 0,5 s) con confianzas asociadas y salidas de control directo (steer, accel, brake).
- Reconocimiento del estado del semáforo relevante para el ego.
- Procesamiento multi-cámara sincronizado: 8 vistas con calibración (intrínsecos y transformadas ego→cámara) y velocidad del ego como entradas auxiliares.
- Ejecución en tiempo casi real en hardware edge (Jetson AGX Orin) mediante TensorRT INT8 con CUDA Graph.
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión genérica, audio o modo "thinking": no aplica, no es un modelo de lenguaje ni un VLM.

## Casos de uso

- Percepción BEV para conducción autónoma urbana: el modelo entrega carriles, obstáculos, ocupación y riesgo en una sola pasada, lo que simplifica la integración al reducir doce salidas a un único grafo ONNX que puede ejecutarse con TensorRT ≥ 8.6 sin plugins.
- Planificación end-to-end en lazos cerrados de control: con K=3 trayectorias de 3 s más steer/accel/brake, se puede usar directamente como generador de candidatos de trayectoria o como módulo de comparación frente a un planificador clásico basado en reglas.
- Fábrica de autoetiquetado para datasets de conducción: las salidas de detección 3D, segmentación 2D/3D, profundidad y ocupación sirven para preanotar grandes volúmenes de clips de 8 cámaras, reduciendo el coste de anotación humana en pipelines de datos.
- Despliegue en flotas con hardware embebido: con ~70 ms por fotograma en AGX Orin en INT8, encaja en vehículos con presupuesto energético y térmico reducido donde no cabe una GPU de centro de datos.
- Validación y regresión offline de stacks de percepción: al ser un ONNX determinista con contrato de entrada bien definido, permite comparar versiones de modelo sobre los escenarios de demo (`meteor-demo-scenes`) y detectar regresiones por tarea.
- Investigación en representaciones BEV y lift por profundidad: el checkpoint `.pt` sin estado de optimizador se puede usar para fine-tuning, sondeo de features o reexportación con la entrada LiDAR activada.
- Análisis de riesgo y escenarios críticos: las salidas de campo de riesgo, obstáculos desconocidos y forecasting de agentes permiten priorizar casos límite para simulación y verificación.
- Navegación de robots móviles en entornos no estructurados: la ocupación semántica 3D y el mapa de obstáculos desconocidos son reutilizables fuera del dominio de conducción en carretera, siempre que las cámaras y la calibración se ajusten al contrato de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta cifras de latencia, que se recogen en la siguiente tabla:

| Métrica | Plataforma | Valor |
|---|---|---|
| Latencia por fotograma de 8 cámaras | Jetson AGX Orin, INT8, CUDA Graph, zero-copy | ~70 ms de mediana |
| Latencia por fotograma de 8 cámaras | Workstation fp16, TensorRT 8.6, sin plugins, GPU de centro de datos | ~30 ms |
| Mejora por plugin CUDA de lift | Jetson Orin | −4 a 5 ms |

No se dispone de valores de precisión (mAP, IoU, errores de planificación, etc.) en la información proporcionada.

## Requisitos de hardware

- Memoria estimada de pesos: unos 108 MB en fp16 y unos 54 MB en INT8 para los 54 M de parámetros (cálculo aritmético a partir del recuento de parámetros; el autor no publica cifras de VRAM). A ello hay que sumar activaciones: la feature BEV de 96 × 800 × 500 en fp16 ronda los 77 MB, más los mapas intermedios de las 8 cámaras a 768 × 432 y las cabezas de tarea. El repositorio completo ocupa 0,6 GB, pero incluye checkpoint, ONNX, tablas y metadatos, no solo el modelo desplegado.
- GPU documentadas por el autor: Jetson AGX Orin (INT8) y una GPU de centro de datos sin modelo especificado (fp16). La ficha no nombra A100, H100 ni modelos concretos.
- Compatibilidad consumer: por tamaño (54 M de parámetros) y por la latencia publicada en fp16 sobre GPU de centro de datos, es razonable esperar que quepa en GPU de consumo con soporte de fp16 y TensorRT, pero el autor no publica mediciones en RTX 4090, RTX 3090 ni similares, por lo que no hay dato confirmado.
- Precisión: INT8 en Orin con calibración sobre fotogramas reales; fp16 en el resto, lo que requiere GPUs con soporte de fp16/TensorRT (arquitecturas Turing o posteriores en el caso de NVIDIA).
- Opciones de despliegue: ONNX Runtime (para validación con `hf/onnx_smoke_test.py`), TensorRT mediante `deploy/runtime.py` o `deploy/orin_realtime.py` en Python, y runtime C++ en `deploy/cpp`. Los motores TensorRT no se distribuyen y deben compilarse localmente (`deploy/build_engine_fp16.py` en workstation, `deploy/orin_build_int8.py` en Jetson).
- Latencia y throughput: ~70 ms por fotograma de 8 cámaras en AGX Orin INT8 (equivalente a unos 14 FPS) y ~30 ms en workstation fp16 (unos 33 FPS). No se publican cifras de throughput con batching ni consumo energético.
- Nota de integración: no existe todavía un nodo de Autoware (ROS 2); el modelo se distribuye como modelo de referencia con sus propios runtimes.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. METEOR pertenece a la categoría de redes de percepción BEV multi-tarea para conducción autónoma (junto a propuestas como BEVFusion, UniAD o BEVFormer), pero la ficha consultada no incluye especificaciones, resultados ni tablas comparativas de terceros, por lo que no es posible rellenar una comparación con datos verificables.

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| METEOR (`tmmsunny012/meteor`) | 54 M | 8 cámaras a 768 × 432, BEV 800 × 500 a 0,2 m | Sin benchmarks de precisión publicados; ~70 ms en AGX Orin INT8 y ~30 ms en workstation fp16 | Apache-2.0 | Pesos PyTorch + ONNX en HuggingFace; runtimes en GitHub |
| Alternativas de la misma categoría (p. ej. BEVFusion, UniAD, BEVFormer) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No existe nodo de Autoware (ROS 2): el modelo se publica como modelo de referencia con runtimes propios, lo que implica trabajo de integración adicional para llevarlo a un stack ROS 2 en producción.
- Modelo single-frame: la memoria temporal está presente en el checkpoint pero se elimina en la exportación ONNX, de modo que el modelo desplegado no explota información de fotogramas anteriores. Esto puede degradar el rendimiento en situaciones que dependen del contexto temporal.
- Exportación cámara-solo: el ONNX distribuido no usa LiDAR ni mapa SD. Aunque el checkpoint admite esas entradas, alimentarlas con ceros equivale a no usarlas, así que la versión desplegada pierde esa señal.
- Ground truth autogenerado y cero etiquetas humanas: el entrenamiento se basa íntegramente en etiquetas producidas automáticamente, lo que introduce ruido de etiquetado sistemático cuya magnitud no se cuantifica en la información disponible.
- Ausencia de benchmarks de precisión: no hay mAP, IoU, métricas de profundidad ni evaluaciones de planificación publicadas, por lo que no es posible estimar la calidad real de las salidas frente a alternativas.
- Sesgo de dominio: el modelo se entrena con datos del sistema de grabación DRS de TIER IV, con un conjunto fijo de 8 cámaras y un orden concreto. Cambiar la configuración de sensores, la calibración o el entorno geográfico puede provocar degradación no medida.
- Riesgo de alucinación en el sentido de detecciones o trayectorias plausibles pero incorrectas: al ser un modelo de percepción y planificación sin capa de verificación simbólica, las salidas deben validarse con lógica de seguridad antes de cualquier actuación sobre el vehículo.
- Latencia dependiente del hardware: los ~70 ms en AGX Orin y los ~30 ms en workstation son cifras específicas de esas plataformas y de INT8/fp16 con TensorRT. No hay garantía de que se mantengan en otros aceleradores.
- Los motores TensorRT no se distribuyen: es obligatorio compilarlos localmente para la GPU y versión de TensorRT concretas, lo que añade fricción al despliegue y riesgo de incompatibilidades.
- Discrepancia de identificadores: el repositorio consultado es `tmmsunny012/meteor`, mientras que la model card y los comandos de descarga apuntan a `AutowareFoundation/meteor`. Conviene verificar el origen y la integridad con `SHA256SUMS` antes de usar los artefactos.
- Licencia Apache-2.0: permite uso comercial con las obligaciones habituales de atribución y conservación de avisos. No se declaran pesos con licencias adicionales ni restricciones específicas de uso, pero tampoco se ofrece garantía alguna.
- Atribución inusual: la model card afirma que el proyecto fue escrito por Claude (Anthropic) de forma autónoma. Se trata de una declaración del autor, no verificada de forma independiente, y debe considerarse al evaluar la madurez del software asociado.
- Metadatos de fecha: la información de HuggingFace registra la creación y última actualización el 12 de septiembre de 2026, con cero descargas y cero likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace (repositorio consultado): https://huggingface.co/tmmsunny012/meteor
- Repositorio de referencia citado en la model card: https://huggingface.co/AutowareFoundation/meteor
- Escenas de demo para ejecutar el modelo: https://huggingface.co/datasets/AutowareFoundation/meteor-demo-scenes
- Código, receta de entrenamiento, fábrica de autolabel y runtimes Python/C++ TensorRT: https://github.com/tier4/METEOR
- Artículos, blogs o papers adicionales: no disponible en la información proporcionada.

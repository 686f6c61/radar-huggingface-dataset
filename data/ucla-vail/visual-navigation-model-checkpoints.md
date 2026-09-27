# UCLA-VAIL/Visual-Navigation-Model-Checkpoints

## Resumen

Visual Navigation Model Checkpoints es un repositorio de pesos publicado por el laboratorio UCLA-VAIL que contiene dos políticas de navegación visual preentrenadas con el toolkit VisNavKit. No es un modelo de lenguaje: se trata de políticas robóticas que, a partir de un historial de fotogramas RGB, parches de ruta, un objetivo puntual (point goal) y el estado ego del robot, generan planes de trayectoria futuros con sus probabilidades asociadas y una consigna de velocidad. El repositorio incluye, para cada variante, el checkpoint de PyTorch Lightning, su exportación a ONNX, los metadatos de exportación y un lote de entrada de muestra para pruebas de humo.

Las dos variantes comparten el mismo esquema de entrenamiento FlowPilot-DST (flow matching con anclas) pero se diferencian en el codificador visual y en el tamaño: `flowpilot-dst-small` usa FastViT-T12 sobre pares de fotogramas y un DiT de flujo anclado de 256 dimensiones con 21,4 M de parámetros, mientras que `flowpilot-dst-dune` emplea un DUNE ViT-B/14 congelado y un DiT de 1024 dimensiones con 208,2 M de parámetros. La variante grande obtiene mejores métricas de validación (ADE@1/2/4 s de 0,080/0,168/0,364 m frente a 0,093/0,193/0,422 m), a costa de un orden de magnitud más de cómputo.

Su relevancia actual es doble: por un lado, publica pesos listos para despliegue en formato ONNX (fp32, opset 17, batch 1) con paridad PyTorch/ONNX verificada por debajo de 1e-5, lo que elimina la dependencia del framework de entrenamiento en producción; por otro, es uno de los pocos repositorios de navegación visual que documenta explícitamente el contrato de entrada/salida del grafo exportado, incluyendo la preparación de fotogramas, lo que facilita la integración en pilas robóticas reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual (FastViT-T12 sobre pares de fotogramas en `small`; DUNE ViT-B/14 congelado en `dune`) + DiT de flujo anclado (anchored flow DiT) de 256 d (`small`) o 1024 d (`dune`); política de navegación FlowPilot-DST |
| Parametros totales | 21,4 M (`flowpilot-dst-small`) / 208,2 M (`flowpilot-dst-dune`) |
| Parametros activos | No aplica: no es una arquitectura MoE |
| Longitud de contexto | No aplica como contexto de LLM. Historial de observacion: 20 fotogramas a 20 Hz (1 s). Horizonte de prediccion: 4 s, decodificado en 80 pasos de 0,05 s |
| Tipos de cuantizacion | Solo fp32 en el grafo ONNX publicado. No se distribuyen pesos en fp16, int8 ni otros formatos cuantizados |
| Idiomas soportados | No disponible / no aplica: la entrada es visual y de estado ego, no hay interfaz de lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint de PyTorch Lightning (`.ckpt`, incluye estado del optimizador) y exportacion ONNX (`.onnx`, fp32, opset 17); metadatos en `.metadata.json` y entradas de muestra en `.inputs.npz` |

Datos adicionales del repositorio: tamano del repo de 2,9 GB, pipeline declarado `robotics`, libreria `visnavkit`, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 27 de septiembre de 2026.

## Arquitectura y entrenamiento

FlowPilot-DST es una política de navegación basada en flow matching con anclas. La observación se compone de los últimos 20 fotogramas RGB (tensor de forma `(1, 20, 3, 216, 384)` en rango [0, 1]), parches de ruta, el objetivo puntual, la velocidad y la tasa de guiñada del robot, y los límites de acción. El codificador visual procesa esta información y alimenta un transformer de difusión (DiT) que genera planes de trayectoria mediante un proceso de flujo con 64 anclas obtenidas por k-means y 4 pasos de flujo. Los planes se decodifican desde ruido cero y el modelo devuelve hasta seis planes candidatos con sus probabilidades, además de la consigna de velocidad.

El entrenamiento se realizó sobre el conjunto clips1k de VisNavKit, muestreado a 20 Hz con un horizonte de 4 s, objetivo puntual con 50 % de dropout y un VAE de ruta congelado. La variante `small` usa FastViT-T12 sobre pares de fotogramas; la variante `dune` usa un DUNE ViT-B/14 congelado como extractor de características. La exportación a ONNX es de batch 1 y recupera los 6 mejores planes. No se documentan en la información disponible el número total de tokens o episodios de entrenamiento, la composición detallada del dataset ni si hubo etapas de ajuste con RLHF o DPO (técnicas, por otra parte, propias de modelos de lenguaje y no de esta categoría).

## Capacidades

- Predicción de trayectorias multimodales: devuelve hasta 6 planes candidatos con probabilidades asociadas (`modes`, `probs`) más una consigna de velocidad (`speed`).
- Navegación a objetivo puntual (point-goal navigation) en entornos visuales, con soporte de dropout de objetivo durante el entrenamiento para tolerar objetivos ausentes o degradados en inferencia.
- Condicionamiento por ruta: acepta parches de ruta además del objetivo, lo que permite guiar la política a lo largo de un corredor o camino predefinido.
- Fusión de percepción visual y estado propio: integra historial de 20 fotogramas RGB con velocidad y tasa de guiñada del robot, además de límites de acción.
- Generación de acciones a frecuencia de control: los planes se emiten como 80 pasos de 0,05 s en el marco ego (x hacia delante, y hacia la izquierda), es decir, cubren 4 s de horizonte.
- Despliegue independiente del framework: el grafo ONNX se ejecuta con ONNX Runtime sin necesidad de instalar VisNavKit.
- Reexportación desde el checkpoint original con la herramienta `visnavkit-export-dst` para modificar el grafo si es necesario.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje, capacidades multilingües ni modalidades de audio o texto.

## Casos de uso

- Navegación autónoma de robots móviles en interiores: la política consume el historial visual y el estado ego para producir consignas de velocidad y trayectoria a 20 Hz, adecuada para bucles de control de bajo nivel en robots con LiDAR o cámara RGB.
- Robots móviles autónomos (AMR) en almacenes: el condicionamiento por ruta permite seguir pasillos predefinidos mediante parches de ruta, mientras el objetivo puntual define la estación de destino.
- Reparto de última milla con plataformas terrestres: el horizonte de predicción de 4 s y la salida de velocidad permiten planificar maniobras suaves evitando cambios bruscos de consigna.
- Integración en pilas ROS 2: al exportarse a ONNX con batch 1 y ejecutarse en ONNX Runtime, el grafo puede encapsularse en un nodo que publique `cmd_vel` a partir de la salida `speed`.
- Despliegue en robótica de bajo consumo: la variante `small` con 21,4 M de parámetros está pensada para hardware con recursos limitados, como Jetson Orin Nano en modo CPU o GPU integrada.
- Navegación de drones o plataformas aéreas con carga útil limitada: la variante `small` reduce el coste de cómputo a bordo manteniendo un error de posición final de 0,897 m en validación.
- Generación de datos sintéticos y aumento de datasets: los planes multimodales con probabilidades permiten muestrear trayectorias diversas para entrenar políticas downstream o evaluar planificadores.
- Investigación en flow matching aplicado a control: la separación entre codificador visual y DiT de flujo anclado facilita experimentos de sustitución de codificador y comparación de métricas con la misma cabeza de decodificación.
- Pruebas de humo y validación de exportaciones: el lote `.inputs.npz` incluido permite verificar la paridad PyTorch/ONNX en un pipeline de CI sin acceso a datos reales del robot.

## Benchmarks y rendimiento

Métricas de validación publicadas por el autor sobre el split de validación clips1k de VisNavKit, decodificadas desde ruido cero:

| Modelo | Parametros | Val top-1 ADE@1 s (m) | Val top-1 ADE@2 s (m) | Val top-1 ADE@4 s (m) | Val top-1 FDE (m) |
|---|---|---|---|---|---|
| flowpilot-dst-small | 21,4 M | 0,093 | 0,193 | 0,422 | 0,897 |
| flowpilot-dst-dune | 208,2 M | 0,080 | 0,168 | 0,364 | 0,769 |

No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K) en la información disponible, ya que no se trata de un modelo de lenguaje. Tampoco se proporcionan métricas de tasa de éxito en tareas de navegación real ni comparaciones con otras políticas externas.

## Requisitos de hardware

- VRAM estimada para la variante `small` (21,4 M de parámetros): pesos en fp32 de aproximadamente 86 MB; con activaciones y tensor de entrada (una secuencia de 20 fotogramas a 216x384 en fp32 ocupa unos 19 MB) el consumo total es inferior a 1 GB de VRAM.
- VRAM estimada para la variante `dune` (208,2 M de parámetros): pesos en fp32 de aproximadamente 833 MB; con el ViT-B/14 y las activaciones del DiT de 1024 dimensiones, se estima un rango de 2 a 4 GB de VRAM. Estimación propia a partir del recuento de parámetros, no confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para `dune`; la variante `small` puede ejecutarse incluso en CPU. Para lotes grandes o pipelines de evaluación masiva, GPU tipo RTX 4090, A100 o H100 son adecuadas pero sobredimensionadas para inferencia de batch 1.
- Compatibilidad con GPU de consumo: sí. Ambas variantes caben en tarjetas de gama media como RTX 3060 o superiores; `small` es viable en plataformas embebidas con aceleración (Jetson Orin Nano o similar).
- Opciones de despliegue: ONNX Runtime con `CUDAExecutionProvider` o `CPUExecutionProvider` (documentado por el autor); también es posible exportar a TensorRT a partir del grafo ONNX. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. Para reexportar el grafo desde el checkpoint es necesario instalar VisNavKit.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los únicos datos comparativos publicados en la información disponible son entre las dos variantes del propio repositorio:

| Modelo | Parametros | Codificador | Dimension del DiT | Val top-1 ADE@4 s (m) | Val top-1 FDE (m) | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| flowpilot-dst-small | 21,4 M | FastViT-T12 | 256 | 0,422 | 0,897 | Apache-2.0 | ckpt + ONNX fp32 |
| flowpilot-dst-dune | 208,2 M | DUNE ViT-B/14 (congelado) | 1024 | 0,364 | 0,769 | Apache-2.0 (revisar licencia de DUNE) | ckpt + ONNX fp32 |

La variante `dune` mejora el ADE@4 s en un 13,7 % y el FDE en un 14,3 % respecto a `small`, multiplicando por 9,7 el número de parámetros. No se proporcionan datos de otras políticas de navegación visual comparables en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo de texto: carece de interfaz conversacional, tool calling, agentes y capacidades multilingües. Cualquier uso fuera del ámbito de la navegación visual requiere reentrenamiento.
- Los sesgos conocidos no están documentados en la información disponible. Al entrenarse sobre el conjunto clips1k de VisNavKit, es previsible un sesgo hacia la distribución de entornos, sensores y dinámicas presentes en ese dataset, con degradación ante cambios de dominio (iluminación, tipo de cámara, superficies).
- Riesgo de alucinación en el sentido de planes de trayectoria no realizables o inconsistentes con el entorno, especialmente cuando el objetivo puntual no se proporciona en inferencia, ya que el modelo se entrenó con un 50 % de dropout de objetivo.
- Las métricas publicadas corresponden a validación offline (ADE y FDE en el split clips1k) y no garantizan tasas de éxito en despliegues reales; no se aportan métricas de navegación en simulación o en robot físico.
- Restricción de formato: solo se distribuyen pesos en fp32. No hay versiones cuantizadas, lo que limita la reducción de huella en memoria en plataformas embebidas.
- Licencia Apache-2.0 para los checkpoints y el grafo ONNX, lo que permite uso comercial. La variante `dune` incorpora el codificador DUNE ViT-B/14 de NAVER, un componente de terceros cuya licencia debe verificarse de forma independiente antes de un uso comercial.
- Los checkpoints de Lightning incluyen el estado del optimizador, lo que explica el tamano del repo (2,9 GB) y no es necesario para inferencia; conviene descargar únicamente el ONNX si el objetivo es desplegar.
- La exportación ONNX es de batch 1, lo que impide procesar varios robots en un mismo grafo sin reexportar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y una ventana de publicación muy reciente (creado el 27 de septiembre de 2026): la validación por parte de terceros es todavía inexistente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/UCLA-VAIL/Visual-Navigation-Model-Checkpoints
- VisNavKit (toolkit de entrenamiento y exportación, VAIL-UCLA): https://github.com/VAIL-UCLA/visnavkit
- Documentación del contrato de entrada/salida ONNX de FlowPilot-DST: https://github.com/VAIL-UCLA/visnavkit/blob/dev/docs/flowpilot_dst_onnx.md
- Paper de FlowPilot: https://arxiv.org/abs/2606.12603
- Codificador DUNE (NAVER): https://github.com/naver/dune

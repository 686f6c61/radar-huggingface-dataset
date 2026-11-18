# xmaxmex/P2PNet-SHTechA-onnx

## Resumen

P2PNet-SHTechA-onnx es una exportación a formato ONNX del modelo P2PNet (Point-to-Point Network), una red neuronal convolucional diseñada específicamente para el conteo de personas en imágenes de multitudes (crowd counting). El modelo ha sido convertido desde los pesos originales de PyTorch (`SHTechA.pth`) por el usuario xmaxmex, empleando la herramienta de exportación oficial del repositorio CrowdCounting-P2PNet con entrada fija de 768x1280 píxeles y simplificación del grafo ONNX.

P2PNet aborda el problema del conteo de multitudes reformulándolo como una tarea de predicción de puntos: en lugar de generar un mapa de densidad, el modelo predice directamente las coordenadas de las cabezas de las personas junto con una puntuación de confianza para cada punto. Esta aproximación elimina la necesidad de estimar kernels gaussianos o de postprocesar mapas de densidad, lo que simplifica el pipeline y reduce el error en escenarios de alta densidad y oclusión.

La relevancia de esta ficha concreta reside en su formato: al estar exportado a ONNX con dimensiones fijas, el modelo puede desplegarse en entornos de inferencia sin dependencia de PyTorch, lo que facilita su integración en aplicaciones de producción, sistemas embebidos o pipelines de visión por computador basados en ONNX Runtime. El repositorio tiene un tamaño de 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | P2PNet (red convolucional con predicción de puntos y cabezas de regresión) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 768x1280) |
| Tipos de cuantizacion | no disponible (pesos ONNX en precisión original, presumiblemente FP32) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

P2PNet es una arquitectura de conteo de multitudes basada en predicción de puntos. El modelo procesa una imagen de entrada mediante un backbone convolucional (habitualmente VGG16 en la implementación original de CrowdCounting-P2PNet, aunque no se confirma en la información disponible) y genera dos ramas de salida: una para las coordenadas de los puntos (posiciones de las cabezas) y otra para las puntuaciones de confianza asociadas. La asignación de puntos se realiza mediante un mecanismo de matching húngaro durante el entrenamiento, que empareja las predicciones con las anotaciones ground truth.

El checkpoint exportado corresponde al conjunto de datos SHTechA (ShanghaiTech Part A), un benchmark estándar de conteo de multitudes que contiene imágenes de escenas densas con anotaciones de puntos en las cabezas. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni sobre el uso de técnicas de RLHF o DPO, ya que no aplican a este tipo de modelo y no se documentan en la model card. La exportación a ONNX se realizó con `--img-size 768 1280` y `--simplify`, fijando las dimensiones de entrada y simplificando el grafo para optimizar la inferencia.

## Capacidades

- Conteo de personas en imágenes de multitudes mediante predicción de puntos en las cabezas.
- Localización de individuos: devuelve coordenadas (x, y) de cada punto detectado junto con una puntuación de confianza.
- Funcionamiento en escenas densas y con oclusiones parciales, gracias al enfoque de predicción directa de puntos.
- Entrada de imagen de tamaño fijo 768x1280 píxeles (no admite resoluciones variables en esta exportación).
- Inferencia sin dependencia de PyTorch: el formato ONNX permite ejecución con ONNX Runtime, TensorRT u otros motores compatibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües (es un modelo puramente visual).
- No dispone de modo thinking, visión general (solo conteo), audio ni generación de texto.

## Casos de uso

- **Monitorización de aforo en espacios públicos**: el modelo puede estimar el número de personas en una imagen de una plaza, estación o evento, permitiendo a los operadores tomar decisiones sobre control de masas. Su entrada fija de 768x1280 encaja con cámaras de vigilancia estándar.
- **Análisis de densidad en transporte público**: integrado en un pipeline de ONNX Runtime, puede procesar fotogramas de cámaras de andenes o vagones para generar métricas de ocupación en tiempo casi real, sin necesidad de infraestructura PyTorch.
- **Gestión de eventos y recintos**: permite cuantificar la asistencia y detectar aglomeraciones en recintos cerrados o al aire libre, alimentando paneles de control con conteos por zona.
- **Investigación en visión por computador**: sirve como baseline reproducible para experimentos de conteo de multitudes, al estar exportado a ONNX y ser ejecutable en múltiples frameworks.
- **Despliegue en dispositivos edge**: al ser un modelo ONNX de 0,1 GB, puede ejecutarse en dispositivos con recursos limitados (Jetson, Raspberry Pi con acelerador, etc.) para conteo local sin conexión a la nube.
- **Automatización de auditorías de ocupación**: en sectores como retail o facility management, el modelo puede procesar imágenes archivadas para estimar la afluencia histórica y optimizar la disposición de personal.
- **Integración en sistemas de videovigilancia existentes**: al no requerir PyTorch, se puede incorporar en plataformas que ya utilizan ONNX Runtime para otras tareas de visión, reduciendo la complejidad del stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible con precisión; al tratarse de un modelo ONNX de 0,1 GB, es probable que requiera menos de 2 GB de VRAM en FP32, aunque no se confirma en la información proporcionada.
- **GPU recomendadas**: no disponible. Por el tamaño del repositorio, es plausible que funcione en GPUs consumer como RTX 3060, RTX 4060 o superiores, pero no se documenta.
- **Compatibilidad con GPU consumer**: probablemente sí, dado el reducido tamaño del modelo, aunque no se confirma oficialmente.
- **Opciones de despliegue**: ONNX Runtime (CPU y GPU), TensorRT, OpenVINO y otros motores compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a modelos de visión de este tipo).
- **Latencia y throughput estimados**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| P2PNet-SHTechA-onnx | no disponible | 768x1280 fijo | Conteo de multitudes | no disponible | ONNX |
| CSRNet | no disponible | Resolución variable | Conteo de multitudes (mapa de densidad) | no disponible | PyTorch |
| CANNet | no disponible | Resolución variable | Conteo de multitudes (mapa de densidad) | no disponible | PyTorch |
| MCNN | no disponible | Resolución variable | Conteo de multitudes (mapa de densidad) | no disponible | PyTorch |

La comparativa se limita a modelos de la misma categoría (conteo de multitudes). No se dispone de datos de rendimiento ni de licencia para establecer una comparación cuantitativa rigurosa. La principal diferencia de esta exportación es su formato ONNX con entrada fija, frente a las implementaciones PyTorch de resolución variable de las alternativas.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica la licencia del modelo, lo que impide confirmar si su uso comercial está permitido. Es imprescindible contactar con el autor o consultar el repositorio original de P2PNet antes de usarlo en producción.
- **Entrada fija**: la exportación ONNX está fijada a 768x1280 píxeles; no admite resoluciones variables sin reexportar el modelo.
- **Sesgo de dominio**: el modelo fue entrenado con SHTechA (ShanghaiTech Part A), por lo que su rendimiento puede degradarse en escenas con características visuales distintas (interiores, iluminación nocturna, otras densidades de multitud).
- **Riesgo de falsos positivos y negativos**: en escenas muy densas o con oclusiones severas, el conteo puede ser impreciso; no se documentan métricas de error (MAE/MSE) en la información disponible.
- **Sin soporte multilingüe ni de texto**: no es un modelo de lenguaje; no puede emplearse para tareas de generación de texto, razonamiento o agentes.
- **Advertencias de exportación**: durante la conversión a ONNX se emitieron avisos de TracerWarning sobre la conversión de tensores a enteros y el registro de constantes, lo que podría afectar a la generalización del grafo si se usan entradas distintas a las de exportación.
- **Sin mantenimiento documentado**: el repositorio no registra descargas ni interacciones, y no se especifica si el autor ofrece soporte o actualizaciones.
- **Formato ONNX sin cuantización documentada**: se desconoce si los pesos están en FP32 o en otra precisión; esto afecta a los requisitos de memoria y a la latencia.

## Enlaces

- [Hugging Face: xmaxmex/P2PNet-SHTechA-onnx](https://huggingface.co/xmaxmex/P2PNet-SHTechA-onnx)
- Repositorio original de P2PNet (CrowdCounting-P2PNet): no se proporciona URL en la información disponible, aunque se menciona en la model card como `CrowdCounting-P2PNet-main`.
- Paper de P2PNet: no disponible en la información proporcionada.
- Demo o blog oficial: no disponible.

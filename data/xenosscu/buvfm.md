# xenosscu/BUVFM

## Resumen

BUVFM (Breast Ultrasound Video Foundation Model) es un modelo fundacional de visión por computador especializado en ecografía mamaria, desarrollado por el grupo SCU-MILAB y publicado en el repositorio de Hugging Face `xenosscu/BUVFM`. Se presenta como el motor del sistema AI-enabled Breast Ultrasound Screening (AIBS), que combina control de calidad en tiempo real desplegado en el borde (edge) con estratificación de riesgo BI-RADS en la nube. El modelo se ha preentrenado de forma auto-supervisada sobre 84.021 secuencias de vídeo de ecografía mamaria que suman 423.493 fotogramas, y se distribuye junto con checkpoints afinados para clasificación BI-RADS y modelos destilados para detección de lesiones.

La arquitectura se basa en V-JEPA (Video Joint-Embedding Predictive Architecture) con backbones ViT en tres escalas: ViT-Large, ViT-Huge y ViT-Giant. El repositorio incluye tanto los pesos preentrenados de cada backbone como los checkpoints afinados para clasificación BI-RADS y los modelos resultantes de destilación de conocimiento, incluyendo un detector YOLO de lesiones destilado a partir de BUVFM y detectores comparativos destilados desde otros modelos fundacionales (BUSGen, EchoCare, OpenUS, USCL, USF-MAE, USFM, UltraFedFM, UltraSAM, V-JEPA2, VideoMAEv2, VideoVAE_plus).

El modelo es relevante ahora por su enfoque en un dominio clínico crítico (cribado de cáncer de mama por ecografía) y por su estrategia de despliegue mixto: modelos ligeros destilados para inferencia en el borde y modelos grandes para estratificación de riesgo en la nube. La licencia MIT facilita su reutilización, aunque el tamaño del repositorio (41 GB) y la ausencia de una model card detallada sobre datos de entrenamiento y evaluación limitan la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | V-JEPA (Video Joint-Embedding Predictive Architecture) con backbones ViT-Large, ViT-Huge y ViT-Giant |
| Parametros totales | No disponible (el tamaño de los pesos sugiere ViT-Giant ~15,7 GB, ViT-Huge ~9,9 GB, ViT-Large ~4,9 GB; número exacto de parámetros no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch) |

## Arquitectura y entrenamiento

BUVFM emplea una arquitectura V-JEPA, un marco de aprendizaje auto-supervisado para vídeo que predice representaciones latentes en lugar de píxeles. Los backbones son Vision Transformers (ViT) en tres escalas: ViT-Large, ViT-Huge y ViT-Giant. El preentrenamiento se realizó sobre 84.021 secuencias de vídeo de ecografía mamaria que totalizan 423.493 fotogramas, lo que constituye un corpus considerable para un dominio clínico tan específico. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO (no aplicables directamente a un modelo de visión, pero no se especifica si hubo ajuste fino supervisado adicional).

El repositorio incluye tres tipos de artefactos: (1) los pesos preentrenados de los tres backbones, punto de partida para ajuste fino estándar; (2) los checkpoints afinados para clasificación BI-RADS (ViT-Giant, ViT-Huge y ViT-Large), incluyendo el checkpoint reportado en el paper; y (3) modelos resultantes de destilación de conocimiento, tanto para clasificación (en dos etapas: alineación de características y ajuste fino posterior) como para detección (un detector YOLO de lesiones destilado desde BUVFM, con variantes comparativas destiladas desde otros modelos fundacionales). La destilación permite obtener modelos ligeros (del orden de megabytes) aptos para despliegue en el borde, mientras que los backbones grandes quedan para la nube.

## Capacidades

- Clasificación de secuencias de vídeo de ecografía mamaria para estratificación de riesgo BI-RADS.
- Detección de lesiones en ecografía mamaria mediante el detector YOLO destilado.
- Procesamiento de vídeo (no solo imágenes estáticas): el preentrenamiento se realizó sobre secuencias de vídeo.
- Control de calidad en tiempo real en despliegue edge (según la descripción del sistema AIBS).
- Estratificación de riesgo en la nube con los backbones grandes.
- Ajuste fino para tareas de clasificación y detección en el dominio de ecografía mamaria.
- No se especifica soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no aplicables a un modelo de visión clínica).
- No se documentan capacidades de visión general, audio ni modo thinking.

## Casos de uso

- Cribado de cáncer de mama en entornos rurales: el sistema AIBS descrito en el paper emplea BUVFM para estratificación BI-RADS en la nube, lo que permite llevar cribado asistido por IA a zonas con acceso limitado a radiólogos especializados.
- Control de calidad en tiempo real en el dispositivo de ecografía: los modelos destilados (del orden de 4-6 MB para clasificación y 38 MB para detección) pueden ejecutarse en el borde para verificar la calidad de la adquisición antes de enviar el estudio a la nube.
- Detección automática de lesiones: el detector YOLO destilado desde BUVFM (`distill/det/output/ckpts/distilled.pt`, 38,7 MB) permite localizar lesiones en fotogramas de ecografía, útil como ayuda a la lectura o para triaje.
- Ajuste fino para tareas clínicas específicas: los backbones preentrenados (ViT-L, ViT-H, ViT-G) sirven como punto de partida para fine-tuning en tareas downstream como clasificación de benignidad/malignidad o subtipos de lesión.
- Investigación en modelos fundacionales médicos: el repositorio incluye detectores destilados desde otros modelos (BUSGen, EchoCare, OpenUS, USCL, USF-MAE, USFM, UltraFedFM, UltraSAM, V-JEPA2, VideoMAEv2, VideoVAE_plus), lo que facilita estudios comparativos de transferencia y destilación en el dominio de ecografía mamaria.
- Formación y validación de pipelines de IA clínica: la separación entre modelos de borde y de nube, junto con los checkpoints de destilación en dos etapas, permite reproducir y evaluar arquitecturas de despliegue realistas en entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un checkpoint "paper-reported" (`ckpts/vjepa_full/best_vjepa_model9639(paper).pt`), lo que sugiere que el paper asociado contiene métricas, pero los valores numéricos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el tamaño de los pesos sugiere que el backbone ViT-Giant (~15,7 GB en pesos) requiere del orden de 16-32 GB de VRAM en precisión completa, el ViT-Huge (~9,9 GB) del orden de 10-20 GB y el ViT-Large (~4,9 GB) del orden de 5-10 GB; estas cifras son estimaciones basadas en el tamaño de los ficheros, no datos publicados.
- GPU recomendadas: no especificadas. Para los backbones grandes se requerirían GPU de centro de datos (A100, H100) o GPUs consumer de gama alta con suficiente VRAM (RTX 4090, 24 GB). Los modelos destilados (4-156 MB) caben en cualquier GPU consumer e incluso en CPU.
- Cabe en GPU consumer: los modelos destilados sí; los backbones ViT-Giant y ViT-Huge probablemente no en GPUs con menos de 24 GB de VRAM.
- Opciones de despliegue: el repositorio proporciona un script de descarga (`download_dataset_ckpt.py`) y una demo Gradio en dos etapas dentro de `SCU-MILAB/AIBUS-CODE`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dominio | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BUVFM | V-JEPA + ViT (L/H/G) | Ecografía mamaria (vídeo) | Secuencias de vídeo | MIT | Hugging Face (`xenosscu/BUVFM`) |
| BUSGen | No disponible | Ecografía mamaria | No disponible | No disponible | Referenciado como modelo comparativo en el repo |
| EchoCare | No disponible | Ecografía (general) | No disponible | No disponible | Referenciado como modelo comparativo en el repo |
| OpenUS | No disponible | Ecografía | No disponible | No disponible | Referenciado como modelo comparativo en el repo |
| USCL / USF-MAE / USFM | No disponible | Ecografía | No disponible | No disponible | Referenciados como modelos comparativos en el repo |
| UltraSAM | No disponible | Ecografía | No disponible | No disponible | Referenciado como modelo comparativo en el repo |
| V-JEPA2 | V-JEPA | Vídeo general | Secuencias de vídeo | No disponible | Referenciado como modelo comparativo en el repo |

No se dispone de datos de rendimiento comparativo (parámetros, contexto, métricas) para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un corpus clínico concreto (84.021 secuencias), puede presentar sesgo de dominio respecto a poblaciones, equipos de ecografía o protocolos de adquisición no representados.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero existe riesgo de falsos positivos/negativos en clasificación BI-RADS y detección de lesiones, con implicaciones clínicas directas.
- Limitaciones de contexto o idioma: no aplica idioma (modelo de visión). La longitud de contexto (número de fotogramas por secuencia) no está documentada.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; sin embargo, el uso clínico real requiere validación regulatoria independiente que no se documenta.
- Caveats para producción: el repositorio es de 41 GB y los pesos están en formato `.pt` (PyTorch), sin versiones GGUF/ONNX documentadas. No se especifican procesos de validación externa, calibración ni métricas de equidad. La model card no detalla la composición del dataset ni los protocolos de evaluación, lo que limita la reproducibilidad. El uso en diagnóstico clínico debe considerarse experimental hasta que existan validaciones regulatorias y estudios independientes.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/xenosscu/BUVFM
- Hugging Face (dataset): https://huggingface.co/datasets/xenosscu/BUVFM
- Código: https://github.com/SCU-MILAB/AIBUS-CODE
- Homepage: https://scu-milab.github.io/AIBUS/
- Demo: http://buvfm.machineilab.org/
- Colección HF: https://huggingface.co/collections/SCU-MILAB/buvfm

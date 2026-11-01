# vaibhavshiroorkar/deepfake-generalization-demo

## Resumen

`deepfake-generalization-demo` es un repositorio de artefactos de inferencia publicado por el usuario vaibhavshiroorkar en HuggingFace, no un modelo generativo ni un detector empaquetado como producto. Contiene los pesos y exportaciones necesarios para ejecutar una demo pública de detección de deepfakes en vídeo, junto con los historiales de entrenamiento, las métricas de evaluación y el informe final del proyecto. El código fuente reside en un repositorio de GitHub separado y la demo se ejecuta como Space de HuggingFace.

El núcleo técnico es un ensemble visual de seis detectores: tres semillas de EfficientNet y tres de ConvNeXt, entrenados sobre recortes faciales. El repositorio incluye además un modelo de "familiaridad" (authenticity-density) construido sobre el encoder DINOv3 ViT-S/16 de Meta, cuyo propósito es abstenerse de emitir veredicto cuando el clip se aleja de la distribución de entrenamiento. Para el navegador se exportan a ONNX el mejor checkpoint individual (EfficientNet-B0, semilla 17), el detector facial MTCNN de facenet-pytorch y el propio DINOv3.

La relevancia del artefacto es metodológica más que de producto: documenta explícitamente la brecha de generalización del detector. El ensemble alcanza ROC AUC 0,999 en su test in-domain, pero cae a 0,774 en DFDC y a 0,668 en Celeb-DF v2; en este último marca como falso el 73 % de los vídeos reales (113 de 155) con el umbral por defecto. El propio autor advierte de que no debe usarse para dictaminar la autenticidad de un vídeo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de clasificadores de imagen (EfficientNet y ConvNeXt) sobre recortes faciales; encoder auxiliar DINOv3 ViT-S/16 para el modelo de familiaridad; detector facial MTCNN |
| Parametros totales | no disponible (el repositorio no declara el recuento; el checkpoint exportado a navegador es EfficientNet-B0) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de vídeo, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuyen exportaciones ONNX sin cuantización declarada |
| Idiomas soportados | no disponible (la tarea es de visión; no se declara cobertura lingüística) |
| Licencia | all-rights-reserved para los checkpoints propios; DINOv3 License para los ficheros de DINOv3; MIT para MTCNN |
| Formato de pesos | ONNX (`visual-best.onnx`, `pnet.onnx`, `rnet.onnx`, `onet.onnx`, `dinov3.onnx`), checkpoints PyTorch, `gate.json` con los parámetros del modelo de familiaridad y `authenticity-density.npz` |

## Arquitectura y entrenamiento

El sistema se compone de dos capas. La primera es un ensemble visual de seis detectores de deepfake que operan sobre recortes de cara: tres semillas de EfficientNet y tres de ConvNeXt, con sus historiales de entrenamiento incluidos en `runs/program-20260906/checkpoints/`. La segunda es un modelo de familiaridad (`runs/probe-20260914/authenticity-density.npz`) ajustado sobre las representaciones del encoder DINOv3 ViT-S/16 de Meta; su función es estimar si un clip se parece a los datos de entrenamiento y, en caso contrario, hacer que la aplicación se abstenga de emitir veredicto en lugar de arriesgar una predicción fuera de distribución.

Para la demo en navegador, el pipeline se condensa en grafos ONNX: `visual-best.onnx` integra en un único grafo el paso de 16 recortes faciales a logit usando el checkpoint EfficientNet-B0 de la semilla 17; `pnet.onnx`, `rnet.onnx` y `onet.onnx` corresponden al detector MTCNN de facenet-pytorch; `dinov3.onnx` es el encoder DINOv3 ViT-S/16; y `gate.json` serializa el modelo de familiaridad como números planos. La configuración de la webapp (`configs/webapp.yaml`) habilita únicamente el ensemble visual y el mejor modelo individual, y limita las subidas a 30 MB. No se especifican en la información disponible el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO; el repositorio no incluye datasets.

## Capacidades

- Clasificación binaria de vídeo (real frente a deepfake) a partir de recortes faciales, mediante un ensemble de seis detectores.
- Detección facial con MTCNN (redes P-Net, R-Net y O-Net) para localizar y recortar las caras antes de la clasificación.
- Estimación de familiaridad fuera de distribución: el modelo `authenticity-density` permite que la aplicación se abstenga de dar veredicto cuando el clip no se parece a los datos de entrenamiento.
- Inferencia en navegador mediante exportaciones ONNX, sin necesidad de backend de GPU para el modelo individual.
- Evaluación por clip: el repositorio incluye métricas y predicciones individuales para cada conjunto de test en `runs/program-20260906/evaluation/`.
- Generación de informe reproducible en HTML y PDF a partir de los resultados (`dist/`).
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es un clasificador de visión, no un modelo de lenguaje.

## Casos de uso

- Investigación sobre generalización en detección de deepfakes: el repositorio sirve como material reproducible para estudiar la caída de rendimiento entre dominios (AUC 0,999 in-domain frente a 0,668 en Celeb-DF v2) y para comparar estrategias de abstención.
- Evaluación de mecanismos de rechazo fuera de distribución: el modelo de familiaridad sobre DINOv3 permite experimentar con umbrales de abstención y medir su efecto sobre falsos positivos en vídeos reales.
- Demo educativa en navegador: las exportaciones ONNX y la Space pública permiten mostrar a estudiantes cómo funciona un pipeline de detección (MTCNN más clasificador) sin infraestructura de servidor.
- Prototipado de pipelines de visión en ONNX Runtime: los grafos `pnet/rnet/onet` y `visual-best` sirven como referencia para integrar detección facial y clasificación en aplicaciones web con límite de 30 MB por subida.
- Auditoría de sesgo de detector: las predicciones por clip en `evaluation/` permiten analizar la tasa de falsos positivos sobre vídeos reales (113 de 155 en Celeb-DF v2) antes de considerar cualquier despliegue.
- Reproducción de experimentos con semillas múltiples: los seis checkpoints con sus historiales permiten estudiar la varianza entre semillas de EfficientNet y ConvNeXt en la misma tarea.
- Referencia para empaquetado de modelos: el repositorio ilustra cómo separar código (GitHub), artefactos de inferencia (HuggingFace) y demo (Space), con licencias diferenciadas por componente.

## Benchmarks y rendimiento

| Conjunto de test | ROC AUC (ensemble visual) |
|---|---|
| In-domain | 0,999 |
| DFDC | 0,774 |
| Celeb-DF v2 | 0,668 |

En Celeb-DF v2, con el umbral por defecto, el ensemble marca como falso 113 de 155 vídeos reales (aproximadamente el 73 %). No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), ni comparaciones numéricas con detectores alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El checkpoint exportado a navegador es EfficientNet-B0, un modelo pequeño que cabe holgadamente en cualquier GPU consumer; el ensemble completo de seis detectores más DINOv3 ViT-S/16 requiere más memoria, pero el repositorio no declara cifras.
- GPU recomendadas: no disponibles. Por el tamaño de los componentes (EfficientNet-B0, ConvNeXt, ViT-S/16), cualquier GPU consumer reciente debería ser suficiente para el modelo individual; el ensemble completo se beneficia de una GPU con más memoria.
- Cabe en GPU consumer: sí para el modelo individual exportado a ONNX; el ensemble completo no está cuantificado en la información disponible.
- Opciones de despliegue: ONNX Runtime para las exportaciones de navegador; PyTorch para los checkpoints nativos; la demo pública se ejecuta como Space de HuggingFace. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La configuración de la webapp limita las subidas a 30 MB, lo que acota el coste por petición, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| deepfake-generalization-demo | Ensemble EfficientNet/ConvNeXt + DINOv3 ViT-S/16 | no disponible | no aplica | AUC 0,999 in-domain; 0,774 DFDC; 0,668 Celeb-DF v2 | all-rights-reserved (checkpoints propios) | HuggingFace + Space |
| Detector MTCNN de facenet-pytorch | Detección facial (componente) | no disponible | no aplica | no disponible | MIT | GitHub |
| DINOv3 ViT-S/16 (Meta) | Encoder visual self-supervised | no disponible en la información | no aplica | no disponible | DINOv3 License | Uso como encoder en este repo |

No se dispone en la información proporcionada de otros detectores de deepfake comparables con métricas publicadas para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Generalización muy limitada: el rendimiento cae de AUC 0,999 in-domain a 0,668 en Celeb-DF v2; el propio autor advierte de que la demo fallará o se abstendrá en la mayoría de clips fuera de su distribución de entrenamiento.
- Tasa de falsos positivos elevada sobre vídeos reales: 113 de 155 vídeos reales de Celeb-DF v2 marcados como falsos con el umbral por defecto.
- Uso prohibido para dictaminar autenticidad: la model card indica explícitamente que no debe usarse para juzgar si un vídeo real es genuino.
- Licencia restrictiva: los checkpoints propios son all-rights-reserved; es necesario pedir permiso al autor antes de reutilizarlos. DINOv3 y MTCNN conservan sus licencias originales (DINOv3 License y MIT).
- Restricciones de la demo: solo se habilitan el ensemble visual y el mejor modelo individual, con subidas limitadas a 30 MB.
- Sin datos de sesgo demográfico, idioma ni robustez ante compresión o manipulación adversarial en la información disponible.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni generación de texto; cualquier comparación con LLM es inadecuada.
- El repositorio no incluye datasets, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vaibhavshiroorkar/deepfake-generalization-demo
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/vaibhavshiroorkar/deepfake-generalization
- Código fuente en GitHub: https://github.com/vaibhavshiroorkar/deepfake-detection
- facenet-pytorch (MTCNN, MIT): https://github.com/timesler/facenet-pytorch

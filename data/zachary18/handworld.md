# Zachary18/HandWorld

## Resumen

HandWorld es un conjunto de pesos para la generación de vídeo centrada en las manos, presentado en el paper "HandWorld: Hand-Centric Unified Video Action Generation" (CVPR 2026). Lo publica el usuario Zachary18 en HuggingFace bajo licencia Apache 2.0 y está etiquetado con el pipeline `image-to-video`. El modelo aborda la generación de vídeo condicionada por acciones y la predicción conjunta de vídeo y acción, un problema relevante en síntesis de movimiento humano y animación de manos donde los enfoques genéricos de difusión de vídeo suelen fallar en el detalle fino de la anatomía y la dinámica de las manos.

El repositorio contiene dos checkpoints principales: `stage2.safetensors`, un modelo completo de vídeo condicionado por acción, y `stage3.safetensors`, un modelo completo de predicción conjunta de vídeo y acción. Adicionalmente incluye `preprocess/detector.pt`, un detector opcional de mano izquierda/derecha para el preprocesado RGB. El modelo se apoya en la arquitectura Wan2.2-TI2V-5B (un DiT de difusión de vídeo de aproximadamente 5 000 millones de parámetros), cuyos componentes VAE, encoder de texto umT5-XXL y pesos base deben descargarse por separado del repositorio oficial de Wan-AI.

El tamaño del repositorio es de 42,5 GB, coherente con varios checkpoints de un modelo de difusión de vídeo de escala media. No se dispone de información sobre idiomas soportados, número de tokens de entrenamiento, composición del dataset ni resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo basada en Wan2.2-TI2V-5B (DiT, transformer de difusión), con etapas de predicción de acción |
| Parámetros totales | no disponible (el backbone Wan2.2-TI2V-5B tiene aproximadamente 5 000 millones; el total del modelo HandWorld no se especifica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el VAE y el encoder T5 se distribuyen en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`stage2.safetensors`, `stage3.safetensors`), PyTorch `.pt` (`preprocess/detector.pt`) |

## Arquitectura y entrenamiento

HandWorld se construye sobre el modelo de difusión de vídeo Wan2.2-TI2V-5B, un transformer de difusión (DiT) para generación de vídeo texto/imagen a vídeo. Sobre esa base, el trabajo introduce un enfoque "hand-céntrico" y unificado: la etapa 2 (`stage2.safetensors`) corresponde a un modelo de vídeo condicionado por acción, mientras que la etapa 3 (`stage3.safetensors`) añade predicción conjunta de vídeo y acción. El pipeline incluye un detector de manos izquierda/derecha opcional (`preprocess/detector.pt`) para el preprocesado de entrada RGB.

El modelo requiere componentes externos: el VAE (`Wan2.2_VAE.pth`), el encoder de texto (`models_t5_umt5-xxl-enc-bf16.pth`) y el tokenizador/modelo `google/umt5-xxl`, todos obtenidos del repositorio oficial Wan-AI/Wan2.2-TI2V-5B. Para el preprocesado de manos se emplean HaMeR y assets MANO con licencia propia, que deben obtenerse por separado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO u otras innovaciones de decodificación.

## Capacidades

- Generación de vídeo imagen a vídeo (image-to-video) centrada en manos.
- Generación de vídeo condicionada por acción (etapa 2).
- Predicción conjunta de vídeo y acción (etapa 3).
- Detección opcional de mano izquierda/derecha en RGB para preprocesado.
- Integración con el backbone Wan2.2-TI2V-5B y su encoder de texto umT5-XXL.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo en la información disponible.

## Casos de uso

- Síntesis de vídeo de manipulación de objetos: usar `stage2.safetensors` para generar secuencias de vídeo condicionadas por una acción especificada, útil en investigación de robótica y aprendizaje por imitación donde se necesita material visual de manos interactuando con objetos.
- Animación de personajes con detalle de manos: emplear el modelo para producir clips donde la anatomía y el movimiento de las manos sean el foco, un escenario donde los modelos genéricos de imagen a vídeo suelen producir artefactos.
- Generación de datos sintéticos para entrenamiento: crear pares vídeo-acción con `stage3.safetensors` para aumentar datasets de reconocimiento de acciones o estimación de pose de mano.
- Prototipado en investigación de CVPR: reproducir y extender los experimentos del paper usando los checkpoints publicados y los componentes Wan2.2 descargados por separado.
- Preprocesado de vídeo real: usar `preprocess/detector.pt` para localizar manos izquierda y derecha en secuencias RGB antes de alimentar el modelo generativo.
- Evaluación de coherencia acción-vídeo: comparar las salidas de la etapa 2 (solo vídeo condicionado) frente a la etapa 3 (vídeo y acción conjuntos) para estudiar el acoplamiento entre ambas modalidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 42,5 GB y el backbone Wan2.2-TI2V-5B ronda los 5 000 millones de parámetros, por lo que se requiere una GPU de alta capacidad (orientativamente 24 GB o más para los checkpoints en bf16, sin cifra oficial confirmada).
- GPU recomendadas: no disponible en la información; por el tamaño del backbone, se esperan A100, H100 o GPUs de gama alta con suficiente VRAM.
- ¿Cabe en GPU de consumo? No confirmado; probablemente requiere GPUs de consumo de gama alta (por ejemplo, RTX 4090 con 24 GB) o superiores, sin datos oficiales.
- Opciones de despliegue: el repo indica que se coloque el checkpoint elegido en el directorio `weights/` del repositorio de inferencia y se descarguen los componentes Wan2.2 en `weights/Wan2.2-TI2V-5B/`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HandWorld | Difusión de vídeo hand-céntrica (image-to-video) | no disponible (backbone ~5 000 M) | no disponible | Apache 2.0 | Pesos en HuggingFace |
| Wan2.2-TI2V-5B | Difusión de vídeo image-to-video | ~5 000 M | no disponible | no disponible en la información | HuggingFace (Wan-AI) |
| Alternativas genéricas de image-to-video | Difusión de vídeo | variable | no disponible | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre HandWorld y otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la información disponible.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede producir anatomía de manos inconsistente o artefactos, aunque su enfoque hand-céntrico busca mitigarlo.
- No se especifican limitaciones de contexto ni de idioma; los idiomas soportados figuran como no disponibles.
- La licencia Apache 2.0 cubre los pesos publicados, pero los componentes externos (Wan2.2, HaMeR, MANO) tienen sus propias licencias y deben revisarse por separado antes de uso comercial. Los assets MANO requieren licencia específica.
- El modelo depende de descargas externas (VAE, encoder T5, umT5-XXL) y de un repositorio de inferencia no incluido en este repo; su reproducibilidad depende de esos componentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.
- No hay información sobre latencia, throughput ni requisitos mínimos oficiales de hardware.

## Enlaces

- HuggingFace: https://huggingface.co/Zachary18/HandWorld
- Paper (CVPR 2026): https://openaccess.thecvf.com/content/CVPR2026/html/Sun_HandWorld_Hand-Centric_Unified_Video_Action_Generation_CVPR_2026_paper.html
- Repositorio Wan-AI/Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B/tree/main

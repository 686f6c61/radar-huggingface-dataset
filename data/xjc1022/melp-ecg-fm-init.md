# xjc1022/MELP-ECG-FM-init

## Resumen

MELP-ECG-FM-init es un checkpoint de inicialización para el codificador de electrocardiogramas (ECG) del proyecto MELP, un marco de preentrenamiento multimodal ECG-lenguaje desarrollado por el grupo HKU-MedAI (Universidad de Hong Kong). No es un modelo listo para inferencia ni para clasificación: es el punto de partida concreto que MELP utiliza para arrancar el entrenamiento de su torre ECG, de modo que quien quiera reproducir el preentrenamiento desde el mismo estado inicial pueda hacerlo sin partir de pesos aleatorios.

El checkpoint contiene el `state_dict` de la clase `ECGFMModel` de MELP, construida sobre un codificador wav2vec 2.0 con 8 capas transformer, dimensión 768 y 12 cabezas de atención, más una cabeza de pooling contrastivo. Fue entrenado únicamente con formas de onda ECG (sin informes clínicos asociados) sobre MIMIC-IV-ECG, con el objetivo de predicción enmascarada de wav2vec 2.0 combinado con CMSC, una pérdida contrastiva entre segmentos del mismo paciente.

Su relevancia es acotada pero específica: es la pieza que permite reproducir exactamente el pipeline de MELP descrito en el artículo «From Token to Rhythm: A Multi-Scale Approach for ECG-Language Pretraining» (arXiv:2506.21803). Para obtener características ECG o clasificación zero-shot, el propio autor remite a los repositorios derivados MELP-repro y MELP-Encoder-repro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 + CMSC (8 capas transformer, 768-d, 12 cabezas) sobre formas de onda ECG |
| Parametros totales | 63,1 M (169 tensores, float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en float32 para entrenamiento) |
| Idiomas soportados | no aplica (entrada de senal ECG, sin texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ckpt` (checkpoint Lightning recortado, cargable con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

El codificador es un wav2vec 2.0 con extractor convolucional y 8 capas transformer de 768 dimensiones y 12 cabezas, procedente de fairseq-signals, al que se añade una cabeza de pooling contrastivo con 10 queries (`attn_pool_contrast.*`, `ln_contrast.*`, `proj_contrast.*`), una capa de batch normalization y un `logit_scale` para la temperatura de la pérdida contrastiva. El entrenamiento se realizó con `main_pretrain.py --model_name ecgfm` de MELP, sobre ECG exclusivamente y sin informes, con el objetivo wav2vec 2.0 de predicción enmascarada más CMSC, una pérdida contrastiva entre segmentos del mismo paciente. Se usaron 4 GPU, batch de 64 por GPU, learning rate 1e-4 y weight decay 0,2; el checkpoint corresponde a la época 44 y al paso global 131040.

El dataset de preentrenamiento no está nombrado explícitamente en los hiperparámetros guardados, pero el módulo de datos de MELP lee únicamente MIMIC-IV-ECG (acceso abierto en PhysioNet bajo ODbL v1.0). El archivo publicado es el checkpoint Lightning original (`epoch=44-step=131040.ckpt`) con el estado del optimizador, el scheduler, los callbacks y los hiperparámetros eliminados; el `state_dict` es idéntico. Detalle importante para la integración: MELP carga todos los tensores excepto `attn_pool_contrast.*`, porque utiliza 12 queries en lugar de 10, y el pooler de subtítulos (`attn_pool_caption.*`, `ln_caption.*`) no está incluido y arranca con pesos aleatorios.

## Capacidades

- Extracción de representaciones latentes de formas de onda ECG mediante un codificador wav2vec 2.0 preentrenado con predicción enmascarada.
- Inicialización del codificador ECG de MELP para preentrenamiento multimodal ECG-lenguaje.
- Aprendizaje contrastivo a nivel de paciente (CMSC) que agrupa segmentos del mismo individuo en el espacio latente.
- Punto de partida reproducible para el pipeline de MELP (`--ecg_encoder_weight`).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step: es un componente de visión/senal, no un modelo de lenguaje.
- No incluye capacidades multilingües ni procesamiento de texto.

## Casos de uso

- Reproducción del preentrenamiento de MELP: descargar `ecgfm.ckpt` y pasarlo como `--ecg_encoder_weight` a `main_pretrain.py` para arrancar el entrenamiento desde el mismo estado que el run original, garantizando comparabilidad de resultados.
- Investigación en representaciones ECG auto-supervisadas: usar el codificador como extractor de features congelado para estudiar la calidad de los embeddings wav2vec 2.0 en tareas de electrocardiografía.
- Ablaciones controladas: comparar el efecto de partir de este checkpoint frente a pesos aleatorios en el codificador ECG de MELP, aislando la contribución de la inicialización.
- Desarrollo de modelos ECG-lenguaje: servir como base para entrenar la torre ECG de sistemas que generan informes clínicos a partir de trazados, siempre completando el pipeline con el pooler de subtítulos y los pesos del resto de MELP.
- Validación de pipelines de entrenamiento distribuido: el checkpoint documenta configuración de 4 GPU, batch 64 y lr 1e-4, útil como referencia para replicar recetas en otros entornos.
- Integración en flujos de investigación clínica con MIMIC-IV-ECG: al haberse entrenado solo con formas de onda (sin informes), permite estudiar sesgos y transferencia entre cohortes sin contaminación de texto.
- Punto de partida para fine-tuning supervisado en tareas de clasificación ECG una vez extraído el codificador, aunque para ello el autor recomienda los repositorios derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 253 MB en float32 (63,1 M parámetros); la carga completa en memoria ronda 0,3 GB, holgada en cualquier GPU consumer.
- GPU recomendadas: no se especifican requisitos de inferencia; el entrenamiento documentado usó 4 GPU (modelo no nombrado) con batch 64 por GPU.
- Cabe en GPU consumer: sí, con amplio margen (cualquier GPU con 1 GB o más de VRAM puede alojar los pesos).
- Opciones de despliegue: no es un modelo de inferencia; se integra mediante el código de MELP (`main_pretrain.py`) y `torch.load`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MELP-ECG-FM-init | 63,1 M | no disponible | Inicialización de codificador ECG para preentrenamiento multimodal | Apache 2.0 | HuggingFace (xjc1022) |
| MELP-repro | no disponible | no disponible | Features ECG y clasificación zero-shot derivados de MELP | no disponible | HuggingFace (xjc1022) |
| MELP-Encoder-repro | no disponible | no disponible | Codificador ECG derivado de MELP | no disponible | HuggingFace (xjc1022) |
| ECG-FM (fairseq-signals) | no disponible | no disponible | Codificador ECG base sobre el que se construye este checkpoint | no disponible | fairseq-signals |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo de inferencia: no genera texto, no clasifica directamente y no debe usarse para predicción clínica sin completar el pipeline de MELP.
- El pooler de subtítulos (`attn_pool_caption.*`, `ln_caption.*`) no está incluido y arranca con pesos aleatorios; MELP ignora además `attn_pool_contrast.*` por el cambio de 10 a 12 queries.
- Entrenado exclusivamente con MIMIC-IV-ECG: los sesgos demográficos y de adquisición de esa cohorte (hospital único, población concreta) se heredan en los embeddings.
- Riesgo de alucinación no aplica directamente al no ser un modelo generativo, pero las representaciones pueden producir asociaciones espurias en tareas downstream si no se valida con datos externos.
- Sin información sobre idiomas ni texto: no apto para tareas lingüísticas.
- Licencia Apache 2.0 permite uso comercial del checkpoint, pero los datos de entrenamiento (MIMIC-IV-ECG) están bajo ODbL v1.0 y el código de MELP bajo MIT; conviene revisar las condiciones de cada componente en producción.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- No se documentan límites de longitud de señal, normalización esperada ni preprocesado requerido más allá de lo que implemente MELP.

## Enlaces

- HuggingFace: https://huggingface.co/xjc1022/MELP-ECG-FM-init
- Repositorio derivado MELP-repro: https://huggingface.co/xjc1022/MELP-repro
- Repositorio derivado MELP-Encoder-repro: https://huggingface.co/xjc1022/MELP-Encoder-repro
- Código de MELP: https://github.com/HKU-MedAI/MELP
- Artículo: https://arxiv.org/abs/2506.21803
- MIMIC-IV-ECG en PhysioNet: https://physionet.org/content/mimic-iv-ecg/

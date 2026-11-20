# zia2/pneumonia-cxr-dinov2s

## Resumen

`zia2/pneumonia-cxr-dinov2s` es un clasificador binario de imagen (radiografía de tórax frontal pediátrica) que distingue entre NORMAL y PNEUMONIA, construido mediante fine-tuning de DINOv2-Small (`vit_small_patch14_dinov2.lvd142m`) y exportado a ONNX (opset 17). Lo publica el usuario `zia2` como prototipo de investigación y demostración docente de un pipeline de triaje calibrado y explicable, no como producto clínico. El repositorio ocupa 0,1 GB y contiene un único `model.onnx` de 86,7 MB con entrada `image` [batch, 3, 224, 224] (escala de grises normalizada con estadísticos de ImageNet) y dos salidas: `logits` [batch, 2] y `tokens` [batch, 257, 384].

El interés del modelo no está en su arquitectura (un ViT-Small de 21 M de parámetros aproximadamente, reutilizado como extractor congelado o parcialmente ajustado), sino en la rigurosidad metodológica de su evaluación: split a nivel de paciente para evitar fugas, intervalos de confianza por bootstrap, calibración con temperature scaling, predicción selectiva con abstención y tests de fidelidad de mapas de saliencia mediante borrado de parches. Compite explícitamente contra EfficientNet-B0 en las mismas condiciones experimentales.

Es relevante ahora como ejemplo reproducible de buenas prácticas en IA médica de código abierto: muestra cómo detectar y corregir fugas de pacientes en el dataset Kermany 2018, cómo reportar calibración (ECE, Brier) y cómo diseñar un mecanismo de derivación (referral) cuando la confianza cae por debajo de un umbral. Su utilidad es formativa y metodológica, no asistencial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv2-Small (ViT-Small, patch 14), fine-tuned; exportado a ONNX opset 17 |
| Parámetros totales | no disponible (el modelo base `vit_small_patch14_dinov2.lvd142m` ronda los 21-22 M, no confirmado en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagen, entrada 224×224 px) |
| Tipos de cuantización | no disponible (solo se distribuye `model.onnx` en precisión original) |
| Idiomas soportados | no aplica (modelo de visión; etiquetas en inglés: NORMAL / PNEUMONIA) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`model.onnx`, opset 17, 86,7 MB) |
| Tarea | Clasificación binaria de imagen (radiografía de tórax frontal) |
| Entrada | `image` [batch, 3, 224, 224], grayscale normalizada con estadísticos de ImageNet |
| Salidas | `logits` [batch, 2] y `tokens` [batch, 257, 384] |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer pequeño (DINOv2-Small, patch de 14 px) ajustado para clasificación binaria sobre radiografías de tórax frontales pediátricas. La entrada se cachea a 256×256 en escala de grises y se redimensiona a 224×224 para la inferencia. El entrenamiento se realizó durante 8 épocas con AdamW y OneCycleLR (LR 5e-5 para DINOv2-S frente a 3e-4 para EfficientNet-B0), entropía cruzada ponderada por clase (pesos 1,85 / 0,69), precisión mixta automática y batch de 32. La aumentación incluyó transformaciones afines pequeñas (±8°, ±4 % de desplazamiento, escala 0,92-1,08) y jitter de brillo y contraste, sin volteos horizontales. El checkpoint desplegado se seleccionó por mejor AUROC de validación.

Los datos provienen del dataset Kermany et al. (*Cell*, 2018), disponible en Kaggle (`paultimothymooney/chest-xray-pneumonia`): radiografías AP pediátricas (edad 1-5) de un único hospital en Guangzhou. Tras eliminar 32 duplicados exactos (md5) quedan 5.824 imágenes de 3.117 pacientes. El autor detectó que el split oficial filtra pacientes entre particiones (170 pacientes, 777 imágenes, aparecen en más de una) y lo sustituyó por un split estratificado por clase y agrupado por paciente (StratifiedGroupKFold 70/15/15): 4.097 imágenes de entrenamiento, 881 de validación y 846 de test. La innovación metodológica destacable no es arquitectónica sino evaluativa: calibración con temperature scaling (T = 1,17), predicción selectiva con umbral de abstención (0,771) y tests de borrado de parches de 14 px con baseline desenfocado para medir la fidelidad de los mapas de saliencia.

## Capacidades

- Clasificación binaria de radiografía de tórax frontal: NORMAL frente a PNEUMONIA (bacteriana y viral agrupadas).
- Salida de logits de dos clases y de tokens intermedios [257, 384] que permiten construir mapas de saliencia por proyección de parches.
- Calibración de probabilidades incorporada en el flujo de despliegue (temperature scaling, T = 1,17).
- Predicción selectiva: el sistema puede abstenerse y derivar cuando la confianza es inferior a 0,771.
- Explicabilidad: mapa de calor por proyección de parches (gradient-free) y compatibilidad con Grad-CAM.
- Inferencia en navegador mediante ONNX (demo en Hugging Face Spaces).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imagen puro.
- No soporta visión general: solo radiografía de tórax frontal pediátrica en las condiciones del dataset.

## Casos de uso

- Docencia y formación en IA médica: sirve como ejemplo reproducible de pipeline completo (split por paciente, calibración, abstención, tests de fidelidad) para cursos de machine learning aplicado a imagen médica.
- Demostración de inferencia ONNX en navegador: el modelo de 86,7 MB cabe en el cliente y permite ejecutar la demo del Space sin backend, útil para talleres y prototipos interactivos.
- Estudio de calibración y predicción selectiva: con umbral 0,771 el modelo responde al 97,2 % de los casos in-distribution con 98,8 % de accuracy sobre los respondidos, lo que lo convierte en banco de pruebas para técnicas de abstención y derivación.
- Investigación sobre explicabilidad: sus mapas de saliencia y los tests de borrado de parches permiten comparar la fidelidad de Grad-CAM frente a métodos gradient-free en arquitecturas ViT.
- Comparación de arquitecturas CNN frente a ViT en imagen médica: el repositorio incluye el contrapunto EfficientNet-B0 entrenado en idénticas condiciones, útil para experimentos controlados de arquitectura.
- Prototipado de pipelines de triaje: el diseño (umbral de sensibilidad, abstención, calibración) se puede trasladar a otros dominios de clasificación binaria con requisitos de derivación.
- Validación externa metodológica: el autor documenta la evaluación sobre RSNA Pneumonia Detection Challenge (adultos, otro hospital), útil como caso de estudio de generalización entre dominios.

## Benchmarks y rendimiento

Conjunto de test interno: 846 imágenes, 469 pacientes. Intervalos de confianza al 95 % por bootstrap a nivel de paciente (1.000 remuestreos). Umbral operativo elegido en validación para sensibilidad ≥ 95 % y congelado.

| Modelo | AUROC [IC 95 %] | AUPRC | Sens / Spec @ umbral val | Accuracy @ 0,5 | ECE raw → T | Brier raw → T | T |
|---|---|---|---|---|---|---|---|
| EfficientNet-B0 | 0,9959 [0,9925; 0,9987] | 0,9984 | 0,945 / 0,987 | 0,980 | 0,0197 → 0,0138 | 0,0191 → 0,0195 | 1,77 |
| DINOv2-S (desplegado) | 0,9969 [0,9937; 0,9992] | 0,9987 | 0,943 / 0,987 | 0,979 | 0,0164 → 0,0147 | 0,0168 → 0,0169 | 1,17 |

Predicción selectiva (objetivo 99 % en validación):

| Modelo | Umbral de confianza | Cobertura en test | Accuracy sobre respondidos | Sens / Spec sobre respondidos |
|---|---|---|---|---|
| EfficientNet-B0 | 0,852 | 92,8 % | 98,9 % | 0,990 / 0,986 |
| DINOv2-S (desplegado) | 0,771 | 97,2 % | 98,8 % | 0,988 / 0,987 |

Barrido de umbrales (objetivo → cobertura / accuracy sobre respondidos):

| Objetivo | EfficientNet-B0 | DINOv2-S |
|---|---|---|
| 0,97 | 0,511 → 99,8 % / 98,0 % | 0,503 → 100 % / 97,9 % |
| 0,98 | 0,573 → 99,2 % / 98,2 % | 0,503 → 100 % / 97,9 % |
| 0,99 | 0,852 → 92,8 % / 98,9 % | 0,771 → 97,2 % / 98,8 % |
| 0,995 | 0,908 → 90,1 % / 99,3 % | 0,920 → 93,3 % / 99,1 % |

Tests de borrado sobre 120 imágenes de test con verdadero positivo (AUC de la probabilidad media de neumonía al eliminar regiones; menor AUC = mapa más fiel):

| Modelo | Mapa | Run 1: píxeles a cero | Run 2: parches 14 px, baseline desenfocado |
|---|---|---|---|
| EfficientNet-B0 | Grad-CAM | 0,964 | 0,960 |
| EfficientNet-B0 | aleatorio | 0,787 | 0,994 |
| DINOv2-S | Grad-CAM | 0,875 | 0,922 |
| DINOv2-S | aleatorio | 0,991 | 0,997 |
| DINOv2-S | CAM por proyección de parches (desplegado) | — | 0,968 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el ONNX ocupa 86,7 MB y la entrada es 224×224, por lo que cabe holgadamente en cualquier GPU consumer con ≥ 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes, A100, H100, L4 o RTX 4090 ofrecen margen de sobra. En CPU la inferencia es viable para uso interactivo.
- Cabe en GPU consumer: sí, en cualquier modelo con ≥ 2 GB (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: ONNX Runtime (CPU/GPU), navegador vía WebAssembly/WebGPU, y cualquier servidor compatible con ONNX. No se distribuyen pesos en safetensors ni GGUF, por lo que llama.cpp u Ollama no aplican.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento (AUROC test interno) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DINOv2-S pneumonia (este) | no disponible (ViT-Small, ~21-22 M estimado) | imagen 224×224 | 0,9969 [0,9937; 0,9992] | CC-BY-4.0 | ONNX en HF |
| EfficientNet-B0 pneumonia (mismo autor) | no disponible (CNN, ~5 M estimado) | imagen 224×224 | 0,9959 [0,9925; 0,9987] | no disponible en la información | referenciado en la model card, no se indica repo |
| Modelos genéricos de clasificación de radiografía (p. ej. CheXpert) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es la del propio autor: las diferencias de AUROC entre DINOv2-S y EfficientNet-B0 no son significativas (intervalos de confianza solapados casi por completo), por lo que la elección entre ambos no está justificada por rendimiento en este experimento.

## Limitaciones y advertencias

- No es un dispositivo médico ni una herramienta diagnóstica: el propio autor prohíbe explícitamente su uso en decisiones clínicas.
- Fuera de alcance: adultos, proyecciones laterales, CT, fotografías de pantallas y cualquier imagen que no sea radiografía de tórax.
- Sesgo de dominio: entrenado con un único hospital (Guangzhou) y población pediátrica de 1-5 años; la generalización a otras poblaciones y equipos no está garantizada.
- El split oficial del dataset filtra pacientes; el autor lo corrige, pero cualquier reutilización del split original reproducirá la fuga.
- La validación externa sobre RSNA (adultos, otro hospital) está documentada de forma incompleta en la información disponible; no se ofrecen métricas externas concretas.
- El umbral de sensibilidad ≥ 95 % rindió 0,943-0,945 en test, ligeramente por debajo del objetivo; el autor recomienda un objetivo de 0,98 para triaje.
- El mapa de calor desplegado (proyección de parches) es menos fiel que Grad-CAM (AUC 0,968 frente a 0,922) y así se etiqueta en la aplicación.
- Calibración: el temperature scaling reduce el ECE pero deja el Brier plano o ligeramente peor; ambos modelos ya estaban bien calibrados in-distribution.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero la licencia no exime de las advertencias clínicas del autor.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zia2/pneumonia-cxr-dinov2s
- Demo en el navegador (Space): https://huggingface.co/spaces/zia2/pneumonia-cxr-triage
- Dataset Kermany et al. en Kaggle: https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia
- Paper de referencia del dataset (Kermany et al., *Cell* 2018): no disponible como enlace en la información proporcionada
- Repositorio de código (`notebooks/pneumonia_cxr_full.ipynb`): no disponible como enlace en la información proporcionada
- RSNA Pneumonia Detection Challenge: no disponible como enlace en la información proporcionada

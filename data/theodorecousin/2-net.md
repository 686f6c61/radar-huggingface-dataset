# TheodoreCousin/2-Net

## Resumen

2-Net es un sistema de clasificación multi-etiqueta de imágenes de fondo de ojo (retinografía en color) desarrollado por Théodore Cousin, Coralie Hemptinne y Sébastien Jodogne (ICTEAM, UCLouvain, y Cliniques Universitaires Saint-Luc). Detecta simultáneamente hasta 20 o 29 patologías retinianas según el conjunto de datos, formulando el problema como clasificación multi-etiqueta en lugar de diagnóstico único.

El sistema combina dos redes con modos de fallo distintos: un DINOv2 ViT-B/14 adaptado con LoRA (rango 16) a 518×518 píxeles, y un EfficientNetV2-L que procesa la imagen a 896×896 para capturar detalle fino. Cada red se calibra por clase con parámetros de Platt sobre el conjunto de validación y las probabilidades se fusionan mediante media geométrica con umbrales de decisión ajustados por clase.

Su relevancia radica en la eficiencia: según el autor, iguala el rendimiento del ganador de 30 miembros del reto RIADD con 4,5 veces menos parámetros y un tiempo de inferencia en CPU de 4,4 s por imagen frente a 77,5 s. El repositorio (4,1 GB) incluye pesos para dos conjuntos de datos (MuReD y RFMiD), una variante con RETFound y los ficheros de calibración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos transformers/CNNs: DINOv2 ViT-B/14 con LoRA (rango 16) + EfficientNetV2-L; variante alternativa RETFound ViT-L/16 + EfficientNetV2-L |
| Parametros totales | DINOv2-LoRA: 87,8 M (1,2 M entrenados); EfficientNetV2-L: 117,3 M; RETFound: ≈304 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión); entrada 518×518 (DINOv2) y 896×896 (EfficientNetV2-L); RETFound 384×384 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de imagen; sin procesamiento de lenguaje) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | PyTorch `state_dict` (`.pt`); EfficientNetV2-L incluye metadatos junto al `state_dict`; calibración en JSON |

## Arquitectura y entrenamiento

El sistema es un ensemble tardío de dos clasificadores independientes. El primer miembro es un DINOv2 ViT-B/14 preentrenado de forma autosupervisada y adaptado con LoRA de rango 16, con una cabeza de token-pooling; solo se entrenan 1,2 M de parámetros sobre los 87,8 M totales. El segundo es un EfficientNetV2-L con cabeza lineal que opera a 896×896 para preservar detalle de lesiones pequeñas. La variante 2-Net (RETFound) sustituye el primer miembro por un RETFound ViT-L/16 con fine-tuning completo y cabeza de token-pooling. La fusión se realiza por media geométrica de probabilidades calibradas por clase (Platt) con umbrales ajustados en validación.

El entrenamiento usa MuReD (2.208 imágenes, 20 etiquetas, partición estratificada propia 1.504/260/444) y RFMiD (3.200 imágenes, 29 etiquetas, partición oficial 1.920/640/640). El preprocesado recorta al disco retiniano y aplica CLAHE. Se emplea sobremuestreo de clases raras, aumentación (volteos, rotaciones pequeñas, cambios fotométricos, cutout, recortes aleatorios) y MixUp/CutMix. Las pérdidas son distribution-balanced para DINOv2-LoRA y RETFound, y asimétrica para EfficientNetV2-L. Los checkpoints publicados corresponden a la semilla 42, una de las cinco semillas del artículo.

## Capacidades

- Clasificación multi-etiqueta de retinografías en color: 20 clases en MuReD y 29 en RFMiD.
- Detección simultánea de múltiples patologías por imagen (retinopatía diabética, DMAE, edema macular, oclusión venosa, etc.).
- Salida de una probabilidad calibrada por clase más las etiquetas predichas tras umbralización.
- Preprocesado integrado en el script de inferencia (recorte del disco retiniano, CLAHE y redimensionado).
- Inferencia en CPU viable (4,4 s por imagen según el autor), sin requisito de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente de visión.

## Casos de uso

- Triaje automatizado en cribado de retinopatía diabética: el modelo asigna probabilidad calibrada a DR y a otras 19-28 etiquetas, permitiendo priorizar revisiones por un oftalmólogo según el umbral configurado.
- Investigación en epidemiología ocular: procesar cohortes retrospectivas de retinografías y obtener etiquetas multi-patología para análisis poblacionales, con la ventaja de ejecutarse en CPU sobre servidores sin GPU.
- Validación de pipelines de adquisición: comparar el rendimiento del modelo entre cámaras o protocolos de captura para detectar degradaciones en la calidad de imagen.
- Docencia y formación médica: generar etiquetas de referencia sobre casos de MuReD/RFMiD para discutir diagnósticos diferenciales entre múltiples hallazgos concurrentes.
- Benchmarking de modelos de retina: usar los checkpoints y la calibración publicados como línea base reproducible (semilla 42) frente a nuevos enfoques de clasificación multi-etiqueta.
- Prototipado de sistemas de segunda lectura: integrar la inferencia por lotes (script `infer.py` con salida CSV) en flujos de revisión asistida, siempre en contexto de investigación y no diagnóstico.
- Comparación de estrategias de preentrenamiento: la variante con RETFound permite evaluar si el preentrenamiento específico de retina aporta ventaja frente a DINOv2 generalista en un mismo pipeline.

## Benchmarks y rendimiento

Resultados en test con calibración Platt por clase y umbrales ajustados en validación. Checkpoints publicados (semilla 42):

| Modelo | F1 MuReD | F1 RFMiD | mAP MuReD | mAP RFMiD | R@n MuReD | R@n RFMiD |
|---|---|---|---|---|---|---|
| EfficientNetV2-L | .637 | .535 | .720 | .551 | .791 | .854 |
| RETFound, full fine-tuning | .621 | .481 | .683 | .534 | .764 | .864 |
| DINOv2, LoRA | .675 | .516 | .726 | .581 | .791 | .872 |
| 2-Net (RETFound) | .671 | .510 | .745 | .601 | .800 | .877 |
| 2-Net (DINOv2) | .706 | .544 | .747 | .607 | .804 | .873 |

Media ± 1 desviación típica sobre cinco semillas (artículo):

| Modelo | F1 MuReD | F1 RFMiD | mAP MuReD | mAP RFMiD | R@n MuReD | R@n RFMiD |
|---|---|---|---|---|---|---|
| EfficientNetV2-L | .629 ± .009 | .511 ± .031 | .704 ± .012 | .556 ± .010 | .779 ± .008 | .858 ± .006 |
| RETFound, full fine-tuning | .618 ± .015 | .489 ± .012 | .677 ± .012 | .546 ± .010 | .751 ± .020 | .866 ± .003 |
| DINOv2, LoRA | .655 ± .018 | .506 ± .030 | .711 ± .009 | .565 ± .012 | .792 ± .011 | .869 ± .003 |
| 2-Net (RETFound) | .658 ± .013 | .511 ± .003 | .730 ± .011 | .602 ± .010 | .799 ± .011 | .876 ± .001 |
| 2-Net (DINOv2) | .673 ± .020 | .527 ± .012 | .735 ± .008 | .589 ± .011 | .806 ± .004 | .875 ± .003 |

El autor indica que las comparaciones con C-Tran, RetExpert, RET-CLIP y el ganador de RIADD están en el artículo, pero no se incluyen sus cifras en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño, DINOv2-LoRA (87,8 M) y EfficientNetV2-L (117,3 M) caben holgadamente en GPUs de consumo, pero no se publican cifras medidas.
- GPU recomendadas: no disponibles en la información proporcionada.
- CPU: el autor reporta 4,4 s por imagen en CPU para el 2-Net completo, frente a 77,5 s del ganador de RIADD.
- Despliegue: inferencia mediante el script `infer.py` del repositorio de código (PyTorch + timm); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput adicionales: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | F1 MuReD (media 5 semillas) | F1 RFMiD (media 5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| 2-Net (DINOv2) | ≈205 M (87,8 M + 117,3 M) | 518 y 896 px | .673 ± .020 | .527 ± .012 | CC-BY-SA-4.0 | Pesos en HF |
| 2-Net (RETFound) | ≈421 M (304 M + 117,3 M) | 384 y 896 px | .658 ± .013 | .511 ± .003 | CC-BY-SA-4.0 | Pesos en HF |
| DINOv2-LoRA (miembro único) | 87,8 M (1,2 M entrenados) | 518 px | .655 ± .018 | .506 ± .030 | CC-BY-SA-4.0 | Pesos en HF |
| EfficientNetV2-L (miembro único) | 117,3 M | 896 px | .629 ± .009 | .511 ± .031 | CC-BY-SA-4.0 | Pesos en HF |

No se dispone de cifras de C-Tran, RetExpert, RET-CLIP ni del ganador de RIADD en la información proporcionada; el artículo las incluye.

## Limitaciones y advertencias

- Uso exclusivo en investigación: no son dispositivos médicos ni han sido validados en práctica clínica; no deben emplearse para diagnóstico.
- Entrenados y evaluados solo en MuReD y RFMiD; no se realizó evaluación cruzada entre conjuntos, por lo que el comportamiento con otras cámaras, poblaciones o protocolos de adquisición es desconocido.
- Riesgo de sesgo por la composición de los conjuntos de entrenamiento (poblaciones y centros concretos) y por el sobremuestreo de clases raras.
- Riesgo de falsos positivos y negativos en clases poco representadas; los umbrales están ajustados a la partición de validación de cada conjunto y pueden no transferirse.
- La calibración (Platt) y los umbrales son específicos por conjunto de datos y semilla; reutilizarlos fuera de ese contexto invalida las garantías de calibración.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y compartir-al-igual, pero obliga a licenciar las obras derivadas bajo la misma licencia; conviene revisar implicaciones antes de integrarlo en productos.
- El preprocesado (recorte del disco retiniano, CLAHE) forma parte del pipeline; alterarlo degrada el rendimiento de forma no cuantificada.
- Sin soporte de texto, tool calling ni agentes; no es adecuado para tareas fuera de clasificación de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheodoreCousin/2-Net
- Código y reproducción: https://forge.uclouvain.be/ThodoreCousin/2-net-implem
- Artículo: "A Two-Network Ensemble for Multi-Label Fundus Classification" (referenciado en la model card; sin enlace directo disponible)
- Conjunto MuReD: no disponible en la información proporcionada
- Conjunto RFMiD / reto RIADD: no disponible en la información proporcionada

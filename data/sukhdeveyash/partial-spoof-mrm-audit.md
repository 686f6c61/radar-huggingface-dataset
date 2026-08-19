# sukhdeveyash/partial-spoof-mrm-audit

## Resumen

El modelo `sukhdeveyash/partial-spoof-mrm-audit` es un checkpoint de detección de spoofing parcial en audio, es decir, un sistema capaz de identificar segmentos cortos de voz sintética o manipulada incrustados dentro de una grabación legítima. Lo desarrolla el autor sukhdeveyash como parte de un estudio de auditoría operativa sobre la fiabilidad de los detectores de spoofing parcial en dominios cruzados, cuyo manuscrito está en preparación para IEEE TBIOM. El checkpoint acompaña a una reimplementación abierta del modelo multi-resolución de Zhang et al. (PartialSpoof), entrenada por el propio autor sobre el conjunto de entrenamiento de PartialSpoof, y no debe confundirse con el checkpoint original de los autores ni con la versión pública de `MultiResoModel-Simple`.

Arquitectónicamente, el modelo combina un front-end wav2vec 2.0 Large con un back-end multi-resolución que supervisa pérdidas a nivel de frame (20 ms), segmento y utterance. Está pensado exclusivamente para investigación y reproducibilidad, no como herramienta forense desplegable. El repositorio contiene un único archivo de pesos (`55.pth`) de aproximadamente 4,2 GB, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Large (front-end) + back-end multi-resolución (MRM) con pérdidas a nivel de frame, segmento y utterance |
| Parametros totales | no disponible (el front-end wav2vec 2.0 Large tiene ~317 M, pero el total no se indica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 9,6 s durante el entrenamiento (no se especifica límite de contexto textual) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión nativa de PyTorch) |
| Idiomas soportados | no disponible (el dataset PartialSpoof es principalmente inglés, pero no se documenta) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del detector multi-resolución original de Zhang et al. (IEEE/ACM TASLP 2023), implementada mediante la reimplementación abierta `MultiResoModel-Simple` de Luong et al. El front-end es wav2vec 2.0 Large, que extrae representaciones de audio de alta calidad, y el back-end procesa esas representaciones a múltiples resoluciones temporales (unidades de 0,02 a 0,64 s) para clasificar cada frame, segmento y la utterance completa. Las pérdidas se supervisan conjuntamente en las tres escalas, lo que permite localizar segmentos falsos de corta duración.

El entrenamiento se realizó sobre el conjunto de entrenamiento de PartialSpoof, con una configuración detallada en la model card: unidades multi-resolución {0,02, 0,04, 0,08, 0,16, 0,32, 0,64} s, duración de segmento 9,6 s, `random_seek = true`, `use_mask = true`, optimizador Adam con lr 1e-5, scheduler StepLR (step 10, gamma 0,5), función de pérdida P2SGradLoss, batch size 8, 6 dataloader workers y 55 épocas. Se utilizó una semilla fija (1234) para la reproducibilidad, aunque no se garantiza una reproducción bit a bit debido a la falta de `torch.use_deterministic_algorithms(True)` y a que no se conservó el log de entrenamiento original.

## Capacidades

- Detección de spoofing parcial: identifica si una utterance contiene segmentos cortos de voz falsa (sintética o manipulada) incrustados en habla genuina.
- Localización temporal a nivel de frame (20 ms) y de segmento, además de clasificación a nivel de utterance.
- Salida de scores a nivel de frame y de utterance, que pueden utilizarse para análisis posteriores o umbrales personalizados.
- No es un modelo generativo ni de comprensión del lenguaje; no admite tool calling, razonamiento multi-paso ni generación de texto.
- Capacidades multilingües no documentadas; el entrenamiento se realizó sobre PartialSpoof, un corpus principalmente en inglés.

## Casos de uso

- Auditoría de sistemas de verificación de locutor: el modelo puede evaluar la robustez de un sistema de autenticación por voz frente a ataques de spoofing parcial, midiendo la tasa de error en condiciones de dominio cruzado.
- Investigación en contramedidas anti-spoofing: sirve como referencia para comparar nuevos detectores o para estudiar el comportamiento de los modelos multi-resolución ante diferentes tipos de manipulación.
- Análisis de localización de segmentos falsos: gracias a la salida a nivel de frame, permite identificar qué partes concretas de una grabación son sospechosas, útil para estudios de atribución o análisis forense académico.
- Reproducibilidad de experimentos: al ser un checkpoint abierto con receta de entrenamiento documentada, puede utilizarse para reproducir los resultados del manuscrito o para extenderlos con nuevos conjuntos de datos.
- Evaluación de generalización entre dominios: el estudio asociado examina el rendimiento en corpus como LlamaPartialSpoof, PartialEdit y HQ-MPSD, por lo que el checkpoint puede emplearse para validar la transferibilidad de los detectores.
- Desarrollo de pipelines de detección de deepfakes en entornos de investigación: aunque no es una herramienta desplegable, puede integrarse en prototipos para estudiar la viabilidad de la detección de spoofing parcial en escenarios controlados.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en la partición de evaluación de PartialSpoof (no se especifican intervalos de confianza):

| Metrica | Valor |
|---|---|
| EER a nivel de utterance | 0,94 % |
| EER a nivel de segmento (frames de 20 ms) | 13,91 % |

Para contexto, el checkpoint público de la reimplementación `MultiResoModel-Simple` reporta ~1,48 % (utterance) y ~13,67 % (segmento), mientras que el modelo original de Zhang et al. alcanza un 0,49 % de EER a nivel de utterance. Es importante señalar que estos valores se obtuvieron sobre la partición de evaluación sin una partición de desarrollo separada, por lo que los resultados in-domain son optimistas. No se han publicado resultados en otros benchmarks (como MMLU, HumanEval, etc.) porque el modelo no es de lenguaje.

## Requisitos de hardware

- No se proporcionan requisitos oficiales en la documentación.
- Dado que el front-end es wav2vec 2.0 Large (~317 M de parámetros), se estima que la inferencia en FP32 requiere al menos 8-12 GB de VRAM para un segmento de 9,6 s, dependiendo del batch y la longitud del audio. En FP16, podría caber en GPUs con 6-8 GB.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o superiores para un procesamiento cómodo.
- El checkpoint está en formato PyTorch (.pth), por lo que puede cargarse con `torch.load` y ejecutarse en cualquier framework que soporte PyTorch (por ejemplo, Hugging Face Transformers con wav2vec 2.0, aunque el back-end es personalizado).
- No se han documentado opciones de despliegue específicas (vLLM, Ollama, TGI, etc.) porque no es un modelo de lenguaje; la inferencia se realizaría mediante scripts PyTorch personalizados.

## Comparativa con modelos similares

| Modelo | Arquitectura | EER utterance (PartialSpoof eval) | EER segmento (20 ms) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `partial-spoof-mrm-audit` (este) | wav2vec 2.0 Large + MRM | 0,94 % | 13,91 % | MIT | HuggingFace |
| `MultiResoModel-Simple` público (Luong et al.) | wav2vec 2.0 Large + MRM | ~1,48 % | ~13,67 % | MIT | GitHub / Zenodo |
| Zhang et al. (original) | wav2vec 2.0 Large + MRM | 0,49 % | no disponible | no especificada | Zenodo (multi-reso.tar.gz) |

La comparativa se limita a los tres checkpoints de la misma familia. No se dispone de datos de otros modelos de detección de spoofing parcial en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigación y reproducibilidad, no una herramienta forense desplegable. El autor declara explícitamente que no se hace ninguna afirmación sobre su fiabilidad fuera de los corpus estudiados.
- Los resultados in-domain son optimistas porque no se separó una partición de desarrollo independiente; los umbrales y scores se derivan de la partición de evaluación de PartialSpoof.
- El rendimiento en dominios cruzados (LlamaPartialSpoof, PartialEdit, HQ-MPSD) es el objeto del manuscrito, pero no se proporcionan cifras concretas en la model card.
- No se garantiza reproducibilidad bit a bit del entrenamiento debido a la falta de `torch.use_deterministic_algorithms(True)` y a la ausencia del log de entrenamiento original.
- El checkpoint no es el modelo original de Zhang et al. ni el checkpoint público de `MultiResoModel-Simple`; es un reentrenamiento independiente, por lo que los resultados no deben interpretarse como reproducción de los artefactos originales.
- No se documentan sesgos específicos, pero al estar entrenado en PartialSpoof (mayoritariamente inglés), su comportamiento en otros idiomas o acentos no está validado.
- La licencia MIT permite uso comercial, pero el autor desaconseja su uso en producción sin una validación adicional.

## Enlaces

- HuggingFace: https://huggingface.co/sukhdeveyash/partial-spoof-mrm-audit
- Repositorio de reproducibilidad (GitHub): https://github.com/Yash-Sukhdeve/partial-spoof-cross-domain-audit-reproducibility
- Documento de reproducibilidad (CHECKPOINTS.md): https://github.com/Yash-Sukhdeve/partial-spoof-cross-domain-audit-reproducibility/blob/main/CHECKPOINTS.md
- Dataset de scores (HuggingFace): https://huggingface.co/datasets/sukhdeveyash/partial-spoof-cross-domain-audit-data
- Artículo relacionado (menciona MRM, no es específico de este checkpoint): https://arxiv.org/html/2507.03468v3
- Implementación base `MultiResoModel-Simple`: https://github.com/hieuthi/MultiResoModel-Simple

# VBoussot/ImpactReg

## Resumen

IMPACT-Reg es una colección de presets para registro deformable de imágenes médicas multimodales (MR, CT y CBCT), desarrollada por VBoussot y construida sobre el framework KonfAI. A diferencia de un modelo generativo al uso, se trata de una aplicación autocontenida de image-to-image cuyo objetivo es alinear una imagen en movimiento (moving) sobre una imagen fija (fixed), produciendo como única salida un campo de desplazamiento (`Transform.h5`, campo de desplazamiento ITK en milímetros).

La innovación central es el uso de la métrica de similitud semántica IMPACT, que sustituye a métricas clásicas de intensidad (información mutua, NCC) por características profundas extraídas de modelos de segmentación y fundacionales preentrenados (MIND, TotalSegmentator, anatomix). Esto permite alinear pares entre modalidades distintas (por ejemplo, MR sobre CT) manteniendo deformaciones suaves y físicamente plausibles.

Es relevante ahora porque aborda uno de los problemas clásicos del registro médico —la disparidad de intensidades entre modalidades— mediante features semánticas, y lo empaqueta en presets reproducibles con tres motores de ejecución (ConvexAdam, Elastix y FireANTs), integrables tanto por CLI como en 3D Slicer. La información disponible no permite determinar el tamaño del modelo ni su arquitectura interna más allá de los componentes que orquesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo único: orquesta motores de registro (ConvexAdam/ITK, Elastix, FireANTs) con métrica de similitud profunda IMPACT sobre features de MIND, TotalSegmentator y anatomix |
| Parametros totales | No disponible (depende de los modelos de features subyacentes; no se declara) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada: volúmenes 3D de imagen médica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (procesa imágenes médicas, no texto) |
| Licencia | Apache 2.0 (los presets FireANTs dependen de FireANTs, bajo FireANTs License v1.0) |
| Formato de pesos | No disponible; salida en `Transform.h5` (campo de desplazamiento ITK). Modelos de features servidos desde `VBoussot/impact-torchscript-models` (TorchScript) |

## Arquitectura y entrenamiento

IMPACT-Reg no entrena un modelo propio de extremo a extremo en el sentido habitual: es una capa de orquestación sobre motores de registro deformable existentes. Cada preset es una aplicación KonfAI autocontenida que ejecuta uno de tres motores: ConvexAdam (implementación nativa itk-impact con inicialización convexa acoplada y refinamiento Adam), Elastix (registro rígido por información mutua multi-resolución, con refinamiento B-spline opcional) y FireANTs (rígido + afín + SyN o Greedy con Adam riemanniano en GPU).

La pieza técnica diferenciadora es la métrica IMPACT, que impulsa la etapa deformable usando características profundas de modelos preentrenados de segmentación y fundacionales: MIND (descriptor de auto-similitud), TotalSegmentator (capa `TS/M730`, con distintas capas del decodificador y cabezas de segmentación según el nivel de coarse/fine) y anatomix. Algunos presets diferencian a través de la red (Jacobian) y otros extraen las features una sola vez (modo Static) y las reducen a sus componentes principales. Los presets pueden combinarse en ensemble promediando sus campos de desplazamiento en una única transformación. No se dispone de información sobre volúmenes de datos de entrenamiento ni sobre el proceso de ajuste de los modelos de features.

## Capacidades

- Registro deformable de imágenes médicas 3D entre modalidades: MR, CT y CBCT.
- Alineación multimodal guiada por similitud semántica (IMPACT) en lugar de intensidad, lo que permite pares cruzados MR/CT y CT/CBCT.
- Registro rígido, afín y deformable según el preset (Elastix rígido/B-spline, ConvexAdam coarse/composite, FireANTs SyN/Greedy).
- Salida de un campo de desplazamiento único en la rejilla fija (`Transform.h5`, ITK, en mm) del que se deriva la imagen movida.
- Soporte de máscaras opcionales (FixedMask / MovingMask) para restringir la región sobre la que se calcula la métrica.
- Ensamblado (ensemble) de varios presets promediando sus campos en una sola transformación.
- Integración interactiva en 3D Slicer mediante la extensión SlicerImpactReg, con panel de evaluación (MAE, Dice, TRE) y mapa de incertidumbre a partir de la dispersión del ensemble.
- Ejecución en GPU (recomendada para FireANTs; funciona en CPU pero lenta).

## Casos de uso

- Planificación de radioterapia guiada por imagen: alinear un CT de planificación con un CBCT de verificación diaria usando `ConvexAdam#impact_cbct`, que explota la capa `TS/M730` de TotalSegmentator para tolerar las diferencias de intensidad entre las dos modalidades.
- Fusión PET/CT y MR/CT en diagnóstico: registrar un volumen MR sobre un CT con `FireANTs#impact_mrct` o `Elastix#impact_static`, de modo que las estructuras anatómicas del CT queden superpuestas sobre la RM para lectura conjunta.
- Seguimiento longitudinal de lesiones: registrar estudios del mismo paciente en distintos momentos con `Elastix#rigid_bspline` para cuantificar cambios de volumen o desplazamientos anatómicos.
- Segmentación asistida por atlas: propagar segmentaciones de un caso de referencia a un caso nuevo registrando ambos volúmenes y aplicando el campo de desplazamiento a las máscaras, aprovechando la salida `Transform.h5` directamente reutilizable en ITK.
- Investigación clínica y validación de algoritmos: usar el ensemble de presets y el mapa de incertidumbre de SlicerImpactReg para estimar la robustez del registro y comparar métricas (Dice, TRE, MAE) frente a referencias.
- Integración en pipelines automatizados: invocar `impact-reg-konfai register` dentro de un flujo por lotes para procesar cohortes de imágenes, con la posibilidad de fijar la versión del repositorio (`KONFAI_IMPACTREG_REPO`) y garantizar reproducibilidad.
- Docencia y prototipado en 3D Slicer: cargar volúmenes en una escena y ejecutar los presets de forma interactiva para explorar el efecto de distintas estrategias de registro sin escribir código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del tamaño de los volúmenes y del motor. Los presets FireANTs y los basados en IMPACT con features profundas requieren GPU recomendada (el modo CPU funciona pero es lento).
- GPU recomendadas: no se especifican modelos concretos; los presets FireANTs indican GPU recomendada y los `ConvexAdam` dependen de `itk-impact` compilado contra torch 2.12.
- ¿Cabe en GPU de consumo? No disponible; no se declara un requisito mínimo de VRAM.
- Opciones de despliegue: CLI `impact-reg-konfai register`, runner genérico `konfai-apps infer`, y extensión de 3D Slicer (SlicerImpactReg). Dependencias: `itk-impact` (torch 2.12) para ConvexAdam y `fireants` para FireANTs.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modalidades | Métrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IMPACT-Reg | Orquestación de motores de registro deformable | MR / CT / CBCT | IMPACT (features profundas) + MI | Apache 2.0 (FireANTs bajo su propia licencia) | Hugging Face + 3D Slicer |
| Elastix | Motor de registro clásico | Multimodal | Información mutua, NCC | BSD-style (proyecto Elastix) | Open source, usado aquí como motor |
| FireANTs | Motor de registro deformable en GPU | Multimodal | SyN / Greedy | FireANTs License v1.0 | Open source, usado aquí como motor |
| ConvexAdam (itk-impact) | Motor de registro con inicialización convexa | Multimodal | MIND / features | No disponible | Paquete PyPI, usado aquí como motor |

No se dispone de datos de rendimiento comparativo entre IMPACT-Reg y alternativas independientes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni de lenguaje: no procesa texto, no responde preguntas y no genera imágenes sintéticas; su única salida es un campo de desplazamiento.
- Dependencia estricta de versiones: los presets `ConvexAdam` requieren `itk-impact` compilado contra torch 2.12; las versiones 1.8.6 y anteriores de impact-reg-konfai no pueden leer `main` y deben fijarse al commit `06efc39`.
- Los presets `FireANTs` están sujetos a la FireANTs License v1.0, distinta de Apache 2.0; conviene revisar sus términos antes de uso comercial y citar FireANTs.
- La calidad del registro depende de los modelos de features preentrenados (TotalSegmentator, anatomix, MIND); dominios anatómicos poco representados en esos modelos pueden degradar la alineación.
- El rendimiento en CPU es lento; el uso en producción requiere GPU.
- No se declaran sesgos ni métricas de robustez publicadas; el riesgo de alineaciones incorrectas en casos atípicos no está cuantificado en la información disponible.
- El repositorio tiene 0.0 GB declarados y 0 likes, lo que sugiere que los pesos no se alojan directamente en él sino en repositorios auxiliares (`VBoussot/impact-torchscript-models`).

## Enlaces

- Hugging Face: https://huggingface.co/VBoussot/ImpactReg
- Repositorio KonfAI: https://github.com/vboussot/KonfAI
- Extensión 3D Slicer: https://github.com/vboussot/SlicerImpactReg
- Vídeo tutorial de SlicerImpactReg: https://github.com/vboussot/SlicerImpactReg/blob/main/Screenshots/SlicerImpactReg-tutorial.mp4
- Paquete itk-impact: https://pypi.org/project/itk-impact/
- Paquete fireants: https://pypi.org/project/fireants/
- Modelos de features TorchScript: https://huggingface.co/VBoussot/impact-torchscript-models
- Paper (arXiv): https://arxiv.org/abs/2508.09823

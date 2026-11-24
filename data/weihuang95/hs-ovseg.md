# WeiHuang95/HS-OVSeg

## Resumen

HS-OVSeg es un adaptador de segmentación de imágenes por vocabulario abierto (open-vocabulary segmentation) orientado a teledetección (remote sensing). Lo desarrolla el usuario WeiHuang95 y se publica como un conjunto de pesos LoRA y Router que se montan sobre el modelo fundacional SAM3 de Meta (facebook/sam3). El modelo no es autónomo: requiere descargar por separado el checkpoint original de SAM3 y el código del repositorio zhu-xlab/HS-OVSeg para ejecutarse.

El problema que aborda es la segmentación de imágenes aéreas y satelitales guiada por texto: dado un prompt como "building" o "tree", el sistema genera máscaras de segmentación sin necesidad de reentrenar ni de disponer de un dataset de entrenamiento propio. Esto es relevante porque los modelos de segmentación de propósito general no están optimizados para las particularidades de la teledetección (resoluciones, escalas, clases de objetos y distribuciones espectrales distintas).

El artefacto publicado es un checkpoint de adaptación de 36,7 MiB que contiene 762 tensores LoRA/Router, correspondientes a la época 21 (paso 131250) del entrenamiento seleccionado. La información pública disponible es muy limitada: no hay datos de benchmarks, licencia, idiomas ni especificaciones detalladas del conjunto de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA + Router sobre el transformer de segmentación SAM3 (facebook/sam3) |
| Parámetros totales | No disponible (el checkpoint de adaptación contiene 762 tensores LoRA/Router; no se especifica el recuento de parámetros) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (la inferencia de referencia usa bf16) |
| Idiomas soportados | No disponible (los prompts de texto del ejemplo están en inglés) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (.pt); `best-inference.pt` (36,7 MiB) + `best-inference.json` de metadatos |

## Arquitectura y entrenamiento

HS-OVSeg se construye sobre SAM3, el modelo fundacional de segmentación de Meta, mediante un esquema de adaptación parametrizada eficiente: pesos LoRA más un módulo Router a nivel de píxel. El checkpoint publicado no incluye los pesos fundacionales de SAM3, ni el optimizador, ni el scheduler, ni rutas de máquina; es exclusivamente un artefacto de adaptación para inferencia, no un modelo independiente ni un checkpoint reanudable para continuar el entrenamiento.

El entrenamiento se realizó sobre datos de teledetección, aunque la model card no detalla el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El checkpoint seleccionado corresponde a la época 21, paso 131250. La inferencia de referencia se ejecuta en bf16 sobre CUDA con el código del repositorio `ovrs_segmentation.inference.sam3_multilevel`, que acepta rutas de imagen y prompts de texto y produce máscaras, superposiciones (overlays) y metadatos de predicción.

## Capacidades

- Segmentación de imágenes guiada por texto (open-vocabulary): acepta prompts en lenguaje natural como "building" o "tree" y genera máscaras para las clases solicitadas.
- Segmentación zero-shot: no requiere fine-tuning adicional ni descarga de datasets de entrenamiento para usar el adaptador.
- Segmentación multinivel (multilevel): el módulo de inferencia de referencia se denomina `sam3_multilevel`, lo que sugiere procesamiento a varias escalas, adecuado para objetos de tamaños muy distintos en imágenes aéreas.
- Salida de máscaras, overlays y metadatos de predicción en un directorio de salida configurable.
- Soporte de precisión bf16 en GPU CUDA.
- Capacidad multilingüe de los prompts: no disponible.
- Tool calling, agentes, razonamiento multi-step, visión general o audio: no disponibles; el modelo está especializado exclusivamente en segmentación.

## Casos de uso

- Cartografía automática de edificios: con el prompt "building" sobre ortofotos o imágenes satelitales, el modelo genera máscaras de edificaciones que pueden vectorizarse para actualizar bases de datos catastrales o de ocupación del suelo.
- Inventario de cubierta vegetal: con prompts como "tree" o "vegetation", se obtienen máscaras de arbolado urbano o masas forestales para estudios de biodiversidad o planificación urbana.
- Monitorización de cambios territoriales: ejecutando el mismo prompt sobre imágenes de distintas fechas se pueden comparar máscaras y detectar nuevas construcciones o pérdida de vegetación, sin reentrenar el modelo por cada clase.
- Análisis de infraestructura viaria: prompts como "road" o "bridge" permiten extraer redes de transporte de imágenes aéreas para planificación o análisis de accesibilidad.
- Gestión de emergencias y desastres: segmentación rápida de zonas inundadas, edificaciones dañadas o escombros mediante prompts ad hoc, aprovechando la naturaleza zero-shot del adaptador para clases no previstas en el entrenamiento.
- Anotación asistida de datasets de teledetección: el modelo actúa como preanotador que genera máscaras iniciales que los humanos revisan, reduciendo el coste de etiquetado en proyectos de visión por computador geoespacial.
- Agricultura de precisión: segmentación de parcelas de cultivo, invernaderos o zonas de regadío a partir de prompts de texto sobre imágenes de dron o satélite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Depende del checkpoint fundacional SAM3 (no incluido) y del tamaño de las imágenes de entrada; el adaptador en sí es de 36,7 MiB.
- GPU recomendadas: no disponibles. La inferencia de referencia usa `--device cuda --precision bf16`, por lo que se requiere una GPU NVIDIA con soporte de bf16.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos de SAM3, que no se detallan.
- Opciones de despliegue: exclusivamente el script del repositorio `ovrs_segmentation.inference.sam3_multilevel` con PyTorch 2.7+ y CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Especialización | Pesos publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HS-OVSeg | SAM3 | Teledetección, open-vocabulary | Adaptador LoRA/Router (36,7 MiB) | No disponible | Hugging Face + repo GitHub (acceso restringido) |
| SAM3 (facebook/sam3) | Propio | Segmentación general | Checkpoint completo | No disponible en la información | Hugging Face (requiere solicitud) |
| SAM (versiones previas de Meta) | Propio | Segmentación general promptable | Checkpoint completo | No disponible en la información | Público |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas específicas de segmentación en teledetección.

## Limitaciones y advertencias

- El checkpoint publicado no es un modelo autónomo: sin los pesos fundacionales de SAM3 y el código de zhu-xlab/HS-OVSeg no puede ejecutarse.
- El acceso al repositorio de código está restringido ("while it remains private" según la model card), lo que limita la reproducibilidad y el despliegue por terceros.
- La licencia no está especificada, por lo que no puede confirmarse el uso comercial; además, la licencia del modelo base SAM3 condiciona cualquier uso derivado.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni dominios geográficos cubiertos; el rendimiento puede degradarse fuera de las condiciones de las imágenes de entrenamiento.
- Riesgo de alucinación de máscaras: al ser un modelo open-vocabulary, prompts ambiguos o clases ausentes pueden producir segmentaciones espurias.
- No se documentan capacidades multilingües; los prompts de ejemplo están en inglés y no se garantiza el comportamiento con otros idiomas.
- El checkpoint excluye optimizador, scheduler y rutas de máquina, por lo que no sirve para reanudar entrenamiento, solo para inferencia.
- No se publican benchmarks ni métricas de calidad (IoU, mAP), lo que impide evaluar su rendimiento frente a alternativas antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WeiHuang95/HS-OVSeg
- Modelo base SAM3: https://huggingface.co/facebook/sam3
- Repositorio de código HS-OVSeg: https://github.com/zhu-xlab/HS-OVSeg

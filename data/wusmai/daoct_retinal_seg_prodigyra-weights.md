# wusmai/daoct_retinal_seg_prodigyra-weights

## Resumen

`wusmai/daoct_retinal_seg_prodigyra-weights` es un repositorio de pesos alojados externamente para el bundle de MONAI Model Zoo denominado `daoct_retinal_seg_prodigyra`, desarrollado en el marco del DA-OCT Challenge (segmentación de capas retinianas en tomografía de coherencia óptica). No se trata de un modelo de lenguaje, sino de un pipeline de segmentación de imágenes médicas basado en SegFormer, empaquetado como bundle de MONAI para su despliegue estandarizado.

El repositorio contiene seis ficheros de estado de servicio del pipeline (aproximadamente 328 MB cada uno, ~2 GB en total): `model.pt`, `early.pt`, `late.pt`, `late_dec.pt`, `wfgeo.pt` y `warmstart.pth`. Según la model card, estos ficheros son los declarados en el `large_files.yml` del bundle original y forman parte de una cadena de procedencia verificada por sha256 (réplica de laboratorio → release → evaluación Y4 → bundle).

La relevancia de este repositorio es acotada: sirve como punto de descarga de los pesos para quien utilice el bundle `daoct_retinal_seg_prodigyra` del MONAI Model Zoo. La documentación completa (mapa de etiquetas de 10 clases, uso, procedencia) reside en el bundle, no en este repositorio. El autor de los pesos es Washington University in St. Louis, con licencia BSD 2-Clause y uso restringido a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer (pipeline de segmentación con enrutado por forma, según la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD 2-Clause |
| Formato de pesos | `.pt`, `.pth` (estados de PyTorch); bundle MONAI |
| Tamano del repositorio | ~2.0 GB |
| Ficheros de pesos | `model.pt`, `early.pt`, `late.pt`, `late_dec.pt`, `wfgeo.pt`, `warmstart.pth` (~328 MB cada uno) |
| Dominio | Segmentación de capas retinianas en OCT (DA-OCT Challenge) |
| Clases de salida | 10 clases (mapa de etiquetas definido en el bundle) |
| Uso previsto | Solo investigación |

## Arquitectura y entrenamiento

Según la model card, el pipeline se basa en SegFormer y se sirve mediante seis estados de pesos diferenciados que corresponden a un esquema de enrutado por forma (*shape-routed*): `model.pt`, `early.pt`, `late.pt`, `late_dec.pt`, `wfgeo.pt` y `warmstart.pth`. El repositorio no detalla la composición del dataset de entrenamiento, el número de tokens o imágenes, ni si se emplearon técnicas de ajuste fino específicas más allá de la mención a un `warmstart.pth`.

La model card indica explícitamente que el servicio es no determinista por diseño, con adaptación en ejecución (*in-run adaptation*) protegida por una guarda de validación. La cadena de procedencia está verificada por sha256 en cuatro etapas: réplica de laboratorio, release, evaluación Y4 y bundle. No se dispone de información sobre hiperparámetros, aumentación de datos ni estrategia de validación en la información proporcionada.

## Capacidades

- Segmentación de capas retinianas en imágenes OCT (tomografía de coherencia óptica).
- Salida de segmentación con 10 clases, según el mapa de etiquetas definido en el bundle de MONAI.
- Enrutado por forma mediante múltiples estados de pesos para distintos regímenes de entrada.
- Adaptación en ejecución con guarda de validación (comportamiento no determinista declarado).
- Integración como bundle de MONAI Model Zoo para despliegue estandarizado.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Investigación en segmentación de capas retinianas: el pipeline permite reproducir la evaluación Y4 del DA-OCT Challenge usando los pesos verificados por sha256, lo que facilita la comparación con resultados publicados.
- Evaluación comparativa de métodos de segmentación OCT: al estar empaquetado como bundle MONAI, se puede desplegar junto a otros bundles del zoo para comparar métricas de segmentación sobre el mismo conjunto de datos.
- Desarrollo de herramientas de análisis retiniano en laboratorio: los seis estados de pesos con enrutado por forma permiten estudiar el comportamiento del modelo ante distintas morfologías de imagen.
- Validación de pipelines de imagen médica: la guarda de validación en ejecución sirve como caso de estudio para diseñar sistemas de inferencia con control de calidad interno.
- Reproducibilidad de investigación: la cadena de procedencia verificada permite auditar el origen de los pesos en publicaciones científicas.
- Formación y docencia: el bundle y sus pesos pueden usarse en entornos académicos para ilustrar flujos de segmentación médica con MONAI.
- No es adecuado para diagnóstico clínico ni para uso comercial, dado que la licencia y la model card restringen el uso a investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Cada fichero de pesos ocupa ~328 MB, pero no se especifica el tamaño del modelo ni el pico de memoria en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: bundle de MONAI Model Zoo (formato nativo); no se documentan otros motores de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de segmentación de capas retinianas en OCT ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Uso restringido a investigación: la model card indica explícitamente "Research use only", pese a la licencia BSD 2-Clause.
- Servicio no determinista por diseño: la adaptación en ejecución con guarda de validación implica que dos ejecuciones pueden producir resultados distintos.
- Documentación incompleta en este repositorio: el mapa de etiquetas de 10 clases, la procedencia detallada y las instrucciones de uso residen en el bundle `daoct_retinal_seg_prodigyra`, no aquí.
- Sin información sobre sesgos: no se documentan sesgos demográficos, de adquisición o de equipo en la información disponible.
- Riesgo de alucinación no aplica en el sentido de modelos generativos, pero no se documenta el comportamiento ante imágenes fuera de distribución.
- Sin datos de rendimiento ni métricas de validación en este repositorio.
- No apto para uso clínico ni diagnóstico sin validación adicional.
- Fecha de creación del repositorio (2026-11-16) y autor de los pesos (Washington University in St. Louis) según la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wusmai/daoct_retinal_seg_prodigyra-weights
- Bundle MONAI Model Zoo `daoct_retinal_seg_prodigyra`: no disponible en la información proporcionada
- DA-OCT Challenge: no disponible en la información proporcionada
- Paper o publicación asociada: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada

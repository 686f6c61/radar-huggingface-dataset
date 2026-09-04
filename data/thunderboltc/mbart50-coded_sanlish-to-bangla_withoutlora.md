# thunderboltc/mbart50-coded_sanlish-to-bangla_withoutLORA

## Resumen

Este modelo es un ajuste fino (fine-tuning) completo del modelo mBART-50 de Facebook, desarrollado por thunderboltc, con el objetivo de traducir texto en "coded_sanlish" al bangla. La tarea se aborda mediante un transformer encoder-decoder multilingüe, adaptado específicamente al par de lenguas con un entrenamiento de 20 épocas. El modelo se presenta como una alternativa sin LoRA, es decir, sin adaptadores de bajo rango, lo que implica que todos los parámetros del modelo base se han actualizado durante el entrenamiento.

La relevancia de este modelo radica en que cubre un par de lenguas de bajos recursos, como el santali romanizado y el bangla, aunque no se han publicado resultados de evaluación en la información disponible. No se han proporcionado datos sobre el tamaño exacto, la longitud de contexto ni los resultados de benchmarks, por lo que cualquier uso en producción debe ir precedido de una validación exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mBART-50) |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Bangla (bn) como destino; fuente: coded_sanlish (etiquetada en_XX) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo se basa en `facebook/mbart-large-50-many-to-many-mmt`, un transformer encoder-decoder diseñado para traducción multilingüe de 50 idiomas. El ajuste fino se realizó sin LoRA, actualizando todos los pesos del modelo base. Según la model card, el entrenamiento se llevó a cabo con los siguientes hiperparámetros: tasa de aprendizaje 2e-05, weight decay 0.05, label smoothing 0.1, batch por dispositivo 4, gradientes acumulados 4, 20 épocas y precisión mixta fp16.

La selección del mejor checkpoint se basó en la métrica BLEU sobre el conjunto de validación, evaluada en cada época junto con chrF++ (word_order=2). No se especifican la composición ni el tamaño del dataset de entrenamiento, identificado como `custom-coded-sanlish-bangla`.

## Capacidades

- Traducción automática de texto en el par coded_sanlish → bangla.
- Tool calling: no disponible.
- Soporte para agentes: no disponible.
- Capacidades multilingües: no disponible (el modelo base es multilingüe, pero no se ha evaluado si este ajuste conserva las capacidades en otros idiomas).
- Visión o audio: no disponible.

## Casos de uso

- Traducción de contenido digital en santali romanizado: el modelo puede convertir publicaciones de redes sociales o foros escritas en coded_sanlish a bangla, facilitando el acceso de hablantes de bangla a contenido de comunidades santali.
- Digitalización de patrimonio lingüístico: investigadores pueden usarlo para transcribir y traducir textos en santali registrados en alfabeto latino, preservando la lengua munda en un formato legible para hablantes de bangla.
- Servicios públicos bilingües: organismos en regiones con población santali podrían integrar el modelo en chatbots para traducir consultas en sanlish a bangla, reduciendo barreras idiomáticas.
- Creación de datasets paralelos: el modelo puede generar traducciones candidatas de textos sanlish a bangla, que luego se revisan y se usan para entrenar modelos más robustos.
- Investigación en lingüística computacional: sirve como referencia para estudiar cómo el fine-tuning de mBART-50 se comporta con lenguas minoritarias y variantes romanizadas, aunque carece de métricas publicadas.
- Aplicaciones de mensajería instantánea: en apps de comunicación entre hablantes de santali y bangla, el modelo podría ofrecer traducción automática en tiempo real, siempre que se valide su rendimiento antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que se evaluó cada época con SacreBLEU y chrF++ (word_order=2), pero no se proporcionan valores finales. Por tanto, no es posible comparar este modelo con otros en términos de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible
- GPU recomendadas: no disponible
- Compatibilidad con GPU de consumo: no disponible
- Opciones de despliegue: no disponible
- Latencia y throughput: no disponible

## Comparativa con modelos similares

Los modelos comparables más directos son otras dos variantes publicadas por el mismo autor para el mismo par de traducción, aunque ninguna de ellas tiene datos de evaluación disponibles. A continuación se muestra una comparativa de identificación:

| Modelo | Base | Tarea | Licencia | Resultados |
|---|---|---|---|---|
| mbart50-coded_sanlish-to-bangla_withoutLORA | mBART-50 | coded_sanlish → bangla | MIT | no disponible |
| mbart50-sanlish-to-bangla | mBART-50 | sanlish → bangla | no disponible | no disponible |
| mbart50-sanlish-to-bangla_1934_lr2e5_bleufixed | mBART-50 | sanlish → bangla | no disponible | no disponible |

No se dispone de más detalles sobre estos modelos.

## Limitaciones y advertencias

- No hay datos de evaluación publicados, por lo que el rendimiento real del modelo es desconocido.
- El dataset `custom-coded-sanlish-bangla` no está documentado ni disponible públicamente, lo que dificulta la reproducibilidad.
- El modelo está especializado en un dominio de "coded_sanlish" que puede no representar todos los dialectos del santali.
- Riesgo de alucinaciones en traducción, especialmente con entradas fuera del dominio de entrenamiento.
- La licencia MIT permite uso comercial, pero al no tener garantías de calidad, debe validarse exhaustivamente antes de su uso en producción.
- No se ha informado sobre sesgos específicos; los modelos de traducción pueden amplificar sesgos de género o culturales presentes en los datos.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es experimental y no ha sido validado por la comunidad.

## Enlaces

- https://huggingface.co/thunderboltc/mbart50-coded_sanlish-to-bangla_withoutLORA
- https://huggingface.co/thunderboltc/mbart50-sanlish-to-bangla
- https://huggingface.co/thunderboltc/mbart50-sanlish-to-bangla_1934_lr2e5_bleufixed

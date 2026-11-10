# victorgpt0/claimguard-consistency-classifier

## Resumen

ClaimGuard semantic consistency classifier es un adaptador LoRA sobre Bio_ClinicalBERT desarrollado por Gichuru Victor Kimotho (Strathmore University) como parte de un proyecto de fin de grado sobre fraude en seguros médicos para la Social Health Authority (SHA) de Kenia. El modelo recibe un par de textos formado por la justificación clínica en texto libre de una reclamación y la definición del código ICD-11 con el que se facturó, y clasifica si ambos son consistentes o inconsistentes. Es la etapa de verificación textual de ClaimGuard, un prototipo de auditoría posterior al pago.

El modelo no pretende detectar fraude por sí mismo: su función es priorizar qué reclamaciones ya pagadas debe revisar primero un auditor humano y señalar la evidencia textual relevante. Se ejecuta únicamente sobre reclamaciones que una primera etapa estadística ya ha marcado, y un auditor revisa cada informe que produce. Un veredicto de "inconsistente" no constituye una conclusión de fraude, sino una señal para revisión.

Técnicamente es un clasificador de pares de secuencias con un adaptador PEFT de rango 8 y una cabeza de clasificación entrenada, sobre una base de 110M parámetros aproximadamente (Bio_ClinicalBERT) con contexto máximo de 512 tokens. El entrenamiento se hizo exclusivamente con datos sintéticos (20.000 reclamaciones generadas), en inglés, y el checkpoint publicado es el congelado con el que se produjeron todos los resultados reportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) con adaptador LoRA y cabeza de clasificación de 2 clases |
| Parámetros totales | no disponible (base Bio_ClinicalBERT, aproximadamente 110M; el adaptador LoRA añade un número reducido de parámetros entrenables) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (par de secuencias truncado conjuntamente) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones; al ser un modelo pequeño, la inferencia en FP32/FP16 es viable) |
| Idiomas soportados | inglés |
| Licencia | MIT (el modelo base también es MIT) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un clasificador de pares de secuencias construido sobre `emilyalsentzer/Bio_ClinicalBERT`, un encoder BERT entrenado con notas clínicas. Sobre la base se aplica un adaptador LoRA de rango 8, alpha 16 y dropout 0.1 en las proyecciones `query` y `value`, junto con una cabeza de clasificación entrenada por completo. La entrada es el par `(clinical_notes, icd11_definition)`, tokenizado conjuntamente y truncado a 512 tokens; la salida son dos logits para las etiquetas `0 = consistent` y `1 = inconsistent`.

El entrenamiento usó hasta 5 épocas con early stopping (paciencia 2), batch size 16, learning rate 2e-4, pérdida de entropía cruzada ponderada por clase y PEFT 0.21.1 sobre una Tesla T4 de Google Colab. Se ejecutaron cinco semillas (42, 123, 2024, 7, 31415); el checkpoint publicado corresponde a la semilla 7, la de mejor F1 de validación. Los datos son íntegramente sintéticos (dataset `v0.6-20k`, 20.000 reclamaciones): las notas clínicas las generó Qwen2.5-7B-Instruct en cuantización AWQ 4-bit, y el fraude se inyectó según seis tipologías modeladas sobre patrones documentados de la SHA (dependientes anómalos, facturación fantasma, tasas de cesárea infladas, conversión de ambulatorio a ingreso, fabricación de registros y upcoding). Solo tres de esas tipologías dejan rastro en el texto (facturación fantasma, fabricación de registros y upcoding); el resto queda para los detectores de anomalías sobre campos estructurados. Las definiciones ICD-11 provienen de la API de la OMS, en caché. El 30% de las reclamaciones de cada split incorpora ruido de robustez (abreviaturas, erratas, errores de espaciado), y el split de test usa un glosario de abreviaturas distinto y plantillas de fabricación reservadas, de modo que contiene texto no visto durante el entrenamiento.

## Capacidades

- Clasificación binaria de consistencia semántica entre una nota clínica en texto libre y la definición de un código ICD-11.
- Procesamiento de pares de secuencias con truncado conjunto a 512 tokens.
- Robustez parcial frente a abreviaturas, erratas y errores de espaciado en las notas (entrenado con un 30% de ruido de este tipo).
- Salida de una puntuación (softmax del logit predicho) utilizable para ordenar reclamaciones por prioridad de revisión.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de razonamiento explícito (thinking mode).
- No procesa visión ni audio.
- Multilingüismo limitado al inglés; no cubre notas con code-switching inglés-swahili.

## Casos de uso

- Priorización de auditoría post-pago: el modelo puntúa cada par (nota, código ICD-11) de las reclamaciones ya marcadas por la etapa estadística, de modo que los auditores revisan primero las de mayor puntuación de inconsistencia. Es adecuado porque su salida está pensada para ranking, no como probabilidad calibrada.
- Triaje de documentación clínica: detectar reclamaciones cuya justificación textual no respalda el código facturado, señalando posibles errores de codificación o documentación deficiente antes de una revisión manual.
- Control de calidad de codificación ICD-11: uso interno por parte de equipos de codificación médica para localizar pares nota-código sospechosos y corregir codificaciones erróneas.
- Señalización de upcoding y fabricación de registros: dado que estas tipologías dejan rastro textual, el modelo puede contribuir a identificar candidatos para revisión dentro de un pipeline más amplio de detección.
- Investigación académica sobre verificación de consistencia en textos clínicos: sirve como punto de partida reproducible (con el generador de datos del repositorio) para experimentos con datos sintéticos y adaptadores LoRA sobre Bio_ClinicalBERT.
- Filtrado previo en pipelines de auditoría a gran escala: al ser un modelo pequeño (base BERT), puede ejecutarse sobre lotes grandes de reclamaciones con requisitos de hardware modestos antes de pasar a revisores humanos.
- Prototipado de sistemas de apoyo a la decisión en aseguradoras sanitarias: integrable como componente de una arquitectura de auditoría por etapas, siempre con revisión humana de cada informe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas internas de validación (179 pares inconsistentes de 3.600 en validación, checkpoint seleccionado por F1 de validación con semilla 7), pero no se proporcionan valores de MMLU, HumanEval, GSM8K ni de precisión, recall o F1 en el material disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; un encoder BERT base en FP16 ocupa aproximadamente 0,2-0,3 GB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una Tesla T4 (la usada en el entrenamiento) es suficiente. Para lotes grandes, A100 o H100 aportan mayor throughput, aunque no son necesarias.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: al ser un adaptador PEFT sobre transformers, se carga con la librería `peft` y `transformers`; también puede servirse con Text Generation Inference no aplica (es clasificación), pero sí con servidores de inferencia de clasificación basados en transformers o con exportación a ONNX. No se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClaimGuard consistency classifier (este modelo) | Base Bio_ClinicalBERT (~110M) + LoRA | 512 tokens | Clasificación de consistencia nota-ICD-11 | MIT | Hugging Face (adaptador PEFT) |
| emilyalsentzer/Bio_ClinicalBERT | ~110M | 512 tokens | Modelo base de dominio clínico (representaciones) | MIT | Hugging Face |
| Otros clasificadores clínicos sobre BERT | no disponible | no disponible | Clasificación de texto clínico | variable | no disponible |

No se dispone de información sobre alternativas comparables específicas para la tarea de consistencia nota-código ICD-11.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con datos sintéticos; no se ha validado con datos reales de la SHA, de pacientes o de proveedores.
- La puntuación de salida no está calibrada (no se aplicó temperature scaling ni regresión isotónica) y la pérdida ponderada por clase desplaza los valores; una puntuación de 0,95 no implica un 95% de probabilidad de inconsistencia. Debe usarse para ordenar, no como probabilidad.
- Un veredicto de "inconsistente" no es una conclusión de fraude: puede deberse a errores de codificación, documentación deficiente o casos genuinos atípicos. Ninguna reclamación, proveedor o miembro debe penalizarse sin revisión humana de los registros subyacentes.
- Solo cubre inglés; no soporta notas con code-switching inglés-swahili ni otros idiomas.
- Solo cubre ICD-11; no es aplicable a otros sistemas de codificación.
- Fuera de alcance: adjudicación de reclamaciones previa al pago y cualquier decisión automatizada sobre personas o centros sanitarios.
- El dataset no está publicado; puede regenerarse con el generador del repositorio y las mismas semillas, pero una GPU o versión de vLLM distintas pueden alterar el texto generado.
- Solo tres de las seis tipologías de fraude dejan rastro textual; el modelo no detecta las visibles únicamente en campos estructurados.
- Licencia MIT: permite uso comercial, pero las advertencias de uso previsto y la necesidad de revisión humana deben respetarse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/victorgpt0/claimguard-consistency-classifier
- Modelo base Bio_ClinicalBERT: https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT
- Repositorio de código: https://github.com/victorgpt0/claimguard
- API de ICD-11 de la OMS: https://icd.who.int/icdapi (referenciada en la model card como fuente de las definiciones)

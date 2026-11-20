# vuvanvui02265/nmt-en-vi-d128

## Resumen

El modelo `nmt-en-vi-d128` es un sistema de traducción automática neuronal (NMT) bilingüe inglés-vietnamita publicado por el usuario `vuvanvui02265` en Hugging Face. Según la propia model card, se trata de un modelo de demostración desarrollado con fines de aprendizaje, no de un sistema de traducción de calidad producción. Traduce en ambas direcciones (inglés a vietnamita y vietnamita a inglés) y se distribuye en formato ONNX, lo que permite su ejecución en CPU e incluso en dispositivos móviles mediante Termux.

El modelo tiene un tamaño de repositorio de 0.0 GB, lo que indica un tamaño muy reducido (coherente con el sufijo `d128` del nombre, que sugiere una dimensión de modelo o de embedding de 128). Está empaquetado junto a un tokenizador en JSON (`tok.json`) y se ejecuta mediante ONNX Runtime sin necesidad de conexión a internet. La licencia es MIT, lo que permite uso comercial sin restricciones significativas.

Su relevancia es limitada: se trata de un ejercicio educativo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Resulta útil como referencia para quien quiera entender el flujo mínimo de despliegue de un modelo NMT en ONNX, pero no como solución de traducción para entornos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (NMT; presumiblemente transformer, no confirmado por el autor) |
| Parámetros totales | No disponible (el sufijo `d128` sugiere dimensión 128, no confirmado) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (se distribuye en ONNX, sin indicar cuantización) |
| Idiomas soportados | Inglés (en), vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | ONNX (`nmt-en-vi-d128.onnx`) + tokenizador JSON (`tok.json`) |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna del modelo. La model card no especifica si se trata de un transformer encoder-decoder, un modelo basado en RNN, ni detalla el número de capas, cabezas de atención o dimensión oculta. El sufijo `d128` del nombre del archivo sugiere una dimensión de modelo o de embedding de 128, pero el autor no lo confirma explícitamente.

Tampoco se documentan los datos de entrenamiento: no se indica el número de tokens, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor describe el modelo como "my first NMT model", entrenado "for learning" y compartido "as a demo", lo que sitúa el proyecto en el ámbito educativo y no en el de la investigación reproducible con documentación completa.

## Capacidades

- Traducción bidireccional inglés a vietnamita y vietnamita a inglés.
- Ejecución totalmente offline mediante ONNX Runtime.
- Funcionamiento en CPU y en dispositivos móviles (el autor menciona Termux).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.
- Rendimiento declarado aceptable solo con frases cortas; calidad limitada en textos largos o complejos.

## Casos de uso

- Aprendizaje y experimentación con NMT: sirve como ejemplo mínimo de extremo a extremo (tokenizador JSON + modelo ONNX) para quien quiera entender cómo se despliega un traductor neuronal sin infraestructura de GPU.
- Traducción de frases cortas en aplicaciones locales: por su tamaño reducido y ejecución en CPU, puede integrarse en utilidades de escritorio o scripts que traduzcan cadenas breves sin conexión.
- Despliegue en dispositivos con recursos limitados: el autor indica que funciona en teléfonos mediante Termux, lo que lo hace apto para pruebas de concepto en entornos móviles.
- Prototipado de pipelines de traducción: permite validar la integración de ONNX Runtime y un tokenizador propio antes de sustituir el modelo por uno de mayor calidad.
- Docencia y talleres: útil como material didáctico para ilustrar el ciclo completo de entrenamiento y exportación de un modelo NMT.
- Pruebas de concepto de traducción bidireccional en entornos air-gapped: al no requerir conexión, encaja en escenarios con requisitos de aislamiento de red, siempre que la calidad exigida sea baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0.0 GB) y el sufijo `d128`, se trata de un modelo muy pequeño que probablemente quepa en unos pocos cientos de MB de RAM como máximo, aunque el autor no aporta cifras.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU.
- Compatibilidad con GPU de consumo: no confirmada; el diseño apunta a ejecución en CPU y dispositivos móviles.
- Opciones de despliegue: ONNX Runtime (método indicado por el autor); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nmt-en-vi-d128 (este modelo) | No disponible | No disponible | en, vi | MIT | Hugging Face, ONNX |
| Helsinki-NLP/opus-mt-en-vi | No disponible en la información proporcionada | No disponible | en, vi | No disponible en la información proporcionada | Hugging Face |
| VinAI PhoMT | No disponible en la información proporcionada | No disponible | en, vi | No disponible en la información proporcionada | Repositorio de investigación |

No se dispone de datos de rendimiento del modelo analizado que permitan una comparación cuantitativa con alternativas. Las filas de modelos comparables se incluyen solo como referencia de categoría; sus especificaciones no están verificadas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de demostración creado con fines de aprendizaje; el propio autor advierte que la calidad es limitada.
- Rendimiento deficiente en frases largas o textos complejos; funciona mejor con oraciones cortas.
- Sin benchmarks publicados que permitan evaluar su calidad de traducción de forma objetiva.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan sesgos lingüísticos ni culturales, pero al ser un modelo pequeño y sin documentación de datos, el riesgo de sesgos y de alucinaciones en la traducción no puede descartarse.
- Licencia MIT: permite uso comercial, pero la falta de garantías de calidad hace desaconsejable su uso en producción sin una evaluación previa.
- No se especifica la longitud máxima de entrada soportada, lo que dificulta planificar su integración en pipelines reales.
- Solo cubre el par inglés-vietnamita; no soporta otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vuvanvui02265/nmt-en-vi-d128
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.

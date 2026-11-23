# tos-isw/sarashina2.2-0.5b-pii-ner

## Resumen

sarashina2.2-0.5b-pii-ner es un adaptador LoRA de clasificación de tokens (NER) especializado en la detección y enmascaramiento de información personal (PII) en documentos en japonés. Lo desarrolla el usuario tos-isw sobre el modelo base sbintuitions/sarashina2.2-0.5b, un transformer decoder de 0,5 mil millones de parámetros publicado por SB Intuitions bajo licencia MIT. El adaptador añade una cabeza de clasificación token a token que distingue 56 tipos de PII codificados en formato BIO (113 clases en total).

El modelo resuelve un problema concreto de cumplimiento y privacidad: localizar y sustituir datos personales (nombres, teléfonos, direcciones, identificadores) en textos japoneses antes de almacenarlos, compartirlos o procesarlos con otros sistemas. Frente a enfoques generativos, la formulación como token classification ofrece spans deterministas y reconstruibles a nivel de carácter, lo que facilita la auditoría del enmascaramiento.

Es relevante por su tamaño reducido (0,5B), su licencia permisiva (MIT tanto en adaptador como en base) y su rendimiento reportado sobre el conjunto de test del dataset Nemotron-PII-Japan: F1 de span exacto 0,9950 y recall de enmascaramiento a nivel de carácter de 0,9997. Todo el entrenamiento se realizó en una única GPU de consumo (AMD Radeon RX 9070 XT de 16 GB) en unos 68 minutos, lo que lo hace reproducible con recursos modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (sarashina2.2-0.5b) con cabeza de clasificación de tokens; adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base); el adaptador LoRA se distribuye por separado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens por ventana; documentos más largos se procesan con ventana deslizante |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia reportados en bf16) |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT (adaptador y código, Copyright 2026 tos-isw); modelo base MIT (SB Intuitions) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); incluye paquete Python `pii/` para inferencia |
| Tarea | token-classification (NER) |
| Etiquetas | 56 tipos de PII en formato BIO (113 clases) |
| Dataset de entrenamiento | nvidia/Nemotron-PII-Japan (100.000 documentos sintéticos) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo parte de sbintuitions/sarashina2.2-0.5b, un transformer decoder de 0,5B parámetros, al que se le acopla una cabeza de clasificación token a token inicializada a cero. El ajuste se realiza mediante LoRA con r=64, alpha=128 y dropout 0,05, aplicado a las proyecciones q/k/v/o/gate/up/down, mientras que la cabeza de clasificación se entrena por completo. El etiquetado sigue el esquema BIO sobre 56 tipos de PII, lo que da 113 clases.

Los datos proceden de Nemotron-PII-Japan, un corpus sintético de 100.000 documentos en japonés, dividido con semilla 42 en 97.000 de entrenamiento, 1.000 de validación y 2.000 de test. El entrenamiento usa learning rate 1e-4 con scheduler coseno y warmup del 3%, una sola época, batch efectivo de 16, precisión bf16 y longitud máxima de 2048 tokens. Se ejecutó en una AMD Radeon RX 9070 XT (16 GB) bajo WSL2 con ROCm 7.2.1 y PyTorch 2.9.1, con un tiempo total de unos 68 minutos. El pipeline de reproducción (prepare_data.py, train_ner.py, predict.py y setup_wsl.sh) está incluido en el repositorio.

Una innovación práctica destacable es el postprocesado de decodificación en `pii/ner.py`: fusiona en un único span las etiquetas iguales separadas solo por espacios de ancho completo o medio, y separa los sufijos japoneses «から/まで/より» (desde/hasta/desde) del final de las fechas. El paquete incluido también resuelve la conversión de tokens a spans de caracteres, necesaria porque el modelo clasifica a nivel de token y los límites de token no siempre coinciden con los límites de las entidades (coinciden en el 97,6% de los casos en el conjunto de entrenamiento).

## Capacidades

- Detección de PII en japonés sobre 56 tipos de entidades, incluyendo nombres y apellidos, números de teléfono, direcciones, correos electrónicos, IPv4 e instituciones educativas, entre otros.
- Enmascaramiento configurable: sustitución por etiqueta entre corchetes (por ejemplo `[phone_number]`), relleno con caracteres ■ o modo con visualización de spans.
- Salida estructurada de spans con posición de inicio, fin, etiqueta y texto detectado, apta para integración programática.
- Procesamiento de documentos largos mediante ventana deslizante de 2048 tokens.
- Uso automático de GPU si está disponible; funciona también en CPU (más lento).
- Ejecución vía CLI (`mask.py`) y vía API de Python (`pii.predictors.load_predictor`, `pii.common.mask_text`).
- No soporta tool calling, agentes, visión ni audio: es un modelo de clasificación, no generativo.

## Casos de uso

- Anonimización previa a almacenamiento: antes de guardar formularios o expedientes japoneses en una base de datos, el modelo detecta y sustituye nombres, teléfonos y direcciones, reduciendo la exposición de datos personales en reposo.
- Cumplimiento normativo y auditoría: en flujos sujetos a la ley japonesa de protección de datos personales (APPI), el modelo genera registros de spans detectados que pueden revisarse y adjuntarse como evidencia del proceso de enmascaramiento.
- Preprocesado para pipelines de IA: enmascarar PII antes de enviar textos a modelos generativos de terceros o a servicios en la nube, evitando filtrar datos personales a proveedores externos.
- Procesamiento de documentos de atención al cliente: con soporte de ventana deslizante de 2048 tokens, puede procesar transcripciones y correos de varios párrafos, aunque su precisión cae en frases cortas de estilo conversacional.
- Sanitización de logs y tickets: integrado como paso previo en sistemas de observabilidad, elimina identificadores personales de registros antes de su retención a largo plazo.
- Enmascaramiento por lotes en GPU de consumo: con un rendimiento de aproximadamente 180 documentos por segundo en una RX 9070 XT en bf16, es viable procesar corpus de decenas de miles de documentos en minutos en hardware asequible.
- Generación de datasets de entrenamiento desidentificados: permite preparar corpus japoneses para ajuste fino de otros modelos sin arrastrar PII del material original.

## Benchmarks y rendimiento

Evaluación sobre 2.000 documentos de test separados de Nemotron-PII-Japan:

| Metrica | Valor |
|---|---|
| Span exacto (posición + etiqueta) P / R / F1 | 0,9945 / 0,9955 / 0,9950 |
| Span solo posición F1 | 0,9958 |
| Enmascaramiento a nivel de carácter P / R | 0,9995 / 0,9997 |
| Documentos sin ningún carácter de PII sin enmascarar | 99,65% |
| Velocidad (RX 9070 XT, bf16) | ~180 documentos/segundo |

Etiquetas con rendimiento más bajo: `educational_institution_name` (F1 0,92, confusión con nombres de empresa), `ipv4` (0,98) y `city` (0,98). Los informes por etiqueta están en `eval/report.txt` y `eval/metrics.json` del repositorio. No se han publicado comparaciones con otros modelos de NER japonés en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 0,5B en bf16 ocupa aproximadamente 1 GB de pesos; con el adaptador y las activaciones de inferencia, el consumo es de unos pocos GB. No se especifica una cifra exacta en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; el autor reporta entrenamiento e inferencia en una AMD Radeon RX 9070 XT de 16 GB.
- Cabe en GPU de consumo: sí, en tarjetas de gama media y alta (RTX 3060 en adelante, RX 6000/7000, entre otras). También funciona en CPU, con menor velocidad.
- Opciones de despliegue: el repositorio incluye su propio paquete Python `pii/` con `mask.py` y `load_predictor`. Al ser un adaptador PEFT sobre un transformer estándar, es compatible con el ecosistema Hugging Face Transformers y PEFT; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 180 documentos por segundo en RX 9070 XT en bf16; no se reportan cifras para CPU ni para otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| tos-isw/sarashina2.2-0.5b-pii-ner | 0,5B + LoRA | NER de PII (token classification) | ja | MIT | F1 span exacto 0,9950 en test sintético |
| tos-isw/sarashina2.2-0.5b-pii-gen | 0,5B + LoRA | Generación de enmascaramiento | ja | no disponible en la información | Misma base y dataset, enfoque generativo |
| sbintuitions/sarashina2.2-0.5b | 0,5B | Modelo de lenguaje general | ja | MIT | Modelo base sin cabeza de clasificación |

No se dispone en la información proporcionada de datos comparativos con otros modelos de NER de PII en japonés (por ejemplo, alternativas basadas en BERT japonés o en modelos multilingües), por lo que la comparativa se limita a las variantes del mismo autor y al modelo base.

## Limitaciones y advertencias

- Los datos de entrenamiento y evaluación son sintéticos; el rendimiento en documentos reales o de otros dominios puede degradarse y requiere validación previa sobre el corpus objetivo.
- Las métricas reportadas corresponden a la misma distribución que el entrenamiento (documentos de trabajo y formularios de varios cientos de caracteres). En frases cortas de estilo conversacional la precisión cae: el propio autor documenta que en «山田太郎さん（090-1234-5678）は東京都港区在住です。» no detecta el nombre y fusiona municipio y prefectura en un solo span.
- La clasificación es a nivel de token: si un token cruza el límite de una entidad (por ejemplo «太郎さん» o «東京都港区» como token único), el span no se puede extraer correctamente. Los límites de token y de span coinciden en el 97,6% de los casos de entrenamiento.
- Existen falsos negativos; el modelo no garantiza el cumplimiento de obligaciones legales o normativas de anonimización y debe combinarse con revisión humana.
- No detecta tipos de PII ausentes del dataset, como formatos de identificadores internos de empresa.
- Solo soporta japonés; no hay capacidades multilingües.
- Licencia MIT en adaptador y modelo base, lo que permite uso comercial; el dataset Nemotron-PII-Japan se distribuye bajo CC BY 4.0 y no está incluido en el repositorio.
- No es un modelo generativo: no puede explicar sus decisiones ni reformular texto, solo etiquetar tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tos-isw/sarashina2.2-0.5b-pii-ner
- Variante generativa: https://huggingface.co/tos-isw/sarashina2.2-0.5b-pii-gen
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-0.5b
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII-Japan
- Licencia CC BY 4.0 del dataset: https://creativecommons.org/licenses/by/4.0/

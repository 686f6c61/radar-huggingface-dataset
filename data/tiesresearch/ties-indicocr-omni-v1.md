# TIESresearch/TIES-IndicOCR-Omni-v1

## Resumen

TIES-IndicOCR-Omni-v1 es un modelo de reconocimiento óptico de caracteres (OCR) para lenguas índicas publicado por TIESresearch. No es un único checkpoint neuronal, sino un enrutador de mezcla de expertos (MoE) que agrupa 32 especialistas OCR independientes, cada uno asociado a una combinación concreta de lengua (código ISO) y modalidad (impreso, manuscrito o texto en escena). El llamador indica la lengua y la modalidad, y el runtime carga de forma perezosa el experto ONNX correspondiente. El paquete se distribuye en formato ONNX para ejecución con `onnxruntime`, con un tamaño de repositorio de 0,5 GB.

La relevancia del modelo reside en su enfoque de despliegue: en lugar de promediar pesos de distintos checkpoints (una fusión que el autor documenta como fallida, con un CER de 1,0000 en hindi frente a 0,0998 del especialista), conserva cada checkpoint entrenado por separado y enruta la inferencia según la lengua y la modalidad solicitadas. Cubre 13 lenguas índicas (asamés, bengalí, guyaratí, hindi, canarés, malabar, manipuri, maratí, oriya, panyabí, tamil, telugu y urdu) y tres modalidades de entrada.

El modelo está pensado para el reconocimiento de recortes de palabra o línea corta, no para el análisis de maquetación de página completa, que queda como etapa separada. Su licencia es CC BY 4.0 y exige mantener la atribución de los conjuntos de datos de origen, catalogados por IL-OCR del IIIT Hyderabad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos enrutada (32 especialistas OCR independientes en ONNX); no es un transformer único ni un checkpoint promediado |
| Parametros totales | no disponible |
| Parametros activos | no disponible (se carga un experto por consulta, pero no se publica el recuento de parámetros) |
| Longitud de contexto | no disponible (entrada de imagen: recorte de palabra o línea corta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mni, mr, or, pa, ta, te, ur (13 lenguas índicas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (ejecución con `onnxruntime`) |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos enrutada de forma explícita: el usuario proporciona el código ISO de lengua y la modalidad, y el runtime carga de forma perezosa el experto ONNX correspondiente. No existe enrutamiento automático ni un clasificador de lengua o modalidad integrado. Cada experto es un checkpoint entrenado de forma independiente; el paquete conserva los checkpoints originales en lugar de fusionar pesos, decisión justificada por el autor tras comprobar que la fusión literal degradaba gravemente el rendimiento (CER de 1,0000 en el subconjunto de test de hindi frente a 0,0998 del especialista).

Los expertos se entrenaron sobre conjuntos de datos con licencia verificada CC BY 4.0 catalogados por IL-OCR del IIIT Hyderabad: Mozhi para texto impreso, IIIT-INDIC-HW-WORDS para manuscrito e IndicSTR12 para texto en escena. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets ni si se aplicaron técnicas de RLHF o DPO, algo esperable en un modelo de OCR supervisado. Los caminos exactos de cada modelo y sus métricas quedan registrados en `model_index.json`.

## Capacidades

- Reconocimiento de texto impreso en 12 lenguas índicas (asamés, bengalí, guyaratí, hindi, canarés, malabar, manipuri, maratí, oriya, panyabí y urdu, este último en estado experimental).
- Reconocimiento de texto manuscrito en 8 lenguas (bengalí, guyaratí, hindi, canarés, malabar, oriya, panyabí, telugu y urdu).
- Reconocimiento de texto en escena (scene text) para 12 lenguas, si bien todos los expertos de esta modalidad están marcados como experimentales con CER entre 0,9375 y 1,0000.
- Entrada de imagen a texto sobre recortes de palabra o línea corta.
- Enrutamiento explícito por lengua y modalidad mediante parámetros de la API de inferencia.
- Ejecución local en el navegador a través de la demo pública, sin envío de imágenes a un servidor.
- No incluye detección de maquetación de página, enrutamiento automático de lengua ni clasificación automática de modalidad.

## Casos de uso

- Digitalización de documentos impresos en lenguas índicas: para lenguas como maratí (CER 0,0064), panyabí (0,0070) o bengalí (0,0075), el experto impreso ofrece una precisión adecuada para pipelines de digitalización de recortes de palabra y línea, siempre que una etapa previa de segmentación de página aísle los recortes.
- Procesamiento de formularios y manuscritos administrativos: los expertos manuscritos de canarés (CER 0,0172) y malabar (0,0312) permiten transcribir campos manuscritos cortos en entornos con requisitos de privacidad, ya que la inferencia puede ejecutarse localmente en el navegador.
- Reconocimiento en aplicaciones móviles o de escritorio sin conectividad: al distribuirse en ONNX y ejecutarse con `onnxruntime`, el paquete puede integrarse en aplicaciones cliente que carguen solo el experto necesario, reduciendo el tamaño de despliegue frente a un modelo multilingüe único.
- Extracción de texto en pipelines de document AI: el modelo se integra como etapa de reconocimiento tras un detector de líneas o palabras, aportando texto por lengua y modalidad a sistemas de indexación o búsqueda documental.
- Investigación lingüística y creación de corpus: la cobertura de 13 lenguas permite transcribir material de campo escaneado, con la advertencia de validar por separado cada par lengua-modalidad según la tabla de CER publicada.
- Evaluación comparativa de OCR índico: al conservar checkpoints especialistas independientes con métricas por conjunto de test, el paquete sirve como referencia reproducible para comparar sistemas OCR en las mismas particiones de Mozhi, IIIT-INDIC-HW-WORDS e IndicSTR12.
- Prototipado de lectura de texto en escena: solo con fines exploratorios y nunca para afirmaciones de producción, dado que los expertos de scene text presentan CER próximos a 1,0000 en la mayoría de lenguas.

## Benchmarks y rendimiento

Los datos publicados son el CER de test de cada experto sobre su conjunto de evaluación; no constituyen una puntuación agregada del modelo Omni.

| Lengua | Modalidad | Dataset | CER de test | Estado |
|---|---|---|---:|---|
| bn | Manuscrito | IIIT-INDIC-HW-WORDS-Bengali | 0,0685 | validado |
| as | Impreso | Mozhi-Assamese | 0,0092 | validado |
| bn | Impreso | Mozhi-Bengali | 0,0075 | validado |
| gu | Impreso | Mozhi-Gujarati | 0,0175 | validado |
| pa | Impreso | Mozhi-Punjabi | 0,0070 | validado |
| hi | Impreso | Mozhi-Hindi | 0,0123 | validado |
| kn | Impreso | Mozhi-Kannada | 0,0117 | validado |
| ml | Impreso | Mozhi-Malayalam | 0,0079 | validado |
| mr | Impreso | Mozhi-Marathi | 0,0064 | validado |
| mni | Impreso | Mozhi-Manipuri | 0,0132 | validado |
| or | Impreso | Mozhi-Oriya | 0,0194 | validado |
| ur | Impreso | Mozhi-Urdu | 0,9697 | experimental |
| gu | Manuscrito | IIIT-INDIC-HW-WORDS-Gujarati | 0,0696 | validado |
| pa | Manuscrito | IIIT-INDIC-HW-WORDS-Punjabi | 0,0398 | validado |
| hi | Manuscrito | IIIT-INDIC-HW-WORDS-Hindi | 0,0999 | validado |
| kn | Manuscrito | IIIT-INDIC-HW-WORDS-Kannada | 0,0172 | validado |
| ml | Manuscrito | IIIT-INDIC-HW-WORDS-Malayalam | 0,0312 | validado |
| or | Manuscrito | IIIT-INDIC-HW-WORDS-Oriya | 0,0876 | validado |
| te | Manuscrito | IIIT-INDIC-HW-WORDS-Telugu | 0,0900 | validado |
| ur | Manuscrito | IIIT-INDIC-HW-WORDS-Urdu | 0,1240 | validado |
| bn | Scene Text | IndicSTR12-Bengali | 1,0000 | experimental |
| as | Scene Text | IndicSTR12-Assamese | 1,0000 | experimental |
| gu | Scene Text | IndicSTR12-Gujarati | 1,0000 | experimental |
| pa | Scene Text | IndicSTR12-Punjabi | 0,9399 | experimental |
| hi | Scene Text | IndicSTR12-Hindi | 0,9375 | experimental |
| kn | Scene Text | IndicSTR12-Kannada | 1,0000 | experimental |
| ml | Scene Text | IndicSTR12-Malayalam | 1,0000 | experimental |
| mr | Scene Text | IndicSTR12-Marathi | 1,0000 | experimental |
| or | Scene Text | IndicSTR12-Oriya | 1,0000 | experimental |
| ta | Scene Text | IndicSTR12-Tamil | 1,0000 | experimental |
| te | Scene Text | IndicSTR12-Telugu | 1,0000 | experimental |
| ur | Scene Text | IndicSTR12-Urdu | 1,0000 | experimental |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros sistemas OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,5 GB en disco y cada experto se carga de forma perezosa, por lo que la huella en memoria es la del experto activo, no la del paquete completo.
- GPU recomendadas: no disponible; el modelo se distribuye para `onnxruntime`, que permite ejecución tanto en CPU como en GPU, pero no se publican requisitos mínimos.
- Compatibilidad con GPU de consumo: no disponible; dado el tamaño del repositorio (0,5 GB) es plausible que quepa en GPUs de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: `onnxruntime` en Python mediante el script `inference.py` y la clase `TIESIndicOCROmni`; la demo pública ejecuta la inferencia localmente en el navegador del visitante.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TIES-IndicOCR-Omni-v1 | no disponible | no disponible (recortes de palabra o línea) | CC BY 4.0 | Hugging Face, ONNX |
| Alternativas OCR índicas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La lengua y la modalidad son entradas de enrutamiento explícitas; el modelo no incluye enrutamiento automático, por lo que el llamador debe conocer ambas antes de invocar al experto adecuado.
- Reconoce recortes de palabra o línea corta, no la maquetación completa de una página; la detección de layout queda como etapa separada.
- Los especialistas de scene text y el experto de urdu impreso requieren entrenamiento adicional: los primeros presentan CER entre 0,9375 y 1,0000 y el segundo 0,9697, por lo que no deben usarse para afirmaciones de producción.
- La precisión varía sustancialmente entre lenguas y modalidades; es imprescindible consultar la tabla de CER antes de desplegar y validar el par concreto lengua-modalidad en el dominio de uso.
- No se publican sesgos conocidos ni tasas de alucinación específicas; al ser un modelo OCR supervisado, el riesgo principal es la sustitución o omisión de caracteres en la transcripción, no la generación de contenido libre.
- La licencia CC BY 4.0 permite uso comercial, pero exige mantener la atribución de los conjuntos de datos de origen (Mozhi, IIIT-INDIC-HW-WORDS e IndicSTR12, catalogados por IL-OCR del IIIT Hyderabad).
- Las imágenes de corrección aportadas por usuarios son privadas y no se incluyen en el paquete.
- No hay datos publicados de latencia, throughput ni requisitos de hardware que permitan dimensionar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TIESresearch/TIES-IndicOCR-Omni-v1
- Demo en el navegador: https://huggingface.co/spaces/TIESresearch/TIES-IndicOCR-Omni-Demo
- Catálogo de datasets IL-OCR (IIIT Hyderabad): https://ilocr.iiit.ac.in/dataset/

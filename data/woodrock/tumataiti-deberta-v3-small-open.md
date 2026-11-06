# woodrock/tumataiti-deberta-v3-small-open

## Resumen

Tūmataiti DeBERTa-v3-small (open data) es un clasificador de tokens especializado en la detección de información personal identificable (PII) en textos en inglés y en contextos de Nueva Zelanda, incluyendo te reo Māori y nombres de origen pasifika y asiático neozelandés. Lo desarrolla el autor independiente woodrock como componente central de Tūmataiti, una herramienta local de redacción que elimina datos personales antes de enviar texto a un modelo de IA en la nube. El modelo está pensado para ejecutarse en el dispositivo del usuario: el archivo ONNX int4 ocupa 152 MB y procesa un documento en unos 30 ms en la CPU de un portátil.

Arquitectónicamente es un fine-tuning de `microsoft/deberta-v3-small` (141.320.469 parámetros) para token-classification con etiquetado BIO sobre diez categorías de PII. Se complementa con reglas en Rust para identificadores con dígito de control (IRD, NHI, tarjetas) y cubre lo que las reglas no alcanzan: nombres, direcciones, afiliación a iwi, hapū y marae, y fechas de nacimiento en contexto.

Su relevancia actual reside en la combinación de tres factores: licencia Apache-2.0, despliegue en navegador o dispositivo sin conexión y un rendimiento medido en tasa de fuga documental (document leak rate) que en sus conjuntos de validación sintéticos se sitúa por debajo del 1 % en fp32. Es, por tanto, una pieza útil para pipelines de privacidad previos a inferencia en la nube, no un sistema de anonimización garantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-small (fine-tuning para token classification) |
| Parametros totales | 141.320.469 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por ventana, con 128 tokens de solapamiento en el decodificador de Tūmataiti |
| Tipos de cuantizacion | fp32 (safetensors) e int4 ONNX (embeddings int8, encoder con cuantización por bloques int4, 32 pesos por escala, activaciones fp32) |
| Idiomas soportados | en, mi (inglés y te reo Māori; incluye nombres pasifika y asiático neozelandeses) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32), ONNX (int4) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-small`, un encoder transformer con atención desacoplada y embeddings de posiciones relativas, y se fine-tunea para token classification con etiquetas BIO sobre las categorías `PERSON`, `ADDRESS`, `EMAIL`, `PHONE`, `URL`, `IP_ADDRESS`, `DATE` (solo fechas de nacimiento o defunción), `ID` (números gubernamentales, de tarjeta y bancarios), `SECRET` (contraseñas y claves) y `AFFILIATION` (iwi, hapū, marae). El entrenamiento se realizó durante 3 épocas (lr 5e-5, batch 16, seed 0), conservando el checkpoint tras la primera época, que fue el que obtuvo mejor puntuación en dev, sobre 38.000 documentos sintéticos.

El corpus combina tres fuentes: Tūmataiti NZ synthetic v2 (8.000 documentos generados a partir de plantillas de actas de reunión, derivaciones, formularios, entrevistas, mensajes y chats, con nombres extraídos al 25 % de cada una de las listas māori, pākehā, pasifika y asiático neozelandesa, e incluyendo palabras te reo no onomásticas como negativos), `nvidia/Nemotron-PII` (20.000 documentos, CC BY 4.0, con etiquetas remapeadas a las categorías anteriores) y `gretelai/gretel-pii-masking-en-v1` (10.000 documentos, Apache-2.0, con localización de entidades por coincidencia exacta con límites de palabra). No se empleó PII-Masking-300k en el entrenamiento. El decodificador propio de Tūmataiti divide el texto largo en ventanas de 512 tokens con 128 de solapamiento, conserva un token cuando P(no-O) ≥ 0,5, ensancha los spans a palabras completas y descarta los que son solo etiquetas de campo como "NHI".

## Capacidades

- Detección y clasificación de entidades PII en texto: personas, direcciones, correo electrónico, teléfono, URL, dirección IP, fechas de nacimiento o defunción, identificadores oficiales, secretos y afiliación a iwi, hapū y marae.
- Etiquetado BIO token a token con diez categorías y decodificación a spans a nivel de palabra.
- Procesamiento de texto largo mediante ventanas de 512 tokens con solapamiento de 128, gestionado por el decodificador externo.
- Cobertura específica de nombres māori, pākehā, pasifika y asiático neozelandeses, con negativos para palabras te reo que no son nombres en contexto (tūī, kōwhai, "aroha mai").
- Ejecución en dispositivo: variante ONNX int4 de 152 MB apta para CPU de portátil y para navegador (demo en woodrock.github.io/tumataiti).
- Integración con reglas deterministas en Rust para identificadores con dígito de control (IRD, NHI, tarjetas), complementando al modelo.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un clasificador de tokens.

## Casos de uso

- Redacción previa a inferencia en la nube: el modelo elimina PII del prompt antes de enviarlo a un LLM externo, reduciendo la exposición de datos personales en el proveedor; su tamaño int4 de 152 MB permite ejecutarlo en el propio portátil del usuario.
- Cumplimiento de privacidad en herramientas internas: integrado en pipelines de registro o analítica, permite anonimizar textos antes de almacenarlos o compartirlos entre equipos, con revisión humana en los casos sensibles.
- Procesamiento de documentación sanitaria o administrativa neozelandesa: detección de nombres, fechas de nacimiento e identificadores NHI o IRD en derivaciones y formularios, complementando las reglas con dígito de control.
- Anonimización de conversaciones y chats de soporte: el modelo maneja mensajes, actas de reunión y logs de chat, formatos presentes en el corpus de entrenamiento sintético.
- Filtrado en navegador sin conexión: la demo pública ejecuta el modelo ONNX int4 en el navegador, de modo que el texto nunca sale de la página; útil para herramientas de privacidad orientadas a usuario final.
- Preprocesado en pipelines de investigación con datos sensibles: etiquetado automático de entidades PII para construir conjuntos de datos anonimizados antes de su publicación o análisis.
- Capa de defensa en profundidad: combinado con reglas deterministas para identificadores estructurados, cubre tanto patrones formales como entidades en prosa que las reglas no detectan.

## Benchmarks y rendimiento

Los resultados publicados miden la tasa de fuga documental (porcentaje de documentos con al menos una pieza de PII sin redactar), que es la métrica relevante para privacidad. Se comparan fp32 e int4, y se incluye como referencia el modelo profesor `openai/privacy-filter` en su punto de operación por defecto.

| Conjunto de test | Documentos | Fuga fp32 | Fuga int4 | Precisión de caracteres int4 | Fuga del profesor |
|---|---:|---:|---:|---:|---:|
| NZ synthetic, plantillas y nombres reservados | 1.750 | 0,3 % | 0,7 % | 98,9 | 47,4 % |
| NZ synthetic, nombres reservados | 1.600 | 0,1 % | 0,0 % | 100,0 | 49,2 % |
| Nemotron-PII + Gretel-en test splits | 2.000 | 3,3 % | 3,3 % | 99,0 | 40,0 % |
| PII-Masking-300k, validación en inglés | 7.946 | 32,7 % | 34,2 % | 95,0 | 8,2 % |

Desglose por comunidad de nombres (mismos documentos reservados, solo cambiando los nombres; porcentaje de nombres sin redactar):

| Nombres | fp32 | int4 |
|---|---:|---:|
| Māori | 0,2 % | 0,3 % |
| Pākehā | 0,2 % | 0,6 % |
| Pasifika | 0,0 % | 0,0 % |
| Asian NZ | 0,0 % | 0,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la variante ONNX int4, diseñada para CPU; el checkpoint fp32 requiere aproximadamente 0,6 GB en memoria.
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU de portátil y ejecución en navegador. Cualquier GPU con más de 1 GB de memoria puede alojar la variante fp32.
- Cabe en GPU de consumo: sí, cualquier GPU consumer moderna (RTX 3060 o superior, e incluso integradas) puede ejecutar la variante fp32; la int4 está pensada para CPU.
- Opciones de despliegue: ONNX Runtime (variante int4), Transformers con pipeline `token-classification` (fp32), y el decodificador propio de Tūmataiti en Python o en Rust para navegador.
- Latencia y throughput: aproximadamente 30 ms por documento en CPU de portátil con la variante int4, según el autor. No se han publicado cifras de throughput para fp32 ni para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---:|---|---|---|---|
| Tūmataiti DeBERTa-v3-small (open data) | 141 M | 512 tokens por ventana | Apache-2.0 | PII en inglés y NZ, int4 para dispositivo | Hugging Face, ONNX, demo en navegador |
| openai/privacy-filter | no disponible | no disponible | no disponible | PII en inglés | Usado como profesor de referencia |
| microsoft/deberta-v3-small | 141 M | 512 tokens | MIT | Modelo base encoder para token classification | Hugging Face |
| Modelos NER genéricos tipo spaCy o BERT-base NER | 100-340 M | 512 tokens | MIT/Apache-2.0 | NER generalista, sin categorías PII específicas | Hugging Face, spaCy |

La comparación directa con `openai/privacy-filter` solo es posible en términos de tasa de fuga documental en los conjuntos evaluados, donde el modelo de woodrock obtiene cifras muy inferiores en los conjuntos neozelandeses (0,3 % frente a 47,4 %) y en Nemotron+Gretel (3,3 % frente a 40,0 %), pero significativamente peores en PII-Masking-300k (32,7 % frente a 8,2 %). Esa discrepancia refleja diferencias de convención de etiquetado y de dominio, no una superioridad global.

## Limitaciones y advertencias

- Todos los conjuntos de evaluación son sintéticos y provienen del mismo generador que los datos de entrenamiento, con plantillas y nombres reservados; miden generalización dentro de ese generador, no rendimiento en el mundo real. El autor planea un conjunto anotado por humanos.
- La fuga en PII-Masking-300k es alta (34,2 % en int4), en parte por convenciones de etiquetado distintas (fechas en campos JSON tratadas como fechas de nacimiento, números de edificio y códigos postales como direcciones, cadenas inusuales como contraseñas) y por apellidos europeos poco frecuentes en marcado. Se espera peor rendimiento en datos estructurados (JSON, HTML) que en prosa.
- Las palabras de parentesco usadas como nombres se etiquetan como personas ("Koro's IRD number", "Nan's"), y algunos números de referencia sin etiquetar con forma de IRD se etiquetan como identificadores.
- Ninguna herramienta de redacción es completa: debe usarse para reducir exposición, con revisión humana en material sensible, no como garantía.
- Cobertura lingüística limitada a inglés y te reo Māori; no se ha evaluado en castellano ni en otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se entrenó con Nemotron-PII (CC BY 4.0) y Gretel PII masking (Apache-2.0), cuyas atribuciones deben conservarse; el modelo base DeBERTa-v3-small es MIT.
- El modelo es un clasificador de tokens, no un generador: no admite tool calling, agentes ni razonamiento multi-paso, y su salida debe interpretarse con el decodificador de Tūmataiti para obtener spans a nivel de palabra.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/woodrock/tumataiti-deberta-v3-small-open
- Repositorio Tūmataiti: https://github.com/woodRock/tumataiti
- Decodificador Python: https://github.com/woodRock/tumataiti/blob/main/ml/src/tumataiti_ml/student/encode.py
- Demo en navegador: https://woodrock.github.io/tumataiti/
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
- Dataset Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset Gretel PII masking: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Modelo profesor de referencia: https://huggingface.co/openai/privacy-filter

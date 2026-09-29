# terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF

## Resumen

REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF es un ajuste fino supervisado (SFT) del modelo multimodal Gemma 4 26B-A4B (arquitectura Mixture-of-Experts) desarrollado por el usuario terrorswift. El modelo está especializado en inteligencia de fuentes abiertas (OSINT), inteligencia de amenazas cibernéticas (CTI) y periodismo de investigación, con el objetivo de producir análisis con metodología de analista senior en lugar de respuestas evasivas ante trabajo investigador legítimo.

El modelo parte de la base `unsloth/gemma-4-26B-A4B-it` y conserva su comportamiento de seguridad general, por lo que no es un modelo "uncensored" de propósito general. Cuenta con 25.233.142.046 parámetros totales (aproximadamente 26.000 millones segun la model card) con unos 4.000 millones activos por token, una ventana de contexto de 262.144 tokens e inferencia en inglés.

Se distribuye exclusivamente en formato GGUF con varios niveles de cuantización (F16, Q8_0 y la familia APEX con matriz de importancia opcional), pensados para ejecución local en hardware de consumo mediante llama.cpp y herramientas compatibles. Su licencia es Apache-2.0 y acumula 2.002 descargas y 27 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (MoE) |
| Parametros totales | 25.233.142.046 (aprox. 26B segun la model card) |
| Parametros activos | Aproximadamente 4B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | F16, Q8_0 y variantes APEX (I-Balanced, Balanced, I-Quality, Quality, I-Compact, Compact, Mini) en GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transformers como libreria declarada; pesos publicados en GGUF) |

## Arquitectura y entrenamiento

REDCELL se construye sobre Gemma 4 26B-A4B, un transformer con arquitectura Mixture-of-Experts que activa aproximadamente 4.000 millones de parámetros de un total de unos 26.000 millones por cada token procesado. Esta configuración busca ofrecer la capacidad de un modelo de mayor tamaño con un coste de cómputo por token propio de un modelo mucho menor. Los tags del repositorio indican capacidades de visión y multimodalidad heredadas de la base Gemma 4.

El método de ajuste es un Supervised Fine-Tuning (SFT) mediante 16-bit LoRA sobre la base vanilla de unsloth, entrenado con un conjunto de datos propio compuesto por 4 ejes de dominio y 33 subcategorías. La model card indica explícitamente que el modelo no ha sido sometido a procesos de "abliteration" ni de eliminación de censura: el comportamiento de seguridad general y el razonamiento se heredan intactos de la base, y el modelo responde a consultas legítimas del dominio sin adoptar una postura generalista sin restricciones. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

La cuantización APEX introducida por el autor presenta una serie de notas técnicas: parte de una receta que solicita tipos K-quant e IQ_XS para los expertos enrutados, pero como varios tensores de la MoE de Gemma 4 no tienen un tamaño de fila divisible por 256, `llama-quantize` recurre a tipos compatibles con bloques de 32 elementos (Q5_1, Q4_0, Q5_0 o IQ4_NL). Este fallback afecta a 60 tensores en total y es una propiedad de las formas de los tensores, no un defecto de la cuantización. Además, la receta APEX protege las primeras ~5 capas del transformer manteniéndolas un escalón de precisión por encima del valor por defecto del nivel (por ejemplo, los expertos enrutados de las capas 0-4 quedan en Q8_0 donde el resto del stack está en Q5_1).

## Capacidades

- Generación de texto y razonamiento analítico estructurado orientado a investigación.
- Metodología OSINT: aplicación del sistema Admiralty (A-F para fiabilidad de fuente, 1-6 para credibilidad de la información) y calibración explícita de confianza.
- Referencia a herramientas y recursos reales del dominio (Shodan, Censys, VirusTotal, SecurityTrails, crt.sh, urlscan.io, OpenCorporates, OpenSanctions, entre otros).
- Manejo de identificadores reales de MITRE ATT&CK, formatos de CVE y URLs de registros públicos.
- Capacidades multimodales y de visión heredadas de la base Gemma 4 (segun los tags del repositorio).
- Preferencia por reconocimiento pasivo, señalando explícitamente cuándo un paso cruza a recolección activa o conlleva riesgo legal o ético.
- Ajuste de longitud de respuesta según complejidad de la consulta.
- Reconocimiento de límites de conocimiento, distinguiendo entre lo verificado, lo no verificado y lo que requiere confirmación externa.
- Soporte de contexto largo de hasta 262.144 tokens para análisis de documentos extensos.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modos de "thinking" dedicados.

## Casos de uso

- Análisis de inteligencia de amenazas: el modelo puede resumir y correlacionar informes de CTI, mapear TTPs a identificadores MITRE ATT&CK reales y priorizar indicadores según fuentes verificadas, aprovechando su entrenamiento específico en terminología y metodología del dominio.
- Enriquecimiento de investigaciones OSINT: dado un conjunto de entidades (dominios, organizaciones, personas), el modelo orienta qué fuentes consultar (Shodan, crt.sh, OpenCorporates) y cómo graduar la fiabilidad de cada hallazgo con el sistema Admiralty.
- Periodismo de investigación: apoyo en la estructuración de hipótesis, verificación de fuentes y calibración de confianza en afirmaciones sensibles, con distinción explícita entre lo verificado y lo no confirmado.
- Respuesta a incidentes en equipos CERT: ayuda a interpretar CVE, CVSS y avisos de amenazas, y a proponer líneas de investigación pasivas antes de pasar a acciones activas.
- Formación y simulación de analistas: generación de escenarios de investigación con trazabilidad metodológica, útil para entrenar a personal junior en tradecraft OSINT.
- Análisis de grandes volúmenes documentales: gracias a sus 262.144 tokens de contexto, puede procesar informes largos, hilos de inteligencia o documentación técnica extensa en una sola pasada.
- Monitorización de superficie de exposición: descripción de metodologías pasivas para inventariar activos expuestos (certificados, subdominios, metadatos) sin lanzar reconocimiento activo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según el tamaño de cada cuantización GGUF):
  - APEX-Mini: 11,4 GB.
  - APEX-Compact: 13,7 GB.
  - APEX-Quality: 18,4 GB.
  - APEX-Balanced: 19,2 GB.
  - Q8_0: 25,0 GB.
  - F16: 47,0 GB.
- GPU consumer: la variante APEX-Mini (11,4 GB) cabe en tarjetas de 12-16 GB. Las variantes Compact y Quality/Balanced (13,7-19,2 GB) requieren tarjetas de 16-24 GB, como RTX 4080/4090 o RTX 3090. Q8_0 (25 GB) necesita 24 GB de VRAM o reparto en RAM.
- GPU profesionales: F16 (47 GB) y Q8_0 (25 GB) son adecuadas para A100, H100 o configuraciones multi-GPU. Las variantes APEX también se benefician de estas GPUs para mayor throughput.
- Al ser una MoE con ~4B parámetros activos, el coste de cómputo por token es notablemente inferior al de un modelo denso de 26B, lo que favorece velocidades de generación más altas para un mismo ancho de banda de memoria.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF; existe una referencia de uso en Ollama (`ollama run hf.co/terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF:Q8_0`). La librería declarada es transformers. No se documentan en la información disponible configuraciones para vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF | 25,2B (~26B) | ~4B | 262.144 | Apache-2.0 | GGUF en HuggingFace |
| unsloth/gemma-4-26B-A4B-it (base) | ~26B | ~4B | No disponible | No disponible | HuggingFace |
| Otras alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de licencias de modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible, aparte de los heredados del modelo base Gemma 4.
- Riesgo de alucinación: la model card enfatiza que el modelo no debe inventar identificadores (CVE, técnicas ATT&CK, URLs) y que debe declarar explícitamente lo que desconoce, pero se trata de un comportamiento entrenado y no de una garantía; conviene verificar cualquier identificador o dato factual antes de usarlo en producción.
- Limitación de idioma: el modelo está documentado solo para inglés (en); no se indica soporte multilingüe.
- Ventana de contexto amplia (262.144 tokens) pero con posible degradación de atención en contextos muy largos; conviene validar el comportamiento en documentos extremadamente extensos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Gemma 4 y sus condiciones de uso.
- Naturaleza del dominio: es una herramienta de carácter OSINT/CTI; su uso para recolección activa o acciones ofensivas puede tener implicaciones legales y éticas que la model card indica que el propio modelo intenta señalar.
- No es un modelo de propósito general: la model card advierte explícitamente que no es un modelo "uncensored" generalista y que conserva los comportamientos de seguridad de la base.
- Fecha de la información: el repositorio está fechado en 2026; algunos datos sobre el modelo base pueden cambiar.
- El formato de pesos publicado es solo GGUF, lo que limita el uso con otros frameworks de inferencia distintos de llama.cpp y compatibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF
- Variante APEX-Compact en HuggingFace: https://huggingface.co/terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF/blob/main/REDCELL-26B-A4B-OSINT-Cyber-APEX-Compact.gguf
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Articulo divulgativo sobre REDCELL: https://runtimewire.com/article/redcell-local-osint-cyber-model
- Referencia en Ollama: https://ollama.com/andrepenaitpro/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF
- Lista relacionada de modelos ofensivos/seguridad: https://github.com/JoasASantos/Offensive-Security-AI-Models
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0

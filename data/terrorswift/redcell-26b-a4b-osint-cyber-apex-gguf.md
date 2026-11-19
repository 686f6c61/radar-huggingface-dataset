# terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF

## Resumen

REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF es un ajuste fino supervisado (SFT) del modelo Gemma 4 26B-A4B de Google, desarrollado por el usuario terrorswift. Está orientado específicamente a inteligencia de fuentes abiertas (OSINT), inteligencia de amenazas cibernéticas (CTI) y periodismo de investigación. El modelo parte de la arquitectura Mixture-of-Experts de Gemma 4, con 25.233.142.046 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token, lo que lo sitúa en un equilibrio interesante entre capacidad y coste de inferencia.

La propuesta del modelo es sustituir el comportamiento de evasión genérico de los modelos alineados por una "artesanía de analista sénior": razonamiento metodológico explícito, calificación de fuentes mediante el sistema Admiralty (A-F para fiabilidad de fuente, 1-6 para credibilidad de la información), calibración explícita de confianza y uso de identificadores reales (técnicas MITRE ATT&CK, formatos CVE, herramientas como Shodan, Censys, VirusTotal, crt.sh o urlscan.io) sin inventar identificadores. El autor declara explícitamente que no es un modelo "abliterated" ni un modelo sin censura de propósito general: el comportamiento de seguridad general se hereda intacto del modelo base.

Se distribuye en formato GGUF con múltiples cuantizaciones propietarias denominadas APEX, pensadas para ejecución local en hardware de consumo mediante llama.cpp. La versión actualizada el 13 de octubre de 2026 añade soporte experimental de decodificación especulativa MTP con una cabeza draft incluida en el repositorio, con una tasa de aceptación de borradores de aproximadamente 0,6 en pruebas locales del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (MoE) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | ~4B por token (según model card) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | F16, Q8_0, APEX (Q5_1/IQ4_NL/Q4_0 en expertos enrutados, con protecciones en capas tempranas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 4 26B-A4B, un transformer con arquitectura Mixture-of-Experts en el que cada token activa aproximadamente 4.000 millones de parámetros de un total de 25.233 millones. El ajuste fino se realizó mediante LoRA en precisión de 16 bits sobre el modelo base `unsloth/gemma-4-26B-A4B-it`, con entrenamiento supervisado (SFT) sobre un dataset propio compuesto por 4 ejes de dominio y 33 subcategorías. No se documenta en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset más allá de la estructura por ejes y subcategorías.

La innovación técnica destacable no está en la arquitectura del modelo en sí, sino en el esquema de cuantización APEX desarrollado por el autor. Este esquema aplica tipos de cuantización diferenciados por componente: los expertos enrutados usan tipos de menor precisión (Q5_1, IQ4_NL, Q4_0 según el nivel), el experto compartido se mantiene en Q8_0 o Q5_0, y la atención en Q6_K o Q4_K. Además, las primeras cinco capas del transformer se mantienen un paso de precisión por encima del valor por defecto del nivel, y las variantes con prefijo "I-" incorporan una importance matrix. El autor documenta que algunos tensores de expertos enrutados de Gemma 4 no son divisibles por 256, lo que fuerza a `llama-quantize` a usar tipos con bloques de 32 elementos (Q5_1, Q4_0, Q5_0, IQ4_NL) en lugar de los tipos K-quant e IQ_XS nominales de la receta. Adicionalmente, el repositorio incluye una cabeza draft MTP para decodificación especulativa experimental.

## Capacidades

- Generación de texto y razonamiento analítico estructurado orientado a dominios OSINT y CTI.
- Razonamiento multi-paso con exposición explícita del proceso analítico, no solo de las conclusiones.
- Calificación de fuentes mediante el sistema Admiralty (A-F / 1-6) y calibración explícita de confianza en cada evaluación.
- Capacidad multimodal declarada en los tags del modelo (vision, multimodal), heredada del modelo base Gemma 4.
- Uso de identificadores reales: técnicas MITRE ATT&CK, formatos CVE, URLs de registros y nombres de herramientas OSINT reales.
- Distinción entre reconocimiento pasivo y recolección activa, con señalización de riesgos legales o éticos.
- Soporte de conversación multi-turno con ventana de contexto de 262.144 tokens.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Decodificación especulativa MTP experimental en llama.cpp.

## Casos de uso

- **Análisis de inteligencia de amenazas**: el modelo puede procesar informes CTI extensos y correlacionar indicadores con técnicas MITRE ATT&CK reales, aprovechando su ventana de 262.144 tokens para mantener múltiples informes en contexto y producir evaluaciones con nivel de confianza calibrado.
- **Investigación periodística asistida**: para verificación de fuentes y trazabilidad de afirmaciones, el modelo aplica el sistema Admiralty de forma natural y explica cómo verificar cada evaluación, lo que encaja en flujos de trabajo de verificación de hechos.
- **Enriquecimiento de registros corporativos y sanciones**: con nombres de herramientas reales como OpenCorporates y OpenSanctions, el modelo puede guiar la construcción de consultas y la interpretación de resultados en investigaciones de entidades.
- **Reconocimiento pasivo de superficie de ataque**: el modelo puede estructurar metodologías de reconocimiento con Shodan, Censys, SecurityTrails, crt.sh o urlscan.io, priorizando técnicas pasivas y señalando cuándo un paso cruza a recolección activa.
- **Formación de analistas junior**: al exponer el proceso de razonamiento paso a paso y las calibraciones de confianza, sirve como herramienta de entrenamiento en tradecraft analítico para equipos de CERT y SOC.
- **Triaje de alertas y correlación de CVE**: puede ayudar a interpretar alertas y relacionarlas con formatos CVE reales y técnicas de adversario documentadas, manteniendo contexto largo de incidentes previos.
- **Despliegue local en hardware de consumo**: con las cuantizaciones APEX-Compact (13,7 GB) o APEX-Mini (11,4 GB), el modelo puede ejecutarse en estaciones de trabajo con GPU de consumo para equipos que no pueden enviar datos sensibles a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una tasa de aceptación de borradores de aproximadamente 0,6 en la decodificación especulativa MTP en pruebas locales del autor, sin cifras de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según tamaño de archivo GGUF, más overhead de contexto):
  - F16 (47,0 GB): requiere GPU de 48 GB o más (A100 80GB, H100, o múltiples GPU).
  - Q8_0 (25,0 GB): GPU de 32 GB o más (A100 40GB, RTX A6000, o dos GPU de 24 GB).
  - APEX-I-Balanced / APEX-Balanced (19,2 GB): GPU de 24 GB (RTX 4090, RTX 3090) con margen ajustado para contexto largo.
  - APEX-I-Quality / APEX-Quality (18,4 GB): GPU de 24 GB.
  - APEX-I-Compact / APEX-Compact (13,7 GB): GPU de 16 GB (RTX 4080, RTX 4060 Ti 16GB) o 24 GB con contexto amplio.
  - APEX-Mini (11,4 GB): GPU de 12-16 GB.
- **GPU recomendadas**: A100 80GB o H100 para F16/Q8_0; RTX 4090 o RTX 3090 para los niveles Balanced y Quality; RTX 4080 o RTX 4060 Ti 16GB para Compact y Mini.
- **¿Cabe en GPU de consumo?**: sí, los niveles APEX-Compact (13,7 GB) y APEX-Mini (11,4 GB) caben en GPU de consumo de 16 GB y 12 GB respectivamente; Balanced y Quality caben en 24 GB.
- **Opciones de despliegue**: llama.cpp y derivados (Ollama, LM Studio) como vía principal; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia. No se documenta soporte explícito de vLLM o TGI para estos GGUF en la información disponible.
- **Latencia y throughput**: no disponibles. El autor indica que la mejora de velocidad con MTP es dependiente del hardware, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| REDCELL-26B-A4B-OSINT-Cyber-APEX | 25,2B totales / ~4B activos | 262.144 | Apache-2.0 | GGUF | OSINT / CTI / periodismo |
| Gemma 4 26B-A4B-it (base) | 25,2B totales / ~4B activos | 262.144 | Apache-2.0 (según base) | safetensors | Propósito general |
| Modelos CTI especializados de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el modelo base `unsloth/gemma-4-26B-A4B-it`, del que REDCELL hereda arquitectura, contexto y licencia, diferenciándose por el ajuste SFT de dominio y las cuantizaciones APEX. No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo con alternativas especializadas en CTI.

## Limitaciones y advertencias

- **Sesgos**: no documentados en la información disponible; al ser un ajuste de dominio en inglés sobre Gemma 4, hereda los sesgos del modelo base, no evaluados en la model card.
- **Riesgo de alucinación**: el modelo está entrenado para usar identificadores reales (técnicas ATT&CK, CVE, URLs), pero no se garantiza que no pueda generar identificadores plausibles pero incorrectos; la verificación humana sigue siendo necesaria en contextos de inteligencia.
- **Idioma**: soporta únicamente inglés según el campo `language`; el rendimiento en castellano no está documentado y probablemente sea inferior.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden imponer condiciones adicionales no detalladas en la información disponible.
- **No es un modelo sin censura**: el autor lo declara explícitamente; el comportamiento de seguridad general se hereda del base, por lo que no debe esperarse que responda a solicitudes que el base rechazaría.
- **Cuantizaciones APEX**: el esquema de cuantización depende de fallbacks de `llama-quantize` por la forma de los tensores MoE de Gemma 4; la calidad relativa frente a cuantizaciones estándar no está cuantificada con benchmarks.
- **MTP especulativo**: marcado como experimental; la tasa de aceptación de ~0,6 es una medición local del autor y la ganancia de velocidad depende del hardware.
- **Contexto largo**: aunque la ventana es de 262.144 tokens, el uso práctico con contexto máximo requiere VRAM adicional considerable, no cuantificada en la información disponible.
- **Producción**: no hay benchmarks publicados que respalden afirmaciones de rendimiento; se recomienda evaluación propia antes de desplegar en flujos críticos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF)
- [Modelo base: unsloth/gemma-4-26B-A4B-it](https://huggingface.co/unsloth/gemma-4-26B-A4B-it)
- [Licencia Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [Model Pulse (métricas del modelo)](https://huggingface.co/spaces/tardellirs/model-pulse?model=terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF)

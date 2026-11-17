# Suvir-Misra/gpt-oss-20b-indian-legal-merged

## Resumen

GPT-OSS-20B Indian Legal Advisory es un ajuste fino del modelo abierto gpt-oss-20b de OpenAI, publicado por el usuario Suvir-Misra en Hugging Face. El modelo está especializado en derecho indio: fiscalidad indirecta (GST/IGST), aduanas, impuesto sobre la renta y los tres nuevos códigos penales y procesales de 2023 (BNS, BNSS y BSA). Se distribuye como un modelo fusionado completo en bfloat16 (safetensors), de modo que no requiere adaptadores LoRA en tiempo de inferencia.

El modelo parte de `unsloth/gpt-oss-20b-unsloth-bnb-4bit` y ha sido entrenado mediante una pipeline de alineación en varias etapas (SFT con LoRA, SWA, TIES-Merging, DPO/ORPO y WiSE-FT) sobre 20.179 disposiciones estatutarias y resoluciones curadas. El resultado es un modelo de 20.914.757.184 parámetros (aproximadamente 20,9 mil millones) con licencia Apache 2.0 y soporte declarado para inglés e hindi.

Su relevancia radica en el enfoque vertical: en lugar de un modelo generalista, ofrece razonamiento jurídico estructurado mediante un canal de análisis (IRAC) y un canal final con la conclusión estatutaria. No obstante, el autor declara una puntuación compuesta de 10,0/10 y un 100 % de recuerdo estatutario sin aportar la metodología de evaluación, por lo que esas cifras deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gpt_oss), ajuste fino del base gpt-oss-20b |
| Parametros totales | 20.914.757.184 (~20,9 B) |
| Parametros activos | no disponible (el modelo base gpt-oss-20b es MoE, pero la model card no detalla el reparto activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en bfloat16 (16 bits); el modelo base de partida usaba cuantización bnb-4bit. No se documentan otros formatos cuantizados en el repo |
| Idiomas soportados | en, hi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16, modelo fusionado completo) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del gpt-oss-20b de OpenAI, un transformer decoder-only con mezcla de expertos (MoE) según la familia gpt-oss. Sobre esa base, el autor aplica un ajuste fino supervisado con LoRA (r=32, alpha=32) durante varias épocas sobre 20.179 provisiones estatutarias y resoluciones, ejecutado en una única NVIDIA GeForce RTX 4060 Ti. Posteriormente aplica promediado estocástico de pesos (SWA) para reducir el ruido de gradiente de alta frecuencia.

La pipeline continúa con TIES-Merging y calibración WSO para fusionar adaptadores de fiscalidad indirecta, fiscalidad directa y derecho penal, con poda de densidad de tarea de 0,3 y consenso de signos. Después se aplica optimización de preferencias (DPO y ORPO) para penalizar alucinaciones jurídicas y atribuciones estatutarias erróneas, y un blending WiSE-FT en el espacio de pesos entre el vector de tarea base y el de razonamiento jurídico especializado. Finalmente, los pesos se desquantizan y fusionan en bfloat16 para inferencia sin sobrecarga de adaptadores.

Una innovación destacable es la alineación de cadena de pensamiento en dos canales: `<|channel|>analysis<|message|>` para razonamiento jurídico IRAC y `<|channel|>final<|message|>` para la conclusión estatutaria exacta. No se documentan en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de los dominios citados.

## Capacidades

- Generación de texto jurídico especializado en derecho indio: GST/IGST, aduanas, impuesto sobre la renta, BNS 2023, BNSS 2023 y BSA 2023.
- Razonamiento jurídico estructurado mediante cadena de pensamiento en dos canales (análisis IRAC y conclusión final).
- Recuperación y aplicación de disposiciones estatutarias concretas: secciones del CGST/IGST, artículo 14 de la Ley de Aduanas de 1962, secciones 148, 148A, 149 y 115BAC de la Ley del Impuesto sobre la Renta, y concordancia BNS/BNSS/BSA.
- Análisis de cuestiones de valoración aduanera, transacciones entre partes vinculadas y sucursal de valoración especial (SVB) según la circular CBIC 5/2016.
- Razonamiento sobre plazos procesales y penales: producción ante magistrado en 24 horas (BNSS sección 58), prórrogas de custodia policial (sección 187), plazos de notificación de requerimiento (sección 73 frente a 74 CGST).
- Admisibilidad de pruebas electrónicas y certificado obligatorio de la sección 63(4) BSA.
- Capacidades multilingües limitadas a inglés e hindi.
- Soporte conversacional multi-turno (pipeline text-generation, etiqueta conversational).
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes o visión.

## Casos de uso

- Asesoría fiscal en GST: el modelo puede comparar los plazos y penalizaciones de las secciones 73 y 74 del CGST y explicar el test de funcionalidad de *Safari Retreats* sobre crédito bloqueado de la sección 17(5), útil para despachos que preparan respuestas a requerimientos.
- Valoración aduanera: análisis de transacciones entre partes vinculadas y determinación del ámbito del SVB conforme a la circular CBIC 5/2016, aplicable en la revisión de declaraciones de importación.
- Reasignación de renta: apoyo en la interpretación de los procedimientos de reasignación de las secciones 148 y 148A y de los umbrales de 3 y 10 años de la sección 149 (criterio de activos de 50 lakh rupias).
- Formación interna de equipos jurídicos: generación de explicaciones IRAC sobre concordancia entre el antiguo IPC y el BNS 2023 (por ejemplo, homicidio en la sección 103(1) o estafa en la 318(4)) para capacitación de abogados junior.
- Procesamiento penal y procesal: resolución de dudas sobre plazos de producción ante magistrado y prórrogas de custodia policial en los primeros 40/60 días según la BNSS.
- Prueba electrónica: asistencia en la redacción y verificación del certificado de la sección 63(4) BSA para la admisibilidad de registros electrónicos en procedimientos judiciales.
- Atención al cliente en despachos y consultoras: conversaciones multi-turno en inglés o hindi para triaje de consultas fiscales y derivación a especialistas, con la cautela de validación humana.

## Benchmarks y rendimiento

El autor declara una puntuación compuesta de 10,0/10 y un 100 % de recuerdo estatutario en GST, aduanas, impuesto sobre la renta, BNS, BNSS y BSA. No se especifica la metodología, el conjunto de evaluación ni los modelos de comparación.

| Benchmark | Resultado declarado | Metodología |
|---|---|---|
| Composite Benchmark Score | 10,0 / 10 | no disponible |
| Statutory Recall | 100 % | no disponible |
| MMLU, HumanEval, GSM8K u otros estándar | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar verificables en la información disponible. Las cifras del autor no deben interpretarse como comparables con evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 42 GB solo para pesos (20,9 B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 48 GB.
- GPU recomendadas para bfloat16: A100 80 GB, H100 80 GB, L40S 48 GB o configuraciones multi-GPU. En GPUs de 24 GB (RTX 4090, A10G) no cabe en bfloat16 sin cuantización adicional.
- Viabilidad en GPU de consumo: el autor entrenó en una RTX 4060 Ti, pero la inferencia del modelo fusionado en 16 bits no cabe en esa GPU; sería necesario cuantizar a 8 o 4 bits, algo no documentado en el repo.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM` con `device_map="auto"`), vLLM y Ollama, según los ejemplos de la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b-indian-legal-merged | ~20,9 B | no disponible | Apache 2.0 | Derecho indio (GST, aduanas, renta, BNS/BNSS/BSA) | Hugging Face, safetensors bf16 |
| gpt-oss-20b (OpenAI) | ~20 B (MoE) | no disponible en esta ficha | Apache 2.0 | Generalista | Hugging Face, múltiples formatos |
| Modelos jurídicos indios generalistas | no disponible | no disponible | variable | Derecho indio general | no disponible |

No se dispone de datos verificables de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Las cifras de benchmark (10,0/10 y 100 % de recuerdo) proceden del propio autor sin metodología publicada; no deben tomarse como evidencia independiente.
- Riesgo de alucinación jurídica: aunque la pipeline incluye DPO/ORPO para penalizarla, no se documenta una tasa de error medida; en un dominio regulado, toda salida requiere revisión por un profesional cualificado.
- Cobertura idiomática limitada a inglés e hindi; no se declara soporte de otras lenguas oficiales de la India ni de castellano.
- Longitud de contexto no documentada, lo que dificulta planificar casos con expedientes extensos.
- El modelo está entrenado sobre un corpus de 20.179 disposiciones; puede no cubrir normativa posterior a la fecha de corte del dataset, que no se especifica.
- Licencia Apache 2.0 permite uso comercial, pero el uso en asesoría jurídica real puede estar sujeto a la regulación profesional india y a la responsabilidad del usuario.
- El modelo base gpt-oss-20b es de tipo MoE; el autor no documenta el número de parámetros activos ni el impacto de la fusión en el enrutamiento de expertos.
- No se documentan evaluaciones de sesgo, robustez adversarial ni comportamiento en prompts fuera de dominio.
- Tamaño del repo de 41,9 GB en bfloat16, lo que complica el despliegue en entornos con VRAM limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suvir-Misra/gpt-oss-20b-indian-legal-merged
- Modelo base de partida: https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- Familia gpt-oss de OpenAI: no disponible en la información proporcionada
- Paper de TIES-Merging: no disponible en la información proporcionada
- Paper de WiSE-FT: no disponible en la información proporcionada
- Documentación de Unsloth: no disponible en la información proporcionada
- Repositorio de vLLM: no disponible en la información proporcionada

# Taurol/LFM3-1.7B-Cortante-GGUF

## Resumen

LFM3-1.7B-Cortante-GGUF es una versión afinada y cuantizada del modelo LiquidAI/LFM3-1.7B, publicada por el usuario Taurol en Hugging Face. El modelo base es un transformer de 1.728.801.600 parámetros desarrollado por Liquid AI, y esta variante ha recibido entrenamiento adicional para una tarea muy concreta: la verificación del cortante en vigas de hormigón armado según las normativas CE 2021 (Código Estructural español) y NBR 6118 (norma brasileña). Se distribuye en formato GGUF con cuantización Q6_K, lo que facilita su despliegue en entornos de inferencia local mediante llama.cpp u Ollama.

La relevancia de esta ficha es doble. Por un lado, ilustra un caso de especialización vertical de un modelo pequeño (1,7 mil millones de parámetros) en un dominio técnico regulado, donde la precisión normativa importa más que la amplitud de conocimientos. Por otro lado, sirve de ejemplo de cómo un modelo base con licencia restrictiva (LFM Open License v1.0) se redistribuye como obra derivada, con las obligaciones que ello conlleva. El modelo está etiquetado para español y portugués, coherente con las dos normativas citadas.

No obstante, la información pública disponible es muy escasa: no hay datos de benchmarks, no se detalla la composición del dataset de afinamiento ni el procedimiento de entrenamiento, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Todo lo que sigue se limita a lo que el autor declara en la model card y a los metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q6_K (GGUF) |
| Idiomas soportados | español, portugués |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base LiquidAI/LFM3-1.7B, un transformer de aproximadamente 1,73 mil millones de parámetros. La model card no detalla la arquitectura interna del base (tipo de atención, activaciones, normalización) ni el número de tokens de entrenamiento original. Sobre el proceso de afinamiento, el autor indica únicamente que se realizó "entrenamiento adicional" para la verificación del cortante de vigas de hormigón armado conforme a CE 2021 y NBR 6118, e integra una "herramienta de cálculo". No se especifica si el entrenamiento fue supervisado, si hubo RLHF o DPO, ni la composición o el tamaño del dataset de afinamiento.

La innovación técnica declarada es la especialización en un dominio de ingeniería estructural con soporte de una herramienta de cálculo, lo que sugiere un uso orientado a agentes o a tool calling para ejecutar comprobaciones numéricas. La cuantización Q6_K reduce el peso a aproximadamente 1,4 GB, apta para inferencia local. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones.

## Capacidades

- Generación de texto conversacional en español y portugués.
- Verificación del cortante en vigas de hormigón armado según CE 2021 y NBR 6118.
- Uso de una herramienta de cálculo para las comprobaciones (tool calling orientado a dominio).
- Razonamiento técnico acotado al ámbito de la ingeniería estructural citada.
- No se declaran capacidades de visión, audio, código general ni matemáticas avanzadas fuera del dominio.
- No se declara soporte explícito de agentes multi-paso más allá de la herramienta de cálculo mencionada.
- Capacidades multilingües limitadas a es y pt según los metadatos.

## Casos de uso

- Verificación de cortante en vigas de hormigón armado: el modelo recibe los datos geométricos y de armado y devuelve la comprobación según CE 2021 o NBR 6118, apoyándose en la herramienta de cálculo integrada.
- Asistencia a ingenieros estructurales en despachos: como primer filtro de comprobaciones repetitivas de cortante antes de la revisión manual.
- Docencia en ingeniería civil: generación de ejemplos resueltos de cortante conforme a las dos normativas, en español o portugués.
- Integración en flujos de cálculo locales: al estar en GGUF Q6_K, puede ejecutarse en estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama.
- Soporte a la revisión normativa cruzada: comparar requisitos de CE 2021 y NBR 6118 para un mismo elemento, útil en proyectos transfronterizos España-Brasil.
- Prototipado de asistentes técnicos verticales: servir de base para evaluar la viabilidad de un asistente especializado en normativa estructural antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con cuantización Q6_K (pesos de ~1,4 GB más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en iGPU con memoria unificada suficiente.
- Despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. No se indica compatibilidad con vLLM o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Taurol/LFM3-1.7B-Cortante-GGUF | 1,73 B | no disponible | es, pt | LFM Open License v1.0 | GGUF |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | no disponible | LFM Open License v1.0 | safetensors |
| Alternativas de 1-2 B especializadas en dominio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: sin benchmarks, sin detalle del dataset de afinamiento ni del procedimiento de entrenamiento.
- Riesgo de alucinación normativa: un modelo de 1,7 B puede citar artículos o fórmulas incorrectas de CE 2021 o NBR 6118; requiere validación por un ingeniero cualificado.
- Uso en producción estructural: no debe emplearse como única fuente de verificación en proyectos reales; las comprobaciones de seguridad estructural exigen responsabilidad profesional y revisión humana.
- Licencia LFM Open License v1.0: es una licencia "other" con posibles restricciones de uso comercial; debe revisarse el archivo LICENSE antes de cualquier explotación comercial.
- Obra derivada: al ser un finetune del base, se heredan las obligaciones de atribución y las condiciones de la licencia original.
- Cobertura lingüística limitada a español y portugués; no se garantiza calidad en otros idiomas.
- Longitud de contexto no declarada: puede ser insuficiente para memorias de cálculo extensas.
- Repositorio sin tracción (0 descargas, 0 likes en la consulta): no hay evidencia de uso ni de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Taurol/LFM3-1.7B-Cortante-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`

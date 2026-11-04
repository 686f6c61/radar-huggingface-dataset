# wkhaifor/Qwen2.5-3B-Instruct-FOMC-Merged-v0.1

## Resumen

PolicyLens-3B-FOMC es un modelo derivado de Qwen2.5-3B-Instruct, publicado por el usuario wkhaifor, especializado en la clasificación de frases de política monetaria en inglés en tres categorías: tono dovish (expansivo), hawkish (restrictivo) o neutral. El modelo se distribuye como un merge de los pesos del adaptador LoRA FOMC (Federal Open Market Committee) sobre el modelo base, guardado en FP32 y listo para cargar con el tokenizer incluido.

Técnicamente se trata de un transformer decoder-only de 3.085.938.688 parámetros (aproximadamente 3B), heredado de la arquitectura Qwen2.5, con la tarea reformulada como clasificación de texto mediante la comparación de logits de los tokens de siguiente posición A, B y C. El repositorio ocupa 12,4 GB debido a la precisión FP32 de los pesos.

Su relevancia es acotada: es un artefacto de investigación de nicho para análisis de sentimiento de comunicados del FOMC, con licencia restrictiva y sin despliegue de inferencia habilitado en el Hub. La model card reporta una precisión del 66,15 % en un conjunto interno de 384 ejemplos, lo que sitúa el modelo en un rango modesto para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), fine-tuning con LoRA fusionado |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-3B-Instruct, no confirmada) |
| Tipos de cuantizacion | FP32 en el repositorio; no se documentan otras variantes |
| Idiomas soportados | Ingles (en) |
| Licencia | Other: Qwen Research License (base y pesos fusionados) + CC BY-NC 4.0 (adaptacion y datos) + Apache-2.0 (codigo de ejemplo) |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar. Sobre este base se entrenó un adaptador LoRA específico para la tarea FOMC, que posteriormente se fusionó con los pesos del modelo base y se guardó en FP32. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO adicionales.

La innovación metodológica es la reformulación de la clasificación como predicción del siguiente token: el script de inferencia compara los logits de tres tokens candidatos (A para dovish, B para hawkish, C para neutral) y normaliza las puntuaciones. La model card advierte explícitamente de que estas puntuaciones no están calibradas como medida de confianza. Se incluye una validación de merge que compara el modelo base con LoRA frente a los pesos fusionados recargados, sobre 384 ejemplos de dev y confirmation, con coincidencia total de etiquetas y precisión idéntica del 66,15 % en FP32.

## Capacidades

- Clasificación de frases de política monetaria en inglés en tres clases: dovish, hawkish y neutral.
- Predicción basada en comparación de logits de tokens candidatos (A/B/C), no en una cabeza de clasificación dedicada.
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión o audio: no disponibles.
- Modo thinking: no disponible.
- Generación de texto libre: el modelo base la soporta, pero el ajuste está orientado exclusivamente a clasificación y la model card marca `inference: false`.

## Casos de uso

- Análisis de sentimiento de comunicados del FOMC: dado un fragmento de un statement o minuta, el modelo devuelve la etiqueta de tono, útil para monitorizar cambios de postura de la Reserva Federal a lo largo del tiempo.
- Investigación académica en macroeconomía y finanzas: permite etiquetar corpus históricos de textos de bancos centrales para construir series temporales de tono monetario.
- Prototipado de señales para estrategias cuantitativas: la clasificación de frases puede alimentar features de sentimiento en modelos de trading, siempre con validación humana y sin uso comercial por la licencia CC BY-NC.
- Evaluación comparativa de modelos de clasificación financiera: sirve como baseline de 3B parámetros frente a modelos mayores o clasificadores específicos.
- Análisis de discursos de miembros del FOMC: clasificación por orador y por fecha para detectar divergencias internas en el comité.
- Filtrado y priorización de noticias: etiquetar titulares o párrafos de prensa económica en inglés según su tono monetario para su revisión posterior.
- Docencia y divulgación: ejemplo didáctico de fine-tuning con LoRA y fusión de pesos sobre un modelo instructivo.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Precisión (dev + confirmation) | 66,15 % | 384 ejemplos, FP32, conjunto interno del autor |
| Consistencia merge vs. base+LoRA | 100 % de etiquetas coincidentes | Misma precisión en ambos modos de carga |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 12,3 GB solo para pesos, más overhead de activaciones y tokenizer; se recomienda al menos 16 GB de VRAM para inferencia cómoda.
- GPU recomendadas: A100, H100 o RTX 4090 (24 GB) para FP32 sin problemas; RTX 3090 (24 GB) también válida.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (16 GB) con margen ajustado; no cabe en GPUs de 8-12 GB en FP32 sin cuantización, y no se documentan versiones cuantizadas.
- Opciones de despliegue: el repositorio incluye un script `inference.py` con `requirements.txt`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la model card marca `inference: false` en el Hub.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PolicyLens-3B-FOMC (este) | 3,09B | no disponible | Clasificación FOMC 3 clases | Qwen Research + CC BY-NC 4.0 | HuggingFace y ModelScope |
| Qwen2.5-3B-Instruct | 3,09B | no disponible en esta ficha | Instrucción general | Qwen Research License | HuggingFace |
| Modelos de sentimiento financiero basados en FinBERT | no disponible | no disponible | Clasificación de sentimiento financiero | varía | HuggingFace |

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Precisión modesta: 66,15 % en el conjunto interno de 384 ejemplos, insuficiente para decisiones automatizadas sin revisión humana.
- Puntuaciones sin calibrar: la model card advierte de que los scores normalizados no son medidas de confianza fiables.
- Solo inglés: no se declara soporte de otros idiomas, lo que limita su uso en comunicados de bancos centrales no angloparlantes.
- Licencia restrictiva: los pesos están sujetos a la Qwen Research License y la adaptación a CC BY-NC 4.0, lo que impide el uso comercial.
- Riesgo de alucinación y sesgo: al ser un modelo de lenguaje, puede verse afectado por sesgos del corpus de entrenamiento y por la distribución limitada de textos del FOMC.
- Sin despliegue de inferencia en el Hub (`inference: false`) y sin integraciones documentadas con frameworks de serving.
- Validación limitada: el conjunto de evaluación es interno y pequeño, sin benchmarks públicos reproducibles.
- Fecha de creación futura en los metadatos (2026-11-04), lo que puede indicar un artefacto de investigación sin mantenimiento previsto.

## Enlaces

- HuggingFace: https://huggingface.co/wkhaifor/Qwen2.5-3B-Instruct-FOMC-Merged-v0.1
- Adaptador LoRA original: https://huggingface.co/wkhaifor/Qwen2.5-3B-Instruct-FOMC-LoRA-v0.1
- ModelScope: https://www.modelscope.cn/models/kfcVme50/Qwen2.5-3B-Instruct-FOMC-Merged-v0.1

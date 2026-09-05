# TNSA/Kavach-1-Mini-FP8

## Resumen

Kavach-1-Mini-FP8 es un modelo de lenguaje compacto desarrollado por TNSA, especializado en seguridad ofensiva y razonamiento para operaciones red-team. Se construye mediante ajuste fino supervisado de parámetros completos (full-parameter SFT) sobre el modelo base Qwen3.5-0.8B, y se publica en formato FP8 con cuantización dinámica W8A8. El modelo está diseñado para actuar como asistente experto en pruebas de penetración autorizadas, investigación de seguridad y educación en ciberseguridad, con un tamaño reducido que permite ejecutarlo en hardware modesto.

Arquitectónicamente es un transformer denso con aproximadamente 752 millones de parámetros y una ventana de contexto de 4.096 tokens. Su relevancia radica en ofrecer capacidades de seguridad ofensiva en un formato ligero y con licencia MIT, lo que lo hace accesible para laboratorios locales, herramientas de seguridad y entornos de desarrollo donde se necesite un asistente técnico especializado sin depender de modelos grandes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 (~0,75B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | FP8 (W8A8, compressed-tensors); también disponibles BF16, INT8, INT4, NVFP4, MXFP4 en otras builds |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | MIT (el modelo base Qwen3.5 tiene su propia licencia) |
| Formato de pesos | Safetensors (compressed-tensors, FP8) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Qwen3.5-0.8B. Se entrenó mediante ajuste fino supervisado de parámetros completos (full-parameter SFT) utilizando Hugging Face transformers y trl con aceleración Liger. La cuantización a FP8 (W8A8) se realizó con llm-compressor en formato compressed-tensors. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni la composición de los datos. Tampoco se indica si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto especializada en seguridad ofensiva y operaciones red-team.
- Análisis de vulnerabilidades en código, como la revisión de endpoints de autenticación (por ejemplo, un endpoint Flask).
- Razonamiento sobre tácticas, técnicas y procedimientos de ataque para pruebas autorizadas.
- Soporte de conversaciones multi-turno mediante plantillas de chat con roles system y user.
- Capacidades multilingües limitadas al inglés; no soporta visión ni audio (solo texto).
- No se menciona soporte de tool calling ni function calling en la información disponible.

## Casos de uso

- Auditoría de código de aplicaciones web: el modelo puede revisar endpoints y rutas de autenticación para identificar vulnerabilidades comunes como inyección SQL, XSS o fallos de control de acceso. Su tamaño compacto permite ejecutarlo en el entorno de desarrollo.
- Red-teaming autorizado: permite generar vectores de ataque y payloads de prueba para validar la seguridad de sistemas propios o con permiso explícito. La especialización en seguridad ofensiva facilita el razonamiento sobre escenarios de ataque.
- Educación en ciberseguridad: puede explicar conceptos de seguridad ofensiva, como enumeración de servicios o explotación de vulnerabilidades, en un formato conversacional apto para estudiantes y laboratorios.
- Apoyo a equipos blue-team: al comprender cómo se realizan los ataques, el modelo ayuda a los defensores a anticipar vectores de ataque y mejorar las medidas de protección.
- Documentación de pruebas de penetración: puede asistir en la redacción de informes técnicos describiendo hallazgos, riesgos y recomendaciones de mitigación.
- Laboratorios de seguridad locales: al ser un modelo de ~0,75B, puede ejecutarse en portátiles o estaciones de trabajo con GPU modesta, permitiendo prácticas de seguridad en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP8, los pesos ocupan aproximadamente 0,75 GB (0,75B parámetros × 1 byte). Con activaciones y caché KV, se recomienda un mínimo de 2-4 GB de VRAM. Es una estimación orientativa.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente.
- ¿Cabe en consumer GPU? Sí, es un modelo pequeño que puede ejecutarse en GPUs de consumo.
- Opciones de despliegue: vLLM (recomendado por el autor) y transformers con la librería compressed-tensors instalada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Kavach-1-Mini-FP8 | 752M | 4.096 | MIT | Seguridad ofensiva, red-team |
| Qwen3.5-0.8B (base) | ~0,8B | 4.096 | Propia de Qwen | Generalista |
| Kavach-1-Mini-BF16 | ~0,8B | 4.096 | MIT | Seguridad ofensiva, red-team (mayor fidelidad) |

## Limitaciones y advertencias

- Tamaño reducido (~0,75B): menos fiable que modelos más grandes; es necesario verificar todos los comandos, payloads y afirmaciones generadas.
- Riesgo de alucinación: puede producir detalles técnicos plausibles pero incorrectos; el resultado debe tratarse como punto de partida, no como fuente autoritativa.
- Contexto limitado a 4.096 tokens, lo que restringe el análisis de documentos largos o conversaciones extensas.
- Solo inglés y texto; no soporta otros idiomas ni entradas multimodales.
- Las cuantizaciones (FP8, INT8, INT4, NVFP4, MXFP4) sacrifican fidelidad por tamaño y velocidad; NVFP4 y MXFP4 requieren hardware o runtimes con soporte nativo de float de 4 bits.
- Uso dual: el modelo está diseñado para trabajo de seguridad autorizado. Su uso en sistemas sin permiso explícito puede ser ilegal. El usuario es responsable del cumplimiento de las leyes y reglas de compromiso.
- La licencia MIT cubre los pesos del modelo, pero el modelo base Qwen3.5-0.8B tiene su propia licencia; se debe revisar al redistribuir pesos derivados.

## Enlaces

- HuggingFace: https://huggingface.co/TNSA/Kavach-1-Mini-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs o demos adicionales en la información disponible.

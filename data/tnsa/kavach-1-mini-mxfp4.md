# TNSA/Kavach-1-Mini-MXFP4

## Resumen

Kavach-1-Mini-MXFP4 es un modelo de lenguaje compacto, afinado mediante supervisión (SFT) de parámetros completos sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por TNSA. Está especializado en seguridad ofensiva y razonamiento para red team, con el objetivo de actuar como asistente experto en pruebas de penetración autorizadas, investigación de seguridad y educación en ciberseguridad. El modelo presenta 752 millones de parámetros (0.8B) y una ventana de contexto de 4.096 tokens, y se distribuye en una versión cuantizada MXFP4 (4 bits en coma flotante con escalado microscópico OCP), lo que lo hace ligero y adecuado para entornos locales. Su relevancia radica en ofrecer un asistente técnico especializado en un dominio crítico, con un tamaño que permite ejecutarlo en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en Qwen3.5-0.8B |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | MXFP4 (4-bit float, OCP microscaling). La linea tambien publica builds BF16, FP8, INT8, INT4, NVFP4, MXFP4 |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | MIT |
| Formato de pesos | Safetensors, compressed-tensors (mxfp4-pack-quantized) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.5-0.8B, un modelo de lenguaje denso de aproximadamente 752 millones de parametros. El entrenamiento consistio en un afinado completo (full-parameter SFT) sobre el modelo base, utilizando las bibliotecas Hugging Face transformers y trl, con aceleracion Liger. Posteriormente, los pesos fueron cuantizados a MXFP4, un formato de coma flotante de 4 bits con escalado microscopico definido por OCP, mediante la herramienta llm-compressor y almacenados como compressed-tensors. No se especifican los datos de entrenamiento, la composicion del dataset, ni procesos de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, con especializacion en seguridad ofensiva y razonamiento para red team.
- Revision de codigo de seguridad: puede analizar endpoints, configuraciones o fragmentos de codigo para detectar vulnerabilidades (por ejemplo, un endpoint Flask de login).
- Conversacion multi-turno: soporta plantillas de chat (apply_chat_template) para dialogos con system prompt.
- Asistencia en red team: propone escenarios de ataque controlados y evalua la postura de seguridad de sistemas autorizados.
- Modelo de texto unicamente: no se especifica soporte de tool calling, vision o audio.
- Capacidades multilingues limitadas: solo ingles.

## Casos de uso

- Pruebas de penetracion autorizadas: el modelo asiste en la identificacion de fallos de seguridad en aplicaciones web, redes o sistemas, siempre dentro del alcance autorizado.
- Revision de codigo de seguridad: analiza endpoints, middleware o configuraciones para detectar vulnerabilidades como inyecciones, autenticacion debil o parametros inseguros.
- Red teaming: genera vectores de ataque y escenarios de compromiso para evaluar la defensa de una infraestructura.
- Educacion y formacion en ciberseguridad: responde preguntas tecnicas y explica conceptos de seguridad en entornos de laboratorio.
- Apoyo al blue team: ayuda a comprender vulnerabilidades y tecnicas de ataque para implementar defensas.
- Operaciones de seguridad: redacta informes tecnicos, documenta hallazgos o resume analisis de incidentes.
- Evaluacion de configuraciones de seguridad: analiza reglas de firewall, politicas de acceso o configuraciones de servicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- Estimacion de VRAM: con 752M parametros en MXFP4 (4 bits), los pesos ocupan aproximadamente 0.4 GB; el tamano del repositorio es de 1.1 GB. Se estima que puede ejecutarse en GPUs consumer con al menos 4 GB de VRAM, o en CPU con suficiente RAM.
- GPU recomendada: no disponible en la documentacion, pero por su tamano, cualquier GPU moderna de gama media (RTX 3060, RTX 4060, etc.) o superior es suficiente.
- Opciones de despliegue: vLLM (recomendado) o transformers con compressed-tensors instalado. Tambien es compatible con Hugging Face Inference Endpoints (endpoints_compatible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|
| Qwen3.5-0.8B (base) | ~0.8B | 4.096 | BF16 (original) | Licencia propia de Qwen |
| Kavach-1-Mini-MXFP4 | 752M | 4.096 | MXFP4 | MIT |
| Kavach-1-Mini-BF16 | ~0.8B | 4.096 | BF16 | MIT |

No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos especificos, pero al estar entrenado para seguridad ofensiva, podria mostrar sesgos hacia tecnicas de ataque.
- Riesgo de alucinacion: el autor advierte que puede generar detalles tecnicos plausibles pero incorrectos; es necesario verificar comandos, payloads y afirmaciones.
- Limitaciones de contexto: ventana de 4.096 tokens, lo que puede restringir el analisis de codigo largo o conversaciones extensas.
- Idioma: solo ingles, no soporta otros idiomas.
- Restricciones de licencia: MIT para el modelo afinado, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe respetarse al redistribuir pesos derivados.
- Uso dual: herramienta de doble uso, destinada unicamente a trabajo autorizado y legal; el uso indebido es responsabilidad del usuario.
- Cuantizacion: la version MXFP4 sacrifica fidelidad frente a BF16, especialmente en hardware o runtime sin soporte nativo para coma flotante de 4 bits.

## Enlaces

- https://huggingface.co/TNSA/Kavach-1-Mini-MXFP4
- No se han encontrado papers, blogs o demos adicionales en la informacion disponible.

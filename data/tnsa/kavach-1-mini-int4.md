# TNSA/Kavach-1-Mini-INT4

## Resumen

Kavach-1-Mini-INT4 es un modelo de lenguaje compacto, especializado en seguridad ofensiva y razonamiento para operaciones de red team, desarrollado por TNSA. Se construye mediante ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base Qwen3.5-0.8B, y se distribuye en una versión cuantizada a 4 bits. Está pensado para actuar como asistente experto en pruebas de penetración autorizadas, investigación de seguridad y educación en ciberseguridad, con un tamaño que permite ejecutarlo en hardware modesto.

La arquitectura es un transformer decoder-only de aproximadamente 0,8 mil millones de parámetros, con una ventana de contexto de 4.096 tokens. Este build en particular usa cuantización INT4 weight-only (W4A16, grupo de 128) en formato compressed-tensors, lo que reduce notablemente el peso del modelo sin perder demasiada fidelidad. El checkpoint se publica bajo licencia MIT y está disponible en Hugging Face, siendo compatible con vLLM y transformers.

Su relevancia actual radica en la demanda de herramientas de seguridad que puedan operar localmente y en entornos controlados, donde la velocidad y el bajo consumo de recursos son críticos. Al ser un modelo pequeño y especializado, ofrece una alternativa ágil para automatizar tareas de análisis y revisión de código, sin depender de servicios externos ni de modelos de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | INT4 (W4A16, group size 128, compressed-tensors, pack-quantized) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only denso de 0,8 mil millones de parámetros. El ajuste se realizó mediante supervisión de instrucciones (SFT) sobre todos los parámetros, no con LoRA, utilizando el stack de Hugging Face transformers y trl, acelerado con Liger. Tras el entrenamiento, el checkpoint se cuantizó con llm-compressor para producir pesos INT4 en formato compressed-tensors, con grupo de 128 y empaquetado pack-quantized. No se ha documentado el uso de RLHF, DPO ni técnicas de alineación adicionales; la especialización se obtiene únicamente del ajuste supervisado. Tampoco se han publicado detalles sobre la composición del dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de texto y razonamiento especializado en seguridad ofensiva: análisis de vulnerabilidades, revisión de código y generación de payloads dentro de un contexto de trabajo autorizado.
- Asistencia en operaciones de red team: puede proponer cadenas de ataque, técnicas de enumeración y comandos útiles para pruebas de penetración con alcance definido.
- Soporte de conversaciones multi-turno mediante plantilla de chat, como se muestra en el ejemplo de uso de la model card.
- Soporte de tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado, aunque puede generar razonamientos largos (hasta 1.024 tokens de salida en el ejemplo).
- Capacidades multilingües: limitadas al inglés, según la documentación del autor.
- Capacidades especiales: no incluye visión ni audio; es un modelo de texto puro.

## Casos de uso

- Auditoría de código de aplicaciones web: el modelo puede revisar endpoints y funciones en Python o Flask, señalando posibles fallos como inyección SQL, falta de autenticación o manejo inseguro de entradas. Su especialización en seguridad lo hace útil en revisiones manuales de código.
- Pruebas de penetración autorizadas: durante un pentest con alcance definido, el modelo sugiere comandos, técnicas de enumeración y payloads para validar vulnerabilidades, agilizando la fase de explotación.
- Simulación de red team: genera escenarios de ataque realistas para evaluar las defensas de una organización, incluyendo cadenas de ataque, persistencia y movimiento lateral.
- Investigación de incidentes: analiza logs y configuraciones para plantear hipótesis sobre el origen de un incidente, proponiendo vectores de ataque probables y posibles acciones de remediación.
- Educación y formación en ciberseguridad: se emplea en laboratorios y cursos para explicar técnicas ofensivas y defensivas, con ejemplos de código y explicaciones contextualizadas.
- Soporte a blue team: ayuda a generar ideas para reglas de detección, revisar la lógica de herramientas de monitorización y crear pruebas de concepto para validar detecciones.
- Integración en pipelines de análisis automatizado: al ser pequeño y compatible con vLLM, puede desplegarse como servicio de análisis de código o triage de alertas, devolviendo resúmenes y recomendaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con INT4, los pesos ocupan aproximadamente 0,4 GB; sumando activos y caché KV para 4.096 tokens, el consumo se sitúa entre 1 y 2 GB de VRAM en GPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3060, RTX 4060 o equivalentes de AMD e Intel.
- Compatibilidad con GPU de consumo: sí, es ejecutable en tarjetas de gama baja e incluso en CPU, siempre que se utilice una implementación adecuada.
- Opciones de despliegue: vLLM (recomendado), transformers con compressed-tensors instalado, llama.cpp (tras convertir el checkpoint a GGUF) y Ollama (tras conversión a GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks; la comparativa se limita a características declaradas.

| Modelo | Parametros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Kavach-1-Mini-INT4 | 752.393.024 | 4.096 | MIT | Seguridad ofensiva |
| Qwen3.5-0.8B (base) | ~0,8B (no disponible) | no disponible | no disponible | Modelo general |
| Kavach-1-Mini-FP8 | no disponible | 4.096 | MIT | Seguridad ofensiva |

## Limitaciones y advertencias

- Riesgo de alucinación: el modelo puede producir detalles técnicos plausibles pero incorrectos; es imprescindible verificar todos los comandos, payloads y afirmaciones antes de usarlos en entornos reales.
- Limitaciones de contexto: solo dispone de 4.096 tokens de ventana, lo que restringe el análisis de documentos largos o conversaciones extensas.
- Idioma: está limitado al inglés; no se recomienda su uso para tareas en otros idiomas.
- Uso dual: es una herramienta de doble uso destinada a trabajo autorizado. El uso en sistemas sin permiso explícito o con fines ilegales queda fuera de las condiciones de uso y es responsabilidad del usuario.
- Restricciones de licencia: aunque el checkpoint se publica bajo MIT, el modelo base Qwen3.5-0.8B se rige por su propia licencia; es necesario revisar y cumplir esos términos al redistribuir pesos derivados.
- Sin garantías de seguridad: al ser un modelo pequeño, su fiabilidad en tareas complejas de seguridad es menor que la de modelos de mayor tamaño; conviene tratarlo como un punto de partida, no como una fuente autoritativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TNSA/Kavach-1-Mini-INT4
- Build FP8 del mismo modelo: https://huggingface.co/TNSA/Kavach-1-Mini-FP8
- Sitio web del desarrollador: https://www.tnsaai.com/
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-0.8B

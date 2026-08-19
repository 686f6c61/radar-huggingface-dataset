# SoulInPsyAbstract/vuln-gate-03_injection-lora

## Resumen

El modelo vuln-gate-03_injection-lora es un adaptador LoRA (Low-Rank Adaptation) desarrollado por SoulInPsyAbstract, especializado en la detección de vulnerabilidades de inyección (SQL, comandos y plantillas) y en el reporte de hallazgos sin generar ni enviar payloads explotables. Forma parte de la familia vuln-gate (G15), un conjunto de seis especialistas diseñados para el trabajo de agentes de seguridad de vulnerabilidades dentro del proyecto SIPA OS (EilatSecure). El adaptador se basa en el modelo Qwen2.5-7B-Instruct y se ha entrenado mediante fine-tuning supervisado (SFT) con un enfoque positivo-only, es decir, solo se refuerza el comportamiento de detener e informar, sin entrenar al modelo en textos de escalada o racionalización.

La relevancia de este modelo radica en su aplicación en pipelines de seguridad automatizada, donde se requiere que un agente LLM detecte vulnerabilidades y se detenga inmediatamente, sin intentar explotarlas ni continuar con acciones no autorizadas. Al ser un adaptador LoRA, es ligero (0.1 GB) y se puede integrar fácilmente sobre el modelo base, lo que facilita su despliegue en entornos con recursos limitados. La licencia Apache 2.0 permite su uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Qwen2.5-7B-Instruct (transformer causal) |
| Parametros totales | Modelo base: 7.6B (Qwen2.5-7B-Instruct); adaptador LoRA: no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificado; depende del modelo base Qwen2.5-7B-Instruct |
| Tipos de cuantizacion | No especificado; el entrenamiento usó 4-bit bnb, pero el adaptador es compatible con cualquier precisión del modelo base |
| Idiomas soportados | No especificado; el modelo base Qwen2.5-7B-Instruct soporta múltiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se construye sobre el modelo base Qwen2.5-7B-Instruct, un transformer causal con atención multi-cabeza. La adaptación se realiza mediante matrices de bajo rango (r=16, alpha=32, dropout=0.05) aplicadas a los módulos q/k/v/o/gate/up/down_proj. El entrenamiento se llevó a cabo con cuantización de 4 bits (bitsandbytes) durante 3 épocas, utilizando el framework TRL (SFTTrainer/SFTConfig). Los datos consistieron en 180 ejemplos específicos para este grupo, de los cuales 20 se reservaron para evaluación (held-out) y no se usaron en el entrenamiento.

La innovación principal es el entrenamiento positivo-only: el modelo solo ve ejemplos del comportamiento deseado (detectar y detenerse), nunca ejemplos de escalada o racionalización como objetivos de entrenamiento, ni siquiera como ejemplos negativos. Esto refuerza la conducta de parada dura (hard stop) definida en el protocolo G15. Según la documentación, este adaptador no sustituye una compuerta arquitectónica en producción; la detección debe ser código determinista, no una decisión del LLM.

## Capacidades

- Detección de vulnerabilidades de inyección: identifica SQL injection, command injection y template injection en texto o código.
- Reporte estructurado: genera un informe con qué, dónde, severidad y cómo corregir la vulnerabilidad.
- Cumplimiento de regla de parada dura: tras detectar una vulnerabilidad, el modelo devuelve FALSE y no continúa con acciones adicionales, incluso bajo presión contextual (urgencia, autoridad, etc.).
- Sin generación de payloads: el modelo no crea ni envía payloads explotables, solo reporta el hallazgo.
- Especialización: es uno de los seis especialistas de la familia vuln-gate, cada uno enfocado en un tipo de vulnerabilidad.
- Integración con PEFT: se puede cargar fácilmente con la librería `peft` sobre el modelo base.

## Casos de uso

- Escaneo automatizado de código en repositorios: el modelo puede analizar código fuente en busca de patrones de inyección y reportar hallazgos sin ejecutar exploits. Se integraría en un pipeline de CI/CD que invoque el modelo sobre cada commit.
- Análisis de logs de aplicaciones web: detectar intentos de inyección en logs de acceso o errores, generando alertas tempranas.
- Auditoría de seguridad de APIs: examinar parámetros de entrada y respuestas para identificar posibles inyecciones en endpoints.
- Revisión de plantillas de correo o documentos: detectar inyección de plantillas (SSTI) en sistemas de generación de contenido.
- Asistente para analistas de seguridad: el modelo puede actuar como un primer filtro en un SOC, clasificando alertas y deteniéndose cuando encuentra una vulnerabilidad real, evitando falsos positivos y acciones no autorizadas.
- Entrenamiento y concienciación: como herramienta educativa para enseñar a desarrolladores a reconocer vulnerabilidades de inyección, mostrando ejemplos de detección y reporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el especialista fue evaluado en su propio conjunto held-out (20 ejemplos), pero no se proporcionan métricas numéricas. La evaluación completa antes y después de la fusión con los otros cinco especialistas se documenta en el repositorio del modelo fusionado `vuln-gate-merged-qwen25-lora`.

## Requisitos de hardware

Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base Qwen2.5-7B-Instruct. No se especifican requisitos concretos en la documentación, pero se pueden estimar:

- Para inferencia en 4-bit (cuantización típica): se recomienda al menos 8 GB de VRAM (por ejemplo, una RTX 3070/4060).
- Para inferencia en 8-bit: alrededor de 12 GB de VRAM (RTX 3080/4080).
- Para inferencia en 16-bit (precisión completa): alrededor de 16 GB de VRAM (RTX 3090/4090 o A100).
- El adaptador en sí ocupa muy poco espacio (0.1 GB) y se carga en memoria junto con el modelo base.
- Opciones de despliegue: se puede usar con Hugging Face Transformers y PEFT, o exportar a formatos como GGUF para ejecución en CPU con llama.cpp, aunque la documentación no lo menciona explícitamente.
- La latencia depende del hardware y del tamaño del contexto; no se proporcionan datos específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para detección de vulnerabilidades de inyección). Se puede comparar con el modelo base sin el adaptador, que no tiene la capacidad especializada de detección ni la regla de parada dura. Otros adaptadores de la familia vuln-gate (por ejemplo, los otros cinco especialistas) cubren diferentes tipos de vulnerabilidades, pero no se detallan en esta ficha. El modelo fusionado `vuln-gate-merged-qwen25-lora` combina los seis especialistas y podría considerarse una alternativa más completa, aunque no se proporcionan métricas comparativas.

## Limitaciones y advertencias

- Entrenamiento positivo-only: el modelo no ha visto ejemplos de escalada o racionalización como objetivos, pero podría generar comportamientos no deseados en situaciones no cubiertas por los datos de entrenamiento.
- No es un sustituto de una compuerta arquitectónica: en producción, la detección debe ser implementada con código determinista, no con una decisión del LLM.
- Dependencia del modelo base: las limitaciones de Qwen2.5-7B-Instruct (sesgos, alucinaciones, etc.) se heredan.
- Datos de entrenamiento limitados: solo 180 ejemplos para este grupo, lo que puede afectar la generalización a casos no vistos.
- Evaluación limitada: solo se evaluó en un conjunto held-out de 20 ejemplos, sin métricas publicadas.
- Sin información sobre idiomas: aunque el modelo base soporta múltiples idiomas, no se ha verificado el rendimiento del adaptador en otros idiomas distintos del inglés (presumiblemente el idioma de los datos de entrenamiento).
- Riesgo de falsos positivos/negativos: como cualquier modelo de detección, puede clasificar incorrectamente, por lo que se recomienda una validación humana o reglas adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SoulInPsyAbstract/vuln-gate-03_injection-lora)
- [Registro del experimento EXP-031](https://huggingface.co/SoulInPsyAbstract/vuln-gate-merged-qwen25-lora)
- [Sitio de SIPA OS](https://sipa-os.org)
- [Modelo fusionado vuln-gate-merged-qwen25-lora](https://huggingface.co/SoulInPsyAbstract/vuln-gate-merged-qwen25-lora)

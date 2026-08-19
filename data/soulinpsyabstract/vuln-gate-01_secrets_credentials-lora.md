# SoulInPsyAbstract/vuln-gate-01_secrets_credentials-lora

## Resumen

`vuln-gate-01_secrets_credentials-lora` es un adaptador LoRA especializado en la detección de credenciales expuestas (archivos `.env`, claves de API, cadenas de conexión a bases de datos) durante escaneos de seguridad autorizados. Forma parte de la familia `vuln-gate (G15)` compuesta por seis especialistas, desarrollada por SoulInPsyAbstract dentro del proyecto EilatSecure de SIPA OS, orientado a la seguridad de agentes de vulnerabilidades. El modelo se entrena sobre el base `Qwen/Qwen2.5-7B-Instruct` mediante SFT positivo, reforzando un comportamiento de "detectar, reportar y detenerse" sin validar si las credenciales encontradas están activas.

La relevancia de este adaptador radica en su enfoque de seguridad por diseño: incorpora una regla de parada dura (hard stop) que impide que el agente continúe más allá del reporte, reduciendo el riesgo de escalada no autorizada. Aunque es un refuerzo de comportamiento a nivel de entrenamiento, no sustituye una compuerta arquitectónica determinista en producción, tal como advierte su propia documentación. El repositorio tiene un tamaño de 0,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA con r=16, alpha=32, dropout=0.05) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No especificado; entrenado con 4-bit (bitsandbytes) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal. La configuración LoRA emplea r=16, alpha=32 y dropout=0.05, aplicada a los módulos `q`, `k`, `v`, `o`, `gate`, `up` y `down_proj`. El entrenamiento se realizó con SFT positivo (positive-only SFT) usando TRL `SFTTrainer`/`SFTConfig`, durante 3 épocas, sobre 176 ejemplos específicos de este grupo, de los cuales 20 se reservaron para evaluación y nunca se usaron en el entrenamiento.

La innovación técnica principal es el protocolo de compuerta de vulnerabilidad (G15), que define una regla de parada dura: si se detecta una vulnerabilidad, el agente debe reportarla claramente (qué, dónde, severidad y cómo corregir) y detenerse sin tomar acciones adicionales, sin confirmar impacto y sin ceder a presiones de continuar. El entrenamiento refuerza únicamente el comportamiento positivo de detener y reportar; el modelo nunca ve su propio texto de escalada o racionalización como objetivo de entrenamiento. Esto lo convierte en un refuerzo de comportamiento, no en un sustituto de una compuerta arquitectónica determinista (patrón L06/G15, experimento EXP-023).

## Capacidades

- Detección de credenciales expuestas: identifica archivos `.env`, claves de API, cadenas de conexión a bases de datos y otros secretos en texto.
- Reporte estructurado: genera informes con descripción del hallazgo, ubicación, severidad y recomendaciones de corrección.
- Parada tras el reporte: aplica la regla de parada dura, deteniéndose después de reportar sin validar si las credenciales están activas ni continuar con pasos adicionales.
- Resistencia a presión contextual: no responde a intentos de continuar basados en urgencia, autoridad, coste hundido o "ya que lo encontré".
- Herencia de capacidades del modelo base: al estar basado en Qwen2.5-7B-Instruct, conserva habilidades generales de comprensión y generación de texto, aunque su especialización es la detección de secretos.
- Integración con PEFT: puede cargarse mediante `PeftModel` junto con el tokenizador del modelo base.

## Casos de uso

- Auditoría de repositorios de código: escaneo de repositorios en busca de claves API o tokens hardcodeados en archivos de configuración, generando un reporte de hallazgos sin intentar validar su uso.
- Revisión de archivos de entorno: análisis de archivos `.env` en entornos de desarrollo o pruebas para detectar credenciales expuestas antes de su despliegue.
- Integración en pipelines de CI/CD: incorporación del adaptador como paso de verificación de secretos en flujos de integración continua, deteniendo el pipeline si se encuentran credenciales.
- Asistencia a equipos de seguridad: apoyo en revisiones manuales de código, señalando posibles exposiciones de credenciales y proporcionando recomendaciones de mitigación.
- Entrenamiento de agentes de seguridad: uso como componente en sistemas de agentes que deben reportar vulnerabilidades y detenerse, evitando escaladas no autorizadas.
- Generación de informes de vulnerabilidades: producción de informes estructurados con severidad y pasos de corrección, listos para integrarse en herramientas de gestión de incidencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el especialista fue evaluado en su propio conjunto de validación (20 ejemplos retenidos) antes de fusionarse con otros cinco adaptadores en `vuln-gate-merged-qwen25-lora`, donde se presenta una tabla de regresión de seguridad antes/después de la fusión, pero no se incluyen métricas numéricas en esta ficha.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre Qwen2.5-7B-Instruct, los requisitos de hardware son los del modelo base más el adaptador, que añade una carga mínima.
- Con cuantización 4-bit del modelo base, es viable en GPUs de consumo con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070).
- En FP16, el modelo base requiere aproximadamente 14-16 GB de VRAM, por lo que se necesitaría una GPU de gama alta (RTX 3090, RTX 4090, A100, etc.).
- Opciones de despliegue: `transformers` con PEFT para carga del adaptador, `vLLM` (si se soporta LoRA), `llama.cpp` (convirtiendo el modelo base a GGUF y aplicando el adaptador), o `Ollama` (con adaptaciones manuales).
- No se proporcionan datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que se trata de un adaptador especializado en seguridad con una regla de parada dura. Como referencia:

| Modelo | Tipo | Base | Especialización | Licencia |
|---|---|---|---|---|
| `vuln-gate-01_secrets_credentials-lora` | Adaptador LoRA | Qwen2.5-7B-Instruct | Detección de credenciales expuestas con parada dura | Apache 2.0 |
| `vuln-gate-merged-qwen25-lora` | Adaptador LoRA fusionado | Qwen2.5-7B-Instruct | Seis especialistas de vulnerabilidades combinados | Apache 2.0 |
| `Qwen/Qwen2.5-7B-Instruct` | Modelo base | - | Generación de texto general | Apache 2.0 |

La comparativa con el modelo base muestra que el adaptador añade una capa de comportamiento específico sin modificar la arquitectura subyacente. El adaptador fusionado agrupa las capacidades de los seis especialistas, mientras que este se centra exclusivamente en secretos y credenciales.

## Limitaciones y advertencias

- Es un refuerzo de comportamiento, no una compuerta arquitectónica: en producción, la detección debe implementarse como código determinista, no como decisión del LLM.
- Solo se entrenó en el comportamiento positivo (detener y reportar); no se expuso a ejemplos negativos o de escalada, lo que podría limitar su robustez ante casos adversos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar informes inexactos o falsos positivos, especialmente en contextos ambiguos.
- Alcance limitado: está especializado en credenciales y secretos; no cubre otros tipos de vulnerabilidades.
- Dependencia del modelo base: su rendimiento está condicionado a las capacidades y sesgos de Qwen2.5-7B-Instruct.
- No se especifican idiomas soportados, aunque el modelo base tiene capacidades multilingües.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y las políticas de SIPA OS.

## Enlaces

- [Repositorio del adaptador en HuggingFace](https://huggingface.co/SoulInPsyAbstract/vuln-gate-01_secrets_credentials-lora)
- [Registro del experimento EXP-031](https://huggingface.co/SoulInPsyAbstract/vuln-gate-merged-qwen25-lora)
- [Adaptador fusionado vuln-gate-merged-qwen25-lora](https://huggingface.co/SoulInPsyAbstract/vuln-gate-merged-qwen25-lora)
- [Sitio de SIPA OS](https://sipa-os.org)

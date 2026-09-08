# sudarshanregmi/timethink-base

```markdown
## Resumen

TimeThink Base es un checkpoint inicial sin entrenar desarrollado por sudarshanregmi dentro del proyecto TimeThink. Se compone de un backbone Qwen3-8B al que se le añade un codificador de series temporales (ts_encoder) portado del modelo ChatTS-8B de ByteDance Research. Los únicos pesos tomados de ChatTS-8B son los del ts_encoder; el modelo de lenguaje es el Qwen3-8B base, no el backbone afinado de ChatTS. El modelo no ha sido sometido a ningún fine-tuning: es el punto de partida desde el que entrena el script `scripts/sft.sh`.

Su propósito es servir de base para entrenar un sistema capaz de razonar y conversar sobre datos de series temporales, combinando la generación de lenguaje natural de Qwen3 con la representación específica de series temporales de ChatTS. Tiene aproximadamente 8.258.552.848 parámetros (8,26 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0. La longitud de contexto y los idiomas soportados no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-8B backbone + ts_encoder de ChatTS-8B (arquitectura hibrida LLM + codificador de series temporales) |
| Parametros totales | 8.258.552.848 (≈8,26 mil millones) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo combina un backbone Qwen3-8B con un codificador de series temporales (ts_encoder) importado de ChatTS-8B. Los únicos pesos procedentes de ChatTS-8B son los del ts_encoder; el LM es el Qwen3-8B original, sin fine-tuning. Todo el conjunto se distribuye como checkpoint sin entrenar, es decir, como punto de partida para el proceso de SFT del proyecto TimeThink.

No se han publicado detalles sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación como RLHF o DPO. El pipeline previsto incluye una etapa de fine-tuning supervisado (SFT) que da lugar a `timethink-sft`, seguida de un refuerzo (RL) que produce `timethink-rl`. La carga requiere `transformers>=4.55,<5` y `trust_remote_code=True`, ya que el modelo usa código personalizado (`custom_code`).

## Capacidades

- Generación de texto: el backbone Qwen3-8B está presente y es capaz de generar texto, aunque en este checkpoint no se ha evaluado su comportamiento tras la integración del codificador.
- Procesamiento de series temporales: el ts_encoder de ChatTS-8B está incorporado, pero al no haber fine-tuning la representación generada no está alineada con el LLM. La funcionalidad se activa tras el entrenamiento.
- Herramientas y agentes: no se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.
- Vista y audio: no disponible.
- Idiomas: no disponible.

## Casos de uso

> Los siguientes casos son potenciales; solo serían aplicables tras completar el fine-tuning (SFT/RL) descrito en el repositorio del proyecto.

- Análisis de series financieras: tras el entrenamiento, el modelo podría interpretar series históricas de precios y responder en lenguaje natural a preguntas sobre tendencias, volatilidad y anomalías.
- Telemetría de sistemas: monitorizar métricas de servidores (CPU, memoria, red) y generar descripciones automáticas para informes o alertas de operaciones.
- Predicción de demanda en retail: analizar series de ventas históricas para generar pronósticos y justificar la previsión con explicaciones basadas en los datos.
- Análisis de series de salud: interpretar señales biométricas temporales (ECG, glucosa) y resumir patrones para asistir a profesionales sanitarios.
- Meteorología y clima: describir evolución de variables como temperatura o humedad a partir de series temporales, facilitando la comprensión de cambios climáticos.
- Industria 4.0: monitorizar series de vibración, temperatura o presión en maquinaria y elaborar informes de mantenimiento en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos safetensors ocupan 16,5 GB, lo que equivale a un formato de 16 bits (BF16/FP16). Para inferencia se recomiendan al menos 20-24 GB de VRAM, considerando activaciones y KV-cache.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB).
- Consumer GPU: con pesos en FP16 se necesita una GPU de 24 GB o superior; una RTX 4090 podría ejecutar el modelo, aunque con margen limitado. No se incluyen cuantizaciones en el repositorio; si se generara una versión 4-bit, cabría en GPUs de 8-12 GB (RTX 3060/4070, por ejemplo).
- Opciones de despliegue: Transformers con `trust_remote_code=True` es el método soportado. Para vLLM, llama.cpp, Ollama o TGI no se ha confirmado soporte debido al código personalizado y a la necesidad de cargar el ts_encoder.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| timethink-base (sudarshanregmi) | 8,26 mil millones | No disponible | Apache 2.0 | Checkpoint sin entrenar; Qwen3-8B + ts_encoder de ChatTS-8B |
| ChatTS-8B (ByteDance) | No disponible | No disponible | No disponible | Modelo entrenado de referencia para el ts_encoder; orientado a chat con series temporales |
| Qwen3-8B (Alibaba) | No disponible | No disponible | No disponible | Backbone del LM; modelo base de lenguaje |

No se ofrecen datos de benchmarks comparativos en la información disponible.

## Limitaciones y advertencias

- El modelo es un checkpoint sin entrenar; no debe utilizarse directamente en producción para tareas de series temporales. Solo es válido como componente de un pipeline de entrenamiento.
- La integración entre el ts_encoder y el backbone Qwen3-8B no ha sido validada; puede existir desalineación de representaciones que cause comportamientos erróneos tras el fine-tuning si no se entrena adecuadamente.
- No se han documentado sesgos conocidos, riesgo de alucinación ni evaluaciones de seguridad en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero exige incluir el aviso de licencia y la atribución. No hay restricciones adicionales conocidas.
- El modelo requiere carga con `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; el código debe revisarse antes de su uso en entornos de producción.
- No se han publicado los idiomas soportados ni la longitud de contexto, lo que limita la planificación de despliegues multilingües o de contexto largo.
- La documentación es mínima; los resultados de búsqueda web no aportan información técnica adicional.

## Enlaces

- HuggingFace: https://huggingface.co/sudarshanregmi/timethink-base
- Modelo entrenado SFT: https://huggingface.co/sudarshanregmi/timethink-sft
- Modelo entrenado RL: https://huggingface.co/sudarshanregmi/timethink-rl
- Dataset de evaluacion: https://huggingface.co/datasets/sudarshanregmi/timethink
- Repositorio GitHub: https://github.com/sudarshanregmi/timethink
```

# Ttimms/sovereign-edge-intent-router

## Resumen

El modelo `Ttimms/sovereign-edge-intent-router` es un clasificador de intenciones de texto basado en DistilBERT, fine-tuneado para enrutar consultas de usuario hacia uno de cinco dominios especializados dentro de un sistema multi-agente LangGraph. Desarrollado por Tremayne Timms como parte del proyecto [sovereign-edge](https://github.com/t-timms/sovereign-edge), su objetivo principal es proporcionar un router de intenciones ligero y de baja latencia que pueda ejecutarse en dispositivos edge como un Jetson Orin Nano, manteniendo los datos del usuario en local y evitando depender de servicios cloud.

El modelo resuelve el problema de seleccionar el agente experto adecuado en un sistema de agentes múltiples, actuando como el segundo nivel de un router de tres niveles (similitud de embeddings → clasificador DistilBERT → coincidencia de palabras clave). Su relevancia radica en su capacidad para funcionar con recursos limitados: la versión cuantizada INT8 en ONNX ocupa solo 64 MB y ofrece una inferencia inferior a 10 ms en CPU, lo que lo hace adecuado para despliegues en hardware de bajo consumo. Actualmente se distribuye como un snapshot sin desarrollo activo, por lo que puede ser superado en el futuro.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer, fine-tune de `distilbert-base-uncased`) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (típico de DistilBERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | FP32 (safetensors y ONNX), INT8 (ONNX) |
| Idiomas soportados | no disponible (modelo base entrenado en inglés, no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (FP32 e INT8) |

## Arquitectura y entrenamiento

El modelo es un fine-tune estándar de `distilbert-base-uncased` para clasificación de secuencias de 5 clases. DistilBERT es una versión destilada de BERT que conserva la arquitectura de transformer encoder pero con menos capas y parámetros, lo que reduce el coste computacional manteniendo gran parte del rendimiento. El entrenamiento se realizó con el `Trainer` de Hugging Face, utilizando un dataset propio no especificado en la información disponible. No se mencionan técnicas avanzadas como RLHF o DPO; se trata de un ajuste fino supervisado convencional para clasificación de intenciones.

La innovación principal no está en la arquitectura del modelo en sí, sino en su integración dentro de un sistema de enrutamiento de tres niveles. El clasificador actúa como Tier 2, complementando la similitud de embeddings (Tier 1) y el fallback por palabras clave (Tier 3). Esta arquitectura permite una degradación elegante: si el modelo no está disponible, el sistema sigue funcionando con los otros niveles. El modelo se exporta a ONNX con cuantización INT8 para su despliegue en producción, optimizado para CPU en dispositivos edge.

## Capacidades

- Clasificación de intenciones en 5 clases: `spiritual`, `career`, `intelligence`, `creative`, `goals`.
- Enrutamiento de consultas a agentes expertos dentro de un sistema LangGraph multi-agente.
- Inferencia de baja latencia (<10 ms) en CPU, adecuada para entornos edge.
- Soporte de exportación a ONNX con cuantización INT8 para despliegue ligero.
- Integración con el ecosistema Hugging Face Transformers mediante `AutoModelForSequenceClassification`.
- Funcionamiento como parte de un router de tres niveles con fallback por similitud de embeddings y coincidencia de palabras clave.

## Casos de uso

- Asistente personal local: el modelo enruta preguntas del usuario a agentes especializados en áreas como carrera profesional, creatividad o metas personales, manteniendo la privacidad al procesar todo en el dispositivo.
- Sistema de soporte al cliente en edge: clasifica tickets o consultas entrantes y los dirige al agente o flujo de trabajo adecuado sin necesidad de conexión a internet.
- Automatización de tareas en entornos con recursos limitados: al ser un modelo pequeño y cuantizado, puede ejecutarse en placas como Jetson Orin Nano o Raspberry Pi para enrutar comandos de voz o texto en aplicaciones de domótica.
- Filtrado y priorización de mensajes en aplicaciones de mensajería: identifica la intención de cada mensaje (por ejemplo, si es sobre objetivos personales o creatividad) y lo asigna a un bot o agente específico.
- Pruebas de concepto de sistemas multi-agente: sirve como componente de demostración para arquitecturas de enrutamiento de intenciones en proyectos de investigación o desarrollo.
- Despliegue en entornos con requisitos estrictos de privacidad: al funcionar completamente en local, evita enviar datos a servicios cloud, cumpliendo con políticas de protección de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como precisión, F1 o comparaciones con otros modelos en tareas de clasificación de intenciones.

## Requisitos de hardware

- Inferencia en CPU: el modelo cuantizado INT8 (64 MB) está diseñado para ejecutarse en CPU de dispositivos edge, con una latencia inferior a 10 ms en un Jetson Orin Nano.
- VRAM estimada: no disponible, pero al ser un modelo pequeño (DistilBERT base) y ejecutarse en CPU, no requiere GPU dedicada.
- GPU recomendadas: no se especifican; el despliegue objetivo es CPU en Jetson Orin Nano.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño reducido, pero no se confirma en la documentación.
- Opciones de despliegue: Hugging Face Transformers (Python), ONNX Runtime (para producción), y posiblemente otros frameworks compatibles con ONNX.
- Latencia y throughput: <10 ms por inferencia en CPU (según la model card), aunque no se especifica el throughput.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de comparación con otros modelos de clasificación de intenciones en la información consultada.

## Limitaciones y advertencias

- El modelo es un snapshot y no está en desarrollo activo; puede ser retrainado o sustituido en el futuro, por lo que no se garantiza su mantenimiento.
- Solo cubre 5 clases de intención; el sistema añade una sexta clase `GENERAL` que se maneja mediante el fallback de palabras clave, no por este modelo.
- No se especifican los datos de entrenamiento ni su composición, por lo que puede haber sesgos no documentados.
- Al ser un modelo pequeño, su capacidad de generalización es limitada y puede presentar alucinaciones o errores en entradas fuera de su dominio.
- La longitud de contexto no está confirmada; si se hereda de DistilBERT, es de 512 tokens, lo que limita el manejo de textos largos.
- La licencia MIT permite uso comercial, pero el modelo depende del proyecto sovereign-edge, que puede tener requisitos adicionales no documentados aquí.

## Enlaces

- [Hugging Face - Ttimms/sovereign-edge-intent-router](https://huggingface.co/Ttimms/sovereign-edge-intent-router)
- [GitHub - t-timms/sovereign-edge](https://github.com/t-timms/sovereign-edge)
- [README del proyecto sovereign-edge](https://github.com/t-timms/sovereign-edge/blob/main/README.md)

# tharunpranavsakthivel/tinyshell-functiongemma-270m

## Resumen

`tharunpranavsakthivel/tinyshell-functiongemma-270m` es un modelo de lenguaje de 268 millones de parámetros, desarrollado por el usuario `tharunpranavsakthivel` como un fine-tune del modelo `google/functiongemma-270m-it` de Google. Este modelo está especializado en function calling, generación estructurada en JSON y tool-use, con el objetivo de servir como base para agentes locales rápidos y privados que traduzcan lenguaje natural en acciones ejecutables sobre APIs. Se presenta como una alternativa ligera para despliegue en dispositivos con recursos limitados.

El modelo hereda la arquitectura de Gemma 3 270M y ha sido ajustado específicamente para tareas de generación estructurada y conversación con soporte de herramientas. Aunque no se han publicado métricas de rendimiento en la información disponible, su tamaño reducido lo hace apto para inferencia en GPU de consumo o incluso en CPU con cuantización. El acceso al repositorio está restringido (gated) y requiere aceptar las condiciones de la licencia Gemma en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 270M) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 3 270M, un transformer decoder-only con atención causal estándar. Como fine-tune de `google/functiongemma-270m-it`, hereda el entrenamiento específico en function calling que Google realizó sobre el modelo base, que incluye instrucciones para generar llamadas a herramientas y salidas estructuradas en JSON. El proceso de ajuste adicional realizado por `tharunpranavsakthivel` no está documentado en la información disponible, pero los tags indican un énfasis en "structured-generation", "json" y "tool-use". No se especifican los datos de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Function calling: genera llamadas a herramientas y APIs a partir de instrucciones en lenguaje natural.
- Generación estructurada: produce salidas en formato JSON válido, adecuadas para integración con sistemas que requieren datos estructurados.
- Conversación multi-turno: soporta diálogos con contexto, aunque el tamaño del modelo limita la complejidad.
- Uso de herramientas: puede seleccionar y ejecutar acciones definidas por el desarrollador.
- Texto en inglés: el modelo está entrenado principalmente para este idioma.

## Casos de uso

- Asistentes locales de atención al cliente: el modelo puede interpretar peticiones de usuarios y activar funciones de un CRM o sistema de tickets, generando respuestas estructuradas para el agente humano.
- Automatización de tareas de back-office: integrado en un pipeline, convierte correos o mensajes en acciones de calendario, creación de incidencias o actualización de bases de datos mediante llamadas a API.
- Agentes de voz embebidos: al ser pequeño, puede ejecutarse en dispositivos edge (Raspberry Pi, teléfonos) para controlar dispositivos domésticos inteligentes mediante comandos de voz traducidos a comandos JSON.
- Generación de datos sintéticos: sirve para producir ejemplos de entrenamiento en formato JSON para otros modelos o sistemas de test.
- Prototipado rápido de agentes: los desarrolladores pueden validar flujos de function calling sin depender de modelos grandes en la nube, reduciendo costes y latencia.
- Pruebas de integración de APIs: el modelo puede actuar como cliente de prueba generando peticiones HTTP estructuradas a partir de especificaciones verbales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 268M parámetros, la inferencia en FP16 requiere aproximadamente 0,5 GB de VRAM, y en cuantización de 8 bits alrededor de 0,3 GB. Con cuantización de 4 bits puede operar en menos de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2050, o incluso iGPU con soporte de Vulkan). También es viable en CPU con 4 GB de RAM.
- Despliegue en consumer GPU: sí, es compatible con tarjetas de gama baja y media. Se puede ejecutar en una RTX 3060 sin problemas.
- Opciones de despliegue: compatible con la librería Transformers de HuggingFace, así como con servidores de inferencia como vLLM o TGI (text-generation-inference). También puede convertirse a formato GGUF para usarse con llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones, pero por el tamaño se espera una latencia de decenas de milisegundos por token en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Function calling | Licencia | Formato |
|---|---|---|---|---|---|
| tinyshell-functiongemma-270m (este) | 268M | no disponible | Sí (especializado) | Gemma | safetensors |
| google/functiongemma-270m-it | 268M | 32K (estimado) | Sí (base) | Gemma | safetensors |
| Qwen2.5-0.5B-Instruct | 494M | 32K | Limitado | Apache 2.0 | safetensors |
| Llama-3.2-1B-Instruct | 1.23B | 128K | Básico | Llama 3.2 | safetensors |

La comparativa se basa en datos públicos de los modelos base. El modelo `tinyshell` no publica su contexto ni sus capacidades exactas más allá de los tags.

## Limitaciones y advertencias

- El acceso al modelo está restringido (gated); es necesario aceptar los términos de la licencia Gemma en HuggingFace antes de poder descargarlo.
- Al ser un modelo de 268M parámetros, su capacidad de razonamiento complejo y generación de código extenso es limitada en comparación con modelos de mayor tamaño.
- Solo soporta inglés; no está entrenado para otros idiomas.
- Riesgo de alucinación en la generación de llamadas a funciones: puede inventar nombres de herramientas o argumentos si no se le proporciona un esquema claro.
- No se dispone de información sobre sesgos específicos ni sobre el proceso de alineación (RLHF/DPO) del fine-tune.
- La licencia Gemma impone restricciones de uso comercial y obliga a incluir el aviso de atribución correspondiente. Es recomendable revisar los términos completos en el sitio oficial de Google.
- El repositorio no muestra métricas de rendimiento ni ejemplos de uso, por lo que se recomienda validar el comportamiento en el escenario concreto antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tharunpranavsakthivel/tinyshell-functiongemma-270m
- Modelo base en HuggingFace: https://huggingface.co/google/functiongemma-270m-it
- Documentación oficial de FunctionGemma: https://ai.google.dev/gemma/docs/functiongemma
- Model card de FunctionGemma: https://ai.google.dev/gemma/docs/functiongemma/model_card
- Página de DeepMind sobre FunctionGemma: https://deepmind.google/models/gemma/functiongemma/
- Blog de Google sobre FunctionGemma: https://blog.google/innovation-and-ai/technology/developers-tools/functiongemma/

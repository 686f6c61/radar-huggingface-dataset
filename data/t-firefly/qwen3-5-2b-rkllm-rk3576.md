# t-firefly/qwen3.5-2b-rkllm-rk3576

## Resumen

Qwen3.5-2B-rkllm-rk3576 es una conversión del modelo multimodal Qwen3.5-2B de Qwen Team, adaptada por el equipo de Firefly AI para ejecutarse sobre la plataforma Rockchip RK3576 mediante la herramienta de despliegue LlamaPi. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de despliegue que empaqueta los pesos del modelo original en un formato compatible con el acelerador NPU del SoC RK3576, orientado a inferencia en el borde (edge AI).

El modelo base, Qwen3.5-2B, es un modelo compacto de la familia Qwen3.5 que unifica comprensión de texto e imagen en una sola arquitectura, con capacidades declaradas de razonamiento, generación de código, uso de agentes y tareas visuales, y soporte de 201 idiomas y dialectos según la model card. Con 2 mil millones de parámetros, está pensado para entornos con recursos limitados donde no es viable desplegar modelos de mayor tamaño.

La relevancia de esta ficha radica en su carácter práctico: permite llevar un modelo multimodal de 2B a hardware embebido con NPU (RK3576), algo poco habitual en el ecosistema open source, donde la mayoría de conversiones para edge se limitan a texto. El repositorio ocupa 3,9 GB y se distribuye bajo licencia Apache 2.0 heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-2B, multimodal image-text-to-text) |
| Parametros totales | 2B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato específico para NPU RK3576 vía LlamaPi) |
| Idiomas soportados | 201 idiomas y dialectos (según model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos convertidos para RKLLM/RK3576; repositorio de 3,9 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. La model card indica únicamente que Qwen3.5-2B es un modelo compacto multimodal de la familia Qwen3.5 que unifica texto e imagen, y que soporta razonamiento, código, agentes y tareas visuales. No se especifican el tipo de transformer, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras.

Respecto a esta conversión concreta, el trabajo de Firefly AI consiste en adaptar los pesos originales al runtime RKLLM para el SoC Rockchip RK3576, de modo que el modelo pueda ejecutarse en la NPU del chip a través de LlamaPi. No se documentan cambios en los pesos ni procesos de cuantización específicos más allá del formato de despliegue. Cualquier innovación arquitectónica del modelo original (atención, decodificación especulativa, etc.) no está descrita en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `image-text-to-text`, tag `conversational`).
- Comprensión de imágenes combinada con texto, según el pipeline declarado y la descripción del modelo base.
- Razonamiento, según la model card del modelo original.
- Generación de código, según la model card del modelo original.
- Capacidades de agente, según la model card del modelo original.
- Soporte multilingüe amplio: 201 idiomas y dialectos declarados.
- Ejecución en hardware edge con NPU Rockchip RK3576 mediante LlamaPi.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en dispositivos embebidos: el modelo puede gestionar diálogos multi-turno directamente sobre un SoC RK3576, sin necesidad de conexión a la nube, lo que resulta adecuado para productos con requisitos de privacidad o conectividad intermitente.
- Descripción de imágenes en el borde: gracias a su naturaleza image-text-to-text, puede generar descripciones o responder preguntas sobre imágenes capturadas por cámaras conectadas al dispositivo, útil en kioscos, señalización digital o domótica.
- Automatización industrial con inspección visual asistida: integrado en un panel o controlador basado en RK3576, el modelo puede interpretar imágenes de sensores y generar informes o alertas en lenguaje natural.
- Asistencia en robótica educativa y prototipos: al ejecutarse en hardware de bajo consumo, permite dotar a robots pequeños de capacidad de diálogo y comprensión visual básica sin depender de servidores externos.
- Procesamiento de documentos con OCR asistido: combinando captura de imagen y generación de texto, puede extraer y resumir información de documentos o etiquetas en dispositivos portátiles.
- Traducción y atención multilingüe en terminales de autoservicio: los 201 idiomas declarados permiten ofrecer interfaces conversacionales multilingües en quioscos o terminales de atención al público desplegados en el borde.
- Prototipado rápido con LlamaPi: el comando `llamapi run qwen3.5:2b` simplifica la descarga, carga y ejecución, lo que lo hace adecuado para validar ideas en hardware Rockchip antes de invertir en un despliegue a medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3576 con NPU, a través del runtime RKLLM y la herramienta LlamaPi.
- VRAM estimada: no disponible; el modelo se ejecuta sobre la memoria del sistema/NPU del RK3576, no sobre GPU dedicada.
- GPU recomendadas: no aplica para esta conversión; el artefacto está pensado para la NPU del RK3576.
- Compatibilidad con GPU de consumo: no disponible para este artefacto concreto; para el modelo base Qwen3.5-2B habría que consultar la documentación oficial de Qwen.
- Opciones de despliegue: LlamaPi (`llamapi run qwen3.5:2b`); no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Plataforma objetivo |
|---|---|---|---|---|---|
| Qwen3.5-2B-rkllm-rk3576 (esta ficha) | 2B | no disponible | Sí (image-text-to-text) | Apache 2.0 | NPU Rockchip RK3576 |
| Qwen3.5-2B (original) | 2B | no disponible | Sí | Apache 2.0 | GPU/CPU genéricas |
| Otras conversiones edge de modelos 2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un artefacto de conversión, no un modelo entrenado desde cero: su comportamiento depende enteramente de Qwen3.5-2B y de la fidelidad de la conversión a RKLLM.
- Específico de hardware: está pensado para el SoC Rockchip RK3576; no es directamente utilizable en GPU convencionales sin recurrir al modelo base original.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- No se especifican la longitud de contexto ni los idiomas concretos más allá del dato genérico de 201 idiomas y dialectos del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- Aunque la licencia es Apache 2.0, los derechos del modelo subyacente pertenecen a Qwen Team; conviene revisar la licencia original enlazada antes de un uso comercial.
- No se documentan requisitos de memoria, latencia ni throughput, lo que dificulta planificar un despliegue en producción sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/t-firefly/qwen3.5-2b-rkllm-rk3576
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo base en ModelScope: https://modelscope.cn/models/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Firefly AI Team: https://www.t-firefly.com/
- Documentación de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction

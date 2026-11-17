# yipengsun/grounded-persona-Qwen3.5-0.8B-q4f16_1-MLC

## Resumen

grounded-persona-Qwen3.5-0.8B-q4f16_1-MLC es una compilación cuantizada del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario yipengsun, orientada a la generación de respuestas fundamentadas ("grounded generation") sobre una persona a partir de una hoja de hechos ("fact sheet") incluida en el system prompt. El modelo no almacena información sobre ninguna persona concreta: es un modelo general que responde en primera persona utilizando exclusivamente los hechos proporcionados en tiempo de inferencia, y rechaza cualquier consulta fuera de ese ámbito.

Su rasgo diferencial es el formato de despliegue: está empaquetado para MLC-LLM y WebLLM, de modo que se ejecuta íntegramente en el navegador mediante WebGPU, sin backend ni servidor. La cuantización q4f16_1 reduce la descarga a unos 310 MB, lo que lo hace viable en equipos de consumo y en entornos web. El repositorio incluye una librería WebGPU propia compilada para un vocabulario de 51.200 tokens.

Se trata de un modelo de 0,8 mil millones de parámetros, con licencia Apache 2.0 (la misma que el modelo base) y soporte declarado para ocho idiomas: inglés, alemán, chino, japonés, francés, español, italiano y coreano. Su relevancia actual radica en el patrón de "persona fundamentada" ejecutada en el cliente: privacidad por diseño, latencia baja y coste de infraestructura nulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; detalles de la arquitectura base no disponibles) |
| Parametros totales | 0,8 mil millones (modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens (configurada en el ejemplo de uso mediante `context_window_size`) |
| Tipos de cuantizacion | q4f16_1 (pesos en 4 bits, activaciones en fp16) |
| Idiomas soportados | en, de, zh, ja, fr, es, it, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC-LLM (artefactos compilados para WebGPU; incluye librería `.wasm` propia) |

## Arquitectura y entrenamiento

El modelo es una compilación del modelo base Qwen/Qwen3.5-0.8B, un transformer de 0,8 mil millones de parámetros. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se especifican innovaciones arquitectónicas internas más allá de las del propio Qwen3.5.

La contribución específica de esta publicación es el pipeline de compilación y cuantización para MLC-LLM: los pesos se transforman a q4f16_1 y se genera una librería WebGPU dedicada con vocabulario de 51.200 tokens, necesaria porque el vocabulario no coincide con el de las librerías precompiladas estándar. El ajuste de comportamiento se realiza en inferencia mediante el system prompt, que combina un bloque de reglas (`RULES`) con una hoja de hechos (`SITE FACTS:`) en Markdown de menos de unos 2.000 tokens. No se documenta un proceso de fine-tuning supervisado sobre datos de persona.

## Capacidades

- Generación de texto conversacional en primera persona, restringida a los hechos del system prompt.
- Generación fundamentada ("grounded generation"): responde solo con la información de la hoja de hechos y rechaza el resto, derivando al correo público indicado en las reglas.
- Multilingüe: inglés, alemán, chino, japonés, francés, español, italiano y coreano.
- Ejecución en navegador mediante WebLLM y WebGPU, sin servidor.
- Modo de razonamiento desactivable: el ejemplo de uso pasa `enable_thinking: false` en `extra_body`, lo que implica que el modelo base dispone de un modo de pensamiento que puede activarse o desactivarse.
- Muestreo determinista recomendado: el ejemplo fija `temperature: 0` para maximizar la fidelidad a la hoja de hechos.
- Soporte de conversaciones multi-turno mediante el historial de mensajes (`...history`).

## Casos de uso

- Asistente de sitio web personal: se inyecta una hoja de hechos con biografía, proyectos y contacto, y el modelo responde a visitantes en primera persona. Es adecuado por su descarga de 310 MB y su ejecución en el cliente, sin coste de inferencia en servidor.
- Widget de preguntas frecuentes en documentación: la hoja de hechos se sustituye por los puntos clave de la documentación (menos de 2.000 tokens) y el modelo responde consultas acotadas, rechazando lo que no cubre.
- Demostraciones y portafolios interactivos: al ejecutarse con WebGPU en el navegador, permite publicar un chatbot funcional en una página estática sin backend ni claves de API.
- Prototipado de patrones de persona fundamentada: sirve para validar el diseño de reglas (`RULES`) y el formato de hoja de hechos antes de migrar a un modelo mayor.
- Aplicaciones con requisitos de privacidad: los hechos permanecen en el cliente y no se envían a ningún servidor, lo que encaja en contextos donde no se permite transmitir datos personales.
- Soporte multilingüe de bajo coste: con ocho idiomas declarados, puede atender consultas sobre una misma hoja de hechos en español, inglés, francés o japonés desde el mismo artefacto.
- Evaluación comparativa de cuantización q4f16_1 en el navegador: útil para medir calidad y latencia de un modelo de 0,8B cuantizado a 4 bits en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la descarga es de aproximadamente 310 MB en q4f16_1, por lo que la huella en memoria es del orden de cientos de MB más el estado de la ventana de contexto.
- GPU recomendadas: cualquier GPU con soporte de WebGPU (requisito de WebLLM); no se especifican modelos concretos.
- GPU de consumo: el tamaño reducido y la cuantización a 4 bits hacen plausible su ejecución en GPU integradas y dedicadas de consumo con WebGPU, aunque no se documentan cifras de rendimiento.
- Opciones de despliegue: WebLLM (navegador, WebGPU) y MLC-LLM; el repositorio incluye la librería `.wasm` específica (`qwen3_5-0.8b-q4f16_1-vocab51200-webgpu.wasm`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| grounded-persona-Qwen3.5-0.8B-q4f16_1-MLC | 0,8B | 4.096 tokens (configurado) | MLC-LLM / WebGPU | Apache 2.0 | Si (WebLLM + WebGPU) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | safetensors (formato habitual del base) | Apache 2.0 | No de forma nativa |
| Otros modelos MLC-LLM de ~1B | no disponible | no disponible | MLC-LLM | variable | Si |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Un modelo de 0,8B comete errores: la propia model card advierte de que puede equivocarse.
- Solo puede responder aquello que contiene la hoja de hechos; cualquier información ausente queda fuera de su alcance.
- La hoja de hechos debe mantenerse por debajo de unos 2.000 tokens para un funcionamiento correcto.
- Riesgo de alucinación inherente a modelos pequeños, mitigado parcialmente por `temperature: 0` y por las reglas de rechazo, pero no eliminado.
- El contexto configurado en el ejemplo es de 4.096 tokens, lo que limita el historial de conversación y el tamaño de la hoja de hechos combinados.
- Requiere un navegador con soporte de WebGPU; no funciona en entornos sin esa capacidad.
- El modelo no almacena hechos sobre ninguna persona: cualquier despliegue debe proporcionar su propia hoja de hechos.
- Licencia Apache 2.0, que permite uso comercial, pero las condiciones del modelo base Qwen3.5-0.8B deben verificarse por separado.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/yipengsun/grounded-persona-Qwen3.5-0.8B-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- WebLLM (repositorio): https://github.com/mlc-ai/web-llm
- CDN de WebLLM usado en el ejemplo: https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.86/lib/index.js

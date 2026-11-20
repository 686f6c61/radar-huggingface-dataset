# UGREENDEV/RK182X-LLM-glm-edge-1.5b-chat

## Resumen

RK182X-LLM-glm-edge-1.5b-chat es una conversión al formato RKNN del modelo GLM-Edge-1.5B-Chat de Zhipu AI (THUDM), publicada por UGREENDEV para su ejecución sobre las NPU Rockchip RK1820 y RK1828. No se trata de un modelo nuevo, sino de un derivado cuantizado y empaquetado para el runtime RKNN v1.1.0, orientado a despliegue en dispositivos edge con aceleración NPU en lugar de GPU convencional.

El modelo base es un transformer decoder-only de aproximadamente 1.500 millones de parámetros, ajustado para conversación (chat) y con una ventana de contexto de 8.192 tokens en esta configuración concreta. La conversión emplea cuantización de pesos w4a16 (pesos de 4 bits, activaciones de 16 bits) distribuida sobre 8 núcleos NPU, con KVCache en fp16.

Su relevancia es acotada pero específica: cubre el nicho de LLMs conversacionales ejecutables íntegramente en hardware Rockchip RK182X, un escenario donde las alternativas en formato GGUF o safetensors no son directamente utilizables. El repositorio tiene un tamaño de 1,2 GB y se distribuye bajo la licencia GLM-Edge, no Apache 2.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GLM-Edge), convertido a RKNN |
| Parametros totales | 1.5B (aproximado, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | GLM-Edge License (license: other) |
| Formato de pesos | RKNN (runtime v1.1.0), con config.json y SHA256SUMS |
| Nucleos NPU | 8 |
| Chips soportados | RK1820, RK1828 |
| Version de runtime | RKNN Runtime v1.1.0 |
| Modelo base | THUDM/glm-edge-1.5b-chat |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo GLM-Edge-1.5B-Chat de Zhipu AI, un transformer decoder-only de la familia GLM orientado a despliegue en dispositivos. Sobre esa base, UGREENDEV aplica una conversión con el toolkit RKNN que produce un grafo optimizado para la NPU Rockchip, con cuantización w4a16 y reparto en 8 núcleos. El KVCache se mantiene en fp16 para preservar la calidad de la generación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; esos detalles corresponden a la model card original de THUDM/glm-edge-1.5b-chat y no se reproducen en esta ficha. La innovación técnica del repositorio es exclusivamente de despliegue: empaquetado RKNN, verificación por SHA-256 y compatibilidad con el runtime v1.1.0, sin cambios en los pesos más allá de la cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste chat del modelo base.
- Razonamiento básico y respuesta a instrucciones en formato diálogo.
- Contexto de hasta 8.192 tokens, suficiente para conversaciones extensas o documentos cortos.
- Ejecución sobre NPU Rockchip RK1820 y RK1828 con el runtime RKNN v1.1.0.
- Compatibilidad con plantilla de chat e inferencia de demostración específicas del paquete.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades de agente o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en dispositivos embebidos: el modelo puede gestionar diálogos multi-turno de hasta 8.192 tokens directamente en la NPU RK1820/RK1828, sin necesidad de GPU ni conexión a la nube, lo que lo hace adecuado para electrodomésticos, paneles de control o terminales industriales.
- Procesamiento de lenguaje natural en el borde (edge NLP): clasificación de intenciones, resumen de textos cortos o extracción de entidades en local, aprovechando la cuantización w4a16 para reducir el consumo de memoria y energía.
- Interfaces de voz o texto para dispositivos IoT: integración del modelo como backend de un asistente local en hardware Rockchip, con latencia controlada por la NPU y sin dependencia de servicios externos.
- Prototipado de productos con NPU Rockchip: validación de pipelines de inferencia LLM sobre RK182X antes de escalar a producción, usando la verificación SHA-256 y el runtime v1.1.0 documentados.
- Sistemas de atención al cliente en kioscos o terminales físicos: conversaciones guiadas con contexto de 8k tokens para resolver consultas frecuentes sin salir del dispositivo.
- Investigación en eficiencia de despliegue: comparación de rendimiento y calidad entre el modelo base en fp16/GGUF y esta variante RKNN w4a16 sobre el mismo hardware, para estudiar el impacto de la cuantización en NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chips soportados: exclusivamente Rockchip RK1820 y RK1828. No es ejecutable en GPU convencional (NVIDIA, AMD) ni en CPU genérica mediante este paquete.
- VRAM estimada: no aplica; el modelo se ejecuta sobre NPU con memoria compartida del SoC. El repositorio ocupa 1,2 GB, lo que da una referencia del espacio de almacenamiento necesario.
- GPU recomendadas: no aplica (el paquete RKNN no está pensado para GPU).
- Compatibilidad con GPU de consumo: no; requiere NPU Rockchip RK182X.
- Opciones de despliegue: runtime RKNN v1.1.0 con el driver correspondiente, verificado mediante `rknn-smi -v`. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK182X-LLM-glm-edge-1.5b-chat | 1.5B | 8192 | RKNN w4a16 | GLM-Edge | NPU RK1820/RK1828 |
| THUDM/glm-edge-1.5b-chat | 1.5B | no disponible | safetensors | GLM-Edge | GPU/CPU genérica |
| Qwen2.5-1.5B-Instruct | 1.5B | 32768 (tipico) | safetensors, GGUF | Apache 2.0 | GPU/CPU genérica |
| Llama-3.2-1B-Instruct | 1.2B | 131072 (tipico) | safetensors, GGUF | Llama 3.2 Community | GPU/CPU genérica |

La comparación directa es limitada: las alternativas no ofrecen paquete RKNN y no se ejecutan en RK182X sin conversión propia. Los datos de contexto de Qwen2.5 y Llama-3.2 son los típicos publicados por sus autores y no se han verificado en esta ficha.

## Limitaciones y advertencias

- Dependencia estricta del hardware: solo funciona en RK1820 y RK1828 con el runtime RKNN v1.1.0 y el driver correspondiente; cualquier desajuste de versión impide la ejecución.
- Licencia GLM-Edge, no Apache 2.0: el uso comercial está sujeto a los términos de la licencia del modelo base, que deben revisarse antes de desplegar en producción.
- Restricciones adicionales del toolkit: los términos de licencia de RKNN Toolkit y RKNN Runtime también aplican al paquete.
- Cuantización w4a16: la reducción a 4 bits de pesos puede degradar la calidad respecto al modelo base en fp16, especialmente en razonamiento complejo o generación de código.
- Contexto limitado a 8.192 tokens: insuficiente para documentos largos o conversaciones muy extensas comparado con alternativas de 32k o 128k.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe sin evaluación previa.
- Riesgo de alucinación: inherente a un modelo de 1.5B; no se han publicado evaluaciones de fidelidad.
- Sesgos: no documentados en la información disponible.
- Verificación obligatoria: debe ejecutarse `sha256sum -c SHA256SUMS` y desplegar solo si todas las entradas muestran OK, según indica el autor.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de usuarios muy reducido, lo que limita el soporte comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-glm-edge-1.5b-chat
- Modelo base en Hugging Face: https://huggingface.co/THUDM/glm-edge-1.5b-chat
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-LLM-glm-edge-1.5b-chat --revision master`
- Documentación de configuración: subdirectorio `glm-edge-1.5b-chat-w4a16-8-8192/README.md` dentro del repositorio
- Licencia: archivo `LICENSE` en la raíz del repositorio
- Aviso legal y atribución: archivo `Notice` en la raíz del repositorio

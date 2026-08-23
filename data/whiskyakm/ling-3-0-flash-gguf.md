# WhiskyAKM/Ling-3.0-flash-GGUF

## Resumen

Ling-3.0-flash es un modelo de razonamiento híbrido nativo desarrollado por inclusionAI, con arquitectura MoE de atención lineal híbrida. Esta versión GGUF, publicada por WhiskyAKM, proporciona cuantizaciones listas para usar con llama.cpp, lo que permite desplegar el modelo localmente con distintos equilibrios de calidad y velocidad. El modelo original cuenta con 127,5 mil millones de parámetros totales y activa solo 5,1 mil millones por token, lo que lo sitúa en una categoría de alta eficiencia computacional para su tamaño.

La relevancia actual del modelo reside en su combinación de ventana de contexto nativa de 256K tokens (extensible a 1M), modo de razonamiento integrado y soporte de tool calling, todo bajo licencia MIT. Su arquitectura híbrida lineal, basada en la alternancia de capas Kimi Delta Attention (KDA) y Multi-Head Latent Attention (MLA), permite un escalado eficiente del contexto sin el coste cuadrático de la atención completa, lo que lo convierte en una opción atractiva para tareas de razonamiento con documentos extensos y agentes multi-paso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido lineal (KDA + MLA) |
| Parametros totales | 127.486.405.600 (127,5B) |
| Parametros activos | 5.100.000.000 (5,1B) |
| Longitud de contexto | 262.144 tokens (256K), extensible a 1M |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q4_0 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Ling-3.0-flash emplea una arquitectura MoE híbrida lineal desde el inicio del preentrenamiento, con un apilamiento alternado 5:1 de capas KDA y MLA. La configuración exacta es de 35 capas KDA y 7 capas MLA con gating diagonal fino en KDA y sparse MoE con ratio 1/64. El modelo cuenta con 512 expertos enrutados, 1 experto compartido y activa 8 expertos por token, con un tamaño oculto de 2560 y un vocabulario de 157.184 tokens.

El entrenamiento siguió un programa de contexto progresivo de 8K a 32K y finalmente 256K tokens, lo que permite una extensión hasta 1M. El modelo utiliza un formato de conversación estilo Bailing V3 con delimitadores por rol y tokens especiales para razonamiento y tool calling. Los parámetros de generación recomendados son temperatura 0,6, top-p 0,95 y top-k 20.

## Capacidades

- Generación de texto y razonamiento multilingüe en inglés y chino.
- Modo de razonamiento integrado (thinking mode), habilitado por defecto, que genera un bloque de razonamiento entre los tokens think y answer antes de dar la respuesta final. Se controla mediante `detailed thinking on` / `detailed thinking off` en el system prompt o mediante `chat_template_kwargs`.
- Tool calling / function calling: las definiciones de herramientas se inyectan en el system prompt mediante etiquetas XML `<tools>`, y el modelo responde con bloques de función con parámetros. Los resultados se devuelven por el canal de rol observation.
- Ventana de contexto de 256K tokens nativa, extensible a 1M, adecuada para documentos largos y conversaciones multi-turno extensas.
- Eficiencia computacional: al activar solo 5,1B de los 127,5B parámetros, ofrece una latencia por token relativamente baja para su tamaño total, con un rendimiento comparable a modelos mucho más grandes en tareas de razonamiento.
- Compatibilidad con llama.cpp y OpenAI-compatible API a través de llama-server.

## Casos de uso

- Análisis de documentos extensos: la ventana de contexto de 256K permite procesar contratos, informes financieros o corpus legales completos en una sola pasada, sin necesidad de dividir el texto. El modo de razonamiento ayuda a extraer conclusiones estructuradas.
- Agentes autónomos multi-paso: el soporte de tool calling y el razonamiento integrado permiten construir agentes que planifican, llaman a funciones externas (búsqueda, APIs, bases de datos) y evalúan observaciones en bucle, todo con el contexto completo de la sesión.
- Asistente de programación con contexto de repositorio: con 256K de contexto se puede cargar el código fuente completo de un proyecto de tamaño medio y solicitar refactorizaciones, generación de tests o explicaciones de arquitectura.
- Traducción y procesamiento de lenguaje natural bilingüe (en-zh): adecuado para pipelines de localización de productos que requieren mantener coherencia de terminología en largos documentos técnicos.
- Razonamiento matemático y científico: el modo de razonamiento permite desglosar problemas complejos paso a paso, útil para tutoría educativa o verificación de demostraciones.
- Despliegue local con privacidad de datos: gracias a la licencia MIT y al formato GGUF, se puede ejecutar en infraestructura propia mediante llama.cpp o llama-server, sin depender de APIs externas, ideal para entornos con requisitos de confidencialidad.
- Generación de informes técnicos y documentación: el modelo puede estructurar informes extensos con secciones coherentes, aprovechando el contexto largo para mantener consistencia temática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos en la información proporcionada. Una fuente externa (benchable.ai) indica que el modelo se sitúa en el percentil 78 de velocidad entre ocho benchmarks comparados, pero no se ofrecen cifras concretas de MMLU, HumanEval, GSM8K u otros. No se pueden presentar datos numéricos fiables sin riesgo de invención.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - BF16: ~238 GB (fuera de alcance de hardware de consumo)
  - Q8_0: ~127 GB
  - Q6_K: ~98 GB
  - Q5_K_M: ~85 GB
  - Q4_K_M: ~72 GB
  - Q4_K_S: ~68 GB
  - Q4_0: ~68 GB
- GPU recomendadas: para Q4_K_M o inferior se necesitan configuraciones multi-GPU profesionales (por ejemplo, 2x A100 80GB, 4x RTX 4090 24GB, o hardware de datacenter como H100). No cabe en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), compatible con Ollama y otras herramientas basadas en llama.cpp. También puede servir con endpoints compatibles con OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia, al activar solo 5,1B parámetros por token, la latencia debería ser notablemente menor que la de un modelo denso de 124B, pero dependerá del hardware y de la cuantización.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables en la información proporcionada. El modelo es comparable en concepto a otros MoE de gran tamaño con contexto largo, como Mixtral 8x22B o DeepSeek-V3, pero no se han publicado comparativas directas de rendimiento ni de latencia en la documentación disponible.

## Limitaciones y advertencias

- El modelo solo soporta inglés y chino; no se ha entrenado específicamente para otros idiomas, incluido el español. El uso en español puede producir resultados de calidad inferior.
- El modo de razonamiento está habilitado por defecto, lo que genera tokens adicionales de razonamiento antes de la respuesta final. Esto puede aumentar la latencia percibida en aplicaciones en tiempo real si no se desactiva explícitamente.
- El tamaño total del repositorio es de 1702,6 GB, lo que implica descargas muy pesadas y requiere planificación de almacenamiento.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye bajo términos de la licencia del modelo original (inclusionAI), que debe verificarse en la página de HuggingFace del modelo base para posibles restricciones adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño, especialmente en tareas de razonamiento matemático o factual sin verificación externa.
- La cuantización Q4_0 es la más rápida pero con la menor calidad; se recomienda Q4_K_M o Q5_K_M para un equilibrio adecuado en producción.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/WhiskyAKM/Ling-3.0-flash-GGUF
- Modelo original: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Documentación del modelo Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Página de benchmarks externa: https://benchable.ai/models/inclusionai/ling-3.0-flash-20260723
- Noticia sobre la integración en llama.cpp: https://baguaai.com/ling-3-0-merged-into-llama-cpp-a-new-frontier-for-localized-reasoning-models/

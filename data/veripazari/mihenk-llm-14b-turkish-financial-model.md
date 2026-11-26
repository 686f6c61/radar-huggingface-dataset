# veripazari/Mihenk-LLM-14B-Turkish-Financial-Model

## Resumen

Mihenk-LLM-14B-Turkish-Financial-Model es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-14B, especializado en finanzas, criptomonedas y mercados bursátiles, con capacidad de operar en turco e inglés. Lo desarrolla originalmente AlicanKiraz0 y esta version concreta la archiva y redistribuye la plataforma VeriPazarı, que mantiene la documentacion original y publica pesos en formato GGUF para su uso con llama.cpp. El modelo resuelve la necesidad de un asistente financiero que domine el contexto regulatorio turco (SPK, BDDK, TCMB, TMSF) y los mercados globales, algo que los modelos genericos no cubren con la suficiente precision terminologica.

La arquitectura subyacente es la de Qwen3-14B, un transformer denso de aproximadamente 14.768 millones de parametros, con una ventana de contexto que hereda del modelo base. El ajuste se realizo mediante Supervised Fine-Tuning (SFT) seguido de Reinforcement Learning from AI Feedback (RLAIF), con un dataset equilibrado entre ecosistema cripto, BIST y mercados turcos, NASDAQ y mercados estadounidenses, analisis tecnico y fundamental, gestion de riesgos y regulacion.

Su relevancia actual radica en dos factores: por un lado, cubre un nicho escasamente atendido como es la interseccion entre el idioma turco y el dominio financiero; por otro, se distribuye con licencia MIT y en formato GGUF, lo que facilita el despliegue local sin dependencias de infraestructura propietaria. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y de baja difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-14B) |
| Parametros totales | 14.768.307.200 (~14,77 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-14B) |
| Tipos de cuantizacion | GGUF (repo etiquetado como gguf y llama-cpp); niveles concretos no disponibles |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 15,7 GB); safetensors referenciado en los metadatos de parametros |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B, un transformer denso de aproximadamente 14,77 mil millones de parametros. Sobre esa base se aplico un proceso de ajuste en dos fases. La primera, Supervised Fine-Tuning (SFT), utilizo un dataset propio de pares instruccion-respuesta de alta calidad en el dominio financiero, con distribucion equilibrada entre seis categorias: ecosistema de criptomonedas (monedas principales, DeFi, Layer 2), BIST y mercados turcos, NASDAQ y mercados estadounidenses, mercados globales, analisis tecnico y fundamental, y gestion de riesgos y regulacion.

La segunda fase consistio en Reinforcement Learning from AI Feedback (RLAIF), orientada a mejorar la calidad de las respuestas y a que el modelo adopte un tono equilibrado y consciente del riesgo al emitir informacion financiera. La model card no especifica el volumen de tokens de entrenamiento, la composicion exacta del dataset ni los detalles del pipeline de RLAIF (modelo evaluador, funcion de recompensa, numero de iteraciones). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; las capacidades de razonamiento y modo thinking proceden del modelo base Qwen3.

## Capacidades

- Generacion de texto y razonamiento en turco e ingles, con especializacion en terminologia financiera.
- Conocimiento de criptomonedas: Bitcoin, Ethereum, altcoins, protocolos DeFi, soluciones Layer 2, NFT y ecosistema GameFi.
- Conocimiento de mercados bursatiles: BIST 100, NASDAQ, S&P 500, analisis de acciones, ETF y estrategias con opciones.
- Analisis tecnico: formaciones chartistas, indicadores (RSI, MACD, Bandas de Bollinger), ondas de Elliott y herramientas de Fibonacci.
- Analisis fundamental: ratios de valoracion (P/E, P/B), analisis de estados financieros, DCF y tokenomics.
- Gestion de riesgos: optimizacion de cartera, dimensionamiento de posiciones y estrategias de cobertura.
- Regulacion: marcos SPK, SEC y MiCA, ademas de fiscalidad.
- Capacidad de razonamiento multi-paso heredada de Qwen3 (modo thinking del modelo base, no documentado explicitamente en esta model card).
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada, aunque el modelo base Qwen3 lo soporta.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Educacion de inversores: el modelo explica conceptos de cripto y bolsa a usuarios sin experiencia, adaptando el nivel de detalle y anadiendo el aviso obligatorio de que la informacion no constituye asesoramiento financiero.
- Asistente de analisis tecnico: responde consultas sobre formaciones chartistas e indicadores concretos (RSI, MACD, Bollinger), lo que resulta util en herramientas de soporte a traders que necesitan explicaciones conceptuales rapidas.
- Interpretacion de dinamicas de mercado: ayuda a comprender el contexto de movimientos de precios y factores macro, con la advertencia explicita de que no realiza predicciones de precio futuras.
- Evaluacion de riesgos de estrategias: describe tecnicas de optimizacion de cartera, dimensionamiento de posiciones y cobertura, adecuado para talleres de formacion interna en entidades financieras.
- Guia regulatoria para el mercado turco: resume obligaciones bajo SPK, BDDK, TCMB y TMSF, asi como marcos internacionales como MiCA y SEC, util para equipos de compliance que necesitan una primera orientacion.
- Generacion de material formativo: produce contenido didactico sobre finanzas en turco, un idioma con menor cobertura en modelos generalistas, para cursos, newsletters o documentacion interna.
- Atencion al cliente en entidades financieras turcas: gestiona conversaciones multi-turno en turco sobre productos y conceptos financieros, siempre que se configure el system prompt con las restricciones de alcance que documenta el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16 (unos 29,5 GB para 14,77 mil millones de parametros) se requieren al menos 32 GB de VRAM. En cuantizacion de 8 bits, aproximadamente 16 GB; en 4 bits, en torno a 9-10 GB. Estas cifras son estimaciones por tamano y no estan confirmadas en la model card.
- GPU recomendadas: A100 (40 o 80 GB), H100 o L40S para FP16 sin cuantizar. Para cuantizaciones de 8 y 4 bits, una RTX 4090 (24 GB) o una RTX 3090 son suficientes.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y, con cuantizaciones agresivas de 4 bits, potencialmente en GPU con 12 GB, aunque con margen ajustado para el contexto.
- Opciones de despliegue: llama.cpp y Ollama por la distribucion en GGUF; vLLM y TGI si se dispone de los pesos en safetensors; el repo esta marcado como endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Mihenk-LLM-14B | ~14,77 B | No disponible | Finanzas turco/ingles | MIT | GGUF |
| Qwen3-14B (base) | ~14,77 B | No disponible | Generalista multilingue | No disponible en la informacion | Safetensors, GGUF |
| Modelos financieros genericos en ingles | No disponible | No disponible | Finanzas en ingles | Variable | Variable |

La comparacion directa con alternativas especializadas en finanzas en turco no esta disponible en la informacion proporcionada. Frente a su modelo base, Mihenk-LLM anade especializacion de dominio y un system prompt orientado a la prevencion de alucinaciones regulatorias, a costa de un alcance tematico mas restringido.

## Limitaciones y advertencias

- Riesgo de alucinacion en datos concretos: tipos de interes, tipos impositivos, limites regulatorios y cifras de mercado pueden ser inexactos o estar desactualizados; el propio system prompt del autor instruye al modelo a declarar desconocimiento en esos casos, pero no lo garantiza.
- Sesgo de dominio: el ajuste se centra en finanzas turcas y globales, por lo que el rendimiento fuera de ese ambito puede degradarse respecto al modelo base.
- Cobertura linguistica limitada a turco e ingles; no se documenta soporte para otros idiomas.
- No es asesoramiento financiero: el modelo no debe usarse para recomendaciones personalizadas de inversion, fiscalidad individual ni prediccion de precios, tal como advierte el autor.
- Licencia MIT: permite uso comercial, pero el usuario asume la responsabilidad sobre el cumplimiento regulatorio del sector financiero en su jurisdiccion.
- Procedencia y mantenimiento: es un archivo redistribuido por VeriPazarı del trabajo original de AlicanKiraz0; conviene verificar si el repositorio original recibe actualizaciones.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base en tareas financieras.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/veripazari/Mihenk-LLM-14B-Turkish-Financial-Model
- Repositorio original del autor: https://huggingface.co/AlicanKiraz0/Mihenk-LLM-14B-Turkish-Financial-Model
- Plataforma del compilador: https://veripazari.com.tr
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
